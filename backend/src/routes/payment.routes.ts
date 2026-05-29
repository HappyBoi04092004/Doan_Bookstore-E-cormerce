import { Router } from "express";
import {
  createSePayPayment,
  getSePayPaymentStatus,
  paymentCancel,
  paymentError,
  paymentSuccess,
  receiveSePayIpn,
} from "../controllers/payment.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.post("/api/payment/sepay/create", authenticate, createSePayPayment);
router.get("/api/payment/sepay/status/:orderId", authenticate, getSePayPaymentStatus);
router.post("/payment/sepay/create", authenticate, createSePayPayment);
router.get("/payment/sepay/status/:orderId", authenticate, getSePayPaymentStatus);
router.post("/api/sepay/ipn", receiveSePayIpn);
router.post("/sepay/ipn", receiveSePayIpn);

router.get("/payment/success", paymentSuccess);
router.get("/payment/error", paymentError);
router.get("/payment/cancel", paymentCancel);

export default router;
