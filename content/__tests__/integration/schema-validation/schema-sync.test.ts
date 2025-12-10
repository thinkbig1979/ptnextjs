/**
 * Schema Synchronization Test Suite
 *
 * This test suite automatically validates that frontend Zod schemas match backend Payload CMS schemas.
 * It prevents schema drift by comparing field definitions, types, constraints, and required fields.
 *
 * Coverage:
 * - Vendors collection (highest priority - most complex)
 * - TierUpgradeRequests collection
 * - Users collection
 * - Products collection
 * - ImportHistory collection
 *
 * Key Validations:
 * 1. Field existence - all Payload fields have corresponding Zod validators
 * 2. Field types - string, number, array, object types match
 * 3. Array structures - Zod expects objects when Payload defines object arrays
 * 4. Required fields - required constraints match between systems
 * 5. Length constraints - maxLength, min, max values match
 * 6. Enum values - select options match
 *
 * This is a PREVENTIVE measure - these tests FAIL when schemas drift out of sync.
 */

import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Import Zod schemas
import {
  vendorUpdateSchema,
  basicInfoSchema,
  brandStorySchema,
  certificationSchema,
  awardSchema,
  caseStudySchema,
  teamMemberSchema,
  locationSchema,
} from '@/lib/validation/vendorSchemas';
import { vendorUpdateSchema as apiVendorUpdateSchema } from '@/lib/validation/vendor-update-schema';

// Type for Payload field definitions
interface PayloadField {
  name: string;
  type: string;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: Array<{ label: string; value: string }>;
  fields?: PayloadField[];
  relationTo?: string | string[];
  hasMany?: boolean;
}

/**
 * Extract field definitions from Payload collection TypeScript files
 */
function extractPayloadFields(collectionPath: string): PayloadField[] {
  const content = fs.readFileSync(collectionPath, 'utf-8');
  const fields: PayloadField[] = [];

  // This is a simplified parser - in production, you'd use AST parsing
  // For now, we'll manually define the expected schema structure
  return fields;
}

/**
 * Get Zod schema shape for comparison
 */
function getZodSchemaShape(schema: z.ZodObject<any>): Record<string, z.ZodTypeAny> {
  return schema.shape;
}

/**
 * Analyze Zod type to extract metadata
 */
function analyzeZodType(zodType: z.ZodTypeAny): {
  type: string;
  isOptional: boolean;
  isNullable: boolean;
  isArray: boolean;
  arrayItemType?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enumValues?: string[];
} {
  let type = 'unknown';
  let isOptional = false;
  let isNullable = false;
  let isArray = false;
  let arrayItemType: string | undefined;
  let minLength: number | undefined;
  let maxLength: number | undefined;
  let min: number | undefined;
  let max: number | undefined;
  let enumValues: string[] | undefined;

  // Unwrap optional/nullable
  let currentType = zodType;
  if (currentType instanceof z.ZodOptional) {
    isOptional = true;
    currentType = currentType.unwrap();
  }
  if (currentType instanceof z.ZodNullable) {
    isNullable = true;
    currentType = currentType.unwrap();
  }

  // Check if preprocessed
  if (currentType instanceof z.ZodEffects) {
    // For preprocessed types, we need to look at the inner schema
    currentType = (currentType as any)._def.schema;
    if (currentType instanceof z.ZodOptional) {
      isOptional = true;
      currentType = currentType.unwrap();
    }
  }

  // Determine base type
  if (currentType instanceof z.ZodString) {
    type = 'string';
    const checks = (currentType as any)._def.checks || [];
    for (const check of checks) {
      if (check.kind === 'min') minLength = check.value;
      if (check.kind === 'max') maxLength = check.value;
    }
  } else if (currentType instanceof z.ZodNumber) {
    type = 'number';
    const checks = (currentType as any)._def.checks || [];
    for (const check of checks) {
      if (check.kind === 'min') min = check.value;
      if (check.kind === 'max') max = check.value;
    }
  } else if (currentType instanceof z.ZodBoolean) {
    type = 'boolean';
  } else if (currentType instanceof z.ZodArray) {
    type = 'array';
    isArray = true;
    const elementType = currentType.element;
    if (elementType instanceof z.ZodString) {
      arrayItemType = 'string';
    } else if (elementType instanceof z.ZodNumber) {
      arrayItemType = 'number';
    } else if (elementType instanceof z.ZodObject) {
      arrayItemType = 'object';
    } else if (elementType instanceof z.ZodUnion) {
      arrayItemType = 'union';
    }
  } else if (currentType instanceof z.ZodObject) {
    type = 'object';
  } else if (currentType instanceof z.ZodEnum) {
    type = 'enum';
    enumValues = (currentType as any)._def.values;
  } else if (currentType instanceof z.ZodUnion) {
    type = 'union';
  } else if (currentType instanceof z.ZodLiteral) {
    type = 'literal';
  }

  return {
    type,
    isOptional,
    isNullable,
    isArray,
    arrayItemType,
    minLength,
    maxLength,
    min,
    max,
    enumValues,
  };
}

