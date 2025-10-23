# Task: test-backend-integration - Backend Integration Testing

**Metadata:**
- **Task ID:** test-backend-integration
- **Phase:** Phase 2: Backend Implementation
- **Agent:** test-architect
- **Estimated Time:** 20-25 min
- **Dependencies:** impl-backend-types
- **Status:** Pending
- **Priority:** High

## Description

Perform comprehensive integration testing of the /api/geocode endpoint with both mocked and real Photon API responses to validate end-to-end backend functionality.

## Specifics

**Testing Scope:**

1. **Integration Tests with Mock Photon API:**
   - Test complete request/response cycle
   - Validate rate limiting across multiple requests
   - Test error propagation from Photon API
   - Verify response transformation accuracy
   - Test timeout handling

2. **Integration Tests with Real Photon API:**
   - Test with real location queries (Monaco, Paris, etc.)
   - Validate real-world response handling
   - Test international character support
   - Verify performance under real network conditions
   - Document actual response times

3. **Rate Limiting Integration:**
   - Test rate limiter with concurrent requests
   - Verify per-IP isolation with multiple IPs
   - Test rate limit reset behavior
   - Validate Retry-After header accuracy

4. **Error Recovery Testing:**
   - Test recovery from Photon API timeouts
   - Test handling of malformed Photon responses
   - Test network error scenarios
   - Verify graceful degradation

5. **Performance Testing:**
   - Measure response time for various queries
   - Test with concurrent requests (10, 20, 50)
   - Identify performance bottlenecks
   - Validate timeout configurations

**Files to Create:**
- `/home/edwin/development/ptnextjs/tests/integration/api/geocode-integration.test.ts` (NEW)

**Test Environment:**
- Use Jest with supertest for API testing
- Mock Photon API with nock or msw
- Test against real Photon API (conditional, with timeout)

## Acceptance Criteria

- [ ] Integration tests with mocked Photon API pass (100%)
- [ ] Real Photon API tests pass (when API is available)
- [ ] Rate limiting integration verified with concurrent requests
- [ ] Error recovery scenarios tested and passing
- [ ] Performance benchmarks documented
- [ ] All edge cases covered
- [ ] Test suite runs in < 30 seconds (mocked tests)
- [ ] Real API tests have proper timeout handling

## Testing Requirements

**Functional Testing:**
- Run integration test suite: `npm test -- geocode-integration.test.ts`
- All tests must pass
- No flaky tests (run 3 times to verify)

**Manual Verification:**
- Start dev server: `npm run dev`
- Test endpoints with real requests:
  ```bash
  # Test simple query
  curl "http://localhost:3000/api/geocode?q=Monaco"

  # Test with limit
  curl "http://localhost:3000/api/geocode?q=Paris&limit=3"

  # Test rate limiting (11 rapid requests)
  for i in {1..11}; do
    curl -w "\nStatus: %{http_code}\n" "http://localhost:3000/api/geocode?q=test$i"
    sleep 0.1
  done

  # Test error cases
  curl "http://localhost:3000/api/geocode"  # Missing query
  curl "http://localhost:3000/api/geocode?q="  # Empty query
  ```

**Browser Testing:**
- Not required (API endpoint)

**Error Scenarios:**
- Photon API returns 500 → Endpoint returns 503
- Photon API times out → Endpoint returns 503
- Invalid Photon response → Endpoint returns 500
- Rate limit exceeded → Endpoint returns 429

**Evidence Required:**
- Integration test execution report (all passing)
- Real API test results with actual response data
- Performance benchmark results
- Manual curl test outputs
- Rate limiting verification (showing 429 after 10 requests)

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-impl-backend-geocode.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-impl-backend-types.md
- Implemented /api/geocode endpoint

**Assumptions:**
- Dev server can be started locally
- Internet connection available for real API tests
- Photon API is accessible (https://photon.komoot.io)
- supertest or similar library available

## Implementation Notes

**Integration Test Structure:**

```typescript
describe('/api/geocode Integration Tests', () => {
  describe('With Mocked Photon API', () => {
    beforeEach(() => {
      // Setup mock Photon API responses
    });

    it('should handle successful geocoding with transformed response', async () => {
      // Test complete flow
    });

    it('should enforce rate limiting across multiple requests', async () => {
      // Make 11 requests, verify 11th returns 429
    });
  });

  describe('With Real Photon API', () => {
    it('should geocode Monaco successfully', async () => {
      const response = await request(app)
        .get('/api/geocode?q=Monaco')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results.length).toBeGreaterThan(0);
      expect(response.body.results[0]).toMatchObject({
        coordinates: { lat: expect.any(Number), lon: expect.any(Number) },
        display_name: expect.stringContaining('Monaco')
      });
    });
  });
});
```

**Performance Benchmarks:**
- Single request: < 1 second (mocked), < 2 seconds (real)
- 10 concurrent requests: < 3 seconds (mocked), < 5 seconds (real)
- Rate limit enforcement: < 100ms overhead

**Mock Setup Example:**
```typescript
import nock from 'nock';

nock('https://photon.komoot.io')
  .get('/api')
  .query({ q: 'Monaco', limit: '5', lang: 'en' })
  .reply(200, {
    type: 'FeatureCollection',
    features: [/* mock features */]
  });
```

**Real API Test Considerations:**
- Use conditional test execution (skip if offline)
- Add longer timeout for real API tests (10 seconds)
- Document actual response structure for validation
- Test with various real-world locations

## Quality Gates

- [ ] All mocked integration tests pass
- [ ] Real API tests pass (when available)
- [ ] Rate limiting verified with concurrent requests
- [ ] Performance benchmarks meet requirements
- [ ] No test flakiness detected
- [ ] Error scenarios properly handled
- [ ] Test coverage > 95%

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md

**Implementation Files:**
- /home/edwin/development/ptnextjs/app/api/geocode/route.ts
- /home/edwin/development/ptnextjs/lib/types.ts

**Test Files:**
- /home/edwin/development/ptnextjs/tests/integration/api/geocode-integration.test.ts (NEW)
- /home/edwin/development/ptnextjs/tests/unit/api/geocode.test.ts (from test-backend-api)

**Related Tasks:**
- task-impl-backend-geocode (tests this implementation)
- task-impl-backend-types (tests use these types)
- task-test-frontend-ui (next phase starts after this)
- task-integ-api-contract (validates contract compliance)
