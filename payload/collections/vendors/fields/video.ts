/**
 * Video introduction fields (Tier 1+)
 */

import type { Field } from 'payload';
import { sanitizeUrlHook } from '../../../../lib/utils/url';
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const videoFields: Field[] = [
  {
    name: 'videoUrl',
    type: 'text',
    maxLength: 500,
    admin: {
      description: 'Video introduction URL (Tier 1+ only)',
      condition: tier1Condition,
    },
    hooks: {
      beforeChange: [sanitizeUrlHook],
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
  {
    name: 'videoThumbnail',
    type: 'upload',
    relationTo: 'media',
    admin: {
      description: 'Video thumbnail image (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
  {
    name: 'videoDuration',
    type: 'number',
    admin: {
      description: 'Video duration in seconds (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
  {
    name: 'videoTitle',
    type: 'text',
    maxLength: 255,
    admin: {
      description: 'Video title (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
  {
    name: 'videoDescription',
    type: 'textarea',
    maxLength: 1000,
    admin: {
      description: 'Video description (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier1UpdateAccess,
    },
  },
];
