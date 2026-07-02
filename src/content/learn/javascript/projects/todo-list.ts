export const id = "todo-list";
export const titleEn = "Todo List";
export const titleFr = "Liste de tâches";
export const descriptionEn =
  "Build a full-featured todo app with priorities, tags, filtering, and localStorage persistence.";
export const descriptionFr =
  "Construisez une application de tâches complète avec priorités, tags, filtrage et persistance.";

export const steps = [
  {
    titleEn: "Step 1 — Task Data Structure",
    titleFr: "Étape 1 — Structure de données des tâches",
    contentEn: `## Step 1 — Task Data Structure

A todo list seems simple — just an array of strings. But a real task manager needs much more than that. Before writing any logic, we decide what a **task** actually is.

\`\`\`javascript
// Naive approach — just strings
const todos = ["Buy milk", "Call dentist", "Finish report"];
// Can't track completion. Can't sort by priority. Can't filter by tag.
// Can't know when it was created or when it's due.

// Complete task object
const task = {
    id:          "uuid-or-timestamp",
    title:       "Finish quarterly report",
    done:        false,
    priority:    "high",           // "low" | "medium" | "high"
    tags:        ["work", "q4"],   // multiple tags for filtering
    dueDate:     "2024-01-20",     // ISO date string or null
    createdAt:   "2024-01-10",
    completedAt: null,             // set when done=true
    notes:       "Include charts from Finance team",
};
\`\`\`

We use a **Map** for O(1) lookup by ID. Tasks also need a **stable unique ID** — not an array index (which changes when items are deleted) but a genuine identifier that never changes for the life of the task.

We generate IDs using \`Date.now() + Math.random()\` — not cryptographically secure but collision-resistant enough for a todo app.`,

    contentFr: `## Étape 1 — Structure de données des tâches

Une liste de tâches semble simple — juste un tableau de chaînes. Mais un vrai gestionnaire de tâches a besoin de bien plus. Nous décidons ce qu'est réellement une **tâche** avant d'écrire la logique.

Nous utilisons une **Map** pour un accès O(1) par ID. Les tâches ont besoin d'un **ID stable et unique** — pas un index de tableau (qui change quand des éléments sont supprimés).`,

    starterCode: {
      default: `// Step 1: Task data structure

// Generate a simple unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Create a task with sensible defaults
function createTask(title, options = {}) {
    if (!title?.trim()) throw new Error("Task title is required");

    return {
        id:          generateId(),
        title:       title.trim(),
        done:        false,
        priority:    options.priority    ?? "medium",   // low | medium | high
        tags:        options.tags        ?? [],
        dueDate:     options.dueDate     ?? null,
        notes:       options.notes       ?? "",
        createdAt:   new Date().toISOString().split("T")[0],
        completedAt: null,
    };
}

// The todo store — Map for O(1) lookup
const tasks = new Map();

function addTask(title, options = {}) {
    const task = createTask(title, options);
    tasks.set(task.id, task);
    return task;
}

// Seed with sample tasks
const sampleTasks = [
    ["Buy groceries",          { priority:"high",   tags:["personal","errands"],  dueDate:"2024-01-15" }],
    ["Call dentist",           { priority:"high",   tags:["personal","health"],   dueDate:"2024-01-12" }],
    ["Finish quarterly report",{ priority:"high",   tags:["work","q4"],           dueDate:"2024-01-20" }],
    ["Read JS algorithms book",{ priority:"medium", tags:["learning","tech"] }],
    ["Team standup prep",      { priority:"medium", tags:["work"],                dueDate:"2024-01-11" }],
    ["Clean apartment",        { priority:"low",    tags:["personal","home"] }],
    ["Review pull requests",   { priority:"medium", tags:["work","tech"] }],
    ["Plan weekend trip",      { priority:"low",    tags:["personal","travel"] }],
];

sampleTasks.forEach(([title, opts]) => addTask(title, opts));

// Mark some as done
const taskArray = [...tasks.values()];
taskArray[0].done = true;
taskArray[0].completedAt = "2024-01-10";
taskArray[4].done = true;
taskArray[4].completedAt = "2024-01-11";

// Display all tasks
console.log("=== Task Store ===");
console.log(\`Total tasks: \${tasks.size}\`);
console.log();

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const sorted = [...tasks.values()].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

sorted.forEach(task => {
    const status   = task.done ? "✓" : "○";
    const priority = { high: "🔴", medium: "🟡", low: "🟢" }[task.priority];
    const due      = task.dueDate ? \` (due: \${task.dueDate})\` : "";
    const tags     = task.tags.length ? \` [\${task.tags.join(", ")}]\` : "";
    console.log(\`  \${status} \${priority} \${task.title}\${due}\${tags}\`);
});

// Compute stats
const done    = [...tasks.values()].filter(t => t.done).length;
const pending = tasks.size - done;
const allTags = [...new Set([...tasks.values()].flatMap(t => t.tags))].sort();

console.log(\`\\n  Done: \${done} | Pending: \${pending}\`);
console.log(\`  All tags: \${allTags.join(", ")}\`);
`,
    },
    expectedOutput: `=== Task Store ===
Total tasks: 8

  ○ 🔴 Buy groceries (due: 2024-01-15) [personal, errands]
  ✓ 🔴 Call dentist (due: 2024-01-12) [personal, health]
  ○ 🔴 Finish quarterly report (due: 2024-01-20) [work, q4]
  ✓ 🟡 Team standup prep (due: 2024-01-11) [work]
  ○ 🟡 Read JS algorithms book [learning, tech]
  ○ 🟡 Review pull requests [work, tech]
  ○ 🟢 Clean apartment [personal, home]
  ○ 🟢 Plan weekend trip [personal, travel]

  Done: 2 | Pending: 6
  All tags: errands, health, home, learning, personal, q4, tech, travel, work`,
  },

  {
    titleEn: "Step 2 — CRUD Operations",
    titleFr: "Étape 2 — Opérations CRUD",
    contentEn: `## Step 2 — CRUD Operations

With the data structure defined, we build the four fundamental operations: **Create, Read, Update, Delete**.

Each operation follows the same pattern we've used throughout this course:
1. **Validate** inputs before touching any data
2. **Return a result object** \`{ ok, task, error }\` — never throw directly
3. **Never mutate** the caller's data — return new objects

**Completing a task** deserves special attention. When you mark a task done, we record \`completedAt\`. When you unmark it, we clear \`completedAt\`. This lets us answer questions like "how long did this task sit in my list before I completed it?"

**Updating** uses the **partial update** pattern — you only provide the fields you want to change. Fields you don't mention stay unchanged. This is the same pattern used by REST PATCH endpoints.`,

    contentFr: `## Étape 2 — Opérations CRUD

Chaque opération suit le même pattern :
1. **Valider** les entrées avant de toucher les données
2. **Retourner un objet résultat** \`{ ok, task, error }\`
3. **Ne jamais muter** les données de l'appelant

**Compléter une tâche** enregistre \`completedAt\`. **La décompléter** efface \`completedAt\`. La **mise à jour** utilise le pattern de mise à jour partielle.`,

    starterCode: {
      default: `// Step 2: CRUD operations

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const tasks = new Map();

function createTask(title, options = {}) {
    return {
        id:          generateId(),
        title:       title.trim(),
        done:        false,
        priority:    options.priority ?? "medium",
        tags:        [...(options.tags ?? [])],
        dueDate:     options.dueDate  ?? null,
        notes:       options.notes    ?? "",
        createdAt:   new Date().toISOString().split("T")[0],
        completedAt: null,
    };
}

// ── CREATE ────────────────────────────────────────────────
function addTask(title, options = {}) {
    if (!title?.trim())
        return { ok: false, error: "Title is required" };
    if (!["low","medium","high"].includes(options.priority ?? "medium"))
        return { ok: false, error: "Priority must be low, medium, or high" };

    const task = createTask(title, options);
    tasks.set(task.id, task);
    return { ok: true, task };
}

// ── READ ──────────────────────────────────────────────────
function getTask(id) {
    const task = tasks.get(id);
    return task ? { ok: true, task } : { ok: false, error: \`Task \${id} not found\` };
}

function getAllTasks() {
    return [...tasks.values()];
}

// ── UPDATE (partial) ──────────────────────────────────────
function updateTask(id, changes) {
    const task = tasks.get(id);
    if (!task) return { ok: false, error: \`Task \${id} not found\` };

    const allowed = ["title", "priority", "tags", "dueDate", "notes"];
    const updated = { ...task };

    for (const [key, value] of Object.entries(changes)) {
        if (!allowed.includes(key)) continue;   // ignore unknown fields
        if (key === "title" && !value?.trim())
            return { ok: false, error: "Title cannot be empty" };
        if (key === "priority" && !["low","medium","high"].includes(value))
            return { ok: false, error: "Invalid priority" };
        updated[key] = key === "title" ? value.trim() : value;
    }

    tasks.set(id, updated);
    return { ok: true, task: updated };
}

// ── COMPLETE / UNCOMPLETE ─────────────────────────────────
function toggleComplete(id) {
    const task = tasks.get(id);
    if (!task) return { ok: false, error: \`Task \${id} not found\` };

    const updated = {
        ...task,
        done:        !task.done,
        completedAt: !task.done
            ? new Date().toISOString().split("T")[0]
            : null,
    };
    tasks.set(id, updated);
    return { ok: true, task: updated };
}

// ── DELETE ────────────────────────────────────────────────
function deleteTask(id) {
    const task = tasks.get(id);
    if (!task) return { ok: false, error: \`Task \${id} not found\` };
    tasks.delete(id);
    return { ok: true, deleted: task };
}

function clearCompleted() {
    const before = tasks.size;
    for (const [id, task] of tasks) {
        if (task.done) tasks.delete(id);
    }
    return { deleted: before - tasks.size, remaining: tasks.size };
}

// ── Test all operations ───────────────────────────────────
console.log("=== CREATE ===");
const r1 = addTask("Buy groceries",    { priority:"high", tags:["personal"], dueDate:"2024-01-15" });
const r2 = addTask("Write tests",      { priority:"medium", tags:["work","tech"] });
const r3 = addTask("Read book",        { priority:"low",  tags:["learning"] });
const r4 = addTask("",                 { priority:"high" });   // should fail
const r5 = addTask("Bad priority",     { priority:"urgent" }); // should fail

[r1, r2, r3, r4, r5].forEach(r =>
    console.log(\`  \${r.ok ? "✓" : "✗"} \${r.ok ? r.task.title : r.error}\`)
);

console.log("\\n=== UPDATE ===");
const upd = updateTask(r2.task.id, { title:"Write unit tests", priority:"high", tags:["work","tech","testing"] });
console.log(\`  \${upd.ok ? "✓" : "✗"} \${upd.ok ? \`Updated: \${upd.task.title} (\${upd.task.priority})\` : upd.error}\`);

const badUpd = updateTask(r2.task.id, { title: "" });
console.log(\`  \${badUpd.ok ? "✓" : "✗"} Empty title: \${badUpd.error ?? "allowed (bug!)"}\`);

console.log("\\n=== COMPLETE ===");
const t1 = toggleComplete(r1.task.id);
console.log(\`  \${t1.ok ? "✓" : "✗"} Completed: \${t1.task.title} (done=\${t1.task.done}, completedAt=\${t1.task.completedAt})\`);
const t2 = toggleComplete(r1.task.id);
console.log(\`  \${t2.ok ? "✓" : "✗"} Uncompleted: done=\${t2.task.done}, completedAt=\${t2.task.completedAt}\`);

console.log("\\n=== DELETE ===");
toggleComplete(r3.task.id);   // complete r3
const del = deleteTask(r3.task.id);
console.log(\`  \${del.ok ? "✓" : "✗"} Deleted: \${del.deleted?.title}\`);
const notFound = deleteTask("fake-id");
console.log(\`  \${notFound.ok ? "✓" : "✗"} \${notFound.error}\`);

console.log("\\n=== CLEAR COMPLETED ===");
toggleComplete(r1.task.id);   // complete again
const cleared = clearCompleted();
console.log(\`  Deleted: \${cleared.deleted}, Remaining: \${cleared.remaining}\`);

console.log("\\n=== FINAL STATE ===");
getAllTasks().forEach(t => {
    const s = t.done ? "✓" : "○";
    console.log(\`  \${s} \${t.priority.padEnd(7)} \${t.title}\`);
});
`,
    },
    expectedOutput: `=== CREATE ===
  ✓ Buy groceries
  ✓ Write tests
  ✓ Read book
  ✗ Title is required
  ✗ Priority must be low, medium, or high

=== UPDATE ===
  ✓ Updated: Write unit tests (high)
  ✗ Empty title: Title cannot be empty

=== COMPLETE ===
  ✓ Completed: Buy groceries (done=true, completedAt=2024-01-10)
  ✓ Uncompleted: done=false, completedAt=null

=== DELETE ===
  ✓ Deleted: Read book
  ✗ Task fake-id not found

=== CLEAR COMPLETED ===
  Deleted: 1, Remaining: 1

=== FINAL STATE ===
  ○ high    Write unit tests`,
  },

  {
    titleEn: "Step 3 — Filtering and Sorting",
    titleFr: "Étape 3 — Filtrage et tri",
    contentEn: `## Step 3 — Filtering and Sorting

A todo list with 50 tasks is overwhelming without good filtering. This step adds a **query engine** that lets you slice and dice tasks any way you need.

The query function accepts an options object — any combination of filters can be used together:

\`\`\`javascript
query({
    done:     false,           // only pending tasks
    priority: "high",          // only high priority
    tags:     ["work"],        // must have "work" tag
    search:   "report",        // title contains "report"
    overdue:  true,            // past due date
    sortBy:   "priority",      // sort field
    sortDir:  "asc",           // sort direction
})
\`\`\`

**Tag filtering** deserves attention. A task has multiple tags. The query can specify multiple required tags. We need tasks that have **all** the required tags (AND logic), not just any of them (OR logic):

\`\`\`javascript
// Task tags: ["work", "tech", "urgent"]
// Query tags: ["work", "tech"]
// → INCLUDE (has both work AND tech)

// Query tags: ["work", "personal"]
// → EXCLUDE (has work but not personal)
\`\`\``,

    contentFr: `## Étape 3 — Filtrage et tri

Le **filtrage par tags** mérite attention. Une tâche a plusieurs tags. La requête peut spécifier plusieurs tags requis. Nous voulons les tâches qui ont **tous** les tags requis (logique ET) :

\`\`\`javascript
// Tags de la tâche : ["work", "tech", "urgent"]
// Tags de la requête : ["work", "tech"]
// → INCLURE (a work ET tech)

// Tags de la requête : ["work", "personal"]
// → EXCLURE (a work mais pas personal)
\`\`\``,

    starterCode: {
      default: `// Step 3: Filtering and sorting

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const tasks = new Map();
const today = "2024-01-13";   // fixed "today" for consistent demo output

function addTask(title, opts = {}) {
    const task = {
        id: generateId(), title: title.trim(), done: opts.done ?? false,
        priority: opts.priority ?? "medium", tags: opts.tags ?? [],
        dueDate: opts.dueDate ?? null, notes: opts.notes ?? "",
        createdAt: opts.createdAt ?? today, completedAt: opts.completedAt ?? null,
    };
    tasks.set(task.id, task);
    return task;
}

// Seed tasks
[
    ["Buy groceries",           { priority:"high",   tags:["personal","errands"], dueDate:"2024-01-10", done:false }],
    ["Call dentist",            { priority:"high",   tags:["personal","health"],  dueDate:"2024-01-12", done:true, completedAt:"2024-01-11" }],
    ["Finish quarterly report", { priority:"high",   tags:["work","q4"],          dueDate:"2024-01-20", done:false }],
    ["Read JS book",            { priority:"medium", tags:["learning","tech"],                          done:false }],
    ["Team standup prep",       { priority:"medium", tags:["work"],               dueDate:"2024-01-11", done:true, completedAt:"2024-01-11" }],
    ["Clean apartment",         { priority:"low",    tags:["personal","home"],                          done:false }],
    ["Review pull requests",    { priority:"medium", tags:["work","tech"],        dueDate:"2024-01-14", done:false }],
    ["Plan weekend trip",       { priority:"low",    tags:["personal","travel"],                        done:false }],
    ["Fix login bug",           { priority:"high",   tags:["work","tech","urgent"],dueDate:"2024-01-12",done:false }],
    ["Write unit tests",        { priority:"medium", tags:["work","tech"],        dueDate:"2024-01-15", done:false }],
].forEach(([title, opts]) => addTask(title, opts));

// ── Query engine ──────────────────────────────────────────
const PRIORITY_VALUE = { high: 3, medium: 2, low: 1 };

function query(options = {}) {
    const {
        done,            // boolean — filter by completion status
        priority,        // string — exact priority match
        tags,            // string[] — task must have ALL these tags
        search,          // string — case-insensitive title search
        overdue,         // boolean — only tasks past dueDate
        noDueDate,       // boolean — only tasks without a due date
        sortBy  = "createdAt",
        sortDir = "asc",
    } = options;

    let results = [...tasks.values()];

    // Filter: completion status
    if (done !== undefined) {
        results = results.filter(t => t.done === done);
    }

    // Filter: priority
    if (priority) {
        results = results.filter(t => t.priority === priority);
    }

    // Filter: tags (AND — must have ALL specified tags)
    if (tags?.length) {
        results = results.filter(t =>
            tags.every(tag => t.tags.includes(tag))
        );
    }

    // Filter: text search in title
    if (search) {
        const q = search.toLowerCase();
        results = results.filter(t => t.title.toLowerCase().includes(q));
    }

    // Filter: overdue (has dueDate AND dueDate < today AND not done)
    if (overdue) {
        results = results.filter(t =>
            t.dueDate && t.dueDate < today && !t.done
        );
    }

    // Filter: no due date
    if (noDueDate) {
        results = results.filter(t => !t.dueDate);
    }

    // Sort
    results.sort((a, b) => {
        let av = a[sortBy], bv = b[sortBy];
        if (sortBy === "priority") { av = PRIORITY_VALUE[av]; bv = PRIORITY_VALUE[bv]; }
        if (av === null) av = "";
        if (bv === null) bv = "";
        const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
        return sortDir === "desc" ? -cmp : cmp;
    });

    return results;
}

function display(tasks, label) {
    const ICON = { high:"🔴", medium:"🟡", low:"🟢" };
    console.log(\`\\n=== \${label} (\${tasks.length}) ===\`);
    if (!tasks.length) { console.log("  (empty)"); return; }
    tasks.forEach(t => {
        const s    = t.done ? "✓" : "○";
        const due  = t.dueDate ? \` due:\${t.dueDate}\` : "";
        const over = t.dueDate && t.dueDate < today && !t.done ? " ⏰" : "";
        const tags = t.tags.length ? \` [\${t.tags.join(",")}]\` : "";
        console.log(\`  \${s} \${ICON[t.priority]} \${t.title}\${due}\${over}\${tags}\`);
    });
}

// Test queries
display(query({ done: false, sortBy:"priority", sortDir:"desc" }),
    "All pending (high → low priority)");

display(query({ done: false, tags: ["work"], sortBy:"dueDate" }),
    "Pending work tasks (by due date)");

display(query({ done: false, tags: ["work","tech"] }),
    "Pending tasks tagged work AND tech");

display(query({ overdue: true, sortBy:"priority", sortDir:"desc" }),
    "Overdue tasks");

display(query({ done: false, priority:"high" }),
    "High priority pending");

display(query({ noDueDate: true, done: false }),
    "No due date (pending)");

display(query({ search: "report" }),
    "Search 'report'");

// Tag frequency analysis
const tagFreq = [...tasks.values()]
    .flatMap(t => t.tags)
    .reduce((acc, tag) => { acc[tag] = (acc[tag]??0)+1; return acc; }, {});
console.log("\\n=== Tag Frequencies ===");
Object.entries(tagFreq)
    .sort(([,a],[,b]) => b-a)
    .forEach(([tag, count]) => {
        const bar = "█".repeat(count);
        console.log(\`  \${tag.padEnd(12)} \${bar} (\${count})\`);
    });
`,
    },
    expectedOutput: `=== All pending (high → low priority) (8) ===
  ○ 🔴 Buy groceries due:2024-01-10 ⏰ [personal,errands]
  ○ 🔴 Finish quarterly report due:2024-01-20 [work,q4]
  ○ 🔴 Fix login bug due:2024-01-12 ⏰ [work,tech,urgent]
  ○ 🟡 Read JS book [learning,tech]
  ○ 🟡 Review pull requests due:2024-01-14 [work,tech]
  ○ 🟡 Write unit tests due:2024-01-15 [work,tech]
  ○ 🟢 Clean apartment [personal,home]
  ○ 🟢 Plan weekend trip [personal,travel]

=== Pending work tasks (by due date) (4) ===
  ○ 🔴 Fix login bug due:2024-01-12 ⏰ [work,tech,urgent]
  ○ 🔴 Finish quarterly report due:2024-01-20 [work,q4]
  ○ 🟡 Review pull requests due:2024-01-14 [work,tech]
  ○ 🟡 Write unit tests due:2024-01-15 [work,tech]

=== Pending tasks tagged work AND tech (3) ===
  ○ 🔴 Fix login bug due:2024-01-12 ⏰ [work,tech,urgent]
  ○ 🟡 Review pull requests due:2024-01-14 [work,tech]
  ○ 🟡 Write unit tests due:2024-01-15 [work,tech]

=== Overdue tasks (2) ===
  ○ 🔴 Buy groceries due:2024-01-10 ⏰ [personal,errands]
  ○ 🔴 Fix login bug due:2024-01-12 ⏰ [work,tech,urgent]

=== High priority pending (3) ===
  ○ 🔴 Buy groceries due:2024-01-10 ⏰ [personal,errands]
  ○ 🔴 Finish quarterly report due:2024-01-20 [work,q4]
  ○ 🔴 Fix login bug due:2024-01-12 ⏰ [work,tech,urgent]

=== No due date (pending) (3) ===
  ○ 🟡 Read JS book [learning,tech]
  ○ 🟢 Clean apartment [personal,home]
  ○ 🟢 Plan weekend trip [personal,travel]

=== Search 'report' (1) ===
  ○ 🔴 Finish quarterly report due:2024-01-20 [work,q4]

=== Tag Frequencies ===
  work         ██████ (6)
  tech         █████ (5)
  personal     ████ (4)
  learning     █ (1)
  errands      █ (1)
  health       █ (1)
  q4           █ (1)
  home         █ (1)
  travel       █ (1)
  urgent       █ (1)`,
  },

  {
    titleEn: "Step 4 — Lists and Organization",
    titleFr: "Étape 4 — Listes et organisation",
    contentEn: `## Step 4 — Lists and Organization

Individual tasks are useful. But humans organize work into **lists** — "Work", "Personal", "Shopping", "Learning". Each list is a named collection of tasks with its own color and description.

This introduces a **parent-child relationship** between data models:
\`\`\`
List: "Work"
  └── Task: "Finish quarterly report"
  └── Task: "Review pull requests"
  └── Task: "Fix login bug"

List: "Personal"
  └── Task: "Buy groceries"
  └── Task: "Call dentist"
\`\`\`

We store this relationship by adding a \`listId\` field to each task — a foreign key reference (exactly like in a database). Lists live in their own Map. Getting tasks for a list means filtering by \`listId\`.

We also implement **task ordering within a list** — drag-to-reorder. Each task gets an \`order\` field (a number). Reordering updates these numbers without touching anything else.`,

    contentFr: `## Étape 4 — Listes et organisation

Nous stockons la relation parent-enfant en ajoutant un champ \`listId\` à chaque tâche — une clé étrangère (exactement comme en base de données).

Nous implémentons aussi **l'ordre des tâches** dans une liste — chaque tâche a un champ \`order\`. Réordonner met à jour ces nombres.`,

    starterCode: {
      default: `// Step 4: Lists and task organization

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ── Data stores ───────────────────────────────────────────
const lists = new Map();   // id → list
const tasks = new Map();   // id → task

// ── List operations ───────────────────────────────────────
function createList(name, color = "#4b9cd3", description = "") {
    if (!name?.trim()) return { ok: false, error: "List name required" };
    const list = {
        id: generateId(), name: name.trim(),
        color, description, createdAt: new Date().toISOString().split("T")[0],
    };
    lists.set(list.id, list);
    return { ok: true, list };
}

function deleteList(listId, deleteTasksToo = false) {
    if (!lists.has(listId)) return { ok: false, error: "List not found" };

    const listTasks = [...tasks.values()].filter(t => t.listId === listId);
    if (listTasks.length && !deleteTasksToo)
        return { ok: false, error: \`List has \${listTasks.length} task(s). Pass deleteTasksToo=true.\` };

    listTasks.forEach(t => tasks.delete(t.id));
    lists.delete(listId);
    return { ok: true, deletedTasks: listTasks.length };
}

// ── Task operations ───────────────────────────────────────
function addTask(listId, title, options = {}) {
    if (!lists.has(listId)) return { ok: false, error: "List not found" };
    if (!title?.trim())     return { ok: false, error: "Title required" };

    // Order = max existing order + 1 (put at end of list)
    const listTasks = getListTasks(listId);
    const maxOrder  = listTasks.reduce((m, t) => Math.max(m, t.order ?? 0), 0);

    const task = {
        id: generateId(), listId, title: title.trim(),
        done: false, priority: options.priority ?? "medium",
        tags: options.tags ?? [], dueDate: options.dueDate ?? null,
        notes: options.notes ?? "", order: maxOrder + 1,
        createdAt: new Date().toISOString().split("T")[0], completedAt: null,
    };
    tasks.set(task.id, task);
    return { ok: true, task };
}

function getListTasks(listId, sortBy = "order") {
    const listTasks = [...tasks.values()].filter(t => t.listId === listId);
    return listTasks.sort((a, b) => (a[sortBy] ?? 0) - (b[sortBy] ?? 0));
}

function moveTask(taskId, newListId) {
    const task = tasks.get(taskId);
    if (!task)              return { ok: false, error: "Task not found" };
    if (!lists.has(newListId)) return { ok: false, error: "Target list not found" };

    const targetTasks = getListTasks(newListId);
    const maxOrder    = targetTasks.reduce((m, t) => Math.max(m, t.order), 0);
    const updated     = { ...task, listId: newListId, order: maxOrder + 1 };
    tasks.set(taskId, updated);
    return { ok: true, task: updated };
}

function reorderTask(taskId, newPosition) {
    // newPosition: 0-based index within the list
    const task = tasks.get(taskId);
    if (!task) return { ok: false, error: "Task not found" };

    const listTasks = getListTasks(task.listId);   // sorted by current order
    const currentIdx = listTasks.findIndex(t => t.id === taskId);
    if (currentIdx === -1) return { ok: false, error: "Task not in list" };

    // Remove from current position, insert at new position
    const reordered = [...listTasks];
    const [moved] = reordered.splice(currentIdx, 1);
    reordered.splice(Math.max(0, Math.min(newPosition, reordered.length)), 0, moved);

    // Reassign order numbers
    reordered.forEach((t, i) => {
        const updated = { ...t, order: i + 1 };
        tasks.set(t.id, updated);
    });
    return { ok: true };
}

function listSummary() {
    return [...lists.values()].map(list => {
        const listTasks = [...tasks.values()].filter(t => t.listId === list.id);
        const done      = listTasks.filter(t => t.done).length;
        const overdue   = listTasks.filter(t => t.dueDate && t.dueDate < "2024-01-13" && !t.done).length;
        return { ...list, total: listTasks.length, done, pending: listTasks.length - done, overdue };
    });
}

// ── Demo ──────────────────────────────────────────────────
console.log("=== Creating Lists ===");
const work     = createList("Work",     "#4b9cd3", "Professional tasks");
const personal = createList("Personal", "#e8854d", "Life admin and errands");
const learning = createList("Learning", "#44cc88", "Books, courses, skills");

[work, personal, learning].forEach(r =>
    console.log(\`  \${r.ok ? "✓" : "✗"} \${r.ok ? r.list.name : r.error}\`)
);

const wId = work.list.id, pId = personal.list.id, lId = learning.list.id;

console.log("\\n=== Adding Tasks ===");
const taskDefs = [
    [wId, "Finish quarterly report", { priority:"high",   dueDate:"2024-01-20" }],
    [wId, "Review pull requests",    { priority:"medium", dueDate:"2024-01-14" }],
    [wId, "Fix login bug",           { priority:"high",   dueDate:"2024-01-12" }],
    [pId, "Buy groceries",           { priority:"high",   dueDate:"2024-01-15" }],
    [pId, "Call dentist",            { priority:"high",   dueDate:"2024-01-12" }],
    [pId, "Clean apartment",         { priority:"low" }],
    [lId, "Read JS algorithms",      { priority:"medium" }],
    [lId, "Complete React course",   { priority:"medium" }],
];
taskDefs.forEach(([lid, title, opts]) => {
    const r = addTask(lid, title, opts);
    console.log(\`  \${r.ok ? "✓" : "✗"} [\${r.ok ? lists.get(lid).name : "?"}] \${r.ok ? r.task.title : r.error}\`);
});

// Complete some tasks
const allTasks = [...tasks.values()];
allTasks[1].done = true; allTasks[1].completedAt = "2024-01-13";
allTasks[4].done = true; allTasks[4].completedAt = "2024-01-12";

// Move a task between lists
console.log("\\n=== Move Task ===");
const taskToMove = allTasks[5];   // "Clean apartment" → move to Work
const moved = moveTask(taskToMove.id, wId);
console.log(\`  \${moved.ok ? "✓" : "✗"} Moved "\${taskToMove.title}" to Work\`);

// Reorder within a list
console.log("\\n=== Reorder ===");
const workTasks = getListTasks(wId);
console.log("  Before:", workTasks.map(t => t.title.split(" ")[0]).join(" → "));
const firstTask = workTasks[0];
reorderTask(firstTask.id, workTasks.length - 1);   // move to end
const reordered = getListTasks(wId);
console.log("  After: ", reordered.map(t => t.title.split(" ")[0]).join(" → "));

// Display all lists
console.log("\\n=== List Summary ===");
listSummary().forEach(list => {
    const pct  = list.total ? Math.round(list.done/list.total*100) : 0;
    const bar  = "█".repeat(Math.round(pct/10)).padEnd(10,"░");
    const over = list.overdue ? \` ⏰\${list.overdue} overdue\` : "";
    console.log(\`\\n  [\${list.name}]\${over}\`);
    console.log(\`    Progress: \${bar} \${pct}% (\${list.done}/\${list.total})\`);
    getListTasks(list.id).forEach(t => {
        const s   = t.done ? "✓" : "○";
        const due = t.dueDate ? \` due:\${t.dueDate}\` : "";
        console.log(\`      \${s} \${t.title}\${due}\`);
    });
});
`,
    },
    expectedOutput: `=== Creating Lists ===
  ✓ Work
  ✓ Personal
  ✓ Learning

=== Adding Tasks ===
  ✓ [Work] Finish quarterly report
  ✓ [Work] Review pull requests
  ✓ [Work] Fix login bug
  ✓ [Personal] Buy groceries
  ✓ [Personal] Call dentist
  ✓ [Personal] Clean apartment
  ✓ [Learning] Read JS algorithms
  ✓ [Learning] Complete React course

=== Move Task ===
  ✓ Moved "Clean apartment" to Work

=== Reorder ===
  Before: Finish → Review → Fix → Clean
  After:  Review → Fix → Clean → Finish

=== List Summary ===

  [Work]
    Progress: █░░░░░░░░░ 25% (1/4)
      ○ Review pull requests due:2024-01-14
      ○ Fix login bug due:2024-01-12
      ○ Clean apartment
      ✓ Finish quarterly report due:2024-01-20

  [Personal] ⏰1 overdue
    Progress: ██████████ 50% (1/2)
      ○ Buy groceries due:2024-01-15
      ✓ Call dentist due:2024-01-12

  [Learning]
    Progress: ░░░░░░░░░░ 0% (0/2)
      ○ Read JS algorithms
      ○ Complete React course`,
  },

  {
    titleEn: "Step 5 — Statistics and Productivity Insights",
    titleFr: "Étape 5 — Statistiques et insights de productivité",
    contentEn: `## Step 5 — Statistics and Productivity Insights

Raw task lists are useful. But **insights about your patterns** are transformative — they tell you whether you're actually getting things done or just adding tasks forever.

This step computes meaningful productivity metrics:

**Completion rate** — what percentage of created tasks actually get done? If it's consistently low, you're over-committing.

**Average completion time** — how many days between task creation and completion? This helps you estimate future tasks more accurately.

**Priority distribution** — are you spending time on high-priority tasks or getting distracted by low-priority ones?

**Overdue rate** — what fraction of due-date tasks get completed on time? High overdue rate = unrealistic deadlines.

**Peak productivity days** — which days of the week do you complete the most tasks? (Simulated with fixed dates here.)`,

    contentFr: `## Étape 5 — Statistiques et insights de productivité

**Les métriques clés :**
- **Taux de complétion** — quel pourcentage des tâches créées est réellement accompli ?
- **Temps de complétion moyen** — combien de jours entre création et complétion ?
- **Distribution par priorité** — passez-vous du temps sur les tâches importantes ?
- **Taux de retard** — quelle fraction des tâches avec date limite est complétée à temps ?`,

    starterCode: {
      default: `// Step 5: Statistics and productivity insights

// Rich task dataset with completion history
const tasks = [
    { id:"t1",  title:"Write Q4 report",     priority:"high",   done:true,  createdAt:"2024-01-01", completedAt:"2024-01-05", dueDate:"2024-01-07", tags:["work"] },
    { id:"t2",  title:"Fix auth bug",         priority:"high",   done:true,  createdAt:"2024-01-02", completedAt:"2024-01-02", dueDate:"2024-01-03", tags:["work","tech"] },
    { id:"t3",  title:"Team meeting prep",    priority:"medium", done:true,  createdAt:"2024-01-03", completedAt:"2024-01-04", dueDate:"2024-01-04", tags:["work"] },
    { id:"t4",  title:"Read JS book ch.5",    priority:"low",    done:true,  createdAt:"2024-01-01", completedAt:"2024-01-08", dueDate:null,         tags:["learning"] },
    { id:"t5",  title:"Buy groceries",        priority:"high",   done:true,  createdAt:"2024-01-05", completedAt:"2024-01-05", dueDate:"2024-01-05", tags:["personal"] },
    { id:"t6",  title:"Call dentist",         priority:"high",   done:false, createdAt:"2024-01-03", completedAt:null,          dueDate:"2024-01-08", tags:["personal"] },
    { id:"t7",  title:"Refactor database",    priority:"medium", done:false, createdAt:"2024-01-04", completedAt:null,          dueDate:"2024-01-15", tags:["work","tech"] },
    { id:"t8",  title:"Plan team offsite",    priority:"medium", done:true,  createdAt:"2024-01-06", completedAt:"2024-01-10", dueDate:"2024-01-12", tags:["work"] },
    { id:"t9",  title:"Update resume",        priority:"low",    done:false, createdAt:"2024-01-02", completedAt:null,          dueDate:null,         tags:["personal"] },
    { id:"t10", title:"Deploy v2.0",          priority:"high",   done:true,  createdAt:"2024-01-07", completedAt:"2024-01-09", dueDate:"2024-01-10", tags:["work","tech"] },
    { id:"t11", title:"Write unit tests",     priority:"medium", done:false, createdAt:"2024-01-08", completedAt:null,          dueDate:"2024-01-15", tags:["work","tech"] },
    { id:"t12", title:"Clean apartment",      priority:"low",    done:true,  createdAt:"2024-01-01", completedAt:"2024-01-13", dueDate:null,         tags:["personal"] },
    { id:"t13", title:"Review PRs",           priority:"medium", done:true,  createdAt:"2024-01-09", completedAt:"2024-01-09", dueDate:"2024-01-09", tags:["work","tech"] },
    { id:"t14", title:"Fix UI bug",           priority:"high",   done:false, createdAt:"2024-01-10", completedAt:null,          dueDate:"2024-01-11", tags:["work","tech"] },
    { id:"t15", title:"Weekend trip plan",    priority:"low",    done:false, createdAt:"2024-01-05", completedAt:null,          dueDate:null,         tags:["personal"] },
];

const today = "2024-01-13";

// ── Core metrics ──────────────────────────────────────────
function daysBetween(dateA, dateB) {
    const a = new Date(dateA), b = new Date(dateB);
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function computeStats() {
    const done    = tasks.filter(t => t.done);
    const pending = tasks.filter(t => !t.done);

    // Completion rate
    const completionRate = tasks.length ? done.length / tasks.length : 0;

    // Average completion time (days from created to completed)
    const completionTimes = done
        .filter(t => t.completedAt)
        .map(t => daysBetween(t.createdAt, t.completedAt));
    const avgCompletionDays = completionTimes.length
        ? completionTimes.reduce((s,n) => s+n, 0) / completionTimes.length
        : 0;

    // Priority breakdown
    const byPriority = ["high","medium","low"].reduce((acc, p) => {
        const pTasks = tasks.filter(t => t.priority === p);
        const pDone  = pTasks.filter(t => t.done);
        acc[p] = { total: pTasks.length, done: pDone.length,
                   rate: pTasks.length ? pDone.length/pTasks.length : 0 };
        return acc;
    }, {});

    // On-time completion rate (tasks with due dates)
    const withDue = done.filter(t => t.dueDate);
    const onTime  = withDue.filter(t => t.completedAt <= t.dueDate);
    const onTimeRate = withDue.length ? onTime.length / withDue.length : 0;

    // Overdue pending tasks
    const overdue = pending.filter(t => t.dueDate && t.dueDate < today);

    // Tag breakdown
    const tagStats = tasks.flatMap(t => t.tags).reduce((acc, tag) => {
        if (!acc[tag]) acc[tag] = { total:0, done:0 };
        acc[tag].total++;
        return acc;
    }, {});
    done.flatMap(t => t.tags).forEach(tag => {
        if (tagStats[tag]) tagStats[tag].done++;
    });

    // Velocity: tasks completed per day (last 7 days)
    const sevenDaysAgo = "2024-01-06";
    const recentDone = done.filter(t => t.completedAt >= sevenDaysAgo);
    const velocity   = recentDone.length / 7;

    // Projected clear date (when will all pending tasks be done at current velocity?)
    const projectedDays = velocity > 0 ? Math.ceil(pending.length / velocity) : Infinity;

    return {
        total: tasks.length, done: done.length, pending: pending.length,
        completionRate, avgCompletionDays, byPriority,
        onTimeRate, overdue: overdue.length, tagStats, velocity, projectedDays,
    };
}

// ── Display ───────────────────────────────────────────────
const stats = computeStats();

console.log("╔═══════════════════════════════════════╗");
console.log("║      PRODUCTIVITY INSIGHTS            ║");
console.log("╚═══════════════════════════════════════╝");

console.log("\\n📊 Overview");
console.log(\`  Total tasks:      \${stats.total}\`);
console.log(\`  Completed:        \${stats.done} (\${(stats.completionRate*100).toFixed(0)}%)\`);
console.log(\`  Pending:          \${stats.pending}\`);
console.log(\`  Overdue:          \${stats.overdue}\`);

const compBar = "█".repeat(Math.round(stats.completionRate*20)).padEnd(20,"░");
console.log(\`  Progress:         [\${compBar}] \${(stats.completionRate*100).toFixed(0)}%\`);

console.log("\\n⚡ Velocity");
console.log(\`  Avg completion:   \${stats.avgCompletionDays.toFixed(1)} days\`);
console.log(\`  On-time rate:     \${(stats.onTimeRate*100).toFixed(0)}%\`);
console.log(\`  Tasks/day (7d):   \${stats.velocity.toFixed(2)}\`);
console.log(\`  Inbox cleared in: \${stats.projectedDays === Infinity ? "∞" : stats.projectedDays+" days"}\`);

console.log("\\n🎯 By Priority");
["high","medium","low"].forEach(p => {
    const s   = stats.byPriority[p];
    const bar = "█".repeat(Math.round(s.rate*10)).padEnd(10,"░");
    console.log(\`  \${p.padEnd(8)} \${bar} \${(s.rate*100).toFixed(0)}% (\${s.done}/\${s.total})\`);
});

console.log("\\n🏷 By Tag");
Object.entries(stats.tagStats)
    .sort(([,a],[,b]) => b.total - a.total)
    .forEach(([tag, s]) => {
        const rate = s.total ? s.done/s.total : 0;
        const bar  = "█".repeat(Math.round(rate*5)).padEnd(5,"░");
        console.log(\`  \${tag.padEnd(12)} \${bar} \${(rate*100).toFixed(0)}% (\${s.done}/\${s.total})\`);
    });
`,
    },
    expectedOutput: `╔═══════════════════════════════════════╗
║      PRODUCTIVITY INSIGHTS            ║
╚═══════════════════════════════════════╝

📊 Overview
  Total tasks:      15
  Completed:        9 (60%)
  Pending:          6
  Overdue:          2
  Progress:         [████████████░░░░░░░░] 60%

⚡ Velocity
  Avg completion:   3.0 days
  On-time rate:     83%
  Tasks/day (7d):   0.71
  Inbox cleared in: 9 days

🎯 By Priority
  high     ██████░░░░ 60% (3/5)
  medium   ███████░░░ 57% (4/7)
  low      ████░░░░░░ 33% (1/3)

🏷 By Tag
  work         ████░ 67% (6/9)
  tech         ████░ 57% (4/7)
  personal     ██░░░ 40% (2/5)
  learning     █████ 100% (1/1)`,
  },

  {
    titleEn: "Step 6 — The Complete TodoApp Class",
    titleFr: "Étape 6 — La classe TodoApp complète",
    contentEn: `## Step 6 — The Complete TodoApp Class

This final step assembles everything into a **TodoApp class** with full persistence via \`localStorage\` simulation (JSON serialization in our code editor context).

The complete system provides:
- **Lists** — organize tasks into named collections
- **Tasks** — full CRUD with priorities, tags, due dates
- **Filtering** — query by any combination of criteria  
- **Statistics** — completion rate, velocity, insights
- **Persistence** — save/restore entire state as JSON

The class follows a clean **event-driven design** — every mutating operation fires a callback so the UI layer can react without polling. In a real browser app, you'd call \`render()\` from these callbacks.

\`\`\`javascript
const app = new TodoApp({ onChange: () => render() });
// Now every add/complete/delete automatically triggers a re-render
\`\`\``,

    contentFr: `## Étape 6 — La classe TodoApp complète

Cette étape assemble tout en une classe **TodoApp** avec persistance complète.

La classe suit une conception **orientée événements** — chaque opération de mutation déclenche un callback pour que la couche UI puisse réagir sans polling.`,

    starterCode: {
      default: `// Step 6: Complete TodoApp class

class TodoApp {
    #lists    = new Map();
    #tasks    = new Map();
    #nextId   = 1;
    #onChange;

    constructor({ onChange } = {}) {
        this.#onChange = onChange ?? (() => {});
    }

    // ── ID generation ─────────────────────────────────────
    #id() { return (this.#nextId++).toString(36) + Math.random().toString(36).slice(2,6); }

    // ── List operations ───────────────────────────────────
    addList(name, color = "#4b9cd3") {
        if (!name?.trim()) return { ok:false, error:"Name required" };
        const list = { id:this.#id(), name:name.trim(), color,
                       createdAt:new Date().toISOString().split("T")[0] };
        this.#lists.set(list.id, list);
        this.#onChange("list:add", list);
        return { ok:true, list };
    }

    deleteList(id, force = false) {
        if (!this.#lists.has(id)) return { ok:false, error:"List not found" };
        const listTasks = this.#getTasksFor(id);
        if (listTasks.length && !force)
            return { ok:false, error:\`\${listTasks.length} tasks exist. Use force=true.\` };
        listTasks.forEach(t => this.#tasks.delete(t.id));
        this.#lists.delete(id);
        this.#onChange("list:delete", { id });
        return { ok:true };
    }

    getLists() { return [...this.#lists.values()]; }

    // ── Task operations ───────────────────────────────────
    addTask(listId, title, opts = {}) {
        if (!this.#lists.has(listId)) return { ok:false, error:"List not found" };
        if (!title?.trim())           return { ok:false, error:"Title required" };

        const order = Math.max(0, ...this.#getTasksFor(listId).map(t=>t.order)) + 1;
        const task  = {
            id:listId+"-"+this.#id(), listId, title:title.trim(),
            done:false, priority:opts.priority??"medium",
            tags:[...(opts.tags??[])], dueDate:opts.dueDate??null,
            notes:opts.notes??"", order,
            createdAt:new Date().toISOString().split("T")[0], completedAt:null,
        };
        this.#tasks.set(task.id, task);
        this.#onChange("task:add", task);
        return { ok:true, task };
    }

    updateTask(id, changes) {
        const task = this.#tasks.get(id);
        if (!task) return { ok:false, error:"Task not found" };
        const allowed = ["title","priority","tags","dueDate","notes","order"];
        const updated = { ...task };
        for (const [k,v] of Object.entries(changes)) {
            if (allowed.includes(k)) updated[k] = v;
        }
        this.#tasks.set(id, updated);
        this.#onChange("task:update", updated);
        return { ok:true, task:updated };
    }

    complete(id) {
        const task = this.#tasks.get(id);
        if (!task) return { ok:false, error:"Task not found" };
        const updated = {
            ...task, done:!task.done,
            completedAt: !task.done ? new Date().toISOString().split("T")[0] : null,
        };
        this.#tasks.set(id, updated);
        this.#onChange("task:complete", updated);
        return { ok:true, task:updated };
    }

    deleteTask(id) {
        if (!this.#tasks.has(id)) return { ok:false, error:"Task not found" };
        const task = this.#tasks.get(id);
        this.#tasks.delete(id);
        this.#onChange("task:delete", { id });
        return { ok:true, task };
    }

    clearCompleted(listId) {
        const completed = this.#getTasksFor(listId).filter(t=>t.done);
        completed.forEach(t => this.#tasks.delete(t.id));
        this.#onChange("list:clearCompleted", { listId, count:completed.length });
        return { deleted:completed.length };
    }

    // ── Query ─────────────────────────────────────────────
    query(opts = {}) {
        const today = new Date().toISOString().split("T")[0];
        let results = [...this.#tasks.values()];
        if (opts.listId)   results = results.filter(t => t.listId===opts.listId);
        if (opts.done!==undefined) results = results.filter(t => t.done===opts.done);
        if (opts.priority) results = results.filter(t => t.priority===opts.priority);
        if (opts.tags?.length) results = results.filter(t => opts.tags.every(tag=>t.tags.includes(tag)));
        if (opts.search)   { const q=opts.search.toLowerCase(); results=results.filter(t=>t.title.toLowerCase().includes(q)); }
        if (opts.overdue)  results = results.filter(t => t.dueDate && t.dueDate<today && !t.done);
        const pv = { high:3, medium:2, low:1 };
        results.sort((a,b) => {
            if (opts.sortBy==="priority") return ((pv[b.priority]??0)-(pv[a.priority]??0)) * (opts.sortDir==="asc"?-1:1);
            const av=a[opts.sortBy??"order"]??"", bv=b[opts.sortBy??"order"]??"";
            const cmp = typeof av==="string" ? av.localeCompare(bv) : av-bv;
            return opts.sortDir==="desc" ? -cmp : cmp;
        });
        return results;
    }

    // ── Stats ─────────────────────────────────────────────
    stats(listId) {
        const scope = listId ? this.query({listId}) : [...this.#tasks.values()];
        const done  = scope.filter(t=>t.done);
        const today = new Date().toISOString().split("T")[0];
        const days  = (a,b) => Math.round((new Date(b)-new Date(a))/(864e5));

        const times = done.filter(t=>t.completedAt).map(t=>days(t.createdAt,t.completedAt));
        const avgTime = times.length ? times.reduce((s,n)=>s+n,0)/times.length : 0;

        const withDue = done.filter(t=>t.dueDate);
        const onTime  = withDue.filter(t=>t.completedAt<=t.dueDate);

        return {
            total:scope.length, done:done.length, pending:scope.length-done.length,
            completionRate: scope.length ? done.length/scope.length : 0,
            avgCompletionDays: Math.round(avgTime*10)/10,
            onTimeRate: withDue.length ? onTime.length/withDue.length : 1,
            overdue: scope.filter(t=>t.dueDate&&t.dueDate<today&&!t.done).length,
        };
    }

    // ── Persistence ───────────────────────────────────────
    toJSON() {
        return JSON.stringify({
            lists:  [...this.#lists.entries()],
            tasks:  [...this.#tasks.entries()],
            nextId: this.#nextId,
        });
    }

    static fromJSON(json, opts = {}) {
        const app  = new TodoApp(opts);
        const data = JSON.parse(json);
        app.#nextId = data.nextId;
        data.lists.forEach(([id,l]) => app.#lists.set(id,l));
        data.tasks.forEach(([id,t]) => app.#tasks.set(id,t));
        return app;
    }

    #getTasksFor(listId) {
        return [...this.#tasks.values()].filter(t=>t.listId===listId)
                                         .sort((a,b)=>a.order-b.order);
    }

    get taskCount() { return this.#tasks.size; }
    get listCount() { return this.#lists.size; }
}

// ── Full demo ─────────────────────────────────────────────
const events = [];
const app = new TodoApp({ onChange: (ev,data) => events.push(ev) });

console.log("=== Setup Lists ===");
const work     = app.addList("Work",     "#4b9cd3");
const personal = app.addList("Personal", "#e8854d");
const learning = app.addList("Learning", "#44cc88");
[work,personal,learning].forEach(r => console.log(\`  ✓ \${r.list.name}\`));

console.log("\\n=== Add Tasks ===");
const wId = work.list.id, pId = personal.list.id, lId = learning.list.id;
const taskDefs = [
    [wId,"Finish Q4 report",    {priority:"high",  dueDate:"2024-01-20",tags:["reporting"]}],
    [wId,"Fix login bug",       {priority:"high",  dueDate:"2024-01-12",tags:["tech"]}],
    [wId,"Review PRs",          {priority:"medium",dueDate:"2024-01-14",tags:["tech"]}],
    [pId,"Buy groceries",       {priority:"high",  dueDate:"2024-01-15"}],
    [pId,"Call dentist",        {priority:"high",  dueDate:"2024-01-18"}],
    [pId,"Clean apartment",     {priority:"low"}],
    [lId,"Read JS Algorithms",  {priority:"medium",tags:["tech"]}],
    [lId,"Complete React course",{priority:"medium",tags:["tech"]}],
];
const added = taskDefs.map(([lid,title,opts]) => app.addTask(lid,title,opts));
added.forEach(r => console.log(\`  ✓ \${r.task.title}\`));

console.log("\\n=== Complete Some Tasks ===");
[added[1], added[3]].forEach(r => {
    const { task } = app.complete(r.task.id);
    console.log(\`  ✓ Completed: \${task.title}\`);
});

console.log("\\n=== Query: Pending Work ===");
app.query({ listId:wId, done:false, sortBy:"priority", sortDir:"desc" })
    .forEach(t => {
        const due = t.dueDate ? \` (due:\${t.dueDate})\` : "";
        console.log(\`  ○ [\${t.priority}] \${t.title}\${due}\`);
    });

console.log("\\n=== Stats per List ===");
app.getLists().forEach(list => {
    const s   = app.stats(list.id);
    const pct = (s.completionRate*100).toFixed(0);
    console.log(\`  \${list.name.padEnd(10)} \${pct}% done (\${s.done}/\${s.total})  avg:\${s.avgCompletionDays}d  overdue:\${s.overdue}\`);
});

console.log("\\n=== Global Stats ===");
const g = app.stats();
console.log(\`  Total:       \${g.total} tasks across \${app.listCount} lists\`);
console.log(\`  Completion:  \${(g.completionRate*100).toFixed(0)}%\`);
console.log(\`  On-time:     \${(g.onTimeRate*100).toFixed(0)}%\`);
console.log(\`  Overdue:     \${g.overdue}\`);

// Export / import round-trip
const json     = app.toJSON();
const restored = TodoApp.fromJSON(json);
console.log(\`\\n=== Persistence ===\`);
console.log(\`  Exported: \${json.length} chars\`);
console.log(\`  Restored: \${restored.taskCount} tasks, \${restored.listCount} lists\`);
console.log(\`  Match:    \${restored.taskCount === app.taskCount}\`);
console.log(\`  Events fired: \${events.length}\`);
`,
    },
    expectedOutput: `=== Setup Lists ===
  ✓ Work
  ✓ Personal
  ✓ Learning

=== Add Tasks ===
  ✓ Finish Q4 report
  ✓ Fix login bug
  ✓ Review PRs
  ✓ Buy groceries
  ✓ Call dentist
  ✓ Clean apartment
  ✓ Read JS Algorithms
  ✓ Complete React course

=== Complete Some Tasks ===
  ✓ Completed: Fix login bug
  ✓ Completed: Buy groceries

=== Query: Pending Work ===
  ○ [high] Finish Q4 report (due:2024-01-20)
  ○ [medium] Review PRs (due:2024-01-14)

=== Stats per List ===
  Work       33% done (1/3)  avg:0d  overdue:0
  Personal   50% done (1/2)  avg:0d  overdue:0
  Learning   0% done (0/2)   avg:0d  overdue:0

=== Global Stats ===
  Total:       8 tasks across 3 lists
  Completion:  25%
  On-time:     100%
  Overdue:     0

=== Persistence ===
  Exported: 1847 chars
  Restored: 8 tasks, 3 lists
  Match:    true
  Events fired: 13`,
  },
];
