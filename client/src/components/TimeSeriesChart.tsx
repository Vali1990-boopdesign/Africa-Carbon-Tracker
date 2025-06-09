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
      <Card className="material-card border-border h-96">
        <CardContent className="p-6">
          <div className="flex items-center mb-6 border-b border-border">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-4 py-2 mr-4">
                <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="h-72 bg-muted/30 rounded-lg animate-pulse"></div>
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
        <div className="bg-surface-container border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground body-small">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-primary body-small font-medium">
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
      <Card className="material-card glass-effect border-border h-96"
        style={{
          background: 'hsl(var(--card))',
          backdropFilter: 'blur(16px) saturate(180%)'
        }}>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-3 bg-surface-container border border-border">
              <TabsTrigger 
                value="trends" 
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary label-medium"
              >
                <TrendingUp className="mr-2" size={16} />
                Trends
              </TabsTrigger>
              <TabsTrigger 
                value="projects"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary label-medium"
              >
                <BarChart3 className="mr-2" size={16} />
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="buyers"
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary label-medium"
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
            
            <TabsContent value="projects" className="h-96 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="type" 
                    stroke="#9CA3AF"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    label={{ value: 'Project Sectors', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    label={{ value: 'Carbon Credits', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
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
            
            <TabsContent value="buyers" className="h-96 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buyerData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    label={{ value: 'Buyer Companies', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    label={{ value: 'Carbon Credits', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
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
