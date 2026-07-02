export const content = {
  en: `# PostgreSQL Internals

## Process Architecture

PostgreSQL uses a **multi-process architecture** — not threads. Every client connection spawns a dedicated backend process. This is a deliberate design choice: process isolation means a crashing backend cannot corrupt shared memory of other connections.

\`\`\`
Client → Postmaster (PID 1)
              ↓ fork()
         Backend Process (one per connection)
              ↓
         Shared Memory (shared_buffers, WAL buffers, lock table)
\`\`\`

The **Postmaster** is the supervisor process. It listens on port 5432, accepts connections, and forks a new backend for each one. It also restarts crashed backends and manages auxiliary processes.

**Auxiliary processes:**
- \`checkpointer\` — flushes dirty pages to disk at checkpoint intervals
- \`background writer\` — proactively writes dirty buffers to reduce checkpoint pressure
- \`walwriter\` — flushes WAL buffers to disk
- \`autovacuum launcher\` — spawns autovacuum workers
- \`stats collector\` — collects table/index usage statistics

## Shared Buffers

\`shared_buffers\` is PostgreSQL's in-memory page cache. Every read/write goes through it. The default is 128MB — far too small for production. A common rule: set it to 25% of total RAM.

\`\`\`sql
SHOW shared_buffers;         -- current value
SELECT pg_size_pretty(setting::bigint * 8192, 'B')
FROM pg_settings WHERE name = 'shared_buffers';
\`\`\`

PostgreSQL uses a **clock-sweep** buffer replacement algorithm (not pure LRU). Each buffer has a usage count (0–5). On eviction, the clock hand sweeps buffers — if usage count > 0, it decrements it; if 0, that buffer is evicted. This prevents large sequential scans from thrashing the cache.

**Buffer states:**
\`\`\`
Invalid → Empty slot, available for use
Clean  → Page matches what's on disk
Dirty  → Page modified, not yet flushed to disk
Pinned → Currently being read/written, cannot be evicted
\`\`\`

## Page Layout

PostgreSQL stores data in **8KB pages** (configurable at compile time). Every table, index, and sequence is stored as a file of these pages.

\`\`\`
+-------------------+
| PageHeaderData    |  24 bytes — LSN, checksum, free space pointers
+-------------------+
| ItemId array      |  4 bytes per item — (offset, length, flags)
+-------------------+
| Free space        |  grows from both ends toward the middle
+-------------------+
| Tuple data        |  actual row data, stored from end of page
+-------------------+
| Special space     |  index-specific data (B-tree level, etc.)
+-------------------+
\`\`\`

A tuple (row) has a **HeapTupleHeader** (23 bytes) containing:
- \`t_xmin\` — transaction ID that inserted this row
- \`t_xmax\` — transaction ID that deleted this row (0 if alive)
- \`t_ctid\` — physical location (page, slot) — updated on UPDATE
- \`t_infomask\` — flags: visibility, nulls, has-varwidth columns

This header is the foundation of MVCC.

## MVCC — Multi-Version Concurrency Control

PostgreSQL never overwrites rows in place. Every UPDATE creates a **new tuple version** and marks the old one as dead (sets \`t_xmax\`). DELETE just sets \`t_xmax\` on the existing tuple.

\`\`\`
Transaction 100 INSERTs row:   xmin=100, xmax=0  (alive)
Transaction 200 UPDATEs row:   
  → old tuple: xmin=100, xmax=200  (dead to txn >= 200)
  → new tuple: xmin=200, xmax=0   (alive to txn >= 200)
\`\`\`

**Visibility rules** (simplified):
- A tuple is visible if \`xmin\` committed before your snapshot AND \`xmax\` is either 0 or an aborted transaction
- PostgreSQL checks \`pg_clog\` (now \`pg_xact\`) to know if a transaction committed or aborted

This means readers never block writers and writers never block readers — the core MVCC promise.

## Table Bloat and VACUUM

The downside of MVCC: dead tuples accumulate. A table that sees heavy UPDATE/DELETE traffic grows in size with dead tuples that are invisible to all transactions but still occupy disk space.

\`\`\`sql
-- See dead tuples
SELECT relname, n_live_tup, n_dead_tup, 
       round(n_dead_tup::numeric / nullif(n_live_tup + n_dead_tup, 0) * 100, 2) AS dead_pct
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
\`\`\`

**VACUUM** reclaims dead tuple space and makes it available for reuse. It does NOT shrink the file on disk (VACUUM FULL does, but it locks the table).

**AUTOVACUUM** runs automatically based on thresholds:
\`\`\`
autovacuum_vacuum_threshold = 50        -- minimum dead tuples
autovacuum_vacuum_scale_factor = 0.2    -- + 20% of table size
-- Trigger when: dead_tuples > 50 + (0.2 * table_rows)
\`\`\`

**Transaction ID Wraparound** — the most dangerous PostgreSQL failure mode. Transaction IDs are 32-bit integers (~4 billion values). If a table has a tuple with \`xmin\` that is 2 billion transactions old, it becomes invisible — the table appears empty. PostgreSQL will refuse to start new transactions if wraparound is imminent. VACUUM prevents this by freezing old tuples (setting \`xmin = FrozenTransactionId = 2\`).

\`\`\`sql
-- Check age of oldest unfrozen transaction
SELECT datname, age(datfrozenxid), datfrozenxid
FROM pg_database
ORDER BY age(datfrozenxid) DESC;
-- If age > 200 million, investigate urgently
\`\`\`

## The Write Path

When you execute \`INSERT INTO orders VALUES (...)\`:

1. Parser validates SQL, builds parse tree
2. Planner selects execution plan
3. Executor runs the plan
4. Tuple is written to a dirty page in \`shared_buffers\`
5. WAL record is written to WAL buffer (before the page is modified)
6. On COMMIT: WAL buffer is flushed to disk (\`fsync\` or \`fdatasync\`)
7. Checkpointer eventually flushes dirty pages to the table file

The WAL flush on commit (step 6) is what makes PostgreSQL durable. Even if the server crashes after commit but before the dirty page is written to disk, the WAL allows recovery.

## Connection Overhead

Each backend process costs ~5–10MB of RAM plus OS process overhead. At 200 connections you're using 1–2GB just for process overhead — before any query runs.

This is why **connection poolers** like PgBouncer exist:
\`\`\`
Applications (1000 connections)
        ↓
   PgBouncer (pool of 20 connections)
        ↓
   PostgreSQL (20 backend processes)
\`\`\`

PgBouncer operates in three modes:
- **Session pooling** — one server connection per client session (least efficient)
- **Transaction pooling** — server connection held only during a transaction (most common)
- **Statement pooling** — server connection held only during a single statement (breaks multi-statement transactions)
`,

  fr: `# Internals de PostgreSQL

## Architecture des processus

PostgreSQL utilise une **architecture multi-processus** — pas de threads. Chaque connexion client crée un processus backend dédié. C'est un choix délibéré : l'isolation des processus garantit qu'un backend qui plante ne peut pas corrompre la mémoire partagée des autres connexions.

\`\`\`
Client → Postmaster (PID 1)
              ↓ fork()
         Processus Backend (un par connexion)
              ↓
         Mémoire partagée (shared_buffers, WAL buffers, table de verrous)
\`\`\`

Le **Postmaster** est le processus superviseur. Il écoute sur le port 5432, accepte les connexions et fork un nouveau backend pour chacune. Il redémarre aussi les backends crashés et gère les processus auxiliaires.

**Processus auxiliaires :**
- \`checkpointer\` — vide les pages sales sur disque aux intervalles de checkpoint
- \`background writer\` — écrit proactivement les buffers sales pour réduire la pression sur les checkpoints
- \`walwriter\` — vide les buffers WAL sur disque
- \`autovacuum launcher\` — lance les workers autovacuum
- \`stats collector\` — collecte les statistiques d'utilisation des tables/index

## Shared Buffers

\`shared_buffers\` est le cache de pages en mémoire de PostgreSQL. Chaque lecture/écriture passe par lui. La valeur par défaut est 128 Mo — beaucoup trop faible pour la production. Une règle courante : le définir à 25% de la RAM totale.

\`\`\`sql
SHOW shared_buffers;
SELECT pg_size_pretty(setting::bigint * 8192, 'B')
FROM pg_settings WHERE name = 'shared_buffers';
\`\`\`

PostgreSQL utilise un algorithme de remplacement de buffer **clock-sweep** (pas un LRU pur). Chaque buffer a un compteur d'utilisation (0–5). Lors d'une éviction, l'aiguille de l'horloge parcourt les buffers — si le compteur > 0, il le décrémente ; si 0, ce buffer est évincé. Cela empêche les grands scans séquentiels de thrashing le cache.

## Layout des pages

PostgreSQL stocke les données en **pages de 8 Ko** (configurable à la compilation). Chaque table, index et séquence est stocké sous forme de fichier de ces pages.

\`\`\`
+-------------------+
| PageHeaderData    |  24 octets — LSN, checksum, pointeurs d'espace libre
+-------------------+
| Tableau ItemId    |  4 octets par item — (offset, longueur, flags)
+-------------------+
| Espace libre      |  croît des deux extrémités vers le milieu
+-------------------+
| Données de tuple  |  données réelles des lignes, stockées depuis la fin
+-------------------+
| Espace spécial    |  données spécifiques aux index (niveau B-tree, etc.)
+-------------------+
\`\`\`

Un tuple (ligne) a un **HeapTupleHeader** (23 octets) contenant :
- \`t_xmin\` — ID de transaction qui a inséré cette ligne
- \`t_xmax\` — ID de transaction qui a supprimé cette ligne (0 si vivante)
- \`t_ctid\` — emplacement physique (page, slot) — mis à jour lors d'UPDATE
- \`t_infomask\` — flags : visibilité, nulls, colonnes à largeur variable

Ce header est le fondement du MVCC.

## MVCC — Contrôle de Concurrence Multi-Version

PostgreSQL ne modifie jamais les lignes sur place. Chaque UPDATE crée une **nouvelle version du tuple** et marque l'ancienne comme morte (en définissant \`t_xmax\`). DELETE définit simplement \`t_xmax\` sur le tuple existant.

\`\`\`
Transaction 100 INSERT ligne :  xmin=100, xmax=0  (vivante)
Transaction 200 UPDATE ligne :   
  → ancien tuple : xmin=100, xmax=200  (morte pour txn >= 200)
  → nouveau tuple : xmin=200, xmax=0   (vivante pour txn >= 200)
\`\`\`

Cela signifie que les lecteurs ne bloquent jamais les écrivains et les écrivains ne bloquent jamais les lecteurs — la promesse fondamentale du MVCC.

## Bloat de table et VACUUM

L'inconvénient du MVCC : les tuples morts s'accumulent. Une table qui subit beaucoup d'UPDATE/DELETE grossit avec des tuples morts invisibles pour toutes les transactions mais qui occupent de l'espace disque.

\`\`\`sql
SELECT relname, n_live_tup, n_dead_tup, 
       round(n_dead_tup::numeric / nullif(n_live_tup + n_dead_tup, 0) * 100, 2) AS dead_pct
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
\`\`\`

**VACUUM** récupère l'espace des tuples morts. Il ne réduit PAS la taille du fichier sur disque (VACUUM FULL le fait, mais verrouille la table).

**Le Wraparound des Transaction ID** — le mode de défaillance le plus dangereux de PostgreSQL. Les IDs de transaction sont des entiers 32 bits (~4 milliards de valeurs). Si une table a un tuple avec un \`xmin\` vieux de 2 milliards de transactions, il devient invisible. VACUUM prévient cela en gelant les anciens tuples.

\`\`\`sql
SELECT datname, age(datfrozenxid), datfrozenxid
FROM pg_database
ORDER BY age(datfrozenxid) DESC;
-- Si age > 200 millions, investiguer d'urgence
\`\`\`

## Le chemin d'écriture

Quand vous exécutez \`INSERT INTO orders VALUES (...)\` :

1. Le parser valide le SQL et construit l'arbre d'analyse
2. Le planner sélectionne le plan d'exécution
3. L'executor exécute le plan
4. Le tuple est écrit dans une page sale dans \`shared_buffers\`
5. Un enregistrement WAL est écrit dans le buffer WAL (avant la modification de la page)
6. Au COMMIT : le buffer WAL est vidé sur disque (\`fsync\`)
7. Le checkpointer vide éventuellement les pages sales dans le fichier de table

Le vidage WAL au commit (étape 6) est ce qui rend PostgreSQL durable. Même si le serveur plante après le commit mais avant que la page sale soit écrite sur disque, le WAL permet la récupération.

## Coût des connexions

Chaque processus backend coûte ~5–10 Mo de RAM plus le coût OS du processus. À 200 connexions, vous utilisez 1–2 Go rien que pour le coût des processus — avant qu'aucune requête ne s'exécute.

C'est pourquoi des **poolers de connexions** comme PgBouncer existent :
\`\`\`
Applications (1000 connexions)
        ↓
   PgBouncer (pool de 20 connexions)
        ↓
   PostgreSQL (20 processus backend)
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "Why does PostgreSQL use a multi-process architecture instead of threads?",
      options: [
        "Threads are slower than processes on Linux",
        "Process isolation ensures a crashing backend cannot corrupt shared memory of other connections",
        "PostgreSQL was written before threads existed in POSIX",
        "Threads cannot share the shared_buffers cache",
      ],
      correct: 1,
    },
    {
      question:
        "What happens to the old tuple version when PostgreSQL executes an UPDATE?",
      options: [
        "It is immediately deleted from disk",
        "It is moved to an undo log",
        "Its t_xmax is set to the updating transaction ID and a new tuple version is inserted",
        "It is compressed and archived in pg_toast",
      ],
      correct: 2,
    },
    {
      question: "What is the danger of PostgreSQL Transaction ID Wraparound?",
      options: [
        "The database runs out of disk space",
        "Tuples older than 2 billion transactions become invisible, making the table appear empty",
        "VACUUM stops working and autovacuum crashes",
        "The WAL file grows beyond 4GB",
      ],
      correct: 1,
    },
    {
      question:
        "What buffer replacement algorithm does PostgreSQL use in shared_buffers?",
      options: [
        "LRU (Least Recently Used)",
        "LFU (Least Frequently Used)",
        "Clock-sweep with per-buffer usage counts",
        "ARC (Adaptive Replacement Cache)",
      ],
      correct: 2,
    },
    {
      question:
        "Why does PgBouncer transaction pooling mode break some application patterns?",
      options: [
        "It does not support SSL connections",
        "It resets the search_path on every transaction",
        "A server connection is only held during a transaction, so session-level state like SET LOCAL is lost between transactions",
        "It cannot handle prepared statements at all",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi PostgreSQL utilise-t-il une architecture multi-processus plutôt que des threads ?",
      options: [
        "Les threads sont plus lents que les processus sous Linux",
        "L'isolation des processus garantit qu'un backend qui plante ne peut pas corrompre la mémoire partagée des autres connexions",
        "PostgreSQL a été écrit avant que les threads POSIX n'existent",
        "Les threads ne peuvent pas partager le cache shared_buffers",
      ],
      correct: 1,
    },
    {
      question:
        "Que se passe-t-il avec l'ancienne version du tuple quand PostgreSQL exécute un UPDATE ?",
      options: [
        "Elle est immédiatement supprimée du disque",
        "Elle est déplacée dans un undo log",
        "Son t_xmax est défini avec l'ID de la transaction qui met à jour, et une nouvelle version du tuple est insérée",
        "Elle est compressée et archivée dans pg_toast",
      ],
      correct: 2,
    },
    {
      question:
        "Quel est le danger du Transaction ID Wraparound dans PostgreSQL ?",
      options: [
        "La base de données manque d'espace disque",
        "Les tuples de plus de 2 milliards de transactions deviennent invisibles, faisant apparaître la table comme vide",
        "VACUUM cesse de fonctionner et autovacuum plante",
        "Le fichier WAL dépasse 4 Go",
      ],
      correct: 1,
    },
    {
      question:
        "Quel algorithme de remplacement de buffer PostgreSQL utilise-t-il dans shared_buffers ?",
      options: [
        "LRU (Least Recently Used)",
        "LFU (Least Frequently Used)",
        "Clock-sweep avec compteurs d'utilisation par buffer",
        "ARC (Adaptive Replacement Cache)",
      ],
      correct: 2,
    },
    {
      question:
        "Pourquoi le mode transaction pooling de PgBouncer casse-t-il certains patterns d'application ?",
      options: [
        "Il ne supporte pas les connexions SSL",
        "Il réinitialise le search_path à chaque transaction",
        "Une connexion serveur n'est maintenue que pendant une transaction, donc l'état de session comme SET LOCAL est perdu entre les transactions",
        "Il ne peut pas gérer les prepared statements",
      ],
      correct: 2,
    },
  ],
};
