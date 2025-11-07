/**
 * Integration Tests - Excel Template Download API
 * 
 * Tests the excel-template API route:
 * - GET /api/portal/vendors/[id]/excel-template
 * 
 * Requirements:
 * - Authentication and authorization
 * - Tier-appropriate template generation
 * - Proper file headers and content-type
 * - Error scenarios
 * 
 * Coverage Target: >80% for route handler
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/portal/vendors/[id]/excel-template/route';

// Mock dependencies
jest.mock('@/lib/middleware/auth-middleware', () => ({
  getUserFromRequest: jest.fn(),
}));

jest.mock('@/lib/services/auth-service', () => ({
  authService: {
    validateToken: jest.fn(),
  },
}));

jest.mock('@/lib/services/ExcelTemplateService', () => ({
  ExcelTemplateService: {
    generateTemplate: jest.fn(),
    generateFilename: jest.fn(),
  },
}));

jest.mock('@/lib/services/VendorProfileService', () => ({
  VendorProfileService: {
    getVendorForEdit: jest.fn(),
  },
}));

const { getUserFromRequest } = require('@/lib/middleware/auth-middleware');
const { authService } = require('@/lib/services/auth-service');
const { ExcelTemplateService } = require('@/lib/services/ExcelTemplateService');
const { VendorProfileService } = require('@/lib/services/VendorProfileService');

describe('Excel Template Download API - Integration Tests', () => {
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

      const mockRequest = { url: 'http://localhost:3000/api/portal/vendors/vendor-123/excel-template', headers: new Headers() } as NextRequest;
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

      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        tier: 'tier2',
      };

      VendorProfileService.getVendorForEdit.mockResolvedValue(mockVendor);
      
      const mockBuffer = Buffer.from('mock excel data');
      ExcelTemplateService.generateTemplate.mockResolvedValue(mockBuffer);
      ExcelTemplateService.generateFilename.mockReturnValue('template.xlsx');

      const mockRequest = { url: 'http://localhost:3000/api/portal/vendors/vendor-123/excel-template', headers: new Headers() } as NextRequest;
      const response = await GET(mockRequest, mockContext);

      expect(response.status).toBe(200);
    });
  });

  describe('Authorization', () => {
    it('should allow vendor to download their own template', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        tier: 'tier2',
      };

      VendorProfileService.getVendorForEdit.mockResolvedValue(mockVendor);
      
      const mockBuffer = Buffer.from('mock excel data');
      ExcelTemplateService.generateTemplate.mockResolvedValue(mockBuffer);
      ExcelTemplateService.generateFilename.mockReturnValue('template.xlsx');

      const mockRequest = { url: 'http://localhost:3000/api/portal/vendors/vendor-123/excel-template', headers: new Headers() } as NextRequest;
      const response = await GET(mockRequest, mockContext);

      expect(response.status).toBe(200);
      expect(VendorProfileService.getVendorForEdit).toHaveBeenCalledWith(
        'vendor-123',
        'user-123',
        false
      );
    });

    it('should allow admin to download any vendor template', async () => {
      const mockAdmin = {
        id: 'admin-123',
        role: 'admin',
      };

      getUserFromRequest.mockReturnValue(mockAdmin);

      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        tier: 'tier3',
      };

      VendorProfileService.getVendorForEdit.mockResolvedValue(mockVendor);
      
      const mockBuffer = Buffer.from('mock excel data');
      ExcelTemplateService.generateTemplate.mockResolvedValue(mockBuffer);
      ExcelTemplateService.generateFilename.mockReturnValue('template.xlsx');

      const mockRequest = { url: 'http://localhost:3000/api/portal/vendors/vendor-123/excel-template', headers: new Headers() } as NextRequest;
      const response = await GET(mockRequest, mockContext);

      expect(response.status).toBe(200);
      expect(VendorProfileService.getVendorForEdit).toHaveBeenCalledWith(
        'vendor-123',
        'admin-123',
        true
      );
    });

    it('should reject unauthorized vendor accessing another vendor', async () => {
      const mockUser = {
        id: 'user-456',
        role: 'vendor',
        vendorId: 'vendor-456',
      };

      getUserFromRequest.mockReturnValue(mockUser);
      VendorProfileService.getVendorForEdit.mockResolvedValue(null);

      const mockRequest = { url: 'http://localhost:3000/api/portal/vendors/vendor-123/excel-template', headers: new Headers() } as NextRequest;
      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Vendor not found');
    });

    it('should return 404 for non-existent vendor', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);
      VendorProfileService.getVendorForEdit.mockResolvedValue(null);

      const mockRequest = { url: 'http://localhost:3000/api/portal/vendors/vendor-123/excel-template', headers: new Headers() } as NextRequest;
      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Vendor not found');
    });
  });

  describe('Tier-Appropriate Templates', () => {
    const testTier = async (tierName: string, tierNum: number) => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      const mockVendor = {
        id: 'vendor-123',
        name: `Tier ${tierNum} Vendor`,
        tier: tierName,
      };

      VendorProfileService.getVendorForEdit.mockResolvedValue(mockVendor);
      
      const mockBuffer = Buffer.from(`tier${tierNum} template`);
      ExcelTemplateService.generateTemplate.mockResolvedValue(mockBuffer);
      ExcelTemplateService.generateFilename.mockReturnValue(`tier${tierNum}-template.xlsx`);

      const mockRequest = { url: 'http://localhost:3000/api/portal/vendors/vendor-123/excel-template', headers: new Headers() } as NextRequest;
      const response = await GET(mockRequest, mockContext);

      expect(response.status).toBe(200);
      expect(ExcelTemplateService.generateTemplate).toHaveBeenCalledWith(tierNum);
    };

    it('should generate template for free tier (tier 0)', () => testTier('free', 0));
    it('should generate template for tier 1', () => testTier('tier1', 1));
    it('should generate template for tier 2', () => testTier('tier2', 2));
    it('should generate template for tier 3', () => testTier('tier3', 3));
    it('should generate template for tier 4', () => testTier('tier4', 4));
  });

  describe('File Headers and Content', () => {
    it('should return proper headers', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        tier: 'tier2',
      };

      VendorProfileService.getVendorForEdit.mockResolvedValue(mockVendor);
      
      const mockBuffer = Buffer.from('mock excel data');
      ExcelTemplateService.generateTemplate.mockResolvedValue(mockBuffer);
      ExcelTemplateService.generateFilename.mockReturnValue('test-vendor-tier2-template.xlsx');

      const mockRequest = { url: 'http://localhost:3000/api/portal/vendors/vendor-123/excel-template', headers: new Headers() } as NextRequest;
      const response = await GET(mockRequest, mockContext);

      expect(response.headers.get('Content-Type')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(response.headers.get('Content-Disposition')).toBe(
        'attachment; filename="test-vendor-tier2-template.xlsx"'
      );
      expect(response.headers.get('Content-Length')).toBe(mockBuffer.length.toString());
      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
      expect(response.headers.get('Pragma')).toBe('no-cache');
      expect(response.headers.get('Expires')).toBe('0');
    });
  });

  describe('Error Handling', () => {
    it('should handle ExcelTemplateService errors', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        tier: 'tier2',
      };

      VendorProfileService.getVendorForEdit.mockResolvedValue(mockVendor);
      ExcelTemplateService.generateTemplate.mockRejectedValue(
        new Error('Failed to generate template')
      );

      const mockRequest = { url: 'http://localhost:3000/api/portal/vendors/vendor-123/excel-template', headers: new Headers() } as NextRequest;
      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to generate Excel template');
      expect(data.details).toBe('Failed to generate template');
    });

    it('should handle VendorProfileService errors', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);
      VendorProfileService.getVendorForEdit.mockRejectedValue(
        new Error('Database connection failed')
      );

      const mockRequest = { url: 'http://localhost:3000/api/portal/vendors/vendor-123/excel-template', headers: new Headers() } as NextRequest;
      const response = await GET(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate Excel template');
      expect(data.details).toBe('Database connection failed');
    });

    it('should handle invalid vendor tier gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        tier: undefined,
      };

      VendorProfileService.getVendorForEdit.mockResolvedValue(mockVendor);
      
      const mockBuffer = Buffer.from('mock excel data');
      ExcelTemplateService.generateTemplate.mockResolvedValue(mockBuffer);
      ExcelTemplateService.generateFilename.mockReturnValue('template.xlsx');

      const mockRequest = { url: 'http://localhost:3000/api/portal/vendors/vendor-123/excel-template', headers: new Headers() } as NextRequest;
      const response = await GET(mockRequest, mockContext);

      // Should default to tier 0 (free)
      expect(response.status).toBe(200);
      expect(ExcelTemplateService.generateTemplate).toHaveBeenCalledWith(0);
    });
  });
});
