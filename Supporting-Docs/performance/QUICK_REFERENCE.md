# Quick Reference: Visualization Libraries Cleanup

**Task:** ptnextjs-nr29 | **Date:** 2025-12-06

## TL;DR

**Problem:** 1.3MB of unused visualization libraries installed
**Solution:** Remove all unused dependencies
**Impact:** Smaller bundle, faster builds, reduced security surface
**Risk:** None - zero usage found

## One-Command Cleanup

```bash
cd /home/edwin/development/ptnextjs
chmod +x scripts/cleanup-unused-viz-libs.sh
./scripts/cleanup-unused-viz-libs.sh
```

## Manual Cleanup (Alternative)

```bash
cd /home/edwin/development/ptnextjs/app

# Remove libraries
npm uninstall plotly.js react-plotly.js @types/plotly.js @types/react-plotly.js
npm uninstall recharts chart.js react-chartjs-2 mapbox-gl

# Remove Leaflet
rm -rf /home/edwin/development/ptnextjs/public/leaflet/
# Edit app/(site)/layout.tsx - remove line 43 (leaflet CSS)

# Verify
npm run build
```

## What Gets Removed

| Package | Size | Used? |
|---------|------|-------|
| plotly.js | 500KB | No |
| recharts | 300KB | No |
| chart.js | 200KB | No |
| mapbox-gl | 200KB | No |
| + 4 type packages | - | No |

**Total:** ~1.3MB + 50-100MB node_modules

## Future Visualization Needs

When charts/maps are actually needed:

```bash
# 1. Install library
npm install recharts

# 2. Activate template
mv app/components/lazy/LazyChart.tsx.template \
   app/components/lazy/LazyChart.tsx

# 3. Use lazy components
import { LazyLineChart } from '@/components/lazy/LazyChart';
```

## Documentation Locations

- **Full Analysis:** `Supporting-Docs/performance/dynamic-imports-analysis.md`
- **Cleanup Plan:** `Supporting-Docs/performance/CLEANUP_PLAN.md`
- **Lazy Loading Guide:** `app/components/lazy/README.md`
- **Task Summary:** `Supporting-Docs/performance/task-ptnextjs-nr29-summary.md`

## Quick Checks

Before cleanup:
```bash
grep -c "recharts\|plotly\|chart.js\|mapbox" app/package.json
# Should show 8 lines
```

After cleanup:
```bash
grep -c "recharts\|plotly\|chart.js\|mapbox" app/package.json
# Should show 0 lines
```

## Verification

```bash
npm run build        # Should succeed
npm run type-check   # Should pass
npm run dev          # Should work
```

## Rollback

```bash
cp app/package.json.backup app/package.json
npm install
```

---

**Status:** Ready to execute
**Risk Level:** Low
**Time Required:** 2-5 minutes
**Approval Needed:** Yes (before execution)
