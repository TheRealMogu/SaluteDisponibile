import { BaseScraper, humanDelay } from './base.js';
import { visitaTermini, type ScrapingResult } from './types.js';

// Portale prenotazioni Piemonte — sistema TAO
const PORTALE_URL = 'https://www.salutepiemonte.it';
const TEMPI_ATTESA_URL = 'https://www.salutepiemonte.it/cms/it/tempi-di-attesa';

// Mappa ASL Piemonte → nome sul portale
const aslNomi: Record<string, string> = {
  torino:   'ASL Città di Torino',
  to3:      'ASL TO3',
  to4:      'ASL TO4',
  to5:      'ASL TO5',
  cuneo:    'ASL CN1',
  asti:     'ASL AT',
  alessandria: 'ASL AL',
  biella:   'ASL BI',
  vercelli: 'ASL VC',
  novara:   'ASL NO',
  verbano:  'ASL VCO',
};

export async function scrapePiemonte(asl: string, tipoVisita: string): Promise<ScrapingResult> {
  const { page, ctx } = await BaseScraper.newPage();

  try {
    // Strategia 1: pagina tempi di attesa pubblica
    await page.goto(TEMPI_ATTESA_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await humanDelay();
    await page.waitForLoadState('networkidle').catch(() => {});

    const nomeAsl = aslNomi[asl] || asl;
    const termini = visitaTermini[tipoVisita] || [tipoVisita];
    const bodyText = (await page.textContent('body') || '').toLowerCase();

    // Cerca la sezione relativa a questa ASL e tipo visita
    for (const termine of termini) {
      if (bodyText.includes(termine.toLowerCase())) {
        // Trova il contesto intorno al termine
        const idx = bodyText.indexOf(termine.toLowerCase());
        const context = bodyText.slice(Math.max(0, idx - 200), idx + 200);

        const hasFuoriTarget = context.includes('fuori') || context.includes('superato') || context.includes('>') && context.includes('giorni');
        const dateMatch = context.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
        const hasDate = !!dateMatch;

        if (hasDate && !hasFuoriTarget) {
          return BaseScraper.result(true, TEMPI_ATTESA_URL, 'waiting_times_page', {
            earliestDate: dateMatch[1],
          });
        }
      }
    }

    // Strategia 2: accesso diretto al portale prenotazioni
    await page.goto(PORTALE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await humanDelay();

    // Cerca link per prenotazioni/disponibilità
    const bookingLink = page.locator('a').filter({ hasText: /prenotat|disponib/i }).first();
    if (await bookingLink.count() > 0) {
      await bookingLink.click();
      await page.waitForLoadState('domcontentloaded');
      await humanDelay();

      // Cerca campo per tipo visita
      const searchInput = page.locator('input[type="text"], input[type="search"]').first();
      if (await searchInput.count() > 0) {
        const termineRicerca = termini[0];
        await searchInput.fill(termineRicerca);
        await searchInput.press('Enter');
        await page.waitForLoadState('networkidle').catch(() => {});
        await humanDelay();

        const detect = await BaseScraper.detectAvailability(page);
        if (detect.found) {
          return BaseScraper.result(true, page.url(), 'portal_search', {
            earliestDate: detect.date,
          });
        }
      }
    }

    const detect = await BaseScraper.detectAvailability(page);
    return BaseScraper.result(detect.found, page.url(), 'page_text', {
      earliestDate: detect.date,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Piemonte] Error for ${asl}/${tipoVisita}:`, msg);
    return BaseScraper.notFound(PORTALE_URL, msg);
  } finally {
    await ctx.close();
  }
}
