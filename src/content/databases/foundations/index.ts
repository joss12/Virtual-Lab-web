import * as databaseArchitecture from "./database-architecture";
import * as dataStructures from "./data-structures";
import * as storageEngines from "./storage-engines";
import * as transactionManagement from "./transaction-management";
import * as writeAheadLogging from "./write-ahead-logging";
import * as indexes from "./indexes";
import * as queryProcessing from "./query-processing";

export const foundationsLessons = [
  {
    id: "database-architecture",
    title: "Database Architecture",
    content: databaseArchitecture.content,
    quiz: databaseArchitecture.quiz,
  },
  {
    id: "data-structures",
    title: "Data Structures",
    content: dataStructures.content,
    quiz: dataStructures.quiz,
  },
  {
    id: "storage-engines",
    title: "Storage Engines",
    content: storageEngines.content,
    quiz: storageEngines.quiz,
  },
  {
    id: "transaction-management",
    title: "Transaction Management",
    content: transactionManagement.content,
    quiz: transactionManagement.quiz,
  },
  {
    id: "write-ahead-logging",
    title: "Write-Ahead Logging",
    content: writeAheadLogging.content,
    quiz: writeAheadLogging.quiz,
  },
  {
    id: "indexes",
    title: "Indexes",
    content: indexes.content,
    quiz: indexes.quiz,
  },
  {
    id: "query-processing",
    title: "Query Processing",
    content: queryProcessing.content,
    quiz: queryProcessing.quiz,
  },
];
