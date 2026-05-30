import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Images } from "lucide-react";
import Button from "../ui/Button";
import { categoryService } from "../../services/categoryService";
import { bookService } from "../../services/bookService";
import { authorService } from "../../services/authorService";
import { publisherService } from "../../services/publisherService";

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isLoading?: boolean;
}

const defaultVariants = [
  { id: undefined, name: "E-book", sku: "", price: "", stock: "999" },
  { id: undefined, name: "Bản tiêu chuẩn", sku: "", price: "", stock: "0" },
  { id: undefined, name: "Bản đặc biệt", sku: "", price: "", stock: "0" },
];

const emptyFormData = {
  title: "",
  author: "",
  publisher: "",
  isbn: "",
  publishYear: "",
  pageCount: "",
  language: "",
  size: "",
  format: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  images: [] as File[],
  variants: defaultVariants,
};

export default function BookFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: BookFormModalProps) {
  const [formData, setFormData] = useState(emptyFormData);
  const [errorMsg, setErrorMsg] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const imagePreviewUrls = useMemo(
    () => formData.images.map((file) => URL.createObjectURL(file)),
    [formData.images]
  );
  const existingImageUrls = useMemo(() => {
    if (!Array.isArray(initialData?.images)) return [];
    return initialData.images
      .filter((image: any) => typeof image?.url === "string" && image.url.trim().length > 0)
      .map((image: any) =>
        image.url.startsWith("/") ? `${import.meta.env.VITE_API_URL || ""}${image.url}` : image.url
      );
  }, [initialData?.images]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
    enabled: isOpen,
  });
  const { data: authors = [] } = useQuery({
    queryKey: ["authors"],
    queryFn: authorService.getAll,
    enabled: isOpen,
  });
  const { data: publishers = [] } = useQuery({
    queryKey: ["publishers"],
    queryFn: publisherService.getAll,
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg("");
    if (initialData) {
      const variants = Array.isArray(initialData.variants) && initialData.variants.length > 0
        ? initialData.variants.map((variant: any) => ({
            id: variant.id,
            name: variant.name || "",
            sku: variant.sku || "",
            price: String(variant.price ?? ""),
            stock: String(variant.stock ?? ""),
          }))
        : defaultVariants;

      setFormData({
        title: initialData.title || "",
        author: typeof initialData.author === "object" ? initialData.author?.name || "" : initialData.author || "",
        publisher: typeof initialData.publisher === "object" ? initialData.publisher?.name || "" : initialData.publisher || "",
        isbn: initialData.isbn || "",
        publishYear: String(initialData.publishYear ?? ""),
        pageCount: String(initialData.pageCount ?? ""),
        language: initialData.language || "",
        size: initialData.size || "",
        format: initialData.format || "",
        category: typeof initialData.category === "object" ? initialData.category?.name || "" : initialData.category || "",
        price: String(initialData.price ?? ""),
        stock: String(initialData.stock ?? ""),
        description: initialData.description || "",
        images: [],
        variants,
      });
    } else {
      setFormData({ ...emptyFormData, variants: defaultVariants.map((variant) => ({ ...variant })) });
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  if (!isOpen) return null;

  const syncStandardVariant = (next: typeof formData, field: "price" | "stock", value: string) => ({
    ...next,
    variants: next.variants.map((variant, index) =>
      index === 1 ? { ...variant, [field]: value } : variant
    ),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (e.target.type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const nextFiles = Array.from(fileInput.files || []);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...nextFiles].slice(0, 10),
      }));
      fileInput.value = "";
      return;
    }

    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "price" || name === "stock") {
        return syncStandardVariant(next, name, value);
      }
      return next;
    });
  };

  const removeSelectedImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIdx) => imageIdx !== index),
    }));
  };

  const handleExtractBookInfo = async () => {
    if (formData.images.length === 0) {
      setErrorMsg("Vui lòng chọn ảnh bìa trước hoặc bìa sau trước khi quét OCR.");
      return;
    }

    setIsExtracting(true);
    setErrorMsg("");

    try {
      const extractedData = await bookService.extractBookInfoFromImage(formData.images.slice(0, 2));
      const matchedCategory = categories.find(
        (c) => c.name.toLowerCase() === extractedData.category?.toLowerCase()
      );

      setFormData((prev) => {
        let next = {
          ...prev,
          title: extractedData.title || prev.title,
          author: extractedData.author || prev.author,
          publisher: extractedData.publisher || prev.publisher,
          isbn: extractedData.isbn || prev.isbn,
          publishYear: extractedData.publishYear ? String(extractedData.publishYear) : prev.publishYear,
          pageCount: extractedData.pageCount ? String(extractedData.pageCount) : prev.pageCount,
          language: extractedData.language || prev.language,
          size: extractedData.size || prev.size,
          format: extractedData.format || prev.format,
          category: matchedCategory ? matchedCategory.name : prev.category,
          price: extractedData.price ? String(extractedData.price) : prev.price,
          description: extractedData.description || prev.description,
        };

        if (extractedData.price) {
          next = syncStandardVariant(next, "price", String(extractedData.price));
        }
        return next;
      });

      const messages = [];
      if (extractedData.title) messages.push("tên sách");
      if (extractedData.author) messages.push("tác giả");
      if (extractedData.publisher) messages.push("nhà xuất bản");
      if (extractedData.isbn) messages.push("ISBN");
      if (extractedData.publishYear) messages.push("năm xuất bản");
      if (extractedData.pageCount) messages.push("số trang");
      if (extractedData.language) messages.push("ngôn ngữ");
      if (extractedData.size) messages.push("kích thước");
      if (extractedData.format) messages.push("định dạng");
      if (extractedData.price) messages.push("giá");
      if (matchedCategory) messages.push("danh mục");

      setErrorMsg(
        messages.length > 0
          ? `Đã quét OCR: ${messages.join(", ")}. Vui lòng kiểm tra và chỉnh sửa trước khi lưu.`
          : "OCR chưa nhận diện được dữ liệu phù hợp. Vui lòng nhập thủ công."
      );
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Lỗi khi quét OCR thông tin sách.");
    } finally {
      setIsExtracting(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.title.trim() || !formData.author.trim() || !formData.publisher.trim()) {
      setErrorMsg("Tên sách, Tác giả và Nhà xuất bản là bắt buộc");
      return;
    }
    if (!formData.category.trim()) {
      setErrorMsg("Danh mục là bắt buộc");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setErrorMsg("Giá bán phải lớn hơn 0");
      return;
    }
    if (formData.stock === "" || Number(formData.stock) < 0) {
      setErrorMsg("Số lượng tồn kho không được âm");
      return;
    }

    const normalizedVariants = formData.variants
      .map((variant) => ({
        id: variant.id,
        name: variant.name.trim(),
        sku: variant.sku.trim(),
        price: variant.price === "" ? null : Number(variant.price),
        stock: variant.stock === "" ? null : Number(variant.stock),
      }))
      .filter((variant) => variant.name || variant.sku || variant.price !== null || variant.stock !== null);

    if (
      normalizedVariants.some(
        (variant) => !variant.name || variant.price === null || Number.isNaN(variant.price) || variant.price <= 0
      )
    ) {
      setErrorMsg("Mỗi biến thể cần có tên và giá lớn hơn 0");
      return;
    }
    if (
      normalizedVariants.some(
        (variant) => variant.stock === null || Number.isNaN(variant.stock) || variant.stock < 0
      )
    ) {
      setErrorMsg("Tồn kho biến thể không được âm");
      return;
    }

    onSubmit({
      title: formData.title.trim(),
      author: formData.author.trim(),
      publisher: formData.publisher.trim(),
      isbn: formData.isbn.trim(),
      publishYear: formData.publishYear,
      pageCount: formData.pageCount,
      language: formData.language.trim(),
      size: formData.size.trim(),
      format: formData.format.trim(),
      category: formData.category,
      price: formData.price,
      stock: formData.stock,
      description: formData.description,
      images: formData.images,
      variants: normalizedVariants,
    });
  };

  const detailInputs = [
    { name: "isbn", label: "ISBN", type: "text" },
    { name: "publishYear", label: "Năm xuất bản", type: "number" },
    { name: "pageCount", label: "Số trang", type: "number" },
    { name: "language", label: "Ngôn ngữ", type: "text" },
    { name: "size", label: "Kích thước", type: "text" },
    { name: "format", label: "Định dạng", type: "text" },
  ];

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
                Quay lại
              </button>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {initialData ? "Chỉnh sửa sách" : "Thêm sách mới"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Nhập thông tin sách cố định, quét OCR từ tối đa 2 ảnh bìa và kiểm tra lại trước khi lưu.
              </p>
            </div>
          </div>
        </div>

        {errorMsg && <div className="mx-6 mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 p-6 sm:p-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin sách</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên sách <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tác giả <span className="text-red-500">*</span></label>
                  <input type="text" name="author" list="author-options" value={formData.author} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                  <datalist id="author-options">
                    {authors.map((author) => (
                      <option key={author.id} value={author.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nhà xuất bản <span className="text-red-500">*</span></label>
                  <input type="text" name="publisher" list="publisher-options" value={formData.publisher} onChange={handleChange} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                  <datalist id="publisher-options">
                    {publishers.map((publisher) => (
                      <option key={publisher.id} value={publisher.name} />
                    ))}
                  </datalist>
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
                {detailInputs.map((input) => (
                  <div key={input.name}>
                    <label className="block text-sm font-medium text-gray-700">{input.label}</label>
                    <input
                      type={input.type}
                      name={input.name}
                      value={(formData as any)[input.name]}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={8}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm leading-6 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Images className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Hình ảnh</h3>
              </div>
              <label className="block text-sm font-medium text-gray-700">Ảnh sản phẩm</label>
              <p className="mt-1 text-xs text-gray-500">
                Ảnh 1 là bìa trước, ảnh 2 là bìa sau. Nút OCR sẽ quét tối đa 2 ảnh đầu tiên.
              </p>
              <input
                type="file"
                name="images"
                onChange={handleChange}
                accept="image/jpeg,image/png"
                multiple
                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {formData.images.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExtractBookInfo}
                  disabled={isExtracting || isLoading}
                  className="mt-2 w-full"
                >
                  {isExtracting ? "Đang quét OCR..." : "Quét OCR từ ảnh bìa"}
                </Button>
              )}
              {initialData?.images?.length > 0 && formData.images.length === 0 && (
                <p className="mt-1 text-xs text-gray-400 italic">Giữ lại {initialData.images.length} ảnh hiện có nếu không tải ảnh mới.</p>
              )}
              {existingImageUrls.length > 0 && formData.images.length === 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {existingImageUrls.map((url: string, index: number) => (
                    <div key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <img src={url} alt={`Ảnh hiện có ${index + 1}`} className="aspect-[3/4] w-full object-cover" />
                      <div className="px-3 py-2 text-xs text-gray-500">
                        {index === 0 ? "Ảnh bìa hiện tại" : `Ảnh hiện có ${index + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {imagePreviewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={url} className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <img src={url} alt={`Preview ${index + 1}`} className="aspect-[3/4] w-full object-cover" />
                      <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-gray-500">
                        <span>{index === 0 ? "Bìa trước" : index === 1 ? "Bìa sau" : `Ảnh phụ ${index + 1}`}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(index)}
                          className="font-medium text-red-500 hover:text-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Biến thể sản phẩm</h3>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Giá bán và tồn kho cố định sẽ đồng bộ vào biến thể tiêu chuẩn.</p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      variants: [...prev.variants, { id: undefined, name: "", sku: "", price: "", stock: "0" }],
                    }))
                  }
                >
                  Thêm biến thể
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 md:grid-cols-2">
                    <input type="text" value={variant.name} onChange={(e) => handleVariantChange(index, "name", e.target.value)} placeholder="Tên biến thể" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                    <input type="text" value={variant.sku} onChange={(e) => handleVariantChange(index, "sku", e.target.value)} placeholder="SKU" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                    <input type="number" min="1" value={variant.price} onChange={(e) => handleVariantChange(index, "price", e.target.value)} placeholder="Giá" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
                    <input type="number" min="0" value={variant.stock} onChange={(e) => handleVariantChange(index, "stock", e.target.value)} placeholder="Tồn kho" className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
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
