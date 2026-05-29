import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { paymentService, type PaymentStatus } from "../services/paymentService";
import Button from "../components/ui/Button";
import { useCart } from "../hooks/useCart";

type PaymentResult = "success" | "error" | "cancel";

const contentByResult = {
  success: {
    icon: CheckCircle2,
    title: "Thanh toan thanh cong",
    description: "SePay da chuyen huong ve website. Trang nay se cap nhat trang thai sau khi IPN duoc xu ly.",
    color: "text-green-600",
  },
  error: {
    icon: XCircle,
    title: "Thanh toan that bai",
    description: "Giao dich khong hoan tat. Vui long thu lai hoac chon phuong thuc khac.",
    color: "text-red-600",
  },
  cancel: {
    icon: AlertTriangle,
    title: "Da huy thanh toan",
    description: "Ban da huy giao dich tren SePay. Don hang van dang cho thanh toan.",
    color: "text-yellow-600",
  },
} satisfies Record<PaymentResult, {
  icon: typeof CheckCircle2;
  title: string;
  description: string;
  color: string;
}>;

export default function PaymentResultPage({ result }: { result: PaymentResult }) {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { clearCart } = useCart();
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isPolling, setIsPolling] = useState(result === "success" && Boolean(orderId));
  const page = contentByResult[result];
  const Icon = page.icon;

  useEffect(() => {
    if (result !== "success" || !orderId) return;

    const timer = window.setInterval(async () => {
      try {
        const nextStatus = await paymentService.getSePayPaymentStatus(orderId);
        setStatus(nextStatus);

        if (nextStatus.paymentStatus === "PAID" || nextStatus.orderStatus === "COMPLETED") {
          const pendingOrderId = sessionStorage.getItem("sepayPendingOrderId");
          if (!pendingOrderId || pendingOrderId === orderId) {
            clearCart();
            sessionStorage.removeItem("sepayPendingOrderId");
          }

          setIsPolling(false);
          window.clearInterval(timer);
        }
      } catch {
        setIsPolling(false);
        window.clearInterval(timer);
      }
    }, 2500);

    return () => window.clearInterval(timer);
  }, [clearCart, orderId, result]);

  return (
    <div className="container mx-auto max-w-xl px-4 sm:px-6 py-20">
      <section className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <Icon className={`mx-auto h-14 w-14 ${page.color}`} />
        <h1 className="mt-5 text-2xl font-bold text-gray-900">{page.title}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">{page.description}</p>

        {orderId && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Ma don hang</span>
              <span className="font-semibold text-gray-900">{orderId}</span>
            </div>
            <div className="mt-2 flex justify-between gap-4">
              <span className="text-gray-500">Trang thai thanh toan</span>
              <span className="font-semibold text-gray-900">
                {status?.paymentStatus ?? (isPolling ? "Dang cap nhat" : "Chua xac dinh")}
              </span>
            </div>
          </div>
        )}

        {isPolling && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Dang doi IPN tu SePay
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/myorders">
            <Button>Xem don hang</Button>
          </Link>
          <Link to="/books">
            <Button variant="outline">Tiep tuc mua sam</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
