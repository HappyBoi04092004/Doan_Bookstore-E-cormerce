import { Request, Response } from "express";
import { importReceiptService } from "../services/importReceipt.service";

export const importReceiptController = {
  async getAll(req: Request, res: Response) {
    try {
      const data = await importReceiptService.getAll({
        search: String(req.query.search ?? ""),
        supplierId: req.query.supplierId as string,
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const data = await importReceiptService.getById(Number(req.params.id));
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data = await importReceiptService.create(req.body, req.user?.id);
      res.status(201).json({ success: true, data, message: "Tạo phiếu nhập thành công" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
