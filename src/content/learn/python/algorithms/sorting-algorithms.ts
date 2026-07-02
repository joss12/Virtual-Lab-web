export const id = "sorting-algorithms";
export const titleEn = "Sorting Algorithms";
export const titleFr = "Algorithmes de tri";

export const content = {
  en: `# Sorting Algorithms

## Why Sorting Matters

Sorting seems simple — put things in order. But it's one of the most studied problems in computer science because:

- **Binary search only works on sorted data** — sort once, search in O(log N) forever
- **Finding duplicates** becomes trivial when equal items are adjacent
- **Merging data** from two sources is fast when both are sorted
- **Databases** sort constantly — every ORDER BY clause is a sort

And most importantly: **different sorting algorithms make wildly different tradeoffs**. Understanding them teaches you to think algorithmically.

## The Mental Model: Sorting a Hand of Cards

Before any code, imagine you're sorting a hand of playing cards:

\`\`\`
Your hand: [7, 2, 9, 4, 1, 5]

Strategy A — Bubble Sort (compare neighbors, swap if wrong):
  Pass 1: [7,2,9,4,1,5] → [2,7,4,1,5,9]  (bubbled 9 to end)
  Pass 2: [2,7,4,1,5,9] → [2,4,1,5,7,9]  (bubbled 7 to near end)
  ...keep going until no swaps needed

Strategy B — Selection Sort (find smallest, put it first):
  Find min (1) → put at position 0: [1, 2,9,4,7,5]
  Find min of rest (2) → position 1: [1,2, 9,4,7,5]
  Find min of rest (4) → position 2: [1,2,4, 9,7,5]
  ...until done

Strategy C — Insertion Sort (like sorting cards in your hand):
  Pick up 2, insert before 7:  [2,7, 9,4,1,5]
  Pick up 9, already in place: [2,7,9, 4,1,5]
  Pick up 4, insert after 2:   [2,4,7,9, 1,5]
  ...until done

Strategy D — Merge Sort (divide and conquer):
  Split: [7,2,9] and [4,1,5]
  Sort each half recursively
  Merge two sorted halves together
\`\`\`

Each strategy has different strengths. Let's understand all of them deeply.

## Bubble Sort — The Simplest (But Slowest)

### How it works

Bubble sort repeatedly walks through the list comparing adjacent pairs. If a pair is in the wrong order, swap them. After each full pass, the largest unsorted element has "bubbled" to its correct position at the end.

\`\`\`python
def bubble_sort(items):
    n = len(items)
    
    for i in range(n):
        # After pass i, the last i elements are sorted
        # No need to check them again
        swapped = False
        
        for j in range(0, n - i - 1):
            if items[j] > items[j + 1]:
                # These two neighbors are in wrong order — swap them
                items[j], items[j + 1] = items[j + 1], items[j]
                swapped = True
        
        # Optimization: if no swaps in this pass, list is already sorted
        if not swapped:
            break
    
    return items

# Trace through a small example:
nums = [5, 3, 8, 1, 9, 2]
print(bubble_sort(nums))   # [1, 2, 3, 5, 8, 9]
\`\`\`

### Step by step visualization

\`\`\`
List: [5, 3, 8, 1, 9, 2]

Pass 1 (find largest, bubble it to end):
  Compare 5,3 → swap  → [3, 5, 8, 1, 9, 2]
  Compare 5,8 → ok    → [3, 5, 8, 1, 9, 2]
  Compare 8,1 → swap  → [3, 5, 1, 8, 9, 2]
  Compare 8,9 → ok    → [3, 5, 1, 8, 9, 2]
  Compare 9,2 → swap  → [3, 5, 1, 8, 2, 9]  ← 9 in place ✓

Pass 2 (find 2nd largest):
  Compare 3,5 → ok    → [3, 5, 1, 8, 2, 9]
  Compare 5,1 → swap  → [3, 1, 5, 8, 2, 9]
  Compare 5,8 → ok    → [3, 1, 5, 8, 2, 9]
  Compare 8,2 → swap  → [3, 1, 5, 2, 8, 9]  ← 8 in place ✓

...continues until sorted
\`\`\`

### Complexity

\`\`\`
Time:  O(N²) — two nested loops, each up to N iterations
Space: O(1)  — sorts in place, no extra memory needed
Best:  O(N)  — if already sorted (early exit with swapped flag)

Verdict: Simple to understand and implement.
         Almost never used in production — too slow for large data.
         Useful for learning and for nearly-sorted data.
\`\`\`

## Selection Sort — Find the Minimum Repeatedly

### How it works

Divide the list into two parts: sorted (left) and unsorted (right). Repeatedly find the minimum of the unsorted part and move it to the end of the sorted part.

\`\`\`python
def selection_sort(items):
    n = len(items)
    
    for i in range(n):
        # Find the index of the minimum element in unsorted portion
        min_idx = i   # assume current position is minimum
        
        for j in range(i + 1, n):
            if items[j] < items[min_idx]:
                min_idx = j   # found a smaller one
        
        # Swap minimum element into its correct position
        items[i], items[min_idx] = items[min_idx], items[i]
    
    return items

nums = [64, 25, 12, 22, 11]
print(selection_sort(nums))   # [11, 12, 22, 25, 64]
\`\`\`

### Step by step visualization

\`\`\`
List: [64, 25, 12, 22, 11]

Pass 1: Find min in [64,25,12,22,11] → 11 at index 4
        Swap 64 and 11: [11, 25, 12, 22, 64]  ← 11 in place ✓

Pass 2: Find min in [25,12,22,64] → 12 at index 2
        Swap 25 and 12: [11, 12, 25, 22, 64]  ← 12 in place ✓

Pass 3: Find min in [25,22,64] → 22 at index 3
        Swap 25 and 22: [11, 12, 22, 25, 64]  ← 22 in place ✓

Pass 4: Find min in [25,64] → 25 at index 3
        Already in place: [11, 12, 22, 25, 64] ← 25 in place ✓

Done: [11, 12, 22, 25, 64] ✓
\`\`\`

### Complexity

\`\`\`
Time:  O(N²) — always, even if already sorted (no early exit)
Space: O(1)  — in place
Swaps: O(N)  — at most N swaps (better than bubble sort's O(N²) swaps)

Verdict: Makes fewer swaps than bubble sort — better when swapping
         is expensive (e.g. writing to disk). Still O(N²) overall.
         Simple but rarely used in practice.
\`\`\`

## Insertion Sort — Like Sorting Cards

### How it works

This is exactly how most people sort a hand of cards. You maintain a sorted left portion and an unsorted right portion. Take the next unsorted item and insert it into its correct position in the sorted portion by shifting larger elements right.

\`\`\`python
def insertion_sort(items):
    for i in range(1, len(items)):
        # 'key' is the item we're inserting into the sorted portion
        key = items[i]
        
        # Start from the end of the sorted portion, move backwards
        j = i - 1
        
        # Shift elements that are greater than key one position right
        while j >= 0 and items[j] > key:
            items[j + 1] = items[j]   # shift right
            j -= 1
        
        # Insert key at its correct position
        items[j + 1] = key
    
    return items

nums = [5, 2, 4, 6, 1, 3]
print(insertion_sort(nums))   # [1, 2, 3, 4, 5, 6]
\`\`\`

### Step by step visualization

\`\`\`
List: [5, 2, 4, 6, 1, 3]
       ↑ sorted | unsorted ↑

i=1, key=2: sorted=[5], insert 2 before 5
  → [2, 5, 4, 6, 1, 3]   sorted=[2,5]

i=2, key=4: sorted=[2,5], insert 4 between 2 and 5
  → [2, 4, 5, 6, 1, 3]   sorted=[2,4,5]

i=3, key=6: sorted=[2,4,5], 6>5 so no shift needed
  → [2, 4, 5, 6, 1, 3]   sorted=[2,4,5,6]

i=4, key=1: sorted=[2,4,5,6], shift all right, insert at start
  → [1, 2, 4, 5, 6, 3]   sorted=[1,2,4,5,6]

i=5, key=3: sorted=[1,2,4,5,6], shift 4,5,6 right, insert 3
  → [1, 2, 3, 4, 5, 6]   done ✓
\`\`\`

### Complexity

\`\`\`
Time:  O(N²) worst case (reverse sorted)
       O(N)  best case  (already sorted — no shifts needed!)
Space: O(1)  in place

Verdict: Excellent for SMALL lists (< 20 items) and NEARLY SORTED data.
         Python's Timsort uses insertion sort for small chunks — because
         for small N, insertion sort's simplicity beats merge sort's overhead.
         Also great for streaming data (inserting one item at a time).
\`\`\`

## Merge Sort — Divide and Conquer

### How it works

This is where it gets beautiful. Merge sort uses a key insight: **merging two already-sorted lists is easy and fast** (O(N)). So it recursively splits the list in half until each piece has 1 element (trivially sorted), then merges them back together.

\`\`\`python
def merge_sort(items):
    # Base case: a list of 0 or 1 items is already sorted
    if len(items) <= 1:
        return items
    
    # Divide: split list in half
    mid   = len(items) // 2
    left  = merge_sort(items[:mid])    # sort left half
    right = merge_sort(items[mid:])    # sort right half
    
    # Conquer: merge the two sorted halves
    return merge(left, right)

def merge(left, right):
    """Merge two sorted lists into one sorted list."""
    result = []
    i = 0   # pointer into left list
    j = 0   # pointer into right list
    
    # Compare front elements of each list, take the smaller one
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    # One list is exhausted — append the rest of the other
    result.extend(left[i:])
    result.extend(right[j:])
    
    return result

nums = [38, 27, 43, 3, 9, 82, 10]
print(merge_sort(nums))   # [3, 9, 10, 27, 38, 43, 82]
\`\`\`

### The Recursion Tree

\`\`\`
merge_sort([38, 27, 43, 3, 9, 82, 10])
           /                        \\
merge_sort([38,27,43])    merge_sort([3,9,82,10])
     /          \\              /             \\
[38,27]       [43]        [3,9]          [82,10]
  /    \\                  /   \\           /    \\
[38]  [27]             [3]   [9]       [82]   [10]

Now merge upward:
[38]+[27] → merge → [27,38]
[27,38]+[43] → merge → [27,38,43]
[3]+[9] → merge → [3,9]
[82]+[10] → merge → [10,82]
[3,9]+[10,82] → merge → [3,9,10,82]
[27,38,43]+[3,9,10,82] → merge → [3,9,10,27,38,43,82] ✓
\`\`\`

### Complexity

\`\`\`
Time:  O(N log N) — always (best, worst, average)
       The list is split log N times. Each level does O(N) work merging.
Space: O(N)  — needs temporary space for the merged result

Verdict: The gold standard for general-purpose sorting.
         Guaranteed O(N log N) even in worst case.
         Stable sort (equal elements keep their original order).
         Used in: Python's sorted() for object lists,
                  Java's Arrays.sort for objects.
\`\`\`

## Quick Sort — Fast in Practice

### How it works

Pick a **pivot** element. Partition the list so everything smaller than pivot is on the left, everything larger on the right. Then recursively sort each side. The pivot is now in its final position.

\`\`\`python
def quick_sort(items):
    if len(items) <= 1:
        return items
    
    # Choose pivot (middle element is a simple good choice)
    pivot = items[len(items) // 2]
    
    # Partition into three groups
    left   = [x for x in items if x < pivot]   # smaller than pivot
    middle = [x for x in items if x == pivot]  # equal to pivot
    right  = [x for x in items if x > pivot]   # larger than pivot
    
    # Recursively sort and combine
    return quick_sort(left) + middle + quick_sort(right)

nums = [3, 6, 8, 10, 1, 2, 1]
print(quick_sort(nums))   # [1, 1, 2, 3, 6, 8, 10]
\`\`\`

### Step by step visualization

\`\`\`
quick_sort([3, 6, 8, 10, 1, 2, 1])
pivot = 8 (middle element)

left   = [3, 6, 1, 2, 1]  (< 8)
middle = [8]               (= 8)
right  = [10]              (> 8)

Recursively sort left [3,6,1,2,1]:
  pivot = 1
  left   = []       right  = [3,6,2]
  → [] + [1,1] + sort([3,6,2])
         sort([3,6,2]):
           pivot = 6
           left=[3,2] right=[]
           → sort([3,2]) + [6] + []
              sort([3,2]): → [2,3]
           → [2,3,6]
  → [1,1,2,3,6]

Result: [1,1,2,3,6] + [8] + [10] = [1,1,2,3,6,8,10] ✓
\`\`\`

### Complexity

\`\`\`
Time:  O(N log N) average case
       O(N²) worst case (sorted input with bad pivot choice!)
Space: O(log N) average (recursive call stack)

Why O(N²) worst case?
  If pivot is always the smallest/largest element:
  [1, 2, 3, 4, 5] with pivot=1:
    left=[], right=[2,3,4,5] → unbalanced!
  Every partition does N-1 work, giving N × (N-1)/2 = O(N²)

Verdict: Fastest in practice for most real data (excellent cache behavior).
         Python's sort() uses Timsort not quicksort.
         C's qsort() and many languages use quicksort variants.
         Not stable — equal elements may reorder.
\`\`\`

## Python's Built-In Sort — Timsort

Python's \`sort()\` and \`sorted()\` use **Timsort** — a hybrid of merge sort and insertion sort that is highly optimized for real-world data.

\`\`\`python
# Always prefer Python's built-in sort — it's faster than anything you'll write
numbers = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]

numbers.sort()                   # sorts IN PLACE, returns None
print(numbers)                   # [1, 1, 2, 3, 3, 4, 5, 5, 6, 9]

nums_copy = sorted(numbers)      # returns NEW sorted list, original unchanged
print(nums_copy)

# Sort in reverse
numbers.sort(reverse=True)
print(numbers)                   # [9, 6, 5, 5, 4, 3, 3, 2, 1, 1]

# Sort by a custom key — the KEY function extracts the comparison value
words = ["banana", "apple", "cherry", "date", "elderberry"]
words.sort(key=len)              # sort by length
print(words)                     # ['date', 'apple', 'banana', 'cherry', 'elderberry']

# Sort objects by attribute
people = [
    {"name": "Charlie", "age": 30},
    {"name": "Alice",   "age": 25},
    {"name": "Bob",     "age": 35},
]
people.sort(key=lambda p: p["age"])
print([p["name"] for p in people])   # ['Alice', 'Charlie', 'Bob']

# Sort by multiple criteria: primary by age, secondary by name
people.sort(key=lambda p: (p["age"], p["name"]))
\`\`\`

### Timsort's Key Insight

\`\`\`
Real-world data is rarely completely random.
It often has "runs" — sections that are already sorted.

Example: a log file sorted by time, but you append a new day's logs.
  [Jan 1..., Jan 2..., Jan 3...] + [new entries]

Timsort detects existing sorted runs and exploits them:
  - Small chunks: insertion sort (fast for small N, handles runs well)
  - Large chunks: merge sort (guaranteed O(N log N))
  - Result: often faster than O(N log N) on partially sorted data

Timsort complexity:
  Time:  O(N log N) worst case, O(N) best case (already sorted!)
  Space: O(N)
  Stable: yes (equal elements keep original order)
\`\`\`

## Choosing the Right Sort

\`\`\`
Use Python's built-in sort()   → almost always. It's the best choice.

Use insertion sort when:
  → N < 20 (tiny list)
  → Data is nearly sorted
  → You're inserting elements one at a time

Use merge sort when:
  → You need guaranteed O(N log N) (not just average case)
  → You need a stable sort
  → You're sorting linked lists (merge sort works well, quick sort doesn't)
  → External sorting (data too large for memory — sort chunks, merge)

Use quick sort when:
  → You need in-place sorting (O(log N) stack space vs merge sort's O(N))
  → Average case performance matters more than worst case
  → You control the pivot choice (random pivot avoids O(N²) worst case)

NEVER use bubble sort or selection sort:
  → Only for learning
  → Never in production with N > ~100
\`\`\`

## Counting Sort — When You Know Your Data

When you know your values are integers in a limited range, you can sort in O(N) — faster than any comparison-based sort.

\`\`\`python
def counting_sort(items, max_val):
    """Sort integers in range [0, max_val] in O(N + max_val) time."""
    # Count occurrences of each value
    counts = [0] * (max_val + 1)
    for item in items:
        counts[item] += 1
    
    # Reconstruct sorted list from counts
    result = []
    for value, count in enumerate(counts):
        result.extend([value] * count)
    
    return result

# Sort exam scores (all between 0 and 100)
scores = [85, 72, 99, 45, 85, 72, 60, 99, 45, 85]
print(counting_sort(scores, 100))
# [45, 45, 60, 72, 72, 85, 85, 85, 99, 99]

# O(N) time! No comparisons needed.
# Limitation: only works for integers in a known, bounded range.
# Not useful if values can be -1,000,000 to 1,000,000 (huge counts array)
\`\`\`

## Summary: All Sorting Algorithms at a Glance

\`\`\`
Algorithm      | Best    | Average  | Worst   | Space  | Stable?
───────────────|─────────|──────────|─────────|────────|────────
Bubble Sort    | O(N)    | O(N²)    | O(N²)   | O(1)   | Yes
Selection Sort | O(N²)   | O(N²)    | O(N²)   | O(1)   | No
Insertion Sort | O(N)    | O(N²)    | O(N²)   | O(1)   | Yes
Merge Sort     | O(NlogN)| O(NlogN) | O(NlogN)| O(N)   | Yes
Quick Sort     | O(NlogN)| O(NlogN) | O(N²)   | O(logN)| No
Timsort        | O(N)    | O(NlogN) | O(NlogN)| O(N)   | Yes
Counting Sort  | O(N+k)  | O(N+k)   | O(N+k)  | O(k)   | Yes

Stable = equal elements keep their original relative order
k = range of input values (for counting sort)
\`\`\`
`,

  fr: `# Algorithmes de tri

## Pourquoi le tri est important

Le tri semble simple — mettre des choses en ordre. Mais c'est l'un des problèmes les plus étudiés en informatique car :

- **La recherche binaire ne fonctionne que sur des données triées**
- **Trouver des doublons** devient trivial quand les éléments égaux sont adjacents
- **Fusionner des données** de deux sources est rapide quand les deux sont triées

## Le modèle mental : trier une main de cartes

Imaginez que vous triez une main de cartes à jouer :

\`\`\`
Votre main : [7, 2, 9, 4, 1, 5]

Stratégie A — Tri à bulles : comparer les voisins, échanger si mal ordonnés
Stratégie B — Tri par sélection : trouver le plus petit, le mettre en premier
Stratégie C — Tri par insertion : comme trier des cartes dans votre main
Stratégie D — Tri fusion : diviser et conquérir
\`\`\`

## Tri à bulles — Le plus simple (mais le plus lent)

\`\`\`python
def tri_bulles(elements):
    n = len(elements)
    for i in range(n):
        echange = False
        for j in range(0, n - i - 1):
            if elements[j] > elements[j + 1]:
                elements[j], elements[j + 1] = elements[j + 1], elements[j]
                echange = True
        if not echange:
            break    # déjà trié — sortie anticipée
    return elements
\`\`\`

## Tri par insertion — Comme trier des cartes

\`\`\`python
def tri_insertion(elements):
    for i in range(1, len(elements)):
        cle = elements[i]
        j = i - 1
        while j >= 0 and elements[j] > cle:
            elements[j + 1] = elements[j]
            j -= 1
        elements[j + 1] = cle
    return elements

# Excellent pour les petites listes (< 20 éléments) et les données presque triées
\`\`\`

## Tri fusion — Diviser pour régner

\`\`\`python
def tri_fusion(elements):
    if len(elements) <= 1:
        return elements
    mid   = len(elements) // 2
    gauche = tri_fusion(elements[:mid])
    droite = tri_fusion(elements[mid:])
    return fusionner(gauche, droite)

def fusionner(gauche, droite):
    resultat = []
    i = j = 0
    while i < len(gauche) and j < len(droite):
        if gauche[i] <= droite[j]:
            resultat.append(gauche[i]); i += 1
        else:
            resultat.append(droite[j]); j += 1
    resultat.extend(gauche[i:])
    resultat.extend(droite[j:])
    return resultat
\`\`\`

## Le tri intégré de Python — Timsort

\`\`\`python
# Utilisez TOUJOURS le tri intégré de Python — c'est le meilleur choix
nombres = [3, 1, 4, 1, 5, 9, 2, 6]
nombres.sort()                   # tri EN PLACE
copie_triee = sorted(nombres)    # retourne une NOUVELLE liste triée

# Trier avec une clé personnalisée
mots = ["banane", "pomme", "cerise", "datte"]
mots.sort(key=len)               # trier par longueur
\`\`\`

## Résumé : Quand utiliser quel algorithme

\`\`\`
Utilisez sort() intégré de Python → presque toujours (c'est Timsort)
Insertion sort → N < 20, données presque triées
Tri fusion → O(N log N) garanti, tri stable requis
NE JAMAIS utiliser tri à bulles ou sélection en production
\`\`\`
`,
};

