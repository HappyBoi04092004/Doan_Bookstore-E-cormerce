import { Router } from 'express';
import multer from 'multer';
import { extractBookInfoFromImage } from '../controllers/gemini.controller';
import { validateImage } from '../middleware/imageValidation';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store image in memory

router.post(
  '/extract-from-image',
  upload.single('bookCover'), // 'bookCover' is the field name for the image file
  validateImage,
  extractBookInfoFromImage
);

export default router;