import { Router } from "express";
import { searchAddress } from "../controllers/address.controller";

const router = Router();

// GET /api/address/search?q=<query>  (public — no auth required)
router.get("/search", searchAddress);

export default router;
