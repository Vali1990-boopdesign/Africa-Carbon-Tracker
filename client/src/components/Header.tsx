
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TermTooltip } from "./TermTooltip";
import { ContactModal } from "./ContactModal";
import lottie from "lottie-web";
import { defineElement } from "@lordicon/element";
import type { DashboardFilters } from "@/hooks/use-dashboard";
import type { Transaction } from "@shared/schema";

// Define lord-icon custom element
defineElement(lottie.loadAnimation);

interface HeaderProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  filters: DashboardFilters;
  activeFilters: Array<{
    key: keyof DashboardFilters;
    label: string;
    value: string;
  }>;
  onFilterChange: (key: keyof DashboardFilters, value: string | number) => void;
  onRemoveFilter: (key: keyof DashboardFilters) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export function Header({ 
  dateRange, 
  onDateRangeChange, 
  filters,
  activeFilters,
  onFilterChange,
  onRemoveFilter,
  onClearFilters,
  isLoading 
}: HeaderProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch all transactions to populate filter options
  const { data: allTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Extract unique values from authentic data
  const uniqueCountries = Array.from(
    new Set(allTransactions?.map((t) => t.country) || []),
  ).sort();
  const uniqueSectors = Array.from(
    new Set(allTransactions?.map((t) => t.buyerSector) || []),
  ).sort();
  const uniqueProjectTypes = Array.from(
    new Set(allTransactions?.map((t) => t.type) || []),
  ).sort();

  // Generate search suggestions based on input
  useEffect(() => {
    if (searchValue && searchValue.length > 0 && allTransactions) {
      const suggestions = new Set<string>();
      const searchLower = searchValue.toLowerCase();

      allTransactions.forEach((transaction) => {
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
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll behavior for header visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        // Always show header at top of page
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const dateRangeOptions = [
    { key: "all", label: "All Years" },
    { key: "2010-2012", label: "2010 - 2012" },
    { key: "2013-2015", label: "2013 - 2015" },
    { key: "2016-2018", label: "2016 - 2018" },
    { key: "2019-2021", label: "2019 - 2021" },
    { key: "2022-2024", label: "2022 - 2024" }
  ];

  const handleDateRangeChange = (value: string) => {
    onDateRangeChange(value);
  };

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
    <motion.header
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-divider"
      initial={{ y: -20, opacity: 0 }}
      animate={{ 
        y: isHeaderVisible ? 0 : -100, 
        opacity: isHeaderVisible ? 1 : 0 
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Section */}
        <div className="flex items-center justify-between h-16">
          {/* Left side - Title and Icon */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-center w-12 h-12">
              <lord-icon
                trigger="in"
                src="/wired-outline-2332-carbon-neutral-hover-pinch.json"
                style={{
                  width: "43px",
                  height: "43px"
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                <TermTooltip 
                  term="Africa Carbon Dashboard" 
                  explanation="Interactive analytics platform tracking voluntary carbon credit transactions across African nations, showing buyer behavior, project distribution, and market trends from 2010-2024" 
                />
              </h1>
              <p className="text-sm text-default-600">
                © The Catalyst Fund & FSD Africa
              </p>
            </div>
          </motion.div>

          {/* Right side - Controls */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {/* Date Range Selector */}
            <div className="bg-gray-800 rounded-lg px-3 py-2 h-10 flex items-center">
              <Select
                value={dateRange || "all"}
                onValueChange={(value: string) => {
                  handleDateRangeChange(value);
                }}
                defaultValue="all"
              >
                <SelectTrigger className="w-32 border-none bg-transparent text-white min-h-0 h-auto px-0">
                  <SelectValue placeholder="All Years">
                    {dateRangeOptions.find(option => option.key === (dateRange || "all"))?.label || "All Years"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact Us Button */}
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsContactModalOpen(true)}
              disabled={isLoading}
              className="h-10"
            >
              <MessageCircle size={16} className="mr-2" />
              Contact Us
            </Button>
          </motion.div>
        </div>

        {/* Filters Section */}
        <motion.div
          className="pb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="glass-effect rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Global Search */}
              <div className="flex-1 min-w-64" ref={searchRef}>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    type="text"
                    placeholder="Search buyers, countries, or projects..."
                    value={searchValue || ""}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full bg-gray-800 dark:bg-dark-800 border-gray-600 dark:border-gray-700 pl-10 text-gray-200 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 focus:border-emerald-500"
                  />

                  {/* Search Suggestions Dropdown */}
                  <AnimatePresence>
                    {isSearchFocused && searchSuggestions.length > 0 && (
                      <>
                        {/* Backdrop overlay */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/30 z-[9998]"
                          onClick={() => setIsSearchFocused(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg z-[99999] max-h-64 overflow-y-auto"
                          style={{
                            filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.4)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))",
                            backdropFilter: "blur(12px)",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                          }}
                        >
                          {searchSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 transition-all duration-200 border-b border-gray-100 dark:border-gray-600 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="flex items-center space-x-3">
                <Select
                  value={filters.country || "all"}
                  onValueChange={(value) =>
                    onFilterChange("country", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-40 bg-dark-800 border-gray-700 text-gray-200">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {uniqueCountries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.sector || "all"}
                  onValueChange={(value) =>
                    onFilterChange("sector", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-40 bg-dark-800 border-gray-700 text-gray-200">
                    <SelectValue placeholder="All Buyer Sectors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buyer Sectors</SelectItem>
                    {uniqueSectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.projectType || "all"}
                  onValueChange={(value) =>
                    onFilterChange("projectType", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-48 bg-dark-800 border-gray-700 text-gray-200">
                    <SelectValue placeholder="All Project Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Project Types</SelectItem>
                    {uniqueProjectTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClearFilters}
                  className="text-gray-400 hover:text-white"
                  title="Clear all filters"
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
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </motion.header>
  );
}
