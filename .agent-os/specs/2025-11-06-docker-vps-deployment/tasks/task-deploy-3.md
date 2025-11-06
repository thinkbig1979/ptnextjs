# Task: deploy-3 - Create stop.sh Graceful Shutdown Script

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Deployment Automation
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 20 minutes
**Dependencies:** deploy-1

---

## Description

Create graceful shutdown script that stops containers safely, allowing in-flight requests to complete and database connections to close properly.

---

## Specifics

**File:** `/home/edwin/development/ptnextjs/scripts/stop.sh`

**Features:**
- Graceful container shutdown (SIGTERM)
- Wait for in-flight requests
- Database connection cleanup
- Volume preservation
- Status reporting

**Usage:**
```bash
./scripts/stop.sh [--remove-volumes] [--timeout 30]
```

---

## Acceptance Criteria

- [ ] Script created with graceful stop logic
- [ ] SIGTERM signal handling
- [ ] Timeout configuration
- [ ] Volume preservation by default
- [ ] Optional volume removal
- [ ] Status logging
- [ ] Executable

---

## Implementation Notes

```bash
#!/bin/bash
set -e

TIMEOUT=30
REMOVE_VOLUMES=false

for arg in "$@"; do
  case $arg in
    --remove-volumes) REMOVE_VOLUMES=true ;;
    --timeout) TIMEOUT="$2"; shift 2 ;;
  esac
done

log_info "Stopping application gracefully (timeout: ${TIMEOUT}s)..."

# Stop containers with timeout
docker-compose stop -t "$TIMEOUT"

log_success "Containers stopped"

# Optionally remove volumes
if [ "$REMOVE_VOLUMES" = true ]; then
  log_info "Removing volumes..."
  docker-compose down -v
  log_success "Volumes removed"
else
  log_info "Volumes preserved (use --remove-volumes to delete)"
fi

docker-compose ps -a
```

---

## Next Steps

After implementation, proceed to deploy-4 (backup.sh script).
