import { storage } from '../storage';
import { User } from '@shared/schema';

export interface ScrapingResult {
  hasAvailability: boolean;
  earliestDate?: string;
  availableSlots?: number;
  lastChecked: Date;
}

export class ScrapingService {
  private isRunning = false;

  constructor() {}

  async startScraping() {
    if (this.isRunning) {
      console.log('Scraping already in progress');
      return;
    }

    this.isRunning = true;
    console.log('Starting scraping service for healthcare appointments...');

    try {
      const activeUsers = await storage.getAllActiveUsers();
      console.log(`Found ${activeUsers.length} active users to monitor`);

      // Group users by region/ASL for efficient scraping
      const usersByRegion = this.groupUsersByRegion(activeUsers);
      
      // Process each region
      for (const [region, users] of Object.entries(usersByRegion)) {
        await this.scrapeRegion(region, users);
      }

    } catch (error) {
      console.error('Error during scraping:', error);
    } finally {
      this.isRunning = false;
      console.log('Scraping cycle completed');
    }
  }

  private groupUsersByRegion(users: User[]): Record<string, User[]> {
    return users.reduce((acc, user) => {
      const key = `${user.regione}-${user.asl}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(user);
      return acc;
    }, {} as Record<string, User[]>);
  }

  private async scrapeRegion(regionKey: string, users: User[]): Promise<void> {
    const [region, asl] = regionKey.split('-');
    
    console.log(`Scraping ${region} - ${asl} for ${users.length} users`);

    try {
      let result: ScrapingResult;

      // Route to appropriate scraping method based on region
      switch (region) {
        case 'lombardia':
          result = await this.scrapeLombardia(asl, users);
          break;
        case 'lazio':
          result = await this.scrapeLazio(asl, users);
          break;
        case 'piemonte':
          result = await this.scrapePiemonte(asl, users);
          break;
        case 'veneto':
          result = await this.scrapeVeneto(asl, users);
          break;
        default:
          console.log(`Scraping not implemented for region: ${region}`);
          return;
      }

      // Process results for each user
      for (const user of users) {
        await this.processScrapingResult(user, result);
      }

    } catch (error) {
      console.error(`Error scraping ${region}-${asl}:`, error);
    }
  }

  private async scrapeLombardia(asl: string, users: User[]): Promise<ScrapingResult> {
    // Implementation for Lombardia - prenotasalute.regione.lombardia.it
    console.log(`Scraping Lombardia ASL: ${asl}`);
    
    // This would be the actual implementation using Playwright or similar
    // For now, simulate the scraping process
    const hasAvailability = Math.random() > 0.8; // 20% chance of availability
    
    return {
      hasAvailability,
      earliestDate: hasAvailability ? this.getSimulatedDate() : undefined,
      availableSlots: hasAvailability ? Math.floor(Math.random() * 5) + 1 : 0,
      lastChecked: new Date()
    };
  }

  private async scrapeLazio(asl: string, users: User[]): Promise<ScrapingResult> {
    // Implementation for Lazio - salutelazio.it
    console.log(`Scraping Lazio ASL: ${asl}`);
    
    // Simulated scraping for now
    const hasAvailability = Math.random() > 0.85; // 15% chance of availability
    
    return {
      hasAvailability,
      earliestDate: hasAvailability ? this.getSimulatedDate() : undefined,
      availableSlots: hasAvailability ? Math.floor(Math.random() * 3) + 1 : 0,
      lastChecked: new Date()
    };
  }

  private async scrapePiemonte(asl: string, users: User[]): Promise<ScrapingResult> {
    // Implementation for Piemonte - salutepiemonte.it
    console.log(`Scraping Piemonte ASL: ${asl}`);
    
    // Simulated scraping for now
    const hasAvailability = Math.random() > 0.82; // 18% chance of availability
    
    return {
      hasAvailability,
      earliestDate: hasAvailability ? this.getSimulatedDate() : undefined,
      availableSlots: hasAvailability ? Math.floor(Math.random() * 4) + 1 : 0,
      lastChecked: new Date()
    };
  }

  private async scrapeVeneto(asl: string, users: User[]): Promise<ScrapingResult> {
    // Implementation for Veneto - various ULSS portals
    console.log(`Scraping Veneto ASL: ${asl}`);
    
    // Simulated scraping for now
    const hasAvailability = Math.random() > 0.87; // 13% chance of availability
    
    return {
      hasAvailability,
      earliestDate: hasAvailability ? this.getSimulatedDate() : undefined,
      availableSlots: hasAvailability ? Math.floor(Math.random() * 3) + 1 : 0,
      lastChecked: new Date()
    };
  }

  private async processScrapingResult(user: User, result: ScrapingResult): Promise<void> {
    // Treat 'notified' as equivalent to 'available' to avoid re-triggering notifications
    const wasAvailable = user.ultimaDisponibilita === 'available' || user.ultimaDisponibilita === 'notified';
    const isAvailable = result.hasAvailability;

    if (wasAvailable !== isAvailable) {
      const newStatus = isAvailable ? 'available' : 'unavailable';
      console.log(`Availability change for user ${user.id}: ${user.ultimaDisponibilita} → ${newStatus}`);
      if (isAvailable) {
        console.log(`New availability found for ${user.nome || user.id}: ${user.tipoVisita} at ${user.asl}`);
      }
      await storage.updateUserAvailability(user.id, newStatus);
    }
  }

  private getSimulatedDate(): string {
    const now = new Date();
    const futureDate = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Next 30 days
    return futureDate.toISOString().split('T')[0];
  }

  // Method to add real scraping implementations
  async scrapeWebsite(url: string, selectors: any): Promise<ScrapingResult> {
    // This would implement actual web scraping using Playwright
    // For now, return simulated data
    console.log(`Would scrape: ${url}`);
    
    return {
      hasAvailability: Math.random() > 0.8,
      earliestDate: this.getSimulatedDate(),
      availableSlots: Math.floor(Math.random() * 5) + 1,
      lastChecked: new Date()
    };
  }

  // Helper method to validate if a region/ASL combination is supported
  isRegionSupported(region: string, asl: string): boolean {
    const supportedRegions = ['lombardia', 'lazio', 'piemonte', 'veneto'];
    return supportedRegions.includes(region);
  }
}

export const scrapingService = new ScrapingService();