# Task BE-2: Create Field Mapping Configuration

**Status:** 🔒 Blocked (waiting for BE-1)
**Agent:** backend-nodejs-specialist
**Estimated Time:** 2 hours
**Phase:** Backend Implementation
**Dependencies:** BE-1

## Objective

Create a centralized configuration file that maps vendor fields to Excel columns with tier-based access control, validation rules, and data transformations.

## Context Requirements

- Review @.agent-os/specs/2025-11-06-excel-vendor-import-export/sub-specs/technical-spec.md (Section 2.1: Field Mappings)
- Review /lib/types.ts for Vendor interface definition
- Review existing TierService for tier level definitions
- Understand tier-based field access rules from spec

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/lib/config/excel-field-mappings.ts`
- [ ] Complete field mapping configuration for all vendor fields
- [ ] Tier-based field access defined (FREE, TIER1, TIER2, TIER3)
- [ ] Validation rules defined for each field
- [ ] Data transformation functions defined where needed
- [ ] Excel column headers defined
- [ ] Import/export capabilities specified per field
- [ ] TypeScript interfaces for configuration structure
- [ ] Helper functions for tier-based field filtering
- [ ] Comprehensive JSDoc comments

## Detailed Specifications

### File Structure

```typescript
// /home/edwin/development/ptnextjs/lib/config/excel-field-mappings.ts

import { VendorTier } from '@/lib/types';

/**
 * Field access level based on vendor tier
 */
export enum FieldAccessLevel {
  FREE = 'FREE',      // Available to all vendors
  TIER1 = 'TIER1',    // Tier 1 and above
  TIER2 = 'TIER2',    // Tier 2 and above
  TIER3 = 'TIER3',    // Tier 3 only
  ADMIN = 'ADMIN'     // Admin only
}

/**
 * Field data type for validation
 */
export enum FieldDataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  EMAIL = 'EMAIL',
  URL = 'URL',
  PHONE = 'PHONE',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  ARRAY_STRING = 'ARRAY_STRING'  // Comma-separated values
}

/**
 * Configuration for a single field mapping
 */
export interface FieldMapping {
  // Field identification
  fieldName: string;              // Vendor object property name
  excelColumn: string;            // Excel column header
  excelColumnIndex?: number;      // Optional fixed column index

  // Access control
  accessLevel: FieldAccessLevel;  // Minimum tier required

  // Data type and validation
  dataType: FieldDataType;
  required: boolean;              // Is field required?
  maxLength?: number;             // Max string length
  minValue?: number;              // Min numeric value
  maxValue?: number;              // Max numeric value
  allowedValues?: string[];       // Enum values

  // Import/Export capabilities
  exportable: boolean;            // Can be exported?
  importable: boolean;            // Can be imported?

  // Transformation functions
  exportTransform?: (value: any) => string;   // Transform for export
  importTransform?: (value: string) => any;   // Transform for import

  // Validation
  customValidator?: (value: any) => string | null;  // Returns error message or null

  // Display
  description?: string;           // Field description for UI
  example?: string;               // Example value
}

/**
 * Complete field mapping configuration
 */
