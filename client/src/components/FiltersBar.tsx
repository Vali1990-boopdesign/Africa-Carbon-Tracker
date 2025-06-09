import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DashboardFilters } from "@/hooks/use-dashboard";
import type { Transaction } from "@shared/schema";

interface FiltersBarProps {
  filters: DashboardFilters;
  activeFilters: Array<{ key: keyof DashboardFilters; label: string; value: string }>;
  onFilterChange: (key: keyof DashboardFilters, value: string | number) => void;
  onRemoveFilter: (key: keyof DashboardFilters) => void;
  onClearFilters: () => void;
}

export function FiltersBar({ 
  filters, 
  activeFilters, 
  onFilterChange, 
  onRemoveFilter, 
  onClearFilters 
}: FiltersBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch all transactions to populate filter options
  const { data: allTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Extract unique values from authentic data
  const uniqueCountries = Array.from(new Set(allTransactions?.map(t => t.country) || [])).sort();
  const uniqueSectors = Array.from(new Set(allTransactions?.map(t => t.buyerSector) || [])).sort();
  const uniqueProjectTypes = Array.from(new Set(allTransactions?.map(t => t.type) || [])).sort();

  // Generate search suggestions based on input
  useEffect(() => {
    if (searchValue.length > 0 && allTransactions) {
      const suggestions = new Set<string>();
      const searchLower = searchValue.toLowerCase();
      
      allTransactions.forEach(transaction => {
        // Search in buyer names
        if (transaction.buyerBrandName.toLowerCase().includes(searchLower)) {
          suggestions.add(transaction.buyerBrandName);
        }
        // Search in countries
        if (transaction.country.toLowerCase().includes(searchLower)) {
          suggestions.add(transaction.country);
        }
        // Search in project names
        if (transaction.projectName.toLowerCase().includes(searchLower)) {
          suggestions.add(transaction.projectName);
        }
        // Search in sectors
        if (transaction.buyerSector.toLowerCase().includes(searchLower)) {
          suggestions.add(transaction.buyerSector);
        }
      });
      
      setSearchSuggestions(Array.from(suggestions).slice(0, 8));
    } else {
      setSearchSuggestions([]);
    }
  }, [searchValue, allTransactions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onFilterChange("search", value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchValue(suggestion);
    onFilterChange("search", suggestion);
    setIsSearchFocused(false);
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-effect rounded-xl p-4 border border-border"
        style={{
          background: 'hsl(var(--card))',
          backdropFilter: 'blur(16px) saturate(180%)'
        }}>
        <div className="flex flex-wrap items-center gap-4">
          {/* Global Search */}
          <div className="flex-1 min-w-64" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search buyers, countries, or projects..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full bg-surface-container border-border pl-10 text-foreground placeholder-muted-foreground focus:border-primary body-medium"
              />
              
              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-surface-container border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                  >
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-surface-container-high text-foreground transition-colors border-b border-border last:border-b-0 body-medium"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Filter Dropdowns */}
          <div className="flex items-center space-x-3">
            <Select 
              value={filters.country || "all"} 
              onValueChange={(value) => onFilterChange("country", value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-40 bg-surface-container border-border text-foreground label-medium">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent className="bg-surface-container border-border">
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.sector || "all"} 
              onValueChange={(value) => onFilterChange("sector", value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-40 bg-surface-container border-border text-foreground label-medium">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent className="bg-surface-container border-border">
                <SelectItem value="all">All Sectors</SelectItem>
                {uniqueSectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.projectType || "all"} 
              onValueChange={(value) => onFilterChange("projectType", value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-48 bg-surface-container border-border text-foreground label-medium">
                <SelectValue placeholder="All Project Types" />
              </SelectTrigger>
              <SelectContent className="bg-surface-container border-border">
                <SelectItem value="all">All Project Types</SelectItem>
                {uniqueProjectTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
        
        {/* Active Filters Breadcrumb */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div 
              className="mt-3 flex items-center space-x-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span className="label-small text-muted-foreground">Active filters:</span>
              <div className="flex items-center space-x-2 flex-wrap">
                {activeFilters.map((filter, index) => (
                  <motion.div
                    key={filter.key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge 
                      variant="secondary" 
                      className="bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer label-small"
                      onClick={() => onRemoveFilter(filter.key)}
                    >
                      {filter.label}
                      <X className="ml-1" size={12} />
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
