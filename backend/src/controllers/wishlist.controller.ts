import { Request, Response } from "express";
import prisma from "../lib/prisma";

// GET /wishlist — lấy danh sách yêu thích của user hiện tại
export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Chưa đăng nhập" });
      return;
    }

    const items = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        book: {
          include: {
            author: true,
            category: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    res.json({ success: true, data: items });
  } catch (error) {
    console.error("[getWishlist]", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

// POST /wishlist/:bookId — toggle wishlist (thêm nếu chưa có, xóa nếu đã có)
export const toggleWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Chưa đăng nhập" });
      return;
    }

    const bookId = parseInt(req.params.bookId as string);
    if (isNaN(bookId)) {
      res.status(400).json({ success: false, message: "ID sách không hợp lệ" });
      return;
    }

    // Kiểm tra sách tồn tại
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      res.status(404).json({ success: false, message: "Không tìm thấy sách" });
      return;
    }

    const existing = await prisma.wishlist.findFirst({
      where: { userId: req.user.id, bookId },
    });

    if (existing) {
      // Đã có → xóa
      await prisma.wishlist.delete({ where: { id: existing.id } });
      res.json({ success: true, wishlisted: false, message: "Đã xóa khỏi danh sách yêu thích" });
    } else {
      // Chưa có → thêm
      await prisma.wishlist.create({
        data: { userId: req.user.id, bookId },
      });
      res.json({ success: true, wishlisted: true, message: "Đã thêm vào danh sách yêu thích" });
    }
  } catch (error) {
    console.error("[toggleWishlist]", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};
