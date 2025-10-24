# Task: IMPL-PUBLIC-PROFILE - Public Profile Locations Display

## Task Metadata
- **Task ID**: IMPL-PUBLIC-PROFILE
- **Phase**: Phase 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 25-30 minutes
- **Dependencies**: IMPL-MAP-COMPONENT, IMPL-NAVIGATION
- **Status**: [ ] Not Started

## Task Description
Implement LocationsDisplaySection component for vendor public profile page showing all vendor locations on map and in list format. Displays HQ prominently and shows additional locations only for tier2+ vendors. Integrates with existing vendor profile page and tab navigation.

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/components/vendors/LocationsDisplaySection.tsx`
  - `/home/edwin/development/ptnextjs/components/vendors/LocationCard.tsx`

- **Files to Modify**:
  - `/home/edwin/development/ptnextjs/app/vendors/[slug]/page.tsx` - Add LocationsDisplaySection to Locations tab

- **Key Requirements**:
  - Display HQ address prominently in hero section (always visible)
  - LocationsDisplaySection shows map with all locations for tier2+ vendors
  - LocationsDisplaySection shows only HQ for tier0/1 vendors
  - Map displays using LocationMapPreview component from IMPL-MAP-COMPONENT
  - Location list below map with cards for each location
  - LocationCard shows full address, city, country, HQ badge
  - "Get Directions" link opens Google Maps with coordinates
  - Responsive layout: map side-by-side with list on desktop, stacked on mobile

- **Technical Details**:
  - Use shadcn/ui Card, Badge components
  - Fetch vendor data with locations array via SSG (getStaticProps/generateStaticParams)
  - Implement conditional rendering based on vendor tier
  - Use LocationMapPreview component from IMPL-MAP-COMPONENT
  - Implement proper TypeScript types for props
  - Follow responsive design patterns (CSS Grid or Flexbox)
  - Ensure static generation works correctly (no client-side data fetching)

## Acceptance Criteria
- [ ] LocationsDisplaySection component created and renders correctly
- [ ] LocationCard component displays location details with proper styling
- [ ] HQ address displayed in vendor hero section (all tiers)
- [ ] Map displays all locations for tier2+ vendors
- [ ] Map displays only HQ for tier0/1 vendors
- [ ] Location list shows all locations with LocationCard components
- [ ] HQ location has "Headquarters" badge
- [ ] "Get Directions" link works correctly (opens Google Maps)
- [ ] Component is responsive on mobile, tablet, desktop
- [ ] Static generation works (npm run build succeeds)
- [ ] All tests from TEST-FRONTEND-UI pass for LocationsDisplaySection

## Testing Requirements
- **Functional Testing**: Run TEST-FRONTEND-UI tests for LocationsDisplaySection - all tests must pass
- **Manual Verification**:
  - View tier2 vendor profile - verify all locations display
  - View tier1 vendor profile - verify only HQ displays
  - Click "Get Directions" - verify Google Maps opens with correct location
  - Test on mobile - verify responsive layout
  - Test static build - verify page generates correctly
- **Browser Testing**: Test in Chrome, Firefox, Safari using Playwright
- **Error Testing**:
  - Test vendor with no locations - verify graceful handling
  - Test vendor with single location - verify displays correctly

## Evidence Required
- Created component files
- Updated vendor profile page integrating LocationsDisplaySection
- Test output showing all LocationsDisplaySection tests passing
- Screenshot of tier2 vendor profile with multiple locations on map
- Screenshot of tier1 vendor profile with only HQ location
- Screenshot of mobile responsive layout
- Screenshot of location card with "Get Directions" link
- Build output showing static generation success

## Context Requirements
- Technical spec UI components section
- LocationMapPreview component from IMPL-MAP-COMPONENT
- Vendor profile page structure from PRE-1
- Test file from TEST-FRONTEND-UI
- Tier filtering logic from technical spec

## Implementation Notes
- Ensure data is available at build time for SSG
- Use conditional rendering for tier-based display
- Follow existing vendor profile page layout patterns
- Ensure map loads correctly in production build
- Test with various vendor tiers and location counts
- Consider SEO implications (structured data for locations)

## Quality Gates
- [ ] All unit tests pass (from TEST-FRONTEND-UI)
- [ ] Component renders correctly for all vendor tiers
- [ ] Map integration works correctly
- [ ] Static generation succeeds without errors
- [ ] Responsive design works on all screen sizes
- [ ] "Get Directions" links work correctly

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Related Tasks: IMPL-MAP-COMPONENT, IMPL-NAVIGATION, TEST-FRONTEND-UI, IMPL-TIER-GATING
