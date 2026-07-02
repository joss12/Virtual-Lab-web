export const id = "big-o-notation";
export const titleEn = "Big O Notation";
export const titleFr = "Notation Grand O";

export const content = {
  en: `# Big O Notation

## Why Performance Thinking Matters in JavaScript

JavaScript runs everywhere — browsers, servers, mobile apps. The same code that works fine with 100 items can freeze a browser tab with 100,000. Big O notation gives you the vocabulary and tools to predict performance before it becomes a problem.

\`\`\`javascript
// This feels fine with 10 users:
function findUser(users, targetId) {
    for (const user of users) {
        if (user.id === targetId) return user;
    }
    return null;
}

// With 10 users:    10 comparisons   → instant
// With 10,000:      10,000           → still fast
// With 10,000,000:  10,000,000       → noticeable lag
// With 100,000,000: 100,000,000      → browser freezes

// A hash map lookup does this in O(1) — one operation regardless of size:
function findUserFast(usersById, targetId) {
    return usersById[targetId] ?? null;
}
\`\`\`

Big O notation describes how an algorithm's time or space requirements **grow as input size grows**. It focuses on the dominant term and ignores constants — because at large scale, the growth pattern is what matters.

## The Six Complexities You Must Know

### O(1) — Constant Time

The operation takes the same time regardless of input size. This is the gold standard.

\`\`\`javascript
// O(1) examples — always one operation regardless of array size

// Array access by index
const arr = [10, 20, 30, 40, 50];
const first = arr[0];       // O(1) — direct memory address calculation
const last  = arr[arr.length - 1];  // O(1)

// Object property lookup
const user = { name: "Alice", age: 30 };
const name = user.name;    // O(1) — hash table lookup

// Set/Map operations
const seen = new Set();
seen.add("apple");         // O(1) — hash-based
seen.has("apple");         // O(1) — hash-based

const map = new Map();
map.set("key", "value");   // O(1)
map.get("key");            // O(1)

// Array push/pop (end operations)
arr.push(60);   // O(1) — just append to end
arr.pop();      // O(1) — just remove from end

// Math operations
const max = Math.max(a, b);  // O(1)
\`\`\`

### O(log N) — Logarithmic Time

Each step eliminates half the remaining possibilities. Grows very slowly — log₂(1,000,000) is only 20.

\`\`\`javascript
// Binary search — the classic O(log N) algorithm
function binarySearch(sortedArr, target) {
    let left  = 0;
    let right = sortedArr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (sortedArr[mid] === target) return mid;
        if (sortedArr[mid] < target)   left  = mid + 1;
        else                           right = mid - 1;
    }
    return -1;
}

// N=1,000:       ~10 steps  (log₂ 1000 ≈ 10)
// N=1,000,000:   ~20 steps  (log₂ 1,000,000 ≈ 20)
// N=1,000,000,000: ~30 steps (log₂ 1B ≈ 30)

// Doubling the input only adds ONE more step.
// That's why O(log N) scales so beautifully.
\`\`\`

### O(N) — Linear Time

Work grows proportionally with input size. Check every element once.

\`\`\`javascript
// Every array method that visits each element is O(N)
const numbers = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];

// Linear scan
const sum     = numbers.reduce((s, n) => s + n, 0);    // O(N)
const doubled = numbers.map(n => n * 2);                // O(N)
const evens   = numbers.filter(n => n % 2 === 0);       // O(N)
const found   = numbers.find(n => n > 5);               // O(N) worst case
const max     = Math.max(...numbers);                   // O(N)

// includes, indexOf — linear scan (unlike Set/Map which are O(1))
numbers.includes(5);    // O(N) — scans until found
numbers.indexOf(5);     // O(N)

// Array unshift/shift — O(N)! Must move every element
numbers.unshift(0);     // O(N) — shifts all elements right
numbers.shift();        // O(N) — shifts all elements left

// This is why push/pop is preferred over unshift/shift for performance
\`\`\`

### O(N log N) — Linearithmic Time

The best possible time for a comparison-based sort. Appears in all efficient sorting algorithms.

\`\`\`javascript
// JavaScript's built-in sort is O(N log N)
const arr = [64, 25, 12, 22, 11];
arr.sort((a, b) => a - b);   // O(N log N) — timsort in V8

// Merge sort — classic O(N log N)
function mergeSort(arr) {
    if (arr.length <= 1) return arr;

    const mid   = Math.floor(arr.length / 2);
    const left  = mergeSort(arr.slice(0, mid));   // O(log N) levels
    const right = mergeSort(arr.slice(mid));

    return merge(left, right);   // O(N) work per level
}
// Total: O(N) × O(log N) levels = O(N log N)

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) result.push(left[i++]);
        else                     result.push(right[j++]);
    }
    return [...result, ...left.slice(i), ...right.slice(j)];
}
\`\`\`

### O(N²) — Quadratic Time

A loop inside a loop where both iterate over the input. Gets slow fast.

\`\`\`javascript
// Nested loops = O(N²) — the most common performance trap

// Finding all pairs
function findAllPairs(arr) {
    const pairs = [];
    for (let i = 0; i < arr.length; i++) {       // O(N)
        for (let j = i + 1; j < arr.length; j++) { // O(N)
            pairs.push([arr[i], arr[j]]);
        }
    }
    return pairs;
}
// N=10:     45 operations
// N=100:    4,950 operations
// N=1,000:  499,500 operations
// N=10,000: 49,995,000 operations ← 50 million!

// Bubble sort — classic O(N²)
function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

// The classic O(N²) trap in JavaScript:
function hasDuplicate_slow(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j]) return true;  // O(N²)
        }
    }
    return false;
}

// O(N) solution using a Set:
function hasDuplicate_fast(arr) {
    const seen = new Set();
    for (const item of arr) {
        if (seen.has(item)) return true;  // O(1) lookup
        seen.add(item);                    // O(1) insert
    }
    return false;
}
// Total: O(N) — visit each element once
\`\`\`

### O(2ᴺ) — Exponential Time

Doubles with each additional input. Only feasible for tiny inputs.

\`\`\`javascript
// Naive Fibonacci — the classic exponential algorithm
function fib(n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);  // two recursive calls!
}
// fib(10):  177 calls
// fib(20):  21,891 calls
// fib(30):  2,692,537 calls
// fib(40):  331,160,281 calls — over 300 million!

// Fix with memoization → O(N)
function fibMemo(n, memo = new Map()) {
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n);
    const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    memo.set(n, result);
    return result;
}
// fibMemo(40): 79 calls — from 331 million to 79!
// Uses Map instead of plain object for better key handling
\`\`\`

## The Rules of Big O Analysis

### Rule 1: Drop Constants

\`\`\`javascript
// O(2N) → O(N)
function twoLoops(arr) {
    for (const x of arr) console.log(x);   // N iterations
    for (const x of arr) console.log(x);   // N iterations
    // Total: 2N → still O(N)
}

// O(100N) → O(N)
function hundredOps(arr) {
    for (const x of arr) {
        // 100 operations per element — still O(N)
        for (let i = 0; i < 100; i++) {
            console.log(x);
        }
    }
}
// At N=1,000,000 the constant doesn't change the growth pattern
\`\`\`

### Rule 2: Drop Non-Dominant Terms

\`\`\`javascript
// O(N² + N) → O(N²)
function combined(arr) {
    // O(N²) part
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            console.log(arr[i], arr[j]);
        }
    }
    // O(N) part — irrelevant when N is large
    for (const x of arr) {
        console.log(x);
    }
}
// At N=1000: N²=1,000,000 vs N=1,000
// The N term is 0.1% of the total — we ignore it
\`\`\`

### Rule 3: Different Inputs = Different Variables

\`\`\`javascript
// O(A + B) — NOT O(N²)!
function processTwoArrays(arrA, arrB) {
    for (const a of arrA) console.log(a);  // O(A)
    for (const b of arrB) console.log(b);  // O(B)
    // Total: O(A + B)
}

// O(A × B) — nested loops over DIFFERENT arrays
function compareArrays(arrA, arrB) {
    for (const a of arrA) {           // O(A)
        for (const b of arrB) {       // O(B)
            if (a === b) console.log("match:", a);
        }
    }
    // Total: O(A × B) — not O(N²) because A and B can differ
}
\`\`\`

## Space Complexity

Time isn't the only resource. Memory matters too — especially in browsers where RAM is limited.

\`\`\`javascript
// O(1) space — uses fixed memory regardless of input
function sumArray(arr) {
    let total = 0;        // one variable — O(1) space
    for (const n of arr) total += n;
    return total;
}

// O(N) space — creates an array proportional to input
function doubleAll(arr) {
    return arr.map(n => n * 2);  // new array of same size — O(N) space
}

// O(N) space — recursion uses call stack
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);   // N frames on call stack
}

// O(1) space factorial (iterative — avoids stack)
function factorialIterative(n) {
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

// The memoization trade-off: O(N) time savings costs O(N) space
const fibMemo = (n, memo = new Map()) => {
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n);
    const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    memo.set(n, result);  // O(N) space to store all subproblem results
    return result;
};
\`\`\`

## JavaScript-Specific Performance Traps

These are the Big O mistakes JavaScript developers make most often:

\`\`\`javascript
// TRAP 1: Array.includes() in a loop — O(N²) disguised as O(N)
const banned = ["spam", "junk", "trash"];

// LOOKS like O(N) — is actually O(N²)!
function filterMessages_slow(messages) {
    return messages.filter(msg => banned.includes(msg));
    //                                   ↑ O(N) inside O(N) = O(N²)
}

// FIX: convert lookup to O(1) before the loop
function filterMessages_fast(messages) {
    const bannedSet = new Set(banned);   // O(N) once
    return messages.filter(msg => bannedSet.has(msg));
    //                                   ↑ O(1) inside O(N) = O(N)
}

// TRAP 2: Repeated array spread in a loop — O(N²)
function buildArray_slow(n) {
    let result = [];
    for (let i = 0; i < n; i++) {
        result = [...result, i];   // O(N) copy on every iteration!
    }
    return result;
}

// FIX: use push — O(N) total
function buildArray_fast(n) {
    const result = [];
    for (let i = 0; i < n; i++) {
        result.push(i);   // O(1) per iteration
    }
    return result;
}

// TRAP 3: String concatenation in a loop — O(N²)
function joinStrings_slow(arr) {
    let result = "";
    for (const s of arr) {
        result += s;   // creates a NEW string each time — O(N) per iteration!
    }
    return result;
}

// FIX: join — O(N) total
function joinStrings_fast(arr) {
    return arr.join("");   // O(N) — built for this
}

// TRAP 4: Using an Array where a Set/Map is better
function removeDuplicates_slow(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
    //                                      ↑ O(N) inside O(N) = O(N²)
}

function removeDuplicates_fast(arr) {
    return [...new Set(arr)];   // O(N) — Set handles deduplication in O(1)
}
\`\`\`

## Quick Reference

\`\`\`
Complexity   Name           Example                    N=1000 ops
─────────────────────────────────────────────────────────────────
O(1)         Constant       obj[key], Set.has()        1
O(log N)     Logarithmic    Binary search              10
O(N)         Linear         map, filter, for loop      1,000
O(N log N)   Linearithmic   Array.sort()               10,000
O(N²)        Quadratic      Nested loops               1,000,000
O(2ᴺ)        Exponential    Naive recursion            2^1000 ≈ ∞

JavaScript built-ins:
  O(1):     arr[i], obj.key, Map.get, Set.has, push, pop
  O(N):     map, filter, reduce, find, includes, indexOf, unshift, shift
  O(N logN): sort
  O(N²):    nested loops, includes() inside filter()
\`\`\`
`,

  fr: `# Notation Grand O

## Les six complexités essentielles

\`\`\`javascript
// O(1) — Constant : même temps quelle que soit la taille
const val = arr[0];           // accès direct
const found = set.has("x");   // table de hachage

// O(log N) — Logarithmique : chaque étape élimine la moitié
// log₂(1 000 000) = seulement 20 étapes !
function rechercheBI(arr, cible) {
    let g = 0, d = arr.length - 1;
    while (g <= d) {
        const m = Math.floor((g + d) / 2);
        if (arr[m] === cible) return m;
        arr[m] < cible ? g = m + 1 : d = m - 1;
    }
    return -1;
}

// O(N) — Linéaire : visite chaque élément une fois
arr.map(n => n * 2);       // O(N)
arr.filter(n => n > 0);    // O(N)
arr.includes(5);            // O(N) — scan linéaire !

// O(N log N) — Tri efficace
arr.sort((a, b) => a - b); // O(N log N) — timsort dans V8

// O(N²) — Quadratique : boucle dans une boucle
for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) // O(N²)

// O(2ᴺ) — Exponentiel : éviter !
function fib(n) { return n<=1 ? n : fib(n-1)+fib(n-2); } // O(2ᴺ)
\`\`\`

## Pièges JavaScript spécifiques

\`\`\`javascript
// PIÈGE 1 : includes() dans une boucle — O(N²) déguisé !
messages.filter(m => banned.includes(m));  // O(N²) !
// FIX : convertir en Set d'abord
const bannedSet = new Set(banned);         // O(N) une fois
messages.filter(m => bannedSet.has(m));    // O(N) total ✓

// PIÈGE 2 : spread dans une boucle — O(N²)
let res = [];
for (let i = 0; i < n; i++) res = [...res, i];  // O(N²) !
// FIX : utiliser push
for (let i = 0; i < n; i++) res.push(i);         // O(N) ✓

// PIÈGE 3 : concaténation de chaînes dans une boucle
let s = "";
for (const x of arr) s += x;  // O(N²) — nouvelle chaîne à chaque fois !
// FIX :
arr.join("");                   // O(N) ✓
\`\`\`
`,
};

