import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface Condition {
  name: string;
  description: string;
  severity: "low" | "medium" | "high";
  likelihood: string;
}

interface AnalysisData {
  conditions: Condition[];
  recommendations: string[];
  urgentSigns: string[];
  disclaimer: string;
}

interface AnalysisResultsProps {
  analysis: AnalysisData;
}

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case "high":
      return {
        className: "bg-destructive text-destructive-foreground",
        icon: AlertCircle,
        label: "High Priority",
      };
    case "medium":
      return {
        className: "bg-warning text-warning-foreground",
        icon: AlertTriangle,
        label: "Medium Priority",
      };
    default:
      return {
        className: "bg-success text-success-foreground",
        icon: CheckCircle2,
        label: "Low Priority",
      };
  }
};

export const AnalysisResults = ({ analysis }: AnalysisResultsProps) => {
  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm text-foreground/90">
          {analysis.disclaimer}
        </AlertDescription>
      </Alert>

      {/* Possible Conditions */}
      <Card className="p-6 shadow-[var(--shadow-medical)]">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Possible Conditions</h2>
        <div className="space-y-4">
          {analysis.conditions.map((condition, index) => {
            const config = getSeverityConfig(condition.severity);
            const Icon = config.icon;
            
            return (
              <div key={index} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <h3 className="font-semibold text-foreground">{condition.name}</h3>
                  </div>
                  <Badge className={config.className}>{config.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{condition.description}</p>
                <p className="text-xs text-muted-foreground italic">{condition.likelihood}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 shadow-[var(--shadow-medical)]">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Recommended Next Steps</h2>
        <ul className="space-y-2">
          {analysis.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-foreground">{rec}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Urgent Signs */}
      <Card className="p-6 border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">Seek Immediate Care If:</h2>
        </div>
        <ul className="space-y-2">
          {analysis.urgentSigns.map((sign, index) => (
            <li key={index} className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <span className="text-foreground">{sign}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
