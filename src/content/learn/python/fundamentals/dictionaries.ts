export const id = "dictionaries";
export const titleEn = "Dictionaries";
export const titleFr = "Dictionnaires";

export const content = {
  en: `# Dictionaries

## The Problem Dictionaries Solve

Imagine you want to store information about a person. With a list, you'd do this:

\`\`\`python
person = ["Alice", 30, "Paris", "alice@example.com"]
\`\`\`

But now you have a problem: to get the email, you need to remember it's at index 3. What if you add more fields? What if you forget the order? This is fragile and confusing.

**A dictionary solves this by labeling every value with a name:**

\`\`\`python
person = {
    "name":  "Alice",
    "age":   30,
    "city":  "Paris",
    "email": "alice@example.com"
}
\`\`\`

Now you access the email with \`person["email"]\` — no need to remember positions. This is exactly how most real programs store data: user profiles, product details, API responses, configuration settings.

## The Mental Model: A Real Dictionary

Think of a Python dictionary exactly like a real dictionary:
- A real dictionary maps a **word** → to its **definition**
- A Python dictionary maps a **key** → to a **value**

\`\`\`
Real dictionary:          Python dictionary:
"apple" → "a fruit"       "name"  → "Alice"
"blue"  → "a color"       "age"   → 30
"run"   → "to move fast"  "city"  → "Paris"
\`\`\`

The key is always unique (just like a word appears only once in a real dictionary). The value can be anything.

## Creating a Dictionary

\`\`\`python
# Method 1: curly braces (most common)
student = {
    "name":   "Bob",
    "grade":  "A",
    "score":  95,
    "passed": True
}

# Method 2: dict() constructor
student = dict(name="Bob", grade="A", score=95)

# Method 3: empty dictionary, then add
student = {}
student["name"]  = "Bob"
student["grade"] = "A"
student["score"] = 95

# All three produce the same result
print(student)
# {'name': 'Bob', 'grade': 'A', 'score': 95, 'passed': True}
\`\`\`

## Reading Values

\`\`\`python
person = {"name": "Alice", "age": 30, "city": "Paris"}

# Method 1: square brackets — raises error if key doesn't exist
print(person["name"])   # Alice
print(person["age"])    # 30

# What happens with a missing key?
# print(person["phone"])   # KeyError: 'phone' — CRASH!

# Method 2: .get() — returns None (or a default) if key missing
print(person.get("phone"))           # None  (no crash!)
print(person.get("phone", "N/A"))    # N/A   (your custom default)
print(person.get("name",  "N/A"))    # Alice (key exists, returns value)

# RULE: use .get() whenever the key might not exist
#       use [] when you're sure the key exists
\`\`\`

## Adding and Updating Values

\`\`\`python
person = {"name": "Alice", "age": 30}

# Add a new key
person["city"] = "Paris"
print(person)   # {'name': 'Alice', 'age': 30, 'city': 'Paris'}

# Update an existing key (same syntax — Python doesn't care if it exists)
person["age"] = 31
print(person)   # {'name': 'Alice', 'age': 31, 'city': 'Paris'}

# Update multiple keys at once with .update()
person.update({"age": 32, "email": "alice@example.com"})
print(person)
# {'name': 'Alice', 'age': 32, 'city': 'Paris', 'email': 'alice@example.com'}
\`\`\`

## Removing Values

\`\`\`python
person = {"name": "Alice", "age": 30, "city": "Paris", "temp": "delete me"}

# del — remove a key (crash if key doesn't exist)
del person["temp"]
print(person)   # {'name': 'Alice', 'age': 30, 'city': 'Paris'}

# .pop() — remove and RETURN the value
age = person.pop("age")
print(age)      # 30 (the removed value)
print(person)   # {'name': 'Alice', 'city': 'Paris'}

# .pop() with default — no crash if key missing
phone = person.pop("phone", "not found")
print(phone)    # not found (no crash)
\`\`\`

## Checking If a Key Exists

\`\`\`python
person = {"name": "Alice", "age": 30}

# Use 'in' to check for a key
if "name" in person:
    print(f"Name is: {person['name']}")   # Name is: Alice

if "phone" not in person:
    print("No phone number stored")       # No phone number stored

# Never do this — it's slower and more code:
# if person.get("name") is not None:  ← use 'in' instead
\`\`\`

## Looping Through a Dictionary

This is where many beginners get confused. Let me show you all three ways:

\`\`\`python
scores = {"Alice": 92, "Bob": 85, "Carol": 78}

# 1. Loop over KEYS only (default behavior)
for name in scores:
    print(name)
# Alice
# Bob
# Carol

# 2. Loop over VALUES only
for score in scores.values():
    print(score)
# 92
# 85
# 78

# 3. Loop over BOTH keys and values (most useful)
for name, score in scores.items():
    print(f"{name}: {score}")
# Alice: 92
# Bob: 85
# Carol: 78

# .items() returns pairs like [('Alice', 92), ('Bob', 85), ...]
# The "name, score =" part unpacks each pair into two variables
\`\`\`

## Nested Dictionaries

Dictionaries can contain other dictionaries. This is how real data is structured (APIs, databases, config files).

\`\`\`python
# A dictionary of users
users = {
    "alice": {
        "name":  "Alice Smith",
        "age":   30,
        "email": "alice@example.com",
        "scores": [85, 92, 78]
    },
    "bob": {
        "name":  "Bob Jones",
        "age":   25,
        "email": "bob@example.com",
        "scores": [70, 88, 95]
    }
}

# Access nested values — chain the keys
print(users["alice"]["name"])       # Alice Smith
print(users["bob"]["age"])          # 25
print(users["alice"]["scores"][0])  # 85 (first score)

# Loop through nested dictionaries
for username, info in users.items():
    avg = sum(info["scores"]) / len(info["scores"])
    print(f"{username}: avg score = {avg:.1f}")
# alice: avg score = 85.0
# bob: avg score = 84.3
\`\`\`

## Dictionary Comprehensions

Just like list comprehensions, you can build dictionaries in one line:

\`\`\`python
# Regular approach
squares = {}
for x in range(1, 6):
    squares[x] = x ** 2
print(squares)   # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Dictionary comprehension — same result, one line
squares = {x: x ** 2 for x in range(1, 6)}
print(squares)   # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# With a condition
even_squares = {x: x ** 2 for x in range(1, 11) if x % 2 == 0}
print(even_squares)   # {2: 4, 4: 16, 6: 36, 8: 64, 10: 100}

# Transform an existing dictionary
prices = {"apple": 1.20, "banana": 0.50, "cherry": 3.00}
discounted = {item: round(price * 0.9, 2) for item, price in prices.items()}
print(discounted)   # {'apple': 1.08, 'banana': 0.45, 'cherry': 2.7}
\`\`\`

## Common Mistakes to Avoid

\`\`\`python
# Mistake 1: Using [] when the key might not exist
person = {"name": "Alice"}
# phone = person["phone"]   # KeyError! CRASH!
phone = person.get("phone", "N/A")  # Safe

# Mistake 2: Forgetting that keys are case-sensitive
data = {"Name": "Alice"}
# print(data["name"])   # KeyError! "name" ≠ "Name"
print(data["Name"])     # Alice — must match exactly

# Mistake 3: Using mutable types (like lists) as keys
# bad_dict = {[1,2]: "value"}   # TypeError: unhashable type: 'list'
good_dict = {(1,2): "value"}    # Tuples are fine as keys (immutable)

# Mistake 4: Modifying a dictionary while iterating over it
scores = {"Alice": 85, "Bob": 42, "Carol": 91}
# for name in scores:           # RuntimeError in Python 3!
#     if scores[name] < 60:
#         del scores[name]

# Correct: iterate over a copy
for name in list(scores.keys()):
    if scores[name] < 60:
        del scores[name]
print(scores)   # {'Alice': 85, 'Carol': 91}
\`\`\`

## Real-World Example: Word Frequency Counter

\`\`\`python
def word_frequency(text):
    """Count how many times each word appears in a text."""
    # Convert to lowercase and split into words
    words = text.lower().split()
    
    frequency = {}
    for word in words:
        # Remove punctuation from word
        word = word.strip(".,!?;:")
        
        if word in frequency:
            frequency[word] += 1    # word seen before: increment
        else:
            frequency[word] = 1     # word seen first time: set to 1
    
    return frequency

text = "the cat sat on the mat the cat is fat"
freq = word_frequency(text)
print(freq)
# {'the': 3, 'cat': 2, 'sat': 1, 'on': 1, 'mat': 1, 'is': 1, 'fat': 1}

# Sort by frequency (most common first)
sorted_freq = sorted(freq.items(), key=lambda x: x[1], reverse=True)
for word, count in sorted_freq:
    print(f"  '{word}': {count} time{'s' if count > 1 else ''}")
\`\`\`

## Quick Reference

\`\`\`python
d = {"a": 1, "b": 2, "c": 3}

d["a"]              # get value (crash if missing)
d.get("x", 0)       # get value (return 0 if missing)
d["d"] = 4          # add or update
del d["a"]          # remove (crash if missing)
d.pop("b", None)    # remove and return (None if missing)

"a" in d            # True — check if key exists
len(d)              # number of key-value pairs

d.keys()            # all keys
d.values()          # all values
d.items()           # all (key, value) pairs

for k, v in d.items():   # loop over both
    ...
\`\`\`
`,

  fr: `# Dictionnaires

## Le problème que les dictionnaires résolvent

Imaginez que vous voulez stocker des informations sur une personne. Avec une liste, vous feriez ceci :

\`\`\`python
personne = ["Alice", 30, "Paris", "alice@example.com"]
\`\`\`

Mais maintenant vous avez un problème : pour obtenir l'email, vous devez vous souvenir qu'il est à l'index 3. C'est fragile et déroutant.

**Un dictionnaire résout ceci en étiquetant chaque valeur avec un nom :**

\`\`\`python
personne = {
    "nom":   "Alice",
    "age":   30,
    "ville": "Paris",
    "email": "alice@example.com"
}
\`\`\`

## Le modèle mental : un vrai dictionnaire

Pensez à un dictionnaire Python exactement comme à un vrai dictionnaire :
- Un vrai dictionnaire associe un **mot** → à sa **définition**
- Un dictionnaire Python associe une **clé** → à une **valeur**

La clé est toujours unique. La valeur peut être n'importe quoi.

## Créer un dictionnaire

\`\`\`python
etudiant = {
    "nom":    "Bob",
    "note":   "A",
    "score":  95,
    "reussi": True
}
\`\`\`

## Lire les valeurs

\`\`\`python
personne = {"nom": "Alice", "age": 30}

# Crochets — génère une erreur si la clé n'existe pas
print(personne["nom"])   # Alice

# .get() — retourne None (ou une valeur par défaut) si la clé est absente
print(personne.get("telephone"))          # None — pas de crash !
print(personne.get("telephone", "N/D"))   # N/D

# RÈGLE : utilisez .get() quand la clé pourrait ne pas exister
#         utilisez [] quand vous êtes sûr que la clé existe
\`\`\`

## Parcourir un dictionnaire

\`\`\`python
scores = {"Alice": 92, "Bob": 85, "Carol": 78}

# 1. Seulement les CLÉS
for nom in scores:
    print(nom)

# 2. Seulement les VALEURS
for score in scores.values():
    print(score)

# 3. CLÉS et VALEURS ensemble (le plus utile)
for nom, score in scores.items():
    print(f"{nom}: {score}")
\`\`\`

## Erreurs courantes à éviter

\`\`\`python
# Erreur 1 : utiliser [] quand la clé pourrait ne pas exister
# telephone = personne["telephone"]    # KeyError ! CRASH !
telephone = personne.get("telephone", "N/D")  # sécurisé

# Erreur 2 : oublier que les clés sont sensibles à la casse
data = {"Nom": "Alice"}
# print(data["nom"])    # KeyError ! "nom" ≠ "Nom"

# Erreur 3 : modifier un dictionnaire pendant l'itération
scores = {"Alice": 85, "Bob": 42}
for nom in list(scores.keys()):   # itérer sur une copie
    if scores[nom] < 60:
        del scores[nom]
\`\`\`
`,
};

