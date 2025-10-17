/**
 * Vendor transformation utilities for TinaCMS to Payload CMS migration
 *
 * Transforms vendor data from TinaCMS markdown frontmatter format to Payload CMS schema.
 * Handles field mapping, reference resolution, and data normalization.
 */

import type { Payload } from 'payload';
import {
  TransformResult,
  generateSlug,
  parseDate,
  resolveReference,
  resolveReferences,
  transformMediaPath,
  isValidEmail,
  isValidUrl,
} from './base';
import { markdownToLexical } from './markdown-to-lexical';

/**
 * TinaCMS vendor data structure
 * Represents the frontmatter fields from vendor markdown files
 */
export interface TinaCMSVendor {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  image?: string;
  website?: string;
  founded?: number;
  location?: string;
  featured?: boolean;
  partner?: boolean;

  // Contact information
  contactEmail?: string;
  contactPhone?: string;

  // Enhanced profile fields
  certifications?: Array<{
    name: string;
    issuingOrganization?: string;
    issuer?: string;
    year?: number;
    validUntil?: string;
    expiryDate?: string;
    verified?: boolean;
    logoUrl?: string;
    certificateNumber?: string;
    verificationUrl?: string;
  }>;

  awards?: Array<{
    title: string;
    organization?: string;
    year: number;
    category?: string;
    description?: string;
    imageUrl?: string;
    image?: string;
  }>;

  socialProof?: {
    linkedinFollowers?: number;
    instagramFollowers?: number;
    projectsCompleted?: number;
    totalProjects?: number;
    yearsInBusiness?: number;
    employeeCount?: number;
    testimonialsCount?: number;
    clientSatisfactionScore?: number;
    repeatClientPercentage?: number;
  };

  videoIntroduction?: {
    url?: string;
    videoUrl?: string;
    thumbnail?: string;
    thumbnailImage?: string;
    duration?: number;
    title?: string;
    description?: string;
  };

  caseStudies?: Array<{
    title: string;
    slug?: string;
    yachtName?: string;
    yacht?: string;
    projectDate?: string;
    challenge?: string;
    solution?: string;
    outcome?: string;
    results?: string;
    testimonyQuote?: string;
    testimonyAuthor?: string;
    testimonyRole?: string;
    technologies?: string[];
    imageUrl?: string;
    images?: Array<{ image?: string; url?: string }>;
    featured?: boolean;
  }>;

  innovationHighlights?: Array<{
    title: string;
    description?: string;
    year?: number;
    patentNumber?: string;
    technologies?: string[];
    benefits?: Array<{ benefit: string } | string>;
    imageUrl?: string;
    image?: string;
  }>;

  teamMembers?: Array<{
    name: string;
    role?: string;
    position?: string;
    bio?: string;
    photo?: string;
    image?: string;
    email?: string;
    linkedinUrl?: string;
    linkedin?: string;
    displayOrder?: number;
    expertise?: string[];
  }>;

  yachtProjects?: Array<{
    yachtName?: string;
    yacht?: string;
    role?: string;
    projectType?: string;
    completionDate?: string;
    completionYear?: number;
    systemsInstalled?: Array<{ system: string } | string>;
    systemsProvided?: string[];
    image?: string;
    featured?: boolean;
  }>;

  longDescription?: string;

  serviceAreas?: Array<{
    area?: string;
    service?: string;
    description?: string;
    icon?: string;
  }>;

  companyValues?: Array<{
    value: string;
    description?: string;
  }>;

  services?: string[];

  // Relations (TinaCMS file paths)
  category?: string;
  tags?: string[];

  // SEO
  seo?: {
    meta_title?: string;
    meta_description?: string;
    keywords?: string;
    og_image?: string;
  };
}

/**
 * Transforms TinaCMS vendor data to Payload CMS format
 *
 * CRITICAL DECISIONS:
 * - User relationship: Left as undefined (handled in migration scripts)
 * - Tier mapping: All TinaCMS vendors map to 'tier2' (full features)
 * - Social proof: Maps individual fields from socialProof object to flat Payload fields
 *
 * @param tinaCMSData - Vendor data from TinaCMS markdown frontmatter
 * @param payload - Payload CMS instance for reference resolution
 * @returns Transformation result with Payload vendor data or error
 */
/**
 * Payload Vendor type (simplified interface matching schema)
 */
