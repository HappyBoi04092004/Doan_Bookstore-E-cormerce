import { Request, Response } from "express";
import { bookService } from "../services/book.service";

function extractImagePaths(files: Express.Multer.File[] | undefined): string[] {
  if (!files || !Array.isArray(files)) return [];
  return files.map((file) => `/uploads/books/${file.filename}`);
}

function parseAttributes(raw: unknown): { attributeId: number; value: string }[] {
  if (!raw) return [];

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((attribute) => attribute?.attributeId && attribute?.value !== undefined)
      .map((attribute) => ({
        attributeId: Number(attribute.attributeId),
        value: String(attribute.value),
      }));
  } catch {
    return [];
  }
}

function parseVariants(raw: unknown) {
  if (!raw) return [];

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const getBooks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const books = await bookService.getBooks();
    res.json({ message: "OK", data: books });
  } catch (error) {
    console.error("[getBooks]", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ", error });
  }
};

export const getBookById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const book = await bookService.getBookById(id);
    res.json({ message: "OK", data: book });
  } catch (error: any) {
    if (error.message === "Không tìm thấy sách") {
      res.status(404).json({ message: error.message });
      return;
    }
    console.error("[getBookById]", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ", error });
  }
};

export const getAdminBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = (req.query.search as string) || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = (req.query.category as string) || "";

    const data = await bookService.getAdminBooks(search, page, limit, category);
    res.json({ success: true, data });
  } catch (error) {
    console.error("[getAdminBooks]", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

export const createBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const imagePaths = extractImagePaths(req.files as Express.Multer.File[]);
    const attributes = parseAttributes(req.body.attributes);
    const variants = parseVariants(req.body.variants);

    const data = await bookService.createBook({
      ...req.body,
      imagePaths,
      attributes,
      variants,
    });
    res.status(201).json({ success: true, data, message: "Tạo sách thành công" });
  } catch (error: any) {
    console.error("[createBook]", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const imagePaths = extractImagePaths(req.files as Express.Multer.File[]);
    const attributes = parseAttributes(req.body.attributes);
    const variants = parseVariants(req.body.variants);

    const data = await bookService.updateBook(id, {
      ...req.body,
      imagePaths: imagePaths.length > 0 ? imagePaths : undefined,
      attributes: req.body.attributes !== undefined ? attributes : undefined,
      variants: req.body.variants !== undefined ? variants : undefined,
    });
    res.json({ success: true, data, message: "Cập nhật sách thành công" });
  } catch (error: any) {
    console.error("[updateBook]", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    await bookService.deleteBook(id);
    res.json({ success: true, message: "Xoá sách thành công" });
  } catch (error) {
    console.error("[deleteBook]", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

export const getAttributes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await bookService.getAttributes();
    res.json({ success: true, data });
  } catch (error) {
    console.error("[getAttributes]", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

export const createAttribute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, unit } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: "Tên thuộc tính là bắt buộc" });
      return;
    }

    const data = await bookService.createAttribute(name, unit);
    res.status(201).json({ success: true, data, message: "Tạo thuộc tính thành công" });
  } catch (error: any) {
    console.error("[createAttribute]", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
