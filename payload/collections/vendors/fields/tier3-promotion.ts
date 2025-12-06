/**
 * Tier 3 promotion pack fields
 */

import type { Field } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { tier3UpdateAccess, tier3Condition, publicReadAccess } from '../access/tier-access';

export const tier3PromotionFields: Field[] = [
  {
    name: 'promotionHeadline',
    type: 'text',
    maxLength: 255,
    admin: {
      description: 'Promotion headline (Tier 3 only)',
      condition: tier3Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier3UpdateAccess,
    },
  },
  {
    name: 'promotionSubheadline',
    type: 'text',
    maxLength: 500,
    admin: {
      description: 'Promotion subheadline (Tier 3 only)',
      condition: tier3Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier3UpdateAccess,
    },
  },
  {
    name: 'promotionBanner',
    type: 'upload',
    relationTo: 'media',
    admin: {
      description: 'Large promotional banner (Tier 3 only)',
      condition: tier3Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier3UpdateAccess,
    },
  },
  {
    name: 'promotionVideo',
    type: 'text',
    maxLength: 500,
    admin: {
      description: 'Promotional video URL (Tier 3 only)',
      condition: tier3Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier3UpdateAccess,
    },
  },
  {
    name: 'promotionContent',
    type: 'richText',
    editor: lexicalEditor(),
    admin: {
      description: 'Promotional content (Tier 3 only)',
      condition: tier3Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier3UpdateAccess,
    },
  },
  {
    name: 'promotionCTA',
    type: 'text',
    maxLength: 100,
    admin: {
      description: 'Call-to-action button text (Tier 3 only)',
      condition: tier3Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier3UpdateAccess,
    },
  },
  {
    name: 'promotionCTALink',
    type: 'text',
    maxLength: 500,
    admin: {
      description: 'Call-to-action link URL (Tier 3 only)',
      condition: tier3Condition,
    },
    access: {
      read: publicReadAccess,
      // @ts-expect-error - Payload CMS 3.x field-level access type compatibility
      update: tier3UpdateAccess,
    },
  },
];