export const starterCode = {
  default: `# Sorting Algorithms — Practice
import time
import random

# --- Implement the algorithms ---

def bubble_sort(items):
    items = items.copy()   # don't modify original
    n = len(items)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
                swapped = True
        if not swapped:
            break
    return items

def insertion_sort(items):
    items = items.copy()
    for i in range(1, len(items)):
        key = items[i]
        j = i - 1
        while j >= 0 and items[j] > key:
            items[j + 1] = items[j]
            j -= 1
        items[j + 1] = key
    return items

def merge_sort(items):
    if len(items) <= 1:
        return items
    mid   = len(items) // 2
    left  = merge_sort(items[:mid])
    right = merge_sort(items[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# --- Test correctness ---
test = [64, 25, 12, 22, 11, 90, 3, 47]
print(f"Original:       {test}")
print(f"Bubble sort:    {bubble_sort(test)}")
print(f"Insertion sort: {insertion_sort(test)}")
print(f"Merge sort:     {merge_sort(test)}")
print(f"Built-in sort:  {sorted(test)}")

# --- Compare performance ---
data = [random.randint(1, 10000) for _ in range(2000)]

algorithms = [
    ("Bubble Sort",    bubble_sort),
    ("Insertion Sort", insertion_sort),
    ("Merge Sort",     merge_sort),
    ("Built-in sort",  sorted),
]

print("\\nPerformance on 2,000 random numbers:")
for name, fn in algorithms:
    start = time.time()
    result = fn(data)
    elapsed = (time.time() - start) * 1000
    print(f"  {name:<18} {elapsed:.2f}ms")
`,
};

