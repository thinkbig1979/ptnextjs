# Task BE-3: Create ExcelTemplateService

**Status:** 🔒 Blocked (waiting for BE-2)
**Agent:** backend-nodejs-specialist
**Estimated Time:** 4 hours
**Phase:** Backend Implementation
**Dependencies:** BE-2

## Objective

Create a service that generates tier-appropriate Excel templates with proper headers, column formatting, data validation, and example rows.

## Context Requirements

- Review BE-2: Field mapping configuration
- Review exceljs documentation for workbook/worksheet creation
- Review tier-based field access from technical-spec.md
- Understand Excel template requirements from spec.md

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/lib/services/ExcelTemplateService.ts`
- [ ] Generate tier-appropriate templates with correct field columns
- [ ] Include header row with column names
- [ ] Include example row with sample data
- [ ] Apply Excel data validation where appropriate (dropdowns, number ranges)
- [ ] Apply column formatting (width, text wrapping, alignment)
- [ ] Include instructions worksheet
- [ ] Return Excel buffer for download
- [ ] Comprehensive error handling
- [ ] TypeScript type safety
- [ ] JSDoc documentation

## Detailed Specifications

### Service Structure

```typescript
// /home/edwin/development/ptnextjs/lib/services/ExcelTemplateService.ts

import ExcelJS from 'exceljs';
import { VendorTier } from '@/lib/types';
import {
  getImportableFieldsForTier,
  FieldMapping,
  FieldDataType
} from '@/lib/config/excel-field-mappings';

/**
 * Service for generating tier-appropriate Excel import templates
 */
export class ExcelTemplateService {
  /**
   * Generate an Excel template for a specific vendor tier
   * @param tier - Vendor tier level
   * @returns Excel workbook buffer
   */
  static async generateTemplate(tier: VendorTier): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Set workbook properties
    workbook.creator = 'Paul Thames Superyacht Technology';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Create data worksheet
    const worksheet = this.createDataWorksheet(workbook, tier);

