import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "./ThemeProvider";
import { Download, Moon, Sun, Leaf } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
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
      className="bg-surface-container border-b border-border sticky top-0 z-50 backdrop-blur-xl"
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
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Leaf className="text-primary-foreground" size={20} />
              </div>
              <div>
                <h1 className="headline-small text-foreground">Africa Carbon Credits Analytics</h1>
                <p className="body-small text-muted-foreground">Real-time carbon market insights</p>
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
            <div className="bg-surface-container-high rounded-lg px-3 py-2 h-10 flex items-center border border-border">
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-28 border-none bg-transparent text-foreground px-0 h-auto label-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-container border-border text-foreground">
                  <SelectItem value="2011-2023" className="text-foreground hover:bg-surface-container-high">2011 - 2023</SelectItem>
                  <SelectItem value="2020-2023" className="text-foreground hover:bg-surface-container-high">2020 - 2023</SelectItem>
                  <SelectItem value="custom" className="text-foreground hover:bg-surface-container-high">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Export Button */}
            <Button 
              onClick={onExport}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 label-medium font-medium transition-colors h-10"
            >
              <Download className="mr-2" size={16} />
              Export
            </Button>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
