export const content = {
  en: `# Query Processing — From SQL to Results

You type SELECT. Milliseconds later, results appear. What happened in between? The query processor: parser, optimizer, executor. Understanding this pipeline deeply means understanding why queries are fast or slow, and how to make them faster.

## The Query Processing Pipeline

\`\`\`
SQL → Parser → Analyzer → Optimizer → Executor → Results

1. Parser:
   ├── Input: SQL text
   ├── Output: Parse tree (AST)
   └── Validates syntax

2. Analyzer/Rewriter:
   ├── Input: Parse tree
   ├── Output: Query tree
   ├── Semantic validation (tables exist, types match)
   └── View expansion, rule application

3. Optimizer:
   ├── Input: Query tree
   ├── Output: Execution plan
   ├── Generate alternative plans
   ├── Cost estimation
   └── Choose cheapest plan

4. Executor:
   ├── Input: Execution plan
   ├── Output: Result rows
   └── Volcano model (iterator interface)

Example query:
SELECT u.name, COUNT(*) 
FROM users u 
JOIN orders o ON u.id = o.user_id 
WHERE o.created_at > '2024-01-01' 
GROUP BY u.name;

Timeline:
t=0ms:   Parse SQL → Parse tree
t=1ms:   Analyze → Query tree (validate tables, columns)
t=2ms:   Optimize → Generate plans, estimate costs, choose best
t=5ms:   Execute → Scan, join, aggregate
t=15ms:  Return results
\`\`\`

## Parser — SQL to Parse Tree

\`\`\`
Input: "SELECT id, name FROM users WHERE age > 25"

Lexical analysis (tokenize):
[SELECT] [id] [,] [name] [FROM] [users] [WHERE] [age] [>] [25]

Parse tree (AST - Abstract Syntax Tree):
SelectStmt {
    targetList: [
        ResTarget { val: ColumnRef("id") },
        ResTarget { val: ColumnRef("name") }
    ],
    fromClause: [
        RangeVar { relname: "users" }
    ],
    whereClause: A_Expr {
        kind: AEXPR_OP,
        name: ">",
        lexpr: ColumnRef("age"),
        rexpr: A_Const(25)
    }
}

PostgreSQL parser (Bison-based):
├── src/backend/parser/gram.y (grammar rules)
├── Shift-reduce parsing
├── Builds parse tree in memory
└── ~10,000 lines of grammar

Syntax errors caught here:
"SELECT id name FROM users"  -- Missing comma
ERROR: syntax error at or near "name"
\`\`\`

### Grammar Rules (Simplified)

\`\`\`c
// PostgreSQL grammar (simplified Bison)

select_stmt:
    SELECT opt_distinct target_list
    FROM from_list
    opt_where_clause
    opt_group_clause
    opt_order_clause

target_list:
    target_element
    | target_list ',' target_element

target_element:
    a_expr opt_as_label
    | '*'

where_clause:
    WHERE a_expr

a_expr:
    c_expr
    | a_expr '+' a_expr
    | a_expr '>' a_expr
    | a_expr AND a_expr
    // ... more operators

// Parse tree nodes
typedef struct SelectStmt {
    NodeTag     type;
    List       *targetList;      // SELECT clause
    List       *fromClause;      // FROM clause
    Node       *whereClause;     // WHERE clause
    List       *groupClause;     // GROUP BY
    List       *sortClause;      // ORDER BY
    // ... more fields
} SelectStmt;
\`\`\`

## Analyzer — Semantic Validation

\`\`\`
Input: Parse tree
Output: Query tree (with types, resolved names)

Tasks:
1. Resolve table/column names
2. Type checking
3. View expansion
4. Permission checking

Example:
SELECT u.name, o.total 
FROM users u 
JOIN orders o ON u.id = o.user_id;

Analysis:
1. Resolve "users" → table OID 16384
2. Resolve "orders" → table OID 16385
3. Resolve "u.name" → users.name (column 2, type TEXT)
4. Resolve "o.total" → orders.total (column 4, type NUMERIC)
5. Resolve "u.id" → users.id (column 1, type INTEGER)
6. Resolve "o.user_id" → orders.user_id (column 2, type INTEGER)
7. Check types: INTEGER = INTEGER ✓

Type mismatch error:
SELECT * FROM users WHERE id = 'abc';
-- id is INTEGER, 'abc' is TEXT
-- Analyzer attempts implicit cast: TEXT → INTEGER
-- Cast fails → ERROR: invalid input syntax for integer

View expansion:
CREATE VIEW active_users AS 
  SELECT * FROM users WHERE deleted_at IS NULL;

Query: SELECT * FROM active_users WHERE age > 25;

Analyzer rewrites:
SELECT * FROM users 
WHERE deleted_at IS NULL AND age > 25;
-- View expanded into base table query
\`\`\`

### Query Tree Structure

\`\`\`c
// PostgreSQL query tree
typedef struct Query {
    NodeTag     commandType;     // CMD_SELECT, CMD_UPDATE, etc
    List       *rtable;          // Range table (FROM tables)
    List       *targetList;      // Output columns
    Node       *jointree;        // FROM + WHERE combined
    List       *groupClause;     // GROUP BY expressions
    Node       *havingQual;      // HAVING clause
    List       *sortClause;      // ORDER BY
    // ... more fields
} Query;

// Range table entry (one per table in FROM)
typedef struct RangeTblEntry {
    Oid         relid;           // Table OID
    char       *eref;            // Alias (e.g., "u")
    Bitmapset  *selectedCols;    // Columns actually used
    // ... more fields
} RangeTblEntry;

Range table example:
FROM users u JOIN orders o

rtable = [
    RTE { relid: 16384, eref: "u" },  // users
    RTE { relid: 16385, eref: "o" }   // orders
]
\`\`\`

## Optimizer — The Brain of the Database

\`\`\`
Optimizer's job:
1. Generate alternative execution plans
2. Estimate cost of each plan
3. Choose cheapest plan

For simple query: 10-100 alternative plans
For complex query: millions of alternative plans
Optimization time budget: ~5-50ms

Example query:
SELECT * FROM orders 
WHERE user_id = 123 AND status = 'shipped';

Indexes:
├── idx_user_id on (user_id)
└── idx_status on (status)

Alternative plans:

Plan 1: Sequential scan
├── Scan all rows
├── Filter user_id = 123 AND status = 'shipped'
└── Cost: 10000 (scan entire table)

Plan 2: Index scan on idx_user_id
├── Index scan user_id = 123 → 100 rows
├── Filter status = 'shipped' → 10 rows
└── Cost: 150 (index scan + heap fetches)

Plan 3: Index scan on idx_status
├── Index scan status = 'shipped' → 1000 rows
├── Filter user_id = 123 → 10 rows
└── Cost: 1100 (many heap fetches)

Plan 4: Bitmap scan combining both indexes
├── Bitmap scan idx_user_id → bitmap
├── Bitmap scan idx_status → bitmap
├── AND bitmaps
├── Heap scan on combined bitmap
└── Cost: 120 (fewer heap fetches)

Optimizer chooses: Plan 4 (cost 120)
\`\`\`

### Cost Model — Estimating Plan Cost

\`\`\`
PostgreSQL cost model:

Cost = CPU cost + I/O cost

I/O costs (GUC parameters):
seq_page_cost = 1.0      // Sequential page read
random_page_cost = 4.0   // Random page read (4x slower)
cpu_tuple_cost = 0.01    // Process one tuple
cpu_index_tuple_cost = 0.005  // Process one index tuple
cpu_operator_cost = 0.0025    // Execute operator (=, <, etc)

Sequential scan cost:
pages = 10000 (table size)
tuples = 1000000
Cost = (pages × seq_page_cost) + (tuples × cpu_tuple_cost)
     = (10000 × 1.0) + (1000000 × 0.01)
     = 10000 + 10000
     = 20000

Index scan cost:
index_pages = 100 (index size)
tuples = 1000 (estimated rows returned)
Cost = (index_pages × random_page_cost) + 
       (tuples × random_page_cost) +  // Heap fetches
       (tuples × cpu_tuple_cost)
     = (100 × 4.0) + (1000 × 4.0) + (1000 × 0.01)
     = 400 + 4000 + 10
     = 4410

Lower cost = optimizer chooses this plan.

Tuning cost parameters:
SSD: random_page_cost = 1.1 (random ≈ sequential)
HDD: random_page_cost = 4.0 (default)
RAM: effective_cache_size (hint for optimizer)
\`\`\`

### Cardinality Estimation — Predicting Row Counts

\`\`\`
Most critical optimizer task: Estimate rows returned

Query: SELECT * FROM users WHERE age > 25;

Optimizer needs:
├── Total rows in table
├── Rows matching age > 25
└── Selectivity of predicate

Statistics (from ANALYZE):
Table: users
├── Rows: 1,000,000
├── Column: age
│   ├── n_distinct: 80 (80 unique values)
│   ├── most_common_vals: [25, 30, 35, 40, ...]
│   ├── most_common_freqs: [0.15, 0.12, 0.10, ...]
│   ├── histogram_bounds: [18, 22, 26, 30, ..., 85]
│   └── null_frac: 0.01 (1% NULLs)

Selectivity calculation (age > 25):

Using histogram:
├── Histogram buckets: [18-22], [22-26], [26-30], [30-35], ...
├── Buckets with age > 25: [26-30], [30-35], ..., [81-85]
├── Fraction of buckets: 14 / 20 = 0.70
└── Estimated selectivity: 0.70 (70% of rows)

Estimated rows = 1,000,000 × 0.70 = 700,000

Multiple predicates:
WHERE age > 25 AND city = 'NYC'

Assume independence (often wrong!):
├── Selectivity(age > 25) = 0.70
├── Selectivity(city = 'NYC') = 0.05
└── Combined: 0.70 × 0.05 = 0.035 (3.5%)

Estimated rows = 1,000,000 × 0.035 = 35,000

Correlation problem:
If age and city are correlated (NYC has younger population),
independence assumption is wrong!
→ Estimation error
→ Suboptimal plan

Solution: Extended statistics (PostgreSQL 10+)
CREATE STATISTICS stats_age_city ON age, city FROM users;
ANALYZE users;
-- Now optimizer knows correlation
\`\`\`

### Join Order Optimization

\`\`\`
Query:
SELECT *
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN items i ON o.id = i.order_id;

Three tables → 3! = 6 possible join orders:

Order 1: (users ⋈ orders) ⋈ items
Order 2: (users ⋈ items) ⋈ orders
Order 3: (orders ⋈ users) ⋈ items
Order 4: (orders ⋈ items) ⋈ users
Order 5: (items ⋈ users) ⋈ orders
Order 6: (items ⋈ orders) ⋈ users

Cardinalities:
├── users: 10,000 rows
├── orders: 100,000 rows (10 orders per user on average)
└── items: 500,000 rows (5 items per order on average)

Cost analysis (simplified):

Order 1: (users ⋈ orders) ⋈ items
├── users ⋈ orders = 100,000 rows (all orders)
├── (intermediate) ⋈ items = 500,000 rows
└── Cost: 10K + 100K + 100K + 500K = 710K

Order 6: (items ⋈ orders) ⋈ users
├── items ⋈ orders = 500,000 rows (all items)
├── (intermediate) ⋈ users = 500,000 rows
└── Cost: 500K + 100K + 500K + 10K = 1,110K

Order 1 is cheaper (710K vs 1,110K).

General rule: Small tables first (reduces intermediate result size).

Dynamic programming optimization:
For n tables:
├── n = 3: 6 plans (exhaustive search)
├── n = 5: 120 plans (still feasible)
├── n = 10: 3,628,800 plans (too many!)
└── n > 12: Heuristic/genetic algorithms (GEQO)

PostgreSQL GEQO (Genetic Query Optimizer):
├── Enabled for join_collapse_limit > 12
├── Generates random join orders
├── Evolutionary algorithm (mutation, crossover)
└── Finds "good enough" plan in reasonable time
\`\`\`

## Executor — The Worker

\`\`\`
Volcano model (iterator interface):

Interface:
├── Open() - Initialize scan
├── Next() - Get next tuple
├── Close() - Clean up

Every executor node implements this interface:
├── SeqScan
├── IndexScan
├── NestLoop (join)
├── HashJoin
├── Sort
└── Aggregate

Execution tree example:

SELECT u.name, COUNT(*)
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.name;

Execution plan:
        Aggregate
            ↓
        HashJoin (u.id = o.user_id)
           / \
    SeqScan  IndexScan
    (users)  (orders)

Execution flow (pull-based):

1. Aggregate calls Next()
2. HashJoin calls Next()
   ├── Build phase: SeqScan(users).Next() repeatedly
   │   └── Build hash table: {id → name}
   ├── Probe phase: IndexScan(orders).Next() repeatedly
   │   └── Lookup each order.user_id in hash table
   └── Return joined tuples
3. Aggregate accumulates counts
4. Return results

Code structure (pseudocode):

// Aggregate node
Aggregate::Next() {
    if (first_call) {
        while (tuple = child.Next()) {
            key = tuple.name;
            counts[key]++;
        }
        first_call = false;
    }
    return next_result_from_counts();
}

// HashJoin node
HashJoin::Next() {
    if (build_phase) {
        while (tuple = left_child.Next()) {
            hash_table[tuple.id] = tuple;
        }
        build_phase = false;
    }
    
    // Probe phase
    while (probe_tuple = right_child.Next()) {
        key = probe_tuple.user_id;
        if (hash_table.contains(key)) {
            return join(hash_table[key], probe_tuple);
        }
    }
    return NULL;  // No more results
}
\`\`\`

### Join Algorithms

#### Nested Loop Join

\`\`\`
Algorithm:
for each row r in left table:
    for each row s in right table:
        if r.key = s.key:
            output (r, s)

Cost: O(n × m) where n = left rows, m = right rows

Example:
SELECT * FROM users u JOIN orders o ON u.id = o.user_id;

users: 10,000 rows
orders: 100,000 rows

Nested loop cost:
├── Outer loop: 10,000 iterations
├── Inner loop: 100,000 iterations each
└── Total comparisons: 10,000 × 100,000 = 1 billion

Optimized: Index nested loop
for each row r in left table:
    use index to find matching rows in right table
    for each matching row s:
        output (r, s)

Cost: O(n × log m) with index

Index nested loop cost:
├── Outer loop: 10,000 iterations
├── Index lookup: log₂(100,000) ≈ 17 comparisons each
└── Total: 10,000 × 17 = 170,000 (6000x faster!)

When to use nested loop:
✓ Small outer table
✓ Index on inner table join key
✓ High selectivity (few matching rows)
\`\`\`

#### Hash Join

\`\`\`
Algorithm:
1. Build phase: Hash left table into memory hash table
2. Probe phase: For each right row, lookup in hash table

Example:
SELECT * FROM users u JOIN orders o ON u.id = o.user_id;

Build phase (users):
hash_table = {}
for each user in users:
    hash_table[user.id] = user
    
Hash table:
{
    1: {id:1, name:'Alice'},
    2: {id:2, name:'Bob'},
    ...
}

Probe phase (orders):
for each order in orders:
    user = hash_table.lookup(order.user_id)
    if user exists:
        output (user, order)

Cost: O(n + m)
├── Build: n (hash all users)
├── Probe: m (lookup each order)
└── Total: n + m = 10,000 + 100,000 = 110,000

vs Nested loop: 1 billion
Hash join is 9000x faster!

Memory requirement:
├── Hash table size ≈ left table size
├── Must fit in work_mem (default 4MB)
├── If too large: Hybrid hash join (partition to disk)
└── PostgreSQL work_mem parameter

When to use hash join:
✓ Large tables
✓ Equi-join (=) only
✓ Left table fits in memory
✗ Non-equi-joins (>, <, BETWEEN)
\`\`\`

#### Merge Join

\`\`\`
Algorithm:
1. Sort both tables by join key
2. Merge sorted streams

Example:
SELECT * FROM users u JOIN orders o ON u.id = o.user_id;

Sort phase:
users_sorted = sort(users by id)
orders_sorted = sort(orders by user_id)

Merge phase:
users_sorted:  [1, 2, 3, 4, ...]
orders_sorted: [1, 1, 2, 2, 2, 3, ...]
                ↑  ↑
                └──┘ match → output
                
Cost: O(n log n + m log m + n + m)
├── Sort users: 10,000 log 10,000 ≈ 133,000
├── Sort orders: 100,000 log 100,000 ≈ 1,660,000
├── Merge: 10,000 + 100,000 = 110,000
└── Total: 1,903,000

Already sorted optimization:
If join key has index (already sorted):
Cost: O(n + m) = 110,000 (merge only, no sort!)

When to use merge join:
✓ Both inputs sorted (indexes exist)
✓ Large tables
✓ Non-equi-joins (>, <, BETWEEN)
✓ Sorted output needed (for ORDER BY)
\`\`\`

### Aggregate Algorithms

\`\`\`
Query: SELECT city, COUNT(*) FROM users GROUP BY city;

HashAggregate:
1. Build hash table: {city → count}
2. For each row, increment count[city]
3. Return results from hash table

hash_table = {}
for each user in users:
    hash_table[user.city]++
    
Result:
{
    'NYC': 50000,
    'LA': 30000,
    'SF': 20000
}

Cost: O(n)
Memory: O(distinct cities)

GroupAggregate (requires sorted input):
1. Sort by GROUP BY columns
2. Accumulate counts while city unchanged
3. Emit result when city changes

Sorted input:
[{city:'LA', ...}, {city:'LA', ...}, {city:'NYC', ...}, ...]

Processing:
current_city = 'LA'
count = 0
for each user in users_sorted:
    if user.city == current_city:
        count++
    else:
        output (current_city, count)
        current_city = user.city
        count = 1

Cost: O(n log n + n) if sort needed
      O(n) if already sorted

Memory: O(1) (only stores current group)

Optimizer chooses:
├── HashAggregate: If groups fit in work_mem
└── GroupAggregate: If input already sorted or too many groups
\`\`\`

## EXPLAIN — Reading Execution Plans

\`\`\`
EXPLAIN shows optimizer's chosen plan:

EXPLAIN SELECT * FROM users WHERE age > 25;

Output:
Seq Scan on users  (cost=0.00..18334.00 rows=666667 width=52)
  Filter: (age > 25)

Breaking down:
├── "Seq Scan" - Sequential scan (reads all rows)
├── "on users" - Table name
├── cost=0.00..18334.00
│   ├── 0.00 = startup cost (cost before first row)
│   └── 18334.00 = total cost (cost to fetch all rows)
├── rows=666667 - Estimated rows returned
└── width=52 - Average row size (bytes)

EXPLAIN ANALYZE (actually execute):

EXPLAIN ANALYZE SELECT * FROM users WHERE age > 25;

Output:
Seq Scan on users  (cost=0.00..18334.00 rows=666667 width=52)
                   (actual time=0.123..145.678 rows=700000 loops=1)
  Filter: (age > 25)
  Rows Removed by Filter: 300000
Planning Time: 1.234 ms
Execution Time: 156.789 ms

Added info:
├── actual time=0.123..145.678
│   ├── 0.123ms = time to first row
│   └── 145.678ms = time to last row
├── rows=700000 - ACTUAL rows (vs 666667 estimated)
├── Rows Removed: 300000 (didn't match filter)
├── Planning Time: How long optimizer took
└── Execution Time: How long execution took

Estimation error:
Estimated: 666,667 rows
Actual: 700,000 rows
Error: 5% (acceptable)

Large error (>50%) → statistics out of date → run ANALYZE
\`\`\`

### Reading Complex Plans

\`\`\`
EXPLAIN for join query:

EXPLAIN SELECT u.name, COUNT(*)
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.created_at > '2024-01-01'
GROUP BY u.name;

Output:
HashAggregate  (cost=15234.56..15345.67 rows=100 width=40)
  Group Key: u.name
  ->  Hash Join  (cost=5123.45..14234.56 rows=50000 width=32)
        Hash Cond: (o.user_id = u.id)
        ->  Index Scan using idx_orders_created_at on orders o
              (cost=0.43..8234.56 rows=50000 width=8)
              Index Cond: (created_at > '2024-01-01'::date)
        ->  Hash  (cost=4123.00..4123.00 rows=10000 width=36)
              ->  Seq Scan on users u
                    (cost=0.00..4123.00 rows=10000 width=36)

Reading bottom-up (execution order):
1. Seq Scan on users → 10,000 rows
2. Hash (build hash table) → 10,000 rows
3. Index Scan on orders → 50,000 rows (filtered by date)
4. Hash Join → 50,000 rows (join users + orders)
5. HashAggregate → 100 rows (grouped by name)

Indentation shows tree structure:
├── HashAggregate (parent)
│   └── Hash Join (child)
│       ├── Index Scan orders (left child)
│       └── Hash (right child)
│           └── Seq Scan users (grandchild)

Cost flows up:
├── Seq Scan users: 4123.00
├── Hash: 4123.00 (same, just wrap)
├── Index Scan orders: 8234.56
├── Hash Join: 14234.56 (8234 + 4123 + join cost)
└── HashAggregate: 15345.67 (14234 + agg cost)
\`\`\`

## Query Optimization Tips

\`\`\`
1. Keep statistics fresh:
   ANALYZE table_name;
   -- Run after bulk INSERT/UPDATE/DELETE

2. Add appropriate indexes:
   CREATE INDEX ON users(email) WHERE deleted_at IS NULL;
   -- Partial index for active users only

3. Rewrite subqueries as JOINs:
   Bad:  SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);
   Good: SELECT DISTINCT u.* FROM users u JOIN orders o ON u.id = o.user_id;

4. Avoid function calls in WHERE:
   Bad:  WHERE LOWER(email) = 'alice@example.com'
   Good: WHERE email = 'Alice@Example.com'
         -- Or create expression index on LOWER(email)

5. Use LIMIT for pagination:
   SELECT * FROM users ORDER BY created_at LIMIT 100 OFFSET 0;
   -- Optimizer can stop early

6. Partition large tables:
   CREATE TABLE orders_2024 PARTITION OF orders
     FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
   -- Query only relevant partition

7. Tune work_mem for large sorts/joins:
   SET work_mem = '256MB';
   -- Prevent spilling to disk

8. Use EXPLAIN ANALYZE to verify:
   -- Check actual rows vs estimated rows
   -- Large discrepancy → update statistics
\`\`\`

Query processing is the heart of database performance. Understanding the pipeline — from parsing to execution — means understanding why queries behave the way they do and how to make them faster.`,

  fr: `# Traitement des requêtes — Du SQL aux résultats

Vous tapez SELECT. Quelques millisecondes plus tard, les résultats apparaissent. Que s'est-il passé entre les deux ? Le processeur de requêtes : analyseur, optimiseur, exécuteur.

## Le pipeline de traitement des requêtes

\`\`\`
SQL → Analyseur → Analyseur → Optimiseur → Exécuteur → Résultats

1. Analyseur :
   ├── Entrée : Texte SQL
   ├── Sortie : Arbre d'analyse (AST)
   └── Valide la syntaxe

2. Analyseur/Réécrivain :
   ├── Validation sémantique
   └── Expansion des vues

3. Optimiseur :
   ├── Générer des plans alternatifs
   ├── Estimation des coûts
   └── Choisir le plan le moins cher

4. Exécuteur :
   └── Modèle Volcano (interface itérateur)
\`\`\`

## Optimiseur — Le cerveau de la base de données

\`\`\`
Travail de l'optimiseur :
1. Générer des plans d'exécution alternatifs
2. Estimer le coût de chaque plan
3. Choisir le plan le moins cher
\`\`\`

## Exécuteur — Le travailleur

\`\`\`
Modèle Volcano (interface itérateur) :

Interface :
├── Open() - Initialiser le scan
├── Next() - Obtenir le tuple suivant
├── Close() - Nettoyer
\`\`\`

## Algorithmes de jointure

### Nested Loop Join

\`\`\`
Coût : O(n × m)
\`\`\`

### Hash Join

\`\`\`
Coût : O(n + m)
9000x plus rapide que nested loop !
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What is the primary job of the query optimizer?",
      options: [
        "Parse SQL syntax",
        "Generate alternative execution plans, estimate costs, choose cheapest — determines query performance",
        "Execute the query",
        "Store results",
      ],
      correct: 1,
    },
    {
      question:
        "Why is hash join typically 1000x faster than nested loop join?",
      options: [
        "Hash join uses less memory",
        "Hash join is O(n+m) with hash table lookup vs nested loop O(n×m) with full inner scan per outer row",
        "Hash join uses better algorithms",
        "Hash join is parallelized",
      ],
      correct: 1,
    },
    {
      question:
        "What does 'actual time=0.123..145.678 rows=700000' in EXPLAIN ANALYZE mean?",
      options: [
        "Query took 145 seconds",
        "First row at 0.123ms, all rows at 145.678ms, actually returned 700K rows (vs estimate)",
        "145 rows returned",
        "Query failed",
      ],
      correct: 1,
    },
    {
      question:
        "Why do large estimation errors (estimated 100K, actual 1M) cause slow queries?",
      options: [
        "Database runs slower",
        "Optimizer chose plan based on wrong estimate (e.g., nested loop instead of hash join) — suboptimal plan executed",
        "More memory used",
        "Network latency increases",
      ],
      correct: 1,
    },
    {
      question:
        "What makes merge join efficient when inputs are pre-sorted by index?",
      options: [
        "Uses less memory",
        "Eliminates O(n log n) sort cost — merge is O(n+m), scanning both sorted inputs once",
        "Parallelizes better",
        "Uses fewer CPU cycles",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Quel est le travail principal de l'optimiseur de requêtes ?",
      options: [
        "Analyser la syntaxe SQL",
        "Générer des plans d'exécution alternatifs, estimer les coûts, choisir le moins cher",
        "Exécuter la requête",
        "Stocker les résultats",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi hash join est-il typiquement 1000x plus rapide que nested loop join ?",
      options: [
        "Hash join utilise moins de mémoire",
        "Hash join est O(n+m) avec recherche table de hachage vs nested loop O(n×m) avec scan interne complet par ligne externe",
        "Hash join utilise de meilleurs algorithmes",
        "Hash join est parallélisé",
      ],
      correct: 1,
    },
    {
      question:
        "Que signifie 'actual time=0.123..145.678 rows=700000' dans EXPLAIN ANALYZE ?",
      options: [
        "La requête a pris 145 secondes",
        "Première ligne à 0.123ms, toutes lignes à 145.678ms, a réellement retourné 700K lignes",
        "145 lignes retournées",
        "La requête a échoué",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi les grandes erreurs d'estimation causent-elles des requêtes lentes ?",
      options: [
        "La base de données ralentit",
        "L'optimiseur a choisi un plan basé sur une mauvaise estimation — plan sous-optimal exécuté",
        "Plus de mémoire utilisée",
        "La latence réseau augmente",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce qui rend merge join efficace quand les entrées sont pré-triées par index ?",
      options: [
        "Utilise moins de mémoire",
        "Élimine le coût de tri O(n log n) — merge est O(n+m), scannant les deux entrées triées une fois",
        "Parallélise mieux",
        "Utilise moins de cycles CPU",
      ],
      correct: 1,
    },
  ],
};
