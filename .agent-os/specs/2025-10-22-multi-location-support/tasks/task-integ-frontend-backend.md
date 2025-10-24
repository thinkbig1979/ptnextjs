# Task: INTEG-FRONTEND-BACKEND - Frontend-Backend Integration

## Task Metadata
- **Task ID**: INTEG-FRONTEND-BACKEND
- **Phase**: Phase 4 - Frontend-Backend Integration
- **Agent**: integration-coordinator
- **Estimated Time**: 25-30 minutes
- **Dependencies**: INTEG-API-CONTRACT
- **Status**: [ ] Not Started

## Task Description
Integrate frontend and backend systems end-to-end. Test complete user workflows from UI interaction to database persistence and back. Verify data flows correctly through all layers (UI → API → Database → API → UI), test error propagation, and ensure state synchronization works correctly.

## Specifics
- **Test Files to Create**:
  - `/home/edwin/development/ptnextjs/__tests__/e2e/integration/full-stack-locations.test.ts`

- **Key Requirements**:
  - Test complete workflow: add location in dashboard → save → verify in database → view on public profile
  - Test geocoding workflow: enter address → geocode → coordinates populate → save → verify persisted
  - Test tier restriction workflow: tier1 vendor attempts multiple locations → error → verify not saved
  - Test HQ uniqueness workflow: attempt to mark two locations as HQ → error → verify validation
  - Test location search workflow: search by coordinates → verify tier-filtered results → verify correct locations returned
  - Test optimistic UI workflow: save location → UI updates immediately → verify rollback on error
  - Test data consistency: verify data matches across UI, API response, and database

- **Technical Details**:
  - Use Playwright for end-to-end browser testing
  - Use actual database (not mocked) for integration testing
  - Test with real API server running
  - Verify database state after each operation
  - Test with multiple browser sessions (simulate different user tiers)
  - Test network conditions (slow connection, timeout, failure)
  - Verify SWR cache invalidation and revalidation

## Acceptance Criteria
- [ ] End-to-end integration test file created
- [ ] Full workflow tests cover UI → API → Database → API → UI
- [ ] Geocoding integration works end-to-end
- [ ] Tier restriction enforcement works across all layers
- [ ] HQ uniqueness validation works across all layers
- [ ] Location search returns correct tier-filtered results
- [ ] Optimistic UI updates and rollback work correctly
- [ ] Data consistency verified across all layers
- [ ] All integration tests pass successfully (20+ test cases)
- [ ] Integration works correctly in production build

## Testing Requirements
- **Functional Testing**: Run full end-to-end integration tests - all tests must pass
- **Manual Verification**:
  - Manually test complete workflows in browser
  - Verify database state matches UI display
  - Test with different user tiers
- **Browser Testing**: Test in Chrome, Firefox, Safari using Playwright
- **Error Testing**: Test error propagation from backend to frontend

## Evidence Required
- End-to-end integration test file
- Test output showing all tests passing
- Screenshots/videos of complete workflows
- Database queries showing correct data persistence
- Network traces showing API calls
- Evidence of error handling and rollback behavior

## Context Requirements
- Implemented frontend components from Phase 3
- Implemented backend API from Phase 2
- API contract validation from INTEG-API-CONTRACT
- Running development server and database

## Implementation Notes
- Use test database to avoid affecting production data
- Implement test data cleanup after each test
- Test with realistic scenarios (actual addresses, coordinates)
- Verify all async operations complete before assertions
- Test with various network conditions (throttling, offline)
- Document any integration issues found and resolved

## Quality Gates
- [ ] All end-to-end tests pass (100% success rate)
- [ ] Data flows correctly through all layers
- [ ] Error handling works across full stack
- [ ] State synchronization works correctly
- [ ] Integration works in production build

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Related Tasks: INTEG-API-CONTRACT, TEST-BACKEND-INTEGRATION, TEST-FRONTEND-INTEGRATION, TEST-E2E-WORKFLOW
