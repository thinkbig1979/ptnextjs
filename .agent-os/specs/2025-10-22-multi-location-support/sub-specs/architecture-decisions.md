# Architecture Decisions

**Spec:** Multi-Location Support for Vendors
**Date:** 2025-10-22
**Decision Framework:** Architecture Decision Records (ADRs)

## Architectural Decision Records

### ADR-001: Locations Storage as Array Field vs Separate Collection

**Decision Context and Problem Statement:**

We need to store multiple office locations for vendors. There are two primary approaches:
1. Store locations as an array field within the vendors collection
2. Create a separate locations collection with foreign key references

**Decision Options Considered:**

**Option A: Array Field in Vendors Collection**
- Locations stored as JSON array within vendors document
- Schema: `vendors.locations: VendorLocation[]`
- Pros:
  - Simple data model, no joins required
  - Atomic updates (locations always consistent with vendor)
  - Easier migration (single document update)
  - Better performance for fetching vendor + locations (no joins)
- Cons:
  - SQLite JSON queries less efficient than relational queries
  - Cannot easily query "all locations" across vendors
  - Array size limits (practical limit ~1000 locations per vendor, unlikely to reach)

**Option B: Separate Locations Collection**
- Separate `locations` collection with `vendorId` foreign key
- Schema: `locations { id, vendorId, address, latitude, longitude, ... }`
- Pros:
  - Normalized data model (3NF)
  - Easier to query all locations across vendors
  - Better for PostgreSQL (production database)
- Cons:
  - Requires join queries for vendor + locations
  - More complex data updates (transaction management)
  - More complex migration (create new collection, migrate data)

**Chosen Solution:**

**Option A: Array Field in Vendors Collection**

**Rationale:**
- **Performance**: Vendors almost always accessed with their locations (profile page, search results), so co-locating data avoids joins
- **Simplicity**: Single document update is atomic, no transaction management needed
- **Payload CMS best practices**: Array fields are well-supported with rich validation hooks
- **Migration ease**: Single field addition/replacement, minimal code changes
- **Realistic usage**: Vendors unlikely to have > 10 locations, array performance is excellent at this scale

**Consequences:**
- Positive: Faster queries, simpler codebase, easier testing
- Negative: If future requirements need complex location-based analytics across all vendors, may need to restructure
- Mitigation: If analytics needed, can create materialized view or separate reporting database from Payload CMS data

---

### ADR-002: Geocoding Strategy - Reuse Existing Backend Proxy

**Decision Context and Problem Statement:**

Addresses need to be converted to latitude/longitude coordinates for map display and location search. The location-name-search feature (already implemented) provides a backend proxy at `/api/geocode` that calls the Photon API. We need to decide whether to reuse this infrastructure or create a separate geocoding solution.

**Decision Options Considered:**

**Option A: Create Separate Client-Side Geocoding**
- Frontend calls geocode.maps.co API directly from browser
- User clicks "Geocode" button → JavaScript fetch → API response → populate lat/long fields
- Pros:
  - Immediate user feedback (no backend round-trip)
  - Reduces backend load (no proxy API calls)
- Cons:
  - Duplicates geocoding infrastructure (two different APIs)
  - Exposes geocoding API to client (rate limits easier to abuse)
  - Inconsistent with location-name-search architecture
  - CORS issues if API doesn't support cross-origin requests

**Option B: Reuse Existing `/api/geocode` Backend Proxy (Photon API)**
- Frontend calls existing backend endpoint GET `/api/geocode?q={address}`
- Backend proxies request to Photon API (already implemented)
- Pros:
  - **Consistency**: Same geocoding infrastructure across all features
  - **Code reuse**: No duplicate geocoding logic
  - **Rate limiting**: Already enforced on backend (10 req/min per IP)
  - **Maintainability**: Single geocoding service to monitor and maintain
  - **API abstraction**: Can swap geocoding providers without changing frontend
- Cons:
  - Slight backend latency (acceptable trade-off for consistency)

**Chosen Solution:**

**Option B: Reuse Existing `/api/geocode` Backend Proxy (Photon API)**

**Rationale:**
- **DRY Principle**: Don't duplicate geocoding infrastructure when location-name-search already provides it
- **Consistency**: Use same geocoding service (Photon) across all features
- **Architecture alignment**: Follows existing pattern established in location-name-search spec
- **Maintainability**: Single point of change for geocoding provider, rate limits, caching
- **Security**: Backend proxy prevents API abuse and allows monitoring

**Consequences:**
- Positive: Consistent architecture, code reuse, easier to maintain and monitor
- Negative: Slight additional latency compared to direct client-side calls (acceptable)
- **Coordination Required**: Multi-location feature depends on location-name-search `/api/geocode` endpoint being deployed first

