import { BookOpen } from "lucide-react";
import type { Book } from "../../types";
import ProductCard from "./ProductCard";
import Spinner from "../ui/Spinner";

interface BookListProps {
  books?: Book[];
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
}

export default function BookList({
  books = [],
  isLoading = false,
  error = null,
  emptyMessage = "No books found.",
}: BookListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-28">
        <Spinner size="lg" />
        <p className="text-sm text-slate-400">Loading books…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="font-semibold text-slate-700">Failed to load books</p>
        <p className="text-sm text-slate-400">{error.message}</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <BookOpen className="h-8 w-8 text-slate-300" />
        </div>
        <p className="font-medium text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-5">
      {books.map((book) => (
        <ProductCard key={book.id} book={book} />
      ))}
    </div>
  );
}
