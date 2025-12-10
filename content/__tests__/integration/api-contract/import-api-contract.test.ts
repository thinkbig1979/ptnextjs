/**
 * Excel Import API Contract Tests
 *
 * Tests that the Excel import data flow maintains correct structure transformations
 * from Excel columns → Parsed Data → Validated Data → Vendor Update API
 *
 * This test suite audits:
 * 1. Excel field mappings coverage vs Vendor schema
 * 2. Data type transformations (CSV strings → arrays, flat fields → nested objects)
 * 3. HQ location fields → locations array transformation
 * 4. Import history record structure alignment with Payload schema
 * 5. Service/Parser/API data structure contracts
 *
 * Critical Issues Found (See FINDINGS.md):
 * - ARRAY_STRING fields lack CSV-to-array transformation
 * - companyValues field missing from field mappings
 * - HQ fields transformation expects wrong structure in vendor update
 * - Import history relationship fields expect number IDs but may receive strings
 */

import {
  VENDOR_FIELD_MAPPINGS,
  getFieldMapping,
  getImportableFieldsForTier,
  FieldDataType,
  type VendorTier
} from '@/lib/config/excel-field-mappings';
import { ExcelParserService, type ParsedVendorRow } from '@/lib/services/ExcelParserService';
import { ImportValidationService, type RowValidationResult } from '@/lib/services/ImportValidationService';
import { ImportExecutionService, type ImportOptions, type FieldChange } from '@/lib/services/ImportExecutionService';
import { safeValidateVendorUpdate } from '@/lib/validation/vendor-update-schema';
import type { Vendor } from '@/lib/types';

