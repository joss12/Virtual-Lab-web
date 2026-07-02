export const content = {
  en: `# Graph Databases

## Why Graph Databases Exist

Some data is fundamentally relational in the graph sense — not in the SQL sense. Social networks, recommendation engines, fraud detection, knowledge graphs, and dependency trees all have one thing in common: **the relationships between entities are as important as the entities themselves**.

\`\`\`sql
-- Relational approach: find friends of friends of Alice (2 hops)
SELECT DISTINCT u3.name
FROM users u1
JOIN friendships f1 ON u1.id = f1.user_id
JOIN users u2 ON f1.friend_id = u2.id
JOIN friendships f2 ON u2.id = f2.user_id
JOIN users u3 ON f2.friend_id = u3.id
WHERE u1.name = 'Alice'
  AND u3.id != u1.id;

-- At 6 hops (six degrees of separation), this query has 6 JOINs
-- and the intermediate result set explodes combinatorially.
-- A graph database traverses this natively in milliseconds.
\`\`\`

The performance of graph traversal in a relational database **degrades with depth**. Graph databases maintain constant-time traversal regardless of graph size — the property called **index-free adjacency**.

## The Property Graph Model

Neo4j's data model. The two fundamental primitives:

\`\`\`
Node:
  - Unique identity (internal ID)
  - Zero or more labels (e.g., :Person, :Movie, :Company)
  - Key-value properties (e.g., name: "Alice", age: 30)

Relationship:
  - Unique identity
  - Exactly one type (e.g., KNOWS, WORKS_AT, DIRECTED)
  - A start node and an end node (directed)
  - Key-value properties (e.g., since: 2019, weight: 0.8)
\`\`\`

\`\`\`
Example graph:
  (Alice:Person {age:30}) -[:KNOWS {since:2020}]→ (Bob:Person {age:25})
  (Alice:Person)          -[:WORKS_AT]→           (Acme:Company {founded:1990})
  (Bob:Person)            -[:WORKS_AT]→           (Acme:Company)
  (Carol:Person {age:35}) -[:KNOWS]→              (Alice:Person)
\`\`\`

## Neo4j Storage Format

Neo4j uses a **fixed-size record store** — not a B-tree, not an LSM tree. Every record type has a fixed size, enabling O(1) access by ID (just compute file offset = id × record_size).

### Store Files

\`\`\`
neostore.nodestore.db         — node records (15 bytes each)
neostore.relationshipstore.db — relationship records (34 bytes each)
neostore.propertystore.db     — property records (41 bytes each)
neostore.labeltokenstore.db   — label name → ID mapping
neostore.relationshiptypestore.db — relationship type → ID mapping
\`\`\`

### Node Record Format (15 bytes)

\`\`\`
Byte 0:     in-use flag (1 bit) + other flags
Bytes 1-4:  ID of first relationship in this node's relationship chain
Bytes 5-8:  ID of first property in this node's property chain
Bytes 9-13: label store reference
Byte 14:    extra flags

To access node ID 42:
  File offset = 42 × 15 = 630 bytes
  Read 15 bytes
  Done. O(1).
\`\`\`

### Relationship Record Format (34 bytes)

\`\`\`
Byte 0:      in-use flag
Bytes 1-4:   first node ID
Bytes 5-8:   second node ID
Bytes 9-12:  relationship type ID
Bytes 13-16: first node's previous relationship ID
Bytes 17-20: first node's next relationship ID
Bytes 21-24: second node's previous relationship ID
Bytes 25-28: second node's next relationship ID
Bytes 29-32: first property ID
Byte 33:     flags

Each node maintains a DOUBLY LINKED LIST of its relationships.
Traversal = follow linked list pointers. No index lookups.
\`\`\`

### Index-Free Adjacency

This is the core architectural property that makes graph databases fast for traversal:

\`\`\`
Relational database (finding neighbors of node X):
  SELECT * FROM edges WHERE source_id = X OR target_id = X
  → Index lookup on edges table
  → Cost: O(log N) where N = total edges in database
  → As database grows, traversal gets slower

Neo4j (finding neighbors of node X):
  1. Load node X record (15 bytes) → O(1)
  2. Follow first_relationship pointer → O(1)
  3. Traverse doubly-linked relationship list → O(degree of X)
  → Cost: O(degree(X)) — independent of total graph size!

Graph with 1 billion nodes, Alice has 150 friends:
  Neo4j: traverse 150 relationship records → same speed as with 1 million nodes
  SQL:   index lookup on billion-edge table → much slower
\`\`\`

## Cypher Query Language

Neo4j's declarative query language. ASCII-art syntax mirrors the visual representation of graphs.

### Pattern Matching

\`\`\`cypher
-- Find all of Alice's friends
MATCH (alice:Person {name: "Alice"})-[:KNOWS]->(friend:Person)
RETURN friend.name, friend.age

-- Find friends of friends (2 hops)
MATCH (alice:Person {name: "Alice"})-[:KNOWS*2]->(fof:Person)
WHERE fof.name <> "Alice"
RETURN DISTINCT fof.name

-- Variable-length paths (1 to 4 hops)
MATCH (alice:Person {name: "Alice"})-[:KNOWS*1..4]->(person:Person)
RETURN person.name, length(path) AS distance

-- Shortest path
MATCH path = shortestPath(
  (alice:Person {name: "Alice"})-[:KNOWS*]-(bob:Person {name: "Bob"})
)
RETURN [node IN nodes(path) | node.name] AS path_names,
       length(path) AS hops
\`\`\`

### Creating Data

\`\`\`cypher
-- Create nodes
CREATE (alice:Person {name: "Alice", age: 30, email: "alice@example.com"})
CREATE (bob:Person {name: "Bob", age: 25})
CREATE (acme:Company {name: "Acme Corp", founded: 1990})

-- Create relationships
MATCH (a:Person {name: "Alice"}), (b:Person {name: "Bob"})
CREATE (a)-[:KNOWS {since: 2020, strength: 0.8}]->(b)

-- MERGE: create if not exists (like upsert)
MERGE (alice:Person {name: "Alice"})
ON CREATE SET alice.created_at = datetime()
ON MATCH SET alice.last_seen = datetime()
\`\`\`

### Graph Algorithms

\`\`\`cypher
-- Degree centrality: who has the most connections?
MATCH (p:Person)-[:KNOWS]-()
RETURN p.name, count(*) AS connections
ORDER BY connections DESC
LIMIT 10

-- Find all paths between two nodes (up to 5 hops)
MATCH path = (alice:Person {name:"Alice"})-[:KNOWS*..5]-(target:Person {name:"Carol"})
RETURN path
ORDER BY length(path) ASC
LIMIT 5

-- Detect triangles (mutual friends — basis of clustering coefficient)
MATCH (a:Person)-[:KNOWS]->(b:Person)-[:KNOWS]->(c:Person)-[:KNOWS]->(a)
RETURN a.name, b.name, c.name
LIMIT 20
\`\`\`

### Neo4j Graph Data Science Library

\`\`\`cypher
-- Project graph into memory for algorithm execution
CALL gds.graph.project(
  'social-graph',
  'Person',
  'KNOWS'
)

-- PageRank (importance based on incoming links)
CALL gds.pageRank.stream('social-graph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS person, score
ORDER BY score DESC LIMIT 10

-- Community detection (Louvain algorithm)
CALL gds.louvain.stream('social-graph')
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).name, communityId
ORDER BY communityId

-- Node2Vec (graph embeddings for ML)
CALL gds.node2vec.stream('social-graph', {
  embeddingDimension: 128,
  walkLength: 80,
  walksPerNode: 10
})
YIELD nodeId, embedding
\`\`\`

## Neo4j Transactions and ACID

Neo4j is fully ACID compliant. Transactions use a **write-ahead log** (transaction log) and the store files.

\`\`\`
Write transaction:
  1. Acquire write lock on affected nodes/relationships
  2. Record changes in transaction log (WAL)
  3. Apply changes to in-memory state
  4. On commit: flush transaction log to disk (fsync)
  5. Background: apply committed changes to store files

Read transaction:
  No locks needed (MVCC-like snapshot isolation)
  Reads see a consistent view of committed data

Locking:
  Node-level and relationship-level locks
  Lock ordering: always lock by ID ascending to prevent deadlocks
\`\`\`

## Memory Architecture

\`\`\`
Neo4j Memory Configuration:

  Heap (JVM):          query execution, Cypher compiler, transaction state
                       -Xmx: typically 4-8GB
                       Too small → GC pressure, query timeouts

  Page Cache:          caches store files (node records, relationship records, properties)
                       dbms.memory.pagecache.size: typically 50-70% of RAM
                       Should hold the ENTIRE GRAPH in memory for best performance

  Off-heap:            transaction logs, schema information

Total RAM needed ≈ page_cache + heap + OS overhead
For a graph with 10M nodes, 100M relationships:
  Node store:         10M × 15 bytes = 150MB
  Relationship store: 100M × 34 bytes = 3.4GB
  Property store:     varies widely
  Minimum page cache: ~5-10GB for working set
\`\`\`

\`\`\`
Monitoring page cache hit rate:
CALL dbms.queryJmx("org.neo4j:instance=kernel#0,name=Page cache")
YIELD attributes
RETURN attributes["Hits"].value,
       attributes["Misses"].value,
       attributes["Hit Ratio"].value
-- Target: > 99% hit rate
-- Low hit rate = page cache too small = frequent disk reads
\`\`\`

## Graph Data Modeling Patterns

### Intermediate Node Pattern (Reification)

When a relationship needs properties, or when you need to query the relationship itself:

\`\`\`cypher
-- Bad: relationship with many properties (hard to query)
(Alice)-[:WORKED_AT {company:"Acme", from:2018, to:2022, role:"Engineer", salary:95000}]->(Bob)

-- Good: intermediate node
(Alice)-[:EMPLOYMENT]->(job:Employment {from:2018, to:2022, role:"Engineer", salary:95000})
        -[:AT]->(acme:Company {name:"Acme"})

-- Now you can query employments as first-class entities:
MATCH (p:Person)-[:EMPLOYMENT]->(e:Employment)-[:AT]->(c:Company)
WHERE e.salary > 90000
RETURN p.name, c.name, e.role
\`\`\`

### Bi-directional Relationships

\`\`\`cypher
-- Neo4j relationships are directed but can be traversed both ways
-- Don't create both directions — just query without direction:

CREATE (alice)-[:KNOWS]->(bob)  -- one direction only

-- Query both directions:
MATCH (alice:Person {name:"Alice"})-[:KNOWS]-(person:Person)
-- Note: no arrow → traverses in both directions
RETURN person.name
\`\`\`

### Linked List Pattern (Ordering)

\`\`\`cypher
-- Store ordered sequences as linked lists
(first:Item {value:1})-[:NEXT]->(second:Item {value:2})-[:NEXT]->(third:Item {value:3})

-- Find first item
MATCH (first:Item) WHERE NOT ()-[:NEXT]->(first) RETURN first

-- Traverse sequence
MATCH path = (first:Item)-[:NEXT*]->(last:Item)
WHERE NOT ()-[:NEXT]->(first) AND NOT (last)-[:NEXT]->()
RETURN [node IN nodes(path) | node.value] AS sequence
\`\`\`

## When NOT to Use a Graph Database

\`\`\`
Use a graph database when:
  ✓ Relationships are first-class and traversal depth matters
  ✓ Queries involve variable-length path traversal
  ✓ Data is naturally a network (social, fraud, knowledge, dependencies)
  ✓ You need graph algorithms (PageRank, community detection, centrality)

Do NOT use a graph database when:
  ✗ Data is tabular with few relationships
  ✗ You need heavy aggregations (SUM, GROUP BY across millions of nodes)
  ✗ Write throughput is the primary concern (Neo4j writes are not its strength)
  ✗ You need complex reporting across the full graph
  ✗ Your "graph" has less than 100K nodes (a relational DB with good indexes is fine)
\`\`\`
`,

  fr: `# Bases de données graphes

## Pourquoi les bases de données graphes existent

Certaines données sont fondamentalement relationnelles au sens graphe — pas au sens SQL. Les réseaux sociaux, les moteurs de recommandation, la détection de fraude ont tous une chose en commun : **les relations entre entités sont aussi importantes que les entités elles-mêmes**.

\`\`\`sql
-- Approche relationnelle : trouver les amis des amis d'Alice (2 sauts)
-- À 6 sauts, cette requête a 6 JOINs et l'ensemble de résultats intermédiaire
-- explose de façon combinatoire.
-- Une base de données graphe parcourt cela nativement en millisecondes.
\`\`\`

## Le modèle de graphe de propriétés

\`\`\`
Nœud :
  - Identité unique (ID interne)
  - Zéro ou plusieurs labels (ex: :Person, :Company)
  - Propriétés clé-valeur (ex: name: "Alice", age: 30)

Relation :
  - Identité unique
  - Exactement un type (ex: KNOWS, WORKS_AT)
  - Un nœud de départ et un nœud d'arrivée (dirigée)
  - Propriétés clé-valeur (ex: since: 2019)
\`\`\`

## Format de stockage Neo4j

Neo4j utilise un **store d'enregistrements à taille fixe** — pas un B-tree, pas un LSM tree. Chaque type d'enregistrement a une taille fixe, permettant un accès O(1) par ID.

### Adjacence sans index

\`\`\`
Base de données relationnelle (trouver les voisins du nœud X) :
  SELECT * FROM edges WHERE source_id = X OR target_id = X
  → Coût : O(log N) où N = total des arêtes
  → Devient plus lent quand la base de données grandit

Neo4j (trouver les voisins du nœud X) :
  1. Charger l'enregistrement du nœud X → O(1)
  2. Suivre le pointeur first_relationship → O(1)
  3. Parcourir la liste chaînée de relations → O(degré(X))
  → Coût : O(degré(X)) — indépendant de la taille totale du graphe !
\`\`\`

## Langage de requête Cypher

\`\`\`cypher
-- Trouver les amis d'Alice
MATCH (alice:Person {name: "Alice"})-[:KNOWS]->(ami:Person)
RETURN ami.name, ami.age

-- Amis des amis (2 sauts)
MATCH (alice:Person {name: "Alice"})-[:KNOWS*2]->(aaa:Person)
WHERE aaa.name <> "Alice"
RETURN DISTINCT aaa.name

-- Chemin le plus court
MATCH chemin = shortestPath(
  (alice:Person {name: "Alice"})-[:KNOWS*]-(bob:Person {name: "Bob"})
)
RETURN [nœud IN nodes(chemin) | nœud.name] AS noms,
       length(chemin) AS sauts
\`\`\`

## Architecture mémoire

\`\`\`
Configuration mémoire Neo4j :

  Heap (JVM) :       exécution de requêtes, compilateur Cypher
                     Trop petit → pression GC, timeouts de requêtes

  Cache de pages :   met en cache les fichiers de store
                     Devrait contenir LE GRAPHE ENTIER pour les meilleures performances

Pour un graphe avec 10M nœuds, 100M relations :
  Store de nœuds :    10M × 15 octets = 150 Mo
  Store de relations : 100M × 34 octets = 3.4 Go
  Cache de pages minimum : ~5-10 Go
\`\`\`

## Quand NE PAS utiliser une base de données graphe

\`\`\`
Utiliser une base de données graphe quand :
  ✓ Les relations sont de première classe et la profondeur de traversée compte
  ✓ Les requêtes impliquent une traversée de chemin à longueur variable
  ✓ Les données sont naturellement un réseau

Ne PAS utiliser une base de données graphe quand :
  ✗ Les données sont tabulaires avec peu de relations
  ✗ Vous avez besoin d'agrégations lourdes (SUM, GROUP BY sur des millions de nœuds)
  ✗ Le débit en écriture est la préoccupation principale
  ✗ Votre "graphe" a moins de 100K nœuds
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is index-free adjacency and why does it make graph traversal faster than SQL JOINs at depth?",
      options: [
        "Index-free adjacency means graph databases do not use indexes at all, making writes faster",
        "Each node directly stores pointers to its relationships — traversal cost is O(degree of node) regardless of total graph size, while SQL JOINs cost O(log N) on the edge table and degrade as the database grows",
        "Index-free adjacency is a compression technique that removes redundant relationship data",
        "Index-free adjacency allows Neo4j to skip transaction logging for read queries",
      ],
      correct: 1,
    },
    {
      question:
        "Why does Neo4j use fixed-size records for nodes and relationships instead of variable-length storage?",
      options: [
        "Fixed-size records compress better than variable-length records",
        "Fixed-size records allow O(1) access by ID — the file offset is simply id × record_size, requiring no index lookup to find any record",
        "Fixed-size records prevent data corruption during concurrent writes",
        "Fixed-size records allow Neo4j to store the entire graph in a single file",
      ],
      correct: 1,
    },
    {
      question:
        "In Cypher, what does MERGE do and how is it different from CREATE?",
      options: [
        "MERGE combines two nodes into one; CREATE adds a new node",
        "MERGE is faster than CREATE for bulk operations",
        "MERGE finds an existing pattern or creates it if it does not exist — like an upsert. CREATE always creates new nodes/relationships even if identical ones exist, causing duplicates.",
        "MERGE requires a transaction; CREATE does not",
      ],
      correct: 2,
    },
    {
      question:
        "When should you use an intermediate node pattern (reification) in graph modeling?",
      options: [
        "When a relationship has more than 3 properties, or when you need to query the relationship itself as a first-class entity or connect it to other nodes",
        "When the graph has more than 1 million nodes",
        "When you need to store binary data in relationships",
        "When two nodes have more than one type of relationship between them",
      ],
      correct: 0,
    },
    {
      question:
        "Why is a graph database a poor choice for heavy aggregation queries like SUM or GROUP BY across millions of nodes?",
      options: [
        "Graph databases do not support arithmetic operations",
        "Graph databases store data as linked lists which cannot be sorted",
        "Graph databases optimize for local traversal (following edges), not global scans. Aggregations require scanning all nodes of a type — the same pattern that column stores and relational databases handle far more efficiently with sequential I/O and vectorized execution.",
        "Cypher does not support GROUP BY syntax",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question:
        "Qu'est-ce que l'adjacence sans index et pourquoi rend-elle la traversée de graphe plus rapide que les JOINs SQL en profondeur ?",
      options: [
        "L'adjacence sans index signifie que les bases de données graphes n'utilisent pas du tout d'index, rendant les écritures plus rapides",
        "Chaque nœud stocke directement des pointeurs vers ses relations — le coût de traversée est O(degré du nœud) indépendamment de la taille totale du graphe, tandis que les JOINs SQL coûtent O(log N) sur la table des arêtes et se dégradent à mesure que la base de données grandit",
        "L'adjacence sans index est une technique de compression qui supprime les données de relation redondantes",
        "L'adjacence sans index permet à Neo4j de sauter la journalisation des transactions pour les requêtes de lecture",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi Neo4j utilise-t-il des enregistrements à taille fixe pour les nœuds et relations plutôt qu'un stockage à longueur variable ?",
      options: [
        "Les enregistrements à taille fixe se compressent mieux",
        "Les enregistrements à taille fixe permettent un accès O(1) par ID — l'offset de fichier est simplement id × taille_enregistrement, ne nécessitant pas de recherche d'index pour trouver un enregistrement",
        "Les enregistrements à taille fixe empêchent la corruption des données lors d'écritures concurrentes",
        "Les enregistrements à taille fixe permettent à Neo4j de stocker le graphe entier dans un seul fichier",
      ],
      correct: 1,
    },
    {
      question:
        "Dans Cypher, que fait MERGE et en quoi est-il différent de CREATE ?",
      options: [
        "MERGE combine deux nœuds en un ; CREATE ajoute un nouveau nœud",
        "MERGE est plus rapide que CREATE pour les opérations en masse",
        "MERGE trouve un pattern existant ou le crée s'il n'existe pas — comme un upsert. CREATE crée toujours de nouveaux nœuds/relations même si des identiques existent, causant des doublons.",
        "MERGE nécessite une transaction ; CREATE non",
      ],
      correct: 2,
    },
    {
      question:
        "Quand devriez-vous utiliser le pattern de nœud intermédiaire (réification) dans la modélisation de graphe ?",
      options: [
        "Quand une relation a plus de 3 propriétés, ou quand vous devez interroger la relation elle-même comme une entité de première classe ou la connecter à d'autres nœuds",
        "Quand le graphe a plus d'un million de nœuds",
        "Quand vous devez stocker des données binaires dans les relations",
        "Quand deux nœuds ont plus d'un type de relation entre eux",
      ],
      correct: 0,
    },
    {
      question:
        "Pourquoi une base de données graphe est-elle un mauvais choix pour les requêtes d'agrégation lourdes comme SUM ou GROUP BY sur des millions de nœuds ?",
      options: [
        "Les bases de données graphes ne supportent pas les opérations arithmétiques",
        "Les bases de données graphes stockent les données comme des listes chaînées qui ne peuvent pas être triées",
        "Les bases de données graphes optimisent pour la traversée locale (suivre les arêtes), pas pour les scans globaux. Les agrégations nécessitent de scanner tous les nœuds d'un type — le même pattern que les stores en colonnes et les bases de données relationnelles gèrent bien plus efficacement.",
        "Cypher ne supporte pas la syntaxe GROUP BY",
      ],
      correct: 2,
    },
  ],
};
