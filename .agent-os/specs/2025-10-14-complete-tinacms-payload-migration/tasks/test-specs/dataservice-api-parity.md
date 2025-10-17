# PayloadCMSDataService API Parity Test Specification

> **Test Category:** API Parity
> **Test File:** `lib/__tests__/PayloadCMSDataService.test.ts`
> **Total Tests:** 70 (54 existing + 16 new)
> **Purpose:** Validate 100% API parity with TinaCMSDataService + new yacht/tag methods

## Overview

This specification details all 70 API method tests for PayloadCMSDataService, ensuring complete parity with TinaCMSDataService (54 methods) plus 16 new methods (13 yacht + 3 tag). Each method test validates return type, data shape, filtering behavior, and error handling.

## Test Structure

```typescript
describe('PayloadCMSDataService - API Parity', () => {
  let service: PayloadCMSDataService;
  let mockPayload: any;

  beforeEach(() => {
    service = new PayloadCMSDataService();
    service.clearCache(); // Ensure clean state
    jest.clearAllMocks();
  });

  // Test groups: Vendors, Partners, Products, Blog, Categories, Tags, Team, Company, Yachts
});
```

## 1. Vendor Methods (9 tests)

### 1.1 getAllVendors()
```typescript
describe('getAllVendors', () => {
  it('should return all vendors from Payload', async () => {
    const vendors = [createTestVendor({ id: '1' }), createTestVendor({ id: '2' })];
    setupMockPayload({ vendors });

    const result = await service.getAllVendors();

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('id', '1');
    expect(result[1]).toHaveProperty('id', '2');
    expectVendorShape(result[0]);
  });

  it('should return empty array when no vendors exist', async () => {
    setupMockPayload({ vendors: [] });

    const result = await service.getAllVendors();

    expect(result).toEqual([]);
  });

  it('should cache vendors data', async () => {
    const vendors = [createTestVendor()];
    const mockPayload = setupMockPayload({ vendors });

    await service.getAllVendors();
    await service.getAllVendors();

    expect(mockPayload.find).toHaveBeenCalledTimes(1);
  });
});
```

### 1.2 getVendors(params?)
```typescript
describe('getVendors', () => {
  it('should return all vendors when no params provided', async () => {
    const vendors = [createTestVendor(), createTestVendor()];
    setupMockPayload({ vendors });

    const result = await service.getVendors();

    expect(result).toHaveLength(2);
  });

  it('should filter vendors by category', async () => {
    const vendors = [
      createTestVendor({ category: { name: 'Navigation' } }),
      createTestVendor({ category: { name: 'Communication' } }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getVendors({ category: 'Navigation' });

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Navigation');
  });

  it('should filter vendors by featured status', async () => {
    const vendors = [
      createTestVendor({ featured: true }),
      createTestVendor({ featured: false }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getVendors({ featured: true });

    expect(result).toHaveLength(1);
    expect(result[0].featured).toBe(true);
  });

  it('should filter vendors by partnersOnly flag', async () => {
    const vendors = [
      createTestVendor({ partner: true }),
      createTestVendor({ partner: false }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getVendors({ partnersOnly: true });

    expect(result).toHaveLength(1);
    expect(result[0].partner).toBe(true);
  });
});
```

### 1.3 getVendorBySlug(slug)
```typescript
describe('getVendorBySlug', () => {
  it('should return vendor when slug exists', async () => {
    const vendor = createTestVendor({ slug: 'test-vendor' });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorBySlug('test-vendor');

    expect(result).not.toBeNull();
    expect(result!.slug).toBe('test-vendor');
    expectVendorShape(result!);
  });

  it('should return null when slug does not exist', async () => {
    setupMockPayload({ vendors: [] });

    const result = await service.getVendorBySlug('nonexistent');

    expect(result).toBeNull();
  });

  it('should cache individual vendor lookups', async () => {
    const vendor = createTestVendor({ slug: 'test-vendor' });
    const mockPayload = setupMockPayload({ vendors: [vendor] });

    await service.getVendorBySlug('test-vendor');
    await service.getVendorBySlug('test-vendor');

    expect(mockPayload.find).toHaveBeenCalledTimes(1);
  });
});
```

