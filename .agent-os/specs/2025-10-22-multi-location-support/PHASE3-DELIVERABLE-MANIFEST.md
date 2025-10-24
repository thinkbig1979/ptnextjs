# Phase 3 Frontend Implementation - Deliverable Manifest

**Generated**: 2025-10-24
**Spec**: multi-location-support
**Phase**: Phase 3 - Frontend Implementation (8 tasks)

## Overview

This manifest documents ALL expected deliverables for Phase 3 frontend implementation tasks. This file serves as the verification checklist for the orchestrator to ensure 100% deliverable completion.

## Critical Requirements

- **MANDATORY**: Use ONLY shadcn/ui components (no custom UI primitives)
- **MANDATORY**: Follow existing component patterns in components/vendor/
- **MANDATORY**: Install react-leaflet dependencies (ALREADY INSTALLED ✅)
- **MANDATORY**: Verify all files exist using Read tool before marking complete
- **MANDATORY**: Run all tests using test-runner and verify 100% pass rate
- **MANDATORY**: Use Playwright for UI validation

## Dependencies Status

### Already Installed ✅
- `react-leaflet@^5.0.0` ✅
- `leaflet@^1.9.4` ✅
- `@types/leaflet@^1.9.21` ✅

### No Additional Dependencies Required

## Task 1: TEST-FRONTEND-UI (Test Design)

**Agent**: test-architect
**Duration**: 20-25 minutes
**Dependencies**: PRE-2 (completed)

### Expected Deliverables

#### Test Files (5 files)
1. `/home/edwin/development/ptnextjs/__tests__/components/dashboard/LocationsManagerCard.test.tsx`
2. `/home/edwin/development/ptnextjs/__tests__/components/dashboard/LocationFormFields.test.tsx`
3. `/home/edwin/development/ptnextjs/__tests__/components/vendors/LocationsDisplaySection.test.tsx`
4. `/home/edwin/development/ptnextjs/__tests__/components/ui/GeocodingButton.test.tsx`
5. `/home/edwin/development/ptnextjs/__tests__/components/ui/TierGate.test.tsx`

#### Test Coverage Requirements
- LocationsManagerCard: tier-based rendering, add/edit/delete workflows
- LocationFormFields: validation for all fields, HQ designation logic
- GeocodingButton: API mocking, success/error paths, loading states
- TierGate: conditional rendering for all tier combinations
- LocationsDisplaySection: map rendering, marker interactions

#### Verification Steps
- [ ] All 5 test files exist (verify with Read tool)
- [ ] Tests use Jest + React Testing Library
- [ ] API mocks implemented (MSW or jest.mock)
- [ ] Tests are runnable (no syntax errors)
- [ ] Tests cover loading, success, error states
- [ ] Accessibility tests included (ARIA, keyboard navigation)

## Task 2: IMPL-NAVIGATION (Navigation Integration)

**Agent**: frontend-react-specialist
**Duration**: 15-20 minutes
**Dependencies**: PRE-2 (completed)

### Expected Deliverables

#### Modified Files (2 files)
1. `/home/edwin/development/ptnextjs/app/(site)/vendors/[slug]/page.tsx`
   - Add "Locations" tab to vendor profile tabs
   - Position between "About" and "Products"
   - Import and integrate with shadcn/ui Tabs component

2. `/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/profile/page.tsx`
   - Add visible "Locations" section header/placeholder
   - Prepare integration point for LocationsManagerCard

#### Verification Steps
- [ ] Both files modified (verify with Read tool)
- [ ] "Locations" tab added to vendor profile
- [ ] Tab uses shadcn/ui Tabs component
- [ ] Tab navigation accessible (keyboard + mouse)
- [ ] Dashboard has Locations section header
- [ ] No TypeScript errors (`npm run type-check`)

## Task 3: IMPL-DASHBOARD-LOCATIONS (Dashboard Location Manager)

**Agent**: frontend-react-specialist
**Duration**: 30-35 minutes
**Dependencies**: TEST-FRONTEND-UI, IMPL-NAVIGATION

### Expected Deliverables

