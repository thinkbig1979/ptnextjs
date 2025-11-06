# Task BE-6: Create ImportValidationService

**Status:** 🔒 Blocked (waiting for BE-4)
**Agent:** backend-nodejs-specialist
**Estimated Time:** 6 hours
**Phase:** Backend Implementation
**Dependencies:** BE-4

## Objective

Create a comprehensive validation service that validates parsed Excel data against business rules, schema requirements, tier restrictions, and data constraints before import.

## Context Requirements

- Review BE-2: Field mapping validation rules
- Review BE-4: ParseResult structure
- Review Payload CMS vendor collection schema in payload.config.ts
- Review TierService for tier-based validation
- Review technical-spec.md section 2.4 on validation requirements

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/lib/services/ImportValidationService.ts`
- [ ] Validate required fields presence
- [ ] Validate data types and formats
- [ ] Validate tier-based field restrictions
- [ ] Validate business rules (email format, URL format, etc.)
- [ ] Validate against database constraints (unique fields, relationships)
- [ ] Validate field length and value ranges
- [ ] Validate enum values (employeeCount, etc.)
- [ ] Return structured validation results with row-level errors
- [ ] Support batch validation for multiple rows
- [ ] Performance optimized for 1000+ rows
- [ ] Comprehensive error messages
- [ ] TypeScript type safety
- [ ] JSDoc documentation

## Detailed Specifications

### Service Structure

```typescript
// /home/edwin/development/ptnextjs/lib/services/ImportValidationService.ts

import { VendorTier } from '@/lib/types';
import { ParsedVendorRow, ParsingError } from './ExcelParserService';
import {
  getImportableFieldsForTier,
  getFieldMapping,
  FieldMapping,
  FieldDataType
} from '@/lib/config/excel-field-mappings';
import { TierService } from './TierService';
import payload from 'payload';

/**
 * Validation error severity
 */
export enum ValidationSeverity {
  ERROR = 'ERROR',       // Blocks import
  WARNING = 'WARNING'    // Allows import with warning
}

/**
 * Validation error
 */
export interface ValidationError {
  rowNumber: number;
  field: string;
  severity: ValidationSeverity;
  code: string;
  message: string;
  value?: any;
  suggestion?: string;
}

/**
 * Validation result for a single row
 */
export interface RowValidationResult {
  rowNumber: number;
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  data: Record<string, any>;
}

/**
 * Complete validation result
 */
export interface ValidationResult {
  valid: boolean;
  rows: RowValidationResult[];
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
    totalErrors: number;
    totalWarnings: number;
  };
  errorsByField: Record<string, number>;
}

/**
 * Service for validating parsed vendor data before import
 */
export class ImportValidationService {
  /**
   * Validate parsed vendor data
   * @param rows - Parsed vendor rows from ExcelParserService
   * @param tier - Vendor tier
   * @param vendorId - Vendor ID (for uniqueness checks)
   * @returns Validation result
   */
  static async validate(
    rows: ParsedVendorRow[],
    tier: VendorTier,
    vendorId: string
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      rows: [],
      summary: {
        totalRows: rows.length,
        validRows: 0,
        errorRows: 0,
        warningRows: 0,
        totalErrors: 0,
        totalWarnings: 0
      },
      errorsByField: {}
    };

    // Get expected fields for tier
    const expectedFields = getImportableFieldsForTier(tier);

    // Validate each row
    for (const row of rows) {
      const rowResult = await this.validateRow(row, tier, expectedFields, vendorId);
      result.rows.push(rowResult);

      // Update summary
      if (!rowResult.valid) {
        result.valid = false;
        result.summary.errorRows++;
      } else if (rowResult.warnings.length > 0) {
        result.summary.warningRows++;
      } else {
        result.summary.validRows++;
      }

      result.summary.totalErrors += rowResult.errors.length;
      result.summary.totalWarnings += rowResult.warnings.length;

      // Count errors by field
      rowResult.errors.forEach(error => {
        result.errorsByField[error.field] = (result.errorsByField[error.field] || 0) + 1;
      });
    }

