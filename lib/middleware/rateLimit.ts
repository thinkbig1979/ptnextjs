/**
 * Simple In-Memory Rate Limiter
 *
 * Implements IP-based rate limiting with automatic cleanup.
 * Suitable for development and small-scale production use.
 * For high-scale production, consider Redis-based solutions.
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store: IP -> RateLimitEntry
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// Cleanup interval to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let cleanupTimer: NodeJS.Timeout | null = null;

/**
 * Cleanup expired entries from the rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [ip, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      keysToDelete.push(ip);
    }
  }

  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

/**
 * Start periodic cleanup timer
 */
function startCleanupTimer(): void {
  if (!cleanupTimer) {
    cleanupTimer = setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);
    // Prevent the timer from keeping the process alive
    if (cleanupTimer.unref) {
      cleanupTimer.unref();
    }
  }
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  // Check common proxy headers first
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list, take the first IP
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback to a default (should not happen in production with proper proxy setup)
  return 'unknown';
}

/**
 * Rate limit options
 */
export interface RateLimitOptions {
  /** Maximum requests per window (default: 10) */
  maxRequests?: number;
  /** Time window in milliseconds (default: 60000 = 1 minute) */
  windowMs?: number;
}

/**
 * Rate limit middleware
 *
 * @param request - Next.js request object
 * @param handler - The actual API handler function to call if rate limit passes
 * @param options - Optional rate limit configuration
 * @returns NextResponse with 429 status if rate limited, otherwise handler response
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   return rateLimit(request, async () => {
 *     // Your actual handler logic
 *     return NextResponse.json({ success: true });
 *   });
 * }
 *
 * @example
 * // With custom limits
 * export async function GET(request: NextRequest) {
 *   return rateLimit(request, async () => {
 *     return NextResponse.json({ data: [] });
 *   }, { maxRequests: 60, windowMs: 60000 });
 * }
 */
export async function rateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options?: RateLimitOptions
): Promise<NextResponse> {
  // Start cleanup timer on first use
  startCleanupTimer();

  const maxRequests = options?.maxRequests ?? MAX_REQUESTS_PER_WINDOW;
  const windowMs = options?.windowMs ?? RATE_LIMIT_WINDOW_MS;

  const clientIp = getClientIp(request);
  const now = Date.now();

  // Create a unique key combining IP and rate limit config for different limits
  const storeKey = `${clientIp}:${maxRequests}:${windowMs}`;

  // Get or create rate limit entry
  let entry = rateLimitStore.get(storeKey);

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(storeKey, entry);
  } else {
    // Increment existing entry
    entry.count += 1;
  }

  // Check if rate limit exceeded
  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    return NextResponse.json(
      {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(entry.resetTime / 1000)),
        },
      }
    );
  }

  // Add rate limit headers to successful response
  const response = await handler();

  // Clone response to add headers
  const newResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  newResponse.headers.set('X-RateLimit-Limit', String(maxRequests));
  newResponse.headers.set('X-RateLimit-Remaining', String(maxRequests - entry.count));
  newResponse.headers.set('X-RateLimit-Reset', String(Math.floor(entry.resetTime / 1000)));

  return newResponse;
}

/**
 * Export for testing purposes
 */
export const _testing = {
  rateLimitStore,
  cleanupExpiredEntries,
  getClientIp,
  RATE_LIMIT_WINDOW_MS,
  MAX_REQUESTS_PER_WINDOW,
};
