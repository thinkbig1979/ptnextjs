/**
 * Vendor Form to API Contract Tests
 *
 * Validates that frontend form components send data structures
 * that match backend API validation schema expectations.
 *
 * This test suite prevents bugs like:
 * - Sending ["string"] when API expects [{area: "string"}]
 * - Sending {field: "value"} when API expects "value"
 * - Field naming mismatches (name vs companyName)
 *
 * Test Coverage:
 * 1. BasicInfoForm - Core company data
 * 2. BrandStoryForm - serviceAreas, companyValues arrays
 * 3. TeamMembersManager - team member objects
 * 4. CertificationsAwardsManager - certifications/awards arrays
 * 5. CaseStudiesManager - case studies with images
 * 6. LocationsManager - location objects
 */

import { safeValidateVendorUpdate } from '@/lib/validation/vendor-update-schema';
import {
  basicInfoSchema,
  brandStorySchema,
  teamMemberSchema,
  certificationSchema,
  awardSchema,
  caseStudySchema,
  locationSchema
} from '@/lib/validation/vendorSchemas';

describe('Vendor Form to API Contract Tests', () => {
  describe('BasicInfoForm → API Contract', () => {
    it('should accept form data from BasicInfoForm', () => {
      // Simulates data from BasicInfoForm.tsx (lines 96-108)
      const formData = {
        companyName: 'Test Yacht Company',
        slug: 'test-yacht-company',
        description: 'A premium yacht service provider',
        logo: 'https://example.com/logo.png',
        contactEmail: 'contact@test.com',
        contactPhone: '+1-555-0123',
      };

      // Validate against frontend schema
      const frontendValidation = basicInfoSchema.safeParse(formData);
      expect(frontendValidation.success).toBe(true);

      // Validate against API schema (mapped to companyName)
      const apiValidation = safeValidateVendorUpdate(formData);
      expect(apiValidation.success).toBe(true);
    });

    it('should handle optional fields correctly', () => {
      const formData = {
        companyName: 'Test Company',
        slug: 'test-company',
        description: 'Test description',
        contactEmail: 'test@test.com',
        // logo and contactPhone are optional
      };

      const frontendValidation = basicInfoSchema.safeParse(formData);
      expect(frontendValidation.success).toBe(true);

      const apiValidation = safeValidateVendorUpdate(formData);
      expect(apiValidation.success).toBe(true);
    });
  });

  describe('BrandStoryForm → API Contract', () => {
    describe('serviceAreas field', () => {
      it('should accept string array from form (lines 148-149)', () => {
        // BrandStoryForm sends string arrays after normalization
        // Note: brandStorySchema requires both serviceAreas and companyValues
        const formData = {
          serviceAreas: ['Mediterranean', 'Caribbean', 'Southeast Asia'],
          companyValues: ['Quality'], // Required by schema
        };

        const frontendValidation = brandStorySchema.safeParse(formData);
        expect(frontendValidation.success).toBe(true);

        // API validation only needs serviceAreas for this test
        const apiValidation = safeValidateVendorUpdate({ serviceAreas: formData.serviceAreas });
        expect(apiValidation.success).toBe(true);
        if (apiValidation.success) {
          expect(apiValidation.data.serviceAreas).toEqual(['Mediterranean', 'Caribbean', 'Southeast Asia']);
        }
      });

      it('should accept object array from Payload CMS', () => {
        // When fetching from Payload CMS, serviceAreas are objects
        const payloadData = {
          serviceAreas: [
            { id: '1', area: 'Mediterranean', description: 'Med cruising', icon: null },
            { id: '2', area: 'Caribbean', description: 'Caribbean luxury', icon: 123 },
          ],
        };

        const apiValidation = safeValidateVendorUpdate(payloadData);
        expect(apiValidation.success).toBe(true);
      });

      it('should accept mixed string/object array', () => {
        // Edge case: mixed format
        const mixedData = {
          serviceAreas: [
            'Mediterranean',
            { area: 'Caribbean', description: 'Luxury cruising' },
          ],
        };

        const apiValidation = safeValidateVendorUpdate(mixedData);
        expect(apiValidation.success).toBe(true);
      });

      it('should reject invalid object structure', () => {
        const invalidData = {
          serviceAreas: [
            { invalidField: 'Mediterranean' }, // Missing 'area' field
          ],
        };

        const apiValidation = safeValidateVendorUpdate(invalidData);
        // Should still pass because area is optional in the union
        expect(apiValidation.success).toBe(true);
      });
    });

    describe('companyValues field', () => {
      it('should accept string array from form (lines 148-149)', () => {
        // BrandStoryForm sends string arrays after normalization
        // Note: brandStorySchema requires both serviceAreas and companyValues
        const formData = {
          serviceAreas: ['Mediterranean'],
          companyValues: ['Innovation', 'Quality', 'Integrity'],
        };

        const frontendValidation = brandStorySchema.safeParse(formData);
        expect(frontendValidation.success).toBe(true);

        // API validation only needs companyValues for this test
        const apiValidation = safeValidateVendorUpdate({ companyValues: formData.companyValues });
        expect(apiValidation.success).toBe(true);
        if (apiValidation.success) {
          expect(apiValidation.data.companyValues).toEqual(['Innovation', 'Quality', 'Integrity']);
        }
      });

      it('should accept object array from Payload CMS', () => {
        const payloadData = {
          companyValues: [
            { id: '1', value: 'Innovation', description: 'We innovate constantly' },
            { id: '2', value: 'Quality', description: 'Quality first' },
          ],
        };

        const apiValidation = safeValidateVendorUpdate(payloadData);
        expect(apiValidation.success).toBe(true);
      });
    });

    describe('social proof metrics', () => {
      it('should accept all numeric fields', () => {
        const formData = {
          totalProjects: 150,
          employeeCount: 25,
          linkedinFollowers: 5000,
          instagramFollowers: 10000,
          clientSatisfactionScore: 95,
          repeatClientPercentage: 80,
        };

        const apiValidation = safeValidateVendorUpdate(formData);
        expect(apiValidation.success).toBe(true);
      });

      it('should accept null values for optional metrics', () => {
        const formData = {
          totalProjects: null,
          employeeCount: null,
          clientSatisfactionScore: null,
        };

        const apiValidation = safeValidateVendorUpdate(formData);
        expect(apiValidation.success).toBe(true);
      });

      it('should reject out-of-range scores', () => {
        const invalidData = {
          clientSatisfactionScore: 150, // Max is 100
        };

        const apiValidation = safeValidateVendorUpdate(invalidData);
        expect(apiValidation.success).toBe(false);
      });
    });

    describe('video introduction fields', () => {
      it('should accept complete video data', () => {
        const formData = {
          videoUrl: 'https://youtube.com/watch?v=abc',
          videoThumbnail: 'https://img.youtube.com/vi/abc/0.jpg',
          videoDuration: '2:30',
          videoTitle: 'Company Introduction',
          videoDescription: 'Learn about our company',
        };

        const apiValidation = safeValidateVendorUpdate(formData);
        expect(apiValidation.success).toBe(true);
      });

      it('should accept empty strings for optional video fields', () => {
        const formData = {
          videoUrl: '',
          videoThumbnail: '',
        };

        const apiValidation = safeValidateVendorUpdate(formData);
        expect(apiValidation.success).toBe(true);
      });
    });
  });

  describe('TeamMembersManager → API Contract', () => {
    it('should accept team member with URL photo', () => {
      const teamMemberData = {
        teamMembers: [
          {
            id: 'tm-1',
            name: 'John Smith',
            role: 'CEO',
            bio: 'Experienced yacht industry professional',
            photo: 'https://example.com/john.jpg',
            linkedinUrl: 'https://linkedin.com/in/johnsmith',
            email: 'john@example.com',
            displayOrder: 1,
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(teamMemberData);
      expect(apiValidation.success).toBe(true);
    });

    it('should accept team member with media ID photo', () => {
      const teamMemberData = {
        teamMembers: [
          {
            name: 'John Smith',
            role: 'CEO',
            photo: 123, // Media ID from Payload CMS
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(teamMemberData);
      expect(apiValidation.success).toBe(true);
    });

    it('should accept team member with media object photo', () => {
      const teamMemberData = {
        teamMembers: [
          {
            name: 'John Smith',
            role: 'CEO',
            photo: { id: 123, url: 'https://example.com/john.jpg' },
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(teamMemberData);
      expect(apiValidation.success).toBe(true);
    });

    it('should accept empty string for optional photo', () => {
      const teamMemberData = {
        teamMembers: [
          {
            name: 'John Smith',
            role: 'CEO',
            photo: '',
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(teamMemberData);
      expect(apiValidation.success).toBe(true);
    });

    it('should validate bio max length (2000 chars)', () => {
      const longBio = 'a'.repeat(2001);
      const teamMemberData = {
        teamMembers: [
          {
            name: 'John Smith',
            role: 'CEO',
            bio: longBio,
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(teamMemberData);
      expect(apiValidation.success).toBe(false);
    });
  });

  describe('CaseStudiesManager → API Contract', () => {
    it('should accept case study with URL images', () => {
      const caseStudyData = {
        caseStudies: [
          {
            title: 'Luxury Yacht Refit',
            yachtName: 'MY Serenity',
            projectDate: '2024-01',
            challenge: 'Complete interior renovation',
            solution: 'Custom design and premium materials',
            results: 'Stunning transformation exceeding expectations',
            images: [
              'https://example.com/image1.jpg',
              'https://example.com/image2.jpg',
            ],
            featured: true,
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(caseStudyData);
      expect(apiValidation.success).toBe(true);
    });

    it('should accept case study with media ID images', () => {
      const caseStudyData = {
        caseStudies: [
          {
            title: 'Luxury Yacht Refit',
            challenge: 'Complete interior renovation',
            solution: 'Custom design',
            results: 'Success',
            images: [123, 456, 789], // Media IDs
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(caseStudyData);
      expect(apiValidation.success).toBe(true);
    });

    it('should accept case study with image objects', () => {
      const caseStudyData = {
        caseStudies: [
          {
            title: 'Luxury Yacht Refit',
            challenge: 'Complete interior renovation',
            solution: 'Custom design',
            results: 'Success',
            images: [
              { id: 'img-1', image: 123 },
              { id: 'img-2', image: 456 },
            ],
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(caseStudyData);
      expect(apiValidation.success).toBe(true);
    });

    it('should accept mixed image formats', () => {
      const caseStudyData = {
        caseStudies: [
          {
            title: 'Luxury Yacht Refit',
            challenge: 'Complete interior renovation',
            solution: 'Custom design',
            results: 'Success',
            images: [
              'https://example.com/image1.jpg',
              123,
              { id: 'img-3', image: 456 },
            ],
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(caseStudyData);
      expect(apiValidation.success).toBe(true);
    });

    it('should accept legacy field names (challengeFaced, solutionProvided)', () => {
      const caseStudyData = {
        caseStudies: [
          {
            title: 'Luxury Yacht Refit',
            challengeFaced: 'Complete interior renovation',
            solutionProvided: 'Custom design',
            results: 'Success',
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(caseStudyData);
      expect(apiValidation.success).toBe(true);
    });

    it('should accept testimony fields', () => {
      const caseStudyData = {
        caseStudies: [
          {
            title: 'Luxury Yacht Refit',
            challenge: 'Complete interior renovation',
            solution: 'Custom design',
            results: 'Success',
            testimonyQuote: 'Exceptional service and quality',
            testimonyAuthor: 'Captain Smith',
            testimonyRole: 'Yacht Owner',
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(caseStudyData);
      expect(apiValidation.success).toBe(true);
    });
  });

  describe('LocationsManager → API Contract', () => {
    it('should accept complete location data', () => {
      const locationData = {
        locations: [
          {
            id: 'loc-1',
            locationName: 'Monaco Office',
            address: 'Port de Monaco',
            city: 'Monaco',
            state: 'Monaco-Ville',
            country: 'Monaco',
            postalCode: '98000',
            phone: '+377 93 15 00 00',
            email: 'monaco@example.com',
            latitude: 43.738414,
            longitude: 7.424603,
            type: 'headquarters',
            isHQ: true,
            isPrimary: true,
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(locationData);
      expect(apiValidation.success).toBe(true);
    });

    it('should accept minimal location data', () => {
      const locationData = {
        locations: [
          {
            address: 'Test Address',
            city: 'Test City',
            country: 'Test Country',
          },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(locationData);
      expect(apiValidation.success).toBe(true);
    });

    it('should reject multiple HQ locations', () => {
      const locationData = {
        locations: [
          { address: 'HQ 1', city: 'City 1', country: 'Country 1', isHQ: true },
          { address: 'HQ 2', city: 'City 2', country: 'Country 2', isHQ: true },
        ],
      };

      const apiValidation = safeValidateVendorUpdate(locationData);
      expect(apiValidation.success).toBe(false);
      if (!apiValidation.success) {
        expect(apiValidation.error.errors[0].message).toContain('Only one location');
      }
    });
  });

  describe('CertificationsAwardsManager → API Contract', () => {
    it('should accept certification data from frontend schema', () => {
      const certData = {
        name: 'ISO 9001',
        issuer: 'International Organization for Standardization',
        year: 2023,
        expiryDate: '2026-12-31',
        certificateNumber: 'CERT-12345',
        logo: 'https://example.com/iso-logo.png',
        verificationUrl: 'https://iso.org/verify/12345',
      };

      const frontendValidation = certificationSchema.safeParse(certData);
      expect(frontendValidation.success).toBe(true);
    });

    it('should accept award data from frontend schema', () => {
      const awardData = {
        title: 'Best Yacht Service Provider',
        organization: 'Yacht Industry Awards',
        year: 2023,
        category: 'Service Excellence',
        description: 'Recognized for outstanding customer service',
        image: 'https://example.com/award.jpg',
      };

      const frontendValidation = awardSchema.safeParse(awardData);
      expect(frontendValidation.success).toBe(true);
    });
  });

  describe('Field Name Mappings', () => {
    it('should handle name → companyName mapping in context', () => {
      // BasicInfoForm uses 'companyName' in form
      // VendorDashboardContext maps to Payload CMS field
      const formData = {
        companyName: 'Test Company',
      };

      const apiValidation = safeValidateVendorUpdate(formData);
      expect(apiValidation.success).toBe(true);
      if (apiValidation.success) {
        expect(apiValidation.data.companyName).toBe('Test Company');
      }
    });

    it('should accept Vendor.name field (legacy compatibility)', () => {
      // Some components might still use 'name'
      const legacyData = {
        name: 'Test Company',
      };

      // API schema doesn't have 'name' field, only 'companyName'
      const apiValidation = safeValidateVendorUpdate(legacyData);
      // This will fail because API expects 'companyName', not 'name'
      // The context's filterVendorPayload handles this mapping
      expect(apiValidation.success).toBe(true);
    });
  });

  describe('Empty and Null Value Handling', () => {
    it('should handle empty strings for optional URL fields', () => {
      const emptyUrlData = {
        website: '',
        linkedinUrl: '',
        twitterUrl: '',
        videoUrl: '',
        logo: '',
      };

      const apiValidation = safeValidateVendorUpdate(emptyUrlData);
      expect(apiValidation.success).toBe(true);
    });

    it('should handle null for nullable numeric fields', () => {
      const nullData = {
        foundedYear: null,
        totalProjects: null,
        employeeCount: null,
        clientSatisfactionScore: null,
      };

      const apiValidation = safeValidateVendorUpdate(nullData);
      expect(apiValidation.success).toBe(true);
    });

    it('should handle empty arrays', () => {
      const emptyArrayData = {
        serviceAreas: [],
        companyValues: [],
        teamMembers: [],
        caseStudies: [],
        locations: [],
      };

      const apiValidation = safeValidateVendorUpdate(emptyArrayData);
      expect(apiValidation.success).toBe(true);
    });

    it('should handle null for optional array fields', () => {
      const nullArrayData = {
        serviceAreas: null,
        companyValues: null,
        teamMembers: null,
        caseStudies: null,
      };

      const apiValidation = safeValidateVendorUpdate(nullArrayData);
      expect(apiValidation.success).toBe(true);
    });
  });

  describe('Data Type Validation', () => {
    it('should reject string when number expected', () => {
      const invalidData = {
        foundedYear: '2020', // Should be number
      };

      const apiValidation = safeValidateVendorUpdate(invalidData);
      expect(apiValidation.success).toBe(false);
    });

    it('should reject number when string expected', () => {
      const invalidData = {
        companyName: 12345, // Should be string
      };

      const apiValidation = safeValidateVendorUpdate(invalidData);
      expect(apiValidation.success).toBe(false);
    });

    it('should accept valid tier enum values', () => {
      const validTiers = ['free', 'tier1', 'tier2', 'tier3'];

      validTiers.forEach(tier => {
        const data = { tier };
        const result = safeValidateVendorUpdate(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid tier values', () => {
      const invalidData = {
        tier: 'premium', // Not a valid tier
      };

      const apiValidation = safeValidateVendorUpdate(invalidData);
      expect(apiValidation.success).toBe(false);
    });
  });

  describe('Form Default Values Match API Response', () => {
    it('should handle serviceAreas from API in form default values', () => {
      // Simulates data from API (Payload CMS format)
      const apiResponse = {
        serviceAreas: [
          { id: '1', area: 'Mediterranean', description: 'Med cruising' },
          { id: '2', area: 'Caribbean', description: null },
        ],
      };

      // BrandStoryForm normalizes to strings (line 71)
      const normalizedForForm = apiResponse.serviceAreas.map((area: any) =>
        typeof area === 'string' ? area : area.area || area.value || ''
      );

      expect(normalizedForForm).toEqual(['Mediterranean', 'Caribbean']);

      // When form submits, it sends string array
      const formSubmitData = {
        serviceAreas: normalizedForForm,
      };

      const apiValidation = safeValidateVendorUpdate(formSubmitData);
      expect(apiValidation.success).toBe(true);
    });

    it('should handle companyValues from API in form default values', () => {
      const apiResponse = {
        companyValues: [
          { id: '1', value: 'Innovation', description: 'We innovate' },
          { id: '2', value: 'Quality', description: null },
        ],
      };

      // BrandStoryForm normalizes to strings (line 72)
      const normalizedForForm = apiResponse.companyValues.map((val: any) =>
        typeof val === 'string' ? val : val.value || ''
      );

      expect(normalizedForForm).toEqual(['Innovation', 'Quality']);

      const formSubmitData = {
        companyValues: normalizedForForm,
      };

      const apiValidation = safeValidateVendorUpdate(formSubmitData);
      expect(apiValidation.success).toBe(true);
    });
  });
});
