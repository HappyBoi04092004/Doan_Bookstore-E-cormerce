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
    imageUrl: "",
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
          imageUrl: initialData.imageUrl || "",
        });
      } else {
        setFormData({ title: "", author: "", category: "", price: "", stock: "0", description: "", imageUrl: "" });
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.title || !formData.author || !formData.category) {
      setErrorMsg("Title, Author, and Category are required");
      return;
    }
    if (Number(formData.price) <= 0) {
      setErrorMsg("Price must be > 0");
      return;
    }
    if (Number(formData.stock) < 0) {
      setErrorMsg("Stock cannot be negative");
      return;
    }

    onSubmit({
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{initialData ? "Edit Book" : "Add Book"}</h2>

        {errorMsg && <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Author <span className="text-red-500">*</span></label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
              >
                <option value="">-- Select category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price <span className="text-red-500">*</span></label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" min="1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock <span className="text-red-500">*</span></label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} type="button" disabled={isLoading}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
