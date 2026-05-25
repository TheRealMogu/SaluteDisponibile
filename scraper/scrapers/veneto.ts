import { BaseScraper, humanDelay, sleep } from './base.js';
import { visitaTermini, cupwebUrls, type ScrapingResult } from './types.js';

// CupWeb Lite: sistema SSR condiviso tra molte ULSS — è il più scrapabile
export async function scrapeVeneto(asl: string, tipoVisita: string): Promise<ScrapingResult> {
  const { page, ctx } = await BaseScraper.newPage();
  const cupUrl = cupwebUrls[asl] || cupwebUrls['euganea']; // fallback

  try {
    await page.goto(cupUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await humanDelay();

    // CupWeb Lite ha una struttura relativamente standard tra le ULSS:
    // 1. Campo di ricerca per prestazione
    // 2. Lista risultati con date disponibili
    // 3. Selettore di struttura (opzionale)

    const termini = visitaTermini[tipoVisita] || [tipoVisita];

    for (const termine of termini) {
      // Cerca campo di input per la prestazione
      const inputSelectors = [
        'input#txtPrestazione',
        'input[name*="prest"]',
        'input[placeholder*="prestazione"]',
        'input[placeholder*="visita"]',
        'input[type="text"]:not([type="hidden"])',
      ];

      let inputFound = false;
      for (const sel of inputSelectors) {
        const input = page.locator(sel).first();
        if (await input.count() > 0 && await input.isVisible()) {
          await input.clear();
          await input.fill(termine);
          await humanDelay();

          // Prova a cercare suggerimenti autocomplete
          await page.waitForTimeout(800);
          const suggestions = page.locator('[class*="autocomplete"] li, [class*="suggest"] li, .ui-menu-item');
          if (await suggestions.count() > 0) {
            await suggestions.first().click();
            await humanDelay();
          } else {
            // Nessun autocomplete, premi invio o clicca cerca
            const searchBtn = page.locator('button[type="submit"], input[type="submit"], button:has-text("Cerca")').first();
            if (await searchBtn.count() > 0) {
              await searchBtn.click();
            } else {
              await input.press('Enter');
            }
          }

          await page.waitForLoadState('networkidle').catch(() => {});
          await humanDelay();
          inputFound = true;
          break;
        }
      }

      if (!inputFound) continue;

      // Analisi risultati — cerca date e disponibilità
      const bodyText = (await page.textContent('body') || '').toLowerCase();

      // CupWeb Lite mostra "Nessuna disponibilità" o date quando trova slot
      const noAvail = bodyText.includes('nessuna disponibilità') ||
                      bodyText.includes('nessun risultato') ||
                      bodyText.includes('non trovato');

      if (noAvail) {
        return BaseScraper.result(false, cupUrl, 'cupweblite_no_availability');
      }

      // Cerca righe con date nella tabella risultati
      const dateRows = page.locator('table tr, .risultato, [class*="result"]').filter({ hasText: /\d{1,2}\/\d{1,2}\/\d{4}/ });
      const rowCount = await dateRows.count();

      if (rowCount > 0) {
        // Prendi la prima data disponibile
        const firstRow = await dateRows.first().textContent() || '';
        const dateMatch = firstRow.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
        return BaseScraper.result(true, cupUrl, 'cupweblite_table', {
          earliestDate: dateMatch?.[1],
          availableSlots: rowCount,
        });
      }

      // Fallback: rilevamento generico
      const detect = await BaseScraper.detectAvailability(page);
      if (detect.found) {
        return BaseScraper.result(true, cupUrl, 'cupweblite_text', {
          earliestDate: detect.date,
        });
      }
    }

    return BaseScraper.result(false, cupUrl, 'cupweblite_not_found');

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Veneto] Error for ${asl}/${tipoVisita}:`, msg);
    return BaseScraper.notFound(cupUrl, msg);
  } finally {
    await ctx.close();
  }
}
