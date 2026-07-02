export const content = {
  en: `# Query Compilation

## The Interpreter vs Compiler Divide

Traditional database query execution uses the **Volcano/Iterator model** — a tree of operators where each operator pulls rows from its children one at a time. This is elegant but slow.

\`\`\`
Volcano model execution:
  SELECT sum(price) FROM orders WHERE status = 'completed'

  Aggregate (sum)
      └── Filter (status = 'completed')
            └── SeqScan (orders)

  Execution loop:
    aggregate.next():
      loop:
        row = filter.next()
        if row == NULL: return result
        sum += row.price
    
    filter.next():
      loop:
        row = scan.next()
        if row == NULL: return NULL
        if row.status == 'completed': return row
    
    scan.next():
      read next tuple from page buffer
      return tuple

  Every next() call = virtual function dispatch (vtable lookup)
  For 1 million rows: ~3 million virtual function calls
  Virtual calls prevent inlining → CPU branch predictor fails
  
  Measured overhead: 70-90% of query time spent in framework overhead,
                     not actual computation!
\`\`\`

## Just-In-Time (JIT) Compilation — PostgreSQL

PostgreSQL 11 added JIT compilation using LLVM to address Volcano model overhead.

\`\`\`
What PostgreSQL JIT compiles:
  Expression evaluation: WHERE clauses, projection, aggregation formulas
    "price * quantity > 100 AND category = 'electronics'"
    → Compiled to native machine code
    → No interpreter overhead for expression evaluation
  
  Tuple deforming: extracting columns from heap tuple format
    Each column access in Volcano model: bounds check + type dispatch + copy
    JIT compiled: inline bounds check eliminated, direct memory access

What PostgreSQL JIT does NOT compile (currently):
  The Volcano operator loop itself (next() calls remain interpreted)
  Index operations
  Sort algorithms
  Hash table operations
\`\`\`

\`\`\`sql
-- PostgreSQL JIT configuration
SET jit = on;                          -- enable JIT (default: on in PG 12+)
SET jit_above_cost = 100000;           -- JIT if estimated cost > this
SET jit_inline_above_cost = 500000;    -- inline functions if cost > this
SET jit_optimize_above_cost = 500000;  -- apply optimizations if cost > this

-- See if JIT was used in a query:
EXPLAIN (ANALYZE, BUFFERS) SELECT sum(price * quantity) 
FROM order_items 
WHERE created_at > '2024-01-01';

-- Output includes:
-- JIT:
--   Functions: 3
--   Options: Inlining true, Optimization true, Expressions true, Deforming true
--   Timing: Generation 1.234 ms, Inlining 2.345 ms, Optimization 5.678 ms,
--           Emission 3.456 ms, Total 12.713 ms

-- JIT has startup cost! Only worthwhile for long-running analytical queries.
-- For OLTP (< 1ms queries): JIT overhead > JIT benefit → disable per session:
SET jit = off;
\`\`\`

### LLVM IR — What PostgreSQL Generates

\`\`\`
PostgreSQL generates LLVM Intermediate Representation (IR) for expressions.

C expression:  price * quantity > 100 AND status = 'completed'

LLVM IR (simplified):
  define i1 @expr_eval(%TupleTableSlot* %slot) {
    ; Deform tuple to get price column (column index 3)
    %price_datum = call i64 @slot_getattr(%slot, 3, %isnull)
    %price = call double @DatumGetFloat8(%price_datum)
    
    ; Get quantity column (column index 4)  
    %qty_datum = call i64 @slot_getattr(%slot, 4, %isnull)
    %qty = call i32 @DatumGetInt32(%qty_datum)
    
    ; Compute price * quantity
    %qty_f = sitofp i32 %qty to double
    %product = fmul double %price, %qty_f
    
    ; Compare with 100
    %cmp1 = fcmp ogt double %product, 1.000000e+02
    br i1 %cmp1, label %check_status, label %false
    
  check_status:
    ; Get status column (column index 2)
    %status_datum = call i64 @slot_getattr(%slot, 2, %isnull)
    %status = call i8* @TextDatumGetCString(%status_datum)
    %cmp2 = call i32 @strcmp(%status, "completed")
    %is_eq = icmp eq i32 %cmp2, 0
    ret i1 %is_eq
    
  false:
    ret i1 false
  }

LLVM optimizes this IR:
  Inline @slot_getattr (eliminates function call overhead)
  Eliminate null checks for NOT NULL columns
  Vectorize comparisons if possible
  Emit native x86-64 machine code
\`\`\`

## Vectorized Execution — ClickHouse / DuckDB

Instead of compiling individual expressions, vectorized execution processes data in **batches** (vectors) of typically 1024-8192 rows using SIMD instructions.

\`\`\`
Volcano model (one row at a time):
  for each row:
    if row.price * row.quantity > 100:
      sum += row.price * row.quantity

Vectorized model (one vector at a time):
  Load 8192 prices into SIMD register (512 bits = 8 × float64)
  Load 8192 quantities into SIMD register
  VMULPD: multiply all 8 pairs simultaneously → 8192 products
  VCMPGTPD: compare all 8192 against 100 → 8192 boolean mask
  VMASKMOVPD: select matching prices using mask
  VADDPD: add selected prices to accumulator
  
  CPU processes 8 rows per instruction cycle vs 1 in scalar code
  Plus: branch prediction works perfectly (no per-row branches)
\`\`\`

\`\`\`
SIMD instruction sets:
  SSE2  (2001): 128-bit, 2 × float64 or 4 × float32 or 16 × int8
  AVX   (2011): 256-bit, 4 × float64 or 8 × float32
  AVX-512 (2017): 512-bit, 8 × float64 or 16 × float32
  
  Modern server CPUs (Ice Lake, Zen 4): AVX-512
  Process 8 doubles per instruction → 8x speedup for compute-bound queries

DuckDB vectorized execution:
  Processes data in vectors of 2048 values (STANDARD_VECTOR_SIZE)
  Each operator: process entire vector, pass vector to parent
  
  Advantages over Volcano:
    Function calls: 1 per vector (not 1 per row) → 2048x fewer calls
    CPU instruction cache: operator code stays hot (repeatedly called on same vector)
    SIMD auto-vectorization: compiler sees tight loop → emits SIMD instructions
    Branch prediction: same branch taken 2048 times → predictor learns
\`\`\`

## Whole-Query Compilation — HyPer / Umbra

The most aggressive approach: compile the ENTIRE query into a single native function, eliminating ALL operator boundaries.

\`\`\`
Compilation target:
  SELECT c.name, sum(o.total)
  FROM customers c
  JOIN orders o ON c.id = o.customer_id
  WHERE o.created_at > '2024-01-01'
  GROUP BY c.name

Compiled to (conceptual native code):
  void execute_query(ResultSet& result) {
    // Hash table for GROUP BY
    HashMap<string, double> groups;
    
    // Loop over orders table (inner loop — probe side)
    for (auto& order : orders_table) {
      if (order.created_at <= cutoff) continue;   // filter inlined
      
      // Hash join probe (no function call — inlined)
      auto customer = customers_hash_table[order.customer_id];
      if (!customer) continue;                     // join condition
      
      // Aggregate (no function call — inlined)
      groups[customer->name] += order.total;
    }
    
    // Emit results
    for (auto& [name, total] : groups) {
      result.emit(name, total);
    }
  }

What's gone:
  ✗ Virtual function calls (next() eliminated)
  ✗ Operator boundaries (all fused into one loop)
  ✗ Tuple materialization between operators
  ✗ Type dispatch (types known at compile time)

What's gained:
  ✓ CPU register allocation across entire query
  ✓ Loop fusion: one pass over data for filter + join + aggregate
  ✓ Dead code elimination: unused columns never touched
  ✓ Constant folding: '2024-01-01' converted to integer timestamp once
\`\`\`

### Push vs Pull Model

\`\`\`
Volcano (pull) model:
  Parent calls child.next() → child produces one row → parent processes it
  Control flow: top-down (parent drives)
  
HyPer (push/producer) model:
  Child calls parent.consume(row) → parent processes immediately
  Control flow: bottom-up (child drives)
  
  Why push is better for compilation:
    Pull model: function call stack per row (stack frames, register spills)
    Push model: tight inner loop (registers maintained across iterations)
    
    Pull: scan produces row → filter processes → aggregate processes
          (3 function call frames deep per row)
    Push: scan produces row → IMMEDIATELY filters AND aggregates in same frame
          (1 function call frame, all data in registers)
\`\`\`

\`\`\`
HyPer pipeline concept:
  Query: Filter → HashBuild → HashProbe → Aggregate
  
  Pipeline 1 (build side):  Scan → Filter → HashBuild
    One tight loop: for each row, filter and insert into hash table
    Entire pipeline compiled to single native function
    
  Pipeline 2 (probe side):  Scan → HashProbe → Aggregate → Output
    One tight loop: for each row, probe hash table, aggregate
    
  Pipeline break: HashBuild must complete before HashProbe starts
                  (can't probe a hash table that's still being built)
  
  Other pipeline breaks: Sort (must collect all before returning first),
                         LIMIT with ORDER BY, blocking aggregations
\`\`\`

## Adaptive Query Compilation

A challenge with compilation: **the query plan may be wrong**.

\`\`\`
Problem:
  Query optimizer estimates 100 rows for a filter
  Compilation assumes: use nested loop join (good for 100 rows)
  Actual rows: 100,000
  Nested loop on 100,000 rows: catastrophic performance
  
  But we've already compiled this as nested loop!
  JIT'd code cannot be changed mid-execution.
  Interpreted code can be changed (re-plan).

Orca (Greenplum's optimizer) approach:
  Compile MULTIPLE plans for different cardinality assumptions
  Execute plan A for small result sets
  Switch to plan B if cardinality exceeds threshold

Adaptive execution (DuckDB approach):
  Profile during execution (count actual rows per operator)
  If actual << estimated: continue current plan
  If actual >> estimated: pause, re-optimize, recompile
  
  DuckDB "adaptive" example:
    Start with hash join (estimated 100K rows → hash table fits in memory)
    Actual: 10M rows → hash table would spill to disk
    Detect spill → switch to grace hash join (partition-based)

PostgreSQL adaptive:
  No mid-query re-planning currently (Postgres 16)
  Once plan chosen: executed as-is
  Bad estimate → bad plan → bad performance → ANALYZE fixes statistics
\`\`\`

## Query Compilation in Production Systems

### Amazon Redshift — AQUA

\`\`\`
Redshift compiles queries to C++ then to native code.
AQUA (Advanced Query Accelerator) pushes compiled code to custom
FPGA/ASIC hardware in the storage layer:

Traditional:
  Storage → read data → CPU → compute → result

AQUA:
  Storage → AQUA (compute near storage) → result
  
  Compiled query runs ON the FPGA near the data
  Eliminates data movement between storage and compute
  10x speedup for filter-heavy queries (less data moved to CPU)
\`\`\`

### Snowflake — Compiled Query Plans

\`\`\`
Snowflake uses a hybrid approach:
  Vectorized execution for most operators
  JIT compilation for expression evaluation
  
  Compiled to C++, then to native code via LLVM
  Cached: compiled plan reused for same query shape (different parameters)
  
  Query plan cache:
    Hash(query_structure) → compiled binary
    SELECT * FROM t WHERE id = ? → compiled once, reused with different ?
    
  This is critical for SaaS: many tenants run same query patterns
  Compile once → 10,000 tenants benefit
\`\`\`

### DuckDB — Compilation + Vectorization

\`\`\`
DuckDB combines both approaches:
  Vectorized execution engine (similar to MonetDB)
  + JIT compilation for expression evaluation (similar to PostgreSQL)
  + Adaptive execution
  
  The result: analytical queries that are 10-100x faster than PostgreSQL
              for large aggregations, joins, and scans.

DuckDB compilation pipeline:
  SQL → Logical Plan → Physical Plan → Pipeline (push-based)
      → Vectorized Operators → JIT-compiled Expressions → Native Code

Example benchmark (TPC-H Q1 on 1GB dataset):
  PostgreSQL (interpreted):  45 seconds
  PostgreSQL (with JIT):     12 seconds
  DuckDB (vectorized + JIT): 0.3 seconds
  
  DuckDB is 150x faster than PostgreSQL on this analytical query.
  (PostgreSQL wins on OLTP — DuckDB not designed for that)
\`\`\`

## Compilation Overhead and When to Use It

\`\`\`
JIT compilation costs:
  LLVM code generation:  1-10ms
  LLVM optimization:     5-50ms
  LLVM code emission:    1-10ms
  Total startup:         10-100ms per query
  
  Break-even analysis:
    Interpreted query: 1μs per row × 10M rows = 10 seconds
    JIT compiled:      0.1μs per row × 10M rows + 50ms overhead = 1.05 seconds
    Break-even:        at ~50,000 rows (100ms / (1μs - 0.1μs))
    
  Rule of thumb:
    OLTP queries (< 1ms, < 10K rows): JIT overhead > benefit → disable
    Analytical queries (> 100ms, > 100K rows): JIT benefit >> overhead → enable

PostgreSQL JIT thresholds (default):
  jit_above_cost = 100000    → only JIT if planner cost > 100K
  This approximately corresponds to queries returning > 100K rows
  → OLTP queries (cost < 100K) are never JIT compiled
  → Analytical queries (cost > 100K) benefit from JIT
\`\`\`
`,

  fr: `# Compilation de requêtes

## La division interpréteur vs compilateur

Le modèle Volcano/Iterator traditionnel tire les lignes une par une à travers un arbre d'opérateurs. C'est élégant mais lent.

\`\`\`
Overhead mesuré du modèle Volcano :
  70-90% du temps de requête passé dans l'overhead du framework,
  pas dans le calcul réel !
  
  Pour 1 million de lignes : ~3 millions d'appels de fonctions virtuelles
  Appels virtuels empêchent l'inlining → le prédicteur de branche CPU échoue
\`\`\`

## JIT — PostgreSQL

\`\`\`sql
-- Configuration JIT PostgreSQL
SET jit = on;
SET jit_above_cost = 100000;           -- JIT si coût estimé > ceci
SET jit_inline_above_cost = 500000;
SET jit_optimize_above_cost = 500000;

-- Voir si JIT a été utilisé :
EXPLAIN (ANALYZE, BUFFERS) SELECT sum(price * quantity)
FROM order_items WHERE created_at > '2024-01-01';

-- Le JIT a un coût de démarrage !
-- Pour OLTP (< 1ms) : overhead JIT > bénéfice → désactiver :
SET jit = off;
\`\`\`

## Exécution vectorisée — ClickHouse / DuckDB

\`\`\`
Modèle Volcano (une ligne à la fois) :
  pour chaque ligne :
    si ligne.prix * ligne.quantité > 100 :
      somme += ligne.prix * ligne.quantité

Modèle vectorisé (un vecteur à la fois) :
  Charger 8192 prix dans registre SIMD (512 bits = 8 × float64)
  Charger 8192 quantités dans registre SIMD
  VMULPD : multiplier les 8 paires simultanément → 8192 produits
  VCMPGTPD : comparer les 8192 contre 100 → 8192 masques booléens
  VADDPD : additionner les prix sélectionnés à l'accumulateur
  
  Le CPU traite 8 lignes par cycle d'instruction vs 1 en code scalaire

Ensembles d'instructions SIMD :
  SSE2  (2001) : 128 bits, 2 × float64
  AVX   (2011) : 256 bits, 4 × float64
  AVX-512 (2017) : 512 bits, 8 × float64
\`\`\`

## Compilation de requête complète — HyPer / Umbra

\`\`\`
Modèle push (HyPer) :
  L'enfant appelle parent.consume(ligne) → le parent traite immédiatement
  Flux de contrôle : de bas en haut (l'enfant pilote)
  
  Pourquoi push est meilleur pour la compilation :
    Modèle pull : cadre d'appel de fonction par ligne (trames de pile, débordements de registres)
    Modèle push : boucle interne serrée (registres maintenus à travers les itérations)

Concept de pipeline HyPer :
  Pipeline 1 (côté construction) :  Scan → Filtre → HashBuild
    Une boucle serrée : pour chaque ligne, filtrer et insérer dans la table de hachage
    Pipeline entier compilé en une seule fonction native
    
  Pipeline 2 (côté sonde) :  Scan → HashProbe → Agrégat → Sortie
    
  Rupture de pipeline : HashBuild doit se terminer avant que HashProbe commence
\`\`\`

## DuckDB — Compilation + Vectorisation

\`\`\`
Benchmark (TPC-H Q1 sur 1 Go de données) :
  PostgreSQL (interprété) :      45 secondes
  PostgreSQL (avec JIT) :        12 secondes
  DuckDB (vectorisé + JIT) :     0,3 secondes
  
  DuckDB est 150x plus rapide que PostgreSQL sur cette requête analytique.
  (PostgreSQL gagne sur OLTP — DuckDB n'est pas conçu pour ça)
\`\`\`

## Overhead de compilation et quand l'utiliser

\`\`\`
Coûts de compilation JIT :
  Génération de code LLVM :  1-10ms
  Optimisation LLVM :        5-50ms
  Émission de code LLVM :    1-10ms
  Total démarrage :          10-100ms par requête

Analyse du seuil de rentabilité :
  Requête interprétée : 1μs par ligne × 10M lignes = 10 secondes
  JIT compilé :         0,1μs par ligne × 10M lignes + 50ms = 1,05 secondes
  Seuil de rentabilité : à ~50 000 lignes

Règle générale :
  Requêtes OLTP (< 1ms, < 10K lignes) : overhead JIT > bénéfice → désactiver
  Requêtes analytiques (> 100ms, > 100K lignes) : bénéfice JIT >> overhead → activer
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "Why does the Volcano/Iterator model spend 70-90% of query time on framework overhead rather than actual computation?",
      options: [
        "The Volcano model uses disk I/O for every row which dominates execution time",
        "Every row requires a virtual function call (next()) per operator — for 1 million rows with 3 operators, that's 3 million virtual dispatches. Virtual calls prevent inlining, destroy CPU branch prediction, thrash the instruction cache, and cause function call overhead. The actual computation (arithmetic, comparison) is a tiny fraction of total time.",
        "The Volcano model allocates new memory for each row causing GC pressure",
        "Virtual function tables require network lookups in distributed query execution",
      ],
      correct: 1,
    },
    {
      question:
        "What does PostgreSQL JIT compilation specifically optimize and what does it NOT optimize?",
      options: [
        "PostgreSQL JIT optimizes everything including sort algorithms and index scans",
        "PostgreSQL JIT compiles expression evaluation (WHERE clauses, projections, aggregation formulas) and tuple deforming (column extraction from heap format) to native machine code via LLVM. It does NOT compile the Volcano operator loop itself — next() calls remain interpreted. This means JIT helps analytical queries (complex expressions) but doesn't eliminate operator overhead.",
        "PostgreSQL JIT only optimizes queries that run longer than 1 second",
        "PostgreSQL JIT compiles entire queries to C++ which is then compiled by GCC",
      ],
      correct: 1,
    },
    {
      question:
        "Why is vectorized execution faster than row-at-a-time execution even without JIT compilation?",
      options: [
        "Vectorized execution uses more CPU cores than row-at-a-time execution",
        "Processing 2048-8192 rows per operator call dramatically reduces function call overhead (1 call per vector vs 1 per row), allows SIMD instructions to process 8+ values per CPU cycle, keeps operator code hot in the instruction cache, and enables the branch predictor to learn the branch pattern (same branch taken thousands of times). The combination typically yields 10-100x speedup for analytical queries.",
        "Vectorized execution skips NULL checks which are expensive in row-at-a-time processing",
        "Vectorized execution uses larger CPU caches that are not available to scalar code",
      ],
      correct: 1,
    },
    {
      question:
        "Why does HyPer's push (producer) model compile more efficiently than Volcano's pull (consumer) model?",
      options: [
        "Push model uses less memory because rows are not stored between operators",
        "In the pull model, each row requires traversing the full operator call stack (multiple stack frames, register spills at each boundary). In the push model, the innermost operator (scan) calls consume() directly up the chain — the entire pipeline executes in one tight loop with all data kept in CPU registers. This enables the compiler to fuse all operators into a single native function with no cross-operator overhead.",
        "Push model is faster because it processes rows in reverse order matching CPU prefetch patterns",
        "Push model avoids hash table operations which are slow in the pull model",
      ],
      correct: 1,
    },
    {
      question:
        "Why does JIT compilation have a break-even point and what determines whether to enable it?",
      options: [
        "JIT compilation always improves performance — there is no break-even point",
        "JIT compilation adds 10-100ms of startup overhead (LLVM code generation, optimization, emission). For OLTP queries returning < 10K rows in < 1ms, this overhead exceeds the runtime savings. For analytical queries processing millions of rows over seconds, the per-row speedup (10x) far outweighs the fixed startup cost. Break-even is approximately 50K rows — below this, interpreted execution is faster.",
        "The break-even point is always at exactly 100K rows regardless of query complexity",
        "JIT compilation break-even depends on network latency, not query characteristics",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi le modèle Volcano/Iterator passe-t-il 70-90% du temps de requête dans l'overhead du framework plutôt que dans le calcul réel ?",
      options: [
        "Le modèle Volcano utilise des I/O disque pour chaque ligne ce qui domine le temps d'exécution",
        "Chaque ligne nécessite un appel de fonction virtuelle (next()) par opérateur — pour 1 million de lignes avec 3 opérateurs, c'est 3 millions de dispatches virtuels. Les appels virtuels empêchent l'inlining, détruisent la prédiction de branche CPU, thrashent le cache d'instructions et causent un overhead d'appel de fonction.",
        "Le modèle Volcano alloue de la nouvelle mémoire pour chaque ligne causant une pression GC",
        "Les tables de fonctions virtuelles nécessitent des lookups réseau en exécution de requêtes distribuée",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'optimise spécifiquement la compilation JIT de PostgreSQL et qu'est-ce qu'elle N'optimise PAS ?",
      options: [
        "Le JIT de PostgreSQL optimise tout y compris les algorithmes de tri et les scans d'index",
        "Le JIT de PostgreSQL compile l'évaluation d'expressions (clauses WHERE, projections, formules d'agrégation) et la déformation de tuples en code machine natif via LLVM. Il ne compile PAS la boucle d'opérateur Volcano elle-même — les appels next() restent interprétés. Le JIT aide les requêtes analytiques mais n'élimine pas l'overhead des opérateurs.",
        "Le JIT de PostgreSQL n'optimise que les requêtes qui durent plus d'1 seconde",
        "Le JIT de PostgreSQL compile les requêtes complètes en C++ compilé ensuite par GCC",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi l'exécution vectorisée est-elle plus rapide que l'exécution ligne par ligne même sans compilation JIT ?",
      options: [
        "L'exécution vectorisée utilise plus de cœurs CPU que l'exécution ligne par ligne",
        "Traiter 2048-8192 lignes par appel d'opérateur réduit considérablement l'overhead d'appel de fonction (1 appel par vecteur vs 1 par ligne), permet aux instructions SIMD de traiter 8+ valeurs par cycle CPU, garde le code d'opérateur chaud dans le cache d'instructions, et permet au prédicteur de branche d'apprendre le motif. La combinaison donne typiquement 10-100x d'accélération.",
        "L'exécution vectorisée saute les vérifications NULL qui sont coûteuses en traitement ligne par ligne",
        "L'exécution vectorisée utilise de plus grands caches CPU non disponibles au code scalaire",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi le modèle push (producteur) de HyPer compile-t-il plus efficacement que le modèle pull (consommateur) de Volcano ?",
      options: [
        "Le modèle push utilise moins de mémoire car les lignes ne sont pas stockées entre opérateurs",
        "Dans le modèle pull, chaque ligne nécessite de traverser toute la pile d'appels des opérateurs (multiples trames de pile, débordements de registres à chaque frontière). Dans le modèle push, l'opérateur le plus interne (scan) appelle consume() directement — le pipeline entier s'exécute dans une boucle serrée avec toutes les données dans les registres CPU.",
        "Le modèle push est plus rapide car il traite les lignes dans l'ordre inverse correspondant aux motifs de préchargement CPU",
        "Le modèle push évite les opérations de table de hachage qui sont lentes dans le modèle pull",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi la compilation JIT a-t-elle un seuil de rentabilité et qu'est-ce qui détermine si on doit l'activer ?",
      options: [
        "La compilation JIT améliore toujours les performances — il n'y a pas de seuil de rentabilité",
        "La compilation JIT ajoute 10-100ms d'overhead de démarrage (génération, optimisation, émission de code LLVM). Pour les requêtes OLTP retournant < 10K lignes en < 1ms, cet overhead dépasse les économies d'exécution. Pour les requêtes analytiques traitant des millions de lignes, l'accélération par ligne (10x) dépasse largement le coût fixe de démarrage. Le seuil de rentabilité est approximativement 50K lignes.",
        "Le seuil de rentabilité est toujours exactement à 100K lignes indépendamment de la complexité",
        "Le seuil de rentabilité de la compilation JIT dépend de la latence réseau, pas des caractéristiques de requête",
      ],
      correct: 1,
    },
  ],
};
