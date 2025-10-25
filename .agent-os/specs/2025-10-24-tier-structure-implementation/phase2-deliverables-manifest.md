# Phase 2: Backend Implementation - Deliverables Manifest

**Phase**: Backend Foundation
**Total Tasks**: 8
**Estimated Time**: 16.5 hours
**Status**: IN PROGRESS

---

## Task 1: TEST-BACKEND-SCHEMA (1.5h)

### Deliverables
- [ ] `__tests__/backend/schema/vendors-schema.test.ts` - Schema validation tests
- [ ] `__tests__/fixtures/vendors-tier-data.ts` - Mock vendor data for all tiers
- [ ] `__tests__/backend/schema/tier-validation.test.ts` - Tier-conditional field tests
- [ ] `docs/testing/backend-schema-tests.md` - Test specification document

### Expected File Contents
- **vendors-schema.test.ts**: Tests for all 40+ fields, validation constraints, foreign keys
- **vendors-tier-data.ts**: Mock data fixtures for free, tier1, tier2, tier3 vendors
- **tier-validation.test.ts**: Tests for admin-only access, tier-conditional visibility
- **backend-schema-tests.md**: Test coverage plan with acceptance criteria

### Acceptance Criteria Verification
- [ ] Test specs cover all scalar fields (foundedYear, totalProjects, etc.)
- [ ] Test specs cover all array fields (certifications, awards, caseStudies, etc.)
- [ ] Test specs for tier-conditional field access
- [ ] Test specs for field validation constraints
- [ ] Test specs for database migrations
- [ ] Mock data fixtures for all 4 tier levels
- [ ] Edge case tests documented

---

## Task 2: IMPL-BACKEND-SCHEMA (3h)

### Deliverables
- [ ] `payload/collections/Vendors.ts` - Updated with 40+ tier fields
- [ ] `lib/types/tier.ts` - Tier-related TypeScript interfaces
- [ ] `payload-types.ts` - Auto-generated (via `npm run payload generate:types`)

### Expected Modifications to Vendors.ts
- [ ] Tier enum extended: 'free', 'tier1', 'tier2', 'tier3'
- [ ] foundedYear field (number, 1800-current year validation)
- [ ] Social proof fields (totalProjects, employeeCount, followers, satisfaction)
- [ ] Arrays: certifications, awards, videoIntroduction, caseStudies, innovationHighlights, teamMembers, yachtProjects, serviceAreas, companyValues
- [ ] longDescription (rich text, Tier 1+)
- [ ] Tier 2+ feature flags: featuredInCategory, advancedAnalytics, apiAccess, customDomain
- [ ] Tier 3 promotionPack group (featuredPlacement, editorialCoverage, searchHighlight)
- [ ] Tier 3 editorialContent array (admin-only)
- [ ] Conditional visibility (admin.condition) for all tier-restricted fields
- [ ] Admin-only access controls for tier-setting

### Acceptance Criteria Verification
- [ ] All 40+ fields added to schema
- [ ] Tier enum has 4 values with proper labels
- [ ] Founded year validation enforces 1800 ≤ year ≤ current
- [ ] All array fields have nested field definitions
- [ ] Admin-only fields have access control hooks
- [ ] Conditional visibility works for tier-restricted fields
- [ ] TypeScript types generated
- [ ] Rich text uses @payloadcms/richtext-lexical
- [ ] Relationships reference correct collections

---

## Task 3: IMPL-BACKEND-MIGRATIONS (1h)

### Deliverables
- [ ] `migrations/2025-10-24-add-tier3-enum.ts` - Add Tier 3 to enum
- [ ] `migrations/2025-10-24-add-tier-fields.ts` - Add all new scalar/array fields
- [ ] `migrations/2025-10-24-convert-founded-year.ts` - Convert yearsInBusiness → foundedYear
- [ ] `docs/migrations/tier-structure-migration-guide.md` - Migration documentation

### Expected Migration Scripts
- **add-tier3-enum.ts**: ALTER TYPE tier_enum ADD VALUE 'tier3'
- **add-tier-fields.ts**: ALTER TABLE vendors ADD COLUMN ... (all 40+ fields)
- **convert-founded-year.ts**: Data migration with up/down scripts
- Each migration must include rollback (down) function

