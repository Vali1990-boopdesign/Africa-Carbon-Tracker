import { transactions, buyerProfiles, type Transaction, type InsertTransaction, type BuyerProfile, type InsertBuyerProfile, type DashboardMetrics, type CountryData, type SectorData, type TimeSeriesData, type TopBuyerData } from "@shared/schema";

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
  getDashboardMetrics(): Promise<DashboardMetrics>;
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

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const transactions = Array.from(this.transactions.values());
    const totalCreditsRetired = transactions.reduce((sum, t) => sum + t.creditsRetired, 0);
    const uniqueBuyers = new Set(transactions.map(t => t.buyerBrandName)).size;
    const uniqueCountries = new Set(transactions.map(t => t.country)).size;

    return {
      totalCreditsRetired: Math.round(totalCreditsRetired / 1000), // Convert to thousands
      totalCreditsGrowth: 12.5,
      activeBuyers: uniqueBuyers,
      activeBuyersGrowth: 234,
      africanCountries: uniqueCountries,
      newCountriesThisQuarter: 6,
      averageCreditPrice: 12.45,
      priceChange: -2.1
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

export const storage = new MemStorage();
