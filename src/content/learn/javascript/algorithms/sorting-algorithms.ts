export const id = "sorting-algorithms";
export const titleEn = "Sorting Algorithms";
export const titleFr = "Algorithmes de tri";

export const content = {
  en: `# Sorting Algorithms

## Why Learn Sorting If JavaScript Has .sort()?

JavaScript's built-in \`Array.sort()\` is excellent — you should use it in production. But understanding the algorithms behind sorting teaches you pattern recognition that applies everywhere: divide and conquer, in-place mutation, stability, trade-offs between time and space. Every algorithm you'll ever write borrows from these patterns.

Also: \`Array.sort()\` has a crucial gotcha that trips up every JavaScript beginner.

\`\`\`javascript
// The .sort() gotcha — it sorts as STRINGS by default!
const numbers = [10, 1, 21, 2, 100, 3];
numbers.sort();
console.log(numbers);   // [1, 10, 100, 2, 21, 3] — WRONG!
// "10" < "2" alphabetically because "1" < "2"

// ALWAYS provide a comparator for numbers:
numbers.sort((a, b) => a - b);   // ascending
console.log(numbers);            // [1, 2, 3, 10, 21, 100] ✓

// How the comparator works:
// return negative → a comes first
// return positive → b comes first
// return 0        → order unchanged
\`\`\`

## Bubble Sort — The Simplest, Slowest Sort

Bubble sort repeatedly steps through the array, comparing adjacent elements and swapping them if they're in the wrong order. Larger elements "bubble up" to the end.

\`\`\`javascript
function bubbleSort(arr) {
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        // After each pass, the largest unsorted element is at the end
        // So we don't need to check the last i elements
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap adjacent elements
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

console.log(bubbleSort([64, 25, 12, 22, 11]));
// [11, 12, 22, 25, 64]
\`\`\`

**Why it's O(N²):** Two nested loops, each running up to N times. For N=10,000 that's 100 million comparisons.

**Optimized bubble sort** — stop early if no swaps happened (array is already sorted):

\`\`\`javascript
function bubbleSortOptimized(arr) {
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        let swapped = false;

        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }

        // If no swap happened this pass, array is sorted — stop early
        if (!swapped) break;
    }
    return arr;
}

// Already sorted input: O(N) — one pass, no swaps, done.
console.log(bubbleSortOptimized([1, 2, 3, 4, 5]));
\`\`\`

## Selection Sort — Find the Minimum, Place It

Selection sort divides the array into sorted (left) and unsorted (right) portions. Each pass finds the minimum in the unsorted portion and places it at the boundary.

\`\`\`javascript
function selectionSort(arr) {
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        // Find the index of the minimum element in arr[i..n-1]
        let minIndex = i;

        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }

        // Place minimum at position i (only swap if needed)
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        }
    }
    return arr;
}

console.log(selectionSort([64, 25, 12, 22, 11]));
// [11, 12, 22, 25, 64]

// Trace for [64, 25, 12, 22, 11]:
// Pass 0: min=11 at index 4 → swap with index 0 → [11, 25, 12, 22, 64]
// Pass 1: min=12 at index 2 → swap with index 1 → [11, 12, 25, 22, 64]
// Pass 2: min=22 at index 3 → swap with index 2 → [11, 12, 22, 25, 64]
// Pass 3: min=25 at index 3 → swap with index 3 → [11, 12, 22, 25, 64]
\`\`\`

**Selection sort makes at most N-1 swaps** — useful when swapping is expensive. Still O(N²) comparisons.

## Insertion Sort — Build Sorted Array One Element at a Time

Insertion sort builds the sorted array from left to right. Each new element is inserted into its correct position among the already-sorted elements to its left — like sorting playing cards in your hand.

\`\`\`javascript
function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        const current = arr[i];  // the element we're inserting
        let j = i - 1;

        // Shift elements right until we find where 'current' belongs
        while (j >= 0 && arr[j] > current) {
            arr[j + 1] = arr[j];  // shift right
            j--;
        }

        arr[j + 1] = current;  // place 'current' in its correct spot
    }
    return arr;
}

console.log(insertionSort([5, 3, 8, 1, 9, 2]));
// [1, 2, 3, 5, 8, 9]

// Trace for [5, 3, 8, 1]:
// i=1: current=3. arr[0]=5 > 3 → shift 5 right. Insert 3 at 0. → [3, 5, 8, 1]
// i=2: current=8. arr[1]=5 < 8 → stop. Insert 8 at 2. → [3, 5, 8, 1]
// i=3: current=1. arr[2]=8>1, arr[1]=5>1, arr[0]=3>1 → shift all. Insert 1 at 0. → [1, 3, 5, 8]
\`\`\`

**Insertion sort is O(N) for nearly-sorted data** — the while loop barely runs. This is why JavaScript's Timsort (V8's sort) uses insertion sort for small arrays and nearly-sorted chunks.

\`\`\`javascript
// Adaptive: fast for nearly-sorted input
const nearlySorted = [1, 2, 3, 5, 4, 6, 7, 8];   // one swap needed
console.log(insertionSort(nearlySorted));
// Just one shift: O(N) in practice
\`\`\`

## Merge Sort — Divide, Sort, Combine

Merge sort is the first **O(N log N)** algorithm. The idea is elegant: split the array in half, sort each half recursively, then merge the two sorted halves.

\`\`\`javascript
function mergeSort(arr) {
    // BASE CASE: arrays of 0 or 1 element are already sorted
    if (arr.length <= 1) return arr;

    // DIVIDE: split in half
    const mid   = Math.floor(arr.length / 2);
    const left  = arr.slice(0, mid);
    const right = arr.slice(mid);

    // CONQUER: recursively sort each half
    const sortedLeft  = mergeSort(left);
    const sortedRight = mergeSort(right);

    // COMBINE: merge the two sorted halves
    return merge(sortedLeft, sortedRight);
}

function merge(left, right) {
    const result = [];
    let i = 0;  // pointer into left
    let j = 0;  // pointer into right

    // Compare front of each and take the smaller
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }

    // One array is exhausted — append remainder of the other
    // (it's already sorted so we can just append)
    while (i < left.length)  result.push(left[i++]);
    while (j < right.length) result.push(right[j++]);

    return result;
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
// [3, 9, 10, 27, 38, 43, 82]
\`\`\`

**Why O(N log N)?**

\`\`\`
Each level of recursion does O(N) total work (merging).
There are O(log N) levels (halving each time).
Total: O(N) × O(log N) = O(N log N)

Level 0: [38, 27, 43, 3, 9, 82, 10]   ← 1 array of N
Level 1: [38, 27, 43] [3, 9, 82, 10]  ← 2 arrays of N/2
Level 2: [38,27][43] [3,9][82,10]     ← 4 arrays of N/4
Level 3: [38][27][43][3][9][82][10]   ← N arrays of 1 (base case)
Then merge back up — each level does N total comparisons.
\`\`\`

**Merge sort is STABLE** — equal elements maintain their original relative order. This matters when sorting objects by one field.

\`\`\`javascript
// Stable sort: sort by age, preserve name order for same age
const people = [
    { name: "Alice", age: 30 },
    { name: "Bob",   age: 25 },
    { name: "Carol", age: 30 },
    { name: "David", age: 25 },
];

// Stable sort preserves Alice before Carol (both 30), Bob before David (both 25)
const sorted = mergeSort([...people.map((p, i) => ({ ...p, i }))]);
// With a custom comparator (merge sort modified for objects):
function mergeSortBy(arr, key) {
    if (arr.length <= 1) return arr;
    const mid   = Math.floor(arr.length / 2);
    const left  = mergeSortBy(arr.slice(0, mid),  key);
    const right = mergeSortBy(arr.slice(mid),      key);
    return mergeBy(left, right, key);
}

function mergeBy(left, right, key) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        // <= preserves stability (equal elements: left comes first)
        if (left[i][key] <= right[j][key]) result.push(left[i++]);
        else                               result.push(right[j++]);
    }
    return [...result, ...left.slice(i), ...right.slice(j)];
}

console.log(mergeSortBy(people, "age").map(p => p.name));
// ["Bob", "David", "Alice", "Carol"] — Bob before David, Alice before Carol ✓
\`\`\`

## Quick Sort — Fast in Practice, Tricky to Implement

Quick sort is usually the fastest sorting algorithm in practice. It picks a **pivot**, partitions the array into elements smaller and larger than the pivot, then recursively sorts each partition.

\`\`\`javascript
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        // Partition: returns final position of pivot
        const pivotIndex = partition(arr, low, high);

        // Recursively sort elements before and after pivot
        quickSort(arr, low,           pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    const pivot = arr[high];   // choose last element as pivot
    let i = low - 1;           // i tracks the boundary of "less than pivot"

    for (let j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];   // swap smaller to left
        }
    }

    // Place pivot in its final sorted position
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}

console.log(quickSort([10, 7, 8, 9, 1, 5]));
// [1, 5, 7, 8, 9, 10]
\`\`\`

**How partition works** (step by step for [3, 6, 8, 10, 1, 2, 1], pivot=1):

\`\`\`
pivot = 1 (last element)
i = -1

j=0: arr[0]=3 > 1, no swap
j=1: arr[1]=6 > 1, no swap
j=2: arr[2]=8 > 1, no swap
j=3: arr[3]=10 > 1, no swap
j=4: arr[4]=1 ≤ 1 → i=0, swap arr[0] and arr[4] → [1, 6, 8, 10, 3, 2, 1]
j=5: arr[5]=2 > 1, no swap

Place pivot: swap arr[i+1]=arr[1] with arr[high]=arr[6]
→ [1, 1, 8, 10, 3, 2, 6]
pivot is now at index 1 — everything left of it ≤ 1, right > 1 ✓
\`\`\`

**Average case: O(N log N)** — pivot splits array roughly in half each time.
**Worst case: O(N²)** — when pivot is always the smallest or largest (already sorted input).

\`\`\`javascript
// Randomized pivot — prevents worst case with sorted input
function quickSortRandom(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        // Pick random pivot and swap to end
        const randIndex = low + Math.floor(Math.random() * (high - low + 1));
        [arr[randIndex], arr[high]] = [arr[high], arr[randIndex]];

        const pivotIndex = partition(arr, low, high);
        quickSortRandom(arr, low,            pivotIndex - 1);
        quickSortRandom(arr, pivotIndex + 1, high);
    }
    return arr;
}
\`\`\`

## The Cleanest Functional Quick Sort

There's a beautiful one-liner quick sort using filter — not O(N log N) space-wise, but perfect for clarity:

\`\`\`javascript
const quickSortFunctional = arr => {
    if (arr.length <= 1) return arr;

    const [pivot, ...rest] = arr;    // first element as pivot, rest is the array
    const left  = rest.filter(x => x <= pivot);
    const right = rest.filter(x => x >  pivot);

    return [
        ...quickSortFunctional(left),
        pivot,
        ...quickSortFunctional(right),
    ];
};

console.log(quickSortFunctional([3, 6, 8, 10, 1, 2, 1]));
// [1, 1, 2, 3, 6, 8, 10]
\`\`\`

## JavaScript's Built-in Sort — How It Really Works

\`\`\`javascript
// V8 (Chrome/Node.js) uses Timsort — a hybrid of merge sort and insertion sort
// TimSort is:
// - O(N log N) worst case
// - O(N) for already-sorted or nearly-sorted data
// - Stable (preserves order of equal elements)
// - Adaptive (uses insertion sort for small arrays < 64 elements)

// Sorting NUMBERS — always provide comparator
const nums = [10, 2, 30, 4, 50];
nums.sort((a, b) => a - b);   // ascending ✓
nums.sort((a, b) => b - a);   // descending ✓

// Sorting STRINGS — default is fine (lexicographic)
const words = ["banana", "apple", "cherry"];
words.sort();   // ["apple", "banana", "cherry"] ✓

// Sorting STRINGS with locale awareness
const names = ["Ångström", "apple", "Banana", "éclair"];
names.sort();                                  // ["Banana", "apple", "Ångström", "éclair"] ← ASCII order, wrong!
names.sort((a, b) => a.localeCompare(b));      // ["Ångström", "apple", "Banana", "éclair"] ✓

// Sorting OBJECTS — by a single property
const people = [
    { name: "Charlie", age: 30 },
    { name: "Alice",   age: 25 },
    { name: "Bob",     age: 35 },
];

// By age ascending
people.sort((a, b) => a.age - b.age);
console.log(people.map(p => p.name));   // ["Alice", "Charlie", "Bob"]

// By name alphabetically
people.sort((a, b) => a.name.localeCompare(b.name));
console.log(people.map(p => p.name));   // ["Alice", "Bob", "Charlie"]

// Multi-key sort: by age, then name for ties
people.sort((a, b) => {
    if (a.age !== b.age) return a.age - b.age;   // primary: age
    return a.name.localeCompare(b.name);           // secondary: name
});
\`\`\`

## Sorting Stability — Why It Matters

**Stable** means equal elements maintain their original relative order after sorting.

\`\`\`javascript
const employees = [
    { name: "Alice",  dept: "Engineering", salary: 95000 },
    { name: "Bob",    dept: "Marketing",   salary: 72000 },
    { name: "Carol",  dept: "Engineering", salary: 88000 },
    { name: "David",  dept: "Marketing",   salary: 68000 },
];

// Sort by department (stable sort — Alice stays before Carol, Bob before David)
employees.sort((a, b) => a.dept.localeCompare(b.dept));
console.log(employees.map(e => \`\${e.dept}: \${e.name}\`));
// Engineering: Alice
// Engineering: Carol
// Marketing: Bob
// Marketing: David

// Now sort by salary within department (multi-key):
employees.sort((a, b) => {
    if (a.dept !== b.dept) return a.dept.localeCompare(b.dept);
    return a.salary - b.salary;
});
console.log(employees.map(e => \`\${e.dept}: \${e.name} ($\${e.salary})\`));
// Engineering: Carol ($88,000)
// Engineering: Alice ($95,000)
// Marketing: David ($68,000)
// Marketing: Bob ($72,000)

// JavaScript's .sort() is stable in all modern engines (guaranteed by spec since ES2019)
\`\`\`

## Comparison Chart

\`\`\`
Algorithm       Best     Average   Worst    Space    Stable   Use When
────────────────────────────────────────────────────────────────────────
Bubble Sort     O(N)     O(N²)     O(N²)    O(1)     Yes      Learning only
Selection Sort  O(N²)    O(N²)     O(N²)    O(1)     No       Min swaps needed
Insertion Sort  O(N)     O(N²)     O(N²)    O(1)     Yes      Nearly sorted, small N
Merge Sort      O(N logN)O(N logN) O(N logN)O(N)     Yes      Need stability, linked lists
Quick Sort      O(N logN)O(N logN) O(N²)    O(logN)  No       General purpose, cache-friendly
Timsort (JS)    O(N)     O(N logN) O(N logN)O(N)     Yes      Real-world data (use this!)
────────────────────────────────────────────────────────────────────────
In JavaScript: always use .sort() with a comparator. Implement yourself
only for learning or highly specialized use cases.
\`\`\`
`,

  fr: `# Algorithmes de tri

## Le piège .sort() de JavaScript

\`\`\`javascript
// .sort() sans comparateur trie comme des CHAÎNES — piège classique !
const nombres = [10, 1, 21, 2, 100];
nombres.sort();
console.log(nombres);   // [1, 10, 100, 2, 21] — FAUX !

// Toujours fournir un comparateur pour les nombres :
nombres.sort((a, b) => a - b);   // croissant ✓
nombres.sort((a, b) => b - a);   // décroissant ✓
\`\`\`

## Tri par fusion (Merge Sort) — O(N log N)

\`\`\`javascript
function trierParFusion(arr) {
    if (arr.length <= 1) return arr;

    const milieu = Math.floor(arr.length / 2);
    const gauche = trierParFusion(arr.slice(0, milieu));
    const droite = trierParFusion(arr.slice(milieu));

    return fusionner(gauche, droite);
}

function fusionner(gauche, droite) {
    const resultat = [];
    let i = 0, j = 0;
    while (i < gauche.length && j < droite.length) {
        if (gauche[i] <= droite[j]) resultat.push(gauche[i++]);
        else                         resultat.push(droite[j++]);
    }
    return [...resultat, ...gauche.slice(i), ...droite.slice(j)];
}

console.log(trierParFusion([38, 27, 43, 3, 9]));
// [3, 9, 27, 38, 43]
\`\`\`

## Trier des objets en JavaScript

\`\`\`javascript
const personnes = [
    { nom: "Charlie", age: 30 },
    { nom: "Alice",   age: 25 },
    { nom: "Bob",     age: 35 },
];

// Par âge
personnes.sort((a, b) => a.age - b.age);

// Par nom (avec locale)
personnes.sort((a, b) => a.nom.localeCompare(b.nom));

// Tri multi-clés : âge puis nom pour les égalités
personnes.sort((a, b) => {
    if (a.age !== b.age) return a.age - b.age;
    return a.nom.localeCompare(b.nom);
});
\`\`\`
`,
};

