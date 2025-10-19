# Task: api-vendor-geography-service - Implement Vendor Geography Service (SQLite)

## Task Metadata
- **Task ID**: api-vendor-geography-service
- **Phase**: Phase 3A: Backend API Development
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 45-60 minutes
- **Dependencies**: [db-vendor-geographic-fields]
- **Status**: [ ] Not Started

## Task Description
Create VendorGeographyService for managing vendor service regions and location-based queries. Implement application-layer filtering (since SQLite doesn't support GIN indexes on JSON), proximity search using haversine formula, and geocoding integration with OpenStreetMap Nominatim API.

## Specifics
- **File to Create**:
  - `/home/edwin/development/ptnextjs/lib/services/vendor-geography-service.ts`
- **Service Methods**:
  ```typescript
  export class VendorGeographyService {
    // Filter vendors by country/state/city
    async getVendorsByRegion(region: GeographicRegion): Promise<Vendor[]>
    
    // Find vendors within radius of lat/lon
    async getVendorsByProximity(lat: number, lon: number, radiusKm: number): Promise<VendorWithDistance[]>
    
    // Update vendor's service regions
    async updateServiceRegions(vendorId: string, regions: ServiceRegions): Promise<void>
    
    // Geocode address to lat/lon
    async geocodeLocation(address: string): Promise<Coordinate>
  }
  
  interface GeographicRegion {
    country?: string
    state?: string
    city?: string
  }
  
  interface ServiceRegions {
    countries: string[]
    states: ServiceState[]
    cities: ServiceCity[]
    coordinates: Coordinate[]
    coverageNotes?: string
  }
  
  interface VendorWithDistance extends Vendor {
    distance_km: number
  }
  ```
- **Haversine Formula Implementation**:
  ```typescript
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
  ```
- **OpenStreetMap Nominatim Integration**:
  - API: `https://nominatim.openstreetmap.org/search?format=json&q={address}`
  - Rate limit: Max 1 request/second
  - Cache results for 5 minutes to reduce API calls
  - User-Agent header required: `'YourAppName/1.0 (contact@example.com)'`

## Acceptance Criteria
- [ ] VendorGeographyService class created with all methods
- [ ] getVendorsByRegion filters by country, state, or city using JSON parsing
- [ ] getVendorsByProximity calculates distances using haversine formula
- [ ] updateServiceRegions serializes data to JSON and updates database
- [ ] geocodeLocation calls OpenStreetMap Nominatim API with caching
- [ ] Coordinate validation ensures lat (-90 to 90), lon (-180 to 180)
- [ ] Error handling for malformed JSON in database
- [ ] Geocoding results cached for 5 minutes
- [ ] Rate limiting for Nominatim API (max 1 req/sec)
- [ ] All methods handle empty results gracefully

## Testing Requirements
- **Unit Tests**:
  - Test calculateDistance with known coordinates (San Diego to LA = ~120km)
  - Test getVendorsByRegion with country='US' returns only US vendors
  - Test getVendorsByRegion with state='CA' returns only California vendors
  - Test getVendorsByProximity sorts results by distance ascending
  - Test coordinate validation rejects invalid lat/lon
  - Test JSON parsing handles null, empty, malformed data
  - Mock OpenStreetMap API responses for geocoding tests
- **Integration Tests**:
  - Create test vendors with various geographic data
  - Query by country and verify correct vendors returned
  - Query by proximity with 50km radius and verify distance calculations
  - Test updateServiceRegions persists to database correctly
  - Test geocodeLocation with real address (use VCR/nock for caching)
  - Verify cache prevents duplicate API calls within 5 minutes
- **Performance Tests**:
  - Benchmark getVendorsByRegion with 100, 500, 1000 vendors
  - Document query times (expect 100-500ms for 1000 vendors with SQLite)
  - Verify proximity search scales linearly with vendor count

## Evidence Required
- Service file with complete implementation
- Unit test results (>90% coverage)
- Integration test results showing all methods work
- Performance benchmark showing query times for various dataset sizes
- Example geocoded result from OpenStreetMap API

## Context Requirements
- Geographic helpers from task-db-vendor-geographic-fields
- Payload CMS local API for database queries
- tasks-sqlite.md section 2.1 for implementation patterns
- OpenStreetMap Nominatim API documentation

## Implementation Notes
- **SQLite Performance Considerations**:
  - No GIN indexes on JSON → Must fetch all vendors and filter in JavaScript
  - For <1000 vendors: acceptable performance (200-500ms)
  - For >1000 vendors: Consider PostgreSQL migration
  - Pre-filter by country first to reduce dataset before state/city checks
- **Caching Strategy**:
  ```typescript
  const geocodeCache = new Map<string, { coord: Coordinate, expires: number }>()
  
  async geocodeLocation(address: string): Promise<Coordinate> {
    const cached = geocodeCache.get(address)
    if (cached && cached.expires > Date.now()) {
      return cached.coord
    }
    
    const result = await fetchFromNominatim(address)
    geocodeCache.set(address, { coord: result, expires: Date.now() + 300000 }) // 5 min
    return result
  }
  ```
- **Error Handling**:
  - Geocoding API failures: Return fallback coordinate or throw descriptive error
  - JSON parse errors: Log error, return empty array instead of crashing
  - Invalid coordinates: Throw validation error with field details
- **Optimization Tips**:
  - Cache parsed JSON per request to avoid re-parsing same vendor data
  - Use Promise.all for parallel geocoding if batch operations needed
  - Add TODO comments for PostgreSQL migration with GIN indexes

## Quality Gates
- [ ] Haversine distance calculation accurate within ±1%
- [ ] No unhandled JSON parse errors
- [ ] Geocoding respects rate limits (no 429 errors)
- [ ] Cache reduces Nominatim API calls by >80%
- [ ] Performance acceptable for datasets up to 1000 vendors

## Related Files
- Main Tasks: `tasks-sqlite.md` section 2.1
- Geographic Helpers: `/home/edwin/development/ptnextjs/lib/utils/geographic-helpers.ts`
- Technical Spec: `sub-specs/technical-spec.md` (VendorGeographyService)
- Database Schema: vendors table with geographic fields

## Next Steps After Completion
- Create API endpoints using this service (task-api-vendor-geography-endpoints)
- Build frontend location filter component (task-ui-vendor-location-filter)
- Integrate with vendor detail pages to show service areas (task-ui-vendor-service-map)
