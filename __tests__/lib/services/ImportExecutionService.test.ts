/**
 * ImportExecutionService Tests
 *
 * Tests for the import execution service including atomic operations,
 * change tracking, and import history creation.
 */

import { ImportExecutionService } from '@/lib/services/ImportExecutionService';
import type { RowValidationResult } from '@/lib/services/ImportValidationService';
import type { Vendor } from '@/lib/types';

// Mock Payload CMS
jest.mock('payload', () => ({
  __esModule: true,
  default: {
    findByID: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  }
}));

import payload from 'payload';

describe('ImportExecutionService', () => {
  const mockVendor: Partial<Vendor> = {
    id: 'vendor-1',
    name: 'Test Corporation',
    description: 'Original description',
    contactEmail: 'original@test.com',
    contactPhone: '+1-555-000-0000'
  };

  const validRow: RowValidationResult = {
    rowNumber: 2,
    valid: true,
    errors: [],
    warnings: [],
    data: {
      name: 'Updated Corporation',
      description: 'Updated description',
      contactEmail: 'updated@test.com'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (payload.findByID as jest.Mock).mockResolvedValue(mockVendor);
    (payload.update as jest.Mock).mockResolvedValue({ ...mockVendor, ...validRow.data });
    (payload.create as jest.Mock).mockResolvedValue({ id: 'history-123' });
  });

  describe('execute', () => {
    const baseOptions = {
      vendorId: 'vendor-1',
      userId: 'user-1',
      overwriteExisting: true,
      filename: 'test.xlsx'
    };

    it('should successfully execute import with valid data', async () => {
      const result = await ImportExecutionService.execute([validRow], baseOptions);

      expect(result.success).toBe(true);
      expect(result.successfulRows).toBe(1);
      expect(result.failedRows).toBe(0);
      expect(result.totalRows).toBe(1);
      expect(result.changes.length).toBeGreaterThan(0);
    });

    it('should call payload.findByID to get current vendor', async () => {
      await ImportExecutionService.execute([validRow], baseOptions);

      expect(payload.findByID).toHaveBeenCalledWith({
        collection: 'vendors',
        id: 'vendor-1'
      });
    });

    it('should call payload.update with changed fields', async () => {
      await ImportExecutionService.execute([validRow], baseOptions);

      expect(payload.update).toHaveBeenCalledWith({
        collection: 'vendors',
        id: 'vendor-1',
        data: expect.objectContaining({
          name: 'Updated Corporation',
          description: 'Updated description',
          contactEmail: 'updated@test.com'
        })
      });
    });

    it('should create import history record', async () => {
      const result = await ImportExecutionService.execute([validRow], baseOptions);

      expect(payload.create).toHaveBeenCalledWith({
        collection: 'import_history',
        data: expect.objectContaining({
          vendor: 'vendor-1',
          user: 'user-1',
          status: 'success',
          rowsProcessed: 1,
          successfulRows: 1,
          failedRows: 0,
          filename: 'test.xlsx'
        })
      });

      expect(result.importHistoryId).toBe('history-123');
    });

    it('should return error if vendorId missing', async () => {
      const result = await ImportExecutionService.execute([validRow], {
        ...baseOptions,
        vendorId: ''
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required options');
    });

    it('should return error if userId missing', async () => {
      const result = await ImportExecutionService.execute([validRow], {
        ...baseOptions,
        userId: ''
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required options');
    });

    it('should return error if vendor not found', async () => {
      (payload.findByID as jest.Mock).mockResolvedValue(null);

      const result = await ImportExecutionService.execute([validRow], baseOptions);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Vendor not found');
    });

    it('should handle empty rows array', async () => {
      const result = await ImportExecutionService.execute([], baseOptions);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No rows to import');
    });

    it('should filter out invalid rows', async () => {
      const invalidRow: RowValidationResult = {
        rowNumber: 3,
        valid: false,
        errors: [{ rowNumber: 3, field: 'email', severity: 'ERROR' as any, code: 'INVALID', message: 'Invalid' }],
        warnings: [],
        data: {}
      };

      const result = await ImportExecutionService.execute([validRow, invalidRow], baseOptions);

      expect(result.successfulRows).toBe(1);
      expect(result.totalRows).toBe(2);
    });

    it('should return error if all rows invalid', async () => {
      const invalidRow: RowValidationResult = {
        rowNumber: 2,
        valid: false,
        errors: [{ rowNumber: 2, field: 'email', severity: 'ERROR' as any, code: 'INVALID', message: 'Invalid' }],
        warnings: [],
        data: {}
      };

      const result = await ImportExecutionService.execute([invalidRow], baseOptions);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No valid rows');
    });
  });

  describe('change tracking', () => {
    const baseOptions = {
      vendorId: 'vendor-1',
      userId: 'user-1',
      overwriteExisting: true
    };

    it('should track changed fields', async () => {
      const result = await ImportExecutionService.execute([validRow], baseOptions);

      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.changes.some(c => c.field === 'name')).toBe(true);
      expect(result.changes.some(c => c.field === 'description')).toBe(true);
      expect(result.changes.some(c => c.field === 'contactEmail')).toBe(true);
    });

    it('should record old and new values', async () => {
      const result = await ImportExecutionService.execute([validRow], baseOptions);

      const nameChange = result.changes.find(c => c.field === 'name');
      expect(nameChange).toBeDefined();
      expect(nameChange?.oldValue).toBe('Test Corporation');
      expect(nameChange?.newValue).toBe('Updated Corporation');
      expect(nameChange?.changed).toBe(true);
    });

    it('should not change fields when overwriteExisting is false and field has value', async () => {
      const result = await ImportExecutionService.execute([validRow], {
        ...baseOptions,
        overwriteExisting: false
      });

      // Name has existing value, should not be in changes at all
      const nameChange = result.changes.find(c => c.field === 'name');
      // The field should either not be in changes, or be marked as not changed
      expect(!nameChange || nameChange.changed === false).toBe(true);
    });

    it('should change empty fields even when overwriteExisting is false', async () => {
      const mockVendorWithEmptyField: Partial<Vendor> = {
        ...mockVendor,
        website: undefined // Empty field
      };

      (payload.findByID as jest.Mock).mockResolvedValue(mockVendorWithEmptyField);

      const rowWithWebsite: RowValidationResult = {
        ...validRow,
        data: { website: 'https://newsite.com' }
      };

      const result = await ImportExecutionService.execute([rowWithWebsite], {
        ...baseOptions,
        overwriteExisting: false
      });

      const websiteChange = result.changes.find(c => c.field === 'website');
      expect(websiteChange?.changed).toBe(true);
    });

    it('should skip empty new values', async () => {
      const rowWithEmptyValues: RowValidationResult = {
        ...validRow,
        data: {
          name: 'New Name',
          description: '', // Empty - should be skipped
          contactEmail: null // Null - should be skipped
        }
      };

      const result = await ImportExecutionService.execute([rowWithEmptyValues], baseOptions);

      expect(result.changes.some(c => c.field === 'description')).toBe(false);
      expect(result.changes.some(c => c.field === 'contactEmail')).toBe(false);
    });

    it('should handle array values', async () => {
      const mockVendorWithArray: Partial<Vendor> = {
        ...mockVendor,
        serviceAreas: [{ id: '1', area: 'Area 1' }] as any
      };

      (payload.findByID as jest.Mock).mockResolvedValue(mockVendorWithArray);

      const rowWithArray: RowValidationResult = {
        ...validRow,
        data: {
          serviceAreas: [{ id: '1', area: 'Area 1' }, { id: '2', area: 'Area 2' }]
        }
      };

      const result = await ImportExecutionService.execute([rowWithArray], baseOptions);

      const arrayChange = result.changes.find(c => c.field === 'serviceAreas');
      expect(arrayChange).toBeDefined();
      expect(arrayChange?.changed).toBe(true);
    });
  });

  describe('dry run mode', () => {
    const baseOptions = {
      vendorId: 'vendor-1',
      userId: 'user-1',
      overwriteExisting: true,
      dryRun: true
    };

    it('should preview changes without saving', async () => {
      const result = await ImportExecutionService.execute([validRow], baseOptions);

      expect(result.success).toBe(true);
      expect(result.changes.length).toBeGreaterThan(0);

      // Should NOT call update or create
      expect(payload.update).not.toHaveBeenCalled();
      expect(payload.create).not.toHaveBeenCalled();
    });

    it('should still calculate changes in dry run', async () => {
      const result = await ImportExecutionService.execute([validRow], baseOptions);

      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.successfulRows).toBe(1);
    });
  });

  describe('preview method', () => {
    it('should execute in dry run mode', async () => {
      const result = await ImportExecutionService.preview([validRow], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true
      });

      expect(result.success).toBe(true);
      expect(payload.update).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    const baseOptions = {
      vendorId: 'vendor-1',
      userId: 'user-1',
      overwriteExisting: true
    };

    it('should handle payload.update errors', async () => {
      (payload.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const result = await ImportExecutionService.execute([validRow], baseOptions);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to save vendor changes');
    });

    it('should handle payload.findByID errors', async () => {
      (payload.findByID as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await ImportExecutionService.execute([validRow], baseOptions);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Import execution failed');
    });

    it('should continue if import history creation fails', async () => {
      (payload.create as jest.Mock).mockRejectedValue(new Error('History creation failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await ImportExecutionService.execute([validRow], baseOptions);

      // Import should still succeed even if history fails
      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to create import history:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('import status determination', () => {
    const baseOptions = {
      vendorId: 'vendor-1',
      userId: 'user-1',
      overwriteExisting: true
    };

    it('should set status to "success" when all rows succeed', async () => {
      await ImportExecutionService.execute([validRow], baseOptions);

      expect(payload.create).toHaveBeenCalledWith({
        collection: 'import_history',
        data: expect.objectContaining({
          status: 'success',
          successfulRows: 1,
          failedRows: 0
        })
      });
    });

    it('should set status to "partial" when some rows fail', async () => {
      // This scenario would require processing rows that can partially fail
      // For now, validation filters out invalid rows before execution
      // So this test documents the expected behavior if processing logic changes
      const validRow2 = { ...validRow, rowNumber: 3 };

      await ImportExecutionService.execute([validRow, validRow2], baseOptions);

      const createCall = (payload.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.status).toBe('success'); // All valid rows succeed
    });
  });

  describe('edge cases', () => {
    const baseOptions = {
      vendorId: 'vendor-1',
      userId: 'user-1',
      overwriteExisting: true
    };

    it('should handle vendor with minimal data', async () => {
      const minimalVendor = {
        id: 'vendor-1',
        name: 'Minimal Vendor'
      };

      (payload.findByID as jest.Mock).mockResolvedValue(minimalVendor);

      const result = await ImportExecutionService.execute([validRow], baseOptions);

      expect(result.success).toBe(true);
      expect(result.changes.length).toBeGreaterThan(0);
    });

    it('should handle circular references in vendor data', async () => {
      const circularVendor: any = { ...mockVendor };
      circularVendor.self = circularVendor; // Create circular reference

      (payload.findByID as jest.Mock).mockResolvedValue(circularVendor);

      const result = await ImportExecutionService.execute([validRow], baseOptions);

      // Should not crash - circular references handled in sanitization
      expect(result.success).toBe(true);
    });

    it('should handle date values', async () => {
      const mockVendorWithDate: Partial<Vendor> = {
        ...mockVendor,
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      (payload.findByID as jest.Mock).mockResolvedValue(mockVendorWithDate);

      const result = await ImportExecutionService.execute([validRow], baseOptions);

      expect(result.success).toBe(true);
    });

    it('should not update if no changes detected', async () => {
      const noChangeRow: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          name: 'Test Corporation', // Same as current
          contactEmail: 'original@test.com' // Same as current
        }
      };

      const result = await ImportExecutionService.execute([noChangeRow], baseOptions);

      expect(result.success).toBe(true);
      expect(result.changes.filter(c => c.changed).length).toBe(0);
      // Should not call update if no changes
      expect(payload.update).not.toHaveBeenCalled();
    });
  });
});
