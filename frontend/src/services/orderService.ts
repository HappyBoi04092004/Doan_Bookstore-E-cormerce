import apiClient from "./api";
import type { Order, ShippingAddress, ApiResponse, PaginatedResponse } from "../types";

interface CreateOrderPayload {
  items: { bookId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "card" | "banking";
}

export const orderService = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const { data } = await apiClient.post<ApiResponse<Order>>(
      "/orders",
      payload
    );
    return data.data;
  },

  getMyOrders: async (): Promise<PaginatedResponse<Order>> => {
    const { data } =
      await apiClient.get<ApiResponse<PaginatedResponse<Order>>>("/orders/me");
    return data.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return data.data;
  },

  /** Admin */
  getAllOrders: async (): Promise<PaginatedResponse<Order>> => {
    const { data } =
      await apiClient.get<ApiResponse<PaginatedResponse<Order>>>("/orders");
    return data.data;
  },

  updateOrderStatus: async (
    id: string,
    status: Order["status"]
  ): Promise<Order> => {
    const { data } = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${id}/status`,
      { status }
    );
    return data.data;
  },
};
