import { Request, Response } from "express";
import { ImageProcessingService } from "../services/imageProcessing.service";
import { GeminiExtractionService } from "../services/geminiExtraction.service";

function getUploadedImages(req: Request): Express.Multer.File[] {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === "object") {
    return Object.values(req.files).flat() as Express.Multer.File[];
  }
  return [];
}

export const extractBookInfoFromImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = getUploadedImages(req).slice(0, 2);

    if (files.length === 0) {
      res.status(400).json({ success: false, message: "No image file provided." });
      return;
    }

    const processedImageBuffers = await Promise.all(
      files.map((file) => ImageProcessingService.processImage(file.buffer))
    );

    const extractedData = await GeminiExtractionService.extractBookInfoFromImages(processedImageBuffers);

    res.status(200).json({
      success: true,
      data: extractedData,
      message: "Book information extracted successfully.",
    });
  } catch (error: any) {
    console.error("[GeminiController] Error during extraction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to extract book information.",
      error: error.message,
    });
  }
};
