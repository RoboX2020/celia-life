import { FlaskConical, Image, Stethoscope, Pill, FileText } from "lucide-react";

export const documentTypeConfig = {
  lab_report: {
    label: "Lab Report",
    icon: FlaskConical,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  medical_image: {
    label: "Medical Image",
    icon: Image,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  },
  doctor_note: {
    label: "Doctor Note",
    icon: Stethoscope,
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  prescription: {
    label: "Prescription",
    icon: Pill,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  },
  other: {
    label: "Other",
    icon: FileText,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  },
} as const;

export type DocumentType = keyof typeof documentTypeConfig;