export const starterCode = {
  default: `// Sorting Algorithms — JavaScript Practice

// ─── Implementations ──────────────────────────────────────
function bubbleSort(arr) {
    const a = [...arr];
    for (let i = 0; i < a.length - 1; i++) {
        let swapped = false;
        for (let j = 0; j < a.length - i - 1; j++) {
            if (a[j] > a[j + 1]) {
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return a;
}

function insertionSort(arr) {
    const a = [...arr];
    for (let i = 1; i < a.length; i++) {
        const current = a[i];
        let j = i - 1;
        while (j >= 0 && a[j] > current) { a[j + 1] = a[j]; j--; }
        a[j + 1] = current;
    }
    return a;
}

function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid  = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length)
        result.push(left[i] <= right[j] ? left[i++] : right[j++]);
    return [...result, ...left.slice(i), ...right.slice(j)];
}

// ─── Correctness test ────────────────────────────────────
const test = [64, 34, 25, 12, 22, 11, 90];
const expected = [...test].sort((a, b) => a - b);

console.log("=== Correctness ===");
["bubbleSort", "insertionSort", "mergeSort"].forEach(name => {
    const fn = { bubbleSort, insertionSort, mergeSort }[name];
    const result = fn(test);
    const ok = JSON.stringify(result) === JSON.stringify(expected);
    console.log(\`  \${name}: \${ok ? "✓" : "✗"} → [\${result}]\`);
});

// ─── Real-world: sort objects ─────────────────────────────
console.log("\\n=== Sorting Products ===");
const products = [
    { name: "Laptop",  price: 999, rating: 4.2 },
    { name: "Phone",   price: 699, rating: 4.7 },
    { name: "Tablet",  price: 499, rating: 4.5 },
    { name: "Monitor", price: 349, rating: 4.1 },
    { name: "Earbuds", price: 149, rating: 4.6 },
];

const byPrice   = [...products].sort((a, b) => a.price - b.price);
const byRating  = [...products].sort((a, b) => b.rating - a.rating);
const byNameLen = [...products].sort((a, b) => a.name.length - b.name.length);

console.log("By price (asc):");
byPrice.forEach(p => console.log(\`  $\${p.price} — \${p.name}\`));

console.log("\\nBy rating (desc):");
byRating.forEach(p => console.log(\`  \${p.rating}★ — \${p.name}\`));

// ─── Multi-key sort ───────────────────────────────────────
console.log("\\n=== Multi-Key Sort (dept → salary) ===");
const employees = [
    { name: "Alice",  dept: "Eng", salary: 95000 },
    { name: "Bob",    dept: "Mkt", salary: 72000 },
    { name: "Carol",  dept: "Eng", salary: 88000 },
    { name: "David",  dept: "Mkt", salary: 68000 },
    { name: "Eve",    dept: "Eng", salary: 105000 },
];

employees
    .sort((a, b) => {
        if (a.dept !== b.dept) return a.dept.localeCompare(b.dept);
        return a.salary - b.salary;
    })
    .forEach(e => console.log(\`  \${e.dept} | \${e.name} | $\${e.salary.toLocaleString()}\`));
`,
};

