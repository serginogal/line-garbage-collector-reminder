import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import type { ServerType } from '@hono/node-server';
import { env } from '@/config/env';
import { getDb, closeDb } from '@/database/db';
import { handleWebhook } from '@/line/webhook';
import { startScheduler } from '@/scheduler/garbageReminder';
import { logger } from '@/lib/logger';
import { migrate } from '@/scripts/migrate';

const app = new Hono();

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app.post('/webhook', async (c) => {
  const body = await c.req.json();
  await handleWebhook(body.events);
  return c.json({ message: 'ok' });
});

function main(): void {
  logger.info('Starting application', {
    port: env.PORT,
    sendTime: env.SEND_TIME,
    timezone: env.TIMEZONE,
  });

  migrate();
  getDb();

  startScheduler();

  const server: ServerType = serve(
    {
      fetch: app.fetch,
      port: env.PORT,
    },
    (info) => {
      logger.info('Server started', { port: info.port });
    },
  );

  const shutdown = (): void => {
    logger.info('Shutting down...');
    server.close(() => {
      closeDb();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main();
