# Mitaka Garbage Bot

LINE Messaging API bot that reminds users about garbage collection in Mitaka City.

## Features

- Daily garbage collection reminders via LINE push messages
- Support for multiple garbage categories
- User subscription management
- CSV import for garbage schedules

## Environment Variables

| Variable                    | Description                 | Default                 |
| --------------------------- | --------------------------- | ----------------------- |
| `LINE_CHANNEL_SECRET`       | LINE channel secret         | Required                |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE channel access token   | Required                |
| `DATABASE_PATH`             | SQLite database path        | `./data/garbage-bot.db` |
| `SEND_TIME`                 | Daily reminder time (HH:MM) | `07:00`                 |
| `TIMEZONE`                  | Timezone for scheduler      | `Asia/Tokyo`            |
| `PORT`                      | HTTP server port            | `3000`                  |

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

### 3. Run Migrations

```bash
npm run migrate
```

### 4. Import Garbage Schedule

Create a CSV file with the following format:

```csv
date,area,category
2026-04-01,下連雀2丁目,燃やせないごみ
2026-04-02,下連雀2丁目,燃やせるごみ
```

Import the CSV:

```bash
npm run import path/to/schedule.csv
```

### 5. Start the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Available Commands

| Command        | Description                               |
| -------------- | ----------------------------------------- |
| `/help`        | Show available commands                   |
| `/status`      | Show current area and subscription status |
| `/subscribe`   | Enable notifications                      |
| `/unsubscribe` | Disable notifications                     |

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
npm run test
npm run test:run
```

## API Endpoints

| Method | Path       | Description           |
| ------ | ---------- | --------------------- |
| `POST` | `/webhook` | LINE webhook endpoint |
| `GET`  | `/health`  | Health check endpoint |

## Project Structure

```
src/
  config/
    env.ts          # Environment configuration
  database/
    db.ts           # Database connection
    migrations/     # SQL migration files
  lib/
    logger.ts       # Structured logging
  line/
    client.ts       # LINE SDK client
    commands/       # Command handlers
    webhook.ts      # Webhook event handler
  scheduler/
    garbageReminder.ts  # Daily reminder scheduler
  services/
    userService.ts      # User management
    garbageService.ts   # Garbage schedule queries
    notificationService.ts  # Notification handling
  scripts/
    importCsv.ts    # CSV import script
    migrate.ts      # Database migration runner
  index.ts          # Application entry point
tests/
  services/         # Service tests
  scripts/          # Script tests
```

## License

MIT
