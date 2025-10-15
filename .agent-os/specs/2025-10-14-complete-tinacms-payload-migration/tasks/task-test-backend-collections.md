# Task TEST-BACKEND-COLLECTIONS: Design Comprehensive Test Suite for Payload Collections

## Task Metadata
- **Task ID**: test-backend-collections
- **Phase**: Phase 2 - Backend Implementation
- **Agent Assignment**: test-architect
- **Estimated Time**: 4 hours
- **Dependencies**: pre-1, pre-2
- **Status**: Ready for Implementation
- **Priority**: High

## Task Description

Design a comprehensive test suite architecture for all Payload CMS collections (Vendors, Products, Categories, Blog, Team, Company, Yachts, Tags). Define test patterns for collection schemas, hooks, access control, and validation logic. Create test specifications that implementation teams will use to validate collection functionality.

## Specifics

### Test Coverage Requirements

1. **Collection Schema Tests** (8 collections)
   - Field definitions and types validation
   - Required field enforcement
   - Default value application
   - Enum constraint validation
   - Relationship field configuration
   - Rich text field configuration (Lexical editor)
   - Array field validation (min/max items)

2. **Access Control Tests**
   - Admin-only operations for Tags (create, update, delete)
   - Read-only access validation where applicable
   - Authentication requirement validation
   - Role-based permissions testing

3. **Hook Tests**
   - Slug generation from name/title (beforeValidate hook)
   - Duplicate slug prevention
   - Timestamp updates (createdAt, updatedAt)
   - Reference integrity validation
   - Custom validation logic

4. **Data Validation Tests**
   - URL format validation (website, social media links)
   - Email format validation
   - Phone number format validation
   - Date range validation
   - Numeric range validation (ratings, percentages)
   - Rich text content validation

5. **Relationship Tests**
   - Product → Vendor references
   - Product → Categories (many-to-many)
   - Yacht → Vendors (supplier map)
   - Blog → Categories
   - Vendor → Yacht Projects (portfolio)
   - Orphaned reference detection

### Test Files to Create

1. **`src/collections/__tests__/Vendors.test.ts`**
   - Schema validation (100+ fields including enhancements)
   - Certification array validation
   - Awards array validation
   - Social proof metrics validation
   - Case studies structure validation
   - Team members array validation
   - Yacht projects portfolio validation

2. **`src/collections/__tests__/Products.test.ts`**
   - Schema validation (90+ fields including enhancements)
   - Comparison metrics array validation
   - Integration compatibility validation
   - Owner reviews structure validation
   - Visual demo content validation
   - Vendor reference integrity

3. **`src/collections/__tests__/Yachts.test.ts`** (new collection)
   - Timeline array validation
   - Supplier map with vendor references
   - Sustainability metrics validation
   - Maintenance history array validation
   - Event category enum validation

4. **`src/collections/__tests__/Tags.test.ts`** (new collection)
   - Tag schema validation
   - Admin-only access control
   - Usage count tracking
   - Color field validation
   - Unique slug enforcement

5. **`src/collections/__tests__/Categories.test.ts`**
   - Category schema validation
   - Slug generation hook testing
   - Parent-child relationship validation

6. **`src/collections/__tests__/Blog.test.ts`**
   - Blog post schema validation
   - Rich text content validation
   - Category relationships
   - Author field validation

7. **`src/collections/__tests__/Team.test.ts`**
   - Team member schema validation
   - Role field validation
   - Social links validation

8. **`src/collections/__tests__/Company.test.ts`**
   - Company info schema validation
   - Singleton collection behavior
   - Contact information validation

### Test Utilities to Design

1. **`src/collections/__tests__/utils/testHelpers.ts`**
   - Mock Payload instance creation
   - Test data factories for each collection
   - Database cleanup utilities
   - Mock authentication context
   - Assertion helpers for Payload responses

2. **`src/collections/__tests__/utils/fixtures.ts`**
   - Sample vendor data (with enhancements)
   - Sample product data (with enhancements)
   - Sample yacht data
   - Sample tag data
   - Sample category data
   - Sample blog post data
   - Sample team member data
   - Sample company data

3. **`src/collections/__tests__/utils/mockData.ts`**
   - Rich text content samples (Lexical format)
   - Array field samples (certifications, awards, reviews)
   - Relationship reference samples
   - Media path samples

## Acceptance Criteria

- [ ] Test suite architecture documented for all 8 collections
- [ ] Test file specifications created (8 collection test files)
- [ ] Test utilities specifications created (3 utility files)
- [ ] Test patterns defined for schema, hooks, access control, validation
- [ ] Test coverage targets specified (minimum 90% for collection files)
- [ ] Mock data fixtures designed for all collections
- [ ] Test execution strategy documented (unit, integration, e2e)
- [ ] CI/CD integration approach specified

## Testing Requirements

### Design Validation
- Review test coverage against all collection schemas in technical spec
- Validate test patterns cover enhanced fields (vendors, products, yachts)
- Confirm access control tests cover admin-only collections (Tags)
- Verify relationship tests cover all reference types

### Manual Verification
- Compare test specifications against Payload CMS testing best practices
- Review mock data fixtures for realism and completeness
- Validate test utilities provide sufficient helper functions

## Evidence Required

**Design Documents:**
1. `@.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/test-suite-architecture.md`
   - Test suite organization and structure
   - Test file specifications (8 collections)
   - Test utilities specifications (3 files)
   - Test execution strategy

2. **Test Specification Files** (create detailed test specs):
   - `tasks/test-specs/vendors-tests.md` - Detailed Vendors collection test cases
   - `tasks/test-specs/products-tests.md` - Detailed Products collection test cases
   - `tasks/test-specs/yachts-tests.md` - Detailed Yachts collection test cases
   - `tasks/test-specs/tags-tests.md` - Detailed Tags collection test cases
   - `tasks/test-specs/categories-tests.md` - Detailed Categories collection test cases
   - `tasks/test-specs/blog-tests.md` - Detailed Blog collection test cases
   - `tasks/test-specs/team-tests.md` - Detailed Team collection test cases
   - `tasks/test-specs/company-tests.md` - Detailed Company collection test cases

3. **Mock Data Specifications:**
   - `tasks/test-specs/mock-data-fixtures.md` - Sample data structure for all collections

## Context Requirements

**Technical Spec Sections:**
- Lines 28-184: Enhanced Vendor Fields (for test fixtures)
- Lines 194-380: Enhanced Product Fields (for test fixtures)
- Lines 383-527: Yachts Collection Schema (for test cases)
- Lines 657-708: Tags Collection Schema (for test cases)
- Lines 916-962: Testing Strategy

**Existing Code References:**
- `src/collections/*.ts` - Existing Payload collections for pattern reference
- Payload CMS documentation - Testing patterns and best practices
- Jest configuration for test runner setup

## Quality Gates

- [ ] All 8 collections have test specifications
- [ ] Test coverage includes schema, hooks, access control, validation
- [ ] Mock data fixtures designed for all entity types
- [ ] Test utilities provide reusable helpers for common operations
- [ ] Test patterns follow Payload CMS and Jest best practices
- [ ] Enhanced fields (certifications, awards, reviews, etc.) have dedicated test cases
- [ ] Relationship integrity tests cover all reference types
- [ ] Access control tests validate admin-only restrictions

## Notes

- Test specifications should be detailed enough for implementation team to code from
- Focus on testing enhanced fields thoroughly (they are new and untested)
- Consider using Payload's test utilities if available
- Design tests to run quickly (mock external dependencies)
- Ensure tests are idempotent and can run in any order
- Document any Payload-specific testing patterns discovered
