import { Request, Response } from "express";
import { reviewService } from "../services/review.service";

export const reviewController = {
  async getBookReviews(req: Request, res: Response) {
    const data = await reviewService.getBookReviews(Number(req.params.bookId));
    res.json({ success: true, data });
  },

  async canReview(req: Request, res: Response) {
    const canReview = await reviewService.canReview(req.user!.id, Number(req.params.bookId));
    res.json({ success: true, data: { canReview } });
  },

  async create(req: Request, res: Response) {
    try {
      const data = await reviewService.create(
        req.user!.id,
        Number(req.params.bookId),
        Number(req.body.rating),
        req.body.comment
      );
      res.status(201).json({ success: true, data, message: "Gửi đánh giá thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getAll(_req: Request, res: Response) {
    const data = await reviewService.getAll();
    res.json({ success: true, data });
  },

  async remove(req: Request, res: Response) {
    try {
      await reviewService.remove(Number(req.params.id));
      res.json({ success: true, message: "Xóa đánh giá thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
