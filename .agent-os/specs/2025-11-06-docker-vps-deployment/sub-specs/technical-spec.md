# Technical Specification: Docker VPS Deployment

This is the technical specification for the Docker VPS deployment detailed in @.agent-os/specs/2025-11-06-docker-vps-deployment/spec.md

## Technical Overview

This specification defines the Docker infrastructure for deploying a Next.js 15 + Payload CMS 3 application on a VPS using Docker Compose. The architecture uses a single Next.js container with SQLite database persistence, integrates with an external reverse proxy network, and includes deployment automation for production operations.

## Architecture Decisions

### Decision 1: SQLite with Docker Volumes vs PostgreSQL Container

**Context**: Need persistent database storage in containerized environment

**Options Considered**:
1. SQLite with Docker named volumes (selected)
2. PostgreSQL container in the stack
3. External managed database (AWS RDS, DigitalOcean)

**Decision**: Use SQLite with Docker named volumes

**Rationale**:
- Simpler deployment with fewer moving parts
- No database migration required from existing SQLite setup
- Adequate for moderate traffic (current use case)
- Named volumes provide persistence and portability
- Can migrate to PostgreSQL later if needed

**Trade-offs**:
- Limited concurrent write performance compared to PostgreSQL
- Less suitable for high-traffic scenarios (>100 concurrent users)
- Single point of failure (no replication)

**Constraints**:
- Named volume must be backed up regularly
- Database file size should be monitored
- Consider PostgreSQL migration if traffic exceeds 50 concurrent users

### Decision 2: Shared Docker Network vs Host Port Binding

**Context**: Reverse proxy needs to communicate with application container

**Options Considered**:
1. External shared Docker network (selected)
2. Host network binding (app on localhost:PORT)
3. Custom bridge network

**Decision**: Use external shared Docker network named `proxy`

**Rationale**:
- Cleanest isolation between services
- Reverse proxy and app can both be containers
- DNS-based service discovery (app.proxy network)
- No port conflicts on host
- Network-level security boundaries

**Trade-offs**:
- Requires reverse proxy to be on same Docker host
- External network must be created before stack starts
- Slightly more complex initial setup

**Implementation**:
```bash
# Create external proxy network (one-time setup)
docker network create proxy

# App automatically joins this network via docker-compose.yml
```

### Decision 3: Multi-Stage Dockerfile vs Single-Stage

**Context**: Need to optimize Docker image size and build performance

**Options Considered**:
1. Single-stage Dockerfile (simpler)
2. Multi-stage Dockerfile (selected)
3. Pre-built images with external build process

**Decision**: Use multi-stage Dockerfile with separate deps, builder, and runner stages

**Rationale**:
- Dramatically reduces final image size (200MB vs 800MB+)
- Build tools not present in production image (security)
- Better layer caching for faster rebuilds
- Next.js standalone output mode optimized for containers

**Trade-offs**:
- Longer initial build time
- More complex Dockerfile
- Requires understanding of multi-stage builds

**Implementation Strategy**:
```dockerfile
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
```

### Decision 4: Deployment Scripts vs Manual Commands

**Context**: Need repeatable, error-free deployment operations

**Options Considered**:
1. Manual docker-compose commands (high error risk)
2. Makefile for automation
3. Shell scripts (selected)
4. Infrastructure-as-code tool (Ansible, Terraform)

**Decision**: Provide shell scripts for common operations

**Rationale**:
- Shell scripts are universal (no additional dependencies)
- Easy to understand and modify
- Can include validation and error handling
- Covers 90% of operational needs without complexity

**Scripts to Provide**:
- `deploy.sh`: Initial deployment and restarts
- `update.sh`: Pull new image and redeploy
- `stop.sh`: Graceful shutdown
- `backup.sh`: Backup database and media
- `restore.sh`: Restore from backup
- `logs.sh`: View application logs

**Trade-offs**:
- Shell scripts less powerful than Ansible for multi-host
- No declarative state management
- Manual execution required (no CI/CD integration yet)

## File Structure

