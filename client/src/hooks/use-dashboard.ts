import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics, Transaction, CountryData, SectorData, TimeSeriesData, TopBuyerData } from "@shared/schema";

export interface DashboardFilters {
  country: string;
  sector: string;
  projectType: string;
  startYear: number;
  endYear: number;
  search: string;
}

export function useDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    country: "",
    sector: "",
    projectType: "",
    startYear: 2011,
    endYear: 2023,
    search: "",
  });

  const [activeTab, setActiveTab] = useState<string>("trends");

  // Dashboard metrics query with filters
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "") {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/dashboard/metrics?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  // Transactions query with filters
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "") {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/transactions?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  // Country data query
  const { data: countryData, isLoading: countryLoading } = useQuery<CountryData[]>({
    queryKey: ["/api/dashboard/countries"],
  });

  // Sector data query
  const { data: sectorData, isLoading: sectorLoading } = useQuery<SectorData[]>({
    queryKey: ["/api/dashboard/sectors"],
  });

  // Time series data query
  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery<TimeSeriesData[]>({
    queryKey: ["/api/dashboard/timeseries"],
  });

  // Top buyers query
  const { data: topBuyers, isLoading: topBuyersLoading } = useQuery<TopBuyerData[]>({
    queryKey: ["/api/dashboard/top-buyers"],
  });

  // Filter management
  const updateFilter = (key: keyof DashboardFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      country: "",
      sector: "",
      projectType: "",
      startYear: 2011,
      endYear: 2023,
      search: "",
    });
  };

  const removeFilter = (key: keyof DashboardFilters) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: key === "startYear" ? 2011 : key === "endYear" ? 2023 : "" 
    }));
  };

  // Active filters computation
  const activeFilters = useMemo(() => {
    const active = [];
    if (filters.country) active.push({ key: "country", label: filters.country, value: filters.country });
    if (filters.sector) active.push({ key: "sector", label: `${filters.sector} Sector`, value: filters.sector });
    if (filters.projectType) active.push({ key: "projectType", label: filters.projectType, value: filters.projectType });
    if (filters.startYear !== 2011 || filters.endYear !== 2023) {
      active.push({ key: "dateRange", label: `${filters.startYear}-${filters.endYear}`, value: `${filters.startYear}-${filters.endYear}` });
    }
    if (filters.search) active.push({ key: "search", label: `Search: ${filters.search}`, value: filters.search });
    return active;
  }, [filters]);

  // Loading states
  const isLoading = metricsLoading || transactionsLoading || countryLoading || sectorLoading || timeSeriesLoading || topBuyersLoading;

  return {
    // Data
    metrics,
    transactions,
    countryData,
    sectorData,
    timeSeriesData,
    topBuyers,
    
    // State
    filters,
    activeFilters,
    activeTab,
    
    // Actions
    updateFilter,
    clearFilters,
    removeFilter,
    setActiveTab,
    
    // Loading
    isLoading,
    metricsLoading,
    transactionsLoading,
  };
}
