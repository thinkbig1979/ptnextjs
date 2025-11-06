# UID/GID Mapping Solution for Docker Volumes (Runtime Best Practice)

## Problem Statement

When using non-root users in Docker containers with volume mounts, UID/GID mismatches between host and container cause permission errors:

```
Host System:
  User: docker:docker
  UID:  1005
  GID:  997

Container (default):
  User: nextjs:nodejs
  UID:  1001
  GID:  1001

Result: Files created in volumes are owned by 1001:1001, which may not exist or have permissions on the host system.
```

## Best Practice Solution: Runtime UID/GID Configuration

The industry-standard approach (used by LinuxServer.io, etc.) is to:
1. Pass UID/GID as **runtime environment variables** (`PUID`/`PGID`)
2. Use an **entrypoint script** to create/modify the user at container startup
3. Fix volume ownership before launching the application
4. Drop privileges using `gosu` to run as non-root

### Advantages Over Build-Time Approach

| Aspect | Runtime (Best Practice) | Build-Time ARGs |
|--------|------------------------|-----------------|
| **Flexibility** | Change UID/GID without rebuild | Requires image rebuild |
| **Ease of Use** | Set env var and restart | Rebuild + redeploy |
| **Industry Standard** | ✅ LinuxServer.io pattern | Less common |
| **Permission Fixes** | Automatic via entrypoint | Manual |
| **Portability** | Same image works everywhere | Different images per host |

## Implementation

### Step 1: Create Entrypoint Script

**Create `docker/entrypoint.sh`**:

```bash
#!/bin/sh
set -e

# Default to UID/GID 1000 if not specified
PUID=${PUID:-1000}
PGID=${PGID:-1000}

echo "🔧 Starting with PUID=$PUID, PGID=$PGID"

# Get current UID/GID of the nextjs user
CURRENT_UID=$(id -u nextjs 2>/dev/null || echo 1001)
CURRENT_GID=$(id -g nextjs 2>/dev/null || echo 1001)

# Only modify if different from current
if [ "$PUID" != "$CURRENT_UID" ] || [ "$PGID" != "$CURRENT_GID" ]; then
  echo "📝 Modifying nextjs user to PUID=$PUID, PGID=$PGID"

  # Modify group
  if [ "$PGID" != "$CURRENT_GID" ]; then
    if getent group $PGID >/dev/null 2>&1; then
      # Group with this GID already exists, use it
      GROUP_NAME=$(getent group $PGID | cut -d: -f1)
      echo "   Using existing group: $GROUP_NAME ($PGID)"
    else
      # Modify the nodejs group to have the desired GID
      groupmod -g $PGID nodejs
      GROUP_NAME=nodejs
      echo "   Modified nodejs group to GID $PGID"
    fi
  else
    GROUP_NAME=nodejs
  fi

  # Modify user
  if [ "$PUID" != "$CURRENT_UID" ]; then
    usermod -u $PUID -g $GROUP_NAME nextjs
    echo "   Modified nextjs user to UID $PUID, GID $PGID"
  fi
else
  echo "✅ User already configured with correct UID/GID"
fi

# Fix ownership on critical directories
echo "🔧 Fixing volume ownership..."
chown -R nextjs:$(id -gn nextjs) /data /app/public/media 2>/dev/null || true
echo "✅ Ownership fixed"

# Display final user info
echo "👤 Running as: $(id nextjs)"

# Drop privileges and run the application as nextjs user
echo "🚀 Starting application..."
exec gosu nextjs "$@"
```

**Key Features**:
- Accepts `PUID` and `PGID` environment variables
- Creates or modifies user/group to match host IDs
- Fixes ownership on volume mount points
- Uses `gosu` to drop privileges and run as non-root
- Idempotent (safe to run multiple times)

### Step 2: Updated Dockerfile

**Update `docker/Dockerfile`**:

