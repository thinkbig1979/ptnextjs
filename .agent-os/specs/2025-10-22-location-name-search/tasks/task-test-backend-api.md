# Task: test-backend-api - Design Backend API Test Suite

**Metadata:**
- **Task ID:** test-backend-api
- **Phase:** Phase 2: Backend Implementation
- **Agent:** test-architect
- **Estimated Time:** 15-20 min
- **Dependencies:** pre-2
- **Status:** Pending
- **Priority:** High

## Description

Design comprehensive test suite for the /api/geocode endpoint covering all functional requirements, error scenarios, rate limiting, and edge cases.

## Specifics

**Test Categories:**

1. **Successful Geocoding Tests:**
   - Test simple city search (e.g., "Monaco")
   - Test ambiguous search returning multiple results (e.g., "Paris")
   - Test postal code search (e.g., "90210")
   - Test regional search (e.g., "California")
   - Test international characters (e.g., "São Paulo")
   - Test multi-word locations (e.g., "New York")
   - Test with limit parameter variations (1, 5, 10)
   - Test with language parameter (en, fr, de, es)

2. **Error Handling Tests:**
   - Test with missing query parameter
   - Test with empty query string
   - Test with invalid characters
   - Test with extremely long query (>200 chars)
   - Test when Photon API is unavailable (503)
   - Test when Photon API returns error
   - Test malformed Photon API response

3. **Rate Limiting Tests:**
   - Test request under rate limit (passes)
   - Test request at rate limit threshold (passes)
   - Test request over rate limit (429 response)
   - Test rate limit reset after time window
   - Test rate limiting per IP address isolation

4. **Response Format Tests:**
   - Validate response schema matches contract
   - Verify PhotonFeature transformation
   - Validate coordinates extraction
   - Verify display_name formatting
   - Test empty results handling

5. **Performance Tests:**
   - Test response time < 2 seconds
   - Test concurrent requests handling
   - Test with very large result sets

**Files to Create:**
- `/home/edwin/development/ptnextjs/tests/unit/api/geocode.test.ts` (NEW)

**Test Framework:**
- Use Jest for unit testing
- Mock Photon API responses
- Use node-mocks-http for Next.js API route testing

## Acceptance Criteria

- [ ] Test suite covers all success scenarios (>90% coverage)
- [ ] All error scenarios have dedicated tests
- [ ] Rate limiting tests verify per-IP isolation
- [ ] Response schema validation tests created
- [ ] Performance baseline tests defined
- [ ] Mock Photon API responses created
- [ ] Test suite is runnable with `npm test`
- [ ] All tests include clear assertions and error messages

## Testing Requirements

**Functional Testing:**
- Test suite itself should be validated for completeness
- Run test suite to verify it executes without errors
- Verify all test cases are independent

**Manual Verification:**
- Review test coverage report
- Validate test scenarios match specification
- Confirm mock data represents real-world cases

**Error Scenarios to Test:**
```typescript
// 400 Bad Request
- Missing 'q' parameter
- Empty 'q' parameter
- Invalid 'limit' parameter (negative, non-numeric)

// 429 Too Many Requests
- Exceeding 10 requests per minute from same IP

// 500 Internal Server Error
- Photon API transformation failure
- Unexpected exception handling

// 503 Service Unavailable
- Photon API unreachable
- Photon API timeout
```

**Evidence Required:**
- Complete test suite file
- Test execution report showing all tests pass (when run against stub implementation)
- Coverage report showing >90% scenario coverage

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-pre-2.md
- API contract from pre-2 planning

**Assumptions:**
- Jest is configured in the project
- node-mocks-http is available or will be installed
- TypeScript test support is configured

## Implementation Notes

**Test Structure Pattern:**
```typescript
describe('/api/geocode', () => {
  describe('Successful requests', () => {
    it('should return results for simple city search', async () => {
      // Arrange: Mock Photon API response
      // Act: Call API endpoint
      // Assert: Validate response format and data
    });
  });

  describe('Error handling', () => {
    it('should return 400 for missing query parameter', async () => {
      // Test implementation
    });
  });

  describe('Rate limiting', () => {
    it('should return 429 after exceeding rate limit', async () => {
      // Test implementation
    });
  });
});
```

**Mock Data Examples:**
- Monaco result (single city)
- Paris results (multiple cities: France, TX, TN)
- Empty results (obscure location)
- Photon error response
- Malformed JSON response

**Rate Limiting Test Strategy:**
- Use fake timers to control time
- Mock IP address extraction
- Test multiple IPs independently
- Verify rate limit window reset

## Quality Gates

- [ ] All test categories have complete coverage
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Mock data represents real-world scenarios
- [ ] Error messages are descriptive
- [ ] Tests are independent and can run in any order
- [ ] Test execution time < 5 seconds total

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md

**Related Tasks:**
- task-pre-2 (prerequisite)
- task-impl-backend-geocode (will implement code to pass these tests)
- task-test-backend-integration (integration testing after implementation)
