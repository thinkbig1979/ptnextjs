# TinaCMS to Payload CMS Migration Scripts

Comprehensive migration tooling to convert all TinaCMS markdown content to Payload CMS database collections.

## Overview

This migration system automates the conversion of markdown-based content (TinaCMS) to a Payload CMS database-backed system. It handles all content types, preserves relationships, validates data integrity, and provides rollback capabilities.

### What Gets Migrated

- **Vendors** - Company profiles with tier-based features
- **Products** - Product catalog with vendor relationships
- **Categories** - Product and blog categorization
- **Blog Posts** - Content articles
- **Team Members** - Team profiles
- **Company Info** - Company information

## Prerequisites

Before running the migration, ensure you have:

- **Node.js 22 LTS** installed
- **TypeScript/tsx** installed (`npm install -g tsx`)
- **Payload CMS** configured and running
- **PostgreSQL database** connection established
- **Environment variables** configured in `.env` file:
  ```env
  DATABASE_URL=postgresql://user:password@localhost:5432/dbname
  PAYLOAD_SECRET=your-secret-key
  ```

## Migration Scripts

### Master Orchestrator

**`migrate-all.ts`** - Migrates all content types in correct dependency order

Features:
- Automatic backup creation before migration
- Validates all data before database insertion
- Generates comprehensive migration report
- Supports dry-run mode for testing
- Handles errors with automatic rollback

### Utilities

**`utils/markdown-parser.ts`** - Parses markdown files with gray-matter
- Extracts frontmatter and content
- Generates slugs from filenames
- Transforms media paths to public URLs
- Resolves content references

**`utils/validation.ts`** - Validates data against Payload schemas
- Validates required fields
- Checks max length constraints
- Validates email/URL formats
- Enforces tier restrictions

**`utils/backup.ts`** - Creates and restores backups
- Timestamped backup creation
- Backup restoration
- Rollback support

## Running Migrations

### Full Migration (Recommended)

```bash
# Standard migration with automatic backup
tsx scripts/migration/migrate-all.ts

# Dry-run mode (validate without database changes)
tsx scripts/migration/migrate-all.ts --dry-run

# Skip backup (faster, but risky - not recommended)
tsx scripts/migration/migrate-all.ts --skip-backup

# Combine flags
tsx scripts/migration/migrate-all.ts --dry-run --skip-backup
```

### Using npm Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "migrate": "tsx scripts/migration/migrate-all.ts",
    "migrate:dry-run": "tsx scripts/migration/migrate-all.ts --dry-run"
  }
}
```

Then run:
```bash
npm run migrate
npm run migrate:dry-run
```

## Migration Order

Collections are migrated in this specific order to respect dependencies:

1. **Categories** (no dependencies)
2. **Vendors** (no dependencies)
3. **Products** (depends on Vendors)
4. **Blog Posts** (optional: depends on Categories)
5. **Team Members** (no dependencies)
6. **Company Info** (no dependencies)

> **Important**: Products must be migrated after Vendors because they contain vendor relationships.

## Dry-Run Mode

Dry-run mode validates all data and simulates the migration without making any database changes.

### When to Use Dry-Run

- **Testing** - Verify migration logic before committing changes
- **Validation** - Check for data integrity issues
- **Preview** - See what will be migrated
- **Debugging** - Troubleshoot migration errors

### Dry-Run Output

```bash
tsx scripts/migration/migrate-all.ts --dry-run

# Output:
⚠️  DRY RUN MODE - No changes will be made to database

📦 Migrating Vendors...
  ✅ test-marine-supplier
  ✅ yacht-tech-solutions

📦 Migrating Products...
  ✅ advanced-navigation-system-xr2000
  ✅ marine-radar-pro-500

=======================================================
📊 MIGRATION REPORT
=======================================================

vendors:
  ✅ Success: 2
  ❌ Failed: 0

products:
  ✅ Success: 2
  ❌ Failed: 0

