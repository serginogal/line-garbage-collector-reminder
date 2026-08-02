import { getDb } from '@/database/db';
import { logger } from '@/lib/logger';
import { findSubscribedForHour } from './userService';
import { findGarbageByArea } from './garbageService';

const MULTICAST_BATCH_SIZE = 500;

export function hasNotified(userId: number, date: string): boolean {
  const db = getDb();
  const row = db
    .prepare('SELECT id FROM notification_logs WHERE user_id = ? AND date = ?')
    .get(userId, date);
  return !!row;
}

export function markNotified(userId: number, date: string): void {
  const db = getDb();
  db.prepare('INSERT OR IGNORE INTO notification_logs (user_id, date) VALUES (?, ?)').run(
    userId,
    date,
  );
}

export function buildReminderMessage(categories: string[]): string {
  if (categories.length === 1) {
    return `🗑️ 明日のごみ収集\n\n${categories[0]}\n\n⏰ 朝8時までに出してください`;
  }

  const list = categories.map((c) => `- ${c}`).join('\n');
  return `🗑️ 明日のごみ収集\n\n${list}\n\n⏰ 朝8時までに出してください`;
}

export function getTomorrowString(): string {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export interface NotificationResult {
  areaId: number;
  areaName: string;
  sent: number;
  errors: number;
}

export async function sendReminders(
  sendFn: (userIds: string[], message: string) => Promise<number>,
  currentHour: string,
  globalDefault: string,
): Promise<NotificationResult[]> {
  const tomorrow = getTomorrowString();
  const results: NotificationResult[] = [];

  const users = findSubscribedForHour(currentHour, globalDefault);

  const byArea = new Map<number, typeof users>();
  for (const user of users) {
    const list = byArea.get(user.area_id) ?? [];
    list.push(user);
    byArea.set(user.area_id, list);
  }

  for (const [areaId, areaUsers] of byArea) {
    const schedules = findGarbageByArea(areaId, tomorrow);
    if (schedules.length === 0) continue;

    const categories = [...new Set(schedules.map((s) => s.category))];
    const message = buildReminderMessage(categories);

    const notNotified = areaUsers.filter((u) => !hasNotified(u.id, tomorrow));
    if (notNotified.length === 0) {
      logger.info('All users in area already notified tomorrow', { areaId, date: tomorrow });
      continue;
    }

    const userIds = notNotified.map((u) => u.line_user_id);

    let sent = 0;
    let errors = 0;

    const batches = chunk(userIds, MULTICAST_BATCH_SIZE);
    for (const batch of batches) {
      try {
        const result = await sendFn(batch, message);
        sent += result;
        errors += batch.length - result;
      } catch (_err) {
        errors += batch.length;
        logger.error('Multicast batch failed', { areaId, batchSize: batch.length });
      }
    }

    for (const user of notNotified) {
      markNotified(user.id, tomorrow);
    }

    const areaName = areaUsers[0]?.area_name ?? 'Unknown';
    results.push({ areaId, areaName, sent, errors });

    logger.info('Notifications sent for area', {
      areaId,
      areaName,
      date: tomorrow,
      sent,
      errors,
    });
  }

  return results;
}
