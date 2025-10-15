# Task INTEG-MIGRATION-SCRIPTS: Enhance Migration Scripts with CLI Options, Checkpointing, Validation

## Task Metadata
- **Task ID**: integ-migration-scripts
- **Phase**: Phase 4 - Frontend-Backend Integration
- **Agent Assignment**: integration-coordinator
- **Estimated Time**: 6 hours
- **Dependencies**: impl-backend-transformers, impl-backend-richtext, test-backend-integration, test-frontend-integration
- **Status**: Ready for Implementation
- **Priority**: Critical

## Task Description

Enhance migration scripts with CLI options (dry-run, collections filter, skip-backup), checkpointing for resume capability, pre/post migration validation, and dependency-aware ordering to safely migrate all TinaCMS content to Payload CMS.

## Specifics

### File to Create
`/home/edwin/development/ptnextjs/scripts/migrate-to-payload.ts`

### CLI Options (Technical Spec lines 710-819)

```typescript
interface MigrationOptions {
  dryRun: boolean;                    // --dry-run: Preview without writing
  skipBackup: boolean;                // --skip-backup: Skip markdown backup
  collections: string[];              // --collections: Filter collections to migrate
  checkpoint: string | null;          // --checkpoint: Resume from checkpoint
  verbose: boolean;                   // --verbose: Detailed logging
}
```

### Migration Script Structure

```typescript
import { program } from 'commander';
import { payload } from '@/payload';
import {
  transformVendorFromMarkdown,
  transformProductFromMarkdown,
  transformYachtFromMarkdown,
  transformTagFromMarkdown,
  transformCategoryFromMarkdown,
  transformBlogPostFromMarkdown,
  transformTeamMemberFromMarkdown
} from '@/lib/transformers';

// CLI Configuration
program
  .name('migrate-to-payload')
  .description('Migrate TinaCMS markdown content to Payload CMS')
  .option('--dry-run', 'Preview migration without writing to database')
  .option('--skip-backup', 'Skip backing up markdown content')
  .option('--collections <collections>', 'Comma-separated list of collections to migrate')
  .option('--checkpoint <file>', 'Resume from checkpoint file')
  .option('-v, --verbose', 'Verbose logging')
  .parse();

// Migration Execution
async function runMigration(options: MigrationOptions) {
  // 1. Pre-migration validation
  await validateTinaCMSContent();

  // 2. Backup markdown content (unless --skip-backup)
  if (!options.skipBackup) {
    await backupMarkdownContent();
  }

  // 3. Initialize checkpoint
  const checkpoint = options.checkpoint
    ? await loadCheckpoint(options.checkpoint)
    : createNewCheckpoint();

  // 4. Determine collection order (dependency-aware)
  const collectionOrder = getCollectionMigrationOrder();

  // 5. Migrate collections
  for (const collection of collectionOrder) {
    if (options.collections.length > 0 && !options.collections.includes(collection)) {
      continue; // Skip if not in filter
    }

    if (checkpoint.completedCollections.includes(collection)) {
      console.log(`Skipping ${collection} (already completed)`);
      continue;
    }

    await migrateCollection(collection, options, checkpoint);

    // Save checkpoint after each collection
    checkpoint.completedCollections.push(collection);
    await saveCheckpoint(checkpoint);
  }

  // 6. Post-migration validation
  await validateMigration();

  // 7. Generate migration report
  await generateMigrationReport();
}
```

### Dependency-Aware Collection Order

```typescript
function getCollectionMigrationOrder(): string[] {
  // Collections must be migrated in this order to respect relationships
  return [
    'categories',      // No dependencies
    'tags',            // No dependencies
    'vendors',         // No dependencies
    'yachts',          // Depends on vendors (optional in timeline/maintenance)
    'products',        // Depends on vendors
    'blog',            // Depends on categories
    'team',            // No dependencies
    'company'          // No dependencies (singleton)
  ];
}
```

### Checkpoint Structure

```typescript
interface MigrationCheckpoint {
  startTime: string;
  completedCollections: string[];
  stats: {
    [collection: string]: {
      total: number;
      successful: number;
      failed: number;
      errors: string[];
    };
  };
}

async function saveCheckpoint(checkpoint: MigrationCheckpoint): Promise<void> {
  const filename = `.migration-checkpoint-${Date.now()}.json`;
  await fs.writeFile(filename, JSON.stringify(checkpoint, null, 2));
  console.log(`Checkpoint saved: ${filename}`);
}
```

### Collection Migration Function