### 1.4 getVendorById(id)
```typescript
describe('getVendorById', () => {
  it('should return vendor when id exists', async () => {
    const vendor = createTestVendor({ id: '123' });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorById('123');

    expect(result).not.toBeNull();
    expect(result!.id).toBe('123');
    expectVendorShape(result!);
  });

  it('should return null when id does not exist', async () => {
    setupMockPayload({ vendors: [] });

    const result = await service.getVendorById('nonexistent');

    expect(result).toBeNull();
  });
});
```

### 1.5 getFeaturedVendors()
```typescript
describe('getFeaturedVendors', () => {
  it('should return only featured vendors', async () => {
    const vendors = [
      createTestVendor({ featured: true }),
      createTestVendor({ featured: false }),
      createTestVendor({ featured: true }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getFeaturedVendors();

    expect(result).toHaveLength(2);
    expect(result.every(v => v.featured)).toBe(true);
  });
});
```

### 1.6 searchVendors(query)
```typescript
describe('searchVendors', () => {
  it('should search vendors by name', async () => {
    const vendors = [
      createTestVendor({ companyName: 'ACME Navigation' }),
      createTestVendor({ companyName: 'Tech Systems' }),
    ];
    setupMockPayload({ vendors });

    const result = await service.searchVendors('navigation');

    expect(result).toHaveLength(1);
    expect(result[0].name).toContain('Navigation');
  });

  it('should search vendors by description', async () => {
    const vendors = [
      createTestVendor({ description: 'Leading provider of navigation systems' }),
      createTestVendor({ description: 'Communication systems' }),
    ];
    setupMockPayload({ vendors });

    const result = await service.searchVendors('navigation');

    expect(result).toHaveLength(1);
  });

  it('should be case-insensitive', async () => {
    const vendors = [createTestVendor({ companyName: 'ACME Navigation' })];
    setupMockPayload({ vendors });

    const result = await service.searchVendors('NAVIGATION');

    expect(result).toHaveLength(1);
  });
});
```

### 1.7 getVendorSlugs()
```typescript
describe('getVendorSlugs', () => {
  it('should return array of vendor slugs', async () => {
    const vendors = [
      createTestVendor({ slug: 'vendor-1' }),
      createTestVendor({ slug: 'vendor-2' }),
      createTestVendor({ slug: 'vendor-3' }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getVendorSlugs();

    expect(result).toEqual(['vendor-1', 'vendor-2', 'vendor-3']);
  });

  it('should filter out null/undefined slugs', async () => {
    const vendors = [
      createTestVendor({ slug: 'vendor-1' }),
      createTestVendor({ slug: null }),
      createTestVendor({ slug: 'vendor-3' }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getVendorSlugs();

    expect(result).toEqual(['vendor-1', 'vendor-3']);
  });
});
```

### 1.8 getVendorCertifications(vendorId)
```typescript
describe('getVendorCertifications', () => {
  it('should return vendor certifications array', async () => {
    const vendor = createTestVendor({
      id: '1',
      certifications: [
        { name: 'ISO 9001', issuer: 'ISO', year: 2023 },
        { name: 'ISO 14001', issuer: 'ISO', year: 2022 },
      ],
    });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorCertifications('1');

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('ISO 9001');
  });

  it('should return empty array when vendor has no certifications', async () => {
    const vendor = createTestVendor({ id: '1', certifications: [] });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorCertifications('1');

    expect(result).toEqual([]);
  });
});
```

### 1.9 getVendorAwards(vendorId)
```typescript
describe('getVendorAwards', () => {
  it('should return vendor awards array', async () => {
    const vendor = createTestVendor({
      id: '1',
      awards: [
        { title: 'Best Innovation', year: 2023, organization: 'Tech Awards' },
      ],
    });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorAwards('1');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Best Innovation');
  });
});
```

## 2. Partner Methods (7 tests - Legacy Compatibility)

### 2.1 getAllPartners()
```typescript
describe('getAllPartners', () => {
  it('should return all partners (vendors with partner=true)', async () => {
    const vendors = [
      createTestVendor({ id: '1', partner: true }),
      createTestVendor({ id: '2', partner: false }),
      createTestVendor({ id: '3', partner: true }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getAllPartners();

    // getAllPartners returns all vendors, filtering happens in getPartners
    expect(result).toHaveLength(3);
  });
});
```

