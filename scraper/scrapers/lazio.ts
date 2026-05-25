import { BaseScraper, humanDelay } from './base.js';
import { visitaTermini, type ScrapingResult } from './types.js';

// Il sistema TDA (Tempi di Attesa) espone dati pubblici sulle liste d'attesa
const TDA_URL = 'https://tdaspecialistica.regione.lazio.it/tda/';
const SALUTE_LAZIO = 'https://www.salutelazio.it/monitoraggio-tempi-di-attesa-dati';

// Mappa ASL Lazio → nome visualizzato sul portale
const aslNomi: Record<string, string> = {
  rm1:       'ASL Roma 1',
  rm2:       'ASL Roma 2',
  rm3:       'ASL Roma 3',
  rm4:       'ASL Roma 4',
  rm5:       'ASL Roma 5',
  rm6:       'ASL Roma 6',
  latina:    'ASL Latina',
  frosinone: 'ASL Frosinone',
  viterbo:   'ASL Viterbo',
  rieti:     'ASL Rieti',
};

export async function scrapeLazio(asl: string, tipoVisita: string): Promise<ScrapingResult> {
  const { page, ctx } = await BaseScraper.newPage();

  try {
    // Strategia 1: portale TDA — mostra i tempi di attesa per prestazione/ASL
    // Se i tempi sono "in target" (< 30/60 giorni), c'è disponibilità
    await page.goto(TDA_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await humanDelay();

    // Aspetta che il contenuto JS venga caricato
    await page.waitForLoadState('networkidle').catch(() => {});
    await humanDelay();

    const nomeAsl = aslNomi[asl] || asl;
    const termini = visitaTermini[tipoVisita] || [tipoVisita];

    // Cerca riga corrispondente a questa ASL + visita
    for (const termine of termini) {
      // Seleziona filtri se presenti
      const aslFilter = page.locator('select, [class*="filter"]').filter({ hasText: /asl|struttura/i }).first();
      if (await aslFilter.count() > 0) {
        await aslFilter.selectOption({ label: nomeAsl }).catch(() => {});
        await humanDelay();
      }

      const searchInput = page.locator('input[type="text"], input[placeholder*="cerca"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill(termine);
        await humanDelay();
        await searchInput.press('Enter');
        await page.waitForLoadState('networkidle').catch(() => {});
      }

      // Cerca indicatori di "in target" (verde = disponibile entro i tempi)
      const bodyText = (await page.textContent('body') || '').toLowerCase();

      // Cerca percentuali o indicatori di rispetto tempi
      const inTarget = bodyText.includes('in target') ||
                       bodyText.includes('rispettato') ||
                       bodyText.includes('100%') ||
                       /\b\d{1,2}\/\d{1,2}\/\d{4}\b/.test(bodyText);

      const fuoriTarget = bodyText.includes('fuori target') ||
                          bodyText.includes('lista d\'attesa') ||
                          bodyText.includes('0%');

      if (inTarget && !fuoriTarget) {
        const dateMatch = bodyText.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
        return BaseScraper.result(true, TDA_URL, 'tda_in_target', {
          earliestDate: dateMatch?.[1],
        });
      }

      if (fuoriTarget) {
        return BaseScraper.result(false, TDA_URL, 'tda_fuori_target');
      }
    }

    // Strategia 2: pagina pubblica waiting times su salutelazio.it
    await page.goto(SALUTE_LAZIO, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await humanDelay();
    await page.waitForLoadState('networkidle').catch(() => {});

    const detect = await BaseScraper.detectAvailability(page);
    return BaseScraper.result(detect.found, SALUTE_LAZIO, 'salutelazio_monitoring', {
      earliestDate: detect.date,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Lazio] Error for ${asl}/${tipoVisita}:`, msg);
    return BaseScraper.notFound(TDA_URL, msg);
  } finally {
    await ctx.close();
  }
}