```dockerfile
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

# Install gosu for privilege dropping
RUN apk add --no-cache gosu

# Create default non-root user (will be modified at runtime)
RUN addgroup -g 1000 nodejs && \
    adduser -u 1000 -G nodejs -s /bin/sh -D nextjs

# Copy application files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create directories for volumes (ownership will be fixed at runtime)
RUN mkdir -p /data /app/public/media

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Default command (passed to entrypoint)
CMD ["node", "server.js"]
```

**Key Changes**:
- Install `gosu` for privilege dropping
- Create default user (1000:1000) that will be modified at runtime
- Copy entrypoint script and make executable
- Set `ENTRYPOINT` to the script
- `CMD` becomes argument to entrypoint

### Step 3: Updated docker-compose.yml

**Update `docker/docker-compose.yml`**:

```yaml
version: '3.8'

services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
      # No build args needed - all runtime configuration

    container_name: ptnextjs-app
    restart: unless-stopped

    # Environment
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
      - PORT=3000
      # Runtime UID/GID configuration
      - PUID=${PUID:-1000}
      - PGID=${PGID:-1000}

    # Networking
    networks:
      - proxy
    expose:
      - "3000"

    # Volumes
    volumes:
      - payload-db:/data
      - media-uploads:/app/public/media

    # Health check
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

    # Logging
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  proxy:
    external: true
    name: proxy

volumes:
  payload-db:
    name: ptnextjs-db
  media-uploads:
    name: ptnextjs-media
```

**Key Changes**:
- No `args:` section (no build-time configuration)
- Pass `PUID` and `PGID` as runtime environment variables
- Default to 1000:1000 if not set

### Step 4: Updated .env.production

**Update `docker/.env.production.example`**:

```bash
# ============================================
# USER PERMISSIONS (Runtime UID/GID Configuration)
# ============================================
# Set these to match your host system user who will access volumes
# Find your UID: id -u
# Find your GID: id -g
# Defaults to 1000:1000 if not specified
PUID=1005
PGID=997

# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URI=file:///data/payload.db

# ============================================
# PAYLOAD CMS CONFIGURATION
# ============================================
PAYLOAD_SECRET=<generate-with-openssl-rand-hex-32>
PAYLOAD_CONFIG_PATH=/app/payload.config.ts

# ============================================
# APPLICATION CONFIGURATION
# ============================================
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com

# ============================================
# NEXT.JS CONFIGURATION
# ============================================
NEXT_TELEMETRY_DISABLED=1

# ============================================
# EMAIL CONFIGURATION (Optional)
# ============================================
# SENDGRID_API_KEY=your-key-here
# EMAIL_FROM=noreply@yourdomain.com
```

**⚠️ CRITICAL: UID/GID Configuration**

Before first deployment, set `PUID` and `PGID` to match your host system:

```bash
# Find your host UID/GID
id -u  # Example output: 1005
id -g  # Example output: 997

# Set in .env.production
PUID=1005
PGID=997
```

### Step 5: Updated Deployment Script

**Update `scripts/deploy.sh`**:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying ptnextjs application..."

# Ensure proxy network exists
if ! docker network ls | grep -q "proxy"; then
  echo "📡 Creating proxy network..."
  docker network create proxy
fi

# Validate environment file
if [ ! -f docker/.env.production ]; then
  echo "❌ ERROR: docker/.env.production not found"
  echo "   Copy .env.production.example and configure it"
  exit 1
fi

# Check if PUID/PGID are set
if ! grep -q "^PUID=" docker/.env.production; then
  echo "⚠️  WARNING: PUID not set in .env.production"
  echo "   Defaulting to 1000:1000"
  echo "   To fix: Run 'id -u' and 'id -g', then set PUID and PGID"
fi

# Build images (no --no-cache needed for env var changes)
echo "🔨 Building Docker images..."
cd docker
docker-compose build

# Start services
echo "▶️  Starting services..."
docker-compose up -d

# Wait for startup and show entrypoint output
echo "⏳ Container starting (watch for PUID/PGID configuration)..."
sleep 5
docker-compose logs app | tail -20

