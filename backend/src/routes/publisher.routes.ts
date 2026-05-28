import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { publisherController } from "../controllers/publisher.controller";

const router = Router();

router.get("/", publisherController.getAll);
router.post("/", authenticate, authorize(["admin"]), publisherController.create);
router.put("/:id", authenticate, authorize(["admin"]), publisherController.update);
router.delete("/:id", authenticate, authorize(["admin"]), publisherController.remove);

export default router;
