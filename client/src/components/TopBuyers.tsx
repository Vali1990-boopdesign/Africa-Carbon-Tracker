import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { TopBuyerData } from "@shared/schema";

interface TopBuyersProps {
  topBuyers?: TopBuyerData[];
  isLoading: boolean;
  onBuyerClick?: (buyer: string) => void;
  onCountryClick?: (country: string) => void;
  onSectorClick?: (sector: string) => void;
  transactions?: any[]; // Add transactions to get country and sector data
}

export function TopBuyers({ topBuyers, isLoading, onBuyerClick, onCountryClick, onSectorClick, transactions }: TopBuyersProps) {
  const [activeTab, setActiveTab] = useState("buyers");
  if (isLoading) {
    return (
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Demand: Top Buyers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-600 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-600 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-600 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-600 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topBuyers || topBuyers.length === 0) {
    return (
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Demand: Top Buyers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">No buyer data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Demand: Top Buyers</CardTitle>
        </CardHeader>
        
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="buyers">Buyers</TabsTrigger>
              <TabsTrigger value="countries">Buyer Countries</TabsTrigger>
              <TabsTrigger value="sectors">Buyer Sectors</TabsTrigger>
            </TabsList>

            <TabsContent value="buyers" className="space-y-3">
              {topBuyers.slice(0, 5).map((buyer, index) => (
                <motion.div
                  key={buyer.brandName}
                  className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors cursor-pointer group"
                  onClick={() => onBuyerClick?.(buyer.brandName)}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: `linear-gradient(135deg, ${buyer.color}, ${buyer.color}dd)` }}
                    >
                      {buyer.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                        {buyer.brandName}
                      </p>
                      <p className="text-xs text-gray-400">{buyer.sector}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <div>
                      <p className="text-sm font-medium text-emerald-400">
                        {(buyer.totalCredits || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">{buyer.percentage.toFixed(1)}%</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="countries" className="space-y-3">
              {(() => {
                // Create country aggregation from transactions if available
                if (!transactions || !Array.isArray(transactions)) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No country data available</p>
                    </div>
                  );
                }

                // Aggregate credits by buyer country
                const countryMap = new Map();
                transactions.forEach(transaction => {
                  const country = transaction.buyerCountry || 'Unknown';
                  const credits = transaction.creditsRetired || 0;
                  
                  if (countryMap.has(country)) {
                    countryMap.set(country, countryMap.get(country) + credits);
                  } else {
                    countryMap.set(country, credits);
                  }
                });

                // Convert to array and sort by credits
                const countryArray = Array.from(countryMap.entries())
                  .map(([country, credits]) => ({ country, credits }))
                  .sort((a, b) => b.credits - a.credits);

                const totalCredits = countryArray.reduce((sum, item) => sum + item.credits, 0);

                // Color mapping for different countries
                const countryColors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

                return countryArray.slice(0, 5).map((country, index) => {
                  const percentage = totalCredits > 0 ? (country.credits / totalCredits) * 100 : 0;
                  const color = countryColors[index % countryColors.length];
                  const initials = country.country.split(' ').map((word: string) => word.charAt(0)).join('').slice(0, 2);

                  return (
                    <motion.div
                      key={country.country}
                      className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors cursor-pointer group"
                      onClick={() => onCountryClick?.(country.country)}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: color }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{country.country}</p>
                          <p className="text-xs text-gray-400">Buyer Country</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-2">
                        <div>
                          <p className="text-sm font-medium text-emerald-400">
                            {country.credits.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </TabsContent>

            <TabsContent value="sectors" className="space-y-3">
              {(() => {
                // Create sector aggregation from transactions if available
                if (!transactions || !Array.isArray(transactions)) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No sector data available</p>
                    </div>
                  );
                }

                // Aggregate credits by buyer sector
                const sectorMap = new Map();
                transactions.forEach(transaction => {
                  const sector = transaction.buyerSector || 'Unknown';
                  const credits = transaction.creditsRetired || 0;
                  
                  if (sectorMap.has(sector)) {
                    sectorMap.set(sector, sectorMap.get(sector) + credits);
                  } else {
                    sectorMap.set(sector, credits);
                  }
                });

                // Convert to array and sort by credits
                const sectorArray = Array.from(sectorMap.entries())
                  .map(([sector, credits]) => ({ sector, credits }))
                  .sort((a, b) => b.credits - a.credits);

                const totalCredits = sectorArray.reduce((sum, item) => sum + item.credits, 0);

                // Color mapping for different sectors
                const sectorColors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

                return sectorArray.slice(0, 5).map((sector, index) => {
                  const percentage = totalCredits > 0 ? (sector.credits / totalCredits) * 100 : 0;
                  const color = sectorColors[index % sectorColors.length];
                  const initials = sector.sector.split(' ').map((word: string) => word.charAt(0)).join('').slice(0, 2);

                  return (
                    <motion.div
                      key={sector.sector}
                      className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors cursor-pointer group"
                      onClick={() => onSectorClick?.(sector.sector)}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: color }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{sector.sector}</p>
                          <p className="text-xs text-gray-400">Buyer Sector</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-2">
                        <div>
                          <p className="text-sm font-medium text-emerald-400">
                            {sector.credits.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}