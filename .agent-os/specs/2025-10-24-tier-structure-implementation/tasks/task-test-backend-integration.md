# Task TEST-BACKEND-INTEGRATION: Backend Integration Testing

**ID**: test-backend-integration
**Title**: Comprehensive backend integration testing across all components
**Agent**: quality-assurance
**Estimated Time**: 2 hours
**Dependencies**: impl-backend-api-public
**Phase**: 2 - Backend Implementation

## Context Requirements

Read these files:
- All backend task files (task-impl-backend-*.md)
- @app/api/portal/vendors/[id]/route.ts - Portal API
- @app/api/vendors/[slug]/route.ts - Public API
- @lib/services/*.ts - All service layer files
- @payload/collections/Vendors.ts - Schema

## Objectives

1. Execute full backend test suite
2. Test end-to-end flows (create vendor → add tier fields → fetch via API)
3. Test tier validation across all services
4. Test computed field calculation in all contexts
5. Test authorization and authentication flows
6. Test error handling and edge cases
7. Generate test coverage report
8. Identify and document any gaps or failures

## Acceptance Criteria

- [ ] All unit tests pass (services, validation, computed fields)
- [ ] All integration tests pass (API endpoints, database operations)
- [ ] Test coverage ≥80% for backend code
- [ ] End-to-end scenarios pass for all 4 tiers
- [ ] Tier validation correctly rejects unauthorized field access
- [ ] Authorization correctly enforces ownership and admin roles
- [ ] Computed fields (yearsInBusiness) correct in all contexts
- [ ] Error responses match standardized format
- [ ] No memory leaks or performance issues detected
- [ ] All edge cases handled gracefully

## Testing Requirements

Execute these test suites:
- Unit tests: TierValidationService (16 scenarios)
- Unit tests: VendorComputedFieldsService (8 scenarios)
- Unit tests: VendorProfileService (12 scenarios)
- Integration tests: GET /api/portal/vendors/[id] (7 scenarios)
- Integration tests: PUT /api/portal/vendors/[id] (9 scenarios)
- Integration tests: GET /api/vendors/[slug] (8 scenarios)
- End-to-end tests: Full vendor lifecycle for each tier

## Evidence Requirements

- Test execution summary (all tests passed/failed)
- Test coverage report (HTML or console output)
- Performance metrics (API response times, database query times)
- Edge case test results
- List of any failing tests with root cause analysis
