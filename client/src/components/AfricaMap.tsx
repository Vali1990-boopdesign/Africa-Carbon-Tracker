import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Map } from "lucide-react";
import { motion } from "framer-motion";
import type { CountryData } from "@shared/schema";

interface AfricaMapProps {
  countryData?: CountryData[];
  isLoading: boolean;
  onCountryClick?: (country: string) => void;
}

export function AfricaMap({ countryData, isLoading, onCountryClick }: AfricaMapProps) {
  const handleResetFilter = () => {
    // Reset any map-specific filters
    console.log("Resetting map filter");
  };

  if (isLoading) {
    return (
      <Card className="glass-effect border-gray-700 h-96">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-dark-800/50 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-effect border-gray-700 h-96">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">Africa Overview</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetFilter}
              className="text-gray-400 hover:text-white"
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Placeholder for D3.js map implementation */}
          <div className="h-80 bg-dark-800/50 rounded-lg flex items-center justify-center border border-gray-700 relative overflow-hidden">
            {/* Background with African landscape aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-amber-500/5"></div>
            
            {/* Content */}
            <div className="relative text-center z-10">
              <motion.div 
                className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Map className="text-emerald-500" size={32} />
              </motion.div>
              <p className="text-gray-300 font-medium">Interactive Africa Map</p>
              <p className="text-gray-400 text-sm mt-1">D3.js implementation pending</p>
              
              {/* Show country data if available */}
              {countryData && countryData.length > 0 && (
                <div className="mt-4 space-y-2">
                  {countryData.slice(0, 3).map((country, index) => (
                    <motion.div
                      key={country.country}
                      className="text-xs text-gray-400 bg-dark-800/50 rounded px-2 py-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {country.country}: {country.totalCredits.toLocaleString()} credits
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-amber-500/30 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
