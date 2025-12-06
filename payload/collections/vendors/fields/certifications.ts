/**
 * Certifications array field (Tier 1+)
 */

import type { Field } from 'payload';
import { sanitizeUrlHook } from '../../../../lib/utils/url';
import { tier1UpdateAccess, tier1Condition, publicReadAccess } from '../access/tier-access';

export const certificationsField: Field = {
  name: 'certifications',
  type: 'array',
  admin: {
    description: 'Company certifications (Tier 1+ only)',
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
        description: 'Certification name',
      },
    },
    {
      name: 'issuer',
      type: 'text',
      required: true,
      maxLength: 255,
      admin: {
        description: 'Issuing organization',
      },
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      admin: {
        description: 'Year certification was obtained',
      },
    },
    {
      name: 'expiryDate',
      type: 'date',
      admin: {
        description: 'Certification expiry date',
      },
    },
    {
      name: 'certificateNumber',
      type: 'text',
      maxLength: 255,
      admin: {
        description: 'Certificate number or ID',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Certification logo',
      },
    },
    {
      name: 'verificationUrl',
      type: 'text',
      maxLength: 500,
      admin: {
        description: 'URL to verify certification',
      },
      hooks: {
        beforeChange: [sanitizeUrlHook],
      },
    },
  ],
};
