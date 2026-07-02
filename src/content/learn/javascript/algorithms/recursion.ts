export const id = "recursion";
export const titleEn = "Recursion";
export const titleFr = "Récursion";

export const content = {
  en: `# Recursion

## The Mental Model: A Function That Calls Itself

Recursion is a function solving a problem by solving a **smaller version of the same problem**, until the problem becomes so small it can be solved directly.

\`\`\`
Russian nesting dolls (Matryoshka):
  Open a doll → find another doll inside
  Open that doll → find another doll inside
  ...keep opening...
  Until you find the smallest doll that doesn't open ← BASE CASE

Recursion works identically:
  Call function → it calls itself with smaller input
  That call     → calls itself with even smaller input
  ...keep going...
  Until input is so small the answer is obvious ← BASE CASE
  Then each call returns its answer up the chain
\`\`\`

## JavaScript's Call Stack

Before writing recursive code, you must understand the **call stack** — the mechanism that makes recursion possible (and also causes its main failure mode).

\`\`\`javascript
// Every function call adds a FRAME to the call stack
// Every return removes a frame
// The stack has a limited size — exceed it: "Maximum call stack size exceeded"

function countdown(n) {
    // BASE CASE: stop at 0
    if (n <= 0) {
        console.log("Go!");
        return;
    }
    // RECURSIVE CASE: print n, then count down from n-1
    console.log(n);
    countdown(n - 1);
}

countdown(5);
// Call stack grows:
// countdown(5) → countdown(4) → countdown(3) → countdown(2) → countdown(1) → countdown(0)
// Then unwinds:
// countdown(0) returns → countdown(1) returns → ... → countdown(5) returns

// Output:
// 5, 4, 3, 2, 1, Go!

// JavaScript's default stack limit: ~10,000-15,000 frames (varies by engine)
// countdown(20000) → "Maximum call stack size exceeded" — STACK OVERFLOW
\`\`\`

## The Two Essential Parts

Every correct recursive function has exactly two parts. Missing either causes an infinite loop and a stack overflow.

\`\`\`javascript
function recursiveFunction(input) {
    // PART 1: Base case — when to STOP recursing
    // The simplest possible input, solved directly without recursion
    if (/* input is simple enough */) {
        return /* direct answer */;
    }

    // PART 2: Recursive case — make the problem SMALLER
    // Call yourself with input that is closer to the base case
    return recursiveFunction(/* smaller input */);
}
\`\`\`

\`\`\`javascript
// Missing base case → infinite recursion → stack overflow
function broken(n) {
    console.log(n);
    broken(n - 1);   // ← no base case! Never stops.
}
// broken(5) → RangeError: Maximum call stack size exceeded

// Recursive case doesn't shrink the problem → infinite recursion
function alsobroken(n) {
    if (n === 0) return 0;
    return alsobroken(n + 1);   // ← n grows! Never reaches 0.
}
\`\`\`

## Factorial — The Classic First Example

\`\`\`javascript
// n! = n × (n-1) × (n-2) × ... × 2 × 1
// 5! = 5 × 4! = 5 × 4 × 3! = 5 × 4 × 3 × 2 × 1 = 120

// The recursive definition writes the code for us:
// factorial(n) = n × factorial(n-1)
// factorial(0) = 1  ← base case (defined by convention)

function factorial(n) {
    if (n <= 1) return 1;              // base case
    return n * factorial(n - 1);       // recursive case
}

console.log(factorial(0));   // 1
console.log(factorial(5));   // 120
console.log(factorial(10));  // 3628800

// What happens in memory for factorial(4):
// factorial(4)
//   = 4 * factorial(3)
//   = 4 * (3 * factorial(2))
//   = 4 * (3 * (2 * factorial(1)))
//   = 4 * (3 * (2 * 1))        ← base case reached
//   = 4 * (3 * 2)              ← unwinding
//   = 4 * 6
//   = 24
\`\`\`

## Fibonacci — Two Recursive Calls and the Memoization Fix

\`\`\`javascript
// Fibonacci: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...
// fib(n) = fib(n-1) + fib(n-2)
// fib(0) = 0, fib(1) = 1  ← two base cases

// NAIVE version — O(2ᴺ) — recomputes the same values millions of times
function fib(n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

// fib(5) call tree:
//              fib(5)
//            /        \\
//         fib(4)      fib(3)
//        /    \\      /    \\
//     fib(3) fib(2) fib(2) fib(1)
//     ...
// fib(3) computed TWICE, fib(2) THREE TIMES — exponential blowup!

// FIX 1: Memoization with a Map — O(N) time, O(N) space
function fibMemo(n, memo = new Map()) {
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n);    // already computed — return instantly

    const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    memo.set(n, result);                    // store before returning
    return result;
}

console.log(fibMemo(10));    // 55
console.log(fibMemo(50));    // 12586269025 — instant (naive would take minutes)
console.log(fibMemo(100));   // 354224848179261915075

// FIX 2: Iterative — O(N) time, O(1) space (best for Fibonacci)
function fibIterative(n) {
    if (n <= 1) return n;
    let [a, b] = [0, 1];
    for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
    return b;
}

console.log(fibIterative(100));   // same answer, no stack usage
\`\`\`

## Recursion on Arrays — The Natural Fit

\`\`\`javascript
// Recursive sum — think: sum([1,2,3,4]) = 1 + sum([2,3,4])
function sum(arr) {
    if (arr.length === 0) return 0;                    // base case: empty array
    return arr[0] + sum(arr.slice(1));                 // first + sum of rest
}
console.log(sum([1, 2, 3, 4, 5]));   // 15

// More memory-efficient: use index instead of slicing
function sumWithIndex(arr, i = 0) {
    if (i >= arr.length) return 0;                     // base case
    return arr[i] + sumWithIndex(arr, i + 1);          // arr[i] + rest
}
// arr.slice() creates a new array each call — O(N) space per call!
// Using an index avoids this — same logic, much less memory

// Recursive reverse
function reverse(arr) {
    if (arr.length <= 1) return arr;
    return [...reverse(arr.slice(1)), arr[0]];   // reverse rest, then put first at end
}
console.log(reverse([1, 2, 3, 4, 5]));   // [5, 4, 3, 2, 1]

// Recursive flatten — handles any depth
function flatten(arr) {
    return arr.reduce((flat, item) => {
        if (Array.isArray(item)) {
            return [...flat, ...flatten(item)];    // recurse into nested arrays
        }
        return [...flat, item];
    }, []);
}
console.log(flatten([1, [2, 3], [4, [5, [6]]]]));   // [1, 2, 3, 4, 5, 6]
\`\`\`

## Recursion on Trees — Where Recursion Truly Shines

Trees are the natural home of recursion because **a tree is defined recursively** — a tree is a node with children, each of which is also a tree.

\`\`\`javascript
// A simple tree node
const makeNode = (value, ...children) => ({ value, children });

//         1
//       / | \\
//      2  3  4
//     / \\    \\
//    5   6    7

const tree = makeNode(1,
    makeNode(2, makeNode(5), makeNode(6)),
    makeNode(3),
    makeNode(4, makeNode(7))
);

// Sum all values in the tree
function treeSum(node) {
    // Base case: no children — just return value
    // Recursive case: value + sum of all children's subtrees
    return node.value + node.children.reduce((sum, child) => sum + treeSum(child), 0);
}
console.log(treeSum(tree));   // 1+2+3+4+5+6+7 = 28

// Count all nodes
function countNodes(node) {
    return 1 + node.children.reduce((count, child) => count + countNodes(child), 0);
}
console.log(countNodes(tree));   // 7

// Find maximum depth (longest path from root to leaf)
function maxDepth(node) {
    if (node.children.length === 0) return 0;   // leaf node
    return 1 + Math.max(...node.children.map(maxDepth));
}
console.log(maxDepth(tree));   // 2 (root → 2 → 5 is 2 levels)

// Collect all values (pre-order: root first, then children left-to-right)
function preOrder(node) {
    return [node.value, ...node.children.flatMap(preOrder)];
}
console.log(preOrder(tree));   // [1, 2, 5, 6, 3, 4, 7]

// Find a node by value
function findNode(node, target) {
    if (node.value === target) return node;              // found!
    for (const child of node.children) {
        const found = findNode(child, target);
        if (found) return found;                          // found in subtree
    }
    return null;                                          // not in this subtree
}
console.log(findNode(tree, 6));   // { value: 6, children: [] }
console.log(findNode(tree, 9));   // null
\`\`\`

## Working with Nested Objects — Real-World Recursion

JavaScript applications constantly work with deeply nested data — JSON responses, file systems, component trees. Recursion handles this elegantly.

\`\`\`javascript
// Deep clone an object (handles any nesting depth)
function deepClone(value) {
    if (value === null || typeof value !== "object") {
        return value;                                    // primitives: return directly
    }
    if (Array.isArray(value)) {
        return value.map(deepClone);                     // array: clone each element
    }
    // object: clone each property
    return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, deepClone(v)])
    );
}

const original = { a: 1, b: { c: 2, d: [3, { e: 4 }] } };
const cloned   = deepClone(original);
cloned.b.c = 99;   // modify clone
console.log(original.b.c);   // 2 — original unchanged ✓

// Deep search: find all values in a nested object matching a predicate
function deepFind(obj, predicate, path = "") {
    const results = [];

    if (predicate(obj)) {
        results.push({ path, value: obj });
    }

    if (obj !== null && typeof obj === "object") {
        const entries = Array.isArray(obj)
            ? obj.map((v, i) => [i, v])
            : Object.entries(obj);

        for (const [key, val] of entries) {
            const childPath = path ? \`\${path}.\${key}\` : String(key);
            results.push(...deepFind(val, predicate, childPath));
        }
    }

    return results;
}

const data = {
    user: { name: "Alice", score: 95 },
    team: [{ name: "Bob", score: 78 }, { name: "Carol", score: 92 }],
    meta: { count: 3, passing: true },
};

const numbers = deepFind(data, v => typeof v === "number");
console.log(numbers);
// [{ path: "user.score", value: 95 },
//  { path: "team.0.score", value: 78 },
//  { path: "team.1.score", value: 92 },
//  { path: "meta.count", value: 3 }]

// Transform all string values in a nested object (deep map)
function deepMapStrings(obj, transform) {
    if (typeof obj === "string") return transform(obj);
    if (Array.isArray(obj)) return obj.map(v => deepMapStrings(v, transform));
    if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, deepMapStrings(v, transform)])
        );
    }
    return obj;
}

const config = {
    title: "  Hello World  ",
    items: ["  apple  ", "  banana  "],
    meta:  { author: "  Alice Smith  " },
};

const trimmed = deepMapStrings(config, s => s.trim());
console.log(trimmed);
// { title: "Hello World", items: ["apple", "banana"], meta: { author: "Alice Smith" } }
\`\`\`

## Tail Call Optimization — JavaScript's Missed Opportunity

A **tail call** is when a function's last action is to call itself — and it returns the result of that call directly (no work after the call returns).

\`\`\`javascript
// NOT tail-recursive — must wait for recursive result to multiply
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);   // ← has to multiply AFTER the call returns
    // Stack frame must stay alive to hold 'n'
}

// TAIL-RECURSIVE — accumulator pattern, no work after the call
function factorialTail(n, acc = 1) {
    if (n <= 1) return acc;
    return factorialTail(n - 1, n * acc);   // ← last action is the call
    // Theoretically: engine can reuse the same stack frame
}

// JavaScript technically supports TCO (ES2015 spec) but:
// V8 (Chrome/Node): TCO is NOT implemented
// Safari JavaScriptCore: TCO IS implemented
// Firefox SpiderMonkey: TCO is NOT implemented

// In practice: treat JavaScript recursion as limited to ~10,000 calls
// Use iteration for deep recursion instead
\`\`\`

## Trampolining — Unlimited Recursion in JavaScript

Trampolining converts recursive calls into a loop — achieving unlimited depth without stack overflow.

\`\`\`javascript
// Step 1: Convert to return a FUNCTION instead of calling directly
function factorialTrampoline(n, acc = 1) {
    if (n <= 1) return acc;                                  // done — return value
    return () => factorialTrampoline(n - 1, n * acc);        // not done — return thunk
}

// Step 2: Trampoline runner — keeps calling returned functions
function trampoline(fn) {
    return function(...args) {
        let result = fn(...args);
        while (typeof result === "function") {
            result = result();   // call the returned function (no stack growth!)
        }
        return result;
    };
}

const factSafe = trampoline(factorialTrampoline);

console.log(factSafe(10));    // 3628800
console.log(factSafe(100));   // very large number — no stack overflow!
// Can handle millions of iterations — bounded by time, not stack

// Trampoline for deeply nested tree traversal
function walkTree(node, acc = []) {
    acc.push(node.value);
    if (node.children.length === 0) return acc;
    return () => {
        for (const child of node.children) walkTree(child, acc);
        return acc;
    };
}
\`\`\`

## The Three-Question Method for Designing Recursive Solutions

When you face a problem and want to solve it recursively, ask these in order:

\`\`\`javascript
// Q1: "What is the SIMPLEST possible input?"
//     → That's your base case. Solve it directly.

// Q2: "If I had the answer for a SLIGHTLY SMALLER input,
//     how would I use it to solve the current input?"
//     → That's your recursive case.

// Q3: "Is my recursive call definitely getting CLOSER to the base case?"
//     → If yes: it terminates. If no: infinite loop.

// APPLYING THE METHOD: Power function
// Q1: Simplest? n=0 → base^0 = 1
// Q2: If I know base^(n-1), how do I get base^n?
//     base^n = base × base^(n-1)
// Q3: n decreases by 1 each call → reaches 0 → ✓

function power(base, exp) {
    if (exp === 0) return 1;              // base case
    return base * power(base, exp - 1);  // recursive case
}
console.log(power(2, 10));   // 1024

// Optimized: fast exponentiation O(log N) instead of O(N)
function fastPower(base, exp) {
    if (exp === 0) return 1;
    if (exp % 2 === 0) {
        const half = fastPower(base, exp / 2);
        return half * half;              // even: base^exp = (base^(exp/2))²
    }
    return base * fastPower(base, exp - 1);  // odd: reduce by 1
}
console.log(fastPower(2, 10));   // 1024 (only 4 calls instead of 10)
\`\`\`

## Common Patterns — The Building Blocks

\`\`\`javascript
// PATTERN 1: Decrease and conquer
// Solve for n-1, use that to solve for n
function rangeSum(n) {
    if (n <= 0) return 0;
    return n + rangeSum(n - 1);
}

// PATTERN 2: Divide and conquer
// Split into independent halves, solve each, combine
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid   = Math.floor(arr.length / 2);
    const left  = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    // merge left and right...
    return merge(left, right);
}

// PATTERN 3: Accumulator (tail-recursive style)
// Carry the result forward instead of building it on return
function reverseAcc(arr, acc = []) {
    if (arr.length === 0) return acc;
    return reverseAcc(arr.slice(1), [arr[0], ...acc]);
}

// PATTERN 4: Tree traversal
// Handle current node, recurse into each child
function transform(node, fn) {
    return {
        value:    fn(node.value),
        children: node.children.map(child => transform(child, fn)),
    };
}

// PATTERN 5: Generate all combinations (backtracking)
function combinations(items, size) {
    if (size === 0) return [[]];
    if (items.length < size) return [];
    const [first, ...rest] = items;
    // Either include first or don't
    const withFirst    = combinations(rest, size - 1).map(c => [first, ...c]);
    const withoutFirst = combinations(rest, size);
    return [...withFirst, ...withoutFirst];
}

console.log(combinations([1, 2, 3, 4], 2));
// [[1,2], [1,3], [1,4], [2,3], [2,4], [3,4]]
\`\`\`

## Common Mistakes to Avoid

\`\`\`javascript
// Mistake 1: Forgetting the base case → stack overflow
function sumTo(n) {
    return n + sumTo(n - 1);   // ← no base case!
}

// Mistake 2: Base case never reached
function broken2(n) {
    if (n === 0) return 0;
    return broken2(n + 1);    // n grows → never reaches 0
}

// Mistake 3: Forgetting to RETURN the recursive call
function factorial_wrong(n) {
    if (n <= 1) return 1;
    n * factorial_wrong(n - 1);   // ← no return! returns undefined
}

// Mistake 4: Mutating shared state in recursion
function badFlatten(arr, result = []) {
    for (const item of arr) {
        if (Array.isArray(item)) badFlatten(item, result);
        else result.push(item);
    }
    return result;
}
// Works accidentally BUT: default parameter [] is shared across calls!
// Second call reuses the same array from the first call
// Fix: don't use mutable default arguments OR create fresh inside:
function goodFlatten(arr) {
    const result = [];
    for (const item of arr) {
        if (Array.isArray(item)) result.push(...goodFlatten(item));
        else result.push(item);
    }
    return result;
}

// Mistake 5: Using recursion where iteration is clearer
// Fibonacci, factorial, array sums — all cleaner as loops in practice
// Use recursion when structure IS naturally recursive (trees, nested objects, divide-and-conquer)
\`\`\`
`,

  fr: `# Récursion

## Le modèle mental

Une fonction récursive résout un problème en résolvant une **version plus petite du même problème**, jusqu'à ce que le problème soit si petit qu'il peut être résolu directement.

## Les deux parties essentielles

\`\`\`javascript
function factorielle(n) {
    // CAS DE BASE : s'arrêter ici
    if (n <= 1) return 1;
    // CAS RÉCURSIF : se rapprocher du cas de base
    return n * factorielle(n - 1);
}

// factorielle(4) = 4 × factorielle(3)
//                = 4 × (3 × factorielle(2))
//                = 4 × (3 × (2 × factorielle(1)))
//                = 4 × (3 × (2 × 1))  ← cas de base
//                = 24
\`\`\`

## Fibonacci avec mémoïsation

\`\`\`javascript
// Naïf — O(2ᴺ) — recompute les mêmes valeurs des millions de fois
function fib(n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);   // exponentiel !
}

// Mémoïsé — O(N) — stocke les résultats dans une Map
function fibMemo(n, memo = new Map()) {
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n);
    const resultat = fibMemo(n-1, memo) + fibMemo(n-2, memo);
    memo.set(n, resultat);
    return resultat;
}

console.log(fibMemo(100));   // instantané !
\`\`\`

## Récursion sur les arbres

\`\`\`javascript
// Un arbre est défini récursivement — récursion naturelle
function sommeArbre(noeud) {
    return noeud.valeur +
        noeud.enfants.reduce((s, enfant) => s + sommeArbre(enfant), 0);
}

// Clonage profond d'objets imbriqués
function clonagesProfond(valeur) {
    if (valeur === null || typeof valeur !== "object") return valeur;
    if (Array.isArray(valeur)) return valeur.map(clonagesProfond);
    return Object.fromEntries(
        Object.entries(valeur).map(([k, v]) => [k, clonagesProfond(v)])
    );
}
\`\`\`

## La méthode des trois questions

\`\`\`javascript
// Q1 : Quelle est l'entrée la PLUS SIMPLE ? → Cas de base
// Q2 : Si j'avais la réponse pour une entrée légèrement plus petite,
//      comment l'utiliserais-je ? → Cas récursif
// Q3 : L'appel récursif se rapproche-t-il du cas de base ? → Garantit la terminaison
\`\`\`
`,
};

