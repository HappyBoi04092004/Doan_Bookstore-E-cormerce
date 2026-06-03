import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { importReceiptController } from "../controllers/importReceipt.controller";

const router = Router();

router.use(authenticate, authorize(["admin"]));
router.get("/", importReceiptController.getAll);
router.get("/:id", importReceiptController.getById);
router.post("/", importReceiptController.create);

export default router;
