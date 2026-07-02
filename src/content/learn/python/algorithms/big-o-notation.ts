export const id = "big-o-notation";
export const titleEn = "Big O Notation";
export const titleFr = "Notation Big O";

export const content = {
  en: `# Big O Notation

## The Problem: Code Can Be Correct But Slow

Two programs can produce the exact same correct answer and yet one takes 1 millisecond while the other takes 3 hours. Big O notation is how programmers measure and communicate that difference.

Before we define anything formally, let's feel the problem:

\`\`\`python
import time

data = list(range(100_000))   # a list of 100,000 numbers

# Method 1: check if 99,999 is in the list
start = time.time()
result = 99_999 in data          # Python scans every element
end = time.time()
print(f"Method 1: {(end-start)*1000:.2f}ms")

# Method 2: check if 99,999 is in a set
data_set = set(data)
start = time.time()
result = 99_999 in data_set      # instant lookup
end = time.time()
print(f"Method 2: {(end-start)*1000:.4f}ms")

# Method 1: ~5ms
# Method 2: ~0.001ms
# Same answer. 5000x speed difference.
# With 10 million items: Method 1 takes minutes. Method 2 still instant.
\`\`\`

Big O tells you **how your code scales as the input grows**. It answers: "if I double the input size, what happens to the time?"

## The Mental Model: A Library Analogy

Imagine a library with N books. You need to find a specific book.

\`\`\`
Strategy A — Check every book one by one:
  100 books   → check up to 100 books
  1,000 books → check up to 1,000 books
  1,000,000 books → check up to 1,000,000 books
  Time grows at the SAME RATE as the number of books.
  This is O(N) — linear time.

Strategy B — Books are alphabetically sorted, use binary search:
  100 books       → check at most 7 books   (log₂ 100 ≈ 7)
  1,000 books     → check at most 10 books  (log₂ 1000 ≈ 10)
  1,000,000 books → check at most 20 books  (log₂ 1000000 ≈ 20)
  Doubling the books adds just ONE extra check!
  This is O(log N) — logarithmic time.

Strategy C — The book has a unique ID, go directly to shelf:
  100 books       → 1 check
  1,000,000 books → 1 check (still!)
  This is O(1) — constant time.
\`\`\`

## What Big O Actually Measures

Big O measures the **worst-case number of operations** as the input size N grows. It deliberately ignores:

- Constants (O(2N) → O(N))
- Small terms (O(N² + N) → O(N²))
- Hardware speed

Why ignore constants? Because we care about the **shape of growth**, not the exact number. An algorithm that takes 2N steps is still linear — doubling the input doubles the time, regardless of the constant.

## The Common Complexities From Best to Worst

\`\`\`
O(1)       — Constant      — doesn't matter how big N is
O(log N)   — Logarithmic   — grows very slowly (binary search)
O(N)       — Linear        — grows proportionally
O(N log N) — Linearithmic  — slightly worse than linear (good sorting)
O(N²)      — Quadratic     — grows fast (nested loops on same data)
O(2ᴺ)      — Exponential   — explodes (brute force combinations)
O(N!)      — Factorial     — catastrophic (all permutations)
\`\`\`

Let's see what these look like with real numbers:

\`\`\`
N = 10        N = 100       N = 1,000     N = 1,000,000
─────────────────────────────────────────────────────────
O(1):    1         1             1             1
O(logN): 3         7             10            20
O(N):    10        100           1,000         1,000,000
O(NlogN):30        700           10,000        20,000,000
O(N²):   100       10,000        1,000,000     1,000,000,000,000
O(2ᴺ):   1,024     huge          astronomical  impossible
\`\`\`

At N=1,000: O(N²) does 1,000,000 operations. O(N) does 1,000. That's 1000x slower — and it gets exponentially worse as N grows.

## O(1) — Constant Time

The operation takes the same time regardless of input size. This is the gold standard.

\`\`\`python
# Accessing a list by index — always 1 step, regardless of list size
def get_first(items):
    return items[0]     # O(1) — direct memory access

# Dictionary lookup — always ~1 step (hash table)
def get_age(person):
    return person["age"]   # O(1)

# Math operations — always constant
def is_even(n):
    return n % 2 == 0      # O(1) — same time for n=2 or n=1,000,000

# Stack push/pop — always constant
stack = []
stack.append(5)    # O(1)
stack.pop()        # O(1)

# What does NOT look like O(1)?
def bad_example(items):
    return len(items)   # O(1) in Python (len() is cached)
                        # but in some languages, counting is O(N)
\`\`\`

## O(N) — Linear Time

The time grows proportionally with the input. If N doubles, time doubles.

\`\`\`python
# Find the maximum value — must check every item
def find_max(items):
    maximum = items[0]
    for item in items:      # N iterations
        if item > maximum:
            maximum = item
    return maximum
# N=100: ~100 comparisons
# N=10,000: ~10,000 comparisons — 100x more work

# Count occurrences
def count_value(items, target):
    count = 0
    for item in items:      # N iterations
        if item == target:
            count += 1
    return count

# Calculate sum (though Python's sum() is O(N) under the hood)
def my_sum(items):
    total = 0
    for item in items:      # N iterations
        total += item
    return total

# Linear search — check each item one by one
def linear_search(items, target):
    for i, item in enumerate(items):   # O(N) worst case
        if item == target:
            return i
    return -1
\`\`\`

## O(N²) — Quadratic Time

Two nested loops over the same data. Every time N doubles, time quadruples.

\`\`\`python
# Find all pairs that sum to a target
def find_pairs(items, target):
    pairs = []
    for i in range(len(items)):         # N iterations
        for j in range(i+1, len(items)):  # N iterations each
            if items[i] + items[j] == target:
                pairs.append((items[i], items[j]))
    return pairs
# N=100:   ~5,000 comparisons
# N=1,000: ~500,000 comparisons (100x more work for 10x more data!)

# Bubble sort — compare every pair of adjacent elements
def bubble_sort(items):
    n = len(items)
    for i in range(n):              # N iterations
        for j in range(n - i - 1): # N iterations
            if items[j] > items[j+1]:
                items[j], items[j+1] = items[j+1], items[j]
    return items
# This is why bubble sort is only used in textbooks — O(N²) is too slow

# SPOT the O(N²):
# Two for loops over the same data = almost always O(N²)
\`\`\`

## O(log N) — Logarithmic Time

Each step cuts the problem in half. This is extremely fast — even for millions of items.

\`\`\`python
# Binary search — the classic O(log N) algorithm
# REQUIREMENT: list must be SORTED first
def binary_search(items, target):
    left  = 0
    right = len(items) - 1

    while left <= right:
        mid = (left + right) // 2    # find the middle

        if items[mid] == target:
            return mid               # found it!
        elif items[mid] < target:
            left = mid + 1           # target is in RIGHT half
        else:
            right = mid - 1          # target is in LEFT half

    return -1   # not found

# How it works step by step for target=7 in [1,2,3,4,5,6,7,8,9,10]:
# Step 1: mid=4, items[4]=5. 7>5, so look RIGHT → [6,7,8,9,10]
# Step 2: mid=7, items[7]=8. 7<8, so look LEFT  → [6,7]
# Step 3: mid=5, items[5]=6. 7>6, so look RIGHT → [7]
# Step 4: mid=6, items[6]=7. Found! Return 6.
# 4 steps to find an item in 10. Linear search: up to 10 steps.
# In 1,000,000 items: binary search needs ~20 steps. Linear: 1,000,000.

numbers = sorted([64, 25, 12, 22, 11, 7, 3, 99, 42])
print(binary_search(numbers, 42))   # finds it in a few steps
\`\`\`

## O(N log N) — Linearithmic Time

The sweet spot for sorting algorithms. Slightly worse than linear but vastly better than quadratic.

\`\`\`python
# Python's built-in sort uses Timsort — O(N log N)
numbers = [64, 25, 12, 22, 11]
numbers.sort()       # O(N log N)
sorted_numbers = sorted(numbers)  # O(N log N)

# Merge sort — the classic O(N log N) algorithm
def merge_sort(items):
    if len(items) <= 1:
        return items

    mid   = len(items) // 2
    left  = merge_sort(items[:mid])    # sort left half
    right = merge_sort(items[mid:])    # sort right half
    return merge(left, right)          # merge the two halves

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

print(merge_sort([64, 25, 12, 22, 11]))   # [11, 12, 22, 25, 64]
\`\`\`

## How to Analyze Your Own Code

Follow these rules when reading code:

\`\`\`python
# RULE 1: A simple loop = O(N)
for item in items:       # O(N)
    print(item)

# RULE 2: Nested loops on same data = O(N²)
for i in items:          # O(N)
    for j in items:      # O(N) × N = O(N²)
        print(i, j)

# RULE 3: Loop that halves each time = O(log N)
n = len(items)
while n > 1:             # O(log N)
    n = n // 2

# RULE 4: Operations in sequence = add them, take the largest
for item in items:       # O(N)
    print(item)
for item in items:       # O(N)
    print(item * 2)
# Total: O(N) + O(N) = O(2N) = O(N)  ← constants ignored

# RULE 5: Dictionary/set lookup = O(1)
my_set = {1, 2, 3, 4, 5}
if 3 in my_set:          # O(1) — hash lookup
    print("found")

my_list = [1, 2, 3, 4, 5]
if 3 in my_list:         # O(N) — linear scan
    print("found")
\`\`\`

## Common Python Operations and Their Complexity

\`\`\`
LIST:
  append(x)        → O(1)   — add to end
  pop()            → O(1)   — remove from end
  pop(i)           → O(N)   — remove from middle (shifts elements)
  insert(i, x)     → O(N)   — insert in middle (shifts elements)
  x in list        → O(N)   — linear search
  list[i]          → O(1)   — index access
  len(list)        → O(1)   — cached
  sort()           → O(N log N)

DICTIONARY:
  d[key]           → O(1)   — hash lookup
  d[key] = value   → O(1)   — hash insert
  key in d         → O(1)   — hash lookup
  del d[key]       → O(1)   — hash delete

SET:
  s.add(x)         → O(1)
  x in s           → O(1)   — hash lookup (much faster than list!)
  s.remove(x)      → O(1)
\`\`\`

## A Practical Example: Optimizing Real Code

\`\`\`python
# Problem: find all names that appear in BOTH lists

names_a = ["Alice", "Bob", "Carol", "David", "Eve"]
names_b = ["Bob", "David", "Frank", "Grace"]

# SLOW VERSION — O(N × M) — nested loops
def find_common_slow(list_a, list_b):
    common = []
    for name in list_a:          # N iterations
        if name in list_b:       # M iterations each → O(N×M)
            common.append(name)
    return common

# FAST VERSION — O(N + M) — convert to set first
def find_common_fast(list_a, list_b):
    set_b = set(list_b)          # O(M) to build set
    common = []
    for name in list_a:          # N iterations
        if name in set_b:        # O(1) — hash lookup!
            common.append(name)
    return common

print(find_common_slow(names_a, names_b))   # ['Bob', 'David']
print(find_common_fast(names_a, names_b))   # ['Bob', 'David']

# Same result. But with 10,000 names each:
# Slow: 10,000 × 10,000 = 100,000,000 operations
# Fast: 10,000 + 10,000 = 20,000 operations
# Fast version is 5,000x faster.
\`\`\`

## Space Complexity — Memory Matters Too

Big O also applies to memory, not just time.

\`\`\`python
# O(1) space — uses same memory regardless of input
def find_max(items):
    maximum = items[0]    # just one variable
    for item in items:
        if item > maximum:
            maximum = item
    return maximum

# O(N) space — creates a new list same size as input
def double_all(items):
    return [x * 2 for x in items]   # new list of N items

# O(N²) space — creates a matrix
def create_matrix(n):
    return [[0] * n for _ in range(n)]   # N × N = N² memory
\`\`\`

## Summary: When to Care

\`\`\`
Your data is small (< 1,000 items):
  Don't over-optimize. Write clear code. Any algorithm works.

Your data is medium (1,000 – 100,000 items):
  Avoid O(N²) — it becomes noticeably slow.
  O(N log N) and O(N) are both fine.

Your data is large (100,000+ items):
  O(N²) is too slow — avoid nested loops on same data.
  O(N) or O(N log N) preferred.
  O(log N) or O(1) is ideal for lookups — use sets and dicts.

The single best habit:
  Use a SET or DICT for lookups instead of a LIST.
  Changing "x in my_list" to "x in my_set" is often
  the easiest 100x speedup you'll ever make.
\`\`\`
`,

  fr: `# Notation Big O

## Le problème : le code peut être correct mais lent

Deux programmes peuvent produire la même réponse correcte et pourtant l'un prend 1 milliseconde et l'autre 3 heures. La notation Big O est la façon dont les programmeurs mesurent et communiquent cette différence.

## Le modèle mental : une analogie avec une bibliothèque

Imaginez une bibliothèque avec N livres. Vous devez trouver un livre spécifique.

\`\`\`
Stratégie A — Vérifier chaque livre un par un :
  100 livres     → vérifier jusqu'à 100 livres
  1 000 000 livres → vérifier jusqu'à 1 000 000 livres
  C'est O(N) — temps linéaire.

Stratégie B — Livres triés alphabétiquement, recherche binaire :
  100 livres       → vérifier au plus 7 livres
  1 000 000 livres → vérifier au plus 20 livres
  Doubler les livres n'ajoute qu'UNE vérification !
  C'est O(log N) — temps logarithmique.

Stratégie C — Le livre a un ID unique, aller directement à l'étagère :
  Peu importe le nombre de livres → 1 vérification toujours
  C'est O(1) — temps constant.
\`\`\`

## Les complexités communes du meilleur au pire

\`\`\`
O(1)       — Constant      — indépendant de la taille
O(log N)   — Logarithmique — croît très lentement
O(N)       — Linéaire      — croît proportionnellement
O(N log N) — Linéarithmique — légèrement pire que linéaire
O(N²)      — Quadratique   — croît vite (boucles imbriquées)
O(2ᴺ)      — Exponentiel   — explose
\`\`\`

## Analyser votre propre code

\`\`\`python
# RÈGLE 1 : une boucle simple = O(N)
for element in elements:    # O(N)
    print(element)

# RÈGLE 2 : boucles imbriquées sur les mêmes données = O(N²)
for i in elements:          # O(N)
    for j in elements:      # O(N) × N = O(N²)
        print(i, j)

# RÈGLE 3 : boucle qui divise par deux à chaque fois = O(log N)
n = len(elements)
while n > 1:                # O(log N)
    n = n // 2

# RÈGLE 4 : recherche dans dict/set = O(1)
mon_set = {1, 2, 3}
if 3 in mon_set:            # O(1) — recherche par hachage
    print("trouvé")

ma_liste = [1, 2, 3]
if 3 in ma_liste:           # O(N) — scan linéaire
    print("trouvé")
\`\`\`

## La meilleure habitude pratique

\`\`\`python
# LENT — O(N × M)
def trouver_communs_lent(liste_a, liste_b):
    communs = []
    for nom in liste_a:           # N itérations
        if nom in liste_b:        # M itérations chacune
            communs.append(nom)
    return communs

# RAPIDE — O(N + M)
def trouver_communs_rapide(liste_a, liste_b):
    set_b = set(liste_b)          # O(M) pour construire le set
    communs = []
    for nom in liste_a:           # N itérations
        if nom in set_b:          # O(1) — recherche par hachage !
            communs.append(nom)
    return communs

# Même résultat. Avec 10 000 noms chacun :
# Lent  : 10 000 × 10 000 = 100 000 000 opérations
# Rapide: 10 000 + 10 000 = 20 000 opérations (5 000x plus rapide)
\`\`\`
`,
};

