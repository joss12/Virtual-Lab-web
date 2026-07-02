export const id = "variables-and-types";
export const titleEn = "Variables & Types";
export const titleFr = "Variables et types";

export const content = {
  en: `# Variables & Types

## JavaScript vs Python: The First Difference

If you've done the Python section, you already know what variables and types are. JavaScript works the same way conceptually — but the syntax is different, and there are a few important quirks to understand.

The biggest difference: **JavaScript has three ways to declare a variable**.

\`\`\`javascript
var   name = "Alice";   // old way — avoid this
let   age  = 30;        // modern — for values that change
const PI   = 3.14159;   // modern — for values that never change
\`\`\`

**The rule is simple: always use \`const\` first. Switch to \`let\` only if you need to reassign. Never use \`var\`.**

\`\`\`javascript
// Good — const by default
const name = "Alice";
const age  = 30;

// Only use let when you need to reassign
let score = 0;
score = score + 10;   // reassignment — needs let
score += 5;           // shorthand for score = score + 5

// var has confusing scoping rules — just don't use it
\`\`\`

## The Four Core Types

### Strings (text)

\`\`\`javascript
const firstName = "Alice";
const lastName  = 'Smith';          // single or double quotes both work
const greeting  = \`Hello, \${firstName}!\`;  // template literal (backtick)

// Template literals — the modern way (like Python's f-strings)
const message = \`My name is \${firstName} \${lastName}. I am \${age} years old.\`;
console.log(message);   // My name is Alice Smith. I am 30 years old.

// String methods
console.log("hello".toUpperCase());   // "HELLO"
console.log("  hello  ".trim());      // "hello" (removes whitespace)
console.log("hello".includes("ell")); // true
console.log("hello".length);          // 5 (property, not method)
console.log("hello".slice(1, 3));     // "el"
\`\`\`

### Numbers

\`\`\`javascript
// JavaScript has ONE number type (no int vs float)
const age   = 30;
const price = 29.99;
const big   = 1_000_000;   // underscores for readability

// All math works the same as Python
console.log(10 + 3);    // 13
console.log(10 - 3);    // 7
console.log(10 * 3);    // 30
console.log(10 / 3);    // 3.3333... (always decimal in JS!)
console.log(10 % 3);    // 1  (remainder)
console.log(2 ** 10);   // 1024 (exponent)

// JavaScript quirk: there is no integer division operator (//)
// Use Math.floor() instead:
console.log(Math.floor(10 / 3));   // 3

// Useful Math methods
console.log(Math.round(3.7));    // 4
console.log(Math.ceil(3.2));     // 4  (always up)
console.log(Math.floor(3.9));    // 3  (always down)
console.log(Math.abs(-5));       // 5  (absolute value)
console.log(Math.max(1,5,3));    // 5
console.log(Math.min(1,5,3));    // 1
\`\`\`

### Booleans

\`\`\`javascript
const isRaining  = true;
const isSunny    = false;
const isAdult    = age >= 18;   // true if age is 18 or more

// Comparison operators (same as Python)
console.log(10 > 5);    // true
console.log(10 < 5);    // false
console.log(10 >= 10);  // true
console.log(10 <= 9);   // false

// IMPORTANT: use === not == in JavaScript
console.log(10 == "10");   // true  — dangerous! (type coercion)
console.log(10 === "10");  // false — correct! (strict equality)
console.log(10 !== "10");  // true  — strict not-equal

// Always use === and !== — never == or !=
\`\`\`

### The == vs === Problem

This is the most famous JavaScript gotcha. \`==\` does **type coercion** — it converts types before comparing, which leads to bizarre results:

\`\`\`javascript
// == (loose equality) — type coercion, unpredictable
console.log(0  == false);   // true  ← 0 converted to false
console.log("" == false);   // true  ← "" converted to false
console.log(1  == true);    // true  ← 1 converted to true
console.log(0  == "");      // true  ← both convert to falsy
console.log(null == undefined); // true ← special case

// === (strict equality) — no coercion, always predictable
console.log(0   === false);  // false ← different types
console.log("1" === 1);      // false ← different types
console.log(null === undefined); // false ← different values

// Rule: ALWAYS use === and !== in JavaScript. No exceptions.
\`\`\`

## null and undefined — Two "No Value" Types

Python has one "no value": \`None\`. JavaScript has two, and they mean different things.

\`\`\`javascript
// undefined — a variable exists but has no value assigned
let x;
console.log(x);          // undefined

function greet(name) {
    console.log(name);   // undefined if called with no argument
}
greet();                  // logs undefined

// null — intentionally empty (programmer explicitly set it)
let user = null;          // "there is no user" (deliberate)
console.log(user);        // null

// How to check:
console.log(x    === undefined);  // true
console.log(user === null);       // true

// Check for EITHER null or undefined:
console.log(x    == null);   // true (the one good use of ==)
console.log(user == null);   // true

// Practical rule:
// undefined = variable not yet set (often a bug)
// null = intentionally empty (set by you)
\`\`\`

## Type Checking and Conversion

\`\`\`javascript
// typeof — check the type of a variable
console.log(typeof "hello");   // "string"
console.log(typeof 42);        // "number"
console.log(typeof true);      // "boolean"
console.log(typeof undefined); // "undefined"
console.log(typeof null);      // "object" ← famous JS bug, null is not an object!
console.log(typeof []);        // "object" ← arrays are objects in JS

// Type conversion
console.log(Number("42"));     // 42    (string → number)
console.log(Number("3.14"));   // 3.14
console.log(Number("hello"));  // NaN   (Not a Number)
console.log(Number(true));     // 1
console.log(Number(false));    // 0
console.log(Number(null));     // 0

console.log(String(42));       // "42"  (number → string)
console.log(String(true));     // "true"
console.log(String(null));     // "null"

console.log(Boolean(0));       // false
console.log(Boolean(""));      // false
console.log(Boolean(null));    // false
console.log(Boolean(undefined));// false
console.log(Boolean(1));       // true
console.log(Boolean("hello")); // true
console.log(Boolean([]));      // true  ← empty array is truthy in JS!

// Check if a conversion failed:
const num = Number("hello");
console.log(isNaN(num));       // true (Not a Number)
\`\`\`

## Truthy and Falsy Values

\`\`\`javascript
// These are FALSY (behave like false in conditions):
// false, 0, "", null, undefined, NaN

// Everything else is TRUTHY — including:
// [], {}, "0", -1, Infinity

// This catches beginners off guard:
if ([]) {
    console.log("empty array is TRUTHY");  // this runs!
}
if ({}) {
    console.log("empty object is TRUTHY"); // this runs too!
}
if ("0") {
    console.log("string '0' is TRUTHY");   // this runs!
}

// Python comparison:
// Python falsy: False, None, 0, 0.0, "", [], {}
// JS falsy:     false, null, undefined, 0, NaN, ""
// Key difference: [] and {} are falsy in Python, TRUTHY in JS
\`\`\`

## Variable Scope

\`\`\`javascript
// const and let are BLOCK-scoped — only exist inside their {}
{
    const blockVar = "inside";
    console.log(blockVar);   // "inside" — works
}
// console.log(blockVar);   // ReferenceError — blockVar is gone

// Functions create their own scope
function myFunction() {
    const local = "I'm local";
    console.log(local);   // works
}
// console.log(local);   // ReferenceError

// Variables declared outside are accessible inside
const globalVar = "I'm global";
function readGlobal() {
    console.log(globalVar);   // works — reads outer scope
}
readGlobal();
\`\`\`
`,

  fr: `# Variables et types

## JavaScript vs Python : la première différence

JavaScript a trois façons de déclarer une variable. La règle est simple : **utilisez toujours \`const\` en premier. Passez à \`let\` seulement si vous devez réassigner. N'utilisez jamais \`var\`.**

\`\`\`javascript
const nom  = "Alice";   // valeur qui ne change pas
let   age  = 30;        // valeur qui peut changer
// var  → évitez, règles de portée confuses
\`\`\`

## Les quatre types de base

### Chaînes (texte)

\`\`\`javascript
const prenom  = "Alice";
const message = \`Bonjour, \${prenom} !\`;  // littéral de gabarit (backtick)

console.log("bonjour".toUpperCase());  // "BONJOUR"
console.log("  bonjour  ".trim());     // "bonjour"
console.log("bonjour".length);         // 7
\`\`\`

### Nombres

\`\`\`javascript
// JavaScript a UN seul type de nombre (pas int vs float)
const age  = 30;
const prix = 29.99;

console.log(10 / 3);               // 3.333... (toujours décimal !)
console.log(Math.floor(10 / 3));   // 3 (division entière)
\`\`\`

## Le problème == vs ===

C'est le piège le plus célèbre de JavaScript. \`==\` fait de la **coercition de type** :

\`\`\`javascript
// == (égalité lâche) — conversion de types, imprévisible
console.log(0  == false);   // true  ← dangereux !
console.log("" == false);   // true  ← dangereux !

// === (égalité stricte) — pas de conversion, toujours prévisible
console.log(0   === false);  // false ← correct
console.log("1" === 1);      // false ← correct

// Règle : utilisez TOUJOURS === et !== en JavaScript.
\`\`\`

## null et undefined — Deux types "sans valeur"

\`\`\`javascript
// undefined — variable existe mais sans valeur assignée
let x;
console.log(x);   // undefined

// null — intentionnellement vide (défini par le programmeur)
let utilisateur = null;
console.log(utilisateur);   // null
\`\`\`

## Valeurs truthy et falsy

\`\`\`javascript
// FALSY : false, 0, "", null, undefined, NaN
// TRUTHY : tout le reste — y compris [], {}, "0", -1

// Différence importante avec Python :
// Python falsy : False, None, 0, "", [], {}
// JS falsy : false, null, undefined, 0, NaN, ""
// Différence clé : [] et {} sont falsy en Python, TRUTHY en JS !
if ([]) console.log("tableau vide est TRUTHY !");  // s'exécute !
\`\`\`
`,
};

