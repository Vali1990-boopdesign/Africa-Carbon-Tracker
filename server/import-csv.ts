
import { db } from "./db";
import { transactions, buyerProfiles } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

interface RetirementCSVRow {
  "Registry ID": string;
  "Project Name": string;
  "Country": string;
  "Continent": string;
  "Region": string;
  "Scope": string;
  "Type": string;
  "Reduction / Removal": string;
  "Retirement Year": string;
  "Credits Retired": string;
  "Retirement Reason": string;
  "Buyer": string;
  "Buyer Brand Name": string;
  "Buyer Classification": string;
  "Buyer Sector": string;
  "Buyer HQ Location": string;
  "Buyer HQ Region": string;
  "Buying Quantities": string;
}

interface BuyerProfileCSVRow {
  "Brand Names": string;
  "Buyer Classification": string;
  "Buyer Sector": string;
  "Buyer HQ Location": string;
  "Buyer HQ Region": string;
  "Cum. Retirements": string;
  "Cum. Share, %": string;
  "Last 5 Years Retirements": string;
  "Last 5 Years Share, %": string;
  "2019": string;
  "2020": string;
  "2021": string;
  "2022": string;
  "2023": string;
  "2024": string;
  "Repeat Tx count": string;
  "Average purchase per year": string;
  "Last 2 Years Purchases": string;
  "Purchases before Last 2 Years": string;
  "Last 2 Years gain vs prior": string;
}

interface BilateralCSVRow {
  "African Country": string;
  "Bi-lateral Partner Countries": string;
  "Source 1": string;
  "Source 2": string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function cleanNumericValue(value: string): number {
  if (!value || value === '' || value === 'N/A') return 0;
  // Remove commas, quotes, and other non-numeric characters except decimal points and negative signs
  const cleaned = value.replace(/[",]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export async function importCSVData() {
  try {
    console.log("Starting CSV import...");
    
    // Clear existing data
    await db.delete(transactions);
    await db.delete(buyerProfiles);
    console.log("Cleared existing data");
    
    // Import retirement data
    const retirementsPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Africa_Retirements_2024_=10_1749467889713.csv");
    if (fs.existsSync(retirementsPath)) {
      await importRetirementData(retirementsPath);
    }
    
    // Import buyer profiles
    const buyerProfilesPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Update_Buyer Profilesv24_1749467889714.csv");
    if (fs.existsSync(buyerProfilesPath)) {
      await importBuyerProfileData(buyerProfilesPath);
    }
    
    console.log("✅ CSV import completed!");
    
  } catch (error) {
    console.error("❌ CSV import failed:", error);
    throw error;
  }
}

async function importRetirementData(csvPath: string) {
  console.log("Importing retirement data...");
  
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n").filter(line => line.trim());
  
  const headers = parseCSVLine(lines[0]);
  console.log("Retirement headers:", headers);
  
  const batchSize = 100;
  let importedCount = 0;
  
  for (let i = 1; i < lines.length; i += batchSize) {
    const batch = lines.slice(i, i + batchSize);
    const transactionBatch: any[] = [];
    
    for (const line of batch) {
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      if (values.length !== headers.length) continue;
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      
      const creditsRetired = cleanNumericValue(row["Credits Retired"]);
      const retirementYear = cleanNumericValue(row["Retirement Year"]) || 2024;
      
      if (creditsRetired > 0) {
        transactionBatch.push({
          registryId: row["Registry ID"] || "",
          projectName: row["Project Name"] || "",
          country: row["Country"] || "",
          continent: row["Continent"] || "",
          region: row["Region"] || "",
          scope: row["Scope"] || "",
          type: row["Type"] || "",
          reductionRemoval: row["Reduction / Removal"] || "",
          retirementYear: Math.floor(retirementYear),
          creditsRetired: Math.floor(creditsRetired),
          retirementReason: row["Retirement Reason"] || "",
          buyerBrandName: row["Buyer Brand Name"] || row["Buyer"] || "",
          buyerClassification: row["Buyer Classification"] || "",
          buyerSector: row["Buyer Sector"] || "",
          buyerHQLocation: row["Buyer HQ Location"] || "",
          buyerHQRegion: row["Buyer HQ Region"] || "",
        });
      }
    }
    
    if (transactionBatch.length > 0) {
      await db.insert(transactions).values(transactionBatch);
      importedCount += transactionBatch.length;
      console.log(`Imported ${importedCount} retirement transactions...`);
    }
  }
  
  console.log(`✅ Retirement data import completed! Imported ${importedCount} transactions`);
}

async function importBuyerProfileData(csvPath: string) {
  console.log("Importing buyer profile data...");
  
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n").filter(line => line.trim());
  
  const headers = parseCSVLine(lines[0]);
  console.log("Buyer profile headers:", headers);
  
  const buyerProfilesArray: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const values = parseCSVLine(line);
    if (values.length !== headers.length) continue;
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    
    const cumulativeRetirements = cleanNumericValue(row["Cum. Retirements"]);
    
    if (row["Brand Names"] && cumulativeRetirements > 0) {
      buyerProfilesArray.push({
        brandName: row["Brand Names"],
        classification: row["Buyer Classification"] || "",
        sector: row["Buyer Sector"] || "",
        hqLocation: row["Buyer HQ Location"] || "",
        hqRegion: row["Buyer HQ Region"] || "",
        cumulativeRetirements: Math.floor(cumulativeRetirements),
      });
    }
  }
  
  if (buyerProfilesArray.length > 0) {
    const batchSize = 100;
    for (let i = 0; i < buyerProfilesArray.length; i += batchSize) {
      const batch = buyerProfilesArray.slice(i, i + batchSize);
      await db.insert(buyerProfiles).values(batch);
    }
    console.log(`✅ Buyer profiles import completed! Imported ${buyerProfilesArray.length} buyer profiles`);
  }
}

// Auto-run import
importCSVData()
  .then(() => {
    console.log("Import successful");
    process.exit(0);
  })
  .catch(error => {
    console.error("Import failed:", error);
    process.exit(1);
  });
