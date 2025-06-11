
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
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}
