import { storage } from '../storage';
import { whatsappService } from './whatsapp';
import { emailService } from './email';
import { scrapingService } from './scraping';
import { statusService } from './status';

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
      console.log('Starting comprehensive availability check...');
      await statusService.logCheck();
      
      // Use the new scraping service
      await scrapingService.startScraping();
      
      // After scraping, check for users who need notifications
      const activeUsers = await storage.getAllActiveUsers();
      await statusService.updateUserCount(activeUsers.length);
      
      for (const user of activeUsers) {
        // Check if user's availability status changed to 'available'
        if (user.ultimaDisponibilita === 'available') {
          // Send notification for newly available appointments
          const notificationSent = await this.sendNotification(user);
          
          if (notificationSent) {
            console.log(`Notification sent to user ${user.id} for ${user.tipoVisita} at ${user.asl}`);
            // Reset availability to prevent repeated notifications
            await storage.updateUserAvailability(user.id, 'notified');
          }
        }
      }
    } catch (error) {
      console.error('Error during availability check:', error);
      await statusService.logError(error.message);
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
          user.asl,
          user.id
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
