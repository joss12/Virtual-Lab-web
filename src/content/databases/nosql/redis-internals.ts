export const content = {
  en: `# Redis Internals

## What Makes Redis Different

Redis is not just a cache. It is an **in-memory data structure server** — every data type (strings, lists, sets, sorted sets, hashes, streams) is a first-class citizen with its own optimized implementation.

\`\`\`
What Redis is:
  ✓ In-memory key-value store with rich data types
  ✓ Sub-millisecond latency (memory access, no disk I/O on reads)
  ✓ Single-threaded command processing (no locks, no races)
  ✓ Optional persistence (RDB snapshots + AOF log)
  ✓ Pub/Sub messaging
  ✓ Lua scripting
  ✓ Transactions (MULTI/EXEC)
  ✓ Streams (append-only log, consumer groups)

What Redis is not:
  ✗ A relational database (no SQL, no joins)
  ✗ A durable first database (data loss possible on crash without AOF fsync=always)
  ✗ Suitable for data larger than RAM
\`\`\`

## Single-Threaded Architecture

Redis processes commands in a **single thread**. This is one of its most misunderstood design decisions.

\`\`\`
Event Loop (based on epoll/kqueue):
  while true:
    events = epoll_wait(fd_set, timeout)
    for event in events:
      if event.type == READABLE:
        read_command_from_client(event.fd)
        execute_command()           ← single-threaded, no locks needed
        write_response(event.fd)
      if event.type == WRITABLE:
        flush_output_buffer(event.fd)
\`\`\`

\`\`\`
Why single-threaded works:
  Redis operations are O(1) or O(log N) — microseconds each
  At 100K ops/sec: 10μs per op average
  Single core can handle 1M+ simple ops/sec
  No mutex contention, no context switches, no cache coherence overhead

  Multi-threading overhead for in-memory operations:
    Lock acquisition: 50-100ns
    Cache line invalidation: 100-200ns
    Context switch: 1-10μs
  For a 1μs Redis operation, these costs are significant.

What IS multi-threaded in Redis 6.0+:
  Network I/O (reading requests, writing responses) — uses thread pool
  Lazy deletion (UNLINK, FLUSHDB ASYNC)
  AOF fsync
  Command PROCESSING remains single-threaded
\`\`\`

## Memory Layout — Every Object Has a Header

Every Redis value is a **robj (Redis Object)**:

\`\`\`c
typedef struct redisObject {
    unsigned type:4;      // STRING, LIST, SET, ZSET, HASH, STREAM
    unsigned encoding:4;  // internal encoding (see below)
    unsigned lru:24;      // LRU clock for eviction
    int refcount;         // reference counting (shared objects)
    void *ptr;            // pointer to actual data
} robj;
// Size: 16 bytes overhead per object
\`\`\`

The **encoding** field is what makes Redis memory-efficient. The same logical type can use different internal representations depending on size:

\`\`\`
String (type=STRING):
  encoding=INT        → store directly in ptr (no allocation!) for integers < 2^63
  encoding=EMBSTR     → embed string in robj itself (≤44 bytes, single allocation)
  encoding=RAW        → separate SDS allocation (>44 bytes)

List (type=LIST):
  encoding=LISTPACK   → compact byte array (small lists, ≤128 elements, values ≤64 bytes)
  encoding=QUICKLIST  → doubly linked list of listpack nodes (large lists)

Hash (type=HASH):
  encoding=LISTPACK   → compact key-value pairs (≤128 fields, values ≤64 bytes)
  encoding=HASHTABLE  → full hash table (large hashes)

Set (type=SET):
  encoding=LISTPACK   → compact list (≤128 elements, string values ≤64 bytes)
  encoding=INTSET     → packed integer array (all elements are integers, ≤512)
  encoding=HASHTABLE  → full hash table

Sorted Set (type=ZSET):
  encoding=LISTPACK   → compact list (≤128 elements, values ≤64 bytes)
  encoding=SKIPLIST   → skip list + hash table (large sorted sets)
\`\`\`

## SDS — Simple Dynamic Strings

Redis does not use C strings (null-terminated). It uses **SDS (Simple Dynamic Strings)**:

\`\`\`c
struct sdshdr64 {
    uint64_t len;      // current string length (O(1) strlen)
    uint64_t alloc;    // allocated space (no realloc needed if len < alloc)
    unsigned char flags; // SDS type (sdshdr8, sdshdr16, sdshdr32, sdshdr64)
    char buf[];        // actual string data (null-terminated for C compat)
};
\`\`\`

\`\`\`
SDS advantages over C strings:
  O(1) length: stored in header, no strlen() scan
  Binary-safe: can contain \\0 bytes (images, serialized data)
  No buffer overflow: tracks allocation size
  Efficient append: if alloc > len, no realloc needed
  
  "Hello" as C string:  ['H','e','l','l','o','\\0'] = 6 bytes
  "Hello" as SDS:       [len=5][alloc=8]['H','e','l','l','o','\\0'] + header
  Overhead: ~10 bytes but O(1) operations and no buffer overflows
\`\`\`

## Listpack — The Compact Encoding

Listpack is a memory-efficient sequential data structure used as the compact encoding for small lists, hashes, and sorted sets:

\`\`\`
Listpack memory layout:
  [total_bytes: 4B][num_elements: 2B][entry_1][entry_2]...[entry_N][end: 0xFF]

Each entry:
  [encoding + data][backlen]
  
  encoding = 1 byte that indicates:
    - Integer encodings: 7-bit uint, 13-bit int, 16/24/32/64-bit int
    - String encoding: length prefix + bytes
  
  backlen = length of this entry (for backward traversal)

Example: Hash {name: "Alice", age: 30}
  Listpack: [total=32][num=4]["name"]["Alice"]["age"][30][0xFF]
  Total: ~32 bytes

vs Hash Table: minimum ~160 bytes (hash table overhead + 4 robj headers)
→ Listpack is 5x more memory-efficient for small hashes
\`\`\`

## Skip List — The Sorted Set Engine

Sorted sets use a **skip list** as their primary data structure. Skip lists provide O(log N) operations without the complexity of tree rebalancing.

\`\`\`
Skip list structure (conceptual):
Level 3: [HEAD] ────────────────────────────→ [50] ──→ [NULL]
Level 2: [HEAD] ──────────→ [20] ──────────→ [50] ──→ [NULL]
Level 1: [HEAD] ──→ [10] → [20] ──→ [30] → [50] ──→ [NULL]
Level 0: [HEAD] → [10] → [20] → [25] → [30] → [40] → [50] → [NULL]

Each node appears at level 0 (always) and higher levels with probability 1/4.
\`\`\`

\`\`\`c
typedef struct zskiplistNode {
    sds ele;             // member (the string value)
    double score;        // sort key
    struct zskiplistNode *backward; // previous node (level 0 only)
    struct zskiplistLevel {
        struct zskiplistNode *forward; // next node at this level
        unsigned long span;  // number of nodes skipped (for rank queries)
    } level[];
} zskiplistNode;
\`\`\`

\`\`\`
Why skip list instead of B-tree for sorted sets?
  Skip list advantages:
    - Simple to implement (Redis values code simplicity)
    - O(log N) insert/delete/lookup
    - O(log N) range queries (ZRANGEBYSCORE, ZRANGE)
    - Lock-free variants easier to implement
    - Cache-friendly traversal at lower levels

  B-tree advantages:
    - Better cache performance (dense storage)
    - Predictable height (O(log N) guaranteed)

Redis also maintains a hash table alongside the skip list:
  Skip list: for range queries (ZRANGE, ZRANK, ZRANGEBYSCORE)
  Hash table: for O(1) score lookup (ZSCORE member)
  Both updated on every write — dual structure costs memory but enables both access patterns
\`\`\`

## Persistence — RDB vs AOF

### RDB (Redis Database) — Point-in-Time Snapshots

\`\`\`
RDB snapshot process:
  1. Redis calls fork() — creates child process
  2. Child process writes entire dataset to temp file (dump.rdb.tmp)
  3. Child process renames temp file to dump.rdb (atomic)
  4. Parent continues serving requests

Copy-on-Write (COW):
  After fork(), parent and child share the same memory pages.
  When parent modifies a page, OS creates a copy for the parent.
  Child reads original pages (consistent snapshot point).
  
  Memory overhead: up to 2x RAM if all pages are modified during snapshot
  (Usually 10-30% overhead in practice — not all pages modified)

Configuration:
  save 900 1      # save if 1 key changed in 900 seconds
  save 300 10     # save if 10 keys changed in 300 seconds
  save 60 10000   # save if 10000 keys changed in 60 seconds

  bgsave          # trigger manual background save
  BGSAVE          # Redis command equivalent
\`\`\`

\`\`\`
RDB advantages:
  Compact binary format (compressed with LZF)
  Fast restarts (load entire dataset at once)
  No runtime overhead between snapshots
  Good for backups and disaster recovery

RDB disadvantages:
  Data loss between snapshots (up to 15 minutes by default)
  fork() pauses the parent briefly (CoW setup) — can cause latency spike
  On large datasets (100GB+), fork() itself takes seconds
\`\`\`

### AOF (Append Only File) — Write-Ahead Log

\`\`\`
Every write command is appended to the AOF file:
  SET foo bar     → "SET foo bar\\r\\n" appended
  INCR counter    → "INCR counter\\r\\n" appended
  LPUSH list a b  → "LPUSH list a b\\r\\n" appended

AOF file grows indefinitely → AOF rewrite (compaction):
  Current state: counter=42, foo="bar", list=[a,b,c]
  Rewritten AOF: SET counter 42\\r\\nSET foo bar\\r\\nRPUSH list a b c\\r\\n
  (history compressed into current state commands)
\`\`\`

\`\`\`
appendfsync options (fsync = flush to disk):
  always:   fsync on every write command
            → maximum durability, ~1 write/sec throughput (disk I/O bound)
            → use for financial data

  everysec: fsync every 1 second (default)
            → at most 1 second of data loss on crash
            → good balance of durability and performance

  no:       let OS decide when to fsync (usually every 30 seconds)
            → fastest, worst durability
            → basically no durability guarantee

AOF advantages:
  Less data loss (everysec = max 1 second loss)
  Human-readable format (can manually edit to fix corruption)
  append-only → no corruption from partial writes

AOF disadvantages:
  Larger files than RDB
  Slower restart (must replay all commands)
  AOF rewrite uses fork() (same CoW overhead as RDB)
\`\`\`

### Recommended Configuration (Production)

\`\`\`
# Use both RDB + AOF for best durability + fast restart
save 3600 1
save 300 100
save 60 10000
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
\`\`\`

## Eviction Policies

When Redis reaches \`maxmemory\`, it must evict keys:

\`\`\`
maxmemory-policy options:

noeviction:        return error on write when memory full (default)
                   → cache becomes write-unavailable

allkeys-lru:       evict least recently used key from all keys
                   → best general-purpose cache policy

volatile-lru:      evict LRU key only from keys with TTL set
                   → use if mixing persistent + cache data

allkeys-lfu:       evict least frequently used key (Redis 4.0+)
                   → better than LRU for skewed access patterns

volatile-ttl:      evict key with shortest remaining TTL
                   → good if you set TTLs intentionally for importance

allkeys-random:    evict random key
                   → only if access pattern is perfectly uniform

volatile-lfu:      LFU from keys with TTL
\`\`\`

\`\`\`
LRU implementation (approximate):
  True LRU requires a doubly-linked list — too much memory overhead
  Redis uses approximate LRU: sample N random keys (maxmemory-samples=5 default)
  Evict the one with oldest LRU clock value
  
  With N=5: 95% accuracy vs true LRU at 1/5 the memory cost
  With N=10: 98% accuracy
\`\`\`

## Redis Cluster

Horizontal scaling via automatic sharding across 16384 hash slots:

\`\`\`
Hash slot assignment:
  slot = CRC16(key) % 16384
  
  3-node cluster default:
    Node A: slots 0    - 5460
    Node B: slots 5461 - 10922
    Node C: slots 10923 - 16383

  Key "foo":   CRC16("foo") % 16384 = 7638 → Node B
  Key "hello": CRC16("hello") % 16384 = 866 → Node A

Hash tags for co-location:
  {user:1}:profile → CRC16("user:1") — both keys go to same slot
  {user:1}:sessions
  Use when you need MULTI/EXEC across multiple keys
\`\`\`

\`\`\`
Cluster topology (minimum: 6 nodes — 3 primary + 3 replica):
  Node A (primary: 0-5460)    ←→  Node D (replica of A)
  Node B (primary: 5461-10922) ←→  Node E (replica of B)
  Node C (primary: 10923-16383) ←→ Node F (replica of C)

Failover:
  Node A fails → Node D promotes itself to primary
  CRC16 routing unchanged (same slot range)
  Cluster uses gossip protocol for failure detection (same concept as Cassandra)
\`\`\`

## Common Redis Patterns

### Distributed Lock (Redlock)

\`\`\`
Simple lock (single node):
  SET lock:resource UUID NX PX 30000
  NX = only set if not exists
  PX 30000 = expire in 30 seconds (prevents infinite lock on crash)

  Release (Lua script — atomic check+delete):
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
  else
    return 0
  end

Redlock (multi-node, safer):
  Acquire lock on N/2+1 Redis nodes (majority)
  Lock is valid only if acquired on majority within validity time
  Ensures lock survives single node failure
\`\`\`

### Rate Limiting

\`\`\`
Fixed window:
  INCR rate:user:1:2024010112   # key = user + hour bucket
  EXPIRE rate:user:1:2024010112 3600
  If count > limit: reject request

Sliding window (more accurate):
  ZADD rate:user:1 timestamp timestamp  # score = timestamp, member = timestamp
  ZREMRANGEBYSCORE rate:user:1 0 (now - window)  # remove old entries
  count = ZCARD rate:user:1
  EXPIRE rate:user:1 window
  If count > limit: reject

Token bucket (Lua script for atomicity):
  tokens = GET tokens:user:1
  last_refill = GET last_refill:user:1
  elapsed = now - last_refill
  tokens = min(max_tokens, tokens + elapsed * refill_rate)
  if tokens >= 1: SET tokens:user:1 tokens-1; allow
  else: reject
\`\`\`

### Cache-Aside Pattern

\`\`\`python
def get_user(user_id):
    # Try cache first
    cached = redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)
    
    # Cache miss — load from database
    user = db.query("SELECT * FROM users WHERE id = ?", user_id)
    
    # Store in cache with TTL
    redis.setex(f"user:{user_id}", 3600, json.dumps(user))
    
    return user

def update_user(user_id, data):
    db.execute("UPDATE users SET ... WHERE id = ?", user_id, data)
    # Invalidate cache (delete, not update — avoids race conditions)
    redis.delete(f"user:{user_id}")
\`\`\`

### Pub/Sub vs Streams

\`\`\`
Pub/Sub (fire and forget):
  SUBSCRIBE notifications
  PUBLISH notifications "user:1:logged_in"
  
  No persistence — missed if subscriber offline
  No consumer groups — all subscribers receive all messages
  Use for: real-time notifications, live updates

Streams (durable message log, Redis 5.0+):
  XADD events * user_id 1 action "login"   # * = auto-generate ID
  XREAD COUNT 10 STREAMS events 0           # read from beginning
  
  Consumer groups (Kafka-like):
  XGROUP CREATE events workers $ MKSTREAM
  XREADGROUP GROUP workers consumer1 COUNT 10 STREAMS events >
  XACK events workers message_id            # acknowledge processed
  
  Streams persist — messages survive subscriber restarts
  Consumer groups — each message delivered to exactly one consumer in group
  Use for: task queues, event sourcing, audit logs
\`\`\`
`,

  fr: `# Internals de Redis

## Ce qui rend Redis différent

Redis n'est pas juste un cache. C'est un **serveur de structures de données en mémoire** — chaque type de données a sa propre implémentation optimisée.

## Architecture mono-thread

Redis traite les commandes dans un **seul thread**.

\`\`\`
Pourquoi le mono-thread fonctionne :
  Les opérations Redis sont O(1) ou O(log N) — microsecondes chacune
  Un seul cœur peut gérer 1M+ opérations simples/sec
  Pas de contention de mutex, pas de changements de contexte

Ce qui EST multi-thread dans Redis 6.0+ :
  I/O réseau (lecture des requêtes, écriture des réponses)
  Suppression lazy (UNLINK, FLUSHDB ASYNC)
  Le traitement des COMMANDES reste mono-thread
\`\`\`

## Encodages internes

\`\`\`
String :
  encoding=INT      → stocker directement dans ptr pour les entiers < 2^63
  encoding=EMBSTR   → intégrer la chaîne dans robj (≤44 octets)
  encoding=RAW      → allocation SDS séparée (>44 octets)

Liste :
  encoding=LISTPACK → tableau d'octets compact (petites listes)
  encoding=QUICKLIST → liste doublement chaînée de nœuds listpack

Hash :
  encoding=LISTPACK → paires clé-valeur compactes (≤128 champs)
  encoding=HASHTABLE → table de hachage complète

Set trié :
  encoding=LISTPACK → liste compacte (≤128 éléments)
  encoding=SKIPLIST → liste de saut + table de hachage
\`\`\`

## Skip List — Le moteur des sets triés

\`\`\`
Structure de liste de saut :
Niveau 3 : [HEAD] ──────────────────────────→ [50] → [NULL]
Niveau 2 : [HEAD] ──────────→ [20] ──────────→ [50] → [NULL]
Niveau 1 : [HEAD] ──→ [10] → [20] ──→ [30] → [50] → [NULL]
Niveau 0 : [HEAD] → [10] → [20] → [25] → [30] → [40] → [50] → [NULL]

Redis maintient aussi une table de hachage en parallèle :
  Liste de saut : pour les requêtes de plage (ZRANGE, ZRANGEBYSCORE)
  Table de hachage : pour le lookup O(1) de score (ZSCORE membre)
\`\`\`

## Persistance — RDB vs AOF

### RDB — Snapshots ponctuels

\`\`\`
Processus de snapshot RDB :
  1. Redis appelle fork() — crée un processus enfant
  2. L'enfant écrit tout le dataset dans un fichier temp
  3. L'enfant renomme le fichier temp en dump.rdb (atomique)
  4. Le parent continue de servir les requêtes

Copy-on-Write (COW) :
  Après fork(), parent et enfant partagent les mêmes pages mémoire
  Quand le parent modifie une page, l'OS crée une copie
  Surcharge mémoire : jusqu'à 2x RAM si toutes les pages sont modifiées
  (En pratique 10-30%)
\`\`\`

### AOF — Write-Ahead Log

\`\`\`
Options appendfsync :
  always:   fsync à chaque commande d'écriture
            → durabilité maximale, ~1 écriture/sec
            → pour les données financières

  everysec: fsync toutes les secondes (défaut)
            → au plus 1 seconde de perte de données
            → bon équilibre durabilité/performance

  no:       laisser l'OS décider (généralement toutes les 30 secondes)
            → le plus rapide, moins de durabilité
\`\`\`

## Politiques d'éviction

\`\`\`
allkeys-lru :   évincer la clé la moins récemment utilisée parmi toutes les clés
volatile-lru :  évincer LRU uniquement parmi les clés avec TTL
allkeys-lfu :   évincer la clé la moins fréquemment utilisée (Redis 4.0+)
volatile-ttl :  évincer la clé avec le TTL restant le plus court
noeviction :    retourner une erreur en écriture quand la mémoire est pleine
\`\`\`

## Patterns Redis communs

### Verrou distribué

\`\`\`
SET lock:resource UUID NX PX 30000
NX = définir seulement si inexistant
PX 30000 = expirer dans 30 secondes

Libération (script Lua — atomique) :
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
\`\`\`

### Limitation de débit

\`\`\`
Fenêtre fixe :
  INCR rate:user:1:2024010112
  EXPIRE rate:user:1:2024010112 3600
  Si count > limite : rejeter la requête

Fenêtre glissante :
  ZADD rate:user:1 timestamp timestamp
  ZREMRANGEBYSCORE rate:user:1 0 (maintenant - fenêtre)
  count = ZCARD rate:user:1
\`\`\`

### Pub/Sub vs Streams

\`\`\`
Pub/Sub (fire and forget) :
  Pas de persistance — manqué si l'abonné est hors ligne
  Pour : notifications temps réel

Streams (journal de messages durable, Redis 5.0+) :
  XADD events * user_id 1 action "login"
  Groupes de consommateurs — chaque message livré à exactement un consommateur
  Pour : files de tâches, event sourcing, logs d'audit
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "Why does Redis use a single-threaded event loop for command processing, and what are the limits of this approach?",
      options: [
        "Single-threaded is simpler to implement and Redis prioritizes code simplicity over performance",
        "Redis operations are microseconds each — single-threaded avoids mutex contention, context switches, and cache coherence overhead that would cost more than the operations themselves. The limit: one slow command (O(N) KEYS, SORT, SMEMBERS on huge sets) blocks all other clients.",
        "Single-threaded is required because Redis uses memory-mapped files that cannot be accessed concurrently",
        "Redis uses single-threaded processing to ensure RDB snapshots are always consistent"
      ],
      correct: 1,
    },
    {
      question: "What is the purpose of Redis's dual encoding strategy (e.g., LISTPACK vs HASHTABLE for hashes)?",
      options: [
        "Dual encoding provides redundancy in case one encoding becomes corrupted",
        "Small structures use compact encodings (listpack) that are 5-10x more memory-efficient but O(N) for lookups. When they exceed size thresholds they automatically convert to full data structures (hashtable) for O(1) operations. This optimizes the common case of small Redis values.",
        "Dual encoding allows Redis to compress data using two different algorithms simultaneously",
        "The dual encoding strategy is used to support both 32-bit and 64-bit operating systems"
      ],
      correct: 1,
    },
    {
      question: "What is the key difference between RDB and AOF persistence, and when should you use each?",
      options: [
        "RDB stores data in RAM; AOF stores data on disk",
        "RDB creates periodic point-in-time snapshots using fork+CoW — compact, fast restarts, but data loss between snapshots. AOF appends every write command — up to 1 second data loss (everysec), slower restarts. Use both together for production: AOF for durability, RDB for fast disaster recovery.",
        "RDB is for persistent data; AOF is only for cache data",
        "RDB supports clustering; AOF only works on single nodes"
      ],
      correct: 1,
    },
    {
      question: "Why does Redis use a skip list instead of a B-tree for sorted sets (ZSET)?",
      options: [
        "Skip lists use less memory than B-trees for all data sizes",
        "Skip lists provide O(log N) insert/delete/range operations without complex rebalancing, are simpler to implement, and enable efficient rank queries via the span field. Redis also pairs the skip list with a hash table for O(1) score lookups, getting the best of both structures.",
        "B-trees are not supported in C which Redis is written in",
        "Skip lists allow Redis to store sorted sets across multiple nodes in a cluster"
      ],
      correct: 1,
    },
    {
      question: "What is the difference between Redis Pub/Sub and Redis Streams, and when should you use each?",
      options: [
        "Pub/Sub supports binary data; Streams only support text data",
        "Pub/Sub is fire-and-forget with no persistence — messages lost if subscriber offline, all subscribers receive all messages. Streams are a durable append-only log with consumer groups where each message goes to exactly one consumer per group and messages persist for replay. Use Pub/Sub for ephemeral notifications, Streams for reliable message queues and event sourcing.",
        "Pub/Sub is faster than Streams; Streams are more reliable",
        "Pub/Sub requires Redis Cluster; Streams work on single nodes only"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Pourquoi Redis utilise-t-il une boucle d'événements mono-thread pour le traitement des commandes, et quelles sont les limites de cette approche ?",
      options: [
        "Le mono-thread est plus simple à implémenter et Redis priorise la simplicité du code sur la performance",
        "Les opérations Redis durent des microsecondes — le mono-thread évite la contention de mutex, les changements de contexte et la surcharge de cohérence de cache qui coûteraient plus que les opérations elles-mêmes. La limite : une commande lente (KEYS O(N), SORT) bloque tous les autres clients.",
        "Le mono-thread est requis car Redis utilise des fichiers mappés en mémoire qui ne peuvent pas être accédés simultanément",
        "Redis utilise le traitement mono-thread pour garantir que les snapshots RDB sont toujours cohérents"
      ],
      correct: 1,
    },
    {
      question: "Quel est le but de la stratégie de double encodage de Redis (ex: LISTPACK vs HASHTABLE pour les hashes) ?",
      options: [
        "Le double encodage fournit de la redondance en cas de corruption d'un encodage",
        "Les petites structures utilisent des encodages compacts (listpack) 5-10x plus efficaces en mémoire mais O(N) pour les lookups. Quand elles dépassent les seuils de taille, elles se convertissent automatiquement en structures complètes (hashtable) pour des opérations O(1). Cela optimise le cas commun des petites valeurs Redis.",
        "Le double encodage permet à Redis de compresser les données avec deux algorithmes différents simultanément",
        "La stratégie de double encodage est utilisée pour supporter les OS 32 bits et 64 bits"
      ],
      correct: 1,
    },
    {
      question: "Quelle est la différence clé entre la persistance RDB et AOF, et quand utiliser chacune ?",
      options: [
        "RDB stocke les données en RAM ; AOF sur disque",
        "RDB crée des snapshots ponctuels périodiques avec fork+CoW — compacts, redémarrages rapides, mais perte de données entre snapshots. AOF ajoute chaque commande d'écriture — au plus 1 seconde de perte (everysec), redémarrages plus lents. Utiliser les deux ensemble en production : AOF pour la durabilité, RDB pour la récupération rapide.",
        "RDB est pour les données persistantes ; AOF uniquement pour les données de cache",
        "RDB supporte le clustering ; AOF ne fonctionne que sur des nœuds uniques"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi Redis utilise-t-il une liste de saut plutôt qu'un B-tree pour les sets triés ?",
      options: [
        "Les listes de saut utilisent moins de mémoire que les B-trees pour toutes les tailles de données",
        "Les listes de saut fournissent des opérations O(log N) d'insertion/suppression/plage sans rééquilibrage complexe, sont plus simples à implémenter, et permettent des requêtes de rang efficaces via le champ span. Redis associe aussi la liste de saut à une table de hachage pour des lookups O(1) de score.",
        "Les B-trees ne sont pas supportés en C dans lequel Redis est écrit",
        "Les listes de saut permettent à Redis de stocker les sets triés sur plusieurs nœuds dans un cluster"
      ],
      correct: 1,
    },
    {
      question: "Quelle est la différence entre Redis Pub/Sub et Redis Streams, et quand utiliser chacun ?",
      options: [
        "Pub/Sub supporte les données binaires ; Streams uniquement le texte",
        "Pub/Sub est fire-and-forget sans persistance — messages perdus si l'abonné est hors ligne, tous les abonnés reçoivent tous les messages. Streams sont un journal durable append-only avec des groupes de consommateurs où chaque message va à exactement un consommateur par groupe. Utiliser Pub/Sub pour les notifications éphémères, Streams pour les files de messages fiables.",
        "Pub/Sub est plus rapide que Streams ; Streams sont plus fiables",
        "Pub/Sub nécessite Redis Cluster ; Streams ne fonctionnent que sur des nœuds uniques"
      ],
      correct: 1,
    },
  ],
};
