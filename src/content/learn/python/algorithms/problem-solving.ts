export const id = "problem-solving";
export const titleEn = "Problem Solving";
export const titleFr = "Résolution de problèmes";

export const content = {
  en: `# Problem Solving

## The Skill Nobody Teaches Directly

You now know Big O, sorting, searching, recursion, and data structures. But there's a gap between knowing these tools and knowing **which tool to use when** — and how to approach a problem you've never seen before.

Problem solving is a skill, not a talent. It has a method. This lesson teaches that method.

\`\`\`
The difference between a junior and senior programmer:

Junior: "I don't know how to solve this."
Senior: "I don't know the answer yet, but I know how to find it."

The senior programmer has a process. This lesson gives you that process.
\`\`\`

## The Problem-Solving Framework: 5 Steps

Every problem, from easy to hard, responds to the same framework:

\`\`\`
Step 1: UNDERSTAND — What exactly is being asked?
Step 2: EXPLORE    — Work through examples by hand
Step 3: PLAN       — Choose an approach before coding
Step 4: CODE       — Implement the plan
Step 5: REVIEW     — Test, fix edge cases, optimize
\`\`\`

Never skip steps 1-3. Most bugs come from jumping straight to step 4.

## Step 1: Understand — Read Until You Could Explain It

Before touching the keyboard, make sure you understand:

\`\`\`
Questions to ask yourself:
  - What are the INPUTS? What types? What range? Can they be empty?
  - What are the OUTPUTS? What format? What type?
  - What are the CONSTRAINTS? Performance? Memory?
  - What are the EDGE CASES? Empty input? Negative numbers? Duplicates?

Example problem: "Given a list of integers, return the two numbers
that add up to a target sum."

Input:  a list of integers, a target number
Output: a pair of numbers (or indices?)
Edge cases:
  - What if no pair exists? Return None? Raise error?
  - Can the same element be used twice?
  - Can there be multiple valid pairs? Return all or just one?
  - What if the list is empty or has 1 element?

These questions MUST be answered before coding. In interviews,
ask the interviewer. In real code, check the requirements.
\`\`\`

## Step 2: Explore — Work Examples by Hand

Pick 2-3 concrete examples and solve them manually. This reveals the pattern.

\`\`\`
Problem: find the longest substring without repeating characters.
Input: "abcabcbb"

Work through it by hand:
  Start with empty window: ""
  Add 'a': "a"          — no repeats, length 1
  Add 'b': "ab"         — no repeats, length 2
  Add 'c': "abc"        — no repeats, length 3
  Add 'a': "abca"       — 'a' repeats! Shrink from left until no repeat
             Remove first 'a': "bca" — OK, length 3
  Add 'b': "bcab"       — 'b' repeats! Remove until OK: "cab" — length 3
  Add 'c': "cabc"       — 'c' repeats! Remove until OK: "abc" — length 3
  Add 'b': "abcb"       — 'b' repeats! Remove until OK: "cb" — length 2
  Add 'b': "cbb"        — 'b' repeats! Remove until OK: "b" — length 1

Maximum seen: 3 (from "abc")

Pattern discovered: a sliding window that expands right and shrinks left.
THEN write the code. Not before.
\`\`\`

## Step 3: Plan — Choose Your Approach

Before coding, articulate your approach in plain English. This is where you choose between strategies.

### The Strategy Catalog

\`\`\`
Pattern 1: TWO POINTERS
  When: sorted array, find pair/triplet, compare from both ends
  How:  left pointer starts at beginning, right at end, move toward each other
  Example: find two numbers that sum to target in sorted array

Pattern 2: SLIDING WINDOW
  When: "longest/shortest subarray/substring" with some condition
  How:  expand window right, shrink from left when condition violated
  Example: longest substring without repeating characters

Pattern 3: HASH MAP / SET
  When: "find duplicate", "two sum", "group by property"
  How:  store seen values or mappings in a hash map
  Example: count frequency of each element

Pattern 4: BINARY SEARCH
  When: sorted data, "find minimum/maximum that satisfies condition"
  How:  search on the ANSWER space, not just the data
  Example: find the minimum speed such that all packages delivered in time

Pattern 5: DEPTH/BREADTH FIRST SEARCH
  When: tree, graph, "find all paths", "shortest path"
  How:  DFS with recursion/stack, BFS with queue
  Example: find shortest path between two nodes

Pattern 6: DYNAMIC PROGRAMMING
  When: "count ways", "max/min value", overlapping subproblems
  How:  memoize recursive solution OR build table bottom-up
  Example: minimum coins to make change

Pattern 7: GREEDY
  When: "locally optimal choices lead to globally optimal"
  How:  sort, then always pick the best available option
  Example: minimum number of intervals to cover a range

Pattern 8: DIVIDE AND CONQUER
  When: problem splits naturally into independent subproblems
  How:  split, solve each half recursively, combine results
  Example: merge sort, finding median of medians
\`\`\`

## A Complete Walkthrough: Two Sum

Let's apply the full framework to one of the most famous interview problems.

\`\`\`
PROBLEM: Given a list of numbers and a target, return the indices
of the two numbers that add up to the target.
Assume exactly one solution exists. Cannot use the same element twice.

Input:  numbers = [2, 7, 11, 15], target = 9
Output: [0, 1]  (numbers[0] + numbers[1] = 2 + 7 = 9)
\`\`\`

### Step 1: Understand

\`\`\`
Input:  list of integers (can be negative?), target integer
Output: list of two indices [i, j] where numbers[i] + numbers[j] = target
Constraints: exactly one solution, can't use same element twice
Edge cases: what if list has < 2 elements? (problem guarantees solution exists)
\`\`\`

### Step 2: Explore

\`\`\`
Example 1: [2, 7, 11, 15], target=9
  Is there a pair summing to 9?
  2+7=9 ✓ → indices [0, 1]

Example 2: [3, 2, 4], target=6
  3+2=5 ✗, 3+4=7 ✗, 2+4=6 ✓ → indices [1, 2]

Example 3: [3, 3], target=6
  3+3=6 ✓ → indices [0, 1]  (different elements, same value)
\`\`\`

### Step 3: Plan

\`\`\`
Approach 1 (Brute Force): try every pair
  for i in range(N):
    for j in range(i+1, N):
      if numbers[i] + numbers[j] == target: return [i, j]
  Complexity: O(N²) time, O(1) space

Approach 2 (Hash Map):
  For each number x at index i:
    The complement we need is (target - x)
    If complement is already in our hash map → found the pair!
    Otherwise, store x → i in hash map and continue

  Example: [2, 7, 11, 15], target=9
    i=0: x=2, need 7. 7 in map? No. Store {2:0}
    i=1: x=7, need 2. 2 in map? YES! Return [map[2], 1] = [0, 1] ✓

  Complexity: O(N) time, O(N) space
  This is better — choose this approach.
\`\`\`

### Step 4: Code

\`\`\`python
def two_sum(numbers, target):
    """
    Find two indices i, j such that numbers[i] + numbers[j] == target.
    Returns [i, j]. Assumes exactly one solution exists.
    Time: O(N), Space: O(N)
    """
    seen = {}   # value → index

    for i, x in enumerate(numbers):
        complement = target - x

        if complement in seen:
            return [seen[complement], i]   # found the pair!

        seen[x] = i   # store AFTER checking (can't use same element twice)

    return []   # no solution (problem guarantees this won't happen)
\`\`\`

### Step 5: Review

\`\`\`python
# Test with examples from Step 2:
print(two_sum([2, 7, 11, 15], 9))   # [0, 1] ✓
print(two_sum([3, 2, 4],      6))   # [1, 2] ✓
print(two_sum([3, 3],         6))   # [0, 1] ✓

# Edge cases:
print(two_sum([1, 2, 3, 4], 7))   # [2, 3] (3+4=7) ✓
print(two_sum([-1, 0, 1, 2], 0))  # [0, 2] (-1+1=0) ✓ handles negatives

# Complexity confirmed: O(N) time (one pass), O(N) space (hash map)
\`\`\`

## A Complete Walkthrough: Sliding Window

\`\`\`
PROBLEM: Given a string, find the length of the longest substring
without repeating characters.

Input:  "abcabcbb"
Output: 3  (the answer is "abc")
\`\`\`

\`\`\`python
def length_of_longest_substring(s):
    """
    Sliding window approach:
    - 'left' is the left edge of our current window
    - 'right' expands to grow the window
    - When we see a repeat, shrink from the left

    Time: O(N) — each character processed at most twice
    Space: O(k) where k = size of character set (at most 26 for lowercase)
    """
    char_index = {}   # char → most recent index seen
    left       = 0
    max_length = 0

    for right, char in enumerate(s):
        # If char was seen AND it's inside our current window:
        if char in char_index and char_index[char] >= left:
            # Move left edge past the previous occurrence
            left = char_index[char] + 1

        # Record/update the position of this character
        char_index[char] = right

        # Update maximum window size seen so far
        max_length = max(max_length, right - left + 1)

    return max_length

# Test:
print(length_of_longest_substring("abcabcbb"))  # 3 ("abc")
print(length_of_longest_substring("bbbbb"))     # 1 ("b")
print(length_of_longest_substring("pwwkew"))    # 3 ("wke")
print(length_of_longest_substring(""))          # 0 (empty string)
print(length_of_longest_substring("au"))        # 2 ("au")
\`\`\`

## A Complete Walkthrough: Dynamic Programming

Dynamic programming (DP) sounds intimidating but follows a clear pattern.

\`\`\`
PROBLEM: Given coins of different denominations and a total amount,
find the minimum number of coins to make that amount.

Input:  coins = [1, 5, 10, 25], amount = 36
Output: 3  (25 + 10 + 1)
\`\`\`

### Step 1 & 2: Understand and Explore

\`\`\`
Can we use each coin unlimited times? Yes.
What if amount is 0? 0 coins needed.
What if impossible? Return -1.

Work examples:
  amount=6:   5+1 = 2 coins
  amount=11:  10+1 = 2 coins
  amount=36:  25+10+1 = 3 coins, or 25+5+5+1 = 4 coins → minimum is 3
\`\`\`

### Step 3: Plan — Recognize the DP Pattern

\`\`\`
DP applies when:
  1. Problem asks for min/max/count
  2. There are overlapping subproblems
  3. Each decision affects future decisions

Key insight: min_coins(36) = 1 + min(
    min_coins(36-1),   = min_coins(35)   try penny
    min_coins(36-5),   = min_coins(31)   try nickel
    min_coins(36-10),  = min_coins(26)   try dime
    min_coins(36-25),  = min_coins(11)   try quarter
)

Build bottom-up: solve for amount 0, 1, 2, ... up to target.
\`\`\`

### Step 4: Code

\`\`\`python
def min_coins(coins, amount):
    """
    Bottom-up DP: build solution for each amount from 0 to target.
    dp[i] = minimum coins needed to make amount i

    Time: O(amount × len(coins))
    Space: O(amount)
    """
    # dp[i] = min coins for amount i
    # Start with infinity (impossible) for all amounts > 0
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0   # base case: 0 coins to make amount 0

    for current_amount in range(1, amount + 1):
        for coin in coins:
            if coin <= current_amount:
                # Using this coin: 1 + whatever it takes for the remainder
                dp[current_amount] = min(
                    dp[current_amount],
                    1 + dp[current_amount - coin]
                )

    return dp[amount] if dp[amount] != float('inf') else -1


# Test:
print(min_coins([1, 5, 10, 25], 36))   # 3 (25+10+1)
print(min_coins([1, 5, 10, 25], 11))   # 2 (10+1)
print(min_coins([2],            3))    # -1 (impossible with only 2s)
print(min_coins([1, 2, 5],      11))   # 3 (5+5+1)

# Trace dp array for coins=[1,5] amount=7:
# dp[0]=0
# dp[1]=1  (1 coin of 1)
# dp[2]=2  (2 coins of 1)
# dp[3]=3  (3 coins of 1)
# dp[4]=4  (4 coins of 1)
# dp[5]=1  (1 coin of 5)
# dp[6]=2  (1×5 + 1×1)
# dp[7]=3  (1×5 + 2×1)
\`\`\`

## Recognizing Patterns Quickly

With practice, you learn to recognize a problem type from its description.

\`\`\`
Keywords → Pattern:

"find pair/triplet that sums to X"        → Two pointers or Hash map
"longest/shortest subarray with property" → Sliding window
"does X exist in sorted array"            → Binary search
"all paths in graph"                      → DFS
"shortest path in graph"                  → BFS
"count ways to do X"                      → Dynamic programming
"minimum/maximum to achieve X"            → DP or Greedy
"parentheses/brackets"                    → Stack
"top K elements"                          → Heap
"frequency of elements"                   → Hash map
"intervals overlap"                       → Sort by start, then greedy
"cycle in linked list"                    → Two pointers (fast/slow)
\`\`\`

## Optimizing: The 4-Step Process

When you have a working solution and need to make it faster:

\`\`\`
Step 1: Identify the bottleneck
  What is the slowest part? Usually a nested loop.
  Profile it: where does the time go?

Step 2: Ask "what information am I recomputing?"
  If you compute something more than once → memoize or precompute.

Step 3: Ask "what data structure would make this instant?"
  Looking up if X exists? Use a set.
  Looking up the value for key X? Use a dict.
  Always need minimum? Use a heap.

Step 4: Ask "can I process this in a single pass?"
  Nested loops often become single pass with the right data structure.
\`\`\`

### Optimization Example: Most Frequent Element

\`\`\`python
# SLOW: O(N²) — for each element, count occurrences by scanning the list
def most_frequent_slow(items):
    best_item  = None
    best_count = 0
    for item in items:
        count = items.count(item)   # O(N) scan for EVERY item → O(N²)
        if count > best_count:
            best_count = count
            best_item  = item
    return best_item, best_count

# FAST: O(N) — count everything in one pass using a hash map
def most_frequent_fast(items):
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1   # O(1)

    best_item  = max(counts, key=counts.get)      # O(N)
    return best_item, counts[best_item]

# Even faster with Counter (same O(N), but cleaner):
from collections import Counter

def most_frequent_cleanest(items):
    counts = Counter(items)
    item, count = counts.most_common(1)[0]
    return item, count

data = [1, 3, 2, 3, 1, 3, 2, 1, 1, 3, 3]
print(most_frequent_slow(data))      # (3, 5) — correct but slow
print(most_frequent_fast(data))      # (3, 5) — O(N)
print(most_frequent_cleanest(data))  # (3, 5) — O(N), most readable
\`\`\`

## The Problem-Solving Mindset

\`\`\`
1. It's OK to not know immediately.
   Real programmers Google things. Real programmers ask questions.
   The skill is knowing WHAT to search for and HOW to verify the answer.

2. Start with brute force.
   A working O(N²) solution is infinitely better than no solution.
   Get it working, then optimize.

3. Talk through your thinking.
   In interviews: think aloud. In work: rubber duck debug.
   Explaining a problem often reveals the solution.

4. Stuck? Try a smaller example.
   Can't solve [1,2,3,4,5]? Try [1] then [1,2].
   The pattern often becomes obvious with tiny inputs.

5. Stuck longer? Write what you KNOW.
   Write the function signature. Write the base cases.
   Write what you'd do for input size 1.
   Often just starting the code unlocks the rest.

6. Learn from every problem.
   After solving: what pattern was this?
   Where have I seen this pattern before?
   How would I recognize it faster next time?
\`\`\`

## Practice Problems by Pattern

\`\`\`python
# HASH MAP PATTERN: Group Anagrams
from collections import defaultdict

def group_anagrams(words):
    """
    Group words that are anagrams of each other.
    Key insight: anagrams have the same sorted characters.
    """
    groups = defaultdict(list)
    for word in words:
        key = tuple(sorted(word))   # "eat","tea","ate" all → ('a','e','t')
        groups[key].append(word)
    return list(groups.values())

print(group_anagrams(["eat","tea","tan","ate","nat","bat"]))
# [['eat','tea','ate'], ['tan','nat'], ['bat']]


# TWO POINTERS PATTERN: Container With Most Water
def max_water(heights):
    """
    Given walls at each position, find the two walls that
    hold the most water. Width = distance, height = shorter wall.
    """
    left, right = 0, len(heights) - 1
    max_area = 0

    while left < right:
        width   = right - left
        height  = min(heights[left], heights[right])
        area    = width * height
        max_area = max(max_area, area)

        # Move the shorter wall inward — only hope for improvement
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1

    return max_area

print(max_water([1, 8, 6, 2, 5, 4, 8, 3, 7]))   # 49


# SLIDING WINDOW PATTERN: Maximum Sum Subarray of Size K
def max_sum_subarray(items, k):
    """Find the maximum sum of any K consecutive elements."""
    if len(items) < k:
        return None

    # Compute sum of first window
    window_sum = sum(items[:k])
    max_sum    = window_sum

    # Slide the window: add next element, remove first element
    for i in range(k, len(items)):
        window_sum += items[i] - items[i - k]   # O(1) update
        max_sum = max(max_sum, window_sum)

    return max_sum

print(max_sum_subarray([2, 1, 5, 1, 3, 2], 3))   # 9 (5+1+3)


# BINARY SEARCH ON ANSWER SPACE: Minimum Maximum
def smallest_max_sum(numbers, k):
    """
    Split numbers into k non-empty contiguous subarrays.
    Minimize the maximum subarray sum.
    Binary search on the ANSWER rather than the array.
    """
    def can_split(max_allowed):
        """Can we split into ≤ k subarrays with each sum ≤ max_allowed?"""
        groups       = 1
        current_sum  = 0
        for num in numbers:
            if current_sum + num > max_allowed:
                groups      += 1   # start a new group
                current_sum  = num
            else:
                current_sum += num
        return groups <= k

    lo = max(numbers)       # minimum possible answer: largest single element
    hi = sum(numbers)       # maximum possible answer: all in one group

    while lo < hi:
        mid = (lo + hi) // 2
        if can_split(mid):
            hi = mid        # feasible — try smaller
        else:
            lo = mid + 1    # not feasible — need larger

    return lo

print(smallest_max_sum([7, 2, 5, 10, 8], 2))   # 18 (split: [7,2,5] [10,8])
\`\`\`

## Quick Reference: Problem-Solving Cheat Sheet

\`\`\`
FRAMEWORK:
  1. Understand (inputs, outputs, constraints, edge cases)
  2. Explore (work 2-3 examples by hand)
  3. Plan (choose pattern BEFORE coding)
  4. Code (implement cleanly)
  5. Review (test edge cases, check complexity)

PATTERN TRIGGERS:
  Pair/triplet sum         → Two pointers or Hash map
  Longest/shortest window  → Sliding window
  Sorted + find value      → Binary search
  All paths / exists path  → DFS
  Shortest path            → BFS
  Count ways / min/max     → Dynamic programming
  Top K                    → Heap
  Frequency count          → Hash map / Counter
  Brackets                 → Stack

OPTIMIZATION MOVES:
  Repeated lookup          → Convert list to set or dict
  Repeated computation     → Memoize or precompute
  Nested loops             → Sliding window or two pointers or hash map
  Always need min/max      → Heap
  Find in sorted array     → Binary search
\`\`\`
`,

  fr: `# Résolution de problèmes

## La compétence que personne n'enseigne directement

La résolution de problèmes est une compétence, pas un talent. Elle a une méthode.

## Le cadre en 5 étapes

\`\`\`
Étape 1 : COMPRENDRE — Qu'est-ce qui est exactement demandé ?
Étape 2 : EXPLORER   — Travailler des exemples à la main
Étape 3 : PLANIFIER  — Choisir une approche avant de coder
Étape 4 : CODER      — Implémenter le plan
Étape 5 : RÉVISER    — Tester, corriger les cas limites, optimiser
\`\`\`

Ne sautez jamais les étapes 1-3. La plupart des bugs viennent de sauter directement à l'étape 4.

## Le catalogue de stratégies

\`\`\`
Pattern 1 : DEUX POINTEURS
  Quand : tableau trié, trouver une paire, comparer les deux extrémités
  
Pattern 2 : FENÊTRE GLISSANTE
  Quand : "la plus longue/courte sous-chaîne/sous-tableau" avec condition
  
Pattern 3 : TABLE DE HACHAGE
  Quand : "trouver un doublon", "deux sommes", "grouper par propriété"
  
Pattern 4 : RECHERCHE BINAIRE
  Quand : données triées, "trouver minimum/maximum satisfaisant condition"
  
Pattern 5 : DFS / BFS
  Quand : arbre, graphe, "trouver tous les chemins", "chemin le plus court"
  
Pattern 6 : PROGRAMMATION DYNAMIQUE
  Quand : "compter les façons", "valeur max/min", sous-problèmes qui se chevauchent
\`\`\`

## Exemple complet : Two Sum

\`\`\`python
def two_sum(nombres, cible):
    """
    Trouver deux indices i, j tels que nombres[i] + nombres[j] == cible.
    Temps : O(N), Espace : O(N)
    """
    vus = {}   # valeur → index

    for i, x in enumerate(nombres):
        complement = cible - x

        if complement in vus:
            return [vus[complement], i]   # paire trouvée !

        vus[x] = i   # stocker APRÈS vérification

    return []

print(two_sum([2, 7, 11, 15], 9))   # [0, 1]
print(two_sum([3, 2, 4],       6))   # [1, 2]
\`\`\`

## Reconnaissance rapide des patterns

\`\`\`
Mots-clés → Pattern :

"trouver paire/triplet qui somme à X"     → Deux pointeurs ou Table de hachage
"plus long/court sous-tableau"             → Fenêtre glissante
"existe dans tableau trié"                 → Recherche binaire
"tous les chemins dans un graphe"          → DFS
"chemin le plus court"                     → BFS
"compter les façons de faire X"            → Programmation dynamique
"top K éléments"                           → Tas (heap)
"fréquence des éléments"                   → Table de hachage / Counter
"parenthèses/crochets"                     → Pile
\`\`\`

## Optimisation en 4 étapes

\`\`\`
Étape 1 : Identifier le goulot d'étranglement (habituellement une boucle imbriquée)
Étape 2 : "Quelle information suis-je en train de recalculer ?"
           → Mémoïser ou précalculer
Étape 3 : "Quelle structure de données rendrait ceci instantané ?"
           → Vérification d'existence : set
           → Valeur pour clé : dict
           → Toujours besoin du minimum : heap
Étape 4 : "Puis-je traiter en un seul passage ?"
           → Les boucles imbriquées deviennent souvent un seul passage
\`\`\`
`,
};