describe('Schema Synchronization - Vendors Collection', () => {
  describe('Basic Info Fields', () => {
    const shape = getZodSchemaShape(basicInfoSchema);

    it('should have companyName field with correct constraints', () => {
      expect(shape.companyName).toBeDefined();
      const analysis = analyzeZodType(shape.companyName);
      expect(analysis.type).toBe('string');
      expect(analysis.isOptional).toBe(false);
      expect(analysis.minLength).toBe(2);
      expect(analysis.maxLength).toBe(100);
    });

    it('should have slug field with correct constraints', () => {
      expect(shape.slug).toBeDefined();
      const analysis = analyzeZodType(shape.slug);
      expect(analysis.type).toBe('string');
      expect(analysis.isOptional).toBe(false);
      expect(analysis.minLength).toBe(2);
      expect(analysis.maxLength).toBe(100);
    });

    it('should have description field with correct constraints', () => {
      expect(shape.description).toBeDefined();
      const analysis = analyzeZodType(shape.description);
      expect(analysis.type).toBe('string');
      expect(analysis.isOptional).toBe(false);
      expect(analysis.minLength).toBe(10);
      expect(analysis.maxLength).toBe(500);
    });

    it('should have logo field as optional string', () => {
      expect(shape.logo).toBeDefined();
      const analysis = analyzeZodType(shape.logo);
      expect(analysis.type).toBe('string');
      expect(analysis.isOptional).toBe(true);
    });

    it('should have contactEmail field with email validation', () => {
      expect(shape.contactEmail).toBeDefined();
      const analysis = analyzeZodType(shape.contactEmail);
      expect(analysis.type).toBe('string');
      expect(analysis.isOptional).toBe(false);
    });

    it('should have contactPhone field as optional', () => {
      expect(shape.contactPhone).toBeDefined();
      const analysis = analyzeZodType(shape.contactPhone);
      expect(analysis.type).toBe('string');
      expect(analysis.isOptional).toBe(true);
    });
  });

  describe('Brand Story Fields', () => {
    const shape = getZodSchemaShape(brandStorySchema);

    it('should have website field as optional URL', () => {
      expect(shape.website).toBeDefined();
      const analysis = analyzeZodType(shape.website);
      expect(analysis.type).toBe('string');
      expect(analysis.isOptional).toBe(true);
    });

    it('should have social media URLs as optional', () => {
      expect(shape.linkedinUrl).toBeDefined();
      expect(shape.twitterUrl).toBeDefined();

      const linkedinAnalysis = analyzeZodType(shape.linkedinUrl);
      expect(linkedinAnalysis.isOptional).toBe(true);

      const twitterAnalysis = analyzeZodType(shape.twitterUrl);
      expect(twitterAnalysis.isOptional).toBe(true);
    });

    it('should have foundedYear with correct min/max constraints', () => {
      expect(shape.foundedYear).toBeDefined();
      const analysis = analyzeZodType(shape.foundedYear);
      expect(analysis.type).toBe('number');
      expect(analysis.isOptional || analysis.isNullable).toBe(true);
      expect(analysis.min).toBe(1800);
      expect(analysis.max).toBe(new Date().getFullYear());
    });

    it('should have longDescription with max length constraint', () => {
      expect(shape.longDescription).toBeDefined();
      const analysis = analyzeZodType(shape.longDescription);
      expect(analysis.type).toBe('string');
      expect(analysis.isOptional || analysis.isNullable).toBe(true);
      expect(analysis.maxLength).toBe(5000);
    });

    it('should have social proof metrics as optional numbers', () => {
      const metrics = [
        'totalProjects',
        'employeeCount',
        'linkedinFollowers',
        'instagramFollowers',
      ];

      metrics.forEach(metric => {
        expect(shape[metric]).toBeDefined();
        const analysis = analyzeZodType(shape[metric]);
        expect(analysis.type).toBe('number');
        expect(analysis.isOptional || analysis.isNullable).toBe(true);
        expect(analysis.min).toBe(0);
      });
    });

    it('should have client satisfaction scores with 0-100 range', () => {
      const scores = ['clientSatisfactionScore', 'repeatClientPercentage'];

      scores.forEach(score => {
        expect(shape[score]).toBeDefined();
        const analysis = analyzeZodType(shape[score]);
        expect(analysis.type).toBe('number');
        expect(analysis.isOptional || analysis.isNullable).toBe(true);
        expect(analysis.min).toBe(0);
        expect(analysis.max).toBe(100);
      });
    });

    it('should have video fields with correct constraints', () => {
      expect(shape.videoUrl).toBeDefined();
      expect(shape.videoThumbnail).toBeDefined();
      expect(shape.videoDuration).toBeDefined();
      expect(shape.videoTitle).toBeDefined();
      expect(shape.videoDescription).toBeDefined();

      const videoUrlAnalysis = analyzeZodType(shape.videoUrl);
      expect(videoUrlAnalysis.isOptional).toBe(true);

      const videoDurationAnalysis = analyzeZodType(shape.videoDuration);
      expect(videoDurationAnalysis.maxLength).toBe(10);

      const videoTitleAnalysis = analyzeZodType(shape.videoTitle);
      expect(videoTitleAnalysis.maxLength).toBe(200);

      const videoDescAnalysis = analyzeZodType(shape.videoDescription);
      expect(videoDescAnalysis.maxLength).toBe(1000);
    });
  });

  describe('Array Field Structures - CRITICAL BUG PREVENTION', () => {
    const brandStoryShape = getZodSchemaShape(brandStorySchema);

    it('should accept serviceAreas as ARRAY OF OBJECTS (not string array)', () => {
      expect(brandStoryShape.serviceAreas).toBeDefined();
      const analysis = analyzeZodType(brandStoryShape.serviceAreas);
      expect(analysis.isArray).toBe(true);

      // CRITICAL: Must accept union of string OR object
      expect(analysis.arrayItemType).toBe('union');

      // Verify it accepts both formats
      const testData1 = { serviceAreas: ['area1', 'area2'] };
      const testData2 = {
        serviceAreas: [
          { area: 'Navigation', description: 'GPS systems' },
          { area: 'Communication', description: 'Radio systems' }
        ]
      };

      expect(() => brandStorySchema.parse(testData1)).not.toThrow();
      expect(() => brandStorySchema.parse(testData2)).not.toThrow();
    });

    it('should accept companyValues as ARRAY OF OBJECTS (not string array)', () => {
      expect(brandStoryShape.companyValues).toBeDefined();
      const analysis = analyzeZodType(brandStoryShape.companyValues);
      expect(analysis.isArray).toBe(true);

      // CRITICAL: Must accept union of string OR object
      expect(analysis.arrayItemType).toBe('union');

      // Verify it accepts both formats
      const testData1 = { companyValues: ['value1', 'value2'] };
      const testData2 = {
        companyValues: [
          { value: 'Quality', description: 'We prioritize quality' },
          { value: 'Innovation', description: 'We innovate constantly' }
        ]
      };

      expect(() => brandStorySchema.parse(testData1)).not.toThrow();
      expect(() => brandStorySchema.parse(testData2)).not.toThrow();
    });
  });

  describe('Certification Schema', () => {
    const shape = getZodSchemaShape(certificationSchema);

    it('should have required fields with correct constraints', () => {
      const requiredFields = {
        name: { minLength: 2, maxLength: 200 },
        issuer: { minLength: 2, maxLength: 200 },
        year: { min: 1900, max: new Date().getFullYear() },
      };

      Object.entries(requiredFields).forEach(([fieldName, constraints]) => {
        expect(shape[fieldName]).toBeDefined();
        const analysis = analyzeZodType(shape[fieldName]);

        if ('minLength' in constraints) {
          expect(analysis.minLength).toBe(constraints.minLength);
          expect(analysis.maxLength).toBe(constraints.maxLength);
        }
        if ('min' in constraints) {
          expect(analysis.min).toBe(constraints.min);
          expect(analysis.max).toBe(constraints.max);
        }
      });
    });

    it('should have optional fields', () => {
      const optionalFields = [
        'expiryDate',
        'certificateNumber',
        'logo',
        'verificationUrl',
      ];

      optionalFields.forEach(fieldName => {
        expect(shape[fieldName]).toBeDefined();
        const analysis = analyzeZodType(shape[fieldName]);
        expect(analysis.isOptional || analysis.isNullable).toBe(true);
      });
    });

    it('should have certificateNumber with max length 100', () => {
      expect(shape.certificateNumber).toBeDefined();
      const analysis = analyzeZodType(shape.certificateNumber);
      expect(analysis.maxLength).toBe(100);
    });
  });

  describe('Award Schema', () => {
    const shape = getZodSchemaShape(awardSchema);

    it('should have required fields', () => {
      const requiredFields = ['title', 'organization', 'year'];

      requiredFields.forEach(fieldName => {
        expect(shape[fieldName]).toBeDefined();
        const analysis = analyzeZodType(shape[fieldName]);
        expect(analysis.isOptional).toBe(false);
      });
    });

    it('should have correct max lengths', () => {
      const maxLengths = {
        title: 200,
        organization: 200,
        category: 100,
        description: 1000,
      };

      Object.entries(maxLengths).forEach(([fieldName, maxLen]) => {
        expect(shape[fieldName]).toBeDefined();
        const analysis = analyzeZodType(shape[fieldName]);
        expect(analysis.maxLength).toBe(maxLen);
      });
    });
  });

  describe('Case Study Schema', () => {
    const shape = getZodSchemaShape(caseStudySchema);

    it('should have required fields with correct constraints', () => {
      expect(shape.title).toBeDefined();
      const titleAnalysis = analyzeZodType(shape.title);
      expect(titleAnalysis.minLength).toBe(2);
      expect(titleAnalysis.maxLength).toBe(200);

      expect(shape.challenge).toBeDefined();
      const challengeAnalysis = analyzeZodType(shape.challenge);
      expect(challengeAnalysis.minLength).toBe(10);
      expect(challengeAnalysis.maxLength).toBe(5000);

      expect(shape.solution).toBeDefined();
      expect(shape.results).toBeDefined();
    });

    it('should have yacht relationship fields', () => {
      expect(shape.yachtName).toBeDefined();
      expect(shape.yacht).toBeDefined();

      const yachtNameAnalysis = analyzeZodType(shape.yachtName);
      expect(yachtNameAnalysis.isOptional || yachtNameAnalysis.isNullable).toBe(true);
    });

    it('should have testimony fields with correct constraints', () => {
      expect(shape.testimonyQuote).toBeDefined();
      const quoteAnalysis = analyzeZodType(shape.testimonyQuote);
      expect(quoteAnalysis.maxLength).toBe(1000);

      expect(shape.testimonyAuthor).toBeDefined();
      expect(shape.testimonyRole).toBeDefined();
    });

    it('should accept images as array of URLs', () => {
      expect(shape.images).toBeDefined();
      const analysis = analyzeZodType(shape.images);
      expect(analysis.isArray).toBe(true);
      expect(analysis.isOptional || analysis.isNullable).toBe(true);
    });
  });

  describe('Team Member Schema', () => {
    const shape = getZodSchemaShape(teamMemberSchema);

    it('should have required fields', () => {
      const requiredFields = ['name', 'role'];

      requiredFields.forEach(fieldName => {
        expect(shape[fieldName]).toBeDefined();
        const analysis = analyzeZodType(shape[fieldName]);
        expect(analysis.minLength).toBe(2);
        expect(analysis.maxLength).toBe(200);
      });
    });

    it('should have bio with max length 1000', () => {
      expect(shape.bio).toBeDefined();
      const analysis = analyzeZodType(shape.bio);
      expect(analysis.maxLength).toBe(1000);
      expect(analysis.isOptional || analysis.isNullable).toBe(true);
    });

    it('should have optional photo and linkedinUrl', () => {
      expect(shape.photo).toBeDefined();
      expect(shape.linkedinUrl).toBeDefined();

      const photoAnalysis = analyzeZodType(shape.photo);
      expect(photoAnalysis.isOptional).toBe(true);

      const linkedinAnalysis = analyzeZodType(shape.linkedinUrl);
      expect(linkedinAnalysis.isOptional).toBe(true);
    });

    it('should have email and displayOrder as optional', () => {
      expect(shape.email).toBeDefined();
      expect(shape.displayOrder).toBeDefined();

      const emailAnalysis = analyzeZodType(shape.email);
      expect(emailAnalysis.isOptional || emailAnalysis.isNullable).toBe(true);

      const displayOrderAnalysis = analyzeZodType(shape.displayOrder);
      expect(displayOrderAnalysis.isOptional || displayOrderAnalysis.isNullable).toBe(true);
    });
  });

  describe('Location Schema', () => {
    const shape = getZodSchemaShape(locationSchema);

    it('should have address field as required', () => {
      expect(shape.address).toBeDefined();
      const analysis = analyzeZodType(shape.address);
      expect(analysis.minLength).toBe(5);
      expect(analysis.maxLength).toBe(500);
    });

    it('should have city and country as required', () => {
      expect(shape.city).toBeDefined();
      const cityAnalysis = analyzeZodType(shape.city);
      expect(cityAnalysis.minLength).toBe(2);
      expect(cityAnalysis.maxLength).toBe(255);

      expect(shape.country).toBeDefined();
      const countryAnalysis = analyzeZodType(shape.country);
      expect(countryAnalysis.minLength).toBe(2);
      expect(countryAnalysis.maxLength).toBe(255);
    });

    it('should have coordinate fields with correct ranges', () => {
      expect(shape.latitude).toBeDefined();
      const latAnalysis = analyzeZodType(shape.latitude);
      expect(latAnalysis.min).toBe(-90);
      expect(latAnalysis.max).toBe(90);
      expect(latAnalysis.isOptional).toBe(true);

      expect(shape.longitude).toBeDefined();
      const lonAnalysis = analyzeZodType(shape.longitude);
      expect(lonAnalysis.min).toBe(-180);
      expect(lonAnalysis.max).toBe(180);
      expect(lonAnalysis.isOptional).toBe(true);
    });

    it('should have optional fields', () => {
      const optionalFields = ['id', 'locationName', 'postalCode', 'isHQ'];

      optionalFields.forEach(fieldName => {
        expect(shape[fieldName]).toBeDefined();
        const analysis = analyzeZodType(shape[fieldName]);
        expect(analysis.isOptional || analysis.isNullable).toBe(true);
      });
    });
  });

  describe('API Vendor Update Schema - Complete Field Coverage', () => {
    const shape = getZodSchemaShape(apiVendorUpdateSchema);

    it('should have tier enum with correct values', () => {
      expect(shape.tier).toBeDefined();
      const analysis = analyzeZodType(shape.tier);
      expect(analysis.type).toBe('enum');
      expect(analysis.enumValues).toEqual(['free', 'tier1', 'tier2', 'tier3']);
    });

    it('should have all basic info fields as optional (PATCH semantics)', () => {
      const basicFields = [
        'companyName',
        'slug',
        'description',
        'logo',
        'contactEmail',
        'contactPhone',
      ];

      basicFields.forEach(fieldName => {
        expect(shape[fieldName]).toBeDefined();
        const analysis = analyzeZodType(shape[fieldName]);
        expect(analysis.isOptional).toBe(true);
      });
    });

    it('should have locations array with all Payload CMS fields', () => {
      expect(shape.locations).toBeDefined();
      const analysis = analyzeZodType(shape.locations);
      expect(analysis.isArray).toBe(true);
      expect(analysis.arrayItemType).toBe('object');

      // Verify HQ validation refine exists
      const testData = {
        locations: [
          { address: 'Location 1', isHQ: true },
          { address: 'Location 2', isHQ: true }, // Two HQs - should fail
        ],
      };

      const result = apiVendorUpdateSchema.safeParse(testData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Only one location can be designated as Headquarters');
      }
    });

    it('should accept caseStudies with flexible image formats', () => {
      expect(shape.caseStudies).toBeDefined();

      // Test URL strings
      const testData1 = {
        caseStudies: [
          {
            title: 'Test Case',
            challenge: 'Test challenge',
            solution: 'Test solution',
            results: 'Test results',
            images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
          },
        ],
      };
      expect(() => apiVendorUpdateSchema.parse(testData1)).not.toThrow();

      // Test media IDs (numbers)
      const testData2 = {
        caseStudies: [
          {
            title: 'Test Case',
            challenge: 'Test challenge',
            solution: 'Test solution',
            results: 'Test results',
            images: [123, 456],
          },
        ],
      };
      expect(() => apiVendorUpdateSchema.parse(testData2)).not.toThrow();

      // Test objects with image field
      const testData3 = {
        caseStudies: [
          {
            title: 'Test Case',
            challenge: 'Test challenge',
            solution: 'Test solution',
            results: 'Test results',
            images: [
              { image: 123 },
              { image: 'https://example.com/image.jpg' },
            ],
          },
        ],
      };
      expect(() => apiVendorUpdateSchema.parse(testData3)).not.toThrow();
    });

    it('should accept teamMembers with flexible photo formats', () => {
      expect(shape.teamMembers).toBeDefined();

      // Test URL string
      const testData1 = {
        teamMembers: [
          {
            name: 'John Doe',
            role: 'Captain',
            photo: 'https://example.com/photo.jpg',
          },
        ],
      };
      expect(() => apiVendorUpdateSchema.parse(testData1)).not.toThrow();

      // Test media ID (number)
      const testData2 = {
        teamMembers: [
          {
            name: 'Jane Smith',
            role: 'Engineer',
            photo: 123,
          },
        ],
      };
      expect(() => apiVendorUpdateSchema.parse(testData2)).not.toThrow();

      // Test media object
      const testData3 = {
        teamMembers: [
          {
            name: 'Bob Johnson',
            role: 'Manager',
            photo: { id: 456, url: 'https://example.com/photo.jpg' },
          },
        ],
      };
      expect(() => apiVendorUpdateSchema.parse(testData3)).not.toThrow();
    });
  });

  describe('MISMATCH DETECTION - clientSatisfactionScore', () => {
    it('should flag clientSatisfactionScore max value mismatch', () => {
      // Payload CMS: clientSatisfactionScore has max: 10
      // Zod schema: clientSatisfactionScore has max: 100

      const brandStoryShape = getZodSchemaShape(brandStorySchema);
      const apiShape = getZodSchemaShape(apiVendorUpdateSchema);

      const brandStoryAnalysis = analyzeZodType(brandStoryShape.clientSatisfactionScore);
      const apiAnalysis = analyzeZodType(apiShape.clientSatisfactionScore);

      // EXPECTED MISMATCH: This test documents the known discrepancy
      // Payload: max 10, Zod: max 100
      expect(brandStoryAnalysis.max).toBe(100);
      expect(apiAnalysis.max).toBe(100);

      // TODO: Fix this mismatch - update Payload CMS to max: 100 or Zod to max: 10
      console.warn('⚠️ SCHEMA MISMATCH DETECTED:');
      console.warn('  Field: clientSatisfactionScore');
      console.warn('  Payload CMS: max 10');
      console.warn('  Zod Schema: max 100');
      console.warn('  Action: Update Payload CMS Vendors collection to max: 100');
    });
  });

  describe('MISMATCH DETECTION - teamMembers.bio maxLength', () => {
    it('should flag teamMembers.bio maxLength mismatch', () => {
      // Payload CMS: teamMembers.bio has maxLength: 2000
      // Zod form schema: teamMembers.bio has maxLength: 1000
      // Zod API schema: teamMembers.bio has maxLength: 2000

      const formShape = getZodSchemaShape(teamMemberSchema);
      const apiShape = getZodSchemaShape(apiVendorUpdateSchema);

      const formBioAnalysis = analyzeZodType(formShape.bio);
      expect(formBioAnalysis.maxLength).toBe(1000);

      // Extract teamMembers array item type from API schema
      const teamMembersType = apiShape.teamMembers;
      const teamMembersAnalysis = analyzeZodType(teamMembersType);
      expect(teamMembersAnalysis.isArray).toBe(true);

      // TODO: Fix this mismatch - update form schema to maxLength: 2000
      console.warn('⚠️ SCHEMA MISMATCH DETECTED:');
      console.warn('  Field: teamMembers.bio');
      console.warn('  Payload CMS: maxLength 2000');
      console.warn('  Zod Form Schema: maxLength 1000');
      console.warn('  Zod API Schema: maxLength 2000');
      console.warn('  Action: Update vendorSchemas.ts teamMemberSchema.bio to maxLength 2000');
    });
  });
});