    return result;
  }

  /**
   * Validate a single row
   */
  private static async validateRow(
    row: ParsedVendorRow,
    tier: VendorTier,
    expectedFields: FieldMapping[],
    vendorId: string
  ): Promise<RowValidationResult> {
    const rowResult: RowValidationResult = {
      rowNumber: row.rowNumber,
      valid: true,
      errors: [],
      warnings: [],
      data: row.data
    };

    // Validate required fields
    this.validateRequiredFields(row, expectedFields, rowResult);

    // Validate each field
    for (const [fieldName, value] of Object.entries(row.data)) {
      const fieldMapping = getFieldMapping(fieldName);
      if (!fieldMapping) continue;

      // Validate tier access
      this.validateTierAccess(row, fieldName, fieldMapping, tier, rowResult);

      // Validate data type and format
      await this.validateField(row, fieldName, value, fieldMapping, rowResult);

      // Validate custom rules
      if (fieldMapping.customValidator) {
        const error = fieldMapping.customValidator(value);
        if (error) {
          rowResult.errors.push({
            rowNumber: row.rowNumber,
            field: fieldName,
            severity: ValidationSeverity.ERROR,
            code: 'CUSTOM_VALIDATION_FAILED',
            message: error,
            value
          });
        }
      }
    }

    // Validate business rules
    await this.validateBusinessRules(row, rowResult, vendorId);

    rowResult.valid = rowResult.errors.length === 0;
    return rowResult;
  }

  /**
   * Validate required fields are present
   */
  private static validateRequiredFields(
    row: ParsedVendorRow,
    expectedFields: FieldMapping[],
    rowResult: RowValidationResult
  ): void {
    expectedFields.filter(f => f.required).forEach(field => {
      const value = row.data[field.fieldName];
      if (value === null || value === undefined || value === '') {
        rowResult.errors.push({
          rowNumber: row.rowNumber,
          field: field.fieldName,
          severity: ValidationSeverity.ERROR,
          code: 'REQUIRED_FIELD_MISSING',
          message: `${field.excelColumn} is required`,
          suggestion: field.example ? `Example: ${field.example}` : undefined
        });
      }
    });
  }

  /**
   * Validate tier access for field
   */
  private static validateTierAccess(
    row: ParsedVendorRow,
    fieldName: string,
    fieldMapping: FieldMapping,
    tier: VendorTier,
    rowResult: RowValidationResult
  ): void {
    const hasAccess = TierService.checkFieldAccess(tier, fieldMapping.accessLevel);
    if (!hasAccess) {
      rowResult.errors.push({
        rowNumber: row.rowNumber,
        field: fieldName,
        severity: ValidationSeverity.ERROR,
        code: 'TIER_ACCESS_DENIED',
        message: `Field ${fieldMapping.excelColumn} is not available for ${tier} tier`,
        suggestion: `Upgrade to ${fieldMapping.accessLevel} or higher to use this field`
      });
    }
  }

  /**
   * Validate individual field
   */
  private static async validateField(
    row: ParsedVendorRow,
    fieldName: string,
    value: any,
    fieldMapping: FieldMapping,
    rowResult: RowValidationResult
  ): Promise<void> {
    // Skip validation for empty optional fields
    if ((value === null || value === undefined || value === '') && !fieldMapping.required) {
      return;
    }

    // Validate data type
    switch (fieldMapping.dataType) {
      case FieldDataType.EMAIL:
        this.validateEmail(row.rowNumber, fieldName, value, rowResult);
        break;
      case FieldDataType.URL:
        this.validateURL(row.rowNumber, fieldName, value, rowResult);
        break;
      case FieldDataType.PHONE:
        this.validatePhone(row.rowNumber, fieldName, value, rowResult);
        break;
      case FieldDataType.NUMBER:
        this.validateNumber(row.rowNumber, fieldName, value, fieldMapping, rowResult);
        break;
      case FieldDataType.STRING:
        this.validateString(row.rowNumber, fieldName, value, fieldMapping, rowResult);
        break;
      case FieldDataType.ARRAY_STRING:
        this.validateArrayString(row.rowNumber, fieldName, value, rowResult);
        break;
    }

    // Validate allowed values (enum)
    if (fieldMapping.allowedValues && fieldMapping.allowedValues.length > 0) {
      this.validateAllowedValues(row.rowNumber, fieldName, value, fieldMapping, rowResult);
    }
  }

  /**
   * Validate email format
   */
  private static validateEmail(
    rowNumber: number,
    fieldName: string,
    value: any,
    rowResult: RowValidationResult
  ): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) {
      rowResult.errors.push({
        rowNumber,
        field: fieldName,
        severity: ValidationSeverity.ERROR,
        code: 'INVALID_EMAIL_FORMAT',
        message: 'Invalid email format',
        value,
        suggestion: 'Use format: name@domain.com'
      });
    }
  }

  /**
   * Validate URL format
   */
  private static validateURL(
    rowNumber: number,
    fieldName: string,
    value: any,
    rowResult: RowValidationResult
  ): void {
    try {
      new URL(String(value));
    } catch {
      rowResult.errors.push({
        rowNumber,
        field: fieldName,
        severity: ValidationSeverity.ERROR,
        code: 'INVALID_URL_FORMAT',
        message: 'Invalid URL format',
        value,
        suggestion: 'Use format: https://www.example.com'
      });
    }
  }

  /**
   * Validate phone format
   */
  private static validatePhone(
    rowNumber: number,
    fieldName: string,
    value: any,
    rowResult: RowValidationResult
  ): void {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(String(value))) {
      rowResult.warnings.push({
        rowNumber,
        field: fieldName,
        severity: ValidationSeverity.WARNING,
        code: 'PHONE_FORMAT_WARNING',
        message: 'Phone number format may be invalid',
        value,
        suggestion: 'Use format: +1-555-123-4567'
      });
    }
  }

  /**
   * Validate number value and range
   */
  private static validateNumber(
    rowNumber: number,
    fieldName: string,
    value: any,
    fieldMapping: FieldMapping,
    rowResult: RowValidationResult
  ): void {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      rowResult.errors.push({
        rowNumber,
        field: fieldName,
        severity: ValidationSeverity.ERROR,
        code: 'INVALID_NUMBER',
        message: 'Value must be a number',
        value
      });
      return;
    }

    if (fieldMapping.minValue !== undefined && numValue < fieldMapping.minValue) {
      rowResult.errors.push({
        rowNumber,
        field: fieldName,
        severity: ValidationSeverity.ERROR,
        code: 'NUMBER_TOO_SMALL',
        message: `Value must be at least ${fieldMapping.minValue}`,
        value
      });
    }

    if (fieldMapping.maxValue !== undefined && numValue > fieldMapping.maxValue) {
      rowResult.errors.push({
        rowNumber,
        field: fieldName,
        severity: ValidationSeverity.ERROR,
        code: 'NUMBER_TOO_LARGE',
        message: `Value must be at most ${fieldMapping.maxValue}`,
        value
      });
    }
  }

  /**
   * Validate string length
   */
  private static validateString(
    rowNumber: number,
    fieldName: string,
    value: any,
    fieldMapping: FieldMapping,
    rowResult: RowValidationResult
  ): void {
    const strValue = String(value);
    if (fieldMapping.maxLength && strValue.length > fieldMapping.maxLength) {
      rowResult.errors.push({
        rowNumber,
        field: fieldName,
        severity: ValidationSeverity.ERROR,
        code: 'STRING_TOO_LONG',
        message: `Maximum length is ${fieldMapping.maxLength} characters (current: ${strValue.length})`,
        value: strValue.substring(0, 50) + '...'
      });
    }
  }

  /**
   * Validate array of strings
   */
  private static validateArrayString(
    rowNumber: number,
    fieldName: string,
    value: any,
    rowResult: RowValidationResult
  ): void {
    if (!Array.isArray(value)) {
      rowResult.errors.push({
        rowNumber,
        field: fieldName,
        severity: ValidationSeverity.ERROR,
        code: 'INVALID_ARRAY',
        message: 'Value must be an array',
        value
      });
    }
  }

  /**
   * Validate allowed values (enum)
   */
  private static validateAllowedValues(
    rowNumber: number,
    fieldName: string,
    value: any,
    fieldMapping: FieldMapping,
    rowResult: RowValidationResult
  ): void {
    if (!fieldMapping.allowedValues!.includes(String(value))) {
      rowResult.errors.push({
        rowNumber,
        field: fieldName,
        severity: ValidationSeverity.ERROR,
        code: 'INVALID_ENUM_VALUE',
        message: `Value must be one of: ${fieldMapping.allowedValues!.join(', ')}`,
        value,
        suggestion: `Valid values: ${fieldMapping.allowedValues!.join(', ')}`
      });
    }
  }

  /**
   * Validate business rules
   */
  private static async validateBusinessRules(
    row: ParsedVendorRow,
    rowResult: RowValidationResult,
    vendorId: string
  ): Promise<void> {
    // Example: Check for duplicate vendor names (if updating)
    // This would query the database to check uniqueness
    // Add more business rules as needed
  }
}
```

## Testing Requirements

### Unit Tests

Create `/home/edwin/development/ptnextjs/__tests__/lib/services/ImportValidationService.test.ts`:

```typescript
import { ImportValidationService, ValidationSeverity } from '@/lib/services/ImportValidationService';
import { ParsedVendorRow } from '@/lib/services/ExcelParserService';

