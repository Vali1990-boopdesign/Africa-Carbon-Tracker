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
import { useDashboard } from "@/hooks/use-dashboard";
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

  const exportMutation = useMutation({
    mutationFn: async (data: { format: string; filters?: any; selectedIds?: number[] }) => {
      const response = await apiRequest("POST", "/api/export", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Export Success",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDateRangeChange = (startYear: number, endYear: number) => {
    updateFilter("startYear", startYear);
    updateFilter("endYear", endYear);
  };

  const handleExport = () => {
    exportMutation.mutate({
      format: "csv",
      filters,
    });
  };

  const handleTableExport = (selectedIds: number[]) => {
    exportMutation.mutate({
      format: "csv",
      selectedIds,
    });
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
        onDateRangeChange={handleDateRangeChange}
        onExport={handleExport}
      />

      {/* Data Note */}
      <DataNote />

      {/* Filters Bar */}
      <FiltersBar
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={updateFilter}
        onRemoveFilter={removeFilter}
        onClearFilters={clearFilters}
      />

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
        

      </div>

      {/* Detailed Data Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <DataTable
          transactions={transactions}
          isLoading={transactionsLoading}
          onExport={handleTableExport}
        />
      </div>

      {/* Loading Overlay */}
      {exportMutation.isPending && (
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
