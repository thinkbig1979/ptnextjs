# Pagination Implementation

## Overview

This document describes the pagination system implemented for the Paul Thames Superyacht Technology platform. The implementation adds efficient database-level pagination to replace the previous in-memory filtering approach.

## Files Modified/Created

### Core Pagination Types

**File:** `/home/edwin/development/ptnextjs/lib/types/pagination.ts` (NEW)

This file contains:
- `PaginationParams` - Query parameters for pagination
- `PaginatedResult<T>` - Generic paginated response wrapper
- `PAGINATION_DEFAULTS` - Configuration constants
- `normalizePaginationParams()` - Parameter validation/normalization
- `calculatePaginationMetadata()` - Metadata calculation helper

**Configuration:**
- Default page size: 20 items
- Maximum page size: 100 items
- Default sort: `-createdAt` (newest first)

### Repository Types

**File:** `/home/edwin/development/ptnextjs/lib/repositories/types_new.ts` (NEW - to replace types.ts)

Enhanced `QueryParams` interface now extends `PaginationParams` and includes:
- `page` - Page number (1-indexed)
- `limit` - Items per page
- `sort` - Sort field (prefix with '-' for descending)
- `order` - Sort order ('asc' | 'desc')
- `depth` - Relationship depth for Payload CMS queries (0-3)

### Updated Repositories

#### VendorRepository

**File:** `/home/edwin/development/ptnextjs/lib/repositories/VendorRepository_new.ts` (NEW - to replace VendorRepository.ts)

**New Methods:**
- `getVendorsPaginated(params?)` - Paginated vendor listing
- `getFeaturedVendorsPaginated(params?)` - Paginated featured vendors
- `getPartnersPaginated(params?)` - Paginated partners
- `getFeaturedPartnersPaginated(params?)` - Paginated featured partners

**Optimizations:**
- Configurable depth parameter (default: 1 for lists, 2 for details)
- Database-level filtering (no in-memory processing)
- Proper cache key generation with pagination params

**Backward Compatibility:**
- Original methods marked with `@deprecated` but still functional
- All existing code continues to work without changes

#### ProductRepository

**File:** `/home/edwin/development/ptnextjs/lib/repositories/ProductRepository_new.ts` (NEW - to replace ProductRepository.ts)

**New Methods:**
- `getProductsPaginated(params?)` - Paginated product listing
- `getProductsByVendorPaginated(vendorId, params?)` - Paginated vendor products
- `getProductsByPartnerPaginated(partnerId, params?)` - Legacy compatibility

**Features:**
- Vendor/partner relationship filtering
- Category filtering
- Featured product filtering
- Configurable depth for relationships

#### BlogRepository

**File:** `/home/edwin/development/ptnextjs/lib/repositories/BlogRepository_new.ts` (NEW - to replace BlogRepository.ts)

**New Methods:**
- `getBlogPostsPaginated(params?)` - Paginated blog posts
- `getFeaturedBlogPostsPaginated(params?)` - Paginated featured posts

**Features:**
- Default sort by `publishedAt` descending
- Category filtering
- Featured post filtering

### API Routes

#### Vendors API

**File:** `/home/edwin/development/ptnextjs/app/api/vendors/route.ts` (NEW)

**Endpoint:** `GET /api/vendors`

**Query Parameters:**
```typescript
{
  page?: number;        // Page number (default: 1)
  limit?: number;       // Items per page (default: 20, max: 100)
  sort?: string;        // Sort field (default: '-createdAt')
  order?: 'asc' | 'desc'; // Sort order (default: 'desc')
  category?: string;    // Filter by category
  featured?: boolean;   // Filter featured vendors
  partnersOnly?: boolean; // Filter partners only
  depth?: number;       // Relationship depth 0-3 (default: 1)
}
```

**Response:**
```typescript
{
  docs: Vendor[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  offset: number;
  nextPage: number | null;
  prevPage: number | null;
}
```

#### Products API

**File:** `/home/edwin/development/ptnextjs/app/api/products/route.ts` (NEW)

**Endpoint:** `GET /api/products`

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  category?: string;
  vendorId?: string;    // Filter by vendor
  featured?: boolean;
  depth?: number;
}
```

#### Blog API

**File:** `/home/edwin/development/ptnextjs/app/api/blog/route.ts` (NEW)

**Endpoint:** `GET /api/blog`

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  sort?: string;        // Default: '-publishedAt'
  order?: 'asc' | 'desc';
  category?: string;
  featured?: boolean;
  depth?: number;
}
```

## Usage Examples

### Basic Pagination

```typescript
import { VendorRepository } from '@/lib/repositories/VendorRepository';
import { CacheService } from '@/lib/cache';

const cache = new CacheService();
const vendorRepo = new VendorRepository(cache);

// Get first page of vendors (20 items)
const page1 = await vendorRepo.getVendorsPaginated();

// Get second page with 50 items
const page2 = await vendorRepo.getVendorsPaginated({
  page: 2,
  limit: 50
});

// Get featured partners, sorted by name
const partners = await vendorRepo.getPartnersPaginated({
  featured: true,
  sort: 'name',
  order: 'asc',
  limit: 10
});
```

### Filtered Pagination

```typescript
// Products by vendor with pagination
const vendorProducts = await productRepo.getProductsByVendorPaginated(
  'vendor-id-123',
  { page: 1, limit: 25 }
);

// Featured blog posts with shallow depth (for performance)
const featuredPosts = await blogRepo.getFeaturedBlogPostsPaginated({
  page: 1,
  limit: 10,
  depth: 0  // No relationships, just post data
});
```

### API Usage

