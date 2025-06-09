import { db } from "./db";
import { transactions, buyerProfiles } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

interface CSVRow {
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
  "Buyer Brand Name": string;
  "Buyer Classification": string;
  "Buyer Sector": string;
  "Buyer HQ Location": string;
  "Buyer HQ Region": string;
  "ISO Code": string;
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

export async function importCSVData() {
  try {
    console.log("Starting CSV import...");
    
    // Read the CSV file
    const csvPath = path.join(process.cwd(), "data", "Cleaned_Africa_Carbon_Buyers.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter(line => line.trim());
    
    // Parse header
    const headers = parseCSVLine(lines[0]);
    console.log("Headers:", headers);
    
    // Clear existing data
    await db.delete(transactions);
    await db.delete(buyerProfiles);
    console.log("Cleared existing data");
    
    // Process data in batches
    const batchSize = 100;
    let importedCount = 0;
    const buyerProfilesMap = new Map<string, any>();
    
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
        
        // Parse transaction data
        const creditsRetired = parseInt(row["Credits Retired"]) || 0;
        const retirementYear = parseInt(row["Retirement Year"]) || 2023;
        
        if (creditsRetired > 0) {
          // Add transaction
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
          
          // Track buyer profiles
          const buyerKey = row["Buyer Brand Name"];
          if (buyerKey && !buyerProfilesMap.has(buyerKey)) {
            buyerProfilesMap.set(buyerKey, {
              brandName: row["Buyer Brand Name"],
              classification: row["Buyer Classification"],
              sector: row["Buyer Sector"],
              hqLocation: row["Buyer HQ Location"],
              hqRegion: row["Buyer HQ Region"],
              cumulativeRetirements: 0,
            });
          }
          
          if (buyerProfilesMap.has(buyerKey)) {
            const profile = buyerProfilesMap.get(buyerKey);
            profile.cumulativeRetirements += creditsRetired;
          }
        }
      }
      
      // Insert transaction batch
      if (transactionBatch.length > 0) {
        await db.insert(transactions).values(transactionBatch);
        importedCount += transactionBatch.length;
        console.log(`Imported ${importedCount} transactions...`);
      }
    }
    
    // Insert buyer profiles
    const buyerProfilesArray = Array.from(buyerProfilesMap.values());
    if (buyerProfilesArray.length > 0) {
      await db.insert(buyerProfiles).values(buyerProfilesArray);
      console.log(`Imported ${buyerProfilesArray.length} buyer profiles`);
    }
    
    console.log(`✅ CSV import completed! Imported ${importedCount} transactions and ${buyerProfilesArray.length} buyer profiles`);
    
    return {
      transactions: importedCount,
      buyerProfiles: buyerProfilesArray.length,
    };
  } catch (error) {
    console.error("❌ CSV import failed:", error);
    throw error;
  }
}

// Auto-run import
importCSVData()
  .then(result => {
    console.log("Import successful:", result);
    process.exit(0);
  })
  .catch(error => {
    console.error("Import failed:", error);
    process.exit(1);
  });