# Integration Points - Frontend Page Updates

> Created: 2025-10-14
> Task: PRE-1
> Author: integration-coordinator

## Overview

This document identifies all frontend pages requiring updates for the TinaCMS to Payload CMS migration. Each page section specifies the exact import statement changes, method call updates, and any custom transformations required.

**Total Pages: 11**
- Existing Pages: 9
- New Pages (to be created): 2 (Yachts)

---

## 1. Vendors List Page

**File:** `/home/edwin/development/ptnextjs/app/vendors/page.tsx`

### Required Changes

#### Import Statement
```typescript
// OLD
import tinaCMSDataService from '@/lib/tinacms-data-service';

// NEW
import payloadCMSDataService from '@/lib/payload-cms-data-service';
```

#### Method Calls
```typescript
// OLD
const vendors = await tinaCMSDataService.getAllVendors();
const categories = await tinaCMSDataService.getCategories();

// NEW
const vendors = await payloadCMSDataService.getAllVendors();
const categories = await payloadCMSDataService.getCategories();
```

### Custom Transformations
- **None required** - PayloadCMSDataService returns identical data structure

### Static Generation
```typescript
// No changes required - generateStaticParams already uses proper methods
export async function generateStaticParams() {
  // This remains unchanged - method signatures are identical
  const vendors = await payloadCMSDataService.getAllVendors();
  return vendors.map(vendor => ({ slug: vendor.slug }));
}
```

### Verification Steps
- [ ] Page renders vendor list correctly
- [ ] Filtering by category works
- [ ] Featured vendors filter works
- [ ] Search functionality operates correctly

---

## 2. Vendor Detail Page

**File:** `/home/edwin/development/ptnextjs/app/vendors/[slug]/page.tsx`

### Required Changes

#### Import Statement
```typescript
// OLD
import tinaCMSDataService from '@/lib/tinacms-data-service';

// NEW
import payloadCMSDataService from '@/lib/payload-cms-data-service';
```

#### Method Calls
```typescript
// OLD
const vendor = await tinaCMSDataService.getVendorBySlug(params.slug);
const products = await tinaCMSDataService.getProductsByVendor(vendor.id);

// NEW
const vendor = await payloadCMSDataService.getVendorBySlug(params.slug);
const products = await payloadCMSDataService.getProductsByVendor(vendor.id);
```

### Custom Transformations
- **Enhanced profile sections**: Ensure all new enhanced fields render correctly
  - Certifications array
  - Awards array
  - Social proof metrics
  - Video introduction
  - Case studies
  - Innovation highlights
  - Team members
  - Yacht projects

### Static Generation
```typescript
export async function generateStaticParams() {
  const slugs = await payloadCMSDataService.getVendorSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
  const vendor = await payloadCMSDataService.getVendorBySlug(params.slug);
  return {
    title: vendor?.name || 'Vendor',
    description: vendor?.description
  };
}
```

### Verification Steps
- [ ] Vendor detail page loads correctly
- [ ] All base fields display (name, logo, description, website, etc.)
- [ ] Enhanced fields render correctly (certifications, awards, case studies, etc.)
- [ ] Related products section appears
- [ ] SEO metadata generates correctly

---

## 3. Products List Page

**File:** `/home/edwin/development/ptnextjs/app/products/page.tsx`

### Required Changes

#### Import Statement
```typescript
// OLD
import tinaCMSDataService from '@/lib/tinacms-data-service';

// NEW
import payloadCMSDataService from '@/lib/payload-cms-data-service';
```

#### Method Calls
```typescript
// OLD
const products = await tinaCMSDataService.getAllProducts();
const categories = await tinaCMSDataService.getCategories();

// NEW
const products = await payloadCMSDataService.getAllProducts();
const categories = await payloadCMSDataService.getCategories();
```

### Custom Transformations
- **None required** - Data structure remains identical

### Static Generation
```typescript
// No changes required
export async function generateStaticParams() {
  const products = await payloadCMSDataService.getAllProducts();
  return products.map(product => ({ slug: product.slug }));
}
```

### Verification Steps
- [ ] Products list renders correctly
- [ ] Product images display properly
- [ ] Category filtering works
- [ ] Vendor filtering works
- [ ] Search functionality operates