Total Success: 4
Total Failed: 0
=======================================================
```

### Transitioning to Real Migration

After dry-run succeeds, run without the flag:
```bash
tsx scripts/migration/migrate-all.ts
```

## Backup and Rollback

### Automatic Backup

A backup is automatically created before each migration (unless `--skip-backup` is used).

**Backup Details:**
- **Format**: `backup-YYYY-MM-DDTHH-MM-SS`
- **Location**: `backups/` directory
- **Contents**: Complete copy of `content/` directory
- **Timestamp**: ISO format without colons/dots

**Example**:
```
backups/
  backup-2024-10-12T14-30-00/
    vendors/
      test-marine-supplier.md
      yacht-tech-solutions.md
    products/
      navigation-system.md
    ...
```

### Manual Rollback

List available backups:
```bash
ls backups/
```

Restore from backup:
```bash
# Replace 'content/' with backup
cp -r backups/backup-2024-10-12T14-30-00 content/
```

### Automatic Rollback

Migrations automatically rollback on error:

1. **Error occurs** during migration
2. **Database changes** are reverted (if within transaction)
3. **Content restored** from backup
4. **Error logged** for debugging

```
❌ Failed to migrate products: Vendor not found: non-existent-vendor
♻️ Rolling back from backup: backups/backup-2024-10-12T14-30-00
✅ Backup restored successfully
```

## Migration Report

After migration completes, a detailed report is generated:

```
=============================================================
📊 MIGRATION REPORT
=============================================================

categories:
  ✅ Success: 5
  ❌ Failed: 0

vendors:
  ✅ Success: 25
  ❌ Failed: 2
  Errors:
    - vendor-abc: Validation error: contactEmail is required
    - vendor-xyz: companyName exceeds maximum length of 255 characters

products:
  ✅ Success: 150
  ❌ Failed: 3
  Errors:
    - product-123: Vendor not found: missing-vendor
    - product-456: Validation error: name is required
    - product-789: Vendor not found: deleted-vendor

blog-posts:
  ✅ Success: 45
  ❌ Failed: 0

team-members:
  ✅ Success: 8
  ❌ Failed: 0

company-info:
  ✅ Success: 1
  ❌ Failed: 0

=============================================================
Total Success: 234
Total Failed: 5
=============================================================
```

### Report Interpretation

- **✅ Success**: Items migrated successfully
- **❌ Failed**: Items that failed validation or migration
- **Errors**: Specific error messages for each failed item

## Troubleshooting

### Common Issues

#### Issue: "Vendor not found" during product migration

**Cause**: Product references a vendor that doesn't exist or wasn't migrated

**Solution**:
1. Check vendor reference in product markdown: `vendor: content/vendors/company-name.md`
2. Verify vendor markdown file exists: `content/vendors/company-name.md`
3. Ensure vendors migrated successfully before products
4. Run vendor migration first: `tsx scripts/migration/migrate-all.ts` (it migrates vendors before products)

#### Issue: "Validation error: contactEmail is required"

**Cause**: Vendor markdown missing required field

**Solution**: Update markdown file with missing field
```markdown
---
name: "Company Name"
contactEmail: "contact@company.com"  # Add this
---
```

#### Issue: "Database connection failed"

**Cause**: PostgreSQL not running or incorrect DATABASE_URL

**Solution**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   ```
3. Test connection: `psql $DATABASE_URL`

#### Issue: "Permission denied" on backup creation

**Cause**: No write permissions on `backups/` directory

**Solution**:
```bash
mkdir -p backups
chmod 755 backups
```

#### Issue: Media paths not resolving

**Cause**: Media files don't exist in `public/media/` directory

**Solution**:
1. Verify media files exist: `ls public/media/vendors/`
2. Copy missing files to `public/media/`
3. Update markdown paths if necessary

#### Issue: Duplicate slug errors

**Cause**: Migration run multiple times or slugs not unique

**Solution**:
1. Run dry-run to identify duplicates: `tsx scripts/migration/migrate-all.ts --dry-run`
2. Clear database collections before re-running
3. Ensure markdown files have unique slugs

## Validation Rules

### Vendors

**Required Fields:**
- `user` (relationship ID)
- `tier` ('free' | 'tier1' | 'tier2')
- `companyName`
- `slug` (unique)
- `contactEmail` (valid email format)

**Max Lengths:**
- `companyName`: 255 chars
- `slug`: 255 chars
- `description`: 5000 chars
- `logo`: 500 chars
- `contactEmail`: 255 chars
- `contactPhone`: 50 chars