### 2.2 getPartners(params?)
```typescript
describe('getPartners', () => {
  it('should return only vendors with partner=true', async () => {
    const vendors = [
      createTestVendor({ partner: true }),
      createTestVendor({ partner: false }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getPartners();

    expect(result).toHaveLength(1);
    expect(result[0].partner).toBe(true);
  });

  it('should filter partners by category', async () => {
    const vendors = [
      createTestVendor({ partner: true, category: { name: 'Navigation' } }),
      createTestVendor({ partner: true, category: { name: 'Communication' } }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getPartners({ category: 'Navigation' });

    expect(result).toHaveLength(1);
  });

  it('should filter partners by featured status', async () => {
    const vendors = [
      createTestVendor({ partner: true, featured: true }),
      createTestVendor({ partner: true, featured: false }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getPartners({ featured: true });

    expect(result).toHaveLength(1);
  });
});
```

### 2.3-2.7 (getPartnerBySlug, getPartnerById, getFeaturedPartners, searchPartners, getPartnerSlugs)
```typescript
// Similar tests to vendor methods but use partner-specific methods
// and verify they work with partner=true filtering
```

## 3. Product Methods (9 tests)

### 3.1 getAllProducts()
```typescript
describe('getAllProducts', () => {
  it('should return all published products', async () => {
    const products = [createTestProduct({ id: '1' }), createTestProduct({ id: '2' })];
    setupMockPayload({ products });

    const result = await service.getAllProducts();

    expect(result).toHaveLength(2);
    expectProductShape(result[0]);
  });

  it('should resolve vendor relationships', async () => {
    const vendor = createTestVendor({ id: '1', companyName: 'ACME' });
    const product = createTestProduct({ vendor });
    setupMockPayload({ products: [product] });

    const result = await service.getAllProducts();

    expect(result[0].vendorId).toBe('1');
    expect(result[0].vendorName).toBe('ACME');
    expect(result[0].vendor).toBeDefined();
    expect(result[0].vendor!.name).toBe('ACME');
  });
});
```

### 3.2 getProducts(params?)
```typescript
describe('getProducts', () => {
  it('should filter products by category', async () => {
    const products = [
      createTestProduct({ categories: [{ name: 'Navigation' }] }),
      createTestProduct({ categories: [{ name: 'Communication' }] }),
    ];
    setupMockPayload({ products });

    const result = await service.getProducts({ category: 'Navigation' });

    expect(result).toHaveLength(1);
  });

  it('should filter products by vendorId', async () => {
    const products = [
      createTestProduct({ vendor: createTestVendor({ id: '1' }) }),
      createTestProduct({ vendor: createTestVendor({ id: '2' }) }),
    ];
    setupMockPayload({ products });

    const result = await service.getProducts({ vendorId: '1' });

    expect(result).toHaveLength(1);
    expect(result[0].vendorId).toBe('1');
  });

  it('should filter products by partnerId (legacy field)', async () => {
    const products = [createTestProduct({ vendor: createTestVendor({ id: '1' }) })];
    setupMockPayload({ products });

    const result = await service.getProducts({ partnerId: '1' });

    expect(result).toHaveLength(1);
    expect(result[0].partnerId).toBe('1');
  });
});
```

### 3.3-3.9 (getProductBySlug, getProductById, getProductsByVendor, getProductsByPartner, searchProducts, getProductSlugs, getFeaturedProducts)
```typescript
// Similar patterns to vendor methods but for products
// Verify legacy partnerId/partnerName fields populated
// Verify vendor/partner objects resolved
```

## 4. Blog Methods (7 tests)

### 4.1-4.7 (getAllBlogPosts, getBlogPosts, getBlogPostBySlug, searchBlogPosts, getBlogPostSlugs, getFeaturedBlogPosts, getBlogCategories)
```typescript
// Blog post tests following same patterns
// Verify author resolution, category resolution, tag arrays
// Verify published filtering, featured filtering
// Verify readTime calculation/presence
```

## 5. Category Methods (2 tests)

### 5.1-5.2 (getCategories, getCategoryBySlug)
```typescript
describe('getCategories', () => {
  it('should return all categories', async () => {
    const categories = [
      createTestCategory({ name: 'Navigation' }),
      createTestCategory({ name: 'Communication' }),
    ];
    setupMockPayload({ categories });

    const result = await service.getCategories();

    expect(result).toHaveLength(2);
    expectCategoryShape(result[0]);
  });
});
```

