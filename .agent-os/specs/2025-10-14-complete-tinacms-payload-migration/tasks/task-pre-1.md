# Task PRE-1: Integration Strategy and Transformation Layer Design

## Task Metadata
- **Task ID**: pre-1
- **Phase**: Phase 1 - Pre-Execution Analysis
- **Agent Assignment**: integration-coordinator
- **Estimated Time**: 3 hours
- **Dependencies**: None
- **Status**: Ready for Implementation
- **Priority**: Critical

## Task Description

Design the integration strategy and transformation layer architecture that will bridge TinaCMS markdown data structures with Payload CMS collections. This involves analyzing the existing codebase, defining the transformation patterns, and establishing the contract between frontend and backend.

## Specifics

### Files to Analyze
- `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts` - Current data service implementation
- `/home/edwin/development/ptnextjs/lib/types.ts` - TypeScript interfaces
- `/home/edwin/development/ptnextjs/tina/config.ts` - TinaCMS schema
- `/home/edwin/development/ptnextjs/src/collections/` - Existing Payload collections

### Design Requirements

1. **Transformation Layer Architecture**
   - Define shared transformation utilities location: `src/lib/transformers/`
   - Specify transformation functions for each content type:
     - `transformVendorFromMarkdown()` - Convert TinaCMS vendor to Payload format
     - `transformProductFromMarkdown()` - Convert TinaCMS product to Payload format
     - `transformYachtFromMarkdown()` - Convert yacht data (new collection)
     - `transformBlogPostFromMarkdown()` - Convert blog posts
     - `transformTeamMemberFromMarkdown()` - Convert team members
     - `transformCategoryFromMarkdown()` - Convert categories
     - `transformTagFromMarkdown()` - Convert tags (new collection)
   - Define markdown-to-Lexical converter for rich text fields

2. **Data Service Interface Contract**
   - Document method signatures for PayloadCMSDataService
   - Ensure 1:1 parity with TinaCMSDataService public methods
   - Define caching strategy (maintain 5-minute TTL)
   - Specify error handling patterns

3. **Field Mapping Specifications**
   - Map TinaCMS markdown frontmatter to Payload collection fields
   - Document enhanced field additions:
     - Vendor: certifications, awards, socialProof, videoIntro, caseStudies, innovations, teamMembers, yachtProjects
     - Product: comparisonMetrics, integrationCompatibility, ownerReviews, visualDemoContent
     - Yacht: timeline, supplierMap, sustainability, maintenanceHistory
   - Define default values for new fields in migration

4. **Integration Points Documentation**
   - List all pages that consume data service: vendors, products, yachts, blog, team, about, homepage
   - Document import statement changes required
   - Identify any custom data transformations in page components

5. **Backward Compatibility Strategy**
   - Define vendor/partner unification handling
   - Document legacy interface support requirements
   - Specify reference resolution patterns (file paths → database IDs)

## Acceptance Criteria

- [ ] Transformation layer architecture document created with file structure
- [ ] All transformation function signatures defined with input/output types
- [ ] PayloadCMSDataService interface contract documented with method signatures
- [ ] Complete field mapping table created (TinaCMS → Payload) for all 8 collections
- [ ] Integration points documented with required code changes per page
- [ ] Markdown-to-Lexical conversion strategy defined
- [ ] Backward compatibility requirements specified
- [ ] Caching and error handling patterns documented

## Testing Requirements

### Design Validation
- Review transformation patterns with technical spec requirements
- Validate field mappings cover 100% of TinaCMS fields plus enhancements
- Confirm all 7 page integration points identified
- Verify method signature parity between data services

### Manual Verification
- Compare documented transformations against existing TinaCMS data samples
- Review architecture with codebase conventions (lib/ vs src/)
- Validate transformation utilities location follows Next.js/Payload patterns

## Evidence Required

**Design Documents:**
1. `@.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/integration-strategy.md`
   - Transformation layer architecture
   - File structure and organization
   - Data service interface contract

2. `@.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/field-mappings.md`
   - Complete TinaCMS → Payload field mapping tables
   - Default values for new enhanced fields
   - Type conversion specifications

3. `@.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/integration-points.md`
   - List of all pages requiring updates
   - Required import statement changes
   - Custom transformation identification

## Context Requirements

**Technical Spec Sections:**
- Lines 28-184: Enhanced Vendor Fields
- Lines 194-380: Enhanced Product Fields
- Lines 383-527: Yachts Collection Schema
- Lines 657-708: Tags Collection Schema
- Lines 877-914: Frontend Page Updates

**Existing Code References:**
- `lib/tinacms-data-service.ts` - Current data service patterns
- `lib/types.ts` - Existing TypeScript interfaces
- `src/collections/*.ts` - Payload collection examples

## Quality Gates

- [ ] All transformation functions have defined TypeScript signatures
- [ ] Field mappings account for 100% of existing TinaCMS fields
- [ ] Enhanced fields have default migration values specified
- [ ] PayloadCMSDataService maintains full API compatibility with TinaCMSDataService
- [ ] Architecture follows Next.js and Payload CMS best practices
- [ ] Documentation is clear enough for implementation teams to proceed

## Notes

- This task is foundational - all implementation tasks depend on these decisions
- Focus on maintaining zero breaking changes to page components
- Consider static generation requirements (build-time data access)
- Document any deviations from existing patterns with rationale
