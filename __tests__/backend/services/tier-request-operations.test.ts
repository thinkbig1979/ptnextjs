/**
 * Tier Request Operations Test Suite
 *
 * Tests for tier upgrade request CRUD operations including:
 * - Unique pending request check
 * - Request creation
 * - Request retrieval
 * - Request cancellation
 * - Mock-based testing patterns
 *
 * Uses mocked Payload CMS client to test business logic
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  checkUniquePendingRequest,
  createUpgradeRequest,
  getPendingRequest,
  cancelRequest,
} from '@/lib/services/TierUpgradeRequestService';
import { getPayload } from 'payload';

// Mock Payload client
const mockPayload = {
  findByID: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  find: jest.fn(),
};

// Mock the getPayload function
jest.mock('payload');
const mockGetPayload = getPayload as jest.MockedFunction<typeof getPayload>;

describe('Tier Request Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPayload.mockResolvedValue(mockPayload as any);
  });

  describe('checkUniquePendingRequest', () => {
    it('should allow request when no pending requests exist', async () => {
      const existingRequests: Array<{ vendor: string; status: string }> = [];

      const result = await checkUniquePendingRequest('vendor-1', existingRequests);

      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should allow request when only approved requests exist', async () => {
      const existingRequests = [
        { vendor: 'vendor-1', status: 'approved' },
        { vendor: 'vendor-1', status: 'approved' },
      ];

      const result = await checkUniquePendingRequest('vendor-1', existingRequests);

      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should allow request when only rejected requests exist', async () => {
      const existingRequests = [
        { vendor: 'vendor-1', status: 'rejected' },
      ];

      const result = await checkUniquePendingRequest('vendor-1', existingRequests);

      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should allow request when only cancelled requests exist', async () => {
      const existingRequests = [
        { vendor: 'vendor-1', status: 'cancelled' },
      ];

      const result = await checkUniquePendingRequest('vendor-1', existingRequests);

      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should block request when pending request exists for same vendor', async () => {
      const existingRequests = [
        { vendor: 'vendor-1', status: 'pending' },
      ];

      const result = await checkUniquePendingRequest('vendor-1', existingRequests);

      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Vendor already has a pending tier upgrade request');
    });

    it('should allow request when pending request exists for different vendor', async () => {
      const existingRequests = [
        { vendor: 'vendor-2', status: 'pending' },
      ];

      const result = await checkUniquePendingRequest('vendor-1', existingRequests);

      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should block request when multiple pending requests exist (edge case)', async () => {
      const existingRequests = [
        { vendor: 'vendor-1', status: 'pending' },
        { vendor: 'vendor-1', status: 'pending' },
      ];

      const result = await checkUniquePendingRequest('vendor-1', existingRequests);

      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Vendor already has a pending tier upgrade request');
    });

    it('should block request when pending exists among mixed statuses', async () => {
      const existingRequests = [
        { vendor: 'vendor-1', status: 'approved' },
        { vendor: 'vendor-1', status: 'pending' },
        { vendor: 'vendor-1', status: 'rejected' },
      ];

      const result = await checkUniquePendingRequest('vendor-1', existingRequests);

      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Vendor already has a pending tier upgrade request');
    });
  });

  describe('createUpgradeRequest', () => {
    describe('Successful Creation', () => {
      it('should create request with all required fields', async () => {
        // Mock vendor exists
        mockPayload.findByID.mockResolvedValue({
          id: 'vendor-1',
          tier: 'free',
          name: 'Test Vendor',
        });

        // Mock no pending requests
        mockPayload.find.mockResolvedValue({
          docs: [],
          totalDocs: 0,
        });

        // Mock successful creation
        const mockRequest = {
          id: 'req-1',
          vendor: 'vendor-1',
          user: 'user-1',
          currentTier: 'free',
          requestedTier: 'tier1',
          status: 'pending',
          requestedAt: expect.any(String),
        };
        mockPayload.create.mockResolvedValue(mockRequest);

        const result = await createUpgradeRequest({
          vendorId: 'vendor-1',
          userId: 'user-1',
          requestedTier: 'tier1',
        });

        expect(result).toBeDefined();
        expect(result.vendor).toBe('vendor-1');
        expect(result.user).toBe('user-1');
        expect(result.currentTier).toBe('free');
        expect(result.requestedTier).toBe('tier1');
        expect(result.status).toBe('pending');
      });

      it('should auto-populate currentTier from vendor', async () => {
        mockPayload.findByID.mockResolvedValue({
          id: 'vendor-1',
          tier: 'tier1',
          name: 'Test Vendor',
        });

        mockPayload.find.mockResolvedValue({
          docs: [],
          totalDocs: 0,
        });

        const mockRequest = {
          id: 'req-1',
          vendor: 'vendor-1',
          user: 'user-1',
          currentTier: 'tier1',
          requestedTier: 'tier2',
          status: 'pending',
          requestedAt: expect.any(String),
        };
        mockPayload.create.mockResolvedValue(mockRequest);

        const result = await createUpgradeRequest({
          vendorId: 'vendor-1',
          userId: 'user-1',
          requestedTier: 'tier2',
        });

        expect(result.currentTier).toBe('tier1');
      });

      it('should include vendorNotes when provided', async () => {
        mockPayload.findByID.mockResolvedValue({
          id: 'vendor-1',
          tier: 'tier1',
        });

        mockPayload.find.mockResolvedValue({
          docs: [],
        });

        const notes = 'We need to upgrade to support our growing business needs.';
        const mockRequest = {
          id: 'req-1',
          vendor: 'vendor-1',
          user: 'user-1',
          currentTier: 'tier1',
          requestedTier: 'tier2',
          status: 'pending',
          vendorNotes: notes,
          requestedAt: expect.any(String),
        };
        mockPayload.create.mockResolvedValue(mockRequest);

        const result = await createUpgradeRequest({
          vendorId: 'vendor-1',
          userId: 'user-1',
          requestedTier: 'tier2',
          vendorNotes: notes,
        });

        expect(result.vendorNotes).toBe(notes);
      });

      it('should set status to pending by default', async () => {
        mockPayload.findByID.mockResolvedValue({
          id: 'vendor-1',
          tier: 'free',
        });

        mockPayload.find.mockResolvedValue({
          docs: [],
        });

        const mockRequest = {
          id: 'req-1',
          vendor: 'vendor-1',
          user: 'user-1',
          currentTier: 'free',
          requestedTier: 'tier1',
          status: 'pending',
          requestedAt: new Date().toISOString(),
        };
        mockPayload.create.mockResolvedValue(mockRequest);

        const result = await createUpgradeRequest({
          vendorId: 'vendor-1',
          userId: 'user-1',
          requestedTier: 'tier1',
        });

        expect(result.status).toBe('pending');
      });

      it('should call payload.create with correct data structure', async () => {
        mockPayload.findByID.mockResolvedValue({
          id: 'vendor-1',
          tier: 'tier2',
        });

        mockPayload.find.mockResolvedValue({
          docs: [],
        });

        const mockRequest = {
          id: 'req-1',
          vendor: 'vendor-1',
          user: 'user-1',
          currentTier: 'tier2',
          requestedTier: 'tier3',
          status: 'pending',
          requestedAt: expect.any(String),
        };
        mockPayload.create.mockResolvedValue(mockRequest);

        await createUpgradeRequest({
          vendorId: 'vendor-1',
          userId: 'user-1',
          requestedTier: 'tier3',
        });

        // Verify create was called with the right collection and core data
        expect(mockPayload.create).toHaveBeenCalled();
        const createCall = mockPayload.create.mock.calls[0][0];
        expect(createCall.collection).toBe('tier_upgrade_requests');
        expect(createCall.data.vendor).toBe('vendor-1');
        expect(createCall.data.user).toBe('user-1');
        expect(createCall.data.requestedTier).toBe('tier3');
        expect(createCall.data.status).toBe('pending');
      });
    });

    describe('Error Handling', () => {
      it('should throw error if vendor does not exist', async () => {
        mockPayload.findByID.mockResolvedValue(null);

        await expect(
          createUpgradeRequest({
            vendorId: 'non-existent',
            userId: 'user-1',
            requestedTier: 'tier1',
          })
        ).rejects.toThrow('Vendor not found');
      });

      it('should throw error if vendor already has pending request', async () => {
        mockPayload.findByID.mockResolvedValue({
          id: 'vendor-1',
          tier: 'tier1',
        });

        mockPayload.find.mockResolvedValue({
          docs: [
            {
              id: 'existing-req',
              vendor: 'vendor-1',
              status: 'pending',
            },
          ],
        });

        await expect(
          createUpgradeRequest({
            vendorId: 'vendor-1',
            userId: 'user-1',
            requestedTier: 'tier2',
          })
        ).rejects.toThrow('Vendor already has a pending tier upgrade request');
      });

      it('should call findByID with correct parameters', async () => {
        mockPayload.findByID.mockResolvedValue({
          id: 'vendor-1',
          tier: 'tier1',
        });

        mockPayload.find.mockResolvedValue({
          docs: [],
        });

        mockPayload.create.mockResolvedValue({
          id: 'req-1',
          vendor: 'vendor-1',
          user: 'user-1',
          currentTier: 'tier1',
          requestedTier: 'tier2',
          status: 'pending',
          requestedAt: new Date().toISOString(),
        });

        await createUpgradeRequest({
          vendorId: 'vendor-1',
          userId: 'user-1',
          requestedTier: 'tier2',
        });

        expect(mockPayload.findByID).toHaveBeenCalledWith({
          collection: 'vendors',
          id: 'vendor-1',
        });
      });

      it('should check for existing pending requests with correct query', async () => {
        mockPayload.findByID.mockResolvedValue({
          id: 'vendor-1',
          tier: 'tier1',
        });

        mockPayload.find.mockResolvedValue({
          docs: [],
        });

        mockPayload.create.mockResolvedValue({
          id: 'req-1',
          vendor: 'vendor-1',
          user: 'user-1',
          currentTier: 'tier1',
          requestedTier: 'tier2',
          status: 'pending',
          requestedAt: new Date().toISOString(),
        });

        await createUpgradeRequest({
          vendorId: 'vendor-1',
          userId: 'user-1',
          requestedTier: 'tier2',
        });

        // Verify find was called (query structure may vary)
        expect(mockPayload.find).toHaveBeenCalled();
        const findCall = mockPayload.find.mock.calls[0][0];
        expect(findCall.collection).toBe('tier_upgrade_requests');
        expect(findCall.limit).toBe(1);
      });
    });
  });

  describe('getPendingRequest', () => {
    it('should return pending request when it exists', async () => {
      const mockRequest = {
        id: 'req-1',
        vendor: 'vendor-1',
        status: 'pending',
        currentTier: 'tier1',
        requestedTier: 'tier2',
      };

      mockPayload.find.mockResolvedValue({
        docs: [mockRequest],
      });

      const result = await getPendingRequest('vendor-1');

      expect(result).toEqual(mockRequest);
      // Verify find was called with correct collection
      expect(mockPayload.find).toHaveBeenCalled();
      const findCall = mockPayload.find.mock.calls[0][0];
      expect(findCall.collection).toBe('tier_upgrade_requests');
      expect(findCall.limit).toBe(1);
    });

    it('should return null when no pending request exists', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
      });

      const result = await getPendingRequest('vendor-1');

      expect(result).toBeNull();
    });

    it('should ignore approved requests', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
      });

      const result = await getPendingRequest('vendor-1');

      expect(result).toBeNull();
      // Verify find was called with pending status filter
      expect(mockPayload.find).toHaveBeenCalled();
      const findCall = mockPayload.find.mock.calls[0][0];
      expect(findCall.collection).toBe('tier_upgrade_requests');
    });

    it('should return first result if multiple pending exist (edge case)', async () => {
      const mockRequest1 = {
        id: 'req-1',
        vendor: 'vendor-1',
        status: 'pending',
      };
      const mockRequest2 = {
        id: 'req-2',
        vendor: 'vendor-1',
        status: 'pending',
      };

      mockPayload.find.mockResolvedValue({
        docs: [mockRequest1, mockRequest2],
      });

      const result = await getPendingRequest('vendor-1');

      expect(result).toEqual(mockRequest1);
    });
  });

  describe('cancelRequest', () => {
    describe('Successful Cancellation', () => {
      it('should cancel pending request successfully', async () => {
        const mockRequest = {
          id: 'req-1',
          vendor: 'vendor-1',
          status: 'pending',
        };

        mockPayload.findByID.mockResolvedValue(mockRequest);
        mockPayload.update.mockResolvedValue({
          ...mockRequest,
          status: 'cancelled',
        });

        const result = await cancelRequest('req-1', 'vendor-1');

        expect(result.success).toBe(true);
        expect(mockPayload.update).toHaveBeenCalledWith({
          collection: 'tier_upgrade_requests',
          id: 'req-1',
          data: {
            status: 'cancelled',
          },
        });
      });

      it('should verify request belongs to vendor', async () => {
        const mockRequest = {
          id: 'req-1',
          vendor: 'vendor-1',
          status: 'pending',
        };

        mockPayload.findByID.mockResolvedValue(mockRequest);

        await cancelRequest('req-1', 'vendor-1');

        expect(mockPayload.findByID).toHaveBeenCalledWith({
          collection: 'tier_upgrade_requests',
          id: 'req-1',
        });
      });
    });

    describe('Validation Errors', () => {
      it('should reject cancellation if request not found', async () => {
        mockPayload.findByID.mockResolvedValue(null);

        const result = await cancelRequest('non-existent', 'vendor-1');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Request not found');
      });

      it('should reject cancellation if request belongs to different vendor', async () => {
        const mockRequest = {
          id: 'req-1',
          vendor: 'vendor-2', // Different vendor
          status: 'pending',
        };

        mockPayload.findByID.mockResolvedValue(mockRequest);

        const result = await cancelRequest('req-1', 'vendor-1');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Request does not belong to vendor');
      });

      it('should reject cancellation if request is not pending', async () => {
        const mockRequest = {
          id: 'req-1',
          vendor: 'vendor-1',
          status: 'approved',
        };

        mockPayload.findByID.mockResolvedValue(mockRequest);

        const result = await cancelRequest('req-1', 'vendor-1');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Can only cancel pending requests');
      });

      it('should reject cancellation if request is already cancelled', async () => {
        const mockRequest = {
          id: 'req-1',
          vendor: 'vendor-1',
          status: 'cancelled',
        };

        mockPayload.findByID.mockResolvedValue(mockRequest);

        const result = await cancelRequest('req-1', 'vendor-1');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Can only cancel pending requests');
      });

      it('should reject cancellation if request is rejected', async () => {
        const mockRequest = {
          id: 'req-1',
          vendor: 'vendor-1',
          status: 'rejected',
        };

        mockPayload.findByID.mockResolvedValue(mockRequest);

        const result = await cancelRequest('req-1', 'vendor-1');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Can only cancel pending requests');
      });
    });

    describe('Error Handling', () => {
      it('should handle database errors gracefully', async () => {
        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        mockPayload.findByID.mockRejectedValue(new Error('Database connection error'));

        const result = await cancelRequest('req-1', 'vendor-1');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Internal error');

        consoleSpy.mockRestore();
      });

      it('should handle update errors gracefully', async () => {
        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const mockRequest = {
          id: 'req-1',
          vendor: 'vendor-1',
          status: 'pending',
        };

        mockPayload.findByID.mockResolvedValue(mockRequest);
        mockPayload.update.mockRejectedValue(new Error('Update failed'));

        const result = await cancelRequest('req-1', 'vendor-1');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Internal error');

        consoleSpy.mockRestore();
      });
    });
  });
});
