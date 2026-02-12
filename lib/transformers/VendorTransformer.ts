/**
 * Vendor Transformer
 * Transforms Payload vendor documents to the Vendor type
 */

import type {
  Vendor,
  VendorAward,
  VendorSocialProof,
  VendorInnovationHighlight,
  VendorYachtProject,
  VendorReview,
  VendorLocation,
  TeamMember,
  VendorService,
  ServiceArea,
  CompanyValue,
} from '../types';
import type { PayloadVendorDocument, PayloadRecord, PayloadLexicalDocument } from './PayloadTypes';
import { transformMediaPath } from './MediaTransformer';
import { transformLexicalToHtml } from './LexicalTransformer';

/**
 * Transforms a Payload vendor document to the Vendor type
 *
 * @param doc - Payload vendor document from database
 * @returns Transformed Vendor object
 */
export function transformPayloadVendor(doc: PayloadVendorDocument): Vendor {
  // ============================================================================
  // SECTION 1: CERTIFICATIONS ARRAY - Transform logo media paths
  // ============================================================================
  const certifications = doc.certifications?.map((cert: PayloadRecord) => ({
    name: cert.name || '',
    issuer: cert.issuer || '',
    issuedDate: cert.year ? `${cert.year}` : undefined,
    expiryDate: cert.expiryDate || undefined,
    credentialId: cert.certificateNumber || undefined,
    credentialUrl: cert.verificationUrl || undefined,
    logo: cert.logo?.url ? transformMediaPath(cert.logo.url) : undefined,
  })) || [];

  // ============================================================================
  // SECTION 2: AWARDS ARRAY - Transform image media paths
  // ============================================================================
  const awards: VendorAward[] = doc.awards?.map((award: PayloadRecord) => ({
    title: award.title || '',
    year: award.year || 0,
    organization: award.organization || undefined,
    category: award.category || undefined,
    description: award.description || undefined,
  })) || [];

  // ============================================================================
  // SECTION 3: SOCIAL PROOF GROUP - Preserve all numeric fields
  // ============================================================================
  const socialProof: VendorSocialProof | undefined = doc.totalProjects || doc.clientSatisfactionScore || doc.repeatClientPercentage ? {
    projectsCompleted: doc.totalProjects || undefined,
    yearsInBusiness: doc.yearsInBusiness || undefined,
    followers: doc.linkedinFollowers || doc.instagramFollowers || undefined,
    customerList: undefined, // Not in Payload schema
  } : undefined;

  // ============================================================================
  // SECTION 4: VIDEO INTRO GROUP - Transform thumbnail media path
  // ============================================================================
  const videoIntroduction = doc.videoUrl ? {
    videoUrl: doc.videoUrl || '',
    duration: doc.videoDuration || undefined,
    thumbnail: doc.videoThumbnail?.url ? transformMediaPath(doc.videoThumbnail.url) : undefined,
    transcript: undefined, // Not in Payload schema
  } : undefined;

  // ============================================================================
  // SECTION 5: CASE STUDIES ARRAY - Transform Lexical content, resolve yacht relationships, transform thumbnails
  // ============================================================================
  const caseStudies = doc.caseStudies?.map((cs: PayloadRecord) => ({
    title: cs.title || '',
    client: cs.yachtName || undefined,
    yacht: cs.yacht?.id?.toString() || undefined,
    industry: undefined, // Not in Payload schema
    challenge: transformLexicalToHtml(cs.challenge),
    solution: transformLexicalToHtml(cs.solution),
    results: transformLexicalToHtml(cs.results),
    metrics: undefined, // Not in Payload schema
    thumbnail: cs.images?.[0]?.image?.url ? transformMediaPath(cs.images[0].image.url) : undefined,
    pdfUrl: undefined, // Not in Payload schema
    publishedDate: cs.projectDate || undefined,
  })) || [];

  // ============================================================================
  // SECTION 6: INNOVATIONS ARRAY - Transform Lexical description, transform image
  // ============================================================================
  const innovationHighlights: VendorInnovationHighlight[] = doc.innovationHighlights?.map((innovation: PayloadRecord) => ({
    technology: innovation.title || '',
    description: transformLexicalToHtml(innovation.description),
    uniqueApproach: innovation.patentNumber || undefined,
    benefitsToClients: innovation.benefits?.map((b: PayloadRecord) => b.benefit) || undefined,
  })) || [];

  // ============================================================================
  // SECTION 7: TEAM MEMBERS ARRAY - Transform photo media path
  // ============================================================================
  const teamMembers: TeamMember[] = doc.teamMembers?.map((member: PayloadRecord) => ({
    id: member.id?.toString() || `member-${Date.now()}`,
    name: member.name || '',
    role: member.role || '',
    bio: member.bio || '',
    image: member.photo?.url ? transformMediaPath(member.photo.url) : undefined,
    linkedin: member.linkedinUrl || undefined,
  })) || [];

  // ============================================================================
  // SECTION 8: YACHT PROJECTS ARRAY - Resolve yacht relationships, transform image
  // ============================================================================
  const yachtProjects: VendorYachtProject[] = doc.yachtProjects?.map((project: PayloadRecord) => ({
    yachtName: project.yacht?.name || '',
    systems: project.systemsInstalled?.map((s: PayloadRecord) => s.system) || [],
    projectYear: project.completionDate ? new Date(project.completionDate).getFullYear() : undefined,
    role: project.role || undefined,
    description: project.description || undefined,
  })) || [];

  // ============================================================================
  // SECTION 9: LOCATIONS ARRAY - Multi-location support (Tier 2+)
  // ============================================================================
  const locations: VendorLocation[] | undefined = doc.locations?.map((loc: PayloadRecord) => ({
    id: loc.id || undefined,
    locationName: loc.locationName || undefined,
    address: loc.address || '',
    city: loc.city || '',
    state: loc.state || undefined,
    postalCode: loc.postalCode || undefined,
    country: loc.country || '',
    latitude: loc.latitude,
    longitude: loc.longitude,
    isHQ: loc.isHQ || false,
  })) || undefined;

  // ============================================================================
  // SECTION 11: VENDOR REVIEWS ARRAY - Transform review data
  // ============================================================================
  const vendorReviews: VendorReview[] = doc.vendorReviews?.map((review: PayloadRecord) => ({
    id: review.id?.toString() || '',
    vendorId: doc.id?.toString() || '',
    reviewerName: review.reviewerName || '',
    reviewerRole: review.reviewerRole || '',
    yachtName: review.yachtName,
    projectType: review.projectType,
    overallRating: review.overallRating || 0,
    ratings: {
      quality: review.ratings?.quality,
      communication: review.ratings?.communication,
      timeliness: review.ratings?.timeliness,
      professionalism: review.ratings?.professionalism,
      valueForMoney: review.ratings?.valueForMoney,
    },
    reviewText: review.reviewText,
    reviewDate: review.reviewDate,
    verified: review.verified || false,
    featured: review.featured || false,
    pros: review.pros || [],
    cons: review.cons || [],
  })) || [];

  return {
    id: doc.id ? doc.id.toString() : '',
    slug: doc.slug || '',
    name: doc.companyName || doc.name || '',
    category: typeof doc.category === 'string' ? doc.category : (doc.category?.name || ''),
    description: transformLexicalToHtml(doc.description as PayloadLexicalDocument) || '',
    logo: transformMediaPath(doc.logo || ''),
    image: transformMediaPath(doc.image || ''),
    website: doc.website || '',
    founded: doc.founded,
    foundedYear: doc.foundedYear || doc.founded, // Fallback to founded for backward compatibility
    locations,
    tier: doc.tier || 'free',
    tags: doc.tags?.map((tag) => typeof tag === 'string' ? tag : (tag.name || '')) || [],
    featured: doc.featured || false,
    partner: doc.partner !== undefined ? doc.partner : false,
    services: (doc.services || []) as VendorService[],
    contactEmail: doc.contactEmail,
    contactPhone: doc.contactPhone,
    longDescription: transformLexicalToHtml(doc.longDescription as PayloadLexicalDocument),
    serviceAreas: (doc.serviceAreas || []) as ServiceArea[],
    companyValues: (doc.companyValues || []) as CompanyValue[],
    totalProjects: doc.totalProjects,
    employeeCount: doc.employeeCount,
    linkedinFollowers: doc.linkedinFollowers,
    instagramFollowers: doc.instagramFollowers,
    clientSatisfactionScore: doc.clientSatisfactionScore,
    repeatClientPercentage: doc.repeatClientPercentage,
    videoUrl: doc.videoUrl,
    videoThumbnail: doc.videoThumbnail?.url ? transformMediaPath(doc.videoThumbnail.url) : undefined,
    videoDuration: doc.videoDuration,
    videoTitle: doc.videoTitle,
    videoDescription: doc.videoDescription,
    certifications,
    awards,
    socialProof,
    videoIntroduction,
    caseStudies,
    innovationHighlights,
    teamMembers,
    yachtProjects,
    vendorReviews,
  };
}
