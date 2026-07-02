export const content = {
  en: `# Joins

## Why Joins Exist

In lesson 5, we learned that relational databases store each piece of information once and reference it elsewhere. This means your data is spread across multiple tables. **Joins** are how you bring that data back together when you need it.

\`\`\`
Without joins (bad approach — storing everything in one table):
  orders
  ┌────┬────────────────┬──────────────────────┬────────┐
  │ id │ customer_name  │ customer_email        │ total  │
  ├────┼────────────────┼──────────────────────┼────────┤
  │  1 │ Alice          │ alice@example.com     │ 49.99  │
  │  2 │ Alice          │ alice@example.com     │ 29.99  │  ← duplicated!
  │  3 │ Bob            │ bob@example.com       │ 99.99  │
  └────┴────────────────┴──────────────────────┴────────┘
  
  Problem: if Alice changes her email, you update it in 2 places.
           What if you forget one? Inconsistency.

With joins (proper approach — data in separate tables):
  customers                     orders
  ┌────┬───────┬──────────────┐  ┌────┬─────────────┬────────┐
  │ id │ name  │ email        │  │ id │ customer_id │ total  │
  ├────┼───────┼──────────────┤  ├────┼─────────────┼────────┤
  │  1 │ Alice │ alice@ex.com │  │  1 │      1      │ 49.99  │
  │  2 │ Bob   │ bob@ex.com   │  │  2 │      1      │ 29.99  │
  └────┴───────┴──────────────┘  │  3 │      2      │ 99.99  │
                                  └────┴─────────────┴────────┘
  
  Email stored ONCE. JOIN combines them when needed.
\`\`\`

## INNER JOIN — Only Matching Rows

INNER JOIN returns rows where the condition matches in **both** tables. If a row in one table has no match in the other, it's excluded.

\`\`\`sql
-- Get orders WITH their customer names
SELECT 
  orders.id        AS order_id,
  customers.name   AS customer_name,
  orders.total
FROM orders
INNER JOIN customers ON orders.customer_id = customers.id;

-- Result:
-- order_id | customer_name | total
-- ---------+---------------+-------
--        1 | Alice         | 49.99
--        2 | Alice         | 29.99
--        3 | Bob           | 99.99
\`\`\`

### Breaking Down the Syntax

\`\`\`sql
FROM orders                              -- start with orders table
INNER JOIN customers                     -- join with customers table
ON orders.customer_id = customers.id     -- the condition: how they connect

-- ON clause: which columns link the two tables?
-- orders.customer_id must equal customers.id
-- This is always foreign_key = primary_key
\`\`\`

### Using Table Aliases (Makes Queries Cleaner)

\`\`\`sql
-- Typing "orders.id" and "customers.name" everywhere gets verbose.
-- Use aliases: o for orders, c for customers

SELECT 
  o.id     AS order_id,
  c.name   AS customer_name,
  c.email,
  o.total,
  o.created_at
FROM orders o                       -- o is an alias for orders
INNER JOIN customers c              -- c is an alias for customers
ON o.customer_id = c.id;
\`\`\`

### INNER JOIN Filters Out Non-Matches

\`\`\`sql
-- Setup: Carol exists in customers but has NO orders
-- David has an order but his customer record was deleted (shouldn't happen
-- with foreign keys, but let's say it did)

customers:                orders:
id | name                 id | customer_id | total
---+------                ---+-------------+------
 1 | Alice                 1 |      1      | 49.99
 2 | Bob                   2 |      1      | 29.99
 3 | Carol  ← no orders    3 |      2      | 99.99
                           4 |    999      | 14.99  ← no matching customer

INNER JOIN result:
-- Only rows that have a match in BOTH tables:
-- order_id | customer_name | total
-- ---------+---------------+------
--        1 | Alice         | 49.99
--        2 | Alice         | 29.99
--        3 | Bob           | 99.99
-- Carol is excluded (no orders)
-- Order #4 is excluded (no matching customer)
\`\`\`

## LEFT JOIN — Keep All Rows From the Left Table

LEFT JOIN returns ALL rows from the left table (the one after FROM), plus matching rows from the right table. If there's no match, the right table columns are NULL.

\`\`\`sql
-- Get ALL customers, including those with no orders
SELECT 
  c.name          AS customer_name,
  o.id            AS order_id,
  o.total
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;

-- Result:
-- customer_name | order_id | total
-- --------------+----------+-------
-- Alice         |        1 | 49.99
-- Alice         |        2 | 29.99
-- Bob           |        3 | 99.99
-- Carol         |     NULL |  NULL  ← Carol has no orders, but she's here!

-- LEFT JOIN = "show me all customers, and their orders IF they have any"
\`\`\`

### Finding Rows with No Match (Very Useful!)

\`\`\`sql
-- Find customers who have NEVER placed an order
SELECT c.name, c.email
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;        -- NULL means no matching order was found

-- Result:
-- name  | email
-- ------+------------------
-- Carol | carol@example.com

-- Pattern: LEFT JOIN + WHERE right_table.id IS NULL
-- = "find rows in the left table that have NO match in the right table"
-- Very common in real applications!
\`\`\`

### More LEFT JOIN Examples

\`\`\`sql
-- Count orders per customer (including customers with 0 orders)
SELECT 
  c.name,
  COUNT(o.id) AS order_count    -- COUNT(o.id) counts non-NULL values
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY order_count DESC;

-- Result:
-- name  | order_count
-- ------+------------
-- Alice |           2
-- Bob   |           1
-- Carol |           0   ← included! COUNT of NULLs = 0

-- If we used INNER JOIN instead:
-- Carol would be missing from the results entirely
\`\`\`

## RIGHT JOIN — Keep All Rows From the Right Table

RIGHT JOIN is the mirror image of LEFT JOIN. It keeps all rows from the right table.

\`\`\`sql
-- Same as our LEFT JOIN example, but reversed
SELECT 
  c.name,
  o.id    AS order_id,
  o.total
FROM orders o
RIGHT JOIN customers c ON o.customer_id = c.id;

-- This gives the SAME result as:
SELECT 
  c.name,
  o.id    AS order_id,
  o.total
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;

-- RIGHT JOIN is rarely used in practice.
-- Most developers always use LEFT JOIN and swap the table order instead.
-- It's clearer to read: "start with X, LEFT JOIN Y" than "RIGHT JOIN back to X"
\`\`\`

## FULL OUTER JOIN — Keep All Rows From Both Tables

FULL OUTER JOIN returns ALL rows from both tables. Unmatched rows get NULLs for the other table's columns.

\`\`\`sql
SELECT 
  c.name        AS customer_name,
  o.id          AS order_id,
  o.total
FROM customers c
FULL OUTER JOIN orders o ON c.id = o.customer_id;

-- Result (using our setup with Carol and order#4):
-- customer_name | order_id | total
-- --------------+----------+-------
-- Alice         |        1 | 49.99
-- Alice         |        2 | 29.99
-- Bob           |        3 | 99.99
-- Carol         |     NULL |  NULL  ← no orders
-- NULL          |        4 | 14.99  ← no matching customer

-- FULL OUTER JOIN: "show me everything, matched or not"
-- Less common than INNER and LEFT joins
-- MySQL does NOT support FULL OUTER JOIN directly
\`\`\`

## Joining More Than Two Tables

\`\`\`sql
-- Order details with customer name AND product names
-- Three tables: orders, customers, order_items, products

SELECT 
  c.name          AS customer,
  o.id            AS order_id,
  p.name          AS product,
  oi.quantity,
  oi.price        AS unit_price,
  oi.quantity * oi.price AS line_total
FROM orders o
JOIN customers c    ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON oi.product_id = p.id
WHERE o.id = 1;

-- Result:
-- customer | order_id | product         | quantity | unit_price | line_total
-- ---------+----------+-----------------+----------+------------+-----------
-- Alice    |        1 | Wireless Mouse  |        2 |      29.99 |      59.98
-- Alice    |        1 | USB Hub         |        1 |      19.99 |      19.99

-- JOIN = INNER JOIN (they are identical)
-- Most developers write just JOIN, not INNER JOIN
\`\`\`

## Self Join — Joining a Table to Itself

Sometimes you need to join a table to itself. Classic example: employees and their managers (both stored in the same table).

\`\`\`sql
CREATE TABLE employees (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100),
  manager_id INTEGER REFERENCES employees(id)  -- references same table!
);

-- Data:
-- id | name    | manager_id
-- ---+---------+-----------
--  1 | CEO     | NULL       ← no manager
--  2 | Alice   |    1       ← reports to CEO
--  3 | Bob     |    1       ← reports to CEO
--  4 | Carol   |    2       ← reports to Alice

-- Get each employee with their manager's name
SELECT 
  e.name       AS employee,
  m.name       AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
-- e = the employee, m = their manager (same table, different alias!)

-- Result:
-- employee | manager
-- ---------+---------
-- CEO      | NULL     ← CEO has no manager
-- Alice    | CEO
-- Bob      | CEO
-- Carol    | Alice
\`\`\`

## Visual Summary of Join Types

\`\`\`
INNER JOIN:        Only matching rows from both tables
  ┌───┐ ┌───┐
  │   │█│   │      █ = returned rows
  └───┘ └───┘

LEFT JOIN:         All rows from left + matches from right
  ┌───┐ ┌───┐
  │███│█│   │
  └───┘ └───┘

RIGHT JOIN:        Matches from left + all rows from right
  ┌───┐ ┌───┐
  │   │█│███│
  └───┘ └───┘

FULL OUTER JOIN:   All rows from both tables
  ┌───┐ ┌───┐
  │███│█│███│
  └───┘ └───┘
\`\`\`

## Common Mistakes with Joins

\`\`\`sql
-- Mistake 1: Forgetting the ON condition (CROSS JOIN — cartesian product)
SELECT * FROM customers, orders;
-- Returns EVERY customer paired with EVERY order
-- 3 customers × 10 orders = 30 rows (most of which are nonsense)
-- Always specify ON (or WHERE) for your join condition

-- Mistake 2: Ambiguous column names
SELECT id, name, total    -- which table's "id"? ERROR!
FROM customers
JOIN orders ON customers.id = orders.customer_id;

-- Fix: prefix with table name or alias
SELECT c.id, c.name, o.total
FROM customers c
JOIN orders o ON c.id = o.customer_id;

-- Mistake 3: Using INNER JOIN when you want LEFT JOIN
-- "Show me all customers and their order totals"
SELECT c.name, SUM(o.total) AS total_spent
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id   -- ✗ Carol missing!
GROUP BY c.id, c.name;

-- Fix:
SELECT c.name, COALESCE(SUM(o.total), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id    -- ✓ Carol shows 0
GROUP BY c.id, c.name;
-- COALESCE(x, 0) returns 0 if x is NULL
\`\`\`

## Quick Reference

\`\`\`sql
-- INNER JOIN (most common): matching rows only
SELECT * FROM a JOIN b ON a.id = b.a_id;

-- LEFT JOIN: all of a, matching b (NULLs if no match)
SELECT * FROM a LEFT JOIN b ON a.id = b.a_id;

-- Find rows in a with no match in b:
SELECT * FROM a LEFT JOIN b ON a.id = b.a_id WHERE b.id IS NULL;

-- Multiple joins:
SELECT * FROM a
JOIN b ON a.id = b.a_id
JOIN c ON b.id = c.b_id;

-- Self join:
SELECT e.name, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
\`\`\`
`,

  fr: `# Jointures

## Pourquoi les jointures existent

Dans la leçon 5, nous avons appris que les bases de données relationnelles stockent chaque information une seule fois et la référencent ailleurs. Les **jointures** permettent de rassembler ces données quand vous en avez besoin.

## INNER JOIN — Seulement les lignes correspondantes

INNER JOIN retourne les lignes où la condition correspond dans **les deux** tables.

\`\`\`sql
-- Obtenir les commandes AVEC les noms des clients
SELECT 
  o.id     AS id_commande,
  c.nom    AS nom_client,
  o.total
FROM commandes o
INNER JOIN clients c ON o.client_id = c.id;

-- Résultat :
-- id_commande | nom_client | total
-- ------------+------------+-------
--           1 | Alice      | 49.99
--           2 | Alice      | 29.99
--           3 | Bob        | 99.99
-- Carol est exclue (pas de commandes)
\`\`\`

## LEFT JOIN — Garder toutes les lignes de la table gauche

LEFT JOIN retourne TOUTES les lignes de la table gauche, plus les lignes correspondantes de la table droite. Si pas de correspondance, les colonnes de la table droite sont NULL.

\`\`\`sql
-- Obtenir TOUS les clients, y compris ceux sans commandes
SELECT 
  c.nom           AS nom_client,
  o.id            AS id_commande,
  o.total
FROM clients c
LEFT JOIN commandes o ON c.id = o.client_id;

-- Résultat :
-- nom_client | id_commande | total
-- -----------+-------------+-------
-- Alice      |           1 | 49.99
-- Alice      |           2 | 29.99
-- Bob        |           3 | 99.99
-- Carol      |        NULL |  NULL  ← Carol n'a pas de commandes mais elle est là !

-- Trouver les clients qui n'ont JAMAIS passé de commande
SELECT c.nom, c.email
FROM clients c
LEFT JOIN commandes o ON c.id = o.client_id
WHERE o.id IS NULL;
\`\`\`

## Jointure de plus de deux tables

\`\`\`sql
-- Détails de commande avec nom du client ET noms des produits
SELECT 
  c.nom           AS client,
  o.id            AS id_commande,
  p.nom           AS produit,
  oi.quantité,
  oi.prix         AS prix_unitaire
FROM commandes o
JOIN clients c      ON o.client_id = c.id
JOIN items_commande oi ON oi.commande_id = o.id
JOIN produits p     ON oi.produit_id = p.id
WHERE o.id = 1;
\`\`\`

## Auto-jointure — Joindre une table à elle-même

\`\`\`sql
-- Employés et leurs managers (dans la même table)
SELECT 
  e.nom       AS employé,
  m.nom       AS manager
FROM employés e
LEFT JOIN employés m ON e.manager_id = m.id;
-- e = l'employé, m = son manager (même table, alias différents !)
\`\`\`

## Résumé visuel des types de jointures

\`\`\`
INNER JOIN :       Seulement les lignes correspondantes des deux tables
LEFT JOIN :        Toutes les lignes de gauche + correspondances de droite
RIGHT JOIN :       Correspondances de gauche + toutes les lignes de droite
FULL OUTER JOIN :  Toutes les lignes des deux tables
\`\`\`

## Erreurs courantes avec les jointures

\`\`\`sql
-- Erreur 1 : Noms de colonnes ambigus
SELECT id, nom, total    -- quel id ? ERREUR !
FROM clients
JOIN commandes ON clients.id = commandes.client_id;

-- Correction : préfixer avec le nom de table ou alias
SELECT c.id, c.nom, o.total
FROM clients c
JOIN commandes o ON c.id = o.client_id;

-- Erreur 2 : INNER JOIN quand vous voulez LEFT JOIN
-- "Montrez-moi tous les clients et leurs totaux de commandes"
SELECT c.nom, SUM(o.total) AS total_dépensé
FROM clients c
INNER JOIN commandes o ON c.id = o.client_id   -- ✗ Carol manquante !
GROUP BY c.id, c.nom;

-- Correction :
SELECT c.nom, COALESCE(SUM(o.total), 0) AS total_dépensé
FROM clients c
LEFT JOIN commandes o ON c.id = o.client_id    -- ✓ Carol affiche 0
GROUP BY c.id, c.nom;
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "What is the key difference between INNER JOIN and LEFT JOIN?",
      options: [
        "INNER JOIN is faster than LEFT JOIN for all queries",
        "INNER JOIN only returns rows that have a match in BOTH tables — unmatched rows are excluded. LEFT JOIN returns ALL rows from the left table plus matching rows from the right table — rows with no match get NULL for the right table's columns.",
        "INNER JOIN can only join two tables; LEFT JOIN can join multiple tables",
        "INNER JOIN requires a primary key; LEFT JOIN works without keys",
      ],
      correct: 1,
    },
    {
      question:
        "You want to find all customers who have never placed an order. Which query achieves this?",
      options: [
        "SELECT * FROM customers INNER JOIN orders ON customers.id = orders.customer_id WHERE orders.id = 0",
        "SELECT * FROM customers LEFT JOIN orders ON customers.id = orders.customer_id WHERE orders.id IS NULL",
        "SELECT * FROM customers WHERE customer_id NOT IN orders",
        "SELECT * FROM customers MINUS SELECT customer_id FROM orders",
      ],
      correct: 1,
    },
    {
      question:
        "What happens if you forget the ON clause in a JOIN: SELECT * FROM customers, orders;?",
      options: [
        "The database returns an error because ON is required",
        "The database automatically finds the matching columns",
        "This produces a cross join (cartesian product) — every customer is paired with every order, returning customers × orders rows (e.g., 3 customers × 10 orders = 30 mostly nonsensical rows)",
        "The query returns only the first matching row from each table",
      ],
      correct: 2,
    },
    {
      question:
        "In a self join on the employees table, why do you need two aliases?",
      options: [
        "SQL requires aliases for all table names in a query",
        "You are joining the employees table to itself — one instance represents the employee and the other represents their manager. Without two different aliases (e.g., e and m), SQL would not know which instance of the table you're referring to.",
        "Aliases are needed to prevent circular references in the database",
        "The database creates a temporary copy of the table, and aliases distinguish the original from the copy",
      ],
      correct: 1,
    },
    {
      question:
        "Why does COUNT(o.id) return 0 for customers with no orders in a LEFT JOIN, while COUNT(*) would return 1?",
      options: [
        "COUNT(*) and COUNT(column) always return the same result",
        "COUNT(*) counts all rows including those with NULLs — a customer with no orders still produces a row (with NULL order columns), so COUNT(*) = 1. COUNT(o.id) counts only non-NULL values — since o.id is NULL for customers without orders, COUNT(o.id) = 0.",
        "COUNT(o.id) uses a different algorithm than COUNT(*) for performance reasons",
        "COUNT(*) is deprecated and should not be used",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Quelle est la différence clé entre INNER JOIN et LEFT JOIN ?",
      options: [
        "INNER JOIN est plus rapide que LEFT JOIN pour toutes les requêtes",
        "INNER JOIN retourne uniquement les lignes avec une correspondance dans LES DEUX tables — les lignes sans correspondance sont exclues. LEFT JOIN retourne TOUTES les lignes de la table gauche plus les lignes correspondantes de la table droite — les lignes sans correspondance obtiennent NULL pour les colonnes de la table droite.",
        "INNER JOIN ne peut joindre que deux tables ; LEFT JOIN peut joindre plusieurs tables",
        "INNER JOIN nécessite une clé primaire ; LEFT JOIN fonctionne sans clés",
      ],
      correct: 1,
    },
    {
      question:
        "Vous voulez trouver tous les clients qui n'ont jamais passé de commande. Quelle requête accomplit cela ?",
      options: [
        "SELECT * FROM clients INNER JOIN commandes ON clients.id = commandes.client_id WHERE commandes.id = 0",
        "SELECT * FROM clients LEFT JOIN commandes ON clients.id = commandes.client_id WHERE commandes.id IS NULL",
        "SELECT * FROM clients WHERE client_id NOT IN commandes",
        "SELECT * FROM clients MINUS SELECT client_id FROM commandes",
      ],
      correct: 1,
    },
    {
      question:
        "Que se passe-t-il si vous oubliez la clause ON dans un JOIN : SELECT * FROM clients, commandes; ?",
      options: [
        "La base de données retourne une erreur car ON est requis",
        "La base de données trouve automatiquement les colonnes correspondantes",
        "Cela produit une jointure croisée (produit cartésien) — chaque client est associé à chaque commande, retournant clients × commandes lignes (ex: 3 clients × 10 commandes = 30 lignes principalement insensées)",
        "La requête retourne uniquement la première ligne correspondante de chaque table",
      ],
      correct: 2,
    },
    {
      question:
        "Dans une auto-jointure sur la table employés, pourquoi avez-vous besoin de deux alias ?",
      options: [
        "SQL nécessite des alias pour tous les noms de tables dans une requête",
        "Vous joignez la table employés à elle-même — une instance représente l'employé et l'autre son manager. Sans deux alias différents (ex: e et m), SQL ne saurait pas à quelle instance de la table vous faites référence.",
        "Les alias sont nécessaires pour éviter les références circulaires dans la base de données",
        "La base de données crée une copie temporaire de la table, et les alias distinguent l'original de la copie",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi COUNT(o.id) retourne-t-il 0 pour les clients sans commandes dans un LEFT JOIN, alors que COUNT(*) retournerait 1 ?",
      options: [
        "COUNT(*) et COUNT(colonne) retournent toujours le même résultat",
        "COUNT(*) compte toutes les lignes y compris celles avec des NULL — un client sans commandes produit quand même une ligne (avec des colonnes de commandes NULL), donc COUNT(*) = 1. COUNT(o.id) ne compte que les valeurs non-NULL — puisque o.id est NULL pour les clients sans commandes, COUNT(o.id) = 0.",
        "COUNT(o.id) utilise un algorithme différent de COUNT(*) pour des raisons de performance",
        "COUNT(*) est déprécié et ne devrait pas être utilisé",
      ],
      correct: 1,
    },
  ],
};
