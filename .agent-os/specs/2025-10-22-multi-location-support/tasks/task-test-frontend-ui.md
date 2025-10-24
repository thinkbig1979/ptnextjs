# Task: TEST-FRONTEND-UI - Frontend UI Test Design

## Task Metadata
- **Task ID**: TEST-FRONTEND-UI
- **Phase**: Phase 3 - Frontend Implementation
- **Agent**: test-architect
- **Estimated Time**: 20-25 minutes
- **Dependencies**: PRE-2
- **Status**: [ ] Not Started

## Task Description
Design comprehensive test suite for all frontend UI components related to multi-location support. Create tests for LocationsManagerCard, LocationFormFields, LocationMapPreview, TierGate, and integration with dashboard and public profile pages before implementation.

## Specifics
- **Test Files to Create**:
  - `/home/edwin/development/ptnextjs/__tests__/components/dashboard/LocationsManagerCard.test.tsx`
  - `/home/edwin/development/ptnextjs/__tests__/components/dashboard/LocationFormFields.test.tsx`
  - `/home/edwin/development/ptnextjs/__tests__/components/vendors/LocationsDisplaySection.test.tsx`
  - `/home/edwin/development/ptnextjs/__tests__/components/ui/GeocodingButton.test.tsx`
  - `/home/edwin/development/ptnextjs/__tests__/components/ui/TierGate.test.tsx`

- **Key Requirements**:
  - Test LocationsManagerCard renders correctly for tier2+ vendors
  - Test LocationsManagerCard shows TierUpgradePrompt for tier0/1 vendors
  - Test LocationFormFields validation for all form fields
  - Test HQ designation logic (radio button behavior)
  - Test add/edit/delete location workflows
  - Test GeocodingButton API call and coordinate population
  - Test TierGate conditional rendering based on tier
  - Test LocationsDisplaySection map rendering and marker interactions
  - Test responsive behavior for mobile, tablet, desktop

- **Technical Details**:
  - Use Jest and React Testing Library
  - Mock API calls to Payload CMS and geocode.maps.co
  - Mock Next.js router for navigation tests
  - Mock Leaflet map component for LocationMapPreview tests
  - Test form validation with invalid inputs
  - Test loading states and error states
  - Test accessibility (keyboard navigation, screen reader labels)

## Acceptance Criteria
- [ ] Test files created for all major components (5 files)
- [ ] LocationsManagerCard tests cover tier-based conditional rendering
- [ ] LocationFormFields tests cover all form validation rules
- [ ] GeocodingButton tests mock API calls and test success/error paths
- [ ] TierGate tests verify conditional rendering for all tier combinations
- [ ] LocationsDisplaySection tests verify map rendering and marker clicks
- [ ] Tests verify accessibility requirements (ARIA labels, keyboard navigation)
- [ ] Tests verify responsive behavior at different breakpoints
- [ ] All tests are runnable (can execute with npm run test)

## Testing Requirements
- **Functional Testing**: Tests cover all component functionality from technical spec
- **Manual Verification**: Review tests against UI specifications in technical spec
- **Browser Testing**: N/A (unit tests, not E2E)
- **Error Testing**: Tests verify error states and error messages display correctly

## Evidence Required
- Test files with complete test suites for all components
- Test descriptions documenting what each test validates
- Mock implementations for API calls and external dependencies
- Assertions for expected UI behavior and state changes
- Test output showing all tests pass (after component implementation)

## Context Requirements
- Technical spec UI components section
- Existing UI component test patterns in codebase
- shadcn/ui component library documentation
- React Testing Library best practices

## Implementation Notes
- Write tests first (TDD approach) before component implementation
- Use descriptive test names that document UI behavior
- Group related tests using describe blocks
- Test user interactions (click, type, submit) not implementation details
- Include snapshot tests for component rendering

## Quality Gates
- [ ] All UI components have corresponding test files
- [ ] Tests follow React Testing Library best practices
- [ ] Tests verify user-facing behavior, not implementation
- [ ] Tests cover loading, success, and error states

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Related Tasks: IMPL-DASHBOARD-LOCATIONS, IMPL-PUBLIC-PROFILE, IMPL-TIER-GATING
