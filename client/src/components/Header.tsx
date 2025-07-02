import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { TermTooltip } from "./TermTooltip";
import { ContactModal } from "./ContactModal";
// Using web-based CO2 icon instead of PNG import

interface HeaderProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  isLoading?: boolean;
}

export function Header({ dateRange, onDateRangeChange, isLoading }: HeaderProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-500/20 rounded-lg">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="text-emerald-400"
              >
                <path 
                  d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17C15.24 5.06 14.28 5 13.3 5C9.84 5 6.5 5.99 4.5 8L6 9.5C7.5 8 10.26 7 13.3 7C14.13 7 14.94 7.08 15.72 7.22L13 9.94L14.41 11.35L21 4.94V9H21Z" 
                  fill="currentColor"
                />
                <circle cx="8" cy="16" r="2" fill="currentColor"/>
                <circle cx="16" cy="16" r="2" fill="currentColor"/>
                <path d="M12 12C10.9 12 10 12.9 10 14C10 15.1 10.9 16 12 16C13.1 16 14 15.1 14 14C14 12.9 13.1 12 12 12Z" fill="currentColor"/>
              </svg>
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
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </motion.header>
  );
}