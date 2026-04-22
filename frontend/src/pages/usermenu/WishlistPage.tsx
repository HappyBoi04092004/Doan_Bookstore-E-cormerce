import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, BookOpen } from "lucide-react";
import { useWishlist } from "../../hooks/useWishlist";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils";
import Button from "../../components/ui/Button";

export default function WishlistPage() {
  const { items, isLoading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 w-full">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách yêu thích</h1>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-rose-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Danh sách trống
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Bạn chưa lưu cuốn sách nào vào danh sách yêu thích. Hãy khám phá và thêm những cuốn sách bạn quan tâm nhé!
          </p>
          <Link to="/books">
            <Button>
              Khám phá sách ngay
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 p-5 hover:bg-gray-50 transition-colors"
            >
              {/* Image */}
              <Link to={`/books/${item.bookId}`} className="shrink-0 mx-auto sm:mx-0">
                <div className="h-32 w-24 rounded-lg bg-gray-100 overflow-hidden shadow-sm relative group">
                  <img
                    src={item.book.image || "https://placehold.co/100x150?text=Sách"}
                    alt={item.book.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://placehold.co/100x150?text=Sách";
                    }}
                  />
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between items-center sm:items-start text-center sm:text-left">
                <div>
                  <Link
                    to={`/books/${item.bookId}`}
                    className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2"
                  >
                    {item.book.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    bởi <span className="font-medium text-gray-700">{item.book.author.name}</span>
                  </p>
                  <p className="mt-2 font-bold text-indigo-600">
                    {formatPrice(item.book.price)}
                  </p>
                  <p className={`text-xs mt-1 ${item.book.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                    {item.book.stock > 0 ? `Còn ${item.book.stock} sản phẩm` : "Hết hàng"}
                  </p>
                </div>

                {/* Actions (Mobile) */}
                <div className="flex sm:hidden mt-4 gap-2 w-full justify-center">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    onClick={() => toggleWishlist(item.book)}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" /> Bỏ lưu
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={item.book.stock === 0}
                    onClick={() => addToCart(item.book)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1.5" /> Mua ngay
                  </Button>
                </div>
              </div>

              {/* Actions (Desktop) */}
              <div className="hidden sm:flex flex-col justify-center items-end gap-2 min-w-[140px]">
                <Button
                  className="w-full"
                  disabled={item.book.stock === 0}
                  onClick={() => addToCart(item.book)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1.5" /> Mua ngay
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  onClick={() => toggleWishlist(item.book)}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Bỏ lưu
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
