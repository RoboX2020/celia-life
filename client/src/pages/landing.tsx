import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Lock, Shield, Upload } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold">MedVault</h1>
          </div>
          <Button onClick={handleLogin} data-testid="button-login">
            Log In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Secure Medical Document Management
              </h2>
              <p className="text-xl text-muted-foreground">
                Upload, organize, and access your medical documents securely in one place. 
                Keep track of lab reports, prescriptions, and medical images with ease.
              </p>
            </div>

            <div>
              <Button size="lg" onClick={handleLogin} data-testid="button-login-hero">
                Get Started
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 pt-12">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Easy Upload</CardTitle>
                  <CardDescription>
                    Drag and drop your medical documents. Supports PDFs, images, and various document formats.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Smart Organization</CardTitle>
                  <CardDescription>
                    Automatically categorize documents by type and clinical specialty for quick access.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Secure Storage</CardTitle>
                  <CardDescription>
                    Your documents are encrypted and stored securely. Only you can access your medical records.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>MedVault Demo - Secure Medical Document Management</p>
        </div>
      </footer>
    </div>
  );
}
