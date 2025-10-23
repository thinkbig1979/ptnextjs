# Task: integ-api-contract - Validate API Contract

**Metadata:**
- **Task ID:** integ-api-contract
- **Phase:** Phase 4: Frontend-Backend Integration
- **Agent:** integration-coordinator
- **Estimated Time:** 10-15 min
- **Dependencies:** test-backend-integration, test-frontend-integration
- **Status:** Pending
- **Priority:** High

## Description

Validate that the API contract between the frontend and backend is correctly implemented, ensuring request/response format compatibility, error handling consistency, and type safety.

## Specifics

**Validation Areas:**

1. **Request Format Validation:**
   - Frontend sends correct query parameters (q, limit, lang)
   - Parameter encoding is correct (URL encoding)
   - Optional parameters handled correctly
   - Request headers appropriate

2. **Response Format Validation:**
   - Backend response matches GeocodeResponse type
   - Success response structure correct
   - Error response structure correct
   - Field types match TypeScript definitions

3. **Type Safety Validation:**
   - Frontend types match backend types
   - GeocodeResult structure consistent
   - PhotonFeature transformation correct
   - No type casting required

4. **Error Code Validation:**
   - All error codes documented and handled
   - Error messages user-friendly
   - HTTP status codes appropriate
   - Retry-After header present when needed

5. **Edge Case Validation:**
   - Empty results handled consistently
   - Single result vs multiple results
   - Very long location names
   - Special characters in queries
   - International characters (UTF-8)

**Files to Review:**
- `/home/edwin/development/ptnextjs/app/api/geocode/route.ts` (Backend)
- `/home/edwin/development/ptnextjs/components/LocationSearchFilter.tsx` (Frontend)
- `/home/edwin/development/ptnextjs/lib/types.ts` (Shared types)

**Validation Method:**
- Contract testing with documented examples
- Type compatibility verification
- Error scenario testing
- Cross-reference API spec document

## Acceptance Criteria

- [ ] Request format matches API spec exactly
- [ ] Response format matches GeocodeResponse type
- [ ] All error codes from backend handled by frontend
- [ ] Type safety verified (no `any` types)
- [ ] Edge cases validated
- [ ] Documentation accurate and complete
- [ ] No breaking changes identified
- [ ] Contract test suite passes (100%)

## Testing Requirements

**Functional Testing:**
- Create contract tests validating request/response format
- Run against both backend implementation and frontend consumption
- Verify type compatibility

**Manual Verification:**
- Review API spec document
- Compare backend implementation to spec
- Compare frontend implementation to spec
- Verify all error codes documented

**Contract Test Examples:**

```typescript
describe('API Contract Validation', () => {
  describe('Request format', () => {
    it('should send correct query parameters', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      await searchLocation('Monaco');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/geocode'),
        expect.any(Object)
      );

      const callUrl = new URL(mockFetch.mock.calls[0][0]);
      expect(callUrl.searchParams.get('q')).toBe('Monaco');
      expect(callUrl.searchParams.get('limit')).toBe('5');
    });

    it('should URL encode special characters', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch;

      await searchLocation('São Paulo');

      const callUrl = new URL(mockFetch.mock.calls[0][0]);
      expect(callUrl.searchParams.get('q')).toBe('São Paulo');
      expect(mockFetch.mock.calls[0][0]).toContain('S%C3%A3o');
    });
  });

  describe('Response format', () => {
    it('should handle success response correctly', async () => {
      const mockResponse: GeocodeSuccessResponse = {
        success: true,
        results: [{
          coordinates: { lat: 43.7384, lon: 7.4246 },
          display_name: 'Monaco, Monaco',
          type: 'city',
          country: 'Monaco'
        }]
      };

      // Verify response matches type
      const validated: GeocodeResponse = mockResponse;
      expect(validated.success).toBe(true);
      if (validated.success) {
        expect(validated.results).toHaveLength(1);
        expect(validated.results[0].coordinates.lat).toBe(43.7384);
      }
    });

    it('should handle error response correctly', async () => {
      const mockResponse: GeocodeErrorResponse = {
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT',
        retryAfter: 45
      };

      // Verify response matches type
      const validated: GeocodeResponse = mockResponse;
      expect(validated.success).toBe(false);
      if (!validated.success) {
        expect(validated.code).toBe('RATE_LIMIT');
        expect(validated.retryAfter).toBe(45);
      }
    });
  });

  describe('Error code handling', () => {
    it('should map all backend error codes to frontend messages', () => {
      const backendCodes = ['RATE_LIMIT', 'INVALID_QUERY', 'SERVICE_ERROR', 'NOT_FOUND'];
      const frontendCodes = Object.keys(ERROR_MESSAGES);

      backendCodes.forEach(code => {
        expect(frontendCodes).toContain(code);
      });
    });
  });

  describe('Type compatibility', () => {
    it('should have matching coordinate types', () => {
      const backendCoords = { lat: 43.7384, lon: 7.4246 };
      const frontendCoords: VendorCoordinates = backendCoords;

      expect(frontendCoords.lat).toBe(43.7384);
      expect(frontendCoords.lon).toBe(7.4246);
    });

    it('should transform PhotonFeature to GeocodeResult correctly', () => {
      const photonFeature: PhotonFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [7.4246, 43.7384] // [lon, lat] in GeoJSON
        },
        properties: {
          name: 'Monaco',
          country: 'Monaco',
          type: 'city'
        }
      };

      // Transformation logic
      const result: GeocodeResult = {
        coordinates: {
          lat: photonFeature.geometry.coordinates[1],
          lon: photonFeature.geometry.coordinates[0]
        },
        display_name: `${photonFeature.properties.name}, ${photonFeature.properties.country}`,
        type: photonFeature.properties.type || 'unknown',
        country: photonFeature.properties.country
      };

      expect(result.coordinates.lat).toBe(43.7384);
      expect(result.coordinates.lon).toBe(7.4246);
    });
  });
});
```

