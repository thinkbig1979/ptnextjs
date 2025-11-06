# Task: health-4 - Add Docker HEALTHCHECK Configuration

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Health Checks & Monitoring
**Status:** Not Started
**Assigned Agent:** integration-coordinator
**Estimated Time:** 15 minutes
**Dependencies:** health-3

---

## Description

Add HEALTHCHECK directives to Dockerfile and docker-compose.yml to enable automatic container health monitoring using the implemented health check endpoints.

---

## Specifics

**Files to update:**
1. `/home/edwin/development/ptnextjs/Dockerfile`
2. `/home/edwin/development/ptnextjs/docker-compose.yml`

**Health check requirements from spec:**
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start period: 40 seconds (allow app startup)
- Command: wget-based HTTP check

**Endpoint to use:** `/api/health` (basic health, no database check)

---

## Acceptance Criteria

- [ ] Dockerfile HEALTHCHECK added
- [ ] docker-compose.yml healthcheck updated for app service
- [ ] Uses /api/health endpoint
- [ ] Correct timing parameters (30s interval, 10s timeout, 3 retries)
- [ ] Start period configured (40s)
- [ ] wget command properly formatted
- [ ] Container shows "healthy" status after startup
- [ ] Unhealthy detection works (kill app process)
- [ ] Health status visible in docker ps

---

## Testing Requirements

```bash
# Build and start
docker-compose up -d

# Wait for healthy status (up to 40s start period + 30s interval)
docker-compose ps
# Expected: "healthy" in STATUS column

# Monitor health checks
docker inspect ptnextjs_app_1 | jq '.[0].State.Health'

# Test unhealthy detection
docker-compose exec app pkill node
sleep 40
docker-compose ps
# Expected: "unhealthy" status

# Container should restart automatically
sleep 60
docker-compose ps
# Expected: "healthy" again (restart policy)

# Clean up
docker-compose down
```

---

## Implementation Notes

**Dockerfile update:**
```dockerfile
# Add after EXPOSE and before CMD
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
```

**docker-compose.yml update:**
```yaml
services:
  app:
    # ... existing configuration
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    # ... rest of configuration
```

**Health check behavior:**
- **Start period (40s):** Grace period during startup, failures don't count
- **Interval (30s):** Check every 30 seconds after start period
- **Timeout (10s):** Each check must complete within 10 seconds
- **Retries (3):** 3 consecutive failures = unhealthy
- **Exit code:** 0 = healthy, 1 = unhealthy

**Status progression:**
1. `starting` - During start_period (0-40s)
2. `healthy` - After first successful check
3. `unhealthy` - After 3 consecutive failures

**Why use /api/health not /api/health/ready:**
- Lightweight check (no database query)
- Faster response time
- Suitable for frequent polling (30s interval)
- Database issues handled by readiness probe separately

---

## Next Steps

After implementation:
1. Verify healthy status in docker ps
2. Test unhealthy detection
3. Proceed to health-5 (health-check.sh script)
