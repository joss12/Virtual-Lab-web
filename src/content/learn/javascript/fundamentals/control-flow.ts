export const id = "control-flow";
export const titleEn = "Control Flow";
export const titleFr = "Structures de contrôle";

export const content = {
  en: `# Control Flow

## if / else if / else

JavaScript's \`if\` statement works exactly like Python's, with one key difference: **curly braces \`{}\` define the block instead of indentation**.

\`\`\`javascript
const age = 20;

if (age < 13) {
    console.log("Child");
} else if (age < 18) {
    console.log("Teenager");
} else if (age < 65) {
    console.log("Adult");
} else {
    console.log("Senior");
}
// Output: Adult
\`\`\`

### The Curly Brace Rule

\`\`\`javascript
// With curly braces — always safe (recommended)
if (age >= 18) {
    console.log("Adult");
    console.log("Can vote");
}

// Without curly braces — only works for ONE statement
// (easy to create bugs when adding more lines later)
if (age >= 18)
    console.log("Adult");  // works
    // console.log("Can vote");  // ← this runs ALWAYS — not inside the if!

// Best practice: ALWAYS use curly braces, even for single statements.
\`\`\`

### Comparison Operators

\`\`\`javascript
const x = 10;

console.log(x === 10);   // true  — strict equal (use this!)
console.log(x !== 5);    // true  — strict not equal
console.log(x > 5);      // true  — greater than
console.log(x < 20);     // true  — less than
console.log(x >= 10);    // true  — greater than or equal
console.log(x <= 10);    // true  — less than or equal
\`\`\`

### Logical Operators: &&, ||, !

\`\`\`javascript
const age = 25;
const hasId = true;

// && (AND) — both must be true
if (age >= 18 && hasId) {
    console.log("Entry allowed");
}

// || (OR) — at least one must be true
if (age < 13 || age > 65) {
    console.log("Discount applies");
}

// ! (NOT) — reverses true/false
if (!hasId) {
    console.log("No ID, no entry");
}

// Combining — use parentheses for clarity
if (age >= 18 && (hasId || age >= 21)) {
    console.log("Definitely allowed");
}
\`\`\`

### Short-Circuit Evaluation — A JavaScript Superpower

JavaScript's \`&&\` and \`||\` don't just return true/false — they return the **actual value** that determined the result. This enables powerful patterns.

\`\`\`javascript
// || returns the FIRST truthy value (or the last value)
const name = "" || "Anonymous";    // "" is falsy → returns "Anonymous"
const user = null || "Guest";      // null is falsy → returns "Guest"
const score = 0 || 100;            // 0 is falsy → returns 100

// Good for default values:
function greet(name) {
    const displayName = name || "Anonymous";
    console.log(\`Hello, \${displayName}!\`);
}
greet("Alice");   // Hello, Alice!
greet("");        // Hello, Anonymous!
greet();          // Hello, Anonymous! (name is undefined)

// && returns the FIRST falsy value (or the last value)
const user2 = null;
const name2 = user2 && user2.name;  // null && ... = null (safe!)
// Without &&, user2.name would throw: "Cannot read property of null"

// This pattern is so common it has a dedicated operator: ?.
// (optional chaining — covered later)
\`\`\`

### The Nullish Coalescing Operator (??)

\`\`\`javascript
// ?? returns right side only if left is null or undefined
// Unlike ||, it does NOT treat 0 or "" as "no value"

const score1 = 0 || 100;    // 100 — because 0 is falsy
const score2 = 0 ?? 100;    // 0   — because 0 is not null/undefined

const name1 = "" || "Anonymous";   // "Anonymous"
const name2 = "" ?? "Anonymous";   // "" — empty string is a valid value

// When to use which:
// || → "use this if previous is falsy"   (0, "", false count as "nothing")
// ?? → "use this if previous is missing" (only null/undefined count as "nothing")
\`\`\`

## The Ternary Operator

A one-line if/else — perfect for simple assignments.

\`\`\`javascript
// Regular if/else
let status;
if (age >= 18) {
    status = "adult";
} else {
    status = "minor";
}

// Same thing with ternary: condition ? valueIfTrue : valueIfFalse
const status2 = age >= 18 ? "adult" : "minor";
console.log(status2);   // adult

// In template literals
console.log(\`User is \${age >= 18 ? "an adult" : "a minor"}\`);

// Nested ternary — use sparingly (hard to read)
const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "F";

// Better: use if/else for complex conditions
\`\`\`

## Switch Statement

Switch is useful when you have many exact-value comparisons.

\`\`\`javascript
const day = "Monday";

switch (day) {
    case "Monday":
    case "Tuesday":
    case "Wednesday":
    case "Thursday":
    case "Friday":
        console.log("Weekday");
        break;          // IMPORTANT: break stops execution
    case "Saturday":
    case "Sunday":
        console.log("Weekend");
        break;
    default:
        console.log("Unknown day");
}

// Without break — "fall-through" (usually a bug):
switch (1) {
    case 1:
        console.log("one");   // prints
        // no break! falls through to case 2
    case 2:
        console.log("two");   // also prints (bug!)
        break;
    case 3:
        console.log("three"); // does not print
}
// Always include break unless fall-through is intentional.
\`\`\`

## for Loop

\`\`\`javascript
// Classic for loop: init; condition; update
for (let i = 0; i < 5; i++) {
    console.log(i);   // 0, 1, 2, 3, 4
}

// Count down
for (let i = 10; i > 0; i--) {
    console.log(i);   // 10, 9, 8, ..., 1
}

// Step by 2
for (let i = 0; i <= 10; i += 2) {
    console.log(i);   // 0, 2, 4, 6, 8, 10
}
\`\`\`

### for...of — Loop Over Values (Like Python's for...in)

\`\`\`javascript
const fruits = ["apple", "banana", "cherry"];

// for...of — gives you the VALUES (most common, like Python's for x in list)
for (const fruit of fruits) {
    console.log(fruit);
}
// apple
// banana
// cherry

// With index — use entries()
for (const [index, fruit] of fruits.entries()) {
    console.log(\`\${index}: \${fruit}\`);
}
// 0: apple
// 1: banana
// 2: cherry
\`\`\`

### for...in — Loop Over Keys (Use Carefully)

\`\`\`javascript
// for...in — gives you the KEYS (indices for arrays, property names for objects)
const person = { name: "Alice", age: 30, city: "Paris" };

for (const key in person) {
    console.log(\`\${key}: \${person[key]}\`);
}
// name: Alice
// age: 30
// city: Paris

// WARNING: don't use for...in on arrays — use for...of instead
// for...in on arrays gives string indices and can include inherited properties
\`\`\`

## while Loop

\`\`\`javascript
let count = 0;

while (count < 5) {
    console.log(\`count = \${count}\`);
    count++;   // count++ is short for count = count + 1
}

// do...while — runs at least once (checks condition AFTER the body)
let n = 10;
do {
    console.log(n);
    n--;
} while (n > 0);
\`\`\`

## break and continue

\`\`\`javascript
// break — exit the loop immediately
for (let i = 0; i < 10; i++) {
    if (i === 5) break;    // stop at 5
    console.log(i);         // 0, 1, 2, 3, 4
}

// continue — skip to next iteration
for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) continue;  // skip even numbers
    console.log(i);              // 1, 3, 5, 7, 9
}
\`\`\`

## Real Example: FizzBuzz

The classic programming exercise — reveals how you combine conditions.

\`\`\`javascript
for (let i = 1; i <= 20; i++) {
    if (i % 15 === 0) {
        console.log("FizzBuzz");   // divisible by both 3 and 5
    } else if (i % 3 === 0) {
        console.log("Fizz");       // divisible by 3
    } else if (i % 5 === 0) {
        console.log("Buzz");       // divisible by 5
    } else {
        console.log(i);            // not divisible by either
    }
}

// Why check 15 first?
// If you check 3 first, numbers divisible by both (like 15) would print "Fizz"
// The more specific condition (both) must come before the general ones.
\`\`\`
`,

  fr: `# Structures de contrôle

## if / else if / else

JavaScript utilise des **accolades \`{}\`** pour définir les blocs au lieu de l'indentation.

\`\`\`javascript
const age = 20;

if (age < 13) {
    console.log("Enfant");
} else if (age < 18) {
    console.log("Adolescent");
} else if (age < 65) {
    console.log("Adulte");
} else {
    console.log("Senior");
}
\`\`\`

### Court-circuit — Une puissance de JavaScript

\`\`\`javascript
// || retourne la PREMIÈRE valeur truthy
const nom = "" || "Anonyme";    // "" est falsy → retourne "Anonyme"

// ?? retourne le côté droit seulement si le gauche est null ou undefined
const score1 = 0 || 100;   // 100 — car 0 est falsy
const score2 = 0 ?? 100;   // 0   — car 0 n'est pas null/undefined

// Quand utiliser lequel :
// || → "utiliser si précédent est falsy"    (0, "" comptent comme "rien")
// ?? → "utiliser si précédent est manquant" (seulement null/undefined)
\`\`\`

## Boucle for

\`\`\`javascript
// Boucle for classique
for (let i = 0; i < 5; i++) {
    console.log(i);   // 0, 1, 2, 3, 4
}

// for...of — valeurs (comme le for...in de Python)
const fruits = ["pomme", "banane", "cerise"];
for (const fruit of fruits) {
    console.log(fruit);
}

// Avec index
for (const [index, fruit] of fruits.entries()) {
    console.log(\`\${index}: \${fruit}\`);
}

// for...in — clés (pour les objets)
const personne = { nom: "Alice", age: 30 };
for (const cle in personne) {
    console.log(\`\${cle}: \${personne[cle]}\`);
}
\`\`\`

## FizzBuzz — l'exercice classique

\`\`\`javascript
for (let i = 1; i <= 20; i++) {
    if (i % 15 === 0)     console.log("FizzBuzz");
    else if (i % 3 === 0) console.log("Fizz");
    else if (i % 5 === 0) console.log("Buzz");
    else                  console.log(i);
}
// Pourquoi vérifier 15 en premier ?
// Les nombres divisibles par les deux (comme 15) doivent être traités
// avant les conditions plus générales.
\`\`\`
`,
};

