# Implementation Guide

> Spec: Location Name-Based Search
> Created: 2025-10-22
> Spec Folder: @.agent-os/specs/2025-10-22-location-name-search

## Development Approach

**Methodology**: Agile iterative development with feature flags

**Development Workflow**:
- **Branching Strategy**: Feature branch `feature/location-name-search` from `main`
- **Code Review Process**: PR review required before merge, minimum 1 approval
- **Commit Convention**: Conventional commits (feat:, fix:, refactor:, test:, docs:)

**Team Coordination**:
- **Roles**: 1 Full-stack developer, 1 QA engineer for E2E testing
- **Responsibilities**: Developer implements frontend + backend, QA creates E2E test suite
- **Communication**: Daily standup updates, PR comments for technical discussions

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Vendors Page                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              VendorsClient Component                  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │       LocationSearchFilter (Modified)          │  │  │
│  │  │  ┌──────────────────────────────────────────┐  │  │  │
│  │  │  │  Input: "Enter city name"                │  │  │  │
│  │  │  │  Button: "Search"                        │  │  │  │
│  │  │  └──────────────────────────────────────────┘  │  │  │
│  │  │         │                                       │  │  │
│  │  │         │ User clicks Search                    │  │  │
│  │  │         ↓                                       │  │  │
│  │  │  API Call: /api/geocode?q=Monaco             │  │  │
│  │  │         │                                       │  │  │
│  │  │         ↓                                       │  │  │
│  │  │  ┌──────────────────────────────────────────┐  │  │  │
│  │  │  │  LocationResultSelector (New)           │  │  │  │
│  │  │  │  Dialog: Multiple location results      │  │  │  │
│  │  │  └──────────────────────────────────────────┘  │  │  │
│  │  │         │                                       │  │  │
│  │  │         │ User selects location                 │  │  │
│  │  │         ↓                                       │  │  │
│  │  │  onSearch(coordinates, distance)              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │         │                                              │  │
│  │         ↓                                              │  │
│  │  useLocationFilter(vendors, coords, distance)         │  │
│  │         │                                              │  │
│  │         ↓                                              │  │
│  │  Filtered & Sorted Vendor List                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Backend API Route:
┌───────────────────────────────────────┐
│  /api/geocode (Next.js API Route)    │
│  ┌─────────────────────────────────┐  │
│  │ 1. Validate query parameters   │  │
│  │ 2. Rate limit check (IP-based) │  │
│  │ 3. Proxy to Photon API          │  │
│  │ 4. Transform response           │  │
│  │ 5. Return to frontend           │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
           │
           ↓
┌───────────────────────────────────────┐
│  Photon Geocoding API                 │
│  https://photon.komoot.io/api         │
│  Returns: GeoJSON FeatureCollection   │
└───────────────────────────────────────┘
```

### Component Relationships

```
VendorsClient (Parent)
  │
  ├─→ Passes props: onSearch, onReset, resultCount, totalCount
  │
  └─→ LocationSearchFilter (Modified Child)
        │
        ├─→ Manages state: locationInput, searchResults, isLoading
        │
        ├─→ Makes API calls to: /api/geocode
        │
        ├─→ Conditionally renders: LocationResultSelector (New)
        │     │
        │     └─→ Receives props: results, isOpen, onSelect, onCancel
        │
        └─→ Calls parent callback: onSearch(coordinates, distance)
