import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, regionsData, visitTypes } from "@shared/schema";
import { monitoringService } from "./services/monitoring";
import { unsubscribeService } from "./services/unsubscribe";
import { statusService } from "./services/status";

export async function registerRoutes(app: Express, registrationLimiter?: RequestHandler): Promise<Server> {
  // Start monitoring service
  monitoringService.start();

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

  // Get user statistics (for potential admin dashboard)
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
    try {
      const status = {
        isActive: true,
        checkInterval: '15 minutes',
        lastCheck: new Date().toISOString(),
        supportedRegions: [
          { 
            name: 'Lombardia', 
            code: 'lombardia', 
            website: 'prenotasalute.regione.lombardia.it',
            status: 'active',
            requiresLogin: false
          },
          { 
            name: 'Lazio', 
            code: 'lazio', 
            website: 'salutelazio.it',
            status: 'active',
            requiresLogin: false
          },
          { 
            name: 'Piemonte', 
            code: 'piemonte', 
            website: 'salutepiemonte.it',
            status: 'active',
            requiresLogin: false
          },
          { 
            name: 'Veneto', 
            code: 'veneto', 
            website: 'various ULSS portals',
            status: 'active',
            requiresLogin: false
          }
        ]
      };
      res.json(status);
    } catch (error) {
      console.error("Monitoring status error:", error);
      res.status(500).json({ error: "Errore nel caricamento dello stato del monitoraggio" });
    }
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
        res.json({ 
          success: true, 
          message: "Disiscrizione completata con successo" 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: "Token di disiscrizione non valido o scaduto" 
        });
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Errore durante la disiscrizione" 
      });
    }
  });

  // WhatsApp webhook for handling STOP commands
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (messages && messages.length > 0) {
        for (const message of messages) {
          if (message.text && message.text.body.toLowerCase().includes('stop')) {
            const phoneNumber = message.from;
            await unsubscribeService.handleWhatsAppStop(phoneNumber);
          }
        }
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("WhatsApp webhook error:", error);
      res.status(500).json({ error: "Webhook error" });
    }
  });

  // System status endpoint (for admin monitoring)
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

  const httpServer = createServer(app);
  return httpServer;
}