**Integration Note:**
This decision ensures multi-location support builds on the location-name-search foundation rather than creating parallel infrastructure. The GeocodingButton component will call the existing `/api/geocode` endpoint.

---

### ADR-003: Tier Restriction Enforcement - Client-Side vs Server-Side

**Decision Context and Problem Statement:**

Tier 2+ vendors can manage multiple locations, while free/tier 1 vendors are limited to one location. We need to enforce this restriction.

**Decision Options Considered:**

**Option A: Client-Side Only**
- UI conditionally renders LocationsManagerCard vs TierUpgradePrompt based on vendor.tier
- No backend validation, trusts frontend
- Pros:
  - Immediate UI feedback (no network call)
  - Simpler backend code
- Cons:
  - Security vulnerability: User can bypass UI and call API directly
  - No protection against malicious clients

**Option B: Server-Side Only**
- Backend validates tier on every vendor update
- Frontend always shows location manager, backend rejects invalid requests
- Pros:
  - Secure: Cannot be bypassed by client manipulation
  - Authoritative source of truth
- Cons:
  - Poor UX: User fills form, submits, then gets error

**Option C: Both Client-Side and Server-Side (Defense in Depth)**
- Client-side conditional rendering for good UX
- Server-side validation as security enforcement
- Pros:
  - Best of both worlds: Good UX + secure enforcement
  - Prevents accidental bugs and intentional abuse
- Cons:
  - Code duplication (tier logic in frontend and backend)

**Chosen Solution:**

**Option C: Both Client-Side and Server-Side (Defense in Depth)**

**Rationale:**
- **Security**: Never trust the client. Backend validation prevents bypassing UI restrictions
- **User experience**: Client-side rendering provides immediate feedback, prevents wasted form submissions
- **Robustness**: Catches bugs in frontend code (if tier check logic has bug, backend still enforces)
- **Best practice**: Defense in depth is security industry standard for critical business logic

**Consequences:**
- Positive: Secure and user-friendly, robust to implementation bugs
- Negative: Slight code duplication (tier check in TierService used by frontend and backend)
- Mitigation: Centralize tier logic in shared utility (TierService) to minimize duplication

---

### ADR-004: Location Search Query Strategy - Bounding Box vs Radius

**Decision Context and Problem Statement:**

Location-based search needs to find vendors within a certain distance from search center. Two approaches:

**Decision Options Considered:**

**Option A: Bounding Box (Geo Bounds)**
- Calculate min/max lat/long from center + radius
- Query: `WHERE lat BETWEEN minLat AND maxLat AND lng BETWEEN minLng AND maxLng`
- Pros:
  - Simple SQL query (indexed range scan)
  - Fast performance (O(log n) with indexes)
  - Works well with SQLite JSON queries
- Cons:
  - Returns square area, not circular (some false positives at corners)
  - Inaccurate near poles (latitude/longitude distortion)

**Option B: Haversine Distance Formula**
- Calculate actual great-circle distance for each location
- Query: `WHERE haversine(lat, lng, centerLat, centerLng) <= radius`
- Pros:
  - Precise circular search area
  - Accurate distances globally
- Cons:
  - Expensive calculation (trigonometry per row)
  - No index support (full table scan)
  - Slower for large datasets

**Option C: Hybrid Approach (Bounding Box + Post-Filter)**
- Use bounding box for initial query (fast, indexed)
- Calculate haversine distance in application code for results
- Filter out false positives from corners
- Pros:
  - Fast initial query (indexed range scan)
  - Accurate final results (haversine filtering)
  - Best of both worlds
- Cons:
  - Slightly more complex code
  - Returns more results than needed from database (filtered in app)

**Chosen Solution:**

**Option C: Hybrid Approach (Bounding Box + Post-Filter)**

**Rationale:**
- **Performance**: Indexed bounding box query is 10-100x faster than full table scan with haversine
- **Accuracy**: Post-filter with haversine ensures precise circular search area
- **Scalability**: Works well with 10,000+ vendors (indexed query stays fast)
- **Simplicity**: Bounding box calculation is simple (add/subtract lat/long degrees based on radius)

**Consequences:**
- Positive: Fast and accurate location search, scales to production workloads
- Negative: Slightly more code (bounding box calculation + haversine filter)
- Trade-off: Database returns ~15-20% more results than needed (corners of square), but post-filter is fast in application memory

