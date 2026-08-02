CREATE TABLE notification_logs_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, date)
);

INSERT OR IGNORE INTO notification_logs_new (user_id, date, sent_at)
  SELECT u.id, nl.date, nl.sent_at
  FROM notification_logs nl
  JOIN garbage_schedule gs ON gs.area_id = nl.area_id AND gs.date = nl.date
  JOIN users u ON u.area_id = gs.area_id AND u.subscribed = 1;

DROP TABLE notification_logs;
ALTER TABLE notification_logs_new RENAME TO notification_logs;