---

## 4. Product Detail Page

**File:** `/home/edwin/development/ptnextjs/app/products/[slug]/page.tsx`

### Required Changes

#### Import Statement
```typescript
// OLD
import tinaCMSDataService from '@/lib/tinacms-data-service';

// NEW
import payloadCMSDataService from '@/lib/payload-cms-data-service';
```

#### Method Calls
```typescript
// OLD
const product = await tinaCMSDataService.getProductBySlug(params.slug);
const vendor = product.vendor
  ? await tinaCMSDataService.getVendorById(product.vendorId)
  : null;

// NEW
const product = await payloadCMSDataService.getProductBySlug(params.slug);
const vendor = product.vendor
  ? await payloadCMSDataService.getVendorById(product.vendorId)
  : null;
```

### Custom Transformations
- **Enhanced product sections**: Ensure all new enhanced fields render correctly
  - Comparison metrics
  - Integration compatibility matrix
  - Owner reviews
  - Visual demo content (360°, 3D, AR)
  - Benefits
  - Services
  - Pricing configuration
  - Action buttons
  - Badges

### Static Generation
```typescript
export async function generateStaticParams() {
  const slugs = await payloadCMSDataService.getProductSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
  const product = await payloadCMSDataService.getProductBySlug(params.slug);
  return {
    title: product?.name || 'Product',
    description: product?.description
  };
}
```

### Verification Steps
- [ ] Product detail page loads correctly
- [ ] Image gallery displays
- [ ] Specifications table renders
- [ ] Enhanced sections appear (metrics, reviews, demo)
- [ ] Vendor information displays
- [ ] SEO metadata generates

---

## 5. Yachts List Page (NEW)

**File:** `/home/edwin/development/ptnextjs/app/yachts/page.tsx` *(To be created)*

### Required Implementation

#### Import Statement
```typescript
import payloadCMSDataService from '@/lib/payload-cms-data-service';
import type { Yacht } from '@/lib/types';
```

#### Page Component
```typescript
export default async function YachtsPage() {
  const yachts = await payloadCMSDataService.getAllYachts();
  const categories = await payloadCMSDataService.getCategories();

  return (
    <div>
      {/* Yacht list UI implementation */}
      {yachts.map(yacht => (
        <YachtCard key={yacht.id} yacht={yacht} />
      ))}
    </div>
  );
}
```

### Custom Transformations
- **New page component**: Implement yacht list layout
- **Yacht card component**: Display yacht image, name, builder, length, launch year

### Static Generation
```typescript
export async function generateStaticParams() {
  const yachts = await payloadCMSDataService.getAllYachts();
  return yachts.map(yacht => ({ slug: yacht.slug }));
}
```

### Verification Steps
- [ ] Yachts list page renders
- [ ] Yacht cards display correctly
- [ ] Filtering by featured works
- [ ] Search functionality operates

---

## 6. Yacht Detail Page (NEW)

**File:** `/home/edwin/development/ptnextjs/app/yachts/[slug]/page.tsx` *(To be created)*

### Required Implementation

#### Import Statement
```typescript
import payloadCMSDataService from '@/lib/payload-cms-data-service';
import type { Yacht } from '@/lib/types';
```

#### Page Component
```typescript
export default async function YachtDetailPage({ params }: { params: { slug: string } }) {
  const yacht = await payloadCMSDataService.getYachtBySlug(params.slug);

  if (!yacht) {
    notFound();
  }

  return (
    <div>
      {/* Yacht detail UI with timeline, supplier map, sustainability, etc. */}
      <YachtHero yacht={yacht} />
      <YachtTimeline timeline={yacht.timeline} />
      <YachtSupplierMap supplierMap={yacht.supplierMap} />
      <YachtSustainability score={yacht.sustainabilityScore} />
      <YachtCustomizations customizations={yacht.customizations} />
      <YachtMaintenance history={yacht.maintenanceHistory} />
    </div>
  );
}
```

### Custom Transformations
- **New page component**: Implement yacht detail layout
- **Timeline component**: Display yacht lifecycle events
- **Supplier map component**: Visual supplier relationship map
- **Sustainability component**: Display environmental metrics
- **Maintenance component**: Display service history

