/**
 * Excel Export Service
 *
 * Exports vendor data to Excel format with tier-appropriate fields, proper formatting,
 * and data transformations.
 *
 * Features:
 * - Export single or multiple vendors to Excel
 * - Include only tier-appropriate fields
 * - Apply export transformation functions
 * - Professional formatting (headers, alignment, colors)
 * - Handle null/undefined values gracefully
 * - Include export metadata (date, tier, vendor count)
 *
 * @module lib/services/ExcelExportService
 */

import ExcelJS from 'exceljs';
import { Vendor } from '@/lib/types';
import {
  getExportableFieldsForTier,
  type FieldMapping,
  FieldDataType,
  type VendorTier
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
   * Get value from vendor object by field name (handles nested properties and HQ location)
   */
  private static getVendorFieldValue(vendor: any, fieldName: string): any {
    // Handle HQ location fields (extract from locations array)
    if (fieldName === 'hqAddress' || fieldName === 'hqCity' || fieldName === 'hqCountry') {
      return this.getHQLocationField(vendor, fieldName);
    }

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
   * Extract HQ location field from vendor locations array
   */
  private static getHQLocationField(vendor: any, fieldName: string): string | null {
    // Find HQ location from locations array
    const locations = vendor.locations || [];
    const hqLocation = locations.find((loc: any) => loc.isHQ === true);

    // Fall back to legacy location field if no HQ found in array
    const location = hqLocation || vendor.location;

    if (!location) return null;

    // Map fieldName to location property
    switch (fieldName) {
      case 'hqAddress':
        return location.address || null;
      case 'hqCity':
        return location.city || null;
      case 'hqCountry':
        return location.country || null;
      default:
        return null;
    }
  }

  /**
   * Format cell based on field type
   */
  private static formatCell(cell: ExcelJS.Cell, field: FieldMapping): void {
    // Alignment
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
      wrapText: field.dataType === FieldDataType.STRING && (field.maxLength || 0) > 100
    };

    // Number formatting
    if (field.dataType === FieldDataType.NUMBER) {
      cell.numFmt = '#,##0';
    }

    // Date formatting
    if (field.dataType === FieldDataType.DATE) {
      cell.numFmt = 'yyyy-mm-dd';
    }

    // Year formatting
    if (field.dataType === FieldDataType.YEAR) {
      cell.numFmt = '0';
    }

    // URL styling
    if (field.dataType === FieldDataType.URL && cell.value) {
      cell.font = { color: { argb: 'FF0000FF' }, underline: true };
    }

    // Email styling
    if (field.dataType === FieldDataType.EMAIL && cell.value) {
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
        return 15;
      case FieldDataType.STRING:
        return field.maxLength && field.maxLength > 200 ? 50 : 25;
      case FieldDataType.ARRAY_STRING:
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
    const tierSuffix = tier !== undefined ? `_tier${tier}` : '';
    return `${name}vendor_data${tierSuffix}_${timestamp}.xlsx`;
  }
}
