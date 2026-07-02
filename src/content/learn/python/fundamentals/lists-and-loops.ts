export const id = "lists-and-loops";
export const titleEn = "Lists & Loops";
export const titleFr = "Listes et boucles";

export const content = {
  en: `# Lists & Loops

## What Is a List?

A list is an ordered collection of items. Items can be of any type — numbers, strings, booleans, even other lists. Lists are mutable — you can change them after creation.

\`\`\`python
# Creating lists
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]
mixed = [42, "hello", True, 3.14]
empty = []

# Lists can contain anything
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]   # list of lists
\`\`\`

## Accessing Items — Indexing

\`\`\`python
fruits = ["apple", "banana", "cherry", "mango", "grape"]
#           0         1         2        3        4       ← positive index
#          -5        -4        -3       -2       -1       ← negative index

print(fruits[0])    # apple   (first item)
print(fruits[2])    # cherry
print(fruits[-1])   # grape   (last item)
print(fruits[-2])   # mango   (second to last)

# Index out of range = error
# print(fruits[10])   # IndexError: list index out of range
\`\`\`

## Slicing — Getting Multiple Items

\`\`\`python
fruits = ["apple", "banana", "cherry", "mango", "grape"]

print(fruits[1:3])    # ['banana', 'cherry']  (index 1 and 2, not 3)
print(fruits[:3])     # ['apple', 'banana', 'cherry']  (from start to 2)
print(fruits[2:])     # ['cherry', 'mango', 'grape']  (from 2 to end)
print(fruits[:])      # full copy of the list
print(fruits[::2])    # ['apple', 'cherry', 'grape']  (every 2nd item)
print(fruits[::-1])   # ['grape', 'mango', 'cherry', 'banana', 'apple'] (reversed)
\`\`\`

## Modifying Lists

\`\`\`python
fruits = ["apple", "banana", "cherry"]

# Change an item
fruits[1] = "blueberry"
print(fruits)   # ['apple', 'blueberry', 'cherry']

# Add items
fruits.append("mango")          # add to end
print(fruits)   # ['apple', 'blueberry', 'cherry', 'mango']

fruits.insert(1, "avocado")     # insert at index 1
print(fruits)   # ['apple', 'avocado', 'blueberry', 'cherry', 'mango']

fruits.extend(["grape", "kiwi"]) # add multiple items
print(fruits)

# Remove items
fruits.remove("avocado")         # remove by value (first occurrence)
last = fruits.pop()              # remove and return last item
second = fruits.pop(1)           # remove and return item at index 1
del fruits[0]                    # delete item at index 0

# Clear the list
fruits.clear()                   # removes all items
print(fruits)   # []
\`\`\`

## Essential List Methods

\`\`\`python
numbers = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]

print(len(numbers))          # 10 — number of items
print(numbers.count(1))      # 2  — how many times 1 appears
print(numbers.index(5))      # 4  — index of first occurrence of 5
print(sum(numbers))          # 39 — sum of all numbers
print(min(numbers))          # 1  — smallest value
print(max(numbers))          # 9  — largest value

numbers.sort()               # sort in place (modifies original)
print(numbers)   # [1, 1, 2, 3, 3, 4, 5, 5, 6, 9]

numbers.sort(reverse=True)   # sort descending
print(numbers)   # [9, 6, 5, 5, 4, 3, 3, 2, 1, 1]

sorted_copy = sorted([3, 1, 4])  # returns new sorted list (original unchanged)

numbers.reverse()            # reverse in place
print(5 in numbers)          # True  — check membership
print(7 in numbers)          # False
\`\`\`

## Looping Over Lists

\`\`\`python
fruits = ["apple", "banana", "cherry"]

# Basic loop
for fruit in fruits:
    print(fruit)

# With index (enumerate)
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# With index starting at 1
for i, fruit in enumerate(fruits, start=1):
    print(f"{i}. {fruit}")

# Loop with range and indexing (less Pythonic but sometimes needed)
for i in range(len(fruits)):
    print(f"fruits[{i}] = {fruits[i]}")
\`\`\`

## List Comprehensions — The Pythonic Way

List comprehensions create new lists in a single, readable line.

\`\`\`python
# Regular loop to create a new list
squares = []
for x in range(1, 6):
    squares.append(x ** 2)
print(squares)   # [1, 4, 9, 16, 25]

# Same thing with list comprehension
squares = [x ** 2 for x in range(1, 6)]
print(squares)   # [1, 4, 9, 16, 25]

# With condition (filter)
evens = [x for x in range(20) if x % 2 == 0]
print(evens)   # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# Transform strings
fruits = ["apple", "banana", "cherry"]
upper = [f.upper() for f in fruits]
print(upper)   # ['APPLE', 'BANANA', 'CHERRY']

lengths = [len(f) for f in fruits]
print(lengths)   # [5, 6, 6]

# Nested comprehension
matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]
print(matrix)   # [[1, 2, 3], [2, 4, 6], [3, 6, 9]]
\`\`\`

## Useful Patterns

### Finding Items

\`\`\`python
scores = [85, 42, 91, 67, 55, 78, 99, 38]

# Check if value exists
print(91 in scores)    # True

# Find all items matching a condition
passing = [s for s in scores if s >= 60]
print(passing)   # [85, 91, 67, 78, 99]

# Find index of an item
if 91 in scores:
    idx = scores.index(91)
    print(f"91 is at index {idx}")   # 91 is at index 2
\`\`\`

### Combining Lists

\`\`\`python
a = [1, 2, 3]
b = [4, 5, 6]

combined = a + b          # [1, 2, 3, 4, 5, 6]
repeated = a * 3          # [1, 2, 3, 1, 2, 3, 1, 2, 3]

# zip — pair items from two lists
names = ["Alice", "Bob", "Carol"]
scores = [85, 92, 78]

for name, score in zip(names, scores):
    print(f"{name}: {score}")
# Alice: 85
# Bob: 92
# Carol: 78

# Create list of tuples with zip
pairs = list(zip(names, scores))
print(pairs)   # [('Alice', 85), ('Bob', 92), ('Carol', 78)]
\`\`\`

### Flattening a Nested List

\`\`\`python
nested = [[1, 2, 3], [4, 5], [6, 7, 8, 9]]
flat = [item for sublist in nested for item in sublist]
print(flat)   # [1, 2, 3, 4, 5, 6, 7, 8, 9]
\`\`\`

## Copying Lists

\`\`\`python
# WRONG way — both variables point to SAME list
original = [1, 2, 3]
wrong_copy = original
wrong_copy.append(4)
print(original)    # [1, 2, 3, 4]  ← original was modified!

# CORRECT ways to copy
copy1 = original.copy()
copy2 = original[:]
copy3 = list(original)

copy1.append(99)
print(original)   # [1, 2, 3, 4]  ← original unchanged
print(copy1)      # [1, 2, 3, 4, 99]
\`\`\`

## Real-World Example

\`\`\`python
def analyze_scores(scores):
    """Analyze a list of test scores."""
    if not scores:
        return "No scores provided"
    
    total = sum(scores)
    average = total / len(scores)
    
    passing = [s for s in scores if s >= 60]
    failing = [s for s in scores if s < 60]
    
    grades = []
    for score in scores:
        if score >= 90:   grade = "A"
        elif score >= 80: grade = "B"
        elif score >= 70: grade = "C"
        elif score >= 60: grade = "D"
        else:             grade = "F"
        grades.append(grade)
    
    return {
        "count":   len(scores),
        "average": round(average, 1),
        "highest": max(scores),
        "lowest":  min(scores),
        "passing": len(passing),
        "failing": len(failing),
        "grades":  grades,
    }

scores = [85, 42, 91, 67, 55, 78, 99, 38, 72, 88]
result = analyze_scores(scores)

for key, value in result.items():
    print(f"{key}: {value}")
\`\`\`
`,

  fr: `# Listes et boucles

## Qu'est-ce qu'une liste ?

Une liste est une collection ordonnée d'éléments. Les éléments peuvent être de n'importe quel type.

\`\`\`python
fruits = ["pomme", "banane", "cerise"]
nombres = [1, 2, 3, 4, 5]
vide = []
\`\`\`

## Accès et slicing

\`\`\`python
fruits = ["pomme", "banane", "cerise", "mangue", "raisin"]

print(fruits[0])    # pomme   (premier élément)
print(fruits[-1])   # raisin  (dernier élément)
print(fruits[1:3])  # ['banane', 'cerise']
print(fruits[::-1]) # liste inversée
\`\`\`

## Modifier les listes

\`\`\`python
fruits = ["pomme", "banane", "cerise"]

fruits.append("mangue")       # ajouter à la fin
fruits.insert(1, "avocat")    # insérer à l'index 1
fruits.remove("avocat")       # supprimer par valeur
dernier = fruits.pop()        # supprimer et retourner le dernier
\`\`\`

## Compréhensions de listes

\`\`\`python
# Boucle classique
carres = []
for x in range(1, 6):
    carres.append(x ** 2)

# La même chose en une ligne
carres = [x ** 2 for x in range(1, 6)]
print(carres)   # [1, 4, 9, 16, 25]

# Avec condition
pairs = [x for x in range(20) if x % 2 == 0]

# Transformer des chaînes
fruits = ["pomme", "banane", "cerise"]
majuscules = [f.upper() for f in fruits]
longueurs = [len(f) for f in fruits]
\`\`\`

## zip — Associer des listes

\`\`\`python
noms = ["Alice", "Bob", "Carol"]
scores = [85, 92, 78]

for nom, score in zip(noms, scores):
    print(f"{nom}: {score}")
\`\`\`

## Copier des listes

\`\`\`python
# FAUX — les deux variables pointent vers la MÊME liste
originale = [1, 2, 3]
fausse_copie = originale     # même référence !

# CORRECT
copie = originale.copy()     # ou originale[:]
\`\`\`
`,
};

