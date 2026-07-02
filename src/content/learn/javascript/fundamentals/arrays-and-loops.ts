export const id = "arrays-and-loops";
export const titleEn = "Arrays & Loops";
export const titleFr = "Tableaux et boucles";

export const content = {
  en: `# Arrays & Loops

## What Is an Array and Why Does It Exist?

Imagine you need to store the scores of 100 students. Without arrays, you'd need 100 separate variables:

\`\`\`javascript
const score1 = 85;
const score2 = 92;
const score3 = 78;
// ... 97 more lines
\`\`\`

This is completely unworkable. You can't loop over individual variables, you can't pass them to a function easily, and adding a new student means adding a new variable.

**An array is an ordered collection of values stored under one name**, accessed by their position (index):

\`\`\`javascript
const scores = [85, 92, 78, 90, 88, 95];
//               0   1   2   3   4   5  ← indices (start at 0, always)

console.log(scores[0]);   // 85 (first)
console.log(scores[5]);   // 95 (last)
console.log(scores[scores.length - 1]);  // 95 (last — works for any length)

// Now you can loop:
for (const score of scores) {
    console.log(score);
}
\`\`\`

## Creating Arrays

\`\`\`javascript
// Empty array
const empty = [];

// Array with initial values
const fruits = ["apple", "banana", "cherry"];
const numbers = [1, 2, 3, 4, 5];
const mixed = [42, "hello", true, null, [1, 2]];  // any types, even arrays

// Array constructor (rarely used — prefer literal [])
const zeros = new Array(5).fill(0);   // [0, 0, 0, 0, 0]
const range = Array.from({ length: 5 }, (_, i) => i); // [0, 1, 2, 3, 4]
// Array.from: create array from any iterable or array-like thing
// {length: 5} → object with 5 slots
// (_, i) → arrow function: _ is value (unused), i is index

// Practical range generators
const oneToTen = Array.from({ length: 10 }, (_, i) => i + 1);
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const evenNumbers = Array.from({ length: 5 }, (_, i) => (i + 1) * 2);
// [2, 4, 6, 8, 10]
\`\`\`

## Reading and Modifying Arrays

\`\`\`javascript
const fruits = ["apple", "banana", "cherry"];

// Reading
console.log(fruits[0]);          // "apple"
console.log(fruits[2]);          // "cherry"
console.log(fruits[-1]);         // undefined (JS doesn't support negative indexing)
console.log(fruits[fruits.length - 1]);  // "cherry" (last element)
console.log(fruits.at(-1));      // "cherry" (modern — at() supports negative!)
console.log(fruits.at(-2));      // "banana"

// Modifying (arrays declared with const can still be modified!)
// const means the VARIABLE can't be reassigned, not that the array is frozen
fruits[1] = "blueberry";
console.log(fruits);   // ["apple", "blueberry", "cherry"]

// Trying to reassign the array itself → ERROR:
// fruits = ["new", "array"];   // TypeError: Assignment to constant variable
\`\`\`

## Essential Array Methods — Adding and Removing

\`\`\`javascript
const arr = [1, 2, 3];

// ADD elements
arr.push(4);        // add to END → [1, 2, 3, 4]  — O(1)
arr.unshift(0);     // add to START → [0, 1, 2, 3, 4] — O(N) (shifts everything)

// REMOVE elements
arr.pop();          // remove from END → [0, 1, 2, 3] — returns removed: 4
arr.shift();        // remove from START → [1, 2, 3] — returns removed: 0

// Performance note:
// push/pop (end): O(1) — very fast
// unshift/shift (start): O(N) — slow for large arrays (must shift all elements)
// For frequent front-removal, use a different structure (see data structures lesson)

// SPLICE — add/remove anywhere
const letters = ["a", "b", "c", "d", "e"];

// splice(startIndex, deleteCount, ...itemsToInsert)
letters.splice(2, 0, "X");    // at index 2, delete 0, insert "X"
console.log(letters);          // ["a", "b", "X", "c", "d", "e"]

letters.splice(1, 2);          // at index 1, delete 2 items
console.log(letters);          // ["a", "c", "d", "e"]

letters.splice(1, 1, "Y", "Z"); // at index 1, delete 1, insert "Y" and "Z"
console.log(letters);           // ["a", "Y", "Z", "d", "e"]

// splice returns the removed elements
const removed = letters.splice(0, 2);
console.log(removed);   // ["a", "Y"]
console.log(letters);   // ["Z", "d", "e"]
\`\`\`

## Searching Arrays

\`\`\`javascript
const numbers = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
const fruits  = ["apple", "banana", "cherry"];

// Does it exist?
console.log(fruits.includes("banana"));     // true  — O(N)
console.log(fruits.includes("grape"));      // false

// Where is it? (returns index, or -1 if not found)
console.log(numbers.indexOf(5));            // 4 (first occurrence)
console.log(numbers.lastIndexOf(5));        // 8 (last occurrence)
console.log(numbers.indexOf(99));           // -1 (not found)

// Find by condition — find() returns the VALUE (or undefined)
const firstBig = numbers.find(n => n > 4);
console.log(firstBig);   // 5 (first number greater than 4)

// findIndex() returns the INDEX (or -1)
const firstBigIndex = numbers.findIndex(n => n > 4);
console.log(firstBigIndex);   // 4

// Finding objects (indexOf won't work — it compares by reference)
const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Carol" },
];

const bob = users.find(u => u.name === "Bob");
console.log(bob);   // { id: 2, name: "Bob" }

const bobIndex = users.findIndex(u => u.id === 2);
console.log(bobIndex);   // 1
\`\`\`

## The Big Three: map, filter, reduce

These three methods are the most important array methods in JavaScript. Understanding them deeply will change how you write code.

### map — Transform Every Element

\`\`\`javascript
// map creates a NEW array where every element has been transformed.
// The original array is NEVER modified.

const prices = [10, 20, 30, 40, 50];

// Add 20% tax to every price
const withTax = prices.map(price => price * 1.2);
console.log(withTax);    // [12, 24, 36, 48, 60]
console.log(prices);     // [10, 20, 30, 40, 50] — original unchanged!

// The callback receives: (element, index, array)
const labeled = prices.map((price, index) => \`Item \${index + 1}: $\${price}\`);
console.log(labeled);
// ["Item 1: $10", "Item 2: $20", "Item 3: $30", ...]

// Real-world: transform API data
const apiUsers = [
    { first_name: "alice", last_name: "smith",  age: 30 },
    { first_name: "bob",   last_name: "jones",  age: 25 },
];

const formattedUsers = apiUsers.map(user => ({
    name:     \`\${user.first_name} \${user.last_name}\`.replace(/\\b\\w/g, c => c.toUpperCase()),
    age:      user.age,
    isAdult:  user.age >= 18,
}));

console.log(formattedUsers);
// [{ name: "Alice Smith", age: 30, isAdult: true }, ...]
\`\`\`

### filter — Keep Only What Passes a Test

\`\`\`javascript
// filter creates a NEW array containing only elements where the callback returns true.
// Elements where callback returns false are excluded.
// Original array unchanged.

const scores = [85, 42, 91, 67, 55, 78, 99, 38];

// Keep only passing scores (>= 60)
const passing = scores.filter(score => score >= 60);
console.log(passing);   // [85, 91, 67, 78, 99]

// Failing scores
const failing = scores.filter(score => score < 60);
console.log(failing);   // [42, 55, 38]

// Filter objects
const products = [
    { name: "Laptop",  price: 999, inStock: true  },
    { name: "Phone",   price: 699, inStock: false },
    { name: "Tablet",  price: 499, inStock: true  },
    { name: "Watch",   price: 299, inStock: false },
    { name: "Earbuds", price: 149, inStock: true  },
];

const affordable  = products.filter(p => p.price < 500);
const available   = products.filter(p => p.inStock);
const goodDeal    = products.filter(p => p.inStock && p.price < 500);

console.log(affordable.map(p => p.name));  // ["Tablet", "Watch", "Earbuds"]
console.log(available.map(p => p.name));   // ["Laptop", "Tablet", "Earbuds"]
console.log(goodDeal.map(p => p.name));    // ["Tablet", "Earbuds"]
\`\`\`

### reduce — Collapse Array to One Value

\`\`\`javascript
// reduce is the most powerful and most misunderstood array method.
// It accumulates all elements into a SINGLE value.
// That "value" can be: a number, string, object, or even another array.

// reduce(callback, initialValue)
// callback receives: (accumulator, currentElement, index, array)

const numbers = [1, 2, 3, 4, 5];

// Sum all numbers
const sum = numbers.reduce((acc, n) => acc + n, 0);
// Step by step:
// acc=0,  n=1 → return 1
// acc=1,  n=2 → return 3
// acc=3,  n=3 → return 6
// acc=6,  n=4 → return 10
// acc=10, n=5 → return 15
console.log(sum);   // 15

// Product of all numbers
const product = numbers.reduce((acc, n) => acc * n, 1);
console.log(product);   // 120 (1×2×3×4×5)

// Find maximum without Math.max
const max = numbers.reduce((largest, n) => n > largest ? n : largest, -Infinity);
console.log(max);   // 5

// Count occurrences of each value
const votes = ["Alice", "Bob", "Alice", "Carol", "Alice", "Bob"];
const tally = votes.reduce((counts, vote) => {
    counts[vote] = (counts[vote] || 0) + 1;
    return counts;
}, {});  // start with empty object
console.log(tally);   // { Alice: 3, Bob: 2, Carol: 1 }

// Group by a property
const people = [
    { name: "Alice", dept: "Engineering" },
    { name: "Bob",   dept: "Marketing"   },
    { name: "Carol", dept: "Engineering" },
    { name: "David", dept: "Marketing"   },
    { name: "Eve",   dept: "Engineering" },
];

const byDept = people.reduce((groups, person) => {
    const dept = person.dept;
    if (!groups[dept]) groups[dept] = [];  // create array if first in this dept
    groups[dept].push(person.name);
    return groups;
}, {});

console.log(byDept);
// { Engineering: ["Alice", "Carol", "Eve"], Marketing: ["Bob", "David"] }
\`\`\`

### Chaining map, filter, reduce

\`\`\`javascript
const orders = [
    { product: "Laptop",  price: 999, qty: 1, status: "delivered" },
    { product: "Mouse",   price:  29, qty: 3, status: "pending"   },
    { product: "Monitor", price: 349, qty: 2, status: "delivered" },
    { product: "Desk",    price: 299, qty: 1, status: "cancelled" },
    { product: "Chair",   price: 199, qty: 2, status: "delivered" },
];

// Total revenue from delivered orders
const revenue = orders
    .filter(o => o.status === "delivered")        // only delivered
    .map(o => o.price * o.qty)                     // compute line total
    .reduce((sum, total) => sum + total, 0);       // sum everything

console.log(\`Revenue: $\${revenue}\`);   // $1,693

// Average price of pending or delivered orders
const avgPrice = orders
    .filter(o => o.status !== "cancelled")
    .map(o => o.price)
    .reduce((sum, price, _, arr) => {
        // When this is the last element, divide to get average
        return sum + price / arr.length;
    }, 0);

console.log(\`Avg price: $\${avgPrice.toFixed(2)}\`);
\`\`\`

## More Essential Array Methods

### sort — Sorting Arrays

\`\`\`javascript
// WARNING: sort() modifies the array IN PLACE (unlike map/filter/reduce)
// It also converts elements to strings by default — which breaks number sorting!

const nums = [10, 1, 21, 2, 100];

// WRONG: default sort (string comparison)
nums.sort();
console.log(nums);   // [1, 10, 100, 2, 21] — "10" < "2" as strings!

// CORRECT: provide a comparison function
const sorted = [...nums].sort((a, b) => a - b);  // ascending
console.log(sorted);   // [1, 2, 10, 21, 100]

// How the comparison function works:
// If it returns negative → a comes before b
// If it returns positive → b comes before a
// If it returns 0 → order unchanged

// Descending
const desc = [...nums].sort((a, b) => b - a);
console.log(desc);   // [100, 21, 10, 2, 1]

// Sort strings (alphabetical works fine without comparison function)
const fruits = ["banana", "apple", "cherry", "date"];
fruits.sort();   // ["apple", "banana", "cherry", "date"] ✓

// Sort objects by property
const people = [
    { name: "Charlie", age: 30 },
    { name: "Alice",   age: 25 },
    { name: "Bob",     age: 35 },
];

// Sort by age
people.sort((a, b) => a.age - b.age);
console.log(people.map(p => p.name));   // ["Alice", "Charlie", "Bob"]

// Sort by name
people.sort((a, b) => a.name.localeCompare(b.name));
console.log(people.map(p => p.name));   // ["Alice", "Bob", "Charlie"]

// IMPORTANT: [...nums] creates a copy before sorting to avoid mutating original
\`\`\`

### slice — Extract a Portion

\`\`\`javascript
const arr = [0, 1, 2, 3, 4, 5];

// slice(start, end) — end is EXCLUDED, original unchanged
console.log(arr.slice(1, 4));    // [1, 2, 3]
console.log(arr.slice(2));       // [2, 3, 4, 5] (to end)
console.log(arr.slice(-2));      // [4, 5] (last 2)
console.log(arr.slice(1, -1));   // [1, 2, 3, 4] (all except first and last)
console.log(arr.slice());        // [0,1,2,3,4,5] (full copy)
console.log(arr);                // [0,1,2,3,4,5] — original unchanged
\`\`\`

### flat and flatMap — Working with Nested Arrays

\`\`\`javascript
// flat() — removes one level of nesting by default
const nested = [1, [2, 3], [4, [5, 6]]];
console.log(nested.flat());      // [1, 2, 3, 4, [5, 6]] (one level)
console.log(nested.flat(2));     // [1, 2, 3, 4, 5, 6]   (two levels)
console.log(nested.flat(Infinity)); // [1, 2, 3, 4, 5, 6] (all levels)

// flatMap — map then flat(1) — very useful pattern
const sentences = ["Hello world", "I love JavaScript"];
const words = sentences.flatMap(s => s.split(" "));
console.log(words);   // ["Hello", "world", "I", "love", "JavaScript"]

// Alternative (less clean):
// const words = sentences.map(s => s.split(" ")).flat();
\`\`\`

### every and some — Test the Whole Array

\`\`\`javascript
const scores = [85, 92, 78, 90, 88];

// every — true if ALL elements pass the test
console.log(scores.every(s => s >= 60));    // true  (all passing)
console.log(scores.every(s => s >= 90));    // false (not all >= 90)

// some — true if AT LEAST ONE element passes the test
console.log(scores.some(s => s >= 90));    // true  (92 and 90 qualify)
console.log(scores.some(s => s >= 100));   // false (none perfect)

// Real-world usage
const cart = [
    { name: "Laptop",  inStock: true  },
    { name: "Mouse",   inStock: true  },
    { name: "Monitor", inStock: false },
];

const allInStock  = cart.every(item => item.inStock);
const someInStock = cart.some(item => item.inStock);

console.log(allInStock);   // false — Monitor is out of stock
console.log(someInStock);  // true  — Laptop and Mouse are in stock
\`\`\`

## Spreading and Combining Arrays

The **spread operator (\`...\`)** is one of the most useful modern JavaScript features. It "spreads" an array's elements into individual values.

\`\`\`javascript
const a = [1, 2, 3];
const b = [4, 5, 6];

// Combine arrays (non-destructive)
const combined = [...a, ...b];
console.log(combined);   // [1, 2, 3, 4, 5, 6]

// Insert in the middle
const withMiddle = [...a, 99, 100, ...b];
console.log(withMiddle);   // [1, 2, 3, 99, 100, 4, 5, 6]

// Copy an array (shallow copy)
const copy = [...a];
copy.push(99);
console.log(a);     // [1, 2, 3] — original unchanged
console.log(copy);  // [1, 2, 3, 99]

// Spread into function arguments
const numbers = [3, 1, 4, 1, 5, 9];
console.log(Math.max(...numbers));   // 9
console.log(Math.min(...numbers));   // 1
// Without spread: Math.max(3, 1, 4, 1, 5, 9) — must list individually

// Convert array-like things to real arrays
const divs = document.querySelectorAll("div");  // NodeList (not a real array)
const divsArray = [...divs];   // now it's a real array with all methods
\`\`\`

## Destructuring Arrays

Destructuring lets you **unpack** array values into variables cleanly.

\`\`\`javascript
const rgb = [255, 128, 0];

// Without destructuring
const red   = rgb[0];
const green = rgb[1];
const blue  = rgb[2];

// With destructuring — much cleaner
const [r, g, b] = rgb;
console.log(r, g, b);   // 255 128 0

// Skip elements with commas
const [first, , third] = [10, 20, 30];
console.log(first, third);   // 10 30

// Default values
const [x = 0, y = 0, z = 0] = [1, 2];
console.log(x, y, z);   // 1 2 0 (z uses default)

// Rest in destructuring
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head);   // 1
console.log(tail);   // [2, 3, 4, 5]

// Swap two variables elegantly
let a = 10, b = 20;
[a, b] = [b, a];
console.log(a, b);   // 20 10

// Destructure function return values
function getMinMax(numbers) {
    return [Math.min(...numbers), Math.max(...numbers)];
}

const [min, max] = getMinMax([3, 1, 4, 1, 5, 9]);
console.log(min, max);   // 1 9
\`\`\`

## Mutable vs Immutable — A Critical Distinction

Some array methods **mutate** (modify) the original array. Others return a new array and leave the original untouched. Knowing which is which prevents subtle bugs.

\`\`\`javascript
// MUTATING methods (modify the original):
// push, pop, shift, unshift, splice, sort, reverse, fill

// NON-MUTATING methods (return new array/value):
// map, filter, reduce, slice, concat, flat, flatMap, find, findIndex,
// includes, indexOf, every, some, join, flat

const original = [3, 1, 4, 1, 5];

// MUTATING — original is changed!
original.sort((a, b) => a - b);
console.log(original);   // [1, 1, 3, 4, 5] — original modified!

// NON-MUTATING — original stays the same
const doubled = original.map(x => x * 2);
console.log(original);   // [1, 1, 3, 4, 5] — unchanged
console.log(doubled);    // [2, 2, 6, 8, 10]

// To use mutating methods without changing original: spread first
const copy = [...original];
copy.sort((a, b) => b - a);
console.log(original);   // [1, 1, 3, 4, 5] — unchanged
console.log(copy);       // [5, 4, 3, 1, 1]
\`\`\`

## Real-World Example: Processing a Dataset

\`\`\`javascript
const students = [
    { name: "Alice",  scores: [85, 92, 78, 90], grade: "B" },
    { name: "Bob",    scores: [70, 65, 88, 72], grade: "C" },
    { name: "Carol",  scores: [95, 98, 92, 97], grade: "A" },
    { name: "David",  scores: [55, 60, 58, 62], grade: "D" },
    { name: "Eve",    scores: [88, 91, 85, 89], grade: "B" },
];

// 1. Add average to each student
const withAverages = students.map(student => ({
    ...student,   // spread existing properties
    average: student.scores.reduce((s, n) => s + n, 0) / student.scores.length,
}));

// 2. Filter to A and B grade students
const honorRoll = withAverages.filter(s => ["A", "B"].includes(s.grade));

// 3. Sort by average descending
honorRoll.sort((a, b) => b.average - a.average);

// 4. Display results
console.log("=== Honor Roll ===");
honorRoll.forEach((s, i) => {
    console.log(\`\${i + 1}. \${s.name}: \${s.average.toFixed(1)} (\${s.grade})\`);
});

// 5. Class statistics using reduce
const classStats = withAverages.reduce((stats, s) => ({
    total:   stats.total + s.average,
    count:   stats.count + 1,
    highest: Math.max(stats.highest, s.average),
    lowest:  Math.min(stats.lowest,  s.average),
}), { total: 0, count: 0, highest: -Infinity, lowest: Infinity });

console.log(\`\\nClass average: \${(classStats.total / classStats.count).toFixed(1)}\`);
console.log(\`Highest: \${classStats.highest.toFixed(1)}\`);
console.log(\`Lowest:  \${classStats.lowest.toFixed(1)}\`);
\`\`\`
`,

  fr: `# Tableaux et boucles

## Les trois grandes méthodes : map, filter, reduce

### map — Transformer chaque élément

\`\`\`javascript
const prix = [10, 20, 30, 40, 50];

// Ajouter 20% de taxe à chaque prix
const avecTaxe = prix.map(p => p * 1.2);
console.log(avecTaxe);  // [12, 24, 36, 48, 60]
console.log(prix);       // [10, 20, 30, 40, 50] — original inchangé !
\`\`\`

### filter — Garder seulement ce qui passe le test

\`\`\`javascript
const scores = [85, 42, 91, 67, 55, 78, 99, 38];

const reussite = scores.filter(s => s >= 60);
console.log(reussite);  // [85, 91, 67, 78, 99]
\`\`\`

### reduce — Réduire à une seule valeur

\`\`\`javascript
const nombres = [1, 2, 3, 4, 5];

// Somme — acc démarre à 0
const somme = nombres.reduce((acc, n) => acc + n, 0);
console.log(somme);   // 15

// Compter les occurrences
const votes = ["Alice", "Bob", "Alice", "Carol", "Alice", "Bob"];
const decompte = votes.reduce((comptes, vote) => {
    comptes[vote] = (comptes[vote] || 0) + 1;
    return comptes;
}, {});
console.log(decompte);   // { Alice: 3, Bob: 2, Carol: 1 }
\`\`\`

## Méthodes MUTATRICES vs NON-MUTATRICES

\`\`\`javascript
// MUTATRICES (modifient l'original) :
// push, pop, shift, unshift, splice, sort, reverse

// NON-MUTATRICES (retournent un nouveau tableau) :
// map, filter, reduce, slice, concat, flat, flatMap, find

// Pour utiliser sort() sans modifier l'original : copier d'abord
const original = [3, 1, 4, 1, 5];
const copie = [...original].sort((a, b) => a - b);
console.log(original);  // [3, 1, 4, 1, 5] — inchangé
console.log(copie);     // [1, 1, 3, 4, 5]
\`\`\`

## Déstructuration de tableaux

\`\`\`javascript
const rgb = [255, 128, 0];
const [r, g, b] = rgb;
console.log(r, g, b);   // 255 128 0

// Valeurs par défaut
const [x = 0, y = 0, z = 0] = [1, 2];
console.log(x, y, z);   // 1 2 0

// Reste
const [tete, ...queue] = [1, 2, 3, 4, 5];
console.log(tete);   // 1
console.log(queue);  // [2, 3, 4, 5]

// Échanger deux variables élégamment
let a = 10, b = 20;
[a, b] = [b, a];
console.log(a, b);   // 20 10
\`\`\`
`,
};

