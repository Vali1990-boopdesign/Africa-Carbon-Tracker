import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface CountryData {
  country: string;
  totalCredits: number;
  activeProjects: number;
}

interface AfricaChoroplethWithTabsProps {
  data?: CountryData[];
  isLoading: boolean;
  onCountryClick?: (country: string) => void;
}

export function AfricaChoroplethWithTabs({ 
  data = [], 
  isLoading, 
  onCountryClick 
}: AfricaChoroplethWithTabsProps) {
  const creditsSvgRef = useRef<SVGSVGElement>(null);
  const projectsSvgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("credits");

  // Complete Africa GeoJSON data matching your database countries
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
            [33.908859, -0.95], [34.177401, -0.516222], [34.671264, -0.024928],
            [35.817447, 0.514581], [36.158200, 1.718555], [37.908859, 3.616267],
            [39.570158, 3.854870], [40.769230, 4.257422], [41.855083, 3.918911],
            [41.817359, 3.477735], [41.375115, 3.050926], [40.767551, 2.306505],
            [40.483307, 1.575784], [40.264622, 1.065946], [40.120766, 0.494052],
            [39.804701, -0.122400], [39.200821, -0.411686], [38.508847, -0.406296],
            [37.906193, -0.639376], [37.104905, -0.982606], [36.512820, -1.283374],
            [35.817447, -1.540095], [35.038467, -1.650305], [34.600600, -1.906052],
            [34.259517, -2.215306], [34.003159, -2.513214], [33.908859, -0.95]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": { "name": "Nigeria" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [2.676932, 6.258626], [3.324307, 6.265848], [3.574965, 6.256991],
            [4.279050, 6.284065], [4.606418, 6.506264], [5.509763, 6.454830],
            [6.698074, 6.493015], [7.493322, 6.455590], [8.502632, 5.399644],
            [8.926508, 4.991568], [9.014933, 4.231693], [9.552307, 3.997305],
            [10.118277, 3.851367], [10.809850, 3.613262], [11.431481, 3.302205],
            [12.063678, 3.046906], [12.629072, 2.830940], [13.067903, 2.470658],
            [13.908859, 2.157421], [14.415379, 2.547988], [14.966061, 4.210124],
            [14.577177, 4.970560], [14.181336, 5.524797], [13.572949, 6.314991],
            [13.308953, 6.777788], [12.951234, 7.798646], [12.344036, 8.433962],
            [11.685058, 9.234285], [10.999514, 9.682658], [10.458422, 10.282013],
            [9.948230, 10.889890], [9.509766, 11.527479], [8.926508, 12.295567],
            [2.676932, 6.258626]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": { "name": "Ghana" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [-3.276569, 4.928], [-2.962914, 5.171834], [-2.504364, 5.199397],
            [-1.956299, 5.167077], [-1.503429, 5.328344], [-1.062043, 5.439189],
            [-0.508474, 5.441022], [0.074452, 5.484090], [0.358635, 5.812881],
            [0.494632, 6.452955], [0.713894, 6.821097], [0.727886, 7.400793],
            [0.663524, 8.084174], [0.486133, 8.577799], [0.235590, 9.124045],
            [-0.055227, 9.544692], [-0.279430, 10.222727], [-0.718579, 10.709491],
            [-1.205513, 11.009819], [-2.827606, 10.962688], [-2.963898, 10.395994],
            [-3.218991, 9.445674], [-3.191928, 9.024928], [-2.907000, 8.602372],
            [-3.243216, 6.250466], [-3.276569, 4.928]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": { "name": "Ethiopia" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [32.958984, 3.726166], [33.963678, 4.248366], [34.598860, 4.769231],
            [35.817447, 5.338232], [36.158200, 4.449785], [37.908859, 4.616267],
            [39.570158, 3.854870], [40.769230, 4.257422], [41.855083, 3.918911],
            [42.817359, 4.234235], [43.375115, 3.050926], [44.767551, 2.306505],
            [47.483307, 8.575784], [47.264622, 9.065946], [46.120766, 10.494052],
            [47.804701, 14.122400], [46.200821, 15.411686], [43.508847, 14.406296],
            [41.906193, 12.639376], [40.104905, 11.982606], [38.512820, 10.283374],
            [36.817447, 9.540095], [35.038467, 8.650305], [34.600600, 7.906052],
            [34.259517, 7.215306], [34.003159, 6.513214], [32.958984, 3.726166]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": { "name": "Morocco" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [-1.038525, 35.166667], [-2.169011, 35.168337], [-3.649509, 35.399987],
            [-4.859900, 35.730195], [-5.242564, 36.115147], [-5.848688, 35.950056],
            [-6.262825, 35.110481], [-7.059252, 35.388381], [-8.684390, 35.474574],
            [-8.687743, 27.395744], [-8.684390, 27.395744], [-11.969460, 28.038415],
            [-13.133475, 27.656426], [-13.138313, 27.640065], [-12.500962, 24.770116],
            [-12.030457, 24.694145], [-11.718513, 24.134222], [-11.392554, 23.691009],
            [-10.551262, 22.895284], [-9.970703, 21.995120], [-8.986956, 21.550327],
            [-8.572217, 21.565660], [-8.684390, 22.395744], [-4.928879, 24.974816],
            [-3.649509, 26.399987], [-1.038525, 35.166667]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": { "name": "Egypt" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [24.698771, 22.000000], [25.000000, 22.000000], [25.000000, 20.000000],
            [33.000000, 20.000000], [34.000000, 20.000000], [36.866669, 22.000000],
            [35.699986, 23.926315], [35.513237, 24.097370], [34.795612, 24.696598],
            [34.262806, 25.605165], [33.013742, 27.374226], [32.32116, 29.760650],
            [32.73482, 30.154709], [32.915319, 31.040696], [34.26, 31.219306],
            [34.91992, 29.50074], [34.262806, 27.605165], [32.42951, 25.605165],
            [25.162792, 25.605165], [24.698771, 22.000000]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": { "name": "Zambia" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [24.082661, -17.353411], [25.084443, -17.661816], [25.314086, -18.016746],
            [26.553088, -19.188165], [27.760613, -20.031645], [28.734867, -19.871845],
            [29.564765, -19.52807], [30.274002, -19.032755], [30.740492, -18.25651],
            [31.191409, -16.794504], [31.556665, -16.070834], [32.191691, -15.937304],
            [32.688789, -16.390816], [33.230163, -16.746801], [33.485519, -17.638877],
            [33.314926, -18.664075], [32.835689, -19.715592], [32.654645, -20.516681],
            [32.512939, -21.116119], [31.984072, -21.852741], [31.193609, -22.253311],
            [30.659865, -22.151567], [30.276307, -21.773316], [29.739342, -21.79895],
            [29.432188, -22.091314], [28.794978, -21.639833], [28.020715, -21.485226],
            [27.727755, -20.499059], [27.727755, -20.449425], [26.999261, -19.472234],
            [26.423203, -18.956187], [25.902231, -18.531391], [25.314086, -18.016746],
            [24.082661, -17.353411]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": { "name": "Tanzania" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [33.903711, -0.95], [34.177401, -1.516222], [34.671264, -2.024928],
            [35.817447, -2.514581], [36.158200, -3.718555], [37.908859, -4.616267],
            [39.570158, -5.854870], [40.769230, -6.257422], [40.319722, -7.918911],
            [40.487822, -9.477735], [39.521701, -10.050926], [38.714905, -11.982606],
            [37.912820, -12.283374], [36.817447, -13.540095], [35.038467, -11.650305],
            [34.600600, -10.906052], [33.259517, -9.215306], [32.003159, -8.513214],
            [31.958984, -7.726166], [30.963678, -6.248366], [30.598860, -5.769231],
            [29.817447, -4.338232], [29.158200, -3.449785], [29.908859, -2.616267],
            [30.570158, -1.854870], [33.903711, -0.95]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": { "name": "Botswana" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [24.082661, -17.353411], [25.314086, -18.016746], [25.902231, -18.531391],
            [26.423203, -18.956187], [26.999261, -19.472234], [27.727755, -20.449425],
            [27.727755, -20.499059], [28.020715, -21.485226], [28.794978, -21.639833],
            [29.432188, -22.091314], [29.739342, -21.79895], [30.276307, -21.773316],
            [30.659865, -22.151567], [29.432188, -24.091314], [28.020715, -25.485226],
            [26.423203, -25.956187], [25.314086, -25.016746], [24.082661, -24.353411],
            [22.082661, -23.353411], [20.082661, -22.353411], [20.082661, -18.353411],
            [24.082661, -17.353411]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": { "name": "Senegal" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [-17.625042, 14.627501], [-17.185173, 14.919477], [-16.713729, 15.621527],
            [-16.314787, 16.066585], [-15.686731, 16.068906], [-15.081735, 16.847877],
            [-14.582471, 16.598264], [-14.099521, 16.304302], [-13.435738, 16.039383],
            [-12.830658, 15.686731], [-12.170750, 14.616834], [-12.124887, 13.994727],
            [-11.927716, 12.718282], [-12.035280, 12.463652], [-12.547963, 12.332089],
            [-13.217818, 12.575874], [-14.582471, 13.598264], [-15.686731, 13.068906],
            [-16.314787, 13.566585], [-16.713729, 14.121527], [-17.185173, 14.419477],
            [-17.625042, 14.627501]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": { "name": "Rwanda" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [30.419104, -1.134659], [30.816135, -1.698914], [30.758309, -2.287823],
            [30.469696, -2.413858], [29.938159, -2.348485], [29.632176, -2.917857],
            [29.024393, -2.839257], [29.291887, -2.343893], [29.579466, -1.341313],
            [29.821518, -1.443823], [30.419104, -1.134659]
          ]]
        }
      },
      {
        "type": "Feature",
        "properties": { "name": "Madagascar" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [49.543519, -12.469833], [50.056510, -13.555761], [50.217431, -14.758789],
            [50.476537, -15.226512], [50.377111, -15.706069], [50.200275, -16.000263],
            [49.860605, -15.414252], [49.672606, -15.710152], [49.863344, -16.451036],
            [49.774564, -16.875042], [49.498612, -17.106035], [49.435618, -17.953064],
            [49.041792, -19.118781], [48.548540, -20.496888], [47.930749, -22.391501],
            [47.547723, -23.781958], [47.095761, -24.941629], [46.282477, -25.178463],
            [45.409508, -25.601434], [44.833574, -25.346101], [44.039720, -24.988345],
            [43.763767, -24.460608], [43.697777, -23.574116], [43.345654, -22.776903],
            [43.254187, -22.057413], [43.433876, -21.336475], [43.893682, -21.16389],
            [44.374325, -20.072046], [44.464397, -19.435454], [44.232673, -18.961994],
            [44.042976, -18.331387], [43.963084, -17.409944], [44.312468, -16.850495],
            [44.446457, -16.216219], [44.944936, -16.179375], [45.502731, -15.974373],
            [45.872993, -15.793454], [46.312174, -15.780018], [46.882183, -15.210182],
            [47.705129, -14.594302], [48.005764, -14.091978], [47.869047, -13.663868],
            [48.298574, -13.784067], [48.845589, -13.089174], [49.197298, -12.040557],
            [49.543519, -12.469833]
          ]]
        }
      }
    ]
  };

  // Function to render the map for a specific metric
  const renderMap = (svgElement: SVGSVGElement, metric: "credits" | "projects") => {
    if (!svgElement || !data || data.length === 0) return;

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    const width = 500;
    const height = 400;

    // Create data map for fast lookups
    const dataMap = new Map(data.map(d => [d.country, {
      credits: d.totalCredits,
      projects: d.activeProjects
    }]));

    // Map projection - Mercator centered on Africa
    const projection = d3.geoMercator()
      .scale(280)
      .center([20, 0])
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Color scales
    const creditsColorScale = d3.scaleThreshold<number, string>()
      .domain([5000, 15000, 25000, 35000])
      .range(d3.schemeBlues[5]);

    const projectsColorScale = d3.scaleThreshold<number, string>()
      .domain([1, 2, 3, 4])
      .range(d3.schemeGreens[5]);

    const currentColorScale = metric === "credits" ? creditsColorScale : projectsColorScale;

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000");

    // Mouse events
    const mouseOver = function(this: SVGPathElement, event: any, d: any) {
      d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", 0.5);
      
      d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "#000")
        .style("stroke-width", 2);

      const countryData = dataMap.get(d.properties.name);
      if (countryData) {
        const value = metric === "credits" ? countryData.credits : countryData.projects;
        const unit = metric === "credits" ? "credits" : "projects";
        
        tooltip.style("visibility", "visible")
          .html(`
            <div style="font-weight: bold; margin-bottom: 4px;">${d.properties.name}</div>
            <div>${value.toLocaleString()} ${unit}</div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      }
    };

    const mouseLeave = function(this: SVGPathElement) {
      d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", 0.8);
      
      d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "white")
        .style("stroke-width", 1);

      tooltip.style("visibility", "hidden");
    };

    // Draw the map
    svg.append("g")
      .selectAll("path")
      .data(africaGeoJSON.features)
      .enter()
      .append("path")
      .attr("d", path as any)
      .attr("fill", function(d: any) {
        const countryData = dataMap.get(d.properties.name);
        if (!countryData) return "#f0f0f0";
        
        const value = metric === "credits" ? countryData.credits : countryData.projects;
        return currentColorScale(value);
      })
      .style("stroke", "white")
      .style("stroke-width", 1)
      .attr("class", "Country")
      .style("opacity", 0.8)
      .style("cursor", "pointer")
      .on("mouseover", mouseOver)
      .on("mouseleave", mouseLeave)
      .on("click", function(event, d: any) {
        if (onCountryClick) {
          onCountryClick(d.properties.name);
        }
      });
  };

  // Single useEffect to handle both tabs
  useEffect(() => {
    if (isLoading || !data || data.length === 0) return;

    if (activeTab === "credits" && creditsSvgRef.current) {
      renderMap(creditsSvgRef.current, "credits");
    } else if (activeTab === "projects" && projectsSvgRef.current) {
      renderMap(projectsSvgRef.current, "projects");
    }
  }, [data, isLoading, activeTab]);

  if (isLoading) {
    return (
      <Card className="h-fit glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Africa Carbon Credits Map
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
            Africa Carbon Credits Map
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {data.length} Countries
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="credits" className="text-sm">
              Carbon Credits
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-sm">
              Active Projects
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="credits" className="space-y-2">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Total Carbon Credits by Country
              </p>
              <div className="relative">
                <svg
                  ref={creditsSvgRef}
                  width={500}
                  height={400}
                  className="border rounded-lg bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-700"
                />
                <div
                  ref={tooltipRef}
                  className="absolute pointer-events-none"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-2">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Active Projects by Country
              </p>
              <div className="relative">
                <svg
                  ref={projectsSvgRef}
                  width={500}
                  height={400}
                  className="border rounded-lg bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-700"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}