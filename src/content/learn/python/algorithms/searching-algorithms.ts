export const id = "searching-algorithms";
export const titleEn = "Searching Algorithms";
export const titleFr = "Algorithmes de recherche";

export const content = {
  en: `# Searching Algorithms

## The Problem: Finding a Needle in a Haystack

Searching is the most common operation in programming. Every time you look up a user by ID, find a product by name, or check if a value exists — you're searching.

The key question is: **how is your data organized?**

\`\`\`
Is your data UNSORTED?    → Linear search (O(N)) — only option
Is your data SORTED?      → Binary search (O(log N)) — 1000x faster
Is your data in a DICT?   → Hash lookup  (O(1))  — instant
Is your data in a TREE?   → Tree search  (O(log N)) — very fast

The right search algorithm depends entirely on your data structure.
Choosing the wrong one is like searching a phone book from page 1
instead of flipping to the right letter.
\`\`\`

## Linear Search — The Simple but Slow Default

### How it works

Check every element one by one until you find what you're looking for or exhaust the entire list. No assumptions about the data.

\`\`\`python
def linear_search(items, target):
    """
    Search for target in items.
    Returns the index if found, -1 if not found.
    Works on ANY list — sorted or unsorted.
    """
    for i, item in enumerate(items):
        if item == target:
            return i    # found it at index i
    return -1           # went through everything, not found

# Works on unsorted data
numbers = [64, 25, 12, 22, 11, 90, 3, 47]
print(linear_search(numbers, 22))   # 3 (found at index 3)
print(linear_search(numbers, 99))   # -1 (not found)

# Works on strings too
fruits = ["banana", "apple", "cherry", "mango"]
print(linear_search(fruits, "cherry"))   # 2
print(linear_search(fruits, "grape"))    # -1
\`\`\`

### Step by step visualization

\`\`\`
Target = 22  in  [64, 25, 12, 22, 11, 90, 3, 47]

Step 1: Check index 0 → 64 == 22? No
Step 2: Check index 1 → 25 == 22? No
Step 3: Check index 2 → 12 == 22? No
Step 4: Check index 3 → 22 == 22? YES! Return 3.

Target = 99 (not in list):
Step 1: Check 64? No
Step 2: Check 25? No
Step 3: Check 12? No
Step 4: Check 22? No
Step 5: Check 11? No
Step 6: Check 90? No
Step 7: Check  3? No
Step 8: Check 47? No
Exhausted the list → return -1
\`\`\`

### Finding ALL matches (not just the first)

\`\`\`python
def linear_search_all(items, target):
    """Return indices of ALL occurrences of target."""
    indices = []
    for i, item in enumerate(items):
        if item == target:
            indices.append(i)
    return indices   # empty list if not found

scores = [85, 92, 85, 78, 85, 99, 78]
print(linear_search_all(scores, 85))   # [0, 2, 4]
print(linear_search_all(scores, 78))   # [3, 6]
print(linear_search_all(scores, 100))  # []
\`\`\`

### Searching with a condition (more realistic)

\`\`\`python
# Real-world linear search: find by property, not exact match
users = [
    {"id": 1, "name": "Alice", "age": 30},
    {"id": 2, "name": "Bob",   "age": 25},
    {"id": 3, "name": "Carol", "age": 35},
]

def find_user_by_name(users, name):
    for user in users:
        if user["name"] == name:
            return user
    return None

def find_users_by_age(users, min_age, max_age):
    return [u for u in users if min_age <= u["age"] <= max_age]

print(find_user_by_name(users, "Bob"))           # {'id': 2, 'name': 'Bob', 'age': 25}
print(find_users_by_age(users, 25, 32))          # Alice and Bob
\`\`\`

### Complexity

\`\`\`
Time:  O(N) worst and average case (target not found or at end)
       O(1) best case (target is first element)
Space: O(1) — just a loop variable

When to use:
  ✓ Unsorted data (only option)
  ✓ Small lists (N < 100, speed difference negligible)
  ✓ Searching by a complex condition (not just equality)
  ✓ Searching objects by attribute
  ✗ Large sorted lists — use binary search instead
\`\`\`

## Binary Search — Divide and Conquer at Its Best

### The Key Insight

If a list is sorted, you can eliminate HALF of the remaining candidates with every single comparison. This is the fundamental insight of binary search.

Think of a number guessing game: "I'm thinking of a number between 1 and 100."

\`\`\`
Bad strategy (linear): guess 1, 2, 3, 4, ... up to 100
  → Up to 100 guesses

Smart strategy (binary): always guess the middle
  Guess 50. "Too high." → now search 1-49
  Guess 25. "Too low."  → now search 26-49
  Guess 37. "Too high." → now search 26-36
  Guess 31. "Too low."  → now search 32-36
  Guess 34. "Correct!"  → found in 5 guesses!

With 100 items: binary search needs at most log₂(100) ≈ 7 guesses.
With 1,000,000 items: binary search needs at most log₂(1,000,000) ≈ 20 guesses.
Linear search: needs up to 1,000,000 guesses. The difference is staggering.
\`\`\`

### Implementation

\`\`\`python
def binary_search(items, target):
    """
    Search for target in a SORTED list.
    Returns the index if found, -1 if not found.
    
    IMPORTANT: items MUST be sorted. Binary search gives
    wrong answers on unsorted data — no error, just wrong results.
    """
    left  = 0
    right = len(items) - 1

    while left <= right:
        # Find the middle index
        # Note: (left + right) // 2 can overflow in some languages
        # but not in Python (Python integers have unlimited size)
        mid = (left + right) // 2

        if items[mid] == target:
            return mid              # found it!

        elif items[mid] < target:
            # Target is in the RIGHT half — discard left half
            left = mid + 1

        else:  # items[mid] > target
            # Target is in the LEFT half — discard right half
            right = mid - 1

    return -1   # left > right: search space is empty, not found

# Must use sorted data!
numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
print(binary_search(numbers, 7))    # 3 (found at index 3)
print(binary_search(numbers, 13))   # 6 (found at index 6)
print(binary_search(numbers, 4))    # -1 (not found — 4 is not in list)
\`\`\`

### Step by step visualization

\`\`\`
List: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
Index: 0  1  2  3  4   5   6   7   8   9
Target = 13

Step 1: left=0, right=9, mid=4
        items[4]=9. Is 13 == 9? No.
        Is 13 > 9? Yes → search RIGHT half
        left = mid+1 = 5
        Eliminated: [1, 3, 5, 7, 9] ← gone

Step 2: left=5, right=9, mid=7
        items[7]=15. Is 13 == 15? No.
        Is 13 < 15? Yes → search LEFT half
        right = mid-1 = 6
        Eliminated: [15, 17, 19] ← gone

Step 3: left=5, right=6, mid=5
        items[5]=11. Is 13 == 11? No.
        Is 13 > 11? Yes → search RIGHT half
        left = mid+1 = 6

Step 4: left=6, right=6, mid=6
        items[6]=13. Is 13 == 13? YES! Return 6. ✓

Found 13 in 4 steps. Linear search would need 7 steps.
With 1,000 items, binary needs ~10 steps vs linear's ~1,000.
\`\`\`

### Recursive version

\`\`\`python
def binary_search_recursive(items, target, left=0, right=None):
    """Recursive implementation — same logic, different style."""
    if right is None:
        right = len(items) - 1

    # Base case: search space is empty
    if left > right:
        return -1

    mid = (left + right) // 2

    if items[mid] == target:
        return mid
    elif items[mid] < target:
        return binary_search_recursive(items, target, mid + 1, right)
    else:
        return binary_search_recursive(items, target, left, mid - 1)

numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
print(binary_search_recursive(numbers, 13))   # 6
print(binary_search_recursive(numbers, 4))    # -1
\`\`\`

### Searching for the insertion point

\`\`\`python
def binary_search_insert_pos(items, target):
    """
    Find where target SHOULD be inserted to keep the list sorted.
    Returns the index even if target is not in the list.
    This is what Python's bisect module does.
    """
    left  = 0
    right = len(items)

    while left < right:
        mid = (left + right) // 2
        if items[mid] < target:
            left = mid + 1
        else:
            right = mid

    return left   # insertion point

numbers = [1, 3, 5, 7, 9, 11]
print(binary_search_insert_pos(numbers, 6))    # 3 (between 5 and 7)
print(binary_search_insert_pos(numbers, 0))    # 0 (before everything)
print(binary_search_insert_pos(numbers, 100))  # 6 (after everything)

# Python's bisect module does this for you:
import bisect
print(bisect.bisect_left(numbers, 6))   # 3
\`\`\`

### Python's bisect module — Binary search built-in

\`\`\`python
import bisect

# bisect gives you binary search without implementing it yourself
numbers = [1, 3, 5, 7, 9, 11, 13]

# Find insertion point (left = insert before duplicates)
print(bisect.bisect_left(numbers,  7))   # 3 — insert at index 3
print(bisect.bisect_right(numbers, 7))   # 4 — insert after index 3

# Insert while keeping sorted order
bisect.insort(numbers, 6)
print(numbers)   # [1, 3, 5, 6, 7, 9, 11, 13]

# Check if value exists using bisect
def exists_binary(sorted_items, target):
    idx = bisect.bisect_left(sorted_items, target)
    return idx < len(sorted_items) and sorted_items[idx] == target

print(exists_binary(numbers, 7))    # True
print(exists_binary(numbers, 4))    # False
\`\`\`

### Complexity

\`\`\`
Time:  O(log N) — each step halves the search space
       O(1) best case (target is exactly in the middle)
Space: O(1) iterative version
       O(log N) recursive version (call stack)

REQUIREMENT: List must be sorted.
  Sorting costs O(N log N). So:
  - Search once:   sort O(N log N) + search O(log N) = O(N log N)
  - Search N times: sort O(N log N) + N × O(log N) = much better than N × O(N)

Rule: if you search the same data many times, sort once and binary search.
      If you search only once, linear search may be fine.
\`\`\`

## Hash-Based Search — O(1) Lookups

### How it works

A hash table (Python dict and set) maps keys to values using a **hash function** — a mathematical function that converts any key into an array index. This makes lookups essentially instant regardless of size.

\`\`\`python
# Dictionary — key/value hash table
phone_book = {
    "Alice": "+33 6 12 34 56 78",
    "Bob":   "+1 555 234 5678",
    "Carol": "+44 20 1234 5678",
}

# O(1) lookup — doesn't matter if phone book has 10 or 10,000,000 entries
phone = phone_book.get("Alice", "not found")
print(phone)   # +33 6 12 34 56 78

# Set — hash table without values, just keys
# Perfect for "does this exist?" questions
valid_users = {"alice", "bob", "carol", "david"}

# O(1) membership test
print("alice" in valid_users)   # True
print("eve"   in valid_users)   # False
\`\`\`

### How hashing works internally

\`\`\`python
# Python's hash() function converts any immutable value to an integer
print(hash("Alice"))   # some large integer, e.g. 1234567890
print(hash("Bob"))     # different integer

# The dictionary uses this integer to find the right "bucket"
# Bucket index = hash(key) % number_of_buckets

# This is why:
# - Lookup is O(1) — compute hash → go directly to bucket
# - Only immutable types can be keys (mutable types can't be hashed reliably)

# Hashable (can be dict key or set member):
d = {}
d["string"] = 1       # ✓ strings are hashable
d[42]        = 2      # ✓ integers are hashable
d[(1, 2)]    = 3      # ✓ tuples are hashable (if contents are hashable)

# Not hashable:
# d[[1, 2]] = 4       # ✗ TypeError: unhashable type: 'list'
# d[{1, 2}] = 4       # ✗ TypeError: unhashable type: 'set'
\`\`\`

### Building a search index

\`\`\`python
# Problem: find all users with a given city — efficiently
users = [
    {"id": 1, "name": "Alice", "city": "Paris"},
    {"id": 2, "name": "Bob",   "city": "London"},
    {"id": 3, "name": "Carol", "city": "Paris"},
    {"id": 4, "name": "David", "city": "Tokyo"},
    {"id": 5, "name": "Eve",   "city": "London"},
]

# Naive approach: linear search every time — O(N) per query
def find_by_city_slow(users, city):
    return [u for u in users if u["city"] == city]   # O(N)

# Smart approach: build an index once — O(1) per query
def build_city_index(users):
    index = {}   # city → list of users
    for user in users:
        city = user["city"]
        if city not in index:
            index[city] = []
        index[city].append(user)
    return index

city_index = build_city_index(users)   # O(N) to build

# Now each lookup is O(1):
print(city_index.get("Paris",  []))    # Alice, Carol
print(city_index.get("London", []))    # Bob, Eve
print(city_index.get("Berlin", []))    # []

# This pattern — build index once, query many times — is exactly
# what database indexes do under the hood.
\`\`\`

## Comparing All Three Search Strategies

\`\`\`python
import time
import random
import bisect

# Build test data
N = 100_000
data   = random.sample(range(1_000_000), N)   # random unique numbers
target = data[N // 2]                         # a value we know exists

sorted_data = sorted(data)
data_dict   = {x: True for x in data}
data_set    = set(data)

# --- Linear search ---
def linear(items, t):
    for item in items:
        if item == t: return True
    return False

# --- Binary search ---
def binary(sorted_items, t):
    idx = bisect.bisect_left(sorted_items, t)
    return idx < len(sorted_items) and sorted_items[idx] == t

# --- Hash lookup ---
def hash_lookup(s, t):
    return t in s

# Time each approach
trials = 1000

start = time.time()
for _ in range(trials):
    linear(data, target)
t_linear = (time.time() - start) * 1000

start = time.time()
for _ in range(trials):
    binary(sorted_data, target)
t_binary = (time.time() - start) * 1000

start = time.time()
for _ in range(trials):
    hash_lookup(data_set, target)
t_hash = (time.time() - start) * 1000

print(f"Linear search: {t_linear:.1f}ms ({trials} trials)")
print(f"Binary search: {t_binary:.2f}ms ({trials} trials)")
print(f"Hash lookup:   {t_hash:.2f}ms ({trials} trials)")
print(f"Binary is ~{t_linear/max(t_binary,0.01):.0f}x faster than linear")
print(f"Hash is   ~{t_linear/max(t_hash,0.01):.0f}x faster than linear")
\`\`\`

## Depth First Search (DFS) — Searching Trees and Graphs

Linear and binary search work on lists. But real data is often structured as **trees** (file systems, org charts, HTML) or **graphs** (social networks, maps). DFS is how you search these structures.

### How DFS works

Go as deep as possible down one path before backtracking and trying another. Like exploring a maze by always taking the first unexplored turn.

\`\`\`python
# Example: search a tree represented as nested dictionaries
file_system = {
    "name": "root",
    "children": [
        {
            "name": "documents",
            "children": [
                {"name": "resume.pdf",    "children": []},
                {"name": "cover.pdf",     "children": []},
            ]
        },
        {
            "name": "photos",
            "children": [
                {"name": "vacation.jpg",  "children": []},
                {"name": "birthday.jpg",  "children": []},
            ]
        },
        {"name": "notes.txt", "children": []},
    ]
}

def dfs_find(node, target):
    """
    Search the tree for a node with the given name.
    Returns the node if found, None if not found.
    DFS: go deep first, backtrack when stuck.
    """
    # Check current node
    if node["name"] == target:
        return node

    # Recursively search all children
    for child in node["children"]:
        result = dfs_find(child, target)
        if result is not None:
            return result   # found in subtree

    return None   # not found in this subtree

print(dfs_find(file_system, "resume.pdf"))    # {'name': 'resume.pdf', ...}
print(dfs_find(file_system, "missing.txt"))   # None

def dfs_all_files(node, file_list=None):
    """Find ALL file names (nodes with no children)."""
    if file_list is None:
        file_list = []

    if not node["children"]:   # it's a file (leaf node)
        file_list.append(node["name"])
    else:
        for child in node["children"]:
            dfs_all_files(child, file_list)

    return file_list

print(dfs_all_files(file_system))
# ['resume.pdf', 'cover.pdf', 'vacation.jpg', 'birthday.jpg', 'notes.txt']
\`\`\`

### DFS order visualization

\`\`\`
file_system tree:
        root
      /   |   \\
   docs photos notes.txt
   /  \\    / \\
res  cov vac bday

DFS visits in this order:
  root → documents → resume.pdf (leaf, backtrack)
       → cover.pdf (leaf, backtrack)
       → (documents done, backtrack to root)
  root → photos → vacation.jpg (leaf, backtrack)
       → birthday.jpg (leaf, backtrack)
       → (photos done, backtrack to root)
  root → notes.txt (leaf, done)

Key: goes DEEP first. Finishes one entire branch before starting the next.
\`\`\`

## Breadth First Search (BFS) — Level by Level

BFS searches level by level instead of going deep. Like ripples in water — explores all neighbors before going further out.

\`\`\`python
from collections import deque

def bfs_find(start_node, target):
    """
    Search level by level using a queue.
    Returns the node if found, None if not found.
    BFS finds the SHORTEST PATH (fewest hops) to the target.
    """
    queue = deque([start_node])   # start with the root
    visited = set()

    while queue:
        node = queue.popleft()   # take from the FRONT of the queue

        if node["name"] in visited:
            continue
        visited.add(node["name"])

        if node["name"] == target:
            return node

        # Add all children to the BACK of the queue
        for child in node["children"]:
            queue.append(child)

    return None

# BFS order for the file system above:
# Level 0: root
# Level 1: documents, photos, notes.txt
# Level 2: resume.pdf, cover.pdf, vacation.jpg, birthday.jpg

# BFS vs DFS:
# DFS: goes DEEP — good for "does X exist anywhere?"
# BFS: goes WIDE — good for "what is the CLOSEST X?"
\`\`\`

## Choosing the Right Search Algorithm

\`\`\`
DATA STRUCTURE → BEST SEARCH ALGORITHM

Unsorted list:
  → Linear search O(N)
  → No choice — must check every element

Sorted list, search once:
  → Linear or binary depending on size
  → If N > 100: binary search O(log N)

Sorted list, search many times:
  → Sort once O(N log N), then binary search O(log N) each time
  → Use bisect module (built-in, fast)

Dictionary (key → value lookups):
  → Hash lookup O(1) — the default choice for keyed data

Set ("does this exist?"):
  → Hash lookup O(1) — convert list to set first if searching repeatedly

Tree structure (file system, org chart):
  → DFS if you just need to find something
  → BFS if you need the shortest path / closest match

Graph (social network, map, dependencies):
  → DFS for connectivity, cycle detection
  → BFS for shortest path (unweighted)

Real rule of thumb:
  1. If data is in a dict/set: use 'in' — O(1)
  2. If data is sorted: use bisect — O(log N)
  3. If data is unsorted and you search it many times: convert to set/dict first
  4. Only use linear search when data is unsorted and you search it once
\`\`\`

## Real-World Example: Auto-Complete Search

\`\`\`python
class AutoComplete:
    """
    A simple auto-complete system using binary search.
    Suggests words that start with the given prefix.
    """

    def __init__(self, words):
        self.words = sorted(words)   # must be sorted for binary search

    def search_prefix(self, prefix):
        """Find all words starting with prefix — O(log N + k) where k = results."""
        import bisect

        # Find the first word that could start with prefix
        start = bisect.bisect_left(self.words, prefix)

        # Find the first word that definitely does NOT start with prefix
        # Trick: prefix + 'z'*100 is after all words with this prefix
        end = bisect.bisect_left(self.words, prefix + 'z' * 100)

        return self.words[start:end]

    def exact_match(self, word):
        """Check if word exists exactly — O(log N)."""
        import bisect
        idx = bisect.bisect_left(self.words, word)
        return idx < len(self.words) and self.words[idx] == word


words = [
    "apple", "application", "apply", "apt",
    "banana", "band", "bandana", "bank",
    "cherry", "chip", "chocolate",
    "python", "pytorch", "pypy",
]

ac = AutoComplete(words)

print(ac.search_prefix("app"))    # ['apple', 'application', 'apply']
print(ac.search_prefix("ban"))    # ['banana', 'band', 'bandana', 'bank']
print(ac.search_prefix("py"))     # ['pypy', 'python', 'pytorch']
print(ac.exact_match("python"))   # True
print(ac.exact_match("pythn"))    # False
\`\`\`
`,

  fr: `# Algorithmes de recherche

## Le problème : trouver une aiguille dans une botte de foin

La recherche est l'opération la plus courante en programmation. La question clé est : **comment vos données sont-elles organisées ?**

\`\`\`
Données NON TRIÉES ?     → Recherche linéaire O(N) — seule option
Données TRIÉES ?         → Recherche binaire O(log N) — 1000x plus rapide
Données dans un DICT ?   → Hachage O(1) — instantané
\`\`\`

## Recherche linéaire — La valeur par défaut simple

\`\`\`python
def recherche_lineaire(elements, cible):
    for i, element in enumerate(elements):
        if element == cible:
            return i    # trouvé à l'index i
    return -1           # pas trouvé

nombres = [64, 25, 12, 22, 11, 90]
print(recherche_lineaire(nombres, 22))   # 3
print(recherche_lineaire(nombres, 99))   # -1
\`\`\`

## Recherche binaire — Diviser pour mieux régner

### L'intuition clé

Si une liste est triée, vous pouvez éliminer la MOITIÉ des candidats restants à chaque comparaison.

\`\`\`
Jeu de devinette : "Je pense à un nombre entre 1 et 100."

Mauvaise stratégie : deviner 1, 2, 3... → jusqu'à 100 essais
Bonne stratégie : toujours deviner le milieu
  Deviner 50. "Trop haut." → chercher 1-49
  Deviner 25. "Trop bas."  → chercher 26-49
  Deviner 37. "Trop haut." → chercher 26-36
  Trouvé en seulement 7 essais maximum !
\`\`\`

\`\`\`python
def recherche_binaire(elements, cible):
    gauche = 0
    droite = len(elements) - 1

    while gauche <= droite:
        milieu = (gauche + droite) // 2

        if elements[milieu] == cible:
            return milieu
        elif elements[milieu] < cible:
            gauche = milieu + 1   # chercher dans la moitié DROITE
        else:
            droite = milieu - 1   # chercher dans la moitié GAUCHE

    return -1   # pas trouvé

# DOIT utiliser des données triées !
nombres = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
print(recherche_binaire(nombres, 13))   # 6 en 4 étapes
print(recherche_binaire(nombres, 4))    # -1 (pas dans la liste)

# Module bisect intégré de Python
import bisect
idx = bisect.bisect_left(nombres, 13)
print(idx)   # 6
\`\`\`

## Recherche par hachage — O(1) instantané

\`\`\`python
# Dictionnaire — table de hachage clé/valeur
annuaire = {
    "Alice": "+33 6 12 34 56 78",
    "Bob":   "+1 555 234 5678",
}
telephone = annuaire.get("Alice", "non trouvé")   # O(1)

# Set — pour les questions "est-ce que ça existe ?"
utilisateurs_valides = {"alice", "bob", "carol"}
print("alice" in utilisateurs_valides)   # True  — O(1)
print("eve"   in utilisateurs_valides)   # False — O(1)
\`\`\`

## Choisir le bon algorithme

\`\`\`
Liste non triée       → Recherche linéaire O(N)
Liste triée           → Recherche binaire O(log N) avec bisect
Dict ou Set           → Hachage O(1)
Structure arborescente → DFS ou BFS

Règle pratique :
  1. Dans un dict/set : utilisez 'in' — O(1)
  2. Données triées : utilisez bisect — O(log N)
  3. Non trié, cherchez souvent : convertissez en set d'abord
  4. Recherche linéaire seulement si non trié et cherchez une fois
\`\`\`
`,
};