## 6. Tag Methods (3 NEW tests)

### 6.1 getTags()
```typescript
describe('getTags', () => {
  it('should return all tags', async () => {
    const tags = [
      createTestTag({ name: 'Technology', usageCount: 10 }),
      createTestTag({ name: 'Innovation', usageCount: 5 }),
    ];
    setupMockPayload({ tags });

    const result = await service.getTags();

    expect(result).toHaveLength(2);
    expectTagShape(result[0]);
  });
});
```

### 6.2 getTagBySlug(slug)
```typescript
describe('getTagBySlug', () => {
  it('should return tag when slug exists', async () => {
    const tag = createTestTag({ slug: 'technology' });
    setupMockPayload({ tags: [tag] });

    const result = await service.getTagBySlug('technology');

    expect(result).not.toBeNull();
    expect(result!.slug).toBe('technology');
  });
});
```

### 6.3 getPopularTags(limit?)
```typescript
describe('getPopularTags', () => {
  it('should return tags sorted by usageCount DESC', async () => {
    const tags = [
      createTestTag({ name: 'Tech', usageCount: 5 }),
      createTestTag({ name: 'Innovation', usageCount: 10 }),
      createTestTag({ name: 'Marine', usageCount: 8 }),
    ];
    setupMockPayload({ tags });

    const result = await service.getPopularTags();

    expect(result[0].usageCount).toBe(10);
    expect(result[1].usageCount).toBe(8);
    expect(result[2].usageCount).toBe(5);
  });

  it('should limit results when limit provided', async () => {
    const tags = [
      createTestTag({ usageCount: 10 }),
      createTestTag({ usageCount: 8 }),
      createTestTag({ usageCount: 5 }),
    ];
    setupMockPayload({ tags });

    const result = await service.getPopularTags(2);

    expect(result).toHaveLength(2);
  });
});
```

## 7. Team Methods (2 tests)

### 7.1-7.2 (getTeamMembers, getTeamMemberBySlug)
```typescript
describe('getTeamMembers', () => {
  it('should return team members sorted by order', async () => {
    const members = [
      createTestTeamMember({ order: 2 }),
      createTestTeamMember({ order: 1 }),
      createTestTeamMember({ order: 3 }),
    ];
    setupMockPayload({ teamMembers: members });

    const result = await service.getTeamMembers();

    expect(result[0].order).toBe(1);
    expect(result[1].order).toBe(2);
    expect(result[2].order).toBe(3);
  });
});
```

## 8. Company Methods (1 test)

### 8.1 getCompanyInfo()
```typescript
describe('getCompanyInfo', () => {
  it('should return company info from singleton collection', async () => {
    const companyInfo = createTestCompanyInfo();
    setupMockPayload({ companyInfo: [companyInfo] });

    const result = await service.getCompanyInfo();

    expectCompanyInfoShape(result);
    expect(result.name).toBe('Test Company');
  });

  it('should throw error when company info not found', async () => {
    setupMockPayload({ companyInfo: [] });

    await expect(service.getCompanyInfo()).rejects.toThrow('Company info not found');
  });
});
```

## 9. Yacht Methods (16 NEW tests)

### 9.1 getAllYachts()
```typescript
describe('getAllYachts', () => {
  it('should return all published yachts', async () => {
    const yachts = [createTestYacht(), createTestYacht()];
    setupMockPayload({ yachts });

    const result = await service.getAllYachts();

    expect(result).toHaveLength(2);
    expectYachtShape(result[0]);
  });
});
```

### 9.2-9.7 (getYachts, getYachtBySlug, getYachtById, getFeaturedYachts, searchYachts, getYachtSlugs)
```typescript
// Similar patterns to vendor/product methods
```

