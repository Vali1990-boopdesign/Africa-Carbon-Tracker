import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { sql } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool — no SSL in development (Helium runs locally), SSL in production
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle({ client: pool, schema });

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  let retries = 3;

  while (retries > 0) {
    try {
      await db.execute(sql`SELECT 1`);
      console.log("✅ Database connection successful");
      return true;
    } catch (error) {
      retries--;
      console.error(`❌ Database connection failed (${3 - retries}/3):`, error.message);

      if (retries > 0) {
        console.log("⏳ Retrying database connection in 2 seconds...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.error("❌ Database connection failed after 3 attempts");
  return false;
}
