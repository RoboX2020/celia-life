import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Bot, FileText } from "lucide-react";
import { Link, useLocation } from "wouter";

export function Header() {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getUserInitials = () => {
    if (!user) return "?";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserName = () => {
    if (!user) return "User";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.email) {
      return user.email;
    }
    return "User";
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {location !== "/chat" && <SidebarTrigger data-testid="button-sidebar-toggle" />}
        <h1 className="text-xl font-semibold" data-testid="heading-app-name">
          Celia
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        {location === "/chat" ? (
          <Link href="/">
            <Button variant="outline" size="sm" data-testid="button-nav-documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </Button>
          </Link>
        ) : (
          <Link href="/chat">
            <Button variant="outline" size="sm" data-testid="button-nav-chat">
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </Link>
        )}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || undefined} alt={getUserName()} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <span className="text-sm" data-testid="text-user-name">{getUserName()}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleLogout}
          data-testid="button-logout"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
