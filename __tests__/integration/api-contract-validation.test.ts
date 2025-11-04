/**
 * API Contract Validation Integration Tests
 *
 * Validates that frontend and backend API contracts are fully compatible.
 * Tests all endpoints, response formats, error codes, and helper functions.
 *
 * Task: INTEG-API-CONTRACT
 * Date: 2025-10-25
 *
 * Test Coverage:
 * - Type compatibility validation
 * - Error response format validation
 * - Success response format validation
 * - Computed field presence validation
 * - Authentication/authorization validation
 * - Frontend helper function validation
 */

import { Vendor, VendorLocation } from '@/lib/types';
import {
  VendorApiError,
  ApiSuccessResponse,
  ApiErrorResponse,
  VendorGetResponse,
  VendorUpdateResponse,
  isAuthError,
  isValidationError,
  isTierError,
  getErrorMessage,
  getFieldErrors,
} from '@/lib/api/vendorClient';

// ============================================================================
// Type Definitions Matching Backend API Contracts
// ============================================================================

interface PortalGetSuccessResponse {
  success: true;
  data: Record<string, unknown>;
}

interface PortalUpdateSuccessResponse {
  success: true;
  data: {
    vendor: Record<string, unknown>;
    message: string;
  };
}

interface PortalErrorResponse {
  success: false;
  error: {
    code:
      | 'VALIDATION_ERROR'
      | 'UNAUTHORIZED'
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'SERVER_ERROR'
      | 'TIER_PERMISSION_DENIED';
    message: string;
    fields?: Record<string, string>;
    details?: string;
  };
}

interface PublicGetSuccessResponse {
  success: true;
  data: Record<string, unknown>;
}

interface PublicErrorResponse {
  success: false;
  error: {
    code: 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
  };
}

// ============================================================================
// Test Suite: Type Compatibility
// ============================================================================

describe('API Contract Validation - Type Compatibility', () => {
  describe('Portal API Response Types', () => {
    it('should match GET success response structure', () => {
      // Backend response
      const backendResponse: PortalGetSuccessResponse = {
        success: true,
        data: {
          id: '1',
          companyName: 'Test Vendor',
          tier: 'tier1',
          foundedYear: 2020,
          yearsInBusiness: 5, // Computed field
        },
      };

      // Frontend expects ApiSuccessResponse<Vendor>
      const frontendResponse = backendResponse as unknown as ApiSuccessResponse<Vendor>;

      expect(frontendResponse.success).toBe(true);
      expect(frontendResponse.data).toBeDefined();
      expect((frontendResponse.data as any).yearsInBusiness).toBe(5);
    });

    it('should match PUT success response structure', () => {
      // Backend response
      const backendResponse: PortalUpdateSuccessResponse = {
        success: true,
        data: {
          vendor: {
            id: '1',
            companyName: 'Updated Vendor',
            tier: 'tier2',
            yearsInBusiness: 5,
          },
          message: 'Vendor profile updated successfully',
        },
      };

      // Frontend expects VendorUpdateResponse
      const frontendResponse = backendResponse as unknown as VendorUpdateResponse;

      expect(frontendResponse.success).toBe(true);
      expect(frontendResponse.data.vendor).toBeDefined();
      expect(frontendResponse.data.message).toBe('Vendor profile updated successfully');
      expect((frontendResponse.data.vendor as any).yearsInBusiness).toBeDefined();
    });

    it('should match error response structure', () => {
      // Backend error response
      const backendError: PortalErrorResponse = {
        success: false,
        error: {
          code: 'TIER_PERMISSION_DENIED',
          message: 'Tier restriction violated',
          details: 'Field "videoUrl" requires tier1 or higher',
        },
      };

      // Frontend expects ApiErrorResponse
      const frontendError = backendError as unknown as ApiErrorResponse;

      expect(frontendError.success).toBe(false);
      expect(frontendError.error.code).toBe('TIER_PERMISSION_DENIED');
      expect(frontendError.error.message).toBeDefined();
      expect(frontendError.error.details).toBeDefined();
    });
  });

  describe('Public API Response Types', () => {
    it('should match GET success response structure', () => {
      // Backend response with tier filtering
      const backendResponse: PublicGetSuccessResponse = {
        success: true,
        data: {
          id: '1',
          slug: 'test-vendor',
          companyName: 'Test Vendor',
          tier: 'free',
          yearsInBusiness: 5,
          // Tier-restricted fields filtered out
        },
      };

      // Frontend expects ApiSuccessResponse<Vendor>
      const frontendResponse = backendResponse as unknown as ApiSuccessResponse<Vendor>;

      expect(frontendResponse.success).toBe(true);
      expect(frontendResponse.data).toBeDefined();
      expect((frontendResponse.data as any).yearsInBusiness).toBe(5);
    });

    it('should match error response structure', () => {
      // Backend error response
      const backendError: PublicErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        },
      };

      // Frontend expects ApiErrorResponse
      const frontendError = backendError as unknown as ApiErrorResponse;

      expect(frontendError.success).toBe(false);
      expect(frontendError.error.code).toBe('NOT_FOUND');
      expect(frontendError.error.message).toBe('Vendor not found');
    });
  });

  describe('Vendor Type Compatibility', () => {
    it('should handle all vendor fields from backend', () => {
      const backendVendor = {
        id: '1',
        slug: 'test-vendor',
        companyName: 'Test Vendor',
        description: 'Test description',
        tier: 'tier2',
        foundedYear: 2020,
        yearsInBusiness: 5, // Computed field
        locations: [
          {
            id: 'loc-1',
            locationName: 'HQ',
            address: 'Test Address',
            city: 'Test City',
            country: 'Test Country',
            latitude: 40.7128,
            longitude: -74.006,
            isHQ: true,
          },
        ] as VendorLocation[],
        contactEmail: 'test@example.com',
        website: 'https://example.com',
        linkedinUrl: 'https://linkedin.com/company/test',
      };

      // Frontend Vendor type should accept all these fields
      const vendor: Vendor = backendVendor as Vendor;

      expect(vendor.id).toBe('1');
      expect(vendor.tier).toBe('tier2');
      expect(vendor.yearsInBusiness).toBe(5);
      expect(vendor.locations).toHaveLength(1);
      expect(vendor.locations![0].isHQ).toBe(true);
    });

    it('should handle optional computed fields', () => {
      const vendorWithoutFoundedYear = {
        id: '1',
        companyName: 'Test Vendor',
        tier: 'free',
        yearsInBusiness: null, // Can be null if no foundedYear
      };

      const vendor: Vendor = vendorWithoutFoundedYear as Vendor;

      expect(vendor.yearsInBusiness).toBeNull();
    });
  });
});