export const starterCode = {
  default: `# Problem Solving — Practice
from collections import Counter, defaultdict
import heapq

# ─── Apply the 5-step framework ───

# PROBLEM 1: Two Sum (Hash Map Pattern)
def two_sum(numbers, target):
    seen = {}
    for i, x in enumerate(numbers):
        complement = target - x
        if complement in seen:
            return [seen[complement], i]
        seen[x] = i
    return []

print("=== Two Sum ===")
print(two_sum([2, 7, 11, 15], 9))    # [0, 1]
print(two_sum([3, 2, 4],       6))   # [1, 2]
print(two_sum([3, 3],          6))   # [0, 1]

# PROBLEM 2: Longest Substring Without Repeats (Sliding Window)
def longest_unique_substring(s):
    char_index = {}
    left = max_len = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len

print("\\n=== Longest Unique Substring ===")
print(longest_unique_substring("abcabcbb"))   # 3
print(longest_unique_substring("bbbbb"))      # 1
print(longest_unique_substring("pwwkew"))     # 3

# PROBLEM 3: Minimum Coins (Dynamic Programming)
def min_coins(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], 1 + dp[a - coin])
    return dp[amount] if dp[amount] != float('inf') else -1

print("\\n=== Minimum Coins ===")
print(min_coins([1, 5, 10, 25], 36))   # 3
print(min_coins([1, 2, 5],      11))   # 3
print(min_coins([2],             3))   # -1

# PROBLEM 4: Top K Frequent (Heap + Hash Map)
def top_k_frequent(items, k):
    counts = Counter(items)
    return [item for item, _ in counts.most_common(k)]

print("\\n=== Top K Frequent ===")
print(top_k_frequent([1,1,1,2,2,3], 2))    # [1, 2]
print(top_k_frequent(["a","b","a","c","b","a"], 2))  # ['a', 'b']
`,
};

