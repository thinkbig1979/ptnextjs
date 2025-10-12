import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import type { JWTPayload } from '@/lib/utils/jwt';

const JWT_SECRET = process.env.PAYLOAD_SECRET || 'test-secret-key-for-testing-only';

/**
 * Generate a valid JWT token for testing
 */
export function generateTestToken(payload: JWTPayload, expiresIn: string = '1h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Generate an expired JWT token for testing
 */
export function generateExpiredToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '-1h' });
}

/**
 * Generate an invalid JWT token (malformed)
 */
export function generateInvalidToken(): string {
  return 'invalid.jwt.token.malformed';
}

/**
 * Generate a JWT token with tampered signature
 */
export function generateTamperedToken(payload: JWTPayload): string {
  const validToken = generateTestToken(payload);
  // Tamper with the signature part
  const parts = validToken.split('.');
  return `${parts[0]}.${parts[1]}.tampered-signature`;
}

/**
 * Decode JWT token without verification (for testing purposes)
 */
export function decodeTestToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Create mock NextRequest with authentication headers
 */
export function createMockAuthenticatedRequest(
  user: JWTPayload,
  options: {
    method?: string;
    url?: string;
    body?: any;
    useHeader?: boolean;
    useCookie?: boolean;
  } = {}
): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body = null,
    useHeader = true,
    useCookie = false,
  } = options;

  const token = generateTestToken(user);

  const headers = new Headers();
  if (useHeader) {
    headers.set('authorization', `Bearer ${token}`);
  }
  headers.set('content-type', 'application/json');

  // Mock NextRequest
  const request = new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (useCookie) {
    // @ts-ignore - Mocking cookies
    request.cookies = {
      get: (name: string) => (name === 'access_token' ? { value: token } : undefined),
    };
  }

  return request;
}

/**
 * Create mock NextRequest without authentication
 */
export function createMockUnauthenticatedRequest(options: {
  method?: string;
  url?: string;
  body?: any;
} = {}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body = null,
  } = options;

  const headers = new Headers();
  headers.set('content-type', 'application/json');

  return new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Create mock NextRequest with custom headers
 */
export function createMockRequestWithHeaders(
  headers: Record<string, string>,
  options: {
    method?: string;
    url?: string;
    body?: any;
  } = {}
): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body = null,
  } = options;

  const requestHeaders = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    requestHeaders.set(key, value);
  });

  return new NextRequest(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Extract user headers from NextResponse
 */
export function extractUserHeadersFromResponse(response: NextResponse): {
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  userTier: string | null;
} {
  return {
    userId: response.headers.get('x-user-id'),
    userEmail: response.headers.get('x-user-email'),
    userRole: response.headers.get('x-user-role'),
    userTier: response.headers.get('x-user-tier'),
  };
}

/**
 * Mock Payload CMS find response for users collection
 */
export function mockPayloadUserFindResponse(user: any) {
  return {
    docs: [user],
    totalDocs: 1,
    limit: 1,
    totalPages: 1,
    page: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };
}

/**
 * Mock empty Payload CMS find response
 */
export function mockPayloadEmptyFindResponse() {
  return {
    docs: [],
    totalDocs: 0,
    limit: 1,
    totalPages: 0,
    page: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };
}

/**
 * Mock Payload CMS vendor find response
 */
export function mockPayloadVendorFindResponse(vendor: any) {
  return {
    docs: [vendor],
    totalDocs: 1,
    limit: 1,
    totalPages: 1,
    page: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };
}

/**
 * Wait for async operations (useful for testing async middleware)
 */
export function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract error message from NextResponse
 */
export async function extractErrorFromResponse(response: NextResponse): Promise<{
  error: string;
  code?: string;
  message?: string;
}> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}
