import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Book } from "../types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Computed getters (accessed as functions)
  totalItems: () => number;
  totalPrice: () => number;

  // Actions
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (bookId: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.book.price * item.quantity,
          0
        ),

      addItem: (book, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.book.id === book.id);
          if (existing) {
            if (existing.quantity + quantity > book.stock) {
              alert("Số lượng vượt quá số lượng trong kho.");
              return state;
            }
            return {
              items: state.items.map((i) =>
                i.book.id === book.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          if (quantity > book.stock) {
            alert("Không đủ số lượng trong kho.");
            return state;
          }
          return { items: [...state.items, { book, quantity }] };
        });
      },

      removeItem: (bookId) => {
        set((state) => ({
          items: state.items.filter((i) => i.book.id !== bookId),
        }));
      },

      updateQuantity: (bookId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(bookId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.book.id === bookId) {
              if (quantity > i.book.stock) {
                alert("Vượt quá hàng trong kho!");
                return i;
              }
              return { ...i, quantity };
            }
            return i;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "bookstore-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
