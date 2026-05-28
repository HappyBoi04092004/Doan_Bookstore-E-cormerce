import { Request, Response } from "express";
import { authorService } from "../services/author.service";

export const authorController = {
  async getAll(_req: Request, res: Response) {
    const data = await authorService.getAll();
    res.json({ success: true, data });
  },

  async create(req: Request, res: Response) {
    try {
      const data = await authorService.create(req.body.name);
      res.status(201).json({ success: true, data, message: "Tạo tác giả thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const data = await authorService.update(Number(req.params.id), req.body.name);
      res.json({ success: true, data, message: "Cập nhật tác giả thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await authorService.remove(Number(req.params.id));
      res.json({ success: true, message: "Xóa tác giả thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
