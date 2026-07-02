export const id = "functions";
export const titleEn = "Functions";
export const titleFr = "Fonctions";

export const content = {
  en: `# Functions

## What Is a Function?

A function is a reusable block of code that performs a specific task. You define it once and call it as many times as you need.

\`\`\`python
# Without functions — repeated code
print("Hello, Alice!")
print("Welcome to the platform.")
print("---")
print("Hello, Bob!")
print("Welcome to the platform.")
print("---")

# With a function — define once, use many times
def greet(name):
    print(f"Hello, {name}!")
    print("Welcome to the platform.")
    print("---")

greet("Alice")
greet("Bob")
greet("Carol")
\`\`\`

## Defining and Calling Functions

\`\`\`python
# Basic function — no parameters, no return value
def say_hello():
    print("Hello!")

say_hello()    # calling the function → Hello!
say_hello()    # calling again → Hello!

# Function with parameters
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")   # Hello, Alice!
greet("Bob")     # Hello, Bob!
\`\`\`

## Parameters vs Arguments

\`\`\`python
# "name" and "age" are PARAMETERS (defined in the function)
def introduce(name, age):
    print(f"I'm {name}, {age} years old.")

# "Alice" and 30 are ARGUMENTS (values passed when calling)
introduce("Alice", 30)   # I'm Alice, 30 years old.
introduce("Bob", 25)     # I'm Bob, 25 years old.
\`\`\`

## Return Values

\`\`\`python
# Without return: function does something but gives nothing back
def print_double(x):
    print(x * 2)

print_double(5)   # prints 10
result = print_double(5)
print(result)     # None (no return value!)

# With return: function gives a value back
def double(x):
    return x * 2

result = double(5)
print(result)     # 10

# You can use the return value directly
print(double(7))           # 14
print(double(3) + double(4))  # 14
\`\`\`

## Default Parameters

\`\`\`python
# Default values for parameters — used when argument not provided
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Alice")               # Hello, Alice!   (uses default)
greet("Bob", "Good morning") # Good morning, Bob!  (overrides default)
greet("Carol", greeting="Hey")  # Hey, Carol!

# Default parameters must come AFTER required parameters
def create_user(name, role="user", active=True):
    return {"name": name, "role": role, "active": active}

user1 = create_user("Alice")
user2 = create_user("Bob", "admin")
user3 = create_user("Carol", active=False)
print(user1)   # {'name': 'Alice', 'role': 'user', 'active': True}
print(user2)   # {'name': 'Bob', 'role': 'admin', 'active': True}
print(user3)   # {'name': 'Carol', 'role': 'user', 'active': False}
\`\`\`

## Multiple Return Values

\`\`\`python
# Python functions can return multiple values (as a tuple)
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([3, 1, 4, 1, 5, 9, 2, 6])
print(f"Min: {low}, Max: {high}")   # Min: 1, Max: 9

def divide_with_remainder(a, b):
    quotient = a // b
    remainder = a % b
    return quotient, remainder

q, r = divide_with_remainder(17, 5)
print(f"17 ÷ 5 = {q} remainder {r}")   # 17 ÷ 5 = 3 remainder 2
\`\`\`

## Scope — Where Variables Live

\`\`\`python
# Local scope: variable exists only inside the function
def my_function():
    local_var = "I'm local"
    print(local_var)   # works fine

my_function()
# print(local_var)   # NameError: name 'local_var' is not defined

# Global scope: variable exists outside functions
global_var = "I'm global"

def read_global():
    print(global_var)   # can READ global variables

read_global()   # I'm global

# To MODIFY a global variable inside a function: use global keyword
# (usually a bad practice — prefer return values instead)
counter = 0

def increment():
    global counter
    counter += 1

increment()
increment()
print(counter)   # 2
\`\`\`

## *args and **kwargs — Flexible Parameters

\`\`\`python
# *args: accept any number of positional arguments
def sum_all(*numbers):
    total = 0
    for n in numbers:
        total += n
    return total

print(sum_all(1, 2, 3))          # 6
print(sum_all(1, 2, 3, 4, 5))    # 15
print(sum_all(10))               # 10

# **kwargs: accept any number of keyword arguments
def print_info(**details):
    for key, value in details.items():
        print(f"  {key}: {value}")

print_info(name="Alice", age=30, city="Paris")
# name: Alice
# age: 30
# city: Paris

# Combining both
def flexible(required, *args, **kwargs):
    print(f"Required: {required}")
    print(f"Extra args: {args}")
    print(f"Extra kwargs: {kwargs}")

flexible("hello", 1, 2, 3, color="blue", size=10)
\`\`\`

## Lambda Functions — Anonymous One-Liners

\`\`\`python
# Regular function
def square(x):
    return x ** 2

# Same thing as lambda
square = lambda x: x ** 2
print(square(5))   # 25

# Most useful with sorted(), map(), filter()
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
sorted_numbers = sorted(numbers)
print(sorted_numbers)   # [1, 1, 2, 3, 4, 5, 6, 9]

# Sort by custom key
words = ["banana", "apple", "cherry", "date"]
by_length = sorted(words, key=lambda w: len(w))
print(by_length)   # ['date', 'apple', 'banana', 'cherry']

# filter() — keep only items where function returns True
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)   # [4, 2, 6]

# map() — apply function to every item
doubled = list(map(lambda x: x * 2, [1, 2, 3, 4]))
print(doubled)   # [2, 4, 6, 8]
\`\`\`

## Docstrings — Documenting Your Functions

\`\`\`python
def calculate_bmi(weight_kg, height_m):
    """
    Calculate Body Mass Index (BMI).
    
    Args:
        weight_kg: Weight in kilograms
        height_m: Height in meters
    
    Returns:
        BMI value as a float
    
    Example:
        >>> calculate_bmi(70, 1.75)
        22.86
    """
    return weight_kg / height_m ** 2

bmi = calculate_bmi(70, 1.75)
print(f"BMI: {bmi:.2f}")   # BMI: 22.86

# Access docstring:
print(calculate_bmi.__doc__)
\`\`\`

## Real-World Example

\`\`\`python
def celsius_to_fahrenheit(celsius):
    return celsius * 9/5 + 32

def fahrenheit_to_celsius(fahrenheit):
    return (fahrenheit - 32) * 5/9

def describe_temperature(celsius):
    """Describe how hot or cold a temperature is."""
    if celsius < 0:
        description = "freezing"
    elif celsius < 10:
        description = "very cold"
    elif celsius < 20:
        description = "cool"
    elif celsius < 30:
        description = "warm"
    else:
        description = "hot"
    
    fahrenheit = celsius_to_fahrenheit(celsius)
    return f"{celsius}°C ({fahrenheit:.1f}°F) — {description}"

temperatures = [-10, 0, 15, 22, 35]
for temp in temperatures:
    print(describe_temperature(temp))
\`\`\`
`,

  fr: `# Fonctions

## Qu'est-ce qu'une fonction ?

Une fonction est un bloc de code réutilisable qui effectue une tâche spécifique. Vous la définissez une fois et l'appelez autant de fois que nécessaire.

## Définir et appeler des fonctions

\`\`\`python
def saluer(nom):
    print(f"Bonjour, {nom} !")

saluer("Alice")   # Bonjour, Alice !
saluer("Bob")     # Bonjour, Bob !
\`\`\`

## Valeur de retour

\`\`\`python
def doubler(x):
    return x * 2

resultat = doubler(5)
print(resultat)   # 10
\`\`\`

## Paramètres par défaut

\`\`\`python
def saluer(nom, salutation="Bonjour"):
    print(f"{salutation}, {nom} !")

saluer("Alice")                    # Bonjour, Alice !
saluer("Bob", "Bonne journée")     # Bonne journée, Bob !
\`\`\`

## Valeurs de retour multiples

\`\`\`python
def min_max(nombres):
    return min(nombres), max(nombres)

bas, haut = min_max([3, 1, 4, 1, 5, 9])
print(f"Min: {bas}, Max: {haut}")   # Min: 1, Max: 9
\`\`\`

## Portée — Où vivent les variables

\`\`\`python
# Portée locale : la variable existe uniquement dans la fonction
def ma_fonction():
    var_locale = "Je suis locale"
    print(var_locale)

# Portée globale : la variable existe en dehors des fonctions
var_globale = "Je suis globale"

def lire_globale():
    print(var_globale)   # peut LIRE les variables globales
\`\`\`

## Fonctions lambda — Une ligne anonyme

\`\`\`python
carre = lambda x: x ** 2
print(carre(5))   # 25

mots = ["banane", "pomme", "cerise", "datte"]
par_longueur = sorted(mots, key=lambda m: len(m))
print(par_longueur)   # ['datte', 'pomme', 'banane', 'cerise']
\`\`\`
`,
};

