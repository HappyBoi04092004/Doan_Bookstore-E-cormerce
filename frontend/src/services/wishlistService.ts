import apiClient from "./api";
import type { Book, BookVariant } from "../types";

export interface WishlistItem {
  id: number;
  userId: number;
  variantId: number;
  variant: BookVariant & { book: Book };
}

export const wishlistService = {
  async getWishlist(): Promise<WishlistItem[]> {
    const { data } = await apiClient.get("/api/wishlist");
    return data.data;
  },

  async toggleWishlist(variantId: number): Promise<{ wishlisted: boolean; message: string }> {
    const { data } = await apiClient.post(`/api/wishlist/${variantId}`);
    return data;
  },
};