export const starterCode = {
  default: `// Arrays & Loops — Practice

// --- 1. Build arrays with Array.from ---
const oneToTen = Array.from({ length: 10 }, (_, i) => i + 1);
console.log("1 to 10:", oneToTen);

const squares = Array.from({ length: 5 }, (_, i) => (i + 1) ** 2);
console.log("Squares:", squares);

// --- 2. The big three ---
const products = [
    { name: "Laptop",  price: 999, inStock: true  },
    { name: "Phone",   price: 699, inStock: false },
    { name: "Tablet",  price: 499, inStock: true  },
    { name: "Watch",   price: 299, inStock: true  },
    { name: "Earbuds", price: 149, inStock: true  },
];

// Only in-stock products
const available = products.filter(p => p.inStock);
console.log("\\nIn-stock:", available.map(p => p.name));

// Apply 15% discount to available products
const discounted = available.map(p => ({
    ...p,
    salePrice: Math.round(p.price * 0.85),
}));
console.log("Discounted prices:");
discounted.forEach(p =>
    console.log(\`  \${p.name}: $\${p.price} → $\${p.salePrice}\`)
);

// Total value of available inventory
const totalValue = available.reduce((sum, p) => sum + p.price, 0);
console.log(\`\\nTotal inventory value: $\${totalValue}\`);

// --- 3. Sort without mutating ---
const scores = [85, 42, 91, 67, 55, 78, 99, 38];
const sorted = [...scores].sort((a, b) => b - a);   // copy first!
console.log("\\nOriginal:", scores);
console.log("Sorted:  ", sorted);

// --- 4. Destructuring ---
const [highest, second, third] = sorted;
console.log(\`\\nTop 3: \${highest}, \${second}, \${third}\`);

const [min, ...rest] = [...scores].sort((a, b) => a - b);
console.log(\`Min: \${min}, others: [\${rest.join(", ")}]\`);
`,
};