### Static Generation
```typescript
export async function generateStaticParams() {
  const slugs = await payloadCMSDataService.getYachtSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
  const yacht = await payloadCMSDataService.getYachtBySlug(params.slug);
  return {
    title: yacht?.name || 'Yacht',
    description: yacht?.description
  };
}
```

### Verification Steps
- [ ] Yacht detail page loads
- [ ] All specifications display
- [ ] Timeline renders correctly
- [ ] Supplier map shows all vendors
- [ ] Sustainability metrics display
- [ ] Maintenance history appears

---

## 7. Blog List Page

**File:** `/home/edwin/development/ptnextjs/app/blog/page.tsx`

### Required Changes

#### Import Statement
```typescript
// OLD
import tinaCMSDataService from '@/lib/tinacms-data-service';

// NEW
import payloadCMSDataService from '@/lib/payload-cms-data-service';
```

#### Method Calls
```typescript
// OLD
const posts = await tinaCMSDataService.getAllBlogPosts();
const categories = await tinaCMSDataService.getBlogCategories();

// NEW
const posts = await payloadCMSDataService.getAllBlogPosts();
const categories = await payloadCMSDataService.getBlogCategories();
```

### Custom Transformations
- **None required** - Data structure remains identical

### Static Generation
```typescript
// No changes required
export async function generateStaticParams() {
  const posts = await payloadCMSDataService.getAllBlogPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```

### Verification Steps
- [ ] Blog list renders correctly
- [ ] Post excerpts display
- [ ] Category filtering works
- [ ] Featured posts appear

---

## 8. Blog Post Detail Page

**File:** `/home/edwin/development/ptnextjs/app/blog/[slug]/page.tsx`

### Required Changes

#### Import Statement
```typescript
// OLD
import tinaCMSDataService from '@/lib/tinacms-data-service';

// NEW
import payloadCMSDataService from '@/lib/payload-cms-data-service';
```

#### Method Calls
```typescript
// OLD
const post = await tinaCMSDataService.getBlogPostBySlug(params.slug);

// NEW
const post = await payloadCMSDataService.getBlogPostBySlug(params.slug);
```

### Custom Transformations
- **Rich text rendering**: Ensure Lexical content renders correctly
  - May require Lexical renderer component
  - Verify HTML output matches markdown rendering

### Static Generation
```typescript
export async function generateStaticParams() {
  const slugs = await payloadCMSDataService.getBlogPostSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
  const post = await payloadCMSDataService.getBlogPostBySlug(params.slug);
  return {
    title: post?.title || 'Blog Post',
    description: post?.excerpt
  };
}
```

### Verification Steps
- [ ] Blog post detail page loads
- [ ] Rich text content renders correctly
- [ ] Images display properly
- [ ] Author information appears
- [ ] Category and tags display
- [ ] SEO metadata generates

---

## 9. Team Page

**File:** `/home/edwin/development/ptnextjs/app/team/page.tsx`

### Required Changes

#### Import Statement
```typescript
// OLD
import tinaCMSDataService from '@/lib/tinacms-data-service';

// NEW
import payloadCMSDataService from '@/lib/payload-cms-data-service';
```

#### Method Calls
```typescript
// OLD
const teamMembers = await tinaCMSDataService.getTeamMembers();

// NEW
const teamMembers = await payloadCMSDataService.getTeamMembers();
```

### Custom Transformations
- **None required** - Data structure remains identical

### Static Generation
```typescript
// No changes required - page is statically generated
```

### Verification Steps
- [ ] Team page renders correctly
- [ ] Team member cards display
- [ ] Member photos load
- [ ] Bios display correctly
- [ ] LinkedIn links work

---

## 10. About Page

**File:** `/home/edwin/development/ptnextjs/app/about/page.tsx`

### Required Changes

#### Import Statement
```typescript
// OLD
import tinaCMSDataService from '@/lib/tinacms-data-service';

// NEW
import payloadCMSDataService from '@/lib/payload-cms-data-service';
```

