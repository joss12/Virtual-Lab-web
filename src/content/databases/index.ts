import { introductionLessons } from "./introduction";
import { foundationsLessons } from "./foundations";
import { sqlDeepDiveLessons } from "./sql-deep-dive";
import { nosqlLessons } from "./nosql";
import { distributedLessons } from "./distributed";
import { advancedLessons } from "./advanced";

export const databasesContent = [
  {
    track: "Introduction",
    trackId: "introduction",
    description:
      "Start here — no experience needed. Tables, SQL basics, joins and aggregations explained from scratch.",
    lessons: introductionLessons,
  },
  {
    track: "Foundations",
    trackId: "foundations",
    description: "Database internals, storage engines, and query processing",
    lessons: foundationsLessons,
  },
  {
    track: "SQL Deep Dive",
    trackId: "sql-deep-dive",
    description:
      "PostgreSQL, MySQL, SQLite internals, query optimization and replication",
    lessons: sqlDeepDiveLessons,
  },
  {
    track: "NoSQL Systems",
    trackId: "nosql",
    description:
      "Key-value stores, document DBs, column stores, graph and time-series databases",
    lessons: nosqlLessons,
  },
  {
    track: "Distributed Databases",
    trackId: "distributed",
    description:
      "Consensus algorithms, CAP theorem, sharding, and distributed transactions",
    lessons: distributedLessons,
  },
  {
    track: "Advanced Topics",
    trackId: "advanced",
    description:
      "JIT compilation, lock-free structures, storage optimization and real-world case studies",
    lessons: advancedLessons,
  },
];
