import { type Document } from "@shared/schema";
import { format, startOfDay, differenceInDays, isWithinInterval, subDays } from "date-fns";

export interface VisitGroup {
  dateRange: string;
  startDate: Date;
  endDate: Date;
  label: string;
  documents: Document[];
}

export function groupDocumentsByTimeline(documents: Document[]): VisitGroup[] {
  if (!documents || documents.length === 0) return [];

  const sortedDocs = [...documents].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const groups: VisitGroup[] = [];
  const GROUPING_WINDOW_DAYS = 7;

  for (const doc of sortedDocs) {
    const docDate = startOfDay(new Date(doc.createdAt));
    
    const existingGroup = groups.find(group => {
      const daysDiff = Math.abs(differenceInDays(docDate, group.startDate));
      return daysDiff <= GROUPING_WINDOW_DAYS;
    });

    if (existingGroup) {
      existingGroup.documents.push(doc);
      if (docDate < existingGroup.startDate) {
        existingGroup.startDate = docDate;
      }
      if (docDate > existingGroup.endDate) {
        existingGroup.endDate = docDate;
      }
      existingGroup.dateRange = formatDateRange(existingGroup.startDate, existingGroup.endDate);
    } else {
      groups.push({
        dateRange: format(docDate, 'MMM d, yyyy'),
        startDate: docDate,
        endDate: docDate,
        label: generateVisitLabel(doc),
        documents: [doc]
      });
    }
  }

  return groups;
}

function formatDateRange(start: Date, end: Date): string {
  if (startOfDay(start).getTime() === startOfDay(end).getTime()) {
    return format(start, 'MMM d, yyyy');
  }
  
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, 'd')}-${format(end, 'd MMM yyyy')}`;
  }
  
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
}

function generateVisitLabel(doc: Document): string {
  const labels: Record<string, string> = {
    lab_report: 'Lab work and diagnostics',
    medical_image: 'Imaging and scans',
    doctor_note: 'Medical consultation',
    prescription: 'Medication management',
    other: 'Medical documentation'
  };
  
  return labels[doc.documentType] || 'Medical visit';
}