describe('ImportValidationService', () => {
  const validRow: ParsedVendorRow = {
    rowNumber: 2,
    data: {
      name: 'Test Corp',
      email: 'test@example.com',
      description: 'Test description',
      phone: '+1-555-123-4567'
    },
    rawData: {}
  };

  describe('validate', () => {
    it('should validate valid data', async () => {
      const result = await ImportValidationService.validate([validRow], 'FREE', 'vendor-1');

      expect(result.valid).toBe(true);
      expect(result.summary.validRows).toBe(1);
      expect(result.summary.errorRows).toBe(0);
    });

    it('should detect missing required fields', async () => {
      const invalidRow: ParsedVendorRow = {
        ...validRow,
        data: { name: 'Test Corp' } // Missing required email
      };

      const result = await ImportValidationService.validate([invalidRow], 'FREE', 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.summary.errorRows).toBe(1);
      expect(result.rows[0].errors.some(e => e.code === 'REQUIRED_FIELD_MISSING')).toBe(true);
    });

    it('should validate email format', async () => {
      const invalidRow: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, email: 'invalid-email' }
      };

      const result = await ImportValidationService.validate([invalidRow], 'FREE', 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'INVALID_EMAIL_FORMAT')).toBe(true);
    });

    it('should validate URL format', async () => {
      const rowWithUrl: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, website: 'not-a-url' }
      };

      const result = await ImportValidationService.validate([rowWithUrl], 'TIER1', 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'INVALID_URL_FORMAT')).toBe(true);
    });

    it('should validate tier access', async () => {
      const tierRestrictedRow: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, website: 'https://test.com' }
      };

      const result = await ImportValidationService.validate([tierRestrictedRow], 'FREE', 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'TIER_ACCESS_DENIED')).toBe(true);
    });

    it('should validate string length', async () => {
      const longString = 'a'.repeat(500);
      const rowWithLongString: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, description: longString }
      };

      const result = await ImportValidationService.validate([rowWithLongString], 'FREE', 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'STRING_TOO_LONG')).toBe(true);
    });

    it('should validate number ranges', async () => {
      const rowWithInvalidYear: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, founded: 1700 } // Too old
      };

      const result = await ImportValidationService.validate([rowWithInvalidYear], 'TIER1', 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'NUMBER_TOO_SMALL')).toBe(true);
    });

    it('should validate enum values', async () => {
      const rowWithInvalidEnum: ParsedVendorRow = {
        ...validRow,
        data: { ...validRow.data, employeeCount: 'invalid-range' }
      };

      const result = await ImportValidationService.validate([rowWithInvalidEnum], 'TIER1', 'vendor-1');

      expect(result.valid).toBe(false);
      expect(result.rows[0].errors.some(e => e.code === 'INVALID_ENUM_VALUE')).toBe(true);
    });

    it('should generate errors by field summary', async () => {
      const rows = [
        { ...validRow, data: { ...validRow.data, email: 'invalid1' } },
        { ...validRow, data: { ...validRow.data, email: 'invalid2' } }
      ];

      const result = await ImportValidationService.validate(rows as ParsedVendorRow[], 'FREE', 'vendor-1');

      expect(result.errorsByField.email).toBe(2);
    });
  });
});
```

Run: `npm test -- ImportValidationService.test.ts`

## Evidence Requirements

- [ ] Service file created at exact path
- [ ] Unit tests passing (screenshot)
- [ ] All validation rules working correctly
- [ ] Error messages are user-friendly and actionable
- [ ] Performance acceptable for 1000+ rows

## Implementation Notes

- Make error messages user-friendly and actionable
- Include suggestions for fixing errors where possible
- Consider performance for large datasets (avoid N+1 queries)
- Use async validation for database checks
- Track validation errors by field for better UX

## Next Steps

This service will be used by:
- BE-7: ImportExecutionService (executes import after validation passes)
- BE-11: API route for Excel import (validates before showing preview)

## Success Metrics

- All validation rules work correctly
- Error messages are clear and helpful
- Unit tests achieve >95% coverage
- Performance: validate 1000 rows in <5 seconds
- Zero false positives in validation
