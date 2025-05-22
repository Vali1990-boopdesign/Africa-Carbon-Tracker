import { pgTable, text, serial, integer, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  registryId: text("registry_id").notNull(),
  projectName: text("project_name").notNull(),
  country: text("country").notNull(),
  continent: text("continent").notNull(),
  region: text("region").notNull(),
  scope: text("scope").notNull(),
  type: text("type").notNull(),
  reductionRemoval: text("reduction_removal").notNull(),
  retirementYear: integer("retirement_year").notNull(),
  creditsRetired: integer("credits_retired").notNull(),
  retirementReason: text("retirement_reason").notNull(),
  buyerBrandName: text("buyer_brand_name").notNull(),
  buyerClassification: text("buyer_classification").notNull(),
  buyerSector: text("buyer_sector").notNull(),
  buyerHQLocation: text("buyer_hq_location").notNull(),
  buyerHQRegion: text("buyer_hq_region").notNull(),
});

export const buyerProfiles = pgTable("buyer_profiles", {
  id: serial("id").primaryKey(),
  brandName: text("brand_name").notNull().unique(),
  classification: text("classification").notNull(),
  sector: text("sector").notNull(),
  hqLocation: text("hq_location").notNull(),
  hqRegion: text("hq_region").notNull(),
  cumulativeRetirements: integer("cumulative_retirements").notNull().default(0),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

export const insertBuyerProfileSchema = createInsertSchema(buyerProfiles).omit({
  id: true,
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type BuyerProfile = typeof buyerProfiles.$inferSelect;
export type InsertBuyerProfile = z.infer<typeof insertBuyerProfileSchema>;

// Additional types for dashboard
export interface DashboardMetrics {
  totalCreditsRetired: number;
  totalCreditsGrowth: number;
  activeBuyers: number;
  activeBuyersGrowth: number;
  africanCountries: number;
  newCountriesThisQuarter: number;
  averageCreditPrice: number;
  priceChange: number;
}

export interface CountryData {
  country: string;
  totalCredits: number;
  activeProjects: number;
  coordinates: [number, number];
}

export interface SectorData {
  sector: string;
  percentage: number;
  totalCredits: number;
  color: string;
}

export interface TimeSeriesData {
  year: number;
  country: string;
  credits: number;
}

export interface TopBuyerData {
  brandName: string;
  sector: string;
  totalCredits: number;
  percentage: number;
  initials: string;
  color: string;
}
