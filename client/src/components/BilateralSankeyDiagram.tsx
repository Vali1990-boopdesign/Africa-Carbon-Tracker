import React, { useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";
import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";
import type { BilateralAgreement } from "@shared/schema";

interface BilateralSankeyDiagramProps {
  agreements: BilateralAgreement[];
}

export function BilateralSankeyDiagram({ agreements }: BilateralSankeyDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Transform bilateral agreements data into Sankey format
  const generateSankeyData = useCallback(() => {
    try {
      if (!agreements || agreements.length === 0) {
        return { nodes: [], links: [] };
      }

      // Count agreements by individual country-partner pairs
      const connectionCounts = new Map<string, number>();
      
      agreements.forEach(agreement => {
        try {
          if (agreement?.country && agreement?.partner) {
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

      // Extract unique nodes
      const nodeSet = new Set<string>();
      const links: Array<{source: string, target: string, value: number}> = [];
      
      connectionCounts.forEach((count, key) => {
        try {
          const [country, partner] = key.split('→');
          if (country && partner && count > 0) {
            nodeSet.add(country);
            nodeSet.add(partner);
            links.push({source: country, target: partner, value: count});
          }
        } catch (err) {
          console.warn('Error processing connection:', err);
        }
      });

      const nodes = Array.from(nodeSet).map(id => ({
        id,
        group: id.includes('Japan') || id.includes('Korea') || id.includes('Singapore') || 
               id.includes('Switzerland') || id.includes('Norway') || id.includes('Sweden') ||
               id.includes('Kuwait') || id.includes('United Arab') ? 'partner' : 'african'
      }));

      return { nodes, links };
    } catch (error) {
      console.error('Error generating Sankey data:', error);
      return { nodes: [], links: [] };
    }
  }, [agreements]);

  const renderSankey = useCallback(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;

    // Clear previous content
    svg.selectAll("*").remove();

    const { nodes, links } = generateSankeyData();
    
    if (nodes.length === 0 || links.length === 0) {
      // Show empty state
      svg.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#9CA3AF")
        .attr("font-size", "14px")
        .text("No partnership data available");
      return;
    }

    const width = 800;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 20;
    const marginLeft = 20;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");

    // Create color scale
    const color = d3.scaleOrdinal()
      .domain(["african", "partner"])
      .range(["#10b981", "#3b82f6"]);

    // Create the Sankey generator
    const sankey = d3Sankey.sankey()
      .nodeId((d: any) => d.id)
      .nodeAlign(d3Sankey.sankeyJustify)
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]]);

    // Generate the Sankey layout
    const sankeyData = sankey({
      nodes: nodes.map(d => ({...d})),
      links: links.map(d => ({...d}))
    });

    // Add links
    const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.5)
      .selectAll("g")
      .data(sankeyData.links)
      .join("g")
      .style("mix-blend-mode", "multiply");

    // Create gradients for links
    const gradient = svg.append("defs")
      .selectAll("linearGradient")
      .data(sankeyData.links)
      .join("linearGradient")
      .attr("id", (d, i) => `gradient-${i}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", (d: any) => d.source.x1)
      .attr("x2", (d: any) => d.target.x0);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", (d: any) => color(d.source.group));

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", (d: any) => color(d.target.group));

    // Add link paths
    link.append("path")
      .attr("d", d3Sankey.sankeyLinkHorizontal())
      .attr("stroke", (d, i) => `url(#gradient-${i})`)
      .attr("stroke-width", (d: any) => Math.max(1, d.width));

    // Add link titles
    link.append("title")
      .text((d: any) => `${d.source.id} → ${d.target.id}\n${d.value} agreement${d.value > 1 ? 's' : ''}`);

    // Add nodes
    const node = svg.append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .selectAll("rect")
      .data(sankeyData.nodes)
      .join("rect")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("fill", (d: any) => color(d.group));

    // Add node titles
    node.append("title")
      .text((d: any) => `${d.id}\n${d.value} connection${d.value > 1 ? 's' : ''}`);

    // Add node labels
    svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("fill", "#ffffff")
      .selectAll("text")
      .data(sankeyData.nodes)
      .join("text")
      .attr("x", (d: any) => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", (d: any) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => d.x0 < width / 2 ? "start" : "end")
      .text((d: any) => d.id)
      .style("font-weight", "500");

  }, [generateSankeyData]);

  useEffect(() => {
    renderSankey();
  }, [renderSankey, agreements]);

  const { nodes, links } = generateSankeyData();

  if (nodes.length === 0) {
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
        <div className="w-full bg-gray-800/50 rounded-lg p-4">
          <svg ref={svgRef} className="w-full h-auto"></svg>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <p>Flow diagram showing bilateral partnership connections between African countries and their international partners. Line thickness represents the number of agreements.</p>
          <p className="mt-1">Displaying {links.length} partnership connections from {agreements.length} bilateral agreements.</p>
          <div className="flex gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span className="text-xs">African Countries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs">Partner Countries</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}