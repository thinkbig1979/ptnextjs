# Task IMPL-BACKEND-API-PUT: Implement PUT Vendor API Endpoint

**ID**: impl-backend-api-put
**Title**: Implement PUT /api/portal/vendors/[id] endpoint with tier validation
**Agent**: backend-nodejs-specialist
**Estimated Time**: 2 hours
**Dependencies**: impl-backend-api-get
**Phase**: 2 - Backend Implementation

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 479-542) - API specification
- @app/api/portal/vendors/[id]/route.ts - GET handler from previous task
- @lib/services/VendorProfileService.ts - Service layer
- @lib/services/TierValidationService.ts - Tier validation

## Objectives

1. Implement PUT handler in Next.js API route
2. Validate authentication (JWT token required)
3. Validate authorization (vendor ownership or admin role)
4. Parse and validate request body (Zod schema)
5. Run tier validation for all fields in update data
6. Use VendorProfileService.updateVendorProfile() for database update
7. Enrich response with recomputed fields (yearsInBusiness)
8. Return proper error responses for validation failures
9. Implement proper HTTP status codes (200, 400, 401, 403, 404, 500)
10. Add detailed error logging

## Acceptance Criteria

- [ ] PUT handler added to app/api/portal/vendors/[id]/route.ts
- [ ] Request body validation using Zod schema
- [ ] Tier validation checks all fields before update
- [ ] Error response includes field-level validation errors
- [ ] Location limit validation prevents exceeding tier limit
- [ ] Computed fields recomputed after update
- [ ] Response uses standardized success/error format
- [ ] Proper HTTP status codes for all error types
- [ ] Tier permission errors return code TIER_PERMISSION_DENIED
- [ ] All validation errors logged with details

## Testing Requirements

- Test successful profile update (200)
- Test update with tier-restricted field (403 with TIER_PERMISSION_DENIED)
- Test update exceeding location limit (400 with validation error)
- Test update with invalid data types (400)
- Test update with invalid year ranges (400)
- Test unauthenticated update (401)
- Test unauthorized update (403)
- Test yearsInBusiness recomputed correctly after foundedYear change
- Test admin can update tier-restricted fields

## Evidence Requirements

- Updated app/api/portal/vendors/[id]/route.ts with PUT handler
- lib/validation/vendorSchemas.ts (Zod schemas)
- Integration test file
- Test execution results for all scenarios
- Example error responses showing field-level errors
