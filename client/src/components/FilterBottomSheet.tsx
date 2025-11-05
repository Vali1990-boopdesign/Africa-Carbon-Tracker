import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import type { DashboardFilters } from "@/hooks/use-dashboard";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DashboardFilters;
  activeFilters: Array<{
    key: keyof DashboardFilters;
    label: string;
    value: string;
  }>;
  onFilterChange: (key: keyof DashboardFilters, value: string | number) => void;
  onClearFilters: () => void;
}

export function FilterBottomSheet({
  isOpen,
  onClose,
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
}: FilterBottomSheetProps) {
  const [searchInputs, setSearchInputs] = useState({
    country: "",
    buyerCountry: "",
    sector: "",
    projectType: "",
    scope: "",
  });

  // Fetch all transactions to populate filter options
  const { data: allTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Extract unique values from authentic data
  const uniqueCountries = Array.from(
    new Set(allTransactions?.map((t) => t.country) || [])
  ).sort();

  const uniqueBuyerCountries = Array.from(
    new Set(allTransactions?.map((t) => t.buyerHQLocation) || [])
  ).sort();

  const uniqueSectors = Array.from(
    new Set(allTransactions?.map((t) => t.buyerSector) || [])
  ).sort();

  const uniqueProjectTypes = Array.from(
    new Set(allTransactions?.map((t) => t.type) || [])
  ).sort();

  const uniqueScopes = Array.from(
    new Set(allTransactions?.map((t) => t.scope) || [])
  ).sort();

  // Filter options based on search
  const filterOptions = (options: string[], searchTerm: string) => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const toggleFilter = (key: keyof DashboardFilters, value: string) => {
    // Pass the value directly to the hook's updateFilter, which handles the toggle logic
    onFilterChange(key, value);
  };

  const handleApply = () => {
    // Clear search inputs to prevent stale UI state
    setSearchInputs({
      country: "",
      buyerCountry: "",
      sector: "",
      projectType: "",
      scope: "",
    });
    onClose();
  };

  const handleClearAll = () => {
    onClearFilters();
    setSearchInputs({
      country: "",
      buyerCountry: "",
      sector: "",
      projectType: "",
      scope: "",
    });
  };

  // Prevent body scroll when sheet is open
  useBodyScrollLock(isOpen);

  // Close search dropdown when filter sheet opens
  useEffect(() => {
    if (isOpen) {
      // Blur any active input to close dropdowns
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.tagName === 'INPUT') {
        activeElement.blur();
      }
    }
  }, [isOpen]);

  const activeFilterCount = activeFilters.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-[90] lg:hidden"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-surface-container rounded-t-3xl shadow-2xl z-[100] h-[80vh] flex flex-col lg:hidden"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-12 h-1 bg-surface-container-high rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border shrink-0">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-emerald-500" />
                <div>
                  <h2 className="text-lg font-semibold text-on-surface">Filters</h2>
                  {activeFilterCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-on-surface"
                data-testid="button-close-filters"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="px-6 py-4 space-y-6 pb-6">
                  {/* Countries */}
                  <FilterSection
                    title="Countries"
                    searchValue={searchInputs.country}
                    onSearchChange={(value) =>
                      setSearchInputs({ ...searchInputs, country: value })
                    }
                    options={filterOptions(uniqueCountries, searchInputs.country)}
                    selectedValues={filters.country}
                    onToggle={(value) => toggleFilter("country", value)}
                    totalOptionsCount={uniqueCountries.length}
                  />

                  {/* Buyer Countries */}
                  <FilterSection
                    title="Buyer Countries"
                    searchValue={searchInputs.buyerCountry}
                    onSearchChange={(value) =>
                      setSearchInputs({ ...searchInputs, buyerCountry: value })
                    }
                    options={filterOptions(uniqueBuyerCountries, searchInputs.buyerCountry)}
                    selectedValues={filters.buyerCountry}
                    onToggle={(value) => toggleFilter("buyerCountry", value)}
                    totalOptionsCount={uniqueBuyerCountries.length}
                  />

                  {/* Sectors */}
                  <FilterSection
                    title="Sectors"
                    searchValue={searchInputs.sector}
                    onSearchChange={(value) =>
                      setSearchInputs({ ...searchInputs, sector: value })
                    }
                    options={filterOptions(uniqueSectors, searchInputs.sector)}
                    selectedValues={filters.sector}
                    onToggle={(value) => toggleFilter("sector", value)}
                    totalOptionsCount={uniqueSectors.length}
                  />

                  {/* Project Types */}
                  <FilterSection
                    title="Project Types"
                    searchValue={searchInputs.projectType}
                    onSearchChange={(value) =>
                      setSearchInputs({ ...searchInputs, projectType: value })
                    }
                    options={filterOptions(uniqueProjectTypes, searchInputs.projectType)}
                    selectedValues={filters.projectType}
                    onToggle={(value) => toggleFilter("projectType", value)}
                    totalOptionsCount={uniqueProjectTypes.length}
                  />

                  {/* Scopes */}
                  <FilterSection
                    title="Scopes"
                    searchValue={searchInputs.scope}
                    onSearchChange={(value) =>
                      setSearchInputs({ ...searchInputs, scope: value })
                    }
                    options={filterOptions(uniqueScopes, searchInputs.scope)}
                    selectedValues={filters.scope}
                    onToggle={(value) => toggleFilter("scope", value)}
                    totalOptionsCount={uniqueScopes.length}
                />
                </div>
              </ScrollArea>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 p-6 border-t border bg-surface-container/95 shrink-0">
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="flex-1"
                disabled={activeFilterCount === 0}
                data-testid="button-clear-filters"
              >
                Clear All
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                data-testid="button-apply-filters"
              >
                <Check className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Filter Section Component
interface FilterSectionProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  totalOptionsCount: number; // Total before filtering
}

function FilterSection({
  title,
  searchValue,
  onSearchChange,
  options,
  selectedValues,
  onToggle,
  totalOptionsCount,
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayLimit = 5;


  // When searching, show all filtered results
  // When not searching, apply the expand/collapse logic
  const displayedOptions = searchValue
    ? options
    : (isExpanded ? options : options.slice(0, displayLimit));

  const hasMore = !searchValue && options.length > displayLimit;
  const showSearchInput = totalOptionsCount > 5;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-on-surface-variant uppercase tracking-wide">
        {title}
      </h3>

      {/* Search Input - Always show if total options > 5 */}
      {showSearchInput && (
        <Input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-surface-container-high border text-on-surface placeholder-muted-foreground"
        />
      )}

      {/* No Results Message */}
      {searchValue && options.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No matching {title.toLowerCase()} found
        </p>
      )}

      {/* Options List */}
      <div className="space-y-2">
        {displayedOptions.map((option) => (
          <label
            key={`${title}-${option}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-high cursor-pointer transition-colors"
          >
            <Checkbox
              checked={selectedValues.includes(option)}
              onCheckedChange={() => onToggle(option)}
              className="border"
              data-testid={`checkbox-${title.toLowerCase()}-${option}`}
            />
            <span className="text-sm text-on-surface flex-1">{option}</span>
            {selectedValues.includes(option) && (
              <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-400">
                Selected
              </Badge>
            )}
          </label>
        ))}
      </div>

      {/* Show More/Less - Only when not searching */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-emerald-500 hover:text-emerald-400"
        >
          {isExpanded ? "Show Less" : `Show ${options.length - displayLimit} More`}
        </Button>
      )}
    </div>
  );
}

// Filter FAB Button Component
interface FilterFABProps {
  onClick: () => void;
  activeCount: number;
}

export function FilterFAB({ onClick, activeCount }: FilterFABProps) {
  return (
    <Button
      onClick={onClick}
      className="lg:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg z-40"
      size="icon"
      data-testid="button-filter-fab"
    >
      <div className="relative">
        <Filter className="h-5 w-5" />
        {activeCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            {activeCount}
          </Badge>
        )}
      </div>
    </Button>
  );
}