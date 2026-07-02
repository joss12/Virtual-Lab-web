export const content = {
  en: `# Real-World Case Studies

## Why Case Studies Matter

Database theory is useless without understanding how it breaks at scale. These case studies come from engineering blog posts and post-mortems at companies operating at scales most databases were never designed for. Each one teaches a lesson that no textbook covers.

## Case Study 1: Uber's Migration from PostgreSQL to MySQL

### The Setup (2016)

Uber ran PostgreSQL for years. In 2016, they published a controversial blog post explaining why they migrated to MySQL — triggering one of the most heated debates in database history.

\`\`\`
Uber's scale (2016):
  Trips per day: millions
  Database writes: extremely high frequency
  Replication: PostgreSQL streaming replication
  Problem: replication was falling dangerously behind during peak hours
\`\`\`

### The PostgreSQL Write Amplification Problem

\`\`\`
PostgreSQL MVCC update creates a new tuple version:
  Original row: (id=1, driver_lat=37.7749, driver_lon=-122.4194, updated_at=T1)
  Update row:   (id=1, driver_lat=37.7750, driver_lon=-122.4193, updated_at=T2)
  
  PostgreSQL writes:
    1. New tuple version in heap (entire new row)
    2. WAL record for heap change
    3. Update all index entries pointing to old location
       (driver_lat index: old ctid → new ctid)
       (driver_lon index: old ctid → new ctid)
       (updated_at index: old ctid → new ctid)
    4. WAL records for each index update
    
  For a row with 5 indexes: 1 heap write + 5 index writes = 6 physical writes
  Plus WAL for each: 12 total I/O operations for one logical UPDATE

InnoDB (MySQL) update:
  1. Update row in place (clustered index, primary key determines location)
  2. Update secondary indexes only if indexed columns changed
  3. Write WAL (redo log)
  
  For driver location update (lat/lon change):
    Clustered index update (in place): 1 write
    Secondary index (lat/lon): 2 writes
    Redo log: 1 write
    Total: 4 I/O operations (vs 12 for PostgreSQL)
\`\`\`

\`\`\`
Replication amplification:
  PostgreSQL WAL is physical — replicates raw page changes
  A single UPDATE of one column → WAL records for every index update
  
  Uber had indexes on many columns
  One logical update → dozens of WAL records
  WAL throughput: 10x the logical write rate
  Replica I/O: overwhelmed by WAL application → replication lag
  
  During surge pricing events:
    Write rate: 10x normal
    WAL rate: 100x normal (10x writes × 10x index WAL amplification)
    Replica: fell hours behind → stale reads → wrong surge prices shown
\`\`\`

### The Secondary Index Problem

\`\`\`
PostgreSQL secondary indexes store ctid (physical page+slot location):
  Index entry: {driver_lat: 37.77, ctid: (page=1234, slot=5)}
  
  UPDATE changes the row → new ctid (new page location)
  ALL secondary indexes must update their ctid references
  Even if the indexed column didn't change!
  
  Example: UPDATE SET updated_at = now() WHERE id = 1
    updated_at changes → heap tuple changes location → new ctid
    Even though driver_lat didn't change:
      driver_lat index still must update its ctid reference!
      ALL indexes updated for ANY column change
  
InnoDB secondary indexes store PRIMARY KEY:
  Index entry: {driver_lat: 37.77, pk: 1}
  
  UPDATE SET updated_at = now() WHERE id = 1
    updated_at changes → row updated in clustered index (at pk=1, same location)
    pk=1 doesn't change → secondary indexes NOT updated!
    Only secondary indexes for changed columns are updated.
\`\`\`

### Lessons Learned

\`\`\`
1. WAL physical replication amplifies write load:
   Each logical write → many physical WAL records
   High index count → high replication lag risk

2. Heap-based storage (PostgreSQL) vs clustered index (InnoDB):
   Different access patterns have different optimal storage strategies
   High-write tables with many indexes: InnoDB often wins

3. The "use PostgreSQL for everything" assumption is wrong:
   Use the right tool for the workload
   Uber's driver location: write-heavy, few reads → InnoDB better
   
Controversy:
   Many PostgreSQL experts disputed Uber's conclusions
   Modern PostgreSQL (12+) has significantly improved these issues
   HOT (Heap Only Tuple) updates avoid index updates when indexed columns unchanged
   The debate continues — both databases have evolved significantly since 2016
\`\`\`

## Case Study 2: Discord's Migration from Cassandra to ScyllaDB

### The Setup (2022)

Discord stores trillions of messages. Their Cassandra cluster was struggling.

\`\`\`
Discord scale:
  Messages stored: trillions
  Cassandra cluster: hundreds of nodes
  Message table: billions of rows per day written
  Problem: latency spikes, GC pauses, hot partitions, operational complexity
\`\`\`

### Cassandra's JVM Problem

\`\`\`
Apache Cassandra is written in Java.
Java's garbage collector periodically pauses ALL threads for GC:

Stop-the-world GC pause:
  All Cassandra threads stop
  GC runs: frees old objects, compacts heap
  All threads resume
  
  Duration: 10ms to 10 seconds (depending on heap size and GC algorithm)
  During pause: ALL requests queued → latency spike for all users
  
Discord experience:
  Heap size: 32GB+ per node
  GC pause frequency: minutes
  GC pause duration: seconds
  
  Every few minutes: all Discord users experience multi-second latency
  During peak traffic: GC pauses triggered more frequently
  
Cassandra tombstone problem:
  Discord deletes messages (GDPR, user requests)
  Cassandra deletes = tombstones (not immediate deletion)
  
  A partition with many deletions:
    Reading 1000 messages → scan 100,000 tombstones first!
    Query time: seconds instead of milliseconds
    Cassandra's tombstone_warn_threshold: log warning at 1,000 tombstones
    Discord was hitting millions of tombstones per partition
\`\`\`

### ScyllaDB — Cassandra Without JVM

\`\`\`
ScyllaDB is a rewrite of Cassandra in C++ (no JVM, no GC):
  Compatible: same CQL protocol, same data model, same drivers
  Different: C++ implementation, shard-per-core architecture

Shard-per-core model:
  Each CPU core owns a subset of data ranges (shards)
  Each shard has its own MemTable, SSTable files, compaction thread
  No lock contention between cores (each core works independently)
  No shared mutable state → no mutexes → no contention
  
  Cassandra: 1 MemTable per node (shared by all threads → lock contention)
  ScyllaDB:  1 MemTable per CPU core (no sharing → no contention)
  
  Result:
    Cassandra on 32-core machine: throughput plateaus at ~16 cores
    ScyllaDB on 32-core machine: linear scaling to all 32 cores

No GC pauses:
  C++ manual memory management: no stop-the-world
  Custom memory allocator: seastar::memory (NUMA-aware)
  Latency: consistently sub-millisecond (no GC spikes)
\`\`\`

\`\`\`
Discord migration results:
  Cassandra nodes replaced: hundreds → dozens (10x fewer nodes!)
  Latency: p99 from seconds → milliseconds (100x improvement)
  Cost: significant reduction (fewer nodes, less operational overhead)
  Tombstone handling: ScyllaDB handles tombstones more efficiently
  
  The migration was done live:
    Dual-write: write to both Cassandra and ScyllaDB
    Backfill: copy historical data to ScyllaDB
    Read traffic: gradually shifted from Cassandra to ScyllaDB
    Cut over: Cassandra decommissioned
\`\`\`

### Lessons Learned

\`\`\`
1. JVM GC is a database killer at high throughput:
   GC pauses are unpredictable and unacceptable for latency-sensitive systems
   C++ databases (ScyllaDB, RocksDB, ClickHouse) avoid this entirely
   
2. Tombstones are a silent time bomb in Cassandra:
   Every delete creates a tombstone that slows reads
   Design schemas to minimize deletes (use TTL instead)
   Monitor tombstone counts: nodetool tpstats | grep Tombstone

3. Migration strategy matters:
   Dual-write + backfill + gradual cutover = zero downtime
   Never big-bang migrate a live production system

4. Operational complexity is a real cost:
   Hundreds of Cassandra nodes → dozens of ScyllaDB nodes
   Fewer nodes = easier operations = less on-call burden
\`\`\`

## Case Study 3: GitHub's MySQL Infrastructure at Scale

### The Setup

GitHub runs MySQL for nearly all of its core data: repositories, users, issues, pull requests. At massive scale.

\`\`\`
GitHub scale:
  Repositories: hundreds of millions
  Database queries: billions per day
  MySQL clusters: dozens, globally distributed
  Schema changes: continuous (active development)
\`\`\`

### Online Schema Changes — gh-ost

\`\`\`
Problem: ALTER TABLE on large tables locks the entire table.
  ALTER TABLE pull_requests ADD COLUMN review_state VARCHAR(20);
  
  On a 500M row table:
    MySQL: TABLE LOCK for hours while copying entire table
    All reads and writes blocked
    GitHub.com returns errors to users
    
  Solution: gh-ost (GitHub Online Schema Migrations)
  
gh-ost algorithm:
  1. Create new "ghost" table with desired schema:
     CREATE TABLE _pull_requests_gho LIKE pull_requests;
     ALTER TABLE _pull_requests_gho ADD COLUMN review_state VARCHAR(20);
  
  2. Connect to MySQL binary log as a replica:
     Acts as a fake replica, reads binlog events
  
  3. Copy existing rows in chunks (throttled):
     INSERT INTO _pull_requests_gho SELECT * FROM pull_requests
     WHERE id BETWEEN 1 AND 1000;
     -- Then: 1001-2000, 2001-3000, etc.
     -- Throttles based on replication lag and server load
  
  4. Apply concurrent changes from binlog:
     While copying: new INSERT/UPDATE/DELETE on pull_requests
     gh-ost reads these from binlog → applies to _gho table
     Ghost table stays in sync with live table
  
  5. Cut over (atomic):
     LOCK TABLES pull_requests WRITE, _pull_requests_gho WRITE;
     RENAME TABLE pull_requests TO _pull_requests_del,
                  _pull_requests_gho TO pull_requests;
     UNLOCK TABLES;
     -- Lock held for milliseconds (just the rename)
  
  6. Drop old table (later, after verification):
     DROP TABLE _pull_requests_del;
  
  Total downtime: milliseconds (just the RENAME)
  vs hours with ALTER TABLE
\`\`\`

### Vitess — MySQL Sharding at GitHub Scale

\`\`\`
Problem: single MySQL server can't handle GitHub's write throughput.
  
GitHub adopted Vitess (developed by YouTube) for transparent sharding:

Vitess architecture at GitHub:
  VTGate: query router (stateless, many instances)
    Parses SQL, determines target shards, routes query
    
  VTTablet: sidecar per MySQL instance
    Connection pooling (MySQL: 1 connection per thread, expensive)
    Query rewriting (adds shard-aware WHERE clauses)
    Health checking
  
  Topology service: shard map (etcd)

Sharding strategy:
  repositories table: sharded by repository_id (hash)
  issues table:       sharded by repository_id (co-located with repos!)
  pull_requests:      sharded by repository_id
  
  Co-location: issues and pull_requests sharded on same key as repositories
  JOIN between repos and issues: stays on same shard → no cross-shard join!
  
  Bad sharding would require:
    SELECT r.name, COUNT(i.id) FROM repositories r JOIN issues i ON r.id = i.repo_id
    → Cross-shard join → scatter-gather → slow
  
  Good sharding (co-located):
    Same query → single shard → fast

Primary key changes:
  GitHub migrated to UUID primary keys (vs auto-increment)
  UUID: globally unique across shards (no conflicts when merging)
  Cost: UUID is 36 bytes (string) vs 8 bytes (bigint)
  Solution: store as BINARY(16) internally, display as string
\`\`\`

### The Read Replica Problem

\`\`\`
GitHub's read traffic: 10x write traffic
Solution: read replicas

Problem: replication lag
  GitHub actions trigger: push code → run CI → read repo state
  Write: push event written to primary
  Read: CI reads from replica (30 second replication lag)
  Result: CI reads OLD state → runs with wrong code!
  
Solutions GitHub implemented:
  1. Causal reads: after write, route reads to primary for N seconds
     Cookie: "wrote_at: T" → if now() - T < 60s → read from primary
  
  2. Session pinning: entire session routes to primary after any write
     Risk: primary overloaded by sessions that wrote once
  
  3. Read-your-writes: after write, generate monotonic token
     Token contains: write_lsn (log sequence number)
     On read: if replica.lsn < token.write_lsn → route to primary
              if replica.lsn >= token.write_lsn → read from replica
     
     Most elegant: replicas used when safe, primary only when necessary

Monitoring replication health:
  Alert if lag > 30 seconds
  Circuit breaker: if lag > 5 minutes → stop routing reads to that replica
  pt-heartbeat (Percona): writes timestamps to primary, checks replica
\`\`\`

## Case Study 4: Cloudflare's SQLite at the Edge

### The Setup (2022)

Cloudflare runs 275+ data centers worldwide. They built **D1** — a globally distributed SQLite database that runs at the edge.

\`\`\`
The problem:
  Traditional databases: run in one region (us-east-1)
  Edge requests from Europe → query us-east-1 → 150ms latency
  Unacceptable for real-time applications
  
The goal:
  SQLite database per customer
  Data lives near the customer's users
  Reads: sub-millisecond (from local SQLite file)
  Writes: replicated to other regions
\`\`\`

### SQLite at Scale — Litestream and Durable Objects

\`\`\`
Cloudflare D1 architecture:
  Each D1 database = SQLite file
  SQLite WAL file = append-only change log
  
  Write path:
    User writes to D1 database (their nearest Cloudflare datacenter)
    Write committed to SQLite WAL
    WAL streamed to Cloudflare's R2 (S3-compatible object storage)
    R2 replicates globally (eventual consistency)
  
  Read path:
    User reads from nearest datacenter
    Local SQLite file serves read → sub-millisecond
    
  Replication:
    Other datacenters download WAL from R2
    Apply WAL to their local SQLite copy
    Eventually consistent: reads may be slightly stale
    
  Consistency model:
    Single-region writes: immediately consistent (SQLite ACID)
    Cross-region reads: eventually consistent (seconds to replicate)

Durable Objects (the key innovation):
  A Durable Object = (compute + SQLite database) co-located
  Sticky routing: all requests for object X → same server
  No distributed coordination needed (single-server ACID)
  
  User's shopping cart → Durable Object → SQLite → ACID transactions
  The SQLite file for this cart lives on one server
  All cart operations are consistent (no distributed transactions)
\`\`\`

\`\`\`
Why SQLite?
  Zero server overhead: no separate database process
  ACID transactions: full consistency on one node
  WAL mode: read/write concurrency
  Tiny footprint: 500KB library
  Proven: billions of deployments
  
  The insight: most applications don't need a distributed database.
               They need a FAST local database with durable persistence.
               SQLite + Litestream (WAL replication) = simple, fast, durable.

Litestream (open source, used by Cloudflare):
  Reads SQLite WAL continuously
  Streams WAL frames to S3/R2
  On restore: download WAL from S3 → replay → current state
  Recovery time: seconds (WAL replay is fast)
  RPO: seconds (lose at most seconds of data on crash)
\`\`\`

## Case Study 5: Notion's Database Migration — PostgreSQL Sharding

### The Setup (2021)

Notion scaled from startup to tens of millions of users. Their single PostgreSQL cluster became a bottleneck.

\`\`\`
Notion's data model:
  Everything is a "block" (page, paragraph, image, table row, etc.)
  Blocks table: hundreds of millions of rows
  Blocks have parents (tree structure)
  Heavy read and write traffic
\`\`\`

### The Sharding Decision

\`\`\`
Notion chose to shard by workspace_id (tenant ID):
  All blocks for workspace X → shard based on hash(workspace_id)
  
  Why workspace_id?
    Queries are almost always: WHERE workspace_id = ? AND ...
    All data for one workspace co-located on one shard
    No cross-shard queries for normal operations
    
  Cross-shard queries (rare): global search, admin queries
    Implemented as scatter-gather (acceptable because rare)

Migration strategy:
  Phase 1: Dual-write
    Write to old monolith AND new sharded cluster
    Read from old monolith
    
  Phase 2: Backfill
    Copy all data from monolith to sharded cluster
    Verify consistency (checksums, row counts)
    
  Phase 3: Read cutover
    Read from sharded cluster for specific workspaces
    Verify: results match monolith (shadow reads)
    
  Phase 4: Write cutover
    Stop dual-write: write to sharded cluster only
    Monolith becomes read-only backup
    
  Phase 5: Decommission
    Monolith removed after verification period

Problems encountered:
  Large workspaces:
    One workspace with 50M blocks → one shard overwhelmed
    Solution: dedicated shard for large workspaces
    
  Relational integrity:
    Foreign keys can't span shards
    Solution: enforce integrity in application layer
    
  Cross-workspace features:
    Template sharing between workspaces → cross-shard query
    Solution: denormalize (copy template blocks to destination workspace)
\`\`\`

### The Lessons

\`\`\`
1. Shard key must match query patterns:
   Notion's primary query: WHERE workspace_id = ?
   → workspace_id is the perfect shard key
   
   Wrong shard key (block_id hash):
   → Every workspace query: WHERE workspace_id = ? → scatter-gather all shards
   → 10x slower

2. Large tenants break even sharding:
   One enterprise workspace = more data than 10,000 small workspaces
   Solution: dedicated shards for large tenants
              OR: limit data per tenant (less user-friendly)

3. Sharding is a one-way door:
   Once you shard, you can't easily un-shard
   Plan shard key very carefully BEFORE implementing

4. Application-layer integrity is harder than DB-layer:
   Foreign keys prevented bugs automatically in monolith
   In sharded system: bugs are silent data inconsistencies
   Invest heavily in consistency checks and monitoring
\`\`\`

## Common Themes Across All Case Studies

\`\`\`
1. Write amplification is the silent killer:
   Uber: PostgreSQL index write amplification → replication lag
   Discord: Cassandra tombstones → read amplification
   Solution: measure actual I/O, not just logical operations

2. Operational complexity has a real cost:
   Discord: 100s of Cassandra nodes → dozens of ScyllaDB nodes
   GitHub: automated schema changes (gh-ost) vs hours of downtime
   Rule: simpler operations = fewer incidents = faster iteration

3. Co-location is the key to avoiding distributed transactions:
   GitHub: issues co-located with repositories → no cross-shard joins
   Notion: workspace blocks co-located → single-shard queries
   Cloudflare: SQLite per Durable Object → single-node ACID
   Rule: design your shard key around your JOIN patterns

4. Migration must be zero-downtime:
   All five companies used: dual-write → backfill → verify → cutover
   Never big-bang migrate. Always incremental with rollback.
   Rule: the migration strategy is as important as the target architecture

5. Eventually you hit the limit of any single database:
   Uber: PostgreSQL replication limit
   Discord: Cassandra JVM limit
   GitHub: MySQL single-node write limit
   Notion: PostgreSQL single-node scale limit
   Rule: design for the next 3-5x growth, not 10x (over-engineering is waste)
\`\`\`
`,

  fr: `# Études de cas réelles

## Étude de cas 1 : Migration d'Uber de PostgreSQL vers MySQL

\`\`\`
Le problème d'amplification en écriture PostgreSQL :
  Mise à jour d'une ligne → nouvelle version de tuple dans le heap
  TOUS les index secondaires doivent mettre à jour leur référence ctid
  Même si la colonne indexée n'a pas changé !
  
  1 ligne avec 5 index : 1 écriture heap + 5 écritures index = 6 I/O physiques
  Plus WAL pour chaque : 12 opérations I/O totales pour un UPDATE logique

InnoDB MySQL :
  Mise à jour en place dans l'index clustérisé
  Seuls les index secondaires pour les colonnes modifiées sont mis à jour
  Total : 4 opérations I/O (vs 12 pour PostgreSQL)

Amplification de réplication :
  WAL PostgreSQL réplique les changements de pages brutes
  Un UPDATE logique → dizaines d'enregistrements WAL
  Débit WAL : 10x le taux d'écriture logique
  Lors d'événements de tarification dynamique :
    Taux d'écriture : 10x normal
    Taux WAL : 100x normal → replica dépassée → lectures obsolètes
\`\`\`

## Étude de cas 2 : Migration de Discord de Cassandra vers ScyllaDB

\`\`\`
Le problème GC JVM de Cassandra :
  Pause stop-the-world : tous les threads s'arrêtent
  Durée : 10ms à 10 secondes
  Pendant la pause : toutes les requêtes en file d'attente → pic de latence
  
  Discord : pauses GC de plusieurs secondes toutes les quelques minutes
  Impact : tous les utilisateurs Discord subissent une latence élevée

ScyllaDB — Cassandra sans JVM :
  Réécriture en C++ (pas de GC, gestion manuelle de la mémoire)
  Modèle shard-par-cœur : chaque cœur CPU possède un sous-ensemble de données
  Pas de contention entre cœurs → scalabilité linéaire

Résultats de migration Discord :
  Nœuds Cassandra : centaines → dizaines (10x moins !)
  Latence : p99 de secondes → millisecondes (100x amélioration)
  Coût : réduction significative
\`\`\`

## Étude de cas 3 : Infrastructure MySQL de GitHub à grande échelle

\`\`\`
gh-ost — Changements de schéma en ligne :
  Problème : ALTER TABLE sur grandes tables verrouille toute la table des heures
  
  Algorithme gh-ost :
  1. Créer table "fantôme" avec nouveau schéma
  2. Se connecter au binlog MySQL comme replica
  3. Copier les lignes existantes par chunks (limité)
  4. Appliquer les changements concurrents depuis le binlog
  5. Cutover atomique (RENAME TABLE) : verrouillage en millisecondes
  6. Supprimer l'ancienne table
  
  Temps d'arrêt total : millisecondes vs heures avec ALTER TABLE

Stratégie de sharding GitHub :
  Shard key : repository_id
  tables issues, pull_requests : co-localisées avec repositories
  JOIN entre repos et issues : reste sur le même shard → rapide !
\`\`\`

## Étude de cas 4 : SQLite de Cloudflare en périphérie

\`\`\`
Architecture D1 de Cloudflare :
  Chaque base D1 = fichier SQLite
  WAL SQLite streamé vers R2 (stockage objet compatible S3)
  R2 réplique globalement (cohérence éventuelle)
  
  Lectures : depuis le datacenter le plus proche → sub-milliseconde
  Cohérence : cohérence éventuelle cross-région (secondes de délai)

Pourquoi SQLite ?
  Zéro overhead serveur
  Transactions ACID : cohérence complète sur un nœud
  Empreinte minuscule : bibliothèque 500 Ko
\`\`\`

## Étude de cas 5 : Migration de base de données Notion

\`\`\`
Shard key : workspace_id (ID locataire)
  Toutes les données pour workspace X → shard basé sur hash(workspace_id)
  Requêtes co-localisées : WHERE workspace_id = ? → shard unique

Stratégie de migration :
  Phase 1 : Double écriture (monolithe ET cluster shardé)
  Phase 2 : Backfill (copier les données historiques)
  Phase 3 : Cutover des lectures (avec shadow reads pour vérification)
  Phase 4 : Cutover des écritures
  Phase 5 : Décommissionnement

Problèmes rencontrés :
  Grands workspaces : un workspace avec 50M blocs → shard surchargé
  Solution : shard dédié pour les grands workspaces
\`\`\`

## Thèmes communs

\`\`\`
1. L'amplification en écriture est le tueur silencieux
2. La complexité opérationnelle a un coût réel
3. La co-localisation est la clé pour éviter les transactions distribuées
4. La migration doit être sans temps d'arrêt :
   Double écriture → backfill → vérifier → cutover
5. On atteint toujours la limite d'une seule base de données :
   Concevoir pour la prochaine croissance 3-5x, pas 10x
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What was the root cause of Uber's PostgreSQL replication lag problem and how does InnoDB handle the same scenario differently?",
      options: [
        "PostgreSQL uses too much RAM for replication buffers; InnoDB uses less memory",
        "PostgreSQL MVCC creates a new heap tuple on every UPDATE and must update ALL secondary indexes with the new physical location (ctid), even if indexed columns didn't change — generating 12+ I/O operations and WAL records per logical write. InnoDB updates rows in-place in the clustered index and only updates secondary indexes for actually-changed indexed columns, generating far less WAL.",
        "PostgreSQL streaming replication uses TCP which is slower than InnoDB's binary log over UDP",
        "PostgreSQL writes to disk synchronously while InnoDB uses asynchronous writes",
      ],
      correct: 1,
    },
    {
      question:
        "Why did Discord's Cassandra cluster experience multi-second latency spikes and how does ScyllaDB's architecture prevent this?",
      options: [
        "Cassandra uses network RPC for every operation; ScyllaDB uses shared memory",
        "Cassandra is Java-based and subject to JVM stop-the-world GC pauses — with 32GB+ heaps, GC can pause ALL threads for seconds, queuing all requests. ScyllaDB is written in C++ with manual memory management and a custom NUMA-aware allocator, eliminating GC entirely. Its shard-per-core model also prevents lock contention between CPU cores.",
        "Cassandra's consistency level was set too high; ScyllaDB uses eventual consistency by default",
        "Cassandra compaction blocks reads; ScyllaDB uses a different compaction strategy",
      ],
      correct: 1,
    },
    {
      question:
        "How does gh-ost achieve online schema changes with only milliseconds of downtime instead of hours?",
      options: [
        "gh-ost uses MySQL's built-in online DDL feature which GitHub tuned for their workload",
        "gh-ost creates a ghost table with the new schema, copies rows in throttled chunks while reading concurrent changes from the MySQL binary log and applying them to the ghost table. After verification, it executes a near-atomic RENAME TABLE (milliseconds of lock) to swap the tables. No long table lock needed — only the final rename requires locking.",
        "gh-ost pauses replication during the migration to reduce the impact on replicas",
        "gh-ost splits the ALTER TABLE into smaller operations that each complete in milliseconds",
      ],
      correct: 1,
    },
    {
      question:
        "Why did Cloudflare choose SQLite over a traditional distributed database for D1, and what is the key architectural innovation?",
      options: [
        "SQLite is more scalable than distributed databases for write-heavy workloads",
        "Most applications need fast local consistency, not global distributed consistency. SQLite provides ACID transactions on a single node with zero server overhead. Durable Objects co-locate compute and SQLite storage with sticky routing — all requests for one object go to one server, providing single-node ACID without distributed coordination. WAL replication to R2 provides durability and eventual cross-region consistency.",
        "SQLite supports more SQL features than distributed databases like Cassandra",
        "Cloudflare chose SQLite because it is the only database that runs in WebAssembly",
      ],
      correct: 1,
    },
    {
      question:
        "What common mistake does Notion's case study highlight about shard key selection?",
      options: [
        "Sharding by a UUID primary key causes uneven distribution across shards",
        "The shard key must match your primary query pattern. Notion's queries are almost always WHERE workspace_id = ? — sharding by workspace_id co-locates all workspace data on one shard enabling fast single-shard queries. Sharding by block_id hash would scatter each workspace across all shards, turning every query into a slow scatter-gather across all shards.",
        "Sharding should use composite keys with at least two columns for even distribution",
        "The shard key should always be the table's primary key to maintain foreign key relationships",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quelle était la cause principale du problème de lag de réplication PostgreSQL chez Uber et comment InnoDB gère-t-il le même scénario différemment ?",
      options: [
        "PostgreSQL utilise trop de RAM pour les buffers de réplication ; InnoDB en utilise moins",
        "Le MVCC de PostgreSQL crée une nouvelle version de tuple heap à chaque UPDATE et doit mettre à jour TOUS les index secondaires avec le nouvel emplacement physique (ctid), même si les colonnes indexées n'ont pas changé — générant 12+ opérations I/O et enregistrements WAL par écriture logique. InnoDB met à jour les lignes en place et ne met à jour que les index secondaires pour les colonnes effectivement modifiées.",
        "La réplication streaming de PostgreSQL utilise TCP qui est plus lent que le binary log d'InnoDB",
        "PostgreSQL écrit sur disque de façon synchrone tandis qu'InnoDB utilise des écritures asynchrones",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi le cluster Cassandra de Discord connaissait-il des pics de latence de plusieurs secondes et comment l'architecture de ScyllaDB les prévient-elle ?",
      options: [
        "Cassandra utilise des RPC réseau pour chaque opération ; ScyllaDB utilise la mémoire partagée",
        "Cassandra est basé sur Java et sujet aux pauses GC stop-the-world de la JVM — avec des heaps de 32 Go+, le GC peut mettre en pause TOUS les threads pendant des secondes. ScyllaDB est écrit en C++ avec gestion manuelle de la mémoire, éliminant le GC entièrement. Son modèle shard-par-cœur empêche aussi la contention entre cœurs CPU.",
        "Le niveau de cohérence de Cassandra était trop élevé ; ScyllaDB utilise la cohérence éventuelle par défaut",
        "La compaction de Cassandra bloque les lectures ; ScyllaDB utilise une stratégie différente",
      ],
      correct: 1,
    },
    {
      question:
        "Comment gh-ost atteint-il des changements de schéma en ligne avec seulement quelques millisecondes de temps d'arrêt ?",
      options: [
        "gh-ost utilise la fonctionnalité DDL en ligne intégrée de MySQL",
        "gh-ost crée une table fantôme avec le nouveau schéma, copie les lignes par chunks limités tout en lisant les changements concurrents depuis le binlog MySQL et en les appliquant à la table fantôme. Après vérification, il exécute un RENAME TABLE quasi-atomique (millisecondes de verrou) pour échanger les tables. Pas de long verrou de table nécessaire.",
        "gh-ost met en pause la réplication pendant la migration pour réduire l'impact",
        "gh-ost divise l'ALTER TABLE en petites opérations complétant chacune en millisecondes",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi Cloudflare a-t-il choisi SQLite plutôt qu'une base de données distribuée traditionnelle pour D1 ?",
      options: [
        "SQLite est plus scalable que les bases distribuées pour les charges intensives en écriture",
        "La plupart des applications ont besoin de cohérence locale rapide, pas de cohérence distribuée globale. SQLite fournit des transactions ACID sur un seul nœud sans overhead serveur. Les Durable Objects co-localisent le calcul et le stockage SQLite avec un routage sticky — toutes les requêtes pour un objet vont sur un serveur, fournissant ACID sur nœud unique sans coordination distribuée.",
        "SQLite supporte plus de fonctionnalités SQL que les bases distribuées comme Cassandra",
        "Cloudflare a choisi SQLite car c'est la seule base de données fonctionnant en WebAssembly",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle erreur courante l'étude de cas de Notion met-elle en évidence concernant la sélection de la shard key ?",
      options: [
        "Le sharding par une clé primaire UUID cause une distribution inégale entre shards",
        "La shard key doit correspondre au motif de requête principal. Les requêtes de Notion sont presque toujours WHERE workspace_id = ? — sharder par workspace_id co-localise toutes les données d'un workspace sur un shard. Sharder par block_id hash disperserait chaque workspace sur tous les shards, transformant chaque requête en scatter-gather lent.",
        "La shard key devrait utiliser des clés composites avec au moins deux colonnes",
        "La shard key devrait toujours être la clé primaire de la table pour maintenir les relations de clés étrangères",
      ],
      correct: 1,
    },
  ],
};
