# Task: impl-backend-types

## Task Metadata
- **Task ID**: impl-backend-types
- **Task Title**: Implement TypeScript Type Definitions
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 15-20 minutes
- **Dependencies**: [impl-backend-collection]
- **Status**: Pending
- **References**: ptnextjs-bbec (Backend API/Database)

## Objective
Create comprehensive TypeScript type definitions for the TierUpgradeRequest system, following existing type patterns from the Vendors collection and ensuring type safety across the application.

## Context
- **Existing Types**: `/home/edwin/development/ptnextjs/lib/types.ts` (Vendor interface starting at line 306)
- **Collection**: `/home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests.ts`
- **Integration Strategy**: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-11-04-tier-upgrade-request-system/integration-strategy.md`

## Implementation Details

### Types to Add (in `/home/edwin/development/ptnextjs/lib/types.ts`)

#### 1. Core TierUpgradeRequest Interface

```typescript
export interface TierUpgradeRequest {
  id: string;
  vendor: string | Vendor; // Relationship - can be ID or populated object
  user: string | User; // Relationship - can be ID or populated object
  currentTier: 'free' | 'tier1' | 'tier2' | 'tier3';
  requestedTier: 'tier1' | 'tier2' | 'tier3'; // Cannot request 'free'
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  vendorNotes?: string; // Optional business justification (max 500 chars)
  rejectionReason?: string; // Optional admin rejection reason (max 1000 chars)
  reviewedBy?: string | User; // Relationship - admin who reviewed
  requestedAt: string; // ISO 8601 timestamp
  reviewedAt?: string; // ISO 8601 timestamp
  createdAt: string; // Payload auto timestamp
  updatedAt: string; // Payload auto timestamp
}
```

#### 2. API Request/Response Types

```typescript
// POST /api/portal/vendors/[id]/tier-upgrade-request
export interface CreateTierUpgradeRequestPayload {
  requestedTier: 'tier1' | 'tier2' | 'tier3';
  vendorNotes?: string; // Optional, max 500 chars
}

export interface CreateTierUpgradeRequestResponse {
  success: true;
  data: TierUpgradeRequest;
}

// GET /api/portal/vendors/[id]/tier-upgrade-request
export interface GetTierUpgradeRequestResponse {
  success: true;
  data: TierUpgradeRequest | null; // null if no request found
}

// DELETE /api/portal/vendors/[id]/tier-upgrade-request/[requestId]
export interface DeleteTierUpgradeRequestResponse {
  success: true;
  data: {
    message: string;
  };
}

// PUT /api/admin/tier-upgrade-requests/[id]/approve
export interface ApproveTierUpgradeRequestResponse {
  success: true;
  data: {
    request: TierUpgradeRequest;
    vendor: Vendor; // Updated vendor with new tier
  };
}

// PUT /api/admin/tier-upgrade-requests/[id]/reject
export interface RejectTierUpgradeRequestPayload {
  rejectionReason?: string; // Optional, max 1000 chars
}

export interface RejectTierUpgradeRequestResponse {
  success: true;
  data: TierUpgradeRequest;
}
```

#### 3. Error Response Types

```typescript
export interface TierUpgradeRequestError {
  success: false;
  error: {
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'DUPLICATE_REQUEST' | 'INVALID_STATUS' | 'SERVER_ERROR';
    message: string;
    fields?: Record<string, string>; // Field-specific validation errors
    details?: string; // Additional error context
  };
}
```

#### 4. Service Layer Types

```typescript
export interface TierUpgradeValidationResult {
  valid: boolean;
  error?: string;
}

export interface TierUpgradeRequestFilters {
  vendorId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedTier?: 'tier1' | 'tier2' | 'tier3';
  fromDate?: string; // ISO 8601 date
  toDate?: string; // ISO 8601 date
}
```

### File Location
Add all types to the existing `/home/edwin/development/ptnextjs/lib/types.ts` file after the Vendor-related types (after line 390).

### Integration Pattern

Follow the existing pattern in `types.ts`:
1. Add new interfaces after existing Vendor/Product types
2. Export all interfaces for use across the application
3. Use consistent naming: `TierUpgradeRequest` prefix for all related types
4. Use union types for status and tier enums
5. Mark optional fields with `?`
6. Use string for dates (ISO 8601 format)
7. Allow relationships to be either ID strings or populated objects

## Acceptance Criteria

### Type Definitions Complete
- [ ] Core `TierUpgradeRequest` interface defined with all 13 fields
- [ ] `CreateTierUpgradeRequestPayload` interface for POST request body
- [ ] `CreateTierUpgradeRequestResponse` interface for success response
- [ ] `GetTierUpgradeRequestResponse` interface for GET endpoint
- [ ] `DeleteTierUpgradeRequestResponse` interface for DELETE endpoint
- [ ] `ApproveTierUpgradeRequestResponse` interface for approve endpoint
- [ ] `RejectTierUpgradeRequestPayload` interface for reject request body
- [ ] `RejectTierUpgradeRequestResponse` interface for reject response
- [ ] `TierUpgradeRequestError` interface for error responses
- [ ] `TierUpgradeValidationResult` interface for service layer
- [ ] `TierUpgradeRequestFilters` interface for query filters

### Type Safety Verified
- [ ] TypeScript compilation succeeds without errors
- [ ] Existing type exports remain unchanged
- [ ] All tier enums match Payload collection options
- [ ] All status enums match Payload collection options
- [ ] Relationship types allow both ID and populated object
- [ ] Optional fields marked correctly with `?`

### Documentation Complete
- [ ] All interfaces have JSDoc comments
- [ ] Field constraints documented (max lengths, required/optional)
- [ ] Relationship types documented (ID vs populated)
- [ ] Enum values documented with descriptions

## Testing Requirements

### Type Checking
```bash
npm run type-check
```

**Expected Result**: No TypeScript errors

### Verify Types in Service
```bash
# Check that TierUpgradeRequestService.ts can import types
grep -n "import.*TierUpgradeRequest" lib/services/TierUpgradeRequestService.ts
```

**Expected Result**: Should be able to import new types (may need to update service to use them)

## Implementation Checklist

- [ ] Add all 11 interface definitions to `/home/edwin/development/ptnextjs/lib/types.ts`
- [ ] Add JSDoc comments for each interface
- [ ] Verify tier enums match collection ('free', 'tier1', 'tier2', 'tier3')
- [ ] Verify status enums match collection ('pending', 'approved', 'rejected', 'cancelled')
- [ ] Run `npm run type-check` to verify no errors
- [ ] Verify existing types still compile
- [ ] Update task detail file to mark as complete
- [ ] Mark task complete in tasks.md

## Success Evidence

Provide evidence that types are working correctly:

1. **TypeScript Compilation**: Output of `npm run type-check` showing no errors
2. **Type Exports**: Confirmation that all interfaces are exported and usable
3. **Integration**: Screenshot or code showing types used in service/API files

## Notes

- Follow existing naming conventions in `types.ts`
- All date fields should be `string` type (ISO 8601 format)
- Relationship fields should use union type: `string | RelatedType`
- Error response type should include all possible error codes
- API response types should extend a base success response pattern