export const starterCode = {
  default: `# Dictionaries — Practice

# --- Part 1: Create and access ---
student = {
    "name":  "Alice",
    "age":   20,
    "grade": "B",
    "score": 82
}

print(f"Name: {student['name']}")
print(f"Score: {student['score']}")
print(f"Phone: {student.get('phone', 'not provided')}")

# --- Part 2: Add, update, remove ---
student["city"] = "Paris"           # add new key
student["score"] = 88               # update existing key
removed = student.pop("age", None)  # remove and return
print(f"\\nUpdated student: {student}")
print(f"Removed age: {removed}")

# --- Part 3: Loop ---
print("\\nAll info:")
for key, value in student.items():
    print(f"  {key}: {value}")

# --- Part 4: Count word frequency ---
text = "to be or not to be that is the question to be"
words = text.split()
frequency = {}
for word in words:
    frequency[word] = frequency.get(word, 0) + 1

print("\\nWord frequency:")
for word, count in sorted(frequency.items(), key=lambda x: x[1], reverse=True):
    print(f"  '{word}': {count}")
`,
};

export const exerciseEn = `Build a simple inventory system using a dictionary. 
The inventory maps product names to their quantities.
Write functions to:
1. add_stock(inventory, product, quantity) — add quantity to a product
2. remove_stock(inventory, product, quantity) — remove quantity (don't go below 0)
3. low_stock(inventory, threshold) — return list of products below threshold
Test it with at least 5 products.`;

