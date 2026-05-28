import apiClient from "./api";

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: number; name: string; email: string };
  book: { id: number; title: string };
}

export const reviewService = {
  async getBookReviews(bookId: number | string): Promise<{ reviews: Review[]; averageRating: number; total: number }> {
    const { data } = await apiClient.get(`/api/reviews/book/${bookId}`);
    return data.data;
  },
  async canReview(bookId: number | string): Promise<boolean> {
    const { data } = await apiClient.get(`/api/reviews/book/${bookId}/can-review`);
    return data.data.canReview;
  },
  async create(bookId: number | string, payload: { rating: number; comment: string }): Promise<Review> {
    const { data } = await apiClient.post(`/api/reviews/book/${bookId}`, payload);
    return data.data;
  },
  async getAll(): Promise<Review[]> {
    const { data } = await apiClient.get("/api/reviews");
    return data.data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/api/reviews/${id}`);
  },
};
