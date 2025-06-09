
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as d3 from "d3";
import { motion } from "framer-motion";
import type { CountryData } from "@shared/schema";

interface AfricaChoroplethProps {
  countryData?: CountryData[];
  isLoading: boolean;
  onCountryClick?: (country: string) => void;
}

export function AfricaChoropleth({ countryData, isLoading, onCountryClick }: AfricaChoroplethProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!countryData || isLoading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 500;

    // Proper Africa-focused projection for natural appearance
    const projection = d3.geoNaturalEarth1()
      .scale(400)
      .center([20, 0])
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Professional color scale like Datawrapper
    const colorScale = d3.scaleSequential()
      .domain([0, Math.max(...countryData.map(d => d.totalCredits))])
      .interpolator(d3.interpolateBlues);

    const tooltip = d3.select(tooltipRef.current);

    // Professional Africa GeoJSON with realistic country boundaries
    const africaCountries = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": { "name": "Algeria", "iso": "DZA" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [-8.68439, 27.39574], [-4.92899, 24.974], [-1.550342, 22.792], [2.128, 21.223], 
              [8.572, 21.565], [11.999, 23.471], [11.999, 32.639], [6.262, 36.866], 
              [2.169, 36.637], [-1.307, 35.617], [-2.177, 35.168], [-4.859, 35.73], 
              [-5.242, 36.115], [-7.059, 37.388], [-8.68439, 36.3], [-8.68439, 27.39574]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Nigeria", "iso": "NGA" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [2.69187, 13.594], [14.677982, 13.594], [14.677982, 12.624205], 
              [14.415379, 11.572369], [13.572949, 10.798566], [13.308598, 9.908497], 
              [12.753671, 8.717828], [12.218872, 7.798651], [11.745774, 6.980954], 
              [9.234243, 6.444408], [8.500288, 4.771982], [7.314932, 4.281103], 
              [6.698072, 4.240594], [5.898172, 4.262453], [5.362174, 4.887971], 
              [5.033574, 5.611802], [4.325607, 6.270651], [3.574367, 6.258295], 
              [2.69187, 6.258295], [2.69187, 13.594]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "South Africa", "iso": "ZAF" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [31.521, -29.257388], [31.325561, -29.401978], [30.901763, -29.909957],
              [30.622813, -30.423776], [30.055716, -31.140269], [28.926553, -32.172041],
              [28.21289, -32.771953], [27.464608, -33.226964], [26.419678, -33.615599],
              [25.909664, -33.66704], [25.78051, -33.944645], [25.172862, -33.796851],
              [24.677853, -33.987176], [23.594043, -33.794474], [22.988189, -33.916431],
              [22.574157, -33.864083], [21.542799, -34.258839], [20.689053, -34.417175],
              [20.071261, -34.795137], [19.616405, -34.819166], [19.193278, -34.462599],
              [18.855315, -34.444306], [18.424643, -33.997873], [18.377411, -34.136521],
              [18.244499, -33.867752], [18.25008, -33.281431], [17.92519, -32.611291],
              [18.248037, -32.429963], [18.221762, -31.661633], [17.566918, -30.725721],
              [17.064416, -29.875954], [17.062918, -29.875954], [16.344977, -28.576705],
              [16.824017, -28.082162], [17.218929, -28.355943], [17.387497, -28.783514],
              [17.836152, -28.856378], [18.464176, -29.045462], [19.002127, -28.972443],
              [19.894734, -28.461105], [19.895768, -24.767790], [20.165726, -24.917962],
              [20.758609, -25.868136], [20.66647, -26.477453], [20.889609, -26.828543],
              [21.605896, -26.726534], [22.105969, -26.280256], [22.579532, -25.979448],
              [22.824271, -25.500459], [23.312097, -25.26869], [23.73357, -25.390129],
              [24.211267, -25.670216], [25.025171, -25.71967], [25.664666, -25.486816],
              [25.765849, -25.174845], [25.941652, -24.696373], [26.485753, -24.616327],
              [26.786407, -24.240691], [27.119229, -23.574323], [28.017236, -22.827754],
              [29.432188, -22.091313], [29.839037, -22.102216], [30.322883, -22.271618],
              [30.659966, -22.151567], [31.191409, -22.25151], [31.670398, -23.658969],
              [31.930589, -24.369417], [31.752408, -25.484284], [31.837778, -25.843332],
              [31.333158, -25.660191], [31.044109, -25.731452], [30.949667, -26.022649],
              [30.676609, -26.398123], [30.685962, -26.743845], [31.282773, -27.285879],
              [31.86806, -27.177927], [32.071665, -26.73382], [32.83012, -26.742192],
              [32.580265, -27.470158], [32.462133, -28.301011], [32.203389, -28.752405],
              [31.521, -29.257388]
            ]]
          }
        }
      ]
    };

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
          return "transparent";
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
                <div class="font-semibold">${countryInfo.country}</div>
                <div class="text-sm text-gray-600">Credits: ${countryInfo.totalCredits.toLocaleString()}</div>
                <div class="text-sm text-gray-600">Projects: ${countryInfo.activeProjects}</div>
              </div>
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        }
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 0.5);
        
        tooltip.style("visibility", "hidden");
      });

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
          <CardTitle className="text-lg font-semibold text-white">Africa Choropleth Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 relative" style={{ backgroundColor: "transparent" }}>
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 600 500"
              preserveAspectRatio="xMidYMid meet"
              style={{ backgroundColor: "transparent" }}
            />
            
            <div
              ref={tooltipRef}
              className="absolute pointer-events-none"
              style={{ visibility: "hidden", zIndex: 10 }}
            />
          </div>
          
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
