import { type Document } from "@shared/schema";
import { groupDocumentsByTimeline } from "@/lib/timeline-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useLocation } from "wouter";
import { DOCUMENT_TYPE_LABELS } from "@/lib/constants";

interface TimelineViewProps {
  documents: Document[];
}

export function TimelineView({ documents }: TimelineViewProps) {
  const [, setLocation] = useLocation();
  const visits = groupDocumentsByTimeline(documents);

  if (visits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No visits or episodes yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="timeline-view">
      {visits.map((visit, idx) => (
        <Card key={idx} data-testid={`visit-card-${idx}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{visit.dateRange}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{visit.label}</p>
              </div>
              <Badge variant="outline">{visit.documents.length} documents</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {visit.documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 rounded-md hover-elevate active-elevate-2"
                  data-testid={`timeline-document-${doc.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge variant="secondary" className="shrink-0">
                      {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                    </Badge>
                    <span className="font-medium truncate">{doc.title}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setLocation(`/documents/${doc.id}`)}
                    data-testid={`button-view-details-${doc.id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
