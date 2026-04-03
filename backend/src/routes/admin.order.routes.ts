import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { adminGetAllOrders, adminUpdateOrderStatus } from "../controllers/order.controller";

const router = Router();

// Admin only
router.use(authenticate, authorize(["admin"]));

router.get("/orders", adminGetAllOrders);
router.put("/orders/:id/status", adminUpdateOrderStatus);

export default router;
