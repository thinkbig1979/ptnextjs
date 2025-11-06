# Task BE-4: Create ExcelParserService

**Status:** 🔒 Blocked (waiting for BE-2)
**Agent:** backend-nodejs-specialist
**Estimated Time:** 5 hours
**Phase:** Backend Implementation
**Dependencies:** BE-2

## Objective

Create a service that parses uploaded Excel files and extracts vendor data into a structured format, handling data transformations and basic validation.

## Context Requirements

- Review BE-2: Field mapping configuration with transformation functions
- Review exceljs documentation for reading workbooks
- Review technical-spec.md section on data parsing requirements
- Understand error handling strategy from integration-strategy.md (PRE-2)

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/lib/services/ExcelParserService.ts`
- [ ] Parse Excel buffer into structured vendor data
- [ ] Support both .xlsx and .xls formats
- [ ] Handle missing columns gracefully
- [ ] Apply import transformation functions from field mappings
- [ ] Extract row-level data with row numbers for error tracking
- [ ] Handle empty rows and trailing whitespace
- [ ] Return structured ParseResult with data and parsing errors
- [ ] File validation (size, type, structure)
- [ ] Comprehensive error handling
- [ ] TypeScript interfaces for parsed data
- [ ] JSDoc documentation

## Detailed Specifications

### Service Structure

```typescript
// /home/edwin/development/ptnextjs/lib/services/ExcelParserService.ts

import ExcelJS from 'exceljs';
import { VendorTier } from '@/lib/types';
import {
  getImportableFieldsForTier,
  getFieldMappingByColumn,
  FieldMapping
} from '@/lib/config/excel-field-mappings';

/**
 * Parsed vendor data with row tracking
 */
export interface ParsedVendorRow {
  rowNumber: number;
  data: Partial<Record<string, any>>;
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
  value?: any;
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
      await workbook.xlsx.load(buffer);

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
          if (Object.keys(parsedRow.data).length === 0) {
            result.metadata.emptyRows++;
          } else {
            result.rows.push(parsedRow);
            result.metadata.parsedRows++;
          }
        } else {
          result.metadata.errorRows++;
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
```

## Testing Requirements

### Unit Tests

Create `/home/edwin/development/ptnextjs/__tests__/lib/services/ExcelParserService.test.ts`:

```typescript
import { ExcelParserService } from '@/lib/services/ExcelParserService';
import ExcelJS from 'exceljs';
import { VendorTier } from '@/lib/types';

describe('ExcelParserService', () => {
  // Helper to create test Excel buffer
  async function createTestExcel(data: Record<string, any>[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vendor Data');

    // Add header row
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      // Add data rows
      data.forEach(row => {
        worksheet.addRow(Object.values(row));
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  describe('parse', () => {
    it('should parse valid Excel file', async () => {
      const buffer = await createTestExcel([
        { 'Company Name': 'Test Corp', 'Contact Email': 'test@example.com' }
      ]);

      const result = await ExcelParserService.parse(buffer, 'FREE', 'test.xlsx');

      expect(result.success).toBe(true);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].data.name).toBe('Test Corp');
      expect(result.rows[0].data.email).toBe('test@example.com');
    });

    it('should reject file exceeding size limit', async () => {
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
      const result = await ExcelParserService.parse(largeBuffer, 'FREE', 'test.xlsx');

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain('File size exceeds');
    });

    it('should reject invalid file extension', async () => {
      const buffer = Buffer.from('test');
      const result = await ExcelParserService.parse(buffer, 'FREE', 'test.pdf');

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain('Invalid file type');
    });

    it('should handle missing required columns', async () => {
      const buffer = await createTestExcel([
        { 'Company Name': 'Test Corp' } // Missing required email
      ]);

      const result = await ExcelParserService.parse(buffer, 'FREE', 'test.xlsx');

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.error.includes('Missing required column'))).toBe(true);
    });

    it('should skip empty rows', async () => {
      const buffer = await createTestExcel([
        { 'Company Name': 'Test Corp', 'Contact Email': 'test@example.com' },
        { 'Company Name': '', 'Contact Email': '' }, // Empty row
        { 'Company Name': 'Test Corp 2', 'Contact Email': 'test2@example.com' }
      ]);

      const result = await ExcelParserService.parse(buffer, 'FREE', 'test.xlsx');

      expect(result.rows.length).toBe(2);
      expect(result.metadata.emptyRows).toBe(1);
    });

    it('should apply import transformations', async () => {
      const buffer = await createTestExcel([
        {
          'Company Name': 'Test Corp',
          'Contact Email': 'test@example.com',
          'Certifications': 'ISO 9001, ABYC, NMEA' // Should be transformed to array
        }
      ]);

      const result = await ExcelParserService.parse(buffer, 'TIER2', 'test.xlsx');

      expect(result.success).toBe(true);
      expect(Array.isArray(result.rows[0].data.certifications)).toBe(true);
      expect(result.rows[0].data.certifications).toEqual(['ISO 9001', 'ABYC', 'NMEA']);
    });

    it('should track row numbers for errors', async () => {
      const buffer = await createTestExcel([
        { 'Company Name': 'Test Corp', 'Contact Email': 'invalid-email' }
      ]);

      const result = await ExcelParserService.parse(buffer, 'FREE', 'test.xlsx');

      // Note: Detailed validation happens in ImportValidationService
      // This test ensures row tracking works
      expect(result.rows[0].rowNumber).toBe(2); // Row 2 (after header)
    });
  });
});
```

Run: `npm test -- ExcelParserService.test.ts`

## Evidence Requirements

- [ ] Service file created at exact path
- [ ] Unit tests passing (screenshot)
- [ ] Parse various Excel files successfully (create test files)
- [ ] Error handling working for invalid files
- [ ] Transformation functions working correctly
- [ ] Performance acceptable for large files (1000+ rows)

## Implementation Notes

- Handle Excel formulas gracefully (extract results)
- Consider memory usage for large files
- Preserve row numbers for accurate error reporting
- Handle various date formats from Excel
- Test with files created by different Excel versions
- Handle merged cells (ignore or warn)

## Next Steps

This service will be used by:
- BE-6: ImportValidationService (validates parsed data)
- BE-11: API route for Excel import

## Success Metrics

- Parse valid Excel files without errors
- Correctly handle malformed files
- Transformation functions work reliably
- Unit tests achieve >90% coverage
- Can handle files with 1000+ rows efficiently
