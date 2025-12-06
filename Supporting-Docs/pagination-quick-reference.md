# Pagination Quick Reference

## Quick Start

### Install/Activate

```bash
# Option 1: Automated
chmod +x scripts/activate-pagination.sh
./scripts/activate-pagination.sh

# Option 2: Manual
mv lib/repositories/types_new.ts lib/repositories/types.ts
mv lib/repositories/VendorRepository_new.ts lib/repositories/VendorRepository.ts
mv lib/repositories/ProductRepository_new.ts lib/repositories/ProductRepository.ts
mv lib/repositories/BlogRepository_new.ts lib/repositories/BlogRepository.ts
```

## API Quick Reference

### Vendors

```bash
# Basic pagination
GET /api/vendors?page=1&limit=20

# Filtered pagination
GET /api/vendors?page=2&limit=50&category=electronics&featured=true

# Partners only
GET /api/vendors?partnersOnly=true&page=1&limit=10

# Sorted
GET /api/vendors?sort=name&order=asc&limit=30

# Minimal data (fast)
GET /api/vendors?depth=0&limit=100
```

### Products

```bash
# Basic pagination
GET /api/products?page=1&limit=20

# By vendor
GET /api/products?vendorId=abc123&page=1&limit=25

# By category
GET /api/products?category=navigation&featured=true

# Sorted by name
GET /api/products?sort=name&order=asc
```

### Blog

```bash
# Latest posts
GET /api/blog?page=1&limit=10

# By category
GET /api/blog?category=technology&page=1

# Featured posts
GET /api/blog?featured=true&limit=5

# Custom sort
GET /api/blog?sort=title&order=asc
```

## Repository Quick Reference

### Basic Usage

```typescript
import { VendorRepository } from '@/lib/repositories/VendorRepository';
import { CacheService } from '@/lib/cache';

const cache = new CacheService();
const repo = new VendorRepository(cache);

// Get first page (20 items)
const page1 = await repo.getVendorsPaginated();

// Get specific page
const page2 = await repo.getVendorsPaginated({ page: 2, limit: 50 });

// Filtered
const featured = await repo.getVendorsPaginated({
  featured: true,
  page: 1,
  limit: 10
});
```

### Common Patterns

```typescript
// Partners only
const partners = await repo.getPartnersPaginated({ page: 1, limit: 20 });

// Featured partners
const featuredPartners = await repo.getFeaturedPartnersPaginated();

// By category
const electronics = await repo.getVendorsPaginated({
  category: 'electronics',
  limit: 50
});

// Custom sort
const alphabetical = await repo.getVendorsPaginated({
  sort: 'name',
  order: 'asc'
});

// Minimal data (fast, depth=0)
const slugsOnly = await repo.getVendorsPaginated({
  depth: 0,
  limit: 100
});
```

### Products

```typescript
import { ProductRepository } from '@/lib/repositories/ProductRepository';

const productRepo = new ProductRepository(cache);

// All products
const products = await productRepo.getProductsPaginated();

// By vendor
const vendorProducts = await productRepo.getProductsByVendorPaginated(
  'vendor-id-123',
  { page: 1, limit: 25 }
);

// By category
const category = await productRepo.getProductsPaginated({
  category: 'electronics',
  featured: true
});
```

### Blog

```typescript
import { BlogRepository } from '@/lib/repositories/BlogRepository';

const blogRepo = new BlogRepository(cache);

// Latest posts (auto-sorted by publishedAt)
const latest = await blogRepo.getBlogPostsPaginated({ limit: 10 });

// Featured posts
const featured = await blogRepo.getFeaturedBlogPostsPaginated();

// By category
const tech = await blogRepo.getBlogPostsPaginated({
  category: 'technology',
  page: 1
});
```

## Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | number | 1 | - | Page number (1-indexed) |
| `limit` | number | 20 | 100 | Items per page |
| `sort` | string | '-createdAt' | - | Sort field (prefix '-' for desc) |
| `order` | 'asc'\|'desc' | 'desc' | - | Sort order |
| `category` | string | - | - | Filter by category |
| `featured` | boolean | - | - | Filter featured items |
| `partnersOnly` | boolean | - | - | Filter partners (vendors only) |
| `vendorId` | string | - | - | Filter by vendor (products only) |
| `depth` | number | 1 | 3 | Relationship depth |

## Response Format

```typescript
{
  docs: T[];              // Array of entities
  totalDocs: number;      // Total count across all pages
  page: number;           // Current page (1-indexed)
  totalPages: number;     // Total number of pages
  hasNextPage: boolean;   // Whether there's a next page
  hasPrevPage: boolean;   // Whether there's a previous page
  limit: number;          // Items per page
  offset: number;         // Number of items skipped
  nextPage: number | null; // Next page number
  prevPage: number | null; // Previous page number
}
```

## Depth Guide

Choose depth based on use case:

| Depth | Use Case | Performance | Data Included |
|-------|----------|-------------|---------------|
| 0 | Slug generation, minimal lists | Fastest (~10ms) | IDs, slugs, basic fields |
| 1 | List views, grids | Fast (~25ms) | + First level relationships |
| 2 | Detail pages (default) | Medium (~50ms) | + Second level relationships |
| 3 | Full profiles, comprehensive | Slow (~100ms) | + Third level relationships |

### Examples