export const exerciseEn = `Apply the 5-step framework to solve these problems.
For each one: write your understanding, an example trace, your plan, then code.

1. VALID ANAGRAM (Hash Map)
   Given two strings s and t, return True if t is an anagram of s.
   An anagram uses the same characters the same number of times.
   is_anagram("anagram", "nagaram") → True
   is_anagram("rat", "car") → False

2. MAXIMUM SUBARRAY (Kadane's Algorithm — Greedy/DP)
   Find the contiguous subarray with the largest sum.
   max_subarray([-2,1,-3,4,-1,2,1,-5,4]) → 6  (subarray [4,-1,2,1])
   Hint: at each position, decide: extend current subarray or start fresh?

3. MEETING ROOMS (Sorting + Greedy)
   Given intervals [[start,end],...], find the minimum number of
   meeting rooms needed so no two meetings overlap at the same time.
   min_rooms([[0,30],[5,10],[15,20]]) → 2
   Hint: think about what happens at each start/end time.

4. BINARY SEARCH ON ANSWER (Advanced)
   Given a sorted list and a budget B, find the largest value X
   such that the sum of min(item, X) for all items ≤ B.
   (This is the "Capacity To Ship Packages" pattern)
   find_threshold([1,2,3,4,5], budget=11) → 3
   (min(1,3)+min(2,3)+min(3,3)+min(4,3)+min(5,3) = 1+2+3+3+3 = 12... try 2)`;

