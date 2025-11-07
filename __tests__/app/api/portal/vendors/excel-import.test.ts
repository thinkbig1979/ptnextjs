/**
 * Integration Tests - Excel Import API
 * 
 * Tests the excel-import API route:
 * - POST /api/portal/vendors/[id]/excel-import?phase=preview|execute
 * 
 * Requirements:
 * - Authentication and authorization
 * - Tier 2+ restriction enforcement
 * - Two-phase import (preview and execute)
 * - File size validation
 * - File upload handling
 * - Parse and validation error handling
 * - Successful import scenarios
 * 
 * Coverage Target: >80% for route handler
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/portal/vendors/[id]/excel-import/route';
import * as ExcelParserService from '@/lib/services/ExcelParserService';
import * as ImportValidationService from '@/lib/services/ImportValidationService';
import * as ImportExecutionService from '@/lib/services/ImportExecutionService';
import * as VendorProfileService from '@/lib/services/VendorProfileService';
import * as TierService from '@/lib/services/TierService';

// Mock dependencies
jest.mock('@/lib/middleware/auth-middleware', () => ({
  getUserFromRequest: jest.fn(),
}));

jest.mock('@/lib/services/auth-service', () => ({
  authService: {
    validateToken: jest.fn(),
  },
}));

jest.mock('@/lib/services/ExcelParserService');
jest.mock('@/lib/services/ImportValidationService');
jest.mock('@/lib/services/ImportExecutionService');
jest.mock('@/lib/services/VendorProfileService');
jest.mock('@/lib/services/TierService');

const { getUserFromRequest } = require('@/lib/middleware/auth-middleware');
const { authService } = require('@/lib/services/auth-service');

describe('Excel Import API - Integration Tests', () => {
  let mockContext: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock context
    mockContext = {
      params: Promise.resolve({ id: 'vendor-123' }),
    };
  });

  // Helper to create FormData with file
  function createFormDataRequest(
    url: string,
    fileContent: string,
    fileName: string = 'test.xlsx',
    headers: Record<string, string> = {}
  ): NextRequest {
    const formData = new FormData();
    const blob = new Blob([fileContent], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    formData.append('file', blob, fileName);

    return new NextRequest(url, {
      method: 'POST',
      headers,
      body: formData as any,
    });
  }

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      getUserFromRequest.mockReturnValue(null);
      authService.validateToken.mockReturnValue(null);

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Authentication required');
    });

    it('should accept authenticated requests with valid user', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);
      
      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue({
        success: true,
        rows: [],
        errors: [],
      });

      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue({
        valid: true,
        rows: [],
        errors: [],
      });

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);

      expect(response.status).toBe(200);
    });
  });

  describe('Authorization', () => {
    it('should allow vendor to import their own data', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue({
        success: true,
        rows: [],
        errors: [],
      });

      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue({
        valid: true,
        rows: [],
        errors: [],
      });

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);

      expect(response.status).toBe(200);
      expect(VendorProfileService.getVendorForEdit).toHaveBeenCalledWith(
        'vendor-123',
        'user-123',
        false
      );
    });

    it('should allow admin to import any vendor data', async () => {
      const mockAdmin = {
        id: 'admin-123',
        role: 'admin',
      };

      getUserFromRequest.mockReturnValue(mockAdmin);

      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        tier: 'tier2',
      };

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue({
        success: true,
        rows: [],
        errors: [],
      });

      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue({
        valid: true,
        rows: [],
        errors: [],
      });

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);

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
      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(null);

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Vendor not found');
    });
  });

  describe('Tier Restrictions', () => {
    it('should reject tier 1 vendor from importing', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        tier: 'tier1',
      };

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(false);

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Excel import requires Tier 2 or higher');
      expect(data.currentTier).toBe('tier1');
      expect(data.requiredTier).toBe('tier2');
    });

    it('should reject free tier vendor from importing', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        tier: 'free',
      };

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(false);

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Excel import requires Tier 2 or higher');
    });

    it('should allow tier 2 vendor to import', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue({
        success: true,
        rows: [],
        errors: [],
      });

      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue({
        valid: true,
        rows: [],
        errors: [],
      });

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);

      expect(response.status).toBe(200);
    });

    it('should allow tier 3+ vendor to import', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);

      const mockVendor = {
        id: 'vendor-123',
        name: 'Test Vendor',
        tier: 'tier3',
      };

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue({
        success: true,
        rows: [],
        errors: [],
      });

      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue({
        valid: true,
        rows: [],
        errors: [],
      });

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);

      expect(response.status).toBe(200);
    });
  });

  describe('File Upload Validation', () => {
    it('should reject request without file', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      // Create request with empty FormData
      const formData = new FormData();
      const mockRequest = new NextRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        {
          method: 'POST',
          body: formData as any,
        }
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('No file uploaded');
    });

    it('should reject files exceeding size limit (5MB)', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      // Create file larger than 5MB
      const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        largeContent
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('File size exceeds maximum limit');
      expect(data.maxSize).toBe(5 * 1024 * 1024);
    });

    it('should accept files under size limit', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue({
        success: true,
        rows: [],
        errors: [],
      });

      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue({
        valid: true,
        rows: [],
        errors: [],
      });

      // Create file under 5MB
      const validContent = 'x'.repeat(1024); // 1KB
      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        validContent
      );

      const response = await POST(mockRequest, mockContext);

      expect(response.status).toBe(200);
    });
  });

  describe('Phase Parameter Validation', () => {
    it('should default to preview phase when not specified', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue({
        success: true,
        rows: [],
        errors: [],
      });

      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue({
        valid: true,
        rows: [],
        errors: [],
      });

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('preview');
    });

    it('should reject invalid phase parameter', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=invalid',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid phase parameter');
    });

    it('should accept preview phase', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue({
        success: true,
        rows: [],
        errors: [],
      });

      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue({
        valid: true,
        rows: [],
        errors: [],
      });

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('preview');
    });

    it('should accept execute phase', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue({
        success: true,
        rows: [{ name: 'Test' }],
        errors: [],
      });

      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue({
        valid: true,
        rows: [{ name: 'Test' }],
        errors: [],
      });

      jest.spyOn(ImportExecutionService, 'execute').mockResolvedValue({
        success: true,
        summary: {
          totalRows: 1,
          successCount: 1,
          errorCount: 0,
        },
        results: [],
      });

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=execute',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('execute');
    });
  });

  describe('Preview Phase', () => {
    it('should return validation results for preview phase', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      const mockParseResult = {
        success: true,
        rows: [{ name: 'Test Row' }],
        errors: [],
      };

      const mockValidationResult = {
        valid: true,
        rows: [{ name: 'Test Row' }],
        errors: [],
      };

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue(mockParseResult);
      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue(mockValidationResult);

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('preview');
      expect(data.parseResult).toEqual(mockParseResult);
      expect(data.validationResult).toEqual(mockValidationResult);
      expect(data.message).toContain('validated successfully');
    });

    it('should return parse errors in preview phase', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      const mockParseResult = {
        success: false,
        rows: [],
        errors: ['Invalid file format'],
      };

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue(mockParseResult);

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'invalid content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.parseResult.success).toBe(false);
      expect(data.error).toContain('Failed to parse Excel file');
    });

    it('should return validation errors in preview phase', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      const mockParseResult = {
        success: true,
        rows: [{ name: '' }], // Invalid data
        errors: [],
      };

      const mockValidationResult = {
        valid: false,
        rows: [],
        errors: ['Name is required'],
      };

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue(mockParseResult);
      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue(mockValidationResult);

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('preview');
      expect(data.validationResult.valid).toBe(false);
      expect(data.message).toContain('Validation errors found');
    });
  });

  describe('Execute Phase', () => {
    it('should execute import successfully when validation passes', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      const mockParseResult = {
        success: true,
        rows: [{ name: 'Valid Row' }],
        errors: [],
      };

      const mockValidationResult = {
        valid: true,
        rows: [{ name: 'Valid Row' }],
        errors: [],
      };

      const mockExecutionResult = {
        success: true,
        summary: {
          totalRows: 1,
          successCount: 1,
          errorCount: 0,
        },
        results: [],
      };

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue(mockParseResult);
      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue(mockValidationResult);
      jest.spyOn(ImportExecutionService, 'execute').mockResolvedValue(mockExecutionResult);

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=execute',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.phase).toBe('execute');
      expect(data.executionResult.success).toBe(true);
      expect(data.message).toContain('Successfully imported 1 records');
      expect(ImportExecutionService.execute).toHaveBeenCalledWith(
        mockValidationResult.rows,
        {
          vendorId: 'vendor-123',
          userId: 'user-123',
          overwriteExisting: true,
        }
      );
    });

    it('should reject execute phase with validation errors', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      const mockParseResult = {
        success: true,
        rows: [{ name: '' }],
        errors: [],
      };

      const mockValidationResult = {
        valid: false,
        rows: [],
        errors: ['Validation failed'],
      };

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue(mockParseResult);
      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue(mockValidationResult);

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=execute',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Cannot execute import with validation errors');
      expect(ImportExecutionService.execute).not.toHaveBeenCalled();
    });

    it('should handle partial import success', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      const mockParseResult = {
        success: true,
        rows: [{ name: 'Row 1' }, { name: 'Row 2' }],
        errors: [],
      };

      const mockValidationResult = {
        valid: true,
        rows: [{ name: 'Row 1' }, { name: 'Row 2' }],
        errors: [],
      };

      const mockExecutionResult = {
        success: false,
        summary: {
          totalRows: 2,
          successCount: 1,
          errorCount: 1,
        },
        results: [],
      };

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue(mockParseResult);
      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue(mockValidationResult);
      jest.spyOn(ImportExecutionService, 'execute').mockResolvedValue(mockExecutionResult);

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=execute',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('completed with errors');
      expect(data.message).toContain('1 successful');
      expect(data.message).toContain('1 failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        role: 'vendor',
        vendorId: 'vendor-123',
      };

      getUserFromRequest.mockReturnValue(mockUser);
      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockRejectedValue(
        new Error('Database error')
      );

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Import failed');
      expect(data.details).toBe('Database error');
    });

    it('should handle parser service errors', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);
      jest.spyOn(ExcelParserService, 'parse').mockRejectedValue(
        new Error('Parse failed')
      );

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=preview',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Import failed');
      expect(data.details).toBe('Parse failed');
    });

    it('should handle execution service errors', async () => {
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

      jest.spyOn(VendorProfileService, 'getVendorForEdit').mockResolvedValue(mockVendor);
      jest.spyOn(TierService, 'isTierOrHigher').mockReturnValue(true);

      jest.spyOn(ExcelParserService, 'parse').mockResolvedValue({
        success: true,
        rows: [{ name: 'Test' }],
        errors: [],
      });

      jest.spyOn(ImportValidationService, 'validate').mockResolvedValue({
        valid: true,
        rows: [{ name: 'Test' }],
        errors: [],
      });

      jest.spyOn(ImportExecutionService, 'execute').mockRejectedValue(
        new Error('Execution failed')
      );

      const mockRequest = createFormDataRequest(
        'http://localhost:3000/api/portal/vendors/vendor-123/excel-import?phase=execute',
        'file content'
      );

      const response = await POST(mockRequest, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Import failed');
      expect(data.details).toBe('Execution failed');
    });
  });
});
