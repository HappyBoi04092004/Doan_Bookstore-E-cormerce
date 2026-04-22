import apiClient from "./api";
import type { Book } from "../types";

export interface WishlistItem {
  id: number;
  userId: number;
  bookId: number;
  book: Book;
}

export const wishlistService = {
  async getWishlist(): Promise<WishlistItem[]> {
    const { data } = await apiClient.get("/api/wishlist");
    return data.data;
  },

  async toggleWishlist(bookId: number): Promise<{ wishlisted: boolean; message: string }> {
    const { data } = await apiClient.post(`/api/wishlist/${bookId}`);
    return data;
  },
};
