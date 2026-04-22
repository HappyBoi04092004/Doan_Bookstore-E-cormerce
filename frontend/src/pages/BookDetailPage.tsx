import { useParams, Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useBook } from "../hooks/useBooks";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../utils";
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
        <p className="text-red-600 font-medium">Không tìm thấy sách.</p>
        <Link to="/books">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10">
      
      {/* Back */}
      <Link
        to="/books"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại 
      </Link>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr]">
        
        {/* Cover */}
        <div className="relative">
          <img
            src={book.image || "https://placehold.co/300x400?text=Sách"}
            alt={book.title}
            className="w-full object-cover transform hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/300x400?text=Sách";
            }}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <Badge variant="info">{book.category.name}</Badge>

            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              {book.title}
            </h1>

            <p className="text-gray-500 mt-1">
              được viết bởi <span className="font-medium">{book.author.name}</span>
            </p>
          </div>

          {/* Price */}
          <div>
            <span className="text-3xl font-bold text-indigo-600">
              {formatPrice(book.price)}
            </span>
          </div>

          {/* Stock */}
          <div>
            <p
              className={`font-medium ${
                book.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {book.stock > 0
                ? `Còn ${book.stock} sản phẩm`
                : "Hết hàng"}
            </p>
          </div>

          {/* Add to Cart */}
          <Button
            size="lg"
            disabled={book.stock === 0}
            onClick={() => addToCart(book)}
            className="mt-2 w-full sm:w-auto"
          >
            <ShoppingCart className="h-5 w-5 mr-1" />
            {book.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
          </Button>

          {/* Description */}
          {book.description && (
            <div className="mt-4 border-t pt-4">
              <h2 className="font-semibold text-gray-900 mb-2">
                Giới thiệu về sách
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {book.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}