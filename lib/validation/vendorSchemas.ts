import { z } from 'zod';

/**
 * Vendor validation schemas for frontend forms
 */

// Basic Info Form Schema
export const basicInfoSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name must be less than 100 characters'),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  // Allow empty strings, null, or undefined - only validate URL format if value is provided
  logo: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('Invalid logo URL').optional()
  ),
  contactEmail: z.string().email('Invalid email address'),
  // Allow empty strings, null, or undefined for optional phone
  contactPhone: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number must be less than 20 characters').optional()
  ),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

// Brand Story Form Schema
export const brandStorySchema = z.object({
  website: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('Invalid website URL').optional()
  ),
  linkedinUrl: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('Invalid LinkedIn URL').optional()
  ),
  twitterUrl: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('Invalid Twitter URL').optional()
  ),
  foundedYear: z.number().int().min(1800, 'Year must be after 1800').max(new Date().getFullYear(), 'Year cannot be in the future').optional().nullable(),
  longDescription: z.string().max(5000, 'Description must be less than 5000 characters').optional().nullable(),

  // Social proof metrics
  totalProjects: z.number().int().min(0).optional().nullable(),
  employeeCount: z.number().int().min(0).optional().nullable(),
  linkedinFollowers: z.number().int().min(0).optional().nullable(),
  instagramFollowers: z.number().int().min(0).optional().nullable(),
  clientSatisfactionScore: z.number().min(0).max(100, 'Score must be between 0 and 100').optional().nullable(),
  repeatClientPercentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100').optional().nullable(),

  // Video introduction
  videoUrl: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('Invalid video URL').optional()
  ),
  videoThumbnail: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('Invalid thumbnail URL').optional()
  ),
  videoDuration: z.string().max(10).optional().nullable(),
  videoTitle: z.string().max(200).optional().nullable(),
  videoDescription: z.string().max(1000).optional().nullable(),

  // Arrays - accept both string arrays (form input) and object arrays (from Payload CMS)
  serviceAreas: z.array(
    z.union([
      z.string(),
      z.object({
        id: z.string().optional(),
        area: z.string().max(255).optional(),
        description: z.string().max(1000).optional().nullable(),
        icon: z.union([z.string(), z.number(), z.null()]).optional(),
      }),
    ])
  ),
  companyValues: z.array(
    z.union([
      z.string(),
      z.object({
        id: z.string().optional(),
        value: z.string().max(255).optional(),
        description: z.string().max(1000).optional().nullable(),
      }),
    ])
  ),
});

export type BrandStoryFormData = z.infer<typeof brandStorySchema>;

// Certification Schema
export const certificationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  issuer: z.string().min(2, 'Issuer must be at least 2 characters').max(200),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  expiryDate: z.string().optional().nullable(),
  certificateNumber: z.string().max(100).optional().nullable(),
  logo: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('Invalid logo URL').optional()
  ),
  verificationUrl: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('Invalid verification URL').optional()
  ),
});

export type CertificationFormData = z.infer<typeof certificationSchema>;

// Award Schema
export const awardSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  organization: z.string().min(2, 'Organization must be at least 2 characters').max(200),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  category: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  image: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('Invalid image URL').optional()
  ),
});

export type AwardFormData = z.infer<typeof awardSchema>;

// Case Study Schema
export const caseStudySchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  yachtName: z.string().max(200).optional().nullable(),
  yacht: z.string().optional().nullable(), // Yacht relationship ID
  projectDate: z.string().optional().nullable(),
  challenge: z.string().min(10).max(5000),
  solution: z.string().min(10).max(5000),
  results: z.string().min(10).max(5000),
  testimonyQuote: z.string().max(1000).optional().nullable(),
  testimonyAuthor: z.string().max(200).optional().nullable(),
  testimonyRole: z.string().max(200).optional().nullable(),
  images: z.array(z.string().url()).optional().nullable(),
  featured: z.boolean().optional().nullable(),
});

export type CaseStudyFormData = z.infer<typeof caseStudySchema>;

// Team Member Schema
export const teamMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  role: z.string().min(2, 'Role must be at least 2 characters').max(200),
  bio: z.string().max(2000).optional().nullable(),
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
});

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

// Location Schema - matches vendor-update-schema.ts API contract
export const locationSchema = z.object({
  id: z.string().optional(),
  locationName: z.string().min(2).max(255).optional().nullable(),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
  city: z.string().min(2).max(255),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().min(2, 'Country is required').max(255),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isHQ: z.boolean().optional().nullable(),
});

export type LocationFormData = z.infer<typeof locationSchema>;
