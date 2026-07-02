export const content = {
  en: `# Performance Tuning

## The Performance Tuning Mindset

Performance tuning is not guesswork. It follows a strict methodology:

\`\`\`
1. MEASURE    — identify what is actually slow (don't assume)
2. PROFILE    — find the root cause (query? index? memory? I/O? lock?)
3. HYPOTHESIZE — form a specific theory about the fix
4. CHANGE     — make one change at a time
5. MEASURE    — verify the change improved things
6. REPEAT

Skipping step 1 and 2 is the most common mistake.
"The query feels slow" is not a measurement.
\`\`\`

## Finding Slow Queries

### PostgreSQL: pg_stat_statements

The single most valuable extension for query performance analysis.

\`\`\`sql
-- Enable (add to postgresql.conf, requires restart)
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all

-- Install
CREATE EXTENSION pg_stat_statements;

-- Top 10 queries by total time
SELECT 
  round(total_exec_time::numeric, 2) AS total_ms,
  calls,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  round(stddev_exec_time::numeric, 2) AS stddev_ms,
  round((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) AS pct,
  left(query, 80) AS query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Queries with high variance (inconsistent performance)
SELECT 
  left(query, 80),
  calls,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  round(stddev_exec_time::numeric, 2) AS stddev_ms,
  round((stddev_exec_time / mean_exec_time * 100)::numeric, 2) AS cv_pct
FROM pg_stat_statements
WHERE calls > 100 AND mean_exec_time > 10
ORDER BY cv_pct DESC
LIMIT 10;

-- Reset stats
SELECT pg_stat_statements_reset();
\`\`\`

### PostgreSQL: auto_explain

Automatically logs execution plans for slow queries:

\`\`\`sql
-- postgresql.conf
shared_preload_libraries = 'auto_explain'
auto_explain.log_min_duration = 1000  -- log plans for queries > 1 second
auto_explain.log_analyze = true        -- include actual row counts
auto_explain.log_buffers = true        -- include buffer usage
auto_explain.log_nested_statements = true  -- include queries inside functions
\`\`\`

### MySQL: slow_query_log

\`\`\`sql
-- Enable slow query log
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;         -- queries > 1 second
SET GLOBAL log_queries_not_using_indexes = ON;

-- Check where log is written
SHOW VARIABLES LIKE 'slow_query_log_file';

-- Analyze with pt-query-digest (Percona toolkit)
-- pt-query-digest /var/log/mysql/slow.log
\`\`\`

## Index Optimization

### Finding Missing Indexes

\`\`\`sql
-- PostgreSQL: tables with high sequential scan rate
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / nullif(seq_scan, 0) AS avg_seq_read,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;

-- A table with high seq_scan and large size and many rows per scan
-- is a candidate for a new index

-- PostgreSQL: unused indexes (wasting space and write overhead)
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan AS scans
FROM pg_stat_user_indexes
JOIN pg_index USING (indexrelid)
WHERE idx_scan = 0
  AND NOT indisprimary
  AND NOT indisunique
ORDER BY pg_relation_size(indexrelid) DESC;
\`\`\`

### Index Bloat

B-tree indexes accumulate dead entries from deleted and updated rows. Unlike VACUUM which handles table bloat, indexes need \`REINDEX\` or \`VACUUM (INDEX_CLEANUP)\`:

\`\`\`sql
-- Estimate index bloat (requires pgstattuple extension)
CREATE EXTENSION pgstattuple;

SELECT * FROM pgstatindex('idx_orders_user_id');
-- leaf_fragmentation: percentage of leaf pages with dead tuples
-- If leaf_fragmentation > 30%, consider reindexing

-- Rebuild without locking (PG 12+)
REINDEX INDEX CONCURRENTLY idx_orders_user_id;

-- Rebuild all indexes on a table without locking
REINDEX TABLE CONCURRENTLY orders;
\`\`\`

### Partial Indexes

Index only the rows you actually query. Massively reduces index size and maintenance overhead:

\`\`\`sql
-- Bad: index on all orders
CREATE INDEX idx_orders_status ON orders(status);
-- Indexes 10M rows when you only ever query pending orders (50K rows)

-- Good: partial index
CREATE INDEX idx_orders_pending ON orders(created_at) 
WHERE status = 'pending';
-- Indexes only 50K rows — 200x smaller, much faster

-- Query MUST match the partial index predicate to use it:
SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at;
-- ✓ Uses partial index

SELECT * FROM orders WHERE status = 'completed' ORDER BY created_at;
-- ✗ Does NOT use partial index (wrong status)
\`\`\`

### Expression Indexes

\`\`\`sql
-- Bad: function on column prevents index use
SELECT * FROM users WHERE lower(email) = 'alice@example.com';
-- Seq scan even if index exists on email

-- Good: expression index
CREATE INDEX idx_users_email_lower ON users(lower(email));
SELECT * FROM users WHERE lower(email) = 'alice@example.com';
-- Now uses index!

-- Useful for case-insensitive search, date truncation, JSON extraction:
CREATE INDEX idx_events_date ON events(DATE(created_at));
CREATE INDEX idx_docs_title ON documents((data->>'title'));
\`\`\`

## Memory Configuration

### PostgreSQL Memory Parameters

\`\`\`
shared_buffers       — PostgreSQL's page cache
                       Rule: 25% of RAM
                       128MB default is almost always wrong for production

work_mem             — memory per sort/hash operation (NOT per query!)
                       A query can use work_mem many times (one per sort, one per hash)
                       With 100 connections each running complex queries:
                       100 connections × 10 operations × work_mem = total memory used
                       Rule: start at 4MB, increase for slow sorts/hashes
                       NEVER set globally above 64MB without careful calculation

maintenance_work_mem — memory for VACUUM, CREATE INDEX, ALTER TABLE
                       Rule: 256MB to 1GB (these run rarely, memory is fine)

effective_cache_size — planner's estimate of OS cache available
                       Does NOT allocate memory — just tells planner what to expect
                       Rule: 50-75% of RAM (shared_buffers + OS cache)

wal_buffers          — WAL buffer size before flush
                       Rule: 16MB is almost always sufficient
                       Auto-tuned to 1/32 of shared_buffers (max 16MB) if set to -1
\`\`\`

\`\`\`sql
-- Check if sorts are spilling to disk
SELECT query, sort_spills 
FROM pg_stat_statements 
WHERE sort_spills > 0
ORDER BY sort_spills DESC;

-- If sorts spill: increase work_mem for that session
SET work_mem = '64MB';
EXPLAIN ANALYZE SELECT ...;  -- rerun and check plan
\`\`\`

### MySQL InnoDB Memory

\`\`\`
innodb_buffer_pool_size    — most important setting
                             Rule: 70-80% of dedicated DB server RAM
                             128MB default is useless for production
                             Can be changed online in MySQL 5.7+:
                             SET GLOBAL innodb_buffer_pool_size = 8*1024*1024*1024;

innodb_log_file_size       — redo log size
                             Too small: checkpoint storms, write stalls
                             Rule: 1-4GB for write-heavy workloads
                             (requires restart to change)

innodb_flush_log_at_trx_commit
  = 1: flush on every commit (safest, slowest) — use for financial data
  = 2: write to OS buffer on commit, flush every second (fast, slight risk)
  = 0: write+flush every second (fastest, most data loss risk on crash)

innodb_flush_method = O_DIRECT  — bypass OS cache for data files
                                   (avoids double-caching with buffer pool)
\`\`\`

## VACUUM and Table Maintenance

### Understanding VACUUM

\`\`\`sql
-- Manual VACUUM (does not lock table)
VACUUM orders;

-- VACUUM FULL (locks table, reclaims disk space, not for production during peak hours)
VACUUM FULL orders;

-- VACUUM ANALYZE (vacuum + update statistics)
VACUUM ANALYZE orders;

-- See last vacuum time and dead tuple count
SELECT 
  relname,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze,
  n_dead_tup,
  n_live_tup,
  round(n_dead_tup::numeric / nullif(n_live_tup + n_dead_tup, 0) * 100, 2) AS dead_pct
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
\`\`\`

### Autovacuum Tuning

The default autovacuum settings are conservative — designed for small databases. Large tables need aggressive tuning:

\`\`\`sql
-- Table-level autovacuum settings (overrides global settings)
ALTER TABLE orders SET (
  autovacuum_vacuum_scale_factor = 0.01,    -- vacuum when 1% rows are dead (default 20%)
  autovacuum_vacuum_threshold = 100,         -- minimum 100 dead rows
  autovacuum_analyze_scale_factor = 0.005,  -- analyze when 0.5% rows change
  autovacuum_vacuum_cost_delay = 2           -- faster vacuum (default 20ms)
);

-- For very large tables (100M+ rows), scale factor is useless:
-- 20% of 100M = 20M dead rows before vacuum triggers!
ALTER TABLE large_events SET (
  autovacuum_vacuum_scale_factor = 0,
  autovacuum_vacuum_threshold = 100000  -- trigger after 100K dead rows
);
\`\`\`

### Monitoring Autovacuum

\`\`\`sql
-- See currently running autovacuum workers
SELECT pid, query, now() - query_start AS duration
FROM pg_stat_activity
WHERE query LIKE 'autovacuum:%';

-- Check if autovacuum is keeping up
SELECT 
  relname,
  n_dead_tup,
  last_autovacuum,
  now() - last_autovacuum AS time_since_vacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 10000
ORDER BY n_dead_tup DESC;

-- Track bloat over time in pg_stat_user_tables
-- Alert if n_dead_tup / n_live_tup > 0.1 (10% dead)
\`\`\`

## Connection Pooling

### PgBouncer Configuration

\`\`\`ini
[databases]
mydb = host=127.0.0.1 port=5432 dbname=mydb

[pgbouncer]
pool_mode = transaction          ; transaction pooling (most efficient)
max_client_conn = 1000           ; max connections from applications
default_pool_size = 20           ; server connections per database/user pair
min_pool_size = 5                ; keep at least 5 server connections open
reserve_pool_size = 5            ; extra connections for spikes
reserve_pool_timeout = 5         ; seconds before using reserve pool
server_idle_timeout = 600        ; close idle server connections after 10 min
client_idle_timeout = 0          ; never close idle client connections
\`\`\`

\`\`\`sql
-- Monitor PgBouncer (connect to pgbouncer database)
SHOW POOLS;    -- see pool utilization
SHOW STATS;    -- requests/sec, avg latency
SHOW CLIENTS;  -- connected clients
SHOW SERVERS;  -- server connections

-- Key metrics to watch:
-- cl_waiting: clients waiting for a connection (should be 0 normally)
-- sv_idle: idle server connections (pool headroom)
-- avg_wait_time: average client wait time (should be < 1ms)
\`\`\`

### Transaction Pooling Incompatibilities

\`\`\`sql
-- These DO NOT work with PgBouncer transaction pooling:
SET search_path = myschema;    -- session state lost between transactions
PREPARE stmt AS SELECT ...;   -- prepared statements lost
LISTEN/NOTIFY                  -- requires persistent connection
Advisory locks                 -- session-level locks lost
\`\`\`

## Query Rewriting

### The N+1 Problem

\`\`\`sql
-- Bad: N+1 queries (1 query to get orders + N queries to get each user)
SELECT * FROM orders LIMIT 100;
-- For each order:
SELECT * FROM users WHERE id = ?;  -- executes 100 times!

-- Good: single JOIN
SELECT o.*, u.name, u.email
FROM orders o
JOIN users u ON o.user_id = u.id
LIMIT 100;

-- Or: single IN query
SELECT * FROM users WHERE id IN (
  SELECT DISTINCT user_id FROM orders LIMIT 100
);
\`\`\`

### Aggregation Push-Down

\`\`\`sql
-- Bad: join first, then aggregate (large intermediate result)
SELECT u.country, COUNT(*) 
FROM orders o
JOIN users u ON o.user_id = u.id
GROUP BY u.country;

-- Good: aggregate first, then join (much smaller intermediate result)
SELECT u.country, o.order_count
FROM (
  SELECT user_id, COUNT(*) AS order_count
  FROM orders
  GROUP BY user_id
) o
JOIN users u ON o.user_id = u.id
-- (optimizer usually does this automatically, but not always for complex queries)
\`\`\`

### Batch Operations

\`\`\`sql
-- Bad: one INSERT per row
INSERT INTO events (type, data) VALUES ('click', '{}');
INSERT INTO events (type, data) VALUES ('view', '{}');
-- ... 1000 more

-- Good: bulk INSERT
INSERT INTO events (type, data) VALUES
  ('click', '{}'),
  ('view', '{}'),
  -- ... up to 1000 rows per statement
  ('purchase', '{}');

-- Good: COPY for massive loads
COPY events (type, data) FROM STDIN WITH (FORMAT csv);

-- Bad: UPDATE in a loop
UPDATE orders SET status = 'archived' WHERE id = 1;
UPDATE orders SET status = 'archived' WHERE id = 2;
-- ... 10000 more

-- Good: single UPDATE with IN or condition
UPDATE orders SET status = 'archived' 
WHERE created_at < now() - interval '1 year'
  AND status = 'completed';
\`\`\`

## Partitioning

Table partitioning splits a large table into smaller physical pieces, enabling **partition pruning** — the optimizer only scans partitions that contain relevant data.

\`\`\`sql
-- Range partitioning by date (PostgreSQL declarative partitioning)
CREATE TABLE events (
  id         BIGSERIAL,
  created_at TIMESTAMPTZ NOT NULL,
  type       TEXT,
  data       JSONB
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2023 PARTITION OF events
  FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE events_2024 PARTITION OF events
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE events_2025 PARTITION OF events
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Query with partition pruning:
SELECT * FROM events WHERE created_at >= '2024-06-01';
-- Only scans events_2024 — events_2023 and events_2025 are skipped

EXPLAIN SELECT * FROM events WHERE created_at >= '2024-06-01';
-- Shows: "Partitions selected: events_2024"
\`\`\`

\`\`\`sql
-- Hash partitioning for even distribution:
CREATE TABLE users (id BIGSERIAL, ...) PARTITION BY HASH (id);
CREATE TABLE users_0 PARTITION OF users FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE users_1 PARTITION OF users FOR VALUES WITH (modulus 4, remainder 1);
CREATE TABLE users_2 PARTITION OF users FOR VALUES WITH (modulus 4, remainder 2);
CREATE TABLE users_3 PARTITION OF users FOR VALUES WITH (modulus 4, remainder 3);
\`\`\`

**When to partition:**
- Table is very large (50GB+ is a common threshold) AND
- Queries almost always filter on the partition key AND
- You want to drop old data quickly (\`DROP TABLE events_2022\` vs \`DELETE FROM events WHERE year=2022\`)
`,

  fr: `# Optimisation des performances

## La méthodologie d'optimisation des performances

\`\`\`
1. MESURER      — identifier ce qui est réellement lent (ne pas supposer)
2. PROFILER     — trouver la cause racine (requête ? index ? mémoire ? I/O ? verrou ?)
3. HYPOTHÉSER   — formuler une théorie spécifique sur le correctif
4. CHANGER      — faire un seul changement à la fois
5. MESURER      — vérifier que le changement a amélioré les choses
6. RÉPÉTER
\`\`\`

## Trouver les requêtes lentes

### PostgreSQL : pg_stat_statements

\`\`\`sql
-- Top 10 requêtes par temps total
SELECT 
  round(total_exec_time::numeric, 2) AS total_ms,
  calls,
  round(mean_exec_time::numeric, 2) AS mean_ms,
  round((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) AS pct,
  left(query, 80) AS requête
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
\`\`\`

## Optimisation des index

### Trouver les index manquants

\`\`\`sql
-- Tables avec un taux de scan séquentiel élevé
SELECT 
  tablename,
  seq_scan,
  idx_scan,
  pg_size_pretty(pg_total_relation_size(relid)) AS taille_totale
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;

-- Index inutilisés (gaspillant de l'espace)
SELECT 
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS taille_index,
  idx_scan AS scans
FROM pg_stat_user_indexes
JOIN pg_index USING (indexrelid)
WHERE idx_scan = 0
  AND NOT indisprimary
  AND NOT indisunique
ORDER BY pg_relation_size(indexrelid) DESC;
\`\`\`

### Index partiels

\`\`\`sql
-- Mauvais : index sur toutes les commandes
CREATE INDEX idx_orders_status ON orders(status);

-- Bon : index partiel
CREATE INDEX idx_orders_pending ON orders(created_at) 
WHERE status = 'pending';
-- 200x plus petit, beaucoup plus rapide
\`\`\`

## Configuration mémoire

### Paramètres mémoire PostgreSQL

\`\`\`
shared_buffers       — cache de pages de PostgreSQL
                       Règle : 25% de la RAM

work_mem             — mémoire par opération de tri/hash (PAS par requête !)
                       Règle : commencer à 4 Mo, augmenter pour les tris/hashs lents

maintenance_work_mem — mémoire pour VACUUM, CREATE INDEX
                       Règle : 256 Mo à 1 Go

effective_cache_size — estimation du planificateur du cache OS disponible
                       Règle : 50-75% de la RAM
\`\`\`

### Mémoire InnoDB MySQL

\`\`\`
innodb_buffer_pool_size    — paramètre le plus important
                             Règle : 70-80% de la RAM du serveur dédié DB

innodb_log_file_size       — taille du redo log
                             Règle : 1-4 Go pour les charges intensives en écriture

innodb_flush_log_at_trx_commit
  = 1 : flush à chaque commit (le plus sûr, le plus lent)
  = 2 : écriture buffer OS au commit, flush chaque seconde
  = 0 : écriture+flush chaque seconde (le plus rapide, risque de perte)
\`\`\`

## VACUUM et maintenance des tables

\`\`\`sql
-- Voir les derniers temps de vacuum et le nombre de tuples morts
SELECT 
  relname,
  last_autovacuum,
  n_dead_tup,
  n_live_tup,
  round(n_dead_tup::numeric / nullif(n_live_tup + n_dead_tup, 0) * 100, 2) AS pct_morts
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- Paramètres autovacuum au niveau table pour les grandes tables
ALTER TABLE orders SET (
  autovacuum_vacuum_scale_factor = 0.01,
  autovacuum_vacuum_threshold = 100
);
\`\`\`

## Pool de connexions PgBouncer

\`\`\`ini
[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
\`\`\`

**Incompatibilités avec le pooling de transactions :**
\`\`\`sql
SET search_path = myschema;   -- état de session perdu entre transactions
PREPARE stmt AS SELECT ...;  -- prepared statements perdus
LISTEN/NOTIFY                 -- nécessite une connexion persistante
\`\`\`

## Réécriture de requêtes

### Le problème N+1

\`\`\`sql
-- Mauvais : 1 requête pour les commandes + N requêtes pour chaque utilisateur
SELECT * FROM orders LIMIT 100;
-- Pour chaque commande : SELECT * FROM users WHERE id = ?;  -- 100 fois !

-- Bon : une seule JOIN
SELECT o.*, u.name, u.email
FROM orders o
JOIN users u ON o.user_id = u.id
LIMIT 100;
\`\`\`

## Partitionnement

\`\`\`sql
-- Partitionnement par plage de dates
CREATE TABLE events (
  id         BIGSERIAL,
  created_at TIMESTAMPTZ NOT NULL,
  type       TEXT
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2024 PARTITION OF events
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Élagage de partition : seule events_2024 est scannée
SELECT * FROM events WHERE created_at >= '2024-06-01';
\`\`\`

**Quand partitionner :**
- Table très grande (50 Go+ est un seuil courant) ET
- Les requêtes filtrent presque toujours sur la clé de partition ET
- Vous voulez supprimer rapidement les vieilles données (\`DROP TABLE events_2022\`)
`,
};

