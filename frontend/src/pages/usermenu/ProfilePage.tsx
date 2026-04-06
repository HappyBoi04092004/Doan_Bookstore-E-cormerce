import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: userResponse, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: authService.getProfile,
  });

  const user = userResponse;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setForm((prev) => ({ ...prev, password: "" }));
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err?.response?.data?.message || "Lỗi khi cập nhật!" });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;

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
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover border"
          />
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