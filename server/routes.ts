import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { transactions, buyerProfiles, bilateralAgreements } from "@shared/schema";
import { desc, sql, eq, and, gte, lte, inArray } from "drizzle-orm";
import type { DashboardMetrics, CountryData, SectorData, TimeSeriesData, TopBuyerData } from "@shared/schema";
import { validateNewCSVData } from "./validate-new-csv";
import { importLatestCSVData } from "./import-latest-csv";
import { importBilateralAgreements } from "./import-bilateral";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { 
  createSecureRateLimit, 
  requireCaptcha, 
  blockSuspiciousIPs, 
  requireSecureApiKey,
  detectBots,
  honeypot,
  getClientIP,
  trackSuccessfulAttempt 
} from "./security";
import { generateCaptcha } from "./captcha";
import { normalizeFilterKey, getCachedResponse, setCachedResponse, clearCache } from "./cache";

// Enhanced rate limiting with progressive restrictions
const generalLimit = createSecureRateLimit(15 * 60 * 1000, 100, true); // 100 requests per 15 minutes
const exportLimit = createSecureRateLimit(60 * 60 * 1000, 3, false); // 3 exports per hour (reduced)
const adminLimit = createSecureRateLimit(60 * 60 * 1000, 5, false); // 5 admin requests per hour (reduced)
const chatLimit = createSecureRateLimit(5 * 60 * 1000, 20, false); // 20 chat requests per 5 minutes

