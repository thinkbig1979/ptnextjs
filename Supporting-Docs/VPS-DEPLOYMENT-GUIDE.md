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
6. **Cache Warmup**: Entrypoint script automatically warms main pages

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

## Cache Warmup

### Automatic (Default)

The Docker entrypoint script automatically warms main pages on container start:

1. Starts Next.js server in background
2. Waits for health check to pass (up to 60 seconds)
3. Pre-fetches: `/`, `/vendors`, `/products`, `/blog`, `/about`, `/contact`
4. Logs progress to container output

**No manual action needed** - this happens automatically on every container start!

### Manual (Optional)

For more comprehensive warming including individual detail pages:

```bash
# From the running container
npm run warmup

# Or from outside with custom base URL
npx tsx scripts/warmup-cache.ts --base-url=https://yourdomain.com
```

This additionally warms individual vendor, product, and blog detail pages.

## Troubleshooting

### Build Fails with "no such column"

**Old behavior**: Build required database access and failed if schema was outdated.

**New behavior**: Build succeeds without database; pages generate on-demand via ISR.

If you still see this error, ensure you have the latest code with the ISR-graceful changes.

### First Page Load is Slow After Deploy

Main pages are automatically warmed on container start. If detail pages are slow:

1. The automatic warmup covers list pages; detail pages warm on first visit
2. For comprehensive warming, run `npm run warmup` from the container
3. Detail pages cache for 60s (vendors) or 5min (products) via ISR

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
- [ ] Container logs show "Cache warmup complete!"
- [ ] Verify new features work correctly

## Environment Variables

### Build-Time vs Runtime Variables

**Critical distinction for Next.js:**
- `NEXT_PUBLIC_*` variables are embedded in the JavaScript bundle **at build time**
- Server-side variables are read **at runtime**

This means if you set `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` after the Docker image is built, it won't work!

### Required Environment Variables

Create a `.env` file (or `.env.production`) in the **same directory as docker-compose.yml**:

```env
# ============================================
# BUILD-TIME VARIABLES (NEXT_PUBLIC_*)
# These MUST be present when running `docker compose build`
# They get baked into the Next.js client bundle
# ============================================
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key

# ============================================
# RUNTIME VARIABLES
# These are read when the container starts
# ============================================
PAYLOAD_SECRET=your-secret-key-minimum-32-characters
DATABASE_URL=file:/data/payload.db

# hCaptcha server-side secret (must match site key above)
HCAPTCHA_SECRET_KEY=your-hcaptcha-secret-key

# Email notifications
RESEND_API_KEY=re_your_api_key
EMAIL_FROM_ADDRESS=notifications@yourdomain.com
ADMIN_EMAIL_ADDRESS=admin@yourdomain.com
```

### Flexible Deployment: Separate Compose and Repo Locations

The docker-compose.yml supports deploying from any location using `BUILD_CONTEXT`:

**Scenario**: docker-compose.yml in `/home/dockge/stacks/ptnext-app/`, repo in `/home/pt/ptnextjs/`

```bash
# Option 1: Set in .env file
BUILD_CONTEXT=/home/pt/ptnextjs

# Option 2: Set inline when building
BUILD_CONTEXT=/home/pt/ptnextjs docker compose build
```

**Default behavior**: If `BUILD_CONTEXT` is not set, it defaults to `.` (same directory as docker-compose.yml).

### How Build Args Work

The docker-compose.yml passes `NEXT_PUBLIC_*` variables to Docker build:

```yaml
build:
  context: ${BUILD_CONTEXT:-.}
  args:
    - NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
    - NEXT_PUBLIC_HCAPTCHA_SITE_KEY=${NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
    # ... etc
```

Docker Compose reads these from:
1. Shell environment variables (highest priority)
2. `.env` file in the docker-compose.yml directory (auto-loaded)
3. `env_file` directive (for runtime only, not build args)

### Verifying Build Args Were Applied

After building, verify the NEXT_PUBLIC vars are in the bundle:

```bash
# Check if hCaptcha site key is in the client bundle
docker exec ptnextjs-app grep -r "your-site-key" .next/static/chunks/ 2>/dev/null

# Check runtime env vars are set
docker exec ptnextjs-app env | grep -i captcha
```

If the grep returns nothing but env shows the var, you need to **rebuild** the image.

## Related Documentation

- [Backfill Migration Guide](./migrations/backfill-profile-submitted-guide.md)
- [Registration Form Simplification](./registration-form-simplification/README.md)
