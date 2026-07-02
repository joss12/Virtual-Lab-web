export const content = {
  en: `# Indexes — The Query Accelerators

A query that takes 10 seconds with a full table scan takes 10 milliseconds with the right index. But indexes aren't magic — they're data structures with tradeoffs. Understanding indexes deeply means understanding when to use them, how they work internally, and why they sometimes make things slower.

## B-tree Index Internals — The Workhorse

\`\`\`
B-tree index structure (PostgreSQL):

CREATE INDEX idx_users_email ON users(email);

Physical structure (order 1000, ~1000 keys per node):

Level 2 (Root):
┌────────────────────────────────────────────┐
│ [alice@..., john@..., mary@..., zach@...] │
│  ↓         ↓         ↓          ↓          │
└────────────────────────────────────────────┘
     │         │         │          │
     ├─────────┼─────────┼──────────┘
     │         │         │
Level 1 (Internal nodes):
[a@..., c@...]  [j@..., l@...]  [m@..., p@...]  [z@..., zz@...]
     │               │               │               │
Level 0 (Leaf nodes - actual index entries):
[alice@ex.com → TID(0,1)]  [john@ex.com → TID(0,5)]  ...
[bob@ex.com → TID(0,2)]    [kate@ex.com → TID(0,7)]
[charlie@... → TID(0,3)]   [lisa@ex.com → TID(0,9)]

TID = Tuple Identifier (page number, item number)
Each leaf entry: (key, TID) pointing to heap tuple

Search for 'kate@ex.com':
1. Root: 'kate' between 'john' and 'mary' → go to child 2
2. Internal: 'kate' between 'j' and 'l' → go to leaf
3. Leaf: Binary search → find 'kate@ex.com → TID(0,7)'
4. Fetch heap tuple at page 0, item 7
Total: 3 index page reads + 1 heap page read

For 1 million rows:
├── Height: log₁₀₀₀(1M) ≈ 2-3 levels
├── Disk I/Os: 3-4 (index) + 1 (heap) = 4-5 total
└── vs Sequential scan: ~125,000 pages (8KB pages)
    Result: 25,000x faster!
\`\`\`

### Index Tuple Format (PostgreSQL)

\`\`\`c
// PostgreSQL index tuple structure
typedef struct IndexTupleData {
    ItemPointerData t_tid;       // TID (6 bytes: page 4 bytes + offset 2 bytes)
    unsigned short  t_info;      // Flags (2 bytes)
    // Followed by key value(s)
} IndexTupleData;

Example index entry:
Email: 'alice@example.com'
TID: (0, 1) - page 0, item 1

Physical layout (leaf node):
Offset  Bytes   Content
0       4       Page header
...
100     6       TID = (0, 1)
106     2       t_info flags
108     18      'alice@example.com' (varlena format: length + data)

Index page can fit:
8192 bytes per page
- 24 bytes header
- ~20 bytes per entry (6 TID + 2 flags + 12 avg key)
= ~400 entries per leaf page

For 1 million rows:
├── Leaf pages: 1,000,000 / 400 = 2,500 pages
├── Internal pages: 2,500 / 1000 = 3 pages
├── Root: 1 page
└── Total index size: ~20 MB (vs 8 GB heap)
    Index is 400x smaller!
\`\`\`

### Index Scan vs Sequential Scan

\`\`\`
Query: SELECT * FROM users WHERE email = 'alice@example.com';

Index scan cost:
├── 3 index page reads (root + internal + leaf)
├── 1 heap page read (fetch tuple)
├── Total: 4 random I/Os
└── Cost: ~40ms (10ms per random I/O)

Sequential scan cost:
├── 125,000 page reads (entire table)
├── Sequential I/O (much faster than random)
├── Total: 125,000 sequential I/Os
└── Cost: ~2500ms (0.02ms per sequential I/O)

Index is 60x faster for single-row lookup.

But for range queries:
SELECT * FROM users WHERE created_at > '2024-01-01';
-- Returns 50% of table (500,000 rows)

Index scan cost:
├── Index scan: 2,500 leaf pages (sequential)
├── Heap fetch: 500,000 random I/Os (one per row)
└── Total: ~5,000,000ms (500,000 × 10ms)

Sequential scan cost:
├── 125,000 page reads (entire table)
└── Total: ~2,500ms

Sequential scan is 2000x faster!

Rule: Index efficient when returning < 5-10% of table.
      Above that, sequential scan wins.

Query optimizer uses statistics to decide:
├── Estimated rows returned
├── Table size
├── Index selectivity
└── Cost model (random I/O vs sequential)
\`\`\`

## Index-Only Scans — The Visibility Map

\`\`\`
Problem: Index scan still requires heap access
├── Index gives TID
├── Must fetch heap tuple to check visibility (xmin/xmax)
└── Random I/O for each row

Solution: Index-only scan (PostgreSQL 9.2+)

Requirements:
1. Query only needs indexed columns
2. Heap pages are "all-visible" (no old MVCC versions)

Visibility map:
├── 1 bit per heap page (8KB)
├── 1 = all tuples visible to all transactions
├── 0 = must check heap for visibility
└── Updated by VACUUM

Example:
CREATE INDEX idx_users_email ON users(email);
SELECT email FROM users WHERE email LIKE 'a%';

Index-only scan:
1. Scan index for 'a%' matches
2. Check visibility map for each heap page
3. If all-visible: Return email from index (no heap access!)
4. If not all-visible: Fetch heap tuple, check visibility

Visibility map benefits:
├── Avoid heap access for most queries
├── Especially after VACUUM (sets all-visible bits)
└── Can be 10-100x faster

EXPLAIN output:
Index Only Scan using idx_users_email
  Heap Fetches: 12  ← Only 12 heap accesses (out of 10,000 rows)
  
Low heap fetches = effective index-only scan.
High heap fetches = need VACUUM or pages have old versions.
\`\`\`

### Visibility Map Structure

\`\`\`
Visibility map file: <relation_oid>_vm

Bitmap format:
├── 1 bit per heap page
├── 1 byte = 8 pages
├── For 1GB table (125,000 pages):
│   └── VM size: 125,000 / 8 = 15,625 bytes (~15 KB)
└── Tiny compared to table!

VM bits:
Bit 0: All tuples visible (used for index-only scans)
Bit 1: All tuples frozen (xmin very old, no wraparound risk)

Updating visibility map:
├── VACUUM sets bits after cleaning page
├── UPDATE/DELETE clears bits (page has new versions)
└── Read by index-only scan to skip heap access

Monitoring VM effectiveness:
SELECT relname, 
       pg_relation_size(oid) / 8192 as total_pages,
       pg_stat_get_all_visible_pages(oid) as all_visible_pages,
       pg_stat_get_all_visible_pages(oid)::float / 
         (pg_relation_size(oid) / 8192) as visible_ratio
FROM pg_class
WHERE relname = 'users';

High visible_ratio → index-only scans effective
Low visible_ratio → run VACUUM
\`\`\`

## Covering Indexes — Include Non-Key Columns

\`\`\`
Problem: Query needs non-indexed columns

SELECT email, name FROM users WHERE email = 'alice@example.com';

Standard index:
CREATE INDEX idx_users_email ON users(email);

Execution:
1. Index scan on email → TID
2. Heap fetch to get name
3. Random I/O for heap access

Covering index (PostgreSQL 11+):
CREATE INDEX idx_users_email_covering ON users(email) INCLUDE (name);

Structure:
Leaf entries: (email, TID, name)
             ↑ key  ↑ ptr ↑ included column (not in tree structure)

Execution:
1. Index scan on email
2. Read name directly from index
3. No heap access needed!

Benefits:
├── Index-only scan even with non-indexed columns
├── Faster query (no heap I/O)
└── Index slightly larger but worth it

When to use:
✓ Query retrieves few columns frequently
✓ Index-only scan eliminates heap access
✗ Index becomes too large (RAM pressure)
✗ Columns frequently updated (index bloat)

Example use case:
CREATE INDEX idx_orders_user_id_covering 
  ON orders(user_id) INCLUDE (order_date, total);

SELECT order_date, total FROM orders WHERE user_id = 123;
-- Index-only scan, no heap access!
\`\`\`

## Partial Indexes — Index Subset of Rows

\`\`\`
Problem: Index entire table wastes space for unused rows

Table: orders (10 million rows)
Query: SELECT * FROM orders WHERE status = 'pending';
-- Only 10,000 pending orders (0.1%)

Full index:
CREATE INDEX idx_orders_status ON orders(status);
├── Index size: 10 million entries
└── Mostly wasted (99.9% not pending)

Partial index:
CREATE INDEX idx_orders_pending ON orders(status) 
  WHERE status = 'pending';
├── Index size: 10,000 entries (1000x smaller!)
├── Faster to scan
└── Less memory pressure

Query must match filter:
✓ WHERE status = 'pending'  -- Uses index
✗ WHERE status = 'shipped'  -- Cannot use index
✗ WHERE status IN ('pending', 'shipped')  -- Cannot use index

Multiple partial indexes:
CREATE INDEX idx_orders_pending ON orders(id) WHERE status = 'pending';
CREATE INDEX idx_orders_shipped ON orders(id) WHERE status = 'shipped';
CREATE INDEX idx_orders_cancelled ON orders(id) WHERE status = 'cancelled';

Benefits:
├── Smaller indexes (fit in RAM)
├── Faster scans
├── Less index maintenance overhead
└── Targeted for specific queries

Use cases:
├── Status flags (active/inactive)
├── Soft deletes (deleted_at IS NULL)
├── Time-based (created_at > NOW() - INTERVAL '30 days')
└── Any low-cardinality, skewed distribution
\`\`\`

## Expression Indexes — Index Computed Values

\`\`\`
Problem: Query uses function on column

SELECT * FROM users WHERE LOWER(email) = 'alice@example.com';

Standard index unusable:
CREATE INDEX idx_users_email ON users(email);
-- Cannot use index because of LOWER() function
-- Falls back to sequential scan

Expression index:
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

Index stores computed values:
Leaf entries: (lower('Alice@Example.com'), TID)
            = ('alice@example.com', TID)

Query can use index:
WHERE LOWER(email) = 'alice@example.com'
-- Index scan on idx_users_email_lower

Common expression indexes:
1. Case-insensitive search:
   CREATE INDEX idx_name_lower ON users(LOWER(name));
   WHERE LOWER(name) = 'alice'

2. Date part extraction:
   CREATE INDEX idx_created_year ON orders(EXTRACT(YEAR FROM created_at));
   WHERE EXTRACT(YEAR FROM created_at) = 2024

3. JSON field:
   CREATE INDEX idx_metadata_status ON events((metadata->>'status'));
   WHERE metadata->>'status' = 'active'

4. Concatenation:
   CREATE INDEX idx_full_name ON users((first_name || ' ' || last_name));
   WHERE first_name || ' ' || last_name = 'Alice Smith'

Cost:
├── Index larger (stores computed values)
├── Updates recompute expression
└── But query is 1000x faster

Immutability requirement:
Function must be IMMUTABLE (same input → same output always)
✓ LOWER(), EXTRACT(), mathematical functions
✗ NOW(), RANDOM() (non-deterministic)
\`\`\`

## Multi-Column Indexes — Composite Keys

\`\`\`
Multi-column index:
CREATE INDEX idx_users_last_first ON users(last_name, first_name);

B-tree structure:
Keys sorted by: last_name first, then first_name

[('Adams', 'Alice'), ('Adams', 'Bob'), ('Baker', 'Charlie'), ...]

Usable for queries:
✓ WHERE last_name = 'Adams'  -- Uses index (prefix match)
✓ WHERE last_name = 'Adams' AND first_name = 'Alice'  -- Uses index fully
✗ WHERE first_name = 'Alice'  -- Cannot use index (not leftmost column)

Leftmost prefix rule:
Index on (a, b, c) can be used for:
✓ WHERE a = ?
✓ WHERE a = ? AND b = ?
✓ WHERE a = ? AND b = ? AND c = ?
✗ WHERE b = ? (skips leftmost)
✗ WHERE c = ? (skips leftmost)

Column order matters:
High selectivity first = better pruning

Example:
Table: 1 million users
├── 100,000 distinct last names (low cardinality)
└── 1 million distinct emails (high cardinality)

Bad: CREATE INDEX ON users(last_name, email);
├── WHERE last_name = 'Smith' → 10,000 rows
├── Then filter by email → 1 row
└── Scanned 10,000 index entries

Good: CREATE INDEX ON users(email, last_name);
├── WHERE email = 'alice@...' → 1 row immediately
└── Scanned 1 index entry

Rule: High-cardinality columns first (unless query patterns differ).
\`\`\`

### Index Skip Scan (PostgreSQL 13+)

\`\`\`
New feature: Use multi-column index even without leftmost

Index: (status, created_at)

Query: SELECT * FROM orders WHERE created_at > '2024-01-01';
-- Missing status (leftmost column)

Traditional: Cannot use index (skip scan not available)

PostgreSQL 13+ skip scan:
1. Scan index for distinct status values: ['pending', 'shipped', 'cancelled']
2. For each status:
   ├── Scan index WHERE status = 'pending' AND created_at > '2024-01-01'
   ├── Scan index WHERE status = 'shipped' AND created_at > '2024-01-01'
   └── Scan index WHERE status = 'cancelled' AND created_at > '2024-01-01'
3. Merge results

Effective when:
├── Leftmost column low cardinality (few distinct values)
├── Query selective on other columns
└── Cost of skip scan < sequential scan

EXPLAIN shows:
Index Skip Scan using idx_orders_status_created_at
  Skip values: status

Not always faster (depends on data distribution).
\`\`\`

## Index Maintenance — VACUUM and REINDEX

\`\`\`
Index bloat problem:

UPDATE accounts SET balance = 900 WHERE id = 1;

What happens:
1. Old tuple marked deleted (xmax set)
2. New tuple created
3. Old index entry still points to old tuple
4. New index entry created for new tuple
5. Index now has BOTH entries (bloat!)

Dead tuples in index:
├── Waste space
├── Slow down scans
└── Need cleanup

VACUUM cleanup:
1. Scans heap for dead tuples
2. Marks index entries for dead tuples as deleted
3. Space reusable for future inserts
4. Does NOT shrink index file

VACUUM limitations:
├── Doesn't reclaim space to OS
├── Index file never shrinks
└── After massive DELETEs, index stays large

REINDEX solution:
REINDEX INDEX idx_users_email;

Process:
1. Build new index from scratch
2. Drop old index
3. Rename new index

Benefits:
├── Removes all bloat
├── Index at minimum size
└── Faster scans

Cost:
├── Locks table for writes (REINDEX)
├── Uses 2x space temporarily (new + old index)
└── Time-consuming for large indexes

REINDEX CONCURRENTLY (PostgreSQL 12+):
REINDEX INDEX CONCURRENTLY idx_users_email;

Benefits:
├── Doesn't lock table
├── Allows concurrent writes
└── Safe for production

Process:
1. Create new index with temporary name
2. Build new index (takes time, no locks)
3. Swap old and new atomically
4. Drop old index

Monitoring index bloat:
SELECT schemaname, tablename, indexname,
       pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
       idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0  -- Unused indexes
ORDER BY pg_relation_size(indexrelid) DESC;

Unused indexes = wasted space + update overhead.
\`\`\`

## Bitmap Index Scans — Combining Multiple Indexes

\`\`\`
Query: SELECT * FROM users WHERE last_name = 'Smith' AND city = 'NYC';

Indexes:
├── idx_last_name on (last_name)
└── idx_city on (city)

Problem: Cannot use both indexes simultaneously with standard scan.

Bitmap index scan:
1. Bitmap Index Scan on idx_last_name
   └── Returns bitmap: pages {5, 12, 18, 25, ...} (100 pages)
2. Bitmap Index Scan on idx_city
   └── Returns bitmap: pages {5, 9, 18, 30, ...} (150 pages)
3. Bitmap AND operation
   └── Intersection: pages {5, 18} (only 2 pages)
4. Bitmap Heap Scan
   └── Fetch tuples from pages {5, 18}

Benefits:
├── Combines multiple indexes
├── Lossy compression (page-level, not tuple-level)
├── Fewer heap page reads
└── Efficient for OR/AND conditions

EXPLAIN output:
BitmapAnd
  -> Bitmap Index Scan on idx_last_name
  -> Bitmap Index Scan on idx_city
  -> Bitmap Heap Scan on users
     Recheck Cond: (last_name = 'Smith' AND city = 'NYC')

Recheck: Bitmap is page-level, must verify tuples.

OR condition:
SELECT * FROM users WHERE last_name = 'Smith' OR city = 'NYC';

BitmapOr
  -> Bitmap Index Scan on idx_last_name
  -> Bitmap Index Scan on idx_city
  -> Bitmap Heap Scan

Bitmap vs regular index scan:
├── Bitmap: Page-level, lossy, combines multiple indexes
├── Regular: Tuple-level, exact, single index
└── Optimizer chooses based on selectivity
\`\`\`

## Hash Indexes — Equality-Only

\`\`\`
PostgreSQL hash index (improved in v10+):

CREATE INDEX idx_users_email_hash ON users USING hash(email);

Structure: Hash table instead of B-tree
├── Hash function: email → bucket number
├── Bucket: Linked list of entries
└── O(1) lookup for equality

Usable queries:
✓ WHERE email = 'alice@example.com'  -- Exact match
✗ WHERE email LIKE 'alice%'  -- Range/pattern (use B-tree)
✗ WHERE email > 'alice@...'  -- Range (use B-tree)

Benefits:
├── Slightly faster equality lookups
├── Slightly smaller index size
└── Simple structure

Drawbacks:
├── No range queries
├── No ORDER BY support
├── Less flexible than B-tree
└── PostgreSQL: Not crash-safe until v10

When to use:
├── Equality-only queries
├── High-cardinality columns (UUIDs, hashes)
└── Marginal benefit over B-tree (~10% faster)

Reality: B-trees almost always better.
PostgreSQL defaults to B-tree for good reason.
\`\`\`

## Specialized Index Types (PostgreSQL)

### GiST — Generalized Search Tree

\`\`\`
GiST: Framework for custom index types

Use cases:
1. Full-text search
2. Geometric data (points, polygons)
3. Range types (date ranges, IP ranges)

Example: Geometric search
CREATE INDEX idx_locations ON places USING gist(location);

SELECT * FROM places WHERE location <-> point(40.7, -74.0) < 1000;
-- Find locations within 1000 meters

GiST structure: Tree with overlap
├── Internal nodes: Bounding boxes
├── Leaf nodes: Actual values
└── Supports nearest-neighbor search (<-> operator)

Full-text search:
CREATE INDEX idx_documents_search ON documents USING gist(to_tsvector('english', content));

SELECT * FROM documents WHERE to_tsvector('english', content) @@ to_tsquery('database & performance');
-- Full-text search with ranking
\`\`\`

### GIN — Generalized Inverted Index

\`\`\`
GIN: Inverted index for multi-value data

Use cases:
1. Arrays
2. JSONB
3. Full-text search (better than GiST for large text)

Example: Array search
CREATE INDEX idx_tags ON articles USING gin(tags);

SELECT * FROM articles WHERE tags @> ARRAY['postgresql', 'performance'];
-- Find articles with both tags

GIN structure:
Entry: ('postgresql', [TID1, TID2, TID5, ...])
Entry: ('performance', [TID2, TID3, TID5, ...])
└── Posting list: All rows containing value

JSONB index:
CREATE INDEX idx_metadata ON events USING gin(metadata);

SELECT * FROM events WHERE metadata @> '{"status": "active"}';
-- Find events with status=active in JSON

GIN benefits:
├── Fast lookups for containment queries
├── Handles multi-value columns well
└── Posting lists compress well

GIN drawbacks:
├── Large index size (inverted structure)
├── Slow updates (many posting lists change)
└── Better for read-heavy workloads
\`\`\`

### BRIN — Block Range Index

\`\`\`
BRIN: Tiny index for sorted/clustered data

Structure: Min/max values per block range

Example:
CREATE INDEX idx_logs_created_at ON logs USING brin(created_at);

BRIN stores:
Block range 0-100:   created_at MIN='2024-01-01', MAX='2024-01-05'
Block range 101-200: created_at MIN='2024-01-06', MAX='2024-01-10'
...

Query: WHERE created_at > '2024-01-07'
1. Check block ranges: Only 101-200, 201-300, ... contain matches
2. Scan those blocks only
3. Skip blocks 0-100 (all before 2024-01-07)

BRIN index size:
├── 1 entry per 128 pages (default pages_per_range)
├── For 1 TB table: ~100 KB index (10,000x smaller than B-tree!)
└── Fits entirely in RAM

Requirements:
✓ Data physically sorted (insert order = query order)
✓ Large tables (10M+ rows)
✓ Range queries
✗ Random access patterns (no benefit)

Perfect for time-series:
├── Logs (append-only, sorted by timestamp)
├── Sensor data (chronological)
└── Event streams

BRIN vs B-tree:
├── BRIN: 10,000x smaller, lossy (scans blocks)
├── B-tree: Precise, larger
└── BRIN for huge, sorted tables
\`\`\`

Indexes are the most powerful query optimization tool. Understanding them deeply — from B-tree internals to specialized types — means understanding how to make databases fast.`,

  fr: `# Index — Les accélérateurs de requêtes

Une requête qui prend 10 secondes avec un scan complet de table prend 10 millisecondes avec le bon index. Mais les index ne sont pas magiques — ce sont des structures de données avec des compromis.

## Internes d'index B-tree

\`\`\`
CREATE INDEX idx_users_email ON users(email);

Structure physique (ordre 1000) :

Niveau 2 (Racine) :
[alice@..., john@..., mary@..., zach@...]

Niveau 0 (Feuilles - entrées d'index réelles) :
[alice@ex.com → TID(0,1)]
[bob@ex.com → TID(0,2)]
\`\`\`

## Scans index-only

\`\`\`
Problème : Le scan d'index nécessite toujours l'accès au heap

Solution : Scan index-only (PostgreSQL 9.2+)

Exigences :
1. La requête n'a besoin que de colonnes indexées
2. Les pages heap sont "all-visible"
\`\`\`

## Index partiels

\`\`\`
CREATE INDEX idx_orders_pending ON orders(status) 
  WHERE status = 'pending';

Index 1000x plus petit !
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "Why is an index typically 100-1000x smaller than the heap table?",
      options: [
        "Indexes use compression",
        "Index entries only store (key, TID) pointer — 20 bytes vs full tuple 100-1000 bytes",
        "Indexes skip some rows",
        "Indexes use different page size",
      ],
      correct: 1,
    },
    {
      question: "When does an index scan become slower than a sequential scan?",
      options: [
        "Always",
        "When query returns >5-10% of table — random I/O cost (fetch each tuple) exceeds sequential scan cost",
        "Never",
        "When index is too large",
      ],
      correct: 1,
    },
    {
      question: "How does an index-only scan avoid heap access?",
      options: [
        "By caching tuples in memory",
        "Uses visibility map to determine if heap pages are all-visible — if yes, return data from index without heap fetch",
        "By copying data to index",
        "By disabling MVCC",
      ],
      correct: 1,
    },
    {
      question:
        "Why can't a multi-column index on (a,b,c) be used for 'WHERE b = ?' queries?",
      options: [
        "The index is too large",
        "Leftmost prefix rule — B-tree sorts by 'a' first, cannot binary search by 'b' without knowing 'a'",
        "PostgreSQL limitation",
        "Performance would be bad",
      ],
      correct: 1,
    },
    {
      question:
        "Why is a BRIN index 10,000x smaller than a B-tree for time-series data?",
      options: [
        "BRIN uses better compression",
        "BRIN stores only min/max per block range (1 entry per 128 pages) vs B-tree (1 entry per tuple)",
        "BRIN skips some data",
        "BRIN uses different page format",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi un index est-il typiquement 100-1000x plus petit que la table heap ?",
      options: [
        "Les index utilisent la compression",
        "Les entrées d'index stockent seulement (clé, TID) pointeur — 20 octets vs tuple complet 100-1000 octets",
        "Les index sautent certaines lignes",
        "Les index utilisent une taille de page différente",
      ],
      correct: 1,
    },
    {
      question:
        "Quand un scan d'index devient-il plus lent qu'un scan séquentiel ?",
      options: [
        "Toujours",
        "Quand la requête retourne >5-10% de la table — coût I/O aléatoire dépasse le coût scan séquentiel",
        "Jamais",
        "Quand l'index est trop grand",
      ],
      correct: 1,
    },
    {
      question: "Comment un scan index-only évite-t-il l'accès au heap ?",
      options: [
        "En mettant en cache les tuples en mémoire",
        "Utilise la carte de visibilité pour déterminer si les pages heap sont all-visible — si oui, retourne données de l'index",
        "En copiant les données dans l'index",
        "En désactivant MVCC",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi un index multi-colonnes sur (a,b,c) ne peut-il pas être utilisé pour 'WHERE b = ?' ?",
      options: [
        "L'index est trop grand",
        "Règle du préfixe gauche — B-tree trie par 'a' d'abord, ne peut pas rechercher par 'b' sans connaître 'a'",
        "Limitation PostgreSQL",
        "Les performances seraient mauvaises",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi un index BRIN est-il 10 000x plus petit qu'un B-tree pour données time-series ?",
      options: [
        "BRIN utilise une meilleure compression",
        "BRIN stocke seulement min/max par plage de blocs (1 entrée par 128 pages) vs B-tree (1 entrée par tuple)",
        "BRIN saute certaines données",
        "BRIN utilise un format de page différent",
      ],
      correct: 1,
    },
  ],
};
