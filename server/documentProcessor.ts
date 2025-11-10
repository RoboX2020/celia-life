import { format } from "date-fns";

interface ProcessFileMetadata {
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
}

interface ProcessedFileInfo {
  documentType: string;
  clinicalType: string;
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
  
  // Rule-based clinical type classification
  let clinicalType = "other_unclassified";
  
  // Cardiology keywords
  if (
    lowerFileName.includes("heart") ||
    lowerFileName.includes("cardiac") ||
    lowerFileName.includes("cardio") ||
    lowerFileName.includes("ecg") ||
    lowerFileName.includes("ekg") ||
    lowerFileName.includes("echo") ||
    lowerFileName.includes("blood pressure") ||
    lowerFileName.includes("hypertension")
  ) {
    clinicalType = "cardiology";
  }
  
  // Dermatology keywords
  else if (
    lowerFileName.includes("skin") ||
    lowerFileName.includes("derma") ||
    lowerFileName.includes("rash") ||
    lowerFileName.includes("acne") ||
    lowerFileName.includes("mole") ||
    lowerFileName.includes("eczema") ||
    lowerFileName.includes("psoriasis")
  ) {
    clinicalType = "dermatology";
  }
  
  // Neurology keywords
  else if (
    lowerFileName.includes("neuro") ||
    lowerFileName.includes("brain") ||
    lowerFileName.includes("migraine") ||
    lowerFileName.includes("headache") ||
    lowerFileName.includes("seizure") ||
    lowerFileName.includes("stroke") ||
    lowerFileName.includes("nerve")
  ) {
    clinicalType = "neurology";
  }
  
  // Endocrinology keywords
  else if (
    lowerFileName.includes("diabetes") ||
    lowerFileName.includes("thyroid") ||
    lowerFileName.includes("hormone") ||
    lowerFileName.includes("endocrine") ||
    lowerFileName.includes("insulin") ||
    lowerFileName.includes("glucose")
  ) {
    clinicalType = "endocrinology";
  }
  
  // Dentistry/Stomatology keywords
  else if (
    lowerFileName.includes("dental") ||
    lowerFileName.includes("tooth") ||
    lowerFileName.includes("teeth") ||
    lowerFileName.includes("dentist") ||
    lowerFileName.includes("oral") ||
    lowerFileName.includes("cavity") ||
    lowerFileName.includes("gum")
  ) {
    clinicalType = "dentistry";
  }
  
  // Gynecology keywords
  else if (
    lowerFileName.includes("gyneco") ||
    lowerFileName.includes("obstetric") ||
    lowerFileName.includes("pregnancy") ||
    lowerFileName.includes("prenatal") ||
    lowerFileName.includes("pap smear") ||
    lowerFileName.includes("mammogram") ||
    lowerFileName.includes("ovarian") ||
    lowerFileName.includes("uterine")
  ) {
    clinicalType = "gynecology";
  }
  
  // Psychiatry/Mental Health keywords
  else if (
    lowerFileName.includes("mental") ||
    lowerFileName.includes("psych") ||
    lowerFileName.includes("anxiety") ||
    lowerFileName.includes("depression") ||
    lowerFileName.includes("therapy") ||
    lowerFileName.includes("counseling")
  ) {
    clinicalType = "psychiatry";
  }
  
  // General/Primary Care - default for common terms
  else if (
    lowerFileName.includes("physical") ||
    lowerFileName.includes("checkup") ||
    lowerFileName.includes("annual") ||
    lowerFileName.includes("wellness") ||
    lowerFileName.includes("primary care")
  ) {
    clinicalType = "general_primary_care";
  }
  
  // Generate placeholder summary
  const shortSummary = "This is a placeholder summary for demo purposes. In the full version, AI will generate a real summary of the document content.";
  
  // Date of service - could extract from filename in the future
  const dateOfService = null;
  
  return {
    documentType,
    clinicalType,
    title,
    shortSummary,
    dateOfService,
  };
}
