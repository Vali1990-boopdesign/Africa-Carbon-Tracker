
import { db } from "./db";
import { bilateralAgreements } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function runMigrations() {
  try {
    console.log("Running migrations...");
    
    // Create bilateral_agreements table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bilateral_agreements (
        id SERIAL PRIMARY KEY,
        agreement_name TEXT NOT NULL,
        country TEXT NOT NULL,
        partner TEXT NOT NULL,
        signing_year INTEGER,
        status TEXT NOT NULL,
        agreement_type TEXT NOT NULL,
        description TEXT
      )
    `);
    
    console.log("✅ Bilateral agreements table created successfully");
    
    // Create composite indexes for transactions table to speed up dashboard queries
    // Note: retirement_year is the leading column because most queries filter by year range first
    console.log("Creating performance indexes...");
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_year_country 
      ON transactions(retirement_year, country)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_year_buyer_location 
      ON transactions(retirement_year, buyer_hq_location)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_year_buyer_sector 
      ON transactions(retirement_year, buyer_sector)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_year_scope 
      ON transactions(retirement_year, scope)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_year_type 
      ON transactions(retirement_year, type)
    `);
    
    console.log("✅ Performance indexes created successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}
