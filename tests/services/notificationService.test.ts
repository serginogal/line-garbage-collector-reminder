import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDb, closeDb } from '@/database/db';
import { migrate } from '@/scripts/migrate';
import { hasNotified, markNotified, buildReminderMessage } from '@/services/notificationService';

beforeEach(() => {
  migrate();
  const db = getDb();
  db.exec('DELETE FROM notification_logs');
  db.exec('DELETE FROM areas');
  db.prepare('INSERT INTO areas (id, name) VALUES (?, ?)').run(1, '下連雀2丁目');
});

afterEach(() => {
  closeDb();
});

describe('notificationService', () => {
  describe('hasNotified', () => {
    it('returns false when no notification exists', () => {
      expect(hasNotified(1, '2026-04-01')).toBe(false);
    });

    it('returns true after marking as notified', () => {
      markNotified(1, '2026-04-01');
      expect(hasNotified(1, '2026-04-01')).toBe(true);
    });
  });

  describe('markNotified', () => {
    it('creates notification log entry', () => {
      markNotified(1, '2026-04-01');
      expect(hasNotified(1, '2026-04-01')).toBe(true);
    });

    it('does not create duplicate entries', () => {
      markNotified(1, '2026-04-01');
      markNotified(1, '2026-04-01');
      const db = getDb();
      const count = db
        .prepare('SELECT COUNT(*) as count FROM notification_logs WHERE area_id = 1')
        .get() as { count: number };
      expect(count.count).toBe(1);
    });
  });

  describe('buildReminderMessage', () => {
    it('builds message for single category', () => {
      const message = buildReminderMessage(['燃やせるごみ']);
      expect(message).toBe('🗑️ 今日のごみ収集\n\n燃やせるごみ\n\n朝8時までに出してください。');
    });

    it('builds message for multiple categories', () => {
      const message = buildReminderMessage(['古紙・古着', 'ペットボトル']);
      expect(message).toContain('- 古紙・古着');
      expect(message).toContain('- ペットボトル');
    });
  });
});
