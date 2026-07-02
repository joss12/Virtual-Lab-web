export const id = "data-structures";
export const titleEn = "Data Structures";
export const titleFr = "Structures de données";

export const content = {
  en: `# Data Structures

## Why Data Structures Matter in JavaScript

JavaScript gives you arrays and objects out of the box. For many tasks, they're enough. But the moment you need to:
- Check membership in a large collection thousands of times per second
- Always get the minimum/maximum element instantly
- Insert and delete from the front of a collection efficiently
- Find elements by multiple different keys

...the built-in structures either can't do it or do it slowly. Understanding data structures means knowing **which container to use and why**.

\`\`\`javascript
// The same problem — radically different performance:

// Problem: track 1 million visited URLs, check if URL was seen before

// BAD: Array — O(N) per check
const visitedArray = [];
visitedArray.push(url);
const seen = visitedArray.includes(url);   // scans up to 1M items each time!

// GOOD: Set — O(1) per check
const visitedSet = new Set();
visitedSet.add(url);
const seen2 = visitedSet.has(url);          // ~1 operation regardless of size

// At 1 million URLs:
// Array: ~1,000,000 comparisons per lookup
// Set:   ~1 comparison per lookup
\`\`\`

## Stack — Last In, First Out (LIFO)

A stack is like a pile of plates. You add to the top and take from the top. The last plate added is the first plate removed.

\`\`\`javascript
class Stack {
    #items = [];   // private field (ES2022) — cannot be accessed outside

    push(item)  { this.#items.push(item); }
    pop()       {
        if (this.isEmpty()) throw new Error("Stack underflow");
        return this.#items.pop();
    }
    peek()      {
        if (this.isEmpty()) throw new Error("Empty stack");
        return this.#items[this.#items.length - 1];
    }
    isEmpty()   { return this.#items.length === 0; }
    size()      { return this.#items.length; }
    clear()     { this.#items = []; }
    toArray()   { return [...this.#items].reverse(); }   // top first

    toString()  {
        return \`Stack(top → [\${[...this.#items].reverse().join(", ")}])\`;
    }
}

// Why use array end as "top"?
// push() and pop() are both O(1) — no shifting
// unshift() and shift() (front operations) are O(N) — avoid for stacks

const stack = new Stack();
stack.push("A");
stack.push("B");
stack.push("C");

console.log(stack.toString());    // Stack(top → [C, B, A])
console.log(stack.peek());        // C
console.log(stack.pop());         // C
console.log(stack.size());        // 2
\`\`\`

### Real-World Stack Applications

\`\`\`javascript
// APPLICATION 1: Check balanced brackets — the classic stack interview problem
function isBalanced(str) {
    const stack   = new Stack();
    const pairs   = { ')': '(', '}': '{', ']': '[' };
    const openers = new Set(['(', '{', '[']);

    for (const char of str) {
        if (openers.has(char)) {
            stack.push(char);
        } else if (char in pairs) {
            if (stack.isEmpty() || stack.pop() !== pairs[char]) {
                return false;   // no matching opener, or wrong type
            }
        }
    }
    return stack.isEmpty();   // all openers must be matched
}

console.log(isBalanced("({[]})"));    // true
console.log(isBalanced("{[()]}"));    // true
console.log(isBalanced("((()"));      // false — unclosed (
console.log(isBalanced("([)]"));      // false — wrong order

// APPLICATION 2: Undo/Redo
class TextEditor {
    #text = "";
    #undoStack = new Stack();
    #redoStack = new Stack();

    type(chars) {
        this.#undoStack.push(this.#text);   // save current state
        this.#redoStack = new Stack();      // new action clears redo
        this.#text += chars;
    }

    undo() {
        if (!this.#undoStack.isEmpty()) {
            this.#redoStack.push(this.#text);
            this.#text = this.#undoStack.pop();
        }
    }

    redo() {
        if (!this.#redoStack.isEmpty()) {
            this.#undoStack.push(this.#text);
            this.#text = this.#redoStack.pop();
        }
    }

    get text() { return this.#text; }
}

const editor = new TextEditor();
editor.type("Hello");
editor.type(", World");
console.log(editor.text);   // Hello, World
editor.undo();
console.log(editor.text);   // Hello
editor.undo();
console.log(editor.text);   // ""
editor.redo();
console.log(editor.text);   // Hello

// APPLICATION 3: Evaluate math expressions
function evaluateRPN(tokens) {
    // Reverse Polish Notation: "3 4 + 2 *" = (3+4)*2 = 14
    const stack = new Stack();
    const ops = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => Math.trunc(a / b),
    };

    for (const token of tokens) {
        if (token in ops) {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(ops[token](a, b));
        } else {
            stack.push(Number(token));
        }
    }
    return stack.pop();
}

console.log(evaluateRPN(["3","4","+","2","*"]));   // 14  ((3+4)×2)
console.log(evaluateRPN(["5","1","2","+","4","*","+","3","-"]));   // 14
\`\`\`

## Queue — First In, First Out (FIFO)

A queue is like a line of people waiting. The first person to join is the first to be served. The key insight is that arrays are **bad** for queues — \`shift()\` is O(N). Use a proper implementation.

\`\`\`javascript
// Efficient queue using a doubly-linked structure or circular buffer
// Simplest correct approach: two-stack queue or linked list

class Queue {
    // Two-stack trick: O(1) amortized enqueue AND dequeue
    #inbox  = [];    // new items go here
    #outbox = [];    // items served from here

    enqueue(item) {
        this.#inbox.push(item);            // O(1) always
    }

    dequeue() {
        if (this.isEmpty()) throw new Error("Queue underflow");
        if (this.#outbox.length === 0) {
            // Transfer all inbox items to outbox (reverses order)
            while (this.#inbox.length > 0) {
                this.#outbox.push(this.#inbox.pop());
            }
        }
        return this.#outbox.pop();         // O(1) amortized
    }
    // Why amortized O(1)?
    // Each item is moved from inbox to outbox exactly ONCE across its lifetime.
    // Total moves for N items = N → average O(1) per operation.

    peek()    {
        if (this.isEmpty()) throw new Error("Empty queue");
        return this.#outbox.length > 0
            ? this.#outbox[this.#outbox.length - 1]
            : this.#inbox[0];
    }
    isEmpty() { return this.#inbox.length === 0 && this.#outbox.length === 0; }
    size()    { return this.#inbox.length + this.#outbox.length; }
}

const queue = new Queue();
queue.enqueue("Alice");
queue.enqueue("Bob");
queue.enqueue("Carol");

console.log(queue.dequeue());   // Alice (first in, first out)
console.log(queue.dequeue());   // Bob
console.log(queue.size());      // 1

// For simple use cases: Node.js has no built-in queue,
// but collections.deque equivalent is available in libraries.
// For most browser JS: Array with push/shift is fine for small N.
\`\`\`

### Real-World Queue Applications

\`\`\`javascript
// BFS (Breadth-First Search) — always uses a queue
function bfs(graph, start, target) {
    const queue   = new Queue();
    const visited = new Set([start]);
    queue.enqueue([start, [start]]);   // [current_node, path_so_far]

    while (!queue.isEmpty()) {
        const [node, path] = queue.dequeue();
        if (node === target) return path;

        for (const neighbor of (graph[node] || [])) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.enqueue([neighbor, [...path, neighbor]]);
            }
        }
    }
    return null;
}

const graph = {
    A: ["B", "C"],
    B: ["A", "D"],
    C: ["A", "E"],
    D: ["B", "F"],
    E: ["C"],
    F: ["D"],
};

console.log(bfs(graph, "A", "F")?.join(" → "));   // A → B → D → F

// Rate limiter — process max N tasks per second using a queue
class RateLimiter {
    #queue    = new Queue();
    #maxPerSecond;
    #processed = 0;

    constructor(maxPerSecond) {
        this.#maxPerSecond = maxPerSecond;
        setInterval(() => { this.#processed = 0; }, 1000);
    }

    submit(task) {
        this.#queue.enqueue(task);
        this.#process();
    }

    #process() {
        while (!this.#queue.isEmpty() && this.#processed < this.#maxPerSecond) {
            const task = this.#queue.dequeue();
            task();
            this.#processed++;
        }
    }
}
\`\`\`

## Linked List — Nodes Connected by Pointers

A linked list stores data in **nodes**, each holding a value and a pointer to the next node. Unlike arrays, there is no index — you must walk from the head.

\`\`\`javascript
class ListNode {
    constructor(value, next = null) {
        this.value = value;
        this.next  = next;
    }
}

class LinkedList {
    #head = null;
    #size = 0;

    get size() { return this.#size; }

    // O(1) — just update the head pointer
    prepend(value) {
        this.#head = new ListNode(value, this.#head);
        this.#size++;
    }

    // O(N) — must walk to end
    append(value) {
        if (!this.#head) { this.prepend(value); return; }
        let current = this.#head;
        while (current.next) current = current.next;
        current.next = new ListNode(value);
        this.#size++;
    }

    // O(N) — must walk to find it
    delete(value) {
        if (!this.#head) return false;
        if (this.#head.value === value) {
            this.#head = this.#head.next;
            this.#size--;
            return true;
        }
        let current = this.#head;
        while (current.next) {
            if (current.next.value === value) {
                current.next = current.next.next;   // skip over deleted node
                this.#size--;
                return true;
            }
            current = current.next;
        }
        return false;
    }

    // O(N)
    includes(value) {
        let current = this.#head;
        while (current) {
            if (current.value === value) return true;
            current = current.next;
        }
        return false;
    }

    toArray() {
        const arr = [];
        let current = this.#head;
        while (current) { arr.push(current.value); current = current.next; }
        return arr;
    }

    toString() { return this.toArray().join(" → ") + " → null"; }

    // Reverse the list in-place — O(N), O(1) space
    reverse() {
        let prev    = null;
        let current = this.#head;
        while (current) {
            const next  = current.next;
            current.next = prev;
            prev         = current;
            current      = next;
        }
        this.#head = prev;
    }
}

const list = new LinkedList();
list.append(1);
list.append(2);
list.append(3);
list.prepend(0);

console.log(list.toString());   // 0 → 1 → 2 → 3 → null
list.delete(2);
console.log(list.toString());   // 0 → 1 → 3 → null
list.reverse();
console.log(list.toString());   // 3 → 1 → 0 → null
\`\`\`

### The Cycle Detection Problem — Floyd's Algorithm

\`\`\`javascript
// Detect if a linked list has a cycle (a node pointing back to a previous node)
// Floyd's "tortoise and hare" — one pointer moves 1 step, other moves 2

function hasCycle(head) {
    let slow = head;
    let fast = head;

    while (fast !== null && fast.next !== null) {
        slow = slow.next;         // move 1 step
        fast = fast.next.next;    // move 2 steps

        if (slow === fast) return true;   // they met — cycle exists!
    }
    return false;   // fast reached end — no cycle
}

// Why it works:
// If there's a cycle, fast "laps" slow inside the cycle.
// Relative speed: fast gains 1 node per iteration.
// They MUST meet (it's like a circular track — faster runner always laps slower).
// If no cycle: fast reaches null.
// Space: O(1) — just two pointers, no extra data structure.
\`\`\`

## Hash Map — The Most Useful Data Structure

A hash map maps **keys to values** using a hash function for O(1) average-case lookup. JavaScript's built-in \`Map\` and plain objects \`{}\` are both hash maps.

\`\`\`javascript
// Building a hash map from scratch — to understand how it works
class HashMap {
    #buckets;
    #capacity;
    #size = 0;
    static #LOAD_FACTOR = 0.75;   // resize when 75% full

    constructor(capacity = 16) {
        this.#capacity = capacity;
        this.#buckets  = new Array(capacity).fill(null).map(() => []);
    }

    #hash(key) {
        // Simple string hash — sum of char codes × prime, mod capacity
        let hash = 0;
        for (const char of String(key)) {
            hash = (hash * 31 + char.charCodeAt(0)) % this.#capacity;
        }
        return hash;
    }

    set(key, value) {
        const index  = this.#hash(key);
        const bucket = this.#buckets[index];

        for (const entry of bucket) {
            if (entry[0] === key) { entry[1] = value; return; }  // update
        }
        bucket.push([key, value]);
        this.#size++;

        // Resize if load factor exceeded
        if (this.#size / this.#capacity > HashMap.#LOAD_FACTOR) {
            this.#resize();
        }
    }

    get(key) {
        const bucket = this.#buckets[this.#hash(key)];
        for (const [k, v] of bucket) {
            if (k === key) return v;
        }
        return undefined;
    }

    has(key) { return this.get(key) !== undefined; }

    delete(key) {
        const index  = this.#hash(key);
        const bucket = this.#buckets[index];
        const idx    = bucket.findIndex(([k]) => k === key);
        if (idx >= 0) { bucket.splice(idx, 1); this.#size--; return true; }
        return false;
    }

    #resize() {
        const oldBuckets   = this.#buckets;
        this.#capacity    *= 2;
        this.#buckets      = new Array(this.#capacity).fill(null).map(() => []);
        this.#size         = 0;
        for (const bucket of oldBuckets) {
            for (const [k, v] of bucket) this.set(k, v);
        }
    }

    get size() { return this.#size; }
    entries()  { return this.#buckets.flatMap(b => b); }
}

const map = new HashMap();
map.set("name",  "Alice");
map.set("age",   30);
map.set("email", "alice@ex.com");

console.log(map.get("name"));    // "Alice"
console.log(map.has("age"));     // true
console.log(map.has("phone"));   // false
map.delete("email");
console.log(map.size);           // 2
\`\`\`

### JavaScript's Built-in Map vs Plain Object

\`\`\`javascript
// Object {} — fast, simple, great for string keys
const obj = {};
obj["name"] = "Alice";
obj["age"]  = 30;
console.log(obj.name);    // "Alice"
// Limitation: keys are always strings (or symbols)
// Has hidden prototype properties that can cause bugs with some keys

// Map — more powerful, cleaner API
const map2 = new Map();
map2.set("name",  "Alice");    // string key
map2.set(42,      "answer");   // number key!
map2.set({ x: 1 }, "point");  // object key!

console.log(map2.get("name"));   // "Alice"
console.log(map2.get(42));       // "answer"
console.log(map2.size);          // 3

// Iterate — Map preserves insertion order
for (const [key, value] of map2) {
    console.log(\`\${key}: \${value}\`);
}

// Convert between Map and Object
const fromObj  = new Map(Object.entries(obj));
const toObj    = Object.fromEntries(map2);   // only works if all keys are strings/symbols

// When to use which:
// Object: simple key-value, string keys, JSON serialization
// Map:    frequent add/delete, non-string keys, need size, need insertion order
\`\`\`

## Priority Queue (Min-Heap) — Always Get the Minimum

A priority queue always lets you extract the **minimum** (or maximum) element in O(log N) — regardless of insertion order. Built on a heap.

\`\`\`javascript
class MinHeap {
    #data = [];

    // O(log N) — add element, bubble up to restore heap property
    push(item, priority) {
        this.#data.push({ item, priority });
        this.#bubbleUp(this.#data.length - 1);
    }

    // O(log N) — remove minimum, bubble down to restore
    pop() {
        if (this.isEmpty()) throw new Error("Heap underflow");
        const min  = this.#data[0];
        const last = this.#data.pop();
        if (this.#data.length > 0) {
            this.#data[0] = last;
            this.#bubbleDown(0);
        }
        return min;
    }

    peek()    { return this.#data[0] ?? null; }
    isEmpty() { return this.#data.length === 0; }
    size()    { return this.#data.length; }

    // Restore heap property upward after push
    #bubbleUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.#data[parent].priority <= this.#data[i].priority) break;
            [this.#data[parent], this.#data[i]] = [this.#data[i], this.#data[parent]];
            i = parent;
        }
    }

    // Restore heap property downward after pop
    #bubbleDown(i) {
        const n = this.#data.length;
        while (true) {
            let smallest = i;
            const left   = 2 * i + 1;
            const right  = 2 * i + 2;
            if (left  < n && this.#data[left].priority  < this.#data[smallest].priority) smallest = left;
            if (right < n && this.#data[right].priority < this.#data[smallest].priority) smallest = right;
            if (smallest === i) break;
            [this.#data[smallest], this.#data[i]] = [this.#data[i], this.#data[smallest]];
            i = smallest;
        }
    }
}

// Emergency room — most critical patient first
const er = new MinHeap();
er.push("Alice — sprained ankle",   priority: 4);
er.push("Bob — heart attack",       priority: 1);
er.push("Carol — broken arm",       priority: 3);
er.push("David — severe bleeding",  priority: 2);

console.log("Treatment order:");
while (!er.isEmpty()) {
    const { item, priority } = er.pop();
    console.log(\`  Priority \${priority}: \${item}\`);
}
// Priority 1: Bob — heart attack
// Priority 2: David — severe bleeding
// Priority 3: Carol — broken arm
// Priority 4: Alice — sprained ankle

// Top K elements — classic heap application
function topK(nums, k) {
    // Use a MIN-heap of size K
    // When size exceeds K, remove the minimum
    // At the end: heap contains K largest elements
    const heap = new MinHeap();
    for (const n of nums) {
        heap.push(n, n);
        if (heap.size() > k) heap.pop();   // remove smallest
    }
    const result = [];
    while (!heap.isEmpty()) result.unshift(heap.pop().item);
    return result;
}

console.log(topK([3,1,4,1,5,9,2,6,5,3,5], 4));   // [5, 5, 6, 9]
\`\`\`

## Choosing the Right Data Structure

\`\`\`javascript
// Decision guide — ask these questions:

// "Do I need to check if X exists quickly?"
//    → Set (O(1)) — if no associated value
//    → Map (O(1)) — if X maps to a value

// "Do I need LIFO order (undo, DFS, call stack emulation)?"
//    → Stack

// "Do I need FIFO order (BFS, task queue, rate limiting)?"
//    → Queue

// "Do I need O(1) front AND back operations?"
//    → Use two stacks (Queue above) or a deque library

// "Do I always need the minimum or maximum quickly?"
//    → MinHeap / MaxHeap (Priority Queue)

// "Do I need frequent insert/delete at arbitrary positions?"
//    → Linked List (O(1) if you have a pointer to the position)

// "Do I need sorted order + fast insert/delete?"
//    → Balanced BST (not built into JS — use a library)

// COMPLEXITY QUICK REFERENCE:
const complexities = {
    "Array access":        "O(1)",
    "Array search":        "O(N)",
    "Array push/pop":      "O(1)",
    "Array unshift/shift": "O(N)",
    "Set.has/add/delete":  "O(1)",
    "Map.get/set/delete":  "O(1)",
    "Stack push/pop":      "O(1)",
    "Queue enqueue":       "O(1)",
    "Queue dequeue":       "O(1) amortized",
    "LinkedList prepend":  "O(1)",
    "LinkedList append":   "O(N)",
    "LinkedList delete":   "O(N)",
    "Heap push":           "O(log N)",
    "Heap pop":            "O(log N)",
    "Heap peek":           "O(1)",
};
\`\`\`

## A Complete Example: LRU Cache

LRU (Least Recently Used) cache is one of the most famous data structure design problems. It combines a **Map** (O(1) lookup) with a **doubly-linked list** (O(1) reordering).

\`\`\`javascript
// Using JavaScript's Map — which preserves insertion order
class LRUCache {
    #cache;
    #capacity;

    constructor(capacity) {
        this.#capacity = capacity;
        this.#cache    = new Map();
    }

    get(key) {
        if (!this.#cache.has(key)) return -1;
        // Move to end (mark as most recently used)
        const value = this.#cache.get(key);
        this.#cache.delete(key);
        this.#cache.set(key, value);
        return value;
    }

    put(key, value) {
        if (this.#cache.has(key)) {
            this.#cache.delete(key);   // remove old position
        } else if (this.#cache.size >= this.#capacity) {
            // Evict LRU: Map's first entry = oldest = least recently used
            const oldestKey = this.#cache.keys().next().value;
            this.#cache.delete(oldestKey);
        }
        this.#cache.set(key, value);   // add/update at end = most recent
    }

    toString() {
        return \`LRU[\${[...this.#cache.entries()].map(([k,v]) => \`\${k}:\${v}\`).join(", ")}]\`;
    }
}

const lru = new LRUCache(3);
lru.put("a", 1);
lru.put("b", 2);
lru.put("c", 3);
console.log(lru.toString());   // LRU[a:1, b:2, c:3]

lru.get("a");                   // access "a" → moves to end (most recent)
console.log(lru.toString());   // LRU[b:2, c:3, a:1]

lru.put("d", 4);                // capacity exceeded → evict LRU = "b"
console.log(lru.toString());   // LRU[c:3, a:1, d:4]

console.log(lru.get("b"));     // -1 (evicted)
console.log(lru.get("a"));     // 1  (still there)
console.log(lru.toString());   // LRU[c:3, d:4, a:1]
\`\`\`
`,

  fr: `# Structures de données

## Les structures essentielles

\`\`\`javascript
// Pile (Stack) — LIFO : dernier entré, premier sorti
class Pile {
    #elements = [];
    empiler(e)  { this.#elements.push(e); }
    depiler()   { return this.#elements.pop(); }
    sommet()    { return this.#elements[this.#elements.length - 1]; }
    estVide()   { return this.#elements.length === 0; }
}

// File (Queue) — FIFO : premier entré, premier sorti
// ÉVITER arr.shift() — O(N) ! Utiliser deux piles :
class File {
    #entree = []; #sortie = [];
    enfiler(e) { this.#entree.push(e); }
    defiler()  {
        if (this.#sortie.length === 0)
            while (this.#entree.length) this.#sortie.push(this.#entree.pop());
        return this.#sortie.pop();   // O(1) amorti
    }
}
\`\`\`

## File de priorité (Tas min)

\`\`\`javascript
// Toujours extraire le minimum en O(log N)
// Utilisé pour : Dijkstra, tri par tas, top-K éléments, planification

const tas = new MinHeap();
tas.push("Bob — crise cardiaque",  1);   // priorité la plus haute
tas.push("Alice — bras cassé",     3);
tas.push("David — saignement",     2);

// Ordre de traitement : priorité 1, 2, 3
while (!tas.estVide()) {
    const { item, priority } = tas.pop();
    console.log(\`Priorité \${priority}: \${item}\`);
}
\`\`\`

## Cache LRU — Combinaison Map + ordre d'insertion

\`\`\`javascript
class CacheLRU {
    #cache; #capacite;
    constructor(cap) { this.#capacite = cap; this.#cache = new Map(); }

    get(cle) {
        if (!this.#cache.has(cle)) return -1;
        const val = this.#cache.get(cle);
        this.#cache.delete(cle);    // retirer de la position actuelle
        this.#cache.set(cle, val);  // remettre à la fin = plus récent
        return val;
    }

    put(cle, val) {
        if (this.#cache.has(cle)) this.#cache.delete(cle);
        else if (this.#cache.size >= this.#capacite) {
            // Expulser le LRU = première entrée de la Map
            this.#cache.delete(this.#cache.keys().next().value);
        }
        this.#cache.set(cle, val);
    }
}
\`\`\`
`,
};

