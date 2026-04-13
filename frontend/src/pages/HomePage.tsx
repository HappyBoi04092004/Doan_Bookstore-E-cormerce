import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Star, Truck, Search } from "lucide-react";

export default function HomePage() {
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

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Vì sao chọn BookStore?
          </h2>
          <p className="mt-3 text-slate-500 max-w-md mx-auto">
            Chúng tôi giúp bạn dễ dàng tìm, mua và tận hưởng những cuốn sách bạn yêu thích.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { icon: BookOpen, title: "Kho sách khổng lồ", desc: "Hàng ngàn tựa sách đủ thể loại: tiểu thuyết, khoa học, lịch sử, v.v." },
            { icon: Star, title: "Gợi ý chọn lọc", desc: "Đội ngũ biên tập viên đề xuất sách hay mỗi tuần." },
            { icon: Truck, title: "Giao hàng nhanh", desc: "Giao trong ngày tại các thành phố lớn trên toàn quốc." },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex h-13 w-13 h-[52px] w-[52px] items-center justify-center rounded-xl bg-indigo-50">
                <Icon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-[1rem] font-semibold text-slate-900">{title}</h3>
              <p className="text-slate-500 text-[13.5px] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

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
