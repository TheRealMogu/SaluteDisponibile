import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { insertUserSchema, regionsData, visitTypes } from "@shared/schema";
import { monitoringService } from "./services/monitoring";
import { unsubscribeService } from "./services/unsubscribe";
import { statusService } from "./services/status";

export function registerRoutes(app: Express, registrationLimiter?: RequestHandler): void {
  const applyRegistrationLimit: RequestHandler = registrationLimiter ?? ((_, __, next) => next());

  // Register user for notifications
  app.post("/api/register", applyRegistrationLimit, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);

      console.log(`New user registered: ${user.id}, channel: ${user.canale}`);

      res.json({
        success: true,
        message: "Registrazione completata con successo",
        userId: user.id
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        success: false,
        message: "Errore nella registrazione. Controlla i dati inseriti."
      });
    }
  });

  // Get regions data
  app.get("/api/regions", (req, res) => {
    const regions = Object.keys(regionsData).map(key => ({
      value: key,
      text: key.charAt(0).toUpperCase() + key.slice(1)
    }));
    res.json(regions);
  });

  // Get ASLs for a specific region
  app.get("/api/regions/:region/asl", (req, res) => {
    const { region } = req.params;
    const asls = regionsData[region as keyof typeof regionsData] || [];
    res.json(asls);
  });

  // Get visit types
  app.get("/api/visit-types", (req, res) => {
    res.json(visitTypes);
  });

  // Get user statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const users = await storage.getAllActiveUsers();
      const stats = {
        totalUsers: users.length,
        whatsappUsers: users.filter(u => u.canale === 'whatsapp').length,
        emailUsers: users.filter(u => u.canale === 'email').length,
        byRegion: users.reduce((acc, user) => {
          acc[user.regione] = (acc[user.regione] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        lastUpdated: new Date().toISOString(),
        supportedRegions: ['lombardia', 'lazio', 'piemonte', 'veneto']
      };
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ error: "Errore nel caricamento delle statistiche" });
    }
  });

  // Get monitoring status
  app.get("/api/monitoring/status", (req, res) => {
    res.json({
      isActive: true,
      checkInterval: '15 minutes',
      lastCheck: new Date().toISOString(),
      supportedRegions: [
        { name: 'Lombardia', code: 'lombardia', status: 'active' },
        { name: 'Lazio', code: 'lazio', status: 'active' },
        { name: 'Piemonte', code: 'piemonte', status: 'active' },
        { name: 'Veneto', code: 'veneto', status: 'active' }
      ]
    });
  });

  // Unsubscribe endpoint
  app.get("/api/unsubscribe", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Token di disiscrizione non valido"
        });
      }

      const success = await unsubscribeService.unsubscribeUser(token);

      if (success) {
        res.json({ success: true, message: "Disiscrizione completata con successo" });
      } else {
        res.status(400).json({
          success: false,
          message: "Token di disiscrizione non valido o scaduto"
        });
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      res.status(500).json({ success: false, message: "Errore durante la disiscrizione" });
    }
  });

  // WhatsApp webhook for handling STOP commands
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      const { messages } = req.body;

      if (messages && messages.length > 0) {
        for (const message of messages) {
          if (message.text && message.text.body.toLowerCase().includes('stop')) {
            await unsubscribeService.handleWhatsAppStop(message.from);
          }
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("WhatsApp webhook error:", error);
      res.status(500).json({ error: "Webhook error" });
    }
  });

  // System status endpoint
  app.get("/api/system/status", (req, res) => {
    try {
      const status = statusService.getStatus();
      res.json({
        ...status,
        regions: {
          lombardia: { status: 'active', lastScrape: status.lastCheck },
          lazio: { status: 'active', lastScrape: status.lastCheck },
          piemonte: { status: 'active', lastScrape: status.lastCheck },
          veneto: { status: 'active', lastScrape: status.lastCheck }
        },
        health: status.errors.length < 5 ? 'healthy' : 'warning'
      });
    } catch (error) {
      console.error("System status error:", error);
      res.status(500).json({ error: "Errore nel recupero dello stato del sistema" });
    }
  });

  // Vercel Cron endpoint — triggered every 15 minutes by vercel.json
  // Vercel automatically adds Authorization: Bearer <CRON_SECRET>
  app.get("/api/cron/monitor", async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && req.headers['authorization'] !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      await monitoringService.runCheck();
      res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error("Cron monitor error:", error);
      res.status(500).json({ error: "Monitor check failed" });
    }
  });
}
