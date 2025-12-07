# Quick Reference: Admin Tier Request API Contract Tests

**Issue**: ptnextjs-xezn
**Status**: ✅ COMPLETED
**Date**: 2025-12-07

## Test File Location
```
/home/edwin/development/ptnextjs/__tests__/integration/api-contract/admin-tier-request-api-contract.test.ts
```

## Run Tests
```bash
# Run this test file only
npm test -- __tests__/integration/api-contract/admin-tier-request-api-contract.test.ts

# Run all API contract tests
npm test -- __tests__/integration/api-contract/

# Run with coverage
npm run test:coverage -- __tests__/integration/api-contract/admin-tier-request-api-contract.test.ts
```

## Test Coverage Summary

| Category | Tests | Description |
|----------|-------|-------------|
| API Response Structure | 2 | Verify response format and pagination |
| Component Parsing | 5 | Extract requests array correctly |
| Bug Regression | 3 | Prevent bug reoccurrence |
| Edge Cases | 4 | Handle null/undefined/malformed data |
| Type Safety | 2 | Validate TypeScript interfaces |
| Query Params | 2 | Filter parameters validation |
| **TOTAL** | **18** | **Comprehensive coverage** |

## The Bug (Fixed)

### What Was Wrong
```typescript
// WRONG: Returns object, not array
const requests = data.data;
// Result: { requests: [...], totalCount: 1, page: 1, totalPages: 1 }
//         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//         This is an OBJECT - cannot be iterated in .map()
```

### What's Correct
```typescript
// CORRECT: Returns array
const requests = data.data?.requests || data.requests || [];
//                    ^^^^^^^^
//                    Access the 'requests' property
// Result: [{ id: '1', ... }, { id: '2', ... }]
//         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//         This is an ARRAY - can be iterated
```

## API Contract

### Backend Returns
```typescript
// app/api/admin/tier-upgrade-requests/route.ts:101
{
  success: true,
  data: {
    requests: TierUpgradeRequest[],  // ← The array
    totalCount: number,
    page: number,
    totalPages: number
  }
}
```

### Component Expects
```typescript
// components/admin/AdminTierRequestQueue.tsx:177
data.data?.requests  // ← Primary path (correct)
|| data.requests     // ← Fallback (legacy)
|| []                // ← Final fallback (empty)
```

## Key Files

| File | Path |
|------|------|
| Test Suite | `__tests__/integration/api-contract/admin-tier-request-api-contract.test.ts` |
| Component | `components/admin/AdminTierRequestQueue.tsx` |
| API Route | `app/api/admin/tier-upgrade-requests/route.ts` |
| Service | `lib/services/TierUpgradeRequestService.ts` |

## Documentation

| Document | Location |
|----------|----------|
| Test Suite Docs | `Supporting-Docs/ADMIN-TIER-REQUEST-API-CONTRACT-TEST-SUITE.md` |
| Bug Diagram | `Supporting-Docs/admin-tier-request-parsing-bug-diagram.md` |
| Creation Summary | `Supporting-Docs/ptnextjs-xezn-TEST-CREATION-SUMMARY.md` |
| Quick Reference | `Supporting-Docs/QUICK-REFERENCE-admin-tier-request-api-tests.md` (this file) |

## Expected Test Output

```
PASS __tests__/integration/api-contract/admin-tier-request-api-contract.test.ts
  Admin Tier Request Queue API Contract
    API Response Structure
      ✓ should return correct nested structure: { success, data: { requests, pagination } }
      ✓ should include pagination metadata in data object
    Component Response Parsing
      ✓ should correctly extract requests array from nested data.data.requests
      ✓ should handle empty requests array correctly
      ✓ should fallback to data.requests if data.data is missing (defensive coding)
      ✓ should fallback to empty array if both data.data.requests and data.requests are missing
      ✓ should NOT crash when data.data is an object without requests property
    Bug Regression Tests (ptnextjs-xezn)
      ✓ should NOT access data.data as array (the bug)
      ✓ should correctly access data.data.requests as array (the fix)
      ✓ should verify component parsing matches API structure exactly
    Edge Cases and Error Scenarios
      ✓ should handle null data object
      ✓ should handle undefined data object
      ✓ should handle requests being null instead of array
      ✓ should preserve request type distinction (upgrade vs downgrade)
    Type Safety Validation
      ✓ should match ApiSuccessResponse interface structure
      ✓ should validate TierUpgradeRequest interface fields
    Filter Query Parameters
      ✓ should send status=pending and requestType filters in query params
      ✓ should not send requestType param when filter is "all"

Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
```

## Framework Notes

- **Framework**: Jest (not Vitest)
- **Environment**: jsdom
- **Config**: `jest.config.js`
- **Timeout**: 15 seconds per test
- **Workers**: 2 parallel workers

## Quick Debugging

### If Tests Fail

1. **Check API response structure**:
   ```bash
   curl http://localhost:3000/api/admin/tier-upgrade-requests?status=pending
   ```

2. **Verify component parsing logic**:
   ```typescript
   // components/admin/AdminTierRequestQueue.tsx:177
   console.log('API Response:', data);
   console.log('Extracted Requests:', data.data?.requests);
   ```

3. **Run single test**:
   ```bash
   npm test -- __tests__/integration/api-contract/admin-tier-request-api-contract.test.ts -t "should correctly extract"
   ```

## Maintenance

- ✅ Tests are ready to run
- ✅ No additional setup required
- ✅ Follow existing test patterns for new tests
- ✅ Update tests if API contract changes
- ✅ Add regression tests for future bugs

## Status: READY FOR USE ✅

All tests created, documented, and ready for integration into the test suite.
