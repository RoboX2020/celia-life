import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type Document } from "@shared/schema";
import { UploadZone } from "@/components/upload-zone";
import { DocumentCard } from "@/components/document-card";
import { EmptyState } from "@/components/empty-state";
import { DocumentSkeleton } from "@/components/document-skeleton";

export default function Dashboard() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const typeFilter = params.get('type');

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents", typeFilter],
    queryFn: async () => {
      const url = typeFilter 
        ? `/api/documents?documentType=${typeFilter}`
        : '/api/documents';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2" data-testid="heading-dashboard">
          Medical Vault
        </h1>
        <p className="text-muted-foreground">
          Upload and manage your medical documents securely
        </p>
      </div>

      <UploadZone />

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {typeFilter 
            ? `${typeFilter.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}s`
            : 'All Documents'}
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <DocumentSkeleton key={i} />
            ))}
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="document-list">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
