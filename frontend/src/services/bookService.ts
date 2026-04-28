import apiClient from "./api";
import type {
  Book,
  BookFilters,
  ApiResponse,
  Attribute,
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
    const { images, attributes, variants, ...rest } = data;

    Object.keys(rest).forEach((key) => {
      if (rest[key] !== undefined && rest[key] !== null) {
        formData.append(key, rest[key]);
      }
    });

    if (Array.isArray(images)) {
      images.forEach((file: File) => formData.append("images", file));
    }
    if (attributes) {
      formData.append("attributes", JSON.stringify(attributes));
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
    const { images, attributes, variants, ...rest } = data;

    Object.keys(rest).forEach((key) => {
      if (rest[key] !== undefined && rest[key] !== null) {
        formData.append(key, rest[key]);
      }
    });
    if (Array.isArray(images) && images.length > 0) {
      images.forEach((file: File) => formData.append("images", file));
    }
    if (attributes !== undefined) {
      formData.append("attributes", JSON.stringify(attributes));
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

  getAttributes: async (): Promise<Attribute[]> => {
    const { data } = await apiClient.get("/api/books/meta/attributes");
    return data.data;
  },

  createAttribute: async (name: string, unit?: string): Promise<Attribute> => {
    const { data } = await apiClient.post("/api/books/meta/attributes", { name, unit });
    return data.data;
  },
};
