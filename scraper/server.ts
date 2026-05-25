import express from 'express';
import { scrape } from './scrapers/index.js';
import { BaseScraper } from './scrapers/base.js';

const app = express();
app.use(express.json());

const API_KEY = process.env.SCRAPER_API_KEY || '';

// Middleware autenticazione
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  if (API_KEY && req.headers['x-api-key'] !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Health check per Railway
app.get('/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Endpoint principale — scraping singolo
app.post('/scrape', async (req, res) => {
  const { region, asl, tipoVisita } = req.body;

  if (!region || !asl || !tipoVisita) {
    return res.status(400).json({ error: 'Parametri mancanti: region, asl, tipoVisita' });
  }

  try {
    const result = await scrape({ region, asl, tipoVisita });
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[server] Scraping error:', msg);
    res.status(500).json({ error: msg });
  }
});

// Endpoint batch — più richieste in una chiamata sola (più efficiente)
app.post('/scrape/batch', async (req, res) => {
  const { requests } = req.body as { requests: Array<{ region: string; asl: string; tipoVisita: string }> };

  if (!Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({ error: 'Parametro "requests" mancante o vuoto' });
  }

  if (requests.length > 20) {
    return res.status(400).json({ error: 'Max 20 richieste per batch' });
  }

  try {
    // Esegue in serie per non sovraccaricare il browser
    const results = [];
    for (const req of requests) {
      const result = await scrape(req).catch(err => ({
        hasAvailability: false,
        source: '',
        strategy: 'error',
        lastChecked: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
      }));
      results.push({ ...req, result });
    }

    res.json({ results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

const port = parseInt(process.env.PORT || '3001', 10);
app.listen(port, () => {
  console.log(`Scraper microservice running on port ${port}`);
});

// Pulizia browser su shutdown
process.on('SIGTERM', async () => {
  await BaseScraper.closeBrowser();
  process.exit(0);
});