```
project-root/
├── docker/
│   ├── Dockerfile              # Multi-stage production build
│   ├── entrypoint.sh           # Runtime UID/GID configuration script
│   ├── docker-compose.yml      # Service definitions
│   ├── .env.production.example # Environment template
│   └── .dockerignore           # Build exclusions
├── scripts/
│   ├── deploy.sh               # Deploy/restart application
│   ├── update.sh               # Update to new version
│   ├── stop.sh                 # Graceful shutdown
│   ├── backup.sh               # Backup database + media
│   ├── restore.sh              # Restore from backup
│   └── logs.sh                 # View logs with filtering
├── app/
│   └── api/
│       └── health/
│           └── route.ts        # Health check endpoint
└── docs/
    └── deployment.md           # VPS deployment guide
```

## Docker Compose Configuration

### Service Definition

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
      # Runtime UID/GID configuration (industry best practice)
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

### Network Configuration Details

**External Network Creation** (run once on VPS):
```bash
docker network create proxy
```

**How It Works**:
1. Reverse proxy joins `proxy` network (configured in its docker-compose.yml)
2. Application joins `proxy` network (configured above)
3. Both services can communicate via container names
4. Reverse proxy configuration uses `http://ptnextjs-app:3000` as upstream

**Example Nginx Configuration** (on reverse proxy):
```nginx
upstream ptnextjs {
    server ptnextjs-app:3000;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://ptnextjs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Dockerfile Implementation

### Multi-Stage Build Breakdown

**Stage 1: Dependencies Installation**
```dockerfile
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production --omit=dev

# Store for next stage
```

**Purpose**: Install only production dependencies, cache this layer for faster rebuilds

**Stage 2: Application Build**
```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build Next.js with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build
```

**Purpose**: Build Next.js application with standalone output mode for minimal runtime

**Stage 3: Production Runtime**
```dockerfile
FROM node:22-alpine AS runner

WORKDIR /app

# Install gosu for privilege dropping
RUN apk add --no-cache gosu

# Create default non-root user (will be modified at runtime via entrypoint)
RUN addgroup -g 1000 nodejs && \
    adduser -u 1000 -G nodejs -s /bin/sh -D nextjs

# Copy standalone output
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

# Set entrypoint (runs before CMD)
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Default command (passed as argument to entrypoint)
CMD ["node", "server.js"]
```

**Purpose**: Minimal runtime image with only required files, using runtime UID/GID configuration for maximum flexibility

**UID/GID Mapping**: Uses industry-standard **runtime configuration** via entrypoint script that:
- Accepts `PUID`/`PGID` environment variables at startup
- Modifies container user to match host IDs dynamically
- Fixes volume ownership automatically
- Drops privileges using `gosu` to run as non-root
- No rebuild needed to change IDs

See [uid-gid-mapping.md](./uid-gid-mapping.md) for complete solution with entrypoint script.

### Next.js Configuration for Standalone Output

**next.config.js modifications**:
```javascript
module.exports = {
  output: 'standalone',
  // ... rest of config
}
```

This generates `.next/standalone` directory with:
- Minimal dependencies
- Server entry point (server.js)
- Only required node_modules
- ~200MB total size vs ~800MB full install

## Environment Configuration

### Required Environment Variables

**Create `.env.production`** (never commit to git):

```bash
# ============================================
# USER PERMISSIONS (Runtime UID/GID Configuration)
# ============================================
# Set these to match your host system user who will access volumes
# Find your UID: id -u
# Find your GID: id -g
# Defaults to 1000:1000 if not specified
# Uses industry-standard runtime configuration (LinuxServer.io pattern)
PUID=1005
PGID=997

# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URI=file:///data/payload.db

# ============================================
# PAYLOAD CMS CONFIGURATION
# ============================================
PAYLOAD_SECRET=<generate-random-64-char-hex>
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

This uses the **industry-standard runtime configuration** approach (same as LinuxServer.io containers):
- Entrypoint script modifies user at container startup
- Automatic volume ownership fixing
- No rebuild needed to change IDs
- Same image works across different environments

See [uid-gid-mapping.md](./uid-gid-mapping.md) for complete details including entrypoint script.

### Environment Variable Categories

**Build-Time Variables** (used during `docker build`):
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`

**Runtime Variables** (loaded from .env.production):
- Database connection string
- Payload CMS secret
- Public URL for redirects
- Email service credentials

### Secrets Generation

**Generate PAYLOAD_SECRET**:
```bash
openssl rand -hex 32
```

**Validate .env.production**:
```bash
# Script to check all required variables are present
#!/bin/bash
required_vars=("DATABASE_URI" "PAYLOAD_SECRET" "NEXT_PUBLIC_SERVER_URL")

