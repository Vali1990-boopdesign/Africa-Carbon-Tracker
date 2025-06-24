import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { TermTooltip } from "./TermTooltip";
import { ExportModal } from "./ExportModal";
import { FiltersBar } from "./FiltersBar";
import type { DashboardFilters } from "@/hooks/use-dashboard";
// Using web-based CO2 icon instead of PNG import

interface HeaderProps {
  onExport: () => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  isLoading?: boolean;
  filters: DashboardFilters;
  activeFilters: Array<{
    key: keyof DashboardFilters;
    label: string;
    value: string;
  }>;
  onFilterChange: (key: keyof DashboardFilters, value: string | number) => void;
  onRemoveFilter: (key: keyof DashboardFilters) => void;
  onClearFilters: () => void;
}

export function Header({
  onExport,
  dateRange,
  onDateRangeChange,
  isLoading,
  filters,
  activeFilters,
  onFilterChange,
  onRemoveFilter,
  onClearFilters,
}: HeaderProps) {
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  return (
    <motion.header
      className="bg-dark-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 12c0 1.657 1.343 3 3 3s3-1.343 3-3-1.343-3-3-3-3 1.343-3 3zm6 0c0 1.657 1.343 3 3 3s3-1.343 3-3-1.343-3-3-3-3 1.343-3 3zm6 0c0 1.657 1.343 3 3 3s3-1.343 3-3-1.343-3-3-3-3 1.343-3 3z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center">
                  Africa Carbon Dashboard
                  <TermTooltip term="Carbon Credits">
                    <span className="ml-2 text-gray-400 hover:text-emerald-400 cursor-help transition-colors">
                      ⓘ
                    </span>
                  </TermTooltip>
                </h1>
                <p className="text-sm text-gray-400">
                  © The Catalyst Fund & FSD Africa
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Date Range Selector */}
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="w-32 bg-dark-800 border-gray-700 text-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
                <SelectItem value="2019">2019</SelectItem>
                <SelectItem value="2018">2018</SelectItem>
                <SelectItem value="2017">2017</SelectItem>
                <SelectItem value="2016">2016</SelectItem>
                <SelectItem value="2015">2015</SelectItem>
                <SelectItem value="2021-2024">2021-2024</SelectItem>
                <SelectItem value="2020-2023">2020-2023</SelectItem>
                <SelectItem value="2019-2022">2019-2022</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button
              onClick={handleExportClick}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Export</span>
            </Button>
          </div>
        </div>

        {/* Integrated Filters Bar */}
        <FiltersBar
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={onFilterChange}
          onRemoveFilter={onRemoveFilter}
          onClearFilters={onClearFilters}
        />
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={onExport}
        isLoading={isLoading}
      />
    </motion.header>
  );
}