CREATE TABLE IF NOT EXISTS notification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (area_id) REFERENCES areas(id),
  UNIQUE(area_id, date)
);
