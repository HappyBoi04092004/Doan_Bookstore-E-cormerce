import apiClient from "./api";

export interface Author {
  id: number;
  name: string;
  _count?: { books: number };
}

export const authorService = {
  async getAll(): Promise<Author[]> {
    const { data } = await apiClient.get("/api/authors");
    return data.data;
  },
  async create(payload: { name: string }): Promise<Author> {
    const { data } = await apiClient.post("/api/authors", payload);
    return data.data;
  },
  async update(id: number, payload: { name: string }): Promise<Author> {
    const { data } = await apiClient.put(`/api/authors/${id}`, payload);
    return data.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/authors/${id}`);
  },
};
