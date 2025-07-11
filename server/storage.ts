import { users, type User, type InsertUser } from "@shared/schema";

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

  constructor() {
    this.users = new Map();
    this.currentId = 1;
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
    }
  }

  async deactivateUser(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.attivo = false;
      this.users.set(id, user);
    }
  }
}

export const storage = new MemStorage();
