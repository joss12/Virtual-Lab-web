export const content = {
  en: `# Inserting & Modifying Data

## The Four Operations: CRUD

Every application that uses a database performs four fundamental operations:

\`\`\`
C — Create:   INSERT  → add new rows
R — Read:     SELECT  → retrieve rows (covered in lesson 3)
U — Update:   UPDATE  → modify existing rows
D — Delete:   DELETE  → remove rows

These are called CRUD operations — you'll hear this term constantly
in software development.
\`\`\`

## INSERT — Adding New Rows

### Basic INSERT

\`\`\`sql
-- Insert one row, specifying column names
INSERT INTO products (name, price, category, in_stock)
VALUES ('Mechanical Keyboard', 89.99, 'tech', true);

-- Always specify column names explicitly.
-- This way, if someone adds a new column to the table later,
-- your INSERT still works correctly.
\`\`\`

### INSERT Without Column Names (Not Recommended)

\`\`\`sql
-- This works but is fragile:
INSERT INTO products VALUES (4, 'Mechanical Keyboard', 89.99, 'tech', true, now());
-- If anyone adds, removes, or reorders columns: this breaks.
-- Always use the explicit form above.
\`\`\`

### Inserting Multiple Rows at Once

\`\`\`sql
-- Insert several rows in one query (much faster than one query per row)
INSERT INTO products (name, price, category, in_stock)
VALUES 
  ('Mechanical Keyboard', 89.99, 'tech', true),
  ('Monitor Stand',       35.00, 'office', true),
  ('Webcam HD',           59.99, 'tech', false),
  ('Cable Organizer',     12.99, 'office', true);

-- One INSERT with 4 rows = much faster than 4 separate INSERT statements
-- Because: 4 queries × (network roundtrip + transaction overhead) vs 1
\`\`\`

### INSERT with DEFAULT Values

\`\`\`sql
-- Columns with DEFAULT or NULL allowed can be omitted
INSERT INTO products (name, price)
VALUES ('Sticky Notes', 4.99);

-- What happens to the other columns?
-- category:   NULL (allowed — no NOT NULL constraint)
-- in_stock:   true (DEFAULT true)
-- created_at: now() (DEFAULT now())
\`\`\`

### INSERT and Get the New Row Back

\`\`\`sql
-- PostgreSQL: RETURNING clause
INSERT INTO products (name, price, category)
VALUES ('Laser Pointer', 14.99, 'tech')
RETURNING id, name, created_at;

-- Result:
-- id | name          | created_at
-- ---+---------------+----------------------------
--  8 | Laser Pointer | 2024-03-15 14:32:01.123456

-- Very useful: get the auto-generated ID immediately after insert
-- Without RETURNING: you'd need a separate SELECT to find the new row

-- MySQL equivalent:
INSERT INTO products (name, price, category) VALUES ('Laser Pointer', 14.99, 'tech');
SELECT LAST_INSERT_ID();  -- returns the auto-generated ID
\`\`\`

### INSERT OR UPDATE (Upsert)

\`\`\`sql
-- Insert if not exists, update if exists
-- PostgreSQL syntax:
INSERT INTO products (id, name, price)
VALUES (1, 'Wireless Mouse', 24.99)
ON CONFLICT (id) DO UPDATE SET
  name  = EXCLUDED.name,
  price = EXCLUDED.price;

-- EXCLUDED refers to the row that was attempted to be inserted
-- If id=1 already exists: update name and price
-- If id=1 doesn't exist: insert normally

-- MySQL syntax:
INSERT INTO products (id, name, price)
VALUES (1, 'Wireless Mouse', 24.99)
ON DUPLICATE KEY UPDATE
  name  = VALUES(name),
  price = VALUES(price);

-- Real-world use case: syncing data from an external API
-- "Insert this product, or update it if it already exists"
\`\`\`

## UPDATE — Modifying Existing Rows

### Basic UPDATE

\`\`\`sql
-- Update the price of product with id = 1
UPDATE products
SET price = 24.99
WHERE id = 1;

-- Update multiple columns at once
UPDATE products
SET 
  price    = 24.99,
  in_stock = false,
  category = 'tech-sale'
WHERE id = 1;
\`\`\`

### THE MOST IMPORTANT RULE: Always Use WHERE with UPDATE

\`\`\`sql
-- DANGEROUS: no WHERE clause
UPDATE products SET price = 0;
-- This sets the price to 0 for EVERY product in the table!
-- There is no undo button.

-- SAFE: with WHERE clause
UPDATE products SET price = 0 WHERE id = 99;
-- Only affects product with id = 99

-- Good habit: before running UPDATE, run the SELECT first:
SELECT * FROM products WHERE id = 99;    -- verify this is the right row
UPDATE products SET price = 0 WHERE id = 99;  -- then update
\`\`\`

### UPDATE with Expressions

\`\`\`sql
-- Increase all tech product prices by 10%
UPDATE products
SET price = price * 1.10
WHERE category = 'tech';

-- Apply a $5 discount to all products over $50
UPDATE products
SET price = price - 5
WHERE price > 50;

-- Mark all products as out of stock where quantity is 0
UPDATE products
SET in_stock = false
WHERE quantity = 0;
\`\`\`

### UPDATE Multiple Rows

\`\`\`sql
-- Update all products in the 'office' category
UPDATE products
SET category = 'office-supplies'
WHERE category = 'office';

-- How many rows were affected?
-- Most database clients show this: "3 rows affected"
-- PostgreSQL: the UPDATE command returns the count
\`\`\`

### UPDATE and See What Changed (PostgreSQL)

\`\`\`sql
-- Update and return the modified rows
UPDATE products
SET price = price * 0.9
WHERE category = 'tech'
RETURNING id, name, price;

-- Result shows the NEW values after update:
-- id | name           | price
-- ---+----------------+-------
--  1 | Wireless Mouse | 26.991
--  3 | USB Hub        | 17.991
--  8 | Laser Pointer  | 13.491
\`\`\`

## DELETE — Removing Rows

### Basic DELETE

\`\`\`sql
-- Delete a specific product
DELETE FROM products WHERE id = 3;

-- Delete all out-of-stock products
DELETE FROM products WHERE in_stock = false;

-- Delete products older than 1 year
DELETE FROM products WHERE created_at < now() - INTERVAL '1 year';
\`\`\`

### THE MOST IMPORTANT RULE: Always Use WHERE with DELETE

\`\`\`sql
-- CATASTROPHIC: no WHERE clause
DELETE FROM products;
-- This deletes EVERY ROW in the table. Completely empty.
-- No undo. Data is gone.

-- SAFE: with WHERE clause
DELETE FROM products WHERE id = 3;

-- Good habit: run SELECT first to verify
SELECT * FROM products WHERE id = 3;    -- see what you're about to delete
DELETE FROM products WHERE id = 3;      -- then delete it
\`\`\`

### DELETE vs TRUNCATE

\`\`\`sql
-- DELETE: removes rows one by one, can use WHERE, can be rolled back
DELETE FROM products;              -- slow on large tables, but safe with WHERE
DELETE FROM products WHERE id = 3; -- removes specific rows

-- TRUNCATE: removes ALL rows instantly, cannot use WHERE, faster
TRUNCATE TABLE products;           -- empties entire table instantly
-- Cannot be rolled back in many databases (depends on configuration)
-- Use for: wiping test data, resetting tables in development

-- When to use which:
-- DELETE: production, when you need WHERE, when you need to be careful
-- TRUNCATE: development/testing, when you want to empty an entire table fast
\`\`\`

## Transactions — All or Nothing

A **transaction** groups multiple operations so they either ALL succeed or ALL fail together. This is critical for data integrity.

\`\`\`
Real-world problem without transactions:
  Transfer $100 from Alice to Bob:
  
  Step 1: Subtract $100 from Alice's balance  ← succeeds
  Step 2: Add $100 to Bob's balance           ← SERVER CRASHES!
  
  Result: Alice lost $100, Bob got nothing. Money disappeared!
  
  With transactions: if any step fails, ALL steps are undone.
\`\`\`

### How Transactions Work

\`\`\`sql
-- Start a transaction
BEGIN;

-- Do multiple operations
UPDATE accounts SET balance = balance - 100 WHERE user_id = 1;  -- debit Alice
UPDATE accounts SET balance = balance + 100 WHERE user_id = 2;  -- credit Bob

-- If everything went well: make changes permanent
COMMIT;

-- If something went wrong: undo ALL changes
ROLLBACK;
\`\`\`

### Transaction Example: Order Processing

\`\`\`sql
BEGIN;

-- 1. Create the order
INSERT INTO orders (customer_id, total, status)
VALUES (42, 149.99, 'pending')
RETURNING id;   -- gets the new order id (let's say id = 1001)

-- 2. Add items to the order
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES 
  (1001, 3, 2, 29.99),   -- 2x USB Hub
  (1001, 1, 1, 89.99);   -- 1x Mechanical Keyboard

-- 3. Reduce inventory
UPDATE products SET stock = stock - 2 WHERE id = 3;
UPDATE products SET stock = stock - 1 WHERE id = 1;

-- 4. If we got here without errors: commit everything
COMMIT;

-- If ANY step above failed: ROLLBACK
-- All changes are undone — no half-created order exists
\`\`\`

### Transactions Are Automatic for Single Statements

\`\`\`sql
-- Every single SQL statement is automatically its own transaction.
-- If you do just this:
UPDATE products SET price = 24.99 WHERE id = 1;
-- It automatically commits if successful, rolls back if there's an error.

-- You only need explicit BEGIN/COMMIT/ROLLBACK when you have
-- multiple statements that must succeed or fail together.
\`\`\`

### Seeing It in Action: What Happens on Error

\`\`\`sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- balance goes from 500 to 400 (inside transaction, not yet permanent)

UPDATE accounts SET balance = balance + 100 WHERE id = 999;
-- id=999 doesn't exist! 0 rows affected.
-- But no error — UPDATE of 0 rows is not an error in SQL.

-- This is the problem: we debited Alice but Bob doesn't exist.
-- We must check rows affected and ROLLBACK manually if needed:

-- In application code (pseudocode):
-- if rows_affected == 0: ROLLBACK
-- else: COMMIT

ROLLBACK;  -- undo the debit to Alice
-- Alice's balance is back to 500
\`\`\`

## Practical Tips

\`\`\`
1. Always use WHERE with UPDATE and DELETE
   Before running: mentally ask "what does this affect?"
   When in doubt: run SELECT with the same WHERE first

2. Use transactions for multi-step operations
   Order creation, money transfers, booking systems: always use transactions

3. Use RETURNING to get data back immediately
   Avoids a second round-trip to the database

4. Batch your INSERTs
   100 rows in one INSERT >> 100 separate INSERT statements

5. Test in development first
   Never run an untested UPDATE/DELETE directly on production data
   
6. Soft deletes (advanced tip)
   Instead of DELETE, add a deleted_at column:
   UPDATE users SET deleted_at = now() WHERE id = 42;
   Then filter: WHERE deleted_at IS NULL
   Keeps history, allows recovery, much safer than actual DELETE
\`\`\`
`,

  fr: `# Insérer et modifier des données

## Les quatre opérations : CRUD

\`\`\`
C — Créer :    INSERT  → ajouter de nouvelles lignes
R — Lire :     SELECT  → récupérer des lignes (vu en leçon 3)
M — Modifier : UPDATE  → modifier des lignes existantes
S — Supprimer: DELETE  → supprimer des lignes
\`\`\`

## INSERT — Ajouter de nouvelles lignes

\`\`\`sql
-- Insérer une ligne en spécifiant les noms de colonnes
INSERT INTO produits (nom, prix, catégorie, en_stock)
VALUES ('Clavier Mécanique', 89.99, 'tech', true);

-- Insérer plusieurs lignes à la fois
INSERT INTO produits (nom, prix, catégorie, en_stock)
VALUES 
  ('Clavier Mécanique', 89.99, 'tech', true),
  ('Support Moniteur',  35.00, 'bureau', true),
  ('Webcam HD',         59.99, 'tech', false);

-- PostgreSQL : RETURNING pour obtenir la ligne insérée
INSERT INTO produits (nom, prix, catégorie)
VALUES ('Pointeur Laser', 14.99, 'tech')
RETURNING id, nom, créé_le;
\`\`\`

## UPDATE — Modifier des lignes existantes

\`\`\`sql
-- Mettre à jour le prix du produit avec id = 1
UPDATE produits
SET prix = 24.99
WHERE id = 1;

-- Mettre à jour plusieurs colonnes à la fois
UPDATE produits
SET 
  prix    = 24.99,
  en_stock = false
WHERE id = 1;

-- Augmenter tous les prix tech de 10%
UPDATE produits
SET prix = prix * 1.10
WHERE catégorie = 'tech';
\`\`\`

### LA RÈGLE LA PLUS IMPORTANTE : Toujours utiliser WHERE avec UPDATE

\`\`\`sql
-- DANGEREUX : pas de clause WHERE
UPDATE produits SET prix = 0;
-- Ceci met le prix à 0 pour CHAQUE produit dans la table !
-- Il n'y a pas de bouton annuler.

-- SÉCURISÉ : avec clause WHERE
UPDATE produits SET prix = 0 WHERE id = 99;

-- Bonne habitude : d'abord lancer le SELECT correspondant :
SELECT * FROM produits WHERE id = 99;    -- vérifier que c'est la bonne ligne
UPDATE produits SET prix = 0 WHERE id = 99;  -- puis mettre à jour
\`\`\`

## DELETE — Supprimer des lignes

\`\`\`sql
-- Supprimer un produit spécifique
DELETE FROM produits WHERE id = 3;

-- LA RÈGLE LA PLUS IMPORTANTE : Toujours utiliser WHERE avec DELETE
-- CATASTROPHIQUE : pas de clause WHERE
DELETE FROM produits;
-- Ceci supprime CHAQUE LIGNE dans la table. Complètement vide.
-- Pas d'annulation. Les données sont perdues.
\`\`\`

## Transactions — Tout ou rien

\`\`\`sql
-- Démarrer une transaction
BEGIN;

-- Faire plusieurs opérations
UPDATE comptes SET solde = solde - 100 WHERE user_id = 1;  -- débiter Alice
UPDATE comptes SET solde = solde + 100 WHERE user_id = 2;  -- créditer Bob

-- Si tout s'est bien passé : rendre les changements permanents
COMMIT;

-- Si quelque chose a mal tourné : annuler TOUS les changements
ROLLBACK;
\`\`\`

\`\`\`
Sans transaction :
  Étape 1 : Soustraire 100€ du solde d'Alice  ← réussit
  Étape 2 : Ajouter 100€ au solde de Bob      ← LE SERVEUR PLANTE !
  Résultat : Alice a perdu 100€, Bob n'a rien reçu. L'argent a disparu !
  
Avec transaction : si une étape échoue, TOUTES les étapes sont annulées.
\`\`\`

## Conseils pratiques

\`\`\`
1. Toujours utiliser WHERE avec UPDATE et DELETE
   Avant d'exécuter : demandez-vous "qu'est-ce que cela affecte ?"
   En cas de doute : d'abord lancer SELECT avec le même WHERE

2. Utiliser des transactions pour les opérations en plusieurs étapes
   Création de commande, virements, systèmes de réservation

3. Grouper vos INSERT
   100 lignes en un seul INSERT >> 100 instructions INSERT séparées

4. Suppressions douces (conseil avancé)
   Au lieu de DELETE, ajoutez une colonne supprimé_le :
   UPDATE utilisateurs SET supprimé_le = now() WHERE id = 42;
   Filtre : WHERE supprimé_le IS NULL
   Conserve l'historique, permet la récupération
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question: "What does CRUD stand for and which SQL commands correspond to each letter?",
      options: [
        "Create, Read, Update, Delete — corresponding to INSERT, SELECT, UPDATE, DELETE",
        "Copy, Retrieve, Update, Destroy — corresponding to COPY, GET, SET, DROP",
        "Create, Remove, Undo, Delete — corresponding to INSERT, DELETE, ROLLBACK, DROP",
        "Connect, Read, Upload, Download — corresponding to CONNECT, SELECT, INSERT, EXPORT"
      ],
      correct: 0,
    },
    {
      question: "What is the danger of running UPDATE products SET price = 0; without a WHERE clause?",
      options: [
        "It will return an error because UPDATE requires a WHERE clause",
        "It will only update the first row in the table",
        "It sets price = 0 for EVERY row in the entire products table with no undo — a catastrophic mistake in production",
        "It will ask for confirmation before running"
      ],
      correct: 2,
    },
    {
      question: "Why should you use transactions when transferring money between two accounts?",
      options: [
        "Transactions make the queries run faster",
        "Without a transaction, if the server crashes after debiting account A but before crediting account B, money disappears — the debit happened but the credit didn't. A transaction ensures both operations either both succeed (COMMIT) or both fail (ROLLBACK).",
        "Transactions are required by law for financial operations",
        "Transactions prevent other users from reading the accounts during the transfer"
      ],
      correct: 1,
    },
    {
      question: "What is the difference between DELETE FROM products; and TRUNCATE TABLE products;?",
      options: [
        "DELETE removes specific rows with WHERE; TRUNCATE removes all rows — both can be rolled back",
        "DELETE removes rows one by one and supports WHERE for selective deletion. TRUNCATE removes all rows instantly with no WHERE clause. DELETE is slower but safer; TRUNCATE is faster but empties the entire table and cannot always be rolled back.",
        "TRUNCATE is the same as DROP TABLE — it removes the table itself",
        "DELETE keeps the data in a recycle bin; TRUNCATE permanently removes it"
      ],
      correct: 1,
    },
    {
      question: "What does ON CONFLICT (id) DO UPDATE SET ... achieve in PostgreSQL?",
      options: [
        "It raises an error when a conflict is detected so you can handle it in your application",
        "It performs an upsert — if a row with the same id already exists it updates the specified columns, if it doesn't exist it inserts the new row. Useful for syncing data without checking existence first.",
        "It locks the row to prevent concurrent inserts from other connections",
        "It creates a backup copy of the existing row before updating it"
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Que signifie CRUD et quelles commandes SQL correspondent à chaque lettre ?",
      options: [
        "Create, Read, Update, Delete — correspondant à INSERT, SELECT, UPDATE, DELETE",
        "Copy, Retrieve, Update, Destroy — correspondant à COPY, GET, SET, DROP",
        "Create, Remove, Undo, Delete — correspondant à INSERT, DELETE, ROLLBACK, DROP",
        "Connect, Read, Upload, Download — correspondant à CONNECT, SELECT, INSERT, EXPORT"
      ],
      correct: 0,
    },
    {
      question: "Quel est le danger d'exécuter UPDATE produits SET prix = 0; sans clause WHERE ?",
      options: [
        "Cela retournera une erreur car UPDATE nécessite une clause WHERE",
        "Cela ne mettra à jour que la première ligne de la table",
        "Cela met prix = 0 pour CHAQUE ligne de toute la table produits sans annulation possible — une erreur catastrophique en production",
        "Cela demandera une confirmation avant d'exécuter"
      ],
      correct: 2,
    },
    {
      question: "Pourquoi devriez-vous utiliser des transactions lors d'un virement entre deux comptes ?",
      options: [
        "Les transactions rendent les requêtes plus rapides",
        "Sans transaction, si le serveur plante après le débit du compte A mais avant le crédit du compte B, l'argent disparaît. Une transaction garantit que les deux opérations réussissent (COMMIT) ou échouent toutes les deux (ROLLBACK).",
        "Les transactions sont requises par la loi pour les opérations financières",
        "Les transactions empêchent les autres utilisateurs de lire les comptes pendant le virement"
      ],
      correct: 1,
    },
    {
      question: "Quelle est la différence entre DELETE FROM produits; et TRUNCATE TABLE produits; ?",
      options: [
        "DELETE supprime des lignes spécifiques avec WHERE ; TRUNCATE supprime toutes les lignes — les deux peuvent être annulés",
        "DELETE supprime les lignes une par une et supporte WHERE pour une suppression sélective. TRUNCATE supprime instantanément toutes les lignes sans clause WHERE. DELETE est plus lent mais plus sûr ; TRUNCATE est plus rapide mais vide toute la table.",
        "TRUNCATE est identique à DROP TABLE — il supprime la table elle-même",
        "DELETE garde les données dans une corbeille ; TRUNCATE les supprime définitivement"
      ],
      correct: 1,
    },
    {
      question: "Que réalise ON CONFLICT (id) DO UPDATE SET ... dans PostgreSQL ?",
      options: [
        "Il génère une erreur quand un conflit est détecté pour que vous puissiez le gérer dans votre application",
        "Il effectue un upsert — si une ligne avec le même id existe déjà, il met à jour les colonnes spécifiées, sinon il insère la nouvelle ligne. Utile pour synchroniser des données sans vérifier l'existence au préalable.",
        "Il verrouille la ligne pour empêcher les insertions concurrentes d'autres connexions",
        "Il crée une copie de sauvegarde de la ligne existante avant de la mettre à jour"
      ],
      correct: 1,
    },
  ],
};
