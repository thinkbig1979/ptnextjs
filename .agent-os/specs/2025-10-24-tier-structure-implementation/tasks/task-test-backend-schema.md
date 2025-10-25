# Task TEST-BACKEND-SCHEMA: Design Database Schema Tests

**ID**: test-backend-schema
**Title**: Design comprehensive database schema tests for tier structure
**Agent**: test-architect
**Estimated Time**: 1.5 hours
**Dependencies**: pre-2
**Phase**: 2 - Backend Implementation

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md - Full schema specification
- @payload.config.ts - Current Payload CMS configuration
- @payload/collections/Vendors.ts - Current Vendors collection (if exists)

## Objectives

1. Design test suite for all 40+ new vendor fields
2. Create tests for tier-conditional field visibility
3. Design validation tests for field constraints (founded year 1800-current, scores 0-100)
4. Create tests for array field relationships (certifications, awards, case studies, etc.)
5. Design migration tests to ensure data preservation
6. Create tests for tier enum extension (free, tier1, tier2, tier3)
7. Design computed field tests (yearsInBusiness calculation)

## Acceptance Criteria

- [ ] Test specifications for all scalar fields (foundedYear, totalProjects, etc.)
- [ ] Test specifications for all array fields (certifications, awards, caseStudies, etc.)
- [ ] Test specifications for tier-conditional field access
- [ ] Test specifications for field validation constraints
- [ ] Test specifications for database migrations (add fields, no data loss)
- [ ] Test specifications for foreign key relationships
- [ ] Mock data fixtures for all tier levels
- [ ] Edge case tests (null values, boundary conditions, invalid data)

## Testing Requirements

N/A (this task designs tests)

## Evidence Requirements

- Test specification document (markdown)
- Test file templates with empty test cases
- Mock data fixtures (JSON or TypeScript)
- Test coverage plan showing all fields covered