export const starterCode = {
  default: `# Functions — Practice

# --- Part 1: Basic function ---
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"))
print(greet("Bob", "Good morning"))

# --- Part 2: Function with calculation ---
def circle_area(radius):
    pi = 3.14159
    return pi * radius ** 2

for r in [1, 5, 10]:
    area = circle_area(r)
    print(f"Radius {r}: area = {area:.2f}")

# --- Part 3: Multiple return values ---
def stats(numbers):
    return min(numbers), max(numbers), sum(numbers) / len(numbers)

data = [4, 8, 15, 16, 23, 42]
minimum, maximum, average = stats(data)
print(f"\\nMin: {minimum}, Max: {maximum}, Avg: {average:.1f}")
`,
};

export const exerciseEn = "Write a function called 'is_palindrome' that takes a string and returns True if it reads the same forwards and backwards ('racecar', 'madam'), False otherwise. Test it on at least 5 words.";
export const exerciseFr = "Écrivez une fonction 'est_palindrome' qui prend une chaîne et retourne True si elle se lit de la même façon dans les deux sens ('racecar', 'madam'), False sinon. Testez-la sur au moins 5 mots.";

export const solutionCode = {
  default: `def is_palindrome(text):
    """Check if a string is a palindrome."""
    cleaned = text.lower().replace(" ", "")
    return cleaned == cleaned[::-1]

words = ["racecar", "hello", "madam", "python", "level", "world"]
for word in words:
    result = is_palindrome(word)
    print(f"'{word}': {result}")
`,
};

