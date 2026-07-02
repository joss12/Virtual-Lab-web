export const content = {
  en: `# Primary & Foreign Keys

## Why Keys Exist

Imagine your database has two tables: customers and orders. How does the database know which order belongs to which customer? How do you prevent two customers from having the same ID? How do you stop an order from referencing a customer that doesn't exist?

Keys solve all of these problems.

\`\`\`
Without keys:
  customers table:          orders table:
  id | name                 id | customer_name | total
  ---+------                ---+---------------+------
   1 | Alice                 1 | Alice         | 49.99  ← which Alice?
   2 | Bob                   2 | alice         | 29.99  ← typo — different Alice?
   3 | Alice  ← duplicate!   3 | ALICE         | 99.00  ← same Alice? different?

With keys:
  customers table:          orders table:
  id | name                 id | customer_id | total
  ---+------                ---+-------------+------
   1 | Alice                 1 |      1      | 49.99  ← definitely Alice (id=1)
   2 | Bob                   2 |      1      | 29.99  ← same Alice (id=1)
   3 | Carol                 3 |      2      | 99.00  ← Bob (id=2)
\`\`\`

## Primary Keys

A **primary key** is a column (or group of columns) that uniquely identifies each row in a table. Every table should have one.

Rules for primary keys:
- Must be **unique** — no two rows can have the same primary key value
- Must be **NOT NULL** — every row must have a primary key
- Must be **immutable** (ideally) — once set, don't change it

\`\`\`sql
-- Simple primary key (most common)
CREATE TABLE customers (
  id    SERIAL PRIMARY KEY,   -- auto-incrementing integer
  name  VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);

-- What SERIAL does:
-- Creates an integer column
-- Creates a sequence (counter) that auto-increments
-- First INSERT gets id=1, second gets id=2, etc.
-- You never have to manually provide the id

-- In PostgreSQL 10+, you can also use:
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
-- Same effect, more standard SQL syntax
\`\`\`

### Auto-Increment in Different Databases

\`\`\`sql
-- PostgreSQL:
id SERIAL PRIMARY KEY
id BIGSERIAL PRIMARY KEY          -- for very large tables (up to 9.2 × 10^18)

-- MySQL:
id INT AUTO_INCREMENT PRIMARY KEY
id BIGINT AUTO_INCREMENT PRIMARY KEY

-- SQLite:
id INTEGER PRIMARY KEY AUTOINCREMENT
-- or just:
id INTEGER PRIMARY KEY            -- SQLite auto-increments if no value given
\`\`\`

### Composite Primary Key

Sometimes a single column isn't enough. A composite primary key uses **two or more columns together**.

\`\`\`sql
-- A student can enroll in many courses.
-- A course can have many students.
-- But a student can only enroll in the same course ONCE.
-- The combination (student_id, course_id) is unique.

CREATE TABLE enrollments (
  student_id  INTEGER NOT NULL,
  course_id   INTEGER NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  grade       DECIMAL(3,1),
  PRIMARY KEY (student_id, course_id)  -- composite PK
);

-- This allows:
-- student 1 in course 1 ✓
-- student 1 in course 2 ✓
-- student 2 in course 1 ✓
-- student 1 in course 1 AGAIN ✗ (duplicate PK — blocked!)
\`\`\`

### Choosing Your Primary Key

\`\`\`
Option 1: Auto-increment integer (SERIAL / AUTO_INCREMENT)
  Pros:  tiny (4-8 bytes), fast indexes, simple, sequential
  Cons:  meaningful to nobody outside the system, predictable (id=1, 2, 3...)
  Use:   most tables — the default choice

Option 2: UUID (Universally Unique Identifier)
  Format: 550e8400-e29b-41d4-a716-446655440000
  Pros:  globally unique (safe to generate client-side), not sequential
         (harder to enumerate), good for distributed systems
  Cons:  16 bytes (4x larger than int), random (bad for B-tree, causes page splits)
         harder to type/remember
  Use:   distributed systems, APIs where you don't want to expose sequential IDs

Option 3: Natural key (email, username, ISBN)
  Pros:  meaningful, already unique in the real world
  Cons:  can change (email changes, username changes), can be long
  Use:   only when the natural key is truly immutable and unique

-- Best practice for most applications:
-- Use auto-increment integer as the internal PK
-- Use UUID or another opaque ID in your public API

id SERIAL PRIMARY KEY,          -- internal database ID
public_id UUID DEFAULT gen_random_uuid() UNIQUE  -- external ID exposed to users
\`\`\`

## Foreign Keys

A **foreign key** is a column in one table that references the primary key in another table. It creates a link between the two tables.

\`\`\`sql
CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  total       DECIMAL(10,2) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- "customer_id REFERENCES customers(id)" means:
-- The value in customer_id must exist in the customers.id column
-- You CANNOT create an order for a customer that doesn't exist
\`\`\`

### What Foreign Keys Enforce

\`\`\`sql
-- Insert a customer first
INSERT INTO customers (name, email) VALUES ('Alice', 'alice@example.com');
-- Gets id = 1

-- Insert an order for Alice
INSERT INTO orders (customer_id, total) VALUES (1, 49.99);
-- ✓ Works: customer_id=1 exists in customers table

-- Try to insert an order for non-existent customer
INSERT INTO orders (customer_id, total) VALUES (999, 49.99);
-- ✗ ERROR: insert or update on table "orders" violates foreign key constraint
-- "orders_customer_id_fkey" — key (customer_id)=(999) is not present in table "customers"

-- This is referential integrity: the database guarantees
-- every order always belongs to a real customer.
\`\`\`

### ON DELETE — What Happens When a Parent Row Is Deleted

\`\`\`sql
-- What should happen to orders if the customer is deleted?

-- Option 1: RESTRICT (default) — prevent deletion if orders exist
customer_id INTEGER REFERENCES customers(id) ON DELETE RESTRICT
-- Try to delete customer with orders → ERROR
-- Safest option: forces you to handle the relationship explicitly

-- Option 2: CASCADE — delete orders when customer is deleted
customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE
-- Delete customer → automatically deletes all their orders
-- Use carefully: data is permanently gone

-- Option 3: SET NULL — set customer_id to NULL when customer deleted
customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL
-- Delete customer → orders remain, customer_id becomes NULL
-- Useful: "orphaned" orders you want to keep for history

-- Option 4: SET DEFAULT — set to a default value
customer_id INTEGER REFERENCES customers(id) ON DELETE SET DEFAULT
-- Rarely used in practice

-- Real-world example: blog with CASCADE
CREATE TABLE posts (
  id        SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
  title     VARCHAR(300) NOT NULL,
  content   TEXT
);
-- Delete an author → all their posts are automatically deleted
-- Makes sense: a post without an author shouldn't exist
\`\`\`

### ON UPDATE — What Happens When a Parent Key Changes

\`\`\`sql
-- Most common: RESTRICT (default) or CASCADE
customer_id INTEGER REFERENCES customers(id) ON UPDATE CASCADE
-- If customer id changes from 1 to 100 → all orders update customer_id to 100
-- Rarely needed if you use immutable auto-increment PKs (best practice)
\`\`\`

## Visualizing Relationships

\`\`\`
One-to-Many (most common):
  One customer → many orders
  
  customers          orders
  ┌─────┬───────┐    ┌─────┬─────────────┬───────┐
  │  1  │ Alice │◄──┤  1  │      1      │ 49.99 │
  │  2  │ Bob   │   ├─────┼─────────────┼───────┤
  └─────┴───────┘   │  2  │      1      │ 29.99 │
                    ├─────┼─────────────┼───────┤
                    │  3  │      2      │ 99.99 │
                    └─────┴─────────────┴───────┘
  
  Alice (id=1) has 2 orders.
  Bob (id=2) has 1 order.

Many-to-Many (requires junction table):
  A student can take many courses.
  A course can have many students.
  
  students          enrollments        courses
  ┌─────┬────────┐  ┌───────────┬─────────────┐  ┌─────┬──────────┐
  │  1  │ Alice  │  │     1     │      1      │  │  1  │ SQL 101  │
  │  2  │ Bob    │  │     1     │      2      │  │  2  │ Python   │
  └─────┴────────┘  │     2     │      1      │  └─────┴──────────┘
                    └───────────┴─────────────┘
  
  Alice enrolled in SQL 101 AND Python.
  Bob enrolled in SQL 101.
  SQL 101 has Alice AND Bob.
\`\`\`

## Building a Complete Example

\`\`\`sql
-- E-commerce database with proper keys and relationships

CREATE TABLE customers (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  price       DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  total       DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  price      DECIMAL(10,2) NOT NULL  -- price at time of purchase (frozen)
);
\`\`\`

\`\`\`
Relationships:
  customers → orders:      one customer has many orders (ON DELETE RESTRICT)
  orders → order_items:    one order has many items (ON DELETE CASCADE)
  products → order_items:  one product in many order items (ON DELETE RESTRICT)

Why different ON DELETE behaviors?
  customers: RESTRICT — don't delete customers who have orders (keep history)
  order_items: CASCADE — if order deleted, delete its items (items can't exist alone)
  products: RESTRICT — don't delete products that are in orders (historical record)
\`\`\`

## Common Mistakes

\`\`\`
Mistake 1: No primary key
  Some developers skip primary keys "to save space"
  Never do this — without a PK you cannot reliably identify or update specific rows

Mistake 2: Using meaningful data as a primary key
  Bad:  PRIMARY KEY (email)        — email changes, all references break
  Bad:  PRIMARY KEY (username)     — username changes, all references break
  Good: id SERIAL PRIMARY KEY, then UNIQUE constraint on email/username

Mistake 3: Forgetting foreign keys
  Storing customer_id in orders without a REFERENCES constraint:
  → Database allows orders for non-existent customers
  → Data corruption that's hard to detect and fix

Mistake 4: Cascade deleting too aggressively
  ON DELETE CASCADE on all relationships → delete one record → accidentally
  delete hundreds of related records across many tables
  Use RESTRICT as your default, add CASCADE only where it makes sense

Mistake 5: Circular foreign keys
  Table A references Table B, Table B references Table A
  Impossible to insert either row first → deadlock
  Solution: make one of the references nullable (optional relationship)
\`\`\`
`,

  fr: `# Clés primaires et étrangères

## Pourquoi les clés existent

\`\`\`
Sans clés :
  table clients :           table commandes :
  id | nom                  id | nom_client | total
  ---+------                ---+------------+------
   1 | Alice                 1 | Alice      | 49.99  ← quelle Alice ?
   2 | Bob                   2 | alice      | 29.99  ← faute de frappe ?
   3 | Alice  ← doublon!     3 | ALICE      | 99.00  ← même Alice ?

Avec les clés :
  table clients :           table commandes :
  id | nom                  id | client_id | total
  ---+------                ---+-----------+------
   1 | Alice                 1 |     1     | 49.99  ← définitivement Alice (id=1)
   2 | Bob                   2 |     1     | 29.99  ← même Alice (id=1)
   3 | Carol                 3 |     2     | 99.00  ← Bob (id=2)
\`\`\`

## Clés primaires

\`\`\`sql
-- Clé primaire simple (la plus courante)
CREATE TABLE clients (
  id    SERIAL PRIMARY KEY,   -- entier auto-incrémenté
  nom   VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);

-- Clé primaire composite (deux colonnes ensemble)
CREATE TABLE inscriptions (
  etudiant_id INTEGER NOT NULL,
  cours_id    INTEGER NOT NULL,
  inscrit_le  TIMESTAMPTZ DEFAULT now(),
  note        DECIMAL(3,1),
  PRIMARY KEY (etudiant_id, cours_id)
);
-- Un étudiant ne peut s'inscrire qu'une seule fois au même cours
\`\`\`

### Choisir votre clé primaire

\`\`\`
Option 1 : Entier auto-incrémenté (SERIAL)
  Avantages : petit (4-8 octets), index rapides, simple
  Inconvénients : prévisible (id=1, 2, 3...)
  Utilisation : la plupart des tables — le choix par défaut

Option 2 : UUID
  Format : 550e8400-e29b-41d4-a716-446655440000
  Avantages : globalement unique, bon pour les systèmes distribués
  Inconvénients : 16 octets (4x plus grand qu'un entier), aléatoire
  Utilisation : systèmes distribués, APIs

Option 3 : Clé naturelle (email, ISBN)
  Avantages : signifiant, déjà unique
  Inconvénients : peut changer (l'email change)
  Utilisation : uniquement si vraiment immuable et unique
\`\`\`

## Clés étrangères

\`\`\`sql
CREATE TABLE commandes (
  id         SERIAL PRIMARY KEY,
  client_id  INTEGER NOT NULL REFERENCES clients(id),
  total      DECIMAL(10,2) NOT NULL,
  créé_le    TIMESTAMPTZ DEFAULT now()
);

-- Essayer d'insérer une commande pour un client inexistant
INSERT INTO commandes (client_id, total) VALUES (999, 49.99);
-- ✗ ERREUR : violation de contrainte de clé étrangère
\`\`\`

### ON DELETE — Que se passe-t-il quand une ligne parente est supprimée

\`\`\`sql
-- RESTRICT (défaut) — empêcher la suppression si des commandes existent
client_id INTEGER REFERENCES clients(id) ON DELETE RESTRICT

-- CASCADE — supprimer les commandes quand le client est supprimé
client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE

-- SET NULL — mettre client_id à NULL quand le client est supprimé
client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL
\`\`\`

## Erreurs courantes

\`\`\`
Erreur 1 : Pas de clé primaire
  Sans clé primaire, vous ne pouvez pas identifier ou mettre à jour une ligne

Erreur 2 : Utiliser des données significatives comme clé primaire
  Mauvais :  PRIMARY KEY (email)    — l'email change, toutes les références cassent
  Bon :      id SERIAL PRIMARY KEY, puis contrainte UNIQUE sur email

Erreur 3 : Oublier les clés étrangères
  Stocker client_id sans contrainte REFERENCES :
  → La base autorise des commandes pour des clients inexistants

Erreur 4 : CASCADE trop agressif
  ON DELETE CASCADE sur toutes les relations → supprimer un enregistrement
  → supprime accidentellement des centaines d'enregistrements liés
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What are the two requirements that every primary key must satisfy?",
      options: [
        "Must be an integer and must be auto-incrementing",
        "Must be unique (no two rows have the same value) and must be NOT NULL (every row has a value)",
        "Must be the first column in the table and must be less than 1 million",
        "Must be visible to the application and must be stored as a string",
      ],
      correct: 1,
    },
    {
      question: "What does REFERENCES customers(id) in a column definition do?",
      options: [
        "It copies all data from the customers table into this column",
        "It creates a foreign key constraint — the value in this column must exist in the customers.id column, preventing orders from being created for non-existent customers",
        "It automatically joins the two tables when you run a SELECT query",
        "It creates an index on this column for faster lookups",
      ],
      correct: 1,
    },
    {
      question:
        "You have customers and orders with ON DELETE RESTRICT. What happens when you try to delete a customer who has 5 orders?",
      options: [
        "The customer is deleted and all 5 orders are also deleted automatically",
        "The customer is deleted and the 5 orders have their customer_id set to NULL",
        "The database raises an error and prevents the deletion — you must delete the orders first",
        "The customer is marked as deleted but the orders are not affected",
      ],
      correct: 2,
    },
    {
      question:
        "When would you use a composite primary key instead of a single-column primary key?",
      options: [
        "When the table has more than 1 million rows",
        "When a single column is not enough to uniquely identify a row — for example, in an enrollments table where (student_id, course_id) together must be unique because a student can enroll in many courses but not the same course twice",
        "When you want to make queries run faster",
        "When the table has relationships with more than 2 other tables",
      ],
      correct: 1,
    },
    {
      question: "Why is using email as a primary key generally a bad practice?",
      options: [
        "Emails are too long to be stored efficiently as primary keys",
        "Primary keys should only be integers, not strings",
        "Emails can change — if a user updates their email, all foreign keys in other tables referencing it would break or need cascading updates. Auto-increment IDs are immutable, making them safer as primary keys.",
        "The database cannot create indexes on email columns",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question:
        "Quelles sont les deux exigences que chaque clé primaire doit satisfaire ?",
      options: [
        "Doit être un entier et doit être auto-incrémenté",
        "Doit être unique (pas deux lignes avec la même valeur) et doit être NOT NULL (chaque ligne a une valeur)",
        "Doit être la première colonne de la table et doit être inférieure à 1 million",
        "Doit être visible par l'application et doit être stockée comme une chaîne",
      ],
      correct: 1,
    },
    {
      question:
        "Que fait REFERENCES clients(id) dans une définition de colonne ?",
      options: [
        "Cela copie toutes les données de la table clients dans cette colonne",
        "Cela crée une contrainte de clé étrangère — la valeur dans cette colonne doit exister dans la colonne clients.id, empêchant la création de commandes pour des clients inexistants",
        "Cela joint automatiquement les deux tables quand vous exécutez une requête SELECT",
        "Cela crée un index sur cette colonne pour des lookups plus rapides",
      ],
      correct: 1,
    },
    {
      question:
        "Vous avez clients et commandes avec ON DELETE RESTRICT. Que se passe-t-il quand vous essayez de supprimer un client qui a 5 commandes ?",
      options: [
        "Le client est supprimé et les 5 commandes sont aussi automatiquement supprimées",
        "Le client est supprimé et les 5 commandes ont leur client_id mis à NULL",
        "La base de données génère une erreur et empêche la suppression — vous devez d'abord supprimer les commandes",
        "Le client est marqué comme supprimé mais les commandes ne sont pas affectées",
      ],
      correct: 2,
    },
    {
      question:
        "Quand utiliseriez-vous une clé primaire composite plutôt qu'une clé primaire à colonne unique ?",
      options: [
        "Quand la table a plus d'un million de lignes",
        "Quand une seule colonne n'est pas suffisante pour identifier uniquement une ligne — par exemple dans une table inscriptions où (etudiant_id, cours_id) ensemble doit être unique car un étudiant peut s'inscrire à plusieurs cours mais pas deux fois au même",
        "Quand vous voulez rendre les requêtes plus rapides",
        "Quand la table a des relations avec plus de 2 autres tables",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi utiliser l'email comme clé primaire est-il généralement une mauvaise pratique ?",
      options: [
        "Les emails sont trop longs pour être stockés efficacement comme clés primaires",
        "Les clés primaires ne doivent être que des entiers, pas des chaînes",
        "Les emails peuvent changer — si un utilisateur met à jour son email, toutes les clés étrangères dans d'autres tables le référençant casseraient. Les IDs auto-incrémentés sont immuables, les rendant plus sûrs comme clés primaires.",
        "La base de données ne peut pas créer d'index sur les colonnes email",
      ],
      correct: 2,
    },
  ],
};
