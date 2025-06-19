
import { db } from "./db";
import { transactions, buyerProfiles } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import { sql } from "drizzle-orm";

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

export async function validateNewCSVData() {
  try {
    console.log("🔍 Starting validation of new CSV data against database...");

    const results = [];

    // Validate transactions
    const transactionsPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Africa_Retirements_2024_=10_1750337694537.csv");
    
    if (fs.existsSync(transactionsPath)) {
      const transactionsContent = fs.readFileSync(transactionsPath, "utf-8");
      const transactionLines = transactionsContent.split("\n").filter(line => line.trim());
      
      const csvTransactionCount = transactionLines.length - 1; // Exclude header
      const dbTransactionCount = await db.select({ count: sql`count(*)` }).from(transactions);
      
      const transactionDiscrepancies = [];
      if (csvTransactionCount !== dbTransactionCount[0]?.count) {
        transactionDiscrepancies.push(`CSV has ${csvTransactionCount} transactions, database has ${dbTransactionCount[0]?.count}`);
      }

      results.push({
        entity: "Transactions",
        csvCount: csvTransactionCount,
        dbCount: Number(dbTransactionCount[0]?.count || 0),
        discrepancies: transactionDiscrepancies,
        sampleMismatches: []
      });
    }

    // Validate buyer profiles
    const buyerProfilesPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Update_Buyer Profilesv24_1750342470632.csv");
    
    if (fs.existsSync(buyerProfilesPath)) {
      const buyerProfilesContent = fs.readFileSync(buyerProfilesPath, "utf-8");
      const buyerProfileLines = buyerProfilesContent.split("\n").filter(line => line.trim());
      
      const csvBuyerCount = buyerProfileLines.length - 1; // Exclude header
      const dbBuyerCount = await db.select({ count: sql`count(*)` }).from(buyerProfiles);
      
      const buyerDiscrepancies = [];
      if (csvBuyerCount !== dbBuyerCount[0]?.count) {
        buyerDiscrepancies.push(`CSV has ${csvBuyerCount} buyer profiles, database has ${dbBuyerCount[0]?.count}`);
      }

      results.push({
        entity: "Buyer Profiles",
        csvCount: csvBuyerCount,
        dbCount: Number(dbBuyerCount[0]?.count || 0),
        discrepancies: buyerDiscrepancies,
        sampleMismatches: []
      });
    }

    console.log("✅ Validation completed");
    return results;

  } catch (error) {
    console.error("❌ Validation failed:", error);
    throw error;
  }
}
