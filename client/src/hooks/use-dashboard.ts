import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics, Transaction, CountryData, SectorData, TimeSeriesData, TopBuyerData, ScopeData } from "@shared/schema";

export interface DashboardFilters {
  country: string[];
  buyerCountry: string[];
  sector: string[];
  projectType: string[];
  scope: string[];
  startYear: number;
  endYear: number;
  search: string;
}

export function useDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    country: [],
    buyerCountry: [],
    sector: [],
    projectType: [],
    scope: [],
    startYear: 2010,
    endYear: 2024,
    search: "",
  });

  const [activeTab, setActiveTab] = useState<string>("trends");

  // Dashboard metrics query with filters
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else if (value !== undefined && value !== null && value !== "" && value !== 0) {
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
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else if (value !== undefined && value !== null && value !== "" && value !== 0) {
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

  // Country data query with filters
  const { data: countryData, isLoading: countryLoading } = useQuery<CountryData[]>({
    queryKey: ["/api/dashboard/countries", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else if (value !== undefined && value !== null && value !== "" && value !== 0) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/dashboard/countries?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
  });

  // Sector data query with filters
  const { data: sectorData, isLoading: sectorLoading } = useQuery<SectorData[]>({
    queryKey: ["/api/dashboard/sectors", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else if (value !== undefined && value !== null && value !== "" && value !== 0) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/dashboard/sectors?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
  });

  // Time series data query with filters
  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery<TimeSeriesData[]>({
    queryKey: ["/api/dashboard/timeseries", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else if (value !== undefined && value !== null && value !== "" && value !== 0) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/dashboard/timeseries?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
  });

  // Top buyers query with filters
  const { data: topBuyers, isLoading: topBuyersLoading } = useQuery<TopBuyerData[]>({
    queryKey: ["/api/dashboard/top-buyers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else if (value !== undefined && value !== null && value !== "" && value !== 0) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/dashboard/top-buyers?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
  });

  // Scope data query with filters
  const { data: scopeData, isLoading: scopeLoading } = useQuery<ScopeData[]>({
    queryKey: ["/api/dashboard/scopes", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(','));
          }
        } else if (value !== undefined && value !== null && value !== "" && value !== 0) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/dashboard/scopes?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
  });

  // Filter management
  const updateFilter = (key: keyof DashboardFilters, value: string | number) => {
    setFilters(prev => {
      // Handle array filters (country, buyerCountry, sector, projectType, scope) - toggle values
      if (key === 'country' || key === 'buyerCountry' || key === 'sector' || key === 'projectType' || key === 'scope') {
        const currentArray = prev[key] as string[];
        const stringValue = value.toString();
        
        // If empty string, clear the array (happens when "All" is selected)
        if (stringValue === '') {
          return { ...prev, [key]: [] };
        }
        
        // If value is already in array, remove it (toggle off) and deduplicate
        if (currentArray.includes(stringValue)) {
          return { ...prev, [key]: Array.from(new Set(currentArray.filter(item => item !== stringValue))) };
        } else {
          // Otherwise, add it (toggle on) and deduplicate to prevent duplicates from ever entering state
          return { ...prev, [key]: Array.from(new Set([...currentArray, stringValue])) };
        }
      }
      
      // Handle non-array filters
      return { ...prev, [key]: value };
    });
  };

  const clearFilters = () => {
    setFilters({
      country: [],
      buyerCountry: [],
      sector: [],
      projectType: [],
      scope: [],
      startYear: 2010,
      endYear: 2024,
      search: "",
    });
  };

  const removeFilter = (key: keyof DashboardFilters, value?: string) => {
    setFilters(prev => {
      // For array filters, remove specific value if provided
      if ((key === 'country' || key === 'buyerCountry' || key === 'sector' || key === 'projectType' || key === 'scope') && value) {
        const currentArray = prev[key] as string[];
        return { 
          ...prev, 
          [key]: currentArray.filter(item => item !== value)
        };
      }
      
      // Otherwise clear the entire filter
      return { 
        ...prev, 
        [key]: key === "startYear" ? 2010 : 
               key === "endYear" ? 2024 : 
               key === "country" || key === "buyerCountry" || key === "sector" || key === "projectType" || key === "scope" ? [] : 
               "" 
      };
    });
  };

  // Active filters computation
  const activeFilters = useMemo(() => {
    const active: Array<{ key: keyof DashboardFilters; label: string; value: string }> = [];
    
    // Handle array filters
    if (filters.country && filters.country.length > 0) {
      filters.country.forEach(country => {
        active.push({ key: "country", label: country, value: country });
      });
    }
    if (filters.buyerCountry && filters.buyerCountry.length > 0) {
      filters.buyerCountry.forEach(country => {
        active.push({ key: "buyerCountry", label: `${country} (Buyer)`, value: country });
      });
    }
    if (filters.sector && filters.sector.length > 0) {
      filters.sector.forEach(sector => {
        active.push({ key: "sector", label: `${sector} Sector`, value: sector });
      });
    }
    if (filters.projectType && filters.projectType.length > 0) {
      filters.projectType.forEach(type => {
        active.push({ key: "projectType", label: type, value: type });
      });
    }
    if (filters.scope && filters.scope.length > 0) {
      filters.scope.forEach(scope => {
        active.push({ key: "scope", label: `${scope} Scope`, value: scope });
      });
    }
    
    // Handle non-array filters
    if (filters.startYear !== 2010 || filters.endYear !== 2024) {
      active.push({ key: "startYear", label: `${filters.startYear}-${filters.endYear}`, value: `${filters.startYear}-${filters.endYear}` });
    }
    if (filters.search) active.push({ key: "search", label: `Search: ${filters.search}`, value: filters.search });
    return active;
  }, [filters]);

  // Loading states
  const isLoading = metricsLoading || transactionsLoading || countryLoading || sectorLoading || timeSeriesLoading || topBuyersLoading || scopeLoading;

  return {
    // Data
    metrics,
    transactions,
    countryData,
    sectorData,
    timeSeriesData,
    topBuyers,
    scopeData,

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