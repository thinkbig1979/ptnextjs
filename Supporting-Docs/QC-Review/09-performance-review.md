# Performance Review

**Date**: 2025-12-31
**Reviewer**: QC Automation
**Scope**: Bundle size, caching, image optimization, database queries

## Summary
- **Issues found**: 14 (High: 4, Medium: 6, Low: 4)

## Bundle Analysis

### Large Dependencies (Concern: HIGH)
The `package.json` includes several large dependencies that significantly impact bundle size:

| Package | Estimated Size | Usage Pattern |
|---------|---------------|---------------|
| `plotly.js` | ~8MB | Chart visualization |
| `three` | ~700KB | 3D rendering |
| `@react-three/fiber` + `drei` | ~200KB | 3D React integration |
| `exceljs` | ~900KB | Excel import/export |
| `chart.js` + `recharts` | ~500KB | Duplicate charting libs |
| `react-pdf` | ~500KB | PDF rendering |
| `leaflet` + `react-leaflet` | ~200KB | Map components |
| `framer-motion` | ~150KB | Animations |
| `lodash` | ~70KB | Utility functions |

**Key Finding**: The project includes BOTH `chart.js`/`react-chartjs-2` AND `recharts`, which are redundant charting libraries.

### Code Splitting (Status: PARTIAL)
Dynamic imports are correctly used for heavy components:

```typescript
// Good patterns found:
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
const Canvas = dynamic(() => import("@react-three/fiber").then(mod => mod.Canvas), { ssr: false });
const HCaptcha = dynamic(() => import("@hcaptcha/react-hcaptcha"), { ssr: false });
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
```

**Missing**: No dynamic import for `plotly.js`, `exceljs`, or `react-pdf` - these are loaded synchronously.

### Package Import Optimization
`next.config.js` has partial optimization enabled:
```javascript
experimental: {
  optimizePackageImports: [
    '@radix-ui/react-accordion',
    '@radix-ui/react-dialog',
    '@radix-ui/react-select',
    'framer-motion',
    'lucide-react'
  ]
}
```

**Missing**: Should include `lodash`, `date-fns`, `dayjs`, and other Radix components.

## Caching Analysis

### Current Implementation (Status: GOOD)
The `PayloadCMSDataService` implements in-memory caching:

```typescript
private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

private async getCached<T>(key: string, fetcher: () => Promise<T>, fallback?: T): Promise<T> {
  const cached = this.cache.get(key);
  if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
    cached.accessCount++;
    return cached.data as T;
  }
  // ... fetch and cache
}
```

**Strengths**:
- Per-key caching prevents redundant DB calls
- Access counting for debugging
- Fallback support for Docker builds

### ISR/SSG Usage (Concern: MEDIUM)
Most pages use `force-dynamic` due to Docker build constraints:

```typescript
// Found in most pages:
export const dynamic = 'force-dynamic';  // Disables static generation
export const revalidate = 300;           // ISR would be ignored with force-dynamic
```

**Impact**: All pages are server-rendered on every request, losing Next.js static optimization benefits.

### Client-Side Caching (Status: MINIMAL)
- Only `VendorDashboardContext` uses SWR for client-side caching
- No React Query implementation despite `@tanstack/react-query` being a dependency
- No service worker or browser caching strategy

## Image Optimization

### CRITICAL: Image Optimization Disabled
In `next.config.js`:
```javascript
images: {
  unoptimized: true,  // CRITICAL: All optimization disabled
  domains: ['images.unsplash.com', 'localhost', ...]
}
```

**Impact**:
- No automatic WebP/AVIF conversion
- No responsive image generation
- No lazy loading by default
- Increased bandwidth usage

### next/image Usage (Status: GOOD)
Found 21 files properly using `next/image`:
- `OptimizedImage` wrapper component handles fallbacks
- `priority` attribute used for hero images
- `fill` property used for responsive containers

### Lazy Loading (Status: PARTIAL)
Only 3 explicit `loading="lazy"` attributes found:
```typescript
// VendorMediaGallery.tsx
loading="lazy"
```

**Issue**: Hero images use `priority` (correct) but other images rely on browser defaults.

## Database Query Analysis

### Query Patterns (Status: GOOD)
```typescript
// Efficient batch loading with depth
const result = await payload.find({
  collection: 'vendors',
  where: { published: { equals: true } },
  limit: 1000,
  depth: 2,  // Proper relation loading
});
```

### Potential N+1 Issues (Concern: LOW)
The `getEnhancedVendorProfile` method makes a secondary call:
```typescript
async getEnhancedVendorProfile(vendorId: string) {
  const vendor = await this.getVendorById(vendorId);  // Could use cached data
  // ... transform vendor data
}
```

**Mitigation**: Caching prevents repeated DB hits.

