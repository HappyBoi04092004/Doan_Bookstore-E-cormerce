import { useQuery } from "@tanstack/react-query";
import { bookService } from "../services/bookService";
import type { BookFilters } from "../types";

export function useBooks(filters: BookFilters = {}) {
  return useQuery({
    queryKey: ["books", filters],
    queryFn: () => bookService.getBooks(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ["book", id],
    queryFn: () => bookService.getBookById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}
