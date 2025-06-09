import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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
        "credits": "Units representing one metric ton of CO2 equivalent (tCO2e) reduced/removed by a project. These credits are bought, sold, and retired in carbon markets.",
        "end user": "Entities purchasing and retiring carbon credits to offset their emissions.",
        "end buyer": "Entities purchasing and retiring carbon credits to offset their emissions.",
        "methodology": "Technical guidelines for quantifying greenhouse gas reductions/removals by projects, essential for credit issuance.",
        "registry": "A database tracking issued, retired, or transferred carbon credits.",
        "removal credits": "Credits from activities like planting trees that physically remove CO2 from the atmosphere.",
        "retirement": "When a credit is permanently removed from the market, enabling the buyer to claim emission offsets.",
        "standard": "Certification criteria for verifying project design, monitoring, and reporting to issue credible carbon credits.",
        "vintage": "The year when a project's carbon reductions/removals occurred, not necessarily the year credits were issued."
      };

      const questionLower = question.toLowerCase();
      let response = "";

      // Check for direct terminology matches
      for (const [term, definition] of Object.entries(carbonTerminology)) {
        if (questionLower.includes(term)) {
          response = `**${term.charAt(0).toUpperCase() + term.slice(1)}**: ${definition}`;
          break;
        }
      }

      // General responses for other questions
      if (!response) {
        if (questionLower.includes("africa") || questionLower.includes("african")) {
          response = "This dashboard focuses on African carbon credit markets, including transactions from countries like Uganda, Ghana, Kenya, and others. The data shows enterprise-level carbon credit retirements across various sectors including forestry, energy, and manufacturing.";
        } else if (questionLower.includes("data") || questionLower.includes("dashboard")) {
          response = "The dashboard displays carbon credit transaction data from African countries, showing metrics like total credits retired, active buyers, and sector breakdowns. You can filter by country, sector, and date ranges to explore specific market segments.";
        } else if (questionLower.includes("carbon credit") || questionLower.includes("carbon market")) {
          response = "Carbon credits represent verified reductions or removals of greenhouse gas emissions. They're traded in voluntary and compliance markets to help organizations offset their carbon footprint. Each credit typically represents one metric ton of CO2 equivalent.";
        } else {
          response = "I can help explain carbon credit terminology and provide insights about African carbon markets. Try asking about specific terms like 'additionality', 'retirement', 'co-benefits', or questions about the dashboard data.";
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

  const httpServer = createServer(app);
  return httpServer;
}
