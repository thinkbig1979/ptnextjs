# Task: db-tier-audit-log - Create Tier Audit Log Table (SQLite)

## Task Metadata
- **Task ID**: db-tier-audit-log
- **Phase**: Phase 3A: Database Schema & Migrations
- **Agent**: backend-database-specialist
- **Estimated Time**: 25-30 minutes
- **Dependencies**: [task-db-tier-requests-table]
- **Status**: [ ] Not Started

## Task Description
Create the tier_audit_log table in SQLite for immutable compliance tracking of all tier changes. This table logs every tier upgrade, downgrade, approval, rejection, and admin override for audit trail and billing purposes.

## Specifics
- **Migration File to Create**:
  - `/home/edwin/development/ptnextjs/payload/migrations/create-tier-audit-log-sqlite.ts`
- **Table Schema**:
  ```sql
  CREATE TABLE tier_audit_log (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    previous_tier TEXT NOT NULL,
    new_tier TEXT NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN (
      'request_approved',
      'request_rejected',
      'admin_override',
      'system_automatic'
    )),
    admin_id TEXT REFERENCES users(id),
    tier_request_id TEXT REFERENCES tier_requests(id),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX idx_tier_audit_vendor ON tier_audit_log(vendor_id);
  CREATE INDEX idx_tier_audit_created ON tier_audit_log(created_at DESC);
  CREATE INDEX idx_tier_audit_admin ON tier_audit_log(admin_id);
  ```
- **TypeScript Types to Add** (`lib/types.ts`):
  ```typescript
  export type TierChangeType = 
    | 'request_approved' 
    | 'request_rejected' 
    | 'admin_override' 
    | 'system_automatic'
  
  export interface TierAuditLog {
    id: string
    vendor_id: string
    previous_tier: VendorTier
    new_tier: VendorTier
    change_type: TierChangeType
    admin_id?: string
    tier_request_id?: string
    notes?: string
    created_at: Date
  }
  ```

## Acceptance Criteria
- [ ] Migration file created with complete table schema
- [ ] CHECK constraint enforces change_type enum values
- [ ] Foreign keys reference vendors, users, tier_requests correctly
- [ ] Three indexes created (vendor_id, created_at DESC, admin_id)
- [ ] TypeScript types defined for TierAuditLog interface
- [ ] Rollback migration created (DROP TABLE IF EXISTS tier_audit_log CASCADE)
- [ ] Migration runs successfully on development database
- [ ] Table is append-only (no UPDATE or DELETE operations allowed by design)

## Testing Requirements
- **Integration Tests**:
  - Run migration and verify table exists
  - Insert audit log entry with all fields populated
  - Test CHECK constraint: invalid change_type rejected
  - Test foreign key: invalid vendor_id rejected
  - Test foreign key: CASCADE delete when vendor deleted
  - Test foreign key: tier_request_id can be null (admin override case)
  - Verify created_at auto-populates with timestamp
  - Verify indexes exist with EXPLAIN QUERY PLAN
- **Manual Verification**:
  - Check schema: `sqlite3 payload.db ".schema tier_audit_log"`
  - Check indexes: `sqlite3 payload.db ".indices tier_audit_log"`
  - Insert test log entry and verify immutability (no UPDATE command)

## Evidence Required
- Migration file with complete schema
- Test results showing all constraints work
- EXPLAIN QUERY PLAN output for audit history queries
- Sample audit log records showing different change_types

## Context Requirements
- SQLite schema patterns from tasks-sqlite.md section 1.3
- UUID helper from task-db-tier-requests-table
- Database schema spec from sub-specs/database-schema.md
- Existing vendors, users, tier_requests tables

## Implementation Notes
- **Immutable Audit Log**:
  - Only INSERT operations allowed (no UPDATE/DELETE)
  - Application layer should never modify existing audit records
  - Retention: Keep all records indefinitely for compliance
- **Linking to Tier Requests**:
  - `tier_request_id` links to originating request (when applicable)
  - `tier_request_id` can be NULL for admin overrides or system changes
  - Audit log persists even if tier_request is deleted (no CASCADE on this FK)
- **Change Type Semantics**:
  - `request_approved`: Admin approved vendor's tier upgrade/downgrade request
  - `request_rejected`: Admin rejected request (no tier change)
  - `admin_override`: Admin directly changed tier without request
  - `system_automatic`: Future use for automated tier changes (e.g., payment success)
- **Index Strategy**:
  - `idx_tier_audit_vendor`: Query vendor's complete tier history
  - `idx_tier_audit_created`: Chronological audit trail (recent first)
  - `idx_tier_audit_admin`: Track admin actions for accountability
  - Note: SQLite doesn't support partial WHERE clause in indexes, so admin_id index includes all rows
- **Timestamp Handling**:
  - SQLite CURRENT_TIMESTAMP format: `'2025-10-18 22:30:00'`
  - Convert to ISO 8601 when reading: `new Date(timestamp).toISOString()`

## Quality Gates
- [ ] Foreign keys maintain referential integrity
- [ ] CHECK constraint prevents invalid change_types
- [ ] Indexes optimize common audit queries (vendor history, recent changes)
- [ ] No ability to UPDATE or DELETE audit records (enforced by application layer)
- [ ] All timestamps in consistent format

## Related Files
- Main Tasks: `tasks-sqlite.md` section 1.3
- Database Schema: `sub-specs/database-schema.md` (tier_audit_log table)
- Technical Spec: `sub-specs/technical-spec.md` (Audit Trail requirements)
- UUID Helper: `/home/edwin/development/ptnextjs/lib/utils/uuid.ts`

## Next Steps After Completion
- Create TierAuditService for logging and querying (task-api-tier-audit-service)
- Integrate with TierRequestService to log all tier changes
- Build admin audit history UI with CSV export (task-ui-admin-tier-pages)
