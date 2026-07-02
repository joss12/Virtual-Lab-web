export const id = "functions";
export const titleEn = "Functions";
export const titleFr = "Fonctions";

export const content = {
  en: `# Functions

## What Is a Function, Really?

A function is a **named, reusable block of code** that performs a specific task. But understanding functions deeply means understanding three things:

1. **Why** functions exist (the problem they solve)
2. **How** JavaScript functions are different from other languages
3. **When** to use each style

Let's start with the problem.

\`\`\`javascript
// Without functions — repetitive, fragile, unmaintainable
const price1 = 29.99 * 1.2;   // add 20% tax
const price2 = 49.99 * 1.2;
const price3 = 9.99  * 1.2;
// Change the tax rate? Update 3 lines. 300 products? Update 300 lines. Disaster.

// With a function — define once, use everywhere
function addTax(price) {
    return price * 1.2;
}

const price1 = addTax(29.99);  // 35.988
const price2 = addTax(49.99);  // 59.988
const price3 = addTax(9.99);   // 11.988
// Change tax rate? Update ONE line inside the function. Done.
\`\`\`

Functions also make code **testable** — you can verify a function works correctly in isolation before using it everywhere. And they make code **readable** — \`addTax(price)\` tells you exactly what happens, whereas \`price * 1.2\` requires mental decoding.

## The Four Ways to Define a Function

This is where JavaScript is unique. Python has one way to define a function (\`def\`). JavaScript has four — and they behave differently in important ways.

### Way 1: Function Declaration

\`\`\`javascript
// Function declaration — the classic way
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Alice"));   // Hello, Alice!
\`\`\`

**The special power of function declarations: HOISTING.**

Hoisting means JavaScript moves function declarations to the top of their scope before any code runs. This means you can call a function **before** it's defined in the file:

\`\`\`javascript
// This works — declaration is hoisted
console.log(greet("Bob"));   // Hello, Bob! ← works even though greet is defined below

function greet(name) {
    return \`Hello, \${name}!\`;
}

// Why? JavaScript engine pre-scans the file and registers all
// function declarations FIRST, then runs the code top to bottom.
// It's as if the function was written at the very top of the file.
\`\`\`

### Way 2: Function Expression

\`\`\`javascript
// Store a function in a variable
const greet = function(name) {
    return \`Hello, \${name}!\`;
};

console.log(greet("Alice"));   // Hello, Alice!
\`\`\`

Function expressions are **NOT hoisted**. The variable exists but has no value until that line executes:

\`\`\`javascript
// This CRASHES — greet is undefined at this point
console.log(greet("Bob"));   // TypeError: greet is not a function

const greet = function(name) {
    return \`Hello, \${name}!\`;
};
// The variable 'greet' is created when the file loads,
// but it holds 'undefined' until this line runs.
// Calling undefined() crashes.
\`\`\`

**When to use function expression:** when you want to prevent a function from being used before it's defined, or when you need to assign a function conditionally:

\`\`\`javascript
let calculate;

if (taxIncluded) {
    calculate = function(price) { return price * 1.2; };
} else {
    calculate = function(price) { return price; };
}

console.log(calculate(100));   // either 120 or 100
\`\`\`

### Way 3: Arrow Function

Arrow functions are the modern shorthand introduced in ES6 (2015). They're shorter to write and have a crucially different behavior for \`this\` (covered in the objects lesson).

\`\`\`javascript
// Arrow function — most concise form
const greet = (name) => {
    return \`Hello, \${name}!\`;
};

// If the function body is a SINGLE EXPRESSION, you can omit {} and return:
const greet2 = (name) => \`Hello, \${name}!\`;
// The expression is automatically returned — no return keyword needed

// If there's only ONE parameter, you can omit the parentheses:
const double = x => x * 2;
console.log(double(5));   // 10

// If there are ZERO parameters, you still need empty parentheses:
const sayHello = () => "Hello!";
console.log(sayHello());  // Hello!

// If there are TWO or more parameters, parentheses are required:
const add = (a, b) => a + b;
console.log(add(3, 4));   // 7

// Multi-line arrow functions still need {} and return:
const calculate = (price, taxRate) => {
    const tax    = price * taxRate;
    const total  = price + tax;
    return total;
};
\`\`\`

\`\`\`
Arrow function shorthand rules — when you can skip {} and return:

  const fn = (x) => expression     // single expression → auto-returned
  const fn = (x) => { ... }        // multiple statements → must use return

  When returning an OBJECT literal, wrap it in parentheses:
  const fn = (x) => ({ key: value })  // () prevents {} being read as block
  const fn = (x) => { key: value }    // WRONG — {} read as code block, not object
\`\`\`

### Way 4: Method (Function Inside an Object)

\`\`\`javascript
const calculator = {
    // Method shorthand (modern — preferred)
    add(a, b) {
        return a + b;
    },
    // Long form (older style — same result)
    subtract: function(a, b) {
        return a - b;
    },
    // Arrow function as method (careful with 'this'!)
    multiply: (a, b) => a * b,
};

console.log(calculator.add(3, 4));       // 7
console.log(calculator.subtract(10, 3)); // 7
console.log(calculator.multiply(3, 4));  // 12
\`\`\`

## Parameters, Arguments, and Defaults

A **parameter** is the variable in the function definition. An **argument** is the actual value passed when calling.

\`\`\`javascript
//         ↓ parameter
function greet(name) {
    return \`Hello, \${name}!\`;
}
//               ↓ argument
console.log(greet("Alice"));
\`\`\`

### Default Parameters

\`\`\`javascript
// Default value: used when argument is missing or undefined
function greet(name = "Anonymous", greeting = "Hello") {
    return \`\${greeting}, \${name}!\`;
}

console.log(greet("Alice", "Good morning"));  // Good morning, Alice!
console.log(greet("Bob"));                    // Hello, Bob!
console.log(greet());                         // Hello, Anonymous!
console.log(greet(undefined, "Hey"));         // Hey, Anonymous! (undefined triggers default)
console.log(greet(null, "Hey"));              // Hey, null! (null does NOT trigger default)
// Key: defaults only activate for undefined, not for null, 0, "", or false
\`\`\`

### Rest Parameters — Accept Any Number of Arguments

\`\`\`javascript
// ...nums collects all remaining arguments into an array
function sum(...nums) {
    return nums.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3));          // 6
console.log(sum(1, 2, 3, 4, 5));    // 15
console.log(sum(10));               // 10
console.log(sum());                 // 0 (empty array)

// Rest must be the LAST parameter
function log(level, ...messages) {
    console.log(\`[\${level}]\`, messages.join(" "));
}

log("INFO", "Server", "started");        // [INFO] Server started
log("ERROR", "Connection", "refused");   // [ERROR] Connection refused
\`\`\`

## Return Values

Every function returns something. If you don't write \`return\`, the function returns \`undefined\`.

\`\`\`javascript
// Explicit return
function double(x) {
    return x * 2;   // returns a value
}
console.log(double(5));   // 10

// No return → returns undefined
function logDouble(x) {
    console.log(x * 2);  // prints but doesn't return
}
const result = logDouble(5);  // prints 10
console.log(result);          // undefined ← nothing was returned

// return exits the function immediately
function findFirst(items, target) {
    for (const item of items) {
        if (item === target) {
            return item;   // exits immediately when found
        }
    }
    return null;   // only reached if target not found
}

// Returning multiple values: use an object or array
function minMax(numbers) {
    return {
        min: Math.min(...numbers),
        max: Math.max(...numbers),
    };
}

const { min, max } = minMax([3, 1, 4, 1, 5, 9, 2, 6]);
console.log(\`Min: \${min}, Max: \${max}\`);   // Min: 1, Max: 9
\`\`\`

## Scope — Where Variables Live

Scope determines which variables a function can access. Understanding scope prevents some of the most common JavaScript bugs.

\`\`\`javascript
const globalVar = "I'm global";  // accessible everywhere

function outer() {
    const outerVar = "I'm in outer";  // accessible in outer and inner

    function inner() {
        const innerVar = "I'm in inner";  // only accessible here
        console.log(globalVar);   // ✓ accessible (outer scope)
        console.log(outerVar);    // ✓ accessible (parent scope)
        console.log(innerVar);    // ✓ accessible (own scope)
    }

    inner();
    console.log(globalVar);  // ✓
    console.log(outerVar);   // ✓
    // console.log(innerVar);  // ✗ ReferenceError — innerVar only exists inside inner()
}

outer();
// console.log(outerVar);  // ✗ ReferenceError — not accessible here
\`\`\`

### Closure — The Most Powerful Concept in JavaScript

A **closure** is when a function "remembers" the variables from its outer scope even after that outer scope has finished executing. This sounds complicated — let's make it concrete.

\`\`\`javascript
// Problem: how do you make a counter that remembers its count?
// You need a variable that persists between calls but isn't global.

function makeCounter(start = 0) {
    let count = start;   // this variable lives in makeCounter's scope

    // This inner function "closes over" the 'count' variable
    // It remembers 'count' even after makeCounter() finishes
    return function() {
        count += 1;
        return count;
    };
}

const counter1 = makeCounter();
const counter2 = makeCounter(10);   // starts at 10

console.log(counter1());   // 1
console.log(counter1());   // 2
console.log(counter1());   // 3
console.log(counter2());   // 11   ← independent from counter1!
console.log(counter2());   // 12
console.log(counter1());   // 4    ← counter1 has its own 'count'

// What happened?
// makeCounter() ran and created 'count = 0'
// makeCounter() returned a function
// makeCounter() "finished" — but 'count' didn't disappear!
// The returned function holds a REFERENCE to that 'count'
// Each counter1 and counter2 has its own SEPARATE 'count' variable
\`\`\`

\`\`\`javascript
// Real-world closure: a function factory
function makeMultiplier(factor) {
    return (number) => number * factor;
    //                         ↑ 'factor' is closed over
}

const double   = makeMultiplier(2);
const triple   = makeMultiplier(3);
const tenTimes = makeMultiplier(10);

console.log(double(5));    // 10
console.log(triple(5));    // 15
console.log(tenTimes(5));  // 50

// Each function remembers its own 'factor':
// double remembers factor=2
// triple remembers factor=3
// tenTimes remembers factor=10
\`\`\`

## Higher-Order Functions — Functions That Work With Functions

A higher-order function either **takes a function as an argument** or **returns a function**. This is one of the most powerful patterns in JavaScript.

\`\`\`javascript
// Functions can be passed as arguments — just like strings or numbers
function applyTwice(fn, value) {
    return fn(fn(value));
}

const double = x => x * 2;
console.log(applyTwice(double, 3));   // 12  (3 → 6 → 12)

// The real power: built-in array methods take functions as arguments
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// map — transform every element
const doubled = numbers.map(n => n * 2);
console.log(doubled);   // [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

// filter — keep only elements where function returns true
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens);     // [2, 4, 6, 8, 10]

// reduce — collapse array to a single value
const total = numbers.reduce((sum, n) => sum + n, 0);
console.log(total);     // 55  (1+2+3+...+10)

// Chaining — these return new arrays so you can chain them
const result = numbers
    .filter(n => n % 2 === 0)    // [2, 4, 6, 8, 10]
    .map(n => n ** 2)             // [4, 16, 36, 64, 100]
    .reduce((sum, n) => sum + n, 0); // 220

console.log(result);    // 220
\`\`\`

## Pure Functions — The Gold Standard

A **pure function** always returns the same output for the same input and has no side effects. Pure functions are easier to test, debug, and reason about.

\`\`\`javascript
// PURE — same input always gives same output, no side effects
function add(a, b) {
    return a + b;
}
add(2, 3);   // always 5, no matter when or how many times called

// IMPURE — output depends on something external
let taxRate = 0.2;
function addTax(price) {
    return price * (1 + taxRate);  // depends on external taxRate!
}
// If taxRate changes, addTax(100) gives different results

// IMPURE — has a side effect (modifies something external)
let total = 0;
function addToTotal(amount) {
    total += amount;  // modifies external variable!
    return total;
}

// PURE version — takes all inputs as parameters, no side effects
function calculateTax(price, taxRate) {
    return price * (1 + taxRate);
}

// Strive for pure functions. Use impure when you must (I/O, state).
\`\`\`

## Immediately Invoked Function Expression (IIFE)

An IIFE is a function that runs **immediately** when it's defined. It's used to create a private scope — variables inside can't pollute the global scope.

\`\`\`javascript
// IIFE syntax: (function) followed by ()
(function() {
    const secret = "hidden";
    console.log("IIFE ran!");
    console.log(secret);   // works inside
})();

// console.log(secret);   // ReferenceError — 'secret' is gone

// Arrow function IIFE
(() => {
    const localVar = "only exists here";
    console.log(localVar);
})();

// IIFE with parameters
(function(name) {
    console.log(\`Hello, \${name}!\`);
})("Alice");   // Hello, Alice!

// Modern alternative: use a block with let/const
{
    const localVar = "only in this block";
    console.log(localVar);
}
// console.log(localVar);   // ReferenceError
\`\`\`

## Common Mistakes to Avoid

\`\`\`javascript
// Mistake 1: Forgetting to return a value
function double(x) {
    x * 2;   // ← no return! function returns undefined
}
console.log(double(5));   // undefined (not 10!)

// Fix:
function double(x) {
    return x * 2;   // ← must return
}

// Mistake 2: Calling before checking if it's a function
let greet;
// greet("Alice");   // TypeError: greet is not a function
if (typeof greet === "function") {
    greet("Alice");   // safe
}

// Mistake 3: Arrow function returning object literal
const makeUser = name => { name: name };  // WRONG — {} is a code block!
console.log(makeUser("Alice"));           // undefined

const makeUser2 = name => ({ name: name }); // CORRECT — () wraps the object
console.log(makeUser2("Alice"));            // { name: "Alice" }

// Mistake 4: Expecting return to work outside the function
function findPositive(numbers) {
    numbers.forEach(n => {
        if (n > 0) return n;  // ← returns from the ARROW function, not findPositive!
    });
    // findPositive actually returns undefined
}
// Fix: use a regular for loop or find()
function findPositive2(numbers) {
    for (const n of numbers) {
        if (n > 0) return n;  // ← returns from findPositive2 ✓
    }
}
// Or:
const findPositive3 = numbers => numbers.find(n => n > 0);
\`\`\`
`,

  fr: `# Fonctions

## Les quatre façons de définir une fonction

JavaScript est unique : il a quatre façons de définir une fonction, et elles se comportent différemment.

\`\`\`javascript
// 1. Déclaration de fonction — HOISTÉE (peut être appelée avant sa définition)
function saluer(nom) { return \`Bonjour, \${nom} !\`; }

// 2. Expression de fonction — NON hoistée
const saluer2 = function(nom) { return \`Bonjour, \${nom} !\`; };

// 3. Fonction fléchée — syntaxe moderne, 'this' différent
const saluer3 = (nom) => \`Bonjour, \${nom} !\`;
const doubler = x => x * 2;        // un paramètre → pas de parenthèses
const direBonjour = () => "Bonjour !"; // zéro paramètres → parenthèses vides

// 4. Méthode dans un objet
const calc = {
    additionner(a, b) { return a + b; },   // syntaxe courte (préférée)
};
\`\`\`

## Fermetures (Closures) — Le concept le plus puissant

Une **fermeture** se produit quand une fonction "se souvient" des variables de sa portée externe, même après que cette portée ait fini de s'exécuter.

\`\`\`javascript
function creerCompteur(depart = 0) {
    let compte = depart;   // cette variable vit dans creerCompteur

    return function() {
        compte += 1;
        return compte;
    };
    // La fonction retournée "ferme sur" la variable 'compte'
    // Elle s'en souvient même après la fin de creerCompteur()
}

const compteur1 = creerCompteur();
const compteur2 = creerCompteur(10);

console.log(compteur1());   // 1
console.log(compteur1());   // 2
console.log(compteur2());   // 11 ← indépendant de compteur1 !
console.log(compteur1());   // 3
\`\`\`

## Fonctions d'ordre supérieur

\`\`\`javascript
const nombres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// map — transformer chaque élément
const doubles = nombres.map(n => n * 2);

// filter — garder seulement si la fonction retourne true
const pairs = nombres.filter(n => n % 2 === 0);

// reduce — réduire à une seule valeur
const total = nombres.reduce((somme, n) => somme + n, 0);

// Chaînage
const resultat = nombres
    .filter(n => n % 2 === 0)   // [2, 4, 6, 8, 10]
    .map(n => n ** 2)            // [4, 16, 36, 64, 100]
    .reduce((s, n) => s + n, 0); // 220
\`\`\`

## Erreur courante : flèche retournant un objet

\`\`\`javascript
// FAUX — {} lu comme un bloc de code !
const creerUser = nom => { nom: nom };   // retourne undefined

// CORRECT — () entoure l'objet
const creerUser2 = nom => ({ nom: nom });  // retourne { nom: "Alice" }
\`\`\`
`,
};

