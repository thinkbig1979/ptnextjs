/**
 * Awards array field (Tier 1+)
 */

import type { Field } from 'payload';
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const awardsField: Field = {
  name: 'awards',
  type: 'array',
  admin: {
    description: 'Company awards and recognitions (Tier 1+ only)',
    condition: tier1Condition,
  },
  access: {
    read: publicReadAccess,
    // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
    update: tier1UpdateAccess,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Award title',
      },
    },
    {
      name: 'organization',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Awarding organization',
      },
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      admin: {
        description: 'Year award was received',
      },
    },
    {
      name: 'category',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Award category',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Award description',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Award image or certificate',
      },
    },
  ],
};
