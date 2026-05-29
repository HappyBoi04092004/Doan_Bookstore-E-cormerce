import sharp from 'sharp';

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const JPEG_QUALITY = 85;

export class ImageProcessingService {
  /**
   * Pre-process image: resize to Full HD if needed, convert to JPEG, optimize
   * @param imageBuffer - Original image buffer
   * @returns Processed image buffer
   */
  static async processImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      console.log("[ImageProcessingService] Step 1: Starting image processing.");
      const metadata = await sharp(imageBuffer).metadata();
      console.log("[ImageProcessingService] Step 2: Original image metadata:", {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: imageBuffer.length,
      });
      
      let processedImage = sharp(imageBuffer);

      // Resize if dimensions exceed Full HD
      if (metadata.width && metadata.height) {
        if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
          console.log(`[ImageProcessingService] Step 3: Resizing image from ${metadata.width}x${metadata.height} to max ${MAX_WIDTH}x${MAX_HEIGHT}.`);
          processedImage = processedImage.resize(MAX_WIDTH, MAX_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true,
          });
        } else {
          console.log("[ImageProcessingService] Step 3: Image dimensions within limits, no resize needed.");
        }
      }

      // Convert to JPEG and optimize
      console.log(`[ImageProcessingService] Step 4: Converting to JPEG with quality ${JPEG_QUALITY}.`);
      const outputBuffer = await processedImage
        .jpeg({ quality: JPEG_QUALITY, progressive: true })
        .toBuffer();
      console.log("[ImageProcessingService] Step 5: Image processing complete. Output buffer size:", outputBuffer.length);

      return outputBuffer;
    } catch (error) {
      console.error("[ImageProcessingService] Error during image processing:", error);
      throw new Error(`Image processing failed: ${error}`);
    }
  }

  /**
   * Convert image buffer to base64 string for Gemini API
   * @param imageBuffer - Image buffer
   * @returns Base64 encoded string
   */
  static imageToBase64(imageBuffer: Buffer): string {
    return imageBuffer.toString('base64');
  }
}