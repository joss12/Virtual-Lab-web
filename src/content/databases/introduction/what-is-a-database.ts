export const content = {
  en: `# What Is a Database?

## The Problem Databases Solve

Imagine you run a small online store. You start by tracking your orders in a spreadsheet. It works fine at first — 50 orders, 20 products, 10 customers. But as your business grows:

\`\`\`
Problems with spreadsheets at scale:
  500,000 orders → Excel crashes, Google Sheets slows to a crawl
  Two employees edit simultaneously → one overwrites the other's changes
  You want to find "all orders from customers in France over $100" → manual filtering nightmare
  Power outage mid-edit → file corrupted → data gone
  Someone accidentally deletes a column → no way to know what happened
\`\`\`

A **database** solves all of these problems. It is a structured system for storing, organizing, and retrieving data reliably — even when the data grows to billions of records and thousands of people access it simultaneously.

## What Is a Database Management System (DBMS)?

A database is the data itself. A **Database Management System (DBMS)** is the software that manages that data. When people say "PostgreSQL" or "MySQL", they mean the DBMS.

\`\`\`
Your application
      ↓ sends query (e.g. "give me all orders from today")
    DBMS  ← this is PostgreSQL, MySQL, SQLite, etc.
      ↓ finds and returns the data
   Database (the actual stored data on disk)
\`\`\`

The DBMS handles everything you don't want to think about:
- Storing data efficiently on disk
- Finding data quickly (indexes)
- Allowing many users to read/write simultaneously without conflicts
- Recovering data after a crash
- Enforcing rules (no negative prices, no duplicate email addresses)

## Types of Databases

There are many types, but two dominate:

### Relational Databases (SQL)
Data is stored in **tables** (like spreadsheets, but much more powerful). Tables relate to each other. You query data using **SQL** (Structured Query Language).

\`\`\`
Examples: PostgreSQL, MySQL, SQLite, Microsoft SQL Server, Oracle
Best for: structured data with clear relationships
          (e-commerce, banking, user management, most business applications)
\`\`\`

### NoSQL Databases
Data is stored in formats other than tables: documents (JSON), key-value pairs, graphs, etc. More flexible schema, often optimized for specific use cases.

\`\`\`
Examples: MongoDB (documents), Redis (key-value), Cassandra (wide-column)
Best for: unstructured data, very high write throughput, flexible schemas
          (social feeds, real-time analytics, caching)
\`\`\`

**For beginners: start with relational databases.** They are the foundation of the industry. Every developer needs to know SQL.

## A Relational Database in Plain English

Think of a relational database as a collection of spreadsheets (called **tables**) that can talk to each other.

\`\`\`
Table: customers
┌─────┬──────────┬───────────────────────┬─────────┐
│ id  │ name     │ email                 │ country │
├─────┼──────────┼───────────────────────┼─────────┤
│  1  │ Alice    │ alice@example.com     │ FR      │
│  2  │ Bob      │ bob@example.com       │ US      │
│  3  │ Carol    │ carol@example.com     │ DE      │
└─────┴──────────┴───────────────────────┴─────────┘

Table: orders
┌─────┬─────────────┬────────┬─────────────┐
│ id  │ customer_id │ total  │ created_at  │
├─────┼─────────────┼────────┼─────────────┤
│  1  │      1      │ 49.99  │ 2024-01-15  │
│  2  │      1      │ 129.00 │ 2024-02-03  │
│  3  │      2      │ 19.99  │ 2024-02-10  │
└─────┴─────────────┴────────┴─────────────┘
\`\`\`

Notice that orders don't repeat the customer's name and email. Instead, they store a \`customer_id\` that **references** the customers table. This is the core idea of relational databases: **store each piece of information once, reference it everywhere else.**

Benefits:
- If Alice changes her email, you update it in ONE place (customers table), not in every order
- No risk of inconsistency (orders and customers can't disagree about Alice's email)
- Less storage (store "FR" once per customer, not once per order)

## Popular Databases and When to Use Them

\`\`\`
SQLite:
  A database in a single file. No server needed.
  Perfect for: mobile apps, desktop apps, learning, small projects
  Used by: every iPhone and Android app (built into the OS)

PostgreSQL:
  The most powerful open-source relational database.
  Perfect for: web applications, startups to enterprises, complex queries
  Used by: Instagram, Spotify, Reddit, GitHub

MySQL:
  The world's most popular open-source relational database.
  Perfect for: web applications, especially PHP stacks
  Used by: Facebook (originally), Twitter (originally), WordPress

Microsoft SQL Server:
  Microsoft's enterprise database.
  Perfect for: Windows environments, .NET applications, enterprises
  
Oracle Database:
  Enterprise-grade, very expensive.
  Perfect for: large enterprises, banking, healthcare
  Used by: most Fortune 500 companies
\`\`\`

## How Data Is Actually Stored

You don't need to know this to use a database, but it helps to understand WHY databases are faster than files:

\`\`\`
Storing orders in a text file:
  1,1,49.99,2024-01-15
  2,1,129.00,2024-02-03
  3,2,19.99,2024-02-10
  
  Finding order #3: read file from the beginning until you find it
  With 10 million orders: read through all 10 million lines → SLOW

Database approach:
  Data stored in structured pages (like a filing cabinet with labeled drawers)
  Indexes created automatically (like a book's index — find "order #3" instantly)
  Finding order #3: check index → go directly to the right page → FAST
  
  With 10 million orders: still fast (milliseconds, not minutes)
\`\`\`

## Your First Interaction with a Database

Here is what interacting with a database looks like. Don't worry about the syntax yet — we'll cover it in the next lessons.

\`\`\`sql
-- Ask the database: "show me all customers from France"
SELECT name, email 
FROM customers 
WHERE country = 'FR';

-- Result:
-- name  | email
-- ------+-------------------
-- Alice | alice@example.com

-- Ask the database: "add a new customer"
INSERT INTO customers (name, email, country) 
VALUES ('David', 'david@example.com', 'FR');

-- Ask the database: "how many orders did each customer make?"
SELECT customer_id, COUNT(*) as order_count
FROM orders
GROUP BY customer_id;

-- Result:
-- customer_id | order_count
-- ------------+------------
--           1 |           2
--           2 |           1
\`\`\`

This is SQL — a language that has been the standard for talking to databases since the 1970s. It reads almost like English, which is why it has remained dominant for 50 years.

## Key Terms to Remember

\`\`\`
Database:    An organized collection of structured data
DBMS:        The software that manages the database (PostgreSQL, MySQL, etc.)
Table:       A collection of related data organized in rows and columns
Row:         One record in a table (also called a "tuple" or "record")
Column:      A field that holds one type of data (also called an "attribute")
SQL:         Structured Query Language — the language used to talk to relational databases
Query:       A question or command you send to the database
Schema:      The structure/blueprint of your database (which tables, which columns, what types)
\`\`\`
`,

  fr: `# Qu'est-ce qu'une base de données ?

## Le problème que les bases de données résolvent

Imaginez que vous gérez une petite boutique en ligne. Vous commencez par suivre vos commandes dans un tableur. Ça marche bien au début — 50 commandes, 20 produits, 10 clients. Mais à mesure que votre activité grandit :

\`\`\`
Problèmes avec les tableurs à grande échelle :
  500 000 commandes → Excel plante, Google Sheets devient très lent
  Deux employés éditent simultanément → l'un écrase les changements de l'autre
  Vous voulez "toutes les commandes de clients en France au-dessus de 100€" → filtrage manuel cauchemardesque
  Panne de courant en milieu d'édition → fichier corrompu → données perdues
  Quelqu'un supprime accidentellement une colonne → impossible de savoir ce qui s'est passé
\`\`\`

Une **base de données** résout tous ces problèmes. C'est un système structuré pour stocker, organiser et récupérer des données de manière fiable — même quand les données atteignent des milliards d'enregistrements et que des milliers de personnes y accèdent simultanément.

## Qu'est-ce qu'un Système de Gestion de Base de Données (SGBD) ?

Une base de données est la donnée elle-même. Un **Système de Gestion de Base de Données (SGBD)** est le logiciel qui gère ces données. Quand les gens disent "PostgreSQL" ou "MySQL", ils parlent du SGBD.

\`\`\`
Votre application
      ↓ envoie une requête ("donne-moi toutes les commandes d'aujourd'hui")
    SGBD  ← c'est PostgreSQL, MySQL, SQLite, etc.
      ↓ trouve et retourne les données
   Base de données (les données stockées sur disque)
\`\`\`

Le SGBD gère tout ce dont vous ne voulez pas vous préoccuper :
- Stocker les données efficacement sur disque
- Trouver les données rapidement (index)
- Permettre à de nombreux utilisateurs de lire/écrire simultanément sans conflits
- Récupérer les données après un crash
- Appliquer des règles (pas de prix négatifs, pas d'adresses email en double)

## Types de bases de données

Il en existe beaucoup, mais deux dominent :

### Bases de données relationnelles (SQL)
Les données sont stockées dans des **tables** (comme des tableurs, mais bien plus puissants). Les tables sont liées entre elles. Vous interrogez les données avec **SQL** (Structured Query Language).

\`\`\`
Exemples : PostgreSQL, MySQL, SQLite, Microsoft SQL Server, Oracle
Idéal pour : données structurées avec des relations claires
             (e-commerce, banque, gestion des utilisateurs, la plupart des applications métier)
\`\`\`

### Bases de données NoSQL
Les données sont stockées dans des formats autres que des tables : documents (JSON), paires clé-valeur, graphes, etc.

\`\`\`
Exemples : MongoDB (documents), Redis (clé-valeur), Cassandra (colonnes larges)
Idéal pour : données non structurées, débit d'écriture très élevé, schémas flexibles
\`\`\`

**Pour les débutants : commencez par les bases de données relationnelles.** Elles sont le fondement de l'industrie.

## Une base de données relationnelle en langage courant

Pensez à une base de données relationnelle comme une collection de tableurs (appelés **tables**) qui peuvent communiquer entre eux.

\`\`\`
Table : clients
┌─────┬──────────┬───────────────────────┬─────────┐
│ id  │ nom      │ email                 │ pays    │
├─────┼──────────┼───────────────────────┼─────────┤
│  1  │ Alice    │ alice@example.com     │ FR      │
│  2  │ Bob      │ bob@example.com       │ US      │
│  3  │ Carol    │ carol@example.com     │ DE      │
└─────┴──────────┴───────────────────────┴─────────┘

Table : commandes
┌─────┬────────────┬────────┬─────────────┐
│ id  │ client_id  │ total  │ créé_le     │
├─────┼────────────┼────────┼─────────────┤
│  1  │     1      │ 49.99  │ 2024-01-15  │
│  2  │     1      │ 129.00 │ 2024-02-03  │
│  3  │     2      │ 19.99  │ 2024-02-10  │
└─────┴────────────┴────────┴─────────────┘
\`\`\`

Les commandes ne répètent pas le nom et l'email du client. Au lieu de ça, elles stockent un \`client_id\` qui **référence** la table clients. C'est l'idée centrale des bases de données relationnelles : **stocker chaque information une seule fois, la référencer partout ailleurs.**

## Termes clés à retenir

\`\`\`
Base de données : Une collection organisée de données structurées
SGBD :           Le logiciel qui gère la base de données (PostgreSQL, MySQL, etc.)
Table :          Une collection de données liées organisées en lignes et colonnes
Ligne :          Un enregistrement dans une table (aussi appelé "tuple" ou "enregistrement")
Colonne :        Un champ qui contient un type de données (aussi appelé "attribut")
SQL :            Structured Query Language — le langage pour parler aux bases relationnelles
Requête :        Une question ou commande envoyée à la base de données
Schéma :         La structure/plan de votre base de données
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What is the main difference between a database and a spreadsheet for large-scale data?",
      options: [
        "Databases use more storage space than spreadsheets",
        "Databases handle millions of records efficiently, support simultaneous access by many users without conflicts, recover from crashes, and enforce data rules — spreadsheets break down at scale with corruption risks, no concurrent editing, and slow performance",
        "Databases can only store numbers while spreadsheets store any type of data",
        "Databases require an internet connection while spreadsheets work offline",
      ],
      correct: 1,
    },
    {
      question: "What is a DBMS and how does it relate to a database?",
      options: [
        "A DBMS and a database are the same thing — just different names",
        "A DBMS (Database Management System) is the software (like PostgreSQL or MySQL) that manages the database. The database is the actual stored data. Your application talks to the DBMS, which then reads and writes the underlying data.",
        "A DBMS is a type of database used only for large enterprises",
        "A DBMS is a programming language used to write database queries",
      ],
      correct: 1,
    },
    {
      question:
        "Why does a relational database store a customer_id in the orders table instead of repeating the customer's name and email?",
      options: [
        "Because customer names and emails are too long to store in an orders table",
        "To store each piece of information once and reference it everywhere else — if a customer changes their email, you update it in one place (customers table) not in every single order row, preventing inconsistency and saving storage",
        "Because SQL does not support storing text in orders tables",
        "To make queries faster by reducing the amount of text the database must process",
      ],
      correct: 1,
    },
    {
      question:
        "Which database would be most appropriate for a beginner building a personal project or learning SQL?",
      options: [
        "Oracle Database — it is the most powerful and teaches best practices",
        "SQLite — it is a database in a single file requiring no server setup, built into most operating systems, perfect for learning and small projects",
        "Cassandra — it scales to billions of records which is good for future growth",
        "Microsoft SQL Server — it has the best documentation for beginners",
      ],
      correct: 1,
    },
    {
      question:
        "Why are databases faster than searching through a text file when looking for a specific record?",
      options: [
        "Databases compress data so there is less to search through",
        "Databases store data in structured pages and create indexes — like a book's index, an index lets the database jump directly to the right location instead of reading through every record from the beginning",
        "Databases use faster hardware than regular files",
        "Databases store data in alphabetical order making binary search possible",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quelle est la principale différence entre une base de données et un tableur pour les données à grande échelle ?",
      options: [
        "Les bases de données utilisent plus d'espace de stockage que les tableurs",
        "Les bases de données gèrent des millions d'enregistrements efficacement, supportent l'accès simultané par de nombreux utilisateurs sans conflits, récupèrent après des pannes et appliquent des règles de données — les tableurs tombent en panne à grande échelle avec des risques de corruption, pas d'édition simultanée et des performances lentes",
        "Les bases de données ne peuvent stocker que des nombres tandis que les tableurs stockent n'importe quel type de données",
        "Les bases de données nécessitent une connexion internet tandis que les tableurs fonctionnent hors ligne",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce qu'un SGBD et comment est-il lié à une base de données ?",
      options: [
        "Un SGBD et une base de données sont la même chose — juste des noms différents",
        "Un SGBD (Système de Gestion de Base de Données) est le logiciel (comme PostgreSQL ou MySQL) qui gère la base de données. La base de données est la donnée réellement stockée. Votre application parle au SGBD, qui lit et écrit ensuite les données sous-jacentes.",
        "Un SGBD est un type de base de données utilisé uniquement par les grandes entreprises",
        "Un SGBD est un langage de programmation utilisé pour écrire des requêtes de base de données",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi une base de données relationnelle stocke-t-elle un client_id dans la table des commandes au lieu de répéter le nom et l'email du client ?",
      options: [
        "Parce que les noms et emails des clients sont trop longs pour être stockés dans une table de commandes",
        "Pour stocker chaque information une seule fois et la référencer partout ailleurs — si un client change son email, vous le mettez à jour à un seul endroit (table clients) et non dans chaque ligne de commande, évitant les incohérences et économisant de l'espace",
        "Parce que SQL ne supporte pas le stockage de texte dans les tables de commandes",
        "Pour rendre les requêtes plus rapides en réduisant la quantité de texte à traiter",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle base de données serait la plus appropriée pour un débutant construisant un projet personnel ou apprenant SQL ?",
      options: [
        "Oracle Database — c'est la plus puissante et enseigne les meilleures pratiques",
        "SQLite — c'est une base de données dans un seul fichier ne nécessitant pas de serveur, intégrée dans la plupart des systèmes d'exploitation, parfaite pour l'apprentissage et les petits projets",
        "Cassandra — elle passe à l'échelle de milliards d'enregistrements ce qui est bien pour la croissance future",
        "Microsoft SQL Server — elle a la meilleure documentation pour les débutants",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi les bases de données sont-elles plus rapides que la recherche dans un fichier texte pour trouver un enregistrement spécifique ?",
      options: [
        "Les bases de données compressent les données donc il y en a moins à chercher",
        "Les bases de données stockent les données dans des pages structurées et créent des index — comme l'index d'un livre, un index permet à la base de données de sauter directement au bon endroit au lieu de lire tous les enregistrements depuis le début",
        "Les bases de données utilisent du matériel plus rapide que les fichiers réguliers",
        "Les bases de données stockent les données par ordre alphabétique rendant la recherche binaire possible",
      ],
      correct: 1,
    },
  ],
};
