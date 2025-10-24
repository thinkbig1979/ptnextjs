# Implementation Guide

**Spec:** Multi-Location Support for Vendors
**Date:** 2025-10-22
**Spec Folder:** @.agent-os/specs/2025-10-22-multi-location-support

## Development Approach

**Methodology**: Incremental development with feature flags

The implementation follows an incremental approach with clear milestones:
1. Backend schema and API changes (can be deployed independently)
2. Dashboard UI for location management (tier 2+ vendors only)
3. Public profile display enhancements
4. Location-based search integration

Each phase can be developed, tested, and deployed independently to minimize risk and enable faster iteration based on feedback.

**Development Workflow**:
- **Branching Strategy**: Feature branch `feature/multi-location-support` off `main`
- **Code Review Process**: All PRs require 1 approval, automated tests must pass
- **Feature Flags**: Use environment variable `ENABLE_MULTI_LOCATIONS` to gate feature in production

**Team Coordination**:
- **Roles**: Full-stack developer (primary), DevOps (deployment support)
- **Responsibilities**:
  - Backend: Payload CMS schema changes, migration script, API validation
  - Frontend: Dashboard UI components, public profile display, map integration
  - Testing: Unit tests, integration tests, E2E workflow tests
- **Communication**: Daily standup, async updates in Slack channel, PR reviews within 24 hours

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────────────┐         ┌──────────────────────┐ │
│  │  Dashboard UI     │         │  Public Profile Pages│ │
│  │  - Locations Mgr  │         │  - Locations Display │ │
│  │  - Tier Gate      │         │  - Map Component     │ │
│  └────────┬──────────┘         └──────────┬───────────┘ │
│           │                               │              │
│           │ API Calls                     │ API Calls    │
│           ▼                               ▼              │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Payload CMS REST API Layer              │   │
│  │  - PATCH /api/vendors/:id                        │   │
│  │  - GET /api/vendors/search?lat=X&lng=Y           │   │
│  └────────────────────┬─────────────────────────────┘   │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   Payload CMS Backend        │
         │  - Vendors Collection        │
         │  - Validation Hooks          │
         │  - Access Control (RBAC)     │
         └──────────┬───────────────────┘
                    │
                    ▼
         ┌──────────────────────────────┐
         │   SQLite Database            │
         │  - vendors table             │
         │  - locations array field     │
         └──────────────────────────────┘

External Service:
┌──────────────────────────────┐
│  geocode.maps.co API          │
│  (Address → Lat/Long)         │
└──────────────────────────────┘
```

### Component Relationships

```
DashboardProfilePage
  │
  ├─→ (vendor.tier >= 'tier2')
  │     └─→ LocationsManagerCard
  │           ├─→ HQLocationDisplay
  │           ├─→ AdditionalLocationsList
  │           │     └─→ LocationFormFields (per location)
  │           │           └─→ GeocodingButton
  │           └─→ AddLocationButton
  │
  └─→ (vendor.tier < 'tier2')
        └─→ TierUpgradePrompt

VendorPublicProfilePage
  │
  └─→ LocationsTab
        └─→ LocationsTabContent
              ├─→ LocationMapPreview
              │     └─→ Leaflet Map (markers for each location)
              └─→ LocationList
                    ├─→ HQLocationCard
                    └─→ AdditionalLocationsCards (tier 2+ only)
```

### Data Flow and Interaction Patterns

**Location Update Flow:**
```
User edits location in LocationFormFields
  ↓
onChange event → LocationsManagerCard updates local state
  ↓
User clicks "Save" button
  ↓
LocationsManagerCard calls SWR mutation
  ↓
PATCH /api/vendors/:id with updated locations array
  ↓
Payload CMS validates (HQ uniqueness, tier restrictions)
  ↓
Database updated
  ↓
SWR revalidates cache
  ↓
UI updates with fresh data
```

**Location Search Flow:**
```
User performs location-based search
  ↓
Frontend calls GET /api/vendors/search?lat=X&lng=Y&radius=Z
  ↓
Backend queries vendors collection with geo bounds
  ↓
For each vendor, check tier:
  - If tier >= tier2, include all locations
  - If tier < tier2, include only HQ location
  ↓
Calculate distance from search center to each location
  ↓
Sort results by distance
  ↓
