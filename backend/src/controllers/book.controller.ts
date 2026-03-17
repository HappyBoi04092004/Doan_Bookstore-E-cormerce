import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany({
      include: { author: true, category: true },
    });
    res.json({ message: "OK", data: books });
  } catch (error) {
    console.error("[getBooks]", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const book = await prisma.book.findUnique({
      where: { id },
      include: { author: true, category: true },
    });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "OK", data: book });
  } catch (error) {
    console.error("[getBookById]", error);
    res.status(500).json({ message: "Server error", error });
  }
};
