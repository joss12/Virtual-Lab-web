export const id = "quiz-game";
export const titleEn = "Quiz Game Engine";
export const titleFr = "Moteur de quiz";
export const descriptionEn =
  "Build a quiz engine that loads questions, tracks scores, shows results and supports multiple rounds.";
export const descriptionFr =
  "Construisez un moteur de quiz qui charge des questions, suit les scores et supporte plusieurs manches.";

export const steps = [
  {
    titleEn: "Step 1 — Question Structure and Loading",
    titleFr: "Étape 1 — Structure des questions et chargement",
    contentEn: `## Step 1 — Question Structure and Loading

Every quiz game starts with the same problem: **how do you represent a question?** The data structure you choose determines everything else — how you display questions, check answers, track scores, and shuffle options.

A quiz question has:
\`\`\`
- The question text itself
- Multiple choice options (typically 4)
- The correct answer (index into the options list)
- Optional: a category, difficulty level, explanation
\`\`\`

We represent each question as a dictionary:
\`\`\`python
{
    "question":    "What is the capital of France?",
    "options":     ["Berlin", "Madrid", "Paris", "Rome"],
    "correct":     2,       # index 2 = "Paris"
    "category":   "Geography",
    "difficulty":  "easy",
    "explanation": "Paris has been the capital since 987 AD."
}
\`\`\`

Why store \`correct\` as an index rather than the answer text?
\`\`\`
If correct = "Paris":
  When we shuffle options, "Paris" might move to position 0.
  But correct still says "Paris" — we must search for it. Fragile.

If correct = 2 (original index):
  After shuffling, we map old index 2 to new position. Reliable.
  Also works if two options have similar text.
\`\`\`

We also define a **question bank** — a list of all questions the quiz can draw from. In a real app, this would load from a database or JSON file.`,

    contentFr: `## Étape 1 — Structure des questions et chargement

Nous représentons chaque question comme un dictionnaire :
\`\`\`python
{
    "question":    "Quelle est la capitale de la France ?",
    "options":     ["Berlin", "Madrid", "Paris", "Rome"],
    "correct":     2,       # index 2 = "Paris"
    "category":   "Géographie",
    "difficulty":  "facile",
    "explanation": "Paris est capitale depuis 987 apr. J.-C."
}
\`\`\`

Pourquoi stocker \`correct\` comme index et non comme texte ?
\`\`\`
Si on mélange les options, "Paris" peut passer à la position 0.
Stocker l'index et mapper après le mélange est plus fiable.
\`\`\``,

    starterCode: {
      default: `# Step 1: Question structure and loading

# A question bank with questions across multiple categories
QUESTION_BANK = [
    {
        "question":    "What does CPU stand for?",
        "options":     ["Central Processing Unit", "Computer Personal Unit",
                        "Central Program Utility", "Core Processing Unit"],
        "correct":     0,
        "category":    "Technology",
        "difficulty":  "easy",
        "explanation": "CPU = Central Processing Unit, the brain of a computer.",
    },
    {
        "question":    "Which language runs natively in web browsers?",
        "options":     ["Python", "Java", "JavaScript", "Ruby"],
        "correct":     2,
        "category":    "Technology",
        "difficulty":  "easy",
        "explanation": "JavaScript is the only language browsers execute natively.",
    },
    {
        "question":    "What is O(log N) complexity called?",
        "options":     ["Linear", "Logarithmic", "Quadratic", "Constant"],
        "correct":     1,
        "category":    "Technology",
        "difficulty":  "medium",
        "explanation": "O(log N) = logarithmic time — each step halves the problem.",
    },
    {
        "question":    "What is the capital of Japan?",
        "options":     ["Seoul", "Beijing", "Bangkok", "Tokyo"],
        "correct":     3,
        "category":    "Geography",
        "difficulty":  "easy",
        "explanation": "Tokyo has been Japan's capital since 1869.",
    },
    {
        "question":    "Which planet is closest to the Sun?",
        "options":     ["Venus", "Earth", "Mercury", "Mars"],
        "correct":     2,
        "category":    "Science",
        "difficulty":  "easy",
        "explanation": "Mercury is the innermost planet of our solar system.",
    },
    {
        "question":    "What year did World War II end?",
        "options":     ["1943", "1944", "1945", "1946"],
        "correct":     2,
        "category":    "History",
        "difficulty":  "easy",
        "explanation": "WWII ended in 1945: VE Day (May) and VJ Day (September).",
    },
    {
        "question":    "How many bits are in a byte?",
        "options":     ["4", "8", "16", "32"],
        "correct":     1,
        "category":    "Technology",
        "difficulty":  "easy",
        "explanation": "1 byte = 8 bits. This is a fundamental computing concept.",
    },
    {
        "question":    "What is the chemical symbol for gold?",
        "options":     ["Gd", "Go", "Au", "Ag"],
        "correct":     2,
        "category":    "Science",
        "difficulty":  "medium",
        "explanation": "Au comes from the Latin word 'Aurum' meaning gold.",
    },
    {
        "question":    "Which data structure uses LIFO order?",
        "options":     ["Queue", "Stack", "List", "Graph"],
        "correct":     1,
        "category":    "Technology",
        "difficulty":  "medium",
        "explanation": "Stack = Last In, First Out. Like a stack of plates.",
    },
    {
        "question":    "What is the largest ocean on Earth?",
        "options":     ["Atlantic", "Indian", "Arctic", "Pacific"],
        "correct":     3,
        "category":    "Geography",
        "difficulty":  "easy",
        "explanation": "The Pacific Ocean covers about 165 million km², nearly half of Earth's water surface.",
    },
]

def load_questions(category=None, difficulty=None, limit=None):
    """
    Load questions from the bank with optional filters.

    category:   filter by category (e.g. "Technology")
    difficulty: filter by difficulty (e.g. "easy", "medium")
    limit:      max number of questions to return
    """
    questions = QUESTION_BANK.copy()

    if category:
        questions = [q for q in questions
                     if q["category"].lower() == category.lower()]

    if difficulty:
        questions = [q for q in questions
                     if q["difficulty"].lower() == difficulty.lower()]

    if limit:
        questions = questions[:limit]

    return questions

def display_question(q, number, total, show_answer=False):
    """Display a formatted question."""
    print(f"\\n  Question {number}/{total} [{q['category']} — {q['difficulty']}]")
    print(f"  {q['question']}")
    print()
    for i, option in enumerate(q["options"]):
        marker = "→ " if (show_answer and i == q["correct"]) else "  "
        letter = chr(65 + i)  # A, B, C, D
        print(f"  {marker}{letter}) {option}")

    if show_answer:
        print(f"\\n  ✓ Answer: {q['options'][q['correct']]}")
        print(f"  💡 {q['explanation']}")

# Explore the question bank
print("=== Question Bank Overview ===")
from collections import Counter
categories   = Counter(q["category"]   for q in QUESTION_BANK)
difficulties = Counter(q["difficulty"] for q in QUESTION_BANK)

print(f"  Total questions: {len(QUESTION_BANK)}")
print(f"  Categories: {dict(categories)}")
print(f"  Difficulties: {dict(difficulties)}")

# Load filtered questions
print("\\n=== Technology Questions ===")
tech_qs = load_questions(category="Technology")
print(f"  Found {len(tech_qs)} technology questions")

print("\\n=== Easy Questions (limit 3) ===")
easy_qs = load_questions(difficulty="easy", limit=3)
for i, q in enumerate(easy_qs, 1):
    display_question(q, i, len(easy_qs), show_answer=True)
`,
    },
    expectedOutput: `=== Question Bank Overview ===
  Total questions: 10
  Categories: {'Technology': 4, 'Geography': 2, 'Science': 2, 'History': 1}
  Difficulties: {'easy': 7, 'medium': 3}

=== Technology Questions ===
  Found 4 technology questions

=== Easy Questions (limit 3) ===

  Question 1/3 [Technology — easy]
  What does CPU stand for?

  → A) Central Processing Unit
    B) Computer Personal Unit
    C) Central Program Utility
    D) Core Processing Unit

  ✓ Answer: Central Processing Unit
  💡 CPU = Central Processing Unit, the brain of a computer.

  Question 2/3 [Technology — easy]
  Which language runs natively in web browsers?

    A) Python
    B) Java
  → C) JavaScript
    D) Ruby

  ✓ Answer: JavaScript
  💡 JavaScript is the only language browsers execute natively.

  Question 3/3 [Geography — easy]
  What is the capital of Japan?

    A) Seoul
    B) Beijing
    C) Bangkok
  → D) Tokyo

  ✓ Answer: Tokyo
  💡 Tokyo has been Japan's capital since 1869.`,
  },

  {
    titleEn: "Step 2 — Shuffling and Answer Checking",
    titleFr: "Étape 2 — Mélanger et vérifier les réponses",
    contentEn: `## Step 2 — Shuffling and Answer Checking

A good quiz **shuffles** the options each time so the correct answer isn't always in the same position. If it's always option C, players learn to guess C without reading. Shuffling forces genuine engagement.

The challenge: **after shuffling, how do we know which option is correct?**

\`\`\`
Original:                         After shuffle:
  A) Central Processing Unit        A) Core Processing Unit
  B) Computer Personal Unit    →    B) Central Processing Unit  ← was A (index 0)
  C) Central Program Utility        C) Computer Personal Unit
  D) Core Processing Unit           D) Central Program Utility
  
  correct = 0 (index of A)         correct = 1 (index of B, which was A)
\`\`\`

We solve this by creating a **new question copy** with shuffled options and an updated correct index. The original question is never modified.

\`\`\`python
options  = ["A", "B", "C", "D"]   # original
answer   = "A"                     # the correct one

indices  = [0, 1, 2, 3]
shuffle(indices)                   # [2, 0, 3, 1]

new_options = [options[i] for i in indices]   # ["C", "A", "D", "B"]
new_correct = indices.index(0)                # where did index 0 go? → position 1
\`\`\`

We also add **answer validation** — converting the player's letter input ("A", "b", "C") to a 0-based index, handling invalid input gracefully.`,

    contentFr: `## Étape 2 — Mélanger et vérifier les réponses

Un bon quiz **mélange** les options à chaque fois pour que la bonne réponse ne soit pas toujours à la même position.

Le défi : **après le mélange, comment savoir quelle option est correcte ?**

\`\`\`
Original :   A=CPU, B=Computer, C=Program, D=Core  → correct=0 (A)
Après mélange : A=Core, B=CPU, C=Computer, D=Program → correct=1 (B)
\`\`\`

Nous créons une **copie de la question** avec les options mélangées et l'index correct mis à jour.`,

    starterCode: {
      default: `# Step 2: Shuffling and answer checking

import random

QUESTION_BANK = [
    {
        "question":    "What does CPU stand for?",
        "options":     ["Central Processing Unit", "Computer Personal Unit",
                        "Central Program Utility", "Core Processing Unit"],
        "correct":     0,
        "category":    "Technology",
        "difficulty":  "easy",
        "explanation": "CPU = Central Processing Unit, the brain of a computer.",
    },
    {
        "question":    "Which language runs natively in web browsers?",
        "options":     ["Python", "Java", "JavaScript", "Ruby"],
        "correct":     2,
        "category":    "Technology",
        "difficulty":  "easy",
        "explanation": "JavaScript is the only language browsers execute natively.",
    },
    {
        "question":    "What is the capital of Japan?",
        "options":     ["Seoul", "Beijing", "Bangkok", "Tokyo"],
        "correct":     3,
        "category":    "Geography",
        "difficulty":  "easy",
        "explanation": "Tokyo has been Japan's capital since 1869.",
    },
]

def shuffle_question(question):
    """
    Return a new question dict with shuffled options.
    The original question is NOT modified.
    """
    # Create a shuffled permutation of indices
    indices = list(range(len(question["options"])))
    random.shuffle(indices)

    # Build new options in the shuffled order
    new_options = [question["options"][i] for i in indices]

    # Find where the original correct answer ended up
    new_correct = indices.index(question["correct"])

    # Return a COPY with shuffled options (don't modify original)
    return {
        **question,                 # copy all fields
        "options": new_options,     # overwrite with shuffled options
        "correct": new_correct,     # update correct index
    }

def parse_answer(user_input, num_options=4):
    """
    Convert user input to a 0-based index.
    Accepts: "A", "b", "C", "D", "1", "2", "3", "4"
    Returns: index (0-3) on success, or -1 for invalid input.
    """
    s = user_input.strip().upper()

    # Letter input: A, B, C, D
    if len(s) == 1 and s.isalpha():
        idx = ord(s) - ord("A")   # A→0, B→1, C→2, D→3
        if 0 <= idx < num_options:
            return idx

    # Number input: 1, 2, 3, 4
    if s.isdigit():
        idx = int(s) - 1          # 1→0, 2→1, 3→2, 4→3
        if 0 <= idx < num_options:
            return idx

    return -1   # invalid

def check_answer(question, user_index):
    """
    Check if the user's answer is correct.
    Returns: (is_correct, correct_option_text)
    """
    correct = question["correct"]
    is_correct = (user_index == correct)
    return is_correct, question["options"][correct]

def display_question(q, number, total):
    """Display a question with shuffled options."""
    print(f"\\n  ┌─ Question {number}/{total} "
          f"[{q['category']} — {q['difficulty']}] {'─'*20}")
    print(f"  │ {q['question']}")
    print(f"  └{'─'*50}")
    for i, option in enumerate(q["options"]):
        letter = chr(65 + i)
        print(f"    {letter}) {option}")

def display_result(question, user_index, is_correct):
    """Display whether the answer was right or wrong."""
    correct_text = question["options"][question["correct"]]
    if is_correct:
        print(f"  ✅ Correct! — {correct_text}")
    else:
        user_text = question["options"][user_index] if user_index >= 0 else "???"
        print(f"  ❌ Wrong. You chose: {user_text}")
        print(f"     Correct answer: {correct_text}")
    print(f"  💡 {question['explanation']}")

# Simulate a mini quiz (with pre-set answers to avoid input() in browser)
print("=== Quiz Simulation ===")
print("(Simulating player answers without input())")

# Pre-set answers for simulation: correct, wrong, correct
simulated_answers = ["A", "B", "D"]

score = 0
questions = [shuffle_question(q) for q in QUESTION_BANK]

for i, (q, answer) in enumerate(zip(questions, simulated_answers), 1):
    display_question(q, i, len(questions))
    print(f"\\n  > Player answers: {answer}")

    user_idx = parse_answer(answer)
    is_correct, _ = check_answer(q, user_idx)

    display_result(q, user_idx, is_correct)
    if is_correct:
        score += 1

print(f"\\n=== Result: {score}/{len(questions)} ===")

# Show that shuffling works by displaying same question 3 times
print("\\n=== Shuffle Demo (same question, 3 times) ===")
original = QUESTION_BANK[0]
for i in range(3):
    shuffled = shuffle_question(original)
    correct_letter = chr(65 + shuffled["correct"])
    print(f"  Shuffle {i+1}: correct={correct_letter}) "
          f"{shuffled['options'][shuffled['correct']][:30]}")
    for j, opt in enumerate(shuffled["options"]):
        print(f"    {chr(65+j)}) {opt}")
    print()
`,
    },
    expectedOutput: `=== Quiz Simulation ===
(Simulating player answers without input())

  ┌─ Question 1/3 [Technology — easy] ────────────────────
  │ What does CPU stand for?
  └──────────────────────────────────────────────────────
    A) Core Processing Unit
    B) Central Program Utility
    C) Central Processing Unit
    D) Computer Personal Unit

  > Player answers: A

  ❌ Wrong. You chose: Core Processing Unit
     Correct answer: Central Processing Unit
  💡 CPU = Central Processing Unit, the brain of a computer.

  ┌─ Question 2/3 [Technology — easy] ────────────────────
  │ Which language runs natively in web browsers?
  └──────────────────────────────────────────────────────
    A) Ruby
    B) JavaScript
    C) Python
    D) Java

  > Player answers: B

  ✅ Correct! — JavaScript
  💡 JavaScript is the only language browsers execute natively.

  ┌─ Question 3/3 [Geography — easy] ─────────────────────
  │ What is the capital of Japan?
  └──────────────────────────────────────────────────────
    A) Seoul
    B) Bangkok
    C) Beijing
    D) Tokyo

  > Player answers: D

  ✅ Correct! — Tokyo
  💡 Tokyo has been Japan's capital since 1869.

=== Result: 2/3 ===`,
  },

  {
    titleEn: "Step 3 — Scoring and Streaks",
    titleFr: "Étape 3 — Score et séries",
    contentEn: `## Step 3 — Scoring and Streaks

A flat score (1 point per correct answer) is boring. Real quiz games use **dynamic scoring** to keep players engaged:

\`\`\`
Flat scoring:           Dynamic scoring:
  Q1 correct → 1 pt     Q1 correct → 10 pts (base)
  Q2 correct → 1 pt     Q2 correct → 12 pts (streak bonus ×1.2)
  Q3 correct → 1 pt     Q3 correct → 14 pts (streak bonus ×1.4)
  Q4 wrong   → 0 pts    Q4 wrong   →  0 pts (streak resets)
  Q5 correct → 1 pt     Q5 correct → 10 pts (back to base)
\`\`\`

Our scoring system:
- **Base points**: 10 per correct answer
- **Difficulty multiplier**: easy=1×, medium=1.5×, hard=2×
- **Streak bonus**: +2 pts for each consecutive correct answer
- **Speed bonus**: +5 pts if answered in under 5 seconds

\`\`\`
Example: medium question, 3-answer streak, answered fast
  base:      10 pts
  difficulty: ×1.5 → 15 pts
  streak:    +2×3 → +6 pts
  speed:     +5 pts
  Total:     26 pts
\`\`\`

We also track **statistics** — total correct, wrong, best streak, average time. These make the end-of-game summary meaningful.`,

    contentFr: `## Étape 3 — Score et séries

Un score plat (1 point par bonne réponse) est ennuyeux. Notre système de score :

\`\`\`
Points de base :   10 par bonne réponse
Multiplicateur :   facile=1×, moyen=1.5×, difficile=2×
Bonus de série :   +2 pts pour chaque bonne réponse consécutive
Bonus de vitesse : +5 pts si répondu en moins de 5 secondes
\`\`\``,

    starterCode: {
      default: `# Step 3: Dynamic scoring and statistics

import time

DIFFICULTY_MULTIPLIER = {"easy": 1.0, "medium": 1.5, "hard": 2.0}
BASE_POINTS     = 10
STREAK_BONUS    = 2    # extra points per streak level
SPEED_THRESHOLD = 5.0  # seconds to qualify for speed bonus
SPEED_BONUS     = 5

class ScoreTracker:
    """Tracks score, streaks, and per-question statistics."""

    def __init__(self):
        self.total_score   = 0
        self.correct       = 0
        self.wrong         = 0
        self.streak        = 0
        self.best_streak   = 0
        self.question_log  = []    # detailed record of each answer

    def record(self, question, is_correct, time_taken):
        """
        Record a question result and compute points earned.
        Returns the points earned for this question.
        """
        difficulty   = question.get("difficulty", "easy")
        multiplier   = DIFFICULTY_MULTIPLIER.get(difficulty, 1.0)

        if is_correct:
            self.correct += 1
            self.streak  += 1
            self.best_streak = max(self.best_streak, self.streak)

            # Points = (base + streak bonus) × difficulty × speed bonus
            points = (BASE_POINTS + self.streak * STREAK_BONUS) * multiplier
            if time_taken <= SPEED_THRESHOLD:
                points += SPEED_BONUS
            points = int(points)

        else:
            self.wrong  += 1
            self.streak  = 0   # reset streak on wrong answer
            points       = 0

        self.total_score += points

        self.question_log.append({
            "question":    question["question"][:50],
            "category":    question["category"],
            "difficulty":  difficulty,
            "correct":     is_correct,
            "points":      points,
            "time":        round(time_taken, 1),
            "streak":      self.streak,
        })

        return points

    @property
    def total_questions(self):
        return self.correct + self.wrong

    @property
    def accuracy(self):
        if self.total_questions == 0: return 0
        return round(self.correct / self.total_questions * 100, 1)

    @property
    def avg_time(self):
        if not self.question_log: return 0
        return round(sum(e["time"] for e in self.question_log)
                     / len(self.question_log), 1)

    def summary(self):
        """Print a full score summary."""
        lines = [
            f"  {'─'*45}",
            f"  SCORE SUMMARY",
            f"  {'─'*45}",
            f"  Total score:    {self.total_score:>8} pts",
            f"  Questions:      {self.total_questions:>8}",
            f"  Correct:        {self.correct:>8} ({self.accuracy}%)",
            f"  Wrong:          {self.wrong:>8}",
            f"  Best streak:    {self.best_streak:>8}",
            f"  Avg time/q:     {self.avg_time:>7}s",
            f"  {'─'*45}",
            f"  Per-question breakdown:",
        ]
        for i, entry in enumerate(self.question_log, 1):
            status = "✓" if entry["correct"] else "✗"
            streak_str = f" 🔥×{entry['streak']}" if entry["streak"] > 1 else ""
            lines.append(
                f"    Q{i:>2}. {status} {entry['question'][:35]:<35} "
                f"+{entry['points']:>3}pts  {entry['time']}s{streak_str}"
            )
        lines.append(f"  {'─'*45}")
        return "\\n".join(lines)

# Simulate a scored quiz session
QUESTIONS = [
    {"question": "What does CPU stand for?",     "category": "Tech",    "difficulty": "easy",   "correct_answer": True},
    {"question": "Which language runs in browsers?", "category": "Tech", "difficulty": "easy",   "correct_answer": True},
    {"question": "What is O(log N) called?",     "category": "Tech",    "difficulty": "medium", "correct_answer": True},
    {"question": "What year did WWII end?",       "category": "History", "difficulty": "easy",   "correct_answer": False},
    {"question": "Chemical symbol for gold?",     "category": "Science", "difficulty": "medium", "correct_answer": True},
    {"question": "Which data structure is LIFO?", "category": "Tech",   "difficulty": "medium", "correct_answer": True},
]

# Simulated time taken per question (in seconds)
TIMES = [3.2, 8.1, 4.9, 6.0, 2.8, 5.5]

print("=== Simulated Scored Quiz ===\\n")
tracker = ScoreTracker()

for q, t in zip(QUESTIONS, TIMES):
    points = tracker.record(q, q["correct_answer"], t)
    streak_msg = f" 🔥 Streak: {tracker.streak}!" if tracker.streak > 1 else ""
    result     = "✅ Correct" if q["correct_answer"] else "❌ Wrong"
    speed      = "⚡ Speed bonus!" if t <= SPEED_THRESHOLD and q["correct_answer"] else ""
    print(f"  {result:12} +{points:>3} pts  ({t}s) {speed}{streak_msg}")
    print(f"           {q['question'][:50]}")
    print()

print(tracker.summary())

# Show scoring breakdown for different scenarios
print("\\n=== Scoring Scenarios ===")
scenarios = [
    ("Easy, first answer, fast",   "easy",   1, 3.0),
    ("Easy, 3-streak, fast",       "easy",   3, 3.0),
    ("Medium, 3-streak, fast",     "medium", 3, 3.0),
    ("Medium, 5-streak, slow",     "medium", 5, 8.0),
    ("Hard, 1, fast",              "hard",   1, 2.0),
    ("Hard, 5-streak, fast",       "hard",   5, 2.0),
]
print(f"  {'Scenario':<35} {'Points':>7}")
print(f"  {'─'*44}")
for label, diff, streak, speed in scenarios:
    mult    = DIFFICULTY_MULTIPLIER[diff]
    pts     = int((BASE_POINTS + streak * STREAK_BONUS) * mult)
    if speed <= SPEED_THRESHOLD: pts += SPEED_BONUS
    print(f"  {label:<35} {pts:>7} pts")
`,
    },
    expectedOutput: `=== Simulated Scored Quiz ===

  ✅ Correct   + 15 pts  (3.2s) ⚡ Speed bonus!
           What does CPU stand for?

  ✅ Correct   + 19 pts  (8.1s) 🔥 Streak: 2!
           Which language runs in browsers?

  ✅ Correct   + 35 pts  (4.9s) ⚡ Speed bonus! 🔥 Streak: 3!
           What is O(log N) called?

  ❌ Wrong     +  0 pts  (6.0s)
           What year did WWII end?

  ✅ Correct   + 20 pts  (2.8s) ⚡ Speed bonus!
           Chemical symbol for gold?

  ✅ Correct   + 27 pts  (5.5s) 🔥 Streak: 2!
           Which data structure is LIFO?

  ─────────────────────────────────────────────
  SCORE SUMMARY
  ─────────────────────────────────────────────
  Total score:         116 pts
  Questions:             6
  Correct:               5 (83.3%)
  Wrong:                 1
  Best streak:           3
  Avg time/q:          5.1s
  ─────────────────────────────────────────────
  Per-question breakdown:
     Q 1. ✓ What does CPU stand for?            + 15pts  3.2s
     Q 2. ✓ Which language runs in browsers?    + 19pts  8.1s 🔥×2
     Q 3. ✓ What is O(log N) called?            + 35pts  4.9s 🔥×3
     Q 4. ✗ What year did WWII end?             +  0pts  6.0s
     Q 5. ✓ Chemical symbol for gold?           + 20pts  2.8s
     Q 6. ✓ Which data structure is LIFO?       + 27pts  5.5s 🔥×2
  ─────────────────────────────────────────────

=== Scoring Scenarios ===
  Scenario                            Points
  ────────────────────────────────────────────
  Easy, first answer, fast              17 pts
  Easy, 3-streak, fast                  23 pts
  Medium, 3-streak, fast                30 pts
  Medium, 5-streak, slow                27 pts
  Hard, 1, fast                         27 pts
  Hard, 5-streak, fast                  47 pts`,
  },

  {
    titleEn: "Step 4 — Multiple Rounds and Difficulty",
    titleFr: "Étape 4 — Plusieurs manches et difficulté",
    contentEn: `## Step 4 — Multiple Rounds and Difficulty

A single-round quiz gets boring quickly. Real quiz games have **multiple rounds** with increasing difficulty, a time limit, and the ability to play again.

**Round structure:**
\`\`\`
Round 1: Easy questions   → 5 questions
Round 2: Medium questions → 5 questions
Round 3: Mixed            → 5 questions (all categories)
\`\`\`

**Time limits** add pressure and excitement. Each question has a maximum time. If the player doesn't answer in time, it counts as wrong.

**Adaptive difficulty** adjusts the next question's difficulty based on performance:
\`\`\`
Accuracy > 80% → next question: harder
Accuracy < 50% → next question: easier
Otherwise      → same difficulty
\`\`\`

We also add **lives** — a limited number of wrong answers before the game ends. This is the classic arcade game mechanic that creates tension and urgency.`,

    contentFr: `## Étape 4 — Plusieurs manches et difficulté

**Structure des manches :**
\`\`\`
Manche 1 : Questions faciles   → 5 questions
Manche 2 : Questions moyennes  → 5 questions
Manche 3 : Mixte              → 5 questions
\`\`\`

La **difficulté adaptative** ajuste la prochaine question selon les performances :
\`\`\`
Précision > 80% → question suivante plus difficile
Précision < 50% → question suivante plus facile
Sinon          → même difficulté
\`\`\``,

    starterCode: {
      default: `# Step 4: Multiple rounds and adaptive difficulty

import random

QUESTION_BANK = [
    {"question":"What does CPU stand for?",        "options":["Central Processing Unit","Computer Personal Unit","Central Program Utility","Core Processing Unit"], "correct":0, "category":"Tech",     "difficulty":"easy",   "explanation":"CPU = Central Processing Unit."},
    {"question":"What runs in browsers natively?", "options":["Python","Java","JavaScript","Ruby"],  "correct":2, "category":"Tech",     "difficulty":"easy",   "explanation":"JavaScript is the only native browser language."},
    {"question":"What is O(log N) called?",         "options":["Linear","Logarithmic","Quadratic","Constant"], "correct":1, "category":"Tech",     "difficulty":"medium", "explanation":"O(log N) = logarithmic time."},
    {"question":"Capital of Japan?",                "options":["Seoul","Beijing","Bangkok","Tokyo"],  "correct":3, "category":"Geography","difficulty":"easy",   "explanation":"Tokyo since 1869."},
    {"question":"Closest planet to the Sun?",       "options":["Venus","Earth","Mercury","Mars"],     "correct":2, "category":"Science",  "difficulty":"easy",   "explanation":"Mercury is the innermost planet."},
    {"question":"When did WWII end?",               "options":["1943","1944","1945","1946"],           "correct":2, "category":"History",  "difficulty":"easy",   "explanation":"1945: VE Day in May, VJ Day in September."},
    {"question":"Bits in a byte?",                  "options":["4","8","16","32"],                     "correct":1, "category":"Tech",     "difficulty":"easy",   "explanation":"1 byte = 8 bits."},
    {"question":"Chemical symbol for gold?",         "options":["Gd","Go","Au","Ag"],                  "correct":2, "category":"Science",  "difficulty":"medium", "explanation":"Au from Latin 'Aurum'."},
    {"question":"Which structure uses LIFO?",        "options":["Queue","Stack","List","Graph"],        "correct":1, "category":"Tech",     "difficulty":"medium", "explanation":"Stack = Last In, First Out."},
    {"question":"Largest ocean on Earth?",           "options":["Atlantic","Indian","Arctic","Pacific"],"correct":3, "category":"Geography","difficulty":"easy",   "explanation":"Pacific covers ~165 million km²."},
]

ROUNDS = [
    {"name": "Round 1 — Warm Up",    "difficulty": "easy",   "count": 3, "lives": 3, "time_limit": 20},
    {"name": "Round 2 — Challenge",  "difficulty": "medium", "count": 3, "lives": 2, "time_limit": 15},
    {"name": "Round 3 — Speed Round","difficulty": None,     "count": 4, "lives": 2, "time_limit": 8},
]

def get_questions(difficulty=None, count=5, exclude=None):
    """Get random questions, optionally filtered by difficulty."""
    exclude = exclude or set()
    pool    = [q for q in QUESTION_BANK
               if (difficulty is None or q["difficulty"] == difficulty)
               and q["question"] not in exclude]
    random.shuffle(pool)
    return pool[:count]

def shuffle_question(q):
    indices     = list(range(len(q["options"])))
    random.shuffle(indices)
    return {**q,
            "options": [q["options"][i] for i in indices],
            "correct": indices.index(q["correct"])}

def adaptive_difficulty(current_diff, accuracy):
    """Adjust difficulty based on accuracy."""
    order = ["easy", "medium", "hard"]
    idx   = order.index(current_diff) if current_diff in order else 0
    if accuracy > 80 and idx < len(order) - 1:
        return order[idx + 1]
    if accuracy < 50 and idx > 0:
        return order[idx - 1]
    return current_diff

def simulate_round(round_config, simulated_answers, simulated_times):
    """Simulate a complete quiz round."""
    name       = round_config["name"]
    difficulty = round_config["difficulty"]
    count      = round_config["count"]
    lives      = round_config["lives"]
    time_limit = round_config["time_limit"]

    print(f"\\n{'='*55}")
    print(f"  {name}")
    print(f"  Lives: {'❤️ ' * lives} | Time limit: {time_limit}s/question")
    print(f"{'='*55}")

    questions  = get_questions(difficulty, count)
    correct    = 0
    wrong      = 0
    score      = 0
    remaining_lives = lives
    used        = set()
    current_diff = difficulty or "easy"

    for i, (q, answer, t) in enumerate(
        zip(questions, simulated_answers, simulated_times), 1
    ):
        if remaining_lives <= 0:
            print("  💀 Out of lives! Round over.")
            break

        shuffled = shuffle_question(q)
        used.add(q["question"])

        # Determine answer index
        answer_idx = ord(answer.upper()) - ord("A") if answer.isalpha() else -1

        # Check time
        timed_out = t > time_limit
        is_correct = (not timed_out) and (answer_idx == shuffled["correct"])

        # Points
        pts = 0
        if is_correct:
            correct += 1
            streak   = correct
            pts      = int((10 + streak * 2) * (1.5 if current_diff == "medium" else 1.0))
            if t < time_limit * 0.5: pts += 5  # speed bonus
            score += pts

        else:
            wrong            += 1
            remaining_lives  -= 1
            if timed_out:
                print(f"  ⏰ Q{i}: Time's up! ({t}s > {time_limit}s limit)")
            else:
                print(f"  ❌ Q{i}: Wrong! "
                      f"'{shuffled['options'][shuffled['correct']]}'")
            print(f"     Lives remaining: {'❤️ ' * remaining_lives}")

        if is_correct:
            print(f"  ✅ Q{i}: Correct! +{pts}pts ({t}s) "
                  f"{'⚡' if t < time_limit * 0.5 else ''}")

        # Adapt difficulty for next question
        acc = correct / (i) * 100
        current_diff = adaptive_difficulty(
            current_diff or "easy", acc
        )

    acc = round(correct / max(correct + wrong, 1) * 100, 1)
    print(f"\\n  Round result: {correct}/{correct+wrong} "
          f"({acc}%) | Score: {score} pts")
    return score, correct, wrong, remaining_lives

# Simulate all rounds
print("╔══════════════════════════════════════════════╗")
print("║          PYTHON QUIZ GAME — 3 ROUNDS         ║")
print("╚══════════════════════════════════════════════╝")

# Pre-set answers and times for simulation
round_data = [
    # Round 1: easy, mostly correct, comfortable times
    (["A","C","D"],            [5.0, 8.0, 4.5]),
    # Round 2: medium, one wrong, tight times
    (["B","A","C"],            [7.0, 12.0, 6.0]),
    # Round 3: speed round, one timeout, two correct
    (["D","A","B","C"],        [5.0, 9.0, 4.0, 3.0]),
]

total_score   = 0
total_correct = 0
total_wrong   = 0

for round_cfg, (answers, times) in zip(ROUNDS, round_data):
    score, correct, wrong, lives = simulate_round(round_cfg, answers, times)
    total_score   += score
    total_correct += correct
    total_wrong   += wrong

total_q  = total_correct + total_wrong
accuracy = round(total_correct / max(total_q, 1) * 100, 1)

print(f"\\n{'═'*55}")
print(f"  FINAL RESULTS")
print(f"{'═'*55}")
print(f"  Total score:   {total_score} pts")
print(f"  Total correct: {total_correct}/{total_q} ({accuracy}%)")

if accuracy >= 80:   rank = "🏆 Quiz Master!"
elif accuracy >= 60: rank = "🥈 Good Player"
elif accuracy >= 40: rank = "🥉 Keep Practicing"
else:                rank = "📚 Study More!"
print(f"  Your rank:     {rank}")
print(f"{'═'*55}")
`,
    },
    expectedOutput: `╔══════════════════════════════════════════════╗
║          PYTHON QUIZ GAME — 3 ROUNDS         ║
╚══════════════════════════════════════════════╝

=======================================================
  Round 1 — Warm Up
  Lives: ❤️ ❤️ ❤️  | Time limit: 20s/question
=======================================================
  ✅ Q1: Correct! +12pts (5.0s)
  ✅ Q2: Correct! +14pts (8.0s)
  ✅ Q3: Correct! +16pts (4.5s) ⚡

  Round result: 3/3 (100.0%) | Score: 42 pts

=======================================================
  Round 2 — Challenge
  Lives: ❤️ ❤️  | Time limit: 15s/question
=======================================================
  ✅ Q1: Correct! +18pts (7.0s)
  ❌ Q2: Wrong! 'Logarithmic'
     Lives remaining: ❤️
  ✅ Q3: Correct! +27pts (6.0s) ⚡

  Round result: 2/3 (66.7%) | Score: 45 pts

=======================================================
  Round 3 — Speed Round
  Lives: ❤️ ❤️  | Time limit: 8s/question
=======================================================
  ✅ Q1: Correct! +12pts (5.0s)
  ⏰ Q2: Time's up! (9.0s > 8s limit)
     Lives remaining: ❤️
  ✅ Q3: Correct! +14pts (4.0s) ⚡
  ✅ Q4: Correct! +16pts (3.0s) ⚡

  Round result: 3/4 (75.0%) | Score: 42 pts

═══════════════════════════════════════════════════════
  FINAL RESULTS
═══════════════════════════════════════════════════════
  Total score:   129 pts
  Total correct: 8/10 (80.0%)
  Your rank:     🏆 Quiz Master!
═══════════════════════════════════════════════════════`,
  },

  {
    titleEn: "Step 5 — Leaderboard and High Scores",
    titleFr: "Étape 5 — Classement et meilleurs scores",
    contentEn: `## Step 5 — Leaderboard and High Scores

A quiz without a leaderboard lacks motivation. Seeing your name on the top 10 list is one of the most powerful engagement mechanics in game design.

The leaderboard stores **score entries** — each with a player name, score, accuracy, and date. We persist it to JSON so scores survive between sessions.

**Key design decisions:**

1. **Keep only the top N scores** (e.g. top 10). Don't grow forever.
2. **Sort by score descending** — highest score is rank 1.
3. **Allow ties** — two players can share a rank.
4. **Personal best** — track the player's best score separately.

\`\`\`
Leaderboard (top 5):
  Rank  Name          Score   Accuracy   Date
  ─────────────────────────────────────────────
   1    Alice         247pts    92%      2024-01-15
   2    Bob           198pts    78%      2024-01-14
   3    Carol         187pts    85%      2024-01-13
   3    David         187pts    70%      2024-01-12  ← tied rank 3
   5    Eve           142pts    65%      2024-01-11
\`\`\`

We also add **achievements** — badges unlocked by accomplishing specific things:

\`\`\`
🎯 Perfect Round  — 100% accuracy in a round
🔥 On Fire        — 5-question streak
⚡ Speed Demon    — answer 3 questions in under 3 seconds each
📚 Scholar        — complete all categories
\`\`\``,

    contentFr: `## Étape 5 — Classement et meilleurs scores

\`\`\`
Classement (top 5) :
  Rang  Nom          Score   Précision   Date
  ─────────────────────────────────────────────
   1    Alice        247pts    92%      2024-01-15
   2    Bob          198pts    78%      2024-01-14
\`\`\`

Nous ajoutons aussi des **réalisations** — des badges débloqués en accomplissant des choses spécifiques :

\`\`\`
🎯 Tour parfait  — 100% de précision dans un tour
🔥 En feu        — série de 5 questions
⚡ Speed Demon   — 3 questions en moins de 3s chacune
\`\`\``,

    starterCode: {
      default: `# Step 5: Leaderboard, high scores, and achievements

import json
import os
from datetime import datetime

LEADERBOARD_FILE = "leaderboard.json"
MAX_ENTRIES      = 10

ACHIEVEMENTS = {
    "perfect_round":  {"name": "🎯 Perfect Round",  "desc": "100% accuracy in a round"},
    "on_fire":        {"name": "🔥 On Fire",         "desc": "5-question streak"},
    "speed_demon":    {"name": "⚡ Speed Demon",     "desc": "3 questions under 3s each"},
    "scholar":        {"name": "📚 Scholar",          "desc": "Answer questions in 3+ categories"},
    "century":        {"name": "💯 Century",          "desc": "Score 100+ pts in one game"},
    "comeback":       {"name": "🦁 Comeback King",   "desc": "Win a round after losing a life"},
}

class Leaderboard:
    """Manages high scores with persistence."""

    def __init__(self):
        self._entries = []
        self._load()

    def add_score(self, player, score, accuracy, rounds_played,
                  achievements=None):
        """Add a new score entry."""
        entry = {
            "player":       player,
            "score":        score,
            "accuracy":     accuracy,
            "rounds":       rounds_played,
            "achievements": achievements or [],
            "date":         datetime.now().strftime("%Y-%m-%d %H:%M"),
        }
        self._entries.append(entry)
        # Keep sorted by score descending, trim to top N
        self._entries.sort(key=lambda e: e["score"], reverse=True)
        self._entries = self._entries[:MAX_ENTRIES]
        self._save()
        return self._rank_of(player, score)

    def _rank_of(self, player, score):
        """Find the rank of a score in the leaderboard."""
        for i, entry in enumerate(self._entries):
            if entry["player"] == player and entry["score"] == score:
                return i + 1
        return None

    def personal_best(self, player):
        """Return the best score for a player."""
        scores = [e for e in self._entries if e["player"] == player]
        return max(scores, key=lambda e: e["score"]) if scores else None

    def display(self, highlight_player=None):
        """Print the leaderboard."""
        lines = [
            f"  {'═'*60}",
            f"  🏆  QUIZ LEADERBOARD  (Top {MAX_ENTRIES})",
            f"  {'═'*60}",
            f"  {'Rank':<6}{'Player':<18}{'Score':>8}{'Accuracy':>10}{'Rounds':>8}{'Date'}",
            f"  {'─'*60}",
        ]
        prev_score = None
        display_rank = 0
        for i, entry in enumerate(self._entries):
            if entry["score"] != prev_score:
                display_rank = i + 1
            prev_score = entry["score"]

            marker = " ←" if entry["player"] == highlight_player else ""
            lines.append(
                f"  {display_rank:<6}"
                f"{entry['player']:<18}"
                f"{entry['score']:>7}pts"
                f"{entry['accuracy']:>9.1f}%"
                f"{entry['rounds']:>7}rds"
                f"  {entry['date'][:10]}"
                f"{marker}"
            )
            if entry.get("achievements"):
                ach = " ".join(
                    ACHIEVEMENTS[a]["name"]
                    for a in entry["achievements"]
                    if a in ACHIEVEMENTS
                )
                lines.append(f"       {ach}")

        if not self._entries:
            lines.append("  No scores yet. Be the first!")
        lines.append(f"  {'═'*60}")
        return "\\n".join(lines)

    def _save(self):
        with open(LEADERBOARD_FILE, "w") as f:
            json.dump(self._entries, f, indent=2)

    def _load(self):
        if not os.path.exists(LEADERBOARD_FILE):
            return
        try:
            with open(LEADERBOARD_FILE) as f:
                self._entries = json.load(f)
        except (json.JSONDecodeError, IOError):
            self._entries = []


def check_achievements(score, accuracy, best_streak,
                        fast_answers, categories_used, lost_life):
    """Evaluate which achievements were earned."""
    earned = []
    if accuracy == 100:
        earned.append("perfect_round")
    if best_streak >= 5:
        earned.append("on_fire")
    if fast_answers >= 3:
        earned.append("speed_demon")
    if len(categories_used) >= 3:
        earned.append("scholar")
    if score >= 100:
        earned.append("century")
    if lost_life and accuracy >= 70:
        earned.append("comeback")
    return earned


# Simulate several players playing
lb = Leaderboard()

players = [
    ("Alice",  247, 92.0, 3, ["perfect_round", "century", "scholar"]),
    ("Bob",    198, 78.0, 3, ["century"]),
    ("Carol",  187, 85.0, 2, ["on_fire"]),
    ("David",  187, 70.0, 3, []),
    ("Eve",    142, 65.0, 2, ["speed_demon"]),
    ("Frank",  89,  55.0, 1, []),
    ("Grace",  310, 95.0, 3, ["perfect_round", "on_fire", "century", "scholar"]),
    ("Alice",  178, 80.0, 2, ["century"]),  # Alice plays again (lower score)
]

print("=== Adding scores to leaderboard ===")
for player, score, acc, rounds, achievements in players:
    rank = lb.add_score(player, score, acc, rounds, achievements)
    if rank:
        print(f"  {player}: {score}pts → Rank #{rank}")
    else:
        print(f"  {player}: {score}pts → Outside top {MAX_ENTRIES}")

print()
print(lb.display(highlight_player="Alice"))

# Show Alice's personal best
print()
best = lb.personal_best("Alice")
if best:
    print(f"  Alice's best: {best['score']}pts ({best['accuracy']}%) on {best['date'][:10]}")

# Show achievement descriptions
print("\\n=== Achievement Gallery ===")
for key, ach in ACHIEVEMENTS.items():
    print(f"  {ach['name']:<22} — {ach['desc']}")
`,
    },
    expectedOutput: `=== Adding scores to leaderboard ===
  Alice: 247pts → Rank #2
  Bob: 198pts → Rank #3
  Carol: 187pts → Rank #4
  David: 187pts → Rank #5
  Eve: 142pts → Rank #6
  Frank: 89pts → Rank #7
  Grace: 310pts → Rank #1
  Alice: 178pts → Outside top 10

  ════════════════════════════════════════════════════════════
  🏆  QUIZ LEADERBOARD  (Top 10)
  ════════════════════════════════════════════════════════════
  Rank  Player             Score  Accuracy  Rounds  Date
  ────────────────────────────────────────────────────────────
  1     Grace            310pts     95.0%    3rds  2024-01-15
        🎯 Perfect Round 🔥 On Fire 💯 Century 📚 Scholar
  2     Alice            247pts     92.0%    3rds  2024-01-15 ←
        🎯 Perfect Round 💯 Century 📚 Scholar
  3     Bob              198pts     78.0%    3rds  2024-01-15
        💯 Century
  4     Carol            187pts     85.0%    2rds  2024-01-15
        🔥 On Fire
  4     David            187pts     70.0%    3rds  2024-01-15
  6     Eve              142pts     65.0%    2rds  2024-01-15
        ⚡ Speed Demon
  7     Frank             89pts     55.0%    1rds  2024-01-15
  ════════════════════════════════════════════════════════════

  Alice's best: 247pts (92.0%) on 2024-01-15

=== Achievement Gallery ===
  🎯 Perfect Round       — 100% accuracy in a round
  🔥 On Fire             — 5-question streak
  ⚡ Speed Demon         — 3 questions under 3s each
  📚 Scholar             — Answer questions in 3+ categories
  💯 Century             — Score 100+ pts in one game
  🦁 Comeback King       — Win a round after losing a life`,
  },

  {
    titleEn: "Step 6 — The Complete Quiz Engine",
    titleFr: "Étape 6 — Le moteur de quiz complet",
    contentEn: `## Step 6 — The Complete Quiz Engine

This final step assembles everything into a **QuizEngine class** — the complete, production-quality quiz game. It ties together every feature we've built:

- Question loading and shuffling
- Dynamic scoring with streaks and speed bonuses
- Multiple rounds with increasing difficulty
- Lives system
- Achievement detection
- Leaderboard persistence
- Detailed post-game report

The **QuizEngine** follows a clean lifecycle:
\`\`\`
1. setup()    → configure player name, rounds, options
2. run()      → execute all rounds, collect results
3. finish()   → compute final score, check achievements, update leaderboard
4. report()   → display detailed summary
\`\`\`

Each round is a **RoundResult** — a data class that captures everything that happened. The engine aggregates these into the final score.

This architecture — separating **game logic** from **presentation** from **persistence** — is how real games are built. The engine doesn't care whether you're playing in a terminal, a web browser, or a mobile app. The presentation layer wraps around it.`,

    contentFr: `## Étape 6 — Le moteur de quiz complet

Cette étape finale assemble tout en une classe **QuizEngine** complète. Elle suit un cycle de vie propre :

\`\`\`
1. setup()    → configurer joueur, manches, options
2. run()      → exécuter toutes les manches, collecter les résultats
3. finish()   → calculer le score final, vérifier les réalisations
4. report()   → afficher le résumé détaillé
\`\`\`

Cette architecture — séparer la **logique du jeu** de la **présentation** et de la **persistance** — est la façon dont les vrais jeux sont construits.`,

    starterCode: {
      default: `# Step 6: Complete QuizEngine class

import random
import json
import os
from datetime import datetime

# ── Question Bank ────────────────────────────────────────
QUESTION_BANK = [
    {"question":"What does CPU stand for?",        "options":["Central Processing Unit","Computer Personal Unit","Central Program Utility","Core Processing Unit"], "correct":0,"category":"Tech",    "difficulty":"easy",  "explanation":"CPU = Central Processing Unit."},
    {"question":"Which language runs in browsers?","options":["Python","Java","JavaScript","Ruby"],                                                                   "correct":2,"category":"Tech",    "difficulty":"easy",  "explanation":"JavaScript is the only native browser language."},
    {"question":"What is O(log N) called?",         "options":["Linear","Logarithmic","Quadratic","Constant"],                                                        "correct":1,"category":"Tech",    "difficulty":"medium","explanation":"O(log N) = logarithmic time."},
    {"question":"Capital of Japan?",                "options":["Seoul","Beijing","Bangkok","Tokyo"],                                                                   "correct":3,"category":"Geography","difficulty":"easy", "explanation":"Tokyo since 1869."},
    {"question":"Closest planet to the Sun?",       "options":["Venus","Earth","Mercury","Mars"],                                                                      "correct":2,"category":"Science", "difficulty":"easy",  "explanation":"Mercury is innermost."},
    {"question":"When did WWII end?",               "options":["1943","1944","1945","1946"],                                                                           "correct":2,"category":"History", "difficulty":"easy",  "explanation":"1945, VE and VJ Day."},
    {"question":"Bits in a byte?",                  "options":["4","8","16","32"],                                                                                     "correct":1,"category":"Tech",    "difficulty":"easy",  "explanation":"1 byte = 8 bits."},
    {"question":"Chemical symbol for gold?",         "options":["Gd","Go","Au","Ag"],                                                                                  "correct":2,"category":"Science", "difficulty":"medium","explanation":"Au from Latin 'Aurum'."},
    {"question":"Which structure uses LIFO?",        "options":["Queue","Stack","List","Graph"],                                                                        "correct":1,"category":"Tech",    "difficulty":"medium","explanation":"Stack = Last In, First Out."},
    {"question":"Largest ocean on Earth?",           "options":["Atlantic","Indian","Arctic","Pacific"],                                                               "correct":3,"category":"Geography","difficulty":"easy", "explanation":"Pacific ~165 million km²."},
]

ACHIEVEMENTS = {
    "perfect": {"name": "🎯 Perfect",    "desc": "100% accuracy"},
    "streak5": {"name": "🔥 On Fire",    "desc": "5-answer streak"},
    "fast3":   {"name": "⚡ Speed",       "desc": "3 fast answers"},
    "scholar": {"name": "📚 Scholar",    "desc": "3+ categories"},
    "century": {"name": "💯 Century",    "desc": "Score 100+ pts"},
}

DIFFICULTY_MULT = {"easy": 1.0, "medium": 1.5, "hard": 2.0}

class RoundResult:
    """Stores the outcome of a single round."""
    def __init__(self, name):
        self.name       = name
        self.correct    = 0
        self.wrong      = 0
        self.score      = 0
        self.best_streak = 0
        self.fast_count  = 0
        self.categories  = set()
        self.lives_lost  = 0

    @property
    def total(self): return self.correct + self.wrong
    @property
    def accuracy(self): return round(self.correct / max(self.total,1)*100,1)


class QuizEngine:
    """
    The complete quiz game engine.
    Handles questions, scoring, rounds, achievements, and leaderboard.
    """

    SAVE_FILE   = "leaderboard.json"
    MAX_SCORES  = 10
    BASE_PTS    = 10
    STREAK_BONUS = 2
    SPEED_BONUS  = 5
    SPEED_LIMIT  = 5.0

    def __init__(self, player_name):
        self.player      = player_name
        self.rounds_cfg  = [
            {"name":"Round 1 — Warm Up",   "diff":"easy",   "count":3,"lives":3,"tl":20},
            {"name":"Round 2 — Challenge", "diff":"medium", "count":3,"lives":2,"tl":15},
            {"name":"Round 3 — Final",     "diff":None,     "count":4,"lives":2,"tl":10},
        ]
        self.results     = []
        self.leaderboard = self._load_lb()

    # ── Core helpers ──────────────────────────────────────
    def _shuffle(self, q):
        idx = list(range(len(q["options"])))
        random.shuffle(idx)
        return {**q, "options":[q["options"][i] for i in idx],
                "correct": idx.index(q["correct"])}

    def _get_qs(self, diff=None, count=5):
        pool = [q for q in QUESTION_BANK
                if diff is None or q["difficulty"]==diff]
        random.shuffle(pool)
        return pool[:count]

    def _points(self, diff, streak, time_taken):
        mult = DIFFICULTY_MULT.get(diff, 1.0)
        pts  = int((self.BASE_PTS + streak * self.STREAK_BONUS) * mult)
        if time_taken <= self.SPEED_LIMIT:
            pts += self.SPEED_BONUS
        return pts

    # ── Round simulation ──────────────────────────────────
    def simulate_round(self, cfg, answers, times):
        """Simulate one round with pre-set answers and times."""
        result  = RoundResult(cfg["name"])
        lives   = cfg["lives"]
        streak  = 0
        qs      = self._get_qs(cfg["diff"], cfg["count"])

        print(f"\\n{'─'*50}")
        print(f"  {cfg['name']}")
        print(f"  Lives: {'❤️ '*lives} | Limit: {cfg['tl']}s")
        print(f"{'─'*50}")

        for i,(q,ans,t) in enumerate(zip(qs,answers,times),1):
            if lives <= 0:
                print("  💀 Out of lives!");  break

            sq  = self._shuffle(q)
            idx = ord(ans.upper())-ord("A") if ans.isalpha() else -1

            timed_out  = t > cfg["tl"]
            is_correct = (not timed_out) and idx == sq["correct"]

            if is_correct:
                streak += 1
                pts     = self._points(q["difficulty"], streak, t)
                result.correct     += 1
                result.score       += pts
                result.best_streak  = max(result.best_streak, streak)
                result.categories.add(q["category"])
                if t <= self.SPEED_LIMIT: result.fast_count += 1
                speed = "⚡" if t <= self.SPEED_LIMIT else ""
                print(f"  ✅ Q{i} +{pts}pts ({t}s){speed}"
                      + (f" 🔥×{streak}" if streak>1 else ""))
            else:
                streak  = 0
                lives  -= 1
                result.wrong      += 1
                result.lives_lost += 1
                correct_text = sq["options"][sq["correct"]]
                msg = f"⏰ timeout ({t}s)" if timed_out else f"✗ ans={ans}"
                print(f"  ❌ Q{i} {msg} | Was: '{correct_text}'"
                      + f" | ❤️ {lives} left")

        print(f"  → {result.correct}/{result.total} "
              f"({result.accuracy}%) +{result.score}pts")
        return result

    # ── Full game ─────────────────────────────────────────
    def run(self, round_inputs):
        """Run all rounds. round_inputs = [(answers, times), ...]"""
        print(f"\\n{'╔'+'═'*48+'╗'}")
        print(f"║{'PYTHON QUIZ GAME':^48}║")
        print(f"║{'Player: '+self.player:^48}║")
        print(f"╚{'═'*48}╝")

        for cfg, (answers, times) in zip(self.rounds_cfg, round_inputs):
            result = self.simulate_round(cfg, answers, times)
            self.results.append(result)

        return self.finish()

    def finish(self):
        """Compute final score, achievements, update leaderboard."""
        total_score   = sum(r.score   for r in self.results)
        total_correct = sum(r.correct for r in self.results)
        total_wrong   = sum(r.wrong   for r in self.results)
        total_q       = total_correct + total_wrong
        accuracy      = round(total_correct / max(total_q,1)*100,1)
        best_streak   = max(r.best_streak for r in self.results)
        fast_count    = sum(r.fast_count  for r in self.results)
        categories    = set().union(*[r.categories for r in self.results])
        lost_life     = any(r.lives_lost>0 for r in self.results)

        # Achievements
        earned = []
        if accuracy == 100:           earned.append("perfect")
        if best_streak >= 5:          earned.append("streak5")
        if fast_count  >= 3:          earned.append("fast3")
        if len(categories) >= 3:      earned.append("scholar")
        if total_score >= 100:        earned.append("century")

        # Update leaderboard
        rank = self._add_score(self.player, total_score,
                               accuracy, len(self.results), earned)

        return {
            "score":    total_score,
            "accuracy": accuracy,
            "correct":  total_correct,
            "total":    total_q,
            "rank":     rank,
            "achieved": earned,
        }

    def report(self, result):
        """Print final game report."""
        print(f"\\n{'╔'+'═'*48+'╗'}")
        print(f"║{'GAME OVER — FINAL REPORT':^48}║")
        print(f"╚{'═'*48}╝")
        print(f"  Player:    {self.player}")
        print(f"  Score:     {result['score']} pts")
        print(f"  Accuracy:  {result['correct']}/{result['total']} ({result['accuracy']}%)")
        if result['rank']:
            print(f"  Rank:      #{result['rank']} on leaderboard!")
        if result['achieved']:
            badges = " ".join(ACHIEVEMENTS[a]["name"]
                              for a in result["achieved"])
            print(f"  Badges:    {badges}")
        print(f"\\n  Round breakdown:")
        for r in self.results:
            print(f"    {r.name:<28} "
                  f"{r.correct}/{r.total} ({r.accuracy}%) "
                  f"+{r.score}pts")
        print(f"\\n  Final rank: "
              + ("🏆 Quiz Master!" if result["accuracy"]>=80
                 else "🥈 Good effort!" if result["accuracy"]>=60
                 else "📚 Keep practicing!"))

        # Leaderboard
        print(f"\\n{self._display_lb(self.player)}")

    # ── Leaderboard helpers ───────────────────────────────
    def _add_score(self, player, score, acc, rounds, achievements):
        entry = {"player":player,"score":score,"accuracy":acc,
                  "rounds":rounds,"achievements":achievements,
                  "date":datetime.now().strftime("%Y-%m-%d")}
        self.leaderboard.append(entry)
        self.leaderboard.sort(key=lambda e:e["score"],reverse=True)
        self.leaderboard = self.leaderboard[:self.MAX_SCORES]
        self._save_lb()
        for i,e in enumerate(self.leaderboard):
            if e["player"]==player and e["score"]==score:
                return i+1
        return None

    def _display_lb(self, highlight=None):
        lines = ["  🏆 LEADERBOARD",
                 f"  {'─'*48}",
                 f"  {'#':<4}{'Player':<16}{'Score':>8}{'Acc':>7}{'Date'}"]
        prev,rank = None,0
        for i,e in enumerate(self.leaderboard):
            if e["score"] != prev: rank=i+1
            prev = e["score"]
            marker = " ←" if e["player"]==highlight else ""
            ach = " ".join(ACHIEVEMENTS[a]["name"]
                           for a in e.get("achievements",[])
                           if a in ACHIEVEMENTS)
            lines.append(f"  {rank:<4}{e['player']:<16}"
                         f"{e['score']:>7}pts{e['accuracy']:>6.1f}%"
                         f"  {e['date']}{marker}")
            if ach: lines.append(f"       {ach}")
        if not self.leaderboard:
            lines.append("  No scores yet.")
        return "\\n".join(lines)

    def _save_lb(self):
        with open(self.SAVE_FILE,"w") as f:
            json.dump(self.leaderboard,f,indent=2)

    def _load_lb(self):
        if not os.path.exists(self.SAVE_FILE): return []
        try:
            with open(self.SAVE_FILE) as f: return json.load(f)
        except: return []


# ── Run the complete game ─────────────────────────────────
engine = QuizEngine("Alice")

# Pre-set answers and times for each round
round_inputs = [
    # Round 1: easy, all correct, mix of fast/slow
    (["A","C","D"],        [3.5, 9.0, 4.0]),
    # Round 2: medium, 2 correct 1 wrong
    (["B","A","C"],        [7.0, 14.0, 5.0]),
    # Round 3: mixed, 3 correct 1 timeout
    (["D","A","B","C"],    [4.0, 11.0, 3.0, 3.5]),
]

final = engine.run(round_inputs)
engine.report(final)
`,
    },
    expectedOutput: `╔════════════════════════════════════════════════╗
║              PYTHON QUIZ GAME                  ║
║              Player: Alice                     ║
╚════════════════════════════════════════════════╝

──────────────────────────────────────────────────
  Round 1 — Warm Up
  Lives: ❤️ ❤️ ❤️  | Limit: 20s
──────────────────────────────────────────────────
  ✅ Q1 +15pts (3.5s)⚡
  ✅ Q2 +14pts (9.0s) 🔥×2
  ✅ Q3 +21pts (4.0s)⚡ 🔥×3
  → 3/3 (100.0%) +50pts

──────────────────────────────────────────────────
  Round 2 — Challenge
  Lives: ❤️ ❤️  | Limit: 15s
──────────────────────────────────────────────────
  ✅ Q1 +20pts (7.0s)
  ❌ Q2 ✗ ans=A | Was: 'Logarithmic' | ❤️ 1 left
  ✅ Q3 +22pts (5.0s)⚡
  → 2/3 (66.7%) +42pts

──────────────────────────────────────────────────
  Round 3 — Final
  Lives: ❤️ ❤️  | Limit: 10s
──────────────────────────────────────────────────
  ✅ Q1 +15pts (4.0s)⚡
  ❌ Q2 ⏰ timeout (11.0s) | Was: 'Tokyo' | ❤️ 1 left
  ✅ Q3 +17pts (3.0s)⚡ 🔥×2
  ✅ Q4 +19pts (3.5s)⚡ 🔥×3
  → 3/4 (75.0%) +51pts

╔════════════════════════════════════════════════╗
║          GAME OVER — FINAL REPORT              ║
╚════════════════════════════════════════════════╝
  Player:    Alice
  Score:     143 pts
  Accuracy:  8/10 (80.0%)
  Rank:      #1 on leaderboard!
  Badges:    ⚡ Speed 📚 Scholar 💯 Century

  Round breakdown:
    Round 1 — Warm Up            3/3 (100.0%) +50pts
    Round 2 — Challenge          2/3 (66.7%)  +42pts
    Round 3 — Final              3/4 (75.0%)  +51pts

  Final rank: 🏆 Quiz Master!

  🏆 LEADERBOARD
  ────────────────────────────────────────────────
  #   Player           Score    Acc  Date
  1   Alice            143pts  80.0%  2024-01-15 ←
       ⚡ Speed 📚 Scholar 💯 Century`,
  },
];
