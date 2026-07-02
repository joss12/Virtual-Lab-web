export const content = {
  en: `# Execution Plans

## What Is an Execution Plan?

An execution plan is the **exact sequence of operations** the database engine will perform to execute your query. The optimizer generates dozens or hundreds of candidate plans and picks the one with the lowest estimated cost. Understanding plans is the single most important skill for diagnosing slow queries.

\`\`\`
Query → Optimizer → Plan Tree → Executor

The plan is a TREE of nodes. Data flows bottom-up:
leaf nodes read data, internal nodes transform it, root node returns results.
\`\`\`

## PostgreSQL EXPLAIN

\`\`\`sql
-- Basic plan (estimated costs only, no execution)
EXPLAIN SELECT * FROM orders WHERE user_id = 42;

-- Full plan with actual runtime stats
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT TEXT) 
SELECT * FROM orders WHERE user_id = 42;
\`\`\`

**ANALYZE** actually runs the query — be careful with INSERT/UPDATE/DELETE (wrap in a transaction and rollback).

\`\`\`sql
BEGIN;
EXPLAIN ANALYZE DELETE FROM orders WHERE status = 'cancelled';
ROLLBACK;
\`\`\`

## Anatomy of a Plan Node

\`\`\`
Seq Scan on orders  (cost=0.00..4521.00 rows=1250 width=72)
                    (actual time=0.012..18.4 rows=1243 loops=1)
  Filter: (user_id = 42)
  Rows Removed by Filter: 98757
  Buffers: shared hit=1231 read=1042
\`\`\`

Breaking it down:

\`\`\`
Node type:    Seq Scan
Table:        orders
cost=         0.00        ← startup cost (cost before first row is returned)
              ..4521.00   ← total cost (all rows returned)
rows=         1250        ← estimated output rows
width=        72          ← estimated average row width in bytes

actual time=  0.012       ← ms to return first row
              ..18.4      ← ms to return all rows
rows=         1243        ← ACTUAL rows returned
loops=        1           ← how many times this node executed

Filter:       (user_id = 42)          ← predicate applied after reading row
Rows Removed: 98757                   ← rows read but discarded

Buffers:
  shared hit= 1231   ← pages served from shared_buffers (fast, memory)
  shared read=1042   ← pages read from disk (slow)
  shared written=0   ← dirty pages written during query
\`\`\`

**The most important numbers:**
- Estimated rows vs actual rows → quality of statistics
- shared hit vs shared read → cache effectiveness
- Startup cost → important for LIMIT queries and nested loops

## Scan Types

### Sequential Scan
Reads every page of the table from start to finish. Best for large result sets.

\`\`\`
Seq Scan on orders
  Filter: (status = 'pending')
\`\`\`

The filter is applied AFTER reading each row — all pages are read regardless.

### Index Scan
Traverses the B-tree index to find matching row locations, then fetches rows from the heap.

\`\`\`
Index Scan using idx_orders_user_id on orders
  Index Cond: (user_id = 42)
\`\`\`

Two operations: index traversal + heap fetch per row. Expensive if many rows match (random I/O).

### Index Only Scan
Like index scan, but ALL needed columns are in the index — no heap fetch needed.

\`\`\`
Index Only Scan using idx_orders_user_status on orders
  Index Cond: (user_id = 42)
  Heap Fetches: 0    ← zero heap pages read — all data from index
\`\`\`

\`\`\`sql
-- Enable this by creating a covering index:
CREATE INDEX idx_orders_user_status ON orders(user_id, status, total);
-- Query: SELECT status, total FROM orders WHERE user_id = 42
-- All columns (status, total) are in the index → Index Only Scan
\`\`\`

Heap Fetches > 0 means some pages needed visibility checking (not yet vacuumed). Run \`VACUUM orders\` to fix.

### Bitmap Index Scan
Used when multiple index conditions exist OR when a single index would return many rows. PostgreSQL builds a bitmap of matching pages, then fetches those pages in physical order (converting random I/O to sequential).

\`\`\`
Bitmap Heap Scan on orders
  Recheck Cond: ((user_id = 42) AND (status = 'pending'))
  ->  BitmapAnd
        ->  Bitmap Index Scan on idx_orders_user_id
              Index Cond: (user_id = 42)
        ->  Bitmap Index Scan on idx_orders_status
              Index Cond: (status = 'pending')
\`\`\`

Two separate indexes ANDed together. The bitmap identifies which heap pages to read, then reads them in order.

\`\`\`
Bitmap memory:
  Exact mode:   1 bit per heap page — precise, O(pages) memory
  Lossy mode:   when bitmap exceeds work_mem — recheck needed on every row
  
"Recheck Cond" always appears but is only actually re-evaluated in lossy mode.
\`\`\`

## Join Plan Nodes

### Nested Loop
\`\`\`
Nested Loop
  ->  Index Scan on users u
        Index Cond: (id = 42)      ← outer: returns 1 row
  ->  Index Scan on orders o
        Index Cond: (user_id = u.id) ← inner: executed once per outer row
\`\`\`

Inner side \`loops=N\` where N = outer result rows. If outer returns 1000 rows and inner has no index: 1000 sequential scans. Catastrophic.

### Hash Join
\`\`\`
Hash Join
  Hash Cond: (o.user_id = u.id)
  ->  Seq Scan on orders o          ← probe side (larger table)
  ->  Hash                          ← build side
        ->  Seq Scan on users u     ← smaller table hashed into memory
\`\`\`

\`\`\`
Hash
  Buckets: 1024    ← hash table buckets
  Batches: 1       ← 1 = fits in work_mem
           8       ← 8 = spilled to disk! increase work_mem
  Memory Usage: 42kB
\`\`\`

### Merge Join
\`\`\`
Merge Join
  Merge Cond: (o.user_id = u.id)
  ->  Index Scan using idx_orders_user_id on orders o  ← already sorted
  ->  Index Scan using users_pkey on users u           ← already sorted
\`\`\`

No sort needed — both inputs come from index scans (already in key order). Very efficient.

## Aggregate and Sort Nodes

\`\`\`
-- GROUP BY plan:
HashAggregate
  Group Key: u.country
  ->  Seq Scan on users u

-- or (when input is sorted):
GroupAggregate
  Group Key: u.country
  ->  Sort
        Sort Key: u.country
        Sort Method: quicksort  Memory: 1842kB
        ->  Seq Scan on users u
\`\`\`

\`\`\`
Sort Method: quicksort     → fits in work_mem (fast)
             external merge → spilled to disk (slow, increase work_mem)
             top-N heapsort → used for ORDER BY ... LIMIT N (only keeps N rows)
\`\`\`

## Parallel Query Plans

PostgreSQL can parallelize scans and joins across multiple CPU cores:

\`\`\`
Gather  (cost=1000..48000 rows=1000)
  Workers Planned: 4
  Workers Launched: 4
  ->  Parallel Seq Scan on orders
        Worker 0: rows=62480
        Worker 1: rows=62391
        Worker 2: rows=62502
        Worker 3: rows=62627
\`\`\`

\`Gather\` collects results from parallel workers. \`Gather Merge\` collects pre-sorted results.

\`\`\`sql
-- Control parallelism
SET max_parallel_workers_per_gather = 4;
SET parallel_tuple_cost = 0.1;
SET parallel_setup_cost = 1000;

-- Disable for a specific query:
SET max_parallel_workers_per_gather = 0;
\`\`\`

## Real-World Plan Diagnosis

### Case 1: Huge rows estimate vs actual discrepancy
\`\`\`
Seq Scan on events  (rows=100 estimated)  (rows=4500000 actual)
\`\`\`
**Fix:** \`ANALYZE events;\` — stale statistics. If autovacuum can't keep up: increase \`autovacuum_analyze_scale_factor\` or manually schedule ANALYZE.

### Case 2: Wrong join algorithm chosen
\`\`\`
Nested Loop  (actual rows=500000  loops=10000)
\`\`\`
Inner side runs 10,000 times on 500,000 rows = 5 billion row comparisons.
**Fix:** 
\`\`\`sql
-- Add index on join key
CREATE INDEX ON orders(user_id);
-- Or force hash join for this query:
SET enable_nestloop = OFF;
\`\`\`

### Case 3: Index exists but not used
\`\`\`sql
-- Index on (status) exists but Seq Scan chosen
EXPLAIN SELECT * FROM orders WHERE status = 'pending';
-- If 40% of rows have status='pending', seq scan IS correct
-- If only 0.1% have status='pending':
SELECT * FROM pg_stats WHERE tablename='orders' AND attname='status';
-- Check most_common_freqs — if statistics are wrong, ANALYZE
\`\`\`

### Case 4: Expression prevents index use
\`\`\`sql
-- Bad: function on indexed column → seq scan
WHERE DATE(created_at) = '2024-01-01'

-- Good: range condition → index scan  
WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'

-- Or: expression index
CREATE INDEX ON orders(DATE(created_at));
\`\`\`

### Case 5: OFFSET pagination killing performance
\`\`\`sql
-- Bad: must scan 100,000 rows to skip them
SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 100000;
-- Plan: Sort → Limit → still reads 100,020 rows

-- Good: keyset pagination
SELECT * FROM orders WHERE id > 100000 ORDER BY id LIMIT 20;
-- Plan: Index Scan → Limit → reads exactly 20 rows
\`\`\`

## MySQL EXPLAIN

MySQL uses a different format:

\`\`\`sql
EXPLAIN SELECT o.id, u.name 
FROM orders o JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending'\\G

-- Output:
id: 1
select_type: SIMPLE
table: u
type: ALL          ← BAD: full table scan
possible_keys: PRIMARY
key: NULL          ← no index used
rows: 10000
Extra: 

id: 1  
table: o
type: ref          ← index lookup
key: idx_status_user
key_len: 4
ref: const
rows: 500
Extra: Using index condition
\`\`\`

**MySQL type column (best to worst):**
\`\`\`
system  → single row (constant)
const   → primary key or unique index lookup, 1 row
eq_ref  → unique index join, 1 row per outer row
ref     → non-unique index lookup
range   → index range scan
index   → full index scan (better than ALL, still slow)
ALL     → full table scan (usually bad)
\`\`\`

**MySQL Extra column red flags:**
\`\`\`
Using filesort      → needs sort that can't use index (add index matching ORDER BY)
Using temporary     → temporary table needed (GROUP BY, DISTINCT without index)
Using join buffer   → no index on join column (add index)
\`\`\`
`,

  fr: `# Plans d'exécution

## Qu'est-ce qu'un plan d'exécution ?

Un plan d'exécution est la **séquence exacte d'opérations** que le moteur de base de données effectuera pour exécuter votre requête. L'optimiseur génère des dizaines ou centaines de plans candidats et choisit celui avec le coût estimé le plus bas.

\`\`\`
Requête → Optimiseur → Arbre de plan → Exécuteur

Le plan est un ARBRE de nœuds. Les données circulent de bas en haut :
les nœuds feuilles lisent les données, les nœuds internes les transforment.
\`\`\`

## PostgreSQL EXPLAIN

\`\`\`sql
-- Plan de base (coûts estimés uniquement)
EXPLAIN SELECT * FROM orders WHERE user_id = 42;

-- Plan complet avec statistiques d'exécution réelles
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT TEXT) 
SELECT * FROM orders WHERE user_id = 42;
\`\`\`

**ANALYZE** exécute réellement la requête — attention avec INSERT/UPDATE/DELETE (envelopper dans une transaction et faire ROLLBACK).

## Anatomie d'un nœud de plan

\`\`\`
Seq Scan on orders  (cost=0.00..4521.00 rows=1250 width=72)
                    (actual time=0.012..18.4 rows=1243 loops=1)
  Filter: (user_id = 42)
  Rows Removed by Filter: 98757
  Buffers: shared hit=1231 read=1042
\`\`\`

\`\`\`
cost=0.00      ← coût de démarrage (avant le premier résultat)
     ..4521.00 ← coût total (tous les résultats retournés)
rows=1250      ← lignes de sortie estimées
rows=1243      ← lignes RÉELLES retournées (avec ANALYZE)

shared hit=    ← pages depuis shared_buffers (mémoire, rapide)
shared read=   ← pages lues depuis le disque (lent)
\`\`\`

## Types de scan

### Sequential Scan
Lit chaque page de la table du début à la fin. Optimal pour les grands ensembles de résultats.

### Index Scan
Parcourt le B-tree pour trouver les localisations des lignes, puis récupère les lignes depuis le heap. Coûteux si beaucoup de lignes correspondent (I/O aléatoire).

### Index Only Scan
Toutes les colonnes nécessaires sont dans l'index — pas de récupération heap.

\`\`\`
Index Only Scan using idx_orders_user_status on orders
  Heap Fetches: 0    ← zéro pages heap lues
\`\`\`

### Bitmap Index Scan
Utilisé quand plusieurs conditions d'index existent. PostgreSQL construit un bitmap des pages correspondantes, puis les récupère dans l'ordre physique.

\`\`\`
Bitmap Heap Scan on orders
  ->  BitmapAnd
        ->  Bitmap Index Scan on idx_orders_user_id
        ->  Bitmap Index Scan on idx_orders_status
\`\`\`

## Nœuds de jointure

### Nested Loop
\`\`\`
Nested Loop
  ->  Index Scan on users u     ← externe : retourne 1 ligne
  ->  Index Scan on orders o    ← interne : exécuté une fois par ligne externe
\`\`\`

### Hash Join
\`\`\`
Hash Join
  ->  Seq Scan on orders o      ← côté sonde (grande table)
  ->  Hash
        ->  Seq Scan on users u ← petite table hachée en mémoire
\`\`\`

\`\`\`
Batches: 1  → tient dans work_mem
         8  → débordé sur disque ! augmenter work_mem
\`\`\`

### Merge Join
\`\`\`
Merge Join
  ->  Index Scan on orders o    ← déjà trié
  ->  Index Scan on users u     ← déjà trié
\`\`\`

## Diagnostic de plans réels

### Cas 1 : Grande divergence estimé vs réel
\`\`\`
Seq Scan on events  (rows=100 estimé)  (rows=4500000 réel)
\`\`\`
**Correction :** \`ANALYZE events;\` — statistiques obsolètes.

### Cas 2 : Mauvais algorithme de jointure
\`\`\`
Nested Loop  (actual rows=500000  loops=10000)
\`\`\`
**Correction :**
\`\`\`sql
CREATE INDEX ON orders(user_id);
-- Ou forcer hash join :
SET enable_nestloop = OFF;
\`\`\`

### Cas 3 : Expression empêchant l'utilisation de l'index
\`\`\`sql
-- Mauvais : fonction sur colonne indexée → scan séquentiel
WHERE DATE(created_at) = '2024-01-01'

-- Bon : condition de plage → scan d'index
WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'
\`\`\`

### Cas 4 : Pagination OFFSET catastrophique
\`\`\`sql
-- Mauvais : doit scanner 100 000 lignes pour les ignorer
SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 100000;

-- Bon : pagination par jeu de clés
SELECT * FROM orders WHERE id > 100000 ORDER BY id LIMIT 20;
\`\`\`

## MySQL EXPLAIN

**Colonne type MySQL (meilleur au pire) :**
\`\`\`
system  → ligne unique (constante)
const   → lookup clé primaire ou index unique, 1 ligne
eq_ref  → jointure index unique, 1 ligne par ligne externe
ref     → lookup index non-unique
range   → scan de plage d'index
index   → scan complet d'index
ALL     → scan complet de table (généralement mauvais)
\`\`\`

**Signaux d'alarme colonne Extra MySQL :**
\`\`\`
Using filesort    → tri ne pouvant pas utiliser un index
Using temporary   → table temporaire nécessaire
Using join buffer → pas d'index sur colonne de jointure
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the difference between 'Index Scan' and 'Index Only Scan' in PostgreSQL?",
      options: [
        "Index Only Scan is faster because it skips the B-tree traversal",
        "Index Scan fetches rows from the heap after the index traversal; Index Only Scan gets all needed data from the index itself with no heap access",
        "Index Only Scan uses a hash index instead of a B-tree",
        "Index Scan works on primary keys; Index Only Scan works on secondary indexes",
      ],
      correct: 1,
    },
    {
      question:
        "When does PostgreSQL use a Bitmap Index Scan instead of a regular Index Scan?",
      options: [
        "When the table has no primary key",
        "When the query uses OR conditions or when a single index would return many rows — it builds a bitmap of matching pages and reads them in physical order",
        "When the index is larger than shared_buffers",
        "When the query has a GROUP BY clause",
      ],
      correct: 1,
    },
    {
      question:
        "In a Hash Join plan, what does 'Batches: 8 (original: 1)' mean?",
      options: [
        "The join was parallelized across 8 workers",
        "The query was retried 8 times due to deadlocks",
        "The hash table exceeded work_mem and spilled to disk in 8 batches — increase work_mem to fix",
        "8 partitions were pruned from the scan",
      ],
      correct: 2,
    },
    {
      question:
        "Why does 'WHERE DATE(created_at) = 2024-01-01' prevent index usage?",
      options: [
        "DATE() is not a deterministic function",
        "Applying a function to an indexed column forces the optimizer to evaluate it for every row — it cannot use the index on the raw column value",
        "PostgreSQL does not support date functions in WHERE clauses",
        "The index must be on a column, not an expression",
      ],
      correct: 1,
    },
    {
      question:
        "What is the fundamental performance problem with OFFSET-based pagination?",
      options: [
        "OFFSET causes a full table lock during execution",
        "The database must scan and discard all rows before the offset — OFFSET 100000 reads 100,020 rows to return 20",
        "OFFSET is not supported with ORDER BY",
        "OFFSET pagination causes cache thrashing in shared_buffers",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quelle est la différence entre 'Index Scan' et 'Index Only Scan' dans PostgreSQL ?",
      options: [
        "Index Only Scan est plus rapide car il saute la traversée B-tree",
        "Index Scan récupère les lignes depuis le heap après la traversée d'index ; Index Only Scan obtient toutes les données nécessaires depuis l'index lui-même sans accès heap",
        "Index Only Scan utilise un index hash plutôt qu'un B-tree",
        "Index Scan fonctionne sur les clés primaires ; Index Only Scan sur les index secondaires",
      ],
      correct: 1,
    },
    {
      question:
        "Quand PostgreSQL utilise-t-il un Bitmap Index Scan plutôt qu'un Index Scan régulier ?",
      options: [
        "Quand la table n'a pas de clé primaire",
        "Quand la requête utilise des conditions OR ou quand un seul index retournerait beaucoup de lignes — il construit un bitmap des pages correspondantes et les lit dans l'ordre physique",
        "Quand l'index est plus grand que shared_buffers",
        "Quand la requête a une clause GROUP BY",
      ],
      correct: 1,
    },
    {
      question:
        "Dans un plan Hash Join, que signifie 'Batches: 8 (original: 1)' ?",
      options: [
        "La jointure a été parallélisée sur 8 workers",
        "La requête a été réessayée 8 fois en raison de deadlocks",
        "La table de hachage a dépassé work_mem et s'est déversée sur le disque en 8 lots — augmenter work_mem pour corriger",
        "8 partitions ont été élaguées du scan",
      ],
      correct: 2,
    },
    {
      question:
        "Pourquoi 'WHERE DATE(created_at) = 2024-01-01' empêche-t-il l'utilisation de l'index ?",
      options: [
        "DATE() n'est pas une fonction déterministe",
        "Appliquer une fonction sur une colonne indexée force l'optimiseur à l'évaluer pour chaque ligne — il ne peut pas utiliser l'index sur la valeur brute de la colonne",
        "PostgreSQL ne supporte pas les fonctions de date dans les clauses WHERE",
        "L'index doit être sur une colonne, pas sur une expression",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est le problème de performance fondamental avec la pagination basée sur OFFSET ?",
      options: [
        "OFFSET provoque un verrou complet de table pendant l'exécution",
        "La base de données doit scanner et ignorer toutes les lignes avant l'offset — OFFSET 100000 lit 100 020 lignes pour en retourner 20",
        "OFFSET n'est pas supporté avec ORDER BY",
        "La pagination OFFSET cause un thrashing du cache dans shared_buffers",
      ],
      correct: 1,
    },
  ],
};
