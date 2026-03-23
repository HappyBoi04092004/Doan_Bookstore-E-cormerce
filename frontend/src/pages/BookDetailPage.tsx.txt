import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, ArrowLeft, Tag } from "lucide-react";
import { useBook } from "../hooks/useBooks";
import { useCart } from "../hooks/useCart";
import { formatPrice, discountPercent } from "../utils";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading, error } = useBook(id ?? "");
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-red-600 font-medium">Book not found.</p>
        <Link to="/books">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Books
          </Button>
        </Link>
      </div>
    );
  }

  const discount = discountPercent(book.originalPrice ?? 0, book.price);

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10">
      {/* Back */}
      <Link to="/books" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Books
      </Link>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr]">
        {/* Cover */}
        <div className="relative">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full rounded-xl object-cover shadow-md"
          />
          {discount > 0 && (
            <span className="absolute top-3 left-3">
              <Badge variant="danger">-{discount}%</Badge>
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <Badge variant="info">{book.category.name}</Badge>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">{book.title}</h1>
            <p className="text-gray-500 mt-1">by <span className="font-medium">{book.author}</span></p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(book.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
              />
            ))}
            <span className="text-sm font-medium text-gray-700">{book.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({book.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-indigo-600">{formatPrice(book.price)}</span>
            {book.originalPrice && book.originalPrice > book.price && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(book.originalPrice)}</span>
            )}
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-gray-400 text-xs">ISBN</p>
              <p className="font-medium text-gray-700">{book.isbn}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-gray-400 text-xs">In Stock</p>
              <p className={`font-medium ${book.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                {book.stock > 0 ? `${book.stock} copies` : "Out of stock"}
              </p>
            </div>
          </div>

          {/* Tags */}
          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <Tag className="h-3.5 w-3.5 text-gray-400" />
              {book.tags.map((tag) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Add to Cart */}
          <Button
            size="lg"
            disabled={book.stock === 0}
            onClick={() => addToCart(book)}
            className="mt-2 w-full sm:w-auto"
          >
            <ShoppingCart className="h-5 w-5 mr-1" />
            {book.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>

          {/* Description */}
          <div className="mt-4 border-t pt-4">
            <h2 className="font-semibold text-gray-900 mb-2">About this book</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{book.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
