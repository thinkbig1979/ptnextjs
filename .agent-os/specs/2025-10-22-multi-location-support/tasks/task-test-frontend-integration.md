# Task: TEST-FRONTEND-INTEGRATION - Frontend Integration Testing

## Task Metadata
- **Task ID**: TEST-FRONTEND-INTEGRATION
- **Phase**: Phase 3 - Frontend Implementation
- **Agent**: test-architect
- **Estimated Time**: 25-30 minutes
- **Dependencies**: IMPL-TIER-GATING
- **Status**: [ ] Not Started

## Task Description
Create comprehensive integration test suite for frontend components working together. Test complete user workflows from dashboard location management to public profile display, including API integration, state management, and tier-based access control across all frontend components.

## Specifics
- **Test Files to Create**:
  - `/home/edwin/development/ptnextjs/__tests__/integration/dashboard/locations-workflow.test.tsx`
  - `/home/edwin/development/ptnextjs/__tests__/integration/vendors/profile-locations-display.test.tsx`
  - `/home/edwin/development/ptnextjs/__tests__/integration/tier-access-control.test.tsx`

- **Key Requirements**:
  - Test complete dashboard workflow: login → navigate to profile → add location → geocode → save
  - Test tier-based rendering: tier2 sees LocationsManagerCard, tier1 sees TierUpgradePrompt
  - Test public profile display: locations appear correctly, map renders, tier filtering works
  - Test API integration: mock API calls, verify request/response handling
  - Test state management: SWR cache updates, optimistic UI, error rollback
  - Test form validation: invalid inputs blocked, error messages displayed
  - Test geocoding integration: API mock, coordinate population, error handling
  - Test map component integration: markers render, popups work, responsive behavior

- **Technical Details**:
  - Use Jest and React Testing Library for component integration tests
  - Use MSW (Mock Service Worker) for API mocking
  - Mock Next.js router for navigation tests
  - Mock authentication context for tier-based tests
  - Test with realistic vendor data (multiple tiers, various location counts)
  - Test loading states, success states, and error states
  - Test responsive behavior at different breakpoints

## Acceptance Criteria
- [ ] Integration test files created for all major workflows (3 files)
- [ ] Dashboard workflow tests cover full user journey (login to save)
- [ ] Tier-based tests verify correct components render for each tier
- [ ] Public profile tests verify locations display correctly
- [ ] API integration tests verify request/response handling
- [ ] State management tests verify SWR cache behavior
- [ ] Form validation tests verify error handling
- [ ] Geocoding tests verify API integration and error handling
- [ ] Map tests verify marker rendering and interactions
- [ ] All integration tests pass successfully (30+ test cases)
- [ ] Test coverage for frontend code is >80%

## Testing Requirements
- **Functional Testing**: Run full frontend integration test suite - all tests must pass
- **Manual Verification**: Review test coverage report for gaps
- **Browser Testing**: Use Playwright for cross-browser integration tests
- **Error Testing**: Verify error scenarios return proper error states and messages

## Evidence Required
- Test files with comprehensive integration tests
- Test output showing all tests passing
- Test coverage report showing >80% coverage for frontend code
- Documentation of test scenarios covered
- MSW mock definitions for API endpoints

## Context Requirements
- All implemented frontend components (IMPL-DASHBOARD-LOCATIONS, IMPL-PUBLIC-PROFILE, etc.)
- Backend API endpoints from IMPL-BACKEND-API
- SWR patterns in existing codebase
- Existing integration test patterns

## Implementation Notes
- Use beforeEach/afterEach hooks for test setup/cleanup
- Create reusable test fixtures for vendor and location data
- Mock API responses for consistent test results
- Test with various tier levels and location counts
- Include performance tests for rendering large location lists
- Document any known limitations or edge cases

## Quality Gates
- [ ] All integration tests pass (100% success rate)
- [ ] Test coverage meets 80% threshold for frontend code
- [ ] Tests cover all major user workflows
- [ ] Tests verify error handling and edge cases

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Related Tasks: IMPL-DASHBOARD-LOCATIONS, IMPL-PUBLIC-PROFILE, IMPL-TIER-GATING, IMPL-GEOCODING, IMPL-MAP-COMPONENT
