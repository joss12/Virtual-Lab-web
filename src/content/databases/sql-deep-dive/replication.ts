export const content = {
  en: `# Replication

## Why Replication Exists

A single database server is a single point of failure. Replication solves three problems simultaneously:

\`\`\`
1. High Availability  — if primary fails, a replica can take over
2. Read Scaling       — distribute read queries across multiple replicas
3. Disaster Recovery  — geographically distributed copies survive datacenter failures

Single server:          Replicated:
  [App] → [DB]           [App] → [Primary DB]
                                      ↓ replicate
                              [Replica 1] [Replica 2]
                              (read)      (standby)
\`\`\`

## Physical vs Logical Replication

This is the most fundamental distinction in replication design.

### Physical Replication (Streaming Replication)
Replicates **raw bytes** — exact copies of WAL records (PostgreSQL) or binary log pages (MySQL). The replica is a byte-for-byte copy of the primary.

\`\`\`
Primary:  WAL record: "page 42, offset 128, write bytes [0xAB 0xCD...]"
              ↓ stream
Replica:  apply same bytes to same page at same offset
\`\`\`

**Characteristics:**
- Replica must run the same major database version
- Replica must run on the same CPU architecture (x86 → x86)
- Replica is read-only — cannot have different indexes or schema
- Very low replication lag (milliseconds)
- Simple to set up and operate

### Logical Replication
Replicates **logical changes** — decoded as SQL-level operations (INSERT, UPDATE, DELETE on specific tables with specific values).

\`\`\`
Primary:  WAL record decoded to: "INSERT INTO orders (id,total) VALUES (42, 99.99)"
              ↓ stream logical changes
Replica:  execute equivalent INSERT
\`\`\`

**Characteristics:**
- Replica can run a different major PostgreSQL version
- Can replicate to a different database system entirely (PostgreSQL → Kafka, PostgreSQL → MySQL)
- Can replicate a subset of tables
- Replica can have different indexes, additional columns, different partitioning
- Slightly higher overhead (WAL decoding)
- Supports **bi-directional** replication scenarios

## PostgreSQL Streaming Replication

### Setup Architecture
\`\`\`
Primary (postgresql.conf):
  wal_level = replica          # minimum for streaming replication
  max_wal_senders = 10         # max concurrent replication connections
  wal_keep_size = 1GB          # keep this much WAL for lagging replicas

Primary (pg_hba.conf):
  host replication replicator 192.168.1.0/24 scram-sha-256

Replica (recovery.conf / postgresql.conf in PG12+):
  primary_conninfo = 'host=primary port=5432 user=replicator'
  hot_standby = on             # allow read queries on replica
\`\`\`

### WAL Sender / WAL Receiver
\`\`\`
Primary:
  WAL Writer → WAL files
      ↓
  WAL Sender process (one per replica)
      ↓ TCP stream
Replica:
  WAL Receiver process
      ↓
  WAL files → Startup process applies WAL
      ↓
  Data files (replica state)
\`\`\`

### Replication Modes

**Asynchronous (default):**
\`\`\`
Primary: COMMIT → return success to client → send WAL to replica
                                    ↑
                          does NOT wait for replica confirmation
                          
Risk: if primary crashes before replica receives WAL → data loss
Benefit: no added latency on primary writes
\`\`\`

**Synchronous:**
\`\`\`sql
-- postgresql.conf
synchronous_standby_names = 'FIRST 1 (replica1, replica2)'
-- COMMIT waits until at least 1 replica confirms WAL received

synchronous_commit = on       -- wait for replica WAL write
synchronous_commit = remote_write  -- wait for replica OS buffer (faster, slight risk)
synchronous_commit = remote_apply  -- wait for replica to apply WAL (strongest)
\`\`\`

\`\`\`
Synchronous commit timeline:
Primary: BEGIN → writes → COMMIT
                              ↓ send WAL
                         Replica: receive WAL → confirm
                              ↓ (wait)
Primary:              ← receive confirmation → return to client
\`\`\`

**The tradeoff:** synchronous replication adds the network round-trip to every commit. On a 1ms network, every write gets +1ms latency. For a write-heavy workload at 5000 TPS, this is often unacceptable.

### Replication Lag Monitoring
\`\`\`sql
-- On primary: check replica lag
SELECT 
  application_name,
  client_addr,
  state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  pg_wal_lsn_diff(sent_lsn, replay_lsn) AS replication_lag_bytes,
  write_lag,
  flush_lag,
  replay_lag
FROM pg_stat_replication;

-- On replica: check own lag
SELECT 
  now() - pg_last_xact_replay_timestamp() AS replication_delay,
  pg_is_in_recovery() AS is_replica,
  pg_last_wal_replay_lsn() AS replay_lsn;
\`\`\`

### Replication Slots
Without replication slots, if a replica falls behind and the primary recycles WAL, the replica cannot catch up — it must be rebuilt. Replication slots prevent WAL recycling until the slot consumer has processed it.

\`\`\`sql
-- Create a replication slot
SELECT pg_create_physical_replication_slot('replica1_slot');

-- View slots (WARNING: unconsumed slots cause WAL accumulation → disk full!)
SELECT slot_name, slot_type, active, restart_lsn,
       pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) AS retained_bytes
FROM pg_replication_slots;

-- Drop a slot if replica is decommissioned
SELECT pg_drop_replication_slot('replica1_slot');
\`\`\`

**Danger:** A replication slot for a dead replica will hold WAL forever. Monitor \`retained_bytes\` — if it grows unbounded, your disk will fill up.

## PostgreSQL Logical Replication

### Publication / Subscription Model
\`\`\`sql
-- On primary: create a publication
CREATE PUBLICATION orders_pub FOR TABLE orders, order_items;
-- or replicate everything:
CREATE PUBLICATION all_tables FOR ALL TABLES;

-- On replica: create a subscription
CREATE SUBSCRIPTION orders_sub
  CONNECTION 'host=primary dbname=mydb user=replicator'
  PUBLICATION orders_pub;

-- Monitor subscription lag
SELECT subname, received_lsn, latest_end_lsn,
       pg_wal_lsn_diff(latest_end_lsn, received_lsn) AS lag_bytes
FROM pg_stat_subscription;
\`\`\`

### Use Cases for Logical Replication
\`\`\`
Zero-downtime major version upgrades:
  PG 15 primary → logical replication → PG 16 replica
  When ready: stop writes, wait for lag=0, promote PG16, redirect app

Cross-version analytics:
  Production (PG 15) → logical replication → Analytics DB (PG 16 + columnar extension)

CDC (Change Data Capture):
  PostgreSQL → pgoutput logical decoder → Kafka → data warehouse
  Tools: Debezium, pglogical, wal2json
\`\`\`

## MySQL Binary Log Replication

MySQL replication is based on the **binary log** (binlog), which records all changes to the database.

### Binlog Formats
\`\`\`
STATEMENT: logs the SQL statement itself
  Advantage: compact log
  Disadvantage: non-deterministic functions (NOW(), RAND()) can produce different
                results on replica → data divergence

ROW: logs the actual row changes (before/after values)
  Advantage: exact, deterministic
  Disadvantage: large for bulk operations (UPDATE with 1M rows = 1M log entries)

MIXED: uses STATEMENT by default, switches to ROW for non-deterministic statements
  Default since MySQL 5.7.7

Best practice: use ROW format for correctness
\`\`\`

\`\`\`sql
SET GLOBAL binlog_format = 'ROW';
SHOW BINARY LOGS;
SHOW BINLOG EVENTS IN 'mysql-bin.000001' LIMIT 20;
\`\`\`

### GTID Replication (MySQL 5.6+)
Global Transaction Identifiers replace file+offset position tracking:

\`\`\`
Traditional: "I've replicated up to mysql-bin.000042, position 4127"
  Problem: after failover, new primary has different file/position

GTID: "I've replicated all transactions up to server-uuid:1-10432"
  After failover: replica automatically finds correct position on new primary
\`\`\`

\`\`\`sql
-- Enable GTID
gtid_mode = ON
enforce_gtid_consistency = ON

-- Check GTID status
SHOW MASTER STATUS\\G
-- Executed_Gtid_Set: 3E11FA47-71CA-11E1-9E33-C80AA9429562:1-37

-- Replica status
SHOW REPLICA STATUS\\G
-- Retrieved_Gtid_Set, Executed_Gtid_Set, Seconds_Behind_Source
\`\`\`

## Failover and Promotion

### Manual Failover (PostgreSQL)
\`\`\`bash
# On replica: promote to primary
pg_ctl promote -D /var/lib/postgresql/data
# or
touch /var/lib/postgresql/data/promote  # trigger file

# Verify promotion
psql -c "SELECT pg_is_in_recovery();"
-- returns: f (false = now primary)
\`\`\`

### Automatic Failover Tools
\`\`\`
Patroni (PostgreSQL):
  - Uses etcd/Consul/ZooKeeper for distributed consensus
  - Automatic leader election
  - Prevents split-brain (two nodes thinking they're primary)
  - Industry standard for production PostgreSQL HA

Orchestrator (MySQL):
  - Topology-aware failover
  - Handles replication chains (primary → replica → replica)
  - Web UI and REST API

ProxySQL (MySQL):
  - Sits between app and database
  - Automatically routes writes to primary, reads to replicas
  - Handles failover transparently to the application
\`\`\`

### Split-Brain Problem
\`\`\`
Scenario: network partition between primary and replica

Primary: "I can't reach replica, but I'm still primary, accepting writes"
Replica: "I can't reach primary, I'll promote myself"

Both nodes accept writes → data diverges → catastrophe

Prevention:
  - Fencing (STONITH): physically power off old primary before promoting replica
  - Lease-based: primary must renew lease; if it can't reach quorum, it stops
  - Patroni uses etcd distributed lock: only one node can hold the leader key
\`\`\`

## Read Replica Patterns

\`\`\`sql
-- Application routing pattern:
-- Writes → primary
-- Reads  → replica (with replication lag tolerance)

-- In application code:
primary_db   = connect("primary:5432")
replica_db   = connect("replica:5432")

def get_user(id):
    return replica_db.query("SELECT * FROM users WHERE id = ?", id)
    # Acceptable: user profile rarely changes, slight staleness OK

def update_user_balance(id, amount):
    primary_db.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", amount, id)
    # Must use primary: immediate consistency required

-- Session consistency problem:
-- User updates their name → write goes to primary
-- User refreshes page → read goes to replica → sees old name!
-- Solution: route to primary for a short window after write
--           or use synchronous replication for critical data
\`\`\`
`,

  fr: `# Réplication

## Pourquoi la réplication existe

Un seul serveur de base de données est un point de défaillance unique. La réplication résout trois problèmes simultanément :

\`\`\`
1. Haute disponibilité  — si le primaire tombe, un réplica peut prendre le relais
2. Scalabilité en lecture — distribuer les requêtes de lecture sur plusieurs réplicas
3. Récupération après sinistre — des copies géographiquement distribuées survivent aux pannes de datacenter
\`\`\`

## Réplication physique vs logique

### Réplication physique (Streaming Replication)
Réplique les **octets bruts** — copies exactes des enregistrements WAL.

\`\`\`
Primaire : enregistrement WAL : "page 42, offset 128, écrire octets [0xAB 0xCD...]"
               ↓ stream
Réplica :  appliquer les mêmes octets à la même page au même offset
\`\`\`

**Caractéristiques :**
- Le réplica doit utiliser la même version majeure
- Le réplica est en lecture seule
- Très faible lag de réplication (millisecondes)

### Réplication logique
Réplique les **changements logiques** — décodés comme des opérations SQL.

\`\`\`
Primaire : enregistrement WAL décodé : "INSERT INTO orders VALUES (42, 99.99)"
               ↓ stream changements logiques
Réplica :  exécuter l'INSERT équivalent
\`\`\`

**Caractéristiques :**
- Peut répliquer vers une version différente de PostgreSQL
- Peut répliquer vers un système de base de données différent
- Peut répliquer un sous-ensemble de tables
- Supporte la réplication **bi-directionnelle**

## Réplication en streaming PostgreSQL

### Modes de réplication

**Asynchrone (défaut) :**
\`\`\`
Primaire : COMMIT → retourner succès au client → envoyer WAL au réplica
Risque : si le primaire plante avant que le réplica reçoive le WAL → perte de données
\`\`\`

**Synchrone :**
\`\`\`sql
synchronous_standby_names = 'FIRST 1 (replica1, replica2)'
synchronous_commit = on            -- attendre l'écriture WAL du réplica
synchronous_commit = remote_write  -- attendre le buffer OS du réplica
synchronous_commit = remote_apply  -- attendre l'application WAL (le plus fort)
\`\`\`

### Slots de réplication
Sans slots, si un réplica prend du retard et que le primaire recycle le WAL, le réplica ne peut pas rattraper son retard.

\`\`\`sql
SELECT pg_create_physical_replication_slot('replica1_slot');

-- ATTENTION : les slots non consommés causent une accumulation WAL → disque plein !
SELECT slot_name, active,
       pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) AS octets_retenus
FROM pg_replication_slots;
\`\`\`

## Réplication logique PostgreSQL

### Modèle Publication / Abonnement
\`\`\`sql
-- Sur le primaire : créer une publication
CREATE PUBLICATION orders_pub FOR TABLE orders, order_items;

-- Sur le réplica : créer un abonnement
CREATE SUBSCRIPTION orders_sub
  CONNECTION 'host=primary dbname=mydb user=replicator'
  PUBLICATION orders_pub;
\`\`\`

### Cas d'utilisation
\`\`\`
Mises à jour de version majeure sans downtime :
  PG 15 primaire → réplication logique → PG 16 réplica
  Quand prêt : arrêter les écritures, attendre lag=0, promouvoir PG16

CDC (Change Data Capture) :
  PostgreSQL → décodeur logique pgoutput → Kafka → data warehouse
  Outils : Debezium, pglogical, wal2json
\`\`\`

## Réplication MySQL par Binary Log

### Formats de Binlog
\`\`\`
STATEMENT : enregistre l'instruction SQL elle-même
  Inconvénient : fonctions non déterministes (NOW(), RAND()) peuvent produire
                 des résultats différents sur le réplica → divergence de données

ROW : enregistre les changements réels de lignes (valeurs avant/après)
  Avantage : exact, déterministe
  Inconvénient : volumineux pour les opérations en masse

MIXED : utilise STATEMENT par défaut, bascule en ROW pour les instructions
        non déterministes
\`\`\`

### Réplication GTID (MySQL 5.6+)
Les Global Transaction Identifiers remplacent le suivi par fichier+offset :

\`\`\`
Traditionnel : "J'ai répliqué jusqu'à mysql-bin.000042, position 4127"
  Problème : après failover, le nouveau primaire a un fichier/position différent

GTID : "J'ai répliqué toutes les transactions jusqu'à server-uuid:1-10432"
  Après failover : le réplica trouve automatiquement la bonne position
\`\`\`

## Failover et promotion

### Outils de failover automatique
\`\`\`
Patroni (PostgreSQL) :
  - Utilise etcd/Consul/ZooKeeper pour le consensus distribué
  - Élection automatique du leader
  - Prévient le split-brain
  - Standard industriel pour la HA PostgreSQL en production

ProxySQL (MySQL) :
  - Routage automatique des écritures vers le primaire, lectures vers les réplicas
  - Gère le failover de façon transparente pour l'application
\`\`\`

### Problème du Split-Brain
\`\`\`
Scénario : partition réseau entre primaire et réplica

Primaire : "Je ne peux pas joindre le réplica, mais je suis toujours primaire"
Réplica :  "Je ne peux pas joindre le primaire, je vais me promouvoir"

Les deux nœuds acceptent des écritures → les données divergent → catastrophe

Prévention :
  - Fencing (STONITH) : éteindre physiquement l'ancien primaire avant promotion
  - Patroni utilise un verrou distribué etcd : un seul nœud peut tenir la clé leader
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the fundamental difference between physical and logical replication?",
      options: [
        "Physical replication is faster; logical replication is more reliable",
        "Physical replication copies raw WAL bytes making an exact byte-for-byte replica; logical replication copies decoded SQL-level changes allowing cross-version and cross-platform replication",
        "Physical replication works for reads; logical replication works for writes",
        "Physical replication requires a replication slot; logical replication does not",
      ],
      correct: 1,
    },
    {
      question:
        "What is the danger of leaving a replication slot for a decommissioned replica?",
      options: [
        "The slot will corrupt the primary's WAL files",
        "The slot prevents the primary from accepting new connections",
        "The slot prevents WAL recycling — WAL accumulates indefinitely until disk is full",
        "The slot causes the primary to enter read-only mode",
      ],
      correct: 2,
    },
    {
      question:
        "Why is MySQL's STATEMENT binlog format dangerous for replication?",
      options: [
        "Statement logs are too large and fill disk quickly",
        "Non-deterministic functions like NOW() and RAND() can produce different values on the replica, causing data divergence",
        "Statement format does not support DDL operations",
        "Replicas cannot parse SQL statements from a different MySQL version",
      ],
      correct: 1,
    },
    {
      question:
        "What is the split-brain problem in database replication and how does Patroni prevent it?",
      options: [
        "Split-brain occurs when two replicas have different data; Patroni prevents this with checksums",
        "Split-brain occurs when a network partition causes both primary and replica to believe they are the primary and accept writes; Patroni uses a distributed etcd lock so only one node can hold the leader key",
        "Split-brain occurs when replication lag exceeds 1 second; Patroni prevents this with synchronous replication",
        "Split-brain occurs when the WAL fills up; Patroni prevents this by automatically running CHECKPOINT",
      ],
      correct: 1,
    },
    {
      question:
        "What is the session consistency problem with read replicas and how is it solved?",
      options: [
        "Read replicas cannot handle session variables — solved by disabling session-level settings",
        "After a user writes data to the primary, reading from a replica may return stale data before replication catches up — solved by routing to primary for a short window after writes or using synchronous replication for critical data",
        "Read replicas do not support transactions — solved by using autocommit mode",
        "Session data is not replicated — solved by storing sessions in Redis instead",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quelle est la différence fondamentale entre réplication physique et logique ?",
      options: [
        "La réplication physique est plus rapide ; la réplication logique est plus fiable",
        "La réplication physique copie les octets WAL bruts créant une copie exacte octet par octet ; la réplication logique copie les changements décodés au niveau SQL permettant la réplication cross-version et cross-plateforme",
        "La réplication physique fonctionne pour les lectures ; la réplication logique pour les écritures",
        "La réplication physique nécessite un slot de réplication ; la réplication logique non",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est le danger de laisser un slot de réplication pour un réplica décommissionné ?",
      options: [
        "Le slot va corrompre les fichiers WAL du primaire",
        "Le slot empêche le primaire d'accepter de nouvelles connexions",
        "Le slot empêche le recyclage WAL — le WAL s'accumule indéfiniment jusqu'à remplir le disque",
        "Le slot fait entrer le primaire en mode lecture seule",
      ],
      correct: 2,
    },
    {
      question:
        "Pourquoi le format de binlog STATEMENT de MySQL est-il dangereux pour la réplication ?",
      options: [
        "Les logs de statements sont trop volumineux et remplissent le disque rapidement",
        "Les fonctions non déterministes comme NOW() et RAND() peuvent produire des valeurs différentes sur le réplica, causant une divergence des données",
        "Le format statement ne supporte pas les opérations DDL",
        "Les réplicas ne peuvent pas analyser les instructions SQL d'une version différente de MySQL",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce que le problème du split-brain et comment Patroni le prévient-il ?",
      options: [
        "Le split-brain se produit quand deux réplicas ont des données différentes ; Patroni le prévient avec des checksums",
        "Le split-brain se produit quand une partition réseau fait croire au primaire et au réplica qu'ils sont tous deux le primaire et qu'ils acceptent des écritures ; Patroni utilise un verrou etcd distribué pour qu'un seul nœud puisse tenir la clé leader",
        "Le split-brain se produit quand le lag de réplication dépasse 1 seconde ; Patroni le prévient avec la réplication synchrone",
        "Le split-brain se produit quand le WAL se remplit ; Patroni le prévient en exécutant automatiquement CHECKPOINT",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est le problème de cohérence de session avec les réplicas de lecture et comment est-il résolu ?",
      options: [
        "Les réplicas de lecture ne peuvent pas gérer les variables de session — résolu en désactivant les paramètres au niveau session",
        "Après qu'un utilisateur écrit des données sur le primaire, lire depuis un réplica peut retourner des données obsolètes avant que la réplication rattrape son retard — résolu en routant vers le primaire pendant une courte fenêtre après les écritures ou en utilisant la réplication synchrone pour les données critiques",
        "Les réplicas de lecture ne supportent pas les transactions — résolu en utilisant le mode autocommit",
        "Les données de session ne sont pas répliquées — résolu en stockant les sessions dans Redis",
      ],
      correct: 1,
    },
  ],
};
