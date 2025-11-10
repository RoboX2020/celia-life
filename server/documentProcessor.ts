import { format } from "date-fns";

interface ProcessFileMetadata {
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
}

interface ProcessedFileInfo {
  documentType: string;
  title: string;
  shortSummary: string;
  dateOfService: Date | null;
}

export function processUploadedFile(metadata: ProcessFileMetadata): ProcessedFileInfo {
  const { originalFileName, mimeType } = metadata;
  const lowerFileName = originalFileName.toLowerCase();
  
  let documentType = "other";
  
  // Rule-based document type classification with priority order
  // Check medical images first (for image files with specific keywords)
  if (mimeType.startsWith("image/")) {
    if (
      lowerFileName.includes("scan") ||
      lowerFileName.includes("mri") ||
      lowerFileName.includes("ct") ||
      lowerFileName.includes("xray") ||
      lowerFileName.includes("x-ray") ||
      lowerFileName.includes("ultrasound") ||
      lowerFileName.includes("imaging")
    ) {
      documentType = "medical_image";
    }
  }
  
  // Lab report detection (only if not already classified)
  else if (
    lowerFileName.includes("lab") ||
    lowerFileName.includes("result") ||
    lowerFileName.includes("test") ||
    lowerFileName.includes("blood") ||
    lowerFileName.includes("panel")
  ) {
    documentType = "lab_report";
  }
  
  // Prescription detection (only if not already classified)
  else if (
    lowerFileName.includes("rx") ||
    lowerFileName.includes("prescription") ||
    lowerFileName.includes("medication") ||
    lowerFileName.includes("pharmacy")
  ) {
    documentType = "prescription";
  }
  
  // Doctor note detection (only if not already classified)
  else if (
    lowerFileName.includes("note") ||
    lowerFileName.includes("visit") ||
    lowerFileName.includes("consult") ||
    lowerFileName.includes("appointment") ||
    lowerFileName.includes("chart")
  ) {
    documentType = "doctor_note";
  }
  
  // Generate title based on document type
  const today = format(new Date(), "MMM d, yyyy");
  let title: string;
  
  switch (documentType) {
    case "lab_report":
      title = `Lab Report (uploaded ${today})`;
      break;
    case "medical_image":
      title = `Imaging/Scan (uploaded ${today})`;
      break;
    case "prescription":
      title = `Prescription (uploaded ${today})`;
      break;
    case "doctor_note":
      title = `Doctor Note (uploaded ${today})`;
      break;
    default:
      title = `Document (uploaded ${today})`;
  }
  
  // Generate placeholder summary
  const shortSummary = "This is a placeholder summary for demo purposes. In the full version, AI will generate a real summary of the document content.";
  
  // Date of service - could extract from filename in the future
  const dateOfService = null;
  
  return {
    documentType,
    title,
    shortSummary,
    dateOfService,
  };
}
