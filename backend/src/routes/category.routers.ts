import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller";

const router = Router();
// Public route to get all categories
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin routes for category management
router.post("/", authenticate, authorize(["admin"]), createCategory);
router.put("/:id", authenticate, authorize(["admin"]), updateCategory);
router.delete("/:id", authenticate, authorize(["admin"]), deleteCategory);


export default router;