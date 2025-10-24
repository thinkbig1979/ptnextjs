import { z } from 'zod';

/**
 * Validation schema for vendor profile update requests
 *
 * All fields are optional (PATCH semantics - partial updates)
 * Field-level validation matches Payload Vendors collection constraints
 */
export const vendorUpdateSchema = z.object({
  // Basic Information (Free tier)
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters')
    .optional(),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  logo: z
    .string()
    .url('Logo must be a valid URL')
    .max(500, 'Logo URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')), // Allow empty string to clear logo

  contactEmail: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .optional(),

  contactPhone: z
    .string()
    .max(50, 'Phone number must not exceed 50 characters')
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      'Invalid phone number format'
    ),

  // Enhanced Profile Fields (Tier 1+)
  website: z
    .string()
    .url('Website must be a valid URL')
    .max(500, 'Website URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')), // Allow empty string to clear website

  linkedinUrl: z
    .string()
    .url('LinkedIn URL must be a valid URL')
    .max(500, 'LinkedIn URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')),

  twitterUrl: z
    .string()
    .url('Twitter URL must be a valid URL')
    .max(500, 'Twitter URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')),

  certifications: z
    .string()
    .max(1000, 'Certifications must not exceed 1000 characters')
    .optional(),

  // Multi-location support (Tier 2+)
  locations: z
    .array(
      z.object({
        id: z.string().optional(),
        locationName: z.string().max(255, 'Location name must not exceed 255 characters').optional(),
        address: z.string().max(500, 'Address must not exceed 500 characters').optional(),
        city: z.string().max(255, 'City must not exceed 255 characters').optional(),
        country: z.string().max(255, 'Country must not exceed 255 characters').optional(),
        postalCode: z.string().max(20, 'Postal code must not exceed 20 characters').optional(),
        latitude: z
          .number()
          .min(-90, 'Latitude must be between -90 and 90')
          .max(90, 'Latitude must be between -90 and 90')
          .optional(),
        longitude: z
          .number()
          .min(-180, 'Longitude must be between -180 and 180')
          .max(180, 'Longitude must be between -180 and 180')
          .optional(),
        isHQ: z.boolean().optional(),
      })
    )
    .optional()
    .refine(
      (locations) => {
        if (!locations || locations.length === 0) return true;
        const hqCount = locations.filter((loc) => loc.isHQ === true).length;
        return hqCount <= 1;
      },
      {
        message: 'Only one location can be designated as Headquarters',
      }
    ),
});

export type VendorUpdateRequest = z.infer<typeof vendorUpdateSchema>;

/**
 * Validate vendor update request data
 *
 * @param data - The request data to validate
 * @returns Parsed and validated data
 * @throws ZodError if validation fails
 */
export function validateVendorUpdate(data: unknown): VendorUpdateRequest {
  return vendorUpdateSchema.parse(data);
}

/**
 * Safe validation that returns success/error result
 */
export function safeValidateVendorUpdate(data: unknown) {
  return vendorUpdateSchema.safeParse(data);
}
