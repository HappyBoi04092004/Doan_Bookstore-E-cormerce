import { useState } from "react";
import { Tag, X, CheckCircle, Loader2 } from "lucide-react";
import { couponService } from "../../services/couponService";
import type { ValidateCouponResponse } from "../../services/couponService";

interface CouponInputProps {
  orderTotal: number;
  onApply: (result: ValidateCouponResponse | null) => void;
  appliedCoupon: ValidateCouponResponse | null;
}

export default function CouponInput({ orderTotal, onApply, appliedCoupon }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Vui lòng nhập mã giảm giá");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await couponService.validateCoupon({
        code: trimmed,
        orderTotal,
      });
      onApply(result);
      setError(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Mã giảm giá không hợp lệ";
      setError(msg);
      onApply(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode("");
    setError(null);
    onApply(null);
  };

  const formatPrice = (n: number) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // Coupon already applied successfully
  if (appliedCoupon) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Mã <span className="font-mono bg-green-100 px-1.5 py-0.5 rounded">{appliedCoupon.coupon.code}</span> đã áp dụng!
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Giảm {formatPrice(appliedCoupon.discountAmount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-green-600 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-red-50"
            title="Xóa mã giảm giá"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Nhập mã giảm giá..."
            className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 transition-colors ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20"
            }`}
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          Áp dụng
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