export const starterCode = {
  default: `// Data Structures — JavaScript Practice

// ─── Stack ────────────────────────────────────────────────
class Stack {
    #items = [];
    push(item)  { this.#items.push(item); }
    pop()       { return this.#items.pop(); }
    peek()      { return this.#items[this.#items.length - 1]; }
    isEmpty()   { return this.#items.length === 0; }
    size()      { return this.#items.length; }
    toString()  { return \`Stack[top→\${[...this.#items].reverse().join(",")}]\`; }
}

// ─── Queue (two-stack, O(1) amortized) ───────────────────
class Queue {
    #in = []; #out = [];
    enqueue(item) { this.#in.push(item); }
    dequeue() {
        if (this.#out.length === 0)
            while (this.#in.length) this.#out.push(this.#in.pop());
        return this.#out.pop();
    }
    peek()    { return this.#out[this.#out.length-1] ?? this.#in[0]; }
    isEmpty() { return this.#in.length === 0 && this.#out.length === 0; }
    size()    { return this.#in.length + this.#out.length; }
}

// ─── MinHeap ─────────────────────────────────────────────
class MinHeap {
    #data = [];
    push(item, priority) {
        this.#data.push({ item, priority });
        let i = this.#data.length - 1;
        while (i > 0) {
            const p = Math.floor((i-1)/2);
            if (this.#data[p].priority <= this.#data[i].priority) break;
            [this.#data[p],this.#data[i]] = [this.#data[i],this.#data[p]];
            i = p;
        }
    }
    pop() {
        const min = this.#data[0];
        const last = this.#data.pop();
        if (this.#data.length > 0) {
            this.#data[0] = last;
            let i = 0;
            while (true) {
                let s = i, l = 2*i+1, r = 2*i+2;
                if (l < this.#data.length && this.#data[l].priority < this.#data[s].priority) s = l;
                if (r < this.#data.length && this.#data[r].priority < this.#data[s].priority) s = r;
                if (s === i) break;
                [this.#data[s],this.#data[i]] = [this.#data[i],this.#data[s]];
                i = s;
            }
        }
        return min;
    }
    peek()    { return this.#data[0]; }
    isEmpty() { return this.#data.length === 0; }
    size()    { return this.#data.length; }
}

// ─── 1. Stack: balanced brackets ─────────────────────────
function isBalanced(str) {
    const stack = new Stack();
    const pairs = { ')':'(', '}':'{', ']':'[' };
    for (const c of str) {
        if ("({[".includes(c)) stack.push(c);
        else if (c in pairs) {
            if (stack.isEmpty() || stack.pop() !== pairs[c]) return false;
        }
    }
    return stack.isEmpty();
}

console.log("=== Balanced Brackets ===");
["({[]})", "((())", "([)]", "{[()]}"].forEach(s =>
    console.log(\`  "\${s}" → \${isBalanced(s)}\`)
);

// ─── 2. Queue: BFS ───────────────────────────────────────
console.log("\\n=== BFS with Queue ===");
const graph = { A:["B","C"], B:["D"], C:["E"], D:["F"], E:[], F:[] };
const q = new Queue();
const visited = new Set(["A"]);
q.enqueue(["A", ["A"]]);

while (!q.isEmpty()) {
    const [node, path] = q.dequeue();
    if (node === "F") { console.log("Path to F:", path.join("→")); break; }
    for (const n of (graph[node]||[])) {
        if (!visited.has(n)) {
            visited.add(n);
            q.enqueue([n, [...path, n]]);
        }
    }
}

// ─── 3. Priority Queue: task scheduling ──────────────────
console.log("\\n=== Priority Queue ===");
const tasks = new MinHeap();
[["Deploy fix",    1],
 ["Write tests",   3],
 ["Review PR",     2],
 ["Update docs",   4],
 ["Fix critical",  1]].forEach(([t,p]) => tasks.push(t, p));

console.log("Task order:");
while (!tasks.isEmpty()) {
    const { item, priority } = tasks.pop();
    console.log(\`  [P\${priority}] \${item}\`);
}

// ─── 4. LRU Cache ────────────────────────────────────────
console.log("\\n=== LRU Cache ===");
class LRU {
    #c; #cap;
    constructor(cap) { this.#cap = cap; this.#c = new Map(); }
    get(k)    {
        if (!this.#c.has(k)) return -1;
        const v = this.#c.get(k); this.#c.delete(k); this.#c.set(k,v); return v;
    }
    put(k, v) {
        if (this.#c.has(k)) this.#c.delete(k);
        else if (this.#c.size >= this.#cap) this.#c.delete(this.#c.keys().next().value);
        this.#c.set(k,v);
    }
    show()    { return [...this.#c.entries()].map(([k,v])=>\`\${k}:\${v}\`).join(", "); }
}

const lru = new LRU(3);
lru.put("a", 1); lru.put("b", 2); lru.put("c", 3);
console.log("After puts:", lru.show());       // a:1, b:2, c:3
lru.get("a");                                  // access a → most recent
lru.put("d", 4);                               // evicts b (LRU)
console.log("After d:", lru.show());          // c:3, a:1, d:4
console.log("get b:", lru.get("b"));          // -1 (evicted)
`,
};

