# Phase 3 Frontend Implementation - Deliverable Manifest

> Generated: 2025-10-24
> Phase: Frontend Implementation (8 tasks)
> Status: In Progress

## Overview

This manifest tracks ALL expected deliverables for Phase 3 frontend implementation. Every file listed here MUST be verified to exist before marking Phase 3 complete.

---

## Component Files (11 files)

### Dashboard Components (4 files)
- [ ] `/home/edwin/development/ptnextjs/components/dashboard/LocationsManagerCard.tsx`
- [ ] `/home/edwin/development/ptnextjs/components/dashboard/LocationFormFields.tsx`
- [ ] `/home/edwin/development/ptnextjs/components/dashboard/TierUpgradePrompt.tsx`
- [ ] `/home/edwin/development/ptnextjs/components/vendor/VendorProfileEditor.tsx` (MODIFY - add LocationsManagerCard integration)

### Vendor/Public Profile Components (2 files)
- [ ] `/home/edwin/development/ptnextjs/components/vendors/LocationsDisplaySection.tsx`
- [ ] `/home/edwin/development/ptnextjs/components/vendors/LocationCard.tsx`

### UI Components (3 files)
- [ ] `/home/edwin/development/ptnextjs/components/ui/GeocodingButton.tsx`
- [ ] `/home/edwin/development/ptnextjs/components/ui/TierGate.tsx`
- [ ] `/home/edwin/development/ptnextjs/components/vendors/LocationMapPreview.tsx`

### Page Integration (2 files MODIFIED)
- [ ] `/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/profile/page.tsx` (VERIFY integration)
- [ ] `/home/edwin/development/ptnextjs/app/(site)/vendors/[slug]/page.tsx` (ADD Locations tab/section)

---

## Service & Utility Files (5 files)

### Services (2 files)
- [ ] `/home/edwin/development/ptnextjs/lib/services/GeocodingService.ts`
- [ ] `/home/edwin/development/ptnextjs/lib/services/TierService.ts`

### Hooks (2 files)
- [ ] `/home/edwin/development/ptnextjs/lib/hooks/useGeocoding.ts`
- [ ] `/home/edwin/development/ptnextjs/lib/hooks/useTierAccess.ts`

### Utilities (1 file)
- [ ] `/home/edwin/development/ptnextjs/lib/utils/mapUtils.ts`

---

## Test Files (8+ files)

### Unit Tests (5 files)
- [ ] `/home/edwin/development/ptnextjs/__tests__/components/dashboard/LocationsManagerCard.test.tsx`
- [ ] `/home/edwin/development/ptnextjs/__tests__/components/dashboard/LocationFormFields.test.tsx`
- [ ] `/home/edwin/development/ptnextjs/__tests__/components/vendors/LocationsDisplaySection.test.tsx`
- [ ] `/home/edwin/development/ptnextjs/__tests__/components/ui/GeocodingButton.test.tsx`
- [ ] `/home/edwin/development/ptnextjs/__tests__/components/ui/TierGate.test.tsx`

### Integration Tests (3 files)
- [ ] `/home/edwin/development/ptnextjs/__tests__/integration/dashboard/locations-workflow.test.tsx`
- [ ] `/home/edwin/development/ptnextjs/__tests__/integration/vendors/profile-locations-display.test.tsx`
- [ ] `/home/edwin/development/ptnextjs/__tests__/integration/tier-access-control.test.tsx`

---

## Dependencies (Already Installed)

Verified in package.json:
- [x] react-leaflet@^5.0.0 (installed)
- [x] leaflet@^1.9.4 (installed)
- [x] @types/leaflet@^1.9.21 (installed)

---

## Task-Specific Deliverables

### TEST-FRONTEND-UI (Task 1)
**Expected Deliverables:**
- 5 test files created with comprehensive test suites
- Tests cover tier-based rendering, form validation, geocoding, map interactions
- Tests use Jest + React Testing Library
- Mock implementations for API calls and Leaflet