### Query Optimization Suggestions
1. Some queries fetch all fields when only subset needed
2. No database indexes mentioned in documentation
3. No query explanation/profiling visible

## High Priority Issues

### 1. Image Optimization Disabled (CRITICAL)
**File**: `next.config.js:17`
**Issue**: `unoptimized: true` disables all Next.js image optimization
**Impact**: Significantly increased page load times and bandwidth
**Fix**: Remove `unoptimized: true` and configure proper image domains

### 2. Duplicate Charting Libraries (HIGH)
**Files**: `package.json`
**Issue**: Both `chart.js` + `react-chartjs-2` AND `recharts` installed
**Impact**: ~300KB+ unnecessary bundle size
**Fix**: Consolidate to single charting library

### 3. force-dynamic Everywhere (HIGH)
**Files**: Multiple page.tsx files
**Issue**: Static generation disabled on all pages
**Impact**: No build-time pre-rendering, slower TTFB
**Fix**: Use ISR with fallback for pages that can be statically generated

### 4. Plotly Not Dynamically Imported (HIGH)
**File**: `package.json` includes `plotly.js` (~8MB)
**Issue**: Heavy library not code-split
**Impact**: Blocks initial page load
**Fix**: Use dynamic import with SSR disabled

## Medium Priority Issues

### 5. Missing Package Import Optimization
**File**: `next.config.js`
**Issue**: `optimizePackageImports` missing common large packages
**Fix**: Add `lodash`, `date-fns`, `dayjs`, remaining Radix components

### 6. No React Query Usage
**Issue**: `@tanstack/react-query` installed but not used
**Impact**: Wasted dependency, missing caching opportunities
**Fix**: Either implement or remove dependency

### 7. Limited Suspense Boundaries
**Files**: Only `vendors/page.tsx`, `products/page.tsx`
**Issue**: Most pages lack streaming/progressive rendering
**Fix**: Add Suspense boundaries around dynamic content

### 8. ExcelJS Not Code-Split
**File**: `components/dashboard/ExcelImportCard.tsx`
**Issue**: ~900KB library loaded synchronously
**Fix**: Dynamic import when Excel features needed

### 9. React-PDF Not Code-Split
**Issue**: ~500KB library potentially loaded upfront
**Fix**: Dynamic import with loading state

### 10. 50+ Client Components
**Issue**: Heavy client-side hydration burden
**Impact**: Increased JavaScript execution time
**Fix**: Review components for server component conversion opportunities

## Low Priority Issues

### 11. Missing Bundle Analyzer Report
**Issue**: No `bundle-analyzer-report.html` found
**Fix**: Run `npm run build:analyze` periodically to track bundle size

### 12. Date Library Duplication
**Issue**: Both `date-fns` and `dayjs` installed
**Fix**: Consolidate to single library

### 13. Memoization Inconsistency
**Found**: 146 useMemo/useCallback in components, 24 in app
**Issue**: Some complex computations may lack memoization
**Fix**: Audit heavy renders for memoization opportunities

### 14. No Service Worker
**Issue**: No PWA/offline caching strategy
**Fix**: Consider adding service worker for static asset caching

## Recommendations

### Immediate Actions (Sprint 1)
1. **Enable Image Optimization**: Remove `unoptimized: true` - estimated 40-60% bandwidth reduction
2. **Remove Duplicate Chart Library**: Choose either recharts OR chart.js
3. **Dynamic Import Plotly**: Reduces initial bundle by ~8MB

### Short-term (Sprint 2-3)
4. **Expand optimizePackageImports**: Add lodash, date-fns, remaining Radix components
5. **Code-split ExcelJS and React-PDF**: Only load when needed
6. **Add More Suspense Boundaries**: Enable progressive rendering
7. **Remove unused @tanstack/react-query**: Or implement if beneficial

### Long-term (Quarterly)
8. **Re-evaluate force-dynamic**: Test if Docker builds can support partial static generation
9. **Implement Service Worker**: Cache static assets for repeat visitors
10. **Set Up Bundle Size CI Check**: Prevent bundle bloat in PRs

## Performance Metrics to Track

| Metric | Target | Current Estimate |
|--------|--------|------------------|
| First Contentful Paint | < 1.5s | ~2-3s |
| Largest Contentful Paint | < 2.5s | ~3-4s |
| Time to Interactive | < 3.5s | ~4-5s |
| Total Bundle Size | < 500KB | ~2MB+ |
| Image Payload | < 200KB | Unoptimized |

## Files Requiring Changes

1. `/next.config.js` - Image optimization, package imports
2. `/package.json` - Remove duplicate dependencies
3. `/components/product-comparison/PerformanceMetrics.tsx` - Dynamic import Plotly
4. `/components/dashboard/ExcelImportCard.tsx` - Dynamic import ExcelJS
5. Multiple `page.tsx` files - Add Suspense boundaries, reconsider force-dynamic
