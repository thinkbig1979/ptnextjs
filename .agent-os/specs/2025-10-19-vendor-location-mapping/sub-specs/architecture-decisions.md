# Architecture Decisions

> Spec: Vendor Location Mapping
> Created: 2025-10-19

## Architectural Decision Records

### ADR-001: Use Leaflet.js + OpenFreeMap Instead of Mapbox GL JS

**Context and Problem Statement**:
We need to display interactive maps on vendor pages. Options include Google Maps, Mapbox GL JS with commercial tiles, or Leaflet.js with free OpenFreeMap tiles.

**Decision Options Considered**:
1. **Google Maps Platform** - Comprehensive, $200 credit, then $7/1000 loads
2. **Mapbox GL JS + Mapbox tiles** - Beautiful WebGL rendering, 50k loads/month free
3. **Mapbox GL JS + OpenFreeMap** - Free tiles, modern renderer, 500KB bundle
4. **Leaflet.js + OpenFreeMap** - Lightweight (150KB), simple API, free tiles

**Chosen Solution**: Leaflet.js + OpenFreeMap tiles

**Rationale**:
- **Bundle Size**: 70% smaller (150KB vs 500KB for Mapbox GL JS)
- **Simplicity**: Easier API, faster implementation for basic use case
- **Perfect Fit**: We only need simple marker display, not 3D/vector features
- **Cost**: Zero cost for tiles (OpenFreeMap) and library (open source)
- **Mobile Optimized**: Excellent touch gesture support
- **No API Keys**: No signup, billing, or key management
- **Mature**: Battle-tested library with extensive documentation

**Consequences**:
- ✅ 70% smaller JavaScript bundle (better performance)
- ✅ Simpler code, easier to maintain
- ✅ No recurring costs
- ✅ No API key complexity
- ✅ Perfect for our basic marker display needs
- ⚠️ No 3D terrain features (not needed for our use case)
- ⚠️ Canvas-based vs WebGL (but faster for simple markers)

**Trade-offs**:
- Accepting 2D-only maps for 70% bundle size reduction
- Our use case doesn't need WebGL or 3D features
- Can upgrade to Mapbox GL JS later if advanced features needed

---

### ADR-002: Use geocode.maps.co for Geocoding Instead of Commercial Services

**Context and Problem Statement**:
Users need to search for vendors by entering a location (city, address). We need a geocoding service to convert addresses to coordinates.

**Decision Options Considered**:
1. **Google Geocoding API** - Accurate, requires API key, paid after free tier
2. **Mapbox Geocoding API** - Good accuracy, requires API key, paid after free tier
3. **Nominatim (OpenStreetMap)** - Free, no API key, strict 1 req/sec rate limit
4. **geocode.maps.co** - Free (1M/month), no API key, Nominatim-compatible

**Chosen Solution**: geocode.maps.co

**Rationale**:
- **Cost**: Completely free (1 million requests/month)
- **Simplicity**: No API key required, simpler than Nominatim (no User-Agent header)
- **Data Quality**: Uses OpenStreetMap data (same as Nominatim)
- **Rate Limit**: 1M requests/month, no per-second throttling needed
- **Privacy**: No user tracking or analytics
- **Compatibility**: Same response format as Nominatim

**Consequences**:
- ✅ Zero cost (1M requests/month sufficient for our use case)
- ✅ No API key management
- ✅ Good geocoding accuracy for cities and addresses
- ✅ More generous than Nominatim (no 1 req/sec limit)
- ✅ Simpler integration (no User-Agent header required)
- ⚠️ No official SLA (free tier service)

**Trade-offs**:
- Accepting best-effort SLA for zero cost and simplicity
- 1M/month is very generous for expected usage
- Can upgrade to commercial geocoding if needed (unlikely)

**Advantages over Nominatim**:
- No User-Agent header requirement (simpler code)
- No strict per-second rate limit (better UX, less throttling complexity)
- Same data quality (OpenStreetMap)

---

### ADR-003: Store Location Data in Payload CMS Instead of External Geocoding Service

**Context and Problem Statement**:
Vendor location data needs to be stored somewhere. Options include storing only addresses and geocoding on-demand, or storing pre-geocoded latitude/longitude in the database.

**Decision Options Considered**:
1. **Store addresses only, geocode on-demand** - Flexible, always up-to-date, requires API calls
2. **Store lat/lng in database** - Fast, no runtime API calls, requires manual data entry
3. **Store addresses + auto-geocode during save** - Best of both, adds complexity

**Chosen Solution**: Store latitude, longitude, and address in Payload CMS database

