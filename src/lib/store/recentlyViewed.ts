import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_ITEMS = 12;

type RecentlyViewedState = {
  productIds: string[];
  record: (productId: string) => void;
};

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      productIds: [],
      record: (productId) =>
        set((state) => ({
          productIds: [productId, ...state.productIds.filter((id) => id !== productId)].slice(0, MAX_ITEMS),
        })),
    }),
    { name: "a2z-recently-viewed" }
  )
);