Return JSON with vendor + matched locations
  ↓
Frontend displays results on map + list
```

## Implementation Strategy

### Phased Implementation Plan

**Phase 1: Backend Foundation (Week 1)**
- Milestone 1.1: Modify Vendors.ts schema, add locations array field
- Milestone 1.2: Write migration script to convert location → locations[]
- Milestone 1.3: Add validation hooks (HQ uniqueness, tier restrictions)
- Milestone 1.4: Test with Postman (create vendor, update locations, validate errors)
- Success Criteria: All backend unit tests pass, migration script runs successfully on test database

**Phase 2: Dashboard UI (Week 2)**
- Milestone 2.1: Create LocationFormFields component with Zod validation
- Milestone 2.2: Create LocationsManagerCard with CRUD operations
- Milestone 2.3: Integrate GeocodingButton with geocode.maps.co API
- Milestone 2.4: Add TierUpgradePrompt for tier 0/1 users
- Milestone 2.5: Embed LocationsManagerCard in /dashboard/profile page
- Success Criteria: Tier 2 vendors can add/edit/delete locations, tier 0/1 see upgrade prompt, all form validation works

**Phase 3: Public Profile Display (Week 3)**
- Milestone 3.1: Create LocationMapPreview component with react-leaflet
- Milestone 3.2: Create LocationsDisplaySection with location list
- Milestone 3.3: Embed in /vendors/[slug] page with tier-based conditional rendering
- Milestone 3.4: Test SSG build with multiple vendors and locations
- Success Criteria: Public profiles display HQ for all tiers, additional locations for tier 2+, map renders correctly

**Phase 4: Location-Based Search (Week 4)**
- Milestone 4.1: Modify search API to accept lat/lng/radius parameters
- Milestone 4.2: Implement geo bounds query with tier filtering
- Milestone 4.3: Update frontend search UI to include location filter
- Milestone 4.4: Integrate search results with map display
- Success Criteria: Search returns tier-appropriate results, map shows all matched locations, distance sorting works

### Milestone Definitions and Success Criteria

**Milestone 1.1: Payload CMS Schema Modification**
- Deliverable: Updated `/payload/collections/Vendors.ts` with locations array field
- Success Criteria:
  - `npm run payload:generate-types` runs without errors
  - locations field appears in Payload admin UI
  - Validation hooks prevent multiple HQs and tier violations

**Milestone 2.2: LocationsManagerCard Component**
- Deliverable: React component with add/edit/delete location functionality
- Success Criteria:
  - Unit tests for CRUD operations pass (80%+ coverage)
  - Component renders without errors in Storybook
  - API calls use SWR mutation with optimistic updates
  - Error states display user-friendly messages

**Milestone 3.2: LocationsDisplaySection Component**
- Deliverable: Public-facing location display with map and list
- Success Criteria:
  - Component renders all vendor locations on map
  - Tier filtering works (tier 2+ shows all, tier 0/1 shows HQ only)
  - Map markers clickable and show location details
  - Responsive design works on mobile, tablet, desktop

**Milestone 4.3: Location-Based Search Frontend**
- Deliverable: Search UI with location filter and map results
- Success Criteria:
  - Users can enter location or use current location
  - Search returns vendors within specified radius
  - Results displayed on map with distance sorting
  - E2E test for complete search workflow passes

### Risk Mitigation Strategies

**Risk: Migration script fails with large dataset**
- Mitigation: Test migration on staging database first, implement rollback function, run migration in batches
- Contingency: Keep old `location` field temporarily, dual-write during transition period

**Risk: Geocoding API rate limits exceeded**
- Mitigation: Implement client-side caching (24-hour expiry), debounce API calls (500ms), upgrade to paid tier if needed
- Contingency: Allow manual lat/long entry, show clear error message when rate limited

**Risk: Map component performance issues with many vendors**
- Mitigation: Implement marker clustering for dense areas, limit search results to 100 vendors, lazy load map tiles
- Contingency: Fallback to list-only view if map fails to load, provide "Load Map" button for opt-in

**Risk: Tier restrictions bypassed on frontend**
- Mitigation: Enforce all tier checks on backend, never trust client-side tier gates, log suspicious activity
- Contingency: Audit vendor locations periodically, automated cleanup script to remove invalid locations

## Development Workflow

### Setup and Environment Configuration

**Prerequisites:**
- Node.js 22 LTS installed
- pnpm package manager installed
- Payload CMS SQLite database file at `./data/payload.db`
- Geocode.maps.co API access (no auth required for free tier)

**Environment Variables:**
```bash
# .env.local
DATABASE_URL=file:./data/payload.db
PAYLOAD_SECRET=your-secret-key-here-minimum-32-characters
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ENABLE_MULTI_LOCATIONS=true  # Feature flag
GEOCODING_API_URL=https://geocode.maps.co/search
```

**Development Setup:**
```bash
# Clone repository
git clone <repo-url>
cd ptnextjs

