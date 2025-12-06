# Performance Optimization Documentation

This directory contains performance analysis, optimization plans, and implementation guides for the ptnextjs project.

## Current Documents

### Task ptnextjs-nr29: Dynamic Import Heavy Visualization Libraries

**Status:** Analysis complete, cleanup ready to execute

#### Quick Start

**Want to execute the cleanup immediately?**
See: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

#### Comprehensive Documentation

1. **[dynamic-imports-analysis.md](./dynamic-imports-analysis.md)**
   - Complete audit of visualization libraries
   - Search patterns and methodology
   - Detailed findings and recommendations
   - Bundle size analysis
   - Future implementation guidelines

2. **[CLEANUP_PLAN.md](./CLEANUP_PLAN.md)**
   - Step-by-step cleanup instructions
   - Automated script option
   - Manual cleanup alternative
   - Verification checklist
   - Rollback procedures
   - Expected results

3. **[task-ptnextjs-nr29-summary.md](./task-ptnextjs-nr29-summary.md)**
   - Executive summary
   - Key findings
   - All deliverables
   - Files created/modified
   - Performance impact
   - Next steps

4. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**
   - One-command cleanup
   - Quick checks
   - Documentation locations
   - Verification steps
   - Rollback instructions

## Key Findings

The project has **1.3MB of unused visualization libraries** with zero active usage:

- plotly.js + react-plotly.js (~500KB)
- recharts (~300KB)
- chart.js + react-chartjs-2 (~300KB)
- mapbox-gl (~200KB)
- Leaflet static files (unused)

**Recommendation:** Remove all unused dependencies

## Implementation Files

Related implementation files for this task:

- **Cleanup Script:** `/home/edwin/development/ptnextjs/scripts/cleanup-unused-viz-libs.sh`
- **Lazy Loading Templates:** `/home/edwin/development/ptnextjs/app/components/lazy/`
  - `LazyChart.tsx.template` - Chart components
  - `LazyMap.tsx.template` - Map components
  - `README.md` - Implementation guide
  - `index.ts` - Barrel exports

## Quick Actions

### Execute Cleanup

```bash
# Automated (recommended)
cd /home/edwin/development/ptnextjs
chmod +x scripts/cleanup-unused-viz-libs.sh
./scripts/cleanup-unused-viz-libs.sh

# Manual (alternative)
cd /home/edwin/development/ptnextjs/app
npm uninstall plotly.js react-plotly.js @types/plotly.js @types/react-plotly.js
npm uninstall recharts chart.js react-chartjs-2 mapbox-gl
rm -rf /home/edwin/development/ptnextjs/public/leaflet/
# Edit app/(site)/layout.tsx - remove leaflet CSS reference
npm run build
```

### Verify Results

```bash
cd /home/edwin/development/ptnextjs/app
npm run build        # Should succeed
npm run type-check   # Should pass
npm run dev          # Should work
```

### Future Visualization Implementation

When charts or maps are actually needed:

```bash
# 1. Install the library
npm install recharts

# 2. Activate template
mv app/components/lazy/LazyChart.tsx.template \
   app/components/lazy/LazyChart.tsx

# 3. Use in your components
import { LazyLineChart } from '@/components/lazy/LazyChart';
```

See [app/components/lazy/README.md](../../app/components/lazy/README.md) for full guide.

## Performance Impact

### Before Cleanup

- Bundle weight: +1.3MB unused code
- node_modules: ~500MB
- Dependencies: 8 unused packages
- Build time: Longer
- Security surface: Larger

### After Cleanup

- Bundle weight: -1.3MB reduction
- node_modules: ~400-450MB (-50-100MB)
- Dependencies: 8 fewer packages
- Build time: Faster
- Security surface: Reduced

### With Lazy Loading (Future)

When visualization is added back:
- Initial bundle: No increase (lazy loaded)
- Code splitting: Library in separate chunk
- Loading: On-demand when component renders
- UX: Skeleton loading states
- Performance: Optimal

## Best Practices Established

1. **Audit before adding** - Check if library is actually used
2. **Remove unused dependencies** - Clean package.json regularly
3. **Use lazy loading** - For heavy libraries (>100KB)
4. **Single library per purpose** - Avoid duplication
5. **Template approach** - Ready for quick implementation
6. **Document everything** - For future reference

## Related Documentation

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Bundle Analysis Tools](https://bundlephobia.com)
- [Web Performance Best Practices](https://web.dev/performance/)

## Future Performance Tasks

Potential areas for future optimization:

1. **Image Optimization**
   - Audit image sizes
   - Implement responsive images
   - Use next/image everywhere

2. **Font Optimization**
   - Subset fonts
   - Preload critical fonts
   - Use font-display: swap

3. **Code Splitting**
   - Route-based splitting
   - Component-based splitting
   - Third-party library splitting

4. **Caching Strategy**
   - Static asset caching
   - API response caching
   - Build-time data fetching

5. **Bundle Analysis**
   - Regular bundle size monitoring
   - Dependency audit
   - Tree-shaking verification

## Maintenance

This directory should be updated when:

- New performance optimizations are implemented
- Bundle analysis reveals issues
- Significant dependency changes occur
- Performance regressions are detected
- New best practices are established

## Contributors

- Task ptnextjs-nr29: 2025-12-06

## Questions?

For questions about performance optimization:

1. Review the comprehensive documentation in this directory
2. Check implementation examples in `app/components/lazy/`
3. Consult Next.js performance documentation
4. Run bundle analysis: `npm run build:analyze`

---

**Last Updated:** 2025-12-06
**Status:** Ready for cleanup execution
**Next Review:** After cleanup completion