#### Method Calls
```typescript
// OLD
const companyInfo = await tinaCMSDataService.getCompanyInfo();

// NEW
const companyInfo = await payloadCMSDataService.getCompanyInfo();
```

### Custom Transformations
- **Rich text rendering**: Ensure company story renders correctly

### Static Generation
```typescript
// No changes required - page is statically generated
```

### Verification Steps
- [ ] About page renders correctly
- [ ] Company information displays
- [ ] Company story renders
- [ ] Social media links work
- [ ] SEO metadata generates

---

## 11. Homepage

**File:** `/home/edwin/development/ptnextjs/app/page.tsx`

### Required Changes

#### Import Statement
```typescript
// OLD
import tinaCMSDataService from '@/lib/tinacms-data-service';

// NEW
import payloadCMSDataService from '@/lib/payload-cms-data-service';
```

#### Method Calls
```typescript
// OLD
const featuredPartners = await tinaCMSDataService.getFeaturedPartners();
const featuredProducts = await tinaCMSDataService.getProducts({ featured: true });
const recentPosts = await tinaCMSDataService.getBlogPosts({ featured: true });

// NEW
const featuredPartners = await payloadCMSDataService.getFeaturedPartners();
const featuredProducts = await payloadCMSDataService.getProducts({ featured: true });
const recentPosts = await payloadCMSDataService.getBlogPosts({ featured: true });
```

### Custom Transformations
- **None required** - Data structure remains identical
- **Performance**: Ensure `getFeaturedPartners()` filters correctly (featured=true AND partner=true)

### Static Generation
```typescript
// No changes required - homepage is statically generated
```

### Verification Steps
- [ ] Homepage renders correctly
- [ ] Featured partners section displays
- [ ] Featured products section displays
- [ ] Recent blog posts display
- [ ] Hero section renders
- [ ] All links work correctly

---

## Data Structure Compatibility Requirements

### Vendor/Partner Objects

**Required fields for page components:**
- `id: string`
- `name: string`
- `slug: string`
- `description: string`
- `logo: string`
- `image: string`
- `website: string`
- `partner: boolean` (new field)
- `category: string` (resolved category name)
- `tags: string[]` (resolved tag names)

**Enhanced fields (optional but should render if present):**
- `certifications: array`
- `awards: array`
- `socialProof: object`
- `videoIntroduction: object`
- `caseStudies: array`
- `innovationHighlights: array`
- `teamMembers: array`
- `yachtProjects: array`

### Product Objects

**Required fields for page components:**
- `id: string`
- `name: string`
- `slug: string`
- `description: string`
- `images: array` (with `url`, `altText`, `isMain`)
- `vendorId: string`
- `vendorName: string`
- `partnerId: string` (backward compatibility)
- `partnerName: string` (backward compatibility)
- `category: string` (resolved category name)
- `tags: string[]`
- `features: array`
- `specifications: array`

**Enhanced fields (optional but should render if present):**
- `comparisonMetrics: object`
- `integrationCompatibility: array`
- `ownerReviews: array`
- `visualDemo: object`
- `benefits: array`
- `services: array`
- `pricing: object`
- `actionButtons: array`
- `badges: array`

### Yacht Objects (New)

**Required fields for page components:**
- `id: string`
- `name: string`
- `slug: string`
- `description: string`
- `image: string`
- `images: string[]`
- `length: number`
- `builder: string`
- `launchYear: number`

**Enhanced fields (should render):**
- `timeline: array`
- `supplierMap: array`
- `sustainabilityScore: object`
- `customizations: array`
- `maintenanceHistory: array`

### Blog Post Objects

**Required fields for page components:**
- `id: string`
- `title: string`
- `slug: string`
- `excerpt: string`
- `content: string` (Lexical JSON or HTML)
- `author: string`
- `publishedAt: string`
- `image: string`
- `category: string`
- `tags: string[]`
- `readTime: string`

---

## Static Generation Pattern Preservation

All pages must maintain the static generation pattern:

