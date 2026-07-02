import * as postgresqlInternals from "./postgresql-internals";
import * as mysqlInnodb from "./mysql-innodb";
import * as sqliteInternals from "./sqlite-internals";
import * as queryOptimization from "./query-optimization";
import * as executionPlans from "./execution-plans";
import * as concurrencyControl from "./concurrency-control";
import * as replication from "./replication";
import * as performanceTuning from "./performance-tuning";

export const sqlDeepDiveLessons = [
  {
    id: "postgresql-internals",
    title: "PostgreSQL Internals",
    content: postgresqlInternals.content,
    quiz: postgresqlInternals.quiz,
  },
  {
    id: "mysql-innodb",
    title: "MySQL / InnoDB",
    content: mysqlInnodb.content,
    quiz: mysqlInnodb.quiz,
  },
  {
    id: "sqlite-internals",
    title: "SQLite Internals",
    content: sqliteInternals.content,
    quiz: sqliteInternals.quiz,
  },
  {
    id: "query-optimization",
    title: "Query Optimization",
    content: queryOptimization.content,
    quiz: queryOptimization.quiz,
  },
  {
    id: "execution-plans",
    title: "Execution Plans",
    content: executionPlans.content,
    quiz: executionPlans.quiz,
  },
  {
    id: "concurrency-control",
    title: "Concurrency Control",
    content: concurrencyControl.content,
    quiz: concurrencyControl.quiz,
  },
  {
    id: "replication",
    title: "Replication",
    content: replication.content,
    quiz: replication.quiz,
  },
  {
    id: "performance-tuning",
    title: "Performance Tuning",
    content: performanceTuning.content,
    quiz: performanceTuning.quiz,
  },
];
