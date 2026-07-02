export const id = "control-flow";
export const titleEn = "Control Flow";
export const titleFr = "Structures de contrôle";

export const content = {
  en: `# Control Flow

## What Is Control Flow?

By default, Python runs code line by line from top to bottom. **Control flow** lets you change that — run code only when certain conditions are true, or repeat code multiple times.

\`\`\`python
# Without control flow: always runs all lines
print("Line 1")
print("Line 2")
print("Line 3")

# With control flow: run Line 2 only if condition is true
print("Line 1")
if temperature > 30:
    print("Line 2 — it's hot!")
print("Line 3")
\`\`\`

## if / elif / else

\`\`\`python
age = 20

if age < 13:
    print("Child")
elif age < 18:
    print("Teenager")
elif age < 65:
    print("Adult")
else:
    print("Senior")

# Output: Adult
\`\`\`

### Indentation Is Everything

Python uses **indentation** (spaces) to define blocks. This is not optional — it is the syntax.

\`\`\`python
# CORRECT — 4 spaces indent
if age >= 18:
    print("Adult")      # 4 spaces
    print("Can vote")   # 4 spaces

# WRONG — inconsistent indent causes error
if age >= 18:
    print("Adult")   # 4 spaces
  print("Can vote")  # 2 spaces — IndentationError!
\`\`\`

### Comparison Operators

\`\`\`python
x = 10

print(x == 10)   # True  — equal to
print(x != 5)    # True  — not equal to
print(x > 5)     # True  — greater than
print(x < 20)    # True  — less than
print(x >= 10)   # True  — greater than or equal
print(x <= 10)   # True  — less than or equal
\`\`\`

### Logical Operators: and, or, not

\`\`\`python
age = 25
has_id = True

# and: both must be True
if age >= 18 and has_id:
    print("Entry allowed")

# or: at least one must be True
if age < 13 or age > 65:
    print("Discount applies")

# not: reverses True/False
if not has_id:
    print("No ID, no entry")

# Combining them
if age >= 18 and (has_id or age >= 21):
    print("Definitely allowed")
\`\`\`

### Truthy and Falsy Values

\`\`\`python
# In Python, these are considered False:
# False, None, 0, 0.0, "" (empty string), [] (empty list), {} (empty dict)

name = ""
if name:
    print("Name provided")
else:
    print("Name is empty")    # this runs

balance = 0
if balance:
    print("Has money")
else:
    print("Empty account")    # this runs

items = [1, 2, 3]
if items:
    print("List has items")   # this runs
\`\`\`

## while Loop

Repeats code AS LONG AS a condition is True.

\`\`\`python
count = 0
while count < 5:
    print(f"count = {count}")
    count += 1      # count = count + 1

# Output:
# count = 0
# count = 1
# count = 2
# count = 3
# count = 4

# WARNING: infinite loop — always make sure the condition becomes False
# while True:
#     print("forever")   # NEVER stops! Use Ctrl+C to stop
\`\`\`

### break and continue

\`\`\`python
# break: exit the loop immediately
count = 0
while True:
    if count >= 5:
        break        # exit loop when count reaches 5
    print(count)
    count += 1

# continue: skip to next iteration
for i in range(10):
    if i % 2 == 0:
        continue     # skip even numbers
    print(i)         # prints: 1, 3, 5, 7, 9
\`\`\`

## for Loop

Iterates over a sequence (list, string, range, etc.).

\`\`\`python
# Loop over a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
# apple
# banana
# cherry

# Loop over a string
for letter in "Python":
    print(letter)
# P, y, t, h, o, n (one per line)

# Loop with range()
for i in range(5):          # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 8):       # 2, 3, 4, 5, 6, 7
    print(i)

for i in range(0, 10, 2):   # 0, 2, 4, 6, 8 (step of 2)
    print(i)

for i in range(10, 0, -1):  # 10, 9, 8, ..., 1 (count down)
    print(i)
\`\`\`

### enumerate — Index + Value Together

\`\`\`python
fruits = ["apple", "banana", "cherry"]

for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")

# 0: apple
# 1: banana
# 2: cherry

# Start index at 1 instead of 0
for index, fruit in enumerate(fruits, start=1):
    print(f"{index}. {fruit}")

# 1. apple
# 2. banana
# 3. cherry
\`\`\`

## Putting It Together — Real Example

\`\`\`python
# Grade classifier
scores = [85, 42, 91, 67, 55, 78, 99, 38]

for score in scores:
    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    elif score >= 70:
        grade = "C"
    elif score >= 60:
        grade = "D"
    else:
        grade = "F"
    print(f"Score {score}: {grade}")

# Calculate average
total = 0
for score in scores:
    total += score
average = total / len(scores)
print(f"\\nClass average: {average:.1f}")
\`\`\`

## Ternary Expression (One-Line if)

\`\`\`python
# Standard if/else
if age >= 18:
    status = "adult"
else:
    status = "minor"

# Same thing in one line
status = "adult" if age >= 18 else "minor"
print(status)   # adult

# Useful for simple assignments
label = "pass" if score >= 60 else "fail"
absolute = x if x >= 0 else -x    # absolute value
\`\`\`
`,

  fr: `# Structures de contrôle

## Qu'est-ce que le flux de contrôle ?

Par défaut, Python exécute le code ligne par ligne. Les **structures de contrôle** vous permettent de changer cela — exécuter du code uniquement quand certaines conditions sont vraies, ou répéter du code plusieurs fois.

## if / elif / else

\`\`\`python
age = 20

if age < 13:
    print("Enfant")
elif age < 18:
    print("Adolescent")
elif age < 65:
    print("Adulte")
else:
    print("Senior")

# Résultat : Adulte
\`\`\`

### L'indentation est tout

Python utilise l'**indentation** (espaces) pour définir les blocs. Ce n'est pas optionnel — c'est la syntaxe.

\`\`\`python
# CORRECT — 4 espaces d'indentation
if age >= 18:
    print("Adulte")      # 4 espaces
    print("Peut voter")  # 4 espaces
\`\`\`

### Opérateurs logiques : and, or, not

\`\`\`python
age = 25
a_carte_id = True

if age >= 18 and a_carte_id:
    print("Entrée autorisée")

if age < 13 or age > 65:
    print("Réduction applicable")

if not a_carte_id:
    print("Pas de carte, pas d'entrée")
\`\`\`

## Boucle while

Répète le code TANT QUE la condition est True.

\`\`\`python
compteur = 0
while compteur < 5:
    print(f"compteur = {compteur}")
    compteur += 1    # compteur = compteur + 1
\`\`\`

## Boucle for

Itère sur une séquence (liste, chaîne, range, etc.).

\`\`\`python
fruits = ["pomme", "banane", "cerise"]
for fruit in fruits:
    print(fruit)

for i in range(5):       # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 8):    # 2, 3, 4, 5, 6, 7
    print(i)

for i in range(0, 10, 2): # 0, 2, 4, 6, 8 (pas de 2)
    print(i)
\`\`\`

### enumerate — Index + valeur ensemble

\`\`\`python
fruits = ["pomme", "banane", "cerise"]

for index, fruit in enumerate(fruits, start=1):
    print(f"{index}. {fruit}")

# 1. pomme
# 2. banane
# 3. cerise
\`\`\`

## Expression ternaire (if en une ligne)

\`\`\`python
# if/else standard
if age >= 18:
    statut = "adulte"
else:
    statut = "mineur"

# La même chose en une ligne
statut = "adulte" if age >= 18 else "mineur"
\`\`\`
`,
};

