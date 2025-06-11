import { db } from "./db";
import { transactions, buyerProfiles, bilateralAgreements } from "@shared/schema";
import { importBilateralAgreements } from "./import-bilateral";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingTransactions = await db.select().from(transactions).limit(1);
    if (existingTransactions.length > 0) {
      console.log("Database already seeded");
      
      // Check if bilateral agreements exist, if not import them
      const existingAgreements = await db.select().from(bilateralAgreements).limit(1);
      if (existingAgreements.length === 0) {
        console.log("Importing bilateral agreements...");
        await importBilateralAgreements();
      }
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
      },
      {
        registryId: "ACR004",
        projectName: "Ghana Wind Energy Project",
        country: "Ghana",
        continent: "Africa",
        region: "West Africa",
        scope: "Renewable Energy",
        type: "Wind",
        reductionRemoval: "Reduction",
        retirementYear: 2023,
        creditsRetired: 15500,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Amazon",
        buyerClassification: "Corporate",
        buyerSector: "Technology",
        buyerHQLocation: "United States",
        buyerHQRegion: "North America"
      },
      {
        registryId: "ACR005",
        projectName: "Ethiopian Hydroelectric Development",
        country: "Ethiopia",
        continent: "Africa",
        region: "East Africa",
        scope: "Renewable Energy",
        type: "Hydroelectric",
        reductionRemoval: "Reduction",
        retirementYear: 2022,
        creditsRetired: 41200,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Google LLC",
        buyerClassification: "Corporate",
        buyerSector: "Technology",
        buyerHQLocation: "United States",
        buyerHQRegion: "North America"
      },
      {
        registryId: "ACR006",
        projectName: "Morocco Desert Solar Initiative",
        country: "Morocco",
        continent: "Africa",
        region: "North Africa",
        scope: "Renewable Energy",
        type: "Solar",
        reductionRemoval: "Reduction",
        retirementYear: 2023,
        creditsRetired: 28300,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Tesla Inc.",
        buyerClassification: "Corporate",
        buyerSector: "Automotive",
        buyerHQLocation: "United States",
        buyerHQRegion: "North America"
      },
      {
        registryId: "ACR007",
        projectName: "Zambian Copper Mine Efficiency",
        country: "Zambia",
        continent: "Africa",
        region: "Southern Africa",
        scope: "Industrial",
        type: "Energy Efficiency",
        reductionRemoval: "Reduction",
        retirementYear: 2022,
        creditsRetired: 12800,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Vale S.A.",
        buyerClassification: "Corporate",
        buyerSector: "Mining",
        buyerHQLocation: "Brazil",
        buyerHQRegion: "South America"
      },
      {
        registryId: "ACR008",
        projectName: "Egyptian Clean Transport Program",
        country: "Egypt",
        continent: "Africa",
        region: "North Africa",
        scope: "Transportation",
        type: "Electric Vehicles",
        reductionRemoval: "Reduction",
        retirementYear: 2023,
        creditsRetired: 9600,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Uber Technologies",
        buyerClassification: "Corporate",
        buyerSector: "Transportation",
        buyerHQLocation: "United States",
        buyerHQRegion: "North America"
      },
      {
        registryId: "ACR009",
        projectName: "Tanzanian Geothermal Development",
        country: "Tanzania",
        continent: "Africa",
        region: "East Africa",
        scope: "Renewable Energy",
        type: "Geothermal",
        reductionRemoval: "Reduction",
        retirementYear: 2022,
        creditsRetired: 35700,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Meta Platforms",
        buyerClassification: "Corporate",
        buyerSector: "Technology",
        buyerHQLocation: "United States",
        buyerHQRegion: "North America"
      },
      {
        registryId: "ACR010",
        projectName: "Botswana Wildlife Conservation",
        country: "Botswana",
        continent: "Africa",
        region: "Southern Africa",
        scope: "Forestry",
        type: "Conservation",
        reductionRemoval: "Removal",
        retirementYear: 2023,
        creditsRetired: 17900,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Nike Inc.",
        buyerClassification: "Corporate",
        buyerSector: "Consumer Goods",
        buyerHQLocation: "United States",
        buyerHQRegion: "North America"
      },
      {
        registryId: "ACR011",
        projectName: "Senegal Ocean Wind Farm",
        country: "Senegal",
        continent: "Africa",
        region: "West Africa",
        scope: "Renewable Energy",
        type: "Offshore Wind",
        reductionRemoval: "Reduction",
        retirementYear: 2023,
        creditsRetired: 22400,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Volkswagen AG",
        buyerClassification: "Corporate",
        buyerSector: "Automotive",
        buyerHQLocation: "Germany",
        buyerHQRegion: "Europe"
      },
      {
        registryId: "ACR012",
        projectName: "Rwanda Urban Solar Rooftops",
        country: "Rwanda",
        continent: "Africa",
        region: "East Africa",
        scope: "Renewable Energy",
        type: "Solar",
        reductionRemoval: "Reduction",
        retirementYear: 2022,
        creditsRetired: 8900,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "IKEA Group",
        buyerClassification: "Corporate",
        buyerSector: "Retail",
        buyerHQLocation: "Sweden",
        buyerHQRegion: "Europe"
      },
      {
        registryId: "ACR013",
        projectName: "Madagascar Rainforest Protection",
        country: "Madagascar",
        continent: "Africa",
        region: "East Africa",
        scope: "Forestry",
        type: "REDD+",
        reductionRemoval: "Removal",
        retirementYear: 2023,
        creditsRetired: 29800,
        retirementReason: "Corporate Neutrality",
        buyerBrandName: "Unilever PLC",
        buyerClassification: "Corporate",
        buyerSector: "Consumer Goods",
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
      },
      {
        brandName: "Amazon",
        classification: "Corporate",
        sector: "Technology",
        hqLocation: "United States",
        hqRegion: "North America",
        cumulativeRetirements: 156800
      },
      {
        brandName: "Google LLC",
        classification: "Corporate",
        sector: "Technology",
        hqLocation: "United States",
        hqRegion: "North America",
        cumulativeRetirements: 412600
      },
      {
        brandName: "Tesla Inc.",
        classification: "Corporate",
        sector: "Automotive",
        hqLocation: "United States",
        hqRegion: "North America",
        cumulativeRetirements: 289400
      },
      {
        brandName: "Vale S.A.",
        classification: "Corporate",
        sector: "Mining",
        hqLocation: "Brazil",
        hqRegion: "South America",
        cumulativeRetirements: 128900
      },
      {
        brandName: "Uber Technologies",
        classification: "Corporate",
        sector: "Transportation",
        hqLocation: "United States",
        hqRegion: "North America",
        cumulativeRetirements: 96700
      },
      {
        brandName: "Meta Platforms",
        classification: "Corporate",
        sector: "Technology",
        hqLocation: "United States",
        hqRegion: "North America",
        cumulativeRetirements: 357800
      },
      {
        brandName: "Nike Inc.",
        classification: "Corporate",
        sector: "Consumer Goods",
        hqLocation: "United States",
        hqRegion: "North America",
        cumulativeRetirements: 179300
      },
      {
        brandName: "Volkswagen AG",
        classification: "Corporate",
        sector: "Automotive",
        hqLocation: "Germany",
        hqRegion: "Europe",
        cumulativeRetirements: 224700
      },
      {
        brandName: "IKEA Group",
        classification: "Corporate",
        sector: "Retail",
        hqLocation: "Sweden",
        hqRegion: "Europe",
        cumulativeRetirements: 89200
      },
      {
        brandName: "Unilever PLC",
        classification: "Corporate",
        sector: "Consumer Goods",
        hqLocation: "United Kingdom",
        hqRegion: "Europe",
        cumulativeRetirements: 298600
      }
    ];

    // Insert sample data
    await db.insert(transactions).values(sampleTransactions);
    await db.insert(buyerProfiles).values(sampleBuyers);

    // Import bilateral agreements from CSV
    console.log("Importing bilateral agreements...");
    await importBilateralAgreements();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}