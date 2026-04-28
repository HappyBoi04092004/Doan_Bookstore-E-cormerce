import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Book, BookVariant } from "../types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Computed getters (accessed as functions)
  totalItems: () => number;
  totalPrice: () => number;

  // Actions
  addItem: (variant: BookVariant & { book: Book }, quantity?: number) => void;
  removeItem: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== "object") return false;

  const candidate = item as CartItem;
  return (
    typeof candidate.quantity === "number" &&
    candidate.quantity > 0 &&
    !!candidate.variant &&
    typeof candidate.variant.id === "number" &&
    typeof candidate.variant.name === "string" &&
    typeof candidate.variant.price === "number" &&
    typeof candidate.variant.stock === "number" &&
    !!candidate.variant.book &&
    typeof candidate.variant.book.id === "number" &&
    typeof candidate.variant.book.title === "string"
  );
}

function sanitizeCartItems(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(isValidCartItem);
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
          (sum, item) => sum + item.variant.price * item.quantity,
          0
        ),

      addItem: (variant, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.variant.id === variant.id);
          if (existing) {
            if (existing.quantity + quantity > variant.stock) {
              alert("Số lượng vượt quá số lượng trong kho.");
              return state;
            }
            return {
              items: state.items.map((i) =>
                i.variant.id === variant.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          if (quantity > variant.stock) {
            alert("Không đủ số lượng trong kho.");
            return state;
          }
          return { items: [...state.items, { variant, quantity }] };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variant.id !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.variant.id === variantId) {
              if (quantity > i.variant.stock) {
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
      merge: (persistedState, currentState) => {
        const persistedItems =
          persistedState && typeof persistedState === "object" && "items" in persistedState
            ? sanitizeCartItems((persistedState as { items?: unknown }).items)
            : [];

        return {
          ...currentState,
          ...(persistedState as object),
          items: persistedItems,
        };
      },
    }
  )
);