export const starterCode = {
  default: `// Big O Notation — JavaScript Practice

// ─── O(1) vs O(N) lookup ─────────────────────────────────
const users = Array.from({ length: 10000 }, (_, i) => ({
    id: i, name: \`User\${i}\`, active: i % 3 !== 0,
}));

// O(N) — linear scan
function findById_slow(users, id) {
    return users.find(u => u.id === id) ?? null;
}

// O(1) — hash map lookup (build index once)
function buildIndex(users) {
    return users.reduce((map, u) => {
        map[u.id] = u;
        return map;
    }, {});
}

const index = buildIndex(users);
const findById_fast = (index, id) => index[id] ?? null;

console.log("=== O(N) vs O(1) Lookup ===");
console.log("Slow (find):",  findById_slow(users, 9999)?.name);
console.log("Fast (index):", findById_fast(index, 9999)?.name);

// ─── O(N²) vs O(N) duplicate check ──────────────────────
function hasDuplicate_slow(arr) {
    for (let i = 0; i < arr.length; i++)
        for (let j = i + 1; j < arr.length; j++)
            if (arr[i] === arr[j]) return true;
    return false;
}

function hasDuplicate_fast(arr) {
    const seen = new Set();
    for (const item of arr) {
        if (seen.has(item)) return true;
        seen.add(item);
    }
    return false;
}

const arr1 = Array.from({ length: 1000 }, (_, i) => i);
const arr2 = [...arr1, 500];  // duplicate at end

console.log("\\n=== O(N²) vs O(N) Duplicate Check ===");
console.log("Slow no-dup:", hasDuplicate_slow(arr1));
console.log("Fast no-dup:", hasDuplicate_fast(arr1));
console.log("Slow has-dup:", hasDuplicate_slow(arr2));
console.log("Fast has-dup:", hasDuplicate_fast(arr2));

// ─── Memoized Fibonacci ───────────────────────────────────
function fib(n, memo = new Map()) {
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n);
    const result = fib(n - 1, memo) + fib(n - 2, memo);
    memo.set(n, result);
    return result;
}

console.log("\\n=== O(N) Fibonacci (memoized) ===");
for (const n of [10, 20, 30, 40, 50]) {
    console.log(\`  fib(\${n}) = \${fib(n)}\`);
}

// ─── String join trap ─────────────────────────────────────
const words = Array.from({ length: 1000 }, (_, i) => \`word\${i}\`);

// O(N²) approach
let slow = "";
for (const w of words) slow += w + " ";

// O(N) approach
const fast = words.join(" ");

console.log("\\n=== String Building ===");
console.log("Same result:", slow.trim() === fast);
console.log("Word count:", fast.split(" ").length);
`,
};

