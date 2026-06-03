import apiClient from "./api";
import type { ImportReceipt } from "../types";

export type CreateImportReceiptPayload = {
  supplierId: number;
  note?: string;
  details: Array<{
    variantId: number;
    quantity: number;
    importPrice: number;
  }>;
};

export const importReceiptService = {
  async getAll(filters: { search?: string; supplierId?: string; fromDate?: string; toDate?: string } = {}): Promise<ImportReceipt[]> {
    const response = await apiClient.get("/api/import-receipts", { params: filters });
    return response.data.data;
  },

  async getById(id: number): Promise<ImportReceipt> {
    const response = await apiClient.get(`/api/import-receipts/${id}`);
    return response.data.data;
  },

  async create(data: CreateImportReceiptPayload): Promise<ImportReceipt> {
    const response = await apiClient.post("/api/import-receipts", data);
    return response.data.data;
  },
};
