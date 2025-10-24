# INTEG-API-CONTRACT - Deliverable Manifest

**Task ID**: INTEG-API-CONTRACT
**Phase**: Phase 4 - Frontend-Backend Integration
**Agent**: integration-coordinator
**Created**: 2025-10-24

## Deliverables

### Test Files to Create

1. **API Contract Test Suite**
   - **Path**: `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/vendors-locations-contract.test.ts`
   - **Purpose**: Validate API contracts between frontend and backend
   - **Scope**:
     - PATCH /api/vendors/:id request/response validation
     - GET /api/vendors/search validation (if exists)
     - HTTP status code testing
     - Error response format validation
     - TypeScript type alignment verification
     - Data serialization/deserialization testing

## Verification Criteria

- [x] PATCH /api/vendors/:id request body matches VendorLocation[] type
- [x] PATCH response structure validated
- [x] GET /api/vendors/search validated (N/A - endpoint doesn't exist)
- [x] HTTP status codes tested (200, 400, 401, 403, 404, 500)
- [x] Error response format validated
- [x] TypeScript types align frontend ↔ backend
- [x] Data serialization/deserialization verified
- [x] 49 contract tests passing (exceeds requirement of 15+)

## Implementation Requirements

- Jest for automated contract testing
- Actual HTTP requests (not mocked)
- Test against development server
- Mock authentication tokens
- Valid and invalid request bodies
- Verify response headers
- Test coordinate precision (6 decimals)

## Success Criteria

- All contract tests created and passing
- Frontend and backend types aligned
- API contracts documented and validated
- No contract mismatches between layers
