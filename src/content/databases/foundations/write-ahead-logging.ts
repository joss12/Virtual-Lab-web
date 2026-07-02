export const content = {
  en: `# Write-Ahead Logging — The Durability Guarantee

When you COMMIT, what guarantees your data survives a crash? Not "it's written to disk" — that's too slow. The answer is WAL: Write-Ahead Logging. Understanding WAL deeply means understanding the single most important concept in database durability.

## The Write-Ahead Protocol

\`\`\`
The fundamental rule:

"Log records must be written to stable storage
 BEFORE the corresponding data pages are written to disk."

Why?
├── Data page writes are random I/O (slow)
├── WAL writes are sequential I/O (fast)
├── WAL is append-only (no seeks)
└── Crash recovery replays WAL to reconstruct data

Timeline:

1. UPDATE accounts SET balance = 900 WHERE id = 1;

2. Modify in-memory buffer pool:
   ├── Page containing row 1 changed
   ├── Page marked DIRTY
   └── NOT written to disk yet

3. Write WAL record:
   ├── <LSN=12345, XID=100, UPDATE, page=5, old=1000, new=900>
   ├── Append to WAL buffer
   └── NOT fsynced yet

4. COMMIT:
   ├── Write <LSN=12346, XID=100, COMMIT> to WAL
   ├── fsync() WAL to disk ← CRITICAL POINT
   ├── Return SUCCESS to client
   └── Dirty pages written LATER (asynchronously)

Crash scenarios:

Crash before fsync():
├── WAL not on disk
├── Transaction LOST (acceptable - not committed)
└── Dirty pages discarded

Crash after fsync():
├── WAL on disk
├── Transaction SURVIVES (required - committed)
└── Recovery replays WAL to reconstruct dirty pages

The fsync() is the atomic commit point.
\`\`\`

### LSN — Log Sequence Number

\`\`\`
LSN = Unique identifier for each WAL record

PostgreSQL LSN format:
├── 64-bit integer
├── Format: XXX/YYYYYYYY (segment/offset)
└── Example: 0/16B9EB8 = segment 0, offset 0x16B9EB8

LSN properties:
1. Monotonically increasing
2. Unique per WAL record
3. Determines ordering
4. Used for recovery

LSN in page header (pd_lsn):
├── Last LSN that modified this page
├── Used during recovery
└── Determines if page needs redo

LSN comparison:
LSN 100 < LSN 200 → Record 100 happened before 200

Recovery uses LSN:
├── Page LSN = 500
├── WAL record LSN = 600
├── Page outdated, must apply WAL record
└── If page LSN ≥ WAL LSN, skip (already applied)
\`\`\`

### WAL Record Structure (PostgreSQL)

\`\`\`c
// PostgreSQL: src/include/access/xlogrecord.h

typedef struct XLogRecord {
    uint32      xl_tot_len;      // Total record length
    TransactionId xl_xid;        // Transaction ID
    XLogRecPtr  xl_prev;         // LSN of previous record
    uint8       xl_info;         // Flag bits
    RmgrId      xl_rmid;         // Resource manager ID
    // xl_crc is at end of struct
} XLogRecord;

// Resource manager IDs (types of operations):
#define RM_XLOG_ID      0   // WAL management
#define RM_XACT_ID      1   // Transaction control (COMMIT, ABORT)
#define RM_HEAP_ID      3   // Heap operations (INSERT, UPDATE, DELETE)
#define RM_BTREE_ID     4   // B-tree operations
#define RM_HASH_ID      5   // Hash index operations
// ... more

// Example WAL records:

1. INSERT record:
XLogRecord {
    xl_tot_len: 96,
    xl_xid: 12345,
    xl_prev: 0x1A2B3C4D,
    xl_info: XLOG_HEAP_INSERT,
    xl_rmid: RM_HEAP_ID,
    // Data:
    // - Block number: 100
    // - Offset: 42
    // - Tuple data: (id=1, name='Alice', ...)
}

2. UPDATE record:
XLogRecord {
    xl_tot_len: 128,
    xl_xid: 12345,
    xl_prev: 0x1A2B3C50,
    xl_info: XLOG_HEAP_UPDATE,
    xl_rmid: RM_HEAP_ID,
    // Data:
    // - Old block: 100, offset: 42
    // - New block: 100, offset: 43
    // - Old tuple: (balance=1000)
    // - New tuple: (balance=900)
}

3. COMMIT record:
XLogRecord {
    xl_tot_len: 48,
    xl_xid: 12345,
    xl_prev: 0x1A2B3C80,
    xl_info: XLOG_XACT_COMMIT,
    xl_rmid: RM_XACT_ID,
    // Data:
    // - Commit timestamp
    // - List of deleted files (if any)
}

4. CHECKPOINT record:
XLogRecord {
    xl_tot_len: 128,
    xl_xid: 0,
    xl_prev: 0x1A2B4000,
    xl_info: XLOG_CHECKPOINT_SHUTDOWN,
    xl_rmid: RM_XLOG_ID,
    // Data:
    // - Redo point LSN (where recovery starts)
    // - Checkpoint timestamp
    // - Oldest active XID
    // - Next XID to assign
}

WAL record CRC32C checksum:
├── Computed over entire record
├── Detects corruption during recovery
└── Stored at end of record (xl_crc field)
\`\`\`

### Full-Page Writes (FPW)

\`\`\`
Problem: Torn page writes

Scenario:
1. Page partially written (first 4KB written, second 4KB not)
2. Crash occurs
3. Page on disk is inconsistent (half old, half new)
4. WAL record only has delta (UPDATE changed one field)
5. Applying delta to torn page = corruption!

Solution: Full-page writes

After checkpoint, first modification to page:
├── Write ENTIRE page to WAL (full-page image)
├── 8KB page → 8KB WAL record
└── Subsequent modifications: only deltas

Recovery:
├── Find full-page image in WAL
├── Restore entire page
├── Apply subsequent deltas
└── Guarantees consistent page

Example timeline:

t=0:  Checkpoint at LSN 1000
t=1:  UPDATE page 5 (first mod since checkpoint)
      ├── Write full-page image (8KB) to WAL at LSN 1100
      └── Also write UPDATE delta
t=2:  UPDATE page 5 again
      ├── Write only delta to WAL at LSN 1200
      └── No full-page image needed
t=3:  Crash during page 5 write (torn page)
      
Recovery:
├── Start from checkpoint LSN 1000
├── Replay LSN 1100: full-page image → restore page 5
├── Replay LSN 1200: delta → apply update
└── Page 5 consistent despite torn write!

FPW overhead:
├── WAL size increases significantly
├── First mod after checkpoint = 8KB WAL record
├── Trade-off: safety vs. WAL volume
└── Can disable (full_page_writes=off) at your peril!

PostgreSQL full_page_writes parameter:
├── Default: ON (safety first)
├── Off: Faster, but torn page risk
└── Only disable on crash-safe storage (battery-backed cache)
\`\`\`

### WAL Compression

\`\`\`
Problem: Full-page writes bloat WAL

PostgreSQL 9.5+ wal_compression:

Compression algorithm:
1. Identify "hole" in page (free space between tuples)
2. Remove hole from full-page image
3. Compress remainder with pglz (LZ variant)
4. Decompress during recovery

Example:
Original page (8KB):
├── Header: 24 bytes
├── Item pointers: 100 bytes
├── Free space: 6000 bytes ← HOLE
├── Tuples: 2068 bytes
└── Total: 8192 bytes

Compressed FPW:
├── Header: 24 bytes
├── Item pointers: 100 bytes
├── Hole marker: "6000 bytes skipped"
├── Tuples: 2068 bytes compressed → ~1000 bytes
└── Total WAL record: ~1150 bytes (7x smaller!)

wal_compression benefits:
├── Reduced WAL volume (50-90% smaller)
├── Less I/O bandwidth
├── Faster replication
└── Small CPU overhead (compression)

When to enable:
✓ I/O constrained
✓ Replication lag issues
✗ CPU constrained (compression adds overhead)
\`\`\`

## Checkpointing — Reducing Recovery Time

\`\`\`
Purpose: Limit amount of WAL to replay during recovery

Checkpoint process:
1. Force all dirty pages to disk
2. Write checkpoint record to WAL
3. Update control file with checkpoint LSN
4. Recycle old WAL segments

Without checkpoints:
├── Crash requires replaying ALL WAL (since database creation)
├── Millions of records = hours of recovery
└── Unacceptable!

With checkpoints every 5 minutes:
├── Crash requires replaying 5 minutes of WAL
├── ~10,000 records = seconds of recovery
└── Acceptable

Checkpoint record content:
├── Redo point LSN (where recovery starts)
├── Oldest active XID
├── Next XID to assign
├── Oldest running transaction's snapshot
└── Database state snapshot

PostgreSQL checkpoint parameters:
checkpoint_timeout = 5min        // Time-based trigger
max_wal_size = 1GB               // WAL volume trigger
checkpoint_completion_target = 0.9  // Spread I/O over 90% of interval

Checkpoint triggering:
├── Time: Every checkpoint_timeout
├── WAL size: When WAL exceeds max_wal_size
├── Manual: CHECKPOINT command
└── Shutdown: Clean shutdown checkpoint

Incremental checkpointing:
├── Don't flush all pages at once (I/O spike)
├── Spread writes over checkpoint interval
├── Target: 90% of checkpoint_timeout
└── Avoid disrupting normal workload
\`\`\`

### Checkpoint I/O Scheduling

\`\`\`
Problem: Checkpoint I/O storm

Naive approach:
1. Identify all dirty pages (10,000 pages)
2. Write all to disk immediately
3. I/O saturated for 10 seconds
4. Queries slow to a crawl

Smarter approach (PostgreSQL):
1. Calculate: checkpoint_timeout × checkpoint_completion_target
   ├── 5min × 0.9 = 4.5 minutes
   └── Spread writes over 4.5 minutes
2. Write rate: 10,000 pages / 270 seconds ≈ 37 pages/sec
3. Write 37 pages, sleep, repeat
4. Smooth I/O instead of spike

Checkpoint I/O parameters:
checkpoint_flush_after = 256kB  // fsync after 256kB written
├── Prevents kernel page cache from getting too dirty
└── Smooths disk write patterns

bgwriter (background writer):
├── Separate process writing dirty pages continuously
├── Reduces checkpoint burden
├── Parameters:
│   ├── bgwriter_delay = 200ms (sleep between rounds)
│   ├── bgwriter_lru_maxpages = 100 (max pages per round)
│   └── bgwriter_lru_multiplier = 2.0 (adaptive behavior)
└── Keeps buffer pool clean

Monitoring checkpoint performance:
SELECT * FROM pg_stat_bgwriter;
├── checkpoints_timed (scheduled checkpoints)
├── checkpoints_req (forced checkpoints - bad!)
├── buffers_checkpoint (pages written by checkpoint)
└── buffers_clean (pages written by bgwriter)

High checkpoints_req → increase max_wal_size
\`\`\`

## Crash Recovery — The ARIES Algorithm

\`\`\`
ARIES: Algorithm for Recovery and Isolation Exploiting Semantics

Three-phase recovery:

1. Analysis Phase:
   ├── Scan WAL from last checkpoint
   ├── Build dirty page table (which pages modified)
   ├── Build transaction table (which XIDs active)
   └── Determine redo point (earliest LSN of dirty page)

2. Redo Phase:
   ├── Replay WAL from redo point forward
   ├── Reapply ALL operations (even uncommitted)
   ├── Reconstruct exact state at crash
   └── "Repeat history" - restore to crash state

3. Undo Phase:
   ├── Scan transaction table for uncommitted XIDs
   ├── Walk WAL backward, undo their operations
   ├── Write CLRs (Compensation Log Records)
   └── Roll back uncommitted transactions

ARIES guarantees:
├── Idempotence: Replaying WAL multiple times = same result
├── No-force: Dirty pages written asynchronously
├── Steal: Uncommitted pages can be evicted
└── Durability: Committed transactions survive
\`\`\`

### Recovery Example

\`\`\`
Database state before crash:

WAL:
LSN 1000: Checkpoint (redo point)
LSN 1100: T1 BEGIN
LSN 1200: T1 UPDATE page 5
LSN 1300: T2 BEGIN
LSN 1400: T2 UPDATE page 8
LSN 1500: T1 COMMIT
LSN 1600: T2 UPDATE page 10
LSN 1700: Checkpoint (not completed - crash!)
         
Buffer pool (in memory, lost on crash):
├── Page 5: Modified by T1 (dirty, NOT written to disk)
├── Page 8: Modified by T2 (dirty, written to disk at LSN 1650)
└── Page 10: Modified by T2 (dirty, NOT written to disk)

Disk:
├── Page 5: Old data (T1's update lost!)
├── Page 8: New data (T2's update made it)
└── Page 10: Old data (T2's update lost!)

CRASH at LSN 1700!

Recovery Phase 1 - Analysis:
├── Last checkpoint: LSN 1000
├── Scan WAL 1000 → 1700
├── Dirty page table: {page 5: LSN 1200, page 8: LSN 1400, page 10: LSN 1600}
├── Transaction table: {T1: COMMITTED, T2: IN_PROGRESS}
└── Redo point: LSN 1200 (earliest dirty page LSN)

Recovery Phase 2 - Redo:
LSN 1200: T1 UPDATE page 5
├── Page 5 on disk has LSN < 1200
├── Apply update: page 5 modified
└── Set page LSN = 1200

LSN 1400: T2 UPDATE page 8
├── Page 8 on disk has LSN ≥ 1400 (already written)
├── Skip (already applied)

LSN 1600: T2 UPDATE page 10
├── Page 10 on disk has LSN < 1600
├── Apply update: page 10 modified
└── Set page LSN = 1600

After redo:
├── Page 5: T1's update restored
├── Page 8: T2's update (was already on disk)
├── Page 10: T2's update restored
└── Exact state at crash reconstructed!

Recovery Phase 3 - Undo:
├── T1: COMMITTED → no undo needed
├── T2: IN_PROGRESS → must undo

Undo T2:
LSN 1600: T2 UPDATE page 10
├── Undo: Restore old value
├── Write CLR (Compensation Log Record): LSN 1800
└── CLR records undo action (for crash during recovery)

LSN 1400: T2 UPDATE page 8
├── Undo: Restore old value
├── Write CLR: LSN 1900

After undo:
├── Page 5: T1's committed update (kept)
├── Page 8: T2's update rolled back
├── Page 10: T2's update rolled back
└── Only committed transactions remain!

Final state:
✓ T1: Committed (survived)
✗ T2: Rolled back (was in-progress)
\`\`\`

### Compensation Log Records (CLRs)

\`\`\`
Purpose: Record undo operations during recovery

Problem: Crash during recovery undo phase
├── Undo was partially complete
├── How to resume undo after second crash?
└── Can't re-undo (not idempotent!)

Solution: CLRs
├── Log the undo operation
├── CLR is NEVER undone (permanent)
├── CLR points to next record to undo
└── Resume undo from CLR's undo_next pointer

Example:
T1: UPDATE page 5 (LSN 100)
T1: UPDATE page 8 (LSN 200)
T1: Crash (no commit)

Recovery undo:
├── Undo LSN 200 → Write CLR at LSN 300
│   ├── Restores old value
│   ├── undo_next = LSN 100
│   └── CLR never undone
├── Crash during undo! (before undoing LSN 100)

Second recovery:
├── Find CLR at LSN 300
├── CLR's undo_next = LSN 100
├── Resume undo from LSN 100
├── Undo LSN 100 → Write CLR at LSN 400
└── Undo complete

CLR guarantees progress even with repeated crashes.

CLR structure:
typedef struct CLR {
    XLogRecPtr undo_next;   // Next record to undo
    XLogRecPtr undone_lsn;  // LSN of record being undone
    // ... undo data
} CLR;
\`\`\`

## Group Commit — Batching fsyncs

\`\`\`
Problem: fsync() is slow (1-10ms on spinning disk)

Naive approach:
├── T1: COMMIT → fsync() (10ms)
├── T2: COMMIT → fsync() (10ms)
├── T3: COMMIT → fsync() (10ms)
└── Throughput: 100 commits/sec

Group commit:
├── T1: COMMIT → Write to WAL buffer
├── T2: COMMIT → Write to WAL buffer (T1 waiting)
├── T3: COMMIT → Write to WAL buffer (T1, T2 waiting)
├── Batch fsync() → All three committed
└── Throughput: 1000+ commits/sec

Implementation:
1. First committer becomes "group leader"
2. Leader waits short time (e.g., 1ms)
3. Collect all commits during wait
4. Single fsync() for entire group
5. Wake up all waiters

PostgreSQL commit_delay parameter:
├── Microseconds to wait for group
├── Default: 0 (disabled)
├── Set to 10-100μs for high concurrency
└── Trade-off: slight latency increase for throughput

Group commit effectiveness:
1 commit:     10ms fsync = 100 commits/sec
10 commits:   10ms fsync = 1000 commits/sec
100 commits:  10ms fsync = 10000 commits/sec

Automatic group commit:
├── PostgreSQL 9.3+ does this automatically
├── No commit_delay needed
├── Batches commits within same WAL write
└── Transparent to applications
\`\`\`

## WAL Archiving — Point-In-Time Recovery (PITR)

\`\`\`
Purpose: Restore database to any point in time

WAL segment lifecycle:
1. Create new 16MB WAL segment
2. Fill with WAL records
3. Switch to next segment
4. Archive completed segment
5. Recycle old segments (if archived)

Archive command (postgresql.conf):
archive_mode = on
archive_command = 'cp %p /archive/%f'
├── %p = full path to WAL segment
├── %f = segment filename
└── Command must return 0 on success

WAL segment naming:
000000010000000000000001
├── Timeline ID: 00000001 (changes after recovery)
├── Log file number: 00000000
└── Segment number: 00000001

Point-in-time recovery:
1. Restore base backup
2. Copy archived WAL segments to pg_wal/
3. Create recovery.conf:
   restore_command = 'cp /archive/%f %p'
   recovery_target_time = '2024-01-15 14:30:00'
4. Start PostgreSQL
5. Database replays WAL until target time
6. Stops before disaster (e.g., DROP TABLE)

PITR use cases:
├── Recover from operator error (accidental DELETE)
├── Recover from application bug (corrupted data)
├── Forensics (examine state at specific time)
└── Testing (replay production workload)

Continuous archiving:
├── Base backup once per week
├── WAL segments archived continuously
├── Can recover to any second
└── RPO (Recovery Point Objective) ≈ 0
\`\`\`

### WAL Streaming Replication

\`\`\`
Modern approach: Stream WAL instead of archiving files

Primary (master):
├── Generates WAL
├── Sends WAL records to standbys in real-time
└── Doesn't wait for standby acknowledgment (async)

Standby (replica):
├── Receives WAL stream
├── Applies WAL records continuously
├── Lags behind primary by ~seconds
└── Can serve read-only queries (hot standby)

Synchronous replication:
├── Primary waits for standby to acknowledge
├── Guarantees zero data loss
├── Higher latency (wait for network + disk)
└── synchronous_commit = on

Asynchronous replication:
├── Primary doesn't wait for standby
├── Possible data loss if primary crashes
├── Lower latency (no waiting)
└── synchronous_commit = off (default)

WAL sender process:
├── One per standby connection
├── Reads WAL from pg_wal/
├── Sends over TCP connection
└── Monitors replication lag

WAL receiver process (standby):
├── Receives WAL from primary
├── Writes to local pg_wal/
├── Triggers WAL replay (startup process)
└── Catches up to primary continuously

Replication lag monitoring:
Primary: SELECT * FROM pg_stat_replication;
├── application_name (standby name)
├── sent_lsn (latest LSN sent)
├── write_lsn (latest LSN written by standby)
├── flush_lsn (latest LSN fsynced by standby)
└── replay_lsn (latest LSN applied by standby)

Lag in bytes: sent_lsn - replay_lsn
Lag in seconds: Calculate based on WAL generation rate
\`\`\`

## WAL Internals — Performance Optimization

\`\`\`
WAL buffer:
├── Shared memory buffer (wal_buffers parameter)
├── Default: 1/32 of shared_buffers (min 64KB, max 16MB)
├── WAL records written here first
└── Flushed to disk on commit or when full

WAL write process:
1. Backend writes WAL record to WAL buffer
2. Insert LSN into record
3. Reserve space in buffer (with spinlock)
4. Copy record to buffer
5. Release spinlock
6. On COMMIT: Request WAL flush
7. WAL writer process: fsync() to disk

WAL writer process:
├── Background process
├── Flushes WAL buffer every wal_writer_delay (200ms default)
├── Reduces fsync() calls by backends
└── Improves commit latency

WAL segment size:
├── Default: 16MB per segment
├── Configurable at initdb (--wal-segsize)
├── Larger segments: Less switching overhead
└── Smaller segments: Faster archiving

WAL insertion lock:
├── Multiple backends can insert WAL concurrently
├── Each gets slot in WAL buffer
├── Lock-free on modern hardware (atomic operations)
└── Scales to 100+ cores

WAL performance tuning:
1. wal_buffers: Increase for high write throughput
2. synchronous_commit = off: Async commit (data loss risk)
3. wal_compression = on: Reduce WAL volume
4. full_page_writes = off: Risky but faster (if safe storage)
5. checkpoint_timeout: Longer = less frequent checkpoints
\`\`\`

WAL is the unsung hero of databases. It's the reason your COMMIT doesn't take 10 seconds. It's the reason you don't lose data in crashes. Understanding WAL means understanding the foundation of durability.`,

  fr: `# Write-Ahead Logging — La garantie de durabilité

Quand vous faites COMMIT, qu'est-ce qui garantit que vos données survivent à un crash ? Pas "c'est écrit sur disque" — c'est trop lent. La réponse est WAL : Write-Ahead Logging.

## Le protocole Write-Ahead

\`\`\`
La règle fondamentale :

"Les enregistrements de log doivent être écrits sur stockage stable
 AVANT que les pages de données correspondantes ne soient écrites sur disque."

Pourquoi ?
├── Écritures pages données sont I/O aléatoires (lent)
├── Écritures WAL sont I/O séquentielles (rapide)
└── WAL est append-only (pas de seeks)
\`\`\`

## LSN — Log Sequence Number

\`\`\`
LSN = Identifiant unique pour chaque enregistrement WAL

Format PostgreSQL LSN :
├── Entier 64 bits
├── Format : XXX/YYYYYYYY (segment/offset)
└── Exemple : 0/16B9EB8
\`\`\`

## Checkpointing

\`\`\`
Objectif : Limiter la quantité de WAL à rejouer pendant la récupération

Processus checkpoint :
1. Forcer toutes les pages sales sur disque
2. Écrire enregistrement checkpoint dans WAL
3. Recycler anciens segments WAL
\`\`\`

## Récupération après crash — Algorithme ARIES

\`\`\`
Trois phases de récupération :

1. Phase d'analyse
2. Phase de redo (refaire)
3. Phase d'undo (défaire)
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "What is the critical atomic commit point that guarantees durability?",
      options: [
        "When the data page is written to disk",
        "When fsync() completes on the WAL after writing COMMIT record — before this, transaction can be lost",
        "When the transaction begins",
        "When the buffer pool is updated",
      ],
      correct: 1,
    },
    {
      question: "Why are full-page writes (FPW) necessary after checkpoints?",
      options: [
        "To improve performance",
        "Prevent torn page corruption — if crash during partial page write, FPW in WAL restores complete page",
        "To compress WAL",
        "To reduce memory usage",
      ],
      correct: 1,
    },
    {
      question: "What is the purpose of the ARIES redo phase?",
      options: [
        "To undo uncommitted transactions",
        "Replay ALL WAL operations (even uncommitted) from redo point forward — reconstruct exact crash state",
        "To write checkpoints",
        "To compress the database",
      ],
      correct: 1,
    },
    {
      question: "How does group commit improve throughput?",
      options: [
        "By using faster disks",
        "Batch multiple COMMITs into single fsync() — 10 commits in 10ms = 1000 commits/sec vs 100/sec",
        "By compressing data",
        "By using more memory",
      ],
      correct: 1,
    },
    {
      question:
        "Why do Compensation Log Records (CLRs) point to the next record to undo?",
      options: [
        "For debugging",
        "Enable resuming undo after crash during recovery — CLRs never undone, provide restart point",
        "To save space",
        "To improve performance",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quel est le point de commit atomique critique qui garantit la durabilité ?",
      options: [
        "Quand la page de données est écrite sur disque",
        "Quand fsync() se termine sur le WAL après écriture de l'enregistrement COMMIT",
        "Quand la transaction commence",
        "Quand le buffer pool est mis à jour",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi les écritures de pages complètes (FPW) sont-elles nécessaires après les checkpoints ?",
      options: [
        "Pour améliorer les performances",
        "Prévenir la corruption de page déchirée — si crash pendant écriture partielle de page, FPW dans WAL restaure page complète",
        "Pour compresser WAL",
        "Pour réduire l'utilisation mémoire",
      ],
      correct: 1,
    },
    {
      question: "Quel est l'objectif de la phase redo d'ARIES ?",
      options: [
        "Défaire les transactions non committées",
        "Rejouer TOUTES les opérations WAL (même non committées) depuis le point redo — reconstruire l'état exact du crash",
        "Écrire des checkpoints",
        "Compresser la base de données",
      ],
      correct: 1,
    },
    {
      question: "Comment le group commit améliore-t-il le débit ?",
      options: [
        "En utilisant des disques plus rapides",
        "Regroupe plusieurs COMMITs en un seul fsync() — 10 commits en 10ms = 1000 commits/sec vs 100/sec",
        "En compressant les données",
        "En utilisant plus de mémoire",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi les Compensation Log Records (CLRs) pointent-ils vers le prochain enregistrement à défaire ?",
      options: [
        "Pour le débogage",
        "Permettre de reprendre l'undo après crash pendant récupération — CLRs jamais défaits, fournissent point de redémarrage",
        "Pour économiser l'espace",
        "Pour améliorer les performances",
      ],
      correct: 1,
    },
  ],
};
