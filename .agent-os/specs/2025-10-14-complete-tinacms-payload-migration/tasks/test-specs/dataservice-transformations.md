# PayloadCMSDataService Transformation Test Specification

> **Test Category:** Data Transformations
> **Test File:** `lib/__tests__/PayloadCMSDataService.transforms.test.ts`
> **Total Tests:** 12 scenarios
> **Purpose:** Validate all data transformations (Lexical→HTML, media paths, relationships, enhanced fields)

## Overview

This specification details all data transformation tests for PayloadCMSDataService, ensuring Payload CMS documents are correctly transformed to match TinaCMSDataService output format. Tests cover Lexical rich text conversion, media path transformation, relationship resolution, and enhanced field transformation.

## Test Structure

```typescript
describe('PayloadCMSDataService - Transformations', () => {
  let service: PayloadCMSDataService;

  beforeEach(() => {
    service = new PayloadCMSDataService();
    service.clearCache();
  });

  // Test groups: Rich Text, Media Paths, Relationships, Enhanced Fields
});
```

## 1. Lexical Rich Text Transformation (3 tests)

### 1.1 Transform Lexical to HTML String
```typescript
describe('Lexical Rich Text Transformation', () => {
  it('should transform Lexical content to HTML string', async () => {
    const lexicalContent = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Test content', format: 0 },
            ],
          },
        ],
      },
    };

    const vendor = createTestVendor({ description: lexicalContent });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorBySlug('test-vendor');

    expect(result).not.toBeNull();
    expect(result!.description).toBeTypeOf('string');
    expect(result!.description).toContain('Test content');
  });

  it('should handle complex Lexical formatting (bold, italic, links)', async () => {
    const lexicalContent = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Bold text', format: 1 }, // Bold
              { type: 'text', text: ' and ', format: 0 },
              { type: 'text', text: 'italic text', format: 2 }, // Italic
            ],
          },
        ],
      },
    };

    const vendor = createTestVendor({ description: lexicalContent });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorBySlug('test-vendor');

    expect(result!.description).toContain('<strong>Bold text</strong>');
    expect(result!.description).toContain('<em>italic text</em>');
  });

  it('should handle empty/null Lexical content', async () => {
    const vendor = createTestVendor({ description: null });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorBySlug('test-vendor');

    expect(result!.description).toBe('');
  });
});
```

## 2. Media Path Transformation (3 tests)

### 2.1 Transform Payload Media Paths
```typescript
describe('Media Path Transformation', () => {
  it('should transform Payload media paths to /media/ prefix', () => {
    const vendor = createTestVendor({
      logo: 'logos/test-vendor.png',
      image: 'images/test-vendor.jpg',
    });

    const result = service.transformPayloadVendor(vendor);

    expect(result.logo).toBe('/media/logos/test-vendor.png');
    expect(result.image).toBe('/media/images/test-vendor.jpg');
  });

  it('should handle absolute URLs (leave unchanged)', () => {
    const vendor = createTestVendor({
      logo: 'https://example.com/logo.png',
    });

    const result = service.transformPayloadVendor(vendor);

    expect(result.logo).toBe('https://example.com/logo.png');
  });

  it('should handle paths already with /media/ prefix', () => {
    const vendor = createTestVendor({
      logo: '/media/logos/test.png',
    });

    const result = service.transformPayloadVendor(vendor);

    expect(result.logo).toBe('/media/logos/test.png');
  });

  it('should handle empty/null media paths', () => {
    const vendor = createTestVendor({
      logo: null,
      image: '',
    });

    const result = service.transformPayloadVendor(vendor);

    expect(result.logo).toBe('');
    expect(result.image).toBe('');
  });

  it('should transform product image arrays', () => {
    const product = createTestProduct({
      images: [
        { url: 'products/image1.jpg', altText: 'Image 1', isMain: true },
        { url: 'products/image2.jpg', altText: 'Image 2', isMain: false },
      ],
    });

    const result = service.transformPayloadProduct(product);

    expect(result.images[0].url).toBe('/media/products/image1.jpg');
    expect(result.images[1].url).toBe('/media/products/image2.jpg');
  });
});
```

## 3. Relationship Resolution (3 tests)