**Verification:**
- [ ] All 5 test files exist
- [ ] Tests are runnable (no syntax errors)
- [ ] Tests include proper describe/it blocks
- [ ] Mocks are properly configured

### IMPL-NAVIGATION (Task 2)
**Expected Deliverables:**
- "Locations" tab added to vendor public profile page
- Tab navigation accessible and responsive
- Dashboard profile page has Locations section header

**Verification:**
- [ ] `/app/(site)/vendors/[slug]/page.tsx` modified
- [ ] Tab component integrates with existing navigation
- [ ] Accessibility features (ARIA labels, keyboard nav)

### IMPL-GEOCODING (Task 3)
**Expected Deliverables:**
- GeocodingButton component
- GeocodingService with API client
- useGeocoding hook
- Rate limiting and caching implementation
- Error handling with toast notifications

**Verification:**
- [ ] 3 files created (component, service, hook)
- [ ] API integration with geocode.maps.co
- [ ] Cache implementation in localStorage
- [ ] Rate limiting (1 req/sec)
- [ ] Tests pass for GeocodingButton

### IMPL-MAP-COMPONENT (Task 4)
**Expected Deliverables:**
- LocationMapPreview component with react-leaflet
- mapUtils.ts utility functions
- HQ vs additional location marker differentiation
- Marker popups with location details
- Responsive map sizing

**Verification:**
- [ ] 2 files created (component, utils)
- [ ] Map renders with OpenStreetMap tiles
- [ ] Custom markers for HQ/additional locations
- [ ] Marker click opens popup
- [ ] Auto-zoom to fit all markers
- [ ] Tests pass for LocationMapPreview

### IMPL-TIER-GATING (Task 5)
**Expected Deliverables:**
- TierGate component for conditional rendering
- TierService with tier validation logic
- useTierAccess hook
- TierUpgradePrompt component
- Tier constants and feature mapping

**Verification:**
- [ ] 4 files created (TierGate, TierService, hook, TierUpgradePrompt)
- [ ] Tier hierarchy defined (free < tier1 < tier2)
- [ ] Feature mapping includes 'multipleLocations'
- [ ] Conditional rendering works for all tier combinations
- [ ] Tests pass for TierGate

### IMPL-DASHBOARD-LOCATIONS (Task 6)
**Expected Deliverables:**
- LocationsManagerCard component
- LocationFormFields component
- TierUpgradePrompt integration
- Form validation with Zod
- CRUD operations for locations
- Optimistic UI with SWR

**Verification:**
- [ ] 3 files created (depends on IMPL-TIER-GATING for TierUpgradePrompt)
- [ ] Integration with VendorProfileEditor
- [ ] Form validation works correctly
- [ ] Add/edit/delete location workflows functional
- [ ] HQ designation logic (radio button)
- [ ] API integration (PATCH /api/vendors/:id)
- [ ] Tests pass for LocationsManagerCard and LocationFormFields

### IMPL-PUBLIC-PROFILE (Task 7)
**Expected Deliverables:**
- LocationsDisplaySection component
- LocationCard component
- Integration with vendor profile page
- Tier-based filtering (tier2+ shows all, tier0/1 shows HQ only)
- Map integration using LocationMapPreview
- "Get Directions" links to Google Maps

**Verification:**
- [ ] 2 files created (depends on IMPL-MAP-COMPONENT)
- [ ] Integration with `/app/(site)/vendors/[slug]/page.tsx`
- [ ] HQ displayed in hero section (all tiers)
- [ ] Map shows filtered locations based on tier
- [ ] LocationCard displays location details
- [ ] "Get Directions" link works
- [ ] Responsive layout (map + list)
- [ ] Tests pass for LocationsDisplaySection

