export const id = "recursion";
export const titleEn = "Recursion";
export const titleFr = "Récursion";

export const content = {
  en: `# Recursion

## The Problem: Some Problems Are Defined in Terms of Themselves

Some problems have a naturally self-similar structure — they look the same at every scale. Recursion is the programming technique that directly mirrors this structure.

Before any code, let's see the idea in everyday life:

\`\`\`
A folder on your computer:
  "Documents" folder contains:
    - report.pdf
    - "Work" folder, which contains:
        - project.pdf
        - "2024" folder, which contains:
            - january.pdf
            - february.pdf

To calculate the total size of "Documents":
  size("Documents") = size(report.pdf)
                    + size("Work")
                    
  size("Work") = size(project.pdf)
               + size("2024")
               
  size("2024") = size(january.pdf)
               + size(february.pdf)

Each folder's size is defined as "the sum of its children's sizes."
That's a recursive definition. The problem is the same at every level.
\`\`\`

## The Mental Model: A Function That Calls Itself

A recursive function is one that **calls itself** with a simpler version of the problem, until it reaches a version so simple it can be solved directly.

\`\`\`
Think of Russian nesting dolls (Matryoshka):
  Open a doll → find another doll inside
  Open that doll → find another doll inside
  ...keep opening...
  Until you find a doll that doesn't open (the base case)

Recursion works the same way:
  Call function → it calls itself with smaller input
  That call → calls itself with even smaller input
  ...keep going...
  Until input is so small the answer is obvious (base case)
  Then each call returns its answer up the chain
\`\`\`

## The Two Essential Parts of Every Recursive Function

Every correct recursive function has exactly two parts. Missing either one causes bugs.

\`\`\`python
def recursive_function(input):
    # PART 1: Base case — when to STOP
    # The simplest possible input, solved directly without recursion
    if input is simple enough:
        return simple_answer

    # PART 2: Recursive case — how to make progress toward the base case
    # Solve a SMALLER version of the same problem
    # Then use that result to solve the current problem
    smaller_result = recursive_function(smaller_input)
    return combine(smaller_result, current_input)
\`\`\`

If you forget the base case → **infinite recursion** (the function calls itself forever until Python crashes with "RecursionError: maximum recursion depth exceeded").

If the recursive case doesn't get closer to the base case → **same problem**: infinite recursion.

## Your First Recursive Function: Countdown

Let's start with the simplest possible example to make the mechanics crystal clear.

\`\`\`python
def countdown(n):
    # BASE CASE: stop when n reaches 0
    if n <= 0:
        print("Go!")
        return

    # RECURSIVE CASE: print n, then count down from n-1
    print(n)
    countdown(n - 1)   # call ourselves with a SMALLER input

countdown(5)
\`\`\`

### What actually happens in memory

\`\`\`
countdown(5) is called:
  prints "5"
  calls countdown(4):
    prints "4"
    calls countdown(3):
      prints "3"
      calls countdown(2):
        prints "2"
        calls countdown(1):
          prints "1"
          calls countdown(0):
            prints "Go!"
            returns     ← base case reached, start unwinding
          returns       ← countdown(1) finishes
        returns         ← countdown(2) finishes
      returns           ← countdown(3) finishes
    returns             ← countdown(4) finishes
  returns               ← countdown(5) finishes

Output:
5
4
3
2
1
Go!

This "stack of calls waiting to return" is called the CALL STACK.
Each function call adds a frame to the stack.
Each return removes a frame.
Python's default limit: 1000 frames deep.
\`\`\`

## Factorial — The Classic Example

n! (n factorial) = n × (n-1) × (n-2) × ... × 2 × 1

\`\`\`
5! = 5 × 4 × 3 × 2 × 1 = 120

Notice the pattern:
5! = 5 × 4!
4! = 4 × 3!
3! = 3 × 2!
2! = 2 × 1!
1! = 1  ← base case (defined as 1 by convention)

So: factorial(n) = n × factorial(n-1)
This is a RECURSIVE DEFINITION. The code writes itself.
\`\`\`

\`\`\`python
def factorial(n):
    # BASE CASE: factorial of 0 or 1 is 1
    if n <= 1:
        return 1

    # RECURSIVE CASE: n! = n × (n-1)!
    return n * factorial(n - 1)

print(factorial(5))    # 120
print(factorial(10))   # 3628800
print(factorial(0))    # 1

# Trace of factorial(4):
# factorial(4)
#   = 4 * factorial(3)
#   = 4 * (3 * factorial(2))
#   = 4 * (3 * (2 * factorial(1)))
#   = 4 * (3 * (2 * 1))         ← base case returns 1
#   = 4 * (3 * 2)               ← each call returns upward
#   = 4 * 6
#   = 24
\`\`\`

## Fibonacci — Two Recursive Calls

The Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...
Each number is the sum of the two before it.

\`\`\`
fib(0) = 0  ← base case
fib(1) = 1  ← base case
fib(n) = fib(n-1) + fib(n-2)  ← two recursive calls
\`\`\`

\`\`\`python
def fib(n):
    # BASE CASES: first two numbers defined directly
    if n == 0: return 0
    if n == 1: return 1

    # RECURSIVE CASE: sum of two previous
    return fib(n - 1) + fib(n - 2)

for i in range(10):
    print(f"fib({i}) = {fib(i)}")
# fib(0) = 0
# fib(1) = 1
# fib(2) = 1
# fib(3) = 2
# ...
\`\`\`

### The hidden problem: Fibonacci is SLOW

\`\`\`
fib(5) call tree:
              fib(5)
            /        \\
         fib(4)      fib(3)
        /    \\      /    \\
     fib(3) fib(2) fib(2) fib(1)
     /  \\   / \\   / \\
  fib(2)fib(1)fib(1)fib(0)fib(1)fib(0)

fib(3) computed TWICE
fib(2) computed THREE TIMES
fib(1) computed FIVE TIMES

fib(40) makes over 300,000,000 function calls!
fib(50) would take minutes.

This is O(2ᴺ) — exponential time. Every recursion textbook shows this.
But they often forget to show you how to FIX it.
\`\`\`

### The fix: Memoization — Remember previous results

\`\`\`python
# Solution 1: Manual cache (dictionary)
def fib_memo(n, cache={}):
    if n in cache:
        return cache[n]   # already computed, return immediately

    if n <= 1:
        return n

    result = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)
    cache[n] = result     # STORE result before returning
    return result

print(fib_memo(40))    # instant! (vs billions of calls without memoization)
print(fib_memo(100))   # still instant

# Solution 2: Python's built-in @lru_cache decorator (cleaner)
from functools import lru_cache

@lru_cache(maxsize=None)   # cache unlimited results
def fib_cached(n):
    if n <= 1:
        return n
    return fib_cached(n - 1) + fib_cached(n - 2)

print(fib_cached(100))    # 354224848179261915075

# Solution 3: Iterative (no recursion, most efficient)
def fib_iterative(n):
    if n <= 1: return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

print(fib_iterative(100))   # same answer, O(N) time, O(1) space
\`\`\`

## Recursion on Data Structures

Recursion really shines when the data itself is recursive (trees, nested structures).

### Summing a nested list

\`\`\`python
# A nested list can contain numbers OR other lists (any depth)
nested = [1, [2, 3], [4, [5, 6]], 7]

def deep_sum(items):
    """Sum all numbers no matter how deeply nested."""
    total = 0
    for item in items:
        if isinstance(item, list):
            # Item is a list — recurse into it
            total += deep_sum(item)
        else:
            # Item is a number — add it directly
            total += item
    return total

print(deep_sum([1, [2, 3], [4, [5, 6]], 7]))   # 1+2+3+4+5+6+7 = 28
print(deep_sum([[[[[42]]]]]))                    # 42 (5 levels deep)

# The beauty: you don't need to know how deep the nesting goes.
# Recursion handles ANY depth automatically.
\`\`\`

### Flatten a nested list

\`\`\`python
def flatten(items):
    """Convert a nested list into a flat list."""
    result = []
    for item in items:
        if isinstance(item, list):
            result.extend(flatten(item))   # recurse, extend with results
        else:
            result.append(item)
    return result

print(flatten([1, [2, 3], [4, [5, [6, 7]]]]))
# [1, 2, 3, 4, 5, 6, 7]

print(flatten([[[[1], 2], 3], 4]))
# [1, 2, 3, 4]
\`\`\`

### Tree traversal — The natural home of recursion

\`\`\`python
# A tree where each node has a value and a list of children
def make_node(value, *children):
    return {"value": value, "children": list(children)}

#        1
#      / | \\
#     2  3  4
#    / \\    \\
#   5   6    7

tree = make_node(1,
    make_node(2,
        make_node(5),
        make_node(6)),
    make_node(3),
    make_node(4,
        make_node(7)))

def tree_sum(node):
    """Sum all values in the tree."""
    total = node["value"]
    for child in node["children"]:
        total += tree_sum(child)   # sum each subtree
    return total

def tree_depth(node):
    """Find the maximum depth of the tree."""
    if not node["children"]:
        return 0   # leaf node — depth is 0
    # depth = 1 + maximum depth among all children
    return 1 + max(tree_depth(child) for child in node["children"])

def tree_values(node):
    """Return all values in the tree (pre-order: root first)."""
    values = [node["value"]]
    for child in node["children"]:
        values.extend(tree_values(child))
    return values

print(f"Sum:    {tree_sum(tree)}")      # 1+2+3+4+5+6+7 = 28
print(f"Depth:  {tree_depth(tree)}")   # 2 (root→2→5 is 2 levels)
print(f"Values: {tree_values(tree)}")  # [1, 2, 5, 6, 3, 4, 7]
\`\`\`

## The Power Move: Merge Sort Revisited

Now that you understand recursion deeply, look at merge sort again. It's the perfect recursive algorithm:

\`\`\`python
def merge_sort(items):
    # BASE CASE: a list of 0 or 1 items is already sorted
    if len(items) <= 1:
        return items

    # DIVIDE: split in half
    mid   = len(items) // 2
    left  = items[:mid]
    right = items[mid:]

    # RECURSIVE CASE: sort each half (smaller version of same problem!)
    sorted_left  = merge_sort(left)
    sorted_right = merge_sort(right)

    # COMBINE: merge the two sorted halves
    return merge(sorted_left, sorted_right)

# Each call works on half the data → O(log N) levels deep
# Each level does O(N) total work (merging)
# Total: O(N log N)
\`\`\`

## Thinking Recursively — The Method

When you face a problem and want to solve it recursively, ask these three questions in order:

\`\`\`
Question 1: "What is the SIMPLEST possible input?"
  → That's your base case. Solve it directly.

Question 2: "If I had the answer for a SLIGHTLY SMALLER input,
             how would I use it to solve the current input?"
  → That's your recursive case.

Question 3: "Is my recursive call definitely getting CLOSER to the base case?"
  → If yes: the recursion terminates. If no: infinite loop.
\`\`\`

### Applying the method: Power function

\`\`\`
Problem: compute base^exp (e.g. 2^10 = 1024)

Q1: Simplest input?
    exp = 0 → base^0 = 1 (anything to the power 0 is 1)
    That's the base case.

Q2: If I know base^(exp-1), how do I get base^exp?
    base^exp = base × base^(exp-1)
    That's the recursive case.

Q3: Getting closer? exp decreases by 1 each call → yes.
\`\`\`

\`\`\`python
def power(base, exp):
    # Base case: anything^0 = 1
    if exp == 0:
        return 1

    # Recursive case: base^exp = base × base^(exp-1)
    return base * power(base, exp - 1)

print(power(2, 10))    # 1024
print(power(3, 4))     # 81
print(power(5, 0))     # 1

# Smarter version: fast exponentiation O(log N) instead of O(N)
def fast_power(base, exp):
    if exp == 0:
        return 1
    if exp % 2 == 0:
        # Even: base^exp = (base²)^(exp/2) — halve the problem!
        half = fast_power(base, exp // 2)
        return half * half
    else:
        # Odd: base^exp = base × base^(exp-1)
        return base * fast_power(base, exp - 1)

print(fast_power(2, 10))   # 1024 in only 4 recursive calls (not 10)
\`\`\`

## Recursion vs Iteration — When to Use Each

Recursion is not always better. Here's an honest comparison:

\`\`\`
Use RECURSION when:
  ✓ Data is naturally recursive (trees, graphs, nested structures)
  ✓ Problem has a clean recursive definition (merge sort, quicksort)
  ✓ Depth is limited (file systems, org charts — rarely more than 20 levels)
  ✓ Code clarity matters more than raw performance

Use ITERATION when:
  ✓ The recursion depth could be large (N > 1,000)
  ✓ Maximum performance is required (function call overhead)
  ✓ Simple loops are just as clear as recursion
  ✓ Memory is constrained (no call stack growth)

Python specifics:
  - Default recursion limit: 1,000 (can change with sys.setrecursionlimit())
  - Python does NOT optimize tail recursion (some languages do)
  - For N > 1,000: iterative solutions avoid RecursionError

Every recursive algorithm has an iterative equivalent.
Sometimes iterative is simpler. Sometimes recursive is clearer.
Choose based on the specific problem.
\`\`\`

## Common Mistakes to Avoid

\`\`\`python
# Mistake 1: Missing base case — infinite recursion
def countdown_broken(n):
    print(n)
    countdown_broken(n - 1)   # ← never stops! No base case!
    # RecursionError: maximum recursion depth exceeded

# Fix: add a base case
def countdown_fixed(n):
    if n <= 0:          # ← base case
        print("Go!")
        return
    print(n)
    countdown_fixed(n - 1)


# Mistake 2: Base case never reached — not getting closer
def broken(n):
    if n == 0:
        return 0
    return broken(n + 1)   # ← n grows, never reaches 0!
    # RecursionError: maximum recursion depth exceeded

# Fix: make sure recursive call moves toward base case
def fixed(n):
    if n == 0:
        return 0
    return fixed(n - 1)    # ← n shrinks, reaches 0


# Mistake 3: Forgetting to return the recursive result
def factorial_broken(n):
    if n <= 1:
        return 1
    factorial_broken(n - 1)   # ← calls but IGNORES the result!
    # Returns None instead of the factorial

# Fix: return the result
def factorial_fixed(n):
    if n <= 1:
        return 1
    return n * factorial_fixed(n - 1)   # ← return the result!


# Mistake 4: Recomputing without memoization (exponential blowup)
def fib_slow(n):
    if n <= 1: return n
    return fib_slow(n-1) + fib_slow(n-2)   # 2^N calls for fib(N)

# Fix: memoize
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_fast(n):
    if n <= 1: return n
    return fib_fast(n-1) + fib_fast(n-2)  # each subproblem computed once
\`\`\`

## Quick Reference

\`\`\`python
# Template for recursive functions
def solve(problem):
    # 1. Base case: simplest version, solved directly
    if problem is base_case:
        return base_answer

    # 2. Recursive case: solve smaller version, combine
    smaller = solve(make_smaller(problem))
    return combine(smaller, problem)

# Common patterns:
# Decrease by 1:    solve(n) → solve(n-1)
# Halve each time:  solve(n) → solve(n//2)
# Split in two:     solve(items) → solve(left) + solve(right)
# Process children: for child in node.children: solve(child)

# Memoization template:
from functools import lru_cache

@lru_cache(maxsize=None)
def solve_memo(n):
    if n is base_case:
        return base_answer
    return combine(solve_memo(smaller_n), n)
\`\`\`
`,

  fr: `# Récursion

## Le problème : certains problèmes se définissent en termes d'eux-mêmes

Certains problèmes ont une structure naturellement auto-similaire — ils se ressemblent à chaque niveau. La récursion est la technique de programmation qui reflète directement cette structure.

## Le modèle mental : une fonction qui s'appelle elle-même

\`\`\`
Pensez aux poupées russes (Matryoshka) :
  Ouvrez une poupée → trouvez une autre poupée à l'intérieur
  Ouvrez celle-là → trouvez une autre poupée
  ...continuez...
  Jusqu'à trouver une poupée qui ne s'ouvre pas (cas de base)
\`\`\`

## Les deux parties essentielles de toute fonction récursive

\`\`\`python
def fonction_recursive(entree):
    # PARTIE 1 : Cas de base — quand S'ARRÊTER
    if entree est assez simple:
        return reponse_simple

    # PARTIE 2 : Cas récursif — progresser vers le cas de base
    resultat_plus_petit = fonction_recursive(entree_plus_petite)
    return combiner(resultat_plus_petit, entree)
\`\`\`

## Factorielle — L'exemple classique

\`\`\`python
def factorielle(n):
    # CAS DE BASE : factorielle de 0 ou 1 est 1
    if n <= 1:
        return 1

    # CAS RÉCURSIF : n! = n × (n-1)!
    return n * factorielle(n - 1)

print(factorielle(5))    # 120
# factorielle(5)
#   = 5 * factorielle(4)
#   = 5 * (4 * factorielle(3))
#   = 5 * (4 * (3 * factorielle(2)))
#   = 5 * (4 * (3 * (2 * factorielle(1))))
#   = 5 * (4 * (3 * (2 * 1)))  ← cas de base
#   = 120
\`\`\`

## Fibonacci et la mémoïsation

\`\`\`python
# Version LENTE — O(2ᴺ) — recalcule les mêmes valeurs des millions de fois
def fib_lent(n):
    if n <= 1: return n
    return fib_lent(n-1) + fib_lent(n-2)

# Version RAPIDE avec mémoïsation — O(N)
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_rapide(n):
    if n <= 1: return n
    return fib_rapide(n-1) + fib_rapide(n-2)

print(fib_rapide(100))   # instantané !
\`\`\`

## Récursion sur les structures de données

\`\`\`python
def somme_profonde(elements):
    """Sommer tous les nombres quelle que soit la profondeur d'imbrication."""
    total = 0
    for element in elements:
        if isinstance(element, list):
            total += somme_profonde(element)   # récursion
        else:
            total += element
    return total

print(somme_profonde([1, [2, 3], [4, [5, 6]], 7]))   # 28
\`\`\`

## Erreurs courantes à éviter

\`\`\`python
# Erreur 1 : Cas de base manquant — récursion infinie
def compte_a_rebours_casse(n):
    print(n)
    compte_a_rebours_casse(n - 1)   # ← ne s'arrête jamais !

# Erreur 2 : Le cas récursif ne se rapproche pas du cas de base
def casse(n):
    if n == 0: return 0
    return casse(n + 1)   # ← n grandit, n'atteint jamais 0 !

# Erreur 3 : Oublier de retourner le résultat récursif
def factorielle_cassee(n):
    if n <= 1: return 1
    factorielle_cassee(n - 1)   # ← appelle mais IGNORE le résultat !
    # Retourne None au lieu de la factorielle

# Correction :
def factorielle_correcte(n):
    if n <= 1: return 1
    return n * factorielle_correcte(n - 1)   # ← retourner le résultat !
\`\`\`
`,
};

