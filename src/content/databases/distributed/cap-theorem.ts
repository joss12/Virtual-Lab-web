export const content = {
  en: `# CAP Theorem

## The Theorem

In 2000, Eric Brewer conjectured that a distributed system can provide at most two of three properties simultaneously:

\`\`\`
C — Consistency:    every read receives the most recent write or an error
A — Availability:   every request receives a response (not an error)
P — Partition Tolerance: the system continues operating despite network partitions
\`\`\`

Gilbert and Lynch formally proved this in 2002. The proof is surprisingly simple.

## The Proof

\`\`\`
Setup: two nodes G1 and G2, replicating the same data.
       Initial state: both have value v0.
       Network partition occurs: G1 and G2 cannot communicate.

       G1 ╳ G2   (partition — messages between them are lost)

Step 1: Client writes v1 to G1
  G1 updates to v1.
  G1 cannot send v1 to G2 (partition).
  G2 still has v0.

Step 2: Another client reads from G2

Case A: System chooses Consistency
  G2 must return v1 (the latest write) or an error.
  G2 doesn't have v1 (partition prevents synchronization).
  G2 must return an error.
  → Availability violated (G2 returned an error, not a response)

Case B: System chooses Availability
  G2 must return a response (not an error).
  G2 returns v0 (stale data — it doesn't know about v1).
  → Consistency violated (read returned v0 but v1 was written)

Conclusion: during a partition, you must choose between C and A.
  You cannot have both. QED.
\`\`\`

## P Is Not Optional

The most common misunderstanding of CAP: treating P as something you can choose to sacrifice.

\`\`\`
Reality: network partitions happen in any distributed system.
  Switches fail. NICs flake. Cables get cut. BGP routes change.
  Data center maintenance creates partitions.
  Cloud provider failures create partitions.

If you don't handle partitions → your system crashes or corrupts data when a partition occurs.
"Sacrificing P" means building a system that doesn't tolerate partitions at all.
This means: run on a single server (no distribution → no partition risk).

The real choice is: when a partition occurs, do you prefer CP or AP behavior?
  CP: maintain consistency, accept unavailability
  AP: maintain availability, accept stale reads
\`\`\`

## CP Systems

Prioritize consistency over availability during partitions.

\`\`\`
Behavior during partition:
  Nodes that cannot confirm they have the latest data return errors.
  The "minority" partition becomes unavailable for writes (and sometimes reads).
  The "majority" partition continues operating with full consistency.

Examples:
  HBase:           refuses reads/writes if too few nodes available
  Zookeeper:       read/write requires quorum; minority partition unavailable
  etcd:            Raft quorum required; minority partition returns errors
  MongoDB (default): primary election requires majority; minority read-only or offline
  PostgreSQL:      synchronous replication → primary stalls if replica unreachable
  Redis Cluster:   shard unavailable if primary + all replicas down
\`\`\`

\`\`\`sql
-- PostgreSQL CP behavior with synchronous replication:
-- If replica goes down, writes stall waiting for acknowledgment
synchronous_commit = on
synchronous_standby_names = 'replica1'
-- When replica1 unreachable: COMMIT hangs indefinitely
-- Choose: timeout → demote to async (lose C) or wait forever (lose A)

-- etcd CP behavior:
// 5-node cluster, 3 nodes go down
// Remaining 2 nodes cannot form quorum → refuse all reads and writes
// Error: "etcdserver: request timed out"
\`\`\`

## AP Systems

Prioritize availability over consistency during partitions.

\`\`\`
Behavior during partition:
  All nodes continue serving requests.
  Nodes in different partitions accept writes independently.
  When partition heals, divergent writes must be reconciled.

Examples:
  Cassandra:       all nodes serve reads/writes; inconsistency reconciled via LWW
  DynamoDB:        all nodes serve reads/writes; eventual consistency
  CouchDB:         multi-master replication; conflict resolution required
  DNS:             always serves responses; propagation delay = inconsistency
  Riak:            AP by default; tunable consistency
\`\`\`

\`\`\`
Cassandra AP behavior during partition:
  Node A (partition 1): accepts write: user.balance = 100
  Node B (partition 2): accepts write: user.balance = 200
  
  Both accepted! Inconsistency exists during partition.
  
  After partition heals:
    Cassandra uses Last Write Wins (LWW) by timestamp
    If A's write has higher timestamp → balance = 100 (B's write lost!)
    If B's write has higher timestamp → balance = 200 (A's write lost!)
    
  This is "eventual consistency" — eventually converges to one value,
  but one write is silently discarded.
\`\`\`

## PACELC — The Extension

CAP only considers behavior during partitions. PACELC (Daniel Abadi, 2012) extends this:

\`\`\`
PAC: if there is a Partition, choose between Availability and Consistency
ELC: Else (no partition), choose between Latency and Consistency

Full spectrum:
  PA/EL: Available during partition, low latency normally
         (Cassandra, DynamoDB — eventual consistency always)
         
  PC/EL: Consistent during partition, low latency normally  
         (???  — hard to achieve, most CP systems sacrifice latency too)
         
  PA/EC: Available during partition, consistent normally
         (MongoDB with eventual consistency reads)
         
  PC/EC: Consistent during partition, consistent normally
         (HBase, etcd, Zookeeper — strong consistency, higher latency)

The latency-consistency tradeoff (ELC):
  Strong consistency requires: write to majority before returning
    → latency = max(fastest majority responses)
    → on a WAN: 50-100ms per write minimum
    
  Eventual consistency: write to one node, return immediately
    → latency = single node write time
    → on a WAN: 1-5ms per write
    → 10-100x faster at the cost of consistency
\`\`\`

## Consistency Models — A Spectrum

CAP's "consistency" is a single point on a spectrum of consistency models:

\`\`\`
Strongest ──────────────────────────────────────────────── Weakest

Linearizability → Sequential → Causal → Read-your-writes → Eventual

Linearizability (Strict Consistency):
  Every operation appears to take effect instantaneously at some point
  between its start and end time. All processes see operations in the
  same total order.
  
  Most intuitive but most expensive.
  Requires: all reads see the effect of all preceding writes.
  Cost: high latency (requires coordination before every read/write).
  Used by: etcd, Zookeeper, Google Spanner, CockroachDB.

Sequential Consistency:
  All processes see operations in the same order,
  but not necessarily matching real time.
  
  Example:
    Real time: Write(x=1) at T1, Write(x=2) at T2
    Sequentially consistent: processes might see [x=1, x=2] or [x=2, x=1]
    but ALL processes see the same order.

Causal Consistency:
  Operations that are causally related are seen in order by all processes.
  Concurrent (unrelated) operations may be seen in different orders.
  
  Example:
    Alice posts: "What time is it?"
    Bob replies: "It's 3pm"  (causally follows Alice's post)
    
    All nodes must show Alice's post before Bob's reply.
    But unrelated posts can appear in any order.
  
  Used by: MongoDB causal sessions, some Cassandra configurations.

Read-Your-Writes (Session Consistency):
  Within a session, a process always reads its own writes.
  Other processes may see stale data.
  
  Most important for user experience:
    User updates profile → immediately sees their update
    Other users may see old data briefly.

Monotonic Read Consistency:
  Once a process reads a value, it never reads an older value.
  
  Prevents: read x=5, then read x=3 (going backward in time).
  Does NOT prevent: reading stale data on first read.

Eventual Consistency:
  If no new writes occur, all replicas eventually converge to the same value.
  No guarantees about when, or what you might read in the meantime.
  
  Weakest useful guarantee. All AP systems provide this.
\`\`\`

## Consistency in Practice — Real Systems

\`\`\`
Google Spanner:
  External consistency (stronger than linearizability):
    Commits are ordered by real time (TrueTime).
    If transaction T1 commits before T2 starts, T1's commit timestamp < T2's.
    Even across datacenters. Even across continents.
  Cost: commit wait (must wait for TrueTime uncertainty to pass).
  Typical commit latency: 5-10ms (same region), 100ms+ (cross-continent).

DynamoDB:
  Default: eventual consistency (lowest latency).
  Optional: strongly consistent reads (2x cost, reads from leader).
  
  // Strongly consistent read
  dynamodb.getItem({
    TableName: "orders",
    Key: { id: "123" },
    ConsistentRead: true  // 2x read capacity units, always up-to-date
  })

Cassandra:
  Tunable consistency per operation:
    WRITE ONE + READ ALL   = strong consistency (slow reads)
    WRITE QUORUM + READ QUORUM = strong consistency (balanced)
    WRITE ONE + READ ONE   = eventual consistency (fast)
    
  LOCAL_QUORUM: quorum within local datacenter only
    → avoids cross-datacenter latency for most operations
    → accepts that cross-datacenter reads may be stale
\`\`\`

## The Partition Tolerance Reality

\`\`\`
Partition types and frequencies:
  Complete network partition (datacenter goes dark): rare (< 1/year)
  Partial partition (some nodes unreachable): uncommon (monthly)
  Slow network (messages delayed 1-10s): common (weekly)
  Single node crash: very common (daily in large clusters)

CAP focuses on complete partitions but slow networks are more dangerous:
  Slow network = you can't tell if a node is "slow" or "crashed"
  Timeout threshold too low: false positives → unnecessary leader elections
  Timeout threshold too high: real failures detected slowly

The "partition" in CAP includes:
  Network split (nodes can't communicate)
  Node crash (node stops responding — looks like partition to others)
  GC pause (JVM stop-the-world: node unresponsive for seconds)
  Disk I/O stall (node processing stalls, can't respond to heartbeats)
\`\`\`

## Practical Guidance — Choosing Your Tradeoffs

\`\`\`
Choose CP when:
  ✓ Financial transactions (bank balances, inventory counts)
  ✓ Leader election and coordination (only one leader allowed)
  ✓ Configuration management (all nodes must see same config)
  ✓ Distributed locking (correctness over availability)
  Examples: etcd, Zookeeper, PostgreSQL with sync replication

Choose AP when:
  ✓ User-facing data where slight staleness is acceptable
  ✓ Shopping carts (merge conflicts are recoverable)
  ✓ Social feeds (seeing slightly old data is fine)
  ✓ Analytics (approximate counts are acceptable)
  ✓ DNS (propagation delay is acceptable)
  Examples: Cassandra, DynamoDB with eventual consistency

The nuanced reality:
  Most systems are neither pure CP nor pure AP.
  They offer tunable consistency: choose per-operation.
  The right choice depends on the specific data and operation.
  
  A single application might use:
    Cassandra (AP) for user profiles (staleness OK)
    etcd (CP) for configuration and locks (correctness required)
    PostgreSQL (CP) for financial data (consistency required)
    Redis (AP/CP tunable) for caching (performance priority)
\`\`\`

## CAP Misconceptions

\`\`\`
Misconception 1: "CA systems exist"
  Reality: CA means no partition tolerance — only works on single node.
  Any multi-node system must handle partitions → CA is not a real option.
  When people say "CA database" they mean: CP system that also tries hard
  to be available when there's no partition (which is most of the time).

Misconception 2: "CAP means you can only have 2 of 3 always"
  Reality: CAP only applies DURING a partition.
  Most of the time there's no partition → you can have both C and A.
  The tradeoff only activates when a partition actually occurs.

Misconception 3: "Eventual consistency means data is always stale"
  Reality: in the absence of failures, eventual consistency systems
  can achieve very low replication lag (milliseconds).
  "Eventual" means "not guaranteed instant" not "always hours late."

Misconception 4: "CAP covers all consistency concerns"
  Reality: CAP's "consistency" is specifically linearizability.
  Many other consistency concerns (isolation levels, read-your-writes,
  monotonic reads) are not covered by CAP.
  PACELC and isolation level frameworks cover these better.
\`\`\`
`,

  fr: `# Théorème CAP

## Le théorème

En 2000, Eric Brewer a conjecturé qu'un système distribué peut fournir au plus deux des trois propriétés simultanément :

\`\`\`
C — Cohérence :          chaque lecture reçoit l'écriture la plus récente ou une erreur
A — Disponibilité :      chaque requête reçoit une réponse (pas une erreur)
P — Tolérance partition : le système continue malgré les partitions réseau
\`\`\`

## La preuve

\`\`\`
Configuration : deux nœuds G1 et G2, répliquant les mêmes données.
               État initial : les deux ont la valeur v0.
               Partition réseau : G1 et G2 ne peuvent pas communiquer.

Étape 1 : Un client écrit v1 sur G1
  G1 se met à jour vers v1.
  G1 ne peut pas envoyer v1 à G2 (partition).
  G2 a toujours v0.

Étape 2 : Un autre client lit depuis G2

Cas A : Le système choisit la Cohérence
  G2 doit retourner v1 (dernière écriture) ou une erreur.
  G2 n'a pas v1 → doit retourner une erreur.
  → Disponibilité violée

Cas B : Le système choisit la Disponibilité
  G2 doit retourner une réponse (pas d'erreur).
  G2 retourne v0 (données obsolètes).
  → Cohérence violée

Conclusion : lors d'une partition, vous devez choisir entre C et A.
\`\`\`

## P n'est pas optionnel

\`\`\`
Réalité : les partitions réseau se produisent dans tout système distribué.
  Commutateurs défaillants. Câbles coupés. Maintenance datacenter.

"Sacrifier P" signifie construire un système sans distribution → serveur unique.

Le vrai choix : lors d'une partition, préférez-vous un comportement CP ou AP ?
  CP : maintenir la cohérence, accepter l'indisponibilité
  AP : maintenir la disponibilité, accepter les lectures obsolètes
\`\`\`

## PACELC — L'extension

\`\`\`
CAP ne considère que le comportement lors des partitions.
PACELC (Daniel Abadi, 2012) étend cela :

PAC : lors d'une Partition, choisir entre Disponibilité et Cohérence
ELC : Sinon (pas de partition), choisir entre Latence et Cohérence

PA/EL : Disponible lors de partition, faible latence normalement
        (Cassandra, DynamoDB)
        
PC/EC : Cohérent lors de partition, cohérent normalement
        (HBase, etcd, Zookeeper)

Le compromis latence-cohérence (ELC) :
  Cohérence forte : écrire sur la majorité avant de retourner
    → latence = temps de réponse de la majorité la plus rapide
    → sur WAN : minimum 50-100ms par écriture
    
  Cohérence éventuelle : écrire sur un nœud, retourner immédiatement
    → latence = temps d'écriture sur un seul nœud
    → sur WAN : 1-5ms par écriture
    → 10-100x plus rapide au coût de la cohérence
\`\`\`

## Modèles de cohérence — Un spectre

\`\`\`
Plus fort ──────────────────────────────────────── Plus faible

Linéarisabilité → Séquentiel → Causal → Lecture-vos-écritures → Éventuel

Linéarisabilité :
  Chaque opération semble prendre effet instantanément.
  Coût : haute latence (coordination avant chaque lecture/écriture).
  Utilisé par : etcd, Zookeeper, Google Spanner, CockroachDB.

Cohérence causale :
  Les opérations causalement liées sont vues dans l'ordre.
  
  Exemple :
    Alice poste : "Quelle heure est-il ?"
    Bob répond : "Il est 15h" (suit causalement le post d'Alice)
    Tous les nœuds doivent montrer le post d'Alice avant la réponse de Bob.

Lecture-vos-écritures :
  Dans une session, un processus lit toujours ses propres écritures.
  Plus important pour l'expérience utilisateur.

Cohérence éventuelle :
  Si aucune nouvelle écriture ne se produit, tous les réplicas convergent.
  Garantie la plus faible mais utile. Tous les systèmes AP la fournissent.
\`\`\`

## Idées reçues sur CAP

\`\`\`
Idée reçue 1 : "Les systèmes CA existent"
  Réalité : CA = pas de tolérance aux partitions → nœud unique uniquement.
  Tout système multi-nœuds doit gérer les partitions.

Idée reçue 2 : "CAP signifie que vous ne pouvez avoir que 2 sur 3 en permanence"
  Réalité : CAP s'applique UNIQUEMENT lors d'une partition.
  La plupart du temps il n'y a pas de partition → vous pouvez avoir C et A.

Idée reçue 3 : "Cohérence éventuelle signifie données toujours obsolètes"
  Réalité : en l'absence de pannes, les systèmes à cohérence éventuelle
  peuvent atteindre un très faible lag de réplication (millisecondes).

Idée reçue 4 : "CAP couvre toutes les préoccupations de cohérence"
  Réalité : la "cohérence" de CAP est spécifiquement la linéarisabilité.
  PACELC et les frameworks de niveaux d'isolation couvrent mieux les autres.
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "What does the CAP theorem proof demonstrate about the tradeoff between consistency and availability during a network partition?",
      options: [
        "During a partition, a node can maintain both consistency and availability by caching recent writes locally",
        "During a partition, if a node that missed a write must serve a read, it must either return an error (sacrificing availability) or return stale data (sacrificing consistency) — both C and A simultaneously is mathematically impossible",
        "The CAP theorem only applies to systems with more than 3 nodes",
        "CAP proves that distributed systems should always prefer consistency over availability"
      ],
      correct: 1,
    },
    {
      question: "Why is 'sacrificing P' (partition tolerance) not a real option for distributed systems?",
      options: [
        "Partition tolerance is required by law in most countries for database systems",
        "Network partitions are inevitable in any multi-node system — switches fail, cables get cut, nodes crash. Not handling partitions means the system crashes or corrupts data when one occurs. The only way to avoid partitions is to run on a single node, which is not a distributed system.",
        "Sacrificing P would make the system too slow for practical use",
        "The CAP theorem mathematically prevents P from being sacrificed"
      ],
      correct: 1,
    },
    {
      question: "What does PACELC add to the CAP theorem and why is it more useful for system design?",
      options: [
        "PACELC adds a fourth property (eventual consistency) to the CAP triangle",
        "PACELC addresses the latency-consistency tradeoff during NORMAL operation (no partition), which CAP ignores. CAP only covers behavior during partitions, but most of the time there is no partition — the latency vs consistency tradeoff applies constantly and is often more important for daily system design decisions.",
        "PACELC replaces CAP with a more accurate model that includes network bandwidth",
        "PACELC extends CAP to cover Byzantine failures in addition to crash failures"
      ],
      correct: 1,
    },
    {
      question: "What is the difference between linearizability and eventual consistency?",
      options: [
        "Linearizability is for reads, eventual consistency is for writes",
        "Linearizability guarantees every operation appears instantaneous and all processes see the same total order — reading always returns the latest write. Eventual consistency only guarantees replicas converge if writes stop — you may read stale data, different processes may see different orders, with no timing guarantees.",
        "Linearizability requires more nodes than eventual consistency",
        "Linearizability is only available in CP systems, eventual consistency only in AP systems"
      ],
      correct: 1,
    },
    {
      question: "Why do most production systems offer tunable consistency rather than being purely CP or AP?",
      options: [
        "Pure CP and AP systems are too expensive to build and maintain",
        "Different operations within the same application have different requirements — financial transactions need strong consistency (CP), user profiles can tolerate staleness (AP), configuration needs consistency (CP), analytics can use approximate data (AP). Tunable consistency lets each operation choose the right tradeoff.",
        "Tunable consistency is required to comply with GDPR regulations",
        "Pure CP systems cannot achieve more than 99.9% availability in practice"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Que démontre la preuve du théorème CAP sur le compromis entre cohérence et disponibilité lors d'une partition réseau ?",
      options: [
        "Lors d'une partition, un nœud peut maintenir cohérence et disponibilité en mettant en cache les écritures récentes localement",
        "Lors d'une partition, si un nœud qui a manqué une écriture doit servir une lecture, il doit soit retourner une erreur (sacrifiant la disponibilité) soit retourner des données obsolètes (sacrifiant la cohérence) — C et A simultanément est mathématiquement impossible",
        "Le théorème CAP s'applique uniquement aux systèmes avec plus de 3 nœuds",
        "CAP prouve que les systèmes distribués devraient toujours préférer la cohérence à la disponibilité"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi 'sacrifier P' (tolérance aux partitions) n'est-il pas une option réelle pour les systèmes distribués ?",
      options: [
        "La tolérance aux partitions est requise par la loi dans la plupart des pays",
        "Les partitions réseau sont inévitables dans tout système multi-nœuds — commutateurs défaillants, câbles coupés, nœuds qui plantent. Ne pas gérer les partitions signifie que le système plante ou corrompt les données quand une se produit. La seule façon d'éviter les partitions est de fonctionner sur un seul nœud.",
        "Sacrifier P rendrait le système trop lent pour un usage pratique",
        "Le théorème CAP empêche mathématiquement de sacrifier P"
      ],
      correct: 1,
    },
    {
      question: "Que PACELC ajoute-t-il au théorème CAP et pourquoi est-il plus utile pour la conception de systèmes ?",
      options: [
        "PACELC ajoute une quatrième propriété (cohérence éventuelle) au triangle CAP",
        "PACELC aborde le compromis latence-cohérence en fonctionnement NORMAL (sans partition), que CAP ignore. CAP ne couvre que le comportement lors des partitions, mais la plupart du temps il n'y en a pas — le compromis latence vs cohérence s'applique constamment.",
        "PACELC remplace CAP par un modèle plus précis incluant la bande passante réseau",
        "PACELC étend CAP pour couvrir les pannes byzantines en plus des pannes par plantage"
      ],
      correct: 1,
    },
    {
      question: "Quelle est la différence entre linéarisabilité et cohérence éventuelle ?",
      options: [
        "La linéarisabilité concerne les lectures, la cohérence éventuelle les écritures",
        "La linéarisabilité garantit que chaque opération semble instantanée et que tous les processus voient le même ordre total — lire retourne toujours la dernière écriture. La cohérence éventuelle garantit uniquement que les réplicas convergent si les écritures s'arrêtent — vous pouvez lire des données obsolètes.",
        "La linéarisabilité nécessite plus de nœuds que la cohérence éventuelle",
        "La linéarisabilité n'est disponible que dans les systèmes CP, la cohérence éventuelle uniquement dans les systèmes AP"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi la plupart des systèmes en production offrent-ils une cohérence configurable plutôt que d'être purement CP ou AP ?",
      options: [
        "Les systèmes purement CP et AP sont trop coûteux à construire",
        "Différentes opérations dans la même application ont des exigences différentes — les transactions financières nécessitent une cohérence forte (CP), les profils utilisateurs peuvent tolérer l'obsolescence (AP). La cohérence configurable laisse chaque opération choisir le bon compromis.",
        "La cohérence configurable est requise pour se conformer au RGPD",
        "Les systèmes purement CP ne peuvent pas atteindre plus de 99,9% de disponibilité en pratique"
      ],
      correct: 1,
    },
  ],
};
