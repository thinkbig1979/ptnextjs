/**
 * Test Suite for /api/geocode endpoint
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/geocode/route';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('/api/geocode API Endpoint', () => {
  // Track current time for rate limiting
  let currentTime = 1000000000000; // Fixed starting point
  let testCounter = 0;

  beforeAll(() => {
    // Mock Date.now to control time progression
    jest.spyOn(Date, 'now').mockImplementation(() => currentTime);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    // Advance time by 2 minutes between tests to avoid rate limit
    testCounter++;
    currentTime = 1000000000000 + (testCounter * 120000);
    (Date.now as jest.Mock).mockReturnValue(currentTime);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Successful Geocoding', () => {
    it('should return results for simple city search', async () => {
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [7.4246, 43.7384] },
            properties: {
              osm_id: 1124039,
              name: 'Monaco',
              country: 'Monaco',
              countrycode: 'MC',
              city: 'Monaco',
              type: 'city'
            }
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      } as any);

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toHaveLength(1);
      expect(data.results[0].properties.name).toBe('Monaco');
    });

    it('should return multiple results', async () => {
      const mockPhotonResponse = {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
            properties: { name: 'Paris', country: 'France', countrycode: 'FR' }
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-95.5555, 33.6609] },
            properties: { name: 'Paris', country: 'United States', countrycode: 'US' }
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotonResponse
      } as any);

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Paris');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toHaveLength(2);
    });

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ features: [] })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/geocode?q=NonexistentPlace');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for missing query', async () => {
      const request = new NextRequest('http://localhost:3000/api/geocode');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('INVALID_QUERY');
    });

    it('should return 400 for empty query', async () => {
      const request = new NextRequest('http://localhost:3000/api/geocode?q=');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('INVALID_QUERY');
    });

    it('should return 400 for whitespace query', async () => {
      const request = new NextRequest('http://localhost:3000/api/geocode?q=   ');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('INVALID_QUERY');
    });

    it('should return 400 for query exceeding max length', async () => {
      const longQuery = 'a'.repeat(250);
      const request = new NextRequest(`http://localhost:3000/api/geocode?q=${longQuery}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('INVALID_QUERY');
    });

    it('should return 503 for unavailable service', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503
      } as any);

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should return 500 for service error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as any);

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.code).toBe('SERVICE_ERROR');
    });

    it('should handle malformed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'structure' })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.code).toBe('SERVICE_ERROR');
    });
  });

  describe('Response Format', () => {
    it('should validate response schema', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [7.4246, 43.7384] },
            properties: { osm_id: 1, name: 'Monaco', country: 'Monaco', countrycode: 'MC', type: 'city' }
          }]
        })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.results[0]).toHaveProperty('type', 'Feature');
      expect(data.results[0]).toHaveProperty('geometry');
      expect(data.results[0]).toHaveProperty('properties');
    });

    it('should preserve coordinate format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [7.4246, 43.7384] },
            properties: { osm_id: 1, name: 'Monaco', country: 'Monaco', countrycode: 'MC', type: 'city' }
          }]
        })
      } as any);

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');
      const response = await GET(request);
      const data = await response.json();

      const coords = data.results[0].geometry.coordinates;
      expect(coords).toEqual([7.4246, 43.7384]);
      expect(coords[0]).toBeGreaterThanOrEqual(-180);
      expect(coords[0]).toBeLessThanOrEqual(180);
      expect(coords[1]).toBeGreaterThanOrEqual(-90);
      expect(coords[1]).toBeLessThanOrEqual(90);
    });
  });

  describe('Edge Cases', () => {
    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.code).toBe('NETWORK_ERROR');
    });

    it('should handle invalid limit parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/geocode?q=Monaco&limit=-5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('INVALID_QUERY');
    });
  });
});
