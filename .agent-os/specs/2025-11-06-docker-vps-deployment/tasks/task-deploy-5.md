# Task: deploy-5 - Create restore.sh Restore Script

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Deployment Automation
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 35 minutes
**Dependencies:** deploy-4

---

## Description

Create database and media restoration script that safely restores from backup archives with validation and confirmation prompts.

---

## Specifics

**File:** `/home/edwin/development/ptnextjs/scripts/restore.sh`

**Features:**
- Restore PostgreSQL database
- Restore media files
- Backup validation before restore
- Confirmation prompt (safety)
- Pre-restore backup creation
- Rollback capability
- Restore verification

**Usage:**
```bash
./scripts/restore.sh <backup-path> [--force] [--skip-confirmation]
```

---

## Acceptance Criteria

- [ ] Script created with restore logic
- [ ] Database restoration (psql)
- [ ] Media restoration
- [ ] Backup validation
- [ ] Confirmation prompt
- [ ] Pre-restore backup
- [ ] Restore verification
- [ ] Error handling
- [ ] Force mode for automation
- [ ] Executable

---

## Implementation Notes

```bash
#!/bin/bash
set -e

BACKUP_PATH="$1"
FORCE=false
SKIP_CONFIRM=false

if [ -z "$BACKUP_PATH" ]; then
  log_error "Usage: $0 <backup-path> [--force] [--skip-confirmation]"
  exit 1
fi

for arg in "$@"; do
  case $arg in
    --force) FORCE=true ;;
    --skip-confirmation) SKIP_CONFIRM=true ;;
  esac
done

# Validate backup exists
if [ ! -d "$BACKUP_PATH" ]; then
  log_error "Backup not found: $BACKUP_PATH"
  exit 1
fi

if [ ! -f "${BACKUP_PATH}/database.sql.gz" ]; then
  log_error "Database backup not found in $BACKUP_PATH"
  exit 1
fi

# Confirmation
if [ "$SKIP_CONFIRM" = false ]; then
  echo "WARNING: This will restore from backup and OVERWRITE current data"
  echo "Backup: $BACKUP_PATH"
  read -p "Are you sure? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    log_info "Restore cancelled"
    exit 0
  fi
fi

# Create pre-restore backup
log_info "Creating pre-restore backup..."
./scripts/backup.sh

# Stop application
log_info "Stopping application..."
docker-compose stop app

# Restore database
log_info "Restoring database..."
gunzip -c "${BACKUP_PATH}/database.sql.gz" | docker-compose exec -T db psql -U payload -d payload
log_success "Database restored"

# Restore media
if [ -f "${BACKUP_PATH}/media.tar.gz" ]; then
  log_info "Restoring media files..."
  docker run --rm -v ptnextjs_media-uploads:/media -v "${BACKUP_PATH}:/backup" alpine tar xzf /backup/media.tar.gz -C /media
  log_success "Media restored"
fi

# Restart application
log_info "Restarting application..."
docker-compose start app

# Wait for health
sleep 10
if ./scripts/health-check.sh; then
  log_success "Restore completed successfully"
else
  log_error "Health check failed after restore"
  exit 1
fi
```

---

## Testing Requirements

```bash
# Create test data
# ... add some data via admin panel

# Create backup
./scripts/backup.sh

# Make changes
# ... modify data

# Restore backup
./scripts/restore.sh backups/backup-TIMESTAMP/

# Verify data restored
# ... check admin panel
```

---

## Next Steps

After implementation, proceed to deploy-6 (logs.sh script).
