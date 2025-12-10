/**
 * Unified Auth Module Test Suite
 * TDD RED Phase: Tests for the consolidated authentication module
 *
 * This test suite verifies the unified auth module that consolidates
 * the three auth utilities (auth-service, auth-middleware, jwt) into
 * one consistent API.
 *
 * Test cases cover:
 * - Token validation with Result pattern
 * - Role-based access control
 * - Vendor ownership validation
 * - Admin override behavior
 * - Type guards
 *
 * @group unit
 * @group auth
 * @group tdd-red
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Mock Payload CMS
const mockPayload = {
  find: jest.fn(),
  create: jest.fn(),
};

jest.mock('payload', () => ({
  getPayload: jest.fn(() => mockPayload),
  buildConfig: jest.fn((config) => config),
}));

// Mock the payload config
jest.mock('@/payload.config', () => ({
  default: {},
  __esModule: true,
}));

// Test constants
const TEST_ACCESS_SECRET = 'test-access-secret-for-unit-tests-only';
const TEST_REFRESH_SECRET = 'test-refresh-secret-for-unit-tests-only';

// Set environment variables for tests
const original_env = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...original_env,
    JWT_ACCESS_SECRET: TEST_ACCESS_SECRET,
    JWT_REFRESH_SECRET: TEST_REFRESH_SECRET,
    PAYLOAD_SECRET: 'test-payload-secret-32chars!!!!!',
  };
});

afterEach(() => {
  process.env = original_env;
  jest.clearAllMocks();
});

/**
 * Helper to create a valid JWT token for testing
 */
function createTestToken(
  payload: Record<string, unknown>,
  type: 'access' | 'refresh' = 'access',
  options: { expired?: boolean; secret?: string } = {}
): string {
  const secret = options.secret || (type === 'access' ? TEST_ACCESS_SECRET : TEST_REFRESH_SECRET);
  const expires_in = options.expired ? '-1h' : '1h';

  return jwt.sign(
    {
      ...payload,
      type,
      jti: 'test-jti-' + Math.random().toString(36).slice(2),
    },
    secret,
    { expiresIn: expires_in }
  );
}

/**
 * Helper to create a mock NextRequest-like object for testing
 *
 * Jest's polyfills conflict with NextRequest constructor, so we create
 * a mock object that implements the necessary interface.
 */
function createMockRequest(options: {
  auth_token?: string;
  cookie_token?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
} = {}): NextRequest {
  const headers = new Headers(options.headers || {});

  if (options.auth_token) {
    headers.set('authorization', `Bearer ${options.auth_token}`);
  }

  if (options.cookie_token) {
    headers.set('cookie', `access_token=${options.cookie_token}`);
  }

  // Create a mock object that implements the NextRequest interface
  // without actually instantiating NextRequest (which fails in Jest)
  const mock_cookies = {
    get: (name: string) => {
      if (name === 'access_token' && options.cookie_token) {
        return { name: 'access_token', value: options.cookie_token };
      }
      return undefined;
    },
  };

  return {
    headers,
    cookies: mock_cookies,
    url: options.url || 'http://localhost:3000/api/test',
    method: options.method || 'GET',
  } as unknown as NextRequest;
}

