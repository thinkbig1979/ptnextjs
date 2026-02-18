/**
 * Excel Field Mappings Configuration
 *
 * Central configuration for mapping vendor fields to Excel columns with tier-based
 * access control, validation rules, and data transformations.
 *
 * This configuration is used by:
 * - ExcelTemplateService: Template generation
 * - ExcelParserService: Excel parsing
 * - ExcelExportService: Data export
 * - ImportValidationService: Field validation
 *
 * @module lib/config/excel-field-mappings
 */

/**
 * Field access level based on vendor tier
 */
export enum FieldAccessLevel {
  FREE = 'FREE',      // Available to all vendors (tier 0)
  TIER1 = 'TIER1',    // Tier 1 and above
  TIER2 = 'TIER2',    // Tier 2 and above
  TIER3 = 'TIER3',    // Tier 3 and above
  ADMIN = 'ADMIN'     // Admin only (not available for import)
}

/**
 * Field data type for validation and transformation
 */
export enum FieldDataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  EMAIL = 'EMAIL',
  URL = 'URL',
  PHONE = 'PHONE',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  YEAR = 'YEAR',
  ARRAY_STRING = 'ARRAY_STRING',  // Comma-separated values
  JSON = 'JSON'                    // Complex nested data
}

/**
 * Vendor tier type
 */
export type VendorTier = 0 | 1 | 2 | 3 | 4;

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
 * Complete field mapping configuration for vendor data
 *
 * Fields are organized by tier access level for clarity
 */
