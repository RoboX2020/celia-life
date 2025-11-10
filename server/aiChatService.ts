import { GoogleGenAI } from "@google/genai";
import type { Document } from "@shared/schema";

const genAI = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL || "",
  },
});

export interface ChatContext {
  documents: Document[];
  userQuery: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
  response: string;
  documentsReferenced?: number[];
}

export async function generateChatResponse(
  context: ChatContext
): Promise<ChatResponse> {
  try {
    const { documents, userQuery, conversationHistory = [] } = context;

    const documentContext = documents
      .map((doc, index) => {
        const dateStr = doc.dateOfService
          ? new Date(doc.dateOfService).toLocaleDateString()
          : new Date(doc.createdAt).toLocaleDateString();
        
        return `[Document ${index + 1}]
ID: ${doc.id}
Type: ${doc.documentType}
Title: ${doc.title}
Date: ${dateStr}
Source: ${doc.source || "Unknown"}
Summary: ${doc.shortSummary}
Extracted Text: ${doc.extractedText || "No text extracted"}
---`;
      })
      .join("\n\n");

    const systemPrompt = `You are a helpful medical AI assistant for MedVault, a personal health record management system. 

Your role:
- Analyze the user's medical documents and answer questions about their medical history
- Provide clear, accurate summaries of medical information
- Help users find specific records (surgeries, tests, medications, etc.)
- Translate medical information to English when needed
- Generate comprehensive medical history reports when requested
- Always cite which documents you're referencing by their ID numbers

Important guidelines:
- Be compassionate and professional
- Use clear, non-technical language when possible
- If you're unsure, say so - medical information requires accuracy
- Always reference specific documents when answering questions
- Organize information chronologically when relevant
- For date-specific queries, carefully check document dates

The user has uploaded ${documents.length} medical documents. Here they are:

${documentContext}

When answering:
1. Reference documents by their ID numbers (e.g., "According to Document 3...")
2. Use the extracted text for detailed information
3. Consider dates when answering temporal queries
4. If translating, note the original language detected
5. For comprehensive reports, organize by categories (surgeries, lab results, medications, etc.)`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: userQuery },
    ];

    const chatContent = messages.map((msg) => ({
      role: msg.role === "system" ? "user" : msg.role,
      parts: [{ text: msg.content }],
    }));

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: chatContent,
    });

    const response = result.text || "";

    const referencedDocs: number[] = [];
    documents.forEach((doc) => {
      if (response.toLowerCase().includes(doc.id.toString()) ||
          response.toLowerCase().includes(doc.title.toLowerCase())) {
        referencedDocs.push(doc.id);
      }
    });

    return {
      response,
      documentsReferenced: referencedDocs.length > 0 ? referencedDocs : undefined,
    };
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate AI response. Please try again.");
  }
}

export async function generateMedicalReport(documents: Document[]): Promise<string> {
  try {
    if (documents.length === 0) {
      return "No medical documents found to generate a report.";
    }

    const documentContext = documents
      .map((doc) => {
        const dateStr = doc.dateOfService
          ? new Date(doc.dateOfService).toLocaleDateString()
          : new Date(doc.createdAt).toLocaleDateString();
        
        return `Document: ${doc.title}
Type: ${doc.documentType}
Date: ${dateStr}
Summary: ${doc.shortSummary}
Extracted Content: ${doc.extractedText || "Not available"}
---`;
      })
      .join("\n\n");

    const prompt = `Generate a comprehensive medical history report based on the following documents.

Documents:
${documentContext}

Please create a well-structured medical history report that includes:

1. PATIENT SUMMARY
   - Overview of medical history based on available documents
   
2. CHRONOLOGICAL TIMELINE
   - Key medical events in chronological order
   
3. MEDICAL RECORDS BY CATEGORY
   - Lab Reports & Test Results
   - Medical Imaging & Scans  
   - Prescriptions & Medications
   - Doctor Notes & Consultations
   - Surgeries & Procedures (if any)
   
4. ONGOING CONDITIONS & CONCERNS
   - Any chronic conditions mentioned
   - Recurring issues or patterns
   
5. RECOMMENDATIONS
   - Suggested follow-up actions based on the records
   - Any gaps in documentation

Format the report professionally with clear headings and bullet points. Be thorough but concise.`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    return result.text || "Unable to generate report. Please try again.";
  } catch (error) {
    console.error("Error generating medical report:", error);
    throw new Error("Failed to generate medical report. Please try again.");
  }
}
