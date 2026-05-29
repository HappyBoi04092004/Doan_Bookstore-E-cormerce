import { Request, Response } from "express";
import { orderService } from "../services/order.service";

export const receiveSePayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    await orderService.handleSePayWebhook(req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[receiveSePayWebhook]", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};