export const starterCode = {
  default: `// Recursion — JavaScript Practice

// ─── 1. Classic recursion ─────────────────────────────────
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log("=== Factorial ===");
for (let i = 0; i <= 8; i++) {
    console.log(\`  \${i}! = \${factorial(i)}\`);
}

// ─── 2. Memoized Fibonacci ────────────────────────────────
function fib(n, memo = new Map()) {
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n);
    const result = fib(n - 1, memo) + fib(n - 2, memo);
    memo.set(n, result);
    return result;
}

console.log("\\n=== Fibonacci (memoized) ===");
console.log("First 10:", Array.from({ length: 10 }, (_, i) => fib(i)));
console.log("fib(50):", fib(50));

// ─── 3. Tree operations ───────────────────────────────────
const node = (value, ...children) => ({ value, children });

const tree = node(1,
    node(2, node(5), node(6)),
    node(3),
    node(4, node(7))
);

const treeSum   = n => n.value + n.children.reduce((s, c) => s + treeSum(c), 0);
const treeDepth = n => n.children.length === 0 ? 0 : 1 + Math.max(...n.children.map(treeDepth));
const preOrder  = n => [n.value, ...n.children.flatMap(preOrder)];

console.log("\\n=== Tree ===");
console.log("Sum:      ", treeSum(tree));      // 28
console.log("Max depth:", treeDepth(tree));    // 2
console.log("Pre-order:", preOrder(tree));     // [1,2,5,6,3,4,7]

// ─── 4. Deep object operations ────────────────────────────
function deepClone(val) {
    if (val === null || typeof val !== "object") return val;
    if (Array.isArray(val)) return val.map(deepClone);
    return Object.fromEntries(Object.entries(val).map(([k,v]) => [k, deepClone(v)]));
}

const original = { a: 1, b: { c: [2, 3], d: { e: 4 } } };
const clone    = deepClone(original);
clone.b.c.push(99);
clone.b.d.e = 100;

console.log("\\n=== Deep Clone ===");
console.log("Original b.c:", original.b.c);    // [2, 3]   — unchanged
console.log("Clone    b.c:", clone.b.c);        // [2, 3, 99]
console.log("Original b.d.e:", original.b.d.e); // 4        — unchanged
console.log("Clone    b.d.e:", clone.b.d.e);    // 100

// ─── 5. Combinations ──────────────────────────────────────
function combinations(items, size) {
    if (size === 0) return [[]];
    if (items.length < size) return [];
    const [first, ...rest] = items;
    const with_    = combinations(rest, size - 1).map(c => [first, ...c]);
    const without  = combinations(rest, size);
    return [...with_, ...without];
}

console.log("\\n=== Combinations ===");
const combos = combinations([1, 2, 3, 4], 2);
console.log("C(4,2):", combos.length, "combos:", JSON.stringify(combos));

const letterCombos = combinations(["a","b","c","d"], 3);
console.log("C(4,3):", letterCombos.length, "combos:", JSON.stringify(letterCombos));
`,
};