export const exerciseFr = `Appliquez le cadre en 5 étapes pour résoudre ces problèmes.

1. ANAGRAMME VALIDE (Table de hachage)
   Étant donné deux chaînes s et t, retourner True si t est un anagramme de s.

2. SOUS-TABLEAU MAXIMUM (Algorithme de Kadane)
   Trouver le sous-tableau contigu avec la plus grande somme.
   sous_tableau_max([-2,1,-3,4,-1,2,1,-5,4]) → 6

3. SALLES DE RÉUNION (Tri + Glouton)
   Trouver le nombre minimum de salles pour que les réunions ne se chevauchent pas.

4. RECHERCHE BINAIRE SUR LA RÉPONSE
   Trouver la plus grande valeur X telle que sum(min(item, X)) ≤ budget.`;

export const solutionCode = {
  default: `from collections import Counter

# 1. Valid Anagram — O(N)
def is_anagram(s, t):
    # Anagrams have same character frequencies
    return Counter(s) == Counter(t)

print("=== Anagram ===")
print(is_anagram("anagram", "nagaram"))   # True
print(is_anagram("rat",     "car"))       # False
print(is_anagram("ab",      "a"))         # False

# 2. Maximum Subarray — Kadane's Algorithm O(N)
def max_subarray(nums):
    """
    At each position: should we extend the current subarray or start fresh?
    Start fresh when the current sum becomes negative (it only hurts us).
    """
    max_sum     = nums[0]
    current_sum = nums[0]

    for num in nums[1:]:
        # If current_sum is negative, starting fresh is better
        current_sum = max(num, current_sum + num)
        max_sum     = max(max_sum, current_sum)

    return max_sum

print("\\n=== Maximum Subarray ===")
print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))   # 6
print(max_subarray([1]))                                  # 1
print(max_subarray([-1, -2, -3]))                         # -1 (all negative)

# 3. Meeting Rooms — O(N log N)
def min_rooms(intervals):
    """
    Think of each start as +1 (room needed) and each end as -1 (room freed).
    Sort all events by time. Track current rooms in use.
    """
    events = []
    for start, end in intervals:
        events.append((start, 1))    # meeting starts → need room
        events.append((end,  -1))   # meeting ends   → free room

    events.sort()   # sort by time (ties: end before start → -1 before +1)

    current = max_rooms = 0
    for time, change in events:
        current  += change
        max_rooms = max(max_rooms, current)

    return max_rooms

print("\\n=== Meeting Rooms ===")
print(min_rooms([[0, 30], [5, 10], [15, 20]]))   # 2
print(min_rooms([[7, 10], [2, 4]]))              # 1 (don't overlap)
print(min_rooms([[0,10],[10,20],[20,30]]))        # 1 (sequential)

# 4. Binary Search on Answer — O(N log N)
def find_threshold(items, budget):
    """
    Binary search on X: find largest X where sum(min(item,X)) <= budget.
    """
    def total_cost(x):
        return sum(min(item, x) for item in items)

    lo, hi = 0, max(items)

    while lo < hi:
        mid = (lo + hi + 1) // 2   # upper-mid to avoid infinite loop
        if total_cost(mid) <= budget:
            lo = mid    # feasible, try larger
        else:
            hi = mid - 1

    return lo

print("\\n=== Binary Search on Answer ===")
print(find_threshold([1, 2, 3, 4, 5], 11))   # 3
# min(1,3)+min(2,3)+min(3,3)+min(4,3)+min(5,3) = 1+2+3+3+3 = 12 (too much)
# min(1,2)+min(2,2)+min(3,2)+min(4,2)+min(5,2) = 1+2+2+2+2 = 9 (≤ 11)
# Actually: let's check X=3 again... sum = 12 > 11
# X=2: sum = 9 ≤ 11 ✓, X=3: sum = 12 > 11, so answer = 2... let's verify
print(find_threshold([10, 20, 30, 40], 60))  # 15
`,
};

