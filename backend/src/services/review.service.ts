import prisma from "../lib/prisma";

const reviewInclude = {
  user: { select: { id: true, name: true, email: true } },
  book: { select: { id: true, title: true } },
};

export const reviewService = {
  async getBookReviews(bookId: number) {
    const reviews = await prisma.review.findMany({
      where: { bookId },
      orderBy: { createdAt: "desc" },
      include: reviewInclude,
    });
    const avg = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    return { reviews, averageRating: avg, total: reviews.length };
  },

  async canReview(userId: number, bookId: number) {
    const purchased = await prisma.orderItem.findFirst({
      where: {
        order: { userId, status: { in: ["PAID", "PENDING"] } },
        variant: { bookId },
      },
    });
    return Boolean(purchased);
  },

  async create(userId: number, bookId: number, rating: number, comment: string) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("Rating phải từ 1 đến 5");
    }
    const trimmed = comment?.trim();
    if (!trimmed) throw new Error("Nội dung đánh giá là bắt buộc");
    if (!(await this.canReview(userId, bookId))) {
      throw new Error("Bạn chỉ có thể đánh giá sau khi đã mua sách này");
    }

    const existing = await prisma.review.findFirst({ where: { userId, bookId } });
    if (existing) {
      return prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment: trimmed },
        include: reviewInclude,
      });
    }

    return prisma.review.create({
      data: { userId, bookId, rating, comment: trimmed },
      include: reviewInclude,
    });
  },

  getAll() {
    return prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: reviewInclude,
    });
  },

  async remove(id: number) {
    await prisma.review.delete({ where: { id } });
  },
};