```typescript
// generateStaticParams for dynamic routes
export async function generateStaticParams() {
  const slugs = await payloadCMSDataService.get[Entity]Slugs();
  return slugs.map(slug => ({ slug }));
}

// generateMetadata for SEO
export async function generateMetadata({ params }) {
  const entity = await payloadCMSDataService.get[Entity]BySlug(params.slug);
  return {
    title: entity?.name || 'Default Title',
    description: entity?.description
  };
}

// Page component with async data fetching
export default async function Page({ params }) {
  const data = await payloadCMSDataService.get[Entity]BySlug(params.slug);
  return <Component data={data} />;
}
```

---

## Component Updates (If Required)

### Potential Component Changes

Most components should work without changes due to data service compatibility, but verify these components:

1. **VendorCard** - Ensure `partner` boolean field is handled
2. **ProductCard** - Verify image array structure matches
3. **BlogPostCard** - Check Lexical content rendering
4. **YachtCard** - New component, must be created
5. **YachtTimeline** - New component, must be created
6. **YachtSupplierMap** - New component, must be created

### Component Prop Validation

Verify component props match data service output:

```typescript
interface VendorCardProps {
  vendor: Vendor; // Ensure Vendor type includes all enhanced fields
  showPartnerBadge?: boolean; // Use partner boolean field
}

interface ProductCardProps {
  product: Product; // Ensure Product type includes all enhanced fields
}

interface YachtCardProps {
  yacht: Yacht; // New interface
}
```

---

## Custom Transformation Checklist

### Pages Requiring Special Attention

1. **Vendor Detail Page** - Verify all enhanced profile sections render
2. **Product Detail Page** - Verify comparison metrics, reviews, visual demos render
3. **Yacht Pages** - Implement new components for yacht-specific features
4. **Blog Post Detail** - Verify Lexical rich text rendering

### Data Transformation Edge Cases

1. **Empty Arrays** - Components should handle empty arrays gracefully
2. **Missing Optional Fields** - Components should not break if optional fields are `undefined`
3. **Media Path Errors** - Fallback images should display if media paths are invalid
4. **Relationship Resolution** - Handle cases where related entities don't exist

---

## Testing Strategy Per Page

### For Each Page:

1. **Build Test**: `npm run build` - Verify page builds without errors
2. **Visual Test**: Open page in browser, verify UI renders correctly
3. **Data Test**: Verify all fields display expected data
4. **Navigation Test**: Verify all links work
5. **Performance Test**: Verify page load time < 2 seconds

### Acceptance Criteria Per Page:

- [ ] Page builds successfully in static generation
- [ ] All content displays correctly
- [ ] No console errors
- [ ] SEO metadata generates
- [ ] Links navigate correctly
- [ ] Images load properly
- [ ] Enhanced features render (if applicable)

---

## Migration Execution Order

**Recommended page update order:**

1. **Categories** (foundational, used by other pages)
2. **Vendors** (foundational, used by products/yachts)
3. **Products** (depends on vendors)
4. **Blog Posts** (independent)
5. **Team** (independent)
6. **Company Info** (independent)
7. **Yachts** (depends on vendors, new pages)
8. **Homepage** (depends on vendors, products, blog)

---

## Rollback Procedure

If a page fails after migration:

1. **Revert import**: Change back to `tinaCMSDataService`
2. **Rebuild**: `npm run build`
3. **Verify**: Test page functionality
4. **Debug**: Identify root cause in PayloadCMSDataService
5. **Fix**: Correct transformation logic
6. **Re-migrate**: Switch back to `payloadCMSDataService`

---

## Success Criteria

**Phase 4 Frontend Integration is successful when:**

- [ ] All 11 pages build successfully
- [ ] All 11 pages render correctly in browser
- [ ] No data structure breaking changes
- [ ] All enhanced features display correctly
- [ ] Build time remains < 5 minutes
- [ ] All tests pass
- [ ] No console errors in production build
- [ ] SEO metadata generates for all pages
- [ ] Static site generation completes successfully

---

## Notes

- **Zero Breaking Changes**: PayloadCMSDataService must maintain 100% API compatibility
- **Data Structure Parity**: All returned objects must match TinaCMS format
- **Enhanced Fields**: New fields are additive, existing components should handle gracefully
- **Backward Compatibility**: Partner methods remain functional as aliases to Vendor methods
