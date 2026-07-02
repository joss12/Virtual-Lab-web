export const id = "variables-and-types";

export const titleEn = "Variables & Types";
export const titleFr = "Variables et types";

export const content = {
  en: `# Variables & Types

## What Is a Variable?

A variable is a named container that holds a value.

\`\`\`python
name = "Alice"
age = 30
is_student = True
\`\`\`

Python automatically detects the variable type.

## Strings

\`\`\`python
first_name = "Alice"
last_name = "Smith"

full_name = first_name + " " + last_name

print(full_name)

message = f"Hello, {first_name}!"
print(message)
\`\`\`

## Integers

\`\`\`python
age = 30
year = 2024

sum_result = 10 + 3
difference = 10 - 3
product = 10 * 3
quotient = 10 / 3
floor_div = 10 // 3
remainder = 10 % 3
power = 2 ** 10
\`\`\`

## Floats

\`\`\`python
price = 29.99
pi = 3.14159

print(0.1 + 0.2)
print(round(0.1 + 0.2, 2))
\`\`\`

## Booleans

\`\`\`python
is_raining = True
is_sunny = False

print(10 > 5)
print(10 == 10)
print(10 != 5)
\`\`\`

## Type Conversion

\`\`\`python
age_text = "25"
age_number = int(age_text)

score = 100
score_text = str(score)

price_text = "29.99"
price = float(price_text)

print(f"Age: {30}")
\`\`\`

## None

\`\`\`python
result = None

if result is None:
    print("No result")
\`\`\`
`,

  fr: `# Variables et types

## Qu'est-ce qu'une variable ?

Une variable est un conteneur nommé qui contient une valeur.

\`\`\`python
nom = "Alice"
age = 30
est_etudiant = True
\`\`\`

Python détecte automatiquement le type.

## Chaînes de caractères

\`\`\`python
prenom = "Alice"
nom = "Smith"

nom_complet = prenom + " " + nom

print(nom_complet)

message = f"Bonjour, {prenom}!"
print(message)
\`\`\`
`,
};

export const starterCode = {
  default: `# Variables & Types — Practice

name = "Alice"
age = 30
price = 29.99
is_student = True

print(f"name: {name} (type: {type(name).__name__})")
print(f"age: {age} (type: {type(age).__name__})")
print(f"price: {price} (type: {type(price).__name__})")
print(f"is_student: {is_student} (type: {type(is_student).__name__})")

print(f"\\nIn 5 years, age will be: {age + 5}")
print(f"Price with 10% discount: {price * 0.9:.2f}")

age_text = str(age)

print(f"\\nage as string: '{age_text}' (type: {type(age_text).__name__})")
`,
};

export const exerciseEn =
  "Modify the code: add your own name, change the age, add a new variable called 'city' and print a sentence using all variables.";

export const exerciseFr =
  "Modifiez le code : ajoutez votre propre nom, changez l'âge, ajoutez une variable 'ville' et affichez une phrase utilisant toutes les variables.";

export const solutionCode = {
  default: `# Solution example

name = "Bob"
age = 25
price = 49.99
is_student = False
city = "Paris"

print(f"Hello! My name is {name}.")
print(f"I am {age} years old and I live in {city}.")
print(f"Student: {is_student}")
print(f"Budget: \${price:.2f}")

age_next_year = age + 1

print(f"Next year I will be {age_next_year} years old.")
`,
};

export const quiz = {
  en: [
    {
      question: "What is the difference between = and == in Python?",
      options: [
        "They are identical",
        "= assigns a value. == compares values.",
        "= is for strings",
        "== assigns values",
      ],
      correct: 1,
    },

    {
      question: "What does this code print? x = int('42') + 8",
      options: ["Error", "'428'", "50", "42.8"],
      correct: 2,
    },

    {
      question: "What is the result of 10 // 3 in Python?",
      options: ["3.333", "3", "1", "Error"],
      correct: 1,
    },

    {
      question: "Which variable name follows Python conventions correctly?",
      options: ["FirstName", "first-name", "first_name", "2name"],
      correct: 2,
    },

    {
      question: 'What does f"Hello {name}" do in Python?',
      options: [
        "It creates a function called Hello",
        "It inserts the variable value into the string",
        "It raises an error",
        "It prints {name} literally",
      ],
      correct: 1,
    },
  ],

  fr: [
    {
      question: "Quelle est la différence entre = et == en Python ?",
      options: [
        "Ils sont identiques",
        "= assigne une valeur. == compare deux valeurs.",
        "= est pour les chaînes",
        "== assigne une valeur",
      ],
      correct: 1,
    },

    {
      question: 'Que fait f"Bonjour {nom}" en Python ?',
      options: [
        "Cela crée une fonction",
        "Cela insère la valeur de la variable dans la chaîne",
        "Cela provoque une erreur",
        "Cela affiche {nom} littéralement",
      ],
      correct: 1,
    },
  ],
};
