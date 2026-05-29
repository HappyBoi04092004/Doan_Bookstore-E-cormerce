import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_WIDTH = 1920; // Full HD
const MAX_HEIGHT = 1080; // Full HD
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const validateImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({ 
      error: 'Invalid file type. Only JPEG and PNG are allowed.' 
    });
  }

  // Validate file size
  if (req.file.size > MAX_FILE_SIZE) {
    return res.status(400).json({ 
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.` 
    });
  }

  // Validate dimensions using sharp
  sharp(req.file.buffer)
    .metadata()
    .then((metadata) => {
      if (!metadata.width || !metadata.height) {
        return res.status(400).json({ error: 'Could not read image dimensions' });
      }

      if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
        return res.status(400).json({ 
          error: `Image dimensions exceed ${MAX_WIDTH}x${MAX_HEIGHT} limit.` 
        });
      }

      next();
    })
    .catch(() => {
      return res.status(400).json({ error: 'Invalid image file' });
    });
};