#### New Component Files (3 files)
1. `/home/edwin/development/ptnextjs/components/dashboard/LocationsManagerCard.tsx`
   - Main location management component
   - Uses shadcn Card, Button, Dialog
   - CRUD operations for locations
   - Integrates with LocationFormFields

2. `/home/edwin/development/ptnextjs/components/dashboard/LocationFormFields.tsx`
   - Form inputs for single location
   - Uses shadcn Form, Input, Label, Checkbox
   - Zod validation schema
   - HQ radio button logic

3. `/home/edwin/development/ptnextjs/components/dashboard/TierUpgradePrompt.tsx`
   - Locked feature prompt for tier0/1
   - Uses shadcn Alert, Button, Badge
   - Link to subscription upgrade page

#### Modified Files (1 file)
4. `/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/profile/page.tsx`
   - Import LocationsManagerCard
   - Conditionally render based on tier
   - Add to Locations section

#### Verification Steps
- [ ] All 3 component files created (verify with Read)
- [ ] Dashboard page modified (verify with Read)
- [ ] Components use ONLY shadcn/ui primitives
- [ ] Form validation with Zod
- [ ] TierGate integration for tier2+ access
- [ ] All LocationsManagerCard tests pass
- [ ] All LocationFormFields tests pass

## Task 4: IMPL-GEOCODING (Geocoding Integration)

**Agent**: frontend-react-specialist
**Duration**: 20-25 minutes
**Dependencies**: TEST-FRONTEND-UI

### Expected Deliverables

#### New Component Files (1 file)
1. `/home/edwin/development/ptnextjs/components/ui/GeocodingButton.tsx`
   - Geocoding trigger button
   - Uses shadcn Button with loading state
   - Integrates with useGeocoding hook

#### New Service Files (1 file)
2. `/home/edwin/development/ptnextjs/lib/services/GeocodingService.ts`
   - API client for geocode.maps.co
   - Response parsing
   - Error handling
   - Rate limiting logic

#### New Hook Files (1 file)
3. `/home/edwin/development/ptnextjs/lib/hooks/useGeocoding.ts`
   - React hook for geocoding
   - Loading/error state management
   - Caching with localStorage
   - Debouncing logic

#### Verification Steps
- [ ] All 3 files created (verify with Read)
- [ ] GeocodingButton uses shadcn Button
- [ ] API integration with geocode.maps.co
- [ ] Rate limiting implemented (1 req/sec)
- [ ] Caching with 24-hour expiry
- [ ] Toast notifications (sonner)
- [ ] All GeocodingButton tests pass
- [ ] Integration with LocationFormFields works

## Task 5: IMPL-MAP-COMPONENT (Map Component)

**Agent**: frontend-react-specialist
**Duration**: 25-30 minutes
**Dependencies**: TEST-FRONTEND-UI, PRE-2

### Expected Deliverables

#### New Component Files (1 file)
1. `/home/edwin/development/ptnextjs/components/vendors/LocationMapPreview.tsx`
   - Interactive map with react-leaflet
   - Uses shadcn Card for wrapper
   - Custom markers for HQ vs. additional locations
   - Marker popups with location details
   - Auto-zoom to fit all markers

#### New Utility Files (1 file)
2. `/home/edwin/development/ptnextjs/lib/utils/mapUtils.ts`
   - Bounds calculation
   - Marker icon helpers
   - Map centering logic

#### Verification Steps
- [ ] Both files created (verify with Read)
- [ ] Map renders with OpenStreetMap tiles
- [ ] Uses react-leaflet components
- [ ] Leaflet CSS imported correctly
- [ ] 'use client' directive for Next.js App Router
- [ ] HQ marker visually distinct
- [ ] Marker click opens popup
- [ ] Responsive sizing
- [ ] All LocationMapPreview tests pass
- [ ] No console errors

## Task 6: IMPL-PUBLIC-PROFILE (Public Profile Locations Display)

**Agent**: frontend-react-specialist
**Duration**: 25-30 minutes
**Dependencies**: IMPL-MAP-COMPONENT, IMPL-NAVIGATION

### Expected Deliverables

