import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartSidebar from "../cart/CartSidebar";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
    </div>
  );
}
