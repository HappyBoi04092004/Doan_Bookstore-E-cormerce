import { Link } from "react-router-dom";
import { BookOpen, Facebook, Instagram, Mail, MapPin, Music2, Phone, Youtube } from "lucide-react";

const categoryLinks = ["Văn học", "Công nghệ", "Kinh tế", "Kỹ năng sống", "Ngoại ngữ"];

const supportLinks = [
  { to: "/contact", label: "Liên hệ" },
  { to: "#", label: "Chính sách giao hàng" },
  { to: "#", label: "Chính sách đổi trả" },
  { to: "#", label: "Điều khoản sử dụng" },
  { to: "#", label: "Chính sách bảo mật" },
];

const socialLinks = [
  { label: "Facebook", icon: Facebook },
  { label: "Instagram", icon: Instagram },
  { label: "TikTok", icon: Music2 },
  { label: "YouTube", icon: Youtube },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-400">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2.5 font-bold text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg">BookStore</span>
            </Link>
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              BookStore là website bán sách trực tuyến cung cấp nhiều đầu sách thuộc các lĩnh vực khác nhau phục vụ nhu cầu học tập và giải trí.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Danh mục</h4>
            <ul className="space-y-2.5">
              {categoryLinks.map((category) => (
                <li key={category}>
                  <Link
                    to={`/books?category=${encodeURIComponent(category)}`}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2.5">
              {supportLinks.map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="text-sm transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Thông tin liên hệ</h4>
            <div className="space-y-3 text-sm">
              <a
                href="mailto:bookstore@example.com"
                className="flex items-start gap-3 transition-colors hover:text-white"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                bookstore@example.com
              </a>
              <a href="tel:+84941579339" className="flex items-start gap-3 transition-colors hover:text-white">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                +84 941 579 339
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                123 Đường Sách, TP. Hồ Chí Minh
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {socialLinks.map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-indigo-500 hover:bg-indigo-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © 2026 BookStore. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
