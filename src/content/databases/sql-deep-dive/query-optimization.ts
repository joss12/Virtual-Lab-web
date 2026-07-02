export const content = {
  en: `# Query Optimization

## The Query Optimizer's Job

The query optimizer takes a SQL statement and finds the **cheapest execution plan**. "Cheapest" means minimizing I/O, CPU, and memory — not necessarily the plan that looks most intuitive to a human.

\`\`\`
SQL Query (declarative — WHAT you want)
        ↓
   Parser → Parse Tree
        ↓
   Rewriter → Canonical form (flatten subqueries, apply rules)
        ↓
   Optimizer → Enumerate plans → Estimate costs → Pick cheapest
        ↓
   Executor → Run the plan
        ↓
   Results
\`\`\`

The optimizer doesn't know what you *intend* — it only knows statistics about your data and the available access methods.

## Cost-Based Optimization

Modern optimizers (PostgreSQL, MySQL 8.0+, SQL Server) are **cost-based**. Every operation has an estimated cost in abstract units combining:

- **I/O cost** — number of page reads (sequential vs random)
- **CPU cost** — number of tuple comparisons, function evaluations
- **Memory cost** — hash table size, sort buffer usage

\`\`\`sql
-- PostgreSQL cost model:
-- seq_page_cost      = 1.0   (sequential page read)
-- random_page_cost   = 4.0   (random page read, 4x more expensive)
-- cpu_tuple_cost     = 0.01  (process one row)
-- cpu_index_tuple_cost = 0.005
-- cpu_operator_cost  = 0.0025

-- A sequential scan of a 10,000-page table:
-- Cost = 10,000 * seq_page_cost = 10,000

-- An index scan returning 100 rows from that table:
-- Cost = 100 * random_page_cost + 100 * cpu_index_tuple_cost
--      = 400 + 0.5 = 400.5
-- Cheaper for selective queries, more expensive for large result sets
\`\`\`

This is why the optimizer sometimes chooses a sequential scan over an index — if it estimates you're returning 30%+ of rows, random I/O from index lookups costs more than just reading the whole table sequentially.

## Statistics and Cardinality Estimation

The optimizer's estimates are only as good as its **statistics**. PostgreSQL stores statistics in \`pg_statistic\` (queried via \`pg_stats\`):

\`\`\`sql
SELECT attname, n_distinct, correlation, most_common_vals, most_common_freqs
FROM pg_stats
WHERE tablename = 'orders';
\`\`\`

Key statistics:
- **\`n_distinct\`** — estimated number of distinct values. Negative means fraction of total rows (e.g. \`-0.3\` = 30% of rows are distinct)
- **\`correlation\`** — statistical correlation between physical row order and logical column order. \`1.0\` = perfectly sorted, \`0.0\` = random. High correlation → index scan is cheap (sequential-ish I/O). Low correlation → index scan causes random I/O.
- **\`most_common_vals\`** — array of most frequent values
- **\`most_common_freqs\`** — corresponding frequencies

\`\`\`sql
-- Force statistics update (usually done by autovacuum)
ANALYZE orders;

-- Increase statistics target for a column with many distinct values
ALTER TABLE orders ALTER COLUMN status SET STATISTICS 500;
-- Default is 100 — more samples = better estimates but slower ANALYZE
\`\`\`

**Cardinality estimation errors** are the #1 cause of bad query plans. If the optimizer thinks a filter returns 100 rows but it actually returns 100,000, it will choose a nested loop join (good for small sets) instead of a hash join (good for large sets).

\`\`\`sql
-- See estimated vs actual rows
EXPLAIN ANALYZE SELECT * FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending';

-- Look for large discrepancies:
-- "rows=100" (estimated) vs "rows=50000" (actual) = bad statistics
\`\`\`

## Join Algorithms

The optimizer must choose HOW to join tables. Three fundamental algorithms:

### Nested Loop Join
\`\`\`
FOR each row in outer_table:
    FOR each matching row in inner_table:
        emit combined row

Cost: O(outer_rows × inner_rows) in worst case
Best when: outer table is small, inner table has an index on join key
\`\`\`

\`\`\`sql
-- This will use nested loop: orders is small, users has index on id
SELECT * FROM orders o JOIN users u ON o.user_id = u.id
WHERE o.id = 12345;  -- orders result set = 1 row
\`\`\`

### Hash Join
\`\`\`
Phase 1 (Build):   read smaller table → build hash table in memory
                   hash_table[join_key] = [rows...]
Phase 2 (Probe):   read larger table → probe hash table for matches

Cost: O(smaller_table + larger_table)
Best when: no usable index, both tables are large
Memory: hash table must fit in work_mem (PostgreSQL) or join_buffer_size (MySQL)
\`\`\`

\`\`\`sql
-- Control hash join memory in PostgreSQL
SET work_mem = '256MB';  -- per sort/hash operation, not per query
\`\`\`

### Merge Join (Sort-Merge Join)
\`\`\`
Phase 1: Sort both tables on join key (if not already sorted)
Phase 2: Merge sorted streams like merge sort

Cost: O(N log N) for sorting + O(N + M) for merge
Best when: both inputs are already sorted (index scans), or for large equijoins
\`\`\`

\`\`\`
Join algorithm selection summary:
  Small outer + indexed inner  → Nested Loop
  Large tables, no index       → Hash Join  
  Pre-sorted inputs            → Merge Join
  BETWEEN / range join         → Merge Join
\`\`\`

## Join Order Optimization

For N tables, there are N! possible join orders. With 10 tables: 3,628,800 possible plans. Optimizers use heuristics and dynamic programming to avoid evaluating all of them.

**PostgreSQL's approach:**
- Up to \`join_collapse_limit\` tables (default 8): use dynamic programming to find optimal order
- Above that: use genetic algorithm (GEQO) for approximate solution

\`\`\`sql
-- Force a specific join order (disable optimizer reordering)
SET join_collapse_limit = 1;  -- use query's written order exactly

-- See what join order the optimizer chose
EXPLAIN SELECT ...;
-- The order of nodes in the plan = join order
\`\`\`

**The fundamental principle:** join the smallest result sets first. Filter early, join later.

\`\`\`sql
-- Bad: joins millions of rows then filters
SELECT * FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE p.category = 'electronics';

-- Good: filter products first (small result), then join
SELECT * FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE p.category = 'electronics';
-- (The optimizer usually figures this out, but not always with complex queries)
\`\`\`

## Common Table Expressions and Subquery Optimization

### Subquery Flattening
The optimizer tries to convert subqueries into joins, which are easier to optimize:

\`\`\`sql
-- Original subquery:
SELECT * FROM orders WHERE user_id IN (
  SELECT id FROM users WHERE country = 'FR'
);

-- Optimizer rewrites to (internally):
SELECT o.* FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.country = 'FR';
-- Now the join optimizer can pick the best algorithm and order
\`\`\`

### CTEs — Optimization Fence (PostgreSQL < 12)
In PostgreSQL before version 12, CTEs were **optimization fences** — the optimizer could not push predicates inside them or inline them:

\`\`\`sql
-- PostgreSQL < 12: CTE is materialized separately (always)
WITH french_users AS (
  SELECT id FROM users WHERE country = 'FR'
)
SELECT * FROM orders WHERE user_id IN (SELECT id FROM french_users);
-- french_users is computed fully first, stored in memory, then joined

-- PostgreSQL 12+: CTE is inlined by default (if referenced once, no side effects)
-- Can force old behavior:
WITH french_users AS MATERIALIZED (
  SELECT id FROM users WHERE country = 'FR'
)
\`\`\`

## Predicate Pushdown

The optimizer moves filter conditions as close to the data source as possible — minimizing rows processed at every step.

\`\`\`sql
-- Written as:
SELECT * FROM (
  SELECT o.*, u.country FROM orders o JOIN users u ON o.user_id = u.id
) sub
WHERE country = 'FR';

-- Optimizer pushes WHERE into the join:
SELECT o.*, u.country FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.country = 'FR';  -- filter applied BEFORE join, fewer rows to join
\`\`\`

## Reading EXPLAIN Output

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name;
\`\`\`

\`\`\`
HashAggregate  (cost=1842.50..1867.50 rows=2500 width=40)
               (actual time=45.2..46.1 rows=2500 loops=1)
  Buffers: shared hit=842 read=231
  ->  Hash Left Join  (cost=625.00..1780.00 rows=12500 width=36)
                      (actual time=12.3..38.7 rows=12500 loops=1)
        Hash Cond: (o.user_id = u.id)
        Buffers: shared hit=842 read=231
        ->  Seq Scan on orders o  (cost=0..450.00 rows=25000 width=8)
                                  (actual time=0.1..8.2 rows=25000 loops=1)
              Buffers: shared read=231
        ->  Hash  (cost=593.75..593.75 rows=2500 width=36)
                  (actual time=12.1..12.1 rows=2500 loops=1)
              ->  Seq Scan on users u  (cost=0..593.75 rows=2500 width=36)
                                       (actual time=0.1..9.8 rows=2500 loops=1)
                    Filter: (created_at > '2024-01-01')
                    Rows Removed by Filter: 7500
\`\`\`

**How to read it:**
- Plans execute **inside-out, bottom-up** — innermost node runs first
- \`cost=X..Y\`: X = startup cost (before first row), Y = total cost
- \`rows=N\`: estimated rows. Compare to \`actual...rows=M\`
- \`loops=N\`: node executed N times (nested loop inner side)
- \`Buffers: shared hit=N read=M\`: N pages from cache, M from disk
- \`Rows Removed by Filter\`: how many rows were filtered out

**Red flags:**
\`\`\`
estimated rows=100  vs  actual rows=50000  → bad statistics, run ANALYZE
loops=10000 with Seq Scan                  → missing index on join key
shared read >> shared hit                  → working set exceeds shared_buffers
Hash Batches=8 (original=1)                → hash spilled to disk, increase work_mem
\`\`\`
`,

  fr: `# Optimisation des requêtes

## Le rôle de l'optimiseur de requêtes

L'optimiseur prend une instruction SQL et trouve le **plan d'exécution le moins coûteux**. "Le moins coûteux" signifie minimiser les I/O, le CPU et la mémoire.

\`\`\`
Requête SQL (déclarative — CE que vous voulez)
        ↓
   Parser → Arbre d'analyse
        ↓
   Réécriture → Forme canonique
        ↓
   Optimiseur → Énumère les plans → Estime les coûts → Choisit le moins cher
        ↓
   Exécuteur → Exécute le plan
        ↓
   Résultats
\`\`\`

## Optimisation basée sur les coûts

Les optimiseurs modernes sont **basés sur les coûts**. Chaque opération a un coût estimé combinant :

- **Coût I/O** — nombre de lectures de pages (séquentiel vs aléatoire)
- **Coût CPU** — nombre de comparaisons de tuples
- **Coût mémoire** — taille de la table de hachage, utilisation du buffer de tri

\`\`\`sql
-- Modèle de coût PostgreSQL :
-- seq_page_cost      = 1.0   (lecture séquentielle)
-- random_page_cost   = 4.0   (lecture aléatoire, 4x plus cher)
-- cpu_tuple_cost     = 0.01  (traiter une ligne)
\`\`\`

C'est pourquoi l'optimiseur choisit parfois un scan séquentiel plutôt qu'un index — si vous retournez plus de 30% des lignes, l'I/O aléatoire des lookups d'index coûte plus cher que lire toute la table séquentiellement.

## Statistiques et estimation de cardinalité

Les estimations de l'optimiseur dépendent de ses **statistiques**. PostgreSQL les stocke dans \`pg_statistic\` :

\`\`\`sql
SELECT attname, n_distinct, correlation, most_common_vals, most_common_freqs
FROM pg_stats
WHERE tablename = 'orders';
\`\`\`

- **\`n_distinct\`** — nombre estimé de valeurs distinctes
- **\`correlation\`** — corrélation entre l'ordre physique et l'ordre logique. \`1.0\` = parfaitement trié → index scan cheap
- **\`most_common_vals\`** — tableau des valeurs les plus fréquentes

Les **erreurs d'estimation de cardinalité** sont la cause n°1 des mauvais plans de requête.

\`\`\`sql
-- Voir les lignes estimées vs réelles
EXPLAIN ANALYZE SELECT * FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending';
-- Chercher les grandes divergences : rows=100 (estimé) vs rows=50000 (réel)
\`\`\`

## Algorithmes de jointure

### Nested Loop Join
\`\`\`
POUR chaque ligne dans table_externe :
    POUR chaque ligne correspondante dans table_interne :
        émettre la ligne combinée

Coût : O(lignes_externes × lignes_internes) au pire cas
Optimal quand : table externe petite, table interne a un index sur la clé de jointure
\`\`\`

### Hash Join
\`\`\`
Phase 1 (Construction) : lire la plus petite table → construire table de hachage
Phase 2 (Sondage) :      lire la plus grande table → sonder la table de hachage

Coût : O(petite_table + grande_table)
Optimal quand : pas d'index utilisable, les deux tables sont grandes
\`\`\`

### Merge Join
\`\`\`
Phase 1 : Trier les deux tables sur la clé de jointure
Phase 2 : Fusionner les flux triés

Optimal quand : les deux entrées sont déjà triées (scans d'index)
\`\`\`

## Ordre de jointure

Pour N tables, il y a N! ordres de jointure possibles. Avec 10 tables : 3 628 800 plans possibles.

**Principe fondamental :** joindre d'abord les plus petits ensembles de résultats. Filtrer tôt, joindre tard.

## CTEs — Barrière d'optimisation

Dans PostgreSQL avant la version 12, les CTEs étaient des **barrières d'optimisation** :

\`\`\`sql
-- PostgreSQL < 12 : le CTE est matérialisé séparément (toujours)
WITH french_users AS (
  SELECT id FROM users WHERE country = 'FR'
)
SELECT * FROM orders WHERE user_id IN (SELECT id FROM french_users);

-- PostgreSQL 12+ : le CTE est intégré par défaut
-- Forcer l'ancien comportement :
WITH french_users AS MATERIALIZED (
  SELECT id FROM users WHERE country = 'FR'
)
\`\`\`

## Pushdown de prédicats

L'optimiseur déplace les conditions de filtre aussi près que possible de la source de données.

\`\`\`sql
-- Écrit comme :
SELECT * FROM (
  SELECT o.*, u.country FROM orders o JOIN users u ON o.user_id = u.id
) sub
WHERE country = 'FR';

-- L'optimiseur pousse le WHERE dans la jointure :
SELECT o.*, u.country FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.country = 'FR';  -- filtre appliqué AVANT la jointure
\`\`\`

## Lire la sortie EXPLAIN

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;
\`\`\`

**Comment lire :**
- Les plans s'exécutent **de l'intérieur vers l'extérieur, de bas en haut**
- \`cost=X..Y\` : X = coût de démarrage, Y = coût total
- \`rows=N\` : lignes estimées. Comparer avec \`actual...rows=M\`
- \`Buffers: shared hit=N read=M\` : N pages du cache, M depuis le disque

**Signaux d'alarme :**
\`\`\`
rows=100 estimé vs rows=50000 réel    → mauvaises statistiques, lancer ANALYZE
loops=10000 avec Seq Scan             → index manquant sur clé de jointure
shared read >> shared hit             → ensemble de travail dépasse shared_buffers
Hash Batches=8 (original=1)           → hash déversé sur disque, augmenter work_mem
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "Why might the optimizer choose a sequential scan over an index scan even when an index exists?",
      options: [
        "The index is corrupt and needs to be rebuilt",
        "If the query returns a large percentage of rows, random I/O from index lookups costs more than reading the whole table sequentially",
        "Sequential scans always have lower CPU cost than index scans",
        "The optimizer only uses indexes when explicitly hinted with USE INDEX",
      ],
      correct: 1,
    },
    {
      question: "What is the #1 cause of bad query execution plans?",
      options: [
        "Missing indexes on foreign key columns",
        "Cardinality estimation errors caused by stale or insufficient statistics",
        "Using CTEs instead of subqueries",
        "Tables with more than 10 million rows",
      ],
      correct: 1,
    },
    {
      question: "When is a Hash Join preferred over a Nested Loop Join?",
      options: [
        "When the inner table has an index on the join key",
        "When both tables are small enough to fit in L1 cache",
        "When there is no usable index and both tables are large",
        "When the join condition uses inequality operators (< or >)",
      ],
      correct: 2,
    },
    {
      question: "What changed about CTEs in PostgreSQL 12?",
      options: [
        "CTEs were removed in favor of subqueries",
        "CTEs became optimization fences by default",
        "CTEs are now inlined by default instead of always being materialized as optimization fences",
        "CTEs gained support for recursive queries",
      ],
      correct: 2,
    },
    {
      question:
        "In EXPLAIN ANALYZE output, what does 'Hash Batches=8 (original=1)' indicate?",
      options: [
        "The hash join used 8 CPU cores for parallel execution",
        "The hash table spilled to disk because it exceeded work_mem — increase work_mem to fix",
        "The query was retried 8 times due to lock conflicts",
        "8 partitions were used for partition pruning",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi l'optimiseur pourrait-il choisir un scan séquentiel plutôt qu'un scan d'index même quand un index existe ?",
      options: [
        "L'index est corrompu et doit être reconstruit",
        "Si la requête retourne un grand pourcentage de lignes, l'I/O aléatoire des lookups d'index coûte plus cher que lire toute la table séquentiellement",
        "Les scans séquentiels ont toujours un coût CPU inférieur aux scans d'index",
        "L'optimiseur n'utilise les index que lorsqu'on lui donne un hint USE INDEX",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle est la cause n°1 des mauvais plans d'exécution de requêtes ?",
      options: [
        "Index manquants sur les colonnes de clé étrangère",
        "Erreurs d'estimation de cardinalité causées par des statistiques obsolètes ou insuffisantes",
        "Utilisation de CTEs au lieu de sous-requêtes",
        "Tables avec plus de 10 millions de lignes",
      ],
      correct: 1,
    },
    {
      question: "Quand préfère-t-on un Hash Join à un Nested Loop Join ?",
      options: [
        "Quand la table interne a un index sur la clé de jointure",
        "Quand les deux tables sont assez petites pour tenir dans le cache L1",
        "Quand il n'y a pas d'index utilisable et que les deux tables sont grandes",
        "Quand la condition de jointure utilise des opérateurs d'inégalité",
      ],
      correct: 2,
    },
    {
      question:
        "Qu'est-ce qui a changé concernant les CTEs dans PostgreSQL 12 ?",
      options: [
        "Les CTEs ont été supprimés en faveur des sous-requêtes",
        "Les CTEs sont devenus des barrières d'optimisation par défaut",
        "Les CTEs sont maintenant intégrés par défaut au lieu d'être toujours matérialisés comme barrières d'optimisation",
        "Les CTEs ont gagné le support des requêtes récursives",
      ],
      correct: 2,
    },
    {
      question:
        "Dans la sortie EXPLAIN ANALYZE, que signifie 'Hash Batches=8 (original=1)' ?",
      options: [
        "La jointure hash a utilisé 8 cœurs CPU pour l'exécution parallèle",
        "La table de hachage a débordé sur le disque car elle dépassait work_mem — augmenter work_mem pour corriger",
        "La requête a été réessayée 8 fois en raison de conflits de verrous",
        "8 partitions ont été utilisées pour l'élagage de partition",
      ],
      correct: 1,
    },
  ],
};
