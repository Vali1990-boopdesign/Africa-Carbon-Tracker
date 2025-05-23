import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from "recharts";
import { TrendingUp, BarChart3, Axis3d } from "lucide-react";
import { motion } from "framer-motion";
import type { TimeSeriesData } from "@shared/schema";

interface TimeSeriesChartProps {
  timeSeriesData?: TimeSeriesData[];
  isLoading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TimeSeriesChart({ timeSeriesData, isLoading, activeTab, onTabChange }: TimeSeriesChartProps) {
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

  // Group by year for aggregated trends
  const yearlyData = trendData.reduce((acc, curr) => {
    const existing = acc.find(item => item.year === curr.year);
    if (existing) {
      existing.credits += curr.credits;
    } else {
      acc.push({ year: curr.year, credits: curr.credits });
    }
    return acc;
  }, [] as { year: number; credits: number }[]);

  // Sample project type data
  const projectData = [
    { type: "Forestry", credits: 450000 },
    { type: "Renewable Energy", credits: 320000 },
    { type: "Waste Management", credits: 180000 },
    { type: "Energy Efficiency", credits: 120000 },
  ];

  // Sample buyer data for bubble chart
  const buyerData = [
    { name: "Microsoft", totalCredits: 324500, transactions: 45, yearsActive: 3 },
    { name: "Apple", totalCredits: 287300, transactions: 38, yearsActive: 2 },
    { name: "Shell", totalCredits: 203700, transactions: 52, yearsActive: 4 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-emerald-400 text-sm font-medium">
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
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
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
                <BarChart data={projectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="type" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
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
                <ScatterChart data={buyerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    type="number"
                    dataKey="totalCredits" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <YAxis 
                    type="number"
                    dataKey="transactions" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: '#374151' }}
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-dark-800 border border-gray-700 rounded-lg p-3 shadow-lg">
                            <p className="text-gray-300 text-sm font-medium">{data.name}</p>
                            <p className="text-emerald-400 text-sm">Credits: {data.totalCredits.toLocaleString()}</p>
                            <p className="text-blue-400 text-sm">Transactions: {data.transactions}</p>
                            <p className="text-amber-400 text-sm">Years Active: {data.yearsActive}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter 
                    dataKey="yearsActive" 
                    fill="#F59E0B"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