export const exerciseEn = `Recursion challenges — apply the three-question method before coding each one.

1. Write recursive 'flatten(arr)' that flattens an array to any depth.
   flatten([1,[2,[3,[4,[5]]]]]) → [1,2,3,4,5]
   Must handle: numbers, strings, null, nested arrays — any mix.

2. Write recursive 'deepEqual(a, b)' that compares two values deeply.
   deepEqual({a:1,b:[2,3]}, {a:1,b:[2,3]}) → true
   deepEqual({a:1,b:[2,4]}, {a:1,b:[2,3]}) → false
   Must handle: primitives, arrays, objects, null — any nesting.

3. Write recursive 'pathsToLeaves(tree)' that returns all root-to-leaf
   paths in a tree (using the node structure from the lesson).
   For the tree in the lesson:
   → [[1,2,5],[1,2,6],[1,3],[1,4,7]]

4. Write 'permutations(arr)' that returns all permutations of an array.
   permutations([1,2,3]) →
   [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
   Hint: for each element, put it first, then permute the rest.`;

export const exerciseFr = `Défis de récursion — appliquez la méthode des trois questions avant de coder.

1. Écrivez 'aplatir(arr)' récursif qui aplatit un tableau à n'importe quelle profondeur.

2. Écrivez 'egaliteProfonde(a, b)' récursif qui compare deux valeurs en profondeur.

3. Écrivez 'cheminsVerssFeuilles(arbre)' qui retourne tous les chemins racine-feuille.

4. Écrivez 'permutations(arr)' qui retourne toutes les permutations d'un tableau.`;

