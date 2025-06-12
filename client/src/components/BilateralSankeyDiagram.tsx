
import React from "react";
import { Chart } from "react-google-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";
import type { BilateralAgreement } from "@shared/schema";
import { Tooltip } from "recharts";

interface BilateralSankeyDiagramProps {
  agreements: BilateralAgreement[];
}


export function BilateralSankeyDiagram({ agreements }: BilateralSankeyDiagramProps) {
  // Transform bilateral agreements data into Sankey format
  const generateSankeyData = () => {
    if (!agreements || agreements.length === 0) {
      return [["From", "To", "Weight"]];
    }

    // Count agreements by individual country-partner pairs
    const connectionCounts = new Map<string, number>();
    
    agreements.forEach(agreement => {
      // Ensure we have valid country and partner data
      if (agreement.country && agreement.partner) {
        // Split partners if they contain commas (multiple partners in one field)
        const partners = agreement.partner.split(',').map(p => p.trim());
        
        partners.forEach(partner => {
          if (partner) {
            const key = `${agreement.country.trim()}→${partner}`;
            connectionCounts.set(key, (connectionCounts.get(key) || 0) + 1);
          }
        });
      }
    });

    // Convert to Sankey data format
    const sankeyData = [["From", "To", "Weight"]];
    
    connectionCounts.forEach((count, key) => {
      const [country, partner] = key.split('→');
      if (country && partner && count > 0) {
        sankeyData.push([country, partner, count]);
      }
    });

    return sankeyData;
  };

  const sankeyOptions = {
    sankey: {
      node: {
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
        label: {
          fontName: 'Inter',
          fontSize: 12,
          color: '#ffffff',
          bold: true
        },
        width: 4,
      },
      link: {
        colorMode: 'gradient',
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']
      }
    },
    backgroundColor: 'transparent',
    tooltip : {textStyle: {color: '#000000'}, showColorCode: true}
    // tooltip: {
    //   textStyle: {
    //     color: '#ffffff',
    //     fontSize: 12
    //   },
    //   showColorCode: true
    // }
  };

  const data = generateSankeyData();

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

  return (
    <Card className="glass-effect border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-white">
          <Network className="w-6 h-6 text-emerald-500" />
          Partnership Flow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <Chart
            chartType="Sankey"
            width="100%"
            height="100%"
            data={data}
            options={sankeyOptions}
          />
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <p>Flow diagram showing bilateral partnership connections between African countries and their international partners. Line thickness represents the number of agreements.</p>
        </div>
      </CardContent>
    </Card>
  );
}