    // Create instructions worksheet
    this.createInstructionsWorksheet(workbook, tier);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Create the main data worksheet with headers and example row
   */
  private static createDataWorksheet(
    workbook: ExcelJS.Workbook,
    tier: VendorTier
  ): ExcelJS.Worksheet {
    const worksheet = workbook.addWorksheet('Vendor Data', {
      properties: {
        defaultRowHeight: 20
      }
    });

    // Get importable fields for this tier
    const fields = getImportableFieldsForTier(tier);

    // Create header row
    const headerRow = worksheet.getRow(1);
    fields.forEach((field, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = field.excelColumn;

      // Header styling
      cell.font = { bold: true, size: 12 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };

      // Add comment with field description
      if (field.description) {
        cell.note = {
          texts: [{ text: field.description }]
        };
      }
    });
    headerRow.commit();

    // Create example row
    const exampleRow = worksheet.getRow(2);
    fields.forEach((field, index) => {
      const cell = exampleRow.getCell(index + 1);
      cell.value = field.example || '';
      cell.font = { italic: true, color: { argb: 'FF808080' } };
    });
    exampleRow.commit();

    // Apply column formatting and data validation
    fields.forEach((field, index) => {
      const column = worksheet.getColumn(index + 1);

      // Set column width based on content
      column.width = this.getColumnWidth(field);

      // Apply data validation for rows 3 onwards (actual data)
      this.applyDataValidation(worksheet, field, index + 1);
    });

    // Freeze header row
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1 }
    ];

    return worksheet;
  }

  /**
   * Create instructions worksheet with usage guide
   */
  private static createInstructionsWorksheet(
    workbook: ExcelJS.Workbook,
    tier: VendorTier
  ): ExcelJS.Worksheet {
    const worksheet = workbook.addWorksheet('Instructions');

    worksheet.getColumn(1).width = 80;

    let rowIndex = 1;

    // Title
    const titleRow = worksheet.getRow(rowIndex++);
    titleRow.getCell(1).value = 'Vendor Data Import Template - Instructions';
    titleRow.getCell(1).font = { bold: true, size: 16 };
    rowIndex++;

    // Tier information
    worksheet.getRow(rowIndex++).getCell(1).value = `Your Tier: ${tier}`;
    worksheet.getRow(rowIndex++).getCell(1).value = 'This template includes fields available for your subscription tier.';
    rowIndex++;

    // General instructions
    worksheet.getRow(rowIndex++).getCell(1).value = 'How to Use This Template:';
    worksheet.getRow(rowIndex++).getCell(1).value = '1. The "Vendor Data" worksheet contains your data fields';
    worksheet.getRow(rowIndex++).getCell(1).value = '2. Row 1 contains column headers (do not modify)';
    worksheet.getRow(rowIndex++).getCell(1).value = '3. Row 2 contains example data (can be replaced with your data)';
    worksheet.getRow(rowIndex++).getCell(1).value = '4. Add your data starting from row 2 (or row 3 if keeping examples)';
    worksheet.getRow(rowIndex++).getCell(1).value = '5. Required fields are marked with * in the header notes';
    worksheet.getRow(rowIndex++).getCell(1).value = '6. Save the file and upload it through the vendor dashboard';
    rowIndex++;

    // Field descriptions
    worksheet.getRow(rowIndex++).getCell(1).value = 'Field Descriptions:';
    const fields = getImportableFieldsForTier(tier);
    fields.forEach(field => {
      const required = field.required ? ' (Required)' : '';
      worksheet.getRow(rowIndex++).getCell(1).value =
        `${field.excelColumn}${required}: ${field.description || 'No description'}`;
    });
    rowIndex++;

    // Important notes
    worksheet.getRow(rowIndex++).getCell(1).value = 'Important Notes:';
    worksheet.getRow(rowIndex++).getCell(1).value = '• Do not modify column headers';
    worksheet.getRow(rowIndex++).getCell(1).value = '• Ensure required fields are filled';
    worksheet.getRow(rowIndex++).getCell(1).value = '• Follow data format requirements (URLs, emails, etc.)';
    worksheet.getRow(rowIndex++).getCell(1).value = '• Maximum file size: 5MB';
    worksheet.getRow(rowIndex++).getCell(1).value = '• Supported format: .xlsx only';

    return worksheet;
  }

  /**
   * Determine appropriate column width based on field type
   */
  private static getColumnWidth(field: FieldMapping): number {
    switch (field.dataType) {
      case FieldDataType.EMAIL:
      case FieldDataType.URL:
        return 30;
      case FieldDataType.PHONE:
        return 20;
      case FieldDataType.NUMBER:
        return 15;
      case FieldDataType.BOOLEAN:
        return 12;
      case FieldDataType.STRING:
        return field.maxLength && field.maxLength > 200 ? 40 : 25;
      case FieldDataType.ARRAY_STRING:
        return 35;
      default:
        return 25;
    }
  }

  /**
   * Apply Excel data validation to columns
   */
  private static applyDataValidation(
    worksheet: ExcelJS.Worksheet,
    field: FieldMapping,
    columnIndex: number
  ): void {
    // Apply validation starting from row 3 (after header and example)
    const startRow = 3;
    const endRow = 1000; // Apply to first 1000 rows

    // Dropdown validation for allowed values
    if (field.allowedValues && field.allowedValues.length > 0) {
      for (let row = startRow; row <= endRow; row++) {
        const cell = worksheet.getCell(row, columnIndex);
        cell.dataValidation = {
          type: 'list',
          allowBlank: !field.required,
          formulae: [`"${field.allowedValues.join(',')}"`],
          showErrorMessage: true,
          errorTitle: 'Invalid Value',
          error: `Please select one of: ${field.allowedValues.join(', ')}`
        };
      }
    }

    // Number range validation
    if (field.dataType === FieldDataType.NUMBER && (field.minValue || field.maxValue)) {
      for (let row = startRow; row <= endRow; row++) {
        const cell = worksheet.getCell(row, columnIndex);
        cell.dataValidation = {
          type: 'whole',
          allowBlank: !field.required,
          operator: 'between',
          formulae: [field.minValue || 0, field.maxValue || 999999],
          showErrorMessage: true,
          errorTitle: 'Invalid Number',
          error: `Value must be between ${field.minValue || 0} and ${field.maxValue || 999999}`
        };
      }
    }

    // Text length validation
    if (field.dataType === FieldDataType.STRING && field.maxLength) {
      for (let row = startRow; row <= endRow; row++) {
        const cell = worksheet.getCell(row, columnIndex);
        cell.dataValidation = {
          type: 'textLength',
          allowBlank: !field.required,
          operator: 'lessThanOrEqual',
          formulae: [field.maxLength],
          showErrorMessage: true,
          errorTitle: 'Text Too Long',
          error: `Maximum ${field.maxLength} characters allowed`
        };
      }
    }
  }
}
```

## Testing Requirements

### Unit Tests

Create `/home/edwin/development/ptnextjs/__tests__/lib/services/ExcelTemplateService.test.ts`:

```typescript
import { ExcelTemplateService } from '@/lib/services/ExcelTemplateService';
import ExcelJS from 'exceljs';
import { VendorTier } from '@/lib/types';

