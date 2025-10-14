/**
 * @jest-environment node
 */

import { authService } from '@/lib/services/auth-service';
import { generateTestToken, mockPayloadUserFindResponse, mockPayloadEmptyFindResponse, mockPayloadVendorFindResponse } from '@/__tests__/utils/auth-helpers';
import {
  MOCK_ADMIN_USER,
  MOCK_VENDOR_TIER2,
  MOCK_VENDOR_TIER1,
  MOCK_VENDOR_FREE,
  MOCK_VENDOR_PENDING,
  MOCK_VENDOR_REJECTED,
  MOCK_VENDOR_TIER2_DOC,
  MOCK_VENDOR_TIER1_DOC,
  MOCK_VENDOR_FREE_DOC,
  TEST_PASSWORDS,
} from '@/__tests__/fixtures/users';
import type { JWTPayload } from '@/lib/utils/jwt';
import bcrypt from 'bcryptjs';

// Mock Payload CMS
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));

// Mock Payload config to avoid importing ES modules
jest.mock('@/payload.config', () => ({
  default: {},
}));

// Mock JWT utilities
jest.mock('@/lib/utils/jwt', () => ({
  generateTokens: jest.fn(),
  verifyToken: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

import { getPayload } from 'payload';
import * as jwtUtils from '@/lib/utils/jwt';

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;
const mockGenerateTokens = jwtUtils.generateTokens as jest.MockedFunction<typeof jwtUtils.generateTokens>;
const mockVerifyToken = jwtUtils.verifyToken as jest.MockedFunction<typeof jwtUtils.verifyToken>;
const mockRefreshAccessToken = jwtUtils.refreshAccessToken as jest.MockedFunction<typeof jwtUtils.refreshAccessToken>;

describe('AuthService', () => {
  let mockPayload: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock Payload instance
    mockPayload = {
      find: jest.fn(),
    };

    mockGetPayload.mockResolvedValue(mockPayload as any);
  });

  describe('login()', () => {
    it('should successfully login with valid admin credentials', async () => {
      // Arrange
      mockPayload.find
        .mockResolvedValueOnce(mockPayloadUserFindResponse(MOCK_ADMIN_USER)); // User lookup

      mockGenerateTokens.mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      // Act
      const result = await authService.login(MOCK_ADMIN_USER.email, TEST_PASSWORDS.ADMIN);

      // Assert
      expect(result).toEqual({
        user: {
          id: MOCK_ADMIN_USER.id,
          email: MOCK_ADMIN_USER.email,
          role: 'admin',
          tier: undefined,
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });
      expect(mockGenerateTokens).toHaveBeenCalledWith({
        id: MOCK_ADMIN_USER.id,
        email: MOCK_ADMIN_USER.email,
        role: 'admin',
        tier: undefined,
      });
    });

    it('should successfully login vendor and include tier information', async () => {
      // Arrange
      mockPayload.find
        .mockResolvedValueOnce(mockPayloadUserFindResponse(MOCK_VENDOR_TIER2)) // User lookup
        .mockResolvedValueOnce(mockPayloadVendorFindResponse(MOCK_VENDOR_TIER2_DOC)); // Vendor lookup

      mockGenerateTokens.mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      // Act
      const result = await authService.login(MOCK_VENDOR_TIER2.email, TEST_PASSWORDS.VENDOR_TIER2);

      // Assert
      expect(result.user.tier).toBe('tier2');
      expect(result.user.role).toBe('vendor');
      expect(mockPayload.find).toHaveBeenCalledTimes(2); // User + Vendor lookup
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      mockPayload.find.mockResolvedValueOnce(mockPayloadEmptyFindResponse());

      // Act & Assert
      await expect(
        authService.login('nonexistent@example.com', 'AnyPassword123!@#')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      // Arrange
      mockPayload.find.mockResolvedValueOnce(mockPayloadUserFindResponse(MOCK_ADMIN_USER));

      // Act & Assert
      await expect(
        authService.login(MOCK_ADMIN_USER.email, 'WrongPassword123!@#')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for pending vendor', async () => {
      // Arrange
      mockPayload.find.mockResolvedValueOnce(mockPayloadUserFindResponse(MOCK_VENDOR_PENDING));

      // Act & Assert
      await expect(
        authService.login(MOCK_VENDOR_PENDING.email, TEST_PASSWORDS.PENDING)
      ).rejects.toThrow('Account pending approval');
    });

    it('should throw error for rejected vendor', async () => {
      // Arrange
      mockPayload.find.mockResolvedValueOnce(mockPayloadUserFindResponse(MOCK_VENDOR_REJECTED));

      // Act & Assert
      await expect(
        authService.login(MOCK_VENDOR_REJECTED.email, TEST_PASSWORDS.REJECTED)
      ).rejects.toThrow('Account pending approval');
    });

    it('should allow admin login regardless of status', async () => {
      // Arrange
      const adminWithPendingStatus = { ...MOCK_ADMIN_USER, status: 'pending' };
      mockPayload.find.mockResolvedValueOnce(mockPayloadUserFindResponse(adminWithPendingStatus));

      mockGenerateTokens.mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      // Act
      const result = await authService.login(adminWithPendingStatus.email, TEST_PASSWORDS.ADMIN);

      // Assert
      expect(result.user.role).toBe('admin');
      expect(result.tokens).toBeDefined();
    });

    it('should default to free tier if vendor has no tier', async () => {
      // Arrange
      const vendorNoTier = { ...MOCK_VENDOR_FREE, tier: undefined };
      mockPayload.find
        .mockResolvedValueOnce(mockPayloadUserFindResponse(vendorNoTier))
        .mockResolvedValueOnce(mockPayloadVendorFindResponse({ ...MOCK_VENDOR_FREE_DOC, tier: undefined }));

      mockGenerateTokens.mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      // Act
      const result = await authService.login(vendorNoTier.email, TEST_PASSWORDS.VENDOR_FREE);

      // Assert
      expect(result.user.tier).toBe('free');
    });

    it('should log authentication failures for security monitoring', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPayload.find.mockResolvedValueOnce(mockPayloadEmptyFindResponse());

      // Act
      try {
        await authService.login('hacker@example.com', 'HackAttempt123!@#');
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        '[AuthService] Login failed:',
        expect.objectContaining({
          email: 'hacker@example.com',
          error: 'Invalid credentials',
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('validateToken()', () => {
    it('should return decoded payload for valid token', () => {
      // Arrange
      const mockPayload: JWTPayload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin',
      };
      mockVerifyToken.mockReturnValue(mockPayload);

      // Act
      const result = authService.validateToken('valid-token');

      // Assert
      expect(result).toEqual(mockPayload);
      expect(mockVerifyToken).toHaveBeenCalledWith('valid-token');
    });

    it('should throw error for expired token', () => {
      // Arrange
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Token expired');
      });

      // Act & Assert
      expect(() => authService.validateToken('expired-token')).toThrow('Token expired');
    });

    it('should throw error for invalid token', () => {
      // Arrange
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      expect(() => authService.validateToken('invalid-token')).toThrow('Invalid token');
    });

    it('should throw error for tampered token', () => {
      // Arrange
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      expect(() => authService.validateToken('tampered.token.signature')).toThrow('Invalid token');
    });
  });

  describe('refreshToken()', () => {
    it('should generate new access token from valid refresh token', () => {
      // Arrange
      mockRefreshAccessToken.mockReturnValue('new-access-token');

      // Act
      const result = authService.refreshToken('valid-refresh-token');

      // Assert
      expect(result).toBe('new-access-token');
      expect(mockRefreshAccessToken).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should throw error for expired refresh token', () => {
      // Arrange
      mockRefreshAccessToken.mockImplementation(() => {
        throw new Error('Token expired');
      });

      // Act & Assert
      expect(() => authService.refreshToken('expired-refresh-token')).toThrow('Token expired');
    });

    it('should throw error for invalid refresh token', () => {
      // Arrange
      mockRefreshAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      expect(() => authService.refreshToken('invalid-refresh-token')).toThrow('Invalid token');
    });
  });

  describe('hashPassword()', () => {
    it('should hash password with bcrypt', async () => {
      // Act
      const hash = await authService.hashPassword('StrongPassword123!@#');

      // Assert
      expect(hash).toBeDefined();
      expect(hash).not.toBe('StrongPassword123!@#');
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
    });

    it('should use 12 bcrypt rounds', async () => {
      // Act
      const hash = await authService.hashPassword('StrongPassword123!@#');

      // Assert
      const rounds = hash.split('$')[2];
      expect(rounds).toBe('12');
    });

    it('should produce different hashes for same password (salt verification)', async () => {
      // Act
      const hash1 = await authService.hashPassword('StrongPassword123!@#');
      const hash2 = await authService.hashPassword('StrongPassword123!@#');

      // Assert
      expect(hash1).not.toBe(hash2);
    });

    it('should throw error for password shorter than 12 characters', async () => {
      // Act & Assert
      await expect(authService.hashPassword('Short1!@#')).rejects.toThrow(
        'Password must be at least 12 characters long'
      );
    });

    it('should throw error for password without uppercase', async () => {
      // Act & Assert
      await expect(authService.hashPassword('nouppercase123!@#')).rejects.toThrow(
        'Password must contain uppercase, lowercase, number, and special character'
      );
    });

    it('should throw error for password without lowercase', async () => {
      // Act & Assert
      await expect(authService.hashPassword('NOLOWERCASE123!@#')).rejects.toThrow(
        'Password must contain uppercase, lowercase, number, and special character'
      );
    });

    it('should throw error for password without number', async () => {
      // Act & Assert
      await expect(authService.hashPassword('NoNumberHere!@#')).rejects.toThrow(
        'Password must contain uppercase, lowercase, number, and special character'
      );
    });

    it('should throw error for password without special character', async () => {
      // Act & Assert
      await expect(authService.hashPassword('NoSpecialChar123')).rejects.toThrow(
        'Password must contain uppercase, lowercase, number, and special character'
      );
    });
  });

  describe('comparePassword()', () => {
    it('should return true for matching password', async () => {
      // Arrange
      const password = 'MatchingPassword123!@#';
      const hash = await bcrypt.hash(password, 12);

      // Act
      const result = await authService.comparePassword(password, hash);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      // Arrange
      const password = 'CorrectPassword123!@#';
      const hash = await bcrypt.hash(password, 12);

      // Act
      const result = await authService.comparePassword('WrongPassword123!@#', hash);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      // Arrange
      const hash = await bcrypt.hash('SomePassword123!@#', 12);

      // Act
      const result = await authService.comparePassword('', hash);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for invalid hash', async () => {
      // Act
      const result = await authService.comparePassword('SomePassword123!@#', 'invalid-hash');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('checkPermission()', () => {
    it('should grant admin all permissions', async () => {
      // Arrange
      const adminPayload: JWTPayload = {
        id: 'admin-001',
        email: 'admin@test.com',
        role: 'admin',
      };

      // Act & Assert
      expect(await authService.checkPermission(adminPayload, 'read', 'products')).toBe(true);
      expect(await authService.checkPermission(adminPayload, 'create', 'products')).toBe(true);
      expect(await authService.checkPermission(adminPayload, 'update', 'vendors')).toBe(true);
      expect(await authService.checkPermission(adminPayload, 'delete', 'blog-posts')).toBe(true);
    });

    it('should allow vendor to read public resources', async () => {
      // Arrange
      const vendorPayload: JWTPayload = {
        id: 'vendor-001',
        email: 'vendor@test.com',
        role: 'vendor',
        tier: 'free',
      };

      // Act & Assert
      expect(await authService.checkPermission(vendorPayload, 'read', 'products')).toBe(true);
      expect(await authService.checkPermission(vendorPayload, 'read', 'vendors')).toBe(true);
      expect(await authService.checkPermission(vendorPayload, 'read', 'categories')).toBe(true);
      expect(await authService.checkPermission(vendorPayload, 'read', 'blog-posts')).toBe(true);
    });

    it('should allow vendor to manage their own vendor profile', async () => {
      // Arrange
      const vendorPayload: JWTPayload = {
        id: 'vendor-001',
        email: 'vendor@test.com',
        role: 'vendor',
        tier: 'free',
      };

      // Act & Assert
      expect(await authService.checkPermission(vendorPayload, 'read', 'vendor')).toBe(true);
      expect(await authService.checkPermission(vendorPayload, 'update', 'vendor')).toBe(true);
    });

    it('should allow tier2 vendor to create products', async () => {
      // Arrange
      const tier2Payload: JWTPayload = {
        id: 'vendor-tier2',
        email: 'vendor.tier2@test.com',
        role: 'vendor',
        tier: 'tier2',
      };

      // Act & Assert
      expect(await authService.checkPermission(tier2Payload, 'create', 'products')).toBe(true);
    });

    it('should allow tier2 vendor to manage their own products', async () => {
      // Arrange
      const tier2Payload: JWTPayload = {
        id: 'vendor-tier2',
        email: 'vendor.tier2@test.com',
        role: 'vendor',
        tier: 'tier2',
      };

      // Act & Assert
      expect(await authService.checkPermission(tier2Payload, 'update', 'products')).toBe(true);
      expect(await authService.checkPermission(tier2Payload, 'delete', 'products')).toBe(true);
    });

    it('should deny free tier vendor from creating products', async () => {
      // Arrange
      const freePayload: JWTPayload = {
        id: 'vendor-free',
        email: 'vendor.free@test.com',
        role: 'vendor',
        tier: 'free',
      };

      // Act & Assert
      expect(await authService.checkPermission(freePayload, 'create', 'products')).toBe(false);
    });

    it('should deny tier1 vendor from creating products', async () => {
      // Arrange
      const tier1Payload: JWTPayload = {
        id: 'vendor-tier1',
        email: 'vendor.tier1@test.com',
        role: 'vendor',
        tier: 'tier1',
      };

      // Act & Assert
      expect(await authService.checkPermission(tier1Payload, 'create', 'products')).toBe(false);
    });

    it('should deny vendor access to admin-only resources', async () => {
      // Arrange
      const vendorPayload: JWTPayload = {
        id: 'vendor-001',
        email: 'vendor@test.com',
        role: 'vendor',
        tier: 'tier2',
      };

      // Act & Assert
      expect(await authService.checkPermission(vendorPayload, 'create', 'users')).toBe(false);
      expect(await authService.checkPermission(vendorPayload, 'delete', 'vendors')).toBe(false);
    });
  });
});
