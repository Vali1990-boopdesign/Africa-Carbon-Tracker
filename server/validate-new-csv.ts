
import { db } from "./db";
import { transactions, buyerProfiles } from "@shared/schema";
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

async function validateNewBuyerProfiles(): Promise<ValidationResult> {
  const result: ValidationResult = {
    entity: 'Buyer Profiles (New CSV)',
    csvCount: 0,
    dbCount: 0,
    discrepancies: [],
    sampleMismatches: []
  };

  try {
    // Read new CSV file
    const csvPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Update_Buyer Profilesv24 V2_1750324115497.csv");
    
    if (!fs.existsSync(csvPath)) {
      result.discrepancies.push("New buyer profiles CSV file not found");
      return result;
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter(line => line.trim());
    
    if (lines.length === 0) {
      result.discrepancies.push("CSV file is empty");
      return result;
    }

    const headers = parseCSVLine(lines[0]);
    const csvBuyerProfiles = new Map<string, any>();
    
    // Parse CSV data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      if (values.length < headers.length - 2) continue; // Allow some flexibility
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      
      const brandName = row["Brand Names"];
      if (brandName && brandName !== "Brand Names" && brandName.trim()) {
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
      result.discrepancies.push(`Count mismatch: New CSV has ${result.csvCount} records, DB has ${result.dbCount} records`);
    }
    
    // Check for missing buyers in DB
    const dbBuyerNames = new Set(dbBuyerProfiles.map(bp => bp.brandName));
    const csvBuyerNames = new Set(csvBuyerProfiles.keys());
    
    const missingInDb = Array.from(csvBuyerNames).filter(name => !dbBuyerNames.has(name));
    const missingInCsv = Array.from(dbBuyerNames).filter(name => !csvBuyerNames.has(name));
    
    if (missingInDb.length > 0) {
      result.discrepancies.push(`${missingInDb.length} buyers in new CSV but not in DB: ${missingInDb.slice(0, 10).join(', ')}${missingInDb.length > 10 ? '...' : ''}`);
    }
    
    if (missingInCsv.length > 0) {
      result.discrepancies.push(`${missingInCsv.length} buyers in DB but not in new CSV: ${missingInCsv.slice(0, 10).join(', ')}${missingInCsv.length > 10 ? '...' : ''}`);
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
        if (Math.abs(dbBuyer.cumulativeRetirements - csvBuyer.cumulativeRetirements) > 0) {
          mismatches.push(`cumulativeRetirements: DB="${dbBuyer.cumulativeRetirements}" vs CSV="${csvBuyer.cumulativeRetirements}"`);
        }
        
        if (mismatches.length > 0 && result.sampleMismatches.length < 15) {
          result.sampleMismatches.push({
            brandName: dbBuyer.brandName,
            mismatches: mismatches
          });
          mismatchCount++;
        }
      }
    }
    
    if (mismatchCount > 0) {
      result.discrepancies.push(`${mismatchCount} buyers have data mismatches between DB and new CSV`);
    }
    
  } catch (error) {
    result.discrepancies.push(`Error validating buyer profiles: ${error.message}`);
  }
  
  return result;
}

