import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  BookOpen,
} from "lucide-react";
import UserMenu from "../common/UserMenu";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, end: false },
  { to: "/admin/users", label: "Users", icon: Users, end: false },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-gray-900 text-white">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
          <BookOpen className="h-6 w-6 text-indigo-400" />
          <span className="font-bold text-lg">BookStore Admin</span>
        </div>
        <nav className="mt-4 px-3">
          {adminNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1 text-sm font-medium transition-colors ${
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

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="border-b border-gray-200 bg-white px-8 py-4 shadow-sm flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            Admin Panel
          </h1>
          <UserMenu />
        </header>
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
