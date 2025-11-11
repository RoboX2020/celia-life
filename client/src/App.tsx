import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import DocumentDetail from "@/pages/document-detail";
import Chat from "@/pages/chat";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function Router({ location }: { location: string }) {
  if (location === "/chat") {
    return <Chat />;
  }
  
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/documents/:id" component={DocumentDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedLayout({ children, showSidebar = true }: { children: React.ReactNode; showSidebar?: boolean }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  const isChatPage = location === "/chat";
  
  return (
    <AuthenticatedLayout showSidebar={!isChatPage}>
      <Router location={location} />
    </AuthenticatedLayout>
  );
}

export default App;