export const exerciseEn = `Array transformation challenge.

Given this dataset:
\`\`\`javascript
const employees = [
  { name: "Alice",  dept: "Engineering", salary: 95000, years: 5  },
  { name: "Bob",    dept: "Marketing",   salary: 72000, years: 3  },
  { name: "Carol",  dept: "Engineering", salary: 105000, years: 8 },
  { name: "David",  dept: "Marketing",   salary: 68000, years: 1  },
  { name: "Eve",    dept: "Engineering", salary: 88000, years: 4  },
  { name: "Frank",  dept: "HR",          salary: 65000, years: 2  },
];
\`\`\`

Using ONLY map, filter, reduce, sort (no for loops):

1. Find all Engineering employees earning > $90,000.
   Return their names only.

2. Calculate average salary per department.
   Result: { Engineering: 96000, Marketing: 70000, HR: 65000 }

3. Give everyone a raise: +2% per year of service.
   Return new array with name, oldSalary, newSalary, raise.

4. Find the employee with the most years of service.
   Return their full record.`;

export const exerciseFr = `Défi de transformation de tableaux.

En utilisant SEULEMENT map, filter, reduce, sort (pas de boucles for) :

1. Trouver tous les employés Engineering gagnant > 90 000€.
   Retourner seulement leurs noms.

2. Calculer le salaire moyen par département.

3. Donner à tout le monde une augmentation : +2% par année d'ancienneté.
   Retourner un nouveau tableau avec nom, ancienSalaire, nouveauSalaire.

4. Trouver l'employé avec le plus d'années de service.`;

