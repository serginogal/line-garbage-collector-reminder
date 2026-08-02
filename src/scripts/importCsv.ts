import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { getDb } from '@/database/db';
import { logger } from '@/lib/logger';
import { migrate } from './migrate';

const csvRowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  area: z.string().min(1, 'Area is required'),
  category: z.string().min(1, 'Category is required'),
});

type CsvRow = z.infer<typeof csvRowSchema>;

export function parseCsv(filePath: string): CsvRow[] {
  const content = readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const validated: CsvRow[] = [];
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < records.length; i++) {
    const result = csvRowSchema.safeParse(records[i]);
    if (result.success) {
      validated.push(result.data);
    } else {
      errors.push({
        row: i + 2,
        message: result.error.issues.map((e) => e.message).join(', '),
      });
    }
  }

  if (errors.length > 0) {
    logger.warn('CSV validation errors', { errors });
  }

  return validated;
}

export function findOrCreateArea(db: ReturnType<typeof getDb>, name: string): number {
  const existing = db.prepare('SELECT id FROM areas WHERE name = ?').get(name) as
    { id: number } | undefined;
  if (existing) return existing.id;

  const result = db.prepare('INSERT INTO areas (name) VALUES (?)').run(name);
  return Number(result.lastInsertRowid);
}

export interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
}

export function importCsv(filePath: string): ImportResult {
  migrate();

  const db = getDb();
  const rows = parseCsv(filePath);

  let imported = 0;
  let skipped = 0;

  const importRows = db.transaction(() => {
    for (const row of rows) {
      const areaId = findOrCreateArea(db, row.area);
      const result = db
        .prepare(
          'INSERT OR IGNORE INTO garbage_schedule (area_id, date, category) VALUES (?, ?, ?)',
        )
        .run(areaId, row.date, row.category);
      if (result.changes > 0) {
        imported++;
      } else {
        skipped++;
      }
    }
  });

  importRows();

  logger.info('CSV import completed', { filePath, imported, skipped, total: rows.length });
  console.log(`Import complete: ${imported} imported, ${skipped} skipped (duplicates)`);

  return { imported, skipped, total: rows.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: npm run import <csv-file>');
    process.exit(1);
  }
  importCsv(filePath);
}
