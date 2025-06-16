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
          <span className={`inline-flex items-center gap-1 cursor-help border-b border-dotted border-gray-400 dark:border-gray-500 ${className}`}>
            {term}
            <HelpCircle className="w-3 h-3 text-gray-400 dark:text-gray-500" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">{explanation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Carbon credit term definitions
export const carbonTerms = {
  "carbon credits": "Tradeable certificates representing one metric ton of CO2 equivalent emissions reduced, avoided, or removed from the atmosphere",
  "retirement": "The permanent cancellation of carbon credits, preventing their reuse and ensuring the environmental benefit is claimed only once",
  "registry": "Official platforms that track, verify, and record carbon credit transactions to prevent double counting and ensure transparency",
  "additionality": "The principle that carbon reduction projects must demonstrate they would not have happened without carbon credit financing",
  "voluntary carbon market": "A decentralized marketplace where companies and individuals voluntarily purchase carbon credits to offset their emissions",
  "verification": "Independent third-party assessment of carbon projects to ensure they meet standards and deliver claimed emission reductions",
  "baseline": "The reference scenario showing what emissions would have been without the carbon project intervention",
  "permanence": "The duration that carbon stored or emissions avoided will remain out of the atmosphere",
  "leakage": "Unintended increase in emissions outside a project's boundaries that undermines the project's climate benefits",
  "MRV": "Measurement, Reporting, and Verification - the systematic process of tracking and validating emission reductions",
  "scope": "Categories of greenhouse gas emissions: Scope 1 (direct), Scope 2 (indirect from energy), Scope 3 (value chain)",
  "co-benefits": "Additional positive social, economic, or environmental impacts beyond carbon reduction, such as biodiversity or community development",
  "vintage": "The year in which the emission reduction or removal occurred, affecting the credit's value and validity",
  "buffer pool": "A percentage of credits set aside to cover potential reversals or underperformance in nature-based projects",
  "double counting": "The improper claiming of the same emission reduction by multiple parties, which voluntary registries work to prevent"
};

export function getTermExplanation(term: string): string | undefined {
  const normalizedTerm = term.toLowerCase().trim();
  return carbonTerms[normalizedTerm as keyof typeof carbonTerms];
}