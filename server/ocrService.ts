import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    // OpenAI Vision doesn't strictly support PDF via image_url, but if it's an image-based PDF converted or similar, 
    // the logic here assumes the caller handles supported formats.
    // For this migration, we'll keep the check but note that GPT-4o is primarily for images.
    // However, the original code treated PDF as supported. 
    // If the file is actually a PDF, we might need a different approach (like reading text),
    // but assuming for now the "OCR" intent implies images or we just pass it if it works (it won't seamlessly for raw PDF binary in image_url).
    // Let's stick to the image types for Vision to be safe, or allow PDF if we assume the model handles it roughly (it usually doesn't via this API).
    // Let's trust the mimetypes for now but strictly speaking Vision API wants images.

    if (!supportedImageTypes.includes(mimeType)) {
      console.log(`OCR via OpenAI Vision only supports images. Skipping: ${mimeType}`);
      return null;
    }

    const fileBuffer = await fs.readFile(filePath);
    const base64Data = fileBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
    });

    const extractedText = completion.choices[0].message.content;

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
