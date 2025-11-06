# Task BE-5: Create ExcelExportService

**Status:** 🔒 Blocked (waiting for BE-2)
**Agent:** backend-nodejs-specialist
**Estimated Time:** 4 hours
**Phase:** Backend Implementation
**Dependencies:** BE-2

## Objective

Create a service that exports vendor data to Excel format with tier-appropriate fields, proper formatting, and data transformations.

## Context Requirements

- Review BE-2: Field mapping configuration with export transformations
- Review exceljs documentation for styling and formatting
- Review existing vendor data structure in /lib/types.ts
- Understand export requirements from technical-spec.md

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/lib/services/ExcelExportService.ts`
- [ ] Export vendor data to Excel buffer
- [ ] Include only tier-appropriate fields
- [ ] Apply export transformation functions
- [ ] Professional formatting (headers, alignment, colors)
- [ ] Handle null/undefined values gracefully
- [ ] Include export metadata (date, tier, vendor name)
- [ ] Support single vendor and multiple vendor export
- [ ] Return Excel buffer for download
- [ ] Comprehensive error handling
- [ ] TypeScript type safety
- [ ] JSDoc documentation

## Detailed Specifications

### Service Structure

```typescript
// /home/edwin/development/ptnextjs/lib/services/ExcelExportService.ts

import ExcelJS from 'exceljs';
import { Vendor, VendorTier } from '@/lib/types';
import {
  getExportableFieldsForTier,
  FieldMapping
} from '@/lib/config/excel-field-mappings';

/**
 * Export options
 */
export interface ExportOptions {
  includeMetadata?: boolean;
  filename?: string;
  sheetName?: string;
}

/**
 * Service for exporting vendor data to Excel
 */
export class ExcelExportService {
  /**
   * Export single vendor to Excel
   * @param vendor - Vendor data to export
   * @param tier - Vendor tier (determines which fields to export)
   * @param options - Export options
   * @returns Excel workbook buffer
   */
  static async exportVendor(
    vendor: Vendor,
    tier: VendorTier,
    options: ExportOptions = {}
  ): Promise<Buffer> {
    return this.exportVendors([vendor], tier, options);
  }

