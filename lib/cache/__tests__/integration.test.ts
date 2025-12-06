/**
 * Integration Tests for Cache Service
 *
 * Tests the cache service as it would be used in the real application.
 */

import { InMemoryCacheService, createCollectionPattern, createEntityTags } from '../InMemoryCacheService';
import type { CacheService } from '../CacheService';

describe('Cache Service Integration', () => {
  describe('PayloadCMSDataService Integration Pattern', () => {
    let cache: CacheService;

    beforeEach(() => {
      cache = new InMemoryCacheService();
    });

    it('should handle vendor caching workflow', async () => {
      // Simulate fetching vendors from database
      const fetchVendors = jest.fn(async () => [
        { id: '1', slug: 'vendor-1', name: 'Vendor 1' },
        { id: '2', slug: 'vendor-2', name: 'Vendor 2' },
      ]);

      // First fetch - should hit database
      const vendors1 = await cache.get('vendors', fetchVendors, {
        tags: ['vendor'],
      });
      expect(fetchVendors).toHaveBeenCalledTimes(1);
      expect(vendors1).toHaveLength(2);

      // Second fetch - should use cache
      const vendors2 = await cache.get('vendors', fetchVendors, {
        tags: ['vendor'],
      });
      expect(fetchVendors).toHaveBeenCalledTimes(1); // Still only 1 call
      expect(vendors2).toBe(vendors1); // Same reference

      // Invalidate by tag
      cache.invalidateByTags(['vendor']);

      // Third fetch - should hit database again
      const vendors3 = await cache.get('vendors', fetchVendors, {
        tags: ['vendor'],
      });
      expect(fetchVendors).toHaveBeenCalledTimes(2);
    });

    it('should handle specific vendor invalidation', async () => {
      const fetchVendor = jest.fn(async (id: string) => ({
        id,
        slug: `vendor-${id}`,
        name: `Vendor ${id}`,
      }));

      // Cache multiple vendors
      await cache.get('vendor:vendor-1', async () => fetchVendor('1'), {
        tags: createEntityTags('vendor', '1'),
      });
      await cache.get('vendor:vendor-2', async () => fetchVendor('2'), {
        tags: createEntityTags('vendor', '2'),
      });

      expect(fetchVendor).toHaveBeenCalledTimes(2);

      // Access cached vendor
      await cache.get('vendor:vendor-1', async () => fetchVendor('1'), {
        tags: createEntityTags('vendor', '1'),
      });
      expect(fetchVendor).toHaveBeenCalledTimes(2); // No additional call

      // Invalidate specific vendor by tag
      cache.invalidateByTags(['vendor:1']);

      // vendor-1 should be refetched, vendor-2 still cached
      await cache.get('vendor:vendor-1', async () => fetchVendor('1'), {
        tags: createEntityTags('vendor', '1'),
      });
      expect(fetchVendor).toHaveBeenCalledTimes(3);

      await cache.get('vendor:vendor-2', async () => fetchVendor('2'), {
        tags: createEntityTags('vendor', '2'),
      });
      expect(fetchVendor).toHaveBeenCalledTimes(3); // Still cached
    });

    it('should handle vendor cache clearing pattern', async () => {
      // Simulate the clearVendorCache() method pattern
      const clearVendorCache = (vendorIdOrSlug?: string) => {
        if (vendorIdOrSlug) {
          // Clear specific vendor caches
          cache.invalidatePattern(`vendor*:${vendorIdOrSlug}*`);
          cache.invalidatePattern(`*:${vendorIdOrSlug}*`);
        } else {
          // Clear all vendor-related cache
          cache.invalidateByTags(['vendor']);
        }

        // Always clear list caches
        cache.invalidate('vendors');
        cache.invalidate('partners');
        cache.invalidate('featured-partners');
      };

      // Populate cache
      await cache.get('vendors', async () => [], { tags: ['vendor'] });
      await cache.get('vendor:vendor-1', async () => ({}), { tags: ['vendor', 'vendor:1'] });
      await cache.get('vendor-id:1', async () => ({}), { tags: ['vendor', 'vendor:1'] });
      await cache.get('enhanced-vendor:1', async () => ({}), { tags: ['vendor', 'vendor:1'] });
      await cache.get('partners', async () => [], { tags: ['vendor'] });

      expect(cache.getStats().size).toBe(5);

      // Clear specific vendor
      clearVendorCache('vendor-1');

      // Vendor-specific caches should be cleared
      const remainingKeys = cache.getEntryInfo().map(info => info.key);
      expect(remainingKeys).not.toContain('vendors');
      expect(remainingKeys).not.toContain('partners');
      expect(remainingKeys).not.toContain('vendor:vendor-1');
    });

    it('should handle blog cache clearing pattern', async () => {
      // Simulate the clearBlogCache() method pattern
      const clearBlogCache = (blogSlug?: string) => {
        if (blogSlug) {
          cache.invalidate(`blog-post:${blogSlug}`);
        }

        // Always clear list caches
        cache.invalidate('blog-posts');
        cache.invalidate('blog-categories');
        cache.invalidate('popular-tags');
      };

      // Populate cache
      await cache.get('blog-posts', async () => [], { tags: ['blog'] });
      await cache.get('blog-post:my-post', async () => ({}), { tags: ['blog', 'blog:my-post'] });
      await cache.get('blog-categories', async () => [], { tags: ['blog'] });

      expect(cache.getStats().size).toBe(3);

      // Clear specific blog post
      clearBlogCache('my-post');

      // Blog post and list caches should be cleared
      const remainingKeys = cache.getEntryInfo().map(info => info.key);
      expect(remainingKeys).not.toContain('blog-posts');
      expect(remainingKeys).not.toContain('blog-post:my-post');
      expect(remainingKeys).not.toContain('blog-categories');
    });

    it('should track cache statistics correctly', async () => {
      const fetcher = async () => ({ data: 'test' });

      // First access - miss
      await cache.get('test-key', fetcher);

      let stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0);

      // Second access - hit
      await cache.get('test-key', fetcher);

      stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);

      // Third access - hit
      await cache.get('test-key', fetcher);

      stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.667, 2);
    });
  });

  describe('Pattern Matching Edge Cases', () => {
    let cache: CacheService;

    beforeEach(() => {
      cache = new InMemoryCacheService();
    });

    it('should handle special regex characters in keys', async () => {
      await cache.get('vendor:test.slug', async () => ({}));
      await cache.get('vendor:test+slug', async () => ({}));
      await cache.get('vendor:test[1]', async () => ({}));

      // Should not throw
      expect(() => cache.invalidatePattern('vendor:test.*')).not.toThrow();
    });

    it('should handle complex patterns', async () => {
      await cache.get('vendor:1:products:featured', async () => ({}));
      await cache.get('vendor:2:products:all', async () => ({}));
      await cache.get('product:1:vendor:1', async () => ({}));

      cache.invalidatePattern('vendor:*:products:*');

      const remainingKeys = cache.getEntryInfo().map(info => info.key);
      expect(remainingKeys).toContain('product:1:vendor:1');
      expect(remainingKeys).not.toContain('vendor:1:products:featured');
      expect(remainingKeys).not.toContain('vendor:2:products:all');
    });
  });

  describe('Helper Functions', () => {
    it('should create appropriate collection patterns', () => {
      expect(createCollectionPattern('vendor')).toBe('vendor*');
      expect(createCollectionPattern('vendor', '123')).toBe('vendor*:123*');
      expect(createCollectionPattern('product', 'test-slug')).toBe('product*:test-slug*');
    });

    it('should create appropriate entity tags', () => {
      expect(createEntityTags('vendor', '123')).toEqual(['vendor', 'vendor:123']);
      expect(createEntityTags('product', '456')).toEqual(['product', 'product:456']);
    });
  });
});
