import { Request, Response } from "express";
import { addressService } from "../services/address.service";

/**
 * GET /api/address/search?q=<query>
 *
 * Returns up to 15 address suggestions matching the query string.
 * Searches ward, district, and province names (case-insensitive).
 */
export const searchAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string | undefined)?.trim();

    if (!q) {
      res.status(400).json({ message: "Query parameter 'q' is required" });
      return;
    }

    const limit = Math.min(Number(req.query.limit) || 15, 50);
    const results = await addressService.searchAddress(q, limit);

    res.json(results);
  } catch (error) {
    console.error("[searchAddress]", error);
    res.status(500).json({ message: "Server error" });
  }
};