**Implementation Details:**
```typescript
// Calculate bounding box from center + radius
function calculateGeoBounds(lat: number, lng: number, radiusKm: number) {
  const earthRadiusKm = 6371;
  const latDelta = (radiusKm / earthRadiusKm) * (180 / Math.PI);
  const lngDelta = (radiusKm / (earthRadiusKm * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

// Haversine distance for post-filtering
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

---

### ADR-005: Map Component Library - react-leaflet vs mapbox-gl

**Decision Context and Problem Statement:**

Need to display vendor locations on an interactive map. Two popular React map libraries:

**Decision Options Considered:**

**Option A: react-leaflet (Leaflet.js wrapper)**
- Open-source map library with React bindings
- Uses OpenStreetMap tiles by default
- Pros:
  - Completely free and open-source
  - No API key required
  - Lightweight (~40KB gzipped)
  - Excellent React integration
  - Large community and plugins
- Cons:
  - Less polished UI than Mapbox
  - Fewer built-in features (geocoding, directions)

**Option B: mapbox-gl-js + react-map-gl**
- Commercial map platform with free tier
- React bindings maintained by Uber
- Pros:
  - Beautiful, polished map UI
  - More features (3D buildings, satellite imagery, geocoding API)
  - Better performance for large datasets (WebGL rendering)
- Cons:
  - Requires Mapbox API key (free tier: 50,000 loads/month)
  - Larger bundle size (~200KB)
  - Commercial license required for self-hosting tiles

**Chosen Solution:**

**Option A: react-leaflet (Leaflet.js)**

**Rationale:**
- **Cost**: Completely free, no API key management, no usage limits
- **Simplicity**: Works out-of-the-box with OpenStreetMap tiles, no configuration
- **Bundle size**: Smaller bundle (~40KB vs ~200KB) improves initial page load
- **Feature parity**: For this use case (displaying markers on map with popups), Leaflet is sufficient
- **Open source**: No vendor lock-in, can self-host everything if needed

**Consequences:**
- Positive: Free forever, lightweight, simple to integrate
- Negative: Less polished UI than Mapbox (acceptable trade-off for our use case)
- Migration path: If we need advanced features later (3D buildings, satellite imagery), can migrate to Mapbox with minimal frontend changes (both support similar marker/popup APIs)

---

## Technical Constraints

### Performance Requirements and Limitations

**Response Time Constraints:**
- Location search must complete in < 1 second for 1000 vendors within 100km radius
- Vendor profile page load (including locations) must complete in < 2 seconds
- Geocoding API call timeout: 10 seconds (fail gracefully if exceeded)

**Throughput Limitations:**
- geocode.maps.co free tier: 1 request/second (3,600 per hour)
- Location search API: Target 100 concurrent users (100 requests/second peak)
- Vendor update API: Target 50 concurrent updates (unlikely to reach in practice)

**Mitigation Strategies:**
- **Geocoding rate limits**: Client-side caching (24 hours), debouncing (500ms), upgrade to paid tier if needed
- **Search performance**: Indexed lat/long fields, bounding box queries, result pagination (max 100 vendors per request)
- **Database performance**: SQLite works for < 10,000 vendors, migrate to PostgreSQL with PostGIS for larger scale

### Scalability Constraints and Considerations

**Horizontal Scalability:**
- Next.js app can scale horizontally (stateless, no session affinity needed)
- Payload CMS backend scales horizontally with load balancer + multiple instances
- SQLite is single-node (not horizontally scalable), but sufficient for current scale

**Vertical Scalability:**
- SQLite performs well up to ~10,000 vendors with 10 locations each (100,000 location records)
- Beyond that, migrate to PostgreSQL with PostGIS for better geo query performance

**Data Volume Projections:**
- Current: ~100 vendors (mostly tier 0/1, single location)
- 1 year: ~500 vendors (20% tier 2+, average 3 locations each) = ~800 location records
- 3 years: ~2,000 vendors (30% tier 2+, average 4 locations each) = ~4,000 location records
- 5 years: ~10,000 vendors (40% tier 2+, average 5 locations each) = ~30,000 location records

**Scaling Decision Points:**
- < 10,000 vendors: SQLite is sufficient
- > 10,000 vendors: Migrate to PostgreSQL with PostGIS extension
- > 100,000 vendors: Consider dedicated search service (Elasticsearch, Algolia) for location queries

### Security Requirements and Restrictions

**Authentication Restrictions:**
- JWT tokens expire after 1 hour (access token)
- Refresh tokens expire after 7 days
- No "remember me" functionality (security > convenience for business platform)

**Authorization Restrictions:**
- Vendors can only update their own profile (ownership check via JWT.vendorId === params.id)
- Admins can update any vendor profile (role check via JWT.role === 'admin')
- Field-level access control: locations array only writable by tier 2+ vendors (enforced by Payload CMS access hooks)

**Data Access Restrictions:**
- Public location search API has no authentication (business directory, public info)
- Rate limiting on public API: 100 requests/minute per IP address (prevents scraping)
- Vendor update API rate limited: 10 requests/minute per user (prevents spam)

**Input Validation Restrictions:**
- Address: Max 500 characters, no HTML tags (XSS prevention)
- City/Country: Alphanumeric + spaces/hyphens only, max 255 characters
- Latitude: -90 to 90 (validates coordinates are on Earth)
- Longitude: -180 to 180

**Security Boundaries:**
- Trust boundary: Everything on client-side is untrusted, all security checks on server
- Tier restrictions enforced on backend, never rely on frontend checks
- Geocoding API calls from client are acceptable (public API, no sensitive data)

### Resource Constraints and Dependencies

**Development Resource Constraints:**
- Timeline: 4 weeks from start to production deployment
- Team: 1 full-stack developer (backend + frontend + testing)
- Budget: $0 for external services (use free tiers: geocode.maps.co, OpenStreetMap tiles)

**Infrastructure Constraints:**
- Hosting: Vercel free tier (unlimited bandwidth, 100 GB-hours compute/month)
- Database: SQLite file storage (no external database hosting cost)
- CDN: Cloudflare free tier for static assets

**External Service Dependencies:**
- **Critical**: geocode.maps.co API (fallback: manual lat/long entry)
- **Critical**: OpenStreetMap tiles for map component (fallback: list-only view)
- **Non-critical**: Analytics services (can deploy without)

## Design Principles

### Fundamental Design Principles Adopted

**1. Progressive Enhancement**
- Core functionality works without JavaScript (basic vendor info displays)
- Map is enhancement (if JavaScript/map fails, location list still visible)
- Graceful degradation for older browsers

**2. Separation of Concerns**
- Business logic in services (TierService, LocationService)
- UI logic in components (LocationsManagerCard, LocationFormFields)
- Data access in Payload CMS ORM layer
- Clear boundaries between layers

**3. Single Responsibility Principle**
- Each component has one job (LocationFormFields = render location form, LocationsManagerCard = manage locations array)
- Each service has one domain (TierService = tier logic, LocationService = location validation/distance)

**4. Don't Repeat Yourself (DRY)**
- Tier restriction logic centralized in TierService (used by frontend and backend)
- Location validation logic centralized in LocationService
- Geocoding logic in GeocodingService (client-side caching, debouncing)

**5. You Aren't Gonna Need It (YAGNI)**
- No over-engineering: Build only what's needed now
- No premature optimization: Use simple solutions (SQLite JSON arrays) until scale requires complex solutions
- No speculative features: Only implement requirements from spec, not "nice to have" ideas

**6. Fail Fast and Loud**
- Validation errors caught immediately (client-side Zod validation, server-side Payload hooks)
- Throw exceptions for invalid state (multiple HQs, tier violations)
- Don't silently ignore errors or return null

### Architectural Patterns and Styles Used

**Primary Patterns:**
- **Repository Pattern**: Payload CMS ORM abstracts database access
- **Service Layer Pattern**: Business logic in services (TierService, LocationService, SearchService)
- **Facade Pattern**: TinaCMSDataService provides unified API for content access (legacy compatibility)
- **Strategy Pattern**: Tier-based feature gates implement different strategies per tier

**Frontend Patterns:**
- **Container/Presentational Pattern**: LocationsManagerCard (container) wraps LocationFormFields (presentational)
- **Controlled Components Pattern**: React Hook Form controls all form inputs
- **Render Props Pattern**: Conditional rendering based on tier (TierGate component)

**Data Patterns:**
- **Embedded Documents**: Locations stored as array within vendor document (denormalization for performance)
- **Optimistic Updates**: SWR optimistically updates UI before server confirms (rollback on error)

### Coding Standards and Conventions

**TypeScript Standards:**
- All files use TypeScript (.ts, .tsx)
- No `any` types (use `unknown` and type guards if needed)
- Strict mode enabled (`noImplicitAny`, `strictNullChecks`, etc.)
- Explicit return types on public functions

**React Standards:**
- Functional components only (no class components)
- Hooks for state management (useState, useSWR, useEffect)
- Memoization for expensive components (React.memo)
- Prop types via TypeScript interfaces

**Naming Conventions:**
- Components: PascalCase (LocationsManagerCard)
- Functions/variables: camelCase (addLocation, vendorLocations)
- Constants: UPPER_SNAKE_CASE (GEOCODING_API_URL)
- Types/Interfaces: PascalCase (VendorLocation, LocationFormData)
- Files: PascalCase for components, camelCase for utilities

**Code Organization:**
- Group by feature (components/dashboard/, components/vendors/)
- Co-locate tests with source files (LocationsManagerCard.test.tsx)
- Separate concerns (services/ for logic, components/ for UI, types/ for interfaces)

**Documentation Standards:**
- JSDoc comments on all public functions/components
- Inline comments explain "why" not "what"
- README.md for each major feature subdirectory
- TypeScript types serve as inline documentation

## Technology Choices

### Framework and Library Selections

**Core Framework: Next.js 14 (App Router)**
- Rationale: Server-side rendering, static site generation, built-in routing, excellent TypeScript support
- Alternatives considered: Gatsby (less flexible), Remix (less mature ecosystem)
- Version: 14.2.5 (stable, well-documented)

**CMS: Payload CMS 3.x**
- Rationale: TypeScript-first, flexible schema, built-in authentication, excellent developer experience
- Alternatives considered: Strapi (less type-safe), Directus (more complex setup)
- Migration from TinaCMS already complete (unified CMS strategy)

**UI Library: shadcn/ui + Radix UI**
- Rationale: Copy-paste components (no NPM package lock-in), accessible by default, customizable
- Alternatives considered: Material-UI (too opinionated), Ant Design (heavy bundle)
- Includes: Button, Card, Input, Dialog, Alert, Badge, Separator components

**Form Library: React Hook Form + Zod**
- Rationale: Performant (uncontrolled inputs), excellent TypeScript support, Zod integration for validation
- Alternatives considered: Formik (less performant), plain React state (more boilerplate)
- Version: React Hook Form 7.53.0, Zod 3.23.8

**Map Library: react-leaflet + Leaflet.js**
- Rationale: Free, lightweight, open-source, good React integration
- Alternatives considered: mapbox-gl (commercial, heavier bundle)
- Version: react-leaflet 4.2.1, leaflet 1.9.4

**Data Fetching: SWR**
- Rationale: Stale-while-revalidate strategy, automatic caching, optimistic updates
- Alternatives considered: TanStack Query (more features, heavier), plain fetch (no caching)
- Version: SWR 2.2.4

### Database and Storage Technology Decisions

**Development Database: SQLite**
- Rationale: Zero-configuration, file-based, sufficient for development and small-scale production
- Pros: Easy setup, no external dependencies, portable
- Cons: Single-node only, limited concurrency, less performant for geo queries

**Production Database (Future): PostgreSQL with PostGIS**
- Rationale: Industry-standard relational database with excellent geospatial support
- Migration trigger: > 10,000 vendors or location search performance degrades
- PostGIS provides: Spatial indexes, distance queries, geo bounding box queries

**Storage Strategy: Embedded Documents (Locations Array)**
- Rationale: Performance (no joins), simplicity (atomic updates), Payload CMS best practices
- Trade-off: Slight data denormalization acceptable for this use case

### Infrastructure and Deployment Choices

**Hosting Platform: Vercel**
- Rationale: Next.js first-class support, edge deployment, automatic HTTPS, excellent CI/CD
- Alternatives considered: Netlify (good but less Next.js optimization), AWS (more complex setup)
- Deployment: Git push to main triggers automatic deployment

**CDN: Cloudflare (Free Tier)**
- Rationale: Fast global CDN, DDoS protection, free SSL certificates
- Usage: Static assets (images, JS bundles), map tiles cached at edge

**Database Hosting: Local File (SQLite)**
- Rationale: Development simplicity, no external hosting cost
- Production upgrade path: Migrate to managed PostgreSQL (Heroku, Supabase, Neon)

**Monitoring: Vercel Analytics (Free)**
- Rationale: Built-in, automatic setup, Web Vitals tracking
- Alternatives considered: Google Analytics (privacy concerns), PostHog (overkill for now)

**Error Tracking: Console Logs (MVP)**
- Rationale: Sufficient for MVP, upgrade to Sentry if error volume increases
- Future upgrade: Sentry free tier (5,000 errors/month)

---

## Summary

This multi-location feature follows these core principles:
- **Simplicity**: Use simple solutions (array fields, client-side geocoding) until scale demands complexity
- **Security**: Never trust client (enforce tier restrictions on backend)
- **Performance**: Optimize for common case (indexed queries, caching, co-located data)
- **User Experience**: Progressive enhancement, graceful degradation, immediate feedback
- **Maintainability**: Clear separation of concerns, DRY, well-documented code

All architectural decisions prioritize **shipping quickly** while maintaining **quality and security**, with clear upgrade paths when scale requires more sophisticated solutions.
