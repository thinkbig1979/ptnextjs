# Implementation Guide

> Spec: Vendor Location Mapping
> Created: 2025-10-19
> Spec Folder: 2025-10-19-vendor-location-mapping

## Development Approach

**Methodology**: Iterative implementation with testing at each phase

**Development Workflow**:
- Feature branch: `feature/vendor-location-mapping`
- Code review: Required before merge to main
- Testing: Component tests + manual browser testing

**Team Coordination**:
- Single developer implementation recommended for simplicity
- Review with stakeholders after each phase completion

## Architecture Overview

**High-Level Architecture**:

```
┌─────────────────────────────────────────────────────┐
│  Payload CMS (SQLite)                               │
│  └── Vendors Collection (+ location fields)         │
└─────────────────┬───────────────────────────────────┘
                  │ Static Build Time
                  ↓
┌─────────────────────────────────────────────────────┐
│  Next.js Static Site                                │
│  ├── Vendor Detail Pages                            │
│  │   └── VendorLocationMap (Mapbox + OpenFreeMap)   │
│  └── Vendor Listing Pages                           │
│      └── LocationSearchFilter                       │
│          ├── Geocoding (Nominatim API)              │
│          └── Distance Calculation (Haversine)       │
└─────────────────────────────────────────────────────┘
```

**Component Relationships**:
- Payload CMS stores location data in SQLite
- Next.js fetches vendor data at build time (static generation)
- Frontend components use location data for maps and filtering
- No runtime backend dependencies

**Data Flow**:
1. Admin adds vendor location via Payload CMS admin
2. Static build fetches all vendors with location data
3. Vendor detail page displays map if location exists
4. User searches by location → geocode → filter → display results

## Implementation Strategy

### Phase 1: Database Schema & Data Model (1-2 hours)
**Milestone**: Location fields added to Payload CMS vendor schema
**Success Criteria**:
- Migration created and applied to SQLite database
- Location fields visible in Payload admin interface
- Can manually add/edit vendor location data

**Risk Mitigation**:
- Test migration on development database first
- Ensure backward compatibility (location fields optional)

### Phase 2: Map Component (2-3 hours)
**Milestone**: Interactive map displays on vendor detail pages
**Success Criteria**:
- VendorLocationMap component renders with OpenFreeMap tiles
- Single vendor marker displays correctly
- Map responsive on mobile and desktop
- Graceful handling of vendors without location data

**Risk Mitigation**:
- Test with various screen sizes
- Handle map initialization errors gracefully

### Phase 3: Location Search & Filtering (3-4 hours)
**Milestone**: Users can search vendors by location and radius
**Success Criteria**:
- LocationSearchFilter component integrated into listing pages
- Geocoding works with Nominatim API
- Distance calculation accurate (Haversine formula)
- Results filtered and sorted by distance
- Distance badges display on vendor cards

**Risk Mitigation**:
- Debounce geocoding requests to respect rate limits
- Cache geocoded locations in session storage
- Test with various location inputs (cities, addresses, countries)

### Phase 4: Testing & Polish (1-2 hours)
**Milestone**: Feature fully tested and production-ready
**Success Criteria**:
- All component tests passing
- Browser testing on mobile and desktop
- Error handling tested (bad addresses, no results, etc.)
- Documentation complete

**Risk Mitigation**:
- Test with real vendor data
- Verify performance with large vendor lists

## Development Workflow

### Setup and Environment Configuration

1. **Install Dependencies**:
   ```bash
   npm install mapbox-gl
   ```

2. **Environment Variables** (if using Mapbox Geocoding instead of Nominatim):
   ```env
   # .env.local (optional - only if using Mapbox Geocoding)
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
   ```

3. **Payload CMS Migration**:
   ```bash
   npm run payload migrate:create add-vendor-location
   # Edit migration file
   npm run payload migrate
   ```

### Coding Standards and Conventions

- **TypeScript**: Strict mode enabled, all types defined
- **Component Structure**: Functional components with TypeScript interfaces
- **File Naming**: PascalCase for components, camelCase for utilities
- **Comments**: JSDoc for component props and public functions
- **Error Handling**: Try-catch for async operations, user-friendly error messages

### Testing and Validation Procedures

**Unit Tests**:
- `lib/utils/distance.ts`: Test Haversine formula accuracy
- `lib/hooks/useLocationFilter.ts`: Test filtering logic

**Component Tests**:
- `VendorLocationMap`: Renders with valid props, handles missing location
- `LocationSearchFilter`: Form validation, geocoding integration

**Manual Browser Testing**:
- View vendor page with location → map displays
- View vendor page without location → graceful fallback
- Search by location → results filtered and sorted
- Mobile responsiveness of map and search

## Quality Assurance

### Code Review Guidelines

- **Checklist**:
  - [ ] TypeScript types defined for all components and utilities
  - [ ] Error handling for geocoding and map initialization
  - [ ] Responsive design tested on mobile and desktop
  - [ ] Accessibility: keyboard navigation, ARIA labels
  - [ ] Performance: debounced geocoding, memoized calculations
  - [ ] No console errors or warnings

### Testing Requirements

- **Component Tests**: 80%+ coverage for new components
- **Integration Tests**: Full user flows (view map, search by location)
- **Browser Testing**: Chrome, Firefox, Safari, Mobile Safari/Chrome

### Documentation Standards

- **Component Documentation**: JSDoc comments for props
- **README Updates**: Document new location search feature
- **Admin Guide**: How to add location data via Payload CMS

**Example Component Documentation**:
```typescript
/**
 * Displays an interactive map showing a vendor's location
 *
 * @param latitude - Vendor's latitude coordinate
 * @param longitude - Vendor's longitude coordinate
 * @param vendorName - Name displayed in marker popup
 * @param address - Optional address displayed in popup
 */
export function VendorLocationMap({ latitude, longitude, vendorName, address }: VendorLocationMapProps) {
  // ...
}
```
