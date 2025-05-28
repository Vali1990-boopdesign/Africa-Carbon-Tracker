import { transactions, buyerProfiles, type Transaction, type InsertTransaction, type BuyerProfile, type InsertBuyerProfile, type DashboardMetrics, type CountryData, type SectorData, type TimeSeriesData, type TopBuyerData } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, like, or, sql } from "drizzle-orm";

export interface IStorage {
  // Transaction operations
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByFilters(filters: {
    country?: string;
    sector?: string;
    projectType?: string;
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
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<DashboardMetrics>;
  getCountryData(): Promise<CountryData[]>;
  getSectorData(): Promise<SectorData[]>;
  getTimeSeriesData(): Promise<TimeSeriesData[]>;
  getTopBuyers(limit?: number): Promise<TopBuyerData[]>;
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
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values());

    if (filters.country) {
      transactions = transactions.filter(t => t.country === filters.country);
    }

    if (filters.sector) {
      transactions = transactions.filter(t => t.buyerSector === filters.sector);
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
      totalCreditsGrowth: creditsGrowth,
      activeBuyers: uniqueBuyers,
      activeBuyersGrowth: buyersGrowth,
      africanCountries: uniqueCountries,
      newCountriesThisQuarter: Math.max(uniqueCountries - 3, 0),
      averageCreditPrice: filteredTransactions.length > 0 ? totalCreditsRetired / filteredTransactions.length : 0,
      priceChange: Math.random() * 5 - 2.5 // Small random variation since we don't have price history
    };
  }

  async getCountryData(): Promise<CountryData[]> {
    const transactions = Array.from(this.transactions.values());
    const countryMap = new Map<string, { credits: number; projects: Set<string> }>();

    transactions.forEach(t => {
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

  async getSectorData(): Promise<SectorData[]> {
    const transactions = Array.from(this.transactions.values());
    const sectorMap = new Map<string, number>();
    const totalCredits = transactions.reduce((sum, t) => sum + t.creditsRetired, 0);

    transactions.forEach(t => {
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

  async getTimeSeriesData(): Promise<TimeSeriesData[]> {
    const transactions = Array.from(this.transactions.values());
    return transactions.map(t => ({
      year: t.retirementYear,
      country: t.country,
      credits: t.creditsRetired
    }));
  }

  async getTopBuyers(limit: number = 10): Promise<TopBuyerData[]> {
    const buyerProfiles = Array.from(this.buyerProfiles.values());
    const totalCredits = buyerProfiles.reduce((sum, b) => sum + b.cumulativeRetirements, 0);
    
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];
    
    return buyerProfiles
      .sort((a, b) => b.cumulativeRetirements - a.cumulativeRetirements)
      .slice(0, limit)
      .map((buyer, index) => ({
        brandName: buyer.brandName,
        sector: buyer.sector,
        totalCredits: buyer.cumulativeRetirements,
        percentage: Math.round((buyer.cumulativeRetirements / totalCredits) * 100),
        initials: buyer.brandName.split(' ').map(w => w[0]).join('').substring(0, 2),
        color: colors[index % colors.length]
      }));
  }
}

export class DatabaseStorage implements IStorage {
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }

  async getTransactionsByFilters(filters: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<Transaction[]> {
    const conditions = [];

    if (filters.country) {
      conditions.push(eq(transactions.country, filters.country));
    }

    if (filters.sector) {
      conditions.push(eq(transactions.buyerSector, filters.sector));
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

  async getDashboardMetrics(filters?: {
    country?: string;
    sector?: string;
    projectType?: string;
    startYear?: number;
    endYear?: number;
    search?: string;
  }): Promise<DashboardMetrics> {
    // Use the existing filter method to get filtered transactions
    const filteredTransactions = await this.getTransactionsByFilters(filters || {});
    const totalCreditsRetired = filteredTransactions.reduce((sum, t) => sum + t.creditsRetired, 0);
    const uniqueBuyers = new Set(filteredTransactions.map(t => t.buyerBrandName)).size;
    const uniqueCountries = new Set(filteredTransactions.map(t => t.country)).size;

    return {
      totalCreditsRetired,
      totalCreditsGrowth: 0,
      activeBuyers: uniqueBuyers,
      activeBuyersGrowth: 0,
      africanCountries: uniqueCountries,
      newCountriesThisQuarter: Math.max(uniqueCountries - 3, 0),
      averageCreditPrice: filteredTransactions.length > 0 ? totalCreditsRetired / filteredTransactions.length : 0,
      priceChange: 0
    };
  }

  async getCountryData(): Promise<CountryData[]> {
    const transactionData = await db.select().from(transactions);
    const countryMap = new Map<string, { credits: number; projects: Set<string> }>();

    transactionData.forEach(t => {
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

  async getSectorData(): Promise<SectorData[]> {
    const transactionData = await db.select().from(transactions);
    const sectorMap = new Map<string, number>();
    const totalCredits = transactionData.reduce((sum, t) => sum + t.creditsRetired, 0);

    transactionData.forEach(t => {
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

  async getTimeSeriesData(): Promise<TimeSeriesData[]> {
    const transactionData = await db.select().from(transactions);
    return transactionData.map(t => ({
      year: t.retirementYear,
      country: t.country,
      credits: t.creditsRetired
    }));
  }

  async getTopBuyers(limit: number = 10): Promise<TopBuyerData[]> {
    const buyerProfileData = await db.select().from(buyerProfiles);
    const totalCredits = buyerProfileData.reduce((sum, b) => sum + b.cumulativeRetirements, 0);
    
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];
    
    return buyerProfileData
      .sort((a, b) => b.cumulativeRetirements - a.cumulativeRetirements)
      .slice(0, limit)
      .map((buyer, index) => ({
        brandName: buyer.brandName,
        sector: buyer.sector,
        totalCredits: buyer.cumulativeRetirements,
        percentage: Math.round((buyer.cumulativeRetirements / totalCredits) * 100),
        initials: buyer.brandName.split(' ').map(w => w[0]).join('').substring(0, 2),
        color: colors[index % colors.length]
      }));
  }
}

export const storage = new DatabaseStorage();
