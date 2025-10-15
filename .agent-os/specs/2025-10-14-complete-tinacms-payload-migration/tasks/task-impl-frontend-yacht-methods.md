# Task IMPL-FRONTEND-YACHT-METHODS: Add Yacht Methods to PayloadCMSDataService

## Task Metadata
- **Task ID**: impl-frontend-yacht-methods
- **Phase**: Phase 3 - Frontend Implementation
- **Agent Assignment**: implementation-specialist
- **Estimated Time**: 3 hours
- **Dependencies**: test-frontend-dataservice, test-backend-integration
- **Status**: Ready for Implementation
- **Priority**: High

## Task Description

Implement yacht-specific data access methods in PayloadCMSDataService including getYachts(), getYachtBySlug(), getFeaturedYachts(), and getYachtsByVendor(). These methods must fetch yacht data with full relationship resolution (suppliers, products) and transform Lexical rich text for frontend display.

## Specifics

### File to Create/Update
`/home/edwin/development/ptnextjs/lib/payload-cms-data-service.ts`

### Methods to Implement

#### 1. getYachts()
```typescript
async getYachts(): Promise<Yacht[]> {
  const cacheKey = 'yachts:all';

  const cached = this.getFromCache<Yacht[]>(cacheKey);
  if (cached) return cached;

  const response = await this.payloadClient.find({
    collection: 'yachts',
    depth: 2, // Resolve vendor and product relationships in supplierMap
    limit: 1000,
    sort: '-specifications.launchYear' // Newest first
  });

  const yachts = response.docs.map(yacht => this.transformYacht(yacht));

  this.setCache(cacheKey, yachts);
  return yachts;
}
```

#### 2. getYachtBySlug()
```typescript
async getYachtBySlug(slug: string): Promise<Yacht | null> {
  const cacheKey = `yacht:${slug}`;

  const cached = this.getFromCache<Yacht>(cacheKey);
  if (cached) return cached;

  const response = await this.payloadClient.find({
    collection: 'yachts',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1
  });

  if (response.docs.length === 0) return null;

  const yacht = this.transformYacht(response.docs[0]);

  this.setCache(cacheKey, yacht);
  return yacht;
}
```

#### 3. getFeaturedYachts()
```typescript
async getFeaturedYachts(): Promise<Yacht[]> {
  const cacheKey = 'yachts:featured';

  const cached = this.getFromCache<Yacht[]>(cacheKey);
  if (cached) return cached;

  const response = await this.payloadClient.find({
    collection: 'yachts',
    where: { featured: { equals: true } },
    depth: 2,
    limit: 100,
    sort: '-specifications.launchYear'
  });

  const yachts = response.docs.map(yacht => this.transformYacht(yacht));

  this.setCache(cacheKey, yachts);
  return yachts;
}
```

#### 4. getYachtsByVendor()
```typescript
async getYachtsByVendor(vendorSlug: string): Promise<Yacht[]> {
  const cacheKey = `yachts:vendor:${vendorSlug}`;

  const cached = this.getFromCache<Yacht[]>(cacheKey);
  if (cached) return cached;

  // First get vendor ID from slug
  const vendor = await this.getVendorBySlug(vendorSlug);
  if (!vendor) return [];

  const response = await this.payloadClient.find({
    collection: 'yachts',
    where: {
      'supplierMap.vendor': { equals: vendor.id }
    },
    depth: 2,
    limit: 1000,
    sort: '-specifications.launchYear'
  });

  const yachts = response.docs.map(yacht => this.transformYacht(yacht));

  this.setCache(cacheKey, yachts);
  return yachts;
}
```

### Transformation Method

