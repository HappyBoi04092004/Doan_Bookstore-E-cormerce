import { geminiModel } from "../config/gemini";
import { ImageProcessingService } from "./imageProcessing.service";

export interface ExtractedBookInfo {
  title: string | null;
  author: string | null;
  publisher: string | null;
  isbn: string | null;
  publishYear: number | null;
  pageCount: number | null;
  language: string | null;
  size: string | null;
  format: string | null;
  price: number | null;
  description: string | null;
  category: string | null;
}

const EMPTY_BOOK_INFO: ExtractedBookInfo = {
  title: null,
  author: null,
  publisher: null,
  isbn: null,
  publishYear: null,
  pageCount: null,
  language: null,
  size: null,
  format: null,
  price: null,
  description: null,
  category: null,
};

export class GeminiExtractionService {
  static async extractBookInfo(imageBuffer: Buffer): Promise<ExtractedBookInfo> {
    return this.extractBookInfoFromImages([imageBuffer]);
  }

  static async extractBookInfoFromImages(imageBuffers: Buffer[]): Promise<ExtractedBookInfo> {
    try {
      const buffers = imageBuffers.slice(0, 2);
      if (buffers.length === 0) throw new Error("No image buffers provided");

      const ocrTexts: string[] = [];
      for (let index = 0; index < buffers.length; index += 1) {
        ocrTexts.push(await this.ocrImage(buffers[index], index + 1));
      }

      const combinedText = ocrTexts
        .map((text, index) => `Image ${index + 1} OCR:\n${text}`)
        .join("\n\n");

      const prompt = `
You are extracting structured data for a bookstore admin form.

Analyze the OCR text from the front cover and optional back cover. Return ONLY valid JSON.

Fields:
- title: book title
- author: author name
- publisher: publisher name
- isbn: ISBN code
- publishYear: publication year as a number
- pageCount: page count as a number
- language: book language
- size: physical size, for example "14 x 20.5 cm"
- format: cover/book format, for example "Paperback", "Hardcover", "Bìa mềm", "Bìa cứng"
- price: price in VND as number only
- description: short description if visible
- category: category or genre if inferable

Rules:
1. If a field is not visible or unclear, set it to null.
2. Prefer explicit text from OCR. Do not invent ISBN, page count, year, size, or format.
3. Normalize ISBN by preserving digits and hyphens when present.
4. Return numeric values for publishYear, pageCount, and price.
5. The book may be Vietnamese or English.

OCR text:
${combinedText}

Response format:
{
  "title": "book title or null",
  "author": "author name or null",
  "publisher": "publisher name or null",
  "isbn": "isbn or null",
  "publishYear": 2024,
  "pageCount": 320,
  "language": "language or null",
  "size": "size or null",
  "format": "format or null",
  "price": 150000,
  "description": "description or null",
  "category": "category or null"
}
`;

      const result = await geminiModel.generateContent([prompt]);
      return this.parseGeminiResponse(result.response.text());
    } catch (error) {
      console.error("[GeminiExtractionService] Error during Gemini extraction:", error);
      throw new Error(`Failed to extract book information: ${error}`);
    }
  }

  private static async ocrImage(imageBuffer: Buffer, imageNumber: number): Promise<string> {
    const base64Image = ImageProcessingService.imageToBase64(imageBuffer);
    const prompt = `
OCR this book image (${imageNumber}). Return all visible text as plain text.
Preserve line breaks when useful. Do not summarize and do not add explanation.
`;

    const result = await geminiModel.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ]);

    return result.response.text().trim();
  }

  private static parseGeminiResponse(responseText: string): ExtractedBookInfo {
    try {
      let jsonText = responseText.trim();
      jsonText = jsonText.replace(/```json\s*/g, "");
      jsonText = jsonText.replace(/```\s*/g, "");
      jsonText = jsonText.trim();

      const parsed = JSON.parse(jsonText);

      return {
        ...EMPTY_BOOK_INFO,
        title: parsed.title || null,
        author: parsed.author || null,
        publisher: parsed.publisher || null,
        isbn: parsed.isbn || null,
        publishYear: parsed.publishYear ? Number(parsed.publishYear) : null,
        pageCount: parsed.pageCount ? Number(parsed.pageCount) : null,
        language: parsed.language || null,
        size: parsed.size || null,
        format: parsed.format || null,
        price: parsed.price ? Number(parsed.price) : null,
        description: parsed.description || null,
        category: parsed.category || null,
      };
    } catch (error) {
      console.error("[GeminiExtractionService] Error parsing Gemini response:", error);
      console.error("[GeminiExtractionService] Response text that caused error:", responseText);
      throw new Error("Failed to parse extracted data from Gemini response");
    }
  }
}
