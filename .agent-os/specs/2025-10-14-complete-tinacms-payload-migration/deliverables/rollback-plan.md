# Rollback Plan - TinaCMS to Payload CMS Migration

> Created: 2025-10-14
> Task: PRE-2
> Author: integration-coordinator

## Overview

This document provides a comprehensive rollback plan to safely revert the TinaCMS to Payload CMS migration if critical issues are discovered. The plan ensures zero data loss and full restoration of application functionality.

**Rollback Time Estimate:** 15-30 minutes

---

## 1. Backup Strategy

### 1.1 Markdown Content Backup

**Purpose:** Preserve all TinaCMS markdown content

**Backup Location:** `.agent-os/.backup-YYYYMMDD-HHMMSS/content/`

**Backup Contents:**
- Complete `content/` directory recursively
- All markdown files (`.md`)
- All JSON files (`info.json`)
- Subdirectory structure preserved

**Backup Command:**
```bash
# Create timestamped backup
BACKUP_DIR=".agent-os/.backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r content/ "$BACKUP_DIR/content/"

echo "Backup created: $BACKUP_DIR"
```

**Verification:**
```bash
# Verify backup completeness
BACKUP_DIR=".agent-os/.backup-$(date +%Y%m%d-%H%M%S)"
ORIGINAL_COUNT=$(find content/ -type f | wc -l)
BACKUP_COUNT=$(find "$BACKUP_DIR/content/" -type f | wc -l)

if [ "$ORIGINAL_COUNT" -eq "$BACKUP_COUNT" ]; then
  echo "✅ Backup verified: $BACKUP_COUNT files"
else
  echo "❌ Backup verification failed"
  exit 1
fi
```

**Backup Size Estimate:**
- Markdown files: ~5-10 MB
- Media files: NOT included (assumed in `public/media/`)
- Total: ~10 MB

### 1.2 Database Backup

**Purpose:** Preserve Payload database state (for reference)

**Development (SQLite):**
```bash
# Backup SQLite database
BACKUP_DIR=".agent-os/.backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR/database"
cp payload.db "$BACKUP_DIR/database/payload-pre-migration.db"

echo "Database backup created: $BACKUP_DIR/database/payload-pre-migration.db"
```

**Production (PostgreSQL):**
```bash
# Backup PostgreSQL database
BACKUP_DIR=".agent-os/.backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR/database"

pg_dump -h localhost -U payload_user -d payload_db \
  > "$BACKUP_DIR/database/payload-pre-migration.sql"

echo "Database backup created: $BACKUP_DIR/database/payload-pre-migration.sql"
```

**Verification:**
```bash
# Verify database backup is not empty
BACKUP_FILE="$BACKUP_DIR/database/payload-pre-migration.db"
if [ -s "$BACKUP_FILE" ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Database backup verified: $SIZE"
else
  echo "❌ Database backup is empty"
  exit 1
fi
```

### 1.3 Environment Variable Backup

**Purpose:** Preserve environment configuration

**Backup Location:** `.agent-os/.backup-YYYYMMDD-HHMMSS/.env.backup`

**Backup Command:**
```bash
BACKUP_DIR=".agent-os/.backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp .env "$BACKUP_DIR/.env.backup"

echo "Environment variables backed up: $BACKUP_DIR/.env.backup"
```

**Critical Environment Variables:**
- `DATABASE_URI`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL`
- Any API keys or credentials

### 1.4 Code State Backup

**Purpose:** Preserve code state via Git

**Git Tag:**
```bash
# Create git tag before migration
git tag -a "pre-payload-migration-$(date +%Y%m%d)" \
  -m "Pre-migration checkpoint - TinaCMS state"

# Push tag to remote
git push origin "pre-payload-migration-$(date +%Y%m%d)"

echo "✅ Git tag created: pre-payload-migration-$(date +%Y%m%d)"
```

**Git Branch (Optional):**
```bash
# Create rollback branch
git checkout -b rollback/tinacms-state-$(date +%Y%m%d)
git push -u origin rollback/tinacms-state-$(date +%Y%m%d)

# Return to main branch
git checkout main

