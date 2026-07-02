import * as bigONotation from "./big-o-notation";
import * as sortingAlgorithms from "./sorting-algorithms";
import * as searchingAlgorithms from "./searching-algorithms";
import * as recursion from "./recursion";
import * as dataStructures from "./data-structures";
import * as problemSolving from "./problem-solving";

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

export const pythonAlgorithms = [
  make(bigONotation),
  make(sortingAlgorithms),
  make(searchingAlgorithms),
  make(recursion),
  make(dataStructures),
  make(problemSolving),
];
