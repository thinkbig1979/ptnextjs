# Backend Schema Tests - Test Specification

**Feature**: Tier Structure Implementation - Database Schema
**Test Suite**: Backend Schema Validation
**Coverage Target**: 100% of schema fields and constraints

---

## Overview

This document specifies comprehensive tests for the Vendors collection schema extensions, covering all 40+ new tier-specific fields, validation constraints, conditional visibility, and database migrations.

---

## Test Categories

### 1. Scalar Field Tests

**Objective**: Validate all non-array fields with proper type checking and constraints

#### 1.1 Founded Year Field
- **Field**: `foundedYear`
- **Type**: number
- **Constraints**: 1800 ≤ value ≤ current year
- **Tier Access**: Tier 1+

**Test Cases**:
```typescript
describe('foundedYear field', () => {
  test('accepts valid founded year (2010)', () => {
    expect(validateFoundedYear(2010)).toBe(true);
  });

  test('rejects founded year below 1800', () => {
    expect(validateFoundedYear(1799)).toBe(false);
  });

  test('rejects founded year above current year', () => {
    const futureYear = new Date().getFullYear() + 1;
    expect(validateFoundedYear(futureYear)).toBe(false);
  });

  test('accepts null for Free tier vendors', () => {
    expect(validateFoundedYear(null, 'free')).toBe(true);
  });

  test('accepts edge case: founded in 1800', () => {
    expect(validateFoundedYear(1800)).toBe(true);
  });

  test('accepts edge case: founded in current year', () => {
    const currentYear = new Date().getFullYear();
    expect(validateFoundedYear(currentYear)).toBe(true);
  });
});
```

#### 1.2 Social Proof Fields
- **Fields**: `totalProjects`, `employeeCount`, `linkedinFollowers`, `instagramFollowers`
- **Type**: number
- **Constraints**: ≥ 0
- **Tier Access**: Tier 1+

**Test Cases**:
```typescript
describe('social proof fields', () => {
  test('totalProjects accepts zero', () => {
    expect(validateSocialProof({ totalProjects: 0 })).toBe(true);
  });

  test('totalProjects accepts positive numbers', () => {
    expect(validateSocialProof({ totalProjects: 150 })).toBe(true);
  });

  test('totalProjects rejects negative numbers', () => {
    expect(validateSocialProof({ totalProjects: -1 })).toBe(false);
  });

  test('employeeCount validates correctly', () => {
    expect(validateSocialProof({ employeeCount: 50 })).toBe(true);
    expect(validateSocialProof({ employeeCount: -5 })).toBe(false);
  });

  test('follower counts validate correctly', () => {
    expect(validateSocialProof({ linkedinFollowers: 10000 })).toBe(true);
    expect(validateSocialProof({ instagramFollowers: 5000 })).toBe(true);
  });
});
```

#### 1.3 Satisfaction Score Field
- **Field**: `clientSatisfactionScore`
- **Type**: number
- **Constraints**: 0 ≤ value ≤ 100
- **Tier Access**: Tier 1+

**Test Cases**:
```typescript
describe('clientSatisfactionScore field', () => {
  test('accepts score of 0', () => {
    expect(validateSatisfactionScore(0)).toBe(true);
  });

  test('accepts score of 100', () => {
    expect(validateSatisfactionScore(100)).toBe(true);
  });

  test('accepts score in middle range (75)', () => {
    expect(validateSatisfactionScore(75)).toBe(true);
  });

  test('rejects negative score', () => {
    expect(validateSatisfactionScore(-1)).toBe(false);
  });

  test('rejects score above 100', () => {
    expect(validateSatisfactionScore(101)).toBe(false);
  });

  test('rejects decimal scores (requires integer)', () => {
    expect(validateSatisfactionScore(85.5)).toBe(false);
  });
});
```

---

### 2. Array Field Tests

**Objective**: Validate all array fields with proper nested structure

#### 2.1 Certifications Array
- **Field**: `certifications`
- **Type**: array of objects
- **Tier Access**: Tier 1+

**Nested Fields**:
- `name` (string, required)
- `issuingOrganization` (string, required)
- `dateObtained` (string, date format)
- `expiryDate` (string, date format, optional)
- `credentialId` (string, optional)
- `credentialUrl` (string, URL format, optional)