export const exerciseFr = `Construisez un système d'inventaire simple avec un dictionnaire.
L'inventaire associe les noms de produits à leurs quantités.
Écrivez des fonctions pour :
1. ajouter_stock(inventaire, produit, quantite) — ajouter de la quantité
2. retirer_stock(inventaire, produit, quantite) — retirer (sans descendre sous 0)
3. stock_bas(inventaire, seuil) — retourner les produits sous le seuil
Testez avec au moins 5 produits.`;

export const solutionCode = {
  default: `def add_stock(inventory, product, quantity):
    """Add quantity to a product."""
    inventory[product] = inventory.get(product, 0) + quantity

def remove_stock(inventory, product, quantity):
    """Remove quantity from a product, minimum 0."""
    current = inventory.get(product, 0)
    inventory[product] = max(0, current - quantity)

def low_stock(inventory, threshold):
    """Return list of products with quantity below threshold."""
    return [product for product, qty in inventory.items() if qty < threshold]

# Test the system
inventory = {}
add_stock(inventory, "apple",   50)
add_stock(inventory, "banana",  30)
add_stock(inventory, "cherry",   8)
add_stock(inventory, "mango",   15)
add_stock(inventory, "grape",    3)

print("Initial inventory:")
for product, qty in inventory.items():
    print(f"  {product}: {qty}")

remove_stock(inventory, "apple", 45)
remove_stock(inventory, "banana", 5)

print("\\nAfter sales:")
for product, qty in inventory.items():
    print(f"  {product}: {qty}")

print(f"\\nLow stock (< 10): {low_stock(inventory, 10)}")
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the difference between person['phone'] and person.get('phone') when 'phone' is not in the dictionary?",
      options: [
        "They behave identically — both return None",
        "person['phone'] raises a KeyError and crashes the program. person.get('phone') returns None safely. Always use .get() when a key might not exist.",
        "person['phone'] returns an empty string, person.get('phone') returns None",
        "person.get('phone') raises an error, person['phone'] returns None",
      ],
      correct: 1,
    },
    {
      question: "What does .items() return when you loop over a dictionary?",
      options: [
        "Only the keys",
        "Only the values",
        "Both key-value pairs as tuples — for name, score in scores.items() gives you each key and value together",
        "The length of the dictionary",
      ],
      correct: 2,
    },
    {
      question:
        "You have scores = {'Alice': 85, 'Bob': 42}. What is the correct way to update Bob's score to 75?",
      options: [
        "scores.update('Bob', 75)",
        "scores['Bob'] = 75 — assigning to an existing key updates its value",
        "scores.add('Bob', 75)",
        "scores.set('Bob', 75)",
      ],
      correct: 1,
    },
    {
      question:
        "What does frequency[word] = frequency.get(word, 0) + 1 do in a word counter?",
      options: [
        "It creates a new dictionary for each word",
        "It gets the current count of word (defaulting to 0 if not seen before) and adds 1 — elegantly handling both first occurrence and repeated occurrences in one line",
        "It adds the word as a key with value 1, ignoring duplicates",
        "It removes the word from the dictionary",
      ],
      correct: 1,
    },
    {
      question: "Why can't you use a list as a dictionary key?",
      options: [
        "Lists are too large to use as keys",
        "Python only allows string keys in dictionaries",
        "Dictionary keys must be hashable (immutable). Lists can be modified after creation so Python cannot compute a stable hash for them. Use tuples instead.",
        "Lists cause infinite loops when used as dictionary keys",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question:
        "Quelle est la différence entre personne['telephone'] et personne.get('telephone') quand 'telephone' n'est pas dans le dictionnaire ?",
      options: [
        "Ils se comportent de la même façon — les deux retournent None",
        "personne['telephone'] génère une KeyError et fait planter le programme. personne.get('telephone') retourne None en toute sécurité. Utilisez toujours .get() quand une clé pourrait ne pas exister.",
        "personne['telephone'] retourne une chaîne vide, personne.get('telephone') retourne None",
        "personne.get('telephone') génère une erreur, personne['telephone'] retourne None",
      ],
      correct: 1,
    },
    {
      question: "Que retourne .items() quand vous parcourez un dictionnaire ?",
      options: [
        "Seulement les clés",
        "Seulement les valeurs",
        "Les paires clé-valeur sous forme de tuples — for nom, score in scores.items() vous donne chaque clé et valeur ensemble",
        "La longueur du dictionnaire",
      ],
      correct: 2,
    },
    {
      question:
        "Vous avez scores = {'Alice': 85, 'Bob': 42}. Quelle est la bonne façon de mettre à jour le score de Bob à 75 ?",
      options: [
        "scores.update('Bob', 75)",
        "scores['Bob'] = 75 — assigner à une clé existante met à jour sa valeur",
        "scores.add('Bob', 75)",
        "scores.set('Bob', 75)",
      ],
      correct: 1,
    },
    {
      question:
        "Que fait frequence[mot] = frequence.get(mot, 0) + 1 dans un compteur de mots ?",
      options: [
        "Cela crée un nouveau dictionnaire pour chaque mot",
        "Cela obtient le comptage actuel du mot (par défaut 0 s'il n'a pas été vu) et ajoute 1 — gérant élégamment la première occurrence et les répétitions en une seule ligne",
        "Cela ajoute le mot comme clé avec la valeur 1, ignorant les doublons",
        "Cela supprime le mot du dictionnaire",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi ne peut-on pas utiliser une liste comme clé de dictionnaire ?",
      options: [
        "Les listes sont trop grandes pour être utilisées comme clés",
        "Python n'autorise que les clés de type chaîne dans les dictionnaires",
        "Les clés de dictionnaire doivent être hachables (immuables). Les listes peuvent être modifiées après création donc Python ne peut pas calculer un hash stable pour elles. Utilisez des tuples à la place.",
        "Les listes causent des boucles infinies quand elles sont utilisées comme clés",
      ],
      correct: 2,
    },
  ],
};