export const starterCode = {
  default: `// Functions — Practice

// --- 1. The four styles (all equivalent) ---
function addDeclaration(a, b) { return a + b; }
const addExpression = function(a, b) { return a + b; };
const addArrow = (a, b) => a + b;
const addShort = (a, b) => a + b;

console.log("=== Four Styles ===");
[addDeclaration, addExpression, addArrow, addShort].forEach((fn, i) => {
    console.log(\`  Style \${i + 1}: \${fn(3, 4)}\`);
});

// --- 2. Default parameters ---
function createUser(name, role = "user", active = true) {
    return { name, role, active };
}

console.log("\\n=== Default Parameters ===");
console.log(createUser("Alice"));
console.log(createUser("Bob", "admin"));
console.log(createUser("Carol", "mod", false));

// --- 3. Rest parameters ---
function stats(...numbers) {
    if (numbers.length === 0) return null;
    return {
        count: numbers.length,
        sum:   numbers.reduce((s, n) => s + n, 0),
        min:   Math.min(...numbers),
        max:   Math.max(...numbers),
        avg:   numbers.reduce((s, n) => s + n, 0) / numbers.length,
    };
}

console.log("\\n=== Rest Parameters ===");
console.log(stats(3, 1, 4, 1, 5, 9, 2, 6));

// --- 4. Closure: counter factory ---
function makeCounter(start = 0, step = 1) {
    let count = start;
    return {
        next:  () => { count += step; return count; },
        reset: () => { count = start; },
        value: () => count,
    };
}

console.log("\\n=== Closure Counter ===");
const c = makeCounter(0, 2);
console.log(c.next());   // 2
console.log(c.next());   // 4
console.log(c.next());   // 6
c.reset();
console.log(c.value());  // 0

// --- 5. Higher-order functions ---
console.log("\\n=== Higher-Order Functions ===");
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = numbers
    .filter(n => n % 2 === 0)
    .map(n => n ** 2)
    .reduce((sum, n) => sum + n, 0);

console.log(\`Sum of squares of evens 1-10: \${result}\`);
`,
};