export const starterCode = {
  default: `# Searching Algorithms — Practice
import bisect
import time
import random

# --- Part 1: Linear search with condition ---
users = [
    {"id": 1, "name": "Alice",   "score": 92, "city": "Paris"},
    {"id": 2, "name": "Bob",     "score": 78, "city": "London"},
    {"id": 3, "name": "Carol",   "score": 85, "city": "Paris"},
    {"id": 4, "name": "David",   "score": 91, "city": "Tokyo"},
    {"id": 5, "name": "Eve",     "score": 67, "city": "London"},
]

def find_by_city(users, city):
    return [u for u in users if u["city"] == city]

def find_top_scorers(users, min_score):
    return [u for u in users if u["score"] >= min_score]

print("=== Linear Search ===")
print(f"Paris users: {[u['name'] for u in find_by_city(users, 'Paris')]}")
print(f"Score >= 85: {[u['name'] for u in find_top_scorers(users, 85)]}")

# --- Part 2: Binary search on sorted numbers ---
def binary_search(items, target):
    left, right = 0, len(items) - 1
    steps = 0
    while left <= right:
        steps += 1
        mid = (left + right) // 2
        if items[mid] == target:
            return mid, steps
        elif items[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1, steps

print("\\n=== Binary Search ===")
sorted_nums = list(range(0, 1000, 2))   # even numbers 0-998
idx, steps = binary_search(sorted_nums, 764)
print(f"Found 764 at index {idx} in {steps} steps")
print(f"List has {len(sorted_nums)} items — linear would need up to {len(sorted_nums)} steps")

# --- Part 3: Hash lookup speed comparison ---
N = 50_000
data      = random.sample(range(1_000_000), N)
data_set  = set(data)
target    = data[N // 2]

start = time.time()
for _ in range(10_000):
    target in data
t1 = (time.time() - start) * 1000

start = time.time()
for _ in range(10_000):
    target in data_set
t2 = (time.time() - start) * 1000

print(f"\\n=== Hash vs Linear ===")
print(f"List lookup (O(N)): {t1:.1f}ms")
print(f"Set lookup  (O(1)): {t2:.2f}ms")
print(f"Set is ~{t1/max(t2,0.01):.0f}x faster")
`,
};

