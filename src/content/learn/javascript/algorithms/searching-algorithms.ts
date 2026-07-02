export const id = "searching-algorithms";
export const titleEn = "Searching Algorithms";
export const titleFr = "Algorithmes de recherche";

export const content = {
  en: `# Searching Algorithms

## The Core Question: How Do You Find Something?

Every application searches for data constantly — finding a user by ID, checking if a username exists, locating a product in a catalog. The algorithm you choose determines whether that operation takes 1 millisecond or 10 seconds.

\`\`\`javascript
// The same problem — four completely different performance profiles:

const users = Array.from({ length: 1_000_000 }, (_, i) => ({
    id: i, name: \`User\${i}\`, active: i % 3 !== 0
}));

// O(N) — scan every element
const byLinear   = users.find(u => u.id === 999_999);

// O(log N) — binary search (requires sorted array)
const bySorted   = binarySearch(users, 999_999);

// O(1) — hash map lookup
const byId       = new Map(users.map(u => [u.id, u]));
const byHash     = byId.get(999_999);

// O(1) — direct index
const byIndex    = users[999_999];

// All return the same result.
// Performance at N=1,000,000:
//   Linear:  up to 1,000,000 comparisons
//   Binary:  ~20 comparisons
//   Hash:    ~1 comparison
//   Index:   exactly 1 operation
\`\`\`

## Linear Search — O(N)

Linear search checks every element until it finds a match. It's the only option when your data is **unsorted** or when you're searching by a complex condition.

\`\`\`javascript
// Basic linear search — find first match
function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;   // found — return index
    }
    return -1;   // not found
}

console.log(linearSearch([3, 1, 4, 1, 5, 9, 2, 6], 5));   // 4
console.log(linearSearch([3, 1, 4, 1, 5, 9, 2, 6], 7));   // -1

// Linear search on objects — searching by condition
function findUser(users, predicate) {
    for (const user of users) {
        if (predicate(user)) return user;
    }
    return null;
}

const users = [
    { id: 1, name: "Alice",  role: "admin",  active: true  },
    { id: 2, name: "Bob",    role: "user",   active: false },
    { id: 3, name: "Carol",  role: "user",   active: true  },
    { id: 4, name: "David",  role: "admin",  active: true  },
];

// JavaScript's built-in find() is exactly linear search:
const admin = users.find(u => u.role === "admin" && u.active);
console.log(admin);   // { id: 1, name: "Alice", ... }

// findIndex returns the index instead of the element
const idx = users.findIndex(u => u.name === "Carol");
console.log(idx);   // 2
\`\`\`

### Find All Matches

\`\`\`javascript
// filter() is linear search that collects ALL matches
function findAll(arr, predicate) {
    return arr.filter(predicate);
}

const activeUsers = users.filter(u => u.active);
const admins      = users.filter(u => u.role === "admin");

console.log(activeUsers.map(u => u.name));   // ["Alice", "Carol", "David"]
console.log(admins.map(u => u.name));         // ["Alice", "David"]

// every() and some() are also linear searches with early exit
const allActive  = users.every(u => u.active);   // false (Bob is inactive)
const someActive = users.some(u => u.active);     // true (Alice is active)
\`\`\`

### When Linear Search Is the Right Choice

\`\`\`javascript
// 1. Unsorted data — binary search requires sorted input
const unsorted = [42, 7, 19, 3, 85, 11];
// Must use linear search — no sorting overhead for a one-time search

// 2. Complex conditions — can't binary search by multiple criteria at once
const found = products.find(p =>
    p.price < 500 && p.rating > 4.5 && p.inStock && p.category === "Electronics"
);

// 3. Small arrays — for N < ~100, linear search is fast enough
// The overhead of building a hash map outweighs the benefit

// 4. Searching linked data structures (linked lists, trees without indexes)
\`\`\`

## Binary Search — O(log N)

Binary search works by repeatedly halving the search space. Each comparison eliminates half the remaining candidates. It requires the array to be **sorted**.

\`\`\`javascript
// The mental model:
// Guess the page a word is on in a dictionary.
// Open to the middle — is your word before or after?
// If before: search only the left half.
// If after: search only the right half.
// Repeat — each guess eliminates half the remaining pages.
// A 1000-page dictionary needs at most 10 guesses. log₂(1000) ≈ 10.

function binarySearch(sortedArr, target) {
    let left  = 0;
    let right = sortedArr.length - 1;

    while (left <= right) {
        // Calculate midpoint — avoid integer overflow (important in other languages)
        const mid = Math.floor((left + right) / 2);

        if (sortedArr[mid] === target) {
            return mid;          // found — return index
        } else if (sortedArr[mid] < target) {
            left = mid + 1;      // target is in the RIGHT half
        } else {
            right = mid - 1;     // target is in the LEFT half
        }
    }

    return -1;   // not found
}

const sorted = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];

console.log(binarySearch(sorted, 7));    // 3
console.log(binarySearch(sorted, 13));   // 6
console.log(binarySearch(sorted, 4));    // -1

// Trace for binarySearch(sorted, 7):
// left=0, right=9 → mid=4, arr[4]=9  > 7 → right=3
// left=0, right=3 → mid=1, arr[1]=3  < 7 → left=2
// left=2, right=3 → mid=2, arr[2]=5  < 7 → left=3
// left=3, right=3 → mid=3, arr[3]=7 === 7 → return 3 ✓
// 4 comparisons for an array of 10! (log₂ 10 ≈ 3.32)
\`\`\`

### Binary Search Variations

\`\`\`javascript
// Find FIRST occurrence (in case of duplicates)
function binarySearchFirst(sortedArr, target) {
    let left   = 0;
    let right  = sortedArr.length - 1;
    let result = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (sortedArr[mid] === target) {
            result = mid;       // found it — but keep searching LEFT
            right  = mid - 1;  // there might be an earlier occurrence
        } else if (sortedArr[mid] < target) {
            left  = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return result;
}

// Find LAST occurrence
function binarySearchLast(sortedArr, target) {
    let left   = 0;
    let right  = sortedArr.length - 1;
    let result = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (sortedArr[mid] === target) {
            result = mid;       // found it — but keep searching RIGHT
            left   = mid + 1;  // there might be a later occurrence
        } else if (sortedArr[mid] < target) {
            left  = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return result;
}

const withDups = [1, 3, 3, 3, 5, 7, 7, 9];
console.log(binarySearchFirst(withDups, 3));   // 1 (first 3)
console.log(binarySearchLast(withDups,  3));   // 3 (last 3)
console.log(binarySearchFirst(withDups, 7));   // 5 (first 7)
console.log(binarySearchLast(withDups,  7));   // 6 (last 7)
\`\`\`

### Find the Insertion Point

\`\`\`javascript
// Where would target go to keep the array sorted?
// (This is Python's bisect_left — very useful for maintaining sorted arrays)
function searchInsertPosition(sortedArr, target) {
    let left  = 0;
    let right = sortedArr.length;  // note: right = length (not length-1)

    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (sortedArr[mid] < target) left  = mid + 1;
        else                          right = mid;
    }
    return left;
}

const arr = [1, 3, 5, 6];
console.log(searchInsertPosition(arr, 5));   // 2 (already exists at index 2)
console.log(searchInsertPosition(arr, 2));   // 1 (would go between 1 and 3)
console.log(searchInsertPosition(arr, 7));   // 4 (would go at the end)
console.log(searchInsertPosition(arr, 0));   // 0 (would go at the start)
\`\`\`

### Binary Search on the Answer Space

Binary search doesn't just find elements in arrays — it finds the **boundary** of a condition. This is one of the most powerful algorithm patterns.

\`\`\`javascript
// Problem: find the minimum speed such that packages arrive on time.
// This is NOT searching an array — it's searching a range of ANSWERS.
//
// Key insight: if speed X works, speed X+1 also works.
//              if speed X doesn't work, speed X-1 doesn't either.
//              The feasibility function is MONOTONE → binary search applies.

function canDeliver(packages, speed, days) {
    // Can we deliver all packages in 'days' days at 'speed' packages/day?
    let daysNeeded = 1;
    let currentLoad = 0;
    for (const pkg of packages) {
        if (currentLoad + pkg > speed) {
            daysNeeded++;
            currentLoad = 0;
        }
        currentLoad += pkg;
    }
    return daysNeeded <= days;
}

function minShipSpeed(packages, days) {
    // Minimum speed: must carry at least the heaviest package
    // Maximum speed: carry everything in one day
    let left  = Math.max(...packages);
    let right = packages.reduce((s, n) => s + n, 0);

    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (canDeliver(packages, mid, days)) {
            right = mid;       // feasible — try lower speed
        } else {
            left = mid + 1;   // not feasible — need higher speed
        }
    }
    return left;
}

console.log(minShipSpeed([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5));   // 15
console.log(minShipSpeed([3, 2, 2, 4, 1, 4],                3));   // 6
\`\`\`

## Hash-Based Search — O(1) Average

Hash-based search is the fastest lookup in JavaScript. The secret: compute a numeric hash of the key, use it as an index into an array. One operation — no scanning.

### Using JavaScript's Built-in Map and Set

\`\`\`javascript
// Map — O(1) get, set, has, delete
const userMap = new Map([
    [1, { name: "Alice",  role: "admin" }],
    [2, { name: "Bob",    role: "user"  }],
    [3, { name: "Carol",  role: "user"  }],
]);

console.log(userMap.get(2));       // { name: "Bob", role: "user" }
console.log(userMap.has(4));       // false
console.log(userMap.size);         // 3

// Map supports any key type (object keys must be string or symbol)
const coordMap = new Map();
const point = { x: 1, y: 2 };     // object as key!
coordMap.set(point, "Origin");
console.log(coordMap.get(point));  // "Origin"

// Set — O(1) add, has, delete — unique values
const seen    = new Set();
const visited = new Set([1, 2, 3]);

visited.add(4);
console.log(visited.has(2));    // true
console.log(visited.has(5));    // false
visited.delete(2);
console.log([...visited]);      // [1, 3, 4]

// Real-world: deduplication
const withDups2 = [1, 2, 2, 3, 3, 3, 4];
const unique    = [...new Set(withDups2)];
console.log(unique);   // [1, 2, 3, 4]
\`\`\`

### Building a Search Index

\`\`\`javascript
// For repeated lookups — build an index once, query in O(1)
class SearchIndex {
    constructor(items, keyFn) {
        // keyFn extracts the key from each item
        this._map = new Map(items.map(item => [keyFn(item), item]));
    }

    get(key)         { return this._map.get(key) ?? null; }
    has(key)         { return this._map.has(key); }
    getAll()         { return [...this._map.values()]; }
    size()           { return this._map.size; }
}

const products = [
    { sku: "A001", name: "Laptop",  price: 999 },
    { sku: "A002", name: "Phone",   price: 699 },
    { sku: "A003", name: "Tablet",  price: 499 },
    { sku: "A004", name: "Monitor", price: 349 },
];

// Build once — O(N)
const bySku  = new SearchIndex(products, p => p.sku);
const byName = new SearchIndex(products, p => p.name.toLowerCase());

// Query many times — O(1) each
console.log(bySku.get("A002"));           // { sku: "A002", name: "Phone", ... }
console.log(byName.get("laptop"));         // { sku: "A001", name: "Laptop", ... }
console.log(bySku.has("A999"));            // false
\`\`\`

### Multi-Value Index — One Key, Many Results

\`\`\`javascript
// Group items by a property for O(1) category lookup
function buildMultiIndex(items, keyFn) {
    const index = new Map();
    for (const item of items) {
        const key = keyFn(item);
        if (!index.has(key)) index.set(key, []);
        index.get(key).push(item);
    }
    return index;
}

const employees = [
    { name: "Alice",  dept: "Engineering", level: "senior" },
    { name: "Bob",    dept: "Marketing",   level: "junior" },
    { name: "Carol",  dept: "Engineering", level: "junior" },
    { name: "David",  dept: "Marketing",   level: "senior" },
    { name: "Eve",    dept: "Engineering", level: "senior" },
];

// Build index once — O(N)
const byDept  = buildMultiIndex(employees, e => e.dept);
const byLevel = buildMultiIndex(employees, e => e.level);

// Query — O(1) to get the group, then O(K) to use it
console.log(byDept.get("Engineering").map(e => e.name));
// ["Alice", "Carol", "Eve"]

console.log(byLevel.get("senior").map(e => e.name));
// ["Alice", "David", "Eve"]
\`\`\`

## String Searching

Searching within strings is a common and surprisingly deep problem.

### Built-in JavaScript String Search

\`\`\`javascript
const text = "The quick brown fox jumps over the lazy dog";

// includes — O(N×M) worst case where M is pattern length
console.log(text.includes("fox"));          // true
console.log(text.includes("cat"));          // false
console.log(text.includes("Fox"));          // false (case-sensitive!)
console.log(text.toLowerCase().includes("fox"));  // true (case-insensitive)

// indexOf — returns position or -1
console.log(text.indexOf("fox"));           // 16
console.log(text.indexOf("the"));           // 32 (second "the")
console.log(text.indexOf("the", 10));       // 32 (start searching from index 10)
console.log(text.lastIndexOf("the"));       // 31

// startsWith / endsWith
console.log(text.startsWith("The"));        // true
console.log(text.endsWith("dog"));          // true
console.log(text.startsWith("quick", 4));   // true (start from index 4)

// match with regex — the most powerful option
const words  = text.match(/\\b\\w{4}\\b/g);    // all 4-letter words
console.log(words);   // ["quick", "over", "lazy"]

const hasVowelStart = /\\b[aeiou]\\w*/gi;
const vowelWords = text.match(hasVowelStart);
console.log(vowelWords);   // ["over"]
\`\`\`

### Fuzzy Search — Finding Similar Strings

\`\`\`javascript
// Levenshtein distance — how many single-character edits
// to transform string A into string B?
// Used by: spell checkers, "did you mean?" features, git diff

function levenshtein(a, b) {
    // dp[i][j] = edits to transform a[0..i] into b[0..j]
    const dp = Array.from({ length: a.length + 1 }, (_, i) =>
        Array.from({ length: b.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
    );

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];   // same char — no edit
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],      // delete from a
                    dp[i][j - 1],      // insert into a
                    dp[i - 1][j - 1]   // replace
                );
            }
        }
    }
    return dp[a.length][b.length];
}

console.log(levenshtein("kitten", "sitting"));   // 3
console.log(levenshtein("hello",  "hello"));     // 0
console.log(levenshtein("book",   "back"));      // 2

// Fuzzy search: find best matches from a list
function fuzzySearch(query, candidates, maxDistance = 2) {
    return candidates
        .map(c => ({ candidate: c, distance: levenshtein(query.toLowerCase(), c.toLowerCase()) }))
        .filter(r => r.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance)
        .map(r => r.candidate);
}

const cities = ["Paris", "London", "Berlin", "Tokyo", "Sydney", "Pairs", "Lndon"];
console.log(fuzzySearch("paris", cities, 2));   // ["Paris", "Pairs"]
console.log(fuzzySearch("londn", cities, 2));   // ["London", "Lndon"]
\`\`\`

## Choosing the Right Search Strategy

\`\`\`javascript
// Decision framework — ask these questions in order:

// Q1: Is the data in a hash map / Set?
//     YES → O(1) — use Map.get() or Set.has()

// Q2: Is the array sorted AND searching for exact value?
//     YES → O(log N) — binary search

// Q3: Do you need all matches (not just the first)?
//     YES → O(N) — filter()
//     NO  → O(N) worst case — find()

// Q4: Are you searching by multiple conditions?
//     YES → O(N) — filter/find with complex predicate

// Q5: Searching inside strings?
//     Exact match → includes() / indexOf()
//     Pattern     → regex with match()
//     Fuzzy       → Levenshtein distance

// Practical guide:
const GUIDE = {
    "one lookup, any data":         "linear: find() or filter()",
    "many lookups, any data":       "build Map/Set first, then O(1)",
    "sorted array, exact value":    "binary search",
    "sorted array, range/boundary": "binary search on answer space",
    "full text search":             "regex or search library",
    "typo-tolerant search":         "Levenshtein distance",
};
\`\`\`

## Real-World Example: Autocomplete Search

\`\`\`javascript
// A complete autocomplete engine combining multiple search strategies
class AutoComplete {
    constructor(items) {
        this._items    = items;
        // Build prefix index for O(prefix_len) lookup instead of O(N)
        this._prefixMap = new Map();

        for (const item of items) {
            const lower = item.toLowerCase();
            // Index every prefix: "apple" → "a", "ap", "app", "appl", "apple"
            for (let len = 1; len <= lower.length; len++) {
                const prefix = lower.slice(0, len);
                if (!this._prefixMap.has(prefix)) {
                    this._prefixMap.set(prefix, []);
                }
                this._prefixMap.get(prefix).push(item);
            }
        }
    }

    // O(1) lookup by prefix
    search(query, limit = 5) {
        if (!query) return this._items.slice(0, limit);
        const results = this._prefixMap.get(query.toLowerCase()) ?? [];
        return results.slice(0, limit);
    }

    // Fuzzy search fallback when prefix search finds nothing
    searchFuzzy(query, limit = 5, maxDist = 2) {
        const exact = this.search(query, limit);
        if (exact.length > 0) return exact;

        return this._items
            .map(item => ({
                item,
                dist: levenshtein(query.toLowerCase(), item.toLowerCase()),
            }))
            .filter(r => r.dist <= maxDist)
            .sort((a, b) => a.dist - b.dist)
            .slice(0, limit)
            .map(r => r.item);
    }
}

const fruits = [
    "apple", "apricot", "avocado", "banana", "blueberry",
    "cherry", "coconut", "grape", "grapefruit", "guava",
    "lemon", "lime", "mango", "melon", "orange", "papaya",
    "peach", "pear", "pineapple", "plum", "raspberry",
];

const ac = new AutoComplete(fruits);

console.log("=== Autocomplete ===");
console.log("'ap':", ac.search("ap"));        // ["apple", "apricot"]
console.log("'gr':", ac.search("gr"));        // ["grape", "grapefruit", "guava" ← no! only prefix match]
console.log("'pe':", ac.search("pe"));        // ["peach", "pear"]
console.log("'xyz':", ac.search("xyz"));      // []
console.log("'pech' (fuzzy):", ac.searchFuzzy("pech")); // ["peach"]
\`\`\`
`,

  fr: `# Algorithmes de recherche

## Les quatre stratégies de recherche

\`\`\`javascript
// O(N)   — Recherche linéaire : scanner chaque élément
arr.find(x => x.id === target);        // pire cas : N comparaisons

// O(log N) — Recherche binaire : diviser par deux à chaque étape
binarySearch(sortedArr, target);       // max ~20 étapes pour 1 million !

// O(1)   — Table de hachage : calculer l'emplacement directement
map.get(key);                           // ~1 opération quelle que soit la taille
set.has(value);                         // ~1 opération

// O(1)   — Index direct : accès mémoire direct
arr[index];                             // exactement 1 opération
\`\`\`

## Recherche binaire — O(log N)

\`\`\`javascript
function rechercheBI(arrTrie, cible) {
    let gauche = 0;
    let droite = arrTrie.length - 1;

    while (gauche <= droite) {
        const milieu = Math.floor((gauche + droite) / 2);

        if      (arrTrie[milieu] === cible) return milieu;
        else if (arrTrie[milieu] < cible)   gauche = milieu + 1;
        else                                droite = milieu - 1;
    }
    return -1;
}

// log₂(1 000 000) ≈ 20 étapes seulement !
\`\`\`

## Index de recherche — O(1) par requête

\`\`\`javascript
const produits = [
    { sku: "A001", nom: "Laptop",  prix: 999 },
    { sku: "A002", nom: "Téléphone", prix: 699 },
];

// Construire une fois — O(N)
const parSku = new Map(produits.map(p => [p.sku, p]));

// Interroger plusieurs fois — O(1) chacun
console.log(parSku.get("A002"));   // { sku: "A002", nom: "Téléphone", ... }
\`\`\`

## Choisir la bonne stratégie

\`\`\`javascript
// Plusieurs recherches sur les mêmes données ?
//   → Construire un Map/Set d'abord, puis O(1) par requête

// Tableau trié, valeur exacte ?
//   → Recherche binaire O(log N)

// Une seule recherche, données non triées ?
//   → Recherche linéaire find()/filter()

// Recherche dans des chaînes ?
//   → includes() / indexOf() / regex
//   → Distance de Levenshtein pour la recherche floue
\`\`\`
`,
};

