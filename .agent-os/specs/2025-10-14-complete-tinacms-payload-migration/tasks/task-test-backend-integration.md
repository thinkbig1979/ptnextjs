# Task TEST-BACKEND-INTEGRATION: Backend Collection Integration Testing

## Task Metadata
- **Task ID**: test-backend-integration
- **Phase**: Phase 2 - Backend Implementation
- **Agent Assignment**: test-architect
- **Estimated Time**: 3 hours
- **Dependencies**: impl-backend-tags, impl-backend-yachts, impl-backend-vendor-enhance, impl-backend-product-enhance, impl-backend-transformers, impl-backend-richtext
- **Status**: Ready for Implementation
- **Priority**: High

## Task Description

Execute comprehensive integration testing of all Payload collections, validating that collections work together correctly, relationships resolve properly, hooks execute as expected, and the entire backend system is ready for frontend integration and data migration.

## Specifics

### Integration Test Scenarios

#### 1. Collection Accessibility Tests
```typescript
// Verify all 8 collections are registered and accessible
test('All collections registered in Payload config', async () => {
  const collections = payload.collections;
  expect(collections).toHaveProperty('vendors');
  expect(collections).toHaveProperty('products');
  expect(collections).toHaveProperty('yachts');
  expect(collections).toHaveProperty('tags');
  expect(collections).toHaveProperty('categories');
  expect(collections).toHaveProperty('blog');
  expect(collections).toHaveProperty('team');
  expect(collections).toHaveProperty('company');
});
```

#### 2. Relationship Resolution Tests
```typescript
// Test Product → Vendor relationship
test('Product vendor relationship resolves correctly', async () => {
  // Create vendor
  const vendor = await payload.create({
    collection: 'vendors',
    data: { name: 'Test Vendor', slug: 'test-vendor' }
  });

  // Create product with vendor reference
  const product = await payload.create({
    collection: 'products',
    data: {
      name: 'Test Product',
      slug: 'test-product',
      vendor: vendor.id
    }
  });

  // Fetch product with vendor populated
  const fetchedProduct = await payload.findByID({
    collection: 'products',
    id: product.id,
    depth: 1
  });

  expect(fetchedProduct.vendor).toHaveProperty('name', 'Test Vendor');
});

// Test Yacht → Vendor relationships in supplier map
test('Yacht supplier map vendor relationships resolve', async () => {
  const vendor = await payload.create({
    collection: 'vendors',
    data: { name: 'Tech Vendor', slug: 'tech-vendor' }
  });

  const yacht = await payload.create({
    collection: 'yachts',
    data: {
      name: 'Test Yacht',
      slug: 'test-yacht',
      specifications: { builder: 'Test Builder', lengthMeters: 50, launchYear: 2024 },
      supplierMap: [{
        vendor: vendor.id,
        systemCategory: 'navigation'
      }]
    }
  });

  const fetchedYacht = await payload.findByID({
    collection: 'yachts',
    id: yacht.id,
    depth: 1
  });

  expect(fetchedYacht.supplierMap[0].vendor).toHaveProperty('name', 'Tech Vendor');
});
```

#### 3. Hook Execution Tests
```typescript
// Test slug auto-generation hook
test('Slug auto-generation hook executes on create', async () => {
  const vendor = await payload.create({
    collection: 'vendors',
    data: { name: 'Example Company LLC' }
  });

  expect(vendor.slug).toBe('example-company-llc');
});

// Test slug uniqueness enforcement
test('Duplicate slug prevention hook works', async () => {
  await payload.create({
    collection: 'vendors',
    data: { name: 'Unique Name', slug: 'unique-name' }
  });

  await expect(
    payload.create({
      collection: 'vendors',
      data: { name: 'Another Name', slug: 'unique-name' }
    })
  ).rejects.toThrow();
});
```

