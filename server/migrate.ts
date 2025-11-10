
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
    console.log("Creating performance indexes...");
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_country_year 
      ON transactions(country, retirement_year)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_buyer_location_year 
      ON transactions(buyer_hq_location, retirement_year)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_buyer_sector_year 
      ON transactions(buyer_sector, retirement_year)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_scope_year 
      ON transactions(scope, retirement_year)
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_type_year 
      ON transactions(type, retirement_year)
    `);
    
    console.log("✅ Performance indexes created successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}