**Evidence Required:**
- Contract test suite passing
- Type compatibility verification report
- API spec vs implementation comparison document
- Error code mapping validation

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-test-backend-integration.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-test-frontend-integration.md
- Backend implementation
- Frontend implementation
- Shared type definitions

**Assumptions:**
- Both backend and frontend are implemented
- Types are defined in lib/types.ts
- API spec document is accurate
- TypeScript strict mode enabled

## Implementation Notes

**Contract Validation Checklist:**

```markdown
## Request Contract
- [ ] Query parameter 'q' is required
- [ ] Query parameter 'limit' is optional (default: 5)
- [ ] Query parameter 'lang' is optional (default: 'en')
- [ ] URL encoding applied to query string
- [ ] HTTP method is GET
- [ ] No request body required

## Success Response Contract
- [ ] success: true
- [ ] results: GeocodeResult[]
- [ ] results[].coordinates: { lat: number, lon: number }
- [ ] results[].display_name: string
- [ ] results[].type: string
- [ ] results[].country: string | undefined
- [ ] results[].region: string | undefined

## Error Response Contract
- [ ] success: false
- [ ] error: string (human-readable message)
- [ ] code: 'RATE_LIMIT' | 'INVALID_QUERY' | 'SERVICE_ERROR' | 'NOT_FOUND'
- [ ] retryAfter: number | undefined (only for RATE_LIMIT)

## HTTP Status Codes
- [ ] 200: Success with results
- [ ] 400: Bad request (INVALID_QUERY)
- [ ] 429: Rate limit exceeded (RATE_LIMIT)
- [ ] 500: Internal server error (SERVICE_ERROR)
- [ ] 503: Service unavailable (SERVICE_ERROR)

## Type Compatibility
- [ ] PhotonFeature → GeocodeResult transformation correct
- [ ] Coordinate order handled (GeoJSON is [lon, lat], app uses {lat, lon})
- [ ] All optional fields properly typed
- [ ] No `any` types used
```

**Common Contract Issues to Check:**

1. **Coordinate Order Mismatch:**
   - GeoJSON uses [longitude, latitude]
   - App uses { lat: number, lon: number }
   - Verify transformation is correct

2. **Optional Field Handling:**
   - region might be undefined
   - country might be undefined for some results
   - type might be missing

3. **Character Encoding:**
   - UTF-8 support for international characters
   - URL encoding for special characters
   - Proper handling of spaces and punctuation

4. **Error Code Consistency:**
   - All backend error codes have frontend handlers
   - Error messages are user-friendly
   - Retry logic for rate limiting

## Quality Gates

- [ ] All contract tests pass
- [ ] Type compatibility verified
- [ ] No type casting required
- [ ] All error codes handled
- [ ] API spec matches implementation
- [ ] Documentation accurate
- [ ] No breaking changes introduced

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md

**Implementation Files:**
- /home/edwin/development/ptnextjs/app/api/geocode/route.ts
- /home/edwin/development/ptnextjs/components/LocationSearchFilter.tsx
- /home/edwin/development/ptnextjs/lib/types.ts

**Related Tasks:**
- task-test-backend-integration (prerequisite)
- task-test-frontend-integration (prerequisite)
- task-integ-frontend-backend (depends on this validation)
