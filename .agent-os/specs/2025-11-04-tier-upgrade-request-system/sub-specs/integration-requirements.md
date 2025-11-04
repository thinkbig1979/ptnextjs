# Integration Requirements

This is the integration requirements specification for the spec detailed in @.agent-os/specs/2025-11-04-tier-upgrade-request-system/spec.md

> Created: 2025-11-04
> Version: 1.0.0

## System Integration Points

### Payload CMS Collections

**Existing collections (dependencies):**

1. **vendors** - Vendor/partner information
   - Fields used: `id`, `name`, `tier`, `email`, `slug`
   - Integration: Foreign key relationship from `tier_upgrade_requests.vendorId`
   - Cascade behavior: Delete requests when vendor deleted

2. **users** - User accounts (vendors and admins)
   - Fields used: `id`, `email`, `role`
   - Integration: Foreign key relationships from `tier_upgrade_requests.userId` and `tier_upgrade_requests.reviewedBy`
   - Usage: Authentication and authorization

**New collection (this feature):**

3. **tier_upgrade_requests** - Tier upgrade request tracking
   - Primary entity for this feature
   - Relationships: vendor (many-to-one), user (many-to-one), reviewedBy (many-to-one)
   - See `@.agent-os/specs/2025-11-04-tier-upgrade-request-system/sub-specs/database-schema.md` for full schema

### Existing APIs

**Vendor tier management (to be extended):**

```typescript
// Current implementation
PUT /api/admin/vendors/[id]/tier
Authorization: Admin only
Request body: {
  tier: number (1-4)
}
Response: {
  success: boolean
  vendor: Vendor
}
```

**Integration approach:**
- New approval endpoint calls existing tier update API internally
- Maintains single source of truth for tier updates
- Reuses existing tier validation logic
- Ensures consistency with current tier management

**Usage in new system:**
```typescript
// In TierUpgradeRequestService.approve()
async approve(requestId: string, adminUserId: string) {
  const request = await this.findById(requestId)

  // Call existing tier update API to ensure consistency
  await fetch(`/api/admin/vendors/${request.vendorId}/tier`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: request.targetTier })
  })

  // Update request status
  await this.updateStatus(requestId, 'approved', adminUserId)
}
```

### Vendor Dashboard Routing

**Existing routes:**
- `/portal/dashboard` - Main vendor dashboard
- `/portal/vendors/[id]` - Vendor profile management

**New routes (this feature):**
- `/portal/dashboard#tier-upgrade` - Dashboard section for tier upgrade (anchor link)
- Modal-based UI, no dedicated route needed

**Integration approach:**
- Add `TierUpgradeCard` component to existing dashboard
- Render conditionally based on vendor tier (hide if already Tier 4)
- Use existing dashboard layout and navigation

**Dashboard component tree:**
```
app/portal/dashboard/page.tsx
├── DashboardLayout
│   ├── DashboardNav (existing)
│   ├── DashboardOverview (existing)
│   ├── TierUpgradeCard (NEW) ← Insert here
│   ├── LocationsManagerCard (existing)
│   └── ProfileManagerCard (existing)
```

### Admin Panel (Payload CMS)

**Integration strategy:**
- Use Payload CMS built-in admin UI at `/admin`
- Add custom components for tier upgrade request management
- Leverage Payload's authentication and authorization

**Custom admin components:**

