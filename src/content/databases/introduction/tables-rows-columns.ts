export const content = {
  en: `# Tables, Rows & Columns

## The Building Blocks of a Relational Database

Every relational database is built from the same three fundamental pieces: **tables**, **rows**, and **columns**. Master these and you understand 80% of how databases work.

\`\`\`
Table = the container (like a spreadsheet tab)
Row   = one record (like one line in the spreadsheet)
Column = one type of data (like a spreadsheet column header)

Table: products
┌────┬─────────────────┬───────┬──────────┬────────────┐
│ id │ name            │ price │ category │ in_stock   │
├────┼─────────────────┼───────┼──────────┼────────────┤
│  1 │ Wireless Mouse  │ 29.99 │ tech     │ true       │  ← row
│  2 │ Desk Lamp       │ 49.99 │ office   │ true       │  ← row
│  3 │ USB Hub         │ 19.99 │ tech     │ false      │  ← row
└────┴─────────────────┴───────┴──────────┴────────────┘
  ↑        ↑             ↑        ↑            ↑
column   column        column   column       column
\`\`\`

## Columns and Data Types

Every column has a **data type** — it defines what kind of data that column can hold. The database enforces this: you cannot store the text "hello" in an integer column.

### The Most Common Data Types

\`\`\`
INTEGER (or INT):
  Whole numbers: -2,147,483,648 to 2,147,483,647
  Use for: quantities, counts, IDs
  Examples: 1, 42, -5, 1000000

BIGINT:
  Very large whole numbers: up to 9.2 × 10^18
  Use for: IDs on large tables (when you might exceed 2 billion rows)
  Examples: 9223372036854775807

DECIMAL(precision, scale) or NUMERIC:
  Exact decimal numbers
  DECIMAL(10, 2) = up to 10 digits total, 2 after decimal point
  Use for: prices, financial amounts (NEVER use FLOAT for money!)
  Examples: 29.99, 1234567.89, -0.50

FLOAT / DOUBLE:
  Approximate decimal numbers (stored in binary, has rounding errors)
  Use for: scientific measurements, statistics (NOT money)
  Examples: 3.14159, 0.000001, 1.5e10
  
  Why not FLOAT for money?
    0.1 + 0.2 in floating point = 0.30000000000000004 (not 0.30!)
    Use DECIMAL for anything financial

VARCHAR(n):
  Variable-length text, maximum n characters
  Only uses as much space as the actual text
  Use for: names, emails, short descriptions
  Examples: VARCHAR(100) for name, VARCHAR(255) for email

TEXT:
  Unlimited-length text
  Use for: blog posts, comments, descriptions, any long text
  Note: in PostgreSQL, TEXT and VARCHAR are equally fast

BOOLEAN:
  True or false only
  Use for: yes/no flags (is_active, in_stock, is_verified)
  Values: TRUE / FALSE (or 1 / 0 in some databases)

DATE:
  A calendar date (no time)
  Format: YYYY-MM-DD
  Examples: 2024-01-15, 2024-12-31

TIMESTAMP:
  A date AND time
  Format: YYYY-MM-DD HH:MM:SS
  Examples: 2024-01-15 14:30:00

TIMESTAMPTZ (PostgreSQL) / DATETIME (MySQL):
  Timestamp with timezone information
  Use for: any time-sensitive data (when was this created/updated?)
  Best practice: always store times in UTC
\`\`\`

### Choosing the Right Type

\`\`\`
Product price:          DECIMAL(10, 2)   ✓
                        FLOAT            ✗ (rounding errors)

User's name:            VARCHAR(100)     ✓
                        TEXT             also fine, slightly less explicit

Blog post body:         TEXT             ✓
                        VARCHAR(50000)   also works but TEXT is cleaner

Is user verified?       BOOLEAN          ✓
                        VARCHAR(5)       ✗ (would store "true"/"false" as text)
                        INTEGER          also works (0/1) but less clear

Order created time:     TIMESTAMPTZ      ✓
                        VARCHAR          ✗ (can't sort, can't calculate duration)

Number of items:        INTEGER          ✓
                        DECIMAL          ✗ (you can't have 2.5 items)
\`\`\`

## NULL — The Absence of a Value

NULL means "no value" or "unknown". It is NOT the same as zero, empty string, or false.

\`\`\`
Table: users
┌────┬────────┬──────────────────────┬─────────────┐
│ id │ name   │ email                │ phone       │
├────┼────────┼──────────────────────┼─────────────┤
│  1 │ Alice  │ alice@example.com    │ +33612345678│
│  2 │ Bob    │ bob@example.com      │ NULL        │ ← Bob has no phone number
│  3 │ Carol  │ carol@example.com    │ NULL        │ ← Carol also has none
└────┴────────┴──────────────────────┴─────────────┘

NULL is not:
  "" (empty string)  — that would mean "Bob has a phone but it's blank"
  0                  — that would mean "Bob's phone number is zero"
  "unknown"          — that's text, not absence of value

NULL means: this information simply does not exist for this row
\`\`\`

### NULL Gotchas

\`\`\`sql
-- Finding rows where phone IS null:
SELECT * FROM users WHERE phone IS NULL;     ✓ correct
SELECT * FROM users WHERE phone = NULL;      ✗ WRONG — always returns 0 rows!
-- NULL = NULL is not TRUE in SQL — it's NULL (unknown)
-- You must use IS NULL or IS NOT NULL

-- NULL in calculations:
5 + NULL = NULL          -- any math with NULL = NULL
NULL = NULL is NULL      -- not TRUE! (you can't know if two unknowns are equal)

-- Counting NULLs:
SELECT COUNT(*) FROM users;           -- counts all rows (3)
SELECT COUNT(phone) FROM users;       -- counts only non-NULL phone values (1)
\`\`\`

## Constraints — Rules the Database Enforces

Constraints are rules you define when creating a table. The database automatically rejects any data that violates them.

### NOT NULL

\`\`\`sql
-- This column MUST have a value, NULL is not allowed
name VARCHAR(100) NOT NULL

-- Trying to insert without a name:
INSERT INTO users (email) VALUES ('alice@example.com');
-- ERROR: null value in column "name" violates not-null constraint
\`\`\`

### UNIQUE

\`\`\`sql
-- No two rows can have the same value in this column
email VARCHAR(255) UNIQUE

-- Trying to insert a duplicate email:
INSERT INTO users (name, email) VALUES ('Alice2', 'alice@example.com');
-- ERROR: duplicate key value violates unique constraint "users_email_key"
\`\`\`

### DEFAULT

\`\`\`sql
-- If no value provided, use this default
created_at TIMESTAMPTZ DEFAULT now()
is_active   BOOLEAN     DEFAULT true

-- Insert without specifying created_at:
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
-- created_at is automatically set to the current time
-- is_active is automatically set to true
\`\`\`

### CHECK

\`\`\`sql
-- Value must satisfy this condition
price DECIMAL(10,2) CHECK (price >= 0)
age   INTEGER       CHECK (age >= 0 AND age <= 150)

-- Trying to insert a negative price:
INSERT INTO products (name, price) VALUES ('Widget', -5.00);
-- ERROR: new row for relation "products" violates check constraint
\`\`\`

## Creating Your First Table

Here is how you create a real table in SQL:

\`\`\`sql
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,        -- auto-incrementing unique ID
  name        VARCHAR(200) NOT NULL,     -- required, max 200 chars
  price       DECIMAL(10, 2) NOT NULL,   -- required, e.g. 29.99
  category    VARCHAR(50),               -- optional (can be NULL)
  description TEXT,                      -- optional long text
  in_stock    BOOLEAN NOT NULL DEFAULT true, -- defaults to true
  created_at  TIMESTAMPTZ DEFAULT now() -- auto-set to current time
);
\`\`\`

Breaking it down:
\`\`\`
SERIAL:        Auto-incrementing integer (1, 2, 3, ...) — PostgreSQL syntax
               MySQL equivalent: INT AUTO_INCREMENT
PRIMARY KEY:   Uniquely identifies each row (no NULLs, no duplicates)
NOT NULL:      This column must always have a value
DEFAULT now(): If not provided, use the current timestamp
\`\`\`

## Seeing Your Table Structure

\`\`\`sql
-- PostgreSQL: describe a table
\\d products

-- MySQL: describe a table
DESCRIBE products;

-- Standard SQL: see column information
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products';
\`\`\`

## Real-World Table Design Example

Let's design a simple blog database:

\`\`\`sql
-- Authors table
CREATE TABLE authors (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  bio        TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Posts table
CREATE TABLE posts (
  id          SERIAL PRIMARY KEY,
  author_id   INTEGER NOT NULL,         -- which author wrote this
  title       VARCHAR(300) NOT NULL,
  content     TEXT NOT NULL,
  published   BOOLEAN DEFAULT false,    -- draft by default
  views       INTEGER DEFAULT 0,        -- starts at zero
  created_at  TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ              -- NULL until actually published
);
\`\`\`

\`\`\`
Notice the design decisions:
  authors.email:         UNIQUE (no two authors share an email)
  posts.published:       DEFAULT false (all posts start as drafts)
  posts.views:           DEFAULT 0 (no views when first created)
  posts.published_at:    NULL by default (only set when published)
  posts.author_id:       references the authors table (we'll cover this in lesson 5)
\`\`\`

## Common Mistakes Beginners Make

\`\`\`
Mistake 1: Using VARCHAR for everything
  Bad:  age VARCHAR(10)     → stores "twenty-five", "25", "25 years"
  Good: age INTEGER         → only stores numbers, can do math on it

Mistake 2: Using FLOAT for money
  Bad:  price FLOAT         → 0.1 + 0.2 = 0.30000000000000004
  Good: price DECIMAL(10,2) → exact arithmetic

Mistake 3: Not using NOT NULL where appropriate
  Bad:  name VARCHAR(100)   → allows nameless users
  Good: name VARCHAR(100) NOT NULL → enforces that every user has a name

Mistake 4: Making everything nullable
  If a column should always have a value: add NOT NULL
  Only leave columns nullable when "no value" is genuinely valid

Mistake 5: Storing multiple values in one column
  Bad:  tags VARCHAR(500) = "tech,programming,sql"  → hard to query
  Good: a separate tags table with one row per tag
\`\`\`
`,

  fr: `# Tables, Lignes et Colonnes

## Les éléments de base d'une base de données relationnelle

Chaque base de données relationnelle est construite à partir des mêmes trois éléments fondamentaux : **tables**, **lignes** et **colonnes**.

\`\`\`
Table  = le conteneur (comme un onglet de tableur)
Ligne  = un enregistrement (comme une ligne dans le tableur)
Colonne = un type de données (comme un en-tête de colonne)

Table : produits
┌────┬─────────────────┬───────┬──────────┬──────────┐
│ id │ nom             │ prix  │ catégorie│ en_stock │
├────┼─────────────────┼───────┼──────────┼──────────┤
│  1 │ Souris sans fil │ 29.99 │ tech     │ vrai     │  ← ligne
│  2 │ Lampe de bureau │ 49.99 │ bureau   │ vrai     │  ← ligne
│  3 │ Hub USB         │ 19.99 │ tech     │ faux     │  ← ligne
└────┴─────────────────┴───────┴──────────┴──────────┘
\`\`\`

## Colonnes et types de données

Chaque colonne a un **type de données** — il définit quel type de données cette colonne peut contenir.

\`\`\`
INTEGER :          Nombres entiers
BIGINT :           Très grands nombres entiers
DECIMAL(p, s) :    Nombres décimaux exacts (pour les prix !)
FLOAT / DOUBLE :   Nombres décimaux approximatifs (PAS pour l'argent)
VARCHAR(n) :       Texte de longueur variable, maximum n caractères
TEXT :             Texte de longueur illimitée
BOOLEAN :          Vrai ou faux uniquement
DATE :             Une date calendaire (sans heure)
TIMESTAMP :        Une date ET une heure
TIMESTAMPTZ :      Timestamp avec informations de fuseau horaire
\`\`\`

## NULL — L'absence de valeur

NULL signifie "pas de valeur" ou "inconnu". Ce n'est PAS la même chose que zéro, chaîne vide ou faux.

\`\`\`sql
-- Trouver les lignes où téléphone EST null :
SELECT * FROM utilisateurs WHERE téléphone IS NULL;     ✓ correct
SELECT * FROM utilisateurs WHERE téléphone = NULL;      ✗ FAUX — retourne toujours 0 lignes !
-- NULL = NULL n'est pas VRAI en SQL — c'est NULL (inconnu)
\`\`\`

## Contraintes — Règles que la base de données applique

\`\`\`sql
-- NOT NULL : cette colonne doit toujours avoir une valeur
nom VARCHAR(100) NOT NULL

-- UNIQUE : pas deux lignes ne peuvent avoir la même valeur
email VARCHAR(255) UNIQUE

-- DEFAULT : si aucune valeur fournie, utiliser celle-ci
créé_le TIMESTAMPTZ DEFAULT now()
est_actif BOOLEAN DEFAULT true

-- CHECK : la valeur doit satisfaire cette condition
prix DECIMAL(10,2) CHECK (prix >= 0)
\`\`\`

## Créer votre première table

\`\`\`sql
CREATE TABLE produits (
  id          SERIAL PRIMARY KEY,
  nom         VARCHAR(200) NOT NULL,
  prix        DECIMAL(10, 2) NOT NULL,
  catégorie   VARCHAR(50),
  description TEXT,
  en_stock    BOOLEAN NOT NULL DEFAULT true,
  créé_le     TIMESTAMPTZ DEFAULT now()
);
\`\`\`

## Erreurs courantes des débutants

\`\`\`
Erreur 1 : Utiliser VARCHAR pour tout
  Mauvais : age VARCHAR(10)     → stocke "vingt-cinq", "25", "25 ans"
  Bon :     age INTEGER         → stocke uniquement des nombres

Erreur 2 : Utiliser FLOAT pour l'argent
  Mauvais : prix FLOAT          → 0.1 + 0.2 = 0.30000000000000004
  Bon :     prix DECIMAL(10,2)  → arithmétique exacte

Erreur 3 : Ne pas utiliser NOT NULL quand approprié
  Mauvais : nom VARCHAR(100)    → autorise des utilisateurs sans nom
  Bon :     nom VARCHAR(100) NOT NULL

Erreur 4 : Stocker plusieurs valeurs dans une colonne
  Mauvais : tags VARCHAR(500) = "tech,programmation,sql"
  Bon :     une table tags séparée avec une ligne par tag
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the correct data type for storing a product price like 29.99?",
      options: [
        "FLOAT — it handles decimal numbers efficiently",
        "DECIMAL(10, 2) — it stores exact decimal numbers without rounding errors, critical for financial data where 0.1 + 0.2 must equal exactly 0.30",
        "VARCHAR(10) — prices are short enough to store as text",
        "INTEGER — just store the price in cents and divide by 100 when displaying",
      ],
      correct: 1,
    },
    {
      question: "What does NULL mean in a database column?",
      options: [
        "The value is zero or empty string",
        "The value is false for boolean columns",
        "The absence of any value — this information simply does not exist for this row. It is not zero, not empty string, not false.",
        "The column has been deleted from the table",
      ],
      correct: 2,
    },
    {
      question:
        "Why does WHERE phone = NULL never return any rows, even when some rows have NULL phone values?",
      options: [
        "It is a syntax error — you should use WHERE phone == NULL instead",
        "NULL = NULL evaluates to NULL (unknown), not TRUE. SQL cannot confirm that two unknown values are equal. You must use IS NULL instead: WHERE phone IS NULL",
        "The database automatically converts NULL to empty string before comparison",
        "You need to use WHERE phone = 'NULL' (with quotes) to match NULL values",
      ],
      correct: 1,
    },
    {
      question:
        "What happens when you try to insert a row without providing a value for a NOT NULL column that has no DEFAULT?",
      options: [
        "The database automatically inserts NULL for missing values",
        "The database inserts an empty string for text columns and 0 for numeric columns",
        "The database rejects the insert with an error — NOT NULL constraint violation",
        "The database prompts you to enter a value interactively",
      ],
      correct: 2,
    },
    {
      question:
        "What is wrong with storing multiple values in one column like tags VARCHAR(500) = 'tech,programming,sql'?",
      options: [
        "VARCHAR(500) is not large enough for multiple values",
        "This violates first normal form — it makes querying specific tags extremely difficult (no index, requires string parsing), makes adding/removing individual tags complex, and prevents counting how many posts have a specific tag efficiently",
        "SQL does not allow commas inside VARCHAR values",
        "Nothing is wrong — this is a common and recommended approach for storing lists",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quel est le type de données correct pour stocker un prix de produit comme 29.99 ?",
      options: [
        "FLOAT — il gère efficacement les nombres décimaux",
        "DECIMAL(10, 2) — il stocke des nombres décimaux exacts sans erreurs d'arrondi, critique pour les données financières où 0.1 + 0.2 doit égaler exactement 0.30",
        "VARCHAR(10) — les prix sont assez courts pour être stockés en texte",
        "INTEGER — stocker juste le prix en centimes et diviser par 100 à l'affichage",
      ],
      correct: 1,
    },
    {
      question: "Que signifie NULL dans une colonne de base de données ?",
      options: [
        "La valeur est zéro ou une chaîne vide",
        "La valeur est fausse pour les colonnes booléennes",
        "L'absence de toute valeur — cette information n'existe tout simplement pas pour cette ligne. Ce n'est pas zéro, pas une chaîne vide, pas faux.",
        "La colonne a été supprimée de la table",
      ],
      correct: 2,
    },
    {
      question:
        "Pourquoi WHERE téléphone = NULL ne retourne-t-il jamais de lignes, même quand certaines lignes ont des valeurs NULL ?",
      options: [
        "C'est une erreur de syntaxe — vous devriez utiliser WHERE téléphone == NULL",
        "NULL = NULL s'évalue à NULL (inconnu), pas VRAI. SQL ne peut pas confirmer que deux valeurs inconnues sont égales. Vous devez utiliser IS NULL : WHERE téléphone IS NULL",
        "La base de données convertit automatiquement NULL en chaîne vide avant la comparaison",
        "Vous devez utiliser WHERE téléphone = 'NULL' (avec guillemets) pour correspondre aux valeurs NULL",
      ],
      correct: 1,
    },
    {
      question:
        "Que se passe-t-il quand vous essayez d'insérer une ligne sans fournir de valeur pour une colonne NOT NULL sans DEFAULT ?",
      options: [
        "La base de données insère automatiquement NULL pour les valeurs manquantes",
        "La base de données insère une chaîne vide pour les colonnes texte et 0 pour les numériques",
        "La base de données rejette l'insertion avec une erreur — violation de contrainte NOT NULL",
        "La base de données vous invite à entrer une valeur interactivement",
      ],
      correct: 2,
    },
    {
      question:
        "Qu'est-ce qui ne va pas avec le stockage de plusieurs valeurs dans une colonne comme tags VARCHAR(500) = 'tech,programmation,sql' ?",
      options: [
        "VARCHAR(500) n'est pas assez grand pour plusieurs valeurs",
        "Cela viole la première forme normale — cela rend l'interrogation de tags spécifiques extrêmement difficile (pas d'index, nécessite l'analyse de chaîne), complique l'ajout/suppression de tags individuels et empêche de compter efficacement les posts avec un tag spécifique",
        "SQL n'autorise pas les virgules dans les valeurs VARCHAR",
        "Rien ne va pas — c'est une approche courante et recommandée pour stocker des listes",
      ],
      correct: 1,
    },
  ],
};
