import apiClient from "./api";
import type {
  Book,
  BookFilters,
  ApiResponse,
} from "../types";

export const bookService = {
  /** Fetch paginated and filtered list of books */
  getBooks: async (filters: BookFilters = {}): Promise<Book[]> => {
    const { data } = await apiClient.get<ApiResponse<Book[]>>("/api/books", {
      params: filters,
    });
    return data.data;
  },

  /** Fetch a single book by id */
  getBookById: async (id: string): Promise<Book> => {
    const { data } = await apiClient.get<ApiResponse<Book>>(`/api/books/${id}`);
    return data.data;
  },

  /** Admin: create a new book */
  createBook: async (payload: Omit<Book, "id" | "createdAt">): Promise<Book> => {
    const { data } = await apiClient.post<ApiResponse<Book>>("/api/books", payload);
    return data.data;
  },

  /** Admin: update an existing book */
  updateBook: async (
    id: string,
    payload: Partial<Omit<Book, "id" | "createdAt">>
  ): Promise<Book> => {
    const { data } = await apiClient.put<ApiResponse<Book>>(
      `/api/books/${id}`,
      payload
    );
    return data.data;
  },

  /** Admin: delete a book */
  deleteBook: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/books/${id}`);
  },
};
