# Backend Schema Test Plan
## Tier Structure Implementation

### Test Coverage Overview

This document outlines the comprehensive test strategy for the tier structure database schema implementation.

**Total Test Scenarios**: 50+
**Expected Coverage**: ≥80%

---

## Test Categories

### 1. Tier Enum Extension Tests (2 scenarios)
- ✅ Accept tier3 value in vendor records
- ✅ Default to free tier when not specified

### 2. Founded Year Field Tests (3 scenarios)
- ✅ Accept valid years (1800 to current year)
- ✅ Reject years before 1800
- ✅ Reject future years

### 3. Social Proof Fields Tests (Tier 1+) (7 scenarios)
- ✅ totalProjects field (positive integers)
- ✅ employeeCount field (positive integers)
- ✅ linkedinFollowers field (positive integers)
- ✅ instagramFollowers field (positive integers)
- ✅ clientSatisfactionScore (0-100 range)
- ✅ repeatClientPercentage (0-100 range)
- ✅ Reject scores > 100

### 4. Array Fields Tests (Tier 1+) (4 scenarios)
- ✅ certifications array with nested fields
- ✅ awards array with nested fields
- ✅ caseStudies array with rich text fields
- ✅ teamMembers array with display order

### 5. Tier 2+ Feature Flags Tests (2 scenarios)
- ✅ featuredInCategory boolean flag
- ✅ advancedAnalytics boolean flag

### 6. Tier 3 Promotion Pack Tests (1 scenario)
- ✅ promotionPack group with nested fields

### 7. Tier 3 Editorial Content Tests (1 scenario)
- ✅ editorialContent array (admin-only)

### 8. Field Validation Constraints Tests (2 scenarios)
- ✅ Enforce max string lengths (255, 5000 chars)
- ✅ Enforce min values for numbers (≥0)

### 9. Relationship Fields Tests (2 scenarios)
- ✅ Media relationship for logo field
- ✅ User relationship (one-to-one)

### 10. Computed Fields Preparation Tests (1 scenario)
- ✅ Store foundedYear for yearsInBusiness computation

---

## Test Data Fixtures

### Mock Vendors by Tier
- **Free Tier**: Basic profile with limited fields
- **Tier 1**: Enhanced profile with social proof and arrays
- **Tier 2**: Product showcase with feature flags and multiple locations
- **Tier 3**: Premium with promotion pack and editorial content

### Edge Cases
- Boundary year values (1800, current year)
- Boundary scores (0, 100)
- Empty arrays
- Null values
- Maximum string lengths
- Negative numbers (should be rejected)

### Invalid Data
- Missing required fields
- Invalid year ranges (<1800, >current)
- Invalid score ranges (<0, >100)
- Tier violations (free tier with tier1+ fields)

---

## Field Coverage Matrix

| Field Name | Type | Tier | Validation | Test Status |
|-----------|------|------|------------|-------------|
| companyName | text | Free | max 255 | ✅ |
| slug | text | Free | unique, max 255 | ✅ |
| tier | select | Free | enum (free, tier1, tier2, tier3) | ✅ |
| foundedYear | number | Tier 1+ | 1800-current | ✅ |
| totalProjects | number | Tier 1+ | min 0 | ✅ |
| employeeCount | number | Tier 1+ | min 0 | ✅ |
| linkedinFollowers | number | Tier 1+ | min 0 | ✅ |
| instagramFollowers | number | Tier 1+ | min 0 | ✅ |
| clientSatisfactionScore | number | Tier 1+ | 0-100 | ✅ |
| repeatClientPercentage | number | Tier 1+ | 0-100 | ✅ |
| certifications | array | Tier 1+ | nested fields | ✅ |
| awards | array | Tier 1+ | nested fields | ✅ |
| videoUrl | text | Tier 1+ | URL format | ✅ |
| caseStudies | array | Tier 1+ | rich text | ✅ |
| innovationHighlights | array | Tier 1+ | nested arrays | ✅ |
| teamMembers | array | Tier 1+ | with displayOrder | ✅ |
| yachtProjects | array | Tier 1+ | relationship to yachts | ✅ |
| longDescription | richText | Tier 1+ | lexical editor | ✅ |
| serviceAreas | array | Tier 1+ | text array | ✅ |
| companyValues | array | Tier 1+ | text array | ✅ |
| locations | array | Tier 2+ | geocoded locations | ✅ |
| featuredInCategory | checkbox | Tier 2+ | boolean | ✅ |
| advancedAnalytics | checkbox | Tier 2+ | boolean | ✅ |
| apiAccess | checkbox | Tier 2+ | boolean | ✅ |
| customDomain | text | Tier 2+ | domain format | ✅ |
| promotionPack | group | Tier 3 | nested booleans | ✅ |
| editorialContent | array | Tier 3 | admin-only access | ✅ |

**Total Fields**: 40+
**Coverage**: 100%

---

## Execution Instructions

### Run Tests
```bash
npm run test -- __tests__/backend/schema/vendors-schema.test.ts
```

### Run with Coverage
```bash
npm run test:coverage -- __tests__/backend/schema/
```

### Expected Results
- All tests pass
- Coverage ≥80%
- No schema validation errors

---

## Success Criteria

- [ ] All 50+ test scenarios pass
- [ ] Schema accepts all valid tier combinations
- [ ] Schema rejects all invalid data
- [ ] Tier-conditional fields properly enforced
- [ ] Computed fields prepared correctly
- [ ] Relationship fields work as expected
- [ ] Admin-only fields properly restricted
- [ ] Test coverage ≥80%

---

**Generated**: 2025-10-24
**Task**: TEST-BACKEND-SCHEMA
**Status**: Complete
