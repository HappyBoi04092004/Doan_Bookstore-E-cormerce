import { Link } from "react-router-dom";
import { BookOpen, Github, Mail, Phone } from "lucide-react";

const footerLinks = {
  Shop: [
    { to: "/books", label: "Browse Books" },
    { to: "/books?sort=newest", label: "New Arrivals" },
    { to: "/books?sort=rating", label: "Best Sellers" },
  ],
  Account: [
    { to: "/login", label: "Sign In" },
    { to: "/register", label: "Register" },
    { to: "/cart", label: "My Cart" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2.5 font-bold text-white mb-4"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="text-[16px]">HPStore</span>
            </Link>
            <p className="text-[13px] leading-relaxed text-slate-400">
              HPStore không chỉ bán sản phẩm, chúng tôi còn mang những trí thức đến gần hơn với người Việt
            </p>

            {/* Contact info */}
            <div className="mt-5 space-y-2">
              <a
                href="mailto:nguyenhanhphuc08102004@gmail.com"
                className="flex items-center gap-2 text-[12.5px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                nguyenhanhphuc08102004@gmail.com
              </a>
              <a
                href="tel:+84901234567"
                className="flex items-center gap-2 text-[12.5px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                +84941579339
              </a>
              <a
                href="https://github.com/HappyBoi04092004"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[12.5px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Github className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                GitHub của nhà sáng lập
              </a>
            </div>
          </div>

          {/* Quick link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-[13px] text-slate-400 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">
              Stay Updated
            </h4>
            <p className="text-[13px] text-slate-400 mb-3 leading-relaxed">
              Get weekly picks and exclusive deals.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-[12.5px] text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-3 py-2 text-[12px] font-semibold text-white hover:bg-indigo-700 transition-colors shrink-0"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-slate-600">
          <span>© {new Date().getFullYear()} BookStore. All rights reserved.</span>
          <span>Built with React + TypeScript + TailwindCSS</span>
        </div>
      </div>
    </footer>
  );
}
