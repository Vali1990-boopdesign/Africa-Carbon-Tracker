import { db } from "./db";
import { transactions, buyerProfiles } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

interface TransactionRow {
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

interface BuyerProfileRow {
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

function parseNumber(value: string): number {
  if (!value || value === 'N/A' || value === '' || value === '0') return 0;
  
  // Remove commas, quotes, and percentage signs
  const cleaned = value.replace(/[",% ]/g, '');
  const parsed = parseInt(cleaned) || 0;
  return parsed;
}

export async function importNewCSVData() {
  try {
    console.log("Starting new CSV import...");
    
    // Clear existing data
    await db.delete(transactions);
    await db.delete(buyerProfiles);
    console.log("Cleared existing data");
    
    // Import transactions data
    const transactionsPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Africa_Retirements_2024_=10_1749477579248.csv");
    const transactionsContent = fs.readFileSync(transactionsPath, "utf-8");
    const transactionLines = transactionsContent.split("\n").filter(line => line.trim());
    
    const transactionHeaders = parseCSVLine(transactionLines[0]);
    console.log("Transaction Headers:", transactionHeaders);
    
    // Import buyer profiles data
    const buyerProfilesPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Update_Buyer Profilesv24_1749477579248.csv");
    const buyerProfilesContent = fs.readFileSync(buyerProfilesPath, "utf-8");
    const buyerProfileLines = buyerProfilesContent.split("\n").filter(line => line.trim());
    
    const buyerProfileHeaders = parseCSVLine(buyerProfileLines[0]);
    console.log("Buyer Profile Headers:", buyerProfileHeaders);
    
    // Process buyer profiles first
    const buyerProfilesMap = new Map<string, any>();
    const batchSize = 100;
    
    for (let i = 1; i < buyerProfileLines.length; i += batchSize) {
      const batch = buyerProfileLines.slice(i, i + batchSize);
      
      for (const line of batch) {
        if (!line.trim()) continue;
        
        const values = parseCSVLine(line);
        if (values.length !== buyerProfileHeaders.length) continue;
        
        const row: Record<string, string> = {};
        buyerProfileHeaders.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        
        const brandName = row["Brand Names"];
        if (brandName) {
          buyerProfilesMap.set(brandName, {
            brandName: brandName,
            classification: row["Buyer Classification"],
            sector: row["Buyer Sector"],
            hqLocation: row["Buyer HQ Location"],
            hqRegion: row["Buyer HQ Region"],
            cumulativeRetirements: parseNumber(row["Cum. Retirements"]),
          });
        }
      }
    }
    
    // Insert buyer profiles
    const buyerProfilesArray = Array.from(buyerProfilesMap.values());
    if (buyerProfilesArray.length > 0) {
      await db.insert(buyerProfiles).values(buyerProfilesArray);
      console.log(`Imported ${buyerProfilesArray.length} buyer profiles`);
    }
    
    // Process transactions in batches
    let importedCount = 0;
    
    for (let i = 1; i < transactionLines.length; i += batchSize) {
      const batch = transactionLines.slice(i, i + batchSize);
      const transactionBatch: any[] = [];
      
      for (const line of batch) {
        if (!line.trim()) continue;
        
        const values = parseCSVLine(line);
        if (values.length !== transactionHeaders.length) continue;
        
        const row: Record<string, string> = {};
        transactionHeaders.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        
        // Parse transaction data
        const creditsRetired = parseNumber(row["Credits Retired"]);
        const retirementYear = parseNumber(row["Retirement Year"]) || 2024;
        
        if (creditsRetired > 0) {
          transactionBatch.push({
            registryId: row["Registry ID"],
            projectName: row["Project Name"],
            country: row["Country"],
            continent: row["Continent"],
            region: row["Region"],
            scope: row["Scope"],
            type: row["Type"],
            reductionRemoval: row["Reduction / Removal"],
            retirementYear,
            creditsRetired,
            retirementReason: row["Retirement Reason"],
            buyerBrandName: row["Buyer Brand Name"],
            buyerClassification: row["Buyer Classification"],
            buyerSector: row["Buyer Sector"],
            buyerHQLocation: row["Buyer HQ Location"],
            buyerHQRegion: row["Buyer HQ Region"],
          });
        }
      }
      
      // Insert transaction batch
      if (transactionBatch.length > 0) {
        await db.insert(transactions).values(transactionBatch);
        importedCount += transactionBatch.length;
        console.log(`Imported ${importedCount} transactions...`);
      }
    }
    
    console.log(`✅ New CSV import completed! Imported ${importedCount} transactions and ${buyerProfilesArray.length} buyer profiles`);
    
    return {
      transactions: importedCount,
      buyerProfiles: buyerProfilesArray.length,
    };
  } catch (error) {
    console.error("❌ New CSV import failed:", error);
    throw error;
  }
}

// Auto-run import
importNewCSVData()
  .then(result => {
    console.log("Import successful:", result);
    process.exit(0);
  })
  .catch(error => {
    console.error("Import failed:", error);
    process.exit(1);
  });