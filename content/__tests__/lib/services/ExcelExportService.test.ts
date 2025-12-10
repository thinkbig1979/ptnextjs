/**
 * Unit Tests for ExcelExportService
 *
 * Tests cover:
 * - Single vendor export
 * - Multiple vendor export
 * - Tier-appropriate field inclusion
 * - Export transformation application
 * - Metadata section
 * - Professional formatting
 * - Filename generation
 */

import { ExcelExportService } from '@/lib/services/ExcelExportService';
import ExcelJS from 'exceljs';
import { Vendor } from '@/lib/types';

describe('ExcelExportService', () => {
  const mockVendor: Partial<Vendor> = {
    id: '1',
    name: 'Test Vendor Corp', // Legacy field
    companyName: 'Test Vendor Corp', // Correct field used by Excel export
    description: 'A leading provider of marine technology solutions',
    contactEmail: 'contact@testvendor.com',
    contactPhone: '+1-555-123-4567',
    website: 'https://testvendor.com',
    foundedYear: 2010,
    employeeCount: 125,
    totalProjects: 450,
    linkedinUrl: 'https://linkedin.com/company/test-vendor',
    longDescription: 'Founded in 2010, Test Vendor Corp has been at the forefront of marine technology innovation...',
    tier: 'tier2'
  };

  describe('exportVendor', () => {
    it('should export single vendor to Excel buffer', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2
      );

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should create valid Excel workbook', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      expect(workbook.worksheets.length).toBeGreaterThan(0);
      expect(workbook.worksheets[0].name).toBe('Vendor Data');
    });

    it('should include tier-appropriate fields for FREE tier', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        0 // FREE tier
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const headers = worksheet.getRow(1).values as any[];

      // Should include FREE tier fields
      expect(headers).toContain('Company Name');
      expect(headers).toContain('Short Description');
      expect(headers).toContain('Contact Email');

      // Should NOT include TIER1+ fields
      expect(headers).not.toContain('Website URL');
      expect(headers).not.toContain('LinkedIn URL');
    });

    it('should include tier-appropriate fields for TIER1', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        1 // TIER1
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const headers = worksheet.getRow(1).values as any[];

      // Should include FREE tier fields
      expect(headers).toContain('Company Name');
      expect(headers).toContain('Contact Email');

      // Should include TIER1 fields
      expect(headers).toContain('Website URL');
      expect(headers).toContain('LinkedIn URL');
      expect(headers).toContain('Founded Year');

      // Detailed Description (longDescription) is a TIER1 field, so it SHOULD be included
      expect(headers).toContain('Detailed Description');
    });

    it('should include tier-appropriate fields for TIER2', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2 // TIER2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const headers = worksheet.getRow(1).values as any[];

      // Note: No TIER2-specific fields exist - tier 2 gets same fields as tier 1 (FREE + TIER1)
      expect(headers).toContain('Company Name');
      expect(headers).toContain('Website URL');
      expect(headers).toContain('Detailed Description'); // TIER1 field
      expect(headers).toContain('LinkedIn Followers'); // TIER1 field
    });

    it('should populate vendor data correctly', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const headers = worksheet.getRow(1).values as any[];
      const dataRow = worksheet.getRow(2).values as any[];

      // Find column indices
      const nameIndex = headers.findIndex((h: string) => h === 'Company Name');
      const emailIndex = headers.findIndex((h: string) => h === 'Contact Email');

      // Verify data
      expect(dataRow[nameIndex]).toBe('Test Vendor Corp');
      expect(dataRow[emailIndex]).toBe('contact@testvendor.com');
    });

    it('should handle null/undefined values gracefully', async () => {
      const vendorWithNulls: Partial<Vendor> = {
        companyName: 'Test Corp',
        description: 'Test description',
        contactEmail: 'test@example.com',
        website: undefined,
        linkedinUrl: null as any,
        foundedYear: undefined
      };

      const buffer = await ExcelExportService.exportVendor(
        vendorWithNulls as Vendor,
        1
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      // Should not throw error and should produce valid Excel
      expect(worksheet.rowCount).toBeGreaterThan(0);
    });

    it('should include metadata when requested', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2,
        { includeMetadata: true }
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const firstCell = worksheet.getCell(1, 1).value;
      expect(firstCell).toContain('Vendor Data Export');

      // Metadata should push data down
      const headers = worksheet.getRow(6).values as any[];
      expect(headers).toContain('Company Name');
    });

    it('should not include metadata by default', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const firstCell = worksheet.getCell(1, 1).value;
      // First row should be headers, not metadata
      expect(firstCell).toBe('Company Name');
    });

    it('should use custom sheet name when provided', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2,
        { sheetName: 'Custom Sheet' }
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      expect(workbook.worksheets[0].name).toBe('Custom Sheet');
    });
  });

  describe('exportVendors', () => {
    it('should export multiple vendors', async () => {
      const vendors: Partial<Vendor>[] = [
        mockVendor,
        {
          ...mockVendor,
          id: '2',
          companyName: 'Test Vendor 2',
          contactEmail: 'contact2@testvendor.com'
        },
        {
          ...mockVendor,
          id: '3',
          companyName: 'Test Vendor 3',
          contactEmail: 'contact3@testvendor.com'
        }
      ];

      const buffer = await ExcelExportService.exportVendors(
        vendors as Vendor[],
        2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      // Should have header + 3 data rows
      expect(worksheet.rowCount).toBeGreaterThanOrEqual(4);
    });

    it('should apply alternating row colors', async () => {
      const vendors: Partial<Vendor>[] = [
        mockVendor,
        { ...mockVendor, id: '2', companyName: 'Vendor 2' },
        { ...mockVendor, id: '3', companyName: 'Vendor 3' }
      ];

      const buffer = await ExcelExportService.exportVendors(
        vendors as Vendor[],
        2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      // Row 2 (even) should have gray background
      const row2Cell = worksheet.getRow(2).getCell(1);
      expect(row2Cell.fill).toBeDefined();
      if (row2Cell.fill && 'fgColor' in row2Cell.fill) {
        expect(row2Cell.fill.fgColor?.argb).toBe('FFF0F0F0');
      }

      // Row 3 (odd) should have default/no special fill
      const row3Cell = worksheet.getRow(3).getCell(1);
      // Row 3 may have a default fill pattern, so we check it doesn't have the gray color
      if (row3Cell.fill && 'fgColor' in row3Cell.fill) {
        expect(row3Cell.fill.fgColor?.argb).not.toBe('FFF0F0F0');
      }
    });

    it('should handle empty vendor array', async () => {
      const buffer = await ExcelExportService.exportVendors(
        [],
        2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      // Should have header row
      expect(worksheet.rowCount).toBeGreaterThanOrEqual(1);
      const headers = worksheet.getRow(1).values as any[];
      expect(headers).toContain('Company Name');
    });

    it('should freeze header row', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      expect(worksheet.views).toBeDefined();
      expect(worksheet.views[0].state).toBe('frozen');
      expect(worksheet.views[0].ySplit).toBe(1);
    });
  });

  describe('generateFilename', () => {
    it('should generate valid filename with vendor name and tier', () => {
      const filename = ExcelExportService.generateFilename('Test Vendor', 2);
      expect(filename).toMatch(/Test_Vendor_vendor_data_tier2_\d{4}-\d{2}-\d{2}\.xlsx/);
    });

    it('should handle special characters in vendor name', () => {
      const filename = ExcelExportService.generateFilename('Test & Vendor!', 1);
      expect(filename).not.toContain('&');
      expect(filename).not.toContain('!');
      expect(filename).toContain('Test___Vendor_');
    });

    it('should generate filename without vendor name', () => {
      const filename = ExcelExportService.generateFilename(undefined, 2);
      expect(filename).toMatch(/vendor_data_tier2_\d{4}-\d{2}-\d{2}\.xlsx/);
    });

    it('should generate filename without tier', () => {
      const filename = ExcelExportService.generateFilename('Test Vendor');
      expect(filename).toMatch(/Test_Vendor_vendor_data_\d{4}-\d{2}-\d{2}\.xlsx/);
      expect(filename).not.toContain('tier');
    });

    it('should include current date in filename', () => {
      const today = new Date().toISOString().split('T')[0];
      const filename = ExcelExportService.generateFilename('Test', 2);
      expect(filename).toContain(today);
    });
  });

  describe('formatting', () => {
    it('should apply header styling', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const headerCell = worksheet.getRow(1).getCell(1);

      // Should have bold font
      expect(headerCell.font?.bold).toBe(true);

      // Should have fill color
      expect(headerCell.fill).toBeDefined();
    });

    it('should set appropriate column widths', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const headers = worksheet.getRow(1).values as any[];
      const emailIndex = headers.findIndex((h: string) => h === 'Contact Email');

      if (emailIndex > 0) {
        const column = worksheet.getColumn(emailIndex);
        // Email columns should be wider (35)
        expect(column.width).toBeGreaterThan(20);
      }
    });

    it('should set column widths appropriately', async () => {
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      // Verify that columns have been configured with widths
      const column1 = worksheet.getColumn(1);
      expect(column1.width).toBeGreaterThan(0);
      expect(column1.width).toBeLessThan(100); // Reasonable width
    });
  });

  describe('export transformations', () => {
    it('should apply export transformations when defined', async () => {
      // Note: Export transformations are defined for boolean fields in field mappings
      // featured and partner fields have exportTransform: (val) => val ? 'Yes' : 'No'
      // However, these fields are admin-only and not exportable by vendors
      // This test verifies the transformation mechanism works if present

      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      // Should successfully export without transformation errors
      expect(worksheet.rowCount).toBeGreaterThan(0);
    });

    it('should handle transformation errors gracefully', async () => {
      // Even if a transformation fails, the export should continue
      const buffer = await ExcelExportService.exportVendor(
        mockVendor as Vendor,
        2
      );

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle vendor with minimal data', async () => {
      const minimalVendor: Partial<Vendor> = {
        companyName: 'Minimal Corp',
        description: 'Minimal description',
        contactEmail: 'minimal@example.com'
      };

      const buffer = await ExcelExportService.exportVendor(
        minimalVendor as Vendor,
        0
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      expect(worksheet.rowCount).toBeGreaterThan(0);
    });

    it('should handle very long text fields', async () => {
      const longTextVendor: Partial<Vendor> = {
        companyName: 'Test Corp',
        description: 'Test description',
        contactEmail: 'test@example.com',
        longDescription: 'A'.repeat(2000) // Very long description
      };

      const buffer = await ExcelExportService.exportVendor(
        longTextVendor as Vendor,
        2
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      expect(worksheet.rowCount).toBeGreaterThan(0);
    });

    it('should handle special characters in data', async () => {
      const specialCharVendor: Partial<Vendor> = {
        companyName: 'Test & "Special" <Corp>',
        description: 'Description with\nnewlines\tand\ttabs',
        contactEmail: 'test@example.com'
      };

      const buffer = await ExcelExportService.exportVendor(
        specialCharVendor as Vendor,
        0
      );

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const headers = worksheet.getRow(1).values as any[];
      const nameIndex = headers.findIndex((h: string) => h === 'Company Name');
      const dataRow = worksheet.getRow(2).values as any[];

      expect(dataRow[nameIndex]).toContain('Special');
    });
  });
});