```

### Data Flow

1. **User Input** → LocationSearchFilter state (`locationInput`)
2. **Search Trigger** → API call to `/api/geocode?q={input}`
3. **API Proxy** → Backend calls Photon API
4. **Photon Response** → Backend returns GeoJSON features
5. **Result Handling**:
   - 0 results: Show error message
   - 1 result: Auto-apply coordinates, call `onSearch`
   - 2+ results: Show LocationResultSelector dialog
6. **User Selection** → Extract coordinates from selected feature
7. **Filter Application** → Call `onSearch(coords, distance)`
8. **Vendor Filtering** → `useLocationFilter` filters/sorts vendors
9. **UI Update** → Re-render vendor list with distance badges

## Implementation Strategy

### Phase 1: Backend API Route (Week 1, Days 1-2)

**Milestone**: Functional geocoding API endpoint

**Tasks**:
1. Create `/app/api/geocode/route.ts` API route file
2. Implement query parameter validation (q, limit, lang)
3. Add Photon API integration with fetch
4. Implement simple IP-based rate limiting (Map with timestamp arrays)
5. Add error handling and logging
6. Test API route with Postman/curl

**Success Criteria**:
- API returns Photon results for valid queries
- Invalid queries return 400 errors
- Rate limiting triggers after 10 requests/minute
- Photon API errors are caught and handled

**Risk Mitigation**:
- Test Photon API availability before development
- Prepare fallback error messages for API downtime
- Document rate limits and monitor usage

### Phase 2: Frontend Location Input (Week 1, Days 3-5)

**Milestone**: Basic location name search functional

**Tasks**:
1. Modify LocationSearchFilter component
   - Replace coordinate parsing with location name input
   - Update placeholder text and help text
   - Add API call to `/api/geocode` on search
   - Implement loading state during API call
   - Handle single-result auto-selection
2. Add TypeScript types to `lib/types.ts`
   - Define `PhotonFeature` interface
   - Define `PhotonResponse` interface
3. Update input validation for text instead of coordinates
4. Test basic search flow (Monaco, Miami, New York)

**Success Criteria**:
- Users can enter city name and click Search
- Loading spinner shows during API call
- Single result locations work end-to-end
- Vendor list filters correctly by selected location

**Risk Mitigation**:
- Keep existing coordinate input code commented out as fallback
- Test with known locations first (Monaco, Miami)
- Monitor for API errors and add retry logic

### Phase 3: Multi-Result Selection UI (Week 2, Days 1-3)

**Milestone**: Ambiguous location disambiguation

**Tasks**:
1. Create LocationResultSelector component
   - Build Dialog UI with shadcn/ui components
   - Map over results to display list items
   - Add country/region context to each result
   - Implement selection and cancellation
2. Add LocationResultItem sub-component
   - Display location name with icon
   - Show city, region, country below
   - Highlight on hover
3. Integrate into LocationSearchFilter
   - Show dialog when `searchResults.length > 1`
   - Pass results array to component
   - Handle `onSelect` callback
4. Test with ambiguous locations (Paris, Springfield, Portland)

**Success Criteria**:
- Dialog shows when multiple results returned
- Each result displays full context (city, region, country)
- Clicking a result applies that location to filter
- Cancel button closes dialog without applying filter

**Risk Mitigation**:
- Design clear UI for result differences
- Test with highly ambiguous names (20+ results)
- Ensure dialog is accessible (keyboard navigation)

### Phase 4: Advanced Features (Week 2, Days 4-5)

**Milestone**: Coordinate fallback and expanded search

**Tasks**:
1. Add Collapsible section for "Advanced Options"
   - Toggle button to show/hide coordinate input
   - Preserve original coordinate input functionality
   - Conditional rendering based on `showAdvancedOptions` state
2. Support regional and postal code searches
   - Test with "California", "Bavaria", "90210"
   - Verify Photon API handles these query types
3. Add empty result handling
   - User-friendly message for no results
   - Suggestions to try different search terms
4. Polish UI and error states

**Success Criteria**:
- Advanced users can still input coordinates directly
- Regional searches return state/province results
- Postal codes return accurate locations
- All error cases display helpful messages

**Risk Mitigation**:
- Test edge cases (international postal codes, regions)
- Ensure coordinate input still validates correctly
- Provide clear UI affordances for advanced options

### Phase 5: Testing & Documentation (Week 3)

**Milestone**: Full test coverage and documentation

**Tasks**:
1. Write component unit tests
   - LocationSearchFilter search flow
   - LocationResultSelector selection logic
   - API route validation and error handling
2. Write E2E tests with Playwright
   - Simple location search workflow
   - Ambiguous location selection workflow
   - Error scenarios (invalid input, API failure)
   - Reset functionality
3. Update documentation
   - Component prop interfaces documented
   - API endpoint usage documented
   - Add inline code comments
4. QA testing across browsers and devices

**Success Criteria**:
- 80%+ code coverage on new components
- All E2E test scenarios passing
- Component JSDoc comments complete
- Manual QA sign-off for UX

**Risk Mitigation**:
- Start writing tests during development (TDD)
- Use MSW to mock API responses in tests
- Test on multiple browsers (Chrome, Firefox, Safari)

## Development Workflow

### Setup and Environment Configuration

1. **Local Development Setup**:
   ```bash
   # Clone repository and checkout feature branch
   git checkout -b feature/location-name-search

   # Install dependencies (if any new ones)
   npm install

   # Start development server
   npm run dev
   ```

2. **Environment Variables**: None required (Photon API is public)

3. **Testing Environment**:
   ```bash
   # Run unit tests
   npm run test

   # Run E2E tests
   npm run test:e2e

   # Run type checking
   npm run type-check
   ```

### Coding Standards and Conventions

- **TypeScript**: Use strict mode, define all interfaces explicitly
- **Component Structure**: Functional components with hooks (no class components)
- **Props Interfaces**: Define interfaces above component, export for testing
- **Error Handling**: Always wrap API calls in try-catch, provide user feedback
- **Async/Await**: Prefer async/await over .then() for readability
- **Comments**: Document complex logic, API contracts, and non-obvious decisions

### Testing and Validation Procedures

**Unit Testing Checklist**:
- ✅ LocationSearchFilter renders correctly
- ✅ Search button triggers API call with correct parameters
- ✅ Loading state shows spinner during API call
- ✅ Single result auto-applies coordinates
- ✅ Multiple results show LocationResultSelector
- ✅ Error messages display for API failures
- ✅ Reset button clears search state

**Integration Testing Checklist**:
- ✅ API route validates query parameters
- ✅ API route calls Photon API with correct URL
- ✅ API route handles Photon errors gracefully
- ✅ Rate limiting triggers after threshold

**E2E Testing Checklist**:
- ✅ User can search "Monaco" and see filtered vendors
- ✅ User can search "Paris" and select correct location
- ✅ Invalid search shows error message
- ✅ Reset button returns to unfiltered view
- ✅ Advanced coordinate input still works

## Quality Assurance

### Code Review Guidelines

**Required Checks Before Approval**:
1. TypeScript compiles without errors
2. All tests passing (unit + E2E)
3. No console errors in browser
4. Accessibility validated (keyboard navigation, ARIA labels)
5. Mobile responsive design verified
6. Error handling tested manually

**Review Focus Areas**:
- API security: Input validation, rate limiting implementation
- UX: Loading states, error messages, result selection clarity
- Performance: API response times, render performance
- Code quality: Type safety, error handling, code organization

### Testing Requirements

**Required Test Coverage**:
- Unit tests: 80% coverage minimum
- E2E tests: All primary user flows covered
- Manual testing: Cross-browser (Chrome, Firefox, Safari)

**Test Scenarios**:
1. Happy path: Search known location, filter applied
2. Ambiguous location: Select from multiple results
3. No results: Display error, allow retry
4. API failure: Show error, enable fallback
5. Coordinate fallback: Advanced users can enter coordinates

### Documentation Standards

**Required Documentation**:
1. Component JSDoc comments with @param and @returns
2. API endpoint documentation in code comments
3. README update with feature description
4. Inline comments for complex logic (result selection, coordinate extraction)

**Documentation Template**:
```typescript
/**
 * LocationSearchFilter - Location-based vendor search component
 *
 * Allows users to search for vendors by entering location names (cities, regions)
 * instead of coordinates. Integrates with Photon geocoding API.
 *
 * @param {LocationSearchFilterProps} props - Component props
 * @param {function} props.onSearch - Callback when location is selected
 * @param {function} props.onReset - Callback to clear search
 * @param {number} props.resultCount - Number of filtered vendors
 * @returns {JSX.Element} Location search filter card
 */
