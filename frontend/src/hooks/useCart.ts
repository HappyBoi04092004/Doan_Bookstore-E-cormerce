import { useCartStore } from "../stores/cartStore";
import type { Book } from "../types";

export function useCart() {
  const store = useCartStore();

  const addToCart = (book: Book, quantity = 1) => {
    store.addItem(book, quantity);
    store.openCart();
  };

  return {
    items: store.items,
    isOpen: store.isOpen,
    totalItems: store.totalItems(),
    totalPrice: store.totalPrice(),
    addToCart,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    toggleCart: store.toggleCart,
    openCart: store.openCart,
    closeCart: store.closeCart,
  };
}
