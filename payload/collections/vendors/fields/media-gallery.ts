/**
 * Media gallery array field (Tier 1+)
 */

import type { Field } from 'payload';
import { sanitizeUrlHook } from '../../../../lib/utils/url';
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const mediaGalleryField: Field = {
  name: 'mediaGallery',
  type: 'array',
  admin: {
    description: 'Media gallery (images and videos) (Tier 1+ only)',
    condition: tier1Condition,
  },
  access: {
    read: publicReadAccess,
    // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
    update: tier1UpdateAccess,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
      ],
      defaultValue: 'image',
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Image or video file',
        condition: (data, siblingData) => siblingData?.type === 'image',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Video URL (YouTube, Vimeo, etc.)',
        condition: (data, siblingData) => siblingData?.type === 'video',
      },
      hooks: {
        beforeChange: [sanitizeUrlHook],
      },
    },
    {
      name: 'caption',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Media caption',
      },
    },
    {
      name: 'altText',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Alt text for accessibility',
      },
    },
    {
      name: 'album',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Album or category',
      },
    },
    {
      name: 'order',
      type: 'number',
      admin: {
        description: 'Display order',
      },
    },
  ],
};