### 9.8-9.13 (getYachtTimeline, getYachtSupplierMap, getYachtSustainabilityScore, getYachtMaintenanceHistory, getYachtCustomizations, preloadYachtData)
```typescript
describe('getYachtTimeline', () => {
  it('should return yacht timeline events', async () => {
    const yacht = createTestYacht({
      id: '1',
      timeline: [
        { date: '2020-01-01', event: 'Launch', category: 'launch' },
        { date: '2020-06-01', event: 'Delivery', category: 'delivery' },
      ],
    });
    setupMockPayload({ yachts: [yacht] });

    const result = await service.getYachtTimeline('1');

    expect(result).toHaveLength(2);
    expect(result[0].event).toBe('Launch');
  });
});

describe('getYachtSupplierMap', () => {
  it('should return yacht supplier roles', async () => {
    const yacht = createTestYacht({
      id: '1',
      supplierMap: [
        { vendorId: 'v1', vendorName: 'ACME', discipline: 'Navigation', systems: ['Radar'] },
      ],
    });
    setupMockPayload({ yachts: [yacht] });

    const result = await service.getYachtSupplierMap('1');

    expect(result).toHaveLength(1);
    expect(result[0].vendorName).toBe('ACME');
  });
});

describe('preloadYachtData', () => {
  it('should preload all yacht data in parallel', async () => {
    const yacht = createTestYacht({ id: '1' });
    setupMockPayload({ yachts: [yacht] });

    await service.preloadYachtData('1');

    // Verify all yacht data methods were called
    expect(service.cache.has('yacht-timeline:1')).toBe(true);
    expect(service.cache.has('yacht-suppliers:1')).toBe(true);
  });
});
```

### 9.14-9.16 (getYachtsByVendor, clearYachtCache, additional yacht filters)
```typescript
describe('getYachtsByVendor', () => {
  it('should return yachts where vendor in supplierMap', async () => {
    const yachts = [
      createTestYacht({ supplierMap: [{ vendorId: '1', vendorName: 'ACME' }] }),
      createTestYacht({ supplierMap: [{ vendorId: '2', vendorName: 'Tech' }] }),
    ];
    setupMockPayload({ yachts });

    const result = await service.getYachtsByVendor('1');

    expect(result).toHaveLength(1);
  });
});
```

## 10. Cache Management Methods (4 tests)

### 10.1-10.4 (clearCache, getCacheStats, getCacheInfo, getCacheStatistics)
```typescript
describe('clearCache', () => {
  it('should clear all cached data', async () => {
    const vendors = [createTestVendor()];
    setupMockPayload({ vendors });

    await service.getAllVendors();
    expect(service.cache.size).toBeGreaterThan(0);

    service.clearCache();
    expect(service.cache.size).toBe(0);
  });
});

describe('getCacheStats', () => {
  it('should return cache statistics', () => {
    const stats = service.getCacheStats();

    expect(stats).toHaveProperty('hits');
    expect(stats).toHaveProperty('misses');
    expect(stats).toHaveProperty('size');
  });
});
```

## 11. Validation Methods (1 test)

### 11.1 validateCMSContent()
```typescript
describe('validateCMSContent', () => {
  it('should validate content exists', async () => {
    const vendors = [createTestVendor()];
    const products = [createTestProduct()];
    const categories = [createTestCategory()];
    setupMockPayload({ vendors, products, categories });

    const result = await service.validateCMSContent();

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should detect missing required content', async () => {
    setupMockPayload({ vendors: [], products: [], categories: [] });

    const result = await service.validateCMSContent();

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors).toContain(expect.stringMatching(/no vendors found/i));
  });

  it('should detect orphaned products (invalid vendor references)', async () => {
    const products = [createTestProduct({ vendor: createTestVendor({ id: 'nonexistent' }) })];
    setupMockPayload({ vendors: [], products });

    const result = await service.validateCMSContent();

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(expect.stringMatching(/invalid vendor/i));
  });

  it('should detect duplicate slugs', async () => {
    const vendors = [
      createTestVendor({ slug: 'duplicate' }),
      createTestVendor({ slug: 'duplicate' }),
    ];
    setupMockPayload({ vendors });

    const result = await service.validateCMSContent();

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(expect.stringMatching(/duplicate.*slugs/i));
  });
});
```

## Summary

**Total API Tests:** 70

**Breakdown:**
- Vendors: 9 tests
- Partners (legacy): 7 tests
- Products: 9 tests
- Blog: 7 tests
- Categories: 2 tests
- Tags (NEW): 3 tests
- Team: 2 tests
- Company: 1 test
- Yachts (NEW): 16 tests
- Cache Management: 4 tests
- Validation: 1 test

**Coverage:** 100% of TinaCMSDataService API + 16 new methods

**Next:** See `dataservice-transformations.md` for transformation tests
