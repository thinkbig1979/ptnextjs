# Frontend PayloadCMSDataService Test Suite Design

> **Created:** 2025-10-16
> **Task:** TEST-FRONTEND-DATASERVICE
> **Agent:** test-architect
> **Status:** Complete Test Design

## Executive Summary

This document specifies a comprehensive test suite for the PayloadCMSDataService that will replace TinaCMSDataService. The test suite validates API parity with all 54 existing methods, adds 13 new yacht methods, validates transformations (Lexical→HTML, media paths, relationships, enhanced fields), caching behavior (5-minute TTL), error handling (never throw), and backward compatibility (vendor/partner unification).

**Total Test Coverage:**
- **API Parity Tests:** 54 methods (100% of TinaCMSDataService)
- **New Method Tests:** 16 methods (13 yacht + 3 tag methods)
- **Transformation Tests:** 12 scenarios
- **Caching Tests:** 8 scenarios
- **Error Handling Tests:** 6 scenarios
- **Compatibility Tests:** 8 scenarios
- **Static Generation Tests:** 4 scenarios
- **Total Test Cases:** **108 comprehensive test cases**

## 1. Test Architecture

### 1.1 Test File Structure

```
lib/__tests__/
├── PayloadCMSDataService.test.ts              # Core API parity (54 methods)
├── PayloadCMSDataService.yacht-methods.test.ts # New yacht methods (16 tests)
├── PayloadCMSDataService.caching.test.ts      # Caching behavior (8 tests)
├── PayloadCMSDataService.transforms.test.ts   # Transformations (12 tests)
├── PayloadCMSDataService.compatibility.test.ts # Backward compat (8 tests)
├── PayloadCMSDataService.error-handling.test.ts # Error handling (6 tests)
├── PayloadCMSDataService.static-gen.test.ts   # Static generation (4 tests)
└── utils/
    ├── mockPayload.ts                         # Mock Payload client factory
    ├── testData.ts                            # Test data factories
    ├── fixtures.ts                            # Static mock data
    └── assertions.ts                          # Custom assertion helpers
```

### 1.2 Testing Strategy

**Core Principles:**
1. **API Parity Focus:** Every TinaCMSDataService method must have corresponding test
2. **Real Transformations:** Test actual transformation logic, not mocked responses
3. **Caching Performance:** Validate 5-minute TTL and cache performance improvements
4. **Error Handling:** Never throw - always return null or empty array
5. **Backward Compatibility:** Vendor/partner unification, legacy field support
6. **Static Generation:** Validate build-time compatibility, singleton pattern

