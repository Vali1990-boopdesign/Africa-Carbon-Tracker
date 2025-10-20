import { transactions, buyerProfiles, type Transaction, type InsertTransaction, type BuyerProfile, type InsertBuyerProfile, type DashboardMetrics, type CountryData, type SectorData, type TimeSeriesData, type TopBuyerData, type ScopeData } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, like, or, sql, inArray, type SQL } from "drizzle-orm";

export interface IStorage {
  // Transaction operations
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByFilters(filters: {
    country?: string[];
    sector?: string[];
    projectType?: string;
    scope?: string[];
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Buyer profile operations
  getBuyerProfiles(): Promise<BuyerProfile[]>;
  getBuyerProfile(brandName: string): Promise<BuyerProfile | undefined>;
  createBuyerProfile(profile: InsertBuyerProfile): Promise<BuyerProfile>;

  // Dashboard analytics
  getDashboardMetrics(filters?: {
    country?: string[];
    sector?: string[];
    projectType?: string;
    scope?: string[];
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<DashboardMetrics>;
  getCountryData(filters?: {
    country?: string[];
    sector?: string[];
    projectType?: string;
    scope?: string[];
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<CountryData[]>;
  getSectorData(filters?: {
    country?: string[];
    sector?: string[];
    projectType?: string;
    scope?: string[];
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<SectorData[]>;
  getTimeSeriesData(filters?: {
    country?: string[];
    sector?: string[];
    projectType?: string;
    scope?: string[];
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<TimeSeriesData[]>;
  getTopBuyers(limit?: number, filters?: {
    country?: string[];
    sector?: string[];
    projectType?: string;
    scope?: string[];
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<TopBuyerData[]>;
  getScopeData(filters?: {
    country?: string[];
    sector?: string[];
    projectType?: string;
    scope?: string[];
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<ScopeData[]>;
}

export interface DashboardFilters {
  country?: string[];
  sector?: string[];
  projectType?: string;
  startYear?: number;
  endYear?: number;
  search?: string;
}

export class MemStorage implements IStorage {
  private transactions: Map<number, Transaction>;
  private buyerProfiles: Map<string, BuyerProfile>;
  private currentTransactionId: number;
  private currentBuyerProfileId: number;

  constructor() {
    this.transactions = new Map();
    this.buyerProfiles = new Map();
    this.currentTransactionId = 1;
    this.currentBuyerProfileId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample transactions - real-world structure but minimal data
    const sampleTransactions: InsertTransaction[] = [
      {
        registryId: "ACR001",
        projectName: "Kruger National Park Forest Conservation",
        country: "South Africa",
        continent: "Africa",
        region: "Southern Africa",
        scope: "Forestry",
        type: "Afforestation",
        reductionRemoval: "Removal",
        retirementYear: 2023,
        creditsRetired: 24500,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Microsoft Corporation",
        buyerClassification: "Corporate",
        buyerSector: "Technology",
        buyerHQLocation: "United States",
        buyerHQRegion: "North America"
      },
      {
        registryId: "ACR002",
        projectName: "Kenyan Solar Farm Initiative",
        country: "Kenya",
        continent: "Africa",
        region: "East Africa",
        scope: "Renewable Energy",
        type: "Solar",
        reductionRemoval: "Reduction",
        retirementYear: 2023,
        creditsRetired: 18750,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Apple Inc.",
        buyerClassification: "Corporate",
        buyerSector: "Technology",
        buyerHQLocation: "United States",
        buyerHQRegion: "North America"
      },
      {
        registryId: "ACR003",
        projectName: "Lagos Waste-to-Energy Project",
        country: "Nigeria",
        continent: "Africa",
        region: "West Africa",
        scope: "Waste Management",
        type: "Methane Capture",
        reductionRemoval: "Reduction",
        retirementYear: 2022,
        creditsRetired: 32100,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Shell PLC",
        buyerClassification: "Corporate",
        buyerSector: "Energy",
        buyerHQLocation: "United Kingdom",
        buyerHQRegion: "Europe"
      }
    ];

    // Add sample transactions
    sampleTransactions.forEach(transaction => {
      const id = this.currentTransactionId++;
      this.transactions.set(id, { ...transaction, id });
    });

    // Sample buyer profiles
    const sampleBuyers: InsertBuyerProfile[] = [
      {
        brandName: "Microsoft Corporation",
        classification: "Corporate",
        sector: "Technology",
        hqLocation: "United States",
        hqRegion: "North America",
        cumulativeRetirements: 324500
      },
      {
        brandName: "Apple Inc.",
        classification: "Corporate",
        sector: "Technology",
        hqLocation: "United States",
        hqRegion: "North America",
        cumulativeRetirements: 287300
      },
      {
        brandName: "Shell PLC",
        classification: "Corporate",
        sector: "Energy",
        hqLocation: "United Kingdom",
        hqRegion: "Europe",
        cumulativeRetirements: 203700
      }
    ];

    // Add sample buyer profiles
    sampleBuyers.forEach(buyer => {
      const id = this.currentBuyerProfileId++;
      this.buyerProfiles.set(buyer.brandName, { 
        ...buyer, 
        id,
        cumulativeRetirements: buyer.cumulativeRetirements || 0 
      });
    });
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransactionsByFilters(filters: {
    country?: string[];
    sector?: string[];
    projectType?: string;
    scope?: string[];
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values());

    // Handle array filters
    if (filters.country && filters.country.length > 0) {
      transactions = transactions.filter(t => filters.country!.includes(t.country));
    }

    if (filters.sector && filters.sector.length > 0) {
      transactions = transactions.filter(t => filters.sector!.includes(t.buyerSector));
    }

    if (filters.scope && filters.scope.length > 0) {
      transactions = transactions.filter(t => filters.scope!.includes(t.scope));
    }

    if (filters.projectType) {
      transactions = transactions.filter(t => t.type === filters.projectType);
    }

    if (filters.startYear) {
      transactions = transactions.filter(t => t.retirementYear >= filters.startYear!);
    }

    if (filters.endYear) {
      transactions = transactions.filter(t => t.retirementYear <= filters.endYear!);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      transactions = transactions.filter(t => 
        t.buyerBrandName.toLowerCase().includes(searchLower) ||
        t.country.toLowerCase().includes(searchLower) ||
        t.projectName.toLowerCase().includes(searchLower)
      );
    }

    return transactions;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const newTransaction: Transaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getBuyerProfiles(): Promise<BuyerProfile[]> {
    return Array.from(this.buyerProfiles.values());
  }

  async getBuyerProfile(brandName: string): Promise<BuyerProfile | undefined> {
    return this.buyerProfiles.get(brandName);
  }

  async createBuyerProfile(profile: InsertBuyerProfile): Promise<BuyerProfile> {
    const id = this.currentBuyerProfileId++;
    const newProfile: BuyerProfile = { 
      ...profile, 
      id,
      cumulativeRetirements: profile.cumulativeRetirements || 0
    };
    this.buyerProfiles.set(profile.brandName, newProfile);
    return newProfile;
  }

  async getDashboardMetrics(filters?: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<DashboardMetrics> {
    // Apply filters to get filtered transactions
    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    const allTransactions = Array.from(this.transactions.values());

    const totalCreditsRetired = filteredTransactions.reduce((sum, t) => sum + t.creditsRetired, 0);
    const uniqueBuyers = new Set(filteredTransactions.map(t => t.buyerBrandName)).size;
    const uniqueCountries = new Set(filteredTransactions.map(t => t.country)).size;

    // Calculate growth vs unfiltered data for comparison
    const allCredits = allTransactions.reduce((sum, t) => sum + t.creditsRetired, 0);
    const allBuyers = new Set(allTransactions.map(t => t.buyerBrandName)).size;

    const creditsGrowth = allCredits > 0 ? ((totalCreditsRetired / allCredits - 1) * 100) : 0;
    const buyersGrowth = allBuyers > 0 ? ((uniqueBuyers / allBuyers - 1) * 100) : 0;

    return {
      totalCreditsRetired,
      totalCreditsGrowth: Math.round(creditsGrowth * 100) / 100,
      activeBuyers: uniqueBuyers,
      activeBuyersGrowth: Math.round(buyersGrowth * 100) / 100,
      africanCountries: uniqueCountries,
      newCountriesThisQuarter: Math.max(uniqueCountries - 3, 0),
      averageCreditsPerTransaction: filteredTransactions.length > 0 ? Math.round(totalCreditsRetired / filteredTransactions.length) : 0,
      transactionChange: Math.round(Math.random() * 5 - 2.5 * 100) / 100,
    };
  }

  async getCountryData(filters?: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<CountryData[]> {
    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    const countryMap = new Map<string, { credits: number; projects: Set<string> }>();

    filteredTransactions.forEach(t => {
      if (!countryMap.has(t.country)) {
        countryMap.set(t.country, { credits: 0, projects: new Set() });
      }
      const data = countryMap.get(t.country)!;
      data.credits += t.creditsRetired;
      data.projects.add(t.projectName);
    });

    // Sample coordinates for African countries
    const coordinates: Record<string, [number, number]> = {
      "South Africa": [-30.5595, 22.9375],
      "Kenya": [-0.0236, 37.9062],
      "Nigeria": [9.0820, 8.6753]
    };

    return Array.from(countryMap.entries()).map(([country, data]) => ({
      country,
      totalCredits: data.credits,
      activeProjects: data.projects.size,
      coordinates: coordinates[country] || [0, 0]
    }));
  }

  async getSectorData(filters?: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<SectorData[]> {
    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    const sectorMap = new Map<string, number>();
    const totalCredits = filteredTransactions.reduce((sum, t) => sum + t.creditsRetired, 0);

    filteredTransactions.forEach(t => {
      sectorMap.set(t.buyerSector, (sectorMap.get(t.buyerSector) || 0) + t.creditsRetired);
    });

    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];

    return Array.from(sectorMap.entries()).map(([sector, credits], index) => ({
      sector,
      totalCredits: credits,
      percentage: Math.round((credits / totalCredits) * 100),
      color: colors[index % colors.length]
    }));
  }

  async getTimeSeriesData(filters?: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<TimeSeriesData[]> {
    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    return filteredTransactions.map(t => ({
      year: t.retirementYear,
      country: t.country,
      credits: t.creditsRetired
    }));
  }

  async getTopBuyers(limit: number = 10, filters?: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<TopBuyerData[]> {
    // Use filtered transactions to calculate top buyers for the filtered dataset
    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    const buyerMap = new Map<string, { credits: number; sector: string }>();

    filteredTransactions.forEach(t => {
      if (!buyerMap.has(t.buyerBrandName)) {
        buyerMap.set(t.buyerBrandName, { credits: 0, sector: t.buyerSector });
      }
      buyerMap.get(t.buyerBrandName)!.credits += t.creditsRetired;
    });

    const totalCredits = Array.from(buyerMap.values()).reduce((sum, b) => sum + b.credits, 0);
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

    return Array.from(buyerMap.entries())
      .sort((a, b) => b[1].credits - a[1].credits)
      .slice(0, limit)
      .map(([brandName, data], index) => ({
        brandName,
        sector: data.sector,
        totalCredits: data.credits,
        percentage: totalCredits > 0 ? (data.credits / totalCredits) * 100 : 0,
        initials: brandName.split(' ').map(w => w[0]).join('').substring(0, 2),
        color: colors[index % colors.length]
      }));
  }

  async getScopeData(filters?: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<ScopeData[]> {
    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    const scopeMap = new Map<string, number>();
    const totalCredits = filteredTransactions.reduce((sum, t) => sum + t.creditsRetired, 0);

    filteredTransactions.forEach(t => {
      scopeMap.set(t.scope, (scopeMap.get(t.scope) || 0) + t.creditsRetired);
    });

    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16"];

    return Array.from(scopeMap.entries()).map(([scope, credits], index) => ({
      scope,
      totalCredits: credits,
      percentage: totalCredits > 0 ? (credits / totalCredits) * 100 : 0,
      color: colors[index % colors.length]
    })).sort((a, b) => b.totalCredits - a.totalCredits);
  }
}

export class DatabaseStorage implements IStorage {
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }

  async getTransactionsByFilters(filters: {
    country?: string[];
    sector?: string[];
    projectType?: string;
    scope?: string[];
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<Transaction[]> {
    const conditions = [];

    // Handle array filters with inArray
    if (filters.country && filters.country.length > 0) {
      conditions.push(inArray(transactions.country, filters.country));
    }

    if (filters.sector && filters.sector.length > 0) {
      conditions.push(inArray(transactions.buyerSector, filters.sector));
    }

    if (filters.projectType) {
      conditions.push(eq(transactions.type, filters.projectType));
    }

    if (filters.scope && filters.scope.length > 0) {
      conditions.push(inArray(transactions.scope, filters.scope));
    }

    if (filters.startYear) {
      conditions.push(gte(transactions.retirementYear, filters.startYear));
    }

    if (filters.endYear) {
      conditions.push(lte(transactions.retirementYear, filters.endYear));
    }

    if (filters.search) {
      conditions.push(
        or(
          like(transactions.buyerBrandName, `%${filters.search}%`),
          like(transactions.country, `%${filters.search}%`),
          like(transactions.projectName, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length === 0) {
      return await this.getTransactions();
    }

    return await db.select().from(transactions).where(and(...conditions));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getBuyerProfiles(): Promise<BuyerProfile[]> {
    return await db.select().from(buyerProfiles);
  }

  async getBuyerProfile(brandName: string): Promise<BuyerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(buyerProfiles)
      .where(eq(buyerProfiles.brandName, brandName));
    return profile || undefined;
  }

  async createBuyerProfile(profile: InsertBuyerProfile): Promise<BuyerProfile> {
    const [newProfile] = await db
      .insert(buyerProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, maxRetries: number = 2): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Check if it's a connection error
        if (error.code === '57P01' || error.message?.includes('terminating connection')) {
          console.log(`Database connection lost, retrying... (${attempt + 1}/${maxRetries + 1})`);

          if (attempt < maxRetries) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
        }

        // If it's not a connection error or we've exhausted retries, throw
        throw error;
      }
    }

    throw lastError;
  }

  async getDashboardMetrics(filters: DashboardFilters = {}): Promise<DashboardMetrics> {
    try {
      const whereConditions = this.buildWhereConditions(filters);

      // Get total credits retired with retry logic
      const totalCreditsResult = await this.executeWithRetry(() =>
        db
          .select({ total: sql<number>`COALESCE(SUM(${transactions.creditsRetired}), 0)` })
          .from(transactions)
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      );

    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    const totalCreditsRetired = filteredTransactions.reduce((sum, t) => sum + t.creditsRetired, 0);
    const uniqueBuyers = new Set(filteredTransactions.map(t => t.buyerBrandName)).size;
    const uniqueCountries = new Set(filteredTransactions.map(t => t.country)).size;

    // Calculate current averages
    const avgCreditsPerTransaction = filteredTransactions.length > 0 ? totalCreditsRetired / filteredTransactions.length : 0;

    return {
      totalCreditsRetired,
      totalCreditsGrowth: 0,
      activeBuyers: uniqueBuyers,
      activeBuyersGrowth: 0,
      africanCountries: uniqueCountries,
      newCountriesThisQuarter: Math.max(uniqueCountries - 3, 0),
      averageCreditsPerTransaction: Math.round(avgCreditsPerTransaction),
      transactionChange: 0,
    };
  } catch (error) {
      console.error("Error in getDashboardMetrics:", error);
      throw error;
    }
  }

  private buildWhereConditions(filters: DashboardFilters): SQL[] {
    const conditions: SQL[] = [];

    // Handle array filters with inArray
    if (filters.country && filters.country.length > 0) {
      conditions.push(inArray(transactions.country, filters.country));
    }

    if (filters.sector && filters.sector.length > 0) {
      conditions.push(inArray(transactions.buyerSector, filters.sector));
    }

    if (filters.projectType) {
      conditions.push(eq(transactions.type, filters.projectType));
    }

    if (filters.startYear) {
      conditions.push(gte(transactions.retirementYear, filters.startYear));
    }

    if (filters.endYear) {
      conditions.push(lte(transactions.retirementYear, filters.endYear));
    }

    if (filters.search) {
      conditions.push(
        or(
          like(transactions.buyerBrandName, `%${filters.search}%`),
          like(transactions.country, `%${filters.search}%`),
          like(transactions.projectName, `%${filters.search}%`)
        )
      );
    }

    return conditions;
  }

  async getCountryData(filters?: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<CountryData[]> {
    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    const countryMap = new Map<string, { credits: number; projects: Set<string> }>();

    filteredTransactions.forEach(t => {
      if (!countryMap.has(t.country)) {
        countryMap.set(t.country, { credits: 0, projects: new Set() });
      }
      const data = countryMap.get(t.country)!;
      data.credits += t.creditsRetired;
      data.projects.add(t.projectName);
    });

    // Sample coordinates for African countries
    const coordinates: Record<string, [number, number]> = {
      "South Africa": [-30.5595, 22.9375],
      "Kenya": [-0.0236, 37.9062],
      "Nigeria": [9.0820, 8.6753]
    };

    return Array.from(countryMap.entries()).map(([country, data]) => ({
      country,
      totalCredits: data.credits,
      activeProjects: data.projects.size,
      coordinates: coordinates[country] || [0, 0]
    }));
  }

  async getSectorData(filters?: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<SectorData[]> {
    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    const sectorMap = new Map<string, number>();
    const totalCredits = filteredTransactions.reduce((sum, t) => sum + t.creditsRetired, 0);

    filteredTransactions.forEach(t => {
      sectorMap.set(t.buyerSector, (sectorMap.get(t.buyerSector) || 0) + t.creditsRetired);
    });

    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];

    return Array.from(sectorMap.entries()).map(([sector, credits], index) => ({
      sector,
      totalCredits: credits,
      percentage: totalCredits > 0 ? (credits / totalCredits) * 100 : 0,
      color: colors[index % colors.length]
    })).sort((a, b) => b.totalCredits - a.totalCredits);
  }

  async getTimeSeriesData(filters?: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<TimeSeriesData[]> {
    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    return filteredTransactions.map(t => ({
      year: t.retirementYear,
      country: t.country,
      credits: t.creditsRetired
    }));
  }

  async getTopBuyers(limit: number = 10, filters?: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<TopBuyerData[]> {
    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    const buyerMap = new Map<string, { credits: number; sector: string }>();

    filteredTransactions.forEach(t => {
      if (!buyerMap.has(t.buyerBrandName)) {
        buyerMap.set(t.buyerBrandName, { credits: 0, sector: t.buyerSector });
      }
      buyerMap.get(t.buyerBrandName)!.credits += t.creditsRetired;
    });

    const totalCredits = Array.from(buyerMap.values()).reduce((sum, b) => sum + b.credits, 0);
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

    return Array.from(buyerMap.entries())
      .sort((a, b) => b[1].credits - a[1].credits)
      .slice(0, limit)
      .map(([brandName, data], index) => ({
        brandName,
        sector: data.sector,
        totalCredits: data.credits,
        percentage: totalCredits > 0 ? (data.credits / totalCredits) * 100 : 0,
        initials: brandName.split(' ').map(w => w[0]).join('').substring(0, 2),
        color: colors[index % colors.length]
      }));
  }

  async getScopeData(filters?: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<ScopeData[]> {
    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    const scopeMap = new Map<string, number>();
    const totalCredits = filteredTransactions.reduce((sum, t) => sum + t.creditsRetired, 0);

    filteredTransactions.forEach(t => {
      scopeMap.set(t.scope, (scopeMap.get(t.scope) || 0) + t.creditsRetired);
    });

    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16"];

    return Array.from(scopeMap.entries()).map(([scope, credits], index) => ({
      scope,
      totalCredits: credits,
      percentage: totalCredits > 0 ? (credits / totalCredits) * 100 : 0,
      color: colors[index % colors.length]
    })).sort((a, b) => b.totalCredits - a.totalCredits);
  }
}

export const storage = new DatabaseStorage();