# Task: docs-2 - Create TROUBLESHOOTING.md Guide

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Documentation & Production Readiness
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 30 minutes
**Dependencies:** test-5

---

## Description

Create detailed troubleshooting guide covering common issues, diagnostic procedures, and solutions for Docker deployment problems.

---

## Specifics

**File:** `/home/edwin/development/ptnextjs/TROUBLESHOOTING.md`

**Sections:**
1. Diagnostic procedures
2. Container issues
3. Database issues
4. Network issues
5. Health check failures
6. Performance issues
7. Resource constraints
8. Log analysis
9. Emergency procedures

---

## Acceptance Criteria

- [ ] Troubleshooting guide created
- [ ] Common issues documented with solutions
- [ ] Diagnostic commands provided
- [ ] Log analysis examples included
- [ ] Emergency procedures documented
- [ ] Rollback procedures explained
- [ ] Contact/escalation info included
- [ ] Reviewed by quality-assurance

---

## Content Outline

```markdown
# Docker Deployment Troubleshooting Guide

## Quick Diagnostics
```bash
# Check container status
docker-compose ps

# Check logs
./scripts/logs.sh

# Check health
./scripts/health-check.sh

# Check resources
docker stats
```

## Common Issues

### Container Won't Start
**Symptoms:** Container exits immediately
**Diagnosis:**
- Check logs: `docker-compose logs app`
- Check environment: `docker-compose config`
**Solutions:**
- Verify .env.production exists
- Check environment variables
- Review entrypoint.sh logs

### Database Connection Failed
**Symptoms:** App can't connect to database
**Diagnosis:**
- Check database status: `docker-compose ps db`
- Test connection: `docker-compose exec db pg_isready`
**Solutions:**
- Verify DATABASE_URL format
- Check database container running
- Review network configuration

### Health Check Failed
**Symptoms:** Container marked unhealthy
**Diagnosis:**
- Test endpoint: `curl localhost:3000/api/health`
- Check response time
**Solutions:**
- Review application logs
- Check database connectivity
- Verify port accessibility

### Out of Memory
**Symptoms:** Container killed, OOM errors
**Diagnosis:**
- Check memory: `docker stats`
- Review resource limits
**Solutions:**
- Increase VPS memory
- Optimize resource limits
- Review memory leaks

## Emergency Procedures

### Rollback Deployment
```bash
# Stop current deployment
./scripts/stop.sh

# Restore from backup
./scripts/restore.sh backups/backup-TIMESTAMP/

# Redeploy
./scripts/deploy.sh
```

### Force Restart
```bash
docker-compose restart
```

### Complete Reset
```bash
./scripts/stop.sh --remove-volumes
rm -rf backups/  # CAREFUL!
./scripts/deploy.sh
```
```

---

## Next Steps

After completion, proceed to docs-3 (clean VPS deployment test).
