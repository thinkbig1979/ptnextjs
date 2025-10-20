# Vendor Location Mapping - Tasks

> Spec: Vendor Location Mapping
> Created: 2025-10-19
> Status: Ready for Implementation

## Overview

This document provides the master task list for implementing vendor location mapping functionality. Each task has a detailed specification in the `tasks/` subdirectory.

**Feature Summary**: Add geographic coordinate support to vendors, display interactive maps on vendor pages, and enable location-based vendor search.

**Technology Stack**:
- **Backend**: Payload CMS (migrated from TinaCMS)
- **Map Library**: Leaflet.js 1.9.4 + React-Leaflet 5.0.0 + OpenFreeMap (NO API KEY REQUIRED)
- **Frontend**: React, Next.js 14 App Router
- **Testing**: Playwright (E2E), TypeScript (type safety)

## Task Structure

- **Master File**: This file (lightweight overview)
- **Detail Files**: Individual task specifications in `tasks/` subdirectory
- **Total Tasks**: 15 implementation tasks + 3 testing tasks

## Phase Breakdown

### Phase 1: Pre-Execution Analysis (1 task)
- ✅ **pre-1**: Codebase analysis (COMPLETED)
- **pre-2**: Create integration strategy document

### Phase 2: Backend Implementation (5 tasks)
Focus: TinaCMS schema extensions and data service modifications

- **test-backend**: Design backend validation test suite
- **impl-backend-schema**: Extend TinaCMS vendor collection schema
- **impl-backend-types**: Update TypeScript interfaces for location data
- **impl-backend-service**: Update TinaCMSDataService transformation logic
- **test-backend-integration**: Validate TinaCMS schema and data transformation

**Estimated Time**: 9 hours
**Agent**: backend-nodejs-specialist, test-architect

### Phase 3: Frontend Implementation (7 tasks)
Focus: Map components, location search UI, and distance calculations

- **test-frontend**: Design frontend component test suite
- **impl-frontend-map**: Create VendorMap component (Leaflet.js + React-Leaflet)
- **impl-frontend-location-card**: Create VendorLocationCard component
- **impl-frontend-search**: Create LocationSearchFilter component
- **impl-frontend-distance**: Implement Haversine distance calculation utility
- **impl-frontend-hook**: Create useLocationFilter custom hook
- **impl-frontend-vendor-detail**: Integrate map into vendor detail pages
- **impl-frontend-vendor-list**: Integrate location search into listing pages

**Estimated Time**: 18 hours
**Agent**: frontend-react-specialist, test-architect

### Phase 4: Integration & Testing (2 tasks)
Focus: End-to-end validation and testing

- **integ-data-flow**: Validate end-to-end data flow (TinaCMS → Map Display)
- **integ-e2e**: Comprehensive E2E testing with Playwright

**Estimated Time**: 5 hours
**Agent**: test-architect, qa-specialist

### Phase 5: Final Validation (1 task)
Focus: Quality assurance and documentation

- **final-validation**: Comprehensive quality validation and documentation

**Estimated Time**: 3 hours
**Agent**: qa-specialist, documentation-specialist

## Total Estimated Time: 35 hours

## Task Dependencies

```
pre-1 (✓) → pre-2
           ↓
        test-backend
           ↓
    impl-backend-schema
           ↓
    impl-backend-types
           ↓
    impl-backend-service
           ↓
 test-backend-integration
           ↓
      test-frontend
           ↓
    ┌──────┴──────┬──────────────┬────────────┐
    ↓             ↓              ↓            ↓
impl-frontend- impl-frontend- impl-frontend- impl-frontend-
   map         location-card    search       distance
    │             │              │            │
    └─────────────┴──────────────┴────────────┘
                  ↓
          impl-frontend-hook
                  ↓
        ┌─────────┴─────────┐
        ↓                   ↓
impl-frontend-      impl-frontend-
vendor-detail       vendor-list
        │                   │
        └─────────┬─────────┘
                  ↓
           integ-data-flow
                  ↓
             integ-e2e
                  ↓
          final-validation
```

## Detailed Task Files

### Phase 1: Pre-Execution Analysis
- 📄 [task-pre-2-integration-strategy.md](tasks/task-pre-2-integration-strategy.md) - Create integration strategy document