#### New Component Files (2 files)
1. `/home/edwin/development/ptnextjs/components/vendors/LocationsDisplaySection.tsx`
   - Main locations display component
   - Uses LocationMapPreview
   - Uses shadcn Card, Badge, Tabs
   - Tier-filtered display (tier2+ shows all, tier0/1 shows HQ only)

2. `/home/edwin/development/ptnextjs/components/vendors/LocationCard.tsx`
   - Individual location card
   - Uses shadcn Card, Badge
   - "Get Directions" link to Google Maps
   - HQ badge for headquarters

#### Modified Files (1 file)
3. `/home/edwin/development/ptnextjs/app/(site)/vendors/[slug]/page.tsx`
   - Import LocationsDisplaySection
   - Add to Locations tab content
   - Pass vendor data with locations

#### Verification Steps
- [ ] All 2 component files created (verify with Read)
- [ ] Vendor page modified (verify with Read)
- [ ] Components use ONLY shadcn/ui primitives
- [ ] Map integration works
- [ ] Tier filtering implemented
- [ ] HQ address in hero section
- [ ] "Get Directions" links work
- [ ] Responsive layout
- [ ] Static generation succeeds (npm run build)
- [ ] All LocationsDisplaySection tests pass

## Task 7: IMPL-TIER-GATING (Tier-Based Access Control)

**Agent**: frontend-react-specialist
**Duration**: 20-25 minutes
**Dependencies**: TEST-FRONTEND-UI

### Expected Deliverables

#### New Component Files (1 file)
1. `/home/edwin/development/ptnextjs/components/ui/TierGate.tsx`
   - Conditional rendering wrapper
   - Uses shadcn Alert for fallback
   - Props: requiredTier, currentTier, fallback

#### New Service Files (1 file)
2. `/home/edwin/development/ptnextjs/lib/services/TierService.ts`
   - Tier validation functions
   - canAccessFeature(tier, feature)
   - getTierLevel(tier)
   - Tier constants (FREE, TIER1, TIER2)
   - Feature mapping (tierFeatureMap)

#### New Hook Files (1 file)
3. `/home/edwin/development/ptnextjs/lib/hooks/useTierAccess.ts`
   - React hook for tier checking
   - Returns: { hasAccess, tier, upgradePath }
   - Integrates with useAuth

#### Verification Steps
- [ ] All 3 files created (verify with Read)
- [ ] TierGate uses shadcn components
- [ ] Tier hierarchy defined (free < tier1 < tier2)
- [ ] Feature mapping includes 'multipleLocations'
- [ ] Integration with LocationsManagerCard
- [ ] Integration with LocationsDisplaySection
- [ ] All tier combinations tested
- [ ] All TierGate tests pass

## Task 8: TEST-FRONTEND-INTEGRATION (Integration Testing)

**Agent**: test-architect
**Duration**: 25-30 minutes
**Dependencies**: IMPL-TIER-GATING (all implementation complete)

### Expected Deliverables

#### Integration Test Files (3 files)
1. `/home/edwin/development/ptnextjs/__tests__/integration/dashboard/locations-workflow.test.tsx`
   - Full dashboard workflow: login → add location → save
   - API mocking with MSW
   - SWR cache behavior
   - Optimistic UI updates

2. `/home/edwin/development/ptnextjs/__tests__/integration/vendors/profile-locations-display.test.tsx`
   - Public profile display workflow
   - Map rendering verification
   - Tier-filtered display
   - Static generation compatibility

3. `/home/edwin/development/ptnextjs/__tests__/integration/tier-access-control.test.tsx`
   - Tier-based rendering across all components
   - TierGate behavior
   - Upgrade prompt display
   - Feature access validation

#### Verification Steps
- [ ] All 3 integration test files created (verify with Read)
- [ ] MSW mocks for API endpoints
- [ ] Tests cover complete workflows
- [ ] All integration tests pass (100%)
- [ ] Test coverage >80% for frontend code
- [ ] Playwright E2E tests pass (if applicable)

## Shadcn/UI Component Usage Checklist

### Components Used (Must Verify)
- [ ] Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- [ ] Button (variants: default, outline, ghost, destructive)
- [ ] Input, Label, Textarea
- [ ] Form, FormField, FormItem, FormLabel, FormControl, FormMessage
- [ ] Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle
- [ ] Badge (for HQ indicator, tier badges)
- [ ] Alert, AlertDescription (for tier prompts)
- [ ] Tabs, TabsList, TabsTrigger, TabsContent (for vendor profile)
- [ ] Separator
- [ ] Checkbox (for location form)

