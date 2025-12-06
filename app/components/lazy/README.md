# Lazy-Loaded Components

This directory contains templates for lazy-loading heavy visualization libraries using Next.js `dynamic()`.

## Purpose

Heavy libraries like chart libraries, map libraries, and 3D visualization tools can significantly bloat your initial JavaScript bundle. Lazy loading these components ensures they're only downloaded when actually needed.

## Current Status

**No visualization libraries are currently installed or used in this project.**

All files in this directory are `.template` files for future use.

## When to Use These Templates

Only implement lazy loading when you actually need the visualization library:

1. Install the required library
2. Rename `.template` file to `.tsx`
3. Import and use the lazy components
4. Add to git

## Available Templates

### LazyChart.tsx.template

Lazy-loaded chart components using **recharts**.

**Install when needed:**
```bash
npm install recharts
```

**Usage:**
```typescript
import { LazyLineChart, LazyXAxis, LazyYAxis } from '@/components/lazy/LazyChart';

function MyDashboard() {
  return (
    <LazyLineChart data={chartData}>
      <LazyXAxis dataKey="name" />
      <LazyYAxis />
    </LazyLineChart>
  );
}
```

**Bundle Impact:**
- Without lazy loading: +300KB to initial bundle
- With lazy loading: Only loaded when chart component renders
- SSR disabled for performance

### LazyMap.tsx.template

Lazy-loaded map components using **react-leaflet**.

**Install when needed:**
```bash
npm install react-leaflet leaflet
npm install -D @types/leaflet
```

**Usage:**
```typescript
import { LazyMap } from '@/components/lazy/LazyMap';

function VendorLocation() {
  return (
    <LazyMap
      center={[51.505, -0.09]}
      markers={[
        { position: [51.505, -0.09], label: 'Vendor HQ' }
      ]}
    />
  );
}
```

**Bundle Impact:**
- Without lazy loading: +200KB to initial bundle
- With lazy loading: Only loaded when map renders
- SSR disabled (Leaflet requires browser APIs)

## Best Practices

### 1. Always Use Loading States

All lazy components include loading skeletons:

```typescript
export const LazyChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />
  }
);
```

### 2. Disable SSR for Client-Only Libraries

Map and chart libraries often require browser APIs:

```typescript
{
  ssr: false // Prevents server-side rendering
}
```

### 3. Bundle Only What You Need

Instead of:
```typescript
import { LineChart, BarChart, PieChart, ... } from 'recharts';
```

Use individual imports:
```typescript
import { LazyLineChart } from '@/components/lazy/LazyChart';
// Only LineChart is loaded
```

### 4. Measure Impact

Before implementing, check bundle size:

```bash
npm run build:analyze
```

After implementing:
```bash
npm run build:analyze
```

Compare the difference!

## Library Recommendations

### For Charts

**Recommended: recharts**
- Best React integration
- TypeScript support
- Responsive by default
- Good documentation
- ~300KB

**Alternatives:**
- `victory` - Smaller, Formidable Labs
- `visx` - Modular, Airbnb
- `nivo` - Beautiful defaults

**Avoid:**
- `plotly.js` - Too heavy (~500KB+)
- `chart.js` - Imperative API, not React-friendly

### For Maps

**Recommended: react-leaflet**
- Open source
- No API keys needed
- Good documentation
- ~200KB

**Alternatives:**
- `mapbox-gl` - Premium features, requires API key
- `google-maps-react` - Requires API key, billing

### For 3D Visualization

**Recommended: @react-three/fiber + drei**
- React wrapper for three.js
- Declarative API
- Good ecosystem
- ~500KB+

**Only use if truly needed** - 3D libraries are very heavy.

## Example: Adding a Chart Library

1. **Install the library:**
   ```bash
   npm install recharts
   ```

2. **Rename the template:**
   ```bash
   mv LazyChart.tsx.template LazyChart.tsx
   ```

3. **Create your chart component:**
   ```typescript
   // components/dashboard/VendorStatsChart.tsx
   'use client';

   import {
     LazyLineChart,
     LazyLine,
     LazyXAxis,
     LazyYAxis,
     LazyCartesianGrid,
     LazyTooltip,
     LazyResponsiveContainer
   } from '@/components/lazy/LazyChart';

   export function VendorStatsChart({ data }) {
     return (
       <LazyResponsiveContainer width="100%" height={300}>
         <LazyLineChart data={data}>
           <LazyCartesianGrid strokeDasharray="3 3" />
           <LazyXAxis dataKey="month" />
           <LazyYAxis />
           <LazyTooltip />
           <LazyLine type="monotone" dataKey="sales" stroke="#8884d8" />
         </LazyLineChart>
       </LazyResponsiveContainer>
     );
   }
   ```

4. **Use in your page:**
   ```typescript
   // app/dashboard/page.tsx
   import { VendorStatsChart } from '@/components/dashboard/VendorStatsChart';

   export default function DashboardPage() {
     return (
       <div>
         <h1>Vendor Dashboard</h1>
         <VendorStatsChart data={monthlyData} />
       </div>
     );
   }
   ```

## Performance Monitoring

After adding lazy-loaded components, monitor:

1. **Initial bundle size** - Should not increase
2. **Code split chunks** - New chunks for each library
3. **Loading experience** - Skeleton should show during load
4. **Runtime performance** - Chart/map should render smoothly

Use Chrome DevTools > Network tab to verify chunks are lazy loaded.

## Related Documentation

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Code Splitting Best Practices](https://web.dev/code-splitting/)
- [Bundle Analysis](https://nextjs.org/docs/advanced-features/measuring-performance)

## Task Reference

- Task: ptnextjs-nr29
- Created: 2025-12-06
- Purpose: Bundle optimization through dynamic imports
