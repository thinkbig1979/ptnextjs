# Task PRE-2: Migration Validation and Rollback Planning

## Task Metadata
- **Task ID**: pre-2
- **Phase**: Phase 1 - Pre-Execution Analysis
- **Agent Assignment**: integration-coordinator
- **Estimated Time**: 2 hours
- **Dependencies**: pre-1
- **Status**: Ready for Implementation
- **Priority**: Critical

## Task Description

Design comprehensive validation strategies and rollback procedures for the TinaCMS to Payload migration. This includes defining pre-migration checks, post-migration validation, data integrity verification, and safe rollback mechanisms to ensure zero data loss.

## Specifics

### Validation Strategy Components

1. **Pre-Migration Validation**
   - Content inventory script to count all TinaCMS entities:
     - Vendors: `content/vendors/*.md`
     - Products: `content/products/*.md`
     - Blog posts: `content/blog/*.md`
     - Categories: `content/categories/*.md`
     - Team members: `content/team/*.md`
     - Company info: `content/company/*.md`
   - Reference integrity checker (vendor references in products, category references, etc.)
   - Duplicate slug detection across collections
   - Required field validation for all markdown files
   - Media file inventory and accessibility check

2. **Post-Migration Validation**
   - Entity count verification (TinaCMS count === Payload count per collection)
   - Field-by-field data comparison for sample entities (10% of each collection)
   - Rich text conversion verification (markdown → Lexical)
   - Reference resolution validation (file paths → database IDs)
   - Media path transformation verification
   - Slug uniqueness validation in Payload database

3. **Data Integrity Checks**
   - Required field presence validation
   - Data type validation (dates, numbers, booleans)
   - Array field length preservation
   - Relationship integrity (products → vendors, products → categories)
   - Enum value validation (status fields, categories)
   - Image URL format validation

4. **Rollback Procedures**
   - Database backup strategy before migration
   - Markdown content backup location: `.agent-os/.backup-YYYYMMDD-HHMMSS/`
   - Environment variable restore procedure
   - Data service import rollback (PayloadCMSDataService → TinaCMSDataService)
   - Payload collection removal scripts
   - Restoration validation steps

### Validation Scripts Design

1. **`scripts/validate-tinacms-content.ts`**
   - Count entities per content type
   - Check reference integrity
   - Validate required fields
   - Output summary report

2. **`scripts/validate-migration-success.ts`**
   - Compare entity counts (TinaCMS vs Payload)
   - Sample and compare field values
   - Validate relationships
   - Check rich text conversion
   - Output detailed validation report

3. **`scripts/compare-data-integrity.ts`**
   - Field-by-field comparison utility
   - Support for partial collection comparison
   - Diff output for mismatches
   - Exit code 0 for success, 1 for failures

4. **`scripts/rollback-migration.ts`**
   - Clear Payload collections
   - Restore markdown content from backup
   - Reset environment variables
   - Restore TinaCMSDataService imports
   - Validate rollback completion

## Acceptance Criteria

- [ ] Pre-migration validation strategy documented with all checks
- [ ] Post-migration validation strategy documented with success criteria
- [ ] Data integrity check specifications defined
- [ ] Rollback procedure documented step-by-step
- [ ] Validation script specifications created (4 scripts)
- [ ] Success/failure exit codes defined for all scripts
- [ ] Backup strategy documented with locations and retention
- [ ] Zero data loss validation approach specified

## Testing Requirements

### Design Validation
- Review validation checks against technical spec requirements
- Confirm entity count validation covers all 8 collections
- Verify rollback procedure is reversible and safe
- Validate backup strategy prevents data loss

### Manual Verification
- Review validation script specifications for completeness
- Confirm rollback steps restore full functionality
- Verify data integrity checks cover all critical fields

## Evidence Required

**Design Documents:**
1. `@.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/validation-strategy.md`
   - Pre-migration validation checks
   - Post-migration validation criteria
   - Data integrity verification approach
   - Validation script specifications

2. `@.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/rollback-plan.md`
   - Step-by-step rollback procedure
   - Backup strategy and locations
   - Restoration validation steps
   - Risk mitigation measures

3. `@.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/validation-checklist.md`
   - Checklist for pre-migration validation
   - Checklist for post-migration validation
   - Sign-off criteria for migration success

## Context Requirements

**Technical Spec Sections:**
- Lines 710-819: Migration Script Enhancements
- Lines 821-875: Data Integrity Validation
- Lines 877-914: Frontend Page Updates
- Lines 916-962: Testing Strategy

**Existing Code References:**
- `lib/tinacms-data-service.ts` - validateCMSContent() method patterns
- `content/` directory structure - All markdown collections
- Existing backup location: `.agent-os/.backup-20251014-214720/`

**Success Criteria from Spec:**
- 0% data loss requirement
- 100% field parity validation
- <5 minute build time validation

## Quality Gates

- [ ] All validation checks have clear pass/fail criteria
- [ ] Entity count validation covers all 8 collections
- [ ] Field-level validation includes sample-based deep comparison
- [ ] Rollback procedure tested with dry-run scenarios
- [ ] Backup strategy prevents accidental data loss
- [ ] Validation scripts have error handling and reporting
- [ ] Success criteria aligned with spec requirements (0% data loss)

## Notes

- Validation scripts should be executable before and after migration
- Consider checkpoint/resume capability for large migrations
- Document expected validation script runtimes
- Ensure rollback procedure is idempotent (safe to run multiple times)
- Validation reports should be saved with timestamps for audit trail
