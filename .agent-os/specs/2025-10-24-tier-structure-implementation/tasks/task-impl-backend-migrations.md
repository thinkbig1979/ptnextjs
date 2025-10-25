# Task IMPL-BACKEND-MIGRATIONS: Create Database Migrations

**ID**: impl-backend-migrations
**Title**: Create database migrations for new tier structure fields
**Agent**: backend-nodejs-specialist
**Estimated Time**: 1 hour
**Dependencies**: impl-backend-schema
**Phase**: 2 - Backend Implementation

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 1586-1820) - Database schema and migration details
- @payload/collections/Vendors.ts - Implemented schema from previous task
- Existing migration files (if any) in project

## Objectives

1. Create migration to add Tier 3 to tier enum
2. Create migration to add all new scalar fields with NULL defaults
3. Create migration to add new tables for array fields (certifications, awards, case studies, etc.)
4. Ensure all foreign key constraints are properly defined
5. Add appropriate indexes for performance (tier, foundedYear, featured flags)
6. Create rollback migrations for all changes
7. Ensure zero data loss for existing vendors

## Acceptance Criteria

- [ ] Migration adds Tier 3 to tier enum successfully
- [ ] Migration adds all 40+ new fields to vendors table
- [ ] Migration creates 12 new tables for array fields
- [ ] All foreign keys reference correct tables with CASCADE deletes
- [ ] Indexes created on tier, foundedYear, featured, and foreign keys
- [ ] Rollback migration removes all changes cleanly
- [ ] Existing vendor data preserved after migration
- [ ] Migration is idempotent (can run multiple times safely)

## Testing Requirements

- Run migration on test database
- Verify all tables and columns created
- Verify existing vendor data intact
- Test rollback migration
- Re-run migration after rollback (idempotency test)
- Verify foreign key constraints work (insert/delete cascade)

## Evidence Requirements

- Migration files (up and down migrations)
- Test database before/after schema comparison
- Migration execution logs
- Verification queries showing existing data preserved
- Rollback execution logs showing clean removal
