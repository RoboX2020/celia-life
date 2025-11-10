import { FileText, FlaskConical, Image, Stethoscope, Pill, FolderOpen } from "lucide-react";
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

const filterItems = [
  {
    title: "All Documents",
    type: null,
    icon: FolderOpen,
  },
  {
    title: "Lab Reports",
    type: "lab_report",
    icon: FlaskConical,
  },
  {
    title: "Medical Images",
    type: "medical_image",
    icon: Image,
  },
  {
    title: "Doctor Notes",
    type: "doctor_note",
    icon: Stethoscope,
  },
  {
    title: "Prescriptions",
    type: "prescription",
    icon: Pill,
  },
  {
    title: "Other",
    type: "other",
    icon: FileText,
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  
  const getSearchParams = () => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    return params.get('type');
  };
  
  const currentType = getSearchParams();
  
  const handleFilterClick = (type: string | null) => {
    if (type === null) {
      setLocation('/');
    } else {
      setLocation(`/?type=${type}`);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Filter by Type</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleFilterClick(item.type)}
                    isActive={currentType === item.type}
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
