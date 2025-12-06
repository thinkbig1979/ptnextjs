# Cache Service

A flexible, extensible caching layer for the Paul Thames Superyacht Technology platform.

## Features

- **Multiple Implementations**: Support for different cache backends (in-memory, Redis, etc.)
- **TTL-based Expiration**: Configurable time-to-live for cache entries
- **Tag-based Invalidation**: Group and invalidate cache entries by tags
- **Pattern-based Invalidation**: Invalidate entries using wildcard patterns
- **Statistics & Monitoring**: Track cache hits, misses, and hit rates
- **TypeScript First**: Fully typed for excellent IDE support

## Installation

The cache service is part of the `lib/cache` module:

```typescript
import { InMemoryCacheService } from '@/lib/cache';
```

## Basic Usage

### Creating a Cache Instance

```typescript
import { InMemoryCacheService } from '@/lib/cache';

// Create with default 5-minute TTL
const cache = new InMemoryCacheService();

// Or specify custom default TTL (in milliseconds)
const cache = new InMemoryCacheService(10 * 60 * 1000); // 10 minutes
```

### Caching Data

```typescript
// Basic caching
const vendors = await cache.get('vendors', async () => {
  return await fetchVendorsFromDatabase();
});

// With custom TTL
const products = await cache.get('products', async () => {
  return await fetchProductsFromDatabase();
}, { ttl: 15 * 60 * 1000 }); // 15 minutes

// With tags for grouped invalidation
const vendor = await cache.get(`vendor:${id}`, async () => {
  return await fetchVendorById(id);
}, { tags: ['vendor', `vendor:${id}`] });
```

### Invalidation Strategies

#### Invalidate Specific Key

```typescript
// Invalidate a single cache entry
cache.invalidate('vendor:123');
```

#### Invalidate by Pattern

```typescript
// Invalidate all vendor entries
cache.invalidatePattern('vendor:*');

// Invalidate all entries ending with :123
cache.invalidatePattern('*:123');

// Invalidate with middle pattern
cache.invalidatePattern('vendor:*:products');
```

#### Invalidate by Tags

```typescript
// Invalidate all entries tagged with 'vendor'
cache.invalidateByTags(['vendor']);

// Invalidate entries with any of the specified tags
cache.invalidateByTags(['vendor:123', 'product:456']);
```

#### Clear All

```typescript
// Clear entire cache
cache.clear();
```

## Advanced Usage

### Helper Functions

```typescript
import { createCollectionPattern, createEntityTags } from '@/lib/cache';

// Create invalidation patterns
const pattern = createCollectionPattern('vendor', '123');
// Returns: 'vendor*:123*'

// Create standard entity tags
const tags = createEntityTags('vendor', '123');
// Returns: ['vendor', 'vendor:123']
```

### Monitoring Cache Performance

```typescript
// Get cache statistics
const stats = cache.getStats();
console.log(`Cache size: ${stats.size}`);
console.log(`Hit rate: ${stats.hitRate}`);
console.log(`Hits: ${stats.hits}, Misses: ${stats.misses}`);

// Get detailed entry information
const entries = cache.getEntryInfo();
entries.forEach(entry => {
  console.log(`Key: ${entry.key}`);
  console.log(`Age: ${entry.age}ms`);
  console.log(`Access count: ${entry.accessCount}`);
  console.log(`Tags: ${entry.tags?.join(', ')}`);
});
```

## Integration with PayloadCMSDataService

The cache service was extracted from `PayloadCMSDataService` to be a standalone, reusable module. Here's how to integrate it:

```typescript
class PayloadCMSDataService {
  private cache: CacheService;

  constructor() {
    this.cache = new InMemoryCacheService();
  }

  async getAllVendors(): Promise<Vendor[]> {
    return this.cache.get('vendors', async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: 'vendors',
        where: { published: { equals: true } },
        limit: 1000,
      });
      return result.docs.map(this.transformVendor);
    }, { tags: ['vendor'] });
  }

  // Invalidate vendor cache when vendor is updated
  clearVendorCache(vendorIdOrSlug?: string): void {
    if (vendorIdOrSlug) {
      // Invalidate specific vendor
      this.cache.invalidatePattern(`vendor*:${vendorIdOrSlug}*`);
      this.cache.invalidatePattern(`*:${vendorIdOrSlug}*`);
    } else {
      // Invalidate all vendor-related cache
      this.cache.invalidateByTags(['vendor']);
    }

    // Always invalidate list caches
    this.cache.invalidatePattern('vendors');
    this.cache.invalidatePattern('partners');
    this.cache.invalidatePattern('featured-partners');
  }
}
```

## Cache Key Naming Conventions

For consistency across the codebase, follow these naming conventions:

### Collection Lists
- `vendors` - All vendors
- `products` - All products
- `blog-posts` - All blog posts
- `featured-partners` - Featured partners
- `categories:all` - All categories
- `tags:all` - All tags

### Single Entities
- `vendor:{slug}` - Vendor by slug
- `vendor-id:{id}` - Vendor by ID
- `product:{slug}` - Product by slug
- `blog-post:{slug}` - Blog post by slug
- `category:{slug}` - Category by slug

### Derived Data
- `vendor-certifications:{id}` - Vendor's certifications
- `vendor-awards:{id}` - Vendor's awards
- `vendor-social-proof:{id}` - Vendor's social proof
- `yachts:vendor:{slug}` - Yachts by vendor
- `products:vendor:{slug}` - Products by vendor

### Computed/Filtered Data
- `tags:popular:{limit}` - Popular tags with limit
- `yachts:featured` - Featured yachts
- `enhanced-vendor:{id}` - Enhanced vendor profile

## Testing

The cache service includes comprehensive tests in `__tests__/InMemoryCacheService.test.ts`:

```bash
npm run test lib/cache/__tests__/InMemoryCacheService.test.ts
```

## Future Enhancements

Potential future additions to the cache service:

1. **Redis Implementation**: `RedisCacheService` for distributed caching
2. **Layered Caching**: Combine in-memory + Redis for optimal performance
3. **Automatic Background Refresh**: Refresh expiring entries in background
4. **Cache Warming**: Pre-populate cache on startup
5. **Metrics Export**: Export cache metrics to monitoring systems
6. **Adaptive TTL**: Automatically adjust TTL based on access patterns

## Architecture

```
lib/cache/
├── index.ts                    # Public exports
├── types.ts                    # TypeScript interfaces
├── CacheService.ts             # Abstract interface
├── InMemoryCacheService.ts     # In-memory implementation
├── README.md                   # This file
└── __tests__/
    └── InMemoryCacheService.test.ts
```

## API Reference

### CacheService Interface

```typescript
interface CacheService {
  get<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T>;
  invalidate(key: string): void;
  invalidatePattern(pattern: string): void;
  invalidateByTags(tags: string[]): void;
  clear(): void;
  getStats(): CacheStats;
  getEntryInfo(): CacheEntryInfo[];
}
```

### Types

```typescript
interface CacheOptions {
  ttl?: number;      // Time-to-live in milliseconds
  tags?: string[];   // Tags for grouped invalidation
}

interface CacheStats {
  size: number;      // Number of entries
  entries: number;   // Same as size (backward compatibility)
  hitRate?: number;  // Cache hit rate (0-1)
  hits?: number;     // Total cache hits
  misses?: number;   // Total cache misses
}

interface CacheEntryInfo {
  key: string;        // Cache key
  age: number;        // Age in milliseconds
  accessCount: number; // Number of accesses
  tags?: string[];    // Optional tags
}
```

## License

Part of the Paul Thames Superyacht Technology platform.
