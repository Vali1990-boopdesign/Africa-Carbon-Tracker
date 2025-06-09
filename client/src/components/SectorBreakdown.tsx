import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import type { SectorData } from "@shared/schema";

interface SectorBreakdownProps {
  sectorData?: SectorData[];
  isLoading: boolean;
}

export function SectorBreakdown({ sectorData, isLoading }: SectorBreakdownProps) {
  if (isLoading) {
    return (
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-dark-800/30 rounded-lg border border-gray-700 animate-pulse mb-4"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-700 rounded w-8"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sectorData || sectorData.length === 0) {
    return (
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Sector Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            <p>No sector data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm font-medium">{data.sector}</p>
          <p className="text-emerald-400 text-sm">Credits: {data.totalCredits.toLocaleString()}</p>
          <p className="text-blue-400 text-sm">Share: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Sector Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Responsive Layout: Horizontal on lg+ screens, vertical on smaller screens */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 space-y-4 lg:space-y-0">
            {/* Donut Chart */}
            <div className="h-40 lg:w-48 lg:flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="totalCredits"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Sector Legend */}
            <div className="flex-1 space-y-2">
              {sectorData.map((sector, index) => (
                <motion.div
                  key={sector.sector}
                  className="flex items-center justify-between"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: sector.color }}
                    ></div>
                    <span className="text-sm text-gray-300">{sector.sector}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{sector.percentage}%</span>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Total Credits Summary */}
          <motion.div 
            className="mt-4 pt-4 border-t border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total Credits</span>
              <span className="text-sm font-semibold text-white">
                {sectorData.reduce((sum, sector) => sum + sector.totalCredits, 0).toLocaleString()}
              </span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