export const exerciseEn = `Complexity analysis challenge.

1. Analyze the Big O time complexity of each function and explain WHY:

\`\`\`javascript
// A)
function mystery1(n) {
    let count = 0;
    for (let i = 1; i < n; i *= 2) count++;
    return count;
}

// B)
function mystery2(arr) {
    return arr.reduce((acc, x) => {
        return acc.includes(x) ? acc : [...acc, x];
    }, []);
}

// C)
function mystery3(arr) {
    const freq = {};
    for (const x of arr) freq[x] = (freq[x] || 0) + 1;
    return Object.entries(freq).sort(([,a],[,b]) => b - a)[0][0];
}
\`\`\`

2. Rewrite mystery2 to be O(N) instead of O(N²).

3. You have an array of 1 million product IDs. Write two versions
   of 'intersection(a, b)' that finds IDs in both arrays:
   - Version 1: O(N²) using nested loops
   - Version 2: O(N) using a Set
   Explain why the Set version is dramatically faster at scale.`;

export const exerciseFr = `Défi d'analyse de complexité.

1. Analysez la complexité Big O de chaque fonction et expliquez POURQUOI.

2. Réécrivez mystery2 pour être O(N) au lieu de O(N²).

3. Vous avez un tableau d'un million d'IDs de produits. Écrivez deux
   versions de 'intersection(a, b)' :
   - Version 1 : O(N²) avec des boucles imbriquées
   - Version 2 : O(N) avec un Set`;

