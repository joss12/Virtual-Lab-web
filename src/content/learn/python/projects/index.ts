import * as calculator from "./calculator";
import * as gradeManager from "./grade-manager";
import * as passwordGenerator from "./password-generator";
import * as contactBook from "./contact-book";
import * as bankAccount from "./bank-account";
import * as quizGame from "./quiz-game";

const make = (m: any) => ({
  id: m.id,
  titleEn: m.titleEn,
  titleFr: m.titleFr,
  descriptionEn: m.descriptionEn,
  descriptionFr: m.descriptionFr,
  steps: m.steps,
});

export const pythonProjects: Record<string, any> = {
  calculator: make(calculator),
  "grade-manager": make(gradeManager),
  "password-generator": make(passwordGenerator),
  "contact-book": make(contactBook),
  "bank-account": make(bankAccount),
  "quiz-game": make(quizGame),
};
