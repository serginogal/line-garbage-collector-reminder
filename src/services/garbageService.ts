import { getDb } from '@/database/db';

interface GarbageSchedule {
  id: number;
  area_id: number;
  date: string;
  category: string;
}

export function findGarbageByArea(areaId: number, date: string): GarbageSchedule[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM garbage_schedule WHERE area_id = ? AND date = ?')
    .all(areaId, date) as GarbageSchedule[];
}

export function findAreaIdsWithCollection(date: string): number[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT DISTINCT area_id FROM garbage_schedule WHERE date = ?')
    .all(date) as { area_id: number }[];
  return rows.map((r) => r.area_id);
}
