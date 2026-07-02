export const id = "expense-tracker";
export const titleEn = "Expense Tracker";
export const titleFr = "Suivi des dépenses";
export const descriptionEn = "Track income and expenses with categories, budgets, recurring transactions and monthly reports.";
export const descriptionFr = "Suivez revenus et dépenses avec catégories, budgets, transactions récurrentes et rapports mensuels.";

export const steps = [
  {
    titleEn: "Step 1 — Transaction Data Structure",
    titleFr: "Étape 1 — Structure de données des transactions",
    contentEn: `## Step 1 — Transaction Data Structure

An expense tracker is fundamentally about **transactions** — any movement of money, either in (income) or out (expense). Before any logic, we design what a transaction looks like.

\`\`\`javascript
// A transaction captures everything needed for financial reporting
{
    id:          "tx-001",
    type:        "expense",       // "income" | "expense"
    amount:      49.99,           // always positive — type determines direction
    category:    "food",          // "food" | "transport" | "housing" | ...
    description: "Grocery run",
    date:        "2024-01-15",    // ISO date string
    tags:        ["weekly", "essential"],
    recurring:   null,            // null | "daily" | "weekly" | "monthly"
    paymentMethod: "credit",      // "cash" | "credit" | "debit" | "transfer"
    createdAt:   "2024-01-15T10:30:00Z",
}
\`\`\`

**Key decisions:**
1. **Amount is always positive** — the \`type\` field ("income" or "expense") determines direction. This makes math simpler: no negative numbers to track.
2. **Date is separate from createdAt** — you might record a transaction today that happened yesterday. \`date\` is the financial date; \`createdAt\` is when you entered it.
3. **Categories are strings not enums** — flexible, user-configurable.`,

    contentFr: `## Étape 1 — Structure de données des transactions

**Décisions clés :**
1. **Le montant est toujours positif** — le champ \`type\` détermine la direction
2. **La date est séparée de createdAt** — vous pouvez enregistrer aujourd'hui une transaction d'hier
3. **Les catégories sont des chaînes** — flexibles, configurables par l'utilisateur`,

    starterCode: {
      default: `// Step 1: Transaction data structure

function generateId(prefix = "tx") {
    return \`\${prefix}-\${Date.now().toString(36)}-\${Math.random().toString(36).slice(2,6)}\`;
}

// Default categories
const EXPENSE_CATEGORIES = ["housing","food","transport","utilities","healthcare",
    "entertainment","clothing","education","savings","other"];
const INCOME_CATEGORIES  = ["salary","freelance","investment","gift","refund","other"];

// Create a validated transaction
function createTransaction(data) {
    const {
        type, amount, category, description,
        date, tags = [], recurring = null,
        paymentMethod = "card",
    } = data;

    // Validation
    if (!["income","expense"].includes(type))
        throw new Error(\`type must be 'income' or 'expense', got: \${type}\`);
    if (typeof amount !== "number" || amount <= 0)
        throw new Error(\`amount must be a positive number, got: \${amount}\`);
    if (!category?.trim())
        throw new Error("category is required");
    if (!description?.trim())
        throw new Error("description is required");
    if (!date?.match(/^\\d{4}-\\d{2}-\\d{2}$/))
        throw new Error(\`date must be YYYY-MM-DD format, got: \${date}\`);
    if (recurring && !["daily","weekly","monthly","yearly"].includes(recurring))
        throw new Error(\`recurring must be daily/weekly/monthly/yearly, got: \${recurring}\`);

    return {
        id:            generateId(),
        type,
        amount:        Math.round(amount * 100) / 100,   // 2 decimal places
        category:      category.trim().toLowerCase(),
        description:   description.trim(),
        date,
        tags:          tags.map(t => t.trim().toLowerCase()),
        recurring,
        paymentMethod: paymentMethod.toLowerCase(),
        createdAt:     new Date().toISOString(),
    };
}

// The transaction store
const transactions = [];

function addTransaction(data) {
    try {
        const tx = createTransaction(data);
        transactions.push(tx);
        return { ok: true, tx };
    } catch (err) {
        return { ok: false, error: err.message };
    }
}

// Seed some transactions
const txData = [
    { type:"income",  amount:4500,   category:"salary",        description:"Monthly salary",         date:"2024-01-01", paymentMethod:"transfer" },
    { type:"income",  amount:850,    category:"freelance",     description:"Web design project",     date:"2024-01-10", tags:["client-a"] },
    { type:"expense", amount:1200,   category:"housing",       description:"Rent payment",           date:"2024-01-01", paymentMethod:"transfer", recurring:"monthly" },
    { type:"expense", amount:89.50,  category:"food",          description:"Weekly groceries",       date:"2024-01-08", tags:["essential"], recurring:"weekly" },
    { type:"expense", amount:49.99,  category:"entertainment", description:"Netflix + Spotify",      date:"2024-01-05", recurring:"monthly" },
    { type:"expense", amount:32.40,  category:"transport",     description:"Monthly metro pass",     date:"2024-01-03", recurring:"monthly" },
    { type:"expense", amount:156.20, category:"food",          description:"Restaurant — team dinner",date:"2024-01-12",tags:["social","work"] },
    { type:"expense", amount:299.99, category:"clothing",      description:"Winter jacket",          date:"2024-01-14" },
    { type:"expense", amount:45.00,  category:"healthcare",    description:"Doctor visit copay",     date:"2024-01-09" },
    { type:"income",  amount:120,    category:"refund",        description:"Insurance reimbursement",date:"2024-01-11" },
];

const results = txData.map(d => addTransaction(d));
console.log("=== Adding Transactions ===");
results.forEach(r =>
    console.log(\`  \${r.ok ? "✓" : "✗"} \${r.ok ? \`[\${r.tx.type.padEnd(7)}] \${r.tx.description}\` : r.error}\`)
);

// Validation tests
console.log("\\n=== Validation Tests ===");
const invalid = [
    { type:"purchase", amount:50, category:"food",    description:"Test", date:"2024-01-01" },
    { type:"expense",  amount:-10, category:"food",   description:"Test", date:"2024-01-01" },
    { type:"expense",  amount:50,  category:"",       description:"Test", date:"2024-01-01" },
    { type:"expense",  amount:50,  category:"food",   description:"",    date:"2024-01-01" },
    { type:"expense",  amount:50,  category:"food",   description:"Test",date:"01/15/2024" },
];
invalid.forEach(d => {
    const r = addTransaction(d);
    console.log(\`  \${r.ok ? "✓" : "✗"} \${r.error}\`);
});

// Display all valid transactions
console.log("\\n=== Transaction Ledger ===");
console.log(\`\${"Date".padEnd(12)} \${"Type".padEnd(8)} \${"Category".padEnd(14)} \${"Amount".padStart(9)} Description\`);
console.log("─".repeat(68));
transactions.forEach(tx => {
    const sign = tx.type === "income" ? "+" : "-";
    const amt  = \`\${sign}$\${tx.amount.toFixed(2)}\`;
    console.log(
        \`\${tx.date.padEnd(12)} \`+
        \`\${tx.type.padEnd(8)} \`+
        \`\${tx.category.padEnd(14)} \`+
        \`\${amt.padStart(9)} \`+
        tx.description
    );
});

const income  = transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
const expense = transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
console.log(\`\\n  Total income:  $\${income.toFixed(2)}\`);
console.log(\`  Total expense: $\${expense.toFixed(2)}\`);
console.log(\`  Net balance:   $\${(income-expense).toFixed(2)}\`);
`,
    },
    expectedOutput: `=== Adding Transactions ===
  ✓ [income ] Monthly salary
  ✓ [income ] Web design project
  ✓ [expense] Rent payment
  ✓ [expense] Weekly groceries
  ✓ [expense] Netflix + Spotify
  ✓ [expense] Monthly metro pass
  ✓ [expense] Restaurant — team dinner
  ✓ [expense] Winter jacket
  ✓ [expense] Doctor visit copay
  ✓ [income ] Insurance reimbursement

=== Validation Tests ===
  ✗ type must be 'income' or 'expense', got: purchase
  ✗ amount must be a positive number, got: -10
  ✗ category is required
  ✗ description is required
  ✗ date must be YYYY-MM-DD format, got: 01/15/2024

=== Transaction Ledger ===
Date         Type     Category        Amount Description
────────────────────────────────────────────────────────────────────
2024-01-01   income   salary          +$4500.00 Monthly salary
2024-01-10   income   freelance        +$850.00 Web design project
2024-01-01   expense  housing         -$1200.00 Rent payment
2024-01-08   expense  food              -$89.50 Weekly groceries
2024-01-05   expense  entertainment     -$49.99 Netflix + Spotify
2024-01-03   expense  transport         -$32.40 Monthly metro pass
2024-01-12   expense  food             -$156.20 Restaurant — team dinner
2024-01-14   expense  clothing         -$299.99 Winter jacket
2024-01-09   expense  healthcare        -$45.00 Doctor visit copay
2024-01-11   income   refund           +$120.00 Insurance reimbursement

  Total income:  $5470.00
  Total expense: $1873.08
  Net balance:   $3596.92`,
  },

  {
    titleEn: "Step 2 — Balance and Cash Flow",
    titleFr: "Étape 2 — Solde et flux de trésorerie",
    contentEn: `## Step 2 — Balance and Cash Flow

With transactions stored, we compute the core financial metrics: **balance**, **cash flow**, and **running totals over time**.

**Balance** = total income − total expenses. Simple but foundational.

**Cash flow** shows how money moved over a period — did you earn more than you spent? This is the most important indicator of financial health.

**Running balance** is the balance at each point in time — essential for spotting when you went into deficit and understanding spending patterns:

\`\`\`
Date        Transaction        Amount    Running Balance
2024-01-01  Salary             +$4500    $4500.00
2024-01-01  Rent               -$1200    $3300.00
2024-01-03  Metro pass          -$32    $3268.00
2024-01-05  Streaming           -$50    $3218.00
...
\`\`\`

**Filtering by date range** is critical for period analysis — monthly reports, quarterly reviews, year-to-date totals. We compare ISO date strings directly (they sort lexicographically, which is chronologically correct for YYYY-MM-DD format).`,

    contentFr: `## Étape 2 — Solde et flux de trésorerie

**Le solde courant** montre l'évolution de l'argent dans le temps — essentiel pour repérer quand vous êtes passé en déficit.

Les chaînes de dates ISO se comparent directement par ordre lexicographique, ce qui est chronologiquement correct pour le format YYYY-MM-DD.`,

    starterCode: {
      default: `// Step 2: Balance and cash flow calculations

const transactions = [
    { id:"t1",  type:"income",  amount:4500,   category:"salary",        description:"Monthly salary",        date:"2024-01-01" },
    { id:"t2",  type:"income",  amount:850,    category:"freelance",     description:"Web design project",    date:"2024-01-10" },
    { id:"t3",  type:"expense", amount:1200,   category:"housing",       description:"Rent",                  date:"2024-01-01" },
    { id:"t4",  type:"expense", amount:89.50,  category:"food",          description:"Groceries",             date:"2024-01-08" },
    { id:"t5",  type:"expense", amount:49.99,  category:"entertainment", description:"Streaming",             date:"2024-01-05" },
    { id:"t6",  type:"expense", amount:32.40,  category:"transport",     description:"Metro pass",            date:"2024-01-03" },
    { id:"t7",  type:"expense", amount:156.20, category:"food",          description:"Restaurant",            date:"2024-01-12" },
    { id:"t8",  type:"expense", amount:299.99, category:"clothing",      description:"Winter jacket",         date:"2024-01-14" },
    { id:"t9",  type:"expense", amount:45.00,  category:"healthcare",    description:"Doctor copay",          date:"2024-01-09" },
    { id:"t10", type:"income",  amount:120,    category:"refund",        description:"Insurance refund",      date:"2024-01-11" },
    // February
    { id:"t11", type:"income",  amount:4500,   category:"salary",        description:"Monthly salary",        date:"2024-02-01" },
    { id:"t12", type:"expense", amount:1200,   category:"housing",       description:"Rent",                  date:"2024-02-01" },
    { id:"t13", type:"expense", amount:95.30,  category:"food",          description:"Groceries",             date:"2024-02-07" },
    { id:"t14", type:"expense", amount:49.99,  category:"entertainment", description:"Streaming",             date:"2024-02-05" },
    { id:"t15", type:"income",  amount:1200,   category:"freelance",     description:"Consulting project",    date:"2024-02-15" },
    { id:"t16", type:"expense", amount:380,    category:"education",     description:"Online course",         date:"2024-02-20" },
];

// ── Core calculations ─────────────────────────────────────
function filterByDateRange(txs, from, to) {
    // ISO date string comparison works lexicographically — perfect for YYYY-MM-DD
    return txs.filter(tx => (!from || tx.date >= from) && (!to || tx.date <= to));
}

function computeBalance(txs) {
    const income  = txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
    const expense = txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
    return {
        income:  Math.round(income  * 100) / 100,
        expense: Math.round(expense * 100) / 100,
        net:     Math.round((income - expense) * 100) / 100,
        txCount: txs.length,
        savingsRate: income > 0 ? Math.round((income-expense)/income*1000)/10 : 0,
    };
}

function runningBalance(txs) {
    // Sort by date, then process in order
    const sorted  = [...txs].sort((a,b) => a.date.localeCompare(b.date));
    let balance   = 0;
    return sorted.map(tx => {
        balance += tx.type === "income" ? tx.amount : -tx.amount;
        return { ...tx, balance: Math.round(balance * 100) / 100 };
    });
}

function cashFlowByMonth(txs) {
    const monthly = new Map();
    for (const tx of txs) {
        const month = tx.date.slice(0, 7);   // "2024-01"
        if (!monthly.has(month)) monthly.set(month, { income:0, expense:0 });
        const m = monthly.get(month);
        if (tx.type === "income")  m.income  += tx.amount;
        else                       m.expense += tx.amount;
    }
    return [...monthly.entries()]
        .sort(([a],[b]) => a.localeCompare(b))
        .map(([month, { income, expense }]) => ({
            month,
            income:  Math.round(income  * 100) / 100,
            expense: Math.round(expense * 100) / 100,
            net:     Math.round((income - expense) * 100) / 100,
            savingsRate: income > 0 ? Math.round((income-expense)/income*1000)/10 : 0,
        }));
}

// ── Display ───────────────────────────────────────────────
console.log("=== Overall Balance ===");
const overall = computeBalance(transactions);
console.log(\`  Total income:   $\${overall.income.toFixed(2)}\`);
console.log(\`  Total expense:  $\${overall.expense.toFixed(2)}\`);
console.log(\`  Net balance:    $\${overall.net.toFixed(2)}\`);
console.log(\`  Savings rate:   \${overall.savingsRate}%\`);

console.log("\\n=== January Balance ===");
const jan = computeBalance(filterByDateRange(transactions, "2024-01-01", "2024-01-31"));
console.log(\`  Income:    $\${jan.income.toFixed(2)}\`);
console.log(\`  Expense:   $\${jan.expense.toFixed(2)}\`);
console.log(\`  Net:       $\${jan.net.toFixed(2)}\`);
console.log(\`  Savings:   \${jan.savingsRate}%\`);

console.log("\\n=== February Balance ===");
const feb = computeBalance(filterByDateRange(transactions, "2024-02-01", "2024-02-29"));
console.log(\`  Income:    $\${feb.income.toFixed(2)}\`);
console.log(\`  Expense:   $\${feb.expense.toFixed(2)}\`);
console.log(\`  Net:       $\${feb.net.toFixed(2)}\`);
console.log(\`  Savings:   \${feb.savingsRate}%\`);

console.log("\\n=== Running Balance (January) ===");
const running = runningBalance(filterByDateRange(transactions,"2024-01-01","2024-01-31"));
console.log(\`\${"Date".padEnd(12)} \${"Type".padEnd(8)} \${"Amount".padStart(10)} \${"Balance".padStart(12)} Description\`);
console.log("─".repeat(66));
running.forEach(tx => {
    const sign = tx.type==="income" ? "+" : "-";
    const amt  = \`\${sign}$\${tx.amount.toFixed(2)}\`;
    const bal  = \`$\${tx.balance.toFixed(2)}\`;
    const balColor = tx.balance < 0 ? "(DEFICIT)" : "";
    console.log(
        \`\${tx.date.padEnd(12)}\`+
        \`\${tx.type.padEnd(8)}\`+
        \`\${amt.padStart(10)} \`+
        \`\${bal.padStart(12)} \`+
        \`\${tx.description} \${balColor}\`
    );
});

console.log("\\n=== Monthly Cash Flow ===");
console.log(\`\${"Month".padEnd(10)} \${"Income".padStart(10)} \${"Expense".padStart(10)} \${"Net".padStart(10)} \${"Savings".padStart(9)}\`);
console.log("─".repeat(52));
cashFlowByMonth(transactions).forEach(m => {
    const netStr = m.net >= 0 ? \`+$\${m.net.toFixed(2)}\` : \`-$\${Math.abs(m.net).toFixed(2)}\`;
    console.log(
        \`\${m.month.padEnd(10)}\`+
        \`$\${m.income.toFixed(2).padStart(9)} \`+
        \`$\${m.expense.toFixed(2).padStart(9)} \`+
        \`\${netStr.padStart(10)} \`+
        \`\${m.savingsRate.toFixed(1).padStart(8)}%\`
    );
});
`,
    },
    expectedOutput: `=== Overall Balance ===
  Total income:   $11170.00
  Total expense:  $3597.37
  Net balance:    $7572.63
  Savings rate:   67.8%

=== January Balance ===
  Income:    $5470.00
  Expense:   $1873.08
  Net:       $3596.92
  Savings:   65.8%

=== February Balance ===
  Income:    $5700.00
  Expense:   $1725.29
  Net:       $3974.71
  Savings:   69.7%

=== Running Balance (January) ===
Date         Type       Amount      Balance Description
──────────────────────────────────────────────────────────────────
2024-01-01   income    +$4500.00    $4500.00 Monthly salary
2024-01-01   expense   -$1200.00    $3300.00 Rent
2024-01-03   expense     -$32.40    $3267.60 Metro pass
2024-01-05   expense     -$49.99    $3217.61 Streaming
2024-01-08   expense     -$89.50    $3128.11 Groceries
2024-01-09   expense     -$45.00    $3083.11 Doctor copay
2024-01-10   income     +$850.00    $3933.11 Web design project
2024-01-11   income     +$120.00    $4053.11 Insurance refund
2024-01-12   expense    -$156.20    $3896.91 Restaurant
2024-01-14   expense    -$299.99    $3596.92 Winter jacket

=== Monthly Cash Flow ===
Month       Income   Expense       Net  Savings
────────────────────────────────────────────────────
2024-01  $5470.00  $1873.08  +$3596.92    65.8%
2024-02  $5700.00  $1725.29  +$3974.71    69.7%`,
  },

  {
    titleEn: "Step 3 — Category Analysis",
    titleFr: "Étape 3 — Analyse par catégorie",
    contentEn: `## Step 3 — Category Analysis

Balance tells you the bottom line. Category analysis tells you **where your money actually goes** — which is where the real insights live.

**Expense breakdown by category** answers: am I spending too much on food? How does my housing cost compare to my entertainment spending?

**Category trends** compare spending across periods — did my food spending increase from January to February?

**Top transactions per category** shows the biggest individual expenses — useful for finding unexpected large purchases.

We compute three representations:
1. **Absolute amounts** — the raw dollar figures
2. **Percentage of total** — what fraction of spending does each category represent?
3. **Per-day average** — normalizes across months of different lengths`,

    contentFr: `## Étape 3 — Analyse par catégorie

L'analyse par catégorie répond à : où va vraiment mon argent ?

Nous calculons trois représentations :
1. **Montants absolus** — les chiffres bruts
2. **Pourcentage du total** — quelle fraction des dépenses représente chaque catégorie ?
3. **Moyenne par jour** — normalise sur des mois de longueurs différentes`,

    starterCode: {
      default: `// Step 3: Category analysis

const transactions = [
    { id:"t1",  type:"income",  amount:4500,   category:"salary",        description:"Monthly salary",     date:"2024-01-01" },
    { id:"t2",  type:"income",  amount:850,    category:"freelance",     description:"Web design",         date:"2024-01-10" },
    { id:"t3",  type:"expense", amount:1200,   category:"housing",       description:"Rent",               date:"2024-01-01" },
    { id:"t4",  type:"expense", amount:89.50,  category:"food",          description:"Groceries",          date:"2024-01-08" },
    { id:"t5",  type:"expense", amount:49.99,  category:"entertainment", description:"Streaming",          date:"2024-01-05" },
    { id:"t6",  type:"expense", amount:32.40,  category:"transport",     description:"Metro pass",         date:"2024-01-03" },
    { id:"t7",  type:"expense", amount:156.20, category:"food",          description:"Restaurant",         date:"2024-01-12" },
    { id:"t8",  type:"expense", amount:299.99, category:"clothing",      description:"Winter jacket",      date:"2024-01-14" },
    { id:"t9",  type:"expense", amount:45.00,  category:"healthcare",    description:"Doctor",             date:"2024-01-09" },
    { id:"t10", type:"income",  amount:120,    category:"refund",        description:"Insurance",          date:"2024-01-11" },
    { id:"t11", type:"income",  amount:4500,   category:"salary",        description:"Monthly salary",     date:"2024-02-01" },
    { id:"t12", type:"expense", amount:1200,   category:"housing",       description:"Rent",               date:"2024-02-01" },
    { id:"t13", type:"expense", amount:95.30,  category:"food",          description:"Groceries",          date:"2024-02-07" },
    { id:"t14", type:"expense", amount:49.99,  category:"entertainment", description:"Streaming",          date:"2024-02-05" },
    { id:"t15", type:"income",  amount:1200,   category:"freelance",     description:"Consulting",         date:"2024-02-15" },
    { id:"t16", type:"expense", amount:380,    category:"education",     description:"Online course",      date:"2024-02-20" },
    { id:"t17", type:"expense", amount:67.80,  category:"food",          description:"Groceries",          date:"2024-02-14" },
    { id:"t18", type:"expense", amount:18.50,  category:"transport",     description:"Taxi",               date:"2024-02-08" },
    { id:"t19", type:"expense", amount:13.70,  category:"entertainment", description:"Cinema ticket",      date:"2024-02-22" },
];

// ── Category breakdown ────────────────────────────────────
function categoryBreakdown(txs, type = "expense") {
    const filtered = txs.filter(t => t.type === type);
    const total    = filtered.reduce((s, t) => s + t.amount, 0);

    const byCategory = filtered.reduce((acc, tx) => {
        if (!acc[tx.category]) acc[tx.category] = { amount:0, count:0, transactions:[] };
        acc[tx.category].amount += tx.amount;
        acc[tx.category].count  += 1;
        acc[tx.category].transactions.push(tx);
        return acc;
    }, {});

    return Object.entries(byCategory)
        .map(([category, data]) => ({
            category,
            amount:     Math.round(data.amount * 100) / 100,
            count:      data.count,
            percent:    total ? Math.round(data.amount/total*1000)/10 : 0,
            avgPerTx:   Math.round(data.amount/data.count*100)/100,
            topTx:      data.transactions.sort((a,b)=>b.amount-a.amount)[0],
        }))
        .sort((a, b) => b.amount - a.amount);
}

function categoryTrends(txs, type = "expense") {
    // Group by month × category
    const filtered = txs.filter(t => t.type === type);
    const months   = [...new Set(filtered.map(t => t.date.slice(0,7)))].sort();

    const byMonth = months.map(month => {
        const monthTxs = filtered.filter(t => t.date.startsWith(month));
        const byCat    = monthTxs.reduce((acc, tx) => {
            acc[tx.category] = (acc[tx.category]??0) + tx.amount;
            return acc;
        }, {});
        return { month, ...byCat };
    });

    const categories = [...new Set(filtered.map(t => t.category))].sort();
    return { months, categories, data: byMonth };
}

// ── Display ───────────────────────────────────────────────
console.log("=== Expense Breakdown (All Months) ===");
const allExpenses = categoryBreakdown(transactions, "expense");
const totalExp    = allExpenses.reduce((s,c)=>s+c.amount,0);

console.log(\`\${"Category".padEnd(15)} \${"Amount".padStart(10)} \${"Count".padStart(6)} \${"% Total".padStart(8)} \${"Avg/Tx".padStart(8)} Top Transaction\`);
console.log("─".repeat(72));
allExpenses.forEach(c => {
    const bar = "█".repeat(Math.round(c.percent / 5));
    console.log(
        \`\${c.category.padEnd(15)} \`+
        \`$\${c.amount.toFixed(2).padStart(9)} \`+
        \`\${String(c.count).padStart(6)} \`+
        \`\${(c.percent.toFixed(1)+"%").padStart(8)} \`+
        \`$\${c.avgPerTx.toFixed(2).padStart(7)} \`+
        \`"\${c.topTx.description}" ($\${c.topTx.amount})\`
    );
});
console.log(\`\${"TOTAL".padEnd(15)} $\${totalExp.toFixed(2).padStart(9)}\`);

// Category trends
const trends = categoryTrends(transactions);
console.log("\\n=== Category Trends (Monthly) ===");
const header = \`\${"Category".padEnd(15)} \${trends.months.map(m=>m.slice(5).padStart(9)).join("")}\`;
console.log(header);
console.log("─".repeat(header.length));

trends.categories.forEach(cat => {
    const row = trends.months.map(month => {
        const d = trends.data.find(d => d.month===month);
        return d?.[cat] ? \`$\${d[cat].toFixed(0)}\`.padStart(9) : "  —".padStart(9);
    }).join("");
    console.log(\`\${cat.padEnd(15)}\${row}\`);
});

// Biggest individual expenses
console.log("\\n=== Top 5 Individual Expenses ===");
transactions
    .filter(t=>t.type==="expense")
    .sort((a,b)=>b.amount-a.amount)
    .slice(0,5)
    .forEach((t,i) => console.log(\`  \${i+1}. $\${t.amount.toFixed(2).padStart(8)} — \${t.category.padEnd(14)} \${t.description} (\${t.date})\`));

// Income breakdown
console.log("\\n=== Income Sources ===");
categoryBreakdown(transactions, "income").forEach(c => {
    const bar = "█".repeat(Math.round(c.percent/10));
    console.log(\`  \${c.category.padEnd(12)} \${bar.padEnd(12)} $\${c.amount.toFixed(2)} (\${c.percent}%)\`);
});
`,
    },
    expectedOutput: `=== Expense Breakdown (All Months) ===
Category        Amount  Count  % Total  Avg/Tx Top Transaction
────────────────────────────────────────────────────────────────────────
housing        $2400.00      2   66.7%  $1200.00 "Rent" ($1200)
food            $408.00      4   11.3%   $102.00 "Restaurant" ($156.2)
entertainment   $113.68      3    3.2%    $37.89 "Streaming" ($49.99)
clothing        $299.99      1    8.3%   $299.99 "Winter jacket" ($299.99)
healthcare       $45.00      1    1.3%    $45.00 "Doctor" ($45)
education       $380.00      1   10.6%   $380.00 "Online course" ($380)
transport        $50.90      2    1.4%    $25.45 "Metro pass" ($32.4)
TOTAL          $3597.57

=== Category Trends (Monthly) ===
Category            Jan      Feb
────────────────────────────────────
housing           $1200    $1200
food               $246     $163
entertainment       $50      $64
clothing           $300       —
healthcare          $45       —
education            —      $380
transport           $32      $19

=== Top 5 Individual Expenses ===
  1.  $1200.00 — housing        Rent (2024-01-01)
  2.  $1200.00 — housing        Rent (2024-02-01)
  3.   $380.00 — education      Online course (2024-02-20)
  4.   $299.99 — clothing       Winter jacket (2024-01-14)
  5.   $156.20 — food           Restaurant (2024-01-12)

=== Income Sources ===
  salary       ████████████ $9000.00 (80.6%)
  freelance    ████         $2050.00 (18.4%)
  refund       █             $120.00 (1.1%)`,
  },

  {
    titleEn: "Step 4 — Budgets and Alerts",
    titleFr: "Étape 4 — Budgets et alertes",
    contentEn: `## Step 4 — Budgets and Alerts

Tracking what you spent is descriptive. **Budgets** make the tracker proactive — comparing actual spending against targets and warning you before you overspend.

A budget defines a **spending limit per category per period**:
\`\`\`javascript
const budgets = {
    food:          { monthly: 300 },
    entertainment: { monthly: 100 },
    clothing:      { monthly: 150 },
    transport:     { monthly: 80  },
}
\`\`\`

Budget status has three states:
\`\`\`
UNDER BUDGET:   spent < 80% of limit → 🟢 green
WARNING:        spent 80-100% of limit → 🟡 yellow (alert: approaching limit)
OVER BUDGET:    spent > 100% of limit → 🔴 red (alert: exceeded)
\`\`\`

The warning threshold (80%) is configurable — some people want warnings at 70%, others at 90%. We also compute **days remaining** in the month and **projected overspend** — if you keep spending at the current rate, how much will you overshoot the budget by month end?`,

    contentFr: `## Étape 4 — Budgets et alertes

Un budget définit une **limite de dépenses par catégorie par période**.

Trois états :
\`\`\`
SOUS BUDGET :  dépensé < 80% → 🟢
AVERTISSEMENT: 80-100% → 🟡
DÉPASSÉ :      > 100% → 🔴
\`\`\`

Nous calculons aussi les **jours restants** dans le mois et le **dépassement projeté**.`,

    starterCode: {
      default: `// Step 4: Budgets and alerts

const transactions = [
    { type:"expense", amount:1200,  category:"housing",       description:"Rent",           date:"2024-01-01" },
    { type:"expense", amount:89.50, category:"food",          description:"Groceries",      date:"2024-01-08" },
    { type:"expense", amount:49.99, category:"entertainment", description:"Streaming",      date:"2024-01-05" },
    { type:"expense", amount:32.40, category:"transport",     description:"Metro pass",     date:"2024-01-03" },
    { type:"expense", amount:156.20,category:"food",          description:"Restaurant",     date:"2024-01-12" },
    { type:"expense", amount:299.99,category:"clothing",      description:"Winter jacket",  date:"2024-01-14" },
    { type:"expense", amount:45.00, category:"healthcare",    description:"Doctor",         date:"2024-01-09" },
    { type:"expense", amount:65.00, category:"food",          description:"Meal prep delivery",date:"2024-01-20"},
    { type:"expense", amount:28.50, category:"entertainment", description:"Cinema",         date:"2024-01-18" },
    { type:"expense", amount:15.00, category:"transport",     description:"Taxi",           date:"2024-01-22" },
];

// Budget limits (monthly)
const BUDGETS = {
    housing:       { monthly: 1300, warningPct: 0.8 },
    food:          { monthly: 300,  warningPct: 0.8 },
    entertainment: { monthly: 80,   warningPct: 0.75 },
    clothing:      { monthly: 150,  warningPct: 0.8 },
    transport:     { monthly: 80,   warningPct: 0.8 },
    healthcare:    { monthly: 100,  warningPct: 0.8 },
};

function analyzeBudgets(txs, budgets, month, todayDay = 22) {
    const monthTxs = txs.filter(t => t.date.startsWith(month) && t.type === "expense");
    const daysInMonth = 31;   // January
    const daysRemaining = daysInMonth - todayDay;

    // Spending per category this month
    const spent = monthTxs.reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] ?? 0) + tx.amount;
        return acc;
    }, {});

    return Object.entries(budgets).map(([category, budget]) => {
        const spentAmt    = Math.round((spent[category] ?? 0) * 100) / 100;
        const limit       = budget.monthly;
        const pct         = spentAmt / limit;
        const remaining   = Math.max(0, limit - spentAmt);
        const dailyRate   = todayDay > 0 ? spentAmt / todayDay : 0;
        const projected   = dailyRate * daysInMonth;
        const projectedOver = Math.max(0, projected - limit);

        let status, emoji;
        if (pct > 1)               { status = "OVER";    emoji = "🔴"; }
        else if (pct >= budget.warningPct) { status = "WARNING"; emoji = "🟡"; }
        else                       { status = "OK";      emoji = "🟢"; }

        return {
            category, limit, spentAmt, pct,
            remaining, dailyRate, projected, projectedOver,
            status, emoji, daysRemaining,
        };
    }).sort((a, b) => b.pct - a.pct);   // worst first
};

// ── Display ───────────────────────────────────────────────
const analysis = analyzeBudgets(transactions, BUDGETS, "2024-01", 22);

console.log("╔══════════════════════════════════════════════╗");
console.log("║         BUDGET STATUS — January 2024         ║");
console.log("║              (Day 22 of 31)                   ║");
console.log("╚══════════════════════════════════════════════╝");

console.log(\`\n${"Category".padEnd(14)} ${"Budget".padStart(8)} ${"Spent".padStart(8)} ${"Left".padStart(8)} ${"Used%".padStart(7)} Status\`);
console.log("─".repeat(58));

analysis.forEach(b => {
    const bar    = "█".repeat(Math.min(20,Math.round(b.pct*20)));
    const empty  = "░".repeat(Math.max(0,20-bar.length));
    const pctStr = (b.pct*100).toFixed(0)+"%";
    console.log(
        \`\${b.emoji} \${b.category.padEnd(12)} \`+
        \`$\${b.limit.toFixed(0).padStart(7)} \`+
        \`$\${b.spentAmt.toFixed(2).padStart(7)} \`+
        \`$\${b.remaining.toFixed(2).padStart(7)} \`+
        \`\${pctStr.padStart(6)} \`+
        \`\${b.status}\`
    );
    console.log(\`  [\${bar}\${empty}]\`);
});

// Alerts
const alerts = analysis.filter(b => b.status !== "OK");
if (alerts.length) {
    console.log("\\n⚠️  BUDGET ALERTS");
    console.log("─".repeat(55));
    alerts.forEach(b => {
        if (b.status === "OVER") {
            const over = (b.spentAmt - b.limit).toFixed(2);
            console.log(\`  🔴 \${b.category.toUpperCase()}: OVER BUDGET by $\${over}\`);
            console.log(\`     Spent: $\${b.spentAmt} / Limit: $\${b.limit}\`);
        } else {
            const pctLeft = (100 - b.pct*100).toFixed(0);
            console.log(\`  🟡 \${b.category.toUpperCase()}: \${(b.pct*100).toFixed(0)}% used — only $\${b.remaining.toFixed(2)} left\`);
            if (b.projectedOver > 0) {
                console.log(\`     ⚡ Projected overspend at current rate: $\${b.projectedOver.toFixed(2)}\`);
            }
        }
    });
}

// Projection summary
console.log("\\n=== Month-End Projections ===");
console.log(\`  (Based on spending rate through day 22 of 31)\`);
analysis.forEach(b => {
    const projStr = b.projected > b.limit
        ? \`OVER by $\${b.projectedOver.toFixed(2)}\`
        : \`Under by $\${(b.limit-b.projected).toFixed(2)}\`;
    const flag = b.projected > b.limit ? "⚠" : "✓";
    console.log(\`  \${flag} \${b.category.padEnd(14)} projected: $\${b.projected.toFixed(2).padStart(7)} / $\${b.limit} → \${projStr}\`);
});

// Budget health score
const healthScore = analysis.reduce((sum, b) => {
    const score = b.status === "OK" ? 100 : b.status === "WARNING" ? 60 : 20;
    return sum + score / analysis.length;
}, 0);
console.log(\`\\n  Budget Health Score: \${healthScore.toFixed(0)}/100\`);
`,
    },
    expectedOutput: `╔══════════════════════════════════════════════╗
║         BUDGET STATUS — January 2024         ║
║              (Day 22 of 31)                   ║
╚══════════════════════════════════════════════╝

Category        Budget   Spent    Left   Used% Status
──────────────────────────────────────────────────────────
🔴 clothing       $150  $299.99    $0.00   200% OVER
  [████████████████████]
🔴 food           $300  $310.70    $0.00   104% OVER
  [████████████████████]
🟡 entertainment   $80   $78.49    $1.51    98% WARNING
  [███████████████████░]
🟢 transport       $80   $47.40   $32.60    59% OK
  [████████████░░░░░░░░]
🟢 housing       $1300 $1200.00  $100.00    92% OK
  [██████████████████░░]
🟢 healthcare     $100   $45.00   $55.00    45% OK
  [█████████░░░░░░░░░░░]

⚠️  BUDGET ALERTS
───────────────────────────────────────────────────────
  🔴 CLOTHING: OVER BUDGET by $149.99
     Spent: $299.99 / Limit: $150
  🔴 FOOD: OVER BUDGET by $10.70
     Spent: $310.70 / Limit: $300
  🟡 ENTERTAINMENT: 98% used — only $1.51 left
     ⚡ Projected overspend at current rate: $10.44

=== Month-End Projections ===
  (Based on spending rate through day 22 of 31)
  ⚠ clothing       projected:  $422.71 / $150 → OVER by $272.71
  ⚠ food           projected:  $437.76 / $300 → OVER by $137.76
  ⚠ entertainment  projected:  $110.53 / $80 → OVER by $30.53
  ✓ transport      projected:   $66.82 / $80 → Under by $13.18
  ✓ housing        projected: $1691.18 / $1300 → OVER by $391.18
  ✓ healthcare     projected:   $63.41 / $100 → Under by $36.59

  Budget Health Score: 47/100`,
  },

  {
    titleEn: "Step 5 — Recurring Transactions",
    titleFr: "Étape 5 — Transactions récurrentes",
    contentEn: `## Step 5 — Recurring Transactions and Forecasting

Most financial transactions are predictable — rent every month, salary every month, streaming subscriptions forever. **Recurring transactions** are templates that generate new transactions on a schedule.

\`\`\`javascript
// A recurring template
{
    id:          "rec-001",
    type:        "expense",
    amount:      1200,
    category:    "housing",
    description: "Monthly rent",
    frequency:   "monthly",    // "daily" | "weekly" | "monthly" | "yearly"
    startDate:   "2024-01-01",
    endDate:     null,         // null = infinite
    nextDue:     "2024-02-01", // when is the next occurrence?
    lastGenerated: "2024-01-01",
}
\`\`\`

**Forecasting** uses recurring transactions to project future cash flow:
\`\`\`
January actual:  +$3596.92
February projection:
  + Salary ($4500)           → recurring monthly
  + Freelance ($850)         → NOT recurring, excluded
  - Rent ($1200)             → recurring monthly
  - Streaming ($49.99)       → recurring monthly
  Projected net: $3250.01
\`\`\`

This is how budgeting apps like YNAB and Mint compute "upcoming transactions" — they expand recurring templates into a projected timeline.`,

    contentFr: `## Étape 5 — Transactions récurrentes et prévisions

Les **transactions récurrentes** sont des modèles qui génèrent de nouvelles transactions selon un calendrier.

Les **prévisions** utilisent les transactions récurrentes pour projeter les flux de trésorerie futurs.`,

    starterCode: {
      default: `// Step 5: Recurring transactions and forecasting

function generateId() { return Date.now().toString(36)+Math.random().toString(36).slice(2,5); }

// Recurring transaction templates
const recurringTemplates = [
    { id:"r1", type:"income",  amount:4500,   category:"salary",        description:"Monthly salary",    frequency:"monthly", startDate:"2024-01-01", endDate:null },
    { id:"r2", type:"expense", amount:1200,   category:"housing",       description:"Rent",              frequency:"monthly", startDate:"2024-01-01", endDate:null },
    { id:"r3", type:"expense", amount:49.99,  category:"entertainment", description:"Netflix + Spotify", frequency:"monthly", startDate:"2024-01-01", endDate:null },
    { id:"r4", type:"expense", amount:32.40,  category:"transport",     description:"Metro pass",        frequency:"monthly", startDate:"2024-01-01", endDate:null },
    { id:"r5", type:"expense", amount:89.50,  category:"food",          description:"Weekly groceries",  frequency:"weekly",  startDate:"2024-01-08", endDate:null },
    { id:"r6", type:"income",  amount:2500,   category:"freelance",     description:"Retainer client",   frequency:"monthly", startDate:"2024-01-15", endDate:"2024-06-15" },
];

// Calculate next occurrence date
function nextOccurrence(date, frequency) {
    const d = new Date(date);
    switch (frequency) {
        case "daily":   d.setDate(d.getDate() + 1);     break;
        case "weekly":  d.setDate(d.getDate() + 7);     break;
        case "monthly": d.setMonth(d.getMonth() + 1);   break;
        case "yearly":  d.setFullYear(d.getFullYear() + 1); break;
    }
    return d.toISOString().split("T")[0];
}

// Generate all occurrences of a recurring transaction within a date range
function generateOccurrences(template, fromDate, toDate) {
    const occurrences = [];
    let current = template.startDate;

    // Fast-forward to fromDate
    while (current < fromDate) {
        current = nextOccurrence(current, template.frequency);
    }

    // Generate occurrences within range
    while (current <= toDate) {
        // Check if within endDate (if set)
        if (template.endDate && current > template.endDate) break;

        occurrences.push({
            id:           \`\${template.id}-\${current}\`,
            recurringId:  template.id,
            type:         template.type,
            amount:       template.amount,
            category:     template.category,
            description:  template.description + " (recurring)",
            date:         current,
            isRecurring:  true,
        });
        current = nextOccurrence(current, template.frequency);
    }
    return occurrences;
}

// Forecast cash flow for a period
function forecastCashFlow(templates, fromDate, toDate) {
    const allOccurrences = templates.flatMap(t => generateOccurrences(t, fromDate, toDate));
    allOccurrences.sort((a, b) => a.date.localeCompare(b.date));

    const monthly = new Map();
    for (const tx of allOccurrences) {
        const month = tx.date.slice(0, 7);
        if (!monthly.has(month)) monthly.set(month, { income:0, expense:0, transactions:[] });
        const m = monthly.get(month);
        if (tx.type === "income")  m.income  += tx.amount;
        else                       m.expense += tx.amount;
        m.transactions.push(tx);
    }

    return {
        transactions: allOccurrences,
        byMonth: [...monthly.entries()].map(([month, data]) => ({
            month,
            income:  Math.round(data.income  * 100) / 100,
            expense: Math.round(data.expense * 100) / 100,
            net:     Math.round((data.income - data.expense) * 100) / 100,
            count:   data.transactions.length,
        })).sort((a,b)=>a.month.localeCompare(b.month)),
    };
}

// ── Display ───────────────────────────────────────────────
console.log("=== Recurring Templates ===");
recurringTemplates.forEach(t => {
    const end = t.endDate ? \`until \${t.endDate}\` : "ongoing";
    const sign = t.type === "income" ? "+" : "-";
    console.log(\`  \${sign}$\${t.amount.toFixed(2).padStart(7)} \${t.frequency.padEnd(8)} \${t.description.padEnd(25)} (\${end})\`);
});

// Forecast Jan-Jun 2024
const forecast = forecastCashFlow(recurringTemplates, "2024-01-01", "2024-06-30");

console.log("\\n=== 6-Month Forecast (Recurring Only) ===");
console.log(\`\${"Month".padEnd(10)} \${"Income".padStart(10)} \${"Expense".padStart(10)} \${"Net".padStart(10)} \${"Txns".padStart(6)}\`);
console.log("─".repeat(50));
let runningTotal = 0;
forecast.byMonth.forEach(m => {
    runningTotal += m.net;
    const netStr  = m.net >= 0 ? \`+$\${m.net.toFixed(2)}\` : \`-$\${Math.abs(m.net).toFixed(2)}\`;
    console.log(
        \`\${m.month.padEnd(10)}\`+
        \`$\${m.income.toFixed(2).padStart(9)} \`+
        \`$\${m.expense.toFixed(2).padStart(9)} \`+
        \`\${netStr.padStart(10)} \`+
        \`\${String(m.count).padStart(5)}\`
    );
});
console.log(\`\${"Running total".padEnd(30)} $\${runningTotal.toFixed(2)}\`);

// Show what's due in February
console.log("\\n=== February 2024 Upcoming Transactions ===");
const feb = forecast.transactions.filter(t => t.date.startsWith("2024-02"));
feb.forEach(t => {
    const sign = t.type === "income" ? "+" : "-";
    console.log(\`  \${t.date} \${sign}$\${t.amount.toFixed(2).padStart(8)} \${t.description}\`);
});

// Identify templates expiring soon
console.log("\\n=== Templates Expiring Before 2024-07-01 ===");
const expiringSoon = recurringTemplates
    .filter(t => t.endDate && t.endDate < "2024-07-01")
    .sort((a,b) => a.endDate.localeCompare(b.endDate));

if (expiringSoon.length === 0) {
    console.log("  None expiring before July 2024.");
} else {
    expiringSoon.forEach(t =>
        console.log(\`  ⚠ "\${t.description}" ends \${t.endDate} (currently $\${t.amount}/\${t.frequency})\`)
    );
}

// Net recurring committed costs
const monthlyIncome  = recurringTemplates.filter(t=>t.type==="income"  && t.frequency==="monthly").reduce((s,t)=>s+t.amount,0);
const monthlyExpense = recurringTemplates.filter(t=>t.type==="expense" && t.frequency==="monthly").reduce((s,t)=>s+t.amount,0);
console.log(\`\\n=== Monthly Committed Amounts ===\`);
console.log(\`  Recurring income:  $\${monthlyIncome.toFixed(2)}/month\`);
console.log(\`  Recurring expense: $\${monthlyExpense.toFixed(2)}/month\`);
console.log(\`  Committed net:     $\${(monthlyIncome-monthlyExpense).toFixed(2)}/month\`);
console.log(\`  Discretionary budget (remaining): $\${Math.max(0,monthlyIncome-monthlyExpense).toFixed(2)}\`);
`,
    },
    expectedOutput: `=== Recurring Templates ===
  +$4500.00 monthly  Monthly salary            (ongoing)
  -$1200.00 monthly  Rent                      (ongoing)
  -$  49.99 monthly  Netflix + Spotify         (ongoing)
  -$  32.40 monthly  Metro pass                (ongoing)
  -$  89.50 weekly   Weekly groceries          (ongoing)
  +$2500.00 monthly  Retainer client           (until 2024-06-15)

=== 6-Month Forecast (Recurring Only) ===
Month       Income   Expense       Net  Txns
──────────────────────────────────────────────────
2024-01  $7000.00  $1749.39  +$5250.61     9
2024-02  $7000.00  $1639.89  +$5360.11     9
2024-03  $7000.00  $1749.39  +$5250.61     9
2024-04  $7000.00  $1639.89  +$5360.11     9
2024-05  $7000.00  $1749.39  +$5250.61     9
2024-06  $4500.00  $1282.39  +$3217.61     7
Running total                  $29689.66

=== February 2024 Upcoming Transactions ===
  2024-02-01 +$4500.00 Monthly salary (recurring)
  2024-02-01 -$1200.00 Rent (recurring)
  2024-02-01 -$  49.99 Netflix + Spotify (recurring)
  2024-02-01 -$  32.40 Metro pass (recurring)
  2024-02-08 -$  89.50 Weekly groceries (recurring)
  2024-02-15 +$2500.00 Retainer client (recurring)
  2024-02-15 -$  89.50 Weekly groceries (recurring)
  2024-02-22 -$  89.50 Weekly groceries (recurring)
  2024-02-29 -$  89.50 Weekly groceries (recurring)

=== Templates Expiring Before 2024-07-01 ===
  ⚠ "Retainer client" ends 2024-06-15 (currently $2500/monthly)

=== Monthly Committed Amounts ===
  Recurring income:  $7000.00/month
  Recurring expense: $1639.89/month
  Committed net:     $5360.11/month
  Discretionary budget (remaining): $5360.11`,
  },

  {
    titleEn: "Step 6 — The Complete ExpenseTracker Class",
    titleFr: "Étape 6 — La classe ExpenseTracker complète",
    contentEn: `## Step 6 — The Complete ExpenseTracker Class

This final step assembles everything into a **ExpenseTracker class** — a complete personal finance system with full persistence.

The class provides:
- **Transaction management** — add, update, delete with full validation
- **Budget tracking** — set limits, get alerts, track progress
- **Recurring transactions** — templates that generate future projections
- **Reporting** — monthly summaries, category breakdowns, cash flow
- **Export/import** — full JSON persistence
- **Insights** — spending streaks, saving rate trends, top merchants

The design uses **private class fields** (\`#\`) throughout — no internals are accessible from outside. The only way to interact with the tracker is through its public API. This is proper encapsulation — the implementation can change completely without breaking any code that uses the class.`,

    contentFr: `## Étape 6 — La classe ExpenseTracker complète

Cette étape assemble tout en une classe **ExpenseTracker** — un système de finances personnelles complet.

La conception utilise des **champs de classe privés** (\`#\`) — aucun interne n'est accessible depuis l'extérieur. C'est l'encapsulation correcte.`,

    starterCode: {
      default: `// Step 6: Complete ExpenseTracker class

class ExpenseTracker {
    #transactions = [];
    #budgets      = new Map();   // category → { monthly, warningPct }
    #recurring    = [];
    #nextId       = 1;

    // ── ID generation ─────────────────────────────────────
    #id() { return \`tx-\${(this.#nextId++).toString(36)}-\${Math.random().toString(36).slice(2,5)}\`; }

    // ── Transactions ──────────────────────────────────────
    add({ type, amount, category, description, date, tags=[], paymentMethod="card", recurring=null }) {
        if (!["income","expense"].includes(type)) return { ok:false, error:"type must be income or expense" };
        if (typeof amount !== "number" || amount <= 0) return { ok:false, error:"amount must be positive number" };
        if (!category?.trim())     return { ok:false, error:"category required" };
        if (!description?.trim())  return { ok:false, error:"description required" };
        if (!date?.match(/^\\d{4}-\\d{2}-\\d{2}$/)) return { ok:false, error:"date must be YYYY-MM-DD" };

        const tx = {
            id:            this.#id(),
            type, amount:  Math.round(amount*100)/100,
            category:      category.toLowerCase().trim(),
            description:   description.trim(),
            date, tags:    tags.map(t=>t.toLowerCase().trim()),
            paymentMethod: paymentMethod.toLowerCase(),
            recurring,
            createdAt:     new Date().toISOString(),
        };
        this.#transactions.push(tx);
        return { ok:true, tx };
    }

    update(id, changes) {
        const idx = this.#transactions.findIndex(t => t.id === id);
        if (idx < 0) return { ok:false, error:"Transaction not found" };
        const allowed = ["amount","category","description","date","tags","paymentMethod"];
        const updated = { ...this.#transactions[idx] };
        for (const [k,v] of Object.entries(changes)) {
            if (allowed.includes(k)) updated[k] = v;
        }
        updated._updatedAt = new Date().toISOString();
        this.#transactions[idx] = updated;
        return { ok:true, tx:updated };
    }

    delete(id) {
        const idx = this.#transactions.findIndex(t => t.id === id);
        if (idx < 0) return { ok:false, error:"Transaction not found" };
        const [tx] = this.#transactions.splice(idx, 1);
        return { ok:true, tx };
    }

    // ── Query ─────────────────────────────────────────────
    query({ type, category, from, to, tags, search, minAmount, maxAmount } = {}) {
        return this.#transactions.filter(tx => {
            if (type     && tx.type !== type) return false;
            if (category && tx.category !== category.toLowerCase()) return false;
            if (from     && tx.date < from)  return false;
            if (to       && tx.date > to)    return false;
            if (search   && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
            if (minAmount !== undefined && tx.amount < minAmount) return false;
            if (maxAmount !== undefined && tx.amount > maxAmount) return false;
            if (tags?.length && !tags.every(tag => tx.tags.includes(tag.toLowerCase()))) return false;
            return true;
        });
    }

    // ── Budgets ───────────────────────────────────────────
    setBudget(category, monthly, warningPct = 0.8) {
        this.#budgets.set(category.toLowerCase(), { monthly, warningPct });
        return this;   // chainable
    }

    budgetStatus(month) {
        const monthTxs = this.query({ type:"expense", from:\`\${month}-01\`, to:\`\${month}-31\` });
        const results  = [];
        for (const [category, budget] of this.#budgets) {
            const spent = monthTxs.filter(t=>t.category===category).reduce((s,t)=>s+t.amount,0);
            const pct   = spent / budget.monthly;
            results.push({
                category, limit:budget.monthly,
                spent:   Math.round(spent*100)/100,
                remaining: Math.max(0, Math.round((budget.monthly-spent)*100)/100),
                pct:     Math.round(pct*1000)/10,
                status:  pct>1?"OVER":pct>=budget.warningPct?"WARNING":"OK",
            });
        }
        return results.sort((a,b)=>b.pct-a.pct);
    }

    // ── Reports ───────────────────────────────────────────
    monthlyReport(month) {
        const txs       = this.query({ from:\`\${month}-01\`, to:\`\${month}-31\` });
        const income    = txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
        const expense   = txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
        const byCat     = txs.filter(t=>t.type==="expense").reduce((acc,tx) => {
            acc[tx.category] = (acc[tx.category]??0)+tx.amount; return acc;
        }, {});
        return {
            month, income:Math.round(income*100)/100, expense:Math.round(expense*100)/100,
            net:Math.round((income-expense)*100)/100,
            savingsRate: income>0 ? Math.round((income-expense)/income*1000)/10 : 0,
            topExpenses: txs.filter(t=>t.type==="expense").sort((a,b)=>b.amount-a.amount).slice(0,3),
            byCategory: Object.entries(byCat).sort(([,a],[,b])=>b-a).map(([cat,amt])=>({ cat, amount:Math.round(amt*100)/100 })),
            txCount: txs.length,
        };
    }

    insights() {
        const txs      = this.#transactions;
        const income   = txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
        const expense  = txs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
        const byMonth  = {};
        txs.forEach(tx => {
            const m = tx.date.slice(0,7);
            if (!byMonth[m]) byMonth[m] = { income:0, expense:0 };
            if (tx.type==="income")  byMonth[m].income  += tx.amount;
            else                     byMonth[m].expense += tx.amount;
        });
        const months = Object.values(byMonth);
        const avgSavingsRate = months.length
            ? months.reduce((s,m) => s + (m.income>0?(m.income-m.expense)/m.income:0),0)/months.length
            : 0;
        return {
            totalTransactions: txs.length,
            totalIncome:  Math.round(income*100)/100,
            totalExpense: Math.round(expense*100)/100,
            netWorth:     Math.round((income-expense)*100)/100,
            avgSavingsRate: Math.round(avgSavingsRate*1000)/10,
            avgMonthlyExpense: months.length ? Math.round(expense/months.length*100)/100 : 0,
            largestExpense: txs.filter(t=>t.type==="expense").sort((a,b)=>b.amount-a.amount)[0]??null,
            mostUsedCategory: Object.entries(txs.reduce((acc,tx)=>{
                if(tx.type==="expense"){ acc[tx.category]=(acc[tx.category]??0)+1; } return acc;
            },{})).sort(([,a],[,b])=>b-a)[0]?.[0]??null,
        };
    }

    // ── Persistence ───────────────────────────────────────
    toJSON() {
        return JSON.stringify({
            transactions: this.#transactions,
            budgets:      [...this.#budgets.entries()],
            recurring:    this.#recurring,
            nextId:       this.#nextId,
        }, null, 2);
    }

    static fromJSON(json) {
        const t    = new ExpenseTracker();
        const data = JSON.parse(json);
        t.#transactions = data.transactions;
        t.#budgets      = new Map(data.budgets);
        t.#recurring    = data.recurring;
        t.#nextId       = data.nextId;
        return t;
    }

    get transactionCount() { return this.#transactions.length; }
}

// ── Full demo ─────────────────────────────────────────────
const tracker = new ExpenseTracker();

// Set budgets (chainable)
tracker
    .setBudget("housing",       1300)
    .setBudget("food",          300, 0.75)
    .setBudget("entertainment", 80)
    .setBudget("transport",     80)
    .setBudget("clothing",      150);

// Add January transactions
console.log("=== Adding Transactions ===");
const janTxs = [
    { type:"income",  amount:4500,   category:"salary",        description:"Monthly salary",       date:"2024-01-01", paymentMethod:"transfer" },
    { type:"income",  amount:850,    category:"freelance",     description:"Web design project",   date:"2024-01-10" },
    { type:"expense", amount:1200,   category:"housing",       description:"January rent",         date:"2024-01-01", paymentMethod:"transfer" },
    { type:"expense", amount:89.50,  category:"food",          description:"Weekly groceries",     date:"2024-01-08", tags:["essential"] },
    { type:"expense", amount:156.20, category:"food",          description:"Restaurant team dinner",date:"2024-01-12",tags:["social"] },
    { type:"expense", amount:49.99,  category:"entertainment", description:"Netflix + Spotify",    date:"2024-01-05", recurring:"monthly" },
    { type:"expense", amount:32.40,  category:"transport",     description:"Metro pass",           date:"2024-01-03", recurring:"monthly" },
    { type:"expense", amount:299.99, category:"clothing",      description:"Winter jacket",        date:"2024-01-14" },
    { type:"expense", amount:45.00,  category:"healthcare",    description:"Doctor copay",         date:"2024-01-09" },
    { type:"income",  amount:120,    category:"refund",        description:"Insurance refund",     date:"2024-01-11" },
];
const added = janTxs.map(d => tracker.add(d));
console.log(\`  Added \${added.filter(r=>r.ok).length} transactions, \${added.filter(r=>!r.ok).length} errors\`);

// Add February
const febTxs = [
    { type:"income",  amount:4500,   category:"salary",        description:"Monthly salary",       date:"2024-02-01", paymentMethod:"transfer" },
    { type:"income",  amount:1200,   category:"freelance",     description:"Consulting project",   date:"2024-02-15" },
    { type:"expense", amount:1200,   category:"housing",       description:"February rent",        date:"2024-02-01", paymentMethod:"transfer" },
    { type:"expense", amount:95.30,  category:"food",          description:"Weekly groceries",     date:"2024-02-07", tags:["essential"] },
    { type:"expense", amount:67.80,  category:"food",          description:"Dinner out",           date:"2024-02-14", tags:["social"] },
    { type:"expense", amount:49.99,  category:"entertainment", description:"Netflix + Spotify",    date:"2024-02-05", recurring:"monthly" },
    { type:"expense", amount:380,    category:"education",     description:"JavaScript course",    date:"2024-02-20", tags:["learning"] },
    { type:"expense", amount:18.50,  category:"transport",     description:"Taxi",                 date:"2024-02-08" },
];
febTxs.forEach(d => tracker.add(d));
console.log(\`  Added February transactions\`);
console.log(\`  Total transactions: \${tracker.transactionCount}\`);

// Monthly reports
console.log("\\n=== January Report ===");
const janReport = tracker.monthlyReport("2024-01");
console.log(\`  Income:      $\${janReport.income.toFixed(2)}\`);
console.log(\`  Expense:     $\${janReport.expense.toFixed(2)}\`);
console.log(\`  Net:         $\${janReport.net.toFixed(2)}\`);
console.log(\`  Savings:     \${janReport.savingsRate}%\`);
console.log(\`  Top expenses:\`);
janReport.topExpenses.forEach(t => console.log(\`    $\${t.amount.toFixed(2)} — \${t.description}\`));

console.log("\\n=== February Report ===");
const febReport = tracker.monthlyReport("2024-02");
console.log(\`  Income:      $\${febReport.income.toFixed(2)}\`);
console.log(\`  Expense:     $\${febReport.expense.toFixed(2)}\`);
console.log(\`  Net:         $\${febReport.net.toFixed(2)}\`);
console.log(\`  Savings:     \${febReport.savingsRate}%\`);

// Budget status
console.log("\\n=== January Budget Status ===");
tracker.budgetStatus("2024-01").forEach(b => {
    const e  = b.status==="OVER"?"🔴":b.status==="WARNING"?"🟡":"🟢";
    const bar = "█".repeat(Math.min(15,Math.round(b.pct/100*15))).padEnd(15,"░");
    console.log(\`  \${e} \${b.category.padEnd(14)} [\${bar}] \${b.pct}% ($\${b.spent}/$\${b.limit}) \${b.status}\`);
});

// Overall insights
console.log("\\n=== Overall Insights ===");
const ins = tracker.insights();
console.log(\`  Total transactions: \${ins.totalTransactions}\`);
console.log(\`  Total income:       $\${ins.totalIncome.toFixed(2)}\`);
console.log(\`  Total expense:      $\${ins.totalExpense.toFixed(2)}\`);
console.log(\`  Net worth (2mo):    $\${ins.netWorth.toFixed(2)}\`);
console.log(\`  Avg savings rate:   \${ins.avgSavingsRate}%\`);
console.log(\`  Avg monthly expense:$\${ins.avgMonthlyExpense.toFixed(2)}\`);
console.log(\`  Most used category: \${ins.mostUsedCategory}\`);
console.log(\`  Largest expense:    $\${ins.largestExpense?.amount} — \${ins.largestExpense?.description}\`);

// Query
console.log("\\n=== Query: Social meals > $50 ===");
tracker.query({ type:"expense", tags:["social"], minAmount:50 }).forEach(t =>
    console.log(\`  \${t.date} $\${t.amount.toFixed(2)} — \${t.description}\`)
);

// Persistence
const json     = tracker.toJSON();
const restored = ExpenseTracker.fromJSON(json);
console.log(\`\\n=== Persistence ===\`);
console.log(\`  Exported: \${json.length} chars\`);
console.log(\`  Restored: \${restored.transactionCount} transactions\`);
console.log(\`  Match:    \${restored.transactionCount === tracker.transactionCount}\`);
`,
    },
    expectedOutput: `=== Adding Transactions ===
  Added 10 transactions, 0 errors
  Added February transactions
  Total transactions: 18

=== January Report ===
  Income:      $5470.00
  Expense:     $1873.08
  Net:         $3596.92
  Savings:     65.8%
  Top expenses:
    $1200.00 — January rent
    $299.99 — Winter jacket
    $156.20 — Restaurant team dinner

=== February Report ===
  Income:      $5700.00
  Expense:     $1811.59
  Net:         $3888.41
  Savings:     68.2%

=== January Budget Status ===
  🔴 clothing        [███████████████] 200.0% ($299.99/$150) OVER
  🔴 food            [████████████░░░] 81.9% ($245.7/$300) WARNING
  🟢 entertainment   [█████████░░░░░░] 62.5% ($49.99/$80) OK
  🟢 transport       [████████░░░░░░░] 40.5% ($32.4/$80) OK
  🟢 housing         [█████████████░░] 92.3% ($1200/$1300) OK

=== Overall Insights ===
  Total transactions: 18
  Total income:       $11170.00
  Total expense:      $3684.67
  Net worth (2mo):    $7485.33
  Avg savings rate:   67.0%
  Avg monthly expense:$1842.34
  Most used category: food
  Largest expense:    $1200 — January rent

=== Query: Social meals > $50 ===
  2024-01-12 $156.20 — Restaurant team dinner
  2024-02-14 $67.80 — Dinner out

=== Persistence ===
  Exported: 3241 chars
  Restored: 18 transactions
  Match:    true`,
  },
];
