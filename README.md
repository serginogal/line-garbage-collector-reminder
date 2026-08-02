# Japan Garbage Bot

LINE Messaging API bot that reminds users about garbage collection in Japan.

## Features

- **Per-user notification times** — each user can set their own reminder time (default: 20:00)
- **Tomorrow's reminders** — sends tomorrow's garbage schedule so users have time to prepare
- **Multiple categories** — groups all garbage types for the day into a single message
- **Auto unsubscribe** — blocking the bot automatically stops notifications
- **CSV import** — idempotent import with Zod validation
- **Admin controls** — global default send time, restricted to admin user
- **Structured logging** — JSON logs with request, scheduler, and notification details

## Environment Variables

| Variable                    | Required | Description                     | Default                 |
| --------------------------- | -------- | ------------------------------- | ----------------------- |
| `LINE_CHANNEL_SECRET`       | Yes      | LINE channel secret             | —                       |
| `LINE_CHANNEL_ACCESS_TOKEN` | Yes      | LINE channel access token       | —                       |
| `ADMIN_LINE_USER_ID`        | No       | LINE user ID for admin commands | —                       |
| `DATABASE_PATH`             | No       | SQLite database path            | `./data/garbage-bot.db` |
| `TIMEZONE`                  | No       | Timezone for scheduler          | `Asia/Tokyo`            |
| `PORT`                      | No       | HTTP server port                | `3000`                  |

> **Note:** The default notification time (20:00) is stored in the database `settings` table, not in environment variables. Use `/set-global-time` to change it.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your LINE credentials
```

### 3. Import Garbage Schedule

Create a CSV file with the following format:

```csv
date,area,category
2026-04-01,下連雀2丁目,燃やせないごみ
2026-04-02,下連雀2丁目,燃やせるごみ
2026-04-03,下連雀2丁目,古紙・古着
2026-04-03,下連雀2丁目,空きびん・缶
```

Import the CSV:

```bash
npm run import path/to/schedule.csv
```

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

> Database migrations run automatically on startup.

## Available Commands

| Command                  | Description                     | Example                  |
| ------------------------ | ------------------------------- | ------------------------ |
| `/help`                  | Show available commands         |                          |
| `/status`                | Show current settings           |                          |
| `/subscribe`             | Enable notifications            |                          |
| `/unsubscribe`           | Disable notifications           |                          |
| `/set-time HH:00`        | Set personal notification time  | `/set-time 07:00`        |
| `/set-time default`      | Reset to global default time    |                          |
| `/set-global-time HH:00` | Set global default (admin only) | `/set-global-time 07:00` |

## Scheduler

The bot runs a cron job every hour (`0 * * * *` in Asia/Tokyo timezone). At each hour it:

1. Finds all subscribed users whose `send_time` matches the current hour
2. Users without a personal time use the global default (20:00)
3. Checks if there's garbage collection tomorrow for the user's area
4. Sends a reminder with tomorrow's categories (deduplicated per user per day)
5. Users are batched (500 per multicast call) to respect LINE API limits

## CSV Format

| Column     | Format       | Description                   |
| ---------- | ------------ | ----------------------------- |
| `date`     | `YYYY-MM-DD` | Collection date               |
| `area`     | string       | Area name (e.g., 下連雀2丁目) |
| `category` | string       | Garbage type                  |

**Known categories:**

- 燃やせるごみ (Burnable)
- 燃やせないごみ (Non-burnable)
- プラスチック・有害ごみ (Plastic/Hazardous)
- 古紙・古着 (Paper/Clothing)
- 空きびん・缶 (Bottles/Cans)
- ペットボトル (PET bottles)

The import is idempotent — duplicate records are automatically skipped.

## Database

The bot uses SQLite (better-sqlite3) with WAL mode. Migrations run automatically on startup.

| Migration | Description                              |
| --------- | ---------------------------------------- |
| 001       | Areas table (default: 下連雀2丁目)       |
| 002       | Users table with area foreign key        |
| 003       | Garbage schedule with unique constraint  |
| 004       | Notification logs (initially area-based) |
| 005       | Settings table + user `send_time` column |
| 006       | Notification logs rebuilt per-user       |

## API Endpoints

| Method | Path       | Description           |
| ------ | ---------- | --------------------- |
| `GET`  | `/health`  | Health check          |
| `POST` | `/webhook` | LINE webhook endpoint |

All requests are logged with method, path, status code, and response time.

## Project Structure

```
src/
  config/
    env.ts              # Environment validation (Zod)
  database/
    db.ts               # SQLite connection (WAL, foreign keys)
    migrations/         # SQL migration files (001-006)
  lib/
    logger.ts           # Structured JSON logging
  line/
    client.ts           # LINE MessagingApiClient
    commands/
      index.ts          # Command router (exact + prefix)
      help.ts           # /help
      status.ts         # /status
      subscribe.ts      # /subscribe
      unsubscribe.ts    # /unsubscribe
      setTime.ts        # /set-time, /set-global-time
    webhook.ts          # Webhook event handler
  scheduler/
    garbageReminder.ts  # Hourly cron scheduler
  scripts/
    importCsv.ts        # CSV import script
    migrate.ts          # Migration runner
  services/
    garbageService.ts   # Schedule queries
    notificationService.ts  # Reminder orchestration
    settingsService.ts  # Settings table CRUD
    userService.ts      # User management
  index.ts              # Hono server, startup, shutdown
tests/
  setup.ts              # Test env (in-memory SQLite)
  services/             # Service tests
  scripts/              # Script tests
```

## Development

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
npm run format:check
```

### Testing

```bash
npm run test        # watch mode
npm run test:run    # single run
```

## License

MIT
