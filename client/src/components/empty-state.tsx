import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "No documents in this category yet. Upload files above to get started." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" data-testid="empty-state">
      <FolderOpen className="w-24 h-24 text-muted-foreground/30 mb-6" />
      <p className="text-muted-foreground max-w-md">
        {message}
      </p>
    </div>
  );
}