export const VENDOR_FIELD_MAPPINGS: FieldMapping[] = [
  // FREE TIER FIELDS
  {
    fieldName: 'name',
    excelColumn: 'Company Name',
    accessLevel: FieldAccessLevel.FREE,
    dataType: FieldDataType.STRING,
    required: true,
    maxLength: 100,
    exportable: true,
    importable: true,
    description: 'Official company name',
    example: 'Acme Marine Technologies'
  },
  {
    fieldName: 'description',
    excelColumn: 'Short Description',
    accessLevel: FieldAccessLevel.FREE,
    dataType: FieldDataType.STRING,
    required: true,
    maxLength: 300,
    exportable: true,
    importable: true,
    description: 'Brief company description (max 300 chars)',
    example: 'Leading provider of marine navigation systems'
  },
  {
    fieldName: 'email',
    excelColumn: 'Contact Email',
    accessLevel: FieldAccessLevel.FREE,
    dataType: FieldDataType.EMAIL,
    required: true,
    exportable: true,
    importable: true,
    description: 'Primary contact email',
    example: 'contact@acme.com'
  },
  {
    fieldName: 'phone',
    excelColumn: 'Contact Phone',
    accessLevel: FieldAccessLevel.FREE,
    dataType: FieldDataType.PHONE,
    required: false,
    exportable: true,
    importable: true,
    description: 'Primary contact phone number',
    example: '+1-555-123-4567'
  },

  // TIER 1+ FIELDS
  {
    fieldName: 'website',
    excelColumn: 'Website URL',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.URL,
    required: false,
    exportable: true,
    importable: true,
    description: 'Company website URL',
    example: 'https://www.acme.com'
  },
  {
    fieldName: 'linkedIn',
    excelColumn: 'LinkedIn URL',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.URL,
    required: false,
    exportable: true,
    importable: true,
    description: 'LinkedIn company page URL',
    example: 'https://linkedin.com/company/acme'
  },
  {
    fieldName: 'founded',
    excelColumn: 'Founded Year',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.NUMBER,
    required: false,
    minValue: 1800,
    maxValue: new Date().getFullYear(),
    exportable: true,
    importable: true,
    description: 'Year company was founded',
    example: '1995'
  },
  {
    fieldName: 'employeeCount',
    excelColumn: 'Employee Count',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.STRING,
    required: false,
    allowedValues: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    exportable: true,
    importable: true,
    description: 'Employee count range',
    example: '51-200'
  },

  // TIER 2+ FIELDS
  {
    fieldName: 'longDescription',
    excelColumn: 'Detailed Description',
    accessLevel: FieldAccessLevel.TIER2,
    dataType: FieldDataType.STRING,
    required: false,
    maxLength: 2000,
    exportable: true,
    importable: true,
    description: 'Detailed company description (max 2000 chars)',
    example: 'Founded in 1995, Acme Marine Technologies has been...'
  },
  {
    fieldName: 'certifications',
    excelColumn: 'Certifications',
    accessLevel: FieldAccessLevel.TIER2,
    dataType: FieldDataType.ARRAY_STRING,
    required: false,
    exportable: true,
    importable: true,
    exportTransform: (arr: string[]) => arr?.join(', ') || '',
    importTransform: (str: string) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [],
    description: 'Comma-separated list of certifications',
    example: 'ISO 9001, ABYC, NMEA'
  },

  // TIER 3 FIELDS (mostly admin-controlled)
  {
    fieldName: 'promotionPack',
    excelColumn: 'Promotion Pack',
    accessLevel: FieldAccessLevel.ADMIN,
    dataType: FieldDataType.STRING,
    required: false,
    exportable: true,
    importable: false,  // Admin only via CMS
    description: 'Special promotional content (admin only)'
  }

  // Add all other fields following the same pattern
];

/**
 * Get field mappings for a specific tier
 */
export function getFieldsForTier(tier: VendorTier): FieldMapping[] {
  const tierLevels: Record<VendorTier, FieldAccessLevel[]> = {
    FREE: [FieldAccessLevel.FREE],
    TIER1: [FieldAccessLevel.FREE, FieldAccessLevel.TIER1],
    TIER2: [FieldAccessLevel.FREE, FieldAccessLevel.TIER1, FieldAccessLevel.TIER2],
    TIER3: [FieldAccessLevel.FREE, FieldAccessLevel.TIER1, FieldAccessLevel.TIER2, FieldAccessLevel.TIER3]
  };

  const allowedLevels = tierLevels[tier];
  return VENDOR_FIELD_MAPPINGS.filter(field =>
    allowedLevels.includes(field.accessLevel)
  );
}

/**
 * Get exportable fields for a tier
 */
export function getExportableFieldsForTier(tier: VendorTier): FieldMapping[] {
  return getFieldsForTier(tier).filter(field => field.exportable);
}

/**
 * Get importable fields for a tier
 */
export function getImportableFieldsForTier(tier: VendorTier): FieldMapping[] {
  return getFieldsForTier(tier).filter(field => field.importable);
}

/**
 * Get required fields for a tier
 */
export function getRequiredFieldsForTier(tier: VendorTier): FieldMapping[] {
  return getFieldsForTier(tier).filter(field => field.required);
}

/**
 * Get field mapping by field name
 */
