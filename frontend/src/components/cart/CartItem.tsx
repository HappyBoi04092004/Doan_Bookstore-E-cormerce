import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "../../types";
import { formatPrice } from "../../utils";
import { useCart } from "../../hooks/useCart";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { book, quantity } = item;

  return (
    <div className="flex gap-3">
      <img
        src={book.image}
        alt={book.title}
        className="h-20 w-14 shrink-0 rounded-md object-cover bg-gray-100"
      />
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {book.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{typeof book.author === 'object' ? book.author?.name : book.author}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          {/* Quantity stepper */}
          <div className="flex items-center rounded-lg border border-gray-200">
            <button
              onClick={() => updateQuantity(book.id, quantity - 1)}
              className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-3 text-sm font-medium text-gray-800 min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(book.id, quantity + 1)}
              className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-indigo-600">
              {formatPrice(book.price * quantity)}
            </span>
            <button
              onClick={() => removeItem(book.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