**Rationale**:
- **Performance**: No geocoding API calls at runtime (static site)
- **Reliability**: Not dependent on external service uptime for displaying maps
- **Simplicity**: Admin manually enters accurate coordinates, no auto-geocoding logic needed
- **Build Time**: Static generation can use location data directly
- **Cost**: Zero runtime API calls

**Consequences**:
- ✅ Fast page loads (no geocoding delay)
- ✅ Works offline/without external dependencies
- ✅ Simple implementation (no caching or auto-geocoding logic)
- ⚠️ Manual data entry required (admin must input coordinates)
- ⚠️ Coordinates could become outdated if address changes

**Trade-offs**:
- Accepting manual data entry burden for performance and simplicity
- Can add auto-geocoding helper in admin UI later if needed

---

### ADR-004: Use Client-Side Distance Filtering Instead of Database Queries

**Context and Problem Statement**:
When users search by location, we need to filter vendors within a radius and sort by distance. Options include database queries with spatial functions or client-side calculations.

**Decision Options Considered**:
1. **SQLite spatial extension (SpatiaLite)** - Fast database queries, requires extension setup
2. **PostgreSQL with PostGIS** - Powerful geospatial features, overkill for simple distance filtering
3. **Client-side Haversine formula** - Simple JavaScript calculation, works with static data

**Chosen Solution**: Client-side Haversine formula in JavaScript

**Rationale**:
- **Simplicity**: No database extensions or complex queries required
- **Static Site Compatibility**: Works with Next.js static generation
- **Performance**: Fast enough for < 500 vendors (typical use case)
- **Portability**: No database-specific features, works with any data source
- **SQLite Simplicity**: Keep SQLite simple without extensions