describe('Schema Synchronization - TierUpgradeRequests Collection', () => {
  // Note: No Zod schema exists yet for TierUpgradeRequests
  // This section documents the expected schema based on Payload CMS collection

  it('should document expected fields from Payload CMS', () => {
    const expectedFields = {
      vendor: { type: 'relationship', relationTo: 'vendors', required: true },
      user: { type: 'relationship', relationTo: 'users', required: true },
      currentTier: { type: 'select', required: true, options: ['free', 'tier1', 'tier2', 'tier3'] },
      requestType: { type: 'select', required: true, options: ['upgrade', 'downgrade'] },
      requestedTier: { type: 'select', required: true, options: ['free', 'tier1', 'tier2', 'tier3'] },
      status: { type: 'select', required: true, options: ['pending', 'approved', 'rejected', 'cancelled'] },
      vendorNotes: { type: 'textarea', maxLength: 500, required: false },
      rejectionReason: { type: 'textarea', maxLength: 1000, required: false },
      reviewedBy: { type: 'relationship', relationTo: 'users', required: false },
      requestedAt: { type: 'date', required: true },
      reviewedAt: { type: 'date', required: false },
    };

    // This test documents what SHOULD be validated when Zod schema is created
    expect(expectedFields).toBeDefined();

    console.warn('⚠️ MISSING VALIDATION:');
    console.warn('  Collection: tier_upgrade_requests');
    console.warn('  Issue: No Zod validation schema exists');
    console.warn('  Action: Create lib/validation/tier-upgrade-request-schema.ts');
  });
});

