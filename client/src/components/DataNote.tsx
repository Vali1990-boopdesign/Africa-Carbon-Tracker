import { Info } from "lucide-react";

export function DataNote() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 pt-6">
      <div className="glass-effect rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-400 mb-1">Data Note:</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              This dashboard is based on data from the Berkeley Carbon Trading Project's Voluntary Registry Offsets Database (pre-2000s to 2024). The analysis focuses on carbon credit retirements of 10 credits or more, excluding micro-transactions. While "retirements" and "purchases" are used interchangeably for simplicity, not all retirements represent direct purchases — some are broker-led or linked to compliance programs, such as South Africa's carbon tax. Buyer data reflects enterprise-level initiators and is mapped to parent companies or headquarters for consistency. AI-assisted methods were used extensively to clean and categorize data; users are advised to interpret insights with appropriate caution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}