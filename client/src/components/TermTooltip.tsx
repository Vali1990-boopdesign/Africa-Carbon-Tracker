import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TermTooltipProps {
  term: string;
  explanation: string;
  className?: string;
}

export function TermTooltip({ term, explanation, className = "" }: TermTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 cursor-help ${className}`}>
            {term.charAt(0).toUpperCase() + term.slice(1)}
            <HelpCircle className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-[100]" side="top" align="center" sideOffset={8}>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-left p-2">
            {explanation}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Simplified carbon credit term definitions (5-6 words max)
export const carbonTerms = {
  "trends": "Market patterns over time",
  "projects": "Emission reduction initiatives",
  "buyers": "Companies purchasing carbon credits",
  "carbon credits": "Certificates for emission reductions",
  "retirement": "Permanent cancellation of credits",
  "registry": "Official tracking platforms",
  "additionality": "Projects requiring carbon financing",
  "voluntary carbon market": "Decentralized marketplace for credits",
  "verification": "Third-party project assessment",
  "baseline": "Reference emissions without project",
  "permanence": "Duration of carbon storage",
  "leakage": "Unintended emissions increases elsewhere",
  "MRV": "Measurement, reporting, and verification",
  "scope": "Emission categories (1, 2, 3)",
  "co-benefits": "Additional positive project impacts",
  "vintage": "Year of emission reduction",
  "buffer pool": "Credits reserved for reversals",
  "double counting": "Improper multiple claiming prevention"
};

export function getTermExplanation(term: string): string | undefined {
  const normalizedTerm = term.toLowerCase().trim();
  return carbonTerms[normalizedTerm as keyof typeof carbonTerms];
}