import { type User, type InsertUser, users } from "@shared/schema";
import fs from 'fs/promises';
import path from 'path';
import { eq } from 'drizzle-orm';

const STORAGE_FILE = path.join(process.cwd(), 'users.json');

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllActiveUsers(): Promise<User[]>;
  updateUserAvailability(id: number, availability: string): Promise<void>;
  deactivateUser(id: number): Promise<void>;
}

// --- File-based storage (local dev, no DATABASE_URL) ---

class MemStorage implements IStorage {
  private users: Map<number, User>;
  private currentId: number;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.loadFromDisk();
  }

  private async loadFromDisk(): Promise<void> {
    try {
      const data = await fs.readFile(STORAGE_FILE, 'utf8');
      const parsed = JSON.parse(data) as { currentId: number; users: Array<[number, User & { createdAt: string | null }]> };
      this.currentId = parsed.currentId ?? 1;
      for (const [id, user] of parsed.users) {
        this.users.set(id, {
          ...user,
          createdAt: user.createdAt ? new Date(user.createdAt) : null,
        });
      }
      console.log(`Loaded ${this.users.size} users from disk`);
    } catch {
      // File doesn't exist yet, start fresh
    }
  }

  private scheduleSave(): void {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveToDisk(), 500);
  }

  private async saveToDisk(): Promise<void> {
    try {
      const data = {
        currentId: this.currentId,
        users: Array.from(this.users.entries()),
      };
      await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving users to disk:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      id,
      nome: insertUser.nome || null,
      telefono: insertUser.telefono || null,
      email: insertUser.email || null,
      canale: insertUser.canale,
      regione: insertUser.regione,
      asl: insertUser.asl,
      tipoVisita: insertUser.tipoVisita,
      attivo: true,
      ultimaDisponibilita: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    this.scheduleSave();
    return user;
  }

  async getAllActiveUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.attivo);
  }

  async updateUserAvailability(id: number, availability: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.ultimaDisponibilita = availability;
      this.users.set(id, user);
      this.scheduleSave();
    }
  }

  async deactivateUser(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.attivo = false;
      this.users.set(id, user);
      this.scheduleSave();
    }
  }
}

// --- Drizzle/Neon storage (production with DATABASE_URL) ---

class DrizzleStorage implements IStorage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dbInstance: any = null;

  private async getDb() {
    if (!this.dbInstance) {
      const mod = await import('./db.js');
      this.dbInstance = mod.db;
    }
    return this.dbInstance;
  }

  async getUser(id: number): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.getDb();
    const [user] = await db.insert(users).values({
      nome: insertUser.nome || null,
      telefono: insertUser.telefono || null,
      email: insertUser.email || null,
      canale: insertUser.canale,
      regione: insertUser.regione,
      asl: insertUser.asl,
      tipoVisita: insertUser.tipoVisita,
      attivo: true,
    }).returning();
    return user;
  }

  async getAllActiveUsers(): Promise<User[]> {
    const db = await this.getDb();
    return db.select().from(users).where(eq(users.attivo, true));
  }

  async updateUserAvailability(id: number, availability: string): Promise<void> {
    const db = await this.getDb();
    await db.update(users)
      .set({ ultimaDisponibilita: availability })
      .where(eq(users.id, id));
  }

  async deactivateUser(id: number): Promise<void> {
    const db = await this.getDb();
    await db.update(users)
      .set({ attivo: false })
      .where(eq(users.id, id));
  }
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DrizzleStorage()
  : new MemStorage();
