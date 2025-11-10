export const VIEW_MODES = {
  BY_DATE: 'by_date',
  BY_CATEGORY: 'by_category',
  BY_CLINICAL_TYPE: 'by_clinical_type'
} as const;

export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];

export const DOCUMENT_TYPES = {
  LAB_REPORT: 'lab_report',
  MEDICAL_IMAGE: 'medical_image',
  DOCTOR_NOTE: 'doctor_note',
  PRESCRIPTION: 'prescription',
  OTHER: 'other'
} as const;

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  lab_report: 'Lab Reports',
  medical_image: 'Medical Images',
  doctor_note: 'Doctor Notes',
  prescription: 'Prescriptions',
  other: 'Other'
};

export const CLINICAL_TYPES = {
  GENERAL: 'general_primary_care',
  CARDIOLOGY: 'cardiology',
  ENDOCRINOLOGY: 'endocrinology',
  NEUROLOGY: 'neurology',
  DERMATOLOGY: 'dermatology',
  DENTISTRY: 'dentistry',
  GYNECOLOGY: 'gynecology',
  PSYCHIATRY: 'psychiatry',
  OTHER: 'other_unclassified'
} as const;

export const CLINICAL_TYPE_LABELS: Record<string, string> = {
  general_primary_care: 'General / Primary Care',
  cardiology: 'Cardiology',
  endocrinology: 'Endocrinology',
  neurology: 'Neurology',
  dermatology: 'Dermatology',
  dentistry: 'Dentistry / Stomatology',
  gynecology: 'Gynecology / Obstetrics',
  psychiatry: 'Psychiatry / Mental Health',
  other_unclassified: 'Other / Unclassified'
};
