import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, BriefcaseBusiness, Code2, GraduationCap, Languages, Library, Palette, Search, Sparkles, Star } from "lucide-react";
import { useBooks } from "../hooks/useBooks";
import ProductCard from "../components/book/ProductCard";

const categories = [
  { name: "Văn học", icon: Library },
  { name: "Kinh tế", icon: BriefcaseBusiness },
  { name: "Công nghệ", icon: Code2 },
  { name: "Kỹ năng sống", icon: Sparkles },
  { name: "Ngoại ngữ", icon: Languages },
  { name: "Thiếu nhi", icon: Star },
  { name: "Truyện tranh", icon: Palette },
  { name: "Khác", icon: GraduationCap },
];

export default function HomePage() {
  const { data: books } = useBooks();
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
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700">
        {/* Subtle dot-grid decoration */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center gap-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-sm font-medium text-indigo-100 backdrop-blur-sm">
            <BookOpen className="h-3.5 w-3.5" />
            Nhà sách trực tuyến yêu thích của Việt Nam
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold text-white leading-[1.15] tracking-tight max-w-2xl">
            Khám phá cuốn sách yêu thích tiếp theo của bạn
          </h1>

          <p className="text-[1.05rem] text-indigo-200 max-w-lg leading-relaxed">
            Khám phá hàng ngàn tựa sách — từ best-seller đến những cuốn sách quý hiếm. Giao hàng nhanh tận nhà.
          </p>

          {/* Search bar */}
          <form
            className="flex w-full max-w-md gap-0 rounded-xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-sm p-1"
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
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-indigo-300 outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              <Search className="h-4 w-4" />
              Tìm kiếm
            </button>
          </form>

          <div className="flex flex-wrap gap-3 justify-center mt-1">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
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

      <section className="bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Khám phá</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Danh mục sách</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
            {categories.map(({ name, icon: Icon }) => (
              <Link
                key={name}
                to={`/books?category=${encodeURIComponent(name)}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/70"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
