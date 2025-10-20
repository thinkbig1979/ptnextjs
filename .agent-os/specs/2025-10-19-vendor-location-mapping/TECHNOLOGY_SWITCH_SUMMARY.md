# Technology Switch Summary: Mapbox → Leaflet.js

**Date**: 2025-10-19
**Status**: ✅ Complete
**Impact**: All task files need updating to reflect Leaflet.js instead of Mapbox GL JS

---

## Changes Made

### Dependencies
```bash
# Removed
- mapbox-gl@1.13.3

# Added
+ leaflet@1.9.4
+ react-leaflet@5.0.0
+ @types/leaflet@1.9.21
```

### Documentation Updated
- ✅ `integration-strategy.md` (v1.0 → v1.1)
- ✅ `tasks.md` (master task list)
- ⏳ Individual task files in `tasks/` directory (7 files need updates)

---

## Task Files Requiring Updates

The following task files still reference Mapbox GL JS and need to be updated to Leaflet.js:

### High Priority (Next to Execute)
1. **task-impl-frontend-map.md** - Component implementation details
   - Line 1: Title references "Mapbox GL JS"
   - Lines 10-20: References to mapbox-gl package
   - Code examples use Mapbox API instead of Leaflet

2. **task-test-frontend-suite.md** - Test specifications
   - May reference Mapbox-specific testing

3. **task-impl-frontend-vendor-detail.md** - Integration instructions
   - May reference Mapbox initialization

### Medium Priority (Later Phases)
4. **task-integ-data-flow.md** - Integration validation
5. **task-integ-e2e.md** - E2E testing
6. **task-final-validation.md** - Final checks
7. **task-pre-2-integration-strategy.md** - Already superseded by integration-strategy.md v1.1

---

## Key Differences: Mapbox vs Leaflet

### API Initialization

**Mapbox GL JS (OLD)**:
```typescript
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const map = new mapboxgl.Map({
  container: mapRef.current,
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [longitude, latitude],
  zoom: 13
});
```

**Leaflet.js (NEW)**:
```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

<MapContainer
  center={[latitude, longitude]}
  zoom={13}
  style={{ height: '400px', width: '100%' }}
>
  <TileLayer
    url="https://tiles.openfreemap.org/osm/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap'
  />
  <Marker position={[latitude, longitude]}>
    <Popup>{vendorName}</Popup>
  </Marker>
</MapContainer>
```

### Key Changes
- ✅ **No access token needed** (remove all NEXT_PUBLIC_MAPBOX_TOKEN references)
- ✅ **Declarative React components** (MapContainer, TileLayer, Marker)
- ✅ **Different tile URL** (OpenFreeMap instead of Mapbox tiles)
- ✅ **CSS import required** ('leaflet/dist/leaflet.css')
- ✅ **Coordinate order** (both use [lat, lng] - no change needed)

---

## Recommended Action

### Option A: Update Task Files Now (Recommended)
Update the 7 affected task files to use Leaflet.js syntax before starting frontend implementation.

**Pros**:
- Accurate task specifications
- No confusion during implementation
- Clean documentation

**Cons**:
- Takes 30-45 minutes upfront

### Option B: Reference This Document During Implementation
Keep this summary as reference and implement using Leaflet.js despite task files mentioning Mapbox.

**Pros**:
- Start implementation immediately
- Task files can be updated later

**Cons**:
- Need to mentally translate Mapbox → Leaflet
- Risk of confusion
- Documentation inconsistency

---

## Implementation Checklist

When implementing VendorMap component with Leaflet.js:

- [ ] Import from 'react-leaflet' not 'mapbox-gl'
- [ ] Import CSS: `import 'leaflet/dist/leaflet.css'`
- [ ] Use `<MapContainer>` as root component
- [ ] Add `<TileLayer>` with OpenFreeMap URL
- [ ] Use `<Marker>` for vendor pins
- [ ] Use `<Popup>` for info windows
- [ ] Remove all API token references
- [ ] Test without environment variables

---

## Status Summary

**Backend**: ✅ Complete (Leaflet-compatible)
**Integration Strategy**: ✅ Updated to v1.1
**Master Task List**: ✅ Updated
**Individual Task Files**: ⏳ Pending (7 files)
**Dependencies**: ✅ Installed and verified

**Ready to Proceed**: Yes, frontend implementation can start with Leaflet.js using this document as reference.

---

**Next Action**: Begin frontend implementation with `task-impl-frontend-map` using Leaflet.js despite task file referencing Mapbox (or update task file first).
