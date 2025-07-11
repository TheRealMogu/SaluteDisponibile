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

// Mock data for regions and ASLs
export const regionsData = {
  'lazio': [
    { value: 'rm1', text: 'ASL Roma 1' },
    { value: 'rm2', text: 'ASL Roma 2' },
    { value: 'rm3', text: 'ASL Roma 3' },
    { value: 'latina', text: 'ASL Latina' },
    { value: 'frosinone', text: 'ASL Frosinone' }
  ],
  'lombardia': [
    { value: 'milano', text: 'ATS Milano' },
    { value: 'bergamo', text: 'ATS Bergamo' },
    { value: 'brescia', text: 'ATS Brescia' }
  ],
  'campania': [
    { value: 'napoli1', text: 'ASL Napoli 1 Centro' },
    { value: 'napoli2', text: 'ASL Napoli 2 Nord' },
    { value: 'salerno', text: 'ASL Salerno' }
  ],
  'sicilia': [
    { value: 'palermo', text: 'ASP Palermo' },
    { value: 'catania', text: 'ASP Catania' }
  ],
  'veneto': [
    { value: 'venezia', text: 'ULSS 3 Serenissima' },
    { value: 'verona', text: 'ULSS 9 Scaligera' }
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
