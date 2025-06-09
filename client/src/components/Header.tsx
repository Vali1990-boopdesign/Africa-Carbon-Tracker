import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
// import carbonIcon from "@assets/carbon-icon.png";

interface HeaderProps {
  onExport: () => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  isLoading?: boolean;
}

export function Header({ onExport, dateRange, onDateRangeChange, isLoading }: HeaderProps) {

  const dateRangeOptions = [
    { key: "all", label: "All Years" },
    { key: "2020-2022", label: "2020 - 2022" },
    { key: "2021-2022", label: "2021 - 2022" },
    { key: "2022", label: "2022" },
    { key: "2019-2022", label: "2019 - 2022" },
    { key: "2018-2022", label: "2018 - 2022" }
  ];

  const handleDateRangeChange = (value: string) => {
    onDateRangeChange(value);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-divider"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Title and Icon */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-500/20 rounded-lg p-2">
              <div className="w-full h-full bg-emerald-500 rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Africa Carbon Dashboard
              </h1>
              <p className="text-sm text-default-600">
                © The Catalyst Fund
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

            {/* Export Button */}
            <Button
              variant="default"
              size="sm"
              onClick={onExport}
              disabled={isLoading}
              className="h-10"
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}