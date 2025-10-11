# Task: impl-migration-scripts - Build TinaCMS to Payload CMS Migration Scripts

## Task Metadata
- **Task ID**: impl-migration-scripts
- **Phase**: Phase 2: Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 45-60 minutes
- **Dependencies**: [impl-payload-collections]
- **Status**: [ ] Not Started

## Task Description
Build automated migration scripts to convert all TinaCMS markdown content to Payload CMS collections. Include data validation, error handling, rollback capability, and backup creation.

## Specifics
- **Migration Script Files to Create**:
  - `/home/edwin/development/ptnextjs/scripts/migration/migrate-all.ts` - Master migration orchestrator
  - `/home/edwin/development/ptnextjs/scripts/migration/migrate-vendors.ts` - Vendor migration
  - `/home/edwin/development/ptnextjs/scripts/migration/migrate-products.ts` - Product migration
  - `/home/edwin/development/ptnextjs/scripts/migration/migrate-categories.ts` - Category migration
  - `/home/edwin/development/ptnextjs/scripts/migration/migrate-blog.ts` - Blog post migration
  - `/home/edwin/development/ptnextjs/scripts/migration/migrate-team.ts` - Team member migration
  - `/home/edwin/development/ptnextjs/scripts/migration/migrate-company.ts` - Company info migration
  - `/home/edwin/development/ptnextjs/scripts/migration/utils/markdown-parser.ts` - Markdown parsing utility
  - `/home/edwin/development/ptnextjs/scripts/migration/utils/validation.ts` - Data validation utility
  - `/home/edwin/development/ptnextjs/scripts/migration/utils/backup.ts` - Backup creation utility
- **Migration Flow**:
  1. Create timestamped backup of `/content/` directory
  2. Parse markdown files with gray-matter
  3. Transform frontmatter to Payload collection schema
  4. Validate transformed data against schema
  5. Insert into Payload CMS via local API
  6. Verify data integrity
  7. Generate migration report
  8. Rollback on error
- **Key Requirements**:
  - Parse all markdown files from `/content/` directory
  - Handle file relationships (vendor → products, blog → categories)
  - Generate slugs from filenames
  - Transform media paths to public URLs
  - Validate all data before insertion
  - Handle missing or malformed files gracefully
  - Create comprehensive migration logs

## Acceptance Criteria
- [ ] All 7 content type migration scripts created and functional
- [ ] Master orchestrator script executes migrations in correct order
- [ ] Backup utility creates timestamped archive of original markdown
- [ ] Markdown parser extracts frontmatter and content correctly
- [ ] Validation utility catches schema violations before insertion
- [ ] All relationships preserved (vendor IDs in products, etc.)
- [ ] Slugs generated correctly from filenames
- [ ] Media paths transformed to public URLs
- [ ] Migration logs capture all operations and errors
- [ ] Rollback mechanism restores original state on failure
- [ ] Dry-run mode available for testing

## Testing Requirements
- **Unit Tests**:
  - Markdown parser with various frontmatter formats
  - Validation utility with valid and invalid data
  - Slug generation from filenames
  - Media path transformation
  - Relationship resolution logic
- **Integration Tests**:
  - End-to-end migration of sample markdown files
  - Rollback mechanism with intentional error
  - Dry-run mode execution without database changes
  - Migration report generation
- **Manual Verification**:
  - Run migration on actual TinaCMS content
  - Verify all vendors appear in Payload admin
  - Verify all products linked to correct vendors
  - Check media URLs resolve correctly
  - Validate blog post content preserved

## Evidence Required
- Migration logs showing successful data transformation
- Before/after comparison of content (markdown vs Payload)
- Migration report with success/failure counts
- Screenshots of migrated content in Payload admin

## Context Requirements
- TinaCMS content structure in `/content/` directory
- Payload CMS collection schemas from task impl-payload-collections
- Understanding of gray-matter markdown parser
- Knowledge of Payload CMS local API usage

## Implementation Notes
- Use gray-matter to parse markdown frontmatter
- Use Payload local API (not REST API) for direct database insertion
- Implement transaction support for atomic migrations
- Create detailed logs for debugging failed migrations
- Add `--dry-run` flag to test without committing changes
- Consider migration progress indicators for large datasets
- Store migration metadata (timestamp, version) in database

## Quality Gates
- [ ] Migration scripts handle all TinaCMS content types
- [ ] Zero data loss during migration
- [ ] All relationships preserved correctly
- [ ] Migration can be re-run safely (idempotent)
- [ ] Rollback mechanism tested and functional

## Related Files
- Spec: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/spec.md` (Content Migration section)
- Technical Spec: Database schema and migration requirements
- Source Content: `/home/edwin/development/ptnextjs/content/` directory
