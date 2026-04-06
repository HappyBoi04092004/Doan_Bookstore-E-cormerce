import React, { useState, useEffect } from "react";
import Button from "../ui/Button";

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
  isLoading
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

  useEffect(() => {
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
      setFormData({
        title: "", author: "", category: "", price: "", stock: "0", description: "", imageUrl: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        
        {errorMsg && <div className="mb-4 text-red-600 text-sm">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
               <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">Author <span className="text-red-500">*</span></label>
               <input type="text" name="author" value={formData.author} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
               <input type="text" name="category" value={formData.category} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. Technology" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">Price <span className="text-red-500">*</span></label>
               <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" min="1" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700">Stock <span className="text-red-500">*</span></label>
               <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" min="0" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">Image URL</label>
               <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Description</label>
             <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></textarea>
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
