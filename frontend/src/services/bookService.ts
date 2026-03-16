import apiClient from "./api";
import type {
  Book,
  BookFilters,
  PaginatedResponse,
  ApiResponse,
} from "../types";

export const bookService = {
  /** Fetch paginated and filtered list of books */
  getBooks: async (
    filters: BookFilters = {}
  ): Promise<PaginatedResponse<Book>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Book>>>(
      "/books",
      { params: filters }
    );
    return data.data;
  },

  /** Fetch a single book by id */
  getBookById: async (id: string): Promise<Book> => {
    const { data } = await apiClient.get<ApiResponse<Book>>(`/books/${id}`);
    return data.data;
  },

  /** Admin: create a new book */
  createBook: async (payload: Omit<Book, "id" | "createdAt">): Promise<Book> => {
    const { data } = await apiClient.post<ApiResponse<Book>>("/books", payload);
    return data.data;
  },

  /** Admin: update an existing book */
  updateBook: async (
    id: string,
    payload: Partial<Omit<Book, "id" | "createdAt">>
  ): Promise<Book> => {
    const { data } = await apiClient.put<ApiResponse<Book>>(
      `/books/${id}`,
      payload
    );
    return data.data;
  },

  /** Admin: delete a book */
  deleteBook: async (id: string): Promise<void> => {
    await apiClient.delete(`/books/${id}`);
  },
};
