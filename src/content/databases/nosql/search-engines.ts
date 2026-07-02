export const content = {
  en: `# Search Engines

## Why Dedicated Search Engines Exist

Full-text search is fundamentally different from database lookups:

\`\`\`
Database query:  SELECT * FROM products WHERE name = 'laptop'
  → Exact match, B-tree lookup, O(log N)

Search query:    "laptop for programming under 1000"
  → Relevance ranking, partial matches, synonyms, typo tolerance
  → "laptop" matches "laptops", "gaming laptop", "laptop computer"
  → Results sorted by how RELEVANT they are, not just whether they match
\`\`\`

Implementing this in a relational database:
\`\`\`sql
-- PostgreSQL full-text search (works, but limited)
SELECT name, ts_rank(to_tsvector('english', description), query) AS rank
FROM products,
     to_tsquery('english', 'laptop & programming') query
WHERE to_tsvector('english', description) @@ query
ORDER BY rank DESC;

-- Problems:
-- No fuzzy matching ("labtop" doesn't match "laptop")
-- No semantic understanding
-- No distributed scaling
-- No real-time highlighting
-- Limited language support
-- Poor performance at scale
\`\`\`

## The Inverted Index — The Core Data Structure

Every search engine is built on an **inverted index** — a mapping from terms to the documents containing them.

\`\`\`
Documents:
  Doc 1: "the quick brown fox jumps"
  Doc 2: "the lazy brown dog sleeps"
  Doc 3: "a quick dog runs fast"

Inverted Index:
  Term      → Postings List (doc_id, position, frequency)
  "quick"   → [(1, pos=2, tf=1), (3, pos=2, tf=1)]
  "brown"   → [(1, pos=3, tf=1), (2, pos=3, tf=1)]
  "dog"     → [(2, pos=4, tf=1), (3, pos=2, tf=1)]
  "the"     → [(1, pos=1, tf=1), (2, pos=1, tf=1)]
  "fox"     → [(1, pos=4, tf=1)]
  "lazy"    → [(2, pos=2, tf=1)]

Query "quick dog":
  Postings for "quick": [1, 3]
  Postings for "dog":   [2, 3]
  Intersection:         [3]   ← Doc 3 contains both terms
  Result: Doc 3 ranked first (contains both), then Doc 1, Doc 2 (one term each)
\`\`\`

### Postings List Compression

For large indexes, postings lists can contain millions of doc IDs. Compression is critical:

\`\`\`
Raw doc IDs (sorted): [1, 5, 8, 10, 14, 20, 21, 22, 100, ...]
Delta encoding:       [1, 4, 3, 2,  4,  6,  1,  1,  78, ...]
  (store differences between consecutive doc IDs)

Delta values are small → compress well with variable-length encoding:
  Values 0-127:    1 byte
  Values 128-16383: 2 bytes

For 1 billion documents, delta-encoded + variable-length = ~2-3 bytes per posting
vs 4 bytes raw int32 = 30-50% size reduction

Advanced: FOR (Frame Of Reference), PForDelta, Roaring Bitmaps
\`\`\`

## Text Analysis Pipeline

Before indexing, text goes through an **analysis pipeline**:

\`\`\`
Input: "The Quick Brown FOX jumped over the LAZY dogs!"
         ↓
  Character filter:  remove HTML, normalize unicode
  "The Quick Brown FOX jumped over the LAZY dogs!"
         ↓
  Tokenizer: split into tokens
  ["The", "Quick", "Brown", "FOX", "jumped", "over", "the", "LAZY", "dogs"]
         ↓
  Token filters (applied in order):
    Lowercase:    ["the", "quick", "brown", "fox", "jumped", "over", "the", "lazy", "dogs"]
    Stop words:   remove "the", "over" →
                  ["quick", "brown", "fox", "jumped", "lazy", "dogs"]
    Stemmer:      "jumped" → "jump", "dogs" → "dog" →
                  ["quick", "brown", "fox", "jump", "lazy", "dog"]
         ↓
  Indexed terms: quick, brown, fox, jump, lazy, dog
\`\`\`

\`\`\`
Query "jumping dogs" goes through same pipeline:
  → ["jump", "dog"]
  → matches documents containing "jumped" or "jumping" (stemmed to "jump")
  → matches documents containing "dog" or "dogs"
\`\`\`

## Relevance Scoring — BM25

The industry standard relevance algorithm. BM25 (Best Match 25) replaced TF-IDF as the default in Elasticsearch 5.0+ and most modern search engines.

\`\`\`
TF-IDF (predecessor):
  TF  = term frequency in document (how often does term appear?)
  IDF = inverse document frequency (how rare is the term across all documents?)
  Score = TF × IDF

  Problem: TF grows unboundedly — a document mentioning "laptop" 1000 times
           gets 1000x the score of a document mentioning it once.

BM25 formula:
  Score(q,d) = Σ IDF(t) × (TF(t,d) × (k1 + 1)) / (TF(t,d) + k1 × (1 - b + b × |d|/avgdl))

  Where:
    k1 = term frequency saturation (default 1.2)
         controls how much TF matters — TF saturates as it increases
    b  = length normalization (default 0.75)
         penalizes long documents (they naturally contain more terms)
    |d| = document length (number of terms)
    avgdl = average document length across corpus

  Key improvements over TF-IDF:
    - TF saturation: after k1+1 occurrences, additional occurrences add diminishing returns
    - Length normalization: long documents aren't unfairly boosted
\`\`\`

\`\`\`
BM25 in practice:
  Document A: "laptop" appears 1 time,  length=100 words
  Document B: "laptop" appears 50 times, length=5000 words

  TF-IDF would rank B much higher (50x TF)
  BM25: TF saturates at k1+1 ≈ 2.2, length penalty on B
  → A likely ranks similar or higher than B
  → More intuitive: A is probably more focused on laptops
\`\`\`

## Elasticsearch Architecture

Elasticsearch is a distributed search engine built on Apache Lucene. Lucene handles the index format and search algorithms; Elasticsearch adds distribution, REST API, and cluster management.

### Cluster Architecture

\`\`\`
Elasticsearch Cluster:
  ┌─────────────────────────────────────────────────────┐
  │                     Cluster                          │
  │                                                      │
  │  Master Node: cluster state, index management        │
  │                                                      │
  │  Data Node 1      Data Node 2      Data Node 3       │
  │  [Shard 0 Primary][Shard 1 Primary][Shard 2 Primary] │
  │  [Shard 2 Replica][Shard 0 Replica][Shard 1 Replica] │
  │                                                      │
  │  Coordinating Node: receives requests, fans out      │
  └─────────────────────────────────────────────────────┘
\`\`\`

### Shards and Segments

\`\`\`
Index → Shards (horizontal partitions)
  Each shard is a self-contained Lucene index
  Number of primary shards fixed at creation time (cannot change without reindex)

Shard → Segments (immutable Lucene index files)
  Documents first written to in-memory buffer
  Buffer flushed to new segment (every 1 second by default — "near real-time")
  Segments are immutable — never modified after creation
  Background merging combines small segments into larger ones (like compaction)

  doc_1 written → in-memory buffer
  doc_2 written → in-memory buffer
  (1 second passes) → flush: buffer → new segment_1 (searchable)
  doc_3 written → new buffer
  (1 second passes) → flush: buffer → new segment_2
  Background merge: segment_1 + segment_2 → merged_segment (older segments deleted)
\`\`\`

### Why Segments Are Immutable

\`\`\`
Update/Delete implementation:
  Documents are NEVER modified in place.
  
  DELETE doc_1:
    → Write doc_1's ID to .del file (deletion bitmap)
    → doc_1 still in segment, but marked deleted
    → During merge: deleted docs are excluded from merged segment
  
  UPDATE doc_1:
    → Mark old doc_1 as deleted (add to .del file)
    → Write new version as a new document (new doc ID internally)
    → Old version invisible until merge removes it

  Benefits of immutability:
    - No locking needed for reads (segment never changes)
    - Simple to cache (cached data never invalidated)
    - Easy to replicate (just copy files)
    - OS page cache works perfectly (sequential reads of immutable files)
\`\`\`

### Refresh, Flush, and Merge

\`\`\`
Refresh (default: every 1 second):
  Flush in-memory buffer to new segment
  Makes new documents searchable
  Expensive: creates new small segment (triggers future merge work)
  Tune for bulk indexing: PUT /index/_settings {"refresh_interval": "-1"}

Flush (default: every 30 minutes or when translog exceeds 512MB):
  Write Lucene commits to disk (fsync)
  Clears the translog (transaction log for crash recovery)
  Ensures durability

Merge (background, automatic):
  Combines multiple small segments into fewer large segments
  Removes deleted documents
  CPU and I/O intensive — can impact indexing and search performance
  Force merge (use carefully): POST /index/_forcemerge?max_num_segments=1
\`\`\`

## Elasticsearch Query DSL

\`\`\`json
// Full-text search with relevance scoring
POST /products/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "description": {
              "query": "laptop programming",
              "operator": "and"
            }
          }
        }
      ],
      "filter": [
        { "range": { "price": { "gte": 500, "lte": 1500 } } },
        { "term": { "in_stock": true } }
      ],
      "should": [
        { "match": { "brand": "ThinkPad" } }
      ]
    }
  },
  "sort": [
    { "_score": "desc" },
    { "price": "asc" }
  ],
  "highlight": {
    "fields": { "description": {} }
  },
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          { "to": 500 },
          { "from": 500, "to": 1000 },
          { "from": 1000 }
        ]
      }
    },
    "brands": {
      "terms": { "field": "brand.keyword", "size": 10 }
    }
  }
}
\`\`\`

\`\`\`
must:    clause MUST match (AND, affects score)
filter:  clause MUST match (AND, does NOT affect score, cached)
should:  clause SHOULD match (boosts score if it does)
must_not: clause MUST NOT match (NOT, does not affect score)

filter vs must:
  filter: binary yes/no, result is cached → fast for repeated queries
  must:   participates in relevance scoring → not cached
  
  Always use filter for non-text conditions (price range, status, date)
  Use must/should only for full-text fields that need relevance scoring
\`\`\`

### Distributed Search Execution

\`\`\`
Query phase (scatter):
  Coordinating node receives search request
  Fans out to all shards (primary or replica)
  Each shard runs query locally → returns top N doc IDs + scores
  
Fetch phase (gather):
  Coordinating node merges all results → global top N
  Fetches full documents for top N from their shards
  Returns final results to client

Deep pagination problem:
  GET /index/_search?from=10000&size=10
  Each shard returns 10,010 results → coordinating node merges 10,010 × N_shards
  For 5 shards: 50,050 results loaded into memory to return 10
  
  Solution: search_after (keyset pagination)
  GET /index/_search
  { "size": 10, "search_after": [last_sort_value], "sort": [{"_id": "asc"}] }
\`\`\`

## Fuzzy Search and Typo Tolerance

\`\`\`json
{
  "query": {
    "match": {
      "name": {
        "query": "labtop",
        "fuzziness": "AUTO",
        "prefix_length": 2
      }
    }
  }
}
\`\`\`

\`\`\`
Fuzziness uses Levenshtein edit distance:
  "labtop" → "laptop": 1 edit (transpose a↔t) → within distance 1 → matches

AUTO fuzziness:
  length 1-2: exact match only
  length 3-5: fuzziness 1 (1 edit allowed)
  length 6+:  fuzziness 2 (2 edits allowed)

prefix_length: first N characters must match exactly
  Prevents "apple" from matching "orange" (too many edits at start)
  Critical for performance: limits Levenshtein computation

Implementation: Levenshtein automaton (DFA)
  Pre-computes all strings within edit distance N of the query term
  Intersection with index terms is O(terms) not O(terms × query_length)
\`\`\`

## Elasticsearch Gotchas

### Mapping Explosion

\`\`\`json
// BAD: dynamic mapping on JSON with arbitrary keys
// A document like: { "attributes": { "color": "red", "RAM_GB": 16, ... } }
// With thousands of different attribute names → thousands of mappings
// Each mapping stored in cluster state (memory on master node)
// Cluster state grows → master node OOM → cluster down

// FIX: disable dynamic mapping for problematic fields
PUT /products/_mapping
{
  "dynamic": "strict",
  "properties": {
    "attributes": { "type": "object", "dynamic": false }
  }
}
\`\`\`

### Split-Brain (pre-7.0)

\`\`\`
Old setting: discovery.zen.minimum_master_nodes
  In a 3-node cluster, set to 2 (quorum)
  If not set: network partition → two master nodes elected → split brain

Elasticsearch 7.0+ fixed this with automatic bootstrap quorum:
  cluster.initial_master_nodes: ["node1", "node2", "node3"]
  No manual quorum calculation needed
\`\`\`

### The Kibana Query Performance Anti-Pattern

\`\`\`json
// BAD: large aggregation on high-cardinality field with wildcard
{
  "aggs": {
    "all_users": {
      "terms": {
        "field": "user_id.keyword",
        "size": 1000000
      }
    }
  }
}
// Loads 1M terms into memory on coordinating node
// Multiplied by number of shards
// OOM crash

// GOOD: use cardinality aggregation for counting
{
  "aggs": {
    "unique_users": {
      "cardinality": { "field": "user_id.keyword" }
    }
  }
}
// Uses HyperLogLog++ — approximate count, 2-5% error, tiny memory
\`\`\`
`,

  fr: `# Moteurs de recherche

## Pourquoi les moteurs de recherche dédiés existent

La recherche plein texte est fondamentalement différente des lookups de base de données :

\`\`\`
Requête de base de données : SELECT * FROM products WHERE name = 'laptop'
  → Correspondance exacte, lookup B-tree, O(log N)

Requête de recherche : "laptop pour la programmation moins de 1000"
  → Classement par pertinence, correspondances partielles, synonymes, tolérance aux fautes
  → Résultats triés par PERTINENCE, pas juste s'ils correspondent
\`\`\`

## L'index inversé — La structure de données centrale

\`\`\`
Documents :
  Doc 1 : "le rapide renard brun saute"
  Doc 2 : "le chien paresseux brun dort"

Index inversé :
  Terme     → Liste de postings (doc_id, position, fréquence)
  "rapide"  → [(1, pos=2, tf=1), (3, pos=2, tf=1)]
  "brun"    → [(1, pos=3, tf=1), (2, pos=3, tf=1)]
  "chien"   → [(2, pos=4, tf=1), (3, pos=2, tf=1)]
\`\`\`

## Pipeline d'analyse de texte

\`\`\`
Entrée : "The Quick Brown FOX jumped!"
         ↓
  Filtre de caractères : supprimer HTML, normaliser unicode
         ↓
  Tokeniseur : diviser en tokens
  ["The", "Quick", "Brown", "FOX", "jumped"]
         ↓
  Filtres de tokens :
    Minuscules :  ["the", "quick", "brown", "fox", "jumped"]
    Mots vides :  supprimer "the" → ["quick", "brown", "fox", "jumped"]
    Racinisateur : "jumped" → "jump" → ["quick", "brown", "fox", "jump"]
         ↓
  Termes indexés : quick, brown, fox, jump
\`\`\`

## Scoring de pertinence — BM25

\`\`\`
Formule BM25 :
  Score(q,d) = Σ IDF(t) × (TF(t,d) × (k1 + 1)) / (TF(t,d) + k1 × (1 - b + b × |d|/avgdl))

  k1 = saturation de fréquence de terme (défaut 1.2)
  b  = normalisation de longueur (défaut 0.75)

Améliorations clés par rapport à TF-IDF :
  - Saturation TF : après k1+1 occurrences, les occurrences supplémentaires apportent des rendements décroissants
  - Normalisation de longueur : les longs documents ne sont pas injustement boostés
\`\`\`

## Architecture Elasticsearch

### Shards et segments

\`\`\`
Index → Shards (partitions horizontales)
  Chaque shard est un index Lucene autonome
  Nombre de shards primaires fixé à la création (ne peut pas changer sans réindexation)

Shard → Segments (fichiers d'index Lucene immuables)
  Documents écrits d'abord dans le buffer mémoire
  Buffer vidé vers un nouveau segment toutes les 1 seconde (near real-time)
  Segments immuables — jamais modifiés après création
  Fusion en arrière-plan combine les petits segments en plus grands
\`\`\`

### Pourquoi les segments sont immuables

\`\`\`
SUPPRESSION doc_1 :
  → Écrire l'ID de doc_1 dans le fichier .del (bitmap de suppression)
  → doc_1 toujours dans le segment, mais marqué supprimé
  → Lors de la fusion : les docs supprimés sont exclus

MISE À JOUR doc_1 :
  → Marquer l'ancien doc_1 comme supprimé
  → Écrire la nouvelle version comme un nouveau document

Avantages de l'immuabilité :
  - Pas de verrou nécessaire pour les lectures
  - Simple à mettre en cache
  - Facile à répliquer
\`\`\`

## DSL de requête Elasticsearch

\`\`\`json
{
  "query": {
    "bool": {
      "must":   [{ "match": { "description": "laptop" } }],
      "filter": [{ "range": { "price": { "gte": 500, "lte": 1500 } } }],
      "should": [{ "match": { "brand": "ThinkPad" } }]
    }
  }
}
\`\`\`

\`\`\`
must :    DOIT correspondre (ET, affecte le score)
filter :  DOIT correspondre (ET, n'affecte PAS le score, mis en cache)
should :  DEVRAIT correspondre (booste le score si oui)
must_not : NE DOIT PAS correspondre

Toujours utiliser filter pour les conditions non-texte (plage de prix, statut, date)
Utiliser must/should uniquement pour les champs texte nécessitant un scoring
\`\`\`

## Recherche floue et tolérance aux fautes

\`\`\`json
{
  "query": {
    "match": {
      "name": {
        "query": "labtop",
        "fuzziness": "AUTO",
        "prefix_length": 2
      }
    }
  }
}
\`\`\`

\`\`\`
La fuzziness utilise la distance d'édition de Levenshtein :
  "labtop" → "laptop" : 1 édition → dans la distance 1 → correspond

AUTO fuzziness :
  longueur 1-2 : correspondance exacte uniquement
  longueur 3-5 : fuzziness 1 (1 édition autorisée)
  longueur 6+ :  fuzziness 2 (2 éditions autorisées)
\`\`\`

## Pièges Elasticsearch

### Explosion de mapping

\`\`\`json
// MAUVAIS : mapping dynamique sur JSON avec clés arbitraires
// Des milliers de noms d'attributs différents → milliers de mappings
// L'état du cluster grandit → OOM sur le nœud master → cluster en panne

// CORRECTIF : désactiver le mapping dynamique
PUT /products/_mapping
{
  "dynamic": "strict",
  "properties": {
    "attributes": { "type": "object", "dynamic": false }
  }
}
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is an inverted index and why is it the core data structure for search engines?",
      options: [
        "An inverted index stores documents in reverse chronological order for faster retrieval",
        "An inverted index maps terms to the list of documents containing them — enabling O(1) lookup of all documents containing a term, then set intersection for multi-term queries, which is fundamentally faster than scanning every document",
        "An inverted index is a B-tree stored in reverse sorted order",
        "An inverted index compresses documents by storing only unique terms",
      ],
      correct: 1,
    },
    {
      question: "What are the two key improvements BM25 makes over TF-IDF?",
      options: [
        "BM25 supports fuzzy matching and multi-language text; TF-IDF does not",
        "BM25 adds term frequency saturation (diminishing returns after repeated occurrences) and length normalization (penalizing long documents that naturally contain more terms)",
        "BM25 uses neural embeddings while TF-IDF uses keyword matching",
        "BM25 indexes faster than TF-IDF by skipping stop words",
      ],
      correct: 1,
    },
    {
      question:
        "Why are Elasticsearch segments immutable, and how are deletes and updates handled?",
      options: [
        "Segments are immutable for performance — deletes write the doc ID to a .del bitmap and updates delete the old version and insert a new one. Deleted docs are physically removed only during segment merges.",
        "Segments are immutable to prevent data corruption — all modifications go through the master node",
        "Segments are immutable because Lucene does not support in-place modifications of float values",
        "Segments are immutable for replication — all changes are sent as full segment copies to replicas",
      ],
      correct: 0,
    },
    {
      question:
        "What is the difference between 'filter' and 'must' in an Elasticsearch bool query?",
      options: [
        "filter applies to text fields; must applies to numeric fields",
        "filter clauses are cached and do not affect relevance scoring — use for exact conditions like price range or status. must clauses participate in BM25 scoring and are not cached — use for full-text fields.",
        "filter is applied after results are returned; must is applied during indexing",
        "filter supports fuzzy matching; must requires exact matches",
      ],
      correct: 1,
    },
    {
      question:
        "What causes mapping explosion in Elasticsearch and how do you prevent it?",
      options: [
        "Mapping explosion occurs when too many shards are created — prevented by limiting shard count",
        "Mapping explosion occurs when dynamic mapping creates a new field mapping for each unique key in JSON documents — with arbitrary keys (like per-user attributes), this creates thousands of mappings in cluster state, consuming master node memory. Prevent by setting dynamic: false or strict on problematic fields.",
        "Mapping explosion occurs when document size exceeds 100MB — prevented by splitting large documents",
        "Mapping explosion occurs when too many indexes are created — prevented by using index aliases",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Qu'est-ce qu'un index inversé et pourquoi est-il la structure de données centrale des moteurs de recherche ?",
      options: [
        "Un index inversé stocke les documents dans l'ordre chronologique inverse pour une récupération plus rapide",
        "Un index inversé mappe les termes vers la liste des documents les contenant — permettant un lookup O(1) de tous les documents contenant un terme, puis une intersection d'ensembles pour les requêtes multi-termes, ce qui est fondamentalement plus rapide que de scanner chaque document",
        "Un index inversé est un B-tree stocké dans l'ordre trié inversé",
        "Un index inversé compresse les documents en ne stockant que les termes uniques",
      ],
      correct: 1,
    },
    {
      question:
        "Quelles sont les deux améliorations clés de BM25 par rapport à TF-IDF ?",
      options: [
        "BM25 supporte la correspondance floue et le texte multilingue ; TF-IDF non",
        "BM25 ajoute la saturation de fréquence de terme (rendements décroissants après des occurrences répétées) et la normalisation de longueur (pénalisant les longs documents qui contiennent naturellement plus de termes)",
        "BM25 utilise des embeddings neuronaux tandis que TF-IDF utilise la correspondance par mots-clés",
        "BM25 indexe plus vite que TF-IDF en sautant les mots vides",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi les segments Elasticsearch sont-ils immuables, et comment les suppressions et mises à jour sont-elles gérées ?",
      options: [
        "Les segments sont immuables pour la performance — les suppressions écrivent l'ID du doc dans un bitmap .del et les mises à jour suppriment l'ancienne version et insèrent une nouvelle. Les docs supprimés sont physiquement supprimés uniquement lors des fusions de segments.",
        "Les segments sont immuables pour prévenir la corruption des données — toutes les modifications passent par le nœud master",
        "Les segments sont immuables car Lucene ne supporte pas les modifications en place des valeurs flottantes",
        "Les segments sont immuables pour la réplication — tous les changements sont envoyés comme copies complètes de segments aux réplicas",
      ],
      correct: 0,
    },
    {
      question:
        "Quelle est la différence entre 'filter' et 'must' dans une requête bool Elasticsearch ?",
      options: [
        "filter s'applique aux champs texte ; must aux champs numériques",
        "Les clauses filter sont mises en cache et n'affectent pas le scoring de pertinence — à utiliser pour les conditions exactes comme la plage de prix ou le statut. Les clauses must participent au scoring BM25 et ne sont pas mises en cache — à utiliser pour les champs plein texte.",
        "filter est appliqué après le retour des résultats ; must est appliqué pendant l'indexation",
        "filter supporte la correspondance floue ; must nécessite des correspondances exactes",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce qui cause l'explosion de mapping dans Elasticsearch et comment la prévenir ?",
      options: [
        "L'explosion de mapping se produit quand trop de shards sont créés — prévenue en limitant le nombre de shards",
        "L'explosion de mapping se produit quand le mapping dynamique crée un nouveau mapping de champ pour chaque clé unique dans les documents JSON — avec des clés arbitraires, cela crée des milliers de mappings dans l'état du cluster, consommant la mémoire du nœud master. Prévenir en définissant dynamic: false ou strict sur les champs problématiques.",
        "L'explosion de mapping se produit quand la taille des documents dépasse 100 Mo — prévenue en divisant les grands documents",
        "L'explosion de mapping se produit quand trop d'index sont créés — prévenue en utilisant des alias d'index",
      ],
      correct: 1,
    },
  ],
};
