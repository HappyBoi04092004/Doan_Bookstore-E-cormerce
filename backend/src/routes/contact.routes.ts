import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { contactController } from "../controllers/contact.controller";

const router = Router();

router.post("/", contactController.create);
router.get("/", authenticate, authorize(["admin"]), contactController.getAll);
router.patch("/:id/status", authenticate, authorize(["admin"]), contactController.updateStatus);
router.delete("/:id", authenticate, authorize(["admin"]), contactController.remove);

export default router;
