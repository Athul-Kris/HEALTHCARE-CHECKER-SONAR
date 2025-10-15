import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Activity } from "lucide-react";
import { toast } from "sonner";

interface SymptomFormProps {
  onAnalysisComplete: (analysis: any) => void;
}

export const SymptomForm = ({ onAnalysisComplete }: SymptomFormProps) => {
  const [symptoms, setSymptoms] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-symptoms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symptoms: symptoms.trim() }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze symptoms");
      }

      const data = await response.json();
      onAnalysisComplete(data.analysis);
      toast.success("Analysis complete");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze symptoms");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-medical)]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Describe Your Symptoms</h2>
          </div>
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe your symptoms in detail... (e.g., headache for 2 days, fever of 101°F, fatigue)"
            className="min-h-[150px] resize-none border-input focus:ring-2 focus:ring-primary"
            disabled={isAnalyzing}
          />
        </div>
        <Button
          type="submit"
          disabled={isAnalyzing || !symptoms.trim()}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Symptoms"
          )}
        </Button>
      </form>
    </Card>
  );
};
