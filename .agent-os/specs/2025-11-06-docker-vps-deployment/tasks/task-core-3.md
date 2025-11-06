# Task: core-3 - Create docker-compose.yml Configuration

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Core Docker Infrastructure (TDD GREEN)
**Status:** Not Started
**Assigned Agent:** integration-coordinator
**Estimated Time:** 40 minutes
**Dependencies:** core-2

---

## Description

Create production-ready Docker Compose configuration orchestrating the Next.js application and PostgreSQL database with proper networking, volume management, health checks, and resource constraints.

---

## Specifics

**File location:** `/home/edwin/development/ptnextjs/docker-compose.yml`

**Services to configure:**
1. **app** - Next.js + Payload CMS application
2. **db** - PostgreSQL 16 database

**Key requirements from spec:**
- External proxy network integration
- Named volumes for data persistence
- Health check configurations
- Resource limits (1GB memory, 1 CPU)
- Environment variable configuration
- Service dependencies
- Restart policies
- JSON logging driver with rotation

**Network:** External network named "proxy" (for reverse proxy integration)

**Volumes:**
- `postgres-data` - Database persistence
- `media-uploads` - User-uploaded media files

---

## Acceptance Criteria

- [ ] docker-compose.yml created at project root
- [ ] Compose version 3.8 or higher
- [ ] Two services defined: app and db
- [ ] App service uses custom Dockerfile
- [ ] PostgreSQL 16 official image configured
- [ ] External proxy network configured
- [ ] Named volumes created for database and media
- [ ] Health checks configured for both services
- [ ] Resource limits applied (1GB RAM, 1 CPU)
- [ ] Environment variables properly configured
- [ ] Service dependency (app depends_on db) set
- [ ] Restart policy: always
- [ ] JSON logging driver with 10MB rotation
- [ ] Port 3000 exposed (not published - proxy handles)
- [ ] PostgreSQL credentials configured
- [ ] docker-compose up starts both services successfully

---

## Testing Requirements

**Validation commands:**
```bash
# Validate compose file syntax
docker-compose config

# Start services
docker-compose up -d

# Verify services running
docker-compose ps

# Check health status
docker-compose ps | grep healthy

# Verify network
docker network inspect proxy

# Verify volumes
docker volume ls | grep ptnextjs

# Check logs
docker-compose logs app
docker-compose logs db

# Test connectivity
docker-compose exec app wget -O- http://localhost:3000/api/health

# Clean up
docker-compose down -v
```

**Integration test validation:**
- Docker stack integration tests (core-1) should progress toward passing
- Both containers should start and achieve healthy status

---

## Evidence Requirements

**Completion evidence:**
1. docker-compose.yml committed to project root
2. docker-compose config validation output
3. docker-compose ps showing healthy services
4. Network inspection showing proxy connection
5. Volume list showing named volumes created

**Documentation:**
- Inline comments explaining service configurations
- Network architecture notes
- Volume management strategy

---

## Context Requirements

**Required knowledge:**
- Docker Compose networking
- PostgreSQL container configuration
- Health check syntax
- Resource constraint configuration
- Docker logging drivers

**Files to reference:**
- Spec: `.agent-os/specs/2025-11-06-docker-vps-deployment/spec.md`
- Dockerfile (core-2 output)
- .env.production.example (core-7 - may need to create placeholder)

**Environment variables:**
- DATABASE_URL
- POSTGRES_DB
- POSTGRES_USER
- POSTGRES_PASSWORD
- PAYLOAD_SECRET
- NEXT_PUBLIC_SERVER_URL

---

## Implementation Notes

**docker-compose.yml structure:**

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-payload}
      POSTGRES_USER: ${POSTGRES_USER:-payload}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - proxy
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-payload}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  app:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-payload}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB:-payload}
      PAYLOAD_SECRET: ${PAYLOAD_SECRET}
      NEXT_PUBLIC_SERVER_URL: ${NEXT_PUBLIC_SERVER_URL}
      NODE_ENV: production
    volumes:
      - media-uploads:/app/media
    networks:
      - proxy
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1024M
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

networks:
  proxy:
    external: true

volumes:
  postgres-data:
  media-uploads:
```

**Network strategy:**
- External "proxy" network for reverse proxy integration
- Assumes Traefik or Nginx running on same network
- App not directly exposed to host (reverse proxy handles)

**Volume strategy:**
- Named volumes for persistence
- Database volume: postgres-data
- Media volume: media-uploads (maps to /app/media)
- Survives container recreation

**Health check strategy:**
- PostgreSQL: pg_isready command
- App: wget to /api/health endpoint
- Start period: 40s (allows app initialization)
- Intervals: DB 10s, App 30s

**Resource limits:**
- App: 1GB RAM, 1 CPU (spec requirement)
- DB: 512MB RAM, 1 CPU (conservative allocation)
- Prevents resource exhaustion on VPS

**Dependency management:**
- App waits for DB healthy status
- Ensures database ready before app starts
- Prevents connection errors on startup

---

## Next Steps

After completing this task:
1. Verify docker-compose up succeeds
2. Test health checks achieve healthy status
3. Proceed to core-4 (.dockerignore)
4. Continue to core-6 (payload.config.ts update)

**Note:** This task is critical path for GREEN phase. Must work correctly for integration tests to pass.
