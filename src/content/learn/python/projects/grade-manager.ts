export const id = "grade-manager";
export const titleEn = "Grade Manager";
export const titleFr = "Gestionnaire de notes";
export const descriptionEn =
  "Manage student grades — add grades, compute averages, find highest/lowest, sort students.";
export const descriptionFr =
  "Gérez les notes des étudiants — ajoutez des notes, calculez les moyennes, triez les étudiants.";

export const steps = [
  {
    titleEn: "Step 1 — Storing Students and Grades",
    titleFr: "Étape 1 — Stocker étudiants et notes",
    contentEn: `## Step 1 — Storing Students and Grades

Before writing any logic, we need to decide **how to store the data**. This is always the first question in any program. The data structure you choose shapes everything that follows.

We have two things to track:
- Each student has a **name** and a **list of grades**
- We have **multiple students**

The natural structure is a **dictionary of lists**:

\`\`\`
gradebook = {
    "Alice": [85, 92, 78, 90],
    "Bob":   [70, 65, 88, 72],
    "Carol": [95, 98, 92, 97],
}

gradebook["Alice"]      → [85, 92, 78, 90]  (all Alice's grades)
gradebook["Alice"][0]   → 85                (Alice's first grade)
\`\`\`

Why not a list of objects? We could use \`[{"name": "Alice", "grades": [...]}]\` but a dictionary is simpler and faster here — lookups by name are O(1) instead of O(N).

Why a list of grades per student? Because students take multiple tests, and we need all of them to compute averages, find the highest, etc.`,

    contentFr: `## Étape 1 — Stocker étudiants et notes

Avant d'écrire de la logique, nous devons décider **comment stocker les données**. La structure naturelle est un **dictionnaire de listes** :

\`\`\`
cahier_notes = {
    "Alice": [85, 92, 78, 90],
    "Bob":   [70, 65, 88, 72],
}
\`\`\`

Pourquoi pas une liste d'objets ? Un dictionnaire est plus simple et plus rapide — les recherches par nom sont O(1) au lieu de O(N).`,

    starterCode: {
      default: `# Step 1: Data structure for a gradebook

# A dictionary mapping student names to their list of grades
gradebook = {
    "Alice": [85, 92, 78, 90, 88],
    "Bob":   [70, 65, 88, 72, 60],
    "Carol": [95, 98, 92, 97, 100],
    "David": [55, 60, 58, 62, 70],
}

# --- Explore the structure ---
print("=== Gradebook Contents ===")
for student, grades in gradebook.items():
    print(f"  {student}: {grades}")

print()

# --- Access specific data ---
print("=== Specific Access ===")
print(f"Alice's grades:       {gradebook['Alice']}")
print(f"Alice's first grade:  {gradebook['Alice'][0]}")
print(f"Alice's last grade:   {gradebook['Alice'][-1]}")
print(f"Number of students:   {len(gradebook)}")
print(f"Number of grades (Alice): {len(gradebook['Alice'])}")

print()

# --- Add a new student ---
gradebook["Eve"] = [88, 91, 85]
print(f"After adding Eve: {list(gradebook.keys())}")

# --- Add a grade to an existing student ---
gradebook["Alice"].append(95)
print(f"Alice after new grade: {gradebook['Alice']}")

# --- Check if a student exists ---
for name in ["Alice", "Frank"]:
    if name in gradebook:
        print(f"  {name} is in the gradebook.")
    else:
        print(f"  {name} is NOT in the gradebook.")
`,
    },
    expectedOutput: `=== Gradebook Contents ===
  Alice: [85, 92, 78, 90, 88]
  Bob: [70, 65, 88, 72, 60]
  Carol: [95, 98, 92, 97, 100]
  David: [55, 60, 58, 62, 70]

=== Specific Access ===
Alice's grades:       [85, 92, 78, 90, 88]
Alice's first grade:  85
Alice's last grade:   88
Number of students:   4
Number of grades (Alice): 5

After adding Eve: ['Alice', 'Bob', 'Carol', 'David', 'Eve']
Alice after new grade: [85, 92, 78, 90, 88, 95]
  Alice is in the gradebook.
  Frank is NOT in the gradebook.`,
  },

  {
    titleEn: "Step 2 — Computing Statistics",
    titleFr: "Étape 2 — Calculer les statistiques",
    contentEn: `## Step 2 — Computing Statistics

Now that we can store grades, let's compute useful statistics for each student. This is the core of any grade manager.

We'll compute:
- **Average** — sum of grades divided by count
- **Highest grade** — best performance
- **Lowest grade** — worst performance  
- **Letter grade** — A/B/C/D/F based on average

The letter grade conversion uses a classic pattern — a list of \`(threshold, letter)\` tuples sorted from highest to lowest. We check thresholds in order and return the first one the average meets:

\`\`\`
average = 83

Check 90 → 83 >= 90? No
Check 80 → 83 >= 80? Yes → return "B"
\`\`\`

This is cleaner than a chain of \`if/elif\` because you can add new grade boundaries just by adding a tuple to the list.`,

    contentFr: `## Étape 2 — Calculer les statistiques

Maintenant que nous pouvons stocker les notes, calculons des statistiques utiles pour chaque étudiant.

La conversion en lettre utilise une liste de tuples \`(seuil, lettre)\` triée du plus haut au plus bas. Nous vérifions les seuils dans l'ordre et retournons le premier que la moyenne atteint :

\`\`\`
moyenne = 83
Vérifier 90 → 83 >= 90 ? Non
Vérifier 80 → 83 >= 80 ? Oui → retourner "B"
\`\`\``,

    starterCode: {
      default: `# Step 2: Statistics for each student

gradebook = {
    "Alice": [85, 92, 78, 90, 88],
    "Bob":   [70, 65, 88, 72, 60],
    "Carol": [95, 98, 92, 97, 100],
    "David": [55, 60, 58, 62, 70],
}

def average(grades):
    """Compute the average of a list of grades."""
    if not grades:
        return 0
    return sum(grades) / len(grades)

def letter_grade(avg):
    """Convert a numeric average to a letter grade."""
    thresholds = [
        (90, "A"),
        (80, "B"),
        (70, "C"),
        (60, "D"),
    ]
    for threshold, letter in thresholds:
        if avg >= threshold:
            return letter
    return "F"

def student_stats(grades):
    """Compute all statistics for a list of grades."""
    if not grades:
        return None
    avg = average(grades)
    return {
        "count":   len(grades),
        "average": round(avg, 2),
        "highest": max(grades),
        "lowest":  min(grades),
        "grade":   letter_grade(avg),
    }

# Display stats for all students
print("=== Student Statistics ===")
print(f"{'Name':<10} {'Avg':>6} {'High':>6} {'Low':>6} {'Grade':>6} {'Tests':>6}")
print("-" * 46)

for name, grades in gradebook.items():
    stats = student_stats(grades)
    print(
        f"{name:<10} "
        f"{stats['average']:>6.1f} "
        f"{stats['highest']:>6} "
        f"{stats['lowest']:>6} "
        f"{stats['grade']:>6} "
        f"{stats['count']:>6}"
    )

# Test edge cases
print("\\n=== Edge Cases ===")
print(f"Empty list average: {average([])}")
print(f"Single grade stats: {student_stats([75])}")
print(f"Perfect score:      {letter_grade(100)}")
print(f"Failing grade:      {letter_grade(45)}")
`,
    },
    expectedOutput: `=== Student Statistics ===
Name        Avg   High    Low  Grade  Tests
----------------------------------------------
Alice       86.6     92     78      B      5
Bob         71.0     88     60      C      5
Carol       96.4    100     92      A      5
David       61.0     70     55      D      5

=== Edge Cases ===
Empty list average: 0
Single grade stats: {'count': 1, 'average': 75, 'highest': 75, 'lowest': 75, 'grade': 'C'}
Perfect score:      A
Failing grade:      F`,
  },

  {
    titleEn: "Step 3 — Adding and Removing Students",
    titleFr: "Étape 3 — Ajouter et supprimer des étudiants",
    contentEn: `## Step 3 — Adding and Removing Students

A real grade manager needs to handle students joining and leaving the class. This step adds CRUD operations for students.

**The key design decisions here:**

1. **Validate grades** when adding them. A grade must be a number between 0 and 100. Accepting invalid data causes subtle bugs later — better to reject it immediately with a clear error message.

2. **Return success/failure** from functions instead of crashing. When something goes wrong (student already exists, invalid grade), return \`False\` or \`None\` and let the caller decide what to do. This is defensive programming.

3. **Prevent adding duplicate students**. If Alice is already in the gradebook and you add her again, what should happen? In this case: reject it with an error. The caller can check first with \`student_exists()\`.

\`\`\`
add_student("Alice")           → False  (already exists)
add_student("Frank")           → True   (added successfully)
add_grade("Frank", 105)        → False  (grade out of range)
add_grade("Frank", 85)         → True   (added)
remove_student("NoOne")        → False  (doesn't exist)
remove_student("Frank")        → True   (removed)
\`\`\``,

    contentFr: `## Étape 3 — Ajouter et supprimer des étudiants

**Les décisions de conception clés ici :**

1. **Valider les notes** lors de leur ajout. Une note doit être comprise entre 0 et 100.
2. **Retourner succès/échec** depuis les fonctions au lieu de planter.
3. **Empêcher l'ajout d'étudiants en double**.

\`\`\`
ajouter_etudiant("Alice")         → False  (existe déjà)
ajouter_etudiant("Frank")         → True   (ajouté)
ajouter_note("Frank", 105)        → False  (hors plage)
ajouter_note("Frank", 85)         → True   (ajouté)
\`\`\``,

    starterCode: {
      default: `# Step 3: Add and remove students and grades

gradebook = {
    "Alice": [85, 92, 78, 90, 88],
    "Bob":   [70, 65, 88, 72, 60],
}

def add_student(name, initial_grades=None):
    """
    Add a new student. Returns True on success, False if already exists.
    initial_grades: optional list of starting grades.
    """
    if name in gradebook:
        print(f"  Error: '{name}' is already in the gradebook.")
        return False
    gradebook[name] = initial_grades if initial_grades else []
    print(f"  Added student '{name}'.")
    return True

def remove_student(name):
    """Remove a student. Returns True on success, False if not found."""
    if name not in gradebook:
        print(f"  Error: '{name}' not found.")
        return False
    del gradebook[name]
    print(f"  Removed student '{name}'.")
    return True

def add_grade(name, grade):
    """
    Add a grade for a student. Validates the grade is 0-100.
    Returns True on success, False on any error.
    """
    if name not in gradebook:
        print(f"  Error: '{name}' not found.")
        return False

    if not isinstance(grade, (int, float)):
        print(f"  Error: grade must be a number, got {type(grade).__name__}.")
        return False

    if not (0 <= grade <= 100):
        print(f"  Error: grade {grade} is out of range (must be 0-100).")
        return False

    gradebook[name].append(grade)
    print(f"  Added grade {grade} for '{name}'.")
    return True

def remove_last_grade(name):
    """Remove the most recently added grade for a student."""
    if name not in gradebook:
        print(f"  Error: '{name}' not found.")
        return False
    if not gradebook[name]:
        print(f"  Error: '{name}' has no grades to remove.")
        return False
    removed = gradebook[name].pop()
    print(f"  Removed grade {removed} from '{name}'.")
    return True

# Test all operations
print("=== Adding Students ===")
add_student("Carol", [95, 98, 92])
add_student("Alice")              # should fail — already exists
add_student("David")              # no initial grades

print("\\n=== Adding Grades ===")
add_grade("David", 75)
add_grade("David", 80)
add_grade("David", 105)           # should fail — out of range
add_grade("David", -5)            # should fail — negative
add_grade("NoOne", 80)            # should fail — student not found

print("\\n=== Removing ===")
remove_last_grade("Carol")        # removes 92
remove_student("Alice")
remove_student("Ghost")           # should fail

print("\\n=== Final Gradebook ===")
for name, grades in gradebook.items():
    print(f"  {name}: {grades}")
`,
    },
    expectedOutput: `=== Adding Students ===
  Added student 'Carol'.
  Error: 'Alice' is already in the gradebook.
  Added student 'David'.

=== Adding Grades ===
  Added grade 75 for 'David'.
  Added grade 80 for 'David'.
  Error: grade 105 is out of range (must be 0-100).
  Error: grade -5 is out of range (must be 0-100).
  Error: 'NoOne' not found.

=== Removing ===
  Removed grade 92 from 'Carol'.
  Removed student 'Alice'.
  Error: 'Ghost' not found.

=== Final Gradebook ===
  Bob: [70, 65, 88, 72, 60]
  Carol: [95, 98]
  David: [75, 80]`,
  },

  {
    titleEn: "Step 4 — Sorting and Ranking",
    titleFr: "Étape 4 — Trier et classer",
    contentEn: `## Step 4 — Sorting and Ranking

Now that we have statistics, let's add the ability to **rank students** — sort them by average, find the top performers, identify who needs help.

Python's \`sorted()\` is perfect for this. The \`key\` parameter lets you sort by any computed value:

\`\`\`python
# Sort students by their average grade (highest first)
sorted(gradebook.items(), key=lambda item: average(item[1]), reverse=True)
\`\`\`

Breaking this down:
- \`gradebook.items()\` gives \`[("Alice", [85,92,...]), ("Bob", [...]), ...]\`
- \`key=lambda item: average(item[1])\` — for each \`(name, grades)\` pair, compute the average of the grades
- \`reverse=True\` — highest average first

We'll also add **percentile calculation** — showing each student where they rank relative to the class. A student in the 90th percentile scored better than 90% of the class.

\`\`\`
Percentile = (students with lower average / total students) × 100
\`\`\``,

    contentFr: `## Étape 4 — Trier et classer

Le paramètre \`key\` de \`sorted()\` nous permet de trier par n'importe quelle valeur calculée :

\`\`\`python
sorted(cahier_notes.items(), key=lambda item: moyenne(item[1]), reverse=True)
\`\`\`

Nous ajouterons aussi le **calcul de percentile** — montrant à chaque étudiant où il se classe par rapport à la classe.

\`\`\`
Percentile = (étudiants avec une moyenne inférieure / total étudiants) × 100
\`\`\``,

    starterCode: {
      default: `# Step 4: Sorting and ranking

gradebook = {
    "Alice": [85, 92, 78, 90, 88],
    "Bob":   [70, 65, 88, 72, 60],
    "Carol": [95, 98, 92, 97, 100],
    "David": [55, 60, 58, 62, 70],
    "Eve":   [78, 82, 75, 80, 77],
}

def average(grades):
    if not grades: return 0
    return sum(grades) / len(grades)

def letter_grade(avg):
    for threshold, letter in [(90,"A"),(80,"B"),(70,"C"),(60,"D")]:
        if avg >= threshold: return letter
    return "F"

def ranked_students(reverse=True):
    """
    Return students sorted by average grade.
    reverse=True  → highest first (default)
    reverse=False → lowest first
    """
    return sorted(
        gradebook.items(),
        key=lambda item: average(item[1]),
        reverse=reverse
    )

def percentile(name):
    """
    What percentage of students does this student outperform?
    """
    if name not in gradebook:
        return None
    my_avg = average(gradebook[name])
    all_avgs = [average(grades) for grades in gradebook.values()]
    lower = sum(1 for avg in all_avgs if avg < my_avg)
    return round((lower / len(all_avgs)) * 100, 1)

def top_students(n=3):
    """Return the top N students by average."""
    return ranked_students()[:n]

def struggling_students(threshold=70):
    """Return students with average below threshold."""
    return [
        (name, round(average(grades), 1))
        for name, grades in gradebook.items()
        if average(grades) < threshold
    ]

# Display full ranking
print("=== Class Ranking ===")
print(f"{'Rank':<5} {'Name':<10} {'Average':>8} {'Grade':>6} {'Percentile':>11}")
print("-" * 45)
for rank, (name, grades) in enumerate(ranked_students(), start=1):
    avg = average(grades)
    pct = percentile(name)
    print(f"{rank:<5} {name:<10} {avg:>8.1f} {letter_grade(avg):>6} {pct:>10.1f}%")

# Top performers
print("\\n=== Top 3 Students ===")
for i, (name, grades) in enumerate(top_students(3), 1):
    print(f"  {i}. {name}: {average(grades):.1f}")

# Who needs help?
print("\\n=== Students Needing Support (avg < 70) ===")
struggling = struggling_students(70)
if struggling:
    for name, avg in struggling:
        print(f"  {name}: {avg} average")
else:
    print("  Everyone is passing!")

# Sort ascending (lowest first — for intervention planning)
print("\\n=== Lowest to Highest ===")
for name, grades in ranked_students(reverse=False):
    print(f"  {name}: {average(grades):.1f}")
`,
    },
    expectedOutput: `=== Class Ranking ===
Rank  Name        Average  Grade  Percentile
---------------------------------------------
1     Carol          96.4      A      100.0%
2     Alice          86.6      B       75.0%
3     Eve            78.4      C       50.0%
4     Bob            71.0      C       25.0%
5     David          61.0      D        0.0%

=== Top 3 Students ===
  1. Carol: 96.4
  2. Alice: 86.6
  3. Eve: 78.4

=== Students Needing Support (avg < 70) ===
  David: 61.0 average

=== Lowest to Highest ===
  David: 61.0
  Bob: 71.0
  Eve: 78.4
  Alice: 86.6
  Carol: 96.4`,
  },

  {
    titleEn: "Step 5 — Class-Wide Statistics",
    titleFr: "Étape 5 — Statistiques de la classe",
    contentEn: `## Step 5 — Class-Wide Statistics

Individual student stats are useful. But teachers also need **class-wide insights**: what's the overall average, how are grades distributed, what's the pass rate?

This step adds a \`class_report()\` function that produces a complete summary.

The most interesting part is the **grade distribution** — counting how many students fall into each letter grade bucket (A, B, C, D, F). This is done with a dictionary:

\`\`\`python
distribution = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
for name, grades in gradebook.items():
    letter = letter_grade(average(grades))
    distribution[letter] += 1
\`\`\`

We also compute the **pass rate** (percentage of students with average ≥ 60) and the **standard deviation** — a measure of how spread out the grades are. High standard deviation means grades are all over the place; low means most students scored similarly.

\`\`\`
Standard deviation:
  1. Find the average
  2. For each grade: compute (grade - average)²
  3. Average those squared differences
  4. Take the square root
\`\`\``,

    contentFr: `## Étape 5 — Statistiques de la classe

Cette étape ajoute une fonction \`rapport_classe()\` qui produit un résumé complet.

La partie la plus intéressante est la **distribution des notes** — compter combien d'étudiants tombent dans chaque tranche (A, B, C, D, F).

Nous calculons aussi le **taux de réussite** et l'**écart-type** — une mesure de la dispersion des notes.

\`\`\`
Écart-type :
  1. Trouver la moyenne
  2. Pour chaque note : calculer (note - moyenne)²
  3. Faire la moyenne de ces différences au carré
  4. Prendre la racine carrée
\`\`\``,

    starterCode: {
      default: `# Step 5: Class-wide statistics

import math

gradebook = {
    "Alice": [85, 92, 78, 90, 88],
    "Bob":   [70, 65, 88, 72, 60],
    "Carol": [95, 98, 92, 97, 100],
    "David": [55, 60, 58, 62, 70],
    "Eve":   [78, 82, 75, 80, 77],
    "Frank": [40, 45, 50, 38, 55],
}

def average(grades):
    if not grades: return 0
    return sum(grades) / len(grades)

def letter_grade(avg):
    for threshold, letter in [(90,"A"),(80,"B"),(70,"C"),(60,"D")]:
        if avg >= threshold: return letter
    return "F"

def std_deviation(values):
    """Population standard deviation of a list of numbers."""
    if len(values) < 2:
        return 0
    avg = sum(values) / len(values)
    variance = sum((x - avg) ** 2 for x in values) / len(values)
    return math.sqrt(variance)

def class_report():
    """Generate a complete class-wide report."""
    if not gradebook:
        return "No students in gradebook."

    # Collect all averages
    averages = {name: average(grades) for name, grades in gradebook.items()}
    all_avgs = list(averages.values())

    # Grade distribution
    distribution = {"A": [], "B": [], "C": [], "D": [], "F": []}
    for name, avg in averages.items():
        distribution[letter_grade(avg)].append(name)

    # Pass rate (average >= 60)
    passing = sum(1 for avg in all_avgs if avg >= 60)

    # All individual grades (for std deviation across whole class)
    all_grades = [g for grades in gradebook.values() for g in grades]

    lines = []
    lines.append("=" * 50)
    lines.append("           CLASS PERFORMANCE REPORT")
    lines.append("=" * 50)
    lines.append(f"  Total students:     {len(gradebook)}")
    lines.append(f"  Total grades:       {len(all_grades)}")
    lines.append(f"  Class average:      {average(all_avgs):.1f}")
    lines.append(f"  Highest average:    {max(all_avgs):.1f} ({max(averages, key=averages.get)})")
    lines.append(f"  Lowest average:     {min(all_avgs):.1f} ({min(averages, key=averages.get)})")
    lines.append(f"  Std deviation:      {std_deviation(all_avgs):.1f}")
    lines.append(f"  Pass rate:          {passing}/{len(gradebook)} ({passing/len(gradebook)*100:.0f}%)")
    lines.append("")
    lines.append("  Grade Distribution:")
    for letter in ["A", "B", "C", "D", "F"]:
        students = distribution[letter]
        bar = "█" * len(students)
        names = ", ".join(students) if students else "—"
        lines.append(f"    {letter}: {bar:<10} {len(students)} student(s) — {names}")
    lines.append("=" * 50)
    return "\\n".join(lines)

print(class_report())

# Which subject area needs improvement?
print("\\n=== Lowest Scoring Tests (All Students) ===")
# Flatten all grades with their owner
all_grade_data = []
for name, grades in gradebook.items():
    for i, grade in enumerate(grades, 1):
        all_grade_data.append((grade, name, f"Test {i}"))

# Sort by grade ascending
all_grade_data.sort()
print("Bottom 5 scores across all students:")
for grade, name, test in all_grade_data[:5]:
    print(f"  {grade:3d} — {name} ({test})")
`,
    },
    expectedOutput: `==================================================
           CLASS PERFORMANCE REPORT
==================================================
  Total students:     6
  Total grades:       30
  Class average:      74.4
  Highest average:    96.4 (Carol)
  Lowest average:     45.6 (Frank)
  Std deviation:      17.8
  Pass rate:          5/6 (83%)

  Grade Distribution:
    A: █          1 student(s) — Carol
    B: █          1 student(s) — Alice
    C: ██         2 student(s) — Bob, Eve
    D: █          1 student(s) — David
    F: █          1 student(s) — Frank
==================================================

=== Lowest Scoring Tests (All Students) ===
Bottom 5 scores across all students:
   38 — Frank (Test 4)
   40 — Frank (Test 1)
   45 — Frank (Test 2)
   50 — Frank (Test 3)
   55 — Frank (Test 5)`,
  },

  {
    titleEn: "Step 6 — Saving and Loading with JSON",
    titleFr: "Étape 6 — Sauvegarder et charger avec JSON",
    contentEn: `## Step 6 — Saving and Loading with JSON

Right now, all data disappears when the program ends. A real grade manager needs to **persist data** between sessions.

This is where our File I/O lesson pays off. We save the gradebook as a JSON file and load it back on startup.

The complete \`GradeManager\` class ties everything together:
- Load from file on startup (if file exists)
- Save to file after every change
- All operations from previous steps

The **auto-save** design is important. Instead of requiring users to manually save, every modification automatically calls \`save()\`. This prevents data loss from forgetting to save.

\`\`\`
On startup:
  load() → reads gradebook.json → restores all student data

On every change:
  add_student() → save()
  add_grade()   → save()
  remove()      → save()

This means the file is always up to date.
\`\`\`

The JSON file looks exactly like our Python dictionary — JSON is just a text representation of nested data structures, which is why it's perfect for this use case.`,

    contentFr: `## Étape 6 — Sauvegarder et charger avec JSON

En ce moment, toutes les données disparaissent quand le programme se termine. Un vrai gestionnaire de notes doit **persister les données** entre les sessions.

La conception **auto-sauvegarde** est importante. Au lieu d'exiger que les utilisateurs sauvegardent manuellement, chaque modification appelle automatiquement \`sauvegarder()\`.

\`\`\`
Au démarrage :
  charger() → lit cahier_notes.json → restaure toutes les données

À chaque changement :
  ajouter_etudiant() → sauvegarder()
  ajouter_note()     → sauvegarder()
\`\`\``,

    starterCode: {
      default: `# Step 6: Complete GradeManager with persistence

import json
import os
import math

SAVE_FILE = "gradebook.json"

class GradeManager:
    """
    A complete grade management system.
    Automatically saves to JSON after every change.
    """

    def __init__(self):
        self.gradebook = {}
        self.load()   # restore from file if it exists

    # ── Persistence ───────────────────────────────────────
    def save(self):
        with open(SAVE_FILE, "w") as f:
            json.dump(self.gradebook, f, indent=2)

    def load(self):
        if os.path.exists(SAVE_FILE):
            try:
                with open(SAVE_FILE, "r") as f:
                    self.gradebook = json.load(f)
                print(f"Loaded {len(self.gradebook)} students from {SAVE_FILE}")
            except (json.JSONDecodeError, IOError):
                self.gradebook = {}
        else:
            print("No save file found — starting fresh.")

    # ── Core helpers ──────────────────────────────────────
    def _average(self, grades):
        if not grades: return 0
        return sum(grades) / len(grades)

    def _letter(self, avg):
        for t, l in [(90,"A"),(80,"B"),(70,"C"),(60,"D")]:
            if avg >= t: return l
        return "F"

    # ── Student management ────────────────────────────────
    def add_student(self, name, grades=None):
        if name in self.gradebook:
            return False, f"'{name}' already exists."
        self.gradebook[name] = grades or []
        self.save()
        return True, f"Added '{name}'."

    def remove_student(self, name):
        if name not in self.gradebook:
            return False, f"'{name}' not found."
        del self.gradebook[name]
        self.save()
        return True, f"Removed '{name}'."

    def add_grade(self, name, grade):
        if name not in self.gradebook:
            return False, f"'{name}' not found."
        if not (0 <= grade <= 100):
            return False, f"Grade {grade} out of range."
        self.gradebook[name].append(grade)
        self.save()
        return True, f"Added {grade} for '{name}'."

    # ── Reporting ─────────────────────────────────────────
    def student_summary(self, name):
        if name not in self.gradebook:
            return f"'{name}' not found."
        grades = self.gradebook[name]
        if not grades:
            return f"{name}: No grades yet."
        avg = self._average(grades)
        return (f"{name}: grades={grades}, "
                f"avg={avg:.1f}, "
                f"grade={self._letter(avg)}, "
                f"high={max(grades)}, low={min(grades)}")

    def class_report(self):
        if not self.gradebook:
            return "Gradebook is empty."
        averages = {n: self._average(g) for n, g in self.gradebook.items()}
        dist = {"A":0,"B":0,"C":0,"D":0,"F":0}
        for avg in averages.values():
            dist[self._letter(avg)] += 1

        lines = ["\\n=== Grade Manager Report ==="]
        lines.append(f"Students: {len(self.gradebook)}")
        lines.append(f"Class average: {self._average(list(averages.values())):.1f}")
        lines.append("\\nRanking:")
        for rank, (name, avg) in enumerate(
            sorted(averages.items(), key=lambda x: x[1], reverse=True), 1
        ):
            lines.append(f"  {rank}. {name}: {avg:.1f} ({self._letter(avg)})")
        lines.append("\\nDistribution: " +
                     " | ".join(f"{l}:{n}" for l, n in dist.items()))
        return "\\n".join(lines)


# ── Simulate a full session ───────────────────────────────
gm = GradeManager()

# Add students
for name, grades in [
    ("Alice", [85, 92, 78]),
    ("Bob",   [70, 65, 88]),
    ("Carol", [95, 98, 92]),
    ("David", [55, 60, 58]),
]:
    ok, msg = gm.add_student(name, grades)
    print(msg)

# Add more grades
print()
for name, grade in [("Alice", 90), ("Bob", 72), ("Carol", 97), ("David", 62)]:
    ok, msg = gm.add_grade(name, grade)
    print(msg)

# Try invalid operations
print()
ok, msg = gm.add_student("Alice")     # duplicate
print(f"Duplicate: {msg}")
ok, msg = gm.add_grade("Alice", 105)  # out of range
print(f"Bad grade: {msg}")

# Individual summaries
print()
for name in ["Alice", "Carol", "David"]:
    print(gm.student_summary(name))

# Full report
print(gm.class_report())
`,
    },
    expectedOutput: `No save file found — starting fresh.
Added 'Alice'.
Added 'Bob'.
Added 'Carol'.
Added 'David'.

Added 90 for 'Alice'.
Added 72 for 'Bob'.
Added 97 for 'Carol'.
Added 62 for 'David'.

Duplicate: 'Alice' already exists.
Bad grade: Grade 105 out of range.

Alice: grades=[85, 92, 78, 90], avg=86.2, grade=B, high=92, low=78
Carol: grades=[95, 98, 92, 97], avg=95.5, grade=A, high=98, low=92
David: grades=[55, 60, 58, 62], avg=58.8, grade=F, high=62, low=55

=== Grade Manager Report ===
Students: 4
Class average: 77.9

Ranking:
  1. Carol: 95.5 (A)
  2. Alice: 86.2 (B)
  3. Bob: 73.8 (C)
  4. David: 58.8 (F)

Distribution: A:1 | B:1 | C:1 | D:0 | F:1`,
  },
];
