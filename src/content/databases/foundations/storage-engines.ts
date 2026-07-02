export const content = {
  en: `# Storage Engines — Where Data Actually Lives

When you INSERT a row, where does it go? Not "in the database" — WHERE on disk, in what format, with what overhead? Storage engines answer these questions. Understanding storage engines means understanding the physical reality behind SQL's logical abstraction.

## Page-Based Storage — The Fundamental Unit

\`\`\`
Everything in a database is pages:

Page = Fixed-size block (typically 4KB, 8KB, or 16KB)

Why pages?
├── Operating system I/O unit (4KB page cache)
├── Disk sector alignment (512B or 4KB)
├── Buffer pool management unit
└── WAL logging unit

PostgreSQL: 8KB pages
MySQL InnoDB: 16KB pages
SQL Server: 8KB pages
Oracle: 8KB blocks (configurable)

One disk read = one page
One buffer pool entry = one page
One cache miss = read entire page
\`\`\`

### Slotted Page Structure

\`\`\`
PostgreSQL page layout (8192 bytes):

Byte Offset    Content
0              ┌─────────────────────────────────────────┐
               │ Page Header (24 bytes)                  │
               │ ├── pd_lsn (LSN of last page change)   │
               │ ├── pd_checksum (CRC32 checksum)       │
               │ ├── pd_flags (all-visible, etc)        │
               │ ├── pd_lower (free space start)        │
               │ ├── pd_upper (free space end)          │
               │ ├── pd_special (special space offset)  │
               │ └── pd_pagesize_version (8192)         │
24             ├─────────────────────────────────────────┤
               │ Item Pointers (Line Pointers)           │
               │ ┌────────────────┬──────────┬─────────┐│
               │ │ Item 1: offset │  length  │ flags   ││
               │ │ Item 2: offset │  length  │ flags   ││
               │ │ Item 3: offset │  length  │ flags   ││
               │ └────────────────┴──────────┴─────────┘│
               │ (4 bytes per item pointer)              │
pd_lower →     ├─────────────────────────────────────────┤
               │                                         │
               │         Free Space                      │
               │         (Grows toward middle)           │
               │                                         │
pd_upper →     ├─────────────────────────────────────────┤
               │ Tuple 3 (actual row data)              │
               │ Tuple 2                                 │
               │ Tuple 1                                 │
               │ (Tuples grow from end toward start)    │
8168           ├─────────────────────────────────────────┤
               │ Special Space (varies by page type)    │
               │ - Heap: empty                          │
               │ - B-tree: prev/next page pointers      │
8192           └─────────────────────────────────────────┘

Why slotted pages?
1. Variable-length tuples (rows of different sizes)
2. Tuple deletion without page reorganization
3. Update in place (if size unchanged)
4. Free space management
\`\`\`

### Page Header Structure (PostgreSQL)

\`\`\`c
// PostgreSQL: src/include/storage/bufpage.h
typedef struct PageHeaderData {
    PageXLogRecPtr pd_lsn;        // LSN: last WAL record affecting page
    uint16         pd_checksum;   // Page checksum (CRC32C)
    uint16         pd_flags;      // Flag bits (all-visible, etc)
    LocationIndex  pd_lower;      // Offset to start of free space
    LocationIndex  pd_upper;      // Offset to end of free space
    LocationIndex  pd_special;    // Offset to special space
    uint16         pd_pagesize_version;  // Page size and layout version
    TransactionId  pd_prune_xid;  // Oldest XID that may still see tuples
    ItemIdData     pd_linp[FLEXIBLE_ARRAY_MEMBER]; // Line pointers
} PageHeaderData;

// Item pointer (line pointer)
typedef struct ItemIdData {
    unsigned   lp_off:15;      // Offset to tuple (bytes from start of page)
    unsigned   lp_flags:2;     // LP_NORMAL, LP_REDIRECT, LP_DEAD, LP_UNUSED
    unsigned   lp_len:15;      // Byte length of tuple
} ItemIdData;

// Example: 3 tuples in page
// pd_lower = 24 + (3 * 4) = 36   (header + 3 item pointers)
// pd_upper = 8192 - 200 = 7992    (3 tuples totaling 200 bytes)
// Free space = 7992 - 36 = 7956 bytes
\`\`\`

### Tuple Format (PostgreSQL Heap Tuple)

\`\`\`
PostgreSQL tuple structure:

┌────────────────────────────────────────────────────┐
│ Tuple Header (23 bytes)                            │
│ ├── t_xmin (4 bytes) - Creating transaction ID    │
│ ├── t_xmax (4 bytes) - Deleting transaction ID    │
│ ├── t_cid (4 bytes) - Command ID within txn       │
│ ├── t_ctid (6 bytes) - Current TID (page, offset) │
│ ├── t_infomask2 (2 bytes) - Number of attributes  │
│ ├── t_infomask (2 bytes) - Various flag bits      │
│ └── t_hoff (1 byte) - Header offset (bytes)       │
├────────────────────────────────────────────────────┤
│ NULL Bitmap (optional, ceil(natts/8) bytes)        │
│ - One bit per column (1 = NULL, 0 = not NULL)     │
├────────────────────────────────────────────────────┤
│ Padding (optional, for alignment)                  │
├────────────────────────────────────────────────────┤
│ Column Data (variable length)                      │
│ ├── Column 1 (int4: 4 bytes)                      │
│ ├── Column 2 (text: length header + chars)        │
│ ├── Column 3 (timestamp: 8 bytes)                 │
│ └── ... (more columns)                            │
└────────────────────────────────────────────────────┘

Example tuple:
CREATE TABLE users (
    id INT,
    name TEXT,
    email TEXT,
    created_at TIMESTAMP
);

INSERT INTO users VALUES (1, 'Alice', 'alice@example.com', NOW());

Physical layout:
Offset  Bytes   Content
0       4       t_xmin = 12345 (creating XID)
4       4       t_xmax = 0 (not deleted)
8       4       t_cid = 0
12      6       t_ctid = (0, 1) - page 0, item 1
18      2       t_infomask2 = 4 (4 columns)
20      2       t_infomask = 0x0800 (has null bitmap)
22      1       t_hoff = 24 (header is 24 bytes)
23      1       NULL bitmap = 0b0000 (no NULLs)
24      4       Column 1 (id): 00 00 00 01 (int4: 1)
28      4       Column 2 length header: 00 00 00 05 (5 chars)
32      5       Column 2 data: "Alice"
37      4       Column 3 length header: 00 00 00 12 (18 chars)
41      18      Column 3 data: "alice@example.com"
59      8       Column 4 (timestamp): 64-bit timestamp
\`\`\`

### MVCC Tuple Versions

\`\`\`
Same row, multiple versions:

accounts table (id=1):
| balance | xmin  | xmax  |
|---------|-------|-------|
|  1000   | 100   | 150   |  ← Old version (dead if xmax committed)
|   900   | 150   |   0   |  ← Current version

Physical storage:
Page 0:
  Item 1 → Tuple (balance=1000, xmin=100, xmax=150)
  Item 2 → Tuple (balance=900, xmin=150, xmax=0)

Transaction 160 SELECT:
├── Snapshot: xmax 160
├── Tuple 1: xmax=150 < 160 → invisible (updated)
└── Tuple 2: xmin=150 < 160, xmax=0 → visible

Transaction 140 SELECT:
├── Snapshot: xmax 140
├── Tuple 1: xmax=150 > 140 → visible (not yet updated)
└── Tuple 2: xmin=150 > 140 → invisible (future)

Dead tuple detection (VACUUM):
├── Tuple 1: xmax=150 committed
├── All active snapshots > 150
└── Tuple 1 can be reclaimed

Tuple header flags (t_infomask):
#define HEAP_XMIN_COMMITTED      0x0100  // xmin committed
#define HEAP_XMIN_INVALID        0x0200  // xmin aborted
#define HEAP_XMAX_COMMITTED      0x0400  // xmax committed
#define HEAP_XMAX_INVALID        0x0800  // xmax aborted
#define HEAP_XMAX_IS_MULTI       0x1000  // xmax is multi-xact
#define HEAP_UPDATED             0x2000  // tuple updated

Visibility check avoids checking clog (commit log) by using hint bits.
\`\`\`

## TOAST — The Oversized-Attribute Storage Technique

\`\`\`
Problem: Large values exceed page size

PostgreSQL page: 8KB
Tuple header: 23 bytes
Maximum tuple size: ~8160 bytes
But user might insert 1MB text!

TOAST solution:
├── Compress large values (pglz or lz4)
├── If still > ~2KB, slice into chunks
├── Store chunks in separate TOAST table
└── Main tuple stores pointer to TOAST table

TOAST storage strategies (per column):
1. PLAIN - Never TOAST (for small fixed-size types like int)
2. EXTENDED - Compress, then TOAST if still large (default for TEXT)
3. EXTERNAL - TOAST without compression (for pre-compressed data)
4. MAIN - Compress but prefer keeping in-line (for frequently accessed)

Example:
CREATE TABLE posts (
    id INT,
    title TEXT,
    body TEXT  -- Large column
);

INSERT INTO posts VALUES (1, 'Hello', 'A' * 100000);  -- 100KB body

Physical storage:
Main table page:
  Tuple (id=1, title='Hello', body=TOAST_POINTER)

TOAST table (pg_toast_12345):
  Chunk 0: bytes 0-2000 of body
  Chunk 1: bytes 2001-4000 of body
  ...
  Chunk 49: bytes 98000-99999 of body

TOAST pointer structure:
typedef struct varatt_external {
    int32   va_rawsize;      // Original uncompressed size
    int32   va_extsize;      // External saved size (compressed)
    Oid     va_valueid;      // OID of TOAST table
    Oid     va_toastrelid;   // OID of TOAST relation
} varatt_external;

Accessing TOASTed data:
1. Read main tuple → find TOAST pointer
2. Read TOAST table (multiple pages for large values)
3. Decompress if compressed
4. Reconstruct original value

Performance impact:
├── Main table scan: Fast (skips large values)
├── SELECT body: Slower (reads TOAST table)
└── VACUUM: Must check TOAST table too
\`\`\`

### TOAST Compression

\`\`\`c
// PostgreSQL pglz compression (simple LZ variant)
// Achieves 2-10x compression on text

Compression example:
Original: "The quick brown fox jumps over the lazy dog. The quick brown fox..."
Compressed: "The quick brown fox jumps over the lazy dog. <ref:0,44>"
           (Reference to earlier occurrence)

TOAST chunk size: 2000 bytes (TOAST_MAX_CHUNK_SIZE)

Large INSERT flow:
1. Attempt inline storage
2. If > ~2KB after header: Compress with pglz
3. If still > threshold: Slice into 2KB chunks
4. Store chunks in TOAST table with chunk_id

TOAST table schema:
CREATE TABLE pg_toast_12345 (
    chunk_id OID,        -- Identifies which value
    chunk_seq INT,       -- Chunk number (0, 1, 2, ...)
    chunk_data BYTEA     -- Actual data (up to 2000 bytes)
);
CREATE INDEX ON pg_toast_12345 (chunk_id, chunk_seq);

Retrieving TOASTed value:
SELECT chunk_data FROM pg_toast_12345 
WHERE chunk_id = 98765 
ORDER BY chunk_seq;
-- Returns chunks in order, concatenate to reconstruct
\`\`\`

## MySQL InnoDB Tuple Format

\`\`\`
InnoDB uses different tuple format than PostgreSQL:

InnoDB COMPACT row format:

┌────────────────────────────────────────────────┐
│ Variable-length Field Lengths (1-2 bytes each) │
│ - Stores lengths of VARCHAR, TEXT, BLOB       │
├────────────────────────────────────────────────┤
│ NULL Flag Bitmap (1 bit per nullable column)  │
├────────────────────────────────────────────────┤
│ Record Header (5 bytes)                        │
│ ├── info_flags (4 bits) - deleted, min_rec    │
│ ├── n_owned (4 bits) - for page directory     │
│ ├── heap_no (13 bits) - slot number           │
│ ├── record_type (3 bits) - ordinary, node ptr │
│ └── next_record (16 bits) - offset to next    │
├────────────────────────────────────────────────┤
│ Hidden Columns (if not primary key)            │
│ ├── DB_TRX_ID (6 bytes) - Transaction ID      │
│ ├── DB_ROLL_PTR (7 bytes) - Undo log pointer  │
│ └── DB_ROW_ID (6 bytes) - Row ID (if no PK)   │
├────────────────────────────────────────────────┤
│ Column Data (fixed + variable length)         │
└────────────────────────────────────────────────┘

Key differences from PostgreSQL:
1. InnoDB stores rollback info (undo log pointer) in tuple
2. PostgreSQL stores it in separate clog + hint bits
3. InnoDB clustered index: data ordered by primary key
4. PostgreSQL heap: data in insertion order
\`\`\`

### InnoDB Overflow Pages (Like TOAST)

\`\`\`
InnoDB handles large values differently:

Small values (<= 40 bytes):
├── Stored inline in clustered index page
└── Fast access

Medium values (40 bytes - 16KB):
├── Stored inline if space available
└── Otherwise overflow to separate page

Large values (> 16KB):
├── First 768 bytes stored inline (prefix)
├── Rest in overflow pages (off-page storage)
└── Linked list of 16KB overflow pages

Example:
INSERT INTO posts VALUES (1, 'Title', 'A' * 100000);

Clustered index page:
  Row: (id=1, title='Title', body_prefix='AAA...AAA' (768 bytes), overflow_ptr)

Overflow pages:
  Page 1: 16KB of 'A's
  Page 2: 16KB of 'A's
  ...
  Page 6: Remaining 'A's

DYNAMIC row format (MySQL 5.7+):
├── Stores only 20-byte pointer inline
├── Full value in overflow pages
└── Saves space in clustered index

ROW_FORMAT options:
├── COMPACT - 768-byte prefix inline
├── DYNAMIC - 20-byte pointer inline (default 5.7+)
├── COMPRESSED - DYNAMIC + page-level compression
└── REDUNDANT - Old format (5.0 and earlier)
\`\`\`

## Clustered vs Heap Tables

\`\`\`
InnoDB (Clustered Index):

CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

Physical layout (data sorted by id):
Page 1:
  Row: (id=1, name='Alice', email='alice@ex.com')
  Row: (id=5, name='Bob', email='bob@ex.com')
  Row: (id=10, name='Carol', email='carol@ex.com')

Secondary index on email:
Page 2:
  Entry: ('alice@ex.com', pk=1)
  Entry: ('bob@ex.com', pk=5)
  Entry: ('carol@ex.com', pk=10)

SELECT * FROM users WHERE email = 'bob@ex.com';
1. Search secondary index → find pk=5
2. Search clustered index with pk=5 → get row
(Two index lookups)

PostgreSQL (Heap Table):

Physical layout (insertion order):
Page 1:
  Tuple 1: (id=1, name='Alice', email='alice@ex.com')
  Tuple 2: (id=5, name='Bob', email='bob@ex.com')
  Tuple 3: (id=10, name='Carol', email='carol@ex.com')

Primary key index:
  Entry: (id=1, TID=(0,1))
  Entry: (id=5, TID=(0,2))
  Entry: (id=10, TID=(0,3))

Email index:
  Entry: ('alice@ex.com', TID=(0,1))
  Entry: ('bob@ex.com', TID=(0,2))
  Entry: ('carol@ex.com', TID=(0,3))

SELECT * FROM users WHERE email = 'bob@ex.com';
1. Search email index → find TID=(0,2)
2. Direct heap access at page 0, item 2 → get row
(One index lookup + direct tuple access)

Tradeoffs:
Clustered (InnoDB):
✓ Range scans on PK fast (data sequential)
✓ Secondary index smaller (stores PK, not TID)
✗ Secondary index lookup = 2 index searches
✗ UPDATE PK expensive (reorder data)

Heap (PostgreSQL):
✓ Secondary index lookup = 1 index + direct heap
✓ UPDATE any column same cost
✓ INSERT appends to heap (no reordering)
✗ Range scans may be random I/O
\`\`\`

## Row Store vs Column Store

\`\`\`
Row-oriented storage (traditional):

Table: sales (id, date, product, amount)

Disk layout (one row per tuple):
Page 1:
  [1, 2024-01-01, 'Widget', 100]
  [2, 2024-01-01, 'Gadget', 200]
  [3, 2024-01-02, 'Widget', 150]
  ...

Query: SELECT SUM(amount) FROM sales;
Must read ALL columns even though only need amount!

Column-oriented storage:

Disk layout (one column per file/segment):
id column:      [1, 2, 3, 4, 5, ...]
date column:    [2024-01-01, 2024-01-01, 2024-01-02, ...]
product column: ['Widget', 'Gadget', 'Widget', ...]
amount column:  [100, 200, 150, 175, 225, ...]

Query: SELECT SUM(amount) FROM sales;
Read ONLY amount column (skip id, date, product)!

Compression benefits:
amount column: [100, 200, 150, 175, 225, 250, 300, ...]
├── All same type (Int)
├── Often similar values
├── Run-length encoding: {100:1, 200:1, 150:1, ...}
└── Dictionary encoding: {100→0, 150→1, 175→2, 200→3, ...}
    Stored: [0, 3, 1, 2, 4, ...]

Compression ratio: 5-10x for columnar vs row store

Use cases:
Row store (OLTP):
├── SELECT * (need all columns)
├── INSERT/UPDATE single rows
└── Fast point lookups

Column store (OLAP):
├── Aggregate queries (SUM, AVG, COUNT)
├── Scan millions of rows, few columns
└── Data warehousing, analytics

Examples:
Row: PostgreSQL, MySQL, SQL Server
Column: Redshift, BigQuery, ClickHouse, Parquet files
\`\`\`

### Columnar Compression — Run-Length Encoding

\`\`\`
Run-Length Encoding (RLE):

Original: [1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 3]
RLE:      [(1, 4), (2, 2), (3, 5)]
Savings: 11 values → 6 values (45% reduction)

Works best on sorted/grouped data:
SELECT region, SUM(sales) FROM orders GROUP BY region;

region column (sorted):
['East', 'East', 'East', ..., 'West', 'West', 'West', ...]
         ↓
RLE: [('East', 1000000), ('West', 500000), ...]
Massive compression!

Dictionary encoding:

product column:
['Widget', 'Gadget', 'Widget', 'Widget', 'Gadget', ...]

Dictionary:
0 → 'Widget'
1 → 'Gadget'

Encoded column:
[0, 1, 0, 0, 1, ...]
Original: 7 bytes × 1000000 = 7MB
Encoded: 2 bits × 1000000 = 250KB (28x compression!)

Bit packing:

amount column: [100, 200, 150, 175, 225, 250, 300]
Max value: 300 → requires 9 bits
Instead of 32 bits per int, use 9 bits!
Savings: 32 bits → 9 bits (3.5x compression)

ClickHouse uses all these techniques automatically.
\`\`\`

## Free Space Management

\`\`\`
Free Space Map (FSM) - PostgreSQL

Problem: Finding pages with free space for INSERT

Naive approach:
├── Scan all pages to find space
└── O(n) for table with n pages (terrible!)

FSM solution:
├── Separate file tracking free space per page
├── Tree structure (multiple levels)
├── Leaf nodes: free space per page (1 byte per page)
└── Internal nodes: max free space in subtree

FSM structure (for 1000-page table):

Level 2 (root):    [Max of level 1]
                          ↓
Level 1:           [Max of 10 pages] [Max of next 10] ...
                     ↓                  ↓
Level 0:           [255] [200] [100] [50] ... (free bytes)
                     ↓
Pages:            Page 0 has 255 bytes free
                  Page 1 has 200 bytes free
                  ...

INSERT requiring 150 bytes:
1. Check FSM root → max free = 255
2. Descend to level 1 node with 255
3. Descend to level 0 → find page 0 has 255 bytes
4. Insert into page 0
5. Update FSM: page 0 now has 105 bytes free

FSM update:
├── Update leaf (page 0: 255 → 105)
├── Update parent if max changed
└── O(log n) update time

FSM file size:
├── 1 byte per page in table
├── For 1GB table (8KB pages): 128K pages
├── FSM size: 128KB + tree overhead
└── Tiny compared to actual data!
\`\`\`

### Page Compaction (Defragmentation)

\`\`\`
Problem: Fragmented free space

Page state after multiple DELETEs:
┌────────────────────────────────────────────┐
│ Header                                     │
├────────────────────────────────────────────┤
│ Item pointers: [1][2][3][4][5]            │
│                 ↓  X  ↓  X  ↓             │
├────────────────────────────────────────────┤
│ Free (10 bytes)                            │
├────────────────────────────────────────────┤
│ Tuple 5 (50 bytes)                         │
├────────────────────────────────────────────┤
│ Free (30 bytes) ← Deleted tuple 4          │
├────────────────────────────────────────────┤
│ Tuple 3 (40 bytes)                         │
├────────────────────────────────────────────┤
│ Free (20 bytes) ← Deleted tuple 2          │
├────────────────────────────────────────────┤
│ Tuple 1 (60 bytes)                         │
└────────────────────────────────────────────┘

Total free: 10 + 30 + 20 = 60 bytes (fragmented!)
Largest contiguous: 30 bytes

INSERT 50 bytes → Won't fit! (need 50 contiguous)

Solution: Page compaction
1. Copy all live tuples to temporary buffer
2. Write back to page contiguously
3. Update item pointers

After compaction:
┌────────────────────────────────────────────┐
│ Header                                     │
├────────────────────────────────────────────┤
│ Item pointers: [1][3][5]                  │
│                 ↓  ↓  ↓                   │
├────────────────────────────────────────────┤
│ Free (60 bytes) ← Now contiguous!         │
├────────────────────────────────────────────┤
│ Tuple 5 (50 bytes)                         │
│ Tuple 3 (40 bytes)                         │
│ Tuple 1 (60 bytes)                         │
└────────────────────────────────────────────┘

PostgreSQL HOT (Heap-Only Tuples) optimization:
├── UPDATE without changing indexed columns
├── New tuple version on SAME page
├── No index update needed!
└── Significant performance win

Triggered by:
├── UPDATE that doesn't fit (page compaction)
├── VACUUM (page cleanup)
└── Explicit: VACUUM FULL (entire table rebuild)
\`\`\`

## Page Checksums — Detecting Corruption

\`\`\`
Problem: Silent data corruption (cosmic rays, disk errors)

PostgreSQL page checksum (enabled with initdb --data-checksums):

Checksum algorithm: CRC32C (Castagnoli)
├── Fast (hardware accelerated on modern CPUs)
├── Detects bit flips, torn pages
└── Stored in page header (pd_checksum)

Checksum calculation:
1. Zero out checksum field
2. CRC32C over entire 8KB page
3. Store result in pd_checksum

On page read:
1. Read page from disk
2. Recalculate CRC32C
3. Compare with stored checksum
4. If mismatch → PANIC: data corruption detected!

Checksum overhead:
├── Write: +1-2% CPU (checksum calculation)
├── Read: +1-2% CPU (checksum verification)
└── Worth it for data integrity!

Torn page detection:
├── Power failure during page write
├── Only first 4KB written, second 4KB old data
├── Checksum mismatch detects this
└── Recovery from WAL replay

MySQL InnoDB page checksum:
├── Older: InnoDB checksum (weak)
├── 5.7+: CRC32 (better)
└── 8.0+: CRC32C (fastest)
\`\`\`

Storage engines are where the rubber meets the road. Understanding page layout, tuple format, TOAST, and compression means understanding why databases perform the way they do. This is the foundation everything else builds on.`,

  fr: `# Moteurs de stockage — Où vivent réellement les données

Quand vous faites INSERT, où va la ligne ? Pas "dans la base de données" — OÙ sur le disque, dans quel format, avec quelle surcharge ?

## Stockage basé sur les pages

\`\`\`
Tout dans une base de données est en pages :

Page = Bloc de taille fixe (typiquement 4KB, 8KB, ou 16KB)

PostgreSQL : pages 8KB
MySQL InnoDB : pages 16KB
\`\`\`

## Structure de page slotted

\`\`\`
Layout de page PostgreSQL (8192 octets) :

│ En-tête de page (24 octets)
│ Pointeurs d'items
│ Espace libre
│ Tuples (données réelles)
\`\`\`

## TOAST

\`\`\`
Technique de stockage d'attributs surdimensionnés

Problème : Grandes valeurs dépassent taille page
Solution : Compresser et découper en morceaux
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "Why do databases use fixed-size pages (8KB, 16KB) instead of variable-size blocks?",
      options: [
        "Pages are easier to implement",
        "Aligns with OS page cache (4KB), disk sectors, buffer pool management — one I/O = one page",
        "Pages use less memory",
        "Pages are faster",
      ],
      correct: 1,
    },
    {
      question:
        "What is the purpose of item pointers (line pointers) in slotted page design?",
      options: [
        "To make pages faster",
        "Allow tuple deletion/defragmentation without changing tuple offsets — item pointers stay stable",
        "To save memory",
        "To compress data",
      ],
      correct: 1,
    },
    {
      question: "How does PostgreSQL TOAST handle a 100KB TEXT column?",
      options: [
        "Stores it directly in the page",
        "Compresses it, if still >2KB, slices into 2KB chunks stored in separate TOAST table",
        "Rejects the insert",
        "Stores it in memory",
      ],
      correct: 1,
    },
    {
      question:
        "What is the key difference between InnoDB clustered index and PostgreSQL heap storage?",
      options: [
        "InnoDB is faster",
        "InnoDB stores data sorted by primary key, PostgreSQL stores in insertion order — affects range scan performance",
        "PostgreSQL uses more memory",
        "InnoDB supports more rows",
      ],
      correct: 1,
    },
    {
      question: "Why do column stores achieve 5-10x compression vs row stores?",
      options: [
        "They use better algorithms",
        "Same-type values clustered together enable RLE, dictionary encoding, bit packing — homogeneous data compresses better",
        "They use less memory",
        "They're faster",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi les bases de données utilisent-elles des pages de taille fixe (8KB, 16KB) ?",
      options: [
        "Les pages sont plus faciles à implémenter",
        "S'aligne avec le cache de page OS (4KB), secteurs disque, gestion buffer pool — une I/O = une page",
        "Les pages utilisent moins de mémoire",
        "Les pages sont plus rapides",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est l'objectif des pointeurs d'items dans la conception slotted page ?",
      options: [
        "Rendre les pages plus rapides",
        "Permettre suppression/défragmentation de tuple sans changer les offsets de tuple — pointeurs d'items restent stables",
        "Économiser la mémoire",
        "Compresser les données",
      ],
      correct: 1,
    },
    {
      question:
        "Comment PostgreSQL TOAST gère-t-il une colonne TEXT de 100KB ?",
      options: [
        "La stocke directement dans la page",
        "La compresse, si toujours >2KB, découpe en morceaux 2KB stockés dans table TOAST séparée",
        "Rejette l'insertion",
        "La stocke en mémoire",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle est la différence clé entre index clustered InnoDB et stockage heap PostgreSQL ?",
      options: [
        "InnoDB est plus rapide",
        "InnoDB stocke données triées par clé primaire, PostgreSQL stocke dans ordre d'insertion",
        "PostgreSQL utilise plus de mémoire",
        "InnoDB supporte plus de lignes",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi les magasins colonnes obtiennent-ils une compression 5-10x vs magasins lignes ?",
      options: [
        "Ils utilisent de meilleurs algorithmes",
        "Valeurs de même type regroupées permettent RLE, encodage dictionnaire, bit packing",
        "Ils utilisent moins de mémoire",
        "Ils sont plus rapides",
      ],
      correct: 1,
    },
  ],
};
