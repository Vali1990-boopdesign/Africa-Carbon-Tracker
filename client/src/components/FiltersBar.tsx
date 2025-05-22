import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DashboardFilters } from "@/hooks/use-dashboard";

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

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    // Debounce search
    setTimeout(() => {
      onFilterChange("search", value);
    }, 300);
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-effect rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Global Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search buyers, countries, or projects..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-dark-800 border-gray-700 pl-10 text-gray-200 placeholder-gray-400 focus:border-emerald-500"
              />
            </div>
          </div>
          
          {/* Filter Dropdowns */}
          <div className="flex items-center space-x-3">
            <Select 
              value={filters.country || "all"} 
              onValueChange={(value) => onFilterChange("country", value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-40 bg-dark-800 border-gray-700 text-gray-200">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="South Africa">South Africa</SelectItem>
                <SelectItem value="Kenya">Kenya</SelectItem>
                <SelectItem value="Nigeria">Nigeria</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.sector || "all"} 
              onValueChange={(value) => onFilterChange("sector", value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-40 bg-dark-800 border-gray-700 text-gray-200">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.projectType || "all"} 
              onValueChange={(value) => onFilterChange("projectType", value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-48 bg-dark-800 border-gray-700 text-gray-200">
                <SelectValue placeholder="All Project Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Project Types</SelectItem>
                <SelectItem value="Afforestation">Afforestation</SelectItem>
                <SelectItem value="Solar">Solar</SelectItem>
                <SelectItem value="Methane Capture">Methane Capture</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearFilters}
              className="text-gray-400 hover:text-white"
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
              <span className="text-xs text-gray-400">Active filters:</span>
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
                      className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 cursor-pointer"
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
