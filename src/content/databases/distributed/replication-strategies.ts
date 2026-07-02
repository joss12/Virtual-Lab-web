export const content = {
  en: `# Replication Strategies

## Why Replication Strategy Matters

The replication strategy determines how data is copied across nodes, who can accept writes, how conflicts are resolved, and what consistency guarantees are possible. Choosing the wrong strategy is one of the most expensive architectural mistakes — it's very hard to change later.

\`\`\`
Replication dimensions:
  1. Topology:    who can write? (single leader, multi-leader, leaderless)
  2. Synchrony:   when is a write "done"? (sync, async, semi-sync)
  3. Conflict:    what happens when two nodes accept conflicting writes?
  4. Consistency: what do readers see? (strong, causal, eventual)
\`\`\`

## Single-Leader Replication

One node is the **leader** (also called primary or master). All writes go to the leader. Followers (replicas, secondaries) receive changes from the leader and apply them.

\`\`\`
                    ┌──────────────┐
  Writes ──────────▶│    Leader    │
                    └──────┬───────┘
                    Replication stream
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
         [Follower 1]  [Follower 2]  [Follower 3]
              │             │             │
          Reads          Reads          Reads
\`\`\`

### Replication Log Formats

How does the leader communicate changes to followers?

\`\`\`
Statement-based replication:
  Leader sends the actual SQL statement: "UPDATE users SET name='Alice' WHERE id=1"
  Problems:
    - Non-deterministic functions: NOW(), RAND(), UUID() produce different results
    - Side effects: triggers, stored procedures may execute differently
    - Ordering: concurrent statements must execute in same order on all replicas
  Used by: MySQL statement-based binlog (legacy, not recommended)

Write-ahead log (WAL) shipping:
  Leader sends raw WAL bytes to followers
  Followers apply same physical byte changes to same page offsets
  Problems:
    - Tightly coupled to storage engine internals
    - Cannot replicate between different versions (PostgreSQL major versions)
  Used by: PostgreSQL streaming replication

Logical (row-based) log replication:
  Leader sends decoded row changes: "row inserted: {id:1, name:'Alice'}"
  Decoupled from storage format
  Can replicate between versions
  Used by: MySQL ROW binlog, PostgreSQL logical replication, Debezium CDC

Trigger-based replication:
  Application-level: triggers write changes to a separate table
  Replication process reads that table and applies changes
  Most flexible (can filter/transform), most overhead
  Used by: Slony (PostgreSQL), Bucardo
\`\`\`

### Replication Lag

\`\`\`
Asynchronous replication lag:
  Leader commits write → returns to client → sends to follower
  Follower applies write → some time later

  Client writes "Alice" to leader
  Client immediately reads from follower → sees "Bob" (old value)
  1 second later, follower catches up → client reads "Alice"

  This window of inconsistency = replication lag
  Typical: 1ms-1s on LAN, 10ms-10s on WAN under load

Measuring lag (PostgreSQL):
  SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;
  -- On replica: shows how far behind it is

  SELECT application_name,
         write_lag, flush_lag, replay_lag
  FROM pg_stat_replication;
  -- On primary: shows per-replica lag
\`\`\`

### Problems with Replication Lag

**Read-after-write consistency:**
\`\`\`
Problem:
  User updates profile photo → write goes to leader
  User immediately refreshes page → read goes to follower
  Follower hasn't caught up → user sees old photo
  "My update was lost!" (it wasn't — just not replicated yet)

Solutions:
  1. Read from leader for data the user might have just modified
     "Always read user's own profile from leader"
  
  2. Track last write timestamp client-side
     After write: store timestamp in cookie/session
     Read: if timestamp < 1 minute ago, read from leader
           otherwise, read from follower

  3. Route user's session to same replica
     All reads from that session go to one replica
     That replica's lag only affects this user
\`\`\`

**Monotonic reads:**
\`\`\`
Problem:
  Query 1 routes to follower F1 (lag=0) → sees comment posted 1s ago
  Query 2 routes to follower F2 (lag=5s) → doesn't see that comment
  User sees comment disappear! (going "back in time")

Solution:
  Route each user's reads to the same replica
  Session affinity: hash(user_id) % num_replicas → always same replica
\`\`\`

**Consistent prefix reads:**
\`\`\`
Problem (sharded systems):
  Shard 1 has: "Mr. Poons: How far into the future can you see?"
  Shard 2 has: "Mrs. Cake: About ten seconds usually."
  
  Follower of shard 2 lags behind shard 1 follower
  Reader sees: "Mrs. Cake: About ten seconds usually."
               (hasn't seen the question yet!)

Solution:
  Causally related writes go to same shard
  Causal consistency protocols (vector clocks, hybrid logical clocks)
\`\`\`

## Multi-Leader Replication

Multiple nodes can accept writes. Each leader replicates to other leaders and to its followers.

\`\`\`
Datacenter A:              Datacenter B:
  Leader A ◄──────────────► Leader B
     │    bi-directional       │
     │    replication          │
  Follower  Follower       Follower  Follower

Use cases:
  Multi-datacenter operation: each datacenter has local leader
  Offline clients: device is leader for local data (CouchDB, mobile sync)
  Collaborative editing: Google Docs (each user is effectively a leader)
\`\`\`

### Write Conflicts — The Core Problem

\`\`\`
Both leaders accept concurrent writes to the same data:

Leader A (user in Europe):   UPDATE title = "B" WHERE id=1  (was "A")
Leader B (user in Asia):     UPDATE title = "C" WHERE id=1  (was "A")

Both commits succeed locally.
When replication streams meet: conflict!

Leader A sees: id=1 title went A→B
Leader B sees: id=1 title went A→C
Which is correct? B or C?
\`\`\`

### Conflict Resolution Strategies

**Last Write Wins (LWW):**
\`\`\`
Attach timestamp to every write.
On conflict: higher timestamp wins.

title="B" timestamp=1704067201
title="C" timestamp=1704067200
→ title="B" wins (higher timestamp)

Problems:
  Clock skew: clocks on different servers differ by milliseconds to seconds
  NTP synchronization is approximate, not exact
  A write that happened "later" (real time) might have lower timestamp
  
  Result: silently discard writes that were "correct" by real time
  
  LWW is used by: Cassandra (default), DynamoDB (in certain modes)
  Safe for: immutable data, time-series (each timestamp is unique key)
  Unsafe for: any data that can be updated by multiple users
\`\`\`

**Conflict-free Replicated Data Types (CRDTs):**
\`\`\`
Data structures designed so concurrent updates always merge deterministically.

Counter CRDT (G-Counter — grow only):
  Each node maintains its own counter:
    Node A: {A:5, B:3, C:2}  (I've incremented 5 times, saw A inc 3, saw B inc 2)
    Node B: {A:4, B:4, C:1}
  
  Merge: take max of each node's counter
    Merged: {A:5, B:4, C:2}
  
  Read: sum all values = 5+4+2 = 11
  No conflicts possible — merging is commutative, associative, idempotent

Set CRDT:
  G-Set (grow only): only add, never remove → no conflicts
  2P-Set (two-phase): add set + remove set, element removed if in remove set
  OR-Set: add unique tags per add, remove removes specific tags
    → allows add-then-remove-then-add correctly

Used by: Riak (default data types), Redis CRDT (Redis Enterprise),
         collaborative text editors (Automerge, Yjs)
\`\`\`

**Application-level conflict resolution:**
\`\`\`
Expose conflict to application, let application decide:

CouchDB approach:
  Both conflicting versions are stored
  Application reads all versions (_conflicts flag)
  Application writes resolved version + deletes losers

Git approach:
  Divergent branches = conflict
  Merge commit resolves: human decides or automated merge strategy

Shopping cart (Amazon Dynamo paper):
  Both versions are kept (union of items)
  Some items may appear twice → application deduplicates
  "Never lose an item from cart" prioritized over consistency
  
  Add "Milk" from phone:        {Milk}
  Add "Bread" from laptop:      {Bread}
  Merge:                        {Milk, Bread}  ← no conflict, just union
  
  Delete "Milk" from phone:     {} 
  Add "Eggs" from laptop:       {Milk, Eggs}
  Merge: ???                    Amazon chose to keep Milk (not lose deletes)
\`\`\`

**Operational Transform (OT) — Collaborative Editing:**
\`\`\`
Used by: Google Docs (original), Apache Wave, Etherpad

Concurrent edits on "Hello World":
  User A inserts "Beautiful " at position 6: "Hello Beautiful World"
  User B deletes "World" (positions 6-10): "Hello "

Naive application:
  Apply A's insert first → "Hello Beautiful World"
  Apply B's delete at positions 6-10 → "Hello Beautiful " (deletes "Beau"!)
  Wrong!

Operational Transform:
  Transform B's operation against A's operation:
  B deleted at positions 6-10, but A inserted 10 chars at position 6
  Transform B's delete: new position = 6+10 = 16, same length
  Result: delete "World" at positions 16-20 → "Hello Beautiful "
  Correct!

OT requires central server to serialize operations (hard to decentralize)
CRDTs are preferred for new systems (no central server needed)
\`\`\`

## Leaderless Replication (Dynamo-style)

No designated leader. Any node can accept writes. Made famous by Amazon Dynamo (2007) and used in Cassandra, Riak, Voldemort.

\`\`\`
Client writes to multiple replicas directly:
  Write to N replicas, wait for W acknowledgments
  
  N=3, W=2: write to all 3 nodes, wait for 2 to confirm
  
  Node 1: ✓ (confirmed)
  Node 2: ✓ (confirmed)    → W=2 reached → return success to client
  Node 3: ✗ (down or slow)

Client reads from multiple replicas:
  Read from R replicas, return most recent value
  
  N=3, R=2: read from 2 nodes
  
  Node 1: value=v2, version=5
  Node 2: value=v1, version=4   → return v2 (highest version)
  
  Quorum condition: W + R > N → at least one node has latest write
    N=3, W=2, R=2: 2+2=4 > 3 ✓ strong consistency
    N=3, W=1, R=1: 1+1=2 < 3 ✗ eventual consistency only
\`\`\`

### Read Repair and Anti-Entropy

\`\`\`
Read repair:
  During read, if different replicas return different values:
    Client (or coordinator) detects version mismatch
    Writes latest version back to stale replicas
    Passive self-healing — only fixes nodes that are read

Anti-entropy process:
  Background process continuously compares replicas
  Uses Merkle trees to efficiently find differences
  Sends missing/outdated data to lagging replicas
  
  Merkle tree:
    Leaf nodes: hash of individual data blocks
    Internal nodes: hash of children hashes
    Root: hash of entire dataset
    
    To find differences between two nodes:
      Compare root hashes → if equal, everything matches → done
      If different → compare children recursively
      → O(log N) comparisons to find differing blocks
\`\`\`

### Sloppy Quorum and Hinted Handoff

\`\`\`
Problem: N=3, W=2, but 2 of 3 designated replicas are down.
  Strict quorum: refuse write (CP behavior)
  Sloppy quorum: write to any 2 available nodes (AP behavior)

Hinted handoff:
  Node 4 (not normally a replica) accepts write during outage
  Stores: "This write is for Node 2, deliver when it comes back"
  When Node 2 recovers: Node 4 delivers the hinted write
  
  Increases write availability at the cost of temporary inconsistency
  Used by: Cassandra, DynamoDB, Riak

Risk:
  W+R > N guarantee only holds for the designated N replicas
  Sloppy quorum violates this — hinted writes are on non-designated nodes
  A read from N designated nodes won't include the hinted write!
  → Sloppy quorum provides availability, NOT consistency
\`\`\`

## Quorum Limitations

Even with W + R > N, anomalies can occur:

\`\`\`
Sloppy quorum (covered above): reads may miss hinted writes

Concurrent writes:
  N=3, W=2, R=2
  Two clients write simultaneously to different nodes:
    Client 1 writes v1 to Node1, Node2 → W=2 ✓
    Client 2 writes v2 to Node2, Node3 → W=2 ✓
    Node2 has both v1 and v2 — which is latest?
    
  LWW resolves but may silently drop one write

Write followed by concurrent read:
  Write reaches Node1, Node2
  Read queries Node2, Node3 (Node3 hasn't received write yet)
  R=2 satisfied but Node3 has stale data
  → Read may return old value even with W+R > N during network delay

Stale reads after node recovery:
  Node1 missed writes during downtime
  Comes back online: Node1 has old data
  Read hits Node1 + Node2: Node1 votes for old value
  If read repair doesn't fix before next read: inconsistency visible
\`\`\`

## Choosing a Replication Strategy

\`\`\`
Single-leader:
  ✓ Simple to reason about
  ✓ No write conflicts
  ✓ Strong consistency possible (sync replication)
  ✗ Leader is write bottleneck
  ✗ Failover complexity
  Best for: most OLTP applications, default choice

Multi-leader:
  ✓ Multiple datacenters without cross-DC write latency
  ✓ Offline operation (mobile apps)
  ✗ Conflict resolution required
  ✗ Complex to operate
  Best for: multi-datacenter active-active, collaborative apps

Leaderless:
  ✓ High write availability (no leader to fail)
  ✓ Naturally multi-datacenter
  ✓ Tunable consistency per operation
  ✗ Conflict resolution (LWW loses data)
  ✗ Quorum guarantees weaker than they appear
  ✗ No transactions across keys (without extra coordination)
  Best for: high availability key-value workloads (Cassandra, DynamoDB)
\`\`\`
`,

  fr: `# Stratégies de réplication

## Pourquoi la stratégie de réplication est importante

La stratégie de réplication détermine qui peut accepter des écritures, comment les conflits sont résolus et quelles garanties de cohérence sont possibles.

\`\`\`
Dimensions de réplication :
  1. Topologie :  qui peut écrire ? (leader unique, multi-leader, sans leader)
  2. Synchronie : quand une écriture est-elle "terminée" ? (sync, async, semi-sync)
  3. Conflit :    que se passe-t-il quand deux nœuds acceptent des écritures conflictuelles ?
  4. Cohérence :  que voient les lecteurs ? (forte, causale, éventuelle)
\`\`\`

## Réplication à leader unique

Un seul nœud est le **leader**. Toutes les écritures vont au leader. Les followers reçoivent les changements du leader.

### Formats de log de réplication

\`\`\`
Réplication basée sur les instructions :
  Le leader envoie l'instruction SQL réelle
  Problèmes : fonctions non déterministes (NOW(), RAND()), effets secondaires

Expédition de WAL :
  Le leader envoie les octets WAL bruts
  Fortement couplé aux internals du moteur de stockage

Réplication logique (basée sur les lignes) :
  Le leader envoie les changements de lignes décodés
  Découplé du format de stockage, peut répliquer entre versions
  Utilisé par : binlog ROW MySQL, réplication logique PostgreSQL, Debezium CDC
\`\`\`

### Problèmes de lag de réplication

\`\`\`
Cohérence lecture-après-écriture :
  Problème : l'utilisateur met à jour sa photo → écriture sur leader
  Rafraîchissement immédiat → lecture sur follower → voit l'ancienne photo
  
  Solutions :
    1. Lire depuis le leader pour les données que l'utilisateur vient de modifier
    2. Suivre le timestamp de la dernière écriture côté client
    3. Router la session de l'utilisateur vers le même réplica

Lectures monotones :
  Problème : requête 1 sur F1 (lag=0) voit un commentaire
             requête 2 sur F2 (lag=5s) ne voit pas ce commentaire
  L'utilisateur voit le commentaire disparaître !
  
  Solution : router chaque lecture d'un utilisateur vers le même réplica
\`\`\`

## Réplication multi-leader

Plusieurs nœuds peuvent accepter des écritures. Chaque leader réplique vers les autres leaders.

### Résolution des conflits d'écriture

**Last Write Wins (LWW) :**
\`\`\`
Attacher un timestamp à chaque écriture.
En cas de conflit : le timestamp le plus élevé gagne.

Problèmes :
  Dérive d'horloge : les horloges sur différents serveurs diffèrent
  Une écriture "plus tardive" (temps réel) peut avoir un timestamp plus bas
  Résultat : écritures silencieusement perdues
\`\`\`

**CRDTs (Types de données répliqués sans conflit) :**
\`\`\`
Structures de données conçues pour que les mises à jour concurrentes
fusionnent toujours de manière déterministe.

Compteur G-Counter (croissance uniquement) :
  Nœud A : {A:5, B:3, C:2}
  Nœud B : {A:4, B:4, C:1}
  Fusion : prendre le max de chaque compteur
    Fusionné : {A:5, B:4, C:2}
  Lecture : somme = 5+4+2 = 11
  Aucun conflit possible — la fusion est commutative, associative, idempotente
\`\`\`

## Réplication sans leader (style Dynamo)

Pas de leader désigné. N'importe quel nœud peut accepter des écritures.

\`\`\`
Écriture : écrire sur N réplicas, attendre W acquittements
Lecture : lire depuis R réplicas, retourner la valeur la plus récente

Condition de quorum : W + R > N → au moins un nœud a la dernière écriture
  N=3, W=2, R=2 : 2+2=4 > 3 ✓ cohérence forte
  N=3, W=1, R=1 : 1+1=2 < 3 ✗ cohérence éventuelle uniquement
\`\`\`

### Quorum souple et Hinted Handoff

\`\`\`
Problème : N=3, W=2, mais 2 des 3 réplicas désignés sont hors ligne.
  Quorum strict : refuser l'écriture (comportement CP)
  Quorum souple : écrire sur 2 nœuds disponibles (comportement AP)

Hinted Handoff :
  Le nœud 4 (normalement pas un réplica) accepte l'écriture
  Stocke : "Cette écriture est pour le Nœud 2, livrer quand il revient"
  Quand le Nœud 2 récupère : le Nœud 4 livre l'écriture indiquée

Risque : le quorum souple ne garantit PAS la cohérence
\`\`\`

## Choisir une stratégie de réplication

\`\`\`
Leader unique :
  ✓ Simple à raisonner
  ✓ Pas de conflits d'écriture
  ✓ Cohérence forte possible
  ✗ Le leader est un goulot d'étranglement en écriture
  Meilleur pour : la plupart des applications OLTP

Multi-leader :
  ✓ Plusieurs datacenters sans latence d'écriture inter-DC
  ✓ Fonctionnement hors ligne
  ✗ Résolution de conflits nécessaire
  Meilleur pour : actif-actif multi-datacenter, apps collaboratives

Sans leader :
  ✓ Haute disponibilité en écriture
  ✓ Cohérence configurable par opération
  ✗ LWW perd des données
  ✗ Garanties de quorum plus faibles qu'elles n'y paraissent
  Meilleur pour : charges clé-valeur haute disponibilité
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "Why is statement-based replication dangerous and what replaced it?",
      options: [
        "Statement-based replication is too slow for high-throughput systems",
        "Non-deterministic functions like NOW(), RAND(), and UUID() produce different values on each replica, causing divergence. Triggers and stored procedures may also behave differently. Row-based (logical) replication replaced it by sending actual row changes instead of SQL statements.",
        "Statement-based replication requires too much network bandwidth",
        "Statement-based replication cannot handle schema changes"
      ],
      correct: 1,
    },
    {
      question: "What is the read-after-write consistency problem and how is it typically solved?",
      options: [
        "After a write, reads return errors until replication completes",
        "A user writes to the leader then immediately reads from a lagging follower, seeing their own write disappear. Solutions include reading the user's own data from the leader, tracking last-write timestamps client-side and routing recent reads to the leader, or using session affinity to route to one replica.",
        "Write operations must be retried if the read from the same node returns different data",
        "Read-after-write consistency is solved automatically by synchronous replication"
      ],
      correct: 1,
    },
    {
      question: "What makes CRDTs fundamentally different from Last Write Wins for conflict resolution?",
      options: [
        "CRDTs use cryptographic hashes to detect conflicts while LWW uses timestamps",
        "CRDTs are data structures designed so concurrent updates always merge deterministically without losing data — the merge operation is commutative, associative, and idempotent. LWW silently discards one write based on timestamp, which can be wrong due to clock skew.",
        "CRDTs require a central coordinator while LWW is fully decentralized",
        "CRDTs only work for numeric data while LWW works for any data type"
      ],
      correct: 1,
    },
    {
      question: "With leaderless replication N=3, W=2, R=2, why can reads still return stale data despite W+R > N?",
      options: [
        "The W+R > N guarantee only works for sequential operations, not concurrent ones",
        "Several scenarios break the guarantee: sloppy quorum writes go to non-designated nodes (reads from designated nodes miss them), concurrent writes create conflicts LWW resolves by dropping one, or network delays mean a write reaches 2 nodes but the read hits the 1 node that hasn't received it yet during that window.",
        "The formula W+R > N only guarantees consistency for integer values",
        "Leaderless systems cannot guarantee consistency without a coordinator node"
      ],
      correct: 1,
    },
    {
      question: "What is hinted handoff in leaderless replication and what risk does it introduce?",
      options: [
        "Hinted handoff is when a slow node hints to the client to retry the write later",
        "When designated replicas are unavailable, a non-designated node accepts the write with a 'hint' to deliver it when the target node recovers — increasing write availability. The risk: reads from the N designated nodes won't see the hinted write until delivery, breaking the W+R > N consistency guarantee.",
        "Hinted handoff is a technique to forward reads to the closest replica",
        "Hinted handoff stores writes in a client-side buffer during network outages"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Pourquoi la réplication basée sur les instructions est-elle dangereuse et qu'est-ce qui l'a remplacée ?",
      options: [
        "La réplication basée sur les instructions est trop lente pour les systèmes à haut débit",
        "Les fonctions non déterministes comme NOW(), RAND() et UUID() produisent des valeurs différentes sur chaque réplica, causant une divergence. La réplication basée sur les lignes (logique) l'a remplacée en envoyant les changements de lignes réels plutôt que les instructions SQL.",
        "La réplication basée sur les instructions nécessite trop de bande passante réseau",
        "La réplication basée sur les instructions ne peut pas gérer les changements de schéma"
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce que le problème de cohérence lecture-après-écriture et comment est-il généralement résolu ?",
      options: [
        "Après une écriture, les lectures retournent des erreurs jusqu'à ce que la réplication soit terminée",
        "Un utilisateur écrit sur le leader puis lit immédiatement depuis un follower en retard, voyant sa propre écriture disparaître. Les solutions incluent lire les propres données de l'utilisateur depuis le leader, suivre les timestamps de dernière écriture côté client, ou utiliser l'affinité de session.",
        "Les opérations d'écriture doivent être réessayées si la lecture du même nœud retourne des données différentes",
        "La cohérence lecture-après-écriture est résolue automatiquement par la réplication synchrone"
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce qui rend les CRDTs fondamentalement différents de Last Write Wins pour la résolution de conflits ?",
      options: [
        "Les CRDTs utilisent des hachages cryptographiques pour détecter les conflits tandis que LWW utilise des timestamps",
        "Les CRDTs sont des structures de données conçues pour que les mises à jour concurrentes fusionnent toujours de manière déterministe sans perdre de données — l'opération de fusion est commutative, associative et idempotente. LWW abandonne silencieusement une écriture basée sur le timestamp.",
        "Les CRDTs nécessitent un coordinateur central tandis que LWW est totalement décentralisé",
        "Les CRDTs ne fonctionnent que pour les données numériques tandis que LWW fonctionne pour tout type de données"
      ],
      correct: 1,
    },
    {
      question: "Avec la réplication sans leader N=3, W=2, R=2, pourquoi les lectures peuvent-elles encore retourner des données obsolètes malgré W+R > N ?",
      options: [
        "La garantie W+R > N ne fonctionne que pour les opérations séquentielles, pas concurrentes",
        "Plusieurs scénarios brisent la garantie : les écritures de quorum souple vont sur des nœuds non désignés (les lectures des nœuds désignés les manquent), les écritures concurrentes créent des conflits que LWW résout en abandonnant une, ou les délais réseau signifient qu'une écriture atteint 2 nœuds mais la lecture touche le nœud qui ne l'a pas encore reçue.",
        "La formule W+R > N ne garantit la cohérence que pour les valeurs entières",
        "Les systèmes sans leader ne peuvent pas garantir la cohérence sans nœud coordinateur"
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce que le hinted handoff dans la réplication sans leader et quel risque introduit-il ?",
      options: [
        "Le hinted handoff est quand un nœud lent indique au client de réessayer l'écriture plus tard",
        "Quand les réplicas désignés sont indisponibles, un nœud non désigné accepte l'écriture avec un 'hint' pour la livrer quand le nœud cible récupère — augmentant la disponibilité en écriture. Le risque : les lectures des N nœuds désignés ne verront pas l'écriture indiquée jusqu'à la livraison, brisant la garantie W+R > N.",
        "Le hinted handoff est une technique pour rediriger les lectures vers le réplica le plus proche",
        "Le hinted handoff stocke les écritures dans un buffer côté client pendant les pannes réseau"
      ],
      correct: 1,
    },
  ],
};
