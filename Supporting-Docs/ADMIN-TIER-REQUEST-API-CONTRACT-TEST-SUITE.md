# Admin Tier Request Queue API Contract Test Suite

**Issue**: ptnextjs-xezn - Admin Tier Request Queue API response parsing bug
**Test File**: `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/admin-tier-request-api-contract.test.ts`
**Status**: ✅ COMPLETED
**Date**: 2025-12-07

## Overview

Comprehensive test suite created to verify the API response structure contract between the backend API endpoint and the AdminTierRequestQueue frontend component.

### Bug Context

The component was incorrectly accessing `data.data` (object) instead of `data.data.requests` (array), which would cause the tier request table to display no requests even when they existed in the API response.

## Test Coverage

### 1. API Response Structure (2 tests)
- ✅ Verifies correct nested structure: `{ success, data: { requests, pagination } }`
- ✅ Validates pagination metadata is at `data` level, not top level

### 2. Component Response Parsing (5 tests)
- ✅ Correctly extracts requests array from `data.data.requests`
- ✅ Handles empty requests array correctly
- ✅ Fallback to `data.requests` if `data.data` is missing (defensive coding)
- ✅ Fallback to empty array if both paths are missing
- ✅ Does NOT crash when `data.data` is object without `requests` property

### 3. Bug Regression Tests (3 tests)
- ✅ Documents that `data.data` is an OBJECT, not an array (the bug)
- ✅ Verifies `data.data.requests` is the correct array access (the fix)
- ✅ Full end-to-end component parsing matches API structure exactly

### 4. Edge Cases and Error Scenarios (5 tests)
- ✅ Handles null `data` object
- ✅ Handles undefined `data` object
- ✅ Handles `requests` being null instead of array
- ✅ Preserves request type distinction (upgrade vs downgrade)

### 5. Type Safety Validation (2 tests)
- ✅ Matches `ApiSuccessResponse` interface structure
- ✅ Validates `TierUpgradeRequest` interface fields

### 6. Filter Query Parameters (2 tests)
- ✅ Sends `status=pending` and `requestType` filters in query params
- ✅ Does not send `requestType` param when filter is "all"

## Test Statistics

- **Total Test Suites**: 6 describe blocks
- **Total Test Cases**: 18 tests
- **Framework**: Jest (configured with Next.js)
- **Environment**: jsdom

## API Contract Verified

### Backend Response Structure
```typescript
// app/api/admin/tier-upgrade-requests/route.ts
{
  success: true,
  data: {
    requests: TierUpgradeRequest[],
    totalCount: number,
    page: number,
    totalPages: number
  }
}
```

### Frontend Parsing Logic
```typescript
// components/admin/AdminTierRequestQueue.tsx line 177
const extractedRequests = data.data?.requests || data.requests || [];
```

This defensive parsing handles:
1. Current API format: `data.data.requests` ✅
2. Legacy format: `data.requests` (fallback)
3. Malformed responses: `[]` (empty array fallback)

## Running the Tests

```bash
# Run this specific test file
npm test -- __tests__/integration/api-contract/admin-tier-request-api-contract.test.ts

# Run all API contract tests
npm test -- __tests__/integration/api-contract/

# Run with coverage
npm run test:coverage -- __tests__/integration/api-contract/admin-tier-request-api-contract.test.ts
```

## Key Implementation Details

### Component Reference
- **File**: `/home/edwin/development/ptnextjs/components/admin/AdminTierRequestQueue.tsx`
- **Response Parsing**: Line 177
- **Fetch Logic**: Lines 152-189

### API Route Reference
- **File**: `/home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/route.ts`
- **Response Format**: Line 101
- **Service Integration**: Line 97

### Service Reference
- **File**: `/home/edwin/development/ptnextjs/lib/services/TierUpgradeRequestService.ts`
- **Interface**: `ListRequestsResult` (lines 94-99)
- **Function**: `listRequests()` (line 523+)

## Related Files

- Component: `/home/edwin/development/ptnextjs/components/admin/AdminTierRequestQueue.tsx`
- API Route: `/home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/route.ts`
- Service: `/home/edwin/development/ptnextjs/lib/services/TierUpgradeRequestService.ts`
- Test Suite: `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/admin-tier-request-api-contract.test.ts`

## Notes

- All tests use Jest's standard matchers (`toBe`, `toHaveLength`, `toHaveProperty`, etc.)
- Tests are defensive and verify both happy path and error scenarios
- Type safety is validated through TypeScript interface matching
- Component parsing logic includes fallbacks for API format changes
- Tests document the bug (accessing object instead of array) for future reference