```bash
# Get vendors page 2 with 30 items per page
curl "http://localhost:3000/api/vendors?page=2&limit=30"

# Get featured products from specific vendor
curl "http://localhost:3000/api/products?vendorId=abc123&featured=true&limit=20"

# Get blog posts sorted by title
curl "http://localhost:3000/api/blog?sort=title&order=asc"
```

## Performance Optimizations

### Depth Control

The `depth` parameter controls how many levels of relationships Payload CMS resolves:

- **depth: 0** - No relationships (fastest, smallest payload)
- **depth: 1** - One level of relationships (good for list views)
- **depth: 2** - Two levels (good for detail views, DEFAULT)
- **depth: 3** - Three levels (comprehensive data, slowest)

**Recommendations:**
- List views: Use depth 0-1
- Detail pages: Use depth 2-3
- Slug generation: Use depth 0

### Database-Level Filtering

All filtering now happens at the database level via Payload CMS queries:

```typescript
// OLD: Load everything, filter in memory
const allVendors = await getAllVendors(); // Load 1000 vendors
const featured = allVendors.filter(v => v.featured); // Memory filter

// NEW: Filter at database level
const featured = await getVendorsPaginated({
  featured: true,
  limit: 20
}); // Only load 20 vendors
```

### Caching Strategy

Pagination params are included in cache keys to ensure correct cache hits:

```typescript
const cacheKey = `vendors:paginated:${JSON.stringify({
  page, limit, sort, order, category, featured
})}`;
```

## Migration Strategy

### Phase 1: Add New Methods (COMPLETED)

- ✅ Created pagination types
- ✅ Updated repository types
- ✅ Added `*Paginated()` methods to repositories
- ✅ Created API routes with pagination support

### Phase 2: Update Existing Code (TO DO)

To activate the new pagination system:

1. **Replace repository files:**
   ```bash
   mv lib/repositories/types_new.ts lib/repositories/types.ts
   mv lib/repositories/VendorRepository_new.ts lib/repositories/VendorRepository.ts
   mv lib/repositories/ProductRepository_new.ts lib/repositories/ProductRepository.ts
   mv lib/repositories/BlogRepository_new.ts lib/repositories/BlogRepository.ts
   ```

2. **Update imports in existing code:**
   ```typescript
   // Update any direct imports of repository types
   import type { VendorQueryParams } from '@/lib/repositories/types';
   ```

3. **Optional: Migrate to paginated methods**
   - Update frontend components to use paginated APIs
   - Replace `getVendors()` calls with `getVendorsPaginated()`
   - Add pagination UI components

### Phase 3: Remove Deprecated Methods (FUTURE)

Once all code uses paginated methods:
- Remove `@deprecated` methods
- Update documentation
- Remove backward compatibility code

## Backward Compatibility

All original methods continue to work:
- `getAllVendors()` - Returns all vendors (limit 1000)
- `getVendors(params)` - Returns filtered vendors (limit 1000)
- `getAllProducts()` - Returns all products (limit 1000)
- etc.

New code should use paginated methods:
- `getVendorsPaginated(params)` - Returns paginated result
- `getProductsPaginated(params)` - Returns paginated result
- etc.

## Testing

### Unit Tests (TODO)

```typescript
describe('VendorRepository Pagination', () => {
  it('should return first page with default limit', async () => {
    const result = await vendorRepo.getVendorsPaginated();
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.docs.length).toBeLessThanOrEqual(20);
  });

  it('should respect max limit', async () => {
    const result = await vendorRepo.getVendorsPaginated({ limit: 200 });
    expect(result.limit).toBe(100); // Capped at MAX_LIMIT
  });

  it('should filter by category with pagination', async () => {
    const result = await vendorRepo.getVendorsPaginated({
      category: 'electronics',
      page: 1,
      limit: 10
    });
    expect(result.docs.every(v => v.categories?.includes('electronics'))).toBe(true);
  });
});
```

### API Tests (TODO)

```typescript
describe('GET /api/vendors', () => {
  it('should return paginated vendors', async () => {
    const response = await fetch('/api/vendors?page=1&limit=10');
    const data = await response.json();

    expect(data).toHaveProperty('docs');
    expect(data).toHaveProperty('totalDocs');
    expect(data).toHaveProperty('page', 1);
    expect(data).toHaveProperty('limit', 10);
    expect(data.docs.length).toBeLessThanOrEqual(10);
  });
});
```

## Acceptance Criteria

- ✅ Pagination types defined in `lib/types/pagination.ts`
- ✅ VendorRepository supports pagination with `getVendorsPaginated()`
- ✅ ProductRepository supports pagination with `getProductsPaginated()`
- ✅ BlogRepository supports pagination with `getBlogPostsPaginated()`
- ✅ API routes accept page/limit params at `/api/vendors`, `/api/products`, `/api/blog`
- ✅ Backward compatible - existing calls continue to work
- ✅ TypeScript strict types throughout
- ✅ Default page size: 20
- ✅ Max page size: 100
- ✅ Filtering pushed to database (not in-memory)
- ⏳ Memory usage stays constant (needs verification with load testing)

## Next Steps

1. **Activate the implementation:**
   - Rename `*_new.ts` files to replace originals
   - Run type checking to verify no breaks
   - Run existing test suite

2. **Add comprehensive tests:**
   - Unit tests for pagination functions
   - Integration tests for repositories
   - API route tests

3. **Update frontend:**
   - Add pagination UI components
   - Update list views to use paginated APIs
   - Implement infinite scroll or page navigation

4. **Performance testing:**
   - Load test with large datasets
   - Verify memory usage stays constant
   - Benchmark query performance

5. **Documentation:**
   - Update API documentation
   - Add usage examples to README
   - Document pagination best practices
