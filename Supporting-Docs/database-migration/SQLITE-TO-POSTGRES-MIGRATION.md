# SQLite to PostgreSQL Migration Guide

This guide explains how to migrate the Paul Thames Superyacht Technology platform from SQLite to PostgreSQL.

## Overview

The platform supports both SQLite (for simple development) and PostgreSQL (recommended for production). This guide covers:

1. Local development migration
2. Production VPS migration
3. Troubleshooting

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Access to your SQLite database file
- (For production) VPS with Docker installed

## Local Development Migration

### Step 1: Start PostgreSQL with Docker

```bash
# From project root
docker compose up -d postgres

# Verify PostgreSQL is running
docker compose ps
```

### Step 2: Configure Environment

Edit `.env.local`:

```bash
# PostgreSQL via Docker
DATABASE_URL=postgresql://ptnextjs:ptnextjs_dev_password@localhost:5432/ptnextjs
USE_POSTGRES=true
```

### Step 3: Create PostgreSQL Schema

Start the dev server briefly to create tables:

```bash
npm run dev
# Wait for "Ready" message, then Ctrl+C
# Or make a request: curl http://localhost:3000/api/users
```

### Step 4: Run Migration Script

```bash
# Dry run first to preview
SQLITE_SOURCE_PATH=./data/payload.db npx tsx scripts/migration/sqlite-to-postgres.ts --dry-run

# Run actual migration
SQLITE_SOURCE_PATH=./data/payload.db npx tsx scripts/migration/sqlite-to-postgres.ts
```

### Step 5: Verify Migration

```bash
# Check data in PostgreSQL
docker exec ptnextjs-postgres psql -U ptnextjs -d ptnextjs -c "SELECT COUNT(*) FROM users"

# Start dev server and test
npm run dev
# Visit http://localhost:3000/admin and log in
```

## Production VPS Migration

### Step 1: Prepare VPS

Copy these files to your VPS:

```bash
scp docker-compose.production.example.yml user@vps:/path/to/deployment/docker-compose.yml
scp .env.production.example user@vps:/path/to/deployment/.env
scp scripts/migration/sqlite-to-postgres.ts user@vps:/path/to/deployment/scripts/migration/
```

### Step 2: Configure Production Environment

On your VPS, edit `.env`:

```bash
# Database
DATABASE_URL=postgresql://ptnextjs:YOUR_SECURE_PASSWORD@postgres:5432/ptnextjs
USE_POSTGRES=true
POSTGRES_USER=ptnextjs
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD  # Generate with: openssl rand -hex 32
POSTGRES_DB=ptnextjs
POSTGRES_DATA_PATH=/var/lib/ptnextjs/postgres

# Application
PAYLOAD_SECRET=YOUR_PAYLOAD_SECRET  # Generate with: openssl rand -hex 32
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
```

### Step 3: Start PostgreSQL

```bash
docker compose up -d postgres

# Wait for healthy status
docker compose ps
```

### Step 4: Create Schema

```bash
# Start app once to create schema
docker compose up app
# Wait for tables to be created, then Ctrl+C
```

### Step 5: Copy SQLite Database

```bash
# From your local machine
scp data/payload.db user@vps:/path/to/deployment/data/
```

### Step 6: Run Migration

```bash
# On VPS
SQLITE_SOURCE_PATH=./data/payload.db \
POSTGRES_TARGET_URL=postgresql://ptnextjs:YOUR_PASSWORD@localhost:5432/ptnextjs \
npx tsx scripts/migration/sqlite-to-postgres.ts
```

### Step 7: Start Full Stack

```bash
docker compose up -d
```

## Migration Script Options

```bash
# Dry run (preview only)
npx tsx scripts/migration/sqlite-to-postgres.ts --dry-run

# Verbose output
npx tsx scripts/migration/sqlite-to-postgres.ts --verbose

# Custom paths
SQLITE_SOURCE_PATH=/path/to/source.db \
POSTGRES_TARGET_URL=postgresql://user:pass@host:5432/db \
npx tsx scripts/migration/sqlite-to-postgres.ts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SQLITE_SOURCE_PATH` | Path to source SQLite database | `./data/payload.db` |
| `POSTGRES_TARGET_URL` | PostgreSQL connection string | Uses `DATABASE_URL` |
| `BACKUP_DIR` | Directory for backups | `./backups/migration` |
| `DRY_RUN` | Set to "true" for preview mode | `false` |

## Switching Back to SQLite

If needed, you can switch back to SQLite:

```bash
# .env.local
DATABASE_URL=file:./data/payload.db
USE_POSTGRES=false
```

## Docker Compose Commands

```bash
# Start PostgreSQL only
docker compose up -d postgres

# Start with pgAdmin (database UI)
docker compose --profile tools up -d

# View logs
docker compose logs -f postgres

# Stop all
docker compose down

# Stop and remove data (CAUTION!)
docker compose down -v
```

## Troubleshooting

### "No tables found in PostgreSQL"

The schema hasn't been created yet. Start the app first:

```bash
npm run dev
# Make any API request
curl http://localhost:3000/api/users
```

### "Connection refused"

PostgreSQL isn't running or not healthy:

```bash
docker compose ps
docker compose logs postgres
```

### "Authentication failed"

Check your DATABASE_URL credentials match POSTGRES_USER/POSTGRES_PASSWORD in docker-compose.

### Foreign Key Errors

The migration script disables foreign key checks during migration. If you see FK errors after migration, run:

```bash
docker exec ptnextjs-postgres psql -U ptnextjs -d ptnextjs -c "SET session_replication_role = DEFAULT"
```

### Sequence/ID Issues

If new records get duplicate ID errors, reset sequences:

```sql
-- Connect to PostgreSQL
docker exec -it ptnextjs-postgres psql -U ptnextjs -d ptnextjs

-- Reset a specific sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
```

## Backup & Recovery

### Create Backup

```bash
# PostgreSQL dump
docker exec ptnextjs-postgres pg_dump -U ptnextjs -d ptnextjs -Fc > backup.dump

# Restore from backup
docker exec -i ptnextjs-postgres pg_restore -U ptnextjs -d ptnextjs < backup.dump
```

### Automatic Backups

Enable the backup service in production compose:

```bash
docker compose --profile with-backup up -d
```

Backups are stored in `$BACKUP_PATH` (default: `/var/lib/ptnextjs/backups`).

## File Reference

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Local development PostgreSQL |
| `docker-compose.production.example.yml` | Production VPS template |
| `.env.example` | Environment template with PostgreSQL options |
| `.env.production.example` | Production environment template |
| `scripts/migration/sqlite-to-postgres.ts` | Migration script |
| `payload.config.ts` | Database adapter configuration |
