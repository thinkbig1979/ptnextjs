# Spec Requirements Document

> Spec: Location-Based Vendor Discovery
> Created: 2025-12-21
> Beads: ptnextjs-gu2g, ptnextjs-6pti

## Overview

Enhance the platform with smart vendor-product-location matching to help users discover relevant vendors based on geographic proximity and product interest. Two complementary features: contextual vendor suggestions on product pages and combined location+category search.

## User Stories

### Story 1: Product Browser Discovers Local Vendors

As a **yacht industry professional browsing products**, I want to **see vendors near my location who can supply this product**, so that **I can find local suppliers for installation, support, and faster delivery**.

**Workflow:**
1. User views a product detail page (e.g., "Garmin GPSMAP 8616")
2. Page shows "Vendors Near You" section in sidebar
3. Section displays 2-4 vendors within reasonable distance who sell this product category
4. Each vendor card shows: name, distance, city, tier badge
5. User clicks vendor card to view their full profile
6. If no location available, section shows "Set your location to find nearby vendors" with link to search page

### Story 2: User Searches for Local Category Vendors

As a **yacht owner or captain**, I want to **search for vendors near a specific location who sell a specific product category**, so that **I can find the right service providers for my yacht's current port**.

**Workflow:**
1. User navigates to enhanced vendor search page
2. User enters a location (e.g., "Monaco" or current position)
3. User selects a product category (e.g., "Navigation Systems")
4. Results show vendors matching both criteria, sorted by distance
5. Each result shows: vendor name, distance, products in category, tier badge
6. User can adjust radius slider to expand/narrow search

## Spec Scope

1. **Vendors Near You (Product Page)** - Contextual vendor suggestions on product detail pages based on user location and product category
2. **Product-Vendor Matching Search** - Enhanced vendor search combining location proximity with product category filtering
3. **Location Preference Storage** - Remember user's preferred location across sessions (localStorage)

## Out of Scope

- Service region polygons (vendors define coverage areas)
- Real-time inventory/availability checking
- Vendor booking or appointment scheduling
- Push notifications for new nearby vendors
- Mobile app geolocation (web browser only)

## Expected Deliverables

1. **VendorsNearYou component** - Sidebar section for product detail pages showing nearby vendors for the product's category
2. **Enhanced LocationSearchFilter** - Combined location + category filter on vendors page
3. **useNearbyVendorsByCategory hook** - Reusable hook combining location filtering with category matching
4. **Location preference persistence** - localStorage-based location memory with clear UI
5. **Empty/fallback states** - Graceful handling when no location or no nearby vendors
6. **Mobile responsive layout** - Both features work on all device sizes

## Acceptance Criteria

### Feature 1: Vendors Near You (Product Page)

| Criteria | Validation |
|----------|------------|
| Shows on product detail pages in sidebar | Visual inspection on `/products/[id]` |
| Displays max 4 vendors within 500km default radius | Filter logic verification |
| Only shows vendors selling products in same category | Query verification |
| Shows vendor name, city, distance, tier badge | Component inspection |
| Links to vendor detail page | Click test |
| Respects tier visibility (Tier 2+ show multiple locations) | Tier gating test |
| Shows "Set location" prompt when no user location | Empty state test |
| Loads without blocking page render | Performance check (lazy load) |

### Feature 2: Product-Vendor Matching Search

| Criteria | Validation |
|----------|------------|
| Category dropdown on vendors page filters by product category | Filter test |
| Combined with location filter narrows results | Combined filter test |
| Results show "X products in [category]" per vendor | Display verification |
| Distance sorting works with category filter | Sort order check |
| Clear filters button resets both filters | Reset test |
| URL params persist filter state | Refresh with params |
| Mobile layout stacks filters vertically | Responsive test |

### Feature 3: Location Preference

| Criteria | Validation |
|----------|------------|
| Remembers last searched location in localStorage | Storage inspection |
| Auto-populates location filter on return visit | Load test |
| "Clear saved location" option visible | UI check |
| Works across browser sessions | Close/reopen test |

## Technical Constraints

- Must use existing `useLocationFilter` hook as foundation
- Must use existing `LocationSearchFilter` component patterns
- Must integrate with `PayloadCMSDataService` caching (5-min TTL)
- Vendors page is statically generated - client-side filtering required
- Product-vendor relationships via `vendorId` field on products
- Category matching via product's `category` field

## Dependencies

- Existing: `lib/utils/location.ts` (Haversine distance calculation)
- Existing: `hooks/useLocationFilter.ts` (proximity filtering)
- Existing: `components/LocationSearchFilter.tsx` (location input UI)
- Existing: `lib/payload-cms-data-service.ts` (data access)
- Existing: Product detail page at `app/(site)/products/[id]/page.tsx`
- Existing: Vendors listing at `app/(site)/vendors/page.tsx`
