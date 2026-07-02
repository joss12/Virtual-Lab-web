import * as unitConverter from "./unit-converter";
import * as inventoryTracker from "./inventory-tracker";
import * as todoList from "./todo-list";
import * as wordFrequency from "./word-frequency";
import * as jsonDatabase from "./json-database";
import * as expenseTracker from "./expense-tracker";

const make = (m: any) => ({
  id: m.id,
  titleEn: m.titleEn,
  titleFr: m.titleFr,
  descriptionEn: m.descriptionEn,
  descriptionFr: m.descriptionFr,
  steps: m.steps,
});

export const javascriptProjects: Record<string, any> = {
  "unit-converter": make(unitConverter),
  "inventory-tracker": make(inventoryTracker),
  "todo-list": make(todoList),
  "word-frequency": make(wordFrequency),
  "json-database": make(jsonDatabase),
  "expense-tracker": make(expenseTracker),
};
