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

export async function importLatestCSVData() {
  try {
    console.log("🔄 Starting import of latest CSV data...");

    // Clear existing data
    await db.delete(transactions);
    await db.delete(buyerProfiles);
    console.log("✅ Cleared existing data");

    // Import transactions from the latest specific CSV file
    const transactionsPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Africa_Retirements_2024_=10_1750337694537.csv");

    if (!fs.existsSync(transactionsPath)) {
      console.error("❌ Latest transactions CSV file not found at:", transactionsPath);
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

    // Create buyer profiles map
    const buyerProfilesMap = new Map<string, any>();

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

          // Create buyer profile if not exists
          const brandName = row["Buyer Brand Name"];
          if (brandName && !buyerProfilesMap.has(brandName)) {
            buyerProfilesMap.set(brandName, {
              brandName: brandName,
              classification: row["Buyer Classification"] || "",
              sector: row["Buyer Sector"] || "",
              hqLocation: row["Buyer HQ Location"] || "",
              hqRegion: row["Buyer HQ Region"] || "",
              cumulativeRetirements: 0, // Will be calculated later
            });
          }
        }
      }

      // Insert transaction batch
      if (transactionBatch.length > 0) {
        await db.insert(transactions).values(transactionBatch);
        importedCount += transactionBatch.length;
        console.log(`📊 Imported ${importedCount} transactions...`);
      }
    }

    // Calculate cumulative retirements for buyer profiles
    const buyerTotals = new Map<string, number>();
    const allTransactions = await db.select().from(transactions);

    for (const transaction of allTransactions) {
      const current = buyerTotals.get(transaction.buyerBrandName) || 0;
      buyerTotals.set(transaction.buyerBrandName, current + transaction.creditsRetired);
    }

    // Update buyer profiles with cumulative retirements
    const buyerProfilesArray = Array.from(buyerProfilesMap.values()).map(profile => ({
      ...profile,
      cumulativeRetirements: buyerTotals.get(profile.brandName) || 0
    }));

    // Import buyer profiles from the latest specific CSV file
    const buyerProfilesPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Update_Buyer Profilesv24_1750342470632.csv");

    // Insert buyer profiles
    if (buyerProfilesArray.length > 0) {
      await db.insert(buyerProfiles).values(buyerProfilesArray);
      console.log(`✅ Imported ${buyerProfilesArray.length} buyer profiles`);
    }

    // Display year distribution
    console.log("\n📅 Year Distribution in Imported Data:");
    console.log("=".repeat(50));
    Object.keys(yearDistribution)
      .map(Number)
      .sort()
      .forEach(year => {
        console.log(`${year}: ${yearDistribution[year].toLocaleString()} transactions`);
      });

    console.log(`\n🎉 Latest CSV import completed!`);
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
    console.error("❌ Latest CSV import failed:", error);
    throw error;
  }
}

// CSV import can be triggered manually via API endpoints
// Removed auto-execution to prevent deployment issues