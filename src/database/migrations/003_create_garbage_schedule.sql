CREATE TABLE IF NOT EXISTS garbage_schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  FOREIGN KEY (area_id) REFERENCES areas(id),
  UNIQUE(area_id, date, category)
);
