import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "./ThemeProvider";
import { Download, Moon, Sun, Leaf } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  onDateRangeChange: (startYear: number, endYear: number) => void;
  onExport: () => void;
}

export function Header({ onDateRangeChange, onExport }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [dateRange, setDateRange] = useState("2011-2023");

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    
    switch (value) {
      case "2011-2023":
        onDateRangeChange(2011, 2023);
        break;
      case "2020-2023":
        onDateRangeChange(2020, 2023);
        break;
      case "custom":
        // Handle custom range - could open a date picker
        break;
      default:
        break;
    }
  };

  return (
    <motion.header 
      className="glass-effect border-b border-gray-800 sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Africa Carbon Credits Analytics</h1>
                <p className="text-xs text-gray-400">Real-time carbon market insights</p>
              </div>
            </div>
          </motion.div>
          
          {/* Header Controls */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {/* Date Range Selector */}
            <div className="bg-dark-800 rounded-lg px-3 py-2">
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-32 border-none bg-transparent text-gray-200 px-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2011-2023">2011 - 2023</SelectItem>
                  <SelectItem value="2020-2023">2020 - 2023</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Export Button */}
            <Button 
              onClick={onExport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              <Download className="mr-2" size={16} />
              Export
            </Button>
            
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 bg-dark-800 hover:bg-dark-700 rounded-lg"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-gray-400" />
              ) : (
                <Moon className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
