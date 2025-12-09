/**
 * Case studies array field (Tier 1+)
 */

import type { Field } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const caseStudiesField: Field = {
  name: 'caseStudies',
  type: 'array',
  admin: {
    description: 'Project case studies (Tier 1+ only)',
    condition: tier1Condition,
  },
  access: {
    read: publicReadAccess,
    update: tier1UpdateAccess,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Case study title',
      },
    },
    {
      name: 'yachtName',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Name of yacht involved',
      },
    },
    {
      name: 'yacht',
      type: 'relationship',
      relationTo: 'yachts',
      hasMany: false,
      admin: {
        description: 'Related yacht',
      },
    },
    {
      name: 'projectDate',
      type: 'date',
      admin: {
        description: 'Project completion date',
      },
    },
    {
      name: 'challenge',
      type: 'textarea',
      maxLength: 2000,
      admin: {
        description: 'Project challenge',
      },
    },
    {
      name: 'solution',
      type: 'textarea',
      maxLength: 2000,
      admin: {
        description: 'Solution provided',
      },
    },
    {
      name: 'results',
      type: 'textarea',
      maxLength: 2000,
      admin: {
        description: 'Project results',
      },
    },
    {
      name: 'testimonyQuote',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Client testimony quote',
      },
    },
    {
      name: 'testimonyAuthor',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Testimony author name',
      },
    },
    {
      name: 'testimonyRole',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Testimony author role',
      },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this case study',
      },
    },
  ],
};