### Phase 2: Backend Implementation
- 📄 [task-test-backend-suite.md](tasks/task-test-backend-suite.md) - Design backend validation test suite
- 📄 [task-impl-backend-schema.md](tasks/task-impl-backend-schema.md) - Extend Payload CMS vendor collection schema
- 📄 [task-impl-backend-types.md](tasks/task-impl-backend-types.md) - Update TypeScript interfaces
- 📄 [task-impl-backend-service.md](tasks/task-impl-backend-service.md) - Update TinaCMSDataService transformation
- 📄 [task-test-backend-integration.md](tasks/task-test-backend-integration.md) - Validate Payload CMS schema and data transformation

### Phase 3: Frontend Implementation
- 📄 [task-test-frontend-suite.md](tasks/task-test-frontend-suite.md) - Design frontend component test suite
- 📄 [task-impl-frontend-map.md](tasks/task-impl-frontend-map.md) - Create VendorMap component
- 📄 [task-impl-frontend-location-card.md](tasks/task-impl-frontend-location-card.md) - Create VendorLocationCard component
- 📄 [task-impl-frontend-search.md](tasks/task-impl-frontend-search.md) - Create LocationSearchFilter component
- 📄 [task-impl-frontend-distance.md](tasks/task-impl-frontend-distance.md) - Implement Haversine distance calculation
- 📄 [task-impl-frontend-hook.md](tasks/task-impl-frontend-hook.md) - Create useLocationFilter custom hook
- 📄 [task-impl-frontend-vendor-detail.md](tasks/task-impl-frontend-vendor-detail.md) - Integrate map into vendor detail pages
- 📄 [task-impl-frontend-vendor-list.md](tasks/task-impl-frontend-vendor-list.md) - Integrate location search into listing pages

### Phase 4: Integration & Testing
- 📄 [task-integ-data-flow.md](tasks/task-integ-data-flow.md) - Validate end-to-end data flow
- 📄 [task-integ-e2e.md](tasks/task-integ-e2e.md) - Comprehensive E2E testing

### Phase 5: Final Validation
- 📄 [task-final-validation.md](tasks/task-final-validation.md) - Comprehensive quality validation

## Quick Start Guide

### For Backend Implementation
```bash
# Start with backend schema changes
cd /home/edwin/development/ptnextjs

# 1. Read integration strategy
cat .agent-os/specs/2025-10-19-vendor-location-mapping/tasks/task-pre-2-integration-strategy.md

# 2. Read backend test suite
cat .agent-os/specs/2025-10-19-vendor-location-mapping/tasks/task-test-backend-suite.md

# 3. Implement schema changes (follow impl-backend-schema.md)
# Edit: tina/config.ts

# 4. Rebuild TinaCMS schema
npm run tina:build

# 5. Update TypeScript types (follow impl-backend-types.md)
# Edit: lib/types.ts

# 6. Update data service (follow impl-backend-service.md)
# Edit: lib/tinacms-data-service.ts

# 7. Test backend integration
npm run build
npm run type-check
```

### For Frontend Implementation
```bash
# Start with frontend components
cd /home/edwin/development/ptnextjs

# 1. Create VendorMap component
# Follow: tasks/task-impl-frontend-map.md

# 2. Create location utilities
# Follow: tasks/task-impl-frontend-distance.md

# 3. Create search components
# Follow: tasks/task-impl-frontend-search.md

# 4. Test with Playwright
npx playwright test

# 5. Verify with dev server
npm run dev
```

## Environment Setup Requirements

### Required Environment Variables

**✅ NONE REQUIRED!**

Leaflet.js with OpenFreeMap tiles requires **NO API keys or environment variables**.

Maps work immediately after `npm install` with zero configuration.

### Optional Environment Variables

```bash
# For geocoding API (future enhancement)
NEXT_PUBLIC_GEOCODING_API_KEY=optional_geocoding_key
# Note: geocode.maps.co also requires no API key
```

## Testing Strategy

### Backend Testing
- TinaCMS schema validation (`npm run tina:build`)
- TypeScript type checking (`npm run type-check`)
- Build validation (`npm run build`)
- Manual testing in TinaCMS admin UI