export const starterCode = {
  default: `# Lists & Loops — Practice

# --- Part 1: Basic list operations ---
scores = [85, 42, 91, 67, 55, 78, 99, 38, 72, 88]

print(f"Scores: {scores}")
print(f"Count: {len(scores)}")
print(f"Highest: {max(scores)}")
print(f"Lowest: {min(scores)}")
print(f"Average: {sum(scores) / len(scores):.1f}")

# --- Part 2: List comprehension ---
passing = [s for s in scores if s >= 60]
print(f"\\nPassing scores: {passing}")
print(f"Passing count: {len(passing)}")

# --- Part 3: Loop with enumerate ---
print("\\nAll scores:")
for i, score in enumerate(scores, start=1):
    status = "✓" if score >= 60 else "✗"
    print(f"  {i}. {score} {status}")
`,
};

export const exerciseEn =
  "Write a function 'top_n' that takes a list of numbers and n, and returns the top n highest values sorted in descending order. Test it with the scores list above.";
export const exerciseFr =
  "Écrivez une fonction 'top_n' qui prend une liste de nombres et n, et retourne les n valeurs les plus élevées triées en ordre décroissant. Testez-la avec la liste de scores ci-dessus.";

export const solutionCode = {
  default: `def top_n(numbers, n):
    """Return the top n highest values in descending order."""
    sorted_numbers = sorted(numbers, reverse=True)
    return sorted_numbers[:n]

scores = [85, 42, 91, 67, 55, 78, 99, 38, 72, 88]
print(f"Top 3: {top_n(scores, 3)}")   # [99, 91, 88]
print(f"Top 5: {top_n(scores, 5)}")   # [99, 91, 88, 85, 78]
`,
};

