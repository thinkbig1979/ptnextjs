# Task: IMPL-GEOCODING - Geocoding Integration

## Task Metadata
- **Task ID**: IMPL-GEOCODING
- **Phase**: Phase 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Estimated Time**: 20-25 minutes
- **Dependencies**: TEST-FRONTEND-UI
- **Status**: [ ] Not Started

## Task Description
Implement GeocodingButton component that integrates with geocode.maps.co API to convert addresses to latitude/longitude coordinates. Includes API client, loading states, error handling, rate limiting, and coordinate population in form fields.

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/components/ui/GeocodingButton.tsx`
  - `/home/edwin/development/ptnextjs/lib/services/GeocodingService.ts`
  - `/home/edwin/development/ptnextjs/lib/hooks/useGeocoding.ts`

- **Key Requirements**:
  - GeocodingButton component with loading and error states
  - API client for geocode.maps.co API (GET https://geocode.maps.co/search?q={address})
  - Parse API response and extract latitude/longitude from results
  - Populate latitude and longitude form fields automatically on success
  - Display error toast if geocoding fails or address not found
  - Implement client-side rate limiting (1 request per second)
  - Debounce button clicks to prevent rapid requests
  - Cache geocoding results locally (24-hour expiry) to reduce API calls

- **Technical Details**:
  - Use fetch API for HTTP requests with 10-second timeout
  - Use sonner library for toast notifications
  - Use localStorage for caching geocoded results
  - Implement exponential backoff for rate limit errors (429)
  - Handle network errors gracefully with user-friendly messages
  - Use TypeScript for API response types
  - Integrate with LocationFormFields component

## Acceptance Criteria
- [ ] GeocodingButton component created with proper UI (Button from shadcn/ui)
- [ ] GeocodingService implements API client with error handling
- [ ] useGeocoding hook provides geocoding functionality with loading/error states
- [ ] Button shows loading spinner (Loader2 icon) during API call
- [ ] Successful geocoding populates latitude and longitude fields automatically
- [ ] Error toast displays user-friendly message on failure
- [ ] Rate limiting implemented (1 request per second)
- [ ] Debouncing prevents rapid button clicks (500ms debounce)
- [ ] Caching reduces duplicate API calls for same address
- [ ] All tests from TEST-FRONTEND-UI pass for GeocodingButton
- [ ] Component integrates correctly with LocationFormFields

## Testing Requirements
- **Functional Testing**: Run TEST-FRONTEND-UI tests for GeocodingButton - all tests must pass
- **Manual Verification**:
  - Enter address and click Geocode button - verify coordinates populate
  - Enter invalid address - verify error toast appears
  - Click Geocode multiple times rapidly - verify rate limiting works
  - Test with same address twice - verify cache is used (faster second time)
- **Browser Testing**: Test in Chrome, Firefox, Safari using Playwright
- **Error Testing**:
  - Test with network disabled - verify error handling
  - Test with invalid API response - verify parsing errors handled
  - Test rate limit error (429) - verify exponential backoff

## Evidence Required
- Created component and service files
- Test output showing all GeocodingButton tests passing
- Screenshot showing successful geocoding with populated coordinates
- Screenshot showing error toast when geocoding fails
- Network trace showing caching behavior (no duplicate requests for same address)
- Playwright test results confirming browser compatibility

## Context Requirements
- Technical spec External Services Integration section
- geocode.maps.co API documentation
- Test file from TEST-FRONTEND-UI
- LocationFormFields component from IMPL-DASHBOARD-LOCATIONS

## Implementation Notes
- Use free tier of geocode.maps.co (no auth required)
- Respect rate limits to avoid service disruption
- Cache aggressively to reduce API calls and improve UX
- Provide clear feedback to users about geocoding status
- Consider fallback to manual coordinate entry if geocoding unavailable

## Quality Gates
- [ ] All unit tests pass (from TEST-FRONTEND-UI)
- [ ] Geocoding API integration works correctly
- [ ] Rate limiting prevents excessive API calls
- [ ] Caching reduces duplicate requests
- [ ] Error handling provides clear user feedback
- [ ] No console errors during geocoding operations

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Related Tasks: TEST-FRONTEND-UI, IMPL-DASHBOARD-LOCATIONS
