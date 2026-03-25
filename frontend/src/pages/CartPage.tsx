import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../utils";
import CartItem from "../components/cart/CartItem";
import Button from "../components/ui/Button";

export default function CartPage() {
  const { items, totalItems, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-24 flex flex-col items-center gap-6 text-center">
        <ShoppingBag className="h-20 w-20 text-gray-200" />
        <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng của bạn đang trống</h1>
        <p className="text-gray-500">Hãy thêm sách vào giỏ và quay lại nhé!</p>
        <Link to="/books">
          <Button size="lg">Xem sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Giỏ hàng ({totalItems} sản phẩm)
        </h1>
        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Xóa giỏ hàng
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.book.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <CartItem item={item} />
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Tóm tắt đơn hàng</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tạm tính ({totalItems} sản phẩm)</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Phí vận chuyển</span>
            <span className="text-green-600 font-medium">Miễn phí</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-base">
            <span>Tổng cộng</span>
            <span className="text-indigo-600">{formatPrice(totalPrice)}</span>
          </div>
          <Link to="/checkout">
            <Button className="w-full" size="lg">
              Thanh toán <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Link to="/books">
            <Button variant="outline" className="w-full" size="md">
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
