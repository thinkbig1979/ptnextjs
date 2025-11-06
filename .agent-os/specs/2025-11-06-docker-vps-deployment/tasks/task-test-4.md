# Task: test-4 - Validate Backup/Restore Workflow

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Testing & Validation
**Status:** Not Started
**Assigned Agent:** quality-assurance
**Estimated Time:** 30 minutes
**Dependencies:** deploy-4, deploy-5

---

## Description

Manually validate complete backup and restore workflow functions correctly with real data and media files.

---

## Specifics

**Validation steps:**
1. Create test data in admin panel
2. Upload test media files
3. Run backup script
4. Modify/delete data
5. Run restore script
6. Verify data restored correctly

---

## Acceptance Criteria

- [ ] Backup script executes successfully
- [ ] Backup files created with correct structure
- [ ] Database backup is valid SQL
- [ ] Media backup is valid tar.gz
- [ ] Restore script executes successfully
- [ ] Database data restored correctly
- [ ] Media files restored correctly
- [ ] Application functional after restore
- [ ] Backup retention works (old backups cleaned)
- [ ] Pre-restore backup created

---

## Testing Requirements

```bash
# Step 1: Create test data
# - Login to admin panel
# - Create test vendor
# - Upload media file
# - Note vendor ID and media URL

# Step 2: Create backup
./scripts/backup.sh
ls -la backups/backup-*/

# Step 3: Modify data
# - Delete test vendor
# - Delete media file

# Step 4: Restore backup
./scripts/restore.sh backups/backup-LATEST/

# Step 5: Verify restoration
# - Check vendor exists
# - Check media file accessible
# - Test admin panel functionality

# Step 6: Test retention
# Create multiple backups over time
# Verify old backups cleaned after 7 days
```

---

## Evidence Requirements

- Backup creation logs
- Backup file listing
- Restore execution logs
- Before/after data comparison
- Media file verification
- Health check results

---

## Next Steps

After validation, proceed to test-5 (end-to-end integration test).
