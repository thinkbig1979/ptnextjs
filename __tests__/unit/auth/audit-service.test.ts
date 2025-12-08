/**
 * Audit Service Test Suite
 * TDD RED Phase: Tests for audit logging service
 *
 * This test suite verifies the audit logging functionality including:
 * - Core audit event logging with proper fields
 * - IP address extraction from headers
 * - Helper functions for specific auth events
 * - Best-effort error handling (no throwing)
 *
 * IMPORTANT: These tests are EXPECTED TO FAIL initially (RED phase).
 * The implementation tasks (impl-audit-collection, impl-audit-service, integ-audit-routes)
 * will make them pass.
 *
 * @group unit
 * @group auth
 * @group tdd-red
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import type {
  AuditEvent,
  AuditLogEntry,
} from '@/lib/services/audit-service';

// Mock Payload CMS
const mockPayload = {
  create: jest.fn(),
};

jest.mock('payload', () => ({
  getPayload: jest.fn(() => mockPayload),
  buildConfig: jest.fn((config) => config),
}));

// Mock the payload config to prevent buildConfig errors
jest.mock('@/payload.config', () => ({
  default: {},
  __esModule: true,
}));

describe('AuditService', () => {
  let mockCreate: jest.Mock;

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock Payload instance
    mockCreate = mockPayload.create as jest.Mock;
    mockCreate.mockResolvedValue({ id: 'audit-log-123' });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      const { getClientIp } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.100, 10.0.0.1',
        }),
      } as unknown as NextRequest;

      const ip = getClientIp(mockRequest);
      expect(ip).toBe('192.168.1.100');
    });

    it('should use x-real-ip header as fallback', async () => {
      const { getClientIp } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-real-ip': '192.168.1.200',
        }),
      } as unknown as NextRequest;

      const ip = getClientIp(mockRequest);
      expect(ip).toBe('192.168.1.200');
    });

    it('should prioritize x-forwarded-for over x-real-ip', async () => {
      const { getClientIp } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.100',
          'x-real-ip': '192.168.1.200',
        }),
      } as unknown as NextRequest;

      const ip = getClientIp(mockRequest);
      expect(ip).toBe('192.168.1.100');
    });

    it('should handle missing IP headers gracefully', async () => {
      const { getClientIp } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({}),
      } as unknown as NextRequest;

      const ip = getClientIp(mockRequest);
      expect(ip).toBeUndefined();
    });
  });

  describe('logAuditEvent', () => {
    it('should create audit log entry with correct fields', async () => {
      const { logAuditEvent } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0 Test Agent',
        }),
      } as unknown as NextRequest;

      const entry: AuditLogEntry = {
        event: 'LOGIN_SUCCESS',
        userId: 'user-123',
        email: 'test@example.com',
        metadata: { tokenId: 'token-abc' },
      };

      await logAuditEvent(entry, mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: {
          event: 'LOGIN_SUCCESS',
          userId: 'user-123',
          email: 'test@example.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 Test Agent',
          metadata: { tokenId: 'token-abc' },
        },
      });
    });

    it('should extract IP from x-forwarded-for header', async () => {
      const { logAuditEvent } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '203.0.113.50, 10.0.0.1',
          'user-agent': 'Test Agent',
        }),
      } as unknown as NextRequest;

      const entry: AuditLogEntry = {
        event: 'LOGIN_SUCCESS',
        email: 'test@example.com',
      };

      await logAuditEvent(entry, mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          ipAddress: '203.0.113.50',
        }),
      });
    });

    it('should use x-real-ip as fallback', async () => {
      const { logAuditEvent } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-real-ip': '192.168.2.50',
          'user-agent': 'Test Agent',
        }),
      } as unknown as NextRequest;

      const entry: AuditLogEntry = {
        event: 'LOGOUT',
        email: 'test@example.com',
      };

      await logAuditEvent(entry, mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          ipAddress: '192.168.2.50',
        }),
      });
    });

    it('should not throw when logging fails (best-effort)', async () => {
      const { logAuditEvent } = await import('@/lib/services/audit-service');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockCreate.mockRejectedValueOnce(new Error('Database connection failed'));

      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Test Agent',
        }),
      } as unknown as NextRequest;

      const entry: AuditLogEntry = {
        event: 'LOGIN_FAILED',
        email: 'test@example.com',
        metadata: { reason: 'Invalid credentials' },
      };

      // Should not throw
      await expect(logAuditEvent(entry, mockRequest)).resolves.not.toThrow();

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create audit log:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing request gracefully', async () => {
      const { logAuditEvent } = await import('@/lib/services/audit-service');
      const entry: AuditLogEntry = {
        event: 'PASSWORD_CHANGED',
        userId: 'user-123',
        email: 'test@example.com',
      };

      await logAuditEvent(entry);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          event: 'PASSWORD_CHANGED',
          userId: 'user-123',
          email: 'test@example.com',
          ipAddress: undefined,
          userAgent: undefined,
        }),
      });
    });
  });

  describe('logLoginSuccess', () => {
    it('should log LOGIN_SUCCESS event with tokenId', async () => {
      const { logLoginSuccess } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Chrome/123.0.0.0',
        }),
      } as unknown as NextRequest;

      await logLoginSuccess('user-123', 'vendor@example.com', 'token-xyz', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: {
          event: 'LOGIN_SUCCESS',
          userId: 'user-123',
          email: 'vendor@example.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Chrome/123.0.0.0',
          metadata: { tokenId: 'token-xyz' },
        },
      });
    });

    it('should capture user email and IP', async () => {
      const { logLoginSuccess } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '203.0.113.100',
          'user-agent': 'Safari/17.0',
        }),
      } as unknown as NextRequest;

      await logLoginSuccess('user-456', 'admin@example.com', 'token-abc', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          event: 'LOGIN_SUCCESS',
          userId: 'user-456',
          email: 'admin@example.com',
          ipAddress: '203.0.113.100',
        }),
      });
    });
  });

  describe('logLoginFailed', () => {
    it('should log LOGIN_FAILED event with reason in metadata', async () => {
      const { logLoginFailed } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.50',
          'user-agent': 'Firefox/120.0',
        }),
      } as unknown as NextRequest;

      await logLoginFailed('attacker@example.com', 'Invalid password', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: {
          event: 'LOGIN_FAILED',
          email: 'attacker@example.com',
          ipAddress: '192.168.1.50',
          userAgent: 'Firefox/120.0',
          metadata: { reason: 'Invalid password' },
        },
      });
    });

    it('should capture attempted email', async () => {
      const { logLoginFailed } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.75',
          'user-agent': 'Edge/120.0',
        }),
      } as unknown as NextRequest;

      await logLoginFailed('nonexistent@example.com', 'User not found', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          event: 'LOGIN_FAILED',
          email: 'nonexistent@example.com',
          metadata: { reason: 'User not found' },
        }),
      });
    });
  });

  describe('logLogout', () => {
    it('should log LOGOUT event', async () => {
      const { logLogout } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.25',
          'user-agent': 'Chrome/123.0.0.0',
        }),
      } as unknown as NextRequest;

      await logLogout('user-789', 'user@example.com', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: {
          event: 'LOGOUT',
          userId: 'user-789',
          email: 'user@example.com',
          ipAddress: '192.168.1.25',
          userAgent: 'Chrome/123.0.0.0',
        },
      });
    });

    it('should capture user ID', async () => {
      const { logLogout } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.99',
          'user-agent': 'Safari/17.0',
        }),
      } as unknown as NextRequest;

      await logLogout('user-999', 'logout@example.com', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          event: 'LOGOUT',
          userId: 'user-999',
          email: 'logout@example.com',
        }),
      });
    });
  });

  describe('logTokenRefresh', () => {
    it('should log TOKEN_REFRESH event with new tokenId', async () => {
      const { logTokenRefresh } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.150',
          'user-agent': 'Chrome/123.0.0.0',
        }),
      } as unknown as NextRequest;

      await logTokenRefresh('user-555', 'refresh@example.com', 'new-token-xyz', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: {
          event: 'TOKEN_REFRESH',
          userId: 'user-555',
          email: 'refresh@example.com',
          ipAddress: '192.168.1.150',
          userAgent: 'Chrome/123.0.0.0',
          metadata: { tokenId: 'new-token-xyz' },
        },
      });
    });

    it('should capture new token ID in metadata', async () => {
      const { logTokenRefresh } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.200',
          'user-agent': 'Firefox/120.0',
        }),
      } as unknown as NextRequest;

      await logTokenRefresh('user-666', 'token@example.com', 'rotated-token-abc', mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          event: 'TOKEN_REFRESH',
          metadata: { tokenId: 'rotated-token-abc' },
        }),
      });
    });
  });

  describe('Additional Event Types', () => {
    it('should support ACCOUNT_SUSPENDED event', async () => {
      const { logAuditEvent } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.10',
          'user-agent': 'Admin Panel',
        }),
      } as unknown as NextRequest;

      const entry: AuditLogEntry = {
        event: 'ACCOUNT_SUSPENDED',
        userId: 'user-suspended',
        email: 'suspended@example.com',
        metadata: { adminId: 'admin-123', reason: 'Policy violation' },
      };

      await logAuditEvent(entry, mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          event: 'ACCOUNT_SUSPENDED',
          metadata: { adminId: 'admin-123', reason: 'Policy violation' },
        }),
      });
    });

    it('should support PASSWORD_CHANGED event', async () => {
      const { logAuditEvent } = await import('@/lib/services/audit-service');
      const mockRequest = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.30',
          'user-agent': 'Mobile App',
        }),
      } as unknown as NextRequest;

      const entry: AuditLogEntry = {
        event: 'PASSWORD_CHANGED',
        userId: 'user-pwd-change',
        email: 'pwdchange@example.com',
      };

      await logAuditEvent(entry, mockRequest);

      expect(mockCreate).toHaveBeenCalledWith({
        collection: 'audit-logs',
        data: expect.objectContaining({
          event: 'PASSWORD_CHANGED',
        }),
      });
    });
  });
});
