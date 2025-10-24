# Task IMPL-BACKEND-API-GET: Implement GET Vendor API Endpoint

**ID**: impl-backend-api-get
**Title**: Implement GET /api/portal/vendors/[id] endpoint for dashboard editing
**Agent**: backend-nodejs-specialist
**Estimated Time**: 1.5 hours
**Dependencies**: impl-backend-services
**Phase**: 2 - Backend Implementation

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 429-476) - API specification
- @app/api/portal/vendors/[id]/route.ts - Existing vendor API (if exists)
- @lib/services/VendorProfileService.ts - Service layer from previous task

## Objectives

1. Create Next.js API route handler for GET /api/portal/vendors/[id]
2. Implement authentication check (JWT token required)
3. Implement authorization (vendor can only access own profile, admins can access any)
4. Use VendorProfileService.getVendorForEdit() to fetch vendor data
5. Enrich response with computed fields (yearsInBusiness)
6. Return standardized response format with success/error structure
7. Implement proper HTTP status codes (200, 401, 403, 404, 500)
8. Add error logging for debugging

## Acceptance Criteria

- [ ] API route file created at app/api/portal/vendors/[id]/route.ts
- [ ] GET handler implements authentication check
- [ ] Authorization enforces vendor ownership or admin role
- [ ] Response includes all tier-appropriate fields
- [ ] Computed fields (yearsInBusiness) included in response
- [ ] Error responses use standardized format with code and message
- [ ] Proper HTTP status codes returned for all scenarios
- [ ] Request/response types match technical spec interfaces
- [ ] Error logging captures sufficient debugging info

## Testing Requirements

- Test authenticated request for vendor's own profile (200)
- Test admin request for any vendor profile (200)
- Test unauthenticated request (401)
- Test vendor accessing another vendor's profile (403)
- Test non-existent vendor ID (404)
- Test computed field (yearsInBusiness) present in response
- Test tier-restricted fields only returned for appropriate tiers

## Evidence Requirements

- app/api/portal/vendors/[id]/route.ts
- Integration test file
- Test execution results showing all scenarios passing
- Example API responses for each status code
