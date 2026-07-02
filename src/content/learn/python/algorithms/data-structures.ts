export const id = "data-structures";
export const titleEn = "Data Structures";
export const titleFr = "Structures de données";

export const content = {
  en: `# Data Structures

## Why Data Structures Matter

A data structure is a way of organizing data so that specific operations are fast and efficient. Choosing the wrong data structure is like storing books in a pile on the floor instead of on labeled shelves — everything works eventually, but some tasks become needlessly painful.

\`\`\`
The same problem with different data structures:

Problem: Check if a username is taken (10 million users)

Using a LIST:
  for username in all_users:   # O(N) — check every one
      if username == target: return True
  With 10 million users: ~10 million comparisons per check

Using a SET:
  return target in user_set    # O(1) — hash lookup
  With 10 million users: ~1 comparison per check

Same data. Same answer. 10,000,000x speed difference.
The data structure IS the performance.
\`\`\`

In this lesson we cover the data structures every programmer needs — not just the built-in Python ones, but how to implement them and why they work.

## Stack — Last In, First Out (LIFO)

### The Mental Model

Think of a stack of plates. You add plates to the top and take plates from the top. The last plate you put on is the first one you take off.

\`\`\`
Add ("push"):          Remove ("pop"):
  Top → [C]              Top → [B]
        [B]                    [A]
        [A]
        
C was added last → C comes off first
\`\`\`

### Operations and Their Complexity

\`\`\`
push(item)  — add to top    → O(1)
pop()       — remove top    → O(1)
peek()      — look at top   → O(1) (no removal)
is_empty()  — is it empty?  → O(1)
size()      — how many?     → O(1)
\`\`\`

### Implementation

\`\`\`python
class Stack:
    """
    A stack implemented using a Python list.
    The END of the list is the "top" — append/pop are O(1).
    (Never insert/remove from the FRONT of a list — that's O(N))
    """

    def __init__(self):
        self._items = []   # underscore = "private" by convention

    def push(self, item):
        self._items.append(item)   # O(1)

    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self._items.pop()   # O(1) — removes from end

    def peek(self):
        if self.is_empty():
            raise IndexError("peek at empty stack")
        return self._items[-1]     # O(1) — look at end without removing

    def is_empty(self):
        return len(self._items) == 0

    def size(self):
        return len(self._items)

    def __repr__(self):
        return f"Stack(top → {self._items[::-1]})"


# Usage
stack = Stack()
stack.push("A")
stack.push("B")
stack.push("C")

print(stack)            # Stack(top → ['C', 'B', 'A'])
print(stack.peek())     # C  (just looking)
print(stack.pop())      # C  (removes it)
print(stack.pop())      # B
print(stack.size())     # 1
\`\`\`

### Real-World Uses of Stacks

\`\`\`python
# USE 1: Check balanced brackets — classic stack problem
def is_balanced(text):
    """
    Check if brackets are balanced: (){}[]
    Key insight: when you see a closing bracket, it must match
    the MOST RECENTLY OPENED one. That's LIFO — a stack.
    """
    stack = Stack()
    matching = {')': '(', '}': '{', ']': '['}

    for char in text:
        if char in '({[':
            stack.push(char)       # opening → push onto stack

        elif char in ')}]':
            if stack.is_empty():
                return False       # no matching opener
            top = stack.pop()
            if top != matching[char]:
                return False       # wrong type of opener

    return stack.is_empty()        # all openers must be matched

print(is_balanced("(())")       )  # True
print(is_balanced("{[()]}")     )  # True
print(is_balanced("(()")        )  # False — unclosed (
print(is_balanced("([)]")       )  # False — wrong order

# USE 2: Undo/Redo functionality
class TextEditor:
    def __init__(self):
        self.text       = ""
        self.undo_stack = Stack()
        self.redo_stack = Stack()

    def type(self, characters):
        self.undo_stack.push(self.text)   # save current state
        self.redo_stack = Stack()         # clear redo history
        self.text += characters

    def undo(self):
        if not self.undo_stack.is_empty():
            self.redo_stack.push(self.text)
            self.text = self.undo_stack.pop()

    def redo(self):
        if not self.redo_stack.is_empty():
            self.undo_stack.push(self.text)
            self.text = self.redo_stack.pop()

editor = TextEditor()
editor.type("Hello")
editor.type(", World")
print(editor.text)   # Hello, World
editor.undo()
print(editor.text)   # Hello
editor.redo()
print(editor.text)   # Hello, World
\`\`\`

## Queue — First In, First Out (FIFO)

### The Mental Model

Think of a queue of people waiting in line. The first person to join the line is the first to be served.

\`\`\`
Enqueue (join back):    Dequeue (leave front):
  Front → [A][B][C] ← Back    [B][C] ← Back
  A was first → A leaves first
\`\`\`

### Implementation with deque

\`\`\`python
from collections import deque

class Queue:
    """
    A queue implemented using collections.deque.
    
    WHY deque and not list?
    list.pop(0) is O(N) — shifts every element left.
    deque.popleft() is O(1) — designed for this exact use case.
    
    deque = double-ended queue, O(1) add/remove from BOTH ends.
    """

    def __init__(self):
        self._items = deque()

    def enqueue(self, item):
        self._items.append(item)      # add to back O(1)

    def dequeue(self):
        if self.is_empty():
            raise IndexError("dequeue from empty queue")
        return self._items.popleft()  # remove from front O(1)

    def peek(self):
        if self.is_empty():
            raise IndexError("peek at empty queue")
        return self._items[0]         # look at front O(1)

    def is_empty(self):
        return len(self._items) == 0

    def size(self):
        return len(self._items)

    def __repr__(self):
        return f"Queue(front → {list(self._items)} ← back)"


queue = Queue()
queue.enqueue("Alice")
queue.enqueue("Bob")
queue.enqueue("Carol")

print(queue)             # Queue(front → ['Alice', 'Bob', 'Carol'] ← back)
print(queue.dequeue())   # Alice (first in, first out)
print(queue.dequeue())   # Bob
print(queue.peek())      # Carol (still in queue)
\`\`\`

### Real-World Uses of Queues

\`\`\`python
# USE 1: BFS (Breadth-First Search) — always uses a queue
from collections import deque

def bfs(graph, start, target):
    """
    Find shortest path in an unweighted graph using BFS.
    A graph is a dict: node → list of neighbors.
    """
    queue   = deque([(start, [start])])   # (current_node, path_so_far)
    visited = {start}

    while queue:
        node, path = queue.popleft()   # process oldest first

        if node == target:
            return path   # found shortest path!

        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))

    return None   # no path exists

# Social network: who can Alice reach in the fewest steps?
network = {
    "Alice": ["Bob", "Carol"],
    "Bob":   ["Alice", "David"],
    "Carol": ["Alice", "Eve"],
    "David": ["Bob", "Frank"],
    "Eve":   ["Carol"],
    "Frank": ["David"],
}

path = bfs(network, "Alice", "Frank")
print(f"Shortest path: {' → '.join(path)}")
# Alice → Bob → David → Frank

# USE 2: Task scheduling (print queue, job queue)
class PrintQueue:
    def __init__(self):
        self.queue = Queue()

    def submit(self, document):
        self.queue.enqueue(document)
        print(f"Queued: {document}")

    def process_next(self):
        if not self.queue.is_empty():
            doc = self.queue.dequeue()
            print(f"Printing: {doc}")

printer = PrintQueue()
printer.submit("Report.pdf")
printer.submit("Invoice.pdf")
printer.submit("Photo.jpg")
printer.process_next()   # Report.pdf (first submitted, first printed)
printer.process_next()   # Invoice.pdf
\`\`\`

## Linked List — Nodes Connected by Pointers

### The Mental Model

A linked list is like a treasure hunt. Each clue (node) tells you the value AND where to find the next clue. You can only travel forward — you can't jump to the middle directly.

\`\`\`
Node:    [value | next →]

List: [3 | →] → [7 | →] → [1 | →] → [9 | None]
       head                             tail

Each node has:
  - A VALUE (the data)
  - A NEXT pointer (address of the next node, or None if last)
\`\`\`

### Why use linked lists?

\`\`\`
Linked List vs Python List:

Inserting at the FRONT:
  Python list: O(N) — must shift every element right
  Linked list: O(1) — just update the head pointer

Inserting in the MIDDLE (you already have a pointer to that position):
  Python list: O(N) — must shift elements
  Linked list: O(1) — just update two pointers

Random access by index:
  Python list: O(1) — memory is contiguous, direct calculation
  Linked list: O(N) — must walk from head to index

Trade-off: linked lists are better for frequent insertions/deletions,
           worse for random access.
\`\`\`

### Implementation

\`\`\`python
class Node:
    """A single node in a linked list."""
    def __init__(self, value):
        self.value = value
        self.next  = None   # points to next node (or None if last)

class LinkedList:
    def __init__(self):
        self.head = None   # pointer to first node
        self.size = 0

    def prepend(self, value):
        """Add to the FRONT — O(1)."""
        new_node = Node(value)
        new_node.next = self.head   # new node points to old head
        self.head = new_node        # head now points to new node
        self.size += 1

    def append(self, value):
        """Add to the END — O(N) (must walk to find the end)."""
        new_node = Node(value)
        if self.head is None:
            self.head = new_node
        else:
            # Walk to the last node
            current = self.head
            while current.next is not None:
                current = current.next
            current.next = new_node   # last node points to new node
        self.size += 1

    def delete(self, value):
        """Remove first node with this value — O(N)."""
        if self.head is None:
            return

        # Special case: deleting the head
        if self.head.value == value:
            self.head = self.head.next
            self.size -= 1
            return

        # Walk until we find the node BEFORE the one to delete
        current = self.head
        while current.next is not None:
            if current.next.value == value:
                current.next = current.next.next   # skip over deleted node
                self.size -= 1
                return
            current = current.next

    def search(self, value):
        """Find value — O(N)."""
        current = self.head
        index   = 0
        while current is not None:
            if current.value == value:
                return index
            current = current.next
            index  += 1
        return -1

    def to_list(self):
        """Convert to Python list for easy viewing."""
        result  = []
        current = self.head
        while current is not None:
            result.append(current.value)
            current = current.next
        return result

    def __repr__(self):
        nodes = self.to_list()
        return " → ".join(str(n) for n in nodes) + " → None"


ll = LinkedList()
ll.append(3)
ll.append(7)
ll.append(1)
ll.prepend(9)       # add 9 to front

print(ll)           # 9 → 3 → 7 → 1 → None
print(ll.search(7)) # 2 (index)

ll.delete(3)
print(ll)           # 9 → 7 → 1 → None
print(ll.size)      # 3
\`\`\`

## Hash Map — The Most Useful Data Structure

### The Mental Model

A hash map (Python's dict) maps **keys to values** using a hash function. The magic is that it can store and retrieve any value in O(1) time — regardless of how many items it contains.

\`\`\`
Key → hash function → index in array → value

"Alice" → hash("Alice") = 923847 → 923847 % 1000 = 847 → array[847] = 92

Lookup: "Alice" → same hash → same index → value 92
        One calculation, no searching.
\`\`\`

### Building a simple hash map

\`\`\`python
class HashMap:
    """
    A simplified hash map to understand the mechanics.
    Python's dict does this — and much more — already.
    This is for understanding HOW it works.
    """

    def __init__(self, capacity=16):
        self.capacity = capacity
        self.buckets  = [[] for _ in range(capacity)]   # list of lists
        self.count    = 0

    def _hash(self, key):
        """Convert key to bucket index."""
        return hash(key) % self.capacity

    def put(self, key, value):
        """Store key → value. O(1) average."""
        index  = self._hash(key)
        bucket = self.buckets[index]

        # Check if key already exists → update it
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return

        # New key → add to bucket
        bucket.append((key, value))
        self.count += 1

    def get(self, key, default=None):
        """Retrieve value for key. O(1) average."""
        index  = self._hash(key)
        bucket = self.buckets[index]

        for k, v in bucket:
            if k == key:
                return v
        return default

    def delete(self, key):
        """Remove key. O(1) average."""
        index  = self._hash(key)
        bucket = self.buckets[index]
        self.buckets[index] = [(k, v) for k, v in bucket if k != key]

    def __contains__(self, key):
        return self.get(key) is not None

    def __repr__(self):
        pairs = []
        for bucket in self.buckets:
            pairs.extend(bucket)
        return str(dict(pairs))


hm = HashMap()
hm.put("Alice", 92)
hm.put("Bob",   85)
hm.put("Carol", 78)

print(hm.get("Alice"))   # 92
print(hm.get("Dave"))    # None
print("Bob" in hm)       # True

hm.put("Alice", 95)      # update
print(hm.get("Alice"))   # 95
\`\`\`

### Why each bucket is a list: Handling collisions

\`\`\`
Two different keys can hash to the same index — this is called a COLLISION.

"Alice" → hash → index 5
"Zara"  → hash → index 5   ← same index!

Python handles this by storing a LIST at each index (chaining).
index 5: [("Alice", 92), ("Zara", 88)]

On lookup: go to index 5, scan the short list for matching key.
In practice: buckets are tiny (1-2 items) so lookup is effectively O(1).

When the hash map gets too full (load factor > 0.75), Python
automatically resizes (doubles capacity) and rehashes everything.
This keeps buckets small and lookups fast.
\`\`\`

## Priority Queue (Heap) — Always Get the Minimum

### The Mental Model

A priority queue is like a hospital emergency room — patients don't wait in arrival order, they're seen in order of urgency. The most urgent patient is always next.

\`\`\`
Regular queue: [Alice, Bob, Carol]  → Alice leaves first (arrival order)
Priority queue: [(3, Alice), (1, Bob), (2, Carol)]
                → Bob leaves first (lowest priority number = most urgent)
\`\`\`

### Implementation using Python's heapq

\`\`\`python
import heapq

class PriorityQueue:
    """
    A min-heap priority queue.
    Smallest priority number = highest priority = comes out first.
    
    Python's heapq module implements a binary min-heap:
    - Parent is always smaller than its children
    - The root (index 0) is always the minimum
    - push and pop are O(log N)
    """

    def __init__(self):
        self._heap = []
        self._counter = 0   # tie-breaker for equal priorities

    def push(self, item, priority):
        # Tuple (priority, counter, item) — counter breaks ties
        # (needed because items might not be comparable)
        heapq.heappush(self._heap, (priority, self._counter, item))
        self._counter += 1

    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty priority queue")
        priority, _, item = heapq.heappop(self._heap)
        return item, priority

    def peek(self):
        if self.is_empty():
            raise IndexError("peek at empty priority queue")
        priority, _, item = self._heap[0]
        return item, priority

    def is_empty(self):
        return len(self._heap) == 0

    def size(self):
        return len(self._heap)


# Hospital emergency room
er = PriorityQueue()
er.push("Alice — broken arm",    priority=3)   # less urgent
er.push("Bob — heart attack",    priority=1)   # most urgent
er.push("Carol — high fever",    priority=2)   # medium urgent
er.push("David — paper cut",     priority=5)   # least urgent

print("Treatment order:")
while not er.is_empty():
    patient, priority = er.pop()
    print(f"  Priority {priority}: {patient}")

# Priority 1: Bob — heart attack
# Priority 2: Carol — high fever
# Priority 3: Alice — broken arm
# Priority 5: David — paper cut
\`\`\`

### How the heap works internally

\`\`\`
A heap is a BINARY TREE stored as an array:

Array:  [1,  3,  2,  7,  5,  4,  6]
Index:   0   1   2   3   4   5   6

Tree:
         1        ← index 0 (always minimum)
        / \\
       3   2      ← indices 1, 2
      / \\ / \\
     7  5 4  6   ← indices 3, 4, 5, 6

Parent of index i:  (i - 1) // 2
Left child of i:    2*i + 1
Right child of i:   2*i + 2

Heap property: parent ≤ both children (min-heap)
Guarantee: array[0] is always the minimum.

heappush: add to end, "bubble up" until heap property restored → O(log N)
heappop:  remove root, put last element at root, "bubble down" → O(log N)
\`\`\`

## Choosing the Right Data Structure

\`\`\`
You need to...                          Use...

Access by index                         list (Python's built-in)
Check membership (exact match)          set or dict (O(1) vs list's O(N))
Map keys to values                      dict
Remove/add at both ends efficiently     collections.deque
LIFO order (undo, call stack, DFS)      stack (list with append/pop)
FIFO order (scheduling, BFS)            queue (collections.deque)
Frequent insert/delete in middle        linked list
Always get the minimum/maximum          heapq (priority queue)
Sorted order + fast insert/delete       sortedcontainers.SortedList (3rd party)

Quick lookup table:

Operation          | list  | set   | dict  | deque
───────────────────|───────|───────|───────|──────
Access by index    | O(1)  | N/A   | N/A   | O(N)
Search (x in ...)  | O(N)  | O(1)  | O(1)  | O(N)
Insert at end      | O(1)  | O(1)  | O(1)  | O(1)
Insert at front    | O(N)  | O(1)  | N/A   | O(1)
Delete by value    | O(N)  | O(1)  | O(1)  | O(N)
Delete by index    | O(N)  | N/A   | N/A   | O(N)
\`\`\`

## A Complete Example: LRU Cache

LRU (Least Recently Used) cache is a real interview problem that combines multiple data structures:

\`\`\`python
from collections import OrderedDict

class LRUCache:
    """
    A cache that holds at most 'capacity' items.
    When full, evicts the Least Recently Used item.
    
    Uses OrderedDict which maintains insertion order.
    Most recently used = at the end.
    Least recently used = at the front (evicted when full).
    
    All operations are O(1).
    """

    def __init__(self, capacity):
        self.capacity = capacity
        self.cache    = OrderedDict()   # maintains order

    def get(self, key):
        if key not in self.cache:
            return -1
        # Move to end (mark as most recently used)
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)   # update: move to end
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            # Evict LRU item (the one at the front)
            self.cache.popitem(last=False)

    def __repr__(self):
        return f"LRU{dict(self.cache)} (capacity={self.capacity})"


cache = LRUCache(3)
cache.put("a", 1)
cache.put("b", 2)
cache.put("c", 3)
print(cache)           # LRU{'a': 1, 'b': 2, 'c': 3}

cache.get("a")         # access "a" → moves to end (most recent)
print(cache)           # LRU{'b': 2, 'c': 3, 'a': 1}

cache.put("d", 4)      # cache full → evict LRU = "b"
print(cache)           # LRU{'c': 3, 'a': 1, 'd': 4}

print(cache.get("b"))  # -1 (was evicted)
print(cache.get("a"))  # 1  (still there, was recently used)
\`\`\`
`,

  fr: `# Structures de données

## Pourquoi les structures de données sont importantes

Une structure de données est une façon d'organiser les données pour que des opérations spécifiques soient rapides. Choisir la mauvaise est comme ranger des livres en pile sur le sol au lieu d'étagères étiquetées.

## Pile (Stack) — Dernier entré, premier sorti (LIFO)

\`\`\`python
class Pile:
    def __init__(self):
        self._elements = []

    def empiler(self, element):
        self._elements.append(element)    # O(1)

    def depiler(self):
        if self.est_vide():
            raise IndexError("dépiler d'une pile vide")
        return self._elements.pop()       # O(1)

    def sommet(self):
        return self._elements[-1]         # O(1)

    def est_vide(self):
        return len(self._elements) == 0

# Utilisation réelle : vérifier les parenthèses équilibrées
def est_equilibre(texte):
    pile = Pile()
    correspondance = {')': '(', '}': '{', ']': '['}
    for char in texte:
        if char in '({[':
            pile.empiler(char)
        elif char in ')}]':
            if pile.est_vide() or pile.depiler() != correspondance[char]:
                return False
    return pile.est_vide()

print(est_equilibre("({[]})"))  # True
print(est_equilibre("([)]"))    # False
\`\`\`

## File (Queue) — Premier entré, premier sorti (FIFO)

\`\`\`python
from collections import deque

class File:
    def __init__(self):
        self._elements = deque()   # deque pour O(1) des deux côtés

    def enfiler(self, element):
        self._elements.append(element)      # ajouter à la fin O(1)

    def defiler(self):
        if self.est_vide():
            raise IndexError("défiler d'une file vide")
        return self._elements.popleft()     # retirer du début O(1)

    def est_vide(self):
        return len(self._elements) == 0
\`\`\`

## File de priorité (Tas) — Toujours obtenir le minimum

\`\`\`python
import heapq

# Salle d'urgences — les patients les plus urgents passent en premier
urgences = []
heapq.heappush(urgences, (3, "Alice — bras cassé"))
heapq.heappush(urgences, (1, "Bob — crise cardiaque"))
heapq.heappush(urgences, (2, "Carol — forte fièvre"))

print("Ordre de traitement :")
while urgences:
    priorite, patient = heapq.heappop(urgences)
    print(f"  Priorité {priorite}: {patient}")
# Priorité 1: Bob (le plus urgent en premier)
\`\`\`

## Choisir la bonne structure de données

\`\`\`
Vous avez besoin de...                 Utilisez...

Accès par index                        list
Vérifier l'appartenance                set ou dict (O(1) vs O(N) pour list)
Associer clés à valeurs                dict
Supprimer/ajouter aux deux extrémités  collections.deque
Ordre LIFO (annuler, DFS)              pile (list avec append/pop)
Ordre FIFO (planification, BFS)        file (collections.deque)
Toujours obtenir le minimum            heapq
\`\`\`
`,
};

