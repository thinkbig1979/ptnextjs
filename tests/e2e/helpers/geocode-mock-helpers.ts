/**
 * Geocoding Mock Helpers for E2E Tests
 *
 * Provides Playwright route interception for Photon geocoding API calls.
 * This ensures tests don't hit the real Photon API (which is rate-limited)
 * while still allowing verification that geocoding works correctly.
 *
 * Usage:
 *   const geocodeMock = new GeocodeMock(page);
 *   await geocodeMock.setup();
 *   // ... perform actions that trigger geocoding ...
 *   const requests = geocodeMock.getRequests();
 *   expect(requests).toHaveLength(1);
 *   await geocodeMock.teardown();
 */

import { Page, Route } from '@playwright/test';

/**
 * Photon API response format
 */
export interface PhotonFeature {
  type: 'Feature';
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
    type: 'Point';
  };
  properties: {
    osm_id?: number;
    osm_type?: string;
    osm_key?: string;
    osm_value?: string;
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    postcode?: string;
    street?: string;
    housenumber?: string;
    type?: string;
  };
}

export interface PhotonResponse {
  type: 'FeatureCollection';
  features: PhotonFeature[];
}

/**
 * Captured geocode request data
 */
export interface CapturedGeocodeRequest {
  id: string;
  query: string;
  limit?: number;
  lang?: string;
  timestamp: Date;
  response: PhotonResponse;
}

/**
 * Mock configuration options
 */
export interface GeocodeMockOptions {
  /** Whether to log captured requests to console */
  verbose?: boolean;
  /** Custom response delay in ms (simulates network latency) */
  responseDelay?: number;
  /** Whether to simulate failures (for error handling tests) */
  simulateFailure?: boolean;
  /** HTTP status code when simulating failure */
  failureStatus?: number;
  /** Custom error message when simulating failure */
  failureMessage?: string;
  /** Whether to return empty results for unknown queries */
  returnEmptyForUnknown?: boolean;
}

/**
 * Mock data for common location searches
 */
const MOCK_LOCATIONS: Record<string, PhotonFeature[]> = {
  monaco: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [7.4246, 43.7384],
        type: 'Point',
      },
      properties: {
        osm_id: 36990,
        osm_type: 'R',
        name: 'Monaco',
        country: 'Monaco',
        countrycode: 'MC',
        type: 'city',
      },
    },
    {
      type: 'Feature',
      geometry: {
        coordinates: [7.4167, 43.7333],
        type: 'Point',
      },
      properties: {
        osm_id: 36991,
        osm_type: 'R',
        name: 'Monte Carlo',
        city: 'Monaco',
        country: 'Monaco',
        countrycode: 'MC',
        type: 'suburb',
      },
    },
  ],
  paris: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [2.3522, 48.8566],
        type: 'Point',
      },
      properties: {
        osm_id: 7444,
        osm_type: 'R',
        name: 'Paris',
        state: 'Île-de-France',
        country: 'France',
        countrycode: 'FR',
        type: 'city',
      },
    },
    {
      type: 'Feature',
      geometry: {
        coordinates: [2.3488, 48.8534],
        type: 'Point',
      },
      properties: {
        osm_id: 7445,
        osm_type: 'N',
        name: 'Paris Centre',
        city: 'Paris',
        state: 'Île-de-France',
        country: 'France',
        countrycode: 'FR',
        type: 'district',
      },
    },
  ],
  london: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [-0.1278, 51.5074],
        type: 'Point',
      },
      properties: {
        osm_id: 65606,
        osm_type: 'R',
        name: 'London',
        state: 'England',
        country: 'United Kingdom',
        countrycode: 'GB',
        type: 'city',
      },
    },
  ],
  amsterdam: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [4.9041, 52.3676],
        type: 'Point',
      },
      properties: {
        osm_id: 271110,
        osm_type: 'R',
        name: 'Amsterdam',
        state: 'North Holland',
        country: 'Netherlands',
        countrycode: 'NL',
        type: 'city',
      },
    },
  ],
  nantes: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [-1.5536, 47.2184],
        type: 'Point',
      },
      properties: {
        osm_id: 59874,
        osm_type: 'R',
        name: 'Nantes',
        state: 'Pays de la Loire',
        country: 'France',
        countrycode: 'FR',
        type: 'city',
      },
    },
  ],
  antibes: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [7.1256, 43.5808],
        type: 'Point',
      },
      properties: {
        osm_id: 76910,
        osm_type: 'R',
        name: 'Antibes',
        state: "Provence-Alpes-Côte d'Azur",
        country: 'France',
        countrycode: 'FR',
        type: 'city',
      },
    },
  ],
  nice: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [7.2620, 43.7102],
        type: 'Point',
      },
      properties: {
        osm_id: 76927,
        osm_type: 'R',
        name: 'Nice',
        state: "Provence-Alpes-Côte d'Azur",
        country: 'France',
        countrycode: 'FR',
        type: 'city',
      },
    },
  ],
  cannes: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [7.0128, 43.5528],
        type: 'Point',
      },
      properties: {
        osm_id: 76895,
        osm_type: 'R',
        name: 'Cannes',
        state: "Provence-Alpes-Côte d'Azur",
        country: 'France',
        countrycode: 'FR',
        type: 'city',
      },
    },
  ],
  marseille: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [5.3698, 43.2965],
        type: 'Point',
      },
      properties: {
        osm_id: 76503,
        osm_type: 'R',
        name: 'Marseille',
        state: "Provence-Alpes-Côte d'Azur",
        country: 'France',
        countrycode: 'FR',
        type: 'city',
      },
    },
  ],
  barcelona: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [2.1734, 41.3851],
        type: 'Point',
      },
      properties: {
        osm_id: 347950,
        osm_type: 'R',
        name: 'Barcelona',
        state: 'Catalonia',
        country: 'Spain',
        countrycode: 'ES',
        type: 'city',
      },
    },
  ],
  'fort lauderdale': [
    {
      type: 'Feature',
      geometry: {
        coordinates: [-80.1373, 26.1224],
        type: 'Point',
      },
      properties: {
        osm_id: 113673,
        osm_type: 'R',
        name: 'Fort Lauderdale',
        state: 'Florida',
        country: 'United States',
        countrycode: 'US',
        type: 'city',
      },
    },
  ],
  miami: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [-80.1918, 25.7617],
        type: 'Point',
      },
      properties: {
        osm_id: 113671,
        osm_type: 'R',
        name: 'Miami',
        state: 'Florida',
        country: 'United States',
        countrycode: 'US',
        type: 'city',
      },
    },
  ],
  palma: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [2.6502, 39.5696],
        type: 'Point',
      },
      properties: {
        osm_id: 341321,
        osm_type: 'R',
        name: 'Palma de Mallorca',
        state: 'Balearic Islands',
        country: 'Spain',
        countrycode: 'ES',
        type: 'city',
      },
    },
  ],
  rotterdam: [
    {
      type: 'Feature',
      geometry: {
        coordinates: [4.4777, 51.9244],
        type: 'Point',
      },
      properties: {
        osm_id: 324431,
        osm_type: 'R',
        name: 'Rotterdam',
        state: 'South Holland',
        country: 'Netherlands',
        countrycode: 'NL',
        type: 'city',
      },
    },
  ],
};

