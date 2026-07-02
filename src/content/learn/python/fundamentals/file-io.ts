export const id = "file-io";
export const titleEn = "File I/O";
export const titleFr = "Fichiers I/O";

export const content = {
  en: `# File I/O

## Why Files Matter

Everything you've written so far disappears when the program stops. Variables live in RAM — temporary memory that gets wiped when Python exits.

**Files are how you make data permanent.**

\`\`\`
Without files:                    With files:
  Run program                       Run program
  Create data (names, scores...)    Create data
  Program exits                     Save to file
  Data gone forever ❌              Program exits
                                    Data still on disk ✓
  Run again                         Run again
  Start from zero ❌                Load from file ✓
                                    Continue where you left off ✓
\`\`\`

Every real application uses files: saving user preferences, reading configuration, loading data, writing logs, exporting reports. This is a fundamental skill.

## The Mental Model: A File Is Like a Book

Think of working with a file like working with a physical book:

\`\`\`
1. You OPEN the book (open the file)
2. You READ or WRITE pages (read or write data)
3. You CLOSE the book (close the file)

If you forget to close the book:
  - Other programs might not be able to use it
  - Your changes might not be saved properly
  - You waste system resources
\`\`\`

Python's \`with\` statement handles closing automatically — like having someone close the book for you no matter what happens.

## Opening Files: The Three Modes

Before you can read or write a file, you must open it. The **mode** tells Python what you want to do:

\`\`\`python
# "r" — READ mode (default)
#   Opens file for reading
#   Crashes if file doesn't exist
#   Cannot write to it

# "w" — WRITE mode
#   Creates file if it doesn't exist
#   WARNING: ERASES existing content if file exists!
#   Cannot read from it

# "a" — APPEND mode
#   Creates file if it doesn't exist
#   Adds to END of file (doesn't erase existing content)
#   Cannot read from it

# "r+" — READ and WRITE mode
#   File must exist (doesn't create it)
#   Can both read and write
\`\`\`

\`\`\`
Mode decision guide:
  "Does the file already exist and I want to READ it?"    → "r"
  "I want to CREATE or COMPLETELY REPLACE a file?"        → "w"
  "I want to ADD more data to an existing file?"          → "a"
\`\`\`

## Writing to a File

\`\`\`python
# The 'with' statement — ALWAYS use this (handles closing automatically)
with open("notes.txt", "w") as file:
    file.write("Hello, World!\\n")      # \\n = new line
    file.write("This is line 2.\\n")
    file.write("This is line 3.\\n")

# When the 'with' block ends, the file is automatically closed.
# Even if an error happens, the file still gets closed properly.

# What "notes.txt" contains now:
# Hello, World!
# This is line 2.
# This is line 3.
\`\`\`

\`\`\`python
# writelines() — write multiple lines from a list
lines = [
    "First line\\n",
    "Second line\\n",
    "Third line\\n",
]

with open("notes.txt", "w") as file:
    file.writelines(lines)

# Note: writelines() does NOT add newlines automatically
# You must include \\n in each string yourself
\`\`\`

\`\`\`python
# WARNING: "w" mode erases the file first!
with open("important.txt", "w") as file:
    file.write("Some data\\n")

# This ERASES "Some data" and replaces it:
with open("important.txt", "w") as file:
    file.write("New data\\n")

# To ADD without erasing, use "a" (append):
with open("log.txt", "a") as file:
    file.write("New log entry\\n")   # added to end, nothing erased
\`\`\`

## Reading from a File

\`\`\`python
# First, create a file to read:
with open("story.txt", "w") as file:
    file.write("Once upon a time\\n")
    file.write("there was a Python programmer\\n")
    file.write("who loved writing files.\\n")

# Method 1: read() — entire file as ONE string
with open("story.txt", "r") as file:
    content = file.read()
    print(content)
# Once upon a time
# there was a Python programmer
# who loved writing files.

print(type(content))   # <class 'str'>
print(repr(content))   # 'Once upon a time\\nthere was a Python programmer\\n...'
\`\`\`

\`\`\`python
# Method 2: readlines() — list of lines (each line is one string)
with open("story.txt", "r") as file:
    lines = file.readlines()

print(lines)
# ['Once upon a time\\n', 'there was a Python programmer\\n', 'who loved writing files.\\n']
# Notice: each line INCLUDES the \\n at the end

# Strip the newlines:
lines = [line.strip() for line in lines]
print(lines)
# ['Once upon a time', 'there was a Python programmer', 'who loved writing files.']
\`\`\`

\`\`\`python
# Method 3: loop line by line (BEST for large files — memory efficient)
with open("story.txt", "r") as file:
    for line in file:                # reads one line at a time
        line = line.strip()          # remove \\n and whitespace
        print(line)

# Why is this the best way for large files?
# read() loads the ENTIRE file into memory at once
# Looping reads one line at a time — uses almost no memory
# A 10GB log file: read() crashes, looping works fine
\`\`\`

## Handling the "File Doesn't Exist" Problem

What happens if you try to read a file that doesn't exist?

\`\`\`python
# This crashes:
with open("missing.txt", "r") as file:   # FileNotFoundError!
    content = file.read()

# Safe approach: check first
import os
if os.path.exists("missing.txt"):
    with open("missing.txt", "r") as file:
        content = file.read()
else:
    print("File not found")

# Even better: use try/except
try:
    with open("missing.txt", "r") as file:
        content = file.read()
        print(content)
except FileNotFoundError:
    print("File doesn't exist yet — starting fresh")
except PermissionError:
    print("No permission to read this file")
\`\`\`

## Working with CSV Files

CSV (Comma-Separated Values) is the most common format for storing tabular data. Think of it as a simple spreadsheet saved as text.

\`\`\`python
# A CSV file looks like this:
# name,age,score
# Alice,20,85
# Bob,22,92
# Carol,21,78

# Writing a CSV file manually:
students = [
    {"name": "Alice", "age": 20, "score": 85},
    {"name": "Bob",   "age": 22, "score": 92},
    {"name": "Carol", "age": 21, "score": 78},
]

with open("students.csv", "w") as file:
    # Write header row
    file.write("name,age,score\\n")
    # Write each student
    for student in students:
        file.write(f"{student['name']},{student['age']},{student['score']}\\n")

# Reading a CSV file manually:
with open("students.csv", "r") as file:
    lines = file.readlines()

header = lines[0].strip().split(",")   # ['name', 'age', 'score']
print(f"Columns: {header}")

students_read = []
for line in lines[1:]:                  # skip header line
    parts = line.strip().split(",")
    student = {
        "name":  parts[0],
        "age":   int(parts[1]),
        "score": int(parts[2]),
    }
    students_read.append(student)

for s in students_read:
    print(f"{s['name']}: score={s['score']}")
\`\`\`

## Working with JSON Files

JSON is the standard format for storing structured data (dictionaries, lists). It's human-readable and used everywhere in web APIs.

\`\`\`python
import json

# JSON looks exactly like Python dictionaries and lists:
# {"name": "Alice", "scores": [85, 92, 78], "active": true}

# --- Writing JSON ---
data = {
    "users": [
        {"name": "Alice", "score": 85, "active": True},
        {"name": "Bob",   "score": 92, "active": False},
    ],
    "total": 2
}

with open("data.json", "w") as file:
    json.dump(data, file, indent=2)    # indent=2 makes it readable

# data.json now contains:
# {
#   "users": [
#     {
#       "name": "Alice",
#       "score": 85,
#       "active": true
#     },
#     ...
#   ],
#   "total": 2
# }

# --- Reading JSON ---
with open("data.json", "r") as file:
    loaded = json.load(file)

print(loaded["total"])               # 2
print(loaded["users"][0]["name"])    # Alice

# JSON is perfect for saving dictionaries and lists permanently.
# A simple way to build a file-based "database".
\`\`\`

## A Real-World Example: A Simple Note-Taking App

Let's put everything together — a program that saves and loads notes:

\`\`\`python
import json
import os

NOTES_FILE = "notes.json"

def load_notes():
    """Load notes from file. Return empty list if file doesn't exist."""
    if not os.path.exists(NOTES_FILE):
        return []
    try:
        with open(NOTES_FILE, "r") as file:
            return json.load(file)
    except (json.JSONDecodeError, IOError):
        return []   # file corrupted or unreadable — start fresh

def save_notes(notes):
    """Save notes to file."""
    with open(NOTES_FILE, "w") as file:
        json.dump(notes, file, indent=2)

def add_note(text):
    """Add a new note."""
    notes = load_notes()
    notes.append({"id": len(notes) + 1, "text": text})
    save_notes(notes)
    print(f"Note saved: '{text}'")

def show_notes():
    """Print all notes."""
    notes = load_notes()
    if not notes:
        print("No notes yet.")
        return
    for note in notes:
        print(f"  [{note['id']}] {note['text']}")

def delete_note(note_id):
    """Delete a note by ID."""
    notes = load_notes()
    notes = [n for n in notes if n["id"] != note_id]
    save_notes(notes)
    print(f"Note {note_id} deleted.")

# Test the app
add_note("Buy groceries")
add_note("Call the dentist")
add_note("Finish the Python course")

print("\\nAll notes:")
show_notes()

delete_note(2)

print("\\nAfter deleting note 2:")
show_notes()
\`\`\`

## Common Mistakes to Avoid

\`\`\`python
# Mistake 1: Forgetting 'with' and not closing the file
file = open("data.txt", "w")
file.write("hello")
# If an error happens here, file never gets closed → data may not be saved!
file.close()   # easy to forget!

# Always use 'with' instead:
with open("data.txt", "w") as file:
    file.write("hello")
# File automatically closed here, even if error occurs


# Mistake 2: Using "w" when you mean "a"
with open("log.txt", "w") as file:
    file.write("Entry 1\\n")

with open("log.txt", "w") as file:   # "w" ERASES Entry 1!
    file.write("Entry 2\\n")

# log.txt only contains Entry 2. Entry 1 is gone!
# Use "a" to keep existing content:
with open("log.txt", "a") as file:
    file.write("Entry 2\\n")


# Mistake 3: Forgetting \\n — everything on one line
with open("data.txt", "w") as file:
    file.write("line 1")    # no \\n
    file.write("line 2")    # no \\n

# data.txt contains: line 1line 2  (one line, no space)
# Fix:
with open("data.txt", "w") as file:
    file.write("line 1\\n")
    file.write("line 2\\n")


# Mistake 4: Reading a file that doesn't exist
with open("missing.txt", "r") as file:   # FileNotFoundError!
    pass
# Always check with os.path.exists() or use try/except
\`\`\`

## Quick Reference

\`\`\`python
import json, os

# Write
with open("file.txt", "w") as f:    # create/overwrite
    f.write("text\\n")

with open("file.txt", "a") as f:    # append
    f.write("more\\n")

# Read
with open("file.txt", "r") as f:
    content = f.read()              # entire file as string
    lines   = f.readlines()         # list of lines
    for line in f:                  # line by line (memory efficient)
        pass

# Check existence
os.path.exists("file.txt")          # True / False

# JSON
with open("data.json", "w") as f:
    json.dump(my_dict, f, indent=2) # write

with open("data.json", "r") as f:
    data = json.load(f)             # read
\`\`\`
`,

  fr: `# Fichiers I/O

## Pourquoi les fichiers sont importants

Tout ce que vous avez écrit jusqu'ici disparaît quand le programme s'arrête. Les variables vivent en RAM — mémoire temporaire effacée quand Python se termine.

**Les fichiers permettent de rendre les données permanentes.**

## Le modèle mental : un fichier est comme un livre

\`\`\`
1. Vous OUVREZ le livre  (ouvrir le fichier)
2. Vous LISEZ ou ÉCRIVEZ des pages (lire ou écrire des données)
3. Vous FERMEZ le livre  (fermer le fichier)

Si vous oubliez de fermer :
  - D'autres programmes pourraient ne pas pouvoir l'utiliser
  - Vos modifications pourraient ne pas être sauvegardées
\`\`\`

## Les trois modes d'ouverture

\`\`\`python
# "r" — Lecture (défaut)
#   Ouvre pour lire uniquement
#   Plante si le fichier n'existe pas

# "w" — Écriture
#   Crée le fichier s'il n'existe pas
#   ATTENTION : EFFACE le contenu si le fichier existe !

# "a" — Ajout (append)
#   Crée le fichier s'il n'existe pas
#   Ajoute à la FIN sans effacer le contenu existant
\`\`\`

## Écrire dans un fichier

\`\`\`python
# Utilisez TOUJOURS 'with' — gère la fermeture automatiquement
with open("notes.txt", "w") as fichier:
    fichier.write("Bonjour, monde !\\n")
    fichier.write("Ceci est la ligne 2.\\n")
# Le fichier est fermé automatiquement ici

# ATTENTION : le mode "w" efface d'abord le fichier !
# Pour AJOUTER sans effacer, utilisez "a" :
with open("journal.txt", "a") as fichier:
    fichier.write("Nouvelle entrée\\n")   # ajouté à la fin
\`\`\`

## Lire un fichier

\`\`\`python
# Méthode 1 : read() — tout le fichier en UNE chaîne
with open("histoire.txt", "r") as fichier:
    contenu = fichier.read()

# Méthode 2 : readlines() — liste de lignes
with open("histoire.txt", "r") as fichier:
    lignes = fichier.readlines()
# Chaque ligne INCLUT le \\n à la fin
lignes = [ligne.strip() for ligne in lignes]  # enlever \\n

# Méthode 3 : boucle ligne par ligne (MEILLEURE pour les grands fichiers)
with open("histoire.txt", "r") as fichier:
    for ligne in fichier:
        print(ligne.strip())
\`\`\`

## Fichiers JSON

\`\`\`python
import json

# Écrire du JSON
data = {"nom": "Alice", "score": 85, "actif": True}
with open("data.json", "w") as fichier:
    json.dump(data, fichier, indent=2)

# Lire du JSON
with open("data.json", "r") as fichier:
    chargé = json.load(fichier)
print(chargé["nom"])   # Alice
\`\`\`

## Erreurs courantes à éviter

\`\`\`python
# Erreur 1 : oublier 'with' et ne pas fermer le fichier
# Utilisez TOUJOURS 'with open(...) as f:'

# Erreur 2 : utiliser "w" quand vous voulez "a"
# "w" EFFACE le contenu existant !
# "a" AJOUTE à la fin sans effacer

# Erreur 3 : oublier \\n — tout sur une seule ligne
fichier.write("ligne 1")   # pas de \\n
fichier.write("ligne 2")   # résultat : "ligne 1ligne 2"

# Erreur 4 : lire un fichier inexistant sans vérifier
import os
if os.path.exists("fichier.txt"):
    with open("fichier.txt", "r") as f:
        contenu = f.read()
\`\`\`
`,
};

