/**
 * GeocodingService - Integration with Photon API via /api/geocode
 */

import { VendorLocation } from '@/lib/types';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

interface GeocodeError {
  code: 'NETWORK_ERROR' | 'NOT_FOUND' | 'RATE_LIMITED' | 'INVALID_RESPONSE' | 'TIMEOUT';
  message: string;
}

const GEOCODING_CACHE_KEY = 'geocoding-cache-v1';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;
const API_TIMEOUT_MS = 10000;

interface CacheEntry {
  timestamp: number;
  result: GeocodingResult;
}

function getCachedResult(address: string): GeocodingResult | null {
  if (typeof window === 'undefined') return null;

  try {
    const cache = localStorage.getItem(GEOCODING_CACHE_KEY);
    if (!cache) return null;

    const cacheMap: Record<string, CacheEntry> = JSON.parse(cache);
    const entry = cacheMap[address.toLowerCase()];

    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > CACHE_EXPIRY_MS) {
      delete cacheMap[address.toLowerCase()];
      localStorage.setItem(GEOCODING_CACHE_KEY, JSON.stringify(cacheMap));
      return null;
    }

    return entry.result;
  } catch (error) {
    console.error('Error reading geocoding cache:', error);
    return null;
  }
}

function cacheResult(address: string, result: GeocodingResult): void {
  if (typeof window === 'undefined') return;

  try {
    const cache = localStorage.getItem(GEOCODING_CACHE_KEY) || '{}';
    const cacheMap: Record<string, CacheEntry> = JSON.parse(cache);

    cacheMap[address.toLowerCase()] = {
      timestamp: Date.now(),
      result,
    };

    localStorage.setItem(GEOCODING_CACHE_KEY, JSON.stringify(cacheMap));
  } catch (error) {
    console.error('Error caching geocoding result:', error);
  }
}

async function geocodeAddress(address: string): Promise<GeocodingResult> {
  if (!address || typeof address !== 'string') {
    throw {
      code: 'INVALID_RESPONSE',
      message: 'Address must be a non-empty string',
    } as GeocodeError;
  }

  const cached = getCachedResult(address);
  if (cached) {
    return cached;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const response = await fetch('/api/geocode?q=' + encodeURIComponent(address), {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      throw {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
      } as GeocodeError;
    }

    if (!response.ok) {
      throw {
        code: 'NETWORK_ERROR',
        message: 'Failed to geocode address',
      } as GeocodeError;
    }

    const data = await response.json();

    if (!data.success || !data.results || data.results.length === 0) {
      throw {
        code: 'NOT_FOUND',
        message: `No results found for address: "${address}"`,
      } as GeocodeError;
    }

    const feature = data.results[0];
    const result: GeocodingResult = {
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      address: feature.properties.name,
      city: feature.properties.city,
      country: feature.properties.country,
    };

    cacheResult(address, result);
    return result;
  } catch (error) {
    if (error instanceof TypeError && error.name === 'AbortError') {
      throw {
        code: 'TIMEOUT',
        message: 'Geocoding request timed out. Please try again.',
      } as GeocodeError;
    }

    if ((error as GeocodeError).code) {
      throw error as GeocodeError;
    }

    throw {
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    } as GeocodeError;
  }
}

function parseGeocodingResult(result: GeocodingResult): Partial<VendorLocation> {
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    address: result.address,
    city: result.city,
    country: result.country,
  };
}

class GeocodingService {
  static async geocode(address: string): Promise<GeocodingResult> {
    return geocodeAddress(address);
  }

  static parseResult(result: GeocodingResult): Partial<VendorLocation> {
    return parseGeocodingResult(result);
  }
}

export default GeocodingService;
