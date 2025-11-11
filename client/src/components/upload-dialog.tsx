import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { DOCUMENT_TYPES, CLINICAL_TYPES, DOCUMENT_TYPE_LABELS, CLINICAL_TYPE_LABELS } from "@/lib/constants";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onSubmit: (metadata: {
    title: string;
    documentType: string;
    clinicalType: string;
    dateOfService: Date | null;
  }) => void;
}

export function UploadDialog({ open, onOpenChange, file, onSubmit }: UploadDialogProps) {
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [clinicalType, setClinicalType] = useState("");
  const [dateOfService, setDateOfService] = useState<Date | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !documentType || !clinicalType) {
      return;
    }

    onSubmit({
      title,
      documentType,
      clinicalType,
      dateOfService: dateOfService || null,
    });

    // Reset form
    setTitle("");
    setDocumentType("");
    setClinicalType("");
    setDateOfService(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="upload-dialog">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Medical Document</DialogTitle>
            <DialogDescription>
              {file && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{file.name}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" data-testid="label-document-title">
                Document Name *
              </Label>
              <Input
                id="title"
                data-testid="input-document-title"
                placeholder="e.g., Blood Test Results - January 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType" data-testid="label-document-type">
                Document Category *
              </Label>
              <Select value={documentType} onValueChange={setDocumentType} required>
                <SelectTrigger id="documentType" data-testid="select-document-type">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DOCUMENT_TYPES.LAB_REPORT} data-testid="option-lab-report">
                    {DOCUMENT_TYPE_LABELS.lab_report}
                  </SelectItem>
                  <SelectItem value={DOCUMENT_TYPES.MEDICAL_IMAGE} data-testid="option-medical-image">
                    {DOCUMENT_TYPE_LABELS.medical_image}
                  </SelectItem>
                  <SelectItem value={DOCUMENT_TYPES.DOCTOR_NOTE} data-testid="option-doctor-note">
                    {DOCUMENT_TYPE_LABELS.doctor_note}
                  </SelectItem>
                  <SelectItem value={DOCUMENT_TYPES.PRESCRIPTION} data-testid="option-prescription">
                    {DOCUMENT_TYPE_LABELS.prescription}
                  </SelectItem>
                  <SelectItem value={DOCUMENT_TYPES.OTHER} data-testid="option-other">
                    {DOCUMENT_TYPE_LABELS.other}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicalType" data-testid="label-clinical-type">
                Clinical Specialty *
              </Label>
              <Select value={clinicalType} onValueChange={setClinicalType} required>
                <SelectTrigger id="clinicalType" data-testid="select-clinical-type">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CLINICAL_TYPES.GENERAL} data-testid="option-general">
                    {CLINICAL_TYPE_LABELS.general_primary_care}
                  </SelectItem>
                  <SelectItem value={CLINICAL_TYPES.CARDIOLOGY} data-testid="option-cardiology">
                    {CLINICAL_TYPE_LABELS.cardiology}
                  </SelectItem>
                  <SelectItem value={CLINICAL_TYPES.ENDOCRINOLOGY} data-testid="option-endocrinology">
                    {CLINICAL_TYPE_LABELS.endocrinology}
                  </SelectItem>
                  <SelectItem value={CLINICAL_TYPES.NEUROLOGY} data-testid="option-neurology">
                    {CLINICAL_TYPE_LABELS.neurology}
                  </SelectItem>
                  <SelectItem value={CLINICAL_TYPES.DERMATOLOGY} data-testid="option-dermatology">
                    {CLINICAL_TYPE_LABELS.dermatology}
                  </SelectItem>
                  <SelectItem value={CLINICAL_TYPES.DENTISTRY} data-testid="option-dentistry">
                    {CLINICAL_TYPE_LABELS.dentistry}
                  </SelectItem>
                  <SelectItem value={CLINICAL_TYPES.GYNECOLOGY} data-testid="option-gynecology">
                    {CLINICAL_TYPE_LABELS.gynecology}
                  </SelectItem>
                  <SelectItem value={CLINICAL_TYPES.PSYCHIATRY} data-testid="option-psychiatry">
                    {CLINICAL_TYPE_LABELS.psychiatry}
                  </SelectItem>
                  <SelectItem value={CLINICAL_TYPES.OTHER} data-testid="option-other-clinical">
                    {CLINICAL_TYPE_LABELS.other_unclassified}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfService" data-testid="label-date-of-service">
                Date of Service (Optional)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dateOfService"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    data-testid="button-date-picker"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfService ? format(dateOfService, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateOfService}
                    onSelect={setDateOfService}
                    initialFocus
                    data-testid="calendar-date-of-service"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-upload"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title || !documentType || !clinicalType}
              data-testid="button-confirm-upload"
            >
              Upload Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
