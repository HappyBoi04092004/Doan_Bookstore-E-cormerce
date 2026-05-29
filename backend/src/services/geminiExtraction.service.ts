import { geminiModel } from '../config/gemini';
import { ImageProcessingService } from './imageProcessing.service';

export interface ExtractedBookInfo {
  title: string | null;
  author: string | null;
  publisher: string | null;
  price: number | null;
  description: string | null;
  category: string | null;
}

export class GeminiExtractionService {
  /**
   * Extract book information from image using Gemini API
   * @param imageBuffer - Image buffer (already validated and processed)
   * @returns Extracted book information
   */
  static async extractBookInfo(imageBuffer: Buffer): Promise<ExtractedBookInfo> {
    try {
      console.log("[GeminiExtractionService] Step 1: Starting Gemini extraction.");
      // Convert image to base64
      const base64Image = ImageProcessingService.imageToBase64(imageBuffer);
      console.log("[GeminiExtractionService] Step 2: Image converted to base64. Size:", base64Image.length);

      // Craft the prompt for Gemini
      const prompt = `
Analyze this book cover image and extract the following information in JSON format.

Extract these fields:
- title: The book's title (string)
- author: The author's name (string)
- publisher: The publisher's name (string)
- price: The price in VND (number only, no currency symbols or text)
- description: A brief description if visible on the cover (string)
- category: The book's category or genre (string)

Important rules:
1. If a field is not visible or unclear in the image, set it to null
2. For price, extract ONLY the numeric value (e.g., if you see "150.000đ" or "150,000 VND", return 150000)
3. For category, try to infer from the book cover design, title, or any visible genre indicators
4. Return ONLY valid JSON with no additional text or explanation
5. The book might be in Vietnamese or English - handle both languages
6. Common Vietnamese book categories: Văn học, Kinh tế, Kỹ năng sống, Thiếu nhi, Giáo khoa, Tâm lý, Lịch sử, etc.

Response format (JSON only):
{
  "title": "book title or null",
  "author": "author name or null",
  "publisher": "publisher name or null",
  "price": numeric_value_or_null,
  "description": "description or null",
  "category": "category or null"
}
`;

      // Call Gemini API with image
      const result = await geminiModel.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
      ]);

      console.log("[GeminiExtractionService] Step 3: Sending request to Gemini API.");
      const response = result.response;
      const text = response.text();
      console.log("[GeminiExtractionService] Step 4: Received raw Gemini response text:", text);

      // Parse JSON response
      const extractedData = this.parseGeminiResponse(text);
      console.log("[GeminiExtractionService] Step 5: Parsed extracted data:", extractedData);

      return extractedData;
    } catch (error) {
      console.error('[GeminiExtractionService] Error during Gemini extraction:', error);
      throw new Error(`Failed to extract book information: ${error}`);
    }
  }

  /**
   * Parse Gemini's response and extract JSON
   * @param responseText - Raw response from Gemini
   * @returns Parsed book information
   */
  private static parseGeminiResponse(responseText: string): ExtractedBookInfo {
    try {
      console.log("[GeminiExtractionService] Step 6: Starting to parse Gemini response.");
      // Remove markdown code blocks if present
      let jsonText = responseText.trim();
      console.log("[GeminiExtractionService] Step 7: Raw JSON text before parsing:", jsonText);
      
      // Remove ```json and ``` markers if present
      jsonText = jsonText.replace(/```json\s*/g, '');
      jsonText = jsonText.replace(/```\s*/g, '');
      jsonText = jsonText.trim();
      console.log("[GeminiExtractionService] Step 8: Cleaned JSON text:", jsonText);

      // Parse JSON
      const parsed = JSON.parse(jsonText);
      console.log("[GeminiExtractionService] Step 9: JSON parsed successfully:", parsed);

      // Validate and normalize the data
      const normalizedData = {
        title: parsed.title || null,
        author: parsed.author || null,
        publisher: parsed.publisher || null,
        price: parsed.price ? Number(parsed.price) : null,
        description: parsed.description || null,
        category: parsed.category || null,
      };
      console.log("[GeminiExtractionService] Step 10: Normalized extracted data:", normalizedData);
      return normalizedData;
    } catch (error) {
      console.error('[GeminiExtractionService] Error parsing Gemini response:', error);
      console.error('[GeminiExtractionService] Response text that caused error:', responseText);
      throw new Error('Failed to parse extracted data from Gemini response');
    }
  }
}