// Legacy middleware for backwards compatibility
const requireApiKey = requireSecureApiKey;

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure CORS
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'https://your-domain.replit.app']
      : true,
    credentials: true
  }));

  // Security middleware chain
  app.use('/api', blockSuspiciousIPs); // Block suspicious IPs first
  app.use('/api', detectBots); // Detect and block bots
  app.use('/api', generalLimit); // Apply rate limiting

  // Honeypot endpoint to catch bots
  app.get('/admin', honeypot);
  app.get('/wp-admin', honeypot);
  app.get('/api/admin/users', honeypot);
  app.get('/api/internal/debug', honeypot);

  // CAPTCHA endpoint
  app.get('/api/captcha', (req, res) => {
    const captcha = generateCaptcha();
    res.json({
      id: captcha.id,
      question: captcha.question
    });
  });

  // Serve robots.txt
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile('robots.txt', { root: '.' });
  });

  // Input validation helper with bounds checking
  const validateFilters = (query: any) => {
    const { country, buyerCountry, sector, projectType, scope, startYear, endYear, search } = query;
    
    // Sanitize string inputs
    const sanitizeString = (str: string) => str ? str.replace(/[<>\"']/g, '').substring(0, 100) : '';
    
    // Handle comma-separated values for array filters with size limits
    const sanitizeArray = (str: string, maxItems: number = 50) => {
      if (!str) return [];
      const items = str.split(',').map(s => sanitizeString(s.trim())).filter(s => s.length > 0);
      // Limit array size to prevent database overload
      if (items.length > maxItems) {
        console.warn(`Filter array exceeded max size (${items.length} > ${maxItems}), truncating`);
        return items.slice(0, maxItems);
      }
      return items;
    };
    
    return {
      country: sanitizeArray(country as string, 50),
      buyerCountry: sanitizeArray(buyerCountry as string, 50),
      sector: sanitizeArray(sector as string, 20), 
      projectType: sanitizeArray(projectType as string, 20),
      scope: sanitizeArray(scope as string, 10),
      startYear: startYear ? Math.max(2000, Math.min(2030, parseInt(startYear as string) || 2010)) : undefined,
      endYear: endYear ? Math.max(2000, Math.min(2030, parseInt(endYear as string) || 2024)) : undefined,
      search: sanitizeString(search as string),
    };
  };

  // Dashboard metrics endpoint with filters and caching
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const filters = validateFilters(req.query);
      const ip = getClientIP(req);
      
      const cacheKey = `metrics:${normalizeFilterKey(filters)}`;
      const cached = getCachedResponse(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const metrics = await storage.getDashboardMetrics(filters);
      
      setCachedResponse(cacheKey, metrics, 300);
      
      // Track successful API usage
      trackSuccessfulAttempt(ip);
      
      res.json(metrics);
    } catch (error: any) {
      console.error("Dashboard metrics error:", error);
      
      // Check if it's a database connection error
      if (error.code === '57P01' || error.message?.includes('terminating connection')) {
        res.status(503).json({ 
          error: "Database temporarily unavailable. Please try again.",
          code: "DB_UNAVAILABLE" 
        });
      } else {
        res.status(500).json({ 
          error: "Failed to fetch dashboard metrics",
          code: "METRICS_ERROR"
        });
      }
    }
  });

  // Transactions endpoint with filtering
  app.get("/api/transactions", async (req, res) => {
    try {
      const filters = validateFilters(req.query);

      const transactions = await storage.getTransactionsByFilters(filters);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Country data for map with filters and caching
  app.get("/api/dashboard/countries", async (req, res) => {
    try {
      const filters = validateFilters(req.query);
      const cacheKey = `countries:${normalizeFilterKey(filters)}`;
      const cached = getCachedResponse(cacheKey);
      
      if (cached) return res.json(cached);

      const countryData = await storage.getCountryData(filters);
      setCachedResponse(cacheKey, countryData, 300);
      res.json(countryData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch country data" });
    }
  });

  // Sector data for pie chart with filters and caching
  app.get("/api/dashboard/sectors", async (req, res) => {
    try {
      const filters = validateFilters(req.query);
      const cacheKey = `sectors:${normalizeFilterKey(filters)}`;
      const cached = getCachedResponse(cacheKey);
      
      if (cached) return res.json(cached);

      const sectorData = await storage.getSectorData(filters);
      setCachedResponse(cacheKey, sectorData, 300);
      res.json(sectorData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sector data" });
    }
  });

  // Scope data for scope breakdown with filters and caching
  app.get("/api/dashboard/scopes", async (req, res) => {
    try {
      const filters = validateFilters(req.query);
      const cacheKey = `scopes:${normalizeFilterKey(filters)}`;
      const cached = getCachedResponse(cacheKey);
      
      if (cached) return res.json(cached);

      const scopeData = await storage.getScopeData(filters);
      setCachedResponse(cacheKey, scopeData, 300);
      res.json(scopeData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scope data" });
    }
  });

  // Time series data for charts with filters and caching
  app.get("/api/dashboard/timeseries", async (req, res) => {
    try {
      const filters = validateFilters(req.query);
      const cacheKey = `timeseries:${normalizeFilterKey(filters)}`;
      const cached = getCachedResponse(cacheKey);
      
      if (cached) return res.json(cached);

      const timeSeriesData = await storage.getTimeSeriesData(filters);
      setCachedResponse(cacheKey, timeSeriesData, 300);
      res.json(timeSeriesData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch time series data" });
    }
  });

  // Top buyers data with filters and caching
  app.get("/api/dashboard/top-buyers", async (req, res) => {
    try {
      const filters = validateFilters(req.query);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const cacheKey = `top-buyers:${limit}:${normalizeFilterKey(filters)}`;
      const cached = getCachedResponse(cacheKey);
      
      if (cached) return res.json(cached);

      const topBuyers = await storage.getTopBuyers(limit, filters);
      setCachedResponse(cacheKey, topBuyers, 300);
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

  // Carbon Credits Assistant endpoint - Local terminology database with CAPTCHA protection
  app.post("/api/chat", chatLimit, requireCaptcha, (req, res) => {
    const ip = getClientIP(req);
    trackSuccessfulAttempt(ip);
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

  // Export transactions - PROTECTED with CAPTCHA
  app.get("/api/export/transactions", exportLimit, requireCaptcha, requireSecureApiKey, async (req, res) => {
    const ip = getClientIP(req);
    trackSuccessfulAttempt(ip);
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

  // Validation endpoint - PROTECTED with CAPTCHA
  app.get("/api/validate", adminLimit, requireCaptcha, requireSecureApiKey, async (req, res) => {
    const ip = getClientIP(req);
    trackSuccessfulAttempt(ip);
    try {
      const results = await validateNewCSVData();
      res.json(results);
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({ error: "Validation failed" });
    }
  });

  // HTML validation report endpoint - PROTECTED with CAPTCHA
  app.get("/api/validate/report", adminLimit, requireCaptcha, requireSecureApiKey, async (req, res) => {
    const ip = getClientIP(req);
    trackSuccessfulAttempt(ip);
    try {
      const results = await validateNewCSVData();

    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Data Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .entity { margin-bottom: 30px; border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
        .entity h2 { color: #333; margin-top: 0; }
        .counts { display: flex; gap: 20px; margin: 15px 0; }
        .count-box { background: #f0f0f0; padding: 10px; border-radius: 5px; flex: 1; text-align: center; }
        .discrepancy { background: #ffebee; padding: 10px; margin: 10px 0; border-left: 4px solid #f44336; }
        .success { background: #e8f5e8; padding: 10px; margin: 10px 0; border-left: 4px solid #4caf50; }
        .mismatch { background: #fff3e0; padding: 8px; margin: 5px 0; border-radius: 3px; font-size: 0.9em; }
        .code { font-family: monospace; background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Data Validation Report</h1>
            <p>Comparison between Database and New CSV Files</p>
            <p><em>Generated on ${new Date().toLocaleString()}</em></p>
        </div>
`;

    let totalDiscrepancies = 0;
    results.forEach(result => totalDiscrepancies += result.discrepancies.length);

    html += `
        <div class="summary">
            ${totalDiscrepancies === 0 ? 
              '<h3 style="color: green;">✅ All Validation Checks Passed!</h3><p>Your database is perfectly synchronized with the new CSV files.</p>' :
              `<h3 style="color: orange;">⚠️ ${totalDiscrepancies} Total Discrepancies Found</h3><p>Please review the details below to understand the differences.</p>`
            }
        </div>
`;

    results.forEach(result => {
      html += `
        <div class="entity">
            <h2>${result.entity}</h2>
            <div class="counts">
                <div class="count-box">
                    <strong>New CSV Count</strong><br>
                    ${result.csvCount.toLocaleString()}
                </div>
                <div class="count-box">
                    <strong>Database Count</strong><br>
                    ${result.dbCount.toLocaleString()}
                </div>
            </div>
`;

      if (result.discrepancies.length === 0) {
        html += '<div class="success">✅ No discrepancies found - Data matches perfectly!</div>';
      } else {
        html += `<h3>❌ ${result.discrepancies.length} Discrepancies Found:</h3>`;
        result.discrepancies.forEach((disc, i) => {
          html += `<div class="discrepancy"><strong>${i + 1}.</strong> ${disc}</div>`;
        });

        if (result.sampleMismatches.length > 0) {
          html += `<h4>📝 Sample Mismatches (showing first ${result.sampleMismatches.length}):</h4>`;
          result.sampleMismatches.forEach((mismatch, i) => {
            html += `<div class="mismatch"><strong>${i + 1}.</strong> <span class="code">${JSON.stringify(mismatch, null, 2)}</span></div>`;
          });
        }
      }

      html += '</div>';
    });

    html += `
        </div>
    </body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).send(`<h1>Validation Error</h1><p>${error.message}</p>`);
  }
});

  // Import latest CSV data endpoint - PROTECTED with CAPTCHA
  app.post("/api/import-latest", adminLimit, requireCaptcha, requireSecureApiKey, async (req, res) => {
    const ip = getClientIP(req);
    trackSuccessfulAttempt(ip);
    try {
      console.log("🔄 Starting manual import of latest CSV data...");
      const result = await importLatestCSVData();
      
      clearCache();
      console.log("✅ Cache cleared after import");
      
      res.json({ 
        success: true, 
        message: "Latest CSV data imported successfully",
        result 
      });
    } catch (error: any) {
      console.error("❌ Import failed:", error);
      res.status(500).json({ 
        success: false, 
        message: "Import failed", 
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}