export const exerciseEn = `Sorting challenge: implement and analyze.

1. Implement quick_sort(items) using the partition approach shown in the lesson.

2. Implement counting_sort(items) for a list of grades (0-100).

3. Write a function 'sort_students(students)' that takes a list of dicts:
   [{"name": "Alice", "gpa": 3.8, "age": 20}, ...]
   and returns them sorted by GPA descending, then by name ascending
   for ties. Use Python's built-in sort with a key function.

4. Time quick_sort vs merge_sort vs sorted() on:
   - Random data (1,000 items)
   - Already sorted data (1,000 items)
   - Reverse sorted data (1,000 items)
   What do you notice about quick_sort on already-sorted data?`;

export const exerciseFr = `Défi de tri : implémenter et analyser.

1. Implémentez tri_rapide(elements) avec l'approche de partition.

2. Implémentez tri_comptage(elements) pour une liste de notes (0-100).

3. Écrivez 'trier_etudiants(etudiants)' qui prend une liste de dicts :
   [{"nom": "Alice", "moy": 3.8, "age": 20}, ...]
   et les retourne triés par moyenne décroissante, puis par nom croissant.

4. Chronométrez tri_rapide vs tri_fusion vs sorted() sur :
   - Données aléatoires (1 000 éléments)
   - Données déjà triées (1 000 éléments)
   - Données triées à l'envers (1 000 éléments)`;

