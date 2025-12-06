/**
 * Team members array field (Tier 1+)
 */

import type { Field } from 'payload';
import { sanitizeUrlHook } from '../../../../lib/utils/url';
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const teamField: Field = {
  name: 'teamMembers',
  type: 'array',
  admin: {
    description: 'Team members (Tier 1+ only)',
    condition: tier1Condition,
  },
  access: {
    read: publicReadAccess,
    // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
    update: tier1UpdateAccess,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Team member name',
      },
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Team member role/position',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      maxLength: 2000,
      admin: {
        description: 'Team member bio',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Team member photo',
      },
    },
    {
      name: 'linkedinUrl',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'Team member LinkedIn URL',
      },
      hooks: {
        beforeChange: [sanitizeUrlHook],
      },
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        description: 'Team member email',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      admin: {
        description: 'Display order (lower numbers appear first)',
      },
    },
  ],
};
