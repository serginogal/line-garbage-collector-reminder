import cron from 'node-cron';
import { lineClient } from '@/line/client';
import { sendReminders } from '@/services/notificationService';
import { getGlobalSendTime } from '@/services/settingsService';
import { createReminderFlex } from '@/line/flexMessages';
import { logger } from '@/lib/logger';
import { env } from '@/config/env';

async function sendMulticast(userIds: string[], categories: string[]): Promise<number> {
  await lineClient.multicast({
    to: userIds,
    messages: [createReminderFlex(categories)],
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
      const currentHour = `${new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        hour12: false,
        timeZone: env.TIMEZONE,
      }).format(now)}:00`;
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