export const solutionCode = {
  default: `const employees = [
  { name: "Alice",  dept: "Engineering", salary: 95000,  years: 5 },
  { name: "Bob",    dept: "Marketing",   salary: 72000,  years: 3 },
  { name: "Carol",  dept: "Engineering", salary: 105000, years: 8 },
  { name: "David",  dept: "Marketing",   salary: 68000,  years: 1 },
  { name: "Eve",    dept: "Engineering", salary: 88000,  years: 4 },
  { name: "Frank",  dept: "HR",          salary: 65000,  years: 2 },
];

// 1. High-earning engineers
const highEarners = employees
    .filter(e => e.dept === "Engineering" && e.salary > 90000)
    .map(e => e.name);
console.log("High-earning engineers:", highEarners);

// 2. Average salary by department
const avgByDept = employees.reduce((acc, e) => {
    if (!acc[e.dept]) acc[e.dept] = { total: 0, count: 0 };
    acc[e.dept].total += e.salary;
    acc[e.dept].count += 1;
    return acc;
}, {});

const deptAverages = Object.fromEntries(
    Object.entries(avgByDept).map(([dept, { total, count }]) =>
        [dept, Math.round(total / count)]
    )
);
console.log("\\nAvg salary by dept:", deptAverages);

// 3. Give everyone a raise (+2% per year)
const withRaises = employees.map(e => {
    const raiseRate  = e.years * 0.02;
    const newSalary  = Math.round(e.salary * (1 + raiseRate));
    return {
        name:       e.name,
        oldSalary:  e.salary,
        newSalary,
        raise:      newSalary - e.salary,
    };
});
console.log("\\nRaises:");
withRaises.forEach(e =>
    console.log(\`  \${e.name}: $\${e.oldSalary} → $\${e.newSalary} (+$\${e.raise})\`)
);

// 4. Most experienced employee
const mostExperienced = employees.reduce((best, e) =>
    e.years > best.years ? e : best
);
console.log("\\nMost experienced:", mostExperienced);
`,
};

