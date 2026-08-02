import { getDb } from '@/database/db';

export interface User {
  id: number;
  line_user_id: string;
  area_id: number;
  display_name: string | null;
  subscribed: number;
  send_time: string | null;
  created_at: string;
  updated_at: string;
}

interface Area {
  id: number;
  name: string;
}

const DEFAULT_AREA_ID = 1;

export function findOrCreateUser(lineUserId: string, displayName?: string): User {
  const db = getDb();

  const existing = db.prepare('SELECT * FROM users WHERE line_user_id = ?').get(lineUserId) as
    User | undefined;
  if (existing) return existing;

  const result = db
    .prepare(
      'INSERT INTO users (line_user_id, area_id, display_name, subscribed) VALUES (?, ?, ?, 1)',
    )
    .run(lineUserId, DEFAULT_AREA_ID, displayName ?? null);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
}

export function findByLineId(lineUserId: string): User | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE line_user_id = ?').get(lineUserId) as
    User | undefined;
}

export function setSubscribed(lineUserId: string, subscribed: boolean): void {
  const db = getDb();
  db.prepare(
    "UPDATE users SET subscribed = ?, updated_at = datetime('now') WHERE line_user_id = ?",
  ).run(subscribed ? 1 : 0, lineUserId);
}

export function setSendTime(lineUserId: string, sendTime: string | null): void {
  const db = getDb();
  db.prepare(
    "UPDATE users SET send_time = ?, updated_at = datetime('now') WHERE line_user_id = ?",
  ).run(sendTime, lineUserId);
}

export function getArea(areaId: number): Area | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM areas WHERE id = ?').get(areaId) as Area | undefined;
}

export function findSubscribedForHour(
  currentHour: string,
  globalDefault: string,
): (User & { area_name: string })[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT u.*, a.name as area_name
       FROM users u
       JOIN areas a ON u.area_id = a.id
       WHERE u.subscribed = 1
         AND (
           u.send_time = ?
           OR (u.send_time IS NULL AND ? = ?)
         )`,
    )
    .all(currentHour, globalDefault, currentHour) as (User & { area_name: string })[];
}