### TEST-FRONTEND-INTEGRATION (Task 8)
**Expected Deliverables:**
- 3 integration test files
- Complete workflow tests (dashboard location management)
- Tier-based rendering tests
- Public profile display tests
- API integration tests with MSW
- SWR cache behavior tests

**Verification:**
- [ ] 3 integration test files created
- [ ] Tests cover full user journeys
- [ ] MSW mocks configured for API endpoints
- [ ] All integration tests pass
- [ ] Test coverage >80% for frontend code

---

## Quality Gates

### Code Quality
- [ ] All TypeScript files compile without errors
- [ ] ESLint passes with no errors
- [ ] All components use proper TypeScript types
- [ ] Accessibility requirements met (ARIA labels, keyboard navigation)

### Testing
- [ ] All unit tests pass (100% pass rate)
- [ ] All integration tests pass (100% pass rate)
- [ ] Test coverage >80% for frontend components
- [ ] No console errors in test output

### Integration
- [ ] Dashboard profile page renders LocationsManagerCard for tier2+
- [ ] Dashboard profile page renders TierUpgradePrompt for tier0/1
- [ ] Vendor public profile displays Locations tab
- [ ] Map renders correctly with markers
- [ ] Form validation prevents invalid submissions
- [ ] Geocoding populates coordinates correctly

### Browser Compatibility
- [ ] Components render correctly in Chrome
- [ ] Components render correctly in Firefox
- [ ] Components render correctly in Safari
- [ ] Responsive design works on mobile, tablet, desktop

### Build & Deployment
- [ ] `npm run build` succeeds
- [ ] Static site generation works correctly
- [ ] No build errors or warnings
- [ ] Production bundle size acceptable

---

## Verification Checklist

Before marking Phase 3 complete, verify:

1. **File Existence (24 files total)**
   - [ ] 11 component files created/modified
   - [ ] 5 service/utility files created
   - [ ] 8 test files created

2. **Test Execution**
   - [ ] `npm run test` passes all frontend tests
   - [ ] Test coverage report shows >80% coverage
   - [ ] No failing or skipped tests

3. **Manual Testing**
   - [ ] Dashboard location management workflow works end-to-end
   - [ ] Tier-based rendering verified for all tiers
   - [ ] Map displays correctly with markers
   - [ ] Geocoding integration works
   - [ ] Form validation prevents invalid data
   - [ ] Public profile displays locations correctly

4. **Browser Testing**
   - [ ] Playwright tests pass in Chrome, Firefox, Safari
   - [ ] Responsive design verified at multiple breakpoints

5. **Build Verification**
   - [ ] Production build completes successfully
   - [ ] Static site generation works for all vendor pages

---

## Execution Strategy

### Stream 1: Test Architecture (Parallel)
- Execute TEST-FRONTEND-UI first
- Provides test foundation for all other tasks

### Stream 2: Core Infrastructure (Parallel after TEST-FRONTEND-UI)
- IMPL-NAVIGATION (navigation structure)
- IMPL-GEOCODING (geocoding integration)
- IMPL-MAP-COMPONENT (map rendering)
- IMPL-TIER-GATING (access control)

### Stream 3: Feature Integration (Sequential, depends on Stream 2)
- IMPL-DASHBOARD-LOCATIONS (depends on IMPL-NAVIGATION, IMPL-TIER-GATING)
- IMPL-PUBLIC-PROFILE (depends on IMPL-MAP-COMPONENT, IMPL-NAVIGATION)

### Stream 4: Integration Testing (Final)
- TEST-FRONTEND-INTEGRATION (depends on all IMPL tasks)

---

## Success Criteria

Phase 3 is ONLY complete when:
1. ALL 24 files verified to exist using Read tool
2. ALL tests pass (unit + integration)
3. Manual verification confirms all features work
4. Browser testing confirms compatibility
5. Production build succeeds
6. All acceptance criteria met with evidence

**CRITICAL**: Do NOT mark Phase 3 complete without verifying every single deliverable listed above.
