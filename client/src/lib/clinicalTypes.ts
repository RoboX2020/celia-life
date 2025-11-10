import { 
  Heart, 
  Brain, 
  Users, 
  Microscope,
  Activity,
  Baby,
  Smile,
  Stethoscope,
  HelpCircle
} from "lucide-react";

export const clinicalTypeConfig = {
  general_primary_care: {
    label: "General / Primary Care",
    icon: Stethoscope,
    color: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
  },
  cardiology: {
    label: "Cardiology",
    icon: Heart,
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  endocrinology: {
    label: "Endocrinology",
    icon: Activity,
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  neurology: {
    label: "Neurology",
    icon: Brain,
    color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  },
  dermatology: {
    label: "Dermatology",
    icon: Users,
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  },
  dentistry: {
    label: "Dentistry",
    icon: Smile,
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
  gynecology: {
    label: "Gynecology",
    icon: Baby,
    color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  },
  psychiatry: {
    label: "Psychiatry",
    icon: Microscope,
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
  other_unclassified: {
    label: "Other / Unclassified",
    icon: HelpCircle,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  },
} as const;

export type ClinicalType = keyof typeof clinicalTypeConfig;
