import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistItem } from "../services/wishlistService";

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  
  // Actions
  setWishlist: (items: WishlistItem[]) => void;
  addWishlistItem: (item: WishlistItem) => void;
  removeWishlistItem: (bookId: number) => void;
  setLoading: (loading: boolean) => void;
  clearWishlist: () => void;
  
  // Computed (getters)
  isWishlisted: (bookId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      setWishlist: (items) => set({ items }),
      
      addWishlistItem: (item) => set((state) => {
        if (state.items.find((i) => i.bookId === item.bookId)) {
          return state;
        }
        return { items: [item, ...state.items] };
      }),

      removeWishlistItem: (bookId) => set((state) => ({
        items: state.items.filter((i) => i.bookId !== bookId)
      })),

      setLoading: (isLoading) => set({ isLoading }),

      clearWishlist: () => set({ items: [] }),

      isWishlisted: (bookId) => get().items.some(i => i.bookId === bookId),
    }),
    {
      name: "bookstore-wishlist",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
