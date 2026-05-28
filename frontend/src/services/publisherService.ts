import apiClient from "./api";

export interface Publisher {
  id: number;
  name: string;
  _count?: { books: number };
}

export const publisherService = {
  async getAll(): Promise<Publisher[]> {
    const { data } = await apiClient.get("/api/publishers");
    return data.data;
  },
  async create(payload: { name: string }): Promise<Publisher> {
    const { data } = await apiClient.post("/api/publishers", payload);
    return data.data;
  },
  async update(id: number, payload: { name: string }): Promise<Publisher> {
    const { data } = await apiClient.put(`/api/publishers/${id}`, payload);
    return data.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/publishers/${id}`);
  },
};
