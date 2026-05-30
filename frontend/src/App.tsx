import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./stores/authStore";

import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";

import HomePage from "./pages/HomePage";
import BookListPage from "./pages/BookListPage";
import BookDetailPage from "./pages/BookDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ContactPage from "./pages/ContactPage";
import MyOrdersPage from "./pages/usermenu/MyOrdersPage";
import PaymentResultPage from "./pages/PaymentResultPage";
import ProfilePage from "./pages/usermenu/ProfilePage";
import WishlistPage from "./pages/usermenu/WishlistPage";

import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import ProductsPage from "./pages/admin/ProductsPage";
import OrdersPage from "./pages/admin/OrdersPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import AuthorsPage from "./pages/admin/AuthorsPage";
import PublishersPage from "./pages/admin/PublishersPage";
import ContactsPage from "./pages/admin/ContactsPage";
import ReviewsPage from "./pages/admin/ReviewsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "bookstore-auth") {
        useAuthStore.persist.rehydrate();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BookListPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/payment/success" element={<PaymentResultPage result="success" />} />
            <Route path="/payment/error" element={<PaymentResultPage result="error" />} />
            <Route path="/payment/cancel" element={<PaymentResultPage result="cancel" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/myorders" element={<MyOrdersPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/products" element={<ProductsPage />} />
              <Route path="/admin/categories" element={<CategoriesPage />} />
              <Route path="/admin/authors" element={<AuthorsPage />} />
              <Route path="/admin/publishers" element={<PublishersPage />} />
              <Route path="/admin/orders" element={<OrdersPage />} />
              <Route path="/admin/contacts" element={<ContactsPage />} />
              <Route path="/admin/reviews" element={<ReviewsPage />} />
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
                <p className="text-7xl font-extrabold text-indigo-200">404</p>
                <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy trang</h1>
                <p className="text-gray-500">Trang bạn đang tìm kiếm không tồn tại.</p>
                <a
                  href="/"
                  className="mt-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Quay về trang chủ
                </a>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
