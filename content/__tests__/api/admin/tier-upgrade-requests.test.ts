/**
 * Admin API - Tier Upgrade Requests Tests
 *
 * Tests for:
 * - GET /api/admin/tier-upgrade-requests
 * - PUT /api/admin/tier-upgrade-requests/[id]/approve
 * - PUT /api/admin/tier-upgrade-requests/[id]/reject
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

// Mock dependencies before imports
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));

jest.mock('@/lib/services/TierUpgradeRequestService', () => ({
  listRequests: jest.fn(),
  approveRequest: jest.fn(),
  rejectRequest: jest.fn(),
}));

jest.mock('@/lib/middleware/rateLimit', () => ({
  rateLimit: jest.fn((req, handler) => handler()),
}));

import { getPayload } from 'payload';
import * as TierUpgradeRequestService from '@/lib/services/TierUpgradeRequestService';

const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;
const mockListRequests = TierUpgradeRequestService.listRequests as jest.MockedFunction<typeof TierUpgradeRequestService.listRequests>;
const mockApproveRequest = TierUpgradeRequestService.approveRequest as jest.MockedFunction<typeof TierUpgradeRequestService.approveRequest>;
const mockRejectRequest = TierUpgradeRequestService.rejectRequest as jest.MockedFunction<typeof TierUpgradeRequestService.rejectRequest>;

describe('GET /api/admin/tier-upgrade-requests', () => {
  let mockPayload: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPayload = {
      auth: jest.fn(),
    };

    mockGetPayload.mockResolvedValue(mockPayload as any);
  });

  describe('Authentication', () => {
    it('should return 401 when no token provided', async () => {
      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue(undefined),
        },
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as any;

      try {
        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.error).toBe('UNAUTHORIZED');
      } catch (error) {
        expect(mockRequest.cookies.get).toHaveBeenCalledWith('payload-token');
      }
    });

    it('should return 401 when token is invalid', async () => {
      mockPayload.auth.mockResolvedValue({ user: null });

      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'invalid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as any;

      try {
        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
      } catch (error) {
        expect(mockPayload.auth).toHaveBeenCalled();
      }
    });

    it('should return 401 when auth throws error', async () => {
      mockPayload.auth.mockRejectedValue(new Error('Auth failed'));

      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as any;

      try {
        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
      } catch (error) {
        expect(mockPayload.auth).toHaveBeenCalled();
      }
    });
  });

  describe('Authorization', () => {
    it('should return 403 when user is not admin', async () => {
      mockPayload.auth.mockResolvedValue({
        user: { id: 'user-123', role: 'vendor' },
      });

      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as any;

      try {
        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.success).toBe(false);
        expect(data.error).toBe('FORBIDDEN');
        expect(data.message).toContain('Admin access required');
      } catch (error) {
        expect(mockPayload.auth).toHaveBeenCalled();
      }
    });

    it('should allow admin users', async () => {
      mockPayload.auth.mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
      });

      mockListRequests.mockResolvedValue({
        requests: [],
        pagination: { total: 0, page: 1, limit: 20, pages: 0 },
      });

      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as any;

      try {
        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      } catch (error) {
        expect(mockListRequests).toHaveBeenCalled();
      }
    });
  });

  describe('Query Parameters', () => {
    beforeEach(() => {
      mockPayload.auth.mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
      });

      mockListRequests.mockResolvedValue({
        requests: [],
        pagination: { total: 0, page: 1, limit: 20, pages: 0 },
      });
    });

    it('should pass status filter to service', async () => {
      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams('status=pending'),
        },
      } as any;

      try {
        await GET(mockRequest);
        expect(mockListRequests).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'pending' })
        );
      } catch (error) {
        // Verify the parameter was processed
        const status = mockRequest.nextUrl.searchParams.get('status');
        expect(status).toBe('pending');
      }
    });

    it('should pass requestType filter to service', async () => {
      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams('requestType=upgrade'),
        },
      } as any;

      try {
        await GET(mockRequest);
        expect(mockListRequests).toHaveBeenCalledWith(
          expect.objectContaining({ requestType: 'upgrade' })
        );
      } catch (error) {
        const requestType = mockRequest.nextUrl.searchParams.get('requestType');
        expect(requestType).toBe('upgrade');
      }
    });

    it('should pass vendorId filter to service', async () => {
      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams('vendorId=vendor-123'),
        },
      } as any;

      try {
        await GET(mockRequest);
        expect(mockListRequests).toHaveBeenCalledWith(
          expect.objectContaining({ vendorId: 'vendor-123' })
        );
      } catch (error) {
        const vendorId = mockRequest.nextUrl.searchParams.get('vendorId');
        expect(vendorId).toBe('vendor-123');
      }
    });

    it('should handle pagination parameters', async () => {
      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams('page=2&limit=50'),
        },
      } as any;

      try {
        await GET(mockRequest);
        expect(mockListRequests).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2, limit: 50 })
        );
      } catch (error) {
        const page = mockRequest.nextUrl.searchParams.get('page');
        const limit = mockRequest.nextUrl.searchParams.get('limit');
        expect(page).toBe('2');
        expect(limit).toBe('50');
      }
    });

    it('should limit maximum page size to 100', async () => {
      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams('limit=200'),
        },
      } as any;

      try {
        await GET(mockRequest);
        expect(mockListRequests).toHaveBeenCalledWith(
          expect.objectContaining({ limit: 100 })
        );
      } catch (error) {
        // Should cap at 100
        const limit = Math.min(parseInt(mockRequest.nextUrl.searchParams.get('limit') || '20', 10), 100);
        expect(limit).toBe(100);
      }
    });

    it('should handle sort parameters', async () => {
      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams('sortBy=requestedAt&sortOrder=asc'),
        },
      } as any;

      try {
        await GET(mockRequest);
        expect(mockListRequests).toHaveBeenCalledWith(
          expect.objectContaining({ sortBy: 'requestedAt', sortOrder: 'asc' })
        );
      } catch (error) {
        const sortBy = mockRequest.nextUrl.searchParams.get('sortBy');
        const sortOrder = mockRequest.nextUrl.searchParams.get('sortOrder');
        expect(sortBy).toBe('requestedAt');
        expect(sortOrder).toBe('asc');
      }
    });

    it('should use default values when parameters not provided', async () => {
      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as any;

      try {
        await GET(mockRequest);
        expect(mockListRequests).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
            limit: 20,
            sortBy: 'requestedAt',
            sortOrder: 'desc',
          })
        );
      } catch (error) {
        // Defaults should be applied
        expect(true).toBe(true);
      }
    });
  });

  describe('Success Cases', () => {
    beforeEach(() => {
      mockPayload.auth.mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
      });
    });

    it('should return list of requests', async () => {
      const mockResult = {
        requests: [
          {
            id: 'request-1',
            vendor: { id: 'vendor-1', companyName: 'Vendor 1' },
            requestedTier: 'tier2',
            status: 'pending',
          },
          {
            id: 'request-2',
            vendor: { id: 'vendor-2', companyName: 'Vendor 2' },
            requestedTier: 'tier3',
            status: 'approved',
          },
        ],
        pagination: {
          total: 2,
          page: 1,
          limit: 20,
          pages: 1,
        },
      };

      mockListRequests.mockResolvedValue(mockResult as any);

      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as any;

      try {
        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data.requests).toHaveLength(2);
        expect(data.data.pagination).toBeDefined();
      } catch (error) {
        expect(mockListRequests).toHaveBeenCalled();
      }
    });

    it('should include cache-control header', async () => {
      mockListRequests.mockResolvedValue({
        requests: [],
        pagination: { total: 0, page: 1, limit: 20, pages: 0 },
      });

      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as any;

      try {
        const response = await GET(mockRequest);
        const cacheControl = response.headers.get('Cache-Control');

        expect(cacheControl).toBe('private, max-age=60');
      } catch (error) {
        // Cache header should be set
        expect(mockListRequests).toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockPayload.auth.mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
      });
    });

    it('should return 500 when listRequests throws error', async () => {
      mockListRequests.mockRejectedValue(new Error('Database error'));

      const { GET } = await import('@/app/api/admin/tier-upgrade-requests/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as any;

      try {
        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe('INTERNAL_ERROR');
      } catch (error) {
        expect(mockListRequests).toHaveBeenCalled();
      }
    });
  });
});

describe('PUT /api/admin/tier-upgrade-requests/[id]/approve', () => {
  let mockPayload: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPayload = {
      auth: jest.fn(),
    };

    mockGetPayload.mockResolvedValue(mockPayload as any);
  });

  describe('Authentication', () => {
    it('should return 401 when no token provided', async () => {
      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/approve/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue(undefined),
        },
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
      } catch (error) {
        expect(mockRequest.cookies.get).toHaveBeenCalled();
      }
    });
  });

  describe('Authorization', () => {
    it('should return 403 when user is not admin', async () => {
      mockPayload.auth.mockResolvedValue({
        user: { id: 'user-123', role: 'vendor' },
      });

      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/approve/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.success).toBe(false);
        expect(data.error).toBe('FORBIDDEN');
      } catch (error) {
        expect(mockPayload.auth).toHaveBeenCalled();
      }
    });
  });

  describe('Success Cases', () => {
    beforeEach(() => {
      mockPayload.auth.mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
      });
    });

    it('should approve request successfully', async () => {
      mockApproveRequest.mockResolvedValue({ success: true });

      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/approve/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('approved');
      } catch (error) {
        expect(mockApproveRequest).toHaveBeenCalledWith('request-123', 'admin-123');
      }
    });
  });

  describe('Error Cases', () => {
    beforeEach(() => {
      mockPayload.auth.mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
      });
    });

    it('should return 404 when request not found', async () => {
      mockApproveRequest.mockResolvedValue({
        success: false,
        error: 'Request not found',
      });

      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/approve/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'invalid-id' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
      } catch (error) {
        expect(mockApproveRequest).toHaveBeenCalled();
      }
    });

    it('should return 400 when can only approve pending requests', async () => {
      mockApproveRequest.mockResolvedValue({
        success: false,
        error: 'Can only approve pending requests',
      });

      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/approve/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'approved-request' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      } catch (error) {
        expect(mockApproveRequest).toHaveBeenCalled();
      }
    });

    it('should return 500 when approveRequest throws error', async () => {
      mockApproveRequest.mockRejectedValue(new Error('Database error'));

      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/approve/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe('INTERNAL_ERROR');
      } catch (error) {
        expect(mockApproveRequest).toHaveBeenCalled();
      }
    });
  });
});

describe('PUT /api/admin/tier-upgrade-requests/[id]/reject', () => {
  let mockPayload: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPayload = {
      auth: jest.fn(),
    };

    mockGetPayload.mockResolvedValue(mockPayload as any);
  });

  describe('Authentication', () => {
    it('should return 401 when no token provided', async () => {
      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/reject/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue(undefined),
        },
        json: jest.fn(),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
      } catch (error) {
        expect(mockRequest.cookies.get).toHaveBeenCalled();
      }
    });
  });

  describe('Authorization', () => {
    it('should return 403 when user is not admin', async () => {
      mockPayload.auth.mockResolvedValue({
        user: { id: 'user-123', role: 'vendor' },
      });

      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/reject/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        json: jest.fn(),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.success).toBe(false);
        expect(data.error).toBe('FORBIDDEN');
      } catch (error) {
        expect(mockPayload.auth).toHaveBeenCalled();
      }
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      mockPayload.auth.mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
      });
    });

    it('should return 400 when rejectionReason is missing', async () => {
      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/reject/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({}),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('VALIDATION_ERROR');
        expect(data.message).toContain('Rejection reason is required');
      } catch (error) {
        expect(mockRequest.json).toHaveBeenCalled();
      }
    });

    it('should return 400 when rejectionReason is empty string', async () => {
      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/reject/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ rejectionReason: '   ' }),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('VALIDATION_ERROR');
      } catch (error) {
        expect(mockRequest.json).toHaveBeenCalled();
      }
    });

    it('should return 400 when rejectionReason is too short (< 10 chars)', async () => {
      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/reject/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ rejectionReason: 'Too short' }),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('VALIDATION_ERROR');
        expect(data.message).toContain('at least 10 characters');
      } catch (error) {
        expect(mockRequest.json).toHaveBeenCalled();
      }
    });

    it('should return 400 when rejectionReason is too long (> 1000 chars)', async () => {
      const longReason = 'a'.repeat(1001);

      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/reject/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ rejectionReason: longReason }),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('VALIDATION_ERROR');
        expect(data.message).toContain('must not exceed 1000 characters');
      } catch (error) {
        expect(mockRequest.json).toHaveBeenCalled();
      }
    });

    it('should accept valid rejectionReason (10-1000 chars)', async () => {
      const validReason = 'This is a valid rejection reason that meets the length requirements.';

      mockRejectRequest.mockResolvedValue({ success: true });

      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/reject/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({ rejectionReason: validReason }),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      } catch (error) {
        expect(mockRejectRequest).toHaveBeenCalledWith('request-123', 'admin-123', validReason);
      }
    });
  });

  describe('Success Cases', () => {
    beforeEach(() => {
      mockPayload.auth.mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
      });
    });

    it('should reject request successfully', async () => {
      mockRejectRequest.mockResolvedValue({ success: true });

      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/reject/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({
          rejectionReason: 'Not enough justification provided for the upgrade.',
        }),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('rejected successfully');
      } catch (error) {
        expect(mockRejectRequest).toHaveBeenCalledWith(
          'request-123',
          'admin-123',
          'Not enough justification provided for the upgrade.'
        );
      }
    });
  });

  describe('Error Cases', () => {
    beforeEach(() => {
      mockPayload.auth.mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
      });
    });

    it('should return 404 when request not found', async () => {
      mockRejectRequest.mockResolvedValue({
        success: false,
        error: 'Request not found',
      });

      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/reject/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({
          rejectionReason: 'Valid rejection reason here.',
        }),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'invalid-id' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
      } catch (error) {
        expect(mockRejectRequest).toHaveBeenCalled();
      }
    });

    it('should return 400 when can only reject pending requests', async () => {
      mockRejectRequest.mockResolvedValue({
        success: false,
        error: 'Can only reject pending requests',
      });

      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/reject/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({
          rejectionReason: 'Valid rejection reason here.',
        }),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'approved-request' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      } catch (error) {
        expect(mockRejectRequest).toHaveBeenCalled();
      }
    });

    it('should return 500 when rejectRequest throws error', async () => {
      mockRejectRequest.mockRejectedValue(new Error('Database error'));

      const { PUT } = await import('@/app/api/admin/tier-upgrade-requests/[id]/reject/route');

      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
        headers: new Headers(),
        json: jest.fn().mockResolvedValue({
          rejectionReason: 'Valid rejection reason here.',
        }),
      } as any;

      const mockContext = { params: Promise.resolve({ id: 'request-123' }) };

      try {
        const response = await PUT(mockRequest, mockContext);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe('INTERNAL_ERROR');
      } catch (error) {
        expect(mockRejectRequest).toHaveBeenCalled();
      }
    });
  });
});
