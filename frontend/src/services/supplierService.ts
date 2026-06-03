import apiClient from "./api";
import type { Supplier } from "../types";

export const supplierService = {
  async getAll(search = ""): Promise<Supplier[]> {
    const response = await apiClient.get("/api/suppliers", { params: { search } });
    return response.data.data;
  },

  async create(data: Partial<Supplier>): Promise<Supplier> {
    const response = await apiClient.post("/api/suppliers", data);
    return response.data.data;
  },

  async update({ id, data }: { id: number; data: Partial<Supplier> }): Promise<Supplier> {
    const response = await apiClient.put(`/api/suppliers/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/api/suppliers/${id}`);
  },
};
