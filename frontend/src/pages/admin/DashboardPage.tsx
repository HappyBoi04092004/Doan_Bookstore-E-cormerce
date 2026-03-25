import { BarChart2, Package, ShoppingBag, Users } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "₫ 48,250,000", icon: BarChart2, color: "text-indigo-600 bg-indigo-100" },
  { label: "Total Orders", value: "312", icon: ShoppingBag, color: "text-emerald-600 bg-emerald-100" },
  { label: "Products", value: "184", icon: Package, color: "text-amber-600 bg-amber-100" },
  { label: "Users", value: "1,024", icon: Users, color: "text-rose-600 bg-rose-100" },
];

const recentOrders = [
  { id: "ORD-001", customer: "Nguyen Van A", amount: "₫ 320,000", status: "delivered" },
  { id: "ORD-002", customer: "Tran Thi B", amount: "₫ 150,000", status: "shipping" },
  { id: "ORD-003", customer: "Le Van C", amount: "₫ 560,000", status: "pending" },
  { id: "ORD-004", customer: "Pham Thi D", amount: "₫ 210,000", status: "confirmed" },
];

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipping: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trang quản trị</h1>
        <p className="text-sm text-gray-500 mt-1">Tổng quan về cửa hàng sách của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-4"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Đơn hàng gần đây</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {["Order ID", "Customer", "Amount", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm font-medium text-indigo-600">{order.id}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{order.customer}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{order.amount}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[order.status]}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
