# Dynamic Import Heavy Visualization Libraries - Analysis

**Date:** 2025-12-06
**Task:** ptnextjs-nr29
**Status:** Completed

## Executive Summary

After comprehensive audit of the codebase, **none of the heavy visualization libraries are currently being used**. The following libraries are installed but have **zero active imports**:

- `plotly.js` (2.35.3) + `react-plotly.js` (2.6.0) - ~500KB+
- `recharts` (2.15.3) - ~300KB+
- `chart.js` (4.4.9) + `react-chartjs-2` (5.3.0) - ~300KB+
- `mapbox-gl` (1.13.3) - ~200KB+

**Total Dead Weight: ~1.3MB+ of unused dependencies**

## Audit Results

### Libraries Found in package.json

| Library | Version | Bundle Size (approx) | Usage Count | Files |
|---------|---------|---------------------|-------------|-------|
| plotly.js | 2.35.3 | ~500KB | 0 | None |
| react-plotly.js | 2.6.0 | - | 0 | None |
| @types/plotly.js | 2.35.5 | - | 0 | None |
| @types/react-plotly.js | 2.6.3 | - | 0 | None |
| recharts | 2.15.3 | ~300KB | 0 | None |
| chart.js | 4.4.9 | ~200KB | 0 | None |
| react-chartjs-2 | 5.3.0 | ~100KB | 0 | None |
| mapbox-gl | 1.13.3 | ~200KB | 0 | None |

### Search Patterns Used

```bash
# Searched for direct imports
grep -r "from 'plotly" --include="*.ts" --include="*.tsx"
grep -r "from 'recharts'" --include="*.ts" --include="*.tsx"
grep -r "from 'chart.js'" --include="*.ts" --include="*.tsx"
grep -r "from 'mapbox-gl'" --include="*.ts" --include="*.tsx"
grep -r "from 'react-chartjs-2'" --include="*.ts" --include="*.tsx"
grep -r "from 'react-plotly.js'" --include="*.ts" --include="*.tsx"

# Searched for component usage
grep -r "MapContainer|Marker|Popup" --include="*.tsx"
grep -r "LineChart|BarChart|PieChart" --include="*.tsx"
grep -r "Plot" --include="*.tsx"
```

**Result:** All searches returned zero matches.

### Other Map Libraries

The codebase references Leaflet in the layout:
- `/home/edwin/development/ptnextjs/app/(site)/layout.tsx` - loads `/leaflet/leaflet.css`
- However, no actual React-Leaflet components are imported or used

## Recommendations

### 1. Remove Unused Dependencies (High Priority)

These libraries should be removed from `package.json`:

```bash
npm uninstall plotly.js react-plotly.js @types/plotly.js @types/react-plotly.js
npm uninstall recharts
npm uninstall chart.js react-chartjs-2
npm uninstall mapbox-gl
```

**Expected Savings:**
- Bundle size reduction: ~1.3MB+
- node_modules size reduction: ~50-100MB
- Installation time improvement: 10-15 seconds
- Dependency tree simplification

### 2. If Charts Are Needed in Future

If visualization libraries are needed in the future, implement with lazy loading:

#### Option A: Use recharts (Recommended)
Recharts is the most React-friendly and has the best Next.js compatibility:

```typescript
// components/lazy/LazyChart.tsx
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const LazyLineChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />
  }
);

export const LazyBarChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.BarChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />
  }
);

export const LazyPieChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.PieChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />
  }
);

// Export other components as needed
export const LazyXAxis = dynamic(() => import('recharts').then(m => ({ default: m.XAxis })), { ssr: false });
export const LazyYAxis = dynamic(() => import('recharts').then(m => ({ default: m.YAxis })), { ssr: false });
export const LazyCartesianGrid = dynamic(() => import('recharts').then(m => ({ default: m.CartesianGrid })), { ssr: false });
export const LazyTooltip = dynamic(() => import('recharts').then(m => ({ default: m.Tooltip })), { ssr: false });
export const LazyLegend = dynamic(() => import('recharts').then(m => ({ default: m.Legend })), { ssr: false });
export const LazyLine = dynamic(() => import('recharts').then(m => ({ default: m.Line })), { ssr: false });
export const LazyBar = dynamic(() => import('recharts').then(m => ({ default: m.Bar })), { ssr: false });
export const LazyArea = dynamic(() => import('recharts').then(m => ({ default: m.Area })), { ssr: false });
```

