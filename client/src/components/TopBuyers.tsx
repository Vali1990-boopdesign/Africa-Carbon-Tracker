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
      <Card className="glass-effect border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-on-surface">Demand: Buyers & Classifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center justify-between p-3 bg-surface-container/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div>
                      <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-12"></div>
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
      <Card className="glass-effect border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-on-surface">Demand: Buyers & Classifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No buyer data available</p>
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
        className="flex items-center justify-between p-3 bg-surface-container/50 rounded-lg border hover:bg-surface-container transition-colors cursor-pointer group"
        onClick={() => onClick?.(name)}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface text-xs font-bold"
            style={{ backgroundColor: item.color }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
              {name}
            </p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="text-right flex items-center space-x-2">
          <div>
            <p className="text-sm font-medium text-primary">
              {formatNumber(credits)}
            </p>
            <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
          </div>
          <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
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
      <Card className="glass-effect border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-on-surface">Demand: Buyers & Classifications</CardTitle>
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
              <div className="flex gap-2">
                {sortedTopBuyers.length > buyersShowCount && (
                  <Button 
                    variant="outline" 
                    className="flex-1 mt-3 bg-surface-container border text-on-surface-variant hover:bg-surface-container-high"
                    onClick={() => setBuyersShowCount(prev => prev + 5)}
                  >
                    Load More
                  </Button>
                )}
                {buyersShowCount > 5 && (
                  <Button 
                    variant="outline" 
                    className="flex-1 mt-3 bg-surface-container border text-on-surface-variant hover:bg-surface-container-high"
                    onClick={() => setBuyersShowCount(5)}
                  >
                    Show Less
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="countries" className="space-y-3">
              {countryData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No country data available</p>
                </div>
              ) : (
                <>
                  {countryData.slice(0, countriesShowCount).map((country, index) => 
                    renderItemRow(country, index, onCountryClick, 'country')
                  )}
                  <div className="flex gap-2">
                    {countryData.length > countriesShowCount && (
                      <Button 
                        variant="outline" 
                        className="flex-1 mt-3 bg-surface-container border text-on-surface-variant hover:bg-surface-container-high"
                        onClick={() => setCountriesShowCount(prev => prev + 5)}
                      >
                        Load More
                      </Button>
                    )}
                    {countriesShowCount > 5 && (
                      <Button 
                        variant="outline" 
                        className="flex-1 mt-3 bg-surface-container border text-on-surface-variant hover:bg-surface-container-high"
                        onClick={() => setCountriesShowCount(5)}
                      >
                        Show Less
                      </Button>
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="sectors" className="space-y-3">
              {!sortedSectorData || sortedSectorData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No sector data available</p>
                </div>
              ) : (
                <>
                  {sortedSectorData.slice(0, sectorsShowCount).map((sector, index) => 
                    renderItemRow(sector, index, onSectorClick, 'sector')
                  )}
                  <div className="flex gap-2">
                    {sortedSectorData.length > sectorsShowCount && (
                      <Button 
                        variant="outline" 
                        className="flex-1 mt-3 bg-surface-container border text-on-surface-variant hover:bg-surface-container-high"
                        onClick={() => setSectorsShowCount(prev => prev + 5)}
                      >
                        Load More
                      </Button>
                    )}
                    {sectorsShowCount > 5 && (
                      <Button 
                        variant="outline" 
                        className="flex-1 mt-3 bg-surface-container border text-on-surface-variant hover:bg-surface-container-high"
                        onClick={() => setSectorsShowCount(5)}
                      >
                        Show Less
                      </Button>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}