import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useState } from "react";
import { TermTooltip } from "./TermTooltip";
import type { Transaction } from "@shared/schema";

interface IntermediariesProps {
  transactions?: Transaction[];
  isLoading: boolean;
}

export function Intermediaries({ transactions, isLoading }: IntermediariesProps) {
  const [activeTab, setActiveTab] = useState("registries");

  if (isLoading) {
    return (
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Intermediaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-full"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between p-3 bg-gray-800 rounded">
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Intermediaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">No intermediary data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process registry data
  const registryData = transactions.reduce((acc, transaction) => {
    let registryName = "Other";
    
    if (transaction.registryId?.includes("VCS")) {
      registryName = "Verra Standard";
    } else if (transaction.registryId?.includes("GS")) {
      registryName = "Gold Standard";
    }

    if (!acc[registryName]) {
      acc[registryName] = {
        name: registryName,
        totalCredits: 0,
        transactionCount: 0
      };
    }

    acc[registryName].totalCredits += transaction.creditsRetired;
    acc[registryName].transactionCount += 1;

    return acc;
  }, {} as Record<string, { name: string; totalCredits: number; transactionCount: number }>);

  const registryArray = Object.values(registryData).sort((a, b) => b.totalCredits - a.totalCredits);

  // Process carbon marketplace data
  const marketplaceData = transactions
    .filter(transaction => transaction.buyerClassification === "Carbon marketplaces or exchanges")
    .reduce((acc, transaction) => {
      const buyerName = transaction.buyerBrandName;
      
      if (!acc[buyerName]) {
        acc[buyerName] = {
          name: buyerName,
          totalCredits: 0,
          transactionCount: 0
        };
      }

      acc[buyerName].totalCredits += transaction.creditsRetired;
      acc[buyerName].transactionCount += 1;

      return acc;
    }, {} as Record<string, { name: string; totalCredits: number; transactionCount: number }>);

  const marketplaceArray = Object.values(marketplaceData).sort((a, b) => b.totalCredits - a.totalCredits);

  const registryColors = {
    "Verra Standard": "#10B981",
    "Gold Standard": "#F59E0B",
    "Other": "#6B7280"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass-effect border-gray-700 bg-white/95 dark:bg-gray-900/95">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            <TermTooltip 
              term="Intermediaries" 
              explanation="Registry organizations and carbon marketplaces that facilitate carbon credit transactions, providing verification standards and trading platforms" 
            />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="registries">Registries</TabsTrigger>
              <TabsTrigger value="marketplaces">Marketplaces</TabsTrigger>
            </TabsList>

            <TabsContent value="registries" className="space-y-3">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Carbon Credit Registries
                </h3>
              </div>
              {registryArray.map((registry, index) => (
                <motion.div
                  key={registry.name}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: registryColors[registry.name as keyof typeof registryColors] || '#6B7280' }}
                    >
                      {registry.name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{registry.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{registry.transactionCount.toLocaleString()} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {registry.totalCredits.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">credits</p>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="marketplaces" className="space-y-3">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Top Carbon Marketplaces or Exchanges
                </h3>
              </div>
              {marketplaceArray.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No marketplace data available</p>
                </div>
              ) : (
                marketplaceArray.slice(0, 8).map((marketplace, index) => (
                  <motion.div
                    key={marketplace.name}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {marketplace.name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{marketplace.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{marketplace.transactionCount.toLocaleString()} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {marketplace.totalCredits.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">credits</p>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}