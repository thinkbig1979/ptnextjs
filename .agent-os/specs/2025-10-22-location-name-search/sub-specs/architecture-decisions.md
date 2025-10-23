# Architecture Decisions

> Spec: Location Name-Based Search
> Created: 2025-10-22

## Architectural Decision Records

### ADR-001: Use Photon API for Geocoding

**Date**: 2025-10-22

**Status**: Accepted

**Context**:
We need a geocoding service to convert location names (cities, towns) to geographic coordinates (latitude, longitude) for the location-based vendor search feature. Options considered:
1. Photon API (Komoot) - Free, open-source, no API key required
2. Google Maps Geocoding API - Paid, requires API key, $5 per 1,000 requests
3. Mapbox Geocoding API - Paid, requires API key, free tier limited
4. Nominatim (OpenStreetMap) - Free, but discourages high-volume use

**Decision**:
Use Photon Geocoding API (https://photon.komoot.io) as the primary geocoding service.

**Rationale**:
- **No Cost**: Free public API with no usage limits for reasonable use
- **No Authentication**: No API keys to manage or secure
- **Open Source**: Self-hosting option available if public service becomes unreliable
- **GeoJSON Standard**: Returns standard GeoJSON format for easy parsing
- **Good Coverage**: Powered by OpenStreetMap data with global coverage
- **Simple API**: Clean REST API with minimal required parameters

**Consequences**:
- **Positive**:
  - Zero infrastructure cost for MVP
  - No API key management complexity
  - Easy to swap providers later (abstraction via `/api/geocode` route)
  - Self-hosting option if needed (Docker image available)
- **Negative**:
  - No official SLA (public service best-effort availability)
  - Rate limiting not enforced by service (must self-impose)
  - May require self-hosting for production scale

**Alternatives Considered**:
- **Google Maps**: Ruled out due to cost ($5/1k requests) and API key management
- **Mapbox**: Ruled out due to free tier limits (100k/month) and API key requirement
- **Nominatim**: Ruled out due to usage policy discouraging high-volume use

---

### ADR-002: Proxy Geocoding Requests Through Backend API

**Date**: 2025-10-22

**Status**: Accepted

**Context**:
Geocoding API calls need to be made from either the frontend (browser) or backend (server). Direct frontend calls expose the API to CORS issues, make rate limiting difficult, and reveal implementation details.

**Decision**:
Create a Next.js API route at `/api/geocode` to proxy all geocoding requests to Photon API.

**Rationale**:
- **CORS Prevention**: Backend-to-backend calls avoid browser CORS restrictions
- **Rate Limiting**: Centralized rate limiting by IP address to prevent abuse
- **Abstraction**: Frontend doesn't know about Photon API specifics, easy to swap providers
- **Monitoring**: Single point for logging, error handling, and observability
- **Security**: Can add authentication/authorization later if needed

**Consequences**:
- **Positive**:
  - Frontend code is provider-agnostic (easy to change geocoding service)
  - Rate limiting protects against API abuse and excessive costs
  - Centralized error handling and logging
  - No CORS issues in browser
- **Negative**:
  - Adds latency (extra network hop through backend)
  - Backend service becomes dependency (must be available)
  - Requires backend infrastructure scaling if high traffic

**Alternatives Considered**:
- **Direct Frontend Calls**: Ruled out due to CORS issues and inability to rate limit effectively
- **Serverless Function**: Considered, but Next.js API routes are simpler for this use case

---

### ADR-003: Show Location Result Selector for Ambiguous Queries

**Date**: 2025-10-22

**Status**: Accepted

**Context**:
Location searches may return multiple results (e.g., "Paris" returns Paris, France and Paris, Texas). Options for handling:
1. Auto-select first result (fastest, but may be wrong)
2. Show dropdown for user to select (requires user action)
3. Show all results on map for visual selection (complex UI)

**Decision**:
Display a Modal/Dialog with a list of location results, allowing the user to select the correct location before applying the filter.

**Rationale**:
- **Accuracy**: User explicitly chooses intended location, avoiding incorrect filters
- **Clarity**: Shows full context (city, region, country) for each result
- **User Control**: Gives user confidence that correct location was selected
- **Simple UI**: Modal/Dialog is familiar pattern, easy to implement with shadcn/ui

**Consequences**:
- **Positive**:
  - Prevents incorrect location selections (e.g., wrong "Paris")
  - Provides clear context for disambiguation
  - Allows user to cancel if none of the results are correct
  - Better UX than showing filtered vendors for wrong location
- **Negative**:
  - Adds extra click for ambiguous locations
  - Slightly more complex implementation than auto-select
  - May slow down workflow for users who know the first result is correct

**Alternatives Considered**:
- **Auto-Select First**: Ruled out due to high risk of incorrect location
- **Map Selection**: Ruled out due to complexity (requires map integration)

---

### ADR-004: Preserve Coordinate Input as "Advanced Options"

**Date**: 2025-10-22

**Status**: Accepted

**Context**:
The current LocationSearchFilter component accepts latitude/longitude coordinates. Replacing this with location name search removes functionality for advanced users who prefer exact coordinates.

**Decision**:
Keep coordinate input functionality, but hide it behind a Collapsible "Advanced Options" section that users can expand if needed.

**Rationale**:
- **Backward Compatibility**: Existing functionality preserved for power users
- **Fallback**: If geocoding service is down, users can still search by coordinates
- **Flexibility**: Some users may know exact coordinates (e.g., from GPS devices)
- **No Harm**: Collapsible section doesn't clutter UI for typical users

**Consequences**:
- **Positive**:
  - No functionality lost in migration to location name search
  - Fallback option if Photon API is unavailable
  - Satisfies advanced user needs
  - Maintains backward compatibility
- **Negative**:
  - Slightly more code to maintain (both input methods)
  - Risk of confusing users if both are visible (mitigated by Collapsible)

**Alternatives Considered**:
- **Remove Coordinate Input**: Ruled out due to loss of functionality
- **Show Both by Default**: Ruled out due to cluttered UI

---

### ADR-005: Use React useState for Component State Management

**Date**: 2025-10-22

**Status**: Accepted

**Context**:
Location search state (input value, search results, selected location) needs to be managed. Options:
1. React useState (local component state)
2. Redux/Zustand (global state)
3. Context API (shared state)
4. URL state (query parameters)

**Decision**:
Use React useState for all location search state, managed locally in LocationSearchFilter component.

**Rationale**:
- **Simplicity**: No global state management library needed
- **Encapsulation**: Location search state is local to component, no need for global access
- **Performance**: No unnecessary re-renders of unrelated components
- **Existing Pattern**: Project already uses useState for similar filter components

**Consequences**:
- **Positive**:
  - Simple implementation, no library dependencies
  - State is isolated to LocationSearchFilter component
  - Easy to test component in isolation
  - Consistent with existing codebase patterns
- **Negative**:
  - State is lost on page navigation (acceptable - search is ephemeral)
  - Cannot access search state from other components (not needed)

**Alternatives Considered**:
- **Redux/Zustand**: Ruled out as overkill for local component state
- **Context API**: Ruled out as no other components need this state
- **URL State**: Considered for deep linking, but out of scope for MVP

---

### ADR-006: Support Multiple Location Types (Cities, Regions, Postal Codes)

**Date**: 2025-10-22

**Status**: Accepted

**Context**:
Location searches could be restricted to cities only, or expanded to include regions, postal codes, and landmarks. Options:
1. Cities and towns only (simplest)
2. Cities, regions, postal codes (flexible)
3. All location types including landmarks (most flexible)

**Decision**:
Support cities, towns, regions/states, postal codes, and landmarks in location searches without requiring users to specify location type.

**Rationale**:
- **Flexibility**: Users can search how they think about locations
- **User Convenience**: No need to understand location type taxonomy
- **Photon API Support**: Photon already returns all location types by default
- **No Extra Cost**: No additional API calls or complexity

**Consequences**:
- **Positive**:
  - Users can search "California" (region) or "90210" (postal code) naturally
  - More intuitive search experience
  - Supports various user mental models of "location"
  - Leverages Photon API capabilities
- **Negative**:
  - May return unexpected results (e.g., "Paris Hotel" landmark vs "Paris" city)
  - Requires clear UI to show location type in result selector
  - Could confuse users if results are too broad

**Alternatives Considered**:
- **Cities Only**: Ruled out as too restrictive for user needs
- **Type Filters**: Ruled out due to added UI complexity

---

## Technical Constraints

### Performance Constraints

**API Response Time**:
- **Constraint**: Photon API response time varies (500ms-2s typical)
- **Mitigation**: Set 5-second timeout on API calls
- **Impact**: Users may experience occasional slow searches
- **Acceptance Criteria**: 95% of searches complete within 3 seconds

**Client-Side Rendering**:
- **Constraint**: LocationSearchFilter is a client component (requires React state)
- **Mitigation**: Server component (VendorsClient) passes static props
- **Impact**: Initial page load includes client-side JavaScript
- **Acceptance Criteria**: Component JavaScript bundle < 20KB

**Vendor Filtering Performance**:
- **Constraint**: Haversine distance calculations for all vendors
- **Mitigation**: Calculations are fast (O(n)), no performance impact expected
- **Impact**: Negligible for typical vendor counts (< 1000)
- **Acceptance Criteria**: Filter calculation < 100ms for 1000 vendors

### Scalability Constraints

**Rate Limiting**:
- **Constraint**: Photon public API has no official rate limits
- **Mitigation**: Self-imposed limit of 10 requests/minute per IP
- **Impact**: Heavy users may hit rate limit temporarily
- **Acceptance Criteria**: < 1% of users hit rate limit

**API Availability**:
- **Constraint**: Photon public API has no SLA
- **Mitigation**: Coordinate input fallback + consider self-hosting for production
- **Impact**: Occasional service unavailability possible
- **Acceptance Criteria**: 99% uptime acceptable for MVP

**Infrastructure Scaling**:
- **Constraint**: Next.js API route must handle concurrent requests
- **Mitigation**: Vercel/hosting platform auto-scales
- **Impact**: Minimal, API route is stateless and lightweight
- **Acceptance Criteria**: Handle 100 requests/minute without degradation

### Security Constraints

**No Authentication**:
- **Constraint**: Photon API is public, no authentication required
- **Mitigation**: Rate limiting prevents abuse
- **Impact**: Cannot control access beyond IP-based rate limiting
- **Acceptance Criteria**: Rate limiting prevents API abuse

**IP-Based Rate Limiting**:
- **Constraint**: IP addresses may be shared (NAT, VPNs)
- **Mitigation**: Rate limit threshold set reasonably high (10/minute)
- **Impact**: Shared IP users may collectively hit limit
- **Acceptance Criteria**: < 5% of legitimate users affected

**No Data Persistence**:
- **Constraint**: No database to store search history or user preferences
- **Mitigation**: Feature doesn't require persistence for MVP
- **Impact**: Users cannot save favorite locations
- **Acceptance Criteria**: Acceptable for MVP, enhancement for later

### Resource Constraints

**No Additional Budget**:
- **Constraint**: Must use free/open-source services and libraries
- **Mitigation**: Photon API is free, no paid services required
- **Impact**: Limited to public API performance and availability
- **Acceptance Criteria**: Zero additional infrastructure costs

**No New Dependencies**:
- **Constraint**: Avoid adding new npm packages if possible
- **Mitigation**: Use existing shadcn/ui components and fetch API
- **Impact**: May require slightly more code vs. using library
- **Acceptance Criteria**: Zero new npm dependencies

**Development Time**:
- **Constraint**: Feature should be completable in 3 weeks
- **Mitigation**: Phased implementation plan (backend → frontend → advanced features)
- **Impact**: MVP feature set, enhancements deferred
- **Acceptance Criteria**: Core functionality delivered in 3 weeks

## Design Principles

### Simplicity First

**Principle**: Choose the simplest solution that meets requirements

**Application**:
- Used React useState instead of Redux for state management
- Proxied API calls through simple Next.js API route instead of complex middleware
- Used shadcn/ui Dialog instead of building custom modal

**Benefits**:
- Faster development
- Easier maintenance
- Lower cognitive load for future developers

### Progressive Enhancement

**Principle**: Core functionality works without JavaScript, enhancements add UX improvements

**Application**:
- Location search is client-side enhancement (vendors page works without it)
- Coordinate input fallback if geocoding fails
- Basic HTML form patterns with JavaScript enhancements

**Benefits**:
- Better accessibility
- Graceful degradation
- Resilient to failures

### Separation of Concerns

**Principle**: Keep concerns (UI, business logic, API calls) in separate layers

**Application**:
- LocationSearchFilter: UI and user interactions
- /api/geocode: API proxy and rate limiting
- useLocationFilter: Vendor filtering logic
- VendorsClient: Vendor display and coordination

**Benefits**:
- Easier testing (mock boundaries)
- Easier to replace layers (e.g., swap geocoding provider)
- Clear responsibilities

### Fail Gracefully

**Principle**: Errors should not break the user experience

**Application**:
- API errors show user-friendly messages
- Coordinate input fallback if geocoding unavailable
- Empty results show helpful guidance
- Rate limiting shows "try again later" message

**Benefits**:
- Better user experience during failures
- System remains usable even with partial outages
- Users have clear recovery actions

## Technology Choices

### Frontend Framework: Next.js 14 with App Router

**Choice**: Next.js 14 with App Router

**Rationale**:
- Already used in project (no change)
- Server components for static content + client components for interactivity
- API routes for backend proxy
- Excellent TypeScript support

**Alternatives Considered**: None (project already using Next.js)

### UI Component Library: shadcn/ui

**Choice**: shadcn/ui (Radix UI primitives + Tailwind CSS)

**Rationale**:
- Already used in project (consistent design)
- Dialog, Input, Button, Collapsible components available
- Accessible by default (WCAG 2.1 AA)
- Customizable with Tailwind CSS

**Alternatives Considered**: None (project already using shadcn/ui)

### Geocoding Service: Photon API

**Choice**: Photon Geocoding API (https://photon.komoot.io)

**Rationale**: See ADR-001 above

**Alternatives Considered**: Google Maps, Mapbox, Nominatim

### State Management: React useState

**Choice**: React useState (local component state)

**Rationale**: See ADR-005 above

**Alternatives Considered**: Redux, Zustand, Context API, URL state

### HTTP Client: Fetch API

**Choice**: Browser fetch API and Node.js fetch (built-in)

**Rationale**:
- No external dependencies
- Standard Web API
- Async/await support
- Sufficient for simple GET requests

**Alternatives Considered**:
- axios: Ruled out (unnecessary dependency for simple requests)
- node-fetch: Ruled out (Node 18+ has built-in fetch)

### TypeScript: Strict Mode

**Choice**: TypeScript with strict mode enabled

**Rationale**:
- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code with types
- Project already uses TypeScript

**Alternatives Considered**: None (project already using TypeScript strict mode)

## Future Considerations

### Potential Future Enhancements

**Autocomplete/Suggestions**:
- As user types, show location suggestions in dropdown
- Reduces API calls (only on final selection)
- Improves UX (faster search)
- **Technical Requirement**: Debouncing to limit API calls

**Map Visualization**:
- Show vendors on interactive map
- Click on map to set search location
- Visual representation of distance
- **Technical Requirement**: Map library (Mapbox, Leaflet, Google Maps)

**Saved Locations**:
- Allow users to save favorite locations
- Quick access to frequently searched areas
- **Technical Requirement**: User authentication + database

**Geolocation Browser API**:
- "Use My Current Location" button
- Automatically detect user's location
- **Technical Requirement**: HTTPS (geolocation requires secure context)

**Location Bias**:
- Bias search results based on user's detected region
- Improve relevance of results
- **Technical Requirement**: IP geolocation or browser geolocation

### Scalability Considerations

**Self-Hosted Photon**:
- If public API becomes unreliable or traffic grows
- Deploy Photon in Docker container
- Full control over availability and performance
- **Estimated Effort**: 1-2 days deployment + testing

**Database Caching**:
- Cache frequent geocoding queries in database
- Reduce Photon API calls for popular locations
- **Estimated Effort**: 2-3 days implementation + testing

**CDN Edge Functions**:
- Move `/api/geocode` to edge function (Vercel Edge, Cloudflare Workers)
- Reduce latency for global users
- **Estimated Effort**: 1 day migration + testing

### Migration Strategies

**Swapping Geocoding Providers**:
1. Update `/api/geocode` route to call new provider API
2. Transform new provider response to match PhotonFeature interface
3. Test thoroughly with production-like queries
4. Deploy with feature flag (gradual rollout)

**Adding Map Visualization**:
1. Choose map library (Mapbox, Leaflet, etc.)
2. Create new MapView component
3. Add tab/toggle to switch between list and map view
4. Integrate with existing location filter logic

**Implementing Autocomplete**:
1. Add debounced input handler (500ms delay)
2. Create suggestions dropdown component
3. Limit suggestions to 5 results
4. Update state on selection instead of button click

## Decision Log

| Date | Decision | Status | Rationale Summary |
|------|----------|--------|-------------------|
| 2025-10-22 | Use Photon API for geocoding | Accepted | Free, no API key, good coverage |
| 2025-10-22 | Proxy requests through backend | Accepted | CORS prevention, rate limiting |
| 2025-10-22 | Show result selector for ambiguous queries | Accepted | Accuracy, user control |
| 2025-10-22 | Preserve coordinate input as advanced option | Accepted | Backward compatibility, fallback |
| 2025-10-22 | Use React useState for state | Accepted | Simplicity, encapsulation |
| 2025-10-22 | Support multiple location types | Accepted | Flexibility, user convenience |

## Architecture Review Sign-Off

**Reviewed By**: [Developer Name]
**Review Date**: [Date]
**Approved By**: [Tech Lead Name]
**Approval Date**: [Date]

**Review Comments**: [Any architectural concerns or suggestions]

**Approval Status**: ✅ Approved / ⚠️ Approved with Conditions / ❌ Rejected
