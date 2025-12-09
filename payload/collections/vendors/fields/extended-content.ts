/**
 * Extended content fields (Tier 1+)
 * - Long description
 * - Service areas
 * - Company values
 */

import type { Field } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const extendedContentFields: Field[] = [
  {
    name: 'longDescription',
    type: 'richText',
    editor: lexicalEditor(),
    admin: {
      description: 'Extended company description with rich text (Tier 1+ only)',
      condition: tier1Condition,
    },
    access: {
      read: publicReadAccess,
      update: tier1UpdateAccess,
    },
  },
];

export const serviceAreasField: Field = {
  name: 'serviceAreas',
  type: 'array',
  admin: {
    description: 'Service areas and specializations (Tier 1+ only)',
    condition: tier1Condition,
  },
  access: {
    read: publicReadAccess,
    update: tier1UpdateAccess,
  },
  fields: [
    {
      name: 'area',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Service area name',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Service area description',
      },
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Service area icon',
      },
    },
  ],
};

export const companyValuesField: Field = {
  name: 'companyValues',
  type: 'array',
  admin: {
    description: 'Company values and principles (Tier 1+ only)',
    condition: tier1Condition,
  },
  access: {
    read: publicReadAccess,
    update: tier1UpdateAccess,
  },
  fields: [
    {
      name: 'value',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Value name',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 1000,
      admin: {
        description: 'Value description',
      },
    },
  ],
};
