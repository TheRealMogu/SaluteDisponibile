import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import type { ScrapingResult } from './types.js';

// Delay casuale per simulare comportamento umano
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const humanDelay = () => sleep(800 + Math.random() * 1200);

export class BaseScraper {
  private static browser: Browser | null = null;

  // Browser condiviso tra scraping della stessa run (risparmia memoria)
  static async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1280,720',
          // Nasconde che è headless
          '--disable-blink-features=AutomationControlled',
        ],
      });
    }
    return this.browser;
  }

  static async newContext(): Promise<BrowserContext> {
    const browser = await this.getBrowser();
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'it-IT',
      timezoneId: 'Europe/Rome',
      viewport: { width: 1280, height: 720 },
      extraHTTPHeaders: {
        'Accept-Language': 'it-IT,it;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'DNT': '1',
      },
    });

    // Rimuove le proprietà che tradiscono Playwright/headless
    await ctx.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, 'languages', { get: () => ['it-IT', 'it'] });
      // @ts-ignore
      window.chrome = { runtime: {} };
    });

    return ctx;
  }

  static async newPage(): Promise<{ page: Page; ctx: BrowserContext }> {
    const ctx = await this.newContext();
    const page = await ctx.newPage();
    return { page, ctx };
  }

  static async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Cerca testo indicante disponibilità nella pagina
  static async detectAvailability(page: Page): Promise<{
    found: boolean;
    date?: string;
    slots?: number;
  }> {
    const text = (await page.textContent('body') || '').toLowerCase();

    // Segnali NEGATIVI — nessuna disponibilità
    const negativePatterns = [
      'nessuna disponibilità',
      'nessun appuntamento',
      'non ci sono disponibilità',
      'lista d\'attesa',
      'nessun risultato',
      'non disponibile',
      'fuori agenda',
    ];
    for (const p of negativePatterns) {
      if (text.includes(p)) return { found: false };
    }

    // Segnali POSITIVI — c'è disponibilità
    const positivePatterns = [
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/,   // data DD/MM/YYYY o DD-MM-YYYY
      /prima disponibilità/i,
      /disponibile/i,
      /prenota/i,
      /seleziona.*data/i,
      /scegli.*appuntamento/i,
    ];

    for (const p of positivePatterns) {
      if (typeof p === 'string' && text.includes(p)) return { found: true };
      if (p instanceof RegExp && p.test(text)) {
        // Prova ad estrarre la prima data trovata
        const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        return { found: true, date: dateMatch?.[1] };
      }
    }

    return { found: false };
  }

  static notFound(source: string, error?: string): ScrapingResult {
    return {
      hasAvailability: false,
      source,
      strategy: 'not_found',
      lastChecked: new Date().toISOString(),
      error,
    };
  }

  static result(
    hasAvailability: boolean,
    source: string,
    strategy: string,
    extra: Partial<ScrapingResult> = {}
  ): ScrapingResult {
    return {
      hasAvailability,
      source,
      strategy,
      lastChecked: new Date().toISOString(),
      ...extra,
    };
  }
}

export { humanDelay, sleep };
