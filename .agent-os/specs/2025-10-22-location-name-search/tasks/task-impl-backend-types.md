# Task: impl-backend-types - Add Geocoding Types to lib/types.ts

**Metadata:**
- **Task ID:** impl-backend-types
- **Phase:** Phase 2: Backend Implementation
- **Agent:** backend-nodejs-specialist
- **Estimated Time:** 10-15 min
- **Dependencies:** impl-backend-geocode
- **Status:** Pending
- **Priority:** High

## Description

Add TypeScript type definitions for Photon API integration, geocoding requests, and responses to the central types file.

## Specifics

**Types to Add:**

1. **PhotonFeature** - Photon API GeoJSON feature structure
   - geometry: { coordinates: [number, number]; type: 'Point' }
   - properties: { name, country, state, city, postcode, type, osm_id, osm_type }

2. **PhotonResponse** - Photon API response structure
   - type: 'FeatureCollection'
   - features: PhotonFeature[]

3. **GeocodeQueryParams** - Query parameters for /api/geocode
   - q: string (required)
   - limit?: number (optional, default 5)
   - lang?: string (optional, default 'en')

4. **GeocodeResult** - Simplified geocoding result
   - coordinates: { lat: number; lon: number }
   - display_name: string
   - type: string
   - country?: string
   - region?: string

5. **GeocodeSuccessResponse** - Successful API response
   - success: true
   - results: GeocodeResult[]

6. **GeocodeErrorResponse** - Error API response
   - success: false
   - error: string
   - code: 'RATE_LIMIT' | 'INVALID_QUERY' | 'SERVICE_ERROR' | 'NOT_FOUND'
   - retryAfter?: number

7. **GeocodeResponse** - Union type for API responses
   - GeocodeSuccessResponse | GeocodeErrorResponse

**Files to Modify:**
- `/home/edwin/development/ptnextjs/lib/types.ts`

## Acceptance Criteria

- [ ] All Photon API types defined accurately
- [ ] Geocoding request/response types defined
- [ ] Types match API contract from api-spec.md
- [ ] Types are exported for use in other files
- [ ] JSDoc comments added for all types
- [ ] TypeScript compilation succeeds
- [ ] No conflicts with existing types
- [ ] Types support strict TypeScript mode

## Testing Requirements

**Functional Testing:**
- TypeScript compilation test: `npm run type-check`
- Import test: Verify types can be imported in other files
- Type inference test: Verify correct type inference

**Manual Verification:**
- Review type definitions for accuracy
- Verify types match Photon API documentation
- Confirm no breaking changes to existing types

**Evidence Required:**
- TypeScript compilation success output
- Example usage of new types in code
- JSDoc documentation for all types

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-impl-backend-geocode.md
- Photon API documentation: https://photon.komoot.io/

**Assumptions:**
- lib/types.ts exists and follows project conventions
- TypeScript strict mode is enabled
- Existing location types (VendorCoordinates, VendorLocation) should remain unchanged

## Implementation Notes

**Type Definitions Template:**

```typescript
/**
 * Photon API GeoJSON feature representing a geocoded location
 * @see https://photon.komoot.io/
 */
export interface PhotonFeature {
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
    type: 'Point';
  };
  type: 'Feature';
  properties: {
    name?: string;
    country?: string;
    state?: string;
    city?: string;
    postcode?: string;
    type?: string;
    osm_id?: number;
    osm_type?: string;
    osm_key?: string;
    osm_value?: string;
  };
}

/**
 * Photon API response structure (GeoJSON FeatureCollection)
 */
export interface PhotonResponse {
  type: 'FeatureCollection';
  features: PhotonFeature[];
}

/**
 * Query parameters for the /api/geocode endpoint
 */
export interface GeocodeQueryParams {
  /** Location search query */
  q: string;
  /** Maximum number of results to return (default: 5) */
  limit?: number;
  /** Language code for results (default: 'en') */
  lang?: string;
}

/**
 * Simplified geocoding result returned by /api/geocode
 */
export interface GeocodeResult {
  coordinates: {
    lat: number;
    lon: number;
  };
  display_name: string;
  type: string;
  country?: string;
  region?: string;
}

/**
 * Successful response from /api/geocode endpoint
 */
export interface GeocodeSuccessResponse {
  success: true;
  results: GeocodeResult[];
}

/**
 * Error response from /api/geocode endpoint
 */
export interface GeocodeErrorResponse {
  success: false;
  error: string;
  code: 'RATE_LIMIT' | 'INVALID_QUERY' | 'SERVICE_ERROR' | 'NOT_FOUND';
  retryAfter?: number;
}

/**
 * Union type for all possible /api/geocode responses
 */
export type GeocodeResponse = GeocodeSuccessResponse | GeocodeErrorResponse;
```

**Integration with Existing Types:**
- These types should be added to the location-related section of lib/types.ts
- Ensure compatibility with existing VendorCoordinates and VendorLocation types
- GeocodeResult.coordinates should be compatible with VendorCoordinates

**Placement in lib/types.ts:**
Add after existing location types (VendorCoordinates, VendorLocation) under a new section:
```typescript
// ============================================================
// Geocoding Types (Photon API Integration)
// ============================================================
```

## Quality Gates

- [ ] All types accurately represent Photon API structure
- [ ] JSDoc comments are comprehensive
- [ ] Types follow project naming conventions
- [ ] No TypeScript compilation errors
- [ ] Types are properly exported
- [ ] Types support type inference
- [ ] Code review approved

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md

**Implementation Files:**
- /home/edwin/development/ptnextjs/lib/types.ts (MODIFY)
- /home/edwin/development/ptnextjs/app/api/geocode/route.ts (uses these types)

**Related Tasks:**
- task-impl-backend-geocode (prerequisite)
- task-test-backend-integration (uses these types)
- task-impl-frontend-location-result-selector (uses these types)
