import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Lock, Shield, Upload, Bot, FileSearch, Languages } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold">Celia</h1>
          </div>
          <Button onClick={handleLogin} data-testid="button-login">
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Your Personal Medical AI Assistant
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Securely store all your medical records and chat with an AI assistant that understands your complete medical history. Get instant answers, comprehensive reports, and insights from your documents.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleLogin} data-testid="button-login-hero">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={handleLogin}>
                See How It Works
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI Medical Assistant</CardTitle>
                  <CardDescription>
                    Ask questions about your medical history. The AI analyzes all your documents to provide accurate, contextualized answers.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Easy Upload</CardTitle>
                  <CardDescription>
                    Drag and drop PDFs, images, and documents. Automatic OCR extracts text from all your medical files.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <FileSearch className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Smart Search</CardTitle>
                  <CardDescription>
                    Find specific records instantly. Search by date, type, or ask natural questions like "When was my last blood test?"
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Comprehensive Reports</CardTitle>
                  <CardDescription>
                    Generate complete medical history summaries. Export professional PDF reports for doctors or insurance.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Languages className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Multilingual Support</CardTitle>
                  <CardDescription>
                    Documents in any language? Our AI automatically translates medical records to English for easy understanding.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Secure & Private</CardTitle>
                  <CardDescription>
                    Your medical data is encrypted and completely private. Only you can access your documents and chat history.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="pt-12">
              <Card className="text-left">
                <CardHeader className="space-y-4">
                  <CardTitle className="text-2xl">How It Works</CardTitle>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Upload Your Medical Documents</h4>
                        <p className="text-sm text-muted-foreground">
                          Add lab reports, prescriptions, medical images, and doctor notes. We automatically extract and organize all information.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Chat with Your AI Assistant</h4>
                        <p className="text-sm text-muted-foreground">
                          Ask questions like "Did I ever have surgery?" or "What were my cholesterol levels in July 2024?" Get instant, accurate answers.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Generate Professional Reports</h4>
                        <p className="text-sm text-muted-foreground">
                          Create comprehensive medical history summaries and export them as PDFs to share with healthcare providers.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-2">
          <p className="font-semibold">Celia - Your AI-Powered Medical Document Manager</p>
          <p>Secure, Private, and Intelligent Healthcare Record Management</p>
        </div>
      </footer>
    </div>
  );
}
