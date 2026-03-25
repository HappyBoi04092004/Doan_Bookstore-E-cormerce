import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, FileText, ShoppingBag, ChevronDown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    setIsOpen(false);
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-indigo-600" />
          )}
        </div>
        <span className="hidden sm:block text-[13.5px] font-medium text-slate-700 max-w-[120px] truncate">
          {user.name}
        </span>
        <ChevronDown
          className={`hidden sm:block h-4 w-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 transform overflow-hidden rounded-xl bg-white border border-gray-100 shadow-lg ring-1 ring-black ring-opacity-5 origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-150 z-50 p-1">
          <div className="px-3 py-2 border-b border-gray-100 mb-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>

          <div className="flex flex-col gap-0.5">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <User className="h-4 w-4 shrink-0" />
              Trang cá nhân 
            </Link>

            <Link
              to="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              Lịch sử đặt hàng
            </Link>

            <Link
              to="/tests"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <FileText className="h-4 w-4 shrink-0" />
              Lịch sử kiểm tra
            </Link>

            <div className="my-0.5 border-t border-gray-100" />

            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0 -ml-0.5" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Đăng xuất"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsLogoutModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={confirmLogout}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white border-transparent"
            >
              Đồng ý
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-2">
          Bạn có chắc chắn muốn đăng xuất không?
        </p>
      </Modal>
    </div>
  );
}
