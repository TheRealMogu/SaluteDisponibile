import { storage } from '../storage';
import crypto from 'crypto';

export class UnsubscribeService {
  private tokens: Map<string, number> = new Map(); // token -> userId

  generateUnsubscribeToken(userId: number): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.tokens.set(token, userId);
    return token;
  }

  async unsubscribeUser(token: string): Promise<boolean> {
    const userId = this.tokens.get(token);
    if (!userId) {
      return false;
    }

    try {
      await storage.deactivateUser(userId);
      this.tokens.delete(token);
      console.log(`User ${userId} unsubscribed successfully`);
      return true;
    } catch (error) {
      console.error('Error unsubscribing user:', error);
      return false;
    }
  }

  getUnsubscribeUrl(userId: number, baseUrl: string = 'https://salutedisponibile.it'): string {
    const token = this.generateUnsubscribeToken(userId);
    return `${baseUrl}/unsubscribe?token=${token}`;
  }

  // Handle WhatsApp STOP commands
  async handleWhatsAppStop(phoneNumber: string): Promise<boolean> {
    try {
      const users = await storage.getAllActiveUsers();
      const user = users.find(u => u.telefono === phoneNumber && u.canale === 'whatsapp');
      
      if (user) {
        await storage.deactivateUser(user.id);
        console.log(`WhatsApp user ${user.id} (${phoneNumber}) unsubscribed via STOP command`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error handling WhatsApp stop:', error);
      return false;
    }
  }
}

export const unsubscribeService = new UnsubscribeService();