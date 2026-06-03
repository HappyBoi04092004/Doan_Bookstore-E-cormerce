import { Request, Response } from "express";
import { supplierService } from "../services/supplier.service";

export const supplierController = {
  async getAll(req: Request, res: Response) {
    try {
      const data = await supplierService.getAll(String(req.query.search ?? ""));
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const data = await supplierService.getById(Number(req.params.id));
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data = await supplierService.create(req.body);
      res.status(201).json({ success: true, data, message: "Tạo nhà cung cấp thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const data = await supplierService.update(Number(req.params.id), req.body);
      res.json({ success: true, data, message: "Cập nhật nhà cung cấp thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await supplierService.delete(Number(req.params.id));
      res.json({ success: true, message: "Xóa nhà cung cấp thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
