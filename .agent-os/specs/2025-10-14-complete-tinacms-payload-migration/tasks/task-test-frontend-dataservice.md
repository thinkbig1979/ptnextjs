# Task TEST-FRONTEND-DATASERVICE: Design PayloadCMSDataService Test Suite

## Task Metadata
- **Task ID**: test-frontend-dataservice
- **Phase**: Phase 3 - Frontend Implementation
- **Agent Assignment**: test-architect
- **Estimated Time**: 3 hours
- **Dependencies**: pre-1, test-backend-integration
- **Status**: Ready for Implementation
- **Priority**: High

## Task Description

Design comprehensive test suite for the PayloadCMSDataService that will replace TinaCMSDataService. Tests must validate API parity with existing service, verify data transformations, validate caching behavior, and ensure all page-level data requirements are met.

## Specifics

### Test Coverage Requirements

#### 1. API Parity Tests
Verify PayloadCMSDataService implements all TinaCMSDataService methods:

```typescript
// Core vendor methods
test('getVendors() returns all vendors', async () => {});
test('getVendorBySlug() returns single vendor', async () => {});
test('getFeaturedVendors() returns only featured', async () => {});
test('getPartners() returns vendors with partner=true', async () => {});

// Core product methods
test('getProducts() returns all products', async () => {});
test('getProductBySlug() returns single product', async () => {});
test('getProductsByVendor() filters by vendor', async () => {});
test('getFeaturedProducts() returns only featured', async () => {});

// Category methods
test('getCategories() returns all categories', async () => {});
test('getCategoryBySlug() returns single category', async () => {});

// Blog methods
test('getBlogPosts() returns all posts', async () => {});
test('getBlogPostBySlug() returns single post', async () => {});
test('getFeaturedBlogPosts() returns featured posts', async () => {});

// Team methods
test('getTeamMembers() returns all team members', async () => {});
test('getTeamMemberBySlug() returns single member', async () => {});

// Company methods
test('getCompanyInfo() returns company data', async () => {});
```

#### 2. New Methods for Enhanced Collections
```typescript
// Yacht methods (new)
test('getYachts() returns all yachts', async () => {});
test('getYachtBySlug() returns single yacht with relationships', async () => {});
test('getFeaturedYachts() returns only featured', async () => {});
test('getYachtsByVendor() returns yachts where vendor in supplierMap', async () => {});

// Tag methods (new)
test('getTags() returns all tags', async () => {});
test('getTagBySlug() returns single tag', async () => {});
test('getPopularTags() returns tags sorted by usageCount', async () => {});
```

#### 3. Data Transformation Tests
```typescript
// Test Lexical → HTML/React transformation
test('transforms Lexical rich text to displayable format', async () => {
  const vendor = await service.getVendorBySlug('test-vendor');
  expect(vendor.description).toBeTypeOf('string'); // or React element
});

// Test media path transformation
test('transforms Payload media paths to public URLs', async () => {
  const product = await service.getProductBySlug('test-product');
  expect(product.image).toMatch(/^\/uploads\//);
});

// Test reference resolution
test('resolves vendor relationship in products', async () => {
  const product = await service.getProductBySlug('test-product');
  expect(product.vendor).toHaveProperty('name');
  expect(product.vendor).toHaveProperty('slug');
});

// Test enhanced field transformation
test('transforms vendor certifications array correctly', async () => {
  const vendor = await service.getVendorBySlug('certified-vendor');
  expect(vendor.certifications).toBeInstanceOf(Array);
  if (vendor.certifications.length > 0) {
    expect(vendor.certifications[0]).toHaveProperty('name');
    expect(vendor.certifications[0]).toHaveProperty('issuer');
  }
});
```

#### 4. Caching Tests
```typescript
// Test caching behavior (5-minute TTL)
test('caches data for 5 minutes', async () => {
  const start = Date.now();
  const vendors1 = await service.getVendors();
  const time1 = Date.now() - start;

  const vendors2 = await service.getVendors();
  const time2 = Date.now() - start - time1;

  expect(time2).toBeLessThan(time1 / 10); // Second call should be much faster (cached)
});

test('cache expires after 5 minutes', async () => {
  await service.getVendors();
  // Fast-forward time by 6 minutes
  jest.advanceTimersByTime(6 * 60 * 1000);
  // Should refetch
  const vendors = await service.getVendors();
  // Verify fresh data
});

test('cache can be manually cleared', async () => {
  await service.getVendors();
  service.clearCache();
  // Next call should refetch
});
```

#### 5. Error Handling Tests
```typescript
test('handles Payload API errors gracefully', async () => {
  // Mock Payload API failure
  await expect(service.getVendorBySlug('nonexistent')).resolves.toBeNull();
});

test('returns empty array for failed list queries', async () => {
  // Mock Payload API failure
  const vendors = await service.getVendors();
  expect(vendors).toEqual([]);
});

test('logs errors without throwing', async () => {
  const consoleSpy = jest.spyOn(console, 'error');
  await service.getVendorBySlug('error-trigger');
  expect(consoleSpy).toHaveBeenCalled();
});
```

