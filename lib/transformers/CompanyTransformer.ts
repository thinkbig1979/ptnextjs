/**
 * Company Transformer
 * Transforms Payload company documents to the CompanyInfo type
 */

import type { CompanyInfo } from '../types';
import type { PayloadCompanyDocument, PayloadLexicalDocument } from './PayloadTypes';
import { transformMediaPath } from './MediaTransformer';
import { transformLexicalToHtml } from './LexicalTransformer';

/**
 * Transforms a Payload company document to the CompanyInfo type
 *
 * @param doc - Payload company document from database
 * @returns Transformed CompanyInfo object
 */
export function transformCompany(doc: PayloadCompanyDocument): CompanyInfo {
  // Transform Lexical story to HTML
  const story = transformLexicalToHtml(doc.story as PayloadLexicalDocument);

  // Transform logo media path
  const logo = transformMediaPath(doc.logo || '');

  // Transform social media (group field in Payload)
  const social_media = doc.socialMedia ? {
    id: 'social-media',
    facebook: doc.socialMedia.facebook || undefined,
    twitter: doc.socialMedia.twitter || undefined,
    linkedin: doc.socialMedia.linkedin || undefined,
    instagram: doc.socialMedia.instagram || undefined,
    youtube: doc.socialMedia.youtube || undefined,
  } : undefined;

  // Transform SEO (group field in Payload)
  const seo = doc.seo ? {
    id: 'seo',
    meta_title: doc.seo.metaTitle || undefined,
    meta_description: doc.seo.metaDescription || undefined,
    keywords: doc.seo.keywords || undefined,
    og_image: doc.seo.ogImage ? {
      id: typeof doc.seo.ogImage === 'string' ? doc.seo.ogImage : (doc.seo.ogImage.id?.toString() || ''),
      name: '',
      url: transformMediaPath(doc.seo.ogImage),
    } : undefined,
    canonical_url: undefined,
    no_index: undefined,
  } : undefined;

  return {
    id: doc.id?.toString(),
    name: doc.name,
    tagline: doc.tagline || '',
    description: doc.description || '',
    founded: doc.founded || 0,
    location: doc.location || '',
    address: doc.address || '',
    phone: doc.phone || '',
    email: doc.email || '',
    businessHours: doc.businessHours || undefined,
    story,
    mission: doc.mission || undefined,
    logo,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    publishedAt: doc.publishedAt || doc.createdAt,
    social_media,
    seo,
    logoUrl: logo, // Computed field
  };
}
