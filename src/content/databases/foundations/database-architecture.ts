export const content = {
  en: `# Database Architecture — Inside the Beast

A database is not just "a place to store data." It's a sophisticated piece of software engineering with multiple interacting subsystems, each solving complex problems in computer science. Understanding database architecture deeply means understanding the tradeoffs between consistency, performance, durability, and concurrency.

## The Two-Tier Architecture

\`\`\`
Database System Architecture:

┌─────────────────────────────────────────────────────────┐
│                    Query Processor                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Parser  │→ │Optimizer │→ │ Executor │→ │ Result  ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│         ↓            ↓            ↓            ↑        │
├─────────────────────────────────────────────────────────┤
│                   Storage Engine                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Buffer  │  │   Lock   │  │   WAL    │  │  Index  ││
│  │  Manager │  │ Manager  │  │  Manager │  │ Manager ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│         ↓            ↓            ↓            ↑        │
├─────────────────────────────────────────────────────────┤
│                  Operating System                       │
│              (File System, Page Cache)                  │
└─────────────────────────────────────────────────────────┘
              ↓                        ↑
        Disk Writes              Disk Reads

Key insight: The storage engine knows NOTHING about SQL.
             The query processor knows NOTHING about disk layout.
             This separation is fundamental.
\`\`\`

### Storage Engine vs Query Processor

**Storage Engine Responsibilities:**
- Physical data storage (page layout, tuple format)
- Buffer pool management (LRU, clock algorithm)
- Concurrency control (locks, MVCC)
- Crash recovery (WAL, checkpoints)
- Index management (B-tree, hash)

**Query Processor Responsibilities:**
- SQL parsing and validation
- Query optimization (join order, index selection)
- Plan execution (iterator model)
- Result set construction

**Why separate?** You can swap storage engines without changing the query processor. MySQL does this: InnoDB, MyISAM, Memory engine — same SQL interface, different storage guarantees.

## ACID Guarantees — The Four Pillars

\`\`\`
ACID properties and their implementation:

Atomicity:
├── Problem: Transaction partially executes, system crashes
├── Solution: Write-Ahead Logging (WAL)
├── Guarantee: All changes or no changes
└── Implementation: Undo log for rollback, redo log for recovery

Consistency:
├── Problem: Database constraints violated
├── Solution: Constraint checking before commit
├── Guarantee: Database moves from valid state to valid state
└── Implementation: Trigger checks, foreign key validation, CHECK constraints

Isolation:
├── Problem: Concurrent transactions interfere
├── Solution: Locking (2PL) or MVCC
├── Guarantee: Transactions appear to execute serially
└── Implementation: Lock tables, transaction snapshots, visibility checks

Durability:
├── Problem: Committed data lost on crash
├── Solution: Force WAL to disk before commit
├── Guarantee: Committed changes survive crashes
└── Implementation: fsync(), O_DIRECT, write barriers
\`\`\`

### Atomicity Implementation — Write-Ahead Logging

\`\`\`
Transaction execution with WAL:

T1: UPDATE accounts SET balance = balance - 100 WHERE id = 1;
T1: UPDATE accounts SET balance = balance + 100 WHERE id = 2;
T1: COMMIT;

Timeline:

1. BEGIN TRANSACTION (T1)
   ├── Assign XID (transaction ID): 12345
   └── No disk I/O yet

2. UPDATE account 1
   ├── Read page containing account 1 into buffer pool
   ├── Lock row (account 1)
   ├── Write WAL record: <XID=12345, UPDATE, page=5, old=1000, new=900>
   ├── Modify in-memory page (balance: 1000 → 900)
   └── Page marked DIRTY (not written to disk yet)

3. UPDATE account 2
   ├── Read page containing account 2 into buffer pool
   ├── Lock row (account 2)
   ├── Write WAL record: <XID=12345, UPDATE, page=8, old=500, new=600>
   ├── Modify in-memory page (balance: 500 → 600)
   └── Page marked DIRTY

4. COMMIT
   ├── Write WAL record: <XID=12345, COMMIT>
   ├── fsync() WAL to disk ← CRITICAL: Must complete before returning success
   ├── Release locks
   ├── Return SUCCESS to client
   └── Dirty pages written to disk LATER (asynchronously)

Key insight: WAL is written BEFORE data pages.
            Crash before fsync() → transaction lost (acceptable)
            Crash after fsync() → transaction survives (required)

Recovery after crash:
├── Scan WAL from last checkpoint
├── REDO: Reapply committed transactions (XID 12345: COMMIT found → replay updates)
└── UNDO: Rollback uncommitted transactions (XID 12346: no COMMIT → undo changes)
\`\`\`

### WAL Record Format (PostgreSQL)

\`\`\`c
// PostgreSQL WAL record structure (simplified)
typedef struct XLogRecord {
    uint32      xl_tot_len;      // Total length of record
    TransactionId xl_xid;        // Transaction ID
    XLogRecPtr  xl_prev;         // Pointer to previous record (LSN)
    uint8       xl_info;         // Flag bits
    RmgrId      xl_rmid;         // Resource manager ID (heap, btree, etc)
    uint32      xl_crc;          // CRC32 checksum
    // ... followed by record data
} XLogRecord;

// Example WAL record for UPDATE:
XLogRecord {
    xl_tot_len: 128,
    xl_xid: 12345,
    xl_prev: 0x1A2B3C4D,        // LSN of previous record
    xl_info: XLOG_HEAP_UPDATE,
    xl_rmid: RM_HEAP_ID,
    xl_crc: 0xABCD1234,
    // Data:
    // - Page ID: 5
    // - Offset: 42
    // - Old tuple: (id=1, balance=1000)
    // - New tuple: (id=1, balance=900)
}

WAL is append-only:
├── Records written sequentially
├── No random seeks (fast)
├── Circular buffer (old segments recycled)
└── Archived for PITR (Point-In-Time Recovery)
\`\`\`

## Isolation Levels — The Anomaly Zoo

SQL standard defines 4 isolation levels. Each prevents specific anomalies:

\`\`\`
Isolation Level Hierarchy:

Read Uncommitted (weakest)
├── Allows: Dirty reads, non-repeatable reads, phantoms
├── Use case: Approximate aggregates (COUNT(*))
└── Implementation: No read locks

Read Committed (most common default)
├── Prevents: Dirty reads
├── Allows: Non-repeatable reads, phantoms
├── Use case: Most OLTP applications
└── Implementation: Short-duration read locks or MVCC snapshots

Repeatable Read
├── Prevents: Dirty reads, non-repeatable reads
├── Allows: Phantoms (in some databases)
├── Use case: Financial reports, consistent snapshots
└── Implementation: Long-duration read locks or MVCC

Serializable (strongest)
├── Prevents: All anomalies
├── Use case: Critical financial transactions
└── Implementation: Strict 2PL or SSI (Serializable Snapshot Isolation)
\`\`\`

### Dirty Read Example

\`\`\`
Timeline (Read Uncommitted):

T1: BEGIN;
T1: UPDATE accounts SET balance = 0 WHERE id = 1;  -- balance: 1000 → 0
                                    T2: BEGIN;
                                    T2: SELECT balance FROM accounts WHERE id = 1;
                                    -- Sees balance = 0 (DIRTY READ - T1 not committed)
T1: ROLLBACK;  -- Oops, T1 aborted
                                    T2: -- T2 read data that never existed!
                                    T2: COMMIT;

Problem: T2 made decisions based on uncommitted data.
Solution: Read Committed or higher prevents this.
\`\`\`

### Non-Repeatable Read Example

\`\`\`
Timeline (Read Committed):

T1: BEGIN;
T1: SELECT balance FROM accounts WHERE id = 1;  -- Reads 1000
                                    T2: BEGIN;
                                    T2: UPDATE accounts SET balance = 500 WHERE id = 1;
                                    T2: COMMIT;
T1: SELECT balance FROM accounts WHERE id = 1;  -- Reads 500 (DIFFERENT!)
T1: COMMIT;

Problem: Same query returns different results within one transaction.
Solution: Repeatable Read prevents this.
\`\`\`

### Phantom Read Example

\`\`\`
Timeline (Repeatable Read in some databases):

T1: BEGIN;
T1: SELECT COUNT(*) FROM accounts WHERE balance > 500;  -- Returns 10
                                    T2: BEGIN;
                                    T2: INSERT INTO accounts VALUES (999, 600);
                                    T2: COMMIT;
T1: SELECT COUNT(*) FROM accounts WHERE balance > 500;  -- Returns 11 (PHANTOM!)
T1: COMMIT;

Problem: New rows appear that match predicate.
Solution: Serializable isolation prevents this.

PostgreSQL Repeatable Read actually prevents phantoms (stronger than SQL standard).
MySQL InnoDB Repeatable Read prevents phantoms via next-key locks.
\`\`\`

### Write Skew Anomaly (Not Prevented by Repeatable Read)

\`\`\`
Scenario: Doctor on-call scheduling
Rule: At least 1 doctor on call at all times
Current state: Alice ON-CALL, Bob ON-CALL

T1 (Alice going off-call):              T2 (Bob going off-call):
BEGIN;                                   BEGIN;
SELECT COUNT(*) FROM oncall              SELECT COUNT(*) FROM oncall
WHERE on_call = true;                    WHERE on_call = true;
-- Sees 2 doctors on call                -- Sees 2 doctors on call

UPDATE oncall                            UPDATE oncall
SET on_call = false                      SET on_call = false
WHERE doctor = 'Alice';                  WHERE doctor = 'Bob';

COMMIT;                                  COMMIT;

Result: 0 doctors on call (CONSTRAINT VIOLATED!)

Neither transaction saw the other's update.
Both checked constraint, both passed, both committed.

Solution: Serializable isolation or explicit locking:
SELECT COUNT(*) FROM oncall WHERE on_call = true FOR UPDATE;
\`\`\`

## Concurrency Control — Locks vs MVCC

### Two-Phase Locking (2PL)

\`\`\`
Lock compatibility matrix:

          | Shared | Exclusive
----------+--------+----------
Shared    |   ✓    |    ✗
Exclusive |   ✗    |    ✗

2PL Rules:
1. Growing phase: Acquire locks, cannot release
2. Shrinking phase: Release locks, cannot acquire
3. Locks held until COMMIT or ROLLBACK (Strict 2PL)

Example:
T1: SELECT * FROM accounts WHERE id = 1;  -- Acquire S lock
T1: UPDATE accounts SET balance = 900 WHERE id = 1;  -- Upgrade to X lock
T1: COMMIT;  -- Release all locks

Deadlock scenario:
T1: UPDATE accounts SET balance = 900 WHERE id = 1;  -- Locks row 1
                                T2: UPDATE accounts SET balance = 600 WHERE id = 2;  -- Locks row 2
T1: UPDATE accounts SET balance = 600 WHERE id = 2;  -- WAITS for T2
                                T2: UPDATE accounts SET balance = 100 WHERE id = 1;  -- WAITS for T1
                                -- DEADLOCK! One transaction aborted.

Deadlock detection:
├── Wait-for graph (nodes = transactions, edges = waits-for)
├── Cycle detection algorithm
├── Abort youngest transaction (or lowest priority)
└── Victim transaction rolled back, retry
\`\`\`

### Multi-Version Concurrency Control (MVCC)

\`\`\`
MVCC principle: Readers don't block writers, writers don't block readers.

Each tuple has multiple versions:

accounts table (logical view):
| id | balance |
|----|---------|
|  1 |    1000 |
|  2 |     500 |

Physical storage (with MVCC):
| id | balance | xmin  | xmax  | ctid |
|----|---------|-------|-------|------|
|  1 |    1000 | 12340 | 12345 | (0,1)|  -- Old version
|  1 |     900 | 12345 |   ∞   | (0,2)|  -- New version
|  2 |     500 | 12340 |   ∞   | (0,3)|  -- Current version

xmin: Transaction that created this version
xmax: Transaction that deleted/updated this version (∞ = still valid)
ctid: Physical location (page, offset)

Visibility rules (PostgreSQL):
A tuple is visible to transaction T if:
1. xmin committed AND xmin < T's snapshot
2. xmax not committed OR xmax > T's snapshot

Example:
T1 (XID=12344): SELECT * FROM accounts WHERE id = 1;
Snapshot: All XIDs < 12344 are visible
Sees: balance = 1000 (xmin=12340 < 12344, xmax=12345 > 12344)

T2 (XID=12346): SELECT * FROM accounts WHERE id = 1;
Snapshot: All XIDs < 12346 are visible
Sees: balance = 900 (xmin=12345 < 12346, xmax=∞)

No locks needed for reads!
\`\`\`

### MVCC Garbage Collection (VACUUM)

\`\`\`
Problem: Old tuple versions accumulate, wasting space.

PostgreSQL VACUUM:
├── Scan table for dead tuples (xmax committed, not visible to any active transaction)
├── Mark space as reusable (don't delete immediately)
├── Update free space map (FSM)
└── Freeze old XIDs (prevent XID wraparound)

autovacuum daemon:
├── Runs in background
├── Triggered by tuple modification threshold
├── Parameters:
│   ├── autovacuum_vacuum_threshold = 50
│   ├── autovacuum_vacuum_scale_factor = 0.2
│   └── Trigger when: dead_tuples > 50 + 0.2 * table_size
└── Can cause I/O spikes if table is large

XID wraparound crisis:
├── PostgreSQL uses 32-bit XIDs (4 billion)
├── After 2 billion transactions, XIDs wrap around
├── Old tuples become "in the future" (invisible!)
├── VACUUM freezes old tuples (mark xmin as "very old")
└── If not vacuumed, database shuts down to prevent data loss

Best practice: Monitor age(datfrozenxid)
\`\`\`

## Buffer Pool Management

\`\`\`
The buffer pool is the database's RAM cache:

┌─────────────────────────────────────┐
│           Buffer Pool               │
│  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │Page1│  │Page5│  │Page8│  ...    │
│  │Clean│  │Dirty│  │Clean│         │
│  └─────┘  └─────┘  └─────┘         │
│     ↑         ↑         ↑           │
└─────┼─────────┼─────────┼───────────┘
      │         │         │
      │  ┌──────┘         │
      │  │  fsync()       │
      │  ↓                │
┌─────┴──────────────┐    │
│   Disk (Tables)    │←───┘
└────────────────────┘

Buffer pool size: Typically 25-75% of RAM
Page size: 8KB (PostgreSQL), 16KB (MySQL InnoDB)

LRU (Least Recently Used) eviction:
├── Pages in doubly-linked list
├── Recently accessed → move to head
├── Evict from tail when pool full
└── Problem: Sequential scan pollutes cache

Clock algorithm (approximation of LRU):
├── Circular buffer with "clock hand"
├── Each page has reference bit
├── On access: Set reference bit = 1
├── On eviction:
│   ├── If bit = 1: Clear bit, advance hand
│   └── If bit = 0: Evict page
└── Cheaper than LRU (no list manipulation)
\`\`\`

### Page Pinning

\`\`\`c
// Pseudo-code for buffer manager

Page* buffer_get_page(PageID page_id) {
    Page* page = hash_lookup(page_id);
    
    if (page != NULL) {
        // Page in buffer pool
        page->pin_count++;
        page->ref_bit = 1;  // For clock algorithm
        return page;
    }
    
    // Page not in pool, must load from disk
    page = evict_and_load(page_id);
    page->pin_count = 1;
    return page;
}

void buffer_unpin_page(Page* page, bool dirty) {
    page->pin_count--;
    if (dirty) {
        page->is_dirty = true;
    }
    
    // If pin_count = 0, page can be evicted
}

Page* evict_and_load(PageID page_id) {
    // Find victim page using clock algorithm
    while (true) {
        Page* victim = clock_hand;
        
        if (victim->pin_count > 0) {
            // Page in use, skip
            clock_hand = next(clock_hand);
            continue;
        }
        
        if (victim->ref_bit == 1) {
            // Recently used, give second chance
            victim->ref_bit = 0;
            clock_hand = next(clock_hand);
            continue;
        }
        
        // Found victim
        if (victim->is_dirty) {
            flush_page_to_disk(victim);  // Write back
        }
        
        load_page_from_disk(page_id, victim);
        return victim;
    }
}
\`\`\`

## Crash Recovery — Bringing the Dead Back

\`\`\`
Recovery scenario:

System state before crash:
├── T1: Committed (in WAL, pages written to disk)
├── T2: Committed (in WAL, pages NOT written to disk)
├── T3: Not committed (in WAL, pages written to disk)
└── T4: Not committed (not in WAL)

Recovery phases (ARIES algorithm):

1. Analysis Phase:
   ├── Scan WAL from last checkpoint
   ├── Build transaction table (which XIDs active)
   ├── Build dirty page table (which pages were dirty)
   └── Determine redo point (earliest LSN of dirty page)

2. Redo Phase:
   ├── Replay WAL from redo point forward
   ├── Reapply ALL changes (even uncommitted)
   ├── Reconstruct exact state at crash
   └── Result: T1, T2, T3 changes in database (T4 never reached WAL)

3. Undo Phase:
   ├── Scan transaction table for uncommitted XIDs
   ├── Walk WAL backward, undo changes
   ├── Write compensation log records (CLRs)
   └── Result: T3 rolled back, only T1 and T2 remain

Final state:
├── T1: Committed ✓
├── T2: Committed ✓
├── T3: Rolled back (was not committed)
└── T4: Never existed (lost before WAL)
\`\`\`

### Checkpointing

\`\`\`
Checkpoint reduces recovery time:

Without checkpoint:
├── Crash at time T
├── Recovery scans WAL from database creation
└── Redo millions of transactions

With checkpoint every 5 minutes:
├── Crash at time T
├── Recovery scans WAL from last checkpoint (5 min ago)
└── Redo only recent transactions

Checkpoint process:
1. Force all dirty pages to disk
2. Write checkpoint record to WAL
3. Record checkpoint LSN
4. WAL before checkpoint can be archived/deleted

Problem: Checkpoint causes I/O spike
Solution: Incremental checkpoint (spread over time)

PostgreSQL checkpoint parameters:
checkpoint_timeout = 5min
max_wal_size = 1GB
checkpoint_completion_target = 0.9  (spread over 90% of interval)
\`\`\`

Database architecture is a beautiful intersection of data structures, concurrency control, crash recovery, and systems programming. Understanding it deeply transforms you from someone who "uses databases" to someone who understands WHY they behave the way they do.`,

  fr: `# Architecture des bases de données — À l'intérieur de la bête

Une base de données n'est pas juste "un endroit pour stocker des données". C'est un logiciel sophistiqué avec plusieurs sous-systèmes en interaction, chacun résolvant des problèmes complexes en informatique.

## Architecture à deux niveaux

\`\`\`
Architecture système de base de données :

┌─────────────────────────────────────────────────────────┐
│                 Processeur de requêtes                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │ Analyseur│→ │Optimiseur│→ │ Exécuteur│→ │ Résultat││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
├─────────────────────────────────────────────────────────┤
│                Moteur de stockage                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Buffer  │  │Gestionnaire│ │   WAL    │  │  Index  ││
│  │  Manager │  │  Verrous │  │  Manager │  │ Manager ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└─────────────────────────────────────────────────────────┘
\`\`\`

## Garanties ACID

\`\`\`
Atomicité : Toutes les modifications ou aucune
Cohérence : État valide à état valide
Isolation : Transactions indépendantes
Durabilité : Modifications persistantes
\`\`\`

## Niveaux d'isolation

\`\`\`
Read Uncommitted (le plus faible)
Read Committed (défaut courant)
Repeatable Read
Serializable (le plus fort)
\`\`\`

## Contrôle de concurrence — Verrous vs MVCC

MVCC : Les lecteurs ne bloquent pas les écrivains.`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the key insight of the storage engine vs query processor separation?",
      options: [
        "It makes databases faster",
        "Storage engine knows nothing about SQL, query processor knows nothing about disk layout — enables swapping storage engines",
        "It reduces memory usage",
        "It simplifies the codebase",
      ],
      correct: 1,
    },
    {
      question:
        "Why must WAL be fsynced to disk BEFORE returning commit success?",
      options: [
        "For performance optimization",
        "To ensure durability — if crash happens after fsync, committed data survives via WAL replay",
        "To prevent deadlocks",
        "To reduce memory usage",
      ],
      correct: 1,
    },
    {
      question:
        "What anomaly does Repeatable Read prevent that Read Committed allows?",
      options: [
        "Dirty reads",
        "Non-repeatable reads — same query returns different results within one transaction",
        "Deadlocks",
        "Write conflicts",
      ],
      correct: 1,
    },
    {
      question: "How does MVCC achieve 'readers don't block writers'?",
      options: [
        "By using faster locks",
        "By storing multiple tuple versions (xmin/xmax) — readers see old version while writers create new version",
        "By disabling transactions",
        "By using more memory",
      ],
      correct: 1,
    },
    {
      question: "What is the PostgreSQL XID wraparound crisis?",
      options: [
        "Database runs out of memory",
        "After 2 billion transactions, 32-bit XIDs wrap and old tuples become invisible — VACUUM must freeze old tuples",
        "Too many connections",
        "Disk space exhaustion",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quelle est l'idée clé de la séparation moteur de stockage vs processeur de requêtes ?",
      options: [
        "Ça rend les bases de données plus rapides",
        "Le moteur de stockage ne connaît pas SQL, le processeur de requêtes ne connaît pas la disposition disque — permet d'échanger les moteurs",
        "Ça réduit l'utilisation mémoire",
        "Ça simplifie le code",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi le WAL doit-il être fsync sur disque AVANT de retourner le succès du commit ?",
      options: [
        "Pour l'optimisation des performances",
        "Pour assurer la durabilité — si crash après fsync, les données committées survivent via replay WAL",
        "Pour éviter les deadlocks",
        "Pour réduire l'utilisation mémoire",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle anomalie Repeatable Read empêche-t-il que Read Committed permet ?",
      options: [
        "Lectures sales",
        "Lectures non répétables — même requête retourne résultats différents dans une transaction",
        "Deadlocks",
        "Conflits d'écriture",
      ],
      correct: 1,
    },
    {
      question:
        "Comment MVCC réalise-t-il 'les lecteurs ne bloquent pas les écrivains' ?",
      options: [
        "En utilisant des verrous plus rapides",
        "En stockant plusieurs versions de tuples (xmin/xmax) — lecteurs voient ancienne version pendant que écrivains créent nouvelle version",
        "En désactivant les transactions",
        "En utilisant plus de mémoire",
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce que la crise de wraparound XID de PostgreSQL ?",
      options: [
        "La base de données manque de mémoire",
        "Après 2 milliards de transactions, les XID 32-bit bouclent et les vieux tuples deviennent invisibles — VACUUM doit geler les vieux tuples",
        "Trop de connexions",
        "Épuisement de l'espace disque",
      ],
      correct: 1,
    },
  ],
};
