# SaluteDisponibile.it

Servizio gratuito che monitora i portali delle ASL italiane e avvisa gli utenti via **WhatsApp** o **Email** quando si libera un posto per una visita medica specialistica.

---

## Il problema

Trovare un appuntamento per una visita specialistica in ASL è spesso frustrante: i posti si liberano e si rioccupano in pochi minuti, e l'unico modo per trovarli è ricaricare manualmente il sito più volte al giorno.

SaluteDisponibile elimina questa frustrazione: ti iscrivi una volta sola, noi monitoriamo per te e ti avvisiamo appena si libera un posto.

---

## Come funziona

1. **Scegli il canale** — WhatsApp o Email
2. **Compila il modulo** — Regione → ASL → tipo di visita
3. **Aspetta la notifica** — Il sistema controlla ogni 15 minuti e ti scrive appena trova disponibilità

---

## Regioni supportate

Solo regioni con portali sanitari **pubblicamente accessibili senza login SPID**:

| Regione | Portale | ASL coperte |
|---------|---------|-------------|
| Lombardia | prenotasalute.regione.lombardia.it | Milano, Bergamo, Brescia, Como, Varese, Monza, Pavia, Mantova, Cremona |
| Lazio | salutelazio.it | Roma 1-6, Latina, Frosinone, Viterbo, Rieti |
| Piemonte | salutepiemonte.it | Torino, TO3-5, Cuneo, Asti, Alessandria, Biella, Vercelli, Novara, VCO |
| Veneto | vari portali ULSS | ULSS 1-9 |

---

## Stack tecnico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Node.js + Express + TypeScript |
| Form | React Hook Form + Zod |
| State | TanStack Query |
| Router | Wouter |
| Notifiche Email | Nodemailer (SMTP) |
| Notifiche WhatsApp | WhatsApp Business Cloud API (Meta) |
| Storage | JSON file-based (persistente tra riavvii) |
| Rate limiting | express-rate-limit + express-slow-down |

---

## Struttura del progetto

```
SaluteDisponibile/
├── client/
│   └── src/
│       ├── components/
│       │   ├── registration-modal.tsx   # Form di iscrizione
│       │   ├── success-modal.tsx        # Conferma iscrizione
│       │   └── admin-dashboard.tsx      # Dashboard monitoraggio
│       └── pages/
│           ├── home.tsx                 # Landing page
│           ├── privacy.tsx              # Privacy Policy
│           └── unsubscribe.tsx          # Pagina disiscrizione
├── server/
│   ├── index.ts                         # Entry point, rate limiting
│   ├── routes.ts                        # API routes
│   ├── storage.ts                       # Storage con persistenza JSON
│   └── services/
│       ├── monitoring.ts                # Ciclo di monitoraggio (ogni 15 min)
│       ├── scraping.ts                  # Logica di scraping per regione
│       ├── email.ts                     # Invio notifiche email
│       ├── whatsapp.ts                  # Invio notifiche WhatsApp
│       ├── unsubscribe.ts               # Gestione disiscrizioni
│       └── status.ts                    # Status del sistema (status.json)
├── shared/
│   └── schema.ts                        # Schema DB, validazioni Zod, dati regioni
└── users.json                           # Utenti iscritti (generato automaticamente)
```

---

## API

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| `POST` | `/api/register` | Iscrizione utente (rate limit: 5/15min per IP) |
| `GET` | `/api/regions` | Lista regioni supportate |
| `GET` | `/api/regions/:region/asl` | ASL di una regione |
| `GET` | `/api/visit-types` | Tipi di visita disponibili |
| `GET` | `/api/unsubscribe?token=...` | Disiscrizione via token |
| `POST` | `/api/whatsapp/webhook` | Webhook per comando STOP WhatsApp |
| `GET` | `/api/system/status` | Stato del sistema (admin) |
| `GET` | `/api/monitoring/status` | Stato del monitoraggio |

---

## Configurazione

Le notifiche reali richiedono le seguenti variabili d'ambiente:

### Email (SMTP)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tua@email.com
EMAIL_PASS=app-password-gmail
EMAIL_FROM=noreply@salutedisponibile.it
```

> Per Gmail: attiva l'autenticazione a 2 fattori e genera una **App Password** da [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

### WhatsApp Business API

```env
WHATSAPP_ACCESS_TOKEN=il_tuo_token_meta
WHATSAPP_PHONE_NUMBER_ID=il_tuo_phone_number_id
```

> Registrati su [developers.facebook.com](https://developers.facebook.com), crea un'app di tipo "Business", configura WhatsApp e ottieni il token. Gratuito fino a 1.000 conversazioni/mese.

---

## Avvio locale

```bash
npm install
npm run dev
```

Il server parte su `http://localhost:5000`.

