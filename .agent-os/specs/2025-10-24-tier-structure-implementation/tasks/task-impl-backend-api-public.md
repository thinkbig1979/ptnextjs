# Task IMPL-BACKEND-API-PUBLIC: Implement Public Vendor API Endpoint

**ID**: impl-backend-api-public
**Title**: Implement GET /api/vendors/[slug] public endpoint with tier filtering
**Agent**: backend-nodejs-specialist
**Estimated Time**: 1.5 hours
**Dependencies**: impl-backend-api-put
**Phase**: 2 - Backend Implementation

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 545-583) - Public API specification
- @lib/services/VendorProfileService.ts - Service layer
- @lib/services/VendorComputedFieldsService.ts - Computed fields

## Objectives

1. Create public API route at app/api/vendors/[slug]/route.ts
2. Implement GET handler (no authentication required)
3. Use VendorProfileService.getVendorProfile(slug) to fetch vendor
4. Filter response to only include tier-appropriate fields
5. Apply array limits based on tier (locations: Free=1 HQ only, Tier1=3, Tier2+=all)
6. Enrich response with computed fields (yearsInBusiness)
7. Return only published vendors (respect published flag)
8. Implement proper HTTP status codes (200, 404, 500)
9. Optimize for performance (caching headers)

## Acceptance Criteria

- [ ] API route created at app/api/vendors/[slug]/route.ts
- [ ] GET handler works without authentication
- [ ] Response filters fields based on vendor's tier
- [ ] Free tier: only HQ location returned
- [ ] Tier 1: max 3 locations returned
- [ ] Tier 2+: all locations returned
- [ ] Tier-restricted fields (certifications, awards, etc.) only returned for appropriate tiers
- [ ] yearsInBusiness computed and included
- [ ] Unpublished vendors return 404
- [ ] Cache-Control headers set for 5-minute caching
- [ ] Response matches technical spec interface

## Testing Requirements

- Test public access to Free tier vendor (basic fields only, 1 location)
- Test public access to Tier 1 vendor (extended fields, max 3 locations)
- Test public access to Tier 2 vendor (product fields, all locations)
- Test public access to Tier 3 vendor (editorial content, featured flags)
- Test unpublished vendor returns 404
- Test non-existent vendor returns 404
- Test yearsInBusiness computed correctly
- Test caching headers present

## Evidence Requirements

- app/api/vendors/[slug]/route.ts
- Integration test file
- Test execution results for all tier levels
- Example API responses for each tier
- Performance test showing cache headers work