export const starterCode = {
  default: `// Control Flow — Practice

// --- Part 1: Grade classifier ---
const score = 75;

let grade;
if (score >= 90)      grade = "A";
else if (score >= 80) grade = "B";
else if (score >= 70) grade = "C";
else if (score >= 60) grade = "D";
else                  grade = "F";

console.log(\`Score \${score} → Grade \${grade}\`);

// --- Part 2: Short-circuit defaults ---
function greet(name, greeting) {
    const displayName = name ?? "Anonymous";
    const displayGreeting = greeting || "Hello";
    console.log(\`\${displayGreeting}, \${displayName}!\`);
}

greet("Alice", "Good morning");
greet("Bob");
greet(null, "Hey");
greet();

// --- Part 3: for...of with entries ---
console.log("\\nFruits:");
const fruits = ["apple", "banana", "cherry", "mango"];
for (const [i, fruit] of fruits.entries()) {
    const status = i % 2 === 0 ? "even" : "odd";
    console.log(\`  \${i + 1}. \${fruit} (\${status} position)\`);
}

// --- Part 4: FizzBuzz (1-15) ---
console.log("\\nFizzBuzz:");
for (let i = 1; i <= 15; i++) {
    if      (i % 15 === 0) console.log("  FizzBuzz");
    else if (i % 3  === 0) console.log("  Fizz");
    else if (i % 5  === 0) console.log("  Buzz");
    else                   console.log(\`  \${i}\`);
}
`,
};