export const exerciseEn = `Sorting challenges.

1. Write a function 'sortByMultipleKeys(array, keys)' where keys is an
   array of { key, direction } objects.
   sortByMultipleKeys(employees, [
     { key: "dept", direction: "asc" },
     { key: "salary", direction: "desc" }
   ])
   Should sort by dept ascending, then salary descending within each dept.

2. Implement 'countingSort(arr)' for arrays of non-negative integers.
   Counting sort is O(N + K) where K is the max value — faster than
   O(N log N) when K is small relative to N.
   Hint: count occurrences, then reconstruct array from counts.

3. Write a function 'sortStable(array, comparator)' that guarantees
   stability even in environments that don't have stable sort.
   Hint: add original index to each element, use it as a tiebreaker.

4. Given an array of version strings like ["1.0.10", "1.0.9", "2.1.0"],
   sort them correctly by semantic version (major.minor.patch).
   "1.0.10" should come AFTER "1.0.9", not before.`;

export const exerciseFr = `Défis de tri.

1. Écrivez 'trierParPlusieursClés(tableau, clés)' où clés est un tableau
   de { clé, direction }.

2. Implémentez 'triComptage(arr)' pour les entiers non-négatifs.
   O(N + K) où K est la valeur max.

3. Écrivez 'trierStable(tableau, comparateur)' qui garantit la stabilité.
   Astuce : ajouter l'index original comme critère de départage.

4. Triez des chaînes de version sémantique : ["1.0.10", "1.0.9", "2.1.0"]
   correctement (1.0.10 doit venir APRÈS 1.0.9).`;