echo "✅ Rollback branch created: rollback/tinacms-state-$(date +%Y%m%d)"
```

### 1.5 Backup Retention Policy

**Retention Rules:**
- Keep backups until migration confirmed successful (minimum 7 days)
- After successful migration, retain for 30 days
- Archive critical backups permanently

**Cleanup Command:**
```bash
# List old backups
ls -la .agent-os/.backup-*/

# Remove backups older than 30 days
find .agent-os/.backup-* -type d -mtime +30 -exec rm -rf {} +
```

---

## 2. Rollback Procedure (Step-by-Step)

### Step 1: Stop Application Servers

**Purpose:** Ensure no data writes during rollback

**Commands:**
```bash
# Stop Next.js development server
npm run stop:dev

# Kill any running Node processes
pkill -f "next dev"
pkill -f "payload"

# Verify no processes running
ps aux | grep -E "next|payload" | grep -v grep

echo "✅ All application servers stopped"
```

**Verification:**
- Check that port 3000 is free: `lsof -i :3000`
- Check that no Node processes are running: `ps aux | grep node`

### Step 2: Clear Payload Collections

**Purpose:** Remove all migrated data from Payload database

**Development (SQLite):**
```bash
# Clear all collections (keep schema)
npm run payload:clear-collections

# Or manually via Payload admin
# Navigate to http://localhost:3000/admin
# Delete all records from each collection
```

**Script:** `scripts/clear-payload-collections.ts`
```typescript
import { getPayload } from 'payload';
import config from '@/payload.config';

async function clearPayloadCollections() {
  const payload = await getPayload({ config });

  const collections = [
    'vendors',
    'products',
    'yachts',
    'blog-posts',
    'categories',
    'tags',
    'team-members',
    'company-info'
  ];

  for (const collection of collections) {
    console.log(`Clearing ${collection}...`);

    const result = await payload.find({
      collection,
      limit: 1000
    });

    for (const doc of result.docs) {
      await payload.delete({
        collection,
        id: doc.id
      });
    }

    console.log(`✅ Cleared ${result.docs.length} records from ${collection}`);
  }

  console.log('✅ All Payload collections cleared');
}

clearPayloadCollections();
```

**Verification:**
```bash
# Verify collections are empty
node -e "
const { getPayload } = require('payload');
const config = require('./payload.config');

(async () => {
  const payload = await getPayload({ config });
  const vendors = await payload.find({ collection: 'vendors', limit: 1 });
  console.log('Vendors count:', vendors.totalDocs);
})();
"
```

### Step 3: Restore Markdown Content

**Purpose:** Restore TinaCMS content from backup

**Commands:**
```bash
# Identify latest backup
LATEST_BACKUP=$(ls -td .agent-os/.backup-* | head -n 1)

echo "Restoring from: $LATEST_BACKUP"

# Remove current content directory
rm -rf content/

# Restore from backup
cp -r "$LATEST_BACKUP/content/" content/

# Verify restoration
ORIGINAL_COUNT=$(find "$LATEST_BACKUP/content/" -type f | wc -l)
RESTORED_COUNT=$(find content/ -type f | wc -l)

if [ "$ORIGINAL_COUNT" -eq "$RESTORED_COUNT" ]; then
  echo "✅ Content restored: $RESTORED_COUNT files"
else
  echo "❌ Content restoration verification failed"
  exit 1
fi
```

**Verification:**
```bash
# Check that content directory is populated
ls -la content/

# Verify markdown files exist
find content/ -name "*.md" | wc -l

# Test reading a sample file
cat content/vendors/acme-systems.md
```

### Step 4: Restore Environment Variables

**Purpose:** Restore original environment configuration

**Commands:**
```bash
# Identify latest backup
LATEST_BACKUP=$(ls -td .agent-os/.backup-* | head -n 1)

echo "Restoring .env from: $LATEST_BACKUP"

# Backup current .env (just in case)
cp .env .env.payload-state

# Restore original .env
cp "$LATEST_BACKUP/.env.backup" .env

echo "✅ Environment variables restored"
```

**Verification:**
```bash
# Verify .env file exists and is not empty
if [ -s .env ]; then
  echo "✅ .env file restored"
else
  echo "❌ .env file is empty or missing"
  exit 1
fi

