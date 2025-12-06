/**
 * Import Validation Service
 *
 * Comprehensive validation service that validates parsed Excel data against
 * business rules, schema requirements, tier restrictions, and data constraints.
 *
 * Features:
 * - Required field validation
 * - Data type and format validation
 * - Tier-based field access validation
 * - Business rule validation
 * - Field length and value range validation
 * - Enum value validation
 * - Row-level error tracking
 *
 * @module lib/services/ImportValidationService
 */

import type { ParsedVendorRow } from './ExcelParserService';
import {
  getImportableFieldsForTier,
  getFieldMapping,
  hasFieldAccess,
  type FieldMapping,
  FieldDataType,
  type VendorTier
} from '@/lib/config/excel-field-mappings';

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
  value?: unknown;
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
  data: Record<string, unknown>;
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
   * @param tier - Vendor tier (0-4)
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
    const hasAccess = hasFieldAccess(tier, fieldName);
    if (!hasAccess) {
      rowResult.errors.push({
        rowNumber: row.rowNumber,
        field: fieldName,
        severity: ValidationSeverity.ERROR,
        code: 'TIER_ACCESS_DENIED',
        message: `Field "${fieldMapping.excelColumn}" is not available for tier ${tier}`,
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
    value: unknown,
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
      case FieldDataType.YEAR:
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
    value: unknown,
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
    value: unknown,
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
    value: unknown,
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
    value: unknown,
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
    value: unknown,
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
    value: unknown,
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
    value: unknown,
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
   *
   * This method can be extended to validate custom business rules such as:
   * - Uniqueness constraints
   * - Cross-field validation
   * - External data validation
   */
  private static async validateBusinessRules(
    row: ParsedVendorRow,
    rowResult: RowValidationResult,
    vendorId: string
  ): Promise<void> {
    // Business rules can be added here as needed
    // Example: Check for duplicate vendor names, validate relationships, etc.

    // For now, we don't have specific business rules to validate
    // This is a placeholder for future expansion
  }
}
