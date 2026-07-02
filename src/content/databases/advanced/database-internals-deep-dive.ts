export const content = {
  en: `# Database Internals Deep Dive

## The Hardware Reality

Database internals cannot be understood without understanding the hardware they run on. Every architectural decision in a storage engine is a direct response to hardware constraints.

\`\`\`
Memory hierarchy (2024 approximate numbers):
  L1 cache:    ~1ns    per access,   32-64KB  per core
  L2 cache:    ~4ns    per access,   256-512KB per core
  L3 cache:    ~10ns   per access,   8-32MB   shared
  DRAM:        ~100ns  per access,   GBs-TBs
  NVMe SSD:    ~100μs  per access,   TBs
  SATA SSD:    ~500μs  per access,   TBs
  HDD:         ~10ms   per access,   TBs-PBs

Ratios (L1=1):
  L1    : 1x
  L2    : 4x
  L3    : 10x
  DRAM  : 100x
  NVMe  : 100,000x
  HDD   : 10,000,000x

Every cache miss is expensive. Every disk access is catastrophically expensive.
A database that causes 1 extra disk seek per query at 10,000 QPS:
  10,000 × 10ms = 100 seconds of disk time per second
  → Impossible. Must use memory hierarchy correctly.
\`\`\`

## Page Checksums — Detecting Silent Corruption

Storage devices lie. HDDs, SSDs, and even DRAM silently corrupt data. A bit flip in a database page can corrupt rows in ways that are invisible to the application for months.

\`\`\`
Types of storage corruption:
  Bit rot:        magnetic decay on HDD, charge leakage on SSD
  Write tearing:  power loss mid-write → partial page on disk
  Misdirected write: firmware bug writes page to wrong location
  Read disturb:   reading SSD cell too many times disturbs neighbors
  DRAM bit flip:  cosmic rays, voltage fluctuations (ECC RAM mitigates this)

Frequency:
  Consumer SSDs: 1 uncorrectable error per 10^14 bits read (100 TB)
  Enterprise SSDs: 1 uncorrectable error per 10^17 bits read (100 PB)
  HDDs: 1 uncorrectable error per 10^14-10^15 bits read
  At 10GB/s throughput: consumer SSD gets undetected error every ~3 hours!
\`\`\`

### PostgreSQL Page Checksums

\`\`\`
PostgreSQL page checksum (enabled with initdb --data-checksums):

Page layout with checksum:
  Offset 0-7:   PageHeaderData (includes checksum field at offset 8)
  Offset 8-9:   pd_checksum (16-bit checksum of entire page)
  Offset 10+:   rest of page data

Checksum algorithm: FNV-1a variant
  seed = checksum_version * UINT64CONST(0x114acadb)
  for each 8-byte word in page:
    seed ^= word
    seed *= UINT64CONST(0x2545f4914f6cdd1d)
  checksum = fold_xor(seed)  // XOR high and low 32 bits

On read:
  Recompute checksum
  Compare to stored checksum
  If mismatch: ERROR — PANIC — server shuts down

\`\`\`sql
-- Check if checksums are enabled
SHOW data_checksums;
-- or
SELECT pg_catalog.current_setting('data_checksums');

-- Enable checksums on existing cluster (PostgreSQL 12+):
-- Must stop server first:
pg_checksums --enable -D /var/lib/postgresql/data
-- Warning: reads every page — takes hours for large clusters
\`\`\`

\`\`\`
Cost of checksums:
  Every page read: ~1-2% CPU overhead (checksum computation)
  Every page write: ~1-2% CPU overhead
  Total impact: typically <5% performance overhead
  Worth it: corruption detection is priceless
\`\`\`

## fsync — The Durability Guarantee

fsync() is the syscall that flushes OS page cache to durable storage. Without it, "written" data exists only in the OS buffer cache — a kernel crash or power failure loses it.

\`\`\`
Write path without fsync:
  Database: write page to OS page cache (fast, microseconds)
  OS: "OK, written" (it's in RAM, not on disk yet)
  Database: return success to client ← CLIENT THINKS IT'S DURABLE
  Power failure: OS RAM lost → data gone

Write path with fsync:
  Database: write page to OS page cache
  Database: fsync(fd) → kernel flushes all dirty pages to disk
              (this is slow — waits for disk to confirm)
  Disk: confirms write → fsync() returns
  Database: return success to client ← NOW actually durable
\`\`\`

\`\`\`c
// Linux syscalls for durability:

fsync(fd):
  Flush all data and metadata for file fd to disk
  Waits until disk confirms write
  Most thorough but slowest

fdatasync(fd):
  Flush data only (not metadata like atime, mtime)
  Faster than fsync — most databases use this
  Sufficient for durability (metadata not needed for recovery)

sync():
  Flush ALL dirty pages system-wide to disk
  Expensive — affects all files, not just database

msync(addr, len, MS_SYNC):
  Flush memory-mapped region to disk
  Used when database uses mmap() instead of read/write
  PostgreSQL avoids mmap for database files (but uses it for pg_wal)

O_DIRECT | O_SYNC (open flags):
  O_DIRECT: bypass OS page cache entirely (DMA directly to disk)
  O_SYNC:   every write() call automatically fsynced
  Used by: databases that want full control of caching
\`\`\`

### fsync Lies — The Scary Truth

\`\`\`
Some storage devices lie about fsync:
  Consumer SSDs: many ignore fsync and return immediately
                 (write still in SSD's volatile write cache)
  External drives: USB drives frequently lie about fsync
  RAID controllers: battery-backed write cache makes fsync safe,
                    but non-battery-backed cache can lose data

Testing fsync honesty:
  https://github.com/nicowillis/diskcheck
  pgbench with fsync=on and simulate power failure
  
Real incident: PostgreSQL WAL corruption
  2018: some Linux kernel versions had a bug where fsync errors
        on ext4 were silently swallowed
  A failed fsync returned success → WAL appeared written → wasn't
  Database reported durability → crash → WAL corrupted → data loss
  Fix: PostgreSQL now re-reads WAL after writing to detect silent failures

Performance of fsync:
  NVMe SSD:  ~100μs per fsync
  SATA SSD:  ~500μs per fsync
  HDD:       ~10ms per fsync
  
  At 1000 TPS with one fsync per transaction:
    NVMe:  1000 × 100μs = 100ms disk time/sec → feasible
    HDD:   1000 × 10ms  = 10 seconds disk time/sec → impossible!
    → HDD can only sustain ~100 durable transactions/sec
    → NVMe can sustain ~10,000 durable transactions/sec
\`\`\`

## O_DIRECT — Bypassing the OS Page Cache

\`\`\`
Normal I/O path:
  Database → write() → OS page cache → (async) → disk
  Database → read()  → OS page cache → return  (if cached)
                                     → disk read (if not cached)

  Problem: database has its own cache (buffer pool).
           OS page cache is a SECOND cache on top.
           Double caching wastes RAM, causes coherence issues.

O_DIRECT I/O path:
  Database → write() → disk (bypassing OS cache)
  Database → read()  → disk (bypassing OS cache)
  
  Database manages its own cache entirely.
  OS doesn't cache these pages → more RAM for database buffer pool.

\`\`\`

\`\`\`c
// Opening file with O_DIRECT:
int fd = open("/var/lib/postgresql/data/base/16384/1259",
              O_RDWR | O_DIRECT | O_SYNC);

// O_DIRECT requirements:
// 1. Buffer must be aligned to 512-byte boundary (or 4096 on some systems)
// 2. Offset must be aligned to 512 bytes
// 3. Length must be multiple of 512 bytes
// Databases use aligned memory allocators to satisfy these requirements

// PostgreSQL uses O_DIRECT for WAL on Linux when:
//   wal_sync_method = open_datasync  (default on Linux)
//   or open_sync
\`\`\`

\`\`\`
Who uses O_DIRECT:
  InnoDB: uses O_DIRECT by default (innodb_flush_method = O_DIRECT)
  PostgreSQL: uses O_DIRECT for WAL, not for data files
              (uses OS page cache for data, relies on shared_buffers)
  Oracle: uses O_DIRECT for all I/O in production configurations
  
Who does NOT use O_DIRECT:
  SQLite: uses OS page cache entirely
  Many databases on macOS: F_NOCACHE instead (macOS equivalent)
  
Benchmark: O_DIRECT vs buffered for sequential writes:
  Buffered:  2GB/s (OS batches writes, uses write-combining)
  O_DIRECT:  1GB/s (each write goes directly, less batching)
  → Buffered faster for sequential, O_DIRECT better for random
\`\`\`

## mmap vs read/write — The Great Debate

\`\`\`
read()/write() approach (PostgreSQL, InnoDB):
  Database explicitly reads pages into buffer pool
  Database explicitly writes dirty pages to disk
  Database controls what's in memory (LRU/clock-sweep eviction)
  
  Advantages:
    Explicit control: database knows exactly what's cached
    Can implement own eviction policy
    Works correctly with O_DIRECT
    Predictable behavior under memory pressure

  Disadvantages:
    Extra copy: disk → OS cache → buffer pool (two copies!)
    (O_DIRECT eliminates OS cache copy)
    System call overhead per read/write

mmap() approach (early MongoDB/MMAP engine, LMDB, some embedded DBs):
  Database maps file directly into virtual address space
  Reads: just access memory (OS handles page faults, loads from disk)
  Writes: just write to memory (OS handles flushing)
  
  Advantages:
    Zero-copy reads (no memcpy from OS cache to buffer pool)
    Simpler code (no explicit buffer management)
    OS handles read-ahead and eviction
    
  Disadvantages:
    No control over eviction (OS decides what to evict)
    Under memory pressure: OS can evict pages database needs → stall
    mmap with many threads: page table locks become bottleneck
    Cannot use O_DIRECT (mmap and O_DIRECT are incompatible)
    msync() for durability is slower than fdatasync() in some kernels
    
Why PostgreSQL doesn't use mmap for data files:
  "The mmap approach has serious problems with crash recovery,
   particularly when used with O_DIRECT or when the file is larger
   than the available physical memory."
   — PostgreSQL documentation
\`\`\`

## Write Amplification in Storage Engines

\`\`\`
Write amplification (WA) = bytes written to storage / bytes written by application

Sources of write amplification:
  1. WAL/journal: every write → WAL entry + actual page write = 2x minimum
  2. B-tree splits: inserting one row → rewrite multiple pages
  3. Checkpointing: dirty pages flushed → pages written again
  4. LSM compaction: data rewritten multiple times across levels
  5. MVCC dead tuples: dead versions accumulate → VACUUM rewrites pages
  6. Doublewrite buffer (InnoDB): every page written twice

Measuring write amplification:
  iostat -x 1  # Watch kB_wrtn/s vs application write rate
  
  PostgreSQL:
    SELECT sum(blks_written) FROM pg_stat_bgwriter;  -- pages written
    SELECT sum(tup_inserted + tup_updated + tup_deleted) FROM pg_stat_user_tables;
    WA ≈ blks_written * 8192 / (logical_writes * avg_row_size)

Typical WA by engine:
  PostgreSQL:  3-10x  (WAL + VACUUM + checkpoint)
  InnoDB:      5-15x  (WAL + doublewrite + compaction)
  RocksDB:     10-30x (WAL + LSM compaction, tunable)
  B-tree SSD:  10-50x (update-in-place causes SSD-level WA)
  
SSD wear and WA:
  1TB NVMe SSD rated 600TBW (terabytes written)
  Application writes 10GB/day at WA=20x:
    Actual SSD writes: 200GB/day
    SSD life: 600,000GB / 200GB = 3,000 days ≈ 8 years
  Application writes 10GB/day at WA=100x:
    Actual SSD writes: 1TB/day
    SSD life: 600 days ≈ 1.6 years → SSD replacement needed!
\`\`\`

## Buffer Pool Internals

\`\`\`
PostgreSQL shared_buffers internals:

Buffer descriptor (one per buffer):
  struct BufferDesc {
    BufferTag   tag;        // which page is this? (relfilenode, forknum, blocknum)
    int         buf_id;     // buffer pool index
    pg_atomic_uint32 state; // pin count, dirty flag, usage count, valid flag
    LWLock      content_lock; // protects buffer content
    LWLock      io_in_progress_lock; // protects I/O on this buffer
    ...
  };

State field (32 bits):
  bits 0-17:   refcount (how many backends have this pinned)
  bits 18-22:  usage count (0-5, for clock-sweep)
  bit 23:      dirty (needs write to disk)
  bit 24:      valid (contains real data)
  bit 25:      tag_valid (tag is valid)

Clock-sweep eviction algorithm:
  victim = clock_hand
  loop:
    if buffer[victim].usage_count > 0:
      buffer[victim].usage_count--   // decrement, give second chance
      victim = (victim + 1) % num_buffers
    else if buffer[victim].is_pinned():
      victim = (victim + 1) % num_buffers  // someone using it, skip
    else:
      // Evict this buffer
      if buffer[victim].dirty:
        write to disk (bgwriter usually handles this)
      return victim
\`\`\`

\`\`\`
InnoDB buffer pool internals:

LRU list (modified LRU):
  New sublist (5/8 of pool):  recently accessed pages
  Old sublist (3/8 of pool):  cold pages, eviction candidates
  
  New page loaded: inserted at midpoint (head of old sublist)
  Page accessed again in < innodb_old_blocks_time (1 second):
    Move to head of new sublist ("young")
  Page NOT accessed in old sublist → evicted when needed

Free list:  empty buffer frames ready for use
Flush list: dirty pages ordered by oldest modification LSN
  bgwriter flushes oldest-modified pages to disk
  Checkpoint: flush all pages with LSN ≤ checkpoint_LSN

Buffer pool instances (MySQL 5.5+):
  Multiple independent buffer pools
  Reduces lock contention on LRU list mutex
  Default: 8 instances for large buffer pools
  Each instance has own LRU list, free list, flush list
\`\`\`

## Huge Pages — OS Memory Management

\`\`\`
Normal pages: 4KB
Huge pages:   2MB (Linux), 1GB ("gigantic pages")

Why huge pages matter for databases:
  PostgreSQL shared_buffers = 32GB
  Normal pages: 32GB / 4KB = 8,388,608 page table entries
  Huge pages:   32GB / 2MB = 16,384 page table entries
  
  Page table entries use kernel memory (not included in shared_buffers)
  Huge pages reduce TLB pressure (Translation Lookaside Buffer)
  
  TLB miss cost: ~100ns (must walk page table in memory)
  TLB has ~1500 entries on modern CPUs
  8M page table entries: TLB miss rate very high for random access
  16K page table entries: TLB miss rate negligible
  
  Result: 10-30% performance improvement on large buffer pools!

PostgreSQL huge pages configuration:
  # postgresql.conf
  huge_pages = on    # require huge pages (fail if unavailable)
  huge_pages = try   # use if available, fall back to normal
  huge_pages = off   # never use

  # Linux: allocate huge pages
  echo 16384 > /proc/sys/vm/nr_hugepages
  # or persistent:
  echo "vm.nr_hugepages = 16384" >> /etc/sysctl.conf

  # Check huge page usage:
  grep -i huge /proc/meminfo
  # HugePages_Total: 16384
  # HugePages_Free:  256   ← most are in use
  # HugePages_Rsvd:  0
\`\`\`
`,

  fr: `# Internals des bases de données en profondeur

## La réalité matérielle

\`\`\`
Hiérarchie mémoire :
  Cache L1 :   ~1ns,    32-64 Ko  par cœur
  Cache L2 :   ~4ns,    256-512 Ko par cœur
  Cache L3 :   ~10ns,   8-32 Mo   partagé
  DRAM :       ~100ns,  Go-To
  SSD NVMe :   ~100μs,  To
  HDD :        ~10ms,   To-Po

Ratios (L1=1) :
  L1 → L2 → L3 → DRAM → NVMe → HDD
   1 →  4 →  10 →  100 → 100K → 10M

Chaque miss de cache est coûteux. Chaque accès disque est catastrophiquement coûteux.
\`\`\`

## Checksums de pages — Détecter la corruption silencieuse

\`\`\`
Types de corruption de stockage :
  Bit rot :         dégradation magnétique HDD, fuite de charge SSD
  Write tearing :   panne de courant en milieu d'écriture → page partielle
  Misdirected write : bug firmware écrit page au mauvais endroit
  Bit flip DRAM :   rayons cosmiques, fluctuations de tension

Fréquence :
  SSD grand public : 1 erreur non corrigeable par 10^14 bits lus (100 To)
  À 10 Go/s de débit : erreur non détectée toutes les ~3 heures !
\`\`\`

\`\`\`sql
-- Activer les checksums (PostgreSQL 12+) :
pg_checksums --enable -D /var/lib/postgresql/data

-- Coût : ~1-2% overhead CPU en lecture/écriture
-- Vaut le coup : détection de corruption est sans prix
\`\`\`

## fsync — La garantie de durabilité

\`\`\`
Chemin d'écriture sans fsync :
  Base de données → écriture dans le cache de pages OS (rapide, microsecondes)
  OS : "OK, écrit" (c'est en RAM, pas sur disque encore)
  Panne de courant : RAM OS perdue → données perdues

Chemin d'écriture avec fsync :
  Base de données → écriture dans le cache de pages OS
  Base de données : fsync(fd) → le noyau vide les pages sales sur disque
  Disque : confirme l'écriture → fsync() retourne
  Base de données → retourner succès au client ← MAINTENANT réellement durable

Performance de fsync :
  SSD NVMe :  ~100μs par fsync
  SSD SATA :  ~500μs par fsync
  HDD :       ~10ms  par fsync
  
  À 1000 TPS avec un fsync par transaction :
    HDD :  1000 × 10ms = 10 secondes de temps disque/sec → impossible !
    → HDD peut soutenir ~100 transactions durables/sec seulement
    → NVMe peut soutenir ~10 000 transactions durables/sec
\`\`\`

## O_DIRECT — Contourner le cache de pages OS

\`\`\`
Chemin I/O normal :
  Base de données → write() → cache de pages OS → (async) → disque
  Problème : double cache (OS + pool de buffers de la DB) → gaspillage RAM

Chemin I/O O_DIRECT :
  Base de données → write() → disque (contournant le cache OS)
  La base de données gère entièrement son propre cache.

Qui utilise O_DIRECT :
  InnoDB : par défaut (innodb_flush_method = O_DIRECT)
  PostgreSQL : pour le WAL uniquement
  Oracle : pour tous les I/O en configuration production
\`\`\`

## Amplification en écriture

\`\`\`
Amplification en écriture (AE) = octets écrits sur stockage / octets écrits par l'app

Sources d'amplification en écriture :
  1. WAL/journal : chaque écriture → entrée WAL + page réelle = 2x minimum
  2. Divisions B-tree : insertion d'une ligne → réécriture de plusieurs pages
  3. Checkpointing : pages sales vidées → pages réécrites
  4. Compaction LSM : données réécrites plusieurs fois entre niveaux
  5. Tuples morts MVCC : versions mortes s'accumulent → VACUUM réécrit les pages

AE typique par moteur :
  PostgreSQL :  3-10x
  InnoDB :      5-15x
  RocksDB :     10-30x

Usure SSD et AE :
  SSD NVMe 1 To noté 600 TBW
  Application écrit 10 Go/jour à AE=20x :
    Écritures SSD réelles : 200 Go/jour
    Durée de vie SSD : 600 000 Go / 200 Go = 3 000 jours ≈ 8 ans
  Application écrit 10 Go/jour à AE=100x :
    Écritures SSD réelles : 1 To/jour
    Durée de vie SSD : 600 jours ≈ 1,6 ans → remplacement SSD nécessaire !
\`\`\`

## Huge Pages — Gestion mémoire OS

\`\`\`
Pages normales : 4 Ko
Huge pages :    2 Mo (Linux)

Pourquoi les huge pages sont importantes :
  shared_buffers PostgreSQL = 32 Go
  Pages normales : 32 Go / 4 Ko = 8 388 608 entrées de table de pages
  Huge pages :     32 Go / 2 Mo = 16 384 entrées de table de pages
  
  Les huge pages réduisent la pression sur le TLB
  Résultat : amélioration des performances de 10-30% sur les grands pools de buffers !

Configuration PostgreSQL :
  # postgresql.conf
  huge_pages = on    # exiger les huge pages
  huge_pages = try   # utiliser si disponible, sinon pages normales
  
  # Linux : allouer des huge pages
  echo 16384 > /proc/sys/vm/nr_hugepages
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "Why do database storage engines use checksums on every page, and what is the typical performance cost?",
      options: [
        "Checksums compress page data before writing, reducing storage requirements by 10-20%",
        "Storage devices silently corrupt data through bit rot, write tearing, misdirected writes, and DRAM bit flips — consumer SSDs get one undetectable error per 100TB read. Checksums detect these corruptions by recomputing on every read and comparing. The cost is typically <5% CPU overhead, well worth the corruption detection.",
        "Checksums are required by POSIX standards for all file system writes",
        "Checksums replace the need for RAID by detecting and correcting single-bit errors"
      ],
      correct: 1,
    },
    {
      question: "Why does a hard disk drive fundamentally limit durable transaction throughput to ~100 TPS regardless of query complexity?",
      options: [
        "HDDs have limited IOPS due to their rotational speed (typically 7200 RPM)",
        "Durable transactions require fsync() which waits for disk confirmation. HDDs take ~10ms per fsync. At 1000 TPS: 1000 × 10ms = 10 seconds of disk time per second — physically impossible. Maximum durable TPS ≈ 1s / 10ms = 100 TPS. NVMe SSDs (100μs fsync) enable ~10,000 durable TPS.",
        "HDDs cannot handle more than 100 concurrent connections",
        "HDDs use mechanical heads that can only write sequentially, limiting transaction throughput"
      ],
      correct: 1,
    },
    {
      question: "What is the key tradeoff between mmap() and read()/write() for database I/O, and why do most production databases prefer read()/write()?",
      options: [
        "mmap() is faster for small files; read()/write() is faster for large files",
        "mmap() is zero-copy and simpler but gives the OS full control of eviction — under memory pressure the OS can evict pages the database needs causing stalls, and page table locks become bottlenecks with many threads. read()/write() lets the database implement its own eviction policy (LRU/clock-sweep) with predictable behavior, though it requires an extra copy from OS cache to buffer pool.",
        "mmap() only works on Linux; read()/write() works cross-platform",
        "mmap() cannot be used with compressed data; read()/write() supports any format"
      ],
      correct: 1,
    },
    {
      question: "Why do huge pages (2MB) improve database performance compared to normal pages (4KB) for large buffer pools?",
      options: [
        "Huge pages store more data per page, reducing the number of disk reads needed",
        "A 32GB buffer pool requires 8 million 4KB page table entries but only 16,384 2MB huge page entries. The TLB (Translation Lookaside Buffer) has ~1500 entries — with 8M page table entries, TLB miss rate is very high for random access (each miss costs ~100ns and requires a page table walk). Huge pages reduce TLB pressure dramatically, yielding 10-30% performance gains.",
        "Huge pages use hardware encryption acceleration not available for normal pages",
        "Huge pages bypass the OS scheduler, giving database processes higher CPU priority"
      ],
      correct: 1,
    },
    {
      question: "What is write amplification and why does high write amplification on SSDs cause premature hardware failure?",
      options: [
        "Write amplification causes duplicate data to be stored, consuming extra disk space",
        "Write amplification = bytes written to storage / bytes written by application. Sources include WAL entries, B-tree splits, compaction, MVCC dead tuples. SSDs have a finite TBW (TeraBytes Written) rating — at 20x write amplification, 10GB/day of app writes becomes 200GB/day of actual SSD writes. At 100x amplification, a 1TB SSD rated for 600TBW fails in 1.6 years instead of 8 years.",
        "Write amplification only affects HDDs, not SSDs which have no wear limit",
        "Write amplification is caused by RAID controllers duplicating writes across disks"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Pourquoi les moteurs de stockage de bases de données utilisent-ils des checksums sur chaque page, et quel est le coût de performance typique ?",
      options: [
        "Les checksums compressent les données de page avant l'écriture, réduisant les besoins de stockage de 10-20%",
        "Les dispositifs de stockage corrompent silencieusement les données par bit rot, write tearing et bit flips DRAM — les SSD grand public ont une erreur non détectable par 100 To lus. Les checksums détectent ces corruptions en recalculant à chaque lecture. Le coût est typiquement <5% d'overhead CPU, bien justifié par la détection de corruption.",
        "Les checksums sont requis par les standards POSIX pour toutes les écritures système de fichiers",
        "Les checksums remplacent le besoin de RAID en détectant et corrigeant les erreurs sur un bit"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi un disque dur limite-t-il fondamentalement le débit de transactions durables à ~100 TPS indépendamment de la complexité des requêtes ?",
      options: [
        "Les HDDs ont des IOPS limitées en raison de leur vitesse de rotation (typiquement 7200 RPM)",
        "Les transactions durables nécessitent fsync() qui attend la confirmation du disque. Les HDDs prennent ~10ms par fsync. À 1000 TPS : 1000 × 10ms = 10 secondes de temps disque par seconde — physiquement impossible. TPS durables maximum ≈ 1s / 10ms = 100 TPS. Les SSD NVMe (100μs fsync) permettent ~10 000 TPS durables.",
        "Les HDDs ne peuvent pas gérer plus de 100 connexions simultanées",
        "Les HDDs utilisent des têtes mécaniques qui ne peuvent écrire que séquentiellement"
      ],
      correct: 1,
    },
    {
      question: "Quel est le compromis clé entre mmap() et read()/write() pour les I/O de base de données ?",
      options: [
        "mmap() est plus rapide pour les petits fichiers ; read()/write() pour les grands fichiers",
        "mmap() est zero-copy et plus simple mais donne à l'OS le contrôle total de l'éviction — sous pression mémoire l'OS peut évincer des pages dont la DB a besoin, causant des blocages. read()/write() laisse la DB implémenter sa propre politique d'éviction (LRU/clock-sweep) avec un comportement prévisible.",
        "mmap() ne fonctionne que sur Linux ; read()/write() fonctionne cross-platform",
        "mmap() ne peut pas être utilisé avec des données compressées"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi les huge pages (2 Mo) améliorent-elles les performances des bases de données par rapport aux pages normales (4 Ko) pour les grands pools de buffers ?",
      options: [
        "Les huge pages stockent plus de données par page, réduisant le nombre de lectures disque",
        "Un pool de buffers de 32 Go nécessite 8 millions d'entrées de table de pages de 4 Ko mais seulement 16 384 entrées de huge pages de 2 Mo. Le TLB a ~1500 entrées — avec 8M entrées, le taux de miss TLB est très élevé pour les accès aléatoires. Les huge pages réduisent la pression sur le TLB, donnant 10-30% de gains de performance.",
        "Les huge pages utilisent l'accélération de chiffrement matérielle",
        "Les huge pages contournent le planificateur OS, donnant aux processus DB une priorité CPU plus haute"
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce que l'amplification en écriture et pourquoi une forte amplification en écriture sur SSD cause-t-elle une défaillance matérielle prématurée ?",
      options: [
        "L'amplification en écriture cause le stockage de données en double, consommant de l'espace disque supplémentaire",
        "Amplification en écriture = octets écrits sur stockage / octets écrits par l'application. Les SSD ont une notation TBW finie — à 20x d'amplification, 10 Go/jour d'écritures app deviennent 200 Go/jour d'écritures SSD réelles. À 100x d'amplification, un SSD de 1 To noté 600 TBW tombe en panne en 1,6 ans au lieu de 8 ans.",
        "L'amplification en écriture n'affecte que les HDDs, pas les SSD qui n'ont pas de limite d'usure",
        "L'amplification en écriture est causée par les contrôleurs RAID dupliquant les écritures"
      ],
      correct: 1,
    },
  ],
};
