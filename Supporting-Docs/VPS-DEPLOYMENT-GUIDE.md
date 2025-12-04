# VPS Deployment Guide

This guide documents the VPS setup and deployment process for the Paul Thames Superyacht Technology platform.

## VPS Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         VPS Server                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────┐    │
│  │   Dockge UI     │    │     Docker Compose Stack    │    │
│  │  (Management)   │    │                             │    │
│  └─────────────────┘    │  ┌───────────────────────┐  │    │
│                         │  │    Next.js + Payload  │  │    │
│                         │  │       Container       │  │    │
│                         │  └───────────────────────┘  │    │
│                         │            │                │    │
│                         │            ▼                │    │
│                         │  ┌───────────────────────┐  │    │
│                         │  │   Mounted Volume      │  │    │
│                         │  │  /data/payload.db     │  │    │
│                         │  └───────────────────────┘  │    │
│                         └─────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Paths

| Component | Path |
|-----------|------|
| Docker Stack | `/home/dockge/stacks/ptnext-app/` |
| Database Volume | `/home/dockge/stacks/ptnext-app/data/payload.db` |
| Git Repo (pulled by Docker) | Pulled from `main` branch on GitHub |

## How Deployment Works

1. **Code Push**: Changes pushed to `main` branch on GitHub
2. **Docker Build**: Dockge triggers `docker compose build`
3. **Static Generation**: Next.js builds pages (ISR handles missing DB gracefully)
4. **Container Start**: New container starts with mounted data volume
5. **Schema Sync**: Payload's `push: true` auto-updates database schema
6. **Cache Warmup**: (Optional) Run warmup script to pre-populate cache

## Database Schema Changes

### Automatic Handling (Recommended)

With the ISR-first approach, **no manual database migration is needed for new fields**:

1. Pages gracefully handle missing DB during build (return empty array)
2. Container starts with the mounted production database
3. Payload's `push: true` automatically adds new columns on first access
4. ISR generates pages on-demand with the updated schema

### Manual Migration (If Needed)

If you need to add a column before deployment:

```bash
# SSH into VPS
ssh user@your-vps

# Backup database
cp /home/dockge/stacks/ptnext-app/data/payload.db \
   /home/dockge/stacks/ptnext-app/data/payload.db.bak

# Add column (example: adding profile_submitted to vendors)
sqlite3 /home/dockge/stacks/ptnext-app/data/payload.db \
  "ALTER TABLE vendors ADD COLUMN profile_submitted INTEGER DEFAULT 0;"

# Verify
sqlite3 /home/dockge/stacks/ptnext-app/data/payload.db \
  "PRAGMA table_info(vendors);" | grep profile_submitted
```

## Post-Deployment Cache Warmup

After deployment, warm the cache to ensure fast page loads for first visitors:

```bash
# From the running container or VPS
npm run warmup

# Or with custom base URL
npx tsx scripts/warmup-cache.ts --base-url=https://yourdomain.com
```

This pre-generates and caches:
- Homepage and main list pages
- Individual vendor, product, and blog pages

## Troubleshooting

### Build Fails with "no such column"

**Old behavior**: Build required database access and failed if schema was outdated.

**New behavior**: Build succeeds without database; pages generate on-demand via ISR.

If you still see this error, ensure you have the latest code with the ISR-graceful changes.

### First Page Load is Slow After Deploy

This is expected for ISR - the first request generates and caches the page. Solutions:

1. Run `npm run warmup` after deployment
2. Add warmup to your deployment script/CI pipeline

### Database is Locked

If you see "database is locked" errors:

```bash
# Stop the container
docker compose stop

# Check for lock files
ls -la /home/dockge/stacks/ptnext-app/data/*.db*

# Remove stale lock files if container is stopped
rm /home/dockge/stacks/ptnext-app/data/*.db-shm
rm /home/dockge/stacks/ptnext-app/data/*.db-wal

# Restart
docker compose up -d
```

### Rollback Database Changes

```bash
# Stop container
docker compose stop

# Restore backup
cp /home/dockge/stacks/ptnext-app/data/payload.db.bak \
   /home/dockge/stacks/ptnext-app/data/payload.db

# Restart
docker compose up -d
```

## Deployment Checklist

- [ ] Code pushed to `main` branch
- [ ] Docker build completes successfully
- [ ] Container starts without errors
- [ ] Health check passes (site loads)
- [ ] (Optional) Run cache warmup
- [ ] Verify new features work correctly

## Environment Variables

Ensure these are set in your Docker environment:

```env
# Required
PAYLOAD_SECRET=your-secret-key-minimum-32-characters
DATABASE_URL=file:/app/data/payload.db

# Email notifications (if using)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM_ADDRESS=notifications@yourdomain.com
ADMIN_EMAIL_ADDRESS=admin@yourdomain.com

# Public URL
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
```

## Related Documentation

- [Backfill Migration Guide](./migrations/backfill-profile-submitted-guide.md)
- [Registration Form Simplification](./registration-form-simplification/README.md)
