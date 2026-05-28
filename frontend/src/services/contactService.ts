import apiClient from "./api";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "RESOLVED";
  createdAt: string;
  user?: { id: number; name: string; email: string } | null;
}

export const contactService = {
  async create(payload: { name: string; email: string; subject: string; message: string }) {
    const { data } = await apiClient.post("/api/contacts", payload);
    return data.data;
  },
  async getAll(): Promise<ContactMessage[]> {
    const { data } = await apiClient.get("/api/contacts");
    return data.data;
  },
  async updateStatus(id: number, status: ContactMessage["status"]) {
    const { data } = await apiClient.patch(`/api/contacts/${id}/status`, { status });
    return data.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/contacts/${id}`);
  },
};