export const quiz = {
  en: [
    {
      question: "What is the difference between a parameter and an argument?",
      options: [
        "They are the same thing — just different names",
        "A parameter is the variable defined in the function definition. An argument is the actual value passed when calling the function.",
        "Parameters are for built-in functions, arguments are for custom functions",
        "Parameters are optional, arguments are required"
      ],
      correct: 1,
    },
    {
      question: "What does a function return if it has no return statement?",
      options: [
        "0",
        "An empty string",
        "None",
        "It raises an error"
      ],
      correct: 2,
    },
    {
      question: "What is the output?\ndef add(a, b=10):\n    return a + b\nprint(add(5))\nprint(add(5, 3))",
      options: [
        "5 and 5",
        "15 and 8",
        "Error — b is required",
        "10 and 3"
      ],
      correct: 1,
    },
    {
      question: "What does *args allow you to do?",
      options: [
        "Pass keyword arguments with any name",
        "Accept any number of positional arguments as a tuple",
        "Make all parameters optional",
        "Return multiple values from a function"
      ],
      correct: 1,
    },
    {
      question: "What is a lambda function?",
      options: [
        "A function that runs in a separate thread",
        "A function defined with the def keyword that returns None",
        "A small anonymous function defined in a single expression — equivalent to a simple def function",
        "A function that can only accept one argument"
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question: "Quelle est la différence entre un paramètre et un argument ?",
      options: [
        "Ce sont la même chose — juste des noms différents",
        "Un paramètre est la variable définie dans la définition de la fonction. Un argument est la valeur réelle passée lors de l'appel.",
        "Les paramètres sont pour les fonctions intégrées, les arguments pour les fonctions personnalisées",
        "Les paramètres sont optionnels, les arguments sont requis"
      ],
      correct: 1,
    },
    {
      question: "Que retourne une fonction sans instruction return ?",
      options: [
        "0",
        "Une chaîne vide",
        "None",
        "Elle génère une erreur"
      ],
      correct: 2,
    },
    {
      question: "Quelle est la sortie ?\ndef ajouter(a, b=10):\n    return a + b\nprint(ajouter(5))\nprint(ajouter(5, 3))",
      options: [
        "5 et 5",
        "15 et 8",
        "Erreur — b est requis",
        "10 et 3"
      ],
      correct: 1,
    },
    {
      question: "Que permet *args ?",
      options: [
        "Passer des arguments nommés avec n'importe quel nom",
        "Accepter n'importe quel nombre d'arguments positionnels sous forme de tuple",
        "Rendre tous les paramètres optionnels",
        "Retourner plusieurs valeurs d'une fonction"
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce qu'une fonction lambda ?",
      options: [
        "Une fonction qui s'exécute dans un thread séparé",
        "Une fonction définie avec le mot-clé def qui retourne None",
        "Une petite fonction anonyme définie en une seule expression — équivalente à une simple fonction def",
        "Une fonction qui ne peut accepter qu'un seul argument"
      ],
      correct: 2,
    },
  ],
};
