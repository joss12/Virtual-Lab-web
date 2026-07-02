export const content = {
  en: `# Distributed Consensus

## The Fundamental Problem

In a distributed system, multiple nodes must agree on a single value or sequence of events — even when some nodes crash, messages are delayed, or the network partitions. This is the **consensus problem**.

\`\`\`
Why consensus is hard:

Node A: "The value is 42"
Node B: "The value is 43"
Node C: (crashed, no response)

Who is right? How do A and B agree without C?
What if the network between A and B is slow?
What if A receives B's message but B never receives A's?

This is not a software bug — it is a fundamental property of distributed systems.
\`\`\`

### The Two Generals Problem

A classic thought experiment that proves reliable communication over an unreliable channel is impossible:

\`\`\`
Two armies (General A, General B) must attack simultaneously to win.
They can only communicate via messengers through enemy territory.
Messengers may be captured (messages lost).

General A sends: "Attack at dawn"
General B receives it and sends confirmation: "Confirmed, attack at dawn"
General A receives confirmation and sends: "Acknowledged"
...

No matter how many confirmations are exchanged:
  General A cannot be certain B received the last message
  General B cannot be certain A received the confirmation
  
  If General A is not certain → A might not attack → B attacks alone → loses
  If General B is not certain → B might not attack → A attacks alone → loses

Proof: the last message in any exchange is always uncertain.
TCP's three-way handshake has the same fundamental limitation.
\`\`\`

### FLP Impossibility

Fischer, Lynch, and Paterson (1985) proved that **no deterministic consensus algorithm can guarantee termination in an asynchronous system** if even one process can crash.

\`\`\`
Asynchronous system: no bounds on message delivery time
  (you cannot distinguish "slow" from "crashed")

FLP result: in such a system, consensus is impossible if any node can fail.

Real systems get around this by:
  1. Partial synchrony: assume messages arrive within some unknown bound
     (Paxos, Raft use this assumption)
  2. Randomization: use random timeouts to break symmetry
     (Raft's election timeout is randomized)
  3. Failure detectors: heartbeats to distinguish slow from crashed
\`\`\`

## Raft — The Understandable Consensus Algorithm

Raft was designed specifically to be more understandable than Paxos. It powers etcd (Kubernetes), CockroachDB, TiKV, and many other systems.

### The Three Roles

\`\`\`
Leader:    receives all client requests, replicates log entries to followers
Follower:  passive, responds to leader and candidate requests
Candidate: running for election, tries to become leader

State transitions:
  Follower  → Candidate: election timeout expires (no heartbeat from leader)
  Candidate → Leader:    receives votes from majority of nodes
  Candidate → Follower:  another node wins election or higher term seen
  Leader    → Follower:  discovers higher term (was partitioned, new leader elected)
\`\`\`

### Terms — Logical Clocks

\`\`\`
Raft divides time into terms — monotonically increasing integers.

Term 1: Node A is leader, serves requests
        [====== Term 1 ======]

Network partition: A isolated, B and C elect a new leader

Term 2: Node B is leader
                           [====== Term 2 ======]

A rejoins, sees term 2 > its term 1 → immediately becomes follower

Terms serve as logical clocks:
  Any message with term > current_term: update term, convert to follower
  Any message with term < current_term: reject (stale message from old leader)
\`\`\`

### Leader Election

\`\`\`
Election timeout: each follower has a random timer (150-300ms in etcd)
  If no heartbeat received before timeout → start election

Election process:
  1. Increment term (term = term + 1)
  2. Vote for self
  3. Send RequestVote RPC to all other nodes

RequestVote RPC:
  Arguments: term, candidateId, lastLogIndex, lastLogTerm
  
  Voter grants vote if:
    a) candidate's term >= voter's current term
    b) voter hasn't voted for anyone else this term
    c) candidate's log is at least as up-to-date as voter's log
       (lastLogTerm > voter's lastLogTerm) OR
       (lastLogTerm == voter's lastLogTerm AND lastLogIndex >= voter's lastLogIndex)

  Condition (c) is critical — ensures only nodes with the most up-to-date log can win

Majority required: N/2 + 1 votes (e.g., 3 of 5 nodes)
  Guarantees only one leader per term (two candidates can't both get majority)

Split vote: two candidates get equal votes → timeout → new election
  Random timeouts make split votes rare and short-lived
\`\`\`

### Log Replication — The Core Protocol

\`\`\`
Log entry structure:
  Index: 1    Term: 1    Command: SET x=1
  Index: 2    Term: 1    Command: SET y=2
  Index: 3    Term: 2    Command: SET x=5
  Index: 4    Term: 2    Command: DEL y

Leader's write path:
  1. Client sends command to leader
  2. Leader appends entry to its log (uncommitted)
  3. Leader sends AppendEntries RPC to all followers in parallel
  4. When majority of nodes have written entry to their log:
     → Leader commits the entry
     → Leader applies command to state machine
     → Leader responds to client with result
  5. Leader notifies followers of commit in next AppendEntries
  6. Followers apply committed entries to their state machines
\`\`\`

\`\`\`
AppendEntries RPC:
  Arguments:
    term          — leader's current term
    leaderId      — so followers can redirect clients
    prevLogIndex  — index of log entry preceding new entries
    prevLogTerm   — term of prevLogIndex entry
    entries[]     — new entries to append (empty for heartbeat)
    leaderCommit  — leader's commit index

  Follower accepts if:
    a) term >= follower's currentTerm
    b) log contains entry at prevLogIndex with term == prevLogTerm
       (Log Matching Property — ensures logs are consistent)

  If (b) fails: follower rejects → leader decrements nextIndex and retries
    This is how leader finds the point where logs diverge and fixes the follower
\`\`\`

### Log Matching Property

This is the key invariant that makes Raft correct:

\`\`\`
If two log entries in different nodes have the same index and term,
then:
  1. They store the same command
  2. All preceding entries are identical

Proof by induction:
  Base case: logs start empty — trivially identical
  Inductive step: AppendEntries includes prevLogIndex and prevLogTerm.
    If follower accepts, its entry at prevLogIndex matches leader's.
    By induction, all preceding entries also match.
    → New entry is only appended if all preceding entries match.
\`\`\`

### Cluster Membership Changes

Adding/removing nodes while the cluster is running. The naive approach is dangerous:

\`\`\`
Dangerous: switch directly from 3-node to 5-node config
  Moment of transition: old config majority = 2, new config majority = 3
  Node A (old config): gets 2 votes → elected leader
  Node D (new config): gets 3 votes → also elected leader
  Two leaders simultaneously → split brain

Safe: Joint Consensus (Raft's approach)
  Phase 1: leader commits a "joint config" entry (C_old,new)
    During joint: need majority of BOTH old AND new config
    Prevents two leaders
  Phase 2: leader commits new config entry (C_new)
    Now only new config majority needed

Alternative (simpler): add/remove one node at a time
  3 → 4 → 5 nodes, each transition is safe
  etcd uses this approach
\`\`\`

### Safety Guarantees

\`\`\`
Raft guarantees:
  Election Safety:    at most one leader per term
  Leader Append-Only: leader never overwrites or deletes log entries
  Log Matching:       if two logs have same index+term entry, all preceding match
  Leader Completeness: if entry committed in term T, it's in all future leaders' logs
  State Machine Safety: if server applies entry at index N, no other server applies
                         different entry at index N

What Raft does NOT guarantee:
  Liveness under network partition (FLP result — termination not guaranteed)
  Performance (every write requires majority acknowledgment — latency)
  Exactly-once delivery (application must handle duplicate commands)
\`\`\`

## Raft in Practice — etcd

etcd is the reference Raft implementation, used as Kubernetes' backing store:

\`\`\`
etcd cluster (3 or 5 nodes recommended):
  Leader handles all writes
  Followers serve reads (optionally, with linearizability trade-off)
  
Write latency:
  Client → Leader: 1 network hop
  Leader → Followers: 1 network hop (parallel)
  Majority acknowledgment → commit → response
  Total: 2 network round trips minimum
  
  On a 1ms LAN: ~2-5ms per write
  On a 10ms WAN: ~20-50ms per write → why geographic distribution hurts write latency

Read modes:
  Linearizable (default): leader confirms it's still leader before serving read
    → always consistent, 1 extra round trip
  Serializable: read from any node, may be stale
    → faster, lower consistency

Watch API (Kubernetes uses this extensively):
  WATCH /pods/  → stream of all changes to keys with prefix /pods/
  Leader maintains watch streams, pushes updates to clients
  Zero polling — clients notified immediately on change
\`\`\`

\`\`\`go
// etcd client usage
cli, _ := clientv3.New(clientv3.Config{
    Endpoints:   []string{"etcd1:2379", "etcd2:2379", "etcd3:2379"},
    DialTimeout: 5 * time.Second,
})

// Write
cli.Put(ctx, "/config/db_host", "postgres:5432")

// Read (linearizable by default)
resp, _ := cli.Get(ctx, "/config/db_host")

// Watch
watchChan := cli.Watch(ctx, "/config/", clientv3.WithPrefix())
for resp := range watchChan {
    for _, ev := range resp.Events {
        fmt.Printf("%s %q : %q\\n", ev.Type, ev.Kv.Key, ev.Kv.Value)
    }
}

// Distributed lock (lease-based)
lease, _ := cli.Grant(ctx, 30) // 30 second lease
cli.Put(ctx, "/locks/mylock", "holder", clientv3.WithLease(lease.ID))
// Key auto-deleted when lease expires (process crash = lock released)
\`\`\`

## Multi-Raft and Sharding

A single Raft group becomes a bottleneck at scale. Production systems use **multi-Raft** — multiple independent Raft groups, each responsible for a shard.

\`\`\`
TiKV (TiDB's storage layer):
  Data divided into Regions (default 96MB each)
  Each Region is an independent Raft group (3 replicas)
  A node participates in hundreds of Raft groups simultaneously
  
  Write to key K:
    1. Route to Region containing K
    2. That Region's Raft leader handles the write
    3. Committed via Region's Raft group (3 nodes)
  
  Region split: when Region grows > 96MB → split into two Regions
    New Region starts new Raft election
  
  Region balancing: PD (Placement Driver) moves Regions across nodes
    for load balancing and fault tolerance

CockroachDB:
  Same concept: Ranges (64MB) → each Range is a Raft group
  Leaseholder = Raft leader = serves reads without round trip to followers
\`\`\`

## Raft vs Paxos

\`\`\`
Paxos (Lamport, 1989):
  Original consensus algorithm
  Describes single-value consensus (Single-Decree Paxos)
  Multi-Paxos (for log replication) is not formally specified
  Very hard to understand and implement correctly
  Many variants: Multi-Paxos, Fast Paxos, Byzantine Paxos, Cheap Paxos

Raft (Ongaro & Ousterhout, 2014):
  Explicitly designed for log replication (not single value)
  Strong leader — all writes go through leader (simpler than leaderless Paxos)
  Randomized election timeouts (simpler than Paxos's complex leader election)
  Formal specification, reference implementation (etcd)
  
  Performance difference:
    Leaderless Paxos variants can commit in 1 round trip (vs Raft's 2)
    In practice: Raft's simplicity wins for correctness and operability

Industrial implementations:
  Raft:  etcd, CockroachDB, TiKV, Consul, RethinkDB
  Paxos: Google Chubby, Google Spanner (uses Paxos variant), Zookeeper (ZAB ≈ Paxos)
\`\`\`
`,

  fr: `# Consensus distribué

## Le problème fondamental

Dans un système distribué, plusieurs nœuds doivent s'accorder sur une valeur unique ou une séquence d'événements — même quand certains nœuds plantent, les messages sont retardés, ou le réseau se partitionne.

### L'impossibilité FLP

Fischer, Lynch et Paterson (1985) ont prouvé qu'**aucun algorithme de consensus déterministe ne peut garantir la terminaison dans un système asynchrone** si même un processus peut planter.

\`\`\`
Systèmes réels contournent cela par :
  1. Synchronie partielle : supposer que les messages arrivent dans un délai inconnu
     (Paxos, Raft utilisent cette hypothèse)
  2. Randomisation : délais d'élection aléatoires pour briser la symétrie
  3. Détecteurs de pannes : heartbeats pour distinguer lent de planté
\`\`\`

## Raft — L'algorithme de consensus compréhensible

Raft alimente etcd (Kubernetes), CockroachDB, TiKV et de nombreux autres systèmes.

### Les trois rôles

\`\`\`
Leader :     reçoit toutes les requêtes clients, réplique les entrées de log
Follower :   passif, répond aux requêtes du leader et des candidats
Candidat :   se présente aux élections, essaie de devenir leader
\`\`\`

### Termes — Horloges logiques

\`\`\`
Raft divise le temps en termes — entiers monotoniquement croissants.

Terme 1 : Nœud A est leader, sert les requêtes
Partition réseau : A isolé, B et C élisent un nouveau leader
Terme 2 : Nœud B est leader

A rejoint, voit terme 2 > son terme 1 → devient immédiatement follower

Les termes servent d'horloges logiques :
  Message avec terme > terme_actuel → mettre à jour terme, devenir follower
  Message avec terme < terme_actuel → rejeter (message obsolète)
\`\`\`

### Élection de leader

\`\`\`
Délai d'élection : chaque follower a un timer aléatoire (150-300ms dans etcd)
  Si pas de heartbeat avant expiration → démarrer une élection

Processus d'élection :
  1. Incrémenter le terme
  2. Voter pour soi-même
  3. Envoyer RPC RequestVote à tous les autres nœuds

L'électeur accorde son vote si :
  a) terme du candidat >= terme actuel de l'électeur
  b) l'électeur n'a pas déjà voté ce terme
  c) le log du candidat est au moins aussi à jour que celui de l'électeur

Condition (c) critique — garantit que seuls les nœuds avec le log le plus récent peuvent gagner
\`\`\`

### Réplication du log

\`\`\`
Chemin d'écriture du leader :
  1. Client envoie commande au leader
  2. Leader ajoute l'entrée à son log (non committée)
  3. Leader envoie RPC AppendEntries à tous les followers en parallèle
  4. Quand la majorité des nœuds a écrit l'entrée :
     → Leader committe l'entrée
     → Leader applique la commande à la machine d'état
     → Leader répond au client
  5. Leader notifie les followers du commit dans le prochain AppendEntries
\`\`\`

### Propriété de correspondance de log

\`\`\`
Si deux entrées de log sur des nœuds différents ont le même index et terme,
alors :
  1. Elles stockent la même commande
  2. Toutes les entrées précédentes sont identiques

Cette invariante garantit la cohérence du log à travers le cluster.
\`\`\`

## Raft en pratique — etcd

\`\`\`
Latence d'écriture :
  Client → Leader : 1 saut réseau
  Leader → Followers : 1 saut réseau (parallèle)
  Accusé de réception de la majorité → commit → réponse
  Total : minimum 2 allers-retours réseau
  
  Sur un LAN à 1ms : ~2-5ms par écriture
  Sur un WAN à 10ms : ~20-50ms par écriture

Modes de lecture :
  Linéarisable (défaut) : le leader confirme qu'il est toujours leader
    → toujours cohérent, 1 aller-retour supplémentaire
  Sérialisable : lire depuis n'importe quel nœud, peut être obsolète
    → plus rapide, cohérence moindre
\`\`\`

## Multi-Raft et sharding

\`\`\`
TiKV (couche de stockage de TiDB) :
  Données divisées en Regions (96 Mo par défaut)
  Chaque Region est un groupe Raft indépendant (3 réplicas)
  Un nœud participe à des centaines de groupes Raft simultanément

CockroachDB :
  Même concept : Ranges (64 Mo) → chaque Range est un groupe Raft
  Leaseholder = leader Raft = sert les lectures sans aller-retour vers les followers
\`\`\`

## Raft vs Paxos

\`\`\`
Paxos (Lamport, 1989) :
  Algorithme de consensus original
  Très difficile à comprendre et implémenter correctement
  Nombreuses variantes : Multi-Paxos, Fast Paxos, Byzantine Paxos

Raft (Ongaro & Ousterhout, 2014) :
  Explicitement conçu pour la réplication de log
  Leader fort — toutes les écritures passent par le leader
  Délais d'élection randomisés
  
Implémentations industrielles :
  Raft :  etcd, CockroachDB, TiKV, Consul
  Paxos : Google Chubby, Google Spanner, Zookeeper (ZAB ≈ Paxos)
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What does the FLP impossibility result prove, and how do real systems work around it?",
      options: [
        "FLP proves that distributed systems cannot achieve consistency — real systems accept eventual consistency instead",
        "FLP proves no deterministic consensus algorithm can guarantee termination in a fully asynchronous system if any node can fail — real systems use partial synchrony assumptions (message bounds exist but are unknown), randomized timeouts, or failure detectors to make progress in practice",
        "FLP proves that consensus requires at least 3 nodes — real systems always deploy in odd-numbered clusters",
        "FLP proves that network partitions always cause data loss — real systems use synchronous replication to prevent this",
      ],
      correct: 1,
    },
    {
      question:
        "In Raft, why must a candidate's log be 'at least as up-to-date' as a voter's log to receive a vote?",
      options: [
        "This ensures the new leader has the highest term number in the cluster",
        "This prevents candidates with fewer votes from being elected",
        "This guarantees Leader Completeness — a newly elected leader must have all committed entries. If a node with a stale log could win, committed entries would be lost because the new leader never overwrites its own log.",
        "This reduces election time by eliminating candidates with large logs",
      ],
      correct: 2,
    },
    {
      question:
        "What is the Log Matching Property in Raft and why does it matter?",
      options: [
        "Log matching ensures all logs have the same number of entries before committing",
        "If two log entries at the same index and term exist on different nodes, they store the same command AND all preceding entries are identical — AppendEntries enforces this via prevLogIndex/prevLogTerm checks, ensuring cluster-wide log consistency",
        "Log matching ensures the leader's log is always longer than follower logs",
        "Log matching prevents two leaders from being elected in the same term",
      ],
      correct: 1,
    },
    {
      question:
        "Why is directly switching a Raft cluster from 3 nodes to 5 nodes dangerous, and how does Joint Consensus solve it?",
      options: [
        "Adding 2 nodes at once overloads the leader with replication traffic",
        "During the transition, old config needs majority 2, new config needs majority 3 — two different leaders could be elected simultaneously causing split brain. Joint Consensus requires majority of BOTH old and new configs during transition, making two leaders impossible.",
        "The cluster must be stopped during membership changes to prevent data loss",
        "Adding nodes changes the hash slot assignments causing data to be misrouted",
      ],
      correct: 1,
    },
    {
      question:
        "Why does geographic distribution hurt Raft write latency so significantly?",
      options: [
        "Raft requires all nodes to acknowledge each write, and distant nodes have high latency",
        "Geographic distribution requires more nodes which increases election time",
        "Every Raft write requires at least 2 network round trips — client to leader plus leader to majority of followers. On a 10ms WAN, each round trip is 10ms+, making every write 20-50ms minimum versus 2-5ms on a LAN.",
        "Geographic distribution causes more frequent leader elections which pause writes",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question:
        "Que prouve le résultat d'impossibilité FLP, et comment les systèmes réels le contournent-ils ?",
      options: [
        "FLP prouve que les systèmes distribués ne peuvent pas atteindre la cohérence — les systèmes réels acceptent la cohérence éventuelle",
        "FLP prouve qu'aucun algorithme de consensus déterministe ne peut garantir la terminaison dans un système totalement asynchrone si un nœud peut planter — les systèmes réels utilisent des hypothèses de synchronie partielle, des délais randomisés ou des détecteurs de pannes",
        "FLP prouve que le consensus nécessite au moins 3 nœuds",
        "FLP prouve que les partitions réseau causent toujours une perte de données",
      ],
      correct: 1,
    },
    {
      question:
        "Dans Raft, pourquoi le log d'un candidat doit-il être 'au moins aussi récent' que celui d'un électeur pour recevoir son vote ?",
      options: [
        "Cela garantit que le nouveau leader a le numéro de terme le plus élevé",
        "Cela empêche les candidats avec moins de votes d'être élus",
        "Cela garantit la Complétude du Leader — un leader nouvellement élu doit avoir toutes les entrées committées. Si un nœud avec un log obsolète pouvait gagner, les entrées committées seraient perdues.",
        "Cela réduit le temps d'élection en éliminant les candidats avec de grands logs",
      ],
      correct: 2,
    },
    {
      question:
        "Quelle est la Propriété de Correspondance de Log dans Raft et pourquoi est-elle importante ?",
      options: [
        "La correspondance de log garantit que tous les logs ont le même nombre d'entrées avant de committer",
        "Si deux entrées de log au même index et terme existent sur différents nœuds, elles stockent la même commande ET toutes les entrées précédentes sont identiques — AppendEntries impose cela via les vérifications prevLogIndex/prevLogTerm",
        "La correspondance de log garantit que le log du leader est toujours plus long que les logs des followers",
        "La correspondance de log empêche deux leaders d'être élus dans le même terme",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi passer directement un cluster Raft de 3 à 5 nœuds est-il dangereux ?",
      options: [
        "Ajouter 2 nœuds à la fois surcharge le leader avec le trafic de réplication",
        "Pendant la transition, l'ancienne config nécessite la majorité 2, la nouvelle 3 — deux leaders différents pourraient être élus simultanément causant un split brain. Le Consensus Joint nécessite la majorité des DEUX configs pendant la transition.",
        "Le cluster doit être arrêté pendant les changements de membres",
        "L'ajout de nœuds change les assignations de slots de hachage",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi la distribution géographique nuit-elle autant à la latence d'écriture Raft ?",
      options: [
        "Raft nécessite que tous les nœuds acquittent chaque écriture",
        "La distribution géographique nécessite plus de nœuds ce qui augmente le temps d'élection",
        "Chaque écriture Raft nécessite au minimum 2 allers-retours réseau — client vers leader puis leader vers la majorité des followers. Sur un WAN à 10ms, chaque aller-retour est 10ms+, rendant chaque écriture au minimum 20-50ms contre 2-5ms sur un LAN.",
        "La distribution géographique cause des élections de leader plus fréquentes qui pausent les écritures",
      ],
      correct: 2,
    },
  ],
};

