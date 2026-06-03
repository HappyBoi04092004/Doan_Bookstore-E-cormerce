import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Image, Search } from "lucide-react";
import { useBooks } from "../hooks/useBooks";
import ProductCard from "../components/book/ProductCard";
import { categoryService } from "../services/categoryService";

const heroBackground =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1800&q=80";

const getAssetUrl = (url?: string | null) => {
  if (!url) return "";
  return url.startsWith("/") ? `${import.meta.env.VITE_API_URL || ""}${url}` : url;
};

export default function HomePage() {
  const { data: books } = useBooks();
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
  });

  const newestBooks = [...(books ?? [])]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 8);

  return (
    <div className="bg-slate-50">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBackground})`,
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-slate-950/65" />
        <div className="relative container mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 text-left sm:px-6 md:py-28 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <BookOpen className="h-3.5 w-3.5" />
            Nhà sách trực tuyến
          </span>

          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-[3.5rem]">
            Khám phá cuốn sách yêu thích tiếp theo của bạn
          </h1>

          <p className="max-w-xl text-[1.05rem] leading-relaxed text-slate-100">
            Tìm sách mới, chọn đúng thể loại bạn thích và đặt mua nhanh trong một trải nghiệm đơn giản.
          </p>

          {/* Search bar */}
          <form
            className="flex w-full max-w-xl flex-col gap-2 rounded-xl border border-white/20 bg-white p-2 shadow-xl shadow-slate-950/20 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
              if (q.trim()) window.location.href = `/books?search=${encodeURIComponent(q)}`;
            }}
          >
            <input
              name="q"
              type="text"
              placeholder="Tìm kiếm sách, tác giả…"
              className="min-h-11 flex-1 rounded-lg bg-slate-50 px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <Search className="h-4 w-4" />
              Tìm kiếm
            </button>
          </form>

          <div className="mt-1 flex flex-wrap gap-3">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100"
            >
              Xem tất cả sách <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Tham gia miễn phí
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="bg-white">
          <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Khám phá</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Danh mục sách</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => {
                const imageUrl = getAssetUrl(category.image);
                return (
                  <Link
                    key={category.id}
                    to={`/books?category=${encodeURIComponent(category.name)}`}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/70"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={category.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <Image className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
                      <h3 className="absolute bottom-3 left-3 right-3 text-base font-bold text-white">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {newestBooks.length > 0 && (
        <section className="bg-slate-50">
          <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Mới nhất</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Sách mới cập nhật</h2>
              </div>
              <Link
                to="/books"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-600"
              >
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newestBooks.map((book) => (
                <ProductCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Sẵn sàng đọc sách chưa?
          </h2>
          <p className="text-slate-500 mb-7 text-[15px]">
            Không cần đăng ký. Không ràng buộc. Chỉ có sách hay.
          </p>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Mua ngay <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