---

## Deploy su Netlify (consigliato — cron gratuito ogni 15 min)

Netlify supporta le Scheduled Functions con qualsiasi intervallo cron, anche sul piano gratuito.

### 1. Database — Neon PostgreSQL (free tier)

Stessi passaggi del deploy Vercel (vedi sotto).

### 2. Variabili d'ambiente su Netlify

Netlify → Site configuration → Environment variables:

| Variabile | Obbligatoria | Descrizione |
|-----------|-------------|-------------|
| `DATABASE_URL` | Sì | Connection string Neon |
| `EMAIL_HOST` | Per email | `smtp.gmail.com` |
| `EMAIL_PORT` | Per email | `587` |
| `EMAIL_USER` | Per email | Tua email Gmail |
| `EMAIL_PASS` | Per email | App Password Gmail |
| `EMAIL_FROM` | Per email | `noreply@salutedisponibile.it` |
| `WHATSAPP_ACCESS_TOKEN` | Per WhatsApp | Token Meta Business API |
| `WHATSAPP_PHONE_NUMBER_ID` | Per WhatsApp | Phone Number ID Meta |

> Non serve `CRON_SECRET`: il monitoring è gestito da una Netlify Scheduled Function interna, non da un endpoint HTTP esposto.

### 3. Struttura Netlify

```
netlify/functions/
  api.ts        ← Express app wrapper (gestisce tutte le route /api/*)
  monitor.ts    ← Scheduled Function: esegue il check ogni 15 minuti
netlify.toml    ← config: build, redirect /api/*, SPA fallback
```

### 4. Deploy

```bash
# Installa Netlify CLI
npm install -g netlify-cli

# Login e deploy
netlify login
netlify deploy --prod
```

---

## Deploy su Vercel

### 1. Database — Neon PostgreSQL (free tier)

1. Crea un account su [neon.tech](https://neon.tech)
2. Crea un nuovo progetto e copia la **Connection String**
3. In Vercel → Settings → Environment Variables aggiungi:
   ```
   DATABASE_URL=postgresql://...
   ```
4. Esegui la migrazione del schema (una volta sola, in locale con DATABASE_URL impostata):
   ```bash
   npm run db:push
   ```

### 2. Variabili d'ambiente su Vercel

| Variabile | Obbligatoria | Descrizione |
|-----------|-------------|-------------|
| `DATABASE_URL` | Sì | Connection string Neon |
| `CRON_SECRET` | Sì | Stringa casuale per proteggere `/api/cron/monitor` |
| `EMAIL_HOST` | Per email | `smtp.gmail.com` |
| `EMAIL_PORT` | Per email | `587` |
| `EMAIL_USER` | Per email | Tua email Gmail |
| `EMAIL_PASS` | Per email | App Password Gmail |
| `EMAIL_FROM` | Per email | `noreply@salutedisponibile.it` |
| `WHATSAPP_ACCESS_TOKEN` | Per WhatsApp | Token Meta Business API |
| `WHATSAPP_PHONE_NUMBER_ID` | Per WhatsApp | Phone Number ID Meta |

### 3. Struttura Vercel

```
api/
  index.ts          ← handler Express per tutte le route /api/*
vercel.json         ← config: build, rewrites, cron ogni 15 minuti
```

Il monitoraggio ogni 15 minuti è gestito da un **cron esterno** che chiama `GET https://tuo-dominio.vercel.app/api/cron/monitor` con header `Authorization: Bearer <CRON_SECRET>`.

> **Nota:** Vercel Hobby non supporta cron più frequenti di una volta al giorno. Usa [cron-job.org](https://cron-job.org) (gratuito) come descritto sotto.

### 4. Cron esterno — cron-job.org (gratuito)

Vercel Hobby non supporta cron più frequenti di una volta al giorno. Usa **[cron-job.org](https://cron-job.org)** (gratuito):

1. Registrati su cron-job.org
2. Crea un nuovo cron job con:
   - **URL:** `https://tuo-dominio.vercel.app/api/cron/monitor`
   - **Metodo:** `GET`
   - **Intervallo:** ogni 15 minuti
   - **Header personalizzato:** `Authorization: Bearer <il tuo CRON_SECRET>`
3. Salva e attiva

### 5. Deploy

```bash
# Prima volta
vercel

# Deploy successivi
vercel --prod
```

---

## Privacy e GDPR

- I dati (email/telefono) sono usati **esclusivamente** per le notifiche
- Ogni notifica email include un **link di disiscrizione** con token unico
- Su WhatsApp basta rispondere **STOP** per disiscriversi
- Il servizio non è affiliato ad alcun ente sanitario pubblico
