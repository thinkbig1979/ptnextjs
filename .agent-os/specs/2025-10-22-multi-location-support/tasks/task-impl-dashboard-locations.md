# Task: IMPL-DASHBOARD-LOCATIONS - Dashboard Locations Manager

## Task Metadata
- **Task ID**: IMPL-DASHBOARD-LOCATIONS
- **Phase**: Phase 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 30-35 minutes
- **Dependencies**: TEST-FRONTEND-UI, IMPL-NAVIGATION
- **Status**: [ ] Not Started

## Task Description
Implement LocationsManagerCard component for dashboard profile page allowing tier2+ vendors to manage multiple office locations. Includes LocationFormFields component with form validation, add/edit/delete functionality, and tier-based conditional rendering with upgrade prompt.

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/components/dashboard/LocationsManagerCard.tsx`
  - `/home/edwin/development/ptnextjs/components/dashboard/LocationFormFields.tsx`
  - `/home/edwin/development/ptnextjs/components/dashboard/TierUpgradePrompt.tsx`

- **Files to Modify**:
  - `/home/edwin/development/ptnextjs/app/dashboard/profile/page.tsx` - Integrate LocationsManagerCard

- **Key Requirements**:
  - LocationsManagerCard manages locations array state and CRUD operations
  - Conditionally render LocationsManagerCard for tier2+ or TierUpgradePrompt for tier0/1
  - LocationFormFields renders form inputs for single location (address, lat, long, city, country, isHQ)
  - Implement form validation with Zod schema
  - Add location button creates new empty location form
  - Edit location allows inline editing of existing locations
  - Delete location removes location from array with confirmation dialog
  - HQ designation uses radio button logic (only one can be HQ)
  - Save button calls API to update vendor with new locations array

- **Technical Details**:
  - Use shadcn/ui Card, Button, Input, Label, Dialog, Badge components
  - Use React Hook Form for form state management
  - Use Zod for form validation schema
  - Use SWR mutation for API updates with optimistic UI
  - Implement proper TypeScript types for props and state
  - Follow responsive design patterns (mobile-first)
  - Implement loading states (skeleton loaders) and error states (inline errors)

## Acceptance Criteria
- [ ] LocationsManagerCard component created and renders for tier2+ vendors
- [ ] TierUpgradePrompt component created and renders for tier0/1 vendors
- [ ] LocationFormFields component renders all location input fields
- [ ] Form validation works for all fields (required, max length, ranges)
- [ ] Add location button creates new empty form
- [ ] Delete location button removes location with confirmation
- [ ] HQ radio button logic works correctly (only one HQ)
- [ ] Save button calls PATCH /api/vendors/:id with updated locations
- [ ] Optimistic UI updates (locations update immediately, rollback on error)
- [ ] Loading states display during save operation
- [ ] Error states display inline when validation fails
- [ ] Component is responsive on mobile, tablet, desktop
- [ ] All tests from TEST-FRONTEND-UI pass

## Testing Requirements
- **Functional Testing**: Run TEST-FRONTEND-UI tests - all LocationsManagerCard tests must pass
- **Manual Verification**:
  - Login as tier2 vendor - verify LocationsManagerCard displays
  - Add new location - verify form appears and saves correctly
  - Edit location - verify changes persist
  - Delete location - verify confirmation and removal
  - Attempt to mark two locations as HQ - verify validation error
  - Login as tier1 vendor - verify TierUpgradePrompt displays
- **Browser Testing**: Test in Chrome, Firefox, Safari on desktop and mobile using Playwright
- **Error Testing**: Test form validation, API error handling, network failure scenarios

## Evidence Required
- Created component files with full implementation
- Updated dashboard profile page integrating LocationsManagerCard
- Test output showing all TEST-FRONTEND-UI tests passing
- Screenshots showing component rendering for tier2 and tier0/1 vendors
- Screenshot showing form validation errors
- Screenshot showing successful location save with toast notification
- Playwright test results confirming browser compatibility

## Context Requirements
- Technical spec UI components section
- Test file from TEST-FRONTEND-UI
- Implemented backend API from IMPL-BACKEND-API
- Existing dashboard profile page structure from PRE-1

## Implementation Notes
- Follow existing component patterns in components/dashboard/
- Use consistent styling with other dashboard components
- Implement proper error handling with user-friendly messages
- Test thoroughly with different tier levels
- Ensure form is accessible (keyboard navigation, screen readers)

## Quality Gates
- [ ] All unit tests pass (from TEST-FRONTEND-UI)
- [ ] Component renders correctly for all tier levels
- [ ] Form validation prevents invalid data submission
- [ ] API integration works correctly (save, error handling)
- [ ] Responsive design works on all screen sizes
- [ ] Accessibility audit passes (Lighthouse or axe DevTools)

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Related Tasks: TEST-FRONTEND-UI, IMPL-NAVIGATION, IMPL-GEOCODING, IMPL-TIER-GATING
