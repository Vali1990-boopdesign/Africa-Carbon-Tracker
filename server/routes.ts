import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { transactions, buyerProfiles, bilateralAgreements } from "@shared/schema";
import { desc, sql, eq, and, gte, lte, inArray } from "drizzle-orm";
import type { DashboardMetrics, CountryData, SectorData, TimeSeriesData, TopBuyerData } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard metrics endpoint with filters
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const { country, sector, projectType, startYear, endYear, search } = req.query;

      const filters = {
        country: country as string,
        sector: sector as string,
        projectType: projectType as string,
        startYear: startYear ? parseInt(startYear as string) : undefined,
        endYear: endYear ? parseInt(endYear as string) : undefined,
        search: search as string,
      };

      const metrics = await storage.getDashboardMetrics(filters);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // Transactions endpoint with filtering
  app.get("/api/transactions", async (req, res) => {
    try {
      const { country, sector, projectType, startYear, endYear, search } = req.query;

      const filters = {
        country: country as string,
        sector: sector as string,
        projectType: projectType as string,
        startYear: startYear ? parseInt(startYear as string) : undefined,
        endYear: endYear ? parseInt(endYear as string) : undefined,
        search: search as string,
      };

      const transactions = await storage.getTransactionsByFilters(filters);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Country data for map with filters
  app.get("/api/dashboard/countries", async (req, res) => {
    try {
      const { country, sector, projectType, startYear, endYear, search } = req.query;

      const filters = {
        country: country as string,
        sector: sector as string,
        projectType: projectType as string,
        startYear: startYear ? parseInt(startYear as string) : undefined,
        endYear: endYear ? parseInt(endYear as string) : undefined,
        search: search as string,
      };

      const countryData = await storage.getCountryData(filters);
      res.json(countryData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch country data" });
    }
  });

  // Sector data for pie chart with filters
  app.get("/api/dashboard/sectors", async (req, res) => {
    try {
      const { country, sector, projectType, startYear, endYear, search } = req.query;

      const filters = {
        country: country as string,
        sector: sector as string,
        projectType: projectType as string,
        startYear: startYear ? parseInt(startYear as string) : undefined,
        endYear: endYear ? parseInt(endYear as string) : undefined,
        search: search as string,
      };

      const sectorData = await storage.getSectorData(filters);
      res.json(sectorData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sector data" });
    }
  });

  // Time series data for charts with filters
  app.get("/api/dashboard/timeseries", async (req, res) => {
    try {
      const { country, sector, projectType, startYear, endYear, search } = req.query;

      const filters = {
        country: country as string,
        sector: sector as string,
        projectType: projectType as string,
        startYear: startYear ? parseInt(startYear as string) : undefined,
        endYear: endYear ? parseInt(endYear as string) : undefined,
        search: search as string,
      };

      const timeSeriesData = await storage.getTimeSeriesData(filters);
      res.json(timeSeriesData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch time series data" });
    }
  });

  // Top buyers data with filters
  app.get("/api/dashboard/top-buyers", async (req, res) => {
    try {
      const { country, sector, projectType, startYear, endYear, search } = req.query;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const filters = {
        country: country as string,
        sector: sector as string,
        projectType: projectType as string,
        startYear: startYear ? parseInt(startYear as string) : undefined,
        endYear: endYear ? parseInt(endYear as string) : undefined,
        search: search as string,
      };

      const topBuyers = await storage.getTopBuyers(limit, filters);
      res.json(topBuyers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top buyers" });
    }
  });

  // Export endpoint (placeholder for now)
  app.post("/api/export", async (req, res) => {
    try {
      const { format, filters } = req.body;

      // For now, just return success - implement actual export logic later
      res.json({ 
        success: true, 
        message: `Export initiated in ${format} format`,
        downloadUrl: `/api/download/${Date.now()}.${format}`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to initiate export" });
    }
  });

  // Carbon Credits Assistant endpoint - Local terminology database
  app.post("/api/chat", (req, res) => {
    try {
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      const carbonTerminology = {
        "additionality": "The concept that carbon credits are issued only for projects that wouldn't occur without the financial support from credit sales. For example, a cookstove project reducing deforestation is considered additional, unlike a profitable solar project without carbon credits.",
        "co-benefits": "Social/environmental benefits of a project, such as biodiversity conservation or local community development, in addition to carbon sequestration.",
        "co-benefit": "Social/environmental benefits of a project, such as biodiversity conservation or local community development, in addition to carbon sequestration.",
        "credits": "Units representing one metric ton of CO2 equivalent (tCO2e) reduced/removed by a project. These credits are bought, sold, and retired in carbon markets.",
        "credit": "Units representing one metric ton of CO2 equivalent (tCO2e) reduced/removed by a project. These credits are bought, sold, and retired in carbon markets.",
        "end user": "Entities purchasing and retiring carbon credits to offset their emissions.",
        "end buyer": "Entities purchasing and retiring carbon credits to offset their emissions.",
        "buyer": "Entities purchasing and retiring carbon credits to offset their emissions.",
        "methodology": "Technical guidelines for quantifying greenhouse gas reductions/removals by projects, essential for credit issuance.",
        "registry": "A database tracking issued, retired, or transferred carbon credits.",
        "removal credits": "Credits from activities like planting trees that physically remove CO2 from the atmosphere.",
        "removal": "Credits from activities like planting trees that physically remove CO2 from the atmosphere.",
        "retirement": "When a credit is permanently removed from the market, enabling the buyer to claim emission offsets.",
        "retire": "When a credit is permanently removed from the market, enabling the buyer to claim emission offsets.",
        "standard": "Certification criteria for verifying project design, monitoring, and reporting to issue credible carbon credits.",
        "vintage": "The year when a project's carbon reductions/removals occurred, not necessarily the year credits were issued.",
        "offset": "A reduction in emissions of carbon dioxide or other greenhouse gases made in order to compensate for emissions made elsewhere.",
        "verification": "Independent assessment of project performance and emission reductions by qualified third parties.",
        "validation": "Independent evaluation of a project design against relevant standards before implementation."
      };

      const questionLower = question.toLowerCase().trim();
      let response = "";

      // Check for direct terminology matches (prioritize longer matches)
      const sortedTerms = Object.entries(carbonTerminology).sort((a, b) => b[0].length - a[0].length);

      for (const [term, definition] of sortedTerms) {
        if (questionLower.includes(term)) {
          response = `**${term.charAt(0).toUpperCase() + term.slice(1)}**: ${definition}`;
          break;
        }
      }

      // Enhanced question patterns
      if (!response) {
        if (questionLower.includes("how many") || questionLower.includes("total") || questionLower.includes("count")) {
          response = "The dashboard shows over 33 million carbon credits retired across African countries. You can see detailed breakdowns by country, sector, and time period in the charts above. Uganda leads with the highest volume of credits retired.";
        } else if (questionLower.includes("which country") || questionLower.includes("top country")) {
          response = "Uganda is the leading African country for carbon credit retirements, followed by Ghana and Kenya. The country breakdown chart shows the distribution across different African nations.";
        } else if (questionLower.includes("sector") || questionLower.includes("industry")) {
          response = "The main sectors include Healthcare/Pharmaceuticals, Non-profit/Charity/Government/NGO, Technology/Telecommunications, and Energy/Mining/Utilities. The sector breakdown chart shows the percentage distribution.";
        } else if (questionLower.includes("year") || questionLower.includes("when") || questionLower.includes("time")) {
          response = "The data spans from 2010 to 2022, with the highest activity in recent years 2020-2022. You can filter by different time periods using the date range selector.";
        } else if (questionLower.includes("africa") || questionLower.includes("african")) {
          response = "This dashboard focuses on African carbon credit markets, showing transaction data from countries like Uganda, Ghana, Kenya, and others. The data reveals enterprise-level carbon credit retirements across various sectors.";
        } else if (questionLower.includes("data") || questionLower.includes("dashboard") || questionLower.includes("chart")) {
          response = "The dashboard displays verified carbon credit transaction data from African countries. You can explore metrics like total credits retired, active buyers, sector breakdowns, and filter by country, sector, and date ranges.";
        } else if (questionLower.includes("carbon") || questionLower.includes("emission") || questionLower.includes("climate")) {
          response = "Carbon credits represent verified reductions or removals of greenhouse gas emissions. They're traded in voluntary and compliance markets to help organizations offset their carbon footprint. Each credit typically represents one metric ton of CO2 equivalent.";
        } else {
          const helpTopics = [
            "Ask about carbon credit terminology (additionality, retirement, co-benefits)",
            "Inquire about African market data (countries, sectors, volumes)",
            "Learn about dashboard features (filters, charts, export)",
            "Get insights on specific time periods or trends"
          ];
          response = `I can help explain carbon credit concepts and provide insights about African carbon markets. Here are some things you can ask about:\n\n${helpTopics.map(topic => `• ${topic}`).join('\n')}`;
        }
      }

      res.json({ 
        response: response,
        success: true 
      });

    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ 
        error: "Failed to process chat request",
        response: "I'm having trouble responding right now. Please try again later."
      });
    }
  });

  // Bilateral agreements endpoints
  app.get("/api/bilateral-agreements", async (req, res) => {
    try {
      const agreements = await db.select().from(bilateralAgreements).orderBy(desc(bilateralAgreements.signingYear));
      res.json(agreements || []);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json([]);
    }
  });

  app.get("/api/bilateral-agreements/summary", async (req, res) => {
    try {
      // Count total connections (each partner country creates a separate connection)
      const totalConnectionsResult = await db.execute(sql`
        SELECT SUM(array_length(string_to_array(partner, ','), 1)) as total
        FROM bilateral_agreements
        WHERE partner IS NOT NULL AND partner != ''
      `);

      // Count buyers from partner countries with transactions in last 5 years (2019-2024)
      const buyersLast5YearsResult = await db.execute(sql`
        WITH partner_countries AS (
          SELECT DISTINCT TRIM(unnest(string_to_array(partner, ','))) as partner_country
          FROM bilateral_agreements
          WHERE partner IS NOT NULL AND partner != ''
        ),
        partner_country_mapping AS (
          SELECT 
            CASE 
              WHEN partner_country = 'United Arab Emirates (via Blue Carbon)' THEN 'United Arab Emirates'
              ELSE partner_country
            END as clean_partner_country
          FROM partner_countries
        )
        SELECT COUNT(DISTINCT buyer_brand_name) as buyers_last_5_years
        FROM transactions t
        JOIN partner_country_mapping p ON t.buyer_hq_location LIKE '%' || p.clean_partner_country || '%'
        WHERE t.retirement_year >= 2019 AND t.retirement_year <= 2024
      `);

      // Count buyers from partner countries
      const buyersResult = await db.execute(sql`
        WITH partner_countries AS (
          SELECT DISTINCT TRIM(unnest(string_to_array(partner, ','))) as partner_country
          FROM bilateral_agreements
          WHERE partner IS NOT NULL AND partner != ''
        ),
        partner_country_mapping AS (
          SELECT 
            CASE 
              WHEN partner_country = 'United Arab Emirates (via Blue Carbon)' THEN 'United Arab Emirates'
              ELSE partner_country
            END as clean_partner_country
          FROM partner_countries
        )
        SELECT COUNT(DISTINCT buyer_brand_name) as buyers
        FROM transactions t
        JOIN partner_country_mapping p ON t.buyer_hq_location LIKE '%' || p.clean_partner_country || '%'
      `);

      // Fixed partner count to 8 as requested
      const uniquePartners = 8;

      res.json({
        totalAgreements: totalConnectionsResult.rows[0]?.total || 0,
        activeAgreements: buyersLast5YearsResult.rows[0]?.buyers_last_5_years || 0,
        uniqueCountries: buyersResult.rows[0]?.buyers || 0,
        uniquePartners: uniquePartners,
      });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to fetch bilateral agreements summary" });
    }
  });

  // Export transactions
  app.get("/api/export/transactions", async (req, res) => {
    try {
      const allTransactions = await db.select().from(transactions);

      // Convert to CSV format
      const csvContent = convertToCSV(allTransactions);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="africa_carbon_transactions.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}