export const exerciseEn = `Search challenges — implement and optimize.

1. Write 'search_range(sorted_items, low, high)' using binary search
   that returns all values between low and high (inclusive).
   Hint: use bisect_left for low and bisect_right for high.

2. Write 'find_first_occurrence(sorted_items, target)' that finds
   the index of the FIRST occurrence in a list with duplicates.
   Example: [1, 2, 2, 2, 3] → find_first_occurrence(items, 2) → 1

3. Build an auto-complete function 'autocomplete(words, prefix)'
   that returns all words starting with prefix using binary search.

4. Write 'two_sum_search(sorted_nums, target)' using binary search:
   for each number x, binary-search for (target - x).
   This gives O(N log N) vs O(N²) for the naive approach.`;

export const exerciseFr = `Défis de recherche — implémenter et optimiser.

1. Écrivez 'chercher_intervalle(elements_tries, bas, haut)' avec
   la recherche binaire, retournant toutes les valeurs entre bas et haut.

2. Écrivez 'trouver_premiere(elements_tries, cible)' qui trouve l'index
   de la PREMIÈRE occurrence dans une liste avec des doublons.

3. Construisez 'auto_completer(mots, prefixe)' retournant tous les mots
   commençant par prefixe en utilisant la recherche binaire.

4. Écrivez 'deux_somme_recherche(nombres_tries, cible)' en O(N log N)
   en utilisant la recherche binaire pour chaque élément.`;

