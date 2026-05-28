import { Request, Response } from "express";
import { contactService } from "../services/contact.service";

export const contactController = {
  async create(req: Request, res: Response) {
    try {
      const data = await contactService.create({ ...req.body, userId: req.user?.id });
      res.status(201).json({ success: true, data, message: "Gửi góp ý thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getAll(_req: Request, res: Response) {
    const data = await contactService.getAll();
    res.json({ success: true, data });
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const data = await contactService.updateStatus(Number(req.params.id), req.body.status);
      res.json({ success: true, data, message: "Cập nhật liên hệ thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await contactService.remove(Number(req.params.id));
      res.json({ success: true, message: "Xóa liên hệ thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
