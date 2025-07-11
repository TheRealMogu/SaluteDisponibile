import fs from 'fs/promises';
import path from 'path';

interface SystemStatus {
  isRunning: boolean;
  lastCheck: Date;
  totalChecks: number;
  totalUsers: number;
  errors: string[];
  uptime: number;
}

export class StatusService {
  private status: SystemStatus;
  private statusFile: string;
  private startTime: Date;

  constructor() {
    this.statusFile = path.join(process.cwd(), 'status.json');
    this.startTime = new Date();
    this.status = {
      isRunning: true,
      lastCheck: new Date(),
      totalChecks: 0,
      totalUsers: 0,
      errors: [],
      uptime: 0
    };
    
    this.loadStatus();
  }

  private async loadStatus() {
    try {
      const data = await fs.readFile(this.statusFile, 'utf8');
      const savedStatus = JSON.parse(data);
      this.status = { ...this.status, ...savedStatus };
    } catch (error) {
      // File doesn't exist or is corrupted, use default status
      console.log('Creating new status file...');
    }
  }

  async updateStatus(updates: Partial<SystemStatus>) {
    this.status = { 
      ...this.status, 
      ...updates, 
      uptime: Date.now() - this.startTime.getTime() 
    };
    
    try {
      await fs.writeFile(this.statusFile, JSON.stringify(this.status, null, 2));
    } catch (error) {
      console.error('Error saving status:', error);
    }
  }

  async logCheck() {
    await this.updateStatus({
      lastCheck: new Date(),
      totalChecks: this.status.totalChecks + 1
    });
  }

  async logError(error: string) {
    const errors = [...this.status.errors, `${new Date().toISOString()}: ${error}`];
    // Keep only last 10 errors
    if (errors.length > 10) {
      errors.splice(0, errors.length - 10);
    }
    
    await this.updateStatus({ errors });
  }

  async updateUserCount(count: number) {
    await this.updateStatus({ totalUsers: count });
  }

  getStatus(): SystemStatus {
    return {
      ...this.status,
      uptime: Date.now() - this.startTime.getTime()
    };
  }

  // Send admin notification if there are critical errors
  async checkAndNotifyAdmin() {
    const status = this.getStatus();
    const recentErrors = status.errors.filter(error => {
      const errorTime = new Date(error.split(':')[0]);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return errorTime > hourAgo;
    });

    if (recentErrors.length > 5) {
      console.error('CRITICAL: Too many errors in the last hour', recentErrors);
      // Here you could send an email or WhatsApp message to admin
    }
  }
}

export const statusService = new StatusService();