export const solutionCode = {
  default: `// 1. Sort by multiple keys
function sortByMultipleKeys(array, keys) {
    return [...array].sort((a, b) => {
        for (const { key, direction } of keys) {
            const dir = direction === "desc" ? -1 : 1;
            if (typeof a[key] === "string") {
                const cmp = a[key].localeCompare(b[key]);
                if (cmp !== 0) return cmp * dir;
            } else {
                const diff = a[key] - b[key];
                if (diff !== 0) return diff * dir;
            }
        }
        return 0;
    });
}

const employees = [
    { name: "Alice",  dept: "Eng", salary: 95000  },
    { name: "Bob",    dept: "Mkt", salary: 72000  },
    { name: "Carol",  dept: "Eng", salary: 88000  },
    { name: "David",  dept: "Mkt", salary: 68000  },
    { name: "Eve",    dept: "Eng", salary: 105000 },
];

const sorted = sortByMultipleKeys(employees, [
    { key: "dept",   direction: "asc"  },
    { key: "salary", direction: "desc" },
]);

console.log("=== Multi-key sort ===");
sorted.forEach(e => console.log(\`  \${e.dept} | \${e.name} | $\${e.salary.toLocaleString()}\`));

// 2. Counting sort — O(N + K)
function countingSort(arr) {
    if (arr.length === 0) return [];
    const max   = Math.max(...arr);
    const count = new Array(max + 1).fill(0);

    // Count occurrences
    for (const n of arr) count[n]++;

    // Reconstruct sorted array
    const result = [];
    for (let i = 0; i <= max; i++) {
        for (let c = 0; c < count[i]; c++) {
            result.push(i);
        }
    }
    return result;
}

console.log("\\n=== Counting sort ===");
const ages = [25, 30, 25, 18, 30, 25, 40, 18];
console.log("Input:",  ages);
console.log("Sorted:", countingSort(ages));

// 3. Guaranteed stable sort
function sortStable(array, comparator) {
    // Tag each element with its original index
    return array
        .map((item, index) => ({ item, index }))
        .sort((a, b) => {
            const cmp = comparator(a.item, b.item);
            return cmp !== 0 ? cmp : a.index - b.index;  // index as tiebreaker
        })
        .map(({ item }) => item);
}

const items = [
    { name: "A", group: 1 }, { name: "B", group: 2 },
    { name: "C", group: 1 }, { name: "D", group: 2 },
];

console.log("\\n=== Stable sort ===");
const stableSorted = sortStable(items, (a, b) => a.group - b.group);
console.log(stableSorted.map(x => \`\${x.group}:\${x.name}\`).join(", "));
// 1:A, 1:C, 2:B, 2:D  ← A before C, B before D (original order preserved)

// 4. Semantic version sort
function sortVersions(versions) {
    return [...versions].sort((a, b) => {
        const partsA = a.split(".").map(Number);
        const partsB = b.split(".").map(Number);
        for (let i = 0; i < 3; i++) {
            const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
            if (diff !== 0) return diff;
        }
        return 0;
    });
}

console.log("\\n=== Semantic version sort ===");
const versions = ["1.0.10", "1.0.9", "2.1.0", "1.2.0", "1.0.1", "2.0.0"];
console.log("Input:",  versions.join(", "));
console.log("Sorted:", sortVersions(versions).join(", "));
// 1.0.1, 1.0.9, 1.0.10, 1.2.0, 2.0.0, 2.1.0
`,
};

