export const content = {
  en: `# MySQL / InnoDB

## InnoDB Architecture Overview

InnoDB is MySQL's default storage engine since 5.5. Unlike PostgreSQL's heap-based storage, InnoDB organizes all data around a **clustered index** — the table itself is the B-tree.

\`\`\`
InnoDB Architecture:
┌─────────────────────────────────────────────┐
│              InnoDB Buffer Pool              │
│  (data pages, index pages, undo logs,        │
│   insert buffer, adaptive hash index)        │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       ↓                ↓
  Tablespace         Redo Log
  (.ibd files)       (ib_logfile0/1)
       ↓
  Doublewrite Buffer (on disk)
\`\`\`

## Clustered Indexes — The Core Difference

In InnoDB, **every table is a clustered index**. The primary key IS the table. Rows are physically stored in primary key order inside the B-tree leaf pages.

\`\`\`sql
CREATE TABLE orders (
  id         BIGINT UNSIGNED PRIMARY KEY,
  user_id    INT,
  total      DECIMAL(10,2),
  created_at DATETIME
);
\`\`\`

The B-tree for this table:

\`\`\`
                    [500 | 1000]
                   /      |      \\
            [1–499]   [500–999]  [1000+]
               ↓           ↓          ↓
         Leaf pages:  actual row data stored here
         id=1: {user_id=42, total=99.99, ...}
         id=2: {user_id=17, total=149.00, ...}
\`\`\`

**Consequences:**
- Range scans on primary key are extremely fast (sequential I/O)
- Random primary key inserts (UUIDs!) cause **page splits** — devastating for write performance
- Secondary indexes store the primary key value, not the row pointer — a secondary index lookup always does two B-tree traversals

\`\`\`sql
-- Bad: UUID primary key causes random page splits
CREATE TABLE events (id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), ...);

-- Good: auto-increment keeps inserts sequential
CREATE TABLE events (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, ...);
\`\`\`

## Secondary Indexes

Every secondary index in InnoDB stores the **primary key** at the leaf level, not a physical row pointer (unlike MyISAM or PostgreSQL heap).

\`\`\`
Secondary index on (user_id):
  Leaf node: [user_id=42] → primary_key=1001
  
To get the full row:
  Step 1: Scan secondary index → get primary_key=1001
  Step 2: Traverse clustered index with pk=1001 → get full row
  
This double traversal is called a "bookmark lookup" or "key lookup"
\`\`\`

**Covering indexes** avoid the double traversal:
\`\`\`sql
-- Query: SELECT user_id, total FROM orders WHERE user_id = 42
-- Without covering index: secondary index lookup + clustered index lookup
-- With covering index: all needed columns are IN the index
CREATE INDEX idx_user_total ON orders(user_id, total);
-- Now (user_id, total) is in the leaf — no clustered index lookup needed
\`\`\`

## The InnoDB Buffer Pool

The buffer pool is InnoDB's primary memory structure. It caches data pages and index pages. Unlike PostgreSQL's shared_buffers, the InnoDB buffer pool also stores:

- **Undo log pages** — for MVCC and rollback
- **Insert buffer pages** (change buffer)
- **Adaptive hash index**
- **Lock information**

\`\`\`sql
-- Buffer pool hit rate (should be > 99% in production)
SELECT 
  (1 - (Innodb_buffer_pool_reads / Innodb_buffer_pool_read_requests)) * 100 
  AS hit_rate
FROM (
  SELECT 
    variable_value AS Innodb_buffer_pool_reads
  FROM performance_schema.global_status 
  WHERE variable_name = 'Innodb_buffer_pool_reads'
) r, (
  SELECT variable_value AS Innodb_buffer_pool_read_requests
  FROM performance_schema.global_status 
  WHERE variable_name = 'Innodb_buffer_pool_read_requests'
) rr;
\`\`\`

InnoDB uses a **modified LRU** with two sublists:
\`\`\`
Buffer Pool LRU:
[ ← New sublist (5/8) | Old sublist (3/8) → ]
  Hot pages              Cold pages (eviction candidates)

New pages enter at the midpoint (head of old sublist).
If accessed again within innodb_old_blocks_time (1 second default),
promoted to new sublist. Full table scans cannot thrash hot pages.
\`\`\`

## Change Buffer

When InnoDB needs to update a **secondary index page** that is NOT in the buffer pool, instead of reading the page from disk (expensive random I/O), it writes the change to the **change buffer** (stored in the buffer pool and on disk).

Later, when the page is read into the buffer pool for another reason, the buffered changes are **merged** — turning random I/O into sequential I/O.

\`\`\`
INSERT → secondary index page not in buffer pool
  ↓
Change Buffer ← records the pending change
  ↓ (later, during merge)
Page loaded → change applied
\`\`\`

This is why InnoDB INSERT performance can be excellent even with many secondary indexes — the random I/O is deferred and batched.

## Doublewrite Buffer

InnoDB's protection against **torn page writes**. A torn write occurs when a crash happens mid-write of an 8KB InnoDB page to disk — the page ends up with part old data and part new data. Unlike PostgreSQL (which uses the WAL to detect and fix this), InnoDB uses the doublewrite buffer:

\`\`\`
Write path:
1. Dirty pages → written to doublewrite buffer (sequential I/O, 2×128 pages)
2. fsync() doublewrite buffer
3. Dirty pages → written to their actual tablespace locations
4. If crash between step 2 and 3:
   → Recovery reads doublewrite buffer, restores intact pages
   → Then applies redo log
\`\`\`

This costs ~5–10% write throughput but prevents data corruption. Can be disabled (\`innodb_doublewrite=0\`) on filesystems with atomic writes (ZFS, certain SSDs with hardware support).

## InnoDB MVCC and Undo Logs

InnoDB's MVCC works differently from PostgreSQL's. Instead of keeping old row versions in the table itself, InnoDB stores them in a separate **undo log**.

\`\`\`
Current row (in clustered index):
  id=1, name="Alice", xid=200

Undo log chain:
  xid=200: name was "Bob"  → pointer to →
  xid=150: name was "Alice" → pointer to →
  xid=100: row didn't exist
\`\`\`

When a transaction needs to see an older version, InnoDB follows the undo log chain backwards. The undo log is stored in the **system tablespace** (or separate undo tablespaces in MySQL 8.0+).

**Purge thread** — a background thread that removes undo log records that are no longer needed by any active transaction. Long-running transactions delay purge, causing undo log bloat and slower queries (more undo chain to traverse).

\`\`\`sql
-- Check undo log history length (should stay low)
SHOW ENGINE INNODB STATUS\\G
-- Look for: History list length XX
-- If > 10,000, you have long-running transactions blocking purge
\`\`\`

## Redo Log

The redo log (\`ib_logfile0\`, \`ib_logfile1\`) is InnoDB's WAL. It records physical changes to pages in a **circular buffer** format.

\`\`\`
ib_logfile0 [========write=====>    ] LSN: 1,234,567
ib_logfile1 [====================   ] LSN: 2,345,678

When the write position wraps around to unrecovered data → checkpoint is forced
\`\`\`

Key difference from PostgreSQL WAL: InnoDB's redo log is fixed-size and circular. If it fills up (transactions writing faster than checkpointing), InnoDB stalls all writes. This is why \`innodb_log_file_size\` matters — too small causes checkpoint storms, too large means longer crash recovery.

\`\`\`sql
-- Check redo log I/O pressure
SHOW GLOBAL STATUS LIKE 'Innodb_log_waits';
-- Non-zero means redo log is a bottleneck
\`\`\`

## Adaptive Hash Index

InnoDB monitors B-tree index access patterns. If it detects that certain index values are accessed repeatedly (hot lookups), it automatically builds a **hash index** in the buffer pool for those values.

\`\`\`
B-tree lookup: O(log n) — multiple page reads
Hash lookup:   O(1) — single memory access

AHI converts hot B-tree lookups into hash lookups automatically
\`\`\`

This is entirely automatic and lives in memory only — no on-disk representation. Can be disabled if contention on the AHI latch becomes a bottleneck on high-concurrency workloads:
\`\`\`sql
SET GLOBAL innodb_adaptive_hash_index = OFF;
\`\`\`
`,

  fr: `# MySQL / InnoDB

## Vue d'ensemble de l'architecture InnoDB

InnoDB est le moteur de stockage par défaut de MySQL depuis la version 5.5. Contrairement au stockage basé sur le heap de PostgreSQL, InnoDB organise toutes les données autour d'un **index clustérisé** — la table elle-même EST le B-tree.

\`\`\`
Architecture InnoDB :
┌─────────────────────────────────────────────┐
│            Buffer Pool InnoDB                │
│  (pages de données, pages d'index,           │
│   undo logs, insert buffer, AHI)             │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       ↓                ↓
  Tablespace         Redo Log
  (fichiers .ibd)    (ib_logfile0/1)
       ↓
  Doublewrite Buffer (sur disque)
\`\`\`

## Index Clustérisés — La différence fondamentale

Dans InnoDB, **chaque table est un index clustérisé**. La clé primaire EST la table. Les lignes sont physiquement stockées dans l'ordre de la clé primaire dans les pages feuilles du B-tree.

\`\`\`sql
CREATE TABLE orders (
  id         BIGINT UNSIGNED PRIMARY KEY,
  user_id    INT,
  total      DECIMAL(10,2),
  created_at DATETIME
);
\`\`\`

**Conséquences :**
- Les scans de plage sur la clé primaire sont extrêmement rapides (I/O séquentiel)
- Les insertions aléatoires sur la clé primaire (UUIDs !) causent des **divisions de page** — dévastateur pour les performances en écriture
- Les index secondaires stockent la valeur de la clé primaire, pas le pointeur de ligne — une recherche dans un index secondaire effectue toujours deux traversées B-tree

\`\`\`sql
-- Mauvais : UUID comme clé primaire cause des divisions de page aléatoires
CREATE TABLE events (id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()), ...);

-- Bon : auto-increment garde les insertions séquentielles
CREATE TABLE events (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, ...);
\`\`\`

## Index Secondaires

Chaque index secondaire dans InnoDB stocke la **clé primaire** au niveau feuille, pas un pointeur physique vers la ligne.

\`\`\`
Index secondaire sur (user_id) :
  Nœud feuille : [user_id=42] → primary_key=1001
  
Pour obtenir la ligne complète :
  Étape 1 : Scan de l'index secondaire → pk=1001
  Étape 2 : Traversée de l'index clustérisé avec pk=1001 → ligne complète
  
Cette double traversée s'appelle "bookmark lookup" ou "key lookup"
\`\`\`

**Les index couvrants** évitent la double traversée :
\`\`\`sql
-- Requête : SELECT user_id, total FROM orders WHERE user_id = 42
CREATE INDEX idx_user_total ON orders(user_id, total);
-- Maintenant (user_id, total) est dans la feuille — pas de lookup clustérisé
\`\`\`

## Le Buffer Pool InnoDB

Le buffer pool est la structure mémoire principale d'InnoDB. Il met en cache les pages de données et d'index. Il stocke aussi :

- **Pages d'undo log** — pour MVCC et rollback
- **Pages du change buffer**
- **Adaptive hash index**
- **Informations de verrou**

InnoDB utilise un **LRU modifié** avec deux sous-listes :
\`\`\`
Buffer Pool LRU :
[ ← Nouvelle sous-liste (5/8) | Ancienne sous-liste (3/8) → ]
  Pages chaudes                  Pages froides (candidates à l'éviction)

Les nouvelles pages entrent au milieu (tête de l'ancienne sous-liste).
Si accédées à nouveau dans innodb_old_blocks_time (1 seconde par défaut),
promues dans la nouvelle sous-liste.
\`\`\`

## Change Buffer

Quand InnoDB doit mettre à jour une **page d'index secondaire** qui N'EST PAS dans le buffer pool, au lieu de lire la page depuis le disque (I/O aléatoire coûteux), il écrit le changement dans le **change buffer**.

Plus tard, quand la page est lue dans le buffer pool pour une autre raison, les changements mis en buffer sont **fusionnés** — transformant l'I/O aléatoire en I/O séquentiel.

C'est pourquoi les performances d'INSERT InnoDB peuvent être excellentes même avec de nombreux index secondaires — l'I/O aléatoire est différé et regroupé.

## Doublewrite Buffer

Protection d'InnoDB contre les **écritures de page déchirées**. Une écriture déchirée se produit quand un crash survient au milieu de l'écriture d'une page InnoDB de 8 Ko sur disque.

\`\`\`
Chemin d'écriture :
1. Pages sales → écrites dans le doublewrite buffer (I/O séquentiel)
2. fsync() du doublewrite buffer
3. Pages sales → écrites à leurs emplacements réels dans le tablespace
4. Si crash entre l'étape 2 et 3 :
   → La récupération lit le doublewrite buffer, restaure les pages intactes
   → Puis applique le redo log
\`\`\`

Cela coûte ~5–10% de débit en écriture mais prévient la corruption des données.

## MVCC et Undo Logs d'InnoDB

Le MVCC d'InnoDB fonctionne différemment de PostgreSQL. Au lieu de garder les anciennes versions de lignes dans la table elle-même, InnoDB les stocke dans un **undo log** séparé.

\`\`\`
Ligne courante (dans l'index clustérisé) :
  id=1, name="Alice", xid=200

Chaîne undo log :
  xid=200 : name était "Bob"   → pointeur vers →
  xid=150 : name était "Alice" → pointeur vers →
  xid=100 : la ligne n'existait pas
\`\`\`

Le **thread de purge** — un thread en arrière-plan qui supprime les enregistrements d'undo log dont aucune transaction active n'a besoin. Les transactions longues retardent la purge, causant un gonflement de l'undo log.

\`\`\`sql
-- Vérifier la longueur de l'historique undo log
SHOW ENGINE INNODB STATUS\\G
-- Chercher : History list length XX
-- Si > 10 000, vous avez des transactions longues bloquant la purge
\`\`\`

## Redo Log

Le redo log (\`ib_logfile0\`, \`ib_logfile1\`) est le WAL d'InnoDB. Il enregistre les changements physiques aux pages dans un format de **buffer circulaire**.

Différence clé avec le WAL de PostgreSQL : le redo log d'InnoDB est de taille fixe et circulaire. S'il se remplit (transactions écrivant plus vite que le checkpointing), InnoDB bloque toutes les écritures. C'est pourquoi \`innodb_log_file_size\` est important.

## Adaptive Hash Index

InnoDB surveille les patterns d'accès aux index B-tree. S'il détecte que certaines valeurs d'index sont accédées de façon répétée (lookups chauds), il construit automatiquement un **index hash** dans le buffer pool pour ces valeurs.

\`\`\`
Lookup B-tree : O(log n) — lectures de pages multiples
Lookup hash :   O(1)     — accès mémoire unique

L'AHI convertit automatiquement les lookups B-tree chauds en lookups hash
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "Why is using a UUID as a primary key in InnoDB bad for write performance?",
      options: [
        "UUIDs are too long to store in a B-tree",
        "UUIDs cause random page splits in the clustered index, fragmenting the B-tree",
        "InnoDB does not support string primary keys",
        "UUID generation is CPU-intensive",
      ],
      correct: 1,
    },
    {
      question: "What does a secondary index lookup in InnoDB actually do?",
      options: [
        "It reads the row directly from the heap file",
        "It traverses the secondary B-tree to get the primary key, then traverses the clustered index to get the full row",
        "It uses the change buffer to avoid disk I/O",
        "It reads from the adaptive hash index directly",
      ],
      correct: 1,
    },
    {
      question: "What is the purpose of the InnoDB change buffer?",
      options: [
        "To buffer WAL writes before flushing to ib_logfile",
        "To defer expensive random I/O for secondary index updates when the target page is not in the buffer pool",
        "To store undo log records for long-running transactions",
        "To cache the most frequently accessed rows in memory",
      ],
      correct: 1,
    },
    {
      question: "What happens if InnoDB's redo log fills up completely?",
      options: [
        "InnoDB switches to a second log file automatically",
        "The oldest transactions are automatically rolled back",
        "InnoDB stalls all write operations until a checkpoint frees space",
        "The database crashes and requires manual recovery",
      ],
      correct: 2,
    },
    {
      question: "What causes a high 'History list length' in InnoDB?",
      options: [
        "Too many secondary indexes on a table",
        "The doublewrite buffer is disabled",
        "Long-running transactions preventing the purge thread from cleaning undo logs",
        "The adaptive hash index consuming too much buffer pool memory",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi utiliser un UUID comme clé primaire dans InnoDB est-il mauvais pour les performances en écriture ?",
      options: [
        "Les UUIDs sont trop longs pour être stockés dans un B-tree",
        "Les UUIDs causent des divisions de page aléatoires dans l'index clustérisé, fragmentant le B-tree",
        "InnoDB ne supporte pas les clés primaires de type chaîne",
        "La génération d'UUID est intensive en CPU",
      ],
      correct: 1,
    },
    {
      question:
        "Que fait réellement une recherche dans un index secondaire InnoDB ?",
      options: [
        "Elle lit la ligne directement depuis le fichier heap",
        "Elle traverse le B-tree secondaire pour obtenir la clé primaire, puis traverse l'index clustérisé pour obtenir la ligne complète",
        "Elle utilise le change buffer pour éviter l'I/O disque",
        "Elle lit directement depuis l'adaptive hash index",
      ],
      correct: 1,
    },
    {
      question: "Quel est le but du change buffer InnoDB ?",
      options: [
        "Mettre en buffer les écritures WAL avant de les vider dans ib_logfile",
        "Différer l'I/O aléatoire coûteux pour les mises à jour d'index secondaires quand la page cible n'est pas dans le buffer pool",
        "Stocker les enregistrements d'undo log pour les transactions longues",
        "Mettre en cache les lignes les plus fréquemment accédées en mémoire",
      ],
      correct: 1,
    },
    {
      question:
        "Que se passe-t-il si le redo log d'InnoDB se remplit complètement ?",
      options: [
        "InnoDB bascule automatiquement vers un second fichier de log",
        "Les transactions les plus anciennes sont automatiquement annulées",
        "InnoDB bloque toutes les opérations d'écriture jusqu'à ce qu'un checkpoint libère de l'espace",
        "La base de données plante et nécessite une récupération manuelle",
      ],
      correct: 2,
    },
    {
      question:
        "Qu'est-ce qui cause une 'History list length' élevée dans InnoDB ?",
      options: [
        "Trop d'index secondaires sur une table",
        "Le doublewrite buffer est désactivé",
        "Des transactions longues empêchant le thread de purge de nettoyer les undo logs",
        "L'adaptive hash index consommant trop de mémoire du buffer pool",
      ],
      correct: 2,
    },
  ],
};
