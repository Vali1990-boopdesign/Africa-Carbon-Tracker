import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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

  // Calculate totals for percentage calculations
  const totalCredits = data.reduce((sum, item) => sum + item.totalCredits, 0);
  const totalProjects = data.reduce((sum, item) => sum + item.activeProjects, 0);

  // Sort data by the active metric
  const sortedData = [...data].sort((a, b) => {
    const aValue = activeTab === "credits" ? a.totalCredits : a.activeProjects;
    const bValue = activeTab === "credits" ? b.totalCredits : b.activeProjects;
    return bValue - aValue;
  });

  // Material Design 3 color schemes with accessibility-compliant contrast ratios
  // Extended color palette to handle many countries in authentic data
  const creditColors = [
    { bg: "bg-blue-900", text: "text-white" },
    { bg: "bg-blue-800", text: "text-white" },
    { bg: "bg-blue-700", text: "text-white" },
    { bg: "bg-blue-600", text: "text-white" },
    { bg: "bg-blue-500", text: "text-white" },
    { bg: "bg-blue-400", text: "text-gray-900" },
    { bg: "bg-blue-300", text: "text-gray-900" },
    { bg: "bg-blue-200", text: "text-gray-900" },
    { bg: "bg-emerald-600", text: "text-white" },
    { bg: "bg-emerald-500", text: "text-white" },
    { bg: "bg-emerald-400", text: "text-gray-900" },
    { bg: "bg-purple-600", text: "text-white" },
    { bg: "bg-purple-500", text: "text-white" },
    { bg: "bg-purple-400", text: "text-gray-900" },
    { bg: "bg-amber-500", text: "text-gray-900" },
    { bg: "bg-amber-400", text: "text-gray-900" },
    { bg: "bg-rose-600", text: "text-white" },
    { bg: "bg-rose-500", text: "text-white" },
    { bg: "bg-rose-400", text: "text-gray-900" },
    { bg: "bg-teal-600", text: "text-white" },
    { bg: "bg-teal-500", text: "text-white" },
    { bg: "bg-teal-400", text: "text-gray-900" },
    { bg: "bg-indigo-600", text: "text-white" },
    { bg: "bg-indigo-500", text: "text-white" },
    { bg: "bg-indigo-400", text: "text-gray-900" },
    { bg: "bg-orange-500", text: "text-gray-900" },
    { bg: "bg-orange-400", text: "text-gray-900" },
    { bg: "bg-pink-600", text: "text-white" },
    { bg: "bg-pink-500", text: "text-white" },
    { bg: "bg-pink-400", text: "text-gray-900" },
    { bg: "bg-cyan-600", text: "text-white" },
    { bg: "bg-cyan-500", text: "text-white" },
    { bg: "bg-cyan-400", text: "text-gray-900" },
    { bg: "bg-slate-600", text: "text-white" },
    { bg: "bg-slate-500", text: "text-white" },
    { bg: "bg-slate-400", text: "text-gray-900" },
    { bg: "bg-gray-600", text: "text-white" },
    { bg: "bg-gray-500", text: "text-white" },
    { bg: "bg-gray-400", text: "text-gray-900" },
    { bg: "bg-stone-600", text: "text-white" },
    { bg: "bg-stone-500", text: "text-white" },
    { bg: "bg-stone-400", text: "text-gray-900" }
  ];
  
  const projectColors = [
    { bg: "bg-green-900", text: "text-white" },   // Dark backgrounds get white text
    { bg: "bg-green-800", text: "text-white" },
    { bg: "bg-green-700", text: "text-white" },
    { bg: "bg-green-600", text: "text-white" },
    { bg: "bg-green-500", text: "text-white" },
    { bg: "bg-green-400", text: "text-gray-900" }, // Light backgrounds get dark text
    { bg: "bg-green-300", text: "text-gray-900" },
    { bg: "bg-green-200", text: "text-gray-900" },
    { bg: "bg-green-100", text: "text-gray-900" },
    { bg: "bg-slate-200", text: "text-gray-900" },
    { bg: "bg-slate-100", text: "text-gray-900" },
    { bg: "bg-gray-100", text: "text-gray-900" },
    { bg: "bg-gray-50", text: "text-gray-900" }
  ];

  const colors = activeTab === "credits" ? creditColors : projectColors;

  // Calculate sizes for treemap layout
  const getCountrySize = (item: CountryData) => {
    const value = activeTab === "credits" ? item.totalCredits : item.activeProjects;
    const total = activeTab === "credits" ? totalCredits : totalProjects;
    return Math.max((value / total) * 100, 2); // Minimum 2% size
  };

  if (isLoading) {
    return (
      <Card className="h-fit glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Africa Carbon Credits Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded h-96 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Africa Carbon Credits Map
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {data.length} Countries
          </Badge>
        </div>
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
            <div className="grid grid-cols-4 gap-1 h-80 w-full">
              {sortedData.map((item, index) => {
                const percentage = ((item.totalCredits / totalCredits) * 100).toFixed(1);
                const size = getCountrySize(item);
                const colorIndex = Math.min(index, colors.length - 1);
                
                return (
                  <div
                    key={item.country}
                    className={`${colors[colorIndex].bg} border border-white dark:border-gray-600 rounded-lg p-2 flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 hover:shadow-lg group relative`}
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
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      <div className="font-semibold">{item.country}</div>
                      <div>{item.totalCredits.toLocaleString()} Credits</div>
                      <div>{item.activeProjects} Active Projects</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
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
            <div className="grid grid-cols-4 gap-1 h-80 w-full">
              {sortedData.map((item, index) => {
                const percentage = ((item.activeProjects / totalProjects) * 100).toFixed(1);
                const size = getCountrySize(item);
                const colorIndex = Math.min(index, colors.length - 1);
                
                return (
                  <div
                    key={item.country}
                    className={`${colors[colorIndex].bg} border border-white dark:border-gray-600 rounded-lg p-2 flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 hover:shadow-lg group relative`}
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
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      <div className="font-semibold">{item.country}</div>
                      <div>{item.totalCredits.toLocaleString()} Credits</div>
                      <div>{item.activeProjects} Active Projects</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
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