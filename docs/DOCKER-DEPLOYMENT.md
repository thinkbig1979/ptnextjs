# Docker VPS Deployment Guide

Complete guide for deploying the Paul Thames Superyacht Technology platform to a VPS using Docker.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [One-Time VPS Setup](#one-time-vps-setup)
- [Initial Deployment](#initial-deployment)
- [Operations](#operations)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Backup and Restore](#backup-and-restore)

## Architecture Overview

**Deployment Model**: Single Next.js container with SQLite database

```
┌─────────────────────────────────────────────────┐
│ VPS Server                                      │
│                                                 │
│  ┌─────────────────┐         ┌──────────────┐ │
│  │  Reverse Proxy  │◄────────┤ External Net │ │
│  │  (Traefik/Nginx)│         │  "proxy"     │ │
│  └─────────────────┘         └──────────────┘ │
│         │                            ▲         │
│         │                            │         │
│         ▼                            │         │
│  ┌──────────────────────────────────────────┐ │
│  │  ptnextjs-app Container                  │ │
│  │  ┌────────────────────────────────────┐  │ │
│  │  │  Next.js 15 + Payload CMS 3        │  │ │
│  │  │  Port: 3000 (internal)             │  │ │
│  │  │  Health: /api/health               │  │ │
│  │  └────────────────────────────────────┘  │ │
│  │                                          │ │
│  │  Volumes:                                │ │
│  │  ├─ payload-db:/data (SQLite)           │ │
│  │  └─ media-uploads:/app/media            │ │
│  └──────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Key Features**:
- Multi-stage Docker build (deps, builder, runner)
- SQLite database with persistent volumes
- Health check endpoints for monitoring
- Zero-downtime updates
- Automatic backups before updates
- Resource limits (1GB RAM, 1 CPU)

## Prerequisites

### VPS Requirements

- **OS**: Ubuntu 22.04 LTS or Debian 11+ (recommended)
- **RAM**: Minimum 2GB (1GB for app + 1GB for system)
- **CPU**: 1 core minimum, 2 cores recommended
- **Disk**: 20GB minimum (10GB for app + 10GB for backups)
- **Network**: Static IP address or domain name

### Required Software

```bash
# Docker Engine 24.0+
curl -fsSL https://get.docker.com | sh

# Docker Compose V2
sudo apt-get install docker-compose-plugin

# Git
sudo apt-get install git

# Optional: OpenSSL for generating secrets
sudo apt-get install openssl
```

### Domain Configuration

- DNS A record pointing to VPS IP address
- SSL certificate (handled by reverse proxy)
- Reverse proxy configured (Traefik/Nginx/Caddy)

## One-Time VPS Setup

### 1. Install Docker

```bash
# Install Docker Engine
curl -fsSL https://get.docker.com | sh

# Add current user to docker group (logout/login required)
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

### 2. Create External Proxy Network

```bash
# Create shared Docker network for reverse proxy
docker network create proxy

# Verify network exists
docker network ls | grep proxy
```

### 3. Configure Reverse Proxy

**Option A: Traefik** (recommended, auto-SSL)

```yaml
# traefik.yml
version: '3.8'
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@yourdomain.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-letsencrypt:/letsencrypt
    networks:
      - proxy

volumes:
  traefik-letsencrypt:

networks:
  proxy:
    external: true
```

**Option B: Nginx** (manual SSL management)

```nginx
# /etc/nginx/sites-available/ptnextjs
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://ptnextjs-app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://ptnextjs-app:3000/api/health;
        access_log off;
    }
}
```

### 4. Clone Repository

```bash
# Clone repository to VPS
cd /opt  # or your preferred location
git clone https://github.com/yourusername/ptnextjs.git
cd ptnextjs
```

### 5. Configure Environment Variables

```bash
# Copy environment template
cp .env.production.example .env.production

# Generate secure Payload secret (32+ characters)
openssl rand -hex 32

# Edit configuration
nano .env.production
```

**Required Variables:**

```bash
# Node.js
NODE_ENV=production
PORT=3000

# Database (Docker volume mounted at /data)
DATABASE_URL=file:///data/payload.db

# Application URLs
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com

# Security (CHANGE THESE!)
PAYLOAD_SECRET=<generated-with-openssl-rand-hex-32>
JWT_ACCESS_TOKEN_EXPIRY=1h
JWT_REFRESH_TOKEN_EXPIRY=7d

# Initial Admin User
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<secure-password>

# hCaptcha (optional)
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-site-key
HCAPTCHA_SECRET_KEY=your-secret-key

# Docker
DOMAIN=yourdomain.com
```

### 6. Security Configuration

```bash
# Set proper file permissions
chmod 600 .env.production

# Verify .env is gitignored
grep -q "^\.env$" .gitignore && echo "OK: .env is gitignored"

# Update firewall (UFW example)
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 22/tcp   # SSH
sudo ufw enable
```

## Initial Deployment

### Deploy Application

```bash
cd /opt/ptnextjs

# Run deployment script
./docker/deploy.sh
```

**Deployment script performs:**
1. Creates `proxy` network (if not exists)
2. Validates `.env.production` file
3. Builds Docker image (multi-stage build)
4. Starts containers with docker-compose
5. Waits for health check to pass
6. Displays deployment status

### Verify Deployment

```bash
# Check container status
docker-compose ps

# Expected output:
# NAME                COMMAND             SERVICE    STATUS         PORTS
# ptnextjs-app        "node server.js"    app        Up (healthy)

# Check health endpoint
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"...","uptime":123}

# Check application logs
./docker/logs.sh tail 50

# Verify external access (replace with your domain)
curl https://yourdomain.com/api/health
```

### Access Admin Panel

1. Navigate to `https://yourdomain.com/admin`
2. Login with credentials from `.env.production`:
   - Email: `ADMIN_EMAIL`
   - Password: `ADMIN_PASSWORD`
3. **IMMEDIATELY change the admin password** after first login

## Operations

### Application Updates

```bash
cd /opt/ptnextjs

# Run update script (includes automatic backup)
./docker/update.sh
```

**Update script performs:**
1. Creates backup of database and media
2. Pulls latest code from git
3. Rebuilds Docker image
4. Restarts containers (zero-downtime)
5. Waits for health check validation
6. Cleans up old Docker images

### View Logs

```bash
# Follow logs in real-time
./docker/logs.sh follow

# View last 100 lines
./docker/logs.sh tail 100

# View all logs
./docker/logs.sh all

# Filter for errors
./docker/logs.sh errors
```

### Restart Application

```bash
# Restart containers
docker-compose restart app

# Or use stop/start for full restart
./docker/stop.sh
./docker/deploy.sh
```

### Stop Application

```bash
# Graceful shutdown (preserves volumes)
./docker/stop.sh

# Force stop all containers and remove volumes (⚠️ DATA LOSS)
docker-compose down -v  # Only use for complete teardown
```

## Monitoring

### Health Checks

The application provides two health check endpoints:

**Basic Health Check** (`/api/health`):
```bash
curl http://localhost:3000/api/health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T12:34:56.789Z",
  "uptime": 12345,
  "environment": "production"
}
```

**Readiness Check** (`/api/health/ready`):
```bash
curl http://localhost:3000/api/health/ready
```
Response (healthy):
```json
{
  "status": "healthy",
  "timestamp": "2025-11-06T12:34:56.789Z",
  "checks": {
    "database": "connected",
    "payload": "initialized"
  }
}
```

### Docker Health Status

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' ptnextjs-app

# View health check logs
docker inspect ptnextjs-app | jq '.[0].State.Health'
```

### Resource Usage

```bash
# Monitor resource usage
docker stats ptnextjs-app

# Check disk usage
docker system df

# Check volume sizes
docker system df -v | grep ptnextjs
```

### Log Analysis

```bash
# Count error logs
docker-compose logs app | grep -i "error" | wc -l

# Find recent errors
docker-compose logs --since 1h app | grep -i "error"

# Export logs for analysis
docker-compose logs app > app-logs-$(date +%Y%m%d).log
```

## Backup and Restore

### Automated Backups

```bash
# Manual backup (before risky operations)
./docker/backup.sh
```

**Backup includes:**
- SQLite database from `ptnextjs-payload-db` volume
- Media uploads from `ptnextjs-media-uploads` volume
- Timestamped tar.gz archives in `./backups/` directory

**Backup location:**
```
./backups/
├── ptnextjs-backup-20251106-120000-db.tar.gz    # Database
└── ptnextjs-backup-20251106-120000-media.tar.gz # Media files
```

### Restore from Backup

```bash
# List available backups
ls -lh backups/ | grep ptnextjs-backup

# Restore from specific backup
./docker/restore.sh ptnextjs-backup-20251106-120000
```

**⚠️ WARNING**: Restore process will:
1. Stop all containers
2. **DELETE current data**
3. Restore backup files
4. Restart containers

### Scheduled Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /opt/ptnextjs && ./docker/backup.sh >> /var/log/ptnextjs-backup.log 2>&1

# Add weekly cleanup (keep last 30 days)
0 3 * * 0 find /opt/ptnextjs/backups -name "ptnextjs-backup-*.tar.gz" -mtime +30 -delete
```

### Off-Site Backup

```bash
# Sync backups to remote server (rsync)
rsync -avz --delete backups/ user@backup-server:/backups/ptnextjs/

# Or upload to S3 (requires AWS CLI)
aws s3 sync backups/ s3://your-bucket/backups/ptnextjs/
```

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed troubleshooting guide.

### Quick Diagnostics

```bash
# Full system check
./docker/deploy.sh  # Re-runs health checks

# Container logs
docker-compose logs --tail=100 app

# Health check status
curl http://localhost:3000/api/health/ready

# Database connectivity
docker-compose exec app node -e "const payload = require('payload'); payload.getPayload({config:require('@payload-config')}).then(() => console.log('OK')).catch(e => console.error(e))"
```

### Common Issues

**Issue**: Container won't start
```bash
# Check logs for errors
docker-compose logs app

# Verify environment variables
docker-compose config

# Rebuild image
docker-compose build --no-cache
```

**Issue**: Database connection errors
```bash
# Check database volume
docker volume inspect ptnextjs-payload-db

# Verify DATABASE_URL in .env.production
cat .env.production | grep DATABASE_URL

# Expected: DATABASE_URL=file:///data/payload.db
```

**Issue**: Out of disk space
```bash
# Clean up Docker resources
docker system prune -a --volumes

# Check disk usage
df -h
docker system df
```

## Maintenance

### Update Dependencies

```bash
# Update Node.js dependencies
npm update

# Rebuild image with new dependencies
./docker/update.sh
```

### Database Migrations

```bash
# Database migrations handled automatically by Payload CMS
# Schema changes applied on application startup
# Check migration logs:
docker-compose logs app | grep -i "migration"
```

### SSL Certificate Renewal

**Traefik**: Automatic renewal via Let's Encrypt
**Nginx**: Manual renewal via certbot

```bash
# Renew certificates (certbot)
sudo certbot renew

# Reload Nginx
sudo systemctl reload nginx
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env.production` to git
2. **SSH Access**: Use key-based authentication, disable password login
3. **Firewall**: Only open required ports (80, 443, 22)
4. **Updates**: Keep Docker, OS, and dependencies up to date
5. **Backups**: Test restore process regularly
6. **Monitoring**: Set up uptime monitoring (UptimeRobot, Pingdom)
7. **Secrets Rotation**: Rotate `PAYLOAD_SECRET` periodically
8. **Admin Password**: Use strong, unique password
9. **Database**: SQLite file permissions set to 600 (owner only)
10. **Logs**: Monitor for suspicious activity

## Performance Optimization

### Resource Tuning

Edit `docker-compose.yml` to adjust resource limits:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2.0'      # Increase if needed
          memory: 2G       # Increase if needed
        reservations:
          cpus: '1.0'
          memory: 1G
```

### Caching

Consider adding Redis for caching:

```bash
# Add Redis service to docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    networks:
      - proxy

volumes:
  redis-data:
```

## Support

- **Documentation**: [docs/](.)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ptnextjs/issues)
- **Payload CMS Docs**: [payloadcms.com/docs](https://payloadcms.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
