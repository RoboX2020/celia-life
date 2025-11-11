import { Shield, Heart, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">Celia</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your AI-powered personal health record manager. Securely store, organize, and understand your medical documents.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>AI Medical Assistant</li>
              <li>Automatic Document Classification</li>
              <li>OCR Text Extraction</li>
              <li>PDF Report Generation</li>
              <li>Secure Cloud Storage</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Security & Privacy</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>End-to-end encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>HIPAA compliant infrastructure</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Your data stays private</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Celia. All rights reserved.</p>
          <p className="mt-2">
            For demonstration purposes only. Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
