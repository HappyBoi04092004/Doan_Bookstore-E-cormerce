import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CreditCard, CheckCircle, ArrowLeft } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../utils";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { orderService } from "../services/orderService";

type CheckoutForm = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode?: string;
  paymentMethod: "cod" | "banking";
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [orderError, setOrderError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({ defaultValues: { paymentMethod: "cod" } });

  const onSubmit = async (formData: CheckoutForm) => {
    setOrderError(null);

    if (items.length === 0) {
      setOrderError("Giỏ hàng trống. Vui lòng thêm sách trước khi đặt hàng.");
      return;
    }

    try {
      const payload = {
        idempotencyKey: crypto.randomUUID(),
        items: items.map((item) => ({
          bookId: item.book.id,
          quantity: item.quantity,
        })),
        paymentMethod: formData.paymentMethod,
      };

      await orderService.createOrder(payload);
      clearCart();
      navigate("/myorders", { state: { orderSuccess: true } });
    } catch (err: any) {
      setOrderError(
        err?.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại."
      );
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <p className="text-xl font-semibold text-gray-700">Giỏ hàng trống</p>
        <a href="/books" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          Khám phá sách
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại 
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-indigo-600" />
        Thanh toán
      </h1>

      {orderError && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {orderError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]"
      >
        {/* Left: Shipping + Payment */}
        <div className="space-y-6">
          {/* Shipping */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Địa chỉ nhận hàng</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Họ tên"
                {...register("fullName", { required: "Bắt buộc" })}
                error={errors.fullName?.message}
              />
              <Input
                label="Số điện thoại"
                {...register("phone", { required: "Bắt buộc" })}
                error={errors.phone?.message}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Địa chỉ"
                  {...register("street", { required: "Bắt buộc" })}
                  error={errors.street?.message}
                />
              </div>
              <Input
                label="Tỉnh/Thành phố"
                {...register("city", { required: "Bắt buộc" })}
                error={errors.city?.message}
              />
              <Input
                label="Quận/Huyện"
                {...register("province", { required: "Bắt buộc" })}
                error={errors.province?.message}
              />
              <Input
                label="Mã bưu điện"
                {...register("postalCode")}
                error={errors.postalCode?.message}
              />
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
            <div className="space-y-2">
              {[
                { value: "cod", label: "💵 Thanh toán khi nhận hàng" },
                { value: "banking", label: "🏦 Chuyển khoản ngân hàng" },
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-indigo-50/50 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50"
                >
                  <input
                    type="radio"
                    value={value}
                    {...register("paymentMethod")}
                    className="text-indigo-600"
                  />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 sticky top-24">
            <h2 className="font-semibold text-gray-900 text-lg">Tóm tắt đơn hàng</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {items.map((item) => (
                <li key={item.book.id} className="flex justify-between">
                  <span className="truncate max-w-[flex]">
                    {item.book.title} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.book.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
              <span>Tổng cộng</span>
              <span className="text-indigo-600">{formatPrice(totalPrice)}</span>
            </div>
            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              Đặt hàng
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