export const VENDOR_FIELD_MAPPINGS: FieldMapping[] = [
  // ============================================================
  // FREE TIER FIELDS (Available to all vendors)
  // ============================================================
  {
    fieldName: 'companyName',
    excelColumn: 'Company Name',
    accessLevel: FieldAccessLevel.FREE,
    dataType: FieldDataType.STRING,
    required: true,
    maxLength: 255,
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
    example: 'Leading provider of marine navigation systems for superyachts'
  },
  {
    fieldName: 'contactEmail',
    excelColumn: 'Contact Email',
    accessLevel: FieldAccessLevel.FREE,
    dataType: FieldDataType.EMAIL,
    required: true,
    exportable: true,
    importable: true,
    description: 'Primary contact email address',
    example: 'contact@acme-marine.com'
  },
  {
    fieldName: 'contactPhone',
    excelColumn: 'Contact Phone',
    accessLevel: FieldAccessLevel.FREE,
    dataType: FieldDataType.PHONE,
    required: false,
    exportable: true,
    importable: true,
    description: 'Primary contact phone number',
    example: '+1-555-123-4567'
  },
  {
    fieldName: 'logo',
    excelColumn: 'Logo URL',
    accessLevel: FieldAccessLevel.FREE,
    dataType: FieldDataType.URL,
    required: false,
    exportable: true,
    importable: false, // File upload handled separately
    description: 'Company logo URL (file upload via dashboard)',
    example: 'https://example.com/logos/acme.png'
  },

  // ============================================================
  // TIER 1+ FIELDS (Enhanced company information)
  // ============================================================
  {
    fieldName: 'website',
    excelColumn: 'Website URL',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.URL,
    required: false,
    exportable: true,
    importable: true,
    description: 'Company website URL',
    example: 'https://www.acme-marine.com'
  },
  {
    fieldName: 'linkedinUrl',
    excelColumn: 'LinkedIn URL',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.URL,
    required: false,
    exportable: true,
    importable: true,
    description: 'LinkedIn company page URL',
    example: 'https://linkedin.com/company/acme-marine'
  },
  {
    fieldName: 'twitterUrl',
    excelColumn: 'Twitter/X URL',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.URL,
    required: false,
    exportable: true,
    importable: true,
    description: 'Twitter/X profile URL',
    example: 'https://twitter.com/acme_marine'
  },
  {
    fieldName: 'foundedYear',
    excelColumn: 'Founded Year',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.YEAR,
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
    dataType: FieldDataType.NUMBER,
    required: false,
    minValue: 0,
    exportable: true,
    importable: true,
    description: 'Total number of employees',
    example: '125'
  },
  {
    fieldName: 'totalProjects',
    excelColumn: 'Total Projects Completed',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.NUMBER,
    required: false,
    minValue: 0,
    exportable: true,
    importable: true,
    description: 'Total number of projects completed',
    example: '450'
  },
  {
    fieldName: 'videoUrl',
    excelColumn: 'Introduction Video URL',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.URL,
    required: false,
    exportable: true,
    importable: true,
    description: 'Company introduction video URL (YouTube, Vimeo, etc.)',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    fieldName: 'videoTitle',
    excelColumn: 'Video Title',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.STRING,
    required: false,
    maxLength: 100,
    exportable: true,
    importable: true,
    description: 'Title for introduction video',
    example: 'Welcome to Acme Marine Technologies'
  },
  {
    fieldName: 'videoThumbnail',
    excelColumn: 'Video Thumbnail URL',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.URL,
    required: false,
    exportable: true,
    importable: false, // File upload handled separately
    description: 'Video thumbnail image URL (file upload via dashboard)',
    example: 'https://example.com/thumbnails/video-thumb.jpg'
  },
  {
    fieldName: 'yearsInBusiness',
    excelColumn: 'Years in Business',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.NUMBER,
    required: false,
    minValue: 0,
    exportable: true,
    importable: true,
    description: 'Number of years in business',
    example: '25'
  },
  // HQ Location fields (Tier 1 vendors get single HQ location)
  {
    fieldName: 'hqAddress',
    excelColumn: 'HQ Address',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.STRING,
    required: false,
    maxLength: 500,
    exportable: true,
    importable: true,
    description: 'Headquarters full address',
    example: '123 Harbor View Drive, Fort Lauderdale, FL 33316'
  },
  {
    fieldName: 'hqCity',
    excelColumn: 'HQ City',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.STRING,
    required: false,
    maxLength: 255,
    exportable: true,
    importable: true,
    description: 'Headquarters city',
    example: 'Fort Lauderdale'
  },
  {
    fieldName: 'hqCountry',
    excelColumn: 'HQ Country',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.STRING,
    required: false,
    maxLength: 255,
    exportable: true,
    importable: true,
    description: 'Headquarters country',
    example: 'United States'
  },
  // Detailed content (aligned with tierConfig.ts - available from Tier 1)
  {
    fieldName: 'longDescription',
    excelColumn: 'Detailed Description',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.STRING,
    required: false,
    maxLength: 2000,
    exportable: true,
    importable: true,
    description: 'Detailed company description (max 2000 chars)',
    example: 'Founded in 1995, Acme Marine Technologies has been at the forefront of...'
  },
  // Social metrics (aligned with tierConfig.ts - available from Tier 1)
  {
    fieldName: 'linkedinFollowers',
    excelColumn: 'LinkedIn Followers',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.NUMBER,
    required: false,
    minValue: 0,
    exportable: true,
    importable: true,
    description: 'Number of LinkedIn followers',
    example: '15000'
  },
  {
    fieldName: 'instagramFollowers',
    excelColumn: 'Instagram Followers',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.NUMBER,
    required: false,
    minValue: 0,
    exportable: true,
    importable: true,
    description: 'Number of Instagram followers',
    example: '8500'
  },
  // Client metrics (aligned with tierConfig.ts - available from Tier 1)
  {
    fieldName: 'clientSatisfactionScore',
    excelColumn: 'Client Satisfaction Score',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.NUMBER,
    required: false,
    minValue: 0,
    maxValue: 10,
    exportable: true,
    importable: true,
    description: 'Client satisfaction score (0-10)',
    example: '9'
  },
  {
    fieldName: 'repeatClientPercentage',
    excelColumn: 'Repeat Client Percentage',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.NUMBER,
    required: false,
    minValue: 0,
    maxValue: 100,
    exportable: true,
    importable: true,
    description: 'Percentage of repeat clients (0-100)',
    example: '78'
  },
  {
    fieldName: 'videoDescription',
    excelColumn: 'Video Description',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.STRING,
    required: false,
    maxLength: 500,
    exportable: true,
    importable: true,
    description: 'Description for introduction video',
    example: 'Learn about our innovative approach to marine navigation systems'
  },
  // Service areas (aligned with tierConfig.ts - available from Tier 1)
  {
    fieldName: 'serviceAreas',
    excelColumn: 'Service Areas',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.ARRAY_STRING,
    required: false,
    exportable: true,
    importable: true,
    description: 'Comma-separated list of service areas/regions',
    example: 'Mediterranean, Caribbean, Pacific Northwest',
    // Transform CSV string to array of objects for Payload CMS
    // Combined iteration: split, trim, filter empty, and transform in single pass
    importTransform: (value: string) => {
      const result: { area: string }[] = [];
      for (const part of value.split(',')) {
        const trimmed = part.trim();
        if (trimmed.length > 0) {
          result.push({ area: trimmed });
        }
      }
      return result;
    },
    // Export objects back to CSV string (combined iteration)
    exportTransform: (val: unknown) => {
      if (!Array.isArray(val)) return '';
      const parts: string[] = [];
      for (const item of val) {
        const area = (item as { area?: string })?.area;
        if (area) parts.push(area);
      }
      return parts.join(', ');
    }
  },
  // Company values (aligned with tierConfig.ts - available from Tier 1)
  {
    fieldName: 'companyValues',
    excelColumn: 'Company Values',
    accessLevel: FieldAccessLevel.TIER1,
    dataType: FieldDataType.ARRAY_STRING,
    required: false,
    exportable: true,
    importable: true,
    description: 'Comma-separated list of company values/principles',
    example: 'Quality, Innovation, Integrity, Sustainability',
    // Transform CSV string to array of objects for Payload CMS
    // Combined iteration: split, trim, filter empty, and transform in single pass
    importTransform: (value: string) => {
      const result: { value: string }[] = [];
      for (const part of value.split(',')) {
        const trimmed = part.trim();
        if (trimmed.length > 0) {
          result.push({ value: trimmed });
        }
      }
      return result;
    },
    // Export objects back to CSV string (combined iteration)
    exportTransform: (val: unknown) => {
      if (!Array.isArray(val)) return '';
      const parts: string[] = [];
      for (const item of val) {
        const value = (item as { value?: string })?.value;
        if (value) parts.push(value);
      }
      return parts.join(', ');
    }
  },

  // ============================================================
  // TIER 2+ FIELDS (Multiple locations and advanced features)
  // ============================================================

  // ============================================================
  // ADMIN-ONLY FIELDS (Not available for vendor import)
  // ============================================================
  {
    fieldName: 'featured',
    excelColumn: 'Featured Vendor',
    accessLevel: FieldAccessLevel.ADMIN,
    dataType: FieldDataType.BOOLEAN,
    required: false,
    exportable: true,
    importable: false, // Admin only via CMS
    exportTransform: (val) => val ? 'Yes' : 'No',
    description: 'Whether vendor is featured (admin only)'
  },
  {
    fieldName: 'partner',
    excelColumn: 'Strategic Partner',
    accessLevel: FieldAccessLevel.ADMIN,
    dataType: FieldDataType.BOOLEAN,
    required: false,
    exportable: true,
    importable: false, // Admin only via CMS
    exportTransform: (val) => val ? 'Yes' : 'No',
    description: 'Whether vendor is a strategic partner (admin only)'
  },
  {
    fieldName: 'tier',
    excelColumn: 'Subscription Tier',
    accessLevel: FieldAccessLevel.ADMIN,
    dataType: FieldDataType.STRING,
    required: false,
    exportable: true,
    importable: false, // Admin only via CMS
    description: 'Vendor subscription tier (admin only)'
  }

  // NOTE: Complex fields (certifications, awards, caseStudies, teamMembers, etc.)
  // are not included in Excel import/export. These require structured editing
  // via the dashboard interface due to their complexity.
  //
  // NOTE: locations array is handled separately via dedicated location import
  // (see BE-4: ExcelParserService for multi-sheet support)
  //
  // NOTE: products array is handled via relationship resolution
  // (category names -> category IDs during import)
];

