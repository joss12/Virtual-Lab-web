export const content = {
  en: `# Storage Optimization

## Why Storage Optimization Matters

Storage is not just about saving disk space. Storage optimization directly impacts:

\`\`\`
Query performance:
  Less data on disk → fewer pages to read → faster queries
  Compressed data fits in buffer pool → higher cache hit rate
  Sequential I/O (compressed blocks) >> random I/O (uncompressed rows)

Write performance:
  Compressed writes → less data to disk → faster flushes
  But: CPU cost of compression/decompression

Cost:
  Cloud storage: $0.023/GB/month (S3)
  1TB uncompressed vs 100GB compressed: $10.58/month savings
  At petabyte scale: millions of dollars

Practical example:
  Facebook reported 60-70% storage reduction with Zstandard compression
  on their MySQL workloads — saving petabytes of storage
\`\`\`

## Compression Algorithms — The Spectrum

\`\`\`
Speed vs ratio tradeoff:

Algorithm     Compress   Decompress   Ratio    Use case
─────────────────────────────────────────────────────────
LZ4           400 MB/s   2,000 MB/s   ~2x      Hot data, real-time
Snappy        250 MB/s   1,500 MB/s   ~2x      Google default
Zstandard     100 MB/s   1,000 MB/s   ~3x      Warm data, general
ZLIB/gzip     25 MB/s    300 MB/s     ~4x      Cold data, backups
BZIP2         10 MB/s    100 MB/s     ~5x      Archives only
XZ/LZMA       5 MB/s     50 MB/s      ~6x      Maximum ratio

Numbers vary significantly by data type and content.
\`\`\`

### LZ4 — The Speed Champion

\`\`\`
LZ4 algorithm (simplified):
  Based on LZ77: find repeated byte sequences, replace with back-references
  
  Input:  "the cat sat on the mat the cat sat"
  Output: "the cat sat on the mat " [ref: -22, len=12]
          (reference: go back 22 bytes, copy 12 bytes)
  
  LZ4 specific design:
    Hash table: 4-byte hash → position of last occurrence
    Only looks backward up to 64KB (fits in L1 cache!)
    Match length coded in 4-bit literal → fast integer ops
    
  Why fast:
    Compression: hash lookup is O(1), no Huffman coding
    Decompression: memcpy of back-references — CPUs are very good at this
    SIMD acceleration: copy 16-32 bytes at once with SSE2/AVX

  Used by:
    PostgreSQL: default for TOAST compression (pg 14+, was pglz before)
    LZ4 frame format: ClickHouse, Spark, Kafka message compression
    RocksDB: L1-L3 compression (warm data)
\`\`\`

### Zstandard (Zstd) — The Balance Champion

\`\`\`
Zstandard innovations:
  1. Finite State Entropy (FSE): replaces Huffman coding
     Traditional Huffman: 1 bit per symbol minimum
     FSE: fractional bits per symbol → better compression
     FSE is as fast as Huffman to decode (table-driven, no branches)
  
  2. Long-range matching (--long mode):
     Window size up to 2GB (LZ4: 64KB, gzip: 32KB)
     Finds repetitions across much larger distances
     Critical for database WAL files (transactions repeat similar patterns)
  
  3. Dictionary training:
     Train on sample data → dictionary encodes common patterns
     Then compress new data using dictionary
     
     Without dictionary: small record (1KB) compresses poorly (too little redundancy)
     With dictionary: same record compresses 3-5x better
     
     Example: compress 1000 JSON records with same structure
       Without dict: {\"user_id\": 12345, \"action\": \"click\"} → 2:1 ratio
       With dict trained on JSON structure:
         dictionary knows: '{"user_id": ', '", "action": "', '"}' are common
         → 5:1 ratio on small records
     
     Used by: Facebook compressing small MySQL rows,
              Cloudflare compressing HTTP responses,
              RocksDB for SSTable compression

  4. Compression levels (-1 to 22):
     Level 1:  very fast, ~2.5x ratio (similar to LZ4 ratio, faster)
     Level 3:  default, ~3x ratio, good balance
     Level 19: slow, ~4.5x ratio
     Level 22: maximum, ~5x ratio (use for cold archives only)

\`\`\`

### Specialized Database Encodings

General compression (LZ4, Zstd) works on any data. Database-specific encodings exploit data structure for far better compression on specific column types:

**Run-Length Encoding (RLE):**
\`\`\`
Best for: sorted columns with many repeated values

Column "country" (sorted):
  US, US, US, US, US, FR, FR, FR, DE, DE, DE, DE, DE, DE, US, US

RLE encoded:
  (US, 5), (FR, 3), (DE, 6), (US, 2)  = 4 pairs

Compression ratio: 16 values → 8 values = 2x
For a column with 1000 consecutive US: 1000 values → 1 pair = 1000x!

Used by: Redshift, Vertica, Snowflake for sorted low-cardinality columns
         PostgreSQL does NOT use RLE (heap storage doesn't sort)
\`\`\`

**Dictionary Encoding:**
\`\`\`
Best for: low-cardinality string columns (country codes, status, category)

Column "status" (10M rows):
  'pending', 'completed', 'cancelled', 'pending', 'completed', ...

Dictionary: {'pending':0, 'completed':1, 'cancelled':2}

Encoded column: 0, 1, 2, 0, 1, 0, 0, 1, 2, 1, ...

Storage:
  Original: 10M × avg(8 bytes) = 80MB
  Encoded:  3 strings (24 bytes) + 10M × 1 byte = ~10MB
  Ratio: 8x compression

Benefits beyond compression:
  Comparison: compare integers (1 byte) not strings (8 bytes)
    WHERE status = 'completed' → WHERE encoded_status = 1
    Integer comparison: single CPU instruction
  Group by: group integers not strings
  SIMD: 64 bytes = 64 1-byte dictionary codes processed simultaneously

Used by: Apache Parquet, ORC, ClickHouse, Apache Arrow in-memory format
         RocksDB block-based dictionary compression
\`\`\`

**Delta Encoding:**
\`\`\`
Best for: monotonically increasing sequences (timestamps, auto-increment IDs)

Column "created_at" (Unix timestamps):
  1704067200, 1704067201, 1704067203, 1704067210, 1704067215

Delta encoded (differences):
  1704067200, 1, 2, 7, 5

Now apply variable-length integer encoding:
  1704067200 → 5 bytes (large first value)
  1, 2, 7, 5 → 1 byte each (small deltas)
  Total: 5 + 4 = 9 bytes vs 40 bytes original = 4.4x compression

For regular intervals (every second):
  1704067200, 1, 1, 1, 1, 1, 1, ...
  Delta-of-delta: 1704067200, 1, 0, 0, 0, 0, 0, ...
  Apply RLE: (1704067200, 1), (1, 1), (0, N) → incredible compression

Used by: InfluxDB (Gorilla paper), Prometheus, TimescaleDB for timestamps
         Parquet for timestamp columns
\`\`\`

**Bit Packing:**
\`\`\`
Best for: integers with limited range

Column "age" (0-150, fits in 8 bits):
  Standard storage: 32 bits per value
  Bit packed: 8 bits per value = 4x compression
  
Column "day_of_week" (0-6, fits in 3 bits):
  Standard storage: 32 bits per value
  Bit packed: 3 bits per value = 10x compression

SIMD-friendly packing (FOR — Frame Of Reference):
  Find min value in block: min = 100
  Subtract min from all values: delta = [0, 3, 7, 2, 5, ...]
  Bit pack deltas (only need bits for range 0 to max_delta)
  
  Example: 256 values in range [1000, 1100]
    Without FOR: 10 bits each (range 0-1023) = 320 bytes
    With FOR:    min=1000, deltas in range 0-100 → 7 bits each = 224 bytes
                 = 30% additional compression beyond bit packing

Used by: FastPFOR (integer compression library used in Elasticsearch inverted index),
         Apache Parquet, Snowflake
\`\`\`

## Columnar Storage — Compression Synergy

Column storage and compression are a perfect match:

\`\`\`
Row storage: row = [id, name, email, age, country, ...]
  In one block: many different columns, hard to find patterns
  LZ4 ratio: ~1.5-2x (low redundancy within one row)

Column storage: column = [country, country, country, ...]
  In one block: single column, many similar values
  LZ4 ratio: ~5-10x (high redundancy within one column)
  Dictionary ratio: ~8-50x for low-cardinality columns

Clickhouse compression example (real numbers):
  Table: 100GB uncompressed row data
  ClickHouse columnar + LZ4: 12GB (8x compression)
  ClickHouse columnar + Zstd level 3: 8GB (12x compression)
  ClickHouse columnar + Zstd + CODEC(Delta): 3GB (33x compression) for time-series

Apache Parquet compression:
  Encoding selection per column:
    integer columns:     DELTA_BINARY_PACKED
    string columns:      DICTIONARY (if low cardinality) or PLAIN
    timestamp columns:   DELTA_BINARY_PACKED
    boolean columns:     RLE_DICTIONARY (1 bit per value)
  Then: LZ4/Snappy/Zstd applied on top of encoding
  Result: 5-20x better than raw CSV
\`\`\`

## PostgreSQL Storage: TOAST

TOAST (The Oversized-Attribute Storage Technique) handles values larger than ~2KB in PostgreSQL:

\`\`\`
PostgreSQL page size: 8KB
Maximum row size: ~8KB (must fit on one page... usually)

TOAST mechanism:
  If a column value > ~2KB:
    1. Compress it (pglz or LZ4 algorithm)
    2. If still > 2KB after compression: store in TOAST table
       (separate table: pg_toast_<table_oid>)
    3. Original column stores: pointer {va_rawsize, va_extsize, va_valueid, va_toastrelid}

TOAST table structure:
  chunk_id:    which TOAST value
  chunk_seq:   chunk sequence number (TOAST splits large values into 2KB chunks)
  chunk_data:  actual data chunk (up to 2KB)
  
Large JSON (100KB):
  Row in main table: {pointer to TOAST}    (18 bytes)
  TOAST table: 50 chunks × 2KB = 100KB
  Access: SELECT large_json FROM t → 50 TOAST chunk reads

\`\`\`sql
-- Control TOAST behavior per column:
ALTER TABLE documents ALTER COLUMN content SET STORAGE EXTENDED;
-- EXTENDED: try to compress, then TOAST if needed (default for text/bytea)

ALTER TABLE documents ALTER COLUMN content SET STORAGE EXTERNAL;
-- EXTERNAL: TOAST without compression (for pre-compressed data like JPEG)

ALTER TABLE documents ALTER COLUMN content SET STORAGE MAIN;
-- MAIN: try to compress in-line, avoid TOAST if possible

ALTER TABLE documents ALTER COLUMN content SET STORAGE PLAIN;
-- PLAIN: never compress, never TOAST (for small fixed-size types like int)

-- Check TOAST table size:
SELECT pg_size_pretty(pg_total_relation_size('pg_toast.pg_toast_' || 'your_table'::regclass::oid));
\`\`\`

\`\`\`
TOAST performance implications:
  Accessing TOASTed column: extra lookup in TOAST table
  SELECT *: fetches ALL columns including large TOASTed ones → slow
  SELECT id, name: skips TOASTed columns → fast
  
  Best practice: never SELECT * on tables with large TEXT/JSONB/BYTEA columns
  Always SELECT only needed columns → avoid unnecessary TOAST decompression
\`\`\`

## Parquet — The Columnar File Format Standard

Apache Parquet is the de facto standard for analytical data storage (data lakes, Spark, Redshift Spectrum, BigQuery):

\`\`\`
File structure:
  [Row Group 1]  [Row Group 2]  [Row Group 3]  [Footer]
  
  Row Group: 128MB chunk of rows (configurable)
    [Column Chunk 1]  [Column Chunk 2]  ...  [Column Chunk N]
    
    Column Chunk: all values of one column within one row group
      [Page 1]  [Page 2]  [Page 3]  ...
      
      Page: 8KB-1MB compressed data unit
        Page header: min/max values, encoding, count
        Page data:   encoded + compressed values

Footer (at end of file):
  Schema: column names, types, nested structure
  Row group metadata: byte offsets, row counts, min/max per column chunk
  Column chunk metadata: encoding, compression, statistics

Why footer at end:
  Reading: seek to end → read footer size → read footer → access any column chunk
  No need to read entire file to know schema or access statistics
\`\`\`

### Parquet Column Statistics — Predicate Pushdown

\`\`\`
Every column chunk and page stores:
  min_value, max_value, null_count, distinct_count (optional)

Query: SELECT * FROM events WHERE event_date = '2024-06-15'

Without predicate pushdown:
  Read all 1000 row groups → filter → return matching rows
  I/O: read entire 500GB file

With predicate pushdown:
  For each row group, check footer statistics:
    Row group 1: event_date min=2024-01-01, max=2024-03-31 → SKIP (not in range)
    Row group 2: event_date min=2024-04-01, max=2024-06-30 → READ (might contain)
    Row group 3: event_date min=2024-07-01, max=2024-12-31 → SKIP (not in range)
  
  I/O: read 1 of 3 row groups → 33% of data read!
  For more granular date distribution: might read <1% of data

This is "partition pruning at file level" — fundamental to data lake performance.
Spark, Presto, DuckDB all implement this for Parquet files.
\`\`\`

## Bloom Filters for Storage

Used in Parquet, RocksDB, Elasticsearch to avoid reading data that definitely doesn't contain a value:

\`\`\`
Parquet bloom filters (added in Parquet 2.0):
  Per column chunk: bloom filter for all values in that chunk
  
  Query: SELECT * FROM events WHERE user_id = 'abc123'
  
  Without bloom filter:
    Must read every row group's user_id column chunk to check
    Even if user_id='abc123' appears in only 1 of 100 row groups
    → Read 100 column chunks
  
  With bloom filter:
    Check bloom filter in footer (in memory, tiny): "is 'abc123' in this chunk?"
    99 chunks: "DEFINITELY NOT HERE" → skip (no I/O!)
    1 chunk: "MAYBE HERE" → read chunk, find actual value
    → Read 1 of 100 column chunks

Bloom filter size vs false positive rate:
  10 bits/value: ~1% false positive rate
  20 bits/value: ~0.01% false positive rate
  
  1M values × 10 bits = 1.25MB bloom filter per column chunk
  In-memory: negligible. Savings: avoid reading 100MB column chunk.
\`\`\`

## Tiered Storage — Hot, Warm, Cold

\`\`\`
Cost per GB/month (AWS, 2024):
  EBS gp3 (NVMe SSD):   $0.08/GB  ← hot data
  EBS st1 (HDD):         $0.045/GB ← warm data
  S3 Standard:           $0.023/GB ← cold data
  S3 Glacier Instant:    $0.004/GB ← archive
  S3 Glacier Deep:       $0.00099/GB ← deep archive

For 100TB of time-series data:
  All on EBS gp3: $8,000/month
  6 months on EBS gp3 + 6 months on S3: $1,800/month → 78% savings

Database tiered storage implementations:

ClickHouse:
  TTL expressions move old data to different disks automatically:
  ALTER TABLE events
    MODIFY TTL
      created_at + INTERVAL 7 DAY TO DISK 'warm_disk',
      created_at + INTERVAL 30 DAY TO DISK 'cold_disk',
      created_at + INTERVAL 365 DAY DELETE;

TimescaleDB:
  SELECT add_retention_policy('metrics', INTERVAL '90 days');
  -- Auto-delete partitions older than 90 days
  
  -- Move old chunks to S3 (Timescale Cloud feature):
  SELECT add_tiering_policy('metrics', INTERVAL '7 days');

PostgreSQL + pg_partman:
  Partition by date → old partitions → tablespace on cheap storage
  ALTER TABLE events_2023 SET TABLESPACE slow_storage;
\`\`\`

## Compression in Practice — Configuration Guide

\`\`\`sql
-- PostgreSQL: column-level compression (PG 14+)
ALTER TABLE messages ALTER COLUMN body SET COMPRESSION lz4;
ALTER TABLE documents ALTER COLUMN content SET COMPRESSION pglz;  -- legacy
-- LZ4: faster, less compression. pglz: slower, more compression.

-- PostgreSQL: check compression ratios
SELECT 
  attname,
  attstorage,
  attcompression
FROM pg_attribute
JOIN pg_class ON pg_class.oid = pg_attribute.attrelid
WHERE pg_class.relname = 'messages';
\`\`\`

\`\`\`
-- RocksDB compression configuration (CockroachDB, TiKV):
options.compression_per_level = {
  kNoCompression,    // L0: hot, frequently rewritten → no compression
  kNoCompression,    // L1: still hot
  kLZ4Compression,   // L2: warm data → LZ4 (fast)
  kLZ4Compression,   // L3
  kZSTD,             // L4: cold data → Zstd (better ratio)
  kZSTD,             // L5
  kZSTD,             // L6: coldest → best ratio
};

// Dictionary compression for better ratio on small values:
options.bottommost_compression = kZSTD;
options.bottommost_compression_opts.enabled = true;
options.bottommost_compression_opts.max_dict_bytes = 112640;  // 110KB dictionary
options.bottommost_compression_opts.zstd_max_train_bytes = 1048576;  // 1MB training
\`\`\`

\`\`\`
Compression strategy guide:

Data type                 → Encoding            → Compression
──────────────────────────────────────────────────────────────
Timestamps (regular)      → Delta-of-Delta       → LZ4
Timestamps (irregular)    → Delta                → LZ4
Auto-increment IDs        → Delta                → LZ4
Low-cardinality strings   → Dictionary           → LZ4
High-cardinality strings  → None (or front-coding)→ Zstd
Floating point            → XOR (Gorilla)         → LZ4
Booleans                  → RLE                  → (already tiny)
Binary blobs              → None (pre-compressed) → None (or LZ4 fast)
JSON                      → Dictionary (keys)    → Zstd + dict training
\`\`\`
`,

  fr: `# Optimisation du stockage

## Algorithmes de compression — Le spectre

\`\`\`
Compromis vitesse vs taux :

Algorithme    Compression  Décompression  Ratio   Cas d'utilisation
──────────────────────────────────────────────────────────────────
LZ4           400 Mo/s     2 000 Mo/s     ~2x     Données chaudes, temps réel
Snappy        250 Mo/s     1 500 Mo/s     ~2x     Par défaut Google
Zstandard     100 Mo/s     1 000 Mo/s     ~3x     Données tièdes, général
ZLIB/gzip     25 Mo/s      300 Mo/s       ~4x     Données froides, sauvegardes
\`\`\`

## Encodages spécialisés de bases de données

**Encodage Run-Length (RLE) :**
\`\`\`
Colonne "pays" (triée) :
  US, US, US, US, US, FR, FR, FR, DE, DE, DE

RLE encodé :
  (US, 5), (FR, 3), (DE, 3) = 3 paires vs 11 valeurs = 3.7x compression
\`\`\`

**Encodage par dictionnaire :**
\`\`\`
Colonne "statut" (10M lignes) :
  Dictionnaire : {'pending':0, 'completed':1, 'cancelled':2}
  
  Original : 10M × avg(8 octets) = 80 Mo
  Encodé :   3 chaînes + 10M × 1 octet = ~10 Mo
  Ratio : 8x compression + comparaisons entières plus rapides
\`\`\`

**Encodage delta :**
\`\`\`
Colonne "created_at" (timestamps Unix) :
  1704067200, 1704067201, 1704067203, 1704067210

Delta encodé :
  1704067200, 1, 2, 7  → entiers variables → 4.4x compression
\`\`\`

## TOAST PostgreSQL

\`\`\`sql
-- Contrôler le comportement TOAST par colonne :
ALTER TABLE documents ALTER COLUMN content SET STORAGE EXTENDED;
-- EXTENDED : essayer de compresser, puis TOAST si nécessaire (défaut)

ALTER TABLE documents ALTER COLUMN content SET STORAGE EXTERNAL;
-- EXTERNAL : TOAST sans compression (pour données pré-compressées)

-- Vérifier la taille de la table TOAST :
SELECT pg_size_pretty(pg_total_relation_size(
  'pg_toast.pg_toast_' || 'votre_table'::regclass::oid));

-- Impact performance :
-- SELECT * avec colonnes TOASTed : lectures supplémentaires TOAST → lent
-- SELECT id, name (pas de colonnes TOASTed) : rapide
-- Meilleure pratique : toujours SELECT uniquement les colonnes nécessaires
\`\`\`

## Parquet — Le standard de format de fichier columnar

\`\`\`
Structure du fichier :
  [Groupe de lignes 1] [Groupe de lignes 2] [Pied de page]
  
  Pied de page (à la fin du fichier) :
    Schéma, décalages d'octets, statistiques min/max par chunk de colonne

Statistiques de colonne Parquet — Pushdown de prédicat :
  Pour chaque chunk de colonne : min_value, max_value, null_count
  
  Requête : SELECT * FROM events WHERE event_date = '2024-06-15'
  
  Sans pushdown : lire tous les groupes de lignes → 500 Go I/O
  
  Avec pushdown :
    Groupe 1 : event_date min=2024-01-01, max=2024-03-31 → PASSER
    Groupe 2 : event_date min=2024-04-01, max=2024-06-30 → LIRE
    Groupe 3 : event_date min=2024-07-01, max=2024-12-31 → PASSER
    I/O : 33% des données lues !
\`\`\`

## Stockage en niveaux — Chaud, Tiède, Froid

\`\`\`
Coût par Go/mois (AWS, 2024) :
  EBS gp3 (SSD NVMe) :   0,08$/Go  ← données chaudes
  EBS st1 (HDD) :         0,045$/Go ← données tièdes
  S3 Standard :           0,023$/Go ← données froides
  S3 Glacier Deep :       0,00099$/Go ← archive profonde

Pour 100 To de données de séries temporelles :
  Tout sur EBS gp3 : 8 000$/mois
  6 mois EBS gp3 + 6 mois S3 : 1 800$/mois → 78% d'économies

ClickHouse TTL :
  ALTER TABLE events
    MODIFY TTL
      created_at + INTERVAL 7 DAY TO DISK 'warm_disk',
      created_at + INTERVAL 30 DAY TO DISK 'cold_disk',
      created_at + INTERVAL 365 DAY DELETE;
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "Why does dictionary encoding achieve much better compression than general algorithms like LZ4 for low-cardinality string columns?",
      options: [
        "Dictionary encoding uses a more advanced mathematical algorithm than LZ4",
        "Dictionary encoding replaces repeated string values with small integer codes — for a 'status' column with 3 values across 10M rows, strings averaging 8 bytes become 1-byte integers (8x compression). Beyond compression, integer comparisons are single CPU instructions vs string comparisons, enabling SIMD processing of 64 values simultaneously.",
        "Dictionary encoding is faster because it skips the compression step entirely",
        "LZ4 cannot compress strings, only binary data — dictionary encoding fills this gap",
      ],
      correct: 1,
    },
    {
      question:
        "What is Zstandard's dictionary training feature and why does it dramatically improve compression of small records?",
      options: [
        "Dictionary training teaches Zstandard to recognize SQL keywords for better compression",
        "General compression finds redundancy within a single record — a 1KB JSON record has little internal redundancy to exploit. Dictionary training analyzes thousands of sample records to build a shared dictionary of common patterns (JSON keys, repeated field structures). New records are compressed relative to this dictionary, achieving 3-5x better ratios on small records by exploiting cross-record redundancy.",
        "Zstandard dictionary training reduces CPU usage by pre-computing compression tables",
        "Dictionary training enables Zstandard to compress data without storing the original",
      ],
      correct: 1,
    },
    {
      question:
        "How does Parquet's footer metadata enable predicate pushdown and why is this fundamental to data lake performance?",
      options: [
        "The footer stores pre-computed aggregations that replace the need to read actual data",
        "Parquet stores min/max statistics for every column chunk in the footer (readable without reading data). A query filtering on event_date can check each row group's min/max — if the filter value is outside [min, max], the entire row group is skipped with zero I/O. For highly selective filters, this can reduce I/O from 100% to <1% of the file, making petabyte-scale analytical queries feasible.",
        "The footer contains a B-tree index that maps filter values directly to matching rows",
        "Predicate pushdown works by compressing filtered-out data more aggressively",
      ],
      correct: 1,
    },
    {
      question:
        "Why is PostgreSQL's TOAST mechanism necessary and what are its performance implications?",
      options: [
        "TOAST is a caching layer that stores frequently accessed large values in memory",
        "PostgreSQL pages are 8KB — values larger than ~2KB would prevent efficient paging. TOAST compresses large values and stores overflow chunks in a separate table. The performance implication: accessing a TOASTed column requires extra reads from the TOAST table. SELECT * on tables with large TEXT/JSONB/BYTEA columns reads all TOAST data unnecessarily — always SELECT only needed columns.",
        "TOAST encrypts sensitive data before storing it on disk",
        "TOAST is required for replication — large values cannot be sent through the WAL directly",
      ],
      correct: 1,
    },
    {
      question:
        "Why does columnar storage achieve dramatically better compression ratios than row storage for analytical workloads?",
      options: [
        "Columnar storage uses a proprietary compression algorithm not available for row storage",
        "In row storage, a page contains many different columns with varied types and values — little redundancy within a block. In columnar storage, a block contains values of a single column — adjacent values are the same type, often similar or identical (country codes, status values, timestamps). This homogeneity enables specialized encodings (dictionary, delta, RLE) achieving 5-50x compression vs 1.5-2x for row storage.",
        "Columnar storage skips NULL values which are the primary source of wasted space",
        "Columnar storage uses larger page sizes which improves compression algorithm efficiency",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi l'encodage par dictionnaire atteint-il une bien meilleure compression que les algorithmes généraux comme LZ4 pour les colonnes de chaînes à faible cardinalité ?",
      options: [
        "L'encodage par dictionnaire utilise un algorithme mathématique plus avancé que LZ4",
        "L'encodage par dictionnaire remplace les valeurs de chaînes répétées par de petits codes entiers — pour une colonne 'statut' avec 3 valeurs sur 10M lignes, les chaînes de 8 octets en moyenne deviennent des entiers d'1 octet (8x compression). De plus, les comparaisons d'entiers sont des instructions CPU uniques vs comparaisons de chaînes, permettant le traitement SIMD de 64 valeurs simultanément.",
        "L'encodage par dictionnaire est plus rapide car il saute entièrement l'étape de compression",
        "LZ4 ne peut pas compresser les chaînes, seulement les données binaires",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce que la fonctionnalité d'entraînement de dictionnaire de Zstandard et pourquoi améliore-t-elle considérablement la compression des petits enregistrements ?",
      options: [
        "L'entraînement du dictionnaire apprend à Zstandard à reconnaître les mots-clés SQL",
        "La compression générale trouve la redondance dans un seul enregistrement — un enregistrement JSON de 1 Ko a peu de redondance interne. L'entraînement du dictionnaire analyse des milliers d'enregistrements pour construire un dictionnaire partagé de motifs communs. Les nouveaux enregistrements sont compressés par rapport à ce dictionnaire, atteignant 3-5x de meilleurs ratios sur les petits enregistrements.",
        "L'entraînement du dictionnaire réduit l'utilisation CPU en précalculant les tables de compression",
        "L'entraînement du dictionnaire permet à Zstandard de compresser sans stocker l'original",
      ],
      correct: 1,
    },
    {
      question:
        "Comment les métadonnées de pied de page de Parquet permettent-elles le pushdown de prédicat ?",
      options: [
        "Le pied de page stocke des agrégations pré-calculées qui remplacent la lecture des données",
        "Parquet stocke les statistiques min/max pour chaque chunk de colonne dans le pied de page (lisible sans lire les données). Une requête filtrant sur event_date peut vérifier le min/max de chaque groupe de lignes — si la valeur du filtre est hors de [min, max], le groupe entier est ignoré sans I/O. Pour les filtres très sélectifs, cela réduit l'I/O de 100% à <1% du fichier.",
        "Le pied de page contient un index B-tree qui mappe les valeurs de filtre aux lignes",
        "Le pushdown de prédicat fonctionne en compressant plus agressivement les données filtrées",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi le mécanisme TOAST de PostgreSQL est-il nécessaire et quelles sont ses implications de performance ?",
      options: [
        "TOAST est une couche de cache qui stocke les grandes valeurs fréquemment accédées en mémoire",
        "Les pages PostgreSQL font 8 Ko — les valeurs > ~2 Ko empêcheraient un paging efficace. TOAST compresse les grandes valeurs et stocke les chunks de débordement dans une table séparée. Implication performance : accéder à une colonne TOASTed nécessite des lectures supplémentaires. SELECT * sur des tables avec TEXT/JSONB/BYTEA larges lit toutes les données TOAST inutilement — toujours SELECT uniquement les colonnes nécessaires.",
        "TOAST chiffre les données sensibles avant de les stocker",
        "TOAST est requis pour la réplication — les grandes valeurs ne peuvent pas être envoyées via WAL",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi le stockage columnar atteint-il des taux de compression bien meilleurs que le stockage en lignes pour les charges analytiques ?",
      options: [
        "Le stockage columnar utilise un algorithme de compression propriétaire non disponible pour le stockage en lignes",
        "Dans le stockage en lignes, une page contient de nombreuses colonnes différentes — peu de redondance. Dans le stockage columnar, un bloc contient les valeurs d'une seule colonne — les valeurs adjacentes sont du même type, souvent similaires ou identiques (codes pays, valeurs de statut). Cette homogénéité permet des encodages spécialisés (dictionnaire, delta, RLE) atteignant 5-50x de compression vs 1.5-2x pour le stockage en lignes.",
        "Le stockage columnar saute les valeurs NULL qui sont la principale source d'espace gaspillé",
        "Le stockage columnar utilise des pages plus grandes qui améliorent l'efficacité des algorithmes",
      ],
      correct: 1,
    },
  ],
};
