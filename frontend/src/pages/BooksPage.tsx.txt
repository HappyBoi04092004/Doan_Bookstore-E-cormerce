import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import BookList from "../components/book/BookList";
import Input from "../components/ui/Input";
import { useBooks } from "../hooks/useBooks";
import type { BookFilters } from "../types";

export default function BooksPage() {
  const [filters, setFilters] = useState<BookFilters>({
    sortBy: "newest",
    page: 1,
    limit: 12,
  });

  const { data, isLoading, error } = useBooks(filters);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setFilters((f) => ({ ...f, search: String(form.get("search") ?? ""), page: 1 }));
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Browse Books</h1>
        <p className="text-gray-500">
          {data ? `${data.total.toLocaleString()} titles available` : "Explore our collection"}
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="flex-1">
            <Input name="search" placeholder="Search by title, author…" />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                sortBy: e.target.value as BookFilters["sortBy"],
              }))
            }
          >
            <option value="newest">Newest</option>
            <option value="price">Price ↑</option>
            <option value="rating">Rating</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
      </div>

      {/* Book grid */}
      <BookList
        books={data?.items}
        isLoading={isLoading}
        error={error}
      />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {filters.page} of {data.totalPages}
          </span>
          <button
            disabled={filters.page === data.totalPages}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