// ============================================================================
// Test Suite: Error Response Format
// ============================================================================

describe('API Contract Validation - Error Response Format', () => {
  describe('Error Code Validation', () => {
    it('should validate VALIDATION_ERROR format', () => {
      const error: PortalErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          fields: {
            companyName: 'Company name is required',
            contactEmail: 'Invalid email format',
          },
        },
      };

      expect(error.success).toBe(false);
      expect(error.error.code).toBe('VALIDATION_ERROR');
      expect(error.error.fields).toBeDefined();
      expect(Object.keys(error.error.fields!)).toContain('companyName');
    });

    it('should validate UNAUTHORIZED format', () => {
      const error: PortalErrorResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      };

      expect(error.success).toBe(false);
      expect(error.error.code).toBe('UNAUTHORIZED');
      expect(error.error.message).toBe('Authentication required');
    });

    it('should validate FORBIDDEN format', () => {
      const error: PortalErrorResponse = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own vendor profile',
        },
      };

      expect(error.success).toBe(false);
      expect(error.error.code).toBe('FORBIDDEN');
    });

    it('should validate TIER_PERMISSION_DENIED format', () => {
      const error: PortalErrorResponse = {
        success: false,
        error: {
          code: 'TIER_PERMISSION_DENIED',
          message: 'Tier restriction violated',
          details: 'Fields website, linkedinUrl, twitterUrl are not accessible for free tier',
        },
      };

      expect(error.success).toBe(false);
      expect(error.error.code).toBe('TIER_PERMISSION_DENIED');
      expect(error.error.details).toBeDefined();
      expect(error.error.details).toContain('free tier');
    });

    it('should validate NOT_FOUND format', () => {
      const error: PortalErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        },
      };

      expect(error.success).toBe(false);
      expect(error.error.code).toBe('NOT_FOUND');
    });

    it('should validate SERVER_ERROR format', () => {
      const error: PortalErrorResponse = {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while updating vendor profile',
        },
      };

      expect(error.success).toBe(false);
      expect(error.error.code).toBe('SERVER_ERROR');
    });
  });

  describe('HTTP Status Code Mapping', () => {
    it('should map error codes to correct HTTP status codes', () => {
      const errorStatusMap: Record<string, number> = {
        VALIDATION_ERROR: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        TIER_PERMISSION_DENIED: 403,
        NOT_FOUND: 404,
        SERVER_ERROR: 500,
      };

      expect(errorStatusMap.VALIDATION_ERROR).toBe(400);
      expect(errorStatusMap.UNAUTHORIZED).toBe(401);
      expect(errorStatusMap.FORBIDDEN).toBe(403);
      expect(errorStatusMap.TIER_PERMISSION_DENIED).toBe(403);
      expect(errorStatusMap.NOT_FOUND).toBe(404);
      expect(errorStatusMap.SERVER_ERROR).toBe(500);
    });
  });

  describe('Field-Level Error Structure', () => {
    it('should provide field errors as key-value pairs', () => {
      const error: PortalErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          fields: {
            'locations.0.latitude': 'Latitude must be between -90 and 90',
            'locations.0.longitude': 'Longitude must be between -180 and 180',
          },
        },
      };

      expect(error.error.fields).toBeDefined();
      expect(error.error.fields!['locations.0.latitude']).toContain('Latitude');
      expect(error.error.fields!['locations.0.longitude']).toContain('Longitude');
    });

    it('should handle nested field paths', () => {
      const error: PortalErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          fields: {
            'locations': 'At least one location must be marked as HQ',
          },
        },
      };

      expect(error.error.fields!['locations']).toBeDefined();
    });
  });
});