export const starterCode = {
  default: `// Searching Algorithms — JavaScript Practice

// ─── 1. Linear vs Binary vs Hash comparison ───────────────
const N = 100_000;
const sorted = Array.from({ length: N }, (_, i) => i * 2);   // [0,2,4,...,199998]
const target = 99_998;

// O(N) linear
const linearResult = sorted.findIndex(x => x === target);

// O(log N) binary
function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if      (arr[mid] === target) return mid;
        else if (arr[mid] < target)   left  = mid + 1;
        else                          right = mid - 1;
    }
    return -1;
}
const binaryResult = binarySearch(sorted, target);

// O(1) hash
const hashMap = new Map(sorted.map((v, i) => [v, i]));
const hashResult = hashMap.get(target);

console.log("=== Search Results (all should match) ===");
console.log("Linear:", linearResult);
console.log("Binary:", binaryResult);
console.log("Hash:  ", hashResult);

// ─── 2. Binary search variations ─────────────────────────
const withDups = [1, 2, 2, 2, 3, 4, 4, 5, 5, 5, 5, 6];

function findFirst(arr, target) {
    let left = 0, right = arr.length - 1, result = -1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) { result = mid; right = mid - 1; }
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return result;
}

function findLast(arr, target) {
    let left = 0, right = arr.length - 1, result = -1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) { result = mid; left = mid + 1; }
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return result;
}

console.log("\\n=== Binary Search Variations ===");
console.log("Array:", withDups.join(", "));
console.log("findFirst(2):", findFirst(withDups, 2), "(expected 1)");
console.log("findLast(2):",  findLast(withDups,  2), "(expected 3)");
console.log("findFirst(5):", findFirst(withDups, 5), "(expected 7)");
console.log("findLast(5):",  findLast(withDups,  5), "(expected 10)");
console.log("findFirst(9):", findFirst(withDups, 9), "(expected -1)");

// ─── 3. Multi-value index ─────────────────────────────────
const employees = [
    { name: "Alice",  dept: "Engineering", level: "senior" },
    { name: "Bob",    dept: "Marketing",   level: "junior" },
    { name: "Carol",  dept: "Engineering", level: "junior" },
    { name: "David",  dept: "Marketing",   level: "senior" },
    { name: "Eve",    dept: "Engineering", level: "senior" },
    { name: "Frank",  dept: "HR",          level: "junior" },
];

function buildMultiIndex(items, keyFn) {
    return items.reduce((map, item) => {
        const key = keyFn(item);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
        return map;
    }, new Map());
}

const byDept  = buildMultiIndex(employees, e => e.dept);
const byLevel = buildMultiIndex(employees, e => e.level);

console.log("\\n=== Multi-Value Index ===");
console.log("Engineering:", byDept.get("Engineering").map(e => e.name));
console.log("Senior:",      byLevel.get("senior").map(e => e.name));

// ─── 4. String search ─────────────────────────────────────
const text = "The quick brown fox jumps over the lazy dog";
console.log("\\n=== String Search ===");
console.log("has 'fox':",       text.includes("fox"));
console.log("position of fox:", text.indexOf("fox"));
console.log("4-letter words:",  text.match(/\\b\\w{4}\\b/g));
console.log("words with 'o':",  text.match(/\\b\\w*o\\w*\\b/g));
`,
};

