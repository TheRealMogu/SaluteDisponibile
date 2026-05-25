import { scrapeLombardia } from './lombardia.js';
import { scrapeLazio } from './lazio.js';
import { scrapePiemonte } from './piemonte.js';
import { scrapeVeneto } from './veneto.js';
import type { ScrapeRequest, ScrapingResult } from './types.js';

export async function scrape(req: ScrapeRequest): Promise<ScrapingResult> {
  const { region, asl, tipoVisita } = req;

  console.log(`[scrape] ${region}/${asl}/${tipoVisita}`);

  switch (region) {
    case 'lombardia': return scrapeLombardia(asl, tipoVisita);
    case 'lazio':     return scrapeLazio(asl, tipoVisita);
    case 'piemonte':  return scrapePiemonte(asl, tipoVisita);
    case 'veneto':    return scrapeVeneto(asl, tipoVisita);
    default:
      return {
        hasAvailability: false,
        source: '',
        strategy: 'unsupported_region',
        lastChecked: new Date().toISOString(),
        error: `Regione non supportata: ${region}`,
      };
  }
}