**Tier Restrictions:**
- `website`, `linkedinUrl`, `twitterUrl`, `certifications`: Tier 1+ only

### Products

**Required Fields:**
- `name`
- `vendor` (relationship ID)
- `slug` (unique)

**Max Lengths:**
- `name`: 255 chars
- `slug`: 255 chars

### Categories

**Required Fields:**
- `name`
- `slug` (unique)

**Max Lengths:**
- `name`: 255 chars
- `slug`: 255 chars
- `description`: 500 chars
- `icon`: 100 chars
- `color`: 50 chars

### Blog Posts

**Required Fields:**
- `title`
- `slug` (unique)
- `content`

**Max Lengths:**
- `title`: 255 chars
- `slug`: 255 chars
- `excerpt`: 500 chars

### Team Members

**Required Fields:**
- `name`
- `role`

**Max Lengths:**
- `name`: 255 chars
- `role`: 255 chars
- `bio`: 1000 chars
- `image`: 500 chars
- `email`: 255 chars (valid email if provided)

### Company Info

**Required Fields:**
- `name`
- `email` (valid email format)

**Max Lengths:**
- `name`: 255 chars
- `email`: 255 chars

## Data Transformation

### Frontmatter to Payload Schema Mapping

**Vendor Transformation:**
```markdown
# TinaCMS (Markdown)
---
name: "Marine Tech Co."
slug: "marine-tech-co"
contactEmail: "info@marinetech.com"
logo: "vendors/logo.png"
---
```

```javascript
// Payload CMS (Database)
{
  companyName: "Marine Tech Co.",
  slug: "marine-tech-co",
  contactEmail: "info@marinetech.com",
  logo: "/media/vendors/logo.png",
  tier: "free",
  published: false,
  user: "user-id-123"
}
```

### Media Path Transformation

Media paths are automatically transformed:

- **Relative**: `vendors/logo.png` → `/media/vendors/logo.png`
- **Already prefixed**: `/media/logo.png` → `/media/logo.png`
- **HTTP/HTTPS**: `https://cdn.example.com/logo.png` → `https://cdn.example.com/logo.png`
- **Empty**: `""` → `""`

### Reference Resolution

Content references are resolved to slugs:

```
content/vendors/test-marine-supplier.md → test-marine-supplier
content/products/navigation-system.md → navigation-system
```

### Slug Generation

Slugs are generated from filenames if not in frontmatter:

```
company-name-123.md → company-name-123
Test & File.md → test-file
---special--chars___.md → special-chars
```

### Default Values

Default values applied during migration:

- `published`: `false` (admin must approve)
- `tier`: `'free'` (for vendors)
- `featured`: `false`
- `order`: `999` (for team members)

## Testing the Migration

### Step-by-Step Testing

1. **Run dry-run first**:
   ```bash
   tsx scripts/migration/migrate-all.ts --dry-run
   ```

2. **Check migration report**:
   - Verify success counts match expected
   - Review any error messages
   - Confirm all collections processed

3. **Fix any issues**:
   - Update markdown files with missing fields
   - Fix validation errors
   - Resolve reference issues

4. **Run real migration**:
   ```bash
   tsx scripts/migration/migrate-all.ts
   ```

5. **Verify in Payload admin**:
   - Navigate to `http://localhost:3000/admin`
   - Check each collection
   - Verify data accuracy
   - Test relationships (product → vendor)

6. **Test media URLs**:
   - Check vendor logos load
   - Verify product images display
   - Confirm paths are correct

7. **Review unpublished content**:
   - Products default to `published: false`
   - Blog posts default to `published: false`
   - Admin must approve before public visibility

## Post-Migration Steps

### 1. Verify Content in Payload Admin

- [ ] Login to Payload admin: `http://localhost:3000/admin`
- [ ] Check Vendors collection
- [ ] Check Products collection
- [ ] Verify vendor-product relationships
- [ ] Check Categories, Blog Posts, Team Members, Company Info

### 2. Test Relationships

```javascript
// Verify product → vendor relationships
const product = await payload.findByID({
  collection: 'products',
  id: 'product-id',
});

const vendor = await payload.findByID({
  collection: 'vendors',
  id: product.vendor, // Should resolve correctly
});

console.log(`Product "${product.name}" belongs to vendor "${vendor.companyName}"`);
```

