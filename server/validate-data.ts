
import { db } from "./db";
import { transactions, buyerProfiles, bilateralAgreements } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

interface ValidationResult {
  entity: string;
  csvCount: number;
  dbCount: number;
  discrepancies: string[];
  sampleMismatches: any[];
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
  const cleaned = value.replace(/[",]/g, '');
  const parsed = parseInt(cleaned) || 0;
  return parsed;
}

async function validateBuyerProfiles(): Promise<ValidationResult> {
  const result: ValidationResult = {
    entity: 'Buyer Profiles',
    csvCount: 0,
    dbCount: 0,
    discrepancies: [],
    sampleMismatches: []
  };

  try {
    // Read CSV file - using latest buyer profiles
    const csvPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Update_Buyer Profilesv24_1750342470632.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter(line => line.trim());
    
    const headers = parseCSVLine(lines[0]);
    const csvBuyerProfiles = new Map<string, any>();
    
    // Parse CSV data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      if (values.length !== headers.length) continue;
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      
      const brandName = row["Brand Names"];
      if (brandName && brandName !== "Brand Names") {
        csvBuyerProfiles.set(brandName, {
          brandName: brandName,
          classification: row["Buyer Classification"] || "",
          sector: row["Buyer Sector"] || "",
          hqLocation: row["Buyer HQ Location"] || "",
          hqRegion: row["Buyer HQ Region"] || "",
          cumulativeRetirements: parseNumber(row["Cum. Retirements"]),
        });
      }
    }
    
    result.csvCount = csvBuyerProfiles.size;
    
    // Get database data
    const dbBuyerProfiles = await db.select().from(buyerProfiles);
    result.dbCount = dbBuyerProfiles.length;
    
    // Compare counts
    if (result.csvCount !== result.dbCount) {
      result.discrepancies.push(`Count mismatch: CSV has ${result.csvCount} records, DB has ${result.dbCount} records`);
    }
    
    // Check for missing buyers in DB
    const dbBuyerNames = new Set(dbBuyerProfiles.map(bp => bp.brandName));
    const csvBuyerNames = new Set(csvBuyerProfiles.keys());
    
    const missingInDb = Array.from(csvBuyerNames).filter(name => !dbBuyerNames.has(name));
    const missingInCsv = Array.from(dbBuyerNames).filter(name => !csvBuyerNames.has(name));
    
    if (missingInDb.length > 0) {
      result.discrepancies.push(`${missingInDb.length} buyers in CSV but not in DB: ${missingInDb.slice(0, 5).join(', ')}${missingInDb.length > 5 ? '...' : ''}`);
    }
    
    if (missingInCsv.length > 0) {
      result.discrepancies.push(`${missingInCsv.length} buyers in DB but not in CSV: ${missingInCsv.slice(0, 5).join(', ')}${missingInCsv.length > 5 ? '...' : ''}`);
    }
    
    // Check for data mismatches
    let mismatchCount = 0;
    for (const dbBuyer of dbBuyerProfiles) {
      const csvBuyer = csvBuyerProfiles.get(dbBuyer.brandName);
      if (csvBuyer) {
        const mismatches: string[] = [];
        
        if (dbBuyer.classification !== csvBuyer.classification) {
          mismatches.push(`classification: DB="${dbBuyer.classification}" vs CSV="${csvBuyer.classification}"`);
        }
        if (dbBuyer.sector !== csvBuyer.sector) {
          mismatches.push(`sector: DB="${dbBuyer.sector}" vs CSV="${csvBuyer.sector}"`);
        }
        if (dbBuyer.hqLocation !== csvBuyer.hqLocation) {
          mismatches.push(`hqLocation: DB="${dbBuyer.hqLocation}" vs CSV="${csvBuyer.hqLocation}"`);
        }
        if (dbBuyer.hqRegion !== csvBuyer.hqRegion) {
          mismatches.push(`hqRegion: DB="${dbBuyer.hqRegion}" vs CSV="${csvBuyer.hqRegion}"`);
        }
        if (dbBuyer.cumulativeRetirements !== csvBuyer.cumulativeRetirements) {
          mismatches.push(`cumulativeRetirements: DB="${dbBuyer.cumulativeRetirements}" vs CSV="${csvBuyer.cumulativeRetirements}"`);
        }
        
        if (mismatches.length > 0 && result.sampleMismatches.length < 10) {
          result.sampleMismatches.push({
            brandName: dbBuyer.brandName,
            mismatches: mismatches
          });
          mismatchCount++;
        }
      }
    }
    
    if (mismatchCount > 0) {
      result.discrepancies.push(`${mismatchCount} buyers have data mismatches between DB and CSV`);
    }
    
  } catch (error) {
    result.discrepancies.push(`Error validating buyer profiles: ${error.message}`);
  }
  
  return result;
}

async function validateTransactions(): Promise<ValidationResult> {
  const result: ValidationResult = {
    entity: 'Transactions',
    csvCount: 0,
    dbCount: 0,
    discrepancies: [],
    sampleMismatches: []
  };

  try {
    // Read CSV file - using latest transactions
    const csvPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Africa_Retirements_2024_=10_1750337694537.csv");
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter(line => line.trim());
    
    const headers = parseCSVLine(lines[0]);
    const csvTransactions: any[] = [];
    
    // Parse CSV data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      if (values.length !== headers.length) continue;
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      
      const creditsRetired = parseNumber(row["Credits Retired"]);
      const retirementYear = parseNumber(row["Retirement Year"]) || 2024;
      
      if (creditsRetired > 0 && row["Buyer Brand Name"]) {
        csvTransactions.push({
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
    
    result.csvCount = csvTransactions.length;
    
    // Get database data
    const dbTransactions = await db.select().from(transactions);
    result.dbCount = dbTransactions.length;
    
    // Compare counts
    if (result.csvCount !== result.dbCount) {
      result.discrepancies.push(`Count mismatch: CSV has ${result.csvCount} records, DB has ${result.dbCount} records`);
    }
    
    // Check for registry ID matches (sample comparison)
    const csvRegistryIds = new Set(csvTransactions.map(t => t.registryId));
    const dbRegistryIds = new Set(dbTransactions.map(t => t.registryId));
    
    const missingInDb = Array.from(csvRegistryIds).filter(id => !dbRegistryIds.has(id));
    const missingInCsv = Array.from(dbRegistryIds).filter(id => !csvRegistryIds.has(id));
    
    if (missingInDb.length > 0) {
      result.discrepancies.push(`${missingInDb.length} registry IDs in CSV but not in DB`);
    }
    
    if (missingInCsv.length > 0) {
      result.discrepancies.push(`${missingInCsv.length} registry IDs in DB but not in CSV`);
    }
    
    // Check total credits retired
    const csvTotalCredits = csvTransactions.reduce((sum, t) => sum + t.creditsRetired, 0);
    const dbTotalCredits = dbTransactions.reduce((sum, t) => sum + t.creditsRetired, 0);
    
    if (csvTotalCredits !== dbTotalCredits) {
      result.discrepancies.push(`Total credits mismatch: CSV=${csvTotalCredits}, DB=${dbTotalCredits}`);
    }
    
    // Sample data comparison
    const csvByRegistryId = new Map(csvTransactions.map(t => [t.registryId + '_' + t.buyerBrandName + '_' + t.creditsRetired, t]));
    let mismatchCount = 0;
    
    for (const dbTransaction of dbTransactions.slice(0, 100)) { // Sample first 100
      const key = dbTransaction.registryId + '_' + dbTransaction.buyerBrandName + '_' + dbTransaction.creditsRetired;
      const csvTransaction = csvByRegistryId.get(key);
      
      if (!csvTransaction) {
        if (result.sampleMismatches.length < 10) {
          result.sampleMismatches.push({
            registryId: dbTransaction.registryId,
            issue: 'Transaction in DB but not found in CSV with matching registry ID, buyer, and credits'
          });
        }
        mismatchCount++;
      }
    }
    
    if (mismatchCount > 0) {
      result.discrepancies.push(`${mismatchCount} transactions (from sample of 100) not found in CSV`);
    }
    
  } catch (error) {
    result.discrepancies.push(`Error validating transactions: ${error.message}`);
  }
  
  return result;
}

export async function validateAllData(): Promise<ValidationResult[]> {
  console.log("🔍 Starting data validation...");
  
  const results: ValidationResult[] = [];
  
  // Validate buyer profiles
  console.log("Validating buyer profiles...");
  const buyerProfilesResult = await validateBuyerProfiles();
  results.push(buyerProfilesResult);
  
  // Validate transactions
  console.log("Validating transactions...");
  const transactionsResult = await validateTransactions();
  results.push(transactionsResult);
  
  // Print results
  console.log("\n📊 VALIDATION RESULTS:");
  console.log("=".repeat(50));
  
  for (const result of results) {
    console.log(`\n${result.entity}:`);
    console.log(`  CSV Count: ${result.csvCount}`);
    console.log(`  DB Count: ${result.dbCount}`);
    
    if (result.discrepancies.length === 0) {
      console.log("  ✅ No discrepancies found");
    } else {
      console.log(`  ❌ ${result.discrepancies.length} discrepancies found:`);
      result.discrepancies.forEach(disc => {
        console.log(`    - ${disc}`);
      });
      
      if (result.sampleMismatches.length > 0) {
        console.log(`  📝 Sample mismatches:`);
        result.sampleMismatches.forEach((mismatch, i) => {
          console.log(`    ${i + 1}. ${JSON.stringify(mismatch, null, 2)}`);
        });
      }
    }
  }
  
  return results;
}

// Validation can be run manually via API endpoints or command line
// Removed auto-execution to prevent deployment issues
