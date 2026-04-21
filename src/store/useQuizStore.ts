import { create } from "zustand";
import { api } from "@/lib/api";
import type { QuizScore } from "@/types";

interface QuizState {
  currentIndex: number;
  answer: string | null;
  score: number;
  isDone: boolean;
  scores: QuizScore[];
  answerQuestion: (answer: string, correct: string) => void;
  nextQuestion: (total: number) => void;
  saveScore: (total: number, component?: string) => Promise<void>;
  fetchScores: () => Promise<void>;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  currentIndex: 0,
  score: 0,
  answer: null,
  isDone: false,
  scores: [],

  answerQuestion: (answer: string, correct: string) => {
    set((state) => ({
      answer,
      score: answer === correct ? state.score + 1 : state.score,
    }));
  },

  nextQuestion: (total: number) => {
    const { currentIndex } = get();
    if (currentIndex + 1 >= total) {
      set({ isDone: true });
    } else {
      set((state) => ({ currentIndex: state.currentIndex + 1, answer: null }));
    }
  },

  saveScore: async (total: number, component?: string) => {
    try {
      const { score } = get();
      await api.post("/quiz/score", { score, total, component });
    } catch {
      // silently fail
    }
  },

  fetchScores: async () => {
    try {
      const res = await api.get("/quiz/scores");
      set({ scores: res.data ?? [] });
    } catch {
      set({ scores: [] });
    }
  },

  reset: () => {
    set({ currentIndex: 0, score: 0, answer: null, isDone: false });
  },
}));
