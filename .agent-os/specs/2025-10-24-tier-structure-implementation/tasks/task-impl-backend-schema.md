# Task IMPL-BACKEND-SCHEMA: Implement Vendors Collection Schema Extensions

**ID**: impl-backend-schema
**Title**: Implement all 40+ tier-specific fields in Vendors collection
**Agent**: backend-nodejs-specialist
**Estimated Time**: 3 hours
**Dependencies**: test-backend-schema
**Phase**: 2 - Backend Implementation

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 20-418) - Complete field specifications
- @payload.config.ts - Payload CMS configuration
- @payload/collections/Vendors.ts - Existing Vendors collection
- Test specifications from task-test-backend-schema.md

## Objectives

1. Extend tier enum to include 'free', 'tier1', 'tier2', 'tier3'
2. Add foundedYear field with validation (1800 to current year)
3. Add Tier 1+ social proof fields (totalProjects, employeeCount, followers, satisfaction scores)
4. Add Tier 1+ arrays (certifications, awards, videoIntroduction, caseStudies, innovationHighlights, teamMembers, yachtProjects, serviceAreas, companyValues)
5. Add longDescription rich text field (Tier 1+)
6. Add Tier 2+ feature flags (featuredInCategory, advancedAnalytics, apiAccess, customDomain)
7. Add Tier 3 promotionPack group with nested fields
8. Add Tier 3 editorialContent array (admin-only access)
9. Implement admin-only access controls for tier-setting and feature flags
10. Add conditional visibility logic for all tier-restricted fields

## Acceptance Criteria

- [ ] All 40+ fields added to Vendors collection schema
- [ ] Tier enum includes all 4 values with proper labels
- [ ] Founded year validation enforces 1800 ≤ year ≤ current year
- [ ] All array fields have proper nested field definitions
- [ ] Admin-only fields have proper access control hooks
- [ ] Conditional visibility (admin.condition) works for all tier-restricted fields
- [ ] All fields have proper TypeScript types
- [ ] Rich text fields use @payloadcms/richtext-lexical
- [ ] Relationship fields properly reference other collections
- [ ] All validation constraints are enforced server-side

## Testing Requirements

- Run test suite from test-backend-schema task
- Verify schema validation in Payload admin UI
- Test field conditional visibility by changing tier values
- Test admin access controls (non-admin cannot set tier)
- Validate all field constraints (year ranges, score ranges)

## Evidence Requirements

- Updated payload/collections/Vendors.ts file
- Screenshot of Payload admin UI showing new fields
- Test execution results showing all schema tests passing
- Type generation output (payload-types.ts updated)
- Admin UI showing tier-conditional field visibility