export const exerciseEn = `Data structure design challenges.

1. Implement a 'MinMaxStack' that supports push(), pop(), peek(),
   getMin(), and getMax() — ALL in O(1).
   Hint: maintain two parallel stacks tracking running min and max.
   push(3) → min=3, max=3
   push(1) → min=1, max=3
   push(5) → min=1, max=5
   pop()   → min=1, max=3

2. Design a 'FrequencyMap' class with:
   - add(item) — O(1)
   - remove(item) — O(1)
   - mostFrequent() — O(1) — returns most frequent item
   - leastFrequent() — O(1)
   Hint: use a Map for counts and two heaps for min/max frequency.

3. Implement 'Graph' with:
   - addEdge(u, v, weight=1) — directed edge
   - dijkstra(start) — shortest paths to all nodes (use MinHeap)
   - hasPath(start, end) — boolean DFS/BFS
   Test on: A→B(4), A→C(2), B→D(3), C→B(1), C→D(5)
   dijkstra("A") should give: {A:0, B:3, C:2, D:6}

4. Build a 'Trie' (prefix tree) for autocomplete:
   - insert(word)
   - search(word) → boolean
   - startsWith(prefix) → boolean
   - autocomplete(prefix) → array of words starting with prefix`;

export const exerciseFr = `Défis de conception de structures de données.

1. Implémentez 'PileMinMax' avec push(), pop(), getMin(), getMax() tous en O(1).

2. Concevez 'CarteFrequence' avec add(item), remove(item),
   plusFrequent() O(1), moinsFrequent() O(1).

3. Implémentez 'Graphe' avec addEdge(), dijkstra() et hasPath().

4. Construisez un 'Trie' pour l'autocomplétion.`;

