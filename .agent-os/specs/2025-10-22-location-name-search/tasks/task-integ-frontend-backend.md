# Task: integ-frontend-backend - Frontend-Backend Integration

**Metadata:**
- **Task ID:** integ-frontend-backend
- **Phase:** Phase 4: Frontend-Backend Integration
- **Agent:** integration-coordinator
- **Estimated Time:** 20-25 min
- **Dependencies:** integ-api-contract
- **Status:** Pending
- **Priority:** Critical

## Description

Integrate the frontend location search components with the real backend /api/geocode endpoint, test with actual Photon API responses, and validate the complete stack works end-to-end.

## Specifics

**Integration Tasks:**

1. **Connect Frontend to Real Backend:**
   - Remove any mock API responses in frontend
   - Configure frontend to call local /api/geocode endpoint
   - Test with dev server running (npm run dev)
   - Verify network requests in browser DevTools

2. **Test with Real Photon API:**
   - Simple queries (Monaco, Paris, London)
   - Ambiguous queries (Paris → multiple results)
   - Regional queries (California, Bavaria)
   - Postal code queries (90210, 75001)
   - International characters (São Paulo, München)
   - Invalid queries (random strings)

3. **Error Scenario Testing:**
   - Rate limiting (make 11 rapid requests)
   - Network disconnection (test offline)
   - API timeout (mock slow Photon response)
   - Invalid Photon response (rare edge case)

4. **State Synchronization:**
   - Loading states during API calls
   - Error states after API failures
   - Success states with results
   - Dialog state with multiple results
   - Filter application after selection

5. **Performance Validation:**
   - Measure request/response times
   - Verify debouncing reduces API calls
   - Check for memory leaks (repeated searches)
   - Validate concurrent request handling

**Testing Environment:**
- Local dev server: `npm run dev`
- Real Photon API (internet connection required)
- Browser DevTools for network inspection
- React DevTools for state inspection

## Acceptance Criteria

- [ ] Frontend successfully calls /api/geocode endpoint
- [ ] Real Photon API responses handled correctly
- [ ] Simple searches return and display results
- [ ] Ambiguous searches show selector dialog
- [ ] Result selection applies filter correctly
- [ ] Error scenarios display appropriate messages
- [ ] Rate limiting prevents excessive requests
- [ ] Loading states display during API calls
- [ ] Debouncing reduces unnecessary API calls
- [ ] Performance acceptable (< 2 sec per search)
- [ ] No console errors during normal operation
- [ ] Memory usage stable over repeated searches

## Testing Requirements

**Functional Testing:**
- Start dev server: `npm run dev`
- Open browser to vendors page
- Execute test scenarios manually

**Manual Verification:**

```markdown
## Test Scenario 1: Simple Search (Single Result)
1. Navigate to vendors page
2. Type "Monaco" in location search
3. Observe:
   - Loading spinner appears
   - API call in Network tab
   - Single result auto-applies
   - Vendors filtered by location
   - No dialog appears
4. Expected: Filter applied, vendors near Monaco shown

## Test Scenario 2: Ambiguous Search (Multiple Results)
1. Reset filter
2. Type "Paris" in location search
3. Observe:
   - Loading spinner appears
   - API call in Network tab
   - Dialog opens with multiple results
   - Results include: Paris (France), Paris (TX), Paris (TN)
4. Select "Paris, Île-de-France, France"
5. Expected: Dialog closes, filter applied, vendors near Paris, France shown

## Test Scenario 3: Empty Results
1. Reset filter
2. Type "asdfghjkl" (invalid location)
3. Observe:
   - Loading spinner appears
   - API call in Network tab
   - "No locations found" message appears
4. Expected: No results message displayed, no filter applied

## Test Scenario 4: Rate Limiting
1. Open browser console
2. Execute:
   ```javascript
   for (let i = 0; i < 11; i++) {
     fetch('/api/geocode?q=test' + i);
   }
   ```
3. Observe Network tab
4. Expected: 11th request returns 429 status, Retry-After header present

## Test Scenario 5: Network Error
1. Open DevTools → Network tab
2. Set network to "Offline"
3. Type "Monaco" in location search
4. Expected: Network error message displayed

## Test Scenario 6: Debouncing
1. Type "M" "o" "n" "a" "c" "o" rapidly (< 300ms between keys)
2. Observe Network tab
3. Expected: Only ONE API call ~300ms after last keystroke

## Test Scenario 7: International Characters
1. Type "São Paulo" in location search
2. Observe API request URL in Network tab
3. Expected: Properly encoded (%C3%A3), results for São Paulo returned

## Test Scenario 8: Advanced Coordinate Input
1. Click "Advanced: Enter coordinates manually"
2. Enter Latitude: 43.7384
3. Enter Longitude: 7.4246
4. Expected: Filter applied based on coordinates (Monaco location)

## Test Scenario 9: Distance Slider
1. Apply location filter (Monaco)
2. Adjust distance slider to 50 km
3. Observe vendor list updates
4. Expected: Only vendors within 50 km of Monaco shown

## Test Scenario 10: Reset
1. Apply location filter
2. Adjust distance slider
3. Click "Reset Filter"
4. Expected: All inputs cleared, all vendors shown
```