# Wait for health check
echo "⏳ Waiting for application to become healthy..."
timeout 60 sh -c 'until docker ps | grep ptnextjs-app | grep -q "healthy"; do sleep 2; done' || {
  echo "❌ Health check failed after 60s"
  docker-compose logs --tail=50 app
  exit 1
}

# Verify volume permissions
echo "🔍 Verifying volume permissions..."
docker exec ptnextjs-app ls -la /data
docker exec ptnextjs-app ls -la /app/public/media

# Show final user
echo "👤 Application running as:"
docker exec ptnextjs-app id nextjs

echo "✅ Deployment complete!"
echo "📊 Check status: cd docker && docker-compose ps"
echo "📋 View logs: cd docker && docker-compose logs -f app"
```

## How It Works

### Container Startup Flow

1. **Container starts** → Entrypoint script runs
2. **Entrypoint reads** `PUID` and `PGID` environment variables
3. **User modification**:
   - If PUID/PGID differ from current, modify nextjs user
   - Create group with PGID if needed
   - Update user to have PUID and belong to PGID group
4. **Fix ownership**:
   - `chown -R nextjs:nodejs /data /app/public/media`
   - Ensures volumes are accessible
5. **Drop privileges**:
   - `exec gosu nextjs node server.js`
   - Application runs as non-root nextjs user
6. **Application starts** with correct permissions

### Runtime Flexibility

**Change UID/GID without rebuild**:
```bash
# Update .env.production
PUID=2000
PGID=2000

# Just restart (no rebuild needed)
docker-compose restart

# Entrypoint automatically reconfigures user
```

**Different environments with same image**:
```bash
# Development (your user)
PUID=1000
PGID=1000

# Production (service account)
PUID=1005
PGID=997

# Same Docker image works for both!
```

## Verification

### Test 1: Check Container User Was Modified

```bash
# View entrypoint logs
docker-compose logs app | grep -A 5 "Starting with PUID"

# Should show:
# 🔧 Starting with PUID=1005, PGID=997
# 📝 Modifying nextjs user to PUID=1005, PGID=997
# ...
# 👤 Running as: uid=1005(nextjs) gid=997(nodejs)
```

### Test 2: Verify User IDs Inside Container

```bash
# Check user IDs
docker exec ptnextjs-app id nextjs
# Output: uid=1005(nextjs) gid=997(nodejs)

# Check running process
docker exec ptnextjs-app ps aux | grep node
# Should show process owned by nextjs (1005)
```

### Test 3: Verify Volume Ownership

```bash
# Check ownership inside container
docker exec ptnextjs-app ls -ln /data
# Should show files owned by 1005:997

docker exec ptnextjs-app ls -ln /app/public/media
# Should show files owned by 1005:997

# Check from host perspective
docker run --rm -v ptnextjs-db:/data alpine ls -ln /data
# Should show same UID/GID (1005:997)
```

### Test 4: Create File and Verify Access from Host

```bash
# Create file from inside container
docker exec ptnextjs-app touch /data/test.db

# Verify you can access from host (if you're UID 1005)
# This would be done by mounting volume to a temporary container with your UID
docker run --rm -v ptnextjs-db:/data -u $(id -u):$(id -g) alpine ls -la /data
# You should have access to all files
```

## Common Scenarios

### Scenario 1: Ubuntu/Debian VPS with User 'deploy'

```bash
# On host
id -u deploy  # Output: 1000
id -g deploy  # Output: 1000

# In docker/.env.production
PUID=1000
PGID=1000

# Deploy
./deploy.sh

# No rebuild needed to change later
```

### Scenario 2: Running as Docker Group Member

```bash
# On host
id -u docker  # Output: 1005
id -g docker  # Output: 997

# In docker/.env.production
PUID=1005
PGID=997

# Deploy
./deploy.sh
```

### Scenario 3: Multiple Environments with Same Image

```bash
# Build once
docker-compose build

# Push to registry
docker tag ptnextjs-app:latest myregistry.com/ptnextjs:latest
docker push myregistry.com/ptnextjs:latest

