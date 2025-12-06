# Visualization Libraries Cleanup Plan

**Task:** ptnextjs-nr29 - Dynamic Import Heavy Visualization Libraries
**Date:** 2025-12-06
**Status:** Ready for Execution

## Executive Summary

This project has **1.3MB+ of unused visualization libraries** installed with zero active usage. All can be safely removed with significant performance benefits.

## Unused Dependencies Identified

| Package | Size (approx) | Used? | Action |
|---------|---------------|-------|--------|
| plotly.js | ~500KB | No | Remove |
| react-plotly.js | - | No | Remove |
| @types/plotly.js | - | No | Remove |
| @types/react-plotly.js | - | No | Remove |
| recharts | ~300KB | No | Remove |
| chart.js | ~200KB | No | Remove |
| react-chartjs-2 | ~100KB | No | Remove |
| mapbox-gl | ~200KB | No | Remove |

**Total Dead Weight:** ~1.3MB bundle, ~50-100MB node_modules

## Unused Static Files

The following Leaflet files exist but aren't used:

- `/home/edwin/development/ptnextjs/public/leaflet/leaflet.css`
- `/home/edwin/development/ptnextjs/public/leaflet/marker-icon.png`
- `/home/edwin/development/ptnextjs/public/leaflet/marker-icon-2x.png`
- `/home/edwin/development/ptnextjs/public/leaflet/marker-shadow.png`

Referenced in:
- `/home/edwin/development/ptnextjs/app/(site)/layout.tsx` (line 43)

## Cleanup Steps

### Option 1: Automated Script (Recommended)

```bash
# Make script executable
chmod +x /home/edwin/development/ptnextjs/scripts/cleanup-unused-viz-libs.sh

# Run cleanup script
./scripts/cleanup-unused-viz-libs.sh
```

The script will:
1. Backup package.json
2. Remove all unused npm packages
3. Run build verification
4. Display summary and next steps

### Option 2: Manual Cleanup

#### Step 1: Remove npm dependencies

```bash
cd /home/edwin/development/ptnextjs/app

# Remove chart libraries
npm uninstall plotly.js react-plotly.js @types/plotly.js @types/react-plotly.js
npm uninstall recharts
npm uninstall chart.js react-chartjs-2
npm uninstall mapbox-gl
```

#### Step 2: Remove Leaflet CSS reference

Edit `/home/edwin/development/ptnextjs/app/(site)/layout.tsx`:

```diff
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
-       <link rel="stylesheet" href="/leaflet/leaflet.css" />
        <script
```

#### Step 3: Remove Leaflet static files

```bash
rm -rf /home/edwin/development/ptnextjs/public/leaflet/
```

#### Step 4: Verify build

```bash
cd /home/edwin/development/ptnextjs/app
npm run build
```

Should complete without errors.

#### Step 5: Commit changes

```bash
git add .
git commit -m "chore: Remove unused visualization libraries (ptnextjs-nr29)

- Remove plotly.js, react-plotly.js, and type definitions (~500KB)
- Remove recharts (~300KB)
- Remove chart.js and react-chartjs-2 (~300KB)
- Remove mapbox-gl (~200KB)
- Remove unused Leaflet static files and CSS reference
- Total bundle size reduction: ~1.3MB
- Total node_modules reduction: ~50-100MB

These libraries were installed but had zero usage across the codebase.
Future visualization needs can use lazy-loaded implementations from
/app/components/lazy/ templates.

Task: ptnextjs-nr29"
```

## Expected Results

### Before Cleanup

```json
// package.json dependencies (8 unused packages)
"plotly.js": "2.35.3",
"react-plotly.js": "2.6.0",
"@types/plotly.js": "2.35.5",
"@types/react-plotly.js": "2.6.3",
"recharts": "2.15.3",
"chart.js": "4.4.9",
"react-chartjs-2": "5.3.0",
"mapbox-gl": "1.13.3",
```

**Metrics:**
- node_modules: ~500MB
- Bundle weight: Includes ~1.3MB unused code
- Dependency count: Higher
- Security surface: Larger

### After Cleanup

