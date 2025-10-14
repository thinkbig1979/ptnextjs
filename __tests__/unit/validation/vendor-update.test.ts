import { safeValidateVendorUpdate, validateVendorUpdate } from '@/lib/validation/vendor-update-schema';

describe('Vendor Update Validation Schema', () => {
  describe('Basic fields validation', () => {
    it('should accept valid company name', () => {
      const result = safeValidateVendorUpdate({ companyName: 'Test Company' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.companyName).toBe('Test Company');
      }
    });

    it('should reject company name that is too short', () => {
      const result = safeValidateVendorUpdate({ companyName: 'A' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject company name that is too long', () => {
      const longName = 'A'.repeat(256);
      const result = safeValidateVendorUpdate({ companyName: longName });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('not exceed 255 characters');
      }
    });

    it('should accept valid description', () => {
      const result = safeValidateVendorUpdate({ description: 'A valid description' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('A valid description');
      }
    });

    it('should reject description that is too long', () => {
      const longDesc = 'A'.repeat(5001);
      const result = safeValidateVendorUpdate({ description: longDesc });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('not exceed 5000 characters');
      }
    });
  });

  describe('Email validation', () => {
    it('should accept valid email', () => {
      const result = safeValidateVendorUpdate({ contactEmail: 'test@example.com' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contactEmail).toBe('test@example.com');
      }
    });

    it('should reject invalid email format', () => {
      const result = safeValidateVendorUpdate({ contactEmail: 'invalid-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid email');
      }
    });

    it('should reject email that is too long', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      const result = safeValidateVendorUpdate({ contactEmail: longEmail });
      expect(result.success).toBe(false);
    });
  });

  describe('Phone validation', () => {
    it('should accept valid phone numbers', () => {
      const validPhones = [
        '+1 (555) 123-4567',
        '555-123-4567',
        '5551234567',
        '+44 20 1234 5678',
      ];

      validPhones.forEach((phone) => {
        const result = safeValidateVendorUpdate({ contactPhone: phone });
        expect(result.success).toBe(true);
      });
    });

    it('should reject phone with invalid characters', () => {
      const result = safeValidateVendorUpdate({ contactPhone: 'abc-def-ghij' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid phone number');
      }
    });

    it('should reject phone that is too long', () => {
      const longPhone = '1'.repeat(51);
      const result = safeValidateVendorUpdate({ contactPhone: longPhone });
      expect(result.success).toBe(false);
    });
  });

  describe('URL validation', () => {
    it('should accept valid URLs for website', () => {
      const result = safeValidateVendorUpdate({ website: 'https://example.com' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.website).toBe('https://example.com');
      }
    });

    it('should accept empty string for logo (clearing)', () => {
      const result = safeValidateVendorUpdate({ logo: '' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.logo).toBe('');
      }
    });

    it('should reject invalid URL for website', () => {
      const result = safeValidateVendorUpdate({ website: 'not-a-url' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('valid URL');
      }
    });

    it('should accept valid LinkedIn URL', () => {
      const result = safeValidateVendorUpdate({
        linkedinUrl: 'https://linkedin.com/company/example',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid Twitter URL', () => {
      const result = safeValidateVendorUpdate({ twitterUrl: 'https://twitter.com/example' });
      expect(result.success).toBe(true);
    });

    it('should reject URL that is too long', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500);
      const result = safeValidateVendorUpdate({ website: longUrl });
      expect(result.success).toBe(false);
    });
  });

  describe('Certifications validation', () => {
    it('should accept valid certifications array', () => {
      const certifications = [
        { certification: 'ISO 9001' },
        { certification: 'CE Marking' },
      ];
      const result = safeValidateVendorUpdate({ certifications });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.certifications).toEqual(certifications);
      }
    });

    it('should reject certification with empty string', () => {
      const certifications = [{ certification: '' }];
      const result = safeValidateVendorUpdate({ certifications });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required');
      }
    });

    it('should reject certification that is too long', () => {
      const certifications = [{ certification: 'A'.repeat(256) }];
      const result = safeValidateVendorUpdate({ certifications });
      expect(result.success).toBe(false);
    });
  });

  describe('Multiple fields validation', () => {
    it('should accept multiple valid fields', () => {
      const data = {
        companyName: 'Test Company',
        description: 'Test description',
        contactEmail: 'test@example.com',
        website: 'https://example.com',
      };
      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should accept empty object (no updates)', () => {
      const result = safeValidateVendorUpdate({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });

    it('should validate each field independently', () => {
      const data = {
        companyName: 'A', // Too short
        contactEmail: 'invalid', // Invalid format
      };
      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('validateVendorUpdate (throw version)', () => {
    it('should return data for valid input', () => {
      const data = { companyName: 'Test Company' };
      const validated = validateVendorUpdate(data);
      expect(validated).toEqual(data);
    });

    it('should throw ZodError for invalid input', () => {
      expect(() => validateVendorUpdate({ companyName: 'A' })).toThrow();
    });
  });
});
