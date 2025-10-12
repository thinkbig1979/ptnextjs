/**
 * @jest-environment node
 */

import {
  isAdmin,
  isVendor,
  isAuthenticated,
  isAdminOrSelf,
  hasTierAccess,
  canAccessTierField,
} from '@/payload/access/rbac';
import { mockPayloadVendorFindResponse, mockPayloadEmptyFindResponse } from '@/__tests__/utils/auth-helpers';
import {
  MOCK_ADMIN_USER,
  MOCK_VENDOR_TIER2,
  MOCK_VENDOR_TIER1,
  MOCK_VENDOR_FREE,
  MOCK_VENDOR_TIER2_DOC,
  MOCK_VENDOR_TIER1_DOC,
  MOCK_VENDOR_FREE_DOC,
} from '@/__tests__/fixtures/users';

describe('RBAC Access Control', () => {
  describe('isAdmin()', () => {
    it('should return true for admin user', () => {
      // Arrange
      const context = {
        req: {
          user: { ...MOCK_ADMIN_USER, role: 'admin' as const },
        },
      };

      // Act
      const result = isAdmin(context as any);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for vendor user', () => {
      // Arrange
      const context = {
        req: {
          user: { ...MOCK_VENDOR_TIER2, role: 'vendor' as const },
        },
      };

      // Act
      const result = isAdmin(context as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for unauthenticated user', () => {
      // Arrange
      const context = {
        req: {
          user: null,
        },
      };

      // Act
      const result = isAdmin(context as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when user is undefined', () => {
      // Arrange
      const context = {
        req: {
          user: undefined,
        },
      };

      // Act
      const result = isAdmin(context as any);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isVendor()', () => {
    it('should return true for vendor user', () => {
      // Arrange
      const context = {
        req: {
          user: { ...MOCK_VENDOR_TIER1, role: 'vendor' as const },
        },
      };

      // Act
      const result = isVendor(context as any);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for admin user', () => {
      // Arrange
      const context = {
        req: {
          user: { ...MOCK_ADMIN_USER, role: 'admin' as const },
        },
      };

      // Act
      const result = isVendor(context as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for unauthenticated user', () => {
      // Arrange
      const context = {
        req: {
          user: null,
        },
      };

      // Act
      const result = isVendor(context as any);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isAuthenticated()', () => {
    it('should return true for admin user', () => {
      // Arrange
      const context = {
        req: {
          user: { ...MOCK_ADMIN_USER, role: 'admin' as const },
        },
      };

      // Act
      const result = isAuthenticated(context as any);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for vendor user', () => {
      // Arrange
      const context = {
        req: {
          user: { ...MOCK_VENDOR_FREE, role: 'vendor' as const },
        },
      };

      // Act
      const result = isAuthenticated(context as any);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for unauthenticated user (null)', () => {
      // Arrange
      const context = {
        req: {
          user: null,
        },
      };

      // Act
      const result = isAuthenticated(context as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for unauthenticated user (undefined)', () => {
      // Arrange
      const context = {
        req: {
          user: undefined,
        },
      };

      // Act
      const result = isAuthenticated(context as any);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('isAdminOrSelf()', () => {
    it('should return true when admin accesses any resource', () => {
      // Arrange
      const context = {
        req: {
          user: { id: MOCK_ADMIN_USER.id, role: 'admin' as const },
        },
        id: 'some-other-user-id',
      };

      // Act
      const result = isAdminOrSelf(context as any);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when vendor accesses own resource', () => {
      // Arrange
      const context = {
        req: {
          user: { id: MOCK_VENDOR_TIER2.id, role: 'vendor' as const },
        },
        id: MOCK_VENDOR_TIER2.id,
      };

      // Act
      const result = isAdminOrSelf(context as any);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when vendor accesses another vendor resource', () => {
      // Arrange
      const context = {
        req: {
          user: { id: MOCK_VENDOR_TIER1.id, role: 'vendor' as const },
        },
        id: MOCK_VENDOR_TIER2.id,
      };

      // Act
      const result = isAdminOrSelf(context as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for unauthenticated user', () => {
      // Arrange
      const context = {
        req: {
          user: null,
        },
        id: 'some-user-id',
      };

      // Act
      const result = isAdminOrSelf(context as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when user id is undefined', () => {
      // Arrange
      const context = {
        req: {
          user: { id: undefined, role: 'vendor' as const },
        },
        id: 'some-user-id',
      };

      // Act
      const result = isAdminOrSelf(context as any);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('hasTierAccess()', () => {
    it('should grant admin access to all tiers', async () => {
      // Arrange
      const mockPayload = {
        find: jest.fn(),
      };
      const context = {
        req: {
          user: { id: MOCK_ADMIN_USER.id, role: 'admin' as const },
          payload: mockPayload,
        },
      };

      // Act
      const resultFree = await hasTierAccess('free')(context as any);
      const resultTier1 = await hasTierAccess('tier1')(context as any);
      const resultTier2 = await hasTierAccess('tier2')(context as any);

      // Assert
      expect(resultFree).toBe(true);
      expect(resultTier1).toBe(true);
      expect(resultTier2).toBe(true);
      expect(mockPayload.find).not.toHaveBeenCalled(); // Admin bypass
    });

    it('should grant tier2 vendor access to tier2, tier1, and free', async () => {
      // Arrange
      const mockPayload = {
        find: jest.fn().mockResolvedValue(mockPayloadVendorFindResponse(MOCK_VENDOR_TIER2_DOC)),
      };
      const context = {
        req: {
          user: { id: MOCK_VENDOR_TIER2.id, role: 'vendor' as const },
          payload: mockPayload,
        },
      };

      // Act
      const resultFree = await hasTierAccess('free')(context as any);
      const resultTier1 = await hasTierAccess('tier1')(context as any);
      const resultTier2 = await hasTierAccess('tier2')(context as any);

      // Assert
      expect(resultFree).toBe(true);
      expect(resultTier1).toBe(true);
      expect(resultTier2).toBe(true);
    });

    it('should grant tier1 vendor access to tier1 and free only', async () => {
      // Arrange
      const mockPayload = {
        find: jest.fn().mockResolvedValue(mockPayloadVendorFindResponse(MOCK_VENDOR_TIER1_DOC)),
      };
      const context = {
        req: {
          user: { id: MOCK_VENDOR_TIER1.id, role: 'vendor' as const },
          payload: mockPayload,
        },
      };

      // Act
      const resultFree = await hasTierAccess('free')(context as any);
      const resultTier1 = await hasTierAccess('tier1')(context as any);
      const resultTier2 = await hasTierAccess('tier2')(context as any);

      // Assert
      expect(resultFree).toBe(true);
      expect(resultTier1).toBe(true);
      expect(resultTier2).toBe(false);
    });

    it('should grant free tier vendor access to free only', async () => {
      // Arrange
      const mockPayload = {
        find: jest.fn().mockResolvedValue(mockPayloadVendorFindResponse(MOCK_VENDOR_FREE_DOC)),
      };
      const context = {
        req: {
          user: { id: MOCK_VENDOR_FREE.id, role: 'vendor' as const },
          payload: mockPayload,
        },
      };

      // Act
      const resultFree = await hasTierAccess('free')(context as any);
      const resultTier1 = await hasTierAccess('tier1')(context as any);
      const resultTier2 = await hasTierAccess('tier2')(context as any);

      // Assert
      expect(resultFree).toBe(true);
      expect(resultTier1).toBe(false);
      expect(resultTier2).toBe(false);
    });

    it('should return false for unauthenticated user', async () => {
      // Arrange
      const mockPayload = {
        find: jest.fn(),
      };
      const context = {
        req: {
          user: null,
          payload: mockPayload,
        },
      };

      // Act
      const result = await hasTierAccess('free')(context as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for non-vendor user', async () => {
      // Arrange
      const mockPayload = {
        find: jest.fn(),
      };
      const context = {
        req: {
          user: { id: 'some-user', role: 'other' as any },
          payload: mockPayload,
        },
      };

      // Act
      const result = await hasTierAccess('tier1')(context as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when vendor document not found', async () => {
      // Arrange
      const mockPayload = {
        find: jest.fn().mockResolvedValue(mockPayloadEmptyFindResponse()),
      };
      const context = {
        req: {
          user: { id: MOCK_VENDOR_FREE.id, role: 'vendor' as const },
          payload: mockPayload,
        },
      };

      // Act
      const result = await hasTierAccess('tier1')(context as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should fetch vendor document with correct query', async () => {
      // Arrange
      const mockPayload = {
        find: jest.fn().mockResolvedValue(mockPayloadVendorFindResponse(MOCK_VENDOR_TIER1_DOC)),
      };
      const context = {
        req: {
          user: { id: MOCK_VENDOR_TIER1.id, role: 'vendor' as const },
          payload: mockPayload,
        },
      };

      // Act
      await hasTierAccess('tier1')(context as any);

      // Assert
      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'vendors',
        where: {
          user: {
            equals: MOCK_VENDOR_TIER1.id,
          },
        },
      });
    });
  });

  describe('canAccessTierField()', () => {
    it('should grant admin access to all tier fields', async () => {
      // Arrange
      const context = {
        req: {
          user: { id: MOCK_ADMIN_USER.id, role: 'admin' as const },
        },
        data: {},
      };

      // Act
      const resultFree = await canAccessTierField('free')(context as any);
      const resultTier1 = await canAccessTierField('tier1')(context as any);
      const resultTier2 = await canAccessTierField('tier2')(context as any);

      // Assert
      expect(resultFree).toBe(true);
      expect(resultTier1).toBe(true);
      expect(resultTier2).toBe(true);
    });

    it('should grant vendor access to matching tier field', async () => {
      // Arrange
      const context = {
        req: {
          user: { id: MOCK_VENDOR_TIER1.id, role: 'vendor' as const },
        },
        data: { tier: 'tier1' },
      };

      // Act
      const result = await canAccessTierField('tier1')(context as any);

      // Assert
      expect(result).toBe(true);
    });

    it('should grant vendor with higher tier access to lower tier field', async () => {
      // Arrange
      const context = {
        req: {
          user: { id: MOCK_VENDOR_TIER2.id, role: 'vendor' as const },
        },
        data: { tier: 'tier2' },
      };

      // Act
      const resultFree = await canAccessTierField('free')(context as any);
      const resultTier1 = await canAccessTierField('tier1')(context as any);

      // Assert
      expect(resultFree).toBe(true);
      expect(resultTier1).toBe(true);
    });

    it('should deny vendor with lower tier access to higher tier field', async () => {
      // Arrange
      const context = {
        req: {
          user: { id: MOCK_VENDOR_FREE.id, role: 'vendor' as const },
        },
        data: { tier: 'free' },
      };

      // Act
      const resultTier1 = await canAccessTierField('tier1')(context as any);
      const resultTier2 = await canAccessTierField('tier2')(context as any);

      // Assert
      expect(resultTier1).toBe(false);
      expect(resultTier2).toBe(false);
    });

    it('should return false for unauthenticated user', async () => {
      // Arrange
      const context = {
        req: {
          user: null,
        },
        data: {},
      };

      // Act
      const result = await canAccessTierField('free')(context as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for non-vendor user', async () => {
      // Arrange
      const context = {
        req: {
          user: { id: 'some-user', role: 'other' as any },
        },
        data: {},
      };

      // Act
      const result = await canAccessTierField('tier1')(context as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should default to free tier when data.tier is undefined', async () => {
      // Arrange
      const context = {
        req: {
          user: { id: MOCK_VENDOR_FREE.id, role: 'vendor' as const },
        },
        data: {},
      };

      // Act
      const resultFree = await canAccessTierField('free')(context as any);
      const resultTier1 = await canAccessTierField('tier1')(context as any);

      // Assert
      expect(resultFree).toBe(true);
      expect(resultTier1).toBe(false);
    });
  });
});
