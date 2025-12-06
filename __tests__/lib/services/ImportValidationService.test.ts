import { ImportValidationService, ValidationSeverity } from '@/lib/services/ImportValidationService';
import type { ParsedVendorRow } from '@/lib/services/ExcelParserService';

describe('ImportValidationService', () => {
  const validRow: ParsedVendorRow = {
    rowNumber: 2,
    data: {
      companyName: 'Test Corp',
      contactEmail: 'test@example.com',
      description: 'Test description',
      contactPhone: '+1-555-123-4567'
    },
    rawData: {}
  };

  describe('validate', () => {
    it('should validate valid data for FREE tier', async () => {
      const result = await ImportValidationService.validate([validRow], 0, 'vendor-1');

      expect(result.valid).toBe(true);
      expect(result.summary.validRows).toBe(1);
      expect(result.summary.errorRows).toBe(0);
      expect(result.summary.totalErrors).toBe(0);
    });

    it('should validate multiple valid rows', async () => {
      const rows = [
        validRow,
        { ...validRow, rowNumber: 3, data: { ...validRow.data, companyName: 'Test Corp 2' } }
      ];

      const result = await ImportValidationService.validate(rows, 0, 'vendor-1');

      expect(result.valid).toBe(true);
      expect(result.summary.validRows).toBe(2);
      expect(result.summary.totalRows).toBe(2);
    });
  });

  describe('required field validation', () => {
    it('should detect missing required field (companyName)', async () => {
      const invalidRow: ParsedVendorRow = {
        ...validRow,
        data: {
          contactEmail: 'test@example.com',
          description: 'Test description'
        }
      };

      const result = await ImportValidationService.validate([invalidRow], 0, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.summary.errorRows).toBe(1);
      expect(result.rows[0].errors.some(e => e.code === 'REQUIRED_FIELD_MISSING')).toBe(true);
      expect(result.rows[0].errors.some(e => e.field === 'companyName')).toBe(true);
    });

    it('should detect missing required field (contactEmail)', async () => {
      const invalidRow: ParsedVendorRow = {
        ...validRow,
        data: {
          companyName: 'Test Corp',
          description: 'Test description'
        }
      };

      const result = await ImportValidationService.validate([invalidRow], 0, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'REQUIRED_FIELD_MISSING')).toBe(true);
      expect(result.rows[0].errors.some(e => e.field === 'contactEmail')).toBe(true);
    });

    it('should detect missing required field (description)', async () => {
      const invalidRow: ParsedVendorRow = {
        ...validRow,
        data: {
          companyName: 'Test Corp',
          contactEmail: 'test@example.com'
        }
      };

      const result = await ImportValidationService.validate([invalidRow], 0, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'REQUIRED_FIELD_MISSING')).toBe(true);
      expect(result.rows[0].errors.some(e => e.field === 'description')).toBe(true);
    });

    it('should detect multiple missing required fields', async () => {
      const invalidRow: ParsedVendorRow = {
        ...validRow,
        data: { companyName: 'Test Corp' }
      };

      const result = await ImportValidationService.validate([invalidRow], 0, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.length).toBeGreaterThanOrEqual(2);
      expect(result.rows[0].errors.filter(e => e.code === 'REQUIRED_FIELD_MISSING').length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('email format validation', () => {
    it('should validate valid email', async () => {
      const result = await ImportValidationService.validate([validRow], 0, 'vendor-1');
      expect(result.rows[0].errors.filter(e => e.field === 'contactEmail').length).toBe(0);
    });

    it('should reject invalid email format (missing @)', async () => {
      const invalidRow: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, contactEmail: 'invalid-email' }
      };

      const result = await ImportValidationService.validate([invalidRow], 0, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'INVALID_EMAIL_FORMAT')).toBe(true);
      expect(result.rows[0].errors.some(e => e.field === 'contactEmail')).toBe(true);
    });

    it('should reject invalid email format (missing domain)', async () => {
      const invalidRow: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, contactEmail: 'test@' }
      };

      const result = await ImportValidationService.validate([invalidRow], 0, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'INVALID_EMAIL_FORMAT')).toBe(true);
    });

    it('should reject email with spaces', async () => {
      const invalidRow: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, contactEmail: 'test @example.com' }
      };

      const result = await ImportValidationService.validate([invalidRow], 0, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'INVALID_EMAIL_FORMAT')).toBe(true);
    });
  });

  describe('URL format validation', () => {
    it('should validate valid URL for TIER1', async () => {
      const rowWithUrl: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, website: 'https://www.example.com' }
      };

      const result = await ImportValidationService.validate([rowWithUrl], 1, 'vendor-1');

      expect(result.rows[0].errors.filter(e => e.field === 'website' && e.code === 'INVALID_URL_FORMAT').length).toBe(0);
    });

    it('should reject invalid URL format', async () => {
      const rowWithUrl: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, website: 'not-a-url' }
      };

      const result = await ImportValidationService.validate([rowWithUrl], 1, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'INVALID_URL_FORMAT')).toBe(true);
      expect(result.rows[0].errors.some(e => e.field === 'website')).toBe(true);
    });

    it('should accept URLs with various protocols', async () => {
      const urls = ['https://example.com', 'http://example.com', 'ftp://example.com'];

      for (const url of urls) {
        const rowWithUrl: ParsedVendorRow = {
          ...validRow,
          data: { ...validRow.data, website: url }
        };

        const result = await ImportValidationService.validate([rowWithUrl], 1, 'vendor-1');
        expect(result.rows[0].errors.filter(e => e.field === 'website' && e.code === 'INVALID_URL_FORMAT').length).toBe(0);
      }
    });
  });

  describe('tier access validation', () => {
    it('should reject TIER1 field for FREE tier', async () => {
      const tierRestrictedRow: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, website: 'https://test.com' }
      };

      const result = await ImportValidationService.validate([tierRestrictedRow], 0, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'TIER_ACCESS_DENIED')).toBe(true);
      expect(result.rows[0].errors.some(e => e.field === 'website')).toBe(true);
    });

    it('should allow TIER1 field for TIER1 tier', async () => {
      const tier1Row: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, website: 'https://test.com' }
      };

      const result = await ImportValidationService.validate([tier1Row], 1, 'vendor-1');

      expect(result.rows[0].errors.filter(e => e.code === 'TIER_ACCESS_DENIED' && e.field === 'website').length).toBe(0);
    });

    it('should reject TIER1 field for FREE tier (longDescription)', async () => {
      const tier1Row: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, longDescription: 'A very long description here' }
      };

      const result = await ImportValidationService.validate([tier1Row], 0, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'TIER_ACCESS_DENIED')).toBe(true);
      expect(result.rows[0].errors.some(e => e.field === 'longDescription')).toBe(true);
    });

    it('should allow TIER1 field for TIER1 tier (longDescription)', async () => {
      const tier1Row: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, longDescription: 'A very long description here' }
      };

      const result = await ImportValidationService.validate([tier1Row], 1, 'vendor-1');

      expect(result.rows[0].errors.filter(e => e.code === 'TIER_ACCESS_DENIED' && e.field === 'longDescription').length).toBe(0);
    });
  });

  describe('string length validation', () => {
    it('should accept string within max length', async () => {
      const row: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, description: 'A'.repeat(100) }
      };

      const result = await ImportValidationService.validate([row], 0, 'vendor-1');

      expect(result.rows[0].errors.filter(e => e.field === 'description' && e.code === 'STRING_TOO_LONG').length).toBe(0);
    });

    it('should reject string exceeding max length', async () => {
      const longString = 'A'.repeat(500); // Max is 300 for description
      const rowWithLongString: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, description: longString }
      };

      const result = await ImportValidationService.validate([rowWithLongString], 0, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'STRING_TOO_LONG')).toBe(true);
      expect(result.rows[0].errors.some(e => e.field === 'description')).toBe(true);
    });

    it('should truncate very long strings in error message', async () => {
      const veryLongString = 'A'.repeat(1000);
      const row: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, description: veryLongString }
      };

      const result = await ImportValidationService.validate([row], 0, 'vendor-1');

      const error = result.rows[0].errors.find(e => e.code === 'STRING_TOO_LONG');
      expect(error).toBeDefined();
      expect(String(error?.value).length).toBeLessThan(100);
    });
  });

  describe('number validation', () => {
    it('should validate valid number within range', async () => {
      const row: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, foundedYear: 2000 }
      };

      const result = await ImportValidationService.validate([row], 1, 'vendor-1');

      expect(result.rows[0].errors.filter(e => e.field === 'foundedYear').length).toBe(0);
    });

    it('should reject non-numeric value', async () => {
      const row: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, foundedYear: 'not-a-number' }
      };

      const result = await ImportValidationService.validate([row], 1, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'INVALID_NUMBER')).toBe(true);
      expect(result.rows[0].errors.some(e => e.field === 'foundedYear')).toBe(true);
    });

    it('should reject number below minimum', async () => {
      const rowWithInvalidYear: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, foundedYear: 1700 }
      };

      const result = await ImportValidationService.validate([rowWithInvalidYear], 1, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'NUMBER_TOO_SMALL')).toBe(true);
      expect(result.rows[0].errors.some(e => e.field === 'foundedYear')).toBe(true);
    });

    it('should reject number above maximum', async () => {
      const futureYear = new Date().getFullYear() + 10;
      const row: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, foundedYear: futureYear }
      };

      const result = await ImportValidationService.validate([row], 1, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'NUMBER_TOO_LARGE')).toBe(true);
    });

    it('should validate percentage within 0-10 range (clientSatisfactionScore)', async () => {
      const row: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, clientSatisfactionScore: 9 }
      };

      const result = await ImportValidationService.validate([row], 1, 'vendor-1');

      expect(result.rows[0].errors.filter(e => e.field === 'clientSatisfactionScore').length).toBe(0);
    });
  });

  describe('phone number validation', () => {
    it('should accept valid phone formats', async () => {
      const validPhones = ['+1-555-123-4567', '555-123-4567', '+44 20 1234 5678', '(555) 123-4567'];

      for (const phone of validPhones) {
        const row: ParsedVendorRow = {
          ...validRow,
          data: { ...validRow.data, contactPhone: phone }
        };

        const result = await ImportValidationService.validate([row], 0, 'vendor-1');
        expect(result.rows[0].errors.filter(e => e.field === 'contactPhone').length).toBe(0);
      }
    });

    it('should warn on phone with invalid characters', async () => {
      const row: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, contactPhone: 'phone-number-abc' }
      };

      const result = await ImportValidationService.validate([row], 0, 'vendor-1');

      expect(result.rows[0].warnings.some(e => e.code === 'PHONE_FORMAT_WARNING')).toBe(true);
      expect(result.rows[0].warnings.some(e => e.field === 'contactPhone')).toBe(true);
    });
  });

  describe('summary and error tracking', () => {
    it('should generate correct summary statistics', async () => {
      const rows = [
        validRow,
        { ...validRow, rowNumber: 3, data: { companyName: 'Test' } }, // Missing required fields
        { ...validRow, rowNumber: 4, data: { ...validRow.data, contactEmail: 'invalid' } } // Invalid email
      ];

      const result = await ImportValidationService.validate(rows, 0, 'vendor-1');

      expect(result.summary.totalRows).toBe(3);
      expect(result.summary.validRows).toBe(1);
      expect(result.summary.errorRows).toBe(2);
      expect(result.summary.totalErrors).toBeGreaterThan(0);
    });

    it('should track errors by field', async () => {
      const rows = [
        { ...validRow, data: { ...validRow.data, contactEmail: 'invalid1' } },
        { ...validRow, data: { ...validRow.data, contactEmail: 'invalid2' } }
      ];

      const result = await ImportValidationService.validate(rows, 0, 'vendor-1');

      expect(result.errorsByField.contactEmail).toBe(2);
    });

    it('should count warnings separately from errors', async () => {
      const row: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, contactPhone: 'invalid-phone-abc' }
      };

      const result = await ImportValidationService.validate([row], 0, 'vendor-1');

      expect(result.summary.warningRows).toBe(1);
      expect(result.summary.errorRows).toBe(0);
      expect(result.summary.totalWarnings).toBeGreaterThan(0);
      expect(result.valid).toBe(true); // Warnings don't block import
    });
  });

  describe('optional field handling', () => {
    it('should allow empty optional fields', async () => {
      const row: ParsedVendorRow = {
        ...validRow,
        data: {
          companyName: 'Test Corp',
          contactEmail: 'test@example.com',
          description: 'Test description'
          // contactPhone is optional and missing
        }
      };

      const result = await ImportValidationService.validate([row], 0, 'vendor-1');

      expect(result.valid).toBe(true);
    });

    it('should validate optional field if provided', async () => {
      const row: ParsedVendorRow = {
        ...validRow,
        data: {
          companyName: 'Test Corp',
          contactEmail: 'test@example.com',
          description: 'Test description',
          contactPhone: 'invalid-phone-abc' // Optional but invalid format
        }
      };

      const result = await ImportValidationService.validate([row], 0, 'vendor-1');

      expect(result.rows[0].warnings.some(e => e.field === 'contactPhone')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty rows array', async () => {
      const result = await ImportValidationService.validate([], 0, 'vendor-1');

      expect(result.valid).toBe(true);
      expect(result.summary.totalRows).toBe(0);
      expect(result.rows.length).toBe(0);
    });

    it('should handle row with no data fields', async () => {
      const emptyRow: ParsedVendorRow = {
        rowNumber: 2,
        data: {},
        rawData: {}
      };

      const result = await ImportValidationService.validate([emptyRow], 0, 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.length).toBeGreaterThan(0);
    });

    it('should handle mixed valid and invalid rows', async () => {
      const rows = [
        validRow,
        { ...validRow, rowNumber: 3, data: { companyName: 'Invalid' } },
        { ...validRow, rowNumber: 4, data: { ...validRow.data, companyName: 'Valid Corp 2' } }
      ];

      const result = await ImportValidationService.validate(rows, 0, 'vendor-1');

      expect(result.summary.totalRows).toBe(3);
      expect(result.summary.validRows).toBe(2);
      expect(result.summary.errorRows).toBe(1);
    });
  });
});