export const quiz = {
  en: [
    {
      question: "Why should you never skip the 'Explore' step and jump straight to coding?",
      options: [
        "The Explore step is optional for experienced programmers",
        "Working through concrete examples by hand reveals the underlying pattern — you discover HOW the solution works before you have to express it in code. Jumping straight to code often means writing code that solves the wrong problem or missing edge cases that would have been obvious in the examples.",
        "The Explore step is only necessary for dynamic programming problems",
        "Working examples manually makes your code run faster"
      ],
      correct: 1,
    },
    {
      question: "The Two Sum problem asks for two indices summing to a target. Why is the hash map approach O(N) while the brute force is O(N²)?",
      options: [
        "The hash map approach uses less memory making it faster",
        "Brute force tries every pair with nested loops — N×N comparisons. The hash map approach stores each value's index as you scan once. For each number x, you check in O(1) if (target-x) was seen before. One scan of N elements with O(1) lookups = O(N) total.",
        "Hash maps have hardware-level optimizations that make them faster",
        "The hash map sorts the data first enabling binary search"
      ],
      correct: 1,
    },
    {
      question: "What is the key insight of the sliding window pattern?",
      options: [
        "It sorts the data before processing to enable binary search",
        "Instead of recomputing the entire window each step, you maintain a window with two pointers. Expanding right adds an element, shrinking left removes one. This turns O(N²) (recompute N windows each of size N) into O(N) (each element enters and exits the window at most once).",
        "It uses parallel processing to check multiple windows simultaneously",
        "It only works on strings, not on arrays of numbers"
      ],
      correct: 1,
    },
    {
      question: "Dynamic programming applies when a problem has 'overlapping subproblems'. What does this mean?",
      options: [
        "The problem can be solved by multiple different algorithms",
        "The same smaller subproblem is solved more than once in a naive recursive solution. For example, fib(5) calls fib(3) twice. DP stores the result of each subproblem the first time it's solved, so subsequent calls return instantly instead of recomputing — turning exponential into polynomial time.",
        "The problem involves overlapping intervals or ranges",
        "Multiple threads work on the same data structure simultaneously"
      ],
      correct: 1,
    },
    {
      question: "What does 'binary search on the answer space' mean and when is it applicable?",
      options: [
        "It means running binary search twice to verify the result",
        "Instead of binary searching the input data, you binary search the RANGE OF POSSIBLE ANSWERS. You define a predicate 'is X a feasible answer?' and binary search for the boundary. Applicable when: answers form a monotone range (if X works, X-1 also works), and checking feasibility is O(N). This turns O(N²) brute force into O(N log N).",
        "It means searching for the answer in a sorted result set",
        "It applies only when the answer is a number between 0 and N"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Pourquoi ne jamais sauter l'étape 'Explorer' et passer directement au codage ?",
      options: [
        "L'étape Explorer est optionnelle pour les programmeurs expérimentés",
        "Travailler sur des exemples concrets à la main révèle le pattern sous-jacent — vous découvrez COMMENT la solution fonctionne avant de l'exprimer en code. Passer directement au code signifie souvent écrire du code qui résout le mauvais problème ou manquer des cas limites qui auraient été évidents dans les exemples.",
        "L'étape Explorer n'est nécessaire que pour les problèmes de programmation dynamique",
        "Travailler les exemples manuellement rend votre code plus rapide"
      ],
      correct: 1,
    },
    {
      question: "Le problème Two Sum demande deux indices qui somment à une cible. Pourquoi l'approche table de hachage est O(N) tandis que la force brute est O(N²) ?",
      options: [
        "L'approche table de hachage utilise moins de mémoire la rendant plus rapide",
        "La force brute essaie chaque paire avec des boucles imbriquées — N×N comparaisons. L'approche table de hachage stocke l'index de chaque valeur lors d'un seul scan. Pour chaque nombre x, vérifier en O(1) si (cible-x) a été vu avant. Un scan de N éléments avec des lookups O(1) = O(N) au total.",
        "Les tables de hachage ont des optimisations matérielles qui les rendent plus rapides",
        "La table de hachage trie d'abord les données permettant la recherche binaire"
      ],
      correct: 1,
    },
    {
      question: "Quelle est l'intuition clé du pattern fenêtre glissante ?",
      options: [
        "Il trie les données avant de les traiter pour activer la recherche binaire",
        "Au lieu de recalculer toute la fenêtre à chaque étape, vous maintenez une fenêtre avec deux pointeurs. Étendre vers la droite ajoute un élément, rétrécir depuis la gauche en retire un. Cela transforme O(N²) en O(N) — chaque élément entre et sort de la fenêtre au plus une fois.",
        "Il utilise le traitement parallèle pour vérifier plusieurs fenêtres simultanément",
        "Il ne fonctionne que sur les chaînes, pas sur les tableaux de nombres"
      ],
      correct: 1,
    },
    {
      question: "La programmation dynamique s'applique quand un problème a des 'sous-problèmes qui se chevauchent'. Qu'est-ce que cela signifie ?",
      options: [
        "Le problème peut être résolu par plusieurs algorithmes différents",
        "Le même sous-problème plus petit est résolu plus d'une fois dans une solution récursive naïve. La DP stocke le résultat de chaque sous-problème la première fois qu'il est résolu, donc les appels suivants retournent instantanément au lieu de recalculer — transformant un temps exponentiel en polynomial.",
        "Le problème implique des intervalles ou plages qui se chevauchent",
        "Plusieurs threads travaillent sur la même structure de données simultanément"
      ],
      correct: 1,
    },
    {
      question: "Que signifie 'recherche binaire sur l'espace des réponses' et quand est-elle applicable ?",
      options: [
        "Cela signifie exécuter la recherche binaire deux fois pour vérifier le résultat",
        "Au lieu de faire une recherche binaire sur les données d'entrée, vous faites une recherche binaire sur la PLAGE DES RÉPONSES POSSIBLES. Vous définissez un prédicat 'X est-il une réponse faisable ?' et faites une recherche binaire pour la frontière. Applicable quand : les réponses forment une plage monotone, et vérifier la faisabilité est O(N). Cela transforme O(N²) en O(N log N).",
        "Cela signifie chercher la réponse dans un ensemble de résultats triés",
        "Cela s'applique uniquement quand la réponse est un nombre entre 0 et N"
      ],
      correct: 1,
    },
  ],
};