for var in "${required_vars[@]}"; do
  if ! grep -q "^${var}=" .env.production; then
    echo "ERROR: Missing required variable: $var"
    exit 1
  fi
done

echo "✅ All required environment variables present"
```

## Data Persistence Strategy

### Volume Configuration

**Named Volumes**:

1. **payload-db** (SQLite database)
   - Mount point: `/data`
   - Contains: `payload.db`, `payload.db-shm`, `payload.db-wal`
   - Size: Typically <100MB for small-medium sites
   - Backup: Critical, daily recommended

2. **media-uploads** (User-uploaded media)
   - Mount point: `/app/public/media`
   - Contains: Images, PDFs, documents uploaded via Payload CMS
   - Size: Variable, depends on usage
   - Backup: Critical, daily recommended

### Volume Management Commands

**List volumes**:
```bash
docker volume ls | grep ptnextjs
```

**Inspect volume**:
```bash
docker volume inspect ptnextjs-db
```

**Backup volume** (manual method):
```bash
# Stop container first
docker-compose down

# Backup database volume
docker run --rm \
  -v ptnextjs-db:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/db-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .

# Backup media volume
docker run --rm \
  -v ptnextjs-media:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/media-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
```

**Restore volume**:
```bash
# Restore database
docker run --rm \
  -v ptnextjs-db:/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "cd /data && tar xzf /backup/db-TIMESTAMP.tar.gz"

# Restore media
docker run --rm \
  -v ptnextjs-media:/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "cd /data && tar xzf /backup/media-TIMESTAMP.tar.gz"
```

### Backup Strategy

**Automated Backup Script** (`scripts/backup.sh`):
```bash
#!/bin/bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "🔄 Stopping application..."
docker-compose down

echo "📦 Backing up database..."
docker run --rm \
  -v ptnextjs-db:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/db-$TIMESTAMP.tar.gz -C /data .

echo "📦 Backing up media..."
docker run --rm \
  -v ptnextjs-media:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/media-$TIMESTAMP.tar.gz -C /data .

echo "🚀 Restarting application..."
docker-compose up -d

echo "✅ Backup complete: db-$TIMESTAMP.tar.gz, media-$TIMESTAMP.tar.gz"
echo "📁 Location: $BACKUP_DIR"
```

**Backup Retention**:
- Keep last 7 daily backups
- Keep last 4 weekly backups
- Keep last 3 monthly backups
- Automate cleanup with cron or script

## Health Check Implementation

### Health Check Endpoint

**Create health check API route** (`app/api/health/route.ts`):

```typescript
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET() {
  try {
    // Check database connectivity
    const payload = await getPayload({ config });
    await payload.db.connect();

    // Optional: Check critical collections
    const vendorCount = await payload.count({
      collection: 'vendors',
    });

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      vendorCount: vendorCount.totalDocs,
    }, { status: 200 });

  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    }, { status: 503 });
  }
}
```

### Docker Health Check Configuration

**In docker-compose.yml**:
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
  interval: 30s      # Check every 30 seconds
  timeout: 10s       # Fail if check takes >10s
  retries: 3         # Mark unhealthy after 3 failures
  start_period: 40s  # Allow 40s for application startup
```

**Health Check Behavior**:
- Container starts in `starting` state
- After `start_period`, health checks begin
- Container becomes `healthy` after first successful check
- Container becomes `unhealthy` after `retries` consecutive failures
- Unhealthy containers can trigger restart policies

### Monitoring Health Status

**Check container health**:
```bash
docker ps
# Shows "healthy" or "unhealthy" in STATUS column

docker inspect ptnextjs-app --format='{{.State.Health.Status}}'
# Outputs: healthy, unhealthy, or starting
```

**View health check logs**:
```bash
docker inspect ptnextjs-app --format='{{json .State.Health}}' | jq
```

## Deployment Scripts

### deploy.sh - Initial Deployment and Restarts

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
if [ ! -f .env.production ]; then
  echo "❌ ERROR: .env.production not found"
  echo "   Copy .env.production.example and configure it"
  exit 1
fi

