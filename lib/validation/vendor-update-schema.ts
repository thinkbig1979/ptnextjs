import { z } from 'zod';

/**
 * Validation schema for vendor profile update requests
 *
 * All fields are optional (PATCH semantics - partial updates)
 * Field-level validation matches Payload Vendors collection constraints
 */
export const vendorUpdateSchema = z.object({
  // Tier field (can be updated by vendor or admin)
  tier: z
    .enum(['free', 'tier1', 'tier2', 'tier3'])
    .optional(),

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

  // Brand Story Fields (Tier 1+)
  foundedYear: z
    .number()
    .int()
    .min(1800, 'Year must be after 1800')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional()
    .nullable(),

  longDescription: z
    .string()
    .max(5000, 'Description must not exceed 5000 characters')
    .optional()
    .nullable(),

  totalProjects: z
    .number()
    .int()
    .min(0, 'Total projects must be non-negative')
    .optional()
    .nullable(),

  employeeCount: z
    .number()
    .int()
    .min(0, 'Employee count must be non-negative')
    .optional()
    .nullable(),

  linkedinFollowers: z
    .number()
    .int()
    .min(0, 'LinkedIn followers must be non-negative')
    .optional()
    .nullable(),

  instagramFollowers: z
    .number()
    .int()
    .min(0, 'Instagram followers must be non-negative')
    .optional()
    .nullable(),

  clientSatisfactionScore: z
    .number()
    .min(0, 'Score must be between 0 and 100')
    .max(100, 'Score must be between 0 and 100')
    .optional()
    .nullable(),

  repeatClientPercentage: z
    .number()
    .min(0, 'Percentage must be between 0 and 100')
    .max(100, 'Percentage must be between 0 and 100')
    .optional()
    .nullable(),

  // Video Introduction Fields (Tier 1+)
  videoUrl: z
    .string()
    .url('Video URL must be a valid URL')
    .max(500, 'Video URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')),

  videoThumbnail: z
    .string()
    .url('Thumbnail must be a valid URL')
    .max(500, 'Thumbnail URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')),

  videoDuration: z
    .string()
    .max(10, 'Duration must not exceed 10 characters')
    .optional()
    .nullable(),

  videoTitle: z
    .string()
    .max(255, 'Video title must not exceed 255 characters')
    .optional()
    .nullable(),

  videoDescription: z
    .string()
    .max(1000, 'Video description must not exceed 1000 characters')
    .optional()
    .nullable(),

  // Arrays (Tier 1+)
  serviceAreas: z
    .array(z.string())
    .optional()
    .nullable(),

  companyValues: z
    .array(z.string())
    .optional()
    .nullable(),

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

  // Case Studies (Tier 1+)
  caseStudies: z
    .array(
      z.object({
        title: z.string().max(200).optional(),
        yachtName: z.string().max(200).optional().nullable(),
        yacht: z.string().optional().nullable(),
        projectDate: z.string().optional().nullable(),
        clientName: z.string().max(200).optional().nullable(),
        projectDescription: z.string().max(5000).optional().nullable(),
        challengeFaced: z.string().max(5000).optional().nullable(),
        solutionProvided: z.string().max(5000).optional().nullable(),
        challenge: z.string().max(5000).optional().nullable(),
        solution: z.string().max(5000).optional().nullable(),
        results: z.string().max(5000).optional().nullable(),
        testimonyQuote: z.string().max(1000).optional().nullable(),
        testimonyAuthor: z.string().max(200).optional().nullable(),
        testimonyRole: z.string().max(200).optional().nullable(),
        images: z.array(z.string().url()).optional().nullable(),
        featured: z.boolean().optional().nullable(),
      })
    )
    .optional()
    .nullable(),

  // Team Members (Tier 1+)
  teamMembers: z
    .array(
      z.object({
        name: z.string().max(200).optional(),
        role: z.string().max(200).optional(),
        bio: z.string().max(1000).optional().nullable(),
        photo: z.preprocess(
          (val) => (val === '' || val === null ? undefined : val),
          z.string().url('Invalid photo URL').optional()
        ),
        linkedinUrl: z.preprocess(
          (val) => (val === '' || val === null ? undefined : val),
          z.string().url('Invalid LinkedIn URL').optional()
        ),
        email: z.string().email('Invalid email address').optional().nullable(),
        displayOrder: z.number().int().min(0).optional().nullable(),
      })
    )
    .optional()
    .nullable(),
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
export function safeValidateVendorUpdate(data: unknown): z.SafeParseReturnType<unknown, VendorUpdateRequest> {
  return vendorUpdateSchema.safeParse(data);
}
