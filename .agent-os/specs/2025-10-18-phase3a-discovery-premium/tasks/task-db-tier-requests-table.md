# Task: db-tier-requests-table - Create Tier Requests Table (SQLite)

## Task Metadata
- **Task ID**: db-tier-requests-table
- **Phase**: Phase 3A: Database Schema & Migrations
- **Agent**: backend-database-specialist
- **Estimated Time**: 35-45 minutes
- **Dependencies**: None
- **Status**: [ ] Not Started

## Task Description
Create the tier_requests table in SQLite to track vendor tier upgrade/downgrade requests. Implement application-layer UUID generation and unique constraint enforcement since SQLite doesn't support partial unique indexes.

## Specifics
- **Migration File to Create**:
  - `/home/edwin/development/ptnextjs/payload/migrations/create-tier-requests-table-sqlite.ts`
- **Table Schema**:
  ```sql
  CREATE TABLE tier_requests (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    current_tier TEXT NOT NULL CHECK (current_tier IN ('free', 'tier1', 'tier2')),
    requested_tier TEXT NOT NULL CHECK (requested_tier IN ('free', 'tier1', 'tier2')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    vendor_reason TEXT,
    admin_notes TEXT,
    admin_id TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME
  );
  
  CREATE INDEX idx_tier_requests_vendor ON tier_requests(vendor_id);
  CREATE INDEX idx_tier_requests_status ON tier_requests(status);
  CREATE INDEX idx_tier_requests_created ON tier_requests(created_at DESC);
  ```
- **UUID Helper to Create**:
  - `/home/edwin/development/ptnextjs/lib/utils/uuid.ts`
  ```typescript
  import { randomUUID } from 'crypto'
  
  export const generateUUID = (): string => randomUUID()
  
  // Validation helper
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  export const isValidUUID = (uuid: string): boolean => UUID_REGEX.test(uuid)
  ```
- **TypeScript Types to Add** (`lib/types.ts`):
  ```typescript
  export type TierRequestStatus = 'pending' | 'approved' | 'rejected'
  export type VendorTier = 'free' | 'tier1' | 'tier2'
  
  export interface TierRequest {
    id: string
    vendor_id: string
    current_tier: VendorTier
    requested_tier: VendorTier
    status: TierRequestStatus
    vendor_reason?: string
    admin_notes?: string
    admin_id?: string
    created_at: Date
    updated_at: Date
    processed_at?: Date
  }
  ```

## Acceptance Criteria
- [ ] Migration file created with complete table schema
- [ ] All CHECK constraints enforce enum values
- [ ] Foreign keys reference vendors and users tables correctly
- [ ] Three indexes created for performance (vendor_id, status, created_at)
- [ ] UUID generation helper created and validated
- [ ] TypeScript types defined for TierRequest interface
- [ ] Rollback migration created (DROP TABLE IF EXISTS tier_requests CASCADE)
- [ ] Migration runs successfully on development database
- [ ] Sample data inserted to test constraints

## Testing Requirements
- **Unit Tests**:
  - Test generateUUID produces valid v4 UUIDs (36 chars, correct format)
  - Test isValidUUID correctly identifies valid/invalid UUIDs
  - Test UUID uniqueness (generate 1000, verify no duplicates)
- **Integration Tests**:
  - Run migration and verify table exists
  - Insert tier request with valid data (all constraints pass)
  - Test CHECK constraint: invalid tier value rejected
  - Test CHECK constraint: invalid status value rejected
  - Test foreign key: invalid vendor_id rejected
  - Test foreign key: DELETE CASCADE on vendor deletion
  - Test created_at auto-populates with current timestamp
  - Test indexes exist (EXPLAIN QUERY PLAN SELECT ... WHERE vendor_id = ?)
- **Manual Verification**:
  - Check SQLite schema with `.schema tier_requests`
  - Verify indexes with `.indices tier_requests`
  - Insert test request and verify default values

## Evidence Required
- Migration file with complete schema
- UUID helper with validation tests
- Test results showing all constraints work
- EXPLAIN QUERY PLAN output showing index usage
- Sample tier request record in database

## Context Requirements
- SQLite schema patterns from tasks-sqlite.md section 1.2
- Database schema spec from sub-specs/database-schema.md
- Existing users and vendors table structure
- Payload CMS migration patterns

## Implementation Notes
- **SQLite vs PostgreSQL Differences**:
  - No `gen_random_uuid()` → Application generates UUIDs with crypto.randomUUID()
  - No partial unique index → Application enforces single pending request per vendor
  - Use TEXT for UUID storage (not UUID type)
  - Use DATETIME for timestamps (not TIMESTAMP)
- **Unique Constraint Enforcement**:
  - SQLite can't do: `UNIQUE (vendor_id, status) WHERE status = 'pending'`
  - Application layer must check before insert:
  ```typescript
  const existingPending = await db.tierRequests.findFirst({
    where: { vendor_id, status: 'pending' }
  })
  if (existingPending) throw new Error('DUPLICATE_REQUEST')
  ```
- **Timestamp Handling**:
  - SQLite stores as ISO 8601 string: `'2025-10-18T22:30:00Z'`
  - Converts to Date in TypeScript: `new Date(sqliteTimestamp)`
  - Default CURRENT_TIMESTAMP auto-populates created_at
- **Migration Safety**:
  - Check table doesn't exist before creating
  - Test foreign key enforcement is enabled: `PRAGMA foreign_keys = ON;`
  - Verify CASCADE delete with test data

## Quality Gates
- [ ] All constraints enforced at database level
- [ ] Foreign keys maintain referential integrity
- [ ] Indexes improve query performance (verify with EXPLAIN)
- [ ] UUIDs generated are cryptographically secure
- [ ] No duplicate UUIDs in reasonable sample size (>10,000)

## Related Files
- Main Tasks: `tasks-sqlite.md` section 1.2
- Database Schema: `sub-specs/database-schema.md` (tier_requests table)
- Technical Spec: `sub-specs/technical-spec.md` (Tier Request System)
- Existing Schema: vendors table, users table

## Next Steps After Completion
- Create TierRequestService with duplicate check logic (task-api-tier-request-service)
- Build admin approval queue UI (task-ui-admin-tier-approval-queue)
- Create tier audit log table (task-db-tier-audit-log)