# Install dependencies
pnpm install

# Add new dependencies for multi-location feature
pnpm add react-leaflet leaflet
pnpm add -D @types/leaflet

# Run database migrations
pnpm run payload:migrate

# Start development server
pnpm run dev
```

**Testing Setup:**
```bash
# Run unit tests
pnpm run test

# Run E2E tests
pnpm run test:e2e

# Run tests in watch mode during development
pnpm run test:watch
```

### Coding Standards and Conventions

**TypeScript:**
- All new files must be TypeScript (.ts, .tsx)
- No `any` types allowed (use `unknown` and type guards if needed)
- Define interfaces for all props and state
- Use Zod for runtime validation

**React Components:**
- Functional components only (no class components)
- Use hooks for state management (useState, useSWR, etc.)
- Separate presentational and container components
- Co-locate component tests with component files

**File Naming:**
- Components: PascalCase (LocationsManagerCard.tsx)
- Utilities: camelCase (geocodeAddress.ts)
- Tests: *.test.tsx or *.spec.ts

**Import Order:**
1. React and Next.js imports
2. Third-party library imports
3. Absolute imports from @/ aliases
4. Relative imports
5. CSS/style imports

**Example:**
```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { VendorLocation } from './types';
import { geocodeAddress } from './utils';

import './LocationFormFields.css';
```

### Testing and Validation Procedures

**Unit Testing (Jest + React Testing Library):**
```bash
# Test LocationFormFields validation
npm run test LocationFormFields.test.tsx

# Test LocationsManagerCard CRUD operations
npm run test LocationsManagerCard.test.tsx

# Test tier restriction logic
npm run test TierService.test.ts
```

**Integration Testing:**
```bash
# Test API endpoints with test database
npm run test:integration

# Tests include:
# - PATCH /api/vendors/:id with valid/invalid locations
# - GET /api/vendors/search with tier filtering
# - Migration script execution
```

**E2E Testing (Playwright):**
```bash
# Run full E2E test suite
npm run test:e2e

# Test specific workflow
npx playwright test multi-location-workflow.spec.ts