export const quiz = {
  en: [
    {
      question:
        "Why should you never set work_mem to a high value globally in PostgreSQL?",
      options: [
        "work_mem is a read-only parameter that cannot be changed globally",
        "work_mem is allocated per sort/hash operation, not per query or connection — with 100 connections running complex queries each using multiple operations, total memory usage can be connections × operations × work_mem",
        "High work_mem causes PostgreSQL to skip index scans in favor of sequential scans",
        "work_mem only affects autovacuum workers, not regular queries",
      ],
      correct: 1,
    },
    {
      question:
        "What is the danger of setting autovacuum_vacuum_scale_factor = 0.2 (20%) on a 100 million row table?",
      options: [
        "Autovacuum will run too frequently and impact query performance",
        "The scale factor of 20% means autovacuum only triggers after 20 million dead rows accumulate — massive bloat before cleanup",
        "20% scale factor disables autovacuum entirely on large tables",
        "The scale factor causes autovacuum to delete live rows",
      ],
      correct: 1,
    },
    {
      question:
        "What makes a partial index more efficient than a full index for queries that only access a subset of rows?",
      options: [
        "Partial indexes use a hash structure instead of B-tree",
        "Partial indexes are stored in memory while full indexes are on disk",
        "A partial index only indexes rows matching its WHERE predicate — dramatically smaller, faster to scan, less write overhead",
        "Partial indexes skip the WAL write, making inserts faster",
      ],
      correct: 2,
    },
    {
      question:
        "Which PgBouncer pool mode is most efficient for connection pooling, and what does it break?",
      options: [
        "Session pooling is most efficient; it breaks prepared statements",
        "Statement pooling is most efficient; it breaks multi-statement transactions",
        "Transaction pooling is most efficient; it breaks session-level state like SET, PREPARE, LISTEN/NOTIFY, and advisory locks",
        "Connection pooling is most efficient; it breaks nested transactions",
      ],
      correct: 2,
    },
    {
      question:
        "When does table partitioning HURT performance instead of helping it?",
      options: [
        "When the table has more than 1000 partitions",
        "When queries do not filter on the partition key — the planner must scan all partitions, adding overhead compared to a single unpartitioned table with an index",
        "When the table uses a composite primary key",
        "When the database server has less than 32GB of RAM",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi ne devriez-vous jamais définir work_mem à une valeur élevée globalement dans PostgreSQL ?",
      options: [
        "work_mem est un paramètre en lecture seule qui ne peut pas être changé globalement",
        "work_mem est alloué par opération de tri/hash, pas par requête ou connexion — avec 100 connexions exécutant des requêtes complexes utilisant chacune plusieurs opérations, l'utilisation mémoire totale peut être connexions × opérations × work_mem",
        "Un work_mem élevé fait sauter à PostgreSQL les scans d'index en faveur des scans séquentiels",
        "work_mem n'affecte que les workers autovacuum, pas les requêtes régulières",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est le danger de définir autovacuum_vacuum_scale_factor = 0.2 (20%) sur une table de 100 millions de lignes ?",
      options: [
        "Autovacuum s'exécutera trop fréquemment et impactera les performances des requêtes",
        "Le scale factor de 20% signifie qu'autovacuum ne se déclenche qu'après l'accumulation de 20 millions de tuples morts — gonflement massif avant nettoyage",
        "Le scale factor de 20% désactive complètement autovacuum sur les grandes tables",
        "Le scale factor fait supprimer des lignes vivantes par autovacuum",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce qui rend un index partiel plus efficace qu'un index complet pour les requêtes n'accédant qu'à un sous-ensemble de lignes ?",
      options: [
        "Les index partiels utilisent une structure hash plutôt que B-tree",
        "Les index partiels sont stockés en mémoire tandis que les index complets sont sur disque",
        "Un index partiel n'indexe que les lignes correspondant à son prédicat WHERE — beaucoup plus petit, plus rapide à scanner, moins de surcharge en écriture",
        "Les index partiels sautent l'écriture WAL, rendant les insertions plus rapides",
      ],
      correct: 2,
    },
    {
      question:
        "Quel mode de pool PgBouncer est le plus efficace, et qu'est-ce qu'il casse ?",
      options: [
        "Le pooling de session est le plus efficace ; il casse les prepared statements",
        "Le pooling de statements est le plus efficace ; il casse les transactions multi-instructions",
        "Le pooling de transactions est le plus efficace ; il casse l'état au niveau session comme SET, PREPARE, LISTEN/NOTIFY et les advisory locks",
        "Le pooling de connexions est le plus efficace ; il casse les transactions imbriquées",
      ],
      correct: 2,
    },
    {
      question:
        "Quand le partitionnement de table NUIT-il aux performances au lieu d'aider ?",
      options: [
        "Quand la table a plus de 1000 partitions",
        "Quand les requêtes ne filtrent pas sur la clé de partition — le planificateur doit scanner toutes les partitions, ajoutant une surcharge par rapport à une table non partitionnée avec un index",
        "Quand la table utilise une clé primaire composite",
        "Quand le serveur de base de données a moins de 32 Go de RAM",
      ],
      correct: 1,
    },
  ],
};
