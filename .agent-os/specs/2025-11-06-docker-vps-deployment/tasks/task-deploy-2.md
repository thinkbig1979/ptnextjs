# Task: deploy-2 - Create update.sh Update Script

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Deployment Automation
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 35 minutes
**Dependencies:** deploy-1

---

## Description

Create zero-downtime update script that pulls latest code, rebuilds images, and performs rolling update with health check validation and automatic rollback on failure.

---

## Specifics

**File:** `/home/edwin/development/ptnextjs/scripts/update.sh`

**Features:**
- Git pull latest changes
- Build new images
- Create backup of current state
- Rolling update (minimal downtime)
- Health check validation
- Automatic rollback on failure
- Deployment timestamp tracking

**Usage:**
```bash
./scripts/update.sh [--branch main] [--no-backup]
```

---

## Acceptance Criteria

- [ ] Script created with git pull logic
- [ ] Backup creation before update
- [ ] Image rebuild with new code
- [ ] Rolling update implementation
- [ ] Health check validation after update
- [ ] Automatic rollback on failure
- [ ] Update summary and logs
- [ ] Branch selection support
- [ ] Executable

---

## Implementation Notes

```bash
#!/bin/bash
set -e

BRANCH="main"
BACKUP=true

for arg in "$@"; do
  case $arg in
    --branch) BRANCH="$2"; shift 2 ;;
    --no-backup) BACKUP=false ;;
  esac
done

log_info "Updating application..."

# Backup current state
if [ "$BACKUP" = true ]; then
  log_info "Creating backup..."
  ./scripts/backup.sh
fi

# Pull latest code
log_info "Pulling latest changes from $BRANCH..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# Rebuild images
log_info "Rebuilding images..."
docker-compose build

# Rolling update
log_info "Performing rolling update..."
docker-compose up -d --no-deps app

# Wait for health
log_info "Waiting for new container to be healthy..."
sleep 15

if ! ./scripts/health-check.sh; then
  log_error "Health check failed, rolling back..."
  docker-compose restart app
  exit 1
fi

log_success "Update completed successfully"
docker-compose ps
```

---

## Next Steps

After implementation, proceed to deploy-3 (stop.sh script).
