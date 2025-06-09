import { db } from "./db";
import { transactions, buyerProfiles } from "@shared/schema";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingTransactions = await db.select().from(transactions).limit(1);
    if (existingTransactions.length > 0) {
      console.log("Database already seeded");
      return;
    }

    // Sample transactions data based on new CSV structure
    const sampleTransactions = [
      {
        registryId: "GS2990",
        projectName: "Kikonda Forest Reserve",
        country: "Uganda",
        continent: "Africa",
        region: "Sub-Saharan Africa",
        scope: "Forestry & Land Use",
        type: "Afforestation/Reforestation",
        reductionRemoval: "Impermanent Removal",
        retirementYear: 2024,
        creditsRetired: 25000,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Microsoft Corporation",
        buyerClassification: "Corporate",
        buyerSector: "Technology/Telecommunications",
        buyerHQLocation: "United States",
        buyerHQRegion: "North America"
      },
      {
        registryId: "GS447",
        projectName: "Improved Cookstoves for Social Impact in Ugandan Communities",
        country: "Uganda",
        continent: "Africa",
        region: "Sub-Saharan Africa",
        scope: "Household & Community",
        type: "Cookstoves",
        reductionRemoval: "Reduction",
        retirementYear: 2024,
        creditsRetired: 18500,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Apple Inc.",
        buyerClassification: "Corporate",
        buyerSector: "Technology/Telecommunications",
        buyerHQLocation: "United States",
        buyerHQRegion: "North America"
      },
      {
        registryId: "GS413",
        projectName: "Improved Household Charcoal Stoves in Ghana",
        country: "Ghana",
        continent: "Africa",
        region: "Sub-Saharan Africa",
        scope: "Household & Community",
        type: "Cookstoves",
        reductionRemoval: "Reduction",
        retirementYear: 2024,
        creditsRetired: 32000,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Shell PLC",
        buyerClassification: "Corporate",
        buyerSector: "Energy/Mining/Utilities",
        buyerHQLocation: "United Kingdom",
        buyerHQRegion: "Europe"
      },
      {
        registryId: "VCS612",
        projectName: "The Kasigau Corridor REDD Project - Phase II The Community Ranches",
        country: "Kenya",
        continent: "Africa",
        region: "Sub-Saharan Africa",
        scope: "Forestry & Land Use",
        type: "REDD+",
        reductionRemoval: "Reduction",
        retirementYear: 2024,
        creditsRetired: 28300,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Amazon",
        buyerClassification: "Corporate",
        buyerSector: "Technology/Telecommunications",
        buyerHQLocation: "United States",
        buyerHQRegion: "North America"
      },
      {
        registryId: "VCS902",
        projectName: "KARIBA REDD+ PROJECT",
        country: "Zimbabwe",
        continent: "Africa",
        region: "Sub-Saharan Africa",
        scope: "Forestry & Land Use",
        type: "REDD+",
        reductionRemoval: "Reduction",
        retirementYear: 2024,
        creditsRetired: 41200,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Google LLC",
        buyerClassification: "Corporate",
        buyerSector: "Technology/Telecommunications",
        buyerHQLocation: "United States",
        buyerHQRegion: "North America"
      }
    ];

    // Sample buyer profiles based on new CSV structure
    const sampleBuyers = [
      {
        brandName: "Microsoft Corporation",
        classification: "Corporate",
        sector: "Technology/Telecommunications",
        hqLocation: "United States",
        hqRegion: "North America",
        cumulativeRetirements: 787395
      },
      {
        brandName: "Apple Inc.",
        classification: "Corporate",
        sector: "Technology/Telecommunications",
        hqLocation: "United States",
        hqRegion: "North America",
        cumulativeRetirements: 787395
      },
      {
        brandName: "Shell PLC",
        classification: "Corporate",
        sector: "Energy/Mining/Utilities",
        hqLocation: "United Kingdom",
        hqRegion: "Europe",
        cumulativeRetirements: 203700
      },
      {
        brandName: "Amazon",
        classification: "Corporate",
        sector: "Technology/Telecommunications",
        hqLocation: "United States",
        hqRegion: "North America",
        cumulativeRetirements: 156800
      },
      {
        brandName: "Google LLC",
        classification: "Corporate",
        sector: "Technology/Telecommunications",
        hqLocation: "United States",
        hqRegion: "North America",
        cumulativeRetirements: 412600
      }
    ];

    // Insert sample data
    await db.insert(transactions).values(sampleTransactions);
    await db.insert(buyerProfiles).values(sampleBuyers);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}