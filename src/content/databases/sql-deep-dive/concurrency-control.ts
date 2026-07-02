export const content = {
  en: `# Concurrency Control

## Why Concurrency Control Exists

When multiple transactions run simultaneously, they can interfere with each other in ways that produce incorrect results. Concurrency control is the set of mechanisms that prevent these interferences while maximizing throughput.

\`\`\`
Without concurrency control:

T1: READ balance → 1000
T2: READ balance → 1000
T1: WRITE balance = 1000 - 200 = 800
T2: WRITE balance = 1000 - 300 = 700   ← overwrites T1's write!
Final: 700  (should be 500)
\`\`\`

## Transaction Anomalies

### Dirty Read
Reading uncommitted data from another transaction.
\`\`\`
T1: UPDATE orders SET total = 999 WHERE id = 1  (not committed)
T2: SELECT total FROM orders WHERE id = 1  → reads 999
T1: ROLLBACK
T2 has read data that never existed
\`\`\`

### Non-Repeatable Read
Reading the same row twice in a transaction gets different values.
\`\`\`
T1: SELECT total FROM orders WHERE id = 1  → 100
T2: UPDATE orders SET total = 200 WHERE id = 1; COMMIT
T1: SELECT total FROM orders WHERE id = 1  → 200  ← changed!
\`\`\`

### Phantom Read
A query returns different sets of rows when executed twice in the same transaction.
\`\`\`
T1: SELECT COUNT(*) FROM orders WHERE status = 'pending'  → 5
T2: INSERT INTO orders (status) VALUES ('pending'); COMMIT
T1: SELECT COUNT(*) FROM orders WHERE status = 'pending'  → 6  ← new row!
\`\`\`

### Write Skew
Two transactions each read overlapping data and make decisions based on it, resulting in a globally inconsistent state — even though neither transaction individually violated any constraint.
\`\`\`
Constraint: at least one doctor must be on call at all times
T1: SELECT COUNT(*) FROM doctors WHERE on_call = true  → 2
T2: SELECT COUNT(*) FROM doctors WHERE on_call = true  → 2
T1: UPDATE doctors SET on_call = false WHERE id = 1  (both see count=2, safe to remove one)
T2: UPDATE doctors SET on_call = false WHERE id = 2  (both see count=2, safe to remove one)
Result: 0 doctors on call — constraint violated!
\`\`\`

Write skew cannot be prevented by row-level locking alone — it requires predicate locks or Serializable isolation.

## SQL Isolation Levels

SQL standard defines four isolation levels, each preventing different anomalies:

\`\`\`
Isolation Level    | Dirty Read | Non-Repeatable | Phantom | Write Skew
-------------------|------------|----------------|---------|------------
Read Uncommitted   |  Possible  |    Possible    | Possible|  Possible
Read Committed     |  Prevented |    Possible    | Possible|  Possible
Repeatable Read    |  Prevented |    Prevented   | Possible|  Possible
Serializable       |  Prevented |    Prevented   |Prevented|  Prevented
\`\`\`

\`\`\`sql
-- Set isolation level for a transaction
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- or
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
\`\`\`

**Important:** PostgreSQL's Repeatable Read actually prevents phantom reads too (stronger than the SQL standard requires). MySQL InnoDB's Repeatable Read prevents phantoms for consistent reads but not for locking reads (\`SELECT FOR UPDATE\`).

## Two-Phase Locking (2PL)

The classical approach to concurrency control. Every transaction must acquire locks before accessing data and can only release locks after committing or aborting — never during.

\`\`\`
Phase 1 (Growing):   acquire locks, never release
Phase 2 (Shrinking): release locks, never acquire

COMMIT/ABORT → release all locks
\`\`\`

### Lock Types
\`\`\`
Shared (S)    — read lock. Multiple transactions can hold simultaneously.
Exclusive (X) — write lock. Only one transaction can hold. Blocks all others.

Compatibility matrix:
        S      X
S    [  OK  | WAIT ]
X    [ WAIT | WAIT ]
\`\`\`

### Lock Granularity Hierarchy (PostgreSQL)
\`\`\`
Database
  └── Schema
        └── Table        ← ACCESS SHARE, ROW SHARE, ROW EXCLUSIVE,
              └── Page       SHARE UPDATE EXCLUSIVE, SHARE,
                    └── Row  SHARE ROW EXCLUSIVE, EXCLUSIVE, ACCESS EXCLUSIVE
\`\`\`

\`\`\`sql
-- These implicitly acquire table-level locks:
SELECT                    → ACCESS SHARE (least restrictive)
SELECT FOR UPDATE         → ROW SHARE
INSERT/UPDATE/DELETE      → ROW EXCLUSIVE
CREATE INDEX CONCURRENTLY → SHARE UPDATE EXCLUSIVE
CREATE INDEX              → SHARE
ALTER TABLE               → ACCESS EXCLUSIVE (most restrictive, blocks everything)

-- See current locks:
SELECT pid, relation::regclass, mode, granted
FROM pg_locks
WHERE relation IS NOT NULL;
\`\`\`

### Deadlock
Two transactions waiting for each other's locks — circular dependency.

\`\`\`
T1: LOCK row A → wants row B
T2: LOCK row B → wants row A
Both wait forever → deadlock
\`\`\`

PostgreSQL detects deadlocks using a **wait-for graph**. When a cycle is detected, it aborts the transaction that has done the least work (to minimize wasted effort).

\`\`\`sql
-- Prevent deadlocks by always acquiring locks in the same order:
-- Bad (can deadlock):
T1: UPDATE accounts SET balance = balance - 100 WHERE id = 1;
    UPDATE accounts SET balance = balance + 100 WHERE id = 2;
T2: UPDATE accounts SET balance = balance - 50  WHERE id = 2;
    UPDATE accounts SET balance = balance + 50  WHERE id = 1;

-- Good (consistent order, no deadlock):
-- Always lock lower id first
T1: UPDATE accounts SET ... WHERE id = 1; UPDATE ... WHERE id = 2;
T2: UPDATE accounts SET ... WHERE id = 1; UPDATE ... WHERE id = 2;
\`\`\`

## MVCC — How PostgreSQL Actually Does It

PostgreSQL does not use 2PL for reads. Instead it uses **Multi-Version Concurrency Control**. Every transaction sees a **snapshot** of the database as it existed at transaction start (or statement start, depending on isolation level).

\`\`\`
Snapshot = {xmin: current_xid, xmax: current_xid, xip: [active_xids]}

A tuple version is visible to my snapshot if:
  - tuple.xmin committed before my snapshot AND
  - tuple.xmin is not in my xip list AND
  - tuple.xmax is 0 OR tuple.xmax is my own xid OR
    tuple.xmax started after my snapshot OR
    tuple.xmax aborted
\`\`\`

\`\`\`
Timeline:
  xid=100: INSERT row A (xmin=100, xmax=0)  → committed
  xid=200: starts, takes snapshot {xmin=200, xip=[]}
  xid=300: UPDATE row A → new version (xmin=300, xmax=0), old (xmin=100, xmax=300)
  xid=300: commits

  xid=200 reads row A → sees xmin=100 version (xmax=300, but 300 > snapshot xmin=200)
  xid=400 (new txn) reads row A → sees xmin=300 version (committed, in snapshot)
\`\`\`

**Read Committed** — takes a new snapshot at each statement start. Sees all committed data.
**Repeatable Read** — takes one snapshot at transaction start. Never sees changes committed after start.
**Serializable** — uses SSI (Serializable Snapshot Isolation).

## Serializable Snapshot Isolation (SSI)

PostgreSQL's implementation of true Serializable isolation without heavy locking. It tracks **read-write dependencies** between transactions and aborts transactions that would create a cycle (which would indicate non-serializable execution).

\`\`\`
T1 reads data written by T2's future write → rw-dependency T1→T2
T2 reads data written by T1's future write → rw-dependency T2→T1
Cycle detected → one transaction aborted with:
  ERROR: could not serialize access due to read/write dependencies
\`\`\`

\`\`\`sql
-- SSI in action — detecting write skew:
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT COUNT(*) FROM doctors WHERE on_call = true;  -- reads predicate
UPDATE doctors SET on_call = false WHERE id = 1;
COMMIT;  -- may fail with serialization error if concurrent conflict detected

-- Application must retry on serialization failures:
DO $$
BEGIN
  LOOP
    BEGIN
      -- your transaction here
      COMMIT;
      EXIT;  -- success, exit loop
    EXCEPTION WHEN serialization_failure THEN
      -- retry
    END;
  END LOOP;
END $$;
\`\`\`

SSI has low overhead compared to strict 2PL — it only tracks dependencies, not full lock tables.

## MySQL InnoDB Locking

InnoDB uses a combination of MVCC and locking:

### Gap Locks
InnoDB locks **gaps between index values** to prevent phantom reads in Repeatable Read:

\`\`\`sql
-- This locks the gap (10, 20) — no other transaction can insert
-- a row with id between 10 and 20 until this transaction commits
SELECT * FROM orders WHERE id BETWEEN 10 AND 20 FOR UPDATE;
\`\`\`

\`\`\`
Index values: [5] [10] ← gap lock → [20] [25]
                   ↑
          No INSERT of id=15 allowed while lock held
\`\`\`

### Next-Key Locks
The default InnoDB lock for range queries — combines a record lock + gap lock on the next gap.

\`\`\`
Next-key lock on value 20 = record lock on 20 + gap lock on (10, 20]
\`\`\`

### Intention Locks
Table-level locks that signal intent to acquire row-level locks:
\`\`\`
IS (Intention Shared)    — transaction will acquire S locks on rows
IX (Intention Exclusive) — transaction will acquire X locks on rows

Allows checking table-level conflicts without scanning all rows.
\`\`\`

\`\`\`sql
-- See InnoDB lock waits:
SELECT 
  r.trx_id waiting_trx_id,
  r.trx_mysql_thread_id waiting_thread,
  r.trx_query waiting_query,
  b.trx_id blocking_trx_id,
  b.trx_mysql_thread_id blocking_thread
FROM information_schema.innodb_lock_waits w
JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;
\`\`\`

## SELECT FOR UPDATE vs SELECT FOR SHARE

\`\`\`sql
-- Exclusive lock — no other transaction can read or write
SELECT * FROM orders WHERE id = 1 FOR UPDATE;

-- Shared lock — others can read but not write
SELECT * FROM orders WHERE id = 1 FOR SHARE;  -- PostgreSQL
SELECT * FROM orders WHERE id = 1 LOCK IN SHARE MODE;  -- MySQL

-- Skip locked rows (queue processing pattern):
SELECT * FROM jobs WHERE status = 'pending' 
ORDER BY created_at 
LIMIT 1 
FOR UPDATE SKIP LOCKED;
-- Returns first unlocked pending job — perfect for job queues
\`\`\`

\`FOR UPDATE SKIP LOCKED\` is the correct pattern for implementing a job queue in PostgreSQL. Multiple workers can pull jobs concurrently without deadlocks.

## Lock Monitoring

\`\`\`sql
-- PostgreSQL: find blocking queries
SELECT 
  blocked.pid AS blocked_pid,
  blocked.query AS blocked_query,
  blocking.pid AS blocking_pid,
  blocking.query AS blocking_query,
  now() - blocked.query_start AS blocked_duration
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking 
  ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
WHERE blocked.cardinality(pg_blocking_pids(blocked.pid)) > 0;

-- Kill a blocking query:
SELECT pg_terminate_backend(blocking_pid);

-- See all locks with details:
SELECT pid, locktype, relation::regclass, mode, granted, 
       now() - query_start AS duration
FROM pg_locks l
JOIN pg_stat_activity a USING (pid)
WHERE NOT granted
ORDER BY duration DESC;
\`\`\`
`,

  fr: `# Contrôle de la concurrence

## Pourquoi le contrôle de la concurrence existe

Quand plusieurs transactions s'exécutent simultanément, elles peuvent interférer les unes avec les autres et produire des résultats incorrects.

\`\`\`
Sans contrôle de la concurrence :

T1: LIRE solde → 1000
T2: LIRE solde → 1000
T1: ÉCRIRE solde = 1000 - 200 = 800
T2: ÉCRIRE solde = 1000 - 300 = 700   ← écrase l'écriture de T1 !
Final : 700  (devrait être 500)
\`\`\`

## Anomalies de transaction

### Lecture sale (Dirty Read)
Lire des données non commitées d'une autre transaction.

### Lecture non répétable (Non-Repeatable Read)
Lire la même ligne deux fois dans une transaction donne des valeurs différentes.

### Lecture fantôme (Phantom Read)
Une requête retourne différents ensembles de lignes quand exécutée deux fois dans la même transaction.

### Write Skew
Deux transactions lisent des données qui se chevauchent et prennent des décisions basées dessus, résultant en un état globalement incohérent.

\`\`\`
Contrainte : au moins un médecin doit être de garde en permanence
T1: SELECT COUNT(*) FROM doctors WHERE on_call = true  → 2
T2: SELECT COUNT(*) FROM doctors WHERE on_call = true  → 2
T1: UPDATE doctors SET on_call = false WHERE id = 1
T2: UPDATE doctors SET on_call = false WHERE id = 2
Résultat : 0 médecins de garde — contrainte violée !
\`\`\`

## Niveaux d'isolation SQL

\`\`\`
Niveau d'isolation   | Lecture sale | Non-Répétable | Fantôme | Write Skew
---------------------|--------------|---------------|---------|------------
Read Uncommitted     |   Possible   |    Possible   | Possible|  Possible
Read Committed       |   Empêché    |    Possible   | Possible|  Possible
Repeatable Read      |   Empêché    |    Empêché    | Possible|  Possible
Serializable         |   Empêché    |    Empêché    | Empêché |  Empêché
\`\`\`

\`\`\`sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
\`\`\`

## Verrouillage en deux phases (2PL)

Chaque transaction doit acquérir des verrous avant d'accéder aux données et ne peut les libérer qu'après commit ou abandon.

\`\`\`
Phase 1 (Croissance) :   acquérir des verrous, ne jamais libérer
Phase 2 (Décroissance) : libérer des verrous, ne jamais acquérir
\`\`\`

### Types de verrous
\`\`\`
Partagé (S)   — verrou de lecture. Plusieurs transactions peuvent le tenir simultanément.
Exclusif (X)  — verrou d'écriture. Une seule transaction peut le tenir.

Matrice de compatibilité :
        S      X
S    [  OK  | WAIT ]
X    [ WAIT | WAIT ]
\`\`\`

### Deadlock
Deux transactions attendant les verrous l'une de l'autre — dépendance circulaire.

\`\`\`sql
-- Prévenir les deadlocks en acquérant toujours les verrous dans le même ordre :
-- Toujours verrouiller le plus petit id en premier
T1: UPDATE accounts SET ... WHERE id = 1; UPDATE ... WHERE id = 2;
T2: UPDATE accounts SET ... WHERE id = 1; UPDATE ... WHERE id = 2;
\`\`\`

## MVCC — Comment PostgreSQL le fait réellement

PostgreSQL n'utilise pas 2PL pour les lectures. Il utilise le **Contrôle de Concurrence Multi-Version**. Chaque transaction voit un **snapshot** de la base de données.

\`\`\`
Read Committed   — nouveau snapshot à chaque début d'instruction
Repeatable Read  — un snapshot au début de la transaction
Serializable     — utilise SSI (Serializable Snapshot Isolation)
\`\`\`

## Serializable Snapshot Isolation (SSI)

Implémentation PostgreSQL de la vraie isolation Serializable sans verrouillage lourd. Elle suit les **dépendances lecture-écriture** entre transactions et abandonne celles qui créeraient un cycle.

\`\`\`sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- votre transaction ici
COMMIT;  -- peut échouer avec : ERROR: could not serialize access

-- L'application doit réessayer sur les échecs de sérialisation
\`\`\`

## Verrouillage InnoDB MySQL

### Gap Locks
InnoDB verrouille les **espaces entre les valeurs d'index** pour prévenir les lectures fantômes :

\`\`\`sql
SELECT * FROM orders WHERE id BETWEEN 10 AND 20 FOR UPDATE;
-- Verrouille l'espace (10, 20) — aucune autre transaction ne peut insérer
-- une ligne avec id entre 10 et 20
\`\`\`

### SELECT FOR UPDATE vs SELECT FOR SHARE

\`\`\`sql
-- Verrou exclusif
SELECT * FROM orders WHERE id = 1 FOR UPDATE;

-- Verrou partagé
SELECT * FROM orders WHERE id = 1 FOR SHARE;

-- Ignorer les lignes verrouillées (pattern de file de jobs) :
SELECT * FROM jobs WHERE status = 'pending'
ORDER BY created_at LIMIT 1
FOR UPDATE SKIP LOCKED;
\`\`\`

\`FOR UPDATE SKIP LOCKED\` est le bon pattern pour implémenter une file de jobs dans PostgreSQL. Plusieurs workers peuvent traiter des jobs en parallèle sans deadlocks.

## Surveillance des verrous

\`\`\`sql
-- PostgreSQL : trouver les requêtes bloquantes
SELECT 
  blocked.pid AS pid_bloqué,
  blocked.query AS requête_bloquée,
  blocking.pid AS pid_bloquant,
  blocking.query AS requête_bloquante
FROM pg_stat_activity blocked
JOIN pg_stat_activity blocking 
  ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
WHERE cardinality(pg_blocking_pids(blocked.pid)) > 0;

-- Tuer une requête bloquante :
SELECT pg_terminate_backend(pid_bloquant);
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What makes write skew different from a lost update, and why is it harder to prevent?",
      options: [
        "Write skew only occurs in NoSQL databases; lost updates occur in SQL databases",
        "Write skew involves two transactions reading overlapping data and making individually valid but globally inconsistent updates — row-level locks alone cannot prevent it",
        "Write skew is prevented by Read Committed isolation; lost updates require Repeatable Read",
        "Write skew only affects tables with no primary key",
      ],
      correct: 1,
    },
    {
      question:
        "In Two-Phase Locking, why can a transaction NEVER release a lock during the growing phase?",
      options: [
        "Releasing locks early would cause the lock table to overflow",
        "Releasing a lock during the growing phase could allow another transaction to modify that data, then re-acquiring the lock would see a different state — violating serializability",
        "Database engines do not support partial lock releases",
        "Releasing locks early would trigger an automatic ROLLBACK",
      ],
      correct: 1,
    },
    {
      question:
        "What is the core difference between PostgreSQL's Repeatable Read and Serializable isolation?",
      options: [
        "Repeatable Read prevents phantom reads; Serializable does not",
        "Serializable uses strict 2PL; Repeatable Read uses MVCC",
        "Repeatable Read can still allow write skew anomalies; Serializable uses SSI to detect and prevent read-write dependency cycles",
        "Serializable isolation is only available in PostgreSQL Enterprise",
      ],
      correct: 2,
    },
    {
      question:
        "Why is SELECT FOR UPDATE SKIP LOCKED the correct pattern for a job queue?",
      options: [
        "It automatically commits the transaction after selecting",
        "It allows multiple workers to select different unlocked jobs concurrently without blocking each other or creating deadlocks",
        "It prevents any other transaction from reading the jobs table",
        "It automatically deletes processed jobs from the queue",
      ],
      correct: 1,
    },
    {
      question: "What is an InnoDB Gap Lock and why does it exist?",
      options: [
        "A lock on a NULL value gap in a sparse index",
        "A lock on the space between index values that prevents INSERT of new rows in that range — used to prevent phantom reads in Repeatable Read isolation",
        "A lock acquired when a table has gaps from deleted rows",
        "A performance optimization that skips locking rows not matching the WHERE clause",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Qu'est-ce qui distingue le write skew d'une mise à jour perdue, et pourquoi est-il plus difficile à prévenir ?",
      options: [
        "Le write skew se produit uniquement dans les bases NoSQL ; les mises à jour perdues dans les bases SQL",
        "Le write skew implique deux transactions lisant des données qui se chevauchent et effectuant des mises à jour individuellement valides mais globalement incohérentes — les verrous au niveau des lignes seuls ne peuvent pas l'empêcher",
        "Le write skew est empêché par l'isolation Read Committed ; les mises à jour perdues nécessitent Repeatable Read",
        "Le write skew n'affecte que les tables sans clé primaire",
      ],
      correct: 1,
    },
    {
      question:
        "Dans le verrouillage en deux phases, pourquoi une transaction ne peut-elle JAMAIS libérer un verrou pendant la phase de croissance ?",
      options: [
        "Libérer des verrous tôt provoquerait un débordement de la table de verrous",
        "Libérer un verrou pendant la phase de croissance pourrait permettre à une autre transaction de modifier ces données, puis réacquérir le verrou verrait un état différent — violant la sérialisabilité",
        "Les moteurs de bases de données ne supportent pas les libérations partielles de verrous",
        "Libérer des verrous tôt déclencherait un ROLLBACK automatique",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle est la différence fondamentale entre Repeatable Read et Serializable dans PostgreSQL ?",
      options: [
        "Repeatable Read empêche les lectures fantômes ; Serializable non",
        "Serializable utilise le 2PL strict ; Repeatable Read utilise MVCC",
        "Repeatable Read peut encore permettre des anomalies de write skew ; Serializable utilise SSI pour détecter et prévenir les cycles de dépendances lecture-écriture",
        "L'isolation Serializable n'est disponible que dans PostgreSQL Enterprise",
      ],
      correct: 2,
    },
    {
      question:
        "Pourquoi SELECT FOR UPDATE SKIP LOCKED est-il le bon pattern pour une file de jobs ?",
      options: [
        "Il commite automatiquement la transaction après la sélection",
        "Il permet à plusieurs workers de sélectionner différents jobs non verrouillés en parallèle sans se bloquer mutuellement ni créer de deadlocks",
        "Il empêche toute autre transaction de lire la table des jobs",
        "Il supprime automatiquement les jobs traités de la file",
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce qu'un Gap Lock InnoDB et pourquoi existe-t-il ?",
      options: [
        "Un verrou sur une valeur NULL dans un index sparse",
        "Un verrou sur l'espace entre les valeurs d'index qui empêche l'INSERT de nouvelles lignes dans cette plage — utilisé pour prévenir les lectures fantômes en isolation Repeatable Read",
        "Un verrou acquis quand une table a des espaces dus à des lignes supprimées",
        "Une optimisation de performance qui saute le verrouillage des lignes ne correspondant pas à la clause WHERE",
      ],
      correct: 1,
    },
  ],
};