export const solutionCode = {
  default: `import bisect

# 1. Search in range
def search_range(sorted_items, low, high):
    left  = bisect.bisect_left(sorted_items, low)
    right = bisect.bisect_right(sorted_items, high)
    return sorted_items[left:right]

numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
print(f"Range 5-13: {search_range(numbers, 5, 13)}")
# [5, 7, 9, 11, 13]

# 2. First occurrence
def find_first_occurrence(sorted_items, target):
    idx = bisect.bisect_left(sorted_items, target)
    if idx < len(sorted_items) and sorted_items[idx] == target:
        return idx
    return -1

dupes = [1, 2, 2, 2, 3, 3, 4]
print(f"First 2: index {find_first_occurrence(dupes, 2)}")   # 1
print(f"First 3: index {find_first_occurrence(dupes, 3)}")   # 4
print(f"First 9: index {find_first_occurrence(dupes, 9)}")   # -1

# 3. Autocomplete
def autocomplete(words, prefix):
    sorted_words = sorted(words)
    start = bisect.bisect_left(sorted_words, prefix)
    end   = bisect.bisect_left(sorted_words, prefix[:-1] + chr(ord(prefix[-1]) + 1))
    return sorted_words[start:end]

vocab = ["apple", "application", "apply", "apt", "banana", "band", "python", "pytorch"]
print(f"'app': {autocomplete(vocab, 'app')}")
print(f"'py':  {autocomplete(vocab, 'py')}")

# 4. Two sum with binary search — O(N log N)
def two_sum_search(sorted_nums, target):
    for i, x in enumerate(sorted_nums):
        complement = target - x
        idx = bisect.bisect_left(sorted_nums, complement)
        if idx < len(sorted_nums) and sorted_nums[idx] == complement and idx != i:
            return (x, complement)
    return None

nums = sorted([2, 7, 11, 15, 1, 8, 3])
print(f"Two sum for 9: {two_sum_search(nums, 9)}")   # (1, 8) or (2, 7)
`,
};