export const solutionCode = {
  default: `// 1. MinMaxStack — O(1) min and max
class MinMaxStack {
    #stack    = [];
    #minStack = [];
    #maxStack = [];

    push(val) {
        this.#stack.push(val);
        const min = this.#minStack.length === 0
            ? val : Math.min(val, this.#minStack[this.#minStack.length - 1]);
        const max = this.#maxStack.length === 0
            ? val : Math.max(val, this.#maxStack[this.#maxStack.length - 1]);
        this.#minStack.push(min);
        this.#maxStack.push(max);
    }

    pop() {
        this.#minStack.pop();
        this.#maxStack.pop();
        return this.#stack.pop();
    }

    peek()   { return this.#stack[this.#stack.length - 1]; }
    getMin() { return this.#minStack[this.#minStack.length - 1]; }
    getMax() { return this.#maxStack[this.#maxStack.length - 1]; }
}

console.log("=== MinMaxStack ===");
const mms = new MinMaxStack();
[3, 1, 5, 2, 4].forEach(n => {
    mms.push(n);
    console.log(\`  push(\${n}) → min=\${mms.getMin()}, max=\${mms.getMax()}\`);
});
mms.pop();
console.log(\`  pop()     → min=\${mms.getMin()}, max=\${mms.getMax()}\`);

// 2. FrequencyMap
class FrequencyMap {
    #counts   = new Map();   // item → count
    #byFreq   = new Map();   // count → Set of items
    #minFreq  = Infinity;
    #maxFreq  = 0;

    add(item) {
        const old = this.#counts.get(item) ?? 0;
        const nw  = old + 1;
        this.#counts.set(item, nw);

        if (old > 0) this.#byFreq.get(old)?.delete(item);
        if (!this.#byFreq.has(nw)) this.#byFreq.set(nw, new Set());
        this.#byFreq.get(nw).add(item);

        this.#maxFreq = Math.max(this.#maxFreq, nw);
        // Recalculate minFreq only if old bucket is now empty
        if (old === this.#minFreq && this.#byFreq.get(old)?.size === 0) {
            this.#minFreq = nw;
        } else {
            this.#minFreq = Math.min(this.#minFreq, nw);
        }
    }

    mostFrequent()  { return [...(this.#byFreq.get(this.#maxFreq) ?? [])][0]; }
    leastFrequent() { return [...(this.#byFreq.get(this.#minFreq) ?? [])][0]; }
    count(item)     { return this.#counts.get(item) ?? 0; }
}

console.log("\\n=== FrequencyMap ===");
const fm = new FrequencyMap();
["a","b","a","c","b","a","c","c","c"].forEach(x => fm.add(x));
console.log("most frequent:", fm.mostFrequent());    // c (4 times)
console.log("least frequent:", fm.leastFrequent()); // b (2 times)
console.log("count a:", fm.count("a"));              // 3

// 3. Dijkstra with MinHeap
class MinHeap {
    #d=[];
    push(it,pr){this.#d.push({it,pr});let i=this.#d.length-1;while(i>0){const p=Math.floor((i-1)/2);if(this.#d[p].pr<=this.#d[i].pr)break;[this.#d[p],this.#d[i]]=[this.#d[i],this.#d[p]];i=p;}}
    pop(){const m=this.#d[0];const l=this.#d.pop();if(this.#d.length){this.#d[0]=l;let i=0;while(true){let s=i,a=2*i+1,b=2*i+2;if(a<this.#d.length&&this.#d[a].pr<this.#d[s].pr)s=a;if(b<this.#d.length&&this.#d[b].pr<this.#d[s].pr)s=b;if(s===i)break;[this.#d[s],this.#d[i]]=[this.#d[i],this.#d[s]];i=s;}}return m;}
    isEmpty(){return this.#d.length===0;}
}

function dijkstra(edges, start) {
    const graph = {};
    for (const [u, v, w] of edges) {
        if (!graph[u]) graph[u] = [];
        graph[u].push([v, w]);
    }

    const dist = {};
    const heap = new MinHeap();
    heap.push(start, 0);
    dist[start] = 0;

    while (!heap.isEmpty()) {
        const { it: node, pr: d } = heap.pop();
        if (d > (dist[node] ?? Infinity)) continue;

        for (const [neighbor, weight] of (graph[node] || [])) {
            const newDist = d + weight;
            if (newDist < (dist[neighbor] ?? Infinity)) {
                dist[neighbor] = newDist;
                heap.push(neighbor, newDist);
            }
        }
    }
    return dist;
}

console.log("\\n=== Dijkstra ===");
const edges = [["A","B",4],["A","C",2],["B","D",3],["C","B",1],["C","D",5]];
const dist  = dijkstra(edges, "A");
console.log(dist);   // { A:0, B:3, C:2, D:6 }

// 4. Trie
class Trie {
    #root = {};

    insert(word) {
        let node = this.#root;
        for (const char of word) {
            if (!node[char]) node[char] = {};
            node = node[char];
        }
        node.$end = true;
    }

    #traverse(prefix) {
        let node = this.#root;
        for (const char of prefix) {
            if (!node[char]) return null;
            node = node[char];
        }
        return node;
    }

    search(word)       { return !!this.#traverse(word)?.$end; }
    startsWith(prefix) { return this.#traverse(prefix) !== null; }

    autocomplete(prefix) {
        const node = this.#traverse(prefix);
        if (!node) return [];
        const results = [];
        const dfs = (n, curr) => {
            if (n.$end) results.push(curr);
            for (const [c, child] of Object.entries(n)) {
                if (c !== "$end") dfs(child, curr + c);
            }
        };
        dfs(node, prefix);
        return results.sort();
    }
}

console.log("\\n=== Trie ===");
const trie = new Trie();
["apple","app","application","apply","banana","band","bandwidth"].forEach(w => trie.insert(w));

console.log("search 'app':", trie.search("app"));         // true
console.log("search 'ap':", trie.search("ap"));            // false
console.log("startsWith 'app':", trie.startsWith("app"));  // true
console.log("autocomplete 'app':", trie.autocomplete("app"));
// ["app", "apple", "application", "apply"]
console.log("autocomplete 'ban':", trie.autocomplete("ban"));
// ["banana", "band", "bandwidth"]
`,
};