**Test Cases**:
```typescript
describe('certifications array', () => {
  test('accepts empty array', () => {
    expect(validateCertifications([])).toBe(true);
  });

  test('accepts valid certification', () => {
    const cert = {
      name: 'ISO 9001:2015',
      issuingOrganization: 'ISO',
      dateObtained: '2020-06-15',
    };
    expect(validateCertifications([cert])).toBe(true);
  });

  test('rejects certification without required name', () => {
    const cert = {
      issuingOrganization: 'ISO',
      dateObtained: '2020-06-15',
    };
    expect(validateCertifications([cert])).toBe(false);
  });

  test('validates date format for dateObtained', () => {
    const cert = {
      name: 'Cert',
      issuingOrganization: 'Org',
      dateObtained: 'invalid-date',
    };
    expect(validateCertifications([cert])).toBe(false);
  });

  test('validates URL format for credentialUrl', () => {
    const cert = {
      name: 'Cert',
      issuingOrganization: 'Org',
      dateObtained: '2020-01-01',
      credentialUrl: 'not-a-url',
    };
    expect(validateCertifications([cert])).toBe(false);
  });

  test('accepts multiple certifications', () => {
    const certs = [
      { name: 'Cert 1', issuingOrganization: 'Org 1', dateObtained: '2020-01-01' },
      { name: 'Cert 2', issuingOrganization: 'Org 2', dateObtained: '2021-01-01' },
    ];
    expect(validateCertifications(certs)).toBe(true);
  });
});
```

#### 2.2 Awards Array
**Similar structure to certifications with fields: title, awardingOrganization, dateReceived, description**

#### 2.3 Case Studies Array
**Complex nested structure with: title, client, projectDate, description, challenge, solution, results, testimonial, images**

#### 2.4 Team Members Array
**Fields: name, role, bio, photo, linkedinUrl, displayOrder**

#### 2.5 Yacht Projects Array
**Fields: yachtName, yachtLength, projectType, completionYear, description, images**

---

### 3. Tier-Conditional Visibility Tests

**Objective**: Verify fields are only accessible/editable for appropriate tier levels

**Test Matrix**:

| Field Group | Free | Tier 1 | Tier 2 | Tier 3 |
|-------------|------|--------|--------|--------|
| Basic Info | ✓ | ✓ | ✓ | ✓ |
| Founded Year | ✗ | ✓ | ✓ | ✓ |
| Social Proof | ✗ | ✓ | ✓ | ✓ |
| Certifications | ✗ | ✓ | ✓ | ✓ |
| Case Studies | ✗ | ✓ | ✓ | ✓ |
| Featured in Category | ✗ | ✗ | ✓ | ✓ |
| Advanced Analytics | ✗ | ✗ | ✓ | ✓ |
| Promotion Pack | ✗ | ✗ | ✗ | ✓ |
| Editorial Content | ✗ | ✗ | ✗ | ✓ (admin) |

**Test Cases**:
```typescript
describe('tier-conditional field access', () => {
  test('Free tier cannot access foundedYear', () => {
    const vendor = { tier: 'free' };
    expect(canAccessField(vendor, 'foundedYear')).toBe(false);
  });

  test('Tier 1 can access foundedYear', () => {
    const vendor = { tier: 'tier1' };
    expect(canAccessField(vendor, 'foundedYear')).toBe(true);
  });

  test('Free tier cannot access certifications', () => {
    const vendor = { tier: 'free' };
    expect(canAccessField(vendor, 'certifications')).toBe(false);
  });

  test('Tier 1 cannot access featuredInCategory', () => {
    const vendor = { tier: 'tier1' };
    expect(canAccessField(vendor, 'featuredInCategory')).toBe(false);
  });

  test('Tier 2 can access featuredInCategory', () => {
    const vendor = { tier: 'tier2' };
    expect(canAccessField(vendor, 'featuredInCategory')).toBe(true);
  });

  test('Tier 2 cannot access promotionPack', () => {
    const vendor = { tier: 'tier2' };
    expect(canAccessField(vendor, 'promotionPack')).toBe(false);
  });

  test('Tier 3 can access promotionPack', () => {
    const vendor = { tier: 'tier3' };
    expect(canAccessField(vendor, 'promotionPack')).toBe(true);
  });

  test('Non-admin cannot access editorialContent', () => {
    const vendor = { tier: 'tier3' };
    const user = { role: 'vendor' };
    expect(canAccessField(vendor, 'editorialContent', user)).toBe(false);
  });

  test('Admin can access editorialContent', () => {
    const vendor = { tier: 'tier3' };
    const user = { role: 'admin' };
    expect(canAccessField(vendor, 'editorialContent', user)).toBe(true);
  });
});
```

