import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface AfricaChoroplethProps {
  data?: Array<{ country: string; totalCredits: number; activeProjects: number }>;
  width?: number;
  height?: number;
  onCountryClick?: (country: string) => void;
}

export function AfricaChoropleth({ 
  data = [], 
  width = 600, 
  height = 400, 
  onCountryClick 
}: AfricaChoroplethProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create data map for fast lookups (similar to D3 Gallery example)
    const dataMap = new Map(data.map(d => [d.country, d.totalCredits]));

    // Map projection - Mercator centered on Africa (like the example)
    const projection = d3.geoMercator()
      .scale(300)
      .center([20, 0])  // Center on Africa
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Color scale with threshold (like D3 Gallery example)
    const colorScale = d3.scaleThreshold<number, string>()
      .domain([5000, 10000, 20000, 30000, 40000])
      .range(d3.schemeBlues[6]);

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Africa GeoJSON data - using more accurate coordinates
    const africaGeoJSON = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": { "name": "South Africa" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [31.521001, -29.257388], [31.325561, -29.401978], [30.901763, -29.909957],
              [30.622813, -30.423776], [30.055716, -31.140269], [28.926299, -32.172041],
              [28.21946, -32.771953], [27.464608, -33.226964], [26.419678, -33.615998],
              [25.909664, -33.66704], [25.780628, -33.944646], [25.172862, -33.796851],
              [24.677853, -33.987176], [23.594043, -33.794474], [22.988189, -33.916431],
              [22.574157, -33.864083], [21.542799, -34.258839], [20.689053, -34.417175],
              [20.071261, -34.795137], [18.855315, -34.444306], [18.424643, -33.997873],
              [18.377411, -34.136521], [18.244499, -33.867752], [18.25008, -33.281431],
              [17.925190, -32.611291], [18.248032, -32.429963], [18.221762, -31.661633],
              [17.566918, -30.725721], [17.064416, -29.875954], [16.344977, -28.576705],
              [16.824017, -28.082162], [17.218929, -28.355943], [17.387497, -28.783514],
              [31.521001, -29.257388]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Kenya" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [40.99300, 5.50600], [41.58513, 3.91891], [41.81736, 3.91961],
              [40.76848, 4.25788], [39.85990, 3.42240], [39.56025, 2.89040],
              [38.79845, 1.41013], [37.76690, 0.16718], [37.69869, -0.25612],
              [36.15908, -1.13439], [34.59607, -1.17623], [34.04739, -0.51945],
              [33.90371, 0.10981], [33.89, 0.23], [33.98162, 0.75],
              [34.17761, 1.17694], [34.6793, 1.17694], [35.03599, 1.90584],
              [34.67930, 2.50111], [34.25032, 3.56161], [34.62218, 4.84628],
              [35.29771, 5.50668], [40.99300, 5.50600]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Nigeria" },
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
          "properties": { "name": "Ghana" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [1.060122, 11.009819], [0.374884, 10.191343], [0.057504, 9.456006],
              [-0.50487, 8.677222], [-0.438308, 7.411688], [-1.011, 6.64],
              [-1.464, 5.677], [-2.856, 4.913], [-3.24437, 4.913],
              [-3.245098, 4.913], [-3.183578, 5.478], [-2.755799, 5.988],
              [-2.617826, 6.67845], [-2.958359, 7.63502], [-2.84956, 8.132226],
              [-2.815708, 9.64509], [-2.966159, 10.395643], [-2.940696, 10.96248],
              [-1.203043, 11.009819], [-0.43831, 11.009819], [1.060122, 11.009819]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Ethiopia" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [37.90607, 14.95943], [38.51295, 14.50074], [39.09550, 14.74494],
              [39.54360, 14.36775], [40.77479, 14.11786], [41.17509, 13.92788],
              [41.85508, 13.91891], [42.31707, 12.51308], [42.55876, 12.09871],
              [43.29699, 11.42627], [44.05228, 10.44296], [44.06062, 9.17766],
              [43.52865, 8.68456], [43.29699, 8.35458], [42.55876, 7.99217],
              [42.31707, 7.65548], [41.85508, 7.524912], [41.73864, 7.411156],
              [40.78515, 7.11055], [39.85999, 6.84062], [39.01021, 5.17251],
              [38.51295, 4.70074], [38.11741, 4.23621], [37.59377, 3.59851],
              [36.86623, 4.44785], [36.42951, 4.59791], [35.29771, 5.50668],
              [34.70702, 6.59422], [34.25032, 6.82607], [33.56829, 7.71334],
              [32.95418, 7.78497], [33.29048, 9.58], [33.90645, 9.93002],
              [34.25717, 10.63009], [34.73115, 10.910149], [35.26049, 12.08286],
              [35.86363, 12.57828], [36.27022, 13.56324], [36.42951, 13.93148],
              [37.59377, 14.21099], [37.90607, 14.95943]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Morocco" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [-1.03734, 35.62363], [-2.16048, 35.16000], [-3.69042, 35.39019],
              [-4.85956, 35.73044], [-6.064142, 35.83770], [-7.059212, 35.00154],
              [-8.67439, 33.69043], [-8.68439, 32.59970], [-9.413036, 30.32848],
              [-9.735343, 29.37863], [-10.189925, 28.841], [-11.409478, 28.44312],
              [-11.71879, 27.51043], [-12.0, 26.030], [-11.71879, 25.0],
              [-8.674, 25.88], [-6.83, 26.13], [-5.2, 26.5], [-4.85956, 27.73044],
              [-3.69042, 28.39019], [-2.16048, 29.16000], [-1.03734, 30.62363],
              [-1.03734, 35.62363]
            ]]
          }
        },
        {
          "type": "Feature",
          "properties": { "name": "Egypt" },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [34.92333, 29.50133], [34.26401, 28.86036], [34.15785, 28.44312],
              [33.92136, 28.14758], [33.73095, 27.69327], [33.54678, 27.53866],
              [33.13509, 27.11939], [32.42808, 31.24059], [31.24556, 31.67795],
              [30.09644, 31.47316], [28.16555, 31.57853], [26.49593, 31.58568],
              [25.16482, 31.56915], [25.16389, 31.56915], [25.26404, 31.38013],
              [25.11336, 30.78847], [24.70007, 30.04419], [24.95762, 29.31626],
              [24.80287, 28.69374], [24.79659, 28.69199], [25.17227, 25.08549],
              [25.11336, 22.00], [36.86623, 22.00], [37.00001, 22.00075],
              [36.99983, 31.56641], [34.92333, 29.50133]
            ]]
          }
        }
      ]
    };

    // Mouse events (similar to D3 Gallery example)
    const mouseOver = function(this: SVGPathElement, event: any, d: any) {
      // Fade other countries
      d3.selectAll(".country")
        .transition()
        .duration(200)
        .style("opacity", 0.5);
      
      // Highlight current country
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "#000")
        .style("stroke-width", 2);

      // Show tooltip
      const countryData = data.find(c => c.country === d.properties.name);
      if (countryData) {
        tooltip
          .style("visibility", "visible")
          .html(`
            <div style="background: white; border: 1px solid #ccc; padding: 8px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              <strong>${countryData.country}</strong><br/>
              Credits: ${countryData.totalCredits.toLocaleString()}<br/>
              Projects: ${countryData.activeProjects}
            </div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      }
    };

    const mouseLeave = function(this: SVGPathElement) {
      // Restore all countries
      d3.selectAll(".country")
        .transition()
        .duration(200)
        .style("opacity", 0.8);
      
      d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "white")
        .style("stroke-width", 1);

      // Hide tooltip
      tooltip.style("visibility", "hidden");
    };

    // Draw the map (following D3 Gallery pattern)
    svg.append("g")
      .selectAll("path")
      .data(africaGeoJSON.features)
      .enter()
      .append("path")
      .attr("d", path as any)
      .attr("fill", function(d: any) {
        const countryCredits = dataMap.get(d.properties.name) || 0;
        return countryCredits > 0 ? colorScale(countryCredits) : "#f5f5f5";
      })
      .style("stroke", "white")
      .style("stroke-width", 1)
      .attr("class", "country")
      .style("opacity", 0.8)
      .style("cursor", "pointer")
      .on("mouseover", mouseOver)
      .on("mouseleave", mouseLeave)
      .on("click", function(event, d: any) {
        if (onCountryClick) {
          onCountryClick(d.properties.name);
        }
      });

  }, [data, width, height, onCountryClick]);

  return (
    <div style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: "1px solid #ccc", backgroundColor: "white" }}
      />
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: 10
        }}
      />
    </div>
  );
}