```

## Implementation Checklist

### Phase 1: Backend API Route ✅
- [ ] Create `/app/api/geocode/route.ts`
- [ ] Implement query parameter validation
- [ ] Integrate Photon API with fetch
- [ ] Add rate limiting (IP-based)
- [ ] Add error handling and logging
- [ ] Test with curl/Postman

### Phase 2: Frontend Location Input ✅
- [ ] Modify LocationSearchFilter component
- [ ] Replace coordinate parsing with location name
- [ ] Add API call to `/api/geocode`
- [ ] Implement loading state
- [ ] Handle single-result auto-selection
- [ ] Add TypeScript types to `lib/types.ts`
- [ ] Update validation logic
- [ ] Test basic search flow

### Phase 3: Multi-Result Selection UI ✅
- [ ] Create LocationResultSelector component
- [ ] Build Dialog UI with shadcn/ui
- [ ] Create LocationResultItem sub-component
- [ ] Integrate into LocationSearchFilter
- [ ] Test ambiguous locations (Paris, Springfield)

### Phase 4: Advanced Features ✅
- [ ] Add Collapsible for coordinate fallback
- [ ] Support regional searches (California, Bavaria)
- [ ] Support postal code searches (90210, M5V 3A8)
- [ ] Add empty result handling
- [ ] Polish UI and error states

### Phase 5: Testing & Documentation ✅
- [ ] Write LocationSearchFilter unit tests
- [ ] Write LocationResultSelector unit tests
- [ ] Write API route tests
- [ ] Write E2E tests (Playwright)
- [ ] Add JSDoc comments
- [ ] Update README
- [ ] QA testing and sign-off

## Deployment Considerations

**Pre-Deployment Checklist**:
- [ ] All tests passing in CI/CD
- [ ] Type checking passes
- [ ] Build succeeds without errors
- [ ] Preview deployment tested
- [ ] Feature flag enabled (if using staged rollout)

**Post-Deployment Monitoring**:
- Monitor API route error rates (target < 1%)
- Track Photon API response times (target < 2s P95)
- Monitor rate limiting triggers
- Collect user feedback on search experience

**Rollback Plan**:
- Feature can be rolled back by reverting PR
- No database migrations, so rollback is safe
- Coordinate input fallback ensures users aren't blocked
