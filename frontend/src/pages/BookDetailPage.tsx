import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useBook } from "../hooks/useBooks";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { formatPrice } from "../utils";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import type { BookAttribute } from "../types";

const PLACEHOLDER = "https://placehold.co/300x400?text=Sách";

function resolveImageUrl(url?: string | null) {
  if (!url) return PLACEHOLDER;
  return url.startsWith("/") ? `${import.meta.env.VITE_API_URL || ""}${url}` : url;
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading, error } = useBook(id ?? "");
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const imagesSource = book?.images;
  const variantsSource = book?.variants;
  const images = Array.isArray(imagesSource)
    ? imagesSource.filter((img) => typeof img?.url === "string" && img.url.trim().length > 0)
    : [];
  const variants = Array.isArray(variantsSource)
    ? variantsSource.filter(
        (variant) =>
          variant &&
          typeof variant.id === "number" &&
          typeof variant.name === "string" &&
          typeof variant.price === "number" &&
          typeof variant.stock === "number"
      )
    : [];
  const normalizedActiveIdx = activeIdx >= 0 && activeIdx < images.length ? activeIdx : 0;
  const normalizedVariantIdx =
    selectedVariantIdx >= 0 && selectedVariantIdx < variants.length ? selectedVariantIdx : 0;
  const selectedVariant = variants[normalizedVariantIdx] ?? null;
  const fallbackStock = typeof book?.stock === "number" ? book.stock : 0;
  const currentStock = selectedVariant?.stock ?? fallbackStock;
  const currentPrice =
    typeof selectedVariant?.price === "number"
      ? selectedVariant.price
      : typeof book?.price === "number"
        ? book.price
        : 0;
  const attributes = Array.isArray(book?.attributes) ? book.attributes : [];
  const categoryName =
    typeof book?.category === "object" && book.category?.name
      ? book.category.name
      : typeof book?.category === "string" && book.category.trim()
        ? book.category
        : "Chưa phân loại";
  const authorName =
    typeof book?.author === "object" && book.author?.name
      ? book.author.name
      : typeof book?.author === "string" && book.author.trim()
        ? book.author
        : "Chưa rõ tác giả";
  const activeUrl = resolveImageUrl(
    images[normalizedActiveIdx]?.url ?? selectedVariant?.primaryImage ?? book?.primaryImage
  );
  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-red-600 font-medium">Không tìm thấy sách.</p>
        <Link to="/books">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart({ ...selectedVariant, book });
    }
  };

  const handleToggleWishlist = () => {
    if (selectedVariant) {
      toggleWishlist(selectedVariant.id);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <Link
        to="/books"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg shadow-slate-100 aspect-[3/4]">
            <img
              src={activeUrl}
              alt={book.title}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PLACEHOLDER;
              }}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow transition-colors hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setActiveIdx((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow transition-colors hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
              </>
            )}
          </div>

          {images.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600">Hình ảnh sản phẩm</p>
              <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIdx(idx)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`overflow-hidden rounded-2xl border-2 bg-white transition-all ${
                    normalizedActiveIdx === idx ? "border-indigo-500" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={resolveImageUrl(img.url)}
                    alt={img.altText ?? `Ảnh ${idx + 1}`}
                    className="aspect-[3/4] w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PLACEHOLDER;
                    }}
                  />
                </button>
              ))}
            </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-slate-100">
            <Badge variant="info">{categoryName}</Badge>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">{book.title}</h1>
            <p className="mt-2 text-base text-gray-500">
              được viết bởi <span className="font-medium">{authorName}</span>
            </p>

            {variants.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Chọn phiên bản:</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {variants.map((variant, idx) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantIdx(idx)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      normalizedVariantIdx === idx
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold">{variant.name}</p>
                    <p className="mt-1 text-sm">{formatPrice(variant.price)}</p>
                  </button>
                ))}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-3xl border border-gray-200 bg-gray-50 px-6 py-5">
              <p className="text-sm text-gray-500">Giá phiên bản đang chọn</p>
              <span className="mt-1 block text-3xl font-bold text-indigo-600">{formatPrice(currentPrice)}</span>
              <p className={`mt-3 text-sm font-semibold ${currentStock > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {currentStock > 0 ? `Còn ${currentStock} sản phẩm` : "Hết hàng"}
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <Button
                size="lg"
                disabled={!selectedVariant || currentStock === 0}
                onClick={handleAddToCart}
                className="flex-1"
              >
                <ShoppingCart className="h-5 w-5 mr-1" />
                {!selectedVariant || currentStock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
                disabled={!selectedVariant}
                className={`px-4 flex-none transition-colors ${
                  selectedVariant && isWishlisted(selectedVariant.id)
                    ? "text-rose-500 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-300"
                    : "text-gray-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50"
                }`}
                title={selectedVariant && isWishlisted(selectedVariant.id) ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              >
                <Heart className={`h-6 w-6 ${selectedVariant && isWishlisted(selectedVariant.id) ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          {book.description && (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-slate-100">
              <h2 className="mb-3 text-left text-xl font-semibold text-gray-900">Giới thiệu về sách</h2>
              <div className="prose prose-slate max-w-none text-left text-sm leading-7 text-gray-600 whitespace-pre-line">
                {book.description}
              </div>
            </div>
          )}

          {attributes.length > 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-slate-100">
              <h2 className="mb-4 text-left text-xl font-semibold text-gray-900">Thông tin chi tiết</h2>
              <table className="w-full text-sm overflow-hidden rounded-2xl">
                <tbody className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
                  {attributes.map((attr: BookAttribute) => (
                    <tr key={attr.id} className="transition-colors odd:bg-white even:bg-slate-50/70 hover:bg-indigo-50/40">
                      <td className="w-1/3 px-4 py-3 align-top font-medium text-gray-500">{attr.name}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {attr.value}
                        {attr.unit && <span className="ml-1 text-gray-400 font-normal text-xs">{attr.unit}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}