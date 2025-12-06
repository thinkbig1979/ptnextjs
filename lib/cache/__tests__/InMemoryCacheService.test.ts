/**
 * InMemoryCacheService Tests
 *
 * Comprehensive test suite for the in-memory cache implementation.
 */

import { InMemoryCacheService, createCollectionPattern, createEntityTags } from '../InMemoryCacheService';

describe('InMemoryCacheService', () => {
  let cache: InMemoryCacheService;

  beforeEach(() => {
    // Create a new cache instance with default 5-minute TTL
    cache = new InMemoryCacheService();
  });

  afterEach(() => {
    cache.clear();
  });

  describe('get()', () => {
    it('should fetch and cache data on first access', async () => {
      const fetcher = jest.fn(async () => 'test-data');

      const result = await cache.get('test-key', fetcher);

      expect(result).toBe('test-data');
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should return cached data on subsequent access', async () => {
      const fetcher = jest.fn(async () => 'test-data');

      const result1 = await cache.get('test-key', fetcher);
      const result2 = await cache.get('test-key', fetcher);

      expect(result1).toBe('test-data');
      expect(result2).toBe('test-data');
      expect(fetcher).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should respect custom TTL', async () => {
      const fetcher = jest.fn(async () => 'test-data');
      const shortTTL = 100; // 100ms

      // First call
      await cache.get('test-key', fetcher, { ttl: shortTTL });
      expect(fetcher).toHaveBeenCalledTimes(1);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Second call should re-fetch
      await cache.get('test-key', fetcher, { ttl: shortTTL });
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('should store tags with cache entries', async () => {
      const fetcher = async () => ({ id: '1', name: 'Test' });
      const tags = ['vendor', 'vendor:1'];

      await cache.get('vendor:1', fetcher, { tags });

      const info = cache.getEntryInfo();
      expect(info[0].tags).toEqual(tags);
    });

    it('should track access count', async () => {
      const fetcher = async () => 'test-data';

      await cache.get('test-key', fetcher);
      await cache.get('test-key', fetcher);
      await cache.get('test-key', fetcher);

      const info = cache.getEntryInfo();
      expect(info[0].accessCount).toBe(3);
    });
  });

  describe('invalidate()', () => {
    it('should remove a specific cache entry', async () => {
      const fetcher = jest.fn(async () => 'test-data');

      await cache.get('test-key', fetcher);
      expect(fetcher).toHaveBeenCalledTimes(1);

      cache.invalidate('test-key');

      await cache.get('test-key', fetcher);
      expect(fetcher).toHaveBeenCalledTimes(2); // Re-fetched
    });

    it('should handle invalidating non-existent keys gracefully', () => {
      expect(() => cache.invalidate('non-existent-key')).not.toThrow();
    });
  });

  describe('invalidatePattern()', () => {
    beforeEach(async () => {
      // Populate cache with test data
      await cache.get('vendor:1', async () => ({ id: '1' }));
      await cache.get('vendor:2', async () => ({ id: '2' }));
      await cache.get('vendor-id:1', async () => ({ id: '1' }));
      await cache.get('product:1', async () => ({ id: '1' }));
      await cache.get('vendor:1:products', async () => []);
    });

    it('should invalidate entries matching prefix pattern', () => {
      cache.invalidatePattern('vendor:*');

      const remainingKeys = cache.getEntryInfo().map(info => info.key);
      expect(remainingKeys).toContain('vendor-id:1');
      expect(remainingKeys).toContain('product:1');
      expect(remainingKeys).not.toContain('vendor:1');
      expect(remainingKeys).not.toContain('vendor:2');
      expect(remainingKeys).not.toContain('vendor:1:products');
    });

    it('should invalidate entries matching suffix pattern', () => {
      cache.invalidatePattern('*:1');

      const remainingKeys = cache.getEntryInfo().map(info => info.key);
      expect(remainingKeys).toContain('vendor:2');
      expect(remainingKeys).not.toContain('vendor:1');
      expect(remainingKeys).not.toContain('vendor-id:1');
      expect(remainingKeys).not.toContain('product:1');
    });

    it('should invalidate entries matching middle pattern', () => {
      cache.invalidatePattern('vendor:*:products');

      const remainingKeys = cache.getEntryInfo().map(info => info.key);
      expect(remainingKeys).toContain('vendor:1');
      expect(remainingKeys).toContain('product:1');
      expect(remainingKeys).not.toContain('vendor:1:products');
    });

    it('should handle patterns with no matches', () => {
      expect(() => cache.invalidatePattern('nonexistent:*')).not.toThrow();
    });
  });

  describe('invalidateByTags()', () => {
    beforeEach(async () => {
      // Populate cache with tagged data
      await cache.get('vendor:1', async () => ({ id: '1' }), { tags: ['vendor', 'vendor:1'] });
      await cache.get('vendor:2', async () => ({ id: '2' }), { tags: ['vendor', 'vendor:2'] });
      await cache.get('product:1', async () => ({ id: '1' }), { tags: ['product', 'product:1'] });
      await cache.get('untagged', async () => 'data'); // No tags
    });

    it('should invalidate entries with matching tags', () => {
      cache.invalidateByTags(['vendor']);

      const remainingKeys = cache.getEntryInfo().map(info => info.key);
      expect(remainingKeys).toContain('product:1');
      expect(remainingKeys).toContain('untagged');
      expect(remainingKeys).not.toContain('vendor:1');
      expect(remainingKeys).not.toContain('vendor:2');
    });

    it('should invalidate entries matching any of multiple tags', () => {
      cache.invalidateByTags(['vendor:1', 'product:1']);

      const remainingKeys = cache.getEntryInfo().map(info => info.key);
      expect(remainingKeys).toContain('vendor:2');
      expect(remainingKeys).toContain('untagged');
      expect(remainingKeys).not.toContain('vendor:1');
      expect(remainingKeys).not.toContain('product:1');
    });

    it('should handle empty tag array', () => {
      expect(() => cache.invalidateByTags([])).not.toThrow();
      expect(cache.getStats().size).toBe(4); // All entries remain
    });

    it('should not affect untagged entries', () => {
      cache.invalidateByTags(['vendor', 'product']);

      const remainingKeys = cache.getEntryInfo().map(info => info.key);
      expect(remainingKeys).toEqual(['untagged']);
    });
  });

  describe('clear()', () => {
    it('should remove all cache entries', async () => {
      await cache.get('key1', async () => 'data1');
      await cache.get('key2', async () => 'data2');
      await cache.get('key3', async () => 'data3');

      expect(cache.getStats().size).toBe(3);

      cache.clear();

      expect(cache.getStats().size).toBe(0);
    });

    it('should reset hit/miss counters', async () => {
      await cache.get('key1', async () => 'data1');
      await cache.get('key1', async () => 'data1'); // Hit

      let stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);

      cache.clear();

      stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('getStats()', () => {
    it('should return accurate cache statistics', async () => {
      // Miss
      await cache.get('key1', async () => 'data1');
      // Hit
      await cache.get('key1', async () => 'data1');
      // Miss
      await cache.get('key2', async () => 'data2');

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.entries).toBe(2);
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBeCloseTo(1 / 3, 2);
    });

    it('should return undefined hit rate when no accesses', () => {
      const stats = cache.getStats();

      expect(stats.hitRate).toBeUndefined();
    });
  });

  describe('getEntryInfo()', () => {
    it('should return detailed information about all entries', async () => {
      await cache.get('key1', async () => 'data1', { tags: ['tag1'] });
      await cache.get('key2', async () => 'data2', { tags: ['tag2'] });

      const info = cache.getEntryInfo();

      expect(info).toHaveLength(2);
      expect(info[0]).toMatchObject({
        key: 'key1',
        accessCount: 1,
        tags: ['tag1'],
      });
      expect(info[0].age).toBeGreaterThanOrEqual(0);
    });

    it('should update age over time', async () => {
      await cache.get('key1', async () => 'data1');

      const info1 = cache.getEntryInfo();
      const age1 = info1[0].age;

      await new Promise(resolve => setTimeout(resolve, 50));

      const info2 = cache.getEntryInfo();
      const age2 = info2[0].age;

      expect(age2).toBeGreaterThan(age1);
    });
  });

  describe('custom TTL', () => {
    it('should use custom TTL when provided', async () => {
      const shortCache = new InMemoryCacheService(100); // 100ms TTL
      const fetcher = jest.fn(async () => 'test-data');

      await shortCache.get('test-key', fetcher);
      expect(fetcher).toHaveBeenCalledTimes(1);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      await shortCache.get('test-key', fetcher);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Helper Functions', () => {
  describe('createCollectionPattern()', () => {
    it('should create pattern for collection without identifier', () => {
      expect(createCollectionPattern('vendor')).toBe('vendor*');
    });

    it('should create pattern for collection with identifier', () => {
      expect(createCollectionPattern('vendor', '123')).toBe('vendor*:123*');
    });
  });

  describe('createEntityTags()', () => {
    it('should create standard tags for entity', () => {
      const tags = createEntityTags('vendor', '123');

      expect(tags).toEqual(['vendor', 'vendor:123']);
    });
  });
});