### Acceptance Criteria Verification
- [ ] Migration adds Tier 3 to enum
- [ ] Migration adds all 40+ fields
- [ ] Migration creates tables for array fields
- [ ] Foreign keys reference correct tables with CASCADE
- [ ] Indexes on tier, foundedYear, featured flags
- [ ] Rollback migrations implemented
- [ ] Existing vendor data preserved
- [ ] Migrations are idempotent

---

## Task 4: IMPL-BACKEND-SERVICES (2.5h)

### Deliverables
- [ ] `lib/services/TierValidationService.ts` - Tier access validation
- [ ] `lib/services/VendorComputedFieldsService.ts` - Computed field logic
- [ ] `lib/services/VendorProfileService.ts` - Vendor CRUD with tier validation
- [ ] `lib/constants/tiers.ts` - Tier configuration constants
- [ ] `lib/types/tier.ts` - Tier TypeScript types (if not created in Task 2)
- [ ] `__tests__/services/TierValidationService.test.ts` - Unit tests
- [ ] `__tests__/services/VendorComputedFieldsService.test.ts` - Unit tests
- [ ] `__tests__/services/VendorProfileService.test.ts` - Integration tests

### Expected Service Methods

#### TierValidationService
- `validateFieldAccess(tier: string, fieldName: string): boolean`
- `validateLocationLimit(tier: string, locationCount: number): {valid: boolean, maxAllowed: number}`
- `canAccessFeature(tier: string, feature: string): boolean`
- `getTierFeatures(tier: string): TierFeature[]`
- `getLocationLimit(tier: string): number`

#### VendorComputedFieldsService
- `computeYearsInBusiness(foundedYear?: number | null): number | null`
- `enrichVendorData(vendor: Vendor): VendorWithComputed`

#### VendorProfileService
- `getVendorProfile(slug: string): Promise<Vendor>`
- `getVendorForEdit(id: string, userId: string): Promise<Vendor>`
- `updateVendorProfile(id: string, data: Partial<Vendor>, user: User): Promise<Vendor>`
- `validateTierData(vendor: Vendor, newTier: string): Promise<ValidationResult>`

### Acceptance Criteria Verification

**TierValidationService**:
- [ ] All methods implemented with TypeScript types
- [ ] Tier config constants for all 4 tiers
- [ ] Location limits: Free=1, Tier1=3, Tier2=10, Tier3=unlimited
- [ ] Field access checks tier hierarchy
- [ ] Unit tests cover all tier combinations (16 tests)

**VendorComputedFieldsService**:
- [ ] yearsInBusiness computed correctly
- [ ] Handles null foundedYear (returns null)
- [ ] Handles future years (returns null, logs warning)
- [ ] enrichVendorData doesn't mutate original
- [ ] Unit tests cover edge cases (8 tests)

**VendorProfileService**:
- [ ] Uses Payload CMS for data access
- [ ] Authorization checks enforce ownership/admin
- [ ] Tier validation before updates
- [ ] Computed fields enriched
- [ ] Error handling with proper codes
- [ ] Integration tests with database (12 tests)

---

## Task 5: IMPL-BACKEND-API-GET (1.5h)

### Deliverables
- [ ] `app/api/portal/vendors/[id]/route.ts` - GET handler (modify existing)
- [ ] `__tests__/api/portal/vendors-get.test.ts` - Integration tests
- [ ] `lib/types/api.ts` - API request/response types

### Expected API Implementation
- GET /api/portal/vendors/[id]
- Authentication: JWT token required
- Authorization: Vendor ownership or admin role
- Response: Vendor with all tier-appropriate fields + computed fields
- Status codes: 200, 401, 403, 404, 500

### Acceptance Criteria Verification
- [ ] GET handler implements authentication
- [ ] Authorization enforces ownership/admin
- [ ] Response includes tier-appropriate fields
- [ ] Computed fields (yearsInBusiness) included
- [ ] Standardized error format
- [ ] Proper HTTP status codes
- [ ] Types match technical spec
- [ ] Error logging
- [ ] Tests: 200, 401, 403, 404, computed field presence (7 tests)

