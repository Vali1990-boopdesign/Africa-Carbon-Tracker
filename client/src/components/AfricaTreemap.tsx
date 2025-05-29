import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CountryData {
  country: string;
  totalCredits: number;
  activeProjects: number;
}

interface AfricaTreemapProps {
  data?: CountryData[];
  isLoading: boolean;
  onCountryClick?: (country: string) => void;
}

export function AfricaTreemap({ 
  data = [], 
  isLoading, 
  onCountryClick 
}: AfricaTreemapProps) {
  const [activeTab, setActiveTab] = useState("credits");

  const totalCredits = data.reduce((sum, item) => sum + item.totalCredits, 0);
  const totalProjects = data.reduce((sum, item) => sum + item.activeProjects, 0);

  const sortedData = [...data].sort((a, b) => {
    if (activeTab === "credits") {
      return b.totalCredits - a.totalCredits;
    } else {
      return b.activeProjects - a.activeProjects;
    }
  }).slice(0, 20);

  const getCountrySize = (item: CountryData) => {
    if (activeTab === "credits") {
      const maxCredits = Math.max(...data.map(d => d.totalCredits));
      return maxCredits > 0 ? (item.totalCredits / maxCredits) * 100 : 25;
    } else {
      const maxProjects = Math.max(...data.map(d => d.activeProjects));
      return maxProjects > 0 ? (item.activeProjects / maxProjects) * 100 : 25;
    }
  };

  const colors = [
    { bg: "bg-emerald-600", text: "text-white" },
    { bg: "bg-emerald-500", text: "text-white" },
    { bg: "bg-emerald-400", text: "text-gray-900" },
    { bg: "bg-blue-600", text: "text-white" },
    { bg: "bg-blue-500", text: "text-white" },
    { bg: "bg-blue-400", text: "text-gray-900" },
    { bg: "bg-purple-600", text: "text-white" },
    { bg: "bg-purple-500", text: "text-white" },
    { bg: "bg-purple-400", text: "text-gray-900" },
    { bg: "bg-yellow-600", text: "text-white" },
    { bg: "bg-yellow-500", text: "text-gray-900" },
    { bg: "bg-yellow-400", text: "text-gray-900" },
    { bg: "bg-red-600", text: "text-white" },
    { bg: "bg-red-500", text: "text-white" },
    { bg: "bg-red-400", text: "text-gray-900" },
    { bg: "bg-green-600", text: "text-white" },
    { bg: "bg-green-500", text: "text-white" },
    { bg: "bg-green-400", text: "text-gray-900" },
  ];

  if (isLoading) {
    return (
      <Card className="glass-effect border-gray-700 bg-white/95 dark:bg-gray-900/95 h-[600px]">
        <div className="flex items-center justify-center h-80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-gray-700 bg-white/95 dark:bg-gray-900/95 h-[600px]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Africa Carbon Credits</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="credits" className="text-sm">
              Carbon Credits
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-sm">
              Active Projects
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="credits" className="space-y-2">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Carbon Credits by Country
              </p>
            </div>
            <div className="grid grid-cols-4 gap-1 h-[450px] w-full overflow-y-auto">
              {sortedData.map((item, index) => {
                const percentage = ((item.totalCredits / totalCredits) * 100).toFixed(1);
                const size = getCountrySize(item);
                const colorIndex = Math.min(index, colors.length - 1);
                
                return (
                  <div
                    key={item.country}
                    className={`${colors[colorIndex].bg} border border-white dark:border-gray-600 rounded-lg p-2 flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                    style={{ 
                      gridRow: `span ${Math.max(Math.ceil(size / 25), 1)}`,
                      gridColumn: `span ${Math.max(Math.ceil(size / 25), 1)}`,
                      minHeight: '60px'
                    }}
                    onClick={() => onCountryClick?.(item.country)}
                    title={`${item.country}: ${item.totalCredits.toLocaleString()} credits (${percentage}%)`}
                  >
                    <div className="text-center">
                      <div className={`font-semibold text-xs ${colors[colorIndex].text} mb-1`}>
                        {item.country}
                      </div>
                      <div className={`text-xs font-bold ${colors[colorIndex].text}`}>
                        {item.totalCredits.toLocaleString()}
                      </div>
                      <div className={`text-xs ${colors[colorIndex].text} opacity-80`}>
                        {percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-2">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Projects by Country
              </p>
            </div>
            <div className="grid grid-cols-4 gap-1 h-[450px] w-full overflow-y-auto">
              {sortedData.map((item, index) => {
                const percentage = ((item.activeProjects / totalProjects) * 100).toFixed(1);
                const size = getCountrySize(item);
                const colorIndex = Math.min(index, colors.length - 1);
                
                return (
                  <div
                    key={item.country}
                    className={`${colors[colorIndex].bg} border border-white dark:border-gray-600 rounded-lg p-2 flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                    style={{ 
                      gridRow: `span ${Math.max(Math.ceil(size / 25), 1)}`,
                      gridColumn: `span ${Math.max(Math.ceil(size / 25), 1)}`,
                      minHeight: '60px'
                    }}
                    onClick={() => onCountryClick?.(item.country)}
                    title={`${item.country}: ${item.activeProjects} projects (${percentage}%)`}
                  >
                    <div className="text-center">
                      <div className={`font-semibold text-xs ${colors[colorIndex].text} mb-1`}>
                        {item.country}
                      </div>
                      <div className={`text-xs font-bold ${colors[colorIndex].text}`}>
                        {item.activeProjects}
                      </div>
                      <div className={`text-xs ${colors[colorIndex].text} opacity-80`}>
                        {percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}