export const starterCode = {
  default: `# File I/O — Practice
import json
import os

# --- Part 1: Write and read a text file ---
with open("my_notes.txt", "w") as f:
    f.write("Python is great\\n")
    f.write("Files make data permanent\\n")
    f.write("Always use 'with' to open files\\n")

print("=== Reading my_notes.txt ===")
with open("my_notes.txt", "r") as f:
    for i, line in enumerate(f, start=1):
        print(f"  Line {i}: {line.strip()}")

# --- Part 2: Append to a file ---
with open("my_notes.txt", "a") as f:
    f.write("Appended line — not erased!\\n")

print("\\n=== After appending ===")
with open("my_notes.txt", "r") as f:
    print(f.read())

# --- Part 3: JSON read/write ---
data = {
    "students": [
        {"name": "Alice", "score": 85},
        {"name": "Bob",   "score": 92},
    ]
}

with open("students.json", "w") as f:
    json.dump(data, f, indent=2)

with open("students.json", "r") as f:
    loaded = json.load(f)

print("=== JSON data ===")
for student in loaded["students"]:
    print(f"  {student['name']}: {student['score']}")
`,
};

export const exerciseEn = `Build a simple score tracker that persists between runs using JSON.
Write these functions:
1. load_scores() — load scores from 'scores.json' (return {} if file missing)
2. save_scores(scores) — save scores dict to 'scores.json'
3. add_score(name, score) — add or update a player's score
4. top_players(n) — return the top n players sorted by score
5. show_leaderboard() — print all players sorted by score

Test: add at least 5 players, show the leaderboard, update one score, show again.`;

