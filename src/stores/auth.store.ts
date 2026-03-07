import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  role: "listener" | "artist" | "admin";
  isPro: boolean;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, token) => {
        localStorage.setItem("auth_token", token);
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("auth_token");
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "auth-storage", // key in localStorage
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