/**
 * Convert string tier identifier to numeric VendorTier
 *
 * @param tier - String tier identifier (e.g., 'tier1', 'tier2', 'free')
 * @returns Numeric vendor tier (0-4)
 */
export function convertTierToNumeric(tier: string | undefined): VendorTier {
  switch (tier) {
    case 'tier1':
      return 1;
    case 'tier2':
      return 2;
    case 'tier3':
      return 3;
    case 'tier4':
      return 4;
    case 'free':
    default:
      return 0;
  }
}

/**
 * Get field mappings accessible to a specific vendor tier
 *
 * @param tier - Vendor tier (0-4, where 0 = free, 1-4 = paid tiers)
 * @returns Array of field mappings accessible to the tier
 */
export function getFieldsForTier(tier: VendorTier): FieldMapping[] {
  const tierLevels: Record<VendorTier, FieldAccessLevel[]> = {
    0: [FieldAccessLevel.FREE],
    1: [FieldAccessLevel.FREE, FieldAccessLevel.TIER1],
    2: [FieldAccessLevel.FREE, FieldAccessLevel.TIER1, FieldAccessLevel.TIER2],
    3: [FieldAccessLevel.FREE, FieldAccessLevel.TIER1, FieldAccessLevel.TIER2, FieldAccessLevel.TIER3],
    4: [FieldAccessLevel.FREE, FieldAccessLevel.TIER1, FieldAccessLevel.TIER2, FieldAccessLevel.TIER3]
  };

  const allowedLevels = tierLevels[tier];
  return VENDOR_FIELD_MAPPINGS.filter(field =>
    allowedLevels.includes(field.accessLevel)
  );
}

