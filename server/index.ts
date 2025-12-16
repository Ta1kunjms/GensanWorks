// Global error handlers to catch unhandled errors and log them
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});
import 'dotenv/config';
// Always use process.cwd() for directory resolution (ESM/CJS safe)
const _dirname = process.cwd();
const isTestEnv = process.env.NODE_ENV === 'test' || Boolean(process.env.JEST_WORKER_ID);
import path from 'path';
import fs from "fs";
import YAML from "yaml";
import swaggerUi from "swagger-ui-express";
import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupWebSocket } from "./websocket";
import { passport, initGoogleOAuth } from "./auth";
import helmet from "helmet";

const app = express();
const openapiPath = path.resolve(_dirname, "openapi.yaml");
let openapiDocument: any;

try {
  const spec = fs.readFileSync(openapiPath, "utf8");
  openapiDocument = YAML.parse(spec);
} catch (err) {
  console.error("[OpenAPI] Failed to load openapi.yaml", err);
  openapiDocument = {
    openapi: "3.1.0",
    info: {
      title: "GensanWorks API",
      version: "0.0.0",
      description: "Fallback document generated at runtime because openapi.yaml could not be read.",
    },
    paths: {},
  };
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  limit: "5mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Vite dev + inline scripts can conflict; enable in prod via separate config if needed
  crossOriginEmbedderPolicy: false,
}));
// HSTS in production
if (process.env.NODE_ENV === "production") {
  app.use(helmet.hsts({ maxAge: 15552000, includeSubDomains: true })); // 180 days
}
// Initialize Passport (Google OAuth)
initGoogleOAuth();
app.use(passport.initialize());

// Disable caching for API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
  }
  next();
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

let httpServerRef: Server | null = null;

// OpenAPI / Swagger UI
app.get("/openapi.json", (_req, res) => {
  res.json(openapiDocument);
});

app.get("/openapi.yaml", (_req, res) => {
  try {
    const spec = fs.readFileSync(openapiPath, "utf8");
    res.type("text/yaml").send(spec);
  } catch (err) {
    res.status(500).json({ message: "OpenAPI spec not available" });
  }
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

registerRoutes(app);

async function startServer() {
  if (httpServerRef) {
    return httpServerRef;
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    // Respond with the error JSON but do NOT throw to avoid crashing the dev server
    // In development we log the stack for visibility.
    res.status(status).json({ message });
    if (process.env.NODE_ENV === "development") {
      console.error("Express error handler caught:", err);
    }
  });

  const httpServer = createServer(app);
  httpServerRef = httpServer;

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  try {
    await new Promise<void>((resolve, reject) => {
      httpServer.listen(port, "127.0.0.1", () => {
        log(`serving on port ${port}`);
        console.log("[DEBUG] Server startup complete");
        resolve();
        // Setup WebSocket server after HTTP server starts
        // TEMPORARILY DISABLED TO FIX REFRESH ISSUE
        // setupWebSocket(httpServer);
      });
      httpServer.on('error', (err) => {
        reject(err);
      });
    });
  } catch (err) {
    httpServerRef = null;
    throw err;
  }
  
  // Initialize Google OAuth strategy at startup
  try {
    initGoogleOAuth();
    console.log("[Auth] Google OAuth strategy initialization attempted at startup.");
  } catch (e) {
    console.error("[Auth] Error initializing Google OAuth at startup:", e);
  }

  return httpServer;
}

async function stopServer() {
  if (!httpServerRef) return;
  await new Promise<void>((resolve, reject) => {
    httpServerRef?.close((err) => (err ? reject(err) : resolve()));
  });
  httpServerRef = null;
}


export { app, startServer, stopServer };

if (!isTestEnv) {
  startServer();
}
