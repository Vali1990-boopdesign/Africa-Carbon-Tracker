import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BuyerData {
  brandName: string;
  sector: string;
  totalCredits: number;
  percentage: number;
  initials: string;
  color: string;
}

interface BuyerBubbleChartProps {
  data?: BuyerData[];
  isLoading: boolean;
  onBuyerClick?: (buyer: string) => void;
}

export function BuyerBubbleChart({ 
  data = [], 
  isLoading, 
  onBuyerClick 
}: BuyerBubbleChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || isLoading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Set up scales
    const radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.totalCredits) || 0])
      .range([10, 60]);

    // Color scale by sector
    const sectors = Array.from(new Set(data.map(d => d.sector)));
    const sectorColorScale = d3.scaleOrdinal()
      .domain(sectors)
      .range(d3.schemeCategory10);

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "12px 16px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)");

    // Create simulation
    const simulation = d3.forceSimulation(data as any)
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .force("collision", d3.forceCollide().radius((d: any) => radiusScale(d.totalCredits) + 2))
      .force("charge", d3.forceManyBody().strength(-50));

    // Create bubbles
    const bubbles = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", d => radiusScale(d.totalCredits))
      .attr("fill", d => sectorColorScale(d.sector) as string)
      .attr("opacity", 0.8)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke-width", 3);

        tooltip.style("visibility", "visible")
          .html(`
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #fff;">
              ${d.brandName}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #94a3b8;">Sector:</span> ${d.sector}
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #94a3b8;">Credits:</span> ${d.totalCredits.toLocaleString()}
            </div>
            <div>
              <span style="color: #94a3b8;">Market Share:</span> ${d.percentage.toFixed(1)}%
            </div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseleave", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("stroke-width", 2);

        tooltip.style("visibility", "hidden");
      })
      .on("click", function(event, d) {
        if (onBuyerClick) {
          onBuyerClick(d.brandName);
        }
      });

    // Add labels
    const labels = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .text(d => d.initials)
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("font-size", d => Math.min(radiusScale(d.totalCredits) / 3, 12) + "px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .style("pointer-events", "none");

    // Update positions on simulation tick
    simulation.on("tick", () => {
      bubbles
        .attr("cx", (d: any) => Math.max(radiusScale(d.totalCredits), Math.min(width - radiusScale(d.totalCredits), d.x)))
        .attr("cy", (d: any) => Math.max(radiusScale(d.totalCredits), Math.min(height - radiusScale(d.totalCredits), d.y)));

      labels
        .attr("x", (d: any) => Math.max(radiusScale(d.totalCredits), Math.min(width - radiusScale(d.totalCredits), d.x)))
        .attr("y", (d: any) => Math.max(radiusScale(d.totalCredits), Math.min(height - radiusScale(d.totalCredits), d.y)));
    });

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150}, 20)`);
    
    legend.selectAll("rect")
      .data(sectors)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 20)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", d => sectorColorScale(d) as string);

    legend.selectAll("text")
      .data(sectors)
      .enter()
      .append("text")
      .attr("x", 18)
      .attr("y", (d, i) => i * 20 + 9)
      .text(d => d)
      .attr("font-size", "11px")
      .attr("fill", "currentColor");

    return () => {
      simulation.stop();
    };
  }, [data, isLoading, onBuyerClick]);

  if (isLoading) {
    return (
      <Card className="h-fit glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Buyers Bubble Chart
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
            Top Buyers Bubble Chart
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {data.length} Buyers
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Bubble size represents total carbon credits purchased
          </p>
        </div>
        <div className="relative">
          <svg
            ref={svgRef}
            width={600}
            height={400}
            className="border rounded-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 overflow-visible"
          />
          <div
            ref={tooltipRef}
            className="absolute pointer-events-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}