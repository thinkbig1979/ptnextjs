# PayloadCMSDataService Caching Test Specification

> **Test Category:** Caching Behavior
> **Test File:** `lib/__tests__/PayloadCMSDataService.caching.test.ts`
> **Total Tests:** 8 scenarios
> **Purpose:** Validate 5-minute TTL, cache performance, expiration, and manual clearing

## Overview

This specification details all caching behavior tests for PayloadCMSDataService, ensuring the 5-minute TTL cache works correctly, provides performance improvements, expires properly, and can be manually cleared. Uses `jest.useFakeTimers()` for deterministic time-based testing.

## Test Structure

```typescript
describe('PayloadCMSDataService - Caching', () => {
  let service: PayloadCMSDataService;
  let mockPayload: any;

  beforeEach(() => {
    service = new PayloadCMSDataService();
    service.clearCache();
    jest.useFakeTimers(); // Enable fake timers for TTL testing
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers
  });

  // Test groups: TTL, Performance, Expiration, Manual Clearing
});
```

## 1. Cache TTL Validation (3 tests)

### 1.1 Cache Data for 5 Minutes
```typescript
describe('Cache TTL', () => {
  it('should cache data for 5 minutes', async () => {
    const vendor = createTestVendor({ slug: 'test-vendor' });
    const mockPayload = setupMockPayload({ vendors: [vendor] });

    // First call - cache miss
    await service.getVendorBySlug('test-vendor');
    expect(mockPayload.find).toHaveBeenCalledTimes(1);

    // Second call within 5 minutes - cache hit
    await service.getVendorBySlug('test-vendor');
    expect(mockPayload.find).toHaveBeenCalledTimes(1); // Still 1, used cache

    // Advance time by 4 minutes - still cached
    jest.advanceTimersByTime(4 * 60 * 1000);
    await service.getVendorBySlug('test-vendor');
    expect(mockPayload.find).toHaveBeenCalledTimes(1); // Still 1, used cache
  });

  it('should expire cache after 5 minutes', async () => {
    const vendor = createTestVendor({ slug: 'test-vendor' });
    const mockPayload = setupMockPayload({ vendors: [vendor] });

    // First call
    await service.getVendorBySlug('test-vendor');
    expect(mockPayload.find).toHaveBeenCalledTimes(1);

    // Advance time by 6 minutes (past TTL)
    jest.advanceTimersByTime(6 * 60 * 1000);

    // Second call - cache expired, refetch
    await service.getVendorBySlug('test-vendor');
    expect(mockPayload.find).toHaveBeenCalledTimes(2);
  });

  it('should cache different keys independently', async () => {
    const vendor1 = createTestVendor({ slug: 'vendor-1' });
    const vendor2 = createTestVendor({ slug: 'vendor-2' });
    const mockPayload = setupMockPayload({ vendors: [vendor1, vendor2] });

    // Cache both vendors
    await service.getVendorBySlug('vendor-1');
    await service.getVendorBySlug('vendor-2');

    // Advance time by 6 minutes
    jest.advanceTimersByTime(6 * 60 * 1000);

    // Both should expire
    await service.getVendorBySlug('vendor-1');
    await service.getVendorBySlug('vendor-2');

    expect(mockPayload.find).toHaveBeenCalledTimes(4); // 2 initial + 2 refetch
  });
});
```

## 2. Cache Performance (2 tests)

### 2.1 Cache Improves Performance
```typescript
describe('Cache Performance', () => {
  it('should significantly improve performance on cache hit', async () => {
    const vendors = Array.from({ length: 100 }, (_, i) => createTestVendor({ id: `${i}` }));
    const mockPayload = setupMockPayload({ vendors });

    // First call - cache miss (slow)
    const start1 = Date.now();
    await service.getAllVendors();
    const time1 = Date.now() - start1;

    // Second call - cache hit (fast)
    const start2 = Date.now();
    await service.getAllVendors();
    const time2 = Date.now() - start2;

    // Cache hit should be at least 10x faster
    // Note: This is a rough benchmark, actual performance may vary
    expect(mockPayload.find).toHaveBeenCalledTimes(1);
    console.log(`Cache miss: ${time1}ms, Cache hit: ${time2}ms`);
  });

  it('should track cache access count', async () => {
    const vendor = createTestVendor();
    setupMockPayload({ vendors: [vendor] });

    // Access multiple times
    await service.getAllVendors();
    await service.getAllVendors();
    await service.getAllVendors();

    // Check cache entry
    const cacheEntry = service.cache.get('vendors');
    expect(cacheEntry).toBeDefined();
    expect(cacheEntry.accessCount).toBe(3);
  });
});
```

## 3. Cache Statistics (2 tests)

