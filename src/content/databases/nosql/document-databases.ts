export const content = {
  en: `# Document Databases

## The Document Model

A document database stores data as **self-describing, semi-structured documents** — typically JSON or BSON. Unlike relational tables where every row has the same columns, documents in the same collection can have completely different shapes.

\`\`\`json
// Users collection — no fixed schema
{ "_id": "u1", "name": "Alice", "email": "alice@example.com", "age": 30 }
{ "_id": "u2", "name": "Bob", "email": "bob@example.com", "preferences": { "theme": "dark", "lang": "fr" } }
{ "_id": "u3", "name": "Carol", "addresses": [
    { "type": "home", "city": "Paris" },
    { "type": "work", "city": "Lyon" }
  ]
}
\`\`\`

This flexibility is the primary selling point — and the primary source of production problems when misused.

## MongoDB Architecture

MongoDB is the dominant document database. Understanding its internals explains both its strengths and its notorious early reputation for data loss (pre-2.6, when journaling was off by default).

\`\`\`
MongoDB Process Architecture:
┌─────────────────────────────────────────────────┐
│                  mongod process                  │
│                                                  │
│  Query Layer (parser, optimizer, executor)       │
│          ↓                                       │
│  Storage Engine Layer (pluggable)                │
│    [ WiredTiger ] or [ In-Memory ]               │
│          ↓                                       │
│  Data Files (.wt files)  +  Journal              │
└─────────────────────────────────────────────────┘
\`\`\`

Since MongoDB 3.2, the default storage engine is **WiredTiger**, replacing the old MMAP engine that caused most of MongoDB's early problems.

## WiredTiger Storage Engine

WiredTiger is a standalone storage engine developed by the creators of Berkeley DB. MongoDB acquired it in 2014. It is also used by other databases and is battle-tested at scale.

### WiredTiger B-Tree

WiredTiger stores collections and indexes as **B-trees**, not LSM trees (unlike RocksDB). Each collection is a separate B-tree file.

\`\`\`
Collection B-tree:
  Internal pages: store keys (document _ids) and child page pointers
  Leaf pages:     store the actual document data

Index B-tree (e.g., on field "email"):
  Leaf pages: store { email_value → document_id } pairs
  Secondary lookup: get document_id from index, then fetch document from collection B-tree
\`\`\`

### WiredTiger Page Format

\`\`\`
WiredTiger page (in memory):
┌─────────────────────────────────┐
│ Page header                     │
│ (page type, LSN, flags)         │
├─────────────────────────────────┤
│ WT_ROW array                    │
│ (pointers to key-value pairs)   │
├─────────────────────────────────┤
│ Key-value data                  │
│ (variable length, compressed)   │
├─────────────────────────────────┤
│ Update list (in-memory only)    │
│ (uncommitted changes, MVCC      │
│  versions of modified records)  │
└─────────────────────────────────┘
\`\`\`

The **update list** is WiredTiger's MVCC implementation — modified records maintain a chain of versions in memory, similar to PostgreSQL's heap tuple versions but stored differently.

### WiredTiger Compression

WiredTiger compresses data at the page level:

\`\`\`
Compression options:
  none     — no compression (fastest reads/writes, most space)
  snappy   — default, fast, moderate ratio (~2x)
  zlib     — slower, better ratio (~3x)
  zstd     — best ratio (~4x), moderate speed (MongoDB 4.2+)

Collection-level compression:
db.createCollection("events", {
  storageEngine: {
    wiredTiger: { configString: "block_compressor=zstd" }
  }
})

Index compression:
  Prefix compression — common key prefixes stored once per page
  Dramatically reduces index size for string keys with common prefixes
\`\`\`

### WiredTiger Cache

WiredTiger has its own cache (separate from the OS page cache):

\`\`\`
Default: max(50% of RAM - 1GB, 256MB)
A server with 16GB RAM: WiredTiger cache = 7.5GB

mongodb.conf:
  storage.wiredTiger.engineConfig.cacheSizeGB: 8

Eviction:
  WiredTiger uses a background eviction thread.
  Eviction target: keep cache 80% full (evict when 95% full — "emergency eviction")
  Emergency eviction blocks all read/write threads — the #1 cause of latency spikes

Monitor cache pressure:
db.serverStatus().wiredTiger.cache
  "bytes currently in the cache"
  "maximum bytes configured"
  "pages evicted by application threads"  ← non-zero = emergency eviction, BAD
\`\`\`

## BSON — Binary JSON

MongoDB stores documents as **BSON** (Binary JSON), not text JSON. BSON adds types that JSON lacks and is designed for efficient traversal.

\`\`\`
JSON:  text-based, must parse entire string to access field
BSON:  binary, each value prefixed with type + length → O(1) field access

BSON types beyond JSON:
  int32      — 4-byte integer (JSON has only "number")
  int64      — 8-byte integer
  double     — 8-byte float
  Decimal128 — 128-bit decimal (for financial data)
  Date       — 64-bit UTC milliseconds (JSON has no date type)
  ObjectId   — 12-byte unique ID
  Binary     — arbitrary binary data
  Regex      — compiled regular expression
  Timestamp  — special internal type for replication
\`\`\`

### ObjectId

MongoDB's default \`_id\` type. A 12-byte value that encodes:

\`\`\`
[ 4 bytes: Unix timestamp ]
[ 5 bytes: random value (per process) ]
[ 3 bytes: incrementing counter ]

Total: 12 bytes = 24 hex characters
Example: 65f4a2b3c8d9e1f0a2b3c8d9

Properties:
  - Roughly time-ordered (first 4 bytes = timestamp)
  - Generated client-side (no round-trip to server needed)
  - Unique across machines (random component)
  - Sortable by creation time (approximately)
\`\`\`

Compare to UUID (16 bytes, random): ObjectIds are smaller and naturally ordered, making them better for B-tree indexes.

## Indexes in MongoDB

### Single Field Index
\`\`\`javascript
db.orders.createIndex({ user_id: 1 })   // ascending
db.orders.createIndex({ created_at: -1 }) // descending
\`\`\`

### Compound Index
\`\`\`javascript
db.orders.createIndex({ user_id: 1, status: 1, created_at: -1 })

// Index prefix rule: this index can satisfy queries on:
// { user_id }
// { user_id, status }
// { user_id, status, created_at }
// But NOT: { status } alone or { created_at } alone
\`\`\`

### Multikey Index (Arrays)
\`\`\`javascript
// Document: { tags: ["mongodb", "database", "nosql"] }
db.articles.createIndex({ tags: 1 })
// MongoDB creates one index entry per array element
// Can query: db.articles.find({ tags: "mongodb" })

// Limitation: cannot create compound multikey index
// if more than one field is an array
\`\`\`

### Sparse and Partial Indexes
\`\`\`javascript
// Sparse: only index documents where field exists
db.users.createIndex({ phone: 1 }, { sparse: true })
// Documents without "phone" field are excluded → smaller index

// Partial: only index documents matching filter
db.orders.createIndex(
  { created_at: 1 },
  { partialFilterExpression: { status: "pending" } }
)
// Only pending orders in index — same concept as PostgreSQL partial indexes
\`\`\`

### Text Index
\`\`\`javascript
db.articles.createIndex({ title: "text", body: "text" })
db.articles.find({ $text: { $search: "database internals" } })

// Text index uses:
// - Stemming (running → run)
// - Stop word removal (the, a, is)
// - Term frequency scoring
// Limitation: only one text index per collection
\`\`\`

## MongoDB MVCC and Transactions

### Snapshot Isolation
WiredTiger provides snapshot isolation using its in-memory update chain. Each transaction sees a consistent snapshot of the data.

\`\`\`javascript
// Multi-document transactions (MongoDB 4.0+, replica sets only)
// MongoDB 4.2+ supports sharded transactions
const session = client.startSession();
session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" }
});

try {
  db.accounts.updateOne(
    { _id: "alice" },
    { $inc: { balance: -100 } },
    { session }
  );
  db.accounts.updateOne(
    { _id: "bob" },
    { $inc: { balance: 100 } },
    { session }
  );
  session.commitTransaction();
} catch (e) {
  session.abortTransaction();
}
\`\`\`

### Read Concerns
\`\`\`javascript
// local: read from primary, no guarantee data is majority-committed
// (data could be rolled back if primary fails before replication)
db.orders.find().readConcern("local")

// majority: only return data acknowledged by majority of replica set
// (safe against rollback, but may return older data)
db.orders.find().readConcern("majority")

// linearizable: strongest — guarantees reading your own writes
// (expensive: must wait for majority acknowledgment)
db.orders.find().readConcern("linearizable")

// snapshot: read from a consistent snapshot (for transactions)
db.orders.find().readConcern("snapshot")
\`\`\`

## Sharding Internals

MongoDB's horizontal scaling mechanism. Data is distributed across multiple **shards** (each shard is a replica set).

\`\`\`
Client
  ↓
mongos (query router) — stateless, can run many
  ↓ routes based on shard key
Config Servers (3-node replica set storing cluster metadata)
  ↓
Shard 1 (replica set)  Shard 2 (replica set)  Shard 3 (replica set)
\`\`\`

### Shard Key Selection — The Most Critical Decision

\`\`\`javascript
sh.shardCollection("mydb.orders", { user_id: "hashed" })
// Hashed sharding: uniform distribution, no range queries across shards

sh.shardCollection("mydb.events", { created_at: 1 })
// Range sharding: efficient range queries, but risk of hotspots
// (all new events go to the last shard — "monotonic key problem")

sh.shardCollection("mydb.orders", { user_id: 1, order_id: 1 })
// Compound shard key: good balance of distribution and range queries
\`\`\`

**Bad shard keys:**
\`\`\`
Monotonically increasing (timestamps, ObjectIds as shard key):
  All new writes go to one shard → write hotspot
  
Low cardinality (status: "pending"/"completed"):
  All "pending" docs go to one shard → uneven distribution
  Maximum shard count = number of distinct values
  
Frequently updated field:
  WiredTiger must move document to different shard on update → expensive
\`\`\`

### Chunks and Balancing

\`\`\`
MongoDB divides the shard key range into chunks (default 128MB each).
The balancer moves chunks between shards to keep distribution even.

Chunk: { user_id: MinKey } → { user_id: 1000 }  → Shard 1
       { user_id: 1000   } → { user_id: 5000 }  → Shard 2
       { user_id: 5000   } → { user_id: MaxKey } → Shard 3

When a chunk exceeds 128MB → split into two chunks
When shard has too many chunks → balancer migrates chunks to other shards
\`\`\`

## The Aggregation Pipeline

MongoDB's query language for transformations:

\`\`\`javascript
db.orders.aggregate([
  // Stage 1: filter (like WHERE)
  { $match: { status: "completed", created_at: { $gte: new Date("2024-01-01") } } },

  // Stage 2: join (like LEFT JOIN)
  { $lookup: {
    from: "users",
    localField: "user_id",
    foreignField: "_id",
    as: "user"
  }},

  // Stage 3: unwind array (flatten the joined result)
  { $unwind: "$user" },

  // Stage 4: group (like GROUP BY)
  { $group: {
    _id: "$user.country",
    total_revenue: { $sum: "$total" },
    order_count: { $sum: 1 },
    avg_order: { $avg: "$total" }
  }},

  // Stage 5: sort
  { $sort: { total_revenue: -1 } },

  // Stage 6: limit
  { $limit: 10 }
])
\`\`\`

**Pipeline optimization rules:**
\`\`\`
Move $match as early as possible → reduces documents flowing through pipeline
Move $project early → reduces document size flowing through pipeline
$match + $sort on same field → uses index
$group on indexed field → faster

Use explain() to see pipeline execution plan:
db.orders.explain("executionStats").aggregate([...])
\`\`\`

## Document Model Anti-Patterns

### Unbounded Arrays
\`\`\`javascript
// BAD: array that grows forever
{ _id: "post:1", comments: [ ...millions of comments... ] }
// WiredTiger page splits on every insert
// Single document must fit in RAM (16MB BSON limit)
// Every read loads entire array

// GOOD: separate collection with reference
{ _id: "comment:1", post_id: "post:1", text: "...", created_at: ... }
db.comments.createIndex({ post_id: 1, created_at: -1 })
\`\`\`

### Massive Documents
\`\`\`javascript
// BAD: embedding everything
{ _id: "user:1", 
  name: "Alice",
  orders: [...],      // could be thousands
  events: [...],      // could be millions
  preferences: {...}
}
// BSON limit: 16MB. Reads load entire document. Indexes include entire doc.

// GOOD: embed only what is always accessed together
{ _id: "user:1", name: "Alice", preferences: {...} }
// Separate collections for orders and events
\`\`\`

### Schema-less Chaos
\`\`\`javascript
// BAD: no schema validation
// Some docs have "email", some have "emailAddress", some have neither
// Application code becomes full of null checks and field name guessing

// GOOD: MongoDB JSON Schema validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email"],
      properties: {
        name:  { bsonType: "string" },
        email: { bsonType: "string", pattern: "^.+@.+$" },
        age:   { bsonType: "int", minimum: 0, maximum: 150 }
      }
    }
  }
})
\`\`\`
`,

  fr: `# Bases de données documentaires

## Le modèle documentaire

Une base de données documentaire stocke les données sous forme de **documents semi-structurés auto-descriptifs** — typiquement JSON ou BSON. Les documents dans la même collection peuvent avoir des formes complètement différentes.

\`\`\`json
// Collection users — pas de schéma fixe
{ "_id": "u1", "name": "Alice", "email": "alice@example.com" }
{ "_id": "u2", "name": "Bob", "preferences": { "theme": "dark" } }
{ "_id": "u3", "name": "Carol", "addresses": [
    { "type": "home", "city": "Paris" }
  ]
}
\`\`\`

## Architecture MongoDB

MongoDB est la base de données documentaire dominante. Depuis MongoDB 3.2, le moteur de stockage par défaut est **WiredTiger**.

### Cache WiredTiger

\`\`\`
Par défaut : max(50% RAM - 1Go, 256Mo)
Serveur avec 16 Go RAM : cache WiredTiger = 7.5 Go

Éviction d'urgence — bloque tous les threads lecture/écriture
= cause n°1 de pics de latence

Surveiller :
db.serverStatus().wiredTiger.cache
  "pages evicted by application threads"  ← non-zéro = éviction d'urgence, MAUVAIS
\`\`\`

## BSON — JSON Binaire

MongoDB stocke les documents en **BSON** (JSON Binaire), pas en JSON texte.

\`\`\`
JSON  : basé sur du texte, doit analyser toute la chaîne pour accéder à un champ
BSON  : binaire, chaque valeur préfixée avec type + longueur → accès O(1) aux champs

Types BSON au-delà de JSON :
  int32      — entier 4 octets
  int64      — entier 8 octets
  Decimal128 — décimal 128 bits (pour les données financières)
  Date       — millisecondes UTC 64 bits (JSON n'a pas de type date)
  ObjectId   — ID unique 12 octets
\`\`\`

## Index dans MongoDB

\`\`\`javascript
// Index de champ unique
db.orders.createIndex({ user_id: 1 })

// Index composé
db.orders.createIndex({ user_id: 1, status: 1, created_at: -1 })

// Index multiclé (tableaux)
db.articles.createIndex({ tags: 1 })
// MongoDB crée une entrée d'index par élément de tableau

// Index partiel
db.orders.createIndex(
  { created_at: 1 },
  { partialFilterExpression: { status: "pending" } }
)
\`\`\`

## MVCC et transactions MongoDB

\`\`\`javascript
// Transactions multi-documents (MongoDB 4.0+)
const session = client.startSession();
session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" }
});

try {
  db.accounts.updateOne({ _id: "alice" }, { $inc: { balance: -100 } }, { session });
  db.accounts.updateOne({ _id: "bob" },   { $inc: { balance: 100 } },  { session });
  session.commitTransaction();
} catch (e) {
  session.abortTransaction();
}
\`\`\`

## Internals du sharding

\`\`\`
Client
  ↓
mongos (routeur de requêtes) — sans état
  ↓ route selon la shard key
Serveurs de configuration (stockent les métadonnées du cluster)
  ↓
Shard 1 (replica set)  Shard 2 (replica set)  Shard 3 (replica set)
\`\`\`

### Sélection de la shard key

\`\`\`javascript
// Sharding haché : distribution uniforme, pas de requêtes de plage
sh.shardCollection("mydb.orders", { user_id: "hashed" })

// Sharding par plage : requêtes de plage efficaces, risque de hotspots
sh.shardCollection("mydb.events", { created_at: 1 })
\`\`\`

**Mauvaises shard keys :**
\`\`\`
Monotoniquement croissante (timestamps, ObjectIds) :
  Toutes les nouvelles écritures vont sur un seul shard → hotspot en écriture

Faible cardinalité (status: "pending"/"completed") :
  Distribution inégale, nombre max de shards = nombre de valeurs distinctes
\`\`\`

## Anti-patterns du modèle documentaire

### Tableaux non bornés
\`\`\`javascript
// MAUVAIS : tableau qui grossit indéfiniment
{ _id: "post:1", comments: [ ...des millions de commentaires... ] }
// Limite BSON : 16 Mo. Chaque lecture charge le tableau entier.

// BON : collection séparée avec référence
{ _id: "comment:1", post_id: "post:1", text: "..." }
db.comments.createIndex({ post_id: 1, created_at: -1 })
\`\`\`

### Validation de schéma
\`\`\`javascript
// BON : validation JSON Schema MongoDB
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email"],
      properties: {
        name:  { bsonType: "string" },
        email: { bsonType: "string", pattern: "^.+@.+$" }
      }
    }
  }
})
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "Why does MongoDB use BSON instead of storing documents as text JSON?",
      options: [
        "BSON is smaller than JSON in all cases",
        "BSON is binary with type and length prefixes enabling O(1) field access without parsing the entire document, plus it adds types JSON lacks like Date, int64, and Decimal128",
        "BSON is encrypted by default providing security",
        "BSON allows MongoDB to skip building indexes",
      ],
      correct: 1,
    },
    {
      question:
        "What causes emergency eviction in WiredTiger and why is it dangerous?",
      options: [
        "Emergency eviction occurs when the WAL fills up — dangerous because it corrupts data",
        "Emergency eviction occurs when the cache reaches 95% full and background eviction cannot keep up — dangerous because it blocks ALL read and write threads, causing latency spikes",
        "Emergency eviction occurs during replica set elections — dangerous because it causes data loss",
        "Emergency eviction occurs when a shard key is poorly chosen — dangerous because it causes hotspots",
      ],
      correct: 1,
    },
    {
      question:
        "Why is a monotonically increasing field (like a timestamp) a bad MongoDB shard key?",
      options: [
        "MongoDB cannot index timestamp fields",
        "Timestamps have low cardinality making distribution uneven",
        "All new writes go to the shard responsible for the highest key range — creating a write hotspot where one shard handles all inserts while others are idle",
        "Timestamps consume too much storage in the config server",
      ],
      correct: 2,
    },
    {
      question: "What is the MongoDB compound index prefix rule?",
      options: [
        "All fields in a compound index must be of the same type",
        "A compound index on (a, b, c) can only be used by queries that filter on a leading prefix of the index fields — queries on {a}, {a,b}, or {a,b,c} can use it, but {b} or {c} alone cannot",
        "Compound indexes are limited to 3 fields maximum",
        "The first field in a compound index must be the _id field",
      ],
      correct: 1,
    },
    {
      question:
        "What is the danger of storing an unbounded array inside a MongoDB document?",
      options: [
        "MongoDB does not support arrays in documents",
        "Arrays cannot be indexed in MongoDB",
        "The document grows indefinitely, hitting the 16MB BSON limit, causing every read to load the entire array into memory, and page splits on every insert",
        "Unbounded arrays prevent the use of multi-document transactions",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi MongoDB utilise-t-il BSON au lieu de stocker les documents en JSON texte ?",
      options: [
        "BSON est plus petit que JSON dans tous les cas",
        "BSON est binaire avec des préfixes de type et longueur permettant un accès O(1) aux champs sans analyser le document entier, et il ajoute des types absents de JSON comme Date, int64 et Decimal128",
        "BSON est chiffré par défaut offrant de la sécurité",
        "BSON permet à MongoDB de ne pas construire d'index",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce qui cause l'éviction d'urgence dans WiredTiger et pourquoi est-elle dangereuse ?",
      options: [
        "L'éviction d'urgence se produit quand le WAL se remplit — dangereux car corrompt les données",
        "L'éviction d'urgence se produit quand le cache atteint 95% de saturation et que l'éviction en arrière-plan ne peut pas suivre — dangereux car bloque TOUS les threads lecture et écriture, causant des pics de latence",
        "L'éviction d'urgence se produit lors des élections de replica set — dangereux car cause une perte de données",
        "L'éviction d'urgence se produit quand une shard key est mal choisie — dangereux car cause des hotspots",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi un champ monotoniquement croissant (comme un timestamp) est-il une mauvaise shard key MongoDB ?",
      options: [
        "MongoDB ne peut pas indexer les champs timestamp",
        "Les timestamps ont une faible cardinalité rendant la distribution inégale",
        "Toutes les nouvelles écritures vont sur le shard responsable de la plage de clés la plus haute — créant un hotspot en écriture où un shard gère toutes les insertions pendant que les autres sont inactifs",
        "Les timestamps consomment trop de stockage dans le serveur de configuration",
      ],
      correct: 2,
    },
    {
      question: "Quelle est la règle de préfixe d'index composé MongoDB ?",
      options: [
        "Tous les champs d'un index composé doivent être du même type",
        "Un index composé sur (a, b, c) ne peut être utilisé que par des requêtes filtrant sur un préfixe des champs d'index — les requêtes sur {a}, {a,b} ou {a,b,c} peuvent l'utiliser, mais {b} ou {c} seuls ne le peuvent pas",
        "Les index composés sont limités à 3 champs maximum",
        "Le premier champ d'un index composé doit être le champ _id",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est le danger de stocker un tableau non borné dans un document MongoDB ?",
      options: [
        "MongoDB ne supporte pas les tableaux dans les documents",
        "Les tableaux ne peuvent pas être indexés dans MongoDB",
        "Le document grossit indéfiniment, atteignant la limite BSON de 16 Mo, faisant que chaque lecture charge le tableau entier en mémoire, et des divisions de page à chaque insertion",
        "Les tableaux non bornés empêchent l'utilisation de transactions multi-documents",
      ],
      correct: 2,
    },
  ],
};