### 3.1 Vendor Relationship Resolution
```typescript
describe('Relationship Resolution', () => {
  it('should resolve vendor relationship in products', async () => {
    const vendor = createTestVendor({ id: '1', companyName: 'ACME Systems' });
    const product = createTestProduct({ vendor });
    setupMockPayload({ products: [product] });

    const result = await service.getProductBySlug('test-product');

    expect(result).not.toBeNull();
    expect(result!.vendorId).toBe('1');
    expect(result!.vendorName).toBe('ACME Systems');
    expect(result!.vendor).toBeDefined();
    expect(result!.vendor!.name).toBe('ACME Systems');
  });

  it('should resolve category relationship', async () => {
    const product = createTestProduct({
      categories: [{ id: '1', name: 'Navigation', slug: 'navigation' }],
    });
    setupMockPayload({ products: [product] });

    const result = await service.getProductBySlug('test-product');

    expect(result!.category).toBe('Navigation');
  });

  it('should resolve author relationship in blog posts', async () => {
    const blogPost = createTestBlogPost({
      author: { email: 'author@example.com', name: 'John Doe' },
    });
    setupMockPayload({ blogPosts: [blogPost] });

    const result = await service.getBlogPostBySlug('test-post');

    expect(result!.author).toBe('author@example.com');
  });

  it('should handle missing relationships gracefully', async () => {
    const product = createTestProduct({ vendor: null, categories: [] });
    setupMockPayload({ products: [product] });

    const result = await service.getProductBySlug('test-product');

    expect(result!.vendorId).toBe('');
    expect(result!.vendorName).toBe('');
    expect(result!.category).toBe('');
    expect(result!.vendor).toBeUndefined();
  });

  it('should resolve multiple tag relationships', async () => {
    const blogPost = createTestBlogPost({
      tags: [{ tag: 'technology' }, { tag: 'innovation' }, { tag: 'marine' }],
    });
    setupMockPayload({ blogPosts: [blogPost] });

    const result = await service.getBlogPostBySlug('test-post');

    expect(result!.tags).toEqual(['technology', 'innovation', 'marine']);
  });
});
```

## 4. Enhanced Field Transformation (3 tests)