export const starterCode = {
  default: `# Data Structures — Practice
from collections import deque
import heapq

# ─── Stack ───
class Stack:
    def __init__(self):
        self._items = []
    def push(self, item):
        self._items.append(item)
    def pop(self):
        if self.is_empty(): raise IndexError("empty stack")
        return self._items.pop()
    def peek(self):
        return self._items[-1]
    def is_empty(self):
        return len(self._items) == 0
    def size(self):
        return len(self._items)

# ─── Queue ───
class Queue:
    def __init__(self):
        self._items = deque()
    def enqueue(self, item):
        self._items.append(item)
    def dequeue(self):
        if self.is_empty(): raise IndexError("empty queue")
        return self._items.popleft()
    def is_empty(self):
        return len(self._items) == 0
    def size(self):
        return len(self._items)

# ─── Test Stack: balanced brackets ───
def is_balanced(text):
    stack = Stack()
    matching = {')': '(', '}': '{', ']': '['}
    for char in text:
        if char in '({[':
            stack.push(char)
        elif char in ')}]':
            if stack.is_empty() or stack.pop() != matching[char]:
                return False
    return stack.is_empty()

print("=== Stack: Balanced Brackets ===")
tests = ["(())", "{[()]}", "(()", "([)]", ""]
for t in tests:
    print(f"  '{t}' → {is_balanced(t)}")

# ─── Test Queue: BFS ───
def bfs(graph, start, end):
    queue   = Queue()
    visited = {start}
    queue.enqueue([start])
    while not queue.is_empty():
        path = queue.dequeue()
        node = path[-1]
        if node == end:
            return path
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.enqueue(path + [neighbor])
    return None

print("\\n=== Queue: BFS Shortest Path ===")
graph = {"A": ["B","C"], "B": ["A","D"], "C": ["A","E"], "D": ["B","F"], "E": ["C"], "F": ["D"]}
path = bfs(graph, "A", "F")
print(f"  A → F: {' → '.join(path)}")

# ─── Priority Queue ───
print("\\n=== Priority Queue ===")
pq = []
heapq.heappush(pq, (3, "low priority task"))
heapq.heappush(pq, (1, "urgent task"))
heapq.heappush(pq, (2, "normal task"))

while pq:
    priority, task = heapq.heappop(pq)
    print(f"  [{priority}] {task}")
`,
};

