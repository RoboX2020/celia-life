import { type Document } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";
import { documentTypeConfig, type DocumentType } from "@/lib/documentTypes";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const [, setLocation] = useLocation();
  const typeConfig = documentTypeConfig[document.documentType as DocumentType];
  const Icon = typeConfig?.icon;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/api/documents/${document.id}/download`, '_blank');
  };

  return (
    <Card 
      className="p-6 hover-elevate cursor-pointer transition-all"
      onClick={() => setLocation(`/documents/${document.id}`)}
      data-testid={`card-document-${document.id}`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {Icon && <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              <h3 className="font-semibold text-lg truncate" data-testid={`text-title-${document.id}`}>
                {document.title}
              </h3>
            </div>
            <Badge 
              className={`${typeConfig?.color} text-xs font-medium`}
              data-testid={`badge-type-${document.id}`}
            >
              {typeConfig?.label || document.documentType}
            </Badge>
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDownload}
            data-testid={`button-download-${document.id}`}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium" data-testid={`text-date-${document.id}`}>
              {document.dateOfService 
                ? format(new Date(document.dateOfService), "MMM d, yyyy")
                : format(new Date(document.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          
          {document.source && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Source:</span>
              <span className="font-medium truncate max-w-[150px]" data-testid={`text-source-${document.id}`}>
                {document.source}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Size:</span>
            <span className="font-medium">
              {(document.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            data-testid={`button-view-details-${document.id}`}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