### Components NOT to Create
- ❌ Custom Button primitives
- ❌ Custom Card primitives
- ❌ Custom Form inputs
- ❌ Custom Dialog implementations
- ❌ Custom Alert boxes

## Styling Compliance Checklist

### Pattern Adherence
- [ ] Consistent spacing (p-4, p-6, gap-4, space-y-4)
- [ ] Proper color usage (primary, secondary, muted, accent)
- [ ] Responsive design (mobile-first, sm:, md:, lg: breakpoints)
- [ ] Typography patterns (font-cormorant for titles, font-poppins-light for body)
- [ ] Icon usage (lucide-react components)
- [ ] Hover effects (hover:bg-accent, hover:text-accent-foreground)
- [ ] Loading states (animate-spin, Loader2 icon)

### Existing Patterns to Follow
- VendorProfileEditor.tsx: Form patterns, validation, tier-gating
- vendors/[slug]/page.tsx: Layout, Card usage, responsive grid
- Card component: Uses hover-lift class
- Button component: Consistent variants and sizes

## Verification Protocol

### Step 1: File Existence (MANDATORY)
```bash
# Verify ALL component files exist
Read /home/edwin/development/ptnextjs/components/dashboard/LocationsManagerCard.tsx
Read /home/edwin/development/ptnextjs/components/dashboard/LocationFormFields.tsx
Read /home/edwin/development/ptnextjs/components/dashboard/TierUpgradePrompt.tsx
Read /home/edwin/development/ptnextjs/components/ui/GeocodingButton.tsx
Read /home/edwin/development/ptnextjs/components/ui/TierGate.tsx
Read /home/edwin/development/ptnextjs/components/vendors/LocationMapPreview.tsx
Read /home/edwin/development/ptnextjs/components/vendors/LocationsDisplaySection.tsx
Read /home/edwin/development/ptnextjs/components/vendors/LocationCard.tsx
Read /home/edwin/development/ptnextjs/lib/services/GeocodingService.ts
Read /home/edwin/development/ptnextjs/lib/services/TierService.ts
Read /home/edwin/development/ptnextjs/lib/hooks/useGeocoding.ts
Read /home/edwin/development/ptnextjs/lib/hooks/useTierAccess.ts
Read /home/edwin/development/ptnextjs/lib/utils/mapUtils.ts
```

### Step 2: Test Existence (MANDATORY)
```bash
# Verify ALL test files exist
Read /home/edwin/development/ptnextjs/__tests__/components/dashboard/LocationsManagerCard.test.tsx
Read /home/edwin/development/ptnextjs/__tests__/components/dashboard/LocationFormFields.test.tsx
Read /home/edwin/development/ptnextjs/__tests__/components/vendors/LocationsDisplaySection.test.tsx
Read /home/edwin/development/ptnextjs/__tests__/components/ui/GeocodingButton.test.tsx
Read /home/edwin/development/ptnextjs/__tests__/components/ui/TierGate.test.tsx
Read /home/edwin/development/ptnextjs/__tests__/integration/dashboard/locations-workflow.test.tsx
Read /home/edwin/development/ptnextjs/__tests__/integration/vendors/profile-locations-display.test.tsx
Read /home/edwin/development/ptnextjs/__tests__/integration/tier-access-control.test.tsx
```

### Step 3: Shadcn/UI Compliance (MANDATORY)
```bash
# Verify NO custom UI primitives
Grep "import.*components/ui" --output_mode=content
# Should only import from shadcn/ui components

# Verify NO custom button/card/form implementations
Grep "const.*Button.*=" components/dashboard/ --output_mode=files_with_matches
# Should return NO matches (use shadcn Button instead)
```

### Step 4: Test Execution (MANDATORY)
```bash
# Run all frontend tests
npm run test

# Expected: 100% pass rate for all new tests
# Minimum 30+ new test cases
# Coverage >80% for frontend code
```

