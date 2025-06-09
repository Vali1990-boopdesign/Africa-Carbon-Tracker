import type { Transaction } from "@shared/schema";

export function exportToCSV(data: Transaction[], filename: string = "carbon_credits_data.csv") {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Define CSV headers
  const headers = [
    "Registry ID",
    "Project Name", 
    "Country",
    "Continent",
    "Region",
    "Scope",
    "Type",
    "Reduction/Removal",
    "Retirement Year",
    "Credits Retired",
    "Retirement Reason",
    "Buyer Brand Name",
    "Buyer Classification",
    "Buyer Sector",
    "Buyer HQ Location",
    "Buyer HQ Region"
  ];

  // Convert data to CSV format
  const csvContent = [
    headers.join(","),
    ...data.map(row => [
      `"${row.registryId || ""}"`,
      `"${row.projectName || ""}"`,
      `"${row.country || ""}"`,
      `"${row.continent || ""}"`,
      `"${row.region || ""}"`,
      `"${row.scope || ""}"`,
      `"${row.type || ""}"`,
      `"${row.reductionRemoval || ""}"`,
      `"${row.retirementYear || ""}"`,
      `"${row.creditsRetired || ""}"`,
      `"${row.retirementReason || ""}"`,
      `"${row.buyerBrandName || ""}"`,
      `"${row.buyerClassification || ""}"`,
      `"${row.buyerSector || ""}"`,
      `"${row.buyerHQLocation || ""}"`,
      `"${row.buyerHQRegion || ""}"`
    ].join(","))
  ].join("\n");

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportFilteredData(data: Transaction[], filters: any) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filterSuffix = filters.country ? `_${filters.country}` : "";
  const filename = `africa_carbon_credits_${timestamp}${filterSuffix}.csv`;
  exportToCSV(data, filename);
}