export const starterCode = {
  default: `// Variables & Types — Practice
// Try changing values and run the code!

// --- const vs let ---
const name = "Alice";
let score = 0;
score += 10;
score += 5;
console.log(\`\${name}'s score: \${score}\`);

// --- Numbers ---
const price = 29.99;
const qty   = 3;
const total = price * qty;
console.log(\`Total: $\${total.toFixed(2)}\`);

// --- Strict equality ===  ---
console.log("\\n=== vs ==:");
console.log(1 == "1",  "← loose (==)  AVOID");
console.log(1 === "1", "← strict (===) USE THIS");

// --- Type checking ---
console.log("\\nTypes:");
const values = [42, "hello", true, null, undefined, []];
values.forEach(v => {
    console.log(\`  \${String(v).padEnd(12)} → typeof: \${typeof v}\`);
});

// --- Truthy/Falsy ---
console.log("\\nFalsy check:");
const testValues = [0, "", null, undefined, false, [], {}, "0", -1];
testValues.forEach(v => {
    const result = v ? "truthy" : "falsy";
    console.log(\`  \${String(v).padEnd(12)} → \${result}\`);
});
`,
};

export const exerciseEn = `Fix the bugs in this code — there are 4 mistakes related to what you learned:

1. Using var instead of const/let
2. Using == instead of ===
3. Assuming an empty array is falsy
4. Not handling NaN from a failed conversion

\`\`\`javascript
var username = "Alice";
var userAge = "25";

if (userAge == 25) {
  console.log("Age is 25");
}

var cart = [];
if (!cart) {
  console.log("Cart is empty");
}

var price = Number("free");
console.log("Price: " + price);
\`\`\``;

