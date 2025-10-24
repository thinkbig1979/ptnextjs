# Task: IMPL-MAP-COMPONENT - Map Component Implementation

## Task Metadata
- **Task ID**: IMPL-MAP-COMPONENT
- **Phase**: Phase 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 25-30 minutes
- **Dependencies**: TEST-FRONTEND-UI, PRE-2
- **Status**: [ ] Not Started

## Task Description
Implement LocationMapPreview component using react-leaflet to display vendor locations on interactive map with markers, popups, and custom styling. Includes marker differentiation for HQ vs. additional locations, marker click interactions, and responsive map sizing.

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/components/vendors/LocationMapPreview.tsx`
  - `/home/edwin/development/ptnextjs/lib/utils/mapUtils.ts`

- **Dependencies to Install**:
  - `react-leaflet@^4.2.1`
  - `leaflet@^1.9.4`
  - `@types/leaflet@^1.9.8`

- **Key Requirements**:
  - Display interactive map with all vendor locations as markers
  - Use different marker colors: primary for HQ, secondary for additional locations
  - Implement marker popups showing location details (address, city, country)
  - Center map on HQ location or first location
  - Auto-zoom to fit all markers in viewport
  - Implement responsive sizing (full width on mobile, side-by-side on desktop)
  - Load map tiles from OpenStreetMap or similar free provider
  - Handle Leaflet CSS import in Next.js (client-side only)

- **Technical Details**:
  - Use react-leaflet MapContainer, TileLayer, Marker, Popup components
  - Import Leaflet CSS in component with 'use client' directive
  - Use custom marker icons from Leaflet or lucide-react
  - Implement bounds calculation to fit all markers
  - Handle edge cases (no locations, single location, 50+ locations)
  - Use TypeScript for all props and state
  - Implement loading state while map tiles load

## Acceptance Criteria
- [ ] react-leaflet dependencies installed (verify in package.json)
- [ ] LocationMapPreview component created and renders correctly
- [ ] Map displays with OpenStreetMap tiles
- [ ] All vendor locations shown as markers on map
- [ ] HQ location marker visually distinct from additional locations
- [ ] Marker click opens popup with location details
- [ ] Map centers and zooms to show all markers
- [ ] Map is responsive on mobile, tablet, desktop
- [ ] Leaflet CSS loaded correctly without Next.js errors
- [ ] Component handles edge cases (no locations, many locations)
- [ ] All tests from TEST-FRONTEND-UI pass for LocationMapPreview

## Testing Requirements
- **Functional Testing**: Run TEST-FRONTEND-UI tests for LocationMapPreview - all tests must pass
- **Manual Verification**:
  - Render map with single location - verify map centers correctly
  - Render map with multiple locations - verify all markers appear
  - Click marker - verify popup displays with correct location info
  - Test on mobile - verify map is usable and responsive
  - Test with 10+ locations - verify performance is acceptable
- **Browser Testing**: Test in Chrome, Firefox, Safari using Playwright
- **Error Testing**:
  - Test with empty locations array - verify graceful handling
  - Test with invalid coordinates - verify error handling

## Evidence Required
- Created component files and utility functions
- Updated package.json showing react-leaflet dependencies
- Test output showing all LocationMapPreview tests passing
- Screenshot of map with multiple markers (HQ and additional locations)
- Screenshot of marker popup with location details
- Screenshot showing responsive behavior on mobile
- Playwright test results confirming browser compatibility

## Context Requirements
- Technical spec Component Architecture section
- react-leaflet documentation
- Leaflet documentation for custom markers
- Next.js client-side rendering patterns
- Test file from TEST-FRONTEND-UI

## Implementation Notes
- Use dynamic import for Leaflet to ensure client-side only rendering
- Import Leaflet CSS at top of component: import 'leaflet/dist/leaflet.css'
- Use 'use client' directive for Next.js App Router compatibility
- Consider map performance with large numbers of markers (clustering if needed)
- Test map loading in production build (static export)
- Ensure map works without JavaScript (fallback to static image or address list)

## Quality Gates
- [ ] All unit tests pass (from TEST-FRONTEND-UI)
- [ ] Map renders correctly with markers
- [ ] Marker interactions work as expected
- [ ] Map is responsive and performs well
- [ ] No console errors related to Leaflet or map rendering
- [ ] Map works in production build (npm run build)

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Related Tasks: TEST-FRONTEND-UI, PRE-2, IMPL-PUBLIC-PROFILE
