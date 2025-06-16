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
}

export function TopBuyers({ topBuyers, isLoading, onBuyerClick }: TopBuyersProps) {
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
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="buyers">Buyers</TabsTrigger>
              <TabsTrigger value="scope">Scope</TabsTrigger>
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

            <TabsContent value="scope" className="space-y-3">
              {[
                { scope: "Scope 1", description: "Direct Emissions", percentage: 45, color: "#3B82F6" },
                { scope: "Scope 2", description: "Indirect Energy", percentage: 30, color: "#10B981" },
                { scope: "Scope 3", description: "Value Chain", percentage: 25, color: "#8B5CF6" }
              ].map((scope, index) => {
                const totalCredits = topBuyers.reduce((sum, buyer) => sum + buyer.totalCredits, 0);
                const scopeCredits = Math.floor(totalCredits * (scope.percentage / 100));
                
                return (
                  <motion.div
                    key={scope.scope}
                    className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: scope.color }}
                      >
                        {scope.scope.split(' ')[1]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{scope.scope}</p>
                        <p className="text-xs text-gray-400">{scope.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-400">
                        {scopeCredits.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">{scope.percentage}%</p>
                    </div>
                  </motion.div>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}