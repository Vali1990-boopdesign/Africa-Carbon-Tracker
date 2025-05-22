import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as d3 from "d3";
import { motion } from "framer-motion";
import type { CountryData } from "@shared/schema";

interface AfricaMapProps {
  countryData?: CountryData[];
  isLoading: boolean;
  onCountryClick?: (country: string) => void;
}

export function AfricaMap({ countryData, isLoading, onCountryClick }: AfricaMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!countryData || isLoading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 500;

    // Better Africa-centered projection with proper fitting
    const projection = d3.geoMercator()
      .scale(500)
      .center([20, 0])
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Africa countries GeoJSON data (simplified for key countries)
    const africaCountries = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": { "name": "South Africa", "iso": "ZAF" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [16.344977, -28.576705], [32.895973, -26.743024], [32.071665, -29.876677], 
              [31.521001, -29.257388], [31.325561, -29.401978], [30.901763, -29.909957], 
              [30.622813, -30.423776], [30.055716, -31.140269], [28.926299, -32.172041], 
              [28.2194, -32.771953], [27.464608, -33.226964], [26.419678, -33.615998], 
              [25.909664, -33.66704], [25.780628, -33.944646], [25.172862, -33.796851], 
              [24.677853, -33.987176], [23.594043, -33.794474], [22.988189, -33.916431], 
              [22.574157, -33.864083], [21.542799, -34.258839], [20.689053, -34.417175], 
              [20.071261, -34.795137], [18.855315, -34.444306], [18.424643, -33.997873], 
              [18.377411, -34.136521], [18.244499, -33.867752], [18.25008, -33.281431], 
              [17.925190, -32.611291], [18.248032, -32.429963], [18.221762, -31.661633], 
              [17.566918, -30.725721], [17.064416, -29.875954], [17.062918, -29.875954], 
              [16.344977, -28.576705]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Kenya", "iso": "KEN" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [33.90371, 4.247083], [41.855083, 3.918911], [41.817359, 3.919607], 
              [40.76848, 4.257881], [39.859896, 3.422401], [39.560253, 2.8904], 
              [38.798446, 1.41013], [37.7669, 0.16718], [37.69869, -0.256119], 
              [36.159078, -1.134389], [34.59607, -1.17623], [34.04739, -0.519447], 
              [33.90371, 0.109813], [33.90371, 4.247083]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Nigeria", "iso": "NGA" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [2.69187, 13.594007], [14.677982, 13.594007], [14.677982, 12.624205], 
              [14.415379, 11.572369], [13.572949, 10.798566], [13.308598, 9.908497], 
              [12.753671, 8.717828], [12.218872, 7.798651], [11.745774, 6.980954], 
              [9.234243, 6.444408], [8.500288, 4.771982], [7.314932, 4.281103], 
              [6.698072, 4.240594], [5.898172, 4.262453], [5.362174, 4.887971], 
              [5.033574, 5.611802], [4.325607, 6.270651], [3.574367, 6.258295], 
              [2.69187, 6.258295], [2.69187, 13.594007]
            ]]
          }
        },
        {
          "type": "Feature", 
          "properties": { "name": "Ghana", "iso": "GHA" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [-3.24437, 11.20203], [1.060122, 11.20203], [1.060122, 10.460551], 
              [0.374884, 9.464466], [-0.50487, 8.677222], [-0.438308, 7.411688], 
              [-1.011, 6.644], [-1.464, 5.677], [-2.856, 4.913], [-3.24437, 4.913], 
              [-3.24437, 11.20203]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Ethiopia", "iso": "ETH" },
          "geometry": {
            "type": "Polygon", 
            "coordinates": [[
              [33.0, 14.5], [47.99, 14.5], [47.99, 8.0], [47.78, 8.003], [44.9636, 5.0017], 
              [43.66087, 4.95755], [42.12861, 4.23413], [41.85508, 3.91891], [38.51295, 3.50074], 
              [36.86623, 4.44785], [35.817235, 5.338232], [35.29771, 6.86447], [34.73115, 7.22595], 
              [33.2948, 7.71334], [32.95418, 7.78497], [33.0, 9.58], [33.0, 14.5]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Morocco", "iso": "MAR" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [-1.0, 35.7], [-2.16, 35.16], [-3.69, 35.39], [-4.85, 35.73], [-6.06, 35.84], 
              [-7.0, 35.0], [-8.67, 33.69], [-8.67, 32.0], [-9.41, 30.33], [-9.73, 29.38], 
              [-10.19, 28.84], [-11.4, 28.44], [-11.72, 27.51], [-12.0, 26.03], [-11.72, 25.0], 
              [-8.67, 25.88], [-6.83, 26.13], [-5.2, 26.5], [-1.0, 29.0], [-1.0, 35.7]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Egypt", "iso": "EGY" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [25.0, 31.5], [34.9, 31.5], [34.9, 29.5], [34.46, 29.5], [34.46, 28.45], 
              [34.79, 28.18], [34.9, 27.97], [34.9, 22.0], [25.0, 22.0], [25.0, 31.5]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Tanzania", "iso": "TZA" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [29.34, -1.13], [40.32, -1.13], [40.32, -5.0], [39.59, -10.9], [38.427, -11.285], 
              [37.82, -11.26], [37.47, -11.57], [36.775, -11.594], [36.514, -11.72], 
              [35.31364, -11.43986], [34.559989, -11.52002], [34.28, -10.16], [33.94, -9.69], 
              [33.73, -9.42], [32.759375, -9.23059], [32.191, -8.93], [31.55, -8.76], 
              [31.16, -8.59], [30.74, -8.34], [30.2, -7.08], [29.62, -6.52], [29.42, -5.94], 
              [29.25, -5.4], [29.34, -4.49], [29.34, -1.13]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Botswana", "iso": "BWA" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [20.0, -17.78], [29.43, -17.78], [29.43, -22.09], [28.02, -22.84], 
              [27.11, -23.57], [26.78, -24.24], [26.44, -24.61], [25.94, -24.7], 
              [25.65, -25.49], [25.66, -25.49], [20.0, -25.49], [20.0, -17.78]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Zambia", "iso": "ZMB" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [22.0, -8.2], [33.64, -8.2], [33.64, -9.4], [33.21, -9.68], [32.95, -10.05], 
              [32.69, -10.44], [32.0, -11.74], [30.74, -12.0], [30.34, -12.61], [28.93, -13.25], 
              [28.46, -13.78], [27.72, -13.81], [27.0, -14.5], [26.17, -14.93], [25.26, -14.86], 
              [24.21, -15.47], [23.73, -15.78], [23.0, -16.18], [22.0, -16.9], [22.0, -8.2]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Senegal", "iso": "SEN" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [-17.1, 16.3], [-11.3, 16.3], [-11.3, 15.0], [-12.17, 14.62], 
              [-12.83, 13.63], [-13.44, 12.84], [-13.72, 12.59], [-15.13, 12.33], 
              [-15.5, 12.0], [-16.71, 12.38], [-17.1, 12.34], [-17.1, 16.3]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Rwanda", "iso": "RWA" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [28.86, -1.13], [30.9, -1.13], [30.9, -2.84], [30.47, -2.42], 
              [29.94, -2.35], [29.63, -2.92], [29.02, -2.84], [28.86, -2.31], [28.86, -1.13]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Madagascar", "iso": "MDG" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [43.25, -12.04], [50.48, -12.04], [50.48, -15.26], [50.38, -16.0], 
              [49.61, -17.31], [49.81, -18.98], [49.72, -19.4], [49.17, -20.06], 
              [48.69, -20.49], [47.93, -22.39], [47.55, -24.33], [47.1, -24.71], 
              [45.41, -25.6], [44.83, -25.35], [43.69, -24.54], [43.25, -23.58], 
              [43.32, -22.78], [43.89, -21.16], [43.896, -20.308], [44.374, -19.435], 
              [44.464, -18.956], [43.896, -17.964], [43.734, -17.409], [43.25, -16.0], 
              [43.25, -12.04]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Algeria", "iso": "DZA" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [-8.67, 36.0], [12.0, 36.0], [12.0, 23.0], [11.0, 23.0], [9.0, 21.0], 
              [8.0, 19.0], [5.67, 19.0], [2.0, 19.0], [-2.0, 21.0], [-8.67, 27.0], [-8.67, 36.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Libya", "iso": "LBY" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [12.0, 33.0], [25.0, 33.0], [25.0, 19.5], [23.0, 20.0], [20.0, 21.0], 
              [17.0, 21.0], [15.0, 22.0], [12.0, 23.0], [12.0, 33.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Sudan", "iso": "SDN" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [25.0, 22.0], [39.0, 22.0], [39.0, 8.5], [35.0, 9.0], [33.0, 9.5], 
              [29.0, 9.5], [25.0, 12.0], [25.0, 22.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Chad", "iso": "TCD" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [13.0, 23.0], [24.0, 23.0], [24.0, 7.5], [18.0, 7.5], [15.0, 8.0], 
              [13.0, 10.0], [13.0, 23.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Niger", "iso": "NER" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [0.0, 23.0], [16.0, 23.0], [16.0, 11.0], [12.0, 11.0], [4.0, 13.0], 
              [1.0, 15.0], [0.0, 16.0], [0.0, 23.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Mali", "iso": "MLI" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [-12.0, 25.0], [4.0, 25.0], [4.0, 10.0], [0.0, 11.0], [-5.0, 11.0], 
              [-7.5, 12.5], [-12.0, 14.0], [-12.0, 25.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Burkina Faso", "iso": "BFA" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [-5.5, 15.0], [2.0, 15.0], [2.0, 9.5], [-2.0, 9.5], [-5.5, 11.0], [-5.5, 15.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Ivory Coast", "iso": "CIV" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [-8.6, 10.5], [-2.5, 10.5], [-2.5, 4.0], [-7.5, 4.0], [-8.6, 5.5], [-8.6, 10.5]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Guinea", "iso": "GIN" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [-15.0, 12.5], [-7.5, 12.5], [-7.5, 7.0], [-11.0, 7.0], [-15.0, 9.0], [-15.0, 12.5]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Cameroon", "iso": "CMR" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [8.5, 13.0], [16.0, 13.0], [16.0, 1.5], [11.0, 2.0], [8.5, 4.0], [8.5, 13.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Central African Republic", "iso": "CAF" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [14.0, 11.0], [27.0, 11.0], [27.0, 2.0], [18.0, 2.0], [14.0, 4.0], [14.0, 11.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Democratic Republic of Congo", "iso": "COD" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [12.0, 4.0], [31.0, 4.0], [31.0, -13.0], [25.0, -13.0], [18.0, -9.0], 
              [12.0, -5.0], [12.0, 4.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Angola", "iso": "AGO" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [11.5, -4.5], [24.0, -4.5], [24.0, -18.0], [16.0, -18.0], [11.5, -13.0], [11.5, -4.5]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Namibia", "iso": "NAM" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [11.5, -17.0], [25.0, -17.0], [25.0, -29.0], [16.5, -29.0], [11.5, -22.0], [11.5, -17.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Zimbabwe", "iso": "ZWE" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [25.0, -15.5], [33.0, -15.5], [33.0, -22.5], [25.0, -22.5], [25.0, -15.5]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Mozambique", "iso": "MOZ" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [30.0, -10.0], [41.0, -10.0], [41.0, -27.0], [32.0, -27.0], [30.0, -22.0], [30.0, -10.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Uganda", "iso": "UGA" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [29.5, 4.0], [35.0, 4.0], [35.0, -1.5], [29.5, -1.5], [29.5, 4.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Somalia", "iso": "SOM" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [41.0, 12.0], [51.0, 12.0], [51.0, -1.5], [41.0, -1.5], [41.0, 12.0]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Tunisia", "iso": "TUN" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [7.5, 37.5], [12.0, 37.5], [12.0, 30.0], [7.5, 30.0], [7.5, 37.5]
            ]]
          }
        }
      ]
    };

    // Create proper heatmap color scale
    const dataValues = countryData?.map(d => d.totalCredits) || [];
    const minValue = Math.min(...dataValues);
    const maxValue = Math.max(...dataValues);
    
    // Professional heatmap colors: light to dark blue
    const colorScale = d3.scaleSequential()
      .domain([minValue, maxValue])
      .interpolator(d3.interpolateBlues);

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Add background for the map (remove green background)
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent");

    // Draw Africa countries
    svg.selectAll("path")
      .data(africaCountries.features)
      .enter()
      .append("path")
      .attr("d", path as any)
      .attr("fill", (d: any) => {
        const countryInfo = countryData?.find(c => c.country === d.properties.name);
        if (countryInfo) {
          return colorScale(countryInfo.totalCredits);
        } else {
          // Countries with no data are transparent/light gray
          return "#f8f9fa";
        }
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.5)
      .style("cursor", (d: any) => {
        const countryInfo = countryData?.find(c => c.country === d.properties.name);
        return countryInfo ? "pointer" : "default";
      })
      .on("click", (event, d: any) => {
        const countryInfo = countryData?.find(c => c.country === d.properties.name);
        if (countryInfo) {
          onCountryClick?.(d.properties.name);
        }
      })
      .on("mouseover", function(event, d: any) {
        const countryInfo = countryData?.find(c => c.country === d.properties.name);
        
        if (countryInfo) {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("stroke", "#374151")
            .attr("stroke-width", 2);
          
          tooltip
            .style("visibility", "visible")
            .html(`
              <div class="bg-white border border-gray-300 rounded-lg p-3 shadow-lg text-gray-900">
                <p class="font-semibold text-lg">${countryInfo.country}</p>
                <p class="text-blue-600 text-sm">Credits: ${countryInfo.totalCredits.toLocaleString()}</p>
                <p class="text-gray-600 text-sm">Projects: ${countryInfo.activeProjects}</p>
              </div>
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        } else {
          // Show country name even if no data
          tooltip
            .style("visibility", "visible")
            .html(`
              <div class="bg-white border border-gray-300 rounded-lg p-3 shadow-lg text-gray-900">
                <p class="font-semibold">${d.properties.name}</p>
                <p class="text-gray-500 text-sm">No data available</p>
              </div>
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        }
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 0.5);
        
        tooltip.style("visibility", "hidden");
      });

    // No labels - keep it clean like Datawrapper

  }, [countryData, isLoading, onCountryClick]);

  if (isLoading) {
    return (
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-dark-800/30 rounded-lg border border-gray-700 animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 relative bg-transparent">
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 600 500"
              preserveAspectRatio="xMidYMid meet"
              style={{ background: "transparent" }}
            />
            
            {/* Tooltip container */}
            <div
              ref={tooltipRef}
              className="absolute pointer-events-none"
              style={{ visibility: "hidden", zIndex: 10 }}
            />
          </div>
          
          {/* Professional Color Legend like Datawrapper */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-400">{countryData && countryData.length > 0 ? Math.min(...countryData.map(d => d.totalCredits)).toLocaleString() : '0'}</span>
            <div className="flex">
              {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((i) => (
                <div
                  key={i}
                  className="w-6 h-4"
                  style={{
                    backgroundColor: d3.interpolateBlues(i)
                  }}
                />
              ))}
            </div>
            <span className="text-gray-400">{countryData && countryData.length > 0 ? Math.max(...countryData.map(d => d.totalCredits)).toLocaleString() : '0'}</span>
          </div>
          
          {/* Top Countries List */}
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Top Countries by Credits</h4>
            {countryData?.slice(0, 5).map((country, index) => (
              <motion.div
                key={country.country}
                className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-800/50 rounded p-2 transition-colors"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onCountryClick?.(country.country)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 w-4">{index + 1}</span>
                  <span className="text-gray-300">{country.country}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 text-xs">{country.activeProjects} projects</span>
                  <span className="text-white font-medium">{country.totalCredits.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}