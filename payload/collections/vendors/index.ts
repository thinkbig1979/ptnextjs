/**
 * Vendors Collection
 *
 * Modular vendor/partner management with tier-based access control.
 * Fields are organized by feature groups for maintainability.
 */

import type { CollectionConfig } from 'payload';
import { isAdmin } from '../../access/rbac';

// Field groups
import { coreFields } from './fields/core';
import { enhancedProfileFields } from './fields/enhanced-profile';
import { certificationsField } from './fields/certifications';
import { awardsField } from './fields/awards';
import { socialProofFields } from './fields/social-proof';
import { videoFields } from './fields/video';
import { caseStudiesField } from './fields/case-studies';
import { innovationField } from './fields/innovation';
import { teamField } from './fields/team';
import { yachtProjectsField } from './fields/yacht-projects';
import { mediaGalleryField } from './fields/media-gallery';
import {
  extendedContentFields,
  serviceAreasField,
  companyValuesField,
} from './fields/extended-content';
import { locationsField } from './fields/locations';
import { tier2Fields } from './fields/tier2-fields';
import { tier3PromotionFields } from './fields/tier3-promotion';
import { metadataFields } from './fields/metadata';

// Hooks
import { afterCreateHook, afterChangeHook, afterDeleteHook } from './hooks';

const Vendors: CollectionConfig = {
  slug: 'vendors',
  admin: {
    useAsTitle: 'companyName',
    defaultColumns: ['companyName', 'tier', 'published', 'featured', 'createdAt'],
    group: 'Content',
  },
  access: {
    // Admins can CRUD all vendors
    // Vendors can only read/update their own vendor profile
    create: isAdmin,
    read: () => true, // Public can read published vendors (filtered in frontend)
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      // Vendors can only update their own profile
      return {
        user: {
          equals: user.id,
        },
      };
    },
    delete: isAdmin,
  },
  hooks: {
    afterChange: [afterCreateHook, afterChangeHook],
    afterDelete: [afterDeleteHook],
  },
  fields: [
    // Core fields (all tiers)
    ...coreFields,

    // Enhanced profile (Tier 1+)
    ...enhancedProfileFields,
    certificationsField,
    awardsField,

    // Social proof (Tier 1+)
    ...socialProofFields,

    // Media (Tier 1+)
    ...videoFields,
    caseStudiesField,
    innovationField,
    teamField,
    yachtProjectsField,
    mediaGalleryField,

    // Extended content (Tier 1+)
    ...extendedContentFields,
    serviceAreasField,
    companyValuesField,
    locationsField,

    // Tier 2+ fields
    ...tier2Fields,

    // Tier 3 promotion pack
    ...tier3PromotionFields,

    // Metadata and status
    ...metadataFields,
  ],
};

export default Vendors;
