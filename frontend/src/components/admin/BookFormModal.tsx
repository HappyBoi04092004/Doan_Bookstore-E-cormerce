import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Images, Package2, ScrollText } from "lucide-react";
import Button from "../ui/Button";
import { categoryService } from "../../services/categoryService";
import { bookService } from "../../services/bookService";

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
    description: "",
    images: [] as File[],
    variants: [
      { name: "E-book", sku: "", price: "", stock: "999", discountPercent: "" },
      { name: "Bản tiêu chuẩn", sku: "", price: "", stock: "0", discountPercent: "" },
      { name: "Bản đặc biệt", sku: "", price: "", stock: "0", discountPercent: "" },
    ],
    attributes: [{ attributeId: "", value: "" }],
  });
  const [errorMsg, setErrorMsg] = useState("");
  const imagePreviewUrls = useMemo(
    () => formData.images.map((file) => URL.createObjectURL(file)),
    [formData.images]
  );

  // Load categories for the dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
    enabled: isOpen,
  });
  const { data: attributes = [] } = useQuery({
    queryKey: ["book-attributes"],
    queryFn: bookService.getAttributes,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      if (initialData) {
        setFormData({
          title: initialData.title || "",
          author: typeof initialData.author === "object" ? initialData.author?.name || "" : initialData.author || "",
          category: typeof initialData.category === "object" ? initialData.category?.name || "" : initialData.category || "",
          description: initialData.description || "",
          images: [],
          variants: Array.isArray(initialData.variants) && initialData.variants.length > 0
            ? initialData.variants.map((variant: any) => ({
                name: variant.name || "",
                sku: variant.sku || "",
                price: String(variant.price ?? ""),
                stock: String(variant.stock ?? ""),
                discountPercent: String(variant.discountPercent ?? ""),
              }))
            : [
                { name: "E-book", sku: "", price: "", stock: "999", discountPercent: "" },
                { name: "Bản tiêu chuẩn", sku: "", price: "", stock: "0", discountPercent: "" },
                { name: "Bản đặc biệt", sku: "", price: "", stock: "0", discountPercent: "" },
              ],
          attributes: Array.isArray(initialData.attributes) && initialData.attributes.length > 0
            ? initialData.attributes.map((attribute: any) => ({
                attributeId: String(attribute.attributeId ?? ""),
                value: attribute.value || "",
              }))
            : [{ attributeId: "", value: "" }],
        });
      } else {
        setFormData({
          title: "",
          author: "",
          category: "",
          description: "",
          images: [],
          variants: [
            { name: "E-book", sku: "", price: "", stock: "999", discountPercent: "" },
            { name: "Bản tiêu chuẩn", sku: "", price: "", stock: "0", discountPercent: "" },
            { name: "Bản đặc biệt", sku: "", price: "", stock: "0", discountPercent: "" },
          ],
          attributes: [{ attributeId: "", value: "" }],
        });
      }
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (e.target.type === "file") {
      const fileInput = e.target as HTMLInputElement;
      setFormData({ ...formData, images: Array.from(fileInput.files || []) });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, variantIdx) =>
        variantIdx === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const handleAttributeChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attribute, attrIdx) =>
        attrIdx === index ? { ...attribute, [field]: value } : attribute
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.title || !formData.author || !formData.category) {
      setErrorMsg("Tiêu đề, Tác giả và Danh mục là bắt buộc");
      return;
    }
    const normalizedVariants = formData.variants
      .map((variant) => ({
        name: variant.name.trim(),
        sku: variant.sku.trim(),
        price: Number(variant.price),
        stock: Number(variant.stock),
        discountPercent: variant.discountPercent === "" ? null : Number(variant.discountPercent),
      }))
      .filter((variant) => variant.name);
    if (normalizedVariants.length === 0) {
      setErrorMsg("Cần ít nhất một biến thể hợp lệ");
      return;
    }
    if (normalizedVariants.some((variant) => variant.price <= 0)) {
      setErrorMsg("Giá biến thể phải lớn hơn 0");
      return;
    }
    if (normalizedVariants.some((variant) => variant.stock < 0)) {
      setErrorMsg("Tồn kho biến thể không được âm");
      return;
    }

    const normalizedAttributes = formData.attributes
      .map((attribute) => ({
        attributeId: Number(attribute.attributeId),
        value: attribute.value.trim(),
      }))
      .filter((attribute) => attribute.attributeId > 0 && attribute.value);

    onSubmit({
      title: formData.title,
      author: formData.author,
      category: formData.category,
      description: formData.description,
      images: formData.images,
      variants: normalizedVariants,
      attributes: normalizedAttributes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[94vh] overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur px-6 py-4 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại trang admin sách
              </button>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {initialData ? "Chỉnh sửa sách" : "Thêm sách mới"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý ảnh, biến thể và thông tin chi tiết của từng quyển sách trong một màn hình lớn hơn.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
                3 phiên bản mặc định
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                Nhiều ảnh sản phẩm
              </span>
            </div>
          </div>
        </div>

        {errorMsg && <div className="mb-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 p-6 sm:p-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Package2 className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
              <label className="block text-sm font-medium text-gray-700">Tiêu đề <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
              <label className="block text-sm font-medium text-gray-700">Tác giả <span className="text-red-500">*</span></label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Mô tả / Giới thiệu sách</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={10}
                    placeholder="Nhập phần giới thiệu sách dài, nội dung nổi bật, đối tượng phù hợp, giá trị cuốn sách..."
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm leading-6 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Images className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Hình ảnh sản phẩm</h3>
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700">Ảnh sản phẩm</label>
              <input 
                type="file" 
                name="images" 
                onChange={handleChange} 
                accept="image/*"
                multiple
                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
              />
              {initialData?.images?.length > 0 && formData.images.length === 0 && (
                <p className="mt-1 text-xs text-gray-400 italic">Giữ lại {initialData.images.length} ảnh hiện có nếu không tải ảnh mới.</p>
              )}
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={url} className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                        <img src={url} alt={`Preview ${index + 1}`} className="aspect-[3/4] w-full object-cover" />
                        <div className="px-3 py-2 text-xs text-gray-500">
                          {index === 0 ? "Ảnh bìa chính" : `Ảnh phụ ${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Package2 className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Biến thể sản phẩm</h3>
              </div>
              <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Biến thể sản phẩm</label>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    variants: [...prev.variants, { name: "", sku: "", price: "", stock: "0", discountPercent: "" }],
                  }))
                }
              >
                Thêm biến thể
              </Button>
              </div>
              <div className="mt-4 space-y-3">
              {formData.variants.map((variant, index) => (
                <div key={`${variant.name}-${index}`} className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 md:grid-cols-2">
                  <input type="text" value={variant.name} onChange={(e) => handleVariantChange(index, "name", e.target.value)} placeholder="Tên biến thể" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                  <input type="text" value={variant.sku} onChange={(e) => handleVariantChange(index, "sku", e.target.value)} placeholder="SKU" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                  <input type="number" min="1" value={variant.price} onChange={(e) => handleVariantChange(index, "price", e.target.value)} placeholder="Giá" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                  <input type="number" min="0" value={variant.stock} onChange={(e) => handleVariantChange(index, "stock", e.target.value)} placeholder="Tồn kho" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                  <input type="number" min="0" max="100" value={variant.discountPercent} onChange={(e) => handleVariantChange(index, "discountPercent", e.target.value)} placeholder="Giảm giá %" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        variants: prev.variants.length === 1 ? prev.variants : prev.variants.filter((_, variantIdx) => variantIdx !== index),
                      }))
                    }
                  >
                    Xóa biến thể
                  </Button>
                </div>
              ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Thông tin chi tiết</h3>
              </div>
              <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Thông tin chi tiết</label>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    attributes: [...prev.attributes, { attributeId: "", value: "" }],
                  }))
                }
              >
                Thêm thuộc tính
              </Button>
              </div>
              <div className="mt-4 space-y-3">
              {formData.attributes.map((attribute, index) => (
                <div key={`${attribute.attributeId}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-3 rounded-lg border border-gray-200 p-3">
                  <select
                    value={attribute.attributeId}
                    onChange={(e) => handleAttributeChange(index, "attributeId", e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="">-- Chọn thuộc tính --</option>
                    {attributes.map((attr) => (
                      <option key={attr.id} value={attr.id}>
                        {attr.name}{attr.unit ? ` (${attr.unit})` : ""}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={attribute.value}
                    onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                    placeholder="Giá trị"
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        attributes: prev.attributes.length === 1 ? prev.attributes : prev.attributes.filter((_, attrIdx) => attrIdx !== index),
                      }))
                    }
                  >
                    Xóa
                  </Button>
                </div>
              ))}
              </div>
            </section>

            <div className="sticky bottom-0 flex justify-end gap-3 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <Button variant="ghost" onClick={onClose} type="button" disabled={isLoading}>Hủy</Button>
              <Button variant="primary" type="submit" disabled={isLoading}>{isLoading ? "Đang lưu..." : "Lưu"}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
