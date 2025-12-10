/**
 * MSW API Handlers for Integration Tests
 *
 * Provides mock API endpoints for testing vendor location workflows
 */

import { http, HttpResponse } from 'msw';
import { mockVendorTier2 } from '../fixtures/vendor-data';

// Base URL for API endpoints
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const handlers = [
  // GET vendor by ID
  http.get(`${BASE_URL}/api/vendors/:id`, ({ params }) => {
    const { id } = params;

    if (id === mockVendorTier2.id) {
      return HttpResponse.json({
        success: true,
        data: mockVendorTier2,
      });
    }

    return HttpResponse.json(
      { success: false, error: 'Vendor not found' },
      { status: 404 }
    );
  }),

  // PATCH vendor (update locations)
  http.patch(`${BASE_URL}/api/vendors/:id`, async ({ request, params }) => {
    const { id } = params;
    const body = await request.json();

    return HttpResponse.json({
      success: true,
      data: {
        id,
        ...body,
      },
    });
  }),

  // POST geocode address
  http.post(`${BASE_URL}/api/geocode`, async ({ request }) => {
    const body = await request.json() as any;
    const { address, city, country } = body;

    // Return mock coordinates based on city
    const coordinates: Record<string, { lat: number; lng: number }> = {
      'Monaco': { lat: 43.7384, lng: 7.4246 },
      'Fort Lauderdale': { lat: 26.1224, lng: -80.1373 },
      'Nice': { lat: 43.7102, lng: 7.2620 },
      'Genoa': { lat: 44.4056, lng: 8.9463 },
    };

    const coords = coordinates[city] || { lat: 0, lng: 0 };

    return HttpResponse.json({
      success: true,
      data: coords,
    });
  }),

  // GET geocode (alternative endpoint)
  http.get(`${BASE_URL}/api/geocode`, ({ request }) => {
    const url = new URL(request.url);
    const city = url.searchParams.get('city');

    // Return mock coordinates based on city
    const coordinates: Record<string, { lat: number; lng: number }> = {
      'Monaco': { lat: 43.7384, lng: 7.4246 },
      'Fort Lauderdale': { lat: 26.1224, lng: -80.1373 },
      'Nice': { lat: 43.7102, lng: 7.2620 },
      'Genoa': { lat: 44.4056, lng: 8.9463 },
    };

    const coords = city ? coordinates[city] : null;

    if (coords) {
      return HttpResponse.json({
        success: true,
        ...coords,
      });
    }

    return HttpResponse.json(
      { success: false, error: 'Location not found' },
      { status: 404 }
    );
  }),
];

// Error handlers for testing error states
export const errorHandlers = [
  // Server error on vendor update
  http.patch(`${BASE_URL}/api/vendors/:id`, () => {
    return HttpResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }),

  // Geocoding API error
  http.post(`${BASE_URL}/api/geocode`, () => {
    return HttpResponse.json(
      { success: false, error: 'Geocoding service unavailable' },
      { status: 503 }
    );
  }),
];
