import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from "recharts";
import { TrendingUp, BarChart3, Axis3d } from "lucide-react";
import { motion } from "framer-motion";
import { TermTooltip } from "./TermTooltip";
import type { TimeSeriesData, Transaction } from "@shared/schema";

interface TimeSeriesChartProps {
  timeSeriesData?: TimeSeriesData[];
  sectorData?: SectorData[];
  topBuyers?: TopBuyerData[];
  transactions?: Transaction[];
  isLoading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface SectorData {
  sector: string;
  totalCredits: number;
  percentage: number;
  color: string;
}

interface TopBuyerData {
  brandName: string;
  sector: string;
  totalCredits: number;
  percentage: number;
  initials: string;
  color: string;
}

export function TimeSeriesChart({ timeSeriesData, sectorData, topBuyers, transactions, isLoading, activeTab, onTabChange }: TimeSeriesChartProps) {
  if (isLoading) {
    return (
      <Card className="glass-effect border-gray-700 min-h-[28rem]">
        <CardContent className="p-6">
          <div className="flex items-center mb-6 border-b border-gray-700">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-4 py-2 mr-4">
                <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="h-72 bg-dark-800/30 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for different chart types
  const trendData = timeSeriesData?.map(d => ({
    year: d.year,
    credits: d.credits,
    country: d.country
  })) || [];

  // Group by year for aggregated trends and sort chronologically (include 2024)
  const yearlyDataMap = trendData.reduce((acc, curr) => {
    if (curr.year >= 2010 && curr.year <= 2024) {
      acc[curr.year] = (acc[curr.year] || 0) + curr.credits;
    }
    return acc;
  }, {} as Record<number, number>);

  // Ensure all years from 2010 to 2024 are represented, even with 0 credits
  const yearlyData = [];
  for (let year = 2010; year <= 2024; year++) {
    yearlyData.push({
      year,
      credits: yearlyDataMap[year] || 0
    });
  }

  // Process transactions to get unique projects per year
  const projectsPerYear = transactions ? transactions.reduce((acc, transaction) => {
    if (!transaction.retirementYear || !transaction.projectName) return acc;
    
    const year = transaction.retirementYear;
    if (!acc[year]) {
      acc[year] = new Set();
    }
    acc[year].add(transaction.projectName);
    return acc;
  }, {} as Record<number, Set<string>>) : {};

  // Ensure all years from 2010 to 2024 are represented for projects
  const projectYearlyData = [];
  for (let year = 2010; year <= 2024; year++) {
    const projectSet = projectsPerYear[year];
    projectYearlyData.push({
      year,
      projects: projectSet ? projectSet.size : 0
    });
  }

  // Process transactions to get unique buyers per year
  const buyersPerYear = transactions ? transactions.reduce((acc, transaction) => {
    if (!transaction.retirementYear || !transaction.buyerBrandName) return acc;
    
    const year = transaction.retirementYear;
    if (!acc[year]) {
      acc[year] = new Set();
    }
    acc[year].add(transaction.buyerBrandName);
    return acc;
  }, {} as Record<number, Set<string>>) : {};

  // Ensure all years from 2010 to 2024 are represented for buyers
  const buyerYearlyData = [];
  for (let year = 2010; year <= 2024; year++) {
    const buyerSet = buyersPerYear[year];
    buyerYearlyData.push({
      year,
      buyers: buyerSet ? buyerSet.size : 0
    });
  }

  // Use all sector data for project types - no truncation
  const projectData = sectorData?.map(sector => ({
    type: sector.sector,
    credits: sector.totalCredits
  })) || [];

  // Use all top buyers data - no truncation  
  const buyerData = topBuyers?.map(buyer => ({
    name: buyer.brandName,
    totalCredits: buyer.totalCredits,
    transactions: Math.floor(buyer.totalCredits / 1000), // Estimate transactions
    yearsActive: buyer.percentage > 10 ? 3 : buyer.percentage > 5 ? 2 : 1 // Estimate years
  })) || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-xl backdrop-blur-sm">
          <p className="text-gray-900 dark:text-gray-100 text-sm font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              {`${entry.name}: ${entry.value?.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-effect border-gray-700 min-h-[28rem]">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-3 bg-dark-800/50 border border-gray-700">
              <TabsTrigger 
                value="trends" 
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
                title="Historical carbon credit retirement trends over time"
              >
                <TrendingUp className="mr-2" size={16} />
                <TermTooltip term="Trends" explanation="Year-over-year carbon credit retirement patterns showing market growth and adoption across African projects" />
              </TabsTrigger>
              <TabsTrigger 
                value="projects"
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
                title="Unique carbon credit projects per year"
              >
                <BarChart3 className="mr-2" size={16} />
                <TermTooltip term="Projects" explanation="Year-over-year count of unique carbon credit projects from which credits were retired, showing project diversity and market development over time" />
              </TabsTrigger>
              <TabsTrigger 
                value="buyers"
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
                title="Unique carbon credit buyers per year"
              >
                <Axis3d className="mr-2" size={16} />
                <TermTooltip term="Buyers" explanation="Annual count of unique organizations purchasing African carbon credits, indicating market participation growth and buyer diversity trends" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    label={{ value: 'Carbon Credits', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="credits" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="projects" className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectYearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => value.toString()}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => value.toString()}
                    label={{ value: 'Unique Projects', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="projects" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="buyers" className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buyerYearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => value.toString()}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    label={{ value: 'Year', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => value.toString()}
                    label={{ value: 'Unique Buyers', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="buyers" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#F59E0B", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}