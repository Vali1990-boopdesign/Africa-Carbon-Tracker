
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Chart } from "react-google-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";
import type { BilateralAgreement } from "@shared/schema";

interface BilateralSankeyDiagramProps {
  agreements: BilateralAgreement[];
}

export function BilateralSankeyDiagram({ agreements }: BilateralSankeyDiagramProps) {
  const [chartError, setChartError] = useState<string | null>(null);
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  // Transform bilateral agreements data into Sankey format
  const generateSankeyData = useCallback(() => {
    try {
      if (!agreements || agreements.length === 0) {
        return [["From", "To", "Weight"]];
      }

      // Count agreements by individual country-partner pairs
      const connectionCounts = new Map<string, number>();
      
      agreements.forEach(agreement => {
        try {
          // Ensure we have valid country and partner data
          if (agreement?.country && agreement?.partner) {
            // Split partners if they contain commas (multiple partners in one field)
            const partners = String(agreement.partner).split(',').map(p => p.trim());
            
            partners.forEach(partner => {
              if (partner && partner.length > 0) {
                const key = `${String(agreement.country).trim()}→${partner}`;
                connectionCounts.set(key, (connectionCounts.get(key) || 0) + 1);
              }
            });
          }
        } catch (err) {
          console.warn('Error processing agreement:', err);
        }
      });

      // Convert to Sankey data format
      const sankeyData = [["From", "To", "Weight"]];
      
      connectionCounts.forEach((count, key) => {
        try {
          const [country, partner] = key.split('→');
          if (country && partner && count > 0) {
            sankeyData.push([country, partner, count]);
          }
        } catch (err) {
          console.warn('Error processing connection:', err);
        }
      });

      return sankeyData;
    } catch (error) {
      console.error('Error generating Sankey data:', error);
      return [["From", "To", "Weight"]];
    }
  }, [agreements]);

  const sankeyOptions = {
    sankey: {
      node: {
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#84cc16'],
        label: {
          fontName: 'Arial, sans-serif',
          fontSize: 11,
          color: '#ffffff',
          bold: false
        },
        width: 6,
        nodePadding: 10
      },
      link: {
        colorMode: 'gradient',
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#84cc16']
      }
    },
    backgroundColor: 'transparent',
    tooltip: {
      textStyle: {
        color: '#000000',
        fontSize: 11,
        fontName: 'Arial, sans-serif'
      },
      showColorCode: false
    },
    chartArea: {
      left: 10,
      top: 10,
      width: '90%',
      height: '90%'
    },
    forceIFrame: false,
    packages: ['sankey']
  };

  const data = generateSankeyData();

  const handleChartError = useCallback((error: any) => {
    console.error('Chart error:', error);
    if (isMountedRef.current) {
      setChartError('Chart visualization temporarily unavailable');
      setIsChartLoaded(false);
    }
  }, []);

  const handleChartReady = useCallback(() => {
    if (isMountedRef.current) {
      setIsChartLoaded(true);
      setChartError(null);
      setHasInitialized(true);
    }
  }, []);

  // Reset chart when agreements change with error catching
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    try {
      setChartKey(prev => prev + 1);
      setIsChartLoaded(false);
      setChartError(null);
      setHasInitialized(false);
    } catch (error) {
      console.error('Error resetting chart:', error);
      if (isMountedRef.current) {
        setChartError('Chart initialization failed');
      }
    }
  }, [agreements]);

  // Component mount/unmount management
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Add global error handler for unhandled chart errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Prevent errors from bubbling up to Vite's error overlay
      if (event.error && event.error.message) {
        const message = String(event.error.message).toLowerCase();
        if (message.includes('google') || 
            message.includes('chart') ||
            message.includes('sankey') ||
            message.includes('visualization')) {
          event.preventDefault();
          event.stopPropagation();
          if (isMountedRef.current) {
            setChartError('Chart loading failed - displaying connection count instead');
          }
          return false;
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason) {
        const reason = String(event.reason).toLowerCase();
        if (reason.includes('google') || 
            reason.includes('chart') ||
            reason.includes('sankey') ||
            reason.includes('visualization')) {
          event.preventDefault();
          if (isMountedRef.current) {
            setChartError('Chart loading failed - displaying connection count instead');
          }
        }
      }
    };

    window.addEventListener('error', handleGlobalError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    return () => {
      window.removeEventListener('error', handleGlobalError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
    };
  }, []);

  if (data.length <= 1) {
    return (
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
            <Network className="w-6 h-6 text-emerald-500" />
            Partnership Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-gray-400">
            <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No partnership data available for visualization</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartError) {
    return (
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
            <Network className="w-6 h-6 text-emerald-500" />
            Partnership Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">{chartError}</p>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-3">Partnership Connections Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-emerald-400 font-medium">{data.length - 1}</span>
                  <p>Total Connections</p>
                </div>
                <div>
                  <span className="text-blue-400 font-medium">{agreements.length}</span>
                  <p>Bilateral Agreements</p>
                </div>
              </div>
              <div className="mt-4 max-h-32 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-2">Recent Partnerships:</p>
                {data.slice(1, 6).map((connection, index) => (
                  <div key={index} className="text-xs text-gray-300 mb-1">
                    {connection[0]} → {connection[1]} ({connection[2]} agreement{connection[2] > 1 ? 's' : ''})
                  </div>
                ))}
                {data.length > 6 && (
                  <p className="text-xs text-gray-500">...and {data.length - 6} more</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
          <Network className="w-6 h-6 text-emerald-500" />
          Partnership Flow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full relative" ref={chartRef}>
          {!isChartLoaded && !chartError && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-800/50 rounded">
              <div className="text-gray-400">Loading partnership flow...</div>
            </div>
          )}
          {(() => {
            try {
              return (
                <Chart
                  key={chartKey}
                  chartType="Sankey"
                  width="100%"
                  height="100%"
                  data={data}
                  options={sankeyOptions}
                  chartEvents={[
                    {
                      eventName: 'ready',
                      callback: handleChartReady
                    },
                    {
                      eventName: 'error',
                      callback: handleChartError
                    }
                  ]}
                  chartPackages={['sankey']}
                  loader={<div className="text-gray-400 flex items-center justify-center h-full">Loading chart...</div>}
                  errorElement={
                    <div className="text-center text-gray-400 py-8">
                      <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Chart visualization temporarily unavailable</p>
                      <p className="text-sm mt-2">Showing {data.length - 1} partnership connections</p>
                    </div>
                  }
                />
              );
            } catch (error) {
              console.error('Chart render error:', error);
              return (
                <div className="text-center text-gray-400 py-8">
                  <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chart visualization temporarily unavailable</p>
                  <p className="text-sm mt-2">Showing {data.length - 1} partnership connections</p>
                </div>
              );
            }
          })()}
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <p>Flow diagram showing bilateral partnership connections between African countries and their international partners. Line thickness represents the number of agreements.</p>
          <p className="mt-1">Displaying {data.length - 1} partnership connections from {agreements.length} bilateral agreements.</p>
        </div>
      </CardContent>
    </Card>
  );
}
