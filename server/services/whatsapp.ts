interface WhatsAppMessage {
  to: string;
  message: string;
}

export class WhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  async sendMessage({ to, message }: WhatsAppMessage): Promise<boolean> {
    if (!this.accessToken || !this.phoneNumberId) {
      console.error('WhatsApp credentials not configured');
      return false;
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        })
      });

      if (response.ok) {
        console.log(`WhatsApp message sent to ${to}`);
        return true;
      } else {
        const error = await response.text();
        console.error('WhatsApp API error:', error);
        return false;
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  async sendAppointmentNotification(to: string, tipoVisita: string, asl: string): Promise<boolean> {
    const message = `🏥 POSTO DISPONIBILE! 

Si è liberato un posto per: ${tipoVisita}
ASL: ${asl}

Prenota subito sul portale della tua ASL!

⚠️ I posti si esauriscono velocemente, affrettati!

---
SaluteDisponibile.it`;

    return this.sendMessage({ to, message });
  }
}

export const whatsappService = new WhatsAppService();
