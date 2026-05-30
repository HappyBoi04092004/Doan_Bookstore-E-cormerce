import { Router } from 'express';
import multer from 'multer';
import { extractBookInfoFromImage } from '../controllers/gemini.controller';
import { validateImage } from '../middleware/imageValidation';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store image in memory

router.post(
  '/extract-from-image',
  upload.fields([
    { name: 'bookCovers', maxCount: 2 },
    { name: 'bookCover', maxCount: 1 },
  ]),
  validateImage,
  extractBookInfoFromImage
);

export default router;