export const solutionCode = {
  default: `// 1. Complexity analysis

// A) mystery1 — O(log N)
// i starts at 1 and doubles each iteration (i *= 2)
// Doubles until i >= n → log₂(n) iterations
function mystery1(n) {
    let count = 0;
    for (let i = 1; i < n; i *= 2) count++;
    return count;
}
console.log("mystery1(8):", mystery1(8));    // 3  (1,2,4,8)
console.log("mystery1(1024):", mystery1(1024)); // 10

// B) mystery2 — O(N²)
// The outer reduce is O(N)
// Inside: acc.includes(x) is O(N) — linear scan of accumulated array
// ...acc spread is O(N) — copies entire array each time
// Total: O(N) × O(N) = O(N²)
function mystery2(arr) {
    return arr.reduce((acc, x) => {
        return acc.includes(x) ? acc : [...acc, x];
    }, []);
}

// C) mystery3 — O(N log N)
// Building freq object: O(N)
// Object.entries: O(N)
// .sort(): O(N log N) ← dominates
// Total: O(N log N)
function mystery3(arr) {
    const freq = {};
    for (const x of arr) freq[x] = (freq[x] || 0) + 1;
    return Object.entries(freq).sort(([,a],[,b]) => b - a)[0][0];
}

const test = [1,2,2,3,3,3,4];
console.log("\\nmystery2:", mystery2([1,2,1,3,2,4]));
console.log("mystery3:", mystery3(test));  // "3" (appears 3 times)

// 2. Rewrite mystery2 — O(N)
function removeDuplicates(arr) {
    return [...new Set(arr)];   // Set deduplicates in O(1) per insert
}
// OR:
function removeDuplicates2(arr) {
    const seen = new Set();
    return arr.filter(x => {
        if (seen.has(x)) return false;
        seen.add(x);
        return true;
    });
}
// Preserves original order, O(N) total — each element visited once
console.log("\\nremoveDuplicates:", removeDuplicates([1,2,1,3,2,4]));
console.log("removeDuplicates2:", removeDuplicates2([1,2,1,3,2,4]));

// 3. Intersection — O(N²) vs O(N)
const a = Array.from({ length: 10000 }, (_, i) => i);
const b = Array.from({ length: 10000 }, (_, i) => i * 2);  // even numbers

// O(N²) — nested loops
function intersection_slow(a, b) {
    return a.filter(x => b.includes(x));
    // filter is O(N), includes is O(N) → O(N²) total
}

// O(N) — Set lookup
function intersection_fast(a, b) {
    const setB = new Set(b);          // O(N) — build set once
    return a.filter(x => setB.has(x)); // O(N) × O(1) = O(N)
}

const slow = intersection_slow(a, b);
const fast = intersection_fast(a, b);

console.log("\\n=== Intersection ===");
console.log("Same result:", JSON.stringify(slow) === JSON.stringify(fast));
console.log("Count:", fast.length);
console.log("First 5:", fast.slice(0, 5));

// Why dramatically faster at scale:
// N=10,000: O(N²) = 100,000,000 operations
//           O(N)  = 20,000 operations (10,000 to build set + 10,000 to filter)
// That's 5,000x fewer operations at this size.
// At N=1,000,000: O(N²) = 1 trillion, O(N) = 2 million
`,
};