export const exerciseEn = `1. Write a function 'classify(n)' that returns:
   - "negative" if n < 0
   - "zero" if n === 0
   - "small" if n is 1-9
   - "medium" if n is 10-99
   - "large" if n >= 100
   Test with: -5, 0, 7, 42, 150

2. Write a loop that prints numbers 1-30 but skips multiples of 3.
   Use continue.

3. Using short-circuit evaluation, write a one-liner that:
   - Gets a user's display name
   - Uses "Guest" if name is null/undefined
   - Uses "Anonymous" if name is empty string ""
   Hint: null ?? "..." || "..."`;

export const exerciseFr = `1. Écrivez une fonction 'classifier(n)' qui retourne :
   - "négatif" si n < 0
   - "zéro" si n === 0
   - "petit" si n est 1-9
   - "moyen" si n est 10-99
   - "grand" si n >= 100

2. Écrivez une boucle qui affiche 1-30 mais saute les multiples de 3.

3. Avec le court-circuit, écrivez en une ligne :
   - "Invité" si nom est null/undefined
   - "Anonyme" si nom est une chaîne vide ""`;

export const solutionCode = {
  default: `// 1. Classify numbers
function classify(n) {
    if (n < 0)   return "negative";
    if (n === 0) return "zero";
    if (n < 10)  return "small";
    if (n < 100) return "medium";
    return "large";
}

[-5, 0, 7, 42, 150].forEach(n => {
    console.log(\`classify(\${n}) = \${classify(n)}\`);
});

// 2. Skip multiples of 3
console.log("\\nNumbers 1-30 (skip multiples of 3):");
const result = [];
for (let i = 1; i <= 30; i++) {
    if (i % 3 === 0) continue;
    result.push(i);
}
console.log(result.join(", "));

// 3. Display name with short-circuit
const getDisplayName = (name) => (name ?? "Guest") || "Anonymous";

console.log("\\nDisplay names:");
console.log(getDisplayName("Alice"));   // Alice
console.log(getDisplayName(null));      // Guest
console.log(getDisplayName(undefined)); // Guest
console.log(getDisplayName(""));        // Anonymous
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the key difference between for...of and for...in in JavaScript?",
      options: [
        "for...of is faster than for...in for large arrays",
        "for...of iterates over VALUES (the elements themselves). for...in iterates over KEYS (indices for arrays, property names for objects). Use for...of for arrays, for...in for plain objects.",
        "for...in works on arrays, for...of works on objects",
        "They are identical — just different syntax for the same thing",
      ],
      correct: 1,
    },
    {
      question: "What does the ?? operator do that || does not?",
      options: [
        "?? is faster than || for null checks",
        "|| treats 0, '', and false as 'no value' and returns the right side. ?? only treats null and undefined as 'no value' — 0 and '' are considered valid values and returned as-is. Use ?? when 0 or empty string are valid inputs.",
        "?? works with objects, || only works with primitives",
        "They are identical — ?? is just newer syntax for ||",
      ],
      correct: 1,
    },
    {
      question:
        "Why is it best practice to always use curly braces {} in if statements?",
      options: [
        "JavaScript requires curly braces — code without them will throw an error",
        "Without curly braces, only the immediate next line is inside the if. Adding a second line without curly braces creates a bug where the second line runs regardless of the condition. Curly braces make the block explicit and safe.",
        "Curly braces improve performance by optimizing the compiled output",
        "It makes no difference — JavaScript ignores curly braces",
      ],
      correct: 1,
    },
    {
      question:
        "In a switch statement, what happens if you forget to add break?",
      options: [
        "The switch exits automatically after the matching case runs",
        "Without break, execution 'falls through' to the next case and runs it too, regardless of whether it matches. This is usually a bug — always add break unless fall-through is intentional.",
        "JavaScript throws a SyntaxError when break is missing",
        "The switch skips to the default case",
      ],
      correct: 1,
    },
    {
      question: "What does name || 'Anonymous' return when name is undefined?",
      options: [
        "undefined — because name was never set",
        "null — because undefined converts to null",
        "'Anonymous' — undefined is falsy, so || returns the right-hand value. This is a common pattern for providing default values.",
        "An error — you cannot use || with undefined",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question:
        "Quelle est la différence clé entre for...of et for...in en JavaScript ?",
      options: [
        "for...of est plus rapide que for...in pour les grands tableaux",
        "for...of itère sur les VALEURS (les éléments eux-mêmes). for...in itère sur les CLÉS (indices pour les tableaux, noms de propriétés pour les objets). Utilisez for...of pour les tableaux, for...in pour les objets.",
        "for...in fonctionne sur les tableaux, for...of sur les objets",
        "Ils sont identiques — juste une syntaxe différente",
      ],
      correct: 1,
    },
    {
      question: "Que fait l'opérateur ?? que || ne fait pas ?",
      options: [
        "?? est plus rapide que || pour les vérifications null",
        "|| traite 0, '' et false comme 'pas de valeur'. ?? traite seulement null et undefined comme 'pas de valeur' — 0 et '' sont des valeurs valides et retournées telles quelles.",
        "?? fonctionne avec les objets, || seulement avec les primitifs",
        "Ils sont identiques — ?? est juste une syntaxe plus récente pour ||",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi est-il recommandé d'utiliser toujours des accolades {} dans les if ?",
      options: [
        "JavaScript exige des accolades — le code sans elles lancera une erreur",
        "Sans accolades, seule la ligne immédiatement suivante est dans le if. Ajouter une deuxième ligne sans accolades crée un bug où la deuxième ligne s'exécute indépendamment de la condition.",
        "Les accolades améliorent les performances",
        "Cela ne fait aucune différence — JavaScript ignore les accolades",
      ],
      correct: 1,
    },
    {
      question:
        "Dans un switch, que se passe-t-il si vous oubliez d'ajouter break ?",
      options: [
        "Le switch sort automatiquement après le case correspondant",
        "Sans break, l'exécution 'tombe' dans le case suivant et l'exécute aussi, peu importe s'il correspond. C'est généralement un bug — ajoutez toujours break sauf si le fall-through est intentionnel.",
        "JavaScript lance une SyntaxError quand break est manquant",
        "Le switch passe directement au cas par défaut",
      ],
      correct: 1,
    },
    {
      question: "Que retourne name || 'Anonyme' quand name est undefined ?",
      options: [
        "undefined — car name n'a jamais été défini",
        "null — car undefined se convertit en null",
        "'Anonyme' — undefined est falsy, donc || retourne la valeur de droite. C'est un pattern courant pour les valeurs par défaut.",
        "Une erreur — vous ne pouvez pas utiliser || avec undefined",
      ],
      correct: 2,
    },
  ],
};
