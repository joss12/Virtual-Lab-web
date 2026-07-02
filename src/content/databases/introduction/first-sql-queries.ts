export const content = {
  en: `# Your First SQL Queries

## What Is SQL?

SQL (Structured Query Language) is the language you use to talk to a relational database. It was invented in the 1970s at IBM and has been the standard ever since. Almost every company on earth uses SQL somewhere.

\`\`\`
SQL is:
  ✓ Declarative: you say WHAT you want, not HOW to get it
  ✓ English-like: reads almost like a sentence
  ✓ Universal: works on PostgreSQL, MySQL, SQLite, SQL Server (with minor differences)
  ✓ Powerful: simple queries to extremely complex analytics, all in one language

"Give me the names of all customers from France who spent more than 100 euros"
becomes:
  SELECT name FROM customers WHERE country = 'FR' AND total > 100;
\`\`\`

## Your First SELECT Statement

SELECT is the most important SQL command. It retrieves data from the database.

\`\`\`sql
-- Get everything from the products table
SELECT * FROM products;

-- The * means "all columns"
-- Result:
-- id | name            | price | category | in_stock
-- ---+-----------------+-------+----------+---------
--  1 | Wireless Mouse  | 29.99 | tech     | true
--  2 | Desk Lamp       | 49.99 | office   | true
--  3 | USB Hub         | 19.99 | tech     | false
\`\`\`

### SELECT Specific Columns

\`\`\`sql
-- Get only name and price (avoid fetching data you don't need)
SELECT name, price FROM products;

-- Result:
-- name            | price
-- ----------------+-------
-- Wireless Mouse  | 29.99
-- Desk Lamp       | 49.99
-- USB Hub         | 19.99
\`\`\`

### Rename Columns with AS

\`\`\`sql
-- Give columns friendlier names in the result
SELECT 
  name        AS product_name,
  price       AS price_usd,
  in_stock    AS available
FROM products;

-- Result:
-- product_name    | price_usd | available
-- ----------------+-----------+----------
-- Wireless Mouse  | 29.99     | true
-- Desk Lamp       | 49.99     | true
-- USB Hub         | 19.99     | false
\`\`\`

### Do Math in SELECT

\`\`\`sql
-- Calculate a discounted price
SELECT 
  name,
  price,
  price * 0.9 AS discounted_price,   -- 10% discount
  price * 0.9 - price AS savings      -- how much you save
FROM products;

-- Result:
-- name            | price | discounted_price | savings
-- ----------------+-------+-----------------+---------
-- Wireless Mouse  | 29.99 | 26.991          | -2.999
-- Desk Lamp       | 49.99 | 44.991          | -4.999
-- USB Hub         | 19.99 | 17.991          | -1.999
\`\`\`

## Filtering with WHERE

WHERE narrows down which rows to return.

\`\`\`sql
-- Only products in the tech category
SELECT * FROM products WHERE category = 'tech';

-- Result:
-- id | name           | price | category | in_stock
-- ---+----------------+-------+----------+---------
--  1 | Wireless Mouse | 29.99 | tech     | true
--  3 | USB Hub        | 19.99 | tech     | false
\`\`\`

### Comparison Operators

\`\`\`sql
-- Equal to
SELECT * FROM products WHERE category = 'tech';

-- Not equal to
SELECT * FROM products WHERE category != 'tech';
-- or
SELECT * FROM products WHERE category <> 'tech';

-- Greater than / less than
SELECT * FROM products WHERE price > 25;
SELECT * FROM products WHERE price < 30;
SELECT * FROM products WHERE price >= 29.99;
SELECT * FROM products WHERE price <= 29.99;

-- Between (inclusive on both ends)
SELECT * FROM products WHERE price BETWEEN 20 AND 40;
-- Same as: WHERE price >= 20 AND price <= 40
\`\`\`

### Combining Conditions with AND / OR / NOT

\`\`\`sql
-- Both conditions must be true (AND)
SELECT * FROM products 
WHERE category = 'tech' AND in_stock = true;

-- At least one condition must be true (OR)
SELECT * FROM products 
WHERE category = 'tech' OR price < 25;

-- Condition must be false (NOT)
SELECT * FROM products 
WHERE NOT in_stock = true;
-- Same as: WHERE in_stock = false

-- Combining AND and OR (use parentheses to be clear!)
SELECT * FROM products
WHERE category = 'tech' AND (price < 25 OR in_stock = false);

-- Without parentheses AND has higher priority than OR, which can be confusing
-- Always use parentheses when mixing AND and OR
\`\`\`

### Filtering Text with LIKE

\`\`\`sql
-- Find products whose name contains "Mouse"
SELECT * FROM products WHERE name LIKE '%Mouse%';

-- % = wildcard (matches any number of characters)
-- _ = matches exactly one character

-- Starts with "Wire"
SELECT * FROM products WHERE name LIKE 'Wire%';

-- Ends with "Hub"
SELECT * FROM products WHERE name LIKE '%Hub';

-- Exactly 3 characters
SELECT * FROM products WHERE category LIKE '___';

-- Case-insensitive search (PostgreSQL)
SELECT * FROM products WHERE name ILIKE '%mouse%';
-- ILIKE: case-insensitive LIKE (PostgreSQL only)
-- In MySQL: LIKE is case-insensitive by default for most collations
\`\`\`

### Filtering with IN

\`\`\`sql
-- Product is in one of these categories
SELECT * FROM products 
WHERE category IN ('tech', 'office');

-- Same as:
SELECT * FROM products 
WHERE category = 'tech' OR category = 'office';

-- NOT IN
SELECT * FROM products 
WHERE category NOT IN ('tech', 'office');
\`\`\`

### Filtering NULL Values

\`\`\`sql
-- Rows where description is NULL (no description provided)
SELECT * FROM products WHERE description IS NULL;

-- Rows where description EXISTS (is not null)
SELECT * FROM products WHERE description IS NOT NULL;

-- NEVER use = NULL or != NULL:
SELECT * FROM products WHERE description = NULL;    -- ✗ always 0 rows
SELECT * FROM products WHERE description != NULL;   -- ✗ always 0 rows
\`\`\`

## Sorting with ORDER BY

ORDER BY controls the order of results.

\`\`\`sql
-- Sort by price, cheapest first (ASC = ascending, default)
SELECT * FROM products ORDER BY price ASC;
SELECT * FROM products ORDER BY price;        -- ASC is default

-- Sort by price, most expensive first (DESC = descending)
SELECT * FROM products ORDER BY price DESC;

-- Sort by category alphabetically, then by price within each category
SELECT * FROM products ORDER BY category ASC, price DESC;

-- Result:
-- id | name            | price | category
-- ---+-----------------+-------+---------
--  2 | Desk Lamp       | 49.99 | office   ← office category
--  1 | Wireless Mouse  | 29.99 | tech     ← tech category, higher price first
--  3 | USB Hub         | 19.99 | tech     ← tech category, lower price
\`\`\`

## Limiting Results with LIMIT

\`\`\`sql
-- Get only the first 5 results
SELECT * FROM products LIMIT 5;

-- Get the 3 most expensive products
SELECT * FROM products ORDER BY price DESC LIMIT 3;

-- Pagination: skip the first 10 rows, get the next 10
SELECT * FROM products LIMIT 10 OFFSET 10;
-- OFFSET 10 = skip 10 rows
-- Page 1: LIMIT 10 OFFSET 0
-- Page 2: LIMIT 10 OFFSET 10
-- Page 3: LIMIT 10 OFFSET 20

-- MySQL/PostgreSQL syntax (both work):
SELECT * FROM products LIMIT 10 OFFSET 20;

-- SQL Server syntax:
SELECT * FROM products ORDER BY id OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;
\`\`\`

## Removing Duplicates with DISTINCT

\`\`\`sql
-- What categories do we have? (with duplicates)
SELECT category FROM products;
-- tech
-- office
-- tech    ← duplicate!
-- tech    ← duplicate!

-- What UNIQUE categories do we have?
SELECT DISTINCT category FROM products;
-- office
-- tech

-- Count of distinct categories
SELECT COUNT(DISTINCT category) FROM products;
-- 2
\`\`\`

## Putting It All Together

\`\`\`sql
-- Real-world query:
-- "Show me the name and price of all in-stock tech products
--  that cost between $10 and $50, sorted by price"

SELECT 
  name,
  price
FROM products
WHERE 
  category = 'tech'
  AND in_stock = true
  AND price BETWEEN 10 AND 50
ORDER BY price ASC;

-- Result:
-- name            | price
-- ----------------+-------
-- USB Hub         | 19.99   ← wait, USB Hub is out of stock!
-- Wireless Mouse  | 29.99

-- Actually USB Hub has in_stock = false, so it would be filtered out:
-- name            | price
-- ----------------+-------
-- Wireless Mouse  | 29.99
\`\`\`

## SQL Execution Order

SQL is read by the database in a specific order that's different from how you write it:

\`\`\`
Written order:     SELECT → FROM → WHERE → ORDER BY → LIMIT
Execution order:   FROM → WHERE → SELECT → ORDER BY → LIMIT

FROM products:              Start with all rows in products table
WHERE category = 'tech':    Filter: keep only tech rows
SELECT name, price:         Choose which columns to include
ORDER BY price:             Sort the results
LIMIT 5:                    Take only the first 5

Why this matters:
  You CANNOT use a column alias in WHERE:
  
  SELECT price * 0.9 AS discounted FROM products WHERE discounted < 25;
  -- ERROR: column "discounted" does not exist
  -- WHERE runs before SELECT, so "discounted" alias doesn't exist yet!
  
  Correct:
  SELECT price * 0.9 AS discounted FROM products WHERE price * 0.9 < 25;
\`\`\`

## Quick Reference

\`\`\`sql
-- Basic structure
SELECT column1, column2    -- what columns
FROM table_name            -- from which table
WHERE condition            -- filter rows
ORDER BY column ASC/DESC   -- sort results
LIMIT n;                   -- max rows to return

-- Comparison operators
=     equal
!=    not equal (also: <>)
>     greater than
<     less than
>=    greater than or equal
<=    less than or equal

-- Text matching
LIKE '%pattern%'    contains
LIKE 'pattern%'     starts with
LIKE '%pattern'     ends with

-- Combining conditions
AND   both must be true
OR    at least one must be true
NOT   must be false

-- Special filters
IN ('a', 'b', 'c')      matches any of these values
BETWEEN x AND y          between two values (inclusive)
IS NULL                  has no value
IS NOT NULL              has a value
DISTINCT                 remove duplicates
\`\`\`
`,

  fr: `# Vos premières requêtes SQL

## Qu'est-ce que SQL ?

SQL (Structured Query Language) est le langage que vous utilisez pour parler à une base de données relationnelle. Inventé dans les années 1970 chez IBM, il est devenu le standard depuis.

\`\`\`
SQL est :
  ✓ Déclaratif : vous dites CE QUE vous voulez, pas COMMENT l'obtenir
  ✓ Proche de l'anglais : se lit presque comme une phrase
  ✓ Universel : fonctionne sur PostgreSQL, MySQL, SQLite, SQL Server
\`\`\`

## Votre premier SELECT

\`\`\`sql
-- Récupérer tout de la table produits
SELECT * FROM produits;

-- Récupérer uniquement nom et prix
SELECT nom, prix FROM produits;

-- Renommer les colonnes avec AS
SELECT nom AS nom_produit, prix AS prix_euro FROM produits;

-- Faire des calculs
SELECT nom, prix, prix * 0.9 AS prix_remisé FROM produits;
\`\`\`

## Filtrer avec WHERE

\`\`\`sql
-- Uniquement les produits de la catégorie tech
SELECT * FROM produits WHERE catégorie = 'tech';

-- Opérateurs de comparaison
SELECT * FROM produits WHERE prix > 25;
SELECT * FROM produits WHERE prix BETWEEN 20 AND 40;
SELECT * FROM produits WHERE catégorie != 'tech';

-- Combiner les conditions
SELECT * FROM produits WHERE catégorie = 'tech' AND en_stock = true;
SELECT * FROM produits WHERE catégorie = 'tech' OR prix < 25;

-- Recherche de texte avec LIKE
SELECT * FROM produits WHERE nom LIKE '%Souris%';
-- % = joker (correspond à n'importe quel nombre de caractères)

-- Filtrer avec IN
SELECT * FROM produits WHERE catégorie IN ('tech', 'bureau');

-- Filtrer les valeurs NULL
SELECT * FROM produits WHERE description IS NULL;
SELECT * FROM produits WHERE description IS NOT NULL;
\`\`\`

## Trier avec ORDER BY

\`\`\`sql
-- Trier par prix, du moins cher au plus cher
SELECT * FROM produits ORDER BY prix ASC;

-- Trier par prix, du plus cher au moins cher
SELECT * FROM produits ORDER BY prix DESC;

-- Trier par plusieurs colonnes
SELECT * FROM produits ORDER BY catégorie ASC, prix DESC;
\`\`\`

## Limiter les résultats avec LIMIT

\`\`\`sql
-- Obtenir uniquement les 5 premiers résultats
SELECT * FROM produits LIMIT 5;

-- Pagination : sauter les 10 premières lignes, obtenir les 10 suivantes
SELECT * FROM produits LIMIT 10 OFFSET 10;
\`\`\`

## Ordre d'exécution SQL

\`\`\`
Ordre d'écriture :     SELECT → FROM → WHERE → ORDER BY → LIMIT
Ordre d'exécution :    FROM → WHERE → SELECT → ORDER BY → LIMIT

Pourquoi c'est important :
  Vous NE POUVEZ PAS utiliser un alias de colonne dans WHERE :
  
  SELECT prix * 0.9 AS remisé FROM produits WHERE remisé < 25;
  -- ERREUR : WHERE s'exécute avant SELECT, donc "remisé" n'existe pas encore !
  
  Correct :
  SELECT prix * 0.9 AS remisé FROM produits WHERE prix * 0.9 < 25;
\`\`\`

## Référence rapide

\`\`\`sql
-- Structure de base
SELECT colonne1, colonne2
FROM nom_table
WHERE condition
ORDER BY colonne ASC/DESC
LIMIT n;

-- Opérateurs de comparaison
=    égal
!=   différent (aussi : <>)
>    supérieur à
<    inférieur à
>=   supérieur ou égal
<=   inférieur ou égal

-- Correspondance de texte
LIKE '%motif%'   contient
LIKE 'motif%'    commence par
LIKE '%motif'    se termine par

-- Combiner les conditions
AND   les deux doivent être vraies
OR    au moins une doit être vraie
NOT   doit être fausse

-- Filtres spéciaux
IN ('a', 'b', 'c')   correspond à l'une de ces valeurs
BETWEEN x AND y      entre deux valeurs (inclus)
IS NULL              n'a pas de valeur
IS NOT NULL          a une valeur
DISTINCT             supprimer les doublons
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "What does SELECT * FROM products mean?",
      options: [
        "Delete all rows from the products table",
        "Retrieve all columns and all rows from the products table — the * means all columns",
        "Count the number of rows in the products table",
        "Create a new table called products",
      ],
      correct: 1,
    },
    {
      question:
        "Which query correctly finds all products that cost more than $25 AND are in stock?",
      options: [
        "SELECT * FROM products WHERE price > 25 OR in_stock = true",
        "SELECT * FROM products WHERE price > 25 AND in_stock = true",
        "SELECT * FROM products WHERE price > 25, in_stock = true",
        "SELECT * FROM products WHERE price > 25 FILTER in_stock = true",
      ],
      correct: 1,
    },
    {
      question: "What does LIKE '%mouse%' match?",
      options: [
        "Only the exact text 'mouse' (case-sensitive)",
        "Any text that starts with 'mouse'",
        "Any text that contains 'mouse' anywhere — the % wildcard matches zero or more characters on either side",
        "Any text that is exactly 5 characters long",
      ],
      correct: 2,
    },
    {
      question:
        "Why does this query fail: SELECT price * 0.9 AS sale_price FROM products WHERE sale_price < 25?",
      options: [
        "You cannot do math in a SELECT statement",
        "The alias sale_price cannot be used in WHERE because SQL executes FROM and WHERE before SELECT — the alias doesn't exist yet when WHERE runs",
        "The LIKE operator is required when filtering calculated columns",
        "You need to use HAVING instead of WHERE for calculated columns",
      ],
      correct: 1,
    },
    {
      question:
        "What is the difference between LIMIT 10 OFFSET 20 and just LIMIT 10?",
      options: [
        "OFFSET makes the query run 20 times faster",
        "LIMIT 10 returns the first 10 rows. LIMIT 10 OFFSET 20 skips the first 20 rows and returns the next 10 — used for pagination (page 3 of 10-results-per-page would be OFFSET 20)",
        "OFFSET 20 returns only rows where the ID is greater than 20",
        "There is no difference — OFFSET is ignored when used with LIMIT",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Que signifie SELECT * FROM produits ?",
      options: [
        "Supprimer toutes les lignes de la table produits",
        "Récupérer toutes les colonnes et toutes les lignes de la table produits — le * signifie toutes les colonnes",
        "Compter le nombre de lignes dans la table produits",
        "Créer une nouvelle table appelée produits",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle requête trouve correctement tous les produits coûtant plus de 25€ ET en stock ?",
      options: [
        "SELECT * FROM produits WHERE prix > 25 OR en_stock = true",
        "SELECT * FROM produits WHERE prix > 25 AND en_stock = true",
        "SELECT * FROM produits WHERE prix > 25, en_stock = true",
        "SELECT * FROM produits WHERE prix > 25 FILTER en_stock = true",
      ],
      correct: 1,
    },
    {
      question: "Que correspond LIKE '%souris%' ?",
      options: [
        "Uniquement le texte exact 'souris' (sensible à la casse)",
        "N'importe quel texte qui commence par 'souris'",
        "N'importe quel texte qui contient 'souris' n'importe où — le joker % correspond à zéro ou plusieurs caractères de chaque côté",
        "N'importe quel texte qui fait exactement 6 caractères",
      ],
      correct: 2,
    },
    {
      question:
        "Pourquoi cette requête échoue-t-elle : SELECT prix * 0.9 AS prix_solde FROM produits WHERE prix_solde < 25 ?",
      options: [
        "Vous ne pouvez pas faire de calculs dans une instruction SELECT",
        "L'alias prix_solde ne peut pas être utilisé dans WHERE car SQL exécute FROM et WHERE avant SELECT — l'alias n'existe pas encore quand WHERE s'exécute",
        "L'opérateur LIKE est requis lors du filtrage de colonnes calculées",
        "Vous devez utiliser HAVING au lieu de WHERE pour les colonnes calculées",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle est la différence entre LIMIT 10 OFFSET 20 et juste LIMIT 10 ?",
      options: [
        "OFFSET rend la requête 20 fois plus rapide",
        "LIMIT 10 retourne les 10 premières lignes. LIMIT 10 OFFSET 20 saute les 20 premières lignes et retourne les 10 suivantes — utilisé pour la pagination",
        "OFFSET 20 retourne uniquement les lignes où l'ID est supérieur à 20",
        "Il n'y a pas de différence — OFFSET est ignoré quand utilisé avec LIMIT",
      ],
      correct: 1,
    },
  ],
};