export interface PayloadVendor {
  id?: string;
  user?: string;
  tier: 'free' | 'tier1' | 'tier2';
  companyName: string;
  slug: string;
  description?: string;
  logo?: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  certifications?: any[];
  awards?: any[];
  totalProjects?: number;
  yearsInBusiness?: number;
  employeeCount?: number;
  linkedinFollowers?: number;
  instagramFollowers?: number;
  clientSatisfactionScore?: number;
  repeatClientPercentage?: number;
  videoUrl?: string;
  videoThumbnail?: any;
  videoDuration?: number;
  videoTitle?: string;
  videoDescription?: string;
  caseStudies?: any[];
  innovationHighlights?: any[];
  teamMembers?: any[];
  yachtProjects?: any[];
  longDescription?: any;
  serviceAreas?: any[];
  companyValues?: any[];
  featured: boolean;
  published: boolean;
  [key: string]: any;
}

export async function transformVendorFromMarkdown(
  tinaCMSData: TinaCMSVendor,
  payload: Payload
): Promise<TransformResult<Partial<PayloadVendor>>> {
  const warnings: string[] = [];

  try {
    // Basic Information (Required)
    const companyName = tinaCMSData.name;
    if (!companyName) {
      return {
        success: false,
        error: 'Vendor name is required',
      };
    }

    const slug = tinaCMSData.slug || generateSlug(companyName);
    const description = tinaCMSData.description || '';
    const logo = transformMediaPath(tinaCMSData.logo);

    // Contact Information
    const contactEmail = tinaCMSData.contactEmail;
    if (contactEmail && !isValidEmail(contactEmail)) {
      warnings.push(`Invalid email format: ${contactEmail}`);
    }

    // Website validation
    const website = tinaCMSData.website;
    if (website && !isValidUrl(website)) {
      warnings.push(`Invalid website URL: ${website}`);
    }

    // Transform certifications array
    const certifications = tinaCMSData.certifications?.map(cert => ({
      name: cert.name,
      issuer: cert.issuingOrganization || cert.issuer || '',
      year: cert.year,
      expiryDate: cert.validUntil || cert.expiryDate,
      certificateNumber: cert.certificateNumber,
      logo: undefined, // Media upload - handle in migration
      verificationUrl: cert.verificationUrl,
    }));

    // Transform awards array
    const awards = tinaCMSData.awards?.map(award => ({
      title: award.title,
      organization: award.organization || '',
      year: award.year,
      category: award.category,
      description: award.description,
      image: undefined, // Media upload - handle in migration
    }));

    // Map social proof fields to flat structure
    const socialProof = tinaCMSData.socialProof;
    const totalProjects = socialProof?.projectsCompleted || socialProof?.totalProjects;
    const yearsInBusiness = socialProof?.yearsInBusiness;
    const employeeCount = socialProof?.employeeCount;
    const linkedinFollowers = socialProof?.linkedinFollowers;
    const instagramFollowers = socialProof?.instagramFollowers;
    const clientSatisfactionScore = socialProof?.clientSatisfactionScore;
    const repeatClientPercentage = socialProof?.repeatClientPercentage;

    // Transform video introduction
    const videoIntro = tinaCMSData.videoIntroduction;
    const videoUrl = videoIntro?.url || videoIntro?.videoUrl;
    const videoThumbnail = undefined; // Media upload - handle in migration
    const videoDuration = videoIntro?.duration;
    const videoTitle = videoIntro?.title;
    const videoDescription = videoIntro?.description;

    // Transform case studies
    const caseStudies = tinaCMSData.caseStudies?.map(study => {
      // Convert Markdown to Lexical for rich text fields
      const challenge = study.challenge ? markdownToLexical(study.challenge) : undefined;
      const solution = study.solution ? markdownToLexical(study.solution) : undefined;
      const results = markdownToLexical(study.outcome || study.results || '');

      return {
        title: study.title,
        yachtName: study.yachtName,
        yacht: undefined, // Relationship - resolve in migration if needed
        projectDate: parseDate(study.projectDate) || new Date(),
        challenge,
        solution,
        results,
        testimonyQuote: study.testimonyQuote,
        testimonyAuthor: study.testimonyAuthor,
        testimonyRole: study.testimonyRole,
        images: [], // Media uploads - handle in migration
        featured: study.featured || false,
      };
    });

    // Transform innovation highlights
    const innovationHighlights = tinaCMSData.innovationHighlights?.map(innovation => {
      const description = innovation.description
        ? markdownToLexical(innovation.description)
        : markdownToLexical('');

      // Normalize benefits array
      const benefits = innovation.benefits?.map(b => {
        if (typeof b === 'string') {
          return { benefit: b };
        }
        return b;
      }) || [];

      return {
        title: innovation.title,
        description,
        year: innovation.year,
        patentNumber: innovation.patentNumber,
        benefits,
        image: undefined, // Media upload - handle in migration
      };
    });

    // Transform team members
    const teamMembers = tinaCMSData.teamMembers?.map(member => ({
      name: member.name,
      role: member.role || member.position || '',
      bio: member.bio,
      photo: undefined, // Media upload - handle in migration
      linkedinUrl: member.linkedinUrl || member.linkedin,
      email: member.email,
      displayOrder: member.displayOrder || 0,
    }));

    // Transform yacht projects
    const yachtProjects = tinaCMSData.yachtProjects?.map(project => {
      // Normalize systems array
      let systems: string[] = [];
      if (project.systemsInstalled) {
        systems = project.systemsInstalled.map(s =>
          typeof s === 'string' ? s : s.system
        );
      } else if (project.systemsProvided) {
        systems = project.systemsProvided;
      }

      return {
        yacht: undefined, // Relationship - resolve in migration if needed
        yachtName: project.yachtName,
        role: project.role || project.projectType || '',
        completionDate: parseDate(
          project.completionDate ||
          (project.completionYear ? `${project.completionYear}-01-01` : undefined)
        ),
        systemsInstalled: systems.map(s => ({ system: s })),
        image: undefined, // Media upload - handle in migration
        featured: project.featured || false,
      };
    });

    // Transform long description to Lexical
    const longDescription = tinaCMSData.longDescription
      ? markdownToLexical(tinaCMSData.longDescription)
      : undefined;

    // Transform service areas
    const serviceAreas = tinaCMSData.serviceAreas?.map(area => ({
      area: area.area || area.service || '',
      description: area.description,
      icon: area.icon,
    }));

    // Transform company values
    const companyValues = tinaCMSData.companyValues?.map(value => ({
      value: value.value,
      description: value.description,
    }));

    // Resolve category reference
    const categoryId = tinaCMSData.category
      ? await resolveReference(tinaCMSData.category, 'categories', payload)
      : null;

    if (tinaCMSData.category && !categoryId) {
      warnings.push(`Failed to resolve category reference: ${tinaCMSData.category}`);
    }

    // Resolve tag references
    const tagIds = tinaCMSData.tags
      ? await resolveReferences(tinaCMSData.tags, 'tags', payload)
      : [];

    if (tinaCMSData.tags && tagIds.length < tinaCMSData.tags.length) {
      warnings.push(`Failed to resolve some tag references`);
    }

    // Build Payload vendor object
    const payloadVendor: Partial<PayloadVendor> = {
      // User relationship - left undefined (handled in migration scripts)
      user: undefined,

      // Tier mapping - all TinaCMS vendors get tier2 (full features)
      tier: 'tier2',

      // Basic information
      companyName,
      slug,
      description,
      logo,
      contactEmail: contactEmail || '',
      contactPhone: tinaCMSData.contactPhone,

      // Enhanced profile fields (Tier 1+)
      website,
      linkedinUrl: undefined, // Map from social media if available
      twitterUrl: undefined,  // Map from social media if available
      certifications,
      awards,

      // Social proof (flat fields)
      totalProjects,
      yearsInBusiness,
      employeeCount,
      linkedinFollowers,
      instagramFollowers,
      clientSatisfactionScore,
      repeatClientPercentage,

      // Video introduction
      videoUrl,
      videoThumbnail,
      videoDuration,
      videoTitle,
      videoDescription,

      // Arrays
      caseStudies,
      innovationHighlights,
      teamMembers,
      yachtProjects,
      longDescription,
      serviceAreas,
      companyValues,

      // Metadata
      featured: tinaCMSData.featured || false,
      published: true, // TinaCMS vendors are considered published

      // SEO - not included in Payload Vendors schema
      // Will be handled separately if needed
    };

    return {
      success: true,
      data: payloadVendor,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: `Transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
