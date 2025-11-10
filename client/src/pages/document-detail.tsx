import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { type Document } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { documentTypeConfig, type DocumentType } from "@/lib/documentTypes";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DocumentDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: document, isLoading } = useQuery<Document>({
    queryKey: ["/api/documents", id],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${id}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/documents/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document deleted",
        description: "The document has been removed from your vault.",
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDownload = () => {
    window.open(`/api/documents/${id}/download`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setLocation('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vault
        </Button>
        
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-32" />
        </div>

        <Card className="p-6">
          <Skeleton className="h-48 w-full" />
        </Card>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-2">Document not found</h2>
        <Button onClick={() => setLocation('/')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vault
        </Button>
      </div>
    );
  }

  const typeConfig = documentTypeConfig[document.documentType as DocumentType];
  const Icon = typeConfig?.icon;

  return (
    <div className="space-y-6 max-w-3xl">
      <Button 
        variant="ghost" 
        onClick={() => setLocation('/')}
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Vault
      </Button>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              {Icon && <Icon className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
              <h1 className="text-3xl font-semibold" data-testid="heading-title">
                {document.title}
              </h1>
            </div>
            <Badge 
              className={`${typeConfig?.color} text-sm`}
              data-testid="badge-type"
            >
              {typeConfig?.label || document.documentType}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleDownload}
              data-testid="button-download"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" data-testid="button-delete">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete document?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the document from your vault.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteMutation.mutate()}
                    data-testid="button-confirm-delete"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Document Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-muted-foreground mb-1">Original File Name</dt>
            <dd className="font-medium break-all" data-testid="text-filename">
              {document.originalFileName}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm text-muted-foreground mb-1">Document Type</dt>
            <dd className="font-medium" data-testid="text-doc-type">
              {typeConfig?.label || document.documentType}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm text-muted-foreground mb-1">Date of Service</dt>
            <dd className="font-medium" data-testid="text-date-of-service">
              {document.dateOfService 
                ? format(new Date(document.dateOfService), "MMMM d, yyyy")
                : "Not specified"}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm text-muted-foreground mb-1">Source</dt>
            <dd className="font-medium" data-testid="text-source">
              {document.source || "Unknown"}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm text-muted-foreground mb-1">File Size</dt>
            <dd className="font-medium">
              {(document.sizeBytes / 1024 / 1024).toFixed(2)} MB
            </dd>
          </div>
          
          <div>
            <dt className="text-sm text-muted-foreground mb-1">Uploaded</dt>
            <dd className="font-medium" data-testid="text-uploaded">
              {format(new Date(document.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <p className="text-muted-foreground leading-relaxed" data-testid="text-summary">
          {document.shortSummary}
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Original File</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Download the original file to view its complete contents.
        </p>
        <Button onClick={handleDownload} data-testid="button-download-original">
          <Download className="w-4 h-4 mr-2" />
          Open / Download Original
        </Button>
      </Card>
    </div>
  );
}