**Consequences**:
- ✅ No database extensions required
- ✅ Works with static JSON data from build
- ✅ Simple, testable JavaScript function
- ✅ No server-side processing needed
- ⚠️ Less efficient for very large datasets (1000+ vendors)
- ⚠️ Client-side processing (uses user's CPU)

**Trade-offs**:
- Accepting client-side computation for simplicity and static site compatibility
- Scales well for expected vendor count (< 500)
- Can migrate to database queries if vendor count grows significantly (1000+)

---

### ADR-005: Use Fixed Radius Options Instead of Custom Slider

**Context and Problem Statement**:
Users need to specify a search radius. Options include fixed options (10, 25, 50, 100 miles), custom slider, or smart auto-expansion.

**Decision Options Considered**:
1. **Fixed dropdown options** - Simple, predictable, easy to implement
2. **Custom slider** - Flexible, better UX, requires more UI code
3. **Auto-expanding radius** - Smart, no user input, complex logic

**Chosen Solution**: Fixed dropdown options (10, 25, 50, 100 miles)

**Rationale**:
- **Simplicity**: Dropdown is simple to implement and use
- **Predictability**: Users know exactly what radius they're searching
- **Common Use Cases**: Fixed options cover typical search scenarios
- **Mobile-Friendly**: Dropdown works better than slider on mobile
- **Minimal Scope**: Keeping initial implementation simple

**Consequences**:
- ✅ Simple UI component (shadcn/ui Select)
- ✅ Clear, predictable results
- ✅ Works well on mobile and desktop
- ✅ Easy to test (only 4 options)
- ⚠️ Less flexibility than custom slider
- ⚠️ May not perfectly match user's desired radius

**Trade-offs**:
- Accepting limited flexibility for simplicity and mobile compatibility
- Can add slider or custom input in future enhancement if user feedback requests it

---

## Technical Constraints

### Performance Constraints

**Map Rendering**:
- Target: < 2 seconds to interactive map
- Constraint: Mapbox GL JS bundle is ~500KB (acceptable)
- Mitigation: Lazy load map component, tree-shake unused features

**Distance Calculation**:
- Target: < 500ms to filter and sort all vendors
- Constraint: O(n) complexity for Haversine formula
- Mitigation: Efficient for < 500 vendors, memoize results if needed

### Scalability Constraints

**Vendor Count**:
- Expected: < 500 vendors in first year
- Client-side filtering: Efficient up to ~1000 vendors
- Future scaling: Migrate to database spatial queries if needed

**Geocoding Rate Limit**:
- Nominatim: 1 request/second
- Mitigation: Debounce user input by 1000ms
- Future scaling: Implement caching or switch to commercial API

### Security Constraints

**Input Validation**:
- Latitude: -90 to 90 (enforced in Payload admin)
- Longitude: -180 to 180 (enforced in Payload admin)
- Address: Sanitize to prevent XSS injection

**External API Dependencies**:
- Nominatim: HTTPS only, no sensitive data transmitted
- OpenFreeMap: HTTPS only, public tiles

### Resource Constraints

**Bundle Size**:
- Mapbox GL JS: ~500KB (unavoidable for map functionality)
- Geocoding: < 10KB (simple fetch wrapper)
- Utilities: < 5KB (Haversine formula)
- Total increase: ~520KB (acceptable for feature value)

**Development Time**:
- Target: 8-10 hours total implementation
- Constraint: Keep implementation simple to fit in 1-2 day sprint
- Mitigation: Use existing UI components, avoid custom solutions

---

## Design Principles

### Fundamental Design Principles

**1. Simplicity First**:
- Avoid over-engineering for initial implementation
- Use simple solutions that work (client-side filtering vs. complex database queries)
- Minimal dependencies (only mapbox-gl required)

**2. Graceful Degradation**:
- Feature works with or without location data
- Maps fail gracefully to address text fallback
- Geocoding errors show user-friendly messages

**3. Static-First Architecture**:
- No server-side processing at runtime
- All vendor data fetched at build time
- Client-side only for search and filtering

**4. Mobile-First Design**:
- Responsive maps (300px on mobile, 600px on desktop)
- Touch-friendly map controls
- Dropdown instead of slider for better mobile UX

**5. Privacy and Open Source**:
- Use open-source services (OpenFreeMap, Nominatim)
- No user tracking or analytics from map services
- No API keys or user data sent to third parties

### Architectural Patterns and Styles

**Component Composition**:
- Small, focused components (VendorLocationMap, LocationSearchFilter)
- Reusable hooks (useLocationFilter)
- Pure functions for calculations (calculateDistance)

**Data Flow Pattern**:
```
Static Data → Component Props → Local State → Derived State → UI
```

**Error Handling Pattern**:
```
Try → Catch → User-Friendly Error Message → Allow Retry
```

### Coding Standards and Conventions

**TypeScript**:
- Strict mode enabled
- All interfaces explicitly defined
- No `any` types allowed

**Component Structure**:
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Component definition
// 4. Hooks
// 5. Event handlers
// 6. Render logic
// 7. Export
```

**Naming Conventions**:
- Components: PascalCase
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: Match component name

---

## Technology Choices

### Framework and Library Selections

**Map Rendering**: Leaflet.js v1.9+
- **Reason**: 70% smaller bundle than Mapbox GL JS, perfect for basic marker display, simpler API
- **Alternatives Considered**: Mapbox GL JS (overkill, 500KB), Google Maps (expensive, complex)

**Geocoding**: geocode.maps.co API
- **Reason**: Free (1M/month), no API key, simpler than Nominatim, generous rate limits
- **Alternatives Considered**: Nominatim (strict rate limits), Mapbox Geocoding (requires key), Google (requires key)

**UI Components**: shadcn/ui (existing)
- **Reason**: Already in use, consistent design system
- **Components Used**: Input, Select, Button, Card

### Database and Storage Technology

**Database**: SQLite (existing Payload CMS setup)
- **Reason**: Simple, file-based, no additional setup required
- **Extension**: None (no SpatiaLite, keep it simple)
- **Schema**: Add location group to vendors collection

**Location Data Storage**:
```typescript
{
  location: {
    address: string       // Human-readable address
    latitude: number      // Decimal degrees
    longitude: number     // Decimal degrees
  }
}
```

### Infrastructure and Deployment

**Deployment**: Next.js static export (existing)
- **Reason**: Already in use, simple, works with any host
- **CDN**: Vercel or Netlify for global distribution
- **Build**: Static HTML/CSS/JS, no server required

**External Services**:
- **OpenFreeMap**: `https://tiles.openfreemap.org` (free tier, no signup)
- **Nominatim**: `https://nominatim.openstreetmap.org` (free, no signup)

**Monitoring**: None initially (can add later if needed)

---

## Decision Impact Summary

| Decision | Impact on Simplicity | Impact on Performance | Impact on Cost |
|----------|---------------------|----------------------|----------------|
| Leaflet.js + OpenFreeMap | ✅ Very high (simple API, no setup) | ✅ 150KB bundle, fast tiles | ✅ $0 |
| geocode.maps.co | ✅ Very high (no API key, no User-Agent) | ✅ 1M/month, no throttling | ✅ $0 |
| Store lat/lng in DB | ✅ Very high | ✅ No runtime API calls | ✅ $0 |
| Client-side filtering | ✅ Very high | ✅ Fast for < 500 vendors | ✅ $0 |
| Fixed radius options | ✅ Very high | N/A | ✅ $0 |

**Overall Architecture**: Optimized for simplicity, zero cost, lightweight bundle, and static site compatibility

**Key Improvements Over Initial Design**:
- 70% smaller map library (Leaflet vs Mapbox GL JS)
- Simpler geocoding (geocode.maps.co vs Nominatim with User-Agent)
- Better rate limits (1M/month vs 1 req/sec)
