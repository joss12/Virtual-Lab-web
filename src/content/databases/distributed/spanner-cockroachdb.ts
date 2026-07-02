export const content = {
  en: `# Spanner & CockroachDB

## Why These Databases Matter

Google Spanner (2012) and CockroachDB (2015, inspired by Spanner) represent the current frontier of distributed database design: **globally distributed, strongly consistent, SQL-compliant, horizontally scalable**. Before Spanner, these properties were considered mutually exclusive.

\`\`\`
Before Spanner — the tradeoffs:
  Strong consistency + SQL  → single node or 2PC (no horizontal scale)
  Horizontal scale          → eventual consistency (Cassandra, DynamoDB)
  Global distribution       → high latency or weak consistency

Spanner's claim:
  Globally distributed + strongly consistent + SQL + horizontal scale
  
  "Spanner is the first system to distribute data at global scale and
   support externally-consistent distributed transactions."
   — Corbett et al., OSDI 2012
\`\`\`

## Google Spanner Architecture

### Physical Infrastructure

\`\`\`
Deployment hierarchy:
  Universe (all Spanner deployments)
    └── Zone (deployment unit, typically one datacenter)
          ├── Zonemaster (assigns tablets to spanservers)
          ├── Location proxy (helps clients find tablets)
          └── Spanservers (100-1000s per zone, store tablet data)
              └── Tablet (unit of data, B-tree of key-value pairs)

Each tablet is replicated via Paxos across multiple zones (typically 5):
  Zone 1 (us-east):   Paxos replica
  Zone 2 (us-central): Paxos replica  ← Paxos leader
  Zone 3 (us-west):   Paxos replica
  Zone 4 (eu-west):   Paxos replica
  Zone 5 (asia-east): Paxos replica
\`\`\`

### Data Organization

\`\`\`sql
-- Spanner schema — tables must have a primary key
CREATE TABLE Users (
  UserId    INT64 NOT NULL,
  Name      STRING(MAX),
  Email     STRING(MAX)
) PRIMARY KEY (UserId);

-- Interleaved tables (physical co-location)
CREATE TABLE Albums (
  UserId    INT64 NOT NULL,
  AlbumId   INT64 NOT NULL,
  Title     STRING(MAX)
) PRIMARY KEY (UserId, AlbumId),
  INTERLEAVE IN PARENT Users ON DELETE CASCADE;

-- Physical storage:
-- Users row (UserId=1) is stored directly with its Albums rows
-- Key: (UserId=1)           → Users row
-- Key: (UserId=1, AlbumId=1) → Albums row
-- Key: (UserId=1, AlbumId=2) → Albums row
-- All on the SAME Paxos group → JOIN is local, no cross-shard needed
\`\`\`

### TrueTime — The Cornerstone

TrueTime is Spanner's clock synchronization mechanism. Every Google datacenter has GPS receivers and atomic clocks.

\`\`\`
TrueTime API:
  TT.now()     → returns TTinterval: [earliest, latest]
                 the true current time is within this interval
  TT.after(t)  → true if t has definitely passed
  TT.before(t) → true if t has definitely not yet arrived

Clock sources:
  GPS antenna  → accurate to ~1 microsecond
  Atomic clock → accurate to ~1 nanosecond, no GPS signal needed
  
  Each datacenter has both. GPS is the reference, atomic clock
  handles GPS outages and provides sub-microsecond precision.

Uncertainty:
  Network latency between GPS receiver and spanserver: ~1ms
  Crystal oscillator drift between syncs: ~200μs/30s
  Typical TrueTime uncertainty (ε): 1-7ms

Why uncertainty matters:
  Two events at t1 and t2 where t2 - t1 < ε:
    We cannot determine which happened first from timestamps alone
    Spanner must wait for uncertainty to resolve before committing
\`\`\`

### External Consistency via Commit Wait

\`\`\`
Definition: if transaction T1 commits before transaction T2 starts,
then T1's commit timestamp < T2's start timestamp.

This is STRONGER than serializability — it matches real-world time order.

Implementation:
  1. Transaction T1 executes, determines it's ready to commit
  2. Leader assigns commit timestamp s = TT.now().latest
     (takes the LATEST bound of the uncertainty interval)
  3. Commit wait: leader waits until TT.after(s) = true
     (waits until the EARLIEST bound of TT.now() exceeds s)
     This means: true current time > s definitely
  4. Leader commits with timestamp s
  5. Returns to client

  Now: any transaction T2 starting after T1's client response:
    T2's start timestamp s2 = TT.now().latest ≥ TT.now().earliest > s
    Therefore: s2 > s → T2 sees T1's writes
    External consistency holds ✓

Commit wait duration:
  s is chosen as TT.now().latest
  Wait until TT.now().earliest > s
  Duration ≈ 2ε (twice the uncertainty)
  Typical: 2 × 4ms = 8ms added to every write transaction
  
  This is the cost of external consistency.
\`\`\`

### Read-Write vs Read-Only Transactions

\`\`\`
Read-Write Transaction:
  Uses two-phase locking (2PL) for reads
  Uses Paxos consensus for writes
  Commit wait adds ~8ms
  All reads go to Paxos leader (strong consistency)

Read-Only Transaction (snapshot read):
  No locks! No 2PL!
  No Paxos consensus! No commit wait!
  Reads at a consistent timestamp (negotiated across all replicas)
  Can be served by ANY replica (not just leader)
  → Much lower latency, much higher throughput
  → Reads from nearby replica instead of Paxos leader

  Read-only transactions use Spanner's multi-version storage:
    Every data item stores multiple versions with timestamps
    Read at timestamp T → return version with largest timestamp ≤ T

Staleness choices (read-only):
  Strong read: timestamp = TT.now().latest → always see latest data
               Must be served by leader or replica that's up to date
  Bounded staleness: "read data no older than 15 seconds"
               Can be served by any replica with data ≤ 15s old
  Exact staleness: "read at timestamp 2024-01-01T00:00:00"
               Historical query, always fast
\`\`\`

### Spanner SQL and Transactions in Practice

\`\`\`
// Go client (Cloud Spanner)
ctx := context.Background()
client, _ := spanner.NewClient(ctx, "projects/myproject/instances/myinstance/databases/mydb")

// Read-write transaction
_, err = client.ReadWriteTransaction(ctx, func(ctx context.Context, txn *spanner.ReadWriteTransaction) error {
    // Read Alice's balance
    row, _ := txn.ReadRow(ctx, "Accounts", spanner.Key{"alice"}, []string{"Balance"})
    var balance int64
    row.Column(0, &balance)
    
    if balance < 100 {
        return fmt.Errorf("insufficient funds")
    }
    
    // Debit Alice
    txn.BufferWrite([]*spanner.Mutation{
        spanner.Update("Accounts", []string{"UserId", "Balance"},
                       []interface{}{"alice", balance - 100}),
        spanner.Update("Accounts", []string{"UserId", "Balance"},
                       []interface{}{"bob", spanner.CommitTimestamp}),  // server-side timestamp
    })
    return nil
})

// Read-only transaction (snapshot)
txn := client.ReadOnlyTransaction().WithTimestampBound(
    spanner.MaxStaleness(15 * time.Second),  // bounded staleness
)
defer txn.Close()

iter := txn.Query(ctx, spanner.Statement{
    SQL: "SELECT UserId, Name FROM Users WHERE Email = @email",
    Params: map[string]interface{}{"email": "alice@example.com"},
})
\`\`\`

## CockroachDB — Spanner for Everyone

CockroachDB is an open-source implementation of Spanner's ideas, designed to run on commodity hardware without GPS/atomic clocks.

\`\`\`
CockroachDB vs Spanner:
  Spanner:      requires Google's TrueTime (GPS + atomic clocks)
  CockroachDB:  uses Hybrid Logical Clocks (HLC) — software solution

  Spanner:      proprietary, Google Cloud only
  CockroachDB:  open source, runs anywhere (on-prem, any cloud)

  Spanner:      externally consistent (real-time order)
  CockroachDB:  serializable isolation (not externally consistent by default)
                (can approximate with careful clock sync via NTP + PTP)
\`\`\`

### Architecture

\`\`\`
CockroachDB node (each is identical, no special master):
  SQL Layer      ← parses SQL, builds query plan
  Transaction    ← MVCC, 2PL for read-write txns
  Distribution   ← routes to correct range/node
  Replication    ← Raft consensus per range
  Storage        ← RocksDB (LSM tree, key-value)

Range:
  64MB chunk of sorted key-value data
  Each Range replicated via Raft group (3 or 5 replicas)
  Leaseholder = Raft leader = serves reads without round trip

Key encoding:
  /Table/52/Index/1/Users/alice   → row data
  /Table/52/Index/2/alice@ex.com  → secondary index entry
  
  Everything is a sorted key-value pair in RocksDB
  SQL tables are just a structured encoding on top
\`\`\`

### Hybrid Logical Clocks (HLC)

\`\`\`
Problem: NTP synchronization is ~1-100ms accurate — not good enough for
         Spanner-style commit timestamps (need sub-millisecond ordering)

HLC combines physical time + logical counter:
  HLC = (physical_time, logical_counter)
  
  Rules:
    HLC always moves forward (monotonic)
    HLC ≥ physical wall clock time
    HLC.logical = 0 when physical time advances
    
  Event A sends message to Event B:
    B.HLC = max(B.HLC, A.HLC) + increment logical
    → B always knows A happened before B (causal ordering)

Example:
  Node 1 clock: 10:00:00.100
  Node 2 clock: 10:00:00.050  (50ms behind NTP)
  
  Node 1 sends HLC(100ms, 0) to Node 2
  Node 2: max(50ms, 100ms) = 100ms → HLC(100ms, 1)
  Node 2's next event: HLC(100ms, 2)
  
  Causal order preserved even with clock skew!

HLC vs TrueTime:
  TrueTime: real uncertainty bounds from GPS (±4ms)
            enables external consistency
  HLC: logical ordering only, no real-time bounds
       enables causal consistency, not external consistency
       → CockroachDB is serializable, not externally consistent
\`\`\`

### CockroachDB Transaction Model

\`\`\`
Read-write transaction:
  1. Client begins transaction (picks a transaction timestamp = HLC.now())
  2. Reads go to leaseholder of each range
     If read finds a value with timestamp > transaction timestamp:
       → Transaction must restart with later timestamp (timestamp pushed)
  3. Writes buffered client-side
  4. Commit: client sends all buffered writes to transaction coordinator
  5. Coordinator runs parallel commits (one Raft round per range touched)
     All ranges commit in parallel — much faster than sequential 2PC
  6. Async cleanup: background process resolves transaction record

Parallel commits (CockroachDB optimization):
  Traditional 2PC:
    Phase 1: prepare all ranges (sequential or parallel) — 1 round trip
    Phase 2: commit all ranges — 1 round trip
    Total: 2 round trips

  CockroachDB parallel commits:
    Single round: atomically write "STAGING" + all intents in one Raft round
    If all succeed: immediately declare committed (1 round trip!)
    Background: cleanup staging record
    
    Performance: ~50% lower latency than 2PC for multi-range transactions
\`\`\`

### MVCC in CockroachDB

\`\`\`
Every key has multiple versions, each with an HLC timestamp:

Key: /users/alice
  Version(HLC=100): {name: "Alice", balance: 1000}
  Version(HLC=150): {name: "Alice", balance: 900}   ← latest
  Version(HLC=200): (tombstone — deleted)

Read at HLC=120: → returns Version(100) (highest ≤ 120)
Read at HLC=160: → returns Version(150) (highest ≤ 160)
Read at HLC=210: → returns tombstone (deleted)

MVCC enables:
  Snapshot reads without blocking writes
  Time-travel queries: AS OF SYSTEM TIME

Time travel in CockroachDB:
  SELECT * FROM orders AS OF SYSTEM TIME '-10m';
  → Read data as it was 10 minutes ago
  → No locks, no blocking
  → Useful for: analytics, debugging, audit trails

  Data retained for: gc.ttlseconds (default: 25 hours)
\`\`\`

### CockroachDB SQL Features

\`\`\`sql
-- Standard PostgreSQL-compatible SQL
CREATE TABLE orders (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  total      DECIMAL(10,2),
  status     STRING,
  created_at TIMESTAMPTZ DEFAULT now(),
  INDEX (customer_id),
  INDEX (status, created_at DESC)
);

-- Follower reads (read from nearest replica, bounded staleness)
SELECT * FROM orders AS OF SYSTEM TIME follower_read_timestamp()
WHERE customer_id = '123e4567-e89b-12d3-a456-426614174000';

-- Multi-region table (pin data to region)
ALTER TABLE users SET LOCALITY REGIONAL BY ROW;
-- Adds crdb_region column, pins each row to its region
-- European users' data stays in EU → GDPR compliance

-- Global table (replicated everywhere, fast reads everywhere)
ALTER TABLE config SET LOCALITY GLOBAL;
-- All replicas in all regions → sub-millisecond reads globally

-- Show ranges (debug sharding)
SHOW RANGES FROM TABLE orders;
-- start_key | end_key | range_id | lease_holder | replicas
\`\`\`

### Multi-Region CockroachDB

\`\`\`
Survival goals:
  ZONE: survive failure of one availability zone (default)
  REGION: survive failure of entire region
          → 5 replicas across 3 regions minimum

Table locality options:
  REGIONAL BY TABLE: all rows pinned to one home region
    → Fast reads/writes in home region
    → High latency from other regions
    
  REGIONAL BY ROW: each row pinned to its own region
    → User in EU: EU row → fast EU reads/writes
    → User in US: US row → fast US reads/writes
    → Requires crdb_region column in primary key
    
  GLOBAL: replicated to all regions
    → Fast reads everywhere (uses follower reads)
    → Slower writes (must achieve global consensus)
    → Best for: low-write, high-read reference data (config, catalogs)

Practical example: global e-commerce
  orders:     REGIONAL BY ROW  (customer data stays in their region)
  products:   GLOBAL           (catalog read everywhere, rarely updated)
  inventory:  REGIONAL BY TABLE (warehouse is in one region)
\`\`\`

## Spanner vs CockroachDB — When to Use Each

\`\`\`
Use Google Spanner when:
  ✓ You're already in Google Cloud
  ✓ Need true external consistency (financial systems, global inventory)
  ✓ Need guaranteed <10ms commit wait (Google's TrueTime is tighter than NTP)
  ✓ Petabyte scale (Spanner handles Google's own workloads)
  ✓ Managed service is acceptable (no ops burden)
  ✗ Expensive: ~$0.90/node/hour + storage
  ✗ Google Cloud lock-in

Use CockroachDB when:
  ✓ Multi-cloud or on-premises deployment required
  ✓ PostgreSQL compatibility required (same driver, same SQL)
  ✓ Open source is required (no vendor lock-in)
  ✓ Serializable isolation is sufficient (covers 99% of use cases)
  ✓ Self-hosted is acceptable
  ✗ Slightly weaker consistency than Spanner (serializable vs external)
  ✗ Requires operational expertise (not purely managed)

Both are overkill for:
  → Applications serving a single geographic region
  → Workloads that fit on one server
  → Teams without distributed systems expertise
  → Startups (use PostgreSQL until you actually need global distribution)
\`\`\`

## The NewSQL Movement

Spanner and CockroachDB are part of the **NewSQL** movement — databases that provide:

\`\`\`
Traditional SQL:     Strong consistency + SQL + ACID
                     BUT: single node or limited scale

NoSQL:               Horizontal scale + high availability
                     BUT: eventual consistency, no SQL, no ACID

NewSQL:              Strong consistency + SQL + ACID + horizontal scale
  Examples:
    Google Spanner   (2012) — proprietary, global
    CockroachDB      (2015) — open source, global
    TiDB             (2016) — open source, MySQL-compatible
    YugabyteDB       (2017) — open source, PostgreSQL-compatible
    PlanetScale      (2018) — Vitess-based, MySQL-compatible
    Amazon Aurora    (2014) — semi-NewSQL (single region, shared storage)
    Neon             (2022) — serverless PostgreSQL with branching

Common architecture:
  SQL layer (PostgreSQL or MySQL compatible)
  Distributed transaction layer (2PC or Raft-based)
  Distributed storage layer (RocksDB, Paxos/Raft replication)
\`\`\`
`,

  fr: `# Spanner & CockroachDB

## Pourquoi ces bases de données sont importantes

Google Spanner (2012) et CockroachDB (2015) représentent la frontière actuelle de la conception de bases de données distribuées : **mondialement distribuées, fortement cohérentes, compatibles SQL, horizontalement scalables**.

## Architecture de Google Spanner

### TrueTime — La pierre angulaire

\`\`\`
API TrueTime :
  TT.now()     → retourne TTinterval : [plus_tôt, plus_tard]
                 le vrai temps actuel est dans cet intervalle
  Incertitude : 1-7ms (GPS + horloges atomiques dans chaque datacenter)

Pourquoi l'incertitude est importante :
  Deux événements à t1 et t2 où t2 - t1 < ε :
    Impossible de déterminer lequel s'est produit en premier depuis les timestamps
    Spanner doit attendre que l'incertitude se résolve avant de committer
\`\`\`

### Cohérence externe via Commit Wait

\`\`\`
Définition : si T1 committe avant que T2 commence,
alors le timestamp de commit de T1 < le timestamp de début de T2.

C'est PLUS FORT que la sérialisabilité — correspond à l'ordre temporel réel.

Implémentation :
  1. T1 prête à committer
  2. Leader assigne timestamp s = TT.now().latest
  3. Commit wait : attendre jusqu'à TT.after(s) = vrai
  4. Leader committe avec timestamp s

Durée du commit wait :
  Typiquement : 2 × 4ms = 8ms ajoutés à chaque transaction d'écriture
  C'est le coût de la cohérence externe.
\`\`\`

## CockroachDB — Spanner pour tous

CockroachDB est une implémentation open-source des idées de Spanner.

### Hybrid Logical Clocks (HLC)

\`\`\`
Problème : NTP est précis à ~1-100ms — pas assez pour les timestamps de Spanner

HLC combine temps physique + compteur logique :
  HLC = (temps_physique, compteur_logique)
  
  L'HLC avance toujours (monotone)
  L'HLC ≥ horloge murale physique
  
  Node 1 envoie HLC(100ms, 0) à Node 2 (qui est 50ms en retard)
  Node 2 : max(50ms, 100ms) = 100ms → HLC(100ms, 1)
  → Ordre causal préservé même avec dérive d'horloge !

HLC vs TrueTime :
  TrueTime : bornes d'incertitude réelles depuis GPS → cohérence externe
  HLC : ordre logique uniquement → cohérence sérialisable, pas externe
\`\`\`

### MVCC dans CockroachDB

\`\`\`sql
-- Voyage dans le temps dans CockroachDB
SELECT * FROM orders AS OF SYSTEM TIME '-10m';
-- Lire les données telles qu'elles étaient il y a 10 minutes
-- Pas de verrous, pas de blocage
-- Utile pour : analyse, débogage, pistes d'audit

-- Lectures de follower (lire depuis le réplica le plus proche)
SELECT * FROM orders AS OF SYSTEM TIME follower_read_timestamp()
WHERE customer_id = '123';
\`\`\`

### CockroachDB Multi-Région

\`\`\`sql
-- Table régionale par ligne (chaque ligne épinglée à sa région)
ALTER TABLE users SET LOCALITY REGIONAL BY ROW;
-- Données européennes restent en EU → conformité RGPD

-- Table globale (répliquée partout, lectures rapides partout)
ALTER TABLE config SET LOCALITY GLOBAL;
-- Tous les réplicas dans toutes les régions → lectures sub-milliseconde

-- Exemple pratique : e-commerce mondial
-- orders :    REGIONAL BY ROW  (données client restent dans leur région)
-- products :  GLOBAL           (catalogue lu partout, rarement mis à jour)
-- inventory : REGIONAL BY TABLE (entrepôt dans une région)
\`\`\`

## Spanner vs CockroachDB

\`\`\`
Utiliser Google Spanner quand :
  ✓ Déjà dans Google Cloud
  ✓ Besoin de vraie cohérence externe
  ✓ Échelle pétaoctet
  ✗ Coûteux : ~0.90$/nœud/heure + stockage
  ✗ Enfermement dans Google Cloud

Utiliser CockroachDB quand :
  ✓ Déploiement multi-cloud ou sur site requis
  ✓ Compatibilité PostgreSQL requise
  ✓ Open source requis (pas de dépendance fournisseur)
  ✓ L'isolation sérialisable est suffisante
  ✗ Cohérence légèrement plus faible que Spanner

Les deux sont excessifs pour :
  → Applications servant une seule région géographique
  → Charges de travail tenant sur un serveur
  → Startups (utiliser PostgreSQL jusqu'à avoir vraiment besoin)
\`\`\`

## Le mouvement NewSQL

\`\`\`
SQL traditionnel : Cohérence forte + SQL + ACID, MAIS nœud unique
NoSQL :           Scalabilité horizontale + haute dispo, MAIS cohérence éventuelle
NewSQL :          Cohérence forte + SQL + ACID + scalabilité horizontale

Exemples :
  Google Spanner   (2012) — propriétaire, mondial
  CockroachDB      (2015) — open source, mondial
  TiDB             (2016) — open source, compatible MySQL
  YugabyteDB       (2017) — open source, compatible PostgreSQL
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "How does Google Spanner's commit wait mechanism achieve external consistency, and what is its cost?",
      options: [
        "Commit wait pauses all other transactions globally until the committing transaction finishes",
        "The leader assigns commit timestamp s = TT.now().latest, then waits until TT.after(s) is true (until true current time definitely exceeds s). Any transaction starting after the client response has a start timestamp definitively > s, guaranteeing it sees T1's writes. Cost: ~2ε wait ≈ 8ms per write transaction.",
        "Commit wait synchronizes clocks across all nodes before each transaction commits",
        "Commit wait holds a distributed lock across all Paxos groups until replication completes",
      ],
      correct: 1,
    },
    {
      question:
        "What is the advantage of Spanner's read-only transactions over read-write transactions?",
      options: [
        "Read-only transactions are faster because they use a smaller network packet size",
        "Read-only transactions use no locks, no Paxos consensus, and no commit wait — they read at a consistent timestamp from ANY replica (not just the leader), enabling much lower latency and higher throughput. They can be served by nearby replicas instead of the Paxos leader.",
        "Read-only transactions skip the SQL parsing phase for better performance",
        "Read-only transactions are served from an in-memory cache, bypassing storage entirely",
      ],
      correct: 1,
    },
    {
      question:
        "How does CockroachDB's Hybrid Logical Clock (HLC) preserve causal ordering despite NTP clock skew?",
      options: [
        "HLC uses GPS hardware like Spanner's TrueTime to guarantee precise timestamps",
        "HLC = (physical_time, logical_counter). When Node B receives a message from Node A with HLC timestamp T_A, B sets its HLC to max(B.HLC, T_A) + increment. This ensures B's timestamp is always > A's, preserving causal order even when B's physical clock is behind A's.",
        "HLC synchronizes all node clocks to within 1ms using a dedicated synchronization protocol",
        "HLC avoids the clock skew problem by using only logical counters and ignoring physical time",
      ],
      correct: 1,
    },
    {
      question:
        "What is CockroachDB's parallel commits optimization and how does it improve on traditional 2PC?",
      options: [
        "Parallel commits allows multiple transactions to commit simultaneously on the same range",
        "Traditional 2PC requires 2 sequential round trips (prepare then commit). CockroachDB's parallel commits atomically writes a STAGING record plus all write intents in a single Raft round — if all succeed, the transaction is immediately declared committed in 1 round trip instead of 2, reducing multi-range transaction latency by ~50%.",
        "Parallel commits sends commit messages to all replicas in parallel instead of sequentially",
        "Parallel commits skips the prepare phase entirely for single-range transactions",
      ],
      correct: 1,
    },
    {
      question:
        "When should you use GLOBAL table locality in CockroachDB's multi-region deployment?",
      options: [
        "GLOBAL locality should be used for all tables to ensure maximum data availability",
        "GLOBAL locality replicates data to all regions enabling fast reads everywhere — ideal for low-write, high-read reference data like product catalogs, configuration, and country codes. Writes are slower (must achieve global consensus). Poor choice for user-specific data that changes frequently.",
        "GLOBAL locality should be used when the table has more than 1 million rows",
        "GLOBAL locality is required for tables that participate in cross-region transactions",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Comment le mécanisme de commit wait de Google Spanner atteint-il la cohérence externe, et quel est son coût ?",
      options: [
        "Le commit wait met en pause toutes les autres transactions globalement",
        "Le leader assigne le timestamp de commit s = TT.now().latest, puis attend jusqu'à TT.after(s) soit vrai. Toute transaction démarrant après la réponse client a un timestamp de début définitivement > s, garantissant qu'elle voit les écritures de T1. Coût : ~2ε d'attente ≈ 8ms par transaction d'écriture.",
        "Le commit wait synchronise les horloges sur tous les nœuds avant chaque commit",
        "Le commit wait tient un verrou distribué sur tous les groupes Paxos jusqu'à la fin de la réplication",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est l'avantage des transactions en lecture seule de Spanner par rapport aux transactions en lecture-écriture ?",
      options: [
        "Les transactions en lecture seule sont plus rapides car elles utilisent des paquets réseau plus petits",
        "Les transactions en lecture seule n'utilisent pas de verrous, pas de consensus Paxos et pas de commit wait — elles lisent à un timestamp cohérent depuis N'IMPORTE quel réplica (pas seulement le leader), permettant une latence bien plus faible et un débit plus élevé.",
        "Les transactions en lecture seule sautent la phase d'analyse SQL",
        "Les transactions en lecture seule sont servies depuis un cache mémoire",
      ],
      correct: 1,
    },
    {
      question:
        "Comment l'Hybrid Logical Clock (HLC) de CockroachDB préserve-t-il l'ordre causal malgré la dérive d'horloge NTP ?",
      options: [
        "HLC utilise du matériel GPS comme TrueTime de Spanner",
        "HLC = (temps_physique, compteur_logique). Quand le Nœud B reçoit un message du Nœud A avec timestamp HLC T_A, B définit son HLC à max(B.HLC, T_A) + incrément. Cela garantit que le timestamp de B est toujours > celui de A, préservant l'ordre causal même quand l'horloge physique de B est en retard.",
        "HLC synchronise toutes les horloges des nœuds à 1ms près",
        "HLC évite le problème de dérive en utilisant uniquement des compteurs logiques",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce que l'optimisation de commits parallèles de CockroachDB et comment améliore-t-elle le 2PC traditionnel ?",
      options: [
        "Les commits parallèles permettent à plusieurs transactions de committer simultanément sur le même range",
        "Le 2PC traditionnel nécessite 2 allers-retours séquentiels. Les commits parallèles de CockroachDB écrivent atomiquement un enregistrement STAGING plus tous les intents d'écriture en un seul round Raft — si tout réussit, la transaction est immédiatement déclarée committée en 1 aller-retour au lieu de 2, réduisant la latence d'~50%.",
        "Les commits parallèles envoient les messages de commit à tous les réplicas en parallèle",
        "Les commits parallèles sautent la phase de préparation pour les transactions mono-range",
      ],
      correct: 1,
    },
    {
      question:
        "Quand devriez-vous utiliser la localité GLOBAL dans le déploiement multi-région de CockroachDB ?",
      options: [
        "La localité GLOBAL doit être utilisée pour toutes les tables",
        "La localité GLOBAL réplique les données dans toutes les régions permettant des lectures rapides partout — idéale pour les données de référence peu écrites et très lues comme les catalogues produits et la configuration. Les écritures sont plus lentes (consensus global requis). Mauvais choix pour les données utilisateur qui changent fréquemment.",
        "La localité GLOBAL doit être utilisée quand la table a plus d'un million de lignes",
        "La localité GLOBAL est requise pour les tables participant aux transactions cross-région",
      ],
      correct: 1,
    },
  ],
};
