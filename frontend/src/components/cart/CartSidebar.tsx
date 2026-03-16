import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils";
import CartItem from "./CartItem";

export default function CartSidebar() {
  const { items, isOpen, closeCart, totalPrice } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[380px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2.5">
            <ShoppingBag className="h-[18px] w-[18px] text-indigo-600" />
            Your Cart
            {items.length > 0 && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {items.length}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4.5 w-4.5 h-[18px] w-[18px]" />
          </button>
        </div>

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50">
                <ShoppingBag className="h-9 w-9 text-slate-300" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Your cart is empty</p>
                <p className="text-sm text-slate-400 mt-1">Add some books to get started</p>
              </div>
              <button
                onClick={closeCart}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 px-6 py-2">
              {items.map((item) => (
                <li key={item.book.id} className="py-4">
                  <CartItem item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-5 space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-[13px] text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-700">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px] text-slate-500">
              <span>Shipping</span>
              <span className="font-medium text-emerald-600">Free</span>
            </div>
            {/* Total */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 font-bold text-slate-900">
              <span>Total</span>
              <span className="text-indigo-600 text-[15px]">{formatPrice(totalPrice)}</span>
            </div>

            {/* Actions */}
            <Link
              to="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/cart"
              onClick={closeCart}
              className="flex items-center justify-center w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