export const quiz = {
  en: [
    {
      question:
        "Why does binary search require sorted data, and what goes wrong if you use it on unsorted data?",
      options: [
        "Binary search crashes with an error on unsorted data",
        "Binary search relies on the sorted order to decide which half to discard. On unsorted data it makes the wrong decision — 'target must be in the right half' — silently returning wrong answers (like -1 when the item exists) with no error message.",
        "Binary search works on unsorted data but is just slower",
        "Python automatically sorts data before binary search runs",
      ],
      correct: 1,
    },
    {
      question:
        "You have a list of 1,000,000 sorted numbers. How many comparisons does binary search need in the worst case?",
      options: [
        "500,000 — binary search checks half the list",
        "1,000 — the square root of 1,000,000",
        "About 20 — log₂(1,000,000) ≈ 20. Each comparison halves the remaining search space, so even a million items needs only ~20 steps.",
        "1 — binary search always finds the answer in one step",
      ],
      correct: 2,
    },
    {
      question:
        "What is the key difference between DFS (Depth First Search) and BFS (Breadth First Search)?",
      options: [
        "DFS is faster than BFS for all types of data",
        "DFS goes as deep as possible down one path before backtracking — good for finding if something exists. BFS explores level by level — good for finding the shortest path or closest match. DFS uses a stack (or recursion), BFS uses a queue.",
        "DFS works on trees, BFS only works on graphs",
        "DFS requires sorted data, BFS works on any order",
      ],
      correct: 1,
    },
    {
      question:
        "You need to check if a username exists in a set of 10 million registered users, and you do this check 1000 times per second. What data structure and algorithm should you use?",
      options: [
        "A sorted list with binary search — O(log N) per lookup",
        "A Python set with 'username in registered_users' — O(1) per lookup. Hash lookup is instant regardless of size. For 1000 checks/second, 10ms total vs potentially seconds for linear search.",
        "A linear search through the list — simple and correct",
        "A database query — only databases can handle this scale",
      ],
      correct: 1,
    },
    {
      question:
        "What does Python's bisect.bisect_left(sorted_list, target) return when the target is NOT in the list?",
      options: [
        "-1 to indicate the target was not found",
        "The index where target would be inserted to keep the list sorted — this lets you both check existence (check if the element at that index equals target) and find insertion points in one O(log N) operation.",
        "None — same as the 'not found' convention",
        "It raises a ValueError exception",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi la recherche binaire nécessite-t-elle des données triées, et que se passe-t-il si vous l'utilisez sur des données non triées ?",
      options: [
        "La recherche binaire plante avec une erreur sur des données non triées",
        "La recherche binaire s'appuie sur l'ordre trié pour décider quelle moitié éliminer. Sur des données non triées, elle prend la mauvaise décision — retournant silencieusement de mauvaises réponses sans message d'erreur.",
        "La recherche binaire fonctionne sur des données non triées mais est juste plus lente",
        "Python trie automatiquement les données avant d'exécuter la recherche binaire",
      ],
      correct: 1,
    },
    {
      question:
        "Vous avez une liste de 1 000 000 de nombres triés. Combien de comparaisons la recherche binaire nécessite-t-elle dans le pire cas ?",
      options: [
        "500 000 — la recherche binaire vérifie la moitié de la liste",
        "1 000 — la racine carrée de 1 000 000",
        "Environ 20 — log₂(1 000 000) ≈ 20. Chaque comparaison divise l'espace de recherche restant par deux.",
        "1 — la recherche binaire trouve toujours la réponse en une étape",
      ],
      correct: 2,
    },
    {
      question: "Quelle est la différence clé entre DFS et BFS ?",
      options: [
        "DFS est plus rapide que BFS pour tous les types de données",
        "DFS va aussi profond que possible sur un chemin avant de revenir en arrière — bon pour trouver si quelque chose existe. BFS explore niveau par niveau — bon pour trouver le chemin le plus court. DFS utilise une pile, BFS utilise une file.",
        "DFS fonctionne sur les arbres, BFS seulement sur les graphes",
        "DFS nécessite des données triées, BFS fonctionne dans n'importe quel ordre",
      ],
      correct: 1,
    },
    {
      question:
        "Vous devez vérifier si un nom d'utilisateur existe dans un set de 10 millions d'utilisateurs, 1000 fois par seconde. Quelle structure de données utiliser ?",
      options: [
        "Une liste triée avec recherche binaire — O(log N) par recherche",
        "Un set Python avec 'utilisateur in utilisateurs_enregistres' — O(1) par recherche. La recherche par hachage est instantanée quelle que soit la taille.",
        "Une recherche linéaire — simple et correcte",
        "Une requête de base de données — seules les bases peuvent gérer cette échelle",
      ],
      correct: 1,
    },
    {
      question:
        "Que retourne bisect.bisect_left(liste_triee, cible) quand la cible N'EST PAS dans la liste ?",
      options: [
        "-1 pour indiquer que la cible n'a pas été trouvée",
        "L'index où la cible serait insérée pour garder la liste triée — cela vous permet de vérifier l'existence et de trouver les points d'insertion en une seule opération O(log N).",
        "None — même convention que 'non trouvé'",
        "Elle lève une exception ValueError",
      ],
      correct: 1,
    },
  ],
};