export const solutionCode = {
  default: `// 1. Recursive flatten (any depth)
function flatten(arr) {
    return arr.reduce((flat, item) => {
        if (Array.isArray(item)) return [...flat, ...flatten(item)];
        return [...flat, item];
    }, []);
}

console.log("=== flatten ===");
console.log(flatten([1,[2,[3,[4,[5]]]]]));            // [1,2,3,4,5]
console.log(flatten([[1,2],[3,[4,5]],[6]]));           // [1,2,3,4,5,6]
console.log(flatten([null,"a",[true,[1,2]]]));         // [null,"a",true,1,2]

// 2. Deep equality
function deepEqual(a, b) {
    // Same reference or same primitive value
    if (a === b) return true;

    // Null check (typeof null === "object" — the famous JS bug)
    if (a === null || b === null) return false;

    // Must be same type
    if (typeof a !== typeof b) return false;

    // Both arrays
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((item, i) => deepEqual(item, b[i]));
    }
    if (Array.isArray(a) || Array.isArray(b)) return false;

    // Both objects
    if (typeof a === "object") {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every(key => key in b && deepEqual(a[key], b[key]));
    }

    return false;
}

console.log("\\n=== deepEqual ===");
console.log(deepEqual({a:1,b:[2,3]}, {a:1,b:[2,3]}));   // true
console.log(deepEqual({a:1,b:[2,4]}, {a:1,b:[2,3]}));   // false
console.log(deepEqual([1,[2,3]], [1,[2,3]]));             // true
console.log(deepEqual(null, null));                        // true
console.log(deepEqual(null, {}));                          // false
console.log(deepEqual({a:1}, {a:1,b:2}));                // false

// 3. Paths to leaves
const node = (value, ...children) => ({ value, children });

const tree = node(1,
    node(2, node(5), node(6)),
    node(3),
    node(4, node(7))
);

function pathsToLeaves(n, currentPath = []) {
    const path = [...currentPath, n.value];
    if (n.children.length === 0) return [path];   // leaf → return path
    return n.children.flatMap(child => pathsToLeaves(child, path));
}

console.log("\\n=== pathsToLeaves ===");
const paths = pathsToLeaves(tree);
paths.forEach(p => console.log(" ", p.join(" → ")));
// 1 → 2 → 5
// 1 → 2 → 6
// 1 → 3
// 1 → 4 → 7

// 4. Permutations
function permutations(arr) {
    if (arr.length <= 1) return [arr];   // base case: one element = one permutation

    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const current = arr[i];
        const rest    = [...arr.slice(0, i), ...arr.slice(i + 1)];
        // Put current first, then all permutations of the rest
        for (const perm of permutations(rest)) {
            result.push([current, ...perm]);
        }
    }
    return result;
}

console.log("\\n=== permutations ===");
const perms3 = permutations([1, 2, 3]);
console.log(\`permutations([1,2,3]): \${perms3.length} results\`);
perms3.forEach(p => console.log(" ", p));

const perms4 = permutations([1,2,3,4]);
console.log(\`\\npermutations([1,2,3,4]): \${perms4.length} results (4! = 24)\`);
`,
};

