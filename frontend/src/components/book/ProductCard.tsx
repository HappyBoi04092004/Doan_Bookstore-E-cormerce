import { Link } from "react-router-dom";
import { ShoppingCart, Tag, User } from "lucide-react";
import type { Book } from "../../types";
import { useCart } from "../../hooks/useCart";
import Badge from "../ui/Badge";

interface ProductCardProps {
  book: Book;
}

export default function ProductCard({ book }: ProductCardProps) {
  const { addToCart } = useCart();
  const firstVariant = book.variants?.[0];
  const outOfStock = book.stock === 0;

  return (
    <Link to={`/books/${book.id}`} className="group block h-full">
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
        <div className="relative h-64 overflow-hidden bg-gray-50">
          <img
            src={book.primaryImage || firstVariant?.primaryImage || "https://placehold.co/200x240?text=Sách"}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/200x240?text=Sách";
            }}
          />
          <div className="absolute inset-0 bg-black/0 duration-300 group-hover:bg-black/5" />
          <div className="absolute right-3 top-3">
            <Badge variant={book.stock > 0 ? "success" : "danger"} className="shadow-sm">
              {book.stock > 0 ? `${book.stock} còn hàng` : "Hết hàng"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Tag className="h-3 w-3" />
              {typeof book.category === "object" ? book.category.name : book.category}
            </div>
          </div>

          <h3 className="mb-2 line-clamp-2 text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-indigo-600">
            {book.title}
          </h3>

          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600">
            <div className="rounded-full bg-gray-100 p-1.5">
              <User className="h-3.5 w-3.5" />
            </div>
            <span>{typeof book.author === "object" ? book.author.name : book.author}</span>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-tighter text-gray-400">Giá</span>
              <span className="text-2xl font-black text-gray-900">
                {book.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
              </span>
            </div>
            <button
              disabled={outOfStock}
              onClick={(e) => {
                e.preventDefault();
                if (firstVariant) {
                  addToCart({ ...firstVariant, book });
                }
              }}
              className="rounded-xl bg-gray-900 p-3 text-white shadow-lg shadow-gray-200 transition-all hover:bg-indigo-600 hover:shadow-indigo-200 disabled:opacity-30 disabled:hover:bg-gray-900"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Thêm vào giỏ</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
