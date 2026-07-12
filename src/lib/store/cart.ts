import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartLine } from "@/lib/types";

type CartState = {
  lines: CartLine[];
  addItem: (productId: string, colorway?: string) => void;
  removeItem: (productId: string, colorway?: string) => void;
  setQuantity: (productId: string, quantity: number, colorway?: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addItem: (productId, colorway) =>
        set((state) => {
          const existing = state.lines.find(
            (l) => l.productId === productId && l.colorway === colorway
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === productId && l.colorway === colorway
                  ? { ...l, quantity: l.quantity + 1 }
                  : l
              ),
            };
          }
          return { lines: [...state.lines, { productId, quantity: 1, colorway }] };
        }),
      removeItem: (productId, colorway) =>
        set((state) => ({
          lines: state.lines.filter(
            (l) => !(l.productId === productId && l.colorway === colorway)
          ),
        })),
      setQuantity: (productId, quantity, colorway) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.productId === productId && l.colorway === colorway
                ? { ...l, quantity }
                : l
            )
            .filter((l) => l.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "a2z-cart" }
  )
);
