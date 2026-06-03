import { BarChart2, BookOpen, Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../services/dashboardService";
import { formatPrice } from "../../utils";

const statusLabel: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PAID: "Đã thanh toán",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  FAILED: "Thất bại",
};

function MiniBarChart({ data, color = "bg-indigo-500" }: { data: Array<{ month: string; value: number }>; color?: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="flex h-52 items-end gap-2 border-b border-l border-gray-200 px-3 py-2">
      {data.map((item) => (
        <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-40 w-full items-end">
            <div className={`w-full rounded-t ${color}`} style={{ height: `${Math.max((item.value / max) * 100, item.value > 0 ? 6 : 0)}%` }} />
          </div>
          <span className="text-xs text-gray-500">{item.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.getOverview,
  });

  const stats = [
    { label: "Tổng doanh thu", value: formatPrice(data?.stats?.totalRevenue ?? 0), icon: BarChart2, color: "text-indigo-600 bg-indigo-100" },
    { label: "Tổng đơn hàng", value: String(data?.stats?.totalOrders ?? 0), icon: ShoppingBag, color: "text-emerald-600 bg-emerald-100" },
    { label: "Tổng khách hàng", value: String(data?.stats?.totalCustomers ?? 0), icon: Users, color: "text-rose-600 bg-rose-100" },
    { label: "Tổng sách", value: String(data?.stats?.totalBooks ?? 0), icon: BookOpen, color: "text-amber-600 bg-amber-100" },
    { label: "Tổng vốn nhập", value: formatPrice(data?.stats?.totalImportCapital ?? 0), icon: Package, color: "text-sky-600 bg-sky-100" },
    { label: "Lợi nhuận tạm tính", value: formatPrice(data?.stats?.estimatedProfit ?? 0), icon: TrendingUp, color: "text-teal-600 bg-teal-100" },
  ];

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-gray-500">Đang tải tổng quan...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="mt-1 text-sm text-gray-500">Tình hình kinh doanh và kho hàng của nhà sách</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Doanh thu theo tháng</h2>
          <MiniBarChart data={data?.revenueByMonth ?? []} />
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Nhập kho theo tháng</h2>
          <MiniBarChart data={data?.importsByMonth ?? []} color="bg-emerald-500" />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Đơn hàng theo trạng thái</h2>
          <div className="space-y-3">
            {(data?.ordersByStatus ?? []).map((item: any) => (
              <div key={item.status} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                <span>{statusLabel[item.status] || item.status}</span>
                <span className="font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Sách sắp hết hàng</h2>
          <div className="space-y-3">
            {(data?.lowStockBooks ?? []).map((book: any) => (
              <div key={book.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="line-clamp-1 font-medium text-gray-800">{book.title}</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">{book.stock}</span>
              </div>
            ))}
            {(data?.lowStockBooks ?? []).length === 0 && <p className="text-sm text-gray-500">Không có sách sắp hết hàng</p>}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
          <div className="space-y-4 text-sm">
            {(data?.recentActivity?.orders ?? []).slice(0, 3).map((order: any) => (
              <p key={`order-${order.id}`}><span className="font-medium">Đơn hàng mới:</span> #{order.id} - {formatPrice(order.total)}</p>
            ))}
            {(data?.recentActivity?.importReceipts ?? []).slice(0, 3).map((receipt: any) => (
              <p key={`receipt-${receipt.id}`}><span className="font-medium">Phiếu nhập mới:</span> {receipt.code}</p>
            ))}
            {(data?.recentActivity?.users ?? []).slice(0, 3).map((user: any) => (
              <p key={`user-${user.id}`}><span className="font-medium">Người dùng mới:</span> {user.name}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
