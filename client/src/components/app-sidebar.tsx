import { 
  FileText, FlaskConical, Image, Stethoscope, Pill, FolderOpen,
  Heart, Brain, Droplet, Activity, Smile, Users, Apple
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { VIEW_MODES, type ViewMode } from "@/lib/constants";

const documentTypeFilters = [
  { title: "All Documents", type: null, icon: FolderOpen },
  { title: "Lab Reports", type: "lab_report", icon: FlaskConical },
  { title: "Medical Images", type: "medical_image", icon: Image },
  { title: "Doctor Notes", type: "doctor_note", icon: Stethoscope },
  { title: "Prescriptions", type: "prescription", icon: Pill },
  { title: "Other", type: "other", icon: FileText },
];

const clinicalTypeFilters = [
  { title: "All Clinical Areas", type: null, icon: FolderOpen },
  { title: "General / Primary Care", type: "general_primary_care", icon: Activity },
  { title: "Cardiology", type: "cardiology", icon: Heart },
  { title: "Endocrinology", type: "endocrinology", icon: Droplet },
  { title: "Neurology", type: "neurology", icon: Brain },
  { title: "Dermatology", type: "dermatology", icon: Smile },
  { title: "Dentistry", type: "dentistry", icon: Apple },
  { title: "Gynecology / Obstetrics", type: "gynecology", icon: Users },
  { title: "Psychiatry / Mental Health", type: "psychiatry", icon: Stethoscope },
  { title: "Other / Unclassified", type: "other_unclassified", icon: FileText },
];

interface AppSidebarProps {
  viewMode: ViewMode;
}

export function AppSidebar({ viewMode }: AppSidebarProps) {
  const [location, setLocation] = useLocation();
  
  const getSearchParams = () => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    return {
      mode: params.get('mode'),
      type: params.get('type'),
      clinical: params.get('clinical'),
    };
  };
  
  const { type: currentType, clinical: currentClinical } = getSearchParams();
  
  const handleFilterClick = (filterType: string | null, paramName: 'type' | 'clinical') => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    params.set('mode', viewMode);
    
    if (filterType === null) {
      params.delete(paramName);
    } else {
      params.set(paramName, filterType);
    }
    
    setLocation(`/?${params.toString()}`);
  };

  if (viewMode === VIEW_MODES.BY_DATE) {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Timeline View</SidebarGroupLabel>
            <SidebarGroupContent>
              <p className="text-sm text-muted-foreground px-4 py-2">
                Documents grouped by visit date
              </p>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  if (viewMode === VIEW_MODES.BY_CLINICAL_TYPE) {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Clinical Areas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {clinicalTypeFilters.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleFilterClick(item.type, 'clinical')}
                      isActive={currentClinical === item.type || (!currentClinical && item.type === null)}
                      data-testid={`filter-clinical-${item.type || 'all'}`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Document Types</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {documentTypeFilters.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleFilterClick(item.type, 'type')}
                    isActive={currentType === item.type || (!currentType && item.type === null)}
                    data-testid={`filter-${item.type || 'all'}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
