import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Layouts
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Route guards
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";

// User Pages
import HomePage from "./pages/HomePage";
import BookListPage from "./pages/BookListPage";
import BookDetailPage from "./pages/BookDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ContactPage from "./pages/ContactPage";

// Admin Pages
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import ProductsPage from "./pages/admin/ProductsPage";
import OrdersPage from "./pages/admin/OrdersPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ──────────────── PUBLIC / USER ROUTES ──────────────── */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BookListPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected — must be logged in */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<div className="p-10 max-w-4xl mx-auto rounded-xl mt-10 shadow-sm bg-white border border-gray-100"><h2 className="text-2xl font-bold mb-4">Profile</h2><p>Trang thông tin tài khoản (Đang phát triển)</p></div>} />
              <Route path="/orders" element={<div className="p-10 max-w-4xl mx-auto rounded-xl mt-10 shadow-sm bg-white border border-gray-100"><h2 className="text-2xl font-bold mb-4">My Orders</h2><p>Xem lịch sử đơn hàng (Đang phát triển)</p></div>} />
              <Route path="/tests" element={<div className="p-10 max-w-4xl mx-auto rounded-xl mt-10 shadow-sm bg-white border border-gray-100"><h2 className="text-2xl font-bold mb-4">My Tests</h2><p>Xem lịch sử test (Đang phát triển)</p></div>} />
            </Route>
          </Route>

          {/* ──────────────── ADMIN ROUTES ──────────────── */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/orders" element={<OrdersPage />} />
            </Route>
          </Route>

          {/* ──────────────── 404 ──────────────── */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
                <p className="text-7xl font-extrabold text-indigo-200">404</p>
                <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
                <p className="text-gray-500">The page you are looking for doesn't exist.</p>
                <a
                  href="/"
                  className="mt-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Go Home
                </a>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}