import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controller";

const router = Router();

// Admin API
router.post("/admin/coupons", authenticate, authorize(["admin"]), createCoupon);
router.get("/admin/coupons", authenticate, authorize(["admin"]), getCoupons);
router.get("/admin/coupons/:id", authenticate, authorize(["admin"]), getCouponById);
router.put("/admin/coupons/:id", authenticate, authorize(["admin"]), updateCoupon);
router.delete("/admin/coupons/:id", authenticate, authorize(["admin"]), deleteCoupon);

// User API
router.post("/coupons/validate", authenticate, validateCoupon);

export default router;
