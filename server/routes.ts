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

  const httpServer = createServer(app);
  return httpServer;
}
