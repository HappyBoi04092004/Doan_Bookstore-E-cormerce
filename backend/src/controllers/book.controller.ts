import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { bookService } from "../services/book.service";

export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({
      include: { category: true, author: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({ message: "OK", data: books });
  } catch (error) {
    console.error("[getBooks]", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ", error });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const book = await prisma.book.findUnique({
      where: { id },
      include: { category: true, author: true },
    });
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
    res.json({ message: "OK", data: book });
  } catch (error) {
    console.error("[getBookById]", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ", error });
  }
};

// Admin handlers
export const getAdminBooks = async (req: Request, res: Response): Promise<void> => {
   try {
      const search = (req.query.search as string) || "";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = (req.query.category as string) || "";

      const data = await bookService.getAdminBooks(search, page, limit, category);
      res.json({ success: true, data });
   } catch (error: any) {
      console.error("[getAdminBooks]", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
   }
}

export const createBook = async (req: Request, res: Response): Promise<void> => {
   try {
      const imagePath = req.file ? `/uploads/books/${req.file.filename}` : null;
      const data = await bookService.createBook({ ...req.body, image: imagePath });
      res.status(201).json({ success: true, data, message: "Tạo sách thành công" });
   } catch (error: any) {
      console.error("[createBook]", error.message);
      res.status(400).json({ success: false, message: error.message });
   }
}

export const updateBook = async (req: Request, res: Response): Promise<void> => {
   try {
      const id = parseInt(req.params.id as string);
      const imagePath = req.file ? `/uploads/books/${req.file.filename}` : undefined;
      const data = await bookService.updateBook(id, { ...req.body, image: imagePath });
      res.json({ success: true, data, message: "Cập nhật sách thành công" });
   } catch (error: any) {
      console.error("[updateBook]", error.message);
      res.status(400).json({ success: false, message: error.message });
   }
}

export const deleteBook = async (req: Request, res: Response): Promise<void> => {
   try {
      const id = parseInt(req.params.id as string);
      await bookService.deleteBook(id);
      res.json({ success: true, message: "Xoá sách thành công" });
   } catch (error: any) {
      console.error("[deleteBook]", error);
      res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
   }
}