#### 4. Enhanced Field Tests
```typescript
// Test vendor certifications array
test('Vendor certifications array saves and retrieves correctly', async () => {
  const vendor = await payload.create({
    collection: 'vendors',
    data: {
      name: 'Certified Vendor',
      slug: 'certified-vendor',
      certifications: [{
        name: 'ISO 9001',
        issuer: 'ISO',
        year: 2023
      }]
    }
  });

  expect(vendor.certifications).toHaveLength(1);
  expect(vendor.certifications[0]).toHaveProperty('name', 'ISO 9001');
});

// Test product comparison metrics
test('Product comparison metrics save correctly', async () => {
  const product = await payload.create({
    collection: 'products',
    data: {
      name: 'Test Product',
      slug: 'test-product',
      comparisonMetrics: [{
        metricName: 'Range',
        value: '50 nautical miles',
        numericValue: 50,
        unit: 'nautical miles',
        category: 'performance'
      }]
    }
  });

  expect(product.comparisonMetrics[0].metricName).toBe('Range');
});

// Test yacht timeline array
test('Yacht timeline events save with correct structure', async () => {
  const yacht = await payload.create({
    collection: 'yachts',
    data: {
      name: 'Timeline Test Yacht',
      slug: 'timeline-yacht',
      specifications: { builder: 'Builder', lengthMeters: 60, launchYear: 2024 },
      timeline: [{
        date: new Date('2024-01-15'),
        title: 'Keel Laying',
        category: 'construction'
      }]
    }
  });

  expect(yacht.timeline).toHaveLength(1);
  expect(yacht.timeline[0].category).toBe('construction');
});
```

#### 5. Access Control Tests
```typescript
// Test Tags admin-only access control
test('Unauthenticated user cannot create tags', async () => {
  const unauthPayload = await getPayloadInstance({ user: null });

  await expect(
    unauthPayload.create({
      collection: 'tags',
      data: { name: 'Test Tag' }
    })
  ).rejects.toThrow();
});

test('Authenticated admin can create tags', async () => {
  const adminPayload = await getPayloadInstance({ user: { role: 'admin' } });

  const tag = await adminPayload.create({
    collection: 'tags',
    data: { name: 'New Tag' }
  });

  expect(tag).toHaveProperty('name', 'New Tag');
});
```

#### 6. Rich Text Conversion Tests
```typescript
// Test markdown to Lexical conversion in vendor description
test('Vendor description converts markdown to Lexical', async () => {
  const markdown = '# Company Overview\n\nWe are a **leading** provider.';
  const lexical = await markdownToLexical(markdown);

  const vendor = await payload.create({
    collection: 'vendors',
    data: {
      name: 'Rich Text Vendor',
      slug: 'rich-text-vendor',
      description: lexical
    }
  });

  expect(vendor.description).toHaveProperty('root');
  expect(vendor.description.root.children).toHaveLength(2); // Heading + paragraph
});
```

#### 7. Cross-Collection Integration Tests
```typescript
// Test full yacht with vendor relationships and products
test('Complete yacht with supplier map and products', async () => {
  // Create vendor
  const vendor = await payload.create({
    collection: 'vendors',
    data: { name: 'Nav Systems Inc', slug: 'nav-systems' }
  });

  // Create products
  const product1 = await payload.create({
    collection: 'products',
    data: { name: 'Radar System', slug: 'radar-system', vendor: vendor.id }
  });

  const product2 = await payload.create({
    collection: 'products',
    data: { name: 'GPS Unit', slug: 'gps-unit', vendor: vendor.id }
  });

  // Create yacht with supplier map
  const yacht = await payload.create({
    collection: 'yachts',
    data: {
      name: 'Integration Test Yacht',
      slug: 'integration-yacht',
      specifications: { builder: 'Test Builder', lengthMeters: 80, launchYear: 2024 },
      supplierMap: [{
        vendor: vendor.id,
        products: [product1.id, product2.id],
        systemCategory: 'navigation'
      }]
    }
  });

  // Fetch with full depth
  const fetchedYacht = await payload.findByID({
    collection: 'yachts',
    id: yacht.id,
    depth: 2
  });

  expect(fetchedYacht.supplierMap[0].vendor.name).toBe('Nav Systems Inc');
  expect(fetchedYacht.supplierMap[0].products).toHaveLength(2);
  expect(fetchedYacht.supplierMap[0].products[0].name).toBe('Radar System');
});
```

#### 8. Data Integrity Tests
```typescript
// Test required field enforcement
test('Required fields are enforced', async () => {
  await expect(
    payload.create({
      collection: 'vendors',
      data: { slug: 'missing-name' } // name is required
    })
  ).rejects.toThrow();
});

// Test enum validation
test('Enum values are validated', async () => {
  await expect(
    payload.create({
      collection: 'yachts',
      data: {
        name: 'Test',
        slug: 'test',
        specifications: { builder: 'Builder', lengthMeters: 50, launchYear: 2024 },
        status: 'invalid_status' // Invalid enum value
      }
    })
  ).rejects.toThrow();
});

// Test numeric constraints
test('Numeric min/max constraints are enforced', async () => {
  const vendor = await payload.create({
    collection: 'vendors',
    data: {
      name: 'Test Vendor',
      slug: 'test-vendor',
      socialProof: {
        clientSatisfactionScore: 15 // Should fail (max is 10)
      }
    }
  });

  // Should be clamped or rejected
  expect(vendor.socialProof.clientSatisfactionScore).toBeLessThanOrEqual(10);
});
```