export const quiz = {
  en: [
    {
      question: "Why does Array.sort() produce wrong results for numbers without a comparator?",
      options: [
        "Array.sort() is not designed for numbers — it only works on strings",
        "Without a comparator, sort() converts elements to strings and sorts them lexicographically (dictionary order). '10' comes before '2' because '1' < '2' as characters, even though 10 > 2 numerically. Always provide (a, b) => a - b for ascending numeric sort.",
        "Array.sort() uses a random algorithm that gives unpredictable results",
        "The result depends on the browser — each engine implements it differently"
      ],
      correct: 1,
    },
    {
      question: "What makes merge sort's time complexity O(N log N)?",
      options: [
        "Merge sort uses binary search during the merge step which adds log N",
        "Merge sort recursively splits the array in half — creating O(log N) levels of recursion. At each level, merging all arrays requires O(N) total comparisons. Since every level does O(N) work and there are O(log N) levels, the total is O(N) × O(log N) = O(N log N).",
        "The sort is O(N²) but the merge is O(log N), averaging to O(N log N)",
        "The recursion tree has N nodes and each has log N children"
      ],
      correct: 1,
    },
    {
      question: "What is a stable sort and why does it matter?",
      options: [
        "A stable sort always produces the same result regardless of hardware",
        "A stable sort preserves the relative order of equal elements from the original array. It matters when sorting objects by one field — if you sort by department and two employees have the same department, a stable sort keeps them in their original relative order. JavaScript's built-in sort has been guaranteed stable since ES2019.",
        "A stable sort never throws an error regardless of input",
        "A stable sort has the same complexity in best, average, and worst cases"
      ],
      correct: 1,
    },
    {
      question: "Why is insertion sort faster than merge sort for nearly-sorted arrays?",
      options: [
        "Insertion sort uses less memory, which reduces cache misses",
        "Insertion sort's inner while loop is adaptive — it stops as soon as it finds the correct position. For nearly-sorted data, each element needs only 0-1 shifts, making each outer iteration O(1). Total: O(N). Merge sort always splits and merges regardless of how sorted the data is — always O(N log N). This is why Timsort (V8) uses insertion sort for small or nearly-sorted chunks.",
        "Insertion sort has a smaller constant factor because it avoids recursion",
        "Merge sort degrades to O(N²) for nearly-sorted arrays"
      ],
      correct: 1,
    },
    {
      question: "What is quick sort's worst case and how do you avoid it?",
      options: [
        "Quick sort's worst case is O(N log N) which is unavoidable",
        "Quick sort's worst case is O(N²) — it occurs when the pivot is always the smallest or largest element, causing one partition to have N-1 elements and the other 0. This happens with already-sorted input if you always pick the first or last element as pivot. Fix: choose a random pivot (randomized quicksort), making the worst case astronomically unlikely in practice.",
        "The worst case happens when all elements are equal — use selection sort instead",
        "Quick sort's worst case is O(N²) only on reverse-sorted arrays, not sorted ones"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Pourquoi Array.sort() produit-il de mauvais résultats pour les nombres sans comparateur ?",
      options: [
        "Array.sort() n'est pas conçu pour les nombres",
        "Sans comparateur, sort() convertit les éléments en chaînes et les trie lexicographiquement. '10' vient avant '2' car '1' < '2' comme caractères, même si 10 > 2 numériquement. Fournissez toujours (a, b) => a - b pour un tri numérique croissant.",
        "Array.sort() utilise un algorithme aléatoire",
        "Le résultat dépend du navigateur"
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce qui rend la complexité temporelle du tri par fusion O(N log N) ?",
      options: [
        "Le tri par fusion utilise la recherche binaire lors de la fusion",
        "Le tri par fusion divise récursivement le tableau en deux — créant O(log N) niveaux de récursion. À chaque niveau, la fusion de tous les tableaux nécessite O(N) comparaisons au total. Puisque chaque niveau fait O(N) de travail et il y a O(log N) niveaux, le total est O(N log N).",
        "Le tri est O(N²) mais la fusion est O(log N), donnant en moyenne O(N log N)",
        "L'arbre de récursion a N nœuds avec log N enfants chacun"
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce qu'un tri stable et pourquoi est-ce important ?",
      options: [
        "Un tri stable produit toujours le même résultat quel que soit le matériel",
        "Un tri stable préserve l'ordre relatif des éléments égaux du tableau original. C'est important pour trier des objets par un champ — si deux employés ont le même département, un tri stable conserve leur ordre relatif original. Le sort() de JavaScript est garanti stable depuis ES2019.",
        "Un tri stable ne lance jamais d'erreur quelle que soit l'entrée",
        "Un tri stable a la même complexité dans les meilleurs, moyens et pires cas"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi le tri par insertion est-il plus rapide que le tri par fusion pour les tableaux presque triés ?",
      options: [
        "Le tri par insertion utilise moins de mémoire, réduisant les échecs de cache",
        "La boucle while interne du tri par insertion est adaptative — elle s'arrête dès qu'elle trouve la bonne position. Pour des données presque triées, chaque élément nécessite 0-1 décalages, rendant chaque itération O(1). Total : O(N). Le tri par fusion divise et fusionne toujours — toujours O(N log N).",
        "Le tri par insertion a un facteur constant plus petit car il évite la récursion",
        "Le tri par fusion dégrade à O(N²) pour les tableaux presque triés"
      ],
      correct: 1,
    },
    {
      question: "Quel est le pire cas du tri rapide et comment l'éviter ?",
      options: [
        "Le pire cas du tri rapide est O(N log N) qui est inévitable",
        "Le pire cas du tri rapide est O(N²) — il se produit quand le pivot est toujours le plus petit ou le plus grand élément, causant une partition avec N-1 éléments et l'autre avec 0. Cela arrive avec une entrée déjà triée si vous choisissez toujours le premier ou dernier élément comme pivot. Fix : choisir un pivot aléatoire.",
        "Le pire cas se produit quand tous les éléments sont égaux",
        "Le pire cas est O(N²) seulement pour les tableaux triés en sens inverse"
      ],
      correct: 1,
    },
  ],
};
