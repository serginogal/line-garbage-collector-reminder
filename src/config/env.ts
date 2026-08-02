import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z.object({
  LINE_CHANNEL_SECRET: z.string().min(1, 'LINE_CHANNEL_SECRET is required'),
  LINE_CHANNEL_ACCESS_TOKEN: z.string().min(1, 'LINE_CHANNEL_ACCESS_TOKEN is required'),
  DATABASE_PATH: z.string().default('./data/garbage-bot.db'),
  SEND_TIME: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'SEND_TIME must be HH:MM format')
    .default('07:00'),
  TIMEZONE: z.string().default('Asia/Tokyo'),
  PORT: z.coerce.number().int().positive().default(3000),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();
