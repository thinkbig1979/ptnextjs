/**
 * Excel Parser Service
 *
 * Parses uploaded Excel files and extracts vendor data into a structured format,
 * handling data transformations and basic validation.
 *
 * Features:
 * - Parse Excel buffer into structured vendor data
 * - Support both .xlsx and .xls formats
 * - Handle missing columns gracefully
 * - Apply import transformation functions from field mappings
 * - Extract row-level data with row numbers for error tracking
 * - Handle empty rows and trailing whitespace
 * - Comprehensive error handling
 *
 * @module lib/services/ExcelParserService
 */

import ExcelJS from 'exceljs';
import {
  getImportableFieldsForTier,
  getFieldMappingByColumn,
  type FieldMapping,
  type VendorTier
} from '@/lib/config/excel-field-mappings';

/**
 * Parsed vendor data with row tracking
 */
export interface ParsedVendorRow {
  rowNumber: number;
  data: Partial<Record<string, unknown>>;
  rawData: Record<string, string>; // Original values for debugging
}

/**
 * Parsing error with context
 */
export interface ParsingError {
  rowNumber: number;
  column: string;
  fieldName?: string;
  error: string;
  value?: unknown;
}

/**
 * Result of parsing operation
 */
export interface ParseResult {
  success: boolean;
  rows: ParsedVendorRow[];
  errors: ParsingError[];
  warnings: ParsingError[];
  metadata: {
    totalRows: number;
    parsedRows: number;
    emptyRows: number;
    errorRows: number;
  };
}

/**
 * Service for parsing Excel files into vendor data
 */
export class ExcelParserService {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];

  /**
   * Parse Excel file buffer into vendor data
   * @param buffer - Excel file buffer
   * @param tier - Vendor tier (determines which fields are expected)
   * @param filename - Original filename for validation
   * @returns Parse result with data and errors
   */
  static async parse(
    buffer: Buffer,
    tier: VendorTier,
    filename: string
  ): Promise<ParseResult> {
    const result: ParseResult = {
      success: false,
      rows: [],
      errors: [],
      warnings: [],
      metadata: {
        totalRows: 0,
        parsedRows: 0,
        emptyRows: 0,
        errorRows: 0
      }
    };

    try {
      // Validate file
      const fileValidation = this.validateFile(buffer, filename);
      if (!fileValidation.valid) {
        result.errors.push({
          rowNumber: 0,
          column: 'File',
          error: fileValidation.error || 'Invalid file'
        });
        return result;
      }

      // Load workbook
      const workbook = new ExcelJS.Workbook();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await workbook.xlsx.load(buffer as any);

      // Get data worksheet
      const worksheet = workbook.getWorksheet('Vendor Data') || workbook.worksheets[0];
      if (!worksheet) {
        result.errors.push({
          rowNumber: 0,
          column: 'Worksheet',
          error: 'No data worksheet found'
        });
        return result;
      }

      // Get importable fields for tier
      const expectedFields = getImportableFieldsForTier(tier);

      // Parse header row
      const headerRow = worksheet.getRow(1);
      const columnMapping = this.parseHeaderRow(headerRow, expectedFields, result);

      // Parse data rows (starting from row 2, skipping example if present)
      const startRow = 2;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber < startRow) return;

        result.metadata.totalRows++;

        const parsedRow = this.parseDataRow(
          row,
          rowNumber,
          columnMapping,
          expectedFields,
          result
        );

        if (parsedRow) {
          result.rows.push(parsedRow);
          result.metadata.parsedRows++;
        } else {
          // Row returned null - completely empty
          result.metadata.emptyRows++;
        }
      });

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      result.errors.push({
        rowNumber: 0,
        column: 'File',
        error: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return result;
    }
  }

  /**
   * Validate file before parsing
   */
  private static validateFile(buffer: Buffer, filename: string): { valid: boolean; error?: string } {
    // Check file size
    if (buffer.length > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed (${this.MAX_FILE_SIZE / 1024 / 1024}MB)`
      };
    }

    // Check file extension
    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${this.ALLOWED_EXTENSIONS.join(', ')}`
      };
    }

    // Check buffer is not empty
    if (buffer.length === 0) {
      return {
        valid: false,
        error: 'File is empty'
      };
    }

    return { valid: true };
  }

  /**
   * Parse header row and create column mapping
   */
  private static parseHeaderRow(
    headerRow: ExcelJS.Row,
    expectedFields: FieldMapping[],
    result: ParseResult
  ): Map<number, FieldMapping> {
    const columnMapping = new Map<number, FieldMapping>();

    headerRow.eachCell((cell, colNumber) => {
      const columnName = String(cell.value || '').trim();
      if (!columnName) return;

      const fieldMapping = getFieldMappingByColumn(columnName);
      if (fieldMapping) {
        columnMapping.set(colNumber, fieldMapping);
      } else {
        result.warnings.push({
          rowNumber: 1,
          column: columnName,
          error: 'Unknown column (will be ignored)'
        });
      }
    });

    // Check for missing required columns
    expectedFields.filter(f => f.required).forEach(field => {
      const found = Array.from(columnMapping.values()).some(
        mapping => mapping.fieldName === field.fieldName
      );
      if (!found) {
        result.errors.push({
          rowNumber: 1,
          column: field.excelColumn,
          fieldName: field.fieldName,
          error: `Missing required column: ${field.excelColumn}`
        });
      }
    });

    return columnMapping;
  }

  /**
   * Parse a single data row
   */
  private static parseDataRow(
    row: ExcelJS.Row,
    rowNumber: number,
    columnMapping: Map<number, FieldMapping>,
    expectedFields: FieldMapping[],
    result: ParseResult
  ): ParsedVendorRow | null {
    const parsedRow: ParsedVendorRow = {
      rowNumber,
      data: {},
      rawData: {}
    };

    let hasAnyData = false;

    row.eachCell((cell, colNumber) => {
      const fieldMapping = columnMapping.get(colNumber);
      if (!fieldMapping) return;

      const rawValue = this.getCellValue(cell);
      parsedRow.rawData[fieldMapping.fieldName] = rawValue;

      // Skip empty cells
      if (rawValue === '' || rawValue === null || rawValue === undefined) {
        return;
      }

      hasAnyData = true;

      try {
        // Apply import transformation if defined
        let transformedValue = rawValue;
        if (fieldMapping.importTransform) {
          transformedValue = fieldMapping.importTransform(rawValue);
        }

        parsedRow.data[fieldMapping.fieldName] = transformedValue;

      } catch (error) {
        result.errors.push({
          rowNumber,
          column: fieldMapping.excelColumn,
          fieldName: fieldMapping.fieldName,
          error: `Transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          value: rawValue
        });
      }
    });

    // Return null if completely empty row
    return hasAnyData ? parsedRow : null;
  }

  /**
   * Extract cell value as string
   */
  private static getCellValue(cell: ExcelJS.Cell): string {
    const value = cell.value;

    if (value === null || value === undefined) return '';

    // Handle rich text
    if (typeof value === 'object' && 'richText' in value) {
      return value.richText.map((rt: any) => rt.text).join('');
    }

    // Handle formulas
    if (typeof value === 'object' && 'result' in value) {
      return String(value.result || '');
    }

    // Handle dates
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Convert to string and trim
    return String(value).trim();
  }
}
