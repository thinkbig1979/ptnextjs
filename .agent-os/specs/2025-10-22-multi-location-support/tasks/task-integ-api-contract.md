# Task: INTEG-API-CONTRACT - API Contract Validation

## Task Metadata
- **Task ID**: INTEG-API-CONTRACT
- **Phase**: Phase 4 - Frontend-Backend Integration
- **Agent**: integration-coordinator
- **Estimated Time**: 20-25 minutes
- **Dependencies**: TEST-BACKEND-INTEGRATION, TEST-FRONTEND-INTEGRATION
- **Status**: [ ] Not Started

## Task Description
Validate API contract between frontend and backend. Ensure request/response structures match TypeScript interfaces, verify API endpoints work correctly, test error handling, and confirm data serialization/deserialization works as expected across the full stack.

## Specifics
- **Test Files to Create**:
  - `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/vendors-locations-contract.test.ts`

- **Key Requirements**:
  - Verify PATCH /api/vendors/:id request body matches VendorLocation[] type
  - Verify PATCH response structure matches API contract specification
  - Verify GET /api/vendors/search query params and response structure
  - Test data serialization: frontend sends valid JSON, backend accepts
  - Test data deserialization: backend returns valid JSON, frontend parses correctly
  - Verify error response format matches specification
  - Test all HTTP status codes (200, 400, 403, 500)
  - Verify TypeScript types align between frontend and backend

- **Technical Details**:
  - Use Postman or curl to test API endpoints directly
  - Use Jest for automated contract testing
  - Mock authentication tokens for authorized requests
  - Test with valid and invalid request bodies
  - Verify response headers (Content-Type, status codes)
  - Test payload sizes (ensure no truncation or size limits hit)
  - Verify coordinate precision (6 decimals preserved)

## Acceptance Criteria
- [ ] API contract test file created with comprehensive tests
- [ ] PATCH /api/vendors/:id contract validated (request and response)
- [ ] GET /api/vendors/search contract validated (query params and response)
- [ ] All HTTP status codes tested and verified
- [ ] Error response format validated
- [ ] TypeScript types verified to match between frontend and backend
- [ ] Data serialization/deserialization verified
- [ ] All contract tests pass successfully (15+ test cases)
- [ ] Postman collection created with example requests

## Testing Requirements
- **Functional Testing**: Run API contract tests - all tests must pass
- **Manual Verification**:
  - Use Postman to send requests to all endpoints
  - Verify responses match expected format
  - Test with frontend making actual API calls
- **Browser Testing**: Test API calls from browser console
- **Error Testing**: Verify all error scenarios return correct status codes and messages

## Evidence Required
- API contract test file with comprehensive tests
- Test output showing all tests passing
- Postman collection with example requests and responses
- Documentation of request/response formats
- TypeScript interface definitions for API contracts
- Screenshots of successful API calls from Postman

## Context Requirements
- Technical spec API contracts section
- Implemented backend API from IMPL-BACKEND-API
- Implemented frontend components from Phase 3
- API specification from sub-specs/api-spec.md

## Implementation Notes
- Use actual HTTP requests (not mocked) for contract testing
- Test against running development server
- Verify TypeScript types are shared or aligned
- Document any contract mismatches found and fixed
- Consider using tools like OpenAPI/Swagger for contract documentation
- Ensure contract tests run in CI/CD pipeline

## Quality Gates
- [ ] All contract tests pass (100% success rate)
- [ ] Request/response structures match TypeScript interfaces
- [ ] Error handling follows consistent format
- [ ] No data type mismatches between frontend and backend

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- API Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/api-spec.md
- Related Tasks: IMPL-BACKEND-API, TEST-BACKEND-INTEGRATION, TEST-FRONTEND-INTEGRATION