# Build images
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Start services
echo "▶️  Starting services..."
docker-compose up -d

# Wait for health check
echo "⏳ Waiting for application to become healthy..."
timeout 60 sh -c 'until docker ps | grep ptnextjs-app | grep -q "healthy"; do sleep 2; done' || {
  echo "❌ Health check failed after 60s"
  docker-compose logs --tail=50 app
  exit 1
}

echo "✅ Deployment complete!"
echo "📊 Check status: docker-compose ps"
echo "📋 View logs: docker-compose logs -f app"
```

### update.sh - Update to New Version

```bash
#!/bin/bash
set -e

echo "🔄 Updating ptnextjs application..."

# Backup before update
echo "📦 Creating backup..."
./backup.sh

# Pull latest code (assumes git deployment)
echo "⬇️  Pulling latest code..."
git pull origin main

# Rebuild images
echo "🔨 Rebuilding Docker images..."
docker-compose build --no-cache

# Restart services
echo "🔄 Restarting services..."
docker-compose down
docker-compose up -d

# Wait for health check
echo "⏳ Waiting for application to become healthy..."
timeout 60 sh -c 'until docker ps | grep ptnextjs-app | grep -q "healthy"; do sleep 2; done' || {
  echo "❌ Update failed - health check timeout"
  echo "🔙 Consider rolling back: docker-compose down && git checkout PREVIOUS_COMMIT && ./deploy.sh"
  docker-compose logs --tail=50 app
  exit 1
}

echo "✅ Update complete!"
```

### stop.sh - Graceful Shutdown

```bash
#!/bin/bash
set -e

echo "🛑 Stopping ptnextjs application..."

docker-compose down

echo "✅ Application stopped"
echo "💾 Data persists in volumes: ptnextjs-db, ptnextjs-media"
echo "🚀 Restart with: ./deploy.sh"
```

### logs.sh - View Application Logs

```bash
#!/bin/bash

# Default: follow logs in real-time
if [ "$1" = "follow" ] || [ -z "$1" ]; then
  docker-compose logs -f --tail=100 app

# Show last N lines
elif [ "$1" = "tail" ]; then
  LINES=${2:-100}
  docker-compose logs --tail=$LINES app

# Search logs
elif [ "$1" = "search" ]; then
  if [ -z "$2" ]; then
    echo "Usage: ./logs.sh search PATTERN"
    exit 1
  fi
  docker-compose logs app | grep "$2"

# Show all logs
elif [ "$1" = "all" ]; then
  docker-compose logs app

else
  echo "Usage:"
  echo "  ./logs.sh follow         # Follow logs in real-time (default)"
  echo "  ./logs.sh tail [N]       # Show last N lines (default 100)"
  echo "  ./logs.sh search PATTERN # Search logs for pattern"
  echo "  ./logs.sh all            # Show all logs"
fi
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Container Fails to Start

**Symptoms**:
```
docker-compose up -d
# Container exits immediately
```

**Diagnosis**:
```bash
docker-compose logs app
```

**Common Causes**:
1. Missing environment variables → Check .env.production
2. Database file permissions → Check volume permissions
3. Port already in use → Change PORT in .env.production
4. Build failure → Check Dockerfile syntax

**Solution**:
```bash
# Verify environment
cat .env.production | grep -E "^[^#]"

# Check volume permissions
docker volume inspect ptnextjs-db

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Issue 2: Health Check Failing

**Symptoms**:
```
docker ps
# Shows "unhealthy" status
```

**Diagnosis**:
```bash
# Check health check logs
docker inspect ptnextjs-app --format='{{json .State.Health}}' | jq

# Test health endpoint manually
docker exec ptnextjs-app wget -O- http://localhost:3000/api/health
```

**Common Causes**:
1. Application not fully started → Increase `start_period`
2. Database connection failure → Check DATABASE_URI
3. Missing health endpoint → Verify route.ts exists

**Solution**:
```bash
# Increase start period in docker-compose.yml
healthcheck:
  start_period: 60s  # Increase from 40s

# Verify database connectivity
docker exec ptnextjs-app ls -la /data
```

#### Issue 3: Reverse Proxy Can't Reach Application

**Symptoms**:
- 502 Bad Gateway from reverse proxy
- "Connection refused" in proxy logs

**Diagnosis**:
```bash
# Verify proxy network exists
docker network ls | grep proxy