---

## Task 6: IMPL-BACKEND-API-PUT (2h)

### Deliverables
- [ ] `app/api/portal/vendors/[id]/route.ts` - PUT handler (modify existing)
- [ ] `lib/validation/vendorSchemas.ts` - Zod validation schemas
- [ ] `__tests__/api/portal/vendors-put.test.ts` - Integration tests

### Expected API Implementation
- PUT /api/portal/vendors/[id]
- Authentication: JWT token required
- Authorization: Vendor ownership or admin role
- Validation: Zod schema + tier validation
- Status codes: 200, 400, 401, 403, 404, 500

### Acceptance Criteria Verification
- [ ] PUT handler with Zod validation
- [ ] Tier validation before update
- [ ] Field-level validation errors
- [ ] Location limit validation
- [ ] Computed fields recomputed
- [ ] Standardized error format
- [ ] Proper status codes
- [ ] TIER_PERMISSION_DENIED error code
- [ ] Tests: 200, 400 (validation), 401, 403 (tier), 404, recomputed fields (9 tests)

---

## Task 7: IMPL-BACKEND-API-PUBLIC (1.5h)

### Deliverables
- [ ] `app/api/vendors/[slug]/route.ts` - Public GET endpoint
- [ ] `__tests__/api/vendors-public.test.ts` - Integration tests

### Expected API Implementation
- GET /api/vendors/[slug]
- Authentication: None required (public)
- Response: Tier-filtered vendor data
- Array limits: Free=1 location (HQ only), Tier1=3, Tier2+=all
- Cache headers: 5-minute caching
- Status codes: 200, 404, 500

### Acceptance Criteria Verification
- [ ] GET handler without authentication
- [ ] Response filters by vendor's tier
- [ ] Free: only HQ location
- [ ] Tier 1: max 3 locations
- [ ] Tier 2+: all locations
- [ ] Tier-restricted fields filtered
- [ ] yearsInBusiness computed
- [ ] Unpublished vendors return 404
- [ ] Cache-Control headers (5 min)
- [ ] Tests for all 4 tiers + unpublished + non-existent (8 tests)

---

## Task 8: TEST-BACKEND-INTEGRATION (2h)

### Deliverables
- [ ] `__tests__/integration/backend-full-suite.test.ts` - End-to-end backend tests
- [ ] `__tests__/integration/tier-validation-e2e.test.ts` - Tier validation flow tests
- [ ] `docs/testing/backend-integration-report.md` - Test results report
- [ ] Test coverage report (HTML + console output)

### Expected Test Suites
- Unit tests: TierValidationService (16 scenarios)
- Unit tests: VendorComputedFieldsService (8 scenarios)
- Unit tests: VendorProfileService (12 scenarios)
- Integration: GET /api/portal/vendors/[id] (7 scenarios)
- Integration: PUT /api/portal/vendors/[id] (9 scenarios)
- Integration: GET /api/vendors/[slug] (8 scenarios)
- End-to-end: Full vendor lifecycle for each tier (4 scenarios)

### Acceptance Criteria Verification
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Test coverage ≥80% for backend
- [ ] End-to-end scenarios pass for all 4 tiers
- [ ] Tier validation rejects unauthorized access
- [ ] Authorization enforces ownership/admin
- [ ] Computed fields correct in all contexts
- [ ] Error responses match format
- [ ] No memory leaks or performance issues
- [ ] All edge cases handled

---

## Integration Verification Points

### After Task 2 (Schema)
- [ ] Payload CMS admin UI shows all new fields
- [ ] Tier dropdown has 4 options
- [ ] Conditional visibility works when changing tiers
- [ ] `npm run payload generate:types` succeeds

### After Task 3 (Migrations)
- [ ] Migrations run without errors
- [ ] Database schema matches expected structure
- [ ] Existing vendor data intact
- [ ] Rollback/re-run works (idempotency)

### After Task 4 (Services)
- [ ] All service unit tests pass
- [ ] Service integration tests pass with database
- [ ] Test coverage ≥80% for services

