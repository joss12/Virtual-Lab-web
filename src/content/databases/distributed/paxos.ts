export const content = {
  en: `# Paxos Algorithm

## Why Paxos Matters

Paxos is the theoretical foundation of almost every production consensus system. Google Chubby, Google Spanner, Apache Zookeeper (ZAB is Paxos-derived), and countless internal systems at major tech companies run on Paxos or its variants. Understanding Paxos means understanding the bedrock of distributed systems.

Lamport introduced Paxos in 1989 in a paper he deliberately wrote as a story about a Greek parliament on the island of Paxos. The paper was so unconventional that it took 8 years to be published (1998). When published, Lamport wrote: "I have heard it said that the Paxos algorithm is difficult to understand. I find this puzzling."

Everyone else finds it difficult.

## The Problem Paxos Solves

Single-Decree Paxos: **get a distributed set of nodes to agree on a single value**, even if messages are lost, delayed, or reordered, and nodes can crash and restart.

\`\`\`
Properties Paxos guarantees:
  Safety (always):
    - Only a value that has been proposed can be chosen
    - Only a single value is chosen
    - A process never learns that a value has been chosen unless it actually has been

  Liveness (usually, not always — FLP):
    - Some proposed value is eventually chosen
    - If a value is chosen, processes eventually learn it
\`\`\`

## The Three Roles

\`\`\`
Proposer:  proposes values, drives the protocol forward
Acceptor:  votes on proposals, forms the quorum that chooses a value
Learner:   learns the chosen value (can be the same nodes as proposers/acceptors)

In practice: every node plays all three roles simultaneously.
\`\`\`

## Single-Decree Paxos — Two Phases

### Phase 1: Prepare — Claiming the Right to Propose

\`\`\`
Proposer selects a proposal number N (must be unique and larger than any seen).

Proposer → all Acceptors: Prepare(N)

Acceptor behavior on receiving Prepare(N):
  If N > highest prepare number seen:
    - Promise: "I will not accept any proposal numbered < N"
    - Return: highest-numbered proposal already accepted (if any)
    - Update: minProposal = N
  Else:
    - Ignore (or send NACK)

Proposer waits for majority of Acceptors to respond with Promise.
If majority responds → proceed to Phase 2
If not → increase N, restart Phase 1
\`\`\`

\`\`\`
Why proposal numbers must be unique:
  Each proposer has a unique server ID (e.g., 1, 2, 3)
  Proposal number = (round * num_servers) + server_id
  
  Server 1, round 1: N = 1*3 + 1 = 4
  Server 2, round 1: N = 1*3 + 2 = 5
  Server 3, round 1: N = 1*3 + 3 = 6
  Server 1, round 2: N = 2*3 + 1 = 7
  
  Globally unique, monotonically increasing per proposer
\`\`\`

### Phase 2: Accept — Actually Proposing the Value

\`\`\`
Proposer chooses value V:
  If any Promise response contained an accepted value:
    V = value from the highest-numbered accepted proposal in responses
    (Must use this value — cannot use own value)
  Else:
    V = proposer's own desired value

Proposer → majority of Acceptors: Accept(N, V)

Acceptor behavior on receiving Accept(N, V):
  If N >= minProposal (no higher prepare seen since we promised):
    - Accept this proposal: acceptedProposal = N, acceptedValue = V
    - Send Accepted(N, V) to all Learners (and Proposer)
  Else:
    - Reject (send NACK with current minProposal)

If majority of Acceptors send Accepted(N, V):
  Value V is CHOSEN — consensus achieved
\`\`\`

### Complete Example

\`\`\`
5 acceptors (A1-A5), 2 proposers (P1, P2), need majority = 3

Scenario: P1 and P2 both try to propose simultaneously

--- Phase 1 ---
P1 sends Prepare(1) to A1, A2, A3, A4, A5
P2 sends Prepare(5) to A1, A2, A3, A4, A5

A1 receives Prepare(1): N=1 > 0 (nothing seen) → Promise(1, null)
A1 receives Prepare(5): N=5 > 1 → Promise(5, null), minProposal=5

A2 receives Prepare(5): Promise(5, null), minProposal=5
A2 receives Prepare(1): N=1 < 5 → REJECT

A3 receives Prepare(1): Promise(1, null), minProposal=1
   (A3 didn't see P2's prepare yet)

P1 receives promises from A1, A3 → only 2 (not majority of 3) — cannot proceed
P2 receives promises from A1, A2, A4, A5 → 4 promises (majority) → proceed

--- Phase 2 ---
P2 sends Accept(5, "my_value") to A1, A2, A4, A5

A1: N=5 >= minProposal=5 → Accepted(5, "my_value")
A2: N=5 >= minProposal=5 → Accepted(5, "my_value")
A4: N=5 >= minProposal=5 → Accepted(5, "my_value")

P2 receives Accepted from A1, A2, A4 → majority → VALUE "my_value" IS CHOSEN

--- P1 retries ---
P1 sends Prepare(7) to all acceptors
All acceptors saw minProposal=5, so N=7 > 5 → all promise
A1 returns: (accepted=5, value="my_value")
A2 returns: (accepted=5, value="my_value")

P1 sees highest accepted proposal = (5, "my_value")
P1 MUST use value "my_value" (cannot use own value)
P1 sends Accept(7, "my_value")
All accept → same value chosen again ✓
\`\`\`

**This is the key safety insight**: even if P1 "wins" a later round, it discovers P2's value through the Promise responses and is forced to propagate it. The chosen value cannot change.

## Why Paxos Is Safe

### The Critical Invariant

\`\`\`
At any point, if value V was chosen with proposal number M,
then for all proposals N > M that are accepted:
  their value = V

Proof:
  For V to be chosen with proposal M, a majority Q1 of acceptors accepted (M, V).
  For any later proposal N > M to be sent by a proposer:
    Proposer sent Prepare(N) and received promises from majority Q2.
    Q1 and Q2 must overlap (two majorities always share at least one node).
    The overlapping node promised to reject < N AND reported (M, V) as accepted.
    Therefore the proposer sees (M, V) in its Promise responses.
    Therefore the proposer must choose V.
    Therefore Accept(N, V) — same value. ✓
\`\`\`

## Dueling Proposers — The Liveness Problem

\`\`\`
P1 sends Prepare(1) → promises from majority
P2 sends Prepare(2) → promises from majority (invalidates P1's prepare)
P1 sends Prepare(3) → promises from majority (invalidates P2's prepare)
P2 sends Prepare(4) → promises from majority (invalidates P1's prepare)
...

Neither proposer can complete Phase 2 because the other keeps invalidating their prepare.
This can loop forever — Paxos has no liveness guarantee.

Solution: elect a Distinguished Proposer (leader)
  Only one proposer active at a time
  Others defer to the leader
  This is exactly what Multi-Paxos and Raft do
\`\`\`

## Multi-Paxos — Extending to a Log

Single-Decree Paxos agrees on one value. Real systems need to agree on a **sequence of commands** (a log). Multi-Paxos extends Paxos to achieve this.

\`\`\`
Key insight: run a separate instance of Paxos for each log slot.

Log slot 1: Paxos instance 1 → chooses "SET x=1"
Log slot 2: Paxos instance 2 → chooses "SET y=2"
Log slot 3: Paxos instance 3 → chooses "DELETE x"
...
\`\`\`

### The Leader Optimization

Running full two-phase Paxos for every log slot is expensive. Multi-Paxos optimizes by electing a stable leader:

\`\`\`
Phase 1 optimization:
  Leader runs Phase 1 ONCE for all future slots (using infinity as the slot range)
  If leader stays stable, Phase 1 never needs to run again
  Each new command only requires Phase 2

Result:
  Normal operation (stable leader): 1 round trip per command (Phase 2 only)
  Leader change: 1 round trip for Phase 1 + 1 round trip for Phase 2

This is equivalent to Raft's normal operation (1 round trip for AppendEntries)
\`\`\`

\`\`\`
Multi-Paxos with stable leader:

Client → Leader: "SET x=5"
Leader → Acceptors: Accept(slotN, term, "SET x=5")
Acceptors → Leader: Accepted
Leader → Client: OK

One round trip. Same as Raft.
\`\`\`

## Fast Paxos

Classic Paxos: client → leader → acceptors → leader → client (2 round trips)
Fast Paxos: client → acceptors directly (1 round trip if no conflict)

\`\`\`
Fast Paxos Phase 2 (no conflict):
  Client sends value directly to all acceptors (bypassing leader)
  If no other value proposed: acceptors accept → chosen in 1 round trip

Fast Paxos collision recovery:
  Two clients propose simultaneously → acceptors get different values → conflict
  Leader detects conflict, runs classic Phase 2 to resolve
  Net: 2 round trips (worse than classic when conflicts happen)

Tradeoff:
  Low contention: Fast Paxos wins (1 vs 2 round trips)
  High contention: Classic Paxos wins (Fast Paxos degrades to 2+ round trips)

Requires larger quorum for Phase 2: ⌊(N+3)/2⌋ instead of N/2+1
  For 5 nodes: classic quorum=3, fast quorum=4
  This makes Fast Paxos less available than Classic Paxos
\`\`\`

## Byzantine Paxos

Standard Paxos assumes **crash failures** — nodes either work correctly or stop. It does NOT handle **Byzantine failures** — nodes that behave arbitrarily (send wrong values, lie about what they accepted, collude).

\`\`\`
Byzantine failure model:
  Node can send different messages to different nodes
  Node can claim to have accepted a value it never accepted
  Node can collude with other Byzantine nodes

Byzantine Paxos requirements:
  Need 3f+1 nodes to tolerate f Byzantine failures
  (vs 2f+1 for crash failures)
  
  With 1 Byzantine node: need 4 nodes total (vs 3 for crash-fault-tolerant)
  With 2 Byzantine nodes: need 7 nodes (vs 5)

Why: Byzantine node can fake being in two different majorities simultaneously
  claiming "I accepted X" to one group and "I accepted Y" to another

Practical use: blockchain consensus (PBFT, Tendermint, HotStuff)
  Financial systems, permissioned blockchains
  NOT used in typical database replication (crash tolerance is sufficient)
\`\`\`

## Paxos in Real Systems

### Google Chubby

\`\`\`
Chubby is Google's distributed lock service — essentially a Paxos-replicated file system.
Used internally by: GFS (master election), Bigtable (master election), MapReduce.

Architecture:
  5-node Paxos group (one master, four replicas)
  Master elected via Paxos
  Clients talk only to master
  Master lease: master holds lease, must renew via Paxos heartbeat
  If master fails to renew: another node runs Paxos election

Chubby cells:
  Each cell is a geographically co-located 5-node Paxos group
  Clients in a datacenter use the local cell
  
Paxos variant: Multi-Paxos with master lease
  Master lease prevents reads from needing Paxos round trip
  (Master guarantees no other master exists while lease is valid)
\`\`\`

### Google Spanner

\`\`\`
Spanner: globally distributed SQL database
  Data sharded into tablets (similar to Raft's ranges/regions)
  Each tablet replicated via Paxos group (typically 5 replicas)
  Replicas span multiple datacenters and continents

Paxos leader (Spanner calls it "Paxos leader"):
  Holds a timed lease (10 seconds default)
  Serves reads locally (no round trip to replicas)
  Writes: Phase 2 of Paxos to replicas

TrueTime integration (covered in Spanner lesson):
  External consistency via GPS + atomic clocks
  Commit wait: leader waits until TrueTime uncertainty passes before committing
\`\`\`

### Apache Zookeeper (ZAB)

\`\`\`
ZAB (Zookeeper Atomic Broadcast) is Paxos-derived but not identical:

Similarities:
  Leader-based, majority quorum, two-phase commit for writes

Differences:
  ZAB is an atomic broadcast protocol (total order of all updates)
  Paxos is a consensus protocol (agree on one value per instance)
  ZAB has an explicit recovery phase (epoch-based leader election)
  ZAB guarantees delivery of all messages preceding a leader crash

Why different from Paxos:
  Zookeeper needs total ordering + exactly-once delivery
  Paxos only guarantees agreement on chosen values
  ZAB adds ordering and delivery guarantees on top

Used by: Kafka (older versions), HBase, Storm, many Hadoop ecosystem projects
\`\`\`

## Paxos Made Simple — Lamport's Summary

\`\`\`
The essence of Paxos in two rules:

Rule 1 (Prepare):
  An acceptor must remember the highest proposal number it has promised,
  and must never accept a proposal with a lower number.

Rule 2 (Accept):
  A proposer must propose the value of the highest-numbered proposal
  it learned about in the Prepare phase, if any such proposal exists.
  
These two rules are sufficient to ensure that only one value is ever chosen.
All the complexity of Paxos implementations comes from:
  - Making it efficient (Multi-Paxos leader optimization)
  - Handling gaps in the log
  - Leader election
  - Reconfiguration
  - Recovery after failures
  None of which is in the core algorithm.
\`\`\`
`,

  fr: `# Algorithme Paxos

## Pourquoi Paxos est important

Paxos est le fondement théorique de presque tous les systèmes de consensus en production. Google Chubby, Google Spanner, Apache Zookeeper (ZAB est dérivé de Paxos) fonctionnent sur Paxos ou ses variantes.

## Le problème que Paxos résout

Paxos à décret unique : **faire s'accorder un ensemble distribué de nœuds sur une seule valeur**, même si des messages sont perdus, retardés ou réordonnés, et que des nœuds peuvent planter.

\`\`\`
Propriétés garanties par Paxos :
  Sûreté (toujours) :
    - Seule une valeur proposée peut être choisie
    - Une seule valeur est choisie
    - Un processus n'apprend jamais qu'une valeur a été choisie si ce n'est pas le cas

  Vivacité (généralement, pas toujours — FLP) :
    - Une valeur proposée est éventuellement choisie
\`\`\`

## Les deux phases

### Phase 1 : Préparer — Revendiquer le droit de proposer

\`\`\`
Le Proposeur sélectionne un numéro de proposition N (unique, plus grand que tout vu).

Proposeur → tous les Accepteurs : Prepare(N)

Comportement de l'Accepteur sur réception de Prepare(N) :
  Si N > numéro de préparation le plus élevé vu :
    - Promettre : "Je n'accepterai aucune proposition numérotée < N"
    - Retourner : proposition la plus haute déjà acceptée (si une existe)
  Sinon :
    - Ignorer (ou envoyer NACK)
\`\`\`

### Phase 2 : Accepter — Proposer réellement la valeur

\`\`\`
Le Proposeur choisit la valeur V :
  Si une réponse Promise contenait une valeur acceptée :
    V = valeur de la proposition acceptée avec le numéro le plus élevé
    (Doit utiliser cette valeur — ne peut pas utiliser sa propre valeur)
  Sinon :
    V = valeur désirée du proposeur

Proposeur → majorité des Accepteurs : Accept(N, V)

Accepteur sur réception de Accept(N, V) :
  Si N >= minProposal :
    - Accepter : acceptedProposal = N, acceptedValue = V
  Sinon :
    - Rejeter
\`\`\`

## Proposeurs rivaux — Le problème de vivacité

\`\`\`
P1 envoie Prepare(1) → promesses de la majorité
P2 envoie Prepare(2) → promesses de la majorité (invalide la prépare de P1)
P1 envoie Prepare(3) → promesses de la majorité (invalide la prépare de P2)
...

Aucun proposeur ne peut compléter la Phase 2.
Solution : élire un Proposeur Distingué (leader)
  Un seul proposeur actif à la fois — c'est ce que font Multi-Paxos et Raft
\`\`\`

## Multi-Paxos — Extension à un log

\`\`\`
Insight clé : exécuter une instance Paxos séparée pour chaque slot de log.

Optimisation avec leader stable :
  Le leader exécute la Phase 1 UNE FOIS pour tous les slots futurs
  Chaque nouvelle commande ne nécessite que la Phase 2

Résultat :
  Fonctionnement normal : 1 aller-retour par commande (Phase 2 uniquement)
  Identique à Raft en fonctionnement normal
\`\`\`

## Paxos Byzantin

\`\`\`
Paxos standard suppose des pannes par plantage — nœuds qui s'arrêtent.
Il ne gère PAS les pannes byzantines — nœuds qui se comportent arbitrairement.

Exigences de Paxos Byzantin :
  Besoin de 3f+1 nœuds pour tolérer f pannes byzantines
  (vs 2f+1 pour les pannes par plantage)

Utilisation pratique : consensus blockchain (PBFT, Tendermint, HotStuff)
  PAS utilisé dans la réplication de bases de données typique
\`\`\`

## Paxos dans les systèmes réels

### Google Chubby

\`\`\`
Service de verrou distribué de Google — essentiellement un système de fichiers répliqué par Paxos.
Utilisé par : GFS (élection du master), Bigtable, MapReduce.

Architecture : groupe Paxos à 5 nœuds
Variante Paxos : Multi-Paxos avec bail du master
  Le bail du master évite les allers-retours Paxos pour les lectures
\`\`\`

### Google Spanner

\`\`\`
Base de données SQL distribuée mondialement
  Données partitionnées en tablets
  Chaque tablet répliqué via un groupe Paxos (généralement 5 réplicas)
  Les réplicas s'étendent sur plusieurs datacenters et continents
\`\`\`

### Apache Zookeeper (ZAB)

\`\`\`
ZAB (Zookeeper Atomic Broadcast) est dérivé de Paxos mais pas identique :

Différences :
  ZAB est un protocole de diffusion atomique (ordre total de toutes les mises à jour)
  Paxos est un protocole de consensus (accord sur une valeur par instance)
  ZAB garantit la livraison de tous les messages précédant un plantage de leader
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "In Paxos Phase 2, why must a proposer use the value from the highest-numbered accepted proposal it receives in Phase 1 responses, rather than its own desired value?",
      options: [
        "Using the highest-numbered value ensures better performance by reusing cached values",
        "This is the core safety mechanism — if any value was already chosen by a majority in a previous round, the overlapping node in the new majority will report it. By propagating that value, the new proposer ensures the same value is chosen, preventing two different values from being chosen.",
        "The proposer uses the highest-numbered value to detect Byzantine failures",
        "This rule prevents proposal number collisions between concurrent proposers"
      ],
      correct: 1,
    },
    {
      question: "What is the dueling proposers problem in Paxos and why can it loop forever?",
      options: [
        "Two proposers choose the same proposal number causing a conflict",
        "Each proposer's Prepare invalidates the other's — P1 gets promises, P2 sends higher Prepare invalidating P1's, P1 sends even higher Prepare invalidating P2's, repeating indefinitely. Neither can complete Phase 2. Paxos has no liveness guarantee (FLP).",
        "Two proposers receive votes from different majorities causing split brain",
        "Dueling proposers cause the log to grow unboundedly with duplicate entries"
      ],
      correct: 1,
    },
    {
      question: "How does Multi-Paxos reduce the cost of consensus from 2 round trips to 1 round trip per command during normal operation?",
      options: [
        "Multi-Paxos compresses multiple commands into a single Paxos round",
        "The stable leader runs Phase 1 once for all future log slots — as long as the leader remains stable, only Phase 2 is needed per command, reducing to 1 round trip. Phase 1 only re-runs on leader change.",
        "Multi-Paxos skips the Promise step for commands smaller than 4KB",
        "Multi-Paxos uses a larger quorum that acknowledges commands in parallel"
      ],
      correct: 1,
    },
    {
      question: "Why does Byzantine fault tolerance require 3f+1 nodes while crash fault tolerance only requires 2f+1?",
      options: [
        "Byzantine nodes need more replicas to store extra cryptographic signatures",
        "A Byzantine node can lie and claim to be part of two different majorities simultaneously — sending 'I accepted X' to one group and 'I accepted Y' to another. With 2f+1 nodes, a Byzantine node can fake being in both majorities. With 3f+1, even if f nodes lie, the honest majority of 2f+1 still outvotes them.",
        "Byzantine failures require more nodes because they happen more frequently than crashes",
        "3f+1 is required because Byzantine nodes consume more network bandwidth"
      ],
      correct: 1,
    },
    {
      question: "What is the key difference between ZAB (Zookeeper) and standard Paxos?",
      options: [
        "ZAB uses a different quorum size than Paxos",
        "ZAB is an atomic broadcast protocol guaranteeing total ordering of all updates and delivery of all messages preceding a leader crash — Paxos only guarantees agreement on a single chosen value. ZAB adds ordering and delivery guarantees that Paxos alone does not provide.",
        "ZAB uses 3 phases while Paxos uses 2 phases",
        "ZAB supports Byzantine failures while Paxos only handles crash failures"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Dans la Phase 2 de Paxos, pourquoi un proposeur doit-il utiliser la valeur de la proposition acceptée avec le numéro le plus élevé reçue en Phase 1, plutôt que sa propre valeur ?",
      options: [
        "Utiliser la valeur avec le numéro le plus élevé assure de meilleures performances en réutilisant les valeurs en cache",
        "C'est le mécanisme de sûreté central — si une valeur a déjà été choisie par une majorité dans un tour précédent, le nœud qui se chevauche dans la nouvelle majorité le signalera. En propagant cette valeur, le nouveau proposeur garantit que la même valeur est choisie.",
        "Le proposeur utilise la valeur avec le numéro le plus élevé pour détecter les pannes byzantines",
        "Cette règle empêche les collisions de numéros de proposition entre proposeurs concurrents"
      ],
      correct: 1,
    },
    {
      question: "Quel est le problème des proposeurs rivaux dans Paxos et pourquoi peut-il boucler indéfiniment ?",
      options: [
        "Deux proposeurs choisissent le même numéro de proposition causant un conflit",
        "La Prepare de chaque proposeur invalide celle de l'autre — P1 obtient des promesses, P2 envoie une Prepare plus élevée invalidant P1, P1 envoie une Prepare encore plus élevée invalidant P2, répétant indéfiniment. Aucun ne peut compléter la Phase 2. Paxos n'a pas de garantie de vivacité (FLP).",
        "Deux proposeurs reçoivent des votes de majorités différentes causant un split brain",
        "Les proposeurs rivaux font croître le log sans limite avec des entrées dupliquées"
      ],
      correct: 1,
    },
    {
      question: "Comment Multi-Paxos réduit-il le coût du consensus de 2 allers-retours à 1 par commande en fonctionnement normal ?",
      options: [
        "Multi-Paxos compresse plusieurs commandes en un seul round Paxos",
        "Le leader stable exécute la Phase 1 une fois pour tous les slots de log futurs — tant que le leader reste stable, seule la Phase 2 est nécessaire par commande, réduisant à 1 aller-retour. La Phase 1 ne se ré-exécute qu'au changement de leader.",
        "Multi-Paxos saute l'étape Promise pour les commandes inférieures à 4 Ko",
        "Multi-Paxos utilise un quorum plus grand qui acquitte les commandes en parallèle"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi la tolérance aux pannes byzantines nécessite-t-elle 3f+1 nœuds alors que la tolérance aux pannes par plantage n'en nécessite que 2f+1 ?",
      options: [
        "Les nœuds byzantins nécessitent plus de réplicas pour stocker des signatures cryptographiques supplémentaires",
        "Un nœud byzantin peut mentir et prétendre faire partie de deux majorités différentes simultanément. Avec 2f+1 nœuds, un nœud byzantin peut se faire passer pour membre des deux majorités. Avec 3f+1, même si f nœuds mentent, la majorité honnête de 2f+1 les surpasse quand même.",
        "Les pannes byzantines nécessitent plus de nœuds car elles surviennent plus fréquemment que les plantages",
        "3f+1 est requis car les nœuds byzantins consomment plus de bande passante réseau"
      ],
      correct: 1,
    },
    {
      question: "Quelle est la différence clé entre ZAB (Zookeeper) et Paxos standard ?",
      options: [
        "ZAB utilise une taille de quorum différente de Paxos",
        "ZAB est un protocole de diffusion atomique garantissant l'ordre total de toutes les mises à jour et la livraison de tous les messages précédant un plantage de leader — Paxos garantit seulement l'accord sur une valeur choisie unique. ZAB ajoute des garanties d'ordre et de livraison que Paxos seul ne fournit pas.",
        "ZAB utilise 3 phases tandis que Paxos en utilise 2",
        "ZAB supporte les pannes byzantines tandis que Paxos ne gère que les pannes par plantage"
      ],
      correct: 1,
    },
  ],
};
