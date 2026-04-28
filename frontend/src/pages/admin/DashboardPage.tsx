import { BarChart2, Package, ShoppingBag, Users } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "₫ 48,250,000", icon: BarChart2, color: "text-indigo-600 bg-indigo-100" },
  { label: "Total Orders", value: "312", icon: ShoppingBag, color: "text-emerald-600 bg-emerald-100" },
  { label: "Products", value: "184", icon: Package, color: "text-amber-600 bg-amber-100" },
  { label: "Users", value: "1,024", icon: Users, color: "text-rose-600 bg-rose-100" },
];

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

      
    </div>
  );
}