# Check app is on proxy network
docker network inspect proxy

# Test connectivity from reverse proxy container
docker exec nginx-proxy curl http://ptnextjs-app:3000/api/health
```

**Common Causes**:
1. Proxy network not created → `docker network create proxy`
2. App not joined to network → Check docker-compose.yml networks section
3. Wrong container name in proxy config → Use `ptnextjs-app` not `localhost`

**Solution**:
```bash
# Recreate proxy network if needed
docker network rm proxy
docker network create proxy

# Restart both app and reverse proxy
docker-compose down && docker-compose up -d
```

#### Issue 4: Data Lost After Restart

**Symptoms**:
- Database empty after container restart
- Uploaded media files missing

**Diagnosis**:
```bash
# Check volumes exist
docker volume ls | grep ptnextjs

# Inspect volume contents
docker run --rm -v ptnextjs-db:/data alpine ls -la /data
docker run --rm -v ptnextjs-media:/data alpine ls -la /data
```

**Common Causes**:
1. Volumes not defined in docker-compose.yml
2. Mount paths incorrect
3. Volumes accidentally deleted

**Solution**:
```bash
# Restore from backup
./restore.sh

# Verify volume mounts in docker-compose.yml
volumes:
  - payload-db:/data           # ✅ Correct
  - media-uploads:/app/public/media  # ✅ Correct
```

## Performance Optimization

### Image Size Optimization

**Current Size Comparison**:
- Single-stage build: ~800MB
- Multi-stage build: ~200MB
- Alpine-based runtime: ~180MB

**Further Optimizations**:
1. Use `.dockerignore` to exclude unnecessary files
2. Minimize npm dependencies (audit with `npm ls --all`)
3. Use `npm ci` instead of `npm install` for reproducible builds

### Build Time Optimization

**Layer Caching Strategy**:
```dockerfile
# ✅ Good: Dependencies layer cached separately
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Then copy source code (changes frequently)
COPY . .
RUN npm run build
```

```dockerfile
# ❌ Bad: Single layer, rebuilds on any code change
COPY . .
RUN npm install && npm run build
```

**BuildKit for Faster Builds**:
```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1
docker-compose build
```

### Runtime Performance

**Resource Limits** (prevents resource exhaustion):
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

**Adjust based on VPS resources**:
- 1GB RAM VPS: 512M limit
- 2GB RAM VPS: 1G limit
- 4GB+ RAM VPS: 2G limit

## Security Hardening

### Container Security

**Run as Non-Root User**:
```dockerfile
# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Switch to non-root
USER nextjs
```

**Minimal Base Image**:
```dockerfile
# ✅ Use Alpine (5MB base) instead of full Node.js image (900MB)
FROM node:22-alpine
```

**Read-Only Root Filesystem** (optional, advanced):
```yaml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/.next/cache
```

### Environment Security

**Never Commit Secrets**:
```gitignore
# .gitignore
.env.production
.env.local
.env*.local
backups/
```

**Use Docker Secrets** (for Swarm mode):
```yaml
# Future enhancement
secrets:
  payload_secret:
    external: true

services:
  app:
    secrets:
      - payload_secret
```

### Network Security

**Isolate Services**:
```yaml
# Only expose what's needed
expose:
  - "3000"  # ✅ Only on proxy network, not host

# ❌ Avoid:
ports:
  - "3000:3000"  # Exposes on all interfaces
```

## Monitoring and Observability

### Log Management

**Log Rotation Configuration**:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"   # Rotate at 10MB
    max-file: "3"     # Keep 3 rotated files
```

**Total log storage**: 30MB per container (3 files × 10MB)

**View Logs**:
```bash
# Real-time logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Logs since timestamp
docker-compose logs --since="2024-01-15T10:00:00" app

# Search logs
docker-compose logs app | grep ERROR
```

### Resource Monitoring

**Monitor Container Resources**:
```bash
# Real-time resource usage
docker stats ptnextjs-app

# Output:
# CONTAINER    CPU %    MEM USAGE / LIMIT    MEM %    NET I/O
# ptnextjs-app 5.23%    234MiB / 1GiB        22.85%   1.2MB / 3.4MB
```