export const exerciseEn = `Searching challenges.

1. Write 'binarySearchRange(sortedArr, low, high)' that returns
   all indices where low <= arr[i] <= high.
   binarySearchRange([1,3,5,7,9,11,13], 5, 10) → [2, 3, 4] (values 5,7,9)
   Hint: find the first index >= low and last index <= high using binary search.

2. Write 'searchRotated(arr, target)' that binary searches a sorted
   array that has been rotated at some pivot.
   [4,5,6,7,0,1,2] was sorted [0,1,2,4,5,6,7] rotated at index 4.
   searchRotated([4,5,6,7,0,1,2], 0) → 4
   searchRotated([4,5,6,7,0,1,2], 3) → -1
   Hint: one half is always normally sorted — determine which.

3. Write a 'TwoSum' function that finds indices of two numbers
   that add up to a target, in O(N) time using a Map.
   twoSum([2,7,11,15], 9) → [0, 1]  (2 + 7 = 9)
   twoSum([3,2,4], 6)     → [1, 2]  (2 + 4 = 6)

4. Implement 'groupAnagrams(words)' that groups words that are
   anagrams of each other, in O(N × K) where K is the longest word.
   groupAnagrams(["eat","tea","tan","ate","nat","bat"])
   → [["eat","tea","ate"], ["tan","nat"], ["bat"]]
   Hint: the sorted version of an anagram is always the same.`;