### Frontend Testing
- **Playwright E2E tests** (REQUIRED per CLAUDE.md)
- Component unit tests (optional)
- Visual regression tests
- Accessibility testing

### Integration Testing
- End-to-end data flow validation
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsive testing
- Performance testing

## Critical Notes

### Technology Stack Verified (v1.1)
- ✅ **Payload CMS** (migrated from TinaCMS per git commit 8dbc7c3)
- ✅ **Leaflet.js 1.9.4** + React-Leaflet 5.0.0 (switched from unused Mapbox GL JS)
- ✅ **OpenFreeMap tiles** (NO API KEY REQUIRED)

### Key Implementation Guidelines
1. **Always use Playwright** to verify assumptions (per CLAUDE.md)
2. **Payload CMS patterns**: Follow existing schema patterns in `payload/collections/Vendors.ts`
3. **Backward compatibility**: All coordinate fields are optional
4. **Static generation**: No runtime data fetching (build-time only)
5. **Manual coordinates**: Default approach (geocoding API optional)
6. **NO API keys needed**: Leaflet.js + OpenFreeMap work immediately

### File Paths (All Absolute)
- Payload CMS Config: `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts`
- Data Service: `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts` (legacy name)
- Types: `/home/edwin/development/ptnextjs/lib/types.ts`
- Vendor Detail Page: `/home/edwin/development/ptnextjs/app/(site)/vendors/[slug]/page.tsx`
- Vendor List Page: `/home/edwin/development/ptnextjs/app/(site)/vendors/page.tsx`

## Success Criteria

### Backend Complete When:
- [x] Payload CMS schema includes coordinates and address fields ✅
- [x] TypeScript types updated with VendorCoordinates and VendorLocation ✅
- [x] TinaCMSDataService transforms location data correctly ✅
- [x] `npm run build` succeeds without errors ✅
- [ ] Test vendors created with coordinate data
- [x] Backward compatibility maintained (existing vendors work) ✅

### Frontend Complete When:
- [x] VendorMap component displays maps correctly ✅
- [x] VendorLocationCard shows location information ✅
- [ ] **LocationSearchFilter enables distance-based search** (REQUIRED - PENDING)
- [ ] **Haversine distance calculation works accurately** (REQUIRED - PENDING)
- [ ] **useLocationFilter hook filters vendors by proximity** (REQUIRED - PENDING)
- [x] Vendor detail pages show interactive maps ✅
- [ ] **Vendor list pages have location search** (REQUIRED - PENDING)
- [x] All Playwright tests pass ✅
- [x] Responsive design verified on mobile ✅

### Integration Complete When:
- [x] End-to-end data flow validated (Payload CMS → UI) ✅
- [x] All E2E tests pass (24/24 core tests) ✅
- [x] Cross-browser testing complete ✅
- [ ] **Location search E2E tests pass** (REQUIRED - PENDING)
- [ ] Accessibility requirements met
- [ ] Performance benchmarks met
- [ ] Documentation updated

## Risk Mitigation

### High-Risk Areas
1. **Mapbox token management**: Ensure token is properly configured
2. **Coordinate validation**: Invalid data must be handled gracefully
3. **Static generation**: Ensure no runtime API calls
4. **Backward compatibility**: Existing vendors must continue working

### Mitigation Strategies
- Comprehensive testing at each phase
- Incremental implementation (backend → frontend → integration)
- Fallback UI for missing coordinates
- Extensive error logging and validation

## Next Steps

1. **Start with Phase 2** (Backend Implementation) if backend not complete
2. **Start with Phase 3** (Frontend Implementation) if backend complete
3. **Review integration strategy** (task-pre-2) before starting
4. **Set up Mapbox token** before frontend work
5. **Create test vendors** during backend implementation for frontend testing

## Support Resources

- **TinaCMS Documentation**: https://tina.io/docs/
- **Mapbox GL JS Documentation**: https://docs.mapbox.com/mapbox-gl-js/
- **Next.js App Router**: https://nextjs.org/docs/app
- **Playwright Testing**: https://playwright.dev/

---

**Ready to start?** Begin with Phase 2 (Backend Implementation) by reading the integration strategy document.