export function getFieldMapping(fieldName: string): FieldMapping | undefined {
  return VENDOR_FIELD_MAPPINGS.find(field => field.fieldName === fieldName);
}

/**
 * Get field mapping by Excel column name
 */
export function getFieldMappingByColumn(columnName: string): FieldMapping | undefined {
  return VENDOR_FIELD_MAPPINGS.find(field => field.excelColumn === columnName);
}
```

### Field List to Include

Based on technical-spec.md, include all these fields:

**Free Tier:**
- name, description, email, phone, logo (note: logo is file upload, handle specially)

**Tier 1+:**
- website, linkedIn, founded, employeeCount

**Tier 2+:**
- longDescription, certifications, locations (note: locations are complex, handle specially), products (relationships, handle specially)

**Tier 3/Admin:**
- promotionPack, editorialContent

**Special Handling:**
- logo: Export as URL, import requires separate file upload flow
- locations: Export as count or JSON, import requires separate API
- products: Export as comma-separated names, import requires product IDs

## Testing Requirements

### Unit Tests

Create `/home/edwin/development/ptnextjs/__tests__/lib/config/excel-field-mappings.test.ts`:

```typescript
import {
  getFieldsForTier,
  getExportableFieldsForTier,
  getImportableFieldsForTier,
  getRequiredFieldsForTier,
  getFieldMapping,
  VENDOR_FIELD_MAPPINGS
} from '@/lib/config/excel-field-mappings';

describe('Excel Field Mappings', () => {
  describe('getFieldsForTier', () => {
    it('should return only FREE fields for FREE tier', () => {
      const fields = getFieldsForTier('FREE');
      expect(fields.every(f => f.accessLevel === 'FREE')).toBe(true);
      expect(fields.some(f => f.fieldName === 'name')).toBe(true);
      expect(fields.some(f => f.fieldName === 'website')).toBe(false);
    });

    it('should return FREE and TIER1 fields for TIER1', () => {
      const fields = getFieldsForTier('TIER1');
      expect(fields.some(f => f.fieldName === 'name')).toBe(true);
      expect(fields.some(f => f.fieldName === 'website')).toBe(true);
      expect(fields.some(f => f.fieldName === 'longDescription')).toBe(false);
    });

    // Add tests for TIER2 and TIER3
  });

  describe('getExportableFieldsForTier', () => {
    it('should return only exportable fields', () => {
      const fields = getExportableFieldsForTier('TIER2');
      expect(fields.every(f => f.exportable === true)).toBe(true);
    });
  });

  describe('getImportableFieldsForTier', () => {
    it('should return only importable fields', () => {
      const fields = getImportableFieldsForTier('TIER2');
      expect(fields.every(f => f.importable === true)).toBe(true);
    });
  });

  describe('getFieldMapping', () => {
    it('should find field by name', () => {
      const field = getFieldMapping('name');
      expect(field).toBeDefined();
      expect(field?.excelColumn).toBe('Company Name');
    });

    it('should return undefined for non-existent field', () => {
      const field = getFieldMapping('nonexistent');
      expect(field).toBeUndefined();
    });
  });
});
```

Run tests: `npm test -- excel-field-mappings.test.ts`

## Evidence Requirements

- [ ] File created at exact path specified
- [ ] All vendor fields mapped according to tier requirements
- [ ] Helper functions implemented and exported
- [ ] Unit tests passing (screenshot of test results)
- [ ] TypeScript compilation successful with no errors
- [ ] Code reviewed for completeness

## Implementation Notes

- Reference Vendor interface in /lib/types.ts for complete field list
- Use tier definitions from TierService
- Consider future extensibility (adding new fields should be easy)
- Keep validation logic simple (complex validation goes in ImportValidationService)
- Use descriptive Excel column names for user-friendliness

## Next Steps

This configuration will be used by:
- BE-3: ExcelTemplateService (uses getExportableFieldsForTier)
- BE-4: ExcelParserService (uses field mappings for parsing)
- BE-5: ExcelExportService (uses getExportableFieldsForTier)
- BE-6: ImportValidationService (uses validation rules)

## Success Metrics

- All vendor fields correctly mapped
- Tier-based filtering works correctly
- Helper functions return expected results
- Unit tests achieve 100% coverage
- Configuration is type-safe and well-documented
