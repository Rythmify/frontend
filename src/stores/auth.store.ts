import type { GenderType } from "@/services/auth.service";
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
  followers_ids?: string[];
  date_of_birth?: string | null;
  gender?: GenderType | null;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  /**
  
   * @param username 
   * @param extraIds 
 
   */
  toggleFollow: (username: string, extraIds?: string[]) => void;
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

      toggleFollow: (username, extraIds = []) =>
        set((state) => {
          if (!state.user) return state;

          // Collect all identifiers for this profile (deduplicated)
          const allIds = Array.from(
            new Set([username, ...extraIds].filter(Boolean)),
          );

          // Currently following if ANY of the ids is already tracked
          const isFollowing = allIds.some((id) =>
            state.user!.following_ids.includes(id),
          );

          const following_ids = isFollowing
            ? // Unfollow: remove every identifier for this profile
              state.user.following_ids.filter((id) => !allIds.includes(id))
            : // Follow: add any identifier not already present
              [
                ...state.user.following_ids,
                ...allIds.filter(
                  (id) => !state.user!.following_ids.includes(id),
                ),
              ];

          return { user: { ...state.user, following_ids } };
        }),
    }),
    {
      name: "auth-storage",
      version: 1,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
