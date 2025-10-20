# Task: Create Integration Strategy Document

**Task ID**: pre-2
**Phase**: Phase 1 - Pre-Execution Analysis
**Agent**: system-architect
**Estimated Time**: 1 hour
**Dependencies**: pre-1 (codebase analysis - COMPLETED)

**STATUS**: ⚠️ SUPERSEDED BY integration-strategy.md v1.1

This task has been completed and superseded by the updated integration strategy document v1.1, which reflects the migration from Mapbox to Leaflet.js. Please refer to `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/integration-strategy.md` for the current integration approach.

## Objective

Create a comprehensive integration strategy document that maps out how location mapping features will integrate with the existing TinaCMS-based architecture.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts` (lines 267-363: transformTinaVendor method)
- `/home/edwin/development/ptnextjs/tina/config.ts` (lines 289-293: current location schema)
- `/home/edwin/development/ptnextjs/lib/types.ts` (lines 179-222: Vendor interface)
- `/home/edwin/development/ptnextjs/app/(site)/vendors/[slug]/page.tsx` (vendor detail page)
- `/home/edwin/development/ptnextjs/package.json` (confirm leaflet@1.9.4 and react-leaflet@5.0.0)

## Deliverables

Create document: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/integration-strategy.md`

### Document Structure

```markdown
# Vendor Location Mapping Integration Strategy

## 1. Architecture Overview
- Data flow: TinaCMS → TinaCMSDataService → React Components
- Static generation constraints
- Backward compatibility requirements

## 2. TinaCMS Schema Changes
- New fields to add to vendor collection
- Field types and validation rules
- Migration path for existing vendors

## 3. TypeScript Type Extensions
- VendorCoordinates interface
- VendorAddress interface
- Updated Vendor interface

## 4. Data Service Modifications
- transformTinaVendor() extensions
- Coordinate validation logic
- Default value handling

## 5. Frontend Component Architecture
- VendorMap component (Leaflet.js + React-Leaflet)
- VendorLocationCard component
- LocationSearchFilter component
- Component integration points

## 6. Geocoding Strategy
- Manual entry (MVP default)
- Optional API integration (geocode.maps.co)
- Coordinate validation

## 7. Environment Configuration
- NO API KEY REQUIRED (Leaflet.js + OpenFreeMap)
- Optional geocoding API key (geocode.maps.co)
- Development vs production configs

## 8. Testing Strategy
- TinaCMS schema validation
- Data transformation tests
- Component unit tests
- E2E map display tests

## 9. Migration Plan
- Existing vendor data (no coordinates)
- Graceful degradation strategy
- Content editor workflow

## 10. Performance Considerations
- Static map rendering
- Bundle size impact (Leaflet.js + React-Leaflet)
- Image optimization for map tiles from OpenFreeMap
```

## Acceptance Criteria

- [x] Integration strategy document created at specified path
- [x] All 10 sections completed with specific implementation details
- [x] TinaCMS patterns correctly identified (NOT Payload CMS)
- [x] Leaflet.js confirmed as map library (updated from Mapbox)
- [x] Backward compatibility strategy defined
- [x] Static site generation constraints addressed
- [x] NO environment variables required (Leaflet.js + OpenFreeMap benefit)
- [x] Migration path for existing vendors defined
- [x] Document updated to v1.1 with Leaflet.js migration

## Key Decisions to Document

1. **Schema Design**: Optional vs required coordinate fields
2. **Geocoding Approach**: Manual entry vs API automation
3. **Map Display**: When to show maps (always vs conditional)
4. **Search Implementation**: Distance calculation strategy (Haversine)
5. **Error Handling**: Missing coordinates, invalid data
6. **Content Editor UX**: How editors will add location data

## Notes

- This document will serve as the blueprint for all implementation tasks
- Focus on TinaCMS-specific patterns and constraints
- Consider static site generation limitations (no runtime geocoding)
- Ensure compatibility with existing vendor/partner unified model
