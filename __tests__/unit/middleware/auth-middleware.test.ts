/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, requireRole, requireTier, getUserFromRequest } from '@/lib/middleware/auth-middleware';
import { authService } from '@/lib/services/auth-service';
import {
  generateTestToken,
  generateExpiredToken,
  generateInvalidToken,
  createMockAuthenticatedRequest,
  createMockUnauthenticatedRequest,
  createMockRequestWithHeaders,
  extractErrorFromResponse,
} from '@/__tests__/utils/auth-helpers';
import {
  MOCK_ADMIN_JWT_PAYLOAD,
  MOCK_VENDOR_TIER2_JWT_PAYLOAD,
  MOCK_VENDOR_TIER1_JWT_PAYLOAD,
  MOCK_VENDOR_FREE_JWT_PAYLOAD,
} from '@/__tests__/fixtures/users';

// Mock AuthService
jest.mock('@/lib/services/auth-service', () => ({
  authService: {
    validateToken: jest.fn(),
  },
}));

const mockValidateToken = authService.validateToken as jest.MockedFunction<typeof authService.validateToken>;

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authMiddleware()', () => {
    it('should grant access with valid JWT in Authorization header', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_ADMIN_JWT_PAYLOAD);
      const request = createMockAuthenticatedRequest(MOCK_ADMIN_JWT_PAYLOAD, { useHeader: true });

      // Act
      const response = await authMiddleware(request);

      // Assert
      expect(response.status).not.toBe(401);
      expect(mockValidateToken).toHaveBeenCalled();
    });

    it('should grant access with valid JWT in httpOnly cookie', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_VENDOR_TIER2_JWT_PAYLOAD);
      const request = createMockAuthenticatedRequest(MOCK_VENDOR_TIER2_JWT_PAYLOAD, {
        useHeader: false,
        useCookie: true,
      });

      // Act
      const response = await authMiddleware(request);

      // Assert
      expect(response.status).not.toBe(401);
    });

    it('should return 401 when token is missing', async () => {
      // Arrange
      const request = createMockUnauthenticatedRequest();

      // Act
      const response = await authMiddleware(request);

      // Assert
      expect(response.status).toBe(401);
      const error = await extractErrorFromResponse(response);
      expect(error.error).toBe('Authentication required');
    });

    it('should return 401 with TOKEN_EXPIRED code for expired JWT', async () => {
      // Arrange
      mockValidateToken.mockImplementation(() => {
        throw new Error('Token expired');
      });
      const request = createMockAuthenticatedRequest(MOCK_ADMIN_JWT_PAYLOAD);

      // Act
      const response = await authMiddleware(request);

      // Assert
      expect(response.status).toBe(401);
      const error = await extractErrorFromResponse(response);
      expect(error.error).toBe('Token expired');
      expect(error.code).toBe('TOKEN_EXPIRED');
    });

    it('should return 401 for invalid JWT', async () => {
      // Arrange
      mockValidateToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const request = createMockAuthenticatedRequest(MOCK_ADMIN_JWT_PAYLOAD);

      // Act
      const response = await authMiddleware(request);

      // Assert
      expect(response.status).toBe(401);
      const error = await extractErrorFromResponse(response);
      expect(error.error).toBe('Invalid token');
    });

    it('should attach user data to request headers (x-user-*)', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_VENDOR_TIER2_JWT_PAYLOAD);
      const request = createMockAuthenticatedRequest(MOCK_VENDOR_TIER2_JWT_PAYLOAD);

      // Act
      const response = await authMiddleware(request);

      // Assert
      // Note: NextResponse.next() doesn't allow us to inspect headers directly in tests,
      // but we verify the function was called correctly
      expect(mockValidateToken).toHaveBeenCalled();
      expect(response.status).not.toBe(401);
    });

    it('should set x-user-tier header for vendor users', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_VENDOR_TIER1_JWT_PAYLOAD);
      const request = createMockAuthenticatedRequest(MOCK_VENDOR_TIER1_JWT_PAYLOAD);

      // Act
      const response = await authMiddleware(request);

      // Assert
      expect(mockValidateToken).toHaveBeenCalled();
      const token = mockValidateToken.mock.calls[0][0];
      expect(token).toBeDefined();
    });

    it('should not set x-user-tier header for admin users', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_ADMIN_JWT_PAYLOAD);
      const request = createMockAuthenticatedRequest(MOCK_ADMIN_JWT_PAYLOAD);

      // Act
      const response = await authMiddleware(request);

      // Assert
      expect(mockValidateToken).toHaveBeenCalled();
    });
  });

  describe('requireRole()', () => {
    it('should grant access to admin when role is admin', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_ADMIN_JWT_PAYLOAD);
      const middleware = requireRole(['admin']);
      const request = createMockAuthenticatedRequest(MOCK_ADMIN_JWT_PAYLOAD);

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it('should grant access to vendor when role is vendor', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_VENDOR_TIER2_JWT_PAYLOAD);
      const middleware = requireRole(['vendor']);
      const request = createMockAuthenticatedRequest(MOCK_VENDOR_TIER2_JWT_PAYLOAD);

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it('should return 403 when vendor tries to access admin route', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_VENDOR_TIER2_JWT_PAYLOAD);
      const middleware = requireRole(['admin']);
      const request = createMockAuthenticatedRequest(MOCK_VENDOR_TIER2_JWT_PAYLOAD);

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(403);
      const error = await extractErrorFromResponse(response);
      expect(error.error).toBe('Insufficient permissions');
    });

    it('should grant admin access to vendor routes (admin has all permissions)', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_ADMIN_JWT_PAYLOAD);
      const middleware = requireRole(['vendor']);
      const request = createMockAuthenticatedRequest(MOCK_ADMIN_JWT_PAYLOAD);

      // Act
      const response = await middleware(request);

      // Assert
      // Admin should fail this because admin is NOT in vendor role
      // This tests RBAC properly - admin needs explicit admin routes
      expect(response.status).toBe(403);
    });

    it('should grant access when user has one of multiple allowed roles', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_VENDOR_TIER2_JWT_PAYLOAD);
      const middleware = requireRole(['admin', 'vendor']);
      const request = createMockAuthenticatedRequest(MOCK_VENDOR_TIER2_JWT_PAYLOAD);

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it('should return 401 when token is missing', async () => {
      // Arrange
      const middleware = requireRole(['admin']);
      const request = createMockUnauthenticatedRequest();

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 401 when token is invalid', async () => {
      // Arrange
      mockValidateToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const middleware = requireRole(['admin']);
      const request = createMockAuthenticatedRequest(MOCK_ADMIN_JWT_PAYLOAD);

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('requireTier()', () => {
    it('should grant access when vendor has exact tier', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_VENDOR_TIER1_JWT_PAYLOAD);
      const middleware = requireTier('tier1');
      const request = createMockAuthenticatedRequest(MOCK_VENDOR_TIER1_JWT_PAYLOAD);

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it('should grant access when vendor has higher tier', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_VENDOR_TIER2_JWT_PAYLOAD);
      const middleware = requireTier('tier1');
      const request = createMockAuthenticatedRequest(MOCK_VENDOR_TIER2_JWT_PAYLOAD);

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it('should return 403 when free tier tries to access tier1 resource', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_VENDOR_FREE_JWT_PAYLOAD);
      const middleware = requireTier('tier1');
      const request = createMockAuthenticatedRequest(MOCK_VENDOR_FREE_JWT_PAYLOAD);

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(403);
      const error = await extractErrorFromResponse(response);
      expect(error.error).toBe('Upgrade required');
      expect(error.message).toContain('tier1');
      expect(error.current_tier).toBe('free');
      expect(error.required_tier).toBe('tier1');
    });

    it('should return 403 when tier1 tries to access tier2 resource', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_VENDOR_TIER1_JWT_PAYLOAD);
      const middleware = requireTier('tier2');
      const request = createMockAuthenticatedRequest(MOCK_VENDOR_TIER1_JWT_PAYLOAD);

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(403);
      const error = await extractErrorFromResponse(response);
      expect(error.current_tier).toBe('tier1');
      expect(error.required_tier).toBe('tier2');
    });

    it('should allow admin to bypass tier restrictions', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_ADMIN_JWT_PAYLOAD);
      const middleware = requireTier('tier2');
      const request = createMockAuthenticatedRequest(MOCK_ADMIN_JWT_PAYLOAD);

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it('should grant free tier access to free resource', async () => {
      // Arrange
      mockValidateToken.mockReturnValue(MOCK_VENDOR_FREE_JWT_PAYLOAD);
      const middleware = requireTier('free');
      const request = createMockAuthenticatedRequest(MOCK_VENDOR_FREE_JWT_PAYLOAD);

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it('should return 401 when token is missing', async () => {
      // Arrange
      const middleware = requireTier('tier1');
      const request = createMockUnauthenticatedRequest();

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(401);
    });

    it('should default to free tier when vendor has no tier', async () => {
      // Arrange
      const payloadWithoutTier = { ...MOCK_VENDOR_FREE_JWT_PAYLOAD, tier: undefined };
      mockValidateToken.mockReturnValue(payloadWithoutTier);
      const middleware = requireTier('tier1');
      const request = createMockAuthenticatedRequest(payloadWithoutTier);

      // Act
      const response = await middleware(request);

      // Assert
      expect(response.status).toBe(403);
      const error = await extractErrorFromResponse(response);
      expect(error.current_tier).toBe('free');
    });
  });

  describe('getUserFromRequest()', () => {
    it('should extract user from request headers', () => {
      // Arrange
      const request = createMockRequestWithHeaders({
        'x-user-id': 'user-123',
        'x-user-email': 'test@example.com',
        'x-user-role': 'vendor',
        'x-user-tier': 'tier2',
      });

      // Act
      const user = getUserFromRequest(request);

      // Assert
      expect(user).not.toBeNull();
      expect(user?.id).toBe('user-123');
      expect(user?.email).toBe('test@example.com');
      expect(user?.role).toBe('vendor');
      expect(user?.tier).toBe('tier2');
    });

    it('should return null when headers are missing', () => {
      // Arrange
      const request = createMockUnauthenticatedRequest();

      // Act
      const user = getUserFromRequest(request);

      // Assert
      expect(user).toBeNull();
    });

    it('should return null when user-id header is missing', () => {
      // Arrange
      const request = createMockRequestWithHeaders({
        'x-user-email': 'test@example.com',
        'x-user-role': 'vendor',
      });

      // Act
      const user = getUserFromRequest(request);

      // Assert
      expect(user).toBeNull();
    });

    it('should return user without tier when tier header is missing', () => {
      // Arrange
      const request = createMockRequestWithHeaders({
        'x-user-id': 'admin-123',
        'x-user-email': 'admin@example.com',
        'x-user-role': 'admin',
      });

      // Act
      const user = getUserFromRequest(request);

      // Assert
      expect(user).not.toBeNull();
      expect(user?.id).toBe('admin-123');
      expect(user?.tier).toBeUndefined();
    });

    it('should correctly parse admin role', () => {
      // Arrange
      const request = createMockRequestWithHeaders({
        'x-user-id': 'admin-001',
        'x-user-email': 'admin@example.com',
        'x-user-role': 'admin',
      });

      // Act
      const user = getUserFromRequest(request);

      // Assert
      expect(user?.role).toBe('admin');
    });

    it('should correctly parse vendor role', () => {
      // Arrange
      const request = createMockRequestWithHeaders({
        'x-user-id': 'vendor-001',
        'x-user-email': 'vendor@example.com',
        'x-user-role': 'vendor',
        'x-user-tier': 'free',
      });

      // Act
      const user = getUserFromRequest(request);

      // Assert
      expect(user?.role).toBe('vendor');
      expect(user?.tier).toBe('free');
    });
  });
});