  /**
   * Export multiple vendors to Excel
   * @param vendors - Array of vendor data to export
   * @param tier - Vendor tier (determines which fields to export)
   * @param options - Export options
   * @returns Excel workbook buffer
   */
  static async exportVendors(
    vendors: Vendor[],
    tier: VendorTier,
    options: ExportOptions = {}
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Set workbook properties
    workbook.creator = 'Paul Thames Superyacht Technology';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Create data worksheet
    const worksheet = workbook.addWorksheet(options.sheetName || 'Vendor Data', {
      properties: {
        defaultRowHeight: 20
      }
    });

    // Get exportable fields for this tier
    const fields = getExportableFieldsForTier(tier);

    // Add metadata section if requested
    let dataStartRow = 1;
    if (options.includeMetadata) {
      dataStartRow = this.addMetadataSection(worksheet, vendors, tier);
    }

    // Add header row
    this.addHeaderRow(worksheet, fields, dataStartRow);

    // Add data rows
    vendors.forEach((vendor, index) => {
      this.addDataRow(worksheet, vendor, fields, dataStartRow + 1 + index);
    });

    // Apply column formatting
    this.formatColumns(worksheet, fields, dataStartRow);

    // Freeze header row
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: dataStartRow }
    ];

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Add metadata section to worksheet
   */
  private static addMetadataSection(
    worksheet: ExcelJS.Worksheet,
    vendors: Vendor[],
    tier: VendorTier
  ): number {
    let row = 1;

    // Title
    const titleCell = worksheet.getCell(row, 1);
    titleCell.value = 'Vendor Data Export';
    titleCell.font = { bold: true, size: 14 };
    row++;

    // Export date
    const dateCell = worksheet.getCell(row, 1);
    dateCell.value = `Export Date: ${new Date().toLocaleString()}`;
    row++;

    // Tier information
    const tierCell = worksheet.getCell(row, 1);
    tierCell.value = `Vendor Tier: ${tier}`;
    row++;

    // Record count
    const countCell = worksheet.getCell(row, 1);
    countCell.value = `Total Records: ${vendors.length}`;
    row++;

    // Empty row separator
    row++;

    return row;
  }

  /**
   * Add header row to worksheet
   */
  private static addHeaderRow(
    worksheet: ExcelJS.Worksheet,
    fields: FieldMapping[],
    rowNumber: number
  ): void {
    const headerRow = worksheet.getRow(rowNumber);

    fields.forEach((field, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = field.excelColumn;

      // Header styling
      cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF000000' } }
      };
    });

    headerRow.commit();
  }

  /**
   * Add data row to worksheet
   */
  private static addDataRow(
    worksheet: ExcelJS.Worksheet,
    vendor: Vendor,
    fields: FieldMapping[],
    rowNumber: number
  ): void {
    const dataRow = worksheet.getRow(rowNumber);

    fields.forEach((field, index) => {
      const cell = dataRow.getCell(index + 1);

      // Get value from vendor object
      let value = this.getVendorFieldValue(vendor, field.fieldName);

      // Apply export transformation if defined
      if (value !== null && value !== undefined && field.exportTransform) {
        try {
          value = field.exportTransform(value);
        } catch (error) {
          console.error(`Export transformation failed for ${field.fieldName}:`, error);
          value = String(value);
        }
      }

      // Set cell value
      cell.value = value ?? '';

      // Apply cell formatting based on data type
      this.formatCell(cell, field);
    });

    // Alternate row colors for readability
    if (rowNumber % 2 === 0) {
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F0F0' }
        };
      });
    }

    dataRow.commit();
  }

  /**
   * Get value from vendor object by field name (handles nested properties)
   */
  private static getVendorFieldValue(vendor: any, fieldName: string): any {
    // Handle nested properties (e.g., 'contact.email')
    const parts = fieldName.split('.');
    let value = vendor;

    for (const part of parts) {
      if (value === null || value === undefined) return null;
      value = value[part];
    }

    return value;
  }

  /**
   * Format cell based on field type
   */
  private static formatCell(cell: ExcelJS.Cell, field: FieldMapping): void {
    // Alignment
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
      wrapText: field.dataType === 'STRING' && (field.maxLength || 0) > 100
    };

    // Number formatting
    if (field.dataType === 'NUMBER') {
      cell.numFmt = '#,##0';
    }

    // Date formatting
    if (field.dataType === 'DATE') {
      cell.numFmt = 'yyyy-mm-dd';
    }

    // URL styling
    if (field.dataType === 'URL' && cell.value) {
      cell.font = { color: { argb: 'FF0000FF' }, underline: true };
    }

    // Email styling
    if (field.dataType === 'EMAIL' && cell.value) {
      cell.font = { color: { argb: 'FF0000FF' } };
    }
  }

  /**
   * Apply column formatting
   */
  private static formatColumns(
    worksheet: ExcelJS.Worksheet,
    fields: FieldMapping[],
    headerRow: number
  ): void {
    fields.forEach((field, index) => {
      const column = worksheet.getColumn(index + 1);

      // Set column width based on content
      column.width = this.getColumnWidth(field);

      // Auto-filter
      if (headerRow === 1) {
        worksheet.autoFilter = {
          from: { row: headerRow, column: 1 },
          to: { row: headerRow, column: fields.length }
        };
      }
    });
  }

  /**
   * Determine appropriate column width based on field type
   */
  private static getColumnWidth(field: FieldMapping): number {
    switch (field.dataType) {
      case 'EMAIL':
      case 'URL':
        return 35;
      case 'PHONE':
        return 20;
      case 'NUMBER':
        return 15;
      case 'BOOLEAN':
        return 12;
      case 'DATE':
        return 15;
      case 'STRING':
        return field.maxLength && field.maxLength > 200 ? 50 : 25;
      case 'ARRAY_STRING':
        return 40;
      default:
        return 25;
    }
  }

  /**
   * Generate filename for export
   */
  static generateFilename(vendorName?: string, tier?: VendorTier): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const name = vendorName ? `${vendorName.replace(/[^a-z0-9]/gi, '_')}_` : '';
    const tierSuffix = tier ? `_${tier}` : '';
    return `${name}vendor_data${tierSuffix}_${timestamp}.xlsx`;
  }
}
```

## Testing Requirements

### Unit Tests

Create `/home/edwin/development/ptnextjs/__tests__/lib/services/ExcelExportService.test.ts`:

```typescript
import { ExcelExportService } from '@/lib/services/ExcelExportService';
import ExcelJS from 'exceljs';
import { Vendor } from '@/lib/types';

