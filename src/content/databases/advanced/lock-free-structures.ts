export const content = {
  en: `# Lock-Free Data Structures

## Why Lock-Free Matters for Databases

Traditional locking in databases has a fundamental problem: **lock contention**. When many threads compete for the same lock, all but one are blocked — wasting CPU cycles and causing latency spikes.

\`\`\`
Mutex-based concurrency:
  Thread 1: acquire lock → do work → release lock
  Thread 2: try acquire lock → BLOCKED → wait → acquire → work → release
  Thread 3: try acquire lock → BLOCKED → wait → wait → acquire → work

Problems:
  Priority inversion: high-priority thread blocked by low-priority lock holder
  Deadlock: Thread A holds Lock 1, wants Lock 2
            Thread B holds Lock 2, wants Lock 1
            Both blocked forever
  Convoying: fast threads queued behind slow lock holder
  OOM: lock holder crashes → lock never released → all waiters blocked forever
\`\`\`

\`\`\`
Lock-free guarantee levels:

Wait-free:    Every thread completes its operation in a bounded number of steps
              regardless of what other threads do. Strongest guarantee.
              Very hard to implement. Used in: real-time systems.

Lock-free:    The system as a whole makes progress — at least one thread
              completes its operation in a bounded number of steps.
              Some threads may retry indefinitely (but rarely in practice).

Obstruction-free: A thread makes progress if it runs in isolation
                  (no contention). Weakest guarantee.
\`\`\`

## Compare-And-Swap (CAS) — The Primitive

All lock-free algorithms are built on **Compare-And-Swap (CAS)**, a hardware atomic instruction:

\`\`\`c
// CAS semantics (conceptually):
bool compare_and_swap(int *addr, int expected, int new_value) {
    // ATOMIC (single hardware instruction, no interruption possible):
    if (*addr == expected) {
        *addr = new_value;
        return true;   // success: we wrote new_value
    }
    return false;      // failure: someone else changed *addr
}

// x86 assembly: CMPXCHG instruction
// ARM assembly: LDXR/STXR (load-exclusive/store-exclusive pair)
// Java: Unsafe.compareAndSwapInt(), VarHandle.compareAndSet()
// C++: std::atomic<T>::compare_exchange_strong/weak()
// Go:  sync/atomic.CompareAndSwapInt64()
\`\`\`

\`\`\`c
// Lock-free counter increment using CAS:
void atomic_increment(std::atomic<int>& counter) {
    int expected = counter.load(std::memory_order_relaxed);
    while (!counter.compare_exchange_weak(
               expected,           // if counter == expected
               expected + 1,       // set counter = expected + 1
               std::memory_order_release,
               std::memory_order_relaxed)) {
        // CAS failed: counter changed since we read it
        // expected is now updated to current value
        // retry with new expected value
    }
}

// Why compare_exchange_WEAK (not strong)?
// On ARM: weak can spuriously fail (LDXR/STXR can fail without contention)
// Weak is faster in a loop (avoids retry logic inside the instruction)
// Strong: never spuriously fails, but may be slower on some architectures
\`\`\`

## The ABA Problem

The most subtle bug in lock-free programming:

\`\`\`
Scenario (lock-free stack):
  Stack: [A] → [B] → [C]
  Thread 1 reads top = A, prepares to pop A
  Thread 1 is preempted (suspended by OS)
  
  Thread 2 pops A (stack: [B] → [C])
  Thread 2 pops B (stack: [C])
  Thread 2 pushes A back (stack: [A] → [C])   ← A reused!
  
  Thread 1 resumes: CAS(top, A, B)
    top is A → CAS succeeds!
    But B is no longer in the stack (already freed/reused)
    Stack is now corrupted: [B] → [C]  (B points to freed memory)
\`\`\`

\`\`\`
Solutions:

1. Tagged pointer (most common):
   Instead of CAS on pointer alone, CAS on (pointer, version_counter)
   
   struct TaggedPointer {
     Node* ptr;
     uint64_t version;  // incremented on every pop
   };
   
   CAS((A, ver=5), (A, ver=6)) fails because version changed
   Thread 1's CAS would fail: expected (A, ver=1) but found (A, ver=3)
   
   Implementation: pack pointer + version into 128-bit value
                   x86-64: CMPXCHG16B instruction (128-bit CAS)
                   Or: use top 16 bits of 64-bit pointer (unused on x86-64)

2. Hazard pointers:
   Before accessing a node: publish "I'm using this pointer" globally
   Before freeing: check if any thread has published this pointer
   If yes: defer free until no thread holds hazard pointer to it
   Used by: Folly (Facebook's C++ library), many lock-free collections

3. Epoch-based reclamation (RCU — Read-Copy-Update):
   Readers don't acquire locks, just enter/exit epochs
   Writers update atomic pointer, then wait for all readers in old epoch to finish
   Then safely free old data
   Used by: Linux kernel, many databases for hot-path data structures
\`\`\`

## Lock-Free Linked List

\`\`\`c
// Michael & Scott lock-free singly linked list (simplified)
struct Node {
    int value;
    std::atomic<Node*> next;
};

struct LockFreeList {
    std::atomic<Node*> head;
    
    void insert(int value) {
        Node* new_node = new Node{value, nullptr};
        Node* expected_head;
        do {
            expected_head = head.load(std::memory_order_relaxed);
            new_node->next.store(expected_head, std::memory_order_relaxed);
        } while (!head.compare_exchange_weak(
                     expected_head, new_node,
                     std::memory_order_release,
                     std::memory_order_relaxed));
        // If CAS fails: another thread inserted → retry with new head
        // Invariant: new_node->next always points to valid node or null
    }
    
    bool remove(int value) {
        // Deletion is harder — need to mark node as "logically deleted"
        // before physically removing it (two-step process)
        // Marked node: set low bit of next pointer (pointer alignment trick)
        // ...
    }
};
\`\`\`

## Lock-Free Queue — Michael & Scott Algorithm

The most widely used lock-free queue, used in Java's ConcurrentLinkedQueue:

\`\`\`c
struct Node {
    int value;
    std::atomic<Node*> next{nullptr};
};

struct MSQueue {
    std::atomic<Node*> head;
    std::atomic<Node*> tail;
    
    MSQueue() {
        // Sentinel node (dummy node to simplify head/tail management)
        Node* sentinel = new Node{};
        head.store(sentinel);
        tail.store(sentinel);
    }
    
    void enqueue(int value) {
        Node* new_node = new Node{value};
        while (true) {
            Node* last = tail.load(std::memory_order_acquire);
            Node* next = last->next.load(std::memory_order_acquire);
            
            if (next == nullptr) {
                // Tail is pointing to last node — try to link new node
                if (last->next.compare_exchange_weak(next, new_node)) {
                    // Try to advance tail (OK if it fails — another thread will)
                    tail.compare_exchange_weak(last, new_node);
                    return;
                }
            } else {
                // Tail is not pointing to last node — advance it
                // (another thread did enqueue but didn't advance tail yet)
                tail.compare_exchange_weak(last, next);
            }
        }
    }
    
    bool dequeue(int& value) {
        while (true) {
            Node* first = head.load(std::memory_order_acquire);
            Node* last  = tail.load(std::memory_order_acquire);
            Node* next  = first->next.load(std::memory_order_acquire);
            
            if (first == last) {
                if (next == nullptr) return false;  // Queue empty
                tail.compare_exchange_weak(last, next);  // Tail behind
            } else {
                value = next->value;
                if (head.compare_exchange_weak(first, next)) {
                    delete first;  // Safe? No — needs hazard pointers/RCU!
                    return true;
                }
            }
        }
    }
};
\`\`\`

## MVCC Without Locks — How PostgreSQL Really Works

PostgreSQL's MVCC implementation is essentially a lock-free read path:

\`\`\`
Read path (no locks acquired for visibility check):
  For each tuple version:
    1. Read xmin (inserting transaction ID)
    2. Read xmax (deleting transaction ID)
    3. Check pg_xact (commit log) for transaction status
    4. Compare against snapshot (xmin, xmax, active_xids)
    
    All of this is READ-ONLY — no lock acquisition!
    Multiple readers can check the same tuple simultaneously.
    No reader ever blocks another reader.
    No reader ever blocks a writer.
    No writer ever blocks a reader.

Write path (lock-free for non-conflicting writes):
  New row insertion:
    Allocate page space (free space map — uses atomic operations)
    Write new tuple (xmin=current_txn, xmax=0)
    No lock on existing tuples (inserting new row doesn't conflict)

  Update (row version replacement):
    Read old row (lock-free)
    Acquire ROW EXCLUSIVE lock on OLD row (prevents concurrent update)
    Mark old row: xmax = current_txn (atomic write)
    Insert new row version (lock-free allocation)
    Release ROW EXCLUSIVE lock

  The ROW EXCLUSIVE lock is held only for the moment of xmax update
  → Much shorter lock hold time than traditional row locking
\`\`\`

\`\`\`
Transaction status (pg_xact) — the commit log:
  One bit per transaction: 0=in-progress, 1=committed, 2=aborted, 3=sub-committed
  
  2 bits per transaction: 4 transactions per byte
  1GB of pg_xact covers 4 billion transactions
  
  Checking transaction status:
    status = pg_xact[(xid / 4)] >> ((xid % 4) * 2) & 0x3
    Single byte read — no lock needed!
    Once committed/aborted, never changes → CPU cache works perfectly
\`\`\`

## Optimistic Concurrency Control (OCC)

\`\`\`
OCC assumption: conflicts are RARE.
  Instead of locking before reading (pessimistic), read freely and
  check for conflicts only at commit time.

Three phases:
  1. Read phase:
     Execute transaction, build read set and write set
     Don't acquire any locks
     Write changes to private workspace (not yet visible to others)
  
  2. Validation phase:
     Check: did any other transaction commit changes to our read set?
     If YES: abort and retry (conflict detected)
     If NO: proceed to write phase
  
  3. Write phase:
     Apply private workspace changes to shared database state
     Changes become visible to other transactions

OCC in PostgreSQL:
  Serializable Snapshot Isolation (SSI) is OCC-based:
  Read: track read set (which rows, which predicates)
  Commit: check if any committed transaction wrote to our read set
  If conflict detected: ERROR: could not serialize access due to concurrent update

OCC in databases:
  Works well for: read-heavy workloads, low conflict rate
  Works poorly for: write-heavy workloads, hot rows (high conflict → many retries)
  
  Throughput comparison under high contention:
    Pessimistic locking: serialized → low throughput but no retries
    OCC: many retries → wasted work → can be WORSE than locking under contention
\`\`\`

## Lock-Free B-Tree — Bw-Tree

The Bw-Tree (Buzz-Tree) is Microsoft's lock-free B-tree, used in SQL Server Hekaton (in-memory OLTP) and Azure Cosmos DB:

\`\`\`
Key innovations:

1. Mapping Table (indirection layer):
   Instead of accessing pages directly, all pages accessed via mapping table:
   page_id → physical_address
   
   CAS on mapping table entry = atomic page update
   No in-place page modification needed!

2. Delta records (append-only updates):
   Instead of modifying page in place:
     Create small "delta record" describing the change
     CAS it onto the head of the page's delta chain
   
   Page P:  [k1:v1, k2:v2, k3:v3]
   Insert k4:v4:
     delta_insert = {type: INSERT, key: k4, value: v4, next: P}
     mapping_table[page_id] = &delta_insert  (CAS!)
   
   Read must apply all deltas to reconstruct current state
   When delta chain too long → consolidation (create new clean page)

3. Structure Modification Operations (SMOs):
   Page splits and merges split into multiple atomic steps
   Each step is individually reversible
   If a thread crashes mid-split: other threads can complete or reverse it
   
   Split steps:
   Step 1: Add "half-split" delta to old page (marks split in progress)
   Step 2: Install new page in mapping table (CAS)
   Step 3: Update parent to point to both pages
   Step 4: Remove half-split delta
   
   If crash between steps: any thread can detect and complete the split

Performance characteristics:
  Read: follow mapping table → traverse delta chain → O(log N + delta_length)
  Write: CAS on mapping table → O(1) amortized (but consolidation is O(page_size))
  No locks → excellent scalability on multi-core
  Used in SQL Server for tables with >100K updates/second
\`\`\`

## Memory Ordering and Memory Barriers

Lock-free programming requires explicit memory ordering — without it, CPU and compiler reorder instructions in ways that break correctness:

\`\`\`
CPU memory ordering models:
  Sequential Consistency (SC): operations appear in program order to all CPUs
    Intuitive but slow — requires memory barriers after every operation
  
  Total Store Order (TSO): x86/x86-64
    Stores may be delayed (in CPU's store buffer) but executed in order
    Loads may be reordered with respect to stores
    Effectively: loads are relaxed, stores are release, CAS is sequentially consistent
  
  Weak ordering: ARM, POWER
    Almost any reordering is allowed
    Explicit memory barriers required for correct synchronization

C++ memory_order:
  memory_order_relaxed:   no ordering guarantees, just atomicity
                          Use for: statistics counters, retry loops
  memory_order_acquire:   no reads/writes after this can move before this point
                          Use for: loading a pointer before dereferencing it
  memory_order_release:   no reads/writes before this can move after this point
                          Use for: storing a pointer after writing the data
  memory_order_acq_rel:   both acquire and release
                          Use for: CAS operations (read-modify-write)
  memory_order_seq_cst:   total sequential consistency (default, most expensive)

Example — publish a new node:
  // WRONG (can be reordered on ARM):
  node->value = 42;           // write value
  head = node;                // publish node (relaxed store)
  // Another thread might see head == node but node->value == garbage!
  
  // CORRECT:
  node->value = 42;
  std::atomic_thread_fence(std::memory_order_release);  // memory barrier
  head.store(node, std::memory_order_release);           // release store
  // The fence ensures value=42 is visible before head update
\`\`\`

## Lock-Free Data Structures in Production Databases

\`\`\`
PostgreSQL:
  Lock-free: MVCC read path, free space map (atomic), transaction status (pg_xact)
  Lock-based: buffer pool (LWLock), WAL (WALInsertLock), catalog cache

InnoDB:
  Lock-free: adaptive hash index reads, buffer pool page lookup
  Lock-based: buffer pool LRU list (mutex), undo log (mutex)

RocksDB:
  Lock-free: MemTable reads (SkipList with lock-free reads), SuperVersion pointer
  Lock-based: MemTable writes (spinlock per SkipList node), compaction

Redis:
  Single-threaded: no locks needed at all for command processing!
  The ultimate "lock-free" — by definition (no concurrent threads)

FoundationDB:
  Multi-version concurrency with optimistic transactions
  All reads are lock-free (read at a consistent version)
  Writes: OCC validation at commit

Silo (MIT research OLTP engine):
  Full OCC with epoch-based garbage collection
  No centralized lock manager
  Achieves near-linear scaling to 32+ cores on TPC-C benchmark
\`\`\`
`,

  fr: `# Structures de données sans verrou

## Pourquoi les structures sans verrou sont importantes

La contention de verrous dans les bases de données a un problème fondamental : quand de nombreux threads se disputent le même verrou, tous sauf un sont bloqués — gaspillant des cycles CPU et causant des pics de latence.

## Compare-And-Swap (CAS) — La primitive

\`\`\`c
// Sémantique CAS (conceptuellement) :
bool compare_and_swap(int *addr, int expected, int new_value) {
    // ATOMIQUE (instruction matérielle unique) :
    if (*addr == expected) {
        *addr = new_value;
        return true;   // succès : nous avons écrit new_value
    }
    return false;      // échec : quelqu'un d'autre a changé *addr
}
\`\`\`

\`\`\`
Niveaux de garantie sans verrou :

Wait-free :    Chaque thread complète son opération en un nombre borné d'étapes.
               Garantie la plus forte. Très difficile à implémenter.

Lock-free :    Le système dans son ensemble progresse — au moins un thread
               complète son opération en un nombre borné d'étapes.

Obstruction-free : Un thread progresse s'il s'exécute isolément.
                   Garantie la plus faible.
\`\`\`

## Le problème ABA

\`\`\`
Scénario (pile sans verrou) :
  Pile : [A] → [B] → [C]
  Thread 1 lit sommet = A, se prépare à dépiler A
  Thread 1 est préempté
  
  Thread 2 dépile A, dépile B, remet A (Pile : [A] → [C])
  
  Thread 1 reprend : CAS(sommet, A, B)
    sommet est A → CAS réussit !
    Mais B n'est plus dans la pile (libéré/réutilisé)
    Pile corrompue : [B] → [C]

Solutions :
  1. Pointeur étiqueté : CAS sur (pointeur, compteur_version)
  2. Pointeurs de danger : publier "j'utilise ce pointeur" globalement
  3. RCU (Read-Copy-Update) : basé sur les époques
\`\`\`

## MVCC sans verrous — Comment PostgreSQL fonctionne vraiment

\`\`\`
Chemin de lecture (aucun verrou acquis pour la vérification de visibilité) :
  Pour chaque version de tuple :
    1. Lire xmin (ID de transaction d'insertion)
    2. Lire xmax (ID de transaction de suppression)
    3. Vérifier pg_xact (journal de commit) pour le statut
    4. Comparer avec le snapshot
    
    Tout est EN LECTURE SEULE — pas d'acquisition de verrou !
    Plusieurs lecteurs peuvent vérifier le même tuple simultanément.
    Aucun lecteur ne bloque jamais un autre lecteur.
    Aucun lecteur ne bloque jamais un écrivain.
    Aucun écrivain ne bloque jamais un lecteur.
\`\`\`

## Contrôle de Concurrence Optimiste (OCC)

\`\`\`
Hypothèse OCC : les conflits sont RARES.
  Au lieu de verrouiller avant de lire (pessimiste), lire librement et
  vérifier les conflits uniquement au moment du commit.

Trois phases :
  1. Phase de lecture :
     Exécuter la transaction, construire ensemble de lecture et d'écriture
     Pas d'acquisition de verrous
     Écrire les changements dans un espace de travail privé
  
  2. Phase de validation :
     Vérifier : une autre transaction a-t-elle commité des changements sur notre ensemble de lecture ?
     Si OUI : abandonner et réessayer
     Si NON : procéder à la phase d'écriture
  
  3. Phase d'écriture :
     Appliquer les changements de l'espace de travail privé à l'état partagé

OCC fonctionne bien pour : charges à lecture intensive, faible taux de conflit
OCC fonctionne mal pour : charges à écriture intensive, lignes chaudes
\`\`\`

## Bw-Tree — B-Tree sans verrou de Microsoft

\`\`\`
Innovations clés :

1. Table de mapping (couche d'indirection) :
   page_id → adresse_physique
   CAS sur l'entrée de la table de mapping = mise à jour atomique de page

2. Enregistrements delta (mises à jour append-only) :
   Au lieu de modifier la page en place :
     Créer un petit "enregistrement delta" décrivant le changement
     CAS sur la tête de la chaîne delta de la page
   
   Page P :  [k1:v1, k2:v2, k3:v3]
   Insérer k4:v4 :
     delta_insert = {type: INSERT, clé: k4, valeur: v4, suivant: P}
     table_mapping[page_id] = &delta_insert  (CAS !)

3. Structure Modification Operations (SMOs) :
   Divisions et fusions de pages divisées en plusieurs étapes atomiques
   Chaque étape est individuellement réversible
   Utilisé dans SQL Server pour les tables avec >100K mises à jour/seconde
\`\`\`

## Ordonnancement mémoire et barrières mémoire

\`\`\`
Modèles d'ordonnancement mémoire CPU :
  Cohérence séquentielle : opérations dans l'ordre du programme pour tous les CPUs
  Total Store Order (TSO) : x86/x86-64
  Ordonnancement faible : ARM, POWER — presque tout réordonnancement autorisé

memory_order C++ :
  relaxed :   pas de garanties d'ordonnancement, juste atomicité
  acquire :   aucune lecture/écriture après ne peut bouger avant ce point
  release :   aucune lecture/écriture avant ne peut bouger après ce point
  acq_rel :   acquire et release
  seq_cst :   cohérence séquentielle totale (défaut, plus coûteux)
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the ABA problem in lock-free programming and how do tagged pointers solve it?",
      options: [
        "ABA occurs when two threads read the same value simultaneously causing a data race",
        "ABA occurs when a value changes from A to B and back to A between a thread's read and CAS — the CAS succeeds incorrectly because the pointer looks the same but the underlying state changed. Tagged pointers add a version counter to the CAS target, so (A, ver=3) fails against expected (A, ver=1) even though the pointer is the same.",
        "ABA is a compiler optimization that reorders atomic operations incorrectly",
        "ABA occurs when a lock-free algorithm allocates memory from address A, B, and A again in sequence",
      ],
      correct: 1,
    },
    {
      question:
        "Why is PostgreSQL's MVCC read path considered lock-free and what makes this significant for performance?",
      options: [
        "PostgreSQL skips consistency checks on reads to avoid locking overhead",
        "MVCC reads only need to examine xmin/xmax fields and check pg_xact (the commit log) — all read-only operations requiring no lock acquisition. Multiple readers can examine the same tuple simultaneously, no reader ever blocks another reader or writer, and no writer ever blocks a reader. This enables true read/write parallelism.",
        "PostgreSQL uses a single global lock for all reads which is faster than per-row locks",
        "MVCC is lock-free because it stores old row versions in a separate undo log",
      ],
      correct: 1,
    },
    {
      question:
        "What is the key difference between Optimistic Concurrency Control (OCC) and pessimistic locking, and when does OCC perform worse?",
      options: [
        "OCC uses shared locks while pessimistic locking uses exclusive locks",
        "Pessimistic locking acquires locks before reading (blocking others immediately). OCC reads freely without locks and validates at commit — aborting and retrying if conflicts are detected. OCC performs worse under high contention (hot rows, write-heavy workloads) because many transactions abort and retry, wasting work — sometimes worse than pessimistic locking.",
        "OCC only works for read-only transactions while pessimistic locking handles writes",
        "OCC requires more memory because it stores complete transaction snapshots",
      ],
      correct: 1,
    },
    {
      question:
        "How does the Bw-Tree achieve lock-free B-tree operations using delta records and a mapping table?",
      options: [
        "The Bw-Tree eliminates pages entirely, storing all data in a flat sorted array",
        "Instead of modifying pages in place (which requires locks), updates create small delta records prepended to a page's chain via CAS on the mapping table entry. The mapping table (page_id → physical address) is the single CAS point — atomically updating it installs the delta without modifying the existing page. Reads apply deltas to reconstruct current state.",
        "The Bw-Tree uses a distributed lock manager that grants locks in microseconds",
        "Delta records are written to a separate WAL and applied to pages during checkpoints",
      ],
      correct: 1,
    },
    {
      question:
        "Why does memory ordering matter in lock-free programming and what can go wrong without explicit memory barriers?",
      options: [
        "Memory ordering only matters on NUMA systems with non-uniform memory access",
        "CPUs and compilers reorder instructions for performance — on ARM/POWER, almost any reordering is allowed. Without explicit memory barriers, a thread writing a node's value then publishing its pointer might have the store reordered: another thread sees the new pointer but reads garbage for the value (the write hasn't propagated yet). Release/acquire semantics enforce that all writes before release() are visible after acquire().",
        "Memory ordering affects only cache coherency on multi-socket systems",
        "Memory barriers are only needed for non-atomic operations — atomic CAS handles ordering automatically",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Qu'est-ce que le problème ABA en programmation sans verrou et comment les pointeurs étiquetés le résolvent-ils ?",
      options: [
        "ABA se produit quand deux threads lisent la même valeur simultanément causant une course aux données",
        "ABA se produit quand une valeur change de A à B et revient à A entre la lecture d'un thread et son CAS — le CAS réussit incorrectement car le pointeur semble identique mais l'état sous-jacent a changé. Les pointeurs étiquetés ajoutent un compteur de version à la cible du CAS, donc (A, ver=3) échoue contre attendu (A, ver=1) même si le pointeur est le même.",
        "ABA est une optimisation du compilateur qui réordonne incorrectement les opérations atomiques",
        "ABA se produit quand un algorithme sans verrou alloue de la mémoire aux adresses A, B et A à nouveau en séquence",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi le chemin de lecture MVCC de PostgreSQL est-il considéré comme sans verrou et pourquoi est-ce significatif pour les performances ?",
      options: [
        "PostgreSQL saute les vérifications de cohérence sur les lectures pour éviter l'overhead de verrouillage",
        "Les lectures MVCC n'ont besoin que d'examiner les champs xmin/xmax et de vérifier pg_xact — toutes des opérations en lecture seule sans acquisition de verrou. Plusieurs lecteurs peuvent examiner le même tuple simultanément, aucun lecteur ne bloque jamais un autre lecteur ou écrivain, et aucun écrivain ne bloque jamais un lecteur.",
        "PostgreSQL utilise un seul verrou global pour toutes les lectures qui est plus rapide que les verrous par ligne",
        "MVCC est sans verrou car il stocke les anciennes versions de lignes dans un undo log séparé",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle est la différence clé entre le Contrôle de Concurrence Optimiste (OCC) et le verrouillage pessimiste, et quand OCC est-il moins performant ?",
      options: [
        "OCC utilise des verrous partagés tandis que le verrouillage pessimiste utilise des verrous exclusifs",
        "Le verrouillage pessimiste acquiert des verrous avant de lire. OCC lit librement sans verrous et valide au commit — abandonnant et réessayant si des conflits sont détectés. OCC est moins performant sous forte contention (lignes chaudes, charges intensives en écriture) car de nombreuses transactions abandonnent et réessaient, gaspillant du travail.",
        "OCC ne fonctionne que pour les transactions en lecture seule tandis que le verrouillage pessimiste gère les écritures",
        "OCC nécessite plus de mémoire car il stocke des snapshots de transaction complets",
      ],
      correct: 1,
    },
    {
      question:
        "Comment le Bw-Tree atteint-il des opérations B-tree sans verrou en utilisant des enregistrements delta et une table de mapping ?",
      options: [
        "Le Bw-Tree élimine entièrement les pages, stockant toutes les données dans un tableau trié plat",
        "Au lieu de modifier les pages en place (ce qui nécessite des verrous), les mises à jour créent de petits enregistrements delta préfixés à la chaîne d'une page via CAS sur l'entrée de la table de mapping. La table de mapping (page_id → adresse physique) est le seul point de CAS — la mettre à jour atomiquement installe le delta sans modifier la page existante.",
        "Le Bw-Tree utilise un gestionnaire de verrous distribué qui accorde des verrous en microsecondes",
        "Les enregistrements delta sont écrits dans un WAL séparé et appliqués aux pages lors des checkpoints",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi l'ordonnancement mémoire est-il important en programmation sans verrou et que peut-il se passer sans barrières mémoire explicites ?",
      options: [
        "L'ordonnancement mémoire n'est important que sur les systèmes NUMA",
        "Les CPUs et compilateurs réordonnent les instructions pour les performances — sur ARM/POWER, presque tout réordonnancement est autorisé. Sans barrières mémoire explicites, un thread écrivant la valeur d'un nœud puis publiant son pointeur pourrait avoir le store réordonné : un autre thread voit le nouveau pointeur mais lit des données corrompues. Les sémantiques release/acquire garantissent que toutes les écritures avant release() sont visibles après acquire().",
        "Les barrières mémoire n'affectent que la cohérence de cache sur les systèmes multi-socket",
        "Les barrières mémoire ne sont nécessaires que pour les opérations non atomiques — le CAS atomique gère l'ordonnancement automatiquement",
      ],
      correct: 1,
    },
  ],
};
