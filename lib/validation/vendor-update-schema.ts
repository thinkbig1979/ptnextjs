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

  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .nullable(),

  logo: z
    .string()
    .url('Logo must be a valid URL')
    .max(500, 'Logo URL must not exceed 500 characters')
    .optional()
    .nullable()
    .or(z.literal('')), // Allow empty string or null to clear logo

  contactEmail: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters')
    .optional(),

  contactPhone: z
    .string()
    .max(50, 'Phone number must not exceed 50 characters')
    .optional()
    .nullable()
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
    .nullable()
    .or(z.literal('')), // Allow empty string or null to clear website

  linkedinUrl: z
    .string()
    .url('LinkedIn URL must be a valid URL')
    .max(500, 'LinkedIn URL must not exceed 500 characters')
    .optional()
    .nullable()
    .or(z.literal('')),

  twitterUrl: z
    .string()
    .url('Twitter URL must be a valid URL')
    .max(500, 'Twitter URL must not exceed 500 characters')
    .optional()
    .nullable()
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
    .nullable()
    .or(z.literal('')),

  videoThumbnail: z
    .string()
    .url('Thumbnail must be a valid URL')
    .max(500, 'Thumbnail URL must not exceed 500 characters')
    .optional()
    .nullable()
    .or(z.literal('')),

  // videoDuration: Payload expects number (seconds), but frontend may send
  // string (e.g., "5:30") or number (after filterVendorPayload coercion)
  videoDuration: z
    .union([
      z.string().max(10, 'Duration must not exceed 10 characters'),
      z.number().int().min(0),
    ])
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

  // Arrays (Tier 1+) - Accept both string arrays (simple) and object arrays (from Payload CMS)
  serviceAreas: z
    .array(
      z.union([
        z.string(),
        z.object({
          id: z.string().optional().nullable(),
          area: z.string().max(255).optional().nullable(),
          description: z.string().max(1000).optional().nullable(),
          icon: z.union([z.string(), z.number(), z.null()]).optional(), // Can be media ID or null
        }),
      ])
    )
    .optional()
    .nullable(),

  companyValues: z
    .array(
      z.union([
        z.string(),
        z.object({
          id: z.string().optional().nullable(),
          value: z.string().max(255).optional().nullable(),
          description: z.string().max(1000).optional().nullable(),
        }),
      ])
    )
    .optional()
    .nullable(),

  // Certifications array (Tier 1+) - matches Payload Vendors collection schema
  certifications: z
    .array(
      z.object({
        id: z.string().optional().nullable(),
        name: z.string().max(255).optional().nullable(),
        issuer: z.string().max(255).optional().nullable(),
        year: z.number().int().optional().nullable(),
        expiryDate: z.string().optional().nullable(),
        certificateNumber: z.string().max(255).optional().nullable(),
        // Component uses 'certificateUrl', Payload expects 'verificationUrl' - accept both
        certificateUrl: z.string().max(500).optional().nullable(),
        verificationUrl: z.string().max(500).optional().nullable(),
        // Logo is an upload field - can be media ID (number), URL string, or media object
        logo: z.union([z.string(), z.number(), z.null()]).optional(),
      })
    )
    .optional()
    .nullable(),

  // Awards array (Tier 1+) - matches Payload Vendors collection schema
  awards: z
    .array(
      z.object({
        id: z.string().optional().nullable(),
        title: z.string().max(255).optional().nullable(),
        organization: z.string().max(255).optional().nullable(),
        year: z.number().int().optional().nullable(),
        category: z.string().max(255).optional().nullable(),
        description: z.string().max(1000).optional().nullable(),
        // Image is an upload field - can be media ID (number), URL string, or media object
        image: z.union([z.string(), z.number(), z.null()]).optional(),
      })
    )
    .optional()
    .nullable(),

  // Media Gallery array (Tier 1+) - matches Payload Vendors collection schema
  mediaGallery: z
    .array(
      z.object({
        id: z.string().optional().nullable(),
        type: z.enum(['image', 'video']).optional(),
        // Media is an upload field - can be media ID (number), URL string, or media object
        media: z.union([z.string(), z.number(), z.null()]).optional(),
        // Component uses 'url' for various purposes - accept it
        url: z.string().max(500).optional().nullable(),
        videoUrl: z.string().max(500).optional().nullable(),
        caption: z.string().max(500).optional().nullable(),
        altText: z.string().max(255).optional().nullable(),
        album: z.string().max(255).optional().nullable(),
        order: z.number().int().min(0).optional().nullable(),
      })
    )
    .optional()
    .nullable(),

  // Multi-location support (Tier 2+)
  locations: z
    .array(
      z.object({
        id: z.string().optional().nullable(),
        locationName: z.string().max(255, 'Location name must not exceed 255 characters').optional().nullable(),
        address: z.string().max(500, 'Address must not exceed 500 characters').optional().nullable(),
        city: z.string().max(255, 'City must not exceed 255 characters').optional().nullable(),
        country: z.string().max(255, 'Country must not exceed 255 characters').optional().nullable(),
        postalCode: z.string().max(20, 'Postal code must not exceed 20 characters').optional().nullable(),
        latitude: z
          .number()
          .min(-90, 'Latitude must be between -90 and 90')
          .max(90, 'Latitude must be between -90 and 90')
          .optional()
          .nullable(),
        longitude: z
          .number()
          .min(-180, 'Longitude must be between -180 and 180')
          .max(180, 'Longitude must be between -180 and 180')
          .optional()
          .nullable(),
        isHQ: z.boolean().optional().nullable(),
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
        id: z.string().optional().nullable(),
        title: z.string().max(200).optional().nullable(),
        yachtName: z.string().max(200).optional().nullable(),
        yacht: z.union([z.string(), z.number(), z.null()]).optional(), // Can be yacht ID
        // projectDate: form sends "YYYY-MM" or "" (empty). Coerce empty to undefined.
        projectDate: z.preprocess(
          (val) => (val === '' || val === null ? undefined : val),
          z.string().optional()
        ),
        clientName: z.string().max(200).optional().nullable(),
        projectDescription: z.string().max(5000).optional().nullable(),
        challengeFaced: z.string().max(5000).optional().nullable(),
        solutionProvided: z.string().max(5000).optional().nullable(),
        // challenge/solution/results: Accept string (plain text from form) or
        // Lexical JSON object (from existing data). VendorProfileService converts
        // plain text to Lexical JSON server-side before saving to Payload.
        challenge: z.union([z.string().max(5000), z.record(z.unknown())]).optional().nullable(),
        solution: z.union([z.string().max(5000), z.record(z.unknown())]).optional().nullable(),
        results: z.union([z.string().max(5000), z.record(z.unknown())]).optional().nullable(),
        testimonyQuote: z.string().max(1000).optional().nullable(),
        testimonyAuthor: z.string().max(200).optional().nullable(),
        testimonyRole: z.string().max(200).optional().nullable(),
        // Images can be: URL strings, media IDs (numbers), or objects with image field
        images: z.array(
          z.union([
            z.string().url(),
            z.number(),
            z.object({
              id: z.string().optional().nullable(),
              image: z.union([z.string(), z.number(), z.null()]).optional(),
            }),
          ])
        ).optional().nullable(),
        featured: z.boolean().optional().nullable(),
      })
    )
    .optional()
    .nullable(),

  // Team Members (Tier 1+)
  // Note: Component uses 'linkedin'/'image'/'order', Payload uses 'linkedinUrl'/'photo'/'displayOrder'.
  // Accept both naming conventions - VendorProfileService transforms to Payload names server-side.
  teamMembers: z
    .array(
      z.object({
        id: z.string().optional().nullable(),
        name: z.string().max(200).optional().nullable(),
        role: z.string().max(200).optional().nullable(),
        bio: z.string().max(2000).optional().nullable(), // Payload allows 2000 chars
        // Photo/image: Payload field is 'photo', component sends 'image' - accept both
        photo: z.preprocess(
          (val) => (val === '' || val === null ? undefined : val),
          z.union([
            z.string().url('Invalid photo URL'),
            z.number(), // media ID
            z.object({ id: z.number().optional(), url: z.string().optional() }), // media object
          ]).optional()
        ),
        image: z.preprocess(
          (val) => (val === '' || val === null ? undefined : val),
          z.union([
            z.string().url('Invalid image URL'),
            z.number(),
          ]).optional()
        ),
        // LinkedIn: Payload field is 'linkedinUrl', component sends 'linkedin' - accept both
        linkedinUrl: z.preprocess(
          (val) => (val === '' || val === null ? undefined : val),
          z.string().url('Invalid LinkedIn URL').max(500).optional()
        ),
        linkedin: z.preprocess(
          (val) => (val === '' || val === null ? undefined : val),
          z.string().url('Invalid LinkedIn URL').max(500).optional()
        ),
        email: z.string().email('Invalid email address').optional().nullable(),
        // Display order: Payload field is 'displayOrder', component sends 'order' - accept both
        displayOrder: z.number().int().min(0).optional().nullable(),
        order: z.number().int().min(0).optional().nullable(),
        // Synthetic fields from component - not persisted but may be present
        createdAt: z.string().optional().nullable(),
        updatedAt: z.string().optional().nullable(),
      })
    )
    .optional()
    .nullable(),
});

type VendorUpdateRequest = z.infer<typeof vendorUpdateSchema>;

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
