import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";

// Using Replit's AI Integrations service (Gemini-compatible API without requiring own API key)
const genAI = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "",
  },
});

export async function extractTextFromDocument(
  filePath: string,
  mimeType: string
): Promise<string | null> {
  try {
    const supportedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp"
    ];
    
    const supportedDocTypes = [
      "application/pdf"
    ];

    const isImage = supportedImageTypes.includes(mimeType);
    const isPDF = supportedDocTypes.includes(mimeType);

    if (!isImage && !isPDF) {
      console.log(`OCR not supported for MIME type: ${mimeType}`);
      return null;
    }

    const fileBuffer = await fs.readFile(filePath);
    const base64Data = fileBuffer.toString("base64");

    const prompt = `Extract all text content from this medical document. 
    
Return the complete text exactly as it appears in the document, preserving:
- All headers, labels, and section titles
- All medical terminology, test names, and values
- All dates, numbers, and measurements
- All patient information and provider details
- The original structure and formatting as much as possible

If this is a medical image (X-ray, MRI, CT scan, etc.), describe what you see in the image in detail, including:
- Type of imaging study
- Body part or area being examined
- Any visible abnormalities or findings
- Technical details if visible (orientation markers, dates, etc.)

Return only the extracted text or image description, with no additional commentary.`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    // Based on Gemini blueprint, result.text directly contains the extracted text
    const extractedText = result.text;

    if (!extractedText || extractedText.trim().length === 0) {
      console.log(`No text extracted from document: ${filePath}`);
      return null;
    }

    console.log(`Successfully extracted ${extractedText.length} characters from ${path.basename(filePath)}`);
    return extractedText;
  } catch (error) {
    console.error("Error extracting text from document:", error);
    return null;
  }
}