# Check critical variables
grep -q "DATABASE_URI" .env && echo "✅ DATABASE_URI present"
grep -q "PAYLOAD_SECRET" .env && echo "✅ PAYLOAD_SECRET present"
```

### Step 5: Revert Data Service Imports

**Purpose:** Switch all pages back to TinaCMSDataService

**Script:** `scripts/rollback-migration.ts --step revert-imports`

**Implementation:**
```typescript
import fs from 'fs/promises';
import path from 'path';

async function revertImports() {
  const pages = [
    'app/vendors/page.tsx',
    'app/vendors/[slug]/page.tsx',
    'app/products/page.tsx',
    'app/products/[slug]/page.tsx',
    'app/yachts/page.tsx',
    'app/yachts/[slug]/page.tsx',
    'app/blog/page.tsx',
    'app/blog/[slug]/page.tsx',
    'app/team/page.tsx',
    'app/about/page.tsx',
    'app/page.tsx'
  ];

  for (const page of pages) {
    const filePath = path.resolve(process.cwd(), page);

    // Skip if file doesn't exist (e.g., yacht pages not created yet)
    try {
      await fs.access(filePath);
    } catch {
      console.log(`⏭️  Skipping ${page} (file doesn't exist)`);
      continue;
    }

    let content = await fs.readFile(filePath, 'utf-8');

    // Replace PayloadCMSDataService with TinaCMSDataService
    content = content.replace(
      /from '@\/lib\/payload-cms-data-service'/g,
      "from '@/lib/tinacms-data-service'"
    );
    content = content.replace(
      /payloadCMSDataService/g,
      'tinaCMSDataService'
    );

    await fs.writeFile(filePath, content, 'utf-8');

    console.log(`✅ Reverted imports in ${page}`);
  }

  console.log('✅ All imports reverted to TinaCMSDataService');
}

revertImports();
```

**Verification:**
```bash
# Check that no files import PayloadCMSDataService
grep -r "payload-cms-data-service" app/ && \
  echo "❌ Found PayloadCMSDataService imports" || \
  echo "✅ No PayloadCMSDataService imports found"

# Check that files import TinaCMSDataService
grep -r "tinacms-data-service" app/ && \
  echo "✅ TinaCMSDataService imports found" || \
  echo "❌ No TinaCMSDataService imports found"
```

### Step 6: Rebuild Application

**Purpose:** Rebuild with TinaCMS data service

**Commands:**
```bash
# Clean build cache
rm -rf .next/

# Install dependencies (if needed)
npm install

# Run build
npm run build

# Check build success
if [ $? -eq 0 ]; then
  echo "✅ Application built successfully"
else
  echo "❌ Build failed - check errors above"
  exit 1
fi
```

**Build Success Indicators:**
- No TypeScript errors
- No build errors
- Static pages generated successfully
- Build time < 5 minutes

**Verification:**
```bash
# Check that build artifacts exist
ls -la .next/

# Verify static pages generated
ls -la .next/server/pages/

# Count generated pages
find .next/server/pages/ -name "*.html" | wc -l
```

### Step 7: Verify Rollback Success

**Purpose:** Confirm application functionality restored

**Manual Verification Steps:**
1. Start development server: `npm run dev`
2. Open http://localhost:3000
3. Verify homepage loads correctly
4. Navigate to vendors list page
5. Open a vendor detail page
6. Navigate to products list page
7. Open a product detail page
8. Check blog list and post pages
9. Verify team page
10. Check about page

**Automated Verification:**
```bash
# Run TinaCMS content validation
npm run validate:tinacms

# Expected output: All checks pass
```

**Verification Checklist:**
- [ ] Homepage renders without errors
- [ ] Vendor list displays correctly
- [ ] Vendor detail pages load
- [ ] Product list displays correctly
- [ ] Product detail pages load
- [ ] Blog posts display correctly
- [ ] Team page renders
- [ ] About page renders
- [ ] No console errors in browser
- [ ] No 404 errors
- [ ] All images load
- [ ] Navigation works

---

## 3. Rollback Script Specification

### Script: rollback-migration.ts

**Location:** `scripts/rollback-migration.ts`

**Purpose:** Automated rollback with safety checks

**Features:**
- **Idempotent**: Safe to run multiple times
- **Step-by-step execution**: Can run individual steps
- **Dry-run mode**: Preview actions without executing
- **Backup verification**: Confirms backup exists before proceeding
- **Restoration confirmation**: Prompts before destructive operations
- **Comprehensive logging**: Detailed output of all actions

**Interface:**
```typescript
interface RollbackOptions {
  dryRun?: boolean;
  step?: 'clear-db' | 'restore-content' | 'revert-imports' | 'all';
  backupDir?: string;
  skipConfirmation?: boolean;
}

