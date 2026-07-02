export const content = {
  en: `# SQLite Internals

## What Makes SQLite Different

SQLite is not a client-server database. It is a **C library** that you link directly into your application. There is no separate server process, no network protocol, no authentication system. The entire database is a single file on disk.

\`\`\`
PostgreSQL / MySQL:
  App → TCP socket → Server process → Files

SQLite:
  App → C library (linked in) → Single .db file
\`\`\`

This makes SQLite the most widely deployed database in the world — it runs in every Android and iOS device, every browser (Web SQL, now deprecated), every macOS/iOS system application, and in billions of embedded devices.

## The Virtual Database Engine (VDBE)

SQLite compiles SQL into **bytecode** that runs on an internal virtual machine called the VDBE (Virtual DataBase Engine). This is the architectural core that separates SQLite from most other databases.

\`\`\`
SQL Query
   ↓
Tokenizer → Parser → Code Generator
                           ↓
                      VDBE Bytecode (like assembly)
                           ↓
                      VDBE Interpreter executes bytecode
                           ↓
                      B-tree / Pager layer
                           ↓
                      OS Interface (VFS)
                           ↓
                      .db file on disk
\`\`\`

You can inspect the bytecode with \`EXPLAIN\`:

\`\`\`sql
EXPLAIN SELECT name FROM users WHERE id = 1;

-- Output (simplified):
addr  opcode         p1    p2    p3
----  -------------  ----  ----  -----
0     Init           0     9     
1     OpenRead       0     2     (users table, root page 2)
2     SeekRowid      0     8     1       (seek to rowid=1)
3     Column         0     1     r1      (get column 1 = name)
4     ResultRow      r1    1     
8     Halt           
9     Transaction    0     0     
\`\`\`

Each VDBE instruction operates on a set of **registers** (like CPU registers) and a set of **cursors** (pointers into B-tree pages).

## File Format — One File, Everything

A SQLite database is a single file divided into **fixed-size pages**. The default page size is 4096 bytes (configurable from 512 to 65536, must be power of 2).

\`\`\`
SQLite File Layout:
┌─────────────────────────────┐
│  Page 1: Database Header    │  100-byte header + first B-tree page
│  (magic number, page size,  │
│   schema version, etc.)     │
├─────────────────────────────┤
│  Page 2: sqlite_schema      │  Master table (table/index definitions)
├─────────────────────────────┤
│  Page 3+: B-tree pages      │  Table data and index data
│  ...                        │
├─────────────────────────────┤
│  Free pages                 │  Linked list of unused pages
└─────────────────────────────┘
\`\`\`

**The 100-byte header (page 1):**
\`\`\`
Offset  Size  Description
0       16    Magic string: "SQLite format 3\\000"
16      2     Page size (512–65536, or 1 meaning 65536)
18      1     File format write version (1=legacy, 2=WAL)
19      1     File format read version
20      1     Reserved bytes per page (usually 0)
24      4     File change counter
28      4     Number of pages in database
32      4     Page number of first freelist trunk page
36      4     Total number of freelist pages
96      4     Schema format number (1–4)
100     4     Default page cache size
\`\`\`

## B-tree Implementation

SQLite uses two types of B-trees:

**Table B-trees** — store actual row data. The key is the **rowid** (a 64-bit integer). If you define \`INTEGER PRIMARY KEY\`, it becomes the rowid alias — no separate storage needed.

**Index B-trees** — store index entries. The key is the indexed column(s) plus the rowid (to make keys unique).

\`\`\`
Table B-tree page layout:
┌──────────────────────────────────┐
│ Page header (8 or 12 bytes)      │
│  - page type (leaf/interior)     │
│  - first freeblock offset        │
│  - number of cells               │
│  - cell content area offset      │
│  - fragmented free bytes         │
├──────────────────────────────────┤
│ Cell pointer array               │  2 bytes per cell, offsets to cells
├──────────────────────────────────┤
│ Unallocated space                │
├──────────────────────────────────┤
│ Cell content area                │  variable-length records
└──────────────────────────────────┘
\`\`\`

**Record format** uses a compact variable-length encoding:

\`\`\`
Record = [header_size] [type1] [type2] ... [data1] [data2] ...

Type codes:
  0  = NULL
  1  = 8-bit signed int
  2  = 16-bit signed int
  3  = 24-bit signed int
  4  = 32-bit signed int
  5  = 48-bit signed int
  6  = 64-bit signed int
  7  = IEEE 754 float (8 bytes)
  8  = integer 0 (no data stored!)
  9  = integer 1 (no data stored!)
  N≥12, even  = BLOB, length = (N-12)/2
  N≥13, odd   = TEXT, length = (N-13)/2
\`\`\`

Notice types 8 and 9 — storing \`0\` or \`1\` uses zero data bytes. This is the kind of micro-optimization baked into SQLite's format.

## The Pager — SQLite's Transaction Engine

The **Pager** sits between the B-tree layer and the OS. It manages:
- Page cache (in-memory pages)
- Transaction atomicity
- Crash recovery
- Two journaling modes: **Rollback Journal** and **WAL**

### Rollback Journal (default, legacy)

\`\`\`
Before modifying page N:
  1. Write original page N to journal file (.db-journal)
  2. fsync() the journal
  3. Modify page N in memory
  4. On COMMIT: fsync() the main database file, delete journal
  5. On ROLLBACK: read journal, restore original pages, delete journal

Locking during write:
  UNLOCKED → SHARED (read) → RESERVED (writing, others can still read)
  → PENDING (waiting for readers to finish) → EXCLUSIVE (full lock)
\`\`\`

The rollback journal means **only one writer at a time** and writers block all readers during commit.

### WAL Mode (Write-Ahead Logging)

\`\`\`sql
PRAGMA journal_mode = WAL;
\`\`\`

WAL mode completely changes the concurrency model:

\`\`\`
Write path:
  1. Append new page version to WAL file (.db-wal)
  2. No fsync needed per transaction (just write to WAL)
  3. Readers: check WAL first, then main database file

WAL structure:
  [WAL header] [Frame 1] [Frame 2] ... [Frame N]
  Each frame = [page number] [commit marker] [page data]

Checkpoint: copy WAL frames back to main database file
\`\`\`

**WAL advantages:**
- Writers and readers don't block each other
- Write transactions are faster (no fsync per commit by default)
- Better read concurrency

**WAL disadvantages:**
- Slower for read-heavy workloads with large WAL (readers must scan WAL)
- Requires shared memory for WAL index (doesn't work over NFS)
- Database has 3 files instead of 1 (.db, .db-wal, .db-shm)

## WITHOUT ROWID Tables

By default every SQLite table has a hidden 64-bit rowid. \`WITHOUT ROWID\` tables use the declared primary key directly as the B-tree key — no rowid, no secondary lookup.

\`\`\`sql
CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER,
  expires INTEGER
) WITHOUT ROWID;
\`\`\`

When to use it:
- Primary key is already a natural unique key (token, UUID, composite key)
- Rows are small (all data fits in the B-tree leaf alongside the key)
- You access rows almost exclusively by primary key

For the sessions table above, a lookup by token traverses ONE B-tree (instead of two in a normal table with a secondary index on token).

## Locking and Concurrency Limits

SQLite uses **file-level locking** via the OS. This is its biggest limitation for concurrent write workloads:

\`\`\`
Lock levels:
  UNLOCKED   — no lock held
  SHARED     — reading; multiple connections can hold simultaneously
  RESERVED   — one writer preparing to write; readers still allowed
  PENDING    — writer waiting for readers to release SHARED locks
  EXCLUSIVE  — writing; no other connection can read or write
\`\`\`

In WAL mode, the exclusive lock is only needed during **checkpoint**, not during normal writes. This is why WAL dramatically improves concurrent read/write performance.

**Practical concurrency limits:**
- WAL mode: many concurrent readers + one writer simultaneously ✓
- Rollback journal: one writer blocks all readers during commit ✗
- Multiple processes writing: serialize at the OS lock level
- Network filesystems (NFS, SMB): file locking is unreliable — **do not use SQLite over NFS**

## SQLite in Production — When It Works and When It Doesn't

**SQLite is the right choice when:**
\`\`\`
✓ Single application, local data (mobile apps, desktop apps)
✓ Read-heavy workloads (config files, catalogs, caches)
✓ Embedded systems with no network
✓ Testing (replace PostgreSQL in tests with SQLite for speed)
✓ < 1TB data, < 100 writes/second
\`\`\`

**SQLite is the wrong choice when:**
\`\`\`
✗ Multiple application servers writing simultaneously
✗ High write concurrency (thousands of writes/second)
✗ Network file systems
✗ Data that needs to live on a separate server
\`\`\`

Litestream (a replication tool) and Turso (distributed SQLite) are pushing these limits — they replicate SQLite WAL in real time, enabling read replicas and disaster recovery for SQLite in production.
`,

  fr: `# Internals de SQLite

## Ce qui rend SQLite différent

SQLite n'est pas une base de données client-serveur. C'est une **bibliothèque C** que vous liez directement dans votre application. Il n'y a pas de processus serveur séparé, pas de protocole réseau, pas de système d'authentification. Toute la base de données est un seul fichier sur disque.

\`\`\`
PostgreSQL / MySQL :
  App → socket TCP → Processus serveur → Fichiers

SQLite :
  App → bibliothèque C (liée) → Fichier .db unique
\`\`\`

Cela fait de SQLite la base de données la plus déployée au monde — elle tourne dans chaque appareil Android et iOS, chaque navigateur, chaque application système macOS/iOS, et dans des milliards d'appareils embarqués.

## Le Virtual Database Engine (VDBE)

SQLite compile le SQL en **bytecode** qui s'exécute sur une machine virtuelle interne appelée le VDBE (Virtual DataBase Engine).

\`\`\`
Requête SQL
   ↓
Tokenizer → Parser → Générateur de code
                           ↓
                      Bytecode VDBE (comme de l'assembleur)
                           ↓
                      Interpréteur VDBE exécute le bytecode
                           ↓
                      Couche B-tree / Pager
                           ↓
                      Interface OS (VFS)
                           ↓
                      Fichier .db sur disque
\`\`\`

Vous pouvez inspecter le bytecode avec \`EXPLAIN\` :

\`\`\`sql
EXPLAIN SELECT name FROM users WHERE id = 1;
\`\`\`

## Format de fichier — Un seul fichier, tout dedans

Une base de données SQLite est un fichier unique divisé en **pages de taille fixe**. La taille de page par défaut est de 4096 octets.

**Format d'enregistrement** — encodage compact à longueur variable :

\`\`\`
Types de colonnes :
  0  = NULL
  1  = entier signé 8 bits
  2  = entier signé 16 bits
  4  = entier signé 32 bits
  6  = entier signé 64 bits
  7  = float IEEE 754 (8 octets)
  8  = entier 0 (aucune donnée stockée !)
  9  = entier 1 (aucune donnée stockée !)
  N≥12, pair  = BLOB, longueur = (N-12)/2
  N≥13, impair = TEXT, longueur = (N-13)/2
\`\`\`

Les types 8 et 9 — stocker \`0\` ou \`1\` utilise zéro octet de données. C'est le genre d'optimisation micro intégrée dans le format de SQLite.

## Le Pager — Le moteur de transactions de SQLite

Le **Pager** se situe entre la couche B-tree et l'OS. Il gère le cache de pages, l'atomicité des transactions et la récupération après crash.

### Journal de rollback (défaut, legacy)

\`\`\`
Avant de modifier la page N :
  1. Écrire la page N originale dans le fichier journal (.db-journal)
  2. fsync() le journal
  3. Modifier la page N en mémoire
  4. Au COMMIT : fsync() le fichier de base de données principal, supprimer le journal
  5. Au ROLLBACK : lire le journal, restaurer les pages originales
\`\`\`

Le journal de rollback signifie **un seul écrivain à la fois** et les écrivains bloquent tous les lecteurs pendant le commit.

### Mode WAL (Write-Ahead Logging)

\`\`\`sql
PRAGMA journal_mode = WAL;
\`\`\`

**Avantages du WAL :**
- Les écrivains et les lecteurs ne se bloquent pas mutuellement
- Les transactions d'écriture sont plus rapides
- Meilleure concurrence en lecture

**Inconvénients du WAL :**
- Plus lent pour les charges de travail à lecture intensive avec un grand WAL
- Nécessite une mémoire partagée pour l'index WAL (ne fonctionne pas sur NFS)
- La base de données a 3 fichiers au lieu de 1 (.db, .db-wal, .db-shm)

## Tables WITHOUT ROWID

Par défaut, chaque table SQLite a un rowid 64 bits caché. Les tables \`WITHOUT ROWID\` utilisent directement la clé primaire déclarée comme clé B-tree.

\`\`\`sql
CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER,
  expires INTEGER
) WITHOUT ROWID;
\`\`\`

Quand l'utiliser :
- La clé primaire est déjà une clé unique naturelle
- Les lignes sont petites
- Vous accédez aux lignes presque exclusivement par clé primaire

## Verrouillage et limites de concurrence

SQLite utilise le **verrouillage au niveau du fichier** via l'OS :

\`\`\`
Niveaux de verrou :
  UNLOCKED   — pas de verrou
  SHARED     — lecture ; plusieurs connexions peuvent tenir simultanément
  RESERVED   — un écrivain se prépare ; les lecteurs sont encore autorisés
  PENDING    — l'écrivain attend que les lecteurs libèrent leurs verrous SHARED
  EXCLUSIVE  — écriture ; aucune autre connexion ne peut lire ou écrire
\`\`\`

**Limites pratiques de concurrence :**
- Mode WAL : plusieurs lecteurs + un écrivain simultanément ✓
- Journal de rollback : un écrivain bloque tous les lecteurs au commit ✗
- Systèmes de fichiers réseau (NFS) : le verrouillage de fichiers est peu fiable — **ne pas utiliser SQLite sur NFS**

## SQLite en production

**SQLite est le bon choix quand :**
\`\`\`
✓ Application unique, données locales (apps mobiles, desktop)
✓ Charges de travail à lecture intensive
✓ Systèmes embarqués sans réseau
✓ Tests (remplacer PostgreSQL dans les tests par SQLite)
✓ < 1 To de données, < 100 écritures/seconde
\`\`\`

**SQLite est le mauvais choix quand :**
\`\`\`
✗ Plusieurs serveurs d'application écrivant simultanément
✗ Haute concurrence en écriture
✗ Systèmes de fichiers réseau
✗ Données devant vivre sur un serveur séparé
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "What is the VDBE in SQLite and why does it matter?",
      options: [
        "A virtual buffer engine that caches pages in memory",
        "A virtual machine that executes bytecode compiled from SQL — the architectural core separating SQLite from other databases",
        "A version control system for database schema changes",
        "A validation engine that checks SQL syntax before execution",
      ],
      correct: 1,
    },
    {
      question:
        "In SQLite's record format, how many data bytes does storing the integer value 0 require?",
      options: [
        "8 bytes (64-bit integer)",
        "4 bytes (32-bit integer)",
        "1 byte (8-bit integer)",
        "0 bytes — type code 8 encodes the value itself",
      ],
      correct: 3,
    },
    {
      question:
        "What is the main concurrency advantage of WAL mode over rollback journal mode?",
      options: [
        "WAL allows multiple simultaneous writers",
        "WAL writers and readers do not block each other — many readers and one writer can operate simultaneously",
        "WAL eliminates the need for file-level locking entirely",
        "WAL stores data in multiple files for better parallelism",
      ],
      correct: 1,
    },
    {
      question: "When should you use WITHOUT ROWID tables in SQLite?",
      options: [
        "When you need better WAL performance",
        "When the table has no primary key",
        "When the primary key is a natural unique key, rows are small, and access is almost exclusively by primary key",
        "When the table will have more than 1 million rows",
      ],
      correct: 2,
    },
    {
      question:
        "Why should you never use SQLite over NFS (Network File System)?",
      options: [
        "SQLite files are too large for network transfer",
        "NFS does not support the WAL journal mode",
        "File locking over NFS is unreliable, which can corrupt the database",
        "SQLite requires direct memory access to the disk",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question:
        "Qu'est-ce que le VDBE dans SQLite et pourquoi est-il important ?",
      options: [
        "Un moteur de buffer virtuel qui met les pages en cache en mémoire",
        "Une machine virtuelle qui exécute du bytecode compilé à partir de SQL — le cœur architectural qui distingue SQLite des autres bases de données",
        "Un système de contrôle de version pour les changements de schéma",
        "Un moteur de validation qui vérifie la syntaxe SQL avant l'exécution",
      ],
      correct: 1,
    },
    {
      question:
        "Dans le format d'enregistrement de SQLite, combien d'octets de données nécessite le stockage de l'entier 0 ?",
      options: [
        "8 octets (entier 64 bits)",
        "4 octets (entier 32 bits)",
        "1 octet (entier 8 bits)",
        "0 octet — le code de type 8 encode lui-même la valeur",
      ],
      correct: 3,
    },
    {
      question:
        "Quel est le principal avantage de concurrence du mode WAL par rapport au journal de rollback ?",
      options: [
        "Le WAL permet plusieurs écrivains simultanés",
        "Les écrivains et lecteurs WAL ne se bloquent pas mutuellement — plusieurs lecteurs et un écrivain peuvent opérer simultanément",
        "Le WAL élimine complètement le besoin de verrouillage au niveau du fichier",
        "Le WAL stocke les données dans plusieurs fichiers pour un meilleur parallélisme",
      ],
      correct: 1,
    },
    {
      question:
        "Quand devriez-vous utiliser les tables WITHOUT ROWID dans SQLite ?",
      options: [
        "Quand vous avez besoin de meilleures performances WAL",
        "Quand la table n'a pas de clé primaire",
        "Quand la clé primaire est une clé unique naturelle, les lignes sont petites et l'accès se fait presque exclusivement par clé primaire",
        "Quand la table aura plus d'un million de lignes",
      ],
      correct: 2,
    },
    {
      question: "Pourquoi ne devriez-vous jamais utiliser SQLite sur NFS ?",
      options: [
        "Les fichiers SQLite sont trop grands pour le transfert réseau",
        "NFS ne supporte pas le mode journal WAL",
        "Le verrouillage de fichiers sur NFS est peu fiable, ce qui peut corrompre la base de données",
        "SQLite nécessite un accès mémoire direct au disque",
      ],
      correct: 2,
    },
  ],
};
