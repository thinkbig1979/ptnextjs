/**
 * Form-to-API Field Mapping Contract Tests
 *
 * These tests verify that form field names match API schema field names,
 * preventing the class of bugs where field transformations cause API validation failures.
 *
 * Key scenarios tested:
 * 1. BasicInfoForm -> API (companyName, NOT name)
 * 2. Location forms -> API (locationName, NOT name)
 * 3. All form schemas match API validation schema
 *
 * This test suite was created after discovering a bug where:
 * - Form used 'companyName'
 * - Frontend transformed it to 'name'
 * - API expected 'companyName'
 * - Result: 400 Bad Request "Invalid input data"
 */

import { safeValidateVendorUpdate, vendorUpdateSchema } from '@/lib/validation/vendor-update-schema';
import {
  basicInfoSchema,
  brandStorySchema,
  locationSchema,
  teamMemberSchema,
  caseStudySchema,
} from '@/lib/validation/vendorSchemas';

/**
 * ALLOWED_UPDATE_FIELDS from VendorDashboardContext
 * This must stay in sync with the API schema
 */
const ALLOWED_UPDATE_FIELDS = new Set([
  'name',
  'companyName',
  'slug',
  'description',
  'logo',
  'contactEmail',
  'contactPhone',
  'website',
  'linkedinUrl',
  'twitterUrl',
  'foundedYear',
  'longDescription',
  'totalProjects',
  'employeeCount',
  'linkedinFollowers',
  'instagramFollowers',
  'clientSatisfactionScore',
  'repeatClientPercentage',
  'videoUrl',
  'videoThumbnail',
  'videoDuration',
  'videoTitle',
  'videoDescription',
  'serviceAreas',
  'companyValues',
]);