### After Tasks 5-7 (API Endpoints)
- [ ] All API tests pass
- [ ] Postman/curl manual tests succeed
- [ ] Error responses consistent across endpoints
- [ ] Authentication/authorization enforced

### After Task 8 (Integration Testing)
- [ ] Full backend test suite passes
- [ ] Overall backend coverage ≥80%
- [ ] Performance benchmarks met
- [ ] No breaking changes to existing functionality

---

## File Creation Checklist

### New Files (Must Create)
- [ ] `__tests__/backend/schema/vendors-schema.test.ts`
- [ ] `__tests__/backend/schema/tier-validation.test.ts`
- [ ] `__tests__/fixtures/vendors-tier-data.ts`
- [ ] `docs/testing/backend-schema-tests.md`
- [ ] `lib/services/TierValidationService.ts`
- [ ] `lib/services/VendorComputedFieldsService.ts`
- [ ] `lib/services/VendorProfileService.ts`
- [ ] `lib/constants/tiers.ts`
- [ ] `lib/types/tier.ts`
- [ ] `lib/validation/vendorSchemas.ts`
- [ ] `migrations/2025-10-24-add-tier3-enum.ts`
- [ ] `migrations/2025-10-24-add-tier-fields.ts`
- [ ] `migrations/2025-10-24-convert-founded-year.ts`
- [ ] `docs/migrations/tier-structure-migration-guide.md`
- [ ] `app/api/vendors/[slug]/route.ts`
- [ ] `__tests__/services/TierValidationService.test.ts`
- [ ] `__tests__/services/VendorComputedFieldsService.test.ts`
- [ ] `__tests__/services/VendorProfileService.test.ts`
- [ ] `__tests__/api/portal/vendors-get.test.ts`
- [ ] `__tests__/api/portal/vendors-put.test.ts`
- [ ] `__tests__/api/vendors-public.test.ts`
- [ ] `__tests__/integration/backend-full-suite.test.ts`
- [ ] `__tests__/integration/tier-validation-e2e.test.ts`
- [ ] `docs/testing/backend-integration-report.md`

### Modified Files (Must Update)
- [ ] `payload/collections/Vendors.ts` - Add 40+ fields
- [ ] `app/api/portal/vendors/[id]/route.ts` - Add GET/PUT handlers
- [ ] `lib/types.ts` - Add tier-related types (or new lib/types/tier.ts)
- [ ] `payload-types.ts` - Auto-regenerated
- [ ] `lib/types/api.ts` - Add API types (if not exists, create)

---

## Parallel Execution Plan

### Sequential Phase (Tasks 1-4)
Execute in strict order:
1. TEST-BACKEND-SCHEMA (1.5h)
2. IMPL-BACKEND-SCHEMA (3h)
3. IMPL-BACKEND-MIGRATIONS (1h)
4. IMPL-BACKEND-SERVICES (2.5h)

**Total Sequential Time**: 8 hours

### Parallel Phase (Tasks 5-7)
After Task 4 completes, launch 3 parallel agents:
- Agent A: IMPL-BACKEND-API-GET (1.5h)
- Agent B: IMPL-BACKEND-API-PUT (2h)
- Agent C: IMPL-BACKEND-API-PUBLIC (1.5h)

**Parallel Time**: 2 hours (longest task)

### Final Phase (Task 8)
After tasks 5-7 all complete:
- TEST-BACKEND-INTEGRATION (2h)

**Total Phase 2 Time**: 8h + 2h + 2h = 12 hours (vs 16.5h sequential = 4.5h saved)

---

## Success Criteria Summary

### Phase 2 Complete When:
- [ ] All 8 tasks marked complete in tasks.md and individual task files
- [ ] All 40+ tier fields added to Vendors collection
- [ ] 3 backend services fully implemented and tested
- [ ] 3 API endpoints functional (GET portal, PUT portal, GET public)
- [ ] Backend test suite passing with ≥80% coverage
- [ ] All deliverable files created and verified
- [ ] Integration points validated
- [ ] No breaking changes to existing functionality

---

Generated: 2025-10-24
Status: READY FOR EXECUTION
