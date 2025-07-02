import React, { useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, ArrowRight } from "lucide-react";
import type { BilateralAgreement } from "@shared/schema";

interface BilateralSankeyDiagramProps {
  agreements: BilateralAgreement[];
}

export function BilateralSankeyDiagram({ agreements }: BilateralSankeyDiagramProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Transform bilateral agreements data into connection format
  const generateConnectionData = useCallback(() => {
    try {
      if (!agreements || agreements.length === 0) {
        return [];
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

      // Convert to connection data format
      const connections: Array<{from: string, to: string, count: number}> = [];
      
      connectionCounts.forEach((count, key) => {
        try {
          const [country, partner] = key.split('→');
          if (country && partner && count > 0) {
            connections.push({from: country, to: partner, count});
          }
        } catch (err) {
          console.warn('Error processing connection:', err);
        }
      });

      return connections;
    } catch (error) {
      console.error('Error generating connection data:', error);
      return [];
    }
  }, [agreements]);

  const connections = generateConnectionData();
  const africanCountries = Array.from(new Set(connections.map(c => c.from)));
  const partnerCountries = Array.from(new Set(connections.map(c => c.to)));

  if (connections.length === 0) {
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
          {/* Flow visualization using custom layout */}
          <div className="bg-gray-800/50 rounded-lg p-6 h-full">
            <h4 className="font-medium text-white mb-4 text-center">Bilateral Partnership Connections</h4>
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* African Countries Column */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-emerald-400 mb-3">African Countries</h5>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {africanCountries.map((country, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/50 rounded px-3 py-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      {country}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Partner Countries Column */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-blue-400 mb-3">Partner Countries</h5>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {partnerCountries.map((partner, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300 bg-gray-700/50 rounded px-3 py-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      {partner}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Connection details */}
            <div className="mt-4 pt-4 border-t border-gray-600">
              <h5 className="text-sm font-medium text-yellow-400 mb-3">Recent Connections</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {connections.slice(0, 8).map((connection, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-gray-300 bg-gray-700/30 rounded px-2 py-1">
                    <span className="text-emerald-400">{connection.from}</span>
                    <ArrowRight className="w-3 h-3 text-gray-500" />
                    <span className="text-blue-400">{connection.to}</span>
                    <span className="text-yellow-400">({connection.count})</span>
                  </div>
                ))}
              </div>
              {connections.length > 8 && (
                <p className="text-xs text-gray-500 mt-2">...and {connections.length - 8} more connections</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <p>Flow diagram showing bilateral partnership connections between African countries and their international partners.</p>
          <p className="mt-1">Displaying {connections.length} partnership connections from {agreements.length} bilateral agreements.</p>
        </div>
      </CardContent>
    </Card>
  );
}