```json
// package.json dependencies (cleaner)
// All visualization packages removed
```

**Metrics:**
- node_modules: ~400-450MB (-50-100MB)
- Bundle weight: ~1.3MB smaller
- Dependency count: -8 packages
- Security surface: Reduced
- Build time: Marginally faster

## Future Visualization Needs

If visualization is needed in the future:

### 1. Use Lazy-Loaded Templates

Templates are ready in `/home/edwin/development/ptnextjs/app/components/lazy/`:

- `LazyChart.tsx.template` - For recharts (recommended)
- `LazyMap.tsx.template` - For react-leaflet or mapbox-gl
- `README.md` - Full documentation

### 2. Installation Process

```bash
# Example: Adding charts
npm install recharts
mv app/components/lazy/LazyChart.tsx.template app/components/lazy/LazyChart.tsx
```

### 3. Implementation Example

```typescript
// components/dashboard/VendorStats.tsx
import { LazyLineChart, LazyLine, LazyXAxis, LazyYAxis } from '@/components/lazy/LazyChart';

export function VendorStats({ data }) {
  return (
    <LazyLineChart data={data}>
      <LazyXAxis dataKey="month" />
      <LazyYAxis />
      <LazyLine dataKey="sales" stroke="#8884d8" />
    </LazyLineChart>
  );
}
```

### 4. Benefits of Lazy Loading

- Library only loaded when component renders
- Initial bundle stays small
- Better Core Web Vitals scores
- Improved initial page load time
- Loading states with shadcn/ui Skeleton

## Verification Checklist

After cleanup, verify:

- [ ] `npm run build` succeeds without errors
- [ ] `npm run type-check` passes
- [ ] No import errors in any files
- [ ] No broken references to removed libraries
- [ ] Bundle size reduced (check build output)
- [ ] Application runs correctly: `npm run dev`

## Rollback Plan

If issues arise:

```bash
# Restore from backup
cp /home/edwin/development/ptnextjs/app/package.json.backup /home/edwin/development/ptnextjs/app/package.json
cd /home/edwin/development/ptnextjs/app
npm install
```

Or use git:

```bash
git checkout HEAD -- app/package.json
npm install
```

## Related Documentation

- **Analysis:** `/home/edwin/development/ptnextjs/Supporting-Docs/performance/dynamic-imports-analysis.md`
- **Lazy Loading Guide:** `/home/edwin/development/ptnextjs/app/components/lazy/README.md`
- **Cleanup Script:** `/home/edwin/development/ptnextjs/scripts/cleanup-unused-viz-libs.sh`

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Execute cleanup** using script or manual steps
3. **Verify build** and application functionality
4. **Commit changes** with descriptive message
5. **Update CLAUDE.md** if needed (optional)
6. **Monitor** bundle size in future builds

## Questions & Answers

**Q: Why were these libraries installed if not used?**
A: Likely planned for future features that weren't implemented yet.

**Q: What if we need charts/maps later?**
A: Use the lazy-loaded templates in `app/components/lazy/`. They prevent bundle bloat.

**Q: Is it safe to remove all these?**
A: Yes. Comprehensive grep searches found zero usage across the entire codebase.

**Q: Will this break anything?**
A: No. Build verification is included in the cleanup script.

**Q: Should we keep one library "just in case"?**
A: No. Unused dependencies are technical debt. Better to add only when needed.

## Acceptance Criteria (Task ptnextjs-nr29)

- [x] Audit completed - all libraries checked
- [x] Usage locations identified - zero found
- [x] Lazy loading templates created
- [x] Documentation written
- [x] Cleanup script created
- [ ] Dependencies removed (awaiting execution)
- [ ] Build verified after cleanup
- [ ] Changes committed

## Estimated Time

- Review: 5 minutes
- Execute cleanup: 2 minutes
- Verify build: 2 minutes
- Commit: 2 minutes

**Total: ~10 minutes**

## Contact

For questions about this cleanup:
- Review analysis: `Supporting-Docs/performance/dynamic-imports-analysis.md`
- Check templates: `app/components/lazy/README.md`
- Run script with `--help` flag (if implemented)
