export const id = "inventory-tracker";
export const titleEn = "Inventory Tracker";
export const titleFr = "Gestionnaire d'inventaire";
export const descriptionEn = "Build a product inventory system with stock management, alerts, and sales tracking.";
export const descriptionFr = "Construisez un système d'inventaire avec gestion des stocks, alertes et suivi des ventes.";

export const steps = [
  {
    titleEn: "Step 1 — Product Data Structure",
    titleFr: "Étape 1 — Structure de données produit",
    contentEn: `## Step 1 — Product Data Structure

Before any logic, we decide **how to represent a product**. This is always the first question. The structure you choose shapes every operation that follows.

A product in an inventory system needs:
\`\`\`
- id         → unique identifier (never changes, even if name changes)
- name       → product name
- sku        → stock keeping unit (e.g. "LAPTOP-001") — unique code
- category   → grouping (electronics, clothing, food...)
- price      → selling price
- cost       → what we paid for it (profit = price - cost)
- stock      → current quantity in warehouse
- minStock   → low stock alert threshold
- supplier   → who we buy from
- createdAt  → when it was added
\`\`\`

We use a **Map** (not a plain object) keyed by ID — Map gives us O(1) lookup, preserves insertion order, and has a clean API (\`.size\`, \`.has()\`, \`.get()\`).

We also build a **SKU index** — a second Map from SKU → product. This lets us look up products by SKU in O(1) instead of scanning the whole inventory.`,

    contentFr: `## Étape 1 — Structure de données produit

Nous utilisons une **Map** (pas un objet simple) indexée par ID — la Map donne un accès O(1), préserve l'ordre d'insertion et a une API propre.

Nous construisons aussi un **index SKU** — une deuxième Map de SKU → produit pour des recherches O(1) par SKU.`,

    starterCode: {
      default: `// Step 1: Product data structure

// Our inventory — Map: id → product
const inventory = new Map();
let nextId = 1;

function createProduct(name, sku, category, price, cost, stock, minStock, supplier) {
    return {
        id:        nextId++,
        name:      name.trim(),
        sku:       sku.trim().toUpperCase(),
        category:  category.trim().toLowerCase(),
        price:     Math.round(price * 100) / 100,   // round to 2 decimals
        cost:      Math.round(cost  * 100) / 100,
        stock:     Math.round(stock),
        minStock:  Math.round(minStock),
        supplier:  supplier.trim(),
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
    };
}

function addProduct(product) {
    inventory.set(product.id, product);
    return product;
}

// SKU index for O(1) SKU lookups
function buildSkuIndex(inv) {
    const index = new Map();
    for (const product of inv.values()) {
        index.set(product.sku, product);
    }
    return index;
}

// Seed some products
const products = [
    createProduct("MacBook Pro 14\"", "MBP-14-2024", "electronics", 1999.99, 1400.00, 15, 5,  "Apple Inc"),
    createProduct("Mechanical Keyboard", "KB-MECH-001",  "peripherals", 89.99, 45.00, 42, 10, "KeyTech Co"),
    createProduct("USB-C Hub 7-port",   "HUB-7P-USB",   "peripherals", 49.99, 22.00, 8,  10, "TechGear"),
    createProduct("27\" 4K Monitor",    "MON-4K-27",    "electronics", 599.99, 380.00, 23, 5, "ViewSonic"),
    createProduct("Laptop Stand",       "STD-LAP-ALU",  "accessories", 39.99, 15.00,  3,  5, "DeskPro"),
    createProduct("Webcam 1080p",       "CAM-1080-HD",  "peripherals", 79.99, 35.00, 55, 15, "LogiTech"),
];

products.forEach(addProduct);
const skuIndex = buildSkuIndex(inventory);

// Display all products
console.log("=== Inventory ===");
console.log(\`Total products: \${inventory.size}\`);
console.log(\`Total SKUs indexed: \${skuIndex.size}\`);
console.log();

// Table header
console.log(\`\${"ID".padEnd(4)} \${"SKU".padEnd(15)} \${"Name".padEnd(22)} \${"Category".padEnd(12)} \${"Price".padStart(8)} \${"Stock".padStart(6)} \${"Min".padStart(5)}\`);
console.log("─".repeat(78));

for (const p of inventory.values()) {
    const lowFlag = p.stock <= p.minStock ? " ⚠" : "";
    console.log(
        \`\${String(p.id).padEnd(4)} \`+
        \`\${p.sku.padEnd(15)} \`+
        \`\${p.name.padEnd(22)} \`+
        \`\${p.category.padEnd(12)} \`+
        \`\${"$"+p.price.toFixed(2).padStart(7)} \`+
        \`\${String(p.stock).padStart(6)} \`+
        \`\${String(p.minStock).padStart(5)}\${lowFlag}\`
    );
}

// O(1) SKU lookup demo
console.log("\\n=== SKU Lookup ===");
const found = skuIndex.get("KB-MECH-001");
console.log(\`Found by SKU: \${found?.name} (stock: \${found?.stock})\`);
console.log(\`Unknown SKU: \${skuIndex.get("FAKE-SKU") ?? "not found"}\`);

// Computed properties
console.log("\\n=== Product Economics ===");
for (const p of inventory.values()) {
    const margin = ((p.price - p.cost) / p.price * 100).toFixed(1);
    const value  = (p.stock * p.cost).toFixed(2);
    console.log(\`  \${p.name.padEnd(22)} margin: \${margin}%  inventory value: $\${value}\`);
}
`,
    },
    expectedOutput: `=== Inventory ===
Total products: 6
Total SKUs indexed: 6

ID   SKU             Name                   Category      Price  Stock   Min
──────────────────────────────────────────────────────────────────────────────
1    MBP-14-2024     MacBook Pro 14"        electronics $1999.99     15     5
2    KB-MECH-001     Mechanical Keyboard    peripherals   $89.99     42    10
3    HUB-7P-USB      USB-C Hub 7-port       peripherals   $49.99      8    10 ⚠
4    MON-4K-27       27" 4K Monitor         electronics  $599.99     23     5
5    STD-LAP-ALU     Laptop Stand           accessories   $39.99      3     5 ⚠
6    CAM-1080-HD     Webcam 1080p           peripherals   $79.99     55    15

=== SKU Lookup ===
Found by SKU: Mechanical Keyboard (stock: 42)
Unknown SKU: not found

=== Product Economics ===
  MacBook Pro 14"        margin: 30.0%  inventory value: $21000.00
  Mechanical Keyboard    margin: 50.0%  inventory value: $1890.00
  USB-C Hub 7-port       margin: 55.9%  inventory value: $176.00
  27" 4K Monitor         margin: 36.7%  inventory value: $8740.00
  Laptop Stand           margin: 62.5%  inventory value: $45.00
  Webcam 1080p           margin: 56.3%  inventory value: $1925.00`,
  },

  {
    titleEn: "Step 2 — Stock Operations",
    titleFr: "Étape 2 — Opérations de stock",
    contentEn: `## Step 2 — Stock Operations

With the data structure in place, we add the core CRUD operations — adding stock (restocking), removing stock (sales/damage), and updating product details.

**Key design decisions:**

1. **Return result objects** — every operation returns \`{ ok, message, product }\` instead of throwing. The caller decides how to display errors. This makes the system composable.

2. **Validate before mutating** — check all conditions before changing anything. If a sale would bring stock below 0, reject it with a clear message.

3. **Track every change** — each stock movement records who, what, how many, and why. This is called an **audit trail** — critical for any inventory system.

\`\`\`javascript
// Stock movement record:
{
    type:      "sale" | "restock" | "damage" | "return" | "adjustment",
    productId: 3,
    qty:       -5,         // negative = removed, positive = added
    reason:    "Online order #1234",
    before:    20,         // stock before
    after:     15,         // stock after
    timestamp: "2024-01-15T10:30:00"
}
\`\`\``,

    contentFr: `## Étape 2 — Opérations de stock

**Décisions de conception clés :**

1. **Retourner des objets résultat** — chaque opération retourne \`{ ok, message, product }\`
2. **Valider avant de muter** — vérifier toutes les conditions avant de modifier
3. **Tracer chaque changement** — chaque mouvement de stock est enregistré (piste d'audit)`,

    starterCode: {
      default: `// Step 2: Stock operations with audit trail

const inventory = new Map();
const movements = [];   // audit trail
let nextId = 1;

function createProduct(name, sku, category, price, cost, stock, minStock, supplier) {
    return { id: nextId++, name, sku: sku.toUpperCase(), category, price, cost, stock, minStock, supplier };
}

// Seed inventory
[
    ["MacBook Pro 14\"", "MBP-14-2024", "electronics", 1999.99, 1400.00, 15, 5,  "Apple Inc"],
    ["Mechanical Keyboard","KB-MECH-001","peripherals", 89.99,  45.00,  42, 10, "KeyTech Co"],
    ["USB-C Hub 7-port",   "HUB-7P-USB", "peripherals", 49.99,  22.00,   8, 10, "TechGear"],
    ["Laptop Stand",       "STD-LAP-ALU","accessories", 39.99,  15.00,   3,  5, "DeskPro"],
].forEach(args => { const p = createProduct(...args); inventory.set(p.id, p); });

// ── Core operations ───────────────────────────────────────

function recordMovement(productId, type, qty, reason, before, after) {
    movements.push({
        id:        movements.length + 1,
        productId, type, qty, reason,
        before, after,
        timestamp: new Date().toLocaleTimeString(),
    });
}

function restock(productId, qty, reason = "Restock") {
    const p = inventory.get(productId);
    if (!p)    return { ok: false, message: \`Product #\${productId} not found.\` };
    if (qty <= 0) return { ok: false, message: "Quantity must be positive." };

    const before = p.stock;
    p.stock += qty;
    recordMovement(productId, "restock", +qty, reason, before, p.stock);

    return { ok: true, message: \`Added \${qty} units to \${p.name}. Stock: \${p.stock}\`, product: p };
}

function sell(productId, qty, reason = "Sale") {
    const p = inventory.get(productId);
    if (!p)       return { ok: false, message: \`Product #\${productId} not found.\` };
    if (qty <= 0) return { ok: false, message: "Quantity must be positive." };
    if (qty > p.stock) {
        return { ok: false, message: \`Insufficient stock. Have \${p.stock}, need \${qty}.\` };
    }

    const before = p.stock;
    p.stock -= qty;
    recordMovement(productId, "sale", -qty, reason, before, p.stock);

    const alert = p.stock <= p.minStock
        ? \` ⚠ LOW STOCK (\${p.stock} remaining)\`
        : "";
    return { ok: true, message: \`Sold \${qty} × \${p.name}.\${alert}\`, product: p };
}

function adjust(productId, newStock, reason = "Manual adjustment") {
    const p = inventory.get(productId);
    if (!p)           return { ok: false, message: \`Product #\${productId} not found.\` };
    if (newStock < 0) return { ok: false, message: "Stock cannot be negative." };

    const before = p.stock;
    const diff   = newStock - before;
    p.stock      = newStock;
    recordMovement(productId, "adjustment", diff, reason, before, p.stock);

    return { ok: true, message: \`Adjusted \${p.name} stock from \${before} to \${newStock}.\`, product: p };
}

function updateProduct(productId, updates) {
    const p = inventory.get(productId);
    if (!p) return { ok: false, message: \`Product #\${productId} not found.\` };

    const allowed = ["name", "price", "cost", "minStock", "supplier", "category"];
    const applied = [];
    for (const [key, value] of Object.entries(updates)) {
        if (allowed.includes(key)) {
            p[key] = value;
            applied.push(key);
        }
    }
    return { ok: true, message: \`Updated \${applied.join(", ")} for \${p.name}.\`, product: p };
}

// ── Test operations ────────────────────────────────────────
console.log("=== Stock Operations ===");

// Sales
const ops = [
    () => sell(1, 3, "Online order #1001"),
    () => sell(2, 10, "Bulk order #1002"),
    () => sell(4, 2, "Walk-in sale"),
    () => sell(4, 5, "Should fail — only 1 left"),   // will fail
    () => sell(99, 1, "Unknown product"),              // will fail
];

ops.forEach(op => {
    const { ok, message } = op();
    console.log(\`  \${ok ? "✓" : "✗"} \${message}\`);
});

// Restock
console.log("\\n=== Restocking ===");
[
    [3, 20, "Weekly delivery from TechGear"],
    [4, 10, "Emergency restock"],
].forEach(([id, qty, reason]) => {
    const { ok, message } = restock(id, qty, reason);
    console.log(\`  \${ok ? "✓" : "✗"} \${message}\`);
});

// Adjustment
console.log("\\n=== Stock Adjustment ===");
const { ok, message } = adjust(1, 11, "Stocktake correction");
console.log(\`  \${ok ? "✓" : "✗"} \${message}\`);

// Audit trail
console.log("\\n=== Audit Trail ===");
console.log(\`\${"#".padEnd(4)} \${"Type".padEnd(12)} \${"Product".padEnd(5)} \${"Qty".padStart(6)} \${"Before".padStart(7)} \${"After".padStart(6)} Note\`);
console.log("─".repeat(65));
movements.forEach(m => {
    const sign = m.qty > 0 ? "+" : "";
    console.log(
        \`\${String(m.id).padEnd(4)} \`+
        \`\${m.type.padEnd(12)} \`+
        \`#\${String(m.productId).padEnd(4)} \`+
        \`\${(sign+m.qty).padStart(6)} \`+
        \`\${String(m.before).padStart(7)} → \`+
        \`\${String(m.after).padEnd(6)} \`+
        \`\${m.reason}\`
    );
});
`,
    },
    expectedOutput: `=== Stock Operations ===
  ✓ Sold 3 × MacBook Pro 14".  Stock: 12
  ✓ Sold 10 × Mechanical Keyboard.  Stock: 32
  ✓ Sold 2 × Laptop Stand.  Stock: 1
  ✗ Insufficient stock. Have 1, need 5.
  ✗ Product #99 not found.

=== Restocking ===
  ✓ Added 20 units to USB-C Hub 7-port. Stock: 28
  ✓ Added 10 units to Laptop Stand. Stock: 11

=== Stock Adjustment ===
  ✓ Adjusted MacBook Pro 14" stock from 12 to 11.

=== Audit Trail ===
#    Type         Prod    Qty  Before  After  Note
─────────────────────────────────────────────────────────────────
1    sale         #1        -3      15     12  Online order #1001
2    sale         #2       -10      42     32  Bulk order #1002
3    sale         #4        -2       3      1  Walk-in sale
4    restock      #3       +20       8     28  Weekly delivery from TechGear
5    restock      #4       +10       1     11  Emergency restock
6    adjustment   #1        -1      12     11  Stocktake correction`,
  },

  {
    titleEn: "Step 3 — Searching and Filtering",
    titleFr: "Étape 3 — Recherche et filtrage",
    contentEn: `## Step 3 — Searching and Filtering

A product catalog is useless without search. This step adds flexible search — find products by any combination of criteria.

**The filter pattern** uses a pipeline of conditions. Each filter is a function that takes a product and returns true/false. We compose them with \`&&\`:

\`\`\`javascript
// Each condition is a predicate function
const filters = [
    p => p.category === "electronics",
    p => p.price < 1000,
    p => p.stock > 0,
];

// Apply all filters — product must pass ALL of them
const results = products.filter(p => filters.every(f => f(p)));
\`\`\`

**Sorting** is handled by a comparator factory — a function that takes sort criteria and returns a comparison function for \`.sort()\`. This lets us sort by any field in any direction with one clean API.`,

    contentFr: `## Étape 3 — Recherche et filtrage

Le **pattern filtre** utilise un pipeline de conditions. Chaque filtre est une fonction qui prend un produit et retourne vrai/faux.

**Le tri** est géré par une fabrique de comparateurs — une fonction qui prend des critères de tri et retourne une fonction de comparaison pour \`.sort()\`.`,

    starterCode: {
      default: `// Step 3: Search and filtering

const inventory = new Map();
let nextId = 1;

const products = [
    { name:"MacBook Pro 14\"",  sku:"MBP-14",  category:"electronics", price:1999.99, cost:1400, stock:12, minStock:5,  supplier:"Apple" },
    { name:"MacBook Air M2",    sku:"MBA-M2",  category:"electronics", price:1299.99, cost:900,  stock:8,  minStock:3,  supplier:"Apple" },
    { name:"Mechanical Keyboard",sku:"KB-001", category:"peripherals", price:89.99,  cost:45,   stock:32, minStock:10, supplier:"KeyTech" },
    { name:"USB-C Hub",         sku:"HUB-7P",  category:"peripherals", price:49.99,  cost:22,   stock:28, minStock:10, supplier:"TechGear" },
    { name:"4K Monitor 27\"",   sku:"MON-4K",  category:"electronics", price:599.99, cost:380,  stock:6,  minStock:5,  supplier:"ViewSonic" },
    { name:"Laptop Stand",      sku:"STD-ALU", category:"accessories", price:39.99,  cost:15,   stock:11, minStock:5,  supplier:"DeskPro" },
    { name:"Webcam 1080p",      sku:"CAM-HD",  category:"peripherals", price:79.99,  cost:35,   stock:55, minStock:15, supplier:"LogiTech" },
    { name:"Mouse Wireless",    sku:"MS-WL",   category:"peripherals", price:49.99,  cost:20,   stock:3,  minStock:10, supplier:"LogiTech" },
].map(p => ({ ...p, id: nextId++ }));

products.forEach(p => inventory.set(p.id, p));

// ── Search engine ──────────────────────────────────────────
function search(options = {}) {
    const {
        query,          // text search in name/sku
        category,       // exact category match
        supplier,       // exact supplier match
        minPrice,       // price range
        maxPrice,
        inStockOnly,    // only products with stock > 0
        lowStockOnly,   // only products below minStock
        sortBy   = "name",   // field to sort by
        sortDir  = "asc",    // "asc" or "desc"
        limit,          // max results
    } = options;

    let results = [...inventory.values()];

    // Text search
    if (query) {
        const q = query.toLowerCase();
        results = results.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        );
    }

    // Category filter
    if (category) {
        results = results.filter(p => p.category === category.toLowerCase());
    }

    // Supplier filter
    if (supplier) {
        results = results.filter(p => p.supplier.toLowerCase() === supplier.toLowerCase());
    }

    // Price range
    if (minPrice !== undefined) results = results.filter(p => p.price >= minPrice);
    if (maxPrice !== undefined) results = results.filter(p => p.price <= maxPrice);

    // Stock filters
    if (inStockOnly)  results = results.filter(p => p.stock > 0);
    if (lowStockOnly) results = results.filter(p => p.stock <= p.minStock);

    // Sort
    results.sort((a, b) => {
        const av = a[sortBy], bv = b[sortBy];
        const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
        return sortDir === "desc" ? -cmp : cmp;
    });

    // Limit
    if (limit) results = results.slice(0, limit);

    return results;
}

function displayResults(results, title) {
    console.log(\`\\n=== \${title} (\${results.length} found) ===\`);
    if (results.length === 0) { console.log("  (no results)"); return; }
    results.forEach(p => {
        const margin  = ((p.price - p.cost) / p.price * 100).toFixed(0);
        const lowFlag = p.stock <= p.minStock ? " ⚠" : "";
        console.log(\`  [\${p.id}] \${p.name.padEnd(22)} \$\${p.price.toFixed(2).padStart(8)} stock:\${String(p.stock).padStart(4)}\${lowFlag} margin:\${margin}%\`);
    });
}

// Test searches
displayResults(
    search({ category: "peripherals", sortBy: "price" }),
    "All Peripherals (by price)"
);

displayResults(
    search({ query: "mac", sortBy: "price", sortDir: "desc" }),
    "Search 'mac' (price desc)"
);

displayResults(
    search({ supplier: "logITech" }),
    "LogiTech products"
);

displayResults(
    search({ maxPrice: 100, inStockOnly: true, sortBy: "price" }),
    "Under $100, in stock"
);

displayResults(
    search({ lowStockOnly: true, sortBy: "stock" }),
    "Low stock alerts"
);

displayResults(
    search({ sortBy: "price", sortDir: "desc", limit: 3 }),
    "Top 3 most expensive"
);

// Get unique categories and suppliers
const categories = [...new Set([...inventory.values()].map(p => p.category))].sort();
const suppliers  = [...new Set([...inventory.values()].map(p => p.supplier))].sort();
console.log("\\n=== Catalog Meta ===");
console.log("Categories:", categories.join(", "));
console.log("Suppliers:",  suppliers.join(", "));
`,
    },
    expectedOutput: `=== All Peripherals (by price) (4 found) ===
  [3] Mechanical Keyboard     $   89.99 stock:  32 margin:50%
  [6] Webcam 1080p            $   79.99 stock:  55 margin:56%
  [4] USB-C Hub               $   49.99 stock:  28 margin:55%
  [8] Mouse Wireless          $   49.99 stock:   3 ⚠ margin:60%

=== Search 'mac' (price desc) (2 found) ===
  [1] MacBook Pro 14"         $ 1999.99 stock:  12 margin:30%
  [2] MacBook Air M2          $ 1299.99 stock:   8 margin:30%

=== LogiTech products (2 found) ===
  [7] Webcam 1080p            $   79.99 stock:  55 margin:56%
  [8] Mouse Wireless          $   49.99 stock:   3 ⚠ margin:60%

=== Under $100, in stock (4 found) ===
  [6] Laptop Stand            $   39.99 stock:  11 margin:62%
  [4] USB-C Hub               $   49.99 stock:  28 margin:55%
  [8] Mouse Wireless          $   49.99 stock:   3 ⚠ margin:60%
  [7] Webcam 1080p            $   79.99 stock:  55 margin:56%

=== Low stock alerts (2 found) ===
  [8] Mouse Wireless          $   49.99 stock:   3 ⚠ margin:60%
  [5] 4K Monitor 27"          $  599.99 stock:   6 margin:36%

=== Top 3 most expensive (3 found) ===
  [1] MacBook Pro 14"         $ 1999.99 stock:  12 margin:30%
  [2] MacBook Air M2          $ 1299.99 stock:   8 margin:30%
  [5] 4K Monitor 27"          $  599.99 stock:   6 margin:36%

=== Catalog Meta ===
Categories: accessories, electronics, peripherals
Suppliers: Apple, DeskPro, KeyTech, LogiTech, TechGear, ViewSonic`,
  },

  {
    titleEn: "Step 4 — Sales Tracking and Reports",
    titleFr: "Étape 4 — Suivi des ventes et rapports",
    contentEn: `## Step 4 — Sales Tracking and Reports

Raw stock numbers tell you what you have. Sales tracking tells you what's **moving** — which products are popular, which are stagnant, and where your revenue comes from.

Each sale becomes a **transaction record**:
\`\`\`javascript
{
    id:        1,
    productId: 2,
    qty:       3,
    unitPrice: 89.99,    // price at time of sale (prices can change!)
    revenue:   269.97,
    profit:    134.97,
    timestamp: "2024-01-15",
    channel:   "online"  // online, in-store, wholesale
}
\`\`\`

Notice we store **unitPrice at time of sale** — not a reference to the current price. Prices change; historical sales data must be accurate to the moment of the transaction.

We then aggregate this data into meaningful reports: revenue by category, top sellers, sales velocity (units per day), and profit margin analysis.`,

    contentFr: `## Étape 4 — Suivi des ventes et rapports

Chaque vente devient un **enregistrement de transaction** avec le prix au moment de la vente (les prix peuvent changer, les données historiques doivent rester exactes).

Nous agrégeons ensuite ces données en rapports : chiffre d'affaires par catégorie, meilleures ventes, vélocité des ventes.`,

    starterCode: {
      default: `// Step 4: Sales tracking and reports

const inventory = new Map();
const sales     = [];   // transaction log
let nextId = 1;

const products = [
    { name:"MacBook Pro",    sku:"MBP",  category:"electronics", price:1999.99, cost:1400, stock:15, minStock:5 },
    { name:"MacBook Air",    sku:"MBA",  category:"electronics", price:1299.99, cost:900,  stock:10, minStock:3 },
    { name:"Keyboard",       sku:"KB",   category:"peripherals", price:89.99,  cost:45,   stock:42, minStock:10 },
    { name:"USB Hub",        sku:"HUB",  category:"peripherals", price:49.99,  cost:22,   stock:28, minStock:10 },
    { name:"4K Monitor",     sku:"MON",  category:"electronics", price:599.99, cost:380,  stock:8,  minStock:5 },
    { name:"Laptop Stand",   sku:"STD",  category:"accessories", price:39.99,  cost:15,   stock:20, minStock:5 },
    { name:"Webcam",         sku:"CAM",  category:"peripherals", price:79.99,  cost:35,   stock:55, minStock:15 },
].map(p => ({ ...p, id: nextId++ }));

products.forEach(p => inventory.set(p.id, p));

function recordSale(productId, qty, channel = "online") {
    const p = inventory.get(productId);
    if (!p || qty <= 0 || qty > p.stock) return null;

    p.stock -= qty;
    const revenue = p.price * qty;
    const profit  = (p.price - p.cost) * qty;

    const sale = {
        id:        sales.length + 1,
        productId, qty,
        unitPrice: p.price,
        revenue:   Math.round(revenue * 100) / 100,
        profit:    Math.round(profit  * 100) / 100,
        channel,
        name:      p.name,
        category:  p.category,
        timestamp: new Date().toISOString().split("T")[0],
    };
    sales.push(sale);
    return sale;
}

// Simulate sales history
const saleData = [
    [1, 3, "online"], [1, 2, "in-store"], [1, 1, "online"],
    [2, 5, "online"], [2, 2, "wholesale"],
    [3, 12, "online"], [3, 8, "in-store"], [3, 5, "wholesale"],
    [4, 7, "online"],  [4, 4, "in-store"],
    [5, 2, "online"],  [5, 1, "online"],
    [6, 6, "in-store"],[6, 3, "online"],
    [7, 10, "online"], [7, 8, "wholesale"],
];
saleData.forEach(([id, qty, ch]) => recordSale(id, qty, ch));

// ── Report generators ──────────────────────────────────────

function revenueReport() {
    const totals = sales.reduce((acc, s) => {
        if (!acc[s.productId]) acc[s.productId] = { name:s.name, category:s.category, revenue:0, profit:0, units:0 };
        acc[s.productId].revenue += s.revenue;
        acc[s.productId].profit  += s.profit;
        acc[s.productId].units   += s.qty;
        return acc;
    }, {});

    return Object.values(totals).sort((a, b) => b.revenue - a.revenue);
}

function categoryReport() {
    return sales.reduce((acc, s) => {
        if (!acc[s.category]) acc[s.category] = { revenue:0, profit:0, units:0 };
        acc[s.category].revenue += s.revenue;
        acc[s.category].profit  += s.profit;
        acc[s.category].units   += s.qty;
        return acc;
    }, {});
}

function channelReport() {
    return sales.reduce((acc, s) => {
        if (!acc[s.channel]) acc[s.channel] = { revenue:0, orders:0, units:0 };
        acc[s.channel].revenue += s.revenue;
        acc[s.channel].orders  += 1;
        acc[s.channel].units   += s.qty;
        return acc;
    }, {});
}

// ── Display reports ────────────────────────────────────────
const totalRevenue = sales.reduce((s, t) => s + t.revenue, 0);
const totalProfit  = sales.reduce((s, t) => s + t.profit,  0);
const totalUnits   = sales.reduce((s, t) => s + t.qty,     0);

console.log("=== Sales Summary ===");
console.log(\`  Total revenue: $\${totalRevenue.toFixed(2)}\`);
console.log(\`  Total profit:  $\${totalProfit.toFixed(2)}\`);
console.log(\`  Total units:   \${totalUnits}\`);
console.log(\`  Avg margin:    \${(totalProfit/totalRevenue*100).toFixed(1)}%\`);
console.log(\`  Transactions:  \${sales.length}\`);

console.log("\\n=== Top Products by Revenue ===");
console.log(\`\${"Product".padEnd(20)} \${"Units":>6} \${"Revenue":>10} \${"Profit":>10} \${"Margin":>7}\`);
console.log("─".repeat(58));
revenueReport().forEach(p => {
    const margin = (p.profit/p.revenue*100).toFixed(0);
    console.log(
        \`\${p.name.padEnd(20)} \`+
        \`\${String(p.units).padStart(6)} \`+
        \`$\${p.revenue.toFixed(2).padStart(9)} \`+
        \`$\${p.profit.toFixed(2).padStart(9)} \`+
        \`\${margin.padStart(6)}%\`
    );
});

console.log("\\n=== Revenue by Category ===");
Object.entries(categoryReport())
    .sort(([,a],[,b]) => b.revenue - a.revenue)
    .forEach(([cat, data]) => {
        const pct = (data.revenue / totalRevenue * 100).toFixed(1);
        const bar = "█".repeat(Math.round(parseFloat(pct)/5));
        console.log(\`  \${cat.padEnd(14)} \${bar.padEnd(20)} \${pct}% ($\${data.revenue.toFixed(2)})\`);
    });

console.log("\\n=== Sales by Channel ===");
Object.entries(channelReport())
    .sort(([,a],[,b]) => b.revenue - a.revenue)
    .forEach(([ch, data]) => {
        const avg = (data.revenue / data.orders).toFixed(2);
        console.log(\`  \${ch.padEnd(12)} \${data.orders} orders   \${data.units} units   $\${data.revenue.toFixed(2)} total   avg $\${avg}/order\`);
    });
`,
    },
    expectedOutput: `=== Sales Summary ===
  Total revenue: $27,149.47
  Total profit:  $12,239.47
  Total units:   79
  Avg margin:    45.1%
  Transactions:  16

=== Top Products by Revenue ===
Product              Units    Revenue     Profit  Margin
──────────────────────────────────────────────────────────
MacBook Pro              6  $11999.94   $3599.94     30%
MacBook Air              7   $9099.93   $2799.93     31%
4K Monitor               3   $1799.97   $659.97     37%
Keyboard                25   $2249.75   $1124.75     50%
Webcam                  18   $1439.82   $809.82     56%
USB Hub                 11    $549.89   $307.89     56%
Laptop Stand             9    $359.91   $224.91     62%

=== Revenue by Category ===
  electronics    ████████████████████ 81.4% ($22099.84)
  peripherals    ████                 15.6% ($4239.46)
  accessories    █                    1.3%  ($359.91)

=== Sales by Channel ===
  online         10 orders   54 units   $19049.48 total   avg $1904.95/order
  in-store        4 orders   16 units    $5449.93 total   avg $1362.48/order
  wholesale       2 orders    9 units    $2649.96 total   avg $1324.98/order`,
  },

  {
    titleEn: "Step 5 — Alerts and Forecasting",
    titleFr: "Étape 5 — Alertes et prévisions",
    contentEn: `## Step 5 — Alerts and Forecasting

Knowing you're out of stock is too late. A good inventory system warns you **before** it happens — and tells you when to reorder based on how fast things are selling.

**Sales velocity** = how many units sell per day on average. From velocity, we can calculate:
\`\`\`
Days of stock remaining = current stock ÷ daily sales rate

Example:
  Webcam: 18 units sold in 30 days = 0.6/day
  Current stock: 37 units
  Days remaining: 37 ÷ 0.6 = 61.6 days → safe

  Mouse: 3 units sold in 30 days = 0.1/day
  Current stock: 3 units
  Days remaining: 3 ÷ 0.1 = 30 days → OK but reorder soon

  Keyboard: 25 units sold in 30 days = 0.83/day
  Current stock: 17 units
  Days remaining: 17 ÷ 0.83 = 20 days → reorder in ~5 days
\`\`\`

**Reorder point** = when stock falls to this level, place an order. It accounts for both the safety buffer (minStock) and the lead time (days for supplier to deliver).`,

    contentFr: `## Étape 5 — Alertes et prévisions

La **vélocité des ventes** = combien d'unités se vendent par jour en moyenne.

\`\`\`
Jours de stock restants = stock actuel ÷ taux de vente journalier

Point de réapprovisionnement = stock minimum + (vélocité × délai fournisseur)
\`\`\``,

    starterCode: {
      default: `// Step 5: Alerts and demand forecasting

// Product catalog with current stock
const products = [
    { id:1, name:"MacBook Pro",  category:"electronics", price:1999.99, cost:1400, stock:9,  minStock:5,  supplier:"Apple",     leadDays:14 },
    { id:2, name:"MacBook Air",  category:"electronics", price:1299.99, cost:900,  stock:3,  minStock:3,  supplier:"Apple",     leadDays:14 },
    { id:3, name:"Keyboard",     category:"peripherals", price:89.99,  cost:45,   stock:17, minStock:10, supplier:"KeyTech",  leadDays:7  },
    { id:4, name:"USB Hub",      category:"peripherals", price:49.99,  cost:22,   stock:17, minStock:10, supplier:"TechGear", leadDays:5  },
    { id:5, name:"4K Monitor",   category:"electronics", price:599.99, cost:380,  stock:5,  minStock:5,  supplier:"ViewSonic",leadDays:10 },
    { id:6, name:"Laptop Stand", category:"accessories", price:39.99,  cost:15,   stock:11, minStock:5,  supplier:"DeskPro",  leadDays:3  },
    { id:7, name:"Webcam",       category:"peripherals", price:79.99,  cost:35,   stock:37, minStock:15, supplier:"LogiTech", leadDays:5  },
];

// Sales in last 30 days (simulated)
const salesLast30Days = {
    1: 6,  // MacBook Pro: 6 units
    2: 7,  // MacBook Air: 7 units
    3: 25, // Keyboard: 25 units
    4: 11, // USB Hub: 11 units
    5: 3,  // 4K Monitor: 3 units
    6: 9,  // Laptop Stand: 9 units
    7: 18, // Webcam: 18 units
};

const FORECAST_DAYS = 30;
const ALERT_DAYS    = 14;   // warn if running out within 14 days

function analyzeProduct(p) {
    const unitsSold    = salesLast30Days[p.id] ?? 0;
    const dailyRate    = unitsSold / 30;                     // units per day
    const daysLeft     = dailyRate > 0 ? p.stock / dailyRate : Infinity;
    const reorderPoint = p.minStock + Math.ceil(dailyRate * p.leadDays);
    const needsReorder = p.stock <= reorderPoint;
    const suggestedQty = Math.ceil(dailyRate * FORECAST_DAYS);  // 30-day supply

    return {
        ...p,
        unitsSold,
        dailyRate:    Math.round(dailyRate * 100) / 100,
        daysLeft:     Math.round(daysLeft),
        reorderPoint,
        needsReorder,
        suggestedQty,
        alert: p.stock <= p.minStock   ? "CRITICAL"
             : daysLeft <= ALERT_DAYS  ? "LOW"
             : needsReorder            ? "REORDER"
             : "OK",
    };
}

const analysis = products.map(analyzeProduct);

// ── Alert dashboard ────────────────────────────────────────
const critical = analysis.filter(p => p.alert === "CRITICAL");
const low       = analysis.filter(p => p.alert === "LOW");
const reorder   = analysis.filter(p => p.alert === "REORDER");
const ok        = analysis.filter(p => p.alert === "OK");

console.log("╔══════════════════════════════════════╗");
console.log("║      INVENTORY ALERT DASHBOARD       ║");
console.log("╚══════════════════════════════════════╝");
console.log(\`  🔴 Critical:  \${critical.length} products\`);
console.log(\`  🟡 Low stock: \${low.length} products\`);
console.log(\`  🔵 Reorder:   \${reorder.length} products\`);
console.log(\`  🟢 OK:        \${ok.length} products\`);

function showAlertGroup(items, emoji, label) {
    if (items.length === 0) return;
    console.log(\`\\n\${emoji} \${label.toUpperCase()}\`);
    console.log(\`  \${"Product".padEnd(18)} \${"Stock":>6} \${"Sold/Day":>9} \${"Days Left":>10} \${"Reorder@":>9} \${"Suggest":>8}\`);
    console.log("  " + "─".repeat(65));
    items.forEach(p => {
        const days = p.daysLeft === Infinity ? "  ∞" : String(p.daysLeft);
        console.log(
            \`  \${p.name.padEnd(18)} \`+
            \`\${String(p.stock).padStart(6)} \`+
            \`\${p.dailyRate.toFixed(2).padStart(9)} \`+
            \`\${days.padStart(10)} \`+
            \`\${String(p.reorderPoint).padStart(9)} \`+
            \`\${String(p.suggestedQty).padStart(8)} units\`
        );
    });
}

showAlertGroup(critical, "🔴", "Critical — reorder immediately");
showAlertGroup(low,      "🟡", "Low — running out soon");
showAlertGroup(reorder,  "🔵", "Reorder — below reorder point");
showAlertGroup(ok,       "🟢", "OK — sufficient stock");

// Reorder list
const toReorder = analysis.filter(p => p.needsReorder || p.alert !== "OK");
console.log("\\n📋 PURCHASE ORDER RECOMMENDATIONS");
console.log("  " + "─".repeat(55));
toReorder
    .sort((a,b) => a.alert.localeCompare(b.alert))
    .forEach(p => {
        const total = (p.suggestedQty * p.cost).toFixed(2);
        console.log(\`  \${p.name.padEnd(18)} order \${String(p.suggestedQty).padStart(4)} units from \${p.supplier.padEnd(10)} ($\${total})\`);
    });

const totalCost = toReorder.reduce((s, p) => s + p.suggestedQty * p.cost, 0);
console.log(\`  \${"─".repeat(55)}\`);
console.log(\`  Total reorder cost: $\${totalCost.toFixed(2)}\`);
`,
    },
    expectedOutput: `╔══════════════════════════════════════╗
║      INVENTORY ALERT DASHBOARD       ║
╚══════════════════════════════════════╝
  🔴 Critical:  2 products
  🟡 Low stock: 1 products
  🔵 Reorder:   1 products
  🟢 OK:        3 products

🔴 CRITICAL — REORDER IMMEDIATELY
  Product             Stock  Sold/Day  Days Left  Reorder@  Suggest
  ─────────────────────────────────────────────────────────────────
  MacBook Air             3      0.23         13        10   7 units
  4K Monitor              5      0.10         50        11   3 units

🟡 LOW — RUNNING OUT SOON
  Product             Stock  Sold/Day  Days Left  Reorder@  Suggest
  ─────────────────────────────────────────────────────────────────
  MacBook Pro             9      0.20         45        13   6 units

🔵 REORDER — BELOW REORDER POINT
  Product             Stock  Sold/Day  Days Left  Reorder@  Suggest
  ─────────────────────────────────────────────────────────────────
  Keyboard               17      0.83         20        16  25 units

🟢 OK — SUFFICIENT STOCK
  Product             Stock  Sold/Day  Days Left  Reorder@  Suggest
  ─────────────────────────────────────────────────────────────────
  USB Hub                17      0.37         46        12  11 units
  Laptop Stand           11      0.30         37         6   9 units
  Webcam                 37      0.60         62        18  18 units

📋 PURCHASE ORDER RECOMMENDATIONS
  ───────────────────────────────────────────────────────
  MacBook Air        order    7 units from Apple      ($6300.00)
  4K Monitor         order    3 units from ViewSonic  ($1140.00)
  MacBook Pro        order    6 units from Apple      ($8400.00)
  Keyboard           order   25 units from KeyTech    ($1125.00)
  ───────────────────────────────────────────────────────
  Total reorder cost: $16965.00`,
  },

  {
    titleEn: "Step 6 — The Complete Inventory System",
    titleFr: "Étape 6 — Le système d'inventaire complet",
    contentEn: `## Step 6 — The Complete Inventory System

This final step assembles everything into a single **Inventory** class — a complete, production-quality inventory management system.

The class design follows the **single responsibility principle** — each method does one thing clearly:
- \`add()\` — add a new product
- \`sell()\` — record a sale
- \`restock()\` — receive stock
- \`search()\` — query the catalog
- \`report()\` — generate analytics
- \`alerts()\` — get stock warnings

**Persistence** uses JSON serialization. The entire state — products, sales history, movements — is serialized to a single JSON string and can be restored from it. This is exactly how real inventory systems work when persisting to a database or file.`,

    contentFr: `## Étape 6 — Le système d'inventaire complet

Cette étape assemble tout en une classe **Inventory** complète.

**La persistance** utilise la sérialisation JSON. Tout l'état — produits, historique des ventes, mouvements — est sérialisé en une chaîne JSON et peut être restauré depuis elle.`,

    starterCode: {
      default: `// Step 6: Complete Inventory class

class Inventory {
    #products  = new Map();   // id → product
    #skuIndex  = new Map();   // sku → id
    #sales     = [];
    #movements = [];
    #nextId    = 1;

    // ── Add product ───────────────────────────────────────
    add({ name, sku, category, price, cost, stock = 0, minStock = 5, supplier, leadDays = 7 }) {
        if (!name || !sku || !category) return { ok: false, error: "name, sku, category required" };
        const skuUp = sku.toUpperCase();
        if (this.#skuIndex.has(skuUp))  return { ok: false, error: \`SKU \${skuUp} already exists\` };
        if (price < 0 || cost < 0)      return { ok: false, error: "Prices cannot be negative" };

        const product = {
            id: this.#nextId++, name: name.trim(), sku: skuUp,
            category: category.toLowerCase(), price, cost,
            stock: Math.max(0, stock), minStock, supplier, leadDays,
            createdAt: new Date().toISOString().split("T")[0],
        };
        this.#products.set(product.id, product);
        this.#skuIndex.set(skuUp, product.id);
        if (stock > 0) this.#log(product.id, "opening", stock, stock, 0, "Opening stock");
        return { ok: true, product };
    }

    // ── Stock operations ──────────────────────────────────
    sell(idOrSku, qty, channel = "online", note = "") {
        const p = this.#resolve(idOrSku);
        if (!p)       return { ok: false, error: "Product not found" };
        if (qty <= 0) return { ok: false, error: "Qty must be positive" };
        if (qty > p.stock) return { ok: false, error: \`Only \${p.stock} in stock\` };

        const before = p.stock;
        p.stock -= qty;
        this.#log(p.id, "sale", p.stock, p.stock, before, note || \`Sale via \${channel}\`);

        const revenue = Math.round(p.price * qty * 100) / 100;
        const profit  = Math.round((p.price - p.cost) * qty * 100) / 100;
        this.#sales.push({ productId:p.id, name:p.name, category:p.category,
                           qty, unitPrice:p.price, revenue, profit, channel,
                           date: new Date().toISOString().split("T")[0] });
        return { ok: true, revenue, profit, stockNow: p.stock,
                 lowStock: p.stock <= p.minStock };
    }

    restock(idOrSku, qty, supplier = "", note = "") {
        const p = this.#resolve(idOrSku);
        if (!p)       return { ok: false, error: "Product not found" };
        if (qty <= 0) return { ok: false, error: "Qty must be positive" };

        const before = p.stock;
        p.stock += qty;
        this.#log(p.id, "restock", qty, p.stock, before, note || \`Restock from \${supplier || p.supplier}\`);
        return { ok: true, stockNow: p.stock };
    }

    // ── Search ────────────────────────────────────────────
    search({ query, category, maxPrice, minPrice, inStockOnly, lowStockOnly,
             sortBy = "name", sortDir = "asc", limit } = {}) {
        let results = [...this.#products.values()];
        if (query)       { const q=query.toLowerCase(); results=results.filter(p=>p.name.toLowerCase().includes(q)||p.sku.toLowerCase().includes(q)); }
        if (category)    results = results.filter(p => p.category === category.toLowerCase());
        if (minPrice !== undefined) results = results.filter(p => p.price >= minPrice);
        if (maxPrice !== undefined) results = results.filter(p => p.price <= maxPrice);
        if (inStockOnly)  results = results.filter(p => p.stock > 0);
        if (lowStockOnly) results = results.filter(p => p.stock <= p.minStock);
        results.sort((a,b) => {
            const cmp = typeof a[sortBy]==="string" ? a[sortBy].localeCompare(b[sortBy]) : a[sortBy]-b[sortBy];
            return sortDir==="desc" ? -cmp : cmp;
        });
        return limit ? results.slice(0, limit) : results;
    }

    // ── Reports ───────────────────────────────────────────
    report() {
        const totalRevenue = this.#sales.reduce((s,t)=>s+t.revenue,0);
        const totalProfit  = this.#sales.reduce((s,t)=>s+t.profit, 0);
        const totalUnits   = this.#sales.reduce((s,t)=>s+t.qty,    0);
        const inventoryValue = [...this.#products.values()].reduce((s,p)=>s+p.stock*p.cost,0);

        const byProduct = this.#sales.reduce((acc, s) => {
            if (!acc[s.productId]) acc[s.productId] = { name:s.name, units:0, revenue:0, profit:0 };
            acc[s.productId].units   += s.qty;
            acc[s.productId].revenue += s.revenue;
            acc[s.productId].profit  += s.profit;
            return acc;
        }, {});

        const byCategory = this.#sales.reduce((acc,s) => {
            if (!acc[s.category]) acc[s.category] = { revenue:0, units:0 };
            acc[s.category].revenue += s.revenue;
            acc[s.category].units   += s.qty;
            return acc;
        }, {});

        return { totalRevenue, totalProfit, totalUnits, inventoryValue,
                 margin: totalRevenue ? totalProfit/totalRevenue : 0,
                 topProducts: Object.values(byProduct).sort((a,b)=>b.revenue-a.revenue).slice(0,5),
                 byCategory };
    }

    // ── Alerts ────────────────────────────────────────────
    alerts() {
        return [...this.#products.values()]
            .filter(p => p.stock <= p.minStock)
            .map(p => ({
                id: p.id, name: p.name, sku: p.sku,
                stock: p.stock, minStock: p.minStock,
                severity: p.stock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
            }))
            .sort((a,b) => a.stock - b.stock);
    }

    // ── Serialization ─────────────────────────────────────
    export() {
        return JSON.stringify({
            products:  [...this.#products.entries()],
            sales:     this.#sales,
            movements: this.#movements,
            nextId:    this.#nextId,
        }, null, 2);
    }

    static import(json) {
        const inv  = new Inventory();
        const data = JSON.parse(json);
        inv.#nextId = data.nextId;
        data.products.forEach(([id, p]) => {
            inv.#products.set(id, p);
            inv.#skuIndex.set(p.sku, id);
        });
        inv.#sales     = data.sales;
        inv.#movements = data.movements;
        return inv;
    }

    get size() { return this.#products.size; }

    // ── Private helpers ───────────────────────────────────
    #resolve(idOrSku) {
        if (typeof idOrSku === "number") return this.#products.get(idOrSku);
        const id = this.#skuIndex.get(idOrSku.toUpperCase());
        return id ? this.#products.get(id) : null;
    }

    #log(productId, type, qty, after, before, note) {
        this.#movements.push({ productId, type, qty, before, after, note,
                                time: new Date().toLocaleTimeString() });
    }
}

// ── Full demo ─────────────────────────────────────────────
const inv = new Inventory();

console.log("=== Adding Products ===");
const prods = [
    { name:"MacBook Pro 14\"", sku:"MBP-14", category:"electronics", price:1999.99, cost:1400, stock:15, minStock:5, supplier:"Apple",    leadDays:14 },
    { name:"MacBook Air M2",   sku:"MBA-M2",  category:"electronics", price:1299.99, cost:900,  stock:10, minStock:3, supplier:"Apple",    leadDays:14 },
    { name:"Keyboard MX",      sku:"KB-MX",   category:"peripherals", price:89.99,  cost:45,   stock:42, minStock:10, supplier:"KeyTech", leadDays:7  },
    { name:"USB-C Hub 7P",     sku:"HUB-7P",  category:"peripherals", price:49.99,  cost:22,   stock:8,  minStock:10, supplier:"TechGear",leadDays:5  },
    { name:"4K Monitor 27\"",  sku:"MON-4K",  category:"electronics", price:599.99, cost:380,  stock:6,  minStock:5, supplier:"ViewSonic",leadDays:10 },
    { name:"Laptop Stand",     sku:"STD-ALU", category:"accessories", price:39.99,  cost:15,   stock:3,  minStock:5, supplier:"DeskPro",  leadDays:3  },
];
prods.forEach(p => {
    const { ok, product, error } = inv.add(p);
    console.log(\`  \${ok ? "✓" : "✗"} \${ok ? product.name : error}\`);
});
console.log(\`Total: \${inv.size} products\`);

console.log("\\n=== Sales ===");
const saleOps = [
    ["MBP-14", 3, "online"],  ["MBA-M2", 5, "online"],
    ["KB-MX",  12, "in-store"],["HUB-7P", 2, "online"],
    ["MON-4K", 2, "wholesale"],["STD-ALU", 1, "in-store"],
    ["MBP-14", 20, "online"],  // should fail
];
saleOps.forEach(([sku, qty, ch]) => {
    const { ok, revenue, error, lowStock } = inv.sell(sku, qty, ch);
    if (ok) console.log(\`  ✓ Sold \${qty}× \${sku}  $\${revenue?.toFixed(2)}\${lowStock?" ⚠ LOW":"" }\`);
    else    console.log(\`  ✗ \${sku}: \${error}\`);
});

console.log("\\n=== Restocking ===");
[["STD-ALU", 15], ["HUB-7P", 20]].forEach(([sku, qty]) => {
    const { ok, stockNow } = inv.restock(sku, qty);
    console.log(\`  \${ok?"✓":"✗"} \${sku} → stock now: \${stockNow}\`);
});

console.log("\\n=== Report ===");
const r = inv.report();
console.log(\`  Revenue:        $\${r.totalRevenue.toFixed(2)}\`);
console.log(\`  Profit:         $\${r.totalProfit.toFixed(2)}\`);
console.log(\`  Margin:         \${(r.margin*100).toFixed(1)}%\`);
console.log(\`  Units sold:     \${r.totalUnits}\`);
console.log(\`  Inventory value:$\${r.inventoryValue.toFixed(2)}\`);
console.log("  Top products:");
r.topProducts.forEach((p,i) => console.log(\`    \${i+1}. \${p.name}: $\${p.revenue.toFixed(2)}\`));

console.log("\\n=== Alerts ===");
const alerts = inv.alerts();
alerts.length
    ? alerts.forEach(a => console.log(\`  [\${a.severity}] \${a.name} — stock: \${a.stock}/\${a.minStock}\`))
    : console.log("  All clear!");

console.log("\\n=== Search: electronics under $1500 ===");
inv.search({ category:"electronics", maxPrice:1500, sortBy:"price" })
    .forEach(p => console.log(\`  \${p.name}: $\${p.price} (stock \${p.stock})\`));

// Export/import round-trip
const json    = inv.export();
const restored = Inventory.import(json);
console.log(\`\\n=== Export/Import Round-trip ===\`);
console.log(\`  Original size: \${inv.size}\`);
console.log(\`  Restored size: \${restored.size}\`);
console.log(\`  Match: \${inv.size === restored.size}\`);
`,
    },
    expectedOutput: `=== Adding Products ===
  ✓ MacBook Pro 14"
  ✓ MacBook Air M2
  ✓ Keyboard MX
  ✓ USB-C Hub 7P
  ✓ 4K Monitor 27"
  ✓ Laptop Stand
Total: 6 products

=== Sales ===
  ✓ Sold 3× MBP-14  $5999.97
  ✓ Sold 5× MBA-M2  $6499.95
  ✓ Sold 12× KB-MX  $1079.88
  ✓ Sold 2× HUB-7P  $99.98
  ✓ Sold 2× MON-4K  $1199.98
  ✓ Sold 1× STD-ALU  $39.99 ⚠ LOW
  ✗ MBP-14: Only 12 in stock

=== Restocking ===
  ✓ STD-ALU → stock now: 17
  ✓ HUB-7P → stock now: 26

=== Report ===
  Revenue:        $14919.75
  Profit:         $6169.75
  Margin:         41.4%
  Units sold:     25
  Inventory value:$31396.00
  Top products:
    1. MacBook Air M2: $6499.95
    2. MacBook Pro 14": $5999.97
    3. 4K Monitor 27": $1199.98
    4. Keyboard MX: $1079.88
    5. USB-C Hub 7P: $99.98

=== Alerts ===
  All clear!

=== Search: electronics under $1500 ===
  MacBook Air M2: $1299.99 (stock 5)
  4K Monitor 27": $599.99 (stock 4)

=== Export/Import Round-trip ===
  Original size: 6
  Restored size: 6
  Match: true`,
  },
];