---

### 4. Field Validation Constraint Tests

**Objective**: Ensure all validation rules are enforced server-side

#### 4.1 Date Validations
```typescript
describe('date field validations', () => {
  test('accepts ISO date format (YYYY-MM-DD)', () => {
    expect(validateDate('2023-12-25')).toBe(true);
  });

  test('rejects invalid date format', () => {
    expect(validateDate('25/12/2023')).toBe(false);
  });

  test('rejects non-existent date', () => {
    expect(validateDate('2023-02-30')).toBe(false);
  });
});
```

#### 4.2 URL Validations
```typescript
describe('URL field validations', () => {
  test('accepts valid HTTPS URL', () => {
    expect(validateUrl('https://example.com')).toBe(true);
  });

  test('accepts valid HTTP URL', () => {
    expect(validateUrl('http://example.com')).toBe(true);
  });

  test('rejects invalid URL', () => {
    expect(validateUrl('not-a-url')).toBe(false);
  });

  test('rejects malformed URL', () => {
    expect(validateUrl('http:/example.com')).toBe(false);
  });
});
```

#### 4.3 String Length Validations
```typescript
describe('string length validations', () => {
  test('description field accepts max length', () => {
    const longDescription = 'a'.repeat(5000);
    expect(validateDescription(longDescription)).toBe(true);
  });

  test('description field rejects over max length', () => {
    const tooLong = 'a'.repeat(10001);
    expect(validateDescription(tooLong)).toBe(false);
  });
});
```

---

### 5. Database Migration Tests

**Objective**: Ensure migrations run without data loss and are reversible

#### 5.1 foundedYear Migration Test
```typescript
describe('foundedYear migration', () => {
  test('converts yearsInBusiness to foundedYear', async () => {
    // Setup: Create vendor with yearsInBusiness = 15
    const vendor = await createVendor({ yearsInBusiness: 15 });

    // Run migration
    await runMigration('2025-10-24-convert-founded-year');

    // Verify: foundedYear should be currentYear - 15
    const updated = await getVendor(vendor.id);
    const expectedYear = new Date().getFullYear() - 15;
    expect(updated.foundedYear).toBe(expectedYear);
  });

  test('skips invalid yearsInBusiness values', async () => {
    const vendor = await createVendor({ yearsInBusiness: 500 }); // Invalid: too old

    await runMigration('2025-10-24-convert-founded-year');

    const updated = await getVendor(vendor.id);
    expect(updated.foundedYear).toBeNull(); // Should skip invalid data
  });

  test('rollback migration restores yearsInBusiness', async () => {
    const vendor = await createVendor({ foundedYear: 2010 });

    await rollbackMigration('2025-10-24-convert-founded-year');

    const updated = await getVendor(vendor.id);
    expect(updated.yearsInBusiness).toBe(new Date().getFullYear() - 2010);
    expect(updated.foundedYear).toBeNull();
  });

  test('migration is idempotent (can run multiple times)', async () => {
    const vendor = await createVendor({ yearsInBusiness: 10 });

    await runMigration('2025-10-24-convert-founded-year');
    const firstRun = await getVendor(vendor.id);

    await runMigration('2025-10-24-convert-founded-year');
    const secondRun = await getVendor(vendor.id);

    expect(firstRun.foundedYear).toBe(secondRun.foundedYear);
  });
});
```

#### 5.2 Tier 3 Schema Addition Test
```typescript
describe('tier 3 schema migration', () => {
  test('adds tier3 option to enum', async () => {
    await runMigration('2025-10-24-add-tier3-enum');

    const tierOptions = await getTierEnumValues();
    expect(tierOptions).toContain('tier3');
  });

  test('existing vendors retain their tier', async () => {
    const vendors = await getAllVendors();
    const originalTiers = vendors.map(v => ({ id: v.id, tier: v.tier }));

    await runMigration('2025-10-24-add-tier3-enum');

    const updated = await getAllVendors();
    originalTiers.forEach(original => {
      const updatedVendor = updated.find(v => v.id === original.id);
      expect(updatedVendor.tier).toBe(original.tier);
    });
  });

  test('allows setting vendor to tier3', async () => {
    await runMigration('2025-10-24-add-tier3-enum');

    const vendor = await createVendor({ tier: 'tier3' });
    expect(vendor.tier).toBe('tier3');
  });
});
```

---

### 6. Foreign Key Relationship Tests

**Objective**: Validate relationships between collections are properly defined

