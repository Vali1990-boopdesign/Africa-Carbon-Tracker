
import { db } from "./db";
import { bilateralAgreements } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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

function parseNumber(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const num = parseInt(value.replace(/[^0-9-]/g, ''));
  return isNaN(num) ? null : num;
}

export async function importBilateralAgreements() {
  try {
    console.log("Starting bilateral agreements import...");
    
    // Clear existing bilateral agreements
    await db.delete(bilateralAgreements);
    console.log("Cleared existing bilateral agreements data");
    
    const csvPath = path.join(process.cwd(), "attached_assets", "3b-[External] Africa Carbon Buyers_v2024 - Africa's Bi-Lateral Agreements_1749477252806.csv");
    
    if (!fs.existsSync(csvPath)) {
      console.error("CSV file not found:", csvPath);
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter(line => line.trim());
    
    if (lines.length === 0) {
      console.log("No data found in CSV file");
      return;
    }
    
    const headers = parseCSVLine(lines[0]);
    console.log("CSV Headers:", headers);
    
    const agreementsArray: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      const values = parseCSVLine(line);
      if (values.length !== headers.length) {
        console.log(`Skipping line ${i + 1}: column count mismatch`);
        continue;
      }
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      
      // Map CSV columns to database fields
      if (row["Agreement Name"] && row["Country"]) {
        agreementsArray.push({
          agreementName: row["Agreement Name"] || "",
          country: row["Country"] || "",
          partner: row["Partner"] || "",
          signingYear: parseNumber(row["Signing Year"]) || null,
          status: row["Status"] || "Unknown",
          agreementType: row["Agreement Type"] || "",
          description: row["Description"] || "",
        });
      }
    }
    
    // Insert bilateral agreements in batches
    const batchSize = 100;
    for (let i = 0; i < agreementsArray.length; i += batchSize) {
      const batch = agreementsArray.slice(i, i + batchSize);
      await db.insert(bilateralAgreements).values(batch);
      console.log(`Imported ${Math.min(i + batchSize, agreementsArray.length)} of ${agreementsArray.length} bilateral agreements...`);
    }
    
    console.log(`✅ Bilateral agreements import completed! Imported ${agreementsArray.length} records`);
    return agreementsArray.length;
  } catch (error) {
    console.error("❌ Bilateral agreements import failed:", error);
    throw error;
  }
}
