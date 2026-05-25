export interface ScrapingResult {
  hasAvailability: boolean;
  earliestDate?: string;       // formato DD/MM/YYYY
  availableSlots?: number;
  source: string;              // URL effettivo scrapato
  strategy: string;            // quale strategia ha funzionato
  lastChecked: string;         // ISO timestamp
  error?: string;
}

export interface ScrapeRequest {
  region: string;
  asl: string;
  tipoVisita: string;
}

// Mappa dai nostri codici interni ai termini di ricerca italiani
export const visitaTermini: Record<string, string[]> = {
  cardiologo:      ['cardiolog', 'visita cardiologica', 'ECG'],
  dermatologo:     ['dermatolog', 'visita dermatologica'],
  ortopedico:      ['ortoped', 'visita ortopedica'],
  ginecologo:      ['ginecolog', 'visita ginecologica'],
  oculista:        ['oculist', 'visita oculistica', 'oftalmolog'],
  neurologo:       ['neurolog', 'visita neurologica'],
  endocrinologo:   ['endocrinolog', 'visita endocrinologica'],
  urologo:         ['urol', 'visita urologica'],
  pneumologo:      ['pneumolog', 'visita pneumologica'],
  altro:           ['specialistic'],
};

// URL CupWeb Lite per ogni ULSS Veneto
export const cupwebUrls: Record<string, string> = {
  dolomiti:         'https://cupweb.aulss1.veneto.it/cupweblite/Prenotazione',
  marca:            'https://mdb.ulss.tv.it/cupweblite/Prenotazione',
  serenissima:      'https://cittadino.aulss3.veneto.it/cupliteLP/',
  veneto_orientale: 'https://www.aulss4.veneto.it/prestazioni/prenotazione-cup-ulss4',
  polesana:         'https://cuponline.aulss5.veneto.it/cupweblite/Prenotazione',
  euganea:          'https://cupweb.aulss6.veneto.it/cupweblite/Prenotazione',
  pedemontana:      'https://cupweb.aulss7.veneto.it/cupweblite/Prenotazione',
  berica:           'https://icup.aulss8.veneto.it/',
  scaligera:        'https://cupweb.aulss9.veneto.it/cupweblite/Prenotazione',
};