export const exerciseEn = `Data structure challenges — implement and apply.

1. Implement a 'MinStack' that supports push(), pop(), peek(),
   AND get_min() — all in O(1).
   Hint: use a second stack to track the current minimum.
   Example: push 3, push 1, push 4 → get_min() = 1
            pop() → get_min() = 1 (still, 4 was popped)
            pop() → get_min() = 3

2. Implement a 'CircularQueue' with fixed capacity.
   When full, adding a new item overwrites the oldest.
   (Used in audio buffers, network packet queues)

3. Use a heap to find the K largest numbers from a list
   of N numbers in O(N log K) time.
   find_k_largest([3,1,4,1,5,9,2,6,5,3], k=3) → [9, 6, 5]

4. Implement a simple graph class with:
   - add_edge(u, v)
   - bfs(start) → list of nodes in BFS order
   - dfs(start) → list of nodes in DFS order
   Test on: A→B, A→C, B→D, C→D, D→E`;

export const exerciseFr = `Défis de structures de données — implémenter et appliquer.

1. Implémentez 'PileMin' qui supporte empiler(), dépiler(), sommet()
   ET get_min() — tous en O(1).
   Astuce : utilisez une seconde pile pour suivre le minimum actuel.

2. Implémentez une 'FileCirculaire' avec une capacité fixe.
   Quand pleine, ajouter un élément écrase le plus ancien.

3. Utilisez un tas pour trouver les K plus grands nombres d'une liste
   de N nombres en O(N log K).

4. Implémentez une classe graphe simple avec BFS et DFS.`;

