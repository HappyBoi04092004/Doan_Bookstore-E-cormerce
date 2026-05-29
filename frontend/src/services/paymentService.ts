import apiClient from "./api";

export interface CreateSePayPaymentPayload {
  orderId: string;
  amount: number;
  items: { variantId: number; quantity: number }[];
}

export interface CreateSePayPaymentResponse {
  paymentUrl: string;
  paymentFields: Record<string, string | number | undefined>;
  autoSubmitHtml: string;
  orderId: string;
}

export interface PaymentStatus {
  orderId: string;
  amount: number;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
}

export const paymentService = {
  createSePayPayment: async (payload: CreateSePayPaymentPayload) => {
    const { data } = await apiClient.post<CreateSePayPaymentResponse>(
      "/api/payment/sepay/create",
      payload
    );
    return data;
  },

  getSePayPaymentStatus: async (orderId: string) => {
    const { data } = await apiClient.get<{ data: PaymentStatus }>(
      `/api/payment/sepay/status/${encodeURIComponent(orderId)}`
    );
    return data.data;
  },
};
