/**
 * Unit Tests for ExcelParserService
 *
 * Tests cover:
 * - Valid Excel file parsing
 * - File validation (size, extension, empty)
 * - Missing required columns handling
 * - Empty row skipping
 * - Row number tracking for errors
 * - Various Excel cell types (formulas, dates, rich text)
 * - Unknown column warnings
 */

import { ExcelParserService } from '@/lib/services/ExcelParserService';
import ExcelJS from 'exceljs';

describe('ExcelParserService', () => {
  /**
   * Helper to create test Excel buffer with all required FREE tier fields
   */
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

  /**
   * Helper to create test Excel with custom worksheet name
   */
  async function createTestExcelWithSheetName(
    sheetName: string,
    data: Record<string, any>[]
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      data.forEach(row => {
        worksheet.addRow(Object.values(row));
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  describe('parse', () => {
    describe('valid Excel file parsing', () => {
      it('should parse valid Excel file with FREE tier fields', async () => {
        const buffer = await createTestExcel([
          {
            'Company Name': 'Test Corp',
            'Short Description': 'Test description',
            'Contact Email': 'test@example.com'
          }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows.length).toBe(1);
        expect(result.rows[0].data.companyName).toBe('Test Corp');
        expect(result.rows[0].data.description).toBe('Test description');
        expect(result.rows[0].data.contactEmail).toBe('test@example.com');
        expect(result.rows[0].rowNumber).toBe(2); // Row 2 (after header)
      });

      it('should parse Excel with multiple rows', async () => {
        const buffer = await createTestExcel([
          { 'Company Name': 'Corp 1', 'Short Description': 'Desc 1', 'Contact Email': 'corp1@example.com' },
          { 'Company Name': 'Corp 2', 'Short Description': 'Desc 2', 'Contact Email': 'corp2@example.com' },
          { 'Company Name': 'Corp 3', 'Short Description': 'Desc 3', 'Contact Email': 'corp3@example.com' }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows.length).toBe(3);
        expect(result.metadata.parsedRows).toBe(3);
        expect(result.rows[0].rowNumber).toBe(2);
        expect(result.rows[1].rowNumber).toBe(3);
        expect(result.rows[2].rowNumber).toBe(4);
      });

      it('should use "Vendor Data" worksheet if available', async () => {
        const buffer = await createTestExcelWithSheetName('Vendor Data', [
          { 'Company Name': 'Test Corp', 'Short Description': 'Test desc', 'Contact Email': 'test@example.com' }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows.length).toBe(1);
      });

      it('should fall back to first worksheet if "Vendor Data" not found', async () => {
        const buffer = await createTestExcelWithSheetName('Sheet1', [
          { 'Company Name': 'Test Corp', 'Short Description': 'Test desc', 'Contact Email': 'test@example.com' }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows.length).toBe(1);
      });
    });

    describe('file validation', () => {
      it('should reject file exceeding size limit', async () => {
        const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
        const result = await ExcelParserService.parse(largeBuffer, 0, 'test.xlsx');

        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].error).toContain('File size exceeds');
      });

      it('should reject invalid file extension (.pdf)', async () => {
        const buffer = Buffer.from('test');
        const result = await ExcelParserService.parse(buffer, 0, 'test.pdf');

        expect(result.success).toBe(false);
        expect(result.errors[0].error).toContain('Invalid file type');
      });

      it('should reject invalid file extension (.doc)', async () => {
        const buffer = Buffer.from('test');
        const result = await ExcelParserService.parse(buffer, 0, 'test.doc');

        expect(result.success).toBe(false);
        expect(result.errors[0].error).toContain('Invalid file type');
      });

      it('should accept .xlsx extension', async () => {
        const buffer = await createTestExcel([
          { 'Company Name': 'Test Corp', 'Short Description': 'Test desc', 'Contact Email': 'test@example.com' }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.success).toBe(true);
      });

      it('should accept .xls extension', async () => {
        const buffer = await createTestExcel([
          { 'Company Name': 'Test Corp', 'Short Description': 'Test desc', 'Contact Email': 'test@example.com' }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xls');

        expect(result.success).toBe(true);
      });

      it('should reject empty file buffer', async () => {
        const emptyBuffer = Buffer.alloc(0);
        const result = await ExcelParserService.parse(emptyBuffer, 0, 'test.xlsx');

        expect(result.success).toBe(false);
        expect(result.errors[0].error).toContain('File is empty');
      });
    });

    describe('missing required columns', () => {
      it('should detect missing required Company Name column', async () => {
        const buffer = await createTestExcel([
          { 'Short Description': 'Test desc', 'Contact Email': 'test@example.com' } // Missing Company Name
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.success).toBe(false);
        expect(result.errors.some(e =>
          e.error.includes('Missing required column') &&
          e.column === 'Company Name'
        )).toBe(true);
      });

      it('should detect missing required Contact Email column', async () => {
        const buffer = await createTestExcel([
          { 'Company Name': 'Test Corp', 'Short Description': 'Test desc' } // Missing Contact Email
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.success).toBe(false);
        expect(result.errors.some(e =>
          e.error.includes('Missing required column') &&
          e.column === 'Contact Email'
        )).toBe(true);
      });

      it('should detect multiple missing required columns', async () => {
        const buffer = await createTestExcel([
          { 'Website URL': 'https://example.com' } // Missing all required columns
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.success).toBe(false);
        expect(result.errors.filter(e => e.error.includes('Missing required column')).length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('empty row handling', () => {
      it('should skip completely empty rows', async () => {
        const buffer = await createTestExcel([
          { 'Company Name': 'Test Corp', 'Short Description': 'Desc 1', 'Contact Email': 'test@example.com' },
          { 'Company Name': '', 'Short Description': '', 'Contact Email': '' }, // Empty row
          { 'Company Name': 'Test Corp 2', 'Short Description': 'Desc 2', 'Contact Email': 'test2@example.com' }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows.length).toBe(2);
        expect(result.metadata.emptyRows).toBe(1);
        expect(result.metadata.parsedRows).toBe(2);
      });

      it('should skip rows with only whitespace', async () => {
        const buffer = await createTestExcel([
          { 'Company Name': 'Test Corp', 'Short Description': 'Desc 1', 'Contact Email': 'test@example.com' },
          { 'Company Name': '   ', 'Short Description': '  ', 'Contact Email': '  ' }, // Whitespace only
          { 'Company Name': 'Test Corp 2', 'Short Description': 'Desc 2', 'Contact Email': 'test2@example.com' }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows.length).toBe(2);
      });

      it('should count total, parsed, and empty rows correctly', async () => {
        const buffer = await createTestExcel([
          { 'Company Name': 'Corp 1', 'Short Description': 'Desc 1', 'Contact Email': 'test1@example.com' },
          { 'Company Name': '', 'Short Description': '', 'Contact Email': '' },
          { 'Company Name': 'Corp 2', 'Short Description': 'Desc 2', 'Contact Email': 'test2@example.com' },
          { 'Company Name': '', 'Short Description': '', 'Contact Email': '' },
          { 'Company Name': '', 'Short Description': '', 'Contact Email': '' }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.metadata.totalRows).toBe(5);
        expect(result.metadata.parsedRows).toBe(2);
        expect(result.metadata.emptyRows).toBe(3);
      });
    });

    describe('row number tracking', () => {
      it('should track correct row numbers for parsed data', async () => {
        const buffer = await createTestExcel([
          { 'Company Name': 'Corp 1', 'Short Description': 'Desc 1', 'Contact Email': 'test1@example.com' },
          { 'Company Name': 'Corp 2', 'Short Description': 'Desc 2', 'Contact Email': 'test2@example.com' },
          { 'Company Name': 'Corp 3', 'Short Description': 'Desc 3', 'Contact Email': 'test3@example.com' }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.rows[0].rowNumber).toBe(2);
        expect(result.rows[1].rowNumber).toBe(3);
        expect(result.rows[2].rowNumber).toBe(4);
      });

      it('should track row numbers correctly when skipping empty rows', async () => {
        const buffer = await createTestExcel([
          { 'Company Name': 'Corp 1', 'Short Description': 'Desc 1', 'Contact Email': 'test1@example.com' }, // Row 2
          { 'Company Name': '', 'Short Description': '', 'Contact Email': '' },                                 // Row 3 (empty)
          { 'Company Name': 'Corp 2', 'Short Description': 'Desc 2', 'Contact Email': 'test2@example.com' }  // Row 4
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.rows.length).toBe(2);
        expect(result.rows[0].rowNumber).toBe(2);
        expect(result.rows[1].rowNumber).toBe(4); // Should be 4, not 3
      });
    });

    describe('unknown columns', () => {
      it('should warn about unknown columns but continue parsing', async () => {
        const buffer = await createTestExcel([
          {
            'Company Name': 'Test Corp',
            'Short Description': 'Test desc',
            'Contact Email': 'test@example.com',
            'Unknown Column': 'some value'
          }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.warnings.some(w =>
          w.column === 'Unknown Column' &&
          w.error.includes('Unknown column')
        )).toBe(true);
      });

      it('should ignore unknown columns in data extraction', async () => {
        const buffer = await createTestExcel([
          {
            'Company Name': 'Test Corp',
            'Short Description': 'Test desc',
            'Contact Email': 'test@example.com',
            'Invalid Column': 'ignored value'
          }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.rows[0].data.companyName).toBe('Test Corp');
        expect(result.rows[0].data.contactEmail).toBe('test@example.com');
        expect(result.rows[0].data['Invalid Column']).toBeUndefined();
      });
    });

    describe('Excel cell type handling', () => {
      it('should handle date cells', async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Vendor Data');

        worksheet.addRow(['Company Name', 'Short Description', 'Contact Email', 'Founded Year']);
        const dataRow = worksheet.addRow(['Test Corp', 'Test desc', 'test@example.com', 2020]);

        const buffer = await workbook.xlsx.writeBuffer();

        const result = await ExcelParserService.parse(Buffer.from(buffer), 1, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows.length).toBe(1);
      });

      it('should handle formula cells by extracting result', async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Vendor Data');

        worksheet.addRow(['Company Name', 'Short Description', 'Contact Email']);
        const row = worksheet.addRow(['Test Corp', 'Test desc', '']);
        row.getCell(3).value = { formula: 'CONCATENATE("test", "@example.com")', result: 'test@example.com' };

        const buffer = await workbook.xlsx.writeBuffer();

        const result = await ExcelParserService.parse(Buffer.from(buffer), 0, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows[0].data.contactEmail).toBe('test@example.com');
      });

      it('should handle rich text cells', async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Vendor Data');

        worksheet.addRow(['Company Name', 'Short Description', 'Contact Email']);
        const row = worksheet.addRow(['', 'Test desc', 'test@example.com']);
        row.getCell(1).value = {
          richText: [
            { text: 'Test' },
            { text: ' Corp' }
          ]
        };

        const buffer = await workbook.xlsx.writeBuffer();

        const result = await ExcelParserService.parse(Buffer.from(buffer), 0, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows[0].data.companyName).toBe('Test Corp');
      });

      it('should trim whitespace from cell values', async () => {
        const buffer = await createTestExcel([
          {
            'Company Name': '  Test Corp  ',
            'Short Description': '  Test desc  ',
            'Contact Email': '  test@example.com  '
          }
        ]);

        const result = await ExcelParserService.parse(buffer, 0, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows[0].data.companyName).toBe('Test Corp');
        expect(result.rows[0].data.description).toBe('Test desc');
        expect(result.rows[0].data.contactEmail).toBe('test@example.com');
      });
    });

    describe('edge cases', () => {
      it('should handle workbook with no worksheets', async () => {
        const workbook = new ExcelJS.Workbook();
        const buffer = await workbook.xlsx.writeBuffer();

        const result = await ExcelParserService.parse(Buffer.from(buffer), 0, 'test.xlsx');

        expect(result.success).toBe(false);
        expect(result.errors[0].error).toContain('No data worksheet found');
      });

      it('should handle Excel file with only header row (no data)', async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Vendor Data');
        worksheet.addRow(['Company Name', 'Short Description', 'Contact Email']);
        const newBuffer = await workbook.xlsx.writeBuffer();

        const result = await ExcelParserService.parse(Buffer.from(newBuffer), 0, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows.length).toBe(0);
        expect(result.metadata.totalRows).toBe(0);
      });

      it('should handle malformed Excel buffer gracefully', async () => {
        const malformedBuffer = Buffer.from('This is not an Excel file');

        const result = await ExcelParserService.parse(malformedBuffer, 0, 'test.xlsx');

        expect(result.success).toBe(false);
        expect(result.errors[0].error).toContain('Failed to parse Excel file');
      });
    });

    describe('tier-specific field handling', () => {
      it('should accept tier-appropriate fields for TIER2', async () => {
        const buffer = await createTestExcel([
          {
            'Company Name': 'Test Corp',
            'Short Description': 'Test desc',
            'Contact Email': 'test@example.com',
            'Detailed Description': 'This is a longer description for tier 2'
          }
        ]);

        const result = await ExcelParserService.parse(buffer, 2, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows[0].data.longDescription).toBeDefined();
        expect(result.rows[0].data.longDescription).toBe('This is a longer description for tier 2');
      });

      it('should process fields according to tier access level', async () => {
        const buffer = await createTestExcel([
          {
            'Company Name': 'Test Corp',
            'Short Description': 'Test desc',
            'Contact Email': 'test@example.com',
            'Website URL': 'https://example.com'
          }
        ]);

        const result = await ExcelParserService.parse(buffer, 1, 'test.xlsx');

        expect(result.success).toBe(true);
        expect(result.rows[0].data.companyName).toBe('Test Corp');
        expect(result.rows[0].data.contactEmail).toBe('test@example.com');
        expect(result.rows[0].data.website).toBe('https://example.com');
      });
    });
  });
});
