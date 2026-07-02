export const id = "calculator";
export const titleEn = "Calculator";
export const titleFr = "Calculatrice";
export const descriptionEn = "Build a command-line calculator that handles +, -, ×, ÷ and edge cases like division by zero.";
export const descriptionFr = "Construisez une calculatrice en ligne de commande gérant +, -, ×, ÷ et les cas limites.";

export const steps = [
  {
    titleEn: "Step 1 — The Basic Operations",
    titleFr: "Étape 1 — Les opérations de base",
    contentEn: `## Step 1 — The Basic Operations

Every calculator starts the same way: four functions, one per operation.

The key insight of this step is that **each operation is its own function**. This makes the code easy to read, test, and extend. If you want to add a new operation later, you just add a new function — nothing else changes.

We also handle the most common edge case right away: **division by zero**. In mathematics, dividing by zero is undefined. In Python, it raises a \`ZeroDivisionError\` exception that crashes the program. We prevent that crash by checking the denominator before dividing.

\`\`\`
Why check BEFORE dividing?
  If b == 0: return None   ← safe, we control what happens
  return a / b             ← Python would crash here if b == 0

Returning None signals "this operation failed" to whoever calls the function.
The caller then decides how to handle it (print an error, ask again, etc.)
\`\`\`

Try running the code. Change the values of \`a\` and \`b\`. Try \`b = 0\` and see what happens.`,

    contentFr: `## Étape 1 — Les opérations de base

Chaque calculatrice commence de la même façon : quatre fonctions, une par opération.

L'idée clé de cette étape est que **chaque opération est sa propre fonction**. Cela rend le code facile à lire, tester et étendre.

Nous gérons aussi le cas limite le plus courant : **la division par zéro**. En Python, diviser par zéro lève une exception \`ZeroDivisionError\` qui fait planter le programme. Nous prévenons ce crash en vérifiant le dénominateur avant de diviser.

\`\`\`
Pourquoi vérifier AVANT de diviser ?
  Si b == 0 : retourner None   ← sécurisé, nous contrôlons ce qui se passe
  retourner a / b              ← Python planterait ici si b == 0
\`\`\``,

    starterCode: {
      default: `# Step 1: The four basic operations

def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    # Guard against division by zero
    if b == 0:
        return None   # signals "failed" — caller handles the error
    return a / b

# Test all four operations
print("=== Basic Operations ===")
print(f"10 + 3  = {add(10, 3)}")
print(f"10 - 3  = {subtract(10, 3)}")
print(f"10 × 3  = {multiply(10, 3)}")
print(f"10 ÷ 3  = {divide(10, 3):.4f}")
print(f"10 ÷ 0  = {divide(10, 0)}")   # should print None

# Try it with your own numbers
a = 25
b = 4
print(f"\\n{a} + {b} = {add(a, b)}")
print(f"{a} - {b} = {subtract(a, b)}")
print(f"{a} × {b} = {multiply(a, b)}")
print(f"{a} ÷ {b} = {divide(a, b)}")
`,
    },
    expectedOutput: `=== Basic Operations ===
10 + 3  = 13
10 - 3  = 7
10 × 3  = 30
10 ÷ 3  = 3.3333
10 ÷ 0  = None

25 + 4 = 29
25 - 4 = 21
25 × 4 = 100
25 ÷ 4 = 6.25`,
  },

  {
    titleEn: "Step 2 — A Single calculate() Function",
    titleFr: "Étape 2 — Une fonction calculate() unique",
    contentEn: `## Step 2 — A Single calculate() Function

Right now you have four separate functions. But a calculator's user doesn't call \`add()\` or \`multiply()\` directly — they type something like \`"10 + 3"\` and get an answer.

We need a **dispatcher**: one function that takes an operator as a string (\`"+"\`, \`"-"\`, etc.) and calls the right operation.

\`\`\`
calculate(10, "+", 3)  →  add(10, 3)     →  13
calculate(10, "-", 3)  →  subtract(10, 3) →  7
calculate(10, "*", 3)  →  multiply(10, 3) →  30
calculate(10, "/", 0)  →  divide(10, 0)  →  None
calculate(10, "?", 3)  →  unknown op!    →  None
\`\`\`

The dispatch is done with a **dictionary of functions**. Each key is an operator string, each value is the corresponding function object. This is cleaner and more extensible than a chain of \`if/elif\` — adding a new operator means adding one dictionary entry.

Notice that we store the **function itself** (not the result of calling it) in the dictionary. The \`operations[op](a, b)\` syntax calls the function with \`a\` and \`b\` as arguments.`,

    contentFr: `## Étape 2 — Une fonction calculate() unique

Nous avons besoin d'un **distributeur** : une fonction qui prend un opérateur sous forme de chaîne et appelle la bonne opération.

\`\`\`
calculate(10, "+", 3)  →  add(10, 3)      →  13
calculate(10, "/", 0)  →  divide(10, 0)   →  None
calculate(10, "?", 3)  →  opérateur inconnu → None
\`\`\`

La distribution se fait avec un **dictionnaire de fonctions**. Chaque clé est une chaîne d'opérateur, chaque valeur est la fonction correspondante. C'est plus propre qu'une chaîne de \`if/elif\`.`,

    starterCode: {
      default: `# Step 2: A single calculate() dispatcher

def add(a, b):      return a + b
def subtract(a, b): return a - b
def multiply(a, b): return a * b
def divide(a, b):
    if b == 0: return None
    return a / b

def calculate(a, operator, b):
    """
    Dispatch to the right operation based on the operator string.
    Returns the result, or None if the operator is unknown or operation fails.
    """
    operations = {
        "+": add,
        "-": subtract,
        "*": multiply,
        "/": divide,
    }

    if operator not in operations:
        print(f"Unknown operator: '{operator}'")
        return None

    result = operations[operator](a, b)
    return result

# Test the dispatcher
print("=== calculate() dispatcher ===")
tests = [
    (10, "+", 3),
    (10, "-", 3),
    (10, "*", 3),
    (10, "/", 3),
    (10, "/", 0),    # division by zero
    (10, "?", 3),    # unknown operator
    (7,  "*", 8),
    (100, "/", 4),
]

for a, op, b in tests:
    result = calculate(a, op, b)
    if result is not None:
        print(f"{a} {op} {b} = {result}")
    else:
        print(f"{a} {op} {b} = ERROR")
`,
    },
    expectedOutput: `=== calculate() dispatcher ===
10 + 3 = 13
10 - 3 = 7
10 * 3 = 30
10 / 3 = 3.3333333333333335
10 / 0 = ERROR
Unknown operator: '?'
10 ? 3 = ERROR
7 * 8 = 56
100 / 4 = 25.0`,
  },

  {
    titleEn: "Step 3 — Formatting Results Nicely",
    titleFr: "Étape 3 — Formater les résultats proprement",
    contentEn: `## Step 3 — Formatting Results Nicely

Right now our results look ugly: \`10 / 3 = 3.3333333333333335\`. Real calculators show a sensible number of decimal places.

We also have another problem: \`10 / 2 = 5.0\`. The \`.0\` is technically correct (division always returns a float in Python) but looks wrong. Users expect \`5\`, not \`5.0\`.

This step adds a \`format_result()\` function that:
1. If the result is a whole number (like \`5.0\`): show it as an integer (\`5\`)
2. Otherwise: round to 10 decimal places and strip trailing zeros

\`\`\`
5.0         → "5"       (whole number, no decimal needed)
3.3333...   → "3.3333333333" (trimmed, no trailing zeros)
0.1 + 0.2   → "0.3"    (floating point messiness hidden)
\`\`\`

The trick for stripping trailing zeros: \`f"{n:.10f}".rstrip('0').rstrip('.')\`
- \`.10f\` formats to 10 decimal places
- \`rstrip('0')\` removes trailing zeros
- \`rstrip('.')\` removes the decimal point if nothing remains after it`,

    contentFr: `## Étape 3 — Formater les résultats proprement

En ce moment nos résultats sont laids : \`10 / 3 = 3.3333333333333335\`. Les vraies calculatrices affichent un nombre raisonnable de décimales.

Cette étape ajoute une fonction \`format_result()\` qui :
1. Si le résultat est un nombre entier (\`5.0\`) : l'afficher comme entier (\`5\`)
2. Sinon : arrondir à 10 décimales et supprimer les zéros de fin

\`\`\`
5.0         → "5"
3.3333...   → "3.3333333333"
0.1 + 0.2   → "0.3"
\`\`\``,

    starterCode: {
      default: `# Step 3: Format results cleanly

def add(a, b):      return a + b
def subtract(a, b): return a - b
def multiply(a, b): return a * b
def divide(a, b):
    if b == 0: return None
    return a / b

def format_result(value):
    """Format a number for display — no ugly trailing zeros."""
    if value is None:
        return "Error"

    # If it's a whole number, show as integer
    if isinstance(value, float) and value.is_integer():
        return str(int(value))

    # Otherwise: 10 decimal places, strip trailing zeros
    formatted = f"{value:.10f}".rstrip("0").rstrip(".")
    return formatted

def calculate(a, operator, b):
    operations = {"+": add, "-": subtract, "*": multiply, "/": divide}
    if operator not in operations:
        return None
    return operations[operator](a, b)

# Test formatting
print("=== Formatted Results ===")
tests = [
    (10, "+", 3),     # 13   (integer)
    (10, "/", 2),     # 5    (whole float → integer)
    (10, "/", 3),     # 3.3333333333
    (1,  "/", 7),     # 0.1428571429
    (0.1, "+", 0.2),  # 0.3  (not 0.30000000000000004)
    (10, "/", 0),     # Error
]

for a, op, b in tests:
    result = calculate(a, op, b)
    print(f"  {a} {op} {b} = {format_result(result)}")
`,
    },
    expectedOutput: `=== Formatted Results ===
  10 + 3 = 13
  10 / 2 = 5
  10 / 3 = 3.3333333333
  1 / 7 = 0.1428571429
  0.1 + 0.2 = 0.3
  10 / 0 = Error`,
  },

  {
    titleEn: "Step 4 — Parsing User Input",
    titleFr: "Étape 4 — Analyser l'entrée utilisateur",
    contentEn: `## Step 4 — Parsing User Input

A real calculator takes input as a string like \`"10 + 3"\` or \`"5.5 * 2"\`. We need to **parse** this string into three parts: the first number, the operator, and the second number.

Parsing is the process of converting raw text into structured data your program can work with.

\`\`\`
"10 + 3"    →  a=10.0, op="+", b=3.0
"5.5 * 2"   →  a=5.5,  op="*", b=2.0
"10 / 0"    →  a=10.0, op="/", b=0.0
"hello"     →  invalid → return None, error message
"10 + + 3"  →  invalid → return None, error message
\`\`\`

We use \`.split()\` to break the string into parts, then \`float()\` to convert the number strings to actual numbers. We wrap everything in a \`try/except\` so invalid input (like \`"hello"\`) doesn't crash the program.

This is the pattern for **defensive programming**: assume the user will type something wrong, and handle it gracefully instead of crashing.`,

    contentFr: `## Étape 4 — Analyser l'entrée utilisateur

Un vrai calculatrice prend l'entrée comme une chaîne comme \`"10 + 3"\`. Nous devons **analyser** cette chaîne en trois parties : le premier nombre, l'opérateur, et le second nombre.

\`\`\`
"10 + 3"   →  a=10.0, op="+", b=3.0
"hello"    →  invalide → retourner None, message d'erreur
\`\`\`

Nous utilisons \`.split()\` pour décomposer la chaîne, puis \`float()\` pour convertir les chaînes de nombres. Tout est enveloppé dans un \`try/except\` pour que les entrées invalides ne fassent pas planter le programme.`,

    starterCode: {
      default: `# Step 4: Parse user input strings

def parse_expression(expression):
    """
    Parse "10 + 3" into (10.0, "+", 3.0).
    Returns (a, operator, b) on success.
    Returns (None, error_message, None) on failure.
    """
    parts = expression.strip().split()

    if len(parts) != 3:
        return None, f"Expected 'number operator number', got: '{expression}'", None

    a_str, operator, b_str = parts

    try:
        a = float(a_str)
    except ValueError:
        return None, f"'{a_str}' is not a valid number", None

    try:
        b = float(b_str)
    except ValueError:
        return None, f"'{b_str}' is not a valid number", None

    return a, operator, b

def format_result(value):
    if value is None: return "Error"
    if isinstance(value, float) and value.is_integer(): return str(int(value))
    return f"{value:.10f}".rstrip("0").rstrip(".")

def add(a, b):      return a + b
def subtract(a, b): return a - b
def multiply(a, b): return a * b
def divide(a, b):
    if b == 0: return None
    return a / b

def calculate(a, operator, b):
    operations = {"+": add, "-": subtract, "*": multiply, "/": divide}
    if operator not in operations: return None
    return operations[operator](a, b)

def evaluate(expression):
    """Full pipeline: parse → calculate → format."""
    a, operator, b = parse_expression(expression)
    if a is None:
        return f"Parse error: {operator}"
    result = calculate(a, operator, b)
    if result is None:
        return "Error: division by zero" if operator == "/" else "Error: unknown operator"
    return format_result(result)

# Test parsing
print("=== Expression Parser ===")
expressions = [
    "10 + 3",
    "5.5 * 2",
    "100 / 4",
    "10 / 0",
    "7 - 2.5",
    "hello",
    "10 + + 3",
    "abc * def",
]

for expr in expressions:
    print(f"  '{expr}' → {evaluate(expr)}")
`,
    },
    expectedOutput: `=== Expression Parser ===
  '10 + 3' → 13
  '5.5 * 2' → 11
  '100 / 4' → 25
  '10 / 0' → Error: division by zero
  '7 - 2.5' → 4.5
  'hello' → Parse error: Expected 'number operator number', got: 'hello'
  '10 + + 3' → Parse error: '+'  is not a valid number
  'abc * def' → Parse error: 'abc' is not a valid number`,
  },

  {
    titleEn: "Step 5 — History and Memory",
    titleFr: "Étape 5 — Historique et mémoire",
    contentEn: `## Step 5 — History and Memory

A useful calculator remembers what you've calculated. This step adds:

1. **History** — a list of all past calculations
2. **Memory** — store one result and reuse it in future calculations with the keyword \`"mem"\`

\`\`\`
Calculate: 10 + 5 = 15
Calculate: mem * 2 = 30   ← "mem" is replaced with 15
Calculate: 100 / mem = ?  ← error: mem is 15, 100/15 = 6.6666...
\`\`\`

The memory feature works by modifying the expression string before parsing: replace \`"mem"\` with the stored memory value. This is called **preprocessing** — transforming input before the main processing pipeline.

History is just a list that grows with each calculation. We can display it, clear it, or use the most recent result.

This step introduces the **Calculator class** — bundling all the state (history, memory) and operations into one organized object. This is exactly where classes shine: managing related state and behavior together.`,

    contentFr: `## Étape 5 — Historique et mémoire

Cette étape ajoute :
1. **Historique** — une liste de tous les calculs passés
2. **Mémoire** — stocker un résultat et le réutiliser avec le mot-clé \`"mem"\`

\`\`\`
Calculer : 10 + 5 = 15
Calculer : mem * 2 = 30   ← "mem" est remplacé par 15
\`\`\`

La mémoire fonctionne en modifiant la chaîne d'expression avant l'analyse : remplacer \`"mem"\` par la valeur mémorisée stockée. C'est du **prétraitement**.

Cette étape introduit la **classe Calculator** — regroupant tout l'état (historique, mémoire) et les opérations en un objet organisé.`,

    starterCode: {
      default: `# Step 5: Calculator class with history and memory

class Calculator:
    def __init__(self):
        self.history = []   # list of (expression, result) tuples
        self.memory  = 0    # stored value, starts at 0

    # ── Core math operations ──────────────────────────────
    @staticmethod
    def _operate(a, op, b):
        ops = {"+": lambda: a + b, "-": lambda: a - b,
               "*": lambda: a * b, "/": lambda: None if b == 0 else a / b}
        return ops.get(op, lambda: None)()

    # ── Result formatting ─────────────────────────────────
    @staticmethod
    def _format(value):
        if value is None: return "Error"
        if isinstance(value, float) and value.is_integer(): return str(int(value))
        return f"{value:.10f}".rstrip("0").rstrip(".")

    # ── Expression parsing ────────────────────────────────
    def _preprocess(self, expression):
        """Replace 'mem' keyword with current memory value."""
        return expression.replace("mem", str(self.memory))

    def _parse(self, expression):
        parts = expression.strip().split()
        if len(parts) != 3:
            return None, "Invalid format: use 'number op number'", None
        a_str, op, b_str = parts
        try: a = float(a_str)
        except ValueError: return None, f"Not a number: {a_str}", None
        try: b = float(b_str)
        except ValueError: return None, f"Not a number: {b_str}", None
        return a, op, b

    # ── Main calculate method ─────────────────────────────
    def calculate(self, expression):
        # Preprocessing: replace 'mem' with memory value
        expression = self._preprocess(expression)

        a, op, b = self._parse(expression)
        if a is None:
            return f"Error: {op}"

        result = self._operate(a, op, b)
        formatted = self._format(result)

        # Store in history
        self.history.append((expression.strip(), formatted))

        return formatted

    def store_memory(self):
        """Store the last result in memory."""
        if self.history:
            last_result = self.history[-1][1]
            try:
                self.memory = float(last_result)
                print(f"Stored {self.memory} in memory.")
            except ValueError:
                print("Cannot store error in memory.")

    def show_history(self):
        if not self.history:
            print("No history yet.")
            return
        print("=== History ===")
        for i, (expr, result) in enumerate(self.history, 1):
            print(f"  {i}. {expr} = {result}")

    def clear_history(self):
        self.history.clear()
        print("History cleared.")


# Test the calculator
calc = Calculator()

expressions = [
    "10 + 5",
    "mem * 2",      # uses memory (starts at 0)
    "100 / 4",
]

for expr in expressions:
    result = calc.calculate(expr)
    print(f"  {expr} = {result}")

calc.store_memory()   # store last result (25)

more = [
    "mem + 5",      # 25 + 5 = 30
    "mem * mem",    # 25 * 25 = 625
    "10 / 0",
]

print()
for expr in more:
    result = calc.calculate(expr)
    print(f"  {expr} = {result}")

print()
calc.show_history()
`,
    },
    expectedOutput: `  10 + 5 = 15
  mem * 2 = 0
  100 / 4 = 25
Stored 25.0 in memory.

  mem + 5 = 30
  mem * mem = 625
  10 / 0 = Error

=== History ===
  1. 10 + 5 = 15
  2. 0 * 2 = 0
  3. 100 / 4 = 25
  4. 25.0 + 5 = 30
  5. 25.0 * 25.0 = 625
  6. 10 / 0 = Error`,
  },

  {
    titleEn: "Step 6 — The Interactive Loop",
    titleFr: "Étape 6 — La boucle interactive",
    contentEn: `## Step 6 — The Interactive Loop

This is the final step: wrapping everything in an **interactive loop** so the user can type expressions and get answers continuously, like a real calculator.

The loop pattern is called a **REPL**: Read-Eval-Print Loop.
1. **Read** — get input from the user
2. **Evaluate** — compute the result
3. **Print** — show the result
4. **Loop** — go back to step 1

We also add special commands:
- \`"history"\` — show all past calculations
- \`"store"\` — save last result to memory
- \`"clear"\` — clear history
- \`"help"\` — show available commands
- \`"quit"\` or \`"exit"\` — end the program

\`\`\`
The loop runs forever (while True) until the user types "quit".
This is the standard pattern for interactive CLI programs.
\`\`\`

Since Pyodide runs in the browser (not a terminal), we simulate the interactive loop by running a list of pre-defined inputs. In a real terminal, you'd use \`input()\` to get user input.`,

    contentFr: `## Étape 6 — La boucle interactive

C'est l'étape finale : envelopper tout dans une **boucle interactive** pour que l'utilisateur puisse taper des expressions et obtenir des réponses en continu.

Le pattern de boucle s'appelle un **REPL** : Read-Eval-Print Loop (Lire-Évaluer-Afficher-Boucler).

Nous ajoutons aussi des commandes spéciales :
- \`"historique"\` — afficher tous les calculs passés
- \`"stocker"\` — sauvegarder le dernier résultat en mémoire
- \`"aide"\` — afficher les commandes disponibles
- \`"quitter"\` — terminer le programme`,

    starterCode: {
      default: `# Step 6: Full interactive calculator (simulated)

class Calculator:
    def __init__(self):
        self.history = []
        self.memory  = 0

    @staticmethod
    def _operate(a, op, b):
        ops = {"+": lambda: a + b, "-": lambda: a - b,
               "*": lambda: a * b, "/": lambda: None if b == 0 else a / b}
        return ops.get(op, lambda: None)()

    @staticmethod
    def _format(value):
        if value is None: return "Error"
        if isinstance(value, float) and value.is_integer(): return str(int(value))
        return f"{value:.10f}".rstrip("0").rstrip(".")

    def _preprocess(self, expression):
        return expression.replace("mem", str(self.memory))

    def _parse(self, expression):
        parts = expression.strip().split()
        if len(parts) != 3:
            return None, "Invalid format: use 'number op number'", None
        a_str, op, b_str = parts
        try: a = float(a_str)
        except ValueError: return None, f"Not a number: {a_str}", None
        try: b = float(b_str)
        except ValueError: return None, f"Not a number: {b_str}", None
        return a, op, b

    def calculate(self, expression):
        expression = self._preprocess(expression)
        a, op, b = self._parse(expression)
        if a is None: return f"Error: {op}"
        result = self._operate(a, op, b)
        formatted = self._format(result)
        self.history.append((expression.strip(), formatted))
        return formatted

    def store_memory(self):
        if not self.history: return "Nothing to store."
        last_result = self.history[-1][1]
        try:
            self.memory = float(last_result)
            return f"Stored {self._format(self.memory)} in memory."
        except ValueError:
            return "Cannot store error in memory."

    def show_history(self):
        if not self.history:
            return "No history yet."
        lines = ["=== Calculation History ==="]
        for i, (expr, result) in enumerate(self.history, 1):
            lines.append(f"  {i:2}. {expr} = {result}")
        lines.append(f"  Total calculations: {len(self.history)}")
        return "\\n".join(lines)

    def clear_history(self):
        count = len(self.history)
        self.history.clear()
        return f"Cleared {count} calculations from history."


def show_help():
    return """
=== Calculator Help ===
  Enter expressions like:  10 + 3   5.5 * 2   100 / 4
  Operators: + - * /
  Use 'mem' to reference stored memory: mem + 10
  Commands:
    history  — show calculation history
    store    — store last result in memory
    clear    — clear history
    help     — show this help
    quit     — exit the calculator
"""

def run_calculator(inputs):
    """
    Run the calculator with a list of inputs (simulating interactive use).
    In a real terminal: replace inputs with an infinite while True + input().
    """
    calc = Calculator()

    print("=" * 40)
    print("       Python Calculator v1.0")
    print("=" * 40)
    print("Type 'help' for commands, 'quit' to exit\\n")

    for user_input in inputs:
        user_input = user_input.strip()
        print(f"> {user_input}")

        if not user_input:
            continue

        elif user_input.lower() in ("quit", "exit"):
            print("Goodbye!")
            break

        elif user_input.lower() == "help":
            print(show_help())

        elif user_input.lower() == "history":
            print(calc.show_history())

        elif user_input.lower() == "store":
            print(calc.store_memory())

        elif user_input.lower() == "clear":
            print(calc.clear_history())

        else:
            result = calc.calculate(user_input)
            print(f"  = {result}")

        print()


# Simulate a calculator session
session = [
    "help",
    "10 + 5",
    "mem * 2",     # memory is 0, so 0 * 2 = 0
    "100 / 4",
    "store",       # store 25 in memory
    "mem + 10",    # 25 + 10 = 35
    "mem * mem",   # 25 * 25 = 625
    "7 / 0",       # division by zero
    "history",
    "clear",
    "history",
    "quit",
]

run_calculator(session)
`,
    },
    expectedOutput: `========================================
       Python Calculator v1.0
========================================
Type 'help' for commands, 'quit' to exit

> help

=== Calculator Help ===
  Enter expressions like:  10 + 3   5.5 * 2   100 / 4
  Operators: + - * /
  Use 'mem' to reference stored memory: mem + 10
  Commands:
    history  — show calculation history
    store    — store last result in memory
    clear    — clear history
    help     — show this help
    quit     — exit the calculator

> 10 + 5
  = 15

> mem * 2
  = 0

> 100 / 4
  = 25

> store
  Stored 25 in memory.

> mem + 10
  = 35

> mem * mem
  = 625

> 7 / 0
  = Error

> history
=== Calculation History ===
   1. 10 + 5 = 15
   2. 0 * 2 = 0
   3. 100 / 4 = 25
   4. 25.0 + 10 = 35
   5. 25.0 * 25.0 = 625
   6. 7 / 0 = Error
  Total calculations: 6

> clear
  Cleared 6 calculations from history.

> history
  No history yet.

> quit
Goodbye!`,
  },
];
