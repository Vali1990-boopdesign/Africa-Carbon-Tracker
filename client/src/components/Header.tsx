
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "./ThemeProvider";
import { Download, Moon, Sun, Leaf } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  onExport: () => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  isLoading?: boolean;
}

export function Header({ onExport, dateRange, onDateRangeChange, isLoading }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const dateRangeOptions = [
    { key: "2011-2023", label: "2011 - 2023" },
    { key: "2020-2023", label: "2020 - 2023" },
    { key: "2021-2023", label: "2021 - 2023" },
    { key: "2022-2023", label: "2022 - 2023" },
    { key: "2023", label: "2023" }
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
            <div className="flex items-center justify-center w-10 h-10 bg-success/20 rounded-lg">
              <Leaf className="w-6 h-6 text-success" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Africa Carbon Dashboard
              </h1>
              <p className="text-sm text-default-600">
                Berkeley Carbon Trading Project Data
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
                value={dateRange}
                onValueChange={(value: string) => {
                  handleDateRangeChange(value);
                }}
              >
                <SelectTrigger className="w-28 border-none bg-transparent text-white min-h-0 h-auto px-0">
                  <SelectValue />
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

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-10 w-10"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
