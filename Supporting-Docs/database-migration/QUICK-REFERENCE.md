# PostgreSQL Migration Quick Reference

## Local Development

```bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Verify it's running
docker compose ps

# 3. Update .env.local
DATABASE_URL=postgresql://ptnextjs:ptnextjs_dev_password@localhost:5432/ptnextjs
USE_POSTGRES=true

# 4. Start app to create schema
npm run dev
# Make a request to trigger schema creation:
curl http://localhost:3000/api/users

# 5. Run migration (dry-run first)
SQLITE_SOURCE_PATH=./data/payload.db npx tsx scripts/migration/sqlite-to-postgres.ts --dry-run

# 6. Run actual migration
SQLITE_SOURCE_PATH=./data/payload.db npx tsx scripts/migration/sqlite-to-postgres.ts

# 7. Verify
docker exec ptnextjs-postgres psql -U ptnextjs -d ptnextjs -c "SELECT COUNT(*) FROM users"
```

## Production VPS

```bash
# 1. Copy files to VPS
scp docker-compose.production.example.yml user@vps:/path/docker-compose.yml
scp .env.production.example user@vps:/path/.env
scp -r scripts/migration user@vps:/path/scripts/

# 2. On VPS: Configure .env
DATABASE_URL=postgresql://ptnextjs:SECURE_PASSWORD@postgres:5432/ptnextjs
USE_POSTGRES=true
POSTGRES_PASSWORD=SECURE_PASSWORD  # openssl rand -hex 32
PAYLOAD_SECRET=YOUR_SECRET         # openssl rand -hex 32

# 3. Start PostgreSQL
docker compose up -d postgres

# 4. Copy SQLite database to VPS
scp data/payload.db user@vps:/path/data/

# 5. Create schema (start app briefly)
docker compose up app
# Wait for ready, then Ctrl+C

# 6. Run migration
SQLITE_SOURCE_PATH=./data/payload.db npx tsx scripts/migration/sqlite-to-postgres.ts

# 7. Start full stack
docker compose up -d
```

## Switch Back to SQLite

```bash
# .env.local
DATABASE_URL=file:./data/payload.db
USE_POSTGRES=false
```

## Docker Commands

```bash
# Start PostgreSQL only
docker compose up -d postgres

# Start with pgAdmin UI (port 5050)
docker compose --profile tools up -d

# View logs
docker compose logs -f postgres

# Connect to PostgreSQL
docker exec -it ptnextjs-postgres psql -U ptnextjs -d ptnextjs

# Check table counts
docker exec ptnextjs-postgres psql -U ptnextjs -d ptnextjs -c "\dt"

# Stop everything
docker compose down

# Stop and DELETE data (caution!)
docker compose down -v
```

## Migration Script Options

```bash
# Preview only
npx tsx scripts/migration/sqlite-to-postgres.ts --dry-run

# Verbose output
npx tsx scripts/migration/sqlite-to-postgres.ts --verbose

# Custom source/target
SQLITE_SOURCE_PATH=/custom/path.db \
POSTGRES_TARGET_URL=postgresql://user:pass@host:5432/db \
npx tsx scripts/migration/sqlite-to-postgres.ts
```

## Backup PostgreSQL

```bash
# Create backup
docker exec ptnextjs-postgres pg_dump -U ptnextjs -d ptnextjs -Fc > backup.dump

# Restore backup
docker exec -i ptnextjs-postgres pg_restore -U ptnextjs -d ptnextjs < backup.dump
```

## Production Schema Synchronization

When you add new fields to Payload collections (e.g., `featured` boolean on Products), the schema needs to sync to production PostgreSQL.

**How it works:**
1. `docker-entrypoint.sh` runs `sync-postgres-schema.js` before starting the app
2. This script initializes Payload CMS which triggers Drizzle's `push` mode
3. New columns are automatically added to the database
4. Then the Next.js server starts

**Manual schema sync (if needed):**
```bash
# Add a column manually
docker exec -it ptnextjs-postgres psql -U ptnextjs -d ptnextjs -c \
  "ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;"

# Check if column exists
docker exec ptnextjs-postgres psql -U ptnextjs -d ptnextjs -c \
  "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products';"
```

**Force schema resync:**
```bash
# Restart the app container to trigger schema sync
docker compose --env-file .env.production restart app

# Check container logs for sync status
docker compose --env-file .env.production logs app | grep -i "schema"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No tables in PostgreSQL | Start app first: `npm run dev` then make API request |
| Connection refused | Check: `docker compose ps` and `docker compose logs postgres` |
| Auth failed | Verify DATABASE_URL matches POSTGRES_PASSWORD in compose |
| Duplicate ID errors | Reset sequences in PostgreSQL |
| New field not in production | Restart app container or manually add column (see above) |
| Schema sync fails on startup | Check logs: `docker logs ptnextjs-app`, verify DB connectivity |

## Files Reference

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Local dev PostgreSQL |
| `docker-compose.production.example.yml` | Production template |
| `scripts/migration/sqlite-to-postgres.ts` | SQLite to PostgreSQL data migration |
| `scripts/sync-postgres-schema.js` | Runtime schema sync for Docker deployments |
| `scripts/docker-entrypoint.sh` | Container startup script (runs schema sync) |
| `.env.local` | Local environment (set USE_POSTGRES) |
| `payload.config.ts` | Database adapter config (push: true enables auto-sync) |
