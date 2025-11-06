# Task: deploy-4 - Create backup.sh Database Backup Script

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Deployment Automation
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 35 minutes
**Dependencies:** deploy-1

---

## Description

Create comprehensive backup script that exports PostgreSQL database and media files with compression, retention policy, and verification.

---

## Specifics

**File:** `/home/edwin/development/ptnextjs/scripts/backup.sh`

**Backup components:**
1. PostgreSQL database (pg_dump)
2. Media uploads directory
3. Environment configuration (sanitized)

**Features:**
- Timestamped backup archives
- Compression (gzip)
- Backup verification
- Retention policy (keep last 7 days)
- Backup location configuration
- Size reporting

**Backup format:**
```
backups/
├── backup-2025-11-06-123456/
│   ├── database.sql.gz
│   ├── media.tar.gz
│   └── backup-info.txt
```

---

## Acceptance Criteria

- [ ] Script created with pg_dump logic
- [ ] Database backup implementation
- [ ] Media files backup
- [ ] Compression (gzip)
- [ ] Timestamp in filename
- [ ] Backup verification
- [ ] Retention policy (7 days default)
- [ ] Backup info file (metadata)
- [ ] Size reporting
- [ ] Error handling
- [ ] Executable

---

## Implementation Notes

```bash
#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Timestamp
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
BACKUP_NAME="backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
mkdir -p "$BACKUP_PATH"

log_info "Creating backup: $BACKUP_NAME"

# Database backup
log_info "Backing up database..."
docker-compose exec -T db pg_dump -U payload payload | gzip > "${BACKUP_PATH}/database.sql.gz"
DB_SIZE=$(du -h "${BACKUP_PATH}/database.sql.gz" | cut -f1)
log_success "Database backup: $DB_SIZE"

# Media backup
log_info "Backing up media files..."
docker run --rm -v ptnextjs_media-uploads:/media -v "${BACKUP_PATH}:/backup" alpine tar czf /backup/media.tar.gz -C /media .
MEDIA_SIZE=$(du -h "${BACKUP_PATH}/media.tar.gz" | cut -f1)
log_success "Media backup: $MEDIA_SIZE"

# Backup info
cat > "${BACKUP_PATH}/backup-info.txt" <<EOF
Backup Information
==================
Timestamp: $(date -Iseconds)
Database Size: $DB_SIZE
Media Size: $MEDIA_SIZE
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "unknown")
EOF

# Cleanup old backups
log_info "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup-*" -mtime +$RETENTION_DAYS -exec rm -rf {} \;

log_success "Backup completed: $BACKUP_PATH"
ls -lh "$BACKUP_PATH"
```

**Key features:**
- PostgreSQL pg_dump via Docker exec
- Media files via Docker volume mount
- Compressed archives (gzip, tar.gz)
- Backup metadata file
- Automatic cleanup (7-day retention)
- Size reporting

**Backup verification:**
```bash
# Verify database backup
gunzip -t database.sql.gz

# Verify media backup
tar tzf media.tar.gz > /dev/null
```

---

## Testing Requirements

```bash
# Create backup
./scripts/backup.sh

# Verify backup created
ls -la backups/

# Check backup contents
ls -lh backups/backup-*/

# Test restoration (deploy-5)
./scripts/restore.sh backups/backup-TIMESTAMP/
```

---

## Next Steps

After implementation, proceed to deploy-5 (restore.sh script).
