import cron from 'node-cron';
import { lineClient } from '@/line/client';
import { sendReminders } from '@/services/notificationService';
import { getGlobalSendTime } from '@/services/settingsService';
import { logger } from '@/lib/logger';

async function sendMulticast(userIds: string[], message: string): Promise<number> {
  await lineClient.multicast({
    to: userIds,
    messages: [{ type: 'text', text: message }],
  });
  return userIds.length;
}

export function startScheduler(): cron.ScheduledTask {
  const cronExpression = '0 * * * *';
  const timezone = 'Asia/Tokyo';

  logger.info('Starting scheduler', {
    cron: cronExpression,
    timezone,
  });

  const task = cron.schedule(
    cronExpression,
    () => {
      const now = new Date();
      const currentHour = `${String(now.getHours()).padStart(2, '0')}:00`;
      const globalDefault = getGlobalSendTime();

      logger.info('Scheduler execution started', { currentHour, globalDefault });

      sendReminders(sendMulticast, currentHour, globalDefault)
        .then((results) => {
          logger.info('Scheduler execution completed', { results });
        })
        .catch((err) => {
          logger.error('Scheduler execution failed', {
            error: err instanceof Error ? err.message : String(err),
          });
        });
    },
    {
      timezone,
    },
  );

  return task;
}