export const solutionCode = {
  default: `import heapq
from collections import deque

# 1. MinStack — O(1) minimum at all times
class MinStack:
    def __init__(self):
        self.stack     = []
        self.min_stack = []   # parallel stack tracking minimums

    def push(self, val):
        self.stack.append(val)
        # Track current minimum: push min(new val, current min)
        if self.min_stack:
            self.min_stack.append(min(val, self.min_stack[-1]))
        else:
            self.min_stack.append(val)

    def pop(self):
        self.min_stack.pop()
        return self.stack.pop()

    def peek(self):
        return self.stack[-1]

    def get_min(self):
        return self.min_stack[-1]   # O(1) — always at top!

ms = MinStack()
for val in [3, 1, 4, 1, 5]:
    ms.push(val)
    print(f"push({val}) → min={ms.get_min()}")
ms.pop(); print(f"pop() → min={ms.get_min()}")
ms.pop(); print(f"pop() → min={ms.get_min()}")

# 2. K largest using a min-heap of size K
def find_k_largest(numbers, k):
    heap = []
    for num in numbers:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)   # remove smallest — keep only K largest
    return sorted(heap, reverse=True)

nums = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
print(f"\\n3 largest: {find_k_largest(nums, 3)}")   # [9, 6, 5]
print(f"5 largest: {find_k_largest(nums, 5)}")   # [9, 6, 5, 5, 4]

# 3. Graph with BFS and DFS
class Graph:
    def __init__(self):
        self.adjacency = {}   # node → list of neighbors

    def add_edge(self, u, v):
        self.adjacency.setdefault(u, []).append(v)
        self.adjacency.setdefault(v, []).append(u)

    def bfs(self, start):
        visited = {start}
        queue   = deque([start])
        order   = []
        while queue:
            node = queue.popleft()
            order.append(node)
            for neighbor in sorted(self.adjacency.get(node, [])):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return order

    def dfs(self, start, visited=None):
        if visited is None:
            visited = set()
        visited.add(start)
        order = [start]
        for neighbor in sorted(self.adjacency.get(start, [])):
            if neighbor not in visited:
                order.extend(self.dfs(neighbor, visited))
        return order

g = Graph()
for u, v in [("A","B"),("A","C"),("B","D"),("C","D"),("D","E")]:
    g.add_edge(u, v)

print(f"\\nBFS from A: {g.bfs('A')}")
print(f"DFS from A: {g.dfs('A')}")
`,
};

