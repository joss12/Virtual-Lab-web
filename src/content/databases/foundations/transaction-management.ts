export const content = {
  en: `# Transaction Management — The Isolation Illusion

Transactions create the illusion that you're the only user in the database. Behind this illusion is sophisticated machinery: lock managers, version chains, snapshot tracking, deadlock detection. Understanding transaction management deeply means understanding how databases maintain correctness in the face of chaos.

## Two-Phase Locking (2PL) — The Classical Approach

\`\`\`
2PL Protocol:

Phase 1 - Growing Phase:
├── Transaction acquires locks
├── Cannot release any locks yet
└── Lock acquisition continues until COMMIT/ROLLBACK

Phase 2 - Shrinking Phase:
├── Transaction releases locks
├── Cannot acquire new locks
└── All locks released at COMMIT/ROLLBACK

Strict 2PL (used in practice):
├── Hold ALL locks until COMMIT/ROLLBACK
└── Prevents cascading aborts

Example timeline:

T1: BEGIN;
T1: SELECT * FROM accounts WHERE id = 1;  -- Acquire S(1)
T1: UPDATE accounts SET balance = 900 WHERE id = 1;  -- Upgrade to X(1)
T1: SELECT * FROM accounts WHERE id = 2;  -- Acquire S(2)
T1: UPDATE accounts SET balance = 600 WHERE id = 2;  -- Upgrade to X(2)
T1: COMMIT;  -- Release X(1), X(2)

Lock types:
S - Shared (read lock)
X - Exclusive (write lock)
IS - Intention Shared (table-level)
IX - Intention Exclusive (table-level)
SIX - Shared + Intention Exclusive

Compatibility matrix:
        S    X    IS   IX   SIX
    S   ✓    ✗    ✓    ✗    ✗
    X   ✗    ✗    ✗    ✗    ✗
    IS  ✓    ✗    ✓    ✓    ✓
    IX  ✗    ✗    ✓    ✓    ✗
    SIX ✗    ✗    ✓    ✗    ✗
\`\`\`

### Lock Manager Implementation

\`\`\`c
// Simplified lock manager structure

typedef enum LockMode {
    LOCK_SHARED,
    LOCK_EXCLUSIVE
} LockMode;

typedef struct LockRequest {
    TransactionId xid;          // Requesting transaction
    LockMode mode;              // S or X
    bool granted;               // Lock granted?
    struct LockRequest* next;   // Next in wait queue
} LockRequest;

typedef struct LockTableEntry {
    ResourceId resource;        // Page, tuple, or table
    int num_holders;            // Number of granted locks
    LockRequest* wait_queue;    // Queue of waiting requests
} LockTableEntry;

// Hash table: resource → LockTableEntry
// One entry per locked resource

// Acquire lock
bool acquire_lock(TransactionId xid, ResourceId resource, LockMode mode) {
    LockTableEntry* entry = hash_lookup(resource);
    
    if (entry == NULL) {
        // No locks on this resource yet
        entry = create_entry(resource);
        entry->num_holders = 1;
        LockRequest* req = create_request(xid, mode, true);
        entry->wait_queue = req;
        return true;
    }
    
    // Check compatibility with existing locks
    if (compatible(entry, mode)) {
        // Can grant immediately
        LockRequest* req = create_request(xid, mode, true);
        add_to_queue(entry, req);
        entry->num_holders++;
        return true;
    }
    
    // Must wait - add to queue
    LockRequest* req = create_request(xid, mode, false);
    add_to_queue(entry, req);
    
    // Deadlock detection here
    if (detect_deadlock(xid)) {
        remove_from_queue(entry, req);
        abort_transaction(xid);
        return false;
    }
    
    // Block until lock granted
    wait_for_lock(req);
    return true;
}

bool compatible(LockTableEntry* entry, LockMode mode) {
    if (entry->num_holders == 0) return true;
    
    if (mode == LOCK_EXCLUSIVE) {
        // X lock incompatible with everything
        return false;
    }
    
    // S lock compatible with other S locks
    LockRequest* req = entry->wait_queue;
    while (req != NULL) {
        if (req->granted && req->mode == LOCK_EXCLUSIVE) {
            return false;  // Existing X lock
        }
        req = req->next;
    }
    return true;
}

// Release all locks for transaction
void release_locks(TransactionId xid) {
    // Iterate all lock table entries
    for each entry in lock_table {
        LockRequest* req = entry->wait_queue;
        LockRequest* prev = NULL;
        
        while (req != NULL) {
            if (req->xid == xid) {
                // Remove this request
                if (prev == NULL) {
                    entry->wait_queue = req->next;
                } else {
                    prev->next = req->next;
                }
                
                if (req->granted) {
                    entry->num_holders--;
                }
                
                free(req);
                
                // Wake up waiting transactions
                wake_up_waiters(entry);
                break;
            }
            prev = req;
            req = req->next;
        }
    }
}
\`\`\`

### Deadlock Detection — Wait-For Graph

\`\`\`
Deadlock scenario:

T1: UPDATE accounts SET balance = 900 WHERE id = 1;  -- Locks row 1
                            T2: UPDATE accounts SET balance = 600 WHERE id = 2;  -- Locks row 2
T1: UPDATE accounts SET balance = 600 WHERE id = 2;  -- WAITS for T2
                            T2: UPDATE accounts SET balance = 100 WHERE id = 1;  -- WAITS for T1
                            
DEADLOCK! T1 waits for T2, T2 waits for T1 (cycle)

Wait-for graph:
T1 ──→ T2
 ↑      │
 └──────┘
(Cycle detected!)

Deadlock detection algorithm:
1. Build wait-for graph (directed graph)
   ├── Node = transaction
   └── Edge = "waits for" relationship
2. Run cycle detection (DFS or union-find)
3. If cycle found: deadlock!
4. Choose victim transaction (usually youngest)
5. Abort victim, release locks, retry

PostgreSQL deadlock detector:
├── Runs every 1 second (deadlock_timeout)
├── Only checks transactions waiting > 1s
├── Victim selection: fewest resources locked
└── Client receives: ERROR: deadlock detected

MySQL InnoDB deadlock detector:
├── Runs on every lock wait
├── Immediate detection (no timeout)
├── Victim: transaction with fewer undo records
└── Automatic rollback + retry (by default)

Avoiding deadlocks:
1. Lock resources in consistent order
   ├── Always lock accounts in ascending ID order
   └── Prevents circular waits
2. Use timeouts (deadlock_timeout)
3. Retry transactions on deadlock
4. Keep transactions short
\`\`\`

### Deadlock Detection Implementation

\`\`\`c
// Wait-for graph for deadlock detection

typedef struct WaitForNode {
    TransactionId xid;
    struct WaitForNode** waiting_for;  // Array of pointers
    int num_waiting;
    bool visited;   // For cycle detection
    bool in_stack;  // For DFS stack
} WaitForNode;

bool detect_deadlock(TransactionId xid) {
    // Build wait-for graph
    WaitForNode* graph[MAX_TRANSACTIONS];
    build_wait_for_graph(graph);
    
    // DFS to detect cycle
    for (int i = 0; i < num_transactions; i++) {
        if (!graph[i]->visited) {
            if (dfs_cycle_detect(graph[i])) {
                return true;  // Cycle found
            }
        }
    }
    return false;
}

bool dfs_cycle_detect(WaitForNode* node) {
    node->visited = true;
    node->in_stack = true;
    
    for (int i = 0; i < node->num_waiting; i++) {
        WaitForNode* next = node->waiting_for[i];
        
        if (!next->visited) {
            if (dfs_cycle_detect(next)) {
                return true;  // Cycle in subtree
            }
        } else if (next->in_stack) {
            // Back edge = cycle!
            return true;
        }
    }
    
    node->in_stack = false;
    return false;
}

void build_wait_for_graph(WaitForNode* graph[]) {
    // For each lock table entry
    for each entry in lock_table {
        // For each waiting transaction
        for each waiting_req in entry->wait_queue {
            if (!waiting_req->granted) {
                // Find what this transaction waits for
                for each granted_req in entry->wait_queue {
                    if (granted_req->granted && 
                        !compatible(waiting_req->mode, granted_req->mode)) {
                        // waiting_req.xid waits for granted_req.xid
                        add_edge(graph, waiting_req->xid, granted_req->xid);
                    }
                }
            }
        }
    }
}

// PostgreSQL actual deadlock detection:
// src/backend/storage/lmgr/deadlock.c
// Runs every deadlock_timeout (default 1s)
\`\`\`

## MVCC — Multi-Version Concurrency Control

\`\`\`
MVCC principle: Keep multiple versions of each tuple

PostgreSQL MVCC implementation:

Tuple versions:
┌─────────────────────────────────────────────┐
│ Row ID=1, Version 1 (xmin=100, xmax=150)    │
│ balance = 1000                              │
├─────────────────────────────────────────────┤
│ Row ID=1, Version 2 (xmin=150, xmax=0)      │
│ balance = 900                               │
└─────────────────────────────────────────────┘

Transaction snapshots:
T1 (XID=140): Snapshot = {xmin=100, xmax=141, active=[]}
T2 (XID=160): Snapshot = {xmin=100, xmax=161, active=[]}

Visibility rules (simplified):
Tuple visible to transaction T if:
1. xmin committed before T's snapshot
2. xmax not committed OR xmax after T's snapshot

T1 sees: Version 1 (xmin=100 < 140, xmax=150 > 141) ✓
T2 sees: Version 2 (xmin=150 < 160, xmax=0) ✓

No locks needed for reads!
Readers never block writers.
Writers never block readers.
\`\`\`

### Snapshot Isolation — PostgreSQL Implementation

\`\`\`c
// PostgreSQL snapshot structure
typedef struct SnapshotData {
    TransactionId xmin;    // Oldest XID still active when snapshot taken
    TransactionId xmax;    // Next XID to be assigned (exclusive upper bound)
    TransactionId *xip;    // Array of active XIDs
    uint32 xcnt;           // Number of active XIDs
    // ... more fields
} SnapshotData;

// Take snapshot at transaction start
Snapshot GetTransactionSnapshot() {
    Snapshot snapshot = malloc(sizeof(SnapshotData));
    
    // Get current XID counter
    snapshot->xmax = ReadNextTransactionId();
    
    // Get oldest active XID
    snapshot->xmin = GetOldestActiveXID();
    
    // Copy list of active XIDs
    snapshot->xcnt = GetActiveTransactionCount();
    snapshot->xip = malloc(snapshot->xcnt * sizeof(TransactionId));
    CopyActiveTransactions(snapshot->xip, snapshot->xcnt);
    
    return snapshot;
}

// Check if XID is visible to snapshot
bool XidVisibleInSnapshot(TransactionId xid, Snapshot snapshot) {
    // Future transaction (after snapshot) = not visible
    if (xid >= snapshot->xmax) {
        return false;
    }
    
    // Very old transaction (before all active) = visible
    if (xid < snapshot->xmin) {
        return true;
    }
    
    // Check if XID is in active list (was in-progress)
    for (int i = 0; i < snapshot->xcnt; i++) {
        if (snapshot->xip[i] == xid) {
            return false;  // Was in-progress = not visible
        }
    }
    
    // Committed before snapshot = visible
    return true;
}

// Tuple visibility check
bool HeapTupleSatisfiesMVCC(HeapTuple tuple, Snapshot snapshot) {
    TransactionId xmin = tuple->t_xmin;
    TransactionId xmax = tuple->t_xmax;
    
    // Check tuple creator (xmin)
    if (!XidVisibleInSnapshot(xmin, snapshot)) {
        return false;  // Created by future/in-progress txn
    }
    
    // Check if tuple deleted/updated (xmax)
    if (xmax == 0) {
        return true;  // Not deleted
    }
    
    if (XidVisibleInSnapshot(xmax, snapshot)) {
        return false;  // Deleted by visible transaction
    }
    
    return true;  // Deleted by future/in-progress txn = still visible
}
\`\`\`

### MVCC Example — Concurrent Reads and Writes

\`\`\`
Timeline with MVCC:

t=0:  accounts(id=1, balance=1000, xmin=100, xmax=0)

t=1:  T1 (XID=150): BEGIN;
      T1 snapshot: {xmin=100, xmax=151, active=[150]}

t=2:  T2 (XID=160): BEGIN;
      T2 snapshot: {xmin=100, xmax=161, active=[150, 160]}

t=3:  T1: SELECT balance FROM accounts WHERE id = 1;
      Checks tuple (xmin=100, xmax=0):
      ├── xmin=100 < snapshot.xmax=151 ✓
      ├── xmin=100 not in active list ✓
      └── xmax=0 (not deleted) ✓
      Result: balance = 1000

t=4:  T2: UPDATE accounts SET balance = 900 WHERE id = 1;
      Creates new tuple version:
      ├── Old: (balance=1000, xmin=100, xmax=160)
      └── New: (balance=900, xmin=160, xmax=0)

t=5:  T1: SELECT balance FROM accounts WHERE id = 1;
      Checks old tuple (xmin=100, xmax=160):
      ├── xmin=100 visible ✓
      ├── xmax=160 not in T1's snapshot (XID=160 > xmax=151) ✗
      └── Deletion not visible, tuple still visible
      Result: balance = 1000 (still sees old version!)

t=6:  T2: COMMIT;
      Release locks, mark XID=160 as committed

t=7:  T1: SELECT balance FROM accounts WHERE id = 1;
      Still checks old tuple (xmin=100, xmax=160):
      ├── xmax=160 NOT in T1's snapshot
      └── T1's snapshot taken at t=1, before XID=160
      Result: balance = 1000 (Repeatable Read!)

t=8:  T1: COMMIT;

t=9:  T3 (XID=170): BEGIN;
      T3 snapshot: {xmin=100, xmax=171, active=[170]}

t=10: T3: SELECT balance FROM accounts WHERE id = 1;
      Checks old tuple (xmin=100, xmax=160):
      ├── xmax=160 < snapshot.xmax=171 ✓
      └── Deletion visible, tuple not visible
      Checks new tuple (xmin=160, xmax=0):
      ├── xmin=160 < snapshot.xmax=171 ✓
      └── Creation visible, tuple visible
      Result: balance = 900 (sees T2's update)

Key insight: T1 never saw T2's update even after T2 committed!
            Snapshot taken at BEGIN isolates from future changes.
\`\`\`

### PostgreSQL Hint Bits — Optimizing Visibility Checks

\`\`\`
Problem: Checking XID committed requires consulting clog (commit log)
├── clog lookup is expensive (disk I/O possible)
└── Every visibility check would hit clog

Solution: Hint bits in tuple header

Tuple header flags (t_infomask):
#define HEAP_XMIN_COMMITTED      0x0100  // xmin is committed
#define HEAP_XMIN_INVALID        0x0200  // xmin is aborted
#define HEAP_XMAX_COMMITTED      0x0400  // xmax is committed
#define HEAP_XMAX_INVALID        0x0800  // xmax is aborted

First access to tuple:
1. Check clog to see if xmin committed
2. Set HEAP_XMIN_COMMITTED hint bit
3. Future accesses skip clog lookup

Example:
T1 creates tuple → xmin=150, no hint bits set
T2 reads tuple:
  ├── Check if xmin=150 committed → clog lookup
  ├── Set HEAP_XMIN_COMMITTED bit
  └── Return visible
T3 reads same tuple:
  ├── See HEAP_XMIN_COMMITTED bit
  ├── Skip clog lookup
  └── Return visible (fast path!)

Hint bits reduce clog pressure by 100-1000x.

Dirty page implications:
├── Setting hint bit marks page dirty
├── Triggers eventual page write
├── But avoids repeated clog lookups
└── Net win for frequently-read tuples
\`\`\`

## Write Skew Anomaly — When Snapshot Isolation Fails

\`\`\`
Scenario: Bank account with constraint "total balance >= 0"

Accounts:
| id | balance |
|----|---------|
|  1 |   100   |
|  2 |   100   |

Constraint: balance(1) + balance(2) >= 0

T1 (withdraw from account 1):    T2 (withdraw from account 2):
BEGIN;                            BEGIN;
SELECT SUM(balance)               SELECT SUM(balance)
FROM accounts;                    FROM accounts;
-- Sees 200                       -- Sees 200

UPDATE accounts                   UPDATE accounts
SET balance = balance - 150       SET balance = balance - 150
WHERE id = 1;                     WHERE id = 2;
-- balance(1) = -50               -- balance(2) = -50

COMMIT;                           COMMIT;

Final state:
| id | balance |
|----|---------|
|  1 |   -50   |
|  2 |   -50   |

Total: -100 (CONSTRAINT VIOLATED!)

Why did this happen?
├── Both transactions read before either committed
├── Both saw total = 200
├── Both decided withdrawal was safe
└── Snapshot Isolation doesn't prevent this!

This is called Write Skew:
├── Transactions read overlapping data
├── Make decisions based on that data
├── Update disjoint data
└── Together violate constraint

Solution 1: Serializable Snapshot Isolation (SSI)
Solution 2: SELECT FOR UPDATE (explicit locking)
Solution 3: Application-level locking
\`\`\`

### Serializable Snapshot Isolation (SSI)

\`\`\`
SSI detects dangerous patterns at runtime:

Dangerous structure (rw-conflict):
T1: Read X
T2: Read Y
T1: Write Y
T2: Write X

SSI tracking:
1. Record read sets (SIREAD locks)
2. Detect rw-conflicts
3. If cycle of rw-conflicts → abort one transaction

PostgreSQL SSI implementation:

T1:                                T2:
BEGIN ISOLATION LEVEL              BEGIN ISOLATION LEVEL
  SERIALIZABLE;                      SERIALIZABLE;
SELECT SUM(balance);               SELECT SUM(balance);
-- Records SIREAD on accounts      -- Records SIREAD on accounts
UPDATE accounts                    UPDATE accounts
SET balance = -50                  SET balance = -50
WHERE id = 1;                      WHERE id = 2;
-- Detects write after T2 read     -- Detects write after T1 read
COMMIT;                            COMMIT;
-- First committer wins            -- ERROR: serialization failure

One transaction aborted to prevent anomaly!

SSI overhead:
├── Track read sets (SIREAD locks)
├── Check for conflicts on write
├── ~5-10% performance cost
└── Worth it for correctness guarantee

When to use:
├── Critical financial transactions
├── Inventory management
├── Anywhere constraints must hold
└── When application can retry aborted txns
\`\`\`

### MySQL Gap Locking — Preventing Phantoms

\`\`\`
Phantom problem (Repeatable Read without gap locks):

T1: SELECT * FROM accounts WHERE balance > 500;
-- Returns (id=2, balance=600)
                                T2: INSERT INTO accounts VALUES (3, 700);
                                T2: COMMIT;
T1: SELECT * FROM accounts WHERE balance > 500;
-- Returns (id=2, balance=600), (id=3, balance=700) ← PHANTOM!

InnoDB solution: Next-key locks (record lock + gap lock)

Next-key lock = Record lock + Gap lock
├── Record lock: Lock the actual row
└── Gap lock: Lock the gap before the row

Index scan locking:
SELECT * FROM accounts WHERE balance > 500 FOR UPDATE;

Locks acquired:
├── Record lock on id=2 (balance=600)
├── Gap lock on (500, 600)
├── Gap lock on (600, +∞)
└── Prevents INSERT of balance ∈ (500, +∞)

Gap lock example:
Index values: [100, 200, 500, 600]

SELECT * WHERE balance > 200 FOR UPDATE;
Locks:
├── Gap (200, 500)
├── Record 500
├── Gap (500, 600)
├── Record 600
├── Gap (600, +∞)
└── INSERT 400 blocked (in gap 200-500)

Gap lock conflicts:
├── Gap-S doesn't conflict with Gap-S
├── Gap-X doesn't conflict with Gap-X
├── Gap locks only block INSERT
└── Different from record locks!

Disabling gap locks:
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- Downgrades to Read Committed, no gap locks
-- Phantoms possible!
\`\`\`

## Predicate Locking — The Theoretical Ideal

\`\`\`
Predicate locking (theoretical, not used in practice):

Lock not just rows, but predicates:

T1: SELECT * FROM accounts WHERE balance > 500;
Acquires: Predicate lock "balance > 500"

T2: INSERT INTO accounts VALUES (3, 700);
Must check: Does (3, 700) satisfy "balance > 500"?
Yes → T2 blocks

T3: INSERT INTO accounts VALUES (4, 300);
Must check: Does (4, 300) satisfy "balance > 500"?
No → T3 proceeds

Perfect correctness!

Why not used in practice?
├── Predicate evaluation expensive (SAT problem)
├── Hard to index predicates
├── Lock conflicts hard to compute
└── Performance terrible

Practical approximations:
├── InnoDB: Gap locks (over-approximate predicates)
├── PostgreSQL SSI: Track read/write patterns
└── Both conservative (may abort unnecessarily) but fast
\`\`\`

## Transaction Isolation in Practice

\`\`\`
PostgreSQL isolation levels:

READ UNCOMMITTED → Actually Read Committed (no dirty reads)
READ COMMITTED   → Fresh snapshot per statement
REPEATABLE READ  → Snapshot at transaction start (SI)
SERIALIZABLE     → SSI (true serializability)

MySQL InnoDB isolation levels:

READ UNCOMMITTED → Actually allows dirty reads!
READ COMMITTED   → Fresh snapshot per statement
REPEATABLE READ  → Snapshot + gap locks (default)
SERIALIZABLE     → REPEATABLE READ + SELECT → SELECT FOR SHARE

Surprising fact:
MySQL REPEATABLE READ prevents phantoms (via gap locks).
PostgreSQL REPEATABLE READ prevents phantoms (via MVCC).
SQL standard allows phantoms in REPEATABLE READ!
Both exceed the standard.

Default choices:
├── PostgreSQL: READ COMMITTED (most common)
├── MySQL: REPEATABLE READ (InnoDB default)
├── Oracle: READ COMMITTED
└── SQL Server: READ COMMITTED (with row versioning)

Choosing isolation level:
READ COMMITTED:
├── Most applications
├── Lowest overhead
├── Acceptable inconsistencies

REPEATABLE READ:
├── Financial reports
├── Consistent snapshots
├── Can retry on serialization failure

SERIALIZABLE:
├── Critical financial transactions
├── Complex constraints
├── Must guarantee correctness
└── Accept retry overhead
\`\`\`

Transaction management is the heart of database correctness. Understanding locks, MVCC, snapshot isolation, and anomalies means understanding what guarantees you actually get — and what can still go wrong.`,

  fr: `# Gestion des transactions — L'illusion d'isolation

Les transactions créent l'illusion que vous êtes le seul utilisateur dans la base de données. Derrière cette illusion se trouve une machinerie sophistiquée : gestionnaires de verrous, chaînes de versions, suivi d'instantanés, détection de deadlocks.

## Verrouillage à deux phases (2PL)

\`\`\`
Protocole 2PL :

Phase 1 - Phase de croissance :
├── La transaction acquiert des verrous
└── Ne peut pas encore libérer de verrous

Phase 2 - Phase de réduction :
├── La transaction libère des verrous
└── Ne peut pas acquérir de nouveaux verrous
\`\`\`

## MVCC — Contrôle de concurrence multi-versions

\`\`\`
Principe MVCC : Conserver plusieurs versions de chaque tuple

Versions de tuple :
│ Version 1 (xmin=100, xmax=150) balance = 1000
│ Version 2 (xmin=150, xmax=0) balance = 900

Pas de verrous nécessaires pour les lectures !
Les lecteurs ne bloquent jamais les écrivains.
\`\`\`

## Anomalie Write Skew

\`\`\`
Scénario : Contrainte bancaire

Les deux transactions lisent avant que l'une ne committe
Les deux décident que le retrait est sûr
Ensemble violent la contrainte

Solution : Serializable Snapshot Isolation (SSI)
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "What is the purpose of Strict 2PL holding all locks until COMMIT/ROLLBACK?",
      options: [
        "To improve performance",
        "To prevent cascading aborts — if T1 releases lock early and aborts, T2 that read T1's data must also abort",
        "To reduce memory usage",
        "To simplify implementation",
      ],
      correct: 1,
    },
    {
      question: "How does the wait-for graph detect deadlocks?",
      options: [
        "By counting locks",
        "Build directed graph where edge T1→T2 means 'T1 waits for T2', run cycle detection (DFS) — cycle = deadlock",
        "By timing out transactions",
        "By comparing transaction IDs",
      ],
      correct: 1,
    },
    {
      question: "In PostgreSQL MVCC, when is a tuple visible to a transaction?",
      options: [
        "Always",
        "If xmin committed before snapshot AND (xmax=0 OR xmax not visible to snapshot)",
        "If it has the highest XID",
        "If it's the newest version",
      ],
      correct: 1,
    },
    {
      question:
        "What is the write skew anomaly that Snapshot Isolation doesn't prevent?",
      options: [
        "Two transactions writing same row",
        "Two transactions read overlapping data, update disjoint data, together violate constraint (e.g., both withdraw leaving negative total)",
        "Dirty reads",
        "Lost updates",
      ],
      correct: 1,
    },
    {
      question: "How do PostgreSQL hint bits optimize visibility checks?",
      options: [
        "By compressing tuples",
        "Cache commit status in tuple header (HEAP_XMIN_COMMITTED) — avoids repeated clog lookups, 100-1000x speedup",
        "By indexing transactions",
        "By using more memory",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quel est l'objectif du 2PL strict qui conserve tous les verrous jusqu'à COMMIT/ROLLBACK ?",
      options: [
        "Améliorer les performances",
        "Prévenir les abandons en cascade — si T1 libère un verrou tôt et abandonne, T2 qui a lu les données de T1 doit aussi abandonner",
        "Réduire l'utilisation mémoire",
        "Simplifier l'implémentation",
      ],
      correct: 1,
    },
    {
      question: "Comment le graphe d'attente détecte-t-il les deadlocks ?",
      options: [
        "En comptant les verrous",
        "Construit un graphe dirigé où l'arête T1→T2 signifie 'T1 attend T2', exécute détection de cycle (DFS)",
        "En timeout les transactions",
        "En comparant les IDs de transaction",
      ],
      correct: 1,
    },
    {
      question:
        "Dans PostgreSQL MVCC, quand un tuple est-il visible pour une transaction ?",
      options: [
        "Toujours",
        "Si xmin committé avant snapshot ET (xmax=0 OU xmax pas visible au snapshot)",
        "S'il a le XID le plus élevé",
        "S'il est la version la plus récente",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce que l'anomalie write skew que Snapshot Isolation ne prévient pas ?",
      options: [
        "Deux transactions écrivant la même ligne",
        "Deux transactions lisent des données qui se chevauchent, mettent à jour des données disjointes, violent ensemble la contrainte",
        "Lectures sales",
        "Mises à jour perdues",
      ],
      correct: 1,
    },
    {
      question:
        "Comment les hint bits PostgreSQL optimisent-ils les vérifications de visibilité ?",
      options: [
        "En compressant les tuples",
        "Cache le statut commit dans l'en-tête tuple (HEAP_XMIN_COMMITTED) — évite les recherches clog répétées",
        "En indexant les transactions",
        "En utilisant plus de mémoire",
      ],
      correct: 1,
    },
  ],
};
