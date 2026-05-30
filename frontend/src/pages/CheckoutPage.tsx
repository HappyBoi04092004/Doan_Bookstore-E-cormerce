import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, CheckCircle2, QrCode } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../utils";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import AddressAutocomplete from "../components/common/AddressAutocomplete";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import type { Order } from "../types";

type CheckoutForm = {
  fullName: string;
  phone: string;
  street: string;
  addressSearch: string;
  provinceCode: number;
  wardCode: number;
  paymentMethod: "cod" | "banking";
};

const SEPAY_BANK_CODE = import.meta.env.VITE_SEPAY_BANK_CODE ?? "";
const SEPAY_ACCOUNT_NUMBER = import.meta.env.VITE_SEPAY_ACCOUNT_NUMBER ?? "";
const SEPAY_QR_TEMPLATE = import.meta.env.VITE_SEPAY_QR_TEMPLATE ?? "compact";

function getPaymentCode(orderId: number) {
  return `DH${orderId}`;
}

function buildSePayQrUrl(order: Order) {
  if (!SEPAY_BANK_CODE || !SEPAY_ACCOUNT_NUMBER) return null;

  const params = new URLSearchParams({
    acc: SEPAY_ACCOUNT_NUMBER,
    bank: SEPAY_BANK_CODE,
    amount: String(order.total),
    des: getPaymentCode(order.id),
    template: SEPAY_QR_TEMPLATE,
  });

  return `https://qr.sepay.vn/img?${params.toString()}`;
}

