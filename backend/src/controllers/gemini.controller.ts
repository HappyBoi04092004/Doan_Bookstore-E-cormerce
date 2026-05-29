import { Request, Response } from 'express';
import { ImageProcessingService } from '../services/imageProcessing.service';
import { GeminiExtractionService } from '../services/geminiExtraction.service';

export const extractBookInfoFromImage = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[GeminiController] Step 1: Request received at /api/gemini/extract-from-image');
    
    if (!req.file) {
      console.log('[GeminiController] Step 2: No file uploaded');
      res.status(400).json({ success: false, message: 'No image file provided.' });
      return;
    }

    console.log('[GeminiController] Step 2: File received:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    // The image is already validated by `validateImage` middleware
    // Process the image (resize, convert to JPEG)
    console.log('[GeminiController] Step 3: Starting image processing...');
    const processedImageBuffer = await ImageProcessingService.processImage(req.file.buffer);
    console.log('[GeminiController] Step 4: Image processed successfully. Size:', processedImageBuffer.length);

    // Extract information using Gemini
    console.log('[GeminiController] Step 5: Starting Gemini extraction...');
    const extractedData = await GeminiExtractionService.extractBookInfo(processedImageBuffer);
    console.log('[GeminiController] Step 6: Book information extracted:', extractedData);

    res.status(200).json({ success: true, data: extractedData, message: 'Book information extracted successfully.' });
  } catch (error: any) {
    console.error('[GeminiController] Error during extraction:', error);
    console.error('[GeminiController] Error details:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: 'Failed to extract book information.', error: error.message });
  }
};