export const exerciseFr = `Corrigez les bugs dans ce code — il y a 4 erreurs liées à ce que vous avez appris :

1. Utilisation de var au lieu de const/let
2. Utilisation de == au lieu de ===
3. Supposer qu'un tableau vide est falsy
4. Ne pas gérer NaN d'une conversion échouée`;

export const solutionCode = {
  default: `// Fixed version
const username = "Alice";   // var → const
const userAge = "25";

if (userAge === "25") {     // == → === (compare same types)
  console.log("Age is 25");
}

const cart = [];
if (cart.length === 0) {    // [] is truthy! check .length instead
  console.log("Cart is empty");
}

const price = Number("free");
if (isNaN(price)) {         // handle failed conversion
  console.log("Invalid price");
} else {
  console.log("Price: " + price);
}
`,
};

export const quiz = {
  en: [
    {
      question: "What is the difference between const and let in JavaScript?",
      options: [
        "const is faster than let at runtime",
        "const declares a variable that cannot be reassigned after declaration. let declares a variable that can be reassigned. Both are block-scoped. Use const by default, let only when you need to reassign.",
        "const only works for numbers, let works for all types",
        "let is the old way, const is the modern way — they work identically",
      ],
      correct: 1,
    },
    {
      question: "Why should you always use === instead of == in JavaScript?",
      options: [
        "=== is faster because it skips type conversion",
        "== performs type coercion before comparing, leading to bizarre results like 0 == false being true and '' == false being true. === checks both value AND type without conversion, giving predictable results.",
        "== only works with primitive types, === works with all types",
        "There is no practical difference — both give the same results",
      ],
      correct: 1,
    },
    {
      question:
        "What does typeof null return in JavaScript, and why is this surprising?",
      options: [
        "'null' — it correctly identifies the null type",
        "'object' — this is a famous JavaScript bug from 1995. null is not an object, but typeof null returns 'object' for historical reasons. Use === null to check for null instead.",
        "'undefined' — null and undefined are the same in JavaScript",
        "'boolean' — null is treated as false",
      ],
      correct: 1,
    },
    {
      question:
        "Which of these values is TRUTHY in JavaScript but FALSY in Python?",
      options: [
        "0",
        "null",
        "[] (empty array) — in Python [] is falsy, in JavaScript [] is truthy. This catches many Python developers off guard when learning JavaScript.",
        "undefined",
      ],
      correct: 2,
    },
    {
      question: "What is a template literal and when should you use it?",
      options: [
        "A template literal is a pre-defined string stored in memory for performance",
        "A template literal uses backticks (`) instead of quotes and allows embedding expressions with ${...} syntax — like Python's f-strings. Use them whenever you need to combine variables with strings: `Hello ${name}` instead of 'Hello ' + name.",
        "Template literals are only for multi-line strings, not variable interpolation",
        "Template literals require the string module to be imported first",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Quelle est la différence entre const et let en JavaScript ?",
      options: [
        "const est plus rapide que let à l'exécution",
        "const déclare une variable qui ne peut pas être réassignée après déclaration. let déclare une variable qui peut être réassignée. Les deux ont une portée de bloc. Utilisez const par défaut, let seulement quand vous devez réassigner.",
        "const ne fonctionne que pour les nombres, let pour tous les types",
        "let est l'ancienne façon, const est la façon moderne — ils fonctionnent de manière identique",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi devriez-vous toujours utiliser === au lieu de == en JavaScript ?",
      options: [
        "=== est plus rapide car il saute la conversion de type",
        "== effectue une coercition de type avant de comparer, menant à des résultats bizarres comme 0 == false étant true. === vérifie à la fois la valeur ET le type sans conversion, donnant des résultats prévisibles.",
        "== ne fonctionne qu'avec les types primitifs, === fonctionne avec tous les types",
        "Il n'y a pas de différence pratique — les deux donnent les mêmes résultats",
      ],
      correct: 1,
    },
    {
      question:
        "Que retourne typeof null en JavaScript, et pourquoi est-ce surprenant ?",
      options: [
        "'null' — il identifie correctement le type null",
        "'object' — c'est un célèbre bug JavaScript de 1995. null n'est pas un objet, mais typeof null retourne 'object' pour des raisons historiques. Utilisez === null pour vérifier null.",
        "'undefined' — null et undefined sont identiques en JavaScript",
        "'boolean' — null est traité comme false",
      ],
      correct: 1,
    },
    {
      question:
        "Laquelle de ces valeurs est TRUTHY en JavaScript mais FALSY en Python ?",
      options: [
        "0",
        "null",
        "[] (tableau vide) — en Python [] est falsy, en JavaScript [] est truthy. Cela surprend beaucoup de développeurs Python apprenant JavaScript.",
        "undefined",
      ],
      correct: 2,
    },
    {
      question: "Qu'est-ce qu'un littéral de gabarit et quand l'utiliser ?",
      options: [
        "Un littéral de gabarit est une chaîne prédéfinie stockée en mémoire pour les performances",
        "Un littéral de gabarit utilise des backticks (`) au lieu de guillemets et permet d'intégrer des expressions avec la syntaxe ${...} — comme les f-strings de Python. Utilisez-les quand vous combinez des variables avec des chaînes.",
        "Les littéraux de gabarit ne servent qu'aux chaînes multi-lignes",
        "Les littéraux de gabarit nécessitent l'importation du module string",
      ],
      correct: 1,
    },
  ],
};
