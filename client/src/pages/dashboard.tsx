import { Header } from "@/components/Header";
import { DataNote } from "@/components/DataNote";
import { MetricsCards } from "@/components/MetricsCards";
import { AfricaTreemap } from "@/components/AfricaTreemap";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { TopBuyers } from "@/components/TopBuyers";

import { DataTable } from "@/components/DataTable";
import { KeyInsights } from "@/components/KeyInsights";
import { Footer } from "@/components/Footer";
import { CarbonGlossary } from "@/components/CarbonGlossary";
import { BilateralAgreements } from "@/components/BilateralAgreements";
import { Intermediaries } from "@/components/Intermediaries";
import { useDashboard } from "@/hooks/use-dashboard";
import { motion } from "framer-motion";

export default function Dashboard() {
  const {
    metrics,
    transactions,
    countryData,
    sectorData,
    timeSeriesData,
    topBuyers,
    scopeData,
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





  const handleCountryClick = (country: string) => {
    updateFilter("country", country);
  };

  const handleScopeClick = (scope: string) => {
    updateFilter("scope", scope);
  };

  const handleBuyerClick = (buyer: string) => {
    updateFilter("search", buyer);
  };

  const handleRegistryClick = (registry: string) => {
    // Map registry names to filter values
    if (registry === "Verra Standard") {
      updateFilter("search", "VCS");
    } else if (registry === "Gold Standard") {
      updateFilter("search", "GS");
    } else {
      updateFilter("search", registry);
    }
  };

  const handleSectorClick = (sector: string) => {
    updateFilter("sector", sector);
  };

  const handleBuyerCountryClick = (country: string) => {
    updateFilter("search", country);
  };

  const handleMarketplaceClick = (marketplace: string) => {
    updateFilter("search", marketplace);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      {/* Header */}
      <Header 
        dateRange={getCurrentDateRange()}
        onDateRangeChange={handleDateRangeChange}
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={updateFilter}
        onRemoveFilter={removeFilter}
        onClearFilters={clearFilters}
        isLoading={isLoading}
      />

      {/* Data Note */}


      {/* Metrics Cards */}
      <div className="mt-6">
        <MetricsCards
          metrics={metrics}
          isLoading={metricsLoading}
        />
      </div>

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
            transactions={transactions}
            isLoading={isLoading}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Bottom Row - Two Column Layout with proper spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Africa Treemap and Intermediaries */}
          <div className="lg:col-span-1 space-y-6">
            <AfricaTreemap
              data={countryData}
              scopeData={scopeData}
              isLoading={isLoading}
              onCountryClick={handleCountryClick}
              onScopeClick={handleScopeClick}
            />

            <Intermediaries
              transactions={transactions}
              isLoading={isLoading}
              onRegistryClick={handleRegistryClick}
              onMarketplaceClick={handleMarketplaceClick}
            />
          </div>

          {/* Right Column - Top Buyers */}
          <div className="lg:col-span-1 space-y-6">
            <TopBuyers
              topBuyers={topBuyers}
              sectorData={sectorData}
              isLoading={isLoading}
              onBuyerClick={handleBuyerClick}
              onCountryClick={handleBuyerCountryClick}
              onSectorClick={handleSectorClick}
              transactions={transactions}
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
        />
      </div>

      {/* Footer */}
      <Footer />

      {/* Carbon Credit Glossary */}
      <CarbonGlossary />
    </div>
  );
}