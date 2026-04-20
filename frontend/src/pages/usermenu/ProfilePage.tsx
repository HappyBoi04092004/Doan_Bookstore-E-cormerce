import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import { useAuthStore } from "../../stores/authStore";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: userResponse, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: authService.getProfile,
  });

  const user = userResponse?.data || userResponse; // Handle possible extra .data wrapper
  const updateUser = useAuthStore((state) => state.updateUser);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    image: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState("");

  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        image: null,
      });

      // Để phá cache (cache-busting) ảnh trên trình duyệt,
      // ta thêm 1 timestamp vào url avatar mỗi khi load lại thành công.
      const timestamp = new Date().getTime();
      const newAvatarUrl = user.avatar
         ? (user.avatar.includes("?t=") ? user.avatar : `${user.avatar}?t=${timestamp}`)
         : "";

      setPreviewUrl(newAvatarUrl);

      // Cập nhật lại global auth store để components khác (như UserMenu trên Header) thay đổi theo
      updateUser({
        name: user.name,
        email: user.email,
        avatar: newAvatarUrl
      });
    }
  }, [user, updateUser]);

  const updateMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setForm((prev) => ({ ...prev, password: "", image: null }));
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err?.response?.data?.message || "Lỗi khi cập nhật!" });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.type === "file") {
      const file = e.target.files?.[0] || null;
      setForm({ ...form, [e.target.name]: file });
      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    } else {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSave = () => {
    setMessage(null);
    if (!form.name || !form.email) {
      setMessage({ type: "error", text: "Tên và Email là bắt buộc." });
      return;
    }
    
    const payload: any = { ...form };
    if (!payload.password) delete payload.password;

    updateMutation.mutate(payload);
  };

  if (isLoading) return <div className="text-center mt-10">Đang tải...</div>;

  if (isError || !user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại 
        </Link>
        <div className="text-center text-red-500 mt-10 font-medium">
          Lỗi khi tải thông tin tài khoản
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại 
      </Link>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Thông tin tài khoản
      </h1>

      <div className="bg-white rounded-2xl p-6 shadow">
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
             {message.text}
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-6">
          <img
            src={previewUrl || "/default-avatar.png"}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>
            <input 
              type="file" 
              name="image" 
              onChange={handleChange} 
              accept="image/*"
              className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full border rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 border-b">
            <div className="p-3 font-semibold bg-gray-100 flex items-center">Trường thông tin</div>
            <div className="p-3 font-semibold bg-gray-100 col-span-2 flex items-center">
              Giá trị
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-3 border-b">
            <div className="p-3 flex items-center">Tên</div>
            <div className="p-3 col-span-2">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-3 border-b">
            <div className="p-3 flex items-center">Email</div>
            <div className="p-3 col-span-2">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-3 border-b">
            <div className="p-3 flex items-center">Mật khẩu mới (tuỳ chọn)</div>
            <div className="p-3 col-span-2">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Để trống nếu không đổi"
                className="w-full border rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Role */}
          <div className="grid grid-cols-3 border-b">
            <div className="p-3 flex items-center">Vai trò</div>
            <div className="p-3 col-span-2 text-gray-600 capitalize flex items-center">
              {user.role}
            </div>
          </div>

          {/* Created */}
          <div className="grid grid-cols-3">
            <div className="p-3 flex items-center">Tham gia từ ngày</div>
            <div className="p-3 col-span-2 text-gray-600 flex items-center">
              {new Date(user.createdAt).toLocaleDateString("vi-VN")}
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          variant="primary"
          className="mt-6 w-full sm:w-auto"
        >
          {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
}