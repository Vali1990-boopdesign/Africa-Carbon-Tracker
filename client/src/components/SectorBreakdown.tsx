import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import type { SectorData } from "@shared/schema";

interface SectorBreakdownProps {
  sectorData?: SectorData[];
  isLoading: boolean;
}

// Color palette for the pie chart
const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16", "#f97316"];

// Format number with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

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

  // Calculate total credits from sector data
  const totalCredits = sectorData?.reduce((sum, sector) => sum + sector.totalCredits, 0) || 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-3 shadow-xl backdrop-blur-sm">
          <p className="text-gray-900 dark:text-gray-100 text-sm font-medium">{data.sector}</p>
          <p className="text-emerald-600 dark:text-emerald-400 text-sm">Credits: {data.totalCredits.toLocaleString()}</p>
          <p className="text-blue-600 dark:text-blue-400 text-sm">Share: {((data.totalCredits / totalCredits) * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-effect border-gray-700 bg-white/95 dark:bg-gray-900/95">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Sector Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-start gap-6">
              {/* Donut Chart - Left side on desktop */}
              <div className="w-full lg:flex-1 flex justify-center">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="totalCredits"
                      stroke="none"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Data List - Right side on desktop */}
              <div className="w-full lg:flex-1 space-y-3">
                {sectorData.map((sector, index) => (
                  <div
                    key={sector.sector}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full`}
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {sector.sector}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {((sector.totalCredits / totalCredits) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      Total Credits
                    </span>
                    <span className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                      {formatNumber(totalCredits)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}