# Spec Requirements Document

> Spec: Vendor Location Mapping
> Created: 2025-10-19

## Overview

Add interactive maps to vendor detail pages showing their location, and implement location-based search functionality allowing users to find vendors near a specified location within a given radius. This simple initial implementation focuses on core functionality using Leaflet.js with OpenFreeMap tiles and geocode.maps.co for address geocoding, storing location data in the existing SQLite database.

## User Stories

### Vendor Location Display

As a yacht industry professional, I want to see a vendor's physical location on an interactive map when viewing their profile, so that I can quickly understand where they are based and assess proximity to my projects.

**Workflow**: User navigates to a vendor detail page → sees an interactive map showing the vendor's location marker → can zoom/pan the map to explore the area.

### Location-Based Vendor Search

As a yacht industry professional, I want to search for vendors near a specific location, so that I can find local suppliers or service providers for my yacht projects.

**Workflow**: User goes to vendors/partners listing page → enters a city or address in location search → selects a search radius (10, 25, 50, 100 miles) → sees filtered list of vendors within that radius, sorted by distance → can click on any vendor to view their full profile.

## Spec Scope

1. **Location Data Schema** - Add latitude, longitude, and formatted address fields to the Vendor schema in Payload CMS (SQLite database)
2. **Vendor Detail Page Map** - Display an interactive Mapbox map on each vendor page showing a single marker for that vendor's location
3. **Location Search Input** - Add location search field with autocomplete (geocoding) to vendor/partner listing pages
4. **Radius Filter** - Provide fixed radius options (10, 25, 50, 100 miles) for distance-based filtering
5. **Distance Calculation** - Calculate distances between search location and vendors using the Haversine formula, filter and sort results by proximity

## Out of Scope

- Showing multiple vendors on a single map view (future enhancement)
- Custom radius slider (keeping it simple with fixed options)
- Browser geolocation API (users type location instead)
- Click-on-map location selection (future enhancement)
- Real-time geocoding service integration (geocoding happens during vendor data entry)
- Advanced map features (clustering, heatmaps, etc.)

## Expected Deliverable

1. Vendor detail pages display an interactive map with the vendor's location marker (when location data exists)
2. Vendor and partner listing pages have a location search field where users can enter a city/address
3. Users can select a radius (10, 25, 50, 100 miles) and see vendors filtered and sorted by distance from the searched location
4. Distance from searched location is displayed for each vendor in the filtered results
