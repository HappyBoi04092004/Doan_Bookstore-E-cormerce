import React, { useMemo } from "react";
import { X, Filter, ChevronRight } from "lucide-react";
import type { Book } from "../../types";

interface FilterSidebarProps {
  books: Book[];
  selectedCategories: string[];
  selectedAuthors: string[];
  onCategoryChange: (category: string) => void;
  onAuthorChange: (author: string) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  books,
  selectedCategories,
  selectedAuthors,
  onCategoryChange,
  onAuthorChange,
  onClearFilters,
  isOpen,
  onClose,
}) => {
  // Extract unique categories and their counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach((book) => {
      const catName = book.category.name;
      counts[catName] = (counts[catName] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  }, [books]);

  // Extract unique authors and their counts
  const authors = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach((book) => {
      const authorName = book.author.name;
      counts[authorName] = (counts[authorName] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  }, [books]);

  const hasFilters = selectedCategories.length > 0 || selectedAuthors.length > 0;

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
        </div>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Xóa tất cả
          </button>
        )}
        <button onClick={onClose} className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Categories Section */}
        <div>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Thể loại</h3>
          <div className="space-y-3">
            {categories.map(([name, count]) => (
              <label
                key={name}
                className="flex items-center group cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 rounded border-2 border-gray-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                    checked={selectedCategories.includes(name)}
                    onChange={() => onCategoryChange(name)}
                  />
                  <ChevronRight className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className={`ml-3 text-sm font-medium transition-colors ${
                  selectedCategories.includes(name) ? "text-indigo-600" : "text-gray-600 group-hover:text-gray-900"
                }`}>
                  {name}
                </span>
                <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Authors Section */}
        <div>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Tác giả</h3>
          <div className="space-y-3">
            {authors.map(([name, count]) => (
              <label
                key={name}
                className="flex items-center group cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 rounded border-2 border-gray-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                    checked={selectedAuthors.includes(name)}
                    onChange={() => onAuthorChange(name)}
                  />
                  <ChevronRight className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className={`ml-3 text-sm font-medium transition-colors ${
                  selectedAuthors.includes(name) ? "text-indigo-600" : "text-gray-600 group-hover:text-gray-900"
                }`}>
                  {name}
                </span>
                <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 bg-white border border-gray-100 rounded-2xl shadow-sm h-fit sticky top-24">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-80 bg-white transition-transform duration-300 ease-out shadow-2xl ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {SidebarContent}
        </aside>
      </div>
    </>
  );
};

export default FilterSidebar;
