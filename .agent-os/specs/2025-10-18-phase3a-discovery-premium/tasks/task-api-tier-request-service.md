# Task: api-tier-request-service - Implement Tier Request Service (SQLite)

## Task Metadata
- **Task ID**: api-tier-request-service
- **Phase**: Phase 3A: Backend API Development
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 50-65 minutes
- **Dependencies**: [db-tier-requests-table, db-tier-audit-log]
- **Status**: [ ] Not Started

## Task Description
Create TierRequestService to manage vendor tier upgrade/downgrade requests with admin approval workflow. Implement application-layer duplicate pending request check (since SQLite doesn't support partial unique indexes), atomic tier updates using transactions, and integration with audit logging.

## Specifics
- **File to Create**:
  - `/home/edwin/development/ptnextjs/lib/services/tier-request-service.ts`
- **Service Methods**:
  ```typescript
  export class TierRequestService {
    // Create new tier upgrade/downgrade request
    async createTierRequest(
      vendorId: string,
      requestedTier: VendorTier,
      reason?: string
    ): Promise<TierRequest>
    
    // Get tier requests (filtered by vendor or status)
    async getTierRequests(filters: {
      vendorId?: string
      status?: TierRequestStatus
      limit?: number
      offset?: number
    }): Promise<{ requests: TierRequest[], total: number }>
    
    // Admin approves tier request
    async approveTierRequest(
      requestId: string,
      adminId: string,
      notes?: string
    ): Promise<void>
    
    // Admin rejects tier request
    async rejectTierRequest(
      requestId: string,
      adminId: string,
      notes?: string
    ): Promise<void>
  }
  ```
- **Business Logic Requirements**:
  1. Check vendor doesn't have pending request (application-layer enforcement)
  2. Validate requested tier differs from current tier
  3. Generate UUID for new request
  4. On approval: Update vendor tier + update request status + create audit log (atomic transaction)
  5. On rejection: Update request status + create audit log
- **Transaction Example**:
  ```typescript
  async approveTierRequest(requestId: string, adminId: string, notes?: string) {
    const request = await db.tierRequests.findUnique({ where: { id: requestId }})
    
    // Use SQLite transaction for atomicity
    await db.$transaction([
      // Update vendor tier
      db.vendors.update({
        where: { id: request.vendor_id },
        data: { tier: request.requested_tier }
      }),
      // Update request status
      db.tierRequests.update({
        where: { id: requestId },
        data: { 
          status: 'approved', 
          admin_id: adminId,
          admin_notes: notes,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }),
      // Create audit log
      db.tierAuditLog.create({
        data: {
          id: generateUUID(),
          vendor_id: request.vendor_id,
          previous_tier: request.current_tier,
          new_tier: request.requested_tier,
          change_type: 'request_approved',
          admin_id: adminId,
          tier_request_id: requestId,
          notes
        }
      })
    ])
  }
  ```

## Acceptance Criteria
- [ ] TierRequestService class created with all methods
- [ ] createTierRequest checks for duplicate pending request before insert
- [ ] createTierRequest validates requested tier ≠ current tier
- [ ] createTierRequest generates UUID and stores with current timestamp
- [ ] getTierRequests supports filtering by vendorId, status, pagination
- [ ] approveTierRequest updates vendor tier atomically with transaction
- [ ] approveTierRequest creates audit log entry on success
- [ ] rejectTierRequest updates status without changing vendor tier
- [ ] rejectTierRequest creates audit log entry
- [ ] All database errors handled gracefully with rollback
- [ ] Timestamps use ISO 8601 format for SQLite compatibility

## Testing Requirements
- **Unit Tests**:
  - Test duplicate pending request rejection (mock db to return existing request)
  - Test tier validation (same tier rejected)
  - Test UUID generation for new requests
  - Test approval logic updates all three tables
  - Test rejection logic doesn't update vendor tier
  - Mock TierAuditService integration
- **Integration Tests**:
  - Create vendor with free tier
  - Submit tier 2 upgrade request (should succeed)
  - Submit second request while first pending (should fail with DUPLICATE_REQUEST)
  - Admin approves request
  - Verify vendor tier updated to tier2
  - Verify request status = 'approved'
  - Verify audit log entry created
  - Test transaction rollback: simulate error mid-transaction, verify no partial updates
  - Test rejection workflow end-to-end
- **Manual Verification**:
  - Create tier request via service
  - Check tier_requests table for new record
  - Approve request and verify all three tables updated
  - Check timestamps are ISO 8601 strings

## Evidence Required
- Service file with complete implementation
- Unit test results (>90% coverage)
- Integration test showing successful approval workflow
- Database records showing atomic transaction (all or nothing)
- Transaction rollback test proving consistency

## Context Requirements
- UUID helper from task-db-tier-requests-table
- TierAuditService for logging (from task-api-tier-audit-service)
- Payload CMS database transactions API
- tasks-sqlite.md section 2.2 for implementation patterns

## Implementation Notes
- **SQLite Transaction Handling**:
  - SQLite supports transactions (`BEGIN`, `COMMIT`, `ROLLBACK`)
  - Payload provides `db.$transaction([])` API
  - Database-level locking during transaction (entire DB locked)
  - Acceptable for low concurrency scenarios
- **Duplicate Check Logic**:
  ```typescript
  async createTierRequest(vendorId: string, requestedTier: VendorTier, reason?: string) {
    // Check for duplicate pending request
    const existing = await db.tierRequests.findFirst({
      where: { vendor_id: vendorId, status: 'pending' }
    })
    
    if (existing) {
      throw new Error('DUPLICATE_REQUEST: Vendor already has pending tier request')
    }
    
    // Get current vendor tier
    const vendor = await db.vendors.findUnique({ where: { id: vendorId }})
    
    // Validate requested tier differs
    if (vendor.tier === requestedTier) {
      throw new Error('INVALID_TIER: Requested tier same as current tier')
    }
    
    // Create request with generated UUID
    const id = generateUUID()
    return await db.tierRequests.create({
      data: {
        id,
        vendor_id: vendorId,
        current_tier: vendor.tier,
        requested_tier: requestedTier,
        status: 'pending',
        vendor_reason: reason
      }
    })
  }
  ```
- **Timestamp Handling**:
  - Use `new Date().toISOString()` for updated_at, processed_at
  - SQLite stores as TEXT in format: `'2025-10-18T22:30:00Z'`
  - Application converts to Date object when reading
- **Error Codes**:
  - `DUPLICATE_REQUEST` - Vendor has pending request
  - `INVALID_TIER` - Requested tier same as current
  - `NOT_FOUND` - Request ID doesn't exist
  - `ALREADY_PROCESSED` - Request already approved/rejected

## Quality Gates
- [ ] No partial updates on transaction failure
- [ ] Duplicate check prevents race conditions
- [ ] All timestamps in ISO 8601 format
- [ ] Error messages are specific and actionable
- [ ] Audit trail complete for all tier changes

## Related Files
- Main Tasks: `tasks-sqlite.md` section 2.2
- Technical Spec: `sub-specs/technical-spec.md` (TierRequestService)
- Database Tables: tier_requests, vendors, tier_audit_log
- UUID Helper: `/home/edwin/development/ptnextjs/lib/utils/uuid.ts`

## Next Steps After Completion
- Create API endpoints (task-api-tier-request-endpoints)
- Build vendor tier upgrade form UI (task-ui-tier-upgrade-form)
- Build admin approval queue UI (task-ui-admin-approval-queue)
