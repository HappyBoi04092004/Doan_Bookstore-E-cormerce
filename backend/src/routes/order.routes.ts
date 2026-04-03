import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { createOrder, getMyOrders, getOrderById } from "../controllers/order.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post("/", createOrder);
router.get("/myorder", getMyOrders);
router.get("/:id", getOrderById);

export default router;