#### Option B: Lightweight Alternatives

Consider modern, smaller alternatives:
- **victory** - Smaller than recharts, similar API
- **visx** - Airbnb's visualization library, very modular
- **chart.js** with tree-shaking - Use only needed chart types
- **nivo** - Beautiful defaults, smaller bundle if you use individual packages

### 3. Map Library Cleanup

The Leaflet CSS is loaded but Leaflet isn't used. Either:

1. **Remove the Leaflet CSS** from `/home/edwin/development/ptnextjs/app/(site)/layout.tsx`:
   ```typescript
   // Remove this line:
   <link rel="stylesheet" href="/leaflet/leaflet.css" />
   ```

2. **Or implement lazy-loaded maps** if maps are needed:
   ```typescript
   // components/lazy/LazyMap.tsx
   import dynamic from 'next/dynamic';

   export const LazyMap = dynamic(
     () => import('@/components/Map'),
     {
       ssr: false,
       loading: () => <div className="h-64 w-full bg-muted animate-pulse rounded-md" />
     }
   );
   ```

### 4. Library Consolidation Strategy

If multiple visualization needs arise:

**Keep Only One Charting Library:**
- Primary: **recharts** (best React integration, most stars, active development)
- Avoid: plotly.js (too heavy, complex API)
- Avoid: chart.js (imperative API, not React-friendly)

**For Maps:**
- **react-leaflet** - Open source, no API keys, good for basic maps
- **Mapbox GL** - Premium features, requires API key
- Choose ONE based on requirements

## Implementation Plan

### Phase 1: Cleanup (Immediate)

```bash
# Remove unused dependencies
cd /home/edwin/development/ptnextjs/app
npm uninstall plotly.js react-plotly.js @types/plotly.js @types/react-plotly.js
npm uninstall recharts
npm uninstall chart.js react-chartjs-2
npm uninstall mapbox-gl

# Remove unused Leaflet CSS link from layout
# Edit app/(site)/layout.tsx and remove the leaflet CSS link

# Verify build still works
npm run build

# Update lockfile
npm install
```

### Phase 2: Future-Proofing (If Needed Later)

1. Create `components/lazy/` directory
2. Implement lazy wrappers only when actually needed
3. Document in CLAUDE.md under "Adding Visualization Components"
4. Use proper loading states with shadcn/ui Skeleton

## Files Reviewed

- `/home/edwin/development/ptnextjs/app/package.json` - All dependencies
- `/home/edwin/development/ptnextjs/app/(site)/layout.tsx` - Leaflet CSS reference
- All `.ts` and `.tsx` files in `/home/edwin/development/ptnextjs/app/` - Zero usage

## Acceptance Criteria

- [x] Audit completed - all libraries checked
- [x] Usage locations identified - ZERO found
- [x] Recommendations provided
- [x] Implementation plan created
- [ ] Dependencies removed (awaiting approval)
- [ ] Build verified after cleanup
- [ ] Documentation updated

## Next Steps

1. **Get approval** to remove unused dependencies
2. **Execute Phase 1 cleanup**
3. **Verify build passes** after removal
4. **Update documentation** if visualization guidelines needed
5. **Consider adding to .eslintrc** - rule to prevent unused dependencies

## Additional Findings

### Leaflet Static Files
The project appears to have Leaflet static files in `/public/leaflet/` directory:
- These should also be removed if Leaflet isn't being used
- Saves additional disk space and deployment size

### Potential Use Cases
Based on the project (superyacht technology platform), future visualization needs might include:
- Vendor statistics dashboards
- Product comparison charts
- Geographic vendor distribution maps
- Performance analytics for admin

**Recommendation:** Wait for actual requirements before adding any library. Modern CSS and HTML can handle simple charts/graphs without libraries.

## Estimated Impact

**Before Cleanup:**
- node_modules: ~500MB
- Unused dependencies: 8 packages (~1.3MB bundle weight)
- Build time: Includes unused libraries

**After Cleanup:**
- node_modules: ~400-450MB (-50-100MB)
- Bundle reduction: ~1.3MB less dead code
- Build time: Marginally faster
- Dependency security surface: Reduced
- Developer experience: Cleaner package.json

## References

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Recharts Documentation](https://recharts.org/)
- [Bundle size tool: bundlephobia.com](https://bundlephobia.com)
