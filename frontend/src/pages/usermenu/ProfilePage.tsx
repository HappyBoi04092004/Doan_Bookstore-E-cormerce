import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: authService.getProfile,
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    console.log("DATA SUBMIT:", form);
    // TODO: call API update sau
  };

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;

  if (isError || !user) {
    return (
      <div className="text-center text-red-500 mt-10">
        Lỗi khi tải thông tin tài khoản
      </div>
    );
  }

  return (
    //Back
    // <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
    //     <ArrowLeft className="h-4 w-4" />
    //     Quay lại 
    // </Link>
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Thông tin tài khoản
      </h1>

      <div className="bg-white rounded-2xl p-6 shadow">
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
            <div className="p-3 font-semibold bg-gray-100">Field</div>
            <div className="p-3 font-semibold bg-gray-100 col-span-2">
              Value
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-3 border-b">
            <div className="p-3">Tên</div>
            <div className="p-3 col-span-2">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-1"
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-3 border-b">
            <div className="p-3">Email</div>
            <div className="p-3 col-span-2">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-1"
              />
            </div>
          </div>

          {/* Role */}
          <div className="grid grid-cols-3 border-b">
            <div className="p-3">Role</div>
            <div className="p-3 col-span-2 text-gray-600">
              {user.role}
            </div>
          </div>

          {/* Created */}
          <div className="grid grid-cols-3">
            <div className="p-3">Tham gia từ ngày</div>
            <div className="p-3 col-span-2 text-gray-600">
              {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleSave}
          className="mt-6 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}