export const quiz = {
  en: [
    {
      question:
        "Why should you use collections.deque instead of a list when implementing a queue?",
      options: [
        "deque uses less memory than a list",
        "list.pop(0) is O(N) because it must shift every remaining element left to fill the gap. deque.popleft() is O(1) because it's implemented as a doubly-linked list designed specifically for O(1) additions and removals from both ends.",
        "deque supports more operations than a list",
        "deque automatically sorts items in FIFO order",
      ],
      correct: 1,
    },
    {
      question:
        "A stack uses LIFO order. What real-world programming feature relies on exactly this behavior?",
      options: [
        "Network packet routing — packets must arrive in order",
        "The function call stack — when function A calls B which calls C, C finishes first (most recent call returns first), then B, then A. This is exactly LIFO. It's also why stack overflow is named after a full call stack.",
        "Database indexing — records are retrieved in insertion order",
        "Memory allocation — new memory is always allocated at the front",
      ],
      correct: 1,
    },
    {
      question:
        "A hash map has O(1) average lookup. Why 'average' instead of 'guaranteed'?",
      options: [
        "Hash maps slow down when the computer has low memory",
        "Hash collisions — two different keys can hash to the same index. The lookup must scan the bucket (a short list) to find the right key. Usually buckets have 0-2 items (O(1) effectively), but in a pathological case all keys hash to one bucket giving O(N). Python's dict uses a good hash function to make this essentially impossible.",
        "The O(1) guarantee only applies to string keys, not integers",
        "Hash maps are only O(1) when the capacity is a prime number",
      ],
      correct: 1,
    },
    {
      question:
        "What is the heap property, and why does it guarantee that heappop() always returns the minimum?",
      options: [
        "The heap sorts all items in ascending order making the first item the minimum",
        "The heap property states every parent is ≤ both its children. This means the root (index 0) is always the global minimum — no item is smaller than the root. heappop() removes the root, then restores the heap property by bubbling down, giving the next minimum at the root for the next pop.",
        "heappop() searches the entire heap each time to find and return the minimum",
        "The heap stores items in a dictionary mapping priorities to values",
      ],
      correct: 1,
    },
    {
      question:
        "When would a linked list be a better choice than a Python list?",
      options: [
        "When you need fast access to elements by index",
        "When you frequently insert or delete elements at the FRONT or MIDDLE of the collection. Python list insert(0, x) is O(N) — shifts all elements. Linked list prepend is O(1) — just update the head pointer. Trade-off: linked lists lose O(1) random access (must walk from head).",
        "When the list contains more than 1,000 elements",
        "When you need to sort the collection frequently",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi utiliser collections.deque au lieu d'une liste pour implémenter une file ?",
      options: [
        "deque utilise moins de mémoire qu'une liste",
        "list.pop(0) est O(N) car il doit décaler chaque élément restant vers la gauche. deque.popleft() est O(1) car il est implémenté comme une liste doublement chaînée conçue spécifiquement pour des ajouts/suppressions O(1) aux deux extrémités.",
        "deque supporte plus d'opérations qu'une liste",
        "deque trie automatiquement les éléments en ordre FIFO",
      ],
      correct: 1,
    },
    {
      question:
        "Une pile utilise l'ordre LIFO. Quelle fonctionnalité de programmation réelle repose exactement sur ce comportement ?",
      options: [
        "Le routage des paquets réseau — les paquets doivent arriver dans l'ordre",
        "La pile d'appels de fonctions — quand A appelle B qui appelle C, C se termine en premier (l'appel le plus récent retourne en premier), puis B, puis A. C'est exactement LIFO. C'est aussi pourquoi le dépassement de pile (stack overflow) est nommé d'après une pile d'appels pleine.",
        "L'indexation de base de données — les enregistrements sont récupérés dans l'ordre d'insertion",
        "L'allocation mémoire — la nouvelle mémoire est toujours allouée au début",
      ],
      correct: 1,
    },
    {
      question:
        "Un HashMap a une recherche O(1) en moyenne. Pourquoi 'en moyenne' plutôt que 'garanti' ?",
      options: [
        "Les hashmaps ralentissent quand l'ordinateur a peu de mémoire",
        "Les collisions de hachage — deux clés différentes peuvent hacher vers le même index. La recherche doit scanner le bucket (une courte liste) pour trouver la bonne clé. Habituellement les buckets ont 0-2 éléments (O(1) effectivement), mais dans un cas pathologique toutes les clés hachent vers un bucket donnant O(N).",
        "La garantie O(1) s'applique uniquement aux clés chaînes, pas aux entiers",
        "Les hashmaps ne sont O(1) que quand la capacité est un nombre premier",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle est la propriété de tas, et pourquoi garantit-elle que heappop() retourne toujours le minimum ?",
      options: [
        "Le tas trie tous les éléments par ordre croissant faisant du premier élément le minimum",
        "La propriété de tas stipule que chaque parent est ≤ ses deux enfants. Cela signifie que la racine (index 0) est toujours le minimum global. heappop() retire la racine, puis restaure la propriété de tas en descendant, donnant le prochain minimum à la racine.",
        "heappop() cherche dans tout le tas à chaque fois pour trouver et retourner le minimum",
        "Le tas stocke les éléments dans un dictionnaire associant priorités à valeurs",
      ],
      correct: 1,
    },
    {
      question:
        "Quand une liste chaînée serait-elle un meilleur choix qu'une liste Python ?",
      options: [
        "Quand vous avez besoin d'un accès rapide aux éléments par index",
        "Quand vous insérez ou supprimez fréquemment des éléments au DÉBUT ou au MILIEU. list.insert(0, x) est O(N) — décale tous les éléments. L'ajout en tête d'une liste chaînée est O(1) — met juste à jour le pointeur de tête. Compromis : les listes chaînées perdent l'accès aléatoire O(1).",
        "Quand la liste contient plus de 1 000 éléments",
        "Quand vous avez besoin de trier fréquemment la collection",
      ],
      correct: 1,
    },
  ],
};
