# Task INTEG-API-CONTRACT: Validate API Contract Compatibility

**ID**: integ-api-contract
**Title**: Validate frontend-backend API contract compatibility
**Agent**: integration-coordinator
**Estimated Time**: 1 hour
**Dependencies**: test-frontend-integration
**Phase**: 4 - Frontend-Backend Integration

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 1280-1296, 1580-1585) - API contract specification
- @app/api/portal/vendors/[id]/route.ts - Backend API implementation
- @app/api/vendors/[slug]/route.ts - Public API implementation
- @lib/api/vendorClient.ts - Frontend API client
- Type files: payload-types.ts, lib/types/vendor.ts

## Objectives

1. Validate request/response types match between frontend and backend
2. Verify error response format consistency
3. Validate tier validation error codes match
4. Verify computed fields (yearsInBusiness) included in all responses
5. Check authentication/authorization implementation matches spec
6. Validate HTTP status codes consistent
7. Test API contract with integration tests

## Acceptance Criteria

- [ ] Frontend TypeScript types match backend payload-types.ts
- [ ] Error response format standardized (code, message, details)
- [ ] Tier validation errors use code TIER_PERMISSION_DENIED
- [ ] yearsInBusiness present in all vendor responses
- [ ] Authentication headers correct (Authorization: Bearer token)
- [ ] HTTP status codes match spec (200, 400, 401, 403, 404, 500)
- [ ] Frontend error handling expects correct error structure
- [ ] Integration tests pass between frontend and backend
- [ ] No type mismatches or casting required

## Testing Requirements

- Test GET /api/portal/vendors/[id] from frontend
- Test PUT /api/portal/vendors/[id] with validation errors
- Test GET /api/vendors/[slug] from public page
- Test authentication error handling (401)
- Test authorization error handling (403)
- Test tier validation error handling (400 with TIER_PERMISSION_DENIED)
- Test computed field presence in responses

## Evidence Requirements

- Type compatibility report
- Integration test results
- API contract validation checklist
- Error response examples
- List of any mismatches with fixes applied