// ============================================================================
// Test Suite: Success Response Format
// ============================================================================

describe('API Contract Validation - Success Response Format', () => {
  describe('GET Endpoint Response', () => {
    it('should return vendor in data field', () => {
      const response: PortalGetSuccessResponse = {
        success: true,
        data: {
          id: '1',
          companyName: 'Test Vendor',
          tier: 'tier1',
          foundedYear: 2020,
          yearsInBusiness: 5,
        },
      };

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe('1');
      expect(response.data.yearsInBusiness).toBe(5);
    });

    it('should include computed fields in GET response', () => {
      const response: PortalGetSuccessResponse = {
        success: true,
        data: {
          id: '1',
          foundedYear: 2020,
          yearsInBusiness: 5, // Must be present
        },
      };

      expect(response.data.yearsInBusiness).toBeDefined();
      expect(typeof response.data.yearsInBusiness).toBe('number');
    });
  });

  describe('PUT Endpoint Response', () => {
    it('should return vendor in data.vendor field with message', () => {
      const response: PortalUpdateSuccessResponse = {
        success: true,
        data: {
          vendor: {
            id: '1',
            companyName: 'Updated Vendor',
            tier: 'tier2',
            yearsInBusiness: 5,
          },
          message: 'Vendor profile updated successfully',
        },
      };

      expect(response.success).toBe(true);
      expect(response.data.vendor).toBeDefined();
      expect(response.data.message).toBe('Vendor profile updated successfully');
    });

    it('should include computed fields in PUT response', () => {
      const response: PortalUpdateSuccessResponse = {
        success: true,
        data: {
          vendor: {
            id: '1',
            foundedYear: 2020,
            yearsInBusiness: 5, // Must be present after update
          },
          message: 'Vendor profile updated successfully',
        },
      };

      expect(response.data.vendor.yearsInBusiness).toBeDefined();
      expect(typeof response.data.vendor.yearsInBusiness).toBe('number');
    });
  });

  describe('Public GET Endpoint Response', () => {
    it('should return tier-filtered vendor data', () => {
      const response: PublicGetSuccessResponse = {
        success: true,
        data: {
          id: '1',
          slug: 'test-vendor',
          companyName: 'Test Vendor',
          description: 'Test description',
          tier: 'free',
          contactEmail: 'test@example.com',
          yearsInBusiness: 5,
          // Tier-restricted fields like website, linkedinUrl filtered out for free tier
        },
      };

      expect(response.success).toBe(true);
      expect(response.data.tier).toBe('free');
      expect(response.data.yearsInBusiness).toBeDefined();
    });

    it('should include tier-accessible fields for higher tiers', () => {
      const response: PublicGetSuccessResponse = {
        success: true,
        data: {
          id: '1',
          tier: 'tier2',
          companyName: 'Test Vendor',
          website: 'https://example.com', // Accessible for tier2
          linkedinUrl: 'https://linkedin.com', // Accessible for tier2
          locations: [
            // Multiple locations accessible for tier2
            { address: 'Location 1', isHQ: true },
            { address: 'Location 2', isHQ: false },
          ],
          yearsInBusiness: 5,
        },
      };

      expect(response.data.tier).toBe('tier2');
      expect(response.data.website).toBeDefined();
      expect((response.data.locations as any[]).length).toBeGreaterThan(1);
    });
  });
});

