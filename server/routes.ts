import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, regionsData, visitTypes } from "@shared/schema";
import { monitoringService } from "./services/monitoring";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start monitoring service
  monitoringService.start();

  // Register user for notifications
  app.post("/api/register", async (req, res) => {
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
        }, {} as Record<string, number>)
      };
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ error: "Errore nel caricamento delle statistiche" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
