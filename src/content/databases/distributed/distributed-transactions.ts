export const content = {
  en: `# Distributed Transactions

## The Problem

A distributed transaction spans multiple nodes, databases, or services. All participants must either commit or abort — atomicity must hold across machine boundaries.

\`\`\`
Single-node transaction (easy):
  BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 'alice';
  UPDATE accounts SET balance = balance + 100 WHERE id = 'bob';
  COMMIT;
  
  If anything fails: ROLLBACK. Atomicity guaranteed by local WAL.

Distributed transaction (hard):
  Alice's account: Shard 1 (Node A, datacenter US-East)
  Bob's account:   Shard 2 (Node B, datacenter US-West)
  
  How do you atomically debit Alice AND credit Bob when:
    - Node A might crash mid-transaction
    - Node B might crash mid-transaction
    - Network between A and B might fail
    - The coordinator orchestrating this might crash
\`\`\`

## Two-Phase Commit (2PC)

The classical protocol for distributed atomicity. Every distributed database and XA-compliant system implements 2PC.

### Protocol

\`\`\`
Participants: Coordinator C, Participant P1, Participant P2

Phase 1 — Prepare:
  C → P1: "Prepare to commit transaction T"
  C → P2: "Prepare to commit transaction T"
  
  P1: write all changes to WAL, acquire all locks, reply "YES" (ready)
      OR find a problem (constraint violation, deadlock) → reply "NO" (abort)
  P2: same as P1
  
  C waits for all responses.

Phase 2 — Commit or Abort:
  If ALL participants said YES:
    C → P1: "Commit"
    C → P2: "Commit"
    Both participants apply changes, release locks, reply "Done"
    
  If ANY participant said NO (or timeout):
    C → P1: "Abort"
    C → P2: "Abort"
    Both participants rollback, release locks
\`\`\`

\`\`\`
State machine for each participant:

INIT
  ↓ receive Prepare
PREPARED (voted YES, holding locks)
  ↓ receive Commit
COMMITTED
  OR
  ↓ receive Abort
ABORTED

Key property: once a participant votes YES (enters PREPARED state),
it has PROMISED to commit if the coordinator says commit.
It cannot unilaterally abort. It must wait.
\`\`\`

### The Blocking Problem — 2PC's Fatal Flaw

\`\`\`
Scenario: coordinator crashes after participants vote YES but before sending Commit/Abort

P1 state: PREPARED — voted YES, holding locks, waiting for Commit or Abort
P2 state: PREPARED — voted YES, holding locks, waiting for Commit or Abort

P1 and P2 are now BLOCKED:
  They cannot commit (don't know if P2 voted YES)
  They cannot abort (they promised to commit if coordinator says so)
  They must hold locks indefinitely until coordinator recovers

If coordinator takes 30 minutes to recover:
  All rows P1 and P2 modified are locked for 30 minutes
  No other transaction can touch those rows
  System appears frozen to users

This is the 2PC blocking problem — it cannot be solved without additional protocol.
\`\`\`

\`\`\`
Coordinator recovery:
  Coordinator writes "COMMIT T" or "ABORT T" to its own WAL before sending Phase 2
  On recovery: read WAL → determine decision → re-send to participants

  But if coordinator crashes BEFORE writing to WAL:
    Was the decision commit or abort? Unknown.
    Must ask participants: "What did you vote for T?"
    
    If all voted YES: safe to commit (or abort — coordinator decides)
    If any voted NO: must abort
    
  Participants must log their votes to durable storage BEFORE sending YES
  Otherwise: crash and recover → forget vote → cannot reconstruct state
\`\`\`

### Optimizations

\`\`\`
Presumed Abort (optimization):
  Coordinator does NOT log ABORT decisions
  On recovery, if transaction not in log: presume abort
  Saves one fsync for every aborted transaction
  
  Used by: most 2PC implementations

Read-Only Optimization:
  Participant that only reads data:
    Votes YES in Phase 1 without logging or locking
    Can be forgotten after Phase 1 (no Phase 2 message needed)
  
  Used by: distributed SQL databases

One-Phase Commit (special case):
  Only one participant → skip Phase 1
  Coordinator sends Commit directly to single participant
  
Early Prepare:
  Start preparing participants while transaction is still running
  (pipeline prepare with last few operations)
\`\`\`

## Three-Phase Commit (3PC)

3PC adds a third phase to make 2PC non-blocking — but at the cost of more messages and complexity.

\`\`\`
Phase 1 — CanCommit:
  C → participants: "Can you commit?"
  Participants reply YES/NO (no locks yet, no WAL write)

Phase 2 — PreCommit:
  If all YES: C → participants: "Prepare to commit" (write WAL, acquire locks)
  Participants acknowledge PreCommit
  
  KEY DIFFERENCE: participants now KNOW the coordinator intends to commit
  If coordinator crashes in Phase 2: participants can safely commit

Phase 3 — DoCommit:
  C → participants: "Commit"
  Participants commit and release locks

Why non-blocking:
  If coordinator crashes after Phase 2 (PreCommit):
    Participants know: "All participants saw CanCommit=YES AND PreCommit"
    → Safe to commit without coordinator
    → Elect a new coordinator from participants
    → New coordinator commits

If coordinator crashes during Phase 1:
  Participants have NOT received PreCommit → safe to abort
\`\`\`

\`\`\`
3PC limitations:
  Only non-blocking in synchronous networks (no arbitrary message delays)
  Network partition: can still cause split-brain
    Partition A: participants saw PreCommit → commit
    Partition B: participants did NOT see PreCommit → abort
    → Two groups make different decisions!
  
  3PC is rarely used in practice — network partitions make it unsafe
  Paxos/Raft are used instead for true partition-tolerant consensus
\`\`\`

## Saga Pattern

The modern alternative to distributed transactions. Break a long-running transaction into a sequence of local transactions, each with a compensating transaction for rollback.

\`\`\`
Transfer $100 from Alice to Bob:

Forward transactions:
  T1: Debit Alice $100        (on Account Service / Shard 1)
  T2: Credit Bob $100         (on Account Service / Shard 2)

Compensating transactions:
  C1: Credit Alice $100       (undoes T1)
  C2: Debit Bob $100          (undoes T2)

Execution (happy path):
  T1 succeeds → T2 succeeds → Done ✓

Execution (T2 fails):
  T1 succeeds → T2 fails → Execute C1 (credit Alice back) → Saga aborted

Execution (T1 fails):
  T1 fails → Saga aborted immediately (no compensation needed)
\`\`\`

### Saga Coordination Styles

**Choreography:**
\`\`\`
No central coordinator. Services communicate via events/messages.

OrderService:         publishes "OrderCreated"
                              ↓
PaymentService:       receives "OrderCreated" → charges payment
                      publishes "PaymentProcessed" (success) or "PaymentFailed"
                              ↓
InventoryService:     receives "PaymentProcessed" → reserves inventory
                      publishes "InventoryReserved" or "InventoryFailed"
                              ↓
ShippingService:      receives "InventoryReserved" → creates shipment
                      publishes "ShipmentCreated"

On failure:
  InventoryService publishes "InventoryFailed"
                              ↓
  PaymentService receives "InventoryFailed" → refunds payment
                              ↓
  OrderService receives "PaymentRefunded" → cancels order

Advantages: no single point of failure, loose coupling
Disadvantages: hard to understand flow, distributed logic, cycle risk
\`\`\`

**Orchestration:**
\`\`\`
Central saga orchestrator drives the process.

SagaOrchestrator:
  1. Tell PaymentService: "Charge Alice $100"
     PaymentService: "Done" (or "Failed")
  2. Tell InventoryService: "Reserve item #42"
     InventoryService: "Done" (or "Failed")
  3. Tell ShippingService: "Create shipment"
     ShippingService: "Done" (or "Failed")

On failure at step 2:
  SagaOrchestrator tells PaymentService: "Refund Alice $100" (compensation)
  SagaOrchestrator marks saga as failed

State machine stored in saga orchestrator's database:
  {saga_id: "T123", status: "compensating", step: 1, compensation_step: 1}

Advantages: easy to understand, centralized state, easy to debug
Disadvantages: orchestrator is bottleneck, single point of failure
             (mitigated by making orchestrator stateless + DB-backed)
\`\`\`

### Saga Failure Modes

\`\`\`
Idempotency is critical:
  Network can deliver a message twice (at-least-once delivery)
  PaymentService might receive "Charge Alice $100" twice
  Must detect duplicate: if payment_id already exists → return "already done"
  
  Implementation:
    Each saga step has a unique idempotency key
    PaymentService: INSERT INTO payments (idempotency_key, amount)
                    ON CONFLICT (idempotency_key) DO NOTHING
                    RETURNING *;

Compensating transaction might also fail:
  PaymentService is down when orchestrator tries to refund
  Must retry compensation indefinitely (or alert human operator)
  Cannot leave saga in half-completed state

Isolation is NOT provided:
  Between T1 completing and C1 executing, other transactions see intermediate state
  Alice's balance might be $0 briefly → other queries see this!
  
  "Dirty reads" are visible between saga steps
  Mitigation: semantic locks, countermeasures, careful saga design
\`\`\`

## Try-Confirm-Cancel (TCC)

TCC is a variant of Saga that provides stronger guarantees by reserving resources before committing.

\`\`\`
Three operations per service:

Try:     reserve resources (don't commit yet)
Confirm: commit the reserved resources
Cancel:  release reserved resources

Transfer $100 from Alice to Bob:

Try phase:
  PaymentService.try():
    Alice balance: 1000 → reserve 100 → available: 900, reserved: 100
    Return: reservation_id = "R1"
  
  RecipientService.try():
    Bob balance: 500
    Create pending credit: +100 → pending_credit: 100
    Return: reservation_id = "R2"

Confirm phase (all tries succeeded):
  PaymentService.confirm("R1"):
    available: 900, reserved: 0 → balance: 900 (deduct reserved)
  
  RecipientService.confirm("R2"):
    balance: 500 + pending_credit: 100 → balance: 600

Cancel phase (any try failed):
  PaymentService.cancel("R1"):
    available: 900 + reserved: 100 → balance: 1000 (restore)
  
  RecipientService.cancel("R2"):
    pending_credit: 100 → 0 (discard)
\`\`\`

\`\`\`
TCC vs Saga:
  Saga: compensating transactions undo completed work (may have visible side effects)
  TCC:  cancel releases reserved resources (no committed work to undo)
  
  TCC provides better isolation: resources are reserved, not committed
  Other transactions see "reserved" amounts, not "committed" changes
  
  TCC downside: requires try/confirm/cancel implementation in every service
                Much more code than a simple Saga step
                
  Used by: Alibaba payment systems, ByteDance, financial systems requiring
           stronger consistency than pure Saga
\`\`\`

## XA Transactions

XA is the standard (X/Open DTP) interface for distributed transactions using 2PC. Supported by PostgreSQL, MySQL, Oracle, IBM DB2, and many message queues.

\`\`\`sql
-- PostgreSQL XA syntax
PREPARE TRANSACTION 'txn_transfer_001';
-- (participant is now in PREPARED state, ready for coordinator decision)

-- Coordinator decides:
COMMIT PREPARED 'txn_transfer_001';
-- OR
ROLLBACK PREPARED 'txn_transfer_001';

-- See prepared transactions (blocking transactions!):
SELECT gid, prepared, owner, database
FROM pg_prepared_xacts;
-- Any row here = locks held, blocking other transactions
-- If coordinator crashed: must manually commit or rollback these!
\`\`\`

\`\`\`
XA in Java (JTA - Java Transaction API):
UserTransaction tx = ctx.getUserTransaction();
tx.begin();

Connection conn1 = datasource1.getConnection(); // Shard 1
Connection conn2 = datasource2.getConnection(); // Shard 2

conn1.prepareStatement("UPDATE accounts SET balance=balance-100 WHERE id='alice'").execute();
conn2.prepareStatement("UPDATE accounts SET balance=balance+100 WHERE id='bob'").execute();

tx.commit(); // JTA coordinates 2PC across both connections

// Under the hood:
// Phase 1: datasource1.prepare(), datasource2.prepare()
// Phase 2: datasource1.commit(), datasource2.commit()
\`\`\`

\`\`\`
XA problems in practice:
  Performance: 2PC adds 2 round trips, extra fsyncs per transaction
  Blocking: coordinator crash leaves prepared transactions blocking
  Operability: prepared transactions must be monitored and manually resolved
  
  Many architects avoid XA entirely:
    Use Saga instead (eventual consistency, no blocking)
    Design to avoid cross-service transactions (monolith or careful service boundaries)
    Use a single database with proper partitioning (avoid the problem entirely)
\`\`\`

## Google Spanner's Approach — External Consistency

Spanner achieves external consistency (stronger than serializability) across a globally distributed database using TrueTime.

\`\`\`
TrueTime API:
  TT.now()   → returns TimeInterval [earliest, latest]
              where actual current time is guaranteed within this interval
  TT.after(t) → true if t has definitely passed
  TT.before(t) → true if t has definitely not yet passed

  Uncertainty: typically ±4ms (GPS + atomic clocks in every datacenter)

Commit Wait:
  Before committing transaction T with timestamp s:
    Wait until TT.after(s) is true
    (wait until the uncertainty window has passed)
    Then commit
  
  Effect:
    If T1 commits before T2 starts (real time):
      T1's commit timestamp < T2's start time
      TrueTime guarantees this ordering is visible to all observers
    
    Any later transaction that reads after T1 commits will see T1's writes.
    External consistency: distributed transactions behave like a single-node DB.

Cost:
  Commit wait = TrueTime uncertainty = typically 4-10ms
  Every write transaction waits 4-10ms before committing
  Cross-region: uncertainty can be 10-20ms → 10-20ms added to every write
  
  Worth it: Spanner's external consistency is the strongest available
            No other database provides this at global scale
\`\`\`

## Choosing a Distributed Transaction Strategy

\`\`\`
Two-Phase Commit (2PC / XA):
  ✓ Strong ACID guarantees
  ✓ Transparent to application (XA handles coordination)
  ✗ Blocking on coordinator failure
  ✗ Performance overhead (2 round trips, extra fsyncs)
  ✗ Operational complexity (monitor prepared transactions)
  Best for: tightly coupled systems, same database vendor,
            financial systems where consistency > availability

Saga:
  ✓ Non-blocking (no distributed locks)
  ✓ Works across heterogeneous services
  ✓ High availability (each step independent)
  ✗ No isolation between steps
  ✗ Compensating transactions add complexity
  ✗ Eventual consistency only
  Best for: microservices, long-running business transactions,
            e-commerce order flows, anywhere consistency can be eventual

TCC:
  ✓ Better isolation than Saga (resources reserved, not committed)
  ✓ Non-blocking
  ✗ High implementation cost (3 operations per service)
  Best for: financial systems needing stronger consistency than Saga
            but cannot use 2PC

Avoid distributed transactions:
  ✓ Simplest, most performant
  Design data so related operations touch one service/shard
  Use event sourcing + eventual consistency for cross-service data
  Best for: most systems — redesign first before choosing a protocol
\`\`\`
`,

  fr: `# Transactions distribuées

## Le problème

Une transaction distribuée couvre plusieurs nœuds, bases de données ou services. Tous les participants doivent soit committer soit abandonner — l'atomicité doit tenir à travers les frontières des machines.

## Two-Phase Commit (2PC)

Le protocole classique pour l'atomicité distribuée.

\`\`\`
Phase 1 — Préparer :
  Coordinateur → P1 : "Préparez-vous à committer la transaction T"
  Coordinateur → P2 : "Préparez-vous à committer la transaction T"
  
  P1 : écrire tous les changements dans le WAL, acquérir les verrous, répondre "OUI"
  P2 : idem

Phase 2 — Committer ou Abandonner :
  Si TOUS ont dit OUI :
    Coordinateur → P1 : "Committer"
    Coordinateur → P2 : "Committer"
    
  Si UN participant a dit NON :
    Coordinateur → P1 : "Abandonner"
    Coordinateur → P2 : "Abandonner"
\`\`\`

### Le problème de blocage — Le défaut fatal du 2PC

\`\`\`
Scénario : le coordinateur plante après que les participants aient voté OUI
           mais avant d'envoyer Commit/Abort

P1 : PRÉPARÉ — voté OUI, tenant les verrous, attendant
P2 : PRÉPARÉ — voté OUI, tenant les verrous, attendant

P1 et P2 sont maintenant BLOQUÉS :
  Ils ne peuvent pas committer (ne savent pas si P2 a voté OUI)
  Ils ne peuvent pas abandonner (ils ont promis de committer si demandé)
  Doivent tenir les verrous indéfiniment jusqu'à la récupération du coordinateur
\`\`\`

## Saga Pattern

L'alternative moderne aux transactions distribuées.

\`\`\`
Transactions de transfert de 100€ d'Alice à Bob :

Transactions directes :
  T1 : Débiter Alice 100€    (Service de compte / Shard 1)
  T2 : Créditer Bob 100€     (Service de compte / Shard 2)

Transactions compensatoires :
  C1 : Recréditer Alice 100€  (annule T1)
  C2 : Débiter Bob 100€       (annule T2)

Exécution (chemin heureux) :
  T1 réussit → T2 réussit → Terminé ✓

Exécution (T2 échoue) :
  T1 réussit → T2 échoue → Exécuter C1 → Saga annulée
\`\`\`

### Modes de coordination de Saga

\`\`\`
Chorégraphie :
  Pas de coordinateur central. Les services communiquent via des événements.
  Avantages : pas de point de défaillance unique, couplage faible
  Inconvénients : flux difficile à comprendre, logique distribuée

Orchestration :
  Un orchestrateur saga central pilote le processus.
  Avantages : facile à comprendre, état centralisé, facile à déboguer
  Inconvénients : l'orchestrateur est un goulot d'étranglement
\`\`\`

## Try-Confirm-Cancel (TCC)

TCC fournit des garanties plus fortes en réservant des ressources avant de committer.

\`\`\`
Trois opérations par service :

Try :    réserver des ressources (ne pas committer encore)
Confirm : committer les ressources réservées
Cancel :  libérer les ressources réservées

Phase Try :
  PaymentService.try() :
    Solde Alice : 1000 → réserver 100 → disponible : 900, réservé : 100

Phase Confirm :
  PaymentService.confirm() :
    disponible : 900, réservé : 0 → solde : 900

Phase Cancel (si échec) :
  PaymentService.cancel() :
    disponible : 900 + réservé : 100 → solde : 1000 (restauré)
\`\`\`

## Transactions XA

XA est l'interface standard pour les transactions distribuées utilisant 2PC.

\`\`\`sql
-- Syntaxe XA PostgreSQL
PREPARE TRANSACTION 'txn_transfer_001';

-- Le coordinateur décide :
COMMIT PREPARED 'txn_transfer_001';
-- OU
ROLLBACK PREPARED 'txn_transfer_001';

-- Voir les transactions préparées (transactions bloquantes !) :
SELECT gid, prepared, owner, database
FROM pg_prepared_xacts;
-- Toute ligne ici = verrous tenus, bloquant d'autres transactions
\`\`\`

## L'approche de Google Spanner — Cohérence externe

\`\`\`
API TrueTime :
  TT.now()    → retourne un intervalle [plus_tôt, plus_tard]
                où le temps réel est garanti dans cet intervalle
  Incertitude : typiquement ±4ms (GPS + horloges atomiques)

Commit Wait :
  Avant de committer la transaction T avec le timestamp s :
    Attendre jusqu'à TT.after(s) soit vrai
    (attendre que la fenêtre d'incertitude soit passée)
    Puis committer
  
  Si T1 committe avant que T2 commence (temps réel) :
    Le timestamp de commit de T1 < le temps de début de T2
    TrueTime garantit que cet ordre est visible pour tous les observateurs

Coût :
  Commit wait = incertitude TrueTime = typiquement 4-10ms
  Chaque transaction d'écriture attend 4-10ms avant de committer
\`\`\`

## Choisir une stratégie de transaction distribuée

\`\`\`
2PC / XA :
  ✓ Garanties ACID fortes
  ✗ Blocage sur défaillance du coordinateur
  ✗ Complexité opérationnelle
  Meilleur pour : systèmes étroitement couplés, même fournisseur de base de données

Saga :
  ✓ Non-bloquant
  ✓ Fonctionne entre services hétérogènes
  ✗ Pas d'isolation entre les étapes
  ✗ Cohérence éventuelle uniquement
  Meilleur pour : microservices, transactions métier longues

TCC :
  ✓ Meilleure isolation que Saga
  ✗ Coût d'implémentation élevé
  Meilleur pour : systèmes financiers nécessitant plus de cohérence que Saga

Éviter les transactions distribuées :
  Concevoir les données pour que les opérations liées touchent un service/shard
  Meilleur pour : la plupart des systèmes
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the fundamental blocking problem with Two-Phase Commit and why can't it be solved within the 2PC protocol itself?",
      options: [
        "2PC blocks because both phases require fsync which is slow on HDDs",
        "If the coordinator crashes after participants vote YES but before sending Commit/Abort, participants are stuck in PREPARED state holding locks indefinitely — they cannot commit (don't know others' votes) or abort (promised to commit). This is inherent to 2PC: the last message is always uncertain, and no information from other participants can resolve it without coordinator recovery.",
        "2PC blocks because participants must wait for all other participants to vote before proceeding",
        "The blocking problem only occurs when more than 2 participants are involved",
      ],
      correct: 1,
    },
    {
      question:
        "Why does Three-Phase Commit fail to solve the blocking problem during network partitions?",
      options: [
        "3PC requires more network bandwidth than is available during partitions",
        "3PC's non-blocking guarantee only holds in synchronous networks. During a network partition, one partition may have received PreCommit (and commits) while the other did not (and aborts) — two groups make different decisions, causing data inconsistency despite 3PC's theoretical guarantees.",
        "3PC is not implemented in any production databases so it cannot be used",
        "3PC blocks because it has more phases than 2PC, not fewer",
      ],
      correct: 1,
    },
    {
      question:
        "What is the key difference between Saga choreography and Saga orchestration?",
      options: [
        "Choreography uses synchronous calls; orchestration uses asynchronous messages",
        "In choreography, services react to events published by other services with no central controller — loose coupling but complex flow. In orchestration, a central coordinator explicitly tells each service what to do and handles failures — simpler to understand but the coordinator is a bottleneck and potential single point of failure.",
        "Choreography is for read-heavy workloads; orchestration is for write-heavy workloads",
        "Choreography requires a message queue; orchestration works without any infrastructure",
      ],
      correct: 1,
    },
    {
      question: "How does TCC provide better isolation than a standard Saga?",
      options: [
        "TCC uses database-level locking while Saga uses application-level locking",
        "In Saga, T1 commits immediately — other transactions can see Alice's debited balance before Bob is credited (dirty intermediate state). In TCC, the Try phase only RESERVES resources without committing — other transactions see 'reserved' amounts, preventing observation of half-completed state.",
        "TCC provides serializable isolation while Saga provides read committed",
        "TCC runs all operations in a single database transaction wrapped in a distributed lock",
      ],
      correct: 1,
    },
    {
      question:
        "How does Google Spanner's TrueTime + commit wait achieve external consistency across globally distributed transactions?",
      options: [
        "Spanner uses a global master node that serializes all transactions worldwide",
        "TrueTime provides a time interval [earliest, latest] guaranteed to contain the true current time. By waiting (commit wait) until TT.after(commit_timestamp) is true before committing, Spanner ensures any transaction starting after T1 commits observes a start time definitively later than T1's commit timestamp — making the global order of transactions match real-world time order.",
        "Spanner achieves external consistency by requiring all writes to go through a single US datacenter",
        "Commit wait pauses all other transactions globally until the committing transaction finishes",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quel est le problème de blocage fondamental du Two-Phase Commit et pourquoi ne peut-il pas être résolu dans le protocole 2PC lui-même ?",
      options: [
        "2PC bloque car les deux phases nécessitent un fsync qui est lent sur les HDDs",
        "Si le coordinateur plante après que les participants aient voté OUI mais avant d'envoyer Commit/Abort, les participants sont bloqués en état PRÉPARÉ tenant des verrous indéfiniment. Ils ne peuvent ni committer (ne connaissent pas les votes des autres) ni abandonner (ont promis de committer). C'est inhérent à 2PC : le dernier message est toujours incertain.",
        "2PC bloque car les participants doivent attendre que tous les autres aient voté avant de continuer",
        "Le problème de blocage ne se produit que quand plus de 2 participants sont impliqués",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi Three-Phase Commit échoue-t-il à résoudre le problème de blocage lors des partitions réseau ?",
      options: [
        "3PC nécessite plus de bande passante réseau que disponible lors des partitions",
        "La garantie de non-blocage du 3PC ne tient que dans les réseaux synchrones. Lors d'une partition réseau, une partition peut avoir reçu PreCommit (et committe) tandis que l'autre non (et abandonne) — deux groupes prennent des décisions différentes, causant une incohérence des données.",
        "3PC n'est implémenté dans aucune base de données en production",
        "3PC bloque car il a plus de phases que 2PC, pas moins",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle est la différence clé entre la chorégraphie Saga et l'orchestration Saga ?",
      options: [
        "La chorégraphie utilise des appels synchrones ; l'orchestration des messages asynchrones",
        "Dans la chorégraphie, les services réagissent aux événements publiés par d'autres services sans contrôleur central — couplage faible mais flux complexe. Dans l'orchestration, un coordinateur central dit explicitement à chaque service quoi faire — plus simple à comprendre mais le coordinateur est un goulot d'étranglement.",
        "La chorégraphie est pour les charges à lecture intensive ; l'orchestration pour les charges à écriture intensive",
        "La chorégraphie nécessite une file de messages ; l'orchestration fonctionne sans infrastructure",
      ],
      correct: 1,
    },
    {
      question:
        "Comment TCC fournit-il une meilleure isolation qu'une Saga standard ?",
      options: [
        "TCC utilise le verrouillage au niveau base de données tandis que Saga utilise le verrouillage au niveau application",
        "Dans Saga, T1 committe immédiatement — d'autres transactions peuvent voir le solde débité d'Alice avant que Bob soit crédité. Dans TCC, la phase Try ne RÉSERVE que des ressources sans committer — d'autres transactions voient les montants 'réservés', empêchant l'observation d'un état à moitié complété.",
        "TCC fournit une isolation sérialisable tandis que Saga fournit du read committed",
        "TCC exécute toutes les opérations dans une seule transaction de base de données",
      ],
      correct: 1,
    },
    {
      question:
        "Comment TrueTime + commit wait de Google Spanner atteint-il la cohérence externe à travers des transactions distribuées mondialement ?",
      options: [
        "Spanner utilise un nœud master global qui sérialise toutes les transactions mondialement",
        "TrueTime fournit un intervalle de temps [plus_tôt, plus_tard] garanti contenir le vrai temps actuel. En attendant (commit wait) jusqu'à ce que TT.after(commit_timestamp) soit vrai avant de committer, Spanner garantit que toute transaction démarrant après le commit de T1 observe un temps de début définitivement postérieur au timestamp de commit de T1.",
        "Spanner atteint la cohérence externe en exigeant que toutes les écritures passent par un seul datacenter",
        "Le commit wait met en pause toutes les autres transactions globalement",
      ],
      correct: 1,
    },
  ],
};
