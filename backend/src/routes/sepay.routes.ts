import { Router } from "express";
import { receiveSePayWebhook } from "../controllers/sepay.controller";

const router = Router();

router.post("/", receiveSePayWebhook);

export default router;
