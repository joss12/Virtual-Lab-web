import { create } from "zustand";
import { api } from "@/lib/api";
import type { Progress } from "@/types";

interface ProgressState {
  progress: Progress[];
  fetchProgress: () => Promise<void>;
  updateProgress: (
    component: string,
    tabsVisited: string[],
    completed: boolean,
  ) => Promise<void>;
  getComponentProgress: (component: string) => Progress | undefined;
}

export const useProgressStore = create<ProgressState>()((set, get) => ({
  progress: [],

  fetchProgress: async () => {
    try {
      const res = await api.get("/progress");
      set({ progress: res.data ?? [] });
    } catch {
      set({ progress: [] });
    }
  },

  updateProgress: async (
    component: string,
    tabsVisited: string[],
    completed: boolean,
  ) => {
    try {
      const res = await api.post(`/progress/${component}`, {
        tabs_visited: tabsVisited,
        completed,
      });
      set((state) => ({
        progress: [
          ...state.progress.filter((p) => p.component !== component),
          res.data,
        ],
      }));
    } catch {
      // silently fail
    }
  },

  getComponentProgress: (component: string) => {
    return get().progress.find((p) => p.component === component);
  },
}));