/**
 * GeocodeMock - Intercepts Photon API calls during E2E tests
 *
 * Captures all geocoding requests without hitting the real API,
 * allowing tests to run without rate limiting issues.
 */
export class GeocodeMock {
  private page: Page;
  private requests: CapturedGeocodeRequest[] = [];
  private options: GeocodeMockOptions;
  private isSetup = false;
  private requestCounter = 0;
  private customResponses: Map<string, PhotonFeature[]> = new Map();

  constructor(page: Page, options: GeocodeMockOptions = {}) {
    this.page = page;
    this.options = {
      verbose: false,
      responseDelay: 50, // Small delay to simulate network
      simulateFailure: false,
      failureStatus: 503,
      failureMessage: 'Service temporarily unavailable',
      returnEmptyForUnknown: false,
      ...options,
    };
  }

  /**
   * Set up route interception for Photon API
   * Must be called before navigating to pages that trigger geocoding
   */
  async setup(): Promise<void> {
    if (this.isSetup) {
      return;
    }

    // Only intercept external Photon API calls
    // The local /api/geocode route will call this, so mocking here is sufficient
    // Use a specific pattern to avoid intercepting other requests
    await this.page.route('https://photon.komoot.io/api*', async (route: Route) => {
      await this.handlePhotonRequest(route);
    });

    this.isSetup = true;

    if (this.options.verbose) {
      console.log('[GeocodeMock] Setup complete - intercepting Photon API calls');
    }
  }

  /**
   * Handle intercepted Photon API requests
   */
  private async handlePhotonRequest(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);
    const lang = url.searchParams.get('lang') || 'en';

