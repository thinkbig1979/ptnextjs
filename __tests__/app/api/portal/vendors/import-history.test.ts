/**
 * Integration Tests - Import History API
 * 
 * Tests the import-history API route:
 * - GET /api/portal/vendors/[id]/import-history
 * 
 * Requirements:
 * - Authentication and authorization
 * - Pagination functionality
 * - Filtering by status
 * - Date range filtering
 * - Error scenarios
 * 
 * Coverage Target: >80% for route handler
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/portal/vendors/[id]/import-history/route';
import payload from 'payload';

// Mock dependencies
jest.mock('@/lib/middleware/auth-middleware', () => ({
  getUserFromRequest: jest.fn(),
}));

jest.mock('@/lib/services/auth-service', () => ({
  authService: {
    validateToken: jest.fn(),
  },
}));

jest.mock('payload');

const { getUserFromRequest } = require('@/lib/middleware/auth-middleware');
const { authService } = require('@/lib/services/auth-service');

describe('Import History API - Integration Tests', () => {
  let mockContext: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock context
    mockContext = {
      params: Promise.resolve({ id: 'vendor-123' }),
    };
  });

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      getUserFromRequest.mockReturnValue(null);
      authService.validateToken.mockReturnValue(null);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Authentication required');
    });

    it('should accept authenticated requests', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);

      expect(response.status).toBe(200);
    });

    it('should authenticate via Bearer token when user not in headers', async () => {
      getUserFromRequest.mockReturnValue(null);

      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      authService.validateToken.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history',
        {
          headers: {
            authorization: 'Bearer valid-token',
          },
        }
      );

      const response = await GET(mockRequest, mockContext);

      expect(response.status).toBe(200);
      expect(authService.validateToken).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('Authorization', () => {
    it('should allow vendor to access their own import history', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);

      expect(response.status).toBe(200);
    });

    it('should allow admin to access any vendor import history', async () => {
      const mockAdmin = {
        id: 'admin-123',
        role: 'admin',
      };

      getUserFromRequest.mockReturnValue(mockAdmin);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);

      expect(response.status).toBe(200);
    });

    it('should reject unauthorized vendor accessing another vendor', async () => {
      const mockUser = {
        id: 'user-456',
        role: 'vendor',
        vendorId: 'vendor-456',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });
  });

  describe('Pagination', () => {
    it('should default to page 1 and limit 10', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
        })
      );
    });

    it('should accept custom page parameter', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 2,
        limit: 10,
        totalPages: 5,
        totalDocs: 50,
        hasNextPage: true,
        hasPrevPage: true,
        nextPage: 3,
        prevPage: 1,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?page=2'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });

    it('should accept custom limit parameter', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 25,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?limit=25'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 25,
        })
      );
    });

    it('should enforce maximum limit of 50', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 50,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?limit=100'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 50,
        })
      );
    });

    it('should enforce minimum page of 1', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?page=0'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
        })
      );
    });

    it('should return pagination metadata', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 2,
        limit: 10,
        totalPages: 5,
        totalDocs: 50,
        hasNextPage: true,
        hasPrevPage: true,
        nextPage: 3,
        prevPage: 1,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?page=2'
      );

      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        totalPages: 5,
        totalDocs: 50,
        hasNextPage: true,
        hasPrevPage: true,
        nextPage: 3,
        prevPage: 1,
      });
    });
  });

  describe('Status Filtering', () => {
    it('should filter by success status', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?status=success'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { equals: 'success' },
          }),
        })
      );
    });

    it('should filter by partial status', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?status=partial'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { equals: 'partial' },
          }),
        })
      );
    });

    it('should filter by failed status', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?status=failed'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { equals: 'failed' },
          }),
        })
      );
    });

    it('should ignore invalid status values', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?status=invalid'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            status: expect.anything(),
          }),
        })
      );
    });
  });

  describe('Date Range Filtering', () => {
    it('should filter by startDate', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?startDate=2024-01-01'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            importDate: expect.objectContaining({
              greater_than_equal: expect.any(String),
            }),
          }),
        })
      );
    });

    it('should filter by endDate', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?endDate=2024-12-31'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            importDate: expect.objectContaining({
              less_than_equal: expect.any(String),
            }),
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?startDate=2024-01-01&endDate=2024-12-31'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            importDate: expect.objectContaining({
              greater_than_equal: expect.any(String),
              less_than_equal: expect.any(String),
            }),
          }),
        })
      );
    });

    it('should return 400 for invalid startDate format', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?startDate=invalid-date'
      );

      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid startDate format');
    });

    it('should return 400 for invalid endDate format', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?endDate=invalid-date'
      );

      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid endDate format');
    });
  });

  describe('Query Behavior', () => {
    it('should sort by newest first', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: '-importDate',
        })
      );
    });

    it('should include related vendor and user data (depth 1)', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          depth: 1,
        })
      );
    });

    it('should query import_history collection', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'import_history',
        })
      );
    });

    it('should filter by vendor ID', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);

      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            vendor: { equals: 'vendor-123' },
          }),
        })
      );
    });
  });

  describe('Response Structure', () => {
    it('should return success flag and data', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      const mockDocs = [
        {
          id: 'import-1',
          status: 'success',
          importDate: '2024-01-01T00:00:00.000Z',
        },
      ];

      (payload.find as jest.Mock).mockResolvedValue({
        docs: mockDocs,
        page: 1,
        limit: 10,
        totalPages: 1,
        totalDocs: 1,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockDocs);
    });

    it('should return filter metadata', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockResolvedValue({
        docs: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalDocs: 0,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      });

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history?status=success&startDate=2024-01-01&endDate=2024-12-31'
      );

      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(data.filters).toEqual({
        status: 'success',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle payload.find errors', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockRejectedValue(new Error('Database error'));

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to fetch import history');
      expect(data.details).toBe('Database error');
    });

    it('should handle unknown errors gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      (payload.find as jest.Mock).mockRejectedValue('Unknown error');

      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/import-history'
      );

      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to fetch import history');
      expect(data.details).toBe('Unknown error');
    });
  });
});
