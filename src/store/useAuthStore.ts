"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,

      setToken: (token: string) => {
        localStorage.setItem("token", token);
        document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        set({ token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; max-age=0";
        set({ token: null, isAuthenticated: false });
      },
    }),
    {
      name: "vlab-auth",
    },
  ),
);