```typescript
private transformYacht(payloadYacht: any): Yacht {
  return {
    id: payloadYacht.id,
    name: payloadYacht.name,
    slug: payloadYacht.slug,
    tagline: payloadYacht.tagline,

    // Transform Lexical rich text to HTML/React
    description: this.transformLexicalToHtml(payloadYacht.description),

    // Transform media paths
    heroImage: this.transformMediaPath(payloadYacht.heroImage),
    gallery: payloadYacht.gallery?.map(item => this.transformMediaPath(item.image)),

    // Specifications
    specifications: {
      builder: payloadYacht.specifications.builder,
      lengthMeters: payloadYacht.specifications.lengthMeters,
      beamMeters: payloadYacht.specifications.beamMeters,
      draftMeters: payloadYacht.specifications.draftMeters,
      tonnage: payloadYacht.specifications.tonnage,
      launchYear: payloadYacht.specifications.launchYear,
      deliveryDate: payloadYacht.specifications.deliveryDate,
      flagState: payloadYacht.specifications.flagState,
      classification: payloadYacht.specifications.classification
    },

    // Timeline (already in correct format)
    timeline: payloadYacht.timeline || [],

    // Supplier map with resolved relationships
    supplierMap: payloadYacht.supplierMap?.map(supplier => ({
      vendor: {
        id: supplier.vendor.id,
        name: supplier.vendor.name,
        slug: supplier.vendor.slug,
        logo: this.transformMediaPath(supplier.vendor.logo)
      },
      products: supplier.products?.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: this.transformMediaPath(product.image)
      })),
      systemCategory: supplier.systemCategory,
      installationDate: supplier.installationDate,
      notes: supplier.notes
    })) || [],

    // Sustainability metrics
    sustainability: payloadYacht.sustainability ? {
      co2EmissionsTonsPerYear: payloadYacht.sustainability.co2EmissionsTonsPerYear,
      energyEfficiencyRating: payloadYacht.sustainability.energyEfficiencyRating,
      hybridPropulsion: payloadYacht.sustainability.hybridPropulsion,
      solarPanelCapacityKw: payloadYacht.sustainability.solarPanelCapacityKw,
      batteryStorageKwh: payloadYacht.sustainability.batteryStorageKwh,
      sustainabilityFeatures: payloadYacht.sustainability.sustainabilityFeatures || [],
      greenCertifications: payloadYacht.sustainability.greenCertifications || []
    } : undefined,

    // Maintenance history
    maintenanceHistory: payloadYacht.maintenanceHistory?.map(record => ({
      ...record,
      vendor: record.vendor ? {
        id: record.vendor.id,
        name: record.vendor.name,
        slug: record.vendor.slug
      } : undefined
    })) || [],

    // Metadata
    videoTour: payloadYacht.videoTour,
    websiteUrl: payloadYacht.websiteUrl,
    featured: payloadYacht.featured || false,
    status: payloadYacht.status,
    createdAt: payloadYacht.createdAt,
    updatedAt: payloadYacht.updatedAt
  };
}
```

## Acceptance Criteria

- [ ] Method implemented: getYachts() with caching
- [ ] Method implemented: getYachtBySlug() with caching
- [ ] Method implemented: getFeaturedYachts() with caching
- [ ] Method implemented: getYachtsByVendor() with caching
- [ ] Transformation method transformYacht() implemented
- [ ] All vendor relationships resolved in supplierMap
- [ ] All product relationships resolved in supplierMap
- [ ] Lexical rich text transformed to HTML
- [ ] Media paths transformed to public URLs
- [ ] Timeline data preserved correctly
- [ ] Sustainability metrics transformed correctly
- [ ] Maintenance history transformed with vendor resolution

## Testing Requirements

### Unit Tests (from test-frontend-dataservice)
- Test getYachts() returns array of yachts
- Test getYachtBySlug() returns single yacht
- Test getYachtBySlug() returns null for nonexistent slug
- Test getFeaturedYachts() returns only featured yachts
- Test getYachtsByVendor() filters by vendor correctly
- Test transformYacht() converts Lexical to HTML
- Test transformYacht() resolves vendor relationships
- Test transformYacht() resolves product relationships
- Test caching works for all methods

### Manual Testing
1. Call getYachts() and verify returned data structure
2. Call getYachtBySlug('test-yacht') and verify relationships
3. Verify supplier map vendors are fully populated
4. Verify supplier map products are fully populated
5. Check caching reduces subsequent call times
6. Verify Lexical description renders as HTML

## Evidence Required

**Code Files:**
1. Updated `lib/payload-cms-data-service.ts` with yacht methods

**Test Results:**
- Unit test output showing all yacht method tests passing
- Sample output from getYachtBySlug() showing full data structure

**Verification Checklist:**
- [ ] All 4 methods implemented
- [ ] transformYacht() handles all fields
- [ ] Vendor relationships resolve correctly
- [ ] Product relationships resolve correctly
- [ ] Caching works
- [ ] All tests pass
- [ ] No TypeScript errors

## Context Requirements

**Technical Spec Sections:**
- Lines 383-527: Yachts Collection Schema
- Lines 583-655: Frontend Data Service Architecture

**Related Tasks:**
- impl-backend-yachts (collection must exist)
- test-frontend-dataservice (test specifications)

## Quality Gates

- [ ] All 4 methods implemented correctly
- [ ] Relationship resolution depth = 2
- [ ] Caching implemented for all methods
- [ ] Lexical transformation working
- [ ] Media path transformation working
- [ ] All unit tests pass
- [ ] No TypeScript errors
- [ ] No linting errors

## Notes

- Supplier map requires depth=2 for vendor AND product resolution
- Timeline events should remain in chronological order
- Sustainability metrics are optional (handle undefined)
- Maintenance history vendor is optional relationship
- Consider pagination for getYachts() in future (currently limit=1000)
