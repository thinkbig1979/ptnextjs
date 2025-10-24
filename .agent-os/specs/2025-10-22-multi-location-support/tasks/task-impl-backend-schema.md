# Task: IMPL-BACKEND-SCHEMA - Database Schema Implementation

## Task Metadata
- **Task ID**: IMPL-BACKEND-SCHEMA
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 30-35 minutes
- **Dependencies**: TEST-BACKEND-SCHEMA
- **Status**: [ ] Not Started

## Task Description
Implement Payload CMS vendors collection schema modifications to support locations array field with validation hooks, tier-based access control, and HQ designation logic. Replace existing single location field with new locations array structure.

## Specifics
- **Files to Modify**:
  - `/home/edwin/development/ptnextjs/payload.config.ts` - Add locations array field to vendors collection
  - `/home/edwin/development/ptnextjs/lib/types.ts` - Add VendorLocation interface and update Vendor interface

- **Key Requirements**:
  - Add locations array field to vendors collection with proper TypeScript types
  - Implement field validation for address (max 500 chars), lat/long (ranges), city/country (max 255 chars)
  - Implement validation hook to enforce exactly one HQ location
  - Implement tier-based access control (tier 0/1 cannot update locations to multiple entries)
  - Implement beforeChange hook to auto-designate first location as HQ
  - Add field-level access control based on tier (read: all, update: tier2+ or admin)
  - Keep old location field temporarily for backward compatibility during migration

- **Technical Details**:
  - Use Payload CMS array field type with nested field definitions
  - Use validate function at array level for HQ uniqueness check
  - Use beforeChange hook at array level for auto-HQ designation
  - Use access control object on locations field for tier restrictions
  - Implement proper TypeScript interfaces for type safety
  - Follow existing Payload CMS patterns in payload.config.ts

## Acceptance Criteria
- [ ] locations array field added to vendors collection in payload.config.ts
- [ ] VendorLocation interface created in lib/types.ts with all required fields
- [ ] Vendor interface updated to include locations: VendorLocation[]
- [ ] Field validation implemented for all location fields (address, lat, long, city, country, isHQ)
- [ ] HQ uniqueness validation hook implemented and working
- [ ] Tier-based access control implemented on locations field
- [ ] Auto-HQ designation hook implemented for first location
- [ ] Old location field retained for backward compatibility
- [ ] All tests from TEST-BACKEND-SCHEMA pass
- [ ] TypeScript compilation succeeds with no errors

## Testing Requirements
- **Functional Testing**: Run test suite from TEST-BACKEND-SCHEMA - all tests must pass
- **Manual Verification**:
  - Start Payload CMS admin at /admin
  - Navigate to vendors collection
  - Verify locations array field is visible with proper UI
  - Attempt to add location with invalid data - verify validation errors appear
  - Attempt to mark two locations as HQ - verify error message
  - Test as tier1 vendor - verify cannot add multiple locations
- **Browser Testing**: Test Payload CMS admin UI for locations field
- **Error Testing**: Test all validation scenarios return proper error messages

## Evidence Required
- Updated payload.config.ts showing locations array field definition
- Updated lib/types.ts showing VendorLocation interface
- Test output showing all TEST-BACKEND-SCHEMA tests passing
- Screenshot of Payload CMS admin showing locations array field
- Screenshot of validation error when attempting multiple HQ designations
- Screenshot of tier restriction error for tier1 vendor with multiple locations

## Context Requirements
- Database schema specification from @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/database-schema.md
- Technical spec validation requirements
- Existing vendors collection schema in payload.config.ts
- Test file from TEST-BACKEND-SCHEMA

## Implementation Notes
- Follow existing field definition patterns in payload.config.ts
- Use descriptive admin.description fields for user guidance
- Ensure validation error messages are user-friendly
- Test thoroughly with Payload CMS admin UI before marking complete
- Do not remove old location field yet (needed for migration)

## Quality Gates
- [ ] Schema compiles without TypeScript errors
- [ ] All unit tests pass (100% of TEST-BACKEND-SCHEMA tests)
- [ ] Payload CMS admin UI displays field correctly
- [ ] Validation hooks prevent invalid data from being saved
- [ ] Tier restrictions work correctly in admin UI

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Database Schema: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/database-schema.md
- Technical Spec: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/technical-spec.md
- Related Tasks: TEST-BACKEND-SCHEMA, IMPL-BACKEND-MIGRATION, IMPL-BACKEND-API
