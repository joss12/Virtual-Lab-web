import * as whatIsADatabase from "./what-is-a-database";
import * as tablesRowsColumns from "./tables-rows-columns";
import * as firstSqlQueries from "./first-sql-queries";
import * as insertingModifyingData from "./inserting-modifying-data";
import * as primaryForeignKeys from "./primary-foreign-keys";
import * as joins from "./joins";
import * as aggregations from "./aggregations";

export const introductionLessons = [
  {
    id: "what-is-a-database",
    title: "What Is a Database?",
    content: whatIsADatabase.content,
    quiz: whatIsADatabase.quiz,
  },
  {
    id: "tables-rows-columns",
    title: "Tables, Rows & Columns",
    content: tablesRowsColumns.content,
    quiz: tablesRowsColumns.quiz,
  },
  {
    id: "first-sql-queries",
    title: "Your First SQL Queries",
    content: firstSqlQueries.content,
    quiz: firstSqlQueries.quiz,
  },
  {
    id: "inserting-modifying-data",
    title: "Inserting & Modifying Data",
    content: insertingModifyingData.content,
    quiz: insertingModifyingData.quiz,
  },
  {
    id: "primary-foreign-keys",
    title: "Primary & Foreign Keys",
    content: primaryForeignKeys.content,
    quiz: primaryForeignKeys.quiz,
  },
  { id: "joins", title: "Joins", content: joins.content, quiz: joins.quiz },
  {
    id: "aggregations",
    title: "Aggregations",
    content: aggregations.content,
    quiz: aggregations.quiz,
  },
];