```typescript
// List view - fast loading
const vendors = await repo.getVendorsPaginated({ depth: 1, limit: 20 });

// Detail page - comprehensive
const vendor = await repo.getVendorById('id', 3);

// Slug generation - minimal
const slugs = await repo.getVendorSlugs(); // Uses depth: 0 internally
```

## Performance Tips

### 1. Use appropriate depth

```typescript
// ❌ Too much data for a list
const vendors = await repo.getVendorsPaginated({ depth: 3, limit: 20 });

// ✅ Just right for a list
const vendors = await repo.getVendorsPaginated({ depth: 1, limit: 20 });

// ✅ Comprehensive for detail page
const vendor = await repo.getVendorById(id, 3);
```

### 2. Optimize page size

```typescript
// ❌ Too many items per page
const vendors = await repo.getVendorsPaginated({ limit: 100 });

// ✅ Reasonable page size
const vendors = await repo.getVendorsPaginated({ limit: 20 });
```

### 3. Cache-friendly queries

```typescript
// ✅ Same query = cache hit
const page1 = await repo.getVendorsPaginated({ page: 1, limit: 20 });
const page1Again = await repo.getVendorsPaginated({ page: 1, limit: 20 }); // Cached

// ❌ Different order = cache miss
const vendors1 = await repo.getVendorsPaginated({ page: 1, category: 'a' });
const vendors2 = await repo.getVendorsPaginated({ category: 'a', page: 1 }); // Different cache key
```

## Migration from Old API

### Before (Old API)

```typescript
// Load everything into memory
const allVendors = await getAllVendors(); // 1000 vendors

// Filter in memory
const featured = allVendors.filter(v => v.featured);

// Paginate in memory
const page1 = featured.slice(0, 20);
const page2 = featured.slice(20, 40);
```

### After (New API)

```typescript
// Load only what you need
const page1 = await getVendorsPaginated({
  featured: true,
  page: 1,
  limit: 20
});

const page2 = await getVendorsPaginated({
  featured: true,
  page: 2,
  limit: 20
});
```

## Backward Compatibility

Old methods still work:

```typescript
// Still works
const allVendors = await repo.getAllVendors();
const vendors = await repo.getVendors({ category: 'electronics' });

// But these are better
const allVendorsPaginated = await repo.getVendorsPaginated();
const vendorsPaginated = await repo.getVendorsPaginated({ category: 'electronics' });
```

## Common Mistakes

### ❌ Requesting too much data

```typescript
// Loads 100 vendors with full relationships
const vendors = await repo.getVendorsPaginated({ depth: 3, limit: 100 });
```

### ✅ Request appropriate data

```typescript
// Loads 20 vendors with minimal relationships
const vendors = await repo.getVendorsPaginated({ depth: 1, limit: 20 });
```

### ❌ Not using pagination

```typescript
// Loads all 1000 vendors
const allVendors = await repo.getAllVendors();
const firstTen = allVendors.slice(0, 10);
```

### ✅ Use pagination from the start

```typescript
// Loads only 10 vendors
const firstTen = await repo.getVendorsPaginated({ limit: 10 });
```

## Testing Pagination

```typescript
import { VendorRepository } from '@/lib/repositories/VendorRepository';

describe('Pagination', () => {
  it('should return first page', async () => {
    const result = await repo.getVendorsPaginated({ page: 1, limit: 10 });

    expect(result.page).toBe(1);
    expect(result.docs.length).toBeLessThanOrEqual(10);
    expect(result.totalDocs).toBeGreaterThan(0);
  });

  it('should respect max limit', async () => {
    const result = await repo.getVendorsPaginated({ limit: 200 });

    expect(result.limit).toBe(100); // Capped at max
  });

  it('should calculate pagination metadata', async () => {
    const result = await repo.getVendorsPaginated({ page: 2, limit: 10 });

    expect(result.offset).toBe(10);
    expect(result.prevPage).toBe(1);
    if (result.totalPages > 2) {
      expect(result.hasNextPage).toBe(true);
      expect(result.nextPage).toBe(3);
    }
  });
});
```

## Frontend Integration Examples

### React with SWR

```typescript
import useSWR from 'swr';

function VendorList() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR(
    `/api/vendors?page=${page}&limit=20`
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading vendors</div>;

  return (
    <div>
      {data.docs.map(vendor => (
        <VendorCard key={vendor.id} vendor={vendor} />
      ))}

      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        onPageChange={setPage}
        hasNextPage={data.hasNextPage}
        hasPrevPage={data.hasPrevPage}
      />
    </div>
  );
}
```

### Next.js Server Component

```typescript
// app/vendors/page.tsx
export default async function VendorsPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const limit = parseInt(searchParams.limit || '20', 10);

  const response = await fetch(
    `http://localhost:3000/api/vendors?page=${page}&limit=${limit}`,
    { cache: 'no-store' }
  );
  const data = await response.json();

  return (
    <div>
      {data.docs.map(vendor => (
        <VendorCard key={vendor.id} vendor={vendor} />
      ))}

      <PaginationControls
        page={data.page}
        totalPages={data.totalPages}
      />
    </div>
  );
}
```

## Support

For detailed documentation, see:
- `/home/edwin/development/ptnextjs/Supporting-Docs/pagination-implementation.md`
- `/home/edwin/development/ptnextjs/PAGINATION_SUMMARY.md`
