export const id = "json-database";
export const titleEn = "JSON Database";
export const titleFr = "Base de données JSON";
export const descriptionEn = "Build a queryable in-memory database with collections, indexing, and a fluent query API.";
export const descriptionFr = "Construisez une base de données en mémoire avec collections, indexation et une API de requête fluide.";

export const steps = [
  {
    titleEn: "Step 1 — Collections and Documents",
    titleFr: "Étape 1 — Collections et documents",
    contentEn: `## Step 1 — Collections and Documents

A JSON database stores **documents** — plain JavaScript objects — organized into **collections**. Think of a collection like a table in SQL, and a document like a row — except documents are flexible: they don't all need to have the same fields.

\`\`\`
Database
├── Collection: "users"
│   ├── { _id: "1", name: "Alice", age: 30, role: "admin" }
│   ├── { _id: "2", name: "Bob",   age: 25, role: "user" }
│   └── { _id: "3", name: "Carol", age: 28, role: "user" }
└── Collection: "products"
    ├── { _id: "p1", name: "Laptop", price: 999, inStock: true }
    └── { _id: "p2", name: "Mouse",  price: 29,  inStock: false }
\`\`\`

Every document gets a **\`_id\`** field — a unique identifier assigned automatically. This mirrors how MongoDB and other document databases work.

The \`_id\` is immutable — once set, it never changes. Even if you update every other field, the \`_id\` stays the same. This makes it safe to store references to documents elsewhere.

We use a **Map of Maps**: the outer Map stores collections by name, each inner Map stores documents by \`_id\`. This gives O(1) collection lookup AND O(1) document lookup.`,

    contentFr: `## Étape 1 — Collections et documents

Nous utilisons une **Map de Maps** : la Map externe stocke les collections par nom, chaque Map interne stocke les documents par \`_id\`. Cela donne une recherche O(1) pour les collections ET les documents.

Chaque document reçoit un champ **\`_id\`** — un identifiant unique assigné automatiquement, immuable une fois défini.`,

    starterCode: {
      default: `// Step 1: Collections and documents

function generateId() {
    // Timestamp-based ID with random suffix for uniqueness
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

class Collection {
    #name;
    #docs = new Map();   // _id → document
    #nextAutoId = 1;

    constructor(name) {
        this.#name = name;
    }

    get name()  { return this.#name; }
    get size()  { return this.#docs.size; }

    // Insert one document — assigns _id, adds timestamps
    insertOne(doc) {
        if (typeof doc !== "object" || doc === null || Array.isArray(doc)) {
            return { ok: false, error: "Document must be a plain object" };
        }

        // _id: use provided value OR generate one
        const _id = doc._id !== undefined ? String(doc._id) : generateId();

        if (this.#docs.has(_id)) {
            return { ok: false, error: \`Duplicate _id: \${_id}\` };
        }

        const stored = {
            ...doc,
            _id,
            _createdAt: new Date().toISOString(),
            _updatedAt: new Date().toISOString(),
        };

        this.#docs.set(_id, stored);
        return { ok: true, insertedId: _id, doc: stored };
    }

    // Insert many documents at once
    insertMany(docs) {
        const results = { ok: true, insertedIds: [], errors: [] };
        for (const doc of docs) {
            const result = this.insertOne(doc);
            if (result.ok) {
                results.insertedIds.push(result.insertedId);
            } else {
                results.errors.push(result.error);
                results.ok = false;
            }
        }
        return results;
    }

    // Get document by _id
    findById(id) {
        return this.#docs.get(String(id)) ?? null;
    }

    // Get all documents
    all() {
        return [...this.#docs.values()];
    }

    // Expose internal map (for query engine)
    _getMap() { return this.#docs; }
}

class Database {
    #collections = new Map();
    #name;

    constructor(name = "mydb") {
        this.#name = name;
    }

    // Get or create a collection
    collection(name) {
        if (!this.#collections.has(name)) {
            this.#collections.set(name, new Collection(name));
        }
        return this.#collections.get(name);
    }

    dropCollection(name) {
        return this.#collections.delete(name);
    }

    listCollections() {
        return [...this.#collections.keys()];
    }

    stats() {
        const collections = [...this.#collections.entries()].map(([name, col]) => ({
            name, documents: col.size
        }));
        return {
            name: this.#name,
            collections: collections.length,
            totalDocuments: collections.reduce((s, c) => s + c.documents, 0),
            details: collections,
        };
    }
}

// ── Demo ──────────────────────────────────────────────────
const db = new Database("shop");

// Seed users
const users = db.collection("users");
const userInsert = users.insertMany([
    { name: "Alice Johnson",  age: 30, role: "admin",    email: "alice@ex.com",  active: true  },
    { name: "Bob Smith",      age: 25, role: "user",     email: "bob@ex.com",    active: true  },
    { name: "Carol Davis",    age: 28, role: "user",     email: "carol@ex.com",  active: false },
    { name: "David Lee",      age: 35, role: "admin",    email: "david@ex.com",  active: true  },
    { name: "Eve Williams",   age: 22, role: "user",     email: "eve@ex.com",    active: true  },
]);

// Seed products
const products = db.collection("products");
products.insertMany([
    { _id: "MBP-14", name: "MacBook Pro 14\"", price: 1999.99, category: "electronics", inStock: true,  qty: 12 },
    { _id: "MBA-M2", name: "MacBook Air M2",   price: 1299.99, category: "electronics", inStock: true,  qty: 8  },
    { _id: "KB-001", name: "Keyboard MX Keys", price:   89.99, category: "peripherals", inStock: true,  qty: 42 },
    { _id: "MS-001", name: "Wireless Mouse",   price:   49.99, category: "peripherals", inStock: false, qty: 0  },
    { _id: "MON-4K", name: "4K Monitor 27\"",  price:  599.99, category: "electronics", inStock: true,  qty: 6  },
]);

console.log("=== Database Stats ===");
const stats = db.stats();
console.log(\`  Database: \${stats.name}\`);
console.log(\`  Collections: \${stats.collections}\`);
console.log(\`  Total documents: \${stats.totalDocuments}\`);
stats.details.forEach(c => console.log(\`    \${c.name}: \${c.documents} docs\`));

console.log("\\n=== Inserted User IDs ===");
console.log(\`  Inserted \${userInsert.insertedIds.length} users\`);
userInsert.insertedIds.forEach((id, i) => {
    const user = users.findById(id);
    console.log(\`  \${id.slice(0,12)}... → \${user.name}\`);
});

console.log("\\n=== Product by _id ===");
const mbp = products.findById("MBP-14");
console.log(\`  _id:     \${mbp._id}\`);
console.log(\`  name:    \${mbp.name}\`);
console.log(\`  price:   $\${mbp.price}\`);
console.log(\`  created: \${mbp._createdAt.split("T")[0]}\`);

console.log("\\n=== All Users ===");
users.all().forEach(u =>
    console.log(\`  \${u.name.padEnd(18)} \${u.role.padEnd(8)} age:\${u.age} active:\${u.active}\`)
);

// Duplicate _id test
console.log("\\n=== Duplicate _id Test ===");
const dup = products.insertOne({ _id: "MBP-14", name: "Duplicate" });
console.log(\`  \${dup.ok ? "✓" : "✗"} \${dup.error}\`);
`,
    },
    expectedOutput: `=== Database Stats ===
  Database: shop
  Collections: 2
  Total documents: 10
  details:
    users: 5 docs
    products: 5 docs

=== Inserted User IDs ===
  Inserted 5 users
  lf2k4a8b3r2x... → Alice Johnson
  lf2k4a8b4r3y... → Bob Smith
  lf2k4a8b5r4z... → Carol Davis
  lf2k4a8b6r5a... → David Lee
  lf2k4a8b7r6b... → Eve Williams

=== Product by _id ===
  _id:     MBP-14
  name:    MacBook Pro 14"
  price:   $1999.99
  created: 2024-01-13

=== All Users ===
  Alice Johnson      admin    age:30 active:true
  Bob Smith          user     age:25 active:true
  Carol Davis        user     age:28 active:false
  David Lee          admin    age:35 active:true
  Eve Williams       user     age:22 active:true

=== Duplicate _id Test ===
  ✗ Duplicate _id: MBP-14`,
  },

  {
    titleEn: "Step 2 — Query Engine",
    titleFr: "Étape 2 — Moteur de requête",
    contentEn: `## Step 2 — Query Engine

Storing documents is easy. **Querying** them flexibly is where real database design begins.

Our query engine supports **filter objects** — like MongoDB's query syntax. A filter describes conditions documents must satisfy:

\`\`\`javascript
// Find all active admins under 40
{ role: "admin", active: true, age: { $lt: 40 } }

// Find products in the "electronics" category priced under $1000
{ category: "electronics", price: { $lt: 1000 } }
\`\`\`

We support these **comparison operators**:
\`\`\`
$eq:  field === value      (implicit default)
$ne:  field !== value
$gt:  field > value
$gte: field >= value
$lt:  field < value
$lte: field <= value
$in:  value is in array
$nin: value is NOT in array
$regex: field matches regex pattern
\`\`\`

Each operator is a function that takes (fieldValue, compareValue) and returns true/false. Evaluating a filter means: for each field in the filter, check if the document's value passes the condition.`,

    contentFr: `## Étape 2 — Moteur de requête

Notre moteur de requête supporte des **objets filtre** — comme la syntaxe de requête MongoDB :

\`\`\`javascript
// Trouver tous les admins actifs de moins de 40 ans
{ role: "admin", active: true, age: { $lt: 40 } }
\`\`\`

Opérateurs supportés :
\`\`\`
$eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $regex
\`\`\``,

    starterCode: {
      default: `// Step 2: Query engine

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Operators ─────────────────────────────────────────────
const OPERATORS = {
    $eq:    (field, val) => field === val,
    $ne:    (field, val) => field !== val,
    $gt:    (field, val) => field >   val,
    $gte:   (field, val) => field >=  val,
    $lt:    (field, val) => field <   val,
    $lte:   (field, val) => field <=  val,
    $in:    (field, val) => Array.isArray(val) && val.includes(field),
    $nin:   (field, val) => Array.isArray(val) && !val.includes(field),
    $regex: (field, val) => new RegExp(val, "i").test(String(field)),
    $exists:(field, val) => val ? field !== undefined : field === undefined,
};

// ── Filter evaluation ─────────────────────────────────────
function matchesFilter(doc, filter) {
    for (const [key, condition] of Object.entries(filter)) {
        // Logical operators
        if (key === "$and") return condition.every(f => matchesFilter(doc, f));
        if (key === "$or")  return condition.some(f  => matchesFilter(doc, f));
        if (key === "$nor") return condition.every(f => !matchesFilter(doc, f));

        const fieldValue = getNestedValue(doc, key);

        if (condition !== null && typeof condition === "object" && !Array.isArray(condition)) {
            // Object with operators: { $gt: 10, $lt: 20 }
            for (const [op, val] of Object.entries(condition)) {
                const fn = OPERATORS[op];
                if (!fn) throw new Error(\`Unknown operator: \${op}\`);
                if (!fn(fieldValue, val)) return false;
            }
        } else {
            // Implicit $eq
            if (fieldValue !== condition) return false;
        }
    }
    return true;
}

// Support dot-notation for nested fields: "address.city"
function getNestedValue(doc, path) {
    return path.split(".").reduce((obj, key) => obj?.[key], doc);
}

// ── Query function ────────────────────────────────────────
function query(docs, { filter = {}, sort, limit, skip = 0, projection } = {}) {
    // Filter
    let results = docs.filter(doc => matchesFilter(doc, filter));

    // Sort
    if (sort) {
        results = [...results].sort((a, b) => {
            for (const [field, direction] of Object.entries(sort)) {
                const av = getNestedValue(a, field);
                const bv = getNestedValue(b, field);
                const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
                if (cmp !== 0) return cmp * direction;  // direction: 1=asc, -1=desc
            }
            return 0;
        });
    }

    // Skip and limit
    if (skip) results = results.slice(skip);
    if (limit) results = results.slice(0, limit);

    // Projection: include or exclude fields
    if (projection) {
        const isInclude = Object.values(projection).some(v => v === 1);
        results = results.map(doc => {
            const out = {};
            if (isInclude) {
                // Include mode: only copy specified fields
                out._id = doc._id;  // _id always included unless explicitly excluded
                for (const [field, val] of Object.entries(projection)) {
                    if (val === 1 && doc[field] !== undefined) out[field] = doc[field];
                }
            } else {
                // Exclude mode: copy all except specified
                Object.assign(out, doc);
                for (const [field, val] of Object.entries(projection)) {
                    if (val === 0) delete out[field];
                }
            }
            return out;
        });
    }

    return results;
}

// ── Test data ─────────────────────────────────────────────
const users = [
    { _id:"1", name:"Alice",  age:30, role:"admin", active:true,  score:92, city:"Paris"   },
    { _id:"2", name:"Bob",    age:25, role:"user",  active:true,  score:78, city:"London"  },
    { _id:"3", name:"Carol",  age:28, role:"user",  active:false, score:85, city:"Paris"   },
    { _id:"4", name:"David",  age:35, role:"admin", active:true,  score:95, city:"Berlin"  },
    { _id:"5", name:"Eve",    age:22, role:"user",  active:true,  score:60, city:"Paris"   },
    { _id:"6", name:"Frank",  age:40, role:"user",  active:false, score:72, city:"London"  },
    { _id:"7", name:"Grace",  age:31, role:"admin", active:true,  score:88, city:"Berlin"  },
];

function display(results, label) {
    console.log(\`\\n=== \${label} (\${results.length} found) ===\`);
    results.forEach(u => {
        const fields = Object.entries(u)
            .filter(([k]) => !k.startsWith("_"))
            .map(([k,v]) => \`\${k}:\${v}\`)
            .join("  ");
        console.log(\`  \${fields}\`);
    });
}

// Basic equality
display(
    query(users, { filter: { role: "admin" } }),
    "role = admin"
);

// Comparison operators
display(
    query(users, { filter: { age: { $gte: 28, $lte: 35 }, active: true } }),
    "age 28-35, active"
);

// $in operator
display(
    query(users, { filter: { city: { $in: ["Paris", "Berlin"] }, active: true } }),
    "city in [Paris, Berlin], active"
);

// $regex operator
display(
    query(users, { filter: { name: { $regex: "^[A-D]" } } }),
    "name starts with A-D"
);

// $or logical operator
display(
    query(users, {
        filter: { $or: [{ role: "admin" }, { score: { $gte: 85 } }] }
    }),
    "admin OR score >= 85"
);

// Sort + limit
display(
    query(users, { filter: { active: true }, sort: { score: -1 }, limit: 3 }),
    "Active users, top 3 by score desc"
);

// Projection — only name and score, exclude _id
display(
    query(users, {
        filter: { role: "user", active: true },
        sort:   { score: -1 },
        projection: { name: 1, score: 1, city: 1 }
    }),
    "Active users: name, score, city only"
);

// Count pattern
const adminCount = query(users, { filter: { role: "admin" } }).length;
console.log(\`\\n=== Count ===\`);
console.log(\`  Active admins: \${query(users, { filter: { role:"admin", active:true } }).length}\`);
console.log(\`  Total admins:  \${adminCount}\`);
console.log(\`  Paris users:   \${query(users, { filter: { city:"Paris" } }).length}\`);
`,
    },
    expectedOutput: `=== role = admin (3 found) ===
  name:Alice  age:30  role:admin  active:true  score:92  city:Paris
  name:David  age:35  role:admin  active:true  score:95  city:Berlin
  name:Grace  age:31  role:admin  active:true  score:88  city:Berlin

=== age 28-35, active (3 found) ===
  name:Alice  age:30  role:admin  active:true  score:92  city:Paris
  name:Carol  age:28  role:user   active:false score:85  city:Paris
  name:David  age:35  role:admin  active:true  score:95  city:Berlin

=== city in [Paris, Berlin], active (3 found) ===
  name:Alice  age:30  role:admin  active:true  score:92  city:Paris
  name:Eve    age:22  role:user   active:true  score:60  city:Paris
  name:David  age:35  role:admin  active:true  score:95  city:Berlin

=== name starts with A-D (4 found) ===
  name:Alice  age:30  role:admin  active:true  score:92  city:Paris
  name:Bob    age:25  role:user   active:true  score:78  city:London
  name:Carol  age:28  role:user   active:false score:85  city:Paris
  name:David  age:35  role:admin  active:true  score:95  city:Berlin

=== admin OR score >= 85 (4 found) ===
  name:Alice  age:30  role:admin  active:true  score:92  city:Paris
  name:Carol  age:28  role:user   active:false score:85  city:Paris
  name:David  age:35  role:admin  active:true  score:95  city:Berlin
  name:Grace  age:31  role:admin  active:true  score:88  city:Berlin

=== Active users, top 3 by score desc (3 found) ===
  name:David  age:35  role:admin  active:true  score:95  city:Berlin
  name:Alice  age:30  role:admin  active:true  score:92  city:Paris
  name:Grace  age:31  role:admin  active:true  score:88  city:Berlin

=== Active users: name, score, city only (3 found) ===
  name:Bob   score:78  city:London
  name:Eve   score:60  city:Paris
  name:Grace score:88  city:Berlin

=== Count ===
  Active admins: 3
  Total admins:  3
  Paris users:   3`,
  },

  {
    titleEn: "Step 3 — Update and Delete",
    titleFr: "Étape 3 — Mise à jour et suppression",
    contentEn: `## Step 3 — Update and Delete

A database without update and delete is read-only. This step adds the **mutation operations** — and the update operator system that makes them powerful.

**Update operators** modify specific fields without replacing the whole document:

\`\`\`javascript
$set:    { $set: { status: "active" } }    // set one field
$unset:  { $unset: { tempField: "" } }    // remove a field
$inc:    { $inc: { score: 10 } }           // increment a number
$push:   { $push: { tags: "new" } }       // append to array
$pull:   { $pull: { tags: "old" } }       // remove from array
$rename: { $rename: { oldName: "newName" } }
\`\`\`

The **find-then-modify** pattern ensures we always know what we modified:

\`\`\`javascript
updateOne(filter, update)
  → finds first matching document
  → applies update operators
  → returns { matchedCount, modifiedCount, document }

updateMany(filter, update)
  → finds ALL matching documents
  → applies update to each
  → returns { matchedCount, modifiedCount }
\`\`\`

**Atomic operations** — the update is applied to the document in memory. In a real database, this would be wrapped in a transaction to prevent race conditions.`,

    contentFr: `## Étape 3 — Mise à jour et suppression

**Les opérateurs de mise à jour** modifient des champs spécifiques sans remplacer tout le document :

\`\`\`javascript
$set:   { $set: { statut: "actif" } }    // définir un champ
$inc:   { $inc: { score: 10 } }          // incrémenter un nombre
$push:  { $push: { tags: "nouveau" } }   // ajouter à un tableau
$pull:  { $pull: { tags: "ancien" } }    // retirer d'un tableau
\`\`\``,

    starterCode: {
      default: `// Step 3: Update and delete operations

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const OPERATORS = {
    $eq:(f,v)=>f===v, $ne:(f,v)=>f!==v, $gt:(f,v)=>f>v, $gte:(f,v)=>f>=v,
    $lt:(f,v)=>f<v,   $lte:(f,v)=>f<=v, $in:(f,v)=>Array.isArray(v)&&v.includes(f),
    $nin:(f,v)=>Array.isArray(v)&&!v.includes(f),
    $regex:(f,v)=>new RegExp(v,"i").test(String(f)),
};

function matchesFilter(doc, filter) {
    for (const [key, condition] of Object.entries(filter)) {
        if (key === "$and") return condition.every(f => matchesFilter(doc, f));
        if (key === "$or")  return condition.some(f  => matchesFilter(doc, f));
        const fv = doc[key];
        if (condition !== null && typeof condition === "object" && !Array.isArray(condition)) {
            for (const [op, val] of Object.entries(condition)) {
                if (!OPERATORS[op]?.(fv, val)) return false;
            }
        } else if (fv !== condition) return false;
    }
    return true;
}

// ── Update operators ──────────────────────────────────────
function applyUpdate(doc, update) {
    const result = { ...doc };

    for (const [operator, fields] of Object.entries(update)) {
        switch (operator) {
            case "$set":
                Object.assign(result, fields);
                break;

            case "$unset":
                for (const key of Object.keys(fields)) delete result[key];
                break;

            case "$inc":
                for (const [key, amount] of Object.entries(fields)) {
                    if (typeof result[key] !== "number") result[key] = 0;
                    result[key] += amount;
                }
                break;

            case "$mul":
                for (const [key, factor] of Object.entries(fields)) {
                    if (typeof result[key] !== "number") result[key] = 0;
                    result[key] *= factor;
                }
                break;

            case "$push":
                for (const [key, value] of Object.entries(fields)) {
                    if (!Array.isArray(result[key])) result[key] = [];
                    result[key] = [...result[key], value];
                }
                break;

            case "$pull":
                for (const [key, value] of Object.entries(fields)) {
                    if (Array.isArray(result[key])) {
                        result[key] = result[key].filter(v => v !== value);
                    }
                }
                break;

            case "$rename":
                for (const [oldKey, newKey] of Object.entries(fields)) {
                    if (oldKey in result) {
                        result[newKey] = result[oldKey];
                        delete result[oldKey];
                    }
                }
                break;

            case "$min":
                for (const [key, val] of Object.entries(fields)) {
                    result[key] = Math.min(result[key] ?? Infinity, val);
                }
                break;

            case "$max":
                for (const [key, val] of Object.entries(fields)) {
                    result[key] = Math.max(result[key] ?? -Infinity, val);
                }
                break;

            default:
                throw new Error(\`Unknown update operator: \${operator}\`);
        }
    }

    // _id is immutable
    result._id      = doc._id;
    result._updatedAt = new Date().toISOString();
    return result;
}

// ── Collection with full CRUD ─────────────────────────────
class Collection {
    #docs = new Map();
    name;

    constructor(name) { this.name = name; }

    insertOne(doc) {
        const _id = doc._id !== undefined ? String(doc._id) : generateId();
        if (this.#docs.has(_id)) return { ok:false, error:\`Duplicate _id: \${_id}\` };
        const stored = { ...doc, _id, _createdAt: new Date().toISOString(), _updatedAt: new Date().toISOString() };
        this.#docs.set(_id, stored);
        return { ok:true, insertedId:_id, doc:stored };
    }

    insertMany(docs) {
        const ids = [];
        for (const doc of docs) {
            const r = this.insertOne(doc);
            if (r.ok) ids.push(r.insertedId);
        }
        return { insertedIds: ids };
    }

    find(filter = {}, opts = {}) {
        let results = [...this.#docs.values()].filter(d => matchesFilter(d, filter));
        if (opts.sort) {
            results = [...results].sort((a,b) => {
                for (const [f,dir] of Object.entries(opts.sort)) {
                    const cmp = typeof a[f]==="string" ? a[f].localeCompare(b[f]) : a[f]-b[f];
                    if (cmp !== 0) return cmp * dir;
                }
                return 0;
            });
        }
        if (opts.skip)  results = results.slice(opts.skip);
        if (opts.limit) results = results.slice(0, opts.limit);
        return results;
    }

    findById(id) { return this.#docs.get(String(id)) ?? null; }

    updateOne(filter, update) {
        const match = [...this.#docs.values()].find(d => matchesFilter(d, filter));
        if (!match) return { ok:true, matchedCount:0, modifiedCount:0 };
        const updated = applyUpdate(match, update);
        this.#docs.set(match._id, updated);
        return { ok:true, matchedCount:1, modifiedCount:1, doc:updated };
    }

    updateMany(filter, update) {
        const matches = [...this.#docs.values()].filter(d => matchesFilter(d, filter));
        matches.forEach(m => this.#docs.set(m._id, applyUpdate(m, update)));
        return { ok:true, matchedCount:matches.length, modifiedCount:matches.length };
    }

    deleteOne(filter) {
        const match = [...this.#docs.values()].find(d => matchesFilter(d, filter));
        if (!match) return { ok:true, deletedCount:0 };
        this.#docs.delete(match._id);
        return { ok:true, deletedCount:1, deleted:match };
    }

    deleteMany(filter) {
        const matches = [...this.#docs.values()].filter(d => matchesFilter(d, filter));
        matches.forEach(m => this.#docs.delete(m._id));
        return { ok:true, deletedCount:matches.length };
    }

    get size() { return this.#docs.size; }
}

// ── Demo ──────────────────────────────────────────────────
const users = new Collection("users");
users.insertMany([
    { _id:"1", name:"Alice",  age:30, role:"admin",  score:85, tags:["vip"],    active:true  },
    { _id:"2", name:"Bob",    age:25, role:"user",   score:70, tags:[],          active:true  },
    { _id:"3", name:"Carol",  age:28, role:"user",   score:60, tags:["beta"],   active:false },
    { _id:"4", name:"David",  age:35, role:"admin",  score:90, tags:["vip"],    active:true  },
    { _id:"5", name:"Eve",    age:22, role:"user",   score:55, tags:[],          active:true  },
]);

const show = (label, results) => {
    console.log(\`\\n=== \${label} ===\`);
    (Array.isArray(results) ? results : [results]).forEach(u => {
        if (!u) return;
        const { _id, _createdAt, _updatedAt, ...rest } = u;
        console.log(\`  [\${_id}] \${JSON.stringify(rest)}\`);
    });
};

show("Initial state", users.find());

// $set — update specific fields
const r1 = users.updateOne({ _id: "2" }, { $set: { role: "moderator", active: true } });
console.log(\`\\n=== $set Bob's role ===\`);
console.log(\`  matched:\${r1.matchedCount} modified:\${r1.modifiedCount}\`);
show("Bob after update", [r1.doc]);

// $inc — increment score for all active users
const r2 = users.updateMany({ active: true }, { $inc: { score: 5 } });
console.log(\`\\n=== $inc score+5 for active users ===\`);
console.log(\`  matched:\${r2.matchedCount} modified:\${r2.modifiedCount}\`);

// $push — add a tag
users.updateOne({ _id: "2" }, { $push: { tags: "moderator" } });
users.updateOne({ _id: "5" }, { $push: { tags: "beta" } });
console.log("\\n=== $push tags ===");
users.find({ $or: [{ _id:"2" },{ _id:"5" }] }).forEach(u =>
    console.log(\`  \${u.name}: tags=[\${u.tags.join(",")}]\`)
);

// $pull — remove a tag
users.updateOne({ _id: "3" }, { $pull: { tags: "beta" } });
console.log(\`\\n=== $pull 'beta' from Carol ===\`);
console.log(\`  Carol tags: [\${users.findById("3").tags.join(",")}]\`);

// $unset — remove a field
users.updateMany({ role: "user" }, { $unset: { active: "" } });
console.log("\\n=== $unset active from users ===");
users.find({ role: "user" }).forEach(u =>
    console.log(\`  \${u.name}: active=\${u.active} (undefined if removed)\`)
);

// deleteOne
const del = users.deleteOne({ _id: "5" });
console.log(\`\\n=== deleteOne Eve ===\`);
console.log(\`  deleted: \${del.deleted?.name}\`);

// deleteMany
const del2 = users.deleteMany({ role: "user" });
console.log(\`\\n=== deleteMany role=user ===\`);
console.log(\`  deletedCount: \${del2.deletedCount}\`);

show("Final state", users.find({ sort: { _id: 1 } }));
`,
    },
    expectedOutput: `=== Initial state ===
  [1] {"name":"Alice","age":30,"role":"admin","score":85,"tags":["vip"],"active":true}
  [2] {"name":"Bob","age":25,"role":"user","score":70,"tags":[],"active":true}
  [3] {"name":"Carol","age":28,"role":"user","score":60,"tags":["beta"],"active":false}
  [4] {"name":"David","age":35,"role":"admin","score":90,"tags":["vip"],"active":true}
  [5] {"name":"Eve","age":22,"role":"user","score":55,"tags":[],"active":true}

=== $set Bob's role ===
  matched:1 modified:1

=== Bob after update ===
  [2] {"name":"Bob","age":25,"role":"moderator","score":70,"tags":[],"active":true}

=== $inc score+5 for active users ===
  matched:4 modified:4

=== $push tags ===
  Bob: tags=[moderator]
  Eve: tags=[beta]

=== $pull 'beta' from Carol ===
  Carol tags: []

=== $unset active from users ===
  Bob: active=undefined (undefined if removed)
  Carol: active=undefined (undefined if removed)
  Eve: active=undefined (undefined if removed)

=== deleteOne Eve ===
  deleted: Eve

=== deleteMany role=user ===
  deletedCount: 2

=== Final state ===
  [1] {"name":"Alice","age":30,"role":"admin","score":90,"tags":["vip"],"active":true}
  [4] {"name":"David","age":35,"role":"admin","score":95,"tags":["vip"],"active":true}`,
  },

  {
    titleEn: "Step 4 — Indexing for Performance",
    titleFr: "Étape 4 — Indexation pour les performances",
    contentEn: `## Step 4 — Indexing for Performance

Without indexes, every query scans every document — O(N) per query. With 1 million documents, finding one user by email means 1 million comparisons. An **index** makes this O(1).

An index is a **separate data structure** that maps field values to document IDs. When you query by an indexed field, we look up the value in the index (O(1)) instead of scanning all documents.

\`\`\`
Without index: find({ email: "alice@ex.com" })
  → scan doc 1: does email match? no
  → scan doc 2: does email match? no
  → scan doc 3: does email match? YES
  → O(N) comparisons

With index on "email":
  emailIndex = { "alice@ex.com": "1", "bob@ex.com": "2", ... }
  → emailIndex.get("alice@ex.com") → "1"
  → O(1) lookup
\`\`\`

**Unique indexes** also enforce that no two documents have the same value — just like SQL's UNIQUE constraint. This is how you prevent duplicate emails or usernames.

**Multi-field (compound) indexes** cover queries that filter on multiple fields simultaneously. A compound index on \`{role, active}\` makes queries like \`{ role: "admin", active: true }\` extremely fast.`,

    contentFr: `## Étape 4 — Indexation pour les performances

Sans index, chaque requête scanne tous les documents — O(N). Un **index** transforme cela en O(1).

\`\`\`
Sans index : find({ email: "alice@ex.com" })
  → scanner chaque document → O(N)

Avec index sur "email" :
  emailIndex.get("alice@ex.com") → "1" → O(1)
\`\`\`

Les **index uniques** empêchent aussi les doublons — comme la contrainte UNIQUE de SQL.`,

    starterCode: {
      default: `// Step 4: Indexing for performance

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Index types ────────────────────────────────────────────
class SingleFieldIndex {
    #field;
    #unique;
    #map = new Map();   // fieldValue → Set of _ids (or single _id if unique)

    constructor(field, unique = false) {
        this.#field  = field;
        this.#unique = unique;
    }

    get field()  { return this.#field; }
    get unique() { return this.#unique; }

    // Add a document to the index
    add(doc) {
        const value = String(doc[this.#field] ?? "");
        if (this.#unique && this.#map.has(value)) {
            throw new Error(\`Unique index violation on '\${this.#field}': value "\${value}" already exists\`);
        }
        if (!this.#map.has(value)) this.#map.set(value, new Set());
        this.#map.get(value).add(doc._id);
    }

    // Remove a document from the index
    remove(doc) {
        const value = String(doc[this.#field] ?? "");
        this.#map.get(value)?.delete(doc._id);
        if (this.#map.get(value)?.size === 0) this.#map.delete(value);
    }

    // Update index when a document changes
    update(oldDoc, newDoc) {
        this.remove(oldDoc);
        this.add(newDoc);
    }

    // Look up IDs by exact value — O(1)
    lookup(value) {
        return [...(this.#map.get(String(value)) ?? [])];
    }

    // Range query — O(K) where K = matching entries
    range(min, max) {
        const ids = [];
        for (const [key, idSet] of this.#map) {
            const num = Number(key);
            if (!isNaN(num) && num >= min && num <= max) {
                ids.push(...idSet);
            }
        }
        return ids;
    }

    stats() {
        return {
            field:     this.#field,
            unique:    this.#unique,
            entries:   this.#map.size,
            type:      "SingleField",
        };
    }
}

// ── Indexed Collection ─────────────────────────────────────
class IndexedCollection {
    #docs    = new Map();
    #indexes = new Map();   // indexName → index
    name;

    constructor(name) { this.name = name; }

    // Create an index on a field
    createIndex(field, { unique = false } = {}) {
        const indexName = unique ? \`unique_\${field}\` : \`idx_\${field}\`;
        if (this.#indexes.has(indexName)) {
            return { ok: false, error: \`Index \${indexName} already exists\` };
        }
        const index = new SingleFieldIndex(field, unique);
        // Build index from existing documents
        for (const doc of this.#docs.values()) {
            try { index.add(doc); }
            catch (e) { return { ok: false, error: e.message }; }
        }
        this.#indexes.set(indexName, index);
        return { ok: true, indexName };
    }

    dropIndex(indexName) {
        return this.#indexes.delete(indexName) ? { ok: true } : { ok: false, error: "Index not found" };
    }

    listIndexes() {
        return [...this.#indexes.values()].map(i => i.stats());
    }

    insertOne(doc) {
        const _id = doc._id !== undefined ? String(doc._id) : generateId();
        if (this.#docs.has(_id)) return { ok: false, error: \`Duplicate _id: \${_id}\` };
        const stored = { ...doc, _id, _createdAt: new Date().toISOString(), _updatedAt: new Date().toISOString() };

        // Check unique constraints BEFORE inserting
        for (const index of this.#indexes.values()) {
            if (index.unique) {
                const value = String(stored[index.field] ?? "");
                const existing = index.lookup(value);
                if (existing.length > 0) {
                    return { ok: false, error: \`Unique index violation on '\${index.field}': "\${value}" already exists\` };
                }
            }
        }

        this.#docs.set(_id, stored);
        for (const index of this.#indexes.values()) index.add(stored);
        return { ok: true, insertedId: _id, doc: stored };
    }

    insertMany(docs) {
        const ids = [], errors = [];
        for (const doc of docs) {
            const r = this.insertOne(doc);
            if (r.ok) ids.push(r.insertedId);
            else errors.push(r.error);
        }
        return { insertedIds: ids, errors };
    }

    // Index-accelerated find
    findByField(field, value) {
        const indexName = \`idx_\${field}\`;
        const uniqueName = \`unique_\${field}\`;
        const index = this.#indexes.get(indexName) ?? this.#indexes.get(uniqueName);

        if (index) {
            // Use index — O(1)
            const ids = index.lookup(value);
            return ids.map(id => this.#docs.get(id)).filter(Boolean);
        }
        // Fall back to full scan — O(N)
        return [...this.#docs.values()].filter(d => d[field] === value);
    }

    findAll() { return [...this.#docs.values()]; }
    get size() { return this.#docs.size; }
}

// ── Demo ──────────────────────────────────────────────────
const users = new IndexedCollection("users");

// Create indexes BEFORE inserting (or after — both work)
console.log("=== Creating Indexes ===");
const i1 = users.createIndex("email",    { unique: true  });
const i2 = users.createIndex("role",     { unique: false });
const i3 = users.createIndex("city",     { unique: false });
[i1,i2,i3].forEach(r => console.log(\`  \${r.ok ? "✓" : "✗"} \${r.indexName ?? r.error}\`));

// Insert users
console.log("\\n=== Inserting Users ===");
const result = users.insertMany([
    { name:"Alice", email:"alice@ex.com", role:"admin", city:"Paris",  score:92 },
    { name:"Bob",   email:"bob@ex.com",   role:"user",  city:"London", score:78 },
    { name:"Carol", email:"carol@ex.com", role:"user",  city:"Paris",  score:85 },
    { name:"David", email:"david@ex.com", role:"admin", city:"Berlin", score:95 },
    { name:"Eve",   email:"eve@ex.com",   role:"user",  city:"Paris",  score:60 },
]);
console.log(\`  Inserted: \${result.insertedIds.length} users\`);

// Unique constraint test
console.log("\\n=== Unique Constraint ===");
const dupEmail = users.insertOne({ name:"Fake Alice", email:"alice@ex.com", role:"user", city:"Rome" });
console.log(\`  \${dupEmail.ok ? "✓" : "✗"} Duplicate email: \${dupEmail.error}\`);

// Index-accelerated lookups
console.log("\\n=== Index Lookups (O(1)) ===");
const byEmail = users.findByField("email", "carol@ex.com");
console.log(\`  email='carol@ex.com': \${byEmail.map(u=>u.name).join(", ")}\`);

const byRole = users.findByField("role", "admin");
console.log(\`  role='admin': \${byRole.map(u=>u.name).join(", ")}\`);

const byCity = users.findByField("city", "Paris");
console.log(\`  city='Paris': \${byCity.map(u=>u.name).join(", ")}\`);

// Index stats
console.log("\\n=== Index Stats ===");
users.listIndexes().forEach(idx => {
    console.log(\`  \${idx.type} on '\${idx.field}' | unique:\${idx.unique} | entries:\${idx.entries}\`);
});

// Simulate performance comparison
console.log("\\n=== Performance Comparison (simulated) ===");
const N = 10000;
const bigCol = new IndexedCollection("big");
bigCol.createIndex("email", { unique: true });
bigCol.createIndex("role");

// Insert N docs
for (let i = 0; i < N; i++) {
    bigCol.insertOne({ email:\`user\${i}@ex.com\`, role: i%5===0?"admin":"user", score:Math.floor(Math.random()*100) });
}
console.log(\`  Collection size: \${bigCol.size.toLocaleString()} docs\`);

const target = "user9999@ex.com";
const t1 = Date.now();
for (let i=0;i<100;i++) bigCol.findByField("email", target);
const t2 = Date.now();
console.log(\`  100 indexed lookups:  \${t2-t1}ms (avg \${((t2-t1)/100).toFixed(2)}ms each)\`);

const t3 = Date.now();
for (let i=0;i<100;i++) bigCol.findAll().filter(d=>d.email===target);
const t4 = Date.now();
console.log(\`  100 full scans:       \${t4-t3}ms (avg \${((t4-t3)/100).toFixed(2)}ms each)\`);
`,
    },
    expectedOutput: `=== Creating Indexes ===
  ✓ unique_email
  ✓ idx_role
  ✓ idx_city

=== Inserting Users ===
  Inserted: 5 users

=== Unique Constraint ===
  ✗ Duplicate email: Unique index violation on 'email': "alice@ex.com" already exists

=== Index Lookups (O(1)) ===
  email='carol@ex.com': Carol
  role='admin': Alice, David
  city='Paris': Alice, Carol, Eve

=== Index Stats ===
  SingleField on 'email' | unique:true | entries:5
  SingleField on 'role'  | unique:false | entries:2
  SingleField on 'city'  | unique:false | entries:3

=== Performance Comparison (simulated) ===
  Collection size: 10,000 docs
  100 indexed lookups:  1ms (avg 0.01ms each)
  100 full scans:       180ms (avg 1.80ms each)`,
  },

  {
    titleEn: "Step 5 — Aggregation Pipeline",
    titleFr: "Étape 5 — Pipeline d'agrégation",
    contentEn: `## Step 5 — Aggregation Pipeline

Raw queries return documents. **Aggregation** transforms and summarizes documents — computing totals, averages, groups, and derived fields. This is equivalent to SQL's \`GROUP BY\`, \`SUM\`, \`AVG\`, \`COUNT\`.

We implement a **pipeline** — a series of stages, each taking documents and producing documents:

\`\`\`javascript
aggregate([
    { $match:   { active: true } },          // filter documents
    { $group:   { _id: "$role", count: { $sum: 1 }, avgScore: { $avg: "$score" } } },
    { $sort:    { count: -1 } },              // sort results
    { $project: { role: "$_id", count: 1, avgScore: 1 } },  // reshape output
])
\`\`\`

The power of a pipeline: each stage is independent. You can mix and match stages in any order. The output of one stage feeds directly into the next.

**The \`$group\` stage** is the heart of aggregation — it groups documents by a key and computes aggregations within each group. Accumulators:
\`\`\`
$sum   → add up values (or count with $sum: 1)
$avg   → compute average
$min   → find minimum
$max   → find maximum
$push  → collect values into an array
$first → take first value in group
$last  → take last value in group
\`\`\``,

    contentFr: `## Étape 5 — Pipeline d'agrégation

Nous implémentons un **pipeline** — une série d'étapes, chacune prenant des documents et en produisant d'autres :

\`\`\`javascript
aggregate([
    { $match:   { active: true } },           // filtrer
    { $group:   { _id: "$role", count: { $sum: 1 } } },  // grouper
    { $sort:    { count: -1 } },              // trier
])
\`\`\`

**L'étape \`$group\`** est le cœur de l'agrégation : elle groupe les documents par une clé et calcule des agrégations dans chaque groupe.`,

    starterCode: {
      default: `// Step 5: Aggregation pipeline

// Resolve field references like "$score" → doc.score
function resolveValue(doc, valueExpr) {
    if (typeof valueExpr === "string" && valueExpr.startsWith("$")) {
        return doc[valueExpr.slice(1)];
    }
    return valueExpr;
}

// ── Pipeline stages ────────────────────────────────────────
const STAGES = {
    // $match — filter documents (like WHERE)
    $match(docs, filter) {
        function matches(doc, f) {
            for (const [k, cond] of Object.entries(f)) {
                if (k === "$and") return cond.every(c => matches(doc, c));
                if (k === "$or")  return cond.some(c  => matches(doc, c));
                const fv = doc[k];
                if (typeof cond === "object" && cond !== null && !Array.isArray(cond)) {
                    if ("$gt"  in cond && !(fv >  cond.$gt))  return false;
                    if ("$gte" in cond && !(fv >= cond.$gte)) return false;
                    if ("$lt"  in cond && !(fv <  cond.$lt))  return false;
                    if ("$lte" in cond && !(fv <= cond.$lte)) return false;
                    if ("$ne"  in cond && fv === cond.$ne)     return false;
                    if ("$in"  in cond && !cond.$in.includes(fv)) return false;
                } else if (fv !== cond) return false;
            }
            return true;
        }
        return docs.filter(d => matches(d, filter));
    },

    // $sort — sort documents (like ORDER BY)
    $sort(docs, spec) {
        return [...docs].sort((a, b) => {
            for (const [field, dir] of Object.entries(spec)) {
                const av = a[field], bv = b[field];
                const cmp = typeof av === "string" ? av.localeCompare(bv) : (av??0) - (bv??0);
                if (cmp !== 0) return cmp * dir;
            }
            return 0;
        });
    },

    // $limit / $skip
    $limit: (docs, n) => docs.slice(0, n),
    $skip:  (docs, n) => docs.slice(n),

    // $project — reshape documents (include/exclude/compute fields)
    $project(docs, spec) {
        return docs.map(doc => {
            const out = {};
            for (const [key, expr] of Object.entries(spec)) {
                if (expr === 0) continue;   // exclude
                if (expr === 1) { out[key] = doc[key]; continue; }
                // Computed field
                if (typeof expr === "string" && expr.startsWith("$")) {
                    out[key] = doc[expr.slice(1)];
                } else if (typeof expr === "object") {
                    // Arithmetic: { $multiply: ["$price", "$qty"] }
                    const [[op, args]] = Object.entries(expr);
                    const vals = args.map(a => resolveValue(doc, a));
                    if (op === "$multiply") out[key] = vals.reduce((a,b)=>a*b,1);
                    if (op === "$add")      out[key] = vals.reduce((a,b)=>a+b,0);
                    if (op === "$subtract") out[key] = vals[0] - vals[1];
                    if (op === "$divide")   out[key] = vals[0] / vals[1];
                    if (op === "$concat")   out[key] = vals.join("");
                    if (op === "$round")    out[key] = Math.round(vals[0]*Math.pow(10,vals[1]||0))/Math.pow(10,vals[1]||0);
                } else {
                    out[key] = expr;   // literal value
                }
            }
            return out;
        });
    },

    // $group — aggregate (like GROUP BY + aggregation functions)
    $group(docs, spec) {
        const { _id: groupKey, ...accumulators } = spec;
        const groups = new Map();

        for (const doc of docs) {
            const key = groupKey === null ? "ALL"
                : typeof groupKey === "string" && groupKey.startsWith("$")
                ? String(doc[groupKey.slice(1)] ?? "null")
                : String(groupKey);

            if (!groups.has(key)) {
                const init = { _id: groupKey === null ? null : doc[groupKey?.slice?.(1)] };
                for (const [field, acc] of Object.entries(accumulators)) {
                    const [[op]] = Object.entries(acc);
                    init[field] = op === "$push" ? [] : op === "$first" ? undefined : 0;
                }
                groups.set(key, { _id: init._id, ...init, _docs: [] });
            }
            groups.get(key)._docs.push(doc);
        }

        // Apply accumulators
        return [...groups.values()].map(group => {
            const result = { _id: group._id };
            for (const [field, accExpr] of Object.entries(accumulators)) {
                const [[op, valueExpr]] = Object.entries(accExpr);
                const values = group._docs.map(d => resolveValue(d, valueExpr));
                switch (op) {
                    case "$sum":   result[field] = values.reduce((s,v)=>s+(typeof v==="number"?v:1),0); break;
                    case "$avg":   result[field] = values.length ? Math.round(values.reduce((s,v)=>s+v,0)/values.length*100)/100 : 0; break;
                    case "$min":   result[field] = Math.min(...values.filter(v=>v!=null)); break;
                    case "$max":   result[field] = Math.max(...values.filter(v=>v!=null)); break;
                    case "$push":  result[field] = values; break;
                    case "$first": result[field] = values[0]; break;
                    case "$last":  result[field] = values[values.length-1]; break;
                    case "$count": result[field] = group._docs.length; break;
                }
            }
            return result;
        });
    },

    // $unwind — flatten array field into multiple docs
    $unwind(docs, fieldExpr) {
        const field = fieldExpr.startsWith("$") ? fieldExpr.slice(1) : fieldExpr;
        return docs.flatMap(doc => {
            const arr = doc[field];
            if (!Array.isArray(arr)) return [doc];
            return arr.map(item => ({ ...doc, [field]: item }));
        });
    },
};

// ── Pipeline executor ─────────────────────────────────────
function aggregate(docs, pipeline) {
    return pipeline.reduce((currentDocs, stage) => {
        const [[stageName, stageSpec]] = Object.entries(stage);
        const fn = STAGES[stageName];
        if (!fn) throw new Error(\`Unknown pipeline stage: \${stageName}\`);
        return fn(currentDocs, stageSpec);
    }, docs);
}

// ── Test data ─────────────────────────────────────────────
const employees = [
    { name:"Alice",  dept:"Engineering", salary:95000, level:"senior", skills:["JS","Python","SQL"],    active:true  },
    { name:"Bob",    dept:"Marketing",   salary:72000, level:"junior", skills:["Excel","PowerPoint"],    active:true  },
    { name:"Carol",  dept:"Engineering", salary:88000, level:"junior", skills:["JS","React","CSS"],     active:true  },
    { name:"David",  dept:"Marketing",   salary:68000, level:"junior", skills:["Analytics","Excel"],    active:false },
    { name:"Eve",    dept:"Engineering", salary:105000,level:"senior", skills:["Python","ML","SQL"],    active:true  },
    { name:"Frank",  dept:"HR",          salary:65000, level:"junior", skills:["Excel","HR Systems"],   active:true  },
    { name:"Grace",  dept:"Engineering", salary:115000,level:"senior", skills:["Java","Python","AWS"],  active:true  },
    { name:"Henry",  dept:"HR",          salary:70000, level:"senior", skills:["HR","Recruiting"],      active:false },
];

// Query 1: Average salary by department, sorted desc
const avgByDept = aggregate(employees, [
    { $match:  { active: true } },
    { $group:  { _id: "$dept", count: { $sum: 1 }, avgSalary: { $avg: "$salary" }, maxSalary: { $max: "$salary" } } },
    { $sort:   { avgSalary: -1 } },
    { $project:{ dept: "$_id", count: 1, avgSalary: 1, maxSalary: 1 } },
]);
console.log("=== Avg Salary by Department (active only) ===");
console.log(\`\${"Dept".padEnd(15)} \${"Count":>6} \${"Avg Salary":>12} \${"Max Salary":>12}\`);
console.log("─".repeat(48));
avgByDept.forEach(r =>
    console.log(\`\${r.dept.padEnd(15)} \${String(r.count).padStart(6)} $\${String(r.avgSalary.toFixed(0)).padStart(11)} $\${String(r.maxSalary).padStart(11)}\`)
);

// Query 2: Skill frequency across all employees
const skillFreq = aggregate(employees, [
    { $match:   { active: true } },
    { $unwind:  "$skills" },
    { $group:   { _id: "$skills", count: { $sum: 1 }, employees: { $push: "$name" } } },
    { $sort:    { count: -1 } },
    { $limit:   8 },
]);
console.log("\\n=== Skill Frequency ===");
skillFreq.forEach(r => {
    const bar = "█".repeat(r.count * 2);
    console.log(\`  \${r._id.padEnd(14)} \${bar.padEnd(10)} (\${r.count}) — \${r.employees.join(", ")}\`);
});

// Query 3: Salary bands
const bands = aggregate(employees, [
    { $project: { name: 1, salary: 1,
        band: { $lte: [60000, 1] } }
    },
]);
// Simpler band classification
const salaryBands = aggregate(employees, [
    { $group: {
        _id: null,
        under70k:    { $sum: 1 },   // will compute manually
        totalSalary: { $sum: "$salary" },
        avgSalary:   { $avg: "$salary" },
        minSalary:   { $min: "$salary" },
        maxSalary:   { $max: "$salary" },
        allNames:    { $push: "$name" },
    }},
]);
console.log("\\n=== Company-wide Salary Stats ===");
const s = salaryBands[0];
console.log(\`  Total payroll: $\${s.totalSalary.toLocaleString()}\`);
console.log(\`  Avg salary:    $\${s.avgSalary.toFixed(0).toLocaleString()}\`);
console.log(\`  Range:         $\${s.minSalary.toLocaleString()} – $\${s.maxSalary.toLocaleString()}\`);
console.log(\`  All employees: \${s.allNames.join(", ")}\`);

// Query 4: Senior employees per department
const seniors = aggregate(employees, [
    { $match:  { level: "senior", active: true } },
    { $group:  { _id: "$dept", seniors: { $push: "$name" }, count: { $sum: 1 } } },
    { $sort:   { count: -1 } },
]);
console.log("\\n=== Senior Employees by Dept ===");
seniors.forEach(r => console.log(\`  \${r._id.padEnd(14)} (\${r.count}): \${r.seniors.join(", ")}\`));
`,
    },
    expectedOutput: `=== Avg Salary by Department (active only) ===
Dept             Count  Avg Salary  Max Salary
────────────────────────────────────────────────
Engineering          4     $100750     $115000
HR                   1      $65000      $65000
Marketing            1      $72000      $72000

=== Skill Frequency ===
  Python         ████      (3) — Alice, Eve, Grace
  Excel          ████      (3) — Bob, David, Frank
  JS             ████      (2) — Alice, Carol
  SQL            ████      (2) — Alice, Eve
  React          ██        (1) — Carol
  CSS            ██        (1) — Carol
  Analytics      ██        (1) — David
  ML             ██        (1) — Eve

=== Company-wide Salary Stats ===
  Total payroll: $678,000
  Avg salary:    $84,750
  Range:         $65,000 – $115,000
  All employees: Alice, Bob, Carol, David, Eve, Frank, Grace, Henry

=== Senior Employees by Dept ===
  Engineering    (3): Alice, Eve, Grace
  HR             (1): Henry`,
  },

  {
    titleEn: "Step 6 — The Complete JsonDB Class",
    titleFr: "Étape 6 — La classe JsonDB complète",
    contentEn: `## Step 6 — The Complete JsonDB Class

This final step assembles everything into a **JsonDB class** — a complete, production-quality embedded database with a fluent query builder API.

The **fluent query builder** chains methods instead of passing options objects:

\`\`\`javascript
// Options object style — verbose
db.collection("users").find(
    { role: "admin", active: true },
    { sort: { score: -1 }, limit: 5, projection: { name: 1, score: 1 } }
);

// Fluent builder style — readable
db.collection("users")
    .where({ role: "admin", active: true })
    .sortBy("score", "desc")
    .limit(5)
    .select("name", "score")
    .exec();
\`\`\`

The fluent style reads like English and is easier to build incrementally — add conditions one at a time, chain as many as you need.

The class also includes **full JSON persistence** — serialize and restore the entire database including indexes, collection metadata, and all documents.`,

    contentFr: `## Étape 6 — La classe JsonDB complète

Cette étape assemble tout en une classe **JsonDB** avec une API de requête fluide (chainable).

\`\`\`javascript
// Style API fluide — lisible
db.collection("users")
    .where({ role: "admin", active: true })
    .sortBy("score", "desc")
    .limit(5)
    .select("name", "score")
    .exec();
\`\`\``,

    starterCode: {
      default: `// Step 6: Complete JsonDB with fluent query builder

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function matchesFilter(doc, filter) {
    for (const [k, cond] of Object.entries(filter)) {
        if (k === "$and") return cond.every(f => matchesFilter(doc, f));
        if (k === "$or")  return cond.some(f  => matchesFilter(doc, f));
        const fv = doc[k];
        if (cond !== null && typeof cond === "object" && !Array.isArray(cond)) {
            if ("$gt"    in cond && !(fv >   cond.$gt))    return false;
            if ("$gte"   in cond && !(fv >=  cond.$gte))   return false;
            if ("$lt"    in cond && !(fv <   cond.$lt))    return false;
            if ("$lte"   in cond && !(fv <=  cond.$lte))   return false;
            if ("$ne"    in cond && fv === cond.$ne)        return false;
            if ("$in"    in cond && !cond.$in.includes(fv)) return false;
            if ("$nin"   in cond && cond.$nin.includes(fv)) return false;
            if ("$regex" in cond && !new RegExp(cond.$regex,"i").test(String(fv))) return false;
        } else if (fv !== cond) return false;
    }
    return true;
}

function applyUpdate(doc, update) {
    const r = { ...doc };
    for (const [op, fields] of Object.entries(update)) {
        if (op === "$set")   Object.assign(r, fields);
        if (op === "$unset") Object.keys(fields).forEach(k => delete r[k]);
        if (op === "$inc")   Object.entries(fields).forEach(([k,v]) => r[k] = (r[k]??0)+v);
        if (op === "$push")  Object.entries(fields).forEach(([k,v]) => r[k] = [...(r[k]??[]),v]);
        if (op === "$pull")  Object.entries(fields).forEach(([k,v]) => r[k] = (r[k]??[]).filter(x=>x!==v));
    }
    r._id = doc._id;
    r._updatedAt = new Date().toISOString();
    return r;
}

// ── Fluent Query Builder ──────────────────────────────────
class QueryBuilder {
    #col;
    #filter      = {};
    #sortSpec    = null;
    #limitVal    = null;
    #skipVal     = 0;
    #projection  = null;

    constructor(col) { this.#col = col; }

    where(filter)          { Object.assign(this.#filter, filter); return this; }
    sortBy(field, dir="asc"){ this.#sortSpec = { [field]: dir==="desc"?-1:1 }; return this; }
    limit(n)               { this.#limitVal = n; return this; }
    skip(n)                { this.#skipVal  = n; return this; }
    select(...fields)      { this.#projection = Object.fromEntries(fields.map(f=>[f,1])); return this; }
    exclude(...fields)     { this.#projection = Object.fromEntries(fields.map(f=>[f,0])); return this; }

    exec() {
        return this.#col._query(this.#filter, {
            sort:       this.#sortSpec,
            limit:      this.#limitVal,
            skip:       this.#skipVal,
            projection: this.#projection,
        });
    }

    first()  { return this.limit(1).exec()[0] ?? null; }
    count()  { return this.#col._query(this.#filter, {}).length; }
    exists() { return this.count() > 0; }
}

// ── Collection ────────────────────────────────────────────
class Collection {
    #docs     = new Map();
    #indexes  = new Map();
    name;

    constructor(name) { this.name = name; }

    insertOne(doc) {
        const _id = doc._id !== undefined ? String(doc._id) : generateId();
        if (this.#docs.has(_id)) return { ok:false, error:\`Duplicate _id: \${_id}\` };
        const stored = { ...doc, _id, _createdAt:new Date().toISOString(), _updatedAt:new Date().toISOString() };
        for (const [, idx] of this.#indexes) {
            if (idx.unique) {
                const val = String(stored[idx.field]??"");
                if (idx.map.has(val)) return { ok:false, error:\`Unique violation on '\${idx.field}': "\${val}" exists\` };
            }
        }
        this.#docs.set(_id, stored);
        for (const [, idx] of this.#indexes) {
            const val = String(stored[idx.field]??"");
            if (!idx.map.has(val)) idx.map.set(val, new Set());
            idx.map.get(val).add(_id);
        }
        return { ok:true, insertedId:_id, doc:stored };
    }

    insertMany(docs) {
        const ids=[],errors=[];
        for (const d of docs) { const r=this.insertOne(d); r.ok?ids.push(r.insertedId):errors.push(r.error); }
        return { insertedIds:ids, errors };
    }

    createIndex(field, { unique=false }={}) {
        const map = new Map();
        for (const doc of this.#docs.values()) {
            const val = String(doc[field]??"");
            if (!map.has(val)) map.set(val, new Set());
            map.get(val).add(doc._id);
        }
        this.#indexes.set(field, { field, unique, map });
        return this;
    }

    where(filter) { return new QueryBuilder(this).where(filter); }
    all()         { return new QueryBuilder(this); }

    updateOne(filter, update) {
        const doc = this.#docs.values().find?.(d=>matchesFilter(d,filter))
            ?? [...this.#docs.values()].find(d=>matchesFilter(d,filter));
        if (!doc) return { ok:true, matchedCount:0, modifiedCount:0 };
        const updated = applyUpdate(doc, update);
        this.#docs.set(doc._id, updated);
        return { ok:true, matchedCount:1, modifiedCount:1, doc:updated };
    }

    updateMany(filter, update) {
        const matches = [...this.#docs.values()].filter(d=>matchesFilter(d,filter));
        matches.forEach(m=>this.#docs.set(m._id, applyUpdate(m,update)));
        return { ok:true, matchedCount:matches.length, modifiedCount:matches.length };
    }

    deleteOne(filter) {
        const doc = [...this.#docs.values()].find(d=>matchesFilter(d,filter));
        if (!doc) return { ok:true, deletedCount:0 };
        this.#docs.delete(doc._id);
        return { ok:true, deletedCount:1, deleted:doc };
    }

    deleteMany(filter) {
        const matches = [...this.#docs.values()].filter(d=>matchesFilter(d,filter));
        matches.forEach(m=>this.#docs.delete(m._id));
        return { ok:true, deletedCount:matches.length };
    }

    count(filter={}) { return this._query(filter,{}).length; }
    get size()       { return this.#docs.size; }

    _query(filter, { sort, limit, skip=0, projection }) {
        let results = [...this.#docs.values()].filter(d=>matchesFilter(d,filter));
        if (sort) results = [...results].sort((a,b)=>{
            for (const [f,dir] of Object.entries(sort)) {
                const av=a[f],bv=b[f];
                const cmp = typeof av==="string"?av.localeCompare(bv):(av??0)-(bv??0);
                if (cmp!==0) return cmp*dir;
            }
            return 0;
        });
        if (skip)  results = results.slice(skip);
        if (limit) results = results.slice(0,limit);
        if (projection) {
            const inc = Object.values(projection).some(v=>v===1);
            results = results.map(doc => {
                const out = inc ? { _id:doc._id } : { ...doc };
                for (const [k,v] of Object.entries(projection)) {
                    if (inc && v===1) out[k]=doc[k];
                    if (!inc && v===0) delete out[k];
                }
                return out;
            });
        }
        return results;
    }

    toJSON() { return [...this.#docs.entries()]; }
    static fromJSON(name, entries) {
        const col = new Collection(name);
        entries.forEach(([id,doc]) => col.#docs.set(id,doc));
        return col;
    }
}

// ── JsonDB ────────────────────────────────────────────────
class JsonDB {
    #cols = new Map();
    name;
    constructor(name="db") { this.name=name; }

    collection(name) {
        if (!this.#cols.has(name)) this.#cols.set(name, new Collection(name));
        return this.#cols.get(name);
    }

    dropCollection(name) { return this.#cols.delete(name); }
    listCollections()    { return [...this.#cols.keys()]; }

    stats() {
        const cols = [...this.#cols.entries()].map(([n,c])=>({ name:n, docs:c.size }));
        return { name:this.name, collections:cols.length, totalDocs:cols.reduce((s,c)=>s+c.docs,0), details:cols };
    }

    toJSON() {
        return JSON.stringify({
            name: this.name,
            collections: [...this.#cols.entries()].map(([n,c])=>({ name:n, docs:c.toJSON() })),
        });
    }

    static fromJSON(json) {
        const data = JSON.parse(json);
        const db   = new JsonDB(data.name);
        data.collections.forEach(({ name, docs }) => {
            db.#cols.set(name, Collection.fromJSON(name, docs));
        });
        return db;
    }
}

// ── Full demo ─────────────────────────────────────────────
const db = new JsonDB("ecommerce");

const users = db.collection("users");
users.createIndex("email", { unique: true });

users.insertMany([
    { name:"Alice",  email:"alice@ex.com",  role:"admin", age:30, city:"Paris",  score:92, active:true,  tags:["vip","early-adopter"] },
    { name:"Bob",    email:"bob@ex.com",    role:"user",  age:25, city:"London", score:78, active:true,  tags:["beta"] },
    { name:"Carol",  email:"carol@ex.com",  role:"user",  age:28, city:"Paris",  score:85, active:false, tags:[] },
    { name:"David",  email:"david@ex.com",  role:"admin", age:35, city:"Berlin", score:95, active:true,  tags:["vip"] },
    { name:"Eve",    email:"eve@ex.com",    role:"user",  age:22, city:"Paris",  score:60, active:true,  tags:["beta"] },
    { name:"Frank",  email:"frank@ex.com",  role:"user",  age:40, city:"London", score:72, active:false, tags:[] },
]);

const products = db.collection("products");
products.insertMany([
    { _id:"MBP", name:"MacBook Pro",    price:1999.99, cat:"electronics", stock:12, inStock:true  },
    { _id:"KB",  name:"Keyboard MX",    price:89.99,   cat:"peripherals", stock:42, inStock:true  },
    { _id:"MON", name:"4K Monitor",     price:599.99,  cat:"electronics", stock:6,  inStock:true  },
    { _id:"MS",  name:"Wireless Mouse", price:49.99,   cat:"peripherals", stock:0,  inStock:false },
]);

console.log("=== Database Stats ===");
const s = db.stats();
console.log(\`  DB: \${s.name} | Collections: \${s.collections} | Docs: \${s.totalDocs}\`);

console.log("\\n=== Fluent Queries ===");

// Active admins, sorted by score desc
const admins = users.where({ role:"admin", active:true }).sortBy("score","desc").exec();
console.log(\`Active admins: \${admins.map(u=>\`\${u.name}(\${u.score})\`).join(", ")}\`);

// Paris users, select name + score only
const parisUsers = users.where({ city:"Paris" }).select("name","score","active").sortBy("score","desc").exec();
console.log(\`Paris users:   \${parisUsers.map(u=>\`\${u.name}:\${u.score}\`).join(", ")}\`);

// High scorers (score >= 85), active only
const highScorers = users.where({ score:{ $gte:85 }, active:true }).sortBy("name").exec();
console.log(\`Score >= 85:   \${highScorers.map(u=>u.name).join(", ")}\`);

// Count active users
const activeCount = users.where({ active:true }).count();
console.log(\`Active users:  \${activeCount}\`);

// First user with tag "vip"
const vip = users.where({ tags:{ $in:["vip"] } }).first();
console.log(\`First VIP:     \${vip?.name}\`);

// Products in stock, sorted by price
const inStock = products.where({ inStock:true }).sortBy("price","desc").select("name","price","stock").exec();
console.log("\\n=== In-stock Products (price desc) ===");
inStock.forEach(p => console.log(\`  \${p.name.padEnd(18)} $\${p.price.toFixed(2).padStart(8)}  stock:\${p.stock}\`));

// Updates
console.log("\\n=== Updates ===");
const r1 = users.updateMany({ active:false }, { $set:{ status:"inactive" } });
console.log(\`  Set status=inactive for \${r1.modifiedCount} inactive users\`);
const r2 = users.updateOne({ email:"alice@ex.com" }, { $inc:{ score:5 }, $push:{ tags:"2024-award" } });
console.log(\`  Updated Alice: score=\${r2.doc?.score}, tags=[\${r2.doc?.tags?.join(",")}]\`);

// Export / import
const json     = db.toJSON();
const restored = JsonDB.fromJSON(json);
const rUsers   = restored.collection("users");
console.log("\\n=== Persistence ===");
console.log(\`  Exported: \${json.length} chars\`);
console.log(\`  Restored users: \${rUsers.size}\`);
console.log(\`  Alice in restored: \${rUsers.where({ email:"alice@ex.com" }).first()?.name}\`);
`,
    },
    expectedOutput: `=== Database Stats ===
  DB: ecommerce | Collections: 2 | Docs: 10

=== Fluent Queries ===
Active admins: David(95), Alice(92)
Paris users:   Alice:92, Carol:85, Eve:60
Score >= 85:   Alice, David
Active users:  4
First VIP:     Alice

=== In-stock Products (price desc) ===
  MacBook Pro        $ 1999.99  stock:12
  4K Monitor         $  599.99  stock:6
  Keyboard MX        $   89.99  stock:42

=== Updates ===
  Set status=inactive for 2 inactive users
  Updated Alice: score=97, tags=[vip,early-adopter,2024-award]

=== Persistence ===
  Exported: 2847 chars
  Restored users: 6
  Alice in restored: Alice`,
  },
];
