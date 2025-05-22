import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Map } from "lucide-react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import type { CountryData } from "@shared/schema";

interface AfricaMapProps {
  countryData?: CountryData[];
  isLoading: boolean;
  onCountryClick?: (country: string) => void;
}

export function AfricaMap({ countryData, isLoading, onCountryClick }: AfricaMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleResetFilter = () => {
    // Reset any map-specific filters
    console.log("Resetting map filter");
  };

  useEffect(() => {
    if (!svgRef.current || isLoading || !countryData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 280;
    const height = 260;

    // Simple Africa outline with country bubbles
    const countries = [
      { name: "South Africa", x: 140, y: 220, credits: countryData.find(c => c.country === "South Africa")?.totalCredits || 0 },
      { name: "Kenya", x: 170, y: 120, credits: countryData.find(c => c.country === "Kenya")?.totalCredits || 0 },
      { name: "Nigeria", x: 80, y: 90, credits: countryData.find(c => c.country === "Nigeria")?.totalCredits || 0 },
    ];

    const maxCredits = Math.max(...countries.map(c => c.credits));
    const radiusScale = d3.scaleLinear()
      .domain([0, maxCredits])
      .range([8, 25]);

    const colorScale = d3.scaleLinear<string>()
      .domain([0, maxCredits])
      .range(["#10b981", "#059669"]);

    // Add African continent outline (simplified)
    svg.append("path")
      .attr("d", "M50,40 Q120,20 180,50 Q220,80 230,120 Q225,160 210,190 Q180,230 140,240 Q100,235 70,200 Q40,160 45,120 Q48,80 50,40")
      .attr("fill", "none")
      .attr("stroke", "#374151")
      .attr("stroke-width", 2)
      .attr("opacity", 0.5);

    // Add country circles
    const countryNodes = svg.selectAll(".country")
      .data(countries)
      .enter()
      .append("g")
      .attr("class", "country")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        onCountryClick?.(d.name);
      });

    countryNodes.append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 0)
      .attr("fill", d => colorScale(d.credits))
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("opacity", 0.8)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200)
      .attr("r", d => radiusScale(d.credits));

    // Add country labels
    countryNodes.append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y - radiusScale(d.credits) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e5e5")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .style("opacity", 0)
      .text(d => d.name)
      .transition()
      .duration(500)
      .delay((d, i) => i * 200 + 1000)
      .style("opacity", 1);

    // Add credit values
    countryNodes.append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y + 3)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "8px")
      .attr("font-weight", "600")
      .style("opacity", 0)
      .text(d => `${(d.credits / 1000).toFixed(0)}K`)
      .transition()
      .duration(500)
      .delay((d, i) => i * 200 + 1200)
      .style("opacity", 1);

  }, [countryData, isLoading, onCountryClick]);

  if (isLoading) {
    return (
      <Card className="glass-effect border-gray-700 h-96">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-dark-800/50 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-effect border-gray-700 h-96">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">Africa Overview</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetFilter}
              className="text-gray-400 hover:text-white"
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-dark-800/50 rounded-lg border border-gray-700 relative overflow-hidden flex items-center justify-center">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-amber-500/5"></div>
            
            {/* D3.js SVG Map */}
            <svg 
              ref={svgRef}
              width="280" 
              height="260"
              className="relative z-10"
              viewBox="0 0 280 260"
            />
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 text-xs text-gray-400">
              <div className="flex items-center space-x-2 bg-dark-800/70 rounded px-2 py-1">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span>Credits Retired</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
