
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/formatNumber";

interface CountryData {
  country: string;
  totalCredits: number;
  activeProjects: number;
}

interface ScopeData {
  scope: string;
  totalCredits: number;
  percentage: number;
  color: string;
}

interface AfricaTreemapProps {
  data?: CountryData[];
  scopeData?: ScopeData[];
  isLoading: boolean;
  onCountryClick?: (country: string) => void;
  onScopeClick?: (scope: string) => void;
}

export function AfricaTreemap({ 
  data = [], 
  scopeData = [],
  isLoading, 
  onCountryClick,
  onScopeClick
}: AfricaTreemapProps) {
  const [activeTab, setActiveTab] = useState("credits");

  const totalCredits = data.reduce((sum, item) => sum + item.totalCredits, 0);
  const totalProjects = data.reduce((sum, item) => sum + item.activeProjects, 0);
  const totalScopeCredits = scopeData.reduce((sum, item) => sum + item.totalCredits, 0);

  const sortedData = [...data].sort((a, b) => {
    if (activeTab === "credits") {
      return b.totalCredits - a.totalCredits;
    } else {
      return b.activeProjects - a.activeProjects;
    }
  });

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
    { bg: "bg-emerald-600", text: "text-on-surface" },
    { bg: "bg-emerald-500", text: "text-on-surface" },
    { bg: "bg-emerald-400", text: "text-on-surface" },
    { bg: "bg-blue-600", text: "text-on-surface" },
    { bg: "bg-blue-500", text: "text-on-surface" },
    { bg: "bg-blue-400", text: "text-on-surface" },
    { bg: "bg-purple-600", text: "text-on-surface" },
    { bg: "bg-purple-500", text: "text-on-surface" },
    { bg: "bg-purple-400", text: "text-on-surface" },
    { bg: "bg-yellow-600", text: "text-on-surface" },
    { bg: "bg-yellow-500", text: "text-on-surface" },
    { bg: "bg-yellow-400", text: "text-on-surface" },
    { bg: "bg-red-600", text: "text-on-surface" },
    { bg: "bg-red-500", text: "text-on-surface" },
    { bg: "bg-red-400", text: "text-on-surface" },
    { bg: "bg-green-600", text: "text-on-surface" },
    { bg: "bg-green-500", text: "text-on-surface" },
    { bg: "bg-green-400", text: "text-on-surface" },
  ];

  if (isLoading) {
    return (
      <Card className="glass-effect border bg-surface-container">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-on-surface">Supply: Africa Carbon Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border bg-surface-container h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-on-surface">Supply: Africa Carbon Credits</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="credits" className="text-sm">
              Carbon Credits
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-sm">
              Projects
            </TabsTrigger>
            <TabsTrigger value="scope" className="text-sm">
              Scope Area
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="credits" className="space-y-2">
            <div className="text-center mb-3">
              <p className="text-sm text-muted-foreground">
                Total Carbon Credits by Country
              </p>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-1 w-full">
                {sortedData.map((item, index) => {
                  const percentage = ((item.totalCredits / totalCredits) * 100).toFixed(2);
                  const size = getCountrySize(item);
                  const colorIndex = Math.min(index, colors.length - 1);
                  const gridSpan = 1;
                  
                  return (
                    <div
                      key={item.country}
                      className={`${colors[colorIndex].bg} border border-outline rounded-lg p-2 flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                      style={{ 
                        gridColumn: `span ${gridSpan}`,
                        minHeight: `${Math.max(80 + (size / 5), 80)}px`,
                        maxHeight: '140px'
                      }}
                      onClick={() => onCountryClick?.(item.country)}
                      title={`${item.country}: ${formatNumber(item.totalCredits)} credits (${percentage}%)`}
                    >
                      <div className="text-center w-full flex flex-col justify-center h-full">
                        <div className={`font-semibold text-xs ${colors[colorIndex].text} mb-1 break-words leading-tight`}>
                          {item.country}
                        </div>
                        <div className={`text-xs font-bold ${colors[colorIndex].text} mb-1`}>
                          {formatNumber(item.totalCredits)}
                        </div>
                        <div className={`text-xs ${colors[colorIndex].text} opacity-80`}>
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-2">
            <div className="text-center mb-3">
              <p className="text-sm text-muted-foreground">
                Projects by Country
              </p>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-1 w-full">
                {sortedData.map((item, index) => {
                  const percentage = ((item.activeProjects / totalProjects) * 100).toFixed(2);
                  const size = getCountrySize(item);
                  const colorIndex = Math.min(index, colors.length - 1);
                  const gridSpan = 1;
                  
                  return (
                    <div
                      key={item.country}
                      className={`${colors[colorIndex].bg} border border-outline rounded-lg p-2 flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                      style={{ 
                        gridColumn: `span ${gridSpan}`,
                        minHeight: `${Math.max(80 + (size / 5), 80)}px`,
                        maxHeight: '140px'
                      }}
                      onClick={() => onCountryClick?.(item.country)}
                      title={`${item.country}: ${item.activeProjects} projects (${percentage}%)`}
                    >
                      <div className="text-center w-full flex flex-col justify-center h-full">
                        <div className={`font-semibold text-xs ${colors[colorIndex].text} mb-1 break-words leading-tight`}>
                          {item.country}
                        </div>
                        <div className={`text-xs font-bold ${colors[colorIndex].text} mb-1`}>
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
            </div>
          </TabsContent>
          
          <TabsContent value="scope" className="space-y-2">
            <div className="text-center mb-3">
              <p className="text-sm text-muted-foreground">
                Carbon Credits by Scope Area
              </p>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1 w-full">
                {scopeData.map((item, index) => {
                  const percentage = item.percentage.toFixed(2);
                  const colorIndex = Math.min(index, colors.length - 1);
                  const size = Math.max(25, Math.min(item.percentage * 2, 100));
                  const gridSpan = 1;
                  
                  return (
                    <div
                      key={item.scope}
                      className={`${colors[colorIndex].bg} border border-outline rounded-lg p-2 flex flex-col justify-center items-center cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                      style={{ 
                        gridColumn: `span ${gridSpan}`,
                        minHeight: `${Math.max(80 + (size / 5), 80)}px`,
                        maxHeight: '140px'
                      }}
                      onClick={() => onScopeClick?.(item.scope)}
                      title={`${item.scope}: ${formatNumber(item.totalCredits)} credits (${percentage}%)`}
                    >
                      <div className="text-center w-full flex flex-col justify-center h-full">
                        <div className={`font-semibold text-xs ${colors[colorIndex].text} mb-1 break-words leading-tight`}>
                          {item.scope}
                        </div>
                        <div className={`text-xs font-bold ${colors[colorIndex].text} mb-1`}>
                          {formatNumber(item.totalCredits)}
                        </div>
                        <div className={`text-xs ${colors[colorIndex].text} opacity-80`}>
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