export const starterCode = {
  default: `# Big O Notation — Practice
import time

# --- Part 1: Compare linear vs set lookup ---
data_list = list(range(100_000))
data_set  = set(data_list)
target    = 99_999

start = time.time()
found = target in data_list
t1 = (time.time() - start) * 1000

start = time.time()
found = target in data_set
t2 = (time.time() - start) * 1000

print(f"List lookup:  {t1:.3f}ms")
print(f"Set lookup:   {t2:.4f}ms")
print(f"Speedup: ~{t1/max(t2,0.0001):.0f}x faster")

# --- Part 2: O(N) — find max without built-in ---
def find_max(items):
    maximum = items[0]
    for item in items:    # O(N) — must check every item
        if item > maximum:
            maximum = item
    return maximum

numbers = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
print(f"\\nMax: {find_max(numbers)}")

# --- Part 3: Binary search O(log N) ---
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

sorted_data = list(range(1_000_000))
idx, steps = binary_search(sorted_data, 999_999)
print(f"\\nFound 999,999 at index {idx} in {steps} steps")
print(f"Linear search would need up to 1,000,000 steps")
`,
};

export const exerciseEn = `Complexity detective — analyze and fix slow code.

1. Write a function 'has_duplicate_slow(items)' using O(N²) nested loops
   that checks if any item appears more than once.

2. Write 'has_duplicate_fast(items)' using O(N) time with a set.

3. Time both on a list of 50,000 numbers and print the speedup.

4. Write 'two_sum(numbers, target)' that finds two numbers that add up
   to target. First O(N²) version, then O(N) version using a dict.
   (Hint for O(N): for each number x, check if target-x is in a dict)`;

