export const content = {
  en: `# Aggregations

## What Are Aggregations?

So far you've learned to retrieve individual rows. But often you don't want individual rows — you want **summaries**: how many orders today? What's the average order value? Which product sold the most?

**Aggregate functions** compute a single result from a set of rows.

\`\`\`
Without aggregation (individual rows):
  orders
  ┌────┬─────────────┬────────┐
  │ id │ customer_id │ total  │
  ├────┼─────────────┼────────┤
  │  1 │      1      │ 49.99  │
  │  2 │      1      │ 29.99  │
  │  3 │      2      │ 99.99  │
  │  4 │      3      │ 14.99  │
  └────┴─────────────┴────────┘

With aggregation (summary):
  COUNT(*) = 4            (how many orders?)
  SUM(total) = 194.96     (total revenue?)
  AVG(total) = 48.74      (average order value?)
  MAX(total) = 99.99      (biggest order?)
  MIN(total) = 14.99      (smallest order?)
\`\`\`

## The Five Essential Aggregate Functions

### COUNT — How Many?

\`\`\`sql
-- Count all rows in the table
SELECT COUNT(*) FROM orders;
-- Result: 4

-- Count non-NULL values in a specific column
SELECT COUNT(phone) FROM customers;
-- Counts only customers who have a phone number (not NULL)

-- Count distinct values
SELECT COUNT(DISTINCT customer_id) FROM orders;
-- How many unique customers placed an order?
-- Result: 3 (even if customer 1 placed 2 orders)

-- Difference: COUNT(*) vs COUNT(column)
SELECT COUNT(*)        FROM customers;  -- counts all rows (including NULLs)
SELECT COUNT(phone)    FROM customers;  -- counts only rows where phone IS NOT NULL
\`\`\`

### SUM — Total

\`\`\`sql
-- Total revenue
SELECT SUM(total) FROM orders;
-- Result: 194.96

-- Total revenue from orders over $30
SELECT SUM(total) FROM orders WHERE total > 30;
-- Result: 49.99 + 99.99 = 149.98

-- SUM of NULL values: SUM ignores NULLs
-- If some totals are NULL, they're simply not added
SELECT SUM(total) FROM orders;
-- If total is NULL for some rows: those rows are ignored in the sum
\`\`\`

### AVG — Average

\`\`\`sql
-- Average order value
SELECT AVG(total) FROM orders;
-- Result: 48.74 (194.96 / 4)

-- AVG also ignores NULL values
-- Important: AVG(column) ≠ SUM(column) / COUNT(*)
-- because COUNT(*) includes NULL rows but AVG excludes them

-- Round to 2 decimal places
SELECT ROUND(AVG(total), 2) FROM orders;
-- Result: 48.74
\`\`\`

### MAX and MIN — Highest and Lowest

\`\`\`sql
-- Most expensive order
SELECT MAX(total) FROM orders;
-- Result: 99.99

-- Cheapest order
SELECT MIN(total) FROM orders;
-- Result: 14.99

-- Works on text too (alphabetical order)
SELECT MAX(name) FROM customers;  -- last alphabetically: "Carol"
SELECT MIN(name) FROM customers;  -- first alphabetically: "Alice"

-- Most recent order
SELECT MAX(created_at) FROM orders;

-- Oldest order
SELECT MIN(created_at) FROM orders;
\`\`\`

## GROUP BY — Aggregating by Category

GROUP BY splits rows into groups and applies aggregate functions to each group separately.

\`\`\`sql
-- How many orders does each customer have?
SELECT 
  customer_id,
  COUNT(*) AS order_count
FROM orders
GROUP BY customer_id;

-- Result:
-- customer_id | order_count
-- ------------+------------
--           1 |           2   ← customer 1 has 2 orders
--           2 |           1
--           3 |           1
\`\`\`

\`\`\`
How GROUP BY works mentally:
  Step 1: Split rows into groups by customer_id
    Group customer_id=1:  rows 1, 2  (totals: 49.99, 29.99)
    Group customer_id=2:  row 3      (total: 99.99)
    Group customer_id=3:  row 4      (total: 14.99)
    
  Step 2: Apply COUNT(*) to each group
    customer_id=1: COUNT = 2
    customer_id=2: COUNT = 1
    customer_id=3: COUNT = 1
    
  Step 3: Return one row per group
\`\`\`

### GROUP BY with Multiple Aggregates

\`\`\`sql
-- Full summary per customer
SELECT
  customer_id,
  COUNT(*)         AS order_count,
  SUM(total)       AS total_spent,
  AVG(total)       AS avg_order,
  MAX(total)       AS biggest_order,
  MIN(total)       AS smallest_order
FROM orders
GROUP BY customer_id
ORDER BY total_spent DESC;

-- Result:
-- customer_id | order_count | total_spent | avg_order | biggest_order | smallest_order
-- ------------+-------------+-------------+-----------+---------------+---------------
--           1 |           2 |       79.98 |     39.99 |         49.99 |          29.99
--           2 |           1 |       99.99 |     99.99 |         99.99 |          99.99
--           3 |           1 |       14.99 |     14.99 |         14.99 |          14.99
\`\`\`

### GROUP BY with JOIN

\`\`\`sql
-- Show customer NAMES (not IDs) with their order counts
SELECT
  c.name,
  COUNT(o.id)      AS order_count,
  COALESCE(SUM(o.total), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC;

-- Result:
-- name  | order_count | total_spent
-- ------+-------------+------------
-- Bob   |           1 |       99.99
-- Alice |           2 |       79.98
-- Carol |           0 |        0.00  ← included because of LEFT JOIN
\`\`\`

### The GROUP BY Rule

\`\`\`sql
-- RULE: Every column in SELECT must either be:
--   1. Listed in GROUP BY, OR
--   2. Inside an aggregate function (COUNT, SUM, AVG, MAX, MIN)

-- ✓ Correct:
SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id;
--     ^^^^^^^^^^^ in GROUP BY

SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id;
--                  ^^^^^^^^^^^ inside aggregate function

-- ✗ Wrong:
SELECT customer_id, total FROM orders GROUP BY customer_id;
-- ERROR: column "orders.total" must appear in GROUP BY clause
-- or be used in an aggregate function
-- "total" is not in GROUP BY and not aggregated — which total should be shown?
\`\`\`

### GROUP BY Multiple Columns

\`\`\`sql
-- Orders per customer per status
SELECT
  customer_id,
  status,
  COUNT(*) AS count
FROM orders
GROUP BY customer_id, status
ORDER BY customer_id, status;

-- Result:
-- customer_id | status    | count
-- ------------+-----------+-------
--           1 | completed |     1
--           1 | pending   |     1
--           2 | completed |     1

-- Each unique combination of (customer_id, status) is one group
\`\`\`

## HAVING — Filtering Groups

WHERE filters individual rows BEFORE grouping. HAVING filters groups AFTER aggregation.

\`\`\`sql
-- Find customers who placed MORE THAN 1 order
SELECT
  customer_id,
  COUNT(*) AS order_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 1;          -- filter GROUPS, not individual rows

-- Result:
-- customer_id | order_count
-- ------------+------------
--           1 |           2   ← only customer 1 has more than 1 order

-- WHY can't we use WHERE here?
-- WHERE COUNT(*) > 1  ← ERROR: aggregate functions not allowed in WHERE
-- WHERE runs before GROUP BY — COUNT(*) doesn't exist yet!
-- HAVING runs after GROUP BY — COUNT(*) exists at this point
\`\`\`

### WHERE vs HAVING

\`\`\`sql
-- WHERE: filter rows before grouping
-- HAVING: filter groups after aggregating

-- Example: total spent by customers who have spent more than $50
--          on orders placed in 2024

SELECT
  customer_id,
  SUM(total) AS total_spent
FROM orders
WHERE created_at >= '2024-01-01'     -- filter rows FIRST (only 2024 orders)
GROUP BY customer_id
HAVING SUM(total) > 50               -- then filter groups (total > $50)
ORDER BY total_spent DESC;

-- Execution order:
-- 1. FROM orders
-- 2. WHERE created_at >= '2024-01-01'   ← filter individual rows
-- 3. GROUP BY customer_id               ← form groups
-- 4. HAVING SUM(total) > 50             ← filter groups
-- 5. SELECT customer_id, SUM(total)     ← select columns
-- 6. ORDER BY total_spent DESC          ← sort
\`\`\`

## Real-World Aggregation Examples

### Sales Dashboard

\`\`\`sql
-- Today's sales summary
SELECT
  COUNT(*)                  AS orders_today,
  SUM(total)                AS revenue_today,
  ROUND(AVG(total), 2)      AS avg_order_value,
  MAX(total)                AS largest_order
FROM orders
WHERE created_at >= CURRENT_DATE;    -- today only

-- Revenue by month
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*)                         AS orders,
  ROUND(SUM(total), 2)             AS revenue
FROM orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Result:
-- month               | orders | revenue
-- --------------------+--------+---------
-- 2024-03-01 00:00:00 |    156 | 7823.44
-- 2024-02-01 00:00:00 |    142 | 6991.23
-- 2024-01-01 00:00:00 |    198 | 9234.67
\`\`\`

### Top 10 Best-Selling Products

\`\`\`sql
SELECT
  p.name                    AS product,
  SUM(oi.quantity)          AS units_sold,
  SUM(oi.quantity * oi.price) AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.id, p.name
ORDER BY units_sold DESC
LIMIT 10;
\`\`\`

### Customer Segments

\`\`\`sql
-- Segment customers by how much they've spent
SELECT
  CASE
    WHEN SUM(total) >= 1000 THEN 'VIP'
    WHEN SUM(total) >= 100  THEN 'Regular'
    ELSE                         'New'
  END                       AS segment,
  COUNT(DISTINCT customer_id) AS customer_count,
  ROUND(AVG(SUM(total)) OVER (PARTITION BY
    CASE
      WHEN SUM(total) >= 1000 THEN 'VIP'
      WHEN SUM(total) >= 100  THEN 'Regular'
      ELSE 'New'
    END), 2)                AS avg_spend_in_segment
FROM orders
GROUP BY customer_id
ORDER BY segment;
\`\`\`

### Category Performance

\`\`\`sql
-- Which product categories generate the most revenue?
SELECT
  p.category,
  COUNT(DISTINCT o.id)            AS total_orders,
  SUM(oi.quantity)                AS total_units,
  ROUND(SUM(oi.quantity * oi.price), 2) AS total_revenue,
  ROUND(AVG(oi.price), 2)         AS avg_unit_price
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'completed'
GROUP BY p.category
HAVING SUM(oi.quantity * oi.price) > 1000   -- only categories with >$1000 revenue
ORDER BY total_revenue DESC;
\`\`\`

## Complete SQL Execution Order

Now you know all the major SQL clauses. Here's the full execution order:

\`\`\`
Written order:
  SELECT   → what columns/aggregates to return
  FROM     → which table(s)
  JOIN     → combine with other tables
  WHERE    → filter rows
  GROUP BY → group rows
  HAVING   → filter groups
  ORDER BY → sort results
  LIMIT    → cap number of results

Execution order (different from written order!):
  1. FROM + JOIN    → get all rows from joined tables
  2. WHERE          → filter individual rows
  3. GROUP BY       → form groups
  4. HAVING         → filter groups
  5. SELECT         → compute output columns/aggregates
  6. DISTINCT       → remove duplicates (if used)
  7. ORDER BY       → sort
  8. LIMIT/OFFSET   → paginate

Why this matters:
  Can't use SELECT alias in WHERE (WHERE runs before SELECT)
  Can't use aggregate in WHERE (aggregates computed in step 5)
  CAN use aggregate in HAVING (HAVING runs after GROUP BY, with aggregates)
  CAN use SELECT alias in ORDER BY (ORDER BY runs after SELECT)
\`\`\`

## Quick Reference

\`\`\`sql
-- Aggregate functions
COUNT(*)           -- count all rows
COUNT(column)      -- count non-NULL values
COUNT(DISTINCT col)-- count unique non-NULL values
SUM(column)        -- sum of values
AVG(column)        -- average of values
MAX(column)        -- highest value
MIN(column)        -- lowest value
ROUND(value, n)    -- round to n decimal places

-- GROUP BY
SELECT col, AGG(col2)
FROM table
GROUP BY col;

-- HAVING (filter groups)
SELECT col, COUNT(*)
FROM table
GROUP BY col
HAVING COUNT(*) > 5;

-- WHERE + GROUP BY + HAVING together
SELECT col, SUM(amount)
FROM table
WHERE date >= '2024-01-01'    -- filter rows first
GROUP BY col                  -- then group
HAVING SUM(amount) > 100      -- then filter groups
ORDER BY SUM(amount) DESC;
\`\`\`
`,

  fr: `# Agrégations

## Que sont les agrégations ?

\`\`\`
Sans agrégation (lignes individuelles) :
  COUNT(*) = 4
  SUM(total) = 194.96
  AVG(total) = 48.74
  MAX(total) = 99.99
  MIN(total) = 14.99
\`\`\`

## Les cinq fonctions d'agrégation essentielles

\`\`\`sql
-- COUNT : combien ?
SELECT COUNT(*) FROM commandes;          -- toutes les lignes
SELECT COUNT(téléphone) FROM clients;    -- seulement les non-NULL
SELECT COUNT(DISTINCT client_id) FROM commandes;  -- valeurs uniques

-- SUM : total
SELECT SUM(total) FROM commandes;

-- AVG : moyenne
SELECT ROUND(AVG(total), 2) FROM commandes;

-- MAX et MIN : le plus haut et le plus bas
SELECT MAX(total) FROM commandes;
SELECT MIN(total) FROM commandes;
\`\`\`

## GROUP BY — Agréger par catégorie

\`\`\`sql
-- Combien de commandes chaque client a-t-il ?
SELECT 
  client_id,
  COUNT(*) AS nombre_commandes,
  SUM(total) AS total_dépensé
FROM commandes
GROUP BY client_id
ORDER BY total_dépensé DESC;

-- RÈGLE : chaque colonne dans SELECT doit soit être dans GROUP BY,
--         soit être dans une fonction d'agrégation
\`\`\`

## HAVING — Filtrer les groupes

\`\`\`sql
-- WHERE filtre les lignes individuelles AVANT le groupement
-- HAVING filtre les groupes APRÈS l'agrégation

-- Clients ayant passé PLUS DE 1 commande
SELECT
  client_id,
  COUNT(*) AS nombre_commandes
FROM commandes
GROUP BY client_id
HAVING COUNT(*) > 1;

-- Exemple complet avec WHERE et HAVING
SELECT
  client_id,
  SUM(total) AS total_dépensé
FROM commandes
WHERE créé_le >= '2024-01-01'     -- filtrer les lignes D'ABORD
GROUP BY client_id
HAVING SUM(total) > 50            -- puis filtrer les groupes
ORDER BY total_dépensé DESC;
\`\`\`

## Ordre d'exécution SQL complet

\`\`\`
Ordre d'exécution :
  1. FROM + JOIN    → obtenir toutes les lignes des tables jointes
  2. WHERE          → filtrer les lignes individuelles
  3. GROUP BY       → former les groupes
  4. HAVING         → filtrer les groupes
  5. SELECT         → calculer les colonnes de sortie
  6. DISTINCT       → supprimer les doublons
  7. ORDER BY       → trier
  8. LIMIT/OFFSET   → paginer

Pourquoi c'est important :
  Impossible d'utiliser un alias SELECT dans WHERE (WHERE s'exécute avant SELECT)
  Impossible d'utiliser une agrégation dans WHERE
  POSSIBLE d'utiliser une agrégation dans HAVING
  POSSIBLE d'utiliser un alias SELECT dans ORDER BY
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "What is the difference between COUNT(*) and COUNT(phone)?",
      options: [
        "COUNT(*) is faster; COUNT(phone) is more accurate",
        "COUNT(*) counts every row including those with NULL values. COUNT(phone) counts only rows where the phone column is NOT NULL — skipping rows where phone has no value.",
        "COUNT(*) counts columns; COUNT(phone) counts rows",
        "There is no difference — both return the same result",
      ],
      correct: 1,
    },
    {
      question:
        "Why does this query fail: SELECT customer_id, total FROM orders GROUP BY customer_id?",
      options: [
        "You cannot use GROUP BY with SELECT",
        "customer_id must be in the WHERE clause when using GROUP BY",
        "The column 'total' is neither in the GROUP BY clause nor inside an aggregate function — the database doesn't know which total to show when multiple rows are grouped together",
        "You need to add ORDER BY before GROUP BY",
      ],
      correct: 2,
    },
    {
      question: "What is the difference between WHERE and HAVING?",
      options: [
        "WHERE is for text conditions; HAVING is for numeric conditions",
        "WHERE filters individual rows BEFORE grouping (cannot use aggregate functions). HAVING filters groups AFTER aggregation (can use aggregate functions like COUNT, SUM). WHERE runs in step 2, HAVING runs in step 4.",
        "WHERE is used with SELECT; HAVING is used with GROUP BY",
        "There is no practical difference — you can use either one",
      ],
      correct: 1,
    },
    {
      question:
        "You want to find all product categories that generated more than $1000 in revenue. Which clause do you use to filter?",
      options: [
        "WHERE SUM(revenue) > 1000 — before the GROUP BY",
        "HAVING SUM(revenue) > 1000 — after the GROUP BY, because you need to aggregate first to know the total revenue per category",
        "LIMIT the results to only categories over $1000",
        "WHERE category_revenue > 1000 using a subquery",
      ],
      correct: 1,
    },
    {
      question:
        "What does AVG(total) return if some rows have NULL for the total column?",
      options: [
        "It returns NULL because any calculation with NULL returns NULL",
        "It returns 0 for the NULL rows and includes them in the average",
        "AVG ignores NULL values — it calculates the average of only the non-NULL rows, dividing by the count of non-NULL rows only",
        "It returns an error because NULL values are not allowed in numeric calculations",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question: "Quelle est la différence entre COUNT(*) et COUNT(téléphone) ?",
      options: [
        "COUNT(*) est plus rapide ; COUNT(téléphone) est plus précis",
        "COUNT(*) compte chaque ligne y compris celles avec des valeurs NULL. COUNT(téléphone) compte uniquement les lignes où la colonne téléphone n'est PAS NULL — sautant les lignes sans numéro de téléphone.",
        "COUNT(*) compte les colonnes ; COUNT(téléphone) compte les lignes",
        "Il n'y a pas de différence — les deux retournent le même résultat",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi cette requête échoue-t-elle : SELECT client_id, total FROM commandes GROUP BY client_id ?",
      options: [
        "Vous ne pouvez pas utiliser GROUP BY avec SELECT",
        "client_id doit être dans la clause WHERE lors de l'utilisation de GROUP BY",
        "La colonne 'total' n'est ni dans la clause GROUP BY ni dans une fonction d'agrégation — la base de données ne sait pas quel total afficher quand plusieurs lignes sont groupées ensemble",
        "Vous devez ajouter ORDER BY avant GROUP BY",
      ],
      correct: 2,
    },
    {
      question: "Quelle est la différence entre WHERE et HAVING ?",
      options: [
        "WHERE est pour les conditions texte ; HAVING est pour les conditions numériques",
        "WHERE filtre les lignes individuelles AVANT le groupement (ne peut pas utiliser des fonctions d'agrégation). HAVING filtre les groupes APRÈS l'agrégation (peut utiliser COUNT, SUM, etc.). WHERE s'exécute à l'étape 2, HAVING à l'étape 4.",
        "WHERE est utilisé avec SELECT ; HAVING est utilisé avec GROUP BY",
        "Il n'y a pas de différence pratique — vous pouvez utiliser l'un ou l'autre",
      ],
      correct: 1,
    },
    {
      question:
        "Vous voulez trouver toutes les catégories de produits ayant généré plus de 1000€ de revenus. Quelle clause utilisez-vous pour filtrer ?",
      options: [
        "WHERE SUM(revenu) > 1000 — avant le GROUP BY",
        "HAVING SUM(revenu) > 1000 — après le GROUP BY, car vous devez d'abord agréger pour connaître le revenu total par catégorie",
        "LIMIT les résultats aux seules catégories dépassant 1000€",
        "WHERE revenu_catégorie > 1000 en utilisant une sous-requête",
      ],
      correct: 1,
    },
    {
      question:
        "Que retourne AVG(total) si certaines lignes ont NULL pour la colonne total ?",
      options: [
        "Il retourne NULL car tout calcul avec NULL retourne NULL",
        "Il retourne 0 pour les lignes NULL et les inclut dans la moyenne",
        "AVG ignore les valeurs NULL — il calcule la moyenne uniquement des lignes non-NULL, en divisant par le nombre de lignes non-NULL seulement",
        "Il retourne une erreur car les valeurs NULL ne sont pas autorisées dans les calculs numériques",
      ],
      correct: 2,
    },
  ],
};
