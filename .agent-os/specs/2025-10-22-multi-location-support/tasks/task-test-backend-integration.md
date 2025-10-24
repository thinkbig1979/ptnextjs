# Task: TEST-BACKEND-INTEGRATION - Backend Integration Testing

## Task Metadata
- **Task ID**: TEST-BACKEND-INTEGRATION
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: test-architect
- **Estimated Time**: 25-30 minutes
- **Dependencies**: IMPL-BACKEND-API
- **Status**: [ ] Not Started

## Task Description
Create comprehensive integration test suite for backend API endpoints, database operations, and business logic. Test complete request/response flows, database persistence, validation error handling, and tier-based access control across all backend components.

## Specifics
- **Test Files to Create**:
  - `/home/edwin/development/ptnextjs/__tests__/integration/api/vendors-locations-api.test.ts`
  - `/home/edwin/development/ptnextjs/__tests__/integration/services/location-service.test.ts`
  - `/home/edwin/development/ptnextjs/__tests__/integration/services/search-service.test.ts`

- **Key Requirements**:
  - Test PATCH /api/vendors/:id with complete request/response flow
  - Test GET /api/vendors/search with various radius and tier combinations
  - Test database persistence after API updates
  - Test authentication and authorization checks
  - Test validation error responses with proper status codes
  - Test LocationService distance calculations and validation methods
  - Test SearchService tier-aware filtering logic
  - Test migration script integration with new schema

- **Technical Details**:
  - Use Jest for test framework
  - Use supertest for API endpoint testing
  - Set up test database with sample vendor data
  - Mock authentication where needed
  - Test with multiple vendor tiers (free, tier1, tier2)
  - Test edge cases (empty locations, single location, 10+ locations)
  - Clean up test data after each test

## Acceptance Criteria
- [ ] API integration tests cover all endpoints (PATCH, GET search)
- [ ] Tests verify request body validation and error responses
- [ ] Tests verify authentication and authorization checks
- [ ] Tests verify database updates persist correctly
- [ ] Tests verify tier-based access control works end-to-end
- [ ] LocationService tests cover distance calculation accuracy
- [ ] SearchService tests verify tier filtering and radius filtering
- [ ] All tests pass successfully (20+ test cases)
- [ ] Test coverage for backend code is >80%

## Testing Requirements
- **Functional Testing**: Run full integration test suite - all tests must pass
- **Manual Verification**: Review test coverage report for gaps
- **Browser Testing**: N/A (backend testing only)
- **Error Testing**: Verify all error scenarios return proper status codes and messages

## Evidence Required
- Test files with comprehensive integration tests
- Test output showing all tests passing
- Test coverage report showing >80% coverage for backend code
- Documentation of test scenarios covered
- Sample test data and expected outcomes

## Context Requirements
- Implemented API endpoints from IMPL-BACKEND-API
- Implemented services from IMPL-BACKEND-API
- Test database setup and teardown utilities
- Existing integration test patterns in codebase

## Implementation Notes
- Use beforeEach/afterEach hooks for database setup/cleanup
- Create reusable test fixtures for vendor data
- Test with realistic location data (actual cities and coordinates)
- Include performance tests for search with large datasets
- Document any known limitations or edge cases

## Quality Gates
- [ ] All integration tests pass (100% success rate)
- [ ] Test coverage meets 80% threshold for backend code
- [ ] Tests cover all API endpoints and service methods
- [ ] Tests verify error handling and edge cases

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Related Tasks: IMPL-BACKEND-API, INTEG-API-CONTRACT