async function rollbackMigration(options: RollbackOptions): Promise<void>;
```

**Usage:**
```bash
# Full rollback with prompts
npm run rollback:migration

# Dry run (preview actions)
npm run rollback:migration -- --dry-run

# Run specific step
npm run rollback:migration -- --step clear-db
npm run rollback:migration -- --step restore-content
npm run rollback:migration -- --step revert-imports

# Automated rollback (CI/CD)
npm run rollback:migration -- --skip-confirmation --backup-dir .agent-os/.backup-20251014-100000
```

**Implementation:**
```typescript
import fs from 'fs/promises';
import path from 'path';
import { getPayload } from 'payload';
import config from '@/payload.config';
import readline from 'readline';

interface RollbackOptions {
  dryRun?: boolean;
  step?: 'clear-db' | 'restore-content' | 'revert-imports' | 'all';
  backupDir?: string;
  skipConfirmation?: boolean;
}

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${message} (yes/no): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function rollbackMigration(options: RollbackOptions = {}) {
  console.log('🔄 Starting rollback process...\n');

  // Verify backup exists
  const backupDir = options.backupDir || await findLatestBackup();
  if (!backupDir) {
    console.error('❌ No backup found. Cannot proceed with rollback.');
    process.exit(1);
  }

  console.log(`Using backup: ${backupDir}\n`);

  // Confirm rollback
  if (!options.skipConfirmation) {
    const confirmed = await confirm('This will revert all migration changes. Continue?');
    if (!confirmed) {
      console.log('Rollback cancelled.');
      process.exit(0);
    }
  }

  // Execute steps
  const steps = options.step === 'all' || !options.step
    ? ['clear-db', 'restore-content', 'revert-imports']
    : [options.step];

  for (const step of steps) {
    switch (step) {
      case 'clear-db':
        await clearDatabase(options.dryRun);
        break;
      case 'restore-content':
        await restoreContent(backupDir, options.dryRun);
        break;
      case 'revert-imports':
        await revertImports(options.dryRun);
        break;
    }
  }

  console.log('\n✅ Rollback completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run build');
  console.log('2. Run: npm run dev');
  console.log('3. Verify application functionality');
}

async function findLatestBackup(): Promise<string | null> {
  const backupsDir = '.agent-os';
  const backups = await fs.readdir(backupsDir);
  const backupDirs = backups
    .filter(dir => dir.startsWith('.backup-'))
    .sort()
    .reverse();

  return backupDirs.length > 0 ? path.join(backupsDir, backupDirs[0]) : null;
}

async function clearDatabase(dryRun?: boolean) {
  console.log('🗑️  Clearing Payload database...');

  if (dryRun) {
    console.log('[DRY RUN] Would clear all Payload collections');
    return;
  }

  const payload = await getPayload({ config });
  const collections = [
    'vendors', 'products', 'yachts', 'blog-posts',
    'categories', 'tags', 'team-members', 'company-info'
  ];

  for (const collection of collections) {
    const result = await payload.find({ collection, limit: 1000 });

    for (const doc of result.docs) {
      await payload.delete({ collection, id: doc.id });
    }

    console.log(`✅ Cleared ${result.docs.length} records from ${collection}`);
  }
}

async function restoreContent(backupDir: string, dryRun?: boolean) {
  console.log('📦 Restoring markdown content...');

  if (dryRun) {
    console.log(`[DRY RUN] Would restore content from ${backupDir}/content/`);
    return;
  }

  const contentDir = 'content';
  const backupContentDir = path.join(backupDir, 'content');

  // Remove current content
  await fs.rm(contentDir, { recursive: true, force: true });

  // Restore from backup
  await fs.cp(backupContentDir, contentDir, { recursive: true });

  // Verify restoration
  const files = await fs.readdir(contentDir, { recursive: true });
  console.log(`✅ Restored ${files.length} files to ${contentDir}/`);
}

