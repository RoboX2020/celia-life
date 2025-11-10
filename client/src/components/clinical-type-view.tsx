import { type Document } from "@shared/schema";
import { DocumentCard } from "@/components/document-card";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLINICAL_TYPE_LABELS } from "@/lib/constants";
import { Activity } from "lucide-react";

interface ClinicalTypeViewProps {
  documents: Document[];
  selectedClinicalType?: string;
}

export function ClinicalTypeView({ documents, selectedClinicalType }: ClinicalTypeViewProps) {
  return (
    <div className="space-y-6">
      {selectedClinicalType && selectedClinicalType !== 'all' && (
        <Card data-testid="clinical-summary-box">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              {CLINICAL_TYPE_LABELS[selectedClinicalType] || 'Clinical Area'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Showing all documents related to {CLINICAL_TYPE_LABELS[selectedClinicalType]?.toLowerCase() || 'this specialty'}.
              This includes lab reports, imaging, doctor notes, and prescriptions specific to this clinical area.
            </p>
            {documents.length > 0 && (
              <p className="text-sm font-medium mt-2">
                {documents.length} document{documents.length !== 1 ? 's' : ''} found
              </p>
            )}
          </CardContent>
        </Card>
      )}
      
      {documents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="clinical-type-view">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
