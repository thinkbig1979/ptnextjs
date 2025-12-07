/**
 * Payload-Zod Schema Alignment Test Suite
 *
 * This test suite validates that Zod validation schemas align with Payload CMS schemas
 * for critical vendor-related fields that were recently fixed.
 *
 * Bug Fixes Validated (from ptnextjs-qumo, ptnextjs-rscw, ptnextjs-r5m9):
 * 1. clientSatisfactionScore: Payload max changed from 10 to 100
 * 2. teamMembers.bio: Zod max changed from 1000 to 2000
 * 3. Location fields: Added locationName, postalCode to Payload
 * 4. Location fields: Removed state, phone, email, type, isPrimary from Zod
 *
 * Related Files:
 * - lib/validation/vendorSchemas.ts (Zod schemas)
 * - payload/collections/Vendors.ts (Payload CMS schemas)
 */

import { describe, it, expect } from '@jest/globals';
import {
  vendorProfileUpdateSchema,
  teamMemberSchema,
  locationSchema,
} from '@/lib/validation/vendorSchemas';

describe('Payload-Zod Schema Alignment', () => {

  describe('clientSatisfactionScore field alignment', () => {
    it('should accept values in 0-100 range (Payload max: 100)', () => {
      // Test minimum boundary
      const minResult = vendorProfileUpdateSchema.safeParse({
        clientSatisfactionScore: 0,
      });
      expect(minResult.success).toBe(true);

      // Test mid-range value
      const midResult = vendorProfileUpdateSchema.safeParse({
        clientSatisfactionScore: 50,
      });
      expect(midResult.success).toBe(true);

      // Test maximum boundary
      const maxResult = vendorProfileUpdateSchema.safeParse({
        clientSatisfactionScore: 100,
      });
      expect(maxResult.success).toBe(true);
    });

    it('should reject values above 100 (Payload max: 100)', () => {
      const result = vendorProfileUpdateSchema.safeParse({
        clientSatisfactionScore: 101,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find(
          (issue) => issue.path.includes('clientSatisfactionScore')
        );
        expect(error).toBeDefined();
        expect(error?.message).toContain('0 and 100');
      }
    });

    it('should accept null and undefined values (optional field)', () => {
      const nullResult = vendorProfileUpdateSchema.safeParse({
        clientSatisfactionScore: null,
      });
      expect(nullResult.success).toBe(true);

      const undefinedResult = vendorProfileUpdateSchema.safeParse({
        clientSatisfactionScore: undefined,
      });
      expect(undefinedResult.success).toBe(true);
    });
  });

  describe('teamMembers.bio field alignment', () => {
    const createTeamMember = (bio: string | null | undefined) => ({
      name: 'John Doe',
      role: 'Captain',
      bio,
    });

    it('should accept bio up to 2000 characters (Payload maxLength: 2000)', () => {
      // Test 1500 character bio
      const bio1500 = 'a'.repeat(1500);
      const result1500 = teamMemberSchema.safeParse(createTeamMember(bio1500));
      expect(result1500.success).toBe(true);

      // Test exactly 2000 character bio (maximum boundary)
      const bio2000 = 'a'.repeat(2000);
      const result2000 = teamMemberSchema.safeParse(createTeamMember(bio2000));
      expect(result2000.success).toBe(true);
    });

    it('should reject bio exceeding 2000 characters (Payload maxLength: 2000)', () => {
      const bio2001 = 'a'.repeat(2001);
      const result = teamMemberSchema.safeParse(createTeamMember(bio2001));

      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find(
          (issue) => issue.path.includes('bio')
        );
        expect(error).toBeDefined();
        expect(error?.code).toBe('too_big');
      }
    });

    it('should accept null and undefined bio values (optional field)', () => {
      const nullResult = teamMemberSchema.safeParse(createTeamMember(null));
      expect(nullResult.success).toBe(true);

      const undefinedResult = teamMemberSchema.safeParse(createTeamMember(undefined));
      expect(undefinedResult.success).toBe(true);
    });
  });

  describe('Location schema field alignment', () => {
    const createLocation = (overrides = {}) => ({
      address: '123 Main Street',
      city: 'Fort Lauderdale',
      country: 'United States',
      ...overrides,
    });

    it('should accept all Payload-defined location fields', () => {
      const location = createLocation({
        id: 'loc-123',
        locationName: 'Headquarters',
        address: '123 Main Street, Suite 100',
        city: 'Fort Lauderdale',
        country: 'United States',
        postalCode: '33316',
        latitude: 26.1224,
        longitude: -80.1373,
        isHQ: true,
      });

      const result = locationSchema.safeParse(location);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.id).toBe('loc-123');
        expect(result.data.locationName).toBe('Headquarters');
        expect(result.data.postalCode).toBe('33316');
        expect(result.data.latitude).toBe(26.1224);
        expect(result.data.longitude).toBe(-80.1373);
        expect(result.data.isHQ).toBe(true);
      }
    });

    it('should verify locationName is accepted (added to Payload schema)', () => {
      const result = locationSchema.safeParse(
        createLocation({ locationName: 'Main Office' })
      );
      expect(result.success).toBe(true);
    });

    it('should verify postalCode is accepted (added to Payload schema)', () => {
      const result = locationSchema.safeParse(
        createLocation({ postalCode: '33316-1234' })
      );
      expect(result.success).toBe(true);
    });

    it('should accept postalCode up to 20 characters (Payload maxLength: 20)', () => {
      // Test exactly 20 characters
      const postalCode20 = 'a'.repeat(20);
      const result = locationSchema.safeParse(
        createLocation({ postalCode: postalCode20 })
      );
      expect(result.success).toBe(true);
    });

    it('should reject postalCode exceeding 20 characters (Payload maxLength: 20)', () => {
      const postalCode21 = 'a'.repeat(21);
      const result = locationSchema.safeParse(
        createLocation({ postalCode: postalCode21 })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find(
          (issue) => issue.path.includes('postalCode')
        );
        expect(error).toBeDefined();
        expect(error?.code).toBe('too_big');
      }
    });

    it('should document that state, phone, email, type, isPrimary are NOT in schema', () => {
      // These fields were removed from Zod schema to align with Payload
      // Attempting to include them should pass (extra fields are ignored by Zod)
      // but they won't be in the parsed output

      const locationWithLegacyFields = createLocation({
        state: 'FL', // NOT in Payload schema
        phone: '+1234567890', // NOT in Payload schema
        email: 'contact@example.com', // NOT in Payload schema
        type: 'office', // NOT in Payload schema
        isPrimary: true, // NOT in Payload schema (we have isHQ instead)
      });

      const result = locationSchema.safeParse(locationWithLegacyFields);
      expect(result.success).toBe(true);

      if (result.success) {
        // Verify legacy fields are NOT in the parsed data
        expect('state' in result.data).toBe(false);
        expect('phone' in result.data).toBe(false);
        expect('email' in result.data).toBe(false);
        expect('type' in result.data).toBe(false);
        expect('isPrimary' in result.data).toBe(false);

        // Verify only Payload-aligned fields are present
        const allowedFields = [
          'id', 'locationName', 'address', 'city', 'country',
          'postalCode', 'latitude', 'longitude', 'isHQ'
        ];

        Object.keys(result.data).forEach((key) => {
          expect(allowedFields).toContain(key);
        });
      }
    });

    it('should accept optional/nullable values for locationName and postalCode', () => {
      // Test null values
      const nullResult = locationSchema.safeParse(
        createLocation({ locationName: null, postalCode: null })
      );
      expect(nullResult.success).toBe(true);

      // Test undefined values
      const undefinedResult = locationSchema.safeParse(
        createLocation({ locationName: undefined, postalCode: undefined })
      );
      expect(undefinedResult.success).toBe(true);
    });
  });

  describe('Location schema required fields', () => {
    it('should require address field', () => {
      const result = locationSchema.safeParse({
        city: 'Fort Lauderdale',
        country: 'United States',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find(
          (issue) => issue.path.includes('address')
        );
        expect(error).toBeDefined();
      }
    });

    it('should require city field', () => {
      const result = locationSchema.safeParse({
        address: '123 Main Street',
        country: 'United States',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find(
          (issue) => issue.path.includes('city')
        );
        expect(error).toBeDefined();
      }
    });

    it('should require country field', () => {
      const result = locationSchema.safeParse({
        address: '123 Main Street',
        city: 'Fort Lauderdale',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find(
          (issue) => issue.path.includes('country')
        );
        expect(error).toBeDefined();
      }
    });
  });

  describe('Integration validation', () => {
    it('should validate complete vendor profile update with all fixed fields', () => {
      const vendorUpdate = {
        clientSatisfactionScore: 95,
        teamMembers: [
          {
            name: 'John Doe',
            role: 'Captain',
            bio: 'a'.repeat(1500), // 1500 chars - within 2000 limit
            displayOrder: 0,
          },
        ],
        locations: [
          {
            locationName: 'Headquarters',
            address: '123 Main Street',
            city: 'Fort Lauderdale',
            postalCode: '33316',
            country: 'United States',
            latitude: 26.1224,
            longitude: -80.1373,
            isHQ: true,
          },
        ],
      };

      const result = vendorProfileUpdateSchema.safeParse(vendorUpdate);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.clientSatisfactionScore).toBe(95);
        expect(result.data.teamMembers?.[0].bio?.length).toBe(1500);
        expect(result.data.locations?.[0].locationName).toBe('Headquarters');
        expect(result.data.locations?.[0].postalCode).toBe('33316');
      }
    });
  });
});
