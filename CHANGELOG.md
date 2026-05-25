# Changelog

## [Unreleased] — Bug fix session

### Contesto

Il progetto era completamente costruito nella struttura (frontend, backend, notifiche, scraping, disiscrizione), ma una serie di bug — alcuni silenti, altri critici a runtime — impedivano il corretto funzionamento in produzione.

---

### Bug corretti

#### 1. Loop infinito di notifiche (`server/services/scraping.ts`)

**Problema**
Il campo `ultimaDisponibilita` usava tre valori: `'available'`, `'unavailable'`, `'notified'`.
Il flusso era:
1. Scraping imposta → `'available'`
2. Monitoring invia notifica, imposta → `'notified'`
3. Ciclo successivo: scraping vede `'notified'` ≠ `'available'` → aggiorna a `'available'`
4. Monitoring invia un'altra notifica → loop infinito

**Fix**
In `processScrapingResult`, il confronto ora usa la semantica logica invece della stringa esatta:
```ts
const wasAvailable = user.ultimaDisponibilita === 'available' || user.ultimaDisponibilita === 'notified';
const isAvailable = result.hasAvailability;
if (wasAvailable !== isAvailable) { ... }
```
`'notified'` è trattato come equivalente a `'available'`: la notifica non viene riinviata finché la disponibilità non scompare e poi ritorna.

---

#### 2. Storage volatile — dati persi al riavvio (`server/storage.ts`)

**Problema**
`MemStorage` teneva gli utenti solo in memoria (`Map`). A ogni riavvio del server tutti gli iscritti venivano cancellati.

**Fix**
Aggiunta persistenza automatica su `users.json`:
- Al **startup**: carica gli utenti dal file (con deserializzazione corretta delle date)
- Dopo ogni **scrittura**: salva con debounce da 500ms per evitare I/O eccessivo

```ts
private scheduleSave(): void {
  if (this.saveTimeout) clearTimeout(this.saveTimeout);
  this.saveTimeout = setTimeout(() => this.saveToDisk(), 500);
}
```

---

#### 3. Prefisso +39 non salvato nel numero WhatsApp (`client/src/components/registration-modal.tsx`)

**Problema**
Il form mostrava "+39" come testo decorativo a sinistra del campo telefono, ma non veniva incluso nel valore salvato. Il numero `"333 123 4567"` veniva inviato all'API WhatsApp che richiede formato internazionale (`"+39333123456"`).

**Fix**
In `onSubmit`, prima di inviare i dati:
```ts
const cleaned = processedData.telefono.replace(/[\s\-().]/g, '');
processedData.telefono = cleaned.startsWith('+') ? cleaned : `+39${cleaned}`;
```

---

#### 4. Checkbox privacy decorativa — form inviabile senza consenso (`client/src/components/registration-modal.tsx`)

**Problema**
La checkbox della privacy policy usava `<Checkbox required />` senza essere collegata a react-hook-form né a nessuno stato. Il form poteva essere inviato anche senza spuntarla.

**Fix**
Collegata a un `useState<boolean>`:
```tsx
const [privacyAccepted, setPrivacyAccepted] = useState(false);
<Checkbox
  id="privacy-checkbox"
  checked={privacyAccepted}
  onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
/>
```
Il pulsante di submit rimane disabilitato finché `privacyAccepted` è `false`.

---

#### 5. TypeScript: `error.message` su tipo `unknown` (`server/services/monitoring.ts`)

**Problema**
Nel blocco `catch`, TypeScript tipizza `error` come `unknown`. Accedere a `error.message` direttamente causa un errore di compilazione.

**Fix**
```ts
await statusService.logError(
  error instanceof Error ? error.message : String(error)
);
```

---

#### 6. Rate limiter no-op — registrazioni illimitate (`server/routes.ts` + `server/index.ts`)

**Problema**
In `index.ts` erano definiti due rate limiter (globale 100/15min, registrazione 5/15min). Tuttavia `registerRoutes` ridefiniva localmente un proprio `registrationLimiter` che non faceva nulla (chiamava sempre `next()`), ignorando quello reale.

**Fix**
`registerRoutes` ora accetta il limiter come parametro opzionale:
```ts
export async function registerRoutes(app: Express, registrationLimiter?: RequestHandler)
```
E `index.ts` lo passa esplicitamente:
```ts
const server = await registerRoutes(app, registrationLimiter);
```

---

#### 7. Tipi TypeScript mancanti nelle query (`client/src/components/registration-modal.tsx`, `client/src/pages/unsubscribe.tsx`)

**Problema**
Le chiamate `useQuery` erano non tipizzate (`unknown`), causando errori TypeScript quando si accedeva alle proprietà dei risultati.

**Fix**
Aggiunti i tipi generici:
```ts
type SelectOption = { value: string; text: string };
const { data: regions = [] } = useQuery<SelectOption[]>({ ... });

// unsubscribe.tsx
const { data } = useQuery<{ success: boolean; message?: string }>({ ... });
```
Inoltre fixato il campo `nome` che passava `null` a `<Input>` (HTML non accetta `null` come value):
```tsx
<Input {...field} value={field.value ?? ''} />
```

---

### Stato dopo i fix

- `npm run check` → **0 errori TypeScript**
- Nessuna dipendenza aggiuntiva richiesta
- Comportamento a runtime invariato per l'utente finale
- La pipeline di notifiche è ora idempotente: un utente non riceve la stessa notifica due volte per lo stesso slot disponibile
