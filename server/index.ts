import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import { registerRoutes } from "./routes";
import { monitoringService } from "./services/monitoring";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Trust proxy for Replit/Vercel environment
app.set('trust proxy', 1);

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Troppe richieste da questo IP, riprova tra 15 minuti" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down for registration
const registrationSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 3,
  delayMs: () => 500,
  maxDelayMs: 5000,
  validate: { delayMs: false },
});

// Strict registration rate limiting
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Troppe registrazioni da questo IP, riprova tra 15 minuti" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

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

(async () => {
  registerRoutes(app, registrationLimiter);

  // Start background monitoring (persistent process — local dev / long-running server only)
  // On Vercel, monitoring is triggered by the /api/cron/monitor route instead
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_MONITORING === 'true') {
    monitoringService.start();
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  const port = parseInt(process.env.PORT || '5000', 10);
  const httpServer = createServer(app);

  if (app.get("env") === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }

  httpServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
})();