export const exerciseFr = `Détective de complexité — analyser et corriger du code lent.

1. Écrivez 'a_doublon_lent(elements)' avec des boucles imbriquées O(N²)
   qui vérifie si un élément apparaît plus d'une fois.

2. Écrivez 'a_doublon_rapide(elements)' en O(N) avec un set.

3. Chronométrez les deux sur une liste de 50 000 nombres.

4. Écrivez 'deux_somme(nombres, cible)' qui trouve deux nombres dont
   la somme est égale à cible. D'abord O(N²), puis O(N) avec un dict.`;

export const solutionCode = {
  default: `import time

# --- Duplicate detection ---
def has_duplicate_slow(items):
    """O(N²) — nested loops"""
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                return True
    return False

def has_duplicate_fast(items):
    """O(N) — set tracks seen items"""
    seen = set()
    for item in items:
        if item in seen:
            return True
        seen.add(item)
    return False

# Time comparison
import random
data = list(range(50_000))
random.shuffle(data)
data[-1] = data[0]   # guarantee a duplicate at the end

start = time.time()
has_duplicate_slow(data)
t_slow = (time.time() - start) * 1000

start = time.time()
has_duplicate_fast(data)
t_fast = (time.time() - start) * 1000

print(f"Slow O(N²): {t_slow:.1f}ms")
print(f"Fast O(N):  {t_fast:.2f}ms")
print(f"Speedup: ~{t_slow/max(t_fast,0.01):.0f}x")

# --- Two sum ---
def two_sum_slow(numbers, target):
    """O(N²)"""
    for i in range(len(numbers)):
        for j in range(i + 1, len(numbers)):
            if numbers[i] + numbers[j] == target:
                return (numbers[i], numbers[j])
    return None

def two_sum_fast(numbers, target):
    """O(N) — for each x, check if target-x is already seen"""
    seen = {}
    for x in numbers:
        complement = target - x
        if complement in seen:
            return (complement, x)
        seen[x] = True
    return None

nums = [2, 7, 11, 15, 1, 8]
print(f"\\nTwo sum (slow): {two_sum_slow(nums, 9)}")
print(f"Two sum (fast): {two_sum_fast(nums, 9)}")
`,
};