export const quiz = {
  en: [
    {
      question: "What is the key difference between map and forEach?",
      options: [
        "map is faster than forEach for large arrays",
        "map returns a NEW array with each element transformed by the callback. forEach returns undefined — it only runs the callback for side effects. Use map when you want to transform data into a new array. Use forEach when you only want to do something with each element (like logging) and don't need a result.",
        "forEach can be used on strings, map only works on arrays",
        "map modifies the original array, forEach creates a copy",
      ],
      correct: 1,
    },
    {
      question:
        "Why is const arr = [3,1,2]; arr.sort() dangerous without copying first?",
      options: [
        "sort() on a const variable throws a TypeError",
        "sort() mutates the original array in place — the original order is permanently lost. Since const only prevents reassignment (not mutation), this works but silently destroys the original. Always copy first: [...arr].sort() to sort without modifying the original.",
        "sort() without a comparator function throws an error",
        "sort() on arrays with numbers always sorts alphabetically regardless",
      ],
      correct: 1,
    },
    {
      question:
        "What does reduce((acc, n) => acc + n, 0) do and what is the 0?",
      options: [
        "0 is the index to start from in the array",
        "reduce collapses the array to a single value by applying the callback repeatedly. The 0 is the INITIAL VALUE of the accumulator (acc). Without it, reduce uses the first element as the initial value which breaks on empty arrays. acc starts at 0, then for each element n, acc becomes acc+n. After all elements, reduce returns the final acc.",
        "0 means reduce only processes the first element",
        "The 0 sets the maximum value that the accumulator can reach",
      ],
      correct: 1,
    },
    {
      question:
        "What does the spread operator (...) do when used with an array?",
      options: [
        "It converts the array to a string with commas",
        "The spread operator expands an array's elements into individual values. [...a, ...b] creates a new array combining both. [...arr] creates a shallow copy. Math.max(...arr) passes each element as a separate argument. It's a non-destructive way to work with array contents.",
        "It sorts the array elements in place",
        "It removes duplicate values from the array",
      ],
      correct: 1,
    },
    {
      question:
        "What is array destructuring and what does const [first, ...rest] = arr do?",
      options: [
        "It deletes the first element from the array permanently",
        "Array destructuring unpacks array values into named variables. const [first, ...rest] = arr assigns the first element to 'first' and collects ALL remaining elements into a new array called 'rest'. If arr = [1,2,3,4,5], then first=1 and rest=[2,3,4,5]. The original array is not modified.",
        "It splits the array into two equal halves",
        "It creates a copy of the array with the first element removed",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Quelle est la différence clé entre map et forEach ?",
      options: [
        "map est plus rapide que forEach pour les grands tableaux",
        "map retourne un NOUVEAU tableau avec chaque élément transformé par le callback. forEach retourne undefined — il exécute seulement le callback pour ses effets secondaires. Utilisez map pour transformer des données. Utilisez forEach quand vous voulez seulement faire quelque chose avec chaque élément sans résultat.",
        "forEach peut être utilisé sur les chaînes, map seulement sur les tableaux",
        "map modifie le tableau original, forEach crée une copie",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi const arr = [3,1,2]; arr.sort() est-il dangereux sans copie préalable ?",
      options: [
        "sort() sur une variable const lance une TypeError",
        "sort() mute le tableau original en place — l'ordre original est perdu définitivement. Puisque const empêche seulement la réassignation (pas la mutation), cela fonctionne mais détruit silencieusement l'original. Copiez toujours d'abord : [...arr].sort().",
        "sort() sans fonction de comparaison lance une erreur",
        "sort() trie toujours alphabétiquement indépendamment du type",
      ],
      correct: 1,
    },
    {
      question:
        "Que fait reduce((acc, n) => acc + n, 0) et qu'est-ce que le 0 ?",
      options: [
        "0 est l'index à partir duquel commencer dans le tableau",
        "reduce réduit le tableau à une seule valeur en appliquant le callback répétitivement. Le 0 est la VALEUR INITIALE de l'accumulateur. Sans lui, reduce utilise le premier élément comme valeur initiale, ce qui échoue sur les tableaux vides. acc commence à 0, puis pour chaque n, acc devient acc+n.",
        "0 signifie que reduce ne traite que le premier élément",
        "Le 0 définit la valeur maximale que l'accumulateur peut atteindre",
      ],
      correct: 1,
    },
    {
      question: "Que fait l'opérateur spread (...) avec un tableau ?",
      options: [
        "Il convertit le tableau en chaîne avec des virgules",
        "L'opérateur spread étend les éléments d'un tableau en valeurs individuelles. [...a, ...b] crée un nouveau tableau combinant les deux. [...arr] crée une copie superficielle. Math.max(...arr) passe chaque élément comme argument séparé. C'est une façon non-destructive de travailler avec le contenu d'un tableau.",
        "Il trie les éléments du tableau en place",
        "Il supprime les valeurs en double du tableau",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce que la déstructuration de tableau et que fait const [premier, ...reste] = arr ?",
      options: [
        "Cela supprime définitivement le premier élément du tableau",
        "La déstructuration de tableau décompresse les valeurs en variables nommées. const [premier, ...reste] = arr assigne le premier élément à 'premier' et collecte TOUS les éléments restants dans un nouveau tableau 'reste'. Si arr = [1,2,3,4,5], alors premier=1 et reste=[2,3,4,5]. Le tableau original n'est pas modifié.",
        "Cela divise le tableau en deux moitiés égales",
        "Cela crée une copie du tableau avec le premier élément supprimé",
      ],
      correct: 1,
    },
  ],
};
