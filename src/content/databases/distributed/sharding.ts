export const content = {
  en: `# Sharding

## What Is Sharding?

Sharding (horizontal partitioning) splits data across multiple independent database nodes, each holding a subset of the total data. Unlike replication (which copies the same data to multiple nodes), sharding distributes different data to different nodes.

\`\`\`
Without sharding (vertical scaling):
  One database server handles all 1 billion rows
  → Eventually hits hardware ceiling (RAM, CPU, disk I/O)
  → Single point of failure
  → Write throughput limited to one machine

With sharding (horizontal scaling):
  Shard 1: rows 0-250M        Shard 2: rows 250M-500M
  Shard 3: rows 500M-750M     Shard 4: rows 750M-1B
  
  Each shard handles 250M rows
  Add more shards → linear scaling (theoretically)
  Each shard can be independently replicated for HA
\`\`\`

Sharding is the last resort for scaling — it adds enormous complexity. Always exhaust these options first:

\`\`\`
1. Add read replicas          (scale reads)
2. Add caching layer          (scale reads)
3. Vertical scaling           (bigger machine)
4. Table partitioning         (single-node, much simpler than sharding)
5. Archive old data           (reduce working set)
6. Connection pooling         (handle more concurrent connections)
7. Query optimization         (fix inefficient queries)
→ If none of these work: shard
\`\`\`

## Sharding Strategies

### Hash-Based Sharding

\`\`\`
shard_id = hash(shard_key) % num_shards

Example with 4 shards:
  user_id=1:    hash(1)   % 4 = 1 → Shard 1
  user_id=2:    hash(2)   % 4 = 2 → Shard 2
  user_id=100:  hash(100) % 4 = 0 → Shard 0
  user_id=101:  hash(101) % 4 = 1 → Shard 1
\`\`\`

\`\`\`
Advantages:
  ✓ Uniform distribution (good hash → even spread)
  ✓ Simple routing logic
  ✓ No hot spots for uniform access patterns

Disadvantages:
  ✗ Range queries span multiple shards:
    SELECT * FROM users WHERE user_id BETWEEN 100 AND 200
    → Must query ALL shards, merge results → scatter-gather
  ✗ Resharding is catastrophic:
    4 shards → 5 shards: hash(key) % 5 routes almost everything differently
    Must move ~80% of data to new locations
    → Consistent hashing solves this (see below)
\`\`\`

### Range-Based Sharding

\`\`\`
Divide key space into ranges, assign ranges to shards:

Shard 1: user_id 1         - 1,000,000
Shard 2: user_id 1,000,001 - 2,000,000
Shard 3: user_id 2,000,001 - 3,000,000

Routing table (stored in metadata service):
  [1, 1M)        → Shard 1
  [1M, 2M)       → Shard 2
  [2M, 3M)       → Shard 3
\`\`\`

\`\`\`
Advantages:
  ✓ Range queries stay on one shard (if within same range)
  ✓ Easy to add new shards (just add new range)
  ✓ Natural for time-series data (recent data on recent shard)

Disadvantages:
  ✗ Hot spots: sequential keys → all new writes go to last shard
    Auto-increment IDs: shard 3 gets all new users → write hot spot
    Timestamps: latest shard handles all new events → overwhelmed
  ✗ Uneven distribution: some ranges have more data than others
    Shard 1 (old users, inactive): 100K active rows
    Shard 3 (new users, active): 5M active rows → imbalanced
\`\`\`

### Consistent Hashing

The solution to hash-based sharding's resharding problem. Used by Cassandra, DynamoDB, Riak.

\`\`\`
Concept: arrange both nodes and keys on a circular hash ring (0 to 2^32)

Hash ring:
  Node A at position 10
  Node B at position 40
  Node C at position 70
  Node D at position 90

  Key K: hash(K) = 55 → go clockwise from 55 → first node is C at 70
                         → K is stored on Node C

Adding a new node E at position 60:
  Keys between 40-60 (previously went to C) now go to E
  Only keys in range (40-60] move → ~25% of data moves
  vs naive hash: ~80% of data moves
\`\`\`

\`\`\`
Virtual nodes (vnodes) for even distribution:
  Instead of each node having 1 position, each has 150 positions
  
  Node A: positions [10, 35, 67, 123, 200, ...]  (150 positions)
  Node B: positions [25, 48, 91, 140, 220, ...]
  Node C: positions [15, 55, 82, 160, 245, ...]
  
  Benefits:
    Even distribution even with heterogeneous nodes
    Adding a node: takes small portions from many nodes → fast rebalancing
    Removing a node: distributes load to many nodes → no single hot receiver

  Used by: Cassandra (256 vnodes per node default), DynamoDB
\`\`\`

### Directory-Based Sharding

\`\`\`
A lookup service (shard map) stores explicit key → shard mappings:

Shard map:
  user_id: 1-1000      → Shard 1
  user_id: 1001-5000   → Shard 2
  user_id: 5001-10000  → Shard 1  (moved back after rebalancing!)
  
Routing:
  Query shard map → get shard ID → route to correct shard

Advantages:
  ✓ Most flexible: any key can map to any shard
  ✓ Easy to rebalance: update shard map, move data, done
  ✓ Can route related keys to same shard (co-location)

Disadvantages:
  ✗ Shard map is a single point of failure (mitigated by caching + replication)
  ✗ Extra network hop for every query (mitigated by client-side caching)
  ✗ Shard map can become stale (client cached wrong shard)

Used by: MongoDB (config servers store chunk map),
         Vitess (MySQL sharding proxy), many custom implementations
\`\`\`

## Shard Key Selection — The Most Critical Decision

The shard key cannot be easily changed after data is loaded. Choosing wrong means rebuilding everything.

### Requirements for a Good Shard Key

\`\`\`
1. High cardinality:
   Many distinct values → data spread across many shards
   BAD:  shard by gender (only 2+ values → max 2 shards useful)
   BAD:  shard by country (US has 70% of users → hot shard)
   GOOD: shard by user_id (millions of distinct values)

2. Even distribution:
   Values should distribute evenly across the key space
   BAD:  shard by first letter of name (X, Y, Z are rare → small shards)
   GOOD: shard by hash(user_id) (uniform distribution)

3. Query locality:
   Queries should touch as few shards as possible
   BAD:  shard by user_id for queries that need all user orders
         SELECT * FROM orders WHERE user_id = 42
         → orders are on different shards than users → cross-shard join
   GOOD: shard orders by user_id (same shard as user profile)

4. Avoids write hot spots:
   Writes should distribute evenly across shards
   BAD:  shard by timestamp (all new data → last shard overwhelmed)
   GOOD: shard by hash(user_id) (writes spread evenly)
\`\`\`

### Real-World Shard Key Examples

\`\`\`
E-commerce (orders):
  BAD:  order_id (sequential → write hot spot)
  BAD:  status (low cardinality: pending/shipped/delivered)
  GOOD: customer_id (high cardinality, queries are per-customer,
                      orders co-located with customer)

Social network (posts):
  BAD:  timestamp (write hot spot, range queries cross shards)
  BAD:  post_id (queries like "all posts by user" cross all shards)
  GOOD: user_id (user's posts co-located, queries per-user are local)
  CONSIDER: (user_id, timestamp) compound key

Multi-tenant SaaS:
  NATURAL: tenant_id (all tenant data co-located)
           Tenant isolation: one tenant's load doesn't affect others
           Easy to move a tenant to a bigger shard
  RISK: large tenants → hot shards
        Mitigation: large tenants get dedicated shards

IoT / time-series:
  BAD:  timestamp only (all writes → one shard)
  GOOD: (device_id, timestamp) → writes spread by device,
                                   time range queries per device are local
\`\`\`

## Cross-Shard Operations — The Hard Part

### Scatter-Gather Queries

\`\`\`
Query: SELECT * FROM users WHERE age > 30 ORDER BY name LIMIT 10

With 4 shards (sharded by user_id, no index on age):
  Send to all 4 shards: SELECT * FROM users WHERE age > 30 ORDER BY name LIMIT 10
  Each shard returns its top 10
  Coordinator receives 40 results, merges, returns global top 10
  
  Problem: each shard must sort and return 10 rows → O(N/shards × log N/shards)
  With OFFSET: SELECT ... LIMIT 10 OFFSET 1000
    Each shard must return 1010 rows → coordinator receives 4040 rows → keeps 10
    → O(offset) work per shard → gets slower with deep pagination
    
Solution: avoid cross-shard sorts/pagination
  Add shard key to all queries: WHERE user_id = 42 AND age > 30
  Design data model so queries are per-shard
\`\`\`

### Cross-Shard Transactions

\`\`\`
Transfer $100 from Alice (Shard 1) to Bob (Shard 2):

Option 1: Two-Phase Commit (2PC)
  Phase 1 (Prepare):
    Coordinator → Shard 1: "Prepare to debit Alice $100"
    Coordinator → Shard 2: "Prepare to credit Bob $100"
    Both shards lock affected rows, verify constraints, reply "ready"
  
  Phase 2 (Commit):
    Coordinator → Shard 1: "Commit"
    Coordinator → Shard 2: "Commit"
    Both shards apply changes, release locks
  
  Problems:
    - Coordinator crash between Phase 1 and 2: shards hold locks forever
    - Synchronous: both shards blocked during entire protocol
    - Latency: 2 round trips minimum
    - Availability: if either shard unavailable → transaction blocked

Option 2: Saga Pattern
  Break into local transactions with compensating transactions:
  
  Step 1: Debit Alice (Shard 1) → publish "Alice debited" event
  Step 2: Credit Bob (Shard 2) → on "Alice debited" event
  
  If Step 2 fails:
    Compensating transaction: Credit Alice back (Shard 1)
    Publish "Transfer failed" event
  
  Eventually consistent — Alice might briefly see $0 during transaction
  No distributed locks
  Used by: microservices architecture, Stripe payment flows

Option 3: Avoid cross-shard transactions entirely
  Co-locate related data on same shard
  Design operations to be single-shard
  This is the best option — sharding strategy determines feasibility
\`\`\`

## Resharding — The Nightmare Scenario

\`\`\`
Why resharding happens:
  Shards grow larger than expected
  Traffic increases beyond what current shards handle
  Hot spots develop (one shard overwhelmed)

Resharding process (naive, painful):
  1. Spin up new shards
  2. Stop all writes (maintenance window!)
  3. Migrate data from old shards to new shards
  4. Update routing logic
  5. Resume writes
  
  For 100TB of data at 1GB/s transfer: 100,000 seconds = 28 hours downtime!

Online resharding (zero downtime, complex):
  1. New shards start empty
  2. Enable dual-write: writes go to old AND new shard
  3. Background migration: copy data from old to new
  4. Verify: checksums match
  5. Cut over reads to new shards
  6. Disable writes to old shards
  7. Decommission old shards
  
  This takes weeks for large datasets.
  Must handle: rows updated during migration, conflicts between old/new writes.

Consistent hashing advantage:
  Only keys in the moved range migrate
  ~1/N of data moves when adding 1 node to N-node cluster
  Much less data movement than naive resharding
\`\`\`

## Vitess — MySQL Sharding at Scale

Vitess is YouTube's MySQL sharding solution, now used by Slack, GitHub, PlanetScale:

\`\`\`
Architecture:
  VTGate: query router (stateless, many instances)
    → parses query, determines target shards, routes
    → merges results for cross-shard queries
    → connection pooling
  
  VTTablet: per-MySQL-instance agent
    → query rewriting (adds shard-aware filters)
    → connection pooling per shard
    → metrics and health checking
  
  Topology service: shard map (uses etcd or Zookeeper)
    → VTGate reads shard map to route queries
    → updated during resharding

Resharding in Vitess:
  1. vreplication: CDC-based live migration
     Old shard → VReplication stream → New shards
     Reads binlog, applies changes as they happen
  2. Traffic switching: flip reads, then writes
  3. Cutover: seconds of downtime at most
  
  YouTube reshards without any maintenance windows.
\`\`\`

## Citus — PostgreSQL Sharding

\`\`\`
Citus extends PostgreSQL with transparent sharding:

  CREATE TABLE orders (
    order_id BIGINT,
    user_id  INT,
    total    DECIMAL
  );
  
  -- Distribute table across workers by user_id
  SELECT create_distributed_table('orders', 'user_id');
  
  -- Citus creates 32 shards by default (configurable)
  -- Shard placement: each shard has primary + replica worker
  
Query routing (transparent to application):
  SELECT * FROM orders WHERE user_id = 42;
  → Citus router: hash(42) → shard 7 → Worker 2
  → Sends query directly to Worker 2
  → Returns result to coordinator → client

Cross-shard aggregation:
  SELECT user_id, SUM(total) FROM orders GROUP BY user_id;
  → Coordinator sends to all workers
  → Each worker aggregates its local shards
  → Coordinator merges partial aggregates
  → Returns final result

Co-location:
  -- If users and orders are both sharded by user_id:
  SELECT u.name, SUM(o.total)
  FROM users u JOIN orders o ON u.user_id = o.user_id
  GROUP BY u.name;
  → Each worker can do the JOIN locally (co-located data)
  → No cross-network data transfer for the JOIN
\`\`\`

## Sharding Anti-Patterns

\`\`\`
Anti-pattern 1: Sharding too early
  "We might need to scale someday" → shard now
  Reality: sharding adds 10x operational complexity
  Most applications never need sharding
  Fix: vertical scale first, then read replicas, then shard

Anti-pattern 2: Wrong shard key
  Shard by user_id but queries are: SELECT * FROM events WHERE type='click'
  → Every query hits every shard (scatter-gather always)
  Fix: shard by the dimension you filter most

Anti-pattern 3: Cross-shard foreign keys
  User on Shard 1, orders on Shard 2, with foreign key constraint
  → Database can't enforce the constraint
  → Application must enforce referential integrity
  Fix: co-locate related tables on same shard

Anti-pattern 4: Assuming sharding = unlimited scale
  Sharding scales writes and storage, NOT complex queries
  SELECT with 5 JOINs across 10 shards = 10 scatter-gather queries + merge
  → Often slower than single-node with good indexes
  Fix: design for per-shard queries, denormalize for cross-entity reads
\`\`\`
`,

  fr: `# Sharding

## Qu'est-ce que le sharding ?

Le sharding (partitionnement horizontal) répartit les données sur plusieurs nœuds de base de données indépendants, chacun contenant un sous-ensemble des données totales.

\`\`\`
Sans sharding : un seul serveur gère 1 milliard de lignes
  → Atteint finalement le plafond matériel
  → Point de défaillance unique

Avec sharding :
  Shard 1 : lignes 0-250M      Shard 2 : lignes 250M-500M
  Shard 3 : lignes 500M-750M   Shard 4 : lignes 750M-1B
  
  Chaque shard gère 250M lignes
  Ajouter des shards → scalabilité linéaire (en théorie)
\`\`\`

## Stratégies de sharding

### Sharding basé sur le hachage

\`\`\`
shard_id = hash(clé_shard) % num_shards

Avantages :
  ✓ Distribution uniforme
  ✓ Logique de routage simple

Inconvénients :
  ✗ Les requêtes de plage couvrent plusieurs shards
  ✗ Le resharding est catastrophique :
    4 shards → 5 shards : ~80% des données doivent bouger
    → Le hachage cohérent résout ce problème
\`\`\`

### Sharding basé sur les plages

\`\`\`
Diviser l'espace de clés en plages, assigner les plages aux shards :

Shard 1 : user_id 1 - 1 000 000
Shard 2 : user_id 1 000 001 - 2 000 000

Avantages :
  ✓ Les requêtes de plage restent sur un shard
  ✓ Facile d'ajouter de nouveaux shards

Inconvénients :
  ✗ Hotspots : clés séquentielles → toutes les nouvelles écritures sur le dernier shard
  ✗ Distribution inégale
\`\`\`

### Hachage cohérent

\`\`\`
Placer les nœuds et les clés sur un anneau de hachage circulaire (0 à 2^32)

Anneau de hachage :
  Nœud A à la position 10
  Nœud B à la position 40
  Nœud C à la position 70

  Clé K : hash(K) = 55 → aller dans le sens horaire depuis 55 → premier nœud est C à 70

Ajout d'un nouveau nœud E à la position 60 :
  Seules les clés entre 40-60 bougent vers E
  ~25% des données bougent vs ~80% avec le hachage naïf
\`\`\`

## Sélection de la clé de shard — La décision la plus critique

\`\`\`
Exigences pour une bonne clé de shard :

1. Haute cardinalité : beaucoup de valeurs distinctes
   MAUVAIS : shard par genre (seulement 2+ valeurs)
   BON :     shard par user_id (millions de valeurs distinctes)

2. Distribution uniforme :
   MAUVAIS : shard par première lettre du nom
   BON :     shard par hash(user_id)

3. Localité des requêtes :
   MAUVAIS : shard par user_id pour des requêtes qui nécessitent toutes les commandes
   BON :     shard les commandes par user_id (même shard que le profil utilisateur)

4. Évite les hotspots en écriture :
   MAUVAIS : shard par timestamp (toutes les nouvelles données → dernier shard)
   BON :     shard par hash(user_id)
\`\`\`

## Opérations cross-shard — La partie difficile

### Transactions cross-shard

\`\`\`
Option 1 : Two-Phase Commit (2PC)
  Phase 1 (Préparer) : les deux shards verrouillent les lignes affectées
  Phase 2 (Committer) : les deux shards appliquent les changements
  
  Problèmes : crash du coordinateur, latence, disponibilité

Option 2 : Saga Pattern
  Décomposer en transactions locales avec des transactions compensatoires
  
  Étape 1 : Débiter Alice (Shard 1) → publier événement
  Étape 2 : Créditer Bob (Shard 2) → sur événement
  
  Si l'étape 2 échoue :
    Transaction compensatoire : recréditer Alice (Shard 1)
  
  Cohérence éventuelle — pas de verrous distribués

Option 3 : Éviter les transactions cross-shard (meilleure option)
  Co-localiser les données liées sur le même shard
\`\`\`

## Anti-patterns de sharding

\`\`\`
Anti-pattern 1 : Sharder trop tôt
  "Nous pourrions avoir besoin de scaler un jour" → sharder maintenant
  Réalité : le sharding ajoute une complexité opérationnelle 10x

Anti-pattern 2 : Mauvaise clé de shard
  Shard par user_id mais les requêtes sont : SELECT * FROM events WHERE type='click'
  → Chaque requête touche chaque shard (scatter-gather toujours)

Anti-pattern 3 : Clés étrangères cross-shard
  La base de données ne peut pas appliquer la contrainte
  → L'application doit assurer l'intégrité référentielle

Anti-pattern 4 : Supposer que le sharding = scalabilité illimitée
  Le sharding scale les écritures et le stockage, PAS les requêtes complexes
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "Why does consistent hashing dramatically reduce data movement during resharding compared to naive hash-based sharding?",
      options: [
        "Consistent hashing compresses data before moving it, reducing transfer time",
        "With naive hashing (key % N shards), changing N reshuffles almost all keys. Consistent hashing places keys on a ring — adding one node only takes keys from its immediate neighbors on the ring, moving approximately 1/N of total data instead of ~(N-1)/N.",
        "Consistent hashing uses virtual nodes that can be migrated without moving actual data",
        "Consistent hashing reserves empty shards in advance, so resharding only requires routing updates"
      ],
      correct: 1,
    },
    {
      question: "What makes a monotonically increasing field (like an auto-increment ID or timestamp) a bad shard key for range-based sharding?",
      options: [
        "Auto-increment IDs have low cardinality and cause uneven distribution",
        "All new writes always go to the shard responsible for the highest range, creating a write hot spot where one shard handles all inserts while others sit idle. The data distribution also becomes increasingly uneven over time.",
        "Monotonically increasing keys cannot be hashed efficiently",
        "Range-based sharding does not support numeric keys"
      ],
      correct: 1,
    },
    {
      question: "What is the fundamental problem with Two-Phase Commit (2PC) for cross-shard transactions and how does the Saga pattern address it?",
      options: [
        "2PC requires all shards to be on the same network segment; Saga works across datacenters",
        "2PC blocks both shards for the entire protocol duration and fails entirely if the coordinator crashes between phases, leaving shards with locks held indefinitely. Saga breaks the transaction into local transactions with compensating rollbacks — each step commits independently, providing eventual consistency without distributed locks.",
        "2PC can only handle two shards; Saga supports any number of shards",
        "2PC requires synchronous replication; Saga works with asynchronous replication"
      ],
      correct: 1,
    },
    {
      question: "Why is co-locating related data on the same shard so important for sharded systems?",
      options: [
        "Co-location reduces storage costs by deduplicating shared data",
        "When related data (e.g., users and their orders) is on different shards, joins require cross-shard queries that fan out to multiple shards and merge results — often slower than a single-node query. Co-location keeps joins local to one shard, eliminating cross-network data transfer and scatter-gather overhead.",
        "Co-location allows the database to enforce foreign key constraints across shards",
        "Co-location enables the use of range-based sharding instead of hash-based sharding"
      ],
      correct: 1,
    },
    {
      question: "Why does deep OFFSET-based pagination become catastrophically slow in sharded systems?",
      options: [
        "OFFSET is not supported by most sharding proxies",
        "Each shard must scan and return (offset + limit) rows — for OFFSET 1000 LIMIT 10 across 4 shards, each shard returns 1010 rows, the coordinator receives 4040 rows and discards 4030. The work grows linearly with offset depth, multiplied by the number of shards.",
        "OFFSET pagination causes distributed locks that block writes on all shards",
        "OFFSET pagination requires sorting all data globally before filtering"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Pourquoi le hachage cohérent réduit-il considérablement le mouvement de données lors du resharding par rapport au sharding basé sur le hachage naïf ?",
      options: [
        "Le hachage cohérent compresse les données avant de les déplacer, réduisant le temps de transfert",
        "Avec le hachage naïf (clé % N shards), changer N redistribue presque toutes les clés. Le hachage cohérent place les clés sur un anneau — ajouter un nœud ne prend que les clés de ses voisins immédiats, déplaçant environ 1/N des données totales au lieu de ~(N-1)/N.",
        "Le hachage cohérent utilise des nœuds virtuels qui peuvent être migrés sans déplacer les données réelles",
        "Le hachage cohérent réserve des shards vides à l'avance, donc le resharding nécessite uniquement des mises à jour de routage"
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce qui fait d'un champ monotoniquement croissant (comme un ID auto-increment) une mauvaise clé de shard pour le sharding basé sur les plages ?",
      options: [
        "Les IDs auto-increment ont une faible cardinalité et causent une distribution inégale",
        "Toutes les nouvelles écritures vont toujours sur le shard responsable de la plage la plus haute, créant un hotspot en écriture où un shard gère toutes les insertions pendant que les autres sont inactifs. La distribution des données devient aussi de plus en plus inégale.",
        "Les clés monotoniquement croissantes ne peuvent pas être hachées efficacement",
        "Le sharding basé sur les plages ne supporte pas les clés numériques"
      ],
      correct: 1,
    },
    {
      question: "Quel est le problème fondamental du Two-Phase Commit (2PC) pour les transactions cross-shard et comment le Saga pattern y répond-il ?",
      options: [
        "2PC nécessite que tous les shards soient sur le même segment réseau ; Saga fonctionne entre datacenters",
        "2PC bloque les deux shards pendant toute la durée du protocole et échoue complètement si le coordinateur plante entre les phases. Saga décompose la transaction en transactions locales avec des rollbacks compensatoires — chaque étape committe indépendamment, fournissant une cohérence éventuelle sans verrous distribués.",
        "2PC ne peut gérer que deux shards ; Saga supporte n'importe quel nombre de shards",
        "2PC nécessite une réplication synchrone ; Saga fonctionne avec une réplication asynchrone"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi la co-localisation de données liées sur le même shard est-elle si importante pour les systèmes shardés ?",
      options: [
        "La co-localisation réduit les coûts de stockage en dédupliquant les données partagées",
        "Quand les données liées (ex: utilisateurs et leurs commandes) sont sur des shards différents, les jointures nécessitent des requêtes cross-shard qui se propagent sur plusieurs shards et fusionnent les résultats. La co-localisation garde les jointures locales à un shard, éliminant le transfert de données cross-réseau.",
        "La co-localisation permet à la base de données d'appliquer les contraintes de clés étrangères",
        "La co-localisation permet l'utilisation du sharding basé sur les plages plutôt que le hachage"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi la pagination profonde basée sur OFFSET devient-elle catastrophiquement lente dans les systèmes shardés ?",
      options: [
        "OFFSET n'est pas supporté par la plupart des proxies de sharding",
        "Chaque shard doit scanner et retourner (offset + limit) lignes — pour OFFSET 1000 LIMIT 10 sur 4 shards, chaque shard retourne 1010 lignes, le coordinateur reçoit 4040 lignes et en jette 4030. Le travail croît linéairement avec la profondeur de l'offset, multiplié par le nombre de shards.",
        "La pagination OFFSET cause des verrous distribués qui bloquent les écritures sur tous les shards",
        "La pagination OFFSET nécessite de trier toutes les données globalement avant de filtrer"
      ],
      correct: 1,
    },
  ],
};
