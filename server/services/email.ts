import nodemailer from 'nodemailer';
import { unsubscribeService } from './unsubscribe';

interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    });
  }

  async sendEmail({ to, subject, text, html }: EmailMessage): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@salutedisponibile.it',
        to,
        subject,
        text,
        html
      });

      console.log(`Email sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendAppointmentNotification(to: string, tipoVisita: string, asl: string, userId?: number): Promise<boolean> {
    const subject = '🏥 Posto Disponibile per la tua Visita!';
    
    const unsubscribeUrl = userId ? unsubscribeService.getUnsubscribeUrl(userId) : '';
    
    const text = `
POSTO DISPONIBILE!

Si è liberato un posto per: ${tipoVisita}
ASL: ${asl}

Prenota subito sul portale della tua ASL!

ATTENZIONE: I posti si esauriscono velocemente, affrettati!

---
SaluteDisponibile.it
Servizio gratuito di notifiche per visite mediche

Per disiscriverti: ${unsubscribeUrl}
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🏥 Posto Disponibile!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981;">
            <h2 style="color: #065F46; margin-top: 0;">Si è liberato un posto per:</h2>
            <p style="font-size: 18px; font-weight: bold; color: #1F2937;">${tipoVisita}</p>
            <p style="color: #6B7280;"><strong>ASL:</strong> ${asl}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background: #FEF3C7; border-radius: 8px; border: 1px solid #F59E0B;">
            <p style="margin: 0; color: #92400E;"><strong>⚠️ ATTENZIONE:</strong> I posti si esauriscono velocemente, prenota subito!</p>
          </div>
          
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            Questo messaggio è stato inviato da SaluteDisponibile.it<br>
            Servizio gratuito di notifiche per visite mediche
          </p>
          ${userId ? `
          <div style="margin-top: 20px; padding: 15px; background: #F3F4F6; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #6B7280;">
              Non vuoi più ricevere queste notifiche?<br>
              <a href="${unsubscribeUrl}" style="color: #DC2626; text-decoration: underline;">Clicca qui per disiscriverti</a>
            </p>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    return this.sendEmail({ to, subject, text, html });
  }
}

export const emailService = new EmailService();
