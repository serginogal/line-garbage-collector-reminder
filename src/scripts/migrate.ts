import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { getDb } from '@/database/db';
import { logger } from '@/lib/logger';

function ensureMigrationsTable(db: ReturnType<typeof getDb>): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

function getAppliedMigrations(db: ReturnType<typeof getDb>): Set<string> {
  const rows = db.prepare('SELECT name FROM _migrations').all() as { name: string }[];
  return new Set(rows.map((r) => r.name));
}

function getMigrationFiles(): string[] {
  const migrationsDir = join(process.cwd(), 'src', 'database', 'migrations');
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

export function migrate(): void {
  const db = getDb();
  ensureMigrationsTable(db);
  const applied = getAppliedMigrations(db);
  const files = getMigrationFiles();

  const pending = files.filter((f) => !applied.has(f));
  if (pending.length === 0) {
    logger.info('No pending migrations');
    return;
  }

  const runMigration = db.transaction(() => {
    for (const file of pending) {
      const sql = readFileSync(join(process.cwd(), 'src', 'database', 'migrations', file), 'utf-8');
      db.exec(sql);
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
      logger.info('Applied migration', { name: file });
    }
  });

  runMigration();
  logger.info('All migrations applied', { count: pending.length });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
}