export const starterCode = {
  default: `# Control Flow — Practice
# Experiment with if/elif/else and loops

# --- Part 1: Grade classifier ---
score = 75   # try changing this value

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Score: {score} → Grade: {grade}")

# --- Part 2: Count down with while ---
print("\\nCountdown:")
n = 5
while n > 0:
    print(n)
    n -= 1
print("Go!")

# --- Part 3: Loop over a list ---
print("\\nFruits:")
fruits = ["apple", "banana", "cherry", "mango"]
for i, fruit in enumerate(fruits, start=1):
    print(f"  {i}. {fruit}")
`,
};

export const exerciseEn =
  "Change the score to test all grade levels (A, B, C, D, F). Then add a new list of numbers and use a for loop to print only the even ones.";
export const exerciseFr =
  "Changez le score pour tester tous les niveaux (A, B, C, D, F). Puis ajoutez une nouvelle liste de nombres et utilisez une boucle for pour afficher uniquement les nombres pairs.";

export const solutionCode = {
  default: `# Solution
score = 95
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"
print(f"Score: {score} → Grade: {grade}")

# Even numbers only
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print("\\nEven numbers:")
for n in numbers:
    if n % 2 == 0:
        print(n)
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the output of this code?\nx = 15\nif x > 20:\n    print('big')\nelif x > 10:\n    print('medium')\nelse:\n    print('small')",
      options: ["big", "medium", "small", "big medium"],
      correct: 1,
    },
    {
      question: "What does range(2, 10, 3) produce?",
      options: ["2, 3, 4, 5, 6, 7, 8, 9", "2, 5, 8", "3, 6, 9", "2, 4, 6, 8"],
      correct: 1,
    },
    {
      question: "What is the purpose of break in a loop?",
      options: [
        "It pauses the loop for 1 second",
        "It skips the current iteration and continues with the next",
        "It exits the loop immediately regardless of the loop condition",
        "It restarts the loop from the beginning",
      ],
      correct: 2,
    },
    {
      question: "Which values are considered falsy in Python?",
      options: [
        "Only False and None",
        "False, None, 0, 0.0, empty string, empty list, empty dict",
        "Only False, 0, and empty string",
        "All negative numbers and empty containers",
      ],
      correct: 1,
    },
    {
      question: "What does enumerate(['a', 'b', 'c'], start=1) produce?",
      options: [
        "(0, 'a'), (1, 'b'), (2, 'c')",
        "(1, 'a'), (2, 'b'), (3, 'c')",
        "('a', 1), ('b', 2), ('c', 3)",
        "1, 2, 3",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quelle est la sortie de ce code ?\nx = 15\nif x > 20:\n    print('grand')\nelif x > 10:\n    print('moyen')\nelse:\n    print('petit')",
      options: ["grand", "moyen", "petit", "grand moyen"],
      correct: 1,
    },
    {
      question: "Que produit range(2, 10, 3) ?",
      options: ["2, 3, 4, 5, 6, 7, 8, 9", "2, 5, 8", "3, 6, 9", "2, 4, 6, 8"],
      correct: 1,
    },
    {
      question: "Quel est le but de break dans une boucle ?",
      options: [
        "Il met la boucle en pause pendant 1 seconde",
        "Il saute l'itération courante et continue avec la suivante",
        "Il quitte la boucle immédiatement quelle que soit la condition",
        "Il redémarre la boucle depuis le début",
      ],
      correct: 2,
    },
    {
      question:
        "Quelles valeurs sont considérées comme fausses (falsy) en Python ?",
      options: [
        "Seulement False et None",
        "False, None, 0, 0.0, chaîne vide, liste vide, dict vide",
        "Seulement False, 0 et chaîne vide",
        "Tous les nombres négatifs et les conteneurs vides",
      ],
      correct: 1,
    },
    {
      question: "Que produit enumerate(['a', 'b', 'c'], start=1) ?",
      options: [
        "(0, 'a'), (1, 'b'), (2, 'c')",
        "(1, 'a'), (2, 'b'), (3, 'c')",
        "('a', 1), ('b', 2), ('c', 3)",
        "1, 2, 3",
      ],
      correct: 1,
    },
  ],
};
