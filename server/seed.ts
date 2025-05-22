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

    // Sample transactions data
    const sampleTransactions = [
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

    // Sample buyer profiles
    const sampleBuyers = [
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

    // Insert sample data
    await db.insert(transactions).values(sampleTransactions);
    await db.insert(buyerProfiles).values(sampleBuyers);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}