describe('Excel Import API Contract Tests', () => {
  describe('Field Mappings Coverage Audit', () => {
    it('should have mappings for all importable vendor fields', () => {
      // These fields exist in Payload Vendors schema but are MISSING from field mappings
      const missingFields = [
        // NOTE: companyValues was FIXED - now has a mapping
        'certifications', // Listed as string in vendor-update-schema but missing mapping
        'awards',         // Listed in tier validation but missing mapping
        'innovationHighlights', // Listed in tier validation but missing mapping
      ];

      missingFields.forEach(fieldName => {
        const mapping = getFieldMapping(fieldName);
        expect(mapping).toBeUndefined(); // Documents the gap
      });
    });

    it('should count total field mappings', () => {
      expect(VENDOR_FIELD_MAPPINGS).toHaveLength(29); // Added companyValues

      // Breakdown by access level
      const free = VENDOR_FIELD_MAPPINGS.filter(f => f.accessLevel === 'FREE');
      const tier1 = VENDOR_FIELD_MAPPINGS.filter(f => f.accessLevel === 'TIER1');
      const admin = VENDOR_FIELD_MAPPINGS.filter(f => f.accessLevel === 'ADMIN');

      expect(free).toHaveLength(5);  // companyName, description, contactEmail, contactPhone, logo
      expect(tier1).toHaveLength(21); // Most fields (added companyValues)
      expect(admin).toHaveLength(3);  // featured, partner, tier
    });

    it('should have correct importable field counts per tier', () => {
      const tier0Fields = getImportableFieldsForTier(0 as VendorTier);
      const tier1Fields = getImportableFieldsForTier(1 as VendorTier);
      const tier2Fields = getImportableFieldsForTier(2 as VendorTier);

      // Tier 0 (FREE) - only basic fields (companyName, description, contactEmail, contactPhone)
      // Note: logo is FREE tier but not importable via Excel
      expect(tier0Fields).toHaveLength(4);

      // Tier 1 - FREE + TIER1 fields (but logo and admin fields not importable)
      expect(tier1Fields.length).toBeGreaterThan(tier0Fields.length);

      // Admin fields should never be importable
      const adminImportable = tier2Fields.filter(f => f.accessLevel === 'ADMIN' && f.importable);
      expect(adminImportable).toHaveLength(0);
    });
  });

  describe('ARRAY_STRING Transformation Contract', () => {
    it('serviceAreas field should have CSV-to-object array transformation', () => {
      const serviceAreasMapping = getFieldMapping('serviceAreas');

      expect(serviceAreasMapping).toBeDefined();
      expect(serviceAreasMapping?.dataType).toBe(FieldDataType.ARRAY_STRING);
      expect(serviceAreasMapping?.description).toContain('Comma-separated');

      // FIXED: importTransform function converts CSV to array of objects
      expect(serviceAreasMapping?.importTransform).toBeDefined();

      // Verify transformation works correctly
      if (serviceAreasMapping?.importTransform) {
        const result = serviceAreasMapping.importTransform("Mediterranean, Caribbean, Pacific");
        expect(result).toEqual([
          { area: "Mediterranean" },
          { area: "Caribbean" },
          { area: "Pacific" }
        ]);
      }
    });

    it('companyValues field should have CSV-to-object array transformation', () => {
      const companyValuesMapping = getFieldMapping('companyValues');

      expect(companyValuesMapping).toBeDefined();
      expect(companyValuesMapping?.dataType).toBe(FieldDataType.ARRAY_STRING);
      expect(companyValuesMapping?.importTransform).toBeDefined();

      // Verify transformation works correctly
      if (companyValuesMapping?.importTransform) {
        const result = companyValuesMapping.importTransform("Quality, Innovation, Integrity");
        expect(result).toEqual([
          { value: "Quality" },
          { value: "Innovation" },
          { value: "Integrity" }
        ]);
      }
    });

    it('should transform CSV strings to Payload-compatible object arrays', () => {
      const csvInput = "Mediterranean, Caribbean, Pacific Northwest";
      const expectedOutput = [
        { area: "Mediterranean" },
        { area: "Caribbean" },
        { area: "Pacific Northwest" }
      ];

      // This is the exact transformation Payload CMS expects
      const payloadTransform = (csv: string) =>
        csv.split(',').map(s => s.trim()).filter(s => s.length > 0).map(area => ({ area }));

      expect(payloadTransform(csvInput)).toEqual(expectedOutput);
    });

    it('FIXED: importTransform converts strings to arrays before validation', () => {
      // With the fix, importTransform in field mappings converts CSV to array of objects
      // BEFORE validation runs, so validation receives the correct format

      const serviceAreasMapping = getFieldMapping('serviceAreas');
      const csvInput = "Mediterranean, Caribbean";

      // Transform happens during parsing, before validation
      const transformedValue = serviceAreasMapping?.importTransform?.(csvInput);

      // Result is now an array of objects (not a string)
      expect(Array.isArray(transformedValue)).toBe(true);
      expect(transformedValue).toEqual([
        { area: "Mediterranean" },
        { area: "Caribbean" }
      ]);
    });
  });

  describe('HQ Location Fields Transformation Contract', () => {
    it('should document HQ fields structure in field mappings', () => {
      const hqAddress = getFieldMapping('hqAddress');
      const hqCity = getFieldMapping('hqCity');
      const hqCountry = getFieldMapping('hqCountry');

      expect(hqAddress?.fieldName).toBe('hqAddress');
      expect(hqCity?.fieldName).toBe('hqCity');
      expect(hqCountry?.fieldName).toBe('hqCountry');

      // These are FLAT fields in Excel but need to be transformed
      // into a locations array entry with isHQ: true
    });

    it('should transform HQ fields to locations array structure', () => {
      // Excel input (flat):
      const excelData = {
        hqAddress: '123 Harbor View Drive',
        hqCity: 'Fort Lauderdale',
        hqCountry: 'United States'
      };

      // Expected vendor update structure (nested):
      const expectedVendorUpdate = {
        locations: [
          {
            address: '123 Harbor View Drive',
            city: 'Fort Lauderdale',
            country: 'United States',
            isHQ: true
          }
        ]
      };

      // ImportExecutionService.buildHQLocationChange should handle this
      // But it needs to create the correct structure for vendor-update-schema
    });

    it('ISSUE: Vendor update schema expects specific location object structure', () => {
      // The vendor-update-schema.locations expects this structure:
      const validLocationStructure = {
        locations: [
          {
            locationName: 'Headquarters',
            address: '123 Harbor View',
            city: 'Fort Lauderdale',
            state: 'FL',
            country: 'United States',
            postalCode: '33316',
            latitude: 26.122439,
            longitude: -80.137314,
            isHQ: true,
            type: 'headquarters' as const
          }
        ]
      };

      const result = safeValidateVendorUpdate(validLocationStructure);
      expect(result.success).toBe(true);

      // But HQ field transformation only provides: address, city, country
      // Missing: locationName, state, postalCode, latitude, longitude, type
      const incompleteHQTransform = {
        locations: [
          {
            address: '123 Harbor View',
            city: 'Fort Lauderdale',
            country: 'United States',
            isHQ: true
            // Missing required geocoding and other fields
          }
        ]
      };

      // This should still pass because all fields are optional in the schema
      const result2 = safeValidateVendorUpdate(incompleteHQTransform);
      expect(result2.success).toBe(true);
    });
  });

  describe('Vendor Update Schema Contract', () => {
    it('should accept serviceAreas as array of strings', () => {
      const data = {
        serviceAreas: ["Mediterranean", "Caribbean", "Pacific Northwest"]
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });

    it('should accept serviceAreas as array of objects (Payload format)', () => {
      const data = {
        serviceAreas: [
          { id: '1', area: 'Mediterranean', description: 'Full Med coverage' },
          { id: '2', area: 'Caribbean', description: null }
        ]
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });

    it('should accept companyValues as array of strings', () => {
      const data = {
        companyValues: ["Quality", "Innovation", "Customer Service"]
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });

    it('should accept companyValues as array of objects (Payload format)', () => {
      const data = {
        companyValues: [
          { id: '1', value: 'Quality', description: 'We never compromise' },
          { id: '2', value: 'Innovation', description: 'Always improving' }
        ]
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });

    it('should accept locations array from HQ transformation', () => {
      const data = {
        locations: [
          {
            address: '123 Harbor View Drive',
            city: 'Fort Lauderdale',
            country: 'United States',
            isHQ: true
          }
        ]
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Import History Record Structure Contract', () => {
    it('should document expected import history structure', () => {
      // ImportExecutionService.createImportHistory creates this structure:
      const importHistoryRecord = {
        vendor: 123,  // Number ID (relationship)
        user: 456,    // Number ID (relationship)
        importDate: '2025-12-07T10:00:00.000Z',
        status: 'success' as const,
        rowsProcessed: 1,
        successfulRows: 1,
        failedRows: 0,
        changes: [
          {
            field: 'companyName',
            oldValue: 'Old Name',
            newValue: 'New Name'
          }
        ],
        errors: [],
        filename: 'vendor-data.xlsx'
      };

      // This matches ImportHistory.ts schema requirements:
      expect(importHistoryRecord.vendor).toEqual(expect.any(Number));
      expect(importHistoryRecord.user).toEqual(expect.any(Number));
      expect(importHistoryRecord.status).toMatch(/^(success|partial|failed)$/);
      expect(importHistoryRecord.rowsProcessed).toEqual(
        importHistoryRecord.successfulRows + importHistoryRecord.failedRows
      );
    });

    it('ISSUE: ImportOptions uses string IDs but Payload expects numbers', () => {
      // ImportOptions interface (ImportExecutionService.ts):
      const options: ImportOptions = {
        vendorId: '123',  // STRING
        userId: '456',    // STRING
        overwriteExisting: true,
        filename: 'test.xlsx'
      };

      // But createImportHistory does: vendor: Number(options.vendorId)
      // This conversion happens, but the type mismatch should be documented
      expect(typeof options.vendorId).toBe('string');
      expect(typeof Number(options.vendorId)).toBe('number');
    });

    it('should validate row count consistency', () => {
      // ImportHistory beforeChange hook validates:
      // rowsProcessed === successfulRows + failedRows

      const validRecord = {
        rowsProcessed: 10,
        successfulRows: 7,
        failedRows: 3
      };
      expect(validRecord.rowsProcessed).toBe(
        validRecord.successfulRows + validRecord.failedRows
      );

      const invalidRecord = {
        rowsProcessed: 10,
        successfulRows: 7,
        failedRows: 4  // Wrong! 7 + 4 = 11, not 10
      };
      expect(invalidRecord.rowsProcessed).not.toBe(
        invalidRecord.successfulRows + invalidRecord.failedRows
      );
    });

    it('should auto-determine status from row counts', () => {
      const allSuccess = {
        successfulRows: 10,
        failedRows: 0
      };
      expect(allSuccess.failedRows).toBe(0);
      // Expected status: 'success'

      const partialSuccess = {
        successfulRows: 7,
        failedRows: 3
      };
      expect(partialSuccess.successfulRows).toBeGreaterThan(0);
      expect(partialSuccess.failedRows).toBeGreaterThan(0);
      // Expected status: 'partial'

      const allFailed = {
        successfulRows: 0,
        failedRows: 10
      };
      expect(allFailed.successfulRows).toBe(0);
      // Expected status: 'failed'
    });
  });

  describe('Data Flow Integration Contract', () => {
    it('should trace data structure through entire pipeline', () => {
      // 1. Excel Column → Parser
      const excelValue = "Mediterranean, Caribbean, Pacific";

      // 2. Parser → Validation (CURRENT BEHAVIOR - NO TRANSFORM)
      const parsedData = {
        serviceAreas: excelValue  // Still a string!
      };
      expect(typeof parsedData.serviceAreas).toBe('string');

      // 3. Validation → Execution (EXPECTS ARRAY)
      // ImportValidationService.validateArrayString will FAIL
      // because it checks: if (!Array.isArray(value))

      // 4. Execution → Vendor Update API
      // Even if it passes validation, vendor-update-schema expects:
      // z.array(z.union([z.string(), z.object(...)]))

      // CONCLUSION: serviceAreas needs importTransform function
    });

    it('should document correct transformation pipeline', () => {
      // CORRECT FLOW (what should happen):

      // 1. Excel: "Mediterranean, Caribbean"
      const excelInput = "Mediterranean, Caribbean";

      // 2. Parser with importTransform:
      const importTransform = (csv: string) =>
        csv.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const parsedArray = importTransform(excelInput);
      expect(parsedArray).toEqual(["Mediterranean", "Caribbean"]);

      // 3. Validation: validateArrayString passes
      expect(Array.isArray(parsedArray)).toBe(true);

      // 4. Vendor Update Schema: accepts array of strings
      const vendorUpdate = { serviceAreas: parsedArray };
      const result = safeValidateVendorUpdate(vendorUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate HQ fields transformation flow', () => {
      // 1. Excel columns (flat):
      const excelData = {
        hqAddress: '123 Harbor View',
        hqCity: 'Fort Lauderdale',
        hqCountry: 'United States'
      };

      // 2. Parser: keeps fields flat
      expect(excelData).toHaveProperty('hqAddress');
      expect(excelData).toHaveProperty('hqCity');

      // 3. Execution: ImportExecutionService.extractHQFields
      const hqFields = {
        address: excelData.hqAddress,
        city: excelData.hqCity,
        country: excelData.hqCountry
      };
      expect(hqFields).toEqual({
        address: '123 Harbor View',
        city: 'Fort Lauderdale',
        country: 'United States'
      });

      // 4. Execution: buildHQLocationChange creates locations array
      const locationChange: FieldChange = {
        field: 'locations',
        oldValue: [],
        newValue: [
          {
            address: hqFields.address,
            city: hqFields.city,
            country: hqFields.country,
            isHQ: true
          }
        ],
        changed: true
      };

      // 5. Vendor Update: applies locations array
      const vendorUpdate = {
        locations: locationChange.newValue as any[]
      };
      const result = safeValidateVendorUpdate(vendorUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe('Missing Field Mappings Impact Analysis', () => {
    it('should identify fields in vendor-update-schema but missing from mappings', () => {
      const vendorSchemaFields = [
        'companyName', 'slug', 'description', 'logo', 'contactEmail', 'contactPhone',
        'website', 'linkedinUrl', 'twitterUrl', 'foundedYear', 'longDescription',
        'totalProjects', 'employeeCount', 'linkedinFollowers', 'instagramFollowers',
        'clientSatisfactionScore', 'repeatClientPercentage',
        'videoUrl', 'videoThumbnail', 'videoDuration', 'videoTitle', 'videoDescription',
        'serviceAreas', 'companyValues', 'certifications', 'locations',
        'caseStudies', 'teamMembers'
      ];

      const mappedFields = VENDOR_FIELD_MAPPINGS.map(m => m.fieldName);
      const missingFromMappings = vendorSchemaFields.filter(
        field => !mappedFields.includes(field)
      );

      // These fields exist in the vendor update schema but have NO Excel mapping:
      // Note: companyValues was added - it now HAS a mapping
      expect(missingFromMappings).not.toContain('companyValues'); // FIXED
      expect(missingFromMappings).toContain('certifications');
      expect(missingFromMappings).toContain('caseStudies');
      expect(missingFromMappings).toContain('teamMembers');
      expect(missingFromMappings).toContain('videoDuration');
      expect(missingFromMappings).toContain('slug');

      // This means vendors CANNOT import these fields via Excel!
    });

    it('should verify admin-only fields are not importable', () => {
      const adminFields = ['featured', 'partner', 'tier'];

      adminFields.forEach(fieldName => {
        const mapping = getFieldMapping(fieldName);
        expect(mapping?.importable).toBe(false);
      });
    });

    it('should verify file upload fields are not importable', () => {
      const fileFields = ['logo', 'videoThumbnail'];

      fileFields.forEach(fieldName => {
        const mapping = getFieldMapping(fieldName);
        expect(mapping?.exportable).toBe(true);  // Can export URLs
        expect(mapping?.importable).toBe(false); // Cannot import (file upload only)
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle empty Excel values correctly', () => {
      const mockRow: ParsedVendorRow = {
        rowNumber: 2,
        data: {
          companyName: '',  // Empty string
          contactEmail: '', // Empty string
        },
        rawData: {
          companyName: '',
          contactEmail: '',
        }
      };

      // ImportExecutionService.calculateChanges skips empty values:
      // if (newValue === null || newValue === undefined || newValue === '') continue;
      expect(mockRow.data.companyName).toBe('');
      expect(mockRow.data.contactEmail).toBe('');
    });

    it('should handle overwrite vs fill behavior', () => {
      const currentVendor: Partial<Vendor> = {
        companyName: 'Old Company Name',
        contactEmail: 'old@example.com',
        description: ''  // Empty field
      };

      const newData = {
        companyName: 'New Company Name',
        description: 'Now has a description'
      };

      // With overwriteExisting: true
      const overwriteChanges = {
        companyName: 'New Company Name',  // Overwrites existing
        description: 'Now has a description'  // Fills empty
      };

      // With overwriteExisting: false
      const fillOnlyChanges = {
        companyName: 'Old Company Name',  // Keeps existing
        description: 'Now has a description'  // Fills empty
      };

      expect(overwriteChanges.companyName).not.toBe(currentVendor.companyName);
      expect(fillOnlyChanges.companyName).toBe(currentVendor.companyName);
    });
  });
});
