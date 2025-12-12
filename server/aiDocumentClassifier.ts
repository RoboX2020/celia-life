import { GoogleGenAI } from "@google/genai";
import { format } from "date-fns";

const genAI = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "",
  },
});

export interface AIClassificationResult {
  title: string;
  documentType: string;
  clinicalType: string;
  clinicalTypes: string[];
  dateOfService: Date | null;
  shortSummary: string;
}

export async function classifyDocumentWithAI(
  extractedText: string | null,
  originalFileName: string,
  mimeType: string
): Promise<AIClassificationResult> {
  if (!extractedText || extractedText.trim().length < 50) {
    return createFallbackClassification(originalFileName, mimeType);
  }

  try {
    const prompt = `You are a medical document classifier. Analyze the following medical document and extract metadata in JSON format.

Document text:
${extractedText.substring(0, 4000)}

Extract the following information:
1. **title**: A concise, descriptive title for this document (e.g., "Complete Blood Count - January 2024", "Cardiology Consultation Note", "Prescription for Lisinopril")
2. **documentType**: One of: "lab_report", "medical_image", "doctor_note", "prescription", or "other"
3. **clinicalTypes**: An array of ALL applicable clinical specialties from: "general_primary_care", "cardiology", "endocrinology", "neurology", "dermatology", "dentistry", "gynecology", "psychiatry", "other_unclassified". Include ALL relevant specialties if the document covers multiple medical areas.
4. **dateOfService**: The date when the service was provided (YYYY-MM-DD format, or null if not found)
5. **shortSummary**: A brief 1-2 sentence summary of the key findings or content

Respond ONLY with valid JSON in this exact format:
{
  "title": "extracted title here",
  "documentType": "lab_report",
  "clinicalTypes": ["cardiology", "endocrinology"],
  "dateOfService": "2024-01-15",
  "shortSummary": "summary here"
}`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI response did not contain valid JSON:", responseText);
      return createFallbackClassification(originalFileName, mimeType);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const validDocTypes = ["lab_report", "medical_image", "doctor_note", "prescription", "other"];
    const validClinicalTypes = [
      "general_primary_care",
      "cardiology",
      "endocrinology",
      "neurology",
      "dermatology",
      "dentistry",
      "gynecology",
      "psychiatry",
      "other_unclassified"
    ];

    const documentType = validDocTypes.includes(parsed.documentType)
      ? parsed.documentType
      : "other";

    let clinicalTypes = Array.isArray(parsed.clinicalTypes)
      ? parsed.clinicalTypes.filter((ct: string) => validClinicalTypes.includes(ct))
      : [];

    if (clinicalTypes.length === 0) {
      clinicalTypes = ["other_unclassified"];
    }

    const clinicalType = clinicalTypes[0];

    let dateOfService: Date | null = null;
    if (parsed.dateOfService) {
      const parsedDate = new Date(parsed.dateOfService);
      if (!isNaN(parsedDate.getTime())) {
        dateOfService = parsedDate;
      }
    }

    return {
      title: parsed.title || createFallbackTitle(documentType),
      documentType,
      clinicalType,
      clinicalTypes,
      dateOfService,
      shortSummary: parsed.shortSummary || "AI-generated summary not available.",
    };

  } catch (error) {
    console.error("AI classification failed:", error);
    return createFallbackClassification(originalFileName, mimeType);
  }
}

function createFallbackClassification(fileName: string, mimeType: string): AIClassificationResult {
  const lowerFileName = fileName.toLowerCase();
  let documentType = "other";
  let clinicalTypes = ["other_unclassified"];

  if (mimeType.startsWith("image/")) {
    if (
      lowerFileName.includes("scan") ||
      lowerFileName.includes("mri") ||
      lowerFileName.includes("ct") ||
      lowerFileName.includes("xray") ||
      lowerFileName.includes("x-ray") ||
      lowerFileName.includes("ultrasound")
    ) {
      documentType = "medical_image";
    }
  } else if (
    lowerFileName.includes("lab") ||
    lowerFileName.includes("result") ||
    lowerFileName.includes("test") ||
    lowerFileName.includes("blood") ||
    lowerFileName.includes("panel")
  ) {
    documentType = "lab_report";
  } else if (
    lowerFileName.includes("rx") ||
    lowerFileName.includes("prescription") ||
    lowerFileName.includes("medication")
  ) {
    documentType = "prescription";
  } else if (
    lowerFileName.includes("note") ||
    lowerFileName.includes("visit") ||
    lowerFileName.includes("consult")
  ) {
    documentType = "doctor_note";
  }

  if (lowerFileName.includes("heart") || lowerFileName.includes("cardiac")) {
    clinicalTypes = ["cardiology"];
  } else if (lowerFileName.includes("diabetes") || lowerFileName.includes("thyroid")) {
    clinicalTypes = ["endocrinology"];
  } else if (lowerFileName.includes("neuro") || lowerFileName.includes("brain")) {
    clinicalTypes = ["neurology"];
  } else if (lowerFileName.includes("skin") || lowerFileName.includes("derma")) {
    clinicalTypes = ["dermatology"];
  } else if (lowerFileName.includes("dental") || lowerFileName.includes("tooth")) {
    clinicalTypes = ["dentistry"];
  } else if (lowerFileName.includes("gyneco") || lowerFileName.includes("pregnancy")) {
    clinicalTypes = ["gynecology"];
  } else if (lowerFileName.includes("psych") || lowerFileName.includes("mental")) {
    clinicalTypes = ["psychiatry"];
  }

  const title = createFallbackTitle(documentType);

  return {
    title,
    documentType,
    clinicalType: clinicalTypes[0],
    clinicalTypes,
    dateOfService: null,
    shortSummary: "Document uploaded. AI classification not available.",
  };
}

function createFallbackTitle(documentType: string): string {
  const today = format(new Date(), "MMM d, yyyy");
  switch (documentType) {
    case "lab_report":
      return `Lab Report (uploaded ${today})`;
    case "medical_image":
      return `Medical Image (uploaded ${today})`;
    case "prescription":
      return `Prescription (uploaded ${today})`;
    case "doctor_note":
      return `Doctor Note (uploaded ${today})`;
    default:
      return `Medical Document (uploaded ${today})`;
  }
}
