import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nome: text("nome"),
  telefono: text("telefono"),
  email: text("email"),
  canale: text("canale").notNull(), // 'whatsapp' or 'email'
  regione: text("regione").notNull(),
  asl: text("asl").notNull(),
  tipoVisita: text("tipo_visita").notNull(),
  attivo: boolean("attivo").default(true),
  ultimaDisponibilita: text("ultima_disponibilita"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  attivo: true,
  ultimaDisponibilita: true,
  createdAt: true,
}).extend({
  canale: z.enum(['whatsapp', 'email']),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
}).refine((data) => {
  if (data.canale === 'whatsapp' && !data.telefono) {
    return false;
  }
  if (data.canale === 'email' && !data.email) {
    return false;
  }
  return true;
}, {
  message: "Telefono richiesto per WhatsApp, email richiesta per notifiche email"
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Regions data - Focus on publicly accessible regions without login requirements
export const regionsData = {
  'lombardia': [
    { value: 'milano', text: 'ATS Milano' },
    { value: 'bergamo', text: 'ATS Bergamo' },
    { value: 'brescia', text: 'ATS Brescia' },
    { value: 'como', text: 'ATS Insubria - Como' },
    { value: 'varese', text: 'ATS Insubria - Varese' },
    { value: 'monza', text: 'ATS Monza e Brianza' },
    { value: 'pavia', text: 'ATS Pavia' },
    { value: 'mantova', text: 'ATS Valpadana - Mantova' },
    { value: 'cremona', text: 'ATS Valpadana - Cremona' }
  ],
  'lazio': [
    { value: 'rm1', text: 'ASL Roma 1' },
    { value: 'rm2', text: 'ASL Roma 2' },
    { value: 'rm3', text: 'ASL Roma 3' },
    { value: 'rm4', text: 'ASL Roma 4' },
    { value: 'rm5', text: 'ASL Roma 5' },
    { value: 'rm6', text: 'ASL Roma 6' },
    { value: 'latina', text: 'ASL Latina' },
    { value: 'frosinone', text: 'ASL Frosinone' },
    { value: 'viterbo', text: 'ASL Viterbo' },
    { value: 'rieti', text: 'ASL Rieti' }
  ],
  'piemonte': [
    { value: 'torino', text: 'ASL Città di Torino' },
    { value: 'to3', text: 'ASL TO3' },
    { value: 'to4', text: 'ASL TO4' },
    { value: 'to5', text: 'ASL TO5' },
    { value: 'cuneo', text: 'ASL Cuneo 1' },
    { value: 'asti', text: 'ASL Asti' },
    { value: 'alessandria', text: 'ASL Alessandria' },
    { value: 'biella', text: 'ASL Biella' },
    { value: 'vercelli', text: 'ASL Vercelli' },
    { value: 'novara', text: 'ASL Novara' },
    { value: 'verbano', text: 'ASL Verbano-Cusio-Ossola' }
  ],
  'veneto': [
    { value: 'dolomiti', text: 'ULSS 1 Dolomiti' },
    { value: 'marca', text: 'ULSS 2 Marca Trevigiana' },
    { value: 'serenissima', text: 'ULSS 3 Serenissima' },
    { value: 'veneto_orientale', text: 'ULSS 4 Veneto Orientale' },
    { value: 'polesana', text: 'ULSS 5 Polesana' },
    { value: 'euganea', text: 'ULSS 6 Euganea' },
    { value: 'pedemontana', text: 'ULSS 7 Pedemontana' },
    { value: 'berica', text: 'ULSS 8 Berica' },
    { value: 'scaligera', text: 'ULSS 9 Scaligera' }
  ]
};

export const visitTypes = [
  { value: 'cardiologo', text: 'Visita Cardiologica' },
  { value: 'dermatologo', text: 'Visita Dermatologica' },
  { value: 'ortopedico', text: 'Visita Ortopedica' },
  { value: 'ginecologo', text: 'Visita Ginecologica' },
  { value: 'oculista', text: 'Visita Oculistica' },
  { value: 'neurologo', text: 'Visita Neurologica' },
  { value: 'endocrinologo', text: 'Visita Endocrinologica' },
  { value: 'urologo', text: 'Visita Urologica' },
  { value: 'pneumologo', text: 'Visita Pneumologica' },
  { value: 'altro', text: 'Altra visita specialistica' }
];
