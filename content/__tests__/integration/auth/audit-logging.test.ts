/**
 * Audit Logging Integration Tests
 * Tests for auth event audit trail
 *
 * This integration test suite verifies that authentication operations
 * correctly create audit log entries with proper event types, metadata,
 * and contextual information.
 *
 * IMPORTANT: These tests are EXPECTED TO FAIL initially (RED phase).
 * The implementation tasks (impl-audit-collection, impl-audit-service, integ-audit-routes)
 * will make them pass.
 *
 * @group integration
 * @group auth
 * @group tdd-red
 */

import { describe, it, expect, jest, beforeAll, beforeEach } from '@jest/globals';

// Mock Payload CMS
const mockPayload = {
  create: jest.fn(),
  find: jest.fn(),
  collections: {
    'audit-logs': {
      find: jest.fn(),
    },
  },
};

jest.mock('payload', () => ({
  getPayload: jest.fn(() => mockPayload),
}));

describe('Audit Logging Integration', () => {
  let mockCreate: jest.Mock;
  let mockFind: jest.Mock;

  beforeAll(() => {
    // Setup mock references
    mockCreate = mockPayload.create as jest.Mock;
    mockFind = mockPayload.find as jest.Mock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Events', () => {
    it('should create LOGIN_SUCCESS entry on successful login', async () => {
      // Simulate successful login
      mockCreate.mockResolvedValueOnce({ id: 'audit-1' });

      const { logLoginSuccess } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.100',
          'user-agent': 'Mozilla/5.0 Chrome/123.0.0.0',
        }),
      } as any;

      await logLoginSuccess('user-123', 'vendor@example.com', 'token-xyz', mockRequest);

      // Verify audit log was created
      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: {
          event: 'LOGIN_SUCCESS',
          userId: 'user-123',
          email: 'vendor@example.com',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Chrome/123.0.0.0',
          metadata: { tokenId: 'token-xyz' },
        },
      });
    });

    it('should create LOGIN_FAILED entry on failed login with reason', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'audit-2' });

      const { logLoginFailed } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.101',
          'user-agent': 'Mozilla/5.0 Firefox/120.0',
        }),
      } as any;

      await logLoginFailed('wrong@example.com', 'Invalid credentials', mockRequest);

      // Verify audit log captures failure reason
      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: {
          event: 'LOGIN_FAILED',
          email: 'wrong@example.com',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 Firefox/120.0',
          metadata: { reason: 'Invalid credentials' },
        },
      });
    });

    it('should capture different failure reasons', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'audit-3' });

      const { logLoginFailed } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.102',
          'user-agent': 'Safari/17.0',
        }),
      } as any;

      await logLoginFailed('suspended@example.com', 'Account suspended', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          event: 'LOGIN_FAILED',
          metadata: { reason: 'Account suspended' },
        }),
      });
    });
  });

  describe('Logout Events', () => {
    it('should create LOGOUT entry on logout', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'audit-4' });

      const { logLogout } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.103',
          'user-agent': 'Edge/120.0',
        }),
      } as any;

      await logLogout('user-456', 'user@example.com', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: {
          event: 'LOGOUT',
          userId: 'user-456',
          email: 'user@example.com',
          ipAddress: '192.168.1.103',
          userAgent: 'Edge/120.0',
        },
      });
    });

    it('should capture user context on logout', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'audit-5' });

      const { logLogout } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '203.0.113.50',
          'user-agent': 'Mobile Safari/17.0',
        }),
      } as any;

      await logLogout('user-789', 'logout@example.com', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          event: 'LOGOUT',
          userId: 'user-789',
          email: 'logout@example.com',
          ipAddress: '203.0.113.50',
        }),
      });
    });
  });

  describe('Token Refresh Events', () => {
    it('should create TOKEN_REFRESH entry on token refresh', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'audit-6' });

      const { logTokenRefresh } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.104',
          'user-agent': 'Chrome/123.0.0.0',
        }),
      } as any;

      await logTokenRefresh('user-111', 'refresh@example.com', 'new-token-abc', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: {
          event: 'TOKEN_REFRESH',
          userId: 'user-111',
          email: 'refresh@example.com',
          ipAddress: '192.168.1.104',
          userAgent: 'Chrome/123.0.0.0',
          metadata: { tokenId: 'new-token-abc' },
        },
      });
    });

    it('should capture new token ID in metadata', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'audit-7' });

      const { logTokenRefresh } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.105',
          'user-agent': 'Firefox/120.0',
        }),
      } as any;

      await logTokenRefresh('user-222', 'token@example.com', 'rotated-token-xyz', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          event: 'TOKEN_REFRESH',
          metadata: { tokenId: 'rotated-token-xyz' },
        }),
      });
    });

    it('should track token rotation chain', async () => {
      // Simulate multiple token refreshes
      mockCreate.mockResolvedValueOnce({ id: 'audit-8' });
      mockCreate.mockResolvedValueOnce({ id: 'audit-9' });

      const { logTokenRefresh } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.106',
          'user-agent': 'Safari/17.0',
        }),
      } as any;

      // First refresh
      await logTokenRefresh('user-333', 'chain@example.com', 'token-v1', mockRequest);

      // Second refresh
      await logTokenRefresh('user-333', 'chain@example.com', 'token-v2', mockRequest);

      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(mockCreate).toHaveBeenNthCalledWith(1, {
        collection: 'audit-logs',
        data: expect.objectContaining({
          metadata: { tokenId: 'token-v1' },
        }),
      });
      expect(mockCreate).toHaveBeenNthCalledWith(2, {
        collection: 'audit-logs',
        data: expect.objectContaining({
          metadata: { tokenId: 'token-v2' },
        }),
      });
    });
  });

  describe('Account Status Events', () => {
    it('should create ACCOUNT_SUSPENDED entry when account suspended', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'audit-10' });

      const { logAuditEvent } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '10.0.0.1',
          'user-agent': 'Admin Panel',
        }),
      } as any;

      await logAuditEvent(
        {
          event: 'ACCOUNT_SUSPENDED',
          userId: 'user-suspended',
          email: 'suspended@example.com',
          metadata: {
            adminId: 'admin-123',
            reason: 'Terms violation',
          },
        },
        mockRequest
      );

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: {
          event: 'ACCOUNT_SUSPENDED',
          userId: 'user-suspended',
          email: 'suspended@example.com',
          ipAddress: '10.0.0.1',
          userAgent: 'Admin Panel',
          metadata: {
            adminId: 'admin-123',
            reason: 'Terms violation',
          },
        },
      });
    });

    it('should create ACCOUNT_APPROVED entry when account approved', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'audit-11' });

      const { logAuditEvent } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '10.0.0.2',
          'user-agent': 'Admin Panel',
        }),
      } as any;

      await logAuditEvent(
        {
          event: 'ACCOUNT_APPROVED',
          userId: 'user-approved',
          email: 'approved@example.com',
          metadata: {
            adminId: 'admin-456',
          },
        },
        mockRequest
      );

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          event: 'ACCOUNT_APPROVED',
          metadata: { adminId: 'admin-456' },
        }),
      });
    });

    it('should create ACCOUNT_REJECTED entry when account rejected', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'audit-12' });

      const { logAuditEvent } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '10.0.0.3',
          'user-agent': 'Admin Panel',
        }),
      } as any;

      await logAuditEvent(
        {
          event: 'ACCOUNT_REJECTED',
          email: 'rejected@example.com',
          metadata: {
            adminId: 'admin-789',
            reason: 'Incomplete information',
          },
        },
        mockRequest
      );

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          event: 'ACCOUNT_REJECTED',
          metadata: {
            adminId: 'admin-789',
            reason: 'Incomplete information',
          },
        }),
      });
    });
  });

  describe('Password Change Events', () => {
    it('should create PASSWORD_CHANGED entry when password is changed', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'audit-13' });

      const { logAuditEvent } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.200',
          'user-agent': 'Chrome/123.0.0.0',
        }),
      } as any;

      await logAuditEvent(
        {
          event: 'PASSWORD_CHANGED',
          userId: 'user-pwd-change',
          email: 'pwdchange@example.com',
        },
        mockRequest
      );

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: {
          event: 'PASSWORD_CHANGED',
          userId: 'user-pwd-change',
          email: 'pwdchange@example.com',
          ipAddress: '192.168.1.200',
          userAgent: 'Chrome/123.0.0.0',
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockCreate.mockRejectedValueOnce(new Error('Database unavailable'));

      const { logLoginSuccess } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.250',
          'user-agent': 'Test Agent',
        }),
      } as any;

      // Should not throw
      await expect(
        logLoginSuccess('user-error', 'error@example.com', 'token-error', mockRequest)
      ).resolves.not.toThrow();

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create audit log:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should continue operations even if audit logging fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockCreate.mockRejectedValue(new Error('Network timeout'));

      const { logLoginSuccess, logLogout } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.251',
          'user-agent': 'Test Agent',
        }),
      } as any;

      // Multiple operations should all complete without throwing
      await expect(
        logLoginSuccess('user-1', 'user1@example.com', 'token-1', mockRequest)
      ).resolves.not.toThrow();

      await expect(
        logLogout('user-2', 'user2@example.com', mockRequest)
      ).resolves.not.toThrow();

      // Both should have logged errors but not thrown
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Metadata Capture', () => {
    it('should preserve custom metadata fields', async () => {
      mockCreate.mockResolvedValueOnce({ id: 'audit-14' });

      const { logAuditEvent } = await import('@/lib/services/audit-service');

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.300',
          'user-agent': 'Custom Client',
        }),
      } as any;

      await logAuditEvent(
        {
          event: 'LOGIN_SUCCESS',
          userId: 'user-custom',
          email: 'custom@example.com',
          metadata: {
            tokenId: 'token-custom',
            sessionId: 'session-xyz',
            clientVersion: '1.2.3',
            deviceId: 'device-abc',
          },
        },
        mockRequest
      );

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          metadata: {
            tokenId: 'token-custom',
            sessionId: 'session-xyz',
            clientVersion: '1.2.3',
            deviceId: 'device-abc',
          },
        }),
      });
    });
  });
});
