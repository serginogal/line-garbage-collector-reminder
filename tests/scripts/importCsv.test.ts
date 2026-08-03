import { describe, it, expect, afterEach } from 'vitest';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getDb, closeDb } from '@/database/db';
import { importCsv, parseCsv } from '@/scripts/importCsv';

const TEST_DIR = join(import.meta.dirname, '..', '__test_tmp__');
const TEST_CSV = join(TEST_DIR, 'test.csv');

function writeCsv(content: string): void {
  mkdirSync(TEST_DIR, { recursive: true });
  writeFileSync(TEST_CSV, content);
}

afterEach(() => {
  closeDb();
  try {
    unlinkSync(TEST_CSV);
  } catch {
    // ignore
  }
});

describe('parseCsv', () => {
  it('parses valid CSV rows', () => {
    writeCsv(`date,area,category
2026-04-01,下連雀1・2・3・4・5丁目,燃やせないごみ
2026-04-02,下連雀1・2・3・4・5丁目,燃やせるごみ`);

    const rows = parseCsv(TEST_CSV);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      date: '2026-04-01',
      area: '下連雀1・2・3・4・5丁目',
      category: '燃やせないごみ',
    });
  });

  it('rejects rows with invalid date format', () => {
    writeCsv(`date,area,category
04/01/2026,下連雀1・2・3・4・5丁目,燃やせないごみ`);

    const rows = parseCsv(TEST_CSV);
    expect(rows).toHaveLength(0);
  });

  it('handles empty CSV (header only)', () => {
    writeCsv(`date,area,category`);

    const rows = parseCsv(TEST_CSV);
    expect(rows).toHaveLength(0);
  });
});

describe('importCsv', () => {
  it('imports valid CSV into database', () => {
    writeCsv(`date,area,category
2026-04-01,下連雀1・2・3・4・5丁目,燃やせないごみ
2026-04-02,下連雀1・2・3・4・5丁目,燃やせるごみ`);

    const result = importCsv(TEST_CSV);
    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.total).toBe(2);

    const db = getDb();
    const areas = db.prepare('SELECT * FROM areas').all();
    expect(areas).toHaveLength(1);

    const schedules = db.prepare('SELECT * FROM garbage_schedule').all();
    expect(schedules).toHaveLength(2);
  });

  it('skips duplicate rows (idempotent)', () => {
    writeCsv(`date,area,category
2026-04-01,下連雀1・2・3・4・5丁目,燃やせないごみ`);

    importCsv(TEST_CSV);
    const result = importCsv(TEST_CSV);

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(1);

    const db = getDb();
    const schedules = db.prepare('SELECT * FROM garbage_schedule').all();
    expect(schedules).toHaveLength(1);
  });

  it('creates areas automatically', () => {
    writeCsv(`date,area,category
2026-04-01,下連雀1・2・3・4・5丁目,燃やせないごみ
2026-04-01,上連雀1丁目,燃やせるごみ`);

    importCsv(TEST_CSV);

    const db = getDb();
    const areas = db.prepare('SELECT name FROM areas ORDER BY name').all() as { name: string }[];
    expect(areas).toHaveLength(2);
    expect(areas.map((a) => a.name)).toEqual(['上連雀1丁目', '下連雀1・2・3・4・5丁目']);
  });

  it('handles empty CSV without errors', () => {
    writeCsv(`date,area,category`);

    const result = importCsv(TEST_CSV);
    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.total).toBe(0);
  });
});