export const exerciseEn = `Deep practice with functions.

1. Write a function factory 'makeValidator(min, max)' that returns
   a function which checks if a number is in [min, max].
   const isValidAge   = makeValidator(0, 120);
   const isValidScore = makeValidator(0, 100);
   console.log(isValidAge(25));    // true
   console.log(isValidAge(200));   // false
   console.log(isValidScore(85));  // true

2. Write a PURE function 'processOrders(orders, discountRate)' that:
   - Takes an array of {name, price, qty} objects
   - Applies the discount to each item's price
   - Returns a new array with {name, original, discounted, total}
   - Does NOT modify the original array
   
3. Using only map, filter, reduce (no loops), compute:
   - The total revenue from orders where qty > 1
   - The most expensive item name
   Hint for most expensive: use reduce to track the max.`;

export const exerciseFr = `Pratique approfondie avec les fonctions.

1. Écrivez une fabrique 'creerValidateur(min, max)' qui retourne
   une fonction vérifiant si un nombre est dans [min, max].

2. Écrivez une fonction PURE 'traiterCommandes(commandes, remise)' qui :
   - Prend un tableau d'objets {nom, prix, qte}
   - Applique la remise à chaque prix
   - Retourne un nouveau tableau {nom, original, remisé, total}
   - Ne modifie PAS le tableau original

3. En utilisant seulement map, filter, reduce (pas de boucles) :
   - Le revenu total des commandes où qte > 1
   - Le nom de l'article le plus cher`;

