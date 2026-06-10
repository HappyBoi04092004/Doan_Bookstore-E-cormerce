import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  BookOpen,
  Tag,
  PenLine,
  Building2,
  MessageSquare,
  Star,
  ClipboardList,
  Ticket,
} from "lucide-react";
import UserMenu from "../common/UserMenu";

const adminNav = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Sách", icon: Package, end: false },
  { to: "/admin/categories", label: "Danh mục", icon: Tag, end: false },
  { to: "/admin/coupons", label: "Mã giảm giá", icon: Ticket, end: false },
  { to: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag, end: false },
  { to: "/admin/import-receipts", label: "Phiếu nhập kho", icon: ClipboardList, end: false },
  { to: "/admin/suppliers", label: "Nhà cung cấp", icon: Building2, end: false },
  { to: "/admin/users", label: "Người dùng", icon: Users, end: false },
  { to: "/admin/authors", label: "Tác giả", icon: PenLine, end: false },
  { to: "/admin/publishers", label: "Nhà xuất bản", icon: Building2, end: false },
  { to: "/admin/contacts", label: "Liên hệ", icon: MessageSquare, end: false },
  { to: "/admin/reviews", label: "Đánh giá", icon: Star, end: false },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 shrink-0 bg-gray-900 text-white">
        <div className="flex items-center gap-2 border-b border-gray-700 px-6 py-5">
          <BookOpen className="h-6 w-6 text-indigo-400" />
          <span className="text-lg font-bold">Quản trị HPStore</span>
        </div>
        <nav className="mt-4 px-3">
          {adminNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-800">Trang quản trị</h1>
          <UserMenu />
        </header>
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