describe('ExcelTemplateService', () => {
  describe('generateTemplate', () => {
    it('should generate template for FREE tier', async () => {
      const buffer = await ExcelTemplateService.generateTemplate('FREE');
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should include correct worksheets', async () => {
      const buffer = await ExcelTemplateService.generateTemplate('TIER2');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      expect(workbook.worksheets.length).toBe(2);
      expect(workbook.worksheets[0].name).toBe('Vendor Data');
      expect(workbook.worksheets[1].name).toBe('Instructions');
    });

    it('should include tier-appropriate fields', async () => {
      const buffer = await ExcelTemplateService.generateTemplate('FREE');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');
      const headerRow = worksheet?.getRow(1);
      const headers = headerRow?.values as any[];

      // Should include FREE tier fields
      expect(headers).toContain('Company Name');
      expect(headers).toContain('Contact Email');

      // Should NOT include TIER1+ fields
      expect(headers).not.toContain('Website URL');
    });

    it('should include example row', async () => {
      const buffer = await ExcelTemplateService.generateTemplate('TIER1');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');
      const exampleRow = worksheet?.getRow(2);

      expect(exampleRow?.getCell(1).value).toBeTruthy(); // Should have example data
    });

    it('should apply data validation for dropdown fields', async () => {
      const buffer = await ExcelTemplateService.generateTemplate('TIER1');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');

      // Find employee count column and check validation
      const headerRow = worksheet?.getRow(1).values as any[];
      const employeeCountIndex = headerRow.findIndex((h: string) => h === 'Employee Count');

      if (employeeCountIndex > 0) {
        const cell = worksheet?.getCell(3, employeeCountIndex);
        expect(cell?.dataValidation).toBeDefined();
        expect(cell?.dataValidation?.type).toBe('list');
      }
    });

    it('should freeze header row', async () => {
      const buffer = await ExcelTemplateService.generateTemplate('TIER2');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');
      expect(worksheet?.views?.[0]?.state).toBe('frozen');
      expect(worksheet?.views?.[0]?.ySplit).toBe(1);
    });
  });
});
```

Run: `npm test -- ExcelTemplateService.test.ts`

## Evidence Requirements

- [ ] Service file created at exact path
- [ ] Unit tests passing (screenshot)
- [ ] Generated template opens correctly in Excel/LibreOffice
- [ ] Screenshots of generated templates for each tier (FREE, TIER1, TIER2, TIER3)
- [ ] Data validation working (test dropdown selection in Excel)
- [ ] Instructions worksheet readable and complete

## Implementation Notes

- Use exceljs documentation for advanced features
- Test generated files in actual Excel application
- Ensure cross-platform compatibility (Windows Excel, Mac Excel, LibreOffice)
- Keep instructions clear and user-friendly
- Consider adding conditional formatting for required fields

## Next Steps

This service will be used by:
- BE-9: API route for template download

## Success Metrics

- Templates generate without errors for all tiers
- Excel data validation works correctly
- Templates are user-friendly and professional-looking
- Unit tests achieve >90% coverage
- Generated files are valid .xlsx format
