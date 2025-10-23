# Integration Requirements

> Spec: Location Name-Based Search
> Created: 2025-10-22
> Integration Systems: Photon Geocoding API, VendorsClient Component, useLocationFilter Hook

## System Integration Overview

### Integration Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Browser (Client)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          LocationSearchFilter Component              │  │
│  │                                                      │  │
│  │  User enters: "Monaco"                               │  │
│  │          ↓                                           │  │
│  │  fetch('/api/geocode?q=Monaco&limit=5')            │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────│─────────────────────────────┘
                               │ HTTPS Request
                               ↓
┌────────────────────────────────────────────────────────────┐
│              Next.js Server (Backend)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         /api/geocode API Route Handler              │  │
│  │                                                      │  │
│  │  1. Validate query parameters                       │  │
│  │  2. Check rate limit (IP-based)                     │  │
│  │  3. Proxy to Photon API                             │  │
│  │          ↓                                           │  │
│  │  fetch('https://photon.komoot.io/api?q=Monaco')    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────│─────────────────────────────┘
                               │ HTTPS Request
                               ↓
┌────────────────────────────────────────────────────────────┐
│         Photon Geocoding API (External Service)            │
│  https://photon.komoot.io                                  │
│                                                            │
│  Returns: GeoJSON FeatureCollection                        │
│  {                                                         │
│    features: [                                             │
│      {                                                     │
│        geometry: { coordinates: [7.4246, 43.7384] },      │
│        properties: { name: "Monaco", country: "Monaco" }  │
│      }                                                     │
│    ]                                                       │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
                               │ GeoJSON Response
                               ↓
┌────────────────────────────────────────────────────────────┐
│              Next.js Server (Backend)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         /api/geocode API Route Handler              │  │
│  │                                                      │  │
│  │  4. Receive Photon response                         │  │
│  │  5. Forward to client (no transformation)           │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────│─────────────────────────────┘
                               │ JSON Response
                               ↓
┌────────────────────────────────────────────────────────────┐
│                    Browser (Client)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          LocationSearchFilter Component              │  │
│  │                                                      │  │
│  │  6. Extract coordinates: {lat: 43.7384, lon: 7.4246}│  │
│  │  7. Call: onSearch(coordinates, distance)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                       ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            VendorsClient Component                   │  │
│  │                                                      │  │
│  │  8. Pass coords to: useLocationFilter hook          │  │
│  └──────────────────────────────────────────────────────┘  │
│                       ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            useLocationFilter Hook                    │  │
│  │                                                      │  │
│  │  9. Calculate distances using Haversine formula     │  │
│  │  10. Filter vendors within radius                   │  │
│  │  11. Sort by distance ascending                     │  │
│  │  12. Return: filteredVendors with distance data     │  │
│  └──────────────────────────────────────────────────────┘  │
│                       ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            VendorsClient Component                   │  │
│  │                                                      │  │
│  │  13. Re-render vendor grid with filtered results    │  │
│  │  14. Display distance badges on vendor cards        │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Data Flow Between Systems

1. **User Input → Frontend Component**: User types location name in `LocationSearchFilter`
2. **Frontend → Backend API**: Browser sends GET request to `/api/geocode?q={query}`
3. **Backend → External API**: Next.js API route proxies request to Photon API
4. **External API → Backend**: Photon returns GeoJSON features with coordinates
5. **Backend → Frontend**: API route forwards Photon response to browser
6. **Frontend Component → Parent Component**: `LocationSearchFilter` extracts coordinates and calls `onSearch` callback
7. **Parent Component → Hook**: `VendorsClient` passes coordinates to `useLocationFilter`
8. **Hook → Parent Component**: Hook returns filtered vendor list sorted by distance
9. **Parent Component → UI**: `VendorsClient` re-renders with filtered vendors

### Integration Points

**Key Integration Boundaries**:
- **External API Boundary**: Next.js ↔ Photon API (HTTPS, public endpoint)
- **Component Boundary**: LocationSearchFilter ↔ VendorsClient (props/callbacks)
- **Hook Boundary**: VendorsClient ↔ useLocationFilter (function call)

## API Integration Requirements

### Photon Geocoding API Integration

**Service**: Photon Geocoding API
**Base URL**: `https://photon.komoot.io`
**Protocol**: HTTPS
**Authentication**: None (public API)

#### Forward Geocoding Endpoint

**Endpoint**: `GET https://photon.komoot.io/api`

**Query Parameters**:
```typescript
interface PhotonQueryParams {
  q: string;              // Search query (required)
  limit?: number;         // Max results (default: 50, recommend: 5-10)
  lang?: string;          // Language code (default: 'en')
  lat?: number;           // Bias latitude (optional)
  lon?: number;           // Bias longitude (optional)
  zoom?: number;          // Bias zoom level (optional)
  bbox?: string;          // Bounding box: minLon,minLat,maxLon,maxLat (optional)
  osm_tag?: string;       // Filter by OSM tag (optional)
  layer?: string;         // Filter by type: city, country, state, etc. (optional)
}
```

**Request Example**:
```http
GET https://photon.komoot.io/api?q=Monaco&limit=5&lang=en
```

**Response Format** (GeoJSON FeatureCollection):
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [7.4246, 43.7384]
      },
      "properties": {
        "name": "Monaco",
        "country": "Monaco",
        "countrycode": "MC",
        "city": "Monaco",
        "osm_type": "R",
        "osm_key": "place",
        "osm_value": "city",
        "extent": [7.4091, 43.7252, 7.4399, 43.7515]
      }
    }
  ]
}
```

**Error Responses**:
- **503 Service Unavailable**: Photon service is down
- **Timeout**: Request exceeds timeout threshold (5s recommended)
- **Empty Array**: No matching locations found (`{ features: [] }`)

**Rate Limiting**:
- Public API encourages "reasonable" usage
- No official rate limits published
- Recommend self-imposed limit: 10 requests/minute per user

**Timeout Configuration**:
- Connection timeout: 5000ms
- Read timeout: 5000ms
- Implement single retry on 5xx errors with 1-second delay

**Integration Requirements**:
1. **Proxy Through Backend**: Never call Photon directly from frontend (CORS, rate limit control)
2. **Error Handling**: Catch and translate Photon errors to user-friendly messages
3. **Response Validation**: Validate GeoJSON structure before passing to frontend
4. **Caching**: Optional - cache frequent queries (Monaco, Paris) in-memory for 1 hour

### Internal API Route Specification

**Endpoint**: `GET /api/geocode`

**Purpose**: Proxy Photon API requests with validation and rate limiting

**Request Interface**:
```typescript
interface GeocodeRequest {
  query: URLSearchParams {
    q: string;           // Location name (required, min 2 chars)
    limit?: string;      // Max results (optional, default: 5, max: 10)
    lang?: string;       // Language (optional, default: 'en')
  }
}
```

**Response Interface**:
```typescript
interface GeocodeSuccessResponse {
  type: 'FeatureCollection';
  features: PhotonFeature[];
}