export const quiz = {
  en: [
    {
      question: "What does Big O notation actually measure?",
      options: [
        "The exact number of milliseconds an algorithm takes to run",
        "How the number of operations grows as the input size N increases — specifically the worst-case growth rate, ignoring constants and small terms",
        "The amount of memory an algorithm uses",
        "The number of lines of code in the algorithm",
      ],
      correct: 1,
    },
    {
      question:
        "You have a loop inside another loop, both iterating over a list of N items. What is the time complexity?",
      options: [
        "O(N) — loops add together",
        "O(2N) — two loops means double the work",
        "O(N²) — each of the N outer iterations does N inner iterations, giving N×N total operations",
        "O(log N) — nested loops are more efficient",
      ],
      correct: 2,
    },
    {
      question: "Why is 'x in my_set' O(1) while 'x in my_list' is O(N)?",
      options: [
        "Sets are always smaller than lists so there is less to search",
        "Sets use a hash table — Python computes a hash of x and goes directly to the right bucket (like a dictionary). Lists have no such structure and must scan every element one by one.",
        "Python optimizes set membership checks at compile time",
        "Sets store items in sorted order enabling binary search",
      ],
      correct: 1,
    },
    {
      question:
        "Binary search is O(log N). What does this mean practically for a sorted list of 1,000,000 items?",
      options: [
        "It checks half the items — 500,000 comparisons",
        "It checks roughly log₂(1,000,000) ≈ 20 items — each step cuts the remaining search space in half, so even a million-item list needs only about 20 comparisons",
        "It checks 1,000 items — the square root of 1,000,000",
        "It checks all items but in a smarter order",
      ],
      correct: 1,
    },
    {
      question:
        "Which change gives the biggest real-world performance improvement?",
      options: [
        "Replacing a for loop with a while loop",
        "Adding more RAM to your computer",
        "Changing 'if x in my_list' to 'if x in my_set' inside a loop — converts the lookup from O(N) to O(1), turning an overall O(N²) algorithm into O(N)",
        "Using f-strings instead of string concatenation",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question: "Que mesure réellement la notation Big O ?",
      options: [
        "Le nombre exact de millisecondes qu'un algorithme prend pour s'exécuter",
        "Comment le nombre d'opérations croît à mesure que la taille d'entrée N augmente — spécifiquement le taux de croissance dans le pire cas, en ignorant les constantes",
        "La quantité de mémoire qu'un algorithme utilise",
        "Le nombre de lignes de code dans l'algorithme",
      ],
      correct: 1,
    },
    {
      question:
        "Vous avez une boucle à l'intérieur d'une autre, les deux itérant sur une liste de N éléments. Quelle est la complexité temporelle ?",
      options: [
        "O(N) — les boucles s'additionnent",
        "O(2N) — deux boucles signifie deux fois plus de travail",
        "O(N²) — chacune des N itérations extérieures fait N itérations intérieures, donnant N×N opérations au total",
        "O(log N) — les boucles imbriquées sont plus efficaces",
      ],
      correct: 2,
    },
    {
      question:
        "Pourquoi 'x in mon_set' est O(1) alors que 'x in ma_liste' est O(N) ?",
      options: [
        "Les sets sont toujours plus petits que les listes donc il y a moins à chercher",
        "Les sets utilisent une table de hachage — Python calcule un hash de x et va directement au bon compartiment. Les listes n'ont pas une telle structure et doivent scanner chaque élément un par un.",
        "Python optimise les vérifications d'appartenance aux sets à la compilation",
        "Les sets stockent les éléments triés permettant la recherche binaire",
      ],
      correct: 1,
    },
    {
      question:
        "La recherche binaire est O(log N). Que cela signifie-t-il pratiquement pour une liste triée de 1 000 000 éléments ?",
      options: [
        "Elle vérifie la moitié des éléments — 500 000 comparaisons",
        "Elle vérifie environ log₂(1 000 000) ≈ 20 éléments — chaque étape divise l'espace de recherche par deux, donc même une liste d'un million d'éléments ne nécessite qu'environ 20 comparaisons",
        "Elle vérifie 1 000 éléments — la racine carrée de 1 000 000",
        "Elle vérifie tous les éléments mais dans un ordre plus intelligent",
      ],
      correct: 1,
    },
    {
      question:
        "Quel changement donne la plus grande amélioration de performance dans le monde réel ?",
      options: [
        "Remplacer une boucle for par une boucle while",
        "Ajouter plus de RAM à votre ordinateur",
        "Changer 'if x in ma_liste' en 'if x in mon_set' dans une boucle — convertit la recherche de O(N) à O(1), transformant un algorithme O(N²) global en O(N)",
        "Utiliser des f-strings plutôt que la concaténation de chaînes",
      ],
      correct: 2,
    },
  ],
};