export const solutionCode = {
  default: `import time, random

def quick_sort(items):
    if len(items) <= 1:
        return items
    pivot  = items[len(items) // 2]
    left   = [x for x in items if x <  pivot]
    middle = [x for x in items if x == pivot]
    right  = [x for x in items if x >  pivot]
    return quick_sort(left) + middle + quick_sort(right)

def counting_sort(items):
    if not items: return []
    max_val = max(items)
    counts  = [0] * (max_val + 1)
    for item in items:
        counts[item] += 1
    result = []
    for value, count in enumerate(counts):
        result.extend([value] * count)
    return result

def sort_students(students):
    return sorted(students, key=lambda s: (-s["gpa"], s["name"]))

# Test
grades = [85, 72, 99, 45, 85, 72, 60, 99, 45, 85]
print(f"Counting sort: {counting_sort(grades)}")

students = [
    {"name": "Charlie", "gpa": 3.8, "age": 21},
    {"name": "Alice",   "gpa": 3.9, "age": 20},
    {"name": "Bob",     "gpa": 3.8, "age": 22},
    {"name": "Diana",   "gpa": 4.0, "age": 19},
]
for s in sort_students(students):
    print(f"  {s['name']}: {s['gpa']}")

# Performance comparison
scenarios = {
    "Random":          [random.randint(1,10000) for _ in range(1000)],
    "Already sorted":  list(range(1000)),
    "Reverse sorted":  list(range(1000, 0, -1)),
}

for scenario, data in scenarios.items():
    print(f"\\n{scenario}:")
    for name, fn in [("quick_sort", quick_sort), ("merge_sort", lambda x: x), ("sorted", sorted)]:
        start   = time.time()
        result  = fn(data.copy()) if name != "sorted" else sorted(data)
        elapsed = (time.time() - start) * 1000
        print(f"  {name:<12} {elapsed:.2f}ms")
`,
};

