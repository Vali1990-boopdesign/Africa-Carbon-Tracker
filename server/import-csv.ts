
import { db } from "./db";
import { transactions, buyerProfiles, bilateralAgreements } from "@shared/schema";
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
  if (!value || value === 'N/A' || value === '') return 0;
  
  // Remove commas and quotes
  const cleaned = value.replace(/[",]/g, '');
  const parsed = parseInt(cleaned) || 0;
  return parsed;
}

export async function importCSVData() {
  try {
    console.log("Starting CSV import...");
    
    // Clear existing data
    await db.delete(transactions);
    await db.delete(buyerProfiles);
    await db.delete(bilateralAgreements);
    console.log("Cleared existing data");
    
    // Import buyer profiles first
    const buyerProfilesPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Update_Buyer Profilesv24_1749477252806.csv");
    const buyerProfilesContent = fs.readFileSync(buyerProfilesPath, "utf-8");
    const buyerProfilesLines = buyerProfilesContent.split("\n").filter(line => line.trim());
    
    const buyerProfilesHeaders = parseCSVLine(buyerProfilesLines[0]);
    console.log("Buyer Profiles Headers:", buyerProfilesHeaders);
    
    const buyerProfilesMap = new Map<string, any>();
    
    for (let i = 1; i < buyerProfilesLines.length; i++) {
      const line = buyerProfilesLines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      if (values.length !== buyerProfilesHeaders.length) continue;
      
      const row: Record<string, string> = {};
      buyerProfilesHeaders.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      
      const brandName = row["Brand Names"];
      if (brandName && brandName !== "Brand Names") {
        const cumulativeRetirements = parseNumber(row["Cum. Retirements"]);
        
        buyerProfilesMap.set(brandName, {
          brandName: brandName,
          classification: row["Buyer Classification"] || "",
          sector: row["Buyer Sector"] || "",
          hqLocation: row["Buyer HQ Location"] || "",
          hqRegion: row["Buyer HQ Region"] || "",
          cumulativeRetirements: cumulativeRetirements,
        });
      }
    }
    
    // Insert buyer profiles
    const buyerProfilesArray = Array.from(buyerProfilesMap.values());
    if (buyerProfilesArray.length > 0) {
      await db.insert(buyerProfiles).values(buyerProfilesArray);
      console.log(`Imported ${buyerProfilesArray.length} buyer profiles`);
    }
    
    // Import transactions
    const transactionsPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Africa_Retirements_2024_=10_1749477252806.csv");
    const transactionsContent = fs.readFileSync(transactionsPath, "utf-8");
    const transactionsLines = transactionsContent.split("\n").filter(line => line.trim());
    
    const transactionsHeaders = parseCSVLine(transactionsLines[0]);
    console.log("Transactions Headers:", transactionsHeaders);
    
    // Process transactions in batches
    const batchSize = 100;
    let importedTransactionsCount = 0;
    
    for (let i = 1; i < transactionsLines.length; i += batchSize) {
      const batch = transactionsLines.slice(i, i + batchSize);
      const transactionBatch: any[] = [];
      
      for (const line of batch) {
        if (!line.trim()) continue;
        
        const values = parseCSVLine(line);
        if (values.length !== transactionsHeaders.length) continue;
        
        const row: Record<string, string> = {};
        transactionsHeaders.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        
        const creditsRetired = parseNumber(row["Credits Retired"]);
        const retirementYear = parseNumber(row["Retirement Year"]) || 2024;
        
        if (creditsRetired > 0 && row["Buyer Brand Name"]) {
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
        importedTransactionsCount += transactionBatch.length;
        console.log(`Imported ${importedTransactionsCount} transactions...`);
      }
    }
    
    // Import bilateral agreements
    const bilateralAgreementsPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Africa's Bi-Lateral Agreements_1749477252806.csv");
    const bilateralAgreementsContent = fs.readFileSync(bilateralAgreementsPath, "utf-8");
    const bilateralAgreementsLines = bilateralAgreementsContent.split("\n").filter(line => line.trim());
    
    const bilateralAgreementsHeaders = parseCSVLine(bilateralAgreementsLines[0]);
    console.log("Bilateral Agreements Headers:", bilateralAgreementsHeaders);
    
    const bilateralAgreementsArray: any[] = [];
    
    for (let i = 1; i < bilateralAgreementsLines.length; i++) {
      const line = bilateralAgreementsLines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      if (values.length !== bilateralAgreementsHeaders.length) continue;
      
      const row: Record<string, string> = {};
      bilateralAgreementsHeaders.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      
      if (row["Agreement Name"] && row["Country"]) {
        bilateralAgreementsArray.push({
          agreementName: row["Agreement Name"] || "",
          country: row["Country"] || "",
          partner: row["Partner"] || "",
          signingYear: parseNumber(row["Signing Year"]) || null,
          status: row["Status"] || "",
          agreementType: row["Agreement Type"] || "",
          description: row["Description"] || "",
        });
      }
    }
    
    // Insert bilateral agreements
    if (bilateralAgreementsArray.length > 0) {
      await db.insert(bilateralAgreements).values(bilateralAgreementsArray);
      console.log(`Imported ${bilateralAgreementsArray.length} bilateral agreements`);
    }
    
    console.log(`✅ CSV import completed! Imported ${importedTransactionsCount} transactions, ${buyerProfilesArray.length} buyer profiles, and ${bilateralAgreementsArray.length} bilateral agreements`);
    
    return {
      transactions: importedTransactionsCount,
      buyerProfiles: buyerProfilesArray.length,
      bilateralAgreements: bilateralAgreementsArray.length,
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