export const solutionCode = {
  default: `// 1. Validator factory (closure)
function makeValidator(min, max) {
    return (value) => typeof value === "number" && value >= min && value <= max;
}

const isValidAge   = makeValidator(0, 120);
const isValidScore = makeValidator(0, 100);
const isValidTemp  = makeValidator(-273.15, 1e6);

console.log("=== Validators ===");
console.log(isValidAge(25));      // true
console.log(isValidAge(200));     // false
console.log(isValidScore(85));    // true
console.log(isValidScore(-5));    // false
console.log(isValidTemp(100));    // true

// 2. Pure order processor
function processOrders(orders, discountRate) {
    // Does NOT modify original — returns new array
    return orders.map(order => {
        const discounted = order.price * (1 - discountRate);
        return {
            name:       order.name,
            original:   order.price,
            discounted: Math.round(discounted * 100) / 100,
            total:      Math.round(discounted * order.qty * 100) / 100,
        };
    });
}

const orders = [
    { name: "Laptop",  price: 999.99, qty: 1 },
    { name: "Mouse",   price:  29.99, qty: 3 },
    { name: "Monitor", price: 349.99, qty: 2 },
];

console.log("\\n=== Processed Orders (20% discount) ===");
const processed = processOrders(orders, 0.20);
processed.forEach(o => {
    console.log(\`  \${o.name}: $\${o.original} → $\${o.discounted} × \${orders.find(x=>x.name===o.name).qty} = $\${o.total}\`);
});
console.log("Original unchanged:", orders[0].price); // 999.99

// 3. Map/filter/reduce only
const totalRevMultiQty = orders
    .filter(o => o.qty > 1)
    .map(o => o.price * o.qty)
    .reduce((sum, v) => sum + v, 0);

const mostExpensive = orders
    .reduce((max, o) => o.price > max.price ? o : max)
    .name;

console.log("\\n=== Analytics ===");
console.log(\`Revenue from qty>1 orders: $\${totalRevMultiQty.toFixed(2)}\`);
console.log(\`Most expensive item: \${mostExpensive}\`);
`,
};