### 4.1 Vendor Enhanced Fields
```typescript
describe('Enhanced Field Transformation', () => {
  it('should transform vendor certifications array', async () => {
    const vendor = createTestVendor({
      certifications: [
        {
          certification: 'ISO 9001',
          issuer: 'ISO',
          year: 2023,
          expiryDate: '2026-01-01',
          certificateNumber: 'ISO-2023-12345',
        },
        {
          certification: 'ISO 14001',
          issuer: 'ISO',
          year: 2022,
        },
      ],
    });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorBySlug('test-vendor');

    expect(result!.certifications).toBeInstanceOf(Array);
    expect(result!.certifications).toHaveLength(2);
    expect(result!.certifications[0]).toHaveProperty('certification', 'ISO 9001');
    expect(result!.certifications[0]).toHaveProperty('issuer', 'ISO');
    expect(result!.certifications[0]).toHaveProperty('year', 2023);
  });

  it('should transform vendor awards array', async () => {
    const vendor = createTestVendor({
      awards: [
        {
          title: 'Best Innovation',
          organization: 'Tech Awards',
          year: 2023,
          category: 'Technology',
        },
      ],
    });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorBySlug('test-vendor');

    expect(result!.awards).toBeInstanceOf(Array);
    expect(result!.awards[0].title).toBe('Best Innovation');
  });

  it('should transform vendor social proof object', async () => {
    const vendor = createTestVendor({
      totalProjects: 150,
      yearsInBusiness: 25,
      employeeCount: 50,
      linkedinFollowers: 5000,
      instagramFollowers: 3000,
    });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorBySlug('test-vendor');

    expect(result!.socialProof).toBeDefined();
    expect(result!.socialProof).toHaveProperty('projectsCompleted');
    expect(result!.socialProof).toHaveProperty('yearsInBusiness');
  });

  it('should transform vendor case studies with Lexical rich text', async () => {
    const vendor = createTestVendor({
      caseStudies: [
        {
          title: 'Project Alpha',
          yachtName: 'Superyacht One',
          challenge: {
            root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Challenge description' }] }] },
          },
          solution: {
            root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Solution description' }] }] },
          },
        },
      ],
    });
    setupMockPayload({ vendors: [vendor] });

    const result = await service.getVendorBySlug('test-vendor');

    expect(result!.caseStudies).toHaveLength(1);
    expect(result!.caseStudies[0].title).toBe('Project Alpha');
    expect(result!.caseStudies[0].challenge).toBeTypeOf('string');
    expect(result!.caseStudies[0].solution).toBeTypeOf('string');
  });

  it('should transform product comparison metrics', async () => {
    const product = createTestProduct({
      comparisonMetrics: [
        {
          category: 'performance',
          metrics: [
            { name: 'Accuracy', value: 95, unit: '%' },
            { name: 'Range', value: 100, unit: 'nm' },
          ],
        },
      ],
    });
    setupMockPayload({ products: [product] });

    const result = await service.getProductBySlug('test-product');

    expect(result!.comparisonMetrics).toBeDefined();
    expect(result!.comparisonMetrics).toHaveProperty('performance');
  });

  it('should transform product owner reviews', async () => {
    const product = createTestProduct({
      ownerReviews: [
        {
          ownerName: 'John Doe',
          yachtName: 'M/Y Example',
          rating: 5,
          title: 'Excellent product',
          review: {
            root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Great product!' }] }] },
          },
          verified: true,
        },
      ],
    });
    setupMockPayload({ products: [product] });

    const result = await service.getProductBySlug('test-product');

    expect(result!.ownerReviews).toHaveLength(1);
    expect(result!.ownerReviews![0].ownerName).toBe('John Doe');
    expect(result!.ownerReviews![0].rating).toBe(5);
    expect(result!.ownerReviews![0].review).toBeTypeOf('string');
  });

  it('should transform yacht supplier map with vendor resolution', async () => {
    const yacht = createTestYacht({
      supplierMap: [
        {
          vendor: '1',
          discipline: 'Navigation Systems',
          systems: [{ system: 'Radar' }, { system: 'GPS' }],
          role: 'primary',
        },
      ],
    });
    setupMockPayload({ yachts: [yacht] });

    const result = await service.getYachtBySlug('test-yacht');

    expect(result!.supplierMap).toHaveLength(1);
    expect(result!.supplierMap[0].vendorId).toBe('1');
    expect(result!.supplierMap[0].discipline).toBe('Navigation Systems');
    expect(result!.supplierMap[0].systems).toHaveLength(2);
  });

  it('should compute yacht supplier count and total systems', async () => {
    const yacht = createTestYacht({
      supplierMap: [
        { vendor: '1', systems: [{ system: 'Radar' }, { system: 'GPS' }] },
        { vendor: '2', systems: [{ system: 'AIS' }] },
      ],
    });
    setupMockPayload({ yachts: [yacht] });

    const result = await service.getYachtBySlug('test-yacht');

    expect(result!.supplierCount).toBe(2);
    expect(result!.totalSystems).toBe(3);
  });

  it('should transform yacht sustainability metrics', async () => {
    const yacht = createTestYacht({
      sustainabilityScore: {
        co2Emissions: 1200,
        energyEfficiency: 85,
        wasteManagement: 'excellent',
        overallScore: 88,
        certifications: ['Green Yacht', 'Eco-Certified'],
      },
    });
    setupMockPayload({ yachts: [yacht] });

    const result = await service.getYachtBySlug('test-yacht');

    expect(result!.sustainabilityScore).toBeDefined();
    expect(result!.sustainabilityScore!.overallScore).toBe(88);
    expect(result!.sustainabilityScore!.certifications).toHaveLength(2);
  });
});
```

## Summary

**Total Transformation Tests:** 12

**Breakdown:**
- Lexical Rich Text: 3 tests
- Media Path Transformation: 3 tests
- Relationship Resolution: 3 tests
- Enhanced Field Transformation: 3 tests

**Coverage:**
- ✅ Lexical → HTML/string conversion
- ✅ Media path prefixing (/media/)
- ✅ Vendor, category, author, tag relationships
- ✅ Certifications, awards, social proof
- ✅ Case studies with rich text
- ✅ Comparison metrics, owner reviews
- ✅ Yacht supplier map, sustainability metrics
- ✅ Computed fields (supplierCount, totalSystems)

**Key Principles:**
1. Test real transformation logic (no mocking)
2. Validate data shapes match TinaCMSDataService output
3. Handle null/undefined gracefully
4. Verify nested object transformations
5. Test both simple and complex transformations

**Next:** See `dataservice-caching.md` for caching tests