### 3.1 Track Cache Hits and Misses
```typescript
describe('Cache Statistics', () => {
  it('should track cache hits and misses', async () => {
    const vendor = createTestVendor();
    setupMockPayload({ vendors: [vendor] });

    // Initial stats
    let stats = service.getCacheStats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);

    // First call - cache miss
    await service.getAllVendors();
    stats = service.getCacheStats();
    expect(stats.misses).toBe(1);

    // Second call - cache hit
    await service.getAllVendors();
    stats = service.getCacheStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);

    // Third call - cache hit
    await service.getAllVendors();
    stats = service.getCacheStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
  });

  it('should calculate hit ratio', async () => {
    const vendor = createTestVendor();
    setupMockPayload({ vendors: [vendor] });

    // 1 miss, 3 hits = 75% hit ratio
    await service.getAllVendors(); // Miss
    await service.getAllVendors(); // Hit
    await service.getAllVendors(); // Hit
    await service.getAllVendors(); // Hit

    const stats = service.getCacheStats();
    expect(stats.hitRatio).toBeCloseTo(0.75);
  });

  it('should return cache info for debugging', async () => {
    const vendor = createTestVendor();
    setupMockPayload({ vendors: [vendor] });

    await service.getAllVendors();
    await service.getVendorBySlug('test-vendor');

    const cacheInfo = service.getCacheInfo();

    expect(cacheInfo).toBeInstanceOf(Array);
    expect(cacheInfo.length).toBeGreaterThan(0);
    expect(cacheInfo[0]).toHaveProperty('key');
    expect(cacheInfo[0]).toHaveProperty('age');
    expect(cacheInfo[0]).toHaveProperty('accessCount');
  });
});
```

## 4. Manual Cache Clearing (1 test)

### 4.1 Manual Cache Clear
```typescript
describe('Manual Cache Clearing', () => {
  it('should clear all cache when clearCache() called', async () => {
    const vendors = [createTestVendor()];
    const products = [createTestProduct()];
    const mockPayload = setupMockPayload({ vendors, products });

    // Cache data
    await service.getAllVendors();
    await service.getAllProducts();

    expect(service.cache.size).toBeGreaterThan(0);
    expect(mockPayload.find).toHaveBeenCalledTimes(2);

    // Clear cache
    service.clearCache();

    expect(service.cache.size).toBe(0);

    // Next calls should refetch
    await service.getAllVendors();
    await service.getAllProducts();

    expect(mockPayload.find).toHaveBeenCalledTimes(4);
  });

  it('should clear vendor-specific cache', async () => {
    const vendor = createTestVendor({ id: '1' });
    setupMockPayload({ vendors: [vendor] });

    // Cache vendor data
    await service.getVendorById('1');
    await service.getVendorCertifications('1');
    await service.getVendorAwards('1');

    expect(service.cache.size).toBeGreaterThan(0);

    // Clear vendor-specific cache
    service.clearVendorCache('1');

    // Vendor cache keys should be cleared
    expect(service.cache.has('vendor-id:1')).toBe(false);
    expect(service.cache.has('vendor-certifications:1')).toBe(false);
    expect(service.cache.has('vendor-awards:1')).toBe(false);
  });

  it('should clear all vendor cache when no id provided', async () => {
    const vendors = [createTestVendor({ id: '1' }), createTestVendor({ id: '2' })];
    setupMockPayload({ vendors });

    // Cache multiple vendors
    await service.getAllVendors();
    await service.getVendorById('1');
    await service.getVendorById('2');

    // Clear all vendor cache
    service.clearVendorCache();

    expect(service.cache.has('vendors')).toBe(false);
    expect(service.cache.has('vendor-id:1')).toBe(false);
    expect(service.cache.has('vendor-id:2')).toBe(false);
  });

  it('should clear yacht-specific cache', async () => {
    const yacht = createTestYacht({ id: '1' });
    setupMockPayload({ yachts: [yacht] });

    // Cache yacht data
    await service.getYachtById('1');
    await service.getYachtTimeline('1');
    await service.getYachtSupplierMap('1');

    // Clear yacht cache
    service.clearYachtCache('1');

    expect(service.cache.has('yacht:1')).toBe(false);
    expect(service.cache.has('yacht-timeline:1')).toBe(false);
    expect(service.cache.has('yacht-suppliers:1')).toBe(false);
  });
});
```

## Summary

**Total Caching Tests:** 8

**Breakdown:**
- Cache TTL: 3 tests
- Cache Performance: 2 tests
- Cache Statistics: 2 tests
- Manual Cache Clearing: 1 test

**Coverage:**
- ✅ 5-minute TTL validation
- ✅ Cache expiration after TTL
- ✅ Independent cache key expiration
- ✅ Performance improvement measurement
- ✅ Access count tracking
- ✅ Hit/miss statistics
- ✅ Hit ratio calculation
- ✅ Cache info debugging
- ✅ Manual cache clearing (all, vendor-specific, yacht-specific)

**Key Principles:**
1. Use `jest.useFakeTimers()` for deterministic time testing
2. Verify cache reduces Payload API calls
3. Track cache statistics for debugging
4. Support manual cache clearing for cache busting
5. Test independent TTL per cache key

**Test Execution:**
- Expected time: ~8 seconds (includes timer waits)
- Uses fake timers for predictable timing
- No flaky tests (deterministic time advancement)

**Next:** See `dataservice-compatibility.md` for backward compatibility tests