export const quiz = {
  en: [
    {
      question:
        "What does fruits[-1] return for the list ['apple', 'banana', 'cherry']?",
      options: [
        "apple",
        "None",
        "cherry — negative indexes count from the end of the list",
        "An IndexError",
      ],
      correct: 2,
    },
    {
      question: "What is the output of [1, 2, 3][1:3]?",
      options: [
        "[1, 2, 3]",
        "[2, 3] — slicing from index 1 up to (but not including) index 3",
        "[1, 2]",
        "[2, 3, 4]",
      ],
      correct: 1,
    },
    {
      question: "What is the difference between list.sort() and sorted(list)?",
      options: [
        "They are identical",
        "sort() modifies the original list in place and returns None. sorted() returns a new sorted list and leaves the original unchanged.",
        "sorted() only works on numbers, sort() works on any type",
        "sort() is faster than sorted()",
      ],
      correct: 1,
    },
    {
      question: "What does [x**2 for x in range(4) if x % 2 == 0] produce?",
      options: [
        "[0, 1, 4, 9]",
        "[0, 4] — squares of 0 and 2 (the only even numbers in range(4))",
        "[1, 9]",
        "[0, 2, 4]",
      ],
      correct: 1,
    },
    {
      question:
        "Why is copy1 = original wrong when you want an independent copy of a list?",
      options: [
        "Lists cannot be assigned to variables",
        "copy1 = original makes both variables point to the same list in memory — modifying one modifies the other. Use original.copy() or original[:] to create an independent copy.",
        "The = operator creates a deep copy automatically",
        "Lists are immutable so no copy is possible",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Que retourne fruits[-1] pour la liste ['pomme', 'banane', 'cerise'] ?",
      options: [
        "pomme",
        "None",
        "cerise — les index négatifs comptent depuis la fin de la liste",
        "Une IndexError",
      ],
      correct: 2,
    },
    {
      question: "Quelle est la sortie de [1, 2, 3][1:3] ?",
      options: [
        "[1, 2, 3]",
        "[2, 3] — slicing de l'index 1 jusqu'à (sans inclure) l'index 3",
        "[1, 2]",
        "[2, 3, 4]",
      ],
      correct: 1,
    },
    {
      question: "Quelle est la différence entre list.sort() et sorted(list) ?",
      options: [
        "Ils sont identiques",
        "sort() modifie la liste originale en place et retourne None. sorted() retourne une nouvelle liste triée en laissant l'originale inchangée.",
        "sorted() ne fonctionne que sur les nombres, sort() sur n'importe quel type",
        "sort() est plus rapide que sorted()",
      ],
      correct: 1,
    },
    {
      question: "Que produit [x**2 for x in range(4) if x % 2 == 0] ?",
      options: [
        "[0, 1, 4, 9]",
        "[0, 4] — carrés de 0 et 2 (les seuls nombres pairs dans range(4))",
        "[1, 9]",
        "[0, 2, 4]",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi copie = originale est-il faux quand vous voulez une copie indépendante d'une liste ?",
      options: [
        "Les listes ne peuvent pas être assignées à des variables",
        "copie = originale fait pointer les deux variables vers la même liste en mémoire — modifier l'une modifie l'autre. Utilisez originale.copy() ou originale[:] pour créer une copie indépendante.",
        "L'opérateur = crée automatiquement une copie profonde",
        "Les listes sont immuables donc aucune copie n'est possible",
      ],
      correct: 1,
    },
  ],
};
