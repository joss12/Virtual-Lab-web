export const content = {
  en: `# Column Stores

## Row Storage vs Column Storage

The fundamental architectural split in database storage:

\`\`\`
Row-oriented (PostgreSQL, MySQL, MongoDB):
  Stores all columns of a row together on disk

  Page: [ id=1, name="Alice", age=30, city="Paris"  ]
        [ id=2, name="Bob",   age=25, city="Lyon"   ]
        [ id=3, name="Carol", age=35, city="Paris"  ]

  Read the row? Fast — all columns co-located.
  Read one column across 1M rows? Slow — must read every row to extract one field.

Column-oriented (Cassandra, ClickHouse, Redshift, Parquet):
  Stores all values of the same column together on disk

  Column "age":  [ 30, 25, 35, 28, 42, ... ]
  Column "city": [ "Paris", "Lyon", "Paris", "Lyon", ... ]
  Column "name": [ "Alice", "Bob", "Carol", ... ]

  Read one column across 1M rows? Fast — sequential read of one column file.
  Read a full row? Slow — must read from multiple column files and reconstruct.
\`\`\`

**Row stores win:** OLTP (point lookups, full row reads, writes)
**Column stores win:** OLAP (aggregations, scans of a few columns across millions of rows)

## Why Column Storage Is Better for Analytics

\`\`\`sql
SELECT country, SUM(revenue) FROM orders GROUP BY country;
\`\`\`

\`\`\`
Row store execution:
  Read every page of the orders table
  From each row, extract "country" and "revenue" fields
  Discard all other columns (id, user_id, status, created_at, ...)
  I/O: 100% of table data read, ~90% discarded

Column store execution:
  Read ONLY the "country" column file
  Read ONLY the "revenue" column file
  I/O: 2/N columns read (e.g. 2/20 = 10% of data)

For a 20-column table, column storage reads 10x less data.
For wide tables (100+ columns), the advantage is 50-100x.
\`\`\`

**Additionally**, column storage enables dramatically better compression:
\`\`\`
Column of country codes: ["US","US","FR","US","DE","FR","US","US","US","FR",...]
  Dictionary encoding: {"US"=0, "FR"=1, "DE"=2} → [0,0,1,0,2,1,0,0,0,1,...]
  Run-length encoding: 0×3, 1×1, 0×1, 2×1, 1×1, 0×3, 1×1
  Compression ratio: 20-100x on low-cardinality string columns

Row storage: "US" appears next to id, revenue, user_id... hard to compress across columns
Column storage: all "US" values are adjacent → trivial to compress
\`\`\`

## Apache Cassandra Architecture

Cassandra is a **wide-column store** — a hybrid that superficially resembles a relational table but has fundamentally different storage and distribution semantics. Designed at Facebook, open-sourced in 2008, now an Apache project.

### The Data Model

\`\`\`
Keyspace (≈ database)
  └── Table
        └── Partition (group of rows with same partition key)
              └── Row (identified by clustering columns)
                    └── Columns

CREATE TABLE time_series.metrics (
  sensor_id  UUID,
  recorded_at TIMESTAMP,
  value       DOUBLE,
  unit        TEXT,
  PRIMARY KEY (sensor_id, recorded_at)
  -- sensor_id    = partition key (determines which node)
  -- recorded_at  = clustering column (determines row order within partition)
);
\`\`\`

All rows with the same \`sensor_id\` are stored together on the same node(s), physically sorted by \`recorded_at\`. This is the fundamental storage unit — the **partition**.

### Consistent Hashing — How Data Is Distributed

Cassandra uses a **ring topology** with consistent hashing to distribute partitions across nodes.

\`\`\`
Hash ring (token ring):
  Each node is responsible for a range of token values
  Partition key is hashed → token → determines which node owns it

  Node A: tokens 0    → 25
  Node B: tokens 25   → 50
  Node C: tokens 50   → 75
  Node D: tokens 75   → 100

  sensor_id "abc123" → hash → token 37 → stored on Node B

Virtual Nodes (vnodes):
  Instead of one token range per node, each node owns many small ranges
  Node A: tokens [2-5, 18-22, 67-71, ...]
  Node B: tokens [7-12, 31-38, 82-87, ...]

  Benefits:
  - More even data distribution
  - Faster rebalancing when nodes join/leave
  - Better load distribution across heterogeneous hardware
\`\`\`

### Replication

\`\`\`
Replication Factor (RF): how many copies of each partition exist

With RF=3 and 4 nodes:
  Partition with token 37 stored on:
    Node B (primary, owns token 37)
    Node C (next node clockwise)
    Node D (next node clockwise)

  Any of the 3 replicas can serve reads.
  All 3 must be written to (but not necessarily confirmed, see consistency levels).
\`\`\`

### Gossip Protocol

Cassandra nodes communicate using **gossip** — a peer-to-peer protocol where each node periodically exchanges state information with 1-3 random peers.

\`\`\`
Every second, each node:
  1. Increments its own heartbeat counter
  2. Selects 1-3 random peers
  3. Sends its state (and state of nodes it knows about)
  4. Receives peer state
  5. Updates its view of cluster topology

State includes:
  - Is the node up or down?
  - What token ranges does it own?
  - What is its load?
  - What schema version does it have?

Convergence: with N nodes, gossip converges in O(log N) rounds
  100 nodes: ~7 rounds (~7 seconds for full cluster awareness)
  1000 nodes: ~10 rounds (~10 seconds)
\`\`\`

No central coordinator. No master. Every node knows about every other node through gossip. This is why Cassandra has no single point of failure.

### Quorum Reads and Writes

Cassandra's consistency model is **tunable** per operation:

\`\`\`
Consistency Level  | Meaning
-------------------|--------------------------------------------------
ONE                | Respond after 1 replica confirms
TWO                | Respond after 2 replicas confirm
THREE              | Respond after 3 replicas confirm
QUORUM             | Respond after majority (RF/2 + 1) confirm
LOCAL_QUORUM       | Quorum within local datacenter only
EACH_QUORUM        | Quorum in each datacenter
ALL                | All replicas must confirm (highest consistency, lowest availability)
ANY                | At least 1 node (can be a hinted handoff — weakest)
\`\`\`

\`\`\`
The CAP tradeoff in practice with RF=3:

Write ONE  + Read ALL  → eventual consistency (fast writes, slow reads)
Write QUORUM + Read QUORUM → strong consistency (W + R > RF = 3)
Write ALL  + Read ONE  → strong consistency (slow writes, fast reads)

For strong consistency: W + R > RF
  QUORUM + QUORUM: 2 + 2 > 3 ✓ strong consistency
  ONE    + ONE:    1 + 1 > 3 ✗ eventual consistency only
\`\`\`

### Cassandra Write Path

\`\`\`
Client write request
       ↓
Coordinator node (any node can be coordinator)
       ↓ sends write to all replica nodes
Replica node write path:
  1. Write to commit log (append-only, sequential I/O — durability)
  2. Write to MemTable (in-memory sorted structure)
  3. Return acknowledgment to coordinator
  4. When MemTable full → flush to SSTable (immutable file on disk)
  5. Compaction merges SSTables periodically
\`\`\`

This is an LSM tree! Cassandra uses the same LSM tree principles as RocksDB — write to memory first, flush to immutable files, compact in background.

### Cassandra Read Path

\`\`\`
Client read request
       ↓
Coordinator → sends read to closest replica (ONE) or multiple (QUORUM)
       ↓
Replica read path:
  1. Check row cache (if enabled)         ← in-memory, optional
  2. Check MemTable                       ← most recent data
  3. Check SSTable Bloom filters          ← skip irrelevant SSTables
  4. Check SSTable key cache              ← cached partition key → SSTable offset
  5. Read from SSTable(s) on disk
  6. Merge results from multiple SSTables (resolve with timestamps — last write wins)
\`\`\`

### Last Write Wins (LWW)

Cassandra resolves conflicts using **timestamps**. Every cell (individual column value) has a timestamp. When merging versions from multiple replicas, the highest timestamp wins.

\`\`\`
Replica 1: { sensor_id="abc", recorded_at=10:00, value=42.5, timestamp=1000 }
Replica 2: { sensor_id="abc", recorded_at=10:00, value=43.1, timestamp=1001 }

Merge result: value=43.1 (timestamp 1001 > 1000)
\`\`\`

\`\`\`
Problem: clock skew
  Node A clock: 10:00:00.000
  Node B clock: 09:59:59.500  ← 500ms behind

  Node B writes value=43.1 at "timestamp" 09:59:59.500
  Node A writes value=42.5 at "timestamp" 10:00:00.000

  Node A's write wins even though Node B's write was logically later!

Mitigation:
  Use NTP with tight synchronization
  Use hybrid logical clocks (HLC) — Cassandra uses NTP, not HLC
  Use CQL lightweight transactions (Paxos) for true ordering guarantees
\`\`\`

### Tombstones

Deletes in Cassandra don't immediately remove data. Instead they write a **tombstone** — a special marker indicating deletion with a timestamp.

\`\`\`
DELETE FROM metrics WHERE sensor_id='abc' AND recorded_at=10:00;
→ writes tombstone: { sensor_id='abc', recorded_at=10:00, deleted_at=timestamp }

During reads: tombstone suppresses the actual value
During compaction: tombstone + data → removed (after gc_grace_seconds)
\`\`\`

\`\`\`
gc_grace_seconds (default: 10 days):
  Time tombstones are retained before compaction can remove them.
  Why: if a replica was down when delete happened, it needs time to receive
       the tombstone before the data is permanently deleted.
  Risk: if replica is down > gc_grace_seconds, deleted data reappears on recovery!

Tombstone problems:
  Query reads thousands of tombstones → slow (tombstone scan overhead)
  Fix: avoid delete-heavy patterns, use TTL instead, tune gc_grace_seconds
\`\`\`

### TTL (Time To Live)

\`\`\`sql
-- Insert with TTL (data auto-expires)
INSERT INTO metrics (sensor_id, recorded_at, value)
VALUES ('abc', toTimestamp(now()), 42.5)
USING TTL 86400;  -- expires in 24 hours

-- Set TTL on column
UPDATE metrics USING TTL 3600
SET value = 43.1
WHERE sensor_id = 'abc' AND recorded_at = '2024-01-01 10:00:00';

-- Check remaining TTL
SELECT TTL(value) FROM metrics WHERE sensor_id = 'abc' LIMIT 1;
\`\`\`

TTL expiration writes a tombstone internally — TTL-heavy workloads still have tombstone overhead.

## ClickHouse — True Column Store for Analytics

While Cassandra is a wide-column store optimized for writes, **ClickHouse** is a true analytical column store — one of the fastest OLAP databases available.

\`\`\`
Architecture:
  Data stored in column files (one file per column per partition)
  MergeTree family of table engines (similar concept to LSM trees)
  Vectorized query execution
  Just-In-Time compilation of queries to native code
\`\`\`

### MergeTree Storage

\`\`\`sql
CREATE TABLE events (
  event_date  Date,
  user_id     UInt64,
  event_type  LowCardinality(String),
  revenue     Decimal(18,2)
) ENGINE = MergeTree()
  PARTITION BY toYYYYMM(event_date)    -- partition by month
  ORDER BY (user_id, event_date)        -- physical sort order (sparse index key)
  SETTINGS index_granularity = 8192;   -- rows per index mark
\`\`\`

\`\`\`
On disk (per partition, e.g. 202401):
  user_id.bin         ← compressed column data
  event_date.bin
  event_type.bin
  revenue.bin
  user_id.mrk2        ← index marks (every 8192 rows)
  primary.idx         ← sparse primary index
\`\`\`

### Sparse Primary Index

Unlike a dense B-tree index (one entry per row), ClickHouse uses a **sparse index** — one entry per 8192 rows (index_granularity).

\`\`\`
8 million rows, index_granularity=8192:
  Sparse index has: 8,000,000 / 8192 ≈ 977 entries

Query: SELECT * FROM events WHERE user_id = 42
  1. Binary search sparse index → find mark range (e.g., marks 3-5)
  2. Read only column data between marks 3-5 (3 × 8192 = 24,576 rows)
  3. Filter within that range for user_id=42

Dense index (PostgreSQL style): 8M entries → 8M × ~20 bytes = 160MB index
Sparse index (ClickHouse style): 977 entries → 977 × ~20 bytes = ~20KB index
Fits entirely in L1 cache!
\`\`\`

### Vectorized Execution

ClickHouse processes data in **vectors** (batches of 8192 values) using SIMD CPU instructions:

\`\`\`
Traditional (row-at-a-time):
  for each row:
    if revenue > 100: sum += revenue
  → 1 operation per loop iteration, branch mispredictions

Vectorized (8192 rows at once):
  Load 8192 revenue values into SIMD registers
  Compare all 8192 against 100 simultaneously (AVX-512: 8 doubles at once)
  Mask result
  Sum masked values
  → CPU processes 8 values per instruction cycle

Speedup: 10-100x for filter + aggregate workloads
\`\`\`
`,

  fr: `# Stores en colonnes

## Stockage par lignes vs stockage par colonnes

\`\`\`
Orienté lignes (PostgreSQL, MySQL) :
  Stocke toutes les colonnes d'une ligne ensemble sur disque
  Lire une ligne ? Rapide. Lire une colonne sur 1M lignes ? Lent.

Orienté colonnes (Cassandra, ClickHouse) :
  Stocke toutes les valeurs de la même colonne ensemble sur disque
  Lire une colonne sur 1M lignes ? Rapide. Lire une ligne complète ? Lent.
\`\`\`

**Les stores en lignes gagnent :** OLTP (lectures ponctuelles, écritures)
**Les stores en colonnes gagnent :** OLAP (agrégations, scans de quelques colonnes sur des millions de lignes)

## Architecture Apache Cassandra

Cassandra est un **store en colonnes larges** — conçu à Facebook, open-sourcé en 2008.

### Hachage cohérent

\`\`\`
Anneau de tokens :
  Chaque nœud est responsable d'une plage de valeurs de token
  La clé de partition est hachée → token → détermine le nœud propriétaire

  Nœud A : tokens 0-25
  Nœud B : tokens 25-50
  Nœud C : tokens 50-75
  Nœud D : tokens 75-100

Nœuds virtuels (vnodes) :
  Chaque nœud possède plusieurs petites plages
  Distribution plus uniforme, rééquilibrage plus rapide
\`\`\`

### Protocole Gossip

\`\`\`
Chaque seconde, chaque nœud :
  1. Incrémente son propre compteur de battement de cœur
  2. Sélectionne 1-3 pairs aléatoires
  3. Échange des informations d'état
  4. Met à jour sa vision de la topologie du cluster

Convergence : avec N nœuds, gossip converge en O(log N) rounds
  100 nœuds : ~7 rounds (~7 secondes)
\`\`\`

### Niveaux de cohérence

\`\`\`
ONE          — répondre après 1 réplica
QUORUM       — majorité (RF/2 + 1) confirme
LOCAL_QUORUM — quorum dans le datacenter local uniquement
ALL          — tous les réplicas doivent confirmer

Pour la cohérence forte : W + R > RF
  QUORUM + QUORUM : 2 + 2 > 3 ✓ cohérence forte
  ONE + ONE :       1 + 1 > 3 ✗ cohérence éventuelle seulement
\`\`\`

### Last Write Wins (LWW)

Cassandra résout les conflits avec des **timestamps**. La valeur avec le timestamp le plus élevé gagne.

**Problème :** dérive d'horloge entre nœuds peut faire gagner une écriture logiquement plus ancienne.

### Pierres tombales (Tombstones)

Les suppressions dans Cassandra n'effacent pas immédiatement les données. Elles écrivent une **pierre tombale**.

\`\`\`
gc_grace_seconds (défaut : 10 jours) :
  Durée de rétention des pierres tombales avant que la compaction puisse les supprimer.
  Risque : si un réplica est hors ligne > gc_grace_seconds, les données supprimées réapparaissent !
\`\`\`

### TTL (Time To Live)

\`\`\`sql
INSERT INTO metrics (sensor_id, recorded_at, value)
VALUES ('abc', toTimestamp(now()), 42.5)
USING TTL 86400;  -- expire dans 24 heures
\`\`\`

## ClickHouse — Vrai store en colonnes pour l'analytique

### Index primaire sparse

Contrairement à un index B-tree dense (une entrée par ligne), ClickHouse utilise un **index sparse** — une entrée tous les 8192 lignes.

\`\`\`
8 millions de lignes, index_granularity=8192 :
  Index sparse : 8 000 000 / 8192 ≈ 977 entrées
  Tient entièrement dans le cache L1 du CPU !

Index dense (style PostgreSQL) : 8M entrées → ~160 Mo
Index sparse (style ClickHouse) : ~977 entrées → ~20 Ko
\`\`\`

### Exécution vectorisée

ClickHouse traite les données en **vecteurs** de 8192 valeurs avec des instructions SIMD :

\`\`\`
Traditionnel (ligne par ligne) :
  pour chaque ligne : si revenue > 100 : somme += revenue
  → 1 opération par itération de boucle

Vectorisé (8192 lignes à la fois) :
  Charger 8192 valeurs revenue dans des registres SIMD
  Comparer les 8192 contre 100 simultanément (AVX-512)
  → Le CPU traite 8 valeurs par cycle d'instruction

Accélération : 10-100x pour les charges filtre + agrégation
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "Why does column storage achieve dramatically better compression than row storage?",
      options: [
        "Column storage uses more advanced compression algorithms",
        "Column storage stores all values of the same column together — adjacent values of the same type have high redundancy (e.g. repeated country codes), enabling dictionary and run-length encoding with 20-100x ratios",
        "Column storage compresses at the database level while row storage compresses at the OS level",
        "Column storage removes duplicate rows before compressing",
      ],
      correct: 1,
    },
    {
      question:
        "In Cassandra's consistent hashing ring, what problem do virtual nodes (vnodes) solve?",
      options: [
        "Vnodes enable Cassandra to support SQL queries",
        "Vnodes encrypt data before storing it on nodes",
        "Without vnodes each node owns one large token range causing uneven distribution and slow rebalancing — vnodes give each node many small ranges for better distribution and faster rebalancing when nodes join or leave",
        "Vnodes allow Cassandra to replicate data to multiple datacenters",
      ],
      correct: 2,
    },
    {
      question:
        "How does Cassandra achieve strong consistency using tunable consistency levels with RF=3?",
      options: [
        "Set all nodes to synchronous mode",
        "Use QUORUM for both reads and writes — since 2+2=4 > RF=3, any read will see at least one node that has the latest write",
        "Use ALL for writes and ONE for reads",
        "Enable linearizable consistency in the keyspace settings",
      ],
      correct: 1,
    },
    {
      question:
        "What is the danger of tombstones in Cassandra and when do they cause performance problems?",
      options: [
        "Tombstones cause disk corruption if not compacted within 24 hours",
        "Tombstones trigger full table scans on every read",
        "Queries must scan through tombstones to find live data — a query returning 100 rows might scan 100,000 tombstones, causing severe read latency. Also, data deleted before a replica recovers from > gc_grace_seconds downtime reappears.",
        "Tombstones prevent new writes to affected partitions",
      ],
      correct: 2,
    },
    {
      question:
        "Why does ClickHouse's sparse primary index fit in CPU L1 cache while a PostgreSQL B-tree index for the same data would not?",
      options: [
        "ClickHouse uses better compression on index data",
        "ClickHouse sparse index has one entry per 8192 rows — for 8M rows that is ~977 entries (~20KB), versus a dense B-tree with 8M entries (~160MB)",
        "ClickHouse stores indexes in RAM while PostgreSQL stores them on disk",
        "ClickHouse uses hash indexes while PostgreSQL uses B-tree indexes",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi le stockage en colonnes atteint-il une compression nettement meilleure que le stockage en lignes ?",
      options: [
        "Le stockage en colonnes utilise des algorithmes de compression plus avancés",
        "Le stockage en colonnes regroupe toutes les valeurs de la même colonne — les valeurs adjacentes du même type ont une haute redondance (ex: codes pays répétés), permettant l'encodage par dictionnaire et RLE avec des ratios de 20-100x",
        "Le stockage en colonnes compresse au niveau base de données tandis que le stockage en lignes compresse au niveau OS",
        "Le stockage en colonnes supprime les lignes dupliquées avant de compresser",
      ],
      correct: 1,
    },
    {
      question:
        "Dans l'anneau de hachage cohérent de Cassandra, quel problème les nœuds virtuels (vnodes) résolvent-ils ?",
      options: [
        "Les vnodes permettent à Cassandra de supporter les requêtes SQL",
        "Les vnodes chiffrent les données avant de les stocker sur les nœuds",
        "Sans vnodes chaque nœud possède une grande plage de tokens causant une distribution inégale et un rééquilibrage lent — les vnodes donnent à chaque nœud plusieurs petites plages pour une meilleure distribution et un rééquilibrage plus rapide",
        "Les vnodes permettent à Cassandra de répliquer les données vers plusieurs datacenters",
      ],
      correct: 2,
    },
    {
      question:
        "Comment Cassandra atteint-elle la cohérence forte avec des niveaux de cohérence configurables avec RF=3 ?",
      options: [
        "Mettre tous les nœuds en mode synchrone",
        "Utiliser QUORUM pour les lectures et les écritures — puisque 2+2=4 > RF=3, toute lecture verra au moins un nœud qui a la dernière écriture",
        "Utiliser ALL pour les écritures et ONE pour les lectures",
        "Activer la cohérence linéarisable dans les paramètres du keyspace",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est le danger des pierres tombales dans Cassandra et quand causent-elles des problèmes de performance ?",
      options: [
        "Les pierres tombales causent une corruption disque si elles ne sont pas compactées dans les 24 heures",
        "Les pierres tombales déclenchent des scans complets de table à chaque lecture",
        "Les requêtes doivent scanner les pierres tombales pour trouver les données vivantes — une requête retournant 100 lignes pourrait scanner 100 000 pierres tombales, causant une latence de lecture sévère. De plus, les données supprimées avant qu'un réplica ne récupère après > gc_grace_seconds de temps d'arrêt réapparaissent.",
        "Les pierres tombales empêchent les nouvelles écritures sur les partitions affectées",
      ],
      correct: 2,
    },
    {
      question:
        "Pourquoi l'index primaire sparse de ClickHouse tient-il dans le cache L1 du CPU alors qu'un index B-tree PostgreSQL pour les mêmes données ne le ferait pas ?",
      options: [
        "ClickHouse utilise une meilleure compression sur les données d'index",
        "L'index sparse de ClickHouse a une entrée tous les 8192 lignes — pour 8M lignes c'est ~977 entrées (~20 Ko), contre un B-tree dense avec 8M entrées (~160 Mo)",
        "ClickHouse stocke les index en RAM tandis que PostgreSQL les stocke sur disque",
        "ClickHouse utilise des index hash tandis que PostgreSQL utilise des index B-tree",
      ],
      correct: 1,
    },
  ],
};
