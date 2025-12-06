/**
 * Innovation highlights array field (Tier 1+)
 */

import type { Field } from 'payload';
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const innovationField: Field = {
  name: 'innovationHighlights',
  type: 'array',
  admin: {
    description: 'Innovation highlights and patents (Tier 1+ only)',
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
        description: 'Innovation title',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 2000,
      admin: {
        description: 'Innovation description',
      },
    },
    {
      name: 'year',
      type: 'number',
      admin: {
        description: 'Year of innovation',
      },
    },
    {
      name: 'patentNumber',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Patent number if applicable',
      },
    },
    {
      name: 'benefits',
      type: 'array',
      fields: [
        {
          name: 'benefit',
          type: 'text',
          maxLength: 500,
          required: true,
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Innovation image',
      },
    },
  ],
};
