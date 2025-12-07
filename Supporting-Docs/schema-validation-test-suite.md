# Schema Validation Test Suite - Implementation Report

## Overview

Created a comprehensive automated test suite that validates frontend Zod schemas match backend Payload CMS schemas. This is a **PREVENTIVE** measure to catch schema drift automatically.

## Test Suite Location

```
__tests__/integration/schema-validation/schema-sync.test.ts
```

## Collections Covered

### 1. Vendors Collection (Highest Priority)
- ✅ **Basic Info Fields** - companyName, slug, description, logo, contactEmail, contactPhone
- ✅ **Brand Story Fields** - website, social media, foundedYear, social proof metrics
- ✅ **Array Field Structures** - serviceAreas, companyValues (union of string/object)
- ✅ **Certification Schema** - name, issuer, year, optional fields
- ✅ **Award Schema** - title, organization, year, constraints
- ✅ **Case Study Schema** - title, challenge, solution, results, testimony fields
- ✅ **Team Member Schema** - name, role, bio, photo, displayOrder
- ✅ **Location Schema** - address, coordinates, city, country validation
- ✅ **API Vendor Update Schema** - complete field coverage, PATCH semantics

### 2. TierUpgradeRequests Collection
- ⚠️ **No Zod Schema Exists** - documented expected fields for future implementation

### 3. Users Collection
- ⚠️ **No Zod Schema Exists** - documented custom fields that need validation

### 4. Products Collection
- ⚠️ **Not Yet Covered** - planned for future implementation

### 5. ImportHistory Collection
- ⚠️ **Not Yet Covered** - planned for future implementation

## Key Validations Performed

### 1. Field Existence
- Verifies all Payload fields have corresponding Zod validators
- Prevents missing field coverage

### 2. Field Types
- String, number, array, object types match between systems
- Boolean, enum, union types validated

### 3. Array Structures (CRITICAL BUG PREVENTION)
- **serviceAreas** - accepts union of string OR object (prevents 400 errors)
- **companyValues** - accepts union of string OR object (prevents 400 errors)
- **caseStudies.images** - accepts URLs, media IDs, or objects
- **teamMembers.photo** - accepts URLs, media IDs, or objects

### 4. Required Fields
- Validates required constraints match between Payload and Zod
- Identifies optional/nullable field mismatches

### 5. Length Constraints
- maxLength validation (e.g., description: 500, bio: 1000)
- minLength validation (e.g., companyName: 2)
- min/max number ranges (e.g., latitude: -90 to 90)

### 6. Enum Values
- Tier values: ['free', 'tier1', 'tier2', 'tier3']
- Status values: ['pending', 'approved', 'rejected', 'cancelled']
- Request types: ['upgrade', 'downgrade']

## Schema Mismatches Detected

### 1. clientSatisfactionScore Max Value
**Status:** ⚠️ MISMATCH DETECTED

- **Payload CMS:** `max: 10`
- **Zod Schema:** `max: 100`
- **Impact:** Vendors can submit values 11-100 that will be rejected
- **Action Required:** Update Payload CMS Vendors collection to `max: 100`
- **File:** `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts` (line ~469)

### 2. teamMembers.bio maxLength
**Status:** ⚠️ MISMATCH DETECTED

- **Payload CMS:** `maxLength: 2000`
- **Zod Form Schema:** `maxLength: 1000`
- **Zod API Schema:** `maxLength: 2000`
- **Impact:** Form submissions will reject bios between 1001-2000 characters
- **Action Required:** Update `lib/validation/vendorSchemas.ts` teamMemberSchema.bio to `maxLength: 2000`
- **File:** `/home/edwin/development/ptnextjs/lib/validation/vendorSchemas.ts` (line ~147)

## Missing Validation Coverage

### Collections Without Zod Schemas
1. **tier_upgrade_requests** - High priority (admin approval workflow)
2. **users** (custom fields) - Medium priority (registration validation)
3. **products** - Medium priority (vendor product management)
4. **import_history** - Low priority (import tracking)
5. **categories** - Low priority (taxonomy)
6. **tags** - Low priority (taxonomy)
7. **yachts** - Low priority (reference data)
8. **blog_posts** - Low priority (content management)
9. **team_members** - Low priority (company info)

### Recommended Priority Order
1. Create `lib/validation/tier-upgrade-request-schema.ts`
2. Create `lib/validation/user-schema.ts` (for custom fields)
3. Create `lib/validation/product-schema.ts`
4. Create `lib/validation/import-history-schema.ts`

## Test Execution

### Run All Schema Validation Tests
```bash
npm test -- __tests__/integration/schema-validation/schema-sync.test.ts
```

### Run with Watch Mode
```bash
npm test -- --watch __tests__/integration/schema-validation/schema-sync.test.ts
```

### Expected Output
- **Total Tests:** 30+
- **Expected Failures:** 2 (documented mismatches)
- **Expected Warnings:** 3 (missing validation coverage)

## Test Suite Features