#### 6. Backward Compatibility Tests
```typescript
// Test vendor/partner unification
test('getPartners() includes vendors with partner=true', async () => {
  const partners = await service.getPartners();
  partners.forEach(partner => {
    expect(partner.partner).toBe(true);
  });
});

test('getVendors() returns both partners and non-partners', async () => {
  const vendors = await service.getVendors();
  const hasPartners = vendors.some(v => v.partner === true);
  const hasNonPartners = vendors.some(v => v.partner === false);
  expect(hasPartners && hasNonPartners).toBe(true);
});

// Test legacy field support
test('products have both vendorId and vendorName for backward compatibility', async () => {
  const product = await service.getProductBySlug('test-product');
  expect(product).toHaveProperty('vendorId');
  expect(product).toHaveProperty('vendorName');
  expect(product.vendorName).toBe(product.vendor.name);
});
```

#### 7. Static Generation Compatibility Tests
```typescript
// Test build-time data access
test('all methods work at build time (no client-side dependencies)', async () => {
  // Simulate Next.js build environment
  const vendors = await service.getVendors();
  expect(vendors).toBeDefined();
});

test('data service is singleton (no multiple Payload instances)', async () => {
  const service1 = PayloadCMSDataService.getInstance();
  const service2 = PayloadCMSDataService.getInstance();
  expect(service1).toBe(service2);
});
```

### Test Utilities to Design

```typescript
// Mock Payload client factory
function createMockPayloadClient(data: MockData): PayloadClient {
  // Returns mock Payload client with test data
}

// Test data factories
function createTestVendor(overrides?: Partial<Vendor>): Vendor {}
function createTestProduct(overrides?: Partial<Product>): Product {}
function createTestYacht(overrides?: Partial<Yacht>): Yacht {}

// Assertion helpers
function expectVendorShape(vendor: any): void {
  expect(vendor).toHaveProperty('id');
  expect(vendor).toHaveProperty('name');
  expect(vendor).toHaveProperty('slug');
  // ... all expected fields
}
```

## Acceptance Criteria

- [ ] Test suite design document created with all test specifications
- [ ] API parity tests specified for all TinaCMSDataService methods (15+ methods)
- [ ] New method tests specified for yachts and tags (6+ methods)
- [ ] Data transformation tests specified (4+ scenarios)
- [ ] Caching tests specified (3+ scenarios)
- [ ] Error handling tests specified (3+ scenarios)
- [ ] Backward compatibility tests specified (3+ scenarios)
- [ ] Static generation tests specified (2+ scenarios)
- [ ] Test utilities designed (mock factories, assertions)
- [ ] Minimum 40 total test cases specified

## Testing Requirements

### Test File Structure
```
lib/__tests__/
├── PayloadCMSDataService.test.ts        # Main test file
├── PayloadCMSDataService.caching.test.ts # Caching tests
├── PayloadCMSDataService.transforms.test.ts # Transformation tests
└── utils/
    ├── mockPayload.ts                    # Mock Payload client
    ├── testData.ts                       # Test data factories
    └── assertions.ts                     # Custom assertion helpers
```

### Test Execution Strategy
- Use Jest with TypeScript
- Mock Payload client to avoid database dependency
- Use real transformation logic (don't mock transforms)
- Test with realistic data structures

## Evidence Required

**Design Documents:**
1. `@.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/frontend-test-suite.md`
   - Complete test specifications
   - Test file structure
   - Mock strategy
   - Test execution approach

2. **Test Specification Files:**
   - `tasks/test-specs/dataservice-api-parity.md` - API parity test cases
   - `tasks/test-specs/dataservice-transformations.md` - Transformation test cases
   - `tasks/test-specs/dataservice-caching.md` - Caching test cases
   - `tasks/test-specs/dataservice-compatibility.md` - Backward compatibility tests

## Context Requirements

**Technical Spec Sections:**
- Lines 583-655: Frontend Data Service Architecture
- Lines 877-914: Frontend Page Updates

**Existing Code:**
- `lib/tinacms-data-service.ts` - API to maintain parity with
- `lib/types.ts` - TypeScript interfaces

**Integration Strategy:**
- Reference design from task-pre-1 for transformation patterns

**Related Tasks:**
- All impl-frontend-* tasks (will implement these tests)
- test-backend-integration (backend must be working)

## Quality Gates

- [ ] All TinaCMSDataService methods have parity tests
- [ ] New methods (yachts, tags) have comprehensive tests
- [ ] Caching behavior is fully tested
- [ ] Error handling covers all failure modes
- [ ] Transformation tests cover all rich text and media fields
- [ ] Backward compatibility ensures zero breaking changes
- [ ] Test utilities provide reusable mocks and assertions
- [ ] Test specifications are detailed enough for implementation
- [ ] Minimum 40 test cases specified

## Notes

- Focus on API parity to ensure drop-in replacement capability
- Test actual transformation logic (not just mocked responses)
- Caching tests need timer mocking (jest.useFakeTimers)
- Consider performance benchmarks (cache should be significantly faster)
- Error handling should never throw (always return null or empty array)
- Test with enhanced fields to ensure new data structures work
- Verify singleton pattern prevents multiple Payload connections
- These tests are critical gate before page updates (Phase 3)
- Test suite should run quickly (<30 seconds) for rapid iteration