export const exerciseFr = `Défis de recherche.

1. Écrivez 'rechercheBI_plage(arr, bas, haut)' qui retourne tous les
   indices où bas <= arr[i] <= haut.

2. Écrivez 'rechercheBI_pivotee(arr, cible)' qui fait une recherche
   binaire dans un tableau trié puis pivoté.

3. Écrivez 'deuxSomme(arr, cible)' qui trouve en O(N) les indices de
   deux nombres dont la somme est la cible, en utilisant une Map.

4. Implémentez 'grouperAnagrammes(mots)' qui groupe les mots qui sont
   des anagrammes les uns des autres en O(N × K).`;

export const solutionCode = {
  default: `// 1. Binary search range
function binarySearchRange(sortedArr, low, high) {
    // Find first index >= low
    function firstGTE(target) {
        let left = 0, right = sortedArr.length;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (sortedArr[mid] < target) left = mid + 1;
            else right = mid;
        }
        return left;
    }

    // Find last index <= high
    function lastLTE(target) {
        let left = 0, right = sortedArr.length;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (sortedArr[mid] <= target) left = mid + 1;
            else right = mid;
        }
        return left - 1;
    }

    const start = firstGTE(low);
    const end   = lastLTE(high);
    if (start > end) return [];

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

console.log("=== Binary Search Range ===");
const arr = [1, 3, 5, 7, 9, 11, 13];
console.log("Range [5,10]:",  binarySearchRange(arr, 5, 10));    // [2,3,4] (5,7,9)
console.log("Range [1,13]:",  binarySearchRange(arr, 1, 13));    // [0,1,2,3,4,5,6]
console.log("Range [6,8]:",   binarySearchRange(arr, 6, 8));     // [3] (7)
console.log("Range [20,30]:", binarySearchRange(arr, 20, 30));   // []

// 2. Search rotated array
function searchRotated(arr, target) {
    let left = 0, right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;

        // Determine which half is normally sorted
        if (arr[left] <= arr[mid]) {
            // Left half is sorted
            if (target >= arr[left] && target < arr[mid]) {
                right = mid - 1;   // target is in sorted left half
            } else {
                left = mid + 1;    // target is in right half
            }
        } else {
            // Right half is sorted
            if (target > arr[mid] && target <= arr[right]) {
                left = mid + 1;    // target is in sorted right half
            } else {
                right = mid - 1;   // target is in left half
            }
        }
    }
    return -1;
}

console.log("\\n=== Search Rotated ===");
console.log(searchRotated([4,5,6,7,0,1,2], 0));   // 4
console.log(searchRotated([4,5,6,7,0,1,2], 3));   // -1
console.log(searchRotated([4,5,6,7,0,1,2], 7));   // 3
console.log(searchRotated([1], 0));                // -1
console.log(searchRotated([3,1], 1));              // 1

// 3. Two Sum — O(N) with Map
function twoSum(nums, target) {
    const seen = new Map();   // value → index
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}

console.log("\\n=== Two Sum ===");
console.log(twoSum([2,7,11,15], 9));    // [0, 1]
console.log(twoSum([3,2,4], 6));        // [1, 2]
console.log(twoSum([3,3], 6));          // [0, 1]

// 4. Group anagrams — O(N × K)
function groupAnagrams(words) {
    const groups = new Map();

    for (const word of words) {
        // Sorted characters = canonical form of anagram group
        const key = word.split("").sort().join("");
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(word);
    }

    return [...groups.values()];
}

console.log("\\n=== Group Anagrams ===");
const words = ["eat","tea","tan","ate","nat","bat"];
const grouped = groupAnagrams(words);
grouped.forEach(group => console.log(" ", group));
// ["eat","tea","ate"]
// ["tan","nat"]
// ["bat"]

// Bonus: sort within groups and by group size
const sortedGrouped = groupAnagrams(words)
    .map(g => g.sort())
    .sort((a, b) => b.length - a.length);
console.log("Sorted:", sortedGrouped);
`,
};