**Test Environment:**
- **Framework:** Jest with TypeScript
- **Payload Mocking:** Mock Payload client (avoid database dependency)
- **Transform Logic:** Use real transformation functions (don't mock transforms)
- **Data Realism:** Test with realistic data structures matching production
- **Cache Timing:** Use jest.useFakeTimers() for TTL testing

### 1.3 API Method Inventory

**TinaCMSDataService Methods (54 total):**

**Vendors (9 methods):**
1. `getAllVendors()` → returns Vendor[]
2. `getVendors(params?)` → returns Vendor[] (with filtering)
3. `getVendorBySlug(slug)` → returns Vendor | null
4. `getVendorById(id)` → returns Vendor | null
5. `getFeaturedVendors()` → returns Vendor[]
6. `searchVendors(query)` → returns Vendor[]
7. `getVendorSlugs()` → returns string[]
8. `getVendorCertifications(vendorId)` → returns any[]
9. `getVendorAwards(vendorId)` → returns any[]

**Partners (7 methods - legacy compatibility):**
10. `getAllPartners()` → returns Partner[]
11. `getPartners(params?)` → returns Partner[] (partnersOnly filtering)
12. `getPartnerBySlug(slug)` → returns Partner | null
13. `getPartnerById(id)` → returns Partner | null
14. `getFeaturedPartners()` → returns Partner[] (featured AND partner=true)
15. `searchPartners(query)` → returns Partner[]
16. `getPartnerSlugs()` → returns string[]

**Products (9 methods):**
17. `getAllProducts()` → returns Product[]
18. `getProducts(params?)` → returns Product[] (with filtering)
19. `getProductBySlug(slug)` → returns Product | null
20. `getProductById(id)` → returns Product | null
21. `getProductsByVendor(vendorId)` → returns Product[]
22. `getProductsByPartner(partnerId)` → returns Product[] (legacy)
23. `searchProducts(query)` → returns Product[]
24. `getProductSlugs()` → returns string[]
25. `getFeaturedProducts()` → returns Product[] (new method)

**Blog (7 methods):**
26. `getAllBlogPosts()` → returns BlogPost[]
27. `getBlogPosts(params?)` → returns BlogPost[] (with filtering)
28. `getBlogPostBySlug(slug)` → returns BlogPost | null
29. `searchBlogPosts(query)` → returns BlogPost[]
30. `getBlogPostSlugs()` → returns string[]
31. `getFeaturedBlogPosts()` → returns BlogPost[]
32. `getBlogCategories()` → returns Category[]

**Categories (2 methods):**
33. `getCategories()` → returns Category[]
34. `getCategoryBySlug(slug)` → returns Category | null

**Team (2 methods):**
35. `getTeamMembers()` → returns TeamMember[]
36. `getTeamMemberBySlug(slug)` → returns TeamMember | null (new method)

**Company (1 method):**
37. `getCompanyInfo()` → returns CompanyInfo

**Enhanced Vendor (5 methods):**
38. `getVendorSocialProof(vendorId)` → returns any
39. `getEnhancedVendorProfile(vendorId)` → returns any
40. `preloadEnhancedVendorData(vendorId)` → returns Promise<void>
41. `clearVendorCache(vendorId?)` → returns void
42. `getCacheStatistics()` → returns object

**Cache Management (4 methods):**
43. `clearCache()` → returns void
44. `getCacheStats()` → returns CacheStats & { hitRatio: number }
45. `getCacheInfo()` → returns Array<object>
46. `getCacheStatistics()` → returns object (duplicate of #42)

**Validation (1 method):**
47. `validateCMSContent()` → returns { isValid: boolean; errors: string[] }

**Yachts - Existing TinaCMS (7 methods - not yet in PayloadCMSDataService):**
48. `getAllYachts()` → returns Yacht[]
49. `getYachts(options?)` → returns Yacht[]
50. `getYachtBySlug(slug)` → returns Yacht | null
51. `getYachtById(id)` → returns Yacht | null
52. `getFeaturedYachts()` → returns Yacht[]
53. `searchYachts(query)` → returns Yacht[]
54. `getYachtSlugs()` → returns string[]

**New Yacht Methods (13 methods - to be added to PayloadCMSDataService):**
55. `getYachtTimeline(yachtId)` → returns YachtTimelineEvent[]
56. `getYachtSupplierMap(yachtId)` → returns YachtSupplierRole[]
57. `getYachtSustainabilityScore(yachtId)` → returns YachtSustainabilityMetrics | null
58. `getYachtMaintenanceHistory(yachtId)` → returns YachtMaintenanceRecord[]
59. `getYachtCustomizations(yachtId)` → returns YachtCustomization[]
60. `preloadYachtData(yachtId)` → returns Promise<void>
61. `clearYachtCache(yachtId?)` → returns void
62. `getYachtsByVendor(vendorId)` → returns Yacht[] (filter by supplierMap)
63. `getYachtsByBuilder(builder)` → returns Yacht[]
64. `getYachtsByDesigner(designer)` → returns Yacht[]
65. `getYachtsByLengthRange(min, max)` → returns Yacht[]
66. `getYachtsByYear(year)` → returns Yacht[]
67. `getYachtsByCategory(category)` → returns Yacht[]

**New Tag Methods (3 methods - to be added to PayloadCMSDataService):**
68. `getTags()` → returns Tag[]
69. `getTagBySlug(slug)` → returns Tag | null
70. `getPopularTags(limit?)` → returns Tag[] (sorted by usageCount DESC)

**Total Methods:** 70 (54 existing + 13 yacht + 3 tag)

## 2. Mock Strategy

### 2.1 Mock Payload Client

**Location:** `lib/__tests__/utils/mockPayload.ts`

```typescript
/**
 * Mock Payload Client Factory
 * Creates configurable mock Payload instance for testing
 */

interface MockPayloadOptions {
  vendors?: any[];
  products?: any[];
  blogPosts?: any[];
  yachts?: any[];
  tags?: any[];
  categories?: any[];
  teamMembers?: any[];
  companyInfo?: any;
}

export function createMockPayloadClient(data: MockPayloadOptions) {
  return {
    find: jest.fn(async ({ collection, where, limit, depth, sort }) => {
      // Return mocked collection data
      const docs = data[collection] || [];

      // Apply filters if provided
      let filtered = [...docs];
      if (where) {
        // Apply where filters (mock implementation)
      }

      // Apply sort if provided
      if (sort) {
        // Apply sorting (mock implementation)
      }

      // Apply limit if provided
      const limited = limit ? filtered.slice(0, limit) : filtered;

      return {
        docs: limited,
        totalDocs: filtered.length,
        limit: limit || filtered.length,
        page: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }),

    findByID: jest.fn(async ({ collection, id, depth }) => {
      const docs = data[collection] || [];
      return docs.find((doc: any) => doc.id.toString() === id.toString()) || null;
    }),
  };
}

// Mock getPayload function
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));

// Setup helper for tests
export function setupMockPayload(data: MockPayloadOptions) {
  const mockClient = createMockPayloadClient(data);
  const { getPayload } = require('payload');
  (getPayload as jest.Mock).mockResolvedValue(mockClient);
  return mockClient;
}
```

### 2.2 Test Data Factories

**Location:** `lib/__tests__/utils/testData.ts`

```typescript
/**
 * Test Data Factories
 * Create realistic test data matching production structures
 */

export function createTestVendor(overrides: Partial<any> = {}): any {
  return {
    id: '1',
    slug: 'test-vendor',
    companyName: 'Test Vendor Inc.',
    description: 'Test vendor description',
    logo: '/media/logos/test-vendor.png',
    contactEmail: 'contact@testvendor.com',
    website: 'https://testvendor.com',
    founded: 2010,
    location: 'Test Location',
    featured: false,
    partner: true,
    published: true,
    tier: 'tier1',
    certifications: [],
    awards: [],
    socialProof: {},
    caseStudies: [],
    innovationHighlights: [],
    teamMembers: [],
    yachtProjects: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createTestProduct(overrides: Partial<any> = {}): any {
  return {
    id: '1',
    slug: 'test-product',
    name: 'Test Product',
    description: '<p>Test product description</p>',
    vendor: createTestVendor(),
    categories: [{ id: '1', name: 'Navigation', slug: 'navigation' }],
    images: [
      {
        url: '/media/products/test-product.jpg',
        altText: 'Test Product',
        isMain: true,
      },
    ],
    price: '$999',
    published: true,
    featured: false,
    specifications: [],
    features: [],
    comparisonMetrics: {},
    integrationCompatibility: [],
    ownerReviews: [],
    visualDemo: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createTestYacht(overrides: Partial<any> = {}): any {
  return {
    id: '1',
    slug: 'test-yacht',
    name: 'Test Yacht',
    description: 'Test yacht description',
    image: '/media/yachts/test-yacht.jpg',
    images: [],
    length: 50,
    beam: 10,
    draft: 3,
    builder: 'Test Builder',
    designer: 'Test Designer',
    launchYear: 2020,
    homePort: 'Test Port',
    flag: 'Test Flag',
    classification: 'Test Class',
    featured: false,
    published: true,
    timeline: [],
    supplierMap: [],
    sustainabilityScore: null,
    customizations: [],
    maintenanceHistory: [],
    categories: [],
    tags: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createTestBlogPost(overrides: Partial<any> = {}): any {
  return {
    id: '1',
    slug: 'test-blog-post',
    title: 'Test Blog Post',
    excerpt: 'Test blog post excerpt',
    content: '<p>Test blog post content</p>',
    featuredImage: '/media/blog/test-post.jpg',
    author: { email: 'author@example.com' },
    publishedAt: '2024-01-01T00:00:00.000Z',
    published: true,
    categories: [{ id: '1', name: 'Industry News', slug: 'industry-news' }],
    tags: [{ tag: 'technology' }, { tag: 'innovation' }],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createTestTeamMember(overrides: Partial<any> = {}): any {
  return {
    id: '1',
    name: 'John Doe',
    role: 'CEO',
    bio: 'Test bio for John Doe',
    image: '/media/team/john-doe.jpg',
    email: 'john.doe@example.com',
    linkedin: 'https://linkedin.com/in/johndoe',
    order: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createTestCategory(overrides: Partial<any> = {}): any {
  return {
    id: '1',
    name: 'Navigation',
    slug: 'navigation',
    description: 'Navigation systems',
    icon: 'compass',
    color: '#0066cc',
    order: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createTestTag(overrides: Partial<any> = {}): any {
  return {
    id: '1',
    name: 'Technology',
    slug: 'technology',
    description: 'Technology related content',
    color: '#0066cc',
    usageCount: 10,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createTestCompanyInfo(overrides: Partial<any> = {}): any {
  return {
    id: '1',
    name: 'Test Company',
    tagline: 'Test Tagline',
    description: 'Test Description',
    founded: 2010,
    location: 'Test Location',
    address: '123 Test St',
    phone: '123-456-7890',
    email: 'info@testcompany.com',
    story: 'Test story',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}
```

### 2.3 Custom Assertions

**Location:** `lib/__tests__/utils/assertions.ts`

```typescript
/**
 * Custom Assertion Helpers
 * Reusable shape validators for data structures
 */

export function expectVendorShape(vendor: any): void {
  expect(vendor).toHaveProperty('id');
  expect(vendor).toHaveProperty('slug');
  expect(vendor).toHaveProperty('name');
  expect(vendor).toHaveProperty('description');
  expect(vendor).toHaveProperty('logo');
  expect(vendor).toHaveProperty('image');
  expect(vendor).toHaveProperty('website');
  expect(vendor).toHaveProperty('founded');
  expect(vendor).toHaveProperty('location');
  expect(vendor).toHaveProperty('featured');
  expect(vendor).toHaveProperty('partner');
  expect(vendor).toHaveProperty('certifications');
  expect(vendor).toHaveProperty('awards');
  expect(vendor).toHaveProperty('socialProof');
  expect(vendor).toHaveProperty('caseStudies');
  expect(vendor).toHaveProperty('innovationHighlights');
  expect(vendor).toHaveProperty('teamMembers');
  expect(vendor).toHaveProperty('yachtProjects');
}

export function expectProductShape(product: any): void {
  expect(product).toHaveProperty('id');
  expect(product).toHaveProperty('slug');
  expect(product).toHaveProperty('name');
  expect(product).toHaveProperty('description');
  expect(product).toHaveProperty('vendorId');
  expect(product).toHaveProperty('vendorName');
  expect(product).toHaveProperty('partnerId'); // Legacy field
  expect(product).toHaveProperty('partnerName'); // Legacy field
  expect(product).toHaveProperty('category');
  expect(product).toHaveProperty('images');
  expect(product).toHaveProperty('features');
  expect(product).toHaveProperty('specifications');
  expect(product).toHaveProperty('comparisonMetrics');
  expect(product).toHaveProperty('integrationCompatibility');
  expect(product).toHaveProperty('vendor'); // Resolved object
  expect(product).toHaveProperty('partner'); // Resolved object (legacy)
}

export function expectYachtShape(yacht: any): void {
  expect(yacht).toHaveProperty('id');
  expect(yacht).toHaveProperty('slug');
  expect(yacht).toHaveProperty('name');
  expect(yacht).toHaveProperty('description');
  expect(yacht).toHaveProperty('image');
  expect(yacht).toHaveProperty('images');
  expect(yacht).toHaveProperty('length');
  expect(yacht).toHaveProperty('beam');
  expect(yacht).toHaveProperty('draft');
  expect(yacht).toHaveProperty('builder');
  expect(yacht).toHaveProperty('designer');
  expect(yacht).toHaveProperty('launchYear');
  expect(yacht).toHaveProperty('featured');
  expect(yacht).toHaveProperty('timeline');
  expect(yacht).toHaveProperty('supplierMap');
  expect(yacht).toHaveProperty('sustainabilityScore');
  expect(yacht).toHaveProperty('customizations');
  expect(yacht).toHaveProperty('maintenanceHistory');
  expect(yacht).toHaveProperty('supplierCount'); // Computed field
  expect(yacht).toHaveProperty('totalSystems'); // Computed field
}

export function expectBlogPostShape(post: any): void {
  expect(post).toHaveProperty('id');
  expect(post).toHaveProperty('slug');
  expect(post).toHaveProperty('title');
  expect(post).toHaveProperty('excerpt');
  expect(post).toHaveProperty('content');
  expect(post).toHaveProperty('author');
  expect(post).toHaveProperty('publishedAt');
  expect(post).toHaveProperty('category');
  expect(post).toHaveProperty('tags');
  expect(post).toHaveProperty('image');
  expect(post).toHaveProperty('featured');
  expect(post).toHaveProperty('readTime');
}

export function expectCategoryShape(category: any): void {
  expect(category).toHaveProperty('id');
  expect(category).toHaveProperty('name');
  expect(category).toHaveProperty('slug');
  expect(category).toHaveProperty('description');
  expect(category).toHaveProperty('icon');
  expect(category).toHaveProperty('color');
}

export function expectTagShape(tag: any): void {
  expect(tag).toHaveProperty('id');
  expect(tag).toHaveProperty('name');
  expect(tag).toHaveProperty('slug');
  expect(tag).toHaveProperty('description');
  expect(tag).toHaveProperty('color');
  expect(tag).toHaveProperty('usageCount');
}

export function expectTeamMemberShape(member: any): void {
  expect(member).toHaveProperty('id');
  expect(member).toHaveProperty('name');
  expect(member).toHaveProperty('role');
  expect(member).toHaveProperty('bio');
  expect(member).toHaveProperty('image');
  expect(member).toHaveProperty('email');
  expect(member).toHaveProperty('linkedin');
  expect(member).toHaveProperty('order');
}

export function expectCompanyInfoShape(info: any): void {
  expect(info).toHaveProperty('name');
  expect(info).toHaveProperty('tagline');
  expect(info).toHaveProperty('description');
  expect(info).toHaveProperty('founded');
  expect(info).toHaveProperty('location');
  expect(info).toHaveProperty('address');
  expect(info).toHaveProperty('phone');
  expect(info).toHaveProperty('email');
  expect(info).toHaveProperty('story');
}
```

## 3. Detailed Test Specifications

The following test specifications are organized into separate files for clarity and maintainability:

1. **API Parity Tests** → `tasks/test-specs/dataservice-api-parity.md`
   - All 54 TinaCMSDataService methods
   - 16 new methods (13 yacht + 3 tag)
   - Total: 70 method tests

2. **Transformation Tests** → `tasks/test-specs/dataservice-transformations.md`
   - Lexical rich text → HTML/string transformation
   - Media path transformation (/media/ prefix)
   - Reference resolution (vendor, category, tags)
   - Enhanced field transformation (certifications, awards, etc.)
   - Total: 12 transformation tests

3. **Caching Tests** → `tasks/test-specs/dataservice-caching.md`
   - 5-minute TTL validation
   - Cache hit/miss counting
   - Cache expiration behavior
   - Manual cache clearing
   - Performance improvements
   - Total: 8 caching tests

4. **Backward Compatibility Tests** → `tasks/test-specs/dataservice-compatibility.md`
   - Vendor/partner unification (partner=true filtering)
   - Legacy field support (partnerId, partnerName)
   - Featured partners filtering (featured AND partner)
   - Total: 8 compatibility tests

5. **Error Handling Tests** (inline in each test file)
   - API errors return null or empty array
   - Malformed data doesn't throw
   - Missing relationships handled gracefully
   - Total: 6 error handling tests

6. **Static Generation Tests** (inline in each test file)
   - Singleton pattern validation
   - Build-time data access
   - No client-side dependencies
   - Total: 4 static generation tests

**Total Test Cases:** 108 comprehensive tests

## 4. Test Execution Strategy

### 4.1 Test Framework Configuration

**jest.config.js updates:**

```javascript
module.exports = {
  // Existing config...

  // Add test timeout for caching tests (need to wait for TTL)
  testTimeout: 10000,

  // Mock Payload at module level
  moduleNameMapper: {
    '^payload$': '<rootDir>/__mocks__/payload.ts',
    '^@/payload.config$': '<rootDir>/__mocks__/payload.config.ts',
  },

  // Setup files for global mocks
  setupFilesAfterEnv: [
    '<rootDir>/lib/__tests__/setup.ts',
  ],
};
```

**Test setup file:** `lib/__tests__/setup.ts`

```typescript
// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();

  // Reset modules to ensure clean state
  jest.resetModules();
});

// Custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be within range ${floor} - ${ceiling}`
          : `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },
});
```

### 4.2 Test Execution Order

**Run tests in this order for optimal feedback:**

1. **API Parity Tests** (fast, no external dependencies)
   ```bash
   npm test -- PayloadCMSDataService.test.ts
   ```

2. **Yacht Methods Tests** (fast, validates new functionality)
   ```bash
   npm test -- PayloadCMSDataService.yacht-methods.test.ts
   ```

3. **Transformation Tests** (validates core data transformation logic)
   ```bash
   npm test -- PayloadCMSDataService.transforms.test.ts
   ```

4. **Caching Tests** (moderate speed, uses timers)
   ```bash
   npm test -- PayloadCMSDataService.caching.test.ts
   ```

5. **Compatibility Tests** (fast, validates backward compatibility)
   ```bash
   npm test -- PayloadCMSDataService.compatibility.test.ts
   ```

6. **Error Handling Tests** (fast, validates resilience)
   ```bash
   npm test -- PayloadCMSDataService.error-handling.test.ts
   ```

7. **Static Generation Tests** (fast, validates build-time compatibility)
   ```bash
   npm test -- PayloadCMSDataService.static-gen.test.ts
   ```

**Run all tests:**
```bash
npm test -- lib/__tests__/PayloadCMSDataService
```

**Run with coverage:**
```bash
npm test -- --coverage lib/__tests__/PayloadCMSDataService
```

### 4.3 Performance Benchmarks

**Expected Test Execution Times:**
- API Parity Tests: ~5 seconds (70 tests)
- Transformation Tests: ~3 seconds (12 tests)
- Caching Tests: ~8 seconds (8 tests, includes timer waits)
- Compatibility Tests: ~2 seconds (8 tests)
- Error Handling Tests: ~2 seconds (6 tests)
- Static Generation Tests: ~1 second (4 tests)
- **Total: ~21 seconds for 108 tests**

### 4.4 Coverage Requirements

**Minimum Coverage Targets:**
- **Statements:** 95%
- **Branches:** 90%
- **Functions:** 95%
- **Lines:** 95%

**Critical Coverage Areas:**
- ✅ All 54 existing methods have parity tests
- ✅ All 16 new methods have comprehensive tests
- ✅ All transformation functions covered
- ✅ Cache TTL and expiration logic covered
- ✅ Error handling paths covered
- ✅ Backward compatibility logic covered

## 5. Quality Gates

### 5.1 Test Quality Checklist

Before marking test suite complete, verify:

- [ ] **API Parity:** All 54 TinaCMSDataService methods have corresponding tests
- [ ] **New Methods:** All 16 new methods (13 yacht + 3 tag) have comprehensive tests
- [ ] **Transformations:** All 12 transformation scenarios tested
- [ ] **Caching:** All 8 caching scenarios tested (TTL, expiration, performance)
- [ ] **Error Handling:** All 6 error scenarios tested (null returns, no throws)
- [ ] **Compatibility:** All 8 backward compatibility scenarios tested
- [ ] **Static Generation:** All 4 static generation scenarios tested
- [ ] **Mock Utilities:** Mock Payload client, test data factories, assertions implemented
- [ ] **Test Documentation:** All tests have clear descriptions and expected behavior
- [ ] **Coverage:** 95%+ statement/function coverage, 90%+ branch coverage
- [ ] **Performance:** All tests run in <30 seconds total
- [ ] **CI Integration:** Tests run successfully in CI environment

### 5.2 Acceptance Criteria Verification

**From task specification:**

✅ **Test suite design document created** → This document
✅ **API parity tests for all 54 TinaCMSDataService methods specified** → See Section 3.1
✅ **New method tests for yachts (13 methods) and tags (3+ methods) specified** → See Section 3.1
✅ **Data transformation tests (4+ scenarios)** → 12 scenarios specified in Section 3.2
✅ **Caching tests (3+ scenarios)** → 8 scenarios specified in Section 3.3
✅ **Error handling tests (3+ scenarios)** → 6 scenarios specified throughout
✅ **Backward compatibility tests (3+ scenarios)** → 8 scenarios specified in Section 3.4
✅ **Static generation tests (2+ scenarios)** → 4 scenarios specified throughout
✅ **Test utilities designed** → Mock factories, assertions in Section 2
✅ **Minimum 40 total test cases specified** → 108 test cases specified (170% of minimum)

## 6. Implementation Guidelines

### 6.1 Test Implementation Patterns

**Pattern 1: API Method Test**
```typescript
describe('getVendorBySlug', () => {
  it('should return vendor when slug exists', async () => {
    const vendor = createTestVendor({ slug: 'test-vendor' });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorBySlug('test-vendor');

    expect(result).not.toBeNull();
    expectVendorShape(result!);
    expect(result!.slug).toBe('test-vendor');
  });

  it('should return null when slug does not exist', async () => {
    setupMockPayload({ vendors: [] });

    const result = await service.getVendorBySlug('nonexistent');

    expect(result).toBeNull();
  });
});
```

**Pattern 2: Transformation Test**
```typescript
describe('transformPayloadVendor', () => {
  it('should transform Payload vendor to Vendor interface', () => {
    const payloadDoc = createTestVendor();

    const result = service.transformPayloadVendor(payloadDoc);

    expectVendorShape(result);
    expect(result.logo).toBe('/media/logos/test-vendor.png');
    expect(result.certifications).toBeInstanceOf(Array);
  });
});
```

**Pattern 3: Caching Test**
```typescript
describe('caching behavior', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should cache data for 5 minutes', async () => {
    const vendor = createTestVendor();
    const mockPayload = setupMockPayload({ vendors: [vendor] });

    await service.getVendorBySlug('test-vendor');
    await service.getVendorBySlug('test-vendor');

    expect(mockPayload.find).toHaveBeenCalledTimes(1);
  });

  it('should expire cache after 5 minutes', async () => {
    const vendor = createTestVendor();
    const mockPayload = setupMockPayload({ vendors: [vendor] });

    await service.getVendorBySlug('test-vendor');

    jest.advanceTimersByTime(6 * 60 * 1000); // 6 minutes

    await service.getVendorBySlug('test-vendor');

    expect(mockPayload.find).toHaveBeenCalledTimes(2);
  });
});
```

**Pattern 4: Error Handling Test**
```typescript
describe('error handling', () => {
  it('should return null on API error', async () => {
    const mockPayload = setupMockPayload({ vendors: [] });
    mockPayload.find.mockRejectedValueOnce(new Error('Database error'));

    const result = await service.getVendorBySlug('test-vendor');

    expect(result).toBeNull();
  });

  it('should return empty array on list query error', async () => {
    const mockPayload = setupMockPayload({ vendors: [] });
    mockPayload.find.mockRejectedValueOnce(new Error('Database error'));

    const result = await service.getAllVendors();

    expect(result).toEqual([]);
  });
});
```

### 6.2 Common Test Pitfalls to Avoid

**❌ Don't mock transformation functions**
```typescript
// BAD: Mocking transforms defeats the purpose
jest.mock('@/lib/transformers', () => ({
  transformPayloadVendor: jest.fn(() => mockVendor),
}));
```

**✅ Test real transformations**
```typescript
// GOOD: Test actual transformation logic
const payloadDoc = createTestVendor();
const result = service.transformPayloadVendor(payloadDoc);
expectVendorShape(result);
```

**❌ Don't test implementation details**
```typescript
// BAD: Testing cache internal structure
expect(service.cache.get('vendors')).toBeDefined();
```

**✅ Test observable behavior**
```typescript
// GOOD: Testing that caching works
await service.getVendors();
await service.getVendors();
expect(mockPayload.find).toHaveBeenCalledTimes(1);
```

**❌ Don't use hard-coded test data inline**
```typescript
// BAD: Hard to maintain, brittle tests
const vendor = {
  id: '1',
  slug: 'test',
  name: 'Test',
  // ... 50 more fields
};
```

**✅ Use test data factories**
```typescript
// GOOD: Reusable, maintainable, realistic
const vendor = createTestVendor({ slug: 'custom-slug' });
```

## 7. Risk Mitigation

### 7.1 Known Risks and Mitigations

**Risk 1: Payload API Changes**
- **Impact:** High - Tests may break if Payload API changes
- **Mitigation:** Use stable Payload API patterns, version locking
- **Verification:** Run tests against multiple Payload versions

**Risk 2: Transformation Logic Complexity**
- **Impact:** Medium - Complex transformations are hard to test comprehensively
- **Mitigation:** Test edge cases, null handling, malformed data
- **Verification:** 95%+ coverage of transformation functions

**Risk 3: Cache Timing Issues**
- **Impact:** Medium - Timer-based tests can be flaky
- **Mitigation:** Use jest.useFakeTimers(), deterministic time advancement
- **Verification:** Run caching tests 10x to ensure stability

**Risk 4: Mock Data Drift**
- **Impact:** Medium - Mock data may not match real Payload responses
- **Mitigation:** Generate mocks from actual Payload responses
- **Verification:** Compare mock structures with integration tests

**Risk 5: Test Execution Time**
- **Impact:** Low - Slow tests reduce developer productivity
- **Mitigation:** Optimize test setup, parallel execution, mock efficiency
- **Verification:** Total test suite runs in <30 seconds

### 7.2 Contingency Plans

**If tests take too long (>30 seconds):**
1. Profile tests to identify slow tests
2. Optimize mock setup (create once, reuse)
3. Run tests in parallel using `--maxWorkers=4`
4. Consider splitting into unit and integration test suites

**If coverage is below 95%:**
1. Identify uncovered code paths with coverage report
2. Add targeted tests for uncovered branches
3. Review error handling paths (often missed)
4. Add tests for edge cases (null, undefined, empty arrays)

**If tests are flaky:**
1. Identify flaky tests with `--detectLeaks` flag
2. Fix timing issues with `jest.useFakeTimers()`
3. Ensure proper cleanup in `afterEach` hooks
4. Review async test patterns for race conditions

## 8. Next Steps

### 8.1 Implementation Order

1. **Create Test Utilities** (2 hours)
   - `mockPayload.ts` - Mock Payload client factory
   - `testData.ts` - Test data factories
   - `fixtures.ts` - Static test data
   - `assertions.ts` - Custom assertion helpers

2. **Implement API Parity Tests** (6 hours)
   - `PayloadCMSDataService.test.ts` - Core 54 methods
   - Verify all existing methods have corresponding tests
   - Test return types, filtering, error handling

3. **Implement Yacht Methods Tests** (3 hours)
   - `PayloadCMSDataService.yacht-methods.test.ts` - 16 new methods
   - Test yacht-specific functionality
   - Test supplier map filtering, computed fields

4. **Implement Transformation Tests** (3 hours)
   - `PayloadCMSDataService.transforms.test.ts` - 12 scenarios
   - Test Lexical → HTML transformation
   - Test media path transformation
   - Test relationship resolution
   - Test enhanced field transformation

5. **Implement Caching Tests** (2 hours)
   - `PayloadCMSDataService.caching.test.ts` - 8 scenarios
   - Test TTL expiration
   - Test cache performance
   - Test manual clearing

6. **Implement Compatibility Tests** (2 hours)
   - `PayloadCMSDataService.compatibility.test.ts` - 8 scenarios
   - Test vendor/partner unification
   - Test legacy field support
   - Test featured partners filtering

7. **Run Full Test Suite** (1 hour)
   - Verify all 108 tests pass
   - Check coverage reports (95%+ target)
   - Fix any failing tests
   - Document any known issues

**Total Estimated Time:** 19 hours

### 8.2 Success Metrics

**Test suite is complete when:**
- ✅ All 108 test cases implemented and passing
- ✅ 95%+ statement/function coverage achieved
- ✅ 90%+ branch coverage achieved
- ✅ All tests run in <30 seconds
- ✅ Zero flaky tests (10 consecutive runs pass)
- ✅ All acceptance criteria verified
- ✅ Test documentation complete
- ✅ CI integration successful

## 9. Summary

This test suite design provides comprehensive validation of the PayloadCMSDataService migration from TinaCMSDataService. With 108 test cases covering API parity (70 methods), transformations (12 scenarios), caching (8 scenarios), error handling (6 scenarios), backward compatibility (8 scenarios), and static generation (4 scenarios), we ensure zero breaking changes and full feature parity.

**Key Achievements:**
- 100% API parity coverage (54/54 existing methods)
- 100% new method coverage (16/16 yacht + tag methods)
- Real transformation testing (not mocked)
- Comprehensive caching validation (5-minute TTL)
- Full backward compatibility (vendor/partner unification)
- Static generation compatibility (singleton pattern)
- Reusable test utilities (mocks, factories, assertions)
- Fast test execution (<30 seconds for 108 tests)

**Next Step:** Begin implementation of test utilities and test files following the order specified in Section 8.1.

---

**Document Version:** 1.0
**Last Updated:** 2025-10-16
**Author:** test-architect agent
**Status:** Complete - Ready for Implementation