export const quiz = {
  en: [
    {
      question: "Why does Array.includes() inside a filter() create O(N²) complexity?",
      options: [
        "filter() and includes() both use sorting internally which multiplies complexity",
        "filter() visits every element — O(N). For each element, includes() scans the entire lookup array to find a match — O(N). A function that is O(N) running N times gives O(N) × O(N) = O(N²). Fix: convert the lookup array to a Set first (O(N) once), then Set.has() is O(1), making the filter O(N) total.",
        "includes() has O(N²) complexity on its own regardless of context",
        "The combination only causes O(N log N), not O(N²)"
      ],
      correct: 1,
    },
    {
      question: "Why does string concatenation with += in a loop cause O(N²) complexity?",
      options: [
        "The += operator for strings is O(N²) by design in JavaScript engines",
        "Strings in JavaScript are immutable — every += creates a brand new string by copying ALL existing characters plus the new ones. After N concatenations, the total characters copied is 1+2+3+...+N = N(N+1)/2 = O(N²). Fix: collect strings in an array and call join() once, which is O(N).",
        "String concatenation is only O(N²) for strings longer than 100 characters",
        "The issue is with the loop structure, not the += operator"
      ],
      correct: 1,
    },
    {
      question: "What makes Set.has() O(1) while Array.includes() is O(N)?",
      options: [
        "Set stores values in sorted order enabling binary search",
        "Set uses a hash table internally. When you call has(value), JavaScript computes a hash of the value (a fixed-size number) and checks a specific memory location — one operation regardless of Set size. Array.includes() must scan from the start until it finds the value or reaches the end — up to N comparisons. This is why converting arrays to Sets before repeated lookups is such a common optimization.",
        "Set limits its size to 1024 elements, making searches faster",
        "Set.has() uses the operating system cache while includes() does not"
      ],
      correct: 1,
    },
    {
      question: "A function has a loop that runs N times containing a nested loop that runs log N times. What is the total complexity?",
      options: [
        "O(N + log N) — you add complexities for nested loops",
        "O(N log N) — you multiply complexities for nested loops. The outer loop runs N times and for each iteration, the inner loop runs log N times. Total work = N × log N = O(N log N). This is the complexity of efficient sorting algorithms like merge sort and heapsort.",
        "O(N²) — any nested loop is automatically O(N²)",
        "O(log N²) — the logarithm absorbs the outer N"
      ],
      correct: 1,
    },
    {
      question: "Why does Big O drop constants — why is O(3N) written as O(N)?",
      options: [
        "Constants are always exactly 1 in JavaScript because of JIT compilation",
        "Big O describes growth rate as input approaches infinity, not exact operation counts. At large N, the constant factor becomes insignificant compared to N itself. An O(3N) algorithm and an O(N) algorithm both double their work when N doubles — they have the same growth pattern. Constants matter in practice (O(2N) is twice as slow as O(N)) but Big O focuses on scalability.",
        "Constants are dropped because JavaScript engines optimize them away automatically",
        "Dropping constants is optional — you can write O(3N) if you prefer"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Pourquoi Array.includes() dans un filter() crée-t-il une complexité O(N²) ?",
      options: [
        "filter() et includes() utilisent tous deux le tri en interne",
        "filter() visite chaque élément — O(N). Pour chaque élément, includes() scanne tout le tableau de recherche — O(N). Une fonction O(N) s'exécutant N fois donne O(N) × O(N) = O(N²). Fix : convertir le tableau en Set d'abord (O(N) une fois), puis Set.has() est O(1), rendant le filter O(N) total.",
        "includes() a une complexité O(N²) seul indépendamment du contexte",
        "La combinaison cause seulement O(N log N), pas O(N²)"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi la concaténation de chaînes avec += dans une boucle cause-t-elle O(N²) ?",
      options: [
        "L'opérateur += pour les chaînes est O(N²) par conception",
        "Les chaînes en JavaScript sont immuables — chaque += crée une NOUVELLE chaîne en copiant TOUS les caractères existants plus les nouveaux. Après N concaténations, le total de caractères copiés est 1+2+3+...+N = N(N+1)/2 = O(N²). Fix : collecter dans un tableau et appeler join() une fois — O(N).",
        "La concaténation n'est O(N²) que pour les chaînes de plus de 100 caractères",
        "Le problème vient de la structure de boucle, pas de l'opérateur +="
      ],
      correct: 1,
    },
    {
      question: "Pourquoi Set.has() est-il O(1) tandis que Array.includes() est O(N) ?",
      options: [
        "Set stocke les valeurs en ordre trié permettant la recherche binaire",
        "Set utilise une table de hachage en interne. has(valeur) calcule un hash et vérifie un emplacement mémoire spécifique — une opération quelle que soit la taille du Set. Array.includes() doit scanner depuis le début jusqu'à trouver la valeur — jusqu'à N comparaisons.",
        "Set limite sa taille à 1024 éléments, rendant les recherches plus rapides",
        "Set.has() utilise le cache du système d'exploitation"
      ],
      correct: 1,
    },
    {
      question: "Une fonction a une boucle qui s'exécute N fois contenant une boucle imbriquée qui s'exécute log N fois. Quelle est la complexité totale ?",
      options: [
        "O(N + log N) — on additionne les complexités des boucles imbriquées",
        "O(N log N) — on multiplie les complexités des boucles imbriquées. La boucle externe s'exécute N fois et pour chaque itération, la boucle interne s'exécute log N fois. Travail total = N × log N = O(N log N).",
        "O(N²) — toute boucle imbriquée est automatiquement O(N²)",
        "O(log N²) — le logarithme absorbe le N externe"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi Big O ignore-t-il les constantes — pourquoi O(3N) s'écrit-il O(N) ?",
      options: [
        "Les constantes sont toujours exactement 1 en JavaScript grâce à la compilation JIT",
        "Big O décrit le taux de croissance quand l'entrée tend vers l'infini, pas les comptes exacts. À grand N, le facteur constant devient insignifiant. Un algorithme O(3N) et un O(N) doublent tous deux leur travail quand N double — ils ont le même schéma de croissance.",
        "Les constantes sont ignorées car les moteurs JavaScript les optimisent automatiquement",
        "Ignorer les constantes est optionnel — vous pouvez écrire O(3N) si vous préférez"
      ],
      correct: 1,
    },
  ],
};
