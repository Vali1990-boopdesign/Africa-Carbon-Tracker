import { AfricaChoropleth } from "@/components/AfricaChoropleth";

// Test data that matches your current dashboard data structure
const testData = [
  { country: "South Africa", totalCredits: 24500, activeProjects: 3 },
  { country: "Kenya", totalCredits: 18750, activeProjects: 2 },
  { country: "Nigeria", totalCredits: 32100, activeProjects: 4 },
  { country: "Ghana", totalCredits: 15500, activeProjects: 2 },
  { country: "Ethiopia", totalCredits: 41200, activeProjects: 5 },
  { country: "Morocco", totalCredits: 28300, activeProjects: 3 },
  { country: "Egypt", totalCredits: 9600, activeProjects: 1 }
];

export default function ChoroplethTest() {
  const handleCountryClick = (country: string) => {
    console.log("Clicked country:", country);
    alert(`Clicked: ${country}`);
  };

  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#f8f9fa", 
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ color: "#333", marginBottom: "20px" }}>
        Africa Choropleth Map Test
      </h1>
      
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Testing the choropleth map component independently. Countries with data should appear in blue shades.
      </p>

      <div style={{ 
        backgroundColor: "white", 
        padding: "20px", 
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <AfricaChoropleth 
          data={testData}
          width={700}
          height={500}
          onCountryClick={handleCountryClick}
        />
      </div>

      <div style={{ marginTop: "20px", color: "#666" }}>
        <h3>Test Data:</h3>
        <ul>
          {testData.map(item => (
            <li key={item.country}>
              <strong>{item.country}</strong>: {item.totalCredits.toLocaleString()} credits, {item.activeProjects} projects
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}