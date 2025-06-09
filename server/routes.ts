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

  // AI Chatbot endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const carbonTerminology = `
      Carbon Credit Terminology:
      
      1. Additionality: The concept that carbon credits are issued only for projects that wouldn't occur without the financial support from credit sales. E.g., a cookstove project reducing deforestation is considered additional, unlike a profitable solar project without carbon credits.

      2. Co-benefits: Social/environmental benefits of a project, such as biodiversity conservation or local community development, in addition to carbon sequestration.

      3. Credits: Units representing one metric ton of CO2 equivalent (tCO2e) reduced/removed by a project. These credits are bought, sold, and retired in carbon markets.

      4. End User/End Buyer: Entities purchasing and retiring carbon credits to offset their emissions.

      5. Methodology: Technical guidelines for quantifying greenhouse gas reductions/removals by projects, essential for credit issuance.

      6. Registry: A database tracking issued, retired, or transferred carbon credits.

      7. Removal Credits: Credits from activities like planting trees that physically remove CO2 from the atmosphere.

      8. Retirement: When a credit is permanently removed from the market, enabling the buyer to claim emission offsets.

      9. Standard: Certification criteria for verifying project design, monitoring, and reporting to issue credible carbon credits.

      10. Vintage: The year when a project's carbon reductions/removals occurred, not necessarily the year credits were issued.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant specializing in carbon credits and environmental finance, specifically focused on African carbon markets. Use the following terminology guide to answer questions accurately:

            ${carbonTerminology}

            You have access to data about African carbon credit transactions including countries like Uganda, Ghana, Kenya, and others. You can discuss sectors like forestry, energy, transportation, and manufacturing. When users ask about data, refer to the African carbon credit market context.

            Keep responses concise, educational, and professional. If asked about specific data points, explain that you can provide general insights about African carbon markets but recommend checking the dashboard for current statistics.`
          },
          {
            role: "user", 
            content: question
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      res.json({ 
        response: response.choices[0].message.content,
        success: true 
      });

    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ 
        error: "Failed to process chat request",
        response: "I'm sorry, I'm having trouble responding right now. Please try again later."
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