export const exerciseFr = `Construisez un suivi de scores qui persiste entre les exécutions via JSON.
Écrivez ces fonctions :
1. charger_scores() — charger depuis 'scores.json' (retourner {} si absent)
2. sauvegarder_scores(scores) — sauvegarder le dict dans 'scores.json'
3. ajouter_score(nom, score) — ajouter ou mettre à jour le score d'un joueur
4. meilleurs_joueurs(n) — retourner les n meilleurs joueurs triés par score
5. afficher_classement() — afficher tous les joueurs triés par score

Test : ajoutez au moins 5 joueurs, affichez le classement, mettez à jour un score, affichez à nouveau.`;

export const solutionCode = {
  default: `import json
import os

SCORES_FILE = "scores.json"

def load_scores():
    """Load scores from file. Return empty dict if file missing."""
    if not os.path.exists(SCORES_FILE):
        return {}
    try:
        with open(SCORES_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}

def save_scores(scores):
    """Save scores to file."""
    with open(SCORES_FILE, "w") as f:
        json.dump(scores, f, indent=2)

def add_score(name, score):
    """Add or update a player's score."""
    scores = load_scores()
    scores[name] = score
    save_scores(scores)
    print(f"Saved: {name} = {score}")

def top_players(n):
    """Return top n players sorted by score."""
    scores = load_scores()
    sorted_players = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_players[:n]

def show_leaderboard():
    """Print all players sorted by score."""
    scores = load_scores()
    if not scores:
        print("No scores yet.")
        return
    print("\\n=== LEADERBOARD ===")
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    for i, (name, score) in enumerate(sorted_scores, start=1):
        print(f"  {i}. {name}: {score}")

# Test
add_score("Alice",  850)
add_score("Bob",    920)
add_score("Carol",  780)
add_score("David", 1050)
add_score("Eve",    670)

show_leaderboard()

print("\\nUpdating Alice's score...")
add_score("Alice", 990)

show_leaderboard()

print(f"\\nTop 3: {top_players(3)}")
`,
};

