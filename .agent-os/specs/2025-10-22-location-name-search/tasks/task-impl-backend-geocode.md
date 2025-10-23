# Task: impl-backend-geocode - Implement Photon API Proxy Endpoint

**Metadata:**
- **Task ID:** impl-backend-geocode
- **Phase:** Phase 2: Backend Implementation
- **Agent:** backend-nodejs-specialist
- **Estimated Time:** 30-35 min
- **Dependencies:** test-backend-api
- **Status:** Pending
- **Priority:** Critical

## Description

Implement the /api/geocode endpoint as a proxy to the Photon geocoding API with rate limiting, error handling, and response transformation.

## Specifics

**Implementation Requirements:**

1. **Endpoint Configuration:**
   - Path: `/api/geocode`
   - Method: GET
   - Query Parameters:
     - `q` (required): Location search query
     - `limit` (optional, default: 5): Number of results to return
     - `lang` (optional, default: 'en'): Language for results

2. **Photon API Integration:**
   - Base URL: `https://photon.komoot.io/api`
   - Forward query parameters to Photon API
   - Set timeout: 5 seconds
   - Handle network errors gracefully

3. **Rate Limiting:**
   - Limit: 10 requests per minute per IP address
   - Use in-memory rate limiter (Map-based)
   - Return 429 status when limit exceeded
   - Include `Retry-After` header with seconds until reset
   - Clean up expired entries periodically

4. **Response Transformation:**
   - Transform Photon API GeoJSON response to simplified format
   - Extract relevant fields from PhotonFeature:
     - coordinates: [lon, lat]
     - display_name: Formatted location name
     - type: Feature type (city, town, village, etc.)
     - country: Country name
     - region: State/region name
   - Return standardized response format

5. **Error Handling:**
   - 400: Missing or invalid query parameter
   - 429: Rate limit exceeded
   - 500: Internal server error (transformation failure)
   - 503: Photon API unavailable or timeout

**Files to Create:**
- `/home/edwin/development/ptnextjs/app/api/geocode/route.ts` (NEW)

**Files to Modify:**
- None

## Acceptance Criteria

- [ ] GET endpoint implemented at /api/geocode
- [ ] Query parameter validation implemented
- [ ] Photon API proxy working correctly
- [ ] Rate limiting enforces 10 req/min per IP
- [ ] Response transformation returns correct format
- [ ] All error scenarios handled with appropriate status codes
- [ ] Timeout handling implemented (5 second limit)
- [ ] Rate limiter memory cleanup implemented
- [ ] All tests from test-backend-api pass
- [ ] TypeScript compilation succeeds with no errors

## Testing Requirements

**Functional Testing:**
- Run unit tests from task-test-backend-api
- All tests must pass (>= 95% pass rate)
- No TypeScript compilation errors
- No ESLint errors

**Manual Verification:**
- Test endpoint with curl or Postman:
  ```bash
  # Successful search
  curl "http://localhost:3000/api/geocode?q=Monaco&limit=5"

  # Rate limit test (make 11 requests quickly)
  for i in {1..11}; do curl "http://localhost:3000/api/geocode?q=test"; done

  # Invalid query
  curl "http://localhost:3000/api/geocode"
  ```

**Browser Testing:**
- Not required (API endpoint)

**Error Scenarios:**
- Missing query parameter returns 400
- Rate limit exceeded returns 429 with Retry-After header
- Photon API timeout returns 503
- Invalid Photon response returns 500

**Evidence Required:**
- All unit tests passing
- Manual curl test results showing:
  - Successful geocoding response
  - Rate limiting working (429 after 10 requests)
  - Error handling for invalid requests
- TypeScript compilation success
- ESLint validation success

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-test-backend-api.md
- Test suite from test-backend-api

**Assumptions:**
- Next.js 14 App Router is configured
- Project supports TypeScript
- fetch API is available (Node.js 18+)

## Implementation Notes

**Rate Limiter Implementation:**
```typescript
// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return { allowed: true };
  }

  if (limit.count < 10) {
    limit.count++;
    return { allowed: true };
  }

  return {
    allowed: false,
    retryAfter: Math.ceil((limit.resetTime - now) / 1000)
  };
}
```

**Response Format:**
```typescript
// Success response
{
  success: true,
  results: [
    {
      coordinates: { lat: 43.7384, lon: 7.4246 },
      display_name: "Monaco, Monaco",
      type: "city",
      country: "Monaco",
      region: null
    }
  ]
}

// Error response
{
  success: false,
  error: "Rate limit exceeded",
  code: "RATE_LIMIT",
  retryAfter: 45
}
```

**IP Address Extraction:**
```typescript
// Get client IP from headers
const ip =
  request.headers.get('x-forwarded-for')?.split(',')[0] ||
  request.headers.get('x-real-ip') ||
  'unknown';
```

**Photon API URL Construction:**
```typescript
const photonUrl = new URL('https://photon.komoot.io/api');
photonUrl.searchParams.set('q', query);
photonUrl.searchParams.set('limit', limit.toString());
photonUrl.searchParams.set('lang', lang);
```

## Quality Gates

- [ ] Code follows Next.js 14 App Router patterns
- [ ] TypeScript types are properly defined
- [ ] Error handling is comprehensive
- [ ] Rate limiting works correctly per IP
- [ ] Response transformation is accurate
- [ ] No memory leaks in rate limiter
- [ ] Code is well-documented with comments
- [ ] All edge cases handled

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md

**Implementation Files:**
- /home/edwin/development/ptnextjs/app/api/geocode/route.ts (NEW)

**Related Tasks:**
- task-test-backend-api (prerequisite - provides test suite)
- task-impl-backend-types (depends on this task)
- task-test-backend-integration (tests this implementation)
