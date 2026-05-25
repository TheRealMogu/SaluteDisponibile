import { BaseScraper, humanDelay } from './base.js';
import { visitaTermini, type ScrapingResult } from './types.js';

const BASE_URL = 'https://www.prenotasalute.regione.lombardia.it';

// Mappa ASL → nome provincia per la ricerca sul portale
const aslProvincia: Record<string, string> = {
  milano:   'Milano',
  bergamo:  'Bergamo',
  brescia:  'Brescia',
  como:     'Como',
  varese:   'Varese',
  monza:    'Monza',
  pavia:    'Pavia',
  mantova:  'Mantova',
  cremona:  'Cremona',
};

export async function scrapeLombardia(asl: string, tipoVisita: string): Promise<ScrapingResult> {
  const { page, ctx } = await BaseScraper.newPage();
  const source = `${BASE_URL}/`;

  try {
    // Strategia 1: pagina pubblica "Prenota Online" con selezione prestazione
    await page.goto(`${BASE_URL}/sito/Home-page-items/In-Evidenza/Prenota-Online`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });
    await humanDelay();

    // Cerca il pulsante/link per accedere alla ricerca disponibilità senza login
    const cercaLink = page.locator('a, button').filter({ hasText: /cerca|disponib|prenota/i }).first();
    if (await cercaLink.count() > 0) {
      await cercaLink.click();
      await page.waitForLoadState('domcontentloaded');
      await humanDelay();
    }

    // Strategia 2: accesso diretto alla ricerca disponibilità
    // Il portale Lombardia usa spesso un iframe o redirect a sistemi esterni
    const frames = page.frames();
    for (const frame of frames) {
      const frameUrl = frame.url();
      if (frameUrl.includes('prenotasalute') || frameUrl.includes('siss')) {
        // Dentro l'iframe, cerca campi di selezione
        const provinciaSelect = frame.locator('select').filter({ has: frame.locator(`option[value*="${asl}"], option:has-text("${aslProvincia[asl] || asl}")`) });
        if (await provinciaSelect.count() > 0) {
          await provinciaSelect.selectOption({ label: aslProvincia[asl] || asl });
          await humanDelay();

          // Cerca il campo visita
          const termini = visitaTermini[tipoVisita] || [tipoVisita];
          for (const termine of termini) {
            const visitaInput = frame.locator('input[type="text"], input[type="search"]').first();
            if (await visitaInput.count() > 0) {
              await visitaInput.fill(termine);
              await humanDelay();
              await visitaInput.press('Enter');
              await page.waitForLoadState('networkidle').catch(() => {});
              break;
            }
          }

          const detect = await BaseScraper.detectAvailability(page);
          if (detect.found) {
            return BaseScraper.result(true, frameUrl, 'iframe_search', {
              earliestDate: detect.date,
            });
          }
        }
      }
    }

    // Strategia 3: cerca testo di disponibilità direttamente nella pagina principale
    const detect = await BaseScraper.detectAvailability(page);
    return BaseScraper.result(detect.found, source, 'page_text', {
      earliestDate: detect.date,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Lombardia] Error for ${asl}/${tipoVisita}:`, msg);
    return BaseScraper.notFound(source, msg);
  } finally {
    await ctx.close();
  }
}