export const quiz = {
  en: [
    {
      question: "Why does binary search require a sorted array?",
      options: [
        "Binary search uses the indices to calculate positions and sorting makes indices meaningful",
        "Binary search eliminates half the remaining elements at each step based on whether the target is greater or less than the midpoint. This only works if 'less than midpoint means target is in the left half.' In an unsorted array, a smaller midpoint value tells you nothing about where the target is — you can't safely discard half the array.",
        "Sorting makes the array's memory layout contiguous, enabling faster access",
        "Binary search is a recursive algorithm and recursion requires sorted input"
      ],
      correct: 1,
    },
    {
      question: "When should you build a Map/Set for searching instead of using Array.find()?",
      options: [
        "Always — Map and Set are always faster than Array.find()",
        "When you perform MULTIPLE lookups on the same data. Building a Map costs O(N) upfront. Each subsequent lookup is O(1). If you do K lookups: Map costs O(N + K), array.find() costs O(N × K). The crossover point is around 2-3 lookups — if you search more than once, a Map pays off. For a single one-time lookup, find() is simpler and fine.",
        "When the array has more than 1000 elements",
        "When the data is sorted — Map only works on sorted data"
      ],
      correct: 1,
    },
    {
      question: "What is binary search on the answer space and how is it different from searching an array?",
      options: [
        "It's the same as regular binary search but applied to the result instead of the input",
        "Instead of searching for a value in an array, you binary search the RANGE OF POSSIBLE ANSWERS. You define a predicate 'is answer X feasible?' and find the boundary where it changes from false to true (or vice versa). This applies when feasibility is monotone — if X works, X+1 also works. Examples: minimum speed for delivery, minimum capacity, smallest window. It turns O(N × K) brute force into O(K log K × N).",
        "It applies binary search twice — once on the input and once on the result",
        "It only works when the answer is a prime number"
      ],
      correct: 1,
    },
    {
      question: "What is the time complexity of finding all anagrams of a query in a list of N words, and what data structure makes it efficient?",
      options: [
        "O(N²) — you must compare every word to every other word",
        "O(N × K) where K is the average word length, using a hash map. The key insight: any two anagrams have identical sorted character sequences ('eat', 'tea', 'ate' all sort to 'aet'). Sort each word once (O(K log K)), use the sorted form as a hash map key. All anagrams hash to the same bucket. Build the map in O(N × K log K), then look up any query in O(K log K).",
        "O(N log N) — you sort the list of words first then binary search",
        "O(26N) — you count character frequencies which is bounded by the alphabet"
      ],
      correct: 1,
    },
    {
      question: "How does Levenshtein distance enable fuzzy search and what does a distance of 2 mean?",
      options: [
        "Distance 2 means the strings share exactly 2 characters in common",
        "Levenshtein distance is the minimum number of single-character edits (insertions, deletions, substitutions) to transform one string into another. Distance 2 means you need exactly 2 edits: 'kitten' → 'sitten' (substitute k→s) → 'sittin' (substitute e→i) needs 2 more edits actually. For fuzzy search: compute distance from query to each candidate, return candidates within a threshold. This powers spell checkers and 'did you mean?' features.",
        "Distance 2 means 2 characters are in the wrong position",
        "Distance 2 means the strings have 2 consecutive matching substrings"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Pourquoi la recherche binaire nécessite-t-elle un tableau trié ?",
      options: [
        "La recherche binaire utilise les indices pour calculer des positions et le tri rend les indices significatifs",
        "La recherche binaire élimine la moitié des éléments restants à chaque étape selon si la cible est supérieure ou inférieure au milieu. Cela ne fonctionne que si 'inférieur au milieu signifie que la cible est dans la moitié gauche'. Dans un tableau non trié, une valeur centrale plus petite ne vous dit rien sur l'emplacement de la cible.",
        "Le tri rend la disposition mémoire du tableau contiguë, permettant un accès plus rapide",
        "La recherche binaire est un algorithme récursif et la récursion nécessite une entrée triée"
      ],
      correct: 1,
    },
    {
      question: "Quand devriez-vous construire un Map/Set pour chercher au lieu d'utiliser Array.find() ?",
      options: [
        "Toujours — Map et Set sont toujours plus rapides que Array.find()",
        "Quand vous effectuez PLUSIEURS recherches sur les mêmes données. Construire un Map coûte O(N) une fois. Chaque recherche suivante est O(1). Pour K recherches : Map coûte O(N + K), find() coûte O(N × K). Le point de croisement est autour de 2-3 recherches — si vous cherchez plus d'une fois, un Map est rentable.",
        "Quand le tableau a plus de 1000 éléments",
        "Quand les données sont triées — Map ne fonctionne que sur des données triées"
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce que la recherche binaire sur l'espace des réponses ?",
      options: [
        "C'est la même chose que la recherche binaire standard mais appliquée au résultat",
        "Au lieu de chercher une valeur dans un tableau, vous faites une recherche binaire sur la PLAGE DES RÉPONSES POSSIBLES. Vous définissez un prédicat 'la réponse X est-elle faisable ?' et trouvez la frontière où elle change. Cela s'applique quand la faisabilité est monotone — si X fonctionne, X+1 aussi.",
        "Cela applique la recherche binaire deux fois — sur l'entrée puis sur le résultat",
        "Cela ne fonctionne que quand la réponse est un nombre premier"
      ],
      correct: 1,
    },
    {
      question: "Quelle est la complexité temporelle de trouver tous les anagrammes et quelle structure de données la rend efficace ?",
      options: [
        "O(N²) — vous devez comparer chaque mot à chaque autre mot",
        "O(N × K) où K est la longueur moyenne des mots, en utilisant une table de hachage. L'idée clé : deux anagrammes ont des séquences de caractères triées identiques. Triez chaque mot une fois, utilisez la forme triée comme clé. Tous les anagrammes hachent vers le même bucket.",
        "O(N log N) — vous triez la liste de mots d'abord puis vous faites une recherche binaire",
        "O(26N) — vous comptez les fréquences de caractères limitées par l'alphabet"
      ],
      correct: 1,
    },
    {
      question: "Comment la distance de Levenshtein permet-elle la recherche floue et que signifie une distance de 2 ?",
      options: [
        "Distance 2 signifie que les chaînes partagent exactement 2 caractères en commun",
        "La distance de Levenshtein est le nombre minimum d'éditions de caractères uniques (insertions, suppressions, substitutions) pour transformer une chaîne en une autre. Distance 2 signifie que vous avez besoin de 2 éditions. Pour la recherche floue : calculez la distance de la requête à chaque candidat, retournez les candidats en dessous d'un seuil.",
        "Distance 2 signifie que 2 caractères sont à la mauvaise position",
        "Distance 2 signifie que les chaînes ont 2 sous-chaînes correspondantes consécutives"
      ],
      correct: 1,
    },
  ],
};
