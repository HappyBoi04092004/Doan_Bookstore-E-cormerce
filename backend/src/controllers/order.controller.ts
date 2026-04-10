import { Request, Response } from "express";
import { orderService } from "../services/order.service";

import { z } from "zod";

const createOrderSchema = z.object({
  idempotencyKey: z.string().min(1, "idempotencyKey is required"),
  items: z.array(z.object({
    bookId: z.number().int().positive("bookId must be a positive integer"),
    quantity: z.number().int().positive("quantity must be a positive integer").max(100, "quantity cannot exceed 100")
  })).min(1, "items must be a non-empty array"),
  paymentMethod: z.enum(["cod", "banking"]).optional(),
  address: z.object({
    name: z.string(),
    phone: z.string(),
    street: z.string(),
    provinceCode: z.number().int(),
    districtCode: z.number().int(),
    wardCode: z.number().int(),
  }).optional(),
});

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validatedBody = createOrderSchema.parse(req.body);

    const order = await orderService.createOrder(userId, validatedBody);
    res.status(201).json({ message: "Order created", data: order });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ message: "Validation error", errors: error.issues });
       return;
    }
    console.error("[createOrder]", error);
    res.status(400).json({ message: error.message || "Failed to create order" });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const orders = await orderService.getMyOrders(userId);
    res.json({ message: "OK", data: orders });
  } catch (error) {
    console.error("[getMyOrders]", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const orderId = Number(req.params.id);

    const order = await orderService.getOrderById(orderId, userId);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.json({ message: "OK", data: order });
  } catch (error: any) {
    if (error.message === "Forbidden") {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    console.error("[getOrderById]", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────

export const adminGetAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await orderService.getAllOrders();
    res.json({ message: "OK", data: orders });
  } catch (error) {
    console.error("[adminGetAllOrders]", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const adminUpdateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body as { status: string };

    if (!status) {
      res.status(400).json({ message: "status is required" });
      return;
    }

    const order = await orderService.updateOrderStatus(orderId, status);
    res.json({ message: "Status updated", data: order });
  } catch (error: any) {
    if (error.message === "Invalid status") {
      res.status(400).json({ message: "Invalid status. Must be PENDING, PAID, or FAILED" });
      return;
    }
    console.error("[adminUpdateOrderStatus]", error);
    res.status(500).json({ message: "Server error" });
  }
};

