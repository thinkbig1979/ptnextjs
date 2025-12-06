# Repository Pattern Implementation

This directory contains entity-specific repositories that provide a clean data access layer for the application.

## Architecture

```
lib/repositories/
├── index.ts                    # Exports and RepositoryFactory
├── types.ts                    # Common repository types
├── BaseRepository.ts           # Shared base class with cache support
├── VendorRepository.ts         # Vendor/Partner data access
├── ProductRepository.ts        # Product data access
├── BlogRepository.ts           # Blog post data access
├── YachtRepository.ts          # Yacht data access
├── CategoryRepository.ts       # Category data access
├── TagRepository.ts            # Tag data access
└── CompanyRepository.ts        # Company + Team data access
```

## Key Features

- **Clean Separation**: Each entity has its own dedicated repository
- **Optional Caching**: Repositories accept optional `CacheService` injection
- **Consistent API**: All repositories extend `BaseRepository` with common patterns
- **Type Safety**: Full TypeScript support with proper types
- **Legacy Compatibility**: Vendor repository includes Partner methods for backward compatibility

## Usage

### Basic Usage (No Caching)

```typescript
import { VendorRepository, ProductRepository } from '@/lib/repositories';

const vendorRepo = new VendorRepository();
const vendors = await vendorRepo.getAllVendors();

const productRepo = new ProductRepository();
const products = await productRepo.getAllProducts();
```

### With Caching

```typescript
import { VendorRepository, ProductRepository } from '@/lib/repositories';
import { InMemoryCacheService } from '@/lib/cache';

const cache = new InMemoryCacheService();
const vendorRepo = new VendorRepository(cache);
const productRepo = new ProductRepository(cache);

// First call hits database
const vendors = await vendorRepo.getAllVendors();

// Second call uses cache
const vendorsCached = await vendorRepo.getAllVendors();
```

### Using Repository Factory

```typescript
import { createRepositories } from '@/lib/repositories';
import { InMemoryCacheService } from '@/lib/cache';

const cache = new InMemoryCacheService();
const repos = createRepositories(cache);

// All repositories share the same cache instance
const vendors = await repos.vendor().getAllVendors();
const products = await repos.product().getAllProducts();
const blogPosts = await repos.blog().getAllBlogPosts();

// Clear all caches at once
repos.clearAllCaches();
```

## Repository Methods

### VendorRepository

- `getAllVendors()` - Get all vendors
- `getVendors(params?)` - Get vendors with filtering (category, featured, partnersOnly)
- `getVendorBySlug(slug)` - Get vendor by slug
- `getVendorById(id)` - Get vendor by ID
- `getFeaturedVendors()` - Get featured vendors
- `getVendorSlugs()` - Get all vendor slugs (for static generation)
- `getVendorCertifications(vendorId)` - Get vendor certifications
- `getVendorAwards(vendorId)` - Get vendor awards
- `getVendorSocialProof(vendorId)` - Get vendor social proof
- `getEnhancedVendorProfile(vendorId)` - Get full vendor profile with all data

**Legacy Partner Methods:**
- `getAllPartners()` - Get all partners (vendors with partner flag)
- `getPartners(params?)` - Get partners with filtering
- `getFeaturedPartners()` - Get featured partners
- `getPartnerBySlug(slug)` - Get partner by slug
- `getPartnerById(id)` - Get partner by ID
- `getPartnerSlugs()` - Get all partner slugs

### ProductRepository

- `getAllProducts()` - Get all products
- `getProducts(params?)` - Get products with filtering (category, vendorId, partnerId)
- `getProductBySlug(slug)` - Get product by slug
- `getProductById(id)` - Get product by ID
- `getProductsByVendor(vendorId)` - Get products by vendor
- `getProductsByPartner(partnerId)` - Get products by partner (legacy)
- `getProductSlugs()` - Get all product slugs

### BlogRepository

- `getAllBlogPosts()` - Get all blog posts
- `getBlogPosts(params?)` - Get blog posts with filtering (category, featured)
- `getBlogPostBySlug(slug)` - Get blog post by slug
- `getBlogPostSlugs()` - Get all blog post slugs

### YachtRepository

- `getYachts()` - Get all yachts
- `getYachtBySlug(slug)` - Get yacht by slug
- `getFeaturedYachts()` - Get featured yachts
- `getYachtsByVendor(vendorSlug)` - Get yachts by vendor

### CategoryRepository

- `getCategories()` - Get all categories
- `getCategoryBySlug(slug)` - Get category by slug
- `getBlogCategories()` - Get blog-specific categories

### TagRepository

- `getTags()` - Get all tags
- `getTagBySlug(slug)` - Get tag by slug
- `getPopularTags(limit?)` - Get popular tags sorted by usage

### CompanyRepository

- `getCompanyInfo()` - Get company information
- `getTeamMembers()` - Get all team members

## Migration Path

This repository layer is a new abstraction. The existing `PayloadCMSDataService` still exists and can be gradually migrated to use these repositories.

**Future work:**
1. Update `PayloadCMSDataService` to use repositories internally
2. Update application code to use repositories directly instead of data service
3. Eventually deprecate redundant methods in `PayloadCMSDataService`

## Design Decisions

### Why Repositories?

1. **Single Responsibility**: Each repository handles one entity type
2. **Testability**: Easy to mock repositories in tests
3. **Maintainability**: Changes to one entity don't affect others
4. **Caching**: Centralized cache injection point
5. **Consistency**: Uniform API across all data access

### Cache Strategy

- Repositories accept optional `CacheService` at construction
- Each method has a unique cache key
- Cache is only used if provided (no caching by default)
- Factory pattern allows sharing cache across repositories

### Legacy Compatibility

The `VendorRepository` includes Partner methods that are wrappers around Vendor methods. This maintains backward compatibility while allowing for future deprecation of the Partner concept (which is now just a vendor with `partner: true` flag).

## Performance Considerations

- All queries use `depth: 2` for relationship resolution where needed
- Cache keys include query parameters to ensure correct cache hits
- Limit of 1000 items per query (adjust if needed)
- Static generation methods fetch only slug fields for efficiency