export const starterCode = {
  default: `# Recursion — Practice
from functools import lru_cache

# --- Part 1: Basic recursion ---
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

for i in range(8):
    print(f"{i}! = {factorial(i)}")

# --- Part 2: Fibonacci with memoization ---
@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print("\\nFibonacci sequence:")
print([fib(i) for i in range(15)])

# --- Part 3: Recursive sum of nested list ---
def deep_sum(items):
    total = 0
    for item in items:
        if isinstance(item, list):
            total += deep_sum(item)
        else:
            total += item
    return total

nested = [1, [2, 3], [4, [5, 6]], 7]
print(f"\\nDeep sum of {nested}")
print(f"= {deep_sum(nested)}")   # should be 28

# --- Part 4: Flatten nested list ---
def flatten(items):
    result = []
    for item in items:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

deep = [1, [2, [3, [4, [5]]]]]
print(f"\\nFlatten {deep}")
print(f"= {flatten(deep)}")   # [1, 2, 3, 4, 5]
`,
};

export const exerciseEn = `Recursion challenges — build these using the three-question method.

1. Write recursive 'sum_digits(n)' that sums the digits of a number.
   sum_digits(1234) → 10 (1+2+3+4)
   Hint: last digit = n % 10, remaining = n // 10

2. Write recursive 'reverse_string(s)' that reverses a string.
   reverse_string("hello") → "olleh"
   Hint: last char + reverse of everything before it

3. Write recursive 'count_occurrences(items, target)' that counts
   how many times target appears in a nested list (any depth).
   count_occurrences([1, [2, 1], [1, [1, 3]]], 1) → 4

4. Write recursive 'tree_depth(node)' where node = {"val": x, "left": ..., "right": ...}
   for a binary tree. Depth = longest path from root to a leaf.
   Apply the three-question method before coding.`;