**Monitor Disk Usage**:
```bash
# Check volume sizes
docker system df -v | grep ptnextjs

# Example output:
# ptnextjs-db      local    1         52MB
# ptnextjs-media   local    1         124MB
```

### Health Monitoring

**Automated Health Checks**:
```bash
#!/bin/bash
# check-health.sh

STATUS=$(docker inspect ptnextjs-app --format='{{.State.Health.Status}}')

if [ "$STATUS" != "healthy" ]; then
  echo "❌ Application is $STATUS"
  echo "📋 Recent logs:"
  docker-compose logs --tail=20 app

  # Optional: Send alert
  # curl -X POST https://alerts.example.com/webhook \
  #   -d "Application unhealthy: $STATUS"

  exit 1
else
  echo "✅ Application is healthy"
fi
```

**Cron Job** (run every 5 minutes):
```cron
*/5 * * * * /path/to/check-health.sh
```

## Deployment Checklist

### Pre-Deployment (VPS Setup)

- [ ] VPS provisioned with Docker installed
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] External proxy network created (`docker network create proxy`)
- [ ] Reverse proxy configured and running
- [ ] Domain DNS pointing to VPS IP
- [ ] SSH access configured
- [ ] Firewall configured (allow 80/443, block 3000)

### Initial Deployment

- [ ] Repository cloned to VPS
- [ ] `.env.production` created from example
- [ ] `PAYLOAD_SECRET` generated and set
- [ ] `NEXT_PUBLIC_SERVER_URL` set to production domain
- [ ] `DATABASE_URI` configured correctly
- [ ] Proxy network configuration verified
- [ ] `./deploy.sh` executed successfully
- [ ] Health check returns 200 OK
- [ ] Application accessible via domain
- [ ] SSL certificate working (if configured)
- [ ] Test vendor login works
- [ ] Test file upload persists after restart

### Post-Deployment Verification

- [ ] Container status: `docker ps` shows "healthy"
- [ ] Logs show no errors: `docker-compose logs app`
- [ ] Health endpoint accessible: `curl https://yourdomain.com/api/health`
- [ ] Database file created: `docker volume inspect ptnextjs-db`
- [ ] Media uploads directory exists: `docker volume inspect ptnextjs-media`
- [ ] Resource usage acceptable: `docker stats ptnextjs-app`
- [ ] Backup script tested: `./backup.sh` succeeds
- [ ] Restore script tested: `./restore.sh` succeeds

### Maintenance Schedule

**Daily**:
- [ ] Check container health status
- [ ] Review application logs for errors

**Weekly**:
- [ ] Create database backup (`./backup.sh`)
- [ ] Check disk usage (`docker system df`)
- [ ] Review resource usage trends

**Monthly**:
- [ ] Update base images (`docker-compose pull && docker-compose up -d`)
- [ ] Clean old Docker images (`docker image prune -a`)
- [ ] Review and clean old backups
- [ ] Test restore procedure

## Implementation Acceptance Criteria

- [ ] Dockerfile builds successfully with multi-stage build
- [ ] docker-compose.yml starts all services with `docker-compose up -d`
- [ ] Application container reports "healthy" status within 60 seconds
- [ ] Health check endpoint returns 200 OK: `curl http://localhost:3000/api/health`
- [ ] SQLite database persists data across container restarts (test: create vendor, restart, verify vendor exists)
- [ ] Media uploads persist across container restarts (test: upload image, restart, verify image accessible)
- [ ] External proxy network integration works (test: reverse proxy can reach app on http://ptnextjs-app:3000)
- [ ] Environment variables loaded correctly (test: verify PAYLOAD_SECRET in container env)
- [ ] Deploy script successfully deploys application (test: `./deploy.sh` on clean VPS succeeds)
- [ ] Update script updates without data loss (test: `./update.sh` preserves database and media)
- [ ] Stop script gracefully shuts down (test: `./stop.sh` exits containers cleanly)
- [ ] Backup script creates valid backup (test: `./backup.sh` creates tar.gz with db + media)
- [ ] Restore script restores from backup (test: delete volumes, `./restore.sh`, verify data restored)
- [ ] Logs script provides useful output (test: `./logs.sh` shows recent application logs)
- [ ] Documentation enables fresh deployment (test: follow docs on new VPS, deployment succeeds)
