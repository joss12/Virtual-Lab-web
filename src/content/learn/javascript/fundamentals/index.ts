import * as variablesAndTypes from "./variables-and-types";
import * as controlFlow from "./control-flow";
import * as functions from "./functions";
import * as arraysAndLoops from "./arrays-and-loops";
import * as objects from "./objects";
import * as domBasics from "./dom-basics";
import * as async from "./async-and-promises";

const make = (m: any) => ({
  id: m.id,
  titleEn: m.titleEn,
  titleFr: m.titleFr,
  content: m.content,
  starterCode: m.starterCode,
  exerciseEn: m.exerciseEn,
  exerciseFr: m.exerciseFr,
  solutionCode: m.solutionCode,
  quiz: m.quiz,
});

export const javascriptFundamentals = [
  make(variablesAndTypes),
  make(controlFlow),
  make(functions),
  make(arraysAndLoops),
  make(objects),
  make(domBasics),
  make(async),
];
