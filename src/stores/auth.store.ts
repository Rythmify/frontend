import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  bio: string;
  email: string;
  avatar?: string;
  coverUrl?: string;
  role: "listener" | "artist" | "admin";
  isPro: boolean;
  city?: string;
  country?: string;
  location?: string;
  following_ids: string[];
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  toggleFollow: (username: string) => void;
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

      toggleFollow: (username) =>
        set((state) => {
          if (!state.user) return state;
          const isFollowing = state.user.following_ids.includes(username);
          return {
            user: {
              ...state.user,
              following_ids: isFollowing
                ? state.user.following_ids.filter((u) => u !== username)
                : [...state.user.following_ids, username],
            },
          };
        }),
    }),
    {
      name: "auth-storage", // key in localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
