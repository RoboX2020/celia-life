import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { type Document } from "@shared/schema";
import { UploadZone } from "@/components/upload-zone";
import { DocumentSkeleton } from "@/components/document-skeleton";
import { ViewModeSwitcher } from "@/components/view-mode-switcher";
import { TimelineView } from "@/components/timeline-view";
import { CategoryView } from "@/components/category-view";
import { ClinicalTypeView } from "@/components/clinical-type-view";
import { VIEW_MODES, type ViewMode } from "@/lib/constants";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  
  const viewMode = (params.get('mode') as ViewMode) || VIEW_MODES.BY_CATEGORY;
  const typeFilter = params.get('type');
  const clinicalFilter = params.get('clinical');

  const buildQueryUrl = () => {
    const queryParams = new URLSearchParams();
    if (viewMode === VIEW_MODES.BY_CATEGORY && typeFilter) {
      queryParams.set('documentType', typeFilter);
    } else if (viewMode === VIEW_MODES.BY_CLINICAL_TYPE && clinicalFilter) {
      queryParams.set('clinicalType', clinicalFilter);
    }
    return queryParams.toString() ? `/api/documents?${queryParams.toString()}` : '/api/documents';
  };

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents", viewMode, typeFilter, clinicalFilter],
    queryFn: async () => {
      const url = buildQueryUrl();
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
  });

  const handleViewModeChange = (newMode: ViewMode) => {
    const newParams = new URLSearchParams();
    newParams.set('mode', newMode);
    setLocation(`/?${newParams.toString()}`);
  };

  const getViewTitle = () => {
    if (viewMode === VIEW_MODES.BY_DATE) {
      return 'Timeline View';
    } else if (viewMode === VIEW_MODES.BY_CLINICAL_TYPE) {
      if (clinicalFilter) {
        return clinicalFilter.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
      return 'All Clinical Areas';
    } else {
      if (typeFilter) {
        return typeFilter.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') + 's';
      }
      return 'All Documents';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2" data-testid="heading-dashboard">
          Your Medical Vault
        </h1>
        <p className="text-muted-foreground">
          Upload and manage your medical documents securely
        </p>
      </div>

      <UploadZone />

      <div className="space-y-6">
        <ViewModeSwitcher value={viewMode} onValueChange={handleViewModeChange} />
        
        <div>
          <h2 className="text-xl font-semibold mb-4">{getViewTitle()}</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <DocumentSkeleton key={i} />
              ))}
            </div>
          ) : documents ? (
            <>
              {viewMode === VIEW_MODES.BY_DATE && (
                <TimelineView documents={documents} />
              )}
              {viewMode === VIEW_MODES.BY_CATEGORY && (
                <CategoryView documents={documents} />
              )}
              {viewMode === VIEW_MODES.BY_CLINICAL_TYPE && (
                <ClinicalTypeView documents={documents} selectedClinicalType={clinicalFilter || 'all'} />
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