export const quiz = {
  en: [
    {
      question: "What happens if a recursive function has no base case?",
      options: [
        "JavaScript automatically detects the infinite loop and returns undefined",
        "The function calls itself indefinitely, adding a new frame to the call stack each time. The call stack has a finite size (~10,000-15,000 frames in V8). When it fills up, JavaScript throws 'RangeError: Maximum call stack size exceeded' — commonly called a stack overflow. This is why every recursive function MUST have a base case that is eventually reached.",
        "The function returns null after 1000 iterations as a safety measure",
        "The garbage collector detects the cycle and terminates the function"
      ],
      correct: 1,
    },
    {
      question: "Why is naive recursive Fibonacci O(2ᴺ) and how does memoization fix it?",
      options: [
        "Fibonacci uses two recursive calls which doubles the operations at each level",
        "fib(n) calls fib(n-1) AND fib(n-2). Each of those calls two more. The call tree doubles at each level → O(2ᴺ) total calls. fib(3) is computed multiple times, fib(2) even more. Memoization stores each result in a Map the first time it's computed. On subsequent calls, it returns the stored result instantly — O(1). Each unique n is computed exactly once, giving O(N) total.",
        "The exponential complexity comes from JavaScript's function call overhead, not the algorithm",
        "Memoization converts recursion to iteration which is inherently faster"
      ],
      correct: 1,
    },
    {
      question: "Why is recursion particularly natural for tree structures?",
      options: [
        "Trees are stored in memory in a recursive format that matches recursive function calls",
        "Trees are defined recursively — a tree is a root node plus a list of subtrees, each of which is also a tree. A recursive function mirrors this definition directly: handle the current node, then call yourself on each child. The recursion depth equals the tree depth, which is typically small (log N for balanced trees). You don't need to manually track the traversal state.",
        "Trees require recursion — they cannot be traversed iteratively",
        "Recursive tree functions are automatically tail-call optimized by JavaScript engines"
      ],
      correct: 1,
    },
    {
      question: "What is the mutable default parameter bug in JavaScript recursion?",
      options: [
        "Default parameters cannot be arrays or objects in recursive functions",
        "When you write function f(arr, result = []), the [] is created ONCE when the module loads and shared across all calls that use the default. If the first call mutates result (pushes to it), the second call starts with a non-empty result. Fix: either don't use mutable defaults, create fresh inside the function, or use null as default and initialize inside.",
        "JavaScript throws an error when a recursive function modifies a default parameter",
        "Mutable defaults cause infinite recursion because the modified state persists"
      ],
      correct: 1,
    },
    {
      question: "What is trampolining and why would you use it in JavaScript?",
      options: [
        "Trampolining is a way to test recursive functions by bouncing inputs off each other",
        "Trampolining converts deep recursion into a loop to avoid stack overflow. Instead of calling itself, the function returns a thunk (a no-argument function). A trampoline runner keeps calling the returned thunk until it gets a non-function value. This achieves unlimited recursive depth because the stack never grows beyond one frame — useful when JavaScript's ~10,000-frame limit would be exceeded.",
        "Trampolining is a way to add tail-call optimization to any JavaScript engine",
        "Trampolining memoizes recursive calls to avoid redundant computation"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Que se passe-t-il si une fonction récursive n'a pas de cas de base ?",
      options: [
        "JavaScript détecte automatiquement la boucle infinie et retourne undefined",
        "La fonction s'appelle indéfiniment, ajoutant un nouveau cadre à la pile d'appels à chaque fois. La pile a une taille finie (~10 000-15 000 cadres dans V8). Quand elle se remplit, JavaScript lance 'RangeError: Maximum call stack size exceeded'. C'est pourquoi chaque fonction récursive DOIT avoir un cas de base.",
        "La fonction retourne null après 1000 itérations comme mesure de sécurité",
        "Le ramasse-miettes détecte le cycle et termine la fonction"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi la Fibonacci récursive naïve est-elle O(2ᴺ) et comment la mémoïsation corrige-t-elle cela ?",
      options: [
        "Fibonacci utilise deux appels récursifs ce qui double les opérations à chaque niveau",
        "fib(n) appelle fib(n-1) ET fib(n-2). Chacun appelle deux autres. L'arbre d'appels double à chaque niveau → O(2ᴺ) appels totaux. La mémoïsation stocke chaque résultat dans une Map la première fois. Aux appels suivants, elle retourne le résultat stocké — O(1). Chaque n unique est calculé exactement une fois → O(N) total.",
        "La complexité exponentielle vient de l'overhead des appels de fonctions JavaScript",
        "La mémoïsation convertit la récursion en itération qui est intrinsèquement plus rapide"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi la récursion est-elle particulièrement naturelle pour les structures arborescentes ?",
      options: [
        "Les arbres sont stockés en mémoire dans un format récursif",
        "Les arbres sont définis récursivement — un arbre est un nœud racine plus une liste de sous-arbres, chacun étant aussi un arbre. Une fonction récursive reflète directement cette définition : traiter le nœud courant, puis s'appeler sur chaque enfant. Vous n'avez pas besoin de suivre manuellement l'état de traversée.",
        "Les arbres nécessitent la récursion — ils ne peuvent pas être parcourus itérativement",
        "Les fonctions récursives sur les arbres sont automatiquement optimisées par les moteurs JavaScript"
      ],
      correct: 1,
    },
    {
      question: "Quel est le bug du paramètre par défaut mutable en JavaScript ?",
      options: [
        "Les paramètres par défaut ne peuvent pas être des tableaux ou objets dans les fonctions récursives",
        "Quand vous écrivez function f(arr, result = []), le [] est créé UNE FOIS au chargement du module et partagé entre tous les appels utilisant la valeur par défaut. Si le premier appel mute result, le deuxième appel commence avec un result non vide. Fix : ne pas utiliser de valeurs par défaut mutables, ou créer un nouveau tableau à l'intérieur.",
        "JavaScript lance une erreur quand une fonction récursive modifie un paramètre par défaut",
        "Les valeurs par défaut mutables causent une récursion infinie car l'état persiste"
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce que le trampolinage et pourquoi l'utiliseriez-vous en JavaScript ?",
      options: [
        "Le trampolinage est une façon de tester les fonctions récursives",
        "Le trampolinage convertit la récursion profonde en boucle pour éviter le débordement de pile. Au lieu de s'appeler elle-même, la fonction retourne un thunk (une fonction sans argument). Un runner trampoline continue d'appeler le thunk retourné jusqu'à obtenir une valeur non-fonction. La pile ne dépasse jamais un cadre — utile quand la limite de ~10 000 cadres serait dépassée.",
        "Le trampolinage ajoute l'optimisation des appels de queue à n'importe quel moteur JavaScript",
        "Le trampolinage mémoïse les appels récursifs pour éviter les calculs redondants"
      ],
      correct: 1,
    },
  ],
};