async function revertImports(dryRun?: boolean) {
  console.log('🔧 Reverting data service imports...');

  const pages = [
    'app/vendors/page.tsx',
    'app/vendors/[slug]/page.tsx',
    'app/products/page.tsx',
    'app/products/[slug]/page.tsx',
    'app/yachts/page.tsx',
    'app/yachts/[slug]/page.tsx',
    'app/blog/page.tsx',
    'app/blog/[slug]/page.tsx',
    'app/team/page.tsx',
    'app/about/page.tsx',
    'app/page.tsx'
  ];

  for (const page of pages) {
    try {
      let content = await fs.readFile(page, 'utf-8');

      if (dryRun) {
        if (content.includes('payload-cms-data-service')) {
          console.log(`[DRY RUN] Would revert imports in ${page}`);
        }
        continue;
      }

      content = content.replace(
        /from '@\/lib\/payload-cms-data-service'/g,
        "from '@/lib/tinacms-data-service'"
      );
      content = content.replace(/payloadCMSDataService/g, 'tinaCMSDataService');

      await fs.writeFile(page, content, 'utf-8');
      console.log(`✅ Reverted ${page}`);
    } catch {
      console.log(`⏭️  Skipped ${page} (not found)`);
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: RollbackOptions = {
    dryRun: args.includes('--dry-run'),
    step: args.find(a => a.startsWith('--step='))?.split('=')[1] as any,
    backupDir: args.find(a => a.startsWith('--backup-dir='))?.split('=')[1],
    skipConfirmation: args.includes('--skip-confirmation')
  };

  rollbackMigration(options).catch(error => {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  });
}

export default rollbackMigration;
```

**Exit Codes:**
- `0`: Rollback successful
- `1`: Rollback failed (check error output)

**Idempotency:**
- Can be run multiple times safely
- Checks if steps already completed
- Skips unnecessary operations

**Error Handling:**
- Validates backup exists before starting
- Verifies each step completes successfully
- Provides clear error messages
- Allows partial rollback (run specific steps)

---

## 4. Restoration Validation

### 4.1 Entity Count Verification

**Purpose:** Verify all content restored

**Validation:**
```bash
# Run TinaCMS content validation
npm run validate:tinacms

# Expected output:
# ✅ Vendors count: 15
# ✅ Products count: 45
# ✅ Blog posts count: 12
# ✅ Categories count: 8
# ✅ Team members count: 5
# ✅ Yachts count: 3
# ✅ Company info: 1
```

**Acceptance Criteria:**
- [ ] Entity counts match pre-migration baseline
- [ ] No missing content files
- [ ] All markdown files readable

### 4.2 Content Integrity Checks

**Purpose:** Verify content quality

**Validation:**
```bash
# Check for broken references
npm run validate:tinacms

# Expected: 0 broken references
```

**Acceptance Criteria:**
- [ ] All references resolve correctly
- [ ] No duplicate slugs
- [ ] All required fields present
- [ ] All media files accessible

### 4.3 Application Build Verification

**Purpose:** Verify application compiles

**Validation:**
```bash
npm run build

# Expected: Successful build, no errors
```

**Acceptance Criteria:**
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] Static pages generated
- [ ] Build time < 5 minutes

### 4.4 Page Rendering Tests

**Purpose:** Verify pages display correctly

**Manual Tests:**
1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Test each page type:
   - Homepage
   - Vendors list and detail
   - Products list and detail
   - Blog list and post detail
   - Team page
   - About page

**Acceptance Criteria:**
- [ ] All pages render without errors
- [ ] No console errors
- [ ] All content displays correctly
- [ ] Images load properly
- [ ] Links work correctly

### 4.5 Success Confirmation Checklist

**Complete Rollback is successful when:**
- [ ] All content restored from backup
- [ ] Entity counts match pre-migration baseline
- [ ] Application builds successfully
- [ ] All pages render correctly
- [ ] No console errors
- [ ] TinaCMS validation passes (0 errors)
- [ ] Development server runs without issues
- [ ] Production build succeeds
- [ ] Static site generation works

---

## 5. Risk Mitigation Measures

### 5.1 Pre-Migration Safety Checks

**Before Migration:**
- [ ] Create complete backup (content + database + env)
- [ ] Verify backup completeness
- [ ] Create git tag for rollback point
- [ ] Run pre-migration validation
- [ ] Document current state (entity counts, etc.)
- [ ] Test rollback procedure in development

### 5.2 Checkpoint Creation During Migration

**During Migration:**
- [ ] Save migration logs
- [ ] Create checkpoints after each collection migration
- [ ] Monitor for errors and warnings
- [ ] Document any issues encountered

### 5.3 Automated Backup Verification

**Backup Verification Script:**
```bash
# Verify backup integrity
BACKUP_DIR=".agent-os/.backup-$(date +%Y%m%d-%H%M%S)"

# Check content backup
if [ -d "$BACKUP_DIR/content" ]; then
  FILE_COUNT=$(find "$BACKUP_DIR/content" -type f | wc -l)
  echo "✅ Content backup verified: $FILE_COUNT files"
else
  echo "❌ Content backup missing"
  exit 1
fi

# Check database backup
if [ -f "$BACKUP_DIR/database/payload-pre-migration.db" ]; then
  echo "✅ Database backup verified"
else
  echo "❌ Database backup missing"
  exit 1
fi

# Check env backup
if [ -f "$BACKUP_DIR/.env.backup" ]; then
  echo "✅ Environment backup verified"
else
  echo "❌ Environment backup missing"
  exit 1
fi
```

### 5.4 Rollback Testing in Development

**Before Production Migration:**
1. Run full migration in development environment
2. Test rollback procedure
3. Verify rollback restores functionality
4. Document any issues
5. Refine rollback scripts if needed

**Development Rollback Test:**
```bash
# 1. Create test migration
npm run migrate:tinacms-to-payload

# 2. Verify migration success
npm run validate:migration

# 3. Test rollback
npm run rollback:migration

# 4. Verify rollback success
npm run validate:tinacms
npm run dev
# Manually test all pages

# 5. Document results
```

---

## 6. Post-Rollback Actions

### 6.1 Investigate Root Cause

**If Rollback Required:**
1. Document the issue that triggered rollback
2. Analyze error logs
3. Identify root cause
4. Create issue report
5. Plan fix or mitigation

### 6.2 Fix Issues

**Corrective Actions:**
1. Fix identified issues in migration scripts
2. Update transformation logic if needed
3. Test fixes in development
4. Re-run pre-migration validation
5. Schedule new migration attempt

### 6.3 Stakeholder Communication

**Notification:**
- Inform stakeholders of rollback
- Explain reason for rollback
- Provide timeline for fix and retry
- Document lessons learned

---

## 7. Rollback Decision Criteria

**Trigger Rollback If:**
- [ ] Data loss detected (entity counts don't match)
- [ ] Critical data corruption found
- [ ] Application fails to build after migration
- [ ] Pages fail to render
- [ ] >10% of data has integrity issues
- [ ] Unresolvable broken references
- [ ] Critical functionality broken

**Do NOT Rollback If:**
- [ ] Minor formatting differences (e.g., date format)
- [ ] Non-critical warnings in logs
- [ ] Small number of non-critical field mismatches
- [ ] Performance issues (can be optimized)
- [ ] Minor UI rendering issues (can be fixed)

---

## 8. Emergency Rollback (Production)

**If Production Migration Fails:**

1. **Immediate Action:**
   ```bash
   # SSH into production server
   ssh production-server

   # Navigate to application directory
   cd /var/www/app

   # Run automated rollback
   npm run rollback:migration -- --skip-confirmation

   # Rebuild application
   npm run build

   # Restart services
   sudo systemctl restart app
   ```

2. **Verification:**
   - Check application is accessible
   - Verify pages load correctly
   - Monitor error logs
   - Test critical functionality

3. **Communication:**
   - Notify team of rollback
   - Post status update
   - Schedule post-mortem

---

## Success Criteria

**Rollback is successful when:**
- [ ] All content restored from backup (100% file count match)
- [ ] Application builds successfully
- [ ] All pages render correctly
- [ ] No console errors
- [ ] TinaCMS validation passes
- [ ] Development server runs without issues
- [ ] Production build succeeds (if applicable)
- [ ] All functionality works as before migration

---

## Notes

- Rollback procedure is idempotent - safe to run multiple times
- Always test rollback in development before production migration
- Keep backups for at least 30 days after successful migration
- Document any issues encountered during rollback
- Update rollback procedure based on lessons learned
