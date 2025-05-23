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

  // Color schemes
  const creditColors = [
    "bg-blue-600", "bg-blue-500", "bg-blue-400", "bg-blue-300", 
    "bg-blue-200", "bg-blue-100", "bg-slate-200", "bg-slate-100",
    "bg-gray-100", "bg-gray-50", "bg-gray-50", "bg-gray-50", "bg-gray-50"
  ];
  
  const projectColors = [
    "bg-green-600", "bg-green-500", "bg-green-400", "bg-green-300", 
    "bg-green-200", "bg-green-100", "bg-slate-200", "bg-slate-100",
    "bg-gray-100", "bg-gray-50", "bg-gray-50", "bg-gray-50", "bg-gray-50"
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
                
                return (
                  <div
                    key={item.country}
                    className={`${colors[index]} border border-white dark:border-gray-600 rounded-lg p-2 flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 hover:shadow-lg group relative`}
                    style={{ 
                      gridRow: `span ${Math.max(Math.ceil(size / 25), 1)}`,
                      gridColumn: `span ${Math.max(Math.ceil(size / 25), 1)}`,
                      minHeight: '60px'
                    }}
                    onClick={() => onCountryClick?.(item.country)}
                    title={`${item.country}: ${item.totalCredits.toLocaleString()} credits (${percentage}%)`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-xs text-gray-900 dark:text-gray-100 mb-1">
                        {item.country}
                      </div>
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {item.totalCredits.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
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
                
                return (
                  <div
                    key={item.country}
                    className={`${colors[index]} border border-white dark:border-gray-600 rounded-lg p-2 flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 hover:shadow-lg group relative`}
                    style={{ 
                      gridRow: `span ${Math.max(Math.ceil(size / 25), 1)}`,
                      gridColumn: `span ${Math.max(Math.ceil(size / 25), 1)}`,
                      minHeight: '60px'
                    }}
                    onClick={() => onCountryClick?.(item.country)}
                    title={`${item.country}: ${item.activeProjects} projects (${percentage}%)`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-xs text-gray-900 dark:text-gray-100 mb-1">
                        {item.country}
                      </div>
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {item.activeProjects}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
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