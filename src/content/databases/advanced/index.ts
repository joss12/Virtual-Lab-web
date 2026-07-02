import * as databaseInternalsDeepDive from "./database-internals-deep-dive";
import * as lockFreeStructures from "./lock-free-structures";
import * as queryCompilation from "./query-compilation";
import * as storageOptimization from "./storage-optimization";
import * as realWorldCaseStudies from "./real-world-case-studies";

export const advancedLessons = [
  {
    id: "database-internals-deep-dive",
    title: "Database Internals Deep Dive",
    content: databaseInternalsDeepDive.content,
    quiz: databaseInternalsDeepDive.quiz,
  },
  {
    id: "lock-free-structures",
    title: "Lock-Free Data Structures",
    content: lockFreeStructures.content,
    quiz: lockFreeStructures.quiz,
  },
  {
    id: "query-compilation",
    title: "Query Compilation",
    content: queryCompilation.content,
    quiz: queryCompilation.quiz,
  },
  {
    id: "storage-optimization",
    title: "Storage Optimization",
    content: storageOptimization.content,
    quiz: storageOptimization.quiz,
  },
  {
    id: "real-world-case-studies",
    title: "Real-World Case Studies",
    content: realWorldCaseStudies.content,
    quiz: realWorldCaseStudies.quiz,
  },
];