# Deploy to different environments with different PUID/PGID
# Dev server: PUID=1000, PGID=1000
# Prod server: PUID=1005, PGID=997
# Same image, different runtime config!
```

### Scenario 4: Change UID/GID on Existing Deployment

```bash
# Update .env.production
PUID=2000
PGID=2000

# Just restart (entrypoint fixes everything)
cd docker
docker-compose restart

# Verify
docker-compose logs app | grep "Starting with PUID"
docker exec ptnextjs-app id nextjs
```

## Troubleshooting

### Issue: Permission Denied After Changing PUID/PGID

**Symptom**: Application can't access /data or /app/public/media

**Cause**: Old files still owned by previous UID/GID

**Solution**: Entrypoint script automatically fixes this, but if issues persist:

```bash
# Manual fix: restart container (entrypoint runs chown again)
docker-compose restart app

# Or force ownership fix
docker exec -u root ptnextjs-app chown -R nextjs:nodejs /data /app/public/media

# Then restart to run as non-root
docker-compose restart app
```

### Issue: Entrypoint Script Not Running

**Symptom**: User IDs not changing, still 1000:1000

**Diagnosis**:
```bash
# Check if entrypoint is set
docker inspect ptnextjs-app | grep -A 5 Entrypoint

# Check entrypoint script exists
docker exec ptnextjs-app ls -la /usr/local/bin/entrypoint.sh
```

**Solution**:
```bash
# Rebuild image
docker-compose build --no-cache
docker-compose up -d
```

### Issue: gosu Command Not Found

**Symptom**: `gosu: not found` in logs

**Cause**: gosu not installed in image

**Solution**:
```bash
# Verify Dockerfile has:
# RUN apk add --no-cache gosu

# Rebuild
docker-compose build --no-cache
```

### Issue: Files Created Before PUID/PGID Change Inaccessible

**Symptom**: Old files owned by 1000:1000, new files by 1005:997

**Solution**:
```bash
# Stop container
docker-compose down

# Fix all files in volumes
docker run --rm -v ptnextjs-db:/data alpine chown -R 1005:997 /data
docker run --rm -v ptnextjs-media:/data alpine chown -R 1005:997 /data

# Restart
docker-compose up -d
```

## Advantages Over Build-Time Approach

### Flexibility
- ✅ Change UID/GID with just restart (no rebuild)
- ✅ Same image works in dev, staging, prod with different IDs
- ✅ Easy to test different configurations

### Operational Simplicity
- ✅ No need to rebuild when host user changes
- ✅ Automatic ownership fixing on volume mounts
- ✅ Clear logs showing UID/GID configuration

### Industry Standard
- ✅ Same pattern as LinuxServer.io containers
- ✅ Well-documented, widely understood
- ✅ Works with Docker Swarm, Kubernetes, etc.

### Security
- ✅ Still runs as non-root (gosu drops privileges)
- ✅ Entrypoint runs as root only for user setup, then drops
- ✅ Application process runs as unprivileged user

## Integration with Main Spec

This runtime UID/GID solution should be integrated into:

1. **Dockerfile** - Add gosu, entrypoint script
2. **docker-compose.yml** - Pass PUID/PGID as environment variables
3. **.env.production.example** - Include PUID and PGID
4. **deploy.sh** - Show entrypoint logs, verify user IDs
5. **Technical spec** - Reference this document

## Summary

✅ **Runtime approach** (industry best practice):
- Pass PUID/PGID as environment variables
- Entrypoint script modifies user at startup
- Automatic volume ownership fixing
- No rebuild needed to change IDs
- Same image works everywhere

✅ **Default to 1000:1000**:
- Most common non-root user ID
- Works on most Linux systems
- Override when needed with env vars

✅ **Flexibility**:
- Change UID/GID with `docker-compose restart`
- No image rebuilds required
- Perfect for multi-environment deployments

This runtime configuration approach is the gold standard for Docker containers that need flexible UID/GID mapping while maintaining security through non-root execution.
