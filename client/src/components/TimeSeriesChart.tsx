import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from "recharts";
import { TrendingUp, BarChart3, Axis3d } from "lucide-react";
import { motion } from "framer-motion";
import type { TimeSeriesData } from "@shared/schema";

interface TimeSeriesChartProps {
  timeSeriesData?: TimeSeriesData[];
  sectorData?: SectorData[];
  topBuyers?: TopBuyerData[];
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

export function TimeSeriesChart({ timeSeriesData, sectorData, topBuyers, isLoading, activeTab, onTabChange }: TimeSeriesChartProps) {
  if (isLoading) {
    return (
      <Card className="glass-effect border-gray-700 h-96">
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

  // Group by year for aggregated trends and sort chronologically
  const yearlyData = trendData.reduce((acc, curr) => {
    const existing = acc.find(item => item.year === curr.year);
    if (existing) {
      existing.credits += curr.credits;
    } else {
      acc.push({ year: curr.year, credits: curr.credits });
    }
    return acc;
  }, [] as { year: number; credits: number }[]).sort((a, b) => a.year - b.year);

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
      <Card className="glass-effect border-gray-700 h-96">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-3 bg-dark-800/50 border border-gray-700">
              <TabsTrigger 
                value="trends" 
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
              >
                <TrendingUp className="mr-2" size={16} />
                Trends
              </TabsTrigger>
              <TabsTrigger 
                value="projects"
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
              >
                <BarChart3 className="mr-2" size={16} />
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="buyers"
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
              >
                <Axis3d className="mr-2" size={16} />
                Buyers
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="trends" className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9CA3AF"
                    fontSize={12}
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
                <BarChart data={projectData} margin={{ top: 20, right: 30, left: 60, bottom: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="type" 
                    stroke="#9CA3AF"
                    fontSize={9}
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    interval={0}
                    tick={{ fontSize: 9 }}
                    tickFormatter={(value) => {
                      // Truncate long sector names
                      return value.length > 15 ? value.substring(0, 15) + '...' : value;
                    }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={10}
                    width={50}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    label={{ value: 'Credits', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: '10px' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="credits" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="buyers" className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buyerData} margin={{ top: 20, right: 30, left: 60, bottom: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    fontSize={9}
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    interval={0}
                    tick={{ fontSize: 9 }}
                    tickFormatter={(value) => {
                      // Truncate long company names
                      return value.length > 12 ? value.substring(0, 12) + '...' : value;
                    }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={10}
                    width={50}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    label={{ value: 'Credits', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: '10px' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="totalCredits" 
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