# Tests include:
# - Tier 2 vendor adds additional location
# - Free vendor sees tier upgrade prompt
# - Public user searches by location, sees tier-appropriate results
```

**Manual Testing Checklist:**
- [ ] Tier 2 vendor can add up to 10 locations
- [ ] Only one location can be marked as HQ
- [ ] Geocoding button populates lat/long correctly
- [ ] Free vendor sees locked feature with upgrade prompt
- [ ] Public profile shows HQ for all tiers
- [ ] Public profile shows additional locations for tier 2+ only
- [ ] Location search includes HQ for all vendors
- [ ] Location search includes additional locations for tier 2+ only
- [ ] Map displays all markers correctly
- [ ] Mobile responsive layout works on iPhone and Android
- [ ] Form validation prevents invalid coordinates
- [ ] Error messages are user-friendly
- [ ] Loading states display during API calls

## Quality Assurance

### Code Review Guidelines

**Required Reviewers:** 1 approval from senior developer or tech lead

**Review Checklist:**
- [ ] Code follows TypeScript and React best practices
- [ ] All functions have JSDoc comments
- [ ] Error handling implemented for all API calls
- [ ] Loading and error states handled in UI
- [ ] Accessibility: keyboard navigation works, screen reader tested
- [ ] Mobile responsive design verified in DevTools
- [ ] Unit tests cover happy path and error cases (80%+ coverage)
- [ ] No console.log or debugging code left in
- [ ] Environment variables used for external API URLs
- [ ] Tier restrictions enforced on backend, not just frontend

**Performance Review:**
- [ ] No unnecessary re-renders (verified with React DevTools Profiler)
- [ ] API calls debounced or throttled where appropriate
- [ ] Images optimized with Next.js Image component
- [ ] Map component lazy loaded to reduce initial bundle size

**Security Review:**
- [ ] All user inputs validated and sanitized
- [ ] SQL injection prevented via Payload CMS ORM
- [ ] XSS prevented via React's auto-escaping
- [ ] No sensitive data (API keys, secrets) in frontend code
- [ ] HTTPS enforced for all API calls

### Testing Requirements

**Unit Test Coverage Target:** 80%+ for new code

**Required Unit Tests:**
- LocationFormFields component: validation logic, onChange events
- LocationsManagerCard component: CRUD operations, state management
- GeocodingButton component: API call mocking, error handling
- TierService: tier restriction checks, feature gate logic
- LocationService: HQ uniqueness validation, distance calculation

**Required Integration Tests:**
- Payload CMS API: vendor update with locations array
- Payload CMS hooks: validation hooks prevent invalid data
- Migration script: location → locations[] conversion

**Required E2E Tests:**
- Tier 2 vendor adds location workflow (login → navigate to profile → add location → save → verify on public profile)
- Free vendor upgrade prompt workflow (login → navigate to profile → see locked feature → click upgrade)
- Location-based search workflow (search by location → see results on map → click marker → view vendor profile)

**Test Data Requirements:**
- Seed database with 10 vendors across all tiers (3 free, 3 tier1, 4 tier2)
- Tier 2 vendors have 1-5 locations each
- Locations distributed geographically (US, Europe, Asia)

### Documentation Standards

**Code Documentation (JSDoc):**
```typescript
/**
 * Geocodes an address string to latitude/longitude coordinates.
 *
 * @param address - Full address string (e.g., "123 Main St, New York, NY 10001")
 * @returns Promise resolving to { lat: number, lng: number } or null if geocoding fails
 * @throws Error if API rate limit exceeded
 *
 * @example
 * const coords = await geocodeAddress("123 Harbor Dr, Fort Lauderdale, FL");
 * // Returns: { lat: 26.122439, lng: -80.137314 }
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  // Implementation...
}
```

**Component Documentation (Props Interface + Comment):**
```typescript
/**
 * Manages vendor location CRUD operations with tier-based access control.
 * Displays location form fields for tier 2+ vendors, upgrade prompt for tier 0/1.
 *
 * @component
 * @example
 * <LocationsManagerCard vendor={vendor} onUpdate={handleUpdate} />
 */
interface LocationsManagerCardProps {
  /** Vendor object including tier and current locations */
  vendor: Vendor;
  /** Callback when vendor profile updated successfully */
  onUpdate: (updatedVendor: Vendor) => void;
}
```

**API Documentation (OpenAPI/JSDoc):**
```typescript
/**
 * @route PATCH /api/vendors/:id
 * @description Update vendor profile including locations array
 * @access Private (vendor owner or admin)
 *
 * @param {string} req.params.id - Vendor ID
 * @param {VendorLocation[]} req.body.locations - Array of office locations
 *
 * @returns {Vendor} Updated vendor object
 *
 * @throws {400} Validation error (multiple HQs, tier restriction)
 * @throws {401} Unauthorized (not logged in)
 * @throws {403} Forbidden (not vendor owner or admin)
 */
```

**README Updates:**
- Add "Multi-Location Support" section to main README.md
- Document new environment variables (ENABLE_MULTI_LOCATIONS, GEOCODING_API_URL)
- Update "Features" list to include tier-based location management

**Changelog:**
- Add entry to CHANGELOG.md:
  ```markdown
  ## [1.5.0] - 2025-10-22
  ### Added
  - Multi-location support for Tier 2+ vendors
  - Dashboard UI for managing multiple office locations
  - Location-based search with tier filtering
  - Interactive map display on vendor profiles
  - Geocoding integration with geocode.maps.co API

  ### Changed
  - Vendors collection schema: replaced `location` group field with `locations` array
  - Vendor public profiles now show all locations for tier 2+ vendors

  ### Migration
  - Run `pnpm run payload:migrate` to convert existing location data to locations array
  ```
