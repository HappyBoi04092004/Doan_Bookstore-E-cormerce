import apiClient from "./api";
import type { Order, OrderStatus, ApiResponse } from "../types";

interface CreateOrderPayload {
  idempotencyKey: string;
  items: { bookId: number; quantity: number }[];
  paymentMethod?: string;
}

export const orderService = {
  // ── User ──────────────────────────────────────────────────────────────────

  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const { data } = await apiClient.post<ApiResponse<Order>>("/api/orders", payload);
    return data.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<ApiResponse<Order[]>>("/api/orders/myorder");
    return data.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const { data } = await apiClient.get<ApiResponse<Order>>(`/api/orders/${id}`);
    return data.data;
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  adminGetAllOrders: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<ApiResponse<Order[]>>("/api/admin/orders");
    return data.data;
  },

  adminUpdateOrderStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    const { data } = await apiClient.put<ApiResponse<Order>>(
      `/api/admin/orders/${id}/status`,
      { status }
    );
    return data.data;
  },

};
