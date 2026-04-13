import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Button from "../ui/Button";
import { categoryService } from "../../services/categoryService";

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

export default function BookFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: BookFormModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    image: null as File | null,
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Load categories for the dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      if (initialData) {
        setFormData({
          title: initialData.title || "",
          author: initialData.author || "",
          category: initialData.category || "",
          price: initialData.price || "",
          stock: initialData.stock || "",
          description: initialData.description || "",
          image: null,
        });
      } else {
        setFormData({ title: "", author: "", category: "", price: "", stock: "0", description: "", image: null });
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (e.target.type === "file") {
      const fileInput = e.target as HTMLInputElement;
      setFormData({ ...formData, [e.target.name]: fileInput.files?.[0] || null });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.title || !formData.author || !formData.category) {
      setErrorMsg("Tiêu đề, Tác giả và Danh mục là bắt buộc");
      return;
    }
    if (Number(formData.price) <= 0) {
      setErrorMsg("Giá phải lớn hơn 0");
      return;
    }
    if (Number(formData.stock) < 0) {
      setErrorMsg("Tồn kho không được âm");
      return;
    }

    onSubmit({
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{initialData ? "Sửa sách" : "Thêm sách"}</h2>

        {errorMsg && <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tiêu đề <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tác giả <span className="text-red-500">*</span></label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Danh mục <span className="text-red-500">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Giá <span className="text-red-500">*</span></label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" min="1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tồn kho <span className="text-red-500">*</span></label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ảnh bìa sách</label>
              <input 
                type="file" 
                name="image" 
                onChange={handleChange} 
                accept="image/*"
                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
              />
              {initialData?.image && !formData.image && (
                <p className="mt-1 text-xs text-gray-400 italic">Gốc: {initialData.image}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mô tả</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} type="button" disabled={isLoading}>Hủy</Button>
            <Button variant="primary" type="submit" disabled={isLoading}>{isLoading ? "Đang lưu..." : "Lưu"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