describe('Unified Auth Module', () => {
  describe('validateToken', () => {
    it('should return error for missing token', async () => {
      const { validateToken } = await import('@/lib/auth');
      const request = createMockRequest();

      const result = await validateToken(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Authentication required');
        expect(result.status).toBe(401);
      }
    });

    it('should return success with user for valid token', async () => {
      const { validateToken } = await import('@/lib/auth');
      const token = createTestToken({
        id: 'user-123',
        email: 'test@example.com',
        role: 'vendor',
        tier: 'tier1',
        tokenVersion: 1,
      });

      // Mock user lookup for token version validation
      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'user-123', tokenVersion: 1 }],
      });

      const request = createMockRequest({ auth_token: token });
      const result = await validateToken(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.user.id).toBe('user-123');
        expect(result.user.email).toBe('test@example.com');
        expect(result.user.role).toBe('vendor');
      }
    });

    it('should return error for expired token', async () => {
      const { validateToken } = await import('@/lib/auth');
      const token = createTestToken(
        {
          id: 'user-123',
          email: 'test@example.com',
          role: 'vendor',
          tokenVersion: 1,
        },
        'access',
        { expired: true }
      );

      const request = createMockRequest({ auth_token: token });
      const result = await validateToken(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Token expired');
        expect(result.status).toBe(401);
        expect(result.code).toBe('TOKEN_EXPIRED');
      }
    });

    it('should return error for revoked token (tokenVersion mismatch)', async () => {
      const { validateToken } = await import('@/lib/auth');
      const token = createTestToken({
        id: 'user-123',
        email: 'test@example.com',
        role: 'vendor',
        tokenVersion: 1, // Token has version 1
      });

      // User's current token version is 2 (meaning token was invalidated)
      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'user-123', tokenVersion: 2 }],
      });

      const request = createMockRequest({ auth_token: token });
      const result = await validateToken(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Token revoked');
        expect(result.status).toBe(401);
        expect(result.code).toBe('TOKEN_REVOKED');
      }
    });

    it('should extract token from cookie when header missing', async () => {
      const { validateToken } = await import('@/lib/auth');
      const token = createTestToken({
        id: 'user-123',
        email: 'test@example.com',
        role: 'vendor',
        tokenVersion: 1,
      });

      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'user-123', tokenVersion: 1 }],
      });

      const request = createMockRequest({ cookie_token: token });
      const result = await validateToken(request);

      expect(result.success).toBe(true);
    });
  });

  describe('requireAuth', () => {
    it('should return user object for valid request', async () => {
      const { requireAuth } = await import('@/lib/auth');
      const token = createTestToken({
        id: 'user-456',
        email: 'vendor@example.com',
        role: 'vendor',
        tier: 'tier2',
        tokenVersion: 1,
      });

      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'user-456', tokenVersion: 1 }],
      });

      const request = createMockRequest({ auth_token: token });
      const result = await requireAuth(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.user.id).toBe('user-456');
        expect(result.user.role).toBe('vendor');
        expect(result.user.tier).toBe('tier2');
      }
    });

    it('should return NextResponse error for invalid request', async () => {
      const { requireAuth } = await import('@/lib/auth');
      const request = createMockRequest(); // No token

      const result = await requireAuth(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.status).toBe(401);
        expect(result.error).toBe('Authentication required');
      }
    });
  });

  describe('requireRole', () => {
    it('should allow vendor access with requireRole([\'vendor\'])', async () => {
      const { requireRole } = await import('@/lib/auth');
      const token = createTestToken({
        id: 'vendor-123',
        email: 'vendor@example.com',
        role: 'vendor',
        tokenVersion: 1,
      });

      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'vendor-123', tokenVersion: 1 }],
      });

      const request = createMockRequest({ auth_token: token });
      const result = await requireRole(['vendor'])(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.user.role).toBe('vendor');
      }
    });

    it('should deny vendor access with requireRole([\'admin\'])', async () => {
      const { requireRole } = await import('@/lib/auth');
      const token = createTestToken({
        id: 'vendor-123',
        email: 'vendor@example.com',
        role: 'vendor',
        tokenVersion: 1,
      });

      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'vendor-123', tokenVersion: 1 }],
      });

      const request = createMockRequest({ auth_token: token });
      const result = await requireRole(['admin'])(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.status).toBe(403);
        expect(result.error).toBe('Insufficient permissions');
      }
    });

    it('should allow both roles with requireRole([\'admin\', \'vendor\'])', async () => {
      const { requireRole } = await import('@/lib/auth');
      const vendor_token = createTestToken({
        id: 'vendor-123',
        email: 'vendor@example.com',
        role: 'vendor',
        tokenVersion: 1,
      });

      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'vendor-123', tokenVersion: 1 }],
      });

      const vendor_request = createMockRequest({ auth_token: vendor_token });
      const vendor_result = await requireRole(['admin', 'vendor'])(vendor_request);

      expect(vendor_result.success).toBe(true);

      const admin_token = createTestToken({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
        tokenVersion: 1,
      });

      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'admin-123', tokenVersion: 1 }],
      });

      const admin_request = createMockRequest({ auth_token: admin_token });
      const admin_result = await requireRole(['admin', 'vendor'])(admin_request);

      expect(admin_result.success).toBe(true);
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin access', async () => {
      const { requireAdmin } = await import('@/lib/auth');
      const token = createTestToken({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
        tokenVersion: 1,
      });

      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'admin-123', tokenVersion: 1 }],
      });

      const request = createMockRequest({ auth_token: token });
      const result = await requireAdmin(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.user.role).toBe('admin');
      }
    });

    it('should deny vendor access', async () => {
      const { requireAdmin } = await import('@/lib/auth');
      const token = createTestToken({
        id: 'vendor-123',
        email: 'vendor@example.com',
        role: 'vendor',
        tokenVersion: 1,
      });

      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'vendor-123', tokenVersion: 1 }],
      });

      const request = createMockRequest({ auth_token: token });
      const result = await requireAdmin(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.status).toBe(403);
      }
    });
  });

  describe('requireVendorOwnership', () => {
    it('should allow vendor to access their own profile', async () => {
      const { requireVendorOwnership } = await import('@/lib/auth');
      const token = createTestToken({
        id: 'user-123',
        email: 'vendor@example.com',
        role: 'vendor',
        tokenVersion: 1,
      });

      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'user-123', tokenVersion: 1 }],
      });

      // Mock vendor lookup - vendor belongs to this user
      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'vendor-123', user: 'user-123' }],
      });

      const request = createMockRequest({ auth_token: token });
      const result = await requireVendorOwnership('vendor-123')(request);

      expect(result.success).toBe(true);
    });

    it('should deny vendor accessing another vendor\'s profile', async () => {
      const { requireVendorOwnership } = await import('@/lib/auth');
      const token = createTestToken({
        id: 'user-123',
        email: 'vendor@example.com',
        role: 'vendor',
        tokenVersion: 1,
      });

      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'user-123', tokenVersion: 1 }],
      });

      // Mock vendor lookup - vendor belongs to different user
      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'vendor-456', user: 'user-other' }],
      });

      const request = createMockRequest({ auth_token: token });
      const result = await requireVendorOwnership('vendor-456')(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.status).toBe(403);
        expect(result.error).toBe('Access denied');
      }
    });

    it('should allow admin to access any vendor\'s profile', async () => {
      const { requireVendorOwnership } = await import('@/lib/auth');
      const token = createTestToken({
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
        tokenVersion: 1,
      });

      mockPayload.find.mockResolvedValueOnce({
        docs: [{ id: 'admin-123', tokenVersion: 1 }],
      });

      // Admin doesn't need ownership check - should succeed without vendor lookup
      const request = createMockRequest({ auth_token: token });
      const result = await requireVendorOwnership('vendor-456')(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.user.role).toBe('admin');
      }
    });
  });

  describe('isAuthError type guard', () => {
    it('should return true for auth error objects', async () => {
      const { isAuthError } = await import('@/lib/auth');

      const error_result = {
        success: false as const,
        error: 'Authentication required',
        status: 401,
      };

      expect(isAuthError(error_result)).toBe(true);
    });

    it('should return false for success objects', async () => {
      const { isAuthError } = await import('@/lib/auth');

      const success_result = {
        success: true as const,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'vendor' as const,
        },
      };

      expect(isAuthError(success_result)).toBe(false);
    });

    it('should work correctly in type narrowing', async () => {
      const { validateToken, isAuthError } = await import('@/lib/auth');
      const request = createMockRequest(); // No token

      const result = await validateToken(request);

      if (isAuthError(result)) {
        // TypeScript should know result is AuthError here
        expect(result.error).toBeDefined();
        expect(result.status).toBeDefined();
      } else {
        // This branch shouldn't execute for missing token
        expect(true).toBe(false);
      }
    });
  });
});
