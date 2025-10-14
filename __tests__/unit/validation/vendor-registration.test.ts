import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';

// Import validation schema (mirrored from route handler)
const vendorRegistrationSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters'),
  contactEmail: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters'),
  contactPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      'Invalid phone number format'
    ),
  password: z.string().min(12, 'Password must be at least 12 characters'),
});

// Slug generation function (mirrored from route handler)
function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

describe('Vendor Registration Validation', () => {
  describe('Request Validation', () => {
    it('should validate correct input', () => {
      const validInput = {
        companyName: 'Test Company',
        contactEmail: 'test@example.com',
        contactPhone: '+1-234-567-8900',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate input without optional phone', () => {
      const validInput = {
        companyName: 'Test Company',
        contactEmail: 'test@example.com',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject missing companyName', () => {
      const invalidInput = {
        contactEmail: 'test@example.com',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path[0]).toBe('companyName');
      }
    });

    it('should reject missing contactEmail', () => {
      const invalidInput = {
        companyName: 'Test Company',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path[0]).toBe('contactEmail');
      }
    });

    it('should reject missing password', () => {
      const invalidInput = {
        companyName: 'Test Company',
        contactEmail: 'test@example.com',
      };

      const result = vendorRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path[0]).toBe('password');
      }
    });
  });

  describe('Company Name Validation', () => {
    it('should reject company name too short (< 2 chars)', () => {
      const invalidInput = {
        companyName: 'A',
        contactEmail: 'test@example.com',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject company name too long (> 100 chars)', () => {
      const invalidInput = {
        companyName: 'A'.repeat(101),
        contactEmail: 'test@example.com',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('not exceed 100 characters');
      }
    });

    it('should accept company name at minimum length (2 chars)', () => {
      const validInput = {
        companyName: 'AB',
        contactEmail: 'test@example.com',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept company name at maximum length (100 chars)', () => {
      const validInput = {
        companyName: 'A'.repeat(100),
        contactEmail: 'test@example.com',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('Email Validation', () => {
    it('should reject invalid email format', () => {
      const invalidInput = {
        companyName: 'Test Company',
        contactEmail: 'not-an-email',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid email format');
      }
    });

    it('should reject email without @ symbol', () => {
      const invalidInput = {
        companyName: 'Test Company',
        contactEmail: 'testexample.com',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject email without domain', () => {
      const invalidInput = {
        companyName: 'Test Company',
        contactEmail: 'test@',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test.email.with.dots@example.com',
      ];

      validEmails.forEach((email) => {
        const input = {
          companyName: 'Test Company',
          contactEmail: email,
          password: 'SecurePass123!@#',
        };
        const result = vendorRegistrationSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    it('should reject email too long (> 255 chars)', () => {
      const longEmail = 'a'.repeat(246) + '@example.com'; // Total 258 chars
      const invalidInput = {
        companyName: 'Test Company',
        contactEmail: longEmail,
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('not exceed 255 characters');
      }
    });
  });

  describe('Phone Number Validation', () => {
    it('should accept valid phone formats', () => {
      const validPhones = [
        '+1-234-567-8900',
        '(123) 456-7890',
        '123-456-7890',
        '+44 20 1234 5678',
        '1234567890',
      ];

      validPhones.forEach((phone) => {
        const input = {
          companyName: 'Test Company',
          contactEmail: 'test@example.com',
          contactPhone: phone,
          password: 'SecurePass123!@#',
        };
        const result = vendorRegistrationSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    it('should reject phone with letters', () => {
      const invalidInput = {
        companyName: 'Test Company',
        contactEmail: 'test@example.com',
        contactPhone: '123-ABC-7890',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid phone number format');
      }
    });

    it('should reject phone with special characters (except allowed)', () => {
      const invalidInput = {
        companyName: 'Test Company',
        contactEmail: 'test@example.com',
        contactPhone: '123@456#7890',
        password: 'SecurePass123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should reject password too short (< 12 chars)', () => {
      const invalidInput = {
        companyName: 'Test Company',
        contactEmail: 'test@example.com',
        password: 'Short1!',
      };

      const result = vendorRegistrationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 12 characters');
      }
    });

    it('should accept password at minimum length (12 chars)', () => {
      const validInput = {
        companyName: 'Test Company',
        contactEmail: 'test@example.com',
        password: 'Pass12345678',
      };

      const result = vendorRegistrationSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept long passwords', () => {
      const validInput = {
        companyName: 'Test Company',
        contactEmail: 'test@example.com',
        password: 'ThisIsAVeryLongPasswordThatShouldStillBeValid123!@#',
      };

      const result = vendorRegistrationSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('Slug Generation', () => {
    it('should generate slug from simple company name', () => {
      expect(generateSlug('Test Company')).toBe('test-company');
    });

    it('should handle company names with special characters', () => {
      expect(generateSlug('Test & Company!')).toBe('test-company');
    });

    it('should handle company names with multiple spaces', () => {
      expect(generateSlug('Test   Company   Inc')).toBe('test-company-inc');
    });

    it('should handle company names with numbers', () => {
      expect(generateSlug('Company 123')).toBe('company-123');
    });

    it('should handle company names with hyphens', () => {
      expect(generateSlug('Test-Company')).toBe('test-company');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(generateSlug('---Test Company---')).toBe('test-company');
    });

    it('should handle company names with mixed case', () => {
      expect(generateSlug('TeSt CoMpAnY')).toBe('test-company');
    });

    it('should handle company names with dots', () => {
      expect(generateSlug('Test.Company.Inc.')).toBe('test-company-inc');
    });

    it('should handle company names with apostrophes', () => {
      expect(generateSlug("Test's Company")).toBe('test-s-company');
    });

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('');
    });

    it('should handle all special characters', () => {
      expect(generateSlug('!@#$%^&*()')).toBe('');
    });
  });
});
