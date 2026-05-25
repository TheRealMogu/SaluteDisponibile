import { storage } from '../storage';
import { User } from '@shared/schema';

export interface ScrapingResult {
  hasAvailability: boolean;
  earliestDate?: string;
  availableSlots?: number;
  lastChecked: Date;
  source?: string;
}

const SCRAPER_URL = process.env.SCRAPER_API_URL;
const SCRAPER_KEY = process.env.SCRAPER_API_KEY || '';

// Chiama il microservizio Playwright su Railway
async function callScraperService(region: string, asl: string, tipoVisita: string): Promise<ScrapingResult> {
  if (!SCRAPER_URL) {
    throw new Error('SCRAPER_API_URL non configurato');
  }

  const response = await fetch(`${SCRAPER_URL}/scrape`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SCRAPER_KEY ? { 'x-api-key': SCRAPER_KEY } : {}),
    },
    body: JSON.stringify({ region, asl, tipoVisita }),
    signal: AbortSignal.timeout(45_000), // 45s timeout — il browser ci mette un po'
  });

  if (!response.ok) {
    throw new Error(`Scraper error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json() as {
    hasAvailability: boolean;
    earliestDate?: string;
    availableSlots?: number;
    source?: string;
    error?: string;
  };

  if (data.error) {
    console.warn(`[scraping] Scraper warning for ${region}/${asl}: ${data.error}`);
  }

  return {
    hasAvailability: data.hasAvailability,
    earliestDate: data.earliestDate,
    availableSlots: data.availableSlots,
    source: data.source,
    lastChecked: new Date(),
  };
}

// Versione batch: chiama /scrape/batch per un gruppo di regione/asl
async function callScraperBatch(
  requests: Array<{ region: string; asl: string; tipoVisita: string; users: User[] }>
): Promise<Array<{ region: string; asl: string; tipoVisita: string; result: ScrapingResult }>> {
  if (!SCRAPER_URL) throw new Error('SCRAPER_API_URL non configurato');

  const response = await fetch(`${SCRAPER_URL}/scrape/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SCRAPER_KEY ? { 'x-api-key': SCRAPER_KEY } : {}),
    },
    body: JSON.stringify({
      requests: requests.map(r => ({ region: r.region, asl: r.asl, tipoVisita: r.tipoVisita })),
    }),
    signal: AbortSignal.timeout(120_000), // batch può richiedere fino a 2 minuti
  });

  if (!response.ok) {
    throw new Error(`Scraper batch error ${response.status}`);
  }

  const data = await response.json() as {
    results: Array<{
      region: string;
      asl: string;
      tipoVisita: string;
      result: { hasAvailability: boolean; earliestDate?: string; availableSlots?: number; source?: string };
    }>;
  };

  return data.results.map(r => ({
    region: r.region,
    asl: r.asl,
    tipoVisita: r.tipoVisita,
    result: { ...r.result, lastChecked: new Date() },
  }));
}

export class ScrapingService {
  private isRunning = false;

  async startScraping() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const activeUsers = await storage.getAllActiveUsers();
      if (activeUsers.length === 0) {
        console.log('[scraping] Nessun utente attivo');
        return;
      }

      console.log(`[scraping] ${activeUsers.length} utenti attivi`);

      if (!SCRAPER_URL) {
        console.warn('[scraping] SCRAPER_API_URL non impostato — scraping saltato');
        return;
      }

      // Raggruppa utenti per regione+ASL+visita (stessa combo = una sola chiamata)
      const groups = this.groupUsers(activeUsers);
      const batchRequests = Object.entries(groups).map(([key, users]) => {
        const [region, asl, tipoVisita] = key.split('|');
        return { region, asl, tipoVisita, users };
      });

      console.log(`[scraping] ${batchRequests.length} combinazioni uniche da scrapare`);

      // Manda tutto in batch (max 20 per volta)
      const chunkSize = 20;
      for (let i = 0; i < batchRequests.length; i += chunkSize) {
        const chunk = batchRequests.slice(i, i + chunkSize);

        let batchResults;
        try {
          batchResults = await callScraperBatch(chunk);
        } catch (err) {
          console.error('[scraping] Batch error:', err instanceof Error ? err.message : err);
          // Fallback: chiama uno per uno
          batchResults = [];
          for (const req of chunk) {
            try {
              const result = await callScraperService(req.region, req.asl, req.tipoVisita);
              batchResults.push({ region: req.region, asl: req.asl, tipoVisita: req.tipoVisita, result });
            } catch (e) {
              console.error(`[scraping] Error ${req.region}/${req.asl}:`, e);
            }
          }
        }

        // Applica risultati agli utenti
        for (const batchResult of batchResults) {
          const key = `${batchResult.region}|${batchResult.asl}|${batchResult.tipoVisita}`;
          const users = groups[key] || [];

          console.log(
            `[scraping] ${batchResult.region}/${batchResult.asl}/${batchResult.tipoVisita}: ` +
            `${batchResult.result.hasAvailability ? '✓ DISPONIBILE' : '✗ non disponibile'}` +
            (batchResult.result.earliestDate ? ` (${batchResult.result.earliestDate})` : '')
          );

          for (const user of users) {
            await this.processResult(user, batchResult.result);
          }
        }
      }
    } catch (error) {
      console.error('[scraping] Errore generale:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private groupUsers(users: User[]): Record<string, User[]> {
    return users.reduce((acc, user) => {
      const key = `${user.regione}|${user.asl}|${user.tipoVisita}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(user);
      return acc;
    }, {} as Record<string, User[]>);
  }

  private async processResult(user: User, result: ScrapingResult): Promise<void> {
    const wasAvailable = user.ultimaDisponibilita === 'available' || user.ultimaDisponibilita === 'notified';
    const isAvailable = result.hasAvailability;

    if (wasAvailable !== isAvailable) {
      const newStatus = isAvailable ? 'available' : 'unavailable';
      console.log(`[scraping] User ${user.id}: ${user.ultimaDisponibilita} → ${newStatus}`);
      if (isAvailable) {
        console.log(`[scraping] Nuova disponibilità per ${user.nome || user.id}: ${user.tipoVisita} @ ${user.asl}` +
          (result.earliestDate ? ` — prima data: ${result.earliestDate}` : ''));
      }
      await storage.updateUserAvailability(user.id, newStatus);
    }
  }

  isRegionSupported(region: string): boolean {
    return ['lombardia', 'lazio', 'piemonte', 'veneto'].includes(region);
  }
}

export const scrapingService = new ScrapingService();
