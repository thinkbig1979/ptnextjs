# Task: test-5 - Perform End-to-End Integration Test

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Testing & Validation
**Status:** Not Started
**Assigned Agent:** quality-assurance
**Estimated Time:** 45 minutes
**Dependencies:** ALL_PREVIOUS

---

## Description

Perform comprehensive end-to-end integration test covering complete deployment lifecycle from initial setup through updates, backups, and monitoring.

---

## Specifics

**Test workflow:**
1. Fresh deployment (deploy.sh)
2. Application functionality verification
3. Health check validation
4. Data creation and persistence
5. Update deployment (update.sh)
6. Backup creation
7. Restore validation
8. Graceful shutdown
9. Log viewing
10. Monitoring validation

---

## Acceptance Criteria

- [ ] Fresh deployment succeeds
- [ ] All containers healthy
- [ ] Application accessible
- [ ] Admin panel functional
- [ ] Health checks pass
- [ ] Data persists across restarts
- [ ] Update deployment succeeds
- [ ] Backup/restore workflow works
- [ ] Graceful shutdown works
- [ ] Logs accessible
- [ ] Performance acceptable (< 2GB RAM usage)
- [ ] No errors in logs

---

## Testing Requirements

```bash
# Clean slate
docker-compose down -v
docker system prune -f

# Step 1: Initial deployment
./scripts/deploy.sh
# Verify: Containers start, health checks pass

# Step 2: Functionality test
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/ready
# Access admin panel in browser
# Create test content

# Step 3: Persistence test
docker-compose restart app
# Verify: Data still exists

# Step 4: Update test
git commit --allow-empty -m "Test update"
./scripts/update.sh
# Verify: Update succeeds, data intact

# Step 5: Backup/restore
./scripts/backup.sh
# Delete test content
./scripts/restore.sh backups/backup-LATEST/
# Verify: Content restored

# Step 6: Monitoring
./scripts/logs.sh app --tail 100
./scripts/health-check.sh

# Step 7: Shutdown
./scripts/stop.sh
# Verify: Graceful shutdown, no errors

# Step 8: Resource usage
docker stats --no-stream
# Verify: < 2GB total memory usage
```

---

## Evidence Requirements

**Completion evidence:**
1. Full test execution log
2. Screenshots of key steps
3. Performance metrics (memory, CPU)
4. Health check results
5. Container status throughout lifecycle
6. Any errors encountered and resolved
7. Test summary report

**Performance benchmarks:**
- Deployment time: < 5 minutes
- Update time: < 3 minutes
- Backup time: < 1 minute
- Restore time: < 2 minutes
- Memory usage: < 2GB total
- CPU usage: < 100% sustained

---

## Success Criteria

All of the following must be true:
- [ ] Complete deployment lifecycle succeeds
- [ ] Zero critical errors
- [ ] All health checks pass
- [ ] Performance within acceptable limits
- [ ] Data integrity maintained
- [ ] All scripts function correctly
- [ ] Documentation is accurate

---

## Next Steps

After successful end-to-end test, proceed to Phase 6 (Documentation).