export const quiz = {
  en: [
    {
      question:
        "Bubble sort has an early-exit optimization using a 'swapped' flag. What does this achieve?",
      options: [
        "It makes bubble sort O(N log N) for all inputs",
        "If a complete pass makes no swaps, the list is already sorted and the algorithm exits early — giving O(N) best-case performance for already-sorted input instead of always doing O(N²) work",
        "It reduces memory usage by avoiding unnecessary comparisons",
        "It allows bubble sort to sort in reverse order automatically",
      ],
      correct: 1,
    },
    {
      question:
        "Why is merge sort considered more reliable than quick sort for production use?",
      options: [
        "Merge sort uses less memory than quick sort",
        "Merge sort is guaranteed O(N log N) in ALL cases — best, average, and worst. Quick sort degrades to O(N²) on already-sorted input with a naive pivot choice. For critical systems where worst-case matters, merge sort's guarantee is more valuable.",
        "Merge sort is easier to implement correctly",
        "Quick sort cannot handle duplicate values",
      ],
      correct: 1,
    },
    {
      question:
        "What makes Python's Timsort particularly fast on real-world data?",
      options: [
        "It uses a special hardware instruction not available to other algorithms",
        "Timsort detects naturally occurring sorted 'runs' in the data and exploits them. Real data often has partially sorted sections (e.g. log files, time-series data). It uses insertion sort for small chunks and merge sort for large ones — combining the best of both.",
        "It sorts data in parallel using multiple CPU cores",
        "It uses counting sort internally for integer data",
      ],
      correct: 1,
    },
    {
      question:
        "When is counting sort the right choice over comparison-based sorting?",
      options: [
        "When the list has more than 1,000 elements",
        "When the data consists of integers within a known, bounded range — counting sort runs in O(N + k) where k is the range size, which beats O(N log N) when k is small. For example, sorting exam scores (0-100) or ages (0-150).",
        "When the data is already partially sorted",
        "When you need a stable sort that preserves order of equal elements",
      ],
      correct: 1,
    },
    {
      question:
        "You need to sort a list of user objects by last name, then by first name for ties. What is the most Pythonic approach?",
      options: [
        "Write a custom bubble sort that compares two fields",
        "Use sorted(users, key=lambda u: (u.last_name, u.first_name)) — Python's sort is stable and accepts a tuple key, sorting primarily by last_name and secondarily by first_name for ties, all in O(N log N)",
        "Sort by first name first, then sort by last name",
        "Use a dictionary to group users by last name first",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Le tri à bulles a une optimisation de sortie anticipée avec un flag 'echange'. Qu'est-ce que cela accomplit ?",
      options: [
        "Cela rend le tri à bulles O(N log N) pour toutes les entrées",
        "Si un passage complet ne fait aucun échange, la liste est déjà triée et l'algorithme se termine tôt — donnant une performance O(N) dans le meilleur cas pour les entrées déjà triées au lieu de toujours faire O(N²) de travail",
        "Cela réduit l'utilisation mémoire en évitant les comparaisons inutiles",
        "Cela permet au tri à bulles de trier automatiquement en ordre inverse",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi le tri fusion est-il considéré plus fiable que le tri rapide pour une utilisation en production ?",
      options: [
        "Le tri fusion utilise moins de mémoire que le tri rapide",
        "Le tri fusion est garanti O(N log N) dans TOUS les cas — meilleur, moyen et pire. Le tri rapide se dégrade en O(N²) sur des entrées déjà triées avec un mauvais choix de pivot.",
        "Le tri fusion est plus facile à implémenter correctement",
        "Le tri rapide ne peut pas gérer les valeurs en double",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce qui rend Timsort de Python particulièrement rapide sur des données réelles ?",
      options: [
        "Il utilise une instruction matérielle spéciale non disponible pour d'autres algorithmes",
        "Timsort détecte les 'runs' naturellement ordonnés dans les données et les exploite. Les données réelles ont souvent des sections partiellement triées. Il utilise le tri par insertion pour les petits morceaux et le tri fusion pour les grands.",
        "Il trie les données en parallèle sur plusieurs cœurs CPU",
        "Il utilise le tri par comptage en interne pour les données entières",
      ],
      correct: 1,
    },
    {
      question:
        "Quand le tri par comptage est-il le bon choix par rapport au tri basé sur les comparaisons ?",
      options: [
        "Quand la liste a plus de 1 000 éléments",
        "Quand les données sont des entiers dans une plage connue et bornée — le tri par comptage s'exécute en O(N + k) où k est la taille de la plage, ce qui bat O(N log N) quand k est petit.",
        "Quand les données sont déjà partiellement triées",
        "Quand vous avez besoin d'un tri stable",
      ],
      correct: 1,
    },
    {
      question:
        "Vous devez trier une liste d'objets utilisateur par nom de famille, puis par prénom pour les égalités. Quelle est l'approche la plus Pythonique ?",
      options: [
        "Écrire un tri à bulles personnalisé qui compare deux champs",
        "Utiliser sorted(users, key=lambda u: (u.nom_famille, u.prenom)) — le tri de Python est stable et accepte une clé tuple, triant d'abord par nom_famille puis par prenom pour les égalités, le tout en O(N log N)",
        "Trier d'abord par prénom, puis trier par nom de famille",
        "Utiliser un dictionnaire pour regrouper les utilisateurs par nom de famille",
      ],
      correct: 1,
    },
  ],
};