```typescript
async function migrateCollection(
  collectionName: string,
  options: MigrationOptions,
  checkpoint: MigrationCheckpoint
): Promise<void> {
  console.log(`\nMigrating ${collectionName}...`);

  // Read markdown files
  const markdownFiles = await readMarkdownFiles(collectionName);
  console.log(`Found ${markdownFiles.length} ${collectionName} to migrate`);

  const stats = {
    total: markdownFiles.length,
    successful: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const file of markdownFiles) {
    try {
      // Parse markdown frontmatter + content
      const tinaCMSData = await parseMarkdownFile(file);

      // Transform using appropriate transformer
      const transformer = getTransformer(collectionName);
      const result = await transformer(tinaCMSData, payload);

      if (!result.success) {
        stats.failed++;
        stats.errors.push(`${file}: ${result.errors.join(', ')}`);
        continue;
      }

      // Create in Payload (unless dry-run)
      if (!options.dryRun) {
        await payload.create({
          collection: collectionName,
          data: result.data
        });
      }

      stats.successful++;

      if (options.verbose) {
        console.log(`✓ Migrated: ${result.data.name || result.data.title}`);
      }
    } catch (error) {
      stats.failed++;
      stats.errors.push(`${file}: ${error.message}`);
      console.error(`✗ Failed: ${file}`, error);
    }
  }

  checkpoint.stats[collectionName] = stats;

  console.log(`${collectionName} migration complete:`);
  console.log(`  Total: ${stats.total}`);
  console.log(`  Successful: ${stats.successful}`);
  console.log(`  Failed: ${stats.failed}`);
}
```

### Pre-Migration Validation

```typescript
async function validateTinaCMSContent(): Promise<void> {
  console.log('Validating TinaCMS content...');

  // Count all markdown files
  const counts = {
    vendors: (await readMarkdownFiles('vendors')).length,
    products: (await readMarkdownFiles('products')).length,
    categories: (await readMarkdownFiles('categories')).length,
    blog: (await readMarkdownFiles('blog')).length,
    team: (await readMarkdownFiles('team')).length,
    company: (await readMarkdownFiles('company')).length
  };

  console.log('Content inventory:');
  Object.entries(counts).forEach(([collection, count]) => {
    console.log(`  ${collection}: ${count} items`);
  });

  // Validate reference integrity
  await validateReferences();

  console.log('✓ Pre-migration validation complete');
}
```

### Post-Migration Validation

```typescript
async function validateMigration(): Promise<void> {
  console.log('\nValidating migration...');

  // Compare entity counts
  const tinaCounts = await getTinaCMSCounts();
  const payloadCounts = await getPayloadCounts();

  for (const collection of Object.keys(tinaCounts)) {
    const tinaCount = tinaCounts[collection];
    const payloadCount = payloadCounts[collection];

    if (tinaCount !== payloadCount) {
      console.error(`⚠ Count mismatch for ${collection}:`);
      console.error(`  TinaCMS: ${tinaCount}`);
      console.error(`  Payload: ${payloadCount}`);
    } else {
      console.log(`✓ ${collection}: ${payloadCount}/${tinaCount} migrated`);
    }
  }

  // Sample-based field validation
  await sampleValidation();

  console.log('✓ Post-migration validation complete');
}
```

## Acceptance Criteria

- [ ] Migration script created with CLI options
- [ ] Dry-run mode implemented
- [ ] Backup functionality implemented
- [ ] Collection filter implemented
- [ ] Checkpointing implemented (save/resume)
- [ ] Dependency-aware ordering implemented
- [ ] Pre-migration validation implemented
- [ ] Post-migration validation implemented
- [ ] Migration report generation implemented
- [ ] Error handling and logging comprehensive
- [ ] Script executable: `npm run migrate`

## Testing Requirements

### Dry-Run Testing
```bash
npm run migrate -- --dry-run
# Verify: No database writes, preview output shown
```

### Partial Migration Testing
```bash
npm run migrate -- --collections vendors,products
# Verify: Only vendors and products migrated
```

### Checkpoint Resume Testing
```bash
npm run migrate -- --checkpoint .migration-checkpoint-123456.json
# Verify: Skips completed collections, resumes from checkpoint
```

### Full Migration Testing
```bash
npm run migrate
# Verify: All collections migrated, validation passes
```

## Evidence Required

**Code Files:**
1. `scripts/migrate-to-payload.ts` (main migration script)
2. `scripts/utils/markdown-parser.ts` (frontmatter parser)
3. `scripts/utils/validation.ts` (validation utilities)
4. Updated `package.json` with migrate script

**Test Results:**
- Dry-run output
- Full migration output
- Validation report
- Migration stats

**Verification Checklist:**
- [ ] Script exists and executable
- [ ] CLI options work
- [ ] Dry-run works
- [ ] Backup works
- [ ] Checkpointing works
- [ ] Pre-validation works
- [ ] Post-validation works
- [ ] Report generated

## Context Requirements

**Technical Spec Sections:**
- Lines 710-819: Migration Script Enhancements
- Lines 821-875: Data Integrity Validation

**Related Tasks:**
- impl-backend-transformers (uses transformers)
- impl-backend-richtext (markdown→Lexical)
- pre-2 (validation strategy)

## Quality Gates

- [ ] All CLI options functional
- [ ] Checkpointing allows resume
- [ ] Validation catches data loss
- [ ] Error handling prevents partial failures
- [ ] Logging is comprehensive
- [ ] Performance acceptable (<5 min for 100 items)
- [ ] Migration is idempotent (can run multiple times safely)

## Notes

- Test with small dataset first (--collections vendors --dry-run)
- Checkpoint files enable safe resumption after failures
- Dependency order critical for relationship integrity
- Backup protects against data loss
- Validation ensures zero data loss
- Consider parallel migration for large datasets (future optimization)