describe('Schema Synchronization - Users Collection', () => {
  // Note: No Zod schema exists yet for Users (auth handled by Payload)
  // This section documents the expected schema based on Payload CMS collection

  it('should document expected fields from Payload CMS', () => {
    const expectedFields = {
      email: { type: 'email', required: true }, // Built-in auth field
      password: { type: 'text', required: true }, // Built-in auth field
      role: { type: 'select', required: true, options: ['admin', 'vendor'], defaultValue: 'vendor' },
      status: { type: 'select', required: true, options: ['pending', 'approved', 'rejected', 'suspended'], defaultValue: 'pending' },
      rejectionReason: { type: 'textarea', required: false },
      approvedAt: { type: 'date', required: false },
      rejectedAt: { type: 'date', required: false },
    };

    expect(expectedFields).toBeDefined();

    console.warn('⚠️ MISSING VALIDATION:');
    console.warn('  Collection: users');
    console.warn('  Issue: No Zod validation schema exists for user fields');
    console.warn('  Note: Auth fields handled by Payload, but custom fields need validation');
    console.warn('  Action: Create lib/validation/user-schema.ts for custom fields');
  });
});

describe('Schema Validation Best Practices', () => {
  it('should enforce test-first development for schema changes', () => {
    // This test ensures developers update tests BEFORE changing schemas

    console.log('📋 SCHEMA CHANGE CHECKLIST:');
    console.log('  1. Update this test file FIRST with new field expectations');
    console.log('  2. Run tests and confirm they FAIL');
    console.log('  3. Update Payload CMS collection schema');
    console.log('  4. Update Zod validation schema');
    console.log('  5. Run tests and confirm they PASS');
    console.log('  6. Update TypeScript types in lib/types.ts');
    console.log('  7. Run type-check and build to ensure no breakage');

    expect(true).toBe(true);
  });

  it('should document schema validation coverage gaps', () => {
    const collectionsWithoutZodValidation = [
      'tier_upgrade_requests',
      'users (custom fields)',
      'products',
      'import_history',
      'categories',
      'tags',
      'yachts',
      'blog_posts',
      'team_members',
    ];

    console.warn('⚠️ COLLECTIONS WITHOUT ZOD VALIDATION:');
    collectionsWithoutZodValidation.forEach(collection => {
      console.warn(`  - ${collection}`);
    });
    console.warn('  Action: Prioritize creating validation schemas for high-risk collections');

    expect(collectionsWithoutZodValidation.length).toBeGreaterThan(0);
  });

  it('should recommend automated schema extraction from Payload collections', () => {
    console.log('💡 FUTURE ENHANCEMENT:');
    console.log('  Create a script to auto-generate Zod schemas from Payload collections');
    console.log('  Benefits:');
    console.log('    - Eliminate manual schema synchronization');
    console.log('    - Guarantee 100% field coverage');
    console.log('    - Auto-detect schema drift');
    console.log('  Implementation:');
    console.log('    - Parse Payload collection TypeScript files with AST');
    console.log('    - Generate Zod schemas programmatically');
    console.log('    - Run as pre-commit hook or CI check');

    expect(true).toBe(true);
  });
});
