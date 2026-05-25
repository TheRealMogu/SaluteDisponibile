import { type User, type InsertUser } from "@shared/schema";
import fs from 'fs/promises';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'users.json');

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllActiveUsers(): Promise<User[]>;
  updateUserAvailability(id: number, availability: string): Promise<void>;
  deactivateUser(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
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

export const storage = new MemStorage();
