import { Request, Response } from "express";
import { publisherService } from "../services/publisher.service";

export const publisherController = {
  async getAll(_req: Request, res: Response) {
    const data = await publisherService.getAll();
    res.json({ success: true, data });
  },

  async create(req: Request, res: Response) {
    try {
      const data = await publisherService.create(req.body.name);
      res.status(201).json({ success: true, data, message: "Tạo nhà xuất bản thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const data = await publisherService.update(Number(req.params.id), req.body.name);
      res.json({ success: true, data, message: "Cập nhật nhà xuất bản thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await publisherService.remove(Number(req.params.id));
      res.json({ success: true, message: "Xóa nhà xuất bản thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
