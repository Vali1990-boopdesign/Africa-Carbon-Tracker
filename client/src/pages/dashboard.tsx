import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { DataNote } from "@/components/DataNote";
import { FiltersBar } from "@/components/FiltersBar";
import { MetricsCards } from "@/components/MetricsCards";
import { AfricaTreemap } from "@/components/AfricaTreemap";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { TopBuyers } from "@/components/TopBuyers";
import { SectorBreakdown } from "@/components/SectorBreakdown";
import { DataTable } from "@/components/DataTable";
import { KeyInsights } from "@/components/KeyInsights";
import { Footer } from "@/components/Footer";
import { CarbonChatbot } from "@/components/CarbonChatbot";
import { CarbonGlossary } from "@/components/CarbonGlossary";
import { BilateralAgreements } from "@/components/BilateralAgreements";

import { useDashboard } from "@/hooks/use-dashboard";
import { exportFilteredData } from "@/utils/csvExport";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { toast } = useToast();
  const {
    metrics,
    transactions,
    countryData,
    sectorData,
    timeSeriesData,
    topBuyers,
    filters,
    activeFilters,
    activeTab,
    updateFilter,
    clearFilters,
    removeFilter,
    setActiveTab,
    isLoading,
    metricsLoading,
    transactionsLoading,
  } = useDashboard();



  const handleDateRangeChange = (range: string) => {
    if (range === "all") {
      updateFilter("startYear", 0);
      updateFilter("endYear", 0);
    } else {
      const [startYear, endYear] = range.split("-").map(Number);
      if (endYear) {
        updateFilter("startYear", startYear);
        updateFilter("endYear", endYear);
      } else {
        // Handle single year case
        updateFilter("startYear", startYear);
        updateFilter("endYear", startYear);
      }
    }
  };

  // Get current date range for display
  const getCurrentDateRange = () => {
    if (filters.startYear === 0 && filters.endYear === 0) {
      return "all";
    } else if (filters.startYear === filters.endYear) {
      return filters.startYear.toString();
    } else {
      return `${filters.startYear}-${filters.endYear}`;
    }
  };

  const handleHeaderExport = () => {
    if (transactions) {
      exportFilteredData(transactions, filters);
      toast({
        title: "Export Success",
        description: "Data exported successfully as CSV",
      });
    }
  };

  const handleTableExport = (selectedIds: number[]) => {
    if (transactions) {
      const selectedTransactions = transactions.filter(t => selectedIds.includes(t.id));
      exportFilteredData(selectedTransactions, filters);
      toast({
        title: "Export Success",
        description: `Exported ${selectedTransactions.length} selected records`,
      });
    }
  };

  const handleCountryClick = (country: string) => {
    updateFilter("country", country);
  };

  const handleBuyerClick = (buyer: string) => {
    updateFilter("search", buyer);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Header */}
      <Header 
        dateRange={getCurrentDateRange()}
        onDateRangeChange={handleDateRangeChange}
        onExport={handleHeaderExport}
        isLoading={isLoading}
      />

      {/* Data Note */}


      {/* Filters Bar */}
      <div className="mb-8">
        <FiltersBar
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={updateFilter}
          onRemoveFilter={removeFilter}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Metrics Cards */}
      <MetricsCards
        metrics={metrics}
        isLoading={metricsLoading}
      />

      {/* Key Insights - moved below metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <KeyInsights
          isLoading={isLoading}
        />
      </div>

      {/* Main Visualization Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Top Row - Wide Time Series Chart */}
        <div className="mb-6">
          <TimeSeriesChart
            timeSeriesData={timeSeriesData}
            sectorData={sectorData}
            topBuyers={topBuyers}
            isLoading={isLoading}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Bottom Row - Two Column Layout with proper spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Africa Treemap */}
          <div className="lg:col-span-1">
            <AfricaTreemap
              data={countryData}
              isLoading={isLoading}
              onCountryClick={handleCountryClick}
            />
          </div>

          {/* Right Column - Top Buyers & Sector Breakdown */}
          <div className="lg:col-span-1 space-y-6">
            <TopBuyers
              topBuyers={topBuyers}
              isLoading={isLoading}
              onBuyerClick={handleBuyerClick}
            />

            <SectorBreakdown
              sectorData={sectorData}
              isLoading={isLoading}
            />
          </div>
        </div>
{/* Bilateral Agreements */}
          <BilateralAgreements />


      </div>



      {/* Detailed Data Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <DataTable
          transactions={transactions}
          isLoading={transactionsLoading}
          onExport={handleTableExport}
        />
      </div>

      {/* Footer */}
      <Footer />

      {/* AI Chatbot */}
      <CarbonChatbot />

      {/* Carbon Credit Glossary */}
      <CarbonGlossary />

      {/* Loading Overlay - Removed since using direct CSV export */}
      {false && (
        <motion.div 
          className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="glass-effect rounded-xl p-8 max-w-sm mx-4">
            <div className="text-center">
              <motion.div 
                className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <motion.div
                  className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">Exporting Data</h3>
              <p className="text-gray-400 text-sm mb-4">Processing carbon credit data...</p>
              <div className="w-full bg-dark-800 rounded-full h-2">
                <motion.div 
                  className="bg-emerald-500 h-2 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}