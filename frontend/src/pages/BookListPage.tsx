import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Book as BookIcon, Filter, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { useBooks } from "../hooks/useBooks";
import Spinner from "../components/ui/Spinner";
import FilterSidebar from "../components/book/FilterSidebar";
import ProductCard from "../components/book/ProductCard";
import type { Book } from "../types";

type SortOption = "newest" | "price-asc" | "price-desc" | "title-asc" | "title-desc";
type PriceRange = "all" | "under-100" | "100-300" | "300-500" | "over-500";

const getCategoryName = (book: Book) =>
  typeof book.category === "object" ? book.category?.name : book.category;

const getAuthorName = (book: Book) =>
  typeof book.author === "object" ? book.author?.name : book.author;

const getBookPrice = (book: Book) => book.variants?.[0]?.price ?? book.price;

const getPriceRange = (range: PriceRange) => {
  switch (range) {
    case "under-100":
      return { min: 0, max: 100000 };
    case "100-300":
      return { min: 100000, max: 300000 };
    case "300-500":
      return { min: 300000, max: 500000 };
    case "over-500":
      return { min: 500000, max: Number.POSITIVE_INFINITY };
    default:
      return { min: 0, max: Number.POSITIVE_INFINITY };
  }
};

const BookListPage: React.FC = () => {
  const { data: books, isLoading, isError, refetch } = useBooks();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const category = searchParams.get("category");
    return category ? [category] : [];
  });
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") ?? "");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const category = searchParams.get("category");
    setSelectedCategories(category ? [category] : []);
    setSearchTerm(searchParams.get("search") ?? "");
  }, [searchParams]);

  const filteredBooks = useMemo(() => {
    if (!books) return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const { min, max } = getPriceRange(priceRange);

    return books
      .filter((book) => {
        const categoryName = getCategoryName(book);
        const authorName = getAuthorName(book);
        const price = getBookPrice(book);

        const categoryMatch =
          selectedCategories.length === 0 ||
          selectedCategories.includes(categoryName || "");
        const authorMatch =
          selectedAuthors.length === 0 ||
          selectedAuthors.includes(authorName || "");
        const searchMatch =
          normalizedSearch.length === 0 ||
          book.title.toLowerCase().includes(normalizedSearch);
        const priceMatch = price >= min && price <= max;

        return categoryMatch && authorMatch && searchMatch && priceMatch;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "price-asc":
            return getBookPrice(a) - getBookPrice(b);
          case "price-desc":
            return getBookPrice(b) - getBookPrice(a);
          case "title-asc":
            return a.title.localeCompare(b.title, "vi");
          case "title-desc":
            return b.title.localeCompare(a.title, "vi");
          case "newest":
          default: {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
            return bTime - aTime;
          }
        }
      });
  }, [books, selectedCategories, selectedAuthors, searchTerm, priceRange, sortOption]);

  const syncCategoryToUrl = (nextCategories: string[]) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextCategories.length === 1) {
      nextParams.set("category", nextCategories[0]);
    } else {
      nextParams.delete("category");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
      syncCategoryToUrl(next);
      return next;
    });
  };

  const handleAuthorToggle = (author: string) => {
    setSelectedAuthors((prev) =>
      prev.includes(author)
        ? prev.filter((a) => a !== author)
        : [...prev, author]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedAuthors([]);
    setSearchTerm("");
    setPriceRange("all");
    setSortOption("newest");
    setSearchParams({}, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <Spinner size="lg" />
        <p className="animate-pulse font-medium text-gray-500">Đang tải thư viện sách...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-4 flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-3">
          <BookIcon className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Không thể tải sách</h2>
        <p className="mb-6 max-w-md text-red-600/80">
          Đã xảy ra lỗi khi tải danh sách sách. Vui lòng kiểm tra kết nối hoặc thử lại.
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white shadow-md transition-all hover:bg-red-700 active:scale-95"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="mx-4 flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-3">
          <BookIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Chưa có sách</h2>
        <p className="mb-0 text-gray-500">Hiện chưa có sách nào. Vui lòng quay lại sau!</p>
      </div>
    );
  }

  const activeFilterCount =
    selectedCategories.length +
    selectedAuthors.length +
    (searchTerm.trim() ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-gray-900">
            Khám phá kho sách
          </h1>
          <p className="text-lg font-medium text-gray-600">
            Tìm kiếm cuốn sách yêu thích tiếp theo trong bộ sưu tập chọn lọc của chúng tôi.
          </p>
        </div>
        <div className="hidden rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500 md:block">
          Đã tìm thấy {filteredBooks.length} sách
        </div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <FilterSidebar
          books={books}
          selectedCategories={selectedCategories}
          selectedAuthors={selectedAuthors}
          onCategoryChange={handleCategoryToggle}
          onAuthorChange={handleAuthorToggle}
          onClearFilters={handleClearFilters}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1">
          <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_190px_170px]">
              <form
                className="relative"
                onSubmit={(event) => event.preventDefault()}
              >
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm kiếm tên sách..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm font-medium text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </form>

              <label className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={priceRange}
                  onChange={(event) => setPriceRange(event.target.value as PriceRange)}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                >
                  <option value="all">Tất cả giá</option>
                  <option value="under-100">Dưới 100.000đ</option>
                  <option value="100-300">100.000đ - 300.000đ</option>
                  <option value="300-500">300.000đ - 500.000đ</option>
                  <option value="over-500">Trên 500.000đ</option>
                </select>
              </label>

              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as SortOption)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="title-asc">Tên A-Z</option>
                <option value="title-desc">Tên Z-A</option>
              </select>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4 md:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-bold text-gray-700 shadow-sm transition-all active:scale-95"
            >
              <Filter className="h-4 w-4 text-indigo-600" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-black text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="text-sm font-bold text-gray-400">
              {filteredBooks.length} kết quả
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <SearchX className="mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-1 text-lg font-bold text-gray-900">Không tìm thấy sách phù hợp</h3>
              <p className="mb-6 text-gray-500">Vui lòng thử thay đổi bộ lọc của bạn.</p>
              <button
                onClick={handleClearFilters}
                className="rounded-xl bg-indigo-600 px-6 py-2 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {filteredBooks.map((book) => (
                <ProductCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookListPage;
