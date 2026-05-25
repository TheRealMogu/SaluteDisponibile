import { schedule } from '@netlify/functions';
import { monitoringService } from '../../server/services/monitoring';

// Netlify Scheduled Function — supporta */15 * * * * anche sul piano gratuito
export const handler = schedule('*/15 * * * *', async () => {
  try {
    await monitoringService.runCheck();
    console.log('Monitor check completed at', new Date().toISOString());
    return { statusCode: 200 };
  } catch (error) {
    console.error('Monitor check failed:', error);
    return { statusCode: 500 };
  }
});
