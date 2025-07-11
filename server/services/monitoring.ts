import { storage } from '../storage';
import { whatsappService } from './whatsapp';
import { emailService } from './email';

export class MonitoringService {
  private isMonitoring = false;
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    if (this.isMonitoring) {
      console.log('Monitoring already running');
      return;
    }

    this.isMonitoring = true;
    console.log('Starting appointment monitoring...');

    // Check every 15 minutes
    this.intervalId = setInterval(() => {
      this.checkAvailability();
    }, 15 * 60 * 1000);

    // Initial check
    this.checkAvailability();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
    console.log('Monitoring stopped');
  }

  private async checkAvailability() {
    try {
      console.log('Checking appointment availability...');
      const activeUsers = await storage.getAllActiveUsers();
      
      for (const user of activeUsers) {
        // Simulate availability check (in real implementation, this would scrape ASL websites)
        const hasAvailability = this.simulateAvailabilityCheck(user.asl, user.tipoVisita);
        
        if (hasAvailability && user.ultimaDisponibilita !== 'available') {
          console.log(`Found availability for user ${user.id}: ${user.tipoVisita} at ${user.asl}`);
          
          // Send notification
          const notificationSent = await this.sendNotification(user);
          
          if (notificationSent) {
            // Update user's last availability status
            await storage.updateUserAvailability(user.id, 'available');
          }
        } else if (!hasAvailability && user.ultimaDisponibilita === 'available') {
          // Reset availability status when no longer available
          await storage.updateUserAvailability(user.id, 'unavailable');
        }
      }
    } catch (error) {
      console.error('Error during availability check:', error);
    }
  }

  private simulateAvailabilityCheck(asl: string, tipoVisita: string): boolean {
    // Simulate random availability (in real implementation, this would be actual scraping)
    // Higher chance for certain combinations to demonstrate the system
    const random = Math.random();
    
    // Some ASLs have higher availability simulation for demo purposes
    if (asl === 'rm1' || asl === 'milano') {
      return random > 0.7; // 30% chance
    }
    
    return random > 0.85; // 15% chance for others
  }

  private async sendNotification(user: any): Promise<boolean> {
    try {
      if (user.canale === 'whatsapp' && user.telefono) {
        return await whatsappService.sendAppointmentNotification(
          user.telefono,
          user.tipoVisita,
          user.asl
        );
      } else if (user.canale === 'email' && user.email) {
        return await emailService.sendAppointmentNotification(
          user.email,
          user.tipoVisita,
          user.asl
        );
      }
      return false;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }
}

export const monitoringService = new MonitoringService();
