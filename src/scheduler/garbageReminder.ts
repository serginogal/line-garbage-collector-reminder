import cron from 'node-cron';
import { env } from '@/config/env';
import { lineClient } from '@/line/client';
import { sendReminders } from '@/services/notificationService';
import { logger } from '@/lib/logger';

async function sendMulticast(userIds: string[], message: string): Promise<number> {
  await lineClient.multicast({
    to: userIds,
    messages: [{ type: 'text', text: message }],
  });
  return userIds.length;
}

export function startScheduler(): cron.ScheduledTask {
  const [hour, minute] = env.SEND_TIME.split(':');
  const cronExpression = `${minute} ${hour} * * *`;

  logger.info('Starting scheduler', {
    cron: cronExpression,
    timezone: env.TIMEZONE,
    sendTime: env.SEND_TIME,
  });

  const task = cron.schedule(
    cronExpression,
    () => {
      logger.info('Scheduler execution started');
      sendReminders(sendMulticast)
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
      timezone: env.TIMEZONE,
    },
  );

  return task;
}
