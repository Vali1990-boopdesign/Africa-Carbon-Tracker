import React from "react";

// Test page is no longer needed since we removed the choropleth components
// This can be used for other testing purposes if needed

export default function ChoroplethTest() {
  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#f8f9fa", 
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ color: "#333", marginBottom: "20px" }}>
        Test Page
      </h1>

      <p style={{ color: "#666", marginBottom: "30px" }}>
        This test page is available for testing other components.
      </p>

      <div style={{ 
        backgroundColor: "white", 
        padding: "20px", 
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <p>Component testing area</p>
      </div>
    </div>
  );
}