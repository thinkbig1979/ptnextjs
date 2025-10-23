# Spec Requirements Document

> Spec: Location Name-Based Search
> Created: 2025-10-22

## Overview

Replace the current latitude/longitude coordinate-based location search with a user-friendly location name search using the Photon geocoding API. This feature will allow users to search for vendors by entering city or town names instead of manually finding and entering coordinates, significantly improving the user experience and reducing friction in the location search workflow.

## User Stories

### Simplified Location Search

As a website visitor looking for nearby vendors, I want to search by entering my city name instead of coordinates, so that I can quickly find relevant vendors without needing to look up my exact latitude and longitude.

**Workflow**: User navigates to the vendors page, sees the location search card, types their city name (e.g., "Monaco", "Miami"), clicks the search button, and the system geocodes the location using the Photon API and displays nearby vendors sorted by distance.

**Problem Solved**: Eliminates the technical barrier of requiring users to know how to find and enter geographic coordinates, making the location search feature accessible to all users regardless of technical knowledge.

### Accurate Location Selection

As a user searching for vendors in a common city name (e.g., "Paris"), I want to select the correct location from multiple results, so that I find vendors near my intended location (Paris, France vs. Paris, Texas).

**Workflow**: User enters "Paris" in the search field, clicks search, and sees a dropdown or modal displaying "Paris, Île-de-France, France" and "Paris, Texas, United States" with country/region context. User clicks their intended location, and the system applies that location's coordinates to filter vendors.

**Problem Solved**: Prevents incorrect search results caused by ambiguous location names and ensures users can precisely select their intended search location from multiple matches.

### Expanded Location Search Options

As a user, I want to search by various location types including cities, regions, postal codes, and landmarks, so that I have flexibility in how I define my search area.

**Workflow**: User can enter "California" (region), "90210" (postal code), "Miami Beach" (landmark), or "Los Angeles" (city), and the system returns relevant geocoding results for any of these location types, allowing broad or specific location-based searches.

**Problem Solved**: Provides search flexibility for different use cases - users who want broad regional searches, specific neighborhood/landmark searches, or precise postal code searches can all use the same interface.

## Spec Scope

1. **Photon API Integration** - Integrate Photon forward geocoding API (https://photon.komoot.io/) for converting location names to coordinates
2. **Location Name Input Field** - Replace the coordinate input field with a text input accepting city/town names and other location types
3. **Search Result Selection UI** - Implement dropdown or modal UI to display multiple geocoding results with context (city, region, country) for user selection
4. **Multi-Type Location Support** - Support cities, towns, regions/states, landmarks, and postal codes in location search queries
5. **Coordinate Fallback Option** - Maintain optional advanced coordinate input method for users who prefer exact coordinate entry

## Out of Scope

- Real-time geocoding suggestions (autocomplete) while user types - search is triggered only on button click to minimize API usage
- Map visualization of search results showing vendor locations on an interactive map
- Geolocation browser API integration to automatically detect user's current location
- Address-based search (full street addresses) - only location names, regions, and postal codes
- Historical search or saved location preferences across sessions

## Expected Deliverable

1. **Functional Location Name Search**: Users can enter a city/town name in the search field, click "Search", and see vendors filtered by proximity to that location with accurate distance calculations
2. **Ambiguous Location Resolution**: When multiple locations match the search query (e.g., "Springfield"), users are presented with a selection UI showing each option with country/region context, and can select the correct location before applying the search
3. **Browser-Testable Search Workflow**: E2E tests demonstrate the complete workflow - entering "Monaco", selecting from results (if multiple), viewing filtered vendor list sorted by distance, and resetting the search to return to unfiltered view