### 1. Automated Type Analysis
```typescript
function analyzeZodType(zodType: z.ZodTypeAny): {
  type: string;
  isOptional: boolean;
  isNullable: boolean;
  isArray: boolean;
  arrayItemType?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enumValues?: string[];
}
```

### 2. Schema Shape Extraction
```typescript
function getZodSchemaShape(schema: z.ZodObject<any>): Record<string, z.ZodTypeAny>
```

### 3. Mismatch Detection
- Automatically flags constraint differences
- Documents impact and required actions
- Provides file paths and line numbers

## Integration with Development Workflow

### Pre-Commit Hook
Add to `.git/hooks/pre-commit`:
```bash
npm test -- __tests__/integration/schema-validation/schema-sync.test.ts
```

### CI/CD Pipeline
Add to GitHub Actions / CI workflow:
```yaml
- name: Validate Schema Sync
  run: npm test -- __tests__/integration/schema-validation/schema-sync.test.ts
```

### Test-First Development
When adding new fields:
1. Update `schema-sync.test.ts` with new field expectations
2. Run tests and confirm they FAIL
3. Update Payload CMS collection schema
4. Update Zod validation schema
5. Run tests and confirm they PASS
6. Update TypeScript types in `lib/types.ts`

## Future Enhancements

### 1. Automated Schema Extraction
Create a script to auto-generate Zod schemas from Payload collections:
```typescript
// scripts/generate-zod-from-payload.ts
// Parse Payload collection TypeScript files with AST
// Generate Zod schemas programmatically
// Run as pre-commit hook or CI check
```

**Benefits:**
- Eliminate manual schema synchronization
- Guarantee 100% field coverage
- Auto-detect schema drift
- Reduce human error

### 2. Runtime Schema Validation
Add middleware to validate API requests against Payload schemas at runtime:
```typescript
// middleware/schema-validator.ts
// Compare incoming request against Payload collection schema
// Log mismatches to monitoring service
// Alert on critical validation failures
```

### 3. Schema Version Control
Track schema changes over time:
- Generate schema snapshots on each commit
- Detect breaking changes automatically
- Document migration paths for API consumers

### 4. Visual Schema Diff Tool
Create a web-based tool to visualize schema differences:
- Side-by-side comparison of Payload and Zod schemas
- Highlight mismatches with color coding
- Generate migration scripts automatically

## Known Issues and Workarounds

### Issue 1: Preprocessed Fields
Some Zod fields use `.preprocess()` which makes type analysis complex.

**Workaround:** The test suite unwraps preprocessed types to analyze the inner schema.

### Issue 2: Union Types
Array fields that accept `union([string, object])` require special handling.

**Workaround:** Test both formats to ensure acceptance:
```typescript
const testData1 = { serviceAreas: ['area1', 'area2'] };
const testData2 = { serviceAreas: [{ area: 'Navigation' }] };
```

### Issue 3: Rich Text Fields
Payload uses Lexical editor for rich text, which returns complex objects.

**Workaround:** Zod schemas accept strings for API compatibility, with server-side conversion.

## Documentation References

### Related Files
- `/home/edwin/development/ptnextjs/lib/validation/vendorSchemas.ts` - Form validation schemas
- `/home/edwin/development/ptnextjs/lib/validation/vendor-update-schema.ts` - API validation schema
- `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts` - Payload CMS collection
- `/home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests.ts` - Tier request collection
- `/home/edwin/development/ptnextjs/payload/collections/Users.ts` - User collection
- `/home/edwin/development/ptnextjs/lib/types.ts` - TypeScript type definitions

### Test Files
- `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/vendor-update-schema-contract.test.ts` - API contract tests
- `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/form-to-api-field-mapping.test.ts` - Field mapping tests

## Maintenance

### When to Update Tests
- Adding new fields to Payload collections
- Changing field constraints (maxLength, min, max)
- Modifying required field status
- Adding new collections
- Updating enum values

### Test Maintenance Checklist
- [ ] Add test cases for new fields
- [ ] Update constraint expectations
- [ ] Verify array item types for complex fields
- [ ] Test both required and optional scenarios
- [ ] Document any known mismatches
- [ ] Update this documentation

## Success Metrics

### Before Implementation
- Schema mismatches discovered manually during testing
- 400 errors from array field format issues
- Hours spent debugging validation failures

### After Implementation
- ✅ Automated detection of 2 critical mismatches
- ✅ 30+ test cases covering 100+ individual field constraints
- ✅ Preventive validation for future schema changes
- ✅ Documentation of missing validation coverage

## Conclusion

This test suite provides **comprehensive automated validation** of schema synchronization between frontend and backend. It serves as:

1. **Early Warning System** - Catches drift before production
2. **Documentation** - Living documentation of schema expectations
3. **Quality Gate** - Prevents breaking changes from merging
4. **Development Guide** - Shows developers what needs to be validated

**Next Steps:**
1. Fix the 2 detected mismatches
2. Create Zod schemas for tier_upgrade_requests
3. Create Zod schemas for users (custom fields)
4. Integrate into CI/CD pipeline
5. Consider automated schema generation
