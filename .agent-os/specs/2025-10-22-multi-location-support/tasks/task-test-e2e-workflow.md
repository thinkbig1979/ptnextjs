# Task: TEST-E2E-WORKFLOW - End-to-End Workflow Testing

## Task Metadata
- **Task ID**: TEST-E2E-WORKFLOW
- **Phase**: Phase 4 - Frontend-Backend Integration
- **Agent**: test-architect
- **Estimated Time**: 30-35 minutes
- **Dependencies**: INTEG-FRONTEND-BACKEND
- **Status**: [ ] Not Started

## Task Description
Create comprehensive end-to-end test suite using Playwright covering all user stories from spec. Test complete user journeys from login through feature usage to final verification. Include tests for all tier levels, error scenarios, and edge cases to ensure feature works correctly in production-like environment.

## Specifics
- **Test Files to Create**:
  - `/home/edwin/development/ptnextjs/__tests__/e2e/multi-location/tier2-vendor-workflow.spec.ts`
  - `/home/edwin/development/ptnextjs/__tests__/e2e/multi-location/tier1-vendor-workflow.spec.ts`
  - `/home/edwin/development/ptnextjs/__tests__/e2e/multi-location/public-search-workflow.spec.ts`
  - `/home/edwin/development/ptnextjs/__tests__/e2e/multi-location/error-scenarios.spec.ts`

- **Key Requirements**:
  - Test User Story 1: Tier2 vendor adds multiple locations end-to-end
  - Test User Story 2: Public user searches by location and finds vendors
  - Test User Story 3: Tier1 vendor sees locked feature and upgrade prompt
  - Test geocoding workflow: enter address → click geocode → verify coordinates populate
  - Test map display workflow: view public profile → see map with markers → click marker → verify popup
  - Test validation workflows: attempt invalid data → verify error messages → verify data not saved
  - Test tier downgrade scenario: tier2 vendor downgraded to tier1 → verify additional locations removed
  - Test responsive behavior: test workflows on mobile, tablet, desktop viewports

- **Technical Details**:
  - Use Playwright for E2E testing
  - Test with real browser (headless Chrome, Firefox, Safari)
  - Test with actual database and API server running
  - Use Playwright fixtures for test data setup
  - Capture screenshots and videos on test failure
  - Test with slow network conditions (throttling)
  - Test accessibility with Playwright's accessibility tools
  - Run tests in CI/CD pipeline

## Acceptance Criteria
- [ ] E2E test files created for all user stories (4 files)
- [ ] Tier2 vendor workflow tests complete add/edit/delete location journey
- [ ] Tier1 vendor workflow tests locked feature and upgrade prompt
- [ ] Public search workflow tests location-based search with tier filtering
- [ ] Error scenarios workflow tests all validation and error cases
- [ ] Geocoding workflow tested end-to-end with real API (or mocked)
- [ ] Map display workflow tested with marker interactions
- [ ] Responsive behavior tested on mobile, tablet, desktop
- [ ] All E2E tests pass successfully (25+ test cases)
- [ ] Tests run successfully in CI/CD pipeline

## Testing Requirements
- **Functional Testing**: Run full E2E test suite - all tests must pass
- **Manual Verification**: Manually verify each user story works as expected
- **Browser Testing**: Run Playwright tests in Chrome, Firefox, Safari (using npm run test:e2e)
- **Error Testing**: Verify error handling works correctly in real browser

## Evidence Required
- E2E test files with comprehensive test cases
- Test output showing all tests passing
- Screenshots/videos captured by Playwright
- Test results from multiple browsers (Chrome, Firefox, Safari)
- CI/CD pipeline results showing tests passing
- Accessibility audit results from Playwright

## Context Requirements
- Spec user stories from @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- All implemented features from Phase 2 and Phase 3
- Integration validation from INTEG-FRONTEND-BACKEND
- Running development/staging environment

## Implementation Notes
- Follow existing Playwright test patterns in __tests__/e2e/
- Use page object pattern for maintainability
- Create reusable test fixtures for vendor accounts
- Implement test data cleanup after each test
- Use descriptive test names that document user stories
- Capture screenshots on failure for debugging
- Test with realistic timing (wait for animations, API calls)
- Consider using Playwright test generation to record workflows

## Quality Gates
- [ ] All E2E tests pass (100% success rate)
- [ ] Tests cover all user stories from spec
- [ ] Tests run successfully in multiple browsers
- [ ] Tests pass in CI/CD pipeline
- [ ] Accessibility tests pass (no critical violations)

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Related Tasks: INTEG-FRONTEND-BACKEND, FINAL-VALIDATION