### Step 5: Type Checking (MANDATORY)
```bash
npm run type-check
# Expected: 0 errors
```

### Step 6: Build Verification (MANDATORY)
```bash
npm run build
# Expected: Successful static generation
# No build errors
```

### Step 7: Playwright Validation (MANDATORY)
```bash
# Use playwright-skill to validate UI rendering
# Test location manager in dashboard
# Test location display on vendor profile
# Test tier-gating behavior
```

## Integration Points

### Dashboard Integration
- File: `/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/profile/page.tsx`
- Add: `<LocationsManagerCard />` component
- Condition: Render based on vendor tier (useAuth hook)

### Public Profile Integration
- File: `/home/edwin/development/ptnextjs/app/(site)/vendors/[slug]/page.tsx`
- Add: `<LocationsDisplaySection />` in Locations tab
- Add: "Locations" tab to tab navigation
- Pass: Vendor data with locations array

### API Integration
- Endpoint: `PATCH /api/vendors/:id`
- Payload: `{ locations: Location[] }`
- Response: Updated vendor object

### Authentication Integration
- Hook: `useAuth()` from `/lib/context/AuthContext`
- Data: `{ isAuthenticated, vendor, tier, role }`

## Success Criteria

### Functional Requirements ✅
- [ ] Tier2+ vendors can add/edit/delete multiple locations
- [ ] Tier0/1 vendors see upgrade prompt
- [ ] HQ designation works (only one HQ)
- [ ] Geocoding populates coordinates
- [ ] Map displays all locations with markers
- [ ] Public profile shows tier-filtered locations
- [ ] "Get Directions" links work
- [ ] Form validation prevents invalid data

### Quality Requirements ✅
- [ ] All 8 tasks completed
- [ ] All files verified to exist
- [ ] 100% test pass rate
- [ ] 80%+ test coverage
- [ ] No TypeScript errors
- [ ] Successful static build
- [ ] Shadcn/ui compliance verified
- [ ] Responsive design verified
- [ ] Accessibility verified (keyboard, ARIA)
- [ ] Playwright UI validation passed

### Documentation Requirements ✅
- [ ] Task completion report
- [ ] Verification evidence
- [ ] Screenshots of UI components
- [ ] Test coverage report
- [ ] Shadcn/ui compliance report

## Deliverable Summary

**Total Files Expected**: 26 files

### New Component Files: 8
- LocationsManagerCard.tsx
- LocationFormFields.tsx
- TierUpgradePrompt.tsx
- GeocodingButton.tsx
- TierGate.tsx
- LocationMapPreview.tsx
- LocationsDisplaySection.tsx
- LocationCard.tsx

### New Service/Hook Files: 5
- GeocodingService.ts
- TierService.ts
- useGeocoding.ts
- useTierAccess.ts
- mapUtils.ts

### New Test Files: 8
- LocationsManagerCard.test.tsx
- LocationFormFields.test.tsx
- LocationsDisplaySection.test.tsx
- GeocodingButton.test.tsx
- TierGate.test.tsx
- locations-workflow.test.tsx
- profile-locations-display.test.tsx
- tier-access-control.test.tsx

### Modified Files: 2
- app/(site)/vendor/dashboard/profile/page.tsx
- app/(site)/vendors/[slug]/page.tsx

### Package Dependencies: 3 (Already Installed ✅)
- react-leaflet
- leaflet
- @types/leaflet

## Blocking Conditions

**Task CANNOT be marked complete if**:
- ANY expected file is missing
- ANY test is failing
- Shadcn/ui compliance not verified
- TypeScript errors present
- Build fails
- Test coverage <80%
- Playwright validation fails
- Custom UI primitives detected

## Final Checklist

Before marking Phase 3 complete:
- [ ] All 26 files verified to exist (using Read tool)
- [ ] All tests pass (100% pass rate)
- [ ] Test coverage >80%
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Shadcn/ui components used exclusively
- [ ] Styling follows existing patterns
- [ ] Responsive design verified
- [ ] Accessibility verified
- [ ] Playwright validation passed
- [ ] tasks.md updated with completion status
- [ ] Individual task files updated
- [ ] Completion report created
- [ ] Evidence documented