export const quiz = {
  en: [
    {
      question: "Why is using an array's shift() method for a queue O(N) and how does the two-stack approach achieve O(1) amortized?",
      options: [
        "shift() sorts the array which is O(N log N), not O(N)",
        "shift() removes the first element and shifts every remaining element one position left — N shifts for N elements, O(N). The two-stack approach avoids this: items enqueue into the 'inbox' stack (O(1) push). When the 'outbox' is empty, ALL inbox items are moved to outbox in one batch (O(N) once). Each subsequent dequeue is O(1) pop from outbox. Each item is moved exactly once in its lifetime, so amortized per-operation cost is O(1).",
        "shift() must rebuild the array's hash table after removal, causing O(N)",
        "The two-stack approach is only O(1) when both stacks have equal size"
      ],
      correct: 1,
    },
    {
      question: "What is the heap property and why does it guarantee O(log N) push and pop?",
      options: [
        "The heap property sorts all elements so the minimum is always at index 0",
        "The heap property states every parent's priority ≤ both children's priorities. The root is always the global minimum. Push adds at the end then bubbles up — it travels at most one path from leaf to root, which is O(log N) for a complete binary tree of N nodes. Pop removes the root, puts the last element at root, then bubbles down — same O(log N) path length.",
        "The heap property uses binary search to find insertion position in O(log N)",
        "The heap property limits the tree to exactly log N levels regardless of N"
      ],
      correct: 1,
    },
    {
      question: "What makes Map better than a plain object {} for certain use cases?",
      options: [
        "Map is always faster than objects — you should always use Map instead of {}",
        "Map supports any key type (numbers, objects, functions) while object keys are always strings or symbols. Map has a reliable .size property. Map guarantees insertion order for iteration. Map has no prototype pollution issues — keys like 'constructor' or 'toString' are safe. Objects are better for: JSON serialization, simple string-keyed data, dot-notation access, and interop with APIs expecting plain objects.",
        "Map automatically sorts its entries alphabetically enabling binary search",
        "Map uses less memory than objects for the same data"
      ],
      correct: 1,
    },
    {
      question: "How does Floyd's cycle detection algorithm detect a linked list cycle in O(1) space?",
      options: [
        "It stores all visited nodes in an array and checks for duplicates",
        "Two pointers start at the head: 'slow' moves 1 node per step, 'fast' moves 2. If there's no cycle, fast reaches null first. If there IS a cycle, both pointers enter it. Since fast gains 1 node per iteration relative to slow, it will eventually lap slow and they meet at the same node. No extra storage needed — just two pointers regardless of list size.",
        "It reverses the list and checks if it equals the original",
        "It counts the total nodes and compares to a previously stored count"
      ],
      correct: 1,
    },
    {
      question: "Why does a Trie enable O(M) prefix search where M is the query length, regardless of how many words are stored?",
      options: [
        "A Trie sorts all words alphabetically enabling binary search by prefix",
        "A Trie stores each character as a node in a tree. To find all words with a prefix, you traverse one node per character of the prefix (O(M)) to reach the prefix's node, then collect all words in that subtree. The number of stored words doesn't affect how quickly you reach the prefix node — it's always M steps. This makes Tries ideal for autocomplete where M is typically small (2-5 characters typed).",
        "Tries limit the alphabet to 26 characters which bounds the search to O(26)",
        "Tries cache the most recent searches so repeated queries are O(1)"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Pourquoi shift() sur un tableau est-il O(N) pour une file, et comment l'approche à deux piles atteint-elle O(1) amorti ?",
      options: [
        "shift() trie le tableau ce qui est O(N log N)",
        "shift() retire le premier élément et décale tous les éléments restants d'une position — N décalages pour N éléments, O(N). L'approche à deux piles : les éléments entrent dans la pile 'entrée' (push O(1)). Quand la pile 'sortie' est vide, TOUS les éléments sont transférés en une seule fois (O(N) une fois). Chaque défilement suivant est un pop O(1). Chaque élément est déplacé exactement une fois → O(1) amorti.",
        "shift() doit reconstruire la table de hachage du tableau après suppression",
        "L'approche à deux piles n'est O(1) que quand les deux piles ont la même taille"
      ],
      correct: 1,
    },
    {
      question: "Quelle est la propriété de tas et pourquoi garantit-elle O(log N) pour push et pop ?",
      options: [
        "La propriété de tas trie tous les éléments pour que le minimum soit toujours à l'index 0",
        "La propriété de tas stipule que la priorité de chaque parent est ≤ à celle de ses deux enfants. La racine est toujours le minimum global. Push ajoute à la fin puis remonte — parcourt au plus un chemin feuille-racine de longueur O(log N). Pop retire la racine, place le dernier élément à la racine, puis descend — même longueur O(log N).",
        "La propriété de tas utilise la recherche binaire pour trouver la position d'insertion en O(log N)",
        "La propriété de tas limite l'arbre à exactement log N niveaux"
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce qui rend Map meilleur qu'un objet {} pour certains cas d'utilisation ?",
      options: [
        "Map est toujours plus rapide que les objets — utilisez toujours Map",
        "Map supporte n'importe quel type de clé (nombres, objets, fonctions) tandis que les clés d'objet sont toujours des chaînes ou symboles. Map a une propriété .size fiable. Map garantit l'ordre d'insertion. Map n'a pas de problèmes de pollution de prototype. Les objets sont meilleurs pour : la sérialisation JSON, les données avec des clés simples.",
        "Map trie automatiquement ses entrées alphabétiquement permettant la recherche binaire",
        "Map utilise moins de mémoire que les objets pour les mêmes données"
      ],
      correct: 1,
    },
    {
      question: "Comment l'algorithme de détection de cycle de Floyd détecte-t-il un cycle en O(1) espace ?",
      options: [
        "Il stocke tous les nœuds visités dans un tableau et vérifie les doublons",
        "Deux pointeurs partent de la tête : 'lent' avance de 1 nœud, 'rapide' avance de 2. Sans cycle, rapide atteint null en premier. S'il y a un cycle, les deux entrent dedans. Rapide gagne 1 nœud par itération sur lent et le rattrape forcément. Pas de stockage supplémentaire — juste deux pointeurs quelle que soit la taille.",
        "Il inverse la liste et vérifie si elle est égale à l'originale",
        "Il compte les nœuds totaux et compare à un compte précédemment stocké"
      ],
      correct: 1,
    },
    {
      question: "Pourquoi un Trie permet-il une recherche de préfixe O(M) où M est la longueur de la requête ?",
      options: [
        "Un Trie trie tous les mots alphabétiquement permettant la recherche binaire par préfixe",
        "Un Trie stocke chaque caractère comme un nœud dans un arbre. Pour trouver tous les mots avec un préfixe, vous parcourez un nœud par caractère du préfixe (O(M)) pour atteindre le nœud du préfixe, puis collectez tous les mots dans ce sous-arbre. Le nombre de mots stockés n'affecte pas la vitesse d'atteindre le nœud — toujours M étapes.",
        "Les Tries limitent l'alphabet à 26 caractères ce qui borne la recherche à O(26)",
        "Les Tries mettent en cache les recherches récentes donc les requêtes répétées sont O(1)"
      ],
      correct: 1,
    },
  ],
};
