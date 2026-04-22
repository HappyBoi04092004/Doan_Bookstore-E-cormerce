import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { getWishlist, toggleWishlist } from "../controllers/wishlist.controller";

const router = Router();

// Lấy danh sách yêu thích
router.get("/", authenticate, getWishlist);

// Toggle (thêm/xóa) một sách khỏi danh sách yêu thích
router.post("/:bookId", authenticate, toggleWishlist);

export default router;
