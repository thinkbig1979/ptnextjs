# PayloadCMSDataService Backward Compatibility Test Specification

> **Test Category:** Backward Compatibility
> **Test File:** `lib/__tests__/PayloadCMSDataService.compatibility.test.ts`
> **Total Tests:** 8 scenarios
> **Purpose:** Validate vendor/partner unification, legacy field support, zero breaking changes

## Overview

This specification details all backward compatibility tests for PayloadCMSDataService, ensuring the vendor/partner unification maintains full compatibility with existing code that uses Partner interfaces and methods. Tests verify legacy fields are populated, filtering works correctly, and no breaking changes occur.

## Test Structure

```typescript
describe('PayloadCMSDataService - Backward Compatibility', () => {
  let service: PayloadCMSDataService;

  beforeEach(() => {
    service = new PayloadCMSDataService();
    service.clearCache();
  });

  // Test groups: Vendor/Partner Unification, Legacy Fields, Featured Partners
});
```

## 1. Vendor/Partner Unification (3 tests)

### 1.1 Partners Return Vendors with partner=true
```typescript
describe('Vendor/Partner Unification', () => {
  it('should return only vendors with partner=true from getPartners()', async () => {
    const vendors = [
      createTestVendor({ id: '1', companyName: 'ACME', partner: true }),
      createTestVendor({ id: '2', companyName: 'Tech Corp', partner: false }),
      createTestVendor({ id: '3', companyName: 'Marine Systems', partner: true }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getPartners();

    expect(result).toHaveLength(2);
    expect(result.every(p => p.partner === true)).toBe(true);
    expect(result.find(p => p.name === 'ACME')).toBeDefined();
    expect(result.find(p => p.name === 'Marine Systems')).toBeDefined();
    expect(result.find(p => p.name === 'Tech Corp')).toBeUndefined();
  });

  it('should return all vendors (partners and non-partners) from getVendors()', async () => {
    const vendors = [
      createTestVendor({ partner: true }),
      createTestVendor({ partner: false }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getVendors();

    expect(result).toHaveLength(2);
    const hasPartners = result.some(v => v.partner === true);
    const hasNonPartners = result.some(v => v.partner === false);
    expect(hasPartners).toBe(true);
    expect(hasNonPartners).toBe(true);
  });

  it('should support partnersOnly filter in getVendors()', async () => {
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

## 2. Legacy Field Support (3 tests)

### 2.1 Products Have Legacy partnerId/partnerName
```typescript
describe('Legacy Field Support', () => {
  it('should populate both vendorId and partnerId in products', async () => {
    const vendor = createTestVendor({ id: '123', companyName: 'ACME' });
    const product = createTestProduct({ vendor });
    setupMockPayload({ products: [product] });

    const result = await service.getProductBySlug('test-product');

    expect(result).not.toBeNull();
    // New fields
    expect(result!.vendorId).toBe('123');
    expect(result!.vendorName).toBe('ACME');
    // Legacy fields (same values)
    expect(result!.partnerId).toBe('123');
    expect(result!.partnerName).toBe('ACME');
  });

  it('should populate both vendor and partner objects in products', async () => {
    const vendor = createTestVendor({ id: '123', companyName: 'ACME' });
    const product = createTestProduct({ vendor });
    setupMockPayload({ products: [product] });

    const result = await service.getProductBySlug('test-product');

    // New field
    expect(result!.vendor).toBeDefined();
    expect(result!.vendor!.id).toBe('123');
    // Legacy field (same object)
    expect(result!.partner).toBeDefined();
    expect(result!.partner!.id).toBe('123');
    // Should be same reference
    expect(result!.vendor).toBe(result!.partner);
  });

  it('should support legacy getProductsByPartner() method', async () => {
    const vendor = createTestVendor({ id: '123' });
    const product = createTestProduct({ vendor });
    setupMockPayload({ products: [product] });

    const result = await service.getProductsByPartner('123');

    expect(result).toHaveLength(1);
    expect(result[0].partnerId).toBe('123');
  });

  it('should support legacy getProducts({ partnerId }) filter', async () => {
    const vendor1 = createTestVendor({ id: '1' });
    const vendor2 = createTestVendor({ id: '2' });
    const products = [
      createTestProduct({ vendor: vendor1 }),
      createTestProduct({ vendor: vendor2 }),
    ];
    setupMockPayload({ products });

    const result = await service.getProducts({ partnerId: '1' });

    expect(result).toHaveLength(1);
    expect(result[0].partnerId).toBe('1');
  });
});
```

## 3. Featured Partners Filtering (2 tests)

### 3.1 Featured Partners Must Be Both Featured AND Partner
```typescript
describe('Featured Partners Filtering', () => {
  it('should return only vendors with featured=true AND partner=true', async () => {
    const vendors = [
      createTestVendor({ id: '1', featured: true, partner: true }),   // ✓ Include
      createTestVendor({ id: '2', featured: true, partner: false }),  // ✗ Exclude
      createTestVendor({ id: '3', featured: false, partner: true }),  // ✗ Exclude
      createTestVendor({ id: '4', featured: false, partner: false }), // ✗ Exclude
    ];
    setupMockPayload({ vendors });

    const result = await service.getFeaturedPartners();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].featured).toBe(true);
    expect(result[0].partner).toBe(true);
  });

  it('should cache featured partners separately', async () => {
    const vendors = [
      createTestVendor({ featured: true, partner: true }),
    ];
    const mockPayload = setupMockPayload({ vendors });

    await service.getFeaturedPartners();
    await service.getFeaturedPartners();

    expect(mockPayload.find).toHaveBeenCalledTimes(1);
    expect(service.cache.has('featured-partners')).toBe(true);
  });

  it('should NOT include featured vendors that are not partners', async () => {
    const vendors = [
      createTestVendor({ featured: true, partner: false, companyName: 'Not Partner' }),
      createTestVendor({ featured: true, partner: true, companyName: 'Is Partner' }),
    ];
    setupMockPayload({ vendors });

    const result = await service.getFeaturedPartners();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Is Partner');
    expect(result.find(p => p.name === 'Not Partner')).toBeUndefined();
  });
});
```

## Summary

**Total Compatibility Tests:** 8

**Breakdown:**
- Vendor/Partner Unification: 3 tests
- Legacy Field Support: 3 tests
- Featured Partners Filtering: 2 tests

**Coverage:**
- ✅ Partners filter by partner=true
- ✅ Vendors return all (partners + non-partners)
- ✅ partnersOnly filter works correctly
- ✅ Legacy partnerId/partnerName populated
- ✅ Legacy vendor/partner objects populated
- ✅ Legacy getProductsByPartner() works
- ✅ Legacy partnerId filter works
- ✅ Featured partners require BOTH featured AND partner=true
- ✅ Featured vendors (non-partners) excluded from featured partners
- ✅ Featured partners cached separately

**Key Principles:**
1. Zero breaking changes - all legacy code continues to work
2. Vendor/partner unification transparent to existing code
3. Legacy field support maintains backward compatibility
4. Featured partners filtering precise (AND logic, not OR)
5. Both new (vendor) and legacy (partner) methods work identically

**Verification Strategy:**
- Test with mixed partner=true/false vendors
- Verify legacy fields populated correctly
- Test legacy methods still work
- Verify featured partners logic precise
- Ensure no code changes needed in consuming pages

**Next:** Error handling and static generation tests inline in main test file