interface GeocodeErrorResponse {
  success: false;
  error: {
    code: 'INVALID_QUERY' | 'RATE_LIMIT' | 'GEOCODING_FAILED' | 'SERVER_ERROR';
    message: string;
    details?: string;
    timestamp: string;
  };
}
```

**Status Codes**:
- `200 OK`: Successful geocoding (even if features array is empty)
- `400 Bad Request`: Invalid query parameters
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Photon API error or server error
- `503 Service Unavailable`: Photon service is down

**Implementation Requirements**:
1. Validate `q` parameter exists and is at least 2 characters
2. Sanitize query parameter (trim whitespace, URL encode)
3. Limit `limit` parameter to maximum of 10
4. Track requests per IP address for rate limiting
5. Set timeout of 5 seconds on Photon API calls
6. Log all errors for monitoring

## Component Integration Requirements

### VendorsClient Component Integration

**Component Path**: `app/(site)/components/vendors-client.tsx`

**Integration Type**: Parent-child component relationship via props

**Current Interface** (preserved):
```typescript
interface VendorsClientProps {
  initialVendors: Vendor[];
  initialCategories: string[];
  initialProducts?: Product[];
  showPartnersOnly?: boolean;
  showNonPartnersOnly?: boolean;
  baseUrl?: string;
  pageTitle?: string;
}

