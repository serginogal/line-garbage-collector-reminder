import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDb, closeDb } from '@/database/db';
import { migrate } from '@/scripts/migrate';
import { findGarbageByArea } from '@/services/garbageService';

beforeEach(() => {
  migrate();
  const db = getDb();
  db.exec('DELETE FROM garbage_schedule');
  db.exec('DELETE FROM areas');
  db.prepare('INSERT INTO areas (id, name) VALUES (?, ?)').run(1, '下連雀2丁目');
});

afterEach(() => {
  closeDb();
});

describe('garbageService', () => {
  describe('findGarbageByArea', () => {
    it('returns garbage schedule for date', () => {
      const db = getDb();
      db.prepare('INSERT INTO garbage_schedule (area_id, date, category) VALUES (?, ?, ?)').run(
        1,
        '2026-04-01',
        '燃やせないごみ',
      );

      const result = findGarbageByArea(1, '2026-04-01');
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('燃やせないごみ');
    });

    it('returns empty array when no garbage exists', () => {
      const result = findGarbageByArea(1, '2026-04-01');
      expect(result).toHaveLength(0);
    });

    it('returns multiple categories for same day', () => {
      const db = getDb();
      db.prepare('INSERT INTO garbage_schedule (area_id, date, category) VALUES (?, ?, ?)').run(
        1,
        '2026-04-01',
        '古紙・古着',
      );
      db.prepare('INSERT INTO garbage_schedule (area_id, date, category) VALUES (?, ?, ?)').run(
        1,
        '2026-04-01',
        'ペットボトル',
      );

      const result = findGarbageByArea(1, '2026-04-01');
      expect(result).toHaveLength(2);
    });
  });
});
