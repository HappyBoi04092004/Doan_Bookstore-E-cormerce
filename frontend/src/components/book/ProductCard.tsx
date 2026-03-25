import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import type { Book } from "../../types";
import { formatPrice, discountPercent } from "../../utils";
import { useCart } from "../../hooks/useCart";
import Badge from "../ui/Badge";

interface ProductCardProps {
  book: Book;
}

export default function ProductCard({ book }: ProductCardProps) {
  const { addToCart } = useCart();
  const discount = discountPercent(book.originalPrice ?? 0, book.price);
  const outOfStock = book.stock === 0;

  return (
    <div className="group flex flex-col h-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* ── Cover ── */}
      <Link
        to={`/books/${book.id}`}
        className="relative block overflow-hidden bg-slate-100 aspect-[3/4]"
      >
        <img
          src={book.coverImage}
          alt={book.title}
          className="h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
        />
        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5">
            <Badge variant="danger">−{discount}%</Badge>
          </span>
        )}
        {/* Out-of-stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-slate-800/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Category */}
        <Badge variant="info" className="self-start text-[11px]">
          {book.category.name}
        </Badge>

        {/* Title */}
        <Link to={`/books/${book.id}`}>
          <h3 className="text-[13.5px] font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {book.title}
          </h3>
        </Link>

        {/* Author */}
        <p className="text-[12px] text-slate-400 font-medium">{typeof book.author === 'object' ? book.author?.name : book.author}</p>

        {/* Rating — pushed to bottom */}
        <div className="flex items-center gap-1 mt-auto pt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.round(book.rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-200"
              }`}
            />
          ))}
          <span className="ml-1 text-[11px] font-medium text-slate-600">
            {book.rating.toFixed(1)}
          </span>
          <span className="text-[11px] text-slate-400">({book.reviewCount})</span>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 my-0.5" />

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-indigo-600 leading-tight">
              {formatPrice(book.price)}
            </span>
            {book.originalPrice && book.originalPrice > book.price && (
              <span className="text-[11px] text-slate-400 line-through leading-tight">
                {formatPrice(book.originalPrice)}
              </span>
            )}
          </div>
          <button
            onClick={() => addToCart(book)}
            disabled={outOfStock}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