**Browser Testing:**
- Chrome: All scenarios work
- Firefox: Network requests and state management correct
- Safari: API calls and rendering correct
- Mobile Safari: Touch interactions and responsive design
- Mobile Chrome: Mobile UX and performance

**Performance Metrics:**
- Search response time: < 2 seconds
- Debounce delay: 300ms ± 50ms
- Dialog open time: < 100ms
- Filter application: < 100ms
- Memory usage: Stable over 20 searches

**Evidence Required:**
- Manual test results for all 10 scenarios
- Screenshots/video of successful workflows
- Network tab screenshots showing:
  - Successful API call
  - Rate limiting (429 response)
  - Debouncing (single call for rapid typing)
- Performance metrics documented
- Browser compatibility test results
- No console errors screenshot

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-integ-api-contract.md
- Complete frontend implementation
- Complete backend implementation
- Dev server configuration

**Assumptions:**
- Dev server can run locally
- Internet connection available for Photon API
- All components implemented and passing unit tests
- Backend API is functional

## Implementation Notes

**Testing Setup:**

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Watch for console output
# (Keep eye on terminal for any server-side errors)

# Browser: Open DevTools
# - Console tab: Watch for errors
# - Network tab: Monitor API calls
# - React DevTools: Inspect component state
```

**Common Integration Issues to Check:**

1. **CORS Issues:**
   - API route should not have CORS issues (same origin)
   - Verify no CORS errors in console

2. **Environment Variables:**
   - Photon API URL should be accessible
   - No API key required (Photon is free)

3. **Request/Response Mismatch:**
   - Frontend sends correct parameters
   - Backend returns expected format
   - Type errors in response handling

4. **State Management:**
   - Loading state sets before API call
   - Loading state clears after response
   - Error state sets on API error
   - Results state updates correctly

5. **Race Conditions:**
   - Rapid searches don't cause state conflicts
   - Previous requests canceled or ignored
   - Dialog doesn't flicker

**Debugging Commands:**

```javascript
// In browser console

// Check API endpoint
fetch('/api/geocode?q=Monaco&limit=5')
  .then(r => r.json())
  .then(console.log);

// Monitor all fetch calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch:', args[0]);
  return originalFetch.apply(this, args);
};

// Check React component state (with React DevTools)
// Select LocationSearchFilter component
// Inspect state: locationInput, searchResults, isLoading, error
```

**Performance Monitoring:**

```javascript
// Measure search performance
const start = performance.now();

// Trigger search...

// After results displayed
const end = performance.now();
console.log('Search took:', end - start, 'ms');
```

## Quality Gates

- [ ] All manual test scenarios pass
- [ ] No console errors during normal operation
- [ ] Network requests formatted correctly
- [ ] API responses handled properly
- [ ] Error scenarios display user-friendly messages
- [ ] Performance metrics within acceptable range
- [ ] Debouncing reduces API calls
- [ ] Rate limiting works
- [ ] State management consistent
- [ ] Cross-browser compatibility verified

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md

**Implementation Files:**
- /home/edwin/development/ptnextjs/app/api/geocode/route.ts
- /home/edwin/development/ptnextjs/components/LocationSearchFilter.tsx
- /home/edwin/development/ptnextjs/components/location-result-selector.tsx
- /home/edwin/development/ptnextjs/hooks/useLocationFilter.ts

**Related Tasks:**
- task-integ-api-contract (prerequisite)
- task-test-e2e-workflow (next: E2E automated testing)