1. **Collection list view** (extends Payload's default list)
   - Custom columns: Vendor name, Current tier, Target tier, Status, Created date
   - Custom filters: Status dropdown, Tier dropdown, Date range picker
   - Custom actions: Bulk approve, Bulk reject, Export CSV

2. **Collection edit view** (extends Payload's default edit)
   - Read-only fields: All except status/rejection reason (managed via custom actions)
   - Custom action buttons: Approve, Reject (replace default Save)
   - Custom sections: Request details, Vendor context, Timeline

3. **Custom dashboard widget**
   - Show pending request count
   - Show approval rate (last 30 days)
   - Quick links to filtered views

**Payload config integration:**
```typescript
// In payload.config.ts
export default buildConfig({
  collections: [
    // ... existing collections
    {
      slug: 'tier-upgrade-requests',
      admin: {
        useAsTitle: 'id',
        defaultColumns: ['vendorName', 'currentTier', 'targetTier', 'status', 'createdAt'],
        components: {
          views: {
            List: CustomTierUpgradeRequestList,
            Edit: CustomTierUpgradeRequestEdit
          }
        }
      },
      // ... fields, hooks, access control
    }
  ]
})
```

## API Contracts

### TypeScript Interfaces

**Request/Response types:**

```typescript
// ============================================
// Request Bodies
// ============================================

/**
 * Request body for submitting a new tier upgrade request
 */
export interface CreateTierUpgradeRequestDTO {
  /** Target tier (must be higher than current tier) */
  targetTier: number
  /** Business justification (50-1000 characters) */
  businessJustification: string
}

/**
 * Request body for approving a tier upgrade request
 */
export interface ApproveTierUpgradeRequestDTO {
  /** Optional admin notes (internal) */
  adminNotes?: string
}

/**
 * Request body for rejecting a tier upgrade request
 */
export interface RejectTierUpgradeRequestDTO {
  /** Reason for rejection (shown to vendor) */
  rejectionReason: string
  /** Optional admin notes (internal) */
  adminNotes?: string
}

// ============================================
// Response Bodies
// ============================================

/**
 * Full tier upgrade request object (returned by API)
 */
export interface TierUpgradeRequest {
  /** Unique request ID */
  id: string
  /** Vendor who submitted the request */
  vendor: {
    id: string
    name: string
    email: string
    slug: string
  }
  /** User who submitted the request (vendor user account) */
  user: {
    id: string
    email: string
  }
  /** Current tier at time of request */
  currentTier: number
  /** Requested target tier */
  targetTier: number
  /** Business justification provided by vendor */
  businessJustification: string
  /** Request status */
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  /** User who reviewed the request (admin) */
  reviewedBy?: {
    id: string
    email: string
  }
  /** Timestamp of review */
  reviewedAt?: string
  /** Reason for rejection (if rejected) */
  rejectionReason?: string
  /** Internal admin notes (not shown to vendor) */
  adminNotes?: string
  /** Request creation timestamp */
  createdAt: string
  /** Request last updated timestamp */
  updatedAt: string
}

/**
 * Paginated list response
 */
export interface TierUpgradeRequestListResponse {
  /** Array of requests */
  docs: TierUpgradeRequest[]
  /** Total number of requests (all pages) */
  totalDocs: number
  /** Current page number */
  page: number
  /** Number of requests per page */
  limit: number
  /** Total number of pages */
  totalPages: number
  /** Has previous page */
  hasPrevPage: boolean
  /** Has next page */
  hasNextPage: boolean
}

/**
 * Success response for mutations
 */
export interface TierUpgradeRequestActionResponse {
  /** Success flag */
  success: boolean
  /** Updated request object */
  request: TierUpgradeRequest
  /** Optional success message */
  message?: string
}

// ============================================
// Query Parameters
// ============================================

/**
 * Query parameters for listing tier upgrade requests
 */
export interface TierUpgradeRequestListQuery {
  /** Filter by status */
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
  /** Filter by target tier */
  targetTier?: number
  /** Filter by vendor ID */
  vendorId?: string
  /** Filter by creation date (after) */
  createdAfter?: string
  /** Filter by creation date (before) */
  createdBefore?: string
  /** Page number (default: 1) */
  page?: number
  /** Results per page (default: 10, max: 100) */
  limit?: number
  /** Sort field (default: createdAt) */
  sort?: 'createdAt' | 'updatedAt' | 'targetTier'
  /** Sort direction (default: desc) */
  order?: 'asc' | 'desc'
}
```

### Error Response Format

**Standard error response:**

```typescript
/**
 * Error response (all API endpoints)
 */
export interface APIError {
  /** Success flag (always false for errors) */
  success: false
  /** Error message (user-facing) */
  message: string
  /** Error code (for programmatic handling) */
  code: string
  /** Validation errors (if applicable) */
  errors?: Array<{
    field: string
    message: string
  }>
  /** Stack trace (development only) */
  stack?: string
}
```

**Error codes:**

```typescript
export enum TierUpgradeRequestErrorCode {
  // Authentication/Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_TIER = 'INVALID_TIER',
  JUSTIFICATION_TOO_SHORT = 'JUSTIFICATION_TOO_SHORT',
  JUSTIFICATION_TOO_LONG = 'JUSTIFICATION_TOO_LONG',

  // Business Logic
  PENDING_REQUEST_EXISTS = 'PENDING_REQUEST_EXISTS',
  CANNOT_DOWNGRADE = 'CANNOT_DOWNGRADE',
  ALREADY_MAX_TIER = 'ALREADY_MAX_TIER',
  REQUEST_NOT_PENDING = 'REQUEST_NOT_PENDING',

  // Not Found
  REQUEST_NOT_FOUND = 'REQUEST_NOT_FOUND',
  VENDOR_NOT_FOUND = 'VENDOR_NOT_FOUND',

  // Server Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}
```

### HTTP Status Codes

**Status code usage:**

| Code | Scenario | Example |
|------|----------|---------|
| 200 | Successful GET/PATCH/DELETE | Request retrieved/updated/cancelled |
| 201 | Successful POST | Request created |
| 400 | Validation error | Invalid tier, justification too short |
| 401 | Not authenticated | Missing/invalid JWT token |
| 403 | Not authorized | Vendor accessing another vendor's request |
| 404 | Resource not found | Request ID does not exist |
| 409 | Conflict | Vendor already has pending request |
| 429 | Rate limit exceeded | More than 10 requests/hour |
| 500 | Server error | Database connection failure |

### API Endpoint Specifications

**Vendor endpoints:**

```typescript
/**
 * Submit a new tier upgrade request
 * POST /api/portal/vendors/[id]/tier-upgrade-requests
 *
 * Auth: Vendor user (must own vendor with [id])
 * Rate limit: 10 requests/hour per vendor
 */
interface SubmitTierUpgradeRequest {
  request: {
    method: 'POST'
    headers: {
      'Authorization': 'Bearer <jwt_token>'
      'Content-Type': 'application/json'
    }
    body: CreateTierUpgradeRequestDTO
  }
  responses: {
    201: TierUpgradeRequestActionResponse
    400: APIError // Validation error
    401: APIError // Not authenticated
    403: APIError // Not authorized (wrong vendor)
    409: APIError // Pending request exists
    429: APIError // Rate limit exceeded
  }
}

/**
 * List all tier upgrade requests for a vendor
 * GET /api/portal/vendors/[id]/tier-upgrade-requests
 *
 * Auth: Vendor user (must own vendor with [id])
 */
interface ListVendorTierUpgradeRequests {
  request: {
    method: 'GET'
    headers: {
      'Authorization': 'Bearer <jwt_token>'
    }
    query: {
      status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
      page?: number
      limit?: number
    }
  }
  responses: {
    200: TierUpgradeRequestListResponse
    401: APIError // Not authenticated
    403: APIError // Not authorized
  }
}

/**
 * Cancel a pending tier upgrade request
 * DELETE /api/portal/vendors/[id]/tier-upgrade-requests/[requestId]
 *
 * Auth: Vendor user (must own vendor with [id])
 */
interface CancelTierUpgradeRequest {
  request: {
    method: 'DELETE'
    headers: {
      'Authorization': 'Bearer <jwt_token>'
    }
  }
  responses: {
    200: TierUpgradeRequestActionResponse
    400: APIError // Request not pending
    401: APIError // Not authenticated
    403: APIError // Not authorized
    404: APIError // Request not found
  }
}
```

**Admin endpoints:**

```typescript
/**
 * List all tier upgrade requests (admin view)
 * GET /api/admin/tier-upgrade-requests
 *
 * Auth: Admin user
 */
interface ListAllTierUpgradeRequests {
  request: {
    method: 'GET'
    headers: {
      'Authorization': 'Bearer <jwt_token>'
    }
    query: TierUpgradeRequestListQuery
  }
  responses: {
    200: TierUpgradeRequestListResponse
    401: APIError // Not authenticated
    403: APIError // Not admin
  }
}

/**
 * Get single tier upgrade request details
 * GET /api/admin/tier-upgrade-requests/[id]
 *
 * Auth: Admin user
 */
interface GetTierUpgradeRequest {
  request: {
    method: 'GET'
    headers: {
      'Authorization': 'Bearer <jwt_token>'
    }
  }
  responses: {
    200: { request: TierUpgradeRequest }
    401: APIError // Not authenticated
    403: APIError // Not admin
    404: APIError // Request not found
  }
}

/**
 * Approve a tier upgrade request
 * PATCH /api/admin/tier-upgrade-requests/[id]/approve
 *
 * Auth: Admin user
 */
interface ApproveTierUpgradeRequest {
  request: {
    method: 'PATCH'
    headers: {
      'Authorization': 'Bearer <jwt_token>'
      'Content-Type': 'application/json'
    }
    body: ApproveTierUpgradeRequestDTO
  }
  responses: {
    200: TierUpgradeRequestActionResponse
    400: APIError // Request not pending
    401: APIError // Not authenticated
    403: APIError // Not admin
    404: APIError // Request not found
    500: APIError // Tier update failed
  }
}

/**
 * Reject a tier upgrade request
 * PATCH /api/admin/tier-upgrade-requests/[id]/reject
 *
 * Auth: Admin user
 */
interface RejectTierUpgradeRequest {
  request: {
    method: 'PATCH'
    headers: {
      'Authorization': 'Bearer <jwt_token>'
      'Content-Type': 'application/json'
    }
    body: RejectTierUpgradeRequestDTO
  }
  responses: {
    200: TierUpgradeRequestActionResponse
    400: APIError // Request not pending or missing reason
    401: APIError // Not authenticated
    403: APIError // Not admin
    404: APIError // Request not found
  }
}
```

## Database Interactions

### Foreign Key Relationships

```sql
-- tier_upgrade_requests table
CREATE TABLE tier_upgrade_requests (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  current_tier INTEGER NOT NULL,
  target_tier INTEGER NOT NULL,
  business_justification TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT unique_pending_per_vendor UNIQUE (vendor_id, status)
    WHERE status = 'pending',
  CHECK (target_tier > current_tier),
  CHECK (target_tier >= 1 AND target_tier <= 4),
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

-- Indexes for performance
CREATE INDEX idx_tier_upgrade_requests_vendor ON tier_upgrade_requests(vendor_id);
CREATE INDEX idx_tier_upgrade_requests_status ON tier_upgrade_requests(status);
CREATE INDEX idx_tier_upgrade_requests_created ON tier_upgrade_requests(created_at DESC);
```

### Key Queries

**Find pending request by vendor:**

```typescript
async findPendingByVendor(vendorId: string): Promise<TierUpgradeRequest | null> {
  const result = await payload.find({
    collection: 'tier-upgrade-requests',
    where: {
      and: [
        { vendor: { equals: vendorId } },
        { status: { equals: 'pending' } }
      ]
    },
    limit: 1
  })

  return result.docs[0] || null
}
```

**List all with filters:**

```typescript
async listAllWithFilters(query: TierUpgradeRequestListQuery): Promise<TierUpgradeRequestListResponse> {
  const where: Where = { and: [] }

  // Build dynamic where clause
  if (query.status) {
    where.and.push({ status: { equals: query.status } })
  }
  if (query.targetTier) {
    where.and.push({ targetTier: { equals: query.targetTier } })
  }
  if (query.vendorId) {
    where.and.push({ vendor: { equals: query.vendorId } })
  }
  if (query.createdAfter) {
    where.and.push({ createdAt: { greater_than: query.createdAfter } })
  }
  if (query.createdBefore) {
    where.and.push({ createdAt: { less_than: query.createdBefore } })
  }

  return await payload.find({
    collection: 'tier-upgrade-requests',
    where: where.and.length > 0 ? where : undefined,
    page: query.page || 1,
    limit: query.limit || 10,
    sort: query.order === 'asc' ? query.sort : `-${query.sort}`
  })
}
```

**Approve request (atomic transaction):**

```typescript
async approve(requestId: string, adminUserId: string): Promise<void> {
  // Start transaction (Payload CMS handles this internally)
  await payload.db.beginTransaction()

  try {
    // 1. Get request
    const request = await payload.findByID({
      collection: 'tier-upgrade-requests',
      id: requestId
    })

    if (request.status !== 'pending') {
      throw new Error('Request is not pending')
    }

    // 2. Update vendor tier
    await payload.update({
      collection: 'vendors',
      id: request.vendor.id,
      data: { tier: request.targetTier }
    })

    // 3. Update request status
    await payload.update({
      collection: 'tier-upgrade-requests',
      id: requestId,
      data: {
        status: 'approved',
        reviewedBy: adminUserId,
        reviewedAt: new Date().toISOString()
      }
    })

    // Commit transaction
    await payload.db.commitTransaction()
  } catch (error) {
    // Rollback on error
    await payload.db.rollbackTransaction()
    throw error
  }
}
```

### Transaction Management

**Critical operations requiring transactions:**

1. **Approve request** - Update vendor tier + request status atomically
2. **Bulk approve** - Update multiple vendors + requests atomically
3. **Cancel request** - Update status + log cancellation

**Transaction isolation level:**
- Use `READ COMMITTED` for most operations
- Use `SERIALIZABLE` for concurrent request submission (prevent race conditions)

**Error handling:**
- Rollback on any error during transaction
- Log transaction failures for debugging
- Return clear error messages to user

## Compatibility Requirements

### Backward Compatibility

**No breaking changes to existing systems:**

1. **Vendor schema** - No modifications to existing `vendors` collection fields
   - New tier upgrade requests do not affect existing vendor data
   - Tier field continues to work exactly as before
   - Existing tier update API remains unchanged

2. **Tier badge displays** - All existing tier badges continue to work
   - Components reading `vendor.tier` unaffected
   - No changes to tier badge rendering logic
   - Tier colors and labels unchanged

3. **Access control** - Existing tier-based access control unaffected
   - `useTierAccess` hook continues to work
   - Location limits based on tier unchanged
   - Feature flags based on tier unchanged

### Integration Testing for Compatibility

**Test scenarios:**

1. **Existing tier update API still works**
   ```typescript
   test('admin can update vendor tier directly via existing API', async () => {
     const response = await PUT('/api/admin/vendors/123/tier', { tier: 3 })
     expect(response.status).toBe(200)
     expect(response.body.vendor.tier).toBe(3)
   })
   ```

2. **Tier badge displays correctly after approval**
   ```typescript
   test('tier badge shows updated tier after request approval', async () => {
     // Approve tier 1→2 upgrade
     await approveTierUpgradeRequest(requestId)

     // Verify badge shows Tier 2
     const vendor = await getVendor(vendorId)
     expect(vendor.tier).toBe(2)

     const badge = renderTierBadge(vendor)
     expect(badge).toHaveTextContent('Tier 2')
   })
   ```

3. **Location limits updated after tier upgrade**
   ```typescript
   test('location limit increases after tier upgrade approval', async () => {
     const vendor = await getVendor(vendorId) // Tier 1, max 1 location

     // Approve upgrade to Tier 2
     await approveTierUpgradeRequest(requestId)

     // Verify can now add 5 locations
     const updatedVendor = await getVendor(vendorId)
     const tierAccess = useTierAccess(updatedVendor)
     expect(tierAccess.maxLocations).toBe(5)
   })
   ```

### Migration Strategy

**No data migration required:**
- New feature adds new collection/table
- Existing data unchanged
- No schema modifications to existing tables

**Deployment approach:**
1. Deploy database schema (create `tier_upgrade_requests` table)
2. Deploy API endpoints (backward compatible)
3. Deploy UI components (feature flag controlled)
4. Enable feature for beta vendors
5. Enable feature for all vendors

**Rollback plan:**
- Disable feature flag to hide UI
- API endpoints remain but unused
- Database table remains (can be dropped later if needed)

## External Dependencies

### Email Service (Optional - Phase 2)

**Integration point:** Email notifications for request status changes

**Provider:** To be determined (SendGrid, AWS SES, or Resend)

**Email templates:**
1. Request submitted (to admins)
2. Request approved (to vendor)
3. Request rejected (to vendor)

**Contract:**
```typescript
interface EmailService {
  sendRequestSubmittedEmail(request: TierUpgradeRequest, admins: User[]): Promise<void>
  sendRequestApprovedEmail(request: TierUpgradeRequest): Promise<void>
  sendRequestRejectedEmail(request: TierUpgradeRequest): Promise<void>
}
```

### Analytics (Optional - Phase 2)

**Integration point:** Track tier upgrade request metrics

**Provider:** Existing analytics platform (if any)

**Events to track:**
- Request submitted
- Request approved
- Request rejected
- Request cancelled
- Admin review time (time to approve/reject)

**Contract:**
```typescript
interface AnalyticsService {
  trackEvent(eventName: string, properties: Record<string, any>): void
}

// Usage
analytics.trackEvent('tier_upgrade_request_submitted', {
  vendorId: request.vendor.id,
  currentTier: request.currentTier,
  targetTier: request.targetTier
})
```

## API Versioning

**Current approach:** No versioning (v1 implicit)

**Future considerations:**
- If breaking changes needed, introduce `/api/v2/...`
- Maintain `/api/v1/...` for backward compatibility
- Deprecation notices for old endpoints

## Rate Limiting

**Vendor endpoints:**
- 10 requests per hour per vendor for POST (submit request)
- 100 requests per hour for GET (list requests)

**Admin endpoints:**
- 1000 requests per hour (admin dashboard usage)

**Implementation:**
```typescript
import rateLimit from 'express-rate-limit'

const vendorSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => req.user.vendorId,
  message: 'Too many tier upgrade requests. Please try again later.'
})

app.post('/api/portal/vendors/:id/tier-upgrade-requests', vendorSubmitLimiter, handler)
```

## Caching Strategy

**No caching for mutations** (POST, PATCH, DELETE)

**Caching for reads:**
- Vendor request list: 5 minute cache (edge case: status might be slightly stale)
- Admin request list: No cache (real-time needed)

**Cache invalidation:**
- Invalidate vendor cache on status change
- Use cache tags: `vendor-${vendorId}-tier-requests`

## Error Handling

**Graceful degradation:**
- If email service fails, log error but complete request approval
- If analytics fails, log error but continue operation
- If cache fails, fall back to database query

**Logging:**
- Log all errors with context (request ID, user ID, timestamp)
- Use structured logging (JSON format)
- Include stack traces in development
- Redact sensitive data in production logs

## Security Considerations

**Input sanitization:**
- Sanitize business justification (prevent XSS)
- Validate all numeric inputs (tier values)
- Validate UUIDs/IDs format

**Authorization checks:**
- Verify JWT on every request
- Check vendor ownership for vendor endpoints
- Check admin role for admin endpoints
- Rate limit to prevent abuse

**Data access:**
- Vendors can only see own requests
- Admins can see all requests
- Use Payload CMS access control system