// LocationSearchFilter receives callbacks via props
<LocationSearchFilter
  onSearch={handleLocationSearch}
  onReset={handleLocationReset}
  resultCount={filteredVendors.length}
  totalCount={initialVendors.length}
/>
```

**Integration Requirements**:

1. **onSearch Callback**:
   ```typescript
   const handleLocationSearch = (userLocation: VendorCoordinates, distance: number) => {
     setUserLocation(userLocation);
     setMaxDistance(distance);
     setCurrentPage(1); // Reset pagination
   };
   ```

2. **onReset Callback**:
   ```typescript
   const handleLocationReset = () => {
     setUserLocation(null);
     setMaxDistance(100);
     setCurrentPage(1);
   };
   ```

3. **State Management**:
   ```typescript
   const [userLocation, setUserLocation] = React.useState<VendorCoordinates | null>(null);
   const [maxDistance, setMaxDistance] = React.useState<number>(100);
   ```

4. **useLocationFilter Hook Integration**:
   ```typescript
   const {
     filteredVendors: locationFilteredVendors,
     vendorsWithCoordinates,
     isFiltering: isLocationFiltering
   } = useLocationFilter(initialVendors, userLocation, maxDistance);
   ```

**No Changes Required**: VendorsClient already implements all required integration points

### useLocationFilter Hook Integration

**Hook Path**: `hooks/useLocationFilter.ts`

**Integration Type**: Function call with parameters

**Current Interface** (preserved):
```typescript
interface UseLocationFilterReturn {
  filteredVendors: VendorWithDistance[];
  vendorsWithCoordinates: Vendor[];
  isFiltering: boolean;
}