/**
 * Get exportable fields for a vendor tier
 *
 * @param tier - Vendor tier
 * @returns Array of fields that can be exported for the tier
 */
export function getExportableFieldsForTier(tier: VendorTier): FieldMapping[] {
  return getFieldsForTier(tier).filter(field => field.exportable);
}

/**
 * Get importable fields for a vendor tier
 *
 * @param tier - Vendor tier
 * @returns Array of fields that can be imported for the tier
 */
export function getImportableFieldsForTier(tier: VendorTier): FieldMapping[] {
  return getFieldsForTier(tier).filter(field => field.importable);
}

/**
 * Get required fields for a vendor tier
 *
 * @param tier - Vendor tier
 * @returns Array of required fields for the tier
 */
export function getRequiredFieldsForTier(tier: VendorTier): FieldMapping[] {
  return getFieldsForTier(tier).filter(field => field.required);
}

/**
 * Get field mapping by vendor object field name
 *
 * @param fieldName - Vendor object property name
 * @returns Field mapping or undefined if not found
 */
export function getFieldMapping(fieldName: string): FieldMapping | undefined {
  return VENDOR_FIELD_MAPPINGS.find(field => field.fieldName === fieldName);
}

/**
 * Get field mapping by Excel column name
 *
 * @param columnName - Excel column header
 * @returns Field mapping or undefined if not found
 */
export function getFieldMappingByColumn(columnName: string): FieldMapping | undefined {
  return VENDOR_FIELD_MAPPINGS.find(field => field.excelColumn === columnName);
}

/**
 * Check if a vendor tier has access to a specific field
 *
 * @param tier - Vendor tier
 * @param fieldName - Vendor object property name
 * @returns True if tier has access, false otherwise
 */
export function hasFieldAccess(tier: VendorTier, fieldName: string): boolean {
  const field = getFieldMapping(fieldName);
  if (!field) return false;

  const accessibleFields = getFieldsForTier(tier);
  return accessibleFields.some(f => f.fieldName === fieldName);
}

/**
 * Get all fields that require higher tier than current
 * (useful for showing upgrade prompts)
 *
 * @param tier - Current vendor tier
 * @returns Array of fields requiring higher tier
 */
export function getLockedFieldsForTier(tier: VendorTier): FieldMapping[] {
  const accessibleFields = getFieldsForTier(tier);
  const accessibleFieldNames = new Set(accessibleFields.map(f => f.fieldName));

  return VENDOR_FIELD_MAPPINGS.filter(field =>
    !accessibleFieldNames.has(field.fieldName) &&
    field.accessLevel !== FieldAccessLevel.ADMIN // Exclude admin-only fields
  );
}

/**
 * Get count of fields by access level
 *
 * @returns Object with counts per tier level
 */
export function getFieldCounts(): Record<FieldAccessLevel, number> {
  return VENDOR_FIELD_MAPPINGS.reduce((counts, field) => {
    counts[field.accessLevel] = (counts[field.accessLevel] || 0) + 1;
    return counts;
  }, {} as Record<FieldAccessLevel, number>);
}
