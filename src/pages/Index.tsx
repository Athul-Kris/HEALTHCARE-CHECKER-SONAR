import { useState } from "react";
import { SymptomForm } from "@/components/SymptomForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { Activity, Heart } from "lucide-react";

const Index = () => {
  const [analysis, setAnalysis] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <Heart className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Healthcare Symptom Checker
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get educational information about your symptoms and possible conditions. This tool provides guidance on next steps, but always consult with healthcare professionals for proper diagnosis.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <SymptomForm onAnalysisComplete={setAnalysis} />
          
          {analysis && <AnalysisResults analysis={analysis} />}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <p>For educational purposes only. Not a substitute for professional medical advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