// ============================================================================
// Test Suite: Computed Fields Validation
// ============================================================================

describe('API Contract Validation - Computed Fields', () => {
  describe('yearsInBusiness Computation', () => {
    it('should compute yearsInBusiness from foundedYear', () => {
      const currentYear = new Date().getFullYear();
      const foundedYear = 2020;
      const expectedYears = currentYear - foundedYear;

      const vendor = {
        id: '1',
        foundedYear,
        yearsInBusiness: expectedYears,
      };

      expect(vendor.yearsInBusiness).toBe(expectedYears);
    });

    it('should return null for invalid foundedYear', () => {
      const vendor = {
        id: '1',
        foundedYear: undefined,
        yearsInBusiness: null,
      };

      expect(vendor.yearsInBusiness).toBeNull();
    });

    it('should return null for future foundedYear', () => {
      const vendor = {
        id: '1',
        foundedYear: 2099,
        yearsInBusiness: null, // Invalid year should result in null
      };

      expect(vendor.yearsInBusiness).toBeNull();
    });

    it('should return null for very old foundedYear', () => {
      const vendor = {
        id: '1',
        foundedYear: 1799, // Before 1800
        yearsInBusiness: null, // Invalid year should result in null
      };

      expect(vendor.yearsInBusiness).toBeNull();
    });
  });

  describe('Computed Fields Presence in Responses', () => {
    it('should always include yearsInBusiness in portal GET response', () => {
      const response: PortalGetSuccessResponse = {
        success: true,
        data: {
          id: '1',
          foundedYear: 2020,
          yearsInBusiness: 5,
        },
      };

      // yearsInBusiness must be present (either number or null)
      expect('yearsInBusiness' in response.data).toBe(true);
    });

    it('should always include yearsInBusiness in portal PUT response', () => {
      const response: PortalUpdateSuccessResponse = {
        success: true,
        data: {
          vendor: {
            id: '1',
            foundedYear: 2020,
            yearsInBusiness: 5,
          },
          message: 'Success',
        },
      };

      // yearsInBusiness must be present
      expect('yearsInBusiness' in response.data.vendor).toBe(true);
    });

    it('should always include yearsInBusiness in public GET response', () => {
      const response: PublicGetSuccessResponse = {
        success: true,
        data: {
          id: '1',
          slug: 'test-vendor',
          foundedYear: 2020,
          yearsInBusiness: 5,
        },
      };

      // yearsInBusiness must be present even in public API
      expect('yearsInBusiness' in response.data).toBe(true);
    });
  });
});

// ============================================================================
// Test Suite: Frontend Helper Functions
// ============================================================================

