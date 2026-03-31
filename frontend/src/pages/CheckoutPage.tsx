import { useForm } from "react-hook-form";
import { CreditCard } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../utils";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import type { ShippingAddress } from "../types";

type CheckoutForm = ShippingAddress & { paymentMethod: "cod" | "card" | "banking" };

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({ defaultValues: { paymentMethod: "cod" } });

  const onSubmit = (data: CheckoutForm) => {
    console.log("Order payload:", data, items);
    // TODO: connect to orderService.createOrder()
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-indigo-600" />
        Thanh toán
      </h1>

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
              Đặt hàng
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
