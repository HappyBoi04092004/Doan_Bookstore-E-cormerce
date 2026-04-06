import apiClient from "./api";
import type {
  Book,
  BookFilters,
  ApiResponse,
} from "../types";

export const bookService = {
  // Admin methods
  async getAdminBooks(search: string = "", page: number = 1, limit: number = 10, category?: string) {
    const response = await apiClient.get("/api/books/admin/list", {
      params: { search, page, limit, category },
    });
    return response.data; // { success, data: { books, total, page, limit } }
  },

  async createBook(data: any): Promise<Book> {
    const response = await apiClient.post("/api/books", data);
    return response.data.data;
  },

  async updateBook({ id, data }: { id: string | number; data: any }): Promise<Book> {
    const response = await apiClient.put(`/api/books/${id}`, data);
    return response.data.data;
  },

  async deleteBook(id: string | number): Promise<void> {
    await apiClient.delete(`/api/books/${id}`);
  },

  // Public methods
  getBooks: async (filters: BookFilters = {}): Promise<Book[]> => {
    const { data } = await apiClient.get<ApiResponse<Book[]>>("/api/books", {
      params: filters,
    });
    return data.data;
  },

  getBookById: async (id: string): Promise<Book> => {
    const { data } = await apiClient.get<ApiResponse<Book>>(`/api/books/${id}`);
    return data.data;
  },
};