```typescript
describe('foreign key relationships', () => {
  test('vendor relationships to users collection', async () => {
    const user = await createUser({ email: 'vendor@example.com' });
    const vendor = await createVendor({ user: user.id });

    expect(vendor.user).toBe(user.id);
  });

  test('cascade delete on vendor deletion', async () => {
    const vendor = await createVendor({});
    await vendor.certifications.create({ name: 'Test Cert', issuingOrganization: 'Org' });

    await deleteVendor(vendor.id);

    const certs = await getCertificationsByVendorId(vendor.id);
    expect(certs).toHaveLength(0); // Should be deleted
  });

  test('category relationships work correctly', async () => {
    const category = await createCategory({ name: 'Marine Electronics' });
    const vendor = await createVendor({ categories: [category.id] });

    const vendorWithRelations = await getVendorWithRelations(vendor.id);
    expect(vendorWithRelations.categories).toContainEqual(expect.objectContaining({ id: category.id }));
  });
});
```

---

### 7. Admin-Only Access Control Tests

**Objective**: Ensure admin-only fields cannot be modified by non-admins

```typescript
describe('admin-only field access', () => {
  test('vendor cannot modify tier field', async () => {
    const vendor = await createVendorUser();

    const result = await updateVendor(vendor.id, { tier: 'tier3' }, vendor.user);

    expect(result.error).toBe('ACCESS_DENIED');
    expect(result.field).toBe('tier');
  });

  test('admin can modify tier field', async () => {
    const vendor = await createVendor({ tier: 'tier1' });
    const admin = await createAdminUser();

    const result = await updateVendor(vendor.id, { tier: 'tier3' }, admin);

    expect(result.success).toBe(true);
    expect(result.vendor.tier).toBe('tier3');
  });

  test('vendor cannot modify editorialContent', async () => {
    const vendor = await createVendor({ tier: 'tier3' });

    const result = await updateVendor(
      vendor.id,
      { editorialContent: [{ title: 'Test' }] },
      vendor.user
    );

    expect(result.error).toBe('ACCESS_DENIED');
  });

  test('admin can modify editorialContent', async () => {
    const vendor = await createVendor({ tier: 'tier3' });
    const admin = await createAdminUser();

    const result = await updateVendor(
      vendor.id,
      { editorialContent: [{ title: 'Test Article' }] },
      admin
    );

    expect(result.success).toBe(true);
  });
});
```

---

## Test Coverage Plan

### Coverage by Field Category

| Category | Fields Count | Test Cases | Coverage Target |
|----------|--------------|------------|-----------------|
| Scalar Fields | 15 | 45 | 100% |
| Array Fields | 12 | 60 | 100% |
| Tier Visibility | 40+ | 32 | 100% |
| Validations | 20+ | 40 | 100% |
| Migrations | 3 | 12 | 100% |
| Access Control | 5 | 10 | 100% |
| **TOTAL** | **40+** | **199** | **100%** |

### Test Execution Order

1. **Unit Tests**: Field validations and constraints (no database)
2. **Schema Tests**: Payload CMS collection configuration
3. **Migration Tests**: Database schema changes (requires test DB)
4. **Integration Tests**: Full CRUD with access control (requires test DB)

---

## Test Data Requirements

### Mock Data Fixtures
- ✓ Free tier vendor (basic fields only)
- ✓ Tier 1 vendor (with all tier1 fields)
- ✓ Tier 2 vendor (with tier2 features)
- ✓ Tier 3 vendor (with promotionPack and editorialContent)
- ✓ Edge cases (invalid years, null values, boundary conditions)

### Test Database
- Clean database for each test suite
- Seed data for relationship tests
- Rollback after each test

---

## Success Criteria

### Schema Tests Pass When:
- [ ] All 40+ fields validate correctly
- [ ] All tier-conditional visibility rules enforced
- [ ] All validation constraints pass
- [ ] All migrations run without errors
- [ ] All migrations are reversible
- [ ] All foreign key relationships work
- [ ] All admin-only access controls enforced
- [ ] 100% test coverage achieved
- [ ] Zero regressions in existing vendor functionality

---

## Next Steps

1. Implement test files based on this specification
2. Run tests against Payload CMS schema
3. Verify all edge cases covered
4. Document any discovered gaps
5. Integrate into CI/CD pipeline

---

**Document Status**: APPROVED FOR IMPLEMENTATION
**Last Updated**: 2025-10-24
**Author**: Task Orchestrator - Backend Test Architect
