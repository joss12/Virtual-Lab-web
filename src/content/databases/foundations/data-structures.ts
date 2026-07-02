export const content = {
  en: `# Data Structures — The Foundation of Speed

Every database operation ultimately comes down to a data structure traversal. A query that takes 10ms vs 10 seconds often differs by a single decision: which data structure to use. Understanding these structures deeply means understanding why databases behave the way they do.

## B-Trees vs B+ Trees — The Index Workhorses

### Why Not Binary Search Trees?

\`\`\`
Binary Search Tree problem:

Disk I/O cost dominates:
├── RAM access: ~100ns
├── SSD access: ~100μs (1000x slower)
└── HDD access: ~10ms (100,000x slower)

Binary tree height for 1 million keys: log₂(1,000,000) ≈ 20 levels
Each level = 1 disk read = 20 disk reads total

B-Tree height for 1 million keys: log₁₀₀₀(1,000,000) ≈ 2 levels
Fanout of 1000 = 2 disk reads total

Result: 10x fewer disk I/Os with B-tree
\`\`\`

### B-Tree Structure

\`\`\`
B-Tree properties:
1. Every node has up to M children (M = order)
2. Every node (except root) has at least ⌈M/2⌉ children
3. All leaves at same depth
4. Keys within node are sorted
5. For internal node with k keys: k+1 children

Example B-Tree (order = 4, max 3 keys per node):

                    [50]
                   /    \
              [20,30]   [70,90]
             /   |   \   /  |  \
        [10] [25] [40] [60] [80] [95]

Search for 25:
1. Read root: 25 < 50, go left
2. Read [20,30]: 20 < 25 < 30, go middle child
3. Read [25]: Found! (3 disk reads)

Search for 85:
1. Read root: 85 > 50, go right
2. Read [70,90]: 70 < 85 < 90, go middle child
3. Read [80]: 85 > 80, go right (not found in this leaf)
\`\`\`

### B-Tree Node Layout (Disk Format)

\`\`\`c
// PostgreSQL B-tree page structure (simplified)
typedef struct BTPageOpaqueData {
    BlockNumber btpo_prev;       // Previous page (for leaf traversal)
    BlockNumber btpo_next;       // Next page
    uint32      btpo_level;      // 0 = leaf, 1+ = internal
    uint16      btpo_flags;      // Leaf, root, deleted, etc.
} BTPageOpaqueData;

typedef struct IndexTupleData {
    ItemPointerData t_tid;       // Pointer to heap tuple (TID)
    uint16          t_info;      // Flags, index column count
    // Followed by index key values
} IndexTupleData;

Node structure on disk (8KB page in PostgreSQL):

┌────────────────────────────────────────────────────┐
│ Page Header (24 bytes)                             │
├────────────────────────────────────────────────────┤
│ Item Pointers (line pointers to tuples)            │
│ [0] → offset 8000                                  │
│ [1] → offset 7950                                  │
│ [2] → offset 7900                                  │
│ ...                                                 │
├────────────────────────────────────────────────────┤
│ Free Space                                         │
├────────────────────────────────────────────────────┤
│ Index Tuples (keys + TIDs)                        │
│ (30, TID=100)                                      │
│ (50, TID=200)                                      │
│ (70, TID=300)                                      │
├────────────────────────────────────────────────────┤
│ Special Space (BTPageOpaqueData)                   │
│ prev=5, next=7, level=0                           │
└────────────────────────────────────────────────────┘

Why Item Pointers?
├── Allow defragmentation without moving tuples
├── Enable binary search within page
└── Support VACUUM without rewriting page
\`\`\`

### B-Tree Insertion with Node Split

\`\`\`
Insert 35 into this B-tree (order 4, max 3 keys):

Before:
                    [50]
                   /    \
              [20,30]   [70,90]
             /   |   \
        [10] [25] [40]

Step 1: Search for insertion point
├── 35 < 50, go left
├── 30 < 35 < 50, go right child
└── Leaf [40] found

Step 2: Insert into leaf
[40] becomes [35,40]

Step 3: Check if split needed
├── Node has 2 keys (< 3 max)
└── No split needed

Now insert 37:

Before:
              [20,30]
             /   |   \
        [10] [25] [35,40]

Step 1: Find leaf [35,40]
Step 2: Insert 37 → [35,37,40]
Step 3: Node has 3 keys (at max)
Step 4: Insert 38 triggers split!

Insert 38 into [35,37,40]:

[35,37,40] + 38 = [35,37,38,40] (4 keys, TOO MANY)

Split algorithm:
1. Sort keys: [35,37,38,40]
2. Find median: 37 (position ⌈4/2⌉)
3. Promote median to parent
4. Left node: [35]
5. Right node: [38,40]

After split:
              [20,30,37]        ← 37 promoted
             /   |   |   \
        [10] [25] [35] [38,40]  ← New nodes created

What if parent is full?
Recursive split up the tree!

Example: Parent [20,30,37] already has 3 keys (max)
Insert another key triggering split → parent splits
Continue until root splits → tree grows taller
\`\`\`

### B-Tree Split Implementation

\`\`\`c
// Pseudo-code for B-tree insert with split
void btree_insert(Node* root, Key key, Value value) {
    Node* leaf = find_leaf(root, key);
    
    if (leaf->num_keys < MAX_KEYS) {
        // Simple case: space available
        insert_into_leaf(leaf, key, value);
        return;
    }
    
    // Leaf is full, must split
    split_leaf_and_insert(root, leaf, key, value);
}

void split_leaf_and_insert(Node* root, Node* leaf, Key key, Value value) {
    // Create temporary array with new key
    Key temp_keys[MAX_KEYS + 1];
    Value temp_values[MAX_KEYS + 1];
    
    // Copy existing keys + new key (sorted)
    merge_and_sort(temp_keys, temp_values, leaf, key, value);
    
    // Find split point (median)
    int split_pos = (MAX_KEYS + 1) / 2;
    Key promote_key = temp_keys[split_pos];
    
    // Create new right sibling
    Node* right = allocate_node();
    right->is_leaf = true;
    right->next = leaf->next;
    
    // Distribute keys
    leaf->num_keys = split_pos;
    right->num_keys = MAX_KEYS + 1 - split_pos;
    
    for (int i = 0; i < split_pos; i++) {
        leaf->keys[i] = temp_keys[i];
        leaf->values[i] = temp_values[i];
    }
    
    for (int i = split_pos; i < MAX_KEYS + 1; i++) {
        right->keys[i - split_pos] = temp_keys[i];
        right->values[i - split_pos] = temp_values[i];
    }
    
    // Update leaf chain
    leaf->next = right;
    
    // Insert into parent
    insert_into_parent(root, leaf, promote_key, right);
}

void insert_into_parent(Node* root, Node* left, Key key, Node* right) {
    if (left == root) {
        // Split root: tree grows taller
        Node* new_root = allocate_node();
        new_root->is_leaf = false;
        new_root->keys[0] = key;
        new_root->children[0] = left;
        new_root->children[1] = right;
        new_root->num_keys = 1;
        // Update root pointer
        return;
    }
    
    Node* parent = find_parent(root, left);
    
    if (parent->num_keys < MAX_KEYS) {
        // Space in parent, insert promoted key
        insert_key_into_node(parent, key, right);
    } else {
        // Parent full, must split parent too!
        split_internal_node(root, parent, key, right);
    }
}
\`\`\`

### B+ Tree Differences

\`\`\`
B-Tree:
├── Keys in internal nodes have values
├── Search may stop at internal node
└── Range scans must traverse tree multiple times

B+ Tree:
├── Internal nodes have ONLY keys (no values)
├── ALL values in leaf nodes
├── Leaf nodes linked (doubly linked list)
└── Range scans: single leaf traversal

Example B+ Tree:

Internal nodes:        [50]
                      /    \
                  [30]      [70]
                 /    \    /    \
Leaf nodes:   [10,20] [30,40] [50,60] [70,80,90]
                 ↔        ↔       ↔        ↔
              (linked list for range scans)

Advantages:
1. More keys per internal node (no values stored)
   ├── Higher fanout
   └── Shallower tree
2. Range scans via leaf traversal (no tree traversal)
3. Better cache locality (internal nodes smaller)

PostgreSQL, MySQL InnoDB, SQLite all use B+ trees.
\`\`\`

## LSM Trees — Write-Optimized Storage

\`\`\`
LSM (Log-Structured Merge) Tree architecture:

Memory:
┌─────────────────────────────────┐
│         MemTable (Red-Black)    │
│  ┌─────────────────────────┐   │
│  │ (key1, val1, seq=100)   │   │
│  │ (key2, val2, seq=101)   │   │
│  │ (key3, val3, seq=102)   │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
          ↓ Flush when full

Disk (SSTables - Sorted String Tables):
┌─────────────────────────────────┐
│ Level 0 (newest, 10MB each)     │
│ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │SST 1 │ │SST 2 │ │SST 3 │     │
│ └──────┘ └──────┘ └──────┘     │
├─────────────────────────────────┤
│ Level 1 (100MB each)            │
│ ┌────────────┐ ┌────────────┐  │
│ │  SST 1     │ │  SST 2     │  │
│ └────────────┘ └────────────┘  │
├─────────────────────────────────┤
│ Level 2 (1GB each)              │
│ ┌──────────────────────────┐   │
│ │       SST 1              │   │
│ └──────────────────────────┘   │
└─────────────────────────────────┘

Write path:
1. Insert into MemTable (in-memory, sorted)
2. Append to WAL (crash safety)
3. When MemTable full → flush to SSTable (L0)
4. Background compaction merges SSTables

Read path (expensive!):
1. Check MemTable
2. Check L0 SSTables (newest first)
3. Check L1 SSTables
4. Check L2 SSTables
5. May need to check multiple files!

Optimization: Bloom filters
├── Probabilistic data structure
├── "Definitely not present" or "Maybe present"
├── Avoid reading SSTables that don't contain key
└── 10 bits per key = 1% false positive rate
\`\`\`

### LSM Tree Write Amplification

\`\`\`
Write amplification = Total bytes written / User data written

Example:
User writes 1MB of data
├── Write to WAL: 1MB
├── Flush to L0: 1MB
├── Compact L0→L1: 1MB + 10MB (read L1, merge, write) = 11MB
├── Compact L1→L2: 11MB + 100MB = 111MB
└── Total: 124MB written for 1MB user data
    Write amplification = 124x

RocksDB strategies to reduce:
1. Leveled compaction (default)
   ├── Each level 10x larger than previous
   ├── Compact when level full
   └── Write amp ~10-20x

2. Universal compaction
   ├── Merge adjacent similar-size files
   ├── Lower write amp (3-5x)
   └── Higher space amplification

3. FIFO compaction
   ├── Just drop oldest files
   ├── Write amp = 1x
   └── Only for time-series (old data expires)
\`\`\`

### LSM Tree Compaction Algorithm

\`\`\`c
// Simplified RocksDB leveled compaction
void compact_level(int level) {
    if (level_size(level) < level_max_size(level)) {
        return;  // Level not full
    }
    
    // Pick files to compact (overlapping key ranges)
    vector<SSTable*> l_files = pick_files_from_level(level);
    vector<SSTable*> l_plus_1_files = pick_overlapping_files(level + 1, l_files);
    
    // Merge sort all files
    MergeIterator iter(l_files, l_plus_1_files);
    SSTableBuilder builder(level + 1);
    
    Key prev_key;
    while (iter.Valid()) {
        Key key = iter.key();
        Value value = iter.value();
        SequenceNumber seq = iter.sequence();
        
        // Skip deleted entries (tombstones)
        if (value.is_deleted() && seq < oldest_snapshot) {
            iter.Next();
            continue;
        }
        
        // Skip duplicate keys (keep newest)
        if (key == prev_key) {
            iter.Next();
            continue;
        }
        
        builder.Add(key, value, seq);
        prev_key = key;
        iter.Next();
        
        // Split into multiple SSTables if size limit reached
        if (builder.FileSize() > target_file_size) {
            builder.Finish();
            builder = SSTableBuilder(level + 1);
        }
    }
    
    builder.Finish();
    
    // Atomically replace old files with new files
    VersionEdit edit;
    for (auto* f : l_files) edit.DeleteFile(level, f);
    for (auto* f : l_plus_1_files) edit.DeleteFile(level + 1, f);
    for (auto* f : builder.GetFiles()) edit.AddFile(level + 1, f);
    
    versions->LogAndApply(edit);
}
\`\`\`

### Bloom Filter — Probabilistic Set Membership

\`\`\`
Bloom filter for set {key1, key2, key3}:

Bit array (m = 16 bits):
┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐
│0│0│0│0│0│0│0│0│0│0│0│0│0│0│0│0│
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘

Hash functions (k = 3):
h1, h2, h3

Insert key1:
h1(key1) = 2  → Set bit 2
h2(key1) = 7  → Set bit 7
h3(key1) = 11 → Set bit 11

┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐
│0│0│1│0│0│0│0│1│0│0│0│1│0│0│0│0│
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
    ↑       ↑       ↑

Insert key2:
h1(key2) = 3
h2(key2) = 7 (already set)
h3(key2) = 15

┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐
│0│0│1│1│0│0│0│1│0│0│0│1│0│0│0│1│
└─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
    ↑ ↑     ↑       ↑         ↑

Query key3 (present):
h1(key3) = 2 → bit is 1 ✓
h2(key3) = 7 → bit is 1 ✓
h3(key3) = 11 → bit is 1 ✓
Result: MAYBE present (need to check actual data)

Query key4 (not present):
h1(key4) = 5 → bit is 0 ✗
Result: DEFINITELY NOT present (skip SSTable read!)

False positive probability:
p = (1 - e^(-kn/m))^k
Where:
├── k = number of hash functions
├── n = number of elements
├── m = bit array size
└── Example: k=3, n=1000, m=10000 → p ≈ 1%

10 bits per key → 1% false positive rate
20 bits per key → 0.01% false positive rate
\`\`\`

### Bloom Filter Implementation

\`\`\`c
// Simple Bloom filter
typedef struct BloomFilter {
    uint8_t* bits;     // Bit array
    size_t m;          // Number of bits
    int k;             // Number of hash functions
} BloomFilter;

BloomFilter* bloom_create(size_t n, double fpr) {
    BloomFilter* bf = malloc(sizeof(BloomFilter));
    
    // Calculate optimal m and k
    bf->m = (size_t)(-n * log(fpr) / (log(2) * log(2)));
    bf->k = (int)(bf->m / n * log(2));
    
    bf->bits = calloc((bf->m + 7) / 8, 1);  // Round up to bytes
    return bf;
}

void bloom_add(BloomFilter* bf, const void* key, size_t len) {
    for (int i = 0; i < bf->k; i++) {
        uint64_t hash = hash_function(key, len, i);
        size_t pos = hash % bf->m;
        bf->bits[pos / 8] |= (1 << (pos % 8));  // Set bit
    }
}

bool bloom_maybe_contains(BloomFilter* bf, const void* key, size_t len) {
    for (int i = 0; i < bf->k; i++) {
        uint64_t hash = hash_function(key, len, i);
        size_t pos = hash % bf->m;
        if ((bf->bits[pos / 8] & (1 << (pos % 8))) == 0) {
            return false;  // Definitely not present
        }
    }
    return true;  // Maybe present (could be false positive)
}

// RocksDB uses this in SSTable metadata:
// Read SSTable → Check Bloom filter → Maybe read data block
// Saves disk I/O when key not present
\`\`\`

## Hash Indexes — O(1) Lookup

\`\`\`
Hash index structure:

Hash table:
┌─────┬─────────────────────┐
│  0  │ → (key3, TID=300)   │
├─────┼─────────────────────┤
│  1  │ → (key7, TID=700)   │
├─────┼─────────────────────┤
│  2  │ → (key1, TID=100) → (key9, TID=900) │ (collision chain)
├─────┼─────────────────────┤
│  3  │ NULL                │
├─────┼─────────────────────┤
│ ... │                     │
└─────┴─────────────────────┘

Collision handling:
1. Chaining (linked list)
2. Open addressing (linear probing, quadratic, double hashing)
3. Cuckoo hashing (multiple tables)

Hash function requirements:
├── Deterministic (same input → same output)
├── Uniform distribution (minimize collisions)
└── Fast computation (critical for performance)

PostgreSQL hash index (pre-10):
├── Fixed-size hash table
├── Bucket overflow chains
├── Not crash-safe (no WAL logging)
└── Removed in favor of B-trees

Modern hash indexes:
├── Extendible hashing (dynamic growth)
├── Linear hashing (incremental resize)
└── Used in in-memory databases (Redis, memcached)
\`\`\`

### Extendible Hashing — Dynamic Growth

\`\`\`
Extendible hash structure:

Directory (global depth = 2):
┌─────┬──────┐
│ 00  │  ─┐  │
├─────┤   │  │
│ 01  │  ─┼──┼─→ Bucket A (local depth = 1)
├─────┤   │  │   [key1, key5]
│ 10  │  ─┘  │
├─────┤      │
│ 11  │  ────┼─→ Bucket B (local depth = 2)
└─────┴──────┘   [key2, key6, key10]

Insert key13 (hash = 1101₂ = 13):
├── Look at last 2 bits (global depth): 01
├── Directory[01] → Bucket A
├── Bucket A full? Check local depth
└── If local depth < global depth: split bucket
    If local depth = global depth: double directory

Split algorithm:
1. Create new bucket with local depth + 1
2. Redistribute keys based on one more bit
3. Update directory pointers

After split:
Directory (global depth = 2):
┌─────┬──────┐
│ 00  │  ────┼─→ Bucket A1 (local depth = 2)
├─────┤      │   [key1]
│ 01  │  ────┼─→ Bucket A2 (local depth = 2)
├─────┤      │   [key5, key13]
│ 10  │  ────┼─→ Bucket A1 (share)
├─────┤      │
│ 11  │  ────┼─→ Bucket B
└─────┴──────┘

Advantages:
├── Dynamic growth without full rehash
├── Only split overflowing bucket
└── Directory doubling rare

Disadvantages:
├── Directory overhead
└── Pointer indirection
\`\`\`

## Skip Lists — Probabilistic B-Trees

\`\`\`
Skip list (alternative to balanced trees):

Level 3: [1] ─────────────────→ [20] ───→ NULL
              ↓                   ↓
Level 2: [1] ────→ [10] ─────→ [20] ───→ NULL
              ↓      ↓           ↓
Level 1: [1] ──→ [5] ──→ [10] ──→ [15] ──→ [20] ───→ NULL
              ↓    ↓     ↓      ↓      ↓
Level 0: [1] [3] [5] [7] [10] [12] [15] [18] [20] → NULL

Search for 12:
1. Start at top level (3), key 1
2. Next is 20 > 12, go down to level 2
3. Next is 10 < 12, move forward to 10
4. Next is 20 > 12, go down to level 1
5. Next is 15 > 12, go down to level 0
6. Next is 12, found!

Insert algorithm:
1. Search to find position
2. Insert at level 0
3. Flip coin: if heads, add to level 1
4. Flip coin: if heads, add to level 2
5. Continue until tails

Expected height: log₂(n)
Expected search: O(log n)

Advantages:
├── Simpler than B-trees (no rebalancing)
├── Lock-free implementation possible
└── Used in Redis sorted sets, LevelDB (MemTable)

Disadvantages:
├── Probabilistic guarantees (not worst-case)
└── Higher constants than B-trees
\`\`\`

### Skip List Implementation

\`\`\`c
#define MAX_LEVEL 32

typedef struct SkipNode {
    int key;
    void* value;
    struct SkipNode* forward[MAX_LEVEL];  // Array of forward pointers
} SkipNode;

typedef struct SkipList {
    int level;  // Current max level
    SkipNode* header;
} SkipList;

int random_level() {
    int level = 1;
    while (rand() % 2 == 0 && level < MAX_LEVEL) {
        level++;
    }
    return level;
}

void skip_list_insert(SkipList* list, int key, void* value) {
    SkipNode* update[MAX_LEVEL];
    SkipNode* current = list->header;
    
    // Find insertion point
    for (int i = list->level - 1; i >= 0; i--) {
        while (current->forward[i] != NULL && 
               current->forward[i]->key < key) {
            current = current->forward[i];
        }
        update[i] = current;  // Remember path for insertion
    }
    
    // Create new node
    int new_level = random_level();
    if (new_level > list->level) {
        for (int i = list->level; i < new_level; i++) {
            update[i] = list->header;
        }
        list->level = new_level;
    }
    
    SkipNode* node = malloc(sizeof(SkipNode));
    node->key = key;
    node->value = value;
    
    // Insert into all levels
    for (int i = 0; i < new_level; i++) {
        node->forward[i] = update[i]->forward[i];
        update[i]->forward[i] = node;
    }
}

void* skip_list_search(SkipList* list, int key) {
    SkipNode* current = list->header;
    
    for (int i = list->level - 1; i >= 0; i--) {
        while (current->forward[i] != NULL && 
               current->forward[i]->key < key) {
            current = current->forward[i];
        }
    }
    
    current = current->forward[0];
    if (current != NULL && current->key == key) {
        return current->value;
    }
    return NULL;
}
\`\`\`

## Performance Comparison

\`\`\`
Read Performance (1 million keys):

B+ Tree:
├── Height: log₁₀₀₀(1M) ≈ 2-3 levels
├── Disk I/Os: 2-3
├── Range scan: Efficient (leaf traversal)
└── Use case: OLTP, range queries

LSM Tree:
├── Levels: ~4-5 (L0, L1, L2, L3, L4)
├── Disk I/Os: 4-5 (+ Bloom filter checks)
├── Range scan: Merge multiple SSTables
└── Use case: Write-heavy workloads

Hash Index:
├── Disk I/Os: 1 (plus collision chain)
├── Range scan: IMPOSSIBLE
├── Point lookup: Fastest
└── Use case: Key-value stores

Write Performance:

B+ Tree:
├── Random I/O (find leaf, split, write)
├── Write amplification: ~2x (page split)
└── Use case: Balanced read/write

LSM Tree:
├── Sequential I/O (append to MemTable, flush)
├── Write amplification: 10-20x (compaction)
└── Use case: Write-heavy, can tolerate read latency

Hash Index:
├── Random I/O (hash → bucket)
├── Write amplification: ~1x
└── Use case: In-memory caches
\`\`\`

Data structures are the soul of databases. Choose B+ trees for balanced workloads, LSM trees for write-heavy systems, and hash indexes when you need only point lookups. Understanding the tradeoffs means making the right choice.`,

  fr: `# Structures de données — La fondation de la vitesse

Chaque opération de base de données se résume finalement à un parcours de structure de données. Une requête qui prend 10ms vs 10 secondes diffère souvent par une seule décision : quelle structure de données utiliser.

## Arbres B vs B+ — Les chevaux de bataille des index

### Pourquoi pas les arbres binaires de recherche ?

\`\`\`
Problème des arbres binaires :

Coût I/O disque domine :
├── Accès RAM : ~100ns
├── Accès SSD : ~100μs (1000x plus lent)
└── Accès HDD : ~10ms (100 000x plus lent)

Hauteur arbre binaire pour 1 million de clés : log₂(1 000 000) ≈ 20 niveaux
Chaque niveau = 1 lecture disque = 20 lectures disque total

Hauteur arbre B pour 1 million de clés : log₁₀₀₀(1 000 000) ≈ 2 niveaux
Fanout de 1000 = 2 lectures disque total
\`\`\`

## Arbres LSM — Stockage optimisé pour l'écriture

\`\`\`
Architecture LSM :

Mémoire : MemTable
Disque : SSTables par niveaux
Compaction en arrière-plan
\`\`\`

## Index de hachage — Recherche O(1)

\`\`\`
Table de hachage avec gestion des collisions
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "Why do B-trees use high fanout (100-1000 children per node) instead of binary?",
      options: [
        "They use less memory",
        "Disk I/O cost dominates — high fanout reduces tree height, reducing disk reads from ~20 to ~2-3",
        "They're faster to implement",
        "They support more keys",
      ],
      correct: 1,
    },
    {
      question: "What triggers a B-tree node split during insertion?",
      options: [
        "The tree becomes unbalanced",
        "A node reaches its maximum key capacity (e.g., 3 keys in order-4 tree) — median promoted to parent",
        "Too many disk reads",
        "Memory limit exceeded",
      ],
      correct: 1,
    },
    {
      question: "How do LSM trees achieve fast writes?",
      options: [
        "By using SSDs instead of HDDs",
        "Writes go to in-memory MemTable, then sequentially flush to disk SSTables — no random I/O",
        "By compressing data",
        "By using more memory",
      ],
      correct: 1,
    },
    {
      question:
        "What does a Bloom filter's 'definitely not present' result mean?",
      options: [
        "The key might be in the SSTable",
        "The key is GUARANTEED not in the SSTable — can skip expensive disk read (no false negatives)",
        "The key is probably there",
        "Need to check all SSTables",
      ],
      correct: 1,
    },
    {
      question: "What is the main disadvantage of hash indexes?",
      options: [
        "Slow point lookups",
        "Cannot support range queries — hash destroys key ordering, only supports equality checks",
        "Use too much memory",
        "Difficult to implement",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi les arbres B utilisent-ils un haut fanout (100-1000 enfants par nœud) au lieu de binaire ?",
      options: [
        "Ils utilisent moins de mémoire",
        "Le coût I/O disque domine — haut fanout réduit la hauteur de l'arbre, réduisant les lectures disque de ~20 à ~2-3",
        "Ils sont plus rapides à implémenter",
        "Ils supportent plus de clés",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce qui déclenche une division de nœud d'arbre B lors de l'insertion ?",
      options: [
        "L'arbre devient déséquilibré",
        "Un nœud atteint sa capacité maximale de clés — médiane promue au parent",
        "Trop de lectures disque",
        "Limite mémoire dépassée",
      ],
      correct: 1,
    },
    {
      question: "Comment les arbres LSM obtiennent-ils des écritures rapides ?",
      options: [
        "En utilisant des SSD au lieu de HDD",
        "Les écritures vont dans la MemTable en mémoire, puis flush séquentiel vers SSTables disque — pas d'I/O aléatoire",
        "En compressant les données",
        "En utilisant plus de mémoire",
      ],
      correct: 1,
    },
    {
      question:
        "Que signifie le résultat 'définitivement pas présent' d'un filtre de Bloom ?",
      options: [
        "La clé pourrait être dans la SSTable",
        "La clé est GARANTIE de ne pas être dans la SSTable — peut éviter la lecture disque coûteuse",
        "La clé est probablement là",
        "Besoin de vérifier toutes les SSTables",
      ],
      correct: 1,
    },
    {
      question: "Quel est le principal désavantage des index de hachage ?",
      options: [
        "Recherches ponctuelles lentes",
        "Ne peuvent pas supporter les requêtes de plage — le hachage détruit l'ordre des clés",
        "Utilisent trop de mémoire",
        "Difficiles à implémenter",
      ],
      correct: 1,
    },
  ],
};
