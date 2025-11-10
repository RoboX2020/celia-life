import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileCheck, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "application/rtf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

interface UploadFile {
  file: File;
  status: "uploading" | "processing" | "ready" | "error";
  error?: string;
}

export function UploadZone() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      
      return response.json();
    },
    onSuccess: (data, file) => {
      setUploadFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { ...uf, status: "ready" as const }
            : uf
        )
      );
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been added to your vault.`,
      });
      
      setTimeout(() => {
        setUploadFiles(prev => prev.filter(uf => uf.file !== file));
      }, 2000);
    },
    onError: (error: Error, file) => {
      setUploadFiles(prev => 
        prev.map(uf => 
          uf.file === file 
            ? { ...uf, status: "error" as const, error: error.message }
            : uf
        )
      );
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        const error = errors[0];
        toast({
          title: "File rejected",
          description: `${file.name}: ${error.message}`,
          variant: "destructive",
        });
      });
    }

    acceptedFiles.forEach(file => {
      setUploadFiles(prev => [...prev, { file, status: "uploading" }]);
      uploadMutation.mutate(file);
    });
  }, [uploadMutation, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: MAX_SIZE,
  });

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed transition-colors cursor-pointer hover-elevate ${
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-border"
        }`}
        data-testid="upload-zone"
      >
        <div className="p-12 text-center">
          <input {...getInputProps()} data-testid="input-file" />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Upload your medical files</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drop PDFs, images, lab results, prescriptions, and doctor notes here
          </p>
          <Button type="button" variant="outline" data-testid="button-select-files">
            Select files
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Supported formats: PDF, TXT, RTF, DOC, DOCX, JPG, PNG (max 20MB)
          </p>
        </div>
      </Card>

      {uploadFiles.length > 0 && (
        <div className="space-y-2">
          {uploadFiles.map((uploadFile, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                {uploadFile.status === "uploading" && (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                )}
                {uploadFile.status === "processing" && (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                )}
                {uploadFile.status === "ready" && (
                  <FileCheck className="w-5 h-5 text-green-600" />
                )}
                {uploadFile.status === "error" && (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadFile.status === "uploading" && "Uploading..."}
                    {uploadFile.status === "processing" && "Processing..."}
                    {uploadFile.status === "ready" && "Ready"}
                    {uploadFile.status === "error" && (uploadFile.error || "Upload failed")}
                  </p>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
