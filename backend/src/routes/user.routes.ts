import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateMe
} from "../controllers/user.controller";

const router = Router();

// Profile updates for normal users
router.put("/me", authenticate, updateMe);

// Admin routes (CRUD for users)
router.get("/", authenticate, authorize(["admin"]), getUsers);
router.post("/", authenticate, authorize(["admin"]), createUser);
router.get("/:id", authenticate, authorize(["admin"]), getUserById);
router.put("/:id", authenticate, authorize(["admin"]), updateUser);
router.delete("/:id", authenticate, authorize(["admin"]), deleteUser);

export default router;
