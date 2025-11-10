import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FolderOpen, Stethoscope } from "lucide-react";
import { VIEW_MODES, type ViewMode } from "@/lib/constants";

interface ViewModeSwitcherProps {
  value: ViewMode;
  onValueChange: (mode: ViewMode) => void;
}

export function ViewModeSwitcher({ value, onValueChange }: ViewModeSwitcherProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">View as:</span>
      <Tabs value={value} onValueChange={(v) => onValueChange(v as ViewMode)}>
        <TabsList>
          <TabsTrigger 
            value={VIEW_MODES.BY_DATE} 
            data-testid="view-mode-by-date"
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            By Date
          </TabsTrigger>
          <TabsTrigger 
            value={VIEW_MODES.BY_CATEGORY} 
            data-testid="view-mode-by-category"
            className="gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            By Category
          </TabsTrigger>
          <TabsTrigger 
            value={VIEW_MODES.BY_CLINICAL_TYPE} 
            data-testid="view-mode-by-clinical-type"
            className="gap-2"
          >
            <Stethoscope className="h-4 w-4" />
            By Clinical Type
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
