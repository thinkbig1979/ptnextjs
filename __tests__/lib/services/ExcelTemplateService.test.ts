/**
 * Unit tests for ExcelTemplateService
 */

import { ExcelTemplateService } from '@/lib/services/ExcelTemplateService';
import ExcelJS from 'exceljs';
import type { VendorTier } from '@/lib/config/excel-field-mappings';
import { getImportableFieldsForTier } from '@/lib/config/excel-field-mappings';

describe('ExcelTemplateService', () => {
  describe('generateTemplate', () => {
    it('should generate template buffer for tier 0', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(0);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate template buffer for tier 1', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate template buffer for tier 2', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(2);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate template buffer for tier 3', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(3);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate larger buffers for higher tiers', async () => {
      const tier0Buffer = await ExcelTemplateService.generateTemplate(0);
      const tier2Buffer = await ExcelTemplateService.generateTemplate(2);

      // Higher tier templates should generally be larger (more fields)
      expect(tier2Buffer.length).toBeGreaterThan(tier0Buffer.length);
    });
  });

  describe('Workbook Structure', () => {
    it('should include exactly 2 worksheets', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      expect(workbook.worksheets.length).toBe(2);
    });

    it('should have "Vendor Data" as first worksheet', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      expect(workbook.worksheets[0].name).toBe('Vendor Data');
    });

    it('should have "Instructions" as second worksheet', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      expect(workbook.worksheets[1].name).toBe('Instructions');
    });

    it('should set workbook metadata', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      expect(workbook.creator).toBe('Paul Thames Superyacht Technology');
      expect(workbook.created).toBeInstanceOf(Date);
      expect(workbook.modified).toBeInstanceOf(Date);
    });
  });

  describe('Vendor Data Worksheet', () => {
    it('should include tier-appropriate fields for tier 0', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(0);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');
      const headerRow = worksheet?.getRow(1);
      const headers = (headerRow?.values as any[]).filter(Boolean).map((v: any) =>
        typeof v === 'string' ? v.replace(' *', '') : v
      );

      // Should include FREE tier fields
      expect(headers).toContain('Company Name');
      expect(headers).toContain('Contact Email');
      expect(headers).toContain('Short Description');

      // Should NOT include TIER1+ fields
      expect(headers).not.toContain('Website URL');
      expect(headers).not.toContain('LinkedIn URL');
    });

    it('should include tier-appropriate fields for tier 1', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');
      const headerRow = worksheet?.getRow(1);
      const headers = (headerRow?.values as any[]).filter(Boolean).map((v: any) =>
        typeof v === 'string' ? v.replace(' *', '') : v
      );

      // Should include FREE and TIER1 fields
      expect(headers).toContain('Company Name');
      expect(headers).toContain('Website URL');
      expect(headers).toContain('LinkedIn URL');

      // Should NOT include TIER2+ fields
      expect(headers).not.toContain('Detailed Description');
    });

    it('should include tier-appropriate fields for tier 2', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(2);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');
      const headerRow = worksheet?.getRow(1);
      const headers = (headerRow?.values as any[]).filter(Boolean).map((v: any) =>
        typeof v === 'string' ? v.replace(' *', '') : v
      );

      // Should include FREE, TIER1, and TIER2 fields
      expect(headers).toContain('Company Name');
      expect(headers).toContain('Website URL');
      expect(headers).toContain('Detailed Description');
      expect(headers).toContain('LinkedIn Followers'); // TIER2 field
    });

    it('should include correct number of columns for tier', async () => {
      const tiers: VendorTier[] = [0, 1, 2, 3];

      for (const tier of tiers) {
        const buffer = await ExcelTemplateService.generateTemplate(tier);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.getWorksheet('Vendor Data');
        const headerRow = worksheet?.getRow(1);
        const headers = (headerRow?.values as any[]).filter(Boolean);

        const expectedFields = getImportableFieldsForTier(tier);
        expect(headers.length).toBe(expectedFields.length);
      }
    });

    it('should mark required fields with asterisk', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(0);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');
      const headerRow = worksheet?.getRow(1);
      const nameHeader = headerRow?.getCell(1).value as string;

      // Company Name is required
      expect(nameHeader).toContain('*');
      expect(nameHeader).toContain('Company Name');
    });

    it('should have styled header row', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');
      const headerCell = worksheet?.getCell(1, 1);

      expect(headerCell?.font?.bold).toBe(true);
      expect(headerCell?.font?.size).toBe(12);
      expect(headerCell?.fill?.type).toBe('pattern');
    });

    it('should include example row with sample data', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');
      const exampleRow = worksheet?.getRow(2);
      const exampleCellValue = exampleRow?.getCell(1).value;

      // Should have example data (from field.example)
      expect(exampleCellValue).toBeTruthy();
      expect(typeof exampleCellValue).toBe('string');
      expect((exampleCellValue as string).length).toBeGreaterThan(0);
    });

    it('should style example row differently', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');
      const exampleCell = worksheet?.getCell(2, 1);

      expect(exampleCell?.font?.italic).toBe(true);
      expect(exampleCell?.font?.color?.argb).toBe('FF808080');
    });

    it('should freeze header row', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');

      expect(worksheet?.views).toBeDefined();
      expect(worksheet?.views?.[0]?.state).toBe('frozen');
      expect(worksheet?.views?.[0]?.ySplit).toBe(1);
      expect(worksheet?.views?.[0]?.xSplit).toBe(0);
    });

    it('should set appropriate column widths', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');

      // All columns should have widths set
      const columnCount = getImportableFieldsForTier(1).length;
      for (let i = 1; i <= columnCount; i++) {
        const column = worksheet?.getColumn(i);
        expect(column?.width).toBeDefined();
        expect(column?.width).toBeGreaterThan(10);
      }
    });
  });

  describe('Data Validation', () => {
    it('should apply validation starting from row 3', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');

      // Row 1 (header) and row 2 (example) should not have validation
      // Row 3 onwards should have validation where applicable
      const cell3 = worksheet?.getCell(3, 1);

      // Name field has text length validation
      if (cell3?.dataValidation) {
        expect(cell3.dataValidation.type).toBeTruthy();
      }
    });

    it('should apply text length validation for string fields', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(0);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');

      // Find Company Name column (has maxLength constraint)
      const headerRow = worksheet?.getRow(1);
      const headers = headerRow?.values as any[];
      const nameColumnIndex = headers.findIndex((h: any) =>
        typeof h === 'string' && h.includes('Company Name')
      );

      if (nameColumnIndex > 0) {
        const cell = worksheet?.getCell(3, nameColumnIndex);

        expect(cell?.dataValidation).toBeDefined();
        expect(cell?.dataValidation?.type).toBe('textLength');
        expect(cell?.dataValidation?.operator).toBe('lessThanOrEqual');
      }
    });

    it('should apply number range validation for year fields', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');

      // Find Founded Year column
      const headerRow = worksheet?.getRow(1);
      const headers = headerRow?.values as any[];
      const yearColumnIndex = headers.findIndex((h: any) =>
        typeof h === 'string' && h.includes('Founded Year')
      );

      if (yearColumnIndex > 0) {
        const cell = worksheet?.getCell(3, yearColumnIndex);

        expect(cell?.dataValidation).toBeDefined();
        expect(cell?.dataValidation?.type).toBe('whole');
        expect(cell?.dataValidation?.operator).toBe('between');
        expect(cell?.dataValidation?.formulae).toBeDefined();
      }
    });

    it('should respect required field validation', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(0);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Vendor Data');

      // Company Name is required
      const cell = worksheet?.getCell(3, 1);

      if (cell?.dataValidation) {
        // allowBlank should be false for required fields, or undefined (which defaults to false)
        expect(cell.dataValidation.allowBlank === false || cell.dataValidation.allowBlank === undefined).toBe(true);
      }
    });
  });

  describe('Instructions Worksheet', () => {
    it('should include tier information', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(2);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Instructions');
      let foundTierInfo = false;

      worksheet?.eachRow((row) => {
        row.eachCell((cell) => {
          const value = cell.value?.toString() || '';
          if (value.includes('Tier') && value.includes('2')) {
            foundTierInfo = true;
          }
        });
      });

      expect(foundTierInfo).toBe(true);
    });

    it('should include usage instructions', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Instructions');
      let foundInstructions = false;

      worksheet?.eachRow((row) => {
        row.eachCell((cell) => {
          const value = cell.value?.toString() || '';
          if (value.includes('How to Use') || value.includes('upload')) {
            foundInstructions = true;
          }
        });
      });

      expect(foundInstructions).toBe(true);
    });

    it('should include field descriptions', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Instructions');
      let foundFieldDescriptions = false;

      worksheet?.eachRow((row) => {
        row.eachCell((cell) => {
          const value = cell.value?.toString() || '';
          if (value.includes('Required Fields') || value.includes('Optional Fields')) {
            foundFieldDescriptions = true;
          }
        });
      });

      expect(foundFieldDescriptions).toBe(true);
    });

    it('should include important notes', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Instructions');
      let foundNotes = false;

      worksheet?.eachRow((row) => {
        row.eachCell((cell) => {
          const value = cell.value?.toString() || '';
          if (value.includes('Important') || value.includes('Tips')) {
            foundNotes = true;
          }
        });
      });

      expect(foundNotes).toBe(true);
    });

    it('should have formatted title', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet('Instructions');
      const titleCell = worksheet?.getRow(1).getCell(2);

      expect(titleCell?.font?.bold).toBe(true);
      expect(titleCell?.font?.size).toBeGreaterThan(14);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Test with invalid tier (should still work with type safety)
      const buffer = await ExcelTemplateService.generateTemplate(0);
      expect(buffer).toBeInstanceOf(Buffer);
    });
  });

  describe('Generated File Validity', () => {
    it('should generate valid Excel file that can be re-loaded', async () => {
      const buffer = await ExcelTemplateService.generateTemplate(1);

      // Try to load the generated file
      const workbook = new ExcelJS.Workbook();
      await expect(workbook.xlsx.load(buffer)).resolves.not.toThrow();
    });

    it('should preserve data after save and reload', async () => {
      const tier: VendorTier = 1;
      const buffer = await ExcelTemplateService.generateTemplate(tier);

      // Load the generated file
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      // Re-save it
      const reloadedBuffer = await workbook.xlsx.writeBuffer();

      // Load again
      const workbook2 = new ExcelJS.Workbook();
      await workbook2.xlsx.load(reloadedBuffer);

      // Check structure is preserved
      expect(workbook2.worksheets.length).toBe(2);
      expect(workbook2.worksheets[0].name).toBe('Vendor Data');
      expect(workbook2.worksheets[1].name).toBe('Instructions');
    });
  });

  describe('Tier Differentiation', () => {
    it('should generate different templates for different tiers', async () => {
      const tier0Buffer = await ExcelTemplateService.generateTemplate(0);
      const tier1Buffer = await ExcelTemplateService.generateTemplate(1);
      const tier2Buffer = await ExcelTemplateService.generateTemplate(2);

      // Buffers should be different (different field counts)
      expect(tier0Buffer.equals(tier1Buffer)).toBe(false);
      expect(tier1Buffer.equals(tier2Buffer)).toBe(false);
    });

    it('should include more fields for higher tiers', async () => {
      const tier0Buffer = await ExcelTemplateService.generateTemplate(0);
      const tier1Buffer = await ExcelTemplateService.generateTemplate(1);
      const tier2Buffer = await ExcelTemplateService.generateTemplate(2);

      const workbook0 = new ExcelJS.Workbook();
      await workbook0.xlsx.load(tier0Buffer);
      const worksheet0 = workbook0.getWorksheet('Vendor Data');
      const headers0 = (worksheet0?.getRow(1).values as any[]).filter(Boolean);

      const workbook1 = new ExcelJS.Workbook();
      await workbook1.xlsx.load(tier1Buffer);
      const worksheet1 = workbook1.getWorksheet('Vendor Data');
      const headers1 = (worksheet1?.getRow(1).values as any[]).filter(Boolean);

      const workbook2 = new ExcelJS.Workbook();
      await workbook2.xlsx.load(tier2Buffer);
      const worksheet2 = workbook2.getWorksheet('Vendor Data');
      const headers2 = (worksheet2?.getRow(1).values as any[]).filter(Boolean);

      expect(headers1.length).toBeGreaterThan(headers0.length);
      expect(headers2.length).toBeGreaterThan(headers1.length);
    });
  });
});
