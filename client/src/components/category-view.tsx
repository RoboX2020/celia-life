import { type Document } from "@shared/schema";
import { DocumentCard } from "@/components/document-card";
import { EmptyState } from "@/components/empty-state";

interface CategoryViewProps {
  documents: Document[];
}

export function CategoryView({ documents }: CategoryViewProps) {
  if (documents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="category-view">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