describe('ExcelExportService', () => {
  const mockVendor: Partial<Vendor> = {
    id: '1',
    name: 'Test Vendor',
    description: 'Test description',
    email: 'test@example.com',
    phone: '+1-555-123-4567',
    website: 'https://test.com',
    tier: 'TIER2'
  };

  describe('exportVendor', () => {
    it('should export single vendor to Excel', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        'TIER2'
      );

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should include tier-appropriate fields', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        'FREE'
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const headers = worksheet.getRow(1).values as any[];

      // Should include FREE tier fields
      expect(headers).toContain('Company Name');
      expect(headers).toContain('Contact Email');

      // Should NOT include TIER1+ fields
      expect(headers).not.toContain('Website URL');
    });

    it('should apply export transformations', async () => {
      const vendorWithArray: Partial<Vendor> = {
        ...mockVendor,
        certifications: ['ISO 9001', 'ABYC', 'NMEA']
      };

      const buffer = await ExcelExportService.exportVendor(
        vendorWithArray as Vendor,
        'TIER2'
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      // Find certifications column
      const headers = worksheet.getRow(1).values as any[];
      const certIndex = headers.findIndex((h: string) => h === 'Certifications');

      if (certIndex > 0) {
        const certValue = worksheet.getRow(2).getCell(certIndex).value;
        expect(certValue).toBe('ISO 9001, ABYC, NMEA');
      }
    });

    it('should include metadata when requested', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        'TIER2',
        { includeMetadata: true }
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const firstCell = worksheet.getCell(1, 1).value;
      expect(firstCell).toContain('Vendor Data Export');
    });
  });

  describe('exportVendors', () => {
    it('should export multiple vendors', async () => {
      const vendors = [mockVendor, { ...mockVendor, name: 'Test Vendor 2' }];

      const buffer = await ExcelExportService.exportVendors(
        vendors as Vendor[],
        'TIER2'
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      // Should have header + 2 data rows
      expect(worksheet.rowCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe('generateFilename', () => {
    it('should generate valid filename', () => {
      const filename = ExcelExportService.generateFilename('Test Vendor', 'TIER2');
      expect(filename).toMatch(/Test_Vendor_vendor_data_TIER2_\d{4}-\d{2}-\d{2}\.xlsx/);
    });

    it('should handle special characters in vendor name', () => {
      const filename = ExcelExportService.generateFilename('Test & Vendor!', 'TIER1');
      expect(filename).not.toContain('&');
      expect(filename).not.toContain('!');
    });
  });
});
```

Run: `npm test -- ExcelExportService.test.ts`

## Evidence Requirements

- [ ] Service file created at exact path
- [ ] Unit tests passing (screenshot)
- [ ] Export various vendor data successfully
- [ ] Generated Excel files open correctly in Excel/LibreOffice
- [ ] Formatting looks professional (screenshot of exported file)
- [ ] All tier levels export correctly

## Implementation Notes

- Test exported files in actual Excel application
- Ensure proper handling of special characters in data
- Consider performance for large datasets
- Make styling consistent with template generation
- Handle null/undefined values gracefully

## Next Steps

This service will be used by:
- BE-10: API route for vendor data export

## Success Metrics

- Export generates valid .xlsx files
- All tier levels export correctly
- Formatting is professional and readable
- Unit tests achieve >90% coverage
- Performance is acceptable for 100+ vendors