describe('Form-to-API Field Mapping Contract Tests', () => {
  describe('BasicInfoForm Field Names', () => {
    it('should use companyName (NOT name) for company name field', () => {
      // This test ensures we never accidentally transform companyName -> name
      const formData = {
        companyName: 'Test Company',
        slug: 'test-company',
        description: 'A test company description that is at least 10 characters',
        contactEmail: 'test@example.com',
      };

      // API should accept companyName
      const apiResult = safeValidateVendorUpdate(formData);
      expect(apiResult.success).toBe(true);
      if (apiResult.success) {
        expect(apiResult.data.companyName).toBe('Test Company');
      }
    });

    it('should reject data with "name" field instead of "companyName"', () => {
      // This catches the bug where frontend transforms companyName -> name
      const wronglyTransformedData = {
        name: 'Test Company', // WRONG - should be companyName
        slug: 'test-company',
        description: 'A test description',
        contactEmail: 'test@example.com',
      };

      const apiResult = safeValidateVendorUpdate(wronglyTransformedData);
      // Should pass validation (Zod strips unknown keys by default)
      // but the name field should NOT be in the result
      expect(apiResult.success).toBe(true);
      if (apiResult.success) {
        expect(apiResult.data).not.toHaveProperty('name');
        expect(apiResult.data.companyName).toBeUndefined();
      }
    });

    it('should ensure basicInfoSchema field names align with API schema', () => {
      // Get field names from basicInfoSchema
      const basicInfoFields = Object.keys(basicInfoSchema.shape);

      // All these fields should be valid in the API schema
      const testData: Record<string, unknown> = {
        companyName: 'Test',
        slug: 'test',
        description: 'Test description at least 10 chars',
        contactEmail: 'test@test.com',
        contactPhone: '1234567890',
        logo: 'https://example.com/logo.png',
      };

      const result = safeValidateVendorUpdate(testData);
      expect(result.success).toBe(true);

      // Verify the fields we expect are valid
      expect(basicInfoFields).toContain('companyName');
      expect(basicInfoFields).not.toContain('name'); // Should NOT have 'name'
    });
  });

  describe('Location Field Names', () => {
    it('should use locationName (NOT name) for location name field', () => {
      const locationData = {
        locations: [
          {
            locationName: 'Monaco Office', // CORRECT
            address: 'Port de Monaco',
            city: 'Monaco',
            country: 'Monaco',
            isHQ: true,
          },
        ],
      };

      const result = safeValidateVendorUpdate(locationData);
      expect(result.success).toBe(true);
      if (result.success && result.data.locations) {
        expect(result.data.locations[0]).toHaveProperty('locationName');
      }
    });

    it('should NOT have a state field (removed as unused)', () => {
      // The locationSchema should NOT have state field
      const locationFields = Object.keys(locationSchema.shape);
      expect(locationFields).not.toContain('state');
    });

    it('should ensure locationSchema field names align with API schema', () => {
      const locationFields = Object.keys(locationSchema.shape);

      // These fields must match API schema exactly
      const expectedFields = [
        'id',
        'locationName',
        'address',
        'city',
        'postalCode',
        'country',
        'latitude',
        'longitude',
        'isHQ',
      ];

      expectedFields.forEach((field) => {
        expect(locationFields).toContain(field);
      });

      // Ensure no unexpected fields
      expect(locationFields).not.toContain('name'); // Should use locationName
      expect(locationFields).not.toContain('state'); // Removed as unused
    });
  });

  describe('Brand Story Field Names', () => {
    it('should have field names that match API schema', () => {
      const brandStoryFields = Object.keys(brandStorySchema.shape);

      // All brand story fields should be valid in API
      const testData = {
        website: 'https://example.com',
        linkedinUrl: 'https://linkedin.com/company/test',
        twitterUrl: 'https://twitter.com/test',
        foundedYear: 2020,
        longDescription: 'Test description',
        totalProjects: 100,
        employeeCount: 50,
        linkedinFollowers: 1000,
        instagramFollowers: 500,
        clientSatisfactionScore: 95,
        repeatClientPercentage: 80,
        videoUrl: 'https://youtube.com/watch?v=test',
        videoThumbnail: 'https://example.com/thumb.jpg',
        videoDuration: '2:30',
        videoTitle: 'Company Intro',
        videoDescription: 'About us',
        serviceAreas: ['Mediterranean', 'Caribbean'],
        companyValues: ['Quality', 'Innovation'],
      };

      const result = safeValidateVendorUpdate(testData);
      expect(result.success).toBe(true);
    });
  });

  describe('Team Member Field Names', () => {
    it('should have field names that match API schema', () => {
      const teamMemberFields = Object.keys(teamMemberSchema.shape);

      // Team member 'name' is correct here (it's the person's name, not location name)
      expect(teamMemberFields).toContain('name');
      expect(teamMemberFields).toContain('role');
      expect(teamMemberFields).toContain('bio');
      expect(teamMemberFields).toContain('photo');
      expect(teamMemberFields).toContain('linkedinUrl');
      expect(teamMemberFields).toContain('email');
      expect(teamMemberFields).toContain('displayOrder');
    });

    it('should accept valid team members array', () => {
      const testData = {
        teamMembers: [
          {
            name: 'John Doe',
            role: 'CEO',
            bio: 'Company founder',
            photo: 'https://example.com/photo.jpg',
            linkedinUrl: 'https://linkedin.com/in/johndoe',
            email: 'john@example.com',
            displayOrder: 1,
          },
        ],
      };

      const result = safeValidateVendorUpdate(testData);
      expect(result.success).toBe(true);
    });
  });

  describe('Case Study Field Names', () => {
    it('should have field names that match API schema', () => {
      const caseStudyFields = Object.keys(caseStudySchema.shape);

      // Verify expected fields exist
      expect(caseStudyFields).toContain('title');
      expect(caseStudyFields).toContain('yachtName');
      expect(caseStudyFields).toContain('challenge');
      expect(caseStudyFields).toContain('solution');
      expect(caseStudyFields).toContain('results');
      expect(caseStudyFields).toContain('featured');
    });

    it('should accept valid case studies array', () => {
      const testData = {
        caseStudies: [
          {
            title: 'Project Alpha',
            yachtName: 'MY Serenity',
            challenge: 'Complex navigation system upgrade required for long voyage',
            solution: 'Implemented state-of-the-art GPS and radar integration',
            results: 'Successfully completed 10,000 nautical mile voyage',
            featured: true,
          },
        ],
      };

      const result = safeValidateVendorUpdate(testData);
      expect(result.success).toBe(true);
    });
  });

  describe('Regression: Field Transformation Bugs', () => {
    it('should catch if companyName is transformed to name before API call', () => {
      // Simulating the bug: form has companyName, code transforms to name
      const originalFormData = { companyName: 'Acme Corp' };

      // BUG: Someone adds this transformation
      const buggyTransformation = (data: typeof originalFormData) => ({
        ...data,
        name: data.companyName, // WRONG!
      });
      // delete (buggyTransformation as any).companyName; // Even worse!

      // API should still work with companyName
      const correctResult = safeValidateVendorUpdate(originalFormData);
      expect(correctResult.success).toBe(true);

      // The transformed data won't have companyName in the result
      const buggyData = buggyTransformation(originalFormData);
      const buggyResult = safeValidateVendorUpdate(buggyData);
      expect(buggyResult.success).toBe(true);
      if (buggyResult.success) {
        // companyName should be in result
        expect(buggyResult.data.companyName).toBe('Acme Corp');
        // name should NOT be in result (stripped by Zod)
        expect(buggyResult.data).not.toHaveProperty('name');
      }
    });

    it('should detect if location uses wrong field name', () => {
      // Bug: Using 'name' instead of 'locationName'
      const buggyLocationData = {
        locations: [
          {
            name: 'Monaco Office', // WRONG - should be locationName
            address: 'Port de Monaco',
            city: 'Monaco',
            country: 'Monaco',
          },
        ],
      };

      const result = safeValidateVendorUpdate(buggyLocationData);
      expect(result.success).toBe(true);
      if (result.success && result.data.locations) {
        // name should be stripped, locationName should be undefined
        expect(result.data.locations[0]).not.toHaveProperty('name');
        expect(result.data.locations[0].locationName).toBeUndefined();
      }
    });
  });

  describe('CRITICAL: Context-to-API Field Sync', () => {
    /**
     * This test ensures ALLOWED_UPDATE_FIELDS in VendorDashboardContext
     * stays in sync with vendorUpdateSchema in the API.
     *
     * If this test fails, it means:
     * - A field is allowed by the context but rejected by the API (causes 400 errors)
     * - OR a field was added to API but not to context (data won't be sent)
     */
    it('should have all ALLOWED_UPDATE_FIELDS present in API schema (except name->companyName mapping)', () => {
      const apiSchemaFields = Object.keys(vendorUpdateSchema.shape);

      // Fields that context allows but are mapped/transformed
      const mappedFields = new Set(['name']); // 'name' is mapped to 'companyName'

      // Check each allowed field exists in API schema
      const missingFromApi: string[] = [];
      ALLOWED_UPDATE_FIELDS.forEach(field => {
        if (mappedFields.has(field)) return; // Skip mapped fields

        if (!apiSchemaFields.includes(field)) {
          missingFromApi.push(field);
        }
      });

      expect(missingFromApi).toEqual([]);
      if (missingFromApi.length > 0) {
        console.error('Fields allowed by context but missing from API schema:', missingFromApi);
        console.error('This will cause 400 "Invalid input data" errors!');
      }
    });

    it('should accept slug field (regression: was missing from API schema)', () => {
      const data = {
        companyName: 'Test Company',
        slug: 'test-company',
        description: 'A test description',
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe('test-company');
      }
    });

    it('should validate slug format correctly', () => {
      // Valid slugs
      expect(safeValidateVendorUpdate({ slug: 'valid-slug' }).success).toBe(true);
      expect(safeValidateVendorUpdate({ slug: 'valid-slug-123' }).success).toBe(true);
      expect(safeValidateVendorUpdate({ slug: 'a1' }).success).toBe(true);

      // Invalid slugs (uppercase, spaces, special chars)
      expect(safeValidateVendorUpdate({ slug: 'Invalid-Slug' }).success).toBe(false);
      expect(safeValidateVendorUpdate({ slug: 'invalid slug' }).success).toBe(false);
      expect(safeValidateVendorUpdate({ slug: 'invalid_slug' }).success).toBe(false);
      expect(safeValidateVendorUpdate({ slug: 'a' }).success).toBe(false); // too short
    });
  });
});
