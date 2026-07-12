import { create } from "zustand";
import { persist } from "zustand/middleware";

type RecentSearchesState = {
  queries: string[];
  add: (query: string) => void;
  clear: () => void;
};

const MAX_RECENT = 6;

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set) => ({
      queries: [],
      add: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) return state;
          return {
            queries: [trimmed, ...state.queries.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(
              0,
              MAX_RECENT
            ),
          };
        }),
      clear: () => set({ queries: [] }),
    }),
    { name: "a2z-recent-searches" }
  )
);
