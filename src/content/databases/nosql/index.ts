import * as keyValueStores from "./key-value-stores";
import * as documentDatabases from "./document-databases";
import * as columnStores from "./column-stores";
import * as graphDatabases from "./graph-databases";
import * as timeSeriesDatabases from "./time-series-databases";
import * as searchEngines from "./search-engines";
import * as redisInternals from "./redis-internals";

export const nosqlLessons = [
  { id: "key-value-stores",      title: "Key-Value Stores",      content: keyValueStores.content,      quiz: keyValueStores.quiz },
  { id: "document-databases",    title: "Document Databases",    content: documentDatabases.content,    quiz: documentDatabases.quiz },
  { id: "column-stores",         title: "Column Stores",         content: columnStores.content,         quiz: columnStores.quiz },
  { id: "graph-databases",       title: "Graph Databases",       content: graphDatabases.content,       quiz: graphDatabases.quiz },
  { id: "time-series-databases", title: "Time-Series Databases", content: timeSeriesDatabases.content,  quiz: timeSeriesDatabases.quiz },
  { id: "search-engines",        title: "Search Engines",        content: searchEngines.content,        quiz: searchEngines.quiz },
  { id: "redis-internals",       title: "Redis Internals",       content: redisInternals.content,       quiz: redisInternals.quiz },
];