export const quiz = {
  en: [
    {
      question: "What is hoisting and which function style benefits from it?",
      options: [
        "Hoisting is a performance optimization that pre-compiles frequently called functions",
        "Hoisting means JavaScript's engine scans the file before running it and registers all function DECLARATIONS at the top of their scope. This means you can call a declared function before the line where it's written. Function expressions and arrow functions stored in variables are NOT hoisted — they throw TypeError if called before their line.",
        "Hoisting moves all variables to the top of the file automatically",
        "Hoisting only applies to async functions and promises",
      ],
      correct: 1,
    },
    {
      question: "What is a closure and why is it useful?",
      options: [
        "A closure is a function that cannot access any variables outside its own scope",
        "A closure is when an inner function remembers and can access variables from its outer function's scope, even after the outer function has finished executing. This allows creating private state (like a counter that persists between calls) and function factories (like makeValidator) without using global variables.",
        "A closure is a way to close or terminate a function early",
        "A closure is a special type of function that runs only once",
      ],
      correct: 1,
    },
    {
      question:
        "Why does const makeUser = name => { name: name } return undefined?",
      options: [
        "Arrow functions cannot return objects",
        "The curly braces {} are interpreted as a code block, not an object literal. Inside the 'block', 'name: name' is a labeled statement (not an object). The function has no return statement so it returns undefined. Fix: wrap the object in parentheses: name => ({ name: name }).",
        "The function is missing the return keyword before the object",
        "Arrow functions require explicit type annotations for objects",
      ],
      correct: 1,
    },
    {
      question: "What is a pure function and why should you prefer them?",
      options: [
        "A pure function uses only primitive types and no objects",
        "A pure function always returns the same output for the same inputs (no dependency on external state) and has no side effects (doesn't modify anything outside itself). Pure functions are easier to test (no setup needed), debug (the output only depends on inputs), and reason about (behavior is predictable and self-contained).",
        "A pure function contains no loops or conditional statements",
        "A pure function is one that runs synchronously with no async operations",
      ],
      correct: 1,
    },
    {
      question:
        "When you do return inside a forEach callback, what does it actually return from?",
      options: [
        "It returns from the outer function that contains the forEach",
        "It returns from the CALLBACK function passed to forEach — not from the outer function. forEach ignores return values from callbacks. If you need to exit an outer function from inside a loop, use a regular for...of loop where return exits the outer function correctly.",
        "It stops the forEach loop and returns to the caller",
        "It has no effect — return is ignored inside forEach",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Qu'est-ce que le hoisting et quel style de fonction en bénéficie ?",
      options: [
        "Le hoisting est une optimisation de performance qui précompile les fonctions fréquemment appelées",
        "Le hoisting signifie que le moteur JavaScript analyse le fichier avant de l'exécuter et enregistre toutes les DÉCLARATIONS de fonctions en haut de leur portée. Cela permet d'appeler une fonction déclarée avant la ligne où elle est écrite. Les expressions de fonctions et fonctions fléchées stockées dans des variables ne sont PAS hoistées.",
        "Le hoisting déplace automatiquement toutes les variables en haut du fichier",
        "Le hoisting ne s'applique qu'aux fonctions async et aux promesses",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce qu'une fermeture (closure) et pourquoi est-elle utile ?",
      options: [
        "Une fermeture est une fonction qui ne peut accéder à aucune variable en dehors de sa propre portée",
        "Une fermeture se produit quand une fonction interne se souvient et peut accéder aux variables de la portée de sa fonction externe, même après que cette fonction externe ait fini de s'exécuter. Cela permet de créer un état privé et des fabriques de fonctions sans utiliser de variables globales.",
        "Une fermeture est une façon de terminer prématurément une fonction",
        "Une fermeture est un type spécial de fonction qui ne s'exécute qu'une seule fois",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi const creerUser = nom => { nom: nom } retourne-t-il undefined ?",
      options: [
        "Les fonctions fléchées ne peuvent pas retourner des objets",
        "Les accolades {} sont interprétées comme un bloc de code, pas comme un objet littéral. À l'intérieur du 'bloc', 'nom: nom' est une instruction étiquetée. La fonction n'a pas d'instruction return donc retourne undefined. Correction : entourer l'objet de parenthèses : nom => ({ nom: nom }).",
        "La fonction manque le mot-clé return avant l'objet",
        "Les fonctions fléchées nécessitent des annotations de type explicites pour les objets",
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce qu'une fonction pure et pourquoi les préférer ?",
      options: [
        "Une fonction pure n'utilise que des types primitifs et pas d'objets",
        "Une fonction pure retourne toujours la même sortie pour les mêmes entrées et n'a pas d'effets secondaires. Les fonctions pures sont plus faciles à tester, déboguer et comprendre car leur comportement est prévisible et auto-contenu.",
        "Une fonction pure ne contient pas de boucles ni de conditions",
        "Une fonction pure s'exécute synchroniquement sans opérations async",
      ],
      correct: 1,
    },
    {
      question:
        "Quand vous utilisez return dans un callback forEach, de quoi retourne-t-il réellement ?",
      options: [
        "Il retourne de la fonction externe qui contient le forEach",
        "Il retourne de la fonction CALLBACK passée à forEach — pas de la fonction externe. forEach ignore les valeurs de retour des callbacks. Pour sortir d'une fonction externe depuis une boucle, utilisez une boucle for...of ordinaire où return sort correctement de la fonction externe.",
        "Il arrête la boucle forEach et retourne à l'appelant",
        "Il n'a aucun effet — return est ignoré dans forEach",
      ],
      correct: 1,
    },
  ],
};
