import { Router } from "express";
import { getBooks, getBookById, getAdminBooks, createBook, updateBook, deleteBook } from "../controllers/book.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

// Public routes
router.get("/", getBooks);
router.get("/admin/list", authenticate, authorize(["admin"]), getAdminBooks);
router.get("/:id", getBookById);

// Admin strictly guarded routes
router.post("/", authenticate, authorize(["admin"]), createBook);
router.put("/:id", authenticate, authorize(["admin"]), updateBook);
router.delete("/:id", authenticate, authorize(["admin"]), deleteBook);

export default router;
