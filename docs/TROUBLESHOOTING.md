# Docker Deployment Troubleshooting Guide

Quick solutions for common Docker deployment issues.

## Quick Diagnostics

```bash
# Run full diagnostic check
./docker/deploy.sh

# Check container status
docker-compose ps

# View recent logs
./docker/logs.sh tail 100

# Test health endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/ready
```

## Common Issues

### Container Won't Start

**Symptoms**: Container exits immediately or won't start

**Diagnosis**:
```bash
docker-compose ps  # Check status
docker-compose logs app  # Check error logs
```

**Solutions**:
1. Check environment variables:
```bash
cat .env.production | grep -E "DATABASE_URL|PAYLOAD_SECRET|NEXT_PUBLIC_SERVER_URL"
```

2. Verify PAYLOAD_SECRET is 32+ characters
3. Rebuild image:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Errors

**Symptoms**: "Database connection failed" in logs

**Diagnosis**:
```bash
docker-compose logs app | grep -i "database\|error"
docker volume inspect ptnextjs-payload-db
```

**Solutions**:
1. Verify DATABASE_URL format:
```bash
# Should be: file:///data/payload.db (3 slashes)
grep DATABASE_URL .env.production
```

2. Check volume permissions:
```bash
docker-compose down
docker volume rm ptnextjs-payload-db
docker-compose up -d  # Recreates volume
```

### Health Check Failing

**Symptoms**: Container shows "unhealthy" status

**Diagnosis**:
```bash
docker inspect --format='{{.State.Health}}' ptnextjs-app
curl http://localhost:3000/api/health
```

**Solutions**:
1. Check application logs for errors
2. Verify app is listening on port 3000
3. Test health endpoint manually:
```bash
docker-compose exec app wget -O- http://localhost:3000/api/health
```

### Out of Disk Space

**Symptoms**: Build fails with "no space left on device"

**Diagnosis**:
```bash
df -h
docker system df
```

**Solutions**:
```bash
# Clean up Docker resources
docker system prune -a --volumes

# Remove old images
docker image prune -a

# Check largest volumes
docker system df -v
```

### Memory Issues

**Symptoms**: Container killed or OOM (Out of Memory) errors

**Diagnosis**:
```bash
docker stats ptnextjs-app
docker logs ptnextjs-app | grep -i "memory\|oom"
```

**Solutions**:
1. Increase memory limit in `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      memory: 2G  # Increase from 1G
```

2. Check for memory leaks in application logs
3. Restart container:
```bash
docker-compose restart app
```

### Network Issues

**Symptoms**: Can't access application via reverse proxy

**Diagnosis**:
```bash
docker network ls | grep proxy
docker network inspect proxy
docker-compose exec app wget -O- http://localhost:3000/api/health
```

**Solutions**:
1. Verify proxy network exists:
```bash
docker network create proxy
```

2. Check container is on proxy network:
```bash
docker inspect ptnextjs-app | grep -A 10 Networks
```

3. Verify reverse proxy configuration

### Permission Errors

**Symptoms**: "Permission denied" errors in logs

**Diagnosis**:
```bash
docker-compose logs app | grep -i "permission\|eacces"
```

**Solutions**:
```bash
# Check volume ownership
docker-compose exec app ls -la /data /app/media

# Fix ownership (if needed)
docker-compose down
docker-compose up -d  # Container recreates with correct permissions
```

### Build Failures

**Symptoms**: `docker-compose build` fails

**Diagnosis**:
```bash
docker-compose build 2>&1 | tail -50
```

**Solutions**:
1. Clear build cache:
```bash
docker-compose build --no-cache
```

2. Check Dockerfile syntax:
```bash
cat Dockerfile | grep -E "FROM|RUN|COPY"
```

3. Verify .dockerignore isn't excluding required files:
```bash
cat .dockerignore
```

### SSL/HTTPS Issues

**Symptoms**: HTTPS redirects fail, SSL errors

**Diagnosis**:
```bash
curl -I https://yourdomain.com
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

**Solutions**:
1. Verify reverse proxy SSL configuration
2. Check Traefik logs:
```bash
docker logs traefik
```

3. Renew SSL certificates:
```bash
# Traefik auto-renews
# For Nginx:
sudo certbot renew
sudo systemctl reload nginx
```

### Slow Performance

**Symptoms**: Application responds slowly

**Diagnosis**:
```bash
docker stats ptnextjs-app
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/health
```

**Solutions**:
1. Check resource usage:
```bash
docker stats
```

2. Optimize database:
```bash
# SQLite vacuum (compact database)
docker-compose exec app node -e "
const db = require('better-sqlite3')('/data/payload.db');
db.pragma('vacuum');
db.close();
"
```

3. Clear old logs:
```bash
docker-compose logs --tail=1000 app > saved-logs.txt
# Then restart to clear log buffer
docker-compose restart app
```

### Update Failures

**Symptoms**: `./docker/update.sh` fails

**Diagnosis**:
```bash
./docker/logs.sh tail 200
docker-compose ps
```

**Solutions**:
1. Rollback to previous version:
```bash
git log --oneline -5  # Find previous commit
git checkout <previous-commit>
./docker/update.sh
```

2. Restore from backup:
```bash
./docker/restore.sh <backup-name>
```

## Emergency Recovery

### Complete Reset (⚠️ DATA LOSS)

```bash
# Stop everything
docker-compose down -v

# Remove all data
docker volume rm ptnextjs-payload-db ptnextjs-media-uploads

# Fresh deployment
./docker/deploy.sh
```

### Restore from Backup

```bash
# List backups
ls -1 backups/ | grep -E 'ptnextjs-backup.*-db.tar.gz' | sed 's/-db.tar.gz//'

# Restore specific backup
./docker/restore.sh ptnextjs-backup-20251106-120000
```

## Getting Help

If you can't resolve the issue:

1. Collect diagnostic information:
```bash
# System info
uname -a
docker --version
docker-compose version

# Container status
docker-compose ps
docker inspect ptnextjs-app

# Recent logs
docker-compose logs --tail=200 app > diagnostic-logs.txt

# Resource usage
docker stats --no-stream > diagnostic-stats.txt

# Environment (sanitized)
cat .env.production | sed 's/SECRET=.*/SECRET=REDACTED/' > diagnostic-env.txt
```

2. Check documentation:
   - [DOCKER-DEPLOYMENT.md](./DOCKER-DEPLOYMENT.md)
   - [Payload CMS Docs](https://payloadcms.com/docs)
   - [Next.js Docs](https://nextjs.org/docs)

3. Search existing issues:
   - [GitHub Issues](https://github.com/yourusername/ptnextjs/issues)

4. Create new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Diagnostic information collected above
   - Expected vs actual behavior