function useLocationFilter(
  vendors: Vendor[],
  userLocation: VendorCoordinates | null,
  maxDistance: number
): UseLocationFilterReturn
```

**Integration Requirements**:

1. **Input Validation**: Hook must handle `null` userLocation gracefully
2. **Distance Calculation**: Uses Haversine formula to calculate distances
3. **Filtering Logic**: Returns only vendors within `maxDistance` kilometers
4. **Sorting**: Returns vendors sorted by distance ascending
5. **Distance Data**: Adds `distance` property to each vendor

**No Changes Required**: Hook already implements required functionality

## Database Integration

**No database integration required** for this feature.

**Rationale**: Location search is ephemeral - no need to persist:
- Search queries
- Geocoding results
- User location preferences

**Future Enhancement**: If user location preferences need to be saved, integrate with user profile database.

## External Services Integration

### Service Overview

| Service | Purpose | Protocol | Authentication | Rate Limit |
|---------|---------|----------|----------------|------------|
| Photon API | Geocoding | HTTPS | None (public) | Self-imposed: 10/min |

### Photon API Service Details

**Service Name**: Photon Geocoding API
**Provider**: Komoot (Open Source)
**Documentation**: https://github.com/komoot/photon

**Service Level Agreement** (SLA):
- **Availability**: Best effort (public service)
- **Response Time**: ~500ms average (varies by query)
- **Support**: Community support via GitHub issues

**Reliability Considerations**:
- No guaranteed uptime SLA
- Public service may experience downtime
- Consider self-hosting Photon for production use

### Webhook and Event-Driven Integration

**Not applicable** - Photon API is request-response only, no webhooks or events

### External Service Error Handling

**Error Scenarios and Handling**:

1. **Service Unavailable (503)**:
   - **Detection**: Photon API returns 503 status
   - **Handling**: Display error "Location search temporarily unavailable. Please try again later or use coordinate input."
   - **Fallback**: Show advanced coordinate input option
   - **Logging**: Log error with timestamp for monitoring

2. **Timeout (No Response)**:
   - **Detection**: Fetch timeout after 5 seconds
   - **Handling**: Display error "Location search took too long. Please try again."
   - **Retry**: Automatic retry once with exponential backoff
   - **Logging**: Log timeout events to identify performance issues

3. **Empty Results**:
   - **Detection**: Response contains empty features array
   - **Handling**: Display info message "No locations found for '{query}'. Try a different search term."
   - **User Action**: Allow user to edit search and retry
   - **Logging**: Log search queries with no results (analytics)

4. **Network Error**:
   - **Detection**: Fetch throws network error
   - **Handling**: Display error "Unable to connect. Check your internet connection."
   - **Retry**: Allow manual retry
   - **Logging**: Log network errors

5. **Invalid Response Format**:
   - **Detection**: Response is not valid GeoJSON
   - **Handling**: Display generic error "Location search encountered an error."
   - **Fallback**: Enable coordinate input
   - **Logging**: Log response body for debugging

## Compatibility Requirements

### Backward Compatibility

**Existing Functionality Preserved**:
- ✅ Coordinate input preserved via "Advanced Options" collapsible
- ✅ Distance slider functionality unchanged
- ✅ VendorsClient component API unchanged
- ✅ useLocationFilter hook interface unchanged
- ✅ URL parameter handling preserved

**Breaking Changes**: None

### Forward Compatibility

**Future Enhancements Supported**:
- Autocomplete/suggestions: API already supports streaming results
- Map visualization: Coordinates are available for map integration
- Saved searches: Component state can be serialized to localStorage
- Multiple location filters: State structure supports array of locations

### Version Compatibility Matrix

| Component | Current Version | Required Version | Compatible Versions |
|-----------|----------------|------------------|---------------------|
| Next.js | 14.x | 14.x | 14.x+ |
| React | 18.x | 18.x | 18.x+ |
| TypeScript | 5.x | 5.x | 5.x+ |
| shadcn/ui | Latest | Latest | Any |
| Photon API | N/A | N/A | Public API (no versioning) |

### Browser Compatibility

**Supported Browsers**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

**Required Browser Features**:
- fetch API (widely supported)
- async/await (ES2017)
- Optional chaining (`?.`) - ES2020
- Nullish coalescing (`??`) - ES2020

**Polyfills**: Not required for target browsers

### Mobile Compatibility

**Responsive Design**:
- Input field adapts to mobile viewport
- Dialog/Modal is mobile-friendly (full-screen on small screens)
- Touch targets meet minimum 44x44px size

**Performance**:
- API calls work on slow 3G connections
- Loading indicators prevent perceived lag
- Timeout ensures no infinite waiting

## Integration Testing Requirements

### Integration Test Scenarios

1. **Frontend → Backend API Integration**:
   - Test LocationSearchFilter calls `/api/geocode` with correct parameters
   - Verify error handling when API returns error status codes
   - Confirm loading states display during API call

2. **Backend API → Photon API Integration**:
   - Test API route proxies request to Photon correctly
   - Verify query parameters are URL-encoded properly
   - Confirm Photon response is forwarded to frontend

3. **LocationSearchFilter → VendorsClient Integration**:
   - Test `onSearch` callback is invoked with correct coordinates
   - Verify `onReset` callback clears location filter
   - Confirm result count props are used correctly

4. **VendorsClient → useLocationFilter Integration**:
   - Test coordinates are passed to hook correctly
   - Verify filtered vendor list is rendered
   - Confirm distance badges display on vendor cards

### Mock Data for Integration Tests

**Mock Photon API Response** (in MSW handlers):
```typescript
rest.get('https://photon.komoot.io/api', (req, res, ctx) => {
  const query = req.url.searchParams.get('q');

  if (query === 'Monaco') {
    return res(ctx.json({
      type: 'FeatureCollection',
      features: [mockMonacoFeature]
    }));
  }

  return res(ctx.json({ features: [] }));
});
```

**Mock useLocationFilter Hook** (in component tests):
```typescript
jest.mock('@/hooks/useLocationFilter', () => ({
  useLocationFilter: jest.fn(() => ({
    filteredVendors: mockFilteredVendors,
    vendorsWithCoordinates: mockVendors,
    isFiltering: true
  }))
}));
```

### Integration Test Checklist

- [ ] LocationSearchFilter successfully calls `/api/geocode`
- [ ] API route successfully proxies to Photon API
- [ ] Photon API responses are correctly formatted
- [ ] Coordinates extracted from Photon response match expected values
- [ ] onSearch callback receives correct VendorCoordinates object
- [ ] VendorsClient passes coordinates to useLocationFilter
- [ ] useLocationFilter returns filtered vendors
- [ ] Vendor list UI updates with filtered results
- [ ] Distance badges display on filtered vendors
- [ ] Reset functionality clears all filters and state
- [ ] Error handling works end-to-end
- [ ] Rate limiting prevents excessive API calls
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsive design verified

## Monitoring and Observability

### Integration Metrics

**Key Metrics to Monitor**:
1. **API Success Rate**: % of `/api/geocode` requests that return 200
2. **Photon API Response Time**: P50, P95, P99 latency
3. **Error Rate**: % of requests that return 4xx/5xx
4. **Rate Limit Triggers**: Number of 429 responses per hour
5. **Empty Results Rate**: % of searches returning 0 features

**Alerting Thresholds**:
- Error rate > 5% for 5 minutes
- P95 response time > 3 seconds for 5 minutes
- Photon API availability < 95% for 10 minutes

### Logging Strategy

**API Route Logging**:
```typescript
console.log('[Geocode API] Query:', query, 'Results:', features.length);
console.error('[Geocode API] Error:', error.message, 'Query:', query);
```

**Frontend Error Logging**:
```typescript
console.error('[LocationSearchFilter] API Error:', error);
// Optional: Send to error tracking service (Sentry, etc.)
```

**Log Retention**: 30 days for debugging and analytics

## Dependency Management

### External Dependencies

**No new npm packages required**

**Existing Dependencies Used**:
- `react` (v18+): Component framework
- `next` (v14+): API routes and routing
- `lucide-react`: Icons (MapPin, Search, X, AlertCircle)
- `shadcn/ui`: UI components (Dialog, Button, Input, Collapsible)

### Dependency Updates

**If Photon API Changes**:
1. Update API route to match new Photon endpoint
2. Update TypeScript interfaces if response format changes
3. Test integration thoroughly before deploying

**If shadcn/ui Components Change**:
1. Review component API changes
2. Update component usage if breaking changes
3. Test UI rendering and interactions

### Vendor Lock-In Mitigation

**Photon API Abstraction**:
- All Photon-specific code isolated in `/api/geocode` route
- Frontend only knows about generic coordinate format
- Easy to swap geocoding provider (Mapbox, Google, Nominatim)

**Swapping Providers** (if needed):
1. Update `/api/geocode` to call different geocoding API
2. Transform provider response to match PhotonFeature interface
3. No frontend changes required

## Deprecation and Migration Strategies

### Coordinate Input Deprecation

**Not planned** - coordinate input will remain as "Advanced Options"

**Rationale**:
- Power users may prefer exact coordinates
- Fallback if geocoding service is down
- No cost to maintain (existing code)

### Future Migration to Self-Hosted Photon

**If public Photon API becomes unreliable**:

**Migration Steps**:
1. Deploy Photon server on infrastructure (Docker image available)
2. Update `PHOTON_API_BASE_URL` environment variable
3. Test thoroughly with production-like data
4. Deploy with feature flag (gradual rollout)
5. Monitor metrics to ensure no degradation

**Estimated Effort**: 1-2 days for deployment + testing
