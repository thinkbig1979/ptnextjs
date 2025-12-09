/**
 * Yacht projects array field (Tier 1+)
 */

import type { Field } from 'payload';
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const yachtProjectsField: Field = {
  name: 'yachtProjects',
  type: 'array',
  admin: {
    description: 'Yacht projects and installations (Tier 1+ only)',
    condition: tier1Condition,
  },
  access: {
    read: publicReadAccess,
    update: tier1UpdateAccess,
  },
  fields: [
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
      name: 'yachtName',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Yacht name',
      },
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Vendor role in the project',
      },
    },
    {
      name: 'completionDate',
      type: 'date',
      admin: {
        description: 'Project completion date',
      },
    },
    {
      name: 'systemsInstalled',
      type: 'array',
      fields: [
        {
          name: 'system',
          type: 'text',
          maxLength: 255,
          required: true,
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Project image',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this project',
      },
    },
  ],
};