    // Simulate delay if configured
    if (this.options.responseDelay && this.options.responseDelay > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.options.responseDelay)
      );
    }

    // Handle failure simulation
    if (this.options.simulateFailure) {
      await route.fulfill({
        status: this.options.failureStatus || 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: this.options.failureMessage,
        }),
      });
      return;
    }

    // Get mock response
    const features = this.getMockResponse(query, limit);
    const response: PhotonResponse = {
      type: 'FeatureCollection',
      features,
    };

    // Capture the request
    const captured: CapturedGeocodeRequest = {
      id: `mock-geocode-${++this.requestCounter}`,
      query,
      limit,
      lang,
      timestamp: new Date(),
      response,
    };
    this.requests.push(captured);

    if (this.options.verbose) {
      console.log('[GeocodeMock] Captured geocode request:', {
        query,
        resultsCount: features.length,
      });
    }

    // Return mock response
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  }

  /**
   * Handle local geocode API requests
   * These go through our Next.js API which then calls Photon
   * We intercept at this level to return mock data directly
   */
  private async handleLocalGeocodeRequest(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);

    // Simulate delay if configured
    if (this.options.responseDelay && this.options.responseDelay > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.options.responseDelay)
      );
    }

    // Handle failure simulation
    if (this.options.simulateFailure) {
      await route.fulfill({
        status: this.options.failureStatus || 503,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: this.options.failureMessage,
          code: 'SERVICE_UNAVAILABLE',
        }),
      });
      return;
    }

    // Get mock response
    const features = this.getMockResponse(query, limit);

    // Capture the request
    const captured: CapturedGeocodeRequest = {
      id: `mock-geocode-${++this.requestCounter}`,
      query,
      limit,
      timestamp: new Date(),
      response: { type: 'FeatureCollection', features },
    };
    this.requests.push(captured);

    if (this.options.verbose) {
      console.log('[GeocodeMock] Captured local geocode request:', {
        query,
        resultsCount: features.length,
      });
    }

    // Return mock response in our API format
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        results: features,
      }),
    });
  }

  /**
   * Get mock response for a query
   */
  private getMockResponse(query: string, limit: number): PhotonFeature[] {
    const normalizedQuery = query.toLowerCase().trim();

    // Check custom responses first
    if (this.customResponses.has(normalizedQuery)) {
      return this.customResponses.get(normalizedQuery)!.slice(0, limit);
    }

    // Check built-in mock locations
    for (const [key, features] of Object.entries(MOCK_LOCATIONS)) {
      if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
        return features.slice(0, limit);
      }
    }

    // Return empty or generic response for unknown queries
    if (this.options.returnEmptyForUnknown) {
      return [];
    }

    // Return a generic response based on the query
    return [
      {
        type: 'Feature',
        geometry: {
          coordinates: [0, 0],
          type: 'Point',
        },
        properties: {
          name: query,
          country: 'Unknown',
          type: 'locality',
        },
      },
    ];
  }

  /**
   * Add a custom mock response for a specific query
   */
  addMockResponse(query: string, features: PhotonFeature[]): void {
    this.customResponses.set(query.toLowerCase().trim(), features);
  }

  /**
   * Get all captured requests
   */
  getRequests(): CapturedGeocodeRequest[] {
    return [...this.requests];
  }

  /**
   * Get request count
   */
  getRequestCount(): number {
    return this.requests.length;
  }

  /**
   * Get the most recent request
   */
  getLastRequest(): CapturedGeocodeRequest | undefined {
    return this.requests[this.requests.length - 1];
  }

  /**
   * Clear all captured requests
   */
  clear(): void {
    this.requests = [];
    this.requestCounter = 0;
    if (this.options.verbose) {
      console.log('[GeocodeMock] Cleared captured requests');
    }
  }

  /**
   * Wait for a specific number of requests to be captured
   */
  async waitForRequests(
    count: number,
    timeout: number = 5000
  ): Promise<CapturedGeocodeRequest[]> {
    const startTime = Date.now();

    while (this.requests.length < count) {
      if (Date.now() - startTime > timeout) {
        throw new Error(
          `Timeout waiting for ${count} geocode requests. Only received ${this.requests.length}.`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return this.getRequests();
  }

  /**
   * Configure failure simulation (for error handling tests)
   */
  setSimulateFailure(
    simulate: boolean,
    status: number = 503,
    message: string = 'Service temporarily unavailable'
  ): void {
    this.options.simulateFailure = simulate;
    this.options.failureStatus = status;
    this.options.failureMessage = message;
  }

  /**
   * Clean up route interception
   */
  async teardown(): Promise<void> {
    this.requests = [];
    this.customResponses.clear();
    this.isSetup = false;

    if (this.options.verbose) {
      console.log('[GeocodeMock] Teardown complete');
    }
  }
}

/**
 * Convenience function to create and setup a geocode mock
 */
export async function setupGeocodeMock(
  page: Page,
  options?: GeocodeMockOptions
): Promise<GeocodeMock> {
  const mock = new GeocodeMock(page, options);
  await mock.setup();
  return mock;
}

/**
 * Test fixture helper for consistent geocode mock setup/teardown
 */
export function createGeocodeMockFixture(options?: GeocodeMockOptions) {
  return async (
    { page }: { page: Page },
    use: (mock: GeocodeMock) => Promise<void>
  ) => {
    const mock = new GeocodeMock(page, options);
    await mock.setup();
    await use(mock);
    await mock.teardown();
  };
}

/**
 * Pre-configured mock locations available for testing
 */
export const AVAILABLE_MOCK_LOCATIONS = Object.keys(MOCK_LOCATIONS);

/**
 * Helper to create a custom PhotonFeature for testing
 */
export function createMockLocation(
  name: string,
  longitude: number,
  latitude: number,
  options: Partial<PhotonFeature['properties']> = {}
): PhotonFeature {
  return {
    type: 'Feature',
    geometry: {
      coordinates: [longitude, latitude],
      type: 'Point',
    },
    properties: {
      name,
      type: 'locality',
      ...options,
    },
  };
}
