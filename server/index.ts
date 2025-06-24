import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { seedDatabase } from "./seed";
import { runMigrations } from "./migrate";
import { setupVite, serveStatic, log } from "./vite";
import { testDatabaseConnection } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint that always returns 200 OK
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Non-blocking database initialization function
async function initializeDatabase() {
  try {
    console.log("Testing database connection...");
    const dbConnected = await testDatabaseConnection();
    
    if (dbConnected) {
      console.log("✅ Database connection successful");
      
      try {
        // Run migrations first
        await runMigrations();
        
        // Seed the database with initial data
        await seedDatabase();
        console.log("✅ Database initialization completed");
      } catch (error: any) {
        console.error("❌ Database setup failed, but server will continue:", error.message);
        
        // If it's a connection termination error, suggest restart
        if (error.code === '57P01' || error.message?.includes('terminating connection')) {
          console.log("💡 Try restarting the application to re-establish database connection");
        }
      }
    } else {
      console.warn("⚠️ Database connection failed, server will start but database features may not work");
      console.log("💡 This might be due to Neon database sleeping. Try restarting the application.");
    }
  } catch (error: any) {
    console.error("❌ Database initialization error:", error.message);
    console.log("🚀 Server will continue without database features");
  }
}

// Start server function with proper error handling
async function startServer() {
  try {
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      console.error(`Server error: ${status} - ${message}`);
      res.status(status).json({ message });
      // Don't throw the error, just log it
    });

    // Setup Vite or static serving
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    const port = 5000;
    
    return new Promise<void>((resolve, reject) => {
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, (error?: Error) => {
        if (error) {
          console.error("❌ Failed to start server:", error);
          reject(error);
        } else {
          log(`🚀 Server serving on port ${port}`);
          resolve();
        }
      });
    });
  } catch (error: any) {
    console.error("❌ Server startup failed:", error);
    throw error;
  }
}

// Main startup function
async function main() {
  try {
    console.log("🚀 Starting Africa Carbon Credits Dashboard...");
    
    // Start server first (non-blocking)
    await startServer();
    
    // Initialize database in background (non-blocking)
    setImmediate(() => {
      initializeDatabase().catch(error => {
        console.error("Background database initialization failed:", error.message);
      });
    });
    
  } catch (error: any) {
    console.error("❌ Application startup failed:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, just log the error
});

// Start the application
main().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});