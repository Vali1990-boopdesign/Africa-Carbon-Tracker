
import { db } from "./db";
import { transactions, buyerProfiles } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

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
  const cleaned = value.replace(/[",% ]/g, '');
  const parsed = parseInt(cleaned) || 0;
  return parsed;
}

export async function reimportLatestCSVData() {
  try {
    console.log("🔄 Starting reimport of latest CSV files...");
    
    // Clear existing data
    await db.delete(transactions);
    await db.delete(buyerProfiles);
    console.log("✅ Cleared existing data");
    
    // Import buyer profiles from latest CSV
    const buyerProfilesPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Update_Buyer Profilesv24 V2_1750324115497.csv");
    
    if (!fs.existsSync(buyerProfilesPath)) {
      console.error("❌ Latest buyer profiles CSV file not found");
      return;
    }
    
    const buyerProfilesContent = fs.readFileSync(buyerProfilesPath, "utf-8");
    const buyerProfileLines = buyerProfilesContent.split("\n").filter(line => line.trim());
    
    const buyerProfileHeaders = parseCSVLine(buyerProfileLines[0]);
    console.log("📋 Buyer Profile Headers:", buyerProfileHeaders);
    
    const buyerProfilesMap = new Map<string, any>();
    
    for (let i = 1; i < buyerProfileLines.length; i++) {
      const line = buyerProfileLines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      if (values.length < buyerProfileHeaders.length - 2) continue; // Allow some flexibility
      
      const row: Record<string, string> = {};
      buyerProfileHeaders.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      
      const brandName = row["Brand Names"];
      if (brandName && brandName !== "Brand Names" && brandName.trim()) {
        buyerProfilesMap.set(brandName, {
          brandName: brandName,
          classification: row["Buyer Classification"] || "",
          sector: row["Buyer Sector"] || "",
          hqLocation: row["Buyer HQ Location"] || "",
          hqRegion: row["Buyer HQ Region"] || "",
          cumulativeRetirements: parseNumber(row["Cum. Retirements"]),
        });
      }
    }
    
    // Insert buyer profiles
    const buyerProfilesArray = Array.from(buyerProfilesMap.values());
    if (buyerProfilesArray.length > 0) {
      await db.insert(buyerProfiles).values(buyerProfilesArray);
      console.log(`✅ Imported ${buyerProfilesArray.length} buyer profiles`);
    }
    
    // Import transactions from latest CSV
    const transactionsPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Africa_Retirements_2024_=10 V2_1750324115497.csv");
    
    if (!fs.existsSync(transactionsPath)) {
      console.error("❌ Latest transactions CSV file not found");
      return;
    }
    
    const transactionsContent = fs.readFileSync(transactionsPath, "utf-8");
    const transactionLines = transactionsContent.split("\n").filter(line => line.trim());
    
    const transactionHeaders = parseCSVLine(transactionLines[0]);
    console.log("📋 Transaction Headers:", transactionHeaders);
    
    // Process transactions in batches
    const batchSize = 100;
    let importedCount = 0;
    let year2024Count = 0;
    let yearDistribution: Record<number, number> = {};
    
    for (let i = 1; i < transactionLines.length; i += batchSize) {
      const batch = transactionLines.slice(i, i + batchSize);
      const transactionBatch: any[] = [];
      
      for (const line of batch) {
        if (!line.trim()) continue;
        
        const values = parseCSVLine(line);
        if (values.length < transactionHeaders.length - 2) continue; // Allow some flexibility
        
        const row: Record<string, string> = {};
        transactionHeaders.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        
        const creditsRetired = parseNumber(row["Credits Retired"]);
        const retirementYear = parseNumber(row["Retirement Year"]) || 2024;
        
        // Count year distribution
        yearDistribution[retirementYear] = (yearDistribution[retirementYear] || 0) + 1;
        
        // Include ALL valid data from 2000-2024 (including 2024!)
        if (creditsRetired > 0 && retirementYear >= 2000 && retirementYear <= 2024 && row["Buyer Brand Name"] && row["Buyer Brand Name"].trim()) {
          if (retirementYear === 2024) {
            year2024Count++;
          }
          
          transactionBatch.push({
            registryId: row["Registry ID"] || "",
            projectName: row["Project Name"] || "",
            country: row["Country"] || "",
            continent: row["Continent"] || "",
            region: row["Region"] || "",
            scope: row["Scope"] || "",
            type: row["Type"] || "",
            reductionRemoval: row["Reduction / Removal"] || "",
            retirementYear: retirementYear,
            creditsRetired: creditsRetired,
            retirementReason: row["Retirement Reason"] || "",
            buyerBrandName: row["Buyer Brand Name"] || "",
            buyerClassification: row["Buyer Classification"] || "",
            buyerSector: row["Buyer Sector"] || "",
            buyerHQLocation: row["Buyer HQ Location"] || "",
            buyerHQRegion: row["Buyer HQ Region"] || "",
          });
        }
      }
      
      // Insert transaction batch
      if (transactionBatch.length > 0) {
        await db.insert(transactions).values(transactionBatch);
        importedCount += transactionBatch.length;
        console.log(`📊 Imported ${importedCount} transactions...`);
      }
    }
    
    // Display year distribution
    console.log("\n📅 Year Distribution in Imported Data:");
    console.log("=" * 50);
    Object.keys(yearDistribution)
      .map(Number)
      .sort()
      .forEach(year => {
        console.log(`${year}: ${yearDistribution[year].toLocaleString()} transactions`);
      });
    
    console.log(`\n🎉 Latest CSV reimport completed!`);
    console.log(`📊 Total imported: ${importedCount.toLocaleString()} transactions`);
    console.log(`📈 2024 transactions: ${year2024Count.toLocaleString()}`);
    console.log(`👥 Buyer profiles: ${buyerProfilesArray.length.toLocaleString()}`);
    
    return {
      transactions: importedCount,
      year2024Transactions: year2024Count,
      buyerProfiles: buyerProfilesArray.length,
      yearDistribution: yearDistribution
    };
  } catch (error) {
    console.error("❌ Latest CSV reimport failed:", error);
    throw error;
  }
}

// Auto-run reimport
if (import.meta.url === `file://${process.argv[1]}`) {
  reimportLatestCSVData()
    .then(result => {
      console.log("✅ Reimport successful:", result);
      process.exit(0);
    })
    .catch(error => {
      console.error("❌ Reimport failed:", error);
      process.exit(1);
    });
}
