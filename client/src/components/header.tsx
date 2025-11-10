import { SidebarTrigger } from "@/components/ui/sidebar";
import { User } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <h1 className="text-xl font-semibold" data-testid="heading-app-name">
          MedVault Demo
        </h1>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="w-4 h-4" />
        <span data-testid="text-patient-name">Demo Patient: Jane Doe</span>
      </div>
    </header>
  );
}
