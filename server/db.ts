import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { sql } from 'drizzle-orm';

// Configure Neon for WebSocket connections
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with better error handling and connection settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
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