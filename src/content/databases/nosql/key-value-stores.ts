export const content = {
  en: `# Key-Value Stores

## What Is a Key-Value Store?

The simplest possible data model: a dictionary at massive scale. Every value is stored and retrieved by a unique key. No schema, no joins, no secondary indexes (in the pure model).

\`\`\`
Operations:
  PUT(key, value)   → store value
  GET(key)          → retrieve value
  DELETE(key)       → remove key
  SCAN(start, end)  → range scan (ordered stores only)

Nothing else. That's the entire API.
\`\`\`

The simplicity is the point. Without schema enforcement, query planning, or join processing, key-value stores can achieve throughput and latency that relational databases cannot match.

## RocksDB — The Engine Behind Everything

RocksDB is an embeddable key-value store developed by Facebook (now Meta), forked from Google's LevelDB. It is not a standalone database — it's a C++ library you embed in your application, the same way SQLite is embedded.

What makes RocksDB significant: it is the storage engine inside **CockroachDB, TiKV, MyRocks (MySQL), MongoRocks, Kafka Streams, and dozens of other systems**. Understanding RocksDB means understanding the storage layer of half the modern database world.

## LSM Tree — The Core Data Structure

RocksDB is built on a **Log-Structured Merge Tree (LSM Tree)**. This is fundamentally different from B-trees.

### The Write Path — Why LSM Trees Are Fast for Writes

\`\`\`
Write request: PUT("user:42", "{name: Alice}")
                    ↓
            1. Write to WAL (append-only, sequential I/O)
                    ↓
            2. Write to MemTable (in-memory sorted structure, usually a skip list)
                    ↓
            Return success to caller

Disk I/O: ONE sequential WAL append. That's it.
No random I/O. No B-tree page splits. No page reads.
\`\`\`

Compare to B-tree write:
\`\`\`
B-tree write:
  1. Read the target leaf page into memory (random I/O)
  2. Modify the page
  3. Write the modified page back (random I/O)
  4. Potentially split the page (more random I/O)
  5. Update parent pages (more random I/O)
\`\`\`

LSM tree writes are **write-optimized**. B-trees are **read-optimized**.

### MemTable → SSTable Pipeline

\`\`\`
                    Writes
                      ↓
               [ MemTable ]  ← in-memory sorted buffer (skip list)
               (4MB - 64MB)
                      ↓ when full
               [ Immutable MemTable ] ← frozen, being flushed
                      ↓ flush to disk
               [ SSTable L0 ]  ← Sorted String Table, immutable file
               [ SSTable L0 ]
               [ SSTable L0 ]
                      ↓ compaction
               [ SSTable L1 ]  ← larger, sorted, no overlapping key ranges
               [ SSTable L2 ]
               [ SSTable L3 ]  ← largest level
\`\`\`

**SSTable (Sorted String Table):**
\`\`\`
SSTable file layout:
  [ Data Blocks ]     ← sorted key-value pairs, compressed
  [ Index Block ]     ← one entry per data block: last key → block offset
  [ Filter Block ]    ← Bloom filter for this file
  [ Meta Index ]
  [ Footer ]          ← offsets to index and filter blocks

Each SSTable is IMMUTABLE once written. Never modified, only compacted away.
\`\`\`

### The Read Path — Why LSM Trees Are Slower for Reads

To read a key, RocksDB must check:
\`\`\`
1. Active MemTable           (memory, fast)
2. Immutable MemTable(s)     (memory, fast)
3. L0 SSTables               (disk, must check ALL L0 files — they can overlap)
4. L1 SSTables               (disk, binary search on key range)
5. L2 SSTables               (disk)
... down to the last level

Worst case: key doesn't exist → check EVERY level → very expensive
\`\`\`

This is why Bloom filters are critical.

## Bloom Filters

A Bloom filter is a **probabilistic data structure** that answers: "Is this key definitely NOT in this SSTable?"

\`\`\`
Properties:
  False negatives: IMPOSSIBLE — if key is in the SSTable, Bloom filter says YES
  False positives: POSSIBLE   — Bloom filter might say YES but key is not there
  Space: ~10 bits per key for ~1% false positive rate

Read path with Bloom filters:
  For each SSTable:
    1. Check Bloom filter → "DEFINITELY NOT HERE" → skip file entirely (no disk I/O!)
    2. "MAYBE HERE" → check index block → check data block (disk I/O)

Result: non-existent keys cost almost nothing (just Bloom filter checks in memory)
        existing keys cost 1-2 disk reads (index + data block)
\`\`\`

\`\`\`
Bloom filter internals:
  Bit array of size m, k hash functions

  ADD key:
    hash1(key) % m → set bit
    hash2(key) % m → set bit
    ... k times

  CHECK key:
    hash1(key) % m → bit set? no → DEFINITELY NOT PRESENT
    hash2(key) % m → bit set? no → DEFINITELY NOT PRESENT
    all bits set?  →              MAYBE PRESENT (check SSTable)
\`\`\`

## Compaction Strategies

Dead entries (deleted or overwritten keys) accumulate in SSTables. Compaction merges SSTables, removes dead entries, and reorganizes levels.

### Leveled Compaction (default in RocksDB)

\`\`\`
L0: small files, can overlap in key space, written by flush
L1: 10x larger than L0, non-overlapping key ranges, one file per key range
L2: 10x larger than L1
...

When L0 has too many files → compact L0 into L1
  Pick all L0 files + overlapping L1 files → merge-sort → write new L1 files

When L1 exceeds size limit → compact one L1 file into L2
  Pick one L1 file + overlapping L2 files → merge-sort → write new L2 files

Read amplification:  low (non-overlapping at L1+, binary search)
Write amplification: high (data written multiple times across levels)
Space amplification: low (dead entries cleaned up aggressively)
\`\`\`

### Tiered Compaction (Universal Compaction in RocksDB)

\`\`\`
Instead of levels, maintain sorted runs of similar size.
When too many runs of similar size → merge them into one larger run.

Read amplification:  high (must check all runs)
Write amplification: low (data written fewer times)
Space amplification: high (dead entries live longer)

Best for: write-heavy workloads where read latency is less critical
\`\`\`

### FIFO Compaction

\`\`\`
No compaction at all — just delete oldest files when size limit exceeded.
Use case: time-series data where old data expires, keys are never updated.
\`\`\`

## Write Amplification

A critical concept for SSDs. Every logical write results in multiple physical writes as data moves through compaction levels.

\`\`\`
Write amplification factor (WAF) = bytes written to disk / bytes written by app

Leveled compaction WAF: 10-30x
  Write 1GB of data → 10-30GB written to disk across compaction levels

SSD endurance: rated in terabytes written (TBW)
A 1TB SSD rated at 600TBW with WAF=30:
  600TBW / 30 WAF = 20TB of actual application writes before SSD wears out

Facebook reported 10-30x WAF in early RocksDB, then tuned to 3-10x.
\`\`\`

## RocksDB Configuration Knobs

\`\`\`cpp
Options options;

// MemTable size — larger = fewer flushes, more memory
options.write_buffer_size = 64 * 1024 * 1024;  // 64MB

// Number of MemTables (one active + immutables being flushed)  
options.max_write_buffer_number = 3;

// L1 target size
options.max_bytes_for_level_base = 256 * 1024 * 1024;  // 256MB

// Level multiplier (each level is this many times larger)
options.max_bytes_for_level_multiplier = 10;

// Compression per level
options.compression_per_level = {
  kNoCompression,    // L0: no compression (hot data, frequently rewritten)
  kNoCompression,    // L1
  kLZ4Compression,   // L2+: LZ4 for speed
  kLZ4Compression,
  kZSTD,             // L5+: ZSTD for ratio (cold data)
  kZSTD,
};

// Bloom filter — bits per key (more bits = fewer false positives)
BlockBasedTableOptions table_options;
table_options.filter_policy.reset(NewBloomFilterPolicy(10));  // 1% FP rate
\`\`\`

## SSTables and Compression

\`\`\`
Compression algorithms used in key-value stores:

Snappy:  fast compression/decompression, moderate ratio (~2x)
         Google's default, latency-sensitive workloads

LZ4:     faster than Snappy, similar or better ratio
         RocksDB default for warm data

Zstandard (ZSTD): slower than LZ4, much better ratio (~3-5x)
                   RocksDB default for cold/archive data
                   Supports training dictionaries for small record compression

\`\`\`

\`\`\`
Dictionary compression for small values:
  Normal compression of a 100-byte JSON record: poor ratio (little redundancy within one record)
  Dictionary compression: build a dictionary from 100 sample records,
                          use dictionary patterns to compress new records
  Result: 5-10x better compression on small records
\`\`\`

## Point Lookup vs Range Scan Performance

\`\`\`
Point lookup (GET single key):
  LSM: MemTable → Bloom filters → binary search on 1-2 SSTables → 1-2 disk reads
  B-tree: binary search down tree → 3-5 disk reads (tree height)
  Winner: similar, LSM slightly faster on SSD due to smaller read amplification

Range scan (SCAN from key1 to key2):
  LSM: merge-read multiple SSTables at each level (all levels contribute)
  B-tree: traverse to first key, then sequential read of leaf pages
  Winner: B-tree dramatically faster for range scans
\`\`\`

This is why databases like RocksDB add **column families** and **prefix bloom filters** to improve range scan performance — but the B-tree still wins for range-heavy workloads.

## Real-World Key-Value Stores Built on RocksDB

\`\`\`
TiKV (TiDB's storage layer):
  Distributed key-value store, Raft consensus, MVCC on top of RocksDB
  Each Raft region is a RocksDB instance

CockroachDB:
  Distributed SQL, each node runs a RocksDB instance
  Keys encode table/index/row info, values encode column data

MyRocks (MySQL + RocksDB):
  Facebook's MySQL storage engine replacing InnoDB for certain workloads
  50% space reduction vs InnoDB on Facebook's UDB (User Database)
  Trade-off: worse range scan performance

Kafka:
  Log segments are append-only files (same principle as LSM WAL)
  Index files map offset → file position (similar to SSTable index)
\`\`\`
`,

  fr: `# Stores Clé-Valeur

## Qu'est-ce qu'un store clé-valeur ?

Le modèle de données le plus simple possible : un dictionnaire à grande échelle. Chaque valeur est stockée et récupérée par une clé unique.

\`\`\`
Opérations :
  PUT(clé, valeur)   → stocker la valeur
  GET(clé)           → récupérer la valeur
  DELETE(clé)        → supprimer la clé
  SCAN(début, fin)   → scan de plage (stores ordonnés uniquement)
\`\`\`

## RocksDB — Le moteur derrière tout

RocksDB est un store clé-valeur embarquable développé par Facebook, forké de LevelDB de Google. C'est le moteur de stockage de **CockroachDB, TiKV, MyRocks, et des dizaines d'autres systèmes**.

## LSM Tree — La structure de données centrale

RocksDB est construit sur un **Log-Structured Merge Tree (LSM Tree)**. Fondamentalement différent des B-trees.

### Le chemin d'écriture — Pourquoi les LSM Trees sont rapides en écriture

\`\`\`
Requête d'écriture : PUT("user:42", "{name: Alice}")
                          ↓
            1. Écrire dans le WAL (append-only, I/O séquentiel)
                          ↓
            2. Écrire dans le MemTable (structure triée en mémoire)
                          ↓
            Retourner succès à l'appelant

I/O disque : UN seul append WAL séquentiel. C'est tout.
Pas d'I/O aléatoire. Pas de divisions de pages B-tree.
\`\`\`

### Pipeline MemTable → SSTable

\`\`\`
                    Écritures
                        ↓
               [ MemTable ]  ← buffer trié en mémoire
                        ↓ quand plein
               [ SSTable L0 ]  ← fichier immuable sur disque
               [ SSTable L0 ]
                        ↓ compaction
               [ SSTable L1 ]  ← plus grand, trié, plages non chevauchantes
               [ SSTable L2 ]
               [ SSTable L3 ]  ← niveau le plus grand
\`\`\`

### Le chemin de lecture

Pour lire une clé, RocksDB doit vérifier :
\`\`\`
1. MemTable actif           (mémoire, rapide)
2. MemTable(s) immuable(s)  (mémoire, rapide)
3. SSTables L0              (disque, tous les fichiers L0 peuvent se chevaucher)
4. SSTables L1              (disque, recherche binaire sur la plage de clés)
5. SSTables L2              (disque)
... jusqu'au dernier niveau
\`\`\`

C'est pourquoi les filtres de Bloom sont critiques.

## Filtres de Bloom

Un filtre de Bloom est une **structure de données probabiliste** qui répond : "Cette clé est-elle DÉFINITIVEMENT ABSENTE de ce SSTable ?"

\`\`\`
Propriétés :
  Faux négatifs : IMPOSSIBLES — si la clé est dans le SSTable, réponse OUI
  Faux positifs : POSSIBLES   — peut dire OUI mais la clé n'est pas là
  Espace : ~10 bits par clé pour ~1% de taux de faux positifs

Avec les filtres de Bloom :
  Clé absente → presque aucun coût (juste vérifications en mémoire)
  Clé présente → 1-2 lectures disque (bloc d'index + bloc de données)
\`\`\`

## Stratégies de compaction

### Compaction par niveaux (défaut RocksDB)

\`\`\`
L0 → L1 → L2 → ... chaque niveau est 10x plus grand que le précédent
Plages de clés non chevauchantes au L1 et au-delà

Amplification en lecture :  faible
Amplification en écriture : élevée (données écrites plusieurs fois)
Amplification en espace :   faible
\`\`\`

### Compaction universelle

\`\`\`
Maintenir des runs triés de taille similaire.
Quand trop de runs de taille similaire → les fusionner.

Amplification en lecture :  élevée
Amplification en écriture : faible
Meilleur pour : charges intensives en écriture
\`\`\`

## Amplification en écriture

\`\`\`
Facteur d'amplification en écriture (WAF) = octets écrits sur disque / octets écrits par l'app

Compaction par niveaux WAF : 10-30x
  Écrire 1 Go de données → 10-30 Go écrits sur disque lors des compactions

Endurance SSD : notée en téraoctets écrits (TBW)
SSD 1 To noté 600 TBW avec WAF=30 :
  600 TBW / 30 WAF = 20 To d'écritures applicatives réelles avant usure du SSD
\`\`\`

## Lookup de point vs scan de plage

\`\`\`
Lookup de point (GET clé unique) :
  LSM : MemTable → filtres de Bloom → 1-2 lectures disque
  B-tree : 3-5 lectures disque (hauteur de l'arbre)
  Gagnant : similaire

Scan de plage (SCAN de clé1 à clé2) :
  LSM : lecture fusionnée de plusieurs SSTables à chaque niveau
  B-tree : traversée vers la première clé, puis lecture séquentielle
  Gagnant : B-tree largement plus rapide pour les scans de plage
\`\`\`

## Stores clé-valeur réels construits sur RocksDB

\`\`\`
TiKV (couche de stockage de TiDB) :
  Store clé-valeur distribué, consensus Raft, MVCC au-dessus de RocksDB

CockroachDB :
  SQL distribué, chaque nœud exécute une instance RocksDB

MyRocks (MySQL + RocksDB) :
  Réduction d'espace de 50% vs InnoDB sur la base utilisateurs de Facebook
  Compromis : moins bonnes performances de scan de plage
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "Why are LSM tree writes faster than B-tree writes on SSDs?",
      options: [
        "LSM trees compress data before writing, reducing total bytes",
        "LSM tree writes are a single sequential WAL append and MemTable update — no random I/O, no page reads, no splits. B-trees require random reads and writes to modify existing pages.",
        "LSM trees use larger pages which require fewer I/O operations",
        "LSM trees cache all writes in memory and never write to disk immediately",
      ],
      correct: 1,
    },
    {
      question: "What is the role of a Bloom filter in an LSM tree read path?",
      options: [
        "It compresses SSTable data blocks to reduce disk reads",
        "It sorts keys within an SSTable for binary search",
        "It answers 'is this key definitely NOT in this SSTable?' — allowing the read path to skip entire SSTable files without any disk I/O for non-existent keys",
        "It tracks which keys have been recently accessed for caching",
      ],
      correct: 2,
    },
    {
      question: "What is write amplification and why does it matter for SSDs?",
      options: [
        "Write amplification is when multiple clients write the same key simultaneously",
        "Write amplification is the ratio of bytes written to disk vs bytes written by the application — compaction causes data to be written multiple times, consuming SSD write endurance (TBW rating)",
        "Write amplification is when WAL entries are duplicated for redundancy",
        "Write amplification is the CPU overhead of compressing data before writes",
      ],
      correct: 1,
    },
    {
      question: "Why do LSM trees perform worse than B-trees for range scans?",
      options: [
        "LSM trees do not support range scans at all",
        "LSM trees encrypt range scan results, adding CPU overhead",
        "Range scans must merge-read data from multiple SSTables across all levels simultaneously, while B-trees store data in sequential leaf pages enabling efficient sequential I/O",
        "LSM trees cannot sort keys, so range results must be sorted after retrieval",
      ],
      correct: 2,
    },
    {
      question:
        "What is the key architectural difference between leveled and tiered (universal) compaction in RocksDB?",
      options: [
        "Leveled compaction uses Bloom filters; tiered compaction does not",
        "Leveled compaction maintains non-overlapping key ranges per level with high write amplification but low space amplification; tiered compaction merges similar-sized runs with low write amplification but high space amplification",
        "Leveled compaction stores data in memory; tiered compaction stores on disk",
        "Leveled compaction supports transactions; tiered compaction does not",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi les écritures LSM tree sont-elles plus rapides que les écritures B-tree sur SSD ?",
      options: [
        "Les LSM trees compressent les données avant l'écriture, réduisant le total d'octets",
        "Les écritures LSM tree sont un seul append WAL séquentiel et une mise à jour MemTable — pas d'I/O aléatoire, pas de lectures de pages, pas de divisions. Les B-trees nécessitent des lectures et écritures aléatoires pour modifier les pages existantes.",
        "Les LSM trees utilisent des pages plus grandes nécessitant moins d'opérations I/O",
        "Les LSM trees mettent en cache toutes les écritures en mémoire et n'écrivent jamais immédiatement sur disque",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est le rôle d'un filtre de Bloom dans le chemin de lecture d'un LSM tree ?",
      options: [
        "Il compresse les blocs de données SSTable pour réduire les lectures disque",
        "Il trie les clés dans un SSTable pour la recherche binaire",
        "Il répond 'cette clé est-elle DÉFINITIVEMENT ABSENTE de ce SSTable ?' — permettant au chemin de lecture de sauter des fichiers SSTable entiers sans I/O disque pour les clés inexistantes",
        "Il suit les clés récemment accédées pour le cache",
      ],
      correct: 2,
    },
    {
      question:
        "Qu'est-ce que l'amplification en écriture et pourquoi est-elle importante pour les SSD ?",
      options: [
        "L'amplification en écriture se produit quand plusieurs clients écrivent la même clé simultanément",
        "L'amplification en écriture est le ratio d'octets écrits sur disque vs octets écrits par l'application — la compaction fait que les données sont écrites plusieurs fois, consommant l'endurance en écriture du SSD (notation TBW)",
        "L'amplification en écriture est quand les entrées WAL sont dupliquées pour la redondance",
        "L'amplification en écriture est la surcharge CPU de compression des données avant les écritures",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi les LSM trees sont-ils moins performants que les B-trees pour les scans de plage ?",
      options: [
        "Les LSM trees ne supportent pas du tout les scans de plage",
        "Les LSM trees chiffrent les résultats de scan de plage, ajoutant une surcharge CPU",
        "Les scans de plage doivent fusionner-lire des données de plusieurs SSTables sur tous les niveaux simultanément, tandis que les B-trees stockent les données dans des pages feuilles séquentielles permettant un I/O séquentiel efficace",
        "Les LSM trees ne peuvent pas trier les clés, donc les résultats de plage doivent être triés après récupération",
      ],
      correct: 2,
    },
    {
      question:
        "Quelle est la différence architecturale clé entre la compaction par niveaux et la compaction universelle dans RocksDB ?",
      options: [
        "La compaction par niveaux utilise des filtres de Bloom ; la compaction universelle non",
        "La compaction par niveaux maintient des plages de clés non chevauchantes par niveau avec une forte amplification en écriture mais faible en espace ; la compaction universelle fusionne des runs de taille similaire avec une faible amplification en écriture mais forte en espace",
        "La compaction par niveaux stocke les données en mémoire ; la compaction universelle sur disque",
        "La compaction par niveaux supporte les transactions ; la compaction universelle non",
      ],
      correct: 1,
    },
  ],
};