export const exerciseFr = `Défis de récursion — construisez-les avec la méthode des trois questions.

1. Écrivez 'somme_chiffres(n)' récursif qui somme les chiffres d'un nombre.
   somme_chiffres(1234) → 10 (1+2+3+4)

2. Écrivez 'inverser_chaine(s)' récursif qui inverse une chaîne.
   inverser_chaine("bonjour") → "ruojnob"

3. Écrivez 'compter_occurrences(elements, cible)' récursif qui compte
   combien de fois cible apparaît dans une liste imbriquée (toute profondeur).

4. Écrivez 'profondeur_arbre(noeud)' récursif pour un arbre binaire.
   Appliquez la méthode des trois questions avant de coder.`;

export const solutionCode = {
  default: `from functools import lru_cache

# 1. Sum of digits
def sum_digits(n):
    n = abs(n)              # handle negative numbers
    if n < 10:
        return n            # base case: single digit
    return (n % 10) + sum_digits(n // 10)  # last digit + rest

print(f"sum_digits(1234)  = {sum_digits(1234)}")    # 10
print(f"sum_digits(9999)  = {sum_digits(9999)}")    # 36
print(f"sum_digits(7)     = {sum_digits(7)}")       # 7

# 2. Reverse string
def reverse_string(s):
    if len(s) <= 1:
        return s            # base case: empty or single char
    return reverse_string(s[1:]) + s[0]  # reverse rest + first char

print(f"\\nreverse_string('hello') = {reverse_string('hello')}")
print(f"reverse_string('python') = {reverse_string('python')}")

# 3. Count occurrences in nested list
def count_occurrences(items, target):
    count = 0
    for item in items:
        if isinstance(item, list):
            count += count_occurrences(item, target)  # recurse into sublists
        elif item == target:
            count += 1
    return count

nested = [1, [2, 1], [1, [1, 3]], [[[1]]]]
print(f"\\ncount_occurrences of 1: {count_occurrences(nested, 1)}")  # 5

# 4. Binary tree depth
def make_node(val, left=None, right=None):
    return {"val": val, "left": left, "right": right}

def tree_depth(node):
    # Base case: empty node (None) has depth -1
    if node is None:
        return -1
    # Recursive: 1 + max depth of left or right subtree
    return 1 + max(tree_depth(node["left"]), tree_depth(node["right"]))

#       1
#      / \\
#     2   3
#    / \\
#   4   5
#  /
# 6

tree = make_node(1,
    make_node(2,
        make_node(4,
            make_node(6)),
        make_node(5)),
    make_node(3))

print(f"\\nTree depth: {tree_depth(tree)}")   # 3 (root→2→4→6)
`,
};

