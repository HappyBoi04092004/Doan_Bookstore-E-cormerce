import { Request, Response, NextFunction } from "express";
import sharp from "sharp";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

function getUploadedImages(req: Request): Express.Multer.File[] {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === "object") {
    return Object.values(req.files).flat() as Express.Multer.File[];
  }
  return [];
}

export const validateImage = async (req: Request, res: Response, next: NextFunction) => {
  const files = getUploadedImages(req);

  if (files.length === 0) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (files.length > 2) {
    return res.status(400).json({ error: "Only up to 2 images are allowed." });
  }

  try {
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return res.status(400).json({
          error: "Invalid file type. Only JPEG and PNG are allowed.",
        });
      }

      if (file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
        });
      }

      const metadata = await sharp(file.buffer).metadata();
      if (!metadata.width || !metadata.height) {
        return res.status(400).json({ error: "Could not read image dimensions" });
      }

      if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
        return res.status(400).json({
          error: `Image dimensions exceed ${MAX_WIDTH}x${MAX_HEIGHT} limit.`,
        });
      }
    }

    next();
  } catch {
    return res.status(400).json({ error: "Invalid image file" });
  }
};
