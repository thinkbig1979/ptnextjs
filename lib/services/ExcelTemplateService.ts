/**
 * Excel Template Generation Service
 *
 * Generates tier-appropriate Excel templates for vendor data import.
 * Templates include:
 * - Tier-filtered field columns
 * - Header row with formatting
 * - Example data row
 * - Excel data validation (dropdowns, ranges)
 * - Instructions worksheet
 *
 * @module lib/services/ExcelTemplateService
 */

import ExcelJS from 'exceljs';
import {
  getImportableFieldsForTier,
  type FieldMapping,
  FieldDataType,
  type VendorTier
} from '@/lib/config/excel-field-mappings';

/**
 * Service for generating tier-appropriate Excel import templates
 */
export class ExcelTemplateService {
  /**
   * Generate an Excel template for a specific vendor tier
   *
   * Creates a complete workbook with:
   * - Data worksheet with headers, examples, and validation
   * - Instructions worksheet with usage guide
   *
   * @param tier - Vendor tier level (0-4)
   * @returns Excel workbook as Buffer
   * @throws Error if template generation fails
   *
   * @example
   * ```typescript
   * const buffer = await ExcelTemplateService.generateTemplate(2);
   * // Returns Buffer containing .xlsx file for Tier 2 vendor
   * ```
   */
  static async generateTemplate(tier: VendorTier): Promise<Buffer> {
    try {
      const workbook = new ExcelJS.Workbook();

      // Set workbook metadata
      workbook.creator = 'Paul Thames Superyacht Technology';
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.lastModifiedBy = 'Vendor Import System';

      // Create main data worksheet
      this.createDataWorksheet(workbook, tier);

      // Create instructions worksheet
      this.createInstructionsWorksheet(workbook, tier);

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      throw new Error(`Failed to generate Excel template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create the main data worksheet with headers, examples, and validation
   *
   * @param workbook - ExcelJS workbook instance
   * @param tier - Vendor tier level
   * @returns Created worksheet
   */
  private static createDataWorksheet(
    workbook: ExcelJS.Workbook,
    tier: VendorTier
  ): ExcelJS.Worksheet {
    const worksheet = workbook.addWorksheet('Vendor Data', {
      properties: {
        defaultRowHeight: 20,
        tabColor: { argb: 'FF4472C4' }
      }
    });

    // Get importable fields for this tier
    const fields = getImportableFieldsForTier(tier);

    if (fields.length === 0) {
      throw new Error(`No importable fields found for tier ${tier}`);
    }

    // Create header row
    this.createHeaderRow(worksheet, fields);

    // Create example row
    this.createExampleRow(worksheet, fields);

    // Apply column formatting and data validation
    this.applyColumnFormatting(worksheet, fields);

    // Freeze header row for easier scrolling
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1 }
    ];

    return worksheet;
  }

  /**
   * Create and format header row
   *
   * @param worksheet - Target worksheet
   * @param fields - Field mappings to include
   */
  private static createHeaderRow(
    worksheet: ExcelJS.Worksheet,
    fields: FieldMapping[]
  ): void {
    const headerRow = worksheet.getRow(1);

    fields.forEach((field, index) => {
      const cell = headerRow.getCell(index + 1);

      // Set header text with required indicator
      const headerText = field.required
        ? `${field.excelColumn} *`
        : field.excelColumn;
      cell.value = headerText;

      // Header styling
      cell.font = {
        bold: true,
        size: 12,
        color: { argb: 'FFFFFFFF' }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true
      };
      cell.border = {
        bottom: { style: 'thick', color: { argb: 'FF2E5C8A' } }
      };

      // Add comment with field description and constraints
      if (field.description || field.example || field.required) {
        const noteTexts: string[] = [];

        if (field.description) {
          noteTexts.push(field.description);
        }

        if (field.required) {
          noteTexts.push('\n⚠️ This field is required');
        }

        if (field.maxLength) {
          noteTexts.push(`\nMax length: ${field.maxLength} characters`);
        }

        if (field.minValue !== undefined || field.maxValue !== undefined) {
          noteTexts.push(`\nRange: ${field.minValue || 0} - ${field.maxValue || '∞'}`);
        }

        if (field.allowedValues && field.allowedValues.length > 0) {
          noteTexts.push(`\nAllowed values: ${field.allowedValues.join(', ')}`);
        }

        if (field.example) {
          noteTexts.push(`\nExample: ${field.example}`);
        }

        cell.note = noteTexts.join('');
      }
    });

    headerRow.height = 25;
    headerRow.commit();
  }

  /**
   * Create example data row
   *
   * @param worksheet - Target worksheet
   * @param fields - Field mappings to include
   */
  private static createExampleRow(
    worksheet: ExcelJS.Worksheet,
    fields: FieldMapping[]
  ): void {
    const exampleRow = worksheet.getRow(2);

    fields.forEach((field, index) => {
      const cell = exampleRow.getCell(index + 1);
      cell.value = field.example || '';

      // Example row styling (italicized and grayed)
      cell.font = {
        italic: true,
        color: { argb: 'FF808080' },
        size: 11
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' }
      };
    });

    exampleRow.height = 18;
    exampleRow.commit();
  }

  /**
   * Apply column formatting and data validation
   *
   * @param worksheet - Target worksheet
   * @param fields - Field mappings to include
   */
  private static applyColumnFormatting(
    worksheet: ExcelJS.Worksheet,
    fields: FieldMapping[]
  ): void {
    fields.forEach((field, index) => {
      const columnIndex = index + 1;
      const column = worksheet.getColumn(columnIndex);

      // Set column width based on field type
      column.width = this.getColumnWidth(field);

      // Apply data validation for rows 3 onwards (actual user data)
      this.applyDataValidation(worksheet, field, columnIndex);
    });
  }

  /**
   * Determine appropriate column width based on field type and constraints
   *
   * @param field - Field mapping
   * @returns Column width in characters
   */
  private static getColumnWidth(field: FieldMapping): number {
    switch (field.dataType) {
      case FieldDataType.EMAIL:
      case FieldDataType.URL:
        return 35;
      case FieldDataType.PHONE:
        return 20;
      case FieldDataType.NUMBER:
      case FieldDataType.YEAR:
        return 15;
      case FieldDataType.BOOLEAN:
        return 12;
      case FieldDataType.DATE:
        return 18;
      case FieldDataType.ARRAY_STRING:
        return 40;
      case FieldDataType.STRING:
        // Longer columns for fields with high max length
        if (field.maxLength && field.maxLength > 200) {
          return 50;
        } else if (field.maxLength && field.maxLength > 100) {
          return 35;
        }
        return 25;
      default:
        return 25;
    }
  }

  /**
   * Apply Excel data validation to columns
   *
   * Applies validation starting from row 3 (after header and example)
   * to row 1000 (covers typical import sizes)
   *
   * @param worksheet - Target worksheet
   * @param field - Field mapping with validation rules
   * @param columnIndex - 1-based column index
   */
  private static applyDataValidation(
    worksheet: ExcelJS.Worksheet,
    field: FieldMapping,
    columnIndex: number
  ): void {
    const startRow = 3;
    const endRow = 1000;

    // Dropdown validation for allowed values (e.g., employee count ranges)
    if (field.allowedValues && field.allowedValues.length > 0) {
      for (let row = startRow; row <= endRow; row++) {
        const cell = worksheet.getCell(row, columnIndex);
        cell.dataValidation = {
          type: 'list',
          allowBlank: !field.required,
          formulae: [`"${field.allowedValues.join(',')}"`],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Value',
          error: `Please select one of: ${field.allowedValues.join(', ')}`,
          showInputMessage: true,
          promptTitle: field.excelColumn,
          prompt: `Select from dropdown: ${field.allowedValues.join(', ')}`
        };
      }
    }

    // Number range validation
    if ((field.dataType === FieldDataType.NUMBER || field.dataType === FieldDataType.YEAR) &&
        (field.minValue !== undefined || field.maxValue !== undefined)) {
      for (let row = startRow; row <= endRow; row++) {
        const cell = worksheet.getCell(row, columnIndex);
        const min = field.minValue ?? 0;
        const max = field.maxValue ?? 999999;

        cell.dataValidation = {
          type: field.dataType === FieldDataType.YEAR ? 'whole' : 'decimal',
          allowBlank: !field.required,
          operator: 'between',
          formulae: [min, max],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid Number',
          error: `Value must be between ${min} and ${max}`,
          showInputMessage: true,
          promptTitle: field.excelColumn,
          prompt: `Enter a number between ${min} and ${max}`
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
          errorStyle: 'warning',
          errorTitle: 'Text Too Long',
          error: `Maximum ${field.maxLength} characters allowed`,
          showInputMessage: true,
          promptTitle: field.excelColumn,
          prompt: `Maximum ${field.maxLength} characters`
        };
      }
    }
  }

  /**
   * Create instructions worksheet with usage guide
   *
   * @param workbook - ExcelJS workbook instance
   * @param tier - Vendor tier level
   * @returns Created worksheet
   */
  private static createInstructionsWorksheet(
    workbook: ExcelJS.Workbook,
    tier: VendorTier
  ): ExcelJS.Worksheet {
    const worksheet = workbook.addWorksheet('Instructions', {
      properties: {
        tabColor: { argb: 'FF70AD47' }
      }
    });

    // Set column widths
    worksheet.getColumn(1).width = 5;
    worksheet.getColumn(2).width = 80;

    let rowIndex = 1;

    // Title
    const titleRow = worksheet.getRow(rowIndex++);
    titleRow.getCell(2).value = 'Vendor Data Import Template - Instructions';
    titleRow.getCell(2).font = { bold: true, size: 18, color: { argb: 'FF2E5C8A' } };
    titleRow.height = 30;
    rowIndex++; // Blank row

    // Tier information
    const tierRow = worksheet.getRow(rowIndex++);
    tierRow.getCell(2).value = `Your Subscription Tier: ${tier}`;
    tierRow.getCell(2).font = { bold: true, size: 14 };

    worksheet.getRow(rowIndex++).getCell(2).value = 'This template includes only the fields available for your subscription tier.';
    worksheet.getRow(rowIndex++).getCell(2).font = { italic: true, color: { argb: 'FF666666' } };
    rowIndex++; // Blank row

    // Section: How to Use
    this.addInstructionSection(worksheet, rowIndex, 'How to Use This Template', [
      '1. Switch to the "Vendor Data" worksheet tab',
      '2. Row 1 contains column headers (do NOT modify these)',
      '3. Row 2 contains example data (you can replace or delete this)',
      '4. Enter your vendor data starting from row 2 (or row 3 if keeping examples)',
      '5. Required fields are marked with * in the header',
      '6. Hover over column headers to see field descriptions and constraints',
      '7. Some fields have dropdown lists or automatic validation',
      '8. Save the file when complete',
      '9. Upload through your vendor dashboard: Dashboard → Import/Export → Upload File'
    ]);
    rowIndex += 12; // Section + content + spacing

    // Section: Field Information
    const fields = getImportableFieldsForTier(tier);
    const requiredFields = fields.filter(f => f.required);
    const optionalFields = fields.filter(f => !f.required);

    worksheet.getRow(rowIndex++).getCell(2).value = 'Required Fields';
    worksheet.getRow(rowIndex - 1).getCell(2).font = { bold: true, size: 13, color: { argb: 'FFD00000' } };

    requiredFields.forEach(field => {
      const row = worksheet.getRow(rowIndex++);
      row.getCell(2).value = `• ${field.excelColumn}: ${field.description || 'No description'}`;
      row.getCell(2).font = { size: 11 };
    });
    rowIndex++; // Blank row

    if (optionalFields.length > 0) {
      worksheet.getRow(rowIndex++).getCell(2).value = 'Optional Fields';
      worksheet.getRow(rowIndex - 1).getCell(2).font = { bold: true, size: 13, color: { argb: 'FF4472C4' } };

      optionalFields.forEach(field => {
        const row = worksheet.getRow(rowIndex++);
        row.getCell(2).value = `• ${field.excelColumn}: ${field.description || 'No description'}`;
        row.getCell(2).font = { size: 11, color: { argb: 'FF666666' } };
      });
      rowIndex++; // Blank row
    }

    // Section: Important Notes
    this.addInstructionSection(worksheet, rowIndex, '⚠️ Important Notes', [
      '• Do NOT modify, add, or remove column headers',
      '• Ensure all required fields (*) are filled',
      '• Follow data format requirements (valid URLs, email addresses, etc.)',
      '• Check validation messages if Excel shows errors',
      '• Maximum file size: 10MB',
      '• Supported format: .xlsx only (Excel 2007+)',
      '• The system will validate your data before importing',
      '• You will see a preview before final import'
    ]);
    rowIndex += 11;

    // Section: Tips
    this.addInstructionSection(worksheet, rowIndex, '💡 Tips for Success', [
      '✓ Use dropdown lists where available',
      '✓ Copy-paste data from existing spreadsheets',
      '✓ Save frequently while editing',
      '✓ Test with a small dataset first',
      '✓ Review the preview carefully before confirming import',
      '✓ Keep a backup of your data'
    ]);

    // Protect instructions sheet (optional)
    worksheet.protect('', {
      selectLockedCells: true,
      selectUnlockedCells: true
    });

    return worksheet;
  }

  /**
   * Add a formatted instruction section
   *
   * @param worksheet - Target worksheet
   * @param startRow - Starting row index
   * @param title - Section title
   * @param items - Array of instruction items
   */
  private static addInstructionSection(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    title: string,
    items: string[]
  ): void {
    let rowIndex = startRow;

    // Section title
    const titleRow = worksheet.getRow(rowIndex++);
    titleRow.getCell(2).value = title;
    titleRow.getCell(2).font = { bold: true, size: 13, color: { argb: 'FF2E5C8A' } };
    titleRow.height = 22;

    // Section items
    items.forEach(item => {
      const row = worksheet.getRow(rowIndex++);
      row.getCell(2).value = item;
      row.getCell(2).font = { size: 11 };
      row.getCell(2).alignment = { wrapText: true };
    });
  }

  /**
   * Generate filename for template download
   * @param vendorName - Vendor name for filename
   * @param tier - Vendor tier
   * @returns Generated filename
   */
  static generateFilename(vendorName?: string, tier?: VendorTier): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const name = vendorName ? `${vendorName.replace(/[^a-z0-9]/gi, '_')}_` : '';
    const tierSuffix = tier !== undefined ? `_tier${tier}` : '';
    return `${name}template${tierSuffix}_${timestamp}.xlsx`;
  }
}