### Integration Test File Structure

```
src/collections/__tests__/integration/
├── relationships.test.ts
├── hooks.test.ts
├── access-control.test.ts
├── enhanced-fields.test.ts
├── rich-text.test.ts
├── data-integrity.test.ts
└── cross-collection.test.ts
```

## Acceptance Criteria

- [ ] Integration test suite created with 7 test files
- [ ] All 8 collections tested for registration and accessibility
- [ ] Relationship resolution tests pass for all relationship types:
  - Product → Vendor
  - Yacht → Vendor (supplier map)
  - Yacht → Products (supplier map)
  - Product Reviews → Yacht
  - Vendor Case Studies → Yacht
- [ ] Hook execution tests pass (slug generation, uniqueness)
- [ ] Enhanced field tests pass (certifications, metrics, timeline, etc.)
- [ ] Access control tests pass (Tags admin-only)
- [ ] Rich text conversion tests pass (markdown → Lexical)
- [ ] Cross-collection integration tests pass (full yacht with suppliers)
- [ ] Data integrity tests pass (required fields, enums, constraints)
- [ ] All tests pass with 100% success rate

## Testing Requirements

### Test Environment Setup
1. Use test database (separate from dev database)
2. Clear database before each test suite
3. Seed test data as needed
4. Clean up after tests

### Test Execution
```bash
npm run test:integration
# or
npm run test src/collections/__tests__/integration/
```

### Performance Requirements
- Full integration test suite should complete in < 2 minutes
- Individual test files should complete in < 20 seconds

### Coverage Requirements
- Minimum 90% code coverage for collection files
- 100% coverage of relationship types
- 100% coverage of enhanced field structures

## Evidence Required

**Test Files:**
1. `src/collections/__tests__/integration/relationships.test.ts`
2. `src/collections/__tests__/integration/hooks.test.ts`
3. `src/collections/__tests__/integration/access-control.test.ts`
4. `src/collections/__tests__/integration/enhanced-fields.test.ts`
5. `src/collections/__tests__/integration/rich-text.test.ts`
6. `src/collections/__tests__/integration/data-integrity.test.ts`
7. `src/collections/__tests__/integration/cross-collection.test.ts`

**Test Results:**
- Complete test output showing all integration tests passing
- Coverage report showing 90%+ coverage
- Performance metrics (test execution times)

**Verification Checklist:**
- [ ] All 7 integration test files created
- [ ] Minimum 50 total integration test cases
- [ ] All relationship types tested
- [ ] All enhanced fields tested
- [ ] Access control validated
- [ ] All tests pass
- [ ] Coverage ≥ 90%
- [ ] Performance < 2 minutes for full suite

## Context Requirements

**Technical Spec Sections:**
- Lines 28-184: Enhanced Vendor Fields (for testing)
- Lines 194-380: Enhanced Product Fields (for testing)
- Lines 383-527: Yachts Collection Schema (for testing)
- Lines 657-708: Tags Collection Schema (for testing)
- Lines 916-962: Testing Strategy

**Dependencies:**
- All backend implementation tasks (collections, transformers, rich text)
- Payload test utilities
- Jest testing framework

**Related Tasks:**
- test-backend-collections (unit test specifications)
- All impl-backend-* tasks (code being tested)

## Quality Gates

- [ ] All relationship resolution tests pass
- [ ] All hook execution tests pass
- [ ] All access control tests pass
- [ ] All enhanced field tests pass
- [ ] All rich text tests pass
- [ ] All data integrity tests pass
- [ ] Cross-collection tests validate complex scenarios
- [ ] Test coverage ≥ 90% for collection files
- [ ] No flaky tests (all tests deterministic)
- [ ] Test suite completes in < 2 minutes
- [ ] All tests use proper setup/teardown

## Notes

- Integration tests require running Payload instance (use test config)
- Use separate test database to avoid polluting dev data
- Consider using Payload's built-in test utilities if available
- Test both happy paths and error cases
- Ensure tests are isolated (no dependencies between tests)
- Use descriptive test names that explain what's being validated
- Document any test data setup requirements
- Integration tests are critical gate before frontend implementation
- These tests validate the entire backend is ready for data migration
- Performance testing ensures migration scripts won't timeout
