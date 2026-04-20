import React, { useState, useEffect } from "react";
import Button from "../ui/Button";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: UserFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    image: null as File | null,
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "", // don't show existing password
        role: initialData.role || "user",
        image: null,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
        image: null,
      });
    }
    // Reset preview khi mở/đóng modal
    setPreviewUrl(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      setFormData({ ...formData, [e.target.name]: file });

      // Tạo preview URL cho ảnh mới được chọn
      if (previewUrl) URL.revokeObjectURL(previewUrl); // cleanup URL cũ
      setPreviewUrl(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name || !formData.email) {
      setErrorMsg("Họ tên và Email là bắt buộc");
      return;
    }
    
    // Require password for create but optional for edit
    if (!initialData && !formData.password) {
      setErrorMsg("Mật khẩu là bắt buộc cho người dùng mới");
      return;
    }

    const payload: any = { ...formData };
    if (!payload.password) {
      delete payload.password; // Don't send empty string if no update needed
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{initialData ? "Sửa người dùng" : "Thêm người dùng"}</h2>
        
        {errorMsg && <div className="mb-4 text-red-600 text-sm">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu {initialData && "(Để trống nếu không muốn đổi)"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vai trò</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="user">Người dùng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ảnh đại diện</label>

            {/* Preview ảnh: ưu tiên hiển thị ảnh MỚI, nếu không có thì hiển thị ảnh cũ */}
            {(previewUrl || initialData?.avatar) && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={previewUrl ?? initialData.avatar}
                  alt="Avatar preview"
                  className="h-16 w-16 rounded-full object-cover border-2 border-indigo-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="text-xs text-gray-500">
                  {previewUrl
                    ? <span className="text-green-600 font-medium">✓ Ảnh mới đã chọn</span>
                    : <span className="text-gray-400 italic">Ảnh hiện tại</span>
                  }
                </span>
              </div>
            )}

            <input
              type="file"
              name="image"
              onChange={handleChange}
              accept="image/*"
              className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} type="button" disabled={isLoading}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
