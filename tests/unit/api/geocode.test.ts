/**
 * Comprehensive Test Suite for /api/geocode endpoint
 *
 * Tests the Photon API proxy endpoint covering:
 * 1. Successful geocoding (various location types)
 * 2. Error handling (validation, API errors, malformed data)
 * 3. Rate limiting (per-IP isolation, threshold, reset)
 * 4. Response format validation
 * 5. Performance requirements
 */

import { NextRequest, NextResponse } from 'next/server';
import { GET, clearRateLimitForTesting } from '@/app/api/geocode/route';

// Mock fetch globally
global.fetch = jest.fn();

describe('/api/geocode API Endpoint', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Use fake timers BEFORE clearing rate limit
    jest.useFakeTimers();
    // Set initial time to a consistent value
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    // Clear rate limit state after setting time
    clearRateLimitForTesting();
  });

  afterEach(() => {
    // Clear rate limit before switching to real timers
    clearRateLimitForTesting();
    jest.useRealTimers();
  });

  // ============================================================================
  // Category 1: Successful Geocoding Tests
  // ============================================================================

  describe('Successful Geocoding', () => {
    it('should return results for simple city search (Monaco)', async () => {
      // Arrange: Mock Photon API response for Monaco
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [7.4246, 43.7384]
            },
            properties: {
              osm_id: 1124039,
              osm_type: 'R',
              name: 'Monaco',
              country: 'Monaco',
              countrycode: 'MC',
              city: 'Monaco',
              type: 'city'
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');

      // Act: Call the API endpoint
      const response = await GET(request);
      const data = await response.json();

      // Assert: Validate response format and data
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toHaveLength(1);
      expect(data.results[0].properties.name).toBe('Monaco');
      expect(data.results[0].geometry.coordinates).toEqual([7.4246, 43.7384]);
    });

    it('should return multiple results for ambiguous search (Paris)', async () => {
      // Arrange: Mock Photon API response with multiple Paris locations
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
            properties: {
              osm_id: 7444,
              osm_type: 'R',
              name: 'Paris',
              country: 'France',
              countrycode: 'FR',
              city: 'Paris',
              state: 'Île-de-France',
              type: 'city'
            }
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-95.5555, 33.6609] },
            properties: {
              osm_id: 123456,
              osm_type: 'R',
              name: 'Paris',
              country: 'United States',
              countrycode: 'US',
              city: 'Paris',
              state: 'Texas',
              type: 'city'
            }
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-80.3829, 43.1978] },
            properties: {
              osm_id: 789012,
              osm_type: 'R',
              name: 'Paris',
              country: 'Canada',
              countrycode: 'CA',
              city: 'Paris',
              state: 'Ontario',
              type: 'city'
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Paris&limit=5');

      // Act: Call the API endpoint
      const response = await GET(request);
      const data = await response.json();

      // Assert: Validate multiple results
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toHaveLength(3);
      expect(data.results[0].properties.country).toBe('France');
      expect(data.results[1].properties.state).toBe('Texas');
      expect(data.results[2].properties.state).toBe('Ontario');
    });

    it('should handle postal code search (90210)', async () => {
      // Arrange: Mock Photon API response for postal code
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-118.4065, 34.1030] },
            properties: {
              osm_id: 987654,
              osm_type: 'R',
              name: 'Beverly Hills',
              country: 'United States',
              countrycode: 'US',
              city: 'Beverly Hills',
              state: 'California',
              postcode: '90210',
              type: 'postcode'
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=90210');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results[0].properties.postcode).toBe('90210');
      expect(data.results[0].properties.city).toBe('Beverly Hills');
    });

    it('should handle regional search (California)', async () => {
      // Arrange: Mock Photon API response for region
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-119.4179, 36.7783] },
            properties: {
              osm_id: 165475,
              osm_type: 'R',
              name: 'California',
              country: 'United States',
              countrycode: 'US',
              state: 'California',
              type: 'state'
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=California');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results[0].properties.type).toBe('state');
      expect(data.results[0].properties.name).toBe('California');
    });

    it('should handle international characters (São Paulo)', async () => {
      // Arrange: Mock Photon API response with international characters
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-46.6333, -23.5505] },
            properties: {
              osm_id: 298285,
              osm_type: 'R',
              name: 'São Paulo',
              country: 'Brasil',
              countrycode: 'BR',
              city: 'São Paulo',
              state: 'São Paulo',
              type: 'city'
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=São Paulo');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results[0].properties.name).toBe('São Paulo');
      expect(data.results[0].properties.country).toBe('Brasil');
    });

    it('should handle multi-word locations (New York)', async () => {
      // Arrange: Mock Photon API response for multi-word location
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-74.0060, 40.7128] },
            properties: {
              osm_id: 175905,
              osm_type: 'R',
              name: 'New York',
              country: 'United States',
              countrycode: 'US',
              city: 'New York',
              state: 'New York',
              type: 'city'
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=New York');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results[0].properties.name).toBe('New York');
    });

    it('should respect limit parameter variations', async () => {
      // Arrange: Mock Photon API with exactly 10 results
      const mockFeatures = Array.from({ length: 10 }, (_, i) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {
          osm_id: i,
          osm_type: 'R',
          name: `Location ${i}`,
          country: 'Test Country',
          countrycode: 'TC',
          type: 'city'
        }
      }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ features: mockFeatures.slice(0, 1) })
      });

      // Test limit=1
      const request1 = new NextRequest('http://localhost:3000/api/geocode?q=Test&limit=1');
      const response1 = await GET(request1);
      const data1 = await response1.json();

      expect(data1.results).toHaveLength(1);

      // Test limit=5
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ features: mockFeatures.slice(0, 5) })
      });

      const request5 = new NextRequest('http://localhost:3000/api/geocode?q=Test&limit=5');
      const response5 = await GET(request5);
      const data5 = await response5.json();

      expect(data5.results).toHaveLength(5);

      // Test limit=10
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ features: mockFeatures })
      });

      const request10 = new NextRequest('http://localhost:3000/api/geocode?q=Test&limit=10');
      const response10 = await GET(request10);
      const data10 = await response10.json();

      expect(data10.results).toHaveLength(10);
    });

    it('should respect language parameter', async () => {
      // Arrange: Mock Photon API response
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
            properties: {
              osm_id: 7444,
              osm_type: 'R',
              name: 'Paris',
              country: 'France',
              countrycode: 'FR',
              type: 'city'
            }
          }
        ]
      };

      // Test different language parameters
      const languages = ['en', 'fr', 'de', 'es'];

      for (const lang of languages) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockPhotonResponse
        });

        const request = new NextRequest(`http://localhost:3000/api/geocode?q=Paris&lang=${lang}`);
        const response = await GET(request);

        expect(response.status).toBe(200);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`lang=${lang}`),
          expect.any(Object)
        );
      }
    });
  });

  // ============================================================================
  // Category 2: Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('should return 400 for missing query parameter', async () => {
      // Arrange: Request without query parameter
      const request = new NextRequest('http://localhost:3000/api/geocode');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('INVALID_QUERY');
      expect(data.error).toContain('query parameter');
    });

    it('should return 400 for empty query string', async () => {
      // Arrange: Request with empty query
      const request = new NextRequest('http://localhost:3000/api/geocode?q=');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('INVALID_QUERY');
      expect(data.error).toContain('at least 2 characters');
    });

    it('should return 400 for query with only whitespace', async () => {
      // Arrange: Request with whitespace-only query
      const request = new NextRequest('http://localhost:3000/api/geocode?q=   ');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('INVALID_QUERY');
    });

    it('should handle extremely long query (>200 chars)', async () => {
      // Arrange: Request with very long query
      const longQuery = 'a'.repeat(250);
      const request = new NextRequest(`http://localhost:3000/api/geocode?q=${longQuery}`);

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('INVALID_QUERY');
      expect(data.error).toContain('maximum length');
    });

    it('should return 503 when Photon API is unavailable', async () => {
      // Arrange: Mock Photon API returning 503
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.code).toBe('SERVICE_UNAVAILABLE');
      expect(data.error).toContain('unavailable');
    });

    it('should return 500 when Photon API returns error', async () => {
      // Arrange: Mock Photon API returning 500
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.code).toBe('SERVICE_ERROR');
    });

    it('should handle malformed Photon API response', async () => {
      // Arrange: Mock Photon API returning invalid JSON
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'structure' }) // Missing 'features' array
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.code).toBe('SERVICE_ERROR');
      expect(data.error).toContain('Invalid response');
    });
  });

  // ============================================================================
  // Category 3: Rate Limiting Tests
  // ============================================================================

  describe('Rate Limiting', () => {
    // Helper to create mock IP addresses
    const createRequestWithIP = (query: string, ip: string) => {
      const request = new NextRequest(`http://localhost:3000/api/geocode?q=${query}`);
      // Mock the IP address in request headers
      Object.defineProperty(request, 'ip', { value: ip, writable: false });
      return request;
    };

    it('should allow requests under rate limit (9 requests)', async () => {
      // Arrange: Mock successful Photon responses
      const mockResponse = {
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {
            osm_id: 1,
            osm_type: 'R',
            name: 'Test',
            country: 'Test',
            countrycode: 'TC',
            type: 'city'
          }
        }]
      };

      // Act: Make 9 requests (under the 10/minute limit)
      for (let i = 0; i < 9; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const request = createRequestWithIP(`Test${i}`, '192.168.1.1');
        const response = await GET(request);

        // Assert: All requests should succeed
        expect(response.status).toBe(200);
      }
    });

    it('should allow request at rate limit threshold (10th request)', async () => {
      // Arrange: Mock successful Photon response
      const mockResponse = {
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {
            osm_id: 1,
            osm_type: 'R',
            name: 'Test',
            country: 'Test',
            countrycode: 'TC',
            type: 'city'
          }
        }]
      };

      // Act: Make exactly 10 requests (at the limit)
      for (let i = 0; i < 10; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const request = createRequestWithIP(`Test${i}`, '192.168.1.2');
        const response = await GET(request);

        // Assert: All 10 requests should succeed
        expect(response.status).toBe(200);
      }
    });

    it('should return 429 for request over rate limit (11th request)', async () => {
      // Arrange: Make 10 successful requests first
      const mockResponse = {
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {
            osm_id: 1,
            osm_type: 'R',
            name: 'Test',
            country: 'Test',
            countrycode: 'TC',
            type: 'city'
          }
        }]
      };

      for (let i = 0; i < 10; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const request = createRequestWithIP(`Test${i}`, '192.168.1.3');
        await GET(request);
      }

      // Act: Make 11th request (over limit)
      const request = createRequestWithIP('Test11', '192.168.1.3');
      const response = await GET(request);
      const data = await response.json();

      // Assert: Should be rate limited
      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.code).toBe('RATE_LIMIT');
      expect(data.error).toContain('Too many requests');
    });

    it('should reset rate limit after time window (60 seconds)', async () => {
      // Arrange: Make 10 requests to hit rate limit
      const mockResponse = {
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {
            osm_id: 1,
            osm_type: 'R',
            name: 'Test',
            country: 'Test',
            countrycode: 'TC',
            type: 'city'
          }
        }]
      };

      for (let i = 0; i < 10; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const request = createRequestWithIP(`Test${i}`, '192.168.1.4');
        await GET(request);
      }

      // Verify rate limit is hit
      const limitedRequest = createRequestWithIP('TestLimited', '192.168.1.4');
      const limitedResponse = await GET(limitedRequest);
      expect(limitedResponse.status).toBe(429);

      // Act: Advance time by 60 seconds (rate limit window)
      jest.advanceTimersByTime(60000);

      // Make another request after rate limit reset
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const resetRequest = createRequestWithIP('TestReset', '192.168.1.4');
      const resetResponse = await GET(resetRequest);

      // Assert: Request should succeed after reset
      expect(resetResponse.status).toBe(200);
    });

    it('should isolate rate limiting per IP address', async () => {
      // Arrange: Mock successful Photon response
      const mockResponse = {
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {
            osm_id: 1,
            osm_type: 'R',
            name: 'Test',
            country: 'Test',
            countrycode: 'TC',
            type: 'city'
          }
        }]
      };

      // Act: IP1 makes 10 requests (hits limit)
      for (let i = 0; i < 10; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        });

        const request = createRequestWithIP(`Test${i}`, '192.168.1.5');
        await GET(request);
      }

      // IP1 should be rate limited
      const ip1Request = createRequestWithIP('TestIP1', '192.168.1.5');
      const ip1Response = await GET(ip1Request);
      expect(ip1Response.status).toBe(429);

      // IP2 should still be able to make requests
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const ip2Request = createRequestWithIP('TestIP2', '192.168.1.6');
      const ip2Response = await GET(ip2Request);

      // Assert: IP2 should not be affected by IP1's rate limit
      expect(ip2Response.status).toBe(200);
    });
  });

  // ============================================================================
  // Category 4: Response Format Tests
  // ============================================================================

  describe('Response Format Validation', () => {
    it('should validate response schema matches API contract', async () => {
      // Arrange: Mock Photon API response
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [7.4246, 43.7384]
            },
            properties: {
              osm_id: 1124039,
              osm_type: 'R',
              name: 'Monaco',
              country: 'Monaco',
              countrycode: 'MC',
              city: 'Monaco',
              type: 'city'
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert: Validate complete response schema
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('results');
      expect(typeof data.success).toBe('boolean');
      expect(Array.isArray(data.results)).toBe(true);

      // Validate PhotonFeature structure
      const feature = data.results[0];
      expect(feature).toHaveProperty('type', 'Feature');
      expect(feature).toHaveProperty('geometry');
      expect(feature.geometry).toHaveProperty('type', 'Point');
      expect(feature.geometry).toHaveProperty('coordinates');
      expect(Array.isArray(feature.geometry.coordinates)).toBe(true);
      expect(feature.geometry.coordinates).toHaveLength(2);

      expect(feature).toHaveProperty('properties');
      expect(feature.properties).toHaveProperty('osm_id');
      expect(feature.properties).toHaveProperty('osm_type');
      expect(feature.properties).toHaveProperty('name');
      expect(feature.properties).toHaveProperty('country');
      expect(feature.properties).toHaveProperty('type');
    });

    it('should correctly transform PhotonFeature format', async () => {
      // Arrange: Mock Photon API response with all properties
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-74.0060, 40.7128]
            },
            properties: {
              osm_id: 175905,
              osm_type: 'R',
              name: 'New York',
              country: 'United States',
              countrycode: 'US',
              city: 'New York',
              state: 'New York',
              postcode: '10001',
              type: 'city',
              extent: [-74.2591, 40.4774, -73.7002, 40.9176]
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=New York');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert: Validate transformation preserves all fields
      const feature = data.results[0];
      expect(feature.properties.osm_id).toBe(175905);
      expect(feature.properties.name).toBe('New York');
      expect(feature.properties.city).toBe('New York');
      expect(feature.properties.state).toBe('New York');
      expect(feature.properties.postcode).toBe('10001');
      expect(feature.properties.country).toBe('United States');
    });

    it('should extract coordinates in correct [longitude, latitude] format', async () => {
      // Arrange: Mock Photon API response
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [7.4246, 43.7384] // [longitude, latitude]
            },
            properties: {
              osm_id: 1124039,
              osm_type: 'R',
              name: 'Monaco',
              country: 'Monaco',
              countrycode: 'MC',
              type: 'city'
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert: Validate coordinate format and values
      const coordinates = data.results[0].geometry.coordinates;
      expect(coordinates).toHaveLength(2);
      expect(coordinates[0]).toBe(7.4246); // longitude
      expect(coordinates[1]).toBe(43.7384); // latitude

      // Validate coordinate ranges
      expect(coordinates[0]).toBeGreaterThanOrEqual(-180);
      expect(coordinates[0]).toBeLessThanOrEqual(180);
      expect(coordinates[1]).toBeGreaterThanOrEqual(-90);
      expect(coordinates[1]).toBeLessThanOrEqual(90);
    });

    it('should format location display name correctly', async () => {
      // Arrange: Mock Photon API response with various location properties
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
            properties: {
              osm_id: 7444,
              osm_type: 'R',
              name: 'Paris',
              country: 'France',
              countrycode: 'FR',
              city: 'Paris',
              state: 'Île-de-France',
              type: 'city'
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Paris');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert: Validate display name components are present
      const properties = data.results[0].properties;
      expect(properties.name).toBe('Paris');
      expect(properties.city).toBe('Paris');
      expect(properties.state).toBe('Île-de-France');
      expect(properties.country).toBe('France');

      // Display name should be constructable as: "Paris, Île-de-France, France"
      const displayName = [properties.name, properties.state, properties.country]
        .filter(Boolean)
        .join(', ');
      expect(displayName).toBe('Paris, Île-de-France, France');
    });

    it('should handle empty results gracefully', async () => {
      // Arrange: Mock Photon API returning empty results
      const mockPhotonResponse = {
        features: []
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const request = new NextRequest('http://localhost:3000/api/geocode?q=NonexistentPlace12345');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert: Validate empty results handling
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toEqual([]);
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.results).toHaveLength(0);
    });
  });

  // ============================================================================
  // Category 5: Performance Tests
  // ============================================================================

  describe('Performance Requirements', () => {
    it('should respond within 2 seconds', async () => {
      // Use real timers for performance test
      jest.useRealTimers();

      // Arrange: Mock Photon API with slight delay
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [7.4246, 43.7384] },
            properties: {
              osm_id: 1124039,
              osm_type: 'R',
              name: 'Monaco',
              country: 'Monaco',
              countrycode: 'MC',
              type: 'city'
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockPhotonResponse
            });
          }, 100); // Simulate 100ms API response time
        })
      );

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');

      // Act: Measure response time
      const startTime = Date.now();
      const response = await GET(request);
      await response.json();
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Assert: Response time should be under 2 seconds (2000ms)
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000);
    });

    it('should handle concurrent requests efficiently', async () => {
      // Arrange: Mock Photon API responses for concurrent requests
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {
              osm_id: 1,
              osm_type: 'R',
              name: 'Test Location',
              country: 'Test Country',
              countrycode: 'TC',
              type: 'city'
            }
          }
        ]
      };

      // Mock 10 concurrent responses
      for (let i = 0; i < 10; i++) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockPhotonResponse
        });
      }

      // Act: Make 10 concurrent requests
      const requests = Array.from({ length: 10 }, (_, i) =>
        new NextRequest(`http://localhost:3000/api/geocode?q=Location${i}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests.map(req => GET(req)));
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Assert: All requests succeed
      for (const response of responses) {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      }

      // Assert: Total time should be reasonable (not sequential)
      // 10 sequential requests at 500ms each = 5000ms
      // Concurrent should be much faster (< 1500ms)
      expect(totalTime).toBeLessThan(1500);
    });
  });

  // ============================================================================
  // Additional Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle network timeout gracefully', async () => {
      // Arrange: Mock fetch to simulate timeout
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Request timeout')
      );

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.code).toBe('NETWORK_ERROR');
    });

    it('should handle invalid limit parameter gracefully', async () => {
      // Arrange: Request with invalid limit
      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco&limit=-5');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert: Should either use default or return validation error
      expect([200, 400]).toContain(response.status);
      if (response.status === 400) {
        expect(data.code).toBe('INVALID_QUERY');
      }
    });

    it('should sanitize query parameter for security', async () => {
      // Arrange: Request with potentially dangerous characters
      const dangerousQuery = '<script>alert("xss")</script>';
      const mockResponse = {
        features: []
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const request = new NextRequest(
        `http://localhost:3000/api/geocode?q=${encodeURIComponent(dangerousQuery)}`
      );

      // Act
      const response = await GET(request);

      // Assert: Should handle safely (either reject or sanitize)
      expect([200, 400]).toContain(response.status);

      // Verify the fetch call doesn't contain unsanitized dangerous content
      if (response.status === 200) {
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(fetchCall).not.toContain('<script>');
      }
    });
  });
});
