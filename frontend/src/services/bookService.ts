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
    const formData = new FormData();
    const { images, variants, ...rest } = data;

    Object.keys(rest).forEach((key) => {
      if (rest[key] !== undefined && rest[key] !== null) {
        formData.append(key, rest[key]);
      }
    });

    if (Array.isArray(images)) {
      images.forEach((file: File) => formData.append("images", file));
    }
    if (variants) {
      formData.append("variants", JSON.stringify(variants));
    }

    const response = await apiClient.post("/api/books", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data.data;
  },

  async updateBook({ id, data }: { id: string | number; data: any }): Promise<Book> {
    const formData = new FormData();
    const { images, variants, ...rest } = data;

    Object.keys(rest).forEach((key) => {
      if (rest[key] !== undefined && rest[key] !== null) {
        formData.append(key, rest[key]);
      }
    });
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((file: File) => formData.append("images", file));
    }
    if (variants !== undefined) {
      formData.append("variants", JSON.stringify(variants));
    }
    const response = await apiClient.put(`/api/books/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
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

  async extractBookInfoFromImage(imageFiles: File | File[]): Promise<any> {
    const formData = new FormData();
    const files = Array.isArray(imageFiles) ? imageFiles.slice(0, 2) : [imageFiles];
    files.forEach((file) => formData.append("bookCovers", file));

    const response = await apiClient.post("/api/gemini/extract-from-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },
};