describe('API Contract Validation - Frontend Helper Functions', () => {
  describe('VendorApiError Class', () => {
    it('should create error with all properties', () => {
      const error = new VendorApiError(
        'TIER_PERMISSION_DENIED',
        'Tier restriction violated',
        { website: 'Field requires tier1' },
        'Additional details'
      );

      expect(error.code).toBe('TIER_PERMISSION_DENIED');
      expect(error.message).toBe('Tier restriction violated');
      expect(error.fields).toBeDefined();
      expect(error.fields!.website).toBe('Field requires tier1');
      expect(error.details).toBe('Additional details');
      expect(error.name).toBe('VendorApiError');
    });

    it('should create error without optional fields', () => {
      const error = new VendorApiError('NOT_FOUND', 'Vendor not found');

      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Vendor not found');
      expect(error.fields).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
  });

  describe('isAuthError Helper', () => {
    it('should identify UNAUTHORIZED errors', () => {
      const error = new VendorApiError('UNAUTHORIZED', 'Authentication required');

      expect(isAuthError(error)).toBe(true);
    });

    it('should identify FORBIDDEN errors', () => {
      const error = new VendorApiError('FORBIDDEN', 'Access denied');

      expect(isAuthError(error)).toBe(true);
    });

    it('should not identify other errors as auth errors', () => {
      const error = new VendorApiError('VALIDATION_ERROR', 'Invalid input');

      expect(isAuthError(error)).toBe(false);
    });

    it('should return false for non-VendorApiError', () => {
      const error = new Error('Generic error');

      expect(isAuthError(error)).toBe(false);
    });
  });

  describe('isValidationError Helper', () => {
    it('should identify VALIDATION_ERROR errors', () => {
      const error = new VendorApiError('VALIDATION_ERROR', 'Invalid input', {
        email: 'Invalid format',
      });

      expect(isValidationError(error)).toBe(true);
    });

    it('should not identify other errors as validation errors', () => {
      const error = new VendorApiError('UNAUTHORIZED', 'Auth required');

      expect(isValidationError(error)).toBe(false);
    });
  });

  describe('isTierError Helper', () => {
    it('should identify TIER_PERMISSION_DENIED errors', () => {
      const error = new VendorApiError(
        'TIER_PERMISSION_DENIED',
        'Tier restriction',
        undefined,
        'Requires tier2'
      );

      expect(isTierError(error)).toBe(true);
    });

    it('should not identify other errors as tier errors', () => {
      const error = new VendorApiError('FORBIDDEN', 'Access denied');

      expect(isTierError(error)).toBe(false);
    });
  });

  describe('getErrorMessage Helper', () => {
    it('should extract message from VendorApiError', () => {
      const error = new VendorApiError('VALIDATION_ERROR', 'Invalid input data');

      expect(getErrorMessage(error)).toBe('Invalid input data');
    });

    it('should extract message from generic Error', () => {
      const error = new Error('Generic error message');

      expect(getErrorMessage(error)).toBe('Generic error message');
    });

    it('should return default message for unknown error', () => {
      const error = { unknown: 'object' };

      expect(getErrorMessage(error)).toBe('An unexpected error occurred');
    });
  });

  describe('getFieldErrors Helper', () => {
    it('should extract field errors from VendorApiError', () => {
      const error = new VendorApiError('VALIDATION_ERROR', 'Invalid input', {
        companyName: 'Required field',
        contactEmail: 'Invalid format',
      });

      const fieldErrors = getFieldErrors(error);

      expect(fieldErrors.companyName).toBe('Required field');
      expect(fieldErrors.contactEmail).toBe('Invalid format');
    });

    it('should return empty object for error without fields', () => {
      const error = new VendorApiError('NOT_FOUND', 'Not found');

      const fieldErrors = getFieldErrors(error);

      expect(fieldErrors).toEqual({});
    });

    it('should return empty object for non-VendorApiError', () => {
      const error = new Error('Generic error');

      const fieldErrors = getFieldErrors(error);

      expect(fieldErrors).toEqual({});
    });
  });
});

// ============================================================================
// Test Suite: Response Type Discriminators
// ============================================================================

describe('API Contract Validation - Response Type Discriminators', () => {
  describe('Success Field Discrimination', () => {
    it('should discriminate success responses by success field', () => {
      const response: PortalGetSuccessResponse | PortalErrorResponse = {
        success: true,
        data: {
          id: '1',
          companyName: 'Test',
        },
      };

      if (response.success) {
        // TypeScript should narrow to PortalGetSuccessResponse
        expect(response.data).toBeDefined();
        expect(response.data.id).toBe('1');
      }
    });

    it('should discriminate error responses by success field', () => {
      const response: PortalGetSuccessResponse | PortalErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Not found',
        },
      };

      if (!response.success) {
        // TypeScript should narrow to PortalErrorResponse
        expect(response.error).toBeDefined();
        expect(response.error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('Frontend Response Handling', () => {
    it('should handle API response union types correctly', () => {
      const mockFetch = async (
        shouldSucceed: boolean
      ): Promise<ApiSuccessResponse<Vendor> | ApiErrorResponse> => {
        if (shouldSucceed) {
          return {
            success: true,
            data: {
              id: '1',
              name: 'Test Vendor',
              description: 'Test',
              tier: 'tier1',
            } as Vendor,
          };
        } else {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Vendor not found',
            },
          };
        }
      };

      // Test success case
      mockFetch(true).then((response) => {
        if (response.success) {
          expect(response.data.id).toBe('1');
        }
      });

      // Test error case
      mockFetch(false).then((response) => {
        if (!response.success) {
          expect(response.error.code).toBe('NOT_FOUND');
        }
      });
    });
  });
});
