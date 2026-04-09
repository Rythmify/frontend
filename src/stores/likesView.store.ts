import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LikesViewStore {
  view: "grid" | "list";
  setView: (view: "grid" | "list") => void;
}

export const useLikesViewStore = create<LikesViewStore>()(
  persist(
    (set) => ({
      view: "grid",
      setView: (view) => set({ view }),
    }),
    { name: "likes-view" },
  ),
);
