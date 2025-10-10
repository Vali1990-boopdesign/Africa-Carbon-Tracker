import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { TopBuyerData, SectorData } from "@shared/schema";
import { formatNumber } from "@/lib/formatNumber";

interface TopBuyersProps {
  topBuyers?: TopBuyerData[];
  sectorData?: SectorData[];
  isLoading: boolean;
  onBuyerClick?: (buyer: string) => void;
  onCountryClick?: (country: string) => void;
  onSectorClick?: (sector: string) => void;
  transactions?: any[];
}

export function TopBuyers({ topBuyers, sectorData, isLoading, onBuyerClick, onCountryClick, onSectorClick, transactions }: TopBuyersProps) {
  const [activeTab, setActiveTab] = useState("buyers");
  const [buyersShowCount, setBuyersShowCount] = useState(5);
  const [countriesShowCount, setCountriesShowCount] = useState(5);
  const [sectorsShowCount, setSectorsShowCount] = useState(5);

  if (isLoading) {
    return (
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Demand: Buyers & Classifications</CardTitle>
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
          <CardTitle className="text-lg font-semibold text-white">Demand: Buyers & Classifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">No buyer data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create country aggregation from transactions
  const getCountryData = () => {
    if (!transactions || !Array.isArray(transactions)) {
      return [];
    }

    const countryMap = new Map();
    transactions.forEach(transaction => {
      const country = transaction.buyerCountry || transaction.buyerHQLocation || 'Unknown';
      const region = transaction.buyerHQRegion || '';
      const credits = transaction.creditsRetired || 0;

      const key = `${country}|${region}`;

      if (countryMap.has(key)) {
        countryMap.get(key).credits += credits;
      } else {
        countryMap.set(key, { 
          country: country,
          region: region || 'Unknown Region',
          credits: credits 
        });
      }
    });

    const countryArray = Array.from(countryMap.values())
      .sort((a, b) => b.credits - a.credits);

    const totalCredits = countryArray.reduce((sum, item) => sum + item.credits, 0);

    return countryArray.map((country, index) => ({
      ...country,
      percentage: totalCredits > 0 ? (country.credits / totalCredits) * 100 : 0,
      color: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316'][index % 8]
    }));
  };

  const countryData = getCountryData();

  // Sort topBuyers and sectorData by total credits (highest to lowest)
  const sortedTopBuyers = topBuyers ? [...topBuyers].sort((a, b) => b.totalCredits - a.totalCredits) : [];
  const sortedSectorData = sectorData ? [...sectorData].sort((a, b) => b.totalCredits - a.totalCredits) : [];

  const renderItemRow = (item: any, index: number, onClick: any, type: 'buyer' | 'country' | 'sector') => {
    const initials = type === 'buyer' ? item.initials : 
                    type === 'country' ? item.country.split(' ').map((word: string) => word.charAt(0)).join('').slice(0, 2) :
                    item.sector.split(' ').map((word: string) => word.charAt(0)).join('').slice(0, 2);

    const name = type === 'buyer' ? item.brandName : 
                type === 'country' ? item.country : 
                item.sector;

    const subtitle = type === 'buyer' ? item.sector : 
                    type === 'country' ? item.region : 
                    'Buyer Sector';

    const credits = type === 'buyer' ? item.totalCredits : 
                   type === 'country' ? item.credits : 
                   item.totalCredits;

    const percentage = item.percentage;

    return (
      <motion.div
        key={name}
        className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors cursor-pointer group"
        onClick={() => onClick?.(name)}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: item.color }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
              {name}
            </p>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
        <div className="text-right flex items-center space-x-2">
          <div>
            <p className="text-sm font-medium text-emerald-400">
              {formatNumber(credits)}
            </p>
            <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
          </div>
          <ChevronRight size={14} className="text-gray-400 group-hover:text-emerald-400 transition-colors" />
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Demand: Buyers & Classifications</CardTitle>
        </CardHeader>

        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="buyers">Buyers</TabsTrigger>
              <TabsTrigger value="countries">Countries</TabsTrigger>
              <TabsTrigger value="sectors">Sectors</TabsTrigger>
            </TabsList>

            <TabsContent value="buyers" className="space-y-3">
              {sortedTopBuyers.slice(0, buyersShowCount).map((buyer, index) => 
                renderItemRow(buyer, index, onBuyerClick, 'buyer')
              )}
              {sortedTopBuyers.length > buyersShowCount && (
                <Button 
                  variant="outline" 
                  className="w-full mt-3 bg-dark-800 border-gray-700 text-gray-200 hover:bg-dark-700"
                  onClick={() => setBuyersShowCount(prev => prev + 5)}
                >
                  Load More
                </Button>
              )}
            </TabsContent>

            <TabsContent value="countries" className="space-y-3">
              {countryData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No country data available</p>
                </div>
              ) : (
                <>
                  {countryData.slice(0, countriesShowCount).map((country, index) => 
                    renderItemRow(country, index, onCountryClick, 'country')
                  )}
                  {countryData.length > countriesShowCount && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-3 bg-dark-800 border-gray-700 text-gray-200 hover:bg-dark-700"
                      onClick={() => setCountriesShowCount(prev => prev + 5)}
                    >
                      Load More
                    </Button>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="sectors" className="space-y-3">
              {!sortedSectorData || sortedSectorData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No sector data available</p>
                </div>
              ) : (
                <>
                  {sortedSectorData.slice(0, sectorsShowCount).map((sector, index) => 
                    renderItemRow(sector, index, onSectorClick, 'sector')
                  )}
                  {sortedSectorData.length > sectorsShowCount && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-3 bg-dark-800 border-gray-700 text-gray-200 hover:bg-dark-700"
                      onClick={() => setSectorsShowCount(prev => prev + 5)}
                    >
                      Load More
                    </Button>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}