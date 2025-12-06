/**
 * Unit tests for Excel Field Mappings Configuration
 */

import {
  FieldAccessLevel,
  FieldDataType,
  VENDOR_FIELD_MAPPINGS,
  getFieldsForTier,
  getExportableFieldsForTier,
  getImportableFieldsForTier,
  getRequiredFieldsForTier,
  getFieldMapping,
  getFieldMappingByColumn,
  hasFieldAccess,
  getLockedFieldsForTier,
  getFieldCounts,
  type VendorTier
} from '@/lib/config/excel-field-mappings';

describe('Excel Field Mappings Configuration', () => {
  describe('VENDOR_FIELD_MAPPINGS constant', () => {
    it('should be an array', () => {
      expect(Array.isArray(VENDOR_FIELD_MAPPINGS)).toBe(true);
    });

    it('should contain at least one field mapping', () => {
      expect(VENDOR_FIELD_MAPPINGS.length).toBeGreaterThan(0);
    });

    it('should have all required properties on each mapping', () => {
      VENDOR_FIELD_MAPPINGS.forEach(mapping => {
        expect(mapping).toHaveProperty('fieldName');
        expect(mapping).toHaveProperty('excelColumn');
        expect(mapping).toHaveProperty('accessLevel');
        expect(mapping).toHaveProperty('dataType');
        expect(mapping).toHaveProperty('required');
        expect(mapping).toHaveProperty('exportable');
        expect(mapping).toHaveProperty('importable');
      });
    });

    it('should have unique field names', () => {
      const fieldNames = VENDOR_FIELD_MAPPINGS.map(f => f.fieldName);
      const uniqueFieldNames = new Set(fieldNames);
      expect(fieldNames.length).toBe(uniqueFieldNames.size);
    });

    it('should have unique Excel column names', () => {
      const columns = VENDOR_FIELD_MAPPINGS.map(f => f.excelColumn);
      const uniqueColumns = new Set(columns);
      expect(columns.length).toBe(uniqueColumns.size);
    });

    it('should include required core fields', () => {
      const fieldNames = VENDOR_FIELD_MAPPINGS.map(f => f.fieldName);
      expect(fieldNames).toContain('companyName');
      expect(fieldNames).toContain('description');
      expect(fieldNames).toContain('contactEmail');
    });
  });

  describe('getFieldsForTier', () => {
    it('should return only FREE fields for tier 0', () => {
      const fields = getFieldsForTier(0);
      expect(fields.every(f => f.accessLevel === FieldAccessLevel.FREE)).toBe(true);
      expect(fields.length).toBeGreaterThan(0);
    });

    it('should return FREE and TIER1 fields for tier 1', () => {
      const fields = getFieldsForTier(1);
      const accessLevels = new Set(fields.map(f => f.accessLevel));
      expect(accessLevels.has(FieldAccessLevel.FREE)).toBe(true);
      expect(accessLevels.has(FieldAccessLevel.TIER1)).toBe(true);
      expect(accessLevels.has(FieldAccessLevel.TIER2)).toBe(false);
      expect(accessLevels.has(FieldAccessLevel.TIER3)).toBe(false);
      expect(accessLevels.has(FieldAccessLevel.ADMIN)).toBe(false);
    });

    it('should return FREE and TIER1 fields for tier 2', () => {
      // Note: No TIER2-specific fields exist in the implementation
      const fields = getFieldsForTier(2);
      const accessLevels = new Set(fields.map(f => f.accessLevel));
      expect(accessLevels.has(FieldAccessLevel.FREE)).toBe(true);
      expect(accessLevels.has(FieldAccessLevel.TIER1)).toBe(true);
      // TIER2 and TIER3 access levels are defined but not used for any fields
      expect(accessLevels.has(FieldAccessLevel.TIER2)).toBe(false);
      expect(accessLevels.has(FieldAccessLevel.TIER3)).toBe(false);
      expect(accessLevels.has(FieldAccessLevel.ADMIN)).toBe(false);
    });

    it('should return all non-admin fields for tier 3', () => {
      const fields = getFieldsForTier(3);
      const accessLevels = new Set(fields.map(f => f.accessLevel));
      expect(accessLevels.has(FieldAccessLevel.FREE)).toBe(true);
      expect(accessLevels.has(FieldAccessLevel.TIER1)).toBe(true);
      // Note: TIER2 and TIER3 access levels are defined but not used in field mappings
      // All tier-gated fields use TIER1, with TIER2/TIER3 features handled via dashboard
      expect(accessLevels.has(FieldAccessLevel.TIER2)).toBe(false);
      expect(accessLevels.has(FieldAccessLevel.TIER3)).toBe(false);
      expect(accessLevels.has(FieldAccessLevel.ADMIN)).toBe(false);
    });

    it('should return more fields for higher tiers', () => {
      const tier0Fields = getFieldsForTier(0);
      const tier1Fields = getFieldsForTier(1);
      const tier2Fields = getFieldsForTier(2);

      expect(tier1Fields.length).toBeGreaterThan(tier0Fields.length);
      // Tier 2 has same fields as Tier 1 (no TIER2-specific fields exist in implementation)
      expect(tier2Fields.length).toBeGreaterThanOrEqual(tier1Fields.length);
    });

    it('should include required fields at all tiers', () => {
      const tiers: VendorTier[] = [0, 1, 2, 3];

      tiers.forEach(tier => {
        const fields = getFieldsForTier(tier);
        const fieldNames = fields.map(f => f.fieldName);

        // Core required fields should be available at all tiers
        expect(fieldNames).toContain('companyName');
        expect(fieldNames).toContain('description');
        expect(fieldNames).toContain('contactEmail');
      });
    });
  });

  describe('getExportableFieldsForTier', () => {
    it('should return only exportable fields', () => {
      const tiers: VendorTier[] = [0, 1, 2, 3];

      tiers.forEach(tier => {
        const fields = getExportableFieldsForTier(tier);
        expect(fields.every(f => f.exportable === true)).toBe(true);
      });
    });

    it('should be subset of all tier fields', () => {
      const tiers: VendorTier[] = [0, 1, 2, 3];

      tiers.forEach(tier => {
        const allFields = getFieldsForTier(tier);
        const exportableFields = getExportableFieldsForTier(tier);
        expect(exportableFields.length).toBeLessThanOrEqual(allFields.length);
      });
    });
  });

  describe('getImportableFieldsForTier', () => {
    it('should return only importable fields', () => {
      const tiers: VendorTier[] = [0, 1, 2, 3];

      tiers.forEach(tier => {
        const fields = getImportableFieldsForTier(tier);
        expect(fields.every(f => f.importable === true)).toBe(true);
      });
    });

    it('should exclude admin-only fields', () => {
      const tier3Fields = getImportableFieldsForTier(3);
      expect(tier3Fields.every(f => f.accessLevel !== FieldAccessLevel.ADMIN)).toBe(true);
    });

    it('should be subset of all tier fields', () => {
      const tiers: VendorTier[] = [0, 1, 2, 3];

      tiers.forEach(tier => {
        const allFields = getFieldsForTier(tier);
        const importableFields = getImportableFieldsForTier(tier);
        expect(importableFields.length).toBeLessThanOrEqual(allFields.length);
      });
    });
  });

  describe('getRequiredFieldsForTier', () => {
    it('should return only required fields', () => {
      const tiers: VendorTier[] = [0, 1, 2, 3];

      tiers.forEach(tier => {
        const fields = getRequiredFieldsForTier(tier);
        expect(fields.every(f => f.required === true)).toBe(true);
      });
    });

    it('should include at least name, description, and contactEmail', () => {
      const requiredFields = getRequiredFieldsForTier(0);
      const fieldNames = requiredFields.map(f => f.fieldName);

      expect(fieldNames).toContain('companyName');
      expect(fieldNames).toContain('description');
      expect(fieldNames).toContain('contactEmail');
    });
  });

  describe('getFieldMapping', () => {
    it('should find field by name', () => {
      const field = getFieldMapping('companyName');
      expect(field).toBeDefined();
      expect(field?.fieldName).toBe('companyName');
      expect(field?.excelColumn).toBe('Company Name');
    });

    it('should return undefined for non-existent field', () => {
      const field = getFieldMapping('nonExistentField');
      expect(field).toBeUndefined();
    });

    it('should find all core fields', () => {
      const coreFields = ['companyName', 'description', 'contactEmail', 'contactPhone', 'website'];

      coreFields.forEach(fieldName => {
        const field = getFieldMapping(fieldName);
        expect(field).toBeDefined();
      });
    });
  });

  describe('getFieldMappingByColumn', () => {
    it('should find field by Excel column name', () => {
      const field = getFieldMappingByColumn('Company Name');
      expect(field).toBeDefined();
      expect(field?.fieldName).toBe('companyName');
    });

    it('should return undefined for non-existent column', () => {
      const field = getFieldMappingByColumn('Non-Existent Column');
      expect(field).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      const field = getFieldMappingByColumn('company name'); // lowercase
      expect(field).toBeUndefined();
    });
  });

  describe('hasFieldAccess', () => {
    it('should return true for accessible fields', () => {
      expect(hasFieldAccess(0, 'companyName')).toBe(true);
      expect(hasFieldAccess(1, 'website')).toBe(true);
      // Note: longDescription is TIER1, not TIER2 in implementation
      expect(hasFieldAccess(1, 'longDescription')).toBe(true);
    });

    it('should return false for inaccessible fields', () => {
      expect(hasFieldAccess(0, 'website')).toBe(false); // Tier 1 field
      // Note: longDescription is TIER1, so tier 0 cannot access it
      expect(hasFieldAccess(0, 'longDescription')).toBe(false);
    });

    it('should return false for non-existent fields', () => {
      expect(hasFieldAccess(3, 'nonExistentField')).toBe(false);
    });

    it('should enforce tier hierarchy', () => {
      // Higher tiers should have access to lower tier fields
      expect(hasFieldAccess(1, 'companyName')).toBe(true); // Tier 1 has access to FREE field
      expect(hasFieldAccess(2, 'website')).toBe(true); // Tier 2 has access to TIER1 field
      // Note: longDescription is TIER1, so any tier 1+ can access it
      expect(hasFieldAccess(1, 'longDescription')).toBe(true);
    });
  });

  describe('getLockedFieldsForTier', () => {
    it('should return fields requiring higher tier', () => {
      const lockedFields = getLockedFieldsForTier(0);
      expect(lockedFields.length).toBeGreaterThan(0);
      // Note: Only TIER1 fields exist in implementation (no TIER2/TIER3 fields)
      expect(lockedFields.every(f =>
        f.accessLevel === FieldAccessLevel.TIER1
      )).toBe(true);
    });

    it('should not include admin-only fields', () => {
      const lockedFields = getLockedFieldsForTier(0);
      expect(lockedFields.every(f => f.accessLevel !== FieldAccessLevel.ADMIN)).toBe(true);
    });

    it('should return fewer locked fields for higher tiers', () => {
      const tier0Locked = getLockedFieldsForTier(0);
      const tier1Locked = getLockedFieldsForTier(1);

      // Tier 1+ unlocks all TIER1 fields, so tier 1 has no locked fields
      expect(tier1Locked.length).toBeLessThan(tier0Locked.length);
      // Note: Since no TIER2/TIER3 fields exist, tier 1+ all have 0 locked fields
      expect(tier1Locked.length).toBe(0);
    });

    it('should return empty array for tier 1 and above', () => {
      // Note: All upgradable fields are TIER1, so any tier 1+ vendor has no locked fields
      const tier1Locked = getLockedFieldsForTier(1);
      const tier2Locked = getLockedFieldsForTier(2);
      const tier3Locked = getLockedFieldsForTier(3);
      expect(tier1Locked.length).toBe(0);
      expect(tier2Locked.length).toBe(0);
      expect(tier3Locked.length).toBe(0);
    });
  });

  describe('getFieldCounts', () => {
    it('should return counts for each access level', () => {
      const counts = getFieldCounts();

      expect(counts).toHaveProperty(FieldAccessLevel.FREE);
      expect(counts).toHaveProperty(FieldAccessLevel.TIER1);
      // Note: TIER2 is defined but no fields use it, so it won't be in counts
      expect(counts).toHaveProperty(FieldAccessLevel.ADMIN);
    });

    it('should have positive counts for core tiers', () => {
      const counts = getFieldCounts();

      expect(counts[FieldAccessLevel.FREE]).toBeGreaterThan(0);
      expect(counts[FieldAccessLevel.TIER1]).toBeGreaterThan(0);
      expect(counts[FieldAccessLevel.ADMIN]).toBeGreaterThan(0);
    });

    it('should sum to total field count', () => {
      const counts = getFieldCounts();
      const sum = Object.values(counts).reduce((a, b) => a + b, 0);

      expect(sum).toBe(VENDOR_FIELD_MAPPINGS.length);
    });
  });

  describe('Field data types', () => {
    it('should have valid data types', () => {
      const validTypes = Object.values(FieldDataType);

      VENDOR_FIELD_MAPPINGS.forEach(field => {
        expect(validTypes).toContain(field.dataType);
      });
    });

    it('should have string type for companyName field', () => {
      const companyNameField = getFieldMapping('companyName');
      expect(companyNameField?.dataType).toBe(FieldDataType.STRING);
    });

    it('should have email type for contactEmail field', () => {
      const emailField = getFieldMapping('contactEmail');
      expect(emailField?.dataType).toBe(FieldDataType.EMAIL);
    });

    it('should have URL type for website field', () => {
      const websiteField = getFieldMapping('website');
      expect(websiteField?.dataType).toBe(FieldDataType.URL);
    });
  });

  describe('Field validation constraints', () => {
    it('should have maxLength for string fields where applicable', () => {
      const companyNameField = getFieldMapping('companyName');
      expect(companyNameField?.maxLength).toBeDefined();
      expect(companyNameField?.maxLength).toBeGreaterThan(0);
    });

    it('should have minValue/maxValue for year fields', () => {
      const foundedYearField = getFieldMapping('foundedYear');
      expect(foundedYearField?.minValue).toBeDefined();
      expect(foundedYearField?.maxValue).toBeDefined();
      expect(foundedYearField?.minValue).toBeLessThan(foundedYearField?.maxValue!);
    });

    it('should mark critical fields as required', () => {
      const requiredFieldNames = ['companyName', 'description', 'contactEmail'];

      requiredFieldNames.forEach(fieldName => {
        const field = getFieldMapping(fieldName);
        expect(field?.required).toBe(true);
      });
    });
  });

  describe('Field export/import capabilities', () => {
    it('should have logo as exportable but not importable', () => {
      const logoField = getFieldMapping('logo');
      expect(logoField?.exportable).toBe(true);
      expect(logoField?.importable).toBe(false);
    });

    it('should have admin fields as not importable', () => {
      const adminFields = VENDOR_FIELD_MAPPINGS.filter(
        f => f.accessLevel === FieldAccessLevel.ADMIN
      );

      adminFields.forEach(field => {
        expect(field.importable).toBe(false);
      });
    });

    it('should have most free tier fields as both exportable and importable', () => {
      const freeFields = VENDOR_FIELD_MAPPINGS.filter(
        f => f.accessLevel === FieldAccessLevel.FREE && f.fieldName !== 'logo'
      );

      const bothExportableAndImportable = freeFields.filter(
        f => f.exportable && f.importable
      );

      expect(bothExportableAndImportable.length).toBeGreaterThan(0);
    });
  });

  describe('Field descriptions and examples', () => {
    it('should have descriptions for all fields', () => {
      VENDOR_FIELD_MAPPINGS.forEach(field => {
        expect(field.description).toBeDefined();
        expect(field.description).not.toBe('');
      });
    });

    it('should have examples for most fields', () => {
      const fieldsWithExamples = VENDOR_FIELD_MAPPINGS.filter(f => f.example);
      const fieldsWithoutExamples = VENDOR_FIELD_MAPPINGS.filter(f => !f.example);

      // Most fields should have examples (at least 80%)
      expect(fieldsWithExamples.length).toBeGreaterThan(VENDOR_FIELD_MAPPINGS.length * 0.8);
    });
  });
});