async function validateNewTransactions(): Promise<ValidationResult> {
  const result: ValidationResult = {
    entity: 'Transactions (New CSV)',
    csvCount: 0,
    dbCount: 0,
    discrepancies: [],
    sampleMismatches: []
  };

  try {
    // Read new CSV file
    const csvPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Africa_Retirements_2024_=10 V2_1750324115497.csv");
    
    if (!fs.existsSync(csvPath)) {
      result.discrepancies.push("New transactions CSV file not found");
      return result;
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter(line => line.trim());
    
    if (lines.length === 0) {
      result.discrepancies.push("CSV file is empty");
      return result;
    }

    const headers = parseCSVLine(lines[0]);
    const csvTransactions: any[] = [];
    
    // Parse CSV data
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      if (values.length < headers.length - 2) continue; // Allow some flexibility
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      
      const creditsRetired = parseNumber(row["Credits Retired"]);
      const retirementYear = parseNumber(row["Retirement Year"]) || 2024;
      
      if (creditsRetired > 0 && row["Buyer Brand Name"] && row["Buyer Brand Name"].trim()) {
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
      result.discrepancies.push(`Count mismatch: New CSV has ${result.csvCount} records, DB has ${result.dbCount} records`);
    }
    
    // Check for registry ID matches
    const csvRegistryIds = new Set(csvTransactions.map(t => `${t.registryId}_${t.buyerBrandName}_${t.creditsRetired}`));
    const dbRegistryIds = new Set(dbTransactions.map(t => `${t.registryId}_${t.buyerBrandName}_${t.creditsRetired}`));
    
    const missingInDb = Array.from(csvRegistryIds).filter(id => !dbRegistryIds.has(id));
    const missingInCsv = Array.from(dbRegistryIds).filter(id => !csvRegistryIds.has(id));
    
    if (missingInDb.length > 0) {
      result.discrepancies.push(`${missingInDb.length} unique transactions in new CSV but not in DB`);
      if (result.sampleMismatches.length < 5) {
        result.sampleMismatches.push({
          category: "Missing in DB",
          samples: missingInDb.slice(0, 5)
        });
      }
    }
    
    if (missingInCsv.length > 0) {
      result.discrepancies.push(`${missingInCsv.length} unique transactions in DB but not in new CSV`);
      if (result.sampleMismatches.length < 5) {
        result.sampleMismatches.push({
          category: "Missing in CSV",
          samples: missingInCsv.slice(0, 5)
        });
      }
    }
    
    // Check total credits retired
    const csvTotalCredits = csvTransactions.reduce((sum, t) => sum + t.creditsRetired, 0);
    const dbTotalCredits = dbTransactions.reduce((sum, t) => sum + t.creditsRetired, 0);
    
    if (csvTotalCredits !== dbTotalCredits) {
      result.discrepancies.push(`Total credits mismatch: New CSV=${csvTotalCredits.toLocaleString()}, DB=${dbTotalCredits.toLocaleString()}, Difference=${Math.abs(csvTotalCredits - dbTotalCredits).toLocaleString()}`);
    }
    
    // Check year distribution
    const csvYearDist = csvTransactions.reduce((acc, t) => {
      acc[t.retirementYear] = (acc[t.retirementYear] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const dbYearDist = dbTransactions.reduce((acc, t) => {
      acc[t.retirementYear] = (acc[t.retirementYear] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const allYears = new Set([...Object.keys(csvYearDist), ...Object.keys(dbYearDist)]);
    const yearMismatches: string[] = [];
    
    for (const year of allYears) {
      const csvCount = csvYearDist[parseInt(year)] || 0;
      const dbCount = dbYearDist[parseInt(year)] || 0;
      if (csvCount !== dbCount) {
        yearMismatches.push(`${year}: CSV=${csvCount}, DB=${dbCount}`);
      }
    }
    
    if (yearMismatches.length > 0) {
      result.discrepancies.push(`Year distribution mismatches: ${yearMismatches.slice(0, 5).join('; ')}${yearMismatches.length > 5 ? '...' : ''}`);
    }
    
  } catch (error) {
    result.discrepancies.push(`Error validating transactions: ${error.message}`);
  }
  
  return result;
}

export async function validateNewCSVData(): Promise<ValidationResult[]> {
  console.log("🔍 Starting validation of new CSV files against database...");
  console.log("=" * 60);
  
  const results: ValidationResult[] = [];
  
  // Validate buyer profiles
  console.log("Validating buyer profiles against new CSV...");
  const buyerProfilesResult = await validateNewBuyerProfiles();
  results.push(buyerProfilesResult);
  
  // Validate transactions
  console.log("Validating transactions against new CSV...");
  const transactionsResult = await validateNewTransactions();
  results.push(transactionsResult);
  
  // Print comprehensive results
  console.log("\n📊 DETAILED VALIDATION RESULTS:");
  console.log("=" * 60);
  
  let totalDiscrepancies = 0;
  
  for (const result of results) {
    console.log(`\n🔍 ${result.entity}:`);
    console.log(`  📁 New CSV Count: ${result.csvCount.toLocaleString()}`);
    console.log(`  💾 Database Count: ${result.dbCount.toLocaleString()}`);
    
    if (result.discrepancies.length === 0) {
      console.log("  ✅ No discrepancies found - Data matches perfectly!");
    } else {
      totalDiscrepancies += result.discrepancies.length;
      console.log(`  ❌ ${result.discrepancies.length} discrepancies found:`);
      result.discrepancies.forEach((disc, i) => {
        console.log(`    ${i + 1}. ${disc}`);
      });
      
      if (result.sampleMismatches.length > 0) {
        console.log(`  📝 Sample mismatches (showing first ${result.sampleMismatches.length}):`);
        result.sampleMismatches.forEach((mismatch, i) => {
          console.log(`    ${i + 1}. ${JSON.stringify(mismatch, null, 6)}`);
        });
      }
    }
    console.log("");
  }
  
  // Summary
  console.log("\n📋 VALIDATION SUMMARY:");
  console.log("=" * 60);
  if (totalDiscrepancies === 0) {
    console.log("🎉 SUCCESS: All data validation checks passed!");
    console.log("   Your database is perfectly synchronized with the new CSV files.");
  } else {
    console.log(`⚠️  ATTENTION: ${totalDiscrepancies} total discrepancies found across all entities.`);
    console.log("   Please review the detailed results above to understand the differences.");
    console.log("   Consider updating your database if the CSV files contain the correct data.");
  }
  
  return results;
}

// Auto-run validation (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  validateNewCSVData()
    .then(results => {
      const hasDiscrepancies = results.some(r => r.discrepancies.length > 0);
      process.exit(hasDiscrepancies ? 1 : 0);
    })
    .catch(error => {
      console.error("❌ Validation failed:", error);
      process.exit(1);
    });
}
