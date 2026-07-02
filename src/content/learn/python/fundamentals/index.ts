import * as variablesAndTypes from "./variables-and-types";
import * as controlFlow from "./control-flow";
import * as functions from "./functions";
import * as listsAndLoops from "./lists-and-loops";
import * as dictionaries from "./dictionaries";
import * as fileIo from "./file-io";
import * as classesAndOop from "./classes-and-oop";

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

export const pythonFundamentals = [
  make(variablesAndTypes),
  make(controlFlow),
  make(functions),
  make(listsAndLoops),
  make(dictionaries),
  make(fileIo),
  make(classesAndOop),
];
