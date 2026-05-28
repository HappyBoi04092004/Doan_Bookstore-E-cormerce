import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { authorController } from "../controllers/author.controller";

const router = Router();

router.get("/", authorController.getAll);
router.post("/", authenticate, authorize(["admin"]), authorController.create);
router.put("/:id", authenticate, authorize(["admin"]), authorController.update);
router.delete("/:id", authenticate, authorize(["admin"]), authorController.remove);

export default router;