### 3. Check Media Files

Verify all media files are accessible:

```bash
# Check vendor logos
ls public/media/vendors/

# Check product images
ls public/media/products/

# Test URL in browser
open http://localhost:3000/media/vendors/test-supplier-logo.png
```

### 4. Review Unpublished Content

```bash
# Query unpublished products
const unpublishedProducts = await payload.find({
  collection: 'products',
  where: {
    published: {
      equals: false,
    },
  },
});

console.log(`${unpublishedProducts.totalDocs} products awaiting approval`);
```

### 5. Update Frontend

Transition frontend from TinaCMS to Payload:

```typescript
// Before (TinaCMS)
import { client } from 'tina/__generated__/client';
const vendors = await client.queries.vendorConnection();

// After (Payload)
import { getPayload } from 'payload';
const payload = await getPayload({ config });
const vendors = await payload.find({ collection: 'vendors' });
```

### 6. Archive Original Content

After verifying migration success:

```bash
# Archive markdown files (keep as backup)
tar -czf tinacms-content-backup.tar.gz content/
mv tinacms-content-backup.tar.gz archives/

# Optional: Remove markdown files if no longer needed
# rm -rf content/
```

## Advanced Usage

### Custom Validation

Extend validation utility for custom rules:

```typescript
// scripts/migration/utils/validation.ts
export function validateCustomField(value: any): ValidationError | null {
  if (!value.startsWith('prefix-')) {
    return {
      field: 'customField',
      message: 'Custom field must start with "prefix-"',
    };
  }
  return null;
}
```

### Partial Migration

Migrate specific collections only:

```typescript
// Create custom migration script
import { migrateVendors } from './migrate-all';

async function main() {
  await migrateVendors();
  console.log('Vendors migrated successfully');
}

main();
```

### Re-running Failed Migrations

To re-run only failed items:

1. Review migration report errors
2. Fix issues in markdown files
3. Remove successfully migrated items from database
4. Re-run migration for specific collection

### Data Cleanup

Remove test data after migration:

```typescript
// Remove test vendors
await payload.delete({
  collection: 'vendors',
  where: {
    companyName: {
      contains: 'Test',
    },
  },
});
```

### Migration Hooks

Add custom logic during migration:

```typescript
// Before vendor migration
async function beforeVendorMigration() {
  // Send notification
  await sendEmail('Migration starting...');
}

// After vendor migration
async function afterVendorMigration(report: MigrationReport) {
  // Log to analytics
  await logAnalytics('vendors_migrated', report.success);
}
```

## FAQ

### Q: Can I run the migration multiple times?

**A**: Yes, but duplicate slugs will cause errors. Use dry-run to check first, or clear the database before re-running.

### Q: What happens to existing Payload data?

**A**: Migration adds new records. Existing records are not modified or deleted.

### Q: How do I migrate only new content?

**A**: Create a custom migration script that filters for new files based on creation date or manually select files to migrate.

### Q: Can I rollback a migration?

**A**: Yes, use the backup created before migration:
```bash
cp -r backups/backup-2024-10-12T14-30-00 content/
```
Then manually remove database records if needed.

### Q: Are media files migrated?

**A**: No, media files must exist in `public/media/`. Only file paths are transformed during migration.

### Q: What if a vendor is deleted after products are migrated?

**A**: Products will have orphaned vendor relationships. Implement referential integrity checks in Payload hooks to prevent this.

### Q: How long does migration take?

**A**: Depends on content volume. Estimate: ~100 items per minute. Use progress logs to monitor.

### Q: Can I run migration in production?

**A**: Yes, but test thoroughly in staging first. Use dry-run mode, verify all data, and create backups.

## Support and Resources

### Documentation

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [TinaCMS Documentation](https://tina.io/docs/)
- [gray-matter Library](https://github.com/jonschlinkert/gray-matter)

### GitHub

- Report issues: [Project GitHub Issues](https://github.com/your-repo/issues)
- View source: [Migration Scripts](https://github.com/your-repo/tree/main/scripts/migration)

### Contact

- Email: support@example.com
- Slack: #migration-support

---

**Migration Scripts Version**: 1.0.0
**Last Updated**: 2024-10-12
**Maintainer**: Development Team
