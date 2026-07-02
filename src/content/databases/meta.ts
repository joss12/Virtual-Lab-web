export const databasesMeta = [
  {
    track: "Introduction",
    trackId: "introduction",
    description:
      "Start here — no experience needed. Tables, SQL basics, joins and aggregations explained from scratch.",
    lessons: [
      { id: "what-is-a-database", title: "What Is a Database?" },
      { id: "tables-rows-columns", title: "Tables, Rows & Columns" },
      { id: "first-sql-queries", title: "Your First SQL Queries" },
      { id: "inserting-modifying-data", title: "Inserting & Modifying Data" },
      { id: "primary-foreign-keys", title: "Primary & Foreign Keys" },
      { id: "joins", title: "Joins" },
      { id: "aggregations", title: "Aggregations" },
    ],
  },
  {
    track: "Foundations",
    trackId: "foundations",
    description: "Database internals, storage engines, and query processing",
    lessons: [
      { id: "database-architecture", title: "Database Architecture" },
      { id: "data-structures", title: "Data Structures" },
      { id: "storage-engines", title: "Storage Engines" },
      { id: "transaction-management", title: "Transaction Management" },
      { id: "write-ahead-logging", title: "Write-Ahead Logging" },
      { id: "indexes", title: "Indexes" },
      { id: "query-processing", title: "Query Processing" },
    ],
  },
  {
    track: "SQL Deep Dive",
    trackId: "sql-deep-dive",
    description:
      "PostgreSQL, MySQL, SQLite internals, query optimization and replication",
    lessons: [
      { id: "postgresql-internals", title: "PostgreSQL Internals" },
      { id: "mysql-innodb", title: "MySQL / InnoDB" },
      { id: "sqlite-internals", title: "SQLite Internals" },
      { id: "query-optimization", title: "Query Optimization" },
      { id: "execution-plans", title: "Execution Plans" },
      { id: "concurrency-control", title: "Concurrency Control" },
      { id: "replication", title: "Replication" },
      { id: "performance-tuning", title: "Performance Tuning" },
    ],
  },
  {
    track: "NoSQL Systems",
    trackId: "nosql",
    description:
      "Key-value stores, document DBs, column stores, graph and time-series databases",
    lessons: [
      { id: "key-value-stores", title: "Key-Value Stores" },
      { id: "document-databases", title: "Document Databases" },
      { id: "column-stores", title: "Column Stores" },
      { id: "graph-databases", title: "Graph Databases" },
      { id: "time-series-databases", title: "Time-Series Databases" },
      { id: "search-engines", title: "Search Engines" },
      { id: "redis-internals", title: "Redis Internals" },
    ],
  },
  {
    track: "Distributed Databases",
    trackId: "distributed",
    description:
      "Consensus algorithms, CAP theorem, sharding, and distributed transactions",
    lessons: [
      { id: "distributed-consensus", title: "Distributed Consensus" },
      { id: "paxos", title: "Paxos Algorithm" },
      { id: "cap-theorem", title: "CAP Theorem" },
      { id: "replication-strategies", title: "Replication Strategies" },
      { id: "sharding", title: "Sharding" },
      { id: "distributed-transactions", title: "Distributed Transactions" },
      { id: "spanner-cockroachdb", title: "Spanner & CockroachDB" },
    ],
  },
  {
    track: "Advanced Topics",
    trackId: "advanced",
    description:
      "JIT compilation, lock-free structures, storage optimization and real-world case studies",
    lessons: [
      {
        id: "database-internals-deep-dive",
        title: "Database Internals Deep Dive",
      },
      { id: "lock-free-structures", title: "Lock-Free Data Structures" },
      { id: "query-compilation", title: "Query Compilation" },
      { id: "storage-optimization", title: "Storage Optimization" },
      { id: "real-world-case-studies", title: "Real-World Case Studies" },
    ],
  },
];