function submitSePayCheckout(paymentUrl: string, fields: Record<string, string | number | undefined>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentUrl;
  form.style.display = "none";

  Object.entries(fields).forEach(([name, value]) => {
    if (value === undefined) return;

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [orderError, setOrderError] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [isMockingPayment, setIsMockingPayment] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({ defaultValues: { paymentMethod: "cod" } });

  const selectedPaymentMethod = watch("paymentMethod");
  const qrUrl = useMemo(() => (pendingOrder ? buildSePayQrUrl(pendingOrder) : null), [pendingOrder]);

  useEffect(() => {
    if (!pendingOrder) return;

    const timer = window.setInterval(async () => {
      try {
        const latestOrder = await orderService.getOrderById(pendingOrder.id);
        setPendingOrder(latestOrder);

        if (latestOrder.status === "PAID") {
          window.clearInterval(timer);
          clearCart();
          navigate("/myorders", { state: { orderSuccess: true } });
        }
      } catch {
        window.clearInterval(timer);
      }
    }, 3000);

    return () => window.clearInterval(timer);
  }, [clearCart, navigate, pendingOrder]);

  const onSubmit = async (formData: CheckoutForm) => {
    setOrderError(null);

    if (items.length === 0) {
      setOrderError("Gio hang trong. Vui long them sach truoc khi dat hang.");
      return;
    }

    try {
      if (formData.paymentMethod === "banking") {
        const invoiceNumber = `DH${Date.now()}`;
        const payment = await paymentService.createSePayPayment({
          orderId: invoiceNumber,
          amount: totalPrice,
          items: items.map((item) => ({
            variantId: item.variant.id,
            quantity: item.quantity,
          })),
        });

        sessionStorage.setItem("sepayPendingOrderId", payment.orderId);

        submitSePayCheckout(payment.paymentUrl, payment.paymentFields);
        return;
      }

      const payload = {
        idempotencyKey: crypto.randomUUID(),
        items: items.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
        paymentMethod: formData.paymentMethod,
        address: {
          name: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          provinceCode: formData.provinceCode,
          wardCode: formData.wardCode,
        },
      };

      await orderService.createOrder(payload);

      clearCart();
      navigate("/myorders", { state: { orderSuccess: true } });
    } catch (err: any) {
      setOrderError(
        err?.response?.data?.message || "Dat hang that bai. Vui long thu lai."
      );
    }
  };

  const handleMockPayment = async () => {
    if (!pendingOrder) return;

    try {
      setIsMockingPayment(true);
      await orderService.markMockPaymentPaid(pendingOrder.id);
      clearCart();
      navigate("/myorders", { state: { orderSuccess: true } });
    } catch (err: any) {
      setOrderError(
        err?.response?.data?.message || "Gia lap thanh toan that bai. Vui long thu lai."
      );
    } finally {
      setIsMockingPayment(false);
    }
  };

  if (items.length === 0 && !pendingOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <p className="text-xl font-semibold text-gray-700">Gio hang trong</p>
        <a href="/books" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          Kham pha sach
        </a>
      </div>
    );
  }

  if (pendingOrder) {
    const paymentCode = getPaymentCode(pendingOrder.id);

    return (
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lai
        </Link>

        {orderError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {orderError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Quet QR SePay de thanh toan</h1>
                <p className="text-sm text-gray-500">Don hang #{pendingOrder.id} dang cho thanh toan.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[280px_1fr]">
              <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`QR thanh toan don hang ${pendingOrder.id}`}
                    className="h-64 w-64 object-contain"
                  />
                ) : (
                  <div className="text-center text-sm text-gray-600">
                    <p className="font-semibold text-gray-800">Chua cau hinh tai khoan SePay</p>
                    <p className="mt-2">Them `VITE_SEPAY_BANK_CODE` va `VITE_SEPAY_ACCOUNT_NUMBER` vao frontend `.env`.</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 text-sm">
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-500">So tien</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-600">{formatPrice(pendingOrder.total)}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-500">Noi dung chuyen khoan</p>
                  <p className="mt-1 font-mono text-lg font-bold text-gray-900">{paymentCode}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-gray-500">Trang thai</p>
                  <p className="mt-1 font-semibold text-yellow-700">Dang cho thanh toan</p>
                </div>
                <Button
                  type="button"
                  onClick={handleMockPayment}
                  isLoading={isMockingPayment}
                  className="w-full"
                  size="lg"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Gia lap da thanh toan
                </Button>
              </div>
            </div>
          </section>

          <aside className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-fit">
            <h2 className="font-semibold text-gray-900 text-lg">Tom tat don hang</h2>
            <div className="mt-4 flex justify-between border-t pt-4 font-bold text-gray-900">
              <span>Tong cong</span>
              <span className="text-indigo-600">{formatPrice(pendingOrder.total)}</span>
            </div>
          </aside>
        </div>
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
        Thanh toán
      </h1>

      {orderError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {orderError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]"
      >
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Địa chỉ nhận hàng</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Ho ten"
                {...register("fullName", { required: "Bat buoc" })}
                error={errors.fullName?.message}
              />
              <Input
                label="So dien thoai"
                {...register("phone", { required: "Bat buoc" })}
                error={errors.phone?.message}
              />
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố, Phường/Xã </label>
                <AddressAutocomplete
                  onSelect={(item) => {
                    setValue("addressSearch", item.fullAddress, { shouldValidate: true });
                    setValue("provinceCode", item.provinceCode);
                    setValue("wardCode", item.wardCode);
                  }}
                  error={errors.addressSearch?.message}
                />
                <input type="hidden" {...register("addressSearch", { required: "Vui lòng chọn địa chỉ" })} />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Địa chỉ chi tiết (Số nhà, đường...)"
                  {...register("street", { required: "Bắt buộc" })}
                  error={errors.street?.message}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
            <div className="space-y-2">
              {[
                { value: "cod", label: "Thanh toán khi nhận hàng" },
                { value: "banking", label: "Thanh toán bằng SePay" },
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

        <div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4 sticky top-24">
            <h2 className="font-semibold text-gray-900 text-lg">Tóm tắt đơn hàng</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {items.map((item) => (
                <li key={item.variant.id} className="flex justify-between gap-3">
                  <span className="truncate">
                    {item.variant.book.title} ({item.variant.name}) x {item.quantity}
                  </span>
                  <span>{formatPrice(item.variant.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
              <span>Tổng cộng</span>
              <span className="text-indigo-600">{formatPrice(totalPrice)}</span>
            </div>
            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
              {selectedPaymentMethod === "banking" ? "Thanh toán bằng SePay" : "Đặt hàng"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
