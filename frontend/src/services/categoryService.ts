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

  async create(payload: { name: string; image?: any }): Promise<Category> {
    const formData = new FormData();
    formData.append("name", payload.name);
    if (payload.image) formData.append("image", payload.image);
    
    const { data } = await apiClient.post("/api/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data.data;
  },

  async update(id: number, payload: { name?: string; image?: any }): Promise<Category> {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.image) formData.append("image", payload.image);
    
    const { data } = await apiClient.put(`/api/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/categories/${id}`);
  },
};
