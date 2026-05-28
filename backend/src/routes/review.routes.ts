import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { reviewController } from "../controllers/review.controller";

const router = Router();

router.get("/book/:bookId", reviewController.getBookReviews);
router.get("/book/:bookId/can-review", authenticate, reviewController.canReview);
router.post("/book/:bookId", authenticate, reviewController.create);
router.get("/", authenticate, authorize(["admin"]), reviewController.getAll);
router.delete("/:id", authenticate, authorize(["admin"]), reviewController.remove);

export default router;
