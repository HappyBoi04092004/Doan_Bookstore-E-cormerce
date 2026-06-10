import apiClient from "./api";
import type { Coupon, ApiResponse, PaginatedResponse } from "../types";

export interface GetCouponsParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ValidateCouponPayload {
  code: string;
  orderTotal: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon: Coupon;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

export const couponService = {
  async getAllAdmin(params: GetCouponsParams): Promise<PaginatedResponse<Coupon>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Coupon>>>("/api/admin/coupons", {
      params,
    });
    return data.data;
  },

  async getByIdAdmin(id: number): Promise<Coupon> {
    const { data } = await apiClient.get<ApiResponse<Coupon>>(`/api/admin/coupons/${id}`);
    return data.data;
  },

  async createAdmin(payload: Omit<Coupon, "id" | "usedCount" | "isDeleted" | "createdAt" | "updatedAt">): Promise<Coupon> {
    const { data } = await apiClient.post<ApiResponse<Coupon>>("/api/admin/coupons", payload);
    return data.data;
  },

  async updateAdmin(
    id: number,
    payload: Partial<Omit<Coupon, "id" | "usedCount" | "isDeleted" | "createdAt" | "updatedAt">>
  ): Promise<Coupon> {
    const { data } = await apiClient.put<ApiResponse<Coupon>>(`/api/admin/coupons/${id}`, payload);
    return data.data;
  },

  async removeAdmin(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/coupons/${id}`);
  },

  async validateCoupon(payload: ValidateCouponPayload): Promise<ValidateCouponResponse> {
    const { data } = await apiClient.post<ValidateCouponResponse>("/api/coupons/validate", payload);
    return data;
  },
};
