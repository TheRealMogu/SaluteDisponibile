# SaluteDisponibile — Scraper Microservice

Microservizio Playwright che esegue il vero scraping dei portali ASL italiani.
Da deployare su **Railway** (free tier sufficiente).

## Endpoints

| Metodo | Path | Descrizione |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/scrape` | Scraping singolo |
| `POST` | `/scrape/batch` | Scraping batch (max 20) |

### POST /scrape
```json
{
  "region": "veneto",
  "asl": "euganea",
  "tipoVisita": "cardiologo"
}
```
Risposta:
```json
{
  "hasAvailability": true,
  "earliestDate": "15/06/2025",
  "availableSlots": 3,
  "source": "https://cupweb.aulss6.veneto.it/cupweblite/Prenotazione",
  "strategy": "cupweblite_table",
  "lastChecked": "2025-06-01T10:00:00.000Z"
}
```

## Deploy su Railway

1. Vai su [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Seleziona questo repository, **Root Directory: `scraper/`**
3. Railway usa il `Dockerfile` automaticamente
4. Aggiungi la variabile d'ambiente:
   ```
   SCRAPER_API_KEY=una_stringa_casuale_sicura
   ```
5. Copia l'URL pubblico che Railway assegna (es. `https://scraper-xxx.up.railway.app`)

## Variabili d'ambiente Netlify da aggiungere

Dopo il deploy su Railway, aggiungi su Netlify:
```
SCRAPER_API_URL=https://scraper-xxx.up.railway.app
SCRAPER_API_KEY=la_stessa_stringa_di_prima
```

## Come funziona il scraping per regione

| Regione | Portale | Strategia |
|---------|---------|-----------|
| Veneto | CupWeb Lite (per ULSS) | Form search → tabella date → estrazione prima data |
| Lazio | TDA Specialistica | Monitor tempi attesa → rileva "in target" |
| Lombardia | prenotasalute.regione.lombardia.it | Navigazione portale → ricerca prestazione |
| Piemonte | salutepiemonte.it | Pagina tempi attesa → pattern matching |

## Note tecniche

- Usa **Playwright Chromium** con anti-bot (user-agent reale, nasconde `webdriver`)
- Comportamento umano: delay casuali tra azioni (800–2000ms)
- Timeout per singola richiesta: 45 secondi
- Il browser viene condiviso tra le richieste della stessa run per efficienza
- Se un portale cambia struttura, aggiorna i selettori in `scrapers/<regione>.ts`