export const quiz = {
  en: [
    {
      question: "What are the two essential parts every recursive function must have, and what goes wrong if either is missing?",
      options: [
        "A loop and a return statement — without them the function returns None",
        "A base case (simplest input solved directly, stops recursion) and a recursive case (calls itself with smaller input). Missing the base case causes infinite recursion and RecursionError. Missing progress toward the base case in the recursive case also causes infinite recursion.",
        "A parameter and a return value — without them the function cannot be called",
        "A print statement and an if statement — these are required by Python's recursion rules"
      ],
      correct: 1,
    },
    {
      question: "Why is the naive recursive Fibonacci O(2ᴺ) instead of O(N)?",
      options: [
        "Because it uses two recursive calls instead of one",
        "fib(n) calls fib(n-1) AND fib(n-2), each of which calls two more, creating an exponential call tree. fib(3) is computed multiple times, fib(2) even more. For fib(40), over 300 million function calls are made — exponential growth.",
        "Because Python's function call overhead is O(N) per call",
        "Because the Fibonacci sequence itself grows exponentially"
      ],
      correct: 1,
    },
    {
      question: "What does memoization achieve and how does it improve Fibonacci's complexity?",
      options: [
        "Memoization compresses the function code making it run faster",
        "Memoization stores previously computed results in a cache. When fib(n) is called again, it returns the cached answer instantly instead of recomputing. This means each fib(k) is computed exactly once — reducing the total work from O(2ᴺ) to O(N).",
        "Memoization converts recursion to iteration automatically",
        "Memoization increases the recursion limit allowing deeper recursion"
      ],
      correct: 1,
    },
    {
      question: "Why is recursion naturally suited for tree and nested structure problems?",
      options: [
        "Trees are stored in sorted order making recursive access faster",
        "Trees and nested structures are themselves recursive — a tree is a root node plus subtrees, each of which is also a tree. A recursive function mirrors this structure directly: process the current node, then call yourself on each child. The depth is handled automatically without needing to track it manually.",
        "Python optimizes recursive calls on tree structures with special hardware",
        "Recursive functions use less memory than iterative functions for trees"
      ],
      correct: 1,
    },
    {
      question: "What is the three-question method for designing recursive solutions?",
      options: [
        "Ask: is it fast? is it correct? is it readable?",
        "Ask: (1) What is the simplest possible input? — that's your base case. (2) If I had the answer for a slightly smaller input, how would I use it? — that's your recursive case. (3) Is the recursive call definitely getting closer to the base case? — ensures termination.",
        "Ask: what type is the input? what type is the output? what are the edge cases?",
        "Ask: should I use recursion or iteration? should I memoize? should I use a helper function?"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Quelles sont les deux parties essentielles que toute fonction récursive doit avoir, et que se passe-t-il si l'une est manquante ?",
      options: [
        "Une boucle et une instruction return — sans elles la fonction retourne None",
        "Un cas de base (entrée la plus simple résolue directement, arrête la récursion) et un cas récursif (s'appelle elle-même avec une entrée plus petite). Un cas de base manquant cause une récursion infinie et une RecursionError. Un cas récursif qui ne progresse pas vers le cas de base cause aussi une récursion infinie.",
        "Un paramètre et une valeur de retour — sans eux la fonction ne peut pas être appelée",
        "Une instruction print et un if — requis par les règles de récursion de Python"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi la Fibonacci récursive naïve est-elle O(2ᴺ) au lieu de O(N) ?",
      options: [
        "Parce qu'elle utilise deux appels récursifs au lieu d'un",
        "fib(n) appelle fib(n-1) ET fib(n-2), chacun appelle deux autres, créant un arbre d'appels exponentiel. fib(3) est calculé plusieurs fois, fib(2) encore plus. Pour fib(40), plus de 300 millions d'appels sont faits.",
        "Parce que l'overhead des appels de fonction Python est O(N) par appel",
        "Parce que la séquence de Fibonacci elle-même croît exponentiellement"
      ],
      correct: 1,
    },
    {
      question: "Qu'accomplit la mémoïsation et comment améliore-t-elle la complexité de Fibonacci ?",
      options: [
        "La mémoïsation compresse le code de la fonction la rendant plus rapide",
        "La mémoïsation stocke les résultats précédemment calculés dans un cache. Quand fib(n) est appelé à nouveau, il retourne la réponse mise en cache instantanément. Cela signifie que chaque fib(k) est calculé exactement une fois — réduisant le travail total de O(2ᴺ) à O(N).",
        "La mémoïsation convertit automatiquement la récursion en itération",
        "La mémoïsation augmente la limite de récursion permettant une récursion plus profonde"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi la récursion est-elle naturellement adaptée aux problèmes d'arbres et de structures imbriquées ?",
      options: [
        "Les arbres sont stockés en ordre trié rendant l'accès récursif plus rapide",
        "Les arbres et les structures imbriquées sont eux-mêmes récursifs — un arbre est un nœud racine plus des sous-arbres, chacun étant aussi un arbre. Une fonction récursive reflète directement cette structure : traite le nœud actuel, puis s'appelle sur chaque enfant.",
        "Python optimise les appels récursifs sur les structures arborescentes avec du matériel spécial",
        "Les fonctions récursives utilisent moins de mémoire que les itératives pour les arbres"
      ],
      correct: 1,
    },
    {
      question: "Quelle est la méthode des trois questions pour concevoir des solutions récursives ?",
      options: [
        "Demander : est-ce rapide ? est-ce correct ? est-ce lisible ?",
        "Demander : (1) Quelle est l'entrée la plus simple possible ? — c'est votre cas de base. (2) Si j'avais la réponse pour une entrée légèrement plus petite, comment l'utiliserais-je ? — c'est votre cas récursif. (3) L'appel récursif se rapproche-t-il définitivement du cas de base ? — assure la terminaison.",
        "Demander : quel est le type de l'entrée ? quel est le type de la sortie ? quels sont les cas limites ?",
        "Demander : dois-je utiliser la récursion ou l'itération ? dois-je mémoïser ? dois-je utiliser une fonction auxiliaire ?"
      ],
      correct: 1,
    },
  ],
};
