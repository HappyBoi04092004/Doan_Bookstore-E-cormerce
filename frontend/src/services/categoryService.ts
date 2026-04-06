import apiClient from "./api";

export interface Category {
  id: number;
  name: string;
  image: string | null;
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await apiClient.get("/api/categories");
    return data.data;
  },

  async create(payload: { name: string; image?: string }): Promise<Category> {
    const { data } = await apiClient.post("/api/categories", payload);
    return data.data;
  },

  async update(id: number, payload: { name?: string; image?: string }): Promise<Category> {
    const { data } = await apiClient.put(`/api/categories/${id}`, payload);
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/categories/${id}`);
  },
};
