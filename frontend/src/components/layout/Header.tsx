import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, BookOpen, LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/books", label: "Books" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, toggleCart } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/98 backdrop-blur-md">
      <div className="container mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-slate-900 hover:text-indigo-600 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <BookOpen className="h-4.5 w-4.5 text-white h-[18px] w-[18px]" />
          </div>
          <span className="text-[17px] tracking-tight">BookStore</span>
        </Link>

        {/* Nav — center */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-md text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          {isAuthenticated && user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`
              }
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative flex items-center justify-center h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-[19px] w-[19px]" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] h-[18px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white leading-none">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="mx-1.5 h-5 w-px bg-slate-200" />

          {/* Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100">
                  <User className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <span className="text-[13px] font-medium text-slate-700 max-w-[120px] truncate">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center justify-center h-9 w-9 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-[17px] w-[17px]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-[13.5px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-[13.5px] font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
