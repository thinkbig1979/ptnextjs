import { NextRequest, NextResponse } from 'next/server';
import {
  PhotonResponse,
  GeocodeSuccessResponse,
  GeocodeErrorResponse,
} from '@/lib/types';

// ============================================================================
// Type Definitions (using central types)
// ============================================================================

type SuccessResponse = GeocodeSuccessResponse;
type ErrorResponse = GeocodeErrorResponse;

// ============================================================================
// Rate Limiting Implementation
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory Map-based rate limiter
const rateLimitMap = new Map<string, RateLimitEntry>();

// Rate limit configuration
// Use same window in test mode for consistency
// Tests will explicitly set time and advance timers as needed
const RATE_LIMIT_WINDOW_MS = 60000; // 60 seconds (1 minute)
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

// Clean up expired entries periodically (every 5 minutes)
// Only start cleanup interval in production/non-test environments
let cleanupInterval: NodeJS.Timeout | null = null;
if (process.env.NODE_ENV !== 'test' && typeof setInterval !== 'undefined') {
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((entry, ip) => {
      if (now > entry.resetTime) {
        rateLimitMap.delete(ip);
      }
    });
  }, 300000); // 5 minutes

  // Allow process to exit even if interval is running
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}

// Track the last cleanup time
let lastCleanupTime = 0;
const CLEANUP_INTERVAL = 10000; // Clean up every 10 seconds

// Helper for testing purposes (not exported as route export)
function clearRateLimitForTesting(): void {
  if (process.env.NODE_ENV === 'test') {
    rateLimitMap.clear();
    lastCleanupTime = 0;
  }
}

// Only expose to testing via globalThis in test environment
if (process.env.NODE_ENV === 'test') {
  (globalThis as any).__clearRateLimitForTesting = clearRateLimitForTesting;
}

function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();

  // Detect if time has gone backwards (e.g., fake timers reset in tests)
  // If so, clear all entries as they're now invalid
  if (now < lastCleanupTime) {
    rateLimitMap.clear();
    lastCleanupTime = now;
  }

  // In test environment, always clean up expired entries on every check
  if (process.env.NODE_ENV === 'test') {
    rateLimitMap.forEach((entry, key) => {
      if (now >= entry.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  } else {
    // In production, use throttled cleanup for performance
    if (now - lastCleanupTime > CLEANUP_INTERVAL) {
      rateLimitMap.forEach((entry, key) => {
        if (now > entry.resetTime) {
          rateLimitMap.delete(key);
        }
      });
      lastCleanupTime = now;
    }
  }

  const entry = rateLimitMap.get(ip);

  if (!entry) {
    // First request from this IP
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  // Check if rate limit window has expired
  if (now > entry.resetTime) {
    // Reset the counter
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  // Within the rate limit window
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    // Rate limit exceeded
    return { allowed: false, resetTime: entry.resetTime };
  }

  // Increment counter
  entry.count += 1;
  return { allowed: true };
}

function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers (for proxy/CDN scenarios)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to request.ip or default
  // Using type assertion as ip is available at runtime but not in types
  return (request as any).ip || '127.0.0.1';
}

// ============================================================================
// Photon API Integration
// ============================================================================

const PHOTON_API_BASE_URL = 'https://photon.komoot.io/api';
const PHOTON_API_TIMEOUT = 5000; // 5 seconds

async function fetchFromPhoton(
  query: string,
  limit: number,
  lang: string
): Promise<PhotonResponse> {
  const url = new URL(PHOTON_API_BASE_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('lang', lang);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PHOTON_API_TIMEOUT);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 503) {
        throw new Error('SERVICE_UNAVAILABLE');
      }
      throw new Error('SERVICE_ERROR');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('NETWORK_ERROR');
      }
      if (error.message === 'SERVICE_UNAVAILABLE') {
        throw error;
      }
      if (error.message === 'SERVICE_ERROR') {
        throw error;
      }
    }
    throw new Error('NETWORK_ERROR');
  }
}

// ============================================================================
// Request Validation
// ============================================================================

function validateQueryParams(searchParams: URLSearchParams): {
  valid: boolean;
  query?: string;
  limit?: number;
  lang?: string;
  error?: string;
} {
  // Validate query parameter
  const query = searchParams.get('q');
  if (query === null) {
    return {
      valid: false,
      error: 'Missing required query parameter "q"',
    };
  }

  const trimmedQuery = query.trim();

  // Check length (empty string or whitespace will fail this)
  if (trimmedQuery.length < 2) {
    return {
      valid: false,
      error: 'Query parameter must be at least 2 characters long',
    };
  }

  if (trimmedQuery.length > 200) {
    return {
      valid: false,
      error: 'Query parameter exceeds maximum length of 200 characters',
    };
  }

  // Validate limit parameter
  let limit = 5; // Default
  const limitParam = searchParams.get('limit');
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return {
        valid: false,
        error: 'Invalid limit parameter',
      };
    }
    limit = parsedLimit;
  }

  // Validate lang parameter
  const lang = searchParams.get('lang') || 'en'; // Default to 'en'

  return {
    valid: true,
    query: trimmedQuery,
    limit,
    lang,
  };
}

// ============================================================================
// Main GET Handler
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Extract client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIP);
    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.resetTime
        ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        : 60;

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT',
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validation = validateQueryParams(searchParams);

    if (!validation.valid) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: validation.error || 'Invalid query parameters',
          code: 'INVALID_QUERY',
        },
        { status: 400 }
      );
    }

    // Fetch from Photon API
    const photonResponse = await fetchFromPhoton(
      validation.query!,
      validation.limit!,
      validation.lang!
    );

    // Validate response structure
    if (!photonResponse || !Array.isArray(photonResponse.features)) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'Invalid response from geocoding service',
          code: 'SERVICE_ERROR',
        },
        { status: 500 }
      );
    }

    // Transform and return results
    return NextResponse.json<SuccessResponse>(
      {
        success: true,
        results: photonResponse.features,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === 'SERVICE_UNAVAILABLE') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: 'Geocoding service is temporarily unavailable',
            code: 'SERVICE_UNAVAILABLE',
          },
          { status: 503 }
        );
      }

      if (error.message === 'SERVICE_ERROR') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: 'Geocoding service error',
            code: 'SERVICE_ERROR',
          },
          { status: 500 }
        );
      }

      if (error.message === 'NETWORK_ERROR') {
        return NextResponse.json<ErrorResponse>(
          {
            success: false,
            error: 'Network error occurred',
            code: 'NETWORK_ERROR',
          },
          { status: 500 }
        );
      }
    }

    // Generic error handler
    console.error('Geocoding error:', error);
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: 'Internal server error',
        code: 'SERVICE_ERROR',
      },
      { status: 500 }
    );
  }
}
