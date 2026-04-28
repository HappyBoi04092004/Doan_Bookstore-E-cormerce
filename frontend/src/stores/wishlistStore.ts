import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistItem } from "../services/wishlistService";

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  
  // Actions
  setWishlist: (items: WishlistItem[]) => void;
  addWishlistItem: (item: WishlistItem) => void;
  removeWishlistItem: (variantId: number) => void;
  setLoading: (loading: boolean) => void;
  clearWishlist: () => void;
  
  // Computed (getters)
  isWishlisted: (variantId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      setWishlist: (items) => set({ items }),
      
      addWishlistItem: (item) => set((state) => {
        if (state.items.find((i) => i.variantId === item.variantId)) {
          return state;
        }
        return { items: [item, ...state.items] };
      }),

      removeWishlistItem: (variantId) => set((state) => ({
        items: state.items.filter((i) => i.variantId !== variantId)
      })),

      setLoading: (isLoading) => set({ isLoading }),

      clearWishlist: () => set({ items: [] }),

      isWishlisted: (variantId) => get().items.some(i => i.variantId === variantId),
    }),
    {
      name: "bookstore-wishlist",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
