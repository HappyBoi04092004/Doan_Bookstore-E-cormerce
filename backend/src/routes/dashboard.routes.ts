import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { dashboardController } from "../controllers/dashboard.controller";

const router = Router();

router.use(authenticate, authorize(["admin"]));
router.get("/overview", dashboardController.overview);

export default router;
