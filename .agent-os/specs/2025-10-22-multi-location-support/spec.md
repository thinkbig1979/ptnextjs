# Spec Requirements Document

> Spec: Multi-Location Support for Vendors
> Created: 2025-10-22
> Updated: 2025-10-23 (Coordinated with location-name-search feature)

## Overview

Implement multi-location support for vendor profiles, allowing companies with multiple offices to display all their locations. The primary headquarters (HQ) address will remain visible in the basic profile for all tiers, while additional locations are a Tier 2+ feature accessible only through the vendor dashboard, with tier-gated visibility in location-based search results.

**Feature Coordination**: This spec **builds on** and **extends** the location-name-search feature. It reuses the `/api/geocode` backend proxy (Photon API) for address geocoding and updates the `useLocationFilter` hook to support multiple locations per vendor with tier-based filtering.

## User Stories

### Vendor with Multiple Offices

As a marine technology vendor with offices in multiple yacht industry hubs, I want to add and manage multiple office locations to my profile, so that potential clients searching for suppliers in their geographic region can discover all my locations and contact the nearest office.

**Workflow:**
- Vendor logs into dashboard and navigates to company profile
- If tier is Tier 2 or higher, they see an "Additional Locations" section
- They can add multiple office addresses with full details (address, coordinates, city, country)
- One location is designated as "HQ" and displays in the basic public profile
- Additional locations are visible on the vendor profile page for tier 2+ vendors
- Location-based search includes all locations for tier 2+ vendors

### Yacht Industry Professional Searching by Location

As a yacht captain looking for navigation equipment suppliers in the Mediterranean, I want to search vendors by location and see all offices they have in my region, so that I can work with suppliers who have local presence and support.

**Workflow:**
- User performs location-based search in Mediterranean region
- Search results include:
  - All vendors' HQ addresses (all tiers)
  - Additional office locations only for Tier 2+ vendors
- Each location shows as a separate map marker
- Clicking a marker shows vendor details with which office location matched
- User can filter by distance from specific coordinates

### Free/Tier 1 Vendor Viewing Feature Limitations

As a free or Tier 1 vendor, I want to see what additional features are available with a higher subscription tier, so that I understand the value of upgrading when my business is ready to expand.

**Workflow:**
- Free/Tier 1 vendor sees their single HQ address in profile editor
- They see a locked "Additional Locations (Tier 2+)" section with upgrade prompt
- Section shows brief description of multi-location benefits
- "Upgrade to Tier 2" call-to-action button links to subscription management

## Spec Scope

1. **CMS Schema Extension** - Modify Payload CMS Vendors collection to support array of location objects with HQ designation
2. **Dashboard UI for Location Management** - Build interface for tier 2+ vendors to add/edit/remove multiple office locations with geocoding
3. **Public Profile Display** - Display HQ address in basic profile card, and all locations (for tier 2+) on full vendor profile page
4. **Location-Based Search Enhancement** - Extend search to query multiple vendor locations with tier-based filtering
5. **Tier-Gated Access Control** - Implement field-level access restrictions in Payload CMS and UI conditional rendering based on subscription tier

## Out of Scope

- Historical tracking of location changes (audit log)
- Location-specific contact information (phone/email per office)
- Service area polygons or radius-based coverage visualization
- Office hours or appointment scheduling per location
- Migration wizard for bulk importing locations from external sources
- Analytics on which locations generate most profile views
- Location verification or address validation beyond geocoding

## Expected Deliverable

1. Vendor dashboard shows "Additional Locations" section for Tier 2+ vendors where they can add/edit/delete office addresses with automatic geocoding
2. Location-based search returns results including all HQ addresses (all tiers) plus additional locations for Tier 2+ vendors, with map markers for each location
3. Vendor public profile page displays HQ address prominently in company info section, and additional office locations (if tier 2+) in a separate "Our Locations" section with addresses and map