export const quiz = {
  en: [
    {
      question: "What is the key difference between opening a file with 'w' vs 'a' mode?",
      options: [
        "They are identical — both add content to the end of the file",
        "'w' (write) creates the file or ERASES existing content before writing. 'a' (append) creates the file or ADDS to the end without erasing anything. Use 'w' to replace, 'a' to add.",
        "'w' is for text files, 'a' is for binary files",
        "'a' is faster than 'w' because it skips to the end of the file"
      ],
      correct: 1,
    },
    {
      question: "Why should you always use 'with open(...) as f:' instead of manually calling file.close()?",
      options: [
        "The 'with' statement is faster than manually closing",
        "There is no difference — both approaches work equally well",
        "'with' guarantees the file is closed automatically when the block ends — even if an error occurs inside the block. Manual close() is easy to forget and won't run if an exception is raised before it.",
        "file.close() is deprecated in Python 3"
      ],
      correct: 2,
    },
    {
      question: "What is the difference between f.read() and looping over a file line by line?",
      options: [
        "f.read() is always faster so you should always use it",
        "f.read() loads the ENTIRE file into memory as one string — fine for small files but crashes for huge ones. Looping reads one line at a time using minimal memory, so a 10GB log file can be processed without issues.",
        "Looping line by line only works for text files, f.read() works for all types",
        "They produce different results — f.read() skips empty lines"
      ],
      correct: 1,
    },
    {
      question: "You run your program twice. The first run writes 'Entry 1' to log.txt with 'w' mode. The second run writes 'Entry 2' with 'w' mode. What does log.txt contain after both runs?",
      options: [
        "Entry 1 and Entry 2 — both entries are preserved",
        "Only Entry 2 — 'w' mode erases the file before writing, so Entry 1 is gone",
        "An error — you cannot open the same file twice",
        "Entry 2 Entry 1 — new content is added before old content"
      ],
      correct: 1,
    },
    {
      question: "What does json.dump(data, file, indent=2) do differently from json.dump(data, file)?",
      options: [
        "indent=2 compresses the file to save space",
        "indent=2 formats the JSON with 2-space indentation making it human-readable — easier to read and debug. Without indent, everything is on one line which is compact but hard to read.",
        "indent=2 splits the file into 2 separate files",
        "There is no difference — indent is ignored by json.dump"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Quelle est la différence clé entre ouvrir un fichier avec le mode 'w' vs 'a' ?",
      options: [
        "Ils sont identiques — les deux ajoutent du contenu à la fin du fichier",
        "'w' (write) crée le fichier ou EFFACE le contenu existant avant d'écrire. 'a' (append) crée le fichier ou AJOUTE à la fin sans rien effacer. Utilisez 'w' pour remplacer, 'a' pour ajouter.",
        "'w' est pour les fichiers texte, 'a' est pour les fichiers binaires",
        "'a' est plus rapide que 'w' car il saute directement à la fin du fichier"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi devriez-vous toujours utiliser 'with open(...) as f:' au lieu d'appeler manuellement file.close() ?",
      options: [
        "L'instruction 'with' est plus rapide que la fermeture manuelle",
        "Il n'y a pas de différence — les deux approches fonctionnent également bien",
        "'with' garantit que le fichier est fermé automatiquement quand le bloc se termine — même si une erreur se produit. close() manuel est facile à oublier et ne s'exécutera pas si une exception est levée avant.",
        "file.close() est déprécié en Python 3"
      ],
      correct: 2,
    },
    {
      question: "Quelle est la différence entre f.read() et parcourir un fichier ligne par ligne ?",
      options: [
        "f.read() est toujours plus rapide donc vous devriez toujours l'utiliser",
        "f.read() charge le fichier ENTIER en mémoire — bien pour les petits fichiers mais problématique pour les grands. Parcourir ligne par ligne lit une ligne à la fois avec une mémoire minimale, donc un fichier de 10 Go peut être traité sans problème.",
        "La boucle ligne par ligne ne fonctionne que pour les fichiers texte",
        "Ils produisent des résultats différents — f.read() saute les lignes vides"
      ],
      correct: 1,
    },
    {
      question: "Vous exécutez votre programme deux fois. La première écriture 'Entrée 1' dans journal.txt avec le mode 'w'. La deuxième écrit 'Entrée 2' avec le mode 'w'. Que contient journal.txt après les deux exécutions ?",
      options: [
        "Entrée 1 et Entrée 2 — les deux entrées sont préservées",
        "Seulement Entrée 2 — le mode 'w' efface le fichier avant d'écrire, donc Entrée 1 est perdue",
        "Une erreur — vous ne pouvez pas ouvrir le même fichier deux fois",
        "Entrée 2 Entrée 1 — le nouveau contenu est ajouté avant l'ancien"
      ],
      correct: 1,
    },
    {
      question: "Que fait json.dump(data, fichier, indent=2) différemment de json.dump(data, fichier) ?",
      options: [
        "indent=2 compresse le fichier pour économiser de l'espace",
        "indent=2 formate le JSON avec une indentation de 2 espaces le rendant lisible — plus facile à lire et déboguer. Sans indent, tout est sur une ligne, compact mais difficile à lire.",
        "indent=2 divise le fichier en 2 fichiers séparés",
        "Il n'y a pas de différence — indent est ignoré par json.dump"
      ],
      correct: 1,
    },
  ],
};
