# Task: IMPL-BACKEND-API - API Endpoint Implementation

## Task Metadata
- **Task ID**: IMPL-BACKEND-API
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 35-40 minutes
- **Dependencies**: IMPL-BACKEND-MIGRATION
- **Status**: [ ] Not Started

## Task Description
Implement API endpoints for vendor location management and location-based search with tier filtering. Extend existing PATCH /api/vendors/:id endpoint to handle locations array and create new GET /api/vendors/search endpoint for location-based queries.

## Specifics
- **Files to Create/Modify**:
  - `/home/edwin/development/ptnextjs/app/api/vendors/[id]/route.ts` - Extend PATCH handler for locations
  - `/home/edwin/development/ptnextjs/app/api/vendors/search/route.ts` - New location-based search endpoint
  - `/home/edwin/development/ptnextjs/lib/services/LocationService.ts` - Location business logic service
  - `/home/edwin/development/ptnextjs/lib/services/SearchService.ts` - Search business logic service

- **Key Requirements**:
  - PATCH /api/vendors/:id - Accept locations array in request body, validate tier restrictions, update database
  - GET /api/vendors/search - Accept latitude, longitude, radius query params, return vendors with matching locations
  - Implement tier-based filtering for search (all tiers show HQ, tier2+ show additional locations)
  - Implement coordinate distance calculation for radius search
  - Add authentication/authorization checks (vendor owns profile or is admin)
  - Return proper error responses for validation failures (400, 403)
  - Implement LocationService for validation and geocoding utilities
  - Implement SearchService for location-based queries

- **Technical Details**:
  - Use Next.js route handlers (app/api pattern)
  - Use Payload CMS REST API patterns for database operations
  - Implement Haversine formula for distance calculation between coordinates
  - Use Zod for request body validation
  - Return standardized response format: { success: true/false, data/error }
  - Implement proper error handling with try/catch
  - Log API requests for debugging

## Acceptance Criteria
- [ ] PATCH /api/vendors/:id accepts locations array in request body
- [ ] PATCH endpoint validates tier restrictions (tier0/1 cannot have multiple locations)
- [ ] PATCH endpoint validates HQ uniqueness (exactly one isHQ: true)
- [ ] PATCH endpoint validates coordinate ranges and field lengths
- [ ] PATCH endpoint returns 200 on success with updated vendor object
- [ ] PATCH endpoint returns 400 on validation error with descriptive message
- [ ] PATCH endpoint returns 403 on tier restriction violation
- [ ] GET /api/vendors/search accepts latitude, longitude, radius params
- [ ] Search endpoint returns vendors with locations within radius
- [ ] Search endpoint filters additional locations based on vendor tier
- [ ] Search endpoint calculates distance from search center to each location
- [ ] LocationService implements validation methods and distance calculation
- [ ] SearchService implements location-based query logic
- [ ] All endpoints have proper TypeScript types and error handling

## Testing Requirements
- **Functional Testing**:
  - Test PATCH with valid locations array - verify success response
  - Test PATCH with multiple HQ designations - verify 400 error
  - Test PATCH as tier1 vendor with multiple locations - verify 403 error
  - Test PATCH with invalid coordinates - verify 400 error
  - Test GET search with valid coordinates - verify results returned
  - Test GET search radius filtering - verify only locations within radius returned
  - Test GET search tier filtering - verify tier1 vendors only show HQ
- **Manual Verification**: Use Postman or curl to test API endpoints
- **Browser Testing**: N/A (API testing only)
- **Error Testing**: Test all error scenarios and verify proper status codes and messages

## Evidence Required
- Updated/created files showing API endpoint implementations
- LocationService with distance calculation and validation methods
- SearchService with tier-aware location filtering logic
- Postman collection or curl commands demonstrating all endpoints
- Test results showing successful requests and proper error handling
- Response samples for both success and error scenarios

## Context Requirements
- Technical spec API section from @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Implemented schema from IMPL-BACKEND-SCHEMA
- Existing API patterns in app/api directory
- Authentication patterns from existing codebase

## Implementation Notes
- Follow existing API route handler patterns in codebase
- Use consistent error response format across endpoints
- Implement proper logging for debugging
- Consider pagination for search results if dataset is large
- Cache geocoding results if implementing server-side geocoding
- Document API endpoints with JSDoc comments

## Quality Gates
- [ ] All API endpoints return proper HTTP status codes
- [ ] Request/response bodies match TypeScript interfaces
- [ ] Authentication and authorization checks implemented
- [ ] Error messages are user-friendly and descriptive
- [ ] API endpoints tested with all success and failure scenarios

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- API Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/api-spec.md
- Related Tasks: IMPL-BACKEND-SCHEMA, TEST-BACKEND-INTEGRATION, INTEG